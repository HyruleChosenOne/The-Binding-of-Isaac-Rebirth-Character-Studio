import fs from 'fs-extra';
import path from 'path';
import xml2js from 'xml2js';
import { PNG } from 'pngjs';
import {
  generateCharacterMenuAnm2,
  generateCharacterPortraitsAnm2,
  generateCoopMenuAnm2,
  compositeCoopMenuPng,
  installCharacterMenuAnm2Assets
} from '../server/services/anm2Generator.js';
import { createCustomMod } from '../server/services/modExporter.js';

async function runTests() {
  console.log('--- Starting Greed Mode & Co-op UI Verification ---');
  const parser = new xml2js.Parser();

  // Test 1: Character Menu ANM2 System Animations (Greed / BloodStain / 00_Random)
  const testChar = {
    name: 'Glitch Boy',
    skin: 'character_001_isaac.png',
    items: [105],
    hp: 6
  };
  const menuXml = generateCharacterMenuAnm2([testChar]);
  const parsedMenu = await parser.parseStringPromise(menuXml);

  const anims = parsedMenu.AnimatedActor.Animations[0].Animation.map(a => a.$.Name);
  console.log('charactermenu.anm2 animations:', anims);

  if (!anims.includes('Glitch Boy')) throw new Error('Missing character animation in charactermenu.anm2');
  if (!anims.includes('Greed')) throw new Error('Missing "Greed" animation in charactermenu.anm2 (causes Greed Mode crash!)');
  if (!anims.includes('BloodStain')) throw new Error('Missing "BloodStain" animation in charactermenu.anm2');
  if (!anims.includes('00_Random')) throw new Error('Missing "00_Random" animation in charactermenu.anm2');
  console.log('✔ charactermenu.anm2 contains Greed, BloodStain, and 00_Random system animations');

  // Test 2: Character Portraits ANM2 00_Random Animation
  const portXml = generateCharacterPortraitsAnm2([testChar]);
  const parsedPort = await parser.parseStringPromise(portXml);
  const portAnims = parsedPort.AnimatedActor.Animations[0].Animation.map(a => a.$.Name);
  if (!portAnims.includes('00_Random')) throw new Error('Missing "00_Random" animation in characterportraits.anm2');
  console.log('✔ characterportraits.anm2 contains 00_Random animation');

  // Test 3: Co-op Menu ANM2 with Dual Character & Arrows
  const testDualChar = {
    name: 'John & Isaac',
    isDual: true,
    twinName: 'Isaac',
    skin: 'character_001_isaac.png',
    twinSkin: 'character_003x_esau.png'
  };
  const coopXml = generateCoopMenuAnm2([testDualChar]);
  const parsedCoop = await parser.parseStringPromise(coopXml);
  const coopAnims = parsedCoop.AnimatedActor.Animations[0].Animation.map(a => a.$.Name);
  console.log('coop menu.anm2 animations:', coopAnims);

  if (!coopAnims.includes('John & Isaac')) throw new Error('Missing primary animation in coop menu.anm2');
  if (!coopAnims.includes('John & Isaac (Isaac)')) throw new Error('Missing twin animation in coop menu.anm2');
  if (!coopAnims.includes('Arrows')) throw new Error('Missing "Arrows" animation in coop menu.anm2');
  console.log('✔ coop menu.anm2 includes primary character, twin partner, and Arrows indicator');

  // Test 4: Co-op Menu PNG Compositing (extracting 32x32 modified head from sprite sheet)
  const sampleSkinPath = path.resolve('server/data/assets/characters/character_001b_isaac.png');
  const sampleSkinBuf = await fs.readFile(sampleSkinPath);
  const coopPngBuf = await compositeCoopMenuPng(null, [testChar], [sampleSkinBuf]);

  if (!coopPngBuf || coopPngBuf.length < 500) throw new Error('Failed to composite coop menu.png');
  const coopPng = PNG.sync.read(coopPngBuf);
  if (coopPng.width !== 256 || coopPng.height !== 256) throw new Error('Invalid coop menu.png dimensions');

  let headPixels = 0;
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const idx = (y * coopPng.width + x) * 4;
      if (coopPng.data[idx + 3] > 10) headPixels++;
    }
  }
  if (headPixels < 100) throw new Error(`Too few head pixels in coop menu slot 0: ${headPixels}`);
  console.log(`✔ coop menu.png composited successfully with ${headPixels} head pixels in 32x32 slot`);

  // Test 5: Full Mod Compilation Test
  const tempModDir = path.resolve('test/temp_test_coop_mod');
  await fs.remove(tempModDir);
  await fs.ensureDir(tempModDir);

  const modRes = await createCustomMod(testDualChar, { targetDir: tempModDir, name: 'Custom Character - Dual Co-op' });
  if (!modRes.success) throw new Error(`createCustomMod failed: ${modRes.message}`);

  const contentCoopPng = path.join(tempModDir, 'content', 'gfx', 'coop menu.png');
  const contentCoopAnm2 = path.join(tempModDir, 'content', 'gfx', 'coop menu.anm2');
  const contentMenuAnm2 = path.join(tempModDir, 'content', 'gfx', 'charactermenu.anm2');
  const resCoopPng = path.join(tempModDir, 'resources', 'gfx', 'ui', 'main menu', 'coop menu.png');

  if (!await fs.pathExists(contentCoopPng)) throw new Error('content/gfx/coop menu.png was not generated');
  if (!await fs.pathExists(contentCoopAnm2)) throw new Error('content/gfx/coop menu.anm2 was not generated');
  if (!await fs.pathExists(resCoopPng)) throw new Error('resources/gfx/ui/main menu/coop menu.png was not generated');

  const compiledMenuAnm2 = await fs.readFile(contentMenuAnm2, 'utf8');
  if (!compiledMenuAnm2.includes('Name="Greed"')) throw new Error('Greed animation missing in compiled charactermenu.anm2');

  await fs.remove(tempModDir);
  console.log('✔ Full Mod Compilation verified: coop menu.png/anm2 and Greed mode crash protection confirmed');

  console.log('\nALL GREED MODE & CO-OP MENU TESTS PASSED! 🎉');
}

runTests().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
