import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { PNG } from 'pngjs';
import { startExtraction } from './extractorService.js';
import { refreshAssetIndex } from '../routes/assets.js';
import { CURATED_CONSUMABLES } from './itemDatabase.js';
import { isVanillaCharacterFile, isVanillaPortraitFile } from './vanillaCharacters.js';
import { getConfig, DEFAULT_MOD_PATHS, DEFAULT_WORKSHOP_PATHS } from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Exact in-game ANM2 animation mappings for consumables from vanilla Isaac resources
const ANM2_MAP = {
  // Major Arcana Tarot Cards (1-22)
  1: { file: '005.301_tarot card.anm2', anim: '00_TheFool' },
  2: { file: '005.301_tarot card.anm2', anim: '01_TheMagician' },
  3: { file: '005.301_tarot card.anm2', anim: '02_TheHighPriestess' },
  4: { file: '005.301_tarot card.anm2', anim: '03_TheEmpress' },
  5: { file: '005.301_tarot card.anm2', anim: '04_TheEmperor' },
  6: { file: '005.301_tarot card.anm2', anim: '05_TheHierophant' },
  7: { file: '005.301_tarot card.anm2', anim: '06_TheLovers' },
  8: { file: '005.301_tarot card.anm2', anim: '07_TheChariot' },
  9: { file: '005.301_tarot card.anm2', anim: '08_TheJustice' },
  10: { file: '005.301_tarot card.anm2', anim: '09_TheHermit' },
  11: { file: '005.301_tarot card.anm2', anim: '10_WheelOfFortune' },
  12: { file: '005.301_tarot card.anm2', anim: '11_Strength' },
  13: { file: '005.301_tarot card.anm2', anim: '12_TheHangedMan' },
  14: { file: '005.301_tarot card.anm2', anim: '13_Death' },
  15: { file: '005.301_tarot card.anm2', anim: '14_Temperance' },
  16: { file: '005.301_tarot card.anm2', anim: '15_TheDevil' },
  17: { file: '005.301_tarot card.anm2', anim: '16_TheTower' },
  18: { file: '005.301_tarot card.anm2', anim: '17_TheStars' },
  19: { file: '005.301_tarot card.anm2', anim: '18_TheMoon' },
  20: { file: '005.301_tarot card.anm2', anim: '19_TheSun' },
  21: { file: '005.301_tarot card.anm2', anim: '20_Judgement' },
  22: { file: '005.301_tarot card.anm2', anim: '21_TheWorld' },

  // Runes (23-30, 47, 48)
  23: { file: '005.303_rune1.anm2', anim: '00_Hagalaz' },
  24: { file: '005.303_rune1.anm2', anim: '01_Jera' },
  25: { file: '005.303_rune1.anm2', anim: '02_Ehwaz' },
  26: { file: '005.303_rune1.anm2', anim: '03_Dagaz' },
  27: { file: '005.304_rune2.anm2', anim: '00_Ansuz' },
  28: { file: '005.304_rune2.anm2', anim: '01_Perthro' },
  29: { file: '005.304_rune2.anm2', anim: '02_Berkano' },
  30: { file: '005.304_rune2.anm2', anim: '03_Algiz' },
  47: { file: '005.304_rune2.anm2', anim: '04_BlankRune' },
  48: { file: '005.307_blackrune.anm2', anim: 'Idle' },

  // Special Playing & Tarot Cards (31-46)
  31: { file: '005.308_magic card.anm2', anim: 'ChaosCard' },
  32: { file: '005.310_credit card.anm2', anim: 'Idle' },
  33: { file: '005.301_tarot card.anm2', anim: 'RulesCard' },
  34: { file: '005.309_card against humanity.anm2', anim: 'Idle' },
  35: { file: '005.302_suit card.anm2', anim: 'SuicideKing' },
  36: { file: '005.302_suit card.anm2', anim: 'GetOutOfJailFree' },
  37: { file: '005.301_tarot card.anm2', anim: 'QuestionMark' },
  38: { file: '005.306_diceshard.anm2', anim: 'Idle' },
  39: { file: '005.305_emergencycontact.anm2', anim: 'Idle' },
  40: { file: '005.311_holy card.anm2', anim: 'Idle' },
  41: { file: '005.308_magic card.anm2', anim: 'HugeGrowth' },
  42: { file: '005.308_magic card.anm2', anim: 'AncientRecall' },
  43: { file: '005.308_magic card.anm2', anim: 'EraWalk' },
  44: { file: '005.302_suit card.anm2', anim: 'Joker' },
  45: { file: '005.302_suit card.anm2', anim: '02_TwoOfHearts' },
  46: { file: '005.301_tarot card.anm2', anim: '22_TheJoker' },

  // Soul Stones (49-65)
  49: { file: '005.300.18_soul of isaac.anm2', anim: 'Idle' },
  50: { file: '005.300.19_soul of magdalene.anm2', anim: 'Idle' },
  51: { file: '005.300.20_soul of cain.anm2', anim: 'Idle' },
  52: { file: '005.300.21_soul of judas.anm2', anim: 'Idle' },
  53: { file: '005.300.22_soul of blue baby.anm2', anim: 'Idle' },
  54: { file: '005.300.23_soul of eve.anm2', anim: 'Idle' },
  55: { file: '005.300.24_soul of samson.anm2', anim: 'Idle' },
  56: { file: '005.300.25_soul of azazel.anm2', anim: 'Idle' },
  57: { file: '005.300.26_soul of lazarus.anm2', anim: 'Idle' },
  58: { file: '005.300.27_soul of eden.anm2', anim: 'Idle' },
  59: { file: '005.300.28_soul of the lost.anm2', anim: 'Idle' },
  60: { file: '005.300.29_soul of lilith.anm2', anim: 'Idle' },
  61: { file: '005.300.30_soul of the keeper.anm2', anim: 'Idle' },
  62: { file: '005.300.31_soul of apollyon.anm2', anim: 'Idle' },
  63: { file: '005.300.32_soul of the forgotten.anm2', anim: 'Idle' },
  64: { file: '005.300.33_soul of bethany.anm2', anim: 'Idle' },
  65: { file: '005.300.34_soul of jacob.anm2', anim: 'Idle' },

  // Reverse Tarots (101-122)
  101: { file: '005.300.14_reverse tarot card.anm2', anim: '00_TheFool' },
  102: { file: '005.300.14_reverse tarot card.anm2', anim: '01_TheMagician' },
  103: { file: '005.300.14_reverse tarot card.anm2', anim: '02_TheHighPriestess' },
  104: { file: '005.300.14_reverse tarot card.anm2', anim: '03_TheEmpress' },
  105: { file: '005.300.14_reverse tarot card.anm2', anim: '04_TheEmperor' },
  106: { file: '005.300.14_reverse tarot card.anm2', anim: '05_TheHierophant' },
  107: { file: '005.300.14_reverse tarot card.anm2', anim: '06_TheLovers' },
  108: { file: '005.300.14_reverse tarot card.anm2', anim: '07_TheChariot' },
  109: { file: '005.300.14_reverse tarot card.anm2', anim: '08_TheJustice' },
  110: { file: '005.300.14_reverse tarot card.anm2', anim: '09_TheHermit' },
  111: { file: '005.300.14_reverse tarot card.anm2', anim: '10_WheelOfFortune' },
  112: { file: '005.300.14_reverse tarot card.anm2', anim: '11_Strength' },
  113: { file: '005.300.14_reverse tarot card.anm2', anim: '12_TheHangedMan' },
  114: { file: '005.300.14_reverse tarot card.anm2', anim: '13_Death' },
  115: { file: '005.300.14_reverse tarot card.anm2', anim: '14_Temperance' },
  116: { file: '005.300.14_reverse tarot card.anm2', anim: '15_TheDevil' },
  117: { file: '005.300.14_reverse tarot card.anm2', anim: '16_TheTower' },
  118: { file: '005.300.14_reverse tarot card.anm2', anim: '17_TheStars' },
  119: { file: '005.300.14_reverse tarot card.anm2', anim: '18_TheMoon' },
  120: { file: '005.300.14_reverse tarot card.anm2', anim: '19_TheSun' },
  121: { file: '005.300.14_reverse tarot card.anm2', anim: '20_Judgement' },
  122: { file: '005.300.14_reverse tarot card.anm2', anim: '21_TheWorld' },

  // Pills (201-214)
  201: { file: '005.071_pill blue-blue.anm2', anim: 'Idle' },
  202: { file: '005.072_pill white-blue.anm2', anim: 'Idle' },
  203: { file: '005.073_pill orange-orange.anm2', anim: 'Idle' },
  204: { file: '005.074_pill white-white.anm2', anim: 'Idle' },
  205: { file: '005.075_pill dots-red.anm2', anim: 'Idle' },
  206: { file: '005.076_pill pink-red.anm2', anim: 'Idle' },
  207: { file: '005.077_pill blue-cadetblue.anm2', anim: 'Idle' },
  208: { file: '005.078_pill yellow-orange.anm2', anim: 'Idle' },
  209: { file: '005.079_pill dots-white.anm2', anim: 'Idle' },
  210: { file: '005.080_pill white-azure.anm2', anim: 'Idle' },
  211: { file: '005.081_pill black-yellow.anm2', anim: 'Idle' },
  212: { file: '005.082_pill white-black.anm2', anim: 'Idle' },
  213: { file: '005.083_pill white-yellow.anm2', anim: 'Idle' },
  214: { file: '005.084_pill gold-gold.anm2', anim: 'Idle' }
};

