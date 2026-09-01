import path from 'path';
import fs from 'fs-extra';
import { PNG } from 'pngjs';
import xml2js from 'xml2js';
import {
  compositeCoopMenuPng,
  generateCoopMenuAnm2,
  generateCharacterMenuAnm2,
  generateCharacterPortraitsAnm2
} from '../server/services/anm2Generator.js';
import { serializeCharacterToXmlAttributes, buildPlayersXml } from '../server/services/characterManager.js';
import { createCustomMod } from '../server/services/modExporter.js';
import { APP_ROOT, updateConfig } from '../server/config.js';
import { g as generateRandomCharacter } from '../client/dist/app-assets/data-randomizer-Dl8Nt_8b.js';

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    console.log(`✔ ${msg}`);
    passed++;
  } else {
    console.error(`❌ ${msg}`);
    failed++;
  }
}

async function runVerification() {
  console.log('\n--- Starting Greed, Co-op & Dual Pool Verification ---');

  const testModsDir = path.join(APP_ROOT, 'test', 'test_mods_output_full');
  await fs.ensureDir(testModsDir);
  updateConfig({ modsPath: testModsDir, gamePath: '' });

  // 1. Verify Greed Mode ANM2 & XML Crash Protection
  const primaryChar = {
    name: 'Apollo',
    skin: 'character_001_isaac.png',
    items: [1, 2],
    isDual: true,
    twinName: 'Diana',
    twinSkin: 'character_003x_esau.png',
    twinItems: [105, 118],
    twinTrinket: 1,
    twinHp: 4,
    twinArmor: 2,
    twinDamage: 4.2,
    twinTears: 3.1
  };

  const charMenuAnm2 = generateCharacterMenuAnm2([primaryChar], true);
  assert(charMenuAnm2.includes('Animation Name="Greed"'), 'charactermenu.anm2 includes Greed animation');
  assert(charMenuAnm2.includes('Animation Name="BloodStain"'), 'charactermenu.anm2 includes BloodStain animation');
  assert(charMenuAnm2.includes('Animation Name="00_Random"'), 'charactermenu.anm2 includes 00_Random animation');

  const portAnm2 = generateCharacterPortraitsAnm2([primaryChar]);
  assert(portAnm2.includes('Animation Name="00_Random"'), 'characterportraits.anm2 includes 00_Random animation');

  // Verify XML attribute serialization: no invalid id or achievement
  const xmlAttrs = serializeCharacterToXmlAttributes(primaryChar);
  assert(xmlAttrs.id === undefined, 'serializeCharacterToXmlAttributes omits id for modded character');
  assert(xmlAttrs.achievement === undefined, 'serializeCharacterToXmlAttributes omits achievement for modded character');

  const fullPlayersXml = buildPlayersXml([primaryChar]);
  assert(fullPlayersXml.includes('<player name="Apollo &amp; Diana"'), 'players.xml contains primary dual character');
  assert(fullPlayersXml.includes('<player name="Apollo &amp; Diana (Diana)"') || fullPlayersXml.includes('Apollo &amp; Diana (Diana)'), 'players.xml contains twin partner');
  assert(fullPlayersXml.includes('items="105,118"'), 'players.xml serializes twin starting items pool');
  assert(fullPlayersXml.includes('trinket="1"'), 'players.xml serializes twin starting trinket');
  assert(fullPlayersXml.includes('achievement="-2"'), 'players.xml sets achievement="-2" on twin partner');
  assert(fullPlayersXml.includes('hidden="true"'), 'players.xml hides twin partner from selection wheel');

  // 2. Verify Co-op Menu Preservation & Extension
  const coopMenuAnm2 = generateCoopMenuAnm2([primaryChar]);
  assert(coopMenuAnm2.includes('Animation Name="Main"'), 'coop menu.anm2 preserves vanilla Main animation');
  assert(coopMenuAnm2.includes('Animation Name="Arrows"'), 'coop menu.anm2 preserves Arrows animation');
  assert(coopMenuAnm2.includes('Animation Name="Apollo &amp; Diana"'), 'coop menu.anm2 includes custom primary character animation');
  assert(coopMenuAnm2.includes('Apollo &amp; Diana (Diana)'), 'coop menu.anm2 includes custom twin partner animation');

  // Test compositeCoopMenuPng
  const skinBuf = Buffer.alloc(32 * 32 * 4, 180);
  const coopPngBuf = await compositeCoopMenuPng('', [primaryChar], [skinBuf, skinBuf]);
  assert(coopPngBuf && coopPngBuf.length > 500, 'compositeCoopMenuPng returned valid PNG buffer');
  const coopPng = PNG.sync.read(coopPngBuf);
  assert(coopPng.width === 256 && coopPng.height === 256, 'coop menu.png dimensions are 256x256');

  // Verify vanilla Isaac head is preserved in slot (0,0)
  let vanillaSlotPixels = 0;
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const idx = (y * coopPng.width + x) * 4;
      if (coopPng.data[idx + 3] > 10) vanillaSlotPixels++;
    }
  }
  assert(vanillaSlotPixels > 100, `Vanilla character heads preserved in coop menu.png (${vanillaSlotPixels} px in slot 0,0)`);

  // Verify custom character head is placed at x=192
  let customSlotPixels = 0;
  for (let y = 0; y < 32; y++) {
    for (let x = 192; x < 224; x++) {
      const idx = (y * coopPng.width + x) * 4;
      if (coopPng.data[idx + 3] > 10) customSlotPixels++;
    }
  }
  assert(customSlotPixels > 0, `Custom character head placed at x=192 in coop menu.png (${customSlotPixels} px)`);

  // 3. Verify Mod Compilation & Lua Script
  const modResult = await createCustomMod(primaryChar, { modsPath: testModsDir });
  assert(modResult.success, 'createCustomMod succeeded');
  const luaContent = await fs.readFile(path.join(modResult.modPath, 'main.lua'), 'utf8');
  assert(luaContent.includes('OnRender_Apollo_Diana_TwinHUD'), 'main.lua includes twin bottom-right HUD render callback');
  assert(luaContent.includes('ui_hearts.anm2'), 'main.lua loads ui_hearts.anm2 for HUD health rendering');
  assert(luaContent.includes('player:AddCollectible(105'), 'main.lua injects twin starting item 105');
  assert(luaContent.includes('player:AddCollectible(118'), 'main.lua injects twin starting item 118');
  assert(luaContent.includes('player:AddTrinket(1'), 'main.lua injects twin starting trinket');

  // Verify files in content/gfx/
  const contentGfx = path.join(modResult.modPath, 'content', 'gfx');
  assert(await fs.pathExists(path.join(contentGfx, 'charactermenu.png')), 'content/gfx/charactermenu.png created');
  assert(await fs.pathExists(path.join(contentGfx, 'charactermenu.anm2')), 'content/gfx/charactermenu.anm2 created');
  assert(await fs.pathExists(path.join(contentGfx, 'coop menu.png')), 'content/gfx/coop menu.png created');
  assert(await fs.pathExists(path.join(contentGfx, 'coop menu.anm2')), 'content/gfx/coop menu.anm2 created');
  assert(await fs.pathExists(path.join(contentGfx, 'baby_select.png')), 'content/gfx/baby_select.png copied');
  assert(await fs.pathExists(path.join(contentGfx, 'coop menu b.png')), 'content/gfx/coop menu b.png copied');

  // 4. Verify Dual Character 2-Pool Randomizer
  console.log('\nTesting Dual Character 2-Pool Randomizer (100 runs)...');
  const mockCollectibles = [
    { id: 1, name: 'The Sad Onion', type: 'passive' },
    { id: 2, name: 'The Inner Eye', type: 'passive' },
    { id: 105, name: 'The D6', type: 'active' },
    { id: 118, name: 'Brimstone', type: 'passive' }
  ];
  const mockTrinkets = [
    { id: 1, name: 'Swallowed Penny' },
    { id: 2, name: 'Petrified Poop' }
  ];

  let dualRuns = 0;
  let twinItemsGenerated = 0;
  for (let i = 0; i < 100; i++) {
    const res = generateRandomCharacter({ isDual: true }, mockCollectibles, mockTrinkets, []);
    assert(res.name.includes(' & '), `Run ${i+1}: Name "${res.name}" uses " & " dual format`);
    assert(res.twinName.length > 0, `Run ${i+1}: Twin name "${res.twinName}" is populated`);
    assert(res.pocketactive === 0, `Run ${i+1}: Pocket active item is never an active item`);
    assert(res.twinHp > 0, `Run ${i+1}: Twin HP is populated (${res.twinHp})`);
    if (res.twinItems && res.twinItems.length > 0) {
      twinItemsGenerated++;
    }
    dualRuns++;
  }
  assert(dualRuns === 100, '100 dual character randomizer runs executed');
  assert(twinItemsGenerated > 0, `Twin starting items generated across runs (${twinItemsGenerated}/100)`);

  console.log(`\n======================================================`);
  console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
