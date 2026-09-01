# 🩸 Isaac Character Studio

[![Release](https://img.shields.io/badge/Release-v0.8.0-crimson.svg?style=for-the-badge)](https://github.com/)
[![Platform](https://img.shields.io/badge/Platform-Windows-0078D6.svg?style=for-the-badge&logo=windows)](https://github.com/)
[![Game Version](https://img.shields.io/badge/Game-The_Binding_of_Isaac:_Repentance_%2F_Repentance%2B-darkred.svg?style=for-the-badge)](https://store.steampowered.com/app/250900/)
[![License](https://img.shields.io/badge/License-MIT-gold.svg?style=for-the-badge)](LICENSE)

> **The ultimate visual character creator, loadout editor, and one-click mod generator for *The Binding of Isaac: Repentance* and *Repentance+*.**  
> Design custom characters, fine-tune starting stats, pick custom collectibles, and export fully functional standalone mods without writing a single line of XML or Lua!

> Note: this project was made with the use of AI assistance. Some sprites still need additional work and refinement.

---

## ✨ Features Overview

### 👥 Dual Character Engine (Jacob & Esau Archetype)
* **Partnered Duo Support**: Create dual character duos with independent spritesheets, customized partner names, individual starting stats, separate starting health bars, and distinct starting loadouts (passives, active items, trinkets, and pocket items).
* **Dual Health HUD Rendering**: Live bottom-right health HUD rendering in-game for the second character, tracking individual Red, Soul, Black, Bone, Rotten, and Broken hearts.
* **Synchronized In-Game Spawner**: Robust single-instance Lua spawner with automatic position placement adjacent to the primary character and safe engine event hooks.
* **Alt-Path Item Choice Handling**: Built-in support for synchronized double-item pickups in Alt-Path treasure rooms and Birthright passive item duplication mechanics.

### 💀 The Forgotten Archetype
* **Skeletal Warrior Support**: Create characters using The Forgotten archetype with innate bone club melee attacks, bone heart health pools, and tethered soul partner forms.

### 🎨 Visual Character Designer & Palette Studio
* **All 34 Base Characters Supported**: Quick-start templates for all 17 standard characters and all 17 Tainted counterparts.
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
* **Authentic Archetype Generator**: Generate balanced or chaotic characters following authentic Isaac rules (*Classic Red Hearts*, *Soul / Spirit Focus*, *Demonic Black Hearts*, *Bone Hybrid*, *Rotten Health*, *Holy / Eternal*, *Midas Gold*, *Dual Twins*, *Tank / Colossus*, *Fragile Survival*).
* **Custom Synergy Seeding**: Roll guaranteed starting 2-item synergies, pocket actives, and procedurally generated color palettes.
* **Modded Item Integration**: Optionally include scanned modded items in randomized item pools.

### 👥 Interactive Character Roster Hub
* **Visual Character Gallery**: Browse all custom characters with live sprite heads, stat summaries, and equipped item badges.
* **One-Click Enable / Disable Switch**: Instantly toggle mods active or disabled via `disable.it` without deleting files.
* **Character Management**: Duplicate existing characters, edit loadouts on the fly, or safely delete mods.
* **Standalone ZIP Mod Export**: Export individual or bundled mods as `.zip` packages ready for sharing or Steam Workshop upload.

### 🚀 One-Click Mod Exporter & Steam Integration
* **Bundled Vanilla Asset Engine**: Ships with 100% pre-packaged assets for all 34 base characters, 732+ collectible items, 189+ trinkets, cards, runes, souls, and UI HUD hearts for instant standalone performance without probing game files.
* **Auto-Discovery & Deep Path Scanner**: Automatically locates your Isaac installation, Documents mod folder, and Steam Workshop directories across all drives.
* **Opt-In Resource Extractor**: Built-in runner for Isaac's official `ResourceExtractor.exe` available on-demand in settings when fresh live extractions are needed.
* **Standalone Mod Packaging**: Exports clean, isolated mod packages directly into `The Binding of Isaac Rebirth/mods/`.
* **Zero Vanilla Overwrite**: 100% non-invasive mod creation that keeps your core game files completely safe and untouched.
* **Lua & XML Auto-Generation**: Automatically writes safe `players.xml`, `metadata.xml`, and production-ready `main.lua` with Repentance callbacks (`MC_POST_PLAYER_INIT`, `MC_EVALUATE_CACHE`, `MC_POST_NEW_ROOM`, `MC_USE_ITEM`, pocket slot handlers, twin synchronization, and Birthright hooks).

### 🌐 Localization & Zero-Install Architecture
* **Full Bilingual Interface**: Switch seamlessly between **English** and **French (Français)** with zero page reloads.
* **12 Thematic Floor Themes**: Choose between 12 immersive UI palettes inspired by Isaac floor aesthetics (*Basement*, *Caves*, *Depths*, *Womb*, *Sheol*, *Cathedral*, *The Chest*, *Dark Room*, *The Void*, *Corpse*, *Home*, *Mausoleum*).
* **Configurable UI Scaling**: Adjust interface scaling (*Small*, *Normal*, *Large*, *Extra Large*) for optimal readability on any screen resolution.
* **Zero-Install Standalone**: Pre-bundled portable Node.js runtime with single-click `.bat` launcher. Works completely standalone even without an Isaac game directory.
* **Automatic Browser & Heartbeat Watchdog**: Automatically launches the studio in your default browser and cleanly shuts down the background server when the tab/window is closed.

---

## 📦 Download & Quick Start

### Standalone Release (No Installation Required)
1. Download **`IsaacCharacterStudio-v0.8.zip`** from the [Releases](https://github.com/) page.
2. Extract the ZIP archive anywhere on your PC.
3. Double-click **`Launch-IsaacStudio.bat`**.
4. The studio will automatically launch in your default web browser!

---

## 🛠️ Requirements & Compatibility

* **OS**: Windows 10 / 11 (64-bit)
* **Game**: *The Binding of Isaac: Repentance* or *The Binding of Isaac: Repentance+* (Steam)
* **Runtime**: Portable Node.js runtime is pre-bundled in the standalone ZIP release!

## 🧪 Running Tests

```bash
npm test
```

## 🙏 Acknowledgements

* **Edmund McMillen & Nicalis** for creating *The Binding of Isaac*.
* Special thanks to the Isaac Modding Community for documentation, sprites, and animation formats.
