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
 *   <archetype> → guard, bandit, warrior, priest, mage, occultist
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
      priest: [
        "blesses you at inconvenient moments",
        "quotes scripture slightly wrong",
        "calls you \"child\" regardless of your age",
        "thanks their god for your answers"
      ],
      mage: [
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
      priest: [
        "kneecaps ruined by prayer",
        "a holy symbol worn smooth"
      ],
      mage: [
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
      priest: [
        "apologises to objects they break",
        "fasts on days nobody else observes",
        "blesses the dead of both sides"
      ],
      mage: [
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
      priest: [
        "needs a sin carried out of town",
        "is losing their faith and testing yours",
        "wants a burial done right, and quietly",
        "has a confession that isn't theirs to make",
        "is certain you were sent"
      ],
      mage: [
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
  // Falls back to English until other languages land: a missing table should
  // never leave the biography empty.
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
export function flavorToBiography(flavor, { occupation = "", trait = "" } = {}) {
  const L = (k) => game.i18n.localize(`GGNF.Flavor.${k}`);
  const line = (label, value) => (value ? `<li><strong>${label}:</strong> ${value}</li>` : "");
  const head = [occupation, trait].filter(Boolean).join(" · ");
  return [
    head ? `<p><em>${head}</em></p>` : "",
    "<ul>",
    line(L("Looks"), flavor.appearance),
    line(L("Speaks"), flavor.mannerism),
    line(L("Quirk"), flavor.quirk),
    line(L("Wants"), flavor.hook),
    "</ul>"
  ].filter(Boolean).join("\n");
}
