// Run 15 R15-32: fixes from the edge-case matrix (evidence/run15/matrix/, triage independent-audit/run15/matrix-triage.md).
// 1. The short audience in taglines ("Built for ...", "Join [number] ...", "Cut late deliveries for ...") is the role at the start of the
//    target customer, not its last words ("Built for 2,000 employees" came from "CFOs of ... with 200 to 2,000 employees").
// 2. An empty segment list in impact_anchor_market is treated like no list (it was a tool error).
// 3. impact_map_alternatives labels its placeholder competitors as examples, and an empty list is treated like no list.
// Tested in-process through netlify/functions/mcp.mjs (no network, no deploy). Run: node --test tests/matrix-fixes.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

const { default: handler } = await import(new URL("../netlify/functions/mcp.mjs", import.meta.url));
let nextId = 1;
const call = async (name, args) => {
  const r = await handler(new Request("https://x.gtmhelix.com/mcp", {
    method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method: "tools/call", params: { name, arguments: args } }),
  }));
  const j = await r.json();
  return { isError: !!j.result.isError, text: j.result.content.map((c) => c.text).join("\n") };
};
const MSG = { product_name: "Lanehop", customer_need: "lose days chasing late deliveries", product_category: "last-mile delivery platform", key_benefit: "fewer late deliveries", competitor: "manual dispatch calls", differentiation: "Live re-routing with instant driver updates" };

test("audience: the role at the start of a long target customer, never its last words", async () => {
  const cases = [
    ["CFOs of US and European mid-market companies with 200 to 2,000 employees", /Built for CFOs"/, /Built for [0-9,]+ employees|Join 100[+] [0-9,]+ employees/],
    ["Heads of compliance at UK and EU challenger banks, 500 to 5,000 employees", /Built for heads of compliance"/, /Built for [0-9,]+ employees|Join 100[+] [0-9,]+ employees/],
    ["Owners of US restaurants and retail stores with 10 to 200 hourly staff", /Built for owners of US restaurants and retail stores"|Built for owners"/, /Built for hourly staff/],
    ["Operations directors at mid-size, multi-location logistics groups", /Built for operations directors"/, /Built for logistics groups/],
  ];
  for (const [tc, want, never] of cases) {
    const r = await call("impact_craft_message", { ...MSG, target_customer: tc });
    assert.equal(r.isError, false);
    assert.match(r.text, want, tc);
    assert.doesNotMatch(r.text, never, tc);
  }
});

test("audience: short target customers are kept whole, as before", async () => {
  const r = await call("impact_craft_message", { ...MSG, target_customer: "fleet operations directors" });
  assert.match(r.text, /Built for fleet operations directors"/);
  assert.match(r.text, /Join \[number\] fleet operations directors who get fewer late deliveries/);
});

test("anchor market: an empty segment list is treated like no list, with the example label", async () => {
  const r = await call("impact_anchor_market", { product_description: "Cloud security monitoring for fintech teams", potential_segments: [] });
  assert.equal(r.isError, false, r.text.slice(0, 200));
  assert.match(r.text, /You supplied no segments, so the segments are examples too\./);
});

test("map alternatives: placeholder competitors are labelled as examples; an empty list is treated like no list", async () => {
  for (const extra of [{}, { competitors: [] }]) {
    const r = await call("impact_map_alternatives", { your_product: "Cloudmoat", category: "Cloud security monitoring", ...extra });
    assert.match(r.text, /\*\*Analyzed Competitors\*\*: Competitor A, Competitor B, Status Quo \(examples: you supplied no competitors; replace them with your own\)/);
  }
  const given = await call("impact_map_alternatives", { your_product: "Cloudmoat", category: "Cloud security monitoring", competitors: ["Competitor A"] });
  assert.match(given.text, /\*\*Analyzed Competitors\*\*: Competitor A\n/);
});