const pngCache = new Map();

async function getCachedPng(relPath, baseDir) {
  const full = path.normalize(path.join(baseDir, relPath));
  if (pngCache.has(full)) return pngCache.get(full);
  if (await fs.pathExists(full)) {
    const png = PNG.sync.read(await fs.readFile(full));
    pngCache.set(full, png);
    return png;
  }
  return null;
}

async function renderAnm2Composite(anm2Path, targetAnimName, targetSize = 32) {
  if (!await fs.pathExists(anm2Path)) return null;
  const anm2Dir = path.dirname(anm2Path);
  const xml = await fs.readFile(anm2Path, 'utf8');

  const sheets = {};
  const sheetMatches = [...xml.matchAll(/<Spritesheet\s+[^>]*Id="(\d+)"[^>]*Path="([^"]+)"/g)];
  for (const m of sheetMatches) sheets[m[1]] = m[2];
  const altSheetMatches = [...xml.matchAll(/<Spritesheet\s+[^>]*Path="([^"]+)"[^>]*Id="(\d+)"/g)];
  for (const m of altSheetMatches) sheets[m[2]] = m[1];

  const animRegex = new RegExp(`<Animation\\s+Name="${targetAnimName}"[\\s\\S]*?<\\/Animation>`, 'i');
  let animBlock = xml.match(animRegex);
  if (!animBlock) {
    const firstAnim = xml.match(/<Animation\s+Name="([^"]+)"[\s\S]*?<\/Animation>/);
    if (firstAnim) animBlock = firstAnim;
  }
  if (!animBlock) return null;

  const result = new PNG({ width: targetSize, height: targetSize, fill: false });
  for (let i = 0; i < result.data.length; i++) result.data[i] = 0;

  const layerMatches = [...animBlock[0].matchAll(/<LayerAnimation\s+LayerId="(\d+)"[^>]*>([\s\S]*?)<\/LayerAnimation>/g)];
  for (const lMatch of layerMatches) {
    const layerId = lMatch[1];
    const layerContent = lMatch[2];

    const frameMatch = layerContent.match(/<Frame\s+([^>]+)\/>/);
    if (!frameMatch) continue;
    const fAttr = frameMatch[1];

    const xCrop = parseInt((fAttr.match(/XCrop="(\d+)"/) || [0, 0])[1], 10);
    const yCrop = parseInt((fAttr.match(/YCrop="(\d+)"/) || [0, 0])[1], 10);
    const width = parseInt((fAttr.match(/Width="(\d+)"/) || [0, 0])[1], 10);
    const height = parseInt((fAttr.match(/Height="(\d+)"/) || [0, 0])[1], 10);
    const xPos = parseInt((fAttr.match(/XPosition="(-?\d+)"/) || [0, 0])[1], 10);
    const yPos = parseInt((fAttr.match(/YPosition="(-?\d+)"/) || [0, 0])[1], 10);
    const xPivot = parseInt((fAttr.match(/XPivot="(\d+)"/) || [0, 0])[1], 10);
    const yPivot = parseInt((fAttr.match(/YPivot="(\d+)"/) || [0, 0])[1], 10);
    const visible = (fAttr.match(/Visible="([^"]+)"/) || [0, 'true'])[1] !== 'false';

    if (!visible || width <= 0 || height <= 0) continue;

    const layerDefMatch = xml.match(new RegExp(`<Layer\\s+[^>]*Id="${layerId}"[^>]*SpritesheetId="(\\d+)"`)) ||
                          xml.match(new RegExp(`<Layer\\s+[^>]*SpritesheetId="(\\d+)"[^>]*Id="${layerId}"`));
    const sheetId = layerDefMatch ? layerDefMatch[1] : '0';
    const sheetPath = sheets[sheetId] || sheets['0'];

    if (!sheetPath) continue;

    const sourcePng = await getCachedPng(sheetPath, anm2Dir);
    if (!sourcePng) continue;

    const destOffsetX = Math.floor(targetSize / 2) + xPos - xPivot;
    const destOffsetY = Math.floor(targetSize / 2) + yPos - yPivot;

    for (let sy = 0; sy < height; sy++) {
      for (let sx = 0; sx < width; sx++) {
        const srcX = xCrop + sx;
        const srcY = yCrop + sy;
        if (srcX >= 0 && srcX < sourcePng.width && srcY >= 0 && srcY < sourcePng.height) {
          const srcIdx = (srcY * sourcePng.width + srcX) * 4;
          const alpha = sourcePng.data[srcIdx + 3];
          if (alpha > 5) {
            const destX = destOffsetX + sx;
            const destY = destOffsetY + sy;
            if (destX >= 0 && destX < targetSize && destY >= 0 && destY < targetSize) {
              const destIdx = (destY * targetSize + destX) * 4;
              if (alpha === 255 || result.data[destIdx + 3] === 0) {
                result.data[destIdx] = sourcePng.data[srcIdx];
                result.data[destIdx + 1] = sourcePng.data[srcIdx + 1];
                result.data[destIdx + 2] = sourcePng.data[srcIdx + 2];
                result.data[destIdx + 3] = alpha;
              } else {
                const srcA = alpha / 255;
                const dstA = result.data[destIdx + 3] / 255;
                const outA = srcA + dstA * (1 - srcA);
                result.data[destIdx] = Math.round((sourcePng.data[srcIdx] * srcA + result.data[destIdx] * dstA * (1 - srcA)) / outA);
                result.data[destIdx + 1] = Math.round((sourcePng.data[srcIdx + 1] * srcA + result.data[destIdx + 1] * dstA * (1 - srcA)) / outA);
                result.data[destIdx + 2] = Math.round((sourcePng.data[srcIdx + 2] * srcA + result.data[destIdx + 2] * dstA * (1 - srcA)) / outA);
                result.data[destIdx + 3] = Math.round(outA * 255);
              }
            }
          }
        }
      }
    }
  }

  return result;
}

