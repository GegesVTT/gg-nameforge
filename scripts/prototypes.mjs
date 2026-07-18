/**
 * GG Nameforge — motor de prototipos (v2)
 *
 * MODELO: elegís CR + raza + si lanza o no. El motor busca el stat block oficial
 * más cercano en tus compendios y lo reviste con nombre, sabor y arte. Si no hay
 * ninguno cerca, se genera y se dice en pantalla.
 *
 * POR QUÉ: el Gladiador (CR 5) trae Brave, Brute, Multiattack y Parry — una
 * reacción. Nada que generemos compite con un bloque que alguien ya balanceó.
 * Donde el SRD tiene el dato, gana el SRD; donde no lo tiene, generamos.
 *
 * NADA ESTÁ HARDCODEADO. El catálogo se descubre leyendo los packs, con reglas
 * que salieron de sondear dnd5e.monsters y dnd5e.actors24 (66 humanoides):
 *
 *   humanoide → system.details.type.value contiene "humanoid"
 *   raza      → system.details.type.subtype ("Elf" en el Drow, "Dwarf" en el Duergar)
 *   lanzador  → tiene ítems de tipo spell
 *
 * Ojo con lo último: NO se puede usar system.attributes.spellcasting. En los
 * actores de 2024 ese campo trae "str" por defecto en TODOS — el Bandido, el
 * Guardia y el Plebeyo figuraban como lanzadores. Los conjuros no mienten.
 */

