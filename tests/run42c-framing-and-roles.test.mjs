// Run 42B (set M): a typed result with a framing phrase is never cut to that phrase; an alternative of up to 14 words stays whole; roles come from the input's own team first. Invented companies only.
import test from "node:test";
import assert from "node:assert/strict";
import { call } from "./run22-impact-common.mjs";

const craft = (kb) => call("impact_craft_message", { product_name: "Fernwick", target_customer: "retail operations teams", customer_need: "Stores run out of stock before the next delivery", product_category: "inventory planning software", key_benefit: kb, differentiation: "Plans from store level sales", competitor: "tools built for people who have never run a store floor", your_sector: "saas" });

test("a framing phrase before the claim is dropped, never used as the headline", async () => {
  for (const kb of ["A featured case study states that Orlin Foods cut stockouts from weeks to days with store level plans (page headline)", "The home page cites a 25% fall in stockouts and 10x faster plans (page claims)"]) {
    const o = await craft(kb);
    assert.ok(!/featured case study states\b(?! that)|"A featured case study states"|"The home page cites"|get the home page cites|get a featured case study states\.?$/im.test(o), o);
    assert.ok(!/Tagline[^\n]*\n[^\n]*\n[^\n]*"(?:A featured case study states|The home page cites)"/.test(o));
    assert.match(o, /\(page (?:headline|claims)\)/);
  }
  const o = await craft("A featured case study states that Orlin Foods cut stockouts from weeks to days with store level plans (page headline)");
  assert.match(o, /Orlin Foods cut stockouts/);
  assert.ok(!/orlin foods cut/.test(o));
});

test("an alternative described in a clause stays whole", async () => {
  const o = await craft("Fewer stockouts (page claim)");
  assert.match(o, /tools built for people who have never run a store floor/);
  assert.ok(!/tools built for people[.,?]/.test(o));
});

test("champions: a revenue team named in the problem gets sales roles, not a banking list from several industries", async () => {
  const o = await call("impact_identify_champions", { company_name: "Fernwick", product_description: "A revenue AI platform that turns customer conversations into forecasts", problem_solved: "Revenue leaders and sellers only hear part of the conversation with customers", target_company_type: "technology, financial services, manufacturing", your_sector: "ai_native" });
  assert.match(o, /Sales Operations or Revenue Operations/);
  assert.ok(!/COO or CFO|operations, risk or customer service|banking and financial services/.test(o), o);
});

test("champions: several industries and no team named keep the sector's general committee", async () => {
  const o = await call("impact_identify_champions", { company_name: "Fernwick", product_description: "An AI agent that drafts documents", problem_solved: "Drafting takes too long", target_company_type: "banks, insurers, utilities", your_sector: "ai_native" });
  assert.ok(!/roles for the buyers you named/.test(o), o);
});
