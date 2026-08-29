# 🗡️ The Binding of Isaac: Rebirth — Character Studio

<div align="center">

![Isaac Character Studio](https://raw.githubusercontent.com/isaac-community/isaac-character-studio/main/client/public/triforce-logo.png)

### **The Definitive Visual Workshop & Modding Suite for The Binding of Isaac**
**Full Compatibility:** *Rebirth* • *Afterbirth* • *Afterbirth+* • *Repentance* • *Repentance+*

[![Version](https://img.shields.io/badge/version-v0.6.0-amber.svg?style=for-the-badge&logo=appveyor)](https://github.com/)
[![DLC Compatibility](https://img.shields.io/badge/DLC-Repentance%2B%20Ready-red.svg?style=for-the-badge&logo=steam)](https://store.steampowered.com/app/250900/The_Binding_of_Isaac_Rebirth/)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue.svg?style=for-the-badge&logo=windows)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=for-the-badge)](LICENSE)
[![Zero Install](https://img.shields.io/badge/zero--install-Portable%20Standalone-purple.svg?style=for-the-badge)](https://nodejs.org/)

</div>
***
---

## 📖 Overview

**The Binding of Isaac: Character Studio** is a standalone visual design environment, character creator, and automated mod generation engine built specifically for *The Binding of Isaac: Rebirth* (including *Repentance* & *Repentance+*).

It allows creators, modders, and players of all experience levels to build fully playable, rich custom characters with authentic game-accurate animations, accurate XML definitions, starting collectibles, customized health bars, procedural Lua scripts, dynamic Birthright mechanics, and dual twin characters (like Jacob & Esau)—**all without writing a single line of code**.

```

---

## 🌟 Comprehensive Feature Catalog

### 1. 🎭 Character Creation & Archetypes
- **All 34 Repentance Characters Supported**: Instant base templates for Isaac, Magdalene, Cain, Judas, ??? (Blue Baby), Eve, Samson, Azazel, Lazarus, Eden, The Lost, Lilith, Keeper, Apollyon, The Forgotten, Bethany, Jacob & Esau, and all **17 Tainted** counterparts.
- **Tainted Characters**: Toggle Tainted mode with unique mechanics, distinct tainted portraits, pocket active items, and tainted visual styling.
- **Dual & Twin Characters (Jacob & Esau Engine)**:
  - Create partnered characters with fully independent sprites, health pools, damage stats, starting items, and movement parameters.
  - Generates synchronized Lua management code that keeps both twins in sync across rooms and item pools.
- **Eden Outfits & Hairstyle Randomization**: Support for procedural hair/costume randomization on character run starts.

---

### 2. 🎨 Visual Appearance, Spritesheets & Live Recolorer
- **Custom Spritesheet Upload**: Drag-and-drop your custom `.png` character sprite sheets with immediate format validation.
- **Head & Animation Slicing Preview**: Live animated canvas previewing head, body, eyes, walking animations, and shooting poses.
- **Real-Time HSL Recolor Engine**:
  - Live hardware-accelerated adjustments for **Hue**, **Saturation**, **Brightness**, and **Contrast**.
  - Recolor vanilla character spritesheets on the fly without external image editing software.
- **Custom Skin Tones & Costume Suffixes**: Set native skin color indexes (`-1` through `5`) and costume suffixes to control how item costumes visually layer on the character.
- **Authentic Isaac Font Typography Generator**: Generates pixel-perfect nameplates and stage title cards using the official Binding of Isaac font typography.

---

### 3. ❤️ Health Container Customization
Customize character starting health with granular precision:
- **Red Hearts** (Full Hearts, Half Hearts, Empty Containers)
- **Soul Hearts**
- **Black Hearts** (with Necronomicon room-damage effect)
- **Bone Hearts** (with bone break mechanics)
- **Rotten Hearts** (with blue fly spawning)
- **Golden Hearts**
- **Eternal Hearts**
- **Broken Hearts** (maximum container reduction)
- **Coin Hearts** (Keeper-style coin health)

---

### 4. 📊 RPG Stats Fine-Tuning
Fine-tune character base stats with real-time feedback against Isaac averages:
- **Movement Speed** (0.5 to 2.0)
- **Base Damage** & **Damage Multiplier** (e.g. Judas ×1.35, Cain ×1.2, Azazel ×1.5)
- **Tear Rate / Max Fire Delay**
- **Range & Tear Height**
- **Shot Speed**
- **Luck Attribute**
- **Flight Toggle** (Spectral / Flying movement)
- **Can Shoot Toggle** (Blind / Familiar-dependent playstyles like Lilith)

---

### 5. 📦 Complete Collectibles & Inventory Database
- **732+ Collectibles Catalog**: Comprehensive search and filter across all Rebirth, Afterbirth, Afterbirth+, Repentance, and Repentance+ items.
- **Item Quality Filter**: Filter by Quality `0` (Trash) up to Quality `4` (Sacred Heart, Godhead, Brimstone, C Section, etc.).
- **Item Pool Filtering**: Treasure, Devil, Angel, Shop, Secret, Planetarium, Boss, Golden Chest, Curse, Ultra Secret, and more.
- **Active Items Slot**: Configure starting active item with charge state, battery synergies, and special discharge hooks.
- **Trinkets & Modded Trinkets**: Select from 189+ vanilla trinkets or enter custom modded trinket identifiers.
- **Pocket Items & Pocket Actives**: Dedicated Repentance pocket item slots (Pills, Cards, Runes, Object slots, or Tainted Actives).
- **Modded Item Compatibility**: Enter custom modded item names with automated Lua fallback hooks.

---

### 6. 📜 Birthright Mechanics & Synergy Matrix
- **Custom Birthright Creator**: Define unique, character-specific Birthright abilities and descriptions with automated Lua detection on item pickup.
- **Interactive Synergy Matrix**: Explore and configure synergies with major items like *Brimstone*, *Mom's Knife*, *Ipecac*, *Tech X*, *Ludovico Technique*, *C Section*, *Dr. Fetus*, and *Polyphemus*.

---

### 7. 🎲 Procedural Character Randomizer
Generate balanced or chaotic character builds with a single click:
- **Archetype Themes**: Unholy Demon, Holy Angel, Cyborg/Tech, Poison/Rotten, Speedster, Glass Cannon, Tank, Gambling/Greed, Dual Twins, and more.
- **Difficulty Balance Modes**:
  - *Easy*: Generous health, high quality items, bonus pickups.
  - *Normal*: Standard Isaac balanced difficulty curve.
  - *Hardcore*: Low health, high stakes, specialized gimmicks.
  - *Chaos*: Unrestricted procedural combinations across the entire catalog.

---

### 8. 🛠️ Mod Exporter & Roster Management
- **Direct Game Export**: Automatically writes full mod files directly to your Isaac `mods/` directory.
- **Autonomous File Generation**:
  - `content/players.xml`: Game-accurate player definitions, costumes, and starting stats.
  - `metadata.xml`: Steam Workshop metadata, versioning, author, and description.
  - `main.lua`: Production-ready Lua script with callbacks (`MC_POST_PLAYER_INIT`, `MC_EVALUATE_CACHE`, `MC_POST_NEW_ROOM`, `MC_USE_ITEM`, pocket slot handling, Birthright callbacks, and dual character synchronization).
  - `.anm2` XML animation files for character select screens and in-game portraits.
- **Interactive Roster Hub**:
  - View all custom characters in a clean, visual card gallery.
  - Instant **Enable / Disable** switch to toggle mods on and off without deleting files.
  - **Edit**, **Duplicate**, and **Delete** with confirmation safeguards.
  - Export standalone `.zip` mod packages for sharing or Steam Workshop upload.

---

### 9. 🔍 Auto-Detection & Game Asset Pipeline
- **Smart Path Scanner**: Automatically discovers Steam installation paths, Documents mod directories, and Workshop directories across all drives (C:, D:, E:, G:, etc.).
- **Asset Importer & Extractor**: Built-in runner for Isaac's official `ResourceExtractor.exe` to extract and index textures, sprites, items, and UI elements.

---

## 📂 Generated Mod Architecture

When a character is exported, the studio generates a clean, compliant mod directory:

```
<The Binding of Isaac Mods>/
└── custom_character_name/
    ├── content/
    │   └── players.xml            # Player definitions, costumes, and baseline stats
    ├── resources/
    │   ├── gfx/
    │   │   ├── characters/        # Character spritesheets and costume overlays
    │   │   └── ui/
    │   │       ├── stage/         # Stage versus portraits and nameplates
    │   │       └── characterportraits.anm2 # Menu and selection animations
    │   └── scripts/
    ├── main.lua                   # High-performance Lua logic and Repentance callbacks
    ├── metadata.xml               # Mod metadata and Steam Workshop details
    ├── disable.it                 # (Optional) Toggles mod active state in Isaac menu
    └── thumb.png                  # Mod preview thumbnail
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Operating System**: Windows 10/11 (64-bit), macOS, or Linux.
- **Game**: *The Binding of Isaac: Rebirth* (Repentance or Repentance+ recommended).

### Running with Portable Standalone (No Node.js install required)
1. Download or extract the release archive (`IsaacCharacterStudio-v0.6.zip`).
2. Double-click **`Launch-IsaacStudio.bat`**.
3. The studio will start automatically and launch in your default web browser at `http://localhost:3001`.
4. When you close the browser tab, the server closes automatically!

---

## ⚙️ Configuration & Settings

Upon first launch, the studio automatically scans standard Steam and Isaac directories:
- **Game Path**: `C:\Program Files (x86)\Steam\steamapps\common\The Binding of Isaac Rebirth`
- **Mods Path**: `%USERPROFILE%\Documents\My Games\Binding of Isaac Repentance\mods`
- **Workshop Path**: `C:\Program Files (x86)\Steam\steamapps\workshop\content\250900`

If your game is installed on a secondary drive (e.g. `D:`, `E:`, `G:`), open the **Settings** tab (`⚙️`) to select or customize your paths with real-time validation.

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---


