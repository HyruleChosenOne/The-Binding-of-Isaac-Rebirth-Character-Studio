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
  resolveUiPath
} from '../server/services/assetResolver.js';
import { scanGameAndMods } from '../server/services/gameScanner.js';
import { scanModdedItems } from '../server/services/itemDatabase.js';
import { VANILLA_CHARACTERS } from '../server/services/vanillaCharacters.js';
import { getConfig, updateConfig, resetConfig, ASSETS_DIR, DATA_DIR, APP_ROOT } from '../server/config.js';

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    console.log(`  [PASS] ${msg}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${msg}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('  RUNNING ASSET ENGINE RESOLUTION TEST SUITE');
  console.log('======================================================\n');

  // Test 1: Config with empty game path (Standalone mode)
  console.log('--- Test Group 1: Standalone Config (No Game Install) ---');
  resetConfig();
  const cfg = getConfig();
  assert(cfg.gamePath === '', 'Config starts with empty gamePath in standalone mode');
  assert(cfg.useBundledVanillaAssets === true, 'useBundledVanillaAssets is enabled by default');

  await refreshAssetIndex();

  // Test 2: Verify all 34 vanilla characters resolve from bundled assets
  console.log('\n--- Test Group 2: Vanilla Character Sprites & Portraits ---');
  assert(VANILLA_CHARACTERS.length === 34, `Vanilla character catalog contains exactly 34 characters (found ${VANILLA_CHARACTERS.length})`);

  let resolvedSpritesCount = 0;
  let resolvedPortraitsCount = 0;

  for (const char of VANILLA_CHARACTERS) {
    const skinPath = await resolveSpritePath(char.skin);
    const portraitPath = await resolvePortraitPath(char.portrait);
    if (skinPath && fs.existsSync(skinPath)) resolvedSpritesCount++;
    if (portraitPath && fs.existsSync(portraitPath)) resolvedPortraitsCount++;
  }

  assert(resolvedSpritesCount === 34, `All 34 characters resolve skins from bundled assets (${resolvedSpritesCount}/34)`);
  assert(resolvedPortraitsCount === 34, `All 34 characters resolve portraits from bundled assets (${resolvedPortraitsCount}/34)`);

  // Test 3: Verify Aliases
  console.log('\n--- Test Group 3: Character Sprite & Portrait Aliases ---');
  const aliasSprite = await resolveSpritePath('character_001_isaac_b.png');
  assert(aliasSprite && aliasSprite.includes('character_001b_isaac.png'), `Alias character_001_isaac_b.png -> ${aliasSprite}`);

  const aliasPortrait = await resolvePortraitPath('playerportrait_01_isaac.png');
  assert(aliasPortrait && aliasPortrait.includes('playerportrait_isaac.png'), `Alias playerportrait_01_isaac.png -> ${aliasPortrait}`);

  // Test 4: Verify Collectibles & Trinkets by numeric ID
  console.log('\n--- Test Group 4: Collectibles & Trinkets by ID ---');
  const item1 = await resolveItemPathById(1); // The Sad Onion
  assert(item1 && fs.existsSync(item1), `Collectible #1 resolves to ${path.basename(item1 || '')}`);

  const item100 = await resolveItemPathById(100);
  assert(item100 && fs.existsSync(item100), `Collectible #100 resolves to ${path.basename(item100 || '')}`);

  const trinket1 = await resolveTrinketPathById(1); // Swallowed Penny
  assert(trinket1 && fs.existsSync(trinket1), `Trinket #1 resolves to ${path.basename(trinket1 || '')}`);

  const pocket1 = await resolvePocketPathById(1); // 01_fool.png
  assert(pocket1 && fs.existsSync(pocket1), `Pocket #1 resolves to ${path.basename(pocket1 || '')}`);

  // Test 5: Verify UI Hearts
  console.log('\n--- Test Group 5: UI HUD Hearts ---');
  const heartRed = await resolveUiPath('hearts', 'heart_red_full.png');
  assert(heartRed && fs.existsSync(heartRed), `UI Heart heart_red_full.png resolves to ${heartRed}`);

  const heartBone = await resolveUiPath('hearts', 'heart_bone_full.png');
  assert(heartBone && fs.existsSync(heartBone), `UI Heart heart_bone_full.png resolves to ${heartBone}`);

  // Test 6: Verify scanGameAndMods in standalone mode
  console.log('\n--- Test Group 6: Game & Mod Scanner in Standalone Mode ---');
  const scanRes = await scanGameAndMods('', '', '');
  assert(scanRes.gameDetected === false, 'gameDetected is false without gamePath');
  assert(scanRes.availableSprites.length >= 34, `availableSprites has ${scanRes.availableSprites.length} sprites from bundled assets`);
  assert(scanRes.availablePortraits.length >= 34, `availablePortraits has ${scanRes.availablePortraits.length} portraits from bundled assets`);

  // Test 7: Modded Item Support (Dynamic Active Scanning)
  console.log('\n--- Test Group 7: Dynamic Mod Item Scanning ---');
  const mockModsDir = path.join(APP_ROOT, 'test', 'mock_mods');
  const sampleModDir = path.join(mockModsDir, 'test_custom_mod');
  await fs.ensureDir(path.join(sampleModDir, 'content', 'gfx', 'items', 'collectibles'));

  await fs.writeFile(
    path.join(sampleModDir, 'metadata.xml'),
    `<metadata><name>Test Custom Mod</name><directory>test_custom_mod</directory><version>1.0</version></metadata>`,
    'utf8'
  );

  // Write a 1x1 mock PNG
  const mockPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  await fs.writeFile(path.join(sampleModDir, 'content', 'gfx', 'items', 'collectibles', 'collectibles_super_sword.png'), mockPng);

  updateConfig({ modsPath: mockModsDir });
  await refreshAssetIndex();

  const modScan = await scanModdedItems(mockModsDir, '');
  assert(modScan.items.length > 0, `scanModdedItems found ${modScan.items.length} custom modded item(s)`);

  const resolvedModItem = await resolveItemPathByFilename('collectibles_super_sword.png', 'test_custom_mod');
  assert(resolvedModItem && fs.existsSync(resolvedModItem), `resolveItemPathByFilename found mod item at ${resolvedModItem}`);

  // Cleanup mock mod
  await fs.remove(mockModsDir).catch(() => {});

  console.log('\n======================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