// 16x24 Tarot Front Artwork directly from ui_cardfronts.png
const CARD_FRONTS_MAP = {
  1: { x: 0, y: 0, w: 16, h: 24 },      // 00_TheFool
  2: { x: 0, y: 24, w: 16, h: 24 },     // 01_TheMagician
  3: { x: 0, y: 48, w: 16, h: 24 },     // 02_TheHighPriestess
  4: { x: 0, y: 72, w: 16, h: 24 },     // 03_TheEmpress
  5: { x: 0, y: 96, w: 16, h: 24 },     // 04_TheEmperor
  6: { x: 0, y: 120, w: 16, h: 24 },    // 05_TheHierophant
  7: { x: 32, y: 0, w: 16, h: 24 },     // 06_TheLovers
  8: { x: 32, y: 24, w: 16, h: 24 },    // 07_TheChariot
  9: { x: 32, y: 48, w: 16, h: 24 },    // 08_TheJustice
  10: { x: 32, y: 72, w: 16, h: 24 },   // 09_TheHermit
  11: { x: 32, y: 96, w: 16, h: 24 },   // 10_WheelOfFortune
  12: { x: 16, y: 0, w: 16, h: 24 },    // 11_Strength
  13: { x: 16, y: 24, w: 16, h: 24 },   // 12_TheHangedMan
  14: { x: 16, y: 48, w: 16, h: 24 },   // 13_Death
  15: { x: 16, y: 120, w: 16, h: 24 },  // 14_Temperance
  16: { x: 16, y: 96, w: 16, h: 24 },   // 15_TheDevil
  17: { x: 16, y: 72, w: 16, h: 24 },   // 16_TheTower
  18: { x: 48, y: 0, w: 16, h: 24 },    // 17_TheStars
  19: { x: 48, y: 24, w: 16, h: 24 },   // 18_TheMoon
  20: { x: 48, y: 48, w: 16, h: 24 },   // 19_TheSun
  21: { x: 48, y: 72, w: 16, h: 24 },   // 20_Judgement
  22: { x: 48, y: 96, w: 16, h: 24 },   // 21_TheWorld
  31: { x: 64, y: 96, w: 16, h: 24 },   // Chaos Card
  32: { x: 80, y: 24, w: 16, h: 24 },   // Credit Card
  33: { x: 80, y: 48, w: 16, h: 24 },   // Rules Card
  34: { x: 80, y: 72, w: 16, h: 24 },   // Card Against Humanity
  35: { x: 64, y: 72, w: 16, h: 24 },   // Suicide King
  36: { x: 80, y: 96, w: 16, h: 24 },   // Get Out of Jail Free
  37: { x: 80, y: 0, w: 16, h: 24 },    // ? Card
  38: { x: 64, y: 120, w: 16, h: 24 },  // Dice Shard
  39: { x: 96, y: 120, w: 16, h: 24 },  // Emergency Contact
  40: { x: 112, y: 96, w: 16, h: 24 },  // Holy Card
  41: { x: 112, y: 0, w: 16, h: 24 },   // Huge Growth
  42: { x: 112, y: 24, w: 16, h: 24 },  // Ancient Recall
  43: { x: 112, y: 48, w: 16, h: 24 },  // Era Walk
  44: { x: 64, y: 48, w: 16, h: 24 },   // Wild Card
  45: { x: 64, y: 0, w: 16, h: 24 },    // Queen of Hearts
  46: { x: 64, y: 48, w: 16, h: 24 }    // Joker
};

