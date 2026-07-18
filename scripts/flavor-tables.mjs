/**
 * GG Nameforge — flavor tables.
 *
 * Original content, written for this module. Nothing here is copied from
 * published table collections: those are their authors' product, and this is
 * an MIT module. Users who own third-party tables can point the module at
 * their own Foundry RollTables instead (see roadmap).
 *
 * STRUCTURE — three layers, merged at pick time:
 *   any        → fits every NPC
 *   <archetype> → guard, bandit, warrior, wizard, cleric, occultist
 *   <race>      → human, elf, dwarf, halfling, orc, tiefling, dragonborn, gnome
 *
 * Contextual entries (archetype/race) are weighted higher than universal ones,
 * so a bandit reads like a bandit without ever being predictable.
 *
 * TO EXTEND: add a key. A new archetype or race is just another array; a new
 * language is another top-level key next to `en`. Nothing else needs to change.
 *
 * REGISTER: grounded first, colourful second. An NPC should sound like a person
 * who was doing something before you walked in.
 */

import { genT } from "./i18n.mjs";

export const FLAVOR = {
  en: {
    /* ── How they speak ── */
    mannerisms: {
      any: [
        "ends every other sentence with \"...you follow?\"",
        "repeats your last three words before answering",
        "speaks just under a whisper, so you have to lean in",
        "laughs at their own jokes half a second early",
        "calls everyone \"friend\" with no warmth in it",
        "answers questions with questions",
        "pauses a beat too long before agreeing",
        "talks to your chest, never your face",
        "narrates their own actions out loud",
        "goes formal when nervous, and doesn't notice",
        "says \"supposedly\" about things they saw themselves",
        "stops mid-sentence when interrupted and never picks it up again"
      ],
      guard: [
        "quotes regulations by number",
        "uses \"move along\" as a greeting",
        "addresses everyone as \"citizen\"",
        "prefaces bad news with \"protocol says\""
      ],
      bandit: [
        "spits before speaking",
        "calls you by a name that isn't yours, on purpose",
        "prices everything out loud",
        "says \"no offence\" immediately after giving it"
      ],
      warrior: [
        "counts to three before answering anything",
        "sizes up your weapon mid-sentence",
        "phrases requests as orders",
        "says \"aye\" to things they have no intention of doing"
      ],
      cleric: [
        "blesses you at inconvenient moments",
        "quotes scripture slightly wrong",
        "calls you \"child\" regardless of your age",
        "thanks their god for your answers"
      ],
      wizard: [
        "corrects your terminology",
        "says \"technically\" before every fact",
        "trails off mid-thought to write something down",
        "explains things nobody asked about"
      ],
      occultist: [
        "addresses the weather as though it can hear",
        "refers to themselves in the third person",
        "warns you about something you never mentioned",
        "goes quiet whenever animals are near"
      ],
      human: [
        "name-drops shamelessly",
        "measures time in harvests"
      ],
      elf: [
        "pauses as if consulting a much longer memory",
        "uses your full name every single time"
      ],
      dwarf: [
        "swears by an ancestor you've never heard of",
        "measures everything in stone-weights"
      ],
      halfling: [
        "offers you food before answering anything",
        "understates everything by half"
      ],
      orc: [
        "says exactly what they mean and nothing more",
        "refers to weapons the way others refer to people"
      ],
      tiefling: [
        "answers the accusation you didn't make",
        "deflects with a joke aimed at themselves"
      ],
      dragonborn: [
        "states their clan before their opinion",
        "never uses contractions"
      ],
      gnome: [
        "takes three tangents per answer",
        "invents words and expects you to keep up"
      ]
    },

    /* ── What you notice first ── */
    appearance: {
      any: [
        "one ear chewed short and badly healed",
        "ink stains that will never wash out",
        "a burn scar shaped like a handprint",
        "eyes that don't quite track together",
        "a nose broken and reset wrong",
        "teeth filed to points",
        "a finger missing, recently",
        "hair cut with a knife, clearly their own work",
        "smells of cheap incense",
        "a tremor in the left hand, kept under control",
        "clothes a size too big, taken from someone",
        "a laugh that shows far too much gum"
      ],
      guard: [
        "a helmet that has never fit",
        "spotless tabard, ruined boots"
      ],
      bandit: [
        "three knives visible on purpose",
        "somebody else's good coat"
      ],
      warrior: [
        "old scars, every one of them on the front",
        "armour maintained better than the body inside it"
      ],
      cleric: [
        "kneecaps ruined by prayer",
        "a holy symbol worn smooth"
      ],
      wizard: [
        "burns on the fingertips only",
        "robes that have never once been washed"
      ],
      occultist: [
        "dirt that has become part of the skin",
        "something living in their hair"
      ],
      human: [
        "sunburn that never fully leaves",
        "a wedding band worn on a cord",
        "hands much older than the face"
      ],
      elf: [
        "grey at the temples, which shouldn't be possible yet",
        "a scar that predates the city",
        "moves as though nothing costs effort"
      ],
      dwarf: [
        "a beard braided with someone else's rings",
        "forge burns up both forearms",
        "a nose that has met three tables"
      ],
      halfling: [
        "permanently barefoot, permanently clean",
        "flour in every crease",
        "a coat with too many pockets"
      ],
      orc: [
        "tusks capped in silver",
        "a brand kept deliberately visible",
        "knuckles like riverstones"
      ],
      tiefling: [
        "horns filed down to stubs",
        "a tail that answers before they do",
        "eyes with no whites at all"
      ],
      dragonborn: [
        "scales dulled where the armour rubs",
        "a cracked scale never replaced",
        "breath that fogs in a warm room"
      ],
      gnome: [
        "goggles pushed up and forgotten",
        "eyebrows recently singed off",
        "hair that refuses to acknowledge gravity"
      ]
    },

    /* ── What they do without thinking ── */
    quirks: {
      any: [
        "counts coins while talking to you",
        "never sits with their back to a door",
        "knocks twice on wood, then once more",
        "feeds every animal they pass",
        "won't eat in front of strangers",
        "checks over their shoulder mid-sentence",
        "keeps one hand on a pocket that's empty",
        "flinches at bells",
        "writes down the name of everyone they meet",
        "refuses to say goodbye",
        "sleeps with a lamp lit and denies it",
        "collects buttons off the dead"
      ],
      guard: [
        "salutes reflexively, then regrets it",
        "won't take a drink on duty, takes two off it",
        "remembers every face and no names"
      ],
      bandit: [
        "counts the exits on the way in",
        "never carries what they can't drop and run",
        "pays for the first round, always"
      ],
      warrior: [
        "sharpens a blade that's already sharp",
        "eats standing up",
        "won't take the bed"
      ],
      cleric: [
        "apologises to objects they break",
        "fasts on days nobody else observes",
        "blesses the dead of both sides"
      ],
      wizard: [
        "tests every rumour with a cantrip",
        "won't touch iron without gloves",
        "takes notes during arguments"
      ],
      occultist: [
        "talks to the fire",
        "buries whatever they don't use",
        "won't cross running water after dark"
      ],
      human: [
        "swears on things they don't believe in",
        "mentions how long they've lived here, unprompted"
      ],
      elf: [
        "waits three heartbeats before every answer",
        "keeps a running tally of favours owed"
      ],
      dwarf: [
        "won't drink from anything they didn't watch poured",
        "taps stone before trusting it"
      ],
      halfling: [
        "names the meals of the day and expects you to keep up",
        "hides food for later, always"
      ],
      orc: [
        "shakes hands hard enough that it's a test",
        "stands whenever anyone else stands"
      ],
      tiefling: [
        "sits where they can watch the whole room",
        "refuses to be thanked"
      ],
      dragonborn: [
        "won't lie, so says nothing at all",
        "settles a debt before you remember it exists"
      ],
      gnome: [
        "takes apart anything left unattended",
        "answers a question you asked yesterday"
      ]
    },

    /* ── Why they're talking to you: the reason to roleplay them ── */
    hooks: {
      any: [
        "needs someone to read a letter, and won't admit why",
        "mistakes you for someone else and is delighted about it",
        "wants to sell you something that isn't theirs",
        "is waiting for someone who isn't coming",
        "owes money to whoever you last spoke to",
        "wants to know if you're hiring, without asking",
        "saw something last night and needs a witness",
        "is looking for a child who isn't lost",
        "wants your opinion on a decision already made",
        "needs a favour so small it's obviously not",
        "is being followed and would like company",
        "recognises your weapon, but not you"
      ],
      guard: [
        "needs an outsider to look into something the watch won't",
        "is covering for a colleague and it's crushing them",
        "wants you gone before their shift ends",
        "has orders they've quietly decided not to follow",
        "knows who did it and can't prove it"
      ],
      bandit: [
        "wants to sell you back your own purse",
        "offers a job that's technically legal",
        "is done with the life and needs an exit",
        "knows a shortcut, and it costs",
        "is testing whether you'd even notice"
      ],
      warrior: [
        "is looking for a fight they can lose honourably",
        "wants someone to carry a name home",
        "has a debt of blood, still unpaid",
        "is guarding something they weren't told about",
        "wants to teach someone before it's too late"
      ],
      cleric: [
        "needs a sin carried out of town",
        "is losing their faith and testing yours",
        "wants a burial done right, and quietly",
        "has a confession that isn't theirs to make",
        "is certain you were sent"
      ],
      wizard: [
        "wants a component you happen to be carrying",
        "needs a witness to something that didn't work",
        "is hunting the previous owner of a book",
        "offers knowledge instead of payment",
        "needs someone who can't read to hold a page"
      ],
      occultist: [
        "has a warning you don't want to hear",
        "needs something returned to where it was found",
        "is following a sign you happen to be standing in",
        "wants a night's shelter and nothing else",
        "knows what's under the town"
      ]
    }
  },
  es: {
    /* ── Cómo hablan ── */
    mannerisms: {
      any: [
        "termina una oración de cada dos con «...¿me sigues?»",
        "repite tus últimas tres palabras antes de contestar",
        "habla justo por debajo del susurro, para que tengas que acercarte",
        "se ríe de sus propios chistes medio segundo antes de tiempo",
        "llama a todos «amigo» sin ninguna calidez",
        "responde preguntas con preguntas",
        "hace una pausa de más antes de decir que sí",
        "le habla a tu pecho, nunca a tu cara",
        "narra sus propias acciones en voz alta",
        "se pone formal cuando está nervioso, y no lo nota",
        "dice «supuestamente» de cosas que vio con sus propios ojos",
        "se queda a mitad de frase si lo interrumpen y nunca la retoma"
      ],
      guard: [
        "cita reglamentos por número",
        "usa «circulando» como saludo",
        "se dirige a todos como «ciudadano»",
        "antecede las malas noticias con «el protocolo dice»"
      ],
      bandit: [
        "escupe antes de hablar",
        "te llama por un nombre que no es el tuyo, a propósito",
        "le pone precio a todo en voz alta",
        "dice «sin ofender» justo después de ofender"
      ],
      warrior: [
        "cuenta hasta tres antes de responder cualquier cosa",
        "mide tu arma a mitad de frase",
        "formula los pedidos como órdenes",
        "dice «claro» a cosas que no piensa hacer"
      ],
      cleric: [
        "te bendice en los momentos menos oportunos",
        "cita las escrituras ligeramente mal",
        "te llama «criatura» sin importar tu edad",
        "agradece a su dios por tus respuestas"
      ],
      wizard: [
        "corrige tu terminología",
        "dice «técnicamente» antes de cada dato",
        "se queda a mitad de idea para anotar algo",
        "explica cosas que nadie preguntó"
      ],
      occultist: [
        "le habla al clima como si pudiera oírlo",
        "habla de sí en tercera persona",
        "te advierte sobre algo que nunca mencionaste",
        "se queda en silencio cuando hay animales cerca"
      ],
      human: [
        "menciona conocidos importantes sin ningún pudor",
        "mide el tiempo en cosechas"
      ],
      elf: [
        "hace pausas como consultando una memoria mucho más larga",
        "usa tu nombre completo absolutamente siempre"
      ],
      dwarf: [
        "jura por un ancestro del que nunca oíste hablar",
        "mide todo en pesos de piedra"
      ],
      halfling: [
        "te ofrece comida antes de responder cualquier cosa",
        "subestima todo a la mitad"
      ],
      orc: [
        "dice exactamente lo que piensa y ni una palabra más",
        "habla de las armas como otros hablan de las personas"
      ],
      tiefling: [
        "responde a la acusación que no hiciste",
        "esquiva con un chiste sobre sí mismo"
      ],
      dragonborn: [
        "declara su clan antes que su opinión",
        "no abrevia nunca: cada palabra completa, cada título entero"
      ],
      gnome: [
        "se va por tres tangentes por respuesta",
        "inventa palabras y espera que le sigas el ritmo"
      ]
    },

    /* ── Lo primero que notas ── */
    appearance: {
      any: [
        "una oreja mordida y mal cicatrizada",
        "manchas de tinta que ya nunca van a salir",
        "una quemadura con forma de mano",
        "ojos que no miran del todo al mismo lado",
        "una nariz rota y mal acomodada",
        "dientes limados en punta",
        "le falta un dedo, desde hace poco",
        "pelo cortado a cuchillo, claramente obra propia",
        "huele a incienso barato",
        "un temblor en la mano izquierda, mantenido a raya",
        "ropa un talle más grande, tomada de alguien",
        "una risa que muestra demasiada encía"
      ],
      guard: [
        "un yelmo que nunca le quedó bien",
        "tabardo impecable, botas arruinadas"
      ],
      bandit: [
        "tres cuchillos a la vista, a propósito",
        "el buen abrigo de otra persona"
      ],
      warrior: [
        "cicatrices viejas, todas de frente",
        "una armadura mejor mantenida que el cuerpo que la lleva"
      ],
      cleric: [
        "rodillas arruinadas de tanto rezar",
        "un símbolo sagrado gastado de tanto tocarlo"
      ],
      wizard: [
        "quemaduras solo en las yemas de los dedos",
        "una túnica que no se lavó ni una sola vez"
      ],
      occultist: [
        "mugre que ya es parte de la piel",
        "algo vivo en el pelo"
      ],
      human: [
        "un bronceado que nunca se va del todo",
        "una alianza colgada de un cordel",
        "manos mucho más viejas que la cara"
      ],
      elf: [
        "canas en las sienes, que todavía no deberían ser posibles",
        "una cicatriz más vieja que la ciudad",
        "se mueve como si nada costara esfuerzo"
      ],
      dwarf: [
        "una barba trenzada con anillos ajenos",
        "quemaduras de forja en ambos antebrazos",
        "una nariz que conoció tres mesas"
      ],
      halfling: [
        "descalzo a perpetuidad, limpio a perpetuidad",
        "harina en cada pliegue",
        "un abrigo con demasiados bolsillos"
      ],
      orc: [
        "colmillos con casquillos de plata",
        "una marca de hierro mantenida bien visible",
        "nudillos como cantos de río"
      ],
      tiefling: [
        "cuernos limados hasta el muñón",
        "una cola que contesta antes que su dueño",
        "ojos sin nada de blanco"
      ],
      dragonborn: [
        "escamas opacas donde roza la armadura",
        "una escama rajada que nunca reemplazó",
        "un aliento que empaña el aire hasta en una sala tibia"
      ],
      gnome: [
        "antiparras subidas a la frente y olvidadas ahí",
        "cejas chamuscadas hace poco",
        "pelo que se niega a reconocer la gravedad"
      ]
    },

    /* ── Lo que hacen sin pensar ── */
    quirks: {
      any: [
        "cuenta monedas mientras te habla",
        "nunca se sienta de espaldas a una puerta",
        "golpea dos veces la madera, y después una más",
        "alimenta a todos los animales que se cruza",
        "no come frente a desconocidos",
        "mira por encima del hombro a mitad de frase",
        "mantiene una mano sobre un bolsillo que está vacío",
        "se sobresalta con las campanas",
        "anota el nombre de todos los que conoce",
        "se niega a decir adiós",
        "duerme con una lámpara encendida y lo niega",
        "colecciona botones de los muertos"
      ],
      guard: [
        "saluda por reflejo, y después se arrepiente",
        "no toma un trago de servicio, toma dos al salir",
        "recuerda todas las caras y ningún nombre"
      ],
      bandit: [
        "cuenta las salidas al entrar",
        "nunca carga lo que no pueda soltar para salir corriendo",
        "paga la primera ronda, siempre"
      ],
      warrior: [
        "afila una hoja que ya está afilada",
        "come de pie",
        "no acepta la cama"
      ],
      cleric: [
        "les pide perdón a los objetos que rompe",
        "ayuna en días que nadie más observa",
        "bendice a los muertos de ambos bandos"
      ],
      wizard: [
        "verifica cada rumor con un truco",
        "no toca hierro sin guantes",
        "toma notas durante las discusiones"
      ],
      occultist: [
        "le habla al fuego",
        "entierra lo que no usa",
        "no cruza agua corriente después del anochecer"
      ],
      human: [
        "jura por cosas en las que no cree",
        "menciona cuánto hace que vive aquí sin que nadie pregunte"
      ],
      elf: [
        "espera tres latidos antes de cada respuesta",
        "lleva la cuenta exacta de los favores que le deben"
      ],
      dwarf: [
        "no bebe de nada que no haya visto servir",
        "golpea la piedra antes de confiar en ella"
      ],
      halfling: [
        "nombra las comidas del día y espera que le sigas el ritmo",
        "esconde comida para después, siempre"
      ],
      orc: [
        "da la mano tan fuerte que es una prueba",
        "se pone de pie cada vez que alguien más se levanta"
      ],
      tiefling: [
        "se sienta donde pueda vigilar toda la sala",
        "no se deja agradecer"
      ],
      dragonborn: [
        "no miente, así que no dice nada",
        "salda una deuda antes de que recuerdes que existe"
      ],
      gnome: [
        "desarma cualquier cosa que dejen sin vigilar",
        "contesta una pregunta que hiciste ayer"
      ]
    },

    /* ── Por qué te hablan: la razón para interpretarlos ── */
    hooks: {
      any: [
        "necesita que alguien le lea una carta, y no va a admitir por qué",
        "te confunde con otra persona y está encantado con eso",
        "quiere venderte algo que no es suyo",
        "espera a alguien que no va a venir",
        "le debe dinero a la última persona con la que hablaste",
        "quiere saber si estás contratando, sin preguntarlo",
        "vio algo anoche y necesita un testigo",
        "busca a un niño que no está perdido",
        "quiere tu opinión sobre una decisión ya tomada",
        "necesita un favor tan pequeño que obviamente no lo es",
        "lo están siguiendo y le vendría bien compañía",
        "reconoce tu arma, pero no a ti"
      ],
      guard: [
        "necesita que alguien de afuera investigue lo que la guardia no quiere tocar",
        "está cubriendo a un colega y eso lo está aplastando",
        "quiere que te vayas antes de que termine su turno",
        "tiene órdenes que decidió en silencio no cumplir",
        "sabe quién fue y no puede probarlo"
      ],
      bandit: [
        "quiere venderte de vuelta tu propia bolsa",
        "ofrece un trabajo que es técnicamente legal",
        "está harto de esta vida y necesita una salida",
        "conoce un atajo, y cuesta caro",
        "está probando si siquiera lo notarías"
      ],
      warrior: [
        "busca una pelea que pueda perder con honor",
        "quiere que alguien lleve un nombre de vuelta a casa",
        "tiene una deuda de sangre, todavía impaga",
        "custodia algo que no le dijeron qué es",
        "quiere enseñarle a alguien antes de que sea tarde"
      ],
      cleric: [
        "necesita que un pecado salga del pueblo",
        "está perdiendo la fe y pone a prueba la tuya",
        "quiere un entierro bien hecho, y en silencio",
        "carga una confesión que no le corresponde hacer",
        "está seguro de que te enviaron"
      ],
      wizard: [
        "quiere un componente que casualmente llevas encima",
        "necesita un testigo de algo que no funcionó",
        "persigue al dueño anterior de un libro",
        "ofrece conocimiento en lugar de pago",
        "necesita que alguien que no sepa leer sostenga una página"
      ],
      occultist: [
        "tiene una advertencia que no quieres escuchar",
        "necesita devolver algo al lugar donde fue encontrado",
        "sigue una señal y tú estás parado justo encima de ella",
        "quiere refugio por una noche y nada más",
        "sabe qué hay debajo del pueblo"
      ]
    }
  }
};

