import fs from 'fs-extra';
import path from 'path';
import { PNG } from 'pngjs';
import { DATA_DIR, ASSETS_DIR } from '../config.js';
import { generateServerNameplatePng } from './textRenderer.js';

// Vanilla character portrait crop coordinates in charactermenu.png
export const PORTRAIT_CROPS = {
  // Base / Standard Characters
  'character_001_isaac.png': { x: 176, y: 288, w: 48, h: 48 },
  'character_002_magdalene.png': { x: 176, y: 336, w: 48, h: 48 },
  'character_003_cain.png': { x: 272, y: 288, w: 48, h: 48 },
  'character_004_judas.png': { x: 272, y: 336, w: 48, h: 48 },
  'character_005_bluebaby.png': { x: 368, y: 288, w: 48, h: 48 },
  'character_005b_bluebaby.png': { x: 368, y: 288, w: 48, h: 48 },
  'character_006_bluebaby.png': { x: 368, y: 288, w: 48, h: 48 },
  'character_005_eve.png': { x: 368, y: 336, w: 48, h: 48 },
  'character_007_samson.png': { x: 176, y: 384, w: 48, h: 48 },
  'character_008_azazel.png': { x: 272, y: 384, w: 48, h: 48 },
  'character_009_lazarus.png': { x: 368, y: 384, w: 48, h: 48 },
  'character_009_eden.png': { x: 176, y: 432, w: 48, h: 48 },
  'character_010_eden.png': { x: 176, y: 432, w: 48, h: 48 },
  'character_011_thelost.png': { x: 416, y: 288, w: 48, h: 48 },
  'character_012_thelost.png': { x: 416, y: 288, w: 48, h: 48 },
  'character_014_lilith.png': { x: 320, y: 432, w: 48, h: 48 },
  'character_015_keeper.png': { x: 368, y: 432, w: 48, h: 48 },
  'character_016_apollyon.png': { x: 384, y: 928, w: 48, h: 48 },
  'character_017_theforgotten.png': { x: 336, y: 928, w: 48, h: 48 },
  'character_001x_bethany.png': { x: 464, y: 336, w: 48, h: 48 },
  'character_018_bethany.png': { x: 464, y: 336, w: 48, h: 48 },
  'character_019_bethany.png': { x: 464, y: 336, w: 48, h: 48 },
  'character_002x_jacob.png': { x: 464, y: 432, w: 48, h: 48 },
  'character_003x_esau.png': { x: 464, y: 432, w: 48, h: 48 },
  'character_019_jacob.png': { x: 464, y: 432, w: 48, h: 48 },
  'character_020_jacob.png': { x: 464, y: 432, w: 48, h: 48 },
  // Tainted Characters
  'character_001_isaac_b.png': { x: 176, y: 288, w: 48, h: 48 },
  'character_001b_isaac.png': { x: 176, y: 288, w: 48, h: 48 },
  'character_002_magdalene_b.png': { x: 176, y: 336, w: 48, h: 48 },
  'character_002b_magdalene.png': { x: 176, y: 336, w: 48, h: 48 },
  'character_003_cain_b.png': { x: 272, y: 288, w: 48, h: 48 },
  'character_003b_cain.png': { x: 272, y: 288, w: 48, h: 48 },
  'character_004_judas_b.png': { x: 272, y: 336, w: 48, h: 48 },
  'character_004b_judas.png': { x: 272, y: 336, w: 48, h: 48 },
  'character_005_bluebaby_b.png': { x: 368, y: 288, w: 48, h: 48 },
  'character_005b_bluebaby_b.png': { x: 368, y: 288, w: 48, h: 48 },
  'character_006_bluebaby_b.png': { x: 368, y: 288, w: 48, h: 48 },
  'character_005_eve_b.png': { x: 368, y: 336, w: 48, h: 48 },
  'character_006_eve_b.png': { x: 368, y: 336, w: 48, h: 48 },
  'character_006b_eve.png': { x: 368, y: 336, w: 48, h: 48 },
  'character_007_samson_b.png': { x: 176, y: 384, w: 48, h: 48 },
  'character_007b_samson.png': { x: 176, y: 384, w: 48, h: 48 },
  'character_008_azazel_b.png': { x: 272, y: 384, w: 48, h: 48 },
  'character_008b_azazel.png': { x: 272, y: 384, w: 48, h: 48 },
  'character_009_lazarus_b.png': { x: 368, y: 384, w: 48, h: 48 },
  'character_009b_lazarus.png': { x: 368, y: 384, w: 48, h: 48 },
  'character_009_eden_b.png': { x: 176, y: 432, w: 48, h: 48 },
  'character_009b_eden.png': { x: 176, y: 432, w: 48, h: 48 },
  'character_010b_eden.png': { x: 176, y: 432, w: 48, h: 48 },
  'character_012_thelost_b.png': { x: 416, y: 288, w: 48, h: 48 },
  'character_012b_thelost.png': { x: 416, y: 288, w: 48, h: 48 },
  'character_014_lilith_b.png': { x: 320, y: 432, w: 48, h: 48 },
  'character_014b_lilith.png': { x: 320, y: 432, w: 48, h: 48 },
  'character_015_keeper_b.png': { x: 368, y: 432, w: 48, h: 48 },
  'character_015b_keeper.png': { x: 368, y: 432, w: 48, h: 48 },
  'character_016_apollyon_b.png': { x: 384, y: 928, w: 48, h: 48 },
  'character_016b_apollyon.png': { x: 384, y: 928, w: 48, h: 48 },
  'character_017_theforgotten_b.png': { x: 336, y: 928, w: 48, h: 48 },
  'character_016b_theforgotten.png': { x: 336, y: 928, w: 48, h: 48 },
  'character_017b_theforgotten.png': { x: 336, y: 928, w: 48, h: 48 },
  'character_018_bethany_b.png': { x: 464, y: 336, w: 48, h: 48 },
  'character_018b_bethany.png': { x: 464, y: 336, w: 48, h: 48 },
  'character_019_jacob_b.png': { x: 464, y: 432, w: 48, h: 48 },
  'character_019b_jacob.png': { x: 464, y: 432, w: 48, h: 48 }
};

// Safe dedicated regions on charactermenu.png (Y: 960..1024 is empty transparent space in vanilla 512x1024 texture)
export const CUSTOM_NAMEPLATE_CROP = { x: 0, y: 960, w: 104, h: 32 };
export const CUSTOM_PORTRAIT_CROP = { x: 112, y: 960, w: 48, h: 48 };
export const CUSTOM_ITEM_ICON_CROP = { x: 160, y: 960, w: 32, h: 32 };
export const CUSTOM_ITEM_NAME_CROP = { x: 192, y: 960, w: 120, h: 32 };
export const CUSTOM_TWIN_ITEM_ICON_CROP = { x: 312, y: 960, w: 32, h: 32 };
export const CUSTOM_TWIN_ITEM_NAME_CROP = { x: 344, y: 960, w: 120, h: 32 };

export function getLifeStatCrop(char) {
  const hp = parseInt(char.hp ?? 6, 10);
  const armor = parseInt(char.armor ?? 0, 10);
  const black = parseInt(char.black ?? 0, 10);
  const bone = parseInt(char.bone ?? 0, 10);

  if (hp >= 8) return { x: 112, y: 512 }; // 4 red heart bars (||||)
  if (hp >= 6) return { x: 80, y: 512 };  // 3 red heart bars (|||)
  if (hp >= 4) return { x: 112, y: 480 }; // 2 red heart bars (||)
  if (hp >= 2) return { x: 80, y: 480 };  // 1 red heart bar (|)
  if ((hp === 0 || hp === '0') && (armor > 0 || black > 0 || bone > 0)) {
    return { x: 144, y: 480 }; // Soul hearts (Blue Baby)
  }
  return { x: 48, y: 512 }; // Question mark (The Lost / 0 HP)
}

export function getSpeedStatCrop(char) {
  const spd = parseFloat(char.speed ?? 1.0);
  if (spd >= 1.35) return { x: 112, y: 512 }; // 4 speed bars (||||)
  if (spd >= 1.15) return { x: 80, y: 512 };  // 3 speed bars (|||)
  if (spd >= 0.90) return { x: 112, y: 480 }; // 2 speed bars (||)
  return { x: 80, y: 480 };                   // 1 speed bar (|)
}

export function getDamageStatCrop(char) {
  const dmg = parseFloat(char.damage ?? 3.5) * parseFloat(char.damageMult ?? 1.0);
  if (dmg >= 5.5) return { x: 144, y: 512 };  // 4 power bars (||||)
  if (dmg >= 4.0) return { x: 112, y: 512 };  // 3 power bars (|||)
  if (dmg >= 3.0) return { x: 112, y: 480 };  // 2 power bars (||)
  return { x: 80, y: 480 };                   // 1 power bar (|)
}

let itemMapCache = null;
function getItemMap() {
  if (!itemMapCache) {
    const candidates = [
      path.join(DATA_DIR, 'item_id_map.json'),
      path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([a-zA-Z]:)/, '$1')), '..', 'data', 'item_id_map.json')
    ];
    for (const c of candidates) {
      try {
        if (fs.existsSync(c)) {
          itemMapCache = JSON.parse(fs.readFileSync(c, 'utf8'));
          break;
        }
      } catch (e) {}
    }
  }
  return itemMapCache;
}

/**
 * Resolves the character's active item, synergy, pocket item, or primary starting item for rendering on the character select paper
 */
