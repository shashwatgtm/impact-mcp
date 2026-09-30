// Run 15 R15-15 (Codex C-IMP-03): impact_anchor_market shows current_customers and sales_cycle for context only. The answer says so
// in one sentence, and the two input descriptions say "Shown in the output; not used in the scoring", as the ROI tool does.
// Metamorphic check: changing those two inputs changes no score, total, ranking or market size.
// Tested in-process through netlify/functions/mcp.mjs (no network, no deploy). Run: node --test tests/impact-anchor-context.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

const { default: handler } = await import(new URL("../netlify/functions/mcp.mjs", import.meta.url));
const ACCEPT = "application/json, text/event-stream";
let nextId = 1;
const rpc = async (method, params) => {
  const r = await handler(new Request("https://x.gtmhelix.com/mcp", {
    method: "POST", headers: { "content-type": "application/json", accept: ACCEPT },
    body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method, params }),
  }));
  return (await r.json()).result;
};
const call = async (args) => (await rpc("tools/call", { name: "impact_anchor_market", arguments: args })).content.map((c) => c.text).join("\n");
const SENTENCE = "Your current customers and sales cycle are shown for context; they do not change the scores or the market sizes.";
const BASE = { product_description: "Scheduling software for clinics", potential_segments: ["Mid-market SaaS (50-500 employees)", "Enterprise Finance", "Dental clinics"], average_deal_size: "$24,000" };

// Everything from the scoring matrix down, minus the two lines that print the inputs themselves.
const scoring = (t) => t.slice(t.indexOf("## Segment Scoring Matrix")).split("\n").filter((l) => !/^- Sales cycle:/.test(l)).join("\n");

test("C-IMP-03: the answer says once that current customers and sales cycle do not change the scores or sizes", async () => {
  const out = await call({ ...BASE, current_customers: "Three clinic groups in Pune", sales_cycle: "2 months" });
  assert.equal(out.split(SENTENCE).length - 1, 1);
});

test("C-IMP-03: changing current_customers and sales_cycle changes no score, ranking or market size", async () => {
  const a = await call({ ...BASE, current_customers: "Three clinic groups in Pune", sales_cycle: "2 months" });
  const b = await call({ ...BASE, current_customers: "Forty hospital networks across the US and UK", sales_cycle: "18 months" });
  const c = await call(BASE);
  assert.equal(scoring(a), scoring(b));
  assert.equal(scoring(a).replace(/ \(Example figure: replace with your own\)/g, ""), scoring(c).replace(/ \(Example figure: replace with your own\)/g, ""));
});

test("C-IMP-03: the two input descriptions say they are shown and not used in the scoring", async () => {
  const t = (await rpc("tools/list", {})).tools.find((x) => x.name === "impact_anchor_market");
  assert.equal(t.inputSchema.properties.current_customers.description, "Optional: Description of your current/best customers. Shown in the output; not used in the scoring");
  assert.equal(t.inputSchema.properties.sales_cycle.description, "Optional: Typical sales cycle length. Shown in the output; not used in the scoring");
});
