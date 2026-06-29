/**
 * GG Nameforge — Syllable engine.
 *
 * Generates names by combining race-specific phoneme parts (onset + nucleus +
 * coda patterns). Used as an endless fallback when curated lists run dry or
 * when the user keeps rolling. Each race has a distinct sound profile so
 * syllable-built names still "feel" like that race.
 */

const PHONEMES = {
  human:      { start: ["Al", "Br", "Ce", "Dor", "Ed", "Gar", "Har", "Jor", "Mar", "Rol", "Tob", "Wil"], mid: ["a", "e", "i", "o", "an", "en", "ar"], end: ["ic", "on", "ric", "us", "win", "mund", "ett", "and"] },
  elf:        { start: ["Ae", "Cae", "Ere", "Fae", "Ga", "Ia", "Lau", "Sov", "Tha", "Va"], mid: ["la", "li", "le", "ria", "nia", "vel", "ly"], end: ["nn", "th", "riel", "dil", "los", "var", "wen", "ion"] },
  dwarf:      { start: ["Adr", "Ba", "Dar", "Eb", "Gar", "Har", "Mor", "Rur", "Thor", "Von"], mid: ["a", "o", "u", "ra", "gr", "or"], end: ["ik", "rak", "erk", "ain", "bek", "gran", "din", "dal"] },
  halfling:   { start: ["Al", "Ca", "El", "Ga", "Ly", "Mi", "Os", "Ros", "Wel"], mid: ["a", "e", "o", "i", "el"], end: ["ton", "de", "don", "ret", "lo", "born", "coe", "by"] },
  orc:        { start: ["Den", "Gr", "Hol", "Im", "Ke", "Kru", "Ron", "Tho", "Zur", "Mog"], mid: ["a", "o", "u", "ag", "ug"], end: ["ch", "sk", "g", "th", "kk", "nt", "rg", "ash"] },
  tiefling:   { start: ["Ak", "Bar", "Dam", "Ia", "Kai", "Leu", "Mel", "Mor", "Ska", "The"], mid: ["a", "e", "i", "ai", "ako", "ele"], end: ["os", "kas", "kos", "ron", "ech", "dai", "mos", "rai"] },
  dragonborn: { start: ["Arj", "Bal", "Don", "Ghe", "Hes", "Kri", "Med", "Nad", "Pan", "Tar"], mid: ["a", "ha", "as", "es", "an", "dra"], end: ["han", "sar", "aar", "sh", "kan", "iv", "rash", "hun"] },
  gnome:      { start: ["Bod", "Dim", "Fon", "Ger", "Jeb", "Nam", "Roon", "See", "War", "Zo"], mid: ["dy", "bo", "kin", "foo", "ee", "wy"], end: ["nock", "ble", "kin", "dle", "bo", "dar", "ok", "n"] }
};

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** Generate a single given name from a race's phoneme set. */
export function syllableName(race) {
  const p = PHONEMES[race] ?? PHONEMES.human;
  const parts = [pick(p.start)];
  // 30% chance of an extra middle syllable for length variety.
  if (Math.random() < 0.45) parts.push(pick(p.mid));
  parts.push(pick(p.end));
  return cap(parts.join("").toLowerCase());
}
