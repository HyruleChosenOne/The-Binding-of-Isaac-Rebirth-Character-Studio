> [!NOTE]
> **Early Implementation:** Work is currently ongoing for menu/boss portraits and stat calibration.

# 🩸 Isaac Character Studio (v0.6)

[![Release](https://img.shields.io/badge/Release-v0.6.0-crimson.svg?style=for-the-badge)](https://github.com/)
[![Platform](https://img.shields.io/badge/Platform-Windows-0078D6.svg?style=for-the-badge&logo=windows)](https://github.com/)
[![Game Version](https://img.shields.io/badge/Game-The_Binding_of_Isaac:_Repentance_%2F_Repentance%2B-darkred.svg?style=for-the-badge)](https://store.steampowered.com/app/250900/)
[![License](https://img.shields.io/badge/License-MIT-gold.svg?style=for-the-badge)](LICENSE)

> **The ultimate visual character creator, loadout editor, and one-click mod generator for *The Binding of Isaac: Repentance* and *Repentance+*.**  
> Design custom characters, fine-tune starting stats, pick custom collectibles, and export fully functional standalone mods without writing a single line of XML or Lua!

---

## ✨ Features Overview

### 🎨 Visual Character Designer & Palette Studio
* **Live In-Game HUD Preview**: Real-time visualization of health containers (Red Hearts, Soul Hearts, Black Hearts, Bone Hearts, Broken Hearts), authentic HUD pickup counters (Keys, Bombs, Coins), and base stats.
* **Palette Hue & Lighting Engine**: Non-destructive live recoloring with sliders for **Hue (0–360°)**, **Saturation**, **Brightness**, and **Contrast**.
* **One-Click Palette Presets**: Instantly apply iconic themes including *Ghost (The Lost)*, *Shadow Demon*, *Blue Baby (Corpse)*, *Crimson Blood*, *Toxic Rotten*, *Void / Abyss*, and *Golden Greed*.
* **Custom Spritesheet & Portrait Uploads**: Drag and drop custom PNG spritesheets and stage portraits with instant preview rendering.
* **Archetype Toggles**: Configure Flight (`flying="true"`), Tear Shooting (`canShoot="true/false"`), Tainted Character variations, and Eden Random Outfits.

### ✍️ Authentic Handwritten In-Game Typography
* **Isaac Font Nameplate Engine**: Type any character name to dynamically generate in-game handwritten nameplates.
* **Stage & Menu Integration**: Automatically builds name assets for stage transitions (`playername_*.png`), boss screens, and the main menu.

### 📜 Character Select Menu & Active Item Sheet Compositing
* **Automatic `charactermenu.png` Compositing**: Seamlessly embeds custom nameplates, 48x48 character portraits, and starting active item icons with handwritten item labels onto the character paper.
* **ANM2 Animation Exporter**: Generates complete, crash-proof XML animation files:
  * `charactermenu.anm2` & `charactermenualt.anm2` (Dynamic Life, Speed, and Damage paper bars + Active Item layer)
  * `characterportraits.anm2` (Select screen character portrait)
  * `coop menu.anm2` (Co-op character selection)
  * `death screen.anm2` (Death note paper)

### 🎒 Comprehensive Loadout & Item Catalog
* **Complete Collectibles & Trinkets Database**: Search, filter, and equip all 722+ collectibles, 189 trinkets, and pocket items.
* **Modded Item Support**: Automatically scans and indexes custom items from subscribed Steam Workshop mods and local mod folders.
* **Item Stacking**: Set custom quantities for starting items (e.g. `3x The Sad Onion`).
* **Rich Popover Tooltips**: Inspect damage formulas, tear multipliers, and mechanics with dual-language support (English & French).

### 🚀 One-Click Mod Exporter & Steam Integration
* **Auto-Discovery**: Automatically locates your Isaac installation and Steam Workshop directories.
* **Standalone Mod Packaging**: Exports clean, isolated mod packages directly into `The Binding of Isaac Rebirth/mods/`.
* **Zero Vanilla Overwrite**: 100% non-invasive mod creation that keeps your core game files completely safe and untouched.
* **Lua & XML Auto-Generation**: Automatically writes safe `players.xml`, `main.lua` cache evaluation callbacks, and `metadata.xml`.

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
