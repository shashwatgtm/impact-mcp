// Remediation: the public letter grade and length/keyword-sensitive score were removed. The report now exposes a
// presence-only input completeness checklist and keeps the business workflow and recommendations intact.
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
const MEASURES = "**What this checklist measures**: whether relevant inputs are present. It does not judge evidence quality, positioning strength, or commercial validity.";
const JUDGING = [/Overall Score/, /ready to scale/, /overhaul needed/, /minor refinements needed/, /significant improvements possible/,
  /major gaps to address/, /\| Strong \|/, /\| Needs Work \|/, /\| Critical \|/, /Expected Improvement/, /Rated Critical/,
  /provides good specificity/, /enabling competitive positioning/, /provides a foundation for value articulation/,
  /needs more specificity/, /needs deeper analysis/, /needs quantification/, /needs tighter criteria/, /is weak\./, /second-weakest/];

test("D33 remediation: the plain input exposes a presence-only checklist", async () => {
  const out = await call("impact_full_audit", BASE);
  assert.match(out, /### Input completeness checklist/);
  assert.doesNotMatch(out, /Grade:/);
  assert.ok(out.includes(MEASURES), "the measures sentence is printed");
  assert.equal(out.split("What this checklist measures").length - 1, 1, "said once");
  for (const re of JUDGING) assert.doesNotMatch(out, re);
});

test("D33 remediation: filler does not restore a grade or change checklist semantics", async () => {
  const out = await call("impact_full_audit", PADDED);
  assert.match(out, /### Input completeness checklist/);
  assert.doesNotMatch(out, /Grade:/);
  assert.ok(out.includes(MEASURES), "the measures sentence is printed");
  assert.equal(out.split("What this checklist measures").length - 1, 1, "said once");
  for (const re of JUDGING) assert.doesNotMatch(out, re);
});

test("D33 remediation: area checklist values are presence-only", async () => {
  const out = await call("impact_full_audit", PADDED);
  assert.match(out, /\| Phase \| Score \| Input detail \| Priority \|/);
  assert.match(out, /\| \*\*I\*\*: Identify Champions \| 100\/100 \| Detailed \| Low \|/);
  assert.match(out, /\| \*\*T\*\*: Translate Execution \| 100\/100 \| Detailed \| Low \|/);
  const thin = await call("impact_full_audit", BASE);
  assert.match(thin, /\| \*\*C\*\*: Craft Message \| 0\/100 \| Thin \| High \|/);
  assert.match(thin, /\| \*\*P\*\*: Pinpoint Value \| 0\/100 \| Thin \| High \|/);
});

test("D33: the tool description in tools/list is truthful", async () => {
  const t = (await list()).find((x) => x.name === "impact_full_audit");
  assert.equal(t.description, "Positioning audit with an input completeness checklist and recommendations");
});
