// Run 19 R19-35 (owner decision D80): the 8 problems of the real-world test, fixed in every IMPACT tool.
// Written before the fixes (B43); the tests here failed on the starting head dc2a1620 (version 2.2.18).
// Companies are the invented ones of the run 19 examples (Shelfwalk, Answerloop, Cloudmoat, Spendrill, Lanehop, Branchwire,
// Example Logistics Co, Example Manufacturing Co, Example IT Services Co, Example Food Delivery Co). Real companies are tested only
// in the private project repo (rule B81). Every figure below is an invented test input.
// D72: impact_full_audit keeps every score and grade; a unit test below re-implements the old rules and compares.
// Run: node --test tests/run19-d80.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const { default: handler } = await import(new URL("../netlify/functions/mcp.mjs", import.meta.url));
let nextId = 1;
const rpc = async (method, params) => {
  const r = await handler(new Request("https://x.gtmhelix.com/mcp", {
    method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method, params }),
  }));
  return r.json();
};
const call = async (name, args) => {
  const j = await rpc("tools/call", { name, arguments: args });
  return { isError: !!j.result.isError, text: j.result.content.map((c) => c.text).join("\n") };
};
const B75 = /\b(clinics?|patients?|hospitals?|healthcare|hipaa|ehr|appointments?|no-shows?|dental|physio\w*|ExampleCo|Example Co|Acme Notes|Clausewise|ClinicFlow|legal tech)\b/gi;
const PROMISES = /guaranteed|price protection|no long-term commitment/i;
const SAAS_ONLY = /\b(MRR|free trial|freemium|self-serve sign-?up|per seat|seats?|aha moment)\b/i;
const TEMPLATE = /\[Your (?!name\])|\[Insert|\{\{|\bundefined\b|\bNaN\b|XX%/;

// ---- The invented companies (examples-new.json), one scenario per vertical of work/market.json -----------------------------
// saas and software are probes: they use invented names from the list with a description that names the sector.
const SC = [
  { id: "logistics-tech", name: "Lanehop", saas: true, desc: "last-mile delivery routing and dispatch software for third-party logistics companies", category: "last-mile delivery software",
    target: "heads of last-mile operations at third-party logistics companies", problem: "failed first-attempt deliveries and a rising cost per delivery",
    outcome: "cut cost per delivery by 18% in 90 days", capability: "re-plans every route in under a minute when an order or a road changes",
    differentiation: "live re-routing that dispatchers trust", competitors: ["Competitor A (a global route-planning suite)", "Competitor B (a regional dispatch app)", "spreadsheets and in-house dispatch"],
    weak: "Competitor A needs months of setup; Competitor B has no live re-routing", strengths: "live re-routing; address cleaning for unstructured addresses; offline driver app",
    metrics: "18% lower cost per delivery at Example Logistics Co; live in 6 weeks", price: "$36,000 a year", customer: "Example Logistics Co", segments: ["Third-party logistics providers", "E-commerce brands with own fleets"],
    vocab: ["dispatch", "fleet", "last-mile", "route plan", "first-attempt", "proof of delivery", "3pl", "cost per delivery", "delivery sla", "tms", "warehouse", "driver"] },
  { id: "fintech", name: "Spendrill", saas: true, desc: "spend management software with corporate cards, expense claims and automatic reconciliation for mid-size companies", category: "spend management",
    target: "finance controllers at mid-size companies with 300 to 3,000 employees", problem: "a slow month-end close because expense claims are reconciled by hand",
    outcome: "close the books 5 days faster each month", capability: "matches every card spend and claim to the ERP ledger automatically",
    differentiation: "reconciliation that posts straight into the ledger", competitors: ["Competitor A (a card-led spend platform)", "Competitor B (an expense module inside the ERP)", "manual reimbursement on spreadsheets"],
    weak: "Competitor A is weak on ERP posting; Competitor B is rigid and disliked by employees", strengths: "ERP posting; policy checks before payment; GST-ready receipts",
    metrics: "month-end close cut from 12 days to 7 at Example Manufacturing Co; policy breaches down 40%", price: "$24,000 a year", customer: "Example Manufacturing Co", segments: ["Mid-size manufacturers", "IT services firms"],
    vocab: ["reconciliation", "month-end", "ledger", "erp", "audit trail", "accounts payable", "approval", "compliance", "controller", "cfo", "policy"] },
  { id: "saas", name: "Spendrill", saas: true, desc: "subscription SaaS product analytics for B2B software teams", category: "product analytics",
    target: "product and growth leaders at B2B SaaS companies", problem: "teams cannot tell which features lead accounts to renew",
    outcome: "lift activation by 20% in a quarter", capability: "links product events to account revenue", differentiation: "an account-level revenue view of feature usage",
    competitors: ["Competitor A (a general analytics tool)", "in-house dashboards"], weak: "Competitor A shows clicks but not account revenue", strengths: "account-level revenue view; two-day setup",
    metrics: "activation up 20% at Example Manufacturing Co", price: "$12,000 a year", customer: "Example Manufacturing Co", segments: ["Series A to C B2B SaaS", "Vertical SaaS"],
    vocab: ["activation", "time to value", "net revenue retention", "renewal", "expansion", "onboarding", "churn", "customer success"] },
  { id: "vertical-saas", name: "Shelfwalk", saas: true, desc: "a field sales app for consumer goods brands and their distributors", category: "field sales app",
    target: "national sales heads at consumer goods brands", problem: "no daily view of what field reps sell in thousands of small outlets",
    outcome: "grow same-outlet secondary sales by 12%", capability: "captures orders offline and suggests the next order for each outlet", differentiation: "offline order capture on low-end phones",
    competitors: ["Competitor A (a distribution management suite)", "Competitor B (a sales force automation tool)"], weak: "Competitor A has no order suggestions; Competitor B needs a data connection",
    strengths: "offline order capture; order suggestions for field reps", metrics: "secondary sales up 12% at Example Food Delivery Co", price: "$40,000 a year", customer: "Example Food Delivery Co", segments: ["Packaged food brands", "Personal care brands"],
    vocab: ["distributor", "outlet", "beat plan", "secondary sales", "general trade", "sku", "order capture", "retail execution", "dms", "trade scheme"] },
  { id: "ai-native", name: "Answerloop", saas: true, desc: "AI agents built on a large language model (LLM) that resolve customer support tickets inside the help desk", category: "AI platform for support automation",
    target: "support leaders at consumer apps and marketplaces", problem: "a ticket backlog growing faster than the support team can hire",
    outcome: "resolve 45% of tickets without a human", capability: "AI agents that resolve refund and order-status tickets, with human approval for refunds", differentiation: "human approval rules for every action that moves money",
    competitors: ["Competitor A (a help desk with a bot add-on)", "hiring more agents"], weak: "Competitor A bots answer from articles only; hiring more agents cannot absorb peaks", strengths: "approval rules; works inside the help desk",
    metrics: "45% of tickets resolved without a human in 60 days at Example Food Delivery Co", price: "$60,000 a year", customer: "Example Food Delivery Co", segments: ["Consumer apps", "SaaS companies"],
    vocab: ["resolution rate", "evaluation set", "human in the loop", "guardrails", "accuracy", "hallucination", "data privacy", "automation rate", "escalation"] },
  { id: "ites", name: "Example IT Services Co", saas: false, desc: "a managed IT service desk priced per employee for mid-size companies", category: "managed IT service desk",
    target: "CIOs and IT heads at mid-size companies in the UK and India", problem: "a ticket backlog and missed service levels with the current provider",
    outcome: "reach 95% SLA attainment within two quarters", capability: "runs a managed service desk with a staged transition and a parallel run", differentiation: "fixed price per employee with service credits",
    competitors: ["Competitor A (an offshore-only provider)", "the in-house IT team"], weak: "Competitor A has high attrition; the in-house team has no after-hours cover", strengths: "staged transition; fixed price per employee",
    metrics: "SLA attainment at 95% for Example Manufacturing Co", price: "$18 per employee per month", customer: "Example Manufacturing Co", segments: ["Mid-size manufacturers", "Retail groups"],
    vocab: ["sla", "statement of work", "transition", "steady state", "service credits", "governance", "ticket backlog", "knowledge transfer", "managed service"] },
  { id: "telecom", name: "Branchwire", saas: false, desc: "managed SD-WAN and business internet for companies with many branches", category: "managed SD-WAN and business internet",
    target: "CIOs and IT heads at companies with many branches", problem: "fragmented connectivity vendors and uneven service across branch sites",
    outcome: "reliable connectivity across all sites with one partner", capability: "runs managed SD-WAN with fallback links for every branch", differentiation: "one partner for links, security overlay and repair",
    competitors: ["Competitor A (a national operator)", "separate local internet providers"], weak: "Competitor A has slow repair at small sites; local providers give uneven service", strengths: "one contract for all branches; fallback links",
    metrics: "repair time down at the pilot sites of Example Manufacturing Co", price: "$240,000 a year", customer: "Example Manufacturing Co", segments: ["Retail chains with many branches", "Banks and lenders with branches"],
    vocab: ["sd-wan", "mpls", "leased line", "uptime", "sla", "latency", "branch sites", "site survey", "network operations", "mean time to repair"] },
  { id: "software", name: "Cloudmoat", saas: true, desc: "an API testing platform for developers and engineering teams", category: "API testing platform",
    target: "engineering managers at software companies", problem: "releases slowed by manual API checks and escaped defects",
    outcome: "catch breaking API changes before release", capability: "runs contract tests on every pull request", differentiation: "tests generated from the API specification",
    competitors: ["Competitor A (an open-source test framework)", "in-house scripts"], weak: "Competitor A needs maintenance by one engineer; in-house scripts break on every change", strengths: "tests from the spec; runs in the CI pipeline",
    metrics: "escaped defects down at Example Manufacturing Co", price: "$30,000 a year", customer: "Example Manufacturing Co", segments: ["Software product companies", "Platform teams"],
    vocab: ["ci pipeline", "developer experience", "test coverage", "release frequency", "sdk", "technical debt", "open-source", "mean time to recovery", "escaped defects", "api governance", "spec drift", "contract testing", "test suite"] },
  { id: "cybersecurity", name: "Cloudmoat", saas: true, desc: "cloud security monitoring that ranks misconfigurations by real exposure", category: "cloud security monitoring",
    target: "CISOs at mid-size fintech and SaaS companies", problem: "too many cloud alerts with no clear order to fix them",
    outcome: "fix critical exposures first", capability: "ranks every misconfiguration by real exposure", differentiation: "exposure-based ranking across three clouds",
    competitors: ["Competitor A (a cloud posture suite)", "periodic manual audits"], weak: "Competitor A sends long rule lists; manual audits are out of date within weeks", strengths: "exposure-based ranking; one view across three clouds",
    metrics: "critical exposures down 70% in one quarter at Example Manufacturing Co", price: "$45,000 a year", customer: "Example Manufacturing Co", segments: ["Mid-market fintech", "SaaS companies on two or more clouds"],
    vocab: ["attack surface", "exposure", "misconfiguration", "alert fatigue", "mean time to detect", "soc", "compliance audit", "risk register", "threat intelligence", "ciso"] },
];
const BUILD = {
  impact_get_framework: () => ({ focus_phase: "all" }),
  impact_identify_champions: (s) => ({ company_name: s.name, product_description: `${s.name}: ${s.desc}`, problem_solved: s.problem, target_company_type: s.target, price_point: s.price }),
  impact_map_alternatives: (s) => ({ your_product: `${s.name}: ${s.desc}`, category: s.category, competitors: s.competitors, competitor_weaknesses: s.weak, your_strengths: s.strengths }),
  impact_pinpoint_value: (s) => ({ product_name: s.name, category: s.category, target_customer: s.target, key_outcome: s.outcome, unique_capability: s.capability, customer_metrics: s.metrics }),
  impact_anchor_market: (s) => ({ product_description: `${s.name}: ${s.desc}`, potential_segments: s.segments, current_customers: s.customer, average_deal_size: "$36,000", sales_cycle: "75 days" }),
  impact_craft_message: (s) => ({ product_name: s.name, target_customer: s.target, customer_need: s.problem, product_category: s.category, key_benefit: s.outcome, competitor: s.competitors[0], differentiation: s.differentiation }),
  impact_translate_execution: (s) => ({ positioning_statement: `For ${s.target} who struggle with ${s.problem}, ${s.name} is the ${s.category} that ${s.capability}. Unlike ${s.competitors[0]}, it offers ${s.differentiation}.`, target_customer: s.target, key_benefit: s.outcome, product_name: s.name }),
  impact_full_audit: (s) => ({ company_name: s.name, product_description: `${s.name}: ${s.desc}`, target_customer: s.target, problem_solved: s.problem, key_differentiation: s.differentiation, competitors: s.competitors, current_positioning: `The smarter way to handle ${s.category}`, customer_feedback: s.metrics }),
};

// ---- Problem 1: no clinic text anywhere in the tool code or the tool descriptions ---------------------------------------------
test("problem 1: no clinic or dummy-company word in src/ or in tools/list", async () => {
  for (const f of ["../src/index.ts", "../src/verticals.ts"]) {
    assert.doesNotMatch(readFileSync(new URL(f, import.meta.url), "utf8"), new RegExp(B75.source, "i"), f);
  }
  const tl = await rpc("tools/list", {});
  assert.doesNotMatch(JSON.stringify(tl.result.tools), new RegExp(B75.source, "i"));
});

// ---- Every tool, every vertical: the automatic checks of the real-world test, on invented companies -------------------------
for (const [tool, build] of Object.entries(BUILD)) {
  for (const s of SC) {
    test(`${tool} / ${s.id}: answers, names the company, no B75 word, no template, no promise, no SaaS term for a non-SaaS business, adds sector words`, async () => {
      const args = build(s, 0);
      const inStr = JSON.stringify(args).toLowerCase();
      const r = await call(tool, args);
      assert.equal(r.isError, false, r.text.slice(0, 200));
      const low = r.text.toLowerCase();
      if (tool !== "impact_get_framework") assert.ok(low.includes(s.name.toLowerCase()), "company or product named");
      const hits = [...new Set((r.text.match(B75) || []).map((x) => x.toLowerCase()))].filter((w) => !inStr.includes(w));
      assert.deepEqual(hits, [], "B75 words");
      assert.doesNotMatch(r.text, TEMPLATE);
      assert.doesNotMatch(r.text, PROMISES);
      if (!s.saas) {
        const saas = [...new Set((r.text.match(new RegExp(SAAS_ONLY.source, "gi")) || []).map((x) => x.toLowerCase()))].filter((w) => !inStr.includes(w));
        assert.deepEqual(saas, [], "SaaS-only terms for a business that is not a software subscription");
      }
      if (tool !== "impact_get_framework") {
        const added = s.vocab.filter((w) => low.includes(w) && !inStr.includes(w));
        assert.ok(added.length > 0, "at least one sector word the input did not give");
      }
    });
  }
}

// ---- Problem 3: every supplied input is used, or named as not used and why ---------------------------------------------------
const pieces = (v) => (Array.isArray(v) ? v : [v]).flatMap((x) => String(x).split(/;|\n/)).map((x) => x.trim().replace(/[.!]+$/, "")).filter(Boolean);
for (const [tool, build] of Object.entries(BUILD)) {
  if (tool === "impact_get_framework") continue;
  for (const s of [SC[0], SC[5], SC[7]]) {
    test(`problem 3: ${tool} / ${s.id}: every input appears in the answer (or is named as not used)`, async () => {
      const args = build(s, 0);
      const r = await call(tool, args);
      const low = r.text.toLowerCase().replace(/\s+/g, " ");
      for (const [k, v] of Object.entries(args)) {
        for (const p of pieces(v)) {
          assert.ok(low.includes(p.toLowerCase().replace(/\s+/g, " ")) || /not used/i.test(r.text), `${tool}: input ${k} "${p}" is not in the answer`);
        }
      }
    });
  }
}

test("problem 3: map_alternatives gives each competitor its own card with its own weakness and every strength", async () => {
  const s = SC[0];
  const r = (await call("impact_map_alternatives", BUILD.impact_map_alternatives(s))).text;
  const a = r.split(/\*\*Competitor A\b/)[1]?.split(/\*\*Competitor B\b/)[0] || "";
  const b = r.split(/\*\*Competitor B\b/)[1] || "";
  assert.match(a, /needs months of setup/);
  assert.doesNotMatch(a.split(/\n---|\n## /)[0], /has no live re-routing/);
  assert.match(b.split(/\n---|\n## /)[0], /has no live re-routing/);
  for (const st of ["live re-routing", "address cleaning for unstructured addresses", "offline driver app"]) assert.match(r, new RegExp(st, "i"));
  assert.match(r, /spreadsheets and in-house dispatch/i);
  assert.doesNotMatch(r, /Poor support|Differentiate on|a common complaint in this category/);
  // a weakness is a note for the seller, never pasted into a question for the buyer
  for (const line of r.split("\n").filter((l) => /Landmine|^\d+\. "/.test(l))) assert.doesNotMatch(line, /needs months of setup|has no live re-routing/i, line);
});

test("problem 3: identify_champions uses price_point and target_company_type, and quotes the problem", async () => {
  const s = SC[0];
  const r = (await call("impact_identify_champions", BUILD.impact_identify_champions(s))).text;
  assert.match(r, /\$36,000 a year/);
  assert.match(r, /third-party logistics companies/);
  assert.doesNotMatch(r, /Department head who owns/);
  assert.doesNotMatch(r, /responsible for solving failed/i);
});

// ---- Problem 8: sector roles for each of the nine verticals come from the one data file ---------------------------------------
test("problem 8: identify_champions names the sector's own signer and champion for all nine verticals", async () => {
  const { VERTICALS } = await import(new URL("../src/verticals.ts", import.meta.url));
  assert.equal(VERTICALS.length, 9);
  for (const s of SC) {
    const v = VERTICALS.find((x) => x.id === s.id);
    const r = (await call("impact_identify_champions", BUILD.impact_identify_champions(s))).text;
    // run 21b: the entry is neutral and the kind of company (sub-type) may supply the signer; any of them in the answer counts
    const { SUBTYPES } = await import(new URL("../src/verticals.ts", import.meta.url));
    const signers = [v.committee, ...SUBTYPES.filter((t) => t.vertical === v.id).map((t) => t.notes.committee)].map((c) => c.split(";")[0].replace(/^(The|A|An) /i, "").replace(/ signs.*$/i, ""));
    const signer = signers.find((x) => r.includes(x)) || signers[0];
    // Run 20 round 1: the general SaaS committee ("the budget owner of the function") gives way to the team the problem text names.
    if (s.id === "saas" || s.id === "ai-native") assert.ok(r.includes(signer) || /read from the team your problem text names|roles for the buyers you named/.test(r), `${s.id}: signer "${signer}" or a function or industry based role is in the answer`);
    else assert.ok(r.includes(signer), `${s.id}: signer "${signer}" is in the answer`);
    assert.match(r, new RegExp(v.name.replace(/[-]/g, "[- ]"), "i"), `${s.id}: the answer says which sector it read`);
    assert.doesNotMatch(r, /Sales Operations Manager|VP\/Director of Sales/, `${s.id}: no sales-tech default roles`);
  }
});

test("problem 8: get_framework: the ONLY statement is guarded; optional sector adds roles, measures and proof for each vertical", async () => {
  const { VERTICALS } = await import(new URL("../src/verticals.ts", import.meta.url));
  const all = (await call("impact_get_framework", {})).text;
  assert.doesNotMatch(all, /^"We are the ONLY/m);
  assert.match(all, /\[Only if true and provable: [^\]]*ONLY/i);
  assert.doesNotMatch(all, /\bVP Sales\b.*Strong Champion/);
  for (const v of VERTICALS) {
    const r = (await call("impact_get_framework", { focus_phase: "all", sector: v.name })).text;
    assert.ok(r.includes(v.metrics[0]), `${v.id}: a metric of the sector`);
    assert.ok(r.includes(v.proofShape), `${v.id}: the proof shape`);
  }
  const unknown = (await call("impact_get_framework", { focus_phase: "all", sector: "underwater basket weaving" })).text;
  assert.match(unknown, /did not recognise|not recognised/i);
  assert.match(unknown, /logistics tech/);
});

// ---- Problem 2: typed words never break the grammar of a fixed sentence -------------------------------------------------------
const BENEFITS = ["cut cost per delivery by 18% in 90 days", "Fewer critical cloud exposures", "Critical exposures down 70% in one quarter", "Resolve 45% of tickets without a human", "grow same-outlet secondary sales by 12%"];
const BROKEN = /\b(get|gets|finally get|delivers|who get|offer|offers|gives \w+) (cut|resolve|grow|lift|reduce|close|fix|catch|save|win)\b/i;
test("problem 2: craft_message reads naturally for an action, a noun phrase and an unreadable benefit", async () => {
  for (const b of BENEFITS) {
    const r = (await call("impact_craft_message", { product_name: "Lanehop", target_customer: "heads of last-mile operations at third-party logistics companies", customer_need: "lose days chasing late deliveries",
      product_category: "last-mile delivery software", key_benefit: b, competitor: "Competitor A", differentiation: "live re-routing that dispatchers trust" })).text;
    assert.ok(r.toLowerCase().includes(b.toLowerCase()), `the benefit "${b}" is in the answer unchanged`);
    assert.doesNotMatch(r, BROKEN, b);
    assert.doesNotMatch(r, /Join 100\+/);
    assert.doesNotMatch(r, /\b(finally|that delivers|who get) (cut|resolve|grow)\b/i);
    for (const line of r.split("\n").filter((l) => /^\| \*\*(Outcome|Differentiator|Audience|Problem)/.test(l))) {
      assert.doesNotMatch(line, /\b(for|with|to|of|and|a|the|without|by|in|that|from)"/i, `a tagline never ends on a joining word: ${line}`);
    }
  }
});
test("problem 2: craft_message needs and differentiation of every kind fit their sentence", async () => {
  const base = { product_name: "Cloudmoat", target_customer: "CISOs at mid-size fintech companies", product_category: "cloud security monitoring", key_benefit: "fix critical exposures first", competitor: "periodic manual audits" };
  const noun = (await call("impact_craft_message", { ...base, customer_need: "too many cloud alerts with no clear order to fix them", differentiation: "exposure-based ranking across three clouds" })).text;
  assert.match(noun, /struggle with too many cloud alerts with no clear order to fix them/);
  assert.match(noun, /Cloudmoat offers exposure-based ranking across three clouds/);
  assert.doesNotMatch(noun, /\bwho too many\b|\bIf you too many\b/i);
  const third = (await call("impact_craft_message", { ...base, customer_need: "lose days chasing low-risk cloud alerts", differentiation: "ranks every misconfiguration by real exposure" })).text;
  assert.match(third, /If you lose days chasing low-risk cloud alerts/);
  assert.match(third, /Cloudmoat ranks every misconfiguration by real exposure/);
  assert.doesNotMatch(third, /offers? ranks every/i);
  const other = (await call("impact_craft_message", { ...base, customer_need: "bleed margin on empty miles", differentiation: "the one view that only ever shows what is exposed" })).text;
  assert.match(other, /face this problem \(bleed margin on empty miles\)/);
  assert.match(other, /Cloudmoat offers the one view that only ever shows what is exposed/);
  assert.doesNotMatch(other, /"[^"\n]*"[^"\n]*"[^"\n]*"[^"\n]*"\?/); // no nested quotes in a question
});
test("problem 2: pinpoint_value hero line and statements are whole sentences", async () => {
  const r = (await call("impact_pinpoint_value", { product_name: "Example IT Services Co", target_customer: "CIOs and IT heads at mid-size companies in the UK and India with 500 to 5,000 employees", key_outcome: "reach 95% SLA attainment within two quarters",
    unique_capability: "runs a managed service desk with a staged transition", customer_metrics: "SLA attainment at 95% for Example Manufacturing Co", category: "managed IT service desk" })).text;
  const hero = r.split("\n").find((l) => /Website Hero/.test(l)) ? r.split("\n")[r.split("\n").findIndex((l) => /Website Hero/.test(l)) + 1] : "";
  assert.ok(hero.length > 10, "hero line found");
  assert.doesNotMatch(hero, /\b(for|with|to|of|and|a|the|without|by|in|that|from|at)"?\s*$/i, hero);
  assert.doesNotMatch(r, /for a 2\./);
  assert.doesNotMatch(r, /\bget (reach|resolve|cut|grow)\b/i);
  assert.match(r, /runs a managed service desk with a staged transition/);
});
test("problem 2: translate_execution never pastes a benefit into a tagline or a cold email", async () => {
  const kinds = [["cut cost per delivery by 18% in 90 days", "cut cost per delivery by 18% in 90 days"], ["Fewer critical cloud exposures", "get fewer critical cloud exposures"],
    ["Resolve 45% of tickets without a human", "resolve 45% of tickets without a human"], ["reliable connectivity across all sites with one partner", "get reliable connectivity across all sites with one partner"],
    ["Month-end close cut from 12 days to 7", "reach this result (Month-end close cut from 12 days to 7)"]];
  for (const [b, phrase] of kinds) {
    const r = (await call("impact_translate_execution", { positioning_statement: "For CIOs at companies with many branches, Branchwire is the managed SD-WAN that runs fallback links for every branch. Unlike Competitor A, it offers one partner for links and repair.",
      target_customer: "CIOs and IT heads at large enterprises with many branches", key_benefit: b, product_name: "Branchwire" })).text;
    assert.ok(r.toLowerCase().includes(b.toLowerCase()), `the benefit "${b}" is in the answer`);
    const tag = r.split("\n").find((l) => /^> "Helping /.test(l)) || "";
    assert.ok(tag.includes(`Helping CIOs and IT heads at large enterprises with many branches ${phrase}`), `LinkedIn tagline: ${tag}`);
    assert.doesNotMatch(r, /\b(get|gets) (cut|resolve|grow|lift|reduce|close|fix)\b/i, b);
    assert.doesNotMatch(r, /without for /i);
  }
});

// ---- Problem 4: the business model is read from the inputs; no SaaS-only advice for a business that is not a subscription --------
test("problem 4: a connectivity business gets site-survey and quote calls to action, no free trial, no CAC, no G2 matrix", async () => {
  const s = SC[6];
  const t = (await call("impact_translate_execution", BUILD.impact_translate_execution(s))).text;
  assert.match(t, /site survey/i);
  assert.doesNotMatch(t, /free trial|\bCAC\b|Start Free Trial/i);
  const p = (await call("impact_pinpoint_value", BUILD.impact_pinpoint_value(s))).text;
  assert.doesNotMatch(p, /G2|Capterra|TrustRadius|hours automated|throughput/i);
  const m = (await call("impact_craft_message", BUILD.impact_craft_message(s))).text;
  assert.doesNotMatch(m, /self-service|No complexity, no consultants|Speed|Simplicity/);
});
test("problem 4: a managed service business is read as services, and the optional business_model overrides what is read", async () => {
  const s = SC[5];
  const read = (await call("impact_craft_message", BUILD.impact_craft_message(s))).text;
  assert.match(read, /services/i);
  assert.doesNotMatch(read, SAAS_ONLY);
  const inv = { product_name: "Answerloop", target_customer: "asset allocators and investment managers", key_benefit: "see how every portfolio position contributes to risk", differentiation: "explainable strategies with risk reporting", product_category: "investment strategy platform", competitor: "traditional fund houses" };
  const a = (await call("impact_craft_message", inv)).text;
  const b = (await call("impact_craft_message", { ...inv, business_model: "investment" })).text;
  assert.match(b, /from business_model/);
  assert.doesNotMatch(b, /\bTCO\b|payback|free trial|seats?\b/i);
  assert.match(b, /mandate|fees|reporting/i);
  assert.ok(a.length > 500);
  const bad = await call("impact_craft_message", { ...inv, business_model: "banana" });
  assert.equal(bad.isError, true);
});
test("problem 4: the tools list the optional business_model (and sector, company counts) as new optional inputs", async () => {
  const tl = (await rpc("tools/list", {})).result.tools;
  const by = Object.fromEntries(tl.map((t) => [t.name, t.inputSchema]));
  for (const n of ["impact_pinpoint_value", "impact_craft_message", "impact_translate_execution", "impact_full_audit"]) {
    assert.ok(by[n].properties.business_model, n);
    assert.deepEqual(by[n].properties.business_model.enum, ["saas", "services", "connectivity", "transactions", "marketplace", "hardware_software", "investment"], n);
    assert.ok(!(by[n].required || []).includes("business_model"), n);
  }
  assert.ok(by.impact_get_framework.properties.sector);
  for (const k of ["company_counts", "percent_matching_icp", "year_one_share_percent"]) assert.ok(by.impact_anchor_market.properties[k], k);
});

// ---- Problem 5 and 6: honest scores, calculations from the user's figures ----------------------------------------------------
test("problem 5: anchor_market no longer assumes 500,000 companies, a $30,000 deal or a 3 to 6 month cycle; it says what it needs", async () => {
  const r = (await call("impact_anchor_market", { product_description: "managed SD-WAN for banks", potential_segments: ["Banks and NBFCs", "Retail chains with many branches"] })).text;
  assert.doesNotMatch(r, /500,000|50,000 companies|100,000 companies|\$30,000|3-6 months/);
  assert.match(r, /company_counts/);
  assert.match(r, /average_deal_size/);
  assert.match(r, /not supplied/i);
});
test("problem 6: anchor_market arithmetic uses the user's own counts, deal size and percentages", async () => {
  const r = (await call("impact_anchor_market", { product_description: "spend management software for mid-size companies", potential_segments: ["Mid-size manufacturers", "IT services firms", "Distributors with many branches"],
    company_counts: "Mid-size manufacturers: 3,200; IT services firms: 1,800; Distributors with many branches: 2,500", average_deal_size: "$24,000", percent_matching_icp: 25, year_one_share_percent: 1 })).text;
  assert.match(r, /3,200 companies/);
  assert.match(r, /\$76\.8M/); // 3,200 x $24,000
  assert.match(r, /\$19\.2M/); // x 25%
  assert.match(r, /\$0\.19M/); // x 1%
  assert.match(r, /8 customers/); // 3,200 x 25% x 1%
  assert.doesNotMatch(r, /500,000/);
  // the count of another segment is used when that segment is the beachhead
  const r2 = (await call("impact_anchor_market", { product_description: "spend management software", potential_segments: ["Mid-size manufacturers", "Enterprise IT services firms"],
    company_counts: "Mid-size manufacturers: 3,200; Enterprise IT services firms: 600", average_deal_size: "$24K", percent_matching_icp: 50, year_one_share_percent: 10 })).text;
  assert.match(r2, /Recommended Beachhead: Enterprise IT services firms/);
  assert.match(r2, /600 companies/);
  assert.match(r2, /\$14\.4M/);
  assert.match(r2, /\$7\.2M/);
  assert.match(r2, /\$0\.72M/);
  assert.match(r2, /30 customers/);
});
test("problem 6: anchor_market names the missing input instead of guessing, line by line", async () => {
  const noPct = (await call("impact_anchor_market", { product_description: "spend management software", potential_segments: ["Mid-size manufacturers"], company_counts: "Mid-size manufacturers: 3,200", average_deal_size: "$24,000" })).text;
  assert.match(noPct, /\$76\.8M/);
  assert.match(noPct, /percent_matching_icp/);
  assert.doesNotMatch(noPct, /30%|5%/);
  const noAcv = (await call("impact_anchor_market", { product_description: "spend management software", potential_segments: ["Mid-size manufacturers"], company_counts: "Mid-size manufacturers: 3,200" })).text;
  assert.doesNotMatch(noAcv, /\$\d+(\.\d+)?M/);
  assert.match(noAcv, /average_deal_size/);
  const bare = (await call("impact_anchor_market", { product_description: "spend management software", potential_segments: ["Mid-size manufacturers"], company_counts: "3,200", average_deal_size: "$24,000" })).text;
  assert.match(bare, /\$76\.8M/);
});
test("B15-L2: a segment listed twice is scored once and the answer says so", async () => {
  const r = (await call("impact_anchor_market", { product_description: "spend management software", potential_segments: ["Mid-market fintech", "Mid-market fintech", "SMB retail"] })).text;
  assert.equal((r.match(/^\| \*\*Mid-market fintech\*\*|^\| Mid-market fintech/gm) || []).length, 1);
  assert.doesNotMatch(r, /\bTie:/);
  assert.match(r, /listed twice|duplicate/i);
});
test("problem 5: anchor_market keeps its keyword score presets (only the 500,000 presets and defaults go)", async () => {
  const r = (await call("impact_anchor_market", { product_description: "x", potential_segments: ["Enterprise banks", "Mid-market fintech", "SMB retail", "Plain segment"] })).text;
  assert.match(r, /\| Enterprise banks \| 4 \| 5 \| 2 \| 5 \| 2 \| \*\*18\*\* \|/);
  assert.match(r, /\| \*\*Mid-market fintech\*\* \(beachhead\) \| 5 \| 4 \| 4 \| 4 \| 3 \| \*\*20\*\* \|/);
  assert.match(r, /\| SMB retail \| 4 \| 2 \| 5 \| 2 \| 4 \| \*\*17\*\* \|/);
  assert.match(r, /\| Plain segment \| 3 \| 3 \| 3 \| 3 \| 3 \| \*\*15\*\* \|/);
});
test("problem 5: pinpoint_value prints no preset figure and labels the user's metric as supplied by the user", async () => {
  for (const s of [SC[0], SC[6], SC[8]]) {
    const r = (await call("impact_pinpoint_value", BUILD.impact_pinpoint_value(s))).text;
    assert.doesNotMatch(r, /10 hours\/week|15 hours\/week|20 hours\/week|\$500K|\$200K annual|95% coverage|5x throughput|30 hours\/month|Avoid \$1M|10x faster|60% fewer missed/);
    assert.doesNotMatch(r, /Our customers report/);
    assert.match(r, /supplied by you/i);
    assert.ok(r.includes(s.metrics.split(";")[0]));
  }
});
test("D72 repair: full_audit exposes only presence and never a grade or numeric quality score", async () => {
  for (const s of SC) {
    const args = BUILD.impact_full_audit(s);
    for (const a of [args, { product_description: args.product_description, target_customer: args.target_customer, problem_solved: args.problem_solved }]) {
      const r = (await call("impact_full_audit", a)).text;
      assert.match(r, /### Input completeness checklist/, s.id);
      assert.doesNotMatch(r, /Grade:|Input completeness score|\/100/, s.id);
      assert.equal((r.match(/^\| \*\*[IMPACT]\*\*:/gm) || []).length, 6, s.id);
      assert.match(r, /\| Phase \| Relevant input \| Presence \| Next step \|/, s.id);
    }
  }
});
test("problem 3 and 8: full_audit uses the customer feedback as proof, the named competitors and the sector in its plan; no preset percentages", async () => {
  const s = SC[8];
  const r = (await call("impact_full_audit", BUILD.impact_full_audit(s))).text;
  assert.match(r, /Proof you already have/i);
  assert.match(r, /critical exposures down 70% in one quarter at Example Manufacturing Co/i);
  assert.match(r, /Competitor A/);
  assert.match(r, /periodic manual audits/);
  assert.match(r, /CISO/);
  assert.doesNotMatch(r, /1-2%|3-5%|8-15%|Investment\*\*: 20-30 hours|Expected ROI/);
  assert.doesNotMatch(r, /\[delivers the result you promise\]|No more [a-z ]+ and"/);
  assert.match(r, /not part of the checklist/i);
});

// ---- Channels (problem 3): the input is now used ------------------------------------------------------------------------------
test("problem 3: translate_execution covers the channels asked for and names the ones it does not cover", async () => {
  const base = { positioning_statement: "For CISOs at mid-size fintech companies who drown in alerts, Cloudmoat ranks every misconfiguration by real exposure. Unlike long rule lists, it shows what to fix first.", target_customer: "CISOs at mid-size fintech companies", key_benefit: "fix critical exposures first", product_name: "Cloudmoat" };
  const r = (await call("impact_translate_execution", { ...base, channels: ["linkedin", "sales_deck", "tiktok"] })).text;
  assert.match(r, /## LinkedIn Execution/);
  assert.match(r, /## Sales Deck Execution/);
  assert.doesNotMatch(r, /## Website Execution|## Cold Email Execution|## Product Demo Execution/);
  assert.match(r, /tiktok/i);
  assert.match(r, /not covered/i);
  const all = (await call("impact_translate_execution", base)).text;
  for (const h of ["## Website Execution", "## LinkedIn Execution", "## Cold Email Execution", "## Sales Deck Execution", "## Product Demo Execution"]) assert.ok(all.includes(h), h);
  const none = (await call("impact_translate_execution", { ...base, channels: ["tiktok"] })).text;
  assert.match(none, /## Website Execution/);
  assert.match(none, /none of the channels/i);
});
test("problem 2 and 3: translate_execution carries the 'Unlike' part of the statement into the key slide, no empty competitor placeholder", async () => {
  const r = (await call("impact_translate_execution", BUILD.impact_translate_execution(SC[0]))).text;
  assert.match(r, /Competitor A \(a global route-planning suite\)/);
  assert.doesNotMatch(r, /\[Competitor Category\]|\[Your differentiation\]|Unlike \[/);
  assert.doesNotMatch(r, /100\+ customers/);
});
test("B15-L5f: translate_execution has one channel order (no matrix that disagrees with the list)", async () => {
  const r = (await call("impact_translate_execution", BUILD.impact_translate_execution(SC[2]))).text;
  assert.doesNotMatch(r, /Five stars|Expected CAC/);
  assert.match(r, /Recommended Priority Order/);
});
test("B15-L5g: craft_message labels the alternative it was not given", async () => {
  const r = (await call("impact_craft_message", { target_customer: "CISOs at mid-size fintech companies", key_benefit: "fix critical exposures first", differentiation: "exposure-based ranking across three clouds" })).text;
  assert.doesNotMatch(r, /Primary Alternative\*\*: traditional alternatives/);
  assert.match(r, /Primary Alternative\*\*: not supplied/);
});

// ---- Problem 7: no invented promise anywhere --------------------------------------------------------------------------------------
test("problem 7: no tool suggests a promise the user did not type", async () => {
  for (const [tool, build] of Object.entries(BUILD)) for (const s of [SC[1], SC[6]]) {
    const r = await call(tool, build(s, 0));
    assert.doesNotMatch(r.text, PROMISES, `${tool}/${s.id}`);
    assert.doesNotMatch(r.text, /\b(100% |risk-free|zero risk guaranteed)/i, `${tool}/${s.id}`);
  }
});
test("B82: the sector data file holds no figure, and the answers add none that the user did not give", async () => {
  const src = readFileSync(new URL("../src/verticals.ts", import.meta.url), "utf8");
  const body = src.split("\n").filter((l) => !/^\s*\/\//.test(l)).join("\n");
  assert.doesNotMatch(body.replace(/\b(3PL|5G|SD-WAN|ci\/cd|B2B|ERP|WMS|TMS|SKU|SLA|MPLS|CISO|SOC|API|SDK|IoT|NBFC|GST)\b/gi, ""), /\d+(\.\d+)?\s?(%|x\b|million|billion)/i);
  const r = (await call("impact_pinpoint_value", { product_name: "Branchwire", target_customer: "CIOs at companies with many branches", key_outcome: "reliable connectivity across all sites", unique_capability: "one partner for links and repair" })).text;
  assert.doesNotMatch(r, /\d+%|\d+x\b|\$\d/);
});

// ---- Helpers that are exported for the unit tests ------------------------------------------------------------------------------
test("grammar engine: kindOf, inf and committeeParts", async () => {
  const m = await import(new URL("../src/index.ts", import.meta.url));
  assert.equal(m.kindOf("cut cost per delivery by 18% in 90 days"), "base");
  assert.equal(m.kindOf("Resolve 45% of tickets without a human"), "base");
  assert.equal(m.kindOf("re-plans every route in under a minute"), "third");
  assert.equal(m.kindOf("ranks every misconfiguration"), "third");
  assert.equal(m.kindOf("Fewer critical cloud exposures"), "noun");
  assert.equal(m.kindOf("faster month-end close"), "noun");
  assert.equal(m.kindOf("Routes re-planned in under a minute, not overnight"), "other");
  assert.equal(m.kindOf("Month-end close cut from 12 days to 7"), "other");
  assert.equal(m.inf("cut cost per delivery"), "cut cost per delivery");
  assert.equal(m.inf("Fewer critical exposures"), "get fewer critical exposures");
  assert.equal(m.inf("Month-end close cut from 12 days to 7"), "reach this result (Month-end close cut from 12 days to 7)");
  assert.equal(m.needClause("bleed margin on empty miles"), "face this problem (bleed margin on empty miles)");
  assert.equal(m.catNoun("enterprise connectivity and digital services"), "provider of enterprise connectivity and digital services");
  assert.equal(m.catNoun("last-mile delivery software"), "last-mile delivery software");
  const { VERTICALS } = await import(new URL("../src/verticals.ts", import.meta.url));
  for (const v of VERTICALS) {
    const c = m.committeeParts(v);
    assert.ok(c.signer && c.signer.length > 2, `${v.id} signer`);
    assert.ok(c.champion && c.champion.length > 2, `${v.id} champion`);
    assert.ok(c.users === null || c.users.length > 2, `${v.id} users`);
    assert.ok(c.reviewers.length >= 1, `${v.id} reviewers`);
  }
  assert.equal(m.committeeParts(VERTICALS.find((v) => v.id === "logistics-tech")).signer, "COO or Head of Supply Chain");
  assert.equal(m.committeeParts(VERTICALS.find((v) => v.id === "cybersecurity")).champion, "security lead who owns the affected area");   // run 21b: the neutral entry; "SOC or cloud security lead" belongs to the cloud security sub-type
  assert.deepEqual(m.parseCounts("Mid-size manufacturers: 3,200; IT services firms: 1,800"), [{ name: "Mid-size manufacturers", count: 3200 }, { name: "IT services firms", count: 1800 }]);
  assert.deepEqual(m.parseCounts("3,200"), [{ name: "", count: 3200 }]);
});

// ---- Backlog B15-L1: a very long input is printed once in full and shortened where it repeats ------------------------------------
test("B15-L1: a 3,000 character input appears once in full, not in every sentence", async () => {
  const long = (m) => `${"a customer description that goes on and on ".repeat(60)}${m} ${"and a long tail ".repeat(40)}`.slice(0, 3900);
  const once = async (tool, args, markers) => {
    const r = (await call(tool, args));
    assert.equal(r.isError, false, tool);
    for (const m of markers) assert.equal(r.text.split(m).length - 1, 1, `${tool}: ${m} appears once`);
    assert.ok(r.text.length < 40000, `${tool}: answer length ${r.text.length}`);
  };
  await once("impact_craft_message", { product_name: "Lanehop", target_customer: long("ZZTARGETZZ"), key_benefit: long("ZZBENEFITZZ"), differentiation: long("ZZDIFFZZ"), customer_need: long("ZZNEEDZZ") }, ["ZZTARGETZZ", "ZZBENEFITZZ", "ZZDIFFZZ", "ZZNEEDZZ"]);
  await once("impact_pinpoint_value", { product_name: "Lanehop", target_customer: long("ZZTARGETZZ"), key_outcome: long("ZZOUTZZ"), unique_capability: long("ZZCAPZZ") }, ["ZZTARGETZZ", "ZZOUTZZ", "ZZCAPZZ"]);
  await once("impact_translate_execution", { positioning_statement: "For logistics leaders, Lanehop re-plans routes.", target_customer: long("ZZTARGETZZ"), key_benefit: long("ZZBENEFITZZ"), product_name: "Lanehop" }, ["ZZTARGETZZ", "ZZBENEFITZZ"]);
  await once("impact_full_audit", { company_name: "Lanehop", product_description: long("ZZPRODZZ"), target_customer: long("ZZTARGETZZ"), problem_solved: long("ZZPROBZZ") }, ["ZZPRODZZ", "ZZTARGETZZ", "ZZPROBZZ"]);
  await once("impact_identify_champions", { product_description: long("ZZPRODZZ"), problem_solved: long("ZZPROBZZ") }, ["ZZPRODZZ", "ZZPROBZZ"]);
  const m = (await call("impact_craft_message", { target_customer: long("ZZT"), key_benefit: "fewer late deliveries", differentiation: "live re-routing" })).text;
  assert.match(m, /Long inputs are shortened where they repeat/);
});
