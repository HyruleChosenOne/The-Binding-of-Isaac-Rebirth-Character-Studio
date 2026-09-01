import fs from 'fs-extra';
import path from 'path';
import archiver from 'archiver';
import xml2js from 'xml2js';
import { buildPlayersXml } from './characterManager.js';
import { generateServerNameplatePng } from './textRenderer.js';
import { installCharacterMenuAnm2Assets, compositeCharacterMenuPng, resolveCharacterStartingItem, escapeXml } from './anm2Generator.js';
import { getConfig, APP_ROOT, ASSETS_DIR, DATA_DIR, DEFAULT_MOD_PATHS } from '../config.js';
import { applyHslFilterToPngBuffer } from './colorRecolorService.js';



export const SKIN_TO_COSTUME = {
  // Standard Characters
  'character_001_isaac.png': 0,
  'character_002_magdalene.png': 7,
  'character_003_cain.png': 8,
  'character_004_judas.png': 9,
  'character_005_bluebaby.png': 0,
  'character_005b_bluebaby.png': 0,
  'character_006_bluebaby.png': 0,
  'character_005_eve.png': 10,
  'character_007_samson.png': 13,
  'character_008_azazel.png': 11,
  'character_009_lazarus.png': 32,
  'character_009_eden.png': 12,
  'character_010_eden.png': 12,
  'character_011_thelost.png': 0,
  'character_012_thelost.png': 0,
  'character_010_lazarus2.png': 33,
  'character_013_blackjudas.png': 0,
  'character_014_lilith.png': 34,
  'character_015_keeper.png': 47,
  'character_016_apollyon.png': 36,
  'character_017_theforgotten.png': 44,
  'character_018_thesoul.png': 0,
  'character_001x_bethany.png': 51,
  'character_018_bethany.png': 51,
  'character_019_bethany.png': 51,
  'character_002x_jacob.png': 52,
  'character_019_jacob.png': 52,
  'character_020_jacob.png': 52,
  'character_003x_esau.png': 53,

  // Tainted Characters
  'character_001_isaac_b.png': 79,
  'character_001b_isaac.png': 79,
  'character_002_magdalene_b.png': 80,
  'character_002b_magdalene.png': 80,
  'character_003_cain_b.png': 81,
  'character_003b_cain.png': 81,
  'character_004_judas_b.png': 82,
  'character_004b_judas.png': 82,
  'character_005_bluebaby_b.png': 83,
  'character_005b_bluebaby.png': 83,
  'character_005b_bluebaby_b.png': 83,
  'character_006_bluebaby_b.png': 83,
  'character_005_eve_b.png': 84,
  'character_006_eve_b.png': 84,
  'character_006b_eve.png': 84,
  'character_007_samson_b.png': 85,
  'character_007b_samson.png': 85,
  'character_008_azazel_b.png': 86,
  'character_008b_azazel.png': 86,
  'character_009_lazarus_b.png': 87,
  'character_009b_lazarus.png': 87,
  'character_009_eden_b.png': 88,
  'character_009b_eden.png': 88,
  'character_012_thelost_b.png': 89,
  'character_012b_thelost.png': 89,
  'character_014_lilith_b.png': 90,
  'character_014b_lilith.png': 90,
  'character_015_keeper_b.png': 91,
  'character_015b_keeper.png': 91,
  'character_016_apollyon_b.png': 92,
  'character_016b_apollyon.png': 92,
  'character_017_theforgotten_b.png': 93,
  'character_016b_theforgotten.png': 93,
  'character_018_bethany_b.png': 94,
  'character_018b_bethany.png': 94,
  'character_019_jacob_b.png': 95,
  'character_019b_jacob.png': 95,
  'character_009b_lazarus2.png': 104,
  'character_019b_jacob2.png': 108,
  'character_017b_thesoul.png': 105
};

export const SKIN_TO_SKIN_COLOR = {
  'character_001_isaac.png': -1,
  'character_002_magdalene.png': -1,
  'character_003_cain.png': -1,
  'character_004_judas.png': -1,
  'character_005_bluebaby.png': 2,
  'character_005b_bluebaby.png': 2,
  'character_006_bluebaby.png': 2,
  'character_005_eve.png': -1,
  'character_007_samson.png': -1,
  'character_008_azazel.png': 1,
  'character_009_lazarus.png': -1,
  'character_009_eden.png': -1,
  'character_010_eden.png': -1,
  'character_011_thelost.png': 0,
  'character_012_thelost.png': 0,
  'character_010_lazarus2.png': -1,
  'character_013_blackjudas.png': 1,
  'character_014_lilith.png': 1,
  'character_015_keeper.png': 5,
  'character_016_apollyon.png': 5,
  'character_017_theforgotten.png': 5,
  'character_018_thesoul.png': 2,
  'character_001x_bethany.png': -1,
  'character_018_bethany.png': -1,
  'character_019_bethany.png': -1,
  'character_002x_jacob.png': -1,
  'character_019_jacob.png': -1,
  'character_020_jacob.png': -1,
  'character_003x_esau.png': 3,

  // Tainted
  'character_001_isaac_b.png': -1,
  'character_001b_isaac.png': -1,
  'character_002_magdalene_b.png': -1,
  'character_002b_magdalene.png': -1,
  'character_003_cain_b.png': -1,
  'character_003b_cain.png': -1,
  'character_004_judas_b.png': 1,
  'character_004b_judas.png': 1,
  'character_005_bluebaby_b.png': 2,
  'character_005b_bluebaby.png': 2,
  'character_005b_bluebaby_b.png': 2,
  'character_006_bluebaby_b.png': 2,
  'character_005_eve_b.png': -1,
  'character_006_eve_b.png': -1,
  'character_006b_eve.png': -1,
  'character_007_samson_b.png': -1,
  'character_007b_samson.png': -1,
  'character_008_azazel_b.png': 1,
  'character_008b_azazel.png': 1,
  'character_009_lazarus_b.png': -1,
  'character_009b_lazarus.png': -1,
  'character_009_eden_b.png': -1,
  'character_009b_eden.png': -1,
  'character_012_thelost_b.png': 5,
  'character_012b_thelost.png': 5,
  'character_014_lilith_b.png': 1,
  'character_014b_lilith.png': 1,
  'character_015_keeper_b.png': 5,
  'character_015b_keeper.png': 5,
  'character_016_apollyon_b.png': 5,
  'character_016b_apollyon.png': 5,
  'character_017_theforgotten_b.png': 5,
  'character_016b_theforgotten.png': 5,
  'character_018_bethany_b.png': -1,
  'character_018b_bethany.png': -1,
  'character_019_jacob_b.png': -1,
  'character_019b_jacob.png': -1,
  'character_009b_lazarus2.png': 0,
  'character_019b_jacob2.png': 0,
  'character_017b_thesoul.png': 2
};

/**
 * Generates an isolated, safe, crash-proof main.lua script for custom characters.
 */
