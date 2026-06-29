<div align="center">
  <img src="assets/logo.webp" alt="GG Nameforge" width="180">

  # GG Nameforge

  **Fast NPC & magic item name generator for Foundry VTT v12–v14**

  Improvise on the spot. Generate authentic names by race and culture, with quick NPC details and one-click actor/item creation. Zero dependencies. By **Geges**.

  ![Foundry v12](https://img.shields.io/badge/Foundry-v12-green)
  ![Foundry v13](https://img.shields.io/badge/Foundry-v13-green)
  ![Foundry v14](https://img.shields.io/badge/Foundry-v14-green)
  ![License: MIT](https://img.shields.io/badge/License-MIT-yellow)

  **English** · [Español](#-español)
</div>

---

Never freeze when a player talks to the tavern keeper you didn't name. GG Nameforge gives GMs instant, flavorful NPC and magic item names with a single click.

## ✨ Features

- **NPC names by race & culture**: Human, Elf, Dwarf, Halfling, Orc, Tiefling, Dragonborn, Gnome
- **Gender control**: male, female, neutral, or random
- **Quick NPC details**: race, occupation and a personality trait at a glance
- **One-click NPC actor**: creates an Actor with randomized stats on D&D 5e, or a clean basic actor on any other system
- **Magic item generator**: name + type (weapon, armor, potion, ring, wand, scroll, wondrous) + rarity + a narrative flavor hint
- **One-click item**: creates a D&D 5e Item of the right type and rarity, with an agnostic fallback elsewhere
- **Hybrid name engine**: hand-curated lists for authenticity, with an endless syllable engine as backup
- **Two views**: single result with a re-roll, or a list of eight at once
- **Bilingual**: full English and Spanish, including Spanish name pools
- Zero dependencies

## 📦 Installation

In Foundry: **Add-on Modules → Install Module** and search for `GG Nameforge`, or paste the manifest URL:

```
https://github.com/GegesVTT/gg-nameforge/releases/latest/download/module.json
```

## 🔌 API

```js
const nf = game.modules.get("gg-nameforge").api;
nf.open();                                  // open the generator
nf.npc({ race: "elf", gender: "female" });  // generate an NPC descriptor
nf.item("en", "wand");                       // generate a magic item
nf.createNPC(nf.npc({ race: "orc" }));       // generate + create the actor
```

## 🏷️ Keywords

name generator · NPC generator · random names · magic items · GM tools · improvisation · D&D 5e · fantasy names · quality of life

## 📜 License

MIT — © Geges

<br>

---

<div align="center">

  ## 🇪🇸 Español

</div>

**Generador rápido de nombres de PNJ y objetos mágicos para Foundry VTT v12–v14.** Improvisá al instante: generá nombres auténticos por raza y cultura, con datos rápidos de PNJ y creación de actor/objeto con un clic. Sin dependencias. Por **Geges**.

Nunca más te quedes en blanco cuando un jugador le habla al posadero que no nombraste. GG Nameforge te da nombres de PNJ y objetos mágicos al instante con un solo clic.

### ✨ Características

- **Nombres de PNJ por raza y cultura**: Humano, Elfo, Enano, Mediano, Orco, Tiflin, Dracónido, Gnomo
- **Control de género**: masculino, femenino, neutro o aleatorio
- **Datos rápidos de PNJ**: raza, ocupación y un rasgo de personalidad de un vistazo
- **Actor PNJ con un clic**: crea un Actor con stats randomizadas en D&D 5e, o un actor básico limpio en cualquier otro sistema
- **Generador de objetos mágicos**: nombre + tipo (arma, armadura, poción, anillo, varita, pergamino, maravilloso) + rareza + un toque narrativo sugerido
- **Objeto con un clic**: crea un Item de D&D 5e del tipo y rareza correctos, con respaldo agnóstico en otros sistemas
- **Motor híbrido de nombres**: listas curadas a mano para autenticidad, con un motor de sílabas infinito como respaldo
- **Dos vistas**: resultado individual con regenerar, o lista de ocho a la vez
- **Bilingüe**: inglés y español completos, incluidos pools de nombres en español
- Sin dependencias

### 📦 Instalación

En Foundry: **Módulos Complementarios → Instalar Módulo** y buscá `GG Nameforge`, o pegá la URL del manifiesto:

```
https://github.com/GegesVTT/gg-nameforge/releases/latest/download/module.json
```

### 🏷️ Palabras clave

generador de nombres · generador de PNJ · nombres aleatorios · objetos mágicos · herramientas de DM · improvisación · D&D 5e · nombres de fantasía

### 📜 Licencia

MIT — © Geges
