import express from 'express';
import { getConfig, updateConfig, resetConfig, APP_ROOT, DATA_DIR, ASSETS_DIR } from '../config.js';
import { scanGameAndMods, scanDeepPaths } from '../services/gameScanner.js';
import { loadItemsFromGame, loadTrinketsFromGame, loadPocketItems, scanModdedItems, ITEM_POOLS, CURATED_TRINKETS, CURATED_CONSUMABLES } from '../services/itemDatabase.js';
import { saveCharacterEdit, buildPlayersXml } from '../services/characterManager.js';
import { createCustomMod, createModZipStream, getCustomStudioCharacters, deleteCustomCharacter, clearAllStudioMods } from '../services/modExporter.js';
import { startExtraction, getExtractionStatus } from '../services/extractorService.js';
import { importGameAssets, hasImportedAssets } from '../services/assetImporter.js';
import { refreshAssetIndex } from '../services/assetResolver.js';
import fs from 'fs-extra';
import path from 'path';

const router = express.Router();

let tboiSynergyCache = null;

// Helper to check whether game assets are available (always true with pre-bundled assets)
async function checkAssetsImported() {
  try {
    const charDir = path.join(ASSETS_DIR, 'characters');
    if (await fs.pathExists(charDir)) {
      const files = await fs.readdir(charDir);
      return files.filter(f => f.toLowerCase().endsWith('.png')).length > 0;
    }
    return false;
  } catch {
    return false;
  }
}

