// Run 22 round 5, impact_craft_message and impact_translate_execution: written before the fixes (test first). Faults judged at 3 or flagged in the last packet:
// (1) a data infrastructure product: the positioning statement opens with the category field word for word (bracket and all), Variation A cuts the problem to a fragment,
//     a contract figure is the only measure although the pitch is built on a ten minute start, and a per seat objection sits next to usage pricing;
// (2) a services firm whose own results lead (the sector notes are replaced): only two objections, generic roles, no word list, Pillar 3 points to an objection that is never
//     named, and the technical evaluator label is printed twice;
// (3) smaller ones: an audience tagline that is a product kind ("Built for hybrid solutions"), a security reviewer line that quotes the product list as security proof,
//     a finance reviewer given IT content, "you cares" in buyer copy, a very long email subject, a site survey call to action for a cloud and security bundle.
// Every company is invented (Datavault, Marketlane, Telaxis, Roomwise, Linkbay, Taskwell); every figure is an invented test input.
// Run: node --no-warnings --test tests/run22-impact-craft-translate-r5.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { call, PLACEHOLDER, repeatedSentences, cuts, sections } from "./run22-impact-common.mjs";

const DATAVAULT = {
  product_name: "Datavault open source data platform (managed Kafka, PostgreSQL, ClickHouse, OpenSearch and Grafana)",
  target_customer: "developers and engineering teams who need production-grade open source data infrastructure without the operational overhead: solo developers and students, startups (eligible startups can receive up to $100,000 in credits for 12 months), scale-ups and enterprises; thousands of companies run on it (page claims)",
  customer_need: "self-hosting open source data tools means constant infrastructure operations (patching, scaling and failures), while a basic cloud service still leaves you tuning and managing versions and plugins and locks you to one provider's ecosystem, with unpredictable costs and hard, high-risk migrations",
  product_category: "managed open source data infrastructure (open source data platform, Vault Cloud)",
  key_benefit: "stop managing and start building: a new PostgreSQL, Kafka or ClickHouse service live in under 10 minutes, with patching, scaling, security and uptime handled, zero-downtime upgrades and a 99.99% uptime SLA on production plans, on any cloud with no lock-in (page claims)",
  competitor: "cloud-native managed databases tied to one provider",
  differentiation: "genuine open source on open standards: every service runs the upstream version with standard drivers and APIs, not a proprietary fork, so code written against Datavault works against a self-hosted instance and vice versa; one control plane across any cloud; the right tool for each workload under one platform",
};
const MARKETLANE = {
  product_name: "Marketlane digital, data and customer experience services and AI products (Tradedesk, Auditdesk, Docscan)",
  target_customer: "large enterprises and financial institutions, brands and fast-growing clients, including Fortune 500 companies, with 400+ clients (page claim)",
  customer_need: "customer experience management is the new battleground, with consumers demanding personalized interactions and better support; capital markets are under constant strain from rising volumes, tighter regulations and the cost of financial risk management; fragmented data slows decisions",
  product_category: "digital, data and customer experience solutions (its own words: the engine behind some of the world's most admired businesses)",
  key_benefit: "deliver accuracy, speed and scalability without pushing costs up; reduce complexity and lower operating costs; examples the pages give are a 51% reduction in ticket escalations and a 70% reduction in false positives with AI (page claims)",
  competitor: "rule-based automation",
  differentiation: "deep domain expertise combined with AI-powered tools and operational excellence at scale, with AI built around the client's workflows and not layered on top",
};
const TELAXIS = {
  product_name: "Telaxis",
  target_customer: "large enterprises (its biggest customer segment) whose IT decision makers re-engineer IT economics through hybrid solutions",
  customer_need: "technology has never aged as fast as it does today, and upgrading one piece leaves the others behind, creating a cluster of digital islands in enterprises",
  product_category: "global digital ecosystem enabler: enterprise network, cloud, security, interactions and IoT services",
  key_benefit: "one fabric that connects network, cloud, customer interactions and IoT infrastructure; 99.80% first-time-right network transformations (page claim)",
  differentiation: "one fabric across network, cloud, security, interactions and IoT, on a network with direct connection to 35% of Internet routes",
};
const TELAXIS_TR = {
  positioning_statement: "For large enterprises whose IT decision makers re-engineer IT economics through hybrid solutions, Telaxis is the digital ecosystem enabler: enterprise network, cloud, security, interactions and IoT services that network (Mesh VPN, SD-WAN, SASE, multi cloud networking, internet WAN, private line), cloud (Nimbus compute, GPU as a service), cyber security (managed detection and response, SOC), interactions (CPaaS, CCaaS, UCaaS, cloud voice), IoT (global SIM, private network), 190+ countries voice footprint, 600+ MNO relationships. What sets it apart: one fabric across network, cloud, security, interactions and IoT, on a network with direct connection to 35% of Internet routes.",
  target_customer: TELAXIS.target_customer, key_benefit: TELAXIS.key_benefit, product_name: "Telaxis",
};
const ROOMWISE = {
  product_name: "Roomwise",
  target_customer: "hotels and other accommodation businesses, from boutique hotels and luxury resorts to hostels and serviced apartments, whether they run one property or many; over 15,000 properties use it (page claim)",
  customer_need: "most hotels manage pricing, operations and performance in separate tools; separate distribution systems cause mistakes that lead to overbookings and disgruntled guests; manual work, payment reconciliation and admin take staff time away from guests",
  product_category: "Hospitality Management System: the operating system for modern hotels (a cloud-native property management system, PMS, with POS, revenue management and payments in the same system)",
  key_benefit: "reduce operating costs and generate more revenue with less manual work; hoteliers using Roomwise see 8.7% revenue growth (page claim, a study sponsored by Roomwise)",
  competitor: "separate point tools for pricing, operations, payments and distribution",
  differentiation: "one operating system for the whole property instead of a PMS plus separate tools, with payments embedded so that the operating system is the payment system and reconciliation, reporting and refunds happen in one place; 1,000+ integrations and an open API let a hotel keep parts of its current tech stack",
};
const LINKBAY_TR = {
  positioning_statement: "For enterprises with many branches who struggle with branch outages and slow repairs, Linkbay is the managed network services provider. Unlike the current carrier contract, Linkbay offers fallback links on every branch and one contract for all sites.",
  target_customer: "enterprises with many branches", key_benefit: "cut branch outage hours; 99.80% of site moves done right the first time (page claim)", product_name: "Linkbay",
};
// a seat priced developer tool: the per seat objection stays
const TASKWELL = {
  product_name: "Taskwell", target_customer: "engineering teams at software companies", customer_need: "code reviews wait for days and releases slip",
  product_category: "code review tool", key_benefit: "cut review time by 40% and ship twice as often (page claims); $15 per seat per month",
  competitor: "reviewing in the repository host", differentiation: "reviews are ranked by risk, so the riskiest change is read first",
};

