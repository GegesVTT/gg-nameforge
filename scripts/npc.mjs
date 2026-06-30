/**
 * GG Nameforge — NPC generator.
 * Assembles a full NPC descriptor (name, race, gender, occupation, trait,
 * threat tier) from curated pools, falling back to the syllable engine.
 */

import { NAME_DATA, NPC_FLAVOR, RACES } from "./names-data.mjs";
import { syllableName } from "./syllables.mjs";

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Threat tiers map to a target CR and an HP range, so the same generator can
 * produce a harmless commoner or a deadly boss. Used by foundry-create.mjs.
 */
export const THREAT_TIERS = {
  commoner: { cr: 0,   hp: [2, 6],     label: "commoner" },
  minion:   { cr: 0.5, hp: [7, 18],    label: "minion" },
  veteran:  { cr: 3,   hp: [30, 60],   label: "veteran" },
  elite:    { cr: 7,   hp: [90, 140],  label: "elite" },
  boss:     { cr: 13,  hp: [180, 260], label: "boss" }
};
export const THREAT_KEYS = Object.keys(THREAT_TIERS);

function pool(race, lang) {
  const r = NAME_DATA[race] ?? NAME_DATA.human;
  return r[lang] ?? r.en;
}

/**
 * Generate a given name for race/gender/lang.
 * 70% curated when available, otherwise syllable-built.
 */
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
 * @param {object} opts { race, gender, lang, withSurname, threat }
 */
export function generateNPC({ race = "human", gender = "male", lang = "en", withSurname = true, threat = "minion" } = {}) {
  if (race == null || race === "random") race = pick(RACES);
  if (gender === "random") gender = pick(["male", "female", "neutral"]);
  if (!THREAT_TIERS[threat]) threat = "minion";

  const given = generateGivenName(race, gender, lang);
  const surname = withSurname ? generateSurname(race, lang) : "";
  const flavor = NPC_FLAVOR[lang] ?? NPC_FLAVOR.en;

  return {
    name: surname ? `${given} ${surname}` : given,
    given,
    surname,
    race,
    gender,
    threat,
    occupation: pick(flavor.occupations),
    trait: pick(flavor.traits)
  };
}

export { RACES };
