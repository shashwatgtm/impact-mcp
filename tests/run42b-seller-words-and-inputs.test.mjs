// Run 42b: the seller's category and product description decide the sector; AI, a feature, the deal text or the customers' industries never override it.
// The buyer team given by the user wins over sector defaults, and a beachhead is ranked from the inputs given, never from a keyword in a segment name.
// Invented companies only.
import test from "node:test";
import assert from "node:assert/strict";
import { call } from "./run22-impact-common.mjs";

test("an AI execution platform for supply chain is logistics tech, not document AI, even with document processing among its features", async () => {
  const o = await call("impact_pinpoint_value", { product_name: "Trackwell", category: "the AI execution platform for supply chain", target_customer: "shippers and brands", key_outcome: "carrier updates in seconds", unique_capability: "real-time tracking, supplier document processing, plain-English agent workflows" });
  assert.match(o, /Sector: read from your inputs as logistics tech/);
  assert.ok(!/document AI|OCR|handwriting|cost per document/i.test(o));
});

test("a customer experience software platform is never read as a BPO services business by the deal text or its segments", async () => {
  const o = await call("impact_anchor_market", { product_description: "Convoy CX, an AI-native platform for customer experience management with service, social and insights suites", potential_segments: ["telecommunications", "consumer brands", "global enterprises", "contact centers"], average_deal_size: "$100,000 (hypothetical)", sales_cycle: "120 days (hypothetical)" });
  assert.ok(!/BPO|per FTE|outsourc/i.test(o), "read as a services business");
  assert.doesNotMatch(o, /from the deal text, because your own description names no sector/);
});

test("services wording still means a services business", async () => {
  const o = await call("impact_anchor_market", { product_description: "Harbor Desk, a customer experience outsourcing company that runs contact centers for retailers", potential_segments: ["retail", "telecom"] });
  assert.match(o, /BPO|services/i);
});

test("the deal text alone never picks a sector: neutral wording instead of a confident guess", async () => {
  const o = await call("impact_pinpoint_value", { product_name: "Thing", category: "a tool", target_customer: "freight forwarders and shippers", key_outcome: "fewer delays", unique_capability: "live tracking of loads" });
  assert.doesNotMatch(o, /read from your inputs as .*\(from the deal text/);
});

test("the team named as the buyer wins over the team the problem text points to", async () => {
  const o = await call("impact_identify_champions", { product_description: "an AI assistant platform for the workforce", problem_solved: "invoices take too long to process and chase", target_company_type: "enterprise IT and HR service desks" });
  assert.match(o, /Service Desk/);
  assert.ok(!/Finance Controller/.test(o));
});
