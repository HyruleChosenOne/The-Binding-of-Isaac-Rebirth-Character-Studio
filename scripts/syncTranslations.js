import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

async function run() {
  const enPath = path.resolve('client/src/data/itemEffectsData.js');
  const frPath = path.resolve('client/src/data/itemEffectsDataFr.js');

  const enMod = await import(pathToFileURL(enPath).href);
  const frMod = await import(pathToFileURL(frPath).href);

  const enItems = { ...enMod.ITEM_MECHANICS };
  const enTrinkets = { ...enMod.TRINKET_MECHANICS };
  const frItems = { ...frMod.ITEM_MECHANICS_FR };
  const frTrinkets = { ...frMod.TRINKET_MECHANICS_FR };

  // New Repentance+ Collectibles (722 - 742)
  const newEnItems = {
    722: 'Active (2 charges): Chains down the nearest enemy or Dark Esau in place; activating again releases them with massive speed and damage.',
    723: 'Active (6 charges): Decreases the internal item ID of all pedestals in the current room by 1.',
    724: 'Converts all damage taken into bouncing blood droplets that can be collected to recover health.',
    725: 'Periodically or on taking damage, drops a random special explosive, poisonous, or status-inducing poop.',
    726: 'Tears charge into a short-range bloody sneeze that deals 1.5x damage and inflicts brimstone curse.',
    727: 'Bombs gain spectral properties and spawn friendly ghost familiars upon detonating.',
    728: 'Active (2 charges): Shoots out a mini-demon umbilical familiar that fires tears copying Isaac stats.',
    729: 'Active (2 charges): Launches Isaac head forward as a stationary turret while the body walks independently.',
    730: '+1.0 Flat Damage and +0.75 Luck up.',
    731: '+0.28 Damage up and tears fired from the right eye are 28% larger and deal 28% more damage.',
    732: '+1.0 Damage up and spawns a random rune upon pickup.',
    733: 'Co-op: Spawns an extra life revival pickup for fallen co-op players.',
    734: 'Co-op: Orbitals and familiars orbit around other co-op players as well.',
    735: 'Active (4 charges / Co-op): Duplicates all co-op familiars and minions for the current room.',
    736: 'Co-op: Shares stat increases and heart pickups equally with all co-op players.',
    737: 'Co-op: Drops a care package crate containing health, keys, and bombs for all players.',
    738: 'Co-op: Spawns a friendly ghost soul assisting the team with spectral tears.',
    739: 'Active (Co-op): Plants a rallying flag that buffs damage, speed, and tears in its aura.',
    740: 'Co-op: High-fiving a teammate grants temporary invincibility and tears up.',
    741: 'Co-op: Links enemies together so damaging one enemy damages all chained enemies.',
    742: 'Co-op: Adds a protective golden heart shield to teammates, dropping coins upon damage.'
  };

  const newFrItems = {
    718: "Les larmes deviennent spectrales et traversent les obstacles (The Intruder).",
    722: "Actif (2 charges) : Immobilise l'ennemi le plus proche ou Dark Esau pendant quelques secondes ; le réactiver le propulse avec de gros dégâts.",
    723: "Actif (6 charges) : Diminue l'ID interne de tous les objets sur piédestal dans la salle de 1.",
    724: "Convertit tous les dégâts subis en gouttelettes de sang qui rebondissent et peuvent être ramassées pour récupérer la vie.",
    725: "Toutes les 10 à 20 secondes ou en subissant des dégâts, pose un caca spécial explosif ou altéré derrière Isaac.",
    726: "Les tirs se chargent en un éternuement sanglant à courte portée infligeant 1.5x de dégâts et une malédiction Brimstone.",
    727: "Les bombes deviennent spectrales et font apparaître des familiers fantômes alliés lors de leur détonation.",
    728: "Actif (2 charges) : Projette un mini-démon fœtal relié par un cordon qui tire des larmes calquées sur les stats d'Isaac.",
    729: "Actif (2 charges) : Lance la tête d'Isaac comme une tourelle stationnaire tandis que son corps se déplace librement.",
    730: "Octroie +1.0 de Dégâts bruts et +0.75 de Chance.",
    731: "Octroie +0.28 de Dégâts et les larmes tirées par l'œil droit sont 28% plus grosses et puissantes.",
    732: "Octroie +1.0 de Dégâts et fait apparaître une rune aléatoire au ramassage.",
    733: "Co-op : Fait apparaître un jeton de réanimation accordant une vie supplémentaire à un allié tombé au combat.",
    734: "Co-op : Les familiers et objets orbitaux gravitent également autour de vos coéquipiers.",
    735: "Actif (4 charges / Co-op) : Duplique tous les familiers et compagnons de l'équipe pour la salle actuelle.",
    736: "Co-op : Partage équitablement les bonus de statistiques et les cœurs ramassés entre tous les coéquipiers.",
    737: "Co-op : Largue une caisse de ravitaillement contenant de la santé, des bombes et des clés pour l'équipe.",
    738: "Co-op : Fait apparaître une âme spectrale bienveillante qui attaque les ennemis avec des larmes spectrales.",
    739: "Actif (Co-op) : Plante une bannière de ralliement conférant une puissante aura de Dégâts, Vitesse et Cadence de tir.",
    740: "Co-op : Faire un High-Five avec un équipier confère une invulnérabilité temporaire et une hausse de Cadence de tir.",
    741: "Co-op : Lie les ennemis entre eux, répercutant les dégâts subis par l'un sur tous les autres.",
    742: "Co-op : Entoure les coéquipiers d'un bouclier doré protecteur lâchant des pièces lors des impacts."
  };

  // New Repentance+ Trinkets (190 - 195)
  const newEnTrinkets = {
    190: 'Co-op: Increases pickup drop rates from room clears when playing in co-op mode.',
    191: 'Co-op: 50% chance to drop extra health pickups when reviving a fallen teammate.',
    192: 'Co-op: Familiars gain increased movement speed and tear fire rate for the team.',
    193: 'Co-op: Grants stat bonuses when staying in close proximity to co-op teammates.',
    194: 'Co-op: Extends the invincibility duration gained from team interactions.',
    195: 'Co-op: Teleports teammates together when any player enters critical danger.'
  };

  const newFrTrinkets = {
    190: "Co-op : Augmente la fréquence d'apparition des ressources et butins pour toute l'équipe.",
    191: "Co-op : 50% de chance de faire apparaître des cœurs supplémentaires lors de la réanimation d'un coéquipier.",
    192: "Co-op : Augmente la vitesse de déplacement et la cadence de tir de tous les familiers de l'équipe.",
    193: "Co-op : Confère des bonus de statistiques lorsque vous combattez côte à côte avec vos coéquipiers.",
    194: "Co-op : Prolonge la durée de l'invulnérabilité accordée par les interactions d'équipe.",
    195: "Co-op : Téléporte instantanément les équipiers proches en cas de danger critique."
  };

  // French translation updates for previously English/hybrid entries
  const frItemFixes = {
    2: "Tire 3 larmes simultanées en éventail avec un multiplicateur de délai de tir.",
    17: "Octroie 99 clés immédiatement.",
    18: "Octroie 99 pièces immédiatement.",
    19: "Octroie +10 bombes immédiatement.",
    74: "Octroie +25 pièces immédiatement.",
    75: "Octroie 1 pilule et identifie toutes les pilules futures de la partie avec des effets positifs.",
    109: "Réduction de 20% sur tous les achats en boutique.",
    129: "Octroie +2 réceptacles de cœur rouge et restaure complètement la santé.",
    156: "Octroie +1 charge d'objet actif à chaque fois qu'Isaac subit des dégâts.",
    212: "Octroie +2 cœurs d'âme et 50% de chance de lâcher un demi-cœur d'âme en subissant des dégâts.",
    216: "Octroie +1 réceptacle de cœur rouge et fait apparaître 2 cœurs rouges complets.",
    220: "Tire un rayon laser électrique continu et rapide en plus des larmes.",
    225: "Les larmes gravitent en spirale orbitale continue à tête chercheuse autour d'Isaac.",
    234: "Tire 4 larmes simultanées avec une réduction de cadence de tir (Mutant Spider).",
    241: "Octroie +2 cœurs d'âme, réduit le délai de tir et protège contre toutes les malédictions (Black Candle).",
    245: "Tire 2 larmes simultanées sans pénalité de cadence de tir (20/20).",
    359: "Tire de grands clous perçants infligeant +1.5 de Dégâts et un fort recul aux ennemis.",
    361: "Familier volant tirant un jet continu de larmes perforantes en forme d'aiguille.",
    362: "Familier coffre qui lâche périodiquement des babioles, pièces, bombes et cœurs.",
    415: "Tant qu'aucun réceptacle rouge n'est vide : double les dégâts et génère un bouclier (Crown of Light).",
    451: "Double ou amplifie la puissance et la durée de toutes les cartes de Tarot et runes utilisées (Tarot Cloth).",
    501: "Augmente la limite de réceptacles de cœur et accorde des bonus de stats pour chaque 25 pièces possédées (Greed's Gullet).",
    560: "Fait jaillir des arcs électriques infligeant des dégâts continus aux ennemis proches (120 Volt).",
    562: "Tirs ultra-rapides et chaotiques avec effets de statut aléatoires et très haute cadence de tir (Almond Milk)."
  };

  const frTrinketFixes = {
    3: "Réduit le coût de charge de l'objet actif de 1 charge de salle lorsqu'il est complètement chargé.",
    5: "Augmente le taux d'apparition des monstres et boss champions pour de meilleurs butins.",
    7: "Augmente considérablement les chances d'apparition de la Salle d'Ange et la fréquence de la Bible.",
    14: "Immunise complètement contre les fluides nocifs au sol, les piques et les portes de Salle Maudite.",
    17: "Augmente les chances d'obtenir des cœurs noirs et renforce la statistique Maléfique.",
    18: "Augmente les chances de Salle d'Ange et convertit les demi-cœurs en cœurs éternels.",
    28: "Chance de ressusciter sous la forme de ??? (Blue Baby) à la mort.",
    30: "Chance de tirer des larmes empoisonnées infligeant le double de dégâts sur la durée.",
    31: "Chance de tirer des larmes spectrales et perforantes en forme de punaise.",
    32: "Chance de déclencher un effet de champignon aléatoire à l'entrée d'une salle.",
    34: "Augmente les chances d'obtenir des cœurs en nettoyant les salles.",
    36: "Augmente considérablement les chances d'obtenir des clés et des coffres dorés verrouillés.",
    38: "Augmente les chances d'obtenir des cœurs d'âme et transforme les demi-cœurs en cœurs d'âme.",
    40: "Chance d'obtenir un bonus temporaire de +1.8 de Dégâts en subissant un coup.",
    41: "Augmente les chances d'obtenir des bombes et transforme les bombes troll en bombes normales.",
    44: "Augmente les chances de trouver des pilules en nettoyant les salles.",
    45: "Augmente les chances d'obtenir des cartes de Tarot et des runes.",
    46: "Chance de récupérer 1/2 Cœur rouge après avoir nettoyé une salle hostile.",
    47: "Inflige 40 de dégâts à tous les ennemis de la salle lorsqu'Isaac est réduit à 1/2 cœur.",
    55: "Octroie +1 Cœur éternel au début de chaque nouvel étage.",
    56: "Réduit les prix des pactes avec le Diable (les pactes à 2 cœurs ne coûtent qu'un cœur).",
    65: "Double la portée des larmes d'Isaac (+100% Portée) avec une vitesse de tir élevée.",
    70: "Chance de faire apparaître une araignée bleue alliée pendant le combat.",
    72: "Augmente les chances d'obtenir des piles et accorde une chance d'ajouter +1 charge d'objet actif en nettoyant une salle.",
    74: "Augmente la fréquence d'apparition des passages secrets sous les rochers détruits.",
    77: "Augmente considérablement la force de recul infligée par les larmes.",
    78: "Double la durée de tous les effets de poison, brûlure et gel sur les ennemis.",
    81: "Double la durée des frames d'invulnérabilité après avoir subi des dégâts.",
    82: "Augmente les chances que les Salles au Trésor contiennent 2 piédestaux d'objets.",
    83: "Ouvre gratuitement et de manière permanente toutes les portes de Boutique sans consommer de clés.",
    93: "Accorde temporairement l'aura pacificatrice de Skatole envers les mouches dans certaines salles.",
    94: "Double le nombre de mouches et d'araignées bleues alliées générées par tous les objets.",
    95: "Chance de tirer des dents empoisonnées perforantes infligeant le triple de dégâts.",
    132: "Octroie un bonus aléatoire de seringue au début de chaque étage.",
    139: "Augmente la Cadence de tir et la statistique de Chance pour la salle actuelle.",
    145: "Octroie +10 de Chance tant qu'elle est tenue (lâchée en subissant des dégâts).",
    152: "Augmente considérablement les chances d'apparition des Planétariums et salles célestes de +50%.",
    153: "Réduit les effets de la malédiction de l'aveugle et accorde des bonus de stats à chaque étage nettoyé.",
    156: "Octroie +1 réceptacle de cœur rouge plein et +0.2 de Vitesse de déplacement.",
    160: "Octroie +1 de Chance et augmente le taux de butin en nettoyant les salles.",
    161: "Augmente les dégâts et la cadence de tir dans les salles du Diable.",
    167: "Augmente les dégâts des larmes d'os et les chances de trouver des cœurs d'os.",
    168: "Octroie +1 réceptacle de cœur fantôme temporaire en subissant un coup fatal.",
    182: "Génère des flammes orbitales protectrices au début de chaque étage.",
    187: "Confère une vision 20/20 (tirs doubles) lorsqu'Isaac est réduit à 1/2 cœur."
  };

  Object.assign(enItems, newEnItems);
  Object.assign(enTrinkets, newEnTrinkets);
  Object.assign(frItems, newFrItems, frItemFixes);
  Object.assign(frTrinkets, newFrTrinkets, frTrinketFixes);

  // Save EN file
  const enContent = `// Comprehensive Gameplay Mechanics Dictionary for The Binding of Isaac (Repentance+)\nexport const ITEM_MECHANICS = ${JSON.stringify(enItems, null, 2)};\n\nexport const TRINKET_MECHANICS = ${JSON.stringify(enTrinkets, null, 2)};\n`;
  fs.writeFileSync(enPath, enContent, 'utf8');

  // Save FR file
  const frContent = `// Dictionnaire complet des effets de gameplay en Français pour The Binding of Isaac (Repentance+)\nexport const ITEM_MECHANICS_FR = ${JSON.stringify(frItems, null, 2)};\n\nexport const TRINKET_MECHANICS_FR = ${JSON.stringify(frTrinkets, null, 2)};\n`;
  fs.writeFileSync(frPath, frContent, 'utf8');

  console.log('Saved EN & FR translations successfully!');
  console.log('EN items count:', Object.keys(enItems).length);
  console.log('EN trinkets count:', Object.keys(enTrinkets).length);
  console.log('FR items count:', Object.keys(frItems).length);
  console.log('FR trinkets count:', Object.keys(frTrinkets).length);
}

run().catch(console.error);
