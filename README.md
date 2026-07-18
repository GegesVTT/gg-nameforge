<p align="center">
  <img src="https://raw.githubusercontent.com/GegesVTT/gg-nameforge/main/assets/logo.webp" width="120" alt="GG Nameforge">
</p>

<h1 align="center">GG Nameforge</h1>

<p align="center">
  <strong>Improvise NPCs on the spot — with real gear from your own compendiums</strong><br>
  Names by race & culture · one-click <strong>NPC actors</strong> · <strong>magic items</strong> · zero dependencies
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Foundry-v12-green" alt="Foundry v12">
  <img src="https://img.shields.io/badge/Foundry-v13-green" alt="Foundry v13">
  <img src="https://img.shields.io/badge/Foundry-v14-green" alt="Foundry v14">
  <img src="https://img.shields.io/badge/D%26D-5e-red" alt="D&D 5e">
  <img src="https://img.shields.io/badge/System-agnostic%20fallback-blue" alt="System agnostic fallback">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License: MIT">
  <img src="https://img.shields.io/github/v/release/GegesVTT/gg-nameforge" alt="Latest Release">
</p>

<p align="center"><strong>English</strong> · <a href="#-español">Español</a></p>

---

A player walks up to the tavern keeper you never named. GG Nameforge gives you a name, a face and a stat block before the silence gets awkward.

## ✨ Features

- **Names by race & culture** — Human, Elf, Dwarf, Halfling, Orc, Tiefling, Dragonborn, Gnome. Hand-curated pools for authenticity, with an endless syllable engine behind them so you never run dry.
- **One-click NPC actor** — pick an archetype and a CR, get a working actor. On D&D 5e it comes with abilities, HP and AC scaled to the challenge; on any other system, a clean basic actor.
- **Built from your compendiums, not from thin air** *(v1.3)* — the NPC is equipped with **real items and real creature features** pulled from whatever compendiums you have installed: a bandit gets studded leather and **Sneak Attack**, a guard gets a spear and **Pack Tactics**, an occultist gets a staff, **Magic Resistance** and actual spells with working slots. Nothing is invented; nothing is a placeholder.
- **Magic item generator** — name + type + rarity + a narrative hint. On D&D 5e it can **reskin a real SRD magic item**: your players get the mechanics of a known item under a name they've never heard.
- **Two views** — a single result with a re-roll, or eight at once when you want to browse.
- **Honest about gaps** — if something isn't in your compendiums, the module says so on screen instead of silently handing you a naked NPC.
- **Bilingual** — full English and Spanish, including Spanish name pools.
- **Zero dependencies.**

### 🎲 What each archetype brings

| Archetype | Gear | Creature feature | Casts? |
|---|---|---|---|
| **Guard** | spear, shield, chain shirt | Pack Tactics | — |
| **Bandit** | scimitar, dagger, studded leather | Sneak Attack | — |
| **Warrior** | greatsword / longsword, plate | Multiattack *(CR 3+)* | — |
| **Priest** | mace, chain mail, holy symbol | — | divine |
| **Mage** | quarterstaff, dagger | — | arcane |
| **Occultist** | quarterstaff, sickle | Magic Resistance *(CR 3+)* | primal |

Gear scales with CR, and magic variants are kept out of mundane slots — a CR 1/4 bandit will never spawn wearing *Studded Leather +3*.

## 📦 Installation

In Foundry: **Add-on Modules → Install Module**, search for `GG Nameforge`, or paste the manifest URL:

```
https://github.com/GegesVTT/gg-nameforge/releases/latest/download/module.json
```

## 🚀 Usage

Click the **anvil** in the scene controls, or run the API from a macro.

- **Names tab** — race, gender, with or without surname. Re-roll until one clicks.
- **NPC tab** — race, gender, archetype, CR → **Create Actor**. The actor lands in your sidebar, ready to drop on the scene.
- **Item tab** — type and rarity → **Create Item**.

## 🔌 Macro API

```js
const api = game.modules.get("gg-nameforge").api;

api.open();                                        // open the forge
api.npcName({ race: "elf", gender: "female" });    // just a name
api.itemName({ type: "wand", rarity: "rare" });    // just an item name
await api.createNPC({ archetype: "bandit", cr: "cr1" });  // full actor
```

## ✅ Compatibility

