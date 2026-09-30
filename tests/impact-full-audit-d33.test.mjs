// Run 15 D33 (owner decision, 30 September 2026): impact_full_audit keeps every number, threshold, letter grade and area score,
// calls the overall figure an "input completeness score", says once what it measures, and describes the inputs instead of
// judging the positioning. Codex C-IMP-02 and Claude chat's re-measure: the same product scored 41/100 (F), then 82/100 (B)
// after padding with "very very great", "only unique" and 3 competitors named A, B and C. The numbers must stay; the words
// must say what the score measures, whatever the padding.
// Tested in-process through the Netlify function handler netlify/functions/mcp.mjs (no network, no deploy).
// Run: node --test tests/impact-full-audit-d33.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

const { default: handler } = await import(new URL("../netlify/functions/mcp.mjs", import.meta.url));
const ACCEPT = "application/json, text/event-stream";
let nextId = 1;
const call = async (name, args) => {
  const r = await handler(new Request("https://x.gtmhelix.com/mcp", {
    method: "POST", headers: { "content-type": "application/json", accept: ACCEPT },
    body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method: "tools/call", params: { name, arguments: args } }),
  }));
  const j = await r.json();
  return j.result.content.map((c) => c.text).join("\n");
};
const list = async () => {
  const r = await handler(new Request("https://x.gtmhelix.com/mcp", {
    method: "POST", headers: { "content-type": "application/json", accept: ACCEPT },
    body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method: "tools/list", params: {} }),
  }));
  return (await r.json()).result.tools;
};

const BASE = {
  company_name: "ExampleCo",
  product_description: "Scheduling software for clinics",
  target_customer: "Clinic managers",
  problem_solved: "Missed appointments",
};
const PADDED = {
  ...BASE,
  target_customer: "Clinic managers at groups with 50 to 500 employees, very very great",
  key_differentiation: "the only unique very very great scheduling approach",
  competitors: ["A", "B", "C"],
  current_positioning: "The only very very great scheduling tool for clinic managers, unlike the rest",
  customer_feedback: "Very very great, very very great, very very great, very very great product",
};
const MEASURES = "**What this score measures**: how complete and specific your inputs are, not whether your positioning is right. Longer inputs and certain words (such as only, unique, unlike, employees, revenue and Series) raise it.";
const JUDGING = [/Overall Score/, /ready to scale/, /overhaul needed/, /minor refinements needed/, /significant improvements possible/,
  /major gaps to address/, /\| Strong \|/, /\| Needs Work \|/, /\| Critical \|/, /Expected Improvement/, /Rated Critical/,
  /provides good specificity/, /enabling competitive positioning/, /provides a foundation for value articulation/,
  /needs more specificity/, /needs deeper analysis/, /needs quantification/, /needs tighter criteria/, /is weak\./, /second-weakest/];

test("D33: the plain input keeps its numbers (41/100, F) and says what the score measures", async () => {
  const out = await call("impact_full_audit", BASE);
  assert.match(out, /### Input completeness score: 41\/100 \(Grade: F\)/);
  assert.ok(out.includes(MEASURES), "the measures sentence is printed");
  assert.equal(out.split("What this score measures").length - 1, 1, "said once");
  for (const re of JUDGING) assert.doesNotMatch(out, re);
});

test("D33: the same input padded with filler keeps its numbers (82/100, B) and still says what the score measures", async () => {
  const out = await call("impact_full_audit", PADDED);
  assert.match(out, /### Input completeness score: 82\/100 \(Grade: B\)/);
  assert.ok(out.includes(MEASURES), "the measures sentence is printed");
  assert.equal(out.split("What this score measures").length - 1, 1, "said once");
  for (const re of JUDGING) assert.doesNotMatch(out, re);
});

test("D33: area scores and statuses keep the same thresholds (70 and 50), with words about the inputs", async () => {
  const out = await call("impact_full_audit", PADDED);
  assert.match(out, /\| Phase \| Score \| Input detail \| Priority \|/);
  assert.match(out, /\| \*\*I\*\*: Identify Champions \| 85\/100 \| Detailed \| Low \|/);
  assert.match(out, /\| \*\*T\*\*: Translate Execution \| 75\/100 \| Detailed \| Low \|/);
  const thin = await call("impact_full_audit", BASE);
  assert.match(thin, /\| \*\*C\*\*: Craft Message \| 30\/100 \| Thin \| High \|/);
  assert.match(thin, /\| \*\*P\*\*: Pinpoint Value \| 50\/100 \| Partial \| High \|/);
});

test("D33: the tool description in tools/list is truthful", async () => {
  const t = (await list()).find((x) => x.name === "impact_full_audit");
  assert.equal(t.description, "Positioning audit with an input completeness score and recommendations");
});
