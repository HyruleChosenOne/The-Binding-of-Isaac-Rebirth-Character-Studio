import fs from 'fs-extra';
import path from 'path';
import xml2js from 'xml2js';
import { DATA_DIR } from '../config.js';
import { SKIN_TO_COSTUME, SKIN_TO_SKIN_COLOR } from './modExporter.js';

export function serializeCharacterToXmlAttributes(char, targetDLC = 'repentanceplus') {
  const isRepentance = targetDLC === 'repentance' || targetDLC === 'repentanceplus';

  const attr = {};

  // NEVER emit id for modded custom characters unless explicitly overriding a vanilla character
  if (char.isVanillaOverride && char.id !== undefined) {
    attr.id = String(char.id);
  }

  let rawName = (char.name || 'CustomCharacter').replace(/[^\x20-\x7E]/g, '').trim() || 'CustomCharacter';
  if ((char.isDual === true || char.isDual === 'true') && !rawName.includes('&')) {
    const secondary = char.twinName ? String(char.twinName).trim() : 'Isaac';
    rawName = `${rawName} & ${secondary}`;
  }
  attr.name = rawName;
  attr.skin = char.skin || 'character_001_isaac.png';

  // Resolve authentic skinColor (-1 default, 1 for Azazel/Judas/Lilith, 2 for Blue Baby, 5 for Keeper/Apollyon/Forgotten, 0 for The Lost, etc.)
  const resolvedSkinColor = (char.skinColor !== undefined && char.skinColor !== null)
    ? String(char.skinColor)
    : (SKIN_TO_SKIN_COLOR[char.baseSkin || char.skin] !== undefined ? String(SKIN_TO_SKIN_COLOR[char.baseSkin || char.skin]) : '-1');

  attr.skinColor = resolvedSkinColor;

  const hasCustomSprite = !!(char.customSpriteDataUrl || char.hasCustomSprite || (char.skin && !char.skin.startsWith('character_0')));
  const resolvedCostume = (char.costume !== undefined && char.costume !== null && Number(char.costume) > 0)
    ? Number(char.costume)
    : (hasCustomSprite ? 0 : (SKIN_TO_COSTUME[char.baseSkin || char.skin] || 0));

  if (resolvedCostume > 0) {
    attr.costume = String(resolvedCostume);
  }

  // Forgotten archetype handling
  const isForgotten = char.archetype === 'forgotten' || char.isForgotten || char.skin === 'character_017_theforgotten.png' || char.baseSkin === 'character_017_theforgotten.png' || char.costumeSuffix === 'forgotten';
  if (isForgotten) {
    attr.costumeSuffix = char.costumeSuffix || 'forgotten';
    if (char.skinColor === undefined || char.skinColor === null) attr.skinColor = '5';
  } else if (char.costumeSuffix) {
    attr.costumeSuffix = String(char.costumeSuffix);
  }

  if (char.edenOutfits || char.skin === 'character_009_eden.png' || char.skin === 'character_010_eden.png') {
    attr.costumes = 'true';
    attr.customHair = 'true';
  }

  // Health Containers
  attr.hp = String(char.hp !== undefined ? char.hp : 6);
  if (char.rotten > 0) attr.rotten = String(char.rotten);
  if (char.armor > 0) attr.armor = String(char.armor);
  if (char.black > 0) attr.black = String(char.black);
  if (char.bone > 0) attr.bone = String(char.bone);
  if (char.gold > 0) attr.gold = String(char.gold);
  if (char.eternal > 0) attr.eternal = String(char.eternal);
  if (char.broken > 0) attr.broken = String(char.broken);

  // Pickups
  if (char.coins > 0) attr.coins = String(char.coins);
  if (char.bombs > 0) attr.bombs = String(char.bombs);
  if (char.keys > 0) attr.keys = String(char.keys);

  // Consumables
  if (char.card > 0) attr.card = String(char.card);
  if (char.pill > 0) attr.pill = String(char.pill);

  // Starting Collectible Items (ONLY include vanilla items <= 732 to prevent modded ID clashes)
  if (Array.isArray(char.items) && char.items.length > 0) {
    const validItems = char.items.filter(id => typeof id === 'number' && id > 0 && id <= 732);
    if (validItems.length > 0) {
      attr.items = validItems.join(',');
    }
  }

  if (char.trinket > 0 && char.trinket <= 189) attr.trinket = String(char.trinket);

  // Repentance Pocket Items & Birthright
  if (isRepentance) {
    if (char.pocketactive > 0 && char.pocketactive <= 732) {
      attr.pocketactive = String(char.pocketactive);
    } else if (char.pocketitem > 0 && char.pocketitem >= 100 && char.pocketitem <= 732 && !char.card && !char.pill) {
      // Only set pocketitem if it is an actual collectible ID, not a card or pill
      attr.pocketitem = String(char.pocketitem);
    }
    if (char.birthright) attr.birthright = String(char.birthright).replace(/[^\x20-\x7E]/g, '');
    if (char.isTainted && char.bSkinParent) attr.bSkinParent = char.bSkinParent;
    if (char.healthType) attr.healthType = String(char.healthType);
  }

  // Visuals (Stage / Menu / Boss)
  const cleanCharName = rawName.replace(/[^a-zA-Z0-9_]/g, '_') || 'custom_char';
  attr.skin = (char.skin && char.skin.trim()) ? char.skin.trim() : `character_${cleanCharName}.png`;
  const resolvedPortrait = (char.portrait && char.portrait.trim()) ? char.portrait.trim() : `playerportrait_${cleanCharName}.png`;
  attr.portrait = resolvedPortrait;
  attr.bigportrait = (char.bigportrait && char.bigportrait.trim()) ? char.bigportrait.trim() : resolvedPortrait;
  attr.nameimage = (char.nameimage && char.nameimage.trim()) ? char.nameimage.trim() : `playername_${cleanCharName}.png`;

  // Modifiers
  if (char.canShoot === false) attr.canShoot = 'false';
  if (char.flying) attr.flying = 'true';
  if (char.hidden === true || char.enabled === false) attr.hidden = 'true';
  if (char.achievement === -2 || char.achievement === '-2') attr.achievement = '-2';

  return attr;
}

