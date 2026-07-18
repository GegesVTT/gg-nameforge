/**
 * GG Nameforge — UI (ApplicationV2, v12-v14).
 * "Doble filo" visual style: double-bevel gold frames over deep black.
 */

const MODULE_ID = "gg-nameforge";

import { generateNPC, RACES, CR_KEYS } from "./npc.mjs";
import { generateItem } from "./items.mjs";
import { createNPCActor, createMagicItem } from "./foundry-create.mjs";
import { resolveLang } from "./i18n.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class NameforgeApp extends HandlebarsApplicationMixin(ApplicationV2) {
  #mode     = "npc";          // "npc" | "item" | "favorites"
  #view     = "single";       // "single" | "list"
  #race     = "random";
  #gender   = "random";
  #combatKind = "martial";   // v2: marcial o lanzador; el arquetipo lo decide el prototipo
  #cr        = "cr1";
  #itemType = "random";
  #results  = [];
  #favorites = [];            // persisted favorites (loaded in _prepareContext)

  static DEFAULT_OPTIONS = {
    id: "gg-nameforge-app",
    classes: ["gg-nameforge"],
    window: {
      title: "GGNF.Title",
      icon:  "fa-solid fa-feather-pointed",
      resizable: false
    },
    position: { width: 440, height: "auto" },
    actions: {
      setMode:     NameforgeApp.#onSetMode,
      setView:     NameforgeApp.#onSetView,
      generate:    NameforgeApp.#onGenerate,
      createActor: NameforgeApp.#onCreateActor,
      createItem:  NameforgeApp.#onCreateItem,
      copyName:    NameforgeApp.#onCopyName,
      favorite:    NameforgeApp.#onFavorite,
      unfavorite:  NameforgeApp.#onUnfavorite
    }
  };

  static PARTS = {
    main: { template: `modules/${MODULE_ID}/templates/nameforge.hbs` }
  };

  get lang() { return resolveLang(); }

  // ── Favorites persistence (world setting, GM-scoped) ─────────────────────
  #loadFavorites() {
    try {
      this.#favorites = game.settings.get(MODULE_ID, "favorites") ?? [];
    } catch {
      this.#favorites = [];
    }
  }
  async #saveFavorites() {
    try { await game.settings.set(MODULE_ID, "favorites", this.#favorites); }
    catch (err) { console.error(`${MODULE_ID} | could not save favorites`, err); }
  }

  async _prepareContext() {
    this.#loadFavorites();

    const isFav = this.#mode === "favorites";
    if (!isFav && !this.#results.length) await this.#regenerate();

    return {
      mode:      this.#mode,
      view:      this.#view,
      isNPC:     this.#mode === "npc",
      isItem:    this.#mode === "item",
      isFav,
      single:    this.#view === "single",
      race:      this.#race,
      gender:    this.#gender,
      combatKind: this.#combatKind,
      cr:        this.#cr,
      itemType:  this.#itemType,
      favCount:  this.#favorites.length,
      races: ["random", ...RACES].map(r => ({
        key: r, label: game.i18n.localize(`GGNF.Race.${r}`), selected: r === this.#race
      })),
      genders: ["male","female","neutral","random"].map(g => ({
        key: g, label: game.i18n.localize(`GGNF.Gender.${g}`), selected: g === this.#gender
      })),
      kinds: ["martial", "caster"].map(k => ({
        key: k, label: game.i18n.localize(`GGNF.Kind.${k}`), selected: k === this.#combatKind
      })),
      crs: CR_KEYS.map(c => ({
        key: c, label: game.i18n.localize(`GGNF.CR.${c}`), selected: c === this.#cr
      })),
      itemTypes: ["random","weapon","armor","potion","ring","wand","scroll","wondrous"].map(t => ({
        key: t, label: game.i18n.localize(`GGNF.ItemType.${t}`), selected: t === this.#itemType
      })),
      results:   (isFav ? this.#favorites : this.#results).map((r, i) => this.#decorate(r, i, isFav))
    };
  }

  /** Build all display fields the template needs. Fixes the missing-field bug. */
  #decorate(r, index, isFav) {
    const base = { ...r, index, isFav };
    if ((r.kind ?? (r.archetype ? "npc" : "item")) === "npc") {
      return {
        ...base,
        isNPCCard:  true,
        genderIcon: r.gender === "female" ? "fa-venus"
                  : r.gender === "male"   ? "fa-mars"
                  : "fa-genderless",
        traitText:  r.trait,
        subtitle:   `${game.i18n.localize(`GGNF.Race.${r.race}`)} · ${r.occupation}`,
        archLabel: r.prototype
          ? `${r.prototype.name} · CR ${r.prototype.cr}`
          : game.i18n.localize("GGNF.Card.Generated"),
        protoImg: r.prototype?.img || null,
        // Sabor: lo mismo que va a la biografía del actor, visible antes de crearlo.
        flavor: r.flavor
          ? [
              { label: game.i18n.localize("GGNF.Flavor.Looks"),  text: r.flavor.appearance },
              { label: game.i18n.localize("GGNF.Flavor.Speaks"), text: r.flavor.mannerism },
              { label: game.i18n.localize("GGNF.Flavor.Quirk"),  text: r.flavor.quirk },
              { label: game.i18n.localize("GGNF.Flavor.Wants"),  text: r.flavor.hook }
            ].filter((f) => f.text)
          : null
      };
    }
    return {
      ...base,
      isNPCCard: false,
      icon:      r.icon ?? "fa-solid fa-wand-magic-sparkles",
      flavorText: r.flavor,
      subtitle:  `${game.i18n.localize(`GGNF.Rarity.${r.rarity}`)} · ${game.i18n.localize(`GGNF.ItemType.${r.type}`)}`,
      rarityClass: `ggnf-rarity-${r.rarity}`
    };
  }

  // async desde v2: elegir el prototipo implica leer los compendios.
  async #regenerate() {
    const count = this.#view === "single" ? 1 : 8;
    this.#results = await Promise.all(Array.from({ length: count }, async () => {
      if (this.#mode === "npc") {
        const npc = await generateNPC({
          race:   this.#race === "random" ? null : this.#race,
          gender: this.#gender,
          kind:   this.#combatKind,
          cr:     this.#cr,
          lang:   this.lang
        });
        npc.kind = "npc";
        return npc;
      }
      const item = generateItem(this.lang, this.#itemType === "random" ? null : this.#itemType);
      item.kind = "item";
      return item;
    }));
  }

  #readForm() {
    const el = this.element;
    if (!el) return;
    if (this.#mode === "npc") {
      this.#race   = el.querySelector('[name="race"]')?.value   ?? this.#race;
      this.#gender = el.querySelector('[name="gender"]')?.value ?? this.#gender;
      this.#combatKind = el.querySelector('[name="kind"]')?.value ?? this.#combatKind;
      this.#cr        = el.querySelector('[name="cr"]')?.value        ?? this.#cr;
    } else if (this.#mode === "item") {
      this.#itemType = el.querySelector('[name="itemType"]')?.value ?? this.#itemType;
    }
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  static #onSetMode(_e, t) {
    this.#mode = t.dataset.value;
    if (this.#mode !== "favorites") this.#results = [];
    this.render();
  }

  static #onSetView(_e, t) {
    this.#readForm();
    this.#view = t.dataset.value;
    this.#results = [];
    this.render();
  }

  static async #onGenerate() {
    this.#readForm();
    await this.#regenerate();
    this.render();
  }

  static async #onCreateActor(_e, t) {
    const r = this.#current(t);
    if (r) await createNPCActor(r);
  }

  static async #onCreateItem(_e, t) {
    const r = this.#current(t);
    if (r) await createMagicItem(r);
  }

  static async #onCopyName(_e, t) {
    const r = this.#current(t);
    if (!r) return;
    try {
      await game.clipboard.copyPlainText(r.name);
      ui.notifications.info(game.i18n.format("GGNF.Copied", { name: r.name }));
    } catch {
      ui.notifications.warn(r.name);
    }
  }

  static async #onFavorite(_e, t) {
    const r = this.#current(t);
    if (!r) return;
    this.#favorites.unshift(foundry.utils.deepClone(r));
    await this.#saveFavorites();
    ui.notifications.info(game.i18n.format("GGNF.Favorited", { name: r.name }));
    this.render();
  }

  static async #onUnfavorite(_e, t) {
    const idx = Number(t.dataset.index);
    this.#favorites.splice(idx, 1);
    await this.#saveFavorites();
    this.render();
  }

  /** Resolve the descriptor a card button refers to (favorites or results). */
  #current(t) {
    const idx = Number(t.dataset.index);
    return this.#mode === "favorites" ? this.#favorites[idx] : this.#results[idx];
  }
}
