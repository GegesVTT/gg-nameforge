/**
 * GG Nameforge — Magic item generator.
 *
 * Builds an item name from a pattern, plus a type, rarity and a short
 * narrative flavor suggestion. Localized EN/ES with correct Spanish gender
 * agreement (adjective <-> noun) and "de el" -> "del" contraction.
 */

// Spanish nouns carry grammatical gender for agreement: "m" | "f".
const ITEM_DATA = {
  en: {
    types: {
      weapon:   { nouns: ["Blade", "Axe", "Hammer", "Dagger", "Spear", "Mace", "Bow"], icon: "fa-solid fa-khanda" },
      armor:    { nouns: ["Plate", "Mail", "Shield", "Bulwark", "Aegis", "Hauberk"],   icon: "fa-solid fa-shield-halved" },
      potion:   { nouns: ["Draught", "Elixir", "Philter", "Tonic", "Brew"],            icon: "fa-solid fa-flask" },
      ring:     { nouns: ["Ring", "Band", "Signet", "Loop"],                            icon: "fa-solid fa-ring" },
      wand:     { nouns: ["Wand", "Rod", "Scepter", "Baton"],                           icon: "fa-solid fa-wand-magic-sparkles" },
      scroll:   { nouns: ["Scroll", "Tome", "Codex", "Parchment"],                      icon: "fa-solid fa-scroll" },
      wondrous: { nouns: ["Amulet", "Cloak", "Boots", "Gauntlets", "Orb", "Lantern", "Mirror"], icon: "fa-solid fa-hat-wizard" }
    },
    adjectives: ["Ancient", "Burning", "Whispering", "Frozen", "Radiant", "Shadowed", "Vengeful", "Sacred", "Cursed", "Gleaming", "Howling", "Eternal", "Forgotten", "Bloodbound"],
    effects: ["Embers", "the Tides", "Whispers", "the Fallen Star", "Storms", "the Deep", "Ash", "the First Dawn", "Silence", "the Wyrm", "Frost", "the Veil", "Thorns", "the Moon"],
    flavors: ["faintly warm to the touch", "hums when danger is near", "whispers names of the dead", "leaves frost on whatever it rests upon", "glows brighter in darkness", "feels heavier when you lie", "smells of rain and old stone", "shows brief visions of the past", "is never quite where you left it", "grows cold around the unworthy"]
  },
  es: {
    types: {
      weapon:   { nouns: [["Espada","f"],["Hacha","f"],["Martillo","m"],["Daga","f"],["Lanza","f"],["Maza","f"],["Arco","m"]], icon: "fa-solid fa-khanda" },
      armor:    { nouns: [["Coraza","f"],["Malla","f"],["Escudo","m"],["Bastión","m"],["Égida","f"],["Loriga","f"]],           icon: "fa-solid fa-shield-halved" },
      potion:   { nouns: [["Brebaje","m"],["Elixir","m"],["Filtro","m"],["Tónico","m"],["Poción","f"]],                        icon: "fa-solid fa-flask" },
      ring:     { nouns: [["Anillo","m"],["Sortija","f"],["Sello","m"],["Aro","m"]],                                           icon: "fa-solid fa-ring" },
      wand:     { nouns: [["Varita","f"],["Vara","f"],["Cetro","m"],["Bastón","m"]],                                           icon: "fa-solid fa-wand-magic-sparkles" },
      scroll:   { nouns: [["Pergamino","m"],["Tomo","m"],["Códice","m"],["Manuscrito","m"]],                                   icon: "fa-solid fa-scroll" },
      wondrous: { nouns: [["Amuleto","m"],["Capa","f"],["Botas","f"],["Guanteletes","m"],["Orbe","m"],["Linterna","f"],["Espejo","m"]], icon: "fa-solid fa-hat-wizard" }
    },
    // [masculine, feminine] so the adjective agrees with the noun's gender.
    adjectives: [["Ancestral","Ancestral"],["Ardiente","Ardiente"],["Susurrante","Susurrante"],["Helado","Helada"],["Radiante","Radiante"],["Sombrío","Sombría"],["Vengativo","Vengativa"],["Sagrado","Sagrada"],["Maldito","Maldita"],["Reluciente","Reluciente"],["Aullante","Aullante"],["Eterno","Eterna"],["Olvidado","Olvidada"],["Sangrevinculado","Sangrevinculada"]],
    // Effects carry the leading article so we can contract "de el" -> "del".
    effects: ["las Brasas", "las Mareas", "los Susurros", "la Estrella Caída", "las Tormentas", "las Profundidades", "la Ceniza", "el Primer Alba", "el Silencio", "el Wyrm", "la Escarcha", "el Velo", "las Espinas", "la Luna"],
    flavors: ["levemente cálido al tacto", "zumba cuando el peligro acecha", "susurra nombres de los muertos", "deja escarcha sobre lo que toca", "brilla más en la oscuridad", "pesa más cuando mientes", "huele a lluvia y piedra vieja", "muestra breves visiones del pasado", "nunca está donde lo dejaste", "se enfría cerca de los indignos"]
  }
};

const RARITIES = ["common", "uncommon", "rare", "veryRare", "legendary"];
const RARITY_WEIGHTS = [40, 30, 18, 9, 3];
const RARITY_TOTAL = RARITY_WEIGHTS.reduce((a, b) => a + b, 0);
const DND5E_RARITY = { common: "common", uncommon: "uncommon", rare: "rare", veryRare: "veryRare", legendary: "legendary" };

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function weightedRarity() {
  let r = Math.random() * RARITY_TOTAL;
  for (let i = 0; i < RARITIES.length; i++) {
    r -= RARITY_WEIGHTS[i];
    if (r <= 0) return RARITIES[i];
  }
  return "common";
}

/** Contract Spanish "de el X" -> "del X". Leaves "de la / de los / de las" intact. */
function withPreposition(effect) {
  if (/^el\s/i.test(effect)) return `del ${effect.slice(3)}`;
  return `de ${effect}`;
}

function buildNameEn(adj, noun, effect) {
  return Math.random() < 0.5 ? `${noun} of ${effect}` : `The ${adj} ${noun}`;
}

function buildNameEs(adjPair, nounPair, effect) {
  const [noun, gender] = nounPair;
  const adj = gender === "f" ? adjPair[1] : adjPair[0];
  return Math.random() < 0.5
    ? `${noun} ${adj}`
    : `${noun} ${withPreposition(effect)}`;
}

/**
 * Generate a magic item descriptor.
 * @param {string} lang  "en" | "es"
 * @param {string} [type]   one of the type keys, or null for random
 */
export function generateItem(lang = "en", type = null) {
  const isEs = lang === "es";
  const data = isEs ? ITEM_DATA.es : ITEM_DATA.en;
  const typeKey = type && data.types[type] ? type : pick(Object.keys(data.types));
  const typeDef = data.types[typeKey];
  const nounEntry = pick(typeDef.nouns);
  const adjEntry = pick(data.adjectives);
  const effect = pick(data.effects);
  const rarity = weightedRarity();

  const name = isEs
    ? buildNameEs(adjEntry, nounEntry, effect)
    : buildNameEn(adjEntry, nounEntry, effect);

  return {
    name,
    type: typeKey,
    typeNoun: isEs ? nounEntry[0] : nounEntry,
    icon: typeDef.icon,
    rarity,
    dnd5eRarity: DND5E_RARITY[rarity],
    flavor: pick(data.flavors)
  };
}

export { RARITIES };
