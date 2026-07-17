/**
 * GG Nameforge — Entry point.
 * Fast NPC & magic item name generator. By Geges.
 */

import { NameforgeApp } from "./app.mjs";
import { generateNPC } from "./npc.mjs";
import { generateItem } from "./items.mjs";
import { createNPCActor, createMagicItem } from "./foundry-create.mjs";

const MODULE_ID = "gg-nameforge";

let _app = null;
function getApp() {
  if (!_app) _app = new NameforgeApp();
  return _app;
}

Hooks.once("init", () => {
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
    createItem: (item)       => createMagicItem(item)
  };
  console.log(`${MODULE_ID} | GG Nameforge ready.`);
});

// ── Scene control button (compatible v12-v14) ─────────────────────────────
Hooks.on("getSceneControlButtons", (controls) => {
  if (!game.user?.isGM) return;

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

  if (!Array.isArray(controls)) {
    const group = controls.tokens ?? Object.values(controls)[0];
    if (group?.tools) group.tools[tool.name] = tool;
    return;
  }
  const group = controls.find(c => c.name === "token") ?? controls[0];
  group?.tools?.push(tool);
});
