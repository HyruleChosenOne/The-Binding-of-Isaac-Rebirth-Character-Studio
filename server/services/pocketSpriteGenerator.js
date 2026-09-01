import fs from 'fs-extra';
import path from 'path';
import { PNG } from 'pngjs';
import { ASSETS_DIR } from '../config.js';

const POCKET_ASSETS_DIR = path.join(ASSETS_DIR, 'items', 'pocket');

function createPixelCanvas(w = 32, h = 32) {
  const png = new PNG({ width: w, height: h });
  for (let i = 0; i < w * h * 4; i += 4) {
    png.data[i] = 0;
    png.data[i + 1] = 0;
    png.data[i + 2] = 0;
    png.data[i + 3] = 0;
  }

  function setPixel(x, y, r, g, b, a = 255) {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const idx = (y * w + x) * 4;
    png.data[idx] = r;
    png.data[idx + 1] = g;
    png.data[idx + 2] = b;
    png.data[idx + 3] = a;
  }

  function drawRect(x, y, rw, rh, r, g, b, a = 255) {
    for (let dy = 0; dy < rh; dy++) {
      for (let dx = 0; dx < rw; dx++) {
        setPixel(x + dx, y + dy, r, g, b, a);
      }
    }
  }

  function drawCardBase(bgR, bgG, bgB, borderR = 40, borderG = 30, borderB = 20) {
    const cx = 7, cy = 3, cw = 18, ch = 26;
    drawRect(cx + 1, cy, cw - 2, ch, borderR, borderG, borderB);
    drawRect(cx, cy + 1, cw, ch - 2, borderR, borderG, borderB);
    drawRect(cx + 1, cy + 1, cw - 2, ch - 2, bgR, bgG, bgB);
    for (let x = cx + 2; x < cx + cw - 2; x++) {
      setPixel(x, cy + 2, Math.min(255, bgR + 40), Math.min(255, bgG + 40), Math.min(255, bgB + 40));
    }
  }

  function drawRuneBase(r = 130, g = 135, b = 145) {
    const rx = 6, ry = 5, rw = 20, rh = 22;
    drawRect(rx + 2, ry, rw - 4, rh, 30, 32, 40);
    drawRect(rx, ry + 2, rw, rh - 4, 30, 32, 40);
    drawRect(rx + 1, ry + 1, rw - 2, rh - 2, 30, 32, 40);
    drawRect(rx + 2, ry + 2, rw - 4, rh - 4, r, g, b);
    drawRect(rx + 1, ry + 3, rw - 2, rh - 6, r, g, b);
    for (let x = rx + 3; x < rx + rw - 3; x++) {
      setPixel(x, ry + 2, Math.min(255, r + 45), Math.min(255, g + 45), Math.min(255, b + 45));
      setPixel(x, ry + rh - 3, Math.max(0, r - 50), Math.max(0, g - 50), Math.max(0, b - 50));
    }
  }

  function drawSoulCrystal(mainR, mainG, mainB, glowR, glowG, glowB) {
    for (let y = 3; y <= 28; y++) {
      for (let x = 6; x <= 25; x++) {
        if ((x + y) % 2 === 0) setPixel(x, y, glowR, glowG, glowB, 60);
      }
    }
    drawRect(12, 4, 8, 24, 20, 15, 30);
    drawRect(9, 8, 14, 16, 20, 15, 30);
    drawRect(7, 12, 18, 8, 20, 15, 30);
    drawRect(13, 5, 6, 22, mainR, mainG, mainB);
    drawRect(10, 9, 12, 14, Math.min(255, mainR + 25), Math.min(255, mainG + 25), Math.min(255, mainB + 25));
    drawRect(8, 13, 16, 6, Math.min(255, mainR + 45), Math.min(255, mainG + 45), Math.min(255, mainB + 45));
    drawRect(10, 7, 3, 8, 255, 255, 255, 180);
  }

  function drawPill(topColor, botColor, isSpeckled = false) {
    const [tr, tg, tb] = topColor;
    const [br, bg, bb] = botColor;
    
    const pillMask = [
      "      ####      ",
      "    ########    ",
      "   ##########   ",
      "  ############  ",
      "  ############  ",
      " ############## ",
      " ############## ",
      "################",
      "################",
      " ############## ",
      " ############## ",
      "  ############  ",
      "  ############  ",
      "   ##########   ",
      "    ########    ",
      "      ####      "
    ];

    const ox = 8, oy = 8;
    for (let py = 0; py < pillMask.length; py++) {
      const row = pillMask[py];
      for (let px = 0; px < row.length; px++) {
        if (row[px] === '#') {
          const isTop = (px + py) < 15;
          const r = isTop ? tr : br;
          const g = isTop ? tg : bg;
          const b = isTop ? tb : bb;
          setPixel(ox + px, oy + py, r, g, b);
        }
      }
    }

    for (let py = 0; py < pillMask.length; py++) {
      const row = pillMask[py];
      for (let px = 0; px < row.length; px++) {
        if (row[px] === '#') {
          const isEdge = px === 0 || py === 0 || px === row.length - 1 || py === pillMask.length - 1 ||
                         row[px - 1] !== '#' || row[px + 1] !== '#' ||
                         (pillMask[py - 1] && pillMask[py - 1][px] !== '#') ||
                         (pillMask[py + 1] && pillMask[py + 1][px] !== '#');
          if (isEdge) {
            setPixel(ox + px, oy + py, 30, 20, 20);
          }
        }
      }
    }

    for (let d = 0; d < 16; d++) {
      setPixel(ox + d, oy + 15 - d, 25, 20, 20);
      setPixel(ox + d, oy + 16 - d, 255, 255, 255, 120);
    }

    setPixel(ox + 5, oy + 4, 255, 255, 255, 220);
    setPixel(ox + 6, oy + 4, 255, 255, 255, 220);
    setPixel(ox + 4, oy + 5, 255, 255, 255, 200);

    if (isSpeckled) {
      setPixel(ox + 4, oy + 8, 200, 30, 30);
      setPixel(ox + 9, oy + 5, 20, 20, 180);
      setPixel(ox + 12, oy + 10, 220, 200, 20);
    }
  }

  function toBuffer() {
    return PNG.sync.write(png);
  }

  return {
    setPixel,
    drawRect,
    drawCardBase,
    drawRuneBase,
    drawSoulCrystal,
    drawPill,
    toBuffer
  };
}

