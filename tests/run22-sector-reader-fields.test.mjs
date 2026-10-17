// Run 22 sector reader job, impact: how the tool's fields reach the shared reader (readContext in src/index.ts). Invented company, plain words.
// A services firm whose capability text names "AI-powered tools" was read as a software subscription although the sector read from the whole
// text was IT and business services. Run: node --test tests/run22-sector-reader-fields.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

const { default: handler } = await import(new URL("../netlify/functions/mcp.mjs", import.meta.url));
let nextId = 1;
const call = async (name, args) => {
  const r = await handler(new Request("https://x.gtmhelix.com/mcp", { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" }, body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method: "tools/call", params: { name, arguments: args } }) }), { ip: "10.1.0." + (nextId % 250), geo: {}, site: {}, requestId: String(nextId) });
  const j = await r.json();
  return j.result.content.map((c) => c.text).join("\n");
};

test("a services firm with AI-powered tools in its capability text is read as ITeS with the services model (impact_craft_message)", async () => {
  const t = await call("impact_craft_message", {
    product_name: "Opsgrove customer experience services and analytics products",
    product_category: "digital, data and customer experience solutions",
    differentiation: "deep domain expertise combined with AI-powered tools and operational excellence at scale, built around the client's workflows",
    target_customer: "large banks and telecom operators",
    customer_need: "cut the cost of running service operations without losing quality",
    key_benefit: "faster, cheaper operations that keep service levels",
  });
  assert.match(t, /Sector: read from your inputs as ITeS/);
  assert.match(t, /Business model: services/);
  assert.doesNotMatch(t, /Business model: software subscription/);
});

test("a software product that names the same words keeps the subscription model (impact_craft_message)", async () => {
  const t = await call("impact_craft_message", {
    product_name: "Opsgrove",
    product_category: "customer experience software",
    differentiation: "AI-powered tools and a subscription platform built around the client's workflows",
    target_customer: "large banks and telecom operators",
    customer_need: "cut the cost of running service operations without losing quality",
    key_benefit: "faster, cheaper operations that keep service levels",
  });
  assert.match(t, /Business model: software subscription/);
});
