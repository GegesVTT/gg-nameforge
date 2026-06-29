/**
 * GG Nameforge — Entry point.
 * Fast NPC & magic item name generator. By Geges.
 */

import { NameforgeApp } from "./app.mjs";
import { generateNPC } from "./npc.mjs";
import { generateItem } from "./items.mjs";
import { createNPCActor, createMagicItem } from "./foundry-create.mjs";

const MODULE_ID = "gg-nameforge";
let app = null;

Hooks.once("ready", () => {
  app = new NameforgeApp();

  const mod = game.modules.get(MODULE_ID);
  mod.api = {
    open: () => app.render({ force: true }),
    npc: (opts) => generateNPC(opts),
    item: (lang, type) => generateItem(lang, type),
    createNPC: (npc) => createNPCActor(npc),
    createItem: (item) => createMagicItem(item)
  };

  console.log(`${MODULE_ID} | GG Nameforge ready.`);
});

Hooks.on("getSceneControlButtons", (controls) => {
  const open = () => game.modules.get(MODULE_ID)?.api?.open();
  const tool = {
    name: "gg-nameforge",
    title: "GGNF.OpenGenerator",
    icon: "fa-solid fa-feather-pointed",
    button: true,
    order: 101,
    visible: game.user.isGM,
    onClick: open,
    onChange: open
  };

  if (Array.isArray(controls)) {
    const group = controls.find(c => c.name === "token") ?? controls[0];
    group?.tools?.push(tool);
  } else {
    const group = controls.tokens ?? Object.values(controls)[0];
    if (group?.tools) group.tools[tool.name] = tool;
  }
});
