// Run 22 round 4, impact_craft_message and impact_translate_execution: written before the fixes (test first). Faults left after round 3: a long product list in the
// statement never used and placeholder wording in the deck; a problem slide cut off; a developer led product whose first call to action is a demo; startup credits and the
// uptime figure unused; sector objections, roles and words of another kind of work next to results about a different field; a client count taken as the audience; a figure
// typed in the benefit but reported as "no result was typed"; a stray quotation mark; copy written to the seller instead of the buyer. Companies are invented (Telaxis,
// Datavault, Marketlane, Roomwise, Linkbay); every figure is an invented test input. Run: node --no-warnings --test tests/run22-impact-craft-translate-r4.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { call, PLACEHOLDER, repeatedSentences, cuts, sections } from "./run22-impact-common.mjs";

const TELAXIS = {
  positioning_statement: "For large enterprises whose IT leaders re-engineer IT economics through hybrid solutions who struggle with technology has never aged as fast as it does today, and upgrading one piece leaves the others behind, creating a cluster of digital islands, Telaxis is the digital ecosystem enabler: enterprise network, cloud, security, interactions and IoT services that network (Mesh VPN, Edge routing, Secure gateway, internet WAN), cloud (Nimbus compute, GPU hosting), cyber security (managed detection and response, SOC), interactions (CPaaS, cloud voice), IoT (global SIM, private network), 190+ countries voice footprint, 600+ operator relationships. What sets it apart: one fabric across network, cloud, security, interactions and IoT, on a network with direct connection to 35% of Internet routes.",
  target_customer: "large enterprises whose IT leaders re-engineer IT economics through hybrid solutions",
  key_benefit: "one fabric that connects network, cloud, customer interactions and IoT infrastructure; 99.80% first-time-right network transformations (page claim)",
  product_name: "Telaxis",
};
const DATAVAULT = {
  positioning_statement: "For developers and engineering teams who need production-grade open source data infrastructure: solo developers, startups (eligible startups can receive up to $100,000 in credits for 12 months), scale-ups and enterprises; thousands of companies run on it (page claims) who struggle with self-hosting open source data tools means constant infrastructure operations (patching, scaling and failures), while a basic cloud service still leaves you tuning and managing versions and plugins and locks you to one provider's ecosystem, with unpredictable costs and hard, high-risk migrations, Datavault (managed Kafka, PostgreSQL, ClickHouse and Grafana) is the managed open source data infrastructure that fully managed Kafka, PostgreSQL, MySQL, ClickHouse, OpenSearch, Valkey and Grafana; one console, API and Terraform provider across AWS, GCP and Azure in more than 100 regions; automated backups with point-in-time recovery; multi-node high availability with automatic failover. Alternatives buyers use today: cloud-native managed databases tied to one provider. What sets it apart: genuine open source on open standards; one control plane across any cloud.",
  target_customer: "developers and engineering teams who need production-grade open source data infrastructure: solo developers, startups (eligible startups can receive up to $100,000 in credits for 12 months), scale-ups and enterprises; thousands of companies run on it (page claims)",
  key_benefit: "stop managing and start building: a new PostgreSQL or Kafka service live in under 10 minutes, with patching, scaling and security handled, zero-downtime upgrades and a 99.99% uptime SLA on production plans (page claims)",
  product_name: "Datavault (managed Kafka, PostgreSQL, ClickHouse and Grafana)",
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
const LINKBAY = {
  product_name: "Linkbay", target_customer: "enterprises with many branches", customer_need: "branch outages and slow repairs",
  product_category: "managed network services", key_benefit: "cut branch outage hours; 99.80% of site moves done right the first time (page claim)",
  competitor: "the current carrier contract", differentiation: "fallback links on every branch and one contract for all sites; direct connection to 35% of Internet routes",
};

// ---- translate: the product list and the facts of the statement are used; no placeholder wording in the deck ----------------------------------------
test("r4 translate: a long product list in brackets is used on the page, in the deck, the posts and the emails; scale facts go to the proof", async () => {
  const t = await call("impact_translate_execution", TELAXIS);
  const web = sections(t)["Website Execution"] || "", li = sections(t)["LinkedIn Execution"] || "", em = sections(t)["Cold Email Execution"] || "", deck = sections(t)["Sales Deck Execution"] || "";
  for (const [name, text] of [["website", web], ["linkedin", li], ["email", em], ["deck", deck]]) assert.match(text, /Mesh VPN/, `${name}: the product list is not used`);
  assert.match(web, /190\+ countries voice footprint/);
  assert.match(web.split("**Proof strip**")[1] || "", /600\+ operator relationships/);
  assert.match(deck.split("\n").find((l) => /^\| 7 \| Results/.test(l)) || "", /99\.80% first-time-right network transformations \(page claim\)/);
  assert.deepEqual(repeatedSentences(t), []);
  assert.doesNotMatch(t, PLACEHOLDER);
});

test("r4 translate: no placeholder or instruction wording stands where deck copy belongs", async () => {
  for (const a of [TELAXIS, { ...TELAXIS, positioning_statement: "For CIOs at banks with many branches, fallback links on every branch.", key_benefit: "cut branch outage hours" }]) {
    const t = await call("impact_translate_execution", a);
    assert.doesNotMatch(t, /\(your positioning\)|The three things your buyer must understand|Why we are different|ask three buyers|The results a customer measured, before and after \|/);
    for (const n of [5, 6, 7]) { const row = t.split("\n").find((l) => new RegExp(`^\\| ${n} \\|`).test(l)) || ""; assert.ok(row.split("|")[3].trim().length > 25, `deck row ${n} is empty or a stub: ${row}`); }
  }
});

test("r4 translate: the problem slide is whole, a developer led product starts with a try on a real project, startup credits and the uptime figure are used", async () => {
  const t = await call("impact_translate_execution", DATAVAULT);
  const prob = t.split("\n").find((l) => /^\| 2 \| The Problem/.test(l)) || "";
  assert.match(prob, /hard, high-risk migrations/, prob);
  assert.match(t, /Primary: "Try it on one real project"/);
  assert.doesNotMatch(t, /Primary: "Get a demo"/);
  const used = t.split("\n").filter((l) => /\$100,000 in credits for 12 months/.test(l)).length;
  assert.ok(used >= 1, "the startup credits are not used");
  const deck = sections(t)["Sales Deck Execution"] || "";
  assert.match(deck.split("\n").find((l) => /^\| 7 \| Results/.test(l)) || "", /99\.99% uptime SLA/);
  assert.match(sections(t)["Website Execution"], /Kafka, PostgreSQL, MySQL, ClickHouse/);
  assert.deepEqual(repeatedSentences(t), []);
  assert.deepEqual(cuts(t), []);
});

test("r4 translate: copy to the buyer speaks to the buyer, and 'the question we hear most' is not stated as fact", async () => {
  for (const a of [TELAXIS, DATAVAULT]) {
    const t = await call("impact_translate_execution", a);
    const copy = (sections(t)["LinkedIn Execution"] || "") + (sections(t)["Cold Email Execution"] || "");
    assert.doesNotMatch(copy, /the buyer's own|The question we hear most/i);
  }
});

// ---- craft ------------------------------------------------------------------------------------------------------------------------------------------
test("r4 craft: a client count is never the audience, and sector roles, objections and words that do not touch the user's own results stay out", async () => {
  const t = await call("impact_craft_message", MARKETLANE);
  assert.doesNotMatch(t, /Built for \d/, "a count taken as the audience");
  assert.doesNotMatch(t, /agent attrition|average handle time|first contact resolution|head of support|call recording/i);
  assert.match(t, /ticket escalations|false positives/);
});

test("r4 craft: a figure typed in the benefit is a proof line, so the proof-led variation never says no result was typed", async () => {
  const t = await call("impact_craft_message", LINKBAY);
  const d = t.split("**Variation D: lead with social proof**")[1].split("###")[0];
  assert.match(d, /99\.80% of site moves done right the first time \(page claim\)/);
  assert.match(d, /35% of Internet routes/);
  assert.doesNotMatch(t, /was typed, so there is no honest proof line/);
});

test("r4 craft: a category that arrives wrapped in quotes keeps its quotes balanced when it is split at a colon", async () => {
  const t = await call("impact_craft_message", { product_name: "Roomwise", target_customer: "hotels", customer_need: "hotels manage pricing in separate tools", product_category: "Hospitality Management System: the operating system for modern hotels (a cloud-native property management system, PMS, with POS, revenue management and payments in the same system)", key_benefit: "reduce operating costs with less manual work", competitor: "separate point tools", differentiation: "one operating system for the whole property" });
  for (const line of t.split("\n")) for (const m of line.matchAll(/“([^”]*)”/g)) assert.doesNotMatch(m[1], /\bthat helps\b|\. It covers|\. They\b/, `a quotation holds the tool's own words: ${line.slice(0, 220)}`);
});
