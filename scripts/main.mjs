/**
 * GG Nameforge — Entry point.
 * Fast NPC & magic item name generator. By Geges.
 */

import { NameforgeApp } from "./app.mjs";
import { generateNPC } from "./npc.mjs";
import { generateItem } from "./items.mjs";
import { createNPCActor, createMagicItem } from "./foundry-create.mjs";
import { quickGenerate, promptPromotion } from "./quick.mjs";

const MODULE_ID = "gg-nameforge";

let _app = null;
function getApp() {
  if (!_app) _app = new NameforgeApp();
  return _app;
}

/* ── Suite Crónicas Bárdicas (gg-wp) ─────────────────────────────────────────
   Integración OPCIONAL, por feature-detection. Con gg-wp activo los botones
   viven en la sección GGWP; sin él caen a Token Controls, como siempre.
   Nunca es dependencia dura.

   Se consulta en cada render porque getSceneControlButtons puede correr antes
   de que gg-wp emita su hook ready. */
function ggwpApi() {
  const m = game.modules.get("gg-wp");
  return (m?.active && m.api) ? m.api : null;
}

Hooks.once("gg-wp.ready", (api) => {
  // Membresía explícita en la suite (el diálogo "Acerca de" lista esto).
  api.registerModule(MODULE_ID);
  // Botones de la sección GGWP. gg-wp garantiza onChange y el guard de
  // activación: solo disparan con clic real, no al entrar a la sección.
  api.registerTool({
    name: "gg-nameforge",
    title: game.i18n.localize("GGNF.OpenGenerator"),
    icon: "fa-solid fa-feather-pointed",
    order: 10,
    button: true,
    onChange: () => game.modules.get(MODULE_ID)?.api?.open()
  });
  api.registerTool({
    name: "gg-nameforge-quick",
    title: game.i18n.localize("GGNF.Quick.Button"),
    icon: "fa-solid fa-bolt",
    order: 11,
    button: true,
    onChange: () => game.modules.get(MODULE_ID)?.api?.quick()
  });
});

Hooks.once("init", () => {
  // De dónde salen los stat blocks: los packs del SRD traen dos versiones del
  // mismo PNJ (Bandit Captain está en las dos) y cinco de las seis familias
  // cambian de nombre entre 2014 y 2024. El DM elige cuál manda.
  game.settings.register(MODULE_ID, "prototypeSource", {
    name: "GGNF.Settings.PrototypeSource.Name",
    hint: "GGNF.Settings.PrototypeSource.Hint",
    scope: "world",
    config: true,
    type: String,
    choices: {
      modern: "GGNF.Settings.PrototypeSource.Modern",
      legacy: "GGNF.Settings.PrototypeSource.Legacy",
      off:    "GGNF.Settings.PrototypeSource.Off"
    },
    default: "modern"
  });

  // Language override: auto (follow Foundry), or force EN/ES.
  game.settings.register(MODULE_ID, "language", {
    name: "GGNF.Settings.Language.Name",
    hint: "GGNF.Settings.Language.Hint",
    scope: "client",
    config: true,
    type: String,
    choices: { auto: "GGNF.Settings.Language.Auto", en: "English", es: "Español" },
    default: "auto"
  });

  // CR del PNJ rápido: auto (según el nivel promedio del grupo) o fijo.
  game.settings.register(MODULE_ID, "quickCR", {
    name: "GGNF.Settings.QuickCR.Name",
    hint: "GGNF.Settings.QuickCR.Hint",
    scope: "world",
    config: true,
    type: String,
    choices: {
      auto: "GGNF.Settings.QuickCR.Auto",
      cr0: "CR 0", cr1_4: "CR 1/4", cr1_2: "CR 1/2", cr1: "CR 1",
      cr2: "CR 2", cr3: "CR 3", cr4: "CR 4", cr5: "CR 5"
    },
    default: "auto"
  });

  // Hotkey: un PNJ completo sin abrir el formulario. Editable en Configurar
  // Controles.
  game.keybindings.register(MODULE_ID, "quickNPC", {
    name: "GGNF.Keybind.QuickNPC.Name",
    hint: "GGNF.Keybind.QuickNPC.Hint",
    editable: [{ key: "KeyN", modifiers: ["Control", "Shift"] }],
    restricted: true,
    onDown: () => { quickGenerate(); return true; }
  });

  // Favorites store (world-scoped, not shown in the config menu).
  game.settings.register(MODULE_ID, "favorites", {
    scope: "world",
    config: false,
    type: Array,
    default: []
  });
});

