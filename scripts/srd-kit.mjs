/**
 * GG Nameforge — SRD kit assembler.
 *
 * Pulls real weapons, armor and spells from whatever D&D 5e SRD-style
 * compendiums the user has installed, and assembles a combat-ready NPC.
 * Falls back gracefully (returns null entries) when content is missing, so
 * foundry-create.mjs can decide whether to use SRD items or homebrew.
 *
 * Compendiums are DISCOVERED dynamically by document type + name matching,
 * never by hardcoded pack IDs (which differ across dnd5e v3/v4 and SRD 5.1/5.2).
 */

const isDnd5e = () => game.system?.id === "dnd5e";

/* ── Archetype definitions ───────────────────────────────────────────────
 * Each NPC role maps to a loadout. Weapon/armor names are matched (case- and
 * accent-insensitive, partial) against compendium index entries. Several
 * options per slot so the result varies. Spellcasters list schools/level caps
 * resolved per threat tier below.
 * ──────────────────────────────────────────────────────────────────────── */
export const ARCHETYPES = {
  warrior: {
    label: "warrior",
    weapons: { oneOf: [
      ["greatsword"], ["greataxe"], ["maul"], ["halberd"],     // two-handed
      ["longsword", "shield"], ["warhammer", "shield"], ["battleaxe", "shield"] // one-hand + shield
    ]},
    armor: ["plate"],
    caster: null
  },
  guard: {
    label: "guard",
    weapons: { oneOf: [ ["spear"], ["longsword", "shield"], ["halberd"] ] },
    armor: ["leather armor", "leather"],
    caster: null
  },
  wizard: {
    label: "wizard",
    weapons: { oneOf: [ ["quarterstaff"], ["dagger"] ] },
    arcaneFocus: ["wand", "orb", "rod", "staff", "crystal"],
    armor: null,
    caster: { type: "arcane", schools: ["evocation", "abjuration", "conjuration", "transmutation"] }
  },
  cleric: {
    label: "cleric",
    weapons: { oneOf: [ ["mace"], ["warhammer"] ] },
    armor: ["chain mail", "scale mail", "plate"],
    caster: { type: "divine", schools: ["evocation", "abjuration", "enchantment"] }
  },
  bandit: {
    label: "bandit",
    weapons: { oneOf: [ ["dagger"], ["shortsword"], ["scimitar"] ] },
    armor: ["studded leather", "leather"],
    features: ["sneak attack", "thieves' cant"],
    caster: null
  },
  occultist: { // Bruja / Hechicero / Druida — magia natural / elemental
    label: "occultist",
    weapons: { oneOf: [ ["sickle"], ["dagger"], ["quarterstaff"] ] },
    arcaneFocus: ["wand", "staff", "crystal", "yew wand", "totem"],
    armor: null,
    caster: { type: "primal", schools: ["evocation", "conjuration", "transmutation"], elemental: true }
  }
};
export const ARCHETYPE_KEYS = Object.keys(ARCHETYPES);

/* ── Threat tiers (CR) ───────────────────────────────────────────────────
 * Per request: steps of 1 CR, except the low end (1/4 and 1/2).
 * spellCap = highest spell level the caster can pull at that tier.
 * spellCount = how many spells to attach.
 * ──────────────────────────────────────────────────────────────────────── */
export const CR_TIERS = {
  "cr0":   { cr: 0,    hp: [3, 8],     pb: 2, spellCap: 0, spellCount: 0 },
  "cr1_4": { cr: 0.25, hp: [9, 20],    pb: 2, spellCap: 1, spellCount: 2 },
  "cr1_2": { cr: 0.5,  hp: [16, 32],   pb: 2, spellCap: 1, spellCount: 3 },
  "cr1":   { cr: 1,    hp: [22, 45],   pb: 2, spellCap: 2, spellCount: 4 },
  "cr2":   { cr: 2,    hp: [30, 60],   pb: 2, spellCap: 3, spellCount: 5 },
  "cr3":   { cr: 3,    hp: [40, 85],   pb: 2, spellCap: 4, spellCount: 6 },
  "cr4":   { cr: 4,    hp: [50, 100],  pb: 2, spellCap: 4, spellCount: 6 },
  "cr5":   { cr: 5,    hp: [75, 130],  pb: 3, spellCap: 5, spellCount: 7 },
  "cr6":   { cr: 6,    hp: [85, 150],  pb: 3, spellCap: 5, spellCount: 7 },
  "cr7":   { cr: 7,    hp: [95, 165],  pb: 3, spellCap: 6, spellCount: 8 },
  "cr8":   { cr: 8,    hp: [110, 190], pb: 3, spellCap: 6, spellCount: 8 },
  "cr9":   { cr: 9,    hp: [120, 210], pb: 4, spellCap: 7, spellCount: 9 },
  "cr10":  { cr: 10,   hp: [130, 230], pb: 4, spellCap: 7, spellCount: 9 }
};
export const CR_KEYS = Object.keys(CR_TIERS);

/* ── Compendium discovery + caching ──────────────────────────────────────── */

const _indexCache = new Map(); // packId → indexed entries

/** All Item-type compendiums, SRD-style ones first. */
function itemPacks() {
  return game.packs.filter(p => p.metadata.type === "Item");
}
function actorPacks() {
  return game.packs.filter(p => p.metadata.type === "Actor");
}

