/**
 * GG Nameforge — NPC generator.
 * Assembles a full NPC descriptor (name, race, gender, occupation, trait)
 * from curated pools, falling back to the syllable engine for endless names.
 */

import { NAME_DATA, NPC_FLAVOR, RACES } from "./names-data.mjs";
import { syllableName } from "./syllables.mjs";

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** Resolve the language pool, falling back to English if a race lacks the lang. */
function pool(race, lang) {
  const r = NAME_DATA[race] ?? NAME_DATA.human;
  return r[lang] ?? r.en;
}

/**
 * Generate a given name for race/gender/lang.
 * 70% curated when available, otherwise syllable-built; neutral falls back to
 * either gender pool if a dedicated neutral list is thin.
 */
export function generateGivenName(race, gender = "male", lang = "en") {
  const p = pool(race, lang);
  let list = p[gender];
  if (!list || list.length < 3) {
    // Blend male+female if the requested gender pool is too small.
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
 * @param {object} opts { race, gender, lang, withSurname }
 */
export function generateNPC({ race = "human", gender = "male", lang = "en", withSurname = true } = {}) {
  if (race === "random") race = pick(RACES);
  if (gender === "random") gender = pick(["male", "female", "neutral"]);

  const given = generateGivenName(race, gender, lang);
  const surname = withSurname ? generateSurname(race, lang) : "";
  const flavor = NPC_FLAVOR[lang] ?? NPC_FLAVOR.en;

  return {
    name: surname ? `${given} ${surname}` : given,
    given,
    surname,
    race,
    gender,
    occupation: pick(flavor.occupations),
    trait: pick(flavor.traits)
  };
}

export { RACES };
