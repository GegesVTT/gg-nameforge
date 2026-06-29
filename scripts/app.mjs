/**
 * GG Nameforge — Main application (ApplicationV2, v12–v14).
 */

const MODULE_ID = "gg-nameforge";

import { generateNPC, RACES } from "./npc.mjs";
import { generateItem } from "./items.mjs";
import { createNPCActor, createMagicItem } from "./foundry-create.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class NameforgeApp extends HandlebarsApplicationMixin(ApplicationV2) {
  #mode = "npc";        // "npc" | "item"
  #view = "single";     // "single" | "list"
  #race = "human";
  #gender = "male";
  #itemType = "random";
  #results = [];        // current generated batch

  static DEFAULT_OPTIONS = {
    id: "gg-nameforge-app",
    classes: ["gg-nameforge"],
    window: { title: "GGNF.Title", icon: "fa-solid fa-feather-pointed", resizable: false },
    position: { width: 420, height: "auto" },
    actions: {
      setMode: NameforgeApp.#onSetMode,
      setView: NameforgeApp.#onSetView,
      generate: NameforgeApp.#onGenerate,
      createActor: NameforgeApp.#onCreateActor,
      createItem: NameforgeApp.#onCreateItem,
      copyName: NameforgeApp.#onCopyName
    }
  };

  static PARTS = { main: { template: `modules/${MODULE_ID}/templates/nameforge.hbs` } };

  get lang() {
    return (game.i18n.lang === "es") ? "es" : "en";
  }

  async _prepareContext() {
    if (!this.#results.length) this.#regenerate();

    return {
      mode: this.#mode,
      view: this.#view,
      isNPC: this.#mode === "npc",
      race: this.#race,
      gender: this.#gender,
      itemType: this.#itemType,
      races: RACES.map(r => ({ key: r, label: game.i18n.localize(`GGNF.Race.${r}`), selected: r === this.#race })),
      genders: ["male", "female", "neutral", "random"].map(g => ({ key: g, label: game.i18n.localize(`GGNF.Gender.${g}`), selected: g === this.#gender })),
      itemTypes: ["random", "weapon", "armor", "potion", "ring", "wand", "scroll", "wondrous"].map(t => ({ key: t, label: game.i18n.localize(`GGNF.ItemType.${t}`), selected: t === this.#itemType })),
      results: this.#results.map(r => this.#decorate(r)),
      single: this.#view === "single"
    };
  }

  #decorate(r) {
    if (this.#mode === "npc") {
      return {
        ...r,
        raceLabel: game.i18n.localize(`GGNF.Race.${r.race}`),
        genderIcon: r.gender === "female" ? "fa-venus" : r.gender === "male" ? "fa-mars" : "fa-genderless",
        occupationLabel: r.occupation,
        traitLabel: r.trait,
        subtitle: `${game.i18n.localize(`GGNF.Race.${r.race}`)} · ${r.occupation}`
      };
    }
    return {
      ...r,
      rarityLabel: game.i18n.localize(`GGNF.Rarity.${r.rarity}`),
      typeLabel: game.i18n.localize(`GGNF.ItemType.${r.type}`),
      subtitle: `${game.i18n.localize(`GGNF.Rarity.${r.rarity}`)} · ${game.i18n.localize(`GGNF.ItemType.${r.type}`)}`
    };
  }

  #regenerate() {
    const count = this.#view === "single" ? 1 : 8;
    this.#results = [];
    for (let i = 0; i < count; i++) {
      this.#results.push(
        this.#mode === "npc"
          ? generateNPC({ race: this.#race, gender: this.#gender, lang: this.lang })
          : generateItem(this.lang, this.#itemType === "random" ? null : this.#itemType)
      );
    }
  }

  /* ---- Actions ---- */

  static #onSetMode(_e, t) { this.#mode = t.dataset.value; this.#results = []; this.render(); }
  static #onSetView(_e, t) { this.#view = t.dataset.value; this.#results = []; this.render(); }

  static #onGenerate() {
    // Read current selector values from the form before generating.
    const root = this.element;
    if (this.#mode === "npc") {
      this.#race = root.querySelector('[name="race"]')?.value ?? this.#race;
      this.#gender = root.querySelector('[name="gender"]')?.value ?? this.#gender;
    } else {
      this.#itemType = root.querySelector('[name="itemType"]')?.value ?? this.#itemType;
    }
    this.#regenerate();
    this.render();
  }

  static async #onCreateActor(_e, t) {
    const idx = Number(t.dataset.index);
    const npc = this.#results[idx];
    if (npc) await createNPCActor(npc);
  }

  static async #onCreateItem(_e, t) {
    const idx = Number(t.dataset.index);
    const item = this.#results[idx];
    if (item) await createMagicItem(item);
  }

  static async #onCopyName(_e, t) {
    const idx = Number(t.dataset.index);
    const r = this.#results[idx];
    if (!r) return;
    try {
      await game.clipboard.copyPlainText(r.name);
      ui.notifications.info(game.i18n.format("GGNF.Copied", { name: r.name }));
    } catch {
      ui.notifications.warn(r.name);
    }
  }
}