export async function resolveCharacterStartingItem(character, gamePath, isTwin = false) {
  if (!character) return null;

  const itemMap = getItemMap();

  let itemId = null;
  let trinketId = null;
  let cardId = null;
  let itemName = '';
  let iconBuffer = null;
  let isTrinket = false;
  let isCard = false;

  // 1. Extract and normalize items array
  let itemsList = [];
  const rawItems = isTwin ? (character.twinItems || []) : (character.items || []);
  if (Array.isArray(rawItems)) {
    itemsList = rawItems.map(n => Number(n)).filter(n => !isNaN(n) && n > 0);
  } else if (typeof rawItems === 'string' && rawItems.trim()) {
    itemsList = rawItems.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n) && n > 0);
  }

  // 2. Extract pocket active / pocket item / trinket / card
  const pocketActiveId = isTwin
    ? Number(character.twinPocketactive || character.twinPocketActive || 0)
    : Number(character.pocketactive || character.pocketActive || 0);
  const pocketItemId = isTwin
    ? Number(character.twinPocketitem || character.twinPocketItem || 0)
    : Number(character.pocketitem || character.pocketItem || 0);
  const charTrinketId = isTwin
    ? Number(character.twinTrinket || character.twinTrinketId || 0)
    : Number(character.trinket || character.trinketId || 0);
  const charCardId = isTwin
    ? Number(character.twinCard || character.twinCardId || 0)
    : Number(character.card || character.cardId || 0);

  // 3. Known active item IDs in Isaac Repentance
  const KNOWN_ACTIVE_IDS = new Set([
    33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 44, 45, 47, 49, 56, 58, 65, 77, 78, 83, 84, 85, 86, 93, 97, 102, 105, 107, 111, 123, 124, 126, 127, 130, 133, 135, 136, 137, 145, 146, 147, 158, 160, 164, 166, 171, 175, 177, 186, 192, 194, 282, 283, 284, 285, 286, 287, 288, 289, 290, 291, 292, 293, 294, 295, 296, 297, 298, 323, 324, 325, 326, 338, 347, 348, 351, 352, 382, 383, 386, 396, 403, 404, 405, 406, 419, 421, 422, 426, 427, 434, 437, 439, 441, 475, 476, 477, 478, 479, 480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 508, 510, 512, 514, 515, 521, 522, 523, 536, 545, 550, 552, 555, 556, 567, 577, 580, 582, 584, 585, 605, 621, 623, 625, 628, 636, 638, 650, 651, 652, 653, 654, 661, 703, 704, 705, 706, 707, 708, 709, 710, 711, 712, 713, 714, 715, 716, 717, 719, 720, 721, 722, 723, 724, 725, 726, 727, 728, 729
  ]);

  // Priority 1: Check for active items in starting items list
  const activeInItems = itemsList.find(id => {
    const info = itemMap?.items?.[String(id)];
    return (info && (info.type === 'active' || info.charges > 0)) || KNOWN_ACTIVE_IDS.has(id);
  });

  if (activeInItems) {
    itemId = activeInItems;
  } else if (pocketActiveId > 0) {
    itemId = pocketActiveId;
  } else if (!isTwin && character.synergies && Array.isArray(character.synergies) && character.synergies.length > 0) {
    // Check synergies array for active or lead synergy item
    for (const syn of character.synergies) {
      if (syn && Array.isArray(syn.itemIds) && syn.itemIds.length > 0) {
        const synActive = syn.itemIds.find(id => KNOWN_ACTIVE_IDS.has(id) || (itemMap?.items?.[String(id)]?.type === 'active'));
        if (synActive) {
          itemId = synActive;
          break;
        } else if (!itemId) {
          itemId = syn.itemIds[0];
        }
      }
    }
  } else if (itemsList.length > 0) {
    itemId = itemsList[0];
  } else if (pocketItemId > 0) {
    itemId = pocketItemId;
  } else if (charTrinketId > 0) {
    trinketId = charTrinketId;
    isTrinket = true;
  } else if (charCardId > 0) {
    cardId = charCardId;
    isCard = true;
  }

  // Modded starting items support
  if (!itemId && !trinketId && !cardId) {
    const moddedPocket = isTwin ? character.twinModdedPocketItemName : character.moddedPocketItemName;
    const moddedList = isTwin ? character.twinModdedItemsList : character.moddedItemsList;
    const moddedTrinket = isTwin ? character.twinModdedTrinketName : character.moddedTrinketName;

    if (moddedPocket) {
      itemName = moddedPocket;
    } else if (Array.isArray(moddedList) && moddedList.length > 0) {
      itemName = moddedList[0].name;
    } else if (moddedTrinket) {
      itemName = moddedTrinket;
    }
  }

  // Search directories for item sprites
  const searchDirs = [
    path.join(ASSETS_DIR, 'items', 'collectibles'),
    path.join(ASSETS_DIR, 'items', 'trinkets'),
    path.join(ASSETS_DIR, 'items', 'pocket'),
    path.join(ASSETS_DIR, 'items'),
    path.join(gamePath || '', 'extracted_resources', 'resources-dlc3', 'gfx', 'items', 'collectibles'),
    path.join(gamePath || '', 'extracted_resources', 'resources-dlc3', 'gfx', 'items', 'trinkets'),
    path.join(gamePath || '', 'extracted_resources', 'resources-dlc3', 'gfx', 'items', 'pocket items'),
    path.join(gamePath || '', 'extracted_resources', 'resources', 'gfx', 'items', 'collectibles'),
    path.join(gamePath || '', 'extracted_resources', 'resources', 'gfx', 'items', 'trinkets'),
    path.join(gamePath || '', 'extracted_resources', 'resources', 'gfx', 'items', 'pocket items'),
    path.join(gamePath || '', 'resources-dlc3', 'gfx', 'items', 'collectibles'),
    path.join(gamePath || '', 'resources', 'gfx', 'items', 'collectibles')
  ].filter(Boolean);

  if (itemId) {
    const itemInfo = itemMap?.items?.[String(itemId)];
    if (itemInfo) {
      itemName = itemInfo.name || '';
    }

    const expectedGfx = itemInfo?.gfx ? itemInfo.gfx.toLowerCase() : null;

    for (const dir of searchDirs) {
      if (await fs.pathExists(dir)) {
        try {
          const files = await fs.readdir(dir);
          const match = files.find(f => {
            const lower = f.toLowerCase();
            if (expectedGfx && lower === expectedGfx) return true;
            return lower === `collectibles_${itemId}.png` ||
                   lower === `collectibles_${String(itemId).padStart(3, '0')}.png` ||
                   lower.startsWith(`collectibles_${itemId}_`) ||
                   lower.startsWith(`collectibles_${String(itemId).padStart(3, '0')}_`);
          });
          if (match) {
            const rawBuf = await fs.readFile(path.join(dir, match)).catch(() => null);
            if (rawBuf) {
              iconBuffer = rawBuf;
              if (!itemName) {
                const namePart = match.replace(/^collectibles_\d+_?/i, '').replace(/\.png$/i, '').replace(/_/g, ' ');
                if (namePart) itemName = namePart.replace(/\b\w/g, c => c.toUpperCase());
              }
              break;
            }
          }
        } catch (e) {}
      }
    }
    if (!itemName) {
      itemName = `Item #${itemId}`;
    }
  } else if (isTrinket && trinketId) {
    const trinketInfo = itemMap?.trinkets?.[String(trinketId)];
    if (trinketInfo) {
      itemName = trinketInfo.name || '';
    }

    const expectedGfx = trinketInfo?.gfx ? trinketInfo.gfx.toLowerCase() : null;

    for (const dir of searchDirs) {
      if (await fs.pathExists(dir)) {
        try {
          const files = await fs.readdir(dir);
          const match = files.find(f => {
            const lower = f.toLowerCase();
            if (expectedGfx && lower === expectedGfx) return true;
            return lower === `trinket_${trinketId}.png` ||
                   lower === `trinket_${String(trinketId).padStart(3, '0')}.png` ||
                   lower.startsWith(`trinket_${trinketId}_`) ||
                   lower.startsWith(`trinket_${String(trinketId).padStart(3, '0')}_`);
          });
          if (match) {
            const rawBuf = await fs.readFile(path.join(dir, match)).catch(() => null);
            if (rawBuf) {
              iconBuffer = rawBuf;
              if (!itemName) {
                const namePart = match.replace(/^trinket_\d+_?/i, '').replace(/\.png$/i, '').replace(/_/g, ' ');
                if (namePart) itemName = namePart.replace(/\b\w/g, c => c.toUpperCase());
              }
              break;
            }
          }
        } catch (e) {}
      }
    }
    if (!itemName) {
      itemName = `Trinket #${trinketId}`;
    }
  }

  if (iconBuffer || itemName) {
    let itemNameplateBuffer = null;
    try {
      itemNameplateBuffer = generateServerNameplatePng(itemName || 'Active Item');
    } catch (e) {}

    return {
      itemId: itemId || trinketId || cardId,
      itemName,
      iconBuffer,
      itemNameplateBuffer
    };
  }

  return null;
}

function safeReadPng(buffer) {
  if (!buffer) return null;
  let cleanBuffer = buffer;
  const iendIdx = cleanBuffer.indexOf(Buffer.from('IEND'));
  if (iendIdx !== -1 && cleanBuffer.length > iendIdx + 8) {
    cleanBuffer = cleanBuffer.subarray(0, iendIdx + 8);
  }
  return PNG.sync.read(cleanBuffer, { checkCRC: false });
}

/**
 * Composites the character's handwritten nameplate into charactermenu.png at (0, 960),
 * custom portrait into charactermenu.png at (112, 960),
 * and starting active item icon (160, 960) + item name (192, 960).
 * Safe unused coordinates (Y: 960..1024) guarantee default characters (Y: 256..928) are never overwritten!
 */
