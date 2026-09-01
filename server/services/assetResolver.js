import path from 'path';
import fs from 'fs-extra';
import { getConfig, APP_ROOT, DATA_DIR, ASSETS_DIR } from '../config.js';
import { isVanillaCharacterFile, isVanillaPortraitFile } from './vanillaCharacters.js';

// In-Memory Fast Lookup Indices — strictly separated by type
let vanillaCollectiblesById = new Map();
let vanillaTrinketsById = new Map();
let vanillaPocketById = new Map();
let vanillaCollectibleFiles = new Map();
let vanillaTrinketFiles = new Map();
let vanillaPocketFiles = new Map();

let modCollectiblesByName = new Map();
let modTrinketsByName = new Map();
let modSpritesIndex = new Map();
let modPortraitsIndex = new Map();
let modNamesIndex = new Map();

let spritesIndex = new Map();
let portraitsIndex = new Map();
let namesIndex = new Map();

// Transparent fallback SVG (32x32)
export const FALLBACK_ITEM_SVG = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <rect width="32" height="32" rx="4" fill="#18181b" stroke="#3f3f46" stroke-width="1"/>
    <circle cx="16" cy="16" r="6" fill="#71717a" opacity="0.4"/>
  </svg>`,
  'utf8'
);

export const FALLBACK_PORTRAIT_SVG = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="8" fill="#18181b" stroke="#3f3f46" stroke-width="1.5"/>
    <circle cx="32" cy="25" r="12" fill="#a1a1aa" opacity="0.6"/>
    <path d="M16 54 C16 42 22 38 32 38 C42 38 48 42 48 54 Z" fill="#71717a" opacity="0.6"/>
  </svg>`,
  'utf8'
);

export const VANILLA_SPRITE_ALIASES = {
  'character_001_isaac_b.png': 'character_001b_isaac.png',
  'character_002_magdalene_b.png': 'character_002b_magdalene.png',
  'character_003_cain_b.png': 'character_003b_cain.png',
  'character_004_judas_b.png': 'character_004b_judas.png',
  'character_005_bluebaby_b.png': 'character_005b_bluebaby.png',
  'character_006_bluebaby_b.png': 'character_005b_bluebaby.png',
  'character_005_eve_b.png': 'character_006b_eve.png',
  'character_006_eve_b.png': 'character_006b_eve.png',
  'character_007_samson_b.png': 'character_007b_samson.png',
  'character_008_azazel_b.png': 'character_008b_azazel.png',
  'character_009_lazarus_b.png': 'character_009b_lazarus.png',
  'character_009_eden_b.png': 'character_009_eden.png',
  'character_012_thelost_b.png': 'character_012b_thelost.png',
  'character_014_lilith_b.png': 'character_014b_lilith.png',
  'character_015_keeper_b.png': 'character_015b_keeper.png',
  'character_016_apollyon_b.png': 'character_016b_apollyon.png',
  'character_017_theforgotten_b.png': 'character_016b_theforgotten.png',
  'character_018_bethany.png': 'character_001x_bethany.png',
  'character_018_bethany_b.png': 'character_018b_bethany.png',
  'character_018b_bethany.png': 'character_018b_bethany.png',
  'character_019_jacob.png': 'character_002x_jacob.png',
  'character_019_jacob_b.png': 'character_019b_jacob.png',
  'character_019b_jacob.png': 'character_019b_jacob.png',
  'character_001x_bethany_b.png': 'character_018b_bethany.png',
  'character_002x_jacob_b.png': 'character_019b_jacob.png',
  'character_link.png': 'character_001_isaac.png',
  'character_donkey_kong.png': 'character_007_samson.png',
  'character_samus.png': 'character_002_magdalene.png',
  'character_sakura.png': 'character_001x_bethany.png',
  'character_chainsmoker.png': 'character_005_eve.png'
};

