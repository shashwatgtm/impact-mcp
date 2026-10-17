// Run 22 IMPACT round 3, impact_anchor_market (test first): the judges gave 3 four times because with the keyword presets the segment text was handed out by position and ignored
// the product, the deal size and the cycle. The answer now (1) gives, for every segment, two or three facts to find out that come from the sector notes and differ from one segment
// to the next, (2) says which segments the product text sits closest to (a second view that never changes a score), (3) uses the named parts of the product and never a shared
// word such as "services". Scores, presets, D94 behaviour and wording stay as they are. Invented companies only (Railhop, Glossa, Lingua, Northbridge, Cloudmoat).
// Run: node --no-warnings --test tests/run22-impact_anchor_market-round3.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { call, loadPool, PLACEHOLDER, repeatedSentences } from "./run22-impact-common.mjs";

const TOOL = "impact_anchor_market";
const segParas = (t) => {
  const body = (t.split("### Segment by segment")[1] || "").split("\n---")[0];
  return body.split(/\n\s*\n/).map((p) => p.trim()).filter((p) => /^\*\*/.test(p));
};
const nameOf = (p) => (p.match(/^\*\*([^*]+)\*\*/) || [])[1] || "";
// the paragraph without the segment name and the score reason, to compare what is said
const said = (p) => p.replace(/^\*\*[^*]+\*\* \([^)]*\)\.?/, "").replace(new RegExp(nameOf(p).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), "SEG").replace(/\s+/g, " ").trim();

const RAIL = { product_description: "Railhop, freight visibility software that tracks every load across carriers and modes: live ETAs, exception alerts and a shipper portal", potential_segments: ["Automotive", "Chemicals", "Food and beverage", "Retail"], average_deal_size: "$250,000", sales_cycle: "150 days" };
const GLOSSA = { product_description: "Glossa, a localization and translation management platform with an SDK, over-the-air updates and AI translation for apps and websites", potential_segments: ["Enterprise software", "Mobile apps and games", "E-commerce", "Media"], average_deal_size: "$9,000", sales_cycle: "45 days" };
const LINGUA = { product_description: "Lingua, a sovereign AI platform: speech, translation and document models for Indian languages, APIs and voice agents, with forward deployed engineers", potential_segments: ["Financial services", "Government", "Education", "Technology"], average_deal_size: "$60,000", sales_cycle: "75 days" };
const NORTH = { product_description: "Northbridge, an IT services and consulting company that builds and runs enterprise applications with its own platforms: Quickforge for AI driven development, Cloudsmith for cloud migration and Watchtower for AIOps", potential_segments: ["Financial services", "Banking", "Insurance", "Manufacturing"], average_deal_size: "$2,000,000", sales_cycle: "180 days" };

test("round 3: every segment gets its own two or three facts, and no two segments say the same thing", async () => {
  for (const args of [RAIL, GLOSSA, LINGUA, NORTH]) {
    const t = await call(TOOL, args);
    const paras = segParas(t);
    assert.equal(paras.length, args.potential_segments.length, args.product_description.slice(0, 20));
    for (const p of paras) {
      const facts = p.match(/\((\d)\) /g) || [];
      assert.ok(facts.length >= 2 && facts.length <= 3, `${nameOf(p)}: ${facts.length} facts`);
    }
    const said1 = paras.map(said);
    assert.equal(new Set(said1).size, said1.length, `segment texts are not all different: ${args.product_description.slice(0, 20)}`);
    // every segment has at least one fact that no other segment has, and no two segments have the same set of facts
    const factsOf = (p) => (p.split(/ Find out /)[1] || "").split(/; \(\d\) |^\(\d\) /).map((f) => f.replace(/^\(\d\) /, "").trim()).filter(Boolean).map((f) => f.replace(new RegExp(nameOf(p).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), "SEG"));
    const sets = paras.map(factsOf);
    for (let i = 0; i < sets.length; i++) {
      const others = new Set(sets.filter((_, j) => j !== i).flat());
      assert.ok(sets[i].some((f) => !others.has(f)), `${nameOf(paras[i])} has no fact of its own: ${args.product_description.slice(0, 20)}`);
    }
  }
});