/** Normalize for matching: lowercase, strip accents and punctuation. */
function norm(s) {
  return (s ?? "").toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[''`]/g, "").trim();
}

/** Load + cache a pack's index (id, name, type). */
async function getIndex(pack) {
  if (_indexCache.has(pack.collection)) return _indexCache.get(pack.collection);
  const idx = await pack.getIndex({ fields: ["type", "system.level", "system.school", "system.rarity"] });
  const arr = [...idx];
  _indexCache.set(pack.collection, arr);
  return arr;
}

/**
 * Find the first item document whose name matches any of `names` (partial,
 * accent-insensitive), optionally constrained to dnd5e item sub-types.
 * Returns the full Document (ready to embed) or null.
 */
async function findItem(names, { types } = {}) {
  const wanted = names.map(norm);
  // First pass: exact name match (best). Second pass: partial (fallback).
  for (const exact of [true, false]) {
    for (const pack of itemPacks()) {
      let index;
      try { index = await getIndex(pack); } catch { continue; }
      const hit = index.find(e => {
        if (types && !types.includes(e.type)) return false;
        const n = norm(e.name);
        return exact
          ? wanted.some(w => n === w)
          : wanted.some(w => n.includes(w) && w.length >= 4); // avoid 1-3 char false hits
      });
      if (hit) {
        try { return await pack.getDocument(hit._id); } catch { /* keep looking */ }
      }
    }
  }
  return null;
}

/**
 * Gather up to `count` spell documents matching the caster's schools and a
 * maximum spell level. Pulls from all Item packs that contain spells.
 */
async function findSpells({ schools, maxLevel, count }) {
  if (!count || maxLevel < 0) return [];
  const wantSchools = (schools ?? []).map(s => norm(s).slice(0, 4)); // "evoc", "abju"...
  const pool = [];
  for (const pack of itemPacks()) {
    let index;
    try { index = await getIndex(pack); } catch { continue; }
    for (const e of index) {
      if (e.type !== "spell") continue;
      const lvl = e.system?.level ?? 99;
      if (lvl > maxLevel) continue;
      const school = norm(e.system?.school ?? "");
      // dnd5e stores school as a short code (evo, abj, con...) OR full word.
      const schoolOk = !wantSchools.length || wantSchools.some(w => school.startsWith(w.slice(0, 3)) || w.startsWith(school.slice(0, 3)));
      if (schoolOk) pool.push({ pack, id: e._id, level: lvl });
    }
  }
  // Prefer a spread of levels: sort by level, then sample without repeats.
  pool.sort((a, b) => a.level - b.level);
  const seen = new Set();
  const chosen = [];
  const step = Math.max(1, Math.floor(pool.length / count));
  for (let i = 0; i < pool.length && chosen.length < count; i += step) {
    if (!seen.has(pool[i].id)) { seen.add(pool[i].id); chosen.push(pool[i]); }
  }
  // Top up with any remaining unique spells if the spread didn't fill quota.
  for (let i = 0; i < pool.length && chosen.length < count; i++) {
    if (!seen.has(pool[i].id)) { seen.add(pool[i].id); chosen.push(pool[i]); }
  }
  const docs = [];
  for (const c of chosen.slice(0, count)) {
    try { docs.push(await c.pack.getDocument(c.id)); } catch { /* skip */ }
  }
  return docs.filter(Boolean);
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Build the embedded-item list for an NPC from SRD content.
 * Returns { items: [itemData...], usedSRD: bool, notes: [...] }.
 * Each itemData is a plain object ready for Actor.create({ items: [...] }).
 */
export async function assembleSRDKit(archetypeKey, crKey) {
  if (!isDnd5e()) return { items: [], usedSRD: false, notes: [] };

  const arch = ARCHETYPES[archetypeKey] ?? ARCHETYPES.guard;
  const tier = CR_TIERS[crKey] ?? CR_TIERS.cr1;
  const items = [];
  const notes = [];
  const usedIds = new Set(); // prevent the same compendium item filling two slots
  let usedSRD = false;

  const addUnique = (doc) => {
    if (!doc) return false;
    if (usedIds.has(doc.id)) return false;
    usedIds.add(doc.id);
    items.push(doc.toObject());
    usedSRD = true;
    return true;
  };

  // 1. Weapon slot (oneOf is a list of loadouts; each loadout is a name list).
  const loadout = pick(arch.weapons.oneOf);
  for (const wName of loadout) {
    const doc = await findItem([wName], { types: ["weapon", "equipment"] });
    if (!addUnique(doc)) notes.push(`weapon:${wName}`);
  }

  // 2. Arcane focus (casters). Skip if it collides with the weapon already taken.
  if (arch.arcaneFocus) {
    const doc = await findItem(arch.arcaneFocus, { types: ["weapon", "equipment", "consumable", "tool"] });
    addUnique(doc);
  }

  // 3. Armor slot.
  if (arch.armor) {
    const doc = await findItem(arch.armor, { types: ["equipment"] });
    if (!addUnique(doc)) notes.push(`armor:${arch.armor[0]}`);
  }

  // 4. Spells (casters only).
  if (arch.caster && tier.spellCount > 0) {
    const spells = await findSpells({
      schools: arch.caster.schools,
      maxLevel: tier.spellCap,
      count: tier.spellCount
    });
    let added = 0;
    for (const s of spells) { if (addUnique(s)) added++; }
    if (!added) notes.push("spells:none-found");
  }

  return { items, usedSRD, notes };
}

/** Quick check the UI can use to warn if no SRD content is available at all. */
export async function hasSRDContent() {
  if (!isDnd5e()) return false;
  for (const pack of itemPacks()) {
    try {
      const idx = await getIndex(pack);
      if (idx.some(e => e.type === "weapon" || e.type === "spell")) return true;
    } catch { /* skip */ }
  }
  return false;
}