const section = (t, head, next) => (t.split(head)[1] || "").split(next)[0] || "";
const statement = (t) => (t.match(/### Complete Positioning Statement\n> ([^\n]*)/) || [])[1] || "";
const varA = (t) => (t.match(/\*\*Variation A: lead with the problem\*\*\n> ([^\n]*)/) || [])[1] || "";
const objectionRows = (t) => (section(t, "## Objection Handling", "## Message Tests").match(/^- \*\*"[^\n]*/gm) || []);
const norm = (s) => s.toLowerCase().replace(/[“”"'`*]/g, "").replace(/\s+/g, " ").trim();

// ---- (1) the data infrastructure product -------------------------------------------------------------------------------------------------------------
test("r5 craft: the statement does not open with the category field word for word, brackets and all", async () => {
  const t = await call("impact_craft_message", DATAVAULT);
  const s = statement(t);
  assert.ok(!s.includes("(open source data platform, Vault Cloud)"), `the raw category field is in the statement: ${s.slice(0, 260)}`);
  assert.doesNotMatch(s.split(/(?<=\.)\s/)[0], /\([^)]*Vault Cloud[^)]*\)/, "the first sentence holds the bracket of the category");
  assert.match(s, /managed open source data infrastructure/);
  assert.match(t, /Vault Cloud/, "the other name of the product is dropped");
  assert.doesNotMatch(s.split(/(?<=\.)\s/)[0], /open source data platform, /);
});

test("r5 craft: Variation A ends on a whole clause of the problem", async () => {
  for (const a of [DATAVAULT, { ...DATAVAULT, customer_need: "engineers spend their week on upgrades and failovers that nobody planned for, while the roadmap waits and every release needs a freeze window and a long list of manual checks" }]) {
    const t = await call("impact_craft_message", a);
    const A = varA(t);
    const m = A.match(/^(?:Does this sound familiar|Are you struggling with|Do you): (.*?)\? /) || A.match(/^(?:Are you struggling with|Do you) (.*?)\? /);
    assert.ok(m, `no question in Variation A: ${A}`);
    const q = norm(m[1]);
    const need = norm(a.customer_need);
    assert.ok(need.includes(q), `the question is not the user's words: ${q}`);
    const open = (q.match(/\(/g) || []).length - (q.match(/\)/g) || []).length;
    assert.equal(open, 0, `a bracket is left open: ${q}`);
    const after = need.slice(need.indexOf(q) + q.length);
    assert.ok(after === "" || /^(?:,|;| while | but | so | because )/.test(after), `cut inside a clause, the text goes on with: ${after.slice(0, 40)}`);
    // a clause may end on a stranded word ("nobody planned for") only when a comma and a conjunction follow it
    if (!/^(?:,|;)/.test(after)) assert.doesNotMatch(q, /\b(?:and|or|of|for|to|the|a|an|by|from|in|on|with|that|while|so)$/, `ends on a joining word: ${q}`);
    assert.ok(q.split(" ").length >= 6, `a fragment: ${q}`);
  }
});

test("r5 craft: a usage priced product gets no per seat objection, and the price row uses the price basis of the inputs", async () => {
  const t = await call("impact_craft_message", DATAVAULT);
  assert.doesNotMatch(t, /per seat|\bseats?\b/i, "a per seat word next to usage pricing");
  const price = objectionRows(t).find((r) => /price is too high/i.test(r)) || "";
  assert.match(price, /usage|credits/i, price);
});

test("r5 craft: a seat priced product keeps its seat objection", async () => {
  const t = await call("impact_craft_message", TASKWELL);
  assert.match(t, /per seat/i);
});

test("r5 craft: for managed data infrastructure the economic buyer line measures what the sector kind watches (uptime, operations hours saved)", async () => {
  // Before the managed data infrastructure kind existed in the shared sector file, the answer measured the pitch itself ("time to a live service")
  // next to the contract figure. The kind now supplies its own measures, which fit the product better.
  const t = await call("impact_craft_message", DATAVAULT);
  const econ = (t.match(/\*\*For the economic buyer[^\n]*\n> ([^\n]*)/) || [])[1] || "";
  assert.match(econ, /uptime/i, econ);
  assert.match(econ, /operations hours saved/i, econ);
  assert.doesNotMatch(t, /per seat/i);
});

// ---- (2) the services firm whose own results lead ---------------------------------------------------------------------------------------------------------
test("r5 craft: when the user's results replace the sector notes, every objection a pillar refers to is named and answered", async () => {
  for (const a of [MARKETLANE, { ...MARKETLANE, competitor: "" }]) {
    const t = await call("impact_craft_message", a);
    const rows = objectionRows(t);
    assert.ok(rows.length >= (a.competitor ? 4 : 3), `only ${rows.length} objections: ${rows.join(" | ").slice(0, 300)}`);
    const p3 = section(t, "**Pillar 3", "\n\n").split("\n")[0];
    const named = [...p3.matchAll(/"([^"]+)"/g)].map((m) => norm(m[1]).replace(/[.?!]+$/, ""));
    assert.ok(named.length >= 1, `Pillar 3 names no objection: ${p3}`);
    for (const n of named) assert.ok(rows.some((r) => norm(r).includes(n)), `Pillar 3 points to an objection that is not handled: ${n}`);
    for (const r of rows) assert.ok(r.replace(/^- \*\*"[^"]*"\.?\*\*\s*/, "").length > 40, `an objection without an answer: ${r}`);
  }
});

test("r5 craft: the objections the inputs raise are answered with the user's own words and figures", async () => {
  const t = await call("impact_craft_message", MARKETLANE);
  const o = section(t, "## Objection Handling", "## Message Tests");
  assert.match(o, /rule-based automation/);
  assert.match(o, /51% reduction in ticket escalations/, "the user's own figure is not used to answer the proof objection");
  assert.match(o, /customer experience management/, "the problem is not used to answer a not-now objection");
  assert.doesNotMatch(t, /agent attrition|average handle time|first contact resolution|head of support|call recording|contact cent(?:re|er)/i, "the other sector's notes came back");
});

test("r5 craft: buyer roles come from the user's own words, and no role label is printed twice", async () => {
  for (const a of [MARKETLANE, TELAXIS, ROOMWISE, DATAVAULT]) {
    const t = await call("impact_craft_message", a);
    for (const m of t.matchAll(/\*\*For the ([^\n]*?) \(([^)\n]*)\):\*\*/g)) {
      const x = norm(m[1]), y = norm(m[2]);
      assert.ok(!y.startsWith(x) && !y.endsWith(x) && !x.endsWith(y), `a label is printed twice: ${m[0]}`);
    }
    assert.doesNotMatch(t, /\(the technical evaluator\)/);
  }
  const t = await call("impact_craft_message", MARKETLANE);
  const champ = (t.match(/\*\*For the champion \(([^)]*)\)/) || [])[1] || "";
  assert.match(champ, /customer experience management/, `generic champion: ${champ}`);
  const buyer = (t.match(/\*\*For the economic buyer \(([^)]*)\)/) || [])[1] || "";
  assert.notEqual(buyer, "the budget owner", `generic economic buyer: ${buyer}`);
});

test("r5 craft: one vocabulary line is made of the user's own nouns", async () => {
  const t = await call("impact_craft_message", MARKETLANE);
  const line = (t.match(/^Words from your own inputs[^\n]*$/m) || [])[0] || "";
  assert.ok(line, "no vocabulary line");
  const words = line.replace(/^[^:]*:\s*/, "").replace(/\.$/, "").split(/,\s*/);
  assert.ok(words.length >= 3 && words.length <= 7, line);
  const all = norm(Object.values(MARKETLANE).join(" "));
  for (const w of words) { assert.ok(all.includes(norm(w)), `not the user's words: ${w}`); assert.ok(w.split(" ").length <= 5, `too long: ${w}`); assert.doesNotMatch(w, /\b(?:is|are|means|slows|leaves)\b/i, `a clause, not a noun: ${w}`); }
});

// ---- (3) the smaller ones ---------------------------------------------------------------------------------------------------------------------------------------------
test("r5 craft: a product kind is not an audience, and a product list is not security proof", async () => {
  const t = await call("impact_craft_message", TELAXIS);
  assert.doesNotMatch(t, /Built for hybrid solutions/);
  assert.match(section(t, "### Level 1: Tagline", "### Level 2"), /Built for large enterprises/);
  assert.doesNotMatch(t, /On security, in your words: "[^"]*network, cloud/);
  assert.doesNotMatch(t, /On security, in your words: "[^"]*interactions and IoT/);
});

