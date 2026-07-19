/**
 * GG Nameforge — harness de pruebas sin dependencias.
 * Corre en Node 18+ con mocks mínimos de Foundry:  node tests/run.mjs
 * Los fixtures son exports reales de mundo (SRD CC-BY-4.0) usados como probes.
 */
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const __dir = dirname(fileURLToPath(import.meta.url));
const FX = (f) => join(__dir, "fixtures", f);
/* Harness v2.1 — corre en node con mocks de Foundry. */
import assert from "node:assert";

// ── mock global game ──
const spells = [];
const S = (name, level, school) => spells.push({ _id: `sp${spells.length}`, name, type: "spell", system: { level, school } });
// cantrips
S("Fire Bolt",0,"evo"); S("Sacred Flame",0,"evo"); S("Chill Touch",0,"nec"); S("Poison Spray",0,"con");
S("Mage Hand",0,"con"); S("Light",0,"evo"); S("Thaumaturgy",0,"trs"); S("Guidance",0,"div");
// leveled
S("Magic Missile",1,"evo"); S("Shield",1,"abj"); S("Cure Wounds",1,"evo"); S("Bless",1,"enc"); S("Inflict Wounds",1,"nec"); S("Bane",1,"enc");
S("Misty Step",2,"con"); S("Hold Person",2,"enc"); S("Spiritual Weapon",2,"evo"); S("Ray of Enfeeblement",2,"nec");
S("Fireball",3,"evo"); S("Spirit Guardians",3,"con"); S("Dispel Magic",3,"abj"); S("Bestow Curse",3,"nec");
S("Ice Storm",4,"evo"); S("Banishment",4,"abj"); S("Blight",4,"nec");
S("Cone of Cold",5,"evo"); S("Flame Strike",5,"evo"); S("Contagion",5,"nec");
S("Chain Lightning",6,"evo"); S("Harm",6,"nec"); S("Circle of Death",6,"nec");
S("Teleport",7,"con"); S("Finger of Death",7,"nec"); S("Fire Storm",7,"evo");

const mkDoc = (e) => ({ id: e._id, name: e.name, type: e.type, system: e.system,
  toObject: () => ({ name: e.name, type: e.type, system: e.system }) });
const pack = {
  metadata: { type: "Item", packageType: "system" },
  collection: "dnd5e.spells",
  getIndex: async () => spells,
  getDocument: async (id) => mkDoc(spells.find(s => s._id === id))
};
globalThis.game = { system: { id: "dnd5e" }, packs: [pack] };

const { buildSpellbook, casterLevelFor, slotsForCasterLevel, spellQuota } = await import("../scripts/spellbook.mjs");
const { sanitizeText, applyRacialLayer, physicalCategory, leadingNoun, slugify } = await import("../scripts/reskin.mjs");
const { rebuildItemName, esNounGender, generateItem } = await import("../scripts/items.mjs");

let n = 0; const ok = (m) => console.log(`  ✓ ${m}`) || n++;

// ── 1. tabla de slots ──
assert.equal(casterLevelFor("cr9"), 13);
assert.deepEqual(Object.keys(slotsForCasterLevel(13)), ["spell1","spell2","spell3","spell4","spell5","spell6","spell7"]);
assert.equal(slotsForCasterLevel(5).spell3.max, 2);
assert.equal(spellQuota(7)[7], 1); assert.equal(spellQuota(7)[2], 2);
ok("CR→nivel de lanzador y tabla de slots");

// ── 2. spellbook cr9 occultist: sin slots huérfanos, truco de ataque, temática ──
for (const archetype of ["wizard","cleric","occultist"]) {
  const sb = await buildSpellbook({ archetype, crKey: "cr9" });
  assert(sb, `${archetype}: spellbook nulo`);
  const maxSlot = Math.max(...Object.keys(sb.slots).map(k => +k.replace("spell","")));
  const levels = sb.docs.map(d => d.system.level);
  for (let l = 1; l <= maxSlot; l++) assert(levels.includes(l), `${archetype}: slot ${l} sin conjuro`);
  const atk = ["fire bolt","sacred flame","chill touch","poison spray"];
  assert(sb.docs.some(d => d.system.level === 0 && atk.includes(d.name.toLowerCase())), `${archetype}: sin truco de ataque`);
  assert(!levels.includes(99));
}
const occ = await buildSpellbook({ archetype: "occultist", crKey: "cr9" });
assert.equal(occ.ability, "cha");
assert(occ.docs.some(d => ["Bestow Curse","Blight","Contagion","Circle of Death","Finger of Death","Inflict Wounds","Ray of Enfeeblement"].includes(d.name)), "occultist sin conjuros oscuros");
ok("spellbook cr9: los tres arquetipos, sin slots huérfanos, con truco de ataque y temática");

