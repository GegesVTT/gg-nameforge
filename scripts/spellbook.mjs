/**
 * GG Nameforge — spellbook builder (v2.1).
 *
 * PROBLEMA QUE RESUELVE: la selección vieja (nivel + escuela, muestreo por
 * pasos sobre un pool ordenado) era casi determinista y ciega al rol. Todo
 * lanzador salía con la misma ensalada: Purify Food and Drink, Find Steed y
 * Awaken en un "ocultista" de CR 9, con slots de nivel 7 y ningún conjuro de
 * nivel 7. Ver el probe de Vondal Holderhek.
 *
 * MODELO NUEVO:
 *   CR pedido → nivel de lanzador → tabla real de slots de lanzador completo.
 *   Nunca hay un slot sin al menos un conjuro de ese nivel: los slots salen de
 *   la tabla y los conjuros se rellenan nivel por nivel.
 *
 *   Cada arquetipo lanzador tiene una lista curada de conjuros del SRD 5.1
 *   (nombres compartidos con el 5.2: el matcheo es parcial, "black tentacles"
 *   encuentra "Evard's Black Tentacles"). La lista se intenta primero por
 *   nombre; lo que falte se completa por nivel + escuela COMO ANTES, así que
 *   los mundos con compendios traducidos degradan al comportamiento previo en
 *   vez de romperse.
 *
 *   Garantías duras:
 *     - al menos un truco de ataque (por lista curada);
 *     - al menos un conjuro en el nivel de slot más alto;
 *     - sin repetidos, ni entre sí ni contra los que el actor ya tiene.
 */

import { itemPacks, getIndex, norm } from "./srd-kit.mjs";

/* ── CR → nivel de lanzador ─────────────────────────────────────────────────
 * Calibrado contra los PNJ oficiales: el Sacerdote (CR 2) lanza como nivel 5,
 * el Mago (CR 6) como nivel 9, el Archimago (CR 12) como nivel 18. */
const CASTER_LEVEL_BY_CR = {
  cr0: 0, cr1_4: 2, cr1_2: 3, cr1: 4, cr2: 5, cr3: 6, cr4: 7,
  cr5: 8, cr6: 9, cr7: 10, cr8: 11, cr9: 13, cr10: 14
};

/** Tabla de slots de lanzador completo (PHB). Índice 0 = conjuros de nivel 1. */
const FULL_CASTER_SLOTS = {
  1:  [2],
  2:  [3],
  3:  [4, 2],
  4:  [4, 3],
  5:  [4, 3, 2],
  6:  [4, 3, 3],
  7:  [4, 3, 3, 1],
  8:  [4, 3, 3, 2],
  9:  [4, 3, 3, 3, 1],
  10: [4, 3, 3, 3, 2],
  11: [4, 3, 3, 3, 2, 1],
  12: [4, 3, 3, 3, 2, 1],
  13: [4, 3, 3, 3, 2, 1, 1],
  14: [4, 3, 3, 3, 2, 1, 1]
};

/* ── Temas por arquetipo ────────────────────────────────────────────────────
 * Nombres del SRD. "attack" son trucos de ataque: al menos uno entra siempre.
 * Las escuelas son el fallback idioma-independiente para lo que no aparezca. */
