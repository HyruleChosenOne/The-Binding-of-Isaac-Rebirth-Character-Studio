import express from 'express';
import path from 'path';
import fs from 'fs-extra';
import {
  refreshAssetIndex,
  resolveSpritePath,
  resolvePortraitPath,
  resolveNameplatePath,
  resolveItemPathById,
  resolveItemPathByFilename,
  resolveTrinketPathById,
  resolveTrinketPathByFilename,
  resolvePocketPathById,
  resolvePocketPathByFilename,
  resolveUiPath,
  FALLBACK_ITEM_SVG,
  FALLBACK_PORTRAIT_SVG,
  VANILLA_SPRITE_ALIASES,
  VANILLA_PORTRAIT_ALIASES
} from '../services/assetResolver.js';

export { refreshAssetIndex, VANILLA_SPRITE_ALIASES, VANILLA_PORTRAIT_ALIASES };

const router = express.Router();

function serveAsset(res, filePath) {
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.sendFile(filePath);
}

// 0. Serve Official Game UI Icons & HUD Hearts
router.get('/ui/hearts/:filename', async (req, res) => {
  const filePath = await resolveUiPath('hearts', req.params.filename);
  if (filePath) return serveAsset(res, filePath);
  res.status(404).send('Heart asset not found');
});

router.get('/ui/:filename', async (req, res) => {
  const filePath = await resolveUiPath('ui', req.params.filename);
  if (filePath) return serveAsset(res, filePath);
  res.status(404).send('UI asset not found');
});

// 1. Serve Costume / Base Sprites (Vanilla from bundled assets, mod-scoped with ?mod=...)
router.get('/sprites/:filename', async (req, res) => {
  const raw = req.params.filename || '';
  const modParam = (req.query.mod || '').toLowerCase();

  const filePath = await resolveSpritePath(raw, modParam);
  if (filePath) return serveAsset(res, filePath);

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.send(FALLBACK_PORTRAIT_SVG);
});

// 2. Serve Character Portraits
router.get('/portraits/:filename', async (req, res) => {
  const raw = req.params.filename || '';
  const modParam = (req.query.mod || '').toLowerCase();

  const filePath = await resolvePortraitPath(raw, modParam);
  if (filePath) return serveAsset(res, filePath);

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.send(FALLBACK_PORTRAIT_SVG);
});

// 3. Serve Boss / Character Nameplates
router.get('/names/:filename', async (req, res) => {
  const raw = req.params.filename || '';
  const filePath = await resolveNameplatePath(raw);
  if (filePath) return serveAsset(res, filePath);
  res.status(404).send('Nameplate not found');
});

// 4. Serve Collectible / Pocket Item Icon by numeric ID
router.get('/items/id/:id', async (req, res) => {
  const filePath = await resolveItemPathById(req.params.id);
  if (filePath) return serveAsset(res, filePath);

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.send(FALLBACK_ITEM_SVG);
});

// 5. Serve Trinket Icon by numeric ID
router.get('/trinkets/id/:id', async (req, res) => {
  const filePath = await resolveTrinketPathById(req.params.id);
  if (filePath) return serveAsset(res, filePath);

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.send(FALLBACK_ITEM_SVG);
});

// 6. Serve Pocket / Consumable Icon by numeric ID (Cards, Reverse Cards, Runes, Souls, Pills)
router.get(['/pocket/id/:id', '/cards/id/:id'], async (req, res) => {
  const filePath = await resolvePocketPathById(req.params.id);
  if (filePath) return serveAsset(res, filePath);

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.send(FALLBACK_ITEM_SVG);
});

// 7. Serve Pocket / Consumable by filename
router.get(['/pocket/:filename', '/cards/:filename'], async (req, res) => {
  const filePath = await resolvePocketPathByFilename(req.params.filename);
  if (filePath) return serveAsset(res, filePath);
  res.status(404).send('Pocket sprite not found');
});

// 8. Serve Item Icon by filename or relative path (Vanilla & Modded)
router.get(['/items/:filename(*)', '/items/*'], async (req, res) => {
  const rawParam = req.params.filename || req.params[0] || '';
  const modParam = (req.query.mod || '').toLowerCase();

  const filePath = await resolveItemPathByFilename(rawParam, modParam);
  if (filePath) return serveAsset(res, filePath);

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.send(FALLBACK_ITEM_SVG);
});

// 9. Serve Trinket Icon by filename or relative path (Vanilla & Modded)
router.get(['/trinkets/:filename(*)', '/trinkets/*'], async (req, res) => {
  const rawParam = req.params.filename || req.params[0] || '';
  const modParam = (req.query.mod || '').toLowerCase();

  const filePath = await resolveTrinketPathByFilename(rawParam, modParam);
  if (filePath) return serveAsset(res, filePath);

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.send(FALLBACK_ITEM_SVG);
});

// 10. Serve UI and Heart Icons
router.get(['/ui/hearts/:filename(*)', '/ui/:filename(*)'], async (req, res) => {
  const rawParam = req.params.filename || req.params[0] || '';
  const isHeart = req.path.includes('/hearts/');
  const filePath = await resolveUiPath(isHeart ? 'hearts' : 'ui', rawParam);
  if (filePath) return serveAsset(res, filePath);
  res.status(404).send('UI asset not found');
});

export default router;
