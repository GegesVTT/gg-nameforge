/**
 * GG Nameforge — cáscara de improvisación (v2.3).
 *
 * Dos momentos que el formulario no cubre:
 *
 * 1. GENERACIÓN INSTANTÁNEA — los jugadores entran a la taberna y preguntan
 *    cómo se llama el tabernero MIENTRAS te miran. Un gesto (hotkey o botón),
 *    cero preguntas: raza y género al azar, CR acorde al nivel del grupo,
 *    ficha abierta. Refinar después, si el PNJ prende.
 *
 * 2. PROMOCIÓN — el dolor clásico: el PNJ improvisado que los jugadores
 *    adoptan. Tres sesiones después necesita mecánica de verdad. Click
 *    derecho → Promover: se re-genera el stat block a un CR mayor
 *    CONSERVANDO nombre, cara, token y biografía. La identidad es sagrada;
 *    los números son reemplazables.
 */

import { generateNPC } from "./npc.mjs";
import { createNPCActor, buildPrototypeActorData, crLabel } from "./foundry-create.mjs";
import { pickPrototype } from "./prototypes.mjs";
import { CR_TIERS } from "./srd-kit.mjs";
import { resolveLang, genT } from "./i18n.mjs";
import { RACES } from "./names-data.mjs";

const MODULE_ID = "gg-nameforge";

/* ── CR automático según el grupo ───────────────────────────────────────── */

/** Claves de tier en orden ascendente de CR. */
const TIER_ORDER = ["cr0", "cr1_4", "cr1_2", "cr1", "cr2", "cr3", "cr4", "cr5", "cr6", "cr7", "cr8", "cr9", "cr10"];

/**
 * Nivel de grupo → tier de PNJ improvisado. Deliberadamente conservador:
 * el PNJ de improvisación suele ser social (tabernero, mercader, guardia),
 * no el jefe del arco. Exportada pura para el harness.
 */
export function crKeyForLevel(avgLevel) {
  if (!Number.isFinite(avgLevel) || avgLevel <= 0) return "cr1_2";
  if (avgLevel <= 2) return "cr1_4";
  if (avgLevel <= 4) return "cr1_2";
  if (avgLevel <= 7) return "cr1";
  if (avgLevel <= 10) return "cr2";
  if (avgLevel <= 13) return "cr3";
  if (avgLevel <= 16) return "cr4";
  return "cr5";
}

/** Nivel promedio de los personajes con dueño jugador, o null si no hay. */
function partyAverageLevel() {
  try {
    const pcs = game.actors.filter((a) =>
      a.type === "character" && a.hasPlayerOwner);
    if (!pcs.length) return null;
    const total = pcs.reduce((sum, a) =>
      sum + (a.system?.details?.level ?? a.system?.attributes?.level ?? 1), 0);
    return total / pcs.length;
  } catch {
    return null;
  }
}

/** Tier efectivo del PNJ rápido: setting fijo, o auto por nivel de grupo. */
export function quickCRKey() {
  let setting = "auto";
  try { setting = game.settings.get(MODULE_ID, "quickCR"); } catch { /* pre-init */ }
  if (setting !== "auto" && CR_TIERS[setting]) return setting;
  return crKeyForLevel(partyAverageLevel());
}

/* ── Generación instantánea ─────────────────────────────────────────────── */

/** Un PNJ completo en un gesto. Todo random, CR acorde, ficha abierta. */
export async function quickGenerate() {
  if (!game.user?.isGM) return null;
  const lang = resolveLang();
  const cr = quickCRKey();
  try {
    const npc = await generateNPC({
      race: "random", gender: "random", kind: "random", lang, cr
    });
    const actor = await createNPCActor(npc);
    actor?.sheet?.render(true);
    return actor;
  } catch (e) {
    console.error(`${MODULE_ID} | quickGenerate falló:`, e);
    ui.notifications.error(game.i18n.localize("GGNF.Quick.Failed"));
    return null;
  }
}

/* ── Promoción ──────────────────────────────────────────────────────────── */

/** Tiers estrictamente mayores al CR actual del actor. */
export function promotionTargets(currentCR) {
  return TIER_ORDER.filter((k) => (CR_TIERS[k]?.cr ?? 0) > currentCR);
}

/**
 * Qué ítems embebidos se reemplazan al promover: el equipamiento de combate
 * es parte del stat block; el botín, las pociones y los objetos de misión
 * que el GM le fue dando al PNJ adoptado se CONSERVAN.
 */
const REPLACEABLE_TYPES = new Set(["weapon", "equipment", "feat", "spell"]);

/**
 * Re-genera la mecánica de un actor existente a un CR mayor, conservando
 * identidad: nombre, imagen, token, carpeta, permisos y biografía.
 */
