import path from 'path';
import fs from 'fs-extra';
import { createCustomMod, getCustomStudioCharacters } from '../server/services/modExporter.js';
import { saveCharacterEdit } from '../server/services/characterManager.js';
import { resetConfig, updateConfig, APP_ROOT } from '../server/config.js';

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

async function runTest() {
  console.log('\n======================================================');
  console.log('  TESTING CHARACTER COMPILATION & MOD EXPORT');
  console.log('======================================================\n');

  const testModsDir = path.join(APP_ROOT, 'test', 'test_mods_output');
  await fs.ensureDir(testModsDir);
  updateConfig({ modsPath: testModsDir, gamePath: '' });

  const sampleCharacter = {
    name: 'Shadow Warrior',
    skin: 'character_001_isaac.png',
    portrait: 'playerportrait_isaac.png',
    hp: 3,
    armor: 1,
    black: 1,
    coins: 5,
    bombs: 2,
    keys: 1,
    items: [1, 2, 3], // Sad Onion, Inner Eye, Spoon Bender
    trinket: 1,
    pocketItem: 1,
    speed: 1.15,
    damage: 4.5,
    damageMult: 1.2,
    tears: 3.0,
    range: 6.5,
    shotspeed: 1.0,
    luck: 2.0,
    flying: false,
    canShoot: true,
    hue: 180,
    sat: 120,
    bri: 90,
    con: 100,
    birthrightDesc: 'Unleashes dark shadows upon clearing rooms.'
  };

  try {
    console.log('--- Compiling Character Mod ---');
    const result = await createCustomMod(sampleCharacter, { modsPath: testModsDir, targetDLC: 'repentanceplus' });
    assert(result && result.folderName, `createCustomMod succeeded with folder: ${result?.folderName}`);
    assert(fs.existsSync(result.modPath), `Generated mod directory exists at: ${result?.modPath}`);

    // Verify generated files
    const mainLua = path.join(result.modPath, 'main.lua');
    assert(fs.existsSync(mainLua), `main.lua was created`);

    const playersXml = path.join(result.modPath, 'content', 'players.xml');
    assert(fs.existsSync(playersXml), `content/players.xml was created`);

    const metadataXml = path.join(result.modPath, 'metadata.xml');
    assert(fs.existsSync(metadataXml), `metadata.xml was created`);

    const characterSkin = path.join(result.modPath, 'resources', 'gfx', 'characters', 'costumes', 'character_shadow_warrior.png');
    assert(fs.existsSync(characterSkin), `Character skin sprite was created`);

    const stagePortrait = path.join(result.modPath, 'resources', 'gfx', 'ui', 'stage', 'playerportrait_shadow_warrior.png');
    assert(fs.existsSync(stagePortrait), `Stage portrait was created`);

    // Verify content/gfx menu assets
    const menuPng = path.join(result.modPath, 'content', 'gfx', 'charactermenu.png');
    assert(fs.existsSync(menuPng), `content/gfx/charactermenu.png was created`);

    const menuAnm2 = path.join(result.modPath, 'content', 'gfx', 'charactermenu.anm2');
    assert(fs.existsSync(menuAnm2), `content/gfx/charactermenu.anm2 was created`);
    if (fs.existsSync(menuAnm2)) {
      const anm2Content = await fs.readFile(menuAnm2, 'utf8');
      assert(anm2Content.includes('Animation Name="Shadow Warrior"'), `charactermenu.anm2 contains Animation Name="Shadow Warrior"`);
      assert(anm2Content.includes('DefaultAnimation="Shadow Warrior"'), `charactermenu.anm2 contains DefaultAnimation="Shadow Warrior"`);
    }

    const portraitsAnm2 = path.join(result.modPath, 'content', 'gfx', 'characterportraits.anm2');
    assert(fs.existsSync(portraitsAnm2), `content/gfx/characterportraits.anm2 was created`);

    // Verify studio discovery of created character
    const discovered = await getCustomStudioCharacters(testModsDir);
    assert(discovered.length > 0, `getCustomStudioCharacters discovered ${discovered.length} character(s)`);
    assert(discovered[0].name === 'Shadow Warrior', `Discovered character name is "${discovered[0]?.name}"`);

    // Ensure getCustomStudioCharacters did NOT delete content/gfx
    assert(fs.existsSync(menuPng), `content/gfx/charactermenu.png is preserved after getCustomStudioCharacters`);
    assert(fs.existsSync(menuAnm2), `content/gfx/charactermenu.anm2 is preserved after getCustomStudioCharacters`);

    console.log('\n======================================================');
    console.log(`  CHARACTER COMPILATION: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');
  } catch (err) {
    console.error('[FAIL] Character compilation threw exception:', err);
    failed++;
  } finally {
    await fs.remove(testModsDir).catch(() => {});
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
