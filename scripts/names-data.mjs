/**
 * GG Nameforge — Curated name data.
 *
 * Each race has, per language, curated first-name lists by gender plus a pool
 * of surnames/epithets. Curated lists give authentic results; when a curated
 * pool is exhausted or the user wants endless variety, the syllable engine
 * (syllables.mjs) takes over using that race's phoneme set.
 *
 * Languages: "en" and "es". Genders: male / female / neutral.
 * Names are original/common fantasy-genre names, not tied to any IP.
 */

export const RACES = ["human", "elf", "dwarf", "halfling", "orc", "tiefling", "dragonborn", "gnome"];

export const NAME_DATA = {
  human: {
    en: {
      male: ["Aldric", "Bryon", "Cedric", "Doran", "Edmund", "Garrett", "Hadrian", "Joren", "Marcus", "Roland", "Tobias", "Willem"],
      female: ["Adela", "Briony", "Carys", "Edith", "Helena", "Isolde", "Linnea", "Mariel", "Rowena", "Sabine", "Talia", "Yvaine"],
      neutral: ["Ash", "Corin", "Emery", "Hale", "Quinn", "Reese", "Sorrel", "Wren"],
      surnames: ["Ashdown", "Blackwood", "Carter", "Fairwind", "Greaves", "Holloway", "Mercer", "Stoneman", "Thorne", "Vance", "Whitlock"]
    },
    es: {
      male: ["Alonso", "Bruno", "Cristóbal", "Diego", "Esteban", "Gael", "Hugo", "Joaquín", "Mateo", "Rodrigo", "Tomás", "Vicente"],
      female: ["Alba", "Beatriz", "Carmen", "Elena", "Inés", "Lucía", "Marina", "Noa", "Renata", "Sara", "Valentina", "Ximena"],
      neutral: ["Cruz", "Guadalupe", "Trinidad", "Reyes", "Ariel", "Sol"],
      surnames: ["del Valle", "Cordero", "Fuentes", "Herrera", "Montoya", "Ribera", "Salazar", "Vega", "Carrasco", "Pardo"]
    }
  },
  elf: {
    en: {
      male: ["Aelar", "Caelynn", "Erevan", "Faelar", "Galinndan", "Ivellios", "Laucian", "Soveliss", "Thamior", "Varis"],
      female: ["Adrie", "Birel", "Caelynn", "Enna", "Felosial", "Ielenia", "Lia", "Mialee", "Shava", "Thia"],
      neutral: ["Ara", "Myr", "Sael", "Vaen", "Yll"],
      surnames: ["Amakiir", "Galanodel", "Holimion", "Liadon", "Meliamne", "Naïlo", "Siannodel", "Xiloscient"]
    },
    es: {
      male: ["Aelar", "Erevan", "Faelar", "Laucian", "Soveliss", "Thamior", "Varis", "Caelis", "Aramil", "Tharivol"],
      female: ["Adrie", "Enna", "Ielenia", "Lia", "Mialee", "Thia", "Anrae", "Silaqui", "Vadania", "Mereille"],
      neutral: ["Ara", "Myr", "Sael", "Vaen", "Yll"],
      surnames: ["Amakiir", "Galanodel", "Liadon", "Naïlo", "Siannodel", "Lunaplata", "Hojarauda", "Sombravelo"]
    }
  },
  dwarf: {
    en: {
      male: ["Adrik", "Baern", "Darrak", "Eberk", "Gardain", "Harbek", "Morgran", "Rurik", "Thoradin", "Vondal"],
      female: ["Amber", "Bardryn", "Diesa", "Eldeth", "Gunnloda", "Hlin", "Kathra", "Mardred", "Riswynn", "Torbera"],
      neutral: ["Brunn", "Dern", "Korr", "Thrain"],
      surnames: ["Balderk", "Dankil", "Fireforge", "Gorunn", "Holderhek", "Loderr", "Rumnaheim", "Strakeln", "Torunn"]
    },
    es: {
      male: ["Adrik", "Baern", "Darrak", "Gardain", "Morgran", "Rurik", "Vondal", "Thoradin", "Brottor", "Dolgrin"],
      female: ["Bardryn", "Diesa", "Eldeth", "Kathra", "Riswynn", "Torbera", "Gurdis", "Ilde", "Liftrasa"],
      neutral: ["Brunn", "Korr", "Thrain", "Dern"],
      surnames: ["Forjafuego", "Balderk", "Loderr", "Martillo", "Yunque", "Rumnaheim", "Barbahierro", "Rocafirme", "Cavernaprofunda"]
    }
  },
  halfling: {
    en: {
      male: ["Alton", "Cade", "Eldon", "Garret", "Lyle", "Milo", "Osborn", "Roscoe", "Wellby"],
      female: ["Andry", "Bree", "Cora", "Euphemia", "Jillian", "Lavinia", "Merla", "Portia", "Seraphina"],
      neutral: ["Finch", "Nob", "Pip", "Tansy"],
      surnames: ["Brushgather", "Goodbarrel", "Greenbottle", "High-hill", "Leagallow", "Tealeaf", "Thorngage", "Underbough"]
    },
    es: {
      male: ["Alton", "Cade", "Lyle", "Milo", "Osborn", "Roscoe", "Wenncho", "Garmo", "Lindal"],
      female: ["Bree", "Cora", "Jillian", "Merla", "Portia", "Amapola", "Rosalina", "Petunia", "Verena"],
      neutral: ["Pip", "Tansy", "Nob", "Finch"],
      surnames: ["Buenbarril", "Hojaverde", "Tomillar", "Colina-alta", "Brizna", "Recogeflores", "Teteverde", "Pieligero"]
    }
  },
  orc: {
    en: {
      male: ["Dench", "Feng", "Gell", "Henk", "Holg", "Imsh", "Keth", "Krusk", "Ront", "Thokk"],
      female: ["Baggi", "Emen", "Engong", "Kansif", "Myev", "Neega", "Ovak", "Shautha", "Vola", "Yevelda"],
      neutral: ["Ag", "Brak", "Grish", "Murn"],
      surnames: ["the Cleaver", "Skullsplitter", "Ironjaw", "Bonecrusher", "the Red", "Bloodtusk", "Grimaxe"]
    },
    es: {
      male: ["Dench", "Gell", "Holg", "Krusk", "Ront", "Thokk", "Gorath", "Murg", "Brakka"],
      female: ["Baggi", "Kansif", "Myev", "Neega", "Vola", "Engong", "Shautha", "Yevelda"],
      neutral: ["Brak", "Grish", "Murn", "Ag"],
      surnames: ["el Hendidor", "Rompecráneos", "Mandíbula de Hierro", "Colmillo Sangriento", "el Rojo", "Triturahuesos", "Hachasiniestra", "el Implacable"]
    }
  },
  tiefling: {
    en: {
      male: ["Akmenos", "Barakas", "Damakos", "Iados", "Kairon", "Leucis", "Melech", "Mordai", "Skamos", "Therai"],
      female: ["Akta", "Bryseis", "Damaia", "Kallista", "Lerissa", "Makaria", "Nemeia", "Orianna", "Phelaia", "Rieta"],
      neutral: ["Carrion", "Ember", "Hope", "Nowhere", "Torment", "Vigil"],
      surnames: ["the Ashen", "Nightborn", "Hellbrand", "the Forsaken", "Emberheart", "Duskwalker"]
    },
    es: {
      male: ["Akmenos", "Damakos", "Kairon", "Melech", "Mordai", "Therai", "Barakas", "Iados", "Skamos"],
      female: ["Akta", "Damaia", "Kallista", "Nemeia", "Orianna", "Rieta", "Bryseis", "Lerissa", "Makaria"],
      neutral: ["Carroña", "Ascua", "Tormento", "Vigilia", "Esperanza", "Anhelo"],
      surnames: ["el Ceniciento", "Nacido de Noche", "Corazón de Brasa", "el Olvidado", "Marcafuego", "Caminante del Ocaso"]
    }
  },
  dragonborn: {
    en: {
      male: ["Arjhan", "Balasar", "Donaar", "Ghesh", "Heskan", "Kriv", "Medrash", "Nadarr", "Pandjed", "Tarhun"],
      female: ["Akra", "Biri", "Daar", "Farideh", "Harann", "Kava", "Korinn", "Mishann", "Nala", "Sora"],
      neutral: ["Kava", "Ophinshtalajiir", "Rendill", "Vrak"],
      surnames: ["Clethtinthiallor", "Daardendrian", "Kepeshkmolik", "Myastan", "Nemmonis", "Prexijandilin", "Verthisathurgiesh"]
    },
    es: {
      male: ["Arjhan", "Balasar", "Donaar", "Heskan", "Kriv", "Medrash", "Tarhun", "Ghesh", "Nadarr", "Pandjed"],
      female: ["Akra", "Daar", "Farideh", "Harann", "Korinn", "Nala", "Sora", "Biri", "Mishann", "Kava"],
      neutral: ["Rendill", "Vrak", "Ophin"],
      surnames: ["Daardendrian", "Kepeshkmolik", "Myastan", "Nemmonis", "Prexijandilin", "Verthisathurgiesh"]
    }
  },
  gnome: {
    en: {
      male: ["Boddynock", "Dimble", "Fonkin", "Gerbo", "Jebeddo", "Namfoodle", "Roondar", "Seebo", "Warryn", "Zook"],
      female: ["Bimpnottin", "Caramip", "Donella", "Ella", "Lilli", "Loopmottin", "Nyx", "Roywyn", "Shamil", "Waywocket"],
      neutral: ["Bink", "Fizz", "Gimble", "Sprocket"],
      surnames: ["Beren", "Daergel", "Folkor", "Garrick", "Nackle", "Murnig", "Ningel", "Scheppen", "Timbers", "Turen"]
    },
    es: {
      male: ["Boddynock", "Dimble", "Fonkin", "Jebeddo", "Namfoodle", "Seebo", "Zook", "Gerbo", "Roondar", "Warryn"],
      female: ["Caramip", "Donella", "Ella", "Lilli", "Nyx", "Roywyn", "Bimpnottin", "Shamil", "Waywocket"],
      neutral: ["Bink", "Fizz", "Gimble", "Sprocket"],
      surnames: ["Daergel", "Folkor", "Nackle", "Ningel", "Timbers", "Engranaje", "Chispa", "Tuercafina"]
    }
  }
};

/** NPC flavor pools, localized. */
export const NPC_FLAVOR = {
  en: {
    occupations: ["blacksmith", "innkeeper", "farmer", "merchant", "guard", "hunter", "scholar", "priest", "thief", "sailor", "miner", "healer", "scribe", "mercenary", "fisher", "baker", "tanner", "herbalist"],
    traits: ["gruff but kind", "nervous and twitchy", "endlessly cheerful", "secretly ambitious", "world-weary", "sharp-tongued", "deeply pious", "greedy", "loyal to a fault", "haunted by the past", "curious about everything", "quietly menacing", "absent-minded", "brave to recklessness"]
  },
  es: {
    occupations: ["herrero", "posadero", "granjero", "mercader", "guardia", "cazador", "erudito", "sacerdote", "ladrón", "marinero", "minero", "sanador", "escriba", "mercenario", "pescador", "panadero", "curtidor", "herborista"],
    traits: ["áspero pero amable", "nervioso e inquieto", "siempre alegre", "secretamente ambicioso", "cansado del mundo", "de lengua afilada", "profundamente devoto", "avaro", "leal hasta el extremo", "atormentado por el pasado", "curioso por todo", "calladamente amenazante", "distraído", "valiente hasta la temeridad"]
  }
};