export function buildPlayersXml(characters, targetDLC = 'repentanceplus') {
  const isRepentance = targetDLC === 'repentance' || targetDLC === 'repentanceplus';
  const rootAttrs = {
    root: 'gfx/characters/costumes/',
    portraitroot: 'gfx/ui/stage/',
    nameimageroot: 'gfx/ui/boss/',
    bigportraitroot: 'gfx/ui/stage/'
  };

  const builder = new xml2js.Builder({
    headless: false,
    renderOpts: { pretty: true, indent: '  ', newline: '\n' }
  });

  const playerElements = [];
  characters.forEach(c => {
    // 1. Primary Character Element
    playerElements.push({
      $: serializeCharacterToXmlAttributes(c, targetDLC)
    });

    // 2. Twin Partner Character Element (Jacob & Esau Archetype)
    if (c.isDual === true || c.isDual === 'true') {
      let cleanCharName = (c.name || 'CustomCharacter').replace(/[^\x20-\x7E]/g, '').trim() || 'CustomCharacter';
      let secondaryName = c.twinName ? String(c.twinName).trim() : '';
      if (!cleanCharName.includes('&')) {
        if (secondaryName) {
          cleanCharName = `${cleanCharName} & ${secondaryName}`;
        } else {
          secondaryName = 'Isaac';
          cleanCharName = `${cleanCharName} & ${secondaryName}`;
        }
      } else if (!secondaryName) {
        const parts = cleanCharName.split('&').map(s => s.trim());
        if (parts.length > 1 && parts[1]) {
          secondaryName = parts[1];
        } else {
          secondaryName = 'Isaac';
        }
      }
      const twinSkin = c.twinSkin || 'character_003x_esau.png';
      const resolvedTwinSkinColor = c.twinSkinColor !== undefined
        ? String(c.twinSkinColor)
        : (SKIN_TO_SKIN_COLOR[c.twinBaseSkin || twinSkin] !== undefined ? String(SKIN_TO_SKIN_COLOR[c.twinBaseSkin || twinSkin]) : '3');
      const resolvedTwinCostume = (c.twinCostume !== undefined && Number(c.twinCostume) > 0)
        ? String(c.twinCostume)
        : String(SKIN_TO_COSTUME[c.twinBaseSkin || twinSkin] || 53);

      const twinName = `${cleanCharName} (${secondaryName})`;
      const twinAttr = {
        name: twinName,
        skin: twinSkin,
        costume: resolvedTwinCostume,
        hp: String(c.twinHp !== undefined ? c.twinHp : 2),
        armor: String(c.twinArmor !== undefined ? c.twinArmor : 2),
        achievement: '-2', // Standard Repentance subplayer identifier
        hidden: 'true', // CRITICAL: Hides the twin from Isaac's character selection wheel so it doesn't appear as invisible "Random" slot
        skinColor: resolvedTwinSkinColor,
        nameimage: (c.nameimage && c.nameimage.trim()) ? c.nameimage.trim() : `playername_${cleanCharName.replace(/[^a-zA-Z0-9_]/g, '_')}.png`,
        portrait: (c.twinPortrait && c.twinPortrait.trim()) ? c.twinPortrait.trim() : ((c.portrait && c.portrait.trim()) ? c.portrait.trim() : `playerportrait_${cleanCharName.replace(/[^a-zA-Z0-9_]/g, '_')}.png`)
      };

      if (c.twinBlack > 0) twinAttr.black = String(c.twinBlack);
      if (c.twinBone > 0) twinAttr.bone = String(c.twinBone);
      if (c.twinRotten > 0) twinAttr.rotten = String(c.twinRotten);
      if (c.twinBroken > 0) twinAttr.broken = String(c.twinBroken);
      if (c.twinCoins > 0) twinAttr.coins = String(c.twinCoins);
      if (c.twinBombs > 0) twinAttr.bombs = String(c.twinBombs);
      if (c.twinKeys > 0) twinAttr.keys = String(c.twinKeys);
      if (c.twinCard > 0) twinAttr.card = String(c.twinCard);
      if (c.twinPill > 0) twinAttr.pill = String(c.twinPill);
      if (c.twinTrinket > 0 && c.twinTrinket <= 189) twinAttr.trinket = String(c.twinTrinket);
      if (c.twinPocketactive > 0 && c.twinPocketactive <= 732) twinAttr.pocketactive = String(c.twinPocketactive);
      if (Array.isArray(c.twinItems) && c.twinItems.length > 0) {
        const validTwinItems = c.twinItems.filter(id => typeof id === 'number' && id > 0 && id <= 732);
        if (validTwinItems.length > 0) {
          twinAttr.items = validTwinItems.join(',');
        }
      }
      if (c.twinFlying || c.flying) twinAttr.flying = 'true';
      if (c.twinCanShoot === false || c.canShoot === false) twinAttr.canShoot = 'false';

      playerElements.push({
        $: twinAttr
      });
    }

    // 3. The Forgotten Archetype Soul Partner Element
    const isForgottenChar = (c.archetype === 'forgotten' || c.isForgotten || c.skin === 'character_017_theforgotten.png') && !c.isDual;
    if (isForgottenChar) {
      let cleanCharName = (c.name || 'CustomCharacter').replace(/[^\x20-\x7E]/g, '').trim() || 'CustomCharacter';
      playerElements.push({
        $: {
          name: `${cleanCharName} (The Soul)`,
          skin: 'character_018_thesoul.png',
          armor: '2',
          achievement: '-2',
          hidden: 'true',
          skinColor: '2',
          costumeSuffix: 'forgottensoul',
          flying: 'true',
          nameimage: (c.nameimage && c.nameimage.trim()) ? c.nameimage.trim() : `playername_${cleanCharName.replace(/[^a-zA-Z0-9_]/g, '_')}.png`,
          portrait: (c.portrait && c.portrait.trim()) ? c.portrait.trim() : `playerportrait_${cleanCharName.replace(/[^a-zA-Z0-9_]/g, '_')}.png`
        }
      });
    }
  });

  const xmlObj = {
    players: {
      $: rootAttrs,
      player: playerElements
    }
  };

  return builder.buildObject(xmlObj);
}

