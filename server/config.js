import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Application root directory (independent of process.cwd())
export const APP_ROOT = path.resolve(__dirname, '..');
export const DATA_DIR = path.join(APP_ROOT, 'server', 'data');
export const ASSETS_DIR = path.join(DATA_DIR, 'assets');

const userHome = os.homedir();

const DRIVES = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

// Dynamically build candidate paths for Isaac Installation across all Windows drives
export const DEFAULT_GAME_PATHS = [
  ...DRIVES.flatMap(d => [
    `${d}:\\SteamLibrary\\steamapps\\common\\The Binding of Isaac Rebirth`,
    `${d}:\\Games\\steamapps\\common\\The Binding of Isaac Rebirth`,
    `${d}:\\Steam\\steamapps\\common\\The Binding of Isaac Rebirth`,
    `${d}:\\Games\\The Binding of Isaac Rebirth`,
    `${d}:\\Program Files (x86)\\Steam\\steamapps\\common\\The Binding of Isaac Rebirth`,
    `${d}:\\Program Files\\Steam\\steamapps\\common\\The Binding of Isaac Rebirth`
  ]),
  path.join(userHome, 'Steam', 'steamapps', 'common', 'The Binding of Isaac Rebirth'),
  path.join(userHome, '.local', 'share', 'Steam', 'steamapps', 'common', 'The Binding of Isaac Rebirth')
];

// Candidate paths for Mods Directory
export const DEFAULT_MOD_PATHS = [
  path.join(userHome, 'Documents', 'My Games', 'Binding of Isaac Repentance+', 'mods'),
  path.join(userHome, 'Documents', 'My Games', 'Binding of Isaac Repentance', 'mods'),
  path.join(userHome, 'Documents', 'My Games', 'Binding of Isaac Afterbirth+ Mods'),
  ...DRIVES.flatMap(d => [
    `${d}:\\SteamLibrary\\steamapps\\common\\The Binding of Isaac Rebirth\\mods`,
    `${d}:\\Games\\steamapps\\common\\The Binding of Isaac Rebirth\\mods`,
    `${d}:\\Steam\\steamapps\\common\\The Binding of Isaac Rebirth\\mods`,
    `${d}:\\Program Files (x86)\\Steam\\steamapps\\common\\The Binding of Isaac Rebirth\\mods`
  ])
];

// Candidate paths for Workshop Directory (App ID 250900 = The Binding of Isaac: Rebirth)
export const DEFAULT_WORKSHOP_PATHS = [
  ...DRIVES.flatMap(d => [
    `${d}:\\SteamLibrary\\steamapps\\workshop\\content\\250900`,
    `${d}:\\Games\\steamapps\\workshop\\content\\250900`,
    `${d}:\\Steam\\steamapps\\workshop\\content\\250900`,
    `${d}:\\Program Files (x86)\\Steam\\steamapps\\workshop\\content\\250900`,
    `${d}:\\Program Files\\Steam\\steamapps\\workshop\\content\\250900`
  ]),
  path.join(userHome, 'Steam', 'steamapps', 'workshop', 'content', '250900')
];

function initSyncPaths() {
  let detectedGamePath = DEFAULT_GAME_PATHS.find(p => fs.existsSync(p)) || '';
  let detectedModsPath = DEFAULT_MOD_PATHS.find(p => fs.existsSync(p)) || '';
  let detectedWorkshopPath = DEFAULT_WORKSHOP_PATHS.find(p => fs.existsSync(p)) || '';

  if (detectedGamePath) {
    if (!detectedModsPath) {
      const internalMods = path.join(detectedGamePath, 'mods');
      if (fs.existsSync(internalMods)) detectedModsPath = internalMods;
    }
    if (!detectedWorkshopPath) {
      const candidateWs = path.resolve(detectedGamePath, '..', '..', 'workshop', 'content', '250900');
      if (fs.existsSync(candidateWs)) detectedWorkshopPath = candidateWs;
    }
  }

  return {
    gamePath: detectedGamePath,
    modsPath: detectedModsPath,
    workshopPath: detectedWorkshopPath,
    targetDLC: 'repentanceplus',
    useBundledVanillaAssets: true
  };
}

let activeConfig = initSyncPaths();

export async function detectPaths() {
  activeConfig = initSyncPaths();
  return { ...activeConfig };
}

export function getConfig() {
  return { ...activeConfig };
}

export function updateConfig(newConfig) {
  activeConfig = {
    ...activeConfig,
    ...newConfig
  };
  return { ...activeConfig };
}

export function resetConfig() {
  activeConfig = {
    gamePath: '',
    modsPath: '',
    workshopPath: '',
    targetDLC: 'repentanceplus',
    useBundledVanillaAssets: true
  };
  return { ...activeConfig };
}