function safeReadPng(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const buf = fs.readFileSync(filePath);
    return PNG.sync.read(buf);
  } catch (e) {
    return null;
  }
}

function makeSprite(sourcePng, srcCrop, targetSize = 32, padding = 1, invertColors = false) {
  const result = new PNG({ width: targetSize, height: targetSize, fill: false });
  for (let i = 0; i < result.data.length; i++) result.data[i] = 0;

  const srcX0 = srcCrop.x;
  const srcY0 = srcCrop.y;
  const srcW = srcCrop.w;
  const srcH = srcCrop.h;

  const maxW = targetSize - padding * 2;
  const maxH = targetSize - padding * 2;

  let scale = 1;
  if (srcW > maxW || srcH > maxH) {
    scale = Math.min(maxW / srcW, maxH / srcH);
  }

  const destW = Math.round(srcW * scale);
  const destH = Math.round(srcH * scale);
  const offsetX = Math.floor((targetSize - destW) / 2);
  const offsetY = Math.floor((targetSize - destH) / 2);

  for (let dy = 0; dy < destH; dy++) {
    for (let dx = 0; dx < destW; dx++) {
      const sx = Math.min(srcW - 1, Math.floor(dx / scale));
      const sy = Math.min(srcH - 1, Math.floor(dy / scale));
      const srcIdx = ((srcY0 + sy) * sourcePng.width + (srcX0 + sx)) * 4;
      const alpha = sourcePng.data[srcIdx + 3];
      if (alpha > 10) {
        const destIdx = ((offsetY + dy) * targetSize + (offsetX + dx)) * 4;
        if (invertColors) {
          result.data[destIdx] = 255 - sourcePng.data[srcIdx];
          result.data[destIdx + 1] = 255 - sourcePng.data[srcIdx + 1];
          result.data[destIdx + 2] = 255 - sourcePng.data[srcIdx + 2];
        } else {
          result.data[destIdx] = sourcePng.data[srcIdx];
          result.data[destIdx + 1] = sourcePng.data[srcIdx + 1];
          result.data[destIdx + 2] = sourcePng.data[srcIdx + 2];
        }
        result.data[destIdx + 3] = alpha;
      }
    }
  }

  return result;
}

