> [!NOTE]
> **Early Implementation:** Work is currently ongoing for menu/boss portraits and stat calibration.

# 🩸 Isaac Character Studio

[![Release](https://img.shields.io/badge/Release-v0.6.0-crimson.svg?style=for-the-badge)](https://github.com/)
[![Platform](https://img.shields.io/badge/Platform-Windows-0078D6.svg?style=for-the-badge&logo=windows)](https://github.com/)
[![Game Version](https://img.shields.io/badge/Game-The_Binding_of_Isaac:_Repentance_%2F_Repentance%2B-darkred.svg?style=for-the-badge)](https://store.steampowered.com/app/250900/)
[![License](https://img.shields.io/badge/License-MIT-gold.svg?style=for-the-badge)](LICENSE)

> **The ultimate visual character creator, loadout editor, and one-click mod generator for *The Binding of Isaac: Repentance* and *Repentance+*.**  
> Design custom characters, fine-tune starting stats, pick custom collectibles, and export fully functional standalone mods without writing a single line of XML or Lua!

---

## ✨ Features Overview

### 🎨 Visual Character Designer & Palette Studio
* **All 34 Base Characters Supported**: Quick-start templates for all 17 standard characters and all 17 Tainted counterparts.
* **Dual & Twin Character Engine (Jacob & Esau Architecture)**: Create partnered dual characters with independent sprites, separate health bars, distinct starting stats, individual items, and synchronized Lua room handling.
* **Live In-Game HUD Preview**: Real-time visualization of health containers (Red Hearts, Soul Hearts, Black Hearts, Bone Hearts, Rotten Hearts, Golden Hearts, Eternal Hearts, Broken Hearts, and Keeper Coin Hearts), authentic HUD pickup counters (Keys, Bombs, Coins), and base stats.
* **Real-Time Head & Animation Slicing Preview**: Live animated canvas previewing head, body, eyes, walking animations, and shooting poses directly from the spritesheet.
* **Palette Hue & Lighting Engine**: Non-destructive live recoloring with sliders for **Hue (0–360°)**, **Saturation**, **Brightness**, and **Contrast**.
* **One-Click Palette Presets**: Instantly apply iconic themes including *Ghost (The Lost)*, *Shadow Demon*, *Blue Baby (Corpse)*, *Crimson Blood*, *Toxic Rotten*, *Void / Abyss*, and *Golden Greed*.
* **Custom Spritesheet & Portrait Uploads**: Drag and drop custom PNG spritesheets, player portraits, and stage portraits with instant preview rendering.
* **Skin Tone & Costume Configuration**: Fine-tune native skin color indexes (`-1` to `5`), costume IDs, and costume suffixes to control visual item overlays.
* **Archetype Toggles**: Configure Flight (`flying="true"`), Tear Shooting (`canShoot="true/false"`), Tainted Character variations, and Eden Random Outfits.

### 📊 In-Depth RPG Stat Tuning
* **Precise Stat Sliders**: Fine-tune Speed, Base Damage, Damage Multipliers (e.g. Judas ×1.35, Azazel ×1.5), Tear Rate (Max Fire Delay), Range, Shot Speed, and Luck.
* **Comparative Baselines**: Real-time visual comparisons against default Isaac stats.

### ✍️ Authentic Handwritten In-Game Typography
* **Isaac Font Nameplate Engine**: Type any character name to dynamically generate in-game handwritten nameplates using authentic Isaac typography.
* **Stage & Menu Integration**: Automatically builds name assets for stage transitions (`playername_*.png`), boss screens, and the main menu.

### 📜 Character Select Menu & Active Item Sheet Compositing
* **Automatic `charactermenu.png` Compositing**: Seamlessly embeds custom nameplates, 48x48 character portraits, and starting active item icons with handwritten item labels onto the character paper.
* **ANM2 Animation Exporter**: Generates complete, crash-proof XML animation files:
  * `charactermenu.anm2` & `charactermenualt.anm2` (Dynamic Life, Speed, and Damage paper bars + Active Item layer)
  * `characterportraits.anm2` (Select screen character portrait)
  * `coop menu.anm2` (Co-op character selection)
  * `death screen.anm2` (Death note paper)

### 🎒 Comprehensive Loadout & Item Catalog
* **Complete Collectibles & Trinkets Database**: Search, filter, and equip all 732+ collectibles, 189+ trinkets, and pocket items.
* **Item Quality & Pool Filters**: Filter collectibles by Quality (`0` to `4`) and item pools (*Treasure*, *Devil*, *Angel*, *Shop*, *Secret*, *Planetarium*, *Boss*, *Golden Chest*, *Curse*, *Ultra Secret*).
* **Active Items & Pocket Slots**: Configure starting active items with charge meters, battery synergies, and dedicated Repentance pocket slots (Pills, Cards, Runes, or Tainted pocket actives).
* **Modded Item Support**: Automatically scans and indexes custom items from subscribed Steam Workshop mods and local mod folders with automated Lua fallback hooks.
* **Item Stacking**: Set custom quantities for starting items (e.g. `3x The Sad Onion`).
* **Rich Popover Tooltips**: Inspect damage formulas, tear multipliers, and mechanics with dual-language support (English & French).

### 📜 Custom Birthright & Synergy Matrix
* **Custom Birthright Mechanics**: Author character-specific Birthright abilities and descriptions with automated Lua callbacks triggered upon picking up Birthright (#619).
* **Interactive Synergy Matrix**: Configure and test synergy behaviors with major items (*Brimstone*, *Mom's Knife*, *Tech X*, *Ipecac*, *C Section*, *Ludovico Technique*, *Polyphemus*).

### 🎲 Procedural Character Randomizer
* **Themed Archetypes**: Generate randomized balanced builds across themes (*Unholy Demon*, *Angelic*, *Cyborg / Tech*, *Poison / Rotten*, *Speedster*, *Glass Cannon*, *Tank*, *Gambling / Greed*, *Dual Twins*).
* **Difficulty Scaling**: Choose between *Easy*, *Normal*, *Hardcore*, and *Chaos* generation modes.

### 👥 Interactive Character Roster Hub
* **Visual Character Gallery**: Browse all custom characters with live sprite heads, stat summaries, and equipped item badges.
* **One-Click Enable / Disable Switch**: Instantly toggle mods active or disabled via `disable.it` without deleting files.
* **Character Management**: Duplicate existing characters, edit loadouts on the fly, or safely delete mods.
* **Standalone ZIP Mod Export**: Export individual or bundled mods as `.zip` packages ready for sharing or Steam Workshop upload.

### 🚀 One-Click Mod Exporter & Steam Integration
* **Auto-Discovery & Deep Path Scanner**: Automatically locates your Isaac installation, Documents mod folder, and Steam Workshop directories across all drives.
* **Built-in Resource Extractor**: Direct runner for Isaac's official `ResourceExtractor.exe` to extract game assets, textures, and sprites into the studio.
* **Standalone Mod Packaging**: Exports clean, isolated mod packages directly into `The Binding of Isaac Rebirth/mods/`.
* **Zero Vanilla Overwrite**: 100% non-invasive mod creation that keeps your core game files completely safe and untouched.
* **Lua & XML Auto-Generation**: Automatically writes safe `players.xml`, `metadata.xml`, and production-ready `main.lua` with Repentance callbacks (`MC_POST_PLAYER_INIT`, `MC_EVALUATE_CACHE`, `MC_POST_NEW_ROOM`, `MC_USE_ITEM`, pocket slot handlers, twin synchronization, and Birthright hooks).

### 🌐 Localization & Zero-Install Architecture
* **Full Bilingual Interface**: Switch seamlessly between **English** and **French (Français)** with zero page reloads.
* **Zero-Install Standalone**: Pre-bundled portable Node.js runtime with single-click `.bat` launcher.
* **Automatic Browser & Heartbeat Watchdog**: Automatically launches the studio in your default browser and cleanly shuts down the background server when the tab/window is closed.

---

## 📦 Download & Quick Start

### Standalone Release (No Installation Required)
1. Download **`IsaacCharacterStudio-v0.6.zip`** from the [Releases](https://github.com/) page.
2. Extract the ZIP archive anywhere on your PC.
3. Double-click **`Launch-IsaacStudio.bat`**.
4. The studio will automatically launch in your default web browser!

---

## 🛠️ Requirements & Compatibility

* **OS**: Windows 10 / 11 (64-bit)
* **Game**: *The Binding of Isaac: Repentance* or *The Binding of Isaac: Repentance+* (Steam)
* **Runtime**: Portable Node.js runtime is pre-bundled in the standalone ZIP release!

## 🙏 Acknowledgements

* **Edmund McMillen & Nicalis** for creating *The Binding of Isaac*.
* Special thanks to the Isaac Modding Community for documentation, sprites, and animation formats.
