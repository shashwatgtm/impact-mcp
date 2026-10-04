// Run 21 verification repair: the public letter grade and length/keyword-sensitive score are removed. The report exposes a
// presence-only checklist and keeps the workflow and recommendations intact.
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
  company_name: "Cloudmoat",
  product_description: "Cloud security monitoring for fintech teams",
  target_customer: "Security managers",
  problem_solved: "Too many cloud alerts",
};
const PADDED = {
  ...BASE,
  target_customer: "Security managers at firms with 50 to 500 employees, very very great",
  key_differentiation: "the only unique very very great monitoring approach",
  competitors: ["A", "B", "C"],
  current_positioning: "The only very very great monitoring tool for security managers, unlike the rest",
  customer_feedback: "Very very great, very very great, very very great, very very great product",
};
const MEASURES = "**What this checklist measures**: whether relevant inputs are present. It does not judge evidence quality, positioning strength, or commercial validity.";
const JUDGING = [/Overall Score/, /ready to scale/, /overhaul needed/, /minor refinements needed/, /significant improvements possible/,
  /major gaps to address/, /\| Strong \|/, /\| Needs Work \|/, /\| Critical \|/, /Expected Improvement/, /Rated Critical/,
  /provides good specificity/, /enabling competitive positioning/, /provides a foundation for value articulation/,
  /needs more specificity/, /needs deeper analysis/, /needs quantification/, /needs tighter criteria/, /is weak\./, /second-weakest/];

test("D33 repair: the plain input exposes a presence-only checklist", async () => {
  const out = await call("impact_full_audit", BASE);
  assert.match(out, /### Input completeness checklist/);
  assert.doesNotMatch(out, /Grade:|Input completeness score|\/100/);
  assert.ok(out.includes(MEASURES), "the measures sentence is printed");
  assert.equal(out.split("What this checklist measures").length - 1, 1, "said once");
  for (const re of JUDGING) assert.doesNotMatch(out, re);
});

test("D33 repair: the padded input still has no grade or numeric score", async () => {
  const out = await call("impact_full_audit", PADDED);
  assert.match(out, /### Input completeness checklist/);
  assert.doesNotMatch(out, /Grade:|Input completeness score|\/100/);
  assert.ok(out.includes(MEASURES), "the measures sentence is printed");
  assert.equal(out.split("What this checklist measures").length - 1, 1, "said once");
  for (const re of JUDGING) assert.doesNotMatch(out, re);
});

test("D33 repair: checklist values are presence-only", async () => {
  const out = await call("impact_full_audit", PADDED);
  assert.match(out, /\| Phase \| Relevant input \| Presence \| Next step \|/);
  assert.match(out, /\| \*\*I\*\*: Identify Champions \| Target customer \| Present \|/);
  assert.match(out, /\| \*\*T\*\*: Translate Execution \| Customer feedback \| Present \|/);
  const thin = await call("impact_full_audit", BASE);
  assert.match(thin, /\| \*\*C\*\*: Craft Message \| Current positioning \| Missing \|/);
  assert.match(thin, /\| \*\*P\*\*: Pinpoint Value \| Differentiation \| Missing \|/);
});

test("D33: the tool description in tools/list is truthful", async () => {
  const t = (await list()).find((x) => x.name === "impact_full_audit");
  assert.equal(t.description, "Positioning audit with an input completeness checklist and recommendations");
});
