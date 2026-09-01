import fs from 'fs-extra';
import path from 'path';
import xml2js from 'xml2js';
import { getConfig, DATA_DIR, DEFAULT_MOD_PATHS, DEFAULT_WORKSHOP_PATHS } from '../config.js';

export const ITEM_DLC_RANGES = {
  rebirth: { min: 1, max: 346 },
  afterbirth: { min: 347, max: 441 },
  afterbirthplus: { min: 442, max: 552 },
  repentance: { min: 553, max: 704 },
  repentanceplus: { min: 705, max: 9999 }
};

export function getDlcForItem(id) {
  if (id <= 346) return 'rebirth';
  if (id <= 441) return 'afterbirth';
  if (id <= 552) return 'afterbirthplus';
  if (id <= 704) return 'repentance';
  return 'repentanceplus';
}

export const ITEM_POOLS = [
  { id: 'treasure', label: 'Treasure Room', color: 'var(--amber-400)' },
  { id: 'shop', label: 'Shop', color: 'var(--blue-400)' },
  { id: 'boss', label: 'Boss Room', color: 'var(--red-400)' },
  { id: 'devil', label: 'Devil Room', color: 'var(--purple-400)' },
  { id: 'angel', label: 'Angel Room', color: 'var(--blue-300)' },
  { id: 'secret', label: 'Secret Room', color: 'var(--text-faint)' },
  { id: 'library', label: 'Library', color: 'var(--green-400)' },
  { id: 'planetarium', label: 'Planetarium', color: 'var(--purple-300)' },
  { id: 'curse', label: 'Curse Room', color: 'var(--red-500)' },
  { id: 'golden_chest', label: 'Golden Chest', color: 'var(--amber-300)' },
  { id: 'red_chest', label: 'Red Chest', color: 'var(--red-400)' },
  { id: 'beggar', label: 'Beggar / Coin Bum', color: 'var(--amber-200)' },
  { id: 'blood_donation', label: 'Blood Donation', color: 'var(--red-600)' },
  { id: 'shell_game', label: 'Shell Game', color: 'var(--blue-200)' },
  { id: 'crane_game', label: 'Crane Game', color: 'var(--purple-200)' },
  { id: 'ultra_secret', label: 'Ultra Secret', color: 'var(--pink-400)' },
  { id: 'pocket', label: 'Pocket Item / Active', color: 'var(--purple-400)' }
];

