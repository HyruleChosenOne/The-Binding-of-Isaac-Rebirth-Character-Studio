import fs from 'fs-extra';
import path from 'path';
import xml2js from 'xml2js';
import { generateCharacterPortraitsAnm2, generateCharacterMenuAnm2, generateCoopMenuAnm2, generateDeathScreenAnm2, escapeXml } from '../server/services/anm2Generator.js';
import { createCustomMod, generateLuaScript } from '../server/services/modExporter.js';
import { buildPlayersXml } from '../server/services/characterManager.js';
import { g as generateRandomCharacter } from '../client/dist/app-assets/data-randomizer-Dl8Nt_8b.js';

async function runTests() {
  console.log('--- Starting Dual Character & Randomizer Verification ---');

  const parser = new xml2js.Parser();

  // Test 1: ANM2 generation with ampersand & special characters
  const testChar = {
    name: 'John & Isaac',
    isDual: true,
    twinName: 'Isaac',
    skin: 'character_001_isaac.png',
    twinSkin: 'character_003x_esau.png',
    items: [105],
    card: 1
  };

  const portraitsXml = generateCharacterPortraitsAnm2([testChar]);
  const menuXml = generateCharacterMenuAnm2([testChar]);
  const coopXml = generateCoopMenuAnm2([testChar]);
  const deathXml = generateDeathScreenAnm2([testChar]);

  await parser.parseStringPromise(portraitsXml);
  console.log('✔ characterportraits.anm2 is valid XML');

  await parser.parseStringPromise(menuXml);
  console.log('✔ charactermenu.anm2 is valid XML');

  await parser.parseStringPromise(coopXml);
  console.log('✔ coop menu.anm2 is valid XML');

  await parser.parseStringPromise(deathXml);
  console.log('✔ death screen.anm2 is valid XML');

  // Test 2: players.xml generation with dual character
  const playersXmlStr = buildPlayersXml([testChar], 'repentanceplus');
  const parsedPlayers = await parser.parseStringPromise(playersXmlStr);
  console.log('✔ players.xml is valid XML');
  
  if (parsedPlayers.players.player.length !== 2) {
    throw new Error(`Expected 2 player entries (primary + twin), got ${parsedPlayers.players.player.length}`);
  }
  const primaryXml = parsedPlayers.players.player[0].$;
  const twinXml = parsedPlayers.players.player[1].$;
  
  if (primaryXml.name !== 'John & Isaac') {
    throw new Error(`Primary player name should be "John & Isaac", got "${primaryXml.name}"`);
  }
  if (twinXml.name !== 'John & Isaac (Isaac)') {
    throw new Error(`Twin player name should be "John & Isaac (Isaac)", got "${twinXml.name}"`);
  }
  if (twinXml.achievement !== '-2' || twinXml.hidden !== 'true') {
    throw new Error(`Twin player missing achievement="-2" or hidden="true"`);
  }
  if (twinXml.canSpawn !== undefined) {
    throw new Error(`Twin player should not contain non-standard canSpawn attribute`);
  }
  console.log('✔ players.xml primary and twin records match Repentance engine requirements');

  // Test 3: Lua script generation
  const lua = generateLuaScript([testChar], 'CustomChar_john_isaac');
  if (!lua.includes('SafeGetPlayerType("John & Isaac (Isaac)"')) {
    throw new Error('Lua script does not have safe twin player type resolution');
  }
  if (!lua.includes('Game():GetNumPlayers()')) {
    throw new Error('Lua dual spawner does not use Game():GetNumPlayers()');
  }
  console.log('✔ main.lua dual spawner and entity resolution are robust');

  // Test 4: Custom Mod Compilation
  const testModDir = path.resolve('test/temp_test_mod');
  await fs.remove(testModDir);
  await fs.ensureDir(testModDir);

  const modRes = await createCustomMod(testChar, { targetDir: testModDir, name: 'Custom Character - John & Isaac' });
  if (!modRes || modRes.error) {
    throw new Error(`createCustomMod failed: ${modRes?.error}`);
  }

  const metaContent = await fs.readFile(path.join(testModDir, 'metadata.xml'), 'utf8');
  await parser.parseStringPromise(metaContent);
  console.log('✔ metadata.xml is valid XML and parsed cleanly');

  // Clean up test mod directory
  await fs.remove(testModDir);

  // Test 5: Randomizer Pocket Section and Dual Naming (100 iterations)
  console.log('\nTesting Randomizer (100 runs)...');
  for (let i = 0; i < 100; i++) {
    const isDualChoice = i % 2 === 0;
    const randomized = generateRandomCharacter({ isDual: isDualChoice, pocketMode: 'random' }, [], [], []);
    
    // Check pocket items: never active items
    if (randomized.pocketactive && randomized.pocketactive > 0) {
      throw new Error(`Randomizer generated pocketactive > 0 (${randomized.pocketactive}) in run #${i}`);
    }
    if (randomized.pocketData && randomized.pocketData.type === 'active') {
      throw new Error(`Randomizer generated active pocket item in run #${i}: ${JSON.stringify(randomized.pocketData)}`);
    }

    // Check dual naming
    if (randomized.isDual) {
      if (!randomized.name.includes(' & ')) {
        throw new Error(`Dual character does not have 2 names joined by ' & ': "${randomized.name}" in run #${i}`);
      }
      const parts = randomized.name.split(' & ');
      if (parts.length < 2 || !parts[0].trim() || !parts[1].trim()) {
        throw new Error(`Dual character name format invalid: "${randomized.name}" in run #${i}`);
      }
      if (!randomized.twinName) {
        throw new Error(`Dual character missing twinName in run #${i}`);
      }
    }
  }
  console.log('✔ Randomizer never generates active items in pocket section');
  console.log('✔ Randomizer generates 2 names (e.g. "Name1 & Name2") whenever dual character is enabled');

  console.log('\nALL VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉');
}

runTests().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