const OVERRIDES_FILE = path.join(DATA_DIR, 'character_overrides.json');

export async function getCharacterOverrides() {
  try {
    if (await fs.pathExists(OVERRIDES_FILE)) {
      return await fs.readJson(OVERRIDES_FILE);
    }
  } catch (e) {
    console.error('Error reading character overrides:', e);
  }
  return {};
}

export async function saveCharacterOverrideRecord(charKey, charData) {
  try {
    await fs.ensureDir(path.dirname(OVERRIDES_FILE));
    const overrides = await getCharacterOverrides();
    overrides[charKey] = charData;
    await fs.writeJson(OVERRIDES_FILE, overrides, { spaces: 2 });
  } catch (e) {
    console.error('Error saving character override record:', e);
  }
}

export async function saveCharacterEdit(character, targetDLC, modsPath) {
  // Generate stable character unique key
  const charKey = character.uniqueKey || (character.id !== undefined && !character.isMod
    ? (character.isTainted ? `tainted-${character.id}` : `vanilla-${character.id}`)
    : (character.xmlPath ? `${character.modName || 'mod'}-${character.name}` : character.name));

  // Save to persistent overrides
  await saveCharacterOverrideRecord(charKey, character);

  // If this character belongs to an existing mod, update that mod's players.xml
  if (character.isMod && character.xmlPath && (await fs.pathExists(character.xmlPath))) {
    const backupPath = `${character.xmlPath}.${Date.now()}.bak`;
    await fs.copy(character.xmlPath, backupPath);

    const xmlContent = await fs.readFile(character.xmlPath, 'utf8');
    const parser = new xml2js.Parser();
    const parsed = await parser.parseStringPromise(xmlContent);

    if (parsed.players && parsed.players.player) {
      const idx = parsed.players.player.findIndex(p => p.$.name === character.name);
      const newAttrs = serializeCharacterToXmlAttributes(character, targetDLC);

      if (idx >= 0) {
        parsed.players.player[idx].$ = newAttrs;
      } else {
        parsed.players.player.push({ $: newAttrs });
      }

      const builder = new xml2js.Builder({
        headless: false,
        renderOpts: { pretty: true, indent: '  ', newline: '\n' }
      });
      const newXml = builder.buildObject(parsed);
      await fs.writeFile(character.xmlPath, newXml, 'utf8');
      return {
        success: true,
        message: `Successfully updated character in mod file with backup created: ${path.basename(backupPath)}`,
        backupPath
      };
    }
  }

  // If this is a vanilla character or standalone edit, create an override mod
  const modFolderName = `custom_${character.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_override`;
  const modDir = path.join(modsPath, modFolderName);
  const contentDir = path.join(modDir, 'content');
  await fs.ensureDir(contentDir);

  const metadataXml = `<metadata>
  <name>${character.name} (Custom Studio Override)</name>
  <directory>${modFolderName}</directory>
  <description>Custom character modifications created with Isaac Character Studio.</description>
  <version>1.0</version>
  <visibility>Public</visibility>
</metadata>`;
  await fs.writeFile(path.join(modDir, 'metadata.xml'), metadataXml, 'utf8');

  const singleXml = buildPlayersXml([character], targetDLC);
  await fs.writeFile(path.join(contentDir, 'players.xml'), singleXml, 'utf8');

  return {
    success: true,
    message: `Character saved and override mod created in "${modFolderName}"!`,
    modPath: modDir
  };
}
