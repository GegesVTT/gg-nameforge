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

import { ARCHETYPES, CR_TIERS, assembleSRDKit, itemPacks, getIndex, norm } from "./srd-kit.mjs";
import { flavorToBiography, generateFlavor } from "./flavor-tables.mjs";
import { buildSpellbook } from "./spellbook.mjs";
import { sanitizeEmbeddedItems, applyRacialLayer, physicalCategory, CATEGORY_FOR_TYPE, leadingNoun, slugify } from "./reskin.mjs";
import { rebuildItemName } from "./items.mjs";
import { resolveLang, genT, raceLabel, archLabelOf } from "./i18n.mjs";
import { pickFallbackArt } from "./prototypes.mjs";

/** "1/4" en vez de "0.25" en notificaciones. */
export const crLabel = (n) => ({ 0.125: "1/8", 0.25: "1/4", 0.5: "1/2" }[n] ?? String(n));
const escRe = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** ¿El actor tiene arte real, o el placeholder del sistema? */
const hasRealArt = (src) => !!src && !src.endsWith(".svg") && !src.includes("mystery-man");


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

/**
 * Pipeline de revestido sobre un prototipo oficial: clonar, sanitizar,
 * capa racial, refuerzo de spellbook, limpieza y arte de respaldo.
 * Compartido por la creación (createNPCActor) y la PROMOCIÓN de un PNJ
 * existente (quick.mjs) — mismo camino, cero duplicación.
 * @returns {{data: object, finalCR: number, boosted: boolean, reqCR: number}}
 */
