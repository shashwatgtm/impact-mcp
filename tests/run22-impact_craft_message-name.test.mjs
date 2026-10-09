// Run 22 round 3 follow-up, impact_craft_message: written before the fix (test first). A product typed as a description that opens with an ordinary capitalised word
// followed by a comma list ("Modern cloud, security and data services ...") must not be named by that first word; only a typed brand (a word with an inner capital, a digit
// or a dot, such as eClerx or Gnani.ai) followed by its own list is named by the brand alone. The rows are invented; the real E11 check of the project (the "name cut to
// one word" block) is run over them in the styles plain and para when the private project folder exists. Run: node --no-warnings --test tests/run22-impact_craft_message-name.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { call } from "./run22-impact-common.mjs";

const OPENERS = ["Modern", "Global", "Digital", "Secure", "Unified", "Smart", "Cloud", "Open", "Next", "Intelligent", "Analysts", "Founders"];
const row = (opener, named) => ({
  id: `X-${opener}`, company: named ? `${named} Labs` : `${opener} Co`, product: named || `${opener} cloud, security and data services for regional banks`,
  productDesc: `${opener.toLowerCase() === opener ? opener : opener} cloud, security and data services for regional banks (Vaultline, Gridcheck)`,
  category: "managed security and data services", targetCustomer: "security leads at regional banks", segments: ["regional banks"],
  problem: "alerts pile up and audits slip", outcome: "cut audit preparation time and close critical findings faster", capability: "continuous control checks",
  differentiation: "controls are checked every day across all clouds, with one evidence file for the auditors", competitors: ["periodic manual audits"],
});
const argsOf = (s) => ({ product_name: s.product, target_customer: s.targetCustomer, customer_need: s.problem, product_category: s.category, key_benefit: s.outcome, competitor: s.competitors[0], differentiation: s.differentiation });

test("name: a description that opens with an ordinary word and a comma list is not named by that word", async () => {
  for (const o of OPENERS) {
    const t = await call("impact_craft_message", { ...argsOf(row(o)), product_name: `${o} cloud, security and data services for regional banks (Vaultline, Gridcheck)` });
    const head = t.split("\n")[0];
    assert.doesNotMatch(head, new RegExp(`: ${o}$`), `${o}: ${head}`);
    assert.doesNotMatch(t, new RegExp(`(?<![\\w-])${o}(?:'s| (?:helps|is|has|gives|lets|needs|can))\\b`), `${o}: the opener is used as a name`);
  }
});

test("name: a typed brand with an inner capital, a digit or a dot followed by its own list is named by the brand alone", async () => {
  for (const [n, brand] of [["zenFin digital, data and compliance services and AI products (Auditdesk)", "zenFin"], ["Voxa.ai voice, analytics and assist services (Voxa Prism)", "Voxa.ai"], ["Fin2go payments, lending and cards services (Fin2go Pay)", "Fin2go"]]) {
    const t = await call("impact_craft_message", { ...argsOf(row("X")), product_name: n });
    assert.ok(t.split("\n")[0].startsWith(`# Positioning and Messaging: ${brand}`) && !new RegExp(`${brand.replace('.', '\\.')} (?:digital|voice|payments)\\b`).test(t.split("\n")[0]), `${n}: ${t.split("\n")[0]}`);
  }
});

// ---- the real E11 check over invented rows (needs the private project folder) ----------------------------------------------------------------
let lib = null;
try { lib = await import("/home/user/directory-submission-work/work/run21/eval/e11lib21.mjs"); } catch { /* the private folder is absent */ }
test("name: the project E11 check gives no flag on invented rows in the styles plain and para, for both tools", { skip: !lib }, async () => {
  const bad = [];
  for (const o of OPENERS) for (const named of [null, "Zentrix"]) {
    const s = row(o, named);
    for (const style of ["plain", "para"]) {
      const a = lib.styleArgs(style, s, argsOf(s));
      const out = await call("impact_craft_message", a);
      for (const f of lib.e11(out, style, s)) bad.push(`craft ${o}/${named || "-"}/${style}: ${f.kind}: ${f.ctx}`);
      const tr = lib.styleArgs(style, s, { positioning_statement: `For ${s.targetCustomer} who struggle with ${s.problem}, ${s.product} is the ${s.category} that ${s.capability}. Unlike ${s.competitors[0]}, it offers ${s.differentiation}.`, target_customer: s.targetCustomer, key_benefit: s.outcome, product_name: s.product });
      const out2 = await call("impact_translate_execution", tr);
      for (const f of lib.e11(out2, style, s)) bad.push(`translate ${o}/${named || "-"}/${style}: ${f.kind}: ${f.ctx}`);
    }
  }
  assert.deepEqual(bad, []);
});
