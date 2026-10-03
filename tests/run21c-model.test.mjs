// Run 21c job 2 (test first): impact_pinpoint_value assumed the usual model of the whole sector (connectivity for telecom) when the seller's words named no
// model, even when the reader had named a kind with a model of its own (a messaging platform is sold per message). The answer must state the kind's model.
// A company in plain words (no name). Run: node --no-warnings --test tests/run21c-model.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

const { default: handler } = await import(new URL("../netlify/functions/mcp.mjs", import.meta.url));
let nextId = 1;
const call = async (name, args) => {
  const r = await handler(new Request("https://x.gtmhelix.com/mcp", { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" }, body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method: "tools/call", params: { name, arguments: args } }) }));
  const j = await r.json();
  return j.result.content.map((c) => c.text).join("\n");
};

test("a business messaging platform is not told it sells connectivity", async () => {
  const t = await call("impact_pinpoint_value", { product_name: "Pingly", category: "A2P business messaging platform: one API to send SMS and WhatsApp messages", target_customer: "banks and retailers that send alerts and one time passwords", key_outcome: "messages reach the phone and reporting shows delivery", unique_capability: "one API for every channel with delivery reporting" });
  assert.match(t, /per-transaction/i, "model line");
  assert.doesNotMatch(t, /per site or link|site survey|connectivity \(per site/i);
});
