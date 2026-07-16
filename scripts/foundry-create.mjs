/**
 * GG Nameforge — Foundry document creation.
 *
 * NPCs: assembles a combat-ready dnd5e actor using real SRD weapons, armor and
 * spells (via srd-kit.mjs) when available, plus ability scores, HP, AC and
 * resistances scaled by archetype and CR tier. Falls back to a clean basic
 * actor on other systems or when SRD content is missing.
 *
 * Items: reskins a real SRD magic item with the generated name when possible,
 * otherwise creates a typed item with the flavor description.
 */

import { ARCHETYPES, CR_TIERS, assembleSRDKit } from "./srd-kit.mjs";

const MODULE_ID = "gg-nameforge";

const randInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const isDnd5e = () => game.system?.id === "dnd5e";
const mod = (score) => Math.floor((score - 10) / 2);

/**
 * Ability score arrays by archetype: emphasizes the role's key stat.
 * [str, dex, con, int, wis, cha] — tuned, not rolled, so the NPC plays right.
 */
const ABILITY_PROFILES = {
  warrior:   [16, 12, 15, 9,  11, 10],
  guard:     [13, 12, 13, 10, 11, 10],
  wizard:    [9,  14, 12, 16, 12, 11],
  cleric:    [13, 10, 14, 11, 16, 12],
  bandit:    [11, 16, 12, 12, 11, 12],
  occultist: [10, 13, 13, 12, 12, 16]
};

