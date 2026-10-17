// Run 42B: sub industry notes only when the seller's own words name that sub industry (one gate, subIndustryFor in src/index.ts).
// your_sector fixes the sector, never the sub industry; a description without sub industry words gets only the sector's general lines in every tool.
import test from "node:test";
import assert from "node:assert/strict";
import { call } from "./run22-impact-common.mjs";
import { SUBTYPES, VERTICALS } from "../dist/verticals.js";
import { subIndustryFor } from "../dist/index.js";

const SECTORS = { logistics_tech: "logistics-tech", fintech: "fintech", saas: "saas", vertical_saas: "vertical-saas", ai_native: "ai-native", ites: "ites", telecom: "telecom", software: "software", cybersecurity: "cybersecurity" };
const lines = (st) => [st.notes.committee, st.notes.proofShape, st.notes.salesMotion, ...(st.notes.objections || []).flatMap((o) => [o.objection, o.response]), ...(st.notes.vocabulary || []), ...(st.notes.buyerRoles || [])].filter((x) => typeof x === "string" && x.length > 3);

const D = "a product that helps teams at mid-size companies get their daily work done faster";
const ARGS = (s) => ({
  impact_identify_champions: { company_name: "Acme Probe", product_description: `Acme Probe: ${D}`, problem_solved: "work is slow and scattered", target_company_type: "mid-size companies", price_point: "$20,000 ACV (hypothetical)", your_sector: s },
  impact_map_alternatives: { your_product: `Acme Probe: ${D}`, category: D, competitors: ["doing it by hand"], competitor_weaknesses: "slow and scattered", your_strengths: "simple to start", your_sector: s },
  impact_pinpoint_value: { product_name: "Acme Probe", category: D, target_customer: "mid-size companies", key_outcome: "faster daily work (hypothetical)", unique_capability: "one place for the work", your_sector: s },
  impact_anchor_market: { product_description: `Acme Probe: ${D}`, potential_segments: ["mid-size companies", "growing teams"], average_deal_size: "$20,000 (hypothetical)", sales_cycle: "60 days (hypothetical)", your_sector: s },
  impact_craft_message: { product_name: "Acme Probe", target_customer: "mid-size companies", customer_need: "work is slow and scattered", product_category: D, key_benefit: "faster daily work (hypothetical)", differentiation: "simple to start", your_sector: s },
  impact_translate_execution: { positioning_statement: `For mid-size companies who struggle with slow work, Acme Probe is ${D}. Unlike doing it by hand, it is simple to start.`, target_customer: "mid-size companies", key_benefit: "faster daily work (hypothetical)", product_name: "Acme Probe", your_sector: s },
  impact_full_audit: { company_name: "Acme Probe", product_description: `Acme Probe: ${D}`, target_customer: "mid-size companies", problem_solved: "work is slow and scattered", key_differentiation: "simple to start", current_positioning: "work made simple", customer_feedback: "teams like it (hypothetical)", your_sector: s },
});

for (const [yours, id] of Object.entries(SECTORS)) {
  test(`${yours}: a description without sub industry words gets no sub industry lines in any tool`, async () => {
    const base = VERTICALS.find((v) => v.id === id);
    const baseText = JSON.stringify(base).toLowerCase();
    const subs = SUBTYPES.filter((st) => st.vertical === id);
    const subOnly = [...new Set(subs.flatMap(lines))].filter((l) => l.length > 20 && !baseText.includes(l.toLowerCase()));
    for (const [tool, args] of Object.entries(ARGS(yours))) {
      const o = (await call(tool, args)).toLowerCase();
      assert.ok(o.length > 200, tool);
      for (const l of subOnly) assert.ok(!o.includes(l.toLowerCase()), `${yours} / ${tool} carries a sub industry line: ${l}`);
    }
  });
}

test("subIndustryFor: the seller's words must name the sub industry; the business model never comes from a guess", async () => {
  const fs = VERTICALS.find((v) => v.id === "vertical-saas");
  const sub = { ...fs, subtype: "field-services" };
  assert.equal(subIndustryFor(sub, "total job management software designed for residential builders"), null);
  assert.equal(subIndustryFor(sub, "field service management software for technician dispatch")?.id, "field-services");
  assert.equal(subIndustryFor(fs, "field service management software"), null);
  const cons = await call("impact_pinpoint_value", { product_name: "Acme Probe", category: "total job management software designed for residential builders", target_customer: "residential builders", key_outcome: "faster bids (hypothetical)", unique_capability: "estimating", your_sector: "vertical_saas" });
  assert.ok(!/technician|first time fix|parts on the van/i.test(cons));
  const fr = await call("impact_pinpoint_value", { product_name: "Acme Probe", category: "a freight forwarder and customs broker with a platform", target_customer: "importers", key_outcome: "fewer delays (hypothetical)", unique_capability: "one view", your_sector: "logistics_tech" });
  assert.ok(!/per FTE|per ticket/i.test(fr));
});