export const CURATED_CONSUMABLES = [
  // ─── Major Arcana Tarot Cards (0 - XXI) ───
  { id: 1, name: '0 - The Fool', desc: 'Teleports Isaac to the starting room of the floor.', type: 'card', quality: 2, pool: ['shop', 'card'] },
  { id: 2, name: 'I - The Magician', desc: 'Grants homing tears for the current room.', type: 'card', quality: 2, pool: ['shop', 'card'] },
  { id: 3, name: 'II - The High Priestess', desc: 'Mom\'s leg stomps down on the highest health enemy for 300 damage.', type: 'card', quality: 3, pool: ['shop', 'card'] },
  { id: 4, name: 'III - The Empress', desc: '+1.5 Damage and +0.3 Speed for current room.', type: 'card', quality: 2, pool: ['shop', 'card'] },
  { id: 5, name: 'IV - The Emperor', desc: 'Teleports Isaac directly into the floor Boss Room.', type: 'card', quality: 3, pool: ['shop', 'card'] },
  { id: 6, name: 'V - The Hierophant', desc: 'Spawns 2 Soul Hearts on the floor.', type: 'card', quality: 3, pool: ['shop', 'card'] },
  { id: 7, name: 'VI - The Lovers', desc: 'Spawns 2 full Red Hearts on the floor.', type: 'card', quality: 1, pool: ['shop', 'card'] },
  { id: 8, name: 'VII - The Chariot', desc: 'Grants invulnerability, contact damage, and speed for 6 seconds.', type: 'card', quality: 2, pool: ['shop', 'card'] },
  { id: 9, name: 'VIII - Justice', desc: 'Spawns 1 coin, 1 heart, 1 key, and 1 bomb.', type: 'card', quality: 2, pool: ['shop', 'card'] },
  { id: 10, name: 'IX - The Hermit', desc: 'Teleports Isaac to the Shop.', type: 'card', quality: 2, pool: ['shop', 'card'] },
  { id: 11, name: 'X - Wheel of Fortune', desc: 'Spawns a Slot Machine or Fortune Telling Machine.', type: 'card', quality: 1, pool: ['shop', 'card'] },
  { id: 12, name: 'XI - Strength', desc: '+1 Red Heart container and all stats up for current room.', type: 'card', quality: 2, pool: ['shop', 'card'] },
  { id: 13, name: 'XII - The Hanged Man', desc: 'Grants permanent flight for the current room.', type: 'card', quality: 2, pool: ['shop', 'card'] },
  { id: 14, name: 'XIII - Death', desc: 'Deals 40 damage to all enemies in the room.', type: 'card', quality: 2, pool: ['shop', 'card'] },
  { id: 15, name: 'XIV - Temperance', desc: 'Spawns a Blood Donation Machine in the room.', type: 'card', quality: 2, pool: ['shop', 'card'] },
  { id: 16, name: 'XV - The Devil', desc: '+2.0 Damage for the current room.', type: 'card', quality: 2, pool: ['shop', 'card'] },
  { id: 17, name: 'XVI - The Tower', desc: 'Spawns 6 live troll bombs across the room.', type: 'card', quality: 0, pool: ['shop', 'card'] },
  { id: 18, name: 'XVII - The Stars', desc: 'Teleports Isaac to the Treasure Room.', type: 'card', quality: 3, pool: ['shop', 'card'] },
  { id: 19, name: 'XVIII - The Moon', desc: 'Teleports Isaac to the Secret Room.', type: 'card', quality: 2, pool: ['shop', 'card'] },
  { id: 20, name: 'XIX - The Sun', desc: 'Full health restoration, deals 100 damage to all enemies, reveals map.', type: 'card', quality: 4, pool: ['shop', 'card'] },
  { id: 21, name: 'XX - Judgement', desc: 'Spawns a Beggar in the room.', type: 'card', quality: 2, pool: ['shop', 'card'] },
  { id: 22, name: 'XXI - The World', desc: 'Reveals the entire floor map layout.', type: 'card', quality: 2, pool: ['shop', 'card'] },

  // ─── Reverse Tarot Cards (Repentance) ───
  { id: 101, name: '0 - The Fool?', desc: 'Drops all held pickups and items on the floor as pedestal items.', type: 'card', quality: 3, pool: ['shop', 'card'] },
  { id: 102, name: 'I - The Magician?', desc: 'Creates a magnetic telekinetic repelling aura around Isaac.', type: 'card', quality: 2, pool: ['shop', 'card'] },
  { id: 103, name: 'II - The High Priestess?', desc: 'Mom\'s massive furious foot stomps continuously on Isaac for 60s.', type: 'card', quality: 1, pool: ['shop', 'card'] },
  { id: 104, name: 'III - The Empress?', desc: 'Grants +2 temporary Red Heart containers and all stats up for 1 minute.', type: 'card', quality: 2, pool: ['shop', 'card'] },
  { id: 105, name: 'IV - The Emperor?', desc: 'Teleports Isaac to a secondary Extra Boss Room with rewards.', type: 'card', quality: 3, pool: ['shop', 'card'] },
  { id: 106, name: 'V - The Hierophant?', desc: 'Spawns 2 Bone Hearts on the floor.', type: 'card', quality: 3, pool: ['shop', 'card'] },
  { id: 107, name: 'VI - The Lovers?', desc: 'Spawns a pedestal item from the current room pool at the cost of 1 heart container.', type: 'card', quality: 4, pool: ['shop', 'card'] },
  { id: 108, name: 'VII - The Chariot?', desc: 'Spawns a stationary invincible turret that fires tears rapidly.', type: 'card', quality: 2, pool: ['shop', 'card'] },
  { id: 109, name: 'VIII - Justice?', desc: 'Spawns 2 to 4 golden chests on the floor.', type: 'card', quality: 3, pool: ['shop', 'card'] },
  { id: 110, name: 'IX - The Hermit?', desc: 'Converts all items and pickups in the room into shop items that cost coins.', type: 'card', quality: 2, pool: ['shop', 'card'] },
  { id: 111, name: 'X - Wheel of Fortune?', desc: 'Spawns 5 random dice machines or restock boxes in the room.', type: 'card', quality: 3, pool: ['shop', 'card'] },
  { id: 112, name: 'XI - Strength?', desc: 'Slows down all enemies and projectile shots in the room by 50%.', type: 'card', quality: 2, pool: ['shop', 'card'] },
  { id: 113, name: 'XII - The Hanged Man?', desc: 'Increases Isaac\'s luck by +100 and greatly boosts coin drop rates.', type: 'card', quality: 3, pool: ['shop', 'card'] },
  { id: 114, name: 'XIII - Death?', desc: 'Spawns a friendly ghost familiar that copies Isaac\'s tears.', type: 'card', quality: 3, pool: ['shop', 'card'] },
  { id: 115, name: 'XIV - Temperance?', desc: 'Isaac eats 5 random pills in rapid succession.', type: 'card', quality: 1, pool: ['shop', 'card'] },
  { id: 116, name: 'XV - The Devil?', desc: 'Grants an immortal Satan familiar that slashes enemies for 30s.', type: 'card', quality: 3, pool: ['shop', 'card'] },
  { id: 117, name: 'XVI - The Tower?', desc: 'Spawns 6 golden/tinted rocks across the room.', type: 'card', quality: 3, pool: ['shop', 'card'] },
  { id: 118, name: 'XVII - The Stars?', desc: 'Removes the first item in your inventory and spawns 2 random pedestal items.', type: 'card', quality: 4, pool: ['shop', 'card'] },
  { id: 119, name: 'XVIII - The Moon?', desc: 'Teleports Isaac directly into the Ultra Secret Room.', type: 'card', quality: 4, pool: ['shop', 'card'] },
  { id: 120, name: 'XIX - The Sun?', desc: 'Grants flight and a devastating darkness aura that melts enemies.', type: 'card', quality: 4, pool: ['shop', 'card'] },
  { id: 121, name: 'XX - Judgement?', desc: 'Spawns a Restock Machine in the room.', type: 'card', quality: 3, pool: ['shop', 'card'] },
  { id: 122, name: 'XXI - The World?', desc: 'Spawns a red room trapdoor leading to an I AM ERROR room or crawlspace.', type: 'card', quality: 3, pool: ['shop', 'card'] },

  // ─── Special Playing & Tarot Cards ───
  { id: 31, name: 'Chaos Card', desc: 'Instantly kills any enemy or boss it is thrown at.', type: 'card', quality: 4, pool: ['shop', 'card'] },
  { id: 32, name: 'Credit Card', desc: 'Converts all items and pickups in shop/devil room into free items.', type: 'card', quality: 4, pool: ['shop', 'card'] },
  { id: 33, name: 'Rules Card', desc: 'Displays cryptic game advice hint.', type: 'card', quality: 0, pool: ['shop', 'card'] },
  { id: 34, name: 'Card Against Humanity', desc: 'Fills the entire room with poops.', type: 'card', quality: 2, pool: ['shop', 'card'] },
  { id: 35, name: 'Suicide King', desc: 'Kills Isaac and spawns 10 pickups and pedestal items.', type: 'card', quality: 1, pool: ['shop', 'card'] },
  { id: 36, name: 'Get Out of Jail Free Card', desc: 'Opens all locked doors in room (including Mega Satan door).', type: 'card', quality: 3, pool: ['shop', 'card'] },
  { id: 37, name: '? Card', desc: 'Triggers the effect of your active item without consuming charges.', type: 'card', quality: 3, pool: ['shop', 'card'] },
  { id: 38, name: 'Dice Shard', desc: 'Triggers both D6 and D20 rerolls in the current room.', type: 'card', quality: 3, pool: ['shop', 'card'] },
  { id: 39, name: 'Emergency Contact', desc: 'Mom\'s hands grab 2 enemies and pin them to the ground.', type: 'card', quality: 2, pool: ['shop', 'card'] },
  { id: 40, name: 'Holy Card', desc: 'Grants a Holy Mantle protective shield for the current room/run.', type: 'card', quality: 3, pool: ['shop', 'card'] },
  { id: 41, name: 'Huge Growth', desc: '+7 Flat Damage, +5 Range, size up, and crush rocks on walk.', type: 'card', quality: 3, pool: ['shop', 'card'] },
  { id: 42, name: 'Ancient Recall', desc: 'Spawns 3 random cards on use.', type: 'card', quality: 3, pool: ['shop', 'card'] },
  { id: 43, name: 'Era Walk', desc: 'Slows down enemies and enemy bullets for the room.', type: 'card', quality: 2, pool: ['shop', 'card'] },
  { id: 44, name: 'Wild Card', desc: 'Duplicates the effect of the most recently used card, pill, rune, or active item.', type: 'card', quality: 4, pool: ['shop', 'card'] },
  { id: 45, name: 'Queen of Hearts', desc: 'Fills the room with half and full red heart pickups.', type: 'card', quality: 2, pool: ['shop', 'card'] },
  { id: 46, name: 'Joker', desc: 'Teleports Isaac directly into the Devil or Angel Room.', type: 'card', quality: 4, pool: ['shop', 'card'] },

  // ─── Runes & Soul Stones ───
  { id: 23, name: 'Rune of Hagalaz', desc: 'Destroys all breakable rocks and obstacles in the current room.', type: 'rune', quality: 1, pool: ['shop', 'rune'] },
  { id: 24, name: 'Rune of Jera', desc: 'Duplicates all pickups and unopened chests in the room.', type: 'rune', quality: 4, pool: ['shop', 'rune'] },
  { id: 25, name: 'Rune of Ehwaz', desc: 'Spawns a trapdoor leading to next floor or Crawlspace.', type: 'rune', quality: 2, pool: ['shop', 'rune'] },
  { id: 26, name: 'Rune of Dagaz', desc: 'Removes floor curse and grants +1 Soul Heart.', type: 'rune', quality: 3, pool: ['shop', 'rune'] },
  { id: 27, name: 'Rune of Ansuz', desc: 'Reveals the entire floor map layout and all secret rooms.', type: 'rune', quality: 2, pool: ['shop', 'rune'] },
  { id: 28, name: 'Rune of Perthro', desc: 'Rerolls all pedestal items in current room (D6 effect).', type: 'rune', quality: 4, pool: ['shop', 'rune'] },
  { id: 29, name: 'Rune of Berkano', desc: 'Spawns 3 friendly blue spiders and 3 blue flies.', type: 'rune', quality: 1, pool: ['shop', 'rune'] },
  { id: 30, name: 'Rune of Algiz', desc: 'Grants 20 seconds of complete invulnerability shield.', type: 'rune', quality: 4, pool: ['shop', 'rune'] },
  { id: 47, name: 'Blank Rune', desc: 'Triggers a random rune effect with 25% chance to duplicate itself.', type: 'rune', quality: 3, pool: ['shop', 'rune'] },
  { id: 48, name: 'Black Rune', desc: 'Deals 100 room damage and consumes pedestals for stat buffs.', type: 'rune', quality: 3, pool: ['shop', 'rune'] },
  { id: 49, name: 'Soul of Isaac', desc: 'Rerolls current pedestal items every 1 second in place.', type: 'rune', quality: 4, pool: ['secret', 'rune'] },
  { id: 50, name: 'Soul of Magdalene', desc: 'Spawns 2 temporary heart drops on killing enemies.', type: 'rune', quality: 2, pool: ['secret', 'rune'] },
  { id: 51, name: 'Soul of Cain', desc: 'Opens all doors and spawns a Red Room door.', type: 'rune', quality: 4, pool: ['secret', 'rune'] },
  { id: 52, name: 'Soul of Judas', desc: 'Enters Shadow form with massive damage and slicing attack.', type: 'rune', quality: 3, pool: ['secret', 'rune'] },
  { id: 53, name: 'Soul of ???', desc: 'Throws an explosive poop that detonates.', type: 'rune', quality: 2, pool: ['secret', 'rune'] },
  { id: 54, name: 'Soul of Eve', desc: 'Spawns 14 blue bird attack familiars.', type: 'rune', quality: 2, pool: ['secret', 'rune'] },
  { id: 55, name: 'Soul of Samson', desc: 'Enters berserk rage mode with melee jawbone.', type: 'rune', quality: 3, pool: ['secret', 'rune'] },
  { id: 56, name: 'Soul of Azazel', desc: 'Fires an immense full-screen Mega Brimstone beam.', type: 'rune', quality: 4, pool: ['secret', 'rune'] },
  { id: 57, name: 'Soul of Lazarus', desc: 'Extra life: revives on the spot with temporary invincibility.', type: 'rune', quality: 3, pool: ['secret', 'rune'] },
  { id: 58, name: 'Soul of Eden', desc: 'Rerolls all pedestal items and pickups in room.', type: 'rune', quality: 3, pool: ['secret', 'rune'] },
  { id: 59, name: 'Soul of The Lost', desc: 'Grants ghost form with flight and spectral tears for room.', type: 'rune', quality: 3, pool: ['secret', 'rune'] },
  { id: 60, name: 'Soul of Lilith', desc: 'Spawns a permanent random familiar for the remainder of the run.', type: 'rune', quality: 4, pool: ['secret', 'rune'] },
  { id: 61, name: 'Soul of The Keeper', desc: 'Spawns 4 to 8 random coin pickups.', type: 'rune', quality: 2, pool: ['secret', 'rune'] },
  { id: 62, name: 'Soul of Apollyon', desc: 'Spawns 4 to 8 red attack locusts.', type: 'rune', quality: 2, pool: ['secret', 'rune'] },
  { id: 63, name: 'Soul of The Forgotten', desc: 'Spawns a skeleton turret familiar that copies Isaac\'s tears.', type: 'rune', quality: 3, pool: ['secret', 'rune'] },
  { id: 64, name: 'Soul of Bethany', desc: 'Spawns 6 item wisps orbiting Isaac.', type: 'rune', quality: 3, pool: ['secret', 'rune'] },
  { id: 65, name: 'Soul of Jacob & Esau', desc: 'Spawns an Esau ghost familiar copying tear attacks.', type: 'rune', quality: 3, pool: ['secret', 'rune'] },

  // ─── Authentic In-Game Pills ───
  { id: 201, name: 'Bad Trip', desc: 'Deals 1 heart of damage (or Full Health if at 1/2 heart or lower).', type: 'pill', quality: 0, pool: ['shop', 'pill'] },
  { id: 202, name: 'Balls of Steel', desc: 'Grants +2 Soul Hearts instantly.', type: 'pill', quality: 3, pool: ['shop', 'pill'] },
  { id: 203, name: 'Full Health', desc: 'Fully restores all Red Heart containers.', type: 'pill', quality: 3, pool: ['shop', 'pill'] },
  { id: 204, name: 'Health Up', desc: 'Grants +1 Red Heart Container.', type: 'pill', quality: 3, pool: ['shop', 'pill'] },
  { id: 205, name: 'Tears Up', desc: 'Permanent +0.35 Tears fire rate increase.', type: 'pill', quality: 3, pool: ['shop', 'pill'] },
  { id: 206, name: 'Speed Up', desc: 'Permanent +0.15 Movement Speed increase.', type: 'pill', quality: 2, pool: ['shop', 'pill'] },
  { id: 207, name: 'Range Up', desc: 'Permanent +1.5 Tear Range increase.', type: 'pill', quality: 2, pool: ['shop', 'pill'] },
  { id: 208, name: 'Luck Up', desc: 'Permanent +1.0 Luck increase.', type: 'pill', quality: 3, pool: ['shop', 'pill'] },
  { id: 209, name: 'Power Pill!', desc: 'Grants Gamekid invulnerability and contact damage for 6 seconds.', type: 'pill', quality: 2, pool: ['shop', 'pill'] },
  { id: 210, name: '48 Hour Energy', desc: 'Drops 2 battery pickups and instantly recharges held active item.', type: 'pill', quality: 3, pool: ['shop', 'pill'] },
  { id: 211, name: 'I\'m Drowsy...', desc: 'Slows down all enemies and projectile shots in the room.', type: 'pill', quality: 3, pool: ['shop', 'pill'] },
  { id: 212, name: 'I\'m Excited!!!', desc: 'Speeds up enemies for 30 seconds, then triggers extreme haste.', type: 'pill', quality: 1, pool: ['shop', 'pill'] },
  { id: 213, name: 'Telepills', desc: 'Teleports Isaac to a random room on the floor.', type: 'pill', quality: 2, pool: ['shop', 'pill'] },
  { id: 214, name: 'Hematemesis', desc: 'Reduces health to 1 Red Heart and spawns 1 to 4 full hearts on the ground.', type: 'pill', quality: 1, pool: ['shop', 'pill'] },
  { id: 215, name: 'Pheromones', desc: 'Charms all enemies in the room for a few seconds.', type: 'pill', quality: 2, pool: ['shop', 'pill'] },
  { id: 216, name: 'Explosive Diarrhea', desc: 'Spawns 5 live troll bombs behind Isaac as you walk.', type: 'pill', quality: 1, pool: ['shop', 'pill'] },
  { id: 217, name: 'Pretty Fly', desc: 'Spawns 1 permanent orbital fly familiar that blocks bullets (up to 3).', type: 'pill', quality: 3, pool: ['shop', 'pill'] },
  { id: 218, name: 'RUA Wizard?', desc: 'Isaac fires diagonal tears in both directions for 30 seconds.', type: 'pill', quality: 1, pool: ['shop', 'pill'] },
  { id: 219, name: 'Percs!', desc: 'Reduces all damage taken to 1/2 heart for the current room.', type: 'pill', quality: 3, pool: ['shop', 'pill'] },
  { id: 220, name: 'Addicted!', desc: 'Increases all damage taken to 1 full heart for the current room.', type: 'pill', quality: 0, pool: ['shop', 'pill'] }
];