function getTightBounds(png) {
  let minX = png.width, maxX = 0, minY = png.height, maxY = 0;
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const idx = (y * png.width + x) * 4;
      if (png.data[idx + 3] > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (minX > maxX || minY > maxY) return { x: 0, y: 0, w: png.width, h: png.height };
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

/**
 * Extracts authentic in-game pocket items (cards, runes, souls, pills)
 * directly from scanned game resources into local cache.
 */
export async function importScannedPocketAssets(gamePathOrFiles, targetPocketDir, fallbackGamePath = null) {
  await fs.ensureDir(targetPocketDir);

  let cardfrontsPng = null;
  let pickupPillPng = null;
  let pickupSoulstonesPng = null;
  let pickupCardPng = null;
  let blankRuneCol = null;

  if (Array.isArray(gamePathOrFiles)) {
    // Array of discovered PNG files
    for (const f of gamePathOrFiles) {
      if (!cardfrontsPng && f.lower === 'ui_cardfronts.png') cardfrontsPng = safeReadPng(f.fullPath);
      if (!pickupPillPng && (f.lower === 'pickup_007_pill.png' || f.lower === 'pill.png')) pickupPillPng = safeReadPng(f.fullPath);
      if (!pickupSoulstonesPng && (f.lower === 'pickup_soulstones.png' || f.lower === 'soulstones.png')) pickupSoulstonesPng = safeReadPng(f.fullPath);
      if (!pickupCardPng && (f.lower === 'pickup_017_card.png' || f.lower === 'card.png')) pickupCardPng = safeReadPng(f.fullPath);
      if (!blankRuneCol && (f.lower.includes('blankrune') || f.lower === 'collectibles_263_blankrune.png')) blankRuneCol = safeReadPng(f.fullPath);
    }
  }

  const effectiveGamePath = typeof gamePathOrFiles === 'string' ? gamePathOrFiles : fallbackGamePath;
  if (effectiveGamePath && (!cardfrontsPng || !pickupPillPng || !pickupSoulstonesPng || !pickupCardPng || !blankRuneCol)) {
    const candidateDirs = [
      path.join(effectiveGamePath, 'resources', 'gfx'),
      path.join(effectiveGamePath, 'resources-dlc1', 'gfx'),
      path.join(effectiveGamePath, 'resources-dlc2', 'gfx'),
      path.join(effectiveGamePath, 'resources-dlc3', 'gfx'),
      path.join(effectiveGamePath, 'resources-dlc4', 'gfx'),
      path.join(effectiveGamePath, 'resources_repentance', 'gfx'),
      path.join(effectiveGamePath, 'extracted_resources', 'resources', 'gfx'),
      path.join(effectiveGamePath, 'extracted_resources', 'resources-dlc1', 'gfx'),
      path.join(effectiveGamePath, 'extracted_resources', 'resources-dlc2', 'gfx'),
      path.join(effectiveGamePath, 'extracted_resources', 'resources-dlc3', 'gfx'),
      path.join(effectiveGamePath, 'extracted_resources', 'resources-dlc4', 'gfx'),
      path.join(effectiveGamePath, 'tools', 'ResourceExtractor', 'resources', 'gfx'),
      path.join(effectiveGamePath, 'tools', 'ResourceExtractor', 'resources-dlc1', 'gfx'),
      path.join(effectiveGamePath, 'tools', 'ResourceExtractor', 'resources-dlc2', 'gfx'),
      path.join(effectiveGamePath, 'tools', 'ResourceExtractor', 'resources-dlc3', 'gfx'),
      path.join(effectiveGamePath, 'tools', 'ResourceExtractor', 'resources-dlc4', 'gfx'),
      path.join(effectiveGamePath, 'tools', 'ResourceExtractor', 'extracted_resources', 'resources', 'gfx'),
      path.join(effectiveGamePath, 'tools', 'ResourceExtractor', 'extracted_resources', 'resources-dlc3', 'gfx')
    ];

    for (const d of candidateDirs) {
      if (!cardfrontsPng) cardfrontsPng = safeReadPng(path.join(d, 'ui', 'ui_cardfronts.png'));
      if (!pickupPillPng) pickupPillPng = safeReadPng(path.join(d, 'items', 'pick ups', 'pickup_007_pill.png')) || safeReadPng(path.join(d, 'items', 'pick ups', 'pill.png'));
      if (!pickupSoulstonesPng) pickupSoulstonesPng = safeReadPng(path.join(d, 'items', 'pick ups', 'pickup_soulstones.png')) || safeReadPng(path.join(d, 'items', 'pick ups', 'soulstones.png'));
      if (!pickupCardPng) pickupCardPng = safeReadPng(path.join(d, 'items', 'pick ups', 'pickup_017_card.png')) || safeReadPng(path.join(d, 'items', 'pick ups', 'card.png'));
      if (!blankRuneCol) blankRuneCol = safeReadPng(path.join(d, 'items', 'collectibles', 'collectibles_263_blankrune.png')) || safeReadPng(path.join(d, 'items', 'collectibles', 'collectibles_263_blankrune_rep.png'));
    }
  }

  let count = 0;

  for (const item of CURATED_CONSUMABLES) {
    const id = item.id;
    let spritePng = null;

    // 1. Tarot & Special Cards (Authentic 16x24 Tarot face illustration from ui_cardfronts.png)
    if (CARD_FRONTS_MAP[id] && cardfrontsPng) {
      const crop = CARD_FRONTS_MAP[id];
      spritePng = makeSprite(cardfrontsPng, crop, 32, 1, false);
    }
    // 2. Reverse Tarots (101-122)
    else if (id >= 101 && id <= 122) {
      const baseTarotId = id - 100;
      if (CARD_FRONTS_MAP[baseTarotId] && cardfrontsPng) {
        const crop = CARD_FRONTS_MAP[baseTarotId];
        spritePng = makeSprite(cardfrontsPng, crop, 32, 1, true);
      } else if (pickupCardPng) {
        const revIdx = id - 101;
        const col = revIdx % 4;
        const row = Math.floor(revIdx / 4) % 3;
        const subX = col * 32;
        const subY = (1 + row) * 32;
        spritePng = makeSprite(pickupCardPng, { x: subX, y: subY, w: 32, h: 32 }, 32, 1);
      }
    }
    // 3. Runes (23-30, 47, 48)
    else if ((id >= 23 && id <= 30) || id === 47 || id === 48) {
      let rIdx = 0;
      if (id >= 23 && id <= 30) rIdx = id - 23;
      else if (id === 47) rIdx = 8;
      else if (id === 48) rIdx = 9;

      if (id === 47 && blankRuneCol) {
        const bounds = getTightBounds(blankRuneCol);
        spritePng = makeSprite(blankRuneCol, bounds, 32, 1);
      } else if (id === 48 && blankRuneCol) {
        const bounds = getTightBounds(blankRuneCol);
        spritePng = makeSprite(blankRuneCol, bounds, 32, 1, true);
      }

      if (!spritePng && pickupCardPng) {
        const col = rIdx % 4;
        const row = Math.floor(rIdx / 4) % 2;
        const subX = col * 32;
        const subY = (2 + row) * 32;
        if (subY + 32 <= pickupCardPng.height) {
          spritePng = makeSprite(pickupCardPng, { x: subX, y: subY, w: 32, h: 32 }, 32, 1);
        }
      }
    }
    // 4. Soul Stones (49-65) from pickup_soulstones.png
    else if (id >= 49 && id <= 65 && pickupSoulstonesPng) {
      const sIdx = id - 49;
      const col = sIdx % 8;
      const row = Math.floor(sIdx / 8);
      const subX = col * 32;
      const subY = row * 32;
      const subPng = new PNG({ width: 32, height: 32, fill: false });
      for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 32; x++) {
          const srcIdx = ((subY + y) * pickupSoulstonesPng.width + (subX + x)) * 4;
          const dstIdx = (y * 32 + x) * 4;
          subPng.data[dstIdx] = pickupSoulstonesPng.data[srcIdx];
          subPng.data[dstIdx + 1] = pickupSoulstonesPng.data[srcIdx + 1];
          subPng.data[dstIdx + 2] = pickupSoulstonesPng.data[srcIdx + 2];
          subPng.data[dstIdx + 3] = pickupSoulstonesPng.data[srcIdx + 3];
        }
      }
      const bounds = getTightBounds(subPng);
      spritePng = makeSprite(subPng, bounds, 32, 1);
    }
    // 5. Pills (201-220) from pickup_007_pill.png
    else if (id >= 201 && id <= 220 && pickupPillPng) {
      const pIdx = (id - 201) % 14;
      const col = pIdx % 7;
      const row = Math.floor(pIdx / 7);
      const subX = col * 32;
      const subY = row * 32;
      const subPng = new PNG({ width: 32, height: 32, fill: false });
      for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 32; x++) {
          const srcIdx = ((subY + y) * pickupPillPng.width + (subX + x)) * 4;
          const dstIdx = (y * 32 + x) * 4;
          subPng.data[dstIdx] = pickupPillPng.data[srcIdx];
          subPng.data[dstIdx + 1] = pickupPillPng.data[srcIdx + 1];
          subPng.data[dstIdx + 2] = pickupPillPng.data[srcIdx + 2];
          subPng.data[dstIdx + 3] = pickupPillPng.data[srcIdx + 3];
        }
      }
      const bounds = getTightBounds(subPng);
      spritePng = makeSprite(subPng, bounds, 32, 1);
    }

    if (spritePng) {
      const dest = path.join(targetPocketDir, `card_${id}.png`);
      await fs.writeFile(dest, PNG.sync.write(spritePng));
      count++;
    }
  }

  return count;
}

