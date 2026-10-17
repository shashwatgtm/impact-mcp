// Run 42B: your_sector is the seller's own industry; when given it decides the sector, an unknown value is refused, and without it a boundary description stays neutral or keeps the seller's category. Invented companies only.
import test from "node:test";
import assert from "node:assert/strict";
import { call as call0 } from "./run22-impact-common.mjs";
const call = async (t, a) => { const o = await call0(t, a); if (!/your_sector must be one of/.test(o)) assert.ok(!/^(?:Missing required|Invalid input)/.test(o), o); return o; };

const base = { product_name: "Quillbase", category: "customer support software", target_customer: "support teams at banks", key_outcome: "Faster replies", unique_capability: "Drafts replies from your past tickets" };

test("your_sector decides the sector over contrary text", async () => {
  const o = await call("impact_pinpoint_value", { ...base, your_sector: "telecom" });
  assert.match(o, /Sector: set by your_sector as telecom/);
});

test("your_sector other means neutral wording", async () => {
  const o = await call("impact_pinpoint_value", { ...base, your_sector: "other" });
  assert.match(o, /set by your_sector to other, so the wording stays neutral/);
});

test("an unknown value is refused with the allowed values and never echoed", async () => {
  const o = await call("impact_pinpoint_value", { ...base, your_sector: "<b>x</b>" });
  assert.match(o, /your_sector must be one of: logistics_tech, fintech/);
  assert.ok(!o.includes("<b>x</b>"));
});

test("the framework takes your_sector as well as sector", async () => {
  const o = await call("impact_get_framework", { your_sector: "cybersecurity" });
  assert.match(o, /Your sector: cybersecurity/);
  const p = await call("impact_get_framework", { sector: "fintech" });
  assert.match(p, /Your sector: fintech/);
});

test("without your_sector, a product with a payments feature is not read as fintech", async () => {
  const o = await call("impact_pinpoint_value", { product_name: "Gearloop", category: "auto repair shop management software with payments built in", target_customer: "independent auto repair shops", key_outcome: "Fewer unpaid invoices", unique_capability: "Payments inside the work order" });
  assert.ok(!/read from your inputs as fintech|billing and revenue/i.test(o));
});

test("a services firm with a platform and a managed service are not read as a software subscription", async () => {
  const o = await call("impact_pinpoint_value", { product_name: "Watchhall", category: "managed detection and response with a 24/7 SOC and a security platform", target_customer: "mid-size companies", key_outcome: "Threats contained in minutes", unique_capability: "Analysts watch every alert" });
  assert.ok(!/Business model: software subscription/i.test(o));
});

test("a network provider selling security is not a cybersecurity company without your_sector", async () => {
  const o = await call("impact_pinpoint_value", { product_name: "Lineway", category: "enterprise network and connectivity services with managed security", target_customer: "enterprises with many sites", key_outcome: "Fewer outages", unique_capability: "One provider for links and security" });
  assert.ok(!/read from your inputs as cybersecurity/i.test(o), o.match(/\*Sector:[^\n]*/)?.[0]);
});

test("an audience clause cut at where is not left hanging", async () => {
  const o = await call("impact_craft_message", { product_name: "Quillbase", target_customer: "large and regulated enterprises where IT and business teams work together", customer_need: "Knowledge is scattered", product_category: "an agent platform", key_benefit: "Agents handle execution so teams focus on strategy", differentiation: "Rules are set once and enforced everywhere" });
  assert.ok(!/enterprises where[.:,]/.test(o));
});

test("owner run small businesses get owner and manager roles, not a COO", async () => {
  const o = await call("impact_identify_champions", { company_name: "Gearloop", product_description: "Shop management software for auto repair", problem_solved: "Estimates and invoices live in separate tools", target_company_type: "independent auto repair shops, tire shops, fleet service" });
  assert.match(o, /owner/i);
  assert.ok(!/Most Likely Role\*\*: (?:COO|Head of Operations)/.test(o));
});

test("results others got typed in key_benefit count as proof, not as no result typed", async () => {
  const o = await call("impact_translate_execution", { positioning_statement: "For shops, Gearloop is the shop software that runs estimates and payments.", target_customer: "independent auto repair shops", key_benefit: "Shops saw an average revenue increase of 40% in their first year (page claim)", product_name: "Gearloop" });
  assert.ok(!/no customer count, result or recognition was typed/.test(o));
});