// TBOI's original-game matrix is authored as a small jQuery decision table.  Parse
// it server-side so the desktop client gets the complete catalog without CORS issues.
router.get('/synergies/tboi', async (req, res) => {
  try {
    if (tboiSynergyCache) return res.json(tboiSynergyCache);

    // Try reading local bundled fallback first for instant offline response
    const fallbackPath = path.join(DATA_DIR, 'synergies_tboi_fallback.json');
    if (fs.existsSync(fallbackPath)) {
      tboiSynergyCache = fs.readJsonSync(fallbackPath);
      return res.json(tboiSynergyCache);
    }

    const [pageResponse, scriptResponse] = await Promise.all([
      fetch('https://www.tboi.com/synergies'),
      fetch('https://www.tboi.com/old/js/synergy.js')
    ]);
    if (!pageResponse.ok || !scriptResponse.ok) throw new Error('TBOI catalog could not be reached');
    const page = await pageResponse.text();
    const script = await scriptResponse.text();
    const options = {};
    for (const match of page.matchAll(/<option value="([^"]+)"[^>]*title="[^"]*?(\d+)_([^"]+)"[^>]*>([^<]+)<\/option>/g)) {
      options[match[1]] = { id: Number(match[2]), name: match[4].trim() };
    }
    options.guppy = { id: 0, name: 'Guppy' };
    const entries = [];
    const basePattern = /\$\("#combo1"\)\.val\(\)\s*==\s*"([^"]+)"([\s\S]*?)(?=else if\s*\(\$\("#combo1"\)|\n\s*\}\s*$)/g;
    for (const baseMatch of script.matchAll(basePattern)) {
      const [, baseKey, block] = baseMatch;
      for (const match of block.matchAll(/if\s*\(\$\("#combo2"\)\.val\(\)\s*==\s*"([^"]+)"\)\s*\{?\s*text\s*=\s*"([^"]*)"/g)) {
        const [, partnerKey, description] = match;
        const base = options[baseKey], partner = options[partnerKey];
        if (base && partner) entries.push({ id: `${baseKey}-${partnerKey}`, base, partner, description: description.replace(/\\"/g, '"') });
      }
    }
    tboiSynergyCache = { source: 'tboi-original', entries };
    res.json(tboiSynergyCache);
  } catch (error) {
    const fallbackPath = path.join(DATA_DIR, 'synergies_tboi_fallback.json');
    if (fs.existsSync(fallbackPath)) {
      tboiSynergyCache = fs.readJsonSync(fallbackPath);
      return res.json(tboiSynergyCache);
    }
    res.status(502).json({ error: error.message });
  }
});

// 1. Get Status and Paths
router.get('/status', async (req, res) => {
  const config = getConfig();
  const scanData = await scanGameAndMods(config.gamePath, config.modsPath, config.workshopPath);
  const customChars = await getCustomStudioCharacters(config.modsPath);
  const assetsImported = await checkAssetsImported();
  const isConfigured = Boolean(config.gamePath && (await fs.pathExists(config.gamePath)));

  res.json({
    config,
    gameDetected: scanData.gameDetected,
    modsDetected: scanData.modsDetected,
    modCount: scanData.mods.length,
    characterCount: customChars.length,
    availableSpriteCount: scanData.availableSprites.length,
    extractStatus: getExtractionStatus(),
    assetsImported,
    isConfigured
  });
});

// 1b. Deep Scan Candidate Paths
router.get('/paths/scan-deep', async (req, res) => {
  try {
    const data = await scanDeepPaths();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1c. Get Current Configuration (Instant, synchronous memory config)
router.get(['/config', '/paths/config', '/settings'], (req, res) => {
  res.json({ success: true, config: getConfig() });
});

// 2. Update Configuration
router.post('/config', async (req, res) => {
  const { gamePath, modsPath, workshopPath, targetDLC } = req.body;
  const updated = updateConfig({
    ...(gamePath !== undefined && { gamePath }),
    ...(modsPath !== undefined && { modsPath }),
    ...(workshopPath !== undefined && { workshopPath }),
    ...(targetDLC !== undefined && { targetDLC })
  });

  await refreshAssetIndex().catch(() => {});
  res.json({ success: true, config: updated });
});

router.post('/paths/save', async (req, res) => {
  const { gamePath, modsPath, workshopPath } = req.body;
  const updated = updateConfig({
    ...(gamePath !== undefined && { gamePath }),
    ...(modsPath !== undefined && { modsPath }),
    ...(workshopPath !== undefined && { workshopPath })
  });

  // Refresh in-memory index for mod directories without triggering extraction
  await refreshAssetIndex().catch(() => {});
  const deepReport = await scanDeepPaths();

  res.json({
    success: true,
    config: updated,
    report: deepReport,
    extractionStarted: false
  });
});

// Native folder picker dialog
router.post('/paths/browse', async (req, res) => {
  try {
    const { title, initialPath } = req.body || {};
    const safeTitle = (title || 'Select Folder').replace(/'/g, "''");
    const safePath = (initialPath || '').replace(/'/g, "''");

    const psScript = `
Add-Type -AssemblyName System.Windows.Forms
$f = New-Object System.Windows.Forms.FolderBrowserDialog
$f.Description = '${safeTitle}'
${safePath ? `$f.SelectedPath = '${safePath}';` : ''}
$f.ShowNewFolderButton = $true
if ($f.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
    Write-Output $f.SelectedPath
}
`.replace(/\r?\n/g, ' ');

    const { exec } = await import('child_process');
    exec(`powershell -NoProfile -NonInteractive -Command "${psScript}"`, (err, stdout) => {
      if (err) {
        return res.json({ success: false, path: null, error: err.message });
      }
      const selected = stdout ? stdout.trim() : '';
      res.json({ success: Boolean(selected), path: selected || null });
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Health & Server Lifecycle Management
router.all(['/heartbeat', '/server/heartbeat', '/health'], (req, res) => {
  res.json({ success: true, status: 'ok', time: new Date().toISOString() });
});

router.all(['/server/restart'], async (req, res) => {
  try {
    res.json({ success: true, message: 'Server is restarting...' });
    const { spawn } = await import('child_process');
    const nodePath = process.execPath;
    const targetScript = path.join(APP_ROOT, 'server', 'index.js');

    setTimeout(() => {
      const child = spawn(nodePath, [targetScript], {
        detached: true,
        stdio: 'ignore',
        cwd: APP_ROOT
      });
      child.unref();
      setTimeout(() => {
        process.exit(0);
      }, 300);
    }, 200);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Open Folder in OS Explorer (Debounced to open exactly once)
let lastFolderOpenTime = 0;
let lastOpenedPath = '';
router.all(['/paths/open-folder', '/open-folder', '/mods/open-folder', '/paths/open'], async (req, res) => {
  try {
    const params = { ...(req.query || {}), ...(req.body || {}) };
    let folderPath = params.folderPath || params.path;
    const modFolder = params.modFolder || params.folder || params.name;

    const config = getConfig();
    let target = folderPath;
    if (!target && modFolder) {
      if (path.isAbsolute(modFolder)) {
        target = modFolder;
      } else if (config.modsPath) {
        target = path.join(config.modsPath, modFolder);
      }
    }
    if (!target && config.modsPath) {
      target = config.modsPath;
    }
    if (!target) {
      return res.status(400).json({ success: false, error: 'No Isaac mods directory configured. Set your paths in Settings.' });
    }

    const cleanTarget = path.resolve(target);
    await fs.ensureDir(cleanTarget);

    const now = Date.now();
    // Debounce duplicate requests within 1200ms
    if (now - lastFolderOpenTime < 1200 && lastOpenedPath === cleanTarget) {
      return res.json({ success: true, opened: cleanTarget, debounced: true });
    }
    lastFolderOpenTime = now;
    lastOpenedPath = cleanTarget;

    const { spawn } = await import('child_process');
    if (process.platform === 'win32') {
      const winPath = cleanTarget.replace(/\//g, '\\');
      const child = spawn('explorer.exe', [winPath], { detached: true, stdio: 'ignore' });
      child.unref();
    } else if (process.platform === 'darwin') {
      const child = spawn('open', [cleanTarget], { detached: true, stdio: 'ignore' });
      child.unref();
    } else {
      const child = spawn('xdg-open', [cleanTarget], { detached: true, stdio: 'ignore' });
      child.unref();
    }
    return res.json({ success: true, opened: cleanTarget });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Explicit endpoint to trigger asset re-import
router.post('/paths/import-assets', async (req, res) => {
  const config = getConfig();
  const importResult = await importGameAssets(config.gamePath, config.modsPath);
  res.json({ success: true, importResult });
});

// Wipe Tool Files, Delete Custom Mods & Reset to Fresh Onboarding Screen
router.post('/settings/reset', async (req, res) => {
  try {
    const config = getConfig();

    // 1. Cleanly delete all studio custom character mods across active and default mod directories
    const deletedMods = await clearAllStudioMods([
      config.modsPath,
      config.gamePath ? path.join(config.gamePath, 'mods') : null
    ]);

    // 2. Wipe character overrides to clean old local character states
    const overridesFile = path.join(DATA_DIR, 'character_overrides.json');
    if (await fs.pathExists(overridesFile)) {
      await fs.remove(overridesFile).catch(() => {});
    }

    // 3. Wipe LocalAppData cache if present
    if (process.env.LOCALAPPDATA) {
      const appDataCache = path.join(process.env.LOCALAPPDATA, 'IsaacCharacterStudio');
      if (await fs.pathExists(appDataCache)) {
        await fs.remove(appDataCache).catch(() => {});
      }
    }

    // 4. Reset synergy in-memory cache
    tboiSynergyCache = null;

    // 5. Reset configuration to clean default state
    resetConfig();

    // 6. Refresh asset router index to clear in-memory caches
    await refreshAssetIndex().catch(() => {});

    res.json({
      success: true,
      message: 'All tool custom character mods and data wiped successfully. Bundled vanilla asset engine active.',
      deletedModsCount: deletedMods.length,
      deletedMods
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Get Custom Studio Characters (Only characters created with this mod studio)
router.get('/characters', async (req, res) => {
  const config = getConfig();
  const chars = await getCustomStudioCharacters(config.modsPath);
  res.json({
    characters: chars,
    mods: []
  });
});

// 4. Get Items Database (with item pools)
router.get('/items', async (req, res) => {
  const config = getConfig();
  const items = await loadItemsFromGame(config.gamePath);
  res.json(items);
});

// 4b. Get Item Pools Metadata
router.get('/pools', (req, res) => {
  res.json(ITEM_POOLS);
});

// 4c. Get Scanned Modded & Workshop Items
router.all(['/mods/items', '/modded-items', '/api/modded-items', '/api/mods/items'], async (req, res) => {
  try {
    const config = getConfig();
    const result = await scanModdedItems(config.modsPath, config.workshopPath);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4d. Trigger Fresh Modded Items Scan
router.all(['/mods/scan-items', '/mods/scan', '/api/mods/scan-items'], async (req, res) => {
  try {
    const config = getConfig();
    const result = await scanModdedItems(config.modsPath, config.workshopPath);
    await refreshAssetIndex().catch(() => {});
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Get Trinkets Database
router.get('/trinkets', async (req, res) => {
  const config = getConfig();
  const trinkets = await loadTrinketsFromGame(config.gamePath);
  res.json(trinkets);
});

// 6. Get Consumables & Pocket Items Database (Cards, Runes, Pills, Pocket Actives)
router.get('/consumables', (req, res) => {
  res.json(CURATED_CONSUMABLES);
});

router.get(['/pocketitems', '/pocket-items', '/api/pocketitems', '/api/pocket-items'], async (req, res) => {
  const config = getConfig();
  const pocketItems = await loadPocketItems(config.gamePath);
  res.json(pocketItems);
});

// 7. Get Available Sprites & Portraits from game and mods
router.get('/sprites', async (req, res) => {
  const config = getConfig();
  const scanData = await scanGameAndMods(config.gamePath, config.modsPath, config.workshopPath);
  res.json({
    sprites: scanData.availableSprites,
    portraits: scanData.availablePortraits
  });
});

// 8. Generate Live XML Preview
router.post('/characters/preview-xml', (req, res) => {
  const { character, targetDLC } = req.body;
  const config = getConfig();
  const dlc = targetDLC || config.targetDLC || 'repentanceplus';
  const xml = buildPlayersXml([character], dlc);
  res.json({ xml });
});

// 9. Save & Compile Custom Character Mod
router.all(['/custom/save', '/custom/create', '/mods/create', '/characters/save'], async (req, res) => {
  try {
    const rawBody = req.body || {};
    const character = rawBody.character || rawBody;
    const cleanName = (character.name || 'custom_character').trim();
    const sanitized = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const folderName = character.modFolder || rawBody.folderName || `custom_character_${sanitized}`;

    const options = {
      name: character.modTitle || rawBody.name || `Custom Character - ${cleanName}`,
      description: character.modDescription || rawBody.description || '',
      version: character.modVersion || rawBody.version || '1.0.0',
      folderName,
      targetDLC: character.targetDLC || rawBody.targetDLC || 'repentanceplus',
      ...(rawBody.options || {})
    };

    const config = getConfig();
    const result = await createCustomMod(character, options, config.gamePath, config.modsPath);
    res.json(result);
  } catch (err) {
    console.error('Save character error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9b. Toggle Character Enabled/Disabled
router.post('/characters/toggle', async (req, res) => {
  try {
    const { character, enabled, targetDLC } = req.body;
    const config = getConfig();
    const dlc = targetDLC || config.targetDLC || 'repentanceplus';
    const updatedChar = {
      ...character,
      enabled: !!enabled,
      hidden: !enabled
    };
    const result = await saveCharacterEdit(updatedChar, dlc, config.modsPath);
    res.json({ ...result, enabled: !!enabled, hidden: !enabled });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. Custom Characters Endpoints (Studio custom mods)
router.get('/custom/characters', async (req, res) => {
  try {
    const config = getConfig();
    const chars = await getCustomStudioCharacters(config.modsPath);
    res.json({ success: true, characters: chars });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/custom/delete', async (req, res) => {
  try {
    const { name, folderName, targetDLC } = req.body;
    const config = getConfig();
    const result = await deleteCustomCharacter(name, folderName, config.modsPath, targetDLC || config.targetDLC || 'repentanceplus');
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12. Download Mod as ZIP
router.all(['/mods/download-zip', '/custom/download-zip', '/mods/export-zip'], async (req, res) => {
  try {
    const body = { ...(req.query || {}), ...(req.body || {}) };
    const character = body.character || body;
    const options = body.options || {};
    const config = getConfig();
    const cleanName = (character.name || 'custom_character').toLowerCase().replace(/[^a-z0-9]/g, '_');
    const zipName = `${cleanName}_mod.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);

    const zipStream = await createModZipStream(character, options, config.gamePath);
    zipStream.pipe(res);
  } catch (err) {
    console.error('Error creating mod ZIP:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
});

// 13. Extraction Endpoints
router.post('/extract/start', (req, res) => {
  const config = getConfig();
  const result = startExtraction(config.gamePath);
  res.json(result);
});

router.get('/extract/status', (req, res) => {
  const status = getExtractionStatus();
  res.json(status);
});

export default router;
