// Run 27B (b): an optional named list field for impact_anchor_market (owner decision "(g) and (b) together"; input schema of this tool only).
// product_parts: one part per entry, read whole (never cut at a comma). The old product_description still works. Plain words only (rule B81).
// Run: node --test tests/run27b-lists.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

const { default: handler } = await import(new URL("../netlify/functions/mcp.mjs", import.meta.url));
let nextId = 1;
const rpc = async (method, params) => {
  const r = await handler(new Request("https://x.gtmhelix.com/mcp", {
    method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method, params }),
  }));
  return (await r.json()).result;
};

test("impact_anchor_market: product_parts is an optional list, and each entry is read whole", async () => {
  const t = (await rpc("tools/list", {})).tools.find((x) => x.name === "impact_anchor_market");
  assert.equal(t.inputSchema.properties.product_parts.type, "array");
  assert.ok(!t.inputSchema.required.includes("product_parts"));
  const r = await rpc("tools/call", { name: "impact_anchor_market", arguments: { product_description: "Operations software for multi site businesses", potential_segments: ["Hotel groups", "Fitness studio chains"],
    product_parts: ["Taskboard for site tasks, photo checks and deadlines", "Auditor for visits, scores and follow ups"], average_deal_size: "$20,000" } });
  const text = r.content.map((c) => c.text).join("\n");
  assert.match(text, /Taskboard for site tasks, photo checks and deadlines/);
  assert.match(text, /Auditor for visits, scores and follow ups/);
});
