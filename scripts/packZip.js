import fs from 'fs-extra';
import path from 'path';
import archiver from 'archiver';
import { execSync } from 'child_process';

async function buildZip() {
  console.log('=====================================================');
  console.log('  ISAAC CHARACTER STUDIO — RELEASE PACKAGER');
  console.log('=====================================================');

  // 1. Ensure all built-in UI assets, glyphs, and offline sprites are bundled for foreign machines
  console.log('[1/5] Syncing and validating built-in assets for standalone portability...');
  const baseAssetsDir = path.join(process.cwd(), 'server', 'data', 'assets');
  const clientUiDir = path.join(process.cwd(), 'client', 'src', 'assets', 'ui');

  const uiDir = path.join(baseAssetsDir, 'ui');
  await fs.ensureDir(uiDir);
  if (await fs.pathExists(clientUiDir)) {
    await fs.copy(clientUiDir, uiDir, { overwrite: false }).catch(() => {});
  }

  const isaacToolsServerDir = path.join(baseAssetsDir, 'isaac-tools');
  const isaacToolsClientDir = path.join(process.cwd(), 'client', 'public', 'isaac-tools');
  await fs.ensureDir(isaacToolsServerDir);
  if (await fs.pathExists(isaacToolsClientDir)) {
    await fs.copy(isaacToolsClientDir, isaacToolsServerDir).catch(() => {});
  }

  const overridesFile = path.join(process.cwd(), 'server', 'data', 'character_overrides.json');
  if (!await fs.pathExists(overridesFile)) {
    await fs.writeJson(overridesFile, {}, { spaces: 2 }).catch(() => {});
  }

  // Remove test script if present
  await fs.remove(path.join(process.cwd(), 'server', 'scripts', 'test_fixes.js')).catch(() => {});

  // 2. Ensure fresh production build of client if client source exists
  console.log('[2/5] Preparing client distribution bundle...');
  if (await fs.pathExists(path.join(process.cwd(), 'client', 'package.json'))) {
    try {
      execSync('npm --prefix client run build', { stdio: 'inherit' });
    } catch (err) {
      console.warn('[WARN] Client build command warning (continuing with existing dist):', err.message);
    }
  } else if (await fs.pathExists(path.join(process.cwd(), 'client', 'dist'))) {
    console.log('[INFO] Using pre-built client/dist bundle.');
  }

  const outputZipPath = path.join(process.cwd(), 'IsaacCharacterStudio-v0.8.zip');
  if (await fs.pathExists(outputZipPath)) {
    await fs.remove(outputZipPath);
  }

  console.log('[3/5] Initializing maximum compression ZIP stream...');

  const output = fs.createWriteStream(outputZipPath);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });

  const completionPromise = new Promise((resolve, reject) => {
    output.on('close', function() {
      const sizeMB = (archive.pointer() / (1024 * 1024)).toFixed(2);
      console.log(`[SUCCESS] Generated ${path.basename(outputZipPath)}`);
      console.log(`Total Compressed Size: ${sizeMB} MB (${archive.pointer()} bytes)`);
      resolve(outputZipPath);
    });

    archive.on('error', function(err) {
      reject(err);
    });
  });

  archive.pipe(output);

  console.log('[4/5] Adding project components to archive (excluding unnecessary files)...');

  // Helper to add files recursively with strict exclusion filter
  async function addDirectoryFiltered(sourceDir, destDir, customExclude = () => false) {
    if (!await fs.pathExists(sourceDir)) return;
    const entries = await fs.readdir(sourceDir, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(sourceDir, entry.name);
      const destPath = path.join(destDir, entry.name).replace(/\\/g, '/');
      const lName = entry.name.toLowerCase();

      // Exclude unnecessary files (markdown tests, git, logs, backups, junk)
      if (
        (lName.endsWith('.md') && destDir !== '') ||
        lName.startsWith('.git') ||
        lName === '.ds_store' ||
        lName === 'thumbs.db' ||
        lName.endsWith('.tmp') ||
        lName.endsWith('.bak') ||
        lName.startsWith('test_') ||
        lName.endsWith('.test.js') ||
        lName === 'test_mod_output' ||
        lName === 'mock_mods' ||
        customExclude(srcPath, entry)
      ) {
        continue;
      }

      if (entry.isDirectory()) {
        await addDirectoryFiltered(srcPath, destPath, customExclude);
      } else {
        archive.file(srcPath, { name: destPath });
      }
    }
  }

  // 1. Root Launcher & Essential Configuration
  archive.file('Launch-IsaacStudio.bat', { name: 'Launch-IsaacStudio.bat' });
  archive.file('package.json', { name: 'package.json' });
  if (await fs.pathExists('README.md')) {
    archive.file('README.md', { name: 'README.md' });
  }

  // 2. Portable Runtime (Node.js standalone executable)
  if (await fs.pathExists('runtime/')) {
    await addDirectoryFiltered('runtime/', 'runtime');
  }

  // 3. Server Code & Assets
  archive.file('server/index.js', { name: 'server/index.js' });
  archive.file('server/config.js', { name: 'server/config.js' });
  await addDirectoryFiltered('server/data/', 'server/data');
  await addDirectoryFiltered('server/routes/', 'server/routes');
  await addDirectoryFiltered('server/services/', 'server/services');
  await addDirectoryFiltered('server/scripts/', 'server/scripts', (src) => src.includes('test_'));

  // 4. Production Client Dist
  if (await fs.pathExists('client/dist/')) {
    await addDirectoryFiltered('client/dist/', 'client/dist');
  }

  // 5. Production Helper Scripts (Only keep essential runtime & user tools)
  const allowedScripts = ['recompileAllCustomMods.js', 'buildDatabase.js', 'syncTranslations.js', 'packZip.js'];
  for (const scriptName of allowedScripts) {
    const sPath = path.join(process.cwd(), 'scripts', scriptName);
    if (await fs.pathExists(sPath)) {
      archive.file(sPath, { name: `scripts/${scriptName}` });
    }
  }

  // 6. Production Node Modules (Strictly exclude devDependencies & non-runtime bloat)
  const devDepPrefixes = [
    '@img', '@esbuild', 'esbuild', 'sharp', 'concurrently', 'rxjs', 'date-fns',
    'tree-kill', 'spawn-command', 'supports-color', 'chalk', 'cliui', 'wrap-ansi',
    'string-width', 'strip-ansi', 'ansi-styles', 'ansi-regex', 'y18n', 'yargs', 'yargs-parser', 'tslib'
  ];

  if (await fs.pathExists('node_modules/')) {
    await addDirectoryFiltered('node_modules/', 'node_modules', (src) => {
      const lower = src.toLowerCase().replace(/\\/g, '/');
      const relPath = lower.replace(/^.*\/node_modules\//, '');
      const topPkg = relPath.split('/')[0];
      const secondPkg = relPath.split('/')[1];

      // Exclude devDependencies packages
      if (devDepPrefixes.includes(topPkg) || (topPkg.startsWith('@') && devDepPrefixes.includes(`${topPkg}/${secondPkg}`))) {
        return true;
      }

      // Exclude documentation, tests, maps, typings, examples, bins
      return (
        lower.endsWith('.md') ||
        lower.endsWith('.markdown') ||
        lower.endsWith('.ts') ||
        lower.endsWith('.d.ts') ||
        lower.endsWith('.map') ||
        lower.endsWith('.flow') ||
        lower.endsWith('.c') ||
        lower.endsWith('.h') ||
        lower.endsWith('.cc') ||
        lower.includes('/test/') ||
        lower.includes('/tests/') ||
        lower.includes('/.bin/') ||
        lower.includes('/example/') ||
        lower.includes('/examples/') ||
        lower.includes('/docs/') ||
        lower.includes('/coverage/')
      );
    });
  }

  console.log('[5/5] Finalizing archive compression...');
  await archive.finalize();
  return completionPromise;
}

buildZip().catch(err => {
  console.error('Packaging failed:', err);
  process.exit(1);
});