const norm = (s) => (s ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

/** Subtipos que son una clase, no una especie: sirven para cualquier raza.
 *  (En los packs de 2024 el Mago tiene subtype "Wizard" y el Sacerdote "Cleric".) */
const CLASS_SUBTYPES = new Set([
  "", "any race", "any lineage",
  "wizard", "cleric", "druid", "fighter", "rogue", "bard", "ranger", "paladin",
  "sorcerer", "warlock", "monk", "barbarian", "artificer"
]);

/** Nombre del prototipo → arquetipo interno. Solo se usa para elegir el sabor:
 *  así el Capitán Bandido habla como bandido sin que nadie lo haya pedido. */
const ARCHETYPE_HINTS = [
  [/bandit|thug|tough|scout|spy|assassin|pirate|brigand/i, "bandit"],
  [/guard|knight|veteran|watch|sentinel/i, "guard"],
  [/warrior|berserker|gladiator|tribal|infantry|champion/i, "warrior"],
  [/priest|acolyte|cleric/i, "cleric"],
  [/mage|archmage|wizard|apprentice|sorcer/i, "wizard"],
  [/cult|druid|shaman|occult|witch/i, "occultist"]
];

/** Margen de CR. Absoluto a propósito: con margen proporcional, un pedido de
 *  CR 8 recibía un Gladiador de CR 5. Abajo de CR 2, media unidad ya es medio
 *  combate. */
const tolerancia = (cr) => (cr < 2 ? 0.5 : 1);

let catalogo = null;      // cache de sesión: el índice no cambia mientras jugás
const clasificados = new Map();

/** Humanoides de los packs de sistema y mundo. Los de módulos quedan afuera:
 *  un PNJ no debería salir clonando un actor de prueba de JB2A. */
async function buildCatalog() {
  if (catalogo) return catalogo;
  catalogo = [];

  const packs = game.packs
    .filter((p) => p.metadata.type === "Actor" && p.metadata.packageType !== "module")
    .sort((a, b) => (a.metadata.packageType === "system" ? 0 : 1) - (b.metadata.packageType === "system" ? 0 : 1));

  for (const pack of packs) {
    let index;
    try {
      index = await pack.getIndex({ fields: ["type", "system.details.cr", "system.details.type", "img"] });
    } catch { continue; }

    for (const e of index) {
      if (e.type !== "npc") continue;
      const t = e.system?.details?.type ?? {};
      const valor = norm(typeof t === "string" ? t : (t.value ?? ""));
      if (!valor.includes("humanoid") && !valor.includes("humanoide")) continue;
      const cr = e.system?.details?.cr;
      if (typeof cr !== "number") continue;

      catalogo.push({
        id: e._id,
        name: e.name,
        pack: pack.collection,
        cr,
        subtype: norm(typeof t === "string" ? "" : (t.subtype ?? "")),
        img: e.img ?? ""
      });
    }
  }
  return catalogo;
}

/**
 * ¿Sirve para esta raza?
 *  - subtipo vacío, "any race" o una clase → cualquiera
 *  - subtipo que coincide con una raza del módulo → solo esa (enano→Duergar)
 *  - cualquier otro (Kobold, Goblinoid, Sahuagin, licántropos) → afuera: son
 *    especies que no están en la lista de razas.
 */
function sirveParaRaza(proto, race, RACES) {
  const st = proto.subtype;
  if (CLASS_SUBTYPES.has(st)) return true;
  const razas = RACES.map(norm);
  if (razas.includes(st)) return norm(race) === st;
  return false;
}

/** Arquetipo interno a partir del nombre del prototipo (para el sabor). */
export function archetypeOf(name, { caster = false, castAbility = null } = {}) {
  for (const [re, arch] of ARCHETYPE_HINTS) if (re.test(name)) return arch;
  if (caster) return ({ wis: "cleric", int: "wizard", cha: "occultist" })[castAbility] ?? "wizard";
  return "guard";
}

/** Abre el documento y termina de clasificar (lanzador o no). Cacheado. */
async function classify(entry) {
  if (clasificados.has(entry.id)) return clasificados.get(entry.id);
  const pack = game.packs.get(entry.pack);
  if (!pack) return null;
  let doc;
  try { doc = await pack.getDocument(entry.id); } catch { return null; }
  const spells = doc.items?.filter((i) => i.type === "spell") ?? [];
  const full = {
    ...entry,
    doc,
    caster: spells.length > 0,
    castAbility: doc.system?.attributes?.spellcasting || null
  };
  clasificados.set(entry.id, full);
  return full;
}

/**
 * Busca un prototipo para el pedido.
 * @param {object} opts { cr, race, kind: "martial"|"caster", RACES, ruleset }
 * @returns {Promise<object|null>} null = no hay nada cerca, hay que generar
 */
export async function pickPrototype({ cr, race = "human", kind = "martial", RACES = [], ruleset = "modern" } = {}) {
  const cat = await buildCatalog();
  const tol = tolerancia(cr);

  const pool = cat
    .filter((p) => Math.abs(p.cr - cr) <= tol)
    .filter((p) => sirveParaRaza(p, race, RACES));
  if (!pool.length) return null;

  // Los dos packs traen el mismo PNJ (Bandit Captain está en ambos) y cinco de
  // las seis familias cambian de nombre entre 2014 y 2024: el DM elige cuál manda.
  // El CR manda; la edición desempata. Al revés (que era como estaba), pedir
  // CR 0 devolvía un Thug de CR 0.5 del pack preferido teniendo el Plebeyo de
  // CR 0 exacto en el otro.
  const preferido = ruleset === "legacy" ? "dnd5e.monsters" : "dnd5e.actors24";
  pool.sort((a, b) =>
    Math.abs(a.cr - cr) - Math.abs(b.cr - cr) ||
    (a.pack === preferido ? 0 : 1) - (b.pack === preferido ? 0 : 1));

  // Abrir los 66 documentos por tirada sería absurdo: se abren candidatos hasta
  // juntar unos pocos del tipo pedido, y se elige entre esos.
  const encontrados = [];
  for (const entry of pool) {
    const full = await classify(entry);
    if (!full) continue;
    if (kind === "caster" ? full.caster : !full.caster) encontrados.push(full);
    if (encontrados.length >= 4) break;
  }
  if (!encontrados.length) return null;

  const elegido = encontrados[Math.floor(Math.random() * encontrados.length)];
  return {
    doc: elegido.doc,
    name: elegido.name,
    cr: elegido.cr,
    pack: elegido.pack,
    caster: elegido.caster,
    img: elegido.img,
    archetype: archetypeOf(elegido.name, { caster: elegido.caster, castAbility: elegido.castAbility })
  };
}

/* Nombres que sugieren rol, para elegir arte de respaldo sin abrir documentos. */
const CASTER_ART = /mage|archmage|wizard|apprentice|sorcer|priest|acolyte|cleric|druid|cult|warlock|occult/i;
const MARTIAL_ART = /guard|bandit|thug|tough|soldier|knight|veteran|warrior|berserker|gladiator|scout|spy|commoner|noble/i;

/**
 * Arte de respaldo para un actor sin token: se toma prestada la imagen de un
 * humanoide del catálogo que encaje con el rol pedido. Preferencia: un
 * prototipo cuyo subtipo coincida con la raza (enano→Duergar), después uno
 * cuyo nombre sugiera el mismo rol, después cualquier humanoide con arte.
 * Caso real: el Tough Boss de actors24 viene sin token y el PNJ quedaba con
 * el mystery-man; y toda la ruta generada quedaba con el npc.svg pelado.
 */
export async function pickFallbackArt({ race = "human", kind = "martial" } = {}) {
  let cat;
  try { cat = await buildCatalog(); } catch { return null; }
  const conArte = cat.filter((c) => c.img && !c.img.includes("mystery-man") && !c.img.endsWith(".svg"));
  if (!conArte.length) return null;
  const rolOk = (c) => (kind === "caster" ? CASTER_ART : MARTIAL_ART).test(c.name);
  const porRaza = conArte.filter((c) => c.subtype && c.subtype === norm(race));
  const porRol = conArte.filter(rolOk);
  const pool = (porRaza.length && Math.random() < 0.5) ? porRaza : (porRol.length ? porRol : conArte);
  return pool[Math.floor(Math.random() * pool.length)].img || null;
}

/** Diagnóstico (lo usa el test de matriz). */
export async function catalogSummary() {
  const cat = await buildCatalog();
  return { total: cat.length, packs: [...new Set(cat.map((c) => c.pack))] };
}
