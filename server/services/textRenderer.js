import fs from 'fs-extra';
import path from 'path';
import zlib from 'zlib';
import { PNG } from 'pngjs';
import { APP_ROOT, ASSETS_DIR } from '../config.js';

/**
 * Pure Node.js 192x64 PNG Generator for Isaac Character Nameplates
 * Uses glyph PNGs from client/public/isaac-tools/chars/ or fallback bitmap font.
 */

// Simple robust PNG encoder using pngjs
function encodePng(rgbaBuffer, width, height) {
  const png = new PNG({ width, height });
  rgbaBuffer.copy(png.data);
  return PNG.sync.write(png);
}

// 5x7 Pixel Font Matrix for character drawing fallback
const FONT_5X7 = {
  'A': [0x0E, 0x11, 0x11, 0x1F, 0x11, 0x11, 0x11],
  'B': [0x1E, 0x11, 0x11, 0x1E, 0x11, 0x11, 0x1E],
  'C': [0x0E, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0E],
  'D': [0x1C, 0x12, 0x11, 0x11, 0x11, 0x12, 0x1C],
  'E': [0x1F, 0x10, 0x10, 0x1E, 0x10, 0x10, 0x1F],
  'F': [0x1F, 0x10, 0x10, 0x1E, 0x10, 0x10, 0x10],
  'G': [0x0E, 0x11, 0x10, 0x17, 0x11, 0x11, 0x0F],
  'H': [0x11, 0x11, 0x11, 0x1F, 0x11, 0x11, 0x11],
  'I': [0x0E, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0E],
  'J': [0x07, 0x02, 0x02, 0x02, 0x02, 0x12, 0x0C],
  'K': [0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11],
  'L': [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1F],
  'M': [0x11, 0x1B, 0x15, 0x11, 0x11, 0x11, 0x11],
  'N': [0x11, 0x19, 0x15, 0x13, 0x11, 0x11, 0x11],
  'O': [0x0E, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0E],
  'P': [0x1E, 0x11, 0x11, 0x1E, 0x10, 0x10, 0x10],
  'Q': [0x0E, 0x11, 0x11, 0x11, 0x15, 0x12, 0x0D],
  'R': [0x1E, 0x11, 0x11, 0x1E, 0x14, 0x12, 0x11],
  'S': [0x0E, 0x11, 0x10, 0x0E, 0x01, 0x11, 0x0E],
  'T': [0x1F, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
  'U': [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0E],
  'V': [0x11, 0x11, 0x11, 0x11, 0x11, 0x0A, 0x04],
  'W': [0x11, 0x11, 0x11, 0x15, 0x15, 0x1B, 0x11],
  'X': [0x11, 0x11, 0x0A, 0x04, 0x0A, 0x11, 0x11],
  'Y': [0x11, 0x11, 0x0A, 0x04, 0x04, 0x04, 0x04],
  'Z': [0x1F, 0x01, 0x02, 0x04, 0x08, 0x10, 0x1F],
  ' ': [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
  '0': [0x0E, 0x13, 0x15, 0x19, 0x11, 0x11, 0x0E],
  '1': [0x04, 0x0C, 0x04, 0x04, 0x04, 0x04, 0x0E],
  '2': [0x0E, 0x11, 0x01, 0x06, 0x08, 0x10, 0x1F],
  '3': [0x1E, 0x01, 0x01, 0x0E, 0x01, 0x01, 0x1E],
  '4': [0x02, 0x06, 0x0A, 0x12, 0x1F, 0x02, 0x02],
  '5': [0x1F, 0x10, 0x1E, 0x01, 0x01, 0x11, 0x0E],
  '6': [0x06, 0x08, 0x10, 0x1E, 0x11, 0x11, 0x0E],
  '7': [0x1F, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08],
  '8': [0x0E, 0x11, 0x11, 0x0E, 0x11, 0x11, 0x0E],
  '9': [0x0E, 0x11, 0x11, 0x0F, 0x01, 0x02, 0x0C],
  '-': [0x00, 0x00, 0x00, 0x1F, 0x00, 0x00, 0x00],
  '!': [0x04, 0x04, 0x04, 0x04, 0x04, 0x00, 0x04],
  '?': [0x0E, 0x11, 0x01, 0x06, 0x04, 0x00, 0x04],
  '.': [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04],
};

// Isaac Font Glyph Configuration
const GLYPH_NAMES = {
  '?': 'question',
  '!': 'exclamation',
  '.': 'dot',
  '-': 'line',
  '$': 'dollar',
  '§': 'poop',
  '@': 'smile',
  '/': 'slash',
  '%': 'the',
  '"': 'quote',
  ',': 'comma',
  '~': 'tilde'
};

const VARIANTS = {
  a: 4, b: 1, c: 2, d: 5, e: 3, f: 2, g: 2, h: 3, i: 2, j: 1, k: 3, l: 3,
  m: 2, n: 4, o: 2, p: 3, q: 1, r: 2, s: 3, t: 2, u: 3, v: 2, w: 2, x: 2,
  y: 1, z: 2,
  '0': 3, '1': 2, '2': 2, '3': 4, '4': 3, '5': 2, '6': 3, '7': 3, '8': 2, '9': 2,
  '!': 1, '?': 3, '.': 1, '-': 1, '$': 3, '§': 1, '@': 1, '/': 1, '%': 1
};

const glyphPngCache = new Map();

function getGlyphPng(char, variant = 1) {
  const cacheKey = `${char}_${variant}`;
  if (glyphPngCache.has(cacheKey)) return glyphPngCache.get(cacheKey);

  const glyphName = GLYPH_NAMES[char] || char;
  const filename = `${glyphName}_${variant}.png`;

  const searchPaths = [
    path.join(ASSETS_DIR, 'isaac-tools', 'chars', filename),
    path.join(APP_ROOT, 'client', 'dist', 'isaac-tools', 'chars', filename),
    path.join(APP_ROOT, 'client', 'public', 'isaac-tools', 'chars', filename)
  ];

  for (const p of searchPaths) {
    if (fs.existsSync(p)) {
      try {
        const rawBuf = fs.readFileSync(p);
        const png = PNG.sync.read(rawBuf);
        glyphPngCache.set(cacheKey, png);
        return png;
      } catch (e) {}
    }
  }

  // Fallback to variant 1 if variant N not found
  if (variant > 1) {
    return getGlyphPng(char, 1);
  }

  glyphPngCache.set(cacheKey, null);
  return null;
}

/**
 * Generates an authentic Isaac handwritten nameplate or item banner PNG buffer (192x64).
 * Matches the in-game handwritten character and item font.
 */
export function generateServerNameplatePng(text, customOptions = {}) {
  const WIDTH = customOptions.width || 192;
  const HEIGHT = customOptions.height || 64;
  const outPng = new PNG({ width: WIDTH, height: HEIGHT });

  const cleanText = (text || 'ISAAC').trim();
  const lowerText = cleanText.toLowerCase();

  // Load glyphs for all characters
  const glyphItems = [];
  let totalNaturalWidth = 0;
  const baseScale = customOptions.scale || (cleanText.length > 14 ? 22 : (cleanText.length > 10 ? 26 : 30));
  const spacing = 2;

  for (let i = 0; i < lowerText.length; i++) {
    const ch = lowerText[i];
    if (ch === ' ') {
      glyphItems.push({ space: true, width: Math.round(baseScale * 0.45) });
      totalNaturalWidth += Math.round(baseScale * 0.45);
      continue;
    }

    const maxVariants = VARIANTS[ch] || 1;
    const variant = (i % maxVariants) + 1;
    const glyph = getGlyphPng(ch, variant);

    if (glyph) {
      const aspect = glyph.width / glyph.height;
      const w = Math.round(aspect * baseScale);
      glyphItems.push({ glyph, width: w, char: ch });
      totalNaturalWidth += w + spacing;
    } else {
      // Fallback letter placeholder
      const w = Math.round(baseScale * 0.6);
      glyphItems.push({ fallback: true, width: w, char: ch });
      totalNaturalWidth += w + spacing;
    }
  }

  // Calculate scaling factor to guarantee fit within target width and height
  const maxAllowedWidth = WIDTH - 16;
  let finalScale = baseScale;
  if (totalNaturalWidth > maxAllowedWidth) {
    const fitFactor = maxAllowedWidth / totalNaturalWidth;
    finalScale = Math.max(12, Math.floor(baseScale * fitFactor));
  }

  // Recalculate dimensions with final scale
  let finalTotalWidth = 0;
  const scaledItems = glyphItems.map(item => {
    if (item.space) {
      const w = Math.round(finalScale * 0.45);
      finalTotalWidth += w;
      return { ...item, width: w, height: finalScale };
    }
    if (item.glyph) {
      const aspect = item.glyph.width / item.glyph.height;
      const w = Math.round(aspect * finalScale);
      finalTotalWidth += w + spacing;
      return { ...item, width: w, height: finalScale };
    }
    const w = Math.round(finalScale * 0.6);
    finalTotalWidth += w + spacing;
    return { ...item, width: w, height: finalScale };
  });

  const startX = Math.max(4, Math.floor((WIDTH - finalTotalWidth) / 2));
  const startY = Math.max(2, Math.floor((HEIGHT - finalScale) / 2));

  // Blit glyphs into outPng
  let curX = startX;
  for (const item of scaledItems) {
    if (item.space) {
      curX += item.width;
      continue;
    }

    if (item.glyph) {
      const src = item.glyph;
      for (let dy = 0; dy < item.height; dy++) {
        const srcY = Math.floor((dy / item.height) * src.height);
        for (let dx = 0; dx < item.width; dx++) {
          const srcX = Math.floor((dx / item.width) * src.width);
          const srcIdx = (srcY * src.width + srcX) * 4;
          const alpha = src.data[srcIdx + 3];

          if (alpha > 15) {
            const destX = curX + dx;
            const destY = startY + dy;

            if (destX >= 0 && destX < WIDTH && destY >= 0 && destY < HEIGHT) {
              const destIdx = (destY * WIDTH + destX) * 4;
              // Preserve authentic dark ink color with alpha blending
              const r = src.data[srcIdx];
              const g = src.data[srcIdx + 1];
              const b = src.data[srcIdx + 2];

              outPng.data[destIdx] = r;
              outPng.data[destIdx + 1] = g;
              outPng.data[destIdx + 2] = b;
              outPng.data[destIdx + 3] = alpha;
            }
          }
        }
      }
      curX += item.width + spacing;
    } else if (item.fallback) {
      // 5x7 block bitmap fallback for unmapped characters
      const up = item.char.toUpperCase();
      const bitmap = FONT_5X7[up] || FONT_5X7['?'];
      const scaleBlock = Math.max(2, Math.floor(finalScale / 8));

      for (let row = 0; row < 7; row++) {
        const bitRow = bitmap[row];
        for (let col = 0; col < 5; col++) {
          if ((bitRow >> (4 - col)) & 1) {
            for (let by = 0; by < scaleBlock; by++) {
              for (let bx = 0; bx < scaleBlock; bx++) {
                const destX = curX + col * scaleBlock + bx;
                const destY = startY + row * scaleBlock + by;
                if (destX >= 0 && destX < WIDTH && destY >= 0 && destY < HEIGHT) {
                  const destIdx = (destY * WIDTH + destX) * 4;
                  outPng.data[destIdx] = 0x24;
                  outPng.data[destIdx + 1] = 0x1c;
                  outPng.data[destIdx + 2] = 0x19;
                  outPng.data[destIdx + 3] = 0xff;
                }
              }
            }
          }
        }
      }
      curX += item.width + spacing;
    }
  }

  return PNG.sync.write(outPng);
}