export async function compositeCharacterMenuPng(gamePath, character, nameplateBuffer, portraitBuffer, itemInfo = null, twinItemInfo = null) {
  const candidates = [
    path.join(ASSETS_DIR, 'ui', 'templates', 'charactermenu.png'),
    path.join(ASSETS_DIR, 'ui', 'charactermenu.png'),
    path.join(gamePath || '', 'extracted_resources', 'resources-dlc3', 'gfx', 'ui', 'main menu', 'charactermenu.png'),
    path.join(gamePath || '', 'extracted_resources', 'resources', 'gfx', 'ui', 'main menu', 'charactermenu.png'),
    path.join(gamePath || '', 'resources-dlc3', 'gfx', 'ui', 'main menu', 'charactermenu.png'),
    path.join(gamePath || '', 'resources', 'gfx', 'ui', 'main menu', 'charactermenu.png'),
    path.join(gamePath || '', 'resources_repentance', 'gfx', 'ui', 'main menu', 'charactermenu.png')
  ];

  let baseBuf = null;
  for (const src of candidates) {
    if (await fs.pathExists(src)) {
      baseBuf = await fs.readFile(src);
      break;
    }
  }

  if (!baseBuf) {
    return null;
  }

  try {
    const basePng = safeReadPng(baseBuf);
    const nBuf = nameplateBuffer || generateServerNameplatePng(character.name || 'CustomChar');
    const namePng = safeReadPng(nBuf);

    // 1. Composite nameplate at dedicated safe area X: 0, Y: 960 (104x32)
    const destX = CUSTOM_NAMEPLATE_CROP.x;
    const destY = CUSTOM_NAMEPLATE_CROP.y;
    const targetW = CUSTOM_NAMEPLATE_CROP.w;
    const targetH = CUSTOM_NAMEPLATE_CROP.h;

    // Clear target nameplate area
    for (let y = 0; y < targetH; y++) {
      for (let x = 0; x < targetW; x++) {
        const idx = ((destY + y) * basePng.width + (destX + x)) * 4;
        basePng.data[idx] = 0;
        basePng.data[idx + 1] = 0;
        basePng.data[idx + 2] = 0;
        basePng.data[idx + 3] = 0;
      }
    }

    // Scale and blend nameplate
    for (let y = 0; y < targetH; y++) {
      const srcY = Math.floor((y / targetH) * namePng.height);
      for (let x = 0; x < targetW; x++) {
        const srcX = Math.floor((x / targetW) * namePng.width);
        const srcIdx = (srcY * namePng.width + srcX) * 4;
        const alpha = namePng.data[srcIdx + 3];
        if (alpha > 20) {
          const destIdx = ((destY + y) * basePng.width + (destX + x)) * 4;
          basePng.data[destIdx] = namePng.data[srcIdx];
          basePng.data[destIdx + 1] = namePng.data[srcIdx + 1];
          basePng.data[destIdx + 2] = namePng.data[srcIdx + 2];
          basePng.data[destIdx + 3] = alpha;
        }
      }
    }

    // 2. Composite Custom Portrait at dedicated safe area X: 112, Y: 960 (48x48)
    if (portraitBuffer && portraitBuffer.length > 50) {
      try {
        const portPng = safeReadPng(portraitBuffer);
        const pDestX = CUSTOM_PORTRAIT_CROP.x;
        const pDestY = CUSTOM_PORTRAIT_CROP.y;
        const pSize = 48;

        // Clear target portrait area
        for (let y = 0; y < pSize; y++) {
          for (let x = 0; x < pSize; x++) {
            const idx = ((pDestY + y) * basePng.width + (pDestX + x)) * 4;
            basePng.data[idx] = 0;
            basePng.data[idx + 1] = 0;
            basePng.data[idx + 2] = 0;
            basePng.data[idx + 3] = 0;
          }
        }

        // Scale and blend portrait
        for (let y = 0; y < pSize; y++) {
          const srcY = Math.min(portPng.height - 1, Math.floor((y / pSize) * portPng.height));
          for (let x = 0; x < pSize; x++) {
            const srcX = Math.min(portPng.width - 1, Math.floor((x / pSize) * portPng.width));
            const srcIdx = (srcY * portPng.width + srcX) * 4;
            const alpha = portPng.data[srcIdx + 3];
            if (alpha > 10) {
              const destIdx = ((pDestY + y) * basePng.width + (pDestX + x)) * 4;
              basePng.data[destIdx] = portPng.data[srcIdx];
              basePng.data[destIdx + 1] = portPng.data[srcIdx + 1];
              basePng.data[destIdx + 2] = portPng.data[srcIdx + 2];
              basePng.data[destIdx + 3] = alpha;
            }
          }
        }
      } catch (e) {
        console.warn('Could not composite custom portrait into charactermenu.png:', e.message);
      }
    }

    // 3. Composite Primary Starting Active Item Icon (160, 960, 32x32) and Item Name (192, 960, 120x32)
    if (itemInfo) {
      if (itemInfo.iconBuffer) {
        try {
          const iconPng = safeReadPng(itemInfo.iconBuffer);
          const iDestX = CUSTOM_ITEM_ICON_CROP.x;
          const iDestY = CUSTOM_ITEM_ICON_CROP.y;
          const iSize = 32;

          for (let y = 0; y < iSize; y++) {
            for (let x = 0; x < iSize; x++) {
              const idx = ((iDestY + y) * basePng.width + (iDestX + x)) * 4;
              basePng.data[idx] = 0;
              basePng.data[idx + 1] = 0;
              basePng.data[idx + 2] = 0;
              basePng.data[idx + 3] = 0;
            }
          }

          for (let y = 0; y < iSize; y++) {
            const srcY = Math.min(iconPng.height - 1, Math.floor((y / iSize) * iconPng.height));
            for (let x = 0; x < iSize; x++) {
              const srcX = Math.min(iconPng.width - 1, Math.floor((x / iSize) * iconPng.width));
              const srcIdx = (srcY * iconPng.width + srcX) * 4;
              const alpha = iconPng.data[srcIdx + 3];
              if (alpha > 10) {
                const destIdx = ((iDestY + y) * basePng.width + (iDestX + x)) * 4;
                basePng.data[destIdx] = iconPng.data[srcIdx];
                basePng.data[destIdx + 1] = iconPng.data[srcIdx + 1];
                basePng.data[destIdx + 2] = iconPng.data[srcIdx + 2];
                basePng.data[destIdx + 3] = alpha;
              }
            }
          }
        } catch (e) {
          console.warn('Could not composite item icon into charactermenu.png:', e.message);
        }
      }

      if (itemInfo.itemNameplateBuffer) {
        try {
          const itemNamePng = safeReadPng(itemInfo.itemNameplateBuffer);
          const nDestX = CUSTOM_ITEM_NAME_CROP.x;
          const nDestY = CUSTOM_ITEM_NAME_CROP.y;
          const nTargetW = CUSTOM_ITEM_NAME_CROP.w;
          const nTargetH = CUSTOM_ITEM_NAME_CROP.h;

          for (let y = 0; y < nTargetH; y++) {
            for (let x = 0; x < nTargetW; x++) {
              const idx = ((nDestY + y) * basePng.width + (nDestX + x)) * 4;
              basePng.data[idx] = 0;
              basePng.data[idx + 1] = 0;
              basePng.data[idx + 2] = 0;
              basePng.data[idx + 3] = 0;
            }
          }

          for (let y = 0; y < nTargetH; y++) {
            const srcY = Math.floor((y / nTargetH) * itemNamePng.height);
            for (let x = 0; x < nTargetW; x++) {
              const srcX = Math.floor((x / nTargetW) * itemNamePng.width);
              const srcIdx = (srcY * itemNamePng.width + srcX) * 4;
              const alpha = itemNamePng.data[srcIdx + 3];
              if (alpha > 20) {
                const destIdx = ((nDestY + y) * basePng.width + (nDestX + x)) * 4;
                basePng.data[destIdx] = itemNamePng.data[srcIdx];
                basePng.data[destIdx + 1] = itemNamePng.data[srcIdx + 1];
                basePng.data[destIdx + 2] = itemNamePng.data[srcIdx + 2];
                basePng.data[destIdx + 3] = alpha;
              }
            }
          }
        } catch (e) {
          console.warn('Could not composite item nameplate into charactermenu.png:', e.message);
        }
      }
    }

    // 4. Composite Second Character (Twin) Starting Item Icon (312, 960, 32x32) and Item Name (344, 960, 120x32)
    if (twinItemInfo) {
      if (twinItemInfo.iconBuffer) {
        try {
          const iconPng = safeReadPng(twinItemInfo.iconBuffer);
          const iDestX = CUSTOM_TWIN_ITEM_ICON_CROP.x;
          const iDestY = CUSTOM_TWIN_ITEM_ICON_CROP.y;
          const iSize = 32;

          for (let y = 0; y < iSize; y++) {
            for (let x = 0; x < iSize; x++) {
              const idx = ((iDestY + y) * basePng.width + (iDestX + x)) * 4;
              basePng.data[idx] = 0;
              basePng.data[idx + 1] = 0;
              basePng.data[idx + 2] = 0;
              basePng.data[idx + 3] = 0;
            }
          }

          for (let y = 0; y < iSize; y++) {
            const srcY = Math.min(iconPng.height - 1, Math.floor((y / iSize) * iconPng.height));
            for (let x = 0; x < iSize; x++) {
              const srcX = Math.min(iconPng.width - 1, Math.floor((x / iSize) * iconPng.width));
              const srcIdx = (srcY * iconPng.width + srcX) * 4;
              const alpha = iconPng.data[srcIdx + 3];
              if (alpha > 10) {
                const destIdx = ((iDestY + y) * basePng.width + (iDestX + x)) * 4;
                basePng.data[destIdx] = iconPng.data[srcIdx];
                basePng.data[destIdx + 1] = iconPng.data[srcIdx + 1];
                basePng.data[destIdx + 2] = iconPng.data[srcIdx + 2];
                basePng.data[destIdx + 3] = alpha;
              }
            }
          }
        } catch (e) {
          console.warn('Could not composite twin item icon into charactermenu.png:', e.message);
        }
      }

      if (twinItemInfo.itemNameplateBuffer) {
        try {
          const itemNamePng = safeReadPng(twinItemInfo.itemNameplateBuffer);
          const nDestX = CUSTOM_TWIN_ITEM_NAME_CROP.x;
          const nDestY = CUSTOM_TWIN_ITEM_NAME_CROP.y;
          const nTargetW = CUSTOM_TWIN_ITEM_NAME_CROP.w;
          const nTargetH = CUSTOM_TWIN_ITEM_NAME_CROP.h;

          for (let y = 0; y < nTargetH; y++) {
            for (let x = 0; x < nTargetW; x++) {
              const idx = ((nDestY + y) * basePng.width + (nDestX + x)) * 4;
              basePng.data[idx] = 0;
              basePng.data[idx + 1] = 0;
              basePng.data[idx + 2] = 0;
              basePng.data[idx + 3] = 0;
            }
          }

          for (let y = 0; y < nTargetH; y++) {
            const srcY = Math.floor((y / nTargetH) * itemNamePng.height);
            for (let x = 0; x < nTargetW; x++) {
              const srcX = Math.floor((x / nTargetW) * itemNamePng.width);
              const srcIdx = (srcY * itemNamePng.width + srcX) * 4;
              const alpha = itemNamePng.data[srcIdx + 3];
              if (alpha > 20) {
                const destIdx = ((nDestY + y) * basePng.width + (nDestX + x)) * 4;
                basePng.data[destIdx] = itemNamePng.data[srcIdx];
                basePng.data[destIdx + 1] = itemNamePng.data[srcIdx + 1];
                basePng.data[destIdx + 2] = itemNamePng.data[srcIdx + 2];
                basePng.data[destIdx + 3] = alpha;
              }
            }
          }
        } catch (e) {
          console.warn('Could not composite twin item nameplate into charactermenu.png:', e.message);
        }
      }
    }

    return PNG.sync.write(basePng);
  } catch (err) {
    console.error('Error compositing charactermenu.png:', err);
    return null;
  }
}