test("r5 craft: a finance reviewer is given finance content, not integrations", async () => {
  const t = await call("impact_craft_message", ROOMWISE);
  const m = t.match(/\*\*For the technical evaluator \(([^)]*)\):\*\*\n> ([^\n]*)/);
  assert.ok(m, "no evaluator block");
  if (/financ|account|billing|payment/i.test(m[1])) {
    assert.match(m[2], /payment|reconcil|refund/i, `a ${m[1]} reviewer is given: ${m[2]}`);
    assert.doesNotMatch(m[2], /1,000\+ integrations/, `a ${m[1]} reviewer is given IT content: ${m[2]}`);
  }
});

test("r5 translate: copy to the buyer has no 'you cares' slip, and the email subjects are short", async () => {
  for (const a of [TELAXIS_TR, LINKBAY_TR]) {
    const t = await call("impact_translate_execution", a);
    assert.doesNotMatch(t, /\byou (?:cares|wants|needs|pays|tracks|measures|uses|has|is|does|goes)\b/i);
    for (const m of t.matchAll(/\*\*Subject\*\*: ([^\n]*)/g)) assert.ok(m[1].length <= 60, `a long subject (${m[1].length}): ${m[1]}`);
    assert.doesNotMatch(t, /Subject\*\*: [^\n]*(?:\b(?:and|of|the|a|that|with)|\.\.\.)$/m);
  }
});

