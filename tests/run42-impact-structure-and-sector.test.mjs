// Run 42: the layout of an answer does not depend on typed digits or repeated items, and the buyer's team and the seller's own words decide
// the roles and the model. Invented companies only (B81 applies to real-company runs, not to unit tests of generic rules).
import test from "node:test";
import assert from "node:assert/strict";
import { call } from "./run22-impact-common.mjs";

const bullets = (t) => (t.match(/^\s*[-*] /gm) || []).length;

test("a weakness typed twice stays two items; the layout does not follow the words", async () => {
  const mk = (w) => call("impact_map_alternatives", { your_product: "a route planner", category: "route planning software", competitors: ["Acme Routes"], competitor_weaknesses: w });
  assert.equal(bullets(await mk("slow;slow;slow")), bullets(await mk("slow;fast;late")));
});

test("customer results with or without figures use the same layout", async () => {
  const mk = (m) => call("impact_pinpoint_value", { target_customer: "fleet managers", key_outcome: "fewer late deliveries", unique_capability: "live rerouting", customer_metrics: m });
  assert.equal(bullets(await mk("cut late drops 20% at one depot")), bullets(await mk("a happy fleet manager at one depot")));
});

test("the deal size read or not does not change the beachhead layout", async () => {
  const mk = (d) => call("impact_anchor_market", { product_description: "a route planner for fleets", potential_segments: ["regional carriers", "retail chains"], current_customers: "regional carriers", customer_pain: "late deliveries", average_deal_size: d });
  const a = await mk("$50,000"), b = await mk("a fair price");
  assert.equal(bullets(a), bullets(b));
  assert.ok(!/\n\*Read this as/.test(b));
});

test("no unfilled bracket placeholder as a tagline when key_differentiation is left out, and a tagline is present (intent of run40s3 F1)", async () => {
  const o = await call("impact_full_audit", { product_description: "a route planner", target_customer: "fleet managers", problem_solved: "late deliveries" });
  const tag = o.slice(o.indexOf("Tagline Options"), o.indexOf("30-Day Action Plan"));
  assert.match(tag, /^\d\. .+/m);
  assert.ok(!/\[your differentiation\]/i.test(tag));
});

test("the buyer's team named in target_customer wins over word counts in the capability text", async () => {
  const o = await call("impact_pinpoint_value", { product_name: "Beacon", category: "customer engagement platform", target_customer: "marketing and product teams at consumer brands", key_outcome: "agents run workflows and decisions for every customer", unique_capability: "workflow automation, process orchestration, back office workflows, journeys" });
  assert.match(o, /Head of Marketing/);
  assert.ok(!/Head of Operations|\bCOO\b/.test(o), "an operations buyer was added to a marketing buyer");
});

test("a seller that says it is a network connecting two sides is read as a marketplace, a plain subscription is not", async () => {
  const base = { product_name: "Lanehub", target_customer: "shippers", customer_need: "find carriers", key_benefit: "book capacity faster" };
  const m = await call("impact_craft_message", { ...base, product_category: "freight capacity platform", differentiation: "an open network connecting shippers and carriers" });
  assert.match(m, /marketplace/i);
  const s = await call("impact_craft_message", { ...base, product_category: "freight capacity platform", differentiation: "an open network connecting shippers and carriers, sold as a subscription" });
  assert.match(s, /software subscription/);
});
