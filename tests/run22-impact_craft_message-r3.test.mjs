// Run 22 round 3, impact_craft_message: written before the fixes (test first). Faults of the fresh judges: measures, proof and objections that belong to another kind of
// work than the inputs describe (developer tool measures for managed data infrastructure, contact centre measures for a capital markets and compliance firm), a security
// evaluator line that says nothing about security, a tagline that ends in a colon, a product name cut to "<Brand> digital", a list sentence that is not grammatical.
// Companies are invented (Datadock, Fintrail, Hostelry); every figure is an invented test input. Run: node --no-warnings --test tests/run22-impact_craft_message-r3.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { call, PLACEHOLDER, repeatedSentences, cuts, sections } from "./run22-impact-common.mjs";

const TOOL = "impact_craft_message";
const DATADOCK = {
  product_name: "Datadock managed data platform (managed PostgreSQL, Kafka and ClickHouse)",
  target_customer: "developers and engineering teams who need production-grade open source data infrastructure without the operational overhead: startups, scale-ups and enterprises; thousands of companies run on it (page claims)",
  customer_need: "self-hosting open source data tools means constant infrastructure operations (patching, scaling and failures), while a basic cloud service locks you to one provider with unpredictable costs",
  product_category: "managed open source data infrastructure (open source data platform)",
  key_benefit: "stop managing and start building: a new PostgreSQL or Kafka service live in under 10 minutes, with patching, scaling, security and uptime handled and a 99.99% uptime SLA on production plans (page claims)",
  competitor: "cloud-native managed databases tied to one provider",
  differentiation: "genuine open source on open standards: every service runs the upstream version with standard drivers, not a proprietary fork; one control plane across any cloud",
};
const FINTRAIL = {
  product_name: "Fintrail digital, data and compliance services and AI products (Auditdesk, Riskboard, Docscan)",
  target_customer: "large enterprises and financial institutions, brands and fast-growing clients, including Fortune 500 companies, with 400+ clients (page claim)",
  customer_need: "capital markets are under constant strain from rising volumes, tighter regulations and the cost of financial risk management; fragmented data slows decisions",
  product_category: "digital, data and compliance solutions (its own words: the engine behind some of the world's most admired businesses)",
  key_benefit: "deliver accuracy, speed and scalability without pushing costs up; reduce complexity, lower operating costs and help the business stay agile; examples the pages give are a 51% reduction in review time and a 70% reduction in false positives with AI (page claims)",
  competitor: "rule-based automation",
  differentiation: "deep domain expertise combined with AI-powered tools and operational excellence at scale, with AI built around the client's workflows and not layered on top",
};
const HOSTELRY = {
  product_name: "Hostelry",
  target_customer: "independent hotels and small chains",
  customer_need: "revenue managers juggle pricing, reservations and reports in separate tools",
  product_category: "hotel management platform",
  key_benefit: "run pricing, operations and reporting from one place",
  competitor: "separate point tools",
  differentiation: "1,000+ integrations and an open API let a hotel keep parts of its current tech stack; one data model for every property",
};

test("r3 craft: measures, proof to collect and the vocabulary line do not come from another kind of work than the inputs describe", async () => {
  const t = await call(TOOL, DATADOCK);
  assert.doesNotMatch(t, /release frequency|lead time for changes|pipeline or incident data|seats|self serve trial/i, "developer tool measures for managed data infrastructure");
  const econ = t.split("**For the economic buyer")[1].split("**For the technical")[0];
  assert.match(econ, /uptime/i, "the measure comes from the user's own figures");
  const f = await call(TOOL, FINTRAIL);
  assert.doesNotMatch(f, /first contact resolution|agent attrition|average handle time|head of support/i, "contact centre measures for a capital markets and compliance firm");
  assert.match(f, /accuracy|false positives|review time|operating costs/i);
});

test("r3 craft: the technical evaluator line says something about the evaluator's concern, from the user's own words", async () => {
  const t = await call(TOOL, DATADOCK);
  const m = t.match(/\*\*For the technical evaluator \(([^)]*)\):\*\*\n>([^\n]*)/);
  assert.ok(m, "evaluator block found");
  if (/security|compliance|risk|audit/i.test(m[1])) assert.match(m[2], /security|patching/i, `the ${m[1]} line says nothing about security: ${m[2]}`);
  assert.doesNotMatch(m[2], /For the technical review:.*For the technical review:/);
});

test("r3 craft: no tagline ends in a colon or a joining word, and a name followed by its own list is not cut to '<Brand> digital'", async () => {
  for (const a of [DATADOCK, FINTRAIL, HOSTELRY]) {
    const t = await call(TOOL, a);
    for (const l of t.split("\n").filter((x) => /^\| \*\*(Outcome|Differentiator|Audience|Problem)/.test(x))) assert.doesNotMatch(l, /[:,;]["”]? \|/, `a tagline ends in a mark: ${l}`);
    assert.deepEqual(cuts(t), []);
    assert.deepEqual(repeatedSentences(t), []);
  }
  const f = await call(TOOL, FINTRAIL);
  assert.match(f, /# Positioning and Messaging: Fintrail\n/);
  assert.doesNotMatch(f, /Fintrail digital\b(?!,)/, "the name is not cut to 'Fintrail digital'");
});

test("r3 craft: the alternative objection and the price objection are present", async () => {
  const f = await call(TOOL, FINTRAIL);
  const obj = sections(f)["Objection Handling"] || "";
  assert.ok(obj.length > 100);
  assert.match(obj, /price is too high/i);
  assert.match(obj, /We already use rule-based automation/);
});

test("r3 craft: a difference that holds a verb in the middle is not put after 'offers'", async () => {
  const t = await call(TOOL, HOSTELRY);
  assert.doesNotMatch(t, /offers 1,000\+ integrations and an open API let/);
  assert.match(t, /1,000\+ integrations and an open API let a hotel keep parts of its current tech stack/);
});

// ---- the pool scenarios behind the judges' faults (skipped when the private folder is absent) -------------------------------------------------
import { loadPool } from "./run22-impact-common.mjs";
const pool = await loadPool();
test("r3 craft: pool Q12 and Q16 keep the brand alone as the name and measure in their own figures", { skip: !pool }, async () => {
  for (const id of ["Q12", "Q16"]) {
    const sc = pool.scenarios.find((s) => s.id === id);
    const args = await pool.build(TOOL, sc);
    const t = await call(TOOL, args);
    const head = t.split("\n")[0];
    const first = String(args.product_name).split(/\s+/)[0].replace(/,$/, "");
    assert.ok(head.startsWith(`# Positioning and Messaging: ${first}`), head);
    const econ = (t.match(/Measure it in ([^\n]*)/) || [])[1] || "";
    assert.doesNotMatch(econ, /first contact resolution|average handle time|release frequency|lead time for changes/i, `${id}: ${econ}`);
    assert.doesNotMatch(t, /pipeline or incident data|\bseats\b|self serve trial/i, id);
    assert.doesNotMatch(t, /[:;,]["”]? \|/, `${id}: a tagline ends in a mark`);
  }
});
