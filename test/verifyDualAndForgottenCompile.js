import assert from 'assert';
import fs from 'fs-extra';
import path from 'path';
import { createCustomMod } from '../server/services/modExporter.js';

console.log('=== TESTING FULL MOD COMPILATION FOR DUAL CHARACTER AND THE FORGOTTEN ===\n');

const testOutputDir = path.resolve('test/test_mods_output_dual_forgotten');
await fs.emptyDir(testOutputDir);

// Test 1: Compile Dual Character Mod
console.log('1. Compiling Dual Character Mod...');
const dualCharData = {
  name: 'Apollo & Diana',
  twinName: 'Diana',
  modTitle: 'Apollo & Diana: The Celestial Twins',
  modDescription: 'A custom dual character duo.',
  skin: 'character_001_isaac.png',
  twinSkin: 'character_003x_esau.png',
  isDual: true,
  hp: 6,
  armor: 0,
  items: [1, 182], // Sad Onion, Sacred Heart
  pocketactive: 105, // The D6
  trinket: 1, // Swallowed Penny
  twinHp: 2,
  twinArmor: 2,
  twinItems: [3, 245], // Spoon Bender, 20/20
  twinPocketactive: 33, // The Bible
  twinTrinket: 2, // Petrified Poop
  twinCard: 1 // The Fool
};

const dualModResult = await createCustomMod(dualCharData, testOutputDir);
assert(dualModResult.success, 'Dual character mod creation must succeed');
const dualModPath = dualModResult.modPath;

// Verify players.xml
const dualPlayersXml = await fs.readFile(path.join(dualModPath, 'content', 'players.xml'), 'utf8');
assert(dualPlayersXml.includes('name="Apollo &amp; Diana"'), 'Primary character name in players.xml');
assert(dualPlayersXml.includes('name="Apollo &amp; Diana (Diana)"'), 'Twin character name in players.xml');
assert(dualPlayersXml.includes('items="1,182"'), 'Primary items');
assert(dualPlayersXml.includes('items="3,245"'), 'Twin items');
assert(dualPlayersXml.includes('pocketactive="105"'), 'Primary pocketactive');
assert(dualPlayersXml.includes('pocketactive="33"'), 'Twin pocketactive');

// Verify main.lua
const dualMainLua = await fs.readFile(path.join(dualModPath, 'main.lua'), 'utf8');
assert(dualMainLua.includes('ResolveTwinType_Apollo_Diana'), 'Twin resolver in Lua');
assert(dualMainLua.includes('RedHeartFull'), 'HUD uses RedHeartFull');
assert(dualMainLua.includes('BlueHeartFull'), 'HUD uses BlueHeartFull');
assert(dualMainLua.includes('OnRender_Apollo_Diana_TwinHUD'), 'Twin HUD callback');
console.log('✓ Dual Character Mod compiled cleanly!\n');

// Test 2: Compile The Forgotten Mod
console.log('2. Compiling The Forgotten Archetype Mod...');
const forgottenCharData = {
  name: 'Grimm',
  archetype: 'forgotten',
  modTitle: 'Grimm: The Hollow Sovereign',
  modDescription: 'A skeletal warrior with bone clubs and chained soul.',
  skin: 'character_017_theforgotten.png',
  costume: 44,
  costumeSuffix: 'forgotten',
  skinColor: 5,
  hp: 0,
  bone: 4,
  items: [508, 545], // Compound Fracture, Brittle Bones
  trinket: 128
};

const forgottenModResult = await createCustomMod(forgottenCharData, testOutputDir);
assert(forgottenModResult.success, 'Forgotten mod creation must succeed');
const forgottenModPath = forgottenModResult.modPath;

// Verify players.xml
const forgottenPlayersXml = await fs.readFile(path.join(forgottenModPath, 'content', 'players.xml'), 'utf8');
assert(forgottenPlayersXml.includes('costumeSuffix="forgotten"'), 'Forgotten costumeSuffix in players.xml');
assert(forgottenPlayersXml.includes('skinColor="5"'), 'Forgotten skinColor in players.xml');
assert(forgottenPlayersXml.includes('bone="4"'), 'Forgotten bone hearts');
assert(forgottenPlayersXml.includes('name="Grimm (The Soul)"'), 'The Soul subplayer element');
assert(forgottenPlayersXml.includes('costumeSuffix="forgottensoul"'), 'The Soul costumeSuffix');

// Verify main.lua
const forgottenMainLua = await fs.readFile(path.join(forgottenModPath, 'main.lua'), 'utf8');
assert(forgottenMainLua.includes('player:AddNullCostume(44)'), 'Costume 44 set in Lua');
console.log('✓ The Forgotten Archetype Mod compiled cleanly!\n');

console.log('=============================================================');
console.log('ALL MOD COMPILATION TESTS PASSED CLEANLY! ✓');
console.log('=============================================================');