export function generateLuaScript(characters, modId = 'CustomCharacterMod') {
  const chars = Array.isArray(characters) ? characters : [characters];
  const safeModId = modId.replace(/[^a-zA-Z0-9_]/g, '_');

  let script = `-- =============================================================
-- Custom Character Mod Script for The Binding of Isaac: Repentance
-- Generated cleanly by Isaac Character Studio
-- =============================================================
local ${safeModId} = RegisterMod("${safeModId}", 1)

local function SafeGetPlayerType(name, isTainted)
  if not name or name == "" then return -1 end
  local success, result = pcall(function()
    local pt = Isaac.GetPlayerTypeByName(name, isTainted or false)
    if pt and pt ~= -1 then return pt end
    pt = Isaac.GetPlayerTypeByName(name, not (isTainted or false))
    if pt and pt ~= -1 then return pt end
    return -1
  end)
  if success and result and result ~= -1 then
    return result
  end
  return -1
end

`;

  for (const char of chars) {
    let rawName = (char.name || 'CustomCharacter').replace(/[^\x20-\x7E]/g, '').trim() || 'CustomCharacter';
    let secondaryName = char.twinName ? String(char.twinName).replace(/[^\x20-\x7E]/g, '').trim() : '';
    if (char.isDual) {
      if (!rawName.includes('&')) {
        if (secondaryName) {
          rawName = `${rawName} & ${secondaryName}`;
        } else {
          secondaryName = 'Isaac';
          rawName = `${rawName} & ${secondaryName}`;
        }
      } else if (!secondaryName) {
        const parts = rawName.split('&').map(s => s.trim());
        if (parts.length > 1 && parts[1]) {
          secondaryName = parts[1];
        } else {
          secondaryName = 'Isaac';
        }
      }
    }

    const cleanName = rawName.replace(/"/g, '\\"');
    const charName = rawName.replace(/[^a-zA-Z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'CustomChar';
    const isTainted = char.isTainted === true || char.isTainted === 'true';
    const isForgotten = char.archetype === 'forgotten' || char.isForgotten || char.skin === 'character_017_theforgotten.png' || char.costumeSuffix === 'forgotten';
    const gimmick = char.gimmick || 'none';
    const hasCustomSprite = !!(char.customSpriteDataUrl || char.hasCustomSprite || (char.skin && !char.skin.startsWith('character_0')));
    const costumeId = (char.costume !== undefined && char.costume !== null && Number(char.costume) > 0)
      ? Number(char.costume)
      : (hasCustomSprite ? 0 : (isForgotten ? 44 : (SKIN_TO_COSTUME[char.baseSkin || char.skin] || 0)));

    // Support both moddedItemsList (with counts) and legacy moddedItemNames
    const moddedItemsList = Array.isArray(char.moddedItemsList) ? char.moddedItemsList : [];
    const moddedItemNames = Array.isArray(char.moddedItemNames) ? char.moddedItemNames : [];
    const moddedTrinketName = (char.moddedTrinketName || '').replace(/[^\x20-\x7E]/g, '');
    const moddedPocketItemName = (char.moddedPocketItemName || '').replace(/[^\x20-\x7E]/g, '');

    // Normalize mod items into array of { name, count }
    const finalModItems = [];
    if (moddedItemsList.length > 0) {
      moddedItemsList.forEach(m => {
        if (m && m.name) {
          const qty = Math.max(1, parseInt(m.count, 10) || 1);
          finalModItems.push({ name: String(m.name).replace(/[^\x20-\x7E]/g, ''), count: qty });
        }
      });
    } else if (moddedItemNames.length > 0) {
      const counts = {};
      moddedItemNames.forEach(n => {
        if (n) {
          const cleanN = String(n).replace(/[^\x20-\x7E]/g, '');
          counts[cleanN] = (counts[cleanN] || 0) + 1;
        }
      });
      Object.entries(counts).forEach(([name, count]) => {
        finalModItems.push({ name, count });
      });
    }

    const rawTwinEntityName = secondaryName ? `${rawName} (${secondaryName})` : `${rawName} (Twin)`;
    const twinEntityName = rawTwinEntityName.replace(/"/g, '\\"');

    script += `-------------------------------------------------------------
-- Character: ${cleanName}
-------------------------------------------------------------
if EID then
  pcall(function()
    local pType = SafeGetPlayerType("${cleanName}", ${isTainted ? 'true' : 'false'})
    if pType ~= -1 then
      local birthrightDesc = "${char.birthright ? char.birthright.replace(/[^\x20-\x7E]/g, '').replace(/"/g, '\\"') : (isForgotten ? 'The Soul is freed from its chain and can move anywhere in the room.' : 'Grants unique character power boost.')}"
      EID:addBirthright(pType, birthrightDesc, "${cleanName}")
    end
  end)
end

${char.isDual ? `
local dualSpawnDone_${charName} = false
local dualSpawnCooldown_${charName} = 0
local cachedPrimaryType_${charName} = -1
local cachedTwinType_${charName} = -1

local function ResolveTwinType_${charName}()
  if cachedTwinType_${charName} and cachedTwinType_${charName} ~= -1 then
    return cachedTwinType_${charName}
  end
  local tt = SafeGetPlayerType("${twinEntityName}", ${isTainted ? 'true' : 'false'})
  if tt ~= -1 then return tt end
  ${secondaryName ? `
  tt = SafeGetPlayerType("${secondaryName.replace(/"/g, '\\"')}", ${isTainted ? 'true' : 'false'})
  if tt ~= -1 then return tt end
  tt = SafeGetPlayerType("${cleanName} (${secondaryName.replace(/"/g, '\\"')})", ${isTainted ? 'true' : 'false'})
  if tt ~= -1 then return tt end
  ` : ''}
  local primaryType = SafeGetPlayerType("${cleanName}", ${isTainted ? 'true' : 'false'})
  if primaryType == -1 and cachedPrimaryType_${charName} and cachedPrimaryType_${charName} ~= -1 then
    primaryType = cachedPrimaryType_${charName}
  end
  ${(char.name && char.name !== rawName) ? `
  if primaryType == -1 then
    primaryType = SafeGetPlayerType("${char.name.replace(/"/g, '\\"')}", ${isTainted ? 'true' : 'false'})
  end
  ` : ''}
  if primaryType ~= -1 then
    return primaryType + 1
  end
  return -1
end

local function TrySpawnTwin_${charName}(player)
  if not player or dualSpawnDone_${charName} then return end
  local twinType = ResolveTwinType_${charName}()
  if twinType == -1 then return end

  local numPlayers = 1
  pcall(function()
    if Game and Game() and Game().GetNumPlayers then
      numPlayers = Game():GetNumPlayers()
    end
  end)

  if numPlayers >= 2 then
    dualSpawnDone_${charName} = true
    return
  end

  dualSpawnDone_${charName} = true
  dualSpawnCooldown_${charName} = 45
  local ctrl = (player and player.ControllerIndex) or 0
  pcall(function()
    Isaac.ExecuteCommand("addplayer " .. tostring(twinType) .. " " .. tostring(ctrl))
  end)
end
` : ''}

function ${safeModId}:OnPlayerInit_${charName}(player)
  pcall(function()
    local pType = SafeGetPlayerType("${cleanName}", ${isTainted ? 'true' : 'false'})
    ${(char.name && char.name !== rawName) ? `
    if pType == -1 then
      pType = SafeGetPlayerType("${char.name.replace(/"/g, '\\"')}", ${isTainted ? 'true' : 'false'})
    end
    ` : ''}
    local isMatch = false
    if pType ~= -1 and player:GetPlayerType() == pType then
      isMatch = true
    ${char.isDual ? `
    elseif cachedPrimaryType_${charName} ~= -1 and player:GetPlayerType() == cachedPrimaryType_${charName} then
      isMatch = true
    elseif pType == -1 and not player:GetData()._ICS_InitDone then
      isMatch = true
    ` : ''}
    end

    if isMatch then
      ${char.isDual ? `
      cachedPrimaryType_${charName} = player:GetPlayerType()
      cachedTwinType_${charName} = player:GetPlayerType() + 1
      ` : ''}
      if not player:GetData()._ICS_InitDone then
        player:GetData()._ICS_InitDone = true

        ${char.flying ? 'player.CanFly = true' : ''}
        ${char.canShoot === false ? 'player.CanShoot = false' : ''}
        ${costumeId > 0 ? `pcall(function() player:AddNullCostume(${costumeId}) end)` : ''}
        ${char.edenOutfits ? `
        local rng = player:GetDropRNG()
        local randomHairCostume = rng:RandomInt(30) + 1
        pcall(function() player:AddNullCostume(randomHairCostume) end)
        ` : ''}
        ${gimmick === 'spectral_pass' ? 'player.GridCollisionClass = EntityGridCollisionClass.GRIDCOLL_WALLS' : ''}

        -- Custom Starting Pickups
        ${(char.coins && char.coins > 0) ? `player:AddCoins(${char.coins})` : ''}
        ${(char.bombs && char.bombs > 0) ? `player:AddBombs(${char.bombs})` : ''}
        ${(char.keys && char.keys > 0) ? `player:AddKeys(${char.keys})` : ''}

        -- Custom Starting Active Item in Pocket Slot
        ${(char.pocketactive && char.pocketactive > 0) ? `
        pcall(function()
          player:SetPocketActiveItem(${char.pocketactive}, ActiveSlot.SLOT_POCKET, true)
        end)
        ` : ''}

        -- Custom Starting Consumables
        ${(char.card && char.card > 0) ? `player:SetCard(0, ${char.card})` : ''}
        ${(char.pill && char.pill > 0) ? `player:SetPill(0, ${char.pill})` : ''}

        -- Modded Items Injection (Iterates with quantity support)
        ${finalModItems.map(m => `
        pcall(function()
          local itemId = Isaac.GetItemIdByName("${m.name}")
          if itemId and itemId > 0 then
            for _ = 1, ${m.count} do
              player:AddCollectible(itemId, 0, false)
            end
          end
        end)`).join('\n')}

        -- Modded Pocket Item Injection
        ${moddedPocketItemName ? `
        pcall(function()
          local pocketId = Isaac.GetItemIdByName("${moddedPocketItemName}")
          if pocketId and pocketId > 0 then
            player:SetPocketActiveItem(pocketId, ActiveSlot.SLOT_POCKET, true)
          else
            local cardId = Isaac.GetCardIdByName("${moddedPocketItemName}")
            if cardId and cardId > 0 then
              player:SetCard(0, cardId)
            else
              local pillId = Isaac.GetPillIdByName("${moddedPocketItemName}")
              if pillId and pillId > 0 then
                player:SetPill(0, pillId)
              end
            end
          end
        end)
        ` : ''}

        -- Modded Trinket Injection
        ${moddedTrinketName ? `
        pcall(function()
          local trinketId = Isaac.GetTrinketIdByName("${moddedTrinketName}")
          if trinketId and trinketId > 0 then
            player:AddTrinket(trinketId, false)
          end
        end)
        ` : ''}

        -- Custom Synergies Injection
        ${(char.synergies && Array.isArray(char.synergies)) ? char.synergies.map(syn => `
        pcall(function()
          ${(syn.itemIds || []).map(id => `player:AddCollectible(${id}, 0, false)`).join('\n          ')}
        end)`).join('\n') : ''}

        -- Non-Standard Heart Types
        ${(char.black && char.black > 0) ? `
        pcall(function()
          player:AddBlackHearts(${char.black})
        end)
        ` : ''}
        ${(char.bone && char.bone > 0) ? `
        pcall(function()
          player:AddBoneHearts(${char.bone})
        end)
        ` : ''}
        ${(char.rotten && char.rotten > 0) ? `
        pcall(function()
          player:AddRottenHearts(${char.rotten})
        end)
        ` : ''}
        ${(char.broken && char.broken > 0) ? `
        pcall(function()
          player:AddBrokenHearts(${char.broken})
        end)
        ` : ''}

        -- Evaluate cache flags immediately on spawn so stats apply instantly!
        player:AddCacheFlags(CacheFlag.CACHE_ALL)
        player:EvaluateItems()
      end
    end
  end)
end
${safeModId}:AddCallback(ModCallbacks.MC_POST_PLAYER_INIT, ${safeModId}.OnPlayerInit_${charName})

${char.isDual ? `
local twinHeartsSprite_${charName} = nil

function ${safeModId}:OnPlayerInit_${charName}_Twin(player)
  pcall(function()
    local twinType = ResolveTwinType_${charName}()
    if twinType ~= -1 and player:GetPlayerType() == twinType then
      if not player:GetData()._ICS_InitDone then
        player:GetData()._ICS_InitDone = true
        player:GetData()._ICS_IsTwinOf = "${cleanName}"

        -- Position twin adjacent to primary character on first frame
        pcall(function()
          local p0 = Isaac.GetPlayer(0)
          if p0 and p0 ~= player then
            player.Position = p0.Position + Vector(25, 0)
          end
        end)

        ${char.twinCostume > 0 ? `pcall(function() player:AddNullCostume(${char.twinCostume}) end)` : ''}
        ${char.twinFlying ? 'player.CanFly = true' : ''}
        ${char.twinCanShoot === false ? 'player.CanShoot = false' : ''}

        -- Second Character Custom Pickups
        ${(char.twinCoins && char.twinCoins > 0) ? `player:AddCoins(${char.twinCoins})` : ''}
        ${(char.twinBombs && char.twinBombs > 0) ? `player:AddBombs(${char.twinBombs})` : ''}
        ${(char.twinKeys && char.twinKeys > 0) ? `player:AddKeys(${char.twinKeys})` : ''}

        -- Second Character Starting Items Pool
        ${(char.twinItems && Array.isArray(char.twinItems)) ? char.twinItems.map(id => `
        pcall(function() player:AddCollectible(${id}, 0, false) end)`).join('\n') : ''}

        -- Second Character Starting Trinket
        ${(char.twinTrinket && Number(char.twinTrinket) > 0) ? `
        pcall(function() player:AddTrinket(${char.twinTrinket}, false) end)` : ''}

        -- Second Character Starting Pocket / Consumables
        ${(char.twinCard && Number(char.twinCard) > 0) ? `player:SetCard(0, ${char.twinCard})` : ''}
        ${(char.twinPill && Number(char.twinPill) > 0) ? `player:SetPill(0, ${char.twinPill})` : ''}
        ${(char.twinPocketactive && Number(char.twinPocketactive) > 0) ? `
        pcall(function() player:SetPocketActiveItem(${char.twinPocketactive}, ActiveSlot.SLOT_POCKET, true) end)` : ''}

        -- Second Character Non-Standard Heart Types
        ${char.twinBlack > 0 ? `pcall(function() player:AddBlackHearts(${char.twinBlack}) end)` : ''}
        ${char.twinBone > 0 ? `pcall(function() player:AddBoneHearts(${char.twinBone}) end)` : ''}
        ${char.twinRotten > 0 ? `pcall(function() player:AddRottenHearts(${char.twinRotten}) end)` : ''}
        ${char.twinBroken > 0 ? `pcall(function() player:AddBrokenHearts(${char.twinBroken}) end)` : ''}

        player:AddCacheFlags(CacheFlag.CACHE_ALL)
        player:EvaluateItems()
      end
    end
  end)
end
${safeModId}:AddCallback(ModCallbacks.MC_POST_PLAYER_INIT, ${safeModId}.OnPlayerInit_${charName}_Twin)

function ${safeModId}:OnGameStart_${charName}(isContinued)
  pcall(function()
    dualSpawnDone_${charName} = false
    dualSpawnCooldown_${charName} = 0
    local pType = SafeGetPlayerType("${cleanName}", ${isTainted ? 'true' : 'false'})
    if pType == -1 and cachedPrimaryType_${charName} and cachedPrimaryType_${charName} ~= -1 then
      pType = cachedPrimaryType_${charName}
    end
    local p0 = Isaac.GetPlayer(0)
    if p0 and (pType == -1 or p0:GetPlayerType() == pType) then
      TrySpawnTwin_${charName}(p0)
    end
  end)
end
${safeModId}:AddCallback(ModCallbacks.MC_POST_GAME_STARTED, ${safeModId}.OnGameStart_${charName})

function ${safeModId}:OnUpdate_${charName}_DualSpawner()
  pcall(function()
    local pType = SafeGetPlayerType("${cleanName}", ${isTainted ? 'true' : 'false'})
    if pType == -1 and cachedPrimaryType_${charName} and cachedPrimaryType_${charName} ~= -1 then
      pType = cachedPrimaryType_${charName}
    end
    local p0 = Isaac.GetPlayer(0)
    if not p0 then return end
    local isP0Primary = false
    if pType ~= -1 and p0:GetPlayerType() == pType then
      isP0Primary = true
    elseif cachedPrimaryType_${charName} ~= -1 and p0:GetPlayerType() == cachedPrimaryType_${charName} then
      isP0Primary = true
    end

    if isP0Primary then
      local numPlayers = 1
      if Game and Game() and Game().GetNumPlayers then
        numPlayers = Game():GetNumPlayers()
      end

      if numPlayers >= 2 then
        dualSpawnDone_${charName} = true
        dualSpawnCooldown_${charName} = 0
        return
      end

      if not dualSpawnDone_${charName} then
        TrySpawnTwin_${charName}(p0)
      else
        if dualSpawnCooldown_${charName} and dualSpawnCooldown_${charName} > 0 then
          dualSpawnCooldown_${charName} = dualSpawnCooldown_${charName} - 1
        else
          if numPlayers < 2 then
            dualSpawnDone_${charName} = false
          end
        end
      end
    end
  end)
end
${safeModId}:AddCallback(ModCallbacks.MC_POST_UPDATE, ${safeModId}.OnUpdate_${charName}_DualSpawner)

-- Second Character Bottom-Right HUD Health Rendering (Jacob & Esau Archetype)
function ${safeModId}:OnRender_${charName}_TwinHUD()
  pcall(function()
    local twinType = ResolveTwinType_${charName}()
    if twinType == -1 then return end
    if not Game or not Game() then return end
    local game = Game()
    local hud = (game.GetHUD and game:GetHUD()) or nil
    if hud and not hud:IsVisible() then return end

    local numPlayers = 1
    pcall(function()
      if Game().GetNumPlayers then numPlayers = Game():GetNumPlayers() end
    end)

    local twin = nil
    for i = 0, numPlayers - 1 do
      local p = Isaac.GetPlayer(i)
      if p and p:GetPlayerType() == twinType then
        twin = p
        break
      end
    end
    if not twin or twin:IsDead() then return end

    if not twinHeartsSprite_${charName} then
      twinHeartsSprite_${charName} = Sprite()
      twinHeartsSprite_${charName}:Load("gfx/ui/ui_hearts.anm2", true)
    end

    local screenW = Isaac.GetScreenWidth()
    local screenH = Isaac.GetScreenHeight()
    local hudOffset = (Options and Options.HUDOffset) or 1.0

    local maxHearts = twin:GetMaxHearts()
    local redHearts = twin:GetHearts()
    local soulHearts = twin:GetSoulHearts()
    local boneHearts = twin:GetBoneHearts()
    local brokenHearts = twin:GetBrokenHearts()
    local rottenHearts = (twin.GetRottenHearts and twin:GetRottenHearts()) or 0

    local totalContainers = math.floor(maxHearts / 2) + math.ceil(soulHearts / 2) + boneHearts + brokenHearts
    if totalContainers <= 0 then totalContainers = 1 end

    local baseX = screenW - (28 * hudOffset) - (totalContainers * 12)
    local baseY = screenH - (22 * hudOffset)

    local heartIdx = 0

    -- Bone Hearts
    for b = 1, boneHearts do
      twinHeartsSprite_${charName}:SetFrame("BoneHeartFull", 0)
      twinHeartsSprite_${charName}:Render(Vector(baseX + (heartIdx * 12), baseY), Vector(0,0), Vector(0,0))
      heartIdx = heartIdx + 1
    end

    -- Red Heart Containers
    local numRedContainers = math.floor(maxHearts / 2)
    for c = 1, numRedContainers do
      local val = redHearts - ((c - 1) * 2)
      if rottenHearts > 0 and c == 1 then
        if val >= 2 then
          twinHeartsSprite_${charName}:SetFrame("RottenHeartFull", 0)
        else
          twinHeartsSprite_${charName}:SetFrame("RottenHeartHalf", 0)
        end
      elseif val >= 2 then
        twinHeartsSprite_${charName}:SetFrame("RedHeartFull", 0)
      elseif val == 1 then
        twinHeartsSprite_${charName}:SetFrame("RedHeartHalf", 0)
      else
        twinHeartsSprite_${charName}:SetFrame("EmptyHeart", 0)
      end
      twinHeartsSprite_${charName}:Render(Vector(baseX + (heartIdx * 12), baseY), Vector(0,0), Vector(0,0))
      heartIdx = heartIdx + 1
    end

    -- Soul / Black Hearts
    local numSoul = math.ceil(soulHearts / 2)
    for s = 1, numSoul do
      local sVal = soulHearts - ((s - 1) * 2)
      local isBlack = (twin.IsBlackHeart and twin:IsBlackHeart(s)) or false
      if isBlack then
        if sVal >= 2 then
          twinHeartsSprite_${charName}:SetFrame("BlackHeartFull", 0)
        else
          twinHeartsSprite_${charName}:SetFrame("BlackHeartHalf", 0)
        end
      else
        if sVal >= 2 then
          twinHeartsSprite_${charName}:SetFrame("BlueHeartFull", 0)
        else
          twinHeartsSprite_${charName}:SetFrame("BlueHeartHalf", 0)
        end
      end
      twinHeartsSprite_${charName}:Render(Vector(baseX + (heartIdx * 12), baseY), Vector(0,0), Vector(0,0))
      heartIdx = heartIdx + 1
    end

    -- Broken Hearts
    for brk = 1, brokenHearts do
      twinHeartsSprite_${charName}:SetFrame("BrokenHeart", 0)
      twinHeartsSprite_${charName}:Render(Vector(baseX + (heartIdx * 12), baseY), Vector(0,0), Vector(0,0))
      heartIdx = heartIdx + 1
    end
  end)
end
${safeModId}:AddCallback(ModCallbacks.MC_POST_RENDER, ${safeModId}.OnRender_${charName}_TwinHUD)
` : ''}

function ${safeModId}:OnEvaluateCache_${charName}(player, cacheFlag)
  pcall(function()
    local pType = SafeGetPlayerType("${cleanName}", ${isTainted ? 'true' : 'false'})
    local twinType = ${char.isDual ? `ResolveTwinType_${charName}()` : '-1'}
    local isPrimary = (pType ~= -1 and player:GetPlayerType() == pType)
    local isTwin = (twinType ~= -1 and player:GetPlayerType() == twinType)

    if isPrimary or isTwin then
      -- 1. Damage (Base Isaac is 3.5)
      if cacheFlag == CacheFlag.CACHE_DAMAGE then
        local dmgVal = isTwin and ${(char.twinDamage !== undefined ? Number(char.twinDamage) : 3.75).toFixed(3)} or ${(char.damage !== undefined ? Number(char.damage) : (isForgotten ? 5.25 : 3.5)).toFixed(3)}
        local flatDamageBonus = dmgVal - 3.5
        local dmgMultiplier = ${(Number(char.damageMult) || (isForgotten ? 1.5 : 1.0)).toFixed(3)}
        player.Damage = math.max(0.1, (player.Damage + flatDamageBonus) * dmgMultiplier)
      end

      -- 2. Tears / Fire Delay (Base Isaac tears is 2.73, MaxFireDelay is 10)
      if cacheFlag == CacheFlag.CACHE_FIREDELAY then
        local targetTears = isTwin and ${(char.twinTears !== undefined ? Number(char.twinTears) : 2.73).toFixed(3)} or ${(char.tears !== undefined ? Number(char.tears) : 2.73).toFixed(3)}
        local targetDelay = (30 / math.max(0.1, targetTears)) - 1
        local delayDiff = targetDelay - 10
        player.MaxFireDelay = math.max(1, player.MaxFireDelay + delayDiff)
      end

      -- 3. Move Speed (Base Isaac speed is 1.0)
      if cacheFlag == CacheFlag.CACHE_SPEED then
        local spdVal = isTwin and ${(char.twinSpeed !== undefined ? Number(char.twinSpeed) : 1.0).toFixed(3)} or ${(char.speed !== undefined ? Number(char.speed) : 1.0).toFixed(3)}
        local speedBonus = spdVal - 1.0
        player.MoveSpeed = math.max(0.1, math.min(2.0, player.MoveSpeed + speedBonus))
      end

      -- 4. Range (Base Isaac range is 6.5)
      if cacheFlag == CacheFlag.CACHE_RANGE then
        local rngVal = isTwin and ${(char.twinRange !== undefined ? Number(char.twinRange) : 6.5).toFixed(2)} or ${(char.range !== undefined ? Number(char.range) : 6.5).toFixed(2)}
        local rangeBonus = (rngVal - 6.5) * 40
        player.TearRange = math.max(40, player.TearRange + rangeBonus)
      end

      -- 5. Shot Speed (Base Isaac shot speed is 1.0)
      if cacheFlag == CacheFlag.CACHE_SHOTSPEED then
        local shotSpdVal = isTwin and ${(char.twinShotspeed !== undefined ? Number(char.twinShotspeed) : 1.0).toFixed(3)} or ${(char.shotspeed !== undefined ? Number(char.shotspeed) : 1.0).toFixed(3)}
        local shotSpeedBonus = shotSpdVal - 1.0
        player.ShotSpeed = math.max(0.1, player.ShotSpeed + shotSpeedBonus)
      end

      -- 6. Luck (Base Isaac luck is 0)
      if cacheFlag == CacheFlag.CACHE_LUCK then
        local lkVal = isTwin and ${(Number(char.twinLuck) || 0).toFixed(2)} or ${(Number(char.luck) || 0).toFixed(2)}
        player.Luck = player.Luck + lkVal
      end

      -- 7. Flying & Weapon Ability
      if cacheFlag == CacheFlag.CACHE_FLYING then
        if isTwin then
          ${char.twinFlying ? 'player.CanFly = true' : ''}
        else
          ${char.flying ? 'player.CanFly = true' : ''}
        end
      end

      if cacheFlag == CacheFlag.CACHE_WEAPONS then
        if isTwin then
          ${char.twinCanShoot === false ? 'player.CanShoot = false' : ''}
        else
          ${char.canShoot === false ? 'player.CanShoot = false' : ''}
        end
      end
    end
  end)
end
${safeModId}:AddCallback(ModCallbacks.MC_EVALUATE_CACHE, ${safeModId}.OnEvaluateCache_${charName})
`;
  }

  return script;
}

/**
 * Creates an isolated, dedicated custom character mod in the mods folder.
 * Preserves vanilla game files completely.
 */
export async function createCustomMod(character, options = {}, gamePath, modsPath) {
  const config = getConfig();
  const effectiveGamePath = gamePath || config.gamePath || '';
  const effectiveModsPath = modsPath || config.modsPath || '';

  let rawName = (character.name || 'custom_char').replace(/[^\x20-\x7E]/g, '').trim() || 'custom_char';
  let twinName = character.twinName ? String(character.twinName).replace(/[^\x20-\x7E]/g, '').trim() : '';

  // Dual Character: enforce 2 names format (e.g. "John & Isaac")
  if (character.isDual) {
    if (!rawName.includes('&')) {
      if (twinName) {
        rawName = `${rawName} & ${twinName}`;
      } else {
        twinName = 'Isaac';
        rawName = `${rawName} & ${twinName}`;
      }
    } else if (!twinName) {
      const parts = rawName.split('&').map(s => s.trim());
      if (parts.length > 1 && parts[1]) {
        twinName = parts[1];
      } else {
        twinName = 'Isaac';
      }
    }
  }

  const cleanCharName = rawName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'custom_char';
  const modFolderName = options.folderName || character.modFolder || `custom_character_${cleanCharName}`;
  const modTitle = options.name || `Custom Character - ${rawName}`;
  const modId = options.modId || `CustomChar_${cleanCharName}`;
  const targetDir = options.targetDir || (effectiveModsPath ? path.join(effectiveModsPath, modFolderName) : null);

  if (!targetDir) {
    return { success: false, error: 'Mods folder path not configured.' };
  }

  // If previous folder name was different (e.g. character was renamed), cleanly remove old folder to prevent duplicates
  if (effectiveModsPath && options.previousFolderName && options.previousFolderName !== modFolderName) {
    const oldDir = path.join(effectiveModsPath, options.previousFolderName);
    if (await fs.pathExists(oldDir)) {
      try {
        await fs.remove(oldDir);
      } catch (e) {
        console.warn(`Could not remove old folder ${options.previousFolderName}:`, e.message);
      }
    }
  }

  const hasCustomSprite = !!(options.spriteDataUrl || character.customSpriteDataUrl || character.hasCustomSprite || (character.skin && !character.skin.startsWith('character_0')));
  const hasCustomPortrait = !!(options.customPortraitDataUrl || character.customPortraitDataUrl);
  const hasCustomName = !!(options.customNameDataUrl || character.customNameDataUrl);
  const hasCustomBigPortrait = !!(options.customBigPortraitDataUrl || character.customBigPortraitDataUrl);

  const SKIN_TO_PORTRAIT = {
    // Base / Standard Characters
    'character_001_isaac.png': 'playerportrait_isaac.png',
    'character_002_magdalene.png': 'playerportrait_magdalene.png',
    'character_003_cain.png': 'playerportrait_cain.png',
    'character_004_judas.png': 'playerportrait_judas.png',
    'character_005_bluebaby.png': 'playerportrait_bluebaby.png',
    'character_005b_bluebaby.png': 'playerportrait_bluebaby.png',
    'character_006_bluebaby.png': 'playerportrait_bluebaby.png',
    'character_005_eve.png': 'playerportrait_eve.png',
    'character_007_samson.png': 'playerportrait_samson.png',
    'character_008_azazel.png': 'playerportrait_azazel.png',
    'character_009_lazarus.png': 'playerportrait_lazarus.png',
    'character_009_eden.png': 'playerportrait_eden.png',
    'character_010_eden.png': 'playerportrait_eden.png',
    'character_011_thelost.png': 'playerportrait_thelost.png',
    'character_012_thelost.png': 'playerportrait_thelost.png',
    'character_014_lilith.png': 'playerportrait_lilith.png',
    'character_015_keeper.png': 'playerportrait_keeper.png',
    'character_016_apollyon.png': 'playerportrait_apollyon.png',
    'character_017_theforgotten.png': 'playerportrait_theforgotten.png',
    'character_001x_bethany.png': 'playerportrait_bethany.png',
    'character_018_bethany.png': 'playerportrait_bethany.png',
    'character_019_bethany.png': 'playerportrait_bethany.png',
    'character_002x_jacob.png': 'playerportrait_jacob.png',
    'character_003x_esau.png': 'playerportrait_jacob.png',
    'character_019_jacob.png': 'playerportrait_jacob.png',
    'character_020_jacob.png': 'playerportrait_jacob.png',
    // Tainted Characters
    'character_001_isaac_b.png': 'playerportrait_isaac_b.png',
    'character_001b_isaac.png': 'playerportrait_isaac_b.png',
    'character_002_magdalene_b.png': 'playerportrait_magdalene_b.png',
    'character_002b_magdalene.png': 'playerportrait_magdalene_b.png',
    'character_003_cain_b.png': 'playerportrait_cain_b.png',
    'character_003b_cain.png': 'playerportrait_cain_b.png',
    'character_004_judas_b.png': 'playerportrait_judas_b.png',
    'character_004b_judas.png': 'playerportrait_judas_b.png',
    'character_005_bluebaby_b.png': 'playerportrait_bluebaby_b.png',
    'character_005b_bluebaby_b.png': 'playerportrait_bluebaby_b.png',
    'character_006_bluebaby_b.png': 'playerportrait_bluebaby_b.png',
    'character_005_eve_b.png': 'playerportrait_eve_b.png',
    'character_006_eve_b.png': 'playerportrait_eve_b.png',
    'character_006b_eve.png': 'playerportrait_eve_b.png',
    'character_007_samson_b.png': 'playerportrait_samson_b.png',
    'character_007b_samson.png': 'playerportrait_samson_b.png',
    'character_008_azazel_b.png': 'playerportrait_azazel_b.png',
    'character_008b_azazel.png': 'playerportrait_azazel_b.png',
    'character_009_lazarus_b.png': 'playerportrait_lazarus_b.png',
    'character_009b_lazarus.png': 'playerportrait_lazarus_b.png',
    'character_009_eden_b.png': 'playerportrait_eden_b.png',
    'character_009b_eden.png': 'playerportrait_eden_b.png',
    'character_010b_eden.png': 'playerportrait_eden_b.png',
    'character_012_thelost_b.png': 'playerportrait_thelost_b.png',
    'character_012b_thelost.png': 'playerportrait_thelost_b.png',
    'character_014_lilith_b.png': 'playerportrait_lilith_b.png',
    'character_014b_lilith.png': 'playerportrait_lilith_b.png',
    'character_015_keeper_b.png': 'playerportrait_keeper_b.png',
    'character_015b_keeper.png': 'playerportrait_keeper_b.png',
    'character_016_apollyon_b.png': 'playerportrait_apollyon_b.png',
    'character_016b_apollyon.png': 'playerportrait_apollyon_b.png',
    'character_017_theforgotten_b.png': 'playerportrait_theforgotten_b.png',
    'character_016b_theforgotten.png': 'playerportrait_theforgotten_b.png',
    'character_017b_theforgotten.png': 'playerportrait_theforgotten_b.png',
    'character_018_bethany_b.png': 'playerportrait_bethany_b.png',
    'character_018b_bethany.png': 'playerportrait_bethany_b.png',
    'character_019_jacob_b.png': 'playerportrait_jacob_b.png',
    'character_019b_jacob.png': 'playerportrait_jacob_b.png'
  };

  const selectedSkin = character.baseSkin || (character.skin && character.skin.startsWith('character_0') ? character.skin : 'character_001_isaac.png');
  const autoPortrait = character.basePortrait || SKIN_TO_PORTRAIT[selectedSkin] || 'playerportrait_isaac.png';

  // Standardized Isaac mod filenames
  const skinFilename = `character_${cleanCharName}.png`;
  const portraitFilename = `playerportrait_${cleanCharName}.png`;
  const bigPortraitFilename = `playerportrait_${cleanCharName}.png`;
  const nameimageFilename = `playername_${cleanCharName}.png`;

  // Define clean folder paths exactly as requested
  const contentDir = path.join(targetDir, 'content');
  const contentGfxDir = path.join(targetDir, 'content', 'gfx');
  const resCostumesDir = path.join(targetDir, 'resources', 'gfx', 'characters', 'costumes');
  const resBossDir = path.join(targetDir, 'resources', 'gfx', 'ui', 'boss');
  const resMainMenuDir = path.join(targetDir, 'resources', 'gfx', 'ui', 'main menu');
  const resStageDir = path.join(targetDir, 'resources', 'gfx', 'ui', 'stage');
  const resMinimapDir = path.join(targetDir, 'resources', 'gfx', 'ui', 'minimap');

  await fs.ensureDir(contentDir);
  await fs.ensureDir(contentGfxDir);
  await fs.ensureDir(resCostumesDir);
  await fs.ensureDir(resBossDir);
  await fs.ensureDir(resMainMenuDir);
  await fs.ensureDir(resStageDir);
  await fs.ensureDir(resMinimapDir);

  // Automatically remove any disable.it flag so the custom character mod is enabled in Isaac
  await fs.remove(path.join(targetDir, 'disable.it')).catch(() => {});

  // 1. metadata.xml
  const metadataXml = `<metadata>
  <name>${escapeXml(modTitle)}</name>
  <directory>${escapeXml(modFolderName)}</directory>
  <id>0</id>
  <description>${escapeXml(options.description || character.modDescription || `Custom character mod for ${rawName}, created with Isaac Character Studio.`)}</description>
  <version>${escapeXml(options.version || character.modVersion || '1.0')}</version>
  <visibility>Public</visibility>
  <tag id="Player Characters"/>
  <tag id="Graphics"/>
  <tag id="Lua"/>
</metadata>`;
  await fs.writeFile(path.join(targetDir, 'metadata.xml'), metadataXml, 'utf8');

  // 2. Prepare Character XML Record
  const isForgotten = character.archetype === 'forgotten' || character.isForgotten || character.baseSkin === 'character_017_theforgotten.png' || selectedSkin === 'character_017_theforgotten.png' || character.costumeSuffix === 'forgotten';

  const costumeId = (character.costume !== undefined && character.costume !== null && Number(character.costume) > 0)
    ? Number(character.costume)
    : (hasCustomSprite ? 0 : (isForgotten ? 44 : (SKIN_TO_COSTUME[selectedSkin] || 0)));

  const resolvedSkinColor = (character.skinColor !== undefined && character.skinColor !== null)
    ? Number(character.skinColor)
    : (isForgotten ? 5 : (SKIN_TO_SKIN_COLOR[selectedSkin] !== undefined ? SKIN_TO_SKIN_COLOR[selectedSkin] : -1));

  const resolvedCostumeSuffix = character.costumeSuffix || (isForgotten ? 'forgotten' : '');

  const charWithAssets = {
    ...character,
    name: rawName,
    twinName: twinName,
    skinColor: resolvedSkinColor,
    costume: costumeId > 0 ? costumeId : (character.costume || 0),
    costumeSuffix: resolvedCostumeSuffix,
    archetype: character.archetype || (isForgotten ? 'forgotten' : undefined),
    isForgotten: isForgotten,
    baseSkin: selectedSkin,
    basePortrait: autoPortrait,
    skin: skinFilename,
    portrait: portraitFilename,
    bigportrait: bigPortraitFilename,
    nameimage: nameimageFilename
  };

  const playersXmlPath = path.join(contentDir, 'players.xml');
  let currentCharacters = [charWithAssets];

  if (await fs.pathExists(playersXmlPath)) {
    try {
      const xmlRaw = await fs.readFile(playersXmlPath, 'utf8');
      const parser = new xml2js.Parser();
      const parsed = await parser.parseStringPromise(xmlRaw);
      if (parsed.players && parsed.players.player) {
        const list = Array.isArray(parsed.players.player) ? parsed.players.player : [parsed.players.player];
        const existingList = list.map(p => ({
          ...p.$,
          skinColor: p.$.skinColor !== undefined ? parseInt(p.$.skinColor, 10) : -1,
          items: p.$.items ? p.$.items.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n)) : []
        }));
        // Remove matching character by new or previous name, and clean duplicate twin subplayer rows
        const filtered = existingList.filter(c => {
          if (c.achievement === '-2' || (c.hidden === 'true' && c.name && c.name.includes('('))) return false;
          if (c.name === charWithAssets.name) return false;
          if (options.previousName && c.name === options.previousName) return false;
          return true;
        });
        currentCharacters = [...filtered, charWithAssets];
      }
    } catch (e) {
      console.warn('Could not parse existing players.xml:', e);
    }
  }

  const playersXml = buildPlayersXml(currentCharacters, options.targetDLC || 'repentanceplus');
  await fs.writeFile(playersXmlPath, playersXml, 'utf8');

  // 3. main.lua
  if (options.includeLua !== false) {
    const luaScript = generateLuaScript(currentCharacters, modId);
    await fs.writeFile(path.join(targetDir, 'main.lua'), luaScript, 'utf8');
  }

  // 3b. Save studio_character.json for studio state persistence (modded items, amounts, custom visual assets)
  try {
    const studioMetaPath = path.join(targetDir, 'studio_character.json');
    await fs.writeJson(studioMetaPath, {
      ...charWithAssets,
      baseSkin: selectedSkin,
      basePortrait: autoPortrait,
      modTitle: modTitle || character.modTitle || character.modName || '',
      modDescription: options.description || character.modDescription || '',
      modVersion: options.version || character.modVersion || '1.0.0',
      modThumbnailDataUrl: options.thumbnailDataUrl || options.thumbDataUrl || character.modThumbnailDataUrl || null,
      customSpriteDataUrl: options.spriteDataUrl || character.customSpriteDataUrl || null,
      customPortraitDataUrl: options.customPortraitDataUrl || character.customPortraitDataUrl || null,
      customNameDataUrl: options.customNameDataUrl || character.customNameDataUrl || null,
      hue: character.hue || 0,
      sat: character.sat !== undefined ? character.sat : 100,
      bri: character.bri !== undefined ? character.bri : 100,
      con: character.con !== undefined ? character.con : 100,
      isDual: !!character.isDual,
      twinName: character.twinName || '',
      twinSkin: character.twinSkin || 'character_003x_esau.png',
      twinBaseSkin: character.twinBaseSkin || character.twinSkin || 'character_003x_esau.png',
      twinPortrait: character.twinPortrait || 'playerportrait_jacob.png',
      twinBasePortrait: character.twinBasePortrait || character.twinPortrait || 'playerportrait_jacob.png',
      twinCustomSpriteDataUrl: character.twinCustomSpriteDataUrl || null,
      twinCustomPortraitDataUrl: character.twinCustomPortraitDataUrl || null,
      twinHue: character.twinHue || 0,
      twinSat: character.twinSat !== undefined ? character.twinSat : 100,
      twinBri: character.twinBri !== undefined ? character.twinBri : 100,
      twinCon: character.twinCon !== undefined ? character.twinCon : 100,
      twinCostume: character.twinCostume || 53,
      twinSkinColor: character.twinSkinColor !== undefined ? character.twinSkinColor : 3,
      twinHp: character.twinHp !== undefined ? character.twinHp : 2,
      twinArmor: character.twinArmor !== undefined ? character.twinArmor : 2,
      twinBlack: character.twinBlack || 0,
      twinBone: character.twinBone || 0,
      twinRotten: character.twinRotten || 0,
      twinBroken: character.twinBroken || 0,
      twinDamage: character.twinDamage !== undefined ? character.twinDamage : 3.75,
      twinTears: character.twinTears !== undefined ? character.twinTears : 2.73,
      twinSpeed: character.twinSpeed !== undefined ? character.twinSpeed : 1.0,
      twinRange: character.twinRange !== undefined ? character.twinRange : 6.5,
      twinShotspeed: character.twinShotspeed !== undefined ? character.twinShotspeed : 1.0,
      twinLuck: character.twinLuck !== undefined ? character.twinLuck : 0,
      twinFlying: character.twinFlying ?? false,
      twinCanShoot: character.twinCanShoot ?? true,
      twinItems: Array.isArray(character.twinItems) ? character.twinItems : (character.twinItems ? String(character.twinItems).split(',').map(x => parseInt(x.trim(), 10)).filter(x => !isNaN(x)) : []),
      twinTrinket: character.twinTrinket || 0,
      twinPocketactive: character.twinPocketactive || 0,
      twinPocketitem: character.twinPocketitem || 0,
      twinCard: character.twinCard || 0,
      twinPill: character.twinPill || 0,
      twinCoins: character.twinCoins || 0,
      twinBombs: character.twinBombs || 0,
      twinKeys: character.twinKeys || 0,
      twinModdedItemsList: Array.isArray(character.twinModdedItemsList) ? character.twinModdedItemsList : [],
      twinModdedTrinketName: character.twinModdedTrinketName || '',
      twinModdedPocketItemName: character.twinModdedPocketItemName || '',
      moddedItemsList: character.moddedItemsList || [],
      moddedItemNames: character.moddedItemNames || (character.moddedItemsList ? character.moddedItemsList.map(m => m.name) : []),
      moddedTrinketName: character.moddedTrinketName || '',
      moddedPocketItemName: character.moddedPocketItemName || '',
      birthright: character.birthright || ''
    }, { spaces: 2 });
  } catch (e) {
    console.warn('Could not write studio_character.json:', e);
  }

  const colorFilters = {
    hue: character.hue || 0,
    sat: character.sat !== undefined ? character.sat : 100,
    bri: character.bri !== undefined ? character.bri : 100,
    con: character.con !== undefined ? character.con : 100
  };

  // 4. Resolve & Recolor All Associated Character Sprite Assets (body, head, horns/wings, hair, costumes)
  const destSkinPath = path.join(resCostumesDir, skinFilename);
  let rawSkinBuf = null;
  if (character.customSpriteDataUrl || options.spriteDataUrl) {
    const sBase64 = (character.customSpriteDataUrl || options.spriteDataUrl).replace(/^data:image\/\w+;base64,/, '');
    rawSkinBuf = Buffer.from(sBase64, 'base64');
  }

  // Find all associated vanilla & game sprite sheets for the selected base character
  const associatedAssetsMap = await resolveAllAssociatedCharacterAssets(selectedSkin, effectiveGamePath);

  // Write all recolored costume, head, hair, wings, and body assets into resources/gfx/characters/costumes/
  for (const [assetName, srcPath] of associatedAssetsMap.entries()) {
    try {
      let assetBuf = null;
      if (assetName.toLowerCase() === selectedSkin.toLowerCase() && rawSkinBuf) {
        assetBuf = rawSkinBuf;
      } else if (await fs.pathExists(srcPath)) {
        assetBuf = await fs.readFile(srcPath);
      }

      if (assetBuf && assetBuf.length > 0) {
        const recoloredAsset = applyHslFilterToPngBuffer(assetBuf, colorFilters);
        // Write original canonical filename so vanilla anm2 costume files load it
        await fs.writeFile(path.join(resCostumesDir, assetName), recoloredAsset);

        // If it's the primary character skin, also save as character_<cleanCharName>.png
        if (assetName.toLowerCase() === selectedSkin.toLowerCase()) {
          await fs.writeFile(destSkinPath, recoloredAsset);
          const resContentGfx = path.join(targetDir, 'content', 'gfx');
          await fs.ensureDir(resContentGfx);
          await fs.writeFile(path.join(resContentGfx, skinFilename), recoloredAsset).catch(() => {});
        }

        // If it's a head, hair, or body part, also save clean name alias
        if (assetName.toLowerCase().includes('head')) {
          await fs.writeFile(path.join(resCostumesDir, `character_${cleanCharName}_head.png`), recoloredAsset).catch(() => {});
        } else if (assetName.toLowerCase().includes('hair') || assetName.toLowerCase().includes('locks')) {
          await fs.writeFile(path.join(resCostumesDir, `character_${cleanCharName}_hair.png`), recoloredAsset).catch(() => {});
        } else if (assetName.toLowerCase().includes('body')) {
          await fs.writeFile(path.join(resCostumesDir, `character_${cleanCharName}_body.png`), recoloredAsset).catch(() => {});
        }
      }
    } catch (e) {
      console.warn(`Could not process associated asset ${assetName}:`, e.message);
    }
  }

  // 4b. Dual Character (Jacob & Esau): Resolve and recolor twin spritesheet and costumes
  if (character.isDual) {
    const twinSkin = character.twinSkin || 'character_003x_esau.png';
    const twinColorFilters = {
      hue: character.twinHue || 0,
      sat: character.twinSat !== undefined ? character.twinSat : 100,
      bri: character.twinBri !== undefined ? character.twinBri : 100,
      con: character.twinCon !== undefined ? character.twinCon : 100
    };
    let rawTwinSkinBuf = null;
    if (character.twinCustomSpriteDataUrl) {
      const sBase64 = character.twinCustomSpriteDataUrl.replace(/^data:image\/\w+;base64,/, '');
      rawTwinSkinBuf = Buffer.from(sBase64, 'base64');
    }
    const twinAssetsMap = await resolveAllAssociatedCharacterAssets(twinSkin, effectiveGamePath);
    for (const [assetName, srcPath] of twinAssetsMap.entries()) {
      try {
        let assetBuf = null;
        if (assetName.toLowerCase() === twinSkin.toLowerCase() && rawTwinSkinBuf) {
          assetBuf = rawTwinSkinBuf;
        } else if (await fs.pathExists(srcPath)) {
          assetBuf = await fs.readFile(srcPath);
        }
        if (assetBuf && assetBuf.length > 0) {
          const recoloredTwinAsset = applyHslFilterToPngBuffer(assetBuf, twinColorFilters);
          await fs.writeFile(path.join(resCostumesDir, assetName), recoloredTwinAsset);
        }
      } catch (e) {
        console.warn(`Could not process associated twin asset ${assetName}:`, e.message);
      }
    }
  }

  // If primary skin wasn't written yet, fallback to searching default skin sources
  if (!await fs.pathExists(destSkinPath) || (await fs.stat(destSkinPath)).size === 0) {
    const skinSources = [
      path.join(ASSETS_DIR, 'characters', selectedSkin),
      path.join(ASSETS_DIR, 'characters', 'character_001_isaac.png'),
      path.join(effectiveGamePath || '', 'extracted_resources', 'resources-dlc3', 'gfx', 'characters', 'costumes', selectedSkin),
      path.join(effectiveGamePath || '', 'extracted_resources', 'resources', 'gfx', 'characters', 'costumes', selectedSkin),
      path.join(effectiveGamePath || '', 'resources-dlc3', 'gfx', 'characters', 'costumes', selectedSkin),
      path.join(effectiveGamePath || '', 'resources', 'gfx', 'characters', 'costumes', selectedSkin),
      path.join(effectiveGamePath || '', 'resources_repentance', 'gfx', 'characters', 'costumes', selectedSkin),
      path.join(effectiveGamePath || '', 'extracted_resources', 'resources', 'gfx', 'characters', 'costumes', 'character_001_isaac.png'),
      path.join(effectiveGamePath || '', 'resources', 'gfx', 'characters', 'costumes', 'character_001_isaac.png')
    ];
    for (const src of skinSources) {
      if (src && (await fs.pathExists(src))) {
        const rawBuf = await fs.readFile(src);
        const finalSkinBuf = applyHslFilterToPngBuffer(rawBuf, colorFilters);
        await fs.writeFile(destSkinPath, finalSkinBuf);
        const resContentGfx = path.join(targetDir, 'content', 'gfx');
        await fs.ensureDir(resContentGfx);
        await fs.writeFile(path.join(resContentGfx, skinFilename), finalSkinBuf).catch(() => {});
        break;
      }
    }
  }

  // 5. Boss & Stage Portrait Asset (playerportrait_<name>.png, charselect_<name>.png, minimap_<name>.png)
  const destBossPortraitPath = path.join(resBossDir, portraitFilename);
  const destStagePortraitPath = path.join(resStageDir, portraitFilename);
  const destMainMenuCharselect = path.join(resMainMenuDir, `charselect_${cleanCharName}.png`);
  const destMainMenuPortrait = path.join(resMainMenuDir, portraitFilename);
  const destMinimapPath = path.join(resMinimapDir, `minimap_${cleanCharName}.png`);

  let resolvedPortraitBuffer = null;

  if (character.customPortraitDataUrl || options.customPortraitDataUrl) {
    const pBase64 = (character.customPortraitDataUrl || options.customPortraitDataUrl).replace(/^data:image\/\w+;base64,/, '');
    resolvedPortraitBuffer = Buffer.from(pBase64, 'base64');
  } else {
    const strippedPort = portraitFilename.replace(/^playerportrait_\d+_/i, 'playerportrait_');
    const searchDirs = [
      effectiveGamePath,
      path.join(ASSETS_DIR, 'ui'),
      path.join(APP_ROOT, 'extracted_resources'),
      path.join(APP_ROOT, 'resources')
    ].filter(Boolean);

    for (const sDir of searchDirs) {
      const portraitSources = [
        path.join(sDir, autoPortrait),
        path.join(sDir, 'extracted_resources', 'resources-dlc3', 'gfx', 'ui', 'stage', autoPortrait),
        path.join(sDir, 'extracted_resources', 'resources', 'gfx', 'ui', 'stage', autoPortrait),
        path.join(sDir, 'resources-dlc3', 'gfx', 'ui', 'stage', autoPortrait),
        path.join(sDir, 'resources', 'gfx', 'ui', 'stage', autoPortrait),
        path.join(sDir, 'resources_repentance', 'gfx', 'ui', 'stage', autoPortrait),
        path.join(sDir, 'extracted_resources', 'resources-dlc3', 'gfx', 'ui', 'boss', autoPortrait),
        path.join(sDir, 'extracted_resources', 'resources', 'gfx', 'ui', 'boss', autoPortrait),
        path.join(sDir, 'resources-dlc3', 'gfx', 'ui', 'boss', autoPortrait),
        path.join(sDir, 'resources', 'gfx', 'ui', 'boss', autoPortrait),
        path.join(sDir, 'extracted_resources', 'resources', 'gfx', 'ui', 'stage', character.portrait || 'playerportrait_isaac.png'),
        path.join(sDir, 'extracted_resources', 'resources', 'gfx', 'ui', 'stage', strippedPort),
        path.join(sDir, 'resources', 'gfx', 'ui', 'stage', strippedPort),
        path.join(sDir, 'playerportrait_isaac.png')
      ];
      let found = false;
      for (const pSrc of portraitSources) {
        if (pSrc && (await fs.pathExists(pSrc))) {
          resolvedPortraitBuffer = await fs.readFile(pSrc).catch(() => null);
          found = true;
          break;
        }
      }
      if (found) break;
    }
  }

  if (resolvedPortraitBuffer) {
    resolvedPortraitBuffer = applyHslFilterToPngBuffer(resolvedPortraitBuffer, colorFilters);
    await fs.writeFile(destBossPortraitPath, resolvedPortraitBuffer);
    await fs.writeFile(destStagePortraitPath, resolvedPortraitBuffer);
    await fs.writeFile(destMainMenuCharselect, resolvedPortraitBuffer);
    await fs.writeFile(destMainMenuPortrait, resolvedPortraitBuffer);
    await fs.writeFile(destMinimapPath, resolvedPortraitBuffer);
    await fs.writeFile(path.join(contentGfxDir, portraitFilename), resolvedPortraitBuffer);
    await fs.writeFile(path.join(contentGfxDir, `playerportrait_${cleanCharName}.png`), resolvedPortraitBuffer);
  }

  // 6. Nameplate Banner (playername_<name>.png in boss, stage, main menu)
  let nBuf = null;
  const customDataUrl = character.customNameDataUrl || options.customNameDataUrl;
  if (customDataUrl && customDataUrl.length > 100) {
    try {
      const nBase64 = customDataUrl.replace(/^data:image\/\w+;base64,/, '');
      const candidateBuf = Buffer.from(nBase64, 'base64');
      if (candidateBuf.length > 500) {
        nBuf = candidateBuf;
      }
    } catch (e) {
      console.warn('Could not decode client customNameDataUrl:', e);
    }
  }

  if (!nBuf || nBuf.length < 500) {
    nBuf = generateServerNameplatePng(character.name || rawName);
  }

  if (nBuf) {
    const nameVariations = new Set([
      nameimageFilename,
      `playername_${cleanCharName}.png`,
      `playername_${rawName}.png`,
      `playername_${rawName.replace(/\s+/g, '_')}.png`,
      `PlayerName_${cleanCharName}.png`,
      `PlayerName_${rawName}.png`
    ]);

    const dirs = [resBossDir, resStageDir, resMainMenuDir, contentGfxDir];
    for (const d of dirs) {
      await fs.ensureDir(d);
      for (const nName of nameVariations) {
        await fs.writeFile(path.join(d, nName), nBuf);
      }
    }
  }

  // 7. Mod 1:1 Thumbnail (thumb.png)
  const thumbDataUrl = options.thumbnailDataUrl || options.thumbDataUrl || character.modThumbnailDataUrl || character.thumbDataUrl;
  if (thumbDataUrl) {
    try {
      const tBase64 = thumbDataUrl.replace(/^data:image\/\w+;base64,/, '');
      const tBuf = Buffer.from(tBase64, 'base64');
      await fs.writeFile(path.join(targetDir, 'thumb.png'), tBuf);
    } catch (e) {
      console.warn('Could not write thumb.png:', e);
    }
  }

  // 8. Generate and install composited charactermenu.png, characterportraits.anm2, coop menu.png/anm2, and charactermenu.anm2
  try {
    let primarySkinBuf = null;
    if (await fs.pathExists(destSkinPath)) {
      primarySkinBuf = await fs.readFile(destSkinPath);
    }
    let twinSkinBuf = null;
    if (character.isDual) {
      const twinSkin = character.twinSkin || 'character_003x_esau.png';
      const destTwinPath = path.join(resCostumesDir, twinSkin);
      if (await fs.pathExists(destTwinPath)) {
        twinSkinBuf = await fs.readFile(destTwinPath);
      }
    }
    await installCharacterMenuAnm2Assets(targetDir, currentCharacters, effectiveGamePath, nBuf, resolvedPortraitBuffer, primarySkinBuf, twinSkinBuf);
  } catch (e) {
    console.warn('Could not install character menu anm2 assets:', e);
  }

  return {
    success: true,
    modPath: targetDir,
    folderName: modFolderName,
    modTitle,
    message: `Character "${character.name}" successfully compiled into dedicated mod "${modFolderName}"!`
  };
}

/**
 * Resolves all associated sprite and costume assets for a character (e.g. body, head, hair, horns, wings, extra parts)
 */
export async function resolveAllAssociatedCharacterAssets(selectedSkin, effectiveGamePath) {
  const cleanSkin = (selectedSkin || 'character_001_isaac.png').toLowerCase();
  const baseNameMatch = cleanSkin.match(/^character_([0-9a-z]+)_(.+)\.png$/i) || cleanSkin.match(/^character_([0-9a-z]+)\.png$/i);
  
  const prefix = baseNameMatch ? `character_${baseNameMatch[1]}` : 'character_001';
  const nameKey = baseNameMatch && baseNameMatch[2] ? baseNameMatch[2] : (cleanSkin.replace(/^character_\d+_?/, '').replace(/\.png$/, ''));

  const searchDirs = [
    path.join(ASSETS_DIR, 'characters'),
    path.join(ASSETS_DIR, 'ui'),
    path.join(effectiveGamePath || '', 'extracted_resources', 'resources-dlc3', 'gfx', 'characters', 'costumes'),
    path.join(effectiveGamePath || '', 'extracted_resources', 'resources-dlc3', 'gfx', 'characters'),
    path.join(effectiveGamePath || '', 'extracted_resources', 'resources', 'gfx', 'characters', 'costumes'),
    path.join(effectiveGamePath || '', 'extracted_resources', 'resources', 'gfx', 'characters'),
    path.join(effectiveGamePath || '', 'resources-dlc3', 'gfx', 'characters', 'costumes'),
    path.join(effectiveGamePath || '', 'resources', 'gfx', 'characters', 'costumes'),
    path.join(effectiveGamePath || '', 'resources_repentance', 'gfx', 'characters', 'costumes')
  ].filter(Boolean);

  const matchedAssets = new Map(); // filename -> fullPath

  for (const dir of searchDirs) {
    if (await fs.pathExists(dir)) {
      try {
        const files = await fs.readdir(dir);
        for (const file of files) {
          const lower = file.toLowerCase();
          if (!lower.endsWith('.png')) continue;

          let isMatch = false;
          if (lower.startsWith(prefix.toLowerCase())) {
            isMatch = true;
          } else if (nameKey && nameKey.length >= 3 && lower.includes(nameKey.toLowerCase()) && (lower.startsWith('character_') || lower.startsWith('costume_') || lower.startsWith('playerportrait_'))) {
            isMatch = true;
          }

          // Special character associations
          if (nameKey === 'azazel' || prefix === 'character_008' || prefix === 'character_008b') {
            if (lower.includes('azazel') || lower.includes('lord of the pit') || lower.includes('lordofthepit')) {
              isMatch = true;
            }
          } else if (nameKey === 'magdalene' || nameKey === 'maggie' || prefix === 'character_002' || prefix === 'character_002b') {
            if (lower.includes('magdalene') || lower.includes('maggie') || lower.includes('goldenlocks')) {
              isMatch = true;
            }
          } else if (nameKey === 'cain' || prefix === 'character_003' || prefix === 'character_003b') {
            if (lower.includes('cain') || lower.includes('eyepatch')) {
              isMatch = true;
            }
          } else if (nameKey === 'judas' || prefix === 'character_004' || prefix === 'character_004b') {
            if (lower.includes('judas') || lower.includes('fez')) {
              isMatch = true;
            }
          } else if (nameKey === 'eve' || prefix === 'character_005' || prefix === 'character_006b') {
            if (lower.includes('evehead') || lower.includes('eve_') || lower.includes('eve.png')) {
              isMatch = true;
            }
          } else if (nameKey === 'samson' || prefix === 'character_007' || prefix === 'character_007b') {
            if (lower.includes('samson') || lower.includes('bandanna')) {
              isMatch = true;
            }
          } else if (nameKey === 'lazarus' || prefix === 'character_009' || prefix === 'character_009b' || prefix === 'character_010') {
            if (lower.includes('lazarus')) {
              isMatch = true;
            }
          } else if (nameKey === 'lilith' || prefix === 'character_014' || prefix === 'character_014b') {
            if (lower.includes('lilith')) {
              isMatch = true;
            }
          } else if (nameKey === 'keeper' || prefix === 'character_015' || prefix === 'character_015b') {
            if (lower.includes('keeper')) {
              isMatch = true;
            }
          } else if (nameKey === 'apollyon' || prefix === 'character_016' || prefix === 'character_016b') {
            if (lower.includes('apollyon')) {
              isMatch = true;
            }
          } else if (nameKey === 'theforgotten' || nameKey === 'thesoul' || prefix === 'character_017' || prefix === 'character_017b') {
            if (lower.includes('forgotten') || lower.includes('thesoul')) {
              isMatch = true;
            }
          } else if (nameKey === 'bethany' || prefix === 'character_001x' || prefix === 'character_018' || prefix === 'character_018b') {
            if (lower.includes('beth')) {
              isMatch = true;
            }
          } else if (nameKey === 'jacob' || prefix === 'character_002x' || prefix === 'character_019' || prefix === 'character_019b') {
            if (lower.includes('jacob')) {
              isMatch = true;
            }
          } else if (nameKey === 'esau' || prefix === 'character_003x') {
            if (lower.includes('esau')) {
              isMatch = true;
            }
          }

          if (isMatch && !matchedAssets.has(file)) {
            matchedAssets.set(file, path.join(dir, file));
          }
        }
      } catch (e) {}
    }
  }

  // Always ensure selectedSkin is included
  if (!matchedAssets.has(selectedSkin)) {
    for (const dir of searchDirs) {
      const candidate = path.join(dir, selectedSkin);
      if (await fs.pathExists(candidate)) {
        matchedAssets.set(selectedSkin, candidate);
        break;
      }
    }
  }

  return matchedAssets;
}

/**
 * Auto-fills missing or empty sprite assets in a character mod folder using matching vanilla game sprites
 */
export async function ensureCharacterModAssets(modDir, char, gamePath) {
  const cleanCharName = (char.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const selectedSkin = char.baseSkin || char.skin || 'character_001_isaac.png';
  const autoPortrait = char.basePortrait || char.portrait || `playerportrait_${selectedSkin.replace(/^character_\d+_/, '').replace(/\.png$/, '')}.png`;

  const colorFilters = {
    hue: char.hue || 0,
    sat: char.sat !== undefined ? char.sat : 100,
    bri: char.bri !== undefined ? char.bri : 100,
    con: char.con !== undefined ? char.con : 100
  };

  // 1. Costume / body sprite & all associated character parts
  const costumesDir = path.join(modDir, 'resources', 'gfx', 'characters', 'costumes');
  await fs.ensureDir(costumesDir);
  const skinDest = path.join(costumesDir, `character_${cleanCharName}.png`);

  const associatedAssetsMap = await resolveAllAssociatedCharacterAssets(selectedSkin, gamePath);
  for (const [assetName, srcPath] of associatedAssetsMap.entries()) {
    try {
      const destPath = path.join(costumesDir, assetName);
      if (!await fs.pathExists(destPath) || (await fs.stat(destPath)).size === 0) {
        if (await fs.pathExists(srcPath)) {
          const rawBuf = await fs.readFile(srcPath);
          const filtered = applyHslFilterToPngBuffer(rawBuf, colorFilters);
          await fs.writeFile(destPath, filtered);
          if (assetName.toLowerCase() === selectedSkin.toLowerCase()) {
            await fs.writeFile(skinDest, filtered);
          }
        }
      }
    } catch (e) {}
  }

  if (!await fs.pathExists(skinDest) || (await fs.stat(skinDest)).size === 0) {
    const skinSources = [
      path.join(ASSETS_DIR, 'characters', selectedSkin),
      path.join(ASSETS_DIR, 'characters', 'character_001_isaac.png'),
      path.join(gamePath || '', 'extracted_resources', 'resources-dlc3', 'gfx', 'characters', 'costumes', selectedSkin),
      path.join(gamePath || '', 'extracted_resources', 'resources', 'gfx', 'characters', 'costumes', selectedSkin),
      path.join(gamePath || '', 'resources-dlc3', 'gfx', 'characters', 'costumes', selectedSkin),
      path.join(gamePath || '', 'resources', 'gfx', 'characters', 'costumes', selectedSkin),
      path.join(gamePath || '', 'resources_repentance', 'gfx', 'characters', 'costumes', selectedSkin)
    ];
    for (const src of skinSources) {
      if (src && await fs.pathExists(src)) {
        const rawBuf = await fs.readFile(src);
        const filtered = applyHslFilterToPngBuffer(rawBuf, colorFilters);
        await fs.writeFile(skinDest, filtered);
        break;
      }
    }
  }

  // 1b. Dual Character (Jacob & Esau): Ensure twin costumes and sprites exist
  if (char.isDual) {
    const twinSkin = char.twinSkin || 'character_003x_esau.png';
    const twinColorFilters = {
      hue: char.twinHue || 0,
      sat: char.twinSat !== undefined ? char.twinSat : 100,
      bri: char.twinBri !== undefined ? char.twinBri : 100,
      con: char.twinCon !== undefined ? char.twinCon : 100
    };
    const twinAssetsMap = await resolveAllAssociatedCharacterAssets(twinSkin, gamePath);
    for (const [assetName, srcPath] of twinAssetsMap.entries()) {
      try {
        const destPath = path.join(costumesDir, assetName);
        if (!await fs.pathExists(destPath) || (await fs.stat(destPath)).size === 0) {
          if (await fs.pathExists(srcPath)) {
            const rawBuf = await fs.readFile(srcPath);
            const filtered = applyHslFilterToPngBuffer(rawBuf, twinColorFilters);
            await fs.writeFile(destPath, filtered);
          }
        }
      } catch (e) {}
    }
  }

  // 2. Stage portrait (resources/gfx/ui/stage/playerportrait_<name>.png)
  const stageDir = path.join(modDir, 'resources', 'gfx', 'ui', 'stage');
  await fs.ensureDir(stageDir);
  const portDest = path.join(stageDir, `playerportrait_${cleanCharName}.png`);

  if (!await fs.pathExists(portDest) || (await fs.stat(portDest)).size === 0) {
    const portSources = [
      path.join(ASSETS_DIR, 'ui', autoPortrait),
      path.join(ASSETS_DIR, 'ui', 'playerportrait_isaac.png'),
      path.join(gamePath || '', 'extracted_resources', 'resources-dlc3', 'gfx', 'ui', 'stage', autoPortrait),
      path.join(gamePath || '', 'extracted_resources', 'resources', 'gfx', 'ui', 'stage', autoPortrait),
      path.join(gamePath || '', 'resources-dlc3', 'gfx', 'ui', 'stage', autoPortrait),
      path.join(gamePath || '', 'resources', 'gfx', 'ui', 'stage', autoPortrait),
      path.join(gamePath || '', 'resources_repentance', 'gfx', 'ui', 'stage', autoPortrait)
    ];
    for (const src of portSources) {
      if (src && await fs.pathExists(src)) {
        const rawBuf = await fs.readFile(src);
        const filtered = applyHslFilterToPngBuffer(rawBuf, colorFilters);
        await fs.writeFile(portDest, filtered);
        break;
      }
    }
  }

  // 3. Boss nameplate (resources/gfx/ui/boss/playername_<name>.png)
  const bossDir = path.join(modDir, 'resources', 'gfx', 'ui', 'boss');
  await fs.ensureDir(bossDir);
  const nameDest = path.join(bossDir, `playername_${cleanCharName}.png`);
  if (!await fs.pathExists(nameDest) || (await fs.stat(nameDest)).size === 0) {
    try {
      const nameBuf = generateServerNameplatePng(char.name || 'Custom');
      await fs.writeFile(nameDest, nameBuf);
    } catch (e) {}
  }

  // 4. Character Select Menu Assets (content/gfx/charactermenu.png, charactermenu.anm2, characterportraits.anm2)
  const contentGfxDir = path.join(modDir, 'content', 'gfx');
  await fs.ensureDir(contentGfxDir);

  // Automatically remove any disable.it flag
  await fs.remove(path.join(modDir, 'disable.it')).catch(() => {});

  // Ensure skin is also available in content/gfx
  if (await fs.pathExists(skinDest)) {
    const contentSkinDest = path.join(contentGfxDir, `character_${cleanCharName}.png`);
    if (!await fs.pathExists(contentSkinDest)) {
      await fs.copy(skinDest, contentSkinDest).catch(() => {});
    }
  }

  const menuPngPath = path.join(contentGfxDir, 'charactermenu.png');
  const menuAnm2Path = path.join(contentGfxDir, 'charactermenu.anm2');
  const portraitsAnm2Path = path.join(contentGfxDir, 'characterportraits.anm2');
  const coopPngPath = path.join(contentGfxDir, 'coop menu.png');
  const coopAnm2Path = path.join(contentGfxDir, 'coop menu.anm2');

  const needsMenuRebuild = !await fs.pathExists(menuPngPath) ||
                          !await fs.pathExists(menuAnm2Path) ||
                          !await fs.pathExists(portraitsAnm2Path) ||
                          !await fs.pathExists(coopPngPath) ||
                          !await fs.pathExists(coopAnm2Path) ||
                          (await fs.stat(menuPngPath)).size === 0 ||
                          (await fs.stat(menuAnm2Path)).size === 0;

  if (needsMenuRebuild) {
    try {
      const nBuf = (await fs.pathExists(nameDest)) ? await fs.readFile(nameDest) : generateServerNameplatePng(char.name || 'Custom');
      const pBuf = (await fs.pathExists(portDest)) ? await fs.readFile(portDest) : null;
      const sBuf = (await fs.pathExists(skinDest)) ? await fs.readFile(skinDest) : null;
      await installCharacterMenuAnm2Assets(modDir, [char], gamePath, nBuf, pBuf, sBuf);
    } catch (e) {
      console.warn(`Could not ensure character menu assets for ${char.name}:`, e.message);
    }
  }

  // Main menu fallback portrait and nameplate
  const menuDir = path.join(modDir, 'resources', 'gfx', 'ui', 'main menu');
  await fs.ensureDir(menuDir);
  const menuPortDest = path.join(menuDir, `playerportrait_${cleanCharName}.png`);
  const menuCharselectDest = path.join(menuDir, `charselect_${cleanCharName}.png`);
  const menuNameDest = path.join(menuDir, `playername_${cleanCharName}.png`);
  if (await fs.pathExists(portDest)) {
    if (!await fs.pathExists(menuPortDest)) await fs.copy(portDest, menuPortDest).catch(() => {});
    if (!await fs.pathExists(menuCharselectDest)) await fs.copy(portDest, menuCharselectDest).catch(() => {});
  }
  if (await fs.pathExists(nameDest) && !await fs.pathExists(menuNameDest)) {
    await fs.copy(nameDest, menuNameDest).catch(() => {});
  }

  // 5. Minimap icon
  const minimapDir = path.join(modDir, 'resources', 'gfx', 'ui', 'minimap');
  await fs.ensureDir(minimapDir);
  const minimapDest = path.join(minimapDir, `minimap_${cleanCharName}.png`);
  if (!await fs.pathExists(minimapDest) || (await fs.stat(minimapDest)).size === 0) {
    if (await fs.pathExists(portDest)) {
      await fs.copy(portDest, minimapDest).catch(() => {});
    }
  }

  return { skinDest, portDest, nameDest, minimapDest };
}

/**
 * Returns all custom characters created by the studio across custom character mods.
 * Strictly read-only scan of studio folders. NEVER touches external mods.
 */
export async function getCustomStudioCharacters(modsPath) {
  if (!modsPath || !(await fs.pathExists(modsPath))) {
    return [];
  }

  const config = getConfig();
  const gamePath = config.gamePath || '';
  const customChars = [];
  try {
    const folders = await fs.readdir(modsPath);
    for (const folder of folders) {
      const isStudioMod = folder.startsWith('custom_character_') || folder.startsWith('custom_');
      if (!isStudioMod) continue;

      const modDir = path.join(modsPath, folder);
      try {
        const stat = await fs.stat(modDir);
        if (!stat.isDirectory()) continue;
      } catch { continue; }

      const playersXmlPath = path.join(modDir, 'content', 'players.xml');
      if (await fs.pathExists(playersXmlPath)) {
        try {
          const xmlRaw = await fs.readFile(playersXmlPath, 'utf8');
          const parser = new xml2js.Parser();
          const parsed = await parser.parseStringPromise(xmlRaw);

          if (parsed.players && parsed.players.player) {
            // Check for studio_character.json metadata (contains moddedItemsList with counts)
            let studioMeta = null;
            const studioMetaPath = path.join(modDir, 'studio_character.json');
            if (await fs.pathExists(studioMetaPath)) {
              try {
                studioMeta = await fs.readJson(studioMetaPath);
              } catch (e) {
                // ignore
              }
            }

            const list = Array.isArray(parsed.players.player) ? parsed.players.player : [parsed.players.player];
            for (const p of list) {
              const char = { ...p.$ };
              // Skip secondary subplayer entities (e.g. Esau with achievement="-2" or hidden="true") from appearing as duplicate cards
              if (char.hidden === 'true' || char.canSpawn === 'false' || char.achievement === '-2' || (char.name && (char.name.includes(' (Twin)') || char.name.includes(' (Ghost)')))) {
                continue;
              }

              if (studioMeta && (studioMeta.name === char.name || list.length === 1 || list.length === 2)) {
                if (studioMeta.baseSkin) char.baseSkin = studioMeta.baseSkin;
                if (studioMeta.basePortrait) char.basePortrait = studioMeta.basePortrait;
                if (studioMeta.customPortraitDataUrl) char.customPortraitDataUrl = studioMeta.customPortraitDataUrl;
                if (studioMeta.customSpriteDataUrl) char.customSpriteDataUrl = studioMeta.customSpriteDataUrl;
                if (studioMeta.customNameDataUrl) char.customNameDataUrl = studioMeta.customNameDataUrl;
                if (studioMeta.customBigPortraitDataUrl) char.customBigPortraitDataUrl = studioMeta.customBigPortraitDataUrl;
                if (studioMeta.hue !== undefined) char.hue = studioMeta.hue;
                if (studioMeta.sat !== undefined) char.sat = studioMeta.sat;
                if (studioMeta.bri !== undefined) char.bri = studioMeta.bri;
                if (studioMeta.con !== undefined) char.con = studioMeta.con;
                if (studioMeta.isDual !== undefined) char.isDual = studioMeta.isDual === true || studioMeta.isDual === 'true';
                if (studioMeta.twinName) char.twinName = studioMeta.twinName;
                if (studioMeta.twinSkin) char.twinSkin = studioMeta.twinSkin;
                if (studioMeta.twinBaseSkin) char.twinBaseSkin = studioMeta.twinBaseSkin;
                if (studioMeta.twinPortrait) char.twinPortrait = studioMeta.twinPortrait;
                if (studioMeta.twinBasePortrait) char.twinBasePortrait = studioMeta.twinBasePortrait;
                if (studioMeta.twinCustomSpriteDataUrl) char.twinCustomSpriteDataUrl = studioMeta.twinCustomSpriteDataUrl;
                if (studioMeta.twinCustomPortraitDataUrl) char.twinCustomPortraitDataUrl = studioMeta.twinCustomPortraitDataUrl;
                if (studioMeta.twinHue !== undefined) char.twinHue = studioMeta.twinHue;
                if (studioMeta.twinSat !== undefined) char.twinSat = studioMeta.twinSat;
                if (studioMeta.twinBri !== undefined) char.twinBri = studioMeta.twinBri;
                if (studioMeta.twinCon !== undefined) char.twinCon = studioMeta.twinCon;
                if (studioMeta.twinCostume !== undefined) char.twinCostume = parseInt(studioMeta.twinCostume, 10);
                if (studioMeta.twinSkinColor !== undefined) char.twinSkinColor = parseInt(studioMeta.twinSkinColor, 10);
                if (studioMeta.twinHp !== undefined) char.twinHp = parseInt(studioMeta.twinHp, 10);
                if (studioMeta.twinArmor !== undefined) char.twinArmor = parseInt(studioMeta.twinArmor, 10);
                if (studioMeta.twinBlack !== undefined) char.twinBlack = parseInt(studioMeta.twinBlack, 10);
                if (studioMeta.twinBone !== undefined) char.twinBone = parseInt(studioMeta.twinBone, 10);
                if (studioMeta.twinRotten !== undefined) char.twinRotten = parseInt(studioMeta.twinRotten, 10);
                if (studioMeta.twinBroken !== undefined) char.twinBroken = parseInt(studioMeta.twinBroken, 10);
                if (studioMeta.twinDamage !== undefined) char.twinDamage = parseFloat(studioMeta.twinDamage);
                if (studioMeta.twinTears !== undefined) char.twinTears = parseFloat(studioMeta.twinTears);
                if (studioMeta.twinSpeed !== undefined) char.twinSpeed = parseFloat(studioMeta.twinSpeed);
                if (studioMeta.twinRange !== undefined) char.twinRange = parseFloat(studioMeta.twinRange);
                if (studioMeta.twinShotspeed !== undefined) char.twinShotspeed = parseFloat(studioMeta.twinShotspeed);
                if (studioMeta.twinLuck !== undefined) char.twinLuck = parseFloat(studioMeta.twinLuck);
                if (studioMeta.twinFlying !== undefined) char.twinFlying = studioMeta.twinFlying === true || studioMeta.twinFlying === 'true';
                if (studioMeta.twinCanShoot !== undefined) char.twinCanShoot = studioMeta.twinCanShoot !== false && studioMeta.twinCanShoot !== 'false';
                if (studioMeta.twinItems !== undefined) char.twinItems = studioMeta.twinItems;
                if (studioMeta.twinTrinket !== undefined) char.twinTrinket = studioMeta.twinTrinket;
                if (studioMeta.twinPocketactive !== undefined) char.twinPocketactive = studioMeta.twinPocketactive;
                if (studioMeta.twinPocketitem !== undefined) char.twinPocketitem = studioMeta.twinPocketitem;
                if (studioMeta.twinCard !== undefined) char.twinCard = studioMeta.twinCard;
                if (studioMeta.twinPill !== undefined) char.twinPill = studioMeta.twinPill;
                if (studioMeta.twinCoins !== undefined) char.twinCoins = studioMeta.twinCoins;
                if (studioMeta.twinBombs !== undefined) char.twinBombs = studioMeta.twinBombs;
                if (studioMeta.twinKeys !== undefined) char.twinKeys = studioMeta.twinKeys;
                if (studioMeta.twinModdedItemsList !== undefined) char.twinModdedItemsList = studioMeta.twinModdedItemsList;
                if (studioMeta.twinModdedTrinketName !== undefined) char.twinModdedTrinketName = studioMeta.twinModdedTrinketName;
                if (studioMeta.twinModdedPocketItemName !== undefined) char.twinModdedPocketItemName = studioMeta.twinModdedPocketItemName;
                if (studioMeta.damage !== undefined) char.damage = parseFloat(studioMeta.damage);
                if (studioMeta.damageMult !== undefined) char.damageMult = parseFloat(studioMeta.damageMult);
                if (studioMeta.speed !== undefined) char.speed = parseFloat(studioMeta.speed);
                if (studioMeta.tears !== undefined) char.tears = parseFloat(studioMeta.tears);
                if (studioMeta.range !== undefined) char.range = parseFloat(studioMeta.range);
                if (studioMeta.shotspeed !== undefined) char.shotspeed = parseFloat(studioMeta.shotspeed);
                if (studioMeta.luck !== undefined) char.luck = parseFloat(studioMeta.luck);
                if (studioMeta.flying !== undefined) char.flying = studioMeta.flying === true || studioMeta.flying === 'true';
                if (studioMeta.canShoot !== undefined) char.canShoot = studioMeta.canShoot !== false && studioMeta.canShoot !== 'false';
                if (studioMeta.edenOutfits !== undefined) char.edenOutfits = studioMeta.edenOutfits === true || studioMeta.edenOutfits === 'true';
                if (studioMeta.moddedItemsList) char.moddedItemsList = studioMeta.moddedItemsList;
                if (studioMeta.moddedItemNames) char.moddedItemNames = studioMeta.moddedItemNames;
                if (studioMeta.moddedTrinketName) char.moddedTrinketName = studioMeta.moddedTrinketName;
                if (studioMeta.moddedPocketItemName) char.moddedPocketItemName = studioMeta.moddedPocketItemName;
                if (studioMeta.birthright) char.birthright = studioMeta.birthright;
              }

              // Fallback: check players.xml for twin partner record if not in studio_character.json
              const twinXmlPlayer = list.find(tp => tp.$ && tp.$ !== p.$ && (tp.$.achievement === '-2' || tp.$.hidden === 'true' || (tp.$.name && tp.$.name.includes('('))));
              if (twinXmlPlayer && twinXmlPlayer.$) {
                const tp = twinXmlPlayer.$;
                if (char.twinItems === undefined && tp.items) {
                  char.twinItems = tp.items.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
                }
                if (char.twinTrinket === undefined && tp.trinket) char.twinTrinket = parseInt(tp.trinket, 10);
                if (char.twinPocketactive === undefined && tp.pocketactive) char.twinPocketactive = parseInt(tp.pocketactive, 10);
                if (char.twinCard === undefined && tp.card) char.twinCard = parseInt(tp.card, 10);
                if (char.twinPill === undefined && tp.pill) char.twinPill = parseInt(tp.pill, 10);
                if (char.twinHp === undefined && tp.hp) char.twinHp = parseInt(tp.hp, 10);
                if (char.twinArmor === undefined && tp.armor) char.twinArmor = parseInt(tp.armor, 10);
                if (char.twinBlack === undefined && tp.black) char.twinBlack = parseInt(tp.black, 10);
                if (char.twinBone === undefined && tp.bone) char.twinBone = parseInt(tp.bone, 10);
                if (char.twinRotten === undefined && tp.rotten) char.twinRotten = parseInt(tp.rotten, 10);
                if (char.twinBroken === undefined && tp.broken) char.twinBroken = parseInt(tp.broken, 10);
                if (char.twinCoins === undefined && tp.coins) char.twinCoins = parseInt(tp.coins, 10);
                if (char.twinBombs === undefined && tp.bombs) char.twinBombs = parseInt(tp.bombs, 10);
                if (char.twinKeys === undefined && tp.keys) char.twinKeys = parseInt(tp.keys, 10);
              }

              // Ensure all folder sprite assets exist (fill from vanilla game sprites if missing)
              const assetPaths = await ensureCharacterModAssets(modDir, char, gamePath);

              // If custom sprite / portrait data URLs not in JSON, load directly from disk to render reworked palette
              if (!char.customSpriteDataUrl && assetPaths.skinDest && await fs.pathExists(assetPaths.skinDest)) {
                try {
                  const sBuf = await fs.readFile(assetPaths.skinDest);
                  if (sBuf && sBuf.length > 50) {
                    char.customSpriteDataUrl = `data:image/png;base64,${sBuf.toString('base64')}`;
                  }
                } catch (e) {}
              }

              if (!char.customPortraitDataUrl && assetPaths.portDest && await fs.pathExists(assetPaths.portDest)) {
                try {
                  const pBuf = await fs.readFile(assetPaths.portDest);
                  if (pBuf && pBuf.length > 50) {
                    char.customPortraitDataUrl = `data:image/png;base64,${pBuf.toString('base64')}`;
                  }
                } catch (e) {}
              }

              char.isMod = true;
              char.isStudioMod = true;
              char.modFolder = folder;
              char.modName = folder;
              char.items = char.items ? (typeof char.items === 'string' ? char.items.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n)) : char.items) : [];
              char.enabled = char.hidden !== 'true' && char.hidden !== '1';
              char.hidden = char.hidden === 'true' || char.hidden === '1';
              char.speed = char.speed !== undefined ? parseFloat(char.speed) : 1.0;
              char.damage = char.damage !== undefined ? parseFloat(char.damage) : 3.5;
              char.damageMult = char.damageMult !== undefined ? parseFloat(char.damageMult) : 1.0;
              char.tears = char.tears !== undefined ? parseFloat(char.tears) : 2.73;
              char.range = char.range !== undefined ? parseFloat(char.range) : 6.5;
              char.shotspeed = char.shotspeed !== undefined ? parseFloat(char.shotspeed) : 1.0;
              char.luck = char.luck !== undefined ? parseFloat(char.luck) : 0;
              char.hp = char.hp ? parseInt(char.hp, 10) : 6;
              char.armor = char.armor ? parseInt(char.armor, 10) : 0;
              char.black = char.black ? parseInt(char.black, 10) : 0;
              char.bone = char.bone ? parseInt(char.bone, 10) : 0;
              char.broken = char.broken ? parseInt(char.broken, 10) : 0;
              char.coins = char.coins ? parseInt(char.coins, 10) : 0;
              char.bombs = char.bombs ? parseInt(char.bombs, 10) : 0;
              char.keys = char.keys ? parseInt(char.keys, 10) : 0;
              char.flying = char.flying === 'true' || char.flying === true;
              char.canShoot = char.canShoot !== 'false' && char.canShoot !== false;
              char.isTainted = char.isTainted === 'true' || char.isTainted === true;
              char.skinColor = -1;
              char.uniqueKey = `studio-${folder}-${char.name}`;
              char.xmlPath = playersXmlPath;
              customChars.push(char);
            }
          }
        } catch (e) {
          console.warn(`Error reading custom character players.xml in ${folder}:`, e.message);
        }
      }
    }
  } catch (err) {
    console.error('Error scanning custom studio characters:', err);
  }

  return customChars;
}

