import fs from 'fs-extra';
import path from 'path';
import xml2js from 'xml2js';
import { VANILLA_CHARACTERS, isVanillaCharacterFile, isVanillaPortraitFile } from './vanillaCharacters.js';
import { getConfig, ASSETS_DIR, DEFAULT_GAME_PATHS, DEFAULT_MOD_PATHS, DEFAULT_WORKSHOP_PATHS } from '../config.js';
import { getCustomStudioCharacters } from './modExporter.js';

export async function scanGameAndMods(gamePath, modsPath, workshopPath) {
  const config = getConfig();
  const effectiveModsPath = modsPath || config.modsPath;
  const customStudioChars = await getCustomStudioCharacters(effectiveModsPath);

  const result = {
    gameDetected: false,
    modsDetected: false,
    gamePath: gamePath || config.gamePath,
    modsPath: effectiveModsPath,
    workshopPath: workshopPath || config.workshopPath,
    mods: [],
    characters: customStudioChars,
    availableSprites: [],
    availablePortraits: []
  };

  const targetGamePath = result.gamePath;
  if (targetGamePath && await fs.pathExists(targetGamePath)) {
    result.gameDetected = true;
  }

  // 1. Scan available sprites strictly for vanilla playable characters from pre-bundled assets
  const localCharDir = path.join(ASSETS_DIR, 'characters');
  const foundSprites = new Set();

  if (await fs.pathExists(localCharDir)) {
    try {
      const files = await fs.readdir(localCharDir);
      for (const file of files) {
        if (file.toLowerCase().endsWith('.png') && isVanillaCharacterFile(file)) {
          foundSprites.add(file);
        }
      }
    } catch (e) {}
  }

  // If bundled folder is missing on disk for any reason, fallback to known vanilla character list
  if (foundSprites.size === 0) {
    VANILLA_CHARACTERS.forEach(c => {
      if (c.skin) foundSprites.add(c.skin);
    });
  }

  result.availableSprites = Array.from(foundSprites).sort();

  // 2. Scan available stage portraits strictly for vanilla characters from pre-bundled assets
  const localUiDir = path.join(ASSETS_DIR, 'ui');
  const foundPortraits = new Set();

  if (await fs.pathExists(localUiDir)) {
    try {
      const files = await fs.readdir(localUiDir);
      for (const file of files) {
        if (file.toLowerCase().endsWith('.png') && isVanillaPortraitFile(file)) {
          foundPortraits.add(file);
        }
      }
    } catch (e) {}
  }

  if (foundPortraits.size === 0) {
    VANILLA_CHARACTERS.forEach(c => {
      if (c.portrait) foundPortraits.add(c.portrait);
    });
  }

  result.availablePortraits = Array.from(foundPortraits).sort();


  // 3. Scan Mods & Workshop directories
  const rawDirs = [
    result.modsPath,
    result.workshopPath,
    config.modsPath,
    config.workshopPath,
    ...DEFAULT_MOD_PATHS,
    ...DEFAULT_WORKSHOP_PATHS,
    targetGamePath ? path.join(targetGamePath, 'mods') : null,
    targetGamePath ? path.resolve(targetGamePath, '..', '..', 'workshop', 'content', '250900') : null
  ].filter(Boolean);

  const searchDirs = new Set();
  for (const dir of rawDirs) {
    try {
      const canonical = path.resolve(dir);
      if (await fs.pathExists(canonical)) {
        searchDirs.add(canonical);
      }
    } catch {}
  }

  if (searchDirs.size > 0) {
    result.modsDetected = true;
    const seenModFolders = new Set();
    const seenModNames = new Set();
    const seenCharKeys = new Set();

    for (const baseDir of searchDirs) {
      const isWorkshop = baseDir.toLowerCase().includes('workshop') || baseDir.includes('250900');
      try {
        const folders = await fs.readdir(baseDir);

        for (const folder of folders) {
          const modDirPath = path.resolve(baseDir, folder);
          try {
            const stat = await fs.stat(modDirPath);
            if (!stat.isDirectory()) continue;
          } catch { continue; }

          const dedupeModKey = modDirPath.toLowerCase();
          if (seenModFolders.has(dedupeModKey)) continue;
          seenModFolders.add(dedupeModKey);

          const isStudioMod = folder.startsWith('custom_character_') || folder.startsWith('custom_') || folder.includes('custom');

          let metaName = folder;
          let metaVersion = '1.0';
          let metaDesc = '';

          // Parse metadata.xml if present
          const metadataPath = path.join(modDirPath, 'metadata.xml');
          if (await fs.pathExists(metadataPath)) {
            try {
              const metaXml = await fs.readFile(metadataPath, 'utf8');
              const parser = new xml2js.Parser();
              const metaParsed = await parser.parseStringPromise(metaXml);
              if (metaParsed.metadata) {
                const rawN = metaParsed.metadata.name?.[0] || metaParsed.metadata.name;
                if (typeof rawN === 'string' && rawN.trim()) metaName = rawN.trim();
                metaVersion = metaParsed.metadata.version?.[0] || metaParsed.metadata.version || '1.0';
                metaDesc = metaParsed.metadata.description?.[0] || '';
              }
            } catch (e) {}
          }

          const nameKey = metaName.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (nameKey && seenModNames.has(nameKey)) {
            // Skip mirror copy
            continue;
          }
          if (nameKey) seenModNames.add(nameKey);

          const modInfo = {
            folder,
            path: modDirPath,
            name: metaName,
            version: metaVersion,
            description: metaDesc,
            isWorkshop,
            workshopId: isWorkshop && /^\d+$/.test(folder) ? folder : null,
            isStudioMod,
            characters: [],
            hasLua: await fs.pathExists(path.join(modDirPath, 'main.lua'))
          };

          // Search for players.xml
          const playerXmlCandidates = [
            path.join(modDirPath, 'content', 'players.xml'),
            path.join(modDirPath, 'content', 'eng', 'players.xml'),
            path.join(modDirPath, 'resources', 'players.xml'),
            path.join(modDirPath, 'content-repentogon', 'players.xml')
          ];

          for (const pXmlPath of playerXmlCandidates) {
            if (await fs.pathExists(pXmlPath)) {
              try {
                const xmlContent = await fs.readFile(pXmlPath, 'utf8');
                let xmlParsed = null;
                try {
                  const parser = new xml2js.Parser();
                  xmlParsed = await parser.parseStringPromise(xmlContent);
                } catch (parseErr) {
                  const playerTagRegex = /<player\s+([^>]+)\/?>/gi;
                  const attrRegex = /([a-zA-Z0-9_]+)="([^"]*)"/g;
                  let match;
                  const recoveredPlayers = [];
                  while ((match = playerTagRegex.exec(xmlContent)) !== null) {
                    const attrStr = match[1];
                    const attrObj = {};
                    let attrMatch;
                    while ((attrMatch = attrRegex.exec(attrStr)) !== null) {
                      attrObj[attrMatch[1]] = attrMatch[2];
                    }
                    if (attrObj.name) {
                      recoveredPlayers.push({ $: attrObj });
                    }
                  }
                  if (recoveredPlayers.length > 0) {
                    xmlParsed = { players: { player: recoveredPlayers } };
                  }
                }

                if (xmlParsed && xmlParsed.players && xmlParsed.players.player) {
                  const playerList = Array.isArray(xmlParsed.players.player) ? xmlParsed.players.player : [xmlParsed.players.player];
                  for (let i = 0; i < playerList.length; i++) {
                    const p = playerList[i].$;
                    if (!p || !p.name) continue;

                    // Skip secondary subplayer entities (such as Jacob & Esau twins or Soul/Ghost partners)
                    if (p.hidden === 'true' || p.canSpawn === 'false' || p.achievement === '-2' || p.name.includes(' (Twin)') || p.name.includes(' (Ghost)')) {
                      continue;
                    }

                    const charName = p.name;
                    const charDedupeKey = `${modInfo.name}::${charName}::${p.bSkinParent || ''}`;
                    if (seenCharKeys.has(charDedupeKey)) continue;
                    seenCharKeys.add(charDedupeKey);

                    const isTainted = !!p.bSkinParent || charName.toLowerCase().endsWith('b') || charName.toLowerCase().includes('tainted') || p.achievement?.toLowerCase().includes('tainted');
                    
                    let items = [];
                    if (p.items) {
                      items = p.items.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
                    }

                    const uniqueKey = `mod-${modInfo.name}-${charName}${isTainted ? '-tainted' : ''}`;
                    const override = {};

                    let studioData = {};
                    const studioMetaPath = path.join(modDirPath, 'studio_character.json');
                    if (await fs.pathExists(studioMetaPath)) {
                      try {
                        studioData = await fs.readJson(studioMetaPath);
                      } catch (e) {
                        console.warn(`Error reading studio_character.json in ${modDirPath}:`, e.message);
                      }
                    }

                    const modChar = {
                      uniqueKey,
                      id: p.id !== undefined ? parseInt(p.id, 10) : undefined,
                      name: charName,
                      skin: p.skin || 'character_001_isaac.png',
                      skinColor: -1, // Guarantee -1 for clean rendering
                      hp: p.hp !== undefined ? parseInt(p.hp, 10) : (studioData.hp ?? 6),
                      armor: p.armor !== undefined ? parseInt(p.armor, 10) : (studioData.armor ?? 0),
                      black: p.black !== undefined ? parseInt(p.black, 10) : (studioData.black ?? 0),
                      bone: p.bone !== undefined ? parseInt(p.bone, 10) : (studioData.bone ?? 0),
                      broken: p.brokenhearts !== undefined ? parseInt(p.brokenhearts, 10) : (studioData.broken ?? 0),
                      coins: p.coins !== undefined ? parseInt(p.coins, 10) : (studioData.coins ?? 0),
                      bombs: p.bombs !== undefined ? parseInt(p.bombs, 10) : (studioData.bombs ?? 0),
                      keys: p.keys !== undefined ? parseInt(p.keys, 10) : (studioData.keys ?? 0),
                      items,
                      moddedItemsList: studioData.moddedItemsList || (studioData.moddedItemNames ? studioData.moddedItemNames.map(n => ({ name: n, count: 1 })) : []),
                      moddedItemNames: studioData.moddedItemNames || [],
                      moddedTrinketName: studioData.moddedTrinketName || '',
                      moddedPocketItemName: studioData.moddedPocketItemName || '',
                      trinket: p.trinket !== undefined ? parseInt(p.trinket, 10) : (studioData.trinket ?? 0),
                      pocketitem: p.pocketitem !== undefined ? parseInt(p.pocketitem, 10) : (studioData.pocketitem ?? 0),
                      pocketactive: p.pocketactive !== undefined ? parseInt(p.pocketactive, 10) : (studioData.pocketactive ?? 0),
                      card: p.card !== undefined ? parseInt(p.card, 10) : 0,
                      pill: p.pill !== undefined ? parseInt(p.pill, 10) : 0,
                      birthright: p.birthright || studioData.birthright || '',
                      speed: studioData.speed !== undefined ? parseFloat(studioData.speed) : (p.speed !== undefined ? parseFloat(p.speed) : 1.0),
                      damage: studioData.damage !== undefined ? parseFloat(studioData.damage) : (p.damage !== undefined ? parseFloat(p.damage) : 3.5),
                      damageMult: studioData.damageMult !== undefined ? parseFloat(studioData.damageMult) : (p.damageMult !== undefined ? parseFloat(p.damageMult) : 1.0),
                      tears: studioData.tears !== undefined ? parseFloat(studioData.tears) : (p.tears !== undefined ? parseFloat(p.tears) : 2.73),
                      range: studioData.range !== undefined ? parseFloat(studioData.range) : (p.range !== undefined ? parseFloat(p.range) : 6.5),
                      shotspeed: studioData.shotspeed !== undefined ? parseFloat(studioData.shotspeed) : (p.shotspeed !== undefined ? parseFloat(p.shotspeed) : 1.0),
                      luck: studioData.luck !== undefined ? parseFloat(studioData.luck) : (p.luck !== undefined ? parseFloat(p.luck) : 0),
                      flying: p.flying === 'true' || studioData.flying === true,
                      canShoot: p.canShoot !== 'false' && studioData.canShoot !== false,
                      edenOutfits: studioData.edenOutfits ?? false,
                      costume: p.costume !== undefined ? parseInt(p.costume, 10) : undefined,
                      costumeSuffix: p.costumeSuffix || '',
                      bSkinParent: p.bSkinParent || '',
                      healthType: p.healthType !== undefined ? parseInt(p.healthType, 10) : 0,
                      nameimage: p.nameimage || '',
                      portrait: p.portrait || `playerportrait_${charName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`,
                      bigportrait: p.bigportrait || '',
                      hidden: override.hidden !== undefined ? override.hidden : (p.hidden === 'true' || p.hidden === '1'),
                      enabled: override.enabled !== undefined ? override.enabled : (p.hidden !== 'true' && p.hidden !== '1'),
                      dlc: isWorkshop ? 'workshop' : 'repentanceplus',
                      isTainted,
                      isMod: true,
                      isWorkshop,
                      workshopId: modInfo.workshopId,
                      isStudioMod: isStudioMod || !!studioData.name,
                      modName: modInfo.name,
                      modFolder: folder,
                      xmlPath: pXmlPath,
                      ...override
                    };

                    modInfo.characters.push(modChar);
                  }
                }
              } catch (e) {
                console.warn(`Error reading ${pXmlPath}:`, e.message);
              }
              break; // Prevent duplicate scanning of multiple players.xml in same mod
            }
          }

          if (modInfo.characters.length > 0 || modInfo.hasLua) {
            result.mods.push(modInfo);
          }
        }
      } catch (err) {
        console.warn(`Error reading directory ${baseDir}:`, err.message);
      }
    }
  }

  return result;
}

