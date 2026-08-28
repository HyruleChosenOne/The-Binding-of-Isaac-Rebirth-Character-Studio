> [!NOTE]
> **Early Implementation:** Work is currently ongoing for menu/boss portraits and stat calibration.

# The Binding of Isaac: Character Studio & Mod Workshop

**Isaac Character Studio** is a standalone, offline desktop creation suite for *The Binding of Isaac: Rebirth* (and all DLCs up to *Repentance+*). It allows players and modders to design, customize, and compile fully functional custom characters and gameplay mods with **zero manual coding**.

---

## Key Features

### 🎨 Visual Character Designer
* **Stat Customization:** Configure baseline attributes including HP, Damage, Speed, Tear Rate, Range, Shot Speed, and Luck.
* **Starting Loadouts:** Assign passives, active items, pocket items, cards/runes, and trinkets.
* **Sprite Management:** Choose base character templates or import custom pixel-art spritesheets.

### 🎬 Automated Asset & Menu Animation Engine
* **Handwritten Nameplate Generator:** Automatically renders character names in *Isaac's* signature hand-drawn style for boss intro screens and stage transitions.
* **`charactermenu.png` & ANM2 Compiler:** Dynamically bakes names, base portraits, and stat bars directly into the character select wheel (`characterportraits.anm2` and `charactermenu.anm2`).

### 🔍 Synergy & Loadout Explorer
* **Complete Item Database:** Searchable catalog covering vanilla items through the latest *Repentance+* synergies.
* **Contextual Tooltips:** Live cursor descriptions, room-pool filters, and test loadout presets.

### 📦 1-Click Mod Exporter
* **Ready-to-Play Output:** Compiles valid structures (`metadata.xml`, `content/players.xml`, `main.lua`, and `resources/gfx/`) directly to your `mods/` directory.
* **Robust Code Generation:** Produces clean Lua scripts with built-in **Birthright** integration and tainted character variant toggles.