- Foundry VTT **v12–v14**.
- **D&D 5e** — full kit assembly (verified on 5.2.4). Compendium discovery is dynamic: system packs first, world packs second, module packs last, so an NPC never ends up holding a sample item from some automation module.
- **Any other system** — names and items still work; actors are created as clean basics without a kit.
- Compendium matching currently uses **English item names** (the D&D 5e SRD packs). Translation modules that rename items in place may reduce what the kit finds — see the roadmap.

## 🛠️ Technical notes

- **Nothing is hardcoded to a specific compendium.** The kit discovers Item packs at runtime and indexes them once per session, so it works with the SRD, with your homebrew packs, and with whatever you install later.
- Spellcasters get a **coherent spellbook**: the requested CR sets caster level and real full-caster slots, each archetype pulls from a themed SRD list (an occultist curses, a cleric heals), an attack cantrip is always guaranteed, and no slot level is ever left without a spell. Worlds with translated compendiums fall back to level + school matching, which is language-independent.
- Creature features come from `dnd5e.monsterfeatures` as real feat items, so they carry their own descriptions and mechanics.
- NPC casters get their casting ability and spell slot overrides set, so embedded spells are actually castable rather than decorative.
- Every data-model path uses optional chaining: a future system version changing a structure should degrade to a missing field, not a broken module.

## 🧭 Roadmap