test("r5 translate: a cloud, security and voice bundle is not sent to a site survey; a plain connectivity provider still is", async () => {
  const bundle = await call("impact_translate_execution", TELAXIS_TR);
  assert.doesNotMatch(bundle, /site survey/i);
  assert.doesNotMatch(bundle, /Primary: "Get a demo"/, "an enterprise bundle is not sold with a self-serve demo");
  const plain = await call("impact_translate_execution", LINKBAY_TR);
  assert.match(plain, /site survey/i);
});

test("r5: earlier gains stay (no placeholder, no repeated sentence, no cut name) on the new rows", async () => {
  for (const [tool, a] of [["impact_craft_message", DATAVAULT], ["impact_craft_message", MARKETLANE], ["impact_craft_message", TELAXIS], ["impact_craft_message", ROOMWISE], ["impact_translate_execution", TELAXIS_TR], ["impact_translate_execution", LINKBAY_TR]]) {
    const t = await call(tool, a);
    assert.doesNotMatch(t, PLACEHOLDER);
    assert.deepEqual(repeatedSentences(t), [], tool);
    assert.deepEqual(cuts(t), [], tool);
    assert.equal(t.split("To sharpen this, give:").length - 1 <= 1, true);
  }
});

// ---- the project E11 style check over invented rows with a bracket in the category and a usage priced or results-led product (needs the private project folder) ----
let lib = null;
try { lib = await import("/home/user/directory-submission-work/work/run21/eval/e11lib21.mjs"); } catch { /* the private folder is absent */ }
const rowOf = (a, company) => ({
  id: `R5-${company}`, company, product: a.product_name, productDesc: a.product_name, category: a.product_category, targetCustomer: a.target_customer, segments: [a.target_customer.split(/[,;]/)[0]],
  problem: a.customer_need, outcome: a.key_benefit, capability: a.key_benefit.split(/[;:]/)[0], differentiation: a.differentiation, competitors: [a.competitor],
});
const argsOfRow = (s) => ({ product_name: s.product, target_customer: s.targetCustomer, customer_need: s.problem, product_category: s.category, key_benefit: s.outcome, competitor: s.competitors[0], differentiation: s.differentiation });
test("r5 E11: the style check gives no flag on invented rows with a bracket in the category, in the styles plain and para", { skip: !lib }, async () => {
  const bad = [];
  for (const [a, company] of [[DATAVAULT, "Datavault"], [MARKETLANE, "Marketlane"], [ROOMWISE, "Roomwise"], [{ ...DATAVAULT, product_name: "zenVault managed data services (Kafka, PostgreSQL)", product_category: "managed data infrastructure (zenVault Cloud, data platform)" }, "zenVault"]]) {
    const s = rowOf(a, company);
    for (const style of ["plain", "para"]) {
      const out = await call("impact_craft_message", lib.styleArgs(style, s, argsOfRow(s)));
      for (const f of lib.e11(out, style, s)) bad.push(`craft ${company}/${style}: ${f.kind}: ${f.ctx}`);
    }
  }
  assert.deepEqual(bad, []);
});
