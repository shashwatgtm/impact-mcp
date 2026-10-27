// 27 Oct 2026 (owner): impact_anchor_market never chooses a segment or vertical it was not given. With no segments it used to
// score three example segments and recommend one ("Mid-market SaaS (50-500 employees)" for a logistics product).
// In-process through netlify/functions/mcp.mjs (no network, no deploy). Run: node --test tests/impact-anchor-no-segments.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

const { default: handler } = await import(new URL("../netlify/functions/mcp.mjs", import.meta.url));
const call = async (args) => {
  const r = await handler(new Request("https://x.gtmhelix.com/mcp", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "impact_anchor_market", arguments: args } }),
  }));
  const j = await r.json();
  assert.ok(!j.result.isError, JSON.stringify(j).slice(0, 300));
  return j.result.content.map((c) => c.text).join("\n");
};
const LOGISTICS = "A route planning and delivery tracking platform for last-mile delivery teams";

for (const [label, segs] of [["no segments", undefined], ["an empty list", []], ["only blank segments", ["", "  "]]]) {
  test(`with ${label}, no segment is invented, scored or recommended`, async () => {
    const t = await call(segs === undefined ? { product_description: LOGISTICS } : { product_description: LOGISTICS, potential_segments: segs });
    assert.match(t, /No segment is recommended: you named no market segments/);
    for (const invented of ["Mid-market SaaS", "Enterprise Tech", "SMB (10-50", "Recommended Beachhead", "Segment Scores", "(beachhead)"]) {
      assert.ok(!t.includes(invented), `answer contains "${invented}"`);
    }
    assert.match(t, /How to find your candidate segments/);
    assert.match(t, /TAM, SAM and SOM are calculated per segment, so none is calculated here/);
  });
}

test("with no segments, the user's own customers, pain and deal size are quoted in the steps", async () => {
  const t = await call({
    product_description: LOGISTICS,
    current_customers: "Three regional third-party logistics providers with 40 to 200 drivers",
    customer_pain: "late deliveries and drivers re-planning routes by phone",
    average_deal_size: "$24,000",
  });
  assert.match(t, /You describe them as "Three regional third-party logistics providers with 40 to 200 drivers"/);
  assert.match(t, /"late deliveries and drivers re-planning routes by phone"/);
  assert.match(t, /buyers can approve \$24,000/);
  assert.ok(!t.includes("Recommended Beachhead"));
});

test("with segments named, they are still scored as before", async () => {
  const t = await call({ product_description: LOGISTICS, potential_segments: ["Regional 3PL providers", "Grocery delivery chains"] });
  assert.match(t, /## Segment Scoring Matrix/);
  assert.ok(t.includes("Regional 3PL providers") && t.includes("Grocery delivery chains"));
  assert.ok(!t.includes("Mid-market SaaS"));
});

test("the tool and field descriptions say no segment is chosen without segments", async () => {
  const r = await handler(new Request("https://x.gtmhelix.com/mcp", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list" }),
  }));
  const tool = (await r.json()).result.tools.find((x) => x.name === "impact_anchor_market");
  assert.match(tool.description, /It never chooses a segment you did not name/);
  assert.match(tool.inputSchema.properties.potential_segments.description, /without segments no segment is chosen/);
});