export async function buildPrototypeActorData({
  protoDoc, protoName, protoCR, name, given, lang, race, archetype, crKey, kind
}) {
  const data = protoDoc.toObject();
  delete data._id;
  delete data.folder;
  data.name = name;
  foundry.utils.setProperty(data, "prototypeToken.name", name);

  /* Sanitización: los ítems de los packs de 2014 nombran al PNJ original
     ("The captain makes three melee attacks") y delatan el reskin en el
     chat. Los de 2024 usan [[lookup @name lowercase]] y no lo necesitan. */
  sanitizeEmbeddedItems(data.items, protoName, given);

  // Capa racial mínima: idiomas + sentidos + units normalizadas.
  applyRacialLayer(data.system, race, raceLabel(lang, race));

  /* Refuerzo de spellbook: si el CR pedido supera al del stat block más
     cercano, se extienden slots y conjuros hasta el nivel de lanzador del CR
     pedido. El CR declarado sube a mitad de camino: los conjuros son la mitad
     de la ecuación ofensiva del DMG, no toda. */
  const reqTier = CR_TIERS[crKey] ?? CR_TIERS.cr1;
  let finalCR = protoCR;
  let boosted = false;
  if (kind === "caster" && reqTier.cr > protoCR) {
    try {
      const existing = new Set((data.items ?? [])
        .filter((i) => i.type === "spell").map((i) => norm(i.name)));
      const sb = await buildSpellbook({ archetype, crKey, excludeNames: existing });
      if (sb?.docs?.length) {
        for (const d of sb.docs) data.items.push(d.toObject());
        data.system.spells ??= {};
        for (const [k, v] of Object.entries(sb.slots)) {
          const cur = data.system.spells[k] ?? {};
          const curMax = Math.max(Number(cur.max) || 0, Number(cur.override) || 0);
          if (v.max > curMax) data.system.spells[k] = v;
        }
        // actors24 deja spellcasting en "str" por defecto: corregir.
        const cast = data.system.attributes?.spellcasting;
        if (!cast || cast === "str") {
          foundry.utils.setProperty(data, "system.attributes.spellcasting", sb.ability);
        }
        finalCR = Math.min(reqTier.cr, protoCR + Math.ceil((reqTier.cr - protoCR) / 2));
        foundry.utils.setProperty(data, "system.details.cr", finalCR);
        boosted = true;
      }
    } catch (e) {
      console.warn(`${MODULE_ID} | no pude reforzar el spellbook:`, e);
    }
  }

  // actors24 deja spellcasting en "str" incluso en marciales sin un solo
  // conjuro (probe de Garoorbek): limpiarlo.
  if (kind !== "caster"
      && !(data.items ?? []).some((i) => i.type === "spell")
      && data.system.attributes?.spellcasting === "str") {
    data.system.attributes.spellcasting = "";
  }

  // Token de respaldo: algunos prototipos (Tough Boss) vienen sin arte.
  if (!hasRealArt(data.img)) {
    const art = await pickFallbackArt({ race, kind: kind ?? "martial" });
    if (art) {
      data.img = art;
      foundry.utils.setProperty(data, "prototypeToken.texture.src", art);
    }
  }

  return { data, finalCR, boosted, reqCR: reqTier.cr };
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

  // Idioma del CONTENIDO: el que se usó para generar el descriptor (o el
  // setting del módulo), no el de la interfaz de Foundry. Un DM con Foundry
  // en inglés puede crear PNJs enteramente en español.
  const lang = npc.lang ?? resolveLang();
  const archLabel = archLabelOf(lang, archetype);
  const bio = genT(lang, "bio", { race: raceLabel(lang, race), occupation, trait });
  // El sabor va a la biografía del actor, así que GG Sheet Export lo levanta
  // solo y lo imprime en el PDF, el HTML y el Markdown. Sin acoplar los módulos.
  const flavor = npc.flavor ?? generateFlavor({ archetype, race, lang });
  const flavorHTML = flavorToBiography(flavor, { lang });

  /* ── Prototipo oficial ──────────────────────────────────────────────
     El descriptor ya eligió el stat block (generateNPC lo hace, así la tarjeta
     puede mostrarlo antes de crear nada). Acá solo se reviste: nombre, sabor y
     arte nuestros, stat block oficial intacto debajo, y la ficha declara cuál es.
     El CR queda el REAL del prototipo: si pediste CR 3 y lo más cerca era un
     Capitán Bandido de CR 2, la ficha dice CR 2. Sin disfraces. */
  if (npc.prototype && isDnd5e()) {
    try {
      const pack = game.packs.get(npc.prototype.pack);
      const idx = pack ? await pack.getIndex() : null;
      const hit = idx ? [...idx].find((e) => e.name === npc.prototype.name) : null;
      const proto = hit ? await pack.getDocument(hit._id) : null;
      if (proto) {
        const given = npc.given ?? name.split(/\s+/)[0];
        const { data, finalCR, boosted, reqCR } = await buildPrototypeActorData({
          protoDoc: proto, protoName: npc.prototype.name, protoCR: npc.prototype.cr,
          name, given, lang, race, archetype, crKey, kind: npc.combatKind ?? null
        });

        const bioTag = boosted
          ? `${npc.prototype.name} · CR ${crLabel(npc.prototype.cr)} · ${genT(lang, "bioBoost", { cr: crLabel(finalCR) })}`
          : `${npc.prototype.name} · CR ${crLabel(npc.prototype.cr)}`;
        foundry.utils.setProperty(data, "system.details.biography.value",
          `<p>${bio}</p>\n${flavorHTML}\n<p><em>${bioTag}</em></p>`);
        foundry.utils.setProperty(data, `flags.${MODULE_ID}`, {
          source: "prototype",
          prototype: npc.prototype.name, pack: npc.prototype.pack,
          archetype, race, kind: npc.combatKind ?? null,
          requestedCR: crKey, actualCR: finalCR, baseCR: npc.prototype.cr,
          spellbookBoost: boosted
        });
        const actor = await Actor.create(data);
        ui.notifications.info(game.i18n.format("GGNF.Actor.CreatedFromPrototype",
          { name, prototype: npc.prototype.name, cr: crLabel(finalCR) }));
        if (boosted) {
          ui.notifications.info(game.i18n.format("GGNF.Actor.SpellbookBoosted",
            { name, cr: crLabel(finalCR), base: crLabel(npc.prototype.cr) }));
        } else if (finalCR !== reqCR) {
          ui.notifications.warn(game.i18n.format("GGNF.Actor.CRAdjusted",
            { name, requested: crLabel(reqCR), actual: crLabel(finalCR) }));
        }
        return actor;
      }
    } catch (e) {
      // Si el clonado falla, se genera: mejor un PNJ generado que ninguno.
      console.warn(`${MODULE_ID} | no pude revestir ${npc.prototype.name}, genero de cero:`, e);
    }
  }


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
  const conMod = mod(profile[2]);
  /* HP con fórmula de dados, como un stat block de verdad: se elige la cantidad
     de d8 que aproxima el objetivo del tier y el HP pasa a ser el promedio.
     Antes quedaba un número pelado (192 sin fórmula, probe de Tarhun). */
  const hpTarget = randInt(tier.hp[0], tier.hp[1]);
  const nDice = Math.max(1, Math.round(hpTarget / (4.5 + conMod)));
  const hpFormula = conMod ? `${nDice}d8 ${conMod > 0 ? "+" : "-"} ${Math.abs(nDice * conMod)}` : `${nDice}d8`;
  const hp = Math.max(1, Math.floor(nDice * 4.5 + nDice * conMod));
  const ac = baseAC(archetype, dexMod);
  const defenses = buildDefenses(archetype, tier);

  /* Spellbook coherente por CR (v2.1): reemplaza la selección vieja por nivel
     + escuela, que era casi determinista y regalaba slots sin conjuros. Si el
     spellbook no encuentra nada (packs raros), assembleSRDKit conserva la ruta
     anterior como red de seguridad. */
  const arch = ARCHETYPES[archetype] ?? ARCHETYPES.guard;
  let spellbook = null;
  if (arch.caster) {
    try { spellbook = await buildSpellbook({ archetype, crKey }); }
    catch (err) { console.warn(`${MODULE_ID} | spellbook build failed`, err); }
  }

  // Assemble SRD kit (weapons, armor, focus) if content is present.
  let kit = { items: [], usedSRD: false, notes: [] };
  try {
    kit = await assembleSRDKit(archetype, crKey, { skipSpells: !!spellbook?.docs?.length });
  } catch (err) {
    console.warn(`${MODULE_ID} | SRD kit assembly failed, using bare actor`, err);
  }

  // Spellcasting plumbing: without the casting ability and slot overrides,
  // embedded spells show on the sheet but the NPC can't actually cast them.
  const casterAbility = spellbook?.ability ?? (arch.caster
    ? ({ arcane: "int", divine: "wis", primal: "cha" }[arch.caster.type] ?? "int")
    : null);
  const spells = {};
  if (spellbook) {
    Object.assign(spells, spellbook.slots);
  } else if (casterAbility && tier.spellCap > 0) {
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
        hp: { value: hp, max: hp, formula: hpFormula },
        ac: { flat: ac, calc: "flat" },
        spellcasting: casterAbility
      }, spells } : { attributes: {
        hp: { value: hp, max: hp, formula: hpFormula },
        ac: { flat: ac, calc: "flat" }
      } }),
      details: {
        biography: { value: `<p>${bio}</p>\n${flavorHTML}\n<p><em>${archLabel}</em></p>` },
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
    items: [...kit.items, ...(spellbook?.docs ?? []).map((d) => d.toObject())],
    flags: { [MODULE_ID]: {
      generated: true, source: "generated",
      archetype, race, kind: npc.combatKind ?? null,
      requestedCR: crKey, actualCR: tier.cr, usedSRD: kit.usedSRD
    } }
  };

  // Capa racial + normalización (movement/senses en ft, idiomas, raza).
  applyRacialLayer(data.system, race, raceLabel(lang, race));

  // Arte: la ruta generada quedaba con el npc.svg pelado. Se toma prestado el
  // token de un humanoide oficial acorde al rol y la raza.
  {
    const art = await pickFallbackArt({ race, kind: npc.combatKind ?? (arch.caster ? "caster" : "martial") });
    if (art) {
      data.img = art;
      data.prototypeToken = { texture: { src: art } };
    }
  }

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

