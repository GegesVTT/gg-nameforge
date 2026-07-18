/**
 * GG Nameforge — idioma del CONTENIDO generado (v2.2).
 *
 * PROBLEMA: el setting de idioma del módulo elegía nombres y sabor de los
 * pools correctos, pero todo lo que pasaba por game.i18n (la frase de la bio,
 * las etiquetas Aspecto/Habla/Manía/Quiere, la raza declarada en la ficha)
 * salía en el idioma de la INTERFAZ de Foundry. Un DM con Foundry en inglés
 * que quería PNJs en español recibía biografías mestizas.
 *
 * SOLUCIÓN: las cadenas que terminan DENTRO de un documento creado viven acá,
 * en ambos idiomas, y se resuelven con el idioma del módulo — no el de la UI.
 * Las notificaciones y la ventana del generador siguen en el idioma de la UI,
 * que es donde corresponde.
 */

const MODULE_ID = "gg-nameforge";

/** Idioma efectivo del módulo: override del setting, o el de Foundry. */
export function resolveLang() {
  try {
    const override = game.settings.get(MODULE_ID, "language");
    if (override === "es" || override === "en") return override;
  } catch { /* setting aún no registrado */ }
  return game.i18n?.lang === "es" ? "es" : "en";
}

/** Cadenas de contenido generado. Espejo de lang/*.json para las claves que
 *  aterrizan en documentos; mantener sincronizadas al editar. */
const STRINGS = {
  en: {
    bio: "A {race} {occupation}, {trait}.",
    looks: "Looks", speaks: "Speaks", quirk: "Quirk", wants: "Wants",
    bioBoost: "spellbook reinforced to CR {cr}",
    race: {
      human: "Human", elf: "Elf", dwarf: "Dwarf", halfling: "Halfling",
      orc: "Orc", tiefling: "Tiefling", dragonborn: "Dragonborn", gnome: "Gnome"
    },
    arch: {
      warrior: "Warrior", guard: "Guard", wizard: "Wizard",
      cleric: "Cleric", bandit: "Bandit", occultist: "Occultist"
    }
  },
  es: {
    // Sin artículo: esquiva el género gramatical ("Una enano herrero") sin
    // duplicar pools de ocupaciones femeninas.
    bio: "{race} · {occupation} · {trait}.",
    looks: "Aspecto", speaks: "Habla", quirk: "Manía", wants: "Quiere",
    bioBoost: "libro de conjuros reforzado hasta CR {cr}",
    race: {
      human: "Humano", elf: "Elfo", dwarf: "Enano", halfling: "Mediano",
      orc: "Orco", tiefling: "Tiflin", dragonborn: "Dracónido", gnome: "Gnomo"
    },
    arch: {
      warrior: "Guerrero", guard: "Guardia", wizard: "Mago",
      cleric: "Clérigo", bandit: "Bandido", occultist: "Ocultista"
    }
  }
};

/** Formatea una clave del contenido generado en el idioma pedido. */
export function genT(lang, key, data = {}) {
  const T = STRINGS[lang] ?? STRINGS.en;
  let s = T[key] ?? STRINGS.en[key] ?? key;
  for (const [k, v] of Object.entries(data)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

/** Etiqueta de raza en el idioma del contenido. */
export function raceLabel(lang, race) {
  const T = STRINGS[lang] ?? STRINGS.en;
  return T.race[race] ?? STRINGS.en.race[race] ?? race;
}

/** Etiqueta de arquetipo en el idioma del contenido. */
export function archLabelOf(lang, archetype) {
  const T = STRINGS[lang] ?? STRINGS.en;
  return T.arch[archetype] ?? STRINGS.en.arch[archetype] ?? archetype;
}
