import assert from 'assert';
import fs from 'fs-extra';
import path from 'path';
import { buildPlayersXml, serializeCharacterToXmlAttributes } from '../server/services/characterManager.js';
import { generateLuaScript } from '../server/services/modExporter.js';
import {
  generateCharacterMenuAnm2,
  resolveCharacterStartingItem,
  compositeCharacterMenuPng,
  CUSTOM_ITEM_ICON_CROP,
  CUSTOM_TWIN_ITEM_ICON_CROP
} from '../server/services/anm2Generator.js';

console.log('=== RUNNING COMPREHENSIVE DUAL CHARACTER & FORGOTTEN TESTS ===\n');

// -------------------------------------------------------------
// Test 1: Dual Character XML serialization with twin loadout
// -------------------------------------------------------------
console.log('Test 1: Dual Character players.xml serialization...');
const dualChar = {
  name: 'Castor',
  twinName: 'Pollux',
  isDual: true,
  skin: 'character_001_isaac.png',
  twinSkin: 'character_003x_esau.png',
  hp: 6,
  armor: 0,
  items: [1, 2], // The Sad Onion, The Inner Eye
  trinket: 1, // Swallowed Penny
  pocketactive: 105, // The D6
  twinHp: 2,
  twinArmor: 2,
  twinBone: 2,
  twinItems: [3, 4], // Spoon Bender, Cricket's Head
  twinTrinket: 2, // Petrified Poop
  twinPocketactive: 33, // The Bible
  twinCard: 1, // 0 - The Fool
  damage: 3.5,
  twinDamage: 4.0
};

const dualXml = buildPlayersXml([dualChar], 'repentanceplus');
assert(dualXml.includes('name="Castor &amp; Pollux"'), 'Primary character name should include "& Pollux"');
assert(dualXml.includes('items="1,2"'), 'Primary character items should serialize');
assert(dualXml.includes('pocketactive="105"'), 'Primary character pocketactive should serialize');
assert(dualXml.includes('name="Castor &amp; Pollux (Pollux)"'), 'Twin subplayer element should exist');
assert(dualXml.includes('items="3,4"'), 'Twin items should serialize');
assert(dualXml.includes('pocketactive="33"'), 'Twin pocketactive should serialize');
assert(dualXml.includes('bone="2"'), 'Twin bone hearts should serialize');
assert(dualXml.includes('hidden="true"'), 'Twin subplayer must be hidden="true"');
console.log('✓ Test 1 Passed: Dual character XML serializes primary and partner equipment cleanly.\n');

// -------------------------------------------------------------
// Test 2: The Forgotten Archetype XML serialization
// -------------------------------------------------------------
console.log('Test 2: The Forgotten Archetype XML serialization...');
const forgottenChar = {
  name: 'Grimm',
  archetype: 'forgotten',
  skin: 'character_017_theforgotten.png',
  hp: 0,
  bone: 4,
  items: [508] // Compound Fracture
};

const forgottenXml = buildPlayersXml([forgottenChar], 'repentanceplus');
assert(forgottenXml.includes('costumeSuffix="forgotten"'), 'Forgotten must have costumeSuffix="forgotten"');
assert(forgottenXml.includes('bone="4"'), 'Forgotten must have bone="4" (2 Bone Hearts)');
assert(forgottenXml.includes('skinColor="5"'), 'Forgotten must have skinColor="5"');
assert(forgottenXml.includes('name="Grimm (The Soul)"'), 'Forgotten must generate The Soul subplayer element');
assert(forgottenXml.includes('costumeSuffix="forgottensoul"'), 'The Soul must have costumeSuffix="forgottensoul"');
assert(forgottenXml.includes('flying="true"'), 'The Soul must have flying="true"');
console.log('✓ Test 2 Passed: The Forgotten archetype and chained Soul partner serialize accurately.\n');