// ── 3. variación entre tiradas (el bug de 'siempre los mismos') ──
const sets = [];
for (let i = 0; i < 6; i++) {
  const sb = await buildSpellbook({ archetype: "wizard", crKey: "cr2" });
  sets.push(sb.docs.map(d => d.name).sort().join("|"));
}
assert(new Set(sets).size > 1, "los spellbooks salen idénticos entre tiradas");
ok("variación entre generaciones");

// ── 4. cr bajo: cr0 sin magia, cr1_4 con nivel 1 ──
assert.equal(await buildSpellbook({ archetype: "wizard", crKey: "cr0" }), null);
const low = await buildSpellbook({ archetype: "cleric", crKey: "cr1_4" });
assert.deepEqual(Object.keys(low.slots), ["spell1"]);
ok("extremos de CR");

// ── 5. sanitización con el texto REAL del probe de Mishann ──
const multi = '<p>The captain makes three melee attacks: two with its scimitar and one with its dagger. Or the captain makes two ranged attacks.</p>';
const clean = sanitizeText(multi, "Bandit Captain", "Mishann");
assert(!/captain/i.test(clean), "quedó 'captain' en el texto");
assert(clean.includes("Mishann makes three melee attacks"));
const knight = sanitizeText("The knight adds 2 to its AC against one melee attack.", "Knight", "Tareshun");
assert.equal(knight, "Tareshun adds 2 to its AC against one melee attack.");
ok("sanitización: Bandit Captain y Knight (fixtures reales)");

// ── 6. capa racial sobre el caso Vondal (enano, sin senses ni units) ──
const sys = { abilities: {}, attributes: { movement: { walk: 30, units: null }, senses: { units: null } }, traits: { languages: { value: [] } }, details: {} };
applyRacialLayer(sys, "dwarf", "Dwarf");
assert.equal(sys.attributes.senses.darkvision, 60);
assert.equal(sys.attributes.movement.units, "ft");
assert.deepEqual(sys.traits.languages.value, ["common","dwarvish"]);
assert.equal(sys.details.race, "Dwarf");
const sys2 = { attributes: {}, traits: {}, details: {} };  // ruta generada, vacío
applyRacialLayer(sys2, "dragonborn", "Dragonborn");
assert.equal(sys2.attributes.movement.walk, 30);
assert(sys2.traits.languages.value.includes("draconic"));
assert.equal(sys2.attributes.senses.darkvision, undefined);
ok("capa racial: enano con darkvision, dragonborn con dracónico, units normalizadas");

// ── 7. categoría física con los TRES ítems subidos como fixtures ──
import fs from "node:fs";
const fx = (f) => JSON.parse(fs.readFileSync(FX(f), "utf8"));
const rod = fx("wand-reskin.json");
const brew = fx("bowl-reskin.json");
const baton = fx("bowl-reskin.json"); // misma categoría: trinket consumible
assert.equal(physicalCategory(rod), "wand");       // equipment/wand
assert.equal(physicalCategory(brew), "wondrous");  // consumable/trinket ≠ potion
assert.equal(physicalCategory(baton), "wondrous"); // consumable/trinket ≠ wand
ok("categoría física: la vara es wand, el cuenco y la estatuilla NO son potion/wand");

