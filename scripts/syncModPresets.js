import fs from 'fs-extra';
import path from 'path';
import { getConfig } from '../server/config.js';

async function main() {
  const config = getConfig();
  const modsDir = config.modsPath || path.join(process.cwd(), 'mods');
  const presetsPath = path.join(process.cwd(), 'server', 'data', 'preset_characters.json');
  const presets = await fs.readJson(presetsPath);

  for (const preset of presets) {
    const cleanName = preset.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const folder = path.join(modsDir, 'custom_character_' + cleanName);
    if (await fs.pathExists(folder)) {
      const studioJson = path.join(folder, 'studio_character.json');
      if (await fs.pathExists(studioJson)) {
        const cur = await fs.readJson(studioJson);
        cur.items = preset.items;
        cur.trinket = preset.trinket;
        if (preset.card !== undefined) cur.card = preset.card;
        await fs.writeJson(studioJson, cur, { spaces: 2 });
        console.log(`Updated studio_character.json for ${preset.name}`);
      }
      const playersXml = path.join(folder, 'content', 'players.xml');
      if (await fs.pathExists(playersXml)) {
        let xml = await fs.readFile(playersXml, 'utf8');
        xml = xml.replace(/items="[^"]*"/, `items="${preset.items.join(',')}"`);
        if (preset.trinket) {
          if (xml.includes('trinket="')) {
            xml = xml.replace(/trinket="[^"]*"/, `trinket="${preset.trinket}"`);
          } else {
            xml = xml.replace(/<player\s+/, `<player trinket="${preset.trinket}" `);
          }
        }
        await fs.writeFile(playersXml, xml, 'utf8');
        console.log(`Updated players.xml for ${preset.name}`);
      }
    }
  }
}

main().catch(console.error);