Hooks.once("ready", () => {
  const mod = game.modules.get(MODULE_ID);
  mod.api = {
    open:       ()           => getApp().render({ force: true }),
    npc:        (opts)       => generateNPC(opts),
    item:       (lang, type) => generateItem(lang, type),
    createNPC:  (npc)        => createNPCActor(npc),
    createItem: (item)       => createMagicItem(item),
    quick:      ()           => quickGenerate(),
    promote:    (actor)      => promptPromotion(actor)
  };
  console.log(`${MODULE_ID} | GG Nameforge ready.`);
});

// ── Scene control button (compatible v12-v14) ─────────────────────────────
// Con gg-wp activo, los botones viven en la sección GGWP (los registró el hook
// gg-wp.ready de arriba) y acá NO se duplican. Sin gg-wp, fallback a Tokens.
Hooks.on("getSceneControlButtons", (controls) => {
  if (!game.user?.isGM) return;
  if (ggwpApi()) return; // la sección GGWP ya tiene los botones; no duplicar

  const open = () => game.modules.get(MODULE_ID)?.api?.open();
  const tool = {
    name:    "gg-nameforge",
    title:   "GGNF.OpenGenerator",
    icon:    "fa-solid fa-feather-pointed",
    button:  true,
    order:   101,
    visible: true,
    // v13 deprecó onClick en favor de onChange y avisa por consola en cada carga;
    // v15 lo va a eliminar. Se manda solo el que corresponde a la generación.
    ...(parseInt(game.version) >= 13 ? { onChange: open } : { onClick: open })
  };

  const quick = () => game.modules.get(MODULE_ID)?.api?.quick();
  const quickTool = {
    name:    "gg-nameforge-quick",
    title:   "GGNF.Quick.Button",
    icon:    "fa-solid fa-bolt",
    button:  true,
    order:   102,
    visible: true,
    ...(parseInt(game.version) >= 13 ? { onChange: quick } : { onClick: quick })
  };

  if (!Array.isArray(controls)) {
    const group = controls.tokens ?? Object.values(controls)[0];
    if (group?.tools) {
      group.tools[tool.name] = tool;
      group.tools[quickTool.name] = quickTool;
    }
    return;
  }
  const group = controls.find(c => c.name === "token") ?? controls[0];
  group?.tools?.push(tool, quickTool);
});

// ── Promoción: click derecho sobre un PNJ en el directorio de actores ─────
// v13 renombró el hook; se registran ambos nombres y el guard evita duplicar.
function addPromoteOption(_app, options) {
  if (!Array.isArray(options)) return;
  if (options.some((o) => o?.name === "GGNF.Promote.MenuLabel")) return;
  options.push({
    name: "GGNF.Promote.MenuLabel",
    icon: '<i class="fa-solid fa-arrow-up-right-dots"></i>',
    condition: (li) => {
      if (!game.user?.isGM) return false;
      const el = li instanceof HTMLElement ? li : li?.[0];
      const id = el?.dataset?.entryId ?? el?.dataset?.documentId;
      return game.actors.get(id)?.type === "npc";
    },
    callback: (li) => {
      const el = li instanceof HTMLElement ? li : li?.[0];
      const id = el?.dataset?.entryId ?? el?.dataset?.documentId;
      const actor = game.actors.get(id);
      if (actor) promptPromotion(actor);
    }
  });
}
Hooks.on("getActorContextOptions", addPromoteOption);           // v13+
Hooks.on("getActorDirectoryEntryContext", (html, options) =>    // v12
  addPromoteOption(null, options));
