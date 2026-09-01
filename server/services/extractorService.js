import fs from 'fs-extra';
import path from 'path';
import { spawn } from 'child_process';
import { importGameAssets } from './assetImporter.js';
import { refreshAssetIndex } from '../routes/assets.js';
import { getConfig } from '../config.js';

let activeProcess = null;
let extractionLogs = [];
let isExtracting = false;
let extractionPeriodicTimer = null;

export function getExtractionStatus() {
  return {
    isExtracting,
    logs: extractionLogs.slice(-100)
  };
}

export function startExtraction(gamePath) {
  if (isExtracting) {
    return { success: false, message: 'Extraction is already running.' };
  }

  if (!gamePath) {
    gamePath = getConfig().gamePath;
  }

  const possibleExtractorPaths = [
    path.join(gamePath || '', 'tools', 'ResourceExtractor', 'ResourceExtractor.exe'),
    path.join(gamePath || '', 'tools', 'ResourceExtractor.exe'),
    path.join(gamePath || '', 'ResourceExtractor.exe')
  ];

  let extractorExe = null;
  for (const p of possibleExtractorPaths) {
    if (fs.existsSync(p)) {
      extractorExe = p;
      break;
    }
  }

  if (!extractorExe) {
    return {
      success: false,
      message: `ResourceExtractor.exe not found in game directory (${gamePath})`
    };
  }

  const workingDir = path.dirname(extractorExe);
  extractionLogs = [`[Extraction Started] Running ResourceExtractor.exe in ${workingDir}...`];
  isExtracting = true;

  try {
    activeProcess = spawn(extractorExe, [], {
      cwd: workingDir,
      shell: true
    });

    if (activeProcess.stdin) {
      activeProcess.stdin.write('y\r\ny\r\ny\r\n');
    }

    // Periodically feed 'y' confirmation during startup in case of multiple prompts
    if (extractionPeriodicTimer) clearInterval(extractionPeriodicTimer);
    let promptFeedCount = 0;
    extractionPeriodicTimer = setInterval(() => {
      promptFeedCount++;
      if (activeProcess && activeProcess.stdin && isExtracting) {
        try {
          activeProcess.stdin.write('y\r\n');
        } catch {}
      }
      if (promptFeedCount > 6 || !isExtracting) {
        clearInterval(extractionPeriodicTimer);
        extractionPeriodicTimer = null;
      }
    }, 1000);

    activeProcess.stdout.on('data', data => {
      const text = data.toString();
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      extractionLogs.push(...lines);
      if (extractionLogs.length > 500) {
        extractionLogs = extractionLogs.slice(-500);
      }
    });

    activeProcess.stderr.on('data', data => {
      extractionLogs.push(`[ERR] ${data.toString()}`);
    });

    activeProcess.on('close', async (code) => {
      isExtracting = false;
      activeProcess = null;
      if (extractionPeriodicTimer) {
        clearInterval(extractionPeriodicTimer);
        extractionPeriodicTimer = null;
      }

      extractionLogs.push(`[Extraction Finished] Process completed with exit code: ${code}`);
      extractionLogs.push(`[Asset Import] Direct indexing of extracted vanilla sprites, portraits, items, and UI...`);

      try {
        const importResult = await importGameAssets(gamePath, getConfig().modsPath);
        await refreshAssetIndex();
        extractionLogs.push(
          `[Asset Import Success] Indexed ${importResult.itemIconsImported} item icons, ${importResult.spritesImported} character sprites, ${importResult.portraitsImported} portraits, ${importResult.pocketImported} pocket items.`
        );
      } catch (err) {
        extractionLogs.push(`[Asset Import Error] ${err.message}`);
      }
    });

    return { success: true, message: 'Resource extraction started in background.' };
  } catch (err) {
    isExtracting = false;
    activeProcess = null;
    if (extractionPeriodicTimer) {
      clearInterval(extractionPeriodicTimer);
      extractionPeriodicTimer = null;
    }
    return { success: false, message: `Failed to launch extractor: ${err.message}` };
  }
}