/**
 * Deletes a custom character or dedicated custom character mod folder cleanly.
 */
export async function deleteCustomCharacter(characterName, folderName, modsPath, targetDLC = 'repentanceplus') {
  if (!modsPath) return { success: false, error: 'modsPath not provided' };

  try {
    if (folderName && folderName.startsWith('custom_character_')) {
      const dedicatedDir = path.join(modsPath, folderName);
      if (await fs.pathExists(dedicatedDir)) {
        await fs.remove(dedicatedDir);
        return { success: true, message: `Removed dedicated mod ${folderName}` };
      }
    }

    const packFolders = [folderName].filter(Boolean);
    for (const folder of packFolders) {
      const modDir = path.join(modsPath, folder);
      const playersXmlPath = path.join(modDir, 'content', 'players.xml');

      if (await fs.pathExists(playersXmlPath)) {
        const xmlRaw = await fs.readFile(playersXmlPath, 'utf8');
        const parser = new xml2js.Parser();
        const parsed = await parser.parseStringPromise(xmlRaw);

        if (parsed.players && parsed.players.player) {
          const list = Array.isArray(parsed.players.player) ? parsed.players.player : [parsed.players.player];
          const remaining = list
            .map(p => ({ ...p.$, items: p.$.items ? p.$.items.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n)) : [] }))
            .filter(c => c.name.toLowerCase() !== characterName.toLowerCase());

          if (remaining.length === 0) {
            await fs.remove(modDir);
            return { success: true, message: `Deleted mod ${folder}` };
          }

          const updatedXml = buildPlayersXml(remaining, targetDLC);
          await fs.writeFile(playersXmlPath, updatedXml, 'utf8');

          const safeModId = folder.replace(/[^a-zA-Z0-9_]/g, '_');
          const updatedLua = generateLuaScript(remaining, safeModId);
          await fs.writeFile(path.join(modDir, 'main.lua'), updatedLua, 'utf8');

          return { success: true, message: `Removed ${characterName} from ${folder}` };
        }
      }
    }

    return { success: true, message: 'Character removed.' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Compiles and streams a complete, ready-to-play Isaac mod ZIP package without junk files.
 */
export async function createModZipStream(character, options = {}, gamePath = '') {
  const os = await import('os');
  const tempId = `isaac_mod_zip_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const tempBase = path.join(os.tmpdir(), tempId);
  const cleanCharName = (character.name || 'custom_character').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const modFolderName = options.folderName || `custom_character_${cleanCharName}`;
  const targetDir = path.join(tempBase, modFolderName);

  await fs.ensureDir(targetDir);

  // 1. Compile full mod structure into temporary folder
  await createCustomMod(character, {
    ...options,
    folderName: modFolderName,
    targetDir: targetDir
  }, gamePath);

  const archive = archiver('zip', { zlib: { level: 9 } });

  // 2. Add all compiled files into the ZIP archive (excluding junk files)
  async function addFilesRecursively(dir, relPath = '') {
    if (!await fs.pathExists(dir)) return;
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const entryRel = relPath ? `${relPath}/${entry.name}` : entry.name;

      // Filter out unnecessary junk files
      if (
        entry.name === '.DS_Store' ||
        entry.name === 'Thumbs.db' ||
        entry.name === 'desktop.ini' ||
        entry.name.endsWith('.tmp') ||
        entry.name.endsWith('.bak') ||
        entry.name.startsWith('.~')
      ) {
        continue;
      }

      if (entry.isDirectory()) {
        await addFilesRecursively(fullPath, entryRel);
      } else {
        archive.file(fullPath, { name: `${modFolderName}/${entryRel}` });
      }
    }
  }

  await addFilesRecursively(targetDir);

  // Clean up temporary folder on archive completion
  archive.on('end', () => {
    fs.remove(tempBase).catch(() => {});
  });
  archive.on('error', () => {
    fs.remove(tempBase).catch(() => {});
  });

  archive.finalize();
  return archive;
}

/**
 * Cleanly removes all custom character mod folders created by Isaac Character Studio
 * across all active and default mods directories.
 */
export async function clearAllStudioMods(extraDirs = []) {
  const deletedFolders = [];
  const candidateDirs = new Set();

  const config = getConfig();
  if (config.modsPath) candidateDirs.add(config.modsPath);
  if (config.gamePath) candidateDirs.add(path.join(config.gamePath, 'mods'));

  if (Array.isArray(DEFAULT_MOD_PATHS)) {
    for (const p of DEFAULT_MOD_PATHS) {
      if (p) candidateDirs.add(p);
    }
  }

  if (Array.isArray(extraDirs)) {
    for (const p of extraDirs) {
      if (p) candidateDirs.add(p);
    }
  }

  for (const baseModsDir of candidateDirs) {
    if (!baseModsDir || !(await fs.pathExists(baseModsDir))) continue;

    try {
      const entries = await fs.readdir(baseModsDir);
      for (const entry of entries) {
        const fullModDir = path.join(baseModsDir, entry);
        try {
          const stat = await fs.stat(fullModDir);
          if (!stat.isDirectory()) continue;
        } catch {
          continue;
        }

        const isStudioName = entry === 'HyruleCustomCharacters' ||
                             entry.startsWith('custom_character_') ||
                             entry.startsWith('custom_char_') ||
                             entry.startsWith('custom_');

        const hasStudioMeta = await fs.pathExists(path.join(fullModDir, 'studio_character.json'));

        let hasStudioXmlOrLua = false;
        const mainLuaPath = path.join(fullModDir, 'main.lua');
        if (await fs.pathExists(mainLuaPath)) {
          try {
            const lua = await fs.readFile(mainLuaPath, 'utf8');
            if (lua.includes('Isaac Character Studio')) {
              hasStudioXmlOrLua = true;
            }
          } catch {}
        }

        if (isStudioName || hasStudioMeta || hasStudioXmlOrLua) {
          try {
            await fs.remove(fullModDir);
            deletedFolders.push(fullModDir);
            console.log(`[Reset] Removed custom character mod folder: ${fullModDir}`);
          } catch (e) {
            console.warn(`[Reset] Failed to remove mod folder ${fullModDir}:`, e.message);
          }
        }
      }
    } catch (err) {
      console.warn(`[Reset] Could not scan mods dir ${baseModsDir}:`, err.message);
    }
  }

  return deletedFolders;
}

