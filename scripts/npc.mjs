/**
 * GG Nameforge — NPC generator.
 * Assembles an NPC descriptor (name, race, gender, archetype, CR) from curated
 * pools. The archetype + CR drive the SRD kit assembly in foundry-create.mjs.
 */

import { NAME_DATA, NPC_FLAVOR, RACES } from "./names-data.mjs";
import { syllableName } from "./syllables.mjs";
import { ARCHETYPE_KEYS, CR_KEYS } from "./srd-kit.mjs";

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
export function generateNPC({
  race = "human", gender = "male", lang = "en", withSurname = true,
  archetype = "guard", cr = "cr1"
} = {}) {
  if (race == null || race === "random") race = pick(RACES);
  if (gender === "random") gender = pick(["male", "female", "neutral"]);
  if (archetype === "random" || !ARCHETYPE_KEYS.includes(archetype)) {
    archetype = pick(ARCHETYPE_KEYS);
  }
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
    occupation: pick(flavor.occupations),
    trait: pick(flavor.traits)
  };
}

export { RACES };