export const SPELL_THEMES = {
  wizard: {
    ability: "int",
    schools: ["evocation", "abjuration", "conjuration", "illusion"],
    attack: ["fire bolt", "ray of frost", "shocking grasp", "acid splash"],
    cantrips: ["mage hand", "prestidigitation", "light", "minor illusion"],
    levels: {
      1: ["magic missile", "shield", "burning hands", "detect magic"],
      2: ["misty step", "mirror image", "scorching ray", "hold person"],
      3: ["fireball", "counterspell", "lightning bolt", "fly"],
      4: ["greater invisibility", "ice storm", "dimension door"],
      5: ["cone of cold", "wall of force", "hold monster"],
      6: ["chain lightning", "globe of invulnerability", "disintegrate"],
      7: ["teleport", "finger of death", "prismatic spray"]
    }
  },
  cleric: {
    ability: "wis",
    schools: ["evocation", "abjuration", "enchantment", "divination"],
    attack: ["sacred flame"],
    cantrips: ["thaumaturgy", "guidance", "light", "resistance"],
    levels: {
      1: ["cure wounds", "guiding bolt", "bless", "shield of faith"],
      2: ["spiritual weapon", "hold person", "lesser restoration", "silence"],
      3: ["spirit guardians", "dispel magic", "revivify", "mass healing word"],
      4: ["guardian of faith", "banishment", "freedom of movement"],
      5: ["flame strike", "mass cure wounds", "greater restoration"],
      6: ["harm", "heal", "blade barrier"],
      7: ["fire storm", "divine word", "regenerate"]
    }
  },
  occultist: {
    ability: "cha",
    schools: ["necromancy", "enchantment", "conjuration", "evocation"],
    attack: ["chill touch", "poison spray", "produce flame"],
    cantrips: ["thaumaturgy", "minor illusion", "druidcraft"],
    levels: {
      1: ["bane", "inflict wounds", "entangle", "ray of sickness"],
      2: ["blindness/deafness", "ray of enfeeblement", "hold person", "web"],
      3: ["bestow curse", "fear", "vampiric touch", "animate dead"],
      4: ["blight", "black tentacles", "confusion"],
      5: ["contagion", "cloudkill", "insect plague"],
      6: ["circle of death", "eyebite", "create undead"],
      7: ["finger of death", "plane shift"]
    }
  }
};

/** Cualquier arquetipo desconocido lanza como mago: mejor genérico que roto. */
const themeFor = (archetype) => SPELL_THEMES[archetype] ?? SPELL_THEMES.wizard;

const SCHOOL_CODES = {
  evocation: "evo", abjuration: "abj", conjuration: "con", transmutation: "trs",
  enchantment: "enc", necromancy: "nec", illusion: "ill", divination: "div"
};

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/* ── helpers puros (exportados para el harness de tests) ─────────────────── */

export function casterLevelFor(crKey) {
  return CASTER_LEVEL_BY_CR[crKey] ?? 0;
}

/** { spell1: {value,max,override}, ... } — solo niveles con slots reales. */
export function slotsForCasterLevel(cl) {
  const row = FULL_CASTER_SLOTS[Math.min(Math.max(cl, 0), 14)] ?? null;
  if (!row) return {};
  const out = {};
  row.forEach((n, i) => {
    out[`spell${i + 1}`] = { value: n, max: n, override: n };
  });
  return out;
}

/** Cuántos conjuros adjuntar por nivel de slot. */
export function spellQuota(maxLvl) {
  const q = {};
  for (let lvl = 1; lvl <= maxLvl; lvl++) q[lvl] = lvl >= 6 ? 1 : 2;
  if (maxLvl >= 1) q[maxLvl] = Math.max(q[maxLvl], 1); // el tope nunca queda vacío
  return q;
}

/* ── búsqueda en compendios ─────────────────────────────────────────────── */

/** Índice combinado de todos los conjuros disponibles, cacheado por sesión. */
let _spellIndex = null;
async function spellIndex() {
  if (_spellIndex) return _spellIndex;
  _spellIndex = [];
  for (const pack of itemPacks()) {
    let index;
    try { index = await getIndex(pack); } catch { continue; }
    for (const e of index) {
      if (e.type !== "spell") continue;
      _spellIndex.push({
        pack, id: e._id,
        name: norm(e.name),
        level: e.system?.level ?? 99,
        school: norm(e.system?.school ?? "")
      });
    }
  }
  return _spellIndex;
}

/** Busca un conjuro por nombre (exacto, después parcial) a un nivel dado. */
function matchByName(index, wanted, level) {
  const w = norm(wanted);
  let hit = index.find((e) => e.level === level && e.name === w);
  if (!hit && w.length >= 4) {
    hit = index.find((e) => e.level === level && e.name.includes(w));
  }
  return hit ?? null;
}