/**
 * Deep scan for all candidate game paths and verify extracted assets.
 */
export async function scanDeepPaths() {
  const config = getConfig();
  const candidates = [];

  const checkDirs = Array.from(new Set([
    config.gamePath,
    ...DEFAULT_GAME_PATHS
  ])).filter(Boolean);

  for (const dir of checkDirs) {
    const exists = await fs.pathExists(dir);
    if (!exists) continue;

    const hasExe = await fs.pathExists(path.join(dir, 'isaac-ng.exe')) ||
                   await fs.pathExists(path.join(dir, 'Isaac.exe')) ||
                   await fs.pathExists(path.join(dir, 'The Binding of Isaac Rebirth.exe'));

    const resDirs = [
      path.join(dir, 'extracted_resources', 'resources-dlc4'),
      path.join(dir, 'extracted_resources', 'resources-dlc3'),
      path.join(dir, 'extracted_resources', 'resources-dlc2'),
      path.join(dir, 'extracted_resources', 'resources-dlc1'),
      path.join(dir, 'extracted_resources', 'resources'),
      path.join(dir, 'resources-dlc4'),
      path.join(dir, 'resources-dlc3'),
      path.join(dir, 'resources-dlc2'),
      path.join(dir, 'resources-dlc1'),
      path.join(dir, 'resources'),
      path.join(dir, 'resources_repentance'),
      path.join(dir, 'tools', 'ResourceExtractor', 'resources'),
      path.join(dir, 'tools', 'ResourceExtractor', 'resources-dlc3'),
      path.join(dir, 'tools', 'ResourceExtractor', 'extracted_resources', 'resources'),
      path.join(dir, 'tools', 'ResourceExtractor', 'extracted_resources', 'resources-dlc3')
    ];

    let collectibleCount = 0;
    let trinketCount = 0;
    let characterSpriteCount = 0;
    let hasAnyResources = false;

    const seenColFiles = new Set();
    const seenTrkFiles = new Set();
    const seenCharFiles = new Set();

    for (const rDir of resDirs) {
      if (await fs.pathExists(rDir)) {
        hasAnyResources = true;

        const colDir = path.join(rDir, 'gfx', 'items', 'collectibles');
        if (await fs.pathExists(colDir)) {
          try {
            const files = await fs.readdir(colDir);
            files.forEach(f => {
              if (f.toLowerCase().endsWith('.png')) seenColFiles.add(f.toLowerCase());
            });
          } catch (e) {}
        }

        const trkDir = path.join(rDir, 'gfx', 'items', 'trinkets');
        if (await fs.pathExists(trkDir)) {
          try {
            const files = await fs.readdir(trkDir);
            files.forEach(f => {
              if (f.toLowerCase().endsWith('.png')) seenTrkFiles.add(f.toLowerCase());
            });
          } catch (e) {}
        }

        const charDir = path.join(rDir, 'gfx', 'characters', 'costumes');
        if (await fs.pathExists(charDir)) {
          try {
            const files = await fs.readdir(charDir);
            files.forEach(f => {
              if (f.toLowerCase().startsWith('character_') && f.toLowerCase().endsWith('.png')) {
                seenCharFiles.add(f.toLowerCase());
              }
            });
          } catch (e) {}
        }
      }
    }

    collectibleCount = seenColFiles.size;
    trinketCount = seenTrkFiles.size;
    characterSpriteCount = seenCharFiles.size;

    const internalMods = path.join(dir, 'mods');
    const hasMods = await fs.pathExists(internalMods);
    let modCount = 0;
    if (hasMods) {
      try {
        const list = await fs.readdir(internalMods);
        modCount = list.length;
      } catch (e) {}
    }

    candidates.push({
      path: dir,
      exists: true,
      hasExe,
      hasResources: hasAnyResources,
      collectibleCount,
      trinketCount,
      characterSpriteCount,
      modsPath: hasMods ? internalMods : config.modsPath,
      modCount,
      isCurrent: dir.toLowerCase() === (config.gamePath || '').toLowerCase()
    });
  }

  return {
    activeConfig: config,
    candidates,
    bestCandidate: candidates.find(c => c.hasResources && c.collectibleCount > 0) || candidates[0] || null
  };
}