/**
 * Busca un ítem mágico real compatible para revestir.
 * v2.1: filtra por CATEGORÍA FÍSICA (subtipo dnd5e, idioma-independiente), no
 * solo por tipo de documento. Antes "potion" podía devolver un cuenco de un
 * pie de diámetro (consumable/trinket) y el nombre generado decía "Brew".
 * Segunda pasada laxa si la categoría exacta no existe en los packs: el nombre
 * se reconstruye después con el sustantivo del objeto real, así que nunca
 * miente. Se usa itemPacks(): sistema primero, módulos al final.
 */
async function findSRDMagicItem(itemType) {
  if (!isDnd5e()) return null;
  const wantCats = CATEGORY_FOR_TYPE[itemType] ?? ["wondrous"];
  const TYPE_MATCH = {
    weapon: ["weapon"], armor: ["equipment"], potion: ["consumable"],
    ring: ["equipment"], wand: ["consumable", "equipment"],
    scroll: ["consumable"], wondrous: ["equipment", "consumable"]
  };
  const wantTypes = TYPE_MATCH[itemType] ?? ["equipment"];
  for (const strict of [true, false]) {
    for (const pack of itemPacks()) {
      let idx;
      try { idx = await getIndex(pack); } catch { continue; }
      const magic = idx.filter(e =>
        wantTypes.includes(e.type) &&
        e.system?.rarity && e.system.rarity !== "common" && e.system.rarity !== "" &&
        (!strict || wantCats.includes(physicalCategory(e)))
      );
      if (magic.length) {
        const hit = magic[Math.floor(Math.random() * magic.length)];
        try { return await pack.getDocument(hit._id); } catch { /* keep looking */ }
      }
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
      delete obj._id;
      delete obj.folder;

      /* El sustantivo del nombre sale del objeto físico REAL: si el base es
         "Figurine of Wondrous Power", el nombre generado se reconstruye sobre
         "Figurine" conservando adjetivo/efecto ("The Ancient Figurine"). Basta
         de batones que son estatuillas de cuervo. */
      const noun = leadingNoun(srd.name);
      const finalName = (noun && rebuildItemName(item.nameParts, noun)) || name;
      obj.name = finalName;

      // La descripción menciona el nombre original: reemplazarlo. El
      // identifier delataba el ítem base con un click: slug del nombre nuevo.
      let prevDesc = obj.system?.description?.value ?? "";
      if (srd.name) {
        prevDesc = prevDesc.replace(new RegExp(escRe(srd.name), "gi"), finalName);
      }
      obj.system = obj.system ?? {};
      obj.system.description = { value: `<p><em>${flavor}</em></p><hr>${prevDesc}` };
      if (obj.system.identifier) obj.system.identifier = slugify(finalName);
      // Los ActiveEffects heredan el nombre del ítem original ("Belt of Fire
      // Giant Strength" dentro del Belt of Storms, probe real): renombrarlos.
      for (const ef of obj.effects ?? []) {
        if (ef?.name && srd.name && ef.name.toLowerCase().includes(srd.name.toLowerCase())) {
          ef.name = finalName;
        }
      }
      // baseItem queda en flags: solo el GM inspecciona flags, y sirve para depurar.
      obj.flags = { ...(obj.flags ?? {}), [MODULE_ID]: { generated: true, reskinned: true, baseItem: srd.name } };
      try {
        const created = await Item.create(obj);
        ui.notifications.info(game.i18n.format("GGNF.Item.CreatedSRD", { name: finalName }));
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