export const VANILLA_PORTRAIT_ALIASES = {
  'playerportrait_01_isaac.png': 'playerportrait_isaac.png',
  'playerportrait_02_magdalene.png': 'playerportrait_magdalene.png',
  'playerportrait_03_cain.png': 'playerportrait_cain.png',
  'playerportrait_04_judas.png': 'playerportrait_judas.png',
  'playerportrait_05_eve.png': 'playerportrait_eve.png',
  'playerportrait_06_bluebaby.png': 'playerportrait_bluebaby.png',
  'playerportrait_07_samson.png': 'playerportrait_samson.png',
  'playerportrait_08_azazel.png': 'playerportrait_azazel.png',
  'playerportrait_09_lazarus.png': 'playerportrait_lazarus.png',
  'playerportrait_09_eden.png': 'playerportrait_eden.png',
  'playerportrait_12_thelost.png': 'playerportrait_thelost.png',
  'playerportrait_14_lilith.png': 'playerportrait_lilith.png',
  'playerportrait_15_keeper.png': 'playerportrait_keeper.png',
  'playerportrait_16_apollyon.png': 'playerportrait_apollyon.png',
  'playerportrait_17_theforgotten.png': 'playerportrait_theforgotten.png',
  'playerportrait_18_bethany.png': 'playerportrait_bethany.png',
  'playerportrait_19_jacob.png': 'playerportrait_jacob.png',
  'playerportrait_01_isaac_b.png': 'playerportrait_isaac_b.png',
  'playerportrait_02_magdalene_b.png': 'playerportrait_magdalene_b.png',
  'playerportrait_03_cain_b.png': 'playerportrait_cain_b.png',
  'playerportrait_04_judas_b.png': 'playerportrait_judas_b.png',
  'playerportrait_05_eve_b.png': 'playerportrait_eve_b.png',
  'playerportrait_06_bluebaby_b.png': 'playerportrait_bluebaby_b.png',
  'playerportrait_07_samson_b.png': 'playerportrait_samson_b.png',
  'playerportrait_08_azazel_b.png': 'playerportrait_azazel_b.png',
  'playerportrait_09_lazarus_b.png': 'playerportrait_lazarus_b.png',
  'playerportrait_09_eden_b.png': 'playerportrait_eden_b.png',
  'playerportrait_12_thelost_b.png': 'playerportrait_thelost_b.png',
  'playerportrait_14_lilith_b.png': 'playerportrait_lilith_b.png',
  'playerportrait_15_keeper_b.png': 'playerportrait_keeper_b.png',
  'playerportrait_16_apollyon_b.png': 'playerportrait_apollyon_b.png',
  'playerportrait_17_theforgotten_b.png': 'playerportrait_theforgotten_b.png',
  'playerportrait_18_bethany_b.png': 'playerportrait_bethany_b.png',
  'playerportrait_19_jacob_b.png': 'playerportrait_jacob_b.png',
  'playerportrait_link.png': 'playerportrait_isaac.png',
  'playerportrait_donkey_kong.png': 'playerportrait_samson.png',
  'playerportrait_samus.png': 'playerportrait_magdalene.png'
};

function getEffectiveConfig() {
  const cfg = getConfig();
  return {
    gamePath: cfg.gamePath || '',
    modsPath: cfg.modsPath || '',
    workshopPath: cfg.workshopPath || '',
    useBundledVanillaAssets: cfg.useBundledVanillaAssets !== false
  };
}

/**
 * Helper to index vanilla collectibles
 */
async function indexVanillaCollectibles(dirPath, targetMap, fileMap) {
  if (!dirPath || !(await fs.pathExists(dirPath))) return;
  try {
    const files = await fs.readdir(dirPath);
    for (const file of files) {
      if (!file.toLowerCase().endsWith('.png')) continue;
      const lower = file.toLowerCase();
      const fullPath = path.join(dirPath, file);

      fileMap.set(lower, fullPath);

      const match = lower.match(/^collectibles_(\d+)/i);
      if (match) {
        const numId = parseInt(match[1], 10);
        if (!isNaN(numId) && numId >= 1 && numId <= 9999) {
          targetMap.set(String(numId), fullPath);
          targetMap.set(String(numId).padStart(3, '0'), fullPath);
          targetMap.set(`collectibles_${String(numId).padStart(3, '0')}.png`, fullPath);
          targetMap.set(`collectibles_${numId}.png`, fullPath);
          targetMap.set(lower, fullPath);
        }
      }
    }
  } catch (e) {}
}

/**
 * Helper to index vanilla trinkets
 */