// -------------------------------------------------------------
// Test 3: Dual Character In-Game Lua & HUD Heart Animations
// -------------------------------------------------------------
console.log('Test 3: Dual Character In-Game Lua script and HUD repair...');
const luaScript = generateLuaScript([dualChar], 'TestDualMod');
assert(luaScript.includes('ResolveTwinType_Castor_Pollux'), 'Lua should include dynamic twin type resolver');
assert(luaScript.includes('TrySpawnTwin_Castor_Pollux'), 'Lua should include robust spawner');
assert(luaScript.includes('MC_POST_GAME_STARTED'), 'Lua should hook MC_POST_GAME_STARTED for new runs');
assert(luaScript.includes('MC_POST_UPDATE'), 'Lua should hook MC_POST_UPDATE as tick fallback');
assert(luaScript.includes('addplayer'), 'Lua should issue addplayer command with controller index');

// Verify authentic HUD animation frame names from ui_hearts.anm2
assert(luaScript.includes('RedHeartFull'), 'HUD must use authentic RedHeartFull animation');
assert(luaScript.includes('RedHeartHalf'), 'HUD must use authentic RedHeartHalf animation');
assert(luaScript.includes('EmptyHeart'), 'HUD must use authentic EmptyHeart animation');
assert(luaScript.includes('BlueHeartFull'), 'HUD must use authentic BlueHeartFull animation');
assert(luaScript.includes('BoneHeartFull'), 'HUD must use authentic BoneHeartFull animation');
assert(luaScript.includes('BrokenHeart'), 'HUD must use authentic BrokenHeart animation');
assert(!luaScript.includes('twinHeartsSprite_Castor_Pollux:SetFrame("HeartFull"'), 'HUD must NOT use non-existent HeartFull animation');
assert(!luaScript.includes('twinHeartsSprite_Castor_Pollux:SetFrame("SoulHeart"'), 'HUD must NOT use non-existent SoulHeart animation');
console.log('✓ Test 3 Passed: Lua script spawner and bottom-right Jacob & Esau HUD render correctly.\n');

// -------------------------------------------------------------
// Test 4: Character Menu ANM2 & PNG Dual Item Compositing
// -------------------------------------------------------------
console.log('Test 4: Character menu ANM2 & PNG dual item display...');
const anm2Output = generateCharacterMenuAnm2([dualChar], true, true);
assert(anm2Output.includes('LayerId="7" Visible="true"'), 'Layer 7 (Primary Item Icon) must be visible');
assert(anm2Output.includes('LayerId="8" Visible="true"'), 'Layer 8 (Primary Item Name) must be visible');
assert(anm2Output.includes('LayerId="12" Visible="true"'), 'Layer 12 (Twin Item Icon) must be visible');
assert(anm2Output.includes('LayerId="13" Visible="true"'), 'Layer 13 (Twin Item Name) must be visible');
assert(anm2Output.includes(`XCrop="${CUSTOM_TWIN_ITEM_ICON_CROP.x}"`), 'Layer 12 must crop from CUSTOM_TWIN_ITEM_ICON_CROP');

const primaryItemInfo = await resolveCharacterStartingItem(dualChar, null, false);
const twinItemInfo = await resolveCharacterStartingItem(dualChar, null, true);
assert(primaryItemInfo !== null, 'Primary starting item should be resolved');
assert(twinItemInfo !== null, 'Twin starting item should be resolved');
console.log(`Resolved Primary Item: ${primaryItemInfo?.itemName || 'Item #105'}`);
console.log(`Resolved Twin Item: ${twinItemInfo?.itemName || 'Item #33'}`);
console.log('✓ Test 4 Passed: Character menu ANM2 and items resolve for both characters.\n');

// -------------------------------------------------------------
// Test 5: The Forgotten Archetype Lua Generation
// -------------------------------------------------------------
console.log('Test 5: The Forgotten Archetype Lua generation...');
const forgottenLua = generateLuaScript([forgottenChar], 'TestForgottenMod');
assert(forgottenLua.includes('player:AddNullCostume(44)'), 'Forgotten Lua should set costume 44');
assert(forgottenLua.includes('player.Damage = math.max(0.1, (player.Damage + flatDamageBonus) * dmgMultiplier)'), 'Damage calculation should apply');
console.log('✓ Test 5 Passed: The Forgotten archetype Lua mechanics generated cleanly.\n');

console.log('=============================================================');
console.log('ALL DUAL CHARACTER & FORGOTTEN TESTS PASSED SUCCESSFULLY! ✓');
console.log('=============================================================');