/**
 * Loads a base vanilla anm2 XML template
 */
export async function getBaseAnm2Template(filename, gamePath) {
  const candidates = [
    path.join(ASSETS_DIR, 'ui', 'templates', filename),
    path.join(gamePath || '', 'extracted_resources', 'resources-dlc3', 'gfx', 'ui', 'main menu', filename),
    path.join(gamePath || '', 'extracted_resources', 'resources', 'gfx', 'ui', 'main menu', filename),
    path.join(gamePath || '', 'resources-dlc3', 'gfx', 'ui', 'main menu', filename),
    path.join(gamePath || '', 'resources', 'gfx', 'ui', 'main menu', filename),
    path.join(gamePath || '', 'resources_repentance', 'gfx', 'ui', 'main menu', filename),
    path.join(gamePath || '', 'extracted_resources', 'resources', 'gfx', 'ui', filename),
    path.join(gamePath || '', 'resources', 'gfx', 'ui', filename)
  ];

  for (const c of candidates) {
    if (await fs.pathExists(c)) {
      const txt = await fs.readFile(c, 'utf8').catch(() => null);
      if (txt && txt.length > 500) {
        return txt;
      }
    }
  }
  return null;
}

/**
 * Escapes special XML characters to prevent corrupting ANM2 XML files
 */
export function escapeXml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Composites coop menu.png preserving vanilla character heads and adding custom character heads at x=192
 */
export async function compositeCoopMenuPng(gamePath, characters, skinBuffers = []) {
  try {
    const chars = Array.isArray(characters) ? characters : [characters];
    const coopWidth = 256;
    const coopHeight = 256;
    const coopPng = new PNG({ width: coopWidth, height: coopHeight });

    // Initialize transparent
    for (let i = 0; i < coopPng.data.length; i += 4) {
      coopPng.data[i] = 0;
      coopPng.data[i + 1] = 0;
      coopPng.data[i + 2] = 0;
      coopPng.data[i + 3] = 0;
    }

    // Load authentic base vanilla coop menu template (contains all vanilla character heads)
    const baseCandidate = path.join(ASSETS_DIR, 'ui', 'templates', 'coop menu.png');
    if (await fs.pathExists(baseCandidate)) {
      try {
        const baseBuf = await fs.readFile(baseCandidate);
        const baseLoaded = PNG.sync.read(baseBuf);
        for (let y = 0; y < Math.min(baseLoaded.height, coopHeight); y++) {
          for (let x = 0; x < Math.min(baseLoaded.width, coopWidth); x++) {
            const sIdx = (y * baseLoaded.width + x) * 4;
            const dIdx = (y * coopPng.width + x) * 4;
            coopPng.data[dIdx] = baseLoaded.data[sIdx];
            coopPng.data[dIdx + 1] = baseLoaded.data[sIdx + 1];
            coopPng.data[dIdx + 2] = baseLoaded.data[sIdx + 2];
            coopPng.data[dIdx + 3] = baseLoaded.data[sIdx + 3];
          }
        }
      } catch (e) {}
    }

    // Composite 32x32 modified heads from custom character sprite sheets in open column 6 (x=192)
    let slotIndex = 0;
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const sBuf = skinBuffers[i] || null;
      let skinPng = null;

      if (sBuf && sBuf.length > 0) {
        try { skinPng = PNG.sync.read(sBuf); } catch (e) {}
      }

      if (!skinPng) {
        const selectedSkin = char.baseSkin || char.skin || 'character_001_isaac.png';
        const cand = path.join(ASSETS_DIR, 'characters', selectedSkin);
        if (await fs.pathExists(cand)) {
          try {
            const raw = await fs.readFile(cand);
            skinPng = PNG.sync.read(raw);
          } catch (e) {}
        }
      }

      const cropX = 192;
      const cropY = Math.min(224, slotIndex * 32);
      slotIndex++;

      if (skinPng) {
        const headSize = 32;
        for (let y = 0; y < headSize; y++) {
          for (let x = 0; x < headSize; x++) {
            if (x < skinPng.width && y < skinPng.height) {
              const srcIdx = (y * skinPng.width + x) * 4;
              const alpha = skinPng.data[srcIdx + 3];
              if (alpha > 10) {
                const destIdx = ((cropY + y) * coopPng.width + (cropX + x)) * 4;
                coopPng.data[destIdx] = skinPng.data[srcIdx];
                coopPng.data[destIdx + 1] = skinPng.data[srcIdx + 1];
                coopPng.data[destIdx + 2] = skinPng.data[srcIdx + 2];
                coopPng.data[destIdx + 3] = alpha;
              }
            }
          }
        }
      }

      // If dual character, also composite twin's head in next slot
      if (char.isDual && (char.twinSkin || skinBuffers[i + 1])) {
        let twinSkinPng = null;
        const tBuf = skinBuffers[i + 1] || null;
        if (tBuf && tBuf.length > 0) {
          try { twinSkinPng = PNG.sync.read(tBuf); } catch (e) {}
        }
        if (!twinSkinPng) {
          const twinSkinFile = char.twinSkin || 'character_003x_esau.png';
          const cand = path.join(ASSETS_DIR, 'characters', twinSkinFile);
          if (await fs.pathExists(cand)) {
            try {
              const raw = await fs.readFile(cand);
              twinSkinPng = PNG.sync.read(raw);
            } catch (e) {}
          }
        }

        const tCropX = 192;
        const tCropY = Math.min(224, slotIndex * 32);
        slotIndex++;

        if (twinSkinPng) {
          const headSize = 32;
          for (let y = 0; y < headSize; y++) {
            for (let x = 0; x < headSize; x++) {
              if (x < twinSkinPng.width && y < twinSkinPng.height) {
                const srcIdx = (y * twinSkinPng.width + x) * 4;
                const alpha = twinSkinPng.data[srcIdx + 3];
                if (alpha > 10) {
                  const destIdx = ((tCropY + y) * coopPng.width + (tCropX + x)) * 4;
                  coopPng.data[destIdx] = twinSkinPng.data[srcIdx];
                  coopPng.data[destIdx + 1] = twinSkinPng.data[srcIdx + 1];
                  coopPng.data[destIdx + 2] = twinSkinPng.data[srcIdx + 2];
                  coopPng.data[destIdx + 3] = alpha;
                }
              }
            }
          }
        }
      }
    }

    return PNG.sync.write(coopPng);
  } catch (err) {
    console.error('Error compositing coop menu.png:', err);
    return null;
  }
}

/**
 * Generates characterportraits.anm2 for character select ring icon
 */
