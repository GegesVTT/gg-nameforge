/**
 * GG Nameforge — Foundry document creation.
 * Creates NPC Actors and magic Items from generated descriptors.
 * On dnd5e it fills randomized stats; on other systems it creates a basic
 * actor/item with the name and a biography note so nothing breaks.
 */

import { THREAT_TIERS } from "./npc.mjs";

const MODULE_ID = "gg-nameforge";

/** 3d6 roll for ability scores. */
function roll3d6() {
  return (1 + Math.floor(Math.random() * 6)) +
         (1 + Math.floor(Math.random() * 6)) +
         (1 + Math.floor(Math.random() * 6));
}

/** Random integer in [min, max] inclusive. */
const randInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

const isDnd5e = () => game.system?.id === "dnd5e";

/**
 * Create an NPC actor from a descriptor (see npc.mjs#generateNPC).
 * Returns the created Actor or null.
 */
export async function createNPCActor(npc) {
  if (!npc || typeof npc !== "object") return null;
  if (!game.user.can("ACTOR_CREATE")) {
    ui.notifications.warn(game.i18n.localize("GGNF.Errors.NoActorPerm"));
    return null;
  }

  // Guard: ensure required fields exist so the biography never reads "undefined".
  const race       = npc.race       ?? "human";
  const occupation = npc.occupation ?? game.i18n.localize("GGNF.Fallback.Occupation");
  const trait      = npc.trait      ?? game.i18n.localize("GGNF.Fallback.Trait");
  const threat     = npc.threat     ?? "minion";
  const name       = npc.name       ?? game.i18n.localize("GGNF.Fallback.Name");

  const bio = game.i18n.format("GGNF.Actor.Bio", { race, occupation, trait });

  let data = { name, type: isDnd5e() ? "npc" : (Object.keys(game.documentTypes.Actor).find(t => t !== "base") ?? "base") };

  if (isDnd5e()) {
    const tier = THREAT_TIERS[threat] ?? THREAT_TIERS.minion;
    const abilities = {};
    for (const ab of ["str", "dex", "con", "int", "wis", "cha"]) {
      abilities[ab] = { value: roll3d6() };
    }
    // HP comes from the threat tier's range, so bosses are actually tough.
    const hp = randInt(tier.hp[0], tier.hp[1]);
    data = foundry.utils.mergeObject(data, {
      system: {
        abilities,
        attributes: { hp: { value: hp, max: hp } },
        details: {
          biography: { value: `<p>${bio}</p>` },
          cr: tier.cr,
          type: { value: "humanoid" }
        }
      },
      flags: { [MODULE_ID]: { generated: true, race, threat } }
    });
  } else {
    // Agnostic: just name + a journal-style note in flags.
    data.flags = { [MODULE_ID]: { generated: true, race, note: bio } };
  }

  try {
    const actor = await Actor.create(data);
    ui.notifications.info(game.i18n.format("GGNF.Actor.Created", { name }));
    actor?.sheet?.render(true);
    return actor;
  } catch (err) {
    console.error(`${MODULE_ID} | actor creation failed`, err);
    ui.notifications.error(game.i18n.localize("GGNF.Errors.ActorFailed"));
    return null;
  }
}

/**
 * Create an Item from a magic item descriptor (see items.mjs#generateItem).
 */
export async function createMagicItem(item) {
  if (!item || typeof item !== "object") return null;
  if (!game.user.can("ITEM_CREATE")) {
    ui.notifications.warn(game.i18n.localize("GGNF.Errors.NoItemPerm"));
    return null;
  }

  const TYPE_MAP_5E = {
    weapon: "weapon", armor: "equipment", potion: "consumable",
    ring: "equipment", wand: "consumable", scroll: "consumable", wondrous: "equipment"
  };

  // Guard against a missing flavor so the description never reads "undefined".
  const name   = item.name   ?? game.i18n.localize("GGNF.Fallback.Item");
  const flavor = item.flavor ?? game.i18n.localize("GGNF.Fallback.Flavor");
  const itemType = item.type ?? "wondrous";
  const desc = `<p><em>${flavor}</em></p>`;

  let data = { name, type: isDnd5e() ? (TYPE_MAP_5E[itemType] ?? "loot") : (Object.keys(game.documentTypes.Item).find(t => t !== "base") ?? "base") };

  if (isDnd5e()) {
    data = foundry.utils.mergeObject(data, {
      system: {
        description: { value: desc },
        rarity: item.dnd5eRarity ?? "common"
      },
      flags: { [MODULE_ID]: { generated: true } }
    });
  } else {
    data.flags = { [MODULE_ID]: { generated: true, rarity: item.rarity ?? "common", note: flavor } };
  }

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