async function indexVanillaTrinkets(dirPath, targetMap, fileMap) {
  if (!dirPath || !(await fs.pathExists(dirPath))) return;
  try {
    const files = await fs.readdir(dirPath);
    for (const file of files) {
      if (!file.toLowerCase().endsWith('.png')) continue;
      const lower = file.toLowerCase();
      const fullPath = path.join(dirPath, file);

      fileMap.set(lower, fullPath);

      const match = lower.match(/^(?:trinket|trinkets)_(\d+)/i);
      if (match) {
        const numId = parseInt(match[1], 10);
        if (!isNaN(numId) && numId >= 1 && numId <= 9999) {
          targetMap.set(String(numId), fullPath);
          targetMap.set(String(numId).padStart(3, '0'), fullPath);
          targetMap.set(`trinket_${String(numId).padStart(3, '0')}.png`, fullPath);
          targetMap.set(`trinkets_${String(numId).padStart(3, '0')}.png`, fullPath);
          targetMap.set(`trinket_${numId}.png`, fullPath);
          targetMap.set(lower, fullPath);
        }
      }
    }
  } catch (e) {}
}

/**
 * Helper to index vanilla pocket/consumable items
 */
async function indexVanillaPocket(dirPath, targetMap, fileMap) {
  if (!dirPath || !(await fs.pathExists(dirPath))) return;
  try {
    const files = await fs.readdir(dirPath);
    for (const file of files) {
      if (!file.toLowerCase().endsWith('.png')) continue;
      const lower = file.toLowerCase();
      const fullPath = path.join(dirPath, file);
      fileMap.set(lower, fullPath);

      const match = lower.match(/^(?:card|rune|soul|pill)_(\d+)/i);
      if (match) {
        const numId = parseInt(match[1], 10);
        if (!isNaN(numId)) {
          targetMap.set(String(numId), fullPath);
          targetMap.set(String(numId).padStart(3, '0'), fullPath);
          targetMap.set(lower, fullPath);
        }
      }
    }
  } catch (e) {}
}

/**
 * Helper to index generic directory with optional filter
 */
async function indexGenericDir(dirPath, targetMap, filterFn = null) {
  if (!dirPath || !(await fs.pathExists(dirPath))) return;
  try {
    const files = await fs.readdir(dirPath);
    for (const file of files) {
      if (!file.toLowerCase().endsWith('.png')) continue;
      if (filterFn && !filterFn(file)) continue;
      const lower = file.toLowerCase();
      const fullPath = path.join(dirPath, file);
      targetMap.set(lower, fullPath);
    }
  } catch (e) {}
}

/**
 * Helper to index mod folders recursively
 */
async function indexModFolderRecursively(folderName, fullDir, targetCollectibles, targetTrinkets) {
  if (!fullDir || !(await fs.pathExists(fullDir))) return;

  let metaModName = '';
  const metaPath = path.join(fullDir, 'metadata.xml');
  if (await fs.pathExists(metaPath)) {
    try {
      const metaRaw = await fs.readFile(metaPath, 'utf8');
      const match = metaRaw.match(/<name>(.*?)<\/name>/i);
      if (match && match[1]) metaModName = match[1].trim().toLowerCase();
    } catch (e) {}
  }

  const folderLower = folderName.toLowerCase();
  const cleanModName = metaModName ? metaModName.replace(/[^a-z0-9]/g, '') : '';

  async function walk(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
          await walk(fullPath);
        } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
          const fileName = entry.name.toLowerCase();
          const relPath = path.relative(fullDir, fullPath).replace(/\\/g, '/').toLowerCase();
          const cleanName = fileName.replace(/\s+/g, '');

          // Mod character base sprites are strictly excluded from mod item index
          const isCharacter = fileName.startsWith('character_') || fileName.startsWith('player_') || relPath.includes('/characters/');
          if (isCharacter) continue;

          const isTrinket = fileName.includes('trinket') || relPath.includes('trinket');
          const isCollectible = (fileName.startsWith('collectibles_') || fileName.startsWith('collectible_') || relPath.includes('collectibles') || relPath.includes('/items/') || relPath.includes('/content/')) || (!isTrinket && !isCharacter);

          const modKeys = [
            `${folderLower}:${fileName}`,
            `${folderLower}:${cleanName}`,
            `${folderLower}:${relPath}`,
            ...(metaModName ? [
              `${metaModName}:${fileName}`,
              `${metaModName}:${cleanName}`,
              `${metaModName}:${relPath}`
            ] : []),
            ...(cleanModName ? [
              `${cleanModName}:${fileName}`,
              `${cleanModName}:${cleanName}`,
              `${cleanModName}:${relPath}`
            ] : [])
          ];

          for (const k of modKeys) {
            if (isTrinket) {
              targetTrinkets.set(k, fullPath);
            } else if (isCollectible) {
              targetCollectibles.set(k, fullPath);
            }
          }

          if (isTrinket) {
            targetTrinkets.set(fileName, fullPath);
            targetTrinkets.set(cleanName, fullPath);
          } else if (isCollectible) {
            targetCollectibles.set(fileName, fullPath);
            targetCollectibles.set(cleanName, fullPath);
          }
        }
      }
    } catch (e) {}
  }

  await walk(fullDir);
}

