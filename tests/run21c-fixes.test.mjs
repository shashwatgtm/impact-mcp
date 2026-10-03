// Run 21c job 4 (round 1 judge reasons, test first). Plain words, no names. Run: node --no-warnings --test tests/run21c-fixes.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

const { default: handler } = await import(new URL("../netlify/functions/mcp.mjs", import.meta.url));
let nextId = 1;
const call = async (name, args) => {
  const r = await handler(new Request("https://x.gtmhelix.com/mcp", { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" }, body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method: "tools/call", params: { name, arguments: args } }) }));
  const j = await r.json();
  return j.result.content.map((c) => c.text).join("\n");
};

test("a figure with a thousands comma is not cut in two when strengths are split (25,000+ stays 25,000+)", async () => {
  const t = await call("impact_map_alternatives", { your_product: "Probeguard, an attack surface monitor", category: "external attack surface monitoring", competitors: ["a generic threat feed"], your_strengths: "25,000+ sources monitored, 250+ takedowns supported and real time detection of leaks (page claims)" });
  assert.match(t, /25,000\+ sources monitored/);
  assert.doesNotMatch(t, /"000\+/);
});

test("a differentiation that starts with a verb ('combines ...') is not put after 'offer' ('We offer combines')", async () => {
  const t = await call("impact_craft_message", { product_name: "Brightbuild", target_customer: "enterprises with large application portfolios", customer_need: "legacy constraints lock budget into applications that no longer serve the business", product_category: "application services partner", key_benefit: "turn application portfolios into strategic assets and reclaim budget locked in maintenance", competitor: "traditional cloud migration tools that focus mainly on moving workloads", differentiation: "combines AI enhanced engineering teams, proprietary platforms and modern delivery frameworks across the whole application lifecycle instead of one phase" });
  assert.doesNotMatch(t, /offers? combines|offer combines/i);
  assert.match(t, /whole application lifecycle/);
});

test("when every segment ties, the answer does not name a category leader or a three year path for the first-listed segment", async () => {
  const t = await call("impact_anchor_market", { product_description: "Route planning software for delivery fleets", potential_segments: ["Automotive", "Retail", "Energy", "Chemicals"], average_deal_size: "$30,000" });
  assert.match(t, /tie/i);
  assert.doesNotMatch(t, /Category leader in/);
  assert.doesNotMatch(t, /Dominate Automotive/);
});

test("a committee sentence such as 'engineering leads evaluate the interfaces and champion' gives the champion role 'engineering leads', not a cut sentence", async () => {
  const t = await call("impact_identify_champions", { product_description: "Payments API for merchants: accept cards and bank transfers and pay out to sellers", problem_solved: "Developers wait weeks to take a first payment live", target_company_type: "online platforms with a developer team" });
  const line = (t.split("\n").find((l) => l.includes("Most Likely Role")) || "");
  assert.ok(line.length > 0, "no role line");
  assert.doesNotMatch(line, /evaluate|\band\s*$|\bthe interfaces/i, line);
});