export function generateCharacterPortraitsAnm2(characters, hasCustomPortraitComposite = false, baseXml = null) {
  const chars = Array.isArray(characters) ? characters : [characters];
  const animEntries = chars.map(char => {
    const rawName = (char.name || 'CustomCharacter').trim();
    const effectiveSkin = char.baseSkin || char.skin || 'character_001_isaac.png';
    let crop = PORTRAIT_CROPS[effectiveSkin];

    if (hasCustomPortraitComposite || char.hasCustomPortrait || char.customPortraitDataUrl || !crop) {
      crop = (hasCustomPortraitComposite || char.hasCustomPortrait || char.customPortraitDataUrl)
        ? CUSTOM_PORTRAIT_CROP
        : (PORTRAIT_CROPS[effectiveSkin] || PORTRAIT_CROPS['character_001_isaac.png']);
    }

    return `\t\t<Animation Name="${escapeXml(rawName)}" FrameNum="1" Loop="false">
\t\t\t<RootAnimation>
\t\t\t\t<Frame XPosition="0" YPosition="0" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t</RootAnimation>
\t\t\t<LayerAnimations>
\t\t\t\t<LayerAnimation LayerId="0" Visible="true">
\t\t\t\t\t<Frame XPosition="0" YPosition="0" XPivot="24" YPivot="24" XCrop="${crop.x}" YCrop="${crop.y}" Width="${crop.w}" Height="${crop.h}" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</LayerAnimation>
\t\t\t</LayerAnimations>
\t\t\t<NullAnimations/>
\t\t\t<Triggers/>
\t\t</Animation>`;
  }).join('\n');

  const randomAnim = `\t\t<Animation Name="00_Random" FrameNum="1" Loop="false">
\t\t\t<RootAnimation>
\t\t\t\t<Frame XPosition="0" YPosition="0" Delay="1" Visible="true" XScale="100" YScale="100" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t</RootAnimation>
\t\t\t<LayerAnimations>
\t\t\t\t<LayerAnimation LayerId="0" Visible="true">
\t\t\t\t\t<Frame XPosition="0" YPosition="0" XPivot="24" YPivot="24" XCrop="224" YCrop="432" Width="48" Height="48" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</LayerAnimation>
\t\t\t</LayerAnimations>
\t\t\t<NullAnimations/>
\t\t\t<Triggers/>
\t\t</Animation>`;

  const defaultName = chars[0]?.name || 'CustomCharacter';

  return `<AnimatedActor>
\t<Info CreatedBy="Isaac Character Studio" CreatedOn="2026-08-30" Version="18" Fps="30"/>
\t<Content>
\t\t<Spritesheets>
\t\t\t<Spritesheet Path="charactermenu.png" Id="0"/>
\t\t</Spritesheets>
\t\t<Layers>
\t\t\t<Layer Name="Portrait" Id="0" SpritesheetId="0"/>
\t\t</Layers>
\t\t<Nulls/>
\t\t<Events/>
\t</Content>
\t<Animations DefaultAnimation="${escapeXml(defaultName)}">
${animEntries}
${randomAnim}
\t</Animations>
</AnimatedActor>
`;
}

/**
 * Generates charactermenu.anm2 for rendering the entire character select sheet (paper, name, stats icons, stat bars, active item)
 * Includes essential Greed mode, BloodStain, and 00_Random animations to prevent game crashes in Greed/Greedier modes.
 */