/* ── picker ── */

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** Merged pool: contextual entries weighted x3 so the NPC reads like itself. */
function pool(table, archetype, race) {
  const universal = table.any ?? [];
  const contextual = [...(table[archetype] ?? []), ...(table[race] ?? [])];
  return [...universal, ...contextual, ...contextual, ...contextual];
}

/**
 * Flavor for one NPC.
 * @param {object} opts { archetype, race, lang }
 * @returns {{mannerism:string, appearance:string, quirk:string, hook:string}}
 */
export function generateFlavor({ archetype = "guard", race = "human", lang = "en" } = {}) {
  // ES y EN completos desde v2.2; cualquier idioma desconocido cae a EN para
  // que una tabla ausente nunca deje la biografía vacía.
  const T = FLAVOR[lang] ?? FLAVOR.en;
  const of = (key) => {
    const table = T[key] ?? FLAVOR.en[key];
    const p = pool(table, archetype, race);
    return p.length ? pick(p) : "";
  };
  return {
    mannerism: of("mannerisms"),
    appearance: of("appearance"),
    quirk: of("quirks"),
    hook: of("hooks")
  };
}

/**
 * Biography HTML for the actor sheet.
 * Lands in system.details.biography.value, which means GG Sheet Export picks it
 * up and prints it in the PDF / HTML / Markdown exports for free.
 */
export function flavorToBiography(flavor, { lang = "en" } = {}) {
  const line = (label, value) => (value ? `<li><strong>${label}:</strong> ${value}</li>` : "");
  return [
    "<ul>",
    line(genT(lang, "looks"),  flavor.appearance),
    line(genT(lang, "speaks"), flavor.mannerism),
    line(genT(lang, "quirk"),  flavor.quirk),
    line(genT(lang, "wants"),  flavor.hook),
    "</ul>"
  ].join("\n");
}
