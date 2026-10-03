// Run 20 round 1 quality pass (impact): the causes the fresh judges of set T gave, as tests. Companies are invented (Exposurewatch,
// Northgate Software, Ledgerline, Meshline, Forecastly, Lanehop); figures are invented test inputs. No real company name is used here.
// Run: node --test tests/run20-r1b-quality.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

const { default: handler } = await import(new URL("../netlify/functions/mcp.mjs", import.meta.url));
let nextId = 1;
const call = async (name, args) => {
  const r = await handler(new Request("https://x.gtmhelix.com/mcp", { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" }, body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method: "tools/call", params: { name, arguments: args } }) }));
  const j = await r.json();
  return j.result.content.map((c) => c.text).join("\n");
};
const MERGE = /\[(?:First name|Company|Signature)\]/g;
const brackets = (t) => t.replace(MERGE, "").match(/\[[^\]]{0,80}\]/g) || [];

// ---- The sector is read from what the seller sells, brand names last --------------------------------------------------------------
const EXPOSURE = { name: "Exposurewatch", desc: "Exposurewatch, external attack surface monitoring and threat intelligence for security teams", target: "CISOs at lenders and payment companies; Fintech and lending", problem: "security teams get thousands of isolated findings and cannot tell which exposure is reachable", outcome: "fix critical exposures first", cap: "an attack graph that ranks exposures by reachable paths" };
test("sector: a security vendor sold to lenders is cybersecurity in every tool, not fintech", async () => {
  const outs = [
    await call("impact_identify_champions", { company_name: EXPOSURE.name, product_description: EXPOSURE.desc, problem_solved: EXPOSURE.problem, target_company_type: "Fintech and lending" }),
    await call("impact_pinpoint_value", { product_name: EXPOSURE.name, category: "external attack surface monitoring", target_customer: EXPOSURE.target, key_outcome: EXPOSURE.outcome, unique_capability: EXPOSURE.cap }),
    await call("impact_craft_message", { product_name: EXPOSURE.name, product_category: "external attack surface monitoring", target_customer: EXPOSURE.target, key_benefit: EXPOSURE.outcome, differentiation: EXPOSURE.cap }),
    await call("impact_full_audit", { company_name: EXPOSURE.name, product_description: EXPOSURE.desc, target_customer: EXPOSURE.target, problem_solved: EXPOSURE.problem }),
  ];
  for (const o of outs) assert.match(o, /Sector: read from your inputs as cybersecurity/);
});
test("sector: a company called Northgate Software that sells managed services is a services business, not a software subscription", async () => {
  const a = await call("impact_full_audit", { company_name: "Northgate Software", product_description: "Northgate managed services from Northgate Software, cloud migration and application support delivered by engineers", target_customer: "CIOs at large manufacturers", problem_solved: "legacy applications that need to move to the cloud" });
  assert.match(a, /Business model: services/);
  const m = await call("impact_anchor_market", { product_description: "Northgate managed services from Northgate Software, cloud migration and application support delivered by engineers", potential_segments: ["Automotive", "Industrial machinery"] });
  assert.match(m, /Business model: services/);
});

// ---- Long inputs are cut at a clause end, never inside a phrase ---------------------------------------------------------------------
test("shortening: a long capability is never cut after 'with an' or any joining word, and an audience keeps its capitals", async () => {
  const cap = "a 16 step playbook accelerated by in-house tools, a cloud modernization suite for legacy applications and data centers, upgrades with an automated migration factory, and AIOps driven managed services for contact centres";
  const t = await call("impact_pinpoint_value", { product_name: "Northgate", category: "modernization engineering services (IT services)", target_customer: "Fortune 500 companies (the about page calls it a trusted partner of Fortune 500 companies)", key_outcome: "modernization driven growth through outcome based services and a co-created charter of cost management, modernization and innovation", unique_capability: cap });
  assert.doesNotMatch(t, /\b(?:with an|and the|of the|and an|with a)\.{0,3}[.\]"]/);
  assert.match(t, /Fortune 500 companies/);
  assert.doesNotMatch(t, /fortune 500/);
  assert.doesNotMatch(t, /the about page calls it[^\n]*\n> /, "source notes stay out of the sentences");
  assert.doesNotMatch(t, /services \(IT services\)s/);
  assert.doesNotMatch(t, /Shorten this to 5 to 8 words/);
});
test("shortening: a quoted problem ends at a clause, with its cut marked", async () => {
  const problem = "legacy WAN is like a single congested highway prone to jams, slowdowns and disconnections, with enterprises juggling multiple network providers selling overpriced MPLS and leased lines and suffering clunky VPNs and slow cloud access at remote offices and branches";
  const t = await call("impact_identify_champions", { company_name: "Meshline", product_description: "Meshline managed SD-WAN and MPLS links for enterprises with many branches", problem_solved: problem });
  const line = t.split("\n").find((l) => /^- Owns the problem:/.test(l));
  assert.match(line, /"[^"]*(?:disconnections|jams|slowdowns)\.\.\."$/, line);
  assert.doesNotMatch(line, /and suffering/);
});

// ---- impact_identify_champions: roles from the team the problem names, not SaaS sales roles --------------------------------------------
test("identify_champions: a billing problem that names Finance gets finance roles, with no quota, CRO or CAC", async () => {
  const t = await call("impact_identify_champions", { company_name: "Ledgerline", product_description: "Ledgerline is a billing and invoicing platform for subscription businesses", problem_solved: "Finance spends cycles reconciling invoices because most billing systems break when pricing changes deal by deal", target_company_type: "B2B SaaS companies", price_point: "$40,000 a year (hypothetical)" });
  assert.match(t, /Finance Controller/);
  assert.match(t, /Most Likely Role\*\*: (?:the )?CFO/);
  assert.doesNotMatch(t, /quota|CRO|CAC:LTV|Sales Operations Manager|activation rate|logo churn/i);
});
test("identify_champions: an AI product for asset managers gets investment roles, and the problem is never pasted in as a role", async () => {
  const t = await call("impact_identify_champions", { company_name: "Forecastly", product_description: "Forecastly AI forecasts and confidence scores for investment teams", problem_solved: "analysing datasets larger than most teams can handle, while factor models rely on static inputs", target_company_type: "Asset managers, wealth managers, pension funds" });
  assert.match(t, /Chief Investment Officer/);
  assert.match(t, /Head of Quantitative Research/);
  for (const l of t.split("\n").filter((x) => /Most Likely Role/.test(x))) assert.ok(l.length < 200 && !/analysing datasets/.test(l), l);
  assert.doesNotMatch(t, /automated resolution rate|escalation rate/);
});
test("identify_champions: an IT telecom buyer committee separates technical from commercial reviewers", async () => {
  const t = await call("impact_identify_champions", { company_name: "Meshline", product_description: "Meshline managed SD-WAN and MPLS links for enterprises with many branches", problem_solved: "branch outages and slow repairs", target_company_type: "Banks and manufacturers with many branches" });
  assert.match(t, /Commercial and Control Reviewers/);
  assert.match(t, /Procurement compares rate cards/);
  const after = t.split("### Technical Influencer (Implementation Voice)")[1].split("\n").find((l) => /Most Likely Role/.test(l));
  assert.match(after, /CISO/);
  assert.doesNotMatch(after, /Procurement|Finance/, "the technical influencer line is the CISO, not procurement");
});

// ---- impact_map_alternatives ------------------------------------------------------------------------------------------------------------
test("map_alternatives: alternatives described in words are labelled as such, the map shows whole words, and nothing says 'Poor support'", async () => {
  const t = await call("impact_map_alternatives", { your_product: "Meshline managed SD-WAN for enterprises with many branches", category: "managed network services", competitors: ["legacy WAN built on hardware", "multiple network providers selling overpriced MPLS and leased lines", "traditional VPNs"], your_strengths: "SLA backed repair within a fixed window; one contract for all branch links" });
  assert.match(t, /Alternatives You Described \(no company names were given\)/);
  assert.doesNotMatch(t, /Poor support|\[who they serve best|Best for/);
  for (const m of t.match(/\[[A-Za-z' ]{2,16}\]/g) || []) assert.ok(!/networ\]$/.test(m), m);
  assert.doesNotMatch(t, /Spreadsheets and manual processes/, "a connectivity business has no spreadsheet status quo");
  assert.match(t, /Staying with the current provider/);
  assert.doesNotMatch(t, /ask buyers \| Lead, match or skip/);
});

// ---- impact_anchor_market: keyword ranking said plainly, no size shown as if computed ----------------------------------------------------
test("anchor_market: segments that all score the same choose nothing; the answer says why and shows no TAM or ARR", async () => {
  const t = await call("impact_anchor_market", { product_description: "Forecastly AI forecasts for investment teams", potential_segments: ["Pension funds", "Insurers", "Endowments"], average_deal_size: "$250,000" });
  assert.match(t, /No segment is chosen by the scores: 3 segments tie/);
  assert.doesNotMatch(t, /Recommended Beachhead:/);
  assert.doesNotMatch(t, /\(beachhead\)/);
  assert.match(t, /no keyword, so the middle score/);
  assert.match(t, /TAM: cannot be calculated yet/);
  assert.doesNotMatch(t, /ARR|500,000|7,500|50-500 employees|Series B/);
  assert.equal(brackets(t).length, 0, brackets(t).join(" | "));
});
test("anchor_market: a winner by keyword says it is a keyword match, naming the word, and ICP size is not invented", async () => {
  const t = await call("impact_anchor_market", { product_description: "Northgate managed services for manufacturers", potential_segments: ["Enterprise manufacturers", "Retail chains"], average_deal_size: "$400,000" });
  assert.match(t, /highest keyword match only/);
  assert.match(t, /the word "enterprise"/);
  assert.match(t, /Size: not given/);
  assert.doesNotMatch(t, /50-500|Series/);
  assert.equal(brackets(t).length, 0, brackets(t).join(" | "));
});

// ---- impact_craft_message, translate, audit -----------------------------------------------------------------------------------------------
test("craft_message: no 'Join [number]', no half sentences, a possessive name keeps its capital, a plural category reads 'provider of'", async () => {
  const t = await call("impact_craft_message", { product_name: "Meshline", target_customer: "enterprises, in particular multi location enterprises, with the page claiming over 1 million businesses as customers", customer_need: "legacy WAN is like a single congested highway prone to jams, slowdowns and disconnections, with enterprises juggling multiple network providers", product_category: "connectivity and digital services (managed network)", key_benefit: "expand to new locations in half the time with smart, flexible and secure networks", competitor: "legacy WAN built on hardware", differentiation: "India's most extensive network infrastructure combined with digital capabilities, offering end to end solutions" });
  assert.doesNotMatch(t, /Join \[number\]/);
  assert.match(t, /India's most extensive/);
  assert.doesNotMatch(t, /india's/);
  assert.match(t, /provider of connectivity and digital services/);
  assert.doesNotMatch(t, /struggle with legacy WAN is like/);
  assert.doesNotMatch(t.split("## Positioning Statement")[1], /page claiming/);
  assert.doesNotMatch(t, /shorten this to/i);
});
test("translate_execution: telecom and IT services get no free trial, and every section is a draft with only mail-merge fields in brackets", async () => {
  for (const [stmt, target, benefit, name] of [
    ["For enterprises with many branches who struggle with branch outages, Meshline is the managed SD-WAN provider that runs fallback links for every branch. Alternatives buyers use today: legacy WAN built on hardware. What sets it apart: one contract for all branch links.", "enterprises with many branches", "expand to new locations in half the time", "Meshline"],
    ["For Fortune 500 companies who struggle with legacy applications, Northgate is the modernization services partner that runs the migration. Alternatives buyers use today: running cloud in house. What sets it apart: a staged transition plan.", "Fortune 500 companies", "modernization driven growth through outcome based services", "Northgate"]]) {
    const t = await call("impact_translate_execution", { positioning_statement: stmt, target_customer: target, key_benefit: benefit, product_name: name });
    assert.doesNotMatch(t, /Start Free Trial|free trial|\bCAC\b/i);
    assert.equal(brackets(t.replace(/- \[ \][^\n]*/g, "")).length, 0, brackets(t.replace(/- \[ \][^\n]*/g, "")).join(" | "));
    assert.doesNotMatch(t, /We help companies like \[similar company\]|\[the specific pain|\[Metric 1/);
    assert.match(t, /Unlike (?:legacy WAN built on hardware|running cloud in house)/, "the alternative from the statement is used");
    assert.match(t, /What sets it apart|one contract for all branch links|a staged transition plan/);
  }
});
test("full_audit: the draft statement has no 'is a solution', no doubled words, at least two tagline options, and the score is unchanged", async () => {
  const inputs = { company_name: "Lanehop", product_description: "Lanehop last-mile delivery routing and dispatch software for third-party logistics companies", target_customer: "heads of last-mile operations at third-party logistics companies with their own fleets", problem_solved: "failed first-attempt deliveries and a rising cost per delivery", key_differentiation: "re-plans every route in under a minute when an order or a road changes, with live driver updates", competitors: ["Competitor A (a global route-planning suite)", "spreadsheets and in-house dispatch"], current_positioning: "last-mile routing software that dispatchers trust", customer_feedback: "18% lower cost per delivery at Example Logistics Co (hypothetical)" };
  const t = await call("impact_full_audit", inputs);
  assert.doesNotMatch(t, /is a solution|\bThe the\b|\bis: "/i);
  const taglines = t.split("### Tagline Options")[1].split("---")[0].split("\n").filter((l) => /^\d+\. /.test(l));
  assert.ok(taglines.length >= 2, taglines.join(" | "));
  assert.match(t, /Input completeness score: \d+\/100/);
  assert.equal(brackets(t.replace(/- \[ \][^\n]*/g, "")).length, 0, brackets(t.replace(/- \[ \][^\n]*/g, "")).join(" | "));
});

// ---- impact_get_framework -------------------------------------------------------------------------------------------------------------
test("get_framework: with a sector the channel table follows how that business sells; without one it stays neutral", async () => {
  const telecom = await call("impact_get_framework", { focus_phase: "translate", sector: "telecom" });
  assert.match(telecom, /Request a site survey/);
  assert.doesNotMatch(telecom, /Trial|Start Free/);
  const its = await call("impact_get_framework", { focus_phase: "translate", sector: "IT services" });
  assert.match(its, /Request a scoping call/);
  assert.doesNotMatch(its, /Trial/);
  const none = await call("impact_get_framework", { focus_phase: "all" });
  assert.doesNotMatch(none, /Trial|Start Free|VP Sales|Mid-size logistics|Enterprise banks|Small retail chains/);
  const idn = await call("impact_get_framework", { focus_phase: "identify", sector: "fintech" });
  assert.match(idn, /Finance Controller/);
  assert.doesNotMatch(idn, /\[Role that/);
});

// ---- AI words do not make a security, testing or routing product an AI native product -------------------------------------------------------
test("sector: 'AI-native' in front of a security platform, or 'AI agents' in a testing platform, does not change the sector; an AI forecasting product stays AI native", async () => {
  const sec = await call("impact_pinpoint_value", { product_name: "Cloudmoat", category: "AI-native cloud workload protection platform (CNAPP)", target_customer: "security teams", key_outcome: "fix critical exposures first", unique_capability: "vulnerability and posture management with an AI analyst" });
  assert.match(sec, /Sector: read from your inputs as cybersecurity/);
  const qa = await call("impact_anchor_market", { product_description: "Testbench, cloud platform for testing websites and mobile apps on real browsers and real devices, with test automation, visual testing and AI agents", potential_segments: ["Enterprise engineering teams"] });
  assert.match(qa, /Sector: read from your inputs as software/);
  const ai = await call("impact_anchor_market", { product_description: "Forecastly AI forecasts and confidence scores for investment teams", potential_segments: ["Pension funds"] });
  assert.match(ai, /Sector: read from your inputs as AI native/);
});