/**
 * Rebuilds in-memory fast asset index with strict priority:
 * 1. Bundled assets first
 * 2. Active mod & workshop items
 */
export async function refreshAssetIndex() {
  const { modsPath, workshopPath } = getEffectiveConfig();

  const newVanillaCollectibles = new Map();
  const newVanillaTrinkets = new Map();
  const newVanillaPocket = new Map();
  const newCollectibleFiles = new Map();
  const newTrinketFiles = new Map();
  const newPocketFiles = new Map();

  const newModCollectibles = new Map();
  const newModTrinkets = new Map();
  const newModSprites = new Map();
  const newModPortraits = new Map();
  const newModNames = new Map();

  const newSprites = new Map();
  const newPortraits = new Map();
  const newNames = new Map();

  // 1. Index Pre-Bundled Assets (Always available, reliable, high-speed)
  await indexVanillaCollectibles(path.join(ASSETS_DIR, 'items', 'collectibles'), newVanillaCollectibles, newCollectibleFiles);
  await indexVanillaTrinkets(path.join(ASSETS_DIR, 'items', 'trinkets'), newVanillaTrinkets, newTrinketFiles);
  await indexVanillaPocket(path.join(ASSETS_DIR, 'items', 'pocket'), newVanillaPocket, newPocketFiles);
  await indexVanillaPocket(path.join(DATA_DIR, 'pocket'), newVanillaPocket, newPocketFiles);
  await indexGenericDir(path.join(ASSETS_DIR, 'characters'), newSprites, isVanillaCharacterFile);
  await indexGenericDir(path.join(ASSETS_DIR, 'ui'), newPortraits, isVanillaPortraitFile);
  await indexGenericDir(path.join(ASSETS_DIR, 'ui'), newNames);

  // 2. Index Dynamic Mod & Workshop Directories (For custom mods only)
  const modFolders = [];
  if (modsPath && (await fs.pathExists(modsPath))) {
    try {
      const mf = await fs.readdir(modsPath);
      mf.forEach(f => modFolders.push({ folderName: f, fullDir: path.join(modsPath, f) }));
    } catch (e) {}
  }
  if (workshopPath && (await fs.pathExists(workshopPath))) {
    try {
      const wf = await fs.readdir(workshopPath);
      wf.forEach(f => modFolders.push({ folderName: f, fullDir: path.join(workshopPath, f) }));
    } catch (e) {}
  }

  for (const { folderName, fullDir } of modFolders) {
    await indexModFolderRecursively(folderName, fullDir, newModCollectibles, newModTrinkets);
  }

  // 3. Authoritative 1:1 ID to File Mapping from item_id_map.json
  const mapPath = path.join(DATA_DIR, 'item_id_map.json');
  if (await fs.pathExists(mapPath)) {
    try {
      const map = await fs.readJson(mapPath);
      if (map && map.items) {
        Object.values(map.items).forEach(it => {
          if (it.id && it.gfx) {
            const gfxLower = it.gfx.toLowerCase();
            if (newCollectibleFiles.has(gfxLower)) {
              const fullPath = newCollectibleFiles.get(gfxLower);
              newVanillaCollectibles.set(String(it.id), fullPath);
              newVanillaCollectibles.set(String(it.id).padStart(3, '0'), fullPath);
              newVanillaCollectibles.set(`collectibles_${String(it.id).padStart(3, '0')}.png`, fullPath);
              newVanillaCollectibles.set(`collectibles_${it.id}.png`, fullPath);
            }
          }
        });
      }
      if (map && map.trinkets) {
        Object.values(map.trinkets).forEach(it => {
          if (it.id && it.gfx) {
            const gfxLower = it.gfx.toLowerCase();
            if (newTrinketFiles.has(gfxLower)) {
              const fullPath = newTrinketFiles.get(gfxLower);
              newVanillaTrinkets.set(String(it.id), fullPath);
              newVanillaTrinkets.set(String(it.id).padStart(3, '0'), fullPath);
              newVanillaTrinkets.set(`trinket_${String(it.id).padStart(3, '0')}.png`, fullPath);
              newVanillaTrinkets.set(`trinkets_${String(it.id).padStart(3, '0')}.png`, fullPath);
            }
          }
        });
      }
    } catch (e) {}
  }

  vanillaCollectiblesById = newVanillaCollectibles;
  vanillaTrinketsById = newVanillaTrinkets;
  vanillaPocketById = newVanillaPocket;
  vanillaCollectibleFiles = newCollectibleFiles;
  vanillaTrinketFiles = newTrinketFiles;
  vanillaPocketFiles = newPocketFiles;

  modCollectiblesByName = newModCollectibles;
  modTrinketsByName = newModTrinkets;
  modSpritesIndex = newModSprites;
  modPortraitsIndex = newModPortraits;
  modNamesIndex = newModNames;

  spritesIndex = newSprites;
  portraitsIndex = newPortraits;
  namesIndex = newNames;

  console.log(
    `[AssetResolver] Indexed: ${vanillaCollectiblesById.size} collectible lookups, ${vanillaTrinketsById.size} trinket lookups, ${vanillaPocketById.size} pocket lookups, ${spritesIndex.size} character sprites (Bundled Vanilla).`
  );
}