/** Pool por nivel + escuelas, barajado (el orden fijo era el bug de "siempre
 *  los mismos conjuros"). */
function poolByLevelSchool(index, level, schools) {
  const codes = (schools ?? []).map((s) => SCHOOL_CODES[norm(s)] ?? norm(s).slice(0, 3));
  return shuffle(index.filter((e) => {
    if (e.level !== level) return false;
    if (!codes.length) return true;
    return codes.some((c) => e.school === c || e.school.startsWith(c) || c.startsWith(e.school.slice(0, 3)));
  }));
}

/* ── constructor principal ──────────────────────────────────────────────── */

/**
 * Arma un libro de conjuros coherente para un CR.
 * @param {object} opts
 *   archetype     "wizard" | "cleric" | "occultist" (u otro → mago)
 *   crKey         "cr0".."cr10"
 *   excludeNames  Set de nombres (norm) que el actor ya tiene
 * @returns {Promise<{docs: Document[], slots: object, casterLevel: number,
 *                    maxLevel: number, ability: string} | null>}
 *          null = CR sin magia o no hay conjuros en los compendios.
 */
export async function buildSpellbook({ archetype = "wizard", crKey = "cr1", excludeNames = new Set() } = {}) {
  const cl = casterLevelFor(crKey);
  if (cl <= 0) return null;

  const theme = themeFor(archetype);
  const slots = slotsForCasterLevel(cl);
  const maxLevel = Object.keys(slots).length;
  const quota = spellQuota(maxLevel);
  const cantripCount = cl >= 10 ? 4 : 3;

  const index = await spellIndex();
  if (!index.length) return null;

  const taken = new Set(excludeNames);
  const picks = [];
  const add = (entry) => {
    if (!entry || taken.has(entry.name)) return false;
    taken.add(entry.name);
    picks.push(entry);
    return true;
  };

  // 1. Truco de ataque garantizado: la razón de que un lanzador dé miedo
  //    incluso sin slots. Se prueba la lista curada en orden aleatorio.
  let attackOk = false;
  for (const name of shuffle(theme.attack)) {
    if (add(matchByName(index, name, 0))) { attackOk = true; break; }
  }
  // Fallback traducido: cualquier truco de evocación/nigromancia suele pegar.
  if (!attackOk) {
    for (const e of poolByLevelSchool(index, 0, ["evocation", "necromancy"])) {
      if (add(e)) { attackOk = true; break; }
    }
  }

  // 2. Resto de trucos.
  let cantrips = 1;
  for (const name of shuffle(theme.cantrips)) {
    if (cantrips >= cantripCount) break;
    if (add(matchByName(index, name, 0))) cantrips++;
  }
  for (const e of poolByLevelSchool(index, 0, theme.schools)) {
    if (cantrips >= cantripCount) break;
    if (add(e)) cantrips++;
  }

  // 3. Conjuros con nivel: curados primero, escuelas después. Cada nivel de
  //    slot recibe al menos un conjuro; si un nivel queda vacío incluso tras
  //    el fallback, se recorta el slot (nunca más slots huérfanos).
  const emptyLevels = [];
  for (let lvl = 1; lvl <= maxLevel; lvl++) {
    let got = 0;
    for (const name of shuffle(theme.levels[lvl] ?? [])) {
      if (got >= quota[lvl]) break;
      if (add(matchByName(index, name, lvl))) got++;
    }
    for (const e of poolByLevelSchool(index, lvl, theme.schools)) {
      if (got >= quota[lvl]) break;
      if (add(e)) got++;
    }
    if (!got) emptyLevels.push(lvl);
  }
  for (const lvl of emptyLevels) delete slots[`spell${lvl}`];

  // 4. Abrir los documentos elegidos.
  const docs = [];
  for (const p of picks) {
    try { docs.push(await p.pack.getDocument(p.id)); } catch { /* skip */ }
  }
  if (!docs.length) return null;

  return {
    docs: docs.filter(Boolean),
    slots,
    casterLevel: cl,
    maxLevel: Object.keys(slots).length,
    ability: theme.ability
  };
}
