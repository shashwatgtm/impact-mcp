// Run 20 round 3 (impact): findings of the fresh judges on 175b0a1, as tests written before the fixes. Companies and figures are invented
// (Meshline, Apiforge, Billwise, Northgate, Ledgerline, Routeline, Quantforge, Exposurewatch).
// Run: node --test tests/run20-r3-quality.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

const { default: handler } = await import(new URL("../netlify/functions/mcp.mjs", import.meta.url));
let nextId = 1;
const call = async (name, args) => {
  const r = await handler(new Request("https://x.gtmhelix.com/mcp", { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" }, body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method: "tools/call", params: { name, arguments: args } }) }));
  const j = await r.json();
  return j.result.content.map((c) => c.text).join("\n");
};
const API = { desc: "Apiforge, an API platform (API lifecycle management)", need: "enterprises run the API lifecycle as disconnected projects, so specs, collections and docs drift apart, governance sits outside the workflow, and API discovery happens in a Slack thread", benefit: "high productivity for developers, great quality for APIs and airtight governance for organizations, from one platform for building and using APIs", diff: "one connected platform that spans define, design, develop, test, deploy, observe and distribute, for humans and agents, replacing disconnected tools and multiple sources of truth", tc: "API teams and developers at 500,000 companies, including 98% of the Fortune 500 (page claim)" };

// (1) pinpoint matrix matches by meaning
test("pinpoint: a supplied uptime, cycle time or cost result is shown against the measure it answers", async () => {
  const t = await call("impact_pinpoint_value", { product_name: "Meshline", category: "managed SD-WAN", target_customer: "CIOs at banks", key_outcome: "expand to new locations in half the time", unique_capability: "fallback links on every branch", customer_metrics: "A bank achieved 99.5% uptime across 2000+ branches (hypothetical)" });
  assert.match(t, /\| uptime per site \| A bank achieved 99\.5% uptime/);
  const f = await call("impact_pinpoint_value", { product_name: "Ledgerline", category: "spend management", target_customer: "CFOs at midsize companies", key_outcome: "cut the approval cycle from 10 days to 3 to 5 days (hypothetical)", unique_capability: "automatic expense capture", customer_metrics: "98% policy compliance (hypothetical)" });
  assert.match(f, /\| approval cycle time \|[^|]*3 to 5 days/);
  assert.match(f, /\| policy breach rate \|[^|]*98% policy compliance/);
  const s = await call("impact_pinpoint_value", { product_name: "Northgate", category: "IT services: modernization engineering and managed services", target_customer: "CIOs", key_outcome: "modernize legacy applications", unique_capability: "a staged migration playbook", customer_metrics: "A materials company saved over $20 million in cost and automated 70% of processes (hypothetical)" });
  assert.match(s, /\| cost of running the legacy estate \|[^|]*\$20 million/);
});

// (2) map
test("map: a weakness sentence is not chopped into fragments or hung on the wrong alternative", async () => {
  const t = await call("impact_map_alternatives", { your_product: "Meshline managed SD-WAN", category: "managed network services", competitors: ["legacy WAN built on hardware", "multiple network providers selling overpriced MPLS and leased lines", "traditional VPNs"], competitor_weaknesses: "a single congested highway prone to jams, slowdowns and frustrating disconnections, with sluggish cloud apps and network lag at remote offices", your_strengths: "SLA backed repair within a fixed window, one contract for all branch links, 24x7 expert support" });
  assert.match(t, /a single congested highway prone to jams, slowdowns and frustrating disconnections, with sluggish cloud apps and network lag at remote offices/);
  const cards = t.split("### Against ").slice(1);
  for (const c of cards) assert.doesNotMatch(c.split("\n###")[0], /sluggish cloud apps/, "no card owns the group weakness");
});
test("map: the status quo follows the seller (investment, developer platform), not spreadsheets and junior staff", async () => {
  const inv = await call("impact_map_alternatives", { your_product: "Quantforge, systematic investment strategies powered by adaptive AI: AI enhanced indexes and custom portfolios built with institutions", category: "systematic investment strategies", competitors: ["static factor models", "black box signals"] });
  assert.doesNotMatch(inv, /Junior staff|Spreadsheets and manual/);
  assert.match(inv, /incumbent manager|in-house quant/i);
  const api = await call("impact_map_alternatives", { your_product: API.desc, category: "API platform", competitors: ["disconnected tools for design, build, test and release", "a Slack thread for API discovery"] });
  assert.doesNotMatch(api, /Junior staff|Spreadsheets and manual/);
  assert.match(api, /tools already in place|disconnected tools/i);
});
test("map: each card has its own content, and a described alternative is not asked 'would you choose X over us'", async () => {
  const t = await call("impact_map_alternatives", { your_product: "Meshline managed SD-WAN", category: "managed network services", competitors: ["legacy WAN built on hardware", "multiple network providers selling overpriced MPLS and leased lines", "traditional VPNs"], your_strengths: "SLA backed repair within a fixed window, one contract for all branch links, 24x7 expert support" });
  const leads = t.split("\n").filter((l) => /^- Where you can lead:/.test(l));
  assert.equal(leads.length, 3);
  assert.equal(new Set(leads).size, 3, "three different lines");
  assert.doesNotMatch(t, /choose legacy WAN built on hardware over us|choose traditional VPNs over us/);
});

// (3) the function comes from the problem text
test("identify: an API governance problem gets an API owner and API questions; a modernization problem is not a service desk", async () => {
  const a = await call("impact_identify_champions", { company_name: "Apiforge", product_description: API.desc, problem_solved: API.need });
  assert.match(a, /API/);
  assert.match(a, /Head of API|API program|API platform owner/i);
  assert.doesNotMatch(a, /How are tests written and maintained|release frequency, lead time/);
  const m = await call("impact_identify_champions", { company_name: "Northgate", product_description: "Northgate managed services, cloud modernization and application support delivered by engineers", problem_solved: "legacy applications and data centers need to move to cloud native platforms while costs stay under control" });
  assert.match(m, /moderni[sz]ation|cloud transformation/i);
  assert.doesNotMatch(m, /first-contact resolution|backlog age|cost per ticket/);
});

// (4) cut-offs and headline
test("cut-offs: 'for humans and agents' stays whole in craft, translate and audit, and the headline does not repeat the audience", async () => {
  const c = await call("impact_craft_message", { product_name: "Apiforge", target_customer: API.tc, customer_need: API.need, product_category: "API platform", key_benefit: API.benefit, competitor: "disconnected tools", differentiation: API.diff });
  assert.match(c, /for humans and agents/);
  const t = await call("impact_translate_execution", { positioning_statement: `For ${API.tc}, Apiforge is the API platform that unifies the lifecycle. Alternatives buyers use today: disconnected tools. What sets it apart: ${API.diff}.`, target_customer: API.tc, key_benefit: API.benefit, product_name: "Apiforge" });
  assert.match(t, /for humans and agents/);
  assert.doesNotMatch(t, /High productivity for developers for API teams and developers/i);
  const a = await call("impact_full_audit", { company_name: "Apiforge", product_description: API.desc, target_customer: API.tc, problem_solved: API.need, key_differentiation: API.diff });
  assert.match(a, /for humans and agents/);
});

// (5) the opening follows the user's benefit
test("translate: the opening hook follows the user's benefit, not the sector's first measure", async () => {
  const stmt = "For finance leaders at subscription businesses who struggle with changing prices, Billwise is the billing platform that unifies pricing and invoicing. Unlike legacy billing systems, it offers one revenue infrastructure.";
  const t = await call("impact_translate_execution", { positioning_statement: stmt, target_customer: "finance leaders at subscription businesses", key_benefit: "launch and change pricing in hours without engineering delays", product_name: "Billwise" });
  const subject = t.split("\n").find((l) => /^\*\*Subject\*\*/.test(l));
  assert.match(subject, /pricing/i);
  assert.doesNotMatch(subject, /close the books/i);
});
test("craft: a result and a recognition in the inputs are used in the social-proof line", async () => {
  const t = await call("impact_craft_message", { product_name: "Billwise", target_customer: "subscription businesses", key_benefit: "launch and change pricing in hours; customers say they reduced unpaid invoices by at least 80% (customer words)", differentiation: "a unified revenue infrastructure, named a Leader in the 2026 Gartner Magic Quadrant for Recurring Billing Applications", product_category: "billing platform" });
  const d = t.split("**Variation D: lead with social proof**")[1].split("###")[0];
  assert.match(d, /unpaid invoices by at least 80%/);
  assert.match(d, /Gartner/);
  assert.doesNotMatch(d, /No customer count or named result was supplied/);
});
test("translate: an in-house alternative is not asked 'what went wrong with the current provider'; a long benefit is not pasted whole again and again", async () => {
  const benefit = "modernization driven hyper growth through outcome based services and a co-created charter of cost management, modernization and innovation";
  const t = await call("impact_translate_execution", { positioning_statement: "For Fortune 500 companies who struggle with legacy applications, Northgate is the services partner that runs the migration. Alternatives buyers use today: running cloud infrastructure in house. What sets it apart: a staged transition plan.", target_customer: "Fortune 500 companies", key_benefit: benefit, product_name: "Northgate", business_model: "services" });
  assert.doesNotMatch(t, /What went wrong with the current provider/);
  const c = await call("impact_craft_message", { product_name: "Northgate", target_customer: "Fortune 500 companies", key_benefit: benefit, differentiation: "a staged transition plan", product_category: "modernization services", business_model: "services" });
  assert.ok(c.split("co-created charter").length - 1 <= 4, `benefit pasted ${c.split("co-created charter").length - 1} times`);
});
test("translate: a hero never says only the company and the audience when the benefit is a list", async () => {
  const t = await call("impact_translate_execution", { positioning_statement: "For midsize to large businesses who need control of spend, Ledgerline is the spend platform. Unlike manual filing, it offers automatic capture.", target_customer: "midsize to large businesses", key_benefit: "fast, transparent, compliant and error free travel and expense management", product_name: "Ledgerline" });
  const hero = t.split("**Headline (5-8 words)**:")[1].split("\n")[1];
  assert.doesNotMatch(hero, /^> "Ledgerline for /);
  assert.match(hero, /transparent|error free|expense management/);
});

// (6) audit labelling and (7) gated claims
test("audit: recognition is filed under company claims; the Unlike line has no duplicate fragments; a 'first' tagline is gated", async () => {
  const t = await call("impact_full_audit", { company_name: "Routeline", product_description: "Routeline, an agentic transportation management system (TMS)", target_customer: "logistics companies", problem_solved: "slow dispatch planning", key_differentiation: "the world's first agentic TMS where humans govern and agents act", competitors: ["legacy enterprise billing systems", "billing systems", "finance teams manually reconciling self-serve and enterprise customers"], customer_feedback: "Market recognition from Gartner for 7 consecutive years (home page); Best Expense Management Solution (CIO Choice 2019, 2020 and 2023); Siam-like retailer cuts dispatch planning time by 66% (case study title)" });
  const claims = t.split("Company claims")[1].split("Customer feedback you supplied")[0];
  assert.match(claims, /Gartner/);
  assert.match(claims, /Best Expense Management/);
  const unlike = t.split("\n").find((l) => /^> \*\*Unlike\*\*/.test(l));
  assert.doesNotMatch(unlike, /billing systems, billing systems|systems or billing systems|, billing systems or/);
  const tag = t.split("### Tagline Options")[1].split("---")[0];
  for (const l of tag.split("\n").filter((x) => /world's first/i.test(x))) assert.match(l, /Only if true and provable/);
});
test("craft: 'first and only' in the differentiation is gated in the main statement", async () => {
  const t = await call("impact_craft_message", { product_name: "Ledgerline", target_customer: "midsize companies", key_benefit: "control spend", differentiation: "the first and only integrated travel, expense and payment platform", product_category: "spend management" });
  const stmt = t.split("### Complete Positioning Statement")[1].split("### One-Paragraph")[0];
  assert.match(stmt, /Only if true and provable: [^\n]*first and only/);
});

// anchor: how to decide
test("anchor: a how-to-decide section comes first; with current_customers a second view is shown; without, the answer asks", async () => {
  const base = { product_description: "Routeline last-mile delivery software", potential_segments: ["Retail", "FMCG", "3PL"], average_deal_size: "$60,000", sales_cycle: "90 days" };
  const without = await call("impact_anchor_market", base);
  assert.ok(without.indexOf("## How to decide, from your own inputs") < without.indexOf("## Segment Scoring Matrix"));
  assert.match(without, /Add current_customers/);
  const withc = await call("impact_anchor_market", { ...base, current_customers: "Two FMCG brands and a regional retailer" });
  const second = withc.split("## How to decide, from your own inputs")[1].split("## Segment Scoring Matrix")[0];
  assert.match(second, /Second view/);
  assert.match(second, /FMCG/);
  assert.match(second, /\$60,000/);
  assert.match(second, /90 days/);
  const sc = (x) => x.slice(x.indexOf("## Segment Scoring Matrix"));
  assert.equal(sc(withc), sc(await call("impact_anchor_market", { ...base, current_customers: "Forty bank networks" })), "the scores and everything below them do not change with current_customers");
});
test("anchor: a billing platform sold to finance gets the finance view, not product-led SaaS text", async () => {
  const t = await call("impact_anchor_market", { product_description: "Billwise billing and invoicing platform for subscription businesses with revenue recognition", potential_segments: ["B2B SaaS and software", "Gen AI"], average_deal_size: "$60,000" });
  assert.doesNotMatch(t, /trials and self-serve where buyers expect them/);
  assert.match(t, /CFO/);
});

// Shared billing profile (Revenue run20 fa12ec8): a billing seller reads SaaS, billing and revenue operations in every tool, with finance roles and measures.
test("billing seller: all tools read the billing profile (finance roles and measures, no product-led SaaS measures)", async () => {
  const desc = "Billwise billing and invoicing platform for subscription businesses, with usage-based billing and revenue recognition";
  const outs = [
    await call("impact_identify_champions", { company_name: "Billwise", product_description: desc, problem_solved: "invoices break when pricing changes deal by deal" }),
    await call("impact_map_alternatives", { your_product: desc, category: "billing and invoicing", competitors: ["a homegrown billing script"] }),
    await call("impact_pinpoint_value", { product_name: "Billwise", category: "billing and invoicing platform", target_customer: "CFOs at subscription businesses", key_outcome: "launch pricing changes without engineering time", unique_capability: "usage-based billing and invoicing in one place" }),
    await call("impact_anchor_market", { product_description: desc, potential_segments: ["B2B SaaS and software", "Gen AI"], average_deal_size: "$60,000" }),
    await call("impact_craft_message", { product_name: "Billwise", target_customer: "CFOs at subscription businesses", key_benefit: "launch pricing changes without engineering time", differentiation: "usage-based billing and invoicing in one place", product_category: "billing platform" }),
    await call("impact_translate_execution", { positioning_statement: "For CFOs at subscription businesses, Billwise is the billing platform that launches pricing changes without engineering time. Unlike a homegrown script, it offers usage-based billing.", target_customer: "CFOs at subscription businesses", key_benefit: "launch pricing changes without engineering time", product_name: "Billwise" }),
    await call("impact_full_audit", { company_name: "Billwise", product_description: desc, target_customer: "CFOs at subscription businesses", problem_solved: "invoices break when pricing changes deal by deal" }),
  ];
  for (const o of outs) {
    assert.match(o, /billing and revenue operations/);
    assert.doesNotMatch(o, /activation rate|time to value|logo churn|trials and self-serve where buyers expect/i);
    assert.match(o, /billing errors|invoice accuracy|Chief Financial Officer|CFO/);
  }
});
