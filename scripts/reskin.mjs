/**
 * GG Nameforge — utilidades de revestido (v2.1).
 *
 * Tres responsabilidades, todas nacidas de probes reales:
 *
 * 1. SANITIZACIÓN — el Capitán Bandido de 2014 dice "The captain makes three
 *    melee attacks" dentro de sus ítems: cualquier jugador que lea la tarjeta
 *    de chat sabe qué es. Los packs de 2024 usan [[lookup @name lowercase]] y
 *    se auto-resuelven; acá se lleva el texto de 2014 al mismo estándar
 *    reemplazando por el nombre generado.
 *
 * 2. CAPA RACIAL MÍNIMA — un dragonborn sin Dracónico y un enano sin visión en
 *    la oscuridad delatan al generador. Idioma + sentidos: barato y verosímil.
 *    No se agregan rasgos mecánicos (aliento, resistencias): eso cambiaría el
 *    CR del stat block oficial.
 *
 * 3. CATEGORÍA FÍSICA — "The Burning Brew" salió siendo un CUENCO de un pie de
 *    diámetro. El sustantivo del nombre tiene que salir del objeto real, no de
 *    un pool a ciegas.
 */

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* ── 1. Sanitización de texto de reskin ─────────────────────────────────── */

/**
 * Reemplaza las referencias al PNJ original dentro de un HTML.
 * "the captain" / "The Bandit Captain" → nombre de pila generado.
 */
export function sanitizeText(html, protoName, newGivenName) {
  if (!html || !protoName || !newGivenName) return html;
  const full = protoName.trim();
  const words = full.split(/\s+/);
  const last = words[words.length - 1];
  let out = html;
  // Frase completa primero ("the bandit captain"), después la palabra clave
  // ("the captain"). Solo tras "the": tocar el sustantivo suelto rompería
  // frases como "other bandits nearby".
  out = out.replace(new RegExp(`\\bthe\\s+${esc(full)}\\b`, "gi"), newGivenName);
  if (last.length >= 4) {
    out = out.replace(new RegExp(`\\bthe\\s+${esc(last)}\\b`, "gi"), newGivenName);
  }
  // Nombre propio suelto ("Bandit Captain" como sujeto).
  out = out.replace(new RegExp(`\\b${esc(full)}\\b`, "g"), newGivenName);
  return out;
}

/** Sanitiza las descripciones de todos los ítems embebidos de un actor. */
export function sanitizeEmbeddedItems(items, protoName, newGivenName) {
  for (const item of items ?? []) {
    const desc = item?.system?.description;
    if (desc?.value) desc.value = sanitizeText(desc.value, protoName, newGivenName);
    for (const act of Object.values(item?.system?.activities ?? {})) {
      if (act?.description?.chatFlavor) {
        act.description.chatFlavor = sanitizeText(act.description.chatFlavor, protoName, newGivenName);
      }
    }
  }
}

/** Slug seguro para system.identifier (el original delataba el ítem base). */
export function slugify(name) {
  return (name ?? "").toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/* ── 2. Capa racial mínima ──────────────────────────────────────────────── */

/** Claves de idioma del sistema dnd5e. Solo lo que no altera el CR. */
export const RACIAL_TRAITS = {
  human:      { darkvision: 0,  languages: ["common"] },
  elf:        { darkvision: 60, languages: ["common", "elvish"] },
  dwarf:      { darkvision: 60, languages: ["common", "dwarvish"] },
  halfling:   { darkvision: 0,  languages: ["common", "halfling"] },
  orc:        { darkvision: 60, languages: ["common", "orc"] },
  tiefling:   { darkvision: 60, languages: ["common", "infernal"] },
  dragonborn: { darkvision: 0,  languages: ["common", "draconic"] },
  gnome:      { darkvision: 60, languages: ["common", "gnomish"] }
};

/**
 * Aplica idioma, sentidos y normalización de unidades sobre system (mutado).
 * Sirve para las dos rutas: prototipo clonado y generado de cero. También
 * arregla los units en null que dejaba la ruta actors24.
 */
export function applyRacialLayer(system, race, raceLabel = "") {
  if (!system) return;
  const traits = RACIAL_TRAITS[race] ?? RACIAL_TRAITS.human;

  // Sentidos: el mayor entre lo racial y lo que el stat block ya tenga.
  system.attributes ??= {};
  system.attributes.senses ??= {};
  const senses = system.attributes.senses;
  if (traits.darkvision > 0) {
    senses.darkvision = Math.max(Number(senses.darkvision) || 0, traits.darkvision);
  }
  if (!senses.units) senses.units = "ft";

  // Movimiento: units en null hacía que la ficha mostrara el walk sin unidad.
  system.attributes.movement ??= {};
  const move = system.attributes.movement;
  if (!move.walk && !move.fly && !move.swim && !move.burrow && !move.climb) move.walk = 30;
  if (!move.units) move.units = "ft";

  // Idiomas: unión sin duplicados con lo que ya hable.
  system.traits ??= {};
  system.traits.languages ??= { value: [] };
  const langs = system.traits.languages;
  langs.value = [...new Set([...(langs.value ?? []), ...traits.languages])];

  // Raza declarada en la ficha, si el stat block no traía una.
  system.details ??= {};
  if (!system.details.race && raceLabel) system.details.race = raceLabel;
}

/* ── 3. Categoría física de ítems mágicos ───────────────────────────────── */

/**
 * Categoría física de una entrada de índice de compendio, a partir del tipo de
 * documento y el subtipo dnd5e (idioma-independiente). Devuelve una de:
 * weapon | armor | wand | scroll | potion | ring | wondrous
 */
export function physicalCategory(entry) {
  const t = entry?.type;
  const sub = entry?.system?.type?.value ?? "";
  if (t === "weapon") return "weapon";
  if (["light", "medium", "heavy", "shield"].includes(sub)) return "armor";
  if (["wand", "rod"].includes(sub)) return "wand";
  if (sub === "scroll") return "scroll";
  if (sub === "potion") return "potion";
  if (sub === "ring") return "ring";
  return "wondrous";
}

/** Categorías aceptables por tipo pedido en la UI. */
export const CATEGORY_FOR_TYPE = {
  weapon: ["weapon"], armor: ["armor"], potion: ["potion"],
  ring: ["ring"], wand: ["wand"], scroll: ["scroll"], wondrous: ["wondrous"]
};

/**
 * Sustantivo físico del ítem base, para reconstruir el nombre generado.
 * "Figurine of Wondrous Power (Silver Raven)" → "Figurine"
 * "Bowl of Commanding Water Elementals"       → "Bowl"
 * "Poción de curación"                        → "Poción"
 * Devuelve "" si no se puede extraer nada razonable.
 */
export function leadingNoun(name) {
  if (!name) return "";
  let s = name.trim()
    .replace(/^(the|a|an|el|la|los|las|un|una)\s+/i, "")
    .split(/\s+(of|de|del|de la|de los|de las)\s+/i)[0]
    .split(/[,(+]/)[0]
    .trim();
  const words = s.split(/\s+/);
  if (words.length > 2) s = words.slice(0, 2).join(" ");
  if (!s || /^\d/.test(s)) return "";
  return s;
}