// Initial index build
refreshAssetIndex().catch(() => {});

/**
 * Dynamic disk search inside a mod folder if not in memory
 */
export async function findPngInModOnDisk(modFolderOrName, filename) {
  const { modsPath, workshopPath } = getEffectiveConfig();
  const searchDirs = [];
  const searchLower = (modFolderOrName || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  if (modsPath && (await fs.pathExists(modsPath))) {
    const mf = await fs.readdir(modsPath).catch(() => []);
    for (const f of mf) {
      if (f.toLowerCase().replace(/[^a-z0-9]/g, '').includes(searchLower)) {
        searchDirs.push(path.join(modsPath, f));
      }
    }
  }
  if (workshopPath && (await fs.pathExists(workshopPath))) {
    const wf = await fs.readdir(workshopPath).catch(() => []);
    for (const f of wf) {
      if (f.toLowerCase().replace(/[^a-z0-9]/g, '').includes(searchLower)) {
        searchDirs.push(path.join(workshopPath, f));
      }
    }
  }

  const targetFile = path.basename(filename).toLowerCase();
  const targetClean = targetFile.replace(/\s+/g, '');

  for (const dir of searchDirs) {
    let match = null;
    async function scan(current) {
      if (match) return;
      try {
        const entries = await fs.readdir(current, { withFileTypes: true });
        for (const e of entries) {
          if (match) return;
          const full = path.join(current, e.name);
          if (e.isDirectory()) {
            if (e.name.startsWith('.') || e.name === 'node_modules') continue;
            await scan(full);
          } else if (e.isFile() && e.name.toLowerCase().endsWith('.png')) {
            const eLower = e.name.toLowerCase();
            if (eLower === targetFile || eLower === targetClean || eLower.replace(/\s+/g, '') === targetClean) {
              match = full;
              return;
            }
          }
        }
      } catch (err) {}
    }
    await scan(dir);
    if (match) return match;
  }
  return null;
}

/**
 * Resolves character costume / base sprite path
 */
export async function resolveSpritePath(filename, modParam = '') {
  const lower = (filename || '').toLowerCase();
  const modLower = (modParam || '').toLowerCase();

  // 1. Check mod-scoped index if requested
  if (modLower) {
    const modKey = `${modLower}:${lower}`;
    if (modSpritesIndex.has(modKey)) return modSpritesIndex.get(modKey);
  }

  // 2. Check alias map
  const aliased = VANILLA_SPRITE_ALIASES[lower] || lower;
  if (spritesIndex.has(aliased)) return spritesIndex.get(aliased);
  if (spritesIndex.has(lower)) return spritesIndex.get(lower);

  const baseName = path.basename(aliased);
  if (spritesIndex.has(baseName)) return spritesIndex.get(baseName);

  // 3. Check mod sprites index
  if (modSpritesIndex.has(lower)) return modSpritesIndex.get(lower);
  if (modSpritesIndex.has(baseName)) return modSpritesIndex.get(baseName);

  // 4. Bundled characters direct disk check
  const localCharDir = path.join(ASSETS_DIR, 'characters');
  const localFile = path.join(localCharDir, baseName);
  if (await fs.pathExists(localFile)) {
    spritesIndex.set(lower, localFile);
    spritesIndex.set(baseName, localFile);
    return localFile;
  }

  // 5. Default fallback to character_001_isaac.png
  const defaultIsaac = path.join(localCharDir, 'character_001_isaac.png');
  if (await fs.pathExists(defaultIsaac)) {
    return defaultIsaac;
  }

  return null;
}

/**
 * Resolves character portrait path
 */
export async function resolvePortraitPath(filename, modParam = '') {
  const lower = (filename || '').toLowerCase();
  const modLower = (modParam || '').toLowerCase();

  if (modLower) {
    const modKey = `${modLower}:${lower}`;
    if (modPortraitsIndex.has(modKey)) return modPortraitsIndex.get(modKey);
  }

  const aliased = VANILLA_PORTRAIT_ALIASES[lower] || lower;
  if (portraitsIndex.has(aliased)) return portraitsIndex.get(aliased);
  if (portraitsIndex.has(lower)) return portraitsIndex.get(lower);

  const withPrefix = `playerportrait_${aliased.replace(/^playerportrait_/, '')}`;
  if (portraitsIndex.has(withPrefix)) return portraitsIndex.get(withPrefix);

  const baseName = path.basename(aliased);
  if (portraitsIndex.has(baseName)) return portraitsIndex.get(baseName);

  if (modPortraitsIndex.has(lower)) return modPortraitsIndex.get(lower);
  if (modPortraitsIndex.has(baseName)) return modPortraitsIndex.get(baseName);

  // Bundled UI portrait check
  const localUiDir = path.join(ASSETS_DIR, 'ui');
  const localFile = path.join(localUiDir, baseName);
  if (await fs.pathExists(localFile)) {
    portraitsIndex.set(lower, localFile);
    return localFile;
  }

  const defaultPortrait = path.join(localUiDir, 'playerportrait_isaac.png');
  if (await fs.pathExists(defaultPortrait)) {
    return defaultPortrait;
  }

  return null;
}

/**
 * Resolves boss/character nameplate path
 */
export async function resolveNameplatePath(filename) {
  const lower = (filename || '').toLowerCase();
  if (namesIndex.has(lower)) return namesIndex.get(lower);

  const withPrefix = `playername_${lower}`;
  if (namesIndex.has(withPrefix)) return namesIndex.get(withPrefix);

  if (modNamesIndex.has(lower)) return modNamesIndex.get(lower);

  // Bundled check
  const localUiDir = path.join(ASSETS_DIR, 'ui');
  const localFile = path.join(localUiDir, lower);
  if (await fs.pathExists(localFile)) {
    namesIndex.set(lower, localFile);
    return localFile;
  }

  return null;
}

/**
 * Resolves collectible item path by numeric ID
 */
export async function resolveItemPathById(id) {
  const numId = parseInt(id, 10);
  if (isNaN(numId)) return null;

  const strId = String(numId);
  const padded = strId.padStart(3, '0');

  if (vanillaCollectiblesById.has(strId)) return vanillaCollectiblesById.get(strId);
  if (vanillaCollectiblesById.has(padded)) return vanillaCollectiblesById.get(padded);

  // Fallback check in pocket items (for pocket actives)
  if (vanillaPocketById.has(strId)) return vanillaPocketById.get(strId);
  if (vanillaPocketById.has(padded)) return vanillaPocketById.get(padded);

  // Bundled collectibles folder search
  const localColDir = path.join(ASSETS_DIR, 'items', 'collectibles');
  if (await fs.pathExists(localColDir)) {
    const files = await fs.readdir(localColDir).catch(() => []);
    const found = files.find(f => f.toLowerCase().startsWith(`collectibles_${padded}`) || f.toLowerCase().startsWith(`collectibles_${strId}_`) || f.toLowerCase() === `collectibles_${strId}.png`);
    if (found) {
      const fullPath = path.join(localColDir, found);
      vanillaCollectiblesById.set(strId, fullPath);
      vanillaCollectiblesById.set(padded, fullPath);
      return fullPath;
    }
  }

  return null;
}

/**
 * Resolves collectible item path by filename or relative path
 */
export async function resolveItemPathByFilename(rawParam, modParam = '') {
  const lower = path.basename(rawParam || '').toLowerCase();
  const cleanRelPath = (rawParam || '').toLowerCase().replace(/\\/g, '/');
  const normalizedNoSpace = lower.replace(/\s+/g, '');
  const modLower = (modParam || '').toLowerCase();
  const cleanModParam = modLower.replace(/[^a-z0-9]/g, '');

  if (modLower) {
    const candidateKeys = [
      `${modLower}:${lower}`,
      `${modLower}:${normalizedNoSpace}`,
      `${modLower}:${cleanRelPath}`,
      `${cleanModParam}:${lower}`,
      `${cleanModParam}:${normalizedNoSpace}`,
      `${cleanModParam}:${cleanRelPath}`
    ];
    for (const k of candidateKeys) {
      if (modCollectiblesByName.has(k)) return modCollectiblesByName.get(k);
      if (modTrinketsByName.has(k)) return modTrinketsByName.get(k);
    }

    const onDisk = await findPngInModOnDisk(modLower, rawParam);
    if (onDisk) {
      modCollectiblesByName.set(`${modLower}:${lower}`, onDisk);
      return onDisk;
    }
  }

  // Vanilla collectibles index
  if (vanillaCollectiblesById.has(lower)) return vanillaCollectiblesById.get(lower);
  if (vanillaCollectibleFiles.has(lower)) return vanillaCollectibleFiles.get(lower);
  if (vanillaCollectibleFiles.has(normalizedNoSpace)) return vanillaCollectibleFiles.get(normalizedNoSpace);

  // Numeric ID match
  const idMatch = lower.match(/^(?:collectibles|item)_?(\d+)/);
  if (idMatch) {
    const numId = String(parseInt(idMatch[1], 10));
    const padded = numId.padStart(3, '0');
    if (vanillaCollectiblesById.has(numId)) return vanillaCollectiblesById.get(numId);
    if (vanillaCollectiblesById.has(padded)) return vanillaCollectiblesById.get(padded);
  }

  // Global mod items fallback
  if (modCollectiblesByName.has(lower)) return modCollectiblesByName.get(lower);
  if (modCollectiblesByName.has(normalizedNoSpace)) return modCollectiblesByName.get(normalizedNoSpace);
  if (modTrinketsByName.has(lower)) return modTrinketsByName.get(lower);
  if (modTrinketsByName.has(normalizedNoSpace)) return modTrinketsByName.get(normalizedNoSpace);

  return null;
}

/**
 * Resolves trinket path by numeric ID
 */
export async function resolveTrinketPathById(id) {
  const numId = parseInt(id, 10);
  if (isNaN(numId)) return null;

  const strId = String(numId);
  const padded = strId.padStart(3, '0');

  if (vanillaTrinketsById.has(strId)) return vanillaTrinketsById.get(strId);
  if (vanillaTrinketsById.has(padded)) return vanillaTrinketsById.get(padded);

  const localTrkDir = path.join(ASSETS_DIR, 'items', 'trinkets');
  if (await fs.pathExists(localTrkDir)) {
    const files = await fs.readdir(localTrkDir).catch(() => []);
    const found = files.find(f => f.toLowerCase().startsWith(`trinket_${padded}`) || f.toLowerCase().startsWith(`trinket_${strId}_`) || f.toLowerCase().startsWith(`trinkets_${padded}`) || f.toLowerCase() === `trinket_${strId}.png`);
    if (found) {
      const fullPath = path.join(localTrkDir, found);
      vanillaTrinketsById.set(strId, fullPath);
      vanillaTrinketsById.set(padded, fullPath);
      return fullPath;
    }
  }

  return null;
}

/**
 * Resolves trinket path by filename or relative path
 */
export async function resolveTrinketPathByFilename(rawParam, modParam = '') {
  const lower = path.basename(rawParam || '').toLowerCase();
  const cleanRelPath = (rawParam || '').toLowerCase().replace(/\\/g, '/');
  const normalizedNoSpace = lower.replace(/\s+/g, '');
  const modLower = (modParam || '').toLowerCase();
  const cleanModParam = modLower.replace(/[^a-z0-9]/g, '');

  if (modLower) {
    const candidateKeys = [
      `${modLower}:${lower}`,
      `${modLower}:${normalizedNoSpace}`,
      `${modLower}:${cleanRelPath}`,
      `${cleanModParam}:${lower}`,
      `${cleanModParam}:${normalizedNoSpace}`,
      `${cleanModParam}:${cleanRelPath}`
    ];
    for (const k of candidateKeys) {
      if (modTrinketsByName.has(k)) return modTrinketsByName.get(k);
      if (modCollectiblesByName.has(k)) return modCollectiblesByName.get(k);
    }

    const onDisk = await findPngInModOnDisk(modLower, rawParam);
    if (onDisk) {
      modTrinketsByName.set(`${modLower}:${lower}`, onDisk);
      return onDisk;
    }
  }

  if (vanillaTrinketsById.has(lower)) return vanillaTrinketsById.get(lower);
  if (vanillaTrinketFiles.has(lower)) return vanillaTrinketFiles.get(lower);
  if (vanillaTrinketFiles.has(normalizedNoSpace)) return vanillaTrinketFiles.get(normalizedNoSpace);

  const idMatch = lower.match(/^(?:trinket|trinkets)_?(\d+)/);
  if (idMatch) {
    const numId = String(parseInt(idMatch[1], 10));
    const padded = numId.padStart(3, '0');
    if (vanillaTrinketsById.has(numId)) return vanillaTrinketsById.get(numId);
    if (vanillaTrinketsById.has(padded)) return vanillaTrinketsById.get(padded);
  }

  if (modTrinketsByName.has(lower)) return modTrinketsByName.get(lower);
  if (modTrinketsByName.has(normalizedNoSpace)) return modTrinketsByName.get(normalizedNoSpace);
  if (modCollectiblesByName.has(lower)) return modCollectiblesByName.get(lower);
  if (modCollectiblesByName.has(normalizedNoSpace)) return modCollectiblesByName.get(normalizedNoSpace);

  return null;
}

/**
 * Resolves pocket item / consumable path by numeric ID
 */
export async function resolvePocketPathById(id) {
  const numId = parseInt(id, 10);
  if (isNaN(numId)) return null;

  const strId = String(numId);
  const padded = strId.padStart(3, '0');

  if (vanillaPocketById.has(strId)) return vanillaPocketById.get(strId);
  if (vanillaPocketById.has(padded)) return vanillaPocketById.get(padded);

  // Also check if active collectible in pocket
  if (vanillaCollectiblesById.has(strId)) return vanillaCollectiblesById.get(strId);
  if (vanillaCollectiblesById.has(padded)) return vanillaCollectiblesById.get(padded);

  const localPocketDirs = [
    path.join(DATA_DIR, 'pocket'),
    path.join(ASSETS_DIR, 'items', 'pocket')
  ];
  for (const localPocketDir of localPocketDirs) {
    if (await fs.pathExists(localPocketDir)) {
      const files = await fs.readdir(localPocketDir).catch(() => []);
      const found = files.find(f => f.toLowerCase().includes(`_${strId}.png`) || f.toLowerCase().includes(`_${padded}.png`));
      if (found) {
        const fullPath = path.join(localPocketDir, found);
        vanillaPocketById.set(strId, fullPath);
        vanillaPocketById.set(padded, fullPath);
        return fullPath;
      }
    }
  }

  return null;
}

/**
 * Resolves pocket item / consumable path by filename
 */
export async function resolvePocketPathByFilename(filename) {
  const lower = (filename || '').toLowerCase();
  if (vanillaPocketFiles.has(lower)) return vanillaPocketFiles.get(lower);

  const localPocketDirs = [
    path.join(DATA_DIR, 'pocket'),
    path.join(ASSETS_DIR, 'items', 'pocket')
  ];
  for (const localPocketDir of localPocketDirs) {
    const fullPath = path.join(localPocketDir, filename);
    if (await fs.pathExists(fullPath)) {
      vanillaPocketFiles.set(lower, fullPath);
      return fullPath;
    }
  }

  return null;
}

/**
 * Resolves UI hearts and general UI elements
 */
export async function resolveUiPath(category, filename) {
  const safeFilename = path.basename(filename || '');
  const possiblePaths = [
    category === 'hearts' ? path.join(ASSETS_DIR, 'ui', 'hearts', safeFilename) : path.join(ASSETS_DIR, 'ui', safeFilename),
    path.join(APP_ROOT, 'client', 'dist', 'assets', 'ui', category === 'hearts' ? 'hearts' : '', safeFilename),
    path.join(APP_ROOT, 'client', 'public', 'assets', 'ui', category === 'hearts' ? 'hearts' : '', safeFilename)
  ];

  for (const p of possiblePaths) {
    if (await fs.pathExists(p)) {
      return p;
    }
  }

  return null;
}
