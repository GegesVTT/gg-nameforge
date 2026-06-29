/**
 * GG Nameforge — Foundry document creation.
 * Creates NPC Actors and magic Items from generated descriptors.
 * On dnd5e it fills randomized stats; on other systems it creates a basic
 * actor/item with the name and a biography note so nothing breaks.
 */

const MODULE_ID = "gg-nameforge";

/** 3d6 roll for ability scores. */
function roll3d6() {
  return (1 + Math.floor(Math.random() * 6)) +
         (1 + Math.floor(Math.random() * 6)) +
         (1 + Math.floor(Math.random() * 6));
}

const isDnd5e = () => game.system?.id === "dnd5e";

/**
 * Create an NPC actor from a descriptor (see npc.mjs#generateNPC).
 * Returns the created Actor or null.
 */
export async function createNPCActor(npc) {
  if (!game.user.can("ACTOR_CREATE")) {
    ui.notifications.warn(game.i18n.localize("GGNF.Errors.NoActorPerm"));
    return null;
  }

  const bio = game.i18n.format("GGNF.Actor.Bio", {
    race: npc.race, occupation: npc.occupation, trait: npc.trait
  });

  let data = { name: npc.name, type: isDnd5e() ? "npc" : (Object.keys(game.documentTypes.Actor).find(t => t !== "base") ?? "base") };

  if (isDnd5e()) {
    const abilities = {};
    for (const ab of ["str", "dex", "con", "int", "wis", "cha"]) {
      abilities[ab] = { value: roll3d6() };
    }
    const conMod = Math.floor((abilities.con.value - 10) / 2);
    const hp = Math.max(1, Math.floor(Math.random() * 8) + 1 + conMod); // ~1d8+conMod, CR low
    data = foundry.utils.mergeObject(data, {
      system: {
        abilities,
        attributes: { hp: { value: hp, max: hp } },
        details: {
          biography: { value: `<p>${bio}</p>` },
          cr: 0,
          type: { value: "humanoid" }
        }
      },
      flags: { [MODULE_ID]: { generated: true, race: npc.race } }
    });
  } else {
    // Agnostic: just name + a journal-style note in flags.
    data.flags = { [MODULE_ID]: { generated: true, race: npc.race, note: bio } };
  }

  try {
    const actor = await Actor.create(data);
    ui.notifications.info(game.i18n.format("GGNF.Actor.Created", { name: npc.name }));
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
  if (!game.user.can("ITEM_CREATE")) {
    ui.notifications.warn(game.i18n.localize("GGNF.Errors.NoItemPerm"));
    return null;
  }

  const TYPE_MAP_5E = {
    weapon: "weapon", armor: "equipment", potion: "consumable",
    ring: "equipment", wand: "consumable", scroll: "consumable", wondrous: "equipment"
  };

  const desc = `<p><em>${item.flavor}</em></p>`;
  let data = { name: item.name, type: isDnd5e() ? (TYPE_MAP_5E[item.type] ?? "loot") : (Object.keys(game.documentTypes.Item).find(t => t !== "base") ?? "base") };

  if (isDnd5e()) {
    data = foundry.utils.mergeObject(data, {
      system: {
        description: { value: desc },
        rarity: item.dnd5eRarity ?? "common"
      },
      flags: { [MODULE_ID]: { generated: true } }
    });
  } else {
    data.flags = { [MODULE_ID]: { generated: true, rarity: item.rarity, note: item.flavor } };
  }

  try {
    const created = await Item.create(data);
    ui.notifications.info(game.i18n.format("GGNF.Item.Created", { name: item.name }));
    created?.sheet?.render(true);
    return created;
  } catch (err) {
    console.error(`${MODULE_ID} | item creation failed`, err);
    ui.notifications.error(game.i18n.localize("GGNF.Errors.ItemFailed"));
    return null;
  }
}
