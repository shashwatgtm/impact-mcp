// Run 21b late task (test first): two tables keyed by the vertical id were written for ONE kind of company per vertical and were printed for every
// company of that vertical: statusQuoDefaults ("What they may be doing instead", impact_map_alternatives) and SECTOR_CTA (the first call to action,
// impact_translate_execution). The stock lines are now used only when the sector read names the kind they were written for (v.subtype); every other
// company of the vertical gets neutral lines. Companies are described in plain words (no names).
import { test } from "node:test";
import assert from "node:assert/strict";

const { default: handler } = await import(new URL("../netlify/functions/mcp.mjs", import.meta.url));
let nextId = 1;
const call = async (name, args) => {
  const r = await handler(new Request("https://x.gtmhelix.com/mcp", { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" }, body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method: "tools/call", params: { name, arguments: args } }) }));
  const j = await r.json();
  return j.result.content.map((c) => c.text).join("\n");
};
const instead = (p) => call("impact_map_alternatives", { your_product: p, category: p, competitors: ["Rival One"] });
const cta = (p, model) => call("impact_translate_execution", { positioning_statement: `${p} for teams that need it`, target_customer: "operations leaders", key_benefit: "work faster", channels: ["website"], ...(model ? { business_model: model } : {}) });

const LASTMILE = "Last mile delivery management software with route planning and proof of delivery";
const FREIGHT = "Freight visibility platform that tracks shipments in real time across carriers";
const EXPENSE = "Spend management software with expense claims, approvals and corporate cards";
const PAYAPI = "Payments API for merchants to accept cards and bank transfers";
const FMCG = "Field sales automation and distributor management software for consumer brands, with beat planning and order capture in the outlet";
const CONSTRUCTION = "Construction management software for general contractors: project management, cost management and quality and safety";
const OPERATOR = "Enterprise connectivity and SD-WAN provider that links business sites";
const MESSAGING = "Messaging platform and SMS API that lets businesses message their customers";

const LOGISTICS_STOCK = /dispatch|route planning in spreadsheets|transport system already in place|dispatchers and drivers/i;
const FINTECH_STOCK = /ERP's own expense|cash advances|manual approvals/i;
const SAAS_STOCK = /beat diar|distributor's own system|reps reporting/i;
const TELECOM_STOCK = /Running the links in-house|Several providers for different sites/i;

test("status quo, logistics: the dispatch lines are for last mile only; a freight visibility company gets neutral lines", async () => {
  const a = await instead(LASTMILE), b = await instead(FREIGHT);
  assert.match(a, /What they may be doing instead/);
  assert.match(a, LOGISTICS_STOCK);
  assert.match(b, /What they may be doing instead/);
  assert.doesNotMatch(b, LOGISTICS_STOCK);
});

test("status quo, fintech: the expense lines are for spend and expense only; a payments API company gets neutral lines", async () => {
  const a = await instead(EXPENSE), b = await instead(PAYAPI);
  assert.match(a, FINTECH_STOCK);
  assert.match(b, /What they may be doing instead/);
  assert.doesNotMatch(b, FINTECH_STOCK);
});

test("status quo, vertical SaaS: the beat diary lines are for retail execution only; a construction platform gets neutral lines", async () => {
  const a = await instead(FMCG), b = await instead(CONSTRUCTION);
  assert.match(a, SAAS_STOCK);
  assert.match(b, /What they may be doing instead/);
  assert.doesNotMatch(b, SAAS_STOCK);
});

test("status quo, telecom: the links and sites lines are for operators and enterprise connectivity only; a messaging company gets neutral lines", async () => {
  const a = await instead(OPERATOR), b = await instead(MESSAGING);
  assert.match(a, TELECOM_STOCK);
  assert.match(b, /What they may be doing instead/);
  assert.doesNotMatch(b, TELECOM_STOCK);
});

test("first call to action, logistics: the hub pilot is for last mile only", async () => {
  const a = await cta(LASTMILE), b = await cta(FREIGHT);
  assert.match(a, /Book a pilot at one hub/);
  assert.doesNotMatch(b, /one hub/i);
});

test("first call to action, fintech: the entity or department pilot is for spend and expense only", async () => {
  const a = await cta(EXPENSE), b = await cta(PAYAPI);
  assert.match(a, /Book a pilot on one entity or department/);
  assert.doesNotMatch(b, /one entity or department/i);
});

test("first call to action, vertical SaaS: the regional pilot is for retail execution only", async () => {
  const a = await cta(FMCG), b = await cta(CONSTRUCTION);
  assert.match(a, /Book a pilot in one region/);
  assert.doesNotMatch(b, /pilot in one region/i);
});

test("first call to action, telecom: the site survey is for operators and enterprise connectivity only", async () => {
  // The sector default model of telecom is connectivity, whose own (business model keyed) call to action is the site survey; the sector table is reached when the seller sells as software.
  const a = await cta(OPERATOR, "saas"), b = await cta(MESSAGING, "saas");
  assert.match(a, /Request a site survey/);
  assert.doesNotMatch(b, /site survey/i);
});

test("the neutral lines carry no figure and no dash", async () => {
  for (const p of [FREIGHT, PAYAPI, CONSTRUCTION, MESSAGING]) {
    const t = (await instead(p)).match(/What they may be doing instead[\s\S]*?\n\n/)[0];
    assert.doesNotMatch(t, /\d|[–—]| - /);
  }
});