test("round 3: the facts use the deal size and the cycle and come from the sector notes (who signs, how the sale usually runs, a pilot)", async () => {
  const t = await call(TOOL, RAIL);
  const paras = segParas(t);
  const all = paras.join("\n");
  assert.match(all, /\$250,000/);
  assert.match(all, /150 days/);
  assert.match(all, /COO or Head of Supply Chain|Head of Supply Chain/, "the signer role of the sector notes");
  assert.match(all, /pilot/i, "the usual pilot of the sector notes");
  assert.match(t, /two or three facts/i, "the opening says that facts, not a keyword, would break the tie");
});

test("round 3: public and regulated segments are asked how they buy, with the user's cycle; a size word is asked about too", async () => {
  const t = await call(TOOL, LINGUA);
  const paras = segParas(t);
  const gov = paras.find((p) => nameOf(p) === "Government"), edu = paras.find((p) => nameOf(p) === "Education"), fin = paras.find((p) => nameOf(p) === "Financial services"), tech = paras.find((p) => nameOf(p) === "Technology");
  assert.match(gov, /tender|formal|procure/i);
  assert.match(gov, /75 days/);
  assert.match(edu, /budget|tender|approv/i);
  assert.notEqual(said(gov), said(edu));
  assert.match(fin, /security|compliance|review|risk/i);
  assert.match(tech, /API|SDK|developer|evaluation|sandbox/i);
  const e = await call(TOOL, GLOSSA);
  const ent = segParas(e).find((p) => nameOf(p) === "Enterprise software");
  assert.match(ent, /\$9,000/);
  assert.match(ent, /45 days/);
  assert.match(ent, /procurement|security|committee|review|sign/i);
});

test("round 3: a second view says which segments the product text sits closest to, never changes a score, and names where it differs from the presets", async () => {
  const t = await call(TOOL, LINGUA);
  assert.match(t, /\*\*Product fit\.\*\*/);
  const fit = (t.match(/\*\*Product fit\.\*\*[^\n]*/) || [""])[0];
  assert.match(fit, /Government/);
  assert.match(fit, /Education/);
  assert.match(fit, /translation and document models for Indian languages/);
  const g = await call(TOOL, GLOSSA);
  const gfit = (g.match(/\*\*Product fit\.\*\*[^\n]*/) || [""])[0];
  assert.match(gfit, /Mobile apps and games/);
  assert.match(gfit, /differs from the presets, which put Enterprise software first/);
  const scores = (x) => x.slice(x.indexOf("## Segment Scoring Matrix"), x.indexOf("## Recommended Beachhead"));
  assert.match(scores(t), /\| \*\*Technology\*\* \(beachhead\) \| 5 \| 4 \| 4 \| 5 \| 3 \| \*\*21\*\* \|/, "the preset scores are unchanged");
  assert.match(scores(g), /\| \*\*Enterprise software\*\* \(beachhead\) \| 4 \| 5 \| 2 \| 5 \| 2 \| \*\*18\*\* \|/, "the preset scores are unchanged");
});

test("round 3: the named parts of the product are used; a word shared only by being generic (services, software, platform) is not a link", async () => {
  const t = await call(TOOL, NORTH);
  const all = segParas(t).join("\n");
  assert.match(all, /Quickforge|Cloudsmith|Watchtower/);
  assert.doesNotMatch(t, /shares "services"|shares "software"|shares "platform"|shares "solutions"/i);
  assert.match(t, /Banking and Insurance may sit inside|Insurance and Banking may sit inside|may sit inside/);
});