export function generateCharacterMenuAnm2(characters, hasStartingItem = false, hasTwinStartingItem = false, baseXml = null) {
  const chars = Array.isArray(characters) ? characters : [characters];
  const animEntries = chars.map(char => {
    const rawName = (char.name || 'CustomCharacter').trim();
    const lifeCrop = getLifeStatCrop(char);
    const speedCrop = getSpeedStatCrop(char);
    const damageCrop = getDamageStatCrop(char);

    const hasItem = hasStartingItem ||
                    (char.pocketactive && Number(char.pocketactive) > 0) ||
                    (char.pocketitem && Number(char.pocketitem) > 0) ||
                    (Array.isArray(char.items) && char.items.length > 0) ||
                    (char.synergies && Array.isArray(char.synergies) && char.synergies.length > 0) ||
                    char.moddedPocketItemName ||
                    (Array.isArray(char.moddedItemsList) && char.moddedItemsList.length > 0);

    const hasTwinItem = hasTwinStartingItem ||
                        (char.twinPocketactive && Number(char.twinPocketactive) > 0) ||
                        (char.twinPocketitem && Number(char.twinPocketitem) > 0) ||
                        (Array.isArray(char.twinItems) && char.twinItems.length > 0) ||
                        char.twinModdedPocketItemName ||
                        (Array.isArray(char.twinModdedItemsList) && char.twinModdedItemsList.length > 0);

    const itemIconAnimation = hasItem
      ? `\t\t\t\t<LayerAnimation LayerId="7" Visible="true">
\t\t\t\t\t<Frame XPosition="172" YPosition="202" XPivot="16" YPivot="16" XCrop="${CUSTOM_ITEM_ICON_CROP.x}" YCrop="${CUSTOM_ITEM_ICON_CROP.y}" Width="${CUSTOM_ITEM_ICON_CROP.w}" Height="${CUSTOM_ITEM_ICON_CROP.h}" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</LayerAnimation>`
      : `\t\t\t\t<LayerAnimation LayerId="7" Visible="true">
\t\t\t\t\t<Frame XPosition="0" YPosition="0" XPivot="16" YPivot="16" XCrop="0" YCrop="0" Width="32" Height="32" XScale="100" YScale="100" Delay="1" Visible="false" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</LayerAnimation>`;

    const itemNameAnimation = hasItem
      ? `\t\t\t\t<LayerAnimation LayerId="8" Visible="true">
\t\t\t\t\t<Frame XPosition="203" YPosition="207" XPivot="16" YPivot="16" XCrop="${CUSTOM_ITEM_NAME_CROP.x}" YCrop="${CUSTOM_ITEM_NAME_CROP.y}" Width="${CUSTOM_ITEM_NAME_CROP.w}" Height="${CUSTOM_ITEM_NAME_CROP.h}" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</LayerAnimation>`
      : `\t\t\t\t<LayerAnimation LayerId="8" Visible="true">
\t\t\t\t\t<Frame XPosition="0" YPosition="0" XPivot="16" YPivot="16" XCrop="0" YCrop="0" Width="32" Height="32" XScale="100" YScale="100" Delay="1" Visible="false" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</LayerAnimation>`;

    const twinItemIconAnimation = (char.isDual && hasTwinItem)
      ? `\t\t\t\t<LayerAnimation LayerId="12" Visible="true">
\t\t\t\t\t<Frame XPosition="260" YPosition="202" XPivot="16" YPivot="16" XCrop="${CUSTOM_TWIN_ITEM_ICON_CROP.x}" YCrop="${CUSTOM_TWIN_ITEM_ICON_CROP.y}" Width="${CUSTOM_TWIN_ITEM_ICON_CROP.w}" Height="${CUSTOM_TWIN_ITEM_ICON_CROP.h}" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</LayerAnimation>`
      : `\t\t\t\t<LayerAnimation LayerId="12" Visible="true"/>`;

    const twinItemNameAnimation = (char.isDual && hasTwinItem)
      ? `\t\t\t\t<LayerAnimation LayerId="13" Visible="true">
\t\t\t\t\t<Frame XPosition="290" YPosition="207" XPivot="16" YPivot="16" XCrop="${CUSTOM_TWIN_ITEM_NAME_CROP.x}" YCrop="${CUSTOM_TWIN_ITEM_NAME_CROP.y}" Width="${CUSTOM_TWIN_ITEM_NAME_CROP.w}" Height="${CUSTOM_TWIN_ITEM_NAME_CROP.h}" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</LayerAnimation>`
      : `\t\t\t\t<LayerAnimation LayerId="13" Visible="true"/>`;

    return `\t\t<Animation Name="${escapeXml(rawName)}" FrameNum="1" Loop="false">
\t\t\t<RootAnimation>
\t\t\t\t<Frame XPosition="0" YPosition="0" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t</RootAnimation>
\t\t\t<LayerAnimations>
\t\t\t\t<LayerAnimation LayerId="0" Visible="true">
\t\t\t\t\t<Frame XPosition="0" YPosition="0" XPivot="0" YPivot="0" XCrop="0" YCrop="0" Width="480" Height="270" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</LayerAnimation>
\t\t\t\t<LayerAnimation LayerId="1" Visible="true">
\t\t\t\t\t<Frame XPosition="157" YPosition="140" XPivot="0" YPivot="0" XCrop="0" YCrop="272" Width="32" Height="16" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</LayerAnimation>
\t\t\t\t<LayerAnimation LayerId="2" Visible="true">
\t\t\t\t\t<Frame XPosition="291" YPosition="140" XPivot="0" YPivot="0" XCrop="32" YCrop="272" Width="32" Height="16" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</LayerAnimation>
\t\t\t\t<LayerAnimation LayerId="3" Visible="true">
\t\t\t\t\t<Frame XPosition="203" YPosition="148" XPivot="16" YPivot="16" XCrop="${CUSTOM_NAMEPLATE_CROP.x}" YCrop="${CUSTOM_NAMEPLATE_CROP.y}" Width="${CUSTOM_NAMEPLATE_CROP.w}" Height="${CUSTOM_NAMEPLATE_CROP.h}" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</LayerAnimation>
\t\t\t\t<LayerAnimation LayerId="4" Visible="true">
\t\t\t\t\t<Frame XPosition="167" YPosition="172" XPivot="16" YPivot="16" XCrop="80" YCrop="416" Width="32" Height="32" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</LayerAnimation>
\t\t\t\t<LayerAnimation LayerId="5" Visible="true">
\t\t\t\t\t<Frame XPosition="230" YPosition="172" XPivot="16" YPivot="16" XCrop="112" YCrop="416" Width="32" Height="32" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</LayerAnimation>
\t\t\t\t<LayerAnimation LayerId="6" Visible="true">
\t\t\t\t\t<Frame XPosition="291" YPosition="173" XPivot="16" YPivot="16" XCrop="112" YCrop="448" Width="32" Height="32" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</LayerAnimation>
${itemIconAnimation}
${itemNameAnimation}
\t\t\t\t<LayerAnimation LayerId="9" Visible="true">
\t\t\t\t\t<Frame XPosition="196" YPosition="172" XPivot="16" YPivot="16" XCrop="${lifeCrop.x}" YCrop="${lifeCrop.y}" Width="32" Height="32" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</LayerAnimation>
\t\t\t\t<LayerAnimation LayerId="10" Visible="true">
\t\t\t\t\t<Frame XPosition="260" YPosition="172" XPivot="16" YPivot="16" XCrop="${speedCrop.x}" YCrop="${speedCrop.y}" Width="32" Height="32" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</LayerAnimation>
\t\t\t\t<LayerAnimation LayerId="11" Visible="true">
\t\t\t\t\t<Frame XPosition="315" YPosition="172" XPivot="16" YPivot="16" XCrop="${damageCrop.x}" YCrop="${damageCrop.y}" Width="32" Height="32" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</LayerAnimation>
${twinItemIconAnimation}
${twinItemNameAnimation}
\t\t\t\t<LayerAnimation LayerId="14" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="15" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="16" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="17" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="18" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="20" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="19" Visible="true"/>
\t\t\t</LayerAnimations>
\t\t\t<NullAnimations/>
\t\t\t<Triggers/>
\t\t</Animation>`;
  }).join('\n');

  const systemAnimations = `\t\t<Animation Name="Greed" FrameNum="1" Loop="false">
\t\t\t<RootAnimation>
\t\t\t\t<Frame XPosition="0" YPosition="0" Delay="1" Visible="true" XScale="100" YScale="100" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t</RootAnimation>
\t\t\t<LayerAnimations>
\t\t\t\t<LayerAnimation LayerId="0" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="1" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="2" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="3" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="4" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="5" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="6" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="7" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="8" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="9" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="10" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="11" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="12" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="13" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="14" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="15" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="16" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="17" Visible="true">
\t\t\t\t\t<Frame XPosition="111" YPosition="219" XPivot="16" YPivot="16" XCrop="448" YCrop="640" Width="32" Height="32" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="90" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</LayerAnimation>
\t\t\t\t<LayerAnimation LayerId="18" Visible="true">
\t\t\t\t\t<Frame XPosition="363" YPosition="173" XPivot="16" YPivot="16" XCrop="448" YCrop="672" Width="32" Height="32" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="90" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</LayerAnimation>
\t\t\t\t<LayerAnimation LayerId="20" Visible="true">
\t\t\t\t\t<Frame XPosition="341" YPosition="18" XPivot="16" YPivot="16" XCrop="448" YCrop="704" Width="32" Height="32" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="90" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</LayerAnimation>
\t\t\t\t<LayerAnimation LayerId="19" Visible="true">
\t\t\t\t\t<Frame XPosition="0" YPosition="0" XPivot="0" YPivot="0" XCrop="467" YCrop="738" Width="10" Height="10" XScale="4800" YScale="2700" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="10" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</LayerAnimation>
\t\t\t</LayerAnimations>
\t\t\t<NullAnimations/>
\t\t\t<Triggers/>
\t\t</Animation>
\t\t<Animation Name="BloodStain" FrameNum="1" Loop="false">
\t\t\t<RootAnimation>
\t\t\t\t<Frame XPosition="0" YPosition="0" Delay="1" Visible="true" XScale="100" YScale="100" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t</RootAnimation>
\t\t\t<LayerAnimations>
\t\t\t\t<LayerAnimation LayerId="0" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="1" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="2" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="3" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="4" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="5" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="6" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="7" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="8" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="9" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="10" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="11" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="12" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="13" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="14" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="15" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="16" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="17" Visible="true">
\t\t\t\t\t<Frame XPosition="283" YPosition="219" XPivot="16" YPivot="16" XCrop="390" YCrop="480" Width="92" Height="61" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</LayerAnimation>
\t\t\t\t<LayerAnimation LayerId="18" Visible="true">
\t\t\t\t\t<Frame XPosition="157" YPosition="233" XPivot="16" YPivot="16" XCrop="345" YCrop="501" Width="44" Height="31" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</LayerAnimation>
\t\t\t\t<LayerAnimation LayerId="20" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="19" Visible="true"/>
\t\t\t</LayerAnimations>
\t\t\t<NullAnimations/>
\t\t\t<Triggers/>
\t\t</Animation>
\t\t<Animation Name="00_Random" FrameNum="1" Loop="false">
\t\t\t<RootAnimation>
\t\t\t\t<Frame XPosition="0" YPosition="0" Delay="1" Visible="true" XScale="100" YScale="100" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t</RootAnimation>
\t\t\t<LayerAnimations>
\t\t\t\t<LayerAnimation LayerId="0" Visible="true">
\t\t\t\t\t<Frame XPosition="0" YPosition="0" XPivot="0" YPivot="0" XCrop="0" YCrop="0" Width="480" Height="270" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</LayerAnimation>
\t\t\t\t<LayerAnimation LayerId="1" Visible="true">
\t\t\t\t\t<Frame XPosition="157" YPosition="140" XPivot="0" YPivot="0" XCrop="0" YCrop="272" Width="32" Height="16" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</LayerAnimation>
\t\t\t\t<LayerAnimation LayerId="2" Visible="true">
\t\t\t\t\t<Frame XPosition="291" YPosition="140" XPivot="0" YPivot="0" XCrop="32" YCrop="272" Width="32" Height="16" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</LayerAnimation>
\t\t\t\t<LayerAnimation LayerId="3" Visible="true">
\t\t\t\t\t<Frame XPosition="213" YPosition="148" XPivot="16" YPivot="16" XCrop="432" YCrop="992" Width="80" Height="32" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</LayerAnimation>
\t\t\t\t<LayerAnimation LayerId="4" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="5" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="6" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="7" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="8" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="9" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="10" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="11" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="12" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="13" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="14" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="15" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="16" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="17" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="18" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="20" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="19" Visible="true"/>
\t\t\t</LayerAnimations>
\t\t\t<NullAnimations/>
\t\t\t<Triggers/>
\t\t</Animation>`;

  const defaultName = chars[0]?.name || 'CustomCharacter';

  return `<AnimatedActor>
\t<Info CreatedBy="Isaac Character Studio" CreatedOn="2026-08-30" Version="52" Fps="30"/>
\t<Content>
\t\t<Spritesheets>
\t\t\t<Spritesheet Path="charactermenu.png" Id="0"/>
\t\t</Spritesheets>
\t\t<Layers>
\t\t\t<Layer Name="Background" Id="0" SpritesheetId="0"/>
\t\t\t<Layer Name="Left Arrow" Id="1" SpritesheetId="0"/>
\t\t\t<Layer Name="Right Arrow" Id="2" SpritesheetId="0"/>
\t\t\t<Layer Name="Name" Id="3" SpritesheetId="0"/>
\t\t\t<Layer Name="Life Icon" Id="4" SpritesheetId="0"/>
\t\t\t<Layer Name="Speed Icon" Id="5" SpritesheetId="0"/>
\t\t\t<Layer Name="Power Icon" Id="6" SpritesheetId="0"/>
\t\t\t<Layer Name="Item Icon" Id="7" SpritesheetId="0"/>
\t\t\t<Layer Name="Item Name" Id="8" SpritesheetId="0"/>
\t\t\t<Layer Name="Life Stat" Id="9" SpritesheetId="0"/>
\t\t\t<Layer Name="Speed Stat" Id="10" SpritesheetId="0"/>
\t\t\t<Layer Name="Power Stat" Id="11" SpritesheetId="0"/>
\t\t\t<Layer Name="Item Icon 2" Id="12" SpritesheetId="0"/>
\t\t\t<Layer Name="Item Name 2" Id="13" SpritesheetId="0"/>
\t\t\t<Layer Name="Item Icon 3" Id="14" SpritesheetId="0"/>
\t\t\t<Layer Name="Item Name 3" Id="15" SpritesheetId="0"/>
\t\t\t<Layer Name="Unlocked By" Id="16" SpritesheetId="0"/>
\t\t\t<Layer Name="Blood" Id="17" SpritesheetId="0"/>
\t\t\t<Layer Name="Blood2" Id="18" SpritesheetId="0"/>
\t\t\t<Layer Name="Overlay" Id="19" SpritesheetId="0"/>
\t\t\t<Layer Name="Blood3" Id="20" SpritesheetId="0"/>
\t\t</Layers>
\t\t<Nulls/>
\t\t<Events>
\t\t\t<Event Name="Sound" Id="0"/>
\t\t</Events>
\t</Content>
\t<Animations DefaultAnimation="${escapeXml(defaultName)}">
${animEntries}
${systemAnimations}
\t</Animations>
</AnimatedActor>
`;
}

/**
 * Generates coop menu.anm2 for player 2/3/4 co-op character select
 * Preserves vanilla Main frames & baby animations, and appends custom character frames.
 */
