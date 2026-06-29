/**
 * GG Nameforge — Magic item generator.
 *
 * Builds an item name from a pattern (e.g. "<adjective> <noun> of <effect>"),
 * plus a type, rarity and a short narrative flavor suggestion. Localized.
 */

const ITEM_DATA = {
  en: {
    types: {
      weapon: { nouns: ["Blade", "Axe", "Hammer", "Dagger", "Spear", "Mace", "Bow"], icon: "fa-khanda" },
      armor: { nouns: ["Plate", "Mail", "Shield", "Bulwark", "Aegis", "Hauberk"], icon: "fa-shield-halved" },
      potion: { nouns: ["Draught", "Elixir", "Philter", "Tonic", "Brew"], icon: "fa-flask" },
      ring: { nouns: ["Ring", "Band", "Signet", "Loop"], icon: "fa-ring" },
      wand: { nouns: ["Wand", "Rod", "Scepter", "Baton"], icon: "fa-wand-magic-sparkles" },
      scroll: { nouns: ["Scroll", "Tome", "Codex", "Parchment"], icon: "fa-scroll" },
      wondrous: { nouns: ["Amulet", "Cloak", "Boots", "Gauntlets", "Orb", "Lantern", "Mirror"], icon: "fa-hat-wizard" }
    },
    adjectives: ["Ancient", "Burning", "Whispering", "Frozen", "Radiant", "Shadowed", "Vengeful", "Sacred", "Cursed", "Gleaming", "Howling", "Eternal", "Forgotten", "Bloodbound"],
    effects: ["Embers", "the Tides", "Whispers", "the Fallen Star", "Storms", "the Deep", "Ash", "the First Dawn", "Silence", "the Wyrm", "Frost", "the Veil", "Thorns", "the Moon"],
    flavors: ["faintly warm to the touch", "hums when danger is near", "whispers names of the dead", "leaves frost on whatever it rests upon", "glows brighter in darkness", "feels heavier when you lie", "smells of rain and old stone", "shows brief visions of the past", "is never quite where you left it", "grows cold around the unworthy"]
  },
  es: {
    types: {
      weapon: { nouns: ["Espada", "Hacha", "Martillo", "Daga", "Lanza", "Maza", "Arco"], icon: "fa-khanda" },
      armor: { nouns: ["Coraza", "Malla", "Escudo", "Bastión", "Égida", "Loriga"], icon: "fa-shield-halved" },
      potion: { nouns: ["Brebaje", "Elixir", "Filtro", "Tónico", "Poción"], icon: "fa-flask" },
      ring: { nouns: ["Anillo", "Sortija", "Sello", "Aro"], icon: "fa-ring" },
      wand: { nouns: ["Varita", "Vara", "Cetro", "Bastón"], icon: "fa-wand-magic-sparkles" },
      scroll: { nouns: ["Pergamino", "Tomo", "Códice", "Manuscrito"], icon: "fa-scroll" },
      wondrous: { nouns: ["Amuleto", "Capa", "Botas", "Guanteletes", "Orbe", "Linterna", "Espejo"], icon: "fa-hat-wizard" }
    },
    adjectives: ["Ancestral", "Ardiente", "Susurrante", "Helado", "Radiante", "Sombrío", "Vengativo", "Sagrado", "Maldito", "Reluciente", "Aullante", "Eterno", "Olvidado", "Sangrevinculado"],
    effects: ["las Brasas", "las Mareas", "los Susurros", "la Estrella Caída", "las Tormentas", "las Profundidades", "la Ceniza", "el Primer Alba", "el Silencio", "el Wyrm", "la Escarcha", "el Velo", "las Espinas", "la Luna"],
    flavors: ["levemente cálido al tacto", "zumba cuando el peligro acecha", "susurra nombres de los muertos", "deja escarcha sobre lo que toca", "brilla más en la oscuridad", "pesa más cuando mientes", "huele a lluvia y piedra vieja", "muestra breves visiones del pasado", "nunca está donde lo dejaste", "se enfría cerca de los indignos"]
  }
};

const RARITIES = ["common", "uncommon", "rare", "veryRare", "legendary"];
const RARITY_WEIGHTS = [40, 30, 18, 9, 3];
const DND5E_RARITY = { common: "common", uncommon: "uncommon", rare: "rare", veryRare: "veryRare", legendary: "legendary" };

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function weightedRarity() {
  const total = RARITY_WEIGHTS.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < RARITIES.length; i++) {
    r -= RARITY_WEIGHTS[i];
    if (r <= 0) return RARITIES[i];
  }
  return "common";
}

/**
 * Generate a magic item descriptor.
 * @param {string} lang  "en" | "es"
 * @param {string} [type]   one of the type keys, or undefined for random
 */
export function generateItem(lang = "en", type = null) {
  const data = ITEM_DATA[lang] ?? ITEM_DATA.en;
  const typeKey = type && data.types[type] ? type : pick(Object.keys(data.types));
  const typeDef = data.types[typeKey];
  const noun = pick(typeDef.nouns);
  const adj = pick(data.adjectives);
  const effect = pick(data.effects);
  const rarity = weightedRarity();

  // Two naming patterns for variety.
  const ofWord = lang === "es" ? "de" : "of";
  const name = Math.random() < 0.5
    ? `${noun} ${ofWord} ${effect}`            // Blade of Storms
    : `The ${adj} ${noun}`.replace("The ", lang === "es" ? "" : "The ");

  return {
    name: lang === "es" ? `${adj} ${noun} ${ofWord} ${effect}` : name,
    type: typeKey,
    typeNoun: noun,
    icon: typeDef.icon,
    rarity,
    dnd5eRarity: DND5E_RARITY[rarity],
    flavor: pick(data.flavors)
  };
}

export { RARITIES };
