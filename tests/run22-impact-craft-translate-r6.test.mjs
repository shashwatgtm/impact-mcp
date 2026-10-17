// Run 22 round 6, impact_craft_message and impact_translate_execution: written before the fixes (test first). Faults left after round 5:
// (1) a voice AI product ("AI agents that automate conversations, understand context and act in real time"): the tagline puts the agents' verbs on the buyer, the subheadline
//     repeats the headline, the answer to the "we already use IVR" objection does not meet it, there is no language section, the roles are generic, the commercials slide says "users";
// (2) a payments gateway: features, the certification and the sandbox dropped from the lists, a service line ("24/7 live chat support") shown as proof, the benefit cut to
//     "one secure integration", posts that read as notes; (3) a telecom bundle: the posts ask about outages, not the stated pain, and scale figures carry no source label;
// (4) craft: a lone "it" in a proof line, a figure of the difference not counted as proof and shown without a label, tool phrasing ("in your words") in the statement, a clumsy
//     first sentence, named products never used, an evaluator block with nothing in it. Every company is invented; every figure is an invented test input.
// Run: node --no-warnings --test tests/run22-impact-craft-translate-r6.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { call, PLACEHOLDER, repeatedSentences, cuts, sections } from "./run22-impact-common.mjs";

const VOXLINE_TR = {
  positioning_statement: "For enterprises that run customer conversations at scale, especially in banking, telecom and insurance; 250+ enterprises (page claim) who struggle with generic speech recognition fails on regional telephony audio with accents and call center noise; traditional IVR systems rely on predefined flows and struggle with complex conversations; most calls go unreviewed without full call coverage, Voxline Voice AI platform (voice agents, analytics and assist) is the voice AI company building agentic AI for enterprises that voice agents across voice, chat and SMS in 40+ languages (page claim); speech analytics with automated QA on every call; agent assist with real-time knowledge retrieval and call summaries; speech to text and text to speech APIs. Alternatives buyers use today: traditional IVR systems and voice bots with predefined flows. What sets it apart: owns every layer of the stack with in-house models trained on 14 million hours of telephonic audio (page claims); deploys on cloud, private cloud or on premise.",
  target_customer: "enterprises that run customer conversations at scale, especially in banking, telecom and insurance; 250+ enterprises (page claim)",
  key_benefit: "AI agents that automate conversations, understand context and act in real time, with enterprises typically seeing a 40% reduction in contact center OpEx after deploying Voxline (page claim); API access that goes live in under 20 minutes (page claim)",
  product_name: "Voxline Voice AI platform (voice agents, analytics and assist)",
};
const PAYGATE_TR = {
  positioning_statement: "For businesses that accept online payments in the region, from solo businesses to enterprises, including startups, marketplaces and platforms; 100k+ businesses (page claim) who struggle with selling across the region needs 20+ payment methods, local approvals and payouts to local banks, and building every local payment connection from scratch is slow, Paygate is the online payment gateway; a licensed payment institution built for the region that 20+ payment methods including local cards, Visa, Mastercard and Apple Pay; unified API, Card and Checkout SDKs and hosted checkout; tokenization and saved tokens; embedded 3D Secure; authorize then capture to avoid unnecessary refunds; refunds from the dashboard; transaction flags and risk detection; subscription payments; multi-currency with a currency converter; marketplace split payments, commissions and seller payouts with KYC onboarding; sandbox with test cards; PCI DSS Level 1; 24/7 live chat support. Alternatives buyers use today: building every local payment connection from scratch. What sets it apart: a regional specialist: the most extensively licensed payment institution in the region (page claims), with one contract and one integration across markets, smart routing that picks the best route for each payment, and engineers from the region.",
  target_customer: "businesses that accept online payments in the region, from solo businesses to enterprises, including startups, marketplaces and platforms; 100k+ businesses (page claim)",
  key_benefit: "one secure integration for local payment methods, regional expansion and direct payouts to local bank accounts, high acceptance rates, faster setup and activation, consolidated reporting and settlements paid into a local bank account",
  product_name: "Paygate",
};
const TELAXIS_TR = {
  positioning_statement: "For large enterprises whose IT decision makers re-engineer IT economics through hybrid solutions who struggle with technology has never aged as fast as it does today, and upgrading one piece leaves the others behind, creating a cluster of digital islands in enterprises, Telaxis is the digital ecosystem enabler: enterprise network, cloud, security, interactions and IoT services that network (Global VPN, SD-WAN, SASE, multi cloud networking, internet WAN, private line), cloud (Nimbus compute, GPU as a service), cyber security (managed detection and response, SOC), interactions (CPaaS, CCaaS, UCaaS, cloud voice), IoT (global SIM, private network), 190+ countries voice footprint, 600+ MNO relationships. What sets it apart: one fabric across network, cloud, security, interactions and IoT, on a network with direct connection to 35% of Internet routes.",
  target_customer: "large enterprises whose IT decision makers re-engineer IT economics through hybrid solutions",
  key_benefit: "one fabric that connects network, cloud, customer interactions and IoT infrastructure; 99.80% first-time-right network transformations (page claim)",
  product_name: "Telaxis",
};
const TELAXIS = {
  product_name: "Telaxis", target_customer: TELAXIS_TR.target_customer,
  customer_need: "technology has never aged as fast as it does today, and upgrading one piece leaves the others behind, creating a cluster of digital islands in enterprises",
  product_category: "global digital ecosystem enabler: enterprise network, cloud, security, interactions and IoT services",
  key_benefit: TELAXIS_TR.key_benefit,
  differentiation: "one fabric across network, cloud, security, interactions and IoT, on a network with direct connection to 35% of Internet routes",
};
const DATAVAULT = {
  product_name: "Datavault open source data platform (managed Kafka, PostgreSQL and ClickHouse)",
  target_customer: "developers and engineering teams who need production-grade open source data infrastructure; thousands of companies run on it (page claims)",
  customer_need: "self-hosting open source data tools means constant infrastructure operations, while a basic cloud service locks you to one provider",
  product_category: "managed open source data infrastructure",
  key_benefit: "stop managing and start building: a new service live in under 10 minutes, with patching and scaling handled (page claims)",
  competitor: "cloud-native managed databases tied to one provider",
  differentiation: "genuine open source on open standards; one control plane across any cloud",
};
const ROOMWISE = {
  product_name: "Roomwise",
  target_customer: "hotels and other accommodation businesses, from boutique hotels to hostels; over 15,000 properties use it (page claim)",
  customer_need: "most hotels manage pricing, operations and performance in separate tools; manual work and payment reconciliation take staff time away from guests",
  product_category: "Hospitality Management System: the operating system for modern hotels (a cloud-native property management system, PMS, with POS and payments in the same system)",
  key_benefit: "reduce operating costs, redefine guest experiences and generate more revenue with less manual work; hoteliers using Roomwise see 8.7% revenue growth (page claim, a study sponsored by Roomwise)",
  competitor: "separate point tools for pricing, operations, payments and distribution",
  differentiation: "one operating system for the whole property instead of a PMS plus separate tools, with payments embedded so that reconciliation, reporting and refunds happen in one place",
};
const MARKETLANE = {
  product_name: "Marketlane digital, data and customer experience services and AI products (Tradedesk, Auditdesk, Docscan)",
  target_customer: "large enterprises and financial institutions, brands and fast-growing clients, including Fortune 500 companies, with 400+ clients (page claim)",
  customer_need: "customer experience management is the new battleground, with consumers demanding personalized interactions and better support; capital markets are under constant strain from rising volumes, tighter regulations and the cost of financial risk management; fragmented data slows decisions",
  product_category: "digital, data and customer experience solutions (its own words: the engine behind some of the world's most admired businesses)",
  key_benefit: "deliver accuracy, speed and scalability without pushing costs up; reduce complexity, lower operating costs and help the business stay agile; examples the pages give are a 51% reduction in ticket escalations and a 70% reduction in false positives with AI (page claims)",
  competitor: "rule-based automation",
  differentiation: "deep domain expertise combined with AI-powered tools and operational excellence at scale, with AI built around the client's workflows and not layered on top",
};
const section = (t, head, next) => (t.split(head)[1] || "").split(next)[0] || "";
const statement = (t) => (t.match(/### Complete Positioning Statement\n> ([^\n]*)/) || [])[1] || "";

// ---- (1) the voice AI product ---------------------------------------------------------------------------------------------------------------------------
test("r6 translate: the tagline keeps the agents' verbs on the agents, and the subheadline says more than the headline", async () => {
  const t = await call("impact_translate_execution", VOXLINE_TR);
  const tag = (t.match(/### Company Page Tagline\n> "([^"]*)"/) || [])[1] || "";
  assert.doesNotMatch(tag, /^Helping .*\bunderstand context/i, tag);
  if (/understand context/i.test(tag)) assert.match(tag, /agents/i, tag);
  const web = sections(t)["Website Execution"] || "";
  const head = (web.match(/\*\*Headline\*\*\n> "([^"]*)"/) || [])[1] || "";
  const sub = (web.match(/\*\*Subheadline\*\*\n> ([^\n]*)/) || [])[1] || "";
  assert.ok(head && sub);
  assert.ok(sub.length > head.length + "Voxline Voice AI platform delivers ".length + 15, `the subheadline only repeats the headline: ${sub}`);
  assert.match(sub, /understand context/);
});

test("r6 translate: the answer to the 'we already use IVR' objection meets the objection", async () => {
  const t = await call("impact_translate_execution", VOXLINE_TR);
  const post = (sections(t)["LinkedIn Execution"] || "").split("**Post 2")[1] || "";
  const ans = (post.match(/A fair question[^\n]*/) || [])[0] || "";
  assert.match(ans, /predefined flows/, ans);
  assert.match(ans, /understand context|automate conversations/, `the answer does not say what the product does instead: ${ans}`);
});

test("r6 translate: a language section made of the user's own words, roles named from the user's words, and a commercials slide with no seat wording", async () => {
  const t = await call("impact_translate_execution", VOXLINE_TR);
  const lang = (t.match(/## Language from Your Inputs\n\n([^]*?)\n\n---/) || [])[1] || "";
  assert.ok(lang, "no language section");
  const all = Object.values(VOXLINE_TR).join(" ").toLowerCase();
  const words = (lang.match(/Words from your inputs: ([^.]*)\./) || [])[1] || "";
  const list = words.split(/,\s*/).filter(Boolean);
  assert.ok(list.length >= 3, lang);
  for (const w of list) assert.ok(all.includes(w.toLowerCase()), `not the user's words: ${w}`);
  assert.match(t, /whoever owns customer conversations at scale/);
  const row = t.split("\n").find((l) => /^\| 9 \| Commercials/.test(l)) || "";
  assert.doesNotMatch(row, /users or usage/, row);
  assert.match(row, /usage/i, row);
});

// ---- (2) the payments gateway ---------------------------------------------------------------------------------------------------------------------------
test("r6 translate: the features, the certification and the sandbox are not dropped, a service line is not proof, the benefit is not cut to its first words", async () => {
  const t = await call("impact_translate_execution", PAYGATE_TR);
  const web = sections(t)["Website Execution"] || "";
  const inc = (web.split("**What it includes**")[1] || "").split("**Proof strip**")[0];
  assert.match(inc, /Marketplace split payments/);
  assert.match(inc, /Sandbox with test cards/);
  assert.match(inc, /24\/7 live chat support/);
  const strip = (web.split("**Proof strip**")[1] || "").split("**Why")[0];
  assert.match(strip, /PCI DSS Level 1/);
  assert.doesNotMatch(strip, /24\/7 live chat/);
  assert.doesNotMatch(t, /Proof point: 24\/7/);
  const copy = (sections(t)["LinkedIn Execution"] || "") + (sections(t)["Cold Email Execution"] || "");
  assert.doesNotMatch(copy, /get one secure integration[.;]/, "the benefit is cut to its first words");
  assert.match(copy, /get one secure integration for local payment methods\b/);
  assert.doesNotMatch(sections(t)["LinkedIn Execution"] || "", /Proof point:|What is in it:/, "a post that reads as notes");
});

// ---- (3) the telecom bundle ---------------------------------------------------------------------------------------------------------------------------
test("r6 translate: posts and emails ask about the stated pain, and scale figures carry a source note", async () => {
  const t = await call("impact_translate_execution", TELAXIS_TR);
  const copy = (sections(t)["LinkedIn Execution"] || "") + (sections(t)["Cold Email Execution"] || "");
  assert.match(copy, /digital islands/);
  assert.doesNotMatch(copy, /outages or poor quality cost you/);
  for (const m of t.matchAll(/190\+ countries voice footprint[^\n]*/g)) assert.match(m[0], /source not stated|page claim/, m[0]);
  for (const m of t.matchAll(/600\+ MNO relationships[^\n]*/g)) assert.match(m[0], /source not stated|page claim/, m[0]);
});

// ---- (4) craft ------------------------------------------------------------------------------------------------------------------------------------------------
test("r6 craft: a proof line never says 'it' with nothing before it", async () => {
  const t = await call("impact_craft_message", DATAVAULT);
  assert.doesNotMatch(t, /(?:run on|rely on|use|trust|choose) it\b/i);
  assert.match(t, /Thousands of companies run on Datavault open source data platform \(page claims\)/);
  const tr = await call("impact_translate_execution", { positioning_statement: "For developers and engineering teams who struggle with constant infrastructure operations, Datavault open source data platform is the managed open source data infrastructure that stop managing and start building. Alternatives buyers use today: cloud-native managed databases tied to one provider. What sets it apart: genuine open source on open standards.", target_customer: DATAVAULT.target_customer, key_benefit: DATAVAULT.key_benefit, product_name: DATAVAULT.product_name });
  assert.doesNotMatch(tr, /(?:run on|rely on|use|trust|choose) it\b/i);
});

test("r6 craft: a figure inside the difference counts as proof of the difference and carries a source note when none was typed", async () => {
  const t = await call("impact_craft_message", TELAXIS);
  const p2 = section(t, "**Pillar 2", "**Pillar 3");
  assert.doesNotMatch(p2, /Proof you have: none given/);
  assert.match(p2, /35% of Internet routes/);
  // the proof lines (Pillar 2 and Variation D) carry the note; the statement holds the user's own sentence
  const proofLines = [...t.split("\n").filter((l) => /^- Proof you have/.test(l) && /35% of Internet routes/.test(l)), ...section(t, "**Variation D", "### Audience-Specific").split("\n").filter((l) => /35% of Internet routes/.test(l))];
  assert.ok(proofLines.length >= 2, "the figure is not used as proof");
  for (const line of proofLines) assert.match(line, /source not stated|page claim/, line);
});

test("r6 craft: the statement holds no tool phrasing and the first sentence has no clumsy semicolon list", async () => {
  for (const a of [ROOMWISE, MARKETLANE]) {
    const s = statement(await call("impact_craft_message", a));
    assert.doesNotMatch(s, /in your words|What \w+ delivers,/, s);
    assert.doesNotMatch(s.split(/(?<=\.)\s/)[0], /;\s+(?:and\s)?/, `a semicolon list in the first sentence: ${s.split(/(?<=\.)\s/)[0]}`);
  }
  const s = statement(await call("impact_craft_message", ROOMWISE));
  assert.match(s, /helps them reduce operating costs/);
});

test("r6 craft: the named products are used in the statement and give the technical evaluator something to look at", async () => {
  const t = await call("impact_craft_message", MARKETLANE);
  assert.match(statement(t), /Tradedesk, Auditdesk and Docscan/);
  const ev = (t.match(/\*\*For the technical evaluator[^\n]*\n> ([^\n]*)/) || [])[1] || "";
  assert.match(ev, /Tradedesk, Auditdesk and Docscan/, ev);
});

test("r6: earlier gains stay (no placeholder, no repeated sentence, no cut name) on the new rows", async () => {
  for (const [tool, a] of [["impact_translate_execution", VOXLINE_TR], ["impact_translate_execution", PAYGATE_TR], ["impact_translate_execution", TELAXIS_TR], ["impact_craft_message", DATAVAULT], ["impact_craft_message", ROOMWISE], ["impact_craft_message", MARKETLANE], ["impact_craft_message", TELAXIS]]) {
    const t = await call(tool, a);
    assert.doesNotMatch(t, PLACEHOLDER);
    assert.deepEqual(repeatedSentences(t), [], `${tool}`);
    assert.deepEqual(cuts(t), [], `${tool}`);
    assert.ok(t.split("To sharpen this, give:").length - 1 <= 1);
  }
});

// ---- the project E11 style check over invented rows (needs the private project folder) -------------------------------------------------------------------
let lib = null;
try { lib = await import("/home/user/directory-submission-work/work/run21/eval/e11lib21.mjs"); } catch { /* the private folder is absent */ }
const rowOf = (a, company) => ({
  id: `R6-${company}`, company, product: a.product_name, productDesc: a.product_name, category: a.product_category, targetCustomer: a.target_customer, segments: [a.target_customer.split(/[,;]/)[0]],
  problem: a.customer_need, outcome: a.key_benefit, capability: a.key_benefit.split(/[;:]/)[0], differentiation: a.differentiation, competitors: [a.competitor || "manual work"],
});
const argsOfRow = (s) => ({ product_name: s.product, target_customer: s.targetCustomer, customer_need: s.problem, product_category: s.category, key_benefit: s.outcome, competitor: s.competitors[0], differentiation: s.differentiation });
test("r6 E11: the style check gives no flag on invented rows in the styles plain and para, for both tools", { skip: !lib }, async () => {
  const bad = [];
  for (const [a, company] of [[DATAVAULT, "Datavault"], [MARKETLANE, "Marketlane"], [ROOMWISE, "Roomwise"], [TELAXIS, "Telaxis"]]) {
    const s = rowOf(a, company);
    for (const style of ["plain", "para"]) {
      const out = await call("impact_craft_message", lib.styleArgs(style, s, argsOfRow(s)));
      for (const f of lib.e11(out, style, s)) bad.push(`craft ${company}/${style}: ${f.kind}: ${f.ctx}`);
      const tr = lib.styleArgs(style, s, { positioning_statement: `For ${s.targetCustomer} who struggle with ${s.problem}, ${s.product} is the ${s.category} that ${s.capability}. Unlike ${s.competitors[0]}, it offers ${s.differentiation}.`, target_customer: s.targetCustomer, key_benefit: s.outcome, product_name: s.product });
      const out2 = await call("impact_translate_execution", tr);
      for (const f of lib.e11(out2, style, s)) bad.push(`translate ${company}/${style}: ${f.kind}: ${f.ctx}`);
    }
  }
  assert.deepEqual(bad, []);
});
