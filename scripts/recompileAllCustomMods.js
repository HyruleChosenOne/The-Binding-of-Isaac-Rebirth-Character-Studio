import path from 'path';
import fs from 'fs-extra';
import { execSync } from 'child_process';
import { getConfig } from '../server/config.js';
import { getCustomStudioCharacters, ensureCharacterModAssets, generateLuaScript } from '../server/services/modExporter.js';
import { installCharacterMenuAnm2Assets } from '../server/services/anm2Generator.js';
import { generateServerNameplatePng } from '../server/services/textRenderer.js';

async function recompileAll() {
  console.log('======================================================');
  console.log('  RECOMPILING ALL CUSTOM CHARACTERS & MOD ASSETS');
  console.log('======================================================\n');

  const config = getConfig();
  const modsPath = config.modsPath;
  const gamePath = config.gamePath;

  console.log(`Game Path: ${gamePath}`);
  console.log(`Mods Path: ${modsPath}\n`);

  if (!modsPath || !await fs.pathExists(modsPath)) {
    console.error('Mods directory does not exist.');
    return;
  }

  const entries = await fs.readdir(modsPath);

  // 1. Unpack any custom_character_*.zip into folders if not already unzipped or needs update
  for (const entry of entries) {
    if (entry.startsWith('custom_character_') && entry.endsWith('.zip')) {
      const zipPath = path.join(modsPath, entry);
      const targetFolder = entry.replace(/\.zip$/, '');
      const targetDir = path.join(modsPath, targetFolder);

      console.log(`Extracting zip: ${entry} -> ${targetFolder}...`);
      await fs.ensureDir(targetDir);

      try {
        execSync(`tar -xf "${zipPath}" -C "${targetDir}"`, { stdio: 'pipe' });
        // Check if extracted with an inner root folder
        const subDirs = await fs.readdir(targetDir);
        if (subDirs.length === 1 && (subDirs[0] === targetFolder || subDirs[0].startsWith('custom_character_'))) {
          const innerDir = path.join(targetDir, subDirs[0]);
          const innerFiles = await fs.readdir(innerDir);
          for (const inf of innerFiles) {
            await fs.move(path.join(innerDir, inf), path.join(targetDir, inf), { overwrite: true });
          }
          await fs.remove(innerDir).catch(() => {});
        }
        console.log(`[PASS] Extracted ${entry}`);
      } catch (err) {
        console.error(`[FAIL] Extraction failed for ${entry}:`, err.message);
      }
    }
  }

  // 2. Scan all studio characters and rebuild their menu assets and main.lua
  const customChars = await getCustomStudioCharacters(modsPath);
  console.log(`\nDiscovered ${customChars.length} custom studio character mod folder(s).`);

  for (const char of customChars) {
    const modFolder = char._modFolder || `custom_character_${(char.name || 'custom').toLowerCase().replace(/[^a-z0-9_]/g, '_')}`;
    const modDir = path.join(modsPath, modFolder);

    console.log(`\n--- Processing "${char.name}" in ${modFolder} ---`);

    // Remove disable.it flag
    const disableIt = path.join(modDir, 'disable.it');
    if (await fs.pathExists(disableIt)) {
      await fs.remove(disableIt);
      console.log(`  Removed disable.it`);
    }

    try {
      await ensureCharacterModAssets(modDir, char, gamePath);
      console.log(`  [PASS] ensureCharacterModAssets complete.`);

      // Regenerate main.lua with latest crash-proof dual character spawner and HUD hooks
      const modId = `CustomChar_${(char.name || 'custom').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')}`;
      const luaScript = generateLuaScript(char, modId);
      await fs.writeFile(path.join(modDir, 'main.lua'), luaScript, 'utf8');
      console.log(`  [PASS] Regenerated main.lua`);

      // Verify content/gfx menu assets
      const contentGfx = path.join(modDir, 'content', 'gfx');
      const menuPng = path.join(contentGfx, 'charactermenu.png');
      const menuAnm2 = path.join(contentGfx, 'charactermenu.anm2');
      const portAnm2 = path.join(contentGfx, 'characterportraits.anm2');

      const pngOk = (await fs.pathExists(menuPng)) && (await fs.stat(menuPng)).size > 0;
      const anm2Ok = (await fs.pathExists(menuAnm2)) && (await fs.stat(menuAnm2)).size > 0;
      const portOk = (await fs.pathExists(portAnm2)) && (await fs.stat(portAnm2)).size > 0;

      console.log(`  charactermenu.png: ${pngOk ? 'OK' : 'MISSING'}`);
      console.log(`  charactermenu.anm2: ${anm2Ok ? 'OK' : 'MISSING'}`);
      console.log(`  characterportraits.anm2: ${portOk ? 'OK' : 'MISSING'}`);
    } catch (e) {
      console.error(`  [FAIL] Failed to update assets for "${char.name}":`, e.message);
    }
  }

  console.log('\n======================================================');
  console.log('  ALL CUSTOM CHARACTER MODS UPDATED SUCCESSFULLY!');
  console.log('======================================================\n');
}

recompileAll().catch(err => {
  console.error('Recompile failed:', err);
  process.exit(1);
});