/**
 * Imports and caches game assets (sprites, portraits, menu sheets, item icons, pocket items)
 * from the game directory and extracted_resources into the Studio's local data cache.
 * 
 * STRICT POLICY:
 * - Character base sprites: ONLY imports official vanilla characters (17 Standard + 17 Tainted).
 * - Item sprites: Imports BOTH vanilla collectibles/trinkets AND custom modded items/trinkets from mods.
 */
export async function importGameAssets(gamePath, modsPath) {
  const result = {
    spritesImported: 0,
    portraitsImported: 0,
    itemIconsImported: 0,
    menuSheetsImported: 0,
    pocketImported: 0,
    extractorLaunched: false
  };

  if (!gamePath || !(await fs.pathExists(gamePath))) {
    return result;
  }

  // Resolve target local cache directories
  const targetDirs = [
    path.join(process.cwd(), 'server', 'data'),
    ...(process.env.LOCALAPPDATA ? [path.join(process.env.LOCALAPPDATA, 'IsaacCharacterStudio', 'server', 'data')] : [])
  ];

  // 1. Discover all candidate vanilla source root folders in gamePath
  const vanillaRoots = new Set([
    path.join(gamePath, 'resources'),
    path.join(gamePath, 'resources-dlc1'),
    path.join(gamePath, 'resources-dlc2'),
    path.join(gamePath, 'resources-dlc3'),
    path.join(gamePath, 'resources-dlc4'),
    path.join(gamePath, 'resources_repentance'),
    path.join(gamePath, 'resources_dlc1'),
    path.join(gamePath, 'resources_dlc2'),
    path.join(gamePath, 'resources_dlc3'),
    path.join(gamePath, 'resources_dlc4'),
    path.join(gamePath, 'resources_afterbirth'),
    path.join(gamePath, 'resources_afterbirthplus'),
    path.join(gamePath, 'extracted_resources'),
    path.join(gamePath, 'extracted_resources', 'resources'),
    path.join(gamePath, 'extracted_resources', 'resources-dlc1'),
    path.join(gamePath, 'extracted_resources', 'resources-dlc2'),
    path.join(gamePath, 'extracted_resources', 'resources-dlc3'),
    path.join(gamePath, 'extracted_resources', 'resources-dlc4'),
    path.join(gamePath, 'tools', 'ResourceExtractor'),
    path.join(gamePath, 'tools', 'ResourceExtractor', 'resources'),
    path.join(gamePath, 'tools', 'ResourceExtractor', 'resources-dlc1'),
    path.join(gamePath, 'tools', 'ResourceExtractor', 'resources-dlc2'),
    path.join(gamePath, 'tools', 'ResourceExtractor', 'resources-dlc3'),
    path.join(gamePath, 'tools', 'ResourceExtractor', 'resources-dlc4'),
    path.join(gamePath, 'tools', 'ResourceExtractor', 'resources_repentance'),
    path.join(gamePath, 'tools', 'ResourceExtractor', 'extracted_resources'),
    path.join(gamePath, 'tools', 'ResourceExtractor', 'extracted_resources', 'resources'),
    path.join(gamePath, 'tools', 'ResourceExtractor', 'extracted_resources', 'resources-dlc3')
  ]);

  // Dynamically discover any subfolder starting with resources or extracted in gamePath
  try {
    const gameSubEntries = await fs.readdir(gamePath, { withFileTypes: true });
    for (const entry of gameSubEntries) {
      if (entry.isDirectory()) {
        const lName = entry.name.toLowerCase();
        if (lName.startsWith('resources') || lName.includes('extracted')) {
          vanillaRoots.add(path.join(gamePath, entry.name));
        }
      }
    }
    const toolsDir = path.join(gamePath, 'tools', 'ResourceExtractor');
    if (await fs.pathExists(toolsDir)) {
      const toolEntries = await fs.readdir(toolsDir, { withFileTypes: true });
      for (const entry of toolEntries) {
        if (entry.isDirectory()) {
          vanillaRoots.add(path.join(toolsDir, entry.name));
        }
      }
    }
  } catch (e) {}

  // 2. Discover all mod directories for modded item/trinket ingestion
  const rawModRoots = [
    modsPath,
    path.join(gamePath, 'mods'),
    path.resolve(gamePath, '..', '..', 'workshop', 'content', '250900'),
    ...DEFAULT_MOD_PATHS,
    ...DEFAULT_WORKSHOP_PATHS
  ].filter(Boolean);

  const modRoots = new Set();
  for (const mr of rawModRoots) {
    try {
      const canonical = path.resolve(mr);
      if (await fs.pathExists(canonical)) {
        modRoots.add(canonical);
      }
    } catch (e) {}
  }

  // Deep recursive discovery of vanilla PNG files with depth up to 18
  const vanillaPngFiles = [];
  const visitedVanillaDirs = new Set();

  async function walkVanilla(dir, depth = 0) {
    if (depth > 18 || !dir) return;
    const norm = path.normalize(dir).toLowerCase();
    if (visitedVanillaDirs.has(norm)) return;
    visitedVanillaDirs.add(norm);

    try {
      if (!(await fs.pathExists(dir))) return;
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          const lName = entry.name.toLowerCase();
          if (lName === 'node_modules' || lName === '.git' || lName === 'save' || lName === 'backup' || lName === 'mods' || lName === 'packed') continue;
          await walkVanilla(full, depth + 1);
        } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
          vanillaPngFiles.push({ name: entry.name, lower: entry.name.toLowerCase(), fullPath: full, dir });
        }
      }
    } catch (e) {}
  }

  for (const root of vanillaRoots) {
    await walkVanilla(root);
  }

  // Deep recursive discovery of modded item & trinket PNG files
  const modItemPngFiles = [];
  const visitedModDirs = new Set();

  async function walkModItems(dir, depth = 0) {
    if (depth > 18 || !dir) return;
    const norm = path.normalize(dir).toLowerCase();
    if (visitedModDirs.has(norm)) return;
    visitedModDirs.add(norm);

    try {
      if (!(await fs.pathExists(dir))) return;
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          const lName = entry.name.toLowerCase();
          if (lName === 'node_modules' || lName === '.git' || lName === 'backup' || lName === 'packed') continue;
          await walkModItems(full, depth + 1);
        } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
          const lName = entry.name.toLowerCase();
          const rel = full.toLowerCase().replace(/\\/g, '/');
          
          // STRICT RULE: Ignore all mod character base sprites!
          const isCharSprite = lName.startsWith('character_') || lName.startsWith('player_') || rel.includes('/characters/');
          if (isCharSprite) continue;

          // Check if it's an item, trinket, or custom pocket sprite in a mod
          const isItemOrTrinket = lName.includes('collectible') ||
                                  lName.includes('trinket') ||
                                  rel.includes('/items/') ||
                                  rel.includes('/gfx/items/') ||
                                  rel.includes('/content/') ||
                                  lName.startsWith('card_') ||
                                  lName.startsWith('pickup_');

          if (isItemOrTrinket) {
            modItemPngFiles.push({ name: entry.name, lower: lName, fullPath: full, dir });
          }
        }
      }
    } catch (e) {}
  }

  for (const mRoot of modRoots) {
    await walkModItems(mRoot);
  }

  // Extract pocket consumable sprites into server/data/pocket if needed
  const localPocketDir = path.join(process.cwd(), 'server', 'data', 'pocket');
  await fs.ensureDir(localPocketDir);
  const pocketCount = await importScannedPocketAssets(vanillaPngFiles, localPocketDir, gamePath);
  result.pocketImported = pocketCount;

  // Refresh in-memory asset fast-lookup index directly from game and mod directories
  try {
    await refreshAssetIndex();
  } catch (e) {}

  result.itemIconsImported = vanillaPngFiles.length + modItemPngFiles.length;
  result.spritesImported = vanillaPngFiles.filter(f => isVanillaCharacterFile(f.name)).length;
  result.portraitsImported = vanillaPngFiles.filter(f => isVanillaPortraitFile(f.name)).length;

  return result;
}