export const CURATED_TRINKETS = [
  { id: 1, name: 'Swallowed Penny', desc: 'Drops 1 penny on taking damage (infinite coin engine)', type: 'trinket', quality: 3, pool: ['shop', 'shell_game'], dlc: 'rebirth', gfx: 'trinket_001_swallowedpenny.png' },
  { id: 2, name: 'Petrified Poop', desc: '50% chance for destroyed poops to drop coins, hearts, bombs, or keys', type: 'trinket', quality: 2, pool: ['shop'], dlc: 'rebirth', gfx: 'trinket_002_petrifiedpoop.png' },
  { id: 3, name: 'AAA Battery', desc: 'Reduces active item charge cost by 1 room charge when fully charged', type: 'trinket', quality: 3, pool: ['shop', 'battery'], dlc: 'rebirth', gfx: 'trinket_003_aaabattery.png' },
  { id: 4, name: 'Broken Remote', desc: 'Teleports Isaac to a random room upon using any active item', type: 'trinket', quality: 2, pool: ['shop'], dlc: 'rebirth', gfx: 'trinket_004_brokenremote.png' },
  { id: 5, name: 'Purple Heart', desc: 'Increases champion monster and boss spawn rate for higher pickup drops', type: 'trinket', quality: 2, pool: ['shop'], dlc: 'rebirth', gfx: 'trinket_005_purpleheart.png' },
  { id: 6, name: 'Broken Magnet', desc: 'Magnetically attracts coins towards Isaac across the entire room', type: 'trinket', quality: 1, pool: ['shop'], dlc: 'rebirth', gfx: 'trinket_006_brokenmagnet.png' },
  { id: 7, name: 'Rosary Bead', desc: 'Increases Angel Room appearance rate and boosts Bible item frequency', type: 'trinket', quality: 2, pool: ['angel', 'shop'], dlc: 'rebirth', gfx: 'trinket_007_rosarybead.png' },
  { id: 8, name: 'Cartridge', desc: 'Triggers Gamekid invulnerability & contact bite damage at 1/2 heart', type: 'trinket', quality: 1, pool: ['shop'], dlc: 'rebirth', gfx: 'trinket_008_cartridge.png' },
  { id: 9, name: 'Pulse Worm', desc: 'Tears pulse in size, alternating between higher and lower damage', type: 'trinket', quality: 2, pool: ['treasure'], dlc: 'rebirth', gfx: 'trinket_009_pulseworm.png' },
  { id: 10, name: 'Wiggle Worm', desc: 'Tears travel in wave patterns with a permanent +0.3 Tears fire rate up', type: 'trinket', quality: 2, pool: ['treasure'], dlc: 'rebirth', gfx: 'trinket_010_wiggleworm.png' },
  { id: 11, name: 'Ring Worm', desc: 'Tears travel in wide rapid spirals, covering large room areas', type: 'trinket', quality: 1, pool: ['treasure'], dlc: 'rebirth', gfx: 'trinket_011_ringworm.png' },
  { id: 12, name: 'Flat Worm', desc: 'Tears become large flat discs with extreme knockback and wider hitbox', type: 'trinket', quality: 2, pool: ['treasure'], dlc: 'rebirth', gfx: 'trinket_012_flatworm.png' },
  { id: 13, name: 'Hook Worm', desc: 'Tears travel in sharp 90-degree zig-zags with +1.5 Range', type: 'trinket', quality: 1, pool: ['treasure'], dlc: 'rebirth', gfx: 'trinket_013_hookworm.png' },
  { id: 14, name: 'Callus', desc: 'Grants complete immunity to floor creep, floor spikes, and curse room doors', type: 'trinket', quality: 3, pool: ['shop', 'treasure'], dlc: 'rebirth', gfx: 'trinket_014_callus.png' },
  { id: 15, name: 'Lucky Rock', desc: 'Every destroyed rock drops a penny pickup', type: 'trinket', quality: 3, pool: ['shop', 'treasure'], dlc: 'rebirth', gfx: 'trinket_015_luckyrock.png' },
  { id: 16, name: 'Mom\'s Toenail', desc: 'Mom\'s foot randomly stomps down every 60 seconds dealing 300 damage', type: 'trinket', quality: 0, pool: ['shop'], dlc: 'rebirth', gfx: 'trinket_016_momstoenail.png' },
  { id: 17, name: 'Black Lipstick', desc: 'Increases Black Heart drop chance and boosts Evil stat', type: 'trinket', quality: 2, pool: ['devil', 'shop'], dlc: 'rebirth', gfx: 'trinket_017_blacklipstick.png' },
  { id: 18, name: 'Bible Tract', desc: 'Increases Angel Room chance and converts half-heart drops into Eternal Hearts', type: 'trinket', quality: 2, pool: ['angel', 'shop'], dlc: 'rebirth', gfx: 'trinket_018_bibletract.png' },
  { id: 19, name: 'Paper Clip', desc: 'Opens all locked doors, golden chests, and lock blocks for free without keys', type: 'trinket', quality: 3, pool: ['shop', 'golden_chest'], dlc: 'rebirth', gfx: 'trinket_019_paperclip.png' },
  { id: 20, name: 'Monkey Paw', desc: 'Drops a Black Heart when reduced to 1/2 Red Heart (triggers up to 3 times)', type: 'trinket', quality: 2, pool: ['shop', 'devil'], dlc: 'rebirth', gfx: 'trinket_020_monkeypaw.png' },
  { id: 21, name: 'Mysterious Paper', desc: 'Mimics the passive effect of The Polaroid, The Negative, or Missing Poster randomly', type: 'trinket', quality: 2, pool: ['shop'], dlc: 'rebirth', gfx: 'trinket_021_mysteriouspaper.png' },
  { id: 22, name: 'Daemon\'s Tail', desc: 'Converts all heart drops into Black Hearts or keys', type: 'trinket', quality: 3, pool: ['devil', 'shop'], dlc: 'rebirth', gfx: 'trinket_022_daemonstail.png' },
  { id: 23, name: 'Missing Poster', desc: 'Revives Isaac as The Lost upon dying in a Sacrifice Room', type: 'trinket', quality: 2, pool: ['shop'], dlc: 'rebirth', gfx: 'trinket_023_missingposter.png' },
  { id: 24, name: 'Butt Penny', desc: 'Isaac farts and pushes away enemies whenever collecting a coin', type: 'trinket', quality: 1, pool: ['shop'], dlc: 'rebirth', gfx: 'trinket_024_buttpenny.png' },
  { id: 25, name: 'Mysterious Candy', desc: 'Isaac poops or farts periodically while in combat', type: 'trinket', quality: 1, pool: ['shop'], dlc: 'rebirth', gfx: 'trinket_025_mysteriouscandy.png' },
  { id: 26, name: 'Hook Worm', desc: 'Tears travel in sharp 90-degree zig-zags with +1.5 Range', type: 'trinket', quality: 1, pool: ['treasure'], dlc: 'rebirth', gfx: 'trinket_026_hookworm.png' },
  { id: 27, name: 'Whip Worm', desc: '+0.5 Shot Speed up for faster projectile flight', type: 'trinket', quality: 2, pool: ['treasure'], dlc: 'rebirth', gfx: 'trinket_027_whipworm.png' },
  { id: 28, name: 'Broken Ankh', desc: 'Chance to revive as ??? (Blue Baby) upon death', type: 'trinket', quality: 2, pool: ['shop'], dlc: 'rebirth', gfx: 'trinket_028_brokenankh.png' },
  { id: 29, name: 'Fish Head', desc: 'Spawns 1 friendly blue attack fly whenever Isaac takes damage', type: 'trinket', quality: 3, pool: ['shop'], dlc: 'rebirth', gfx: 'trinket_029_fishhead.png' },
  { id: 30, name: 'Pinky Eye', desc: 'Chance to shoot poison tears dealing 2x damage over time', type: 'trinket', quality: 2, pool: ['treasure'], dlc: 'rebirth', gfx: 'trinket_030_pinkyeye.png' },
  { id: 31, name: 'Push Pin', desc: 'Chance to shoot piercing spectral push-pin tears', type: 'trinket', quality: 2, pool: ['treasure'], dlc: 'rebirth', gfx: 'trinket_031_pushpin.png' },
  { id: 32, name: 'Liberty Cap', desc: 'Chance to trigger a random mushroom effect on room enter', type: 'trinket', quality: 2, pool: ['shop'], dlc: 'rebirth', gfx: 'trinket_032_libertycap.png' },
  { id: 33, name: 'Umbilical Cord', desc: 'Spawns a Little Steve familiar when reduced to 1/2 Red Heart', type: 'trinket', quality: 1, pool: ['shop'], dlc: 'rebirth', gfx: 'trinket_033_umbilicalcord.png' },
  { id: 34, name: 'Child\'s Heart', desc: 'Increases heart drop rates from room clears', type: 'trinket', quality: 2, pool: ['shop'], dlc: 'rebirth', gfx: 'trinket_034_childsheart.png' },
  { id: 35, name: 'Curved Horn', desc: '+2.0 Flat Damage up to all tear attacks', type: 'trinket', quality: 4, pool: ['shop', 'treasure'], dlc: 'rebirth', gfx: 'trinket_035_curvedhorn.png' },
  { id: 36, name: 'Rusted Key', desc: 'Increases key and locked golden chest drop rates', type: 'trinket', quality: 2, pool: ['shop'], dlc: 'rebirth', gfx: 'trinket_036_rustedkey.png' },
  { id: 37, name: 'Goat Hoof', desc: '+0.15 Movement Speed up while held', type: 'trinket', quality: 2, pool: ['devil', 'shop'], dlc: 'rebirth', gfx: 'trinket_037_goathoof.png' },
  { id: 38, name: 'Mom\'s Pearl', desc: 'Increases Soul Heart drop rates and turns half hearts to soul hearts', type: 'trinket', quality: 3, pool: ['shop', 'angel'], dlc: 'rebirth', gfx: 'trinket_038_momspearl.png' },
  { id: 39, name: 'Cancer', desc: '-2 Tear Delay (breaks fire rate cap for massive attack speed)', type: 'trinket', quality: 4, pool: ['treasure', 'shop'], dlc: 'rebirth', gfx: 'trinket_039_cancer.png' },
  { id: 40, name: 'Red Patch', desc: 'Chance to gain a temporary +1.8 Damage boost on hit', type: 'trinket', quality: 2, pool: ['shop'], dlc: 'rebirth', gfx: 'trinket_040_redpatch.png' },
  { id: 41, name: 'Match Stick', desc: 'Increases bomb drop rates and converts troll bombs to normal bombs', type: 'trinket', quality: 2, pool: ['shop'], dlc: 'rebirth', gfx: 'trinket_041_matchstick.png' },
  { id: 42, name: 'Lucky Toe', desc: '+1 Luck and increases room drop rates', type: 'trinket', quality: 2, pool: ['shop'], dlc: 'rebirth', gfx: 'trinket_042_luckytoe.png' },
  { id: 43, name: 'Cursed Skull', desc: 'Teleports Isaac to the previous room when taking damage at 1/2 heart', type: 'trinket', quality: 0, pool: ['shop', 'curse'], dlc: 'rebirth', gfx: 'trinket_043_cursedskull.png' },
  { id: 44, name: 'Safety Cap', desc: 'Increases pill drop rates from room clears', type: 'trinket', quality: 2, pool: ['shop'], dlc: 'rebirth', gfx: 'trinket_044_safetycap.png' },
  { id: 45, name: 'Ace of Spades', desc: 'Increases Tarot Card and Rune drop rates', type: 'trinket', quality: 2, pool: ['shop'], dlc: 'rebirth', gfx: 'trinket_045_aceofspades.png' },
  { id: 46, name: 'Isaacs Fork', desc: 'Chance to heal 1/2 Red Heart upon clearing any hostile room', type: 'trinket', quality: 2, pool: ['shop'], dlc: 'rebirth', gfx: 'trinket_046_isaacsfork.png' },
  { id: 47, name: 'A Missing Page', desc: 'Deals 40 room damage to all enemies when at 1/2 heart', type: 'trinket', quality: 1, pool: ['devil', 'shop'], dlc: 'rebirth', gfx: 'trinket_047_amissingpage.png' },
  { id: 48, name: 'Bloody Penny', desc: '50% chance to drop a half red heart when picking up a coin', type: 'trinket', quality: 2, pool: ['shop'], dlc: 'rebirth', gfx: 'trinket_048_bloodypenny.png' },
  { id: 50, name: 'Burnt Penny', desc: '50% chance to drop a bomb pickup when picking up a coin', type: 'trinket', quality: 3, pool: ['shop'], dlc: 'rebirth', gfx: 'trinket_050_burntpenny.png' },
  { id: 51, name: 'Flat Penny', desc: '50% chance to drop a key pickup when picking up a coin', type: 'trinket', quality: 3, pool: ['shop'], dlc: 'rebirth', gfx: 'trinket_051_flatpenny.png' },
  { id: 52, name: 'Counterfeit Penny', desc: '50% chance for any coin collected to be worth +1 additional cent', type: 'trinket', quality: 3, pool: ['shop', 'shell_game'], dlc: 'rebirth', gfx: 'trinket_052_counterfeitpenny.png' },
  { id: 53, name: 'Tick', desc: 'Drains 15% HP of bosses with >60 HP and heals 1 Red Heart (cannot be dropped)', type: 'trinket', quality: 2, pool: ['shop'], dlc: 'rebirth', gfx: 'trinket_053_tick.png' },
  { id: 54, name: 'Isaac\'s Head', desc: 'Isaac familiar that shoots tears alongside you', type: 'trinket', quality: 2, pool: ['shop'], dlc: 'rebirth', gfx: 'trinket_054_isaacshead.png' },
  { id: 55, name: 'Maggy\'s Faith', desc: 'Grants +1 Eternal Heart at the start of every new floor', type: 'trinket', quality: 2, pool: ['angel', 'shop'], dlc: 'rebirth', gfx: 'trinket_055_maggysfaith.png' },
  { id: 56, name: 'Judas\' Tongue', desc: 'Reduces Devil Deal heart prices (2-heart deals cost 1 heart)', type: 'trinket', quality: 3, pool: ['devil', 'shop'], dlc: 'rebirth', gfx: 'trinket_056_judastongue.png' },
  { id: 57, name: '??\'s Soul', desc: 'Familiar fly bounces across screen copying Isaac\'s tear shots', type: 'trinket', quality: 1, pool: ['shop'], dlc: 'rebirth', gfx: 'trinket_057_qmarkssoul.png' },
  { id: 58, name: 'Samson\'s Lock', desc: '1/15 chance to gain +0.5 Damage up upon killing an enemy', type: 'trinket', quality: 2, pool: ['shop'], dlc: 'rebirth', gfx: 'trinket_058_samsonslock.png' },
  { id: 59, name: 'Cain\'s Eye', desc: '25% chance to reveal the entire map layout at start of each floor', type: 'trinket', quality: 2, pool: ['shop'], dlc: 'rebirth', gfx: 'trinket_059_cainseye.png' },
  { id: 60, name: 'Eve\'s Bird Foot', desc: '5% chance to spawn a Dead Bird familiar upon killing an enemy', type: 'trinket', quality: 1, pool: ['shop'], dlc: 'rebirth', gfx: 'trinket_060_evesbirdfoot.png' },
  { id: 61, name: 'The Left Hand', desc: 'Converts all chests into Red Chests containing devil rewards', type: 'trinket', quality: 3, pool: ['devil', 'shop'], dlc: 'rebirth', gfx: 'trinket_061_thelefthand.png' },
  { id: 62, name: 'Shiny Rock', desc: 'Flashing light reveals tinted rocks and crawlspace rocks', type: 'trinket', quality: 2, pool: ['shop'], dlc: 'afterbirth', gfx: 'trinket_062_ShinyRock.png' },
  { id: 63, name: 'Safety Scissors', desc: 'Instantly converts all live troll bombs into collectible bomb pickups', type: 'trinket', quality: 4, pool: ['shop'], dlc: 'afterbirth', gfx: 'trinket_063_SafetyScissors.png' },
  { id: 64, name: 'Rainbow Worm', desc: 'Rotates through all worm trinket tear modifiers every 3 seconds', type: 'trinket', quality: 2, pool: ['treasure'], dlc: 'afterbirth', gfx: 'trinket_064_RainbowWorm.png' },
  { id: 65, name: 'Tape Worm', desc: 'Doubles Isaac\'s tear range (+100% Range) with high shot speed', type: 'trinket', quality: 2, pool: ['treasure'], dlc: 'afterbirth', gfx: 'trinket_065_TapeWorm.png' },
  { id: 66, name: 'Lazy Worm', desc: '-0.4 Shot Speed & +4.0 Range (tears linger longer dealing damage)', type: 'trinket', quality: 2, pool: ['treasure'], dlc: 'afterbirth', gfx: 'trinket_066_LazyWorm.png' },
  { id: 67, name: 'Cracked Dice', desc: 'Taking damage triggers a random D6, D20, D8, or D10 reroll effect', type: 'trinket', quality: 3, pool: ['shop'], dlc: 'afterbirth', gfx: 'trinket_067_CrackedDice.png' },
  { id: 68, name: 'Super Magnet', desc: 'Pulls all enemies and pickups towards Isaac across the room', type: 'trinket', quality: 1, pool: ['shop'], dlc: 'afterbirth', gfx: 'trinket_068_SuperMagnet.png' },
  { id: 69, name: 'Faded Polaroid', desc: 'Periodically grants brief invisibility, confusing enemies', type: 'trinket', quality: 2, pool: ['shop'], dlc: 'afterbirth', gfx: 'trinket_069_FadedPolaroid.png' },
  { id: 70, name: 'Louse', desc: 'Chance to spawn a friendly blue attack spider during combat', type: 'trinket', quality: 2, pool: ['shop'], dlc: 'afterbirth', gfx: 'trinket_070_Louse.png' },
  { id: 71, name: 'Bob\'s Bladder', desc: 'Bombs leave a pool of toxic green creep that damages enemies', type: 'trinket', quality: 2, pool: ['treasure'], dlc: 'afterbirth', gfx: 'trinket_071_BobsBladder.png' },
  { id: 72, name: 'Watch Battery', desc: 'Increases battery drop rate and chance to add +1 charge to active item on room clear', type: 'trinket', quality: 3, pool: ['shop', 'battery'], dlc: 'afterbirth', gfx: 'trinket_072_WatchBattery.png' },
  { id: 73, name: 'Blasting Cap', desc: 'Exploding bombs have a 25% chance to drop another bomb pickup', type: 'trinket', quality: 2, pool: ['treasure'], dlc: 'afterbirth', gfx: 'trinket_073_BlastingCap.png' },
  { id: 74, name: 'Stud Finder', desc: 'Increases the spawn rate of crawlspaces beneath destroyed rocks', type: 'trinket', quality: 2, pool: ['shop'], dlc: 'afterbirth', gfx: 'trinket_074_StudFinder.png' },
  { id: 75, name: 'Error', desc: 'Randomizes your held trinket effect in every single room', type: 'trinket', quality: 2, pool: ['shop'], dlc: 'afterbirth', gfx: 'trinket_075_Error.png' },
  { id: 76, name: 'Poker Chip', desc: 'Cheats open chests for double rewards (or occasional flies)', type: 'trinket', quality: 2, pool: ['shop', 'shell_game'], dlc: 'afterbirth', gfx: 'trinket_076_PokerChip.png' },
  { id: 77, name: 'Blister', desc: 'Increases tear knockback push force significantly', type: 'trinket', quality: 1, pool: ['treasure'], dlc: 'afterbirth', gfx: 'trinket_077_Blister.png' },
  { id: 78, name: 'Second Hand', desc: 'Doubles the duration of poison, burn, and freeze status effects', type: 'trinket', quality: 2, pool: ['shop'], dlc: 'afterbirth', gfx: 'trinket_078_SecondHand.png' },
  { id: 79, name: 'Endless Nameless', desc: '25% chance for used pills, cards, and runes to spawn a copy of themselves', type: 'trinket', quality: 3, pool: ['shop'], dlc: 'afterbirth', gfx: 'trinket_079_EndlessNameless.png' },
  { id: 80, name: 'Black Feather', desc: '+0.2 Damage up for each evil/devil item held in inventory', type: 'trinket', quality: 2, pool: ['devil', 'shop'], dlc: 'afterbirth', gfx: 'trinket_080_BlackFeather.png' },
  { id: 81, name: 'Blind Rage', desc: 'Doubles the duration of invincibility i-frames after taking damage', type: 'trinket', quality: 3, pool: ['shop'], dlc: 'afterbirth', gfx: 'trinket_081_blindrage.png' },
  { id: 82, name: 'Golden Horse Shoe', desc: 'Increases chance for treasure rooms to spawn 2 item pedestals', type: 'trinket', quality: 2, pool: ['shop'], dlc: 'afterbirth', gfx: 'trinket_082_goldenhorseshoe.png' },
  { id: 83, name: 'Store Key', desc: 'Permanently opens all Shop doors for free without consuming keys', type: 'trinket', quality: 3, pool: ['shop'], dlc: 'afterbirth', gfx: 'trinket_082_storekey.png' },
  { id: 84, name: 'Rib of Greed', desc: 'Prevents Greed and Super Greed from spawning in shops and secret rooms', type: 'trinket', quality: 2, pool: ['shop'], dlc: 'afterbirth', gfx: 'trinket_083_ribofgreed.png' },
  { id: 85, name: 'Karma', desc: 'Using a donation machine heals 1 Red Heart or drops a coin', type: 'trinket', quality: 2, pool: ['shop'], dlc: 'afterbirth', gfx: 'trinket_084_karma.png' },
  { id: 86, name: 'Lil Larva', desc: 'Destroying any poop spawns a friendly blue attack fly', type: 'trinket', quality: 2, pool: ['shop'], dlc: 'afterbirth', gfx: 'trinket_085_lillarva.png' },
  { id: 87, name: 'Mom\'s Locket', desc: 'Using keys heals 1/2 Red Heart and converts half red hearts to full hearts', type: 'trinket', quality: 2, pool: ['shop'], dlc: 'afterbirth', gfx: 'trinket_086_momslocket.png' },
  { id: 88, name: 'NO!', desc: 'Prevents active items from generating in treasure rooms and shops', type: 'trinket', quality: 4, pool: ['shop'], dlc: 'afterbirth', gfx: 'trinket_087_no.png' },
  { id: 89, name: 'Child Leash', desc: 'Keeps all familiars and orbitals closely tethered to Isaac', type: 'trinket', quality: 2, pool: ['shop'], dlc: 'afterbirth', gfx: 'trinket_088_childleash.png' },
  { id: 90, name: 'Brown Cap', desc: 'Destroying poops causes an explosion dealing 40 damage', type: 'trinket', quality: 1, pool: ['shop'], dlc: 'afterbirth', gfx: 'trinket_089_browncap.png' },
  { id: 91, name: 'Meconium', desc: 'Poops have a chance to spawn as black poops that deal damage on destruction', type: 'trinket', quality: 2, pool: ['shop'], dlc: 'afterbirth', gfx: 'trinket_090_meconium.png' },
  { id: 92, name: 'Cracked Crown', desc: 'Stat booster (+20% stat multiplier bonus to all base stat upgrades)', type: 'trinket', quality: 4, pool: ['shop', 'treasure'], dlc: 'afterbirthplus', gfx: 'trinket_092_crackedcrown.png' },
  { id: 93, name: 'Used Diaper', desc: 'Grants Skatole fly friendliness aura in random rooms', type: 'trinket', quality: 1, pool: ['shop'], dlc: 'afterbirthplus', gfx: 'trinket_093_useddiaper.png' },
  { id: 94, name: 'Fish Tail', desc: 'Doubles all blue flies and blue spiders spawned by any item or effect', type: 'trinket', quality: 3, pool: ['shop', 'treasure'], dlc: 'afterbirthplus', gfx: 'trinket_094_fishtail.png' },
  { id: 95, name: 'Black Tooth', desc: 'Chance to shoot toxic piercing bone teeth dealing 3x damage', type: 'trinket', quality: 3, pool: ['treasure'], dlc: 'afterbirthplus', gfx: 'trinket_095_blacktooth.png' },
  { id: 96, name: 'Ouroboros Worm', desc: 'Tears travel in large spiraling rings with +Tears and spectral piercing', type: 'trinket', quality: 2, pool: ['treasure'], dlc: 'afterbirthplus', gfx: 'trinket_096_ouroborosworm.png' },
  { id: 97, name: 'Tonsil', desc: 'Taking damage spawns a protective Tonsil familiar that blocks bullets', type: 'trinket', quality: 3, pool: ['shop', 'boss'], dlc: 'afterbirthplus', gfx: 'trinket_097_tonsil.png' },
  { id: 98, name: 'Nose Goblin', desc: 'Tears have a luck-based chance to fire sticky boogers dealing 10x tick damage', type: 'trinket', quality: 4, pool: ['treasure'], dlc: 'afterbirthplus', gfx: 'trinket_098_nosegoblin.png' },
  { id: 99, name: 'Super Ball', desc: 'Tears bounce off walls and enemies with high speed', type: 'trinket', quality: 2, pool: ['treasure'], dlc: 'afterbirthplus', gfx: 'trinket_099_superball.png' },
  { id: 100, name: 'Vibrant Bulb', desc: '+Stats up (Damage, Tears, Speed, Range) when holding a fully charged active item', type: 'trinket', quality: 3, pool: ['shop', 'battery'], dlc: 'afterbirthplus', gfx: 'trinket_100_vibrantbulb.png' },
  { id: 101, name: 'Dim Bulb', desc: '+Stats up (Damage, Tears, Speed, Range) when holding an active item with 0 charges', type: 'trinket', quality: 3, pool: ['shop', 'battery'], dlc: 'afterbirthplus', gfx: 'trinket_101_dimbulb.png' }
];

