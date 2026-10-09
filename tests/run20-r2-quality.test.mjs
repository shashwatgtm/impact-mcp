// Run 20 round 2 (impact): the fresh judges' findings on e5ac950 as tests, written before the fixes. Companies and figures are invented
// (Billwise, Routeline, Exposurewatch, Meshline, Forecastly, Northgate, Apiforge, Ledgerline).
// Run: node --test tests/run20-r2-quality.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

const { default: handler } = await import(new URL("../netlify/functions/mcp.mjs", import.meta.url));
let nextId = 1;
const call = async (name, args) => {
  const r = await handler(new Request("https://x.gtmhelix.com/mcp", { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" }, body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method: "tools/call", params: { name, arguments: args } }) }));
  const j = await r.json();
  return j.result.content.map((c) => c.text).join("\n");
};

const WEAK = "detection delays from periodic scans, no threat validation, no financial impact quantification, and no way to tell a theoretical exposure from a live entry point";
const ALTS = ["traditional digital risk protection that is siloed and relies on static keyword based detection", "tools that report isolated alerts with no view of how they connect", "a generic dark web feed"];
const STR = "25,000+ sources monitored, 250+ takedowns supported and real time detection of credential leaks (page claims)";

// (1) map_alternatives
test("map: weaknesses the user gave are never reported as 'none supplied'; unmatched ones are listed under 'Weaknesses you gave'", async () => {
  const t = await call("impact_map_alternatives", { your_product: "Exposurewatch attack surface monitoring", category: "external attack surface monitoring", competitors: ALTS, competitor_weaknesses: WEAK, your_strengths: STR });
  assert.doesNotMatch(t, /none supplied for this competitor/);
  assert.match(t, /Weaknesses you gave/);
  for (const w of ["no threat validation", "no financial impact quantification", "detection delays from periodic scans"]) assert.ok(t.includes(w), w);
});
test("map: the strengths string is not pasted into every attack angle; the legend is not cut; no bracket in Do Nothing; a weakness is not hung on the wrong alternative", async () => {
  const t = await call("impact_map_alternatives", { your_product: "Routeline routing", category: "transport management", competitors: ["manual excel based routing that only handles a few variables", "consolidating multiple files from various transporters"], competitor_weaknesses: "legacy TMS runs on modules and platforms with manual, human judged decisions", your_strengths: "enterprise grade scalability, security and robustness, 12M+ automated decisions a day, 99.97% uptime, and integration with an existing ERP in weeks (page claims)" });
  const angles = t.split("\n").filter((l) => /Your attack angle/.test(l));
  for (const a of angles) assert.ok(!a.includes("12M+ automated decisions"), a);
  assert.doesNotMatch(t, /\[Only if true and provable: "Your competitors are already solving this"\]/);
  const cards = t.split("### Against ").slice(1);
  for (const c of cards) if (!/^Do Nothing/.test(c)) assert.doesNotMatch(c.split("###")[0], /legacy TMS runs on modules/, "the legacy TMS weakness names neither alternative");
  assert.match(t, /Weaknesses you gave/);
});
test("map: a long alternative gets a heading that ends at a clause, and its description stays whole in its own part (Run 22: the ascii map and its legend are gone)", async () => {
  const t = await call("impact_map_alternatives", { your_product: "Ledgerline spend management", category: "spend management", competitors: ["old legacy systems from companies launched in the 90s that only brought basic automation", "manual expense filing and manual bill checking", "cash advances and corporate debit or credit cards"] });
  const heading = t.split("\n").find((l) => /^### Against old legacy systems/.test(l));
  assert.ok(heading, "heading");
  assert.doesNotMatch(heading, /launched|\b(?:that|from|with|and)$/);
  assert.match(t, /old legacy systems from companies launched in the 90s that only brought basic automation/);
  assert.doesNotMatch(t, /^Alt 1 =|┌/m);
});

// (2) cut-offs
test("cut-offs: an audience that is a list sharing one noun is never cut to 'the world's leading AI'", async () => {
  const tc = "the world's leading AI, SaaS and consumer subscription businesses";
  const c = await call("impact_craft_message", { product_name: "Billwise", target_customer: tc, customer_need: "finance spends cycles reconciling invoices", product_category: "billing and monetization (recurring billing and revenue infrastructure)", key_benefit: "launch and change pricing in hours without engineering delays", differentiation: "a unified revenue infrastructure that connects pricing, usage, invoicing, payments, quoting and revenue recognition" });
  assert.doesNotMatch(c, /helps the world's leading AI launch/);
  assert.doesNotMatch(c, /Built for the world's leading AI"/);
  const t = await call("impact_translate_execution", { positioning_statement: `For ${tc}, Billwise is the billing platform that unifies pricing and invoicing.`, target_customer: tc, key_benefit: "launch and change pricing in hours without engineering delays", product_name: "Billwise" });
  assert.doesNotMatch(t, /the world's leading AI(?!,)[.\s"]/);
  const p = await call("impact_pinpoint_value", { product_name: "Billwise", category: "billing platform", target_customer: tc, key_outcome: "launch and change pricing in hours without engineering delays", unique_capability: "a unified revenue infrastructure" });
  assert.doesNotMatch(p, /Built for the world's leading AI\./);
});
test("cut-offs: the audit's alternatives are short labels that end at a phrase, in the statement and in week 1", async () => {
  const t = await call("impact_full_audit", { company_name: "Ledgerline", product_description: "Ledgerline spend management for midsize companies", target_customer: "midsize to large businesses", problem_solved: "manual expense filing and slow reimbursement", competitors: ["old legacy systems from companies launched in the 90s that only brought basic automation", "manual excel based routing that only handles a few variables", "tools that report isolated alerts with no view of how they connect"] });
  const after = t.split("## Recommended Positioning")[1];
  assert.doesNotMatch(after, /launched|only handles|in the 90s/, "the labels stop before the clause");
  assert.match(after, /old legacy systems/);
  assert.doesNotMatch(t, /you named few or none/, "three alternatives were named");
});
test("cut-offs: a benefit keeps 'and agents'; a capability list is not left mid-list", async () => {
  const diff = "one connected platform that spans define, design, develop, test, deploy, observe and distribute, for humans and agents, replacing disconnected tools and multiple sources of truth";
  const t = await call("impact_craft_message", { product_name: "Apiforge", target_customer: "API teams and developers", key_benefit: "high productivity for developers, great quality for APIs and airtight governance for organizations, from one platform for building and using APIs", differentiation: diff, product_category: "API platform" });
  assert.match(t, /humans and agents/);
  assert.match(t, /building and using APIs/);
  const cap = "continuous monitoring of the deep and dark web, brand risk, data leaks, external attack surface, supply chain and AI attack surface, an attack graph, and agents that validate paths, with takedowns and 50+ integrations";
  const p = await call("impact_pinpoint_value", { product_name: "Exposurewatch", category: "attack surface monitoring", target_customer: "security teams", key_outcome: "fix critical exposures first", unique_capability: cap });
  assert.doesNotMatch(p, /supply chain\.\s/);
  assert.match(p, /(?:and more|attack graph)/);
});

// (3) a count in the inputs is used
test("craft: a customer count in the inputs is used in the social-proof line, and the line does not say none was supplied", async () => {
  const t = await call("impact_craft_message", { product_name: "Exposurewatch", target_customer: "security teams at global enterprises; more than 1,000 security teams use Exposurewatch products (page claim)", key_benefit: "predict and disrupt attack paths", differentiation: "an attack graph that ranks exposures", product_category: "attack surface monitoring" });
  assert.doesNotMatch(t, /No customer count or named result was supplied/);
  assert.match(t, /Variation D[\s\S]*more than 1,000 security teams use Exposurewatch products/);
});

// (4) acronym casing
test("translate: an acronym at the start of the proof line keeps its capitals (SLA, not sLA)", async () => {
  const t = await call("impact_translate_execution", { positioning_statement: "For CIOs at Fortune 500 companies who need a service desk, Northgate is the services partner that runs it. Unlike running the desk in house, it offers a staged transition plan.", target_customer: "CIOs at Fortune 500 companies", key_benefit: "run the service desk with managed services", product_name: "Northgate", business_model: "services" });
  assert.doesNotMatch(t, /\bsLA\b|\bsla and cost/);
  assert.match(t, /SLA and cost outcomes/);
});

// (5) pinpoint matrix is filled from the outcome and the measures
test("pinpoint: the value matrix starts from the user's outcome and shows what the inputs say for each measure", async () => {
  const t = await call("impact_pinpoint_value", { product_name: "Routeline", category: "last-mile delivery software", target_customer: "heads of last-mile operations at logistics companies", key_outcome: "cut cost per delivery by 18% in 90 days (hypothetical)", unique_capability: "re-plans routes in under a minute", customer_metrics: "18% lower cost per delivery at a pilot hub (hypothetical); first-attempt delivery up from 80% to 90% (hypothetical)" });
  const m = t.split("## Value Quantification Matrix")[1].split("\n---\n")[0];
  assert.match(m, /What your inputs say/);
  assert.match(m, /cost per delivery[^\n]*18%/);
  assert.match(m, /first-attempt delivery[^\n]*80% to 90%/);
  assert.match(m, /Your stated outcome/);
});

// (6) anchor: the answer says what would break the tie
test("anchor: a keyword winner or a tie says which inputs would break it and asks for them", async () => {
  const tie = await call("impact_anchor_market", { product_description: "Routeline last-mile delivery software", potential_segments: ["Retail", "FMCG", "3PL"], average_deal_size: "$60,000" });
  assert.match(tie, /What would break the tie/);
  assert.match(tie, /your own customers/i);
  assert.match(tie, /strongest pain/i);
  const kw = await call("impact_anchor_market", { product_description: "Northgate managed services", potential_segments: ["Telecom, media and technology", "BFSI"], average_deal_size: "$400,000" });
  assert.match(kw, /Before you trust this ranking/);
  assert.match(kw, /your own customers/i);
});

// (7) a billing platform sold to finance gets finance questions, not product-led SaaS ones
test("SaaS billing for finance buyers: no activation-rate or time-to-value questions in translate, pinpoint, map or audit", async () => {
  const need = "Finance spends cycles reconciling invoices because billing systems break when pricing changes deal by deal";
  const outs = [
    await call("impact_translate_execution", { positioning_statement: "For finance leaders at subscription businesses who struggle with reconciling invoices, Billwise is the billing platform that unifies pricing and invoicing. Unlike legacy billing systems, it offers one revenue infrastructure.", target_customer: "CFOs and finance leaders at subscription businesses", key_benefit: "close the books faster and stop billing errors", product_name: "Billwise" }),
    await call("impact_pinpoint_value", { product_name: "Billwise", category: "billing and invoicing platform", target_customer: "CFOs at subscription businesses", key_outcome: "close the books faster and stop billing errors", unique_capability: "usage, invoicing and revenue recognition in one place" }),
    await call("impact_map_alternatives", { your_product: "Billwise billing and invoicing platform for subscription businesses", category: "billing and invoicing", competitors: ["legacy billing systems"], competitor_weaknesses: need }),
    await call("impact_full_audit", { company_name: "Billwise", product_description: "Billwise billing and invoicing platform for subscription businesses", target_customer: "CFOs at subscription businesses", problem_solved: need }),
  ];
  for (const o of outs) { assert.doesNotMatch(o, /activation rate|time to value|before they get value|logo churn|net revenue retention/i); assert.match(o, /close|reconcil|billing errors|invoice/i); }
});

// (8) the national operator objection
test("telecom objection is worded as what the buyer says (shared sector file)", async () => {
  const t = await call("impact_identify_champions", { company_name: "Meshline", product_description: "Meshline managed SD-WAN and MPLS links for enterprises with many branches", problem_solved: "branch outages and slow repairs" });
  assert.doesNotMatch(t, /higher than the national operator/);
  assert.match(t, /Price per site compared with the operator we use today/);
});

// (9) company claims are not customer results
test("audit: a company-wide claim ($8B+ deployed, 1,000+ teams use) is shown as a company claim, not as the result customers describe", async () => {
  const t = await call("impact_full_audit", { company_name: "Forecastly", product_description: "Forecastly AI forecasts for investment teams", target_customer: "Asset managers", problem_solved: "analysing more data than teams can handle", customer_feedback: "$8B+ deployed (page claim); more than 1,000 teams use Forecastly (page claim)" });
  assert.doesNotMatch(t, /delivers the result your customers describe: "\$8B/);
  assert.match(t, /Company claims/);
  assert.match(t, /not a customer result/);
});

// (T4) A seller that manages money (invented: Quantforge) gets investment roles and measures in every tool, never the support-automation text.
test("investment seller: Quantforge gets investment roles and measures and no support-automation words in any tool", async () => {
  const desc = "Quantforge, systematic investment strategies powered by adaptive AI: AI enhanced indexes and custom portfolios built with institutions";
  const tc = "Asset allocators (pensions, insurers, endowments), investment banks, wealth managers, asset managers";
  const outs = [
    await call("impact_identify_champions", { company_name: "Quantforge", product_description: desc, problem_solved: "finding the best investment opportunities means analyzing datasets larger than most can handle", target_company_type: tc }),
    await call("impact_map_alternatives", { your_product: desc, category: "systematic investment strategies", competitors: ["static factor models", "black box signals"] }),
    await call("impact_pinpoint_value", { product_name: "Quantforge", category: "systematic investment strategies", target_customer: tc, key_outcome: "a more informed basis for investment decisions", unique_capability: "adaptive models that retrain when the error rate is high" }),
    await call("impact_anchor_market", { product_description: desc, potential_segments: ["Pension funds", "Insurers"] }),
    await call("impact_craft_message", { product_name: "Quantforge", target_customer: tc, key_benefit: "a more informed basis for investment decisions", differentiation: "adaptive models with explainability", product_category: "systematic investment strategies" }),
    await call("impact_translate_execution", { positioning_statement: `For ${tc}, Quantforge is the systematic strategy provider that explains its signals.`, target_customer: tc, key_benefit: "a more informed basis for investment decisions", product_name: "Quantforge" }),
    await call("impact_full_audit", { company_name: "Quantforge", product_description: desc, target_customer: tc, problem_solved: "analyzing datasets larger than most can handle" }),
  ];
  for (const o of outs) {
    assert.doesNotMatch(o, /resolution rate|handling time|escalation rate|evaluation set|cost per resolved|help desk|support ticket/i);
    assert.match(o, /investment management|Chief Investment Officer|Portfolio Manager|Investment Committee|investment consultant/i);
  }
});