/**
 * Checks if vanilla extracted assets are present in the game directory.
 * When true, direct disk asset serving is active with 0 file copying needed.
 */
export async function hasImportedAssets() {
  try {
    const config = getConfig();
    if (!config.gamePath || !(await fs.pathExists(config.gamePath))) return false;

    const candidateDirs = [
      path.join(config.gamePath, 'extracted_resources', 'resources', 'gfx', 'items', 'collectibles'),
      path.join(config.gamePath, 'extracted_resources', 'resources-dlc1', 'gfx', 'items', 'collectibles'),
      path.join(config.gamePath, 'extracted_resources', 'resources-dlc2', 'gfx', 'items', 'collectibles'),
      path.join(config.gamePath, 'extracted_resources', 'resources-dlc3', 'gfx', 'items', 'collectibles'),
      path.join(config.gamePath, 'extracted_resources', 'resources-dlc4', 'gfx', 'items', 'collectibles'),
      path.join(config.gamePath, 'resources', 'gfx', 'items', 'collectibles'),
      path.join(config.gamePath, 'resources-dlc1', 'gfx', 'items', 'collectibles'),
      path.join(config.gamePath, 'resources-dlc2', 'gfx', 'items', 'collectibles'),
      path.join(config.gamePath, 'resources-dlc3', 'gfx', 'items', 'collectibles'),
      path.join(config.gamePath, 'resources-dlc4', 'gfx', 'items', 'collectibles'),
      path.join(config.gamePath, 'resources_repentance', 'gfx', 'items', 'collectibles'),
      path.join(config.gamePath, 'tools', 'ResourceExtractor', 'resources', 'gfx', 'items', 'collectibles'),
      path.join(config.gamePath, 'tools', 'ResourceExtractor', 'resources-dlc1', 'gfx', 'items', 'collectibles'),
      path.join(config.gamePath, 'tools', 'ResourceExtractor', 'resources-dlc2', 'gfx', 'items', 'collectibles'),
      path.join(config.gamePath, 'tools', 'ResourceExtractor', 'resources-dlc3', 'gfx', 'items', 'collectibles'),
      path.join(config.gamePath, 'tools', 'ResourceExtractor', 'resources-dlc4', 'gfx', 'items', 'collectibles'),
      path.join(config.gamePath, 'tools', 'ResourceExtractor', 'extracted_resources', 'resources', 'gfx', 'items', 'collectibles'),
      path.join(config.gamePath, 'tools', 'ResourceExtractor', 'extracted_resources', 'resources-dlc3', 'gfx', 'items', 'collectibles')
    ];

    for (const d of candidateDirs) {
      if (await fs.pathExists(d)) {
        const files = await fs.readdir(d);
        if (files.filter(f => f.toLowerCase().endsWith('.png')).length >= 30) {
          return true;
        }
      }
    }
    return false;
  } catch {
    return false;
  }
}