export async function loadItemPoolsFromGame(gamePath) {
  const poolMap = {};
  const possiblePaths = [
    path.join(gamePath || '', 'extracted_resources', 'resources', 'itempools.xml'),
    path.join(gamePath || '', 'extracted_resources', 'resources-dlc3', 'itempools.xml'),
    path.join(gamePath || '', 'resources', 'itempools.xml'),
    path.join(gamePath || '', 'resources-dlc3', 'itempools.xml')
  ];

  for (const xmlPath of possiblePaths) {
    if (await fs.pathExists(xmlPath)) {
      try {
        const raw = await fs.readFile(xmlPath, 'utf8');
        const parser = new xml2js.Parser();
        const res = await parser.parseStringPromise(raw);
        if (res.ItemPools && res.ItemPools.Pool) {
          res.ItemPools.Pool.forEach(pool => {
            const poolName = (pool.$.Name || '').toLowerCase().replace(/\s+/g, '_');
            if (pool.Item) {
              pool.Item.forEach(item => {
                const id = parseInt(item.$.Id, 10);
                if (!isNaN(id)) {
                  if (!poolMap[id]) poolMap[id] = new Set();
                  poolMap[id].add(poolName);
                }
              });
            }
          });
        }
      } catch (err) {}
    }
  }
  return poolMap;
}

