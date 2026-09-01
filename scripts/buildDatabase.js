import fs from 'fs-extra';
import path from 'path';
import xml2js from 'xml2js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const DEFAULT_GAME_PATHS = [
  'G:\\Games\\steamapps\\common\\The Binding of Isaac Rebirth',
  'C:\\Program Files (x86)\\Steam\\steamapps\\common\\The Binding of Isaac Rebirth',
  'C:\\SteamLibrary\\steamapps\\common\\The Binding of Isaac Rebirth',
  'D:\\SteamLibrary\\steamapps\\common\\The Binding of Isaac Rebirth',
  'E:\\SteamLibrary\\steamapps\\common\\The Binding of Isaac Rebirth'
];

function getDlcForItem(id) {
  if (id <= 346) return 'rebirth';
  if (id <= 441) return 'afterbirth';
  if (id <= 552) return 'afterbirthplus';
  if (id <= 732) return 'repentance';
  return 'repentanceplus';
}

function getDlcForTrinket(id) {
  if (id <= 61) return 'rebirth';
  if (id <= 91) return 'afterbirth';
  if (id <= 128) return 'afterbirthplus';
  return 'repentance';
}

function formatTitleCase(str) {
  if (!str) return '';
  const clean = str.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  return clean.replace(/\w\S*/g, (word) => {
    // Preserve words like D6, D20, 1up, etc.
    if (/^d\d+$/i.test(word) || /^\d+up$/i.test(word)) {
      return word.toUpperCase();
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

async function buildDatabase() {
  console.log('[INFO] Starting Isaac Studio Database Build & Compilation...');

  // 1. Locate game directory or extracted resources
  let gamePath = DEFAULT_GAME_PATHS.find(p => fs.existsSync(p)) || '';
  console.log(`[1/5] Detected game directory: ${gamePath || 'None (using local data)'}`);

  // 2. Parse stringtable.sta for authentic in-game localized descriptions
  const stringMap = new Map();
  const possibleStringPaths = [
    path.join(gamePath, 'extracted_resources', 'resources', 'stringtable.sta'),
    path.join(gamePath, 'extracted_resources', 'resources-dlc3', 'stringtable.sta'),
    path.join(gamePath, 'resources', 'stringtable.sta')
  ];

  for (const sp of possibleStringPaths) {
    if (await fs.pathExists(sp)) {
      try {
        console.log(`[2/5] Parsing localization strings from: ${sp}`);
        const staRaw = await fs.readFile(sp, 'utf8');
        const parser = new xml2js.Parser();
        const staRes = await parser.parseStringPromise(staRaw);
        for (const cat of staRes.stringtable?.category || []) {
          for (const k of cat.key || []) {
            const keyName = k.$?.name;
            const val = (k.string && k.string[0]) ? k.string[0].trim() : '';
            if (keyName && val) {
              stringMap.set(keyName, val);
              stringMap.set('#' + keyName, val);
            }
          }
        }
        console.log(`[INFO] Parsed ${stringMap.size} strings from stringtable.`);
        break;
      } catch (err) {
        console.warn('Warning parsing stringtable:', err.message);
      }
    }
  }

  // 3. Parse Item Pools
  const poolMap = {};
  const possiblePoolPaths = [
    path.join(gamePath, 'extracted_resources', 'resources', 'itempools.xml'),
    path.join(gamePath, 'extracted_resources', 'resources-dlc3', 'itempools.xml'),
    path.join(gamePath, 'resources', 'itempools.xml')
  ];

  for (const pp of possiblePoolPaths) {
    if (await fs.pathExists(pp)) {
      try {
        console.log(`[3/5] Parsing item pools from: ${pp}`);
        const rawPool = await fs.readFile(pp, 'utf8');
        const parser = new xml2js.Parser();
        const poolRes = await parser.parseStringPromise(rawPool);
        if (poolRes.ItemPools && poolRes.ItemPools.Pool) {
          poolRes.ItemPools.Pool.forEach(pool => {
            const poolName = (pool.$?.Name || '').toLowerCase().replace(/\s+/g, '_');
            if (pool.Item) {
              pool.Item.forEach(item => {
                const id = parseInt(item.$?.Id, 10);
                if (!isNaN(id)) {
                  if (!poolMap[id]) poolMap[id] = new Set();
                  poolMap[id].add(poolName);
                }
              });
            }
          });
        }
        console.log(`[INFO] Loaded pools for ${Object.keys(poolMap).length} items.`);
        break;
      } catch (err) {
        console.warn('Warning parsing itempools:', err.message);
      }
    }
  }

  // 4. Parse Items Metadata (Qualities)
  const qualityMap = {};
  const possibleMetaPaths = [
    path.join(gamePath, 'extracted_resources', 'resources', 'items_metadata.xml'),
    path.join(gamePath, 'extracted_resources', 'resources-dlc3', 'items_metadata.xml'),
    path.join(gamePath, 'resources', 'items_metadata.xml')
  ];

  for (const mp of possibleMetaPaths) {
    if (await fs.pathExists(mp)) {
      try {
        console.log(`[4/5] Parsing item qualities from: ${mp}`);
        const rawMeta = await fs.readFile(mp, 'utf8');
        const parser = new xml2js.Parser();
        const metaRes = await parser.parseStringPromise(rawMeta);
        if (metaRes.items && metaRes.items.item) {
          metaRes.items.item.forEach(i => {
            const id = parseInt(i.$?.id, 10);
            if (!isNaN(id) && i.$?.quality !== undefined) {
              qualityMap[id] = parseInt(i.$.quality, 10);
            }
          });
        }
        console.log(`[INFO] Loaded quality values for ${Object.keys(qualityMap).length} items.`);
        break;
      } catch (err) {
        console.warn('Warning parsing metadata:', err.message);
      }
    }
  }

  // 5. Index existing local asset filenames
  const localCollectibleDir = path.join(rootDir, 'server', 'data', 'assets', 'items', 'collectibles');
  const localTrinketDir = path.join(rootDir, 'server', 'data', 'assets', 'items', 'trinkets');
  
  const collectibleFiles = new Map();
  if (await fs.pathExists(localCollectibleDir)) {
    const list = await fs.readdir(localCollectibleDir);
    list.forEach(f => {
      collectibleFiles.set(f.toLowerCase(), f);
      const match = f.match(/^collectibles_(\d+)/i);
      if (match) {
        collectibleFiles.set(String(parseInt(match[1], 10)), f);
        collectibleFiles.set(String(parseInt(match[1], 10)).padStart(3, '0'), f);
      }
    });
  }

  const trinketFiles = new Map();
  if (await fs.pathExists(localTrinketDir)) {
    const list = await fs.readdir(localTrinketDir);
    list.forEach(f => {
      trinketFiles.set(f.toLowerCase(), f);
      const match = f.match(/^(?:trinket|trinkets)_(\d+)/i);
      if (match) {
        trinketFiles.set(String(parseInt(match[1], 10)), f);
        trinketFiles.set(String(parseInt(match[1], 10)).padStart(3, '0'), f);
      }
    });
  }

  // 6. Read and Compile items.xml
  const possibleXmlPaths = [
    path.join(gamePath, 'extracted_resources', 'resources', 'items.xml'),
    path.join(gamePath, 'extracted_resources', 'resources-dlc3', 'items.xml'),
    path.join(gamePath, 'resources', 'items.xml')
  ];

  let rawXml = null;
  for (const xp of possibleXmlPaths) {
    if (await fs.pathExists(xp)) {
      rawXml = await fs.readFile(xp, 'utf8');
      console.log(`[5/5] Parsing master items definitions from: ${xp}`);
      break;
    }
  }

  const masterItems = {};
  const masterTrinkets = {};

  if (rawXml) {
    const parser = new xml2js.Parser();
    const parsed = await parser.parseStringPromise(rawXml);
    const root = parsed.items || {};

    const types = [
      { key: 'passive', defaultType: 'passive' },
      { key: 'active', defaultType: 'active' },
      { key: 'familiar', defaultType: 'familiar' },
      { key: 'collectible', defaultType: 'passive' }
    ];

    for (const { key, defaultType } of types) {
      if (!root[key]) continue;
      const list = Array.isArray(root[key]) ? root[key] : [root[key]];
      for (const it of list) {
        const attr = it.$ || {};
        const id = parseInt(attr.id, 10);
        if (isNaN(id) || id <= 0) continue;

        // Resolve authentic name from stringtable
        let name = '';
        if (attr.name) {
          if (stringMap.has(attr.name)) {
            name = stringMap.get(attr.name);
          } else {
            name = formatTitleCase(attr.name.replace(/^#/, '').replace(/_NAME$/, ''));
          }
        } else {
          name = `Collectible #${id}`;
        }

        // Resolve authentic in-game short description from stringtable
        let desc = '';
        if (attr.description) {
          if (stringMap.has(attr.description)) {
            desc = stringMap.get(attr.description);
          } else {
            desc = formatTitleCase(attr.description.replace(/^#/, '').replace(/_DESCRIPTION$/, ''));
          }
        }
        if (!desc || desc.toLowerCase() === name.toLowerCase()) {
          desc = 'Collectible Isaac loadout item';
        }

        // Match accurate local sprite filename
        let gfx = attr.gfx || `Collectibles_${String(id).padStart(3, '0')}.png`;
        const paddedId = String(id).padStart(3, '0');
        if (collectibleFiles.has(gfx.toLowerCase())) {
          gfx = collectibleFiles.get(gfx.toLowerCase());
        } else if (collectibleFiles.has(String(id))) {
          gfx = collectibleFiles.get(String(id));
        } else if (collectibleFiles.has(paddedId)) {
          gfx = collectibleFiles.get(paddedId);
        }

        const pools = (poolMap[id] && poolMap[id].size > 0)
          ? Array.from(poolMap[id])
          : ['treasure'];

        const quality = qualityMap[id] !== undefined
          ? qualityMap[id]
          : (attr.quality !== undefined ? parseInt(attr.quality, 10) : 2);

        const charges = attr.maxcharges ? parseInt(attr.maxcharges, 10) : 0;

        masterItems[String(id)] = {
          id,
          name,
          desc,
          type: defaultType,
          quality,
          pool: pools,
          dlc: getDlcForItem(id),
          gfx,
          charges
        };
      }
    }

    // Trinkets
    if (root.trinket) {
      const trkList = Array.isArray(root.trinket) ? root.trinket : [root.trinket];
      for (const tr of trkList) {
        const attr = tr.$ || {};
        const id = parseInt(attr.id, 10);
        if (isNaN(id) || id <= 0) continue;

        let name = '';
        if (attr.name) {
          if (stringMap.has(attr.name)) {
            name = stringMap.get(attr.name);
          } else {
            name = formatTitleCase(attr.name.replace(/^#/, '').replace(/_NAME$/, ''));
          }
        } else {
          name = `Trinket #${id}`;
        }

        let desc = '';
        if (attr.description) {
          if (stringMap.has(attr.description)) {
            desc = stringMap.get(attr.description);
          } else {
            desc = formatTitleCase(attr.description.replace(/^#/, '').replace(/_DESCRIPTION$/, ''));
          }
        }
        if (!desc || desc.toLowerCase() === name.toLowerCase()) {
          desc = 'Passive trinket effect';
        }

        let gfx = attr.gfx || `trinket_${String(id).padStart(3, '0')}.png`;
        const paddedId = String(id).padStart(3, '0');
        if (trinketFiles.has(gfx.toLowerCase())) {
          gfx = trinketFiles.get(gfx.toLowerCase());
        } else if (trinketFiles.has(String(id))) {
          gfx = trinketFiles.get(String(id));
        } else if (trinketFiles.has(paddedId)) {
          gfx = trinketFiles.get(paddedId);
        }

        masterTrinkets[String(id)] = {
          id,
          name,
          desc,
          type: 'trinket',
          quality: attr.quality !== undefined ? parseInt(attr.quality, 10) : 2,
          pool: ['shop', 'treasure'],
          dlc: getDlcForTrinket(id),
          gfx
        };
      }
    }
  }

  // 7. Write compiled master database to server/data/item_id_map.json
  const finalDb = {
    version: '0.8.0-dlc-repentanceplus',
    generatedAt: new Date().toISOString(),
    totalItems: Object.keys(masterItems).length,
    totalTrinkets: Object.keys(masterTrinkets).length,
    items: masterItems,
    trinkets: masterTrinkets
  };

  const outputPath = path.join(rootDir, 'server', 'data', 'item_id_map.json');
  await fs.writeJson(outputPath, finalDb, { spaces: 2 });
  console.log(`[SUCCESS] Successfully compiled ${finalDb.totalItems} collectibles and ${finalDb.totalTrinkets} trinkets to: ${outputPath}`);
}

buildDatabase().catch(err => {
  console.error('[ERROR] Build failed:', err);
  process.exit(1);
});