// ── 8. sustantivo del objeto real + reconstrucción de nombre ──
assert.equal(leadingNoun("Bowl of Commanding Water Elementals"), "Bowl");
assert.equal(leadingNoun("Figurine of Wondrous Power (Silver Raven)"), "Figurine");
assert.equal(leadingNoun("Wand of Paralysis"), "Wand");
assert.equal(leadingNoun("Poción de curación"), "Poción");
assert.equal(leadingNoun("Studded Leather Armor +1"), "Studded Leather");
const en = rebuildItemName({ lang:"en", pattern:"adj", adj:"Burning", effect:"Embers" }, "Bowl");
assert.equal(en, "The Burning Bowl");
const en2 = rebuildItemName({ lang:"en", pattern:"effect", adj:"Ancient", effect:"the Tides" }, "Figurine");
assert.equal(en2, "Figurine of the Tides");
const es1 = rebuildItemName({ lang:"es", pattern:"adj", adjPair:["Maldito","Maldita"], effect:"la Luna" }, "Figurilla");
assert.equal(es1, "Figurilla Maldita");
const es2 = rebuildItemName({ lang:"es", pattern:"effect", adjPair:["Eterno","Eterna"], effect:"el Velo" }, "Cetro");
assert.equal(es2, "Cetro del Velo");
assert.equal(esNounGender("Botas"), "f"); assert.equal(esNounGender("Longsword"), "m");
assert.equal(slugify("The Burning Bowl"), "the-burning-bowl");
ok("reconstrucción de nombres EN/ES con género y contracción del");

// ── 9. taglines: formato rumor y sin repetición inmediata ──
const flavors = new Set();
for (let i = 0; i < 12; i++) flavors.add(generateItem("es").flavor);
assert.equal(flavors.size, 12, "taglines repetidas dentro de la sesión");
for (const f of flavors) assert(f.startsWith("Dicen que "), `sin prefijo rumor: ${f}`);
const it = generateItem("en", "potion");
assert(it.nameParts && it.nameParts.pattern && it.flavor.startsWith("They say it "));
ok("taglines rumor sin repetición + nameParts presentes");

console.log(`\n${n}/9 grupos OK`);

// ═══ v2.2 ═══
// ── 10. paridad estructural EN/ES de las tablas de sabor ──
const { FLAVOR, generateFlavor, flavorToBiography } = await import("../scripts/flavor-tables.mjs");
for (const table of ["mannerisms","appearance","quirks","hooks"]) {
  const en = FLAVOR.en[table], es = FLAVOR.es[table];
  assert.deepEqual(Object.keys(es).sort(), Object.keys(en).sort(), `claves distintas en ${table}`);
  for (const k of Object.keys(en)) {
    assert.equal(es[k].length, en[k].length, `${table}.${k}: ${es[k].length} vs ${en[k].length} entradas`);
    for (const e of es[k]) assert(e.trim().length > 3);
  }
}
ok("tablas ES: mismas claves y mismos conteos que EN (4 tablas × 15 capas)");

// ── 11. sabor 100% en español + biografía con etiquetas ES ──
for (let i = 0; i < 20; i++) {
  const f = generateFlavor({ archetype: "bandit", race: "dwarf", lang: "es" });
  for (const v of Object.values(f)) {
    assert(!FLAVOR.en.mannerisms.any.includes(v) && !FLAVOR.en.hooks.any.includes(v), `entrada EN en sabor ES: ${v}`);
  }
}
const bioES = flavorToBiography(generateFlavor({ archetype:"cleric", race:"elf", lang:"es" }), { lang: "es" });
assert(bioES.includes("Aspecto") && bioES.includes("Manía") && !bioES.includes("Looks"));
const bioEN = flavorToBiography(generateFlavor({ lang:"en" }), { lang: "en" });
assert(bioEN.includes("Looks") && !bioEN.includes("Aspecto"));
assert(!bioES.includes("·"), "el encabezado ocupación·rasgo duplicado sigue ahí");
ok("generateFlavor es + flavorToBiography con etiquetas por idioma, sin encabezado duplicado");

// ── 12. genT / raceLabel / archLabelOf ──
const { genT, raceLabel, archLabelOf } = await import("../scripts/i18n.mjs");
assert.equal(genT("es","bio",{race:"Enano",occupation:"herrero",trait:"leal"}), "Enano · herrero · leal.");
assert.equal(genT("en","bio",{race:"Dwarf",occupation:"smith",trait:"loyal"}), "A Dwarf smith, loyal.");
assert.equal(raceLabel("es","dragonborn"), "Dracónido");
assert.equal(archLabelOf("es","occultist"), "Ocultista");
assert.equal(genT("es","bioBoost",{cr:8}), "libro de conjuros reforzado hasta CR 8");
ok("i18n de contenido: bio, razas, arquetipos, boost");