/** Damage resistances/immunities/vulnerabilities seeded by archetype + tier. */
function buildDefenses(archetypeKey, tier) {
  const out = { dr: [], di: [], dv: [], ci: [] }; // resist / immune / vuln / condition-immune
  const strong = tier.cr >= 5;
  const elite  = tier.cr >= 8;
  switch (archetypeKey) {
    case "occultist":
      if (strong) out.dr.push(pick(["fire", "cold", "lightning"]));
      if (elite)  out.di.push("poison");
      break;
    case "cleric":
      if (strong) out.dr.push("radiant");
      if (elite)  out.ci.push("frightened");
      break;
    case "warrior":
      if (strong) out.dr.push(pick(["slashing", "piercing", "bludgeoning"]));
      break;
    case "wizard":
      if (elite)  out.dr.push("force");
      break;
    case "bandit":
      if (strong) out.dr.push("poison");
      break;
  }
  return out;
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** Base AC by archetype, before the SRD armor item adds its own. */
function baseAC(archetypeKey, dexMod) {
  switch (archetypeKey) {
    case "warrior": return 18;           // plate
    case "cleric":  return 16;           // heavy
    case "guard":   return 11 + dexMod;  // leather
    case "bandit":  return 12 + dexMod;  // studded leather
    default:        return 10 + dexMod;  // unarmored casters
  }
}

export async function createNPCActor(npc) {
  if (!npc || typeof npc !== "object") return null;
  if (!game.user.can("ACTOR_CREATE")) {
    ui.notifications.warn(game.i18n.localize("GGNF.Errors.NoActorPerm"));
    return null;
  }

  const race       = npc.race       ?? "human";
  const occupation = npc.occupation ?? game.i18n.localize("GGNF.Fallback.Occupation");
  const trait      = npc.trait      ?? game.i18n.localize("GGNF.Fallback.Trait");
  const archetype  = npc.archetype  ?? "guard";
  const crKey      = npc.cr         ?? "cr1";
  const name       = npc.name       ?? game.i18n.localize("GGNF.Fallback.Name");

  const archLabel = game.i18n.localize(`GGNF.Arch.${archetype}`);
  const bio = game.i18n.format("GGNF.Actor.Bio", { race, occupation, trait });

  if (!isDnd5e()) {
    // Agnostic system: name + note only.
    const fallbackType = Object.keys(game.documentTypes.Actor).find(t => t !== "base") ?? "base";
    try {
      const actor = await Actor.create({
        name, type: fallbackType,
        flags: { [MODULE_ID]: { generated: true, race, archetype, note: bio } }
      });
      ui.notifications.info(game.i18n.format("GGNF.Actor.Created", { name }));
      actor?.sheet?.render(true);
      return actor;
    } catch (err) {
      console.error(`${MODULE_ID} | actor creation failed`, err);
      ui.notifications.error(game.i18n.localize("GGNF.Errors.ActorFailed"));
      return null;
    }
  }

  // ── dnd5e path ──────────────────────────────────────────────────────────
  const tier = CR_TIERS[crKey] ?? CR_TIERS.cr1;
  const profile = ABILITY_PROFILES[archetype] ?? ABILITY_PROFILES.guard;
  const abilities = {};
  const abilKeys = ["str", "dex", "con", "int", "wis", "cha"];
  abilKeys.forEach((ab, i) => { abilities[ab] = { value: profile[i] }; });

  const dexMod = mod(profile[1]);
  const hp = randInt(tier.hp[0], tier.hp[1]);
  const ac = baseAC(archetype, dexMod);
  const defenses = buildDefenses(archetype, tier);

  // Assemble SRD kit (weapons, armor, focus, spells) if content is present.
  let kit = { items: [], usedSRD: false, notes: [] };
  try {
    kit = await assembleSRDKit(archetype, crKey);
  } catch (err) {
    console.warn(`${MODULE_ID} | SRD kit assembly failed, using bare actor`, err);
  }

  // Spellcasting plumbing: without the casting ability and slot overrides,
  // embedded spells show on the sheet but the NPC can't actually cast them.
  const arch = ARCHETYPES[archetype] ?? ARCHETYPES.guard;
  const casterAbility = arch.caster
    ? ({ arcane: "int", divine: "wis", primal: "cha" }[arch.caster.type] ?? "int")
    : null;
  const spells = {};
  if (casterAbility && tier.spellCap > 0) {
    const SLOTS_BY_LEVEL = [0, 4, 3, 3, 3, 2, 1, 1, 1, 1]; // índice = nivel de conjuro
    for (let lvl = 1; lvl <= Math.min(tier.spellCap, 9); lvl++) {
      spells[`spell${lvl}`] = { value: SLOTS_BY_LEVEL[lvl], max: SLOTS_BY_LEVEL[lvl], override: SLOTS_BY_LEVEL[lvl] };
    }
  }

  const data = {
    name,
    type: "npc",
    system: {
      abilities,
      ...(casterAbility ? { attributes: {
        hp: { value: hp, max: hp },
        ac: { flat: ac, calc: "flat" },
        spellcasting: casterAbility
      }, spells } : { attributes: {
        hp: { value: hp, max: hp },
        ac: { flat: ac, calc: "flat" }
      } }),
      details: {
        biography: { value: `<p>${bio}</p><p><em>${archLabel}</em></p>` },
        cr: tier.cr,
        type: { value: "humanoid" }
      },
      traits: {
        dr: { value: defenses.dr },   // damage resistances
        di: { value: defenses.di },   // damage immunities
        dv: { value: defenses.dv },   // damage vulnerabilities
        ci: { value: defenses.ci }    // condition immunities
      }
    },
    items: kit.items,
    flags: { [MODULE_ID]: { generated: true, race, archetype, cr: crKey, usedSRD: kit.usedSRD } }
  };

  try {
    const actor = await Actor.create(data);
    const msg = kit.usedSRD ? "GGNF.Actor.CreatedSRD" : "GGNF.Actor.Created";
    ui.notifications.info(game.i18n.format(msg, { name }));
    if (kit.notes.length) {
      // Antes esto moría en console.log y en la mesa parecía que "no hacía nada".
      const missing = kit.notes.map((n) => n.split(":")[1] ?? n).join(", ");
      ui.notifications.warn(game.i18n.format("GGNF.Actor.KitPartial", { name, missing }));
      console.log(`${MODULE_ID} | kit notes for ${name}:`, kit.notes);
    }
    actor?.sheet?.render(true);
    return actor;
  } catch (err) {
    console.error(`${MODULE_ID} | actor creation failed`, err);
    ui.notifications.error(game.i18n.localize("GGNF.Errors.ActorFailed"));
    return null;
  }
}

/* ── Magic items ─────────────────────────────────────────────────────────── */

/** Try to find a real SRD magic item of a compatible type to reskin. */
async function findSRDMagicItem(itemType) {
  if (!isDnd5e()) return null;
  const TYPE_MATCH = {
    weapon: ["weapon"], armor: ["equipment"], potion: ["consumable"],
    ring: ["equipment"], wand: ["consumable", "equipment"],
    scroll: ["consumable"], wondrous: ["equipment", "consumable"]
  };
  const wantTypes = TYPE_MATCH[itemType] ?? ["equipment"];
  for (const pack of game.packs.filter(p => p.metadata.type === "Item")) {
    let idx;
    try { idx = await pack.getIndex({ fields: ["type", "system.rarity"] }); } catch { continue; }
    const magic = [...idx].filter(e =>
      wantTypes.includes(e.type) &&
      e.system?.rarity && e.system.rarity !== "common" && e.system.rarity !== ""
    );
    if (magic.length) {
      const hit = magic[Math.floor(Math.random() * magic.length)];
      try { return await pack.getDocument(hit._id); } catch { /* keep looking */ }
    }
  }
  return null;
}

export async function createMagicItem(item) {
  if (!item || typeof item !== "object") return null;
  if (!game.user.can("ITEM_CREATE")) {
    ui.notifications.warn(game.i18n.localize("GGNF.Errors.NoItemPerm"));
    return null;
  }

  const name   = item.name   ?? game.i18n.localize("GGNF.Fallback.Item");
  const flavor = item.flavor ?? game.i18n.localize("GGNF.Fallback.Flavor");
  const itemType = item.type ?? "wondrous";

  // Try to reskin a real SRD magic item: keep its mechanics, swap name + flavor.
  if (isDnd5e()) {
    const srd = await findSRDMagicItem(itemType);
    if (srd) {
      const obj = srd.toObject();
      obj.name = name;
      const prevDesc = obj.system?.description?.value ?? "";
      obj.system = obj.system ?? {};
      obj.system.description = { value: `<p><em>${flavor}</em></p><hr>${prevDesc}` };
      obj.flags = { ...(obj.flags ?? {}), [MODULE_ID]: { generated: true, reskinned: true } };
      try {
        const created = await Item.create(obj);
        ui.notifications.info(game.i18n.format("GGNF.Item.CreatedSRD", { name }));
        created?.sheet?.render(true);
        return created;
      } catch (err) {
        console.warn(`${MODULE_ID} | SRD reskin failed, falling back`, err);
      }
    }
  }

  // Fallback: typed item with flavor description.
  const TYPE_MAP_5E = {
    weapon: "weapon", armor: "equipment", potion: "consumable",
    ring: "equipment", wand: "consumable", scroll: "consumable", wondrous: "equipment"
  };
  const desc = `<p><em>${flavor}</em></p>`;
  const data = isDnd5e()
    ? { name, type: TYPE_MAP_5E[itemType] ?? "loot", system: { description: { value: desc }, rarity: item.dnd5eRarity ?? "common" }, flags: { [MODULE_ID]: { generated: true } } }
    : { name, type: Object.keys(game.documentTypes.Item).find(t => t !== "base") ?? "base", flags: { [MODULE_ID]: { generated: true, rarity: item.rarity ?? "common", note: flavor } } };

  try {
    const created = await Item.create(data);
    ui.notifications.info(game.i18n.format("GGNF.Item.Created", { name }));
    created?.sheet?.render(true);
    return created;
  } catch (err) {
    console.error(`${MODULE_ID} | item creation failed`, err);
    ui.notifications.error(game.i18n.localize("GGNF.Errors.ItemFailed"));
    return null;
  }
}
