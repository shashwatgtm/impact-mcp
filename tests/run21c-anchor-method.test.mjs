// Run 21c job 2, owner decision D94 (4 October 2026), written before the change: impact_anchor_market ranks the segments from the user's own
// customers, pain and deal size when all three are given; otherwise it uses the keyword presets as before. The answer says which method it used.
// Companies are described in plain words (no names). Run: node --no-warnings --test tests/run21c-anchor-method.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

const { default: handler } = await import(new URL("../netlify/functions/mcp.mjs", import.meta.url));
let nextId = 1;
const rpc = async (method, params) => (await (await handler(new Request("https://x.gtmhelix.com/mcp", { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" }, body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method, params }) }))).json()).result;
const call = async (args) => (await rpc("tools/call", { name: "impact_anchor_market", arguments: args })).content.map((c) => c.text).join("\n");
const BASE = {
  product_description: "Route planning and proof of delivery software for delivery fleets",
  potential_segments: ["Mid-market fintech", "Enterprise banks", "Small retail chains"],
  average_deal_size: "$40,000",
};
const OWN = { current_customers: "Four small retail chains and a grocery chain that run their own delivery fleets", customer_pain: "late deliveries and customers calling to ask where the order is, in small retail chains", };
const beachhead = (t) => (t.match(/Recommended Beachhead: ([^\n]+)/) || [])[1];

test("D94: with customers, pain and deal size the segments are ranked from them, and the answer says so", async () => {
  const t = await call({ ...BASE, ...OWN });
  assert.match(t, /Method used: ranked from your own customers, pain and deal size/);
  assert.equal(beachhead(t), "Small retail chains");
  assert.doesNotMatch(t, /scores are presets|keyword match only|because its name contains the keyword/);
});

// Run 42b: typed segments are ranked from the inputs given, never from a keyword in a segment name; a missing input leaves its criterion at the middle score and the answer says what it used.
test("D94 (run 42b): without the pain the segments are ranked from the customers given, and the answer says which input is missing", async () => {
  const t = await call({ ...BASE, current_customers: OWN.current_customers });
  assert.match(t, /Method used: ranked from the inputs you gave: your current customers/);
  assert.match(t, /not given: customer_pain/);
  assert.equal(beachhead(t), "Small retail chains");
  assert.doesNotMatch(t, /keyword presets|because its name contains the keyword/);
});

test("D94 (run 42b): without the deal size, or without customers, the inputs given still rank and the answer says what it used", async () => {
  const noAcv = await call({ product_description: BASE.product_description, potential_segments: BASE.potential_segments, ...OWN });
  assert.match(noAcv, /Method used: ranked from the inputs you gave: your current customers and your customer pain/);
  assert.match(noAcv, /average_deal_size/);
  const noCust = await call({ ...BASE, customer_pain: OWN.customer_pain });
  assert.match(noCust, /Method used: ranked from the inputs you gave: your customer pain/);
  assert.match(noCust, /current_customers/);
});

test("D94 (run 42b): the same inputs give the same scores, and a keyword in a segment name changes nothing (metamorphic)", async () => {
  const a = await call({ ...BASE, customer_pain: OWN.customer_pain });
  const renamed = await call({ ...BASE, potential_segments: ["Mid-market fintech", "Enterprise banks", "Small retail chains"].map((x) => x.replace("Enterprise", "Large").replace("Mid-market", "Medium")), customer_pain: OWN.customer_pain });
  const total = (t, re) => (t.match(re) || [])[1];
  assert.equal(total(a, /Enterprise banks[^\n]*\*\*(\d+)\*\*/), total(renamed, /Large banks[^\n]*\*\*(\d+)\*\*/));
  assert.doesNotMatch(a, /the keyword "/);
});

test("D94: no segment shares a word with the customers or the pain: the scores tie and say so", async () => {
  const t = await call({ ...BASE, current_customers: "Customers in Pune", customer_pain: "slow reporting" });
  assert.match(t, /Method used: ranked from your own customers, pain and deal size/);
  assert.match(t, /tie/i);
  assert.equal(beachhead(t), undefined);
});

test("D94: company counts and the deal size give the budget score from the market value of each segment (count x deal size)", async () => {
  const t = await call({ ...BASE, ...OWN, company_counts: "Mid-market fintech: 100; Small retail chains: 5000; Enterprise banks: 50" });
  const row = (name) => (t.match(new RegExp(`\\| (?:\\*\\*)?${name}[^\\n]*`)) || [""])[0];
  const cells = (r) => r.split("|").map((x) => x.trim().replace(/\*/g, ""));
  const small = cells(row("Small retail chains")), mid = cells(row("Mid-market fintech"));
  assert.ok(Number(small[3]) > Number(mid[3]), `budget small ${small[3]} vs mid ${mid[3]}`);
});

test("D94: the new input is optional and described, and the other input descriptions say what is used", async () => {
  const tool = (await rpc("tools/list", {})).tools.find((x) => x.name === "impact_anchor_market");
  assert.ok(tool.inputSchema.properties.customer_pain);
  assert.ok(!tool.inputSchema.required.includes("customer_pain"));
  assert.match(tool.inputSchema.properties.customer_pain.description, /current_customers/);
  assert.match(tool.inputSchema.properties.current_customers.description, /customer_pain/);
});
