/**
 * GG Nameforge — NPC generator.
 * Assembles an NPC descriptor (name, race, gender, archetype, CR) from curated
 * pools. The archetype + CR drive the SRD kit assembly in foundry-create.mjs.
 */

import { NAME_DATA, NPC_FLAVOR, RACES } from "./names-data.mjs";
import { syllableName } from "./syllables.mjs";
import { generateFlavor } from "./flavor-tables.mjs";
import { pickPrototype } from "./prototypes.mjs";
import { ARCHETYPE_KEYS, CR_KEYS, CR_TIERS } from "./srd-kit.mjs";

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export { ARCHETYPE_KEYS, CR_KEYS };

function pool(race, lang) {
  const r = NAME_DATA[race] ?? NAME_DATA.human;
  return r[lang] ?? r.en;
}

export function generateGivenName(race, gender = "male", lang = "en") {
  const p = pool(race, lang);
  let list = p[gender];
  if (!list || list.length < 3) {
    list = [...(p.male ?? []), ...(p.female ?? [])];
  }
  if (list?.length && Math.random() < 0.7) return pick(list);
  return syllableName(race);
}

export function generateSurname(race, lang = "en") {
  const p = pool(race, lang);
  return p.surnames?.length ? pick(p.surnames) : "";
}

/**
 * Full NPC descriptor.
 * @param {object} opts { race, gender, lang, withSurname, archetype, cr }
 */
/**
 * Descriptor de un PNJ.
 *
 * v2: ya no se elige el arquetipo. Se elige CR, raza y si lanza; el motor busca
 * el stat block oficial más cercano y de AHÍ sale el arquetipo, que solo sirve
 * para elegir el sabor. Un Capitán Bandido habla como bandido porque ES un
 * bandido, no porque alguien lo haya tildado en un desplegable.
 *
 * Es async porque mirar los compendios lo es. La tarjeta muestra qué prototipo
 * salió antes de crear nada.
 */
/* Profesiones compatibles por arquetipo (índices sobre NPC_FLAVOR.occupations,
 * que es paralela EN/ES). Antes se elegía a ciegas y salían bandidos-sacerdotes:
 * "A dragonborn priest, deeply pious" con stat block de Capitán Bandido. */
const OCCUPATIONS_BY_ARCHETYPE = {
  guard:     [4, 13, 0, 5, 9],        // guardia, mercenario, herrero, cazador, marinero
  warrior:   [13, 4, 0, 5, 9],
  bandit:    [8, 13, 9, 5, 3, 16],    // ladrón, mercenario, marinero, cazador, mercader, curtidor
  cleric:    [7, 11, 12, 17],         // sacerdote, sanador, escriba, herborista
  wizard:    [6, 12, 11, 3],          // erudito, escriba, sanador, mercader
  occultist: [17, 11, 5, 6]           // herborista, sanador, cazador, erudito
};

function pickOccupation(occupations, archetype) {
  const idx = OCCUPATIONS_BY_ARCHETYPE[archetype];
  if (!idx) return pick(occupations);
  const compat = idx.map((i) => occupations[i]).filter(Boolean);
  return compat.length ? pick(compat) : pick(occupations);
}

export async function generateNPC({
  race = "human", gender = "male", lang = "en", withSurname = true,
  kind = "martial", cr = "cr1", ruleset = null
} = {}) {
  if (race == null || race === "random") race = pick(RACES);
  if (gender === "random") gender = pick(["male", "female", "neutral"]);
  if (kind === "random") kind = pick(["martial", "caster"]);

  // El setting "Stat block source" existía pero nadie lo leía: siempre corría
  // en "modern" y el "off" no apagaba nada. Ahora manda, salvo override por API.
  if (!ruleset) {
    try { ruleset = game.settings.get("gg-nameforge", "prototypeSource"); }
    catch { ruleset = "modern"; }
  }

  // El prototipo decide el arquetipo. Si no hay ninguno cerca del CR pedido
  // (no existen lanzadores humanoides en CR 1, 4, 8, 9 ni 10), se genera y se
  // elige un arquetipo compatible con el tipo pedido.
  let prototype = null;
  const crValue = CR_TIERS[cr]?.cr ?? 1;
  if (ruleset !== "off") {
    try {
      prototype = await pickPrototype({ cr: crValue, race, kind, RACES, ruleset });
    } catch (e) {
      console.warn("gg-nameforge | falló la búsqueda de prototipo:", e);
    }
  }
  const archetype = prototype?.archetype
    ?? (kind === "caster" ? pick(["cleric", "wizard", "occultist"]) : pick(["guard", "bandit", "warrior"]));
  if (!CR_KEYS.includes(cr)) cr = "cr1";

  const given = generateGivenName(race, gender, lang);
  const surname = withSurname ? generateSurname(race, lang) : "";
  const flavor = NPC_FLAVOR[lang] ?? NPC_FLAVOR.en;

  return {
    name: surname ? `${given} ${surname}` : given,
    given,
    surname,
    race,
    gender,
    archetype,
    cr,
    kind: "npc",
    occupation: pickOccupation(flavor.occupations, archetype),
    trait: pick(flavor.traits),
    // Sabor contextual: se elige según arquetipo y raza, no a ciegas.
    flavor: generateFlavor({ archetype, race, lang }),
    // "kind" ya lo usa la tarjeta para distinguir PNJ de objeto: este va aparte.
    combatKind: kind,
    // null = no había stat block oficial cerca; se genera. La tarjeta lo dice.
    prototype: prototype
      ? { name: prototype.name, cr: prototype.cr, pack: prototype.pack, img: prototype.img }
      : null
  };
}

export { RACES };