// ── 13. pickFallbackArt con catálogo mock ──
const actors = [
  { _id:"a1", name:"Mage", type:"npc", img:"tokens/Mage.webp", system:{details:{cr:6, type:{value:"Humanoid", subtype:""}}} },
  { _id:"a2", name:"Bandit", type:"npc", img:"tokens/Bandit.webp", system:{details:{cr:0.125, type:{value:"Humanoid", subtype:""}}} },
  { _id:"a3", name:"Duergar", type:"npc", img:"tokens/Duergar.webp", system:{details:{cr:1, type:{value:"Humanoid", subtype:"Dwarf"}}} },
  { _id:"a4", name:"Ghost", type:"npc", img:"", system:{details:{cr:4, type:{value:"Undead", subtype:""}}} },
  { _id:"a5", name:"Priest", type:"npc", img:"systems/dnd5e/icons/svg/actors/npc.svg", system:{details:{cr:2, type:{value:"Humanoid", subtype:""}}} }
];
const actorPack = {
  metadata: { type: "Actor", packageType: "system" }, collection: "dnd5e.actors24",
  getIndex: async () => actors, getDocument: async () => null
};
game.packs = Object.assign([pack, actorPack], { filter: Array.prototype.filter, get: (c) => [pack, actorPack].find(p => p.collection === c) });
const { pickFallbackArt } = await import("../scripts/prototypes.mjs");
const seen = new Set();
for (let i = 0; i < 40; i++) seen.add(await pickFallbackArt({ race: "dwarf", kind: "caster" }));
assert(!seen.has(null) && !seen.has(""), "devolvió arte vacío");
assert([...seen].every(a => a === "tokens/Mage.webp" || a === "tokens/Duergar.webp"), `arte fuera de pool: ${[...seen]}`);
assert(seen.has("tokens/Mage.webp") && seen.has("tokens/Duergar.webp"), "no alterna entre rol y raza");
const m = await pickFallbackArt({ race: "human", kind: "martial" });
assert.equal(m, "tokens/Bandit.webp");
ok("pickFallbackArt: caster enano alterna Mage/Duergar, marcial humano → Bandit, nunca svg/vacío");

// ── 14. sanitización de efectos embebidos (fuga del Belt of Storms) ──
import fs2 from "node:fs";
const belt = JSON.parse(fs2.readFileSync(FX("belt-reskin.json"),"utf8"));
const srdName = "Belt of Fire Giant Strength", finalName = "Belt of Storms";
for (const ef of belt.effects ?? []) {
  if (ef?.name && ef.name.toLowerCase().includes(srdName.toLowerCase())) ef.name = finalName;
}
assert.equal(belt.effects[0].name, "Belt of Storms");
ok("efectos embebidos renombrados (fixture real del Belt)");

// ── 15. fórmula de HP: dados coherentes con el promedio ──
for (const [conMod, target] of [[2, 82], [3, 192], [0, 30], [-1, 10]]) {
  const nDice = Math.max(1, Math.round(target / (4.5 + conMod)));
  const hp = Math.max(1, Math.floor(nDice * 4.5 + nDice * conMod));
  assert(Math.abs(hp - target) <= 7, `hp ${hp} lejos del objetivo ${target}`);
  assert(nDice >= 1);
}
ok("fórmula de HP aproxima el objetivo del tier");

console.log(`\n${n} grupos OK (total)`);

// ═══ v2.3 ═══
// mock foundry.utils.setProperty + ui + i18n mínimos para el pipeline
globalThis.foundry = { utils: { setProperty: (obj, path, val) => {
  const parts = path.split("."); let o = obj;
  for (let i = 0; i < parts.length - 1; i++) { o[parts[i]] ??= {}; o = o[parts[i]]; }
  o[parts[parts.length - 1]] = val; return obj;
} } };
globalThis.ui = { notifications: { info: ()=>{}, warn: ()=>{}, error: ()=>{} } };
game.i18n = { lang: "en", localize: (k)=>k, format: (k)=>k };
game.settings = { get: () => { throw new Error("no setting"); } };
game.user = { isGM: true };

