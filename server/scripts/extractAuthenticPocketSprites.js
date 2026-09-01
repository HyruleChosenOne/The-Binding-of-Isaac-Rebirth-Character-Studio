import fs from 'fs-extra';
import path from 'path';
import { PNG } from 'pngjs';
import { CURATED_CONSUMABLES } from '../services/itemDatabase.js';

const GAME_PATH = 'G:\\Games\\steamapps\\common\\The Binding of Isaac Rebirth';
const EXTRACTED_RES = path.join(GAME_PATH, 'extracted_resources', 'resources');
const EXTRACTED_GFX = path.join(EXTRACTED_RES, 'gfx');
const EXTRACTED_UI = path.join(EXTRACTED_GFX, 'ui');
const EXTRACTED_PICKUPS = path.join(EXTRACTED_GFX, 'items', 'pick ups');

const TARGET_POCKET_DIR = path.join(process.cwd(), 'server', 'data', 'assets', 'items', 'pocket');

// Maps consumable item definitions to their exact authentic in-game anm2 files and layer/animation index
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

  // Playing / Special Cards
  23: { file: '005.302_suit card.anm2', anim: '00_TwoOfClubs' },
  24: { file: '005.302_suit card.anm2', anim: '01_TwoOfDiamonds' },
  25: { file: '005.302_suit card.anm2', anim: '02_TwoOfHearts' },
  26: { file: '005.302_suit card.anm2', anim: '03_TwoOfSpades' },
  27: { file: '005.302_suit card.anm2', anim: '04_AceOfClubs' },
  28: { file: '005.302_suit card.anm2', anim: '05_AceOfDiamonds' },
  29: { file: '005.302_suit card.anm2', anim: '06_AceOfHearts' },
  30: { file: '005.302_suit card.anm2', anim: '07_AceOfSpades' },
  31: { file: '005.301_tarot card.anm2', anim: '22_TheJoker' },
  32: { file: '005.309_card against humanity.anm2', anim: 'Idle' },
  33: { file: '005.302_suit card.anm2', anim: 'SuicideKing' },
  34: { file: '005.312_chance card.anm2', anim: 'Idle' },
  35: { file: '005.301_tarot card.anm2', anim: 'RulesCard' },
  36: { file: '005.302_suit card.anm2', anim: 'Joker' },
  37: { file: '005.308_magic card.anm2', anim: 'AncientRecall' },
  38: { file: '005.308_magic card.anm2', anim: 'EraWalk' },
  39: { file: '005.308_magic card.anm2', anim: 'HugeGrowth' },
  40: { file: '005.310_credit card.anm2', anim: 'Idle' },
  41: { file: '005.302_suit card.anm2', anim: 'GetOutOfJailFree' },
  42: { file: '005.301_tarot card.anm2', anim: 'QuestionMark' },
  43: { file: '005.306_diceshard.anm2', anim: 'Idle' },
  44: { file: '005.305_emergencycontact.anm2', anim: 'Idle' },
  45: { file: '005.311_holy card.anm2', anim: 'Idle' },
  46: { file: '005.308_magic card.anm2', anim: 'ChaosCard' },

  // Runes
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

export async function renderAnm2Composite(anm2Path, targetAnimName, targetSize = 32) {
  if (!await fs.pathExists(anm2Path)) return null;
  const anm2Dir = path.dirname(anm2Path);
  const xml = await fs.readFile(anm2Path, 'utf8');

  // Parse spritesheets
  const sheets = {};
  const sheetMatches = [...xml.matchAll(/<Spritesheet\s+[^>]*Id="(\d+)"[^>]*Path="([^"]+)"/g)];
  for (const m of sheetMatches) {
    sheets[m[1]] = m[2];
  }
  const altSheetMatches = [...xml.matchAll(/<Spritesheet\s+[^>]*Path="([^"]+)"[^>]*Id="(\d+)"/g)];
  for (const m of altSheetMatches) {
    sheets[m[2]] = m[1];
  }

  // Find target animation
  const animRegex = new RegExp(`<Animation\\s+Name="${targetAnimName}"[\\s\\S]*?<\\/Animation>`, 'i');
  let animBlock = xml.match(animRegex);
  if (!animBlock) {
    // If not found, use first animation
    const firstAnim = xml.match(/<Animation\s+Name="([^"]+)"[\s\S]*?<\/Animation>/);
    if (firstAnim) animBlock = firstAnim;
  }
  if (!animBlock) return null;

  const result = new PNG({ width: targetSize, height: targetSize, fill: false });
  for (let i = 0; i < result.data.length; i++) result.data[i] = 0;

  // Extract layers and their first frame
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

    // Find layer's spritesheet
    const layerDefMatch = xml.match(new RegExp(`<Layer\\s+[^>]*Id="${layerId}"[^>]*SpritesheetId="(\\d+)"`)) ||
                          xml.match(new RegExp(`<Layer\\s+[^>]*SpritesheetId="(\\d+)"[^>]*Id="${layerId}"`));
    const sheetId = layerDefMatch ? layerDefMatch[1] : '0';
    const sheetPath = sheets[sheetId] || sheets['0'];

    if (!sheetPath) continue;

    const sourcePng = await getCachedPng(sheetPath, anm2Dir);
    if (!sourcePng) continue;

    // Draw frame onto composite
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
              // Standard alpha blending
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

async function main() {
  console.log('=== Slicing 100% Authentic Isaac Pocket Items From Game ANM2 / PNG Files ===');
  await fs.ensureDir(TARGET_POCKET_DIR);

  let successCount = 0;

  for (const item of CURATED_CONSUMABLES) {
    const id = item.id;
    const mapping = ANM2_MAP[id];

    let renderedPng = null;
    if (mapping) {
      const anm2Path = path.join(EXTRACTED_GFX, mapping.file);
      renderedPng = await renderAnm2Composite(anm2Path, mapping.anim, 32);
    }

    // If no direct ANM2 map or render failed, fallback to direct official texture crop
    if (!renderedPng) {
      if (item.type === 'pill') {
        const pPngPath = path.join(EXTRACTED_PICKUPS, 'pickup_007_pill.png');
        const pillIdx = id >= 200 ? (id - 201) : (id - 1);
        const col = pillIdx % 7;
        const row = Math.floor(pillIdx / 7);
        if (await fs.pathExists(pPngPath)) {
          const pillPng = PNG.sync.read(await fs.readFile(pPngPath));
          const sub = new PNG({ width: 32, height: 32, fill: false });
          for (let i = 0; i < sub.data.length; i++) sub.data[i] = 0;
          for (let y = 0; y < 32; y++) {
            for (let x = 0; x < 32; x++) {
              const srcIdx = ((row * 32 + y) * pillPng.width + (col * 32 + x)) * 4;
              const dstIdx = (y * 32 + x) * 4;
              sub.data[dstIdx] = pillPng.data[srcIdx];
              sub.data[dstIdx + 1] = pillPng.data[srcIdx + 1];
              sub.data[dstIdx + 2] = pillPng.data[srcIdx + 2];
              sub.data[dstIdx + 3] = pillPng.data[srcIdx + 3];
            }
          }
          renderedPng = sub;
        }
      }
    }

    if (renderedPng) {
      const destFile = path.join(TARGET_POCKET_DIR, `card_${id}.png`);
      await fs.writeFile(destFile, PNG.sync.write(renderedPng));
      successCount++;
    }
  }

  console.log(`Successfully extracted and rendered ${successCount} authentic game assets for cards, runes, souls, and pills!`);
}

main().catch(console.error);