- **Flavor tables** — mannerisms, physical details, quirks and conversation hooks, chosen to fit the NPC's race and archetype rather than rolled blind. Bilingual, original content.
- **Bring your own tables** — point the module at any Foundry RollTable you own for each flavor category.
- **Better compendium matching** for worlds running translation modules.
- Playing something else? [Open an issue](https://github.com/GegesVTT/gg-nameforge/issues).

## 🏷️ Keywords

NPC generator · name generator · random names · fantasy names · magic items · stat block · improvisation · GM tools · D&D 5e · dnd5e · compendium · SRD · Foundry VTT

## 📜 License

MIT — © Geges

Part of the **GegesVTT** family: [GG Sheet Export](https://github.com/GegesVTT/gg-sheet-export) · [GG Calendar](https://github.com/GegesVTT/gg-calendar)

---

## 🇪🇸 Español

**Improvisá PNJs al instante — con equipo real de tus propios compendios.** Nombres por raza y cultura · **actores** de un clic · **objetos mágicos** · sin dependencias.

Un jugador se acerca al posadero que nunca nombraste. GG Nameforge te da un nombre, una cara y un stat block antes de que el silencio se ponga incómodo.

### ✨ Características

- **Nombres por raza y cultura** — Humano, Elfo, Enano, Mediano, Orco, Tiefling, Dracónido, Gnomo. Listas curadas a mano para que suenen auténticos, con un motor de sílabas detrás para que nunca se agoten.
- **Actor de PNJ en un clic** — elegís arquetipo y CR, y sale un actor funcional. En D&D 5e viene con características, PG y CA escalados al desafío; en cualquier otro sistema, un actor básico limpio.
- **Armado con tus compendios, no inventado** *(v1.3)* — el PNJ se equipa con **ítems y rasgos de criatura reales** sacados de los compendios que tengas instalados: el bandido lleva cuero tachonado y **Ataque Furtivo**, el guardia lanza y **Tácticas de Manada**, el ocultista bastón, **Resistencia a la Magia** y conjuros de verdad con sus espacios funcionando. Nada es inventado ni un marcador de posición.
- **Generador de objetos mágicos** — nombre + tipo + rareza + una pista narrativa. En D&D 5e puede **revestir un objeto mágico real del SRD**: tus jugadores reciben las mecánicas de un objeto conocido bajo un nombre que nunca escucharon.
- **Dos vistas** — un resultado con re-tirada, u ocho de una cuando querés elegir.
- **Honesto con lo que falta** — si algo no está en tus compendios, el módulo te lo dice en pantalla en vez de entregarte un PNJ desnudo en silencio.
- **Bilingüe** — inglés y español completos, con listas de nombres en español.
- **Sin dependencias.**

### 🎲 Qué trae cada arquetipo

| Arquetipo | Equipo | Rasgo de criatura | ¿Lanza? |
|---|---|---|---|
| **Guardia** | lanza, escudo, camisa de malla | Tácticas de Manada | — |
| **Bandido** | cimitarra, daga, cuero tachonado | Ataque Furtivo | — |
| **Guerrero** | espadón / espada larga, placas | Multiataque *(CR 3+)* | — |
| **Sacerdote** | maza, cota de malla, símbolo sagrado | — | divina |
| **Mago** | bastón, daga | — | arcana |
| **Ocultista** | bastón, hoz | Resistencia a la Magia *(CR 3+)* | natural |

El equipo escala con el CR, y las variantes mágicas quedan fuera de las ranuras mundanas: un bandido de CR 1/4 nunca va a aparecer con *Cuero Tachonado +3*.

### 📦 Instalación

En Foundry: **Módulos Complementarios → Instalar Módulo**, buscá `GG Nameforge`, o pegá la URL de manifiesto:

```
https://github.com/GegesVTT/gg-nameforge/releases/latest/download/module.json
```

### 🚀 Uso

Clic en el **yunque** de la barra de escena, o llamá a la API desde una macro.

- **Pestaña Nombres** — raza, género, con o sin apellido. Re-tirá hasta que uno te cierre.
- **Pestaña PNJ** — raza, género, arquetipo, CR → **Crear Actor**. Aparece en la barra lateral, listo para arrastrar a la escena.
- **Pestaña Objeto** — tipo y rareza → **Crear Objeto**.

### 🔌 API para macros

```js
const api = game.modules.get("gg-nameforge").api;

api.open();                                        // abre la forja
api.npcName({ race: "elf", gender: "female" });    // solo un nombre
api.itemName({ type: "wand", rarity: "rare" });    // solo un nombre de objeto
await api.createNPC({ archetype: "bandit", cr: "cr1" });  // actor completo
```

### ✅ Compatibilidad

- Foundry VTT **v12–v14**.
- **D&D 5e** — ensamblado completo del kit (verificado en 5.2.4). El descubrimiento de compendios es dinámico: primero los del sistema, después los del mundo, y los de módulos al final, así un PNJ nunca termina con un ítem de prueba de algún módulo de automatización.
- **Cualquier otro sistema** — los nombres y objetos funcionan igual; los actores se crean básicos, sin kit.
- El emparejamiento con compendios usa hoy **nombres en inglés** (los packs del SRD de D&D 5e). Los módulos de traducción que renombran ítems en el lugar pueden reducir lo que el kit encuentra — ver la hoja de ruta.

### 🛠️ Notas técnicas

- **Nada está atado a un compendio específico.** El kit descubre los packs de ítems en tiempo de ejecución y los indexa una vez por sesión: funciona con el SRD, con tus packs caseros y con lo que instales mañana.
- Los lanzadores reciben un **libro de conjuros coherente**: el CR pedido fija el nivel de lanzador y los slots reales de lanzador completo, cada arquetipo bebe de una lista temática del SRD (el ocultista maldice, el clérigo cura), siempre hay un truco de ataque garantizado y ningún nivel de slot queda sin conjuro. Los mundos con compendios traducidos degradan al emparejamiento por nivel + escuela, que es independiente del idioma.
- Los rasgos de criatura salen de `dnd5e.monsterfeatures` como ítems `feat` reales, así que traen su propia descripción y mecánicas.
- Los PNJ lanzadores reciben característica de lanzamiento y espacios de conjuro configurados: los conjuros embebidos se pueden lanzar de verdad, no son decoración.
- Todas las rutas del data model usan optional chaining: si una versión futura del sistema cambia una estructura, lo esperable es un campo vacío, no un módulo roto.

### 🧭 Hoja de ruta

- **Tablas de sabor** — muletillas, detalles físicos, manías y ganchos de conversación, elegidos según la raza y el arquetipo del PNJ en vez de tirados a ciegas. Bilingües y de contenido original.
- **Traé tus propias tablas** — apuntar el módulo a cualquier RollTable de Foundry que tengas, por categoría.
- **Mejor emparejamiento** para mundos con módulos de traducción.
- ¿Jugás otra cosa? [Abrí un issue](https://github.com/GegesVTT/gg-nameforge/issues).

### 🏷️ Palabras clave

generador de PNJ · generador de nombres · nombres aleatorios · nombres fantásticos · objetos mágicos · stat block · improvisación · herramientas para DM · D&D 5e · dnd5e · compendio · SRD · Foundry VTT

### 📜 Licencia

MIT — © Geges

Parte de la familia **GegesVTT**: [GG Sheet Export](https://github.com/GegesVTT/gg-sheet-export) · [GG Calendar](https://github.com/GegesVTT/gg-calendar)

---

<p align="center"><em>GG Nameforge · GegesVTT · Crónicas Bárdicas</em></p>