export async function promoteActor(actor, { crKey, kind } = {}) {
  if (!actor || !crKey || !CR_TIERS[crKey]) return null;
  const flags = actor.flags?.[MODULE_ID] ?? {};
  const lang = resolveLang();
  const race = flags.race ?? "human";
  const archetype = flags.archetype ?? "guard";
  const finalKind = kind ?? flags.kind ?? "martial";
  const currentCR = Number(actor.system?.details?.cr ?? 0);

  // Buscar el stat block oficial más cercano al CR nuevo.
  let ruleset = null;
  try { ruleset = game.settings.get(MODULE_ID, "prototypeSource"); } catch { /* default */ }
  if (ruleset === "off") ruleset = "modern"; // promover exige un prototipo
  const targetCR = CR_TIERS[crKey].cr;
  const proto = await pickPrototype({ cr: targetCR, race, kind: finalKind, RACES, ruleset: ruleset ?? "modern" });
  if (!proto) {
    ui.notifications.warn(game.i18n.localize("GGNF.Promote.NoPrototype"));
    return null;
  }
  const pack = game.packs.get(proto.pack);
  const idx = pack ? await pack.getIndex() : null;
  const hit = idx ? [...idx].find((e) => e.name === proto.name) : null;
  const protoDoc = hit ? await pack.getDocument(hit._id) : null;
  if (!protoDoc) {
    ui.notifications.warn(game.i18n.localize("GGNF.Promote.NoPrototype"));
    return null;
  }

  const given = actor.name.split(/\s+/)[0];
  const { data, finalCR, boosted } = await buildPrototypeActorData({
    protoDoc, protoName: proto.name, protoCR: proto.cr,
    name: actor.name, given, lang, race, archetype, crKey, kind: finalKind
  });

  /* Guard: el catálogo devuelve el statblock MÁS CERCANO, que puede ser de CR
     igual o menor al actual (pedir CR 6 desde CR 5 sin nada mejor en los
     packs). Promover hacia el costado borraría ítems para nada: se aborta
     antes de tocar al actor. Para casters, finalCR ya incluye el refuerzo de
     spellbook, así que el guard lo contempla. */
  if (finalCR <= currentCR) {
    ui.notifications.warn(game.i18n.format("GGNF.Promote.NoBetter",
      { name: actor.name, cr: crLabel(currentCR) }));
    return null;
  }

  // ── Identidad sagrada: nada de esto se toca ──
  delete data.name;
  delete data.img;
  delete data.prototypeToken;
  delete data.folder;
  delete data.ownership;
  // La biografía existente se conserva y se le anota la promoción.
  const oldBio = actor.system?.details?.biography?.value ?? "";
  const note = genT(lang, "promoted", { cr: crLabel(finalCR) });
  foundry.utils.setProperty(data, "system.details.biography.value",
    `${oldBio}\n<p><em>${proto.name} · ${note}</em></p>`);

  // ── Reemplazo de mecánica ──
  const toDelete = actor.items.filter((i) => REPLACEABLE_TYPES.has(i.type)).map((i) => i.id);
  if (toDelete.length) await actor.deleteEmbeddedDocuments("Item", toDelete);
  const newItems = data.items ?? [];
  delete data.items;
  await actor.update({
    system: data.system,
    [`flags.${MODULE_ID}`]: {
      ...flags,
      source: "promoted",
      prototype: proto.name, pack: proto.pack,
      kind: finalKind, requestedCR: crKey,
      actualCR: finalCR, baseCR: proto.cr,
      promotedFromCR: currentCR, spellbookBoost: boosted
    }
  });
  if (newItems.length) await actor.createEmbeddedDocuments("Item", newItems);

  ui.notifications.info(game.i18n.format("GGNF.Promote.Done",
    { name: actor.name, from: crLabel(currentCR), to: crLabel(finalCR) }));
  return actor;
}

/** Diálogo de promoción: CR objetivo + rol. */
export async function promptPromotion(actor) {
  if (!actor || !game.user?.isGM) return null;
  const currentCR = Number(actor.system?.details?.cr ?? 0);
  const targets = promotionTargets(currentCR);
  if (!targets.length) {
    ui.notifications.warn(game.i18n.localize("GGNF.Promote.MaxCR"));
    return null;
  }
  const crOptions = targets.map((k) =>
    `<option value="${k}">CR ${crLabel(CR_TIERS[k].cr)}</option>`).join("");
  const currentKind = actor.flags?.[MODULE_ID]?.kind ?? "martial";
  const kindOptions = ["martial", "caster"].map((k) =>
    `<option value="${k}" ${k === currentKind ? "selected" : ""}>${game.i18n.localize(`GGNF.Kind.${k}`)}</option>`).join("");
  const content = `
    <p>${game.i18n.format("GGNF.Promote.Intro", { name: actor.name, cr: crLabel(currentCR) })}</p>
    <div class="form-group"><label>${game.i18n.localize("GGNF.Promote.TargetCR")}</label>
      <select name="crKey">${crOptions}</select></div>
    <div class="form-group"><label>${game.i18n.localize("GGNF.Promote.Kind")}</label>
      <select name="kind">${kindOptions}</select></div>
    <p class="notes">${game.i18n.localize("GGNF.Promote.InventoryNote")}</p>`;

  const D2 = foundry.applications?.api?.DialogV2;
  if (D2) {
    return D2.prompt({
      window: { title: game.i18n.localize("GGNF.Promote.Title") },
      content,
      ok: {
        label: game.i18n.localize("GGNF.Promote.Confirm"),
        callback: (event, button) => {
          const f = button.form.elements;
          return promoteActor(actor, { crKey: f.crKey.value, kind: f.kind.value });
        }
      }
    });
  }
  // v12: Dialog clásico.
  return new Promise((resolve) => {
    new Dialog({
      title: game.i18n.localize("GGNF.Promote.Title"),
      content: `<form>${content}</form>`,
      buttons: {
        ok: {
          label: game.i18n.localize("GGNF.Promote.Confirm"),
          callback: (html) => {
            const form = html[0]?.querySelector("form") ?? html.find("form")[0];
            resolve(promoteActor(actor, {
              crKey: form.elements.crKey.value, kind: form.elements.kind.value
            }));
          }
        },
        cancel: { label: game.i18n.localize("Cancel"), callback: () => resolve(null) }
      },
      default: "ok"
    }).render(true);
  });
}