export function generateCoopMenuAnm2(characters, baseXml = null) {
  const chars = Array.isArray(characters) ? characters : [characters];
  let baseTemplate = '';
  const templatePath = path.join(ASSETS_DIR, 'ui', 'templates', 'coop menu.anm2');
  if (fs.existsSync(templatePath)) {
    try {
      baseTemplate = fs.readFileSync(templatePath, 'utf8');
    } catch (e) {}
  }

  let slotIndex = 0;
  const customAnimations = [];
  const customFrames = [];

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    let rawName = (char.name || 'CustomCharacter').trim();
    let secondaryName = char.twinName ? String(char.twinName).trim() : '';
    if (char.isDual) {
      if (!rawName.includes('&')) {
        if (secondaryName) {
          rawName = `${rawName} & ${secondaryName}`;
        } else {
          secondaryName = 'Isaac';
          rawName = `${rawName} & ${secondaryName}`;
        }
      } else if (!secondaryName) {
        const parts = rawName.split('&').map(s => s.trim());
        if (parts.length > 1 && parts[1]) {
          secondaryName = parts[1];
        } else {
          secondaryName = 'Isaac';
        }
      }
    }
    const cropX = 192;
    const cropY = Math.min(224, slotIndex * 32);
    slotIndex++;

    customAnimations.push(`\t\t<Animation Name="${escapeXml(rawName)}" FrameNum="1" Loop="false">
\t\t\t<RootAnimation>
\t\t\t\t<Frame XPosition="0" YPosition="0" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t</RootAnimation>
\t\t\t<LayerAnimations>
\t\t\t\t<LayerAnimation LayerId="0" Visible="true">
\t\t\t\t\t<Frame XPosition="0" YPosition="0" XPivot="16" YPivot="16" XCrop="${cropX}" YCrop="${cropY}" Width="32" Height="32" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</LayerAnimation>
\t\t\t\t<LayerAnimation LayerId="1" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="2" Visible="true"/>
\t\t\t</LayerAnimations>
\t\t\t<NullAnimations/>
\t\t\t<Triggers/>
\t\t</Animation>`);

    customFrames.push(`\t\t\t\t\t<Frame XPosition="0" YPosition="0" XPivot="16" YPivot="16" XCrop="${cropX}" YCrop="${cropY}" Width="32" Height="32" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>`);

    if (char.isDual) {
      const twinName = `${rawName} (${secondaryName})`;
      const tCropX = 192;
      const tCropY = Math.min(224, slotIndex * 32);
      slotIndex++;

      customAnimations.push(`\t\t<Animation Name="${escapeXml(twinName)}" FrameNum="1" Loop="false">
\t\t\t<RootAnimation>
\t\t\t\t<Frame XPosition="0" YPosition="0" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t</RootAnimation>
\t\t\t<LayerAnimations>
\t\t\t\t<LayerAnimation LayerId="0" Visible="true">
\t\t\t\t\t<Frame XPosition="0" YPosition="0" XPivot="16" YPivot="16" XCrop="${tCropX}" YCrop="${tCropY}" Width="32" Height="32" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</LayerAnimation>
\t\t\t\t<LayerAnimation LayerId="1" Visible="true"/>
\t\t\t\t<LayerAnimation LayerId="2" Visible="true"/>
\t\t\t</LayerAnimations>
\t\t\t<NullAnimations/>
\t\t\t<Triggers/>
\t\t</Animation>`);

      customFrames.push(`\t\t\t\t\t<Frame XPosition="0" YPosition="0" XPivot="16" YPivot="16" XCrop="${tCropX}" YCrop="${tCropY}" Width="32" Height="32" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>`);
    }
  }

  if (baseTemplate && baseTemplate.includes('<Animation Name="Main"')) {
    let updated = baseTemplate;
    updated = updated.replace(/<Animation Name="Main" FrameNum="(\d+)"/, (m, num) => `<Animation Name="Main" FrameNum="${Number(num) + customFrames.length}"`);
    const layer0EndIdx = updated.indexOf('</LayerAnimation>');
    if (layer0EndIdx !== -1) {
      updated = updated.slice(0, layer0EndIdx) + '\n' + customFrames.join('\n') + '\n\t\t\t\t' + updated.slice(layer0EndIdx);
    }
    const animsEndIdx = updated.lastIndexOf('</Animations>');
    if (animsEndIdx !== -1) {
      updated = updated.slice(0, animsEndIdx) + customAnimations.join('\n') + '\n\t' + updated.slice(animsEndIdx);
    }
    return updated;
  }

  // Fallback if template missing
  const arrowsAnim = `\t\t<Animation Name="Arrows" FrameNum="2" Loop="true">
\t\t\t<RootAnimation>
\t\t\t\t<Frame XPosition="0" YPosition="0" XScale="100" YScale="100" Delay="2" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t</RootAnimation>
\t\t\t<LayerAnimations>
\t\t\t\t<LayerAnimation LayerId="0" Visible="true">
\t\t\t\t\t<Frame XPosition="2" YPosition="0" XPivot="0" YPivot="16" XCrop="160" YCrop="96" Width="32" Height="32" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t\t<Frame XPosition="3" YPosition="0" XPivot="0" YPivot="16" XCrop="160" YCrop="96" Width="32" Height="32" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</LayerAnimation>
\t\t\t\t<LayerAnimation LayerId="2" Visible="true">
\t\t\t\t\t<Frame XPosition="-2" YPosition="0" XPivot="32" YPivot="16" XCrop="128" YCrop="96" Width="32" Height="32" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t\t<Frame XPosition="-3" YPosition="0" XPivot="32" YPivot="16" XCrop="128" YCrop="96" Width="32" Height="32" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</LayerAnimation>
\t\t\t</LayerAnimations>
\t\t\t<NullAnimations/>
\t\t\t<Triggers/>
\t\t</Animation>`;

  const defaultName = chars[0]?.name || 'CustomCharacter';
  return `<AnimatedActor>
\t<Info CreatedBy="Isaac Character Studio" CreatedOn="2026-08-30" Version="12" Fps="30"/>
\t<Content>
\t\t<Spritesheets>
\t\t\t<Spritesheet Path="coop menu.png" Id="0"/>
\t\t\t<Spritesheet Path="baby_select.png" Id="1"/>
\t\t</Spritesheets>
\t\t<Layers>
\t\t\t<Layer Name="Main" Id="0" SpritesheetId="0"/>
\t\t\t<Layer Name="Babies" Id="1" SpritesheetId="1"/>
\t\t\t<Layer Name="Arrows" Id="2" SpritesheetId="0"/>
\t\t</Layers>
\t\t<Nulls/>
\t\t<Events/>
\t</Content>
\t<Animations DefaultAnimation="${escapeXml(defaultName)}">
${customAnimations.join('\n')}
${arrowsAnim}
\t</Animations>
</AnimatedActor>
`;
}

export function generateDeathScreenAnm2(characters, baseXml = null) {
  const chars = Array.isArray(characters) ? characters : [characters];
  const animEntries = chars.map(char => {
    const rawName = (char.name || 'CustomCharacter').trim();
    return `\t\t<Animation Name="${escapeXml(rawName)}" FrameNum="441" Loop="true">
\t\t\t<RootAnimation>
\t\t\t\t<Frame XPosition="0" YPosition="0" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t</RootAnimation>
\t\t\t<LayerAnimations>
\t\t\t\t<LayerAnimation LayerId="0" Visible="true">
\t\t\t\t\t<Frame XPosition="17" YPosition="82" XPivot="32" YPivot="8" XCrop="0" YCrop="128" Width="65" Height="16" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</LayerAnimation>
\t\t\t</LayerAnimations>
\t\t\t<NullAnimations>
\t\t\t\t<NullAnimation NullId="0" Visible="true">
\t\t\t\t\t<Frame XPosition="-146" YPosition="-73" XScale="100" YScale="100" Delay="1" Visible="true" RedTint="255" GreenTint="255" BlueTint="255" AlphaTint="255" RedOffset="0" GreenOffset="0" BlueOffset="0" Rotation="0" Interpolated="false"/>
\t\t\t\t</NullAnimation>
\t\t\t</NullAnimations>
\t\t\t<Triggers/>
\t\t</Animation>`;
  }).join('\n');

  const defaultName = chars[0]?.name || 'CustomCharacter';

  return `<AnimatedActor>
\t<Info CreatedBy="Isaac Character Studio" CreatedOn="2026-08-30" Version="30" Fps="30"/>
\t<Content>
\t\t<Spritesheets>
\t\t\t<Spritesheet Path="deathportraits.png" Id="0"/>
\t\t</Spritesheets>
\t\t<Layers>
\t\t\t<Layer Name="Name" Id="0" SpritesheetId="0"/>
\t\t</Layers>
\t\t<Nulls>
\t\t\t<Null Name="SeedPos" Id="0" ShowRect="false"/>
\t\t</Nulls>
\t\t<Events/>
\t</Content>
\t<Animations DefaultAnimation="${escapeXml(defaultName)}">
${animEntries}
\t</Animations>
</AnimatedActor>
`;
}

/**
 * Generates and installs complete, crash-proof character menu assets:
 * 1. charactermenu.png (Composited nameplate, portrait, active item/synergy icon, and handwritten item label)
 * 2. charactermenu.anm2 (Standalone custom character animation + Greed/BloodStain/00_Random)
 * 3. charactermenualt.anm2 (Standalone custom tainted character animation + Greed/BloodStain/00_Random)
 * 4. characterportraits.anm2 (Standalone custom character wheel icon + 00_Random)
 * 5. characterportraitsalt.anm2 (Standalone custom tainted wheel icon + 00_Random)
 * 6. coop menu.png & coop menu.anm2 (Merged co-op character select with head extracted from modified character sprite sheet)
 * 7. death screen.anm2 (Merged death screen notes)
 * 
 * Installed into BOTH content/gfx and resources/gfx/ui/main menu/ for 100% Repentance & Repentance+ compatibility.
 */
