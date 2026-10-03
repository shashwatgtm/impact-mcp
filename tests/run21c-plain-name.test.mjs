// Run 21c round 3 (test first): a product typed as a long description with no name was pasted whole, in bold, into every "only" statement and message line
// (impact_pinpoint_value, impact_craft_message, impact_translate_execution). A long product text is now shortened to its noun phrase in running sentences;
// the Product line still shows the full text, and a clear name is used as typed.
// Run: node --no-warnings --test tests/run21c-plain-name.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

const { default: handler } = await import(new URL("../netlify/functions/mcp.mjs", import.meta.url));
const call = async (name, args) => {
  const r = await handler(new Request("https://x.gtmhelix.com/mcp", { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }) }));
  return (await r.json()).result.content.map((c) => c.text).join("\n");
};
const LONG = "Freight visibility platform for shippers that tracks every load across carriers and modes: live ETAs, exception alerts, carrier scorecards and a customer portal";
const base = { category: "freight visibility software", target_customer: "shippers with many carriers", key_outcome: "one view of every load and fewer late deliveries", unique_capability: "live ETAs across carriers and modes" };

test("impact_pinpoint_value: a long product text is not pasted into every statement", async () => {
  const out = await call("impact_pinpoint_value", { product_name: LONG, ...base });
  const n = out.split(LONG).length - 1;
  assert.ok(n <= 1, `the full product text appears ${n} times`);
  assert.match(out, /Freight visibility platform/);
});

test("a clear name is used as typed", async () => {
  const out = await call("impact_pinpoint_value", { product_name: "Lanehop", ...base });
  assert.match(out, /\*\*Lanehop\*\* is the only/);
});