export async function loadTrinketsFromGame(gamePath) {
  const trinketsMap = new Map();

  // 1. Seed strictly from master item_id_map.json (contains all 189 authentic trinkets)
  try {
    const mapPath = path.join(DATA_DIR, 'item_id_map.json');
    if (await fs.pathExists(mapPath)) {
      const parsedMap = await fs.readJson(mapPath);
      if (parsedMap && parsedMap.trinkets) {
        Object.values(parsedMap.trinkets).forEach(tr => {
          trinketsMap.set(tr.id, {
            id: tr.id,
            name: tr.name,
            desc: tr.desc || 'Standard Isaac Trinket',
            type: 'trinket',
            quality: tr.quality !== undefined ? tr.quality : 2,
            pool: tr.pool || ['treasure', 'shop'],
            dlc: tr.dlc || 'repentance',
            gfx: tr.gfx || `trinket_${String(tr.id).padStart(3, '0')}.png`
          });
        });
      }
    }
  } catch (e) {}

  // Fallback to CURATED_TRINKETS if item_id_map had issues
  if (trinketsMap.size === 0) {
    CURATED_TRINKETS.forEach(t => trinketsMap.set(t.id, { ...t }));
  }

  // 2. Overlay attributes from game's items.xml if found
  const possiblePaths = [
    path.join(gamePath || '', 'extracted_resources', 'resources', 'items.xml'),
    path.join(gamePath || '', 'extracted_resources', 'resources-dlc3', 'items.xml'),
    path.join(gamePath || '', 'resources', 'items.xml'),
    path.join(gamePath || '', 'resources-dlc3', 'items.xml')
  ];

  for (const p of possiblePaths) {
    if (await fs.pathExists(p)) {
      try {
        const raw = await fs.readFile(p, 'utf8');
        const parser = new xml2js.Parser();
        const parsed = await parser.parseStringPromise(raw);
        if (parsed.items && parsed.items.trinket) {
          const list = Array.isArray(parsed.items.trinket) ? parsed.items.trinket : [parsed.items.trinket];
          list.forEach(t => {
            const attr = t.$;
            if (!attr) return;
            const id = parseInt(attr.id, 10);
            if (isNaN(id)) return;
            const existing = trinketsMap.get(id) || {};
            const rawName = attr.name ? attr.name.replace(/^#/, '').replace(/_NAME$/, '').replace(/_/g, ' ') : '';
            const rawDesc = attr.description ? attr.description.replace(/^#/, '').replace(/_DESCRIPTION$/, '').replace(/_/g, ' ') : '';
            trinketsMap.set(id, {
              id,
              name: existing.name || (rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : `Trinket #${id}`),
              desc: existing.desc || rawDesc || 'Standard Isaac Trinket',
              gfx: attr.gfx || existing.gfx || `trinket_${String(id).padStart(3, '0')}.png`,
              type: 'trinket',
              quality: attr.quality !== undefined ? parseInt(attr.quality, 10) : (existing.quality !== undefined ? existing.quality : 2),
              pool: existing.pool || ['treasure', 'shop'],
              dlc: existing.dlc || 'repentance'
            });
          });
        }
      } catch (e) {}
    }
  }

  const list = Array.from(trinketsMap.values());
  list.sort((a, b) => a.id - b.id);
  return list;
}

export async function loadPocketItems(gamePath) {
  const consumables = CURATED_CONSUMABLES.map(c => ({
    ...c,
    gfx: c.gfx || (c.type === 'pill' ? `pill_${c.id}.png` : `card_${String(c.id).padStart(2, '0')}.png`)
  }));

  return consumables;
}


export async function loadItemsFromGame(gamePath) {
  const possiblePaths = [
    path.join(gamePath || '', 'extracted_resources', 'resources', 'items.xml'),
    path.join(gamePath || '', 'extracted_resources', 'resources-dlc3', 'items.xml'),
    path.join(gamePath || '', 'resources', 'items.xml'),
    path.join(gamePath || '', 'resources-dlc3', 'items.xml'),
    path.join(gamePath || '', 'resources_repentance', 'items.xml')
  ];

  const qualityMap = {};
  const metadataPaths = [
    path.join(gamePath || '', 'extracted_resources', 'resources', 'items_metadata.xml'),
    path.join(gamePath || '', 'extracted_resources', 'resources-dlc3', 'items_metadata.xml'),
    path.join(gamePath || '', 'resources', 'items_metadata.xml'),
    path.join(gamePath || '', 'resources-dlc3', 'items_metadata.xml')
  ];

  for (const metaPath of metadataPaths) {
    if (await fs.pathExists(metaPath)) {
      try {
        const rawMeta = await fs.readFile(metaPath, 'utf8');
        const parser = new xml2js.Parser();
        const metaRes = await parser.parseStringPromise(rawMeta);
        if (metaRes.items && metaRes.items.item) {
          metaRes.items.item.forEach(i => {
            const id = parseInt(i.$.id, 10);
            if (!isNaN(id) && i.$.quality !== undefined) {
              qualityMap[id] = parseInt(i.$.quality, 10);
            }
          });
        }
      } catch (e) {}
    }
  }

  const poolMap = await loadItemPoolsFromGame(gamePath || '');
  const itemsMap = new Map();

  // 1. Seed strictly from master item_id_map.json
  try {
    const mapPath = path.join(DATA_DIR, 'item_id_map.json');
    if (await fs.pathExists(mapPath)) {
      const parsedMap = await fs.readJson(mapPath);
      if (parsedMap && parsedMap.items) {
        Object.values(parsedMap.items).forEach(it => {
          const pools = (poolMap[it.id] && poolMap[it.id].size > 0) ? Array.from(poolMap[it.id]) : (it.pool || ['treasure']);
          itemsMap.set(it.id, {
            ...it,
            quality: qualityMap[it.id] !== undefined ? qualityMap[it.id] : (it.quality !== undefined ? it.quality : 2),
            pool: pools
          });
        });
      }
    }
  } catch (e) {}

  function formatTitleCase(str) {
    if (!str) return '';
    const clean = str.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
    return clean.replace(/\w\S*/g, (word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
  }

  // 2. Overlay attributes from game's items.xml if found
  for (const xmlPath of possiblePaths) {
    if (await fs.pathExists(xmlPath)) {
      try {
        const raw = await fs.readFile(xmlPath, 'utf8');
        const parser = new xml2js.Parser();
        const res = await parser.parseStringPromise(raw);
        const root = res.items || {};

        const types = ['passive', 'active', 'familiar', 'collectible'];
        for (const type of types) {
          if (root[type]) {
            const list = Array.isArray(root[type]) ? root[type] : [root[type]];
            for (const itemObj of list) {
              const attr = itemObj.$;
              if (!attr) continue;
              const id = parseInt(attr.id, 10);
              if (isNaN(id)) continue;

              const existing = itemsMap.get(id) || {};
              const rawName = attr.name ? attr.name.replace(/^#/, '').replace(/_NAME$/, '').replace(/_/g, ' ') : '';
              const name = existing.name && !existing.name.startsWith('Collectible #') && !existing.name.startsWith('Item #') ? existing.name : (rawName ? formatTitleCase(rawName) : `Item #${id}`);
              const desc = existing.desc && existing.desc !== 'Isaac Collectible Item' && existing.desc !== 'Isaac starting collectible item' ? existing.desc : (attr.description ? formatTitleCase(attr.description.replace(/^#/, '').replace(/_DESCRIPTION$/, '')) : 'Isaac starting collectible item');
              const quality = qualityMap[id] !== undefined ? qualityMap[id] : (attr.quality !== undefined ? parseInt(attr.quality, 10) : (existing.quality !== undefined ? existing.quality : 2));

              const pools = (poolMap[id] && poolMap[id].size > 0) ? Array.from(poolMap[id]) : (existing.pool || ['treasure']);

              itemsMap.set(id, {
                id,
                name: existing.name || (rawName ? formatTitleCase(rawName) : `Item #${id}`),
                desc: existing.desc || (attr.description ? formatTitleCase(attr.description.replace(/^#/, '').replace(/_DESCRIPTION$/, '')) : 'Collectible Isaac loadout item'),
                type: existing.type || (type === 'collectible' ? 'passive' : type),
                quality,
                pool: pools,
                dlc: existing.dlc || getDlcForItem(id),
                gfx: existing.gfx || attr.gfx || `collectibles_${String(id).padStart(3, '0')}.png`,
                charges: attr.maxcharges ? parseInt(attr.maxcharges, 10) : (existing.charges || 0)
              });
            }
          }
        }
      } catch (err) {}
    }
  }

  const list = Array.from(itemsMap.values());
  list.sort((a, b) => a.id - b.id);
  return list;
}

export async function scanModdedItems(modsPath, workshopPath) {
  const modItems = [];
  const scannedFolders = new Set();
  const modsMap = new Map(); // folder -> { name, folder, version, description, isWorkshop, count }

  // 0. Load vanilla reference dictionary to filter out mods that only alter vanilla items
  const vanillaItemNames = new Set();
  const vanillaTrinketNames = new Set();
  const vanillaItemIds = new Set();
  const vanillaTrinketIds = new Set();

  try {
    const mapPath = path.join(DATA_DIR, 'item_id_map.json');
    if (await fs.pathExists(mapPath)) {
      const mapData = await fs.readJson(mapPath);
      if (mapData.items) {
        Object.values(mapData.items).forEach(it => {
          if (it.name) {
            const clean = it.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (clean) vanillaItemNames.add(clean);
          }
          if (it.id !== undefined) vanillaItemIds.add(Number(it.id));
        });
      }
      if (mapData.trinkets) {
        Object.values(mapData.trinkets).forEach(tr => {
          if (tr.name) {
            const clean = tr.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (clean) vanillaTrinketNames.add(clean);
          }
          if (tr.id !== undefined) vanillaTrinketIds.add(Number(tr.id));
        });
      }
    }
  } catch (e) {}

  // 1. Gather all potential search directories with canonical path normalization
  const config = getConfig();
  const rawDirs = [
    modsPath,
    workshopPath,
    config.modsPath,
    config.workshopPath,
    ...DEFAULT_MOD_PATHS,
    ...DEFAULT_WORKSHOP_PATHS,
    config.gamePath ? path.join(config.gamePath, 'mods') : null,
    config.gamePath ? path.resolve(config.gamePath, '..', '..', 'workshop', 'content', '250900') : null
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

  // Helper to extract clean human-readable mod name from metadata.xml or directory name
  async function resolveModMetadata(modDir, folderName, isWorkshop) {
    let modName = '';
    let modVersion = '1.0';
    let modDescription = '';

    const metaPath = path.join(modDir, 'metadata.xml');
    if (await fs.pathExists(metaPath)) {
      try {
        const rawMeta = await fs.readFile(metaPath, 'utf8');
        const parser = new xml2js.Parser();
        const parsed = await parser.parseStringPromise(rawMeta);
        if (parsed.metadata) {
          const rawName = parsed.metadata.name?.[0] || parsed.metadata.name;
          if (typeof rawName === 'string' && rawName.trim()) {
            modName = rawName
              .replace(/&quot;/g, '"')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/^[\s!~'"]+/, '')
              .trim();
          }
          modVersion = parsed.metadata.version?.[0] || parsed.metadata.version || '1.0';
          modDescription = parsed.metadata.description?.[0] || parsed.metadata.description || '';
        }
      } catch (e) {}
    }

    if (!modName) {
      // Clean up directory name
      let clean = folderName;
      clean = clean.replace(/^\d+_/, '');
      if (/^\d+$/.test(clean)) {
        clean = `Workshop Mod #${clean}`;
      } else {
        clean = clean.replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();
      }
      modName = clean || folderName;
    }

    return { modName, modVersion, modDescription };
  }

  const seenModNames = new Set();
  const seenModFolders = new Set();
  const seenGlobalItemKeys = new Set();

  for (const baseDir of searchDirs) {
    const isWorkshop = baseDir.toLowerCase().includes('workshop') || baseDir.includes('250900');
    try {
      const folders = await fs.readdir(baseDir);
      for (const folder of folders) {
        const full = path.resolve(baseDir, folder);
        const folderKey = full.toLowerCase();
        try {
          const stat = await fs.stat(full);
          if (!stat.isDirectory()) continue;
        } catch { continue; }

        if (seenModFolders.has(folderKey)) continue;
        seenModFolders.add(folderKey);

        const { modName, modVersion, modDescription } = await resolveModMetadata(full, folder, isWorkshop);
        const nameKey = modName.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (nameKey && seenModNames.has(nameKey)) {
          // Skip mirror copy in workshop if already scanned in mods
          continue;
        }
        if (nameKey) seenModNames.add(nameKey);

        const possibleXmls = [
          path.join(full, 'content', 'items.xml'),
          path.join(full, 'content', 'pocketitems.xml'),
          path.join(full, 'content', 'cards.xml'),
          path.join(full, 'content', 'pills.xml'),
          path.join(full, 'content', 'eng', 'items.xml'),
          path.join(full, 'content-repentogon', 'items.xml'),
          path.join(full, 'resources', 'items.xml'),
          path.join(full, 'resources', 'pocketitems.xml'),
          path.join(full, 'resources', 'cards.xml'),
          path.join(full, 'resources-dlc3', 'items.xml')
        ];

        let itemsInMod = 0;
        const seenItemsInThisMod = new Set();

        for (const xmlPath of possibleXmls) {
          if (await fs.pathExists(xmlPath)) {
            try {
              const raw = await fs.readFile(xmlPath, 'utf8');
              const parser = new xml2js.Parser();
              const res = await parser.parseStringPromise(raw);
              const root = res.items || res.pocketitems || res.cards || res.pills || res || {};

              const types = ['passive', 'active', 'familiar', 'trinket', 'card', 'rune', 'pill', 'pocketitem', 'null'];
              for (const type of types) {
                if (root[type]) {
                  const list = Array.isArray(root[type]) ? root[type] : [root[type]];
                  for (const itemObj of list) {
                    const attr = itemObj.$;
                    if (!attr) continue;
                    const rawItemName = (attr.name || `Modded Item`).trim();
                    const cleanItemNameKey = rawItemName.toLowerCase().replace(/[^a-z0-9]/g, '');
                    if (!cleanItemNameKey) continue;

                    const id = parseInt(attr.id, 10);
                    const isTrk = type === 'trinket';
                    const isCard = type === 'card' || type === 'rune' || type === 'pocketitem';
                    const isPill = type === 'pill';

                    // FILTER OUT VANILLA ITEM ALTERATIONS / RESKINS / REBALANCES:
                    // 1. If name matches any vanilla collectible or trinket name -> skip!
                    const isVanillaName = isTrk ? vanillaTrinketNames.has(cleanItemNameKey) : (vanillaItemNames.has(cleanItemNameKey) || vanillaTrinketNames.has(cleanItemNameKey));
                    if (isVanillaName) continue;

                    // 2. If ID matches a vanilla ID (1..732 for items, 1..194 for trinkets) -> skip!
                    if (!isNaN(id) && id > 0) {
                      if (isTrk && (id <= 194 || vanillaTrinketIds.has(id))) continue;
                      if (!isTrk && !isCard && !isPill && (id <= 732 || vanillaItemIds.has(id))) continue;
                    }

                    const modSpecificKey = cleanItemNameKey;
                    const globalKey = `${nameKey}::${cleanItemNameKey}`;

                    if (seenItemsInThisMod.has(modSpecificKey) || seenGlobalItemKeys.has(globalKey)) continue;
                    seenItemsInThisMod.add(modSpecificKey);
                    seenGlobalItemKeys.add(globalKey);

                    const resolvedId = (!isNaN(id) && id > 732) ? id : Math.floor(1000 + Math.random() * 9000);
                    const rawDesc = attr.description || (isTrk ? 'Custom Modded Trinket' : isCard ? 'Custom Modded Card' : isPill ? 'Custom Modded Pill' : 'Custom Modded Collectible');
                    const charges = attr.maxcharges ? parseInt(attr.maxcharges, 10) : (attr.charges ? parseInt(attr.charges, 10) : 0);

                    let assignedType = 'passive';
                    if (isTrk) assignedType = 'trinket';
                    else if (isPill) assignedType = 'pill';
                    else if (type === 'rune') assignedType = 'rune';
                    else if (type === 'card' || type === 'pocketitem') assignedType = 'card';
                    else if (type === 'active' || charges > 0) assignedType = 'active';
                    else if (type === 'familiar') assignedType = 'familiar';

                    modItems.push({
                      id: resolvedId,
                      name: rawItemName,
                      desc: rawDesc,
                      type: assignedType,
                      quality: attr.quality !== undefined ? parseInt(attr.quality, 10) : 2,
                      pool: ['treasure', 'modded'],
                      dlc: 'repentanceplus',
                      gfx: attr.gfx || (isTrk ? 'trinkets_001.png' : (isCard || isPill) ? 'card_01.png' : 'collectibles_001.png'),
                      charges,
                      isMod: true,
                      modName,
                      modFolder: folder
                    });
                    itemsInMod++;
                  }
                }
              }
            } catch (e) {}
          }
        }

        // ONLY include mod in mods list if it contains at least 1 genuine custom modded item!
        if (itemsInMod > 0) {
          if (!modsMap.has(folder)) {
            modsMap.set(folder, {
              name: modName,
              folder,
              version: modVersion,
              description: modDescription,
              isWorkshop,
              count: itemsInMod
            });
          }
        }
      }
    } catch (e) {}
  }

  const modsList = Array.from(modsMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  return {
    success: true,
    totalModItems: modItems.length,
    moddedItems: modItems,
    items: modItems,
    mods: modsList
  };
}