export async function generateAllPocketAssets() {
  await fs.ensureDir(POCKET_ASSETS_DIR);

  // 1. Major Arcana Tarot Cards (1-22)
  const TAROT_ACCENTS = [
    [210, 170, 110], // 1: 0 - Fool
    [150, 100, 220], // 2: I - Magician
    [100, 160, 240], // 3: II - High Priestess
    [220, 80, 120],  // 4: III - Empress
    [200, 50, 50],   // 5: IV - Emperor
    [80, 140, 240],  // 6: V - Hierophant
    [240, 60, 100],  // 7: VI - Lovers
    [120, 200, 80],  // 8: VII - Chariot
    [240, 200, 60],  // 9: VIII - Justice
    [140, 120, 100], // 10: IX - Hermit
    [220, 150, 40],  // 11: X - Wheel
    [200, 90, 40],   // 12: XI - Strength
    [100, 180, 220], // 13: XII - Hanged Man
    [40, 40, 50],    // 14: XIII - Death
    [200, 50, 50],   // 15: XIV - Temperance
    [180, 20, 20],   // 16: XV - Devil
    [120, 110, 100], // 17: XVI - Tower
    [90, 160, 250],  // 18: XVII - Stars
    [180, 190, 220], // 19: XVIII - Moon
    [255, 210, 40],  // 20: XIX - Sun
    [200, 170, 70],  // 21: XX - Judgement
    [60, 180, 160]   // 22: XXI - World
  ];

  for (let id = 1; id <= 22; id++) {
    const canvas = createPixelCanvas();
    canvas.drawCardBase(228, 198, 152, 60, 45, 30);
    const accent = TAROT_ACCENTS[id - 1] || [180, 150, 100];
    canvas.drawRect(11, 10, 10, 12, accent[0], accent[1], accent[2]);
    canvas.drawRect(12, 11, 8, 10, Math.min(255, accent[0] + 35), Math.min(255, accent[1] + 35), Math.min(255, accent[2] + 35));
    canvas.drawRect(12, 6, 8, 2, 70, 50, 30);
    canvas.drawRect(13, 24, 6, 1, 90, 65, 40);

    const buf = canvas.toBuffer();
    await fs.writeFile(path.join(POCKET_ASSETS_DIR, `card_${String(id).padStart(2, '0')}.png`), buf);
    await fs.writeFile(path.join(POCKET_ASSETS_DIR, `card_${id}.png`), buf);
  }

  // 2. Reverse Tarot Cards (101-122)
  for (let id = 101; id <= 122; id++) {
    const canvas = createPixelCanvas();
    canvas.drawCardBase(45, 12, 22, 25, 5, 10);
    const baseIdx = id - 101;
    const accent = TAROT_ACCENTS[baseIdx] || [180, 40, 40];
    canvas.drawRect(11, 10, 10, 12, 180, 20, 40);
    canvas.drawRect(12, 11, 8, 10, Math.max(0, accent[0] - 30), 10, 20);
    canvas.drawRect(14, 13, 4, 2, 255, 80, 100);
    canvas.drawRect(16, 15, 2, 3, 255, 80, 100);
    canvas.drawRect(16, 19, 2, 2, 255, 100, 120);
    canvas.drawRect(12, 6, 8, 2, 220, 30, 50);

    const buf = canvas.toBuffer();
    await fs.writeFile(path.join(POCKET_ASSETS_DIR, `card_${id}.png`), buf);
  }

  // 3. Special Playing Cards (31-46)
  const SPECIAL_CARDS = [
    { id: 31, name: 'Chaos Card', bg: [20, 15, 30], fg: [180, 60, 240] },
    { id: 32, name: 'Credit Card', bg: [18, 18, 18], fg: [240, 200, 60] },
    { id: 33, name: 'Rules Card', bg: [210, 185, 140], fg: [90, 60, 40] },
    { id: 34, name: 'Card Against Humanity', bg: [10, 10, 10], fg: [240, 240, 240] },
    { id: 35, name: 'Suicide King', bg: [220, 200, 160], fg: [200, 30, 40] },
    { id: 36, name: 'Get Out of Jail Free', bg: [235, 120, 30], fg: [255, 240, 200] },
    { id: 37, name: '? Card', bg: [20, 60, 100], fg: [60, 220, 255] },
    { id: 38, name: 'Dice Shard', bg: [180, 25, 35], fg: [255, 255, 255] },
    { id: 39, name: 'Emergency Contact', bg: [200, 40, 40], fg: [255, 220, 100] },
    { id: 40, name: 'Holy Card', bg: [245, 245, 255], fg: [120, 180, 255] },
    { id: 41, name: 'Huge Growth', bg: [40, 140, 60], fg: [200, 255, 120] },
    { id: 42, name: 'Ancient Recall', bg: [30, 80, 180], fg: [240, 210, 60] },
    { id: 43, name: 'Era Walk', bg: [140, 110, 80], fg: [240, 220, 160] },
    { id: 44, name: 'Wild Card', bg: [40, 30, 60], fg: [250, 100, 200] },
    { id: 45, name: 'Queen of Hearts', bg: [230, 210, 190], fg: [230, 30, 60] },
    { id: 46, name: 'Joker', bg: [60, 20, 100], fg: [240, 180, 40] }
  ];

  for (const c of SPECIAL_CARDS) {
    const canvas = createPixelCanvas();
    canvas.drawCardBase(c.bg[0], c.bg[1], c.bg[2], 30, 25, 20);
    canvas.drawRect(11, 10, 10, 12, c.fg[0], c.fg[1], c.fg[2]);
    canvas.drawRect(12, 11, 8, 10, Math.min(255, c.fg[0] + 30), Math.min(255, c.fg[1] + 30), Math.min(255, c.fg[2] + 30));
    canvas.drawRect(13, 6, 6, 2, c.fg[0], c.fg[1], c.fg[2]);

    const buf = canvas.toBuffer();
    await fs.writeFile(path.join(POCKET_ASSETS_DIR, `card_${c.id}.png`), buf);
  }

  // 4. Runes (23-30, 47, 48)
  const RUNES = [
    { id: 23, name: 'Hagalaz', glow: [120, 180, 240] },
    { id: 24, name: 'Jera', glow: [240, 180, 60] },
    { id: 25, name: 'Ehwaz', glow: [160, 110, 70] },
    { id: 26, name: 'Dagaz', glow: [100, 220, 140] },
    { id: 27, name: 'Ansuz', glow: [180, 140, 240] },
    { id: 28, name: 'Perthro', glow: [230, 80, 120] },
    { id: 29, name: 'Berkano', glow: [120, 210, 80] },
    { id: 30, name: 'Algiz', glow: [80, 230, 230] },
    { id: 47, name: 'Blank Rune', glow: [200, 210, 220] },
    { id: 48, name: 'Black Rune', glow: [160, 40, 200], isDark: true }
  ];

  for (const r of RUNES) {
    const canvas = createPixelCanvas();
    if (r.isDark) {
      canvas.drawRuneBase(45, 35, 55);
    } else {
      canvas.drawRuneBase(135, 140, 150);
    }
    const g = r.glow;
    canvas.drawRect(14, 10, 4, 12, g[0], g[1], g[2]);
    canvas.drawRect(12, 12, 8, 2, g[0], g[1], g[2]);
    canvas.drawRect(12, 18, 8, 2, g[0], g[1], g[2]);
    canvas.drawRect(15, 11, 2, 10, Math.min(255, g[0] + 50), Math.min(255, g[1] + 50), Math.min(255, g[2] + 50));

    const buf = canvas.toBuffer();
    await fs.writeFile(path.join(POCKET_ASSETS_DIR, `card_${r.id}.png`), buf);
    await fs.writeFile(path.join(POCKET_ASSETS_DIR, `rune_${r.id}.png`), buf);
  }

  // 5. Soul Stones (49-65)
  const SOUL_STONES = [
    { id: 49, name: 'Soul of Isaac', color: [70, 130, 240], glow: [140, 190, 255] },
    { id: 50, name: 'Soul of Magdalene', color: [240, 110, 160], glow: [255, 180, 210] },
    { id: 51, name: 'Soul of Cain', color: [230, 130, 40], glow: [255, 190, 100] },
    { id: 52, name: 'Soul of Judas', color: [190, 30, 40], glow: [255, 90, 100] },
    { id: 53, name: 'Soul of ???', color: [60, 170, 220], glow: [130, 220, 255] },
    { id: 54, name: 'Soul of Eve', color: [140, 40, 180], glow: [210, 110, 255] },
    { id: 55, name: 'Soul of Samson', color: [210, 60, 40], glow: [255, 120, 90] },
    { id: 56, name: 'Soul of Azazel', color: [40, 30, 45], glow: [160, 30, 50] },
    { id: 57, name: 'Soul of Lazarus', color: [100, 180, 70], glow: [170, 240, 130] },
    { id: 58, name: 'Soul of Eden', color: [220, 230, 245], glow: [255, 255, 255] },
    { id: 59, name: 'Soul of The Lost', color: [200, 220, 255], glow: [240, 250, 255] },
    { id: 60, name: 'Soul of Lilith', color: [100, 30, 140], glow: [180, 80, 230] },
    { id: 61, name: 'Soul of The Keeper', color: [220, 180, 50], glow: [255, 225, 110] },
    { id: 62, name: 'Soul of Apollyon', color: [120, 120, 130], glow: [190, 190, 200] },
    { id: 63, name: 'Soul of The Forgotten', color: [220, 215, 200], glow: [250, 245, 235] },
    { id: 64, name: 'Soul of Bethany', color: [240, 200, 80], glow: [255, 240, 150] },
    { id: 65, name: 'Soul of Jacob & Esau', color: [180, 60, 100], glow: [90, 160, 240] }
  ];

  for (const s of SOUL_STONES) {
    const canvas = createPixelCanvas();
    canvas.drawSoulCrystal(s.color[0], s.color[1], s.color[2], s.glow[0], s.glow[1], s.glow[2]);

    const buf = canvas.toBuffer();
    await fs.writeFile(path.join(POCKET_ASSETS_DIR, `card_${s.id}.png`), buf);
    await fs.writeFile(path.join(POCKET_ASSETS_DIR, `soul_${s.id}.png`), buf);
  }

  // 6. Pills (201-220)
  const PILL_COLORS = [
    [[50, 120, 230], [240, 240, 250]],   // 201: Blue/White
    [[230, 40, 40], [240, 240, 250]],    // 202: Red/White
    [[240, 200, 40], [230, 120, 30]],    // 203: Yellow/Orange
    [[240, 240, 250], [60, 180, 220]],   // 204: White/Cyan
    [[20, 20, 25], [240, 240, 250]],     // 205: Black/White
    [[240, 90, 150], [240, 240, 250]],   // 206: Pink/White
    [[80, 190, 60], [240, 240, 250]],    // 207: Green/White
    [[140, 60, 200], [240, 240, 250]],   // 208: Purple/White
    [[240, 200, 40], [240, 240, 250]],   // 209: Yellow/White
    [[50, 120, 230], [60, 180, 220]],    // 210: Blue/Cyan
    [[230, 40, 40], [180, 30, 40]],      // 211: Red/Dark Red
    [[240, 240, 250], [240, 240, 250], true], // 212: Speckled White
    [[100, 200, 240], [240, 110, 160]],  // 213: Cyan/Pink
    [[240, 130, 30], [240, 240, 250]],   // 214: Orange/White
    [[180, 40, 40], [50, 120, 230]],     // 215: Red/Blue
    [[240, 220, 60], [50, 180, 80]],     // 216: Yellow/Green
    [[70, 40, 120], [240, 240, 250]],    // 217: Violet/White
    [[230, 140, 40], [180, 40, 40]],     // 218: Orange/Red
    [[60, 180, 160], [240, 240, 250]],   // 219: Teal/White
    [[240, 240, 250], [140, 140, 150]]   // 220: White/Grey
  ];

  for (let id = 201; id <= 220; id++) {
    const canvas = createPixelCanvas();
    const pillCfg = PILL_COLORS[id - 201] || [[200, 50, 50], [240, 240, 250]];
    canvas.drawPill(pillCfg[0], pillCfg[1], !!pillCfg[2]);

    const buf = canvas.toBuffer();
    await fs.writeFile(path.join(POCKET_ASSETS_DIR, `card_${id}.png`), buf);
    await fs.writeFile(path.join(POCKET_ASSETS_DIR, `pill_${id}.png`), buf);
  }

  console.log('All pocket item and consumable pixel assets generated successfully!');
}

generateAllPocketAssets().catch(err => {
  console.error('Error generating pocket assets:', err);
});