test("round 3: no figure is added, no placeholder, no repeated sentence", async () => {
  for (const args of [RAIL, GLOSSA, LINGUA, NORTH]) {
    const t = await call(TOOL, args);
    assert.doesNotMatch(t, PLACEHOLDER);
    assert.deepEqual(repeatedSentences(t), []);
    const given = Object.values(args).flat().join(" ");
    const cleaned = t.replace(/\*\*Method used[^\n]*|^\| .*$|\(\d\)|TAM = .*|SAM = .*|SOM = .*|\d+(?:\/5| of 25|\/25)/gm, "");
    for (let m of cleaned.match(/\$?\d[\d,]*(?:\.\d+)?%?/g) || []) {
      m = m.replace(/[,.]+$/, "");
      if (/^\d$/.test(m)) continue;
      assert.ok(given.includes(m) || ["1", "2", "3", "5", "25", "100"].includes(m), `a figure that was not given: ${m}`);
    }
  }
});

test("round 3: D94 stays: with customers, pain and a deal size the segments are ranked from them and the answer says so", async () => {
  const t = await call(TOOL, { ...GLOSSA, current_customers: "Three mobile games studios and a media app", customer_pain: "slow release of translated strings to apps", });
  assert.match(t, /Method used: ranked from your own customers, pain and deal size/);
  assert.doesNotMatch(t, /Product fit\.\*\* .*differs from the presets/);
});

const pool = await loadPool();
test("round 3: on the pool scenarios every segment has its own facts", { skip: !pool }, async () => {
  const bad = [];
  for (const sc of pool.scenarios) {
    const args = await pool.build(TOOL, sc);
    const t = await call(TOOL, args);
    if (/Method used: ranked from your own/.test(t)) continue;
    const paras = segParas(t);
    if (paras.length !== args.potential_segments.length) { bad.push(`${sc.id}: ${paras.length} segment paragraphs for ${args.potential_segments.length} segments`); continue; }
    const s = paras.map(said);
    if (new Set(s).size !== s.length) bad.push(`${sc.id}: two segments say the same`);
    for (const p of paras) { const n = (p.match(/\((\d)\) /g) || []).length; if (n < 2 || n > 3) bad.push(`${sc.id} ${nameOf(p)}: ${n} facts`); }
    if (/shares "(?:services|software|platform|solutions|systems)"/i.test(t)) bad.push(`${sc.id}: generic shared word`);
    const factsOf = (p) => (p.split(/ Find out /)[1] || "").split(/; \(\d\) |^\(\d\) /).map((f) => f.replace(/^\(\d\) /, "").trim()).filter(Boolean).map((f) => f.replace(new RegExp(nameOf(p).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), "SEG"));
    const sets = paras.map(factsOf);
    sets.forEach((st, i) => { const others = new Set(sets.filter((_, j) => j !== i).flat()); if (!st.some((f) => !others.has(f))) bad.push(`${sc.id} ${nameOf(paras[i])}: no fact of its own`); });
  }
  assert.deepEqual(bad, []);
});

test("round 3: brackets are balanced in every fact, a source tag of the deal size is not repeated in each fact, a plain phrase is not called a named part", async () => {
  const t = await call(TOOL, { ...GLOSSA, product_description: "Glossa, a localization and translation management platform that connects design tools and apps: an SDK, over-the-air updates and AI translation", potential_segments: ["Enterprise software", "Mobile apps and games", "Media"], average_deal_size: "$9,000 (hypothetical)", sales_cycle: "45 days (hypothetical)" });
  for (const p of segParas(t)) {
    assert.equal((p.match(/\(/g) || []).length, (p.match(/\)/g) || []).length, `unbalanced brackets in ${nameOf(p)}`);
    assert.equal((p.match(/\(hypothetical\)/g) || []).length, 0, `the tag is repeated in ${nameOf(p)}`);
  }
  const fit = (t.match(/\*\*Product fit\.\*\*[^\n]*/) || [""])[0];
  assert.doesNotMatch(fit, /\bthat connects"|\bthat"/, "no half-open tail of the lead description");
  const n = await call(TOOL, NORTH);
  const named = (n.match(/Your description names [^\n]*/) || [""])[0];
  assert.match(named, /Quickforge/);
  assert.doesNotMatch(named, /its own platforms|AI enhanced|engineering teams/);
});