export async function installCharacterMenuAnm2Assets(targetDir, characters, gamePath, nameplateBuffer, explicitPortraitBuffer = null, skinBuffer = null, twinSkinBuffer = null) {
  const chars = Array.isArray(characters) ? characters : [characters];
  if (chars.length === 0) return;

  const primaryChar = chars[0];
  const contentGfxDir = path.join(targetDir, 'content', 'gfx');
  const resMainMenuDir = path.join(targetDir, 'resources', 'gfx', 'ui', 'main menu');
  const resUiDir = path.join(targetDir, 'resources', 'gfx', 'ui');

  await fs.ensureDir(contentGfxDir);
  await fs.ensureDir(resMainMenuDir);

  // 1. Clean any dangerous ANM2 overrides from resources/gfx/ui/ that crash Isaac
  const dangerousOverrides = [
    path.join(resUiDir, 'death screen.anm2'),
    path.join(resUiDir, 'coop menu.anm2'),
    path.join(resMainMenuDir, 'charactermenu.anm2'),
    path.join(resMainMenuDir, 'charactermenualt.anm2'),
    path.join(resMainMenuDir, 'characterportraits.anm2'),
    path.join(resMainMenuDir, 'characterportraitsalt.anm2'),
    path.join(resMainMenuDir, 'coop menu.anm2'),
    path.join(resMainMenuDir, 'death screen.anm2')
  ];
  for (const f of dangerousOverrides) {
    await fs.remove(f).catch(() => {});
  }

  // 2. Resolve starting active item or synergy for rendering on the character select note
  let itemInfo = null;
  let twinItemInfo = null;
  try {
    itemInfo = await resolveCharacterStartingItem(primaryChar, gamePath, false);
    if (primaryChar.isDual) {
      twinItemInfo = await resolveCharacterStartingItem(primaryChar, gamePath, true);
    }
  } catch (e) {
    console.warn('Could not resolve starting item for menu compositing:', e.message);
  }

  // 3. Composite charactermenu.png into content/gfx/
  let compositedMenuPng = null;
  try {
    compositedMenuPng = await compositeCharacterMenuPng(gamePath, primaryChar, nameplateBuffer, explicitPortraitBuffer, itemInfo, twinItemInfo);
  } catch (e) {
    console.warn('Could not composite charactermenu.png:', e.message);
  }

  if (compositedMenuPng && compositedMenuPng.length > 0) {
    // Write into content/gfx/ (canonical Repentance mod directory) with dual casing
    await fs.writeFile(path.join(contentGfxDir, 'charactermenu.png'), compositedMenuPng);
    await fs.writeFile(path.join(contentGfxDir, 'CharacterMenu.png'), compositedMenuPng);
    await fs.writeFile(path.join(contentGfxDir, 'charactermenualt.png'), compositedMenuPng);
    await fs.writeFile(path.join(contentGfxDir, 'CharacterMenuAlt.png'), compositedMenuPng);
    await fs.writeFile(path.join(contentGfxDir, 'characterportraits.png'), compositedMenuPng);
    await fs.writeFile(path.join(contentGfxDir, 'CharacterPortraits.png'), compositedMenuPng);
    await fs.writeFile(path.join(contentGfxDir, 'characterportraitsalt.png'), compositedMenuPng);
    await fs.writeFile(path.join(contentGfxDir, 'CharacterPortraitsAlt.png'), compositedMenuPng);

    // Also write into resources/gfx/ui/main menu/ for dual engine discovery
    await fs.writeFile(path.join(resMainMenuDir, 'charactermenu.png'), compositedMenuPng);
    await fs.writeFile(path.join(resMainMenuDir, 'CharacterMenu.png'), compositedMenuPng);
    await fs.writeFile(path.join(resMainMenuDir, 'charactermenualt.png'), compositedMenuPng);
    await fs.writeFile(path.join(resMainMenuDir, 'CharacterMenuAlt.png'), compositedMenuPng);
  }

  // 4. Generate standalone ANM2 actor XMLs with DefaultAnimation=<CharacterName> + Greed/BloodStain
  const hasStartingItem = Boolean(itemInfo);
  const hasTwinStartingItem = Boolean(twinItemInfo);
  const charMenuAnm2 = generateCharacterMenuAnm2(chars, hasStartingItem, hasTwinStartingItem);
  const charMenuAltAnm2 = generateCharacterMenuAnm2(chars, hasStartingItem, hasTwinStartingItem);

  if (charMenuAnm2) {
    await fs.writeFile(path.join(contentGfxDir, 'charactermenu.anm2'), charMenuAnm2, 'utf8');
    await fs.writeFile(path.join(contentGfxDir, 'CharacterMenu.anm2'), charMenuAnm2, 'utf8');
  }

  if (charMenuAltAnm2) {
    await fs.writeFile(path.join(contentGfxDir, 'charactermenualt.anm2'), charMenuAltAnm2, 'utf8');
    await fs.writeFile(path.join(contentGfxDir, 'CharacterMenuAlt.anm2'), charMenuAltAnm2, 'utf8');
  }

  // 5. Generate standalone characterportraits.anm2 & characterportraitsalt.anm2 into content/gfx/
  const hasPortraitComp = Boolean(explicitPortraitBuffer && explicitPortraitBuffer.length > 50);
  const charPortAnm2 = generateCharacterPortraitsAnm2(chars, hasPortraitComp);
  const charPortAltAnm2 = generateCharacterPortraitsAnm2(chars, hasPortraitComp);

  if (charPortAnm2) {
    await fs.writeFile(path.join(contentGfxDir, 'characterportraits.anm2'), charPortAnm2, 'utf8');
    await fs.writeFile(path.join(contentGfxDir, 'CharacterPortraits.anm2'), charPortAnm2, 'utf8');
  }

  if (charPortAltAnm2) {
    await fs.writeFile(path.join(contentGfxDir, 'characterportraitsalt.anm2'), charPortAltAnm2, 'utf8');
    await fs.writeFile(path.join(contentGfxDir, 'CharacterPortraitsAlt.anm2'), charPortAltAnm2, 'utf8');
  }

  // 6. Generate and install composite coop menu.png using head from modified sprite sheet
  try {
    const skinBufs = [skinBuffer];
    if (twinSkinBuffer) skinBufs.push(twinSkinBuffer);
    const compositedCoopPng = await compositeCoopMenuPng(gamePath, chars, skinBufs);
    if (compositedCoopPng && compositedCoopPng.length > 0) {
      await fs.writeFile(path.join(contentGfxDir, 'coop menu.png'), compositedCoopPng);
      await fs.writeFile(path.join(contentGfxDir, 'Coop Menu.png'), compositedCoopPng);
      await fs.writeFile(path.join(resMainMenuDir, 'coop menu.png'), compositedCoopPng);
      await fs.writeFile(path.join(resMainMenuDir, 'Coop Menu.png'), compositedCoopPng);
      await fs.writeFile(path.join(resUiDir, 'coop menu.png'), compositedCoopPng);
    }
    // Copy baby_select.png and coop menu b.png if available
    const babyCandidate = path.join(ASSETS_DIR, 'ui', 'templates', 'baby_select.png');
    if (await fs.pathExists(babyCandidate)) {
      const bBuf = await fs.readFile(babyCandidate).catch(() => null);
      if (bBuf) {
        await fs.writeFile(path.join(contentGfxDir, 'baby_select.png'), bBuf);
        await fs.writeFile(path.join(contentGfxDir, 'Baby_Select.png'), bBuf);
        await fs.writeFile(path.join(resMainMenuDir, 'baby_select.png'), bBuf);
        await fs.writeFile(path.join(resUiDir, 'baby_select.png'), bBuf);
      }
    }
    const coopBCandidate = path.join(ASSETS_DIR, 'ui', 'templates', 'coop menu b.png');
    if (await fs.pathExists(coopBCandidate)) {
      const bBuf = await fs.readFile(coopBCandidate).catch(() => null);
      if (bBuf) {
        await fs.writeFile(path.join(contentGfxDir, 'coop menu b.png'), bBuf);
        await fs.writeFile(path.join(contentGfxDir, 'Coop Menu B.png'), bBuf);
        await fs.writeFile(path.join(resMainMenuDir, 'coop menu b.png'), bBuf);
        await fs.writeFile(path.join(resUiDir, 'coop menu b.png'), bBuf);
      }
    }
  } catch (e) {
    console.warn('Could not composite coop menu.png:', e.message);
  }

  // 7. Generate standalone coop menu.anm2 into content/gfx/
  const coopMenuAnm2 = generateCoopMenuAnm2(chars);
  if (coopMenuAnm2) {
    await fs.writeFile(path.join(contentGfxDir, 'coop menu.anm2'), coopMenuAnm2, 'utf8');
    await fs.writeFile(path.join(contentGfxDir, 'Coop Menu.anm2'), coopMenuAnm2, 'utf8');
  }

  // 8. Generate standalone death screen.anm2 into content/gfx/
  const deathScreenAnm2 = generateDeathScreenAnm2(chars);
  if (deathScreenAnm2) {
    await fs.writeFile(path.join(contentGfxDir, 'death screen.anm2'), deathScreenAnm2, 'utf8');
  }

  // 9. Copy death portraits template if available
  const deathPortCandidate = path.join(ASSETS_DIR, 'ui', 'templates', 'death portraits.png');
  if (await fs.pathExists(deathPortCandidate)) {
    const dBuf = await fs.readFile(deathPortCandidate).catch(() => null);
    if (dBuf) {
      await fs.writeFile(path.join(contentGfxDir, 'death portraits.png'), dBuf);
      await fs.writeFile(path.join(contentGfxDir, 'death_portraits.png'), dBuf);
    }
  }
}