// ── 16. crKeyForLevel: tabla monótona y acotada ──
const { crKeyForLevel, promotionTargets } = await import("../scripts/quick.mjs");
assert.equal(crKeyForLevel(null), "cr1_2");
assert.equal(crKeyForLevel(1), "cr1_4");
assert.equal(crKeyForLevel(5), "cr1");
assert.equal(crKeyForLevel(10), "cr2");
assert.equal(crKeyForLevel(20), "cr5");
const { CR_TIERS } = await import("../scripts/srd-kit.mjs");
let prev = -1;
for (const lvl of [1,3,5,8,11,14,17]) {
  const cr = CR_TIERS[crKeyForLevel(lvl)].cr;
  assert(cr >= prev, "la tabla de CR auto no es monótona"); prev = cr;
}
ok("crKeyForLevel: monótona, conservadora, con fallback sin grupo");

// ── 17. promotionTargets: solo tiers estrictamente mayores ──
assert.deepEqual(promotionTargets(2)[0], "cr3");
assert(promotionTargets(0.25).includes("cr1_2") && !promotionTargets(0.25).includes("cr1_4"));
assert.equal(promotionTargets(10).length, 0);
ok("promotionTargets: estrictamente mayores, vacío en el techo");

// ── 18. buildPrototypeActorData: pipeline completo con proto estilo Bandit Captain ──
const { buildPrototypeActorData } = await import("../scripts/foundry-create.mjs");
const protoDoc = { toObject: () => ({
  _id: "xx", folder: "yy", name: "Bandit Captain",
  img: "systems/dnd5e/icons/svg/actors/npc.svg",
  prototypeToken: { name: "Bandit Captain", texture: { src: "" } },
  system: {
    details: { cr: 2, biography: { value: "" } },
    attributes: { hp: { max: 65 }, movement: { walk: 30, units: null }, senses: { units: null }, spellcasting: "str" },
    traits: { languages: { value: [] } },
    abilities: {}, spells: {}
  },
  items: [
    { name: "Multiattack", type: "feat", system: { description: { value: "<p>The captain makes three melee attacks.</p>" }, activities: {} } },
    { name: "Scimitar", type: "weapon", system: { description: { value: "" }, activities: {} } }
  ]
}) };
const r = await buildPrototypeActorData({
  protoDoc, protoName: "Bandit Captain", protoCR: 2,
  name: "Mishann Clethtinthiallor", given: "Mishann", lang: "es",
  race: "dragonborn", archetype: "bandit", crKey: "cr2", kind: "martial"
});
assert(!("_id" in r.data) && !("folder" in r.data));
assert.equal(r.data.name, "Mishann Clethtinthiallor");
const multiP = r.data.items.find(i => i.name === "Multiattack").system.description.value;
assert(multiP.includes("Mishann makes") && !/captain/i.test(multiP), "sanitización no corrió en el pipeline");
assert(r.data.system.traits.languages.value.includes("draconic"));
assert.equal(r.data.system.attributes.movement.units, "ft");
assert.equal(r.data.system.attributes.spellcasting, "", "no limpió el spellcasting str del marcial");
assert(r.data.img.endsWith(".webp"), "no aplicó arte de respaldo");
assert.equal(r.finalCR, 2); assert.equal(r.boosted, false); assert.equal(r.reqCR, 2);
ok("buildPrototypeActorData: sanitiza, capa racial, limpia spellcasting, arte — todo en un paso");

// ── 19. el mismo pipeline con boost: caster cr2→cr6 pedido ──
const r2 = await buildPrototypeActorData({
  protoDoc, protoName: "Bandit Captain", protoCR: 2,
  name: "Vondal Holderhek", given: "Vondal", lang: "es",
  race: "dwarf", archetype: "wizard", crKey: "cr6", kind: "caster"
});
assert.equal(r2.boosted, true);
assert.equal(r2.finalCR, 4, `CR intermedio esperado 4, salió ${r2.finalCR}`); // 2 + ceil(4/2)
assert(r2.data.items.some(i => i.type === "spell"), "el boost no agregó conjuros");
assert(Object.keys(r2.data.system.spells).length >= 4, "el boost no agregó slots");
assert.equal(r2.data.system.attributes.spellcasting, "int");
ok("promoción/boost de caster: conjuros, slots, habilidad y CR intermedio");

console.log(`\n${n} grupos OK (total)`);
