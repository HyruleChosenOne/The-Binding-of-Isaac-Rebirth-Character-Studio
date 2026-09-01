import { PNG } from 'pngjs';

/**
 * Converts RGB (0-255) to HSL (H: 0-360, S: 0-1, L: 0-1)
 */
export function rgbToHsl(r, g, b) {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h *= 60;
  }

  return [h, s, l];
}

/**
 * Converts HSL (H: 0-360, S: 0-1, L: 0-1) to RGB (0-255)
 */
export function hslToRgb(h, s, l) {
  const hNorm = ((h % 360) + 360) % 360 / 360;

  if (s === 0) {
    const gray = Math.min(255, Math.max(0, Math.round(l * 255)));
    return [gray, gray, gray];
  }

  const hue2rgb = (p, q, t) => {
    let tNorm = t;
    if (tNorm < 0) tNorm += 1;
    if (tNorm > 1) tNorm -= 1;
    if (tNorm < 1 / 6) return p + (q - p) * 6 * tNorm;
    if (tNorm < 1 / 2) return q;
    if (tNorm < 2 / 3) return p + (q - p) * (2 / 3 - tNorm) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = hue2rgb(p, q, hNorm + 1 / 3);
  const g = hue2rgb(p, q, hNorm);
  const b = hue2rgb(p, q, hNorm - 1 / 3);

  return [
    Math.min(255, Math.max(0, Math.round(r * 255))),
    Math.min(255, Math.max(0, Math.round(g * 255))),
    Math.min(255, Math.max(0, Math.round(b * 255)))
  ];
}

/**
 * Applies HSL hue rotation, saturation, brightness, and contrast transforms to raw PNG image buffer.
 * Matching the Studio's CSS: `hue-rotate(deg) saturate(%) brightness(%) contrast(%)`.
 */
export function applyHslFilterToPngBuffer(buffer, { hue = 0, sat = 100, bri = 100, con = 100 } = {}) {
  if (!buffer || buffer.length === 0) return buffer;
  
  const numHue = Number(hue) || 0;
  const numSat = sat !== undefined ? Number(sat) : 100;
  const numBri = bri !== undefined ? Number(bri) : 100;
  const numCon = con !== undefined ? Number(con) : 100;

  if (numHue === 0 && numSat === 100 && numBri === 100 && numCon === 100) {
    return buffer;
  }

  try {
    let cleanBuffer = buffer;
    const iendIdx = cleanBuffer.indexOf(Buffer.from('IEND'));
    if (iendIdx !== -1 && cleanBuffer.length > iendIdx + 8) {
      cleanBuffer = cleanBuffer.subarray(0, iendIdx + 8);
    }
    const png = PNG.sync.read(cleanBuffer, { checkCRC: false });
    const data = png.data;
    const satFactor = numSat / 100;
    const briFactor = numBri / 100;
    const conFactor = numCon / 100;

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (alpha === 0) continue; // Skip fully transparent pixels

      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      let [h, s, l] = rgbToHsl(r, g, b);

      // 1. Rotate Hue
      if (numHue !== 0) {
        h = (h + numHue + 360) % 360;
      }

      // 2. Adjust Saturation
      if (satFactor !== 1) {
        s = Math.max(0, Math.min(1, s * satFactor));
      }

      // 3. Adjust Brightness
      if (briFactor !== 1) {
        l = Math.max(0, Math.min(1, l * briFactor));
      }

      let [newR, newG, newB] = hslToRgb(h, s, l);

      // 4. Adjust Contrast (anchored at mid-tone 128)
      if (conFactor !== 1) {
        newR = Math.min(255, Math.max(0, Math.round(((newR / 255 - 0.5) * conFactor + 0.5) * 255)));
        newG = Math.min(255, Math.max(0, Math.round(((newG / 255 - 0.5) * conFactor + 0.5) * 255)));
        newB = Math.min(255, Math.max(0, Math.round(((newB / 255 - 0.5) * conFactor + 0.5) * 255)));
      }

      data[i] = newR;
      data[i + 1] = newG;
      data[i + 2] = newB;
    }

    return PNG.sync.write(png);
  } catch (err) {
    console.warn('Could not apply HSL filter to PNG buffer:', err.message);
    return buffer;
  }
}

/**
 * Applies HSL filter to a Base64 data URL string and returns the new data URL.
 */
export function applyHslFilterToDataUrl(dataUrl, filterParams) {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) return dataUrl;
  try {
    const b64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    const inBuf = Buffer.from(b64, 'base64');
    const outBuf = applyHslFilterToPngBuffer(inBuf, filterParams);
    return `data:image/png;base64,${outBuf.toString('base64')}`;
  } catch (err) {
    return dataUrl;
  }
}
