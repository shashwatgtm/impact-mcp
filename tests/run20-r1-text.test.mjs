// Run 20 round 1, task B (ledger rows A17-O23, A17-O29, A17-O31, and printed percentages).
// Written before the fixes: these tests failed on origin/run20-after-review 7e8fe9f (version 2.2.19).
// Companies are invented (Lanehop, Branchwire, Cloudmoat). No real company name is used in this public repo.
// Run: node --test tests/run20-r1-text.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

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
  return j.result.content.map((c) => c.text).join("\n");
};
const tools = (await rpc("tools/list", {})).result.tools;
const tool = (n) => tools.find((t) => t.name === n);

const TARGET = "heads of last-mile operations at third-party logistics companies";

// ---- A17-O23: input hints --------------------------------------------------------------------------------------------------

test("A17-O23: no input hint of an optional field starts with 'Optional:' (the form already says '(optional)')", () => {
  let checked = 0;
  for (const t of tools) {
    const required = t.inputSchema.required || [];
    for (const [k, p] of Object.entries(t.inputSchema.properties || {})) {
      checked++;
      assert.doesNotMatch(p.description || "", /^\s*optional\b/i, `${t.name}.${k}: ${p.description}`);
      if (!required.includes(k)) assert.ok((p.description || "").length > 0, `${t.name}.${k} has a hint`);
    }
  }
  assert.ok(checked >= 30, `read ${checked} input hints`);
});

test("A17-O23: every hint starts with a capital letter or a digit", () => {
  for (const t of tools) for (const [k, p] of Object.entries(t.inputSchema.properties || {})) assert.match(p.description, /^[A-Z0-9]/, `${t.name}.${k}: ${p.description}`);
});

test("A17-O23: the two anchor hints keep their 'shown, not used in the scoring' words", () => {
  const p = tool("impact_anchor_market").inputSchema.properties;
  assert.match(p.current_customers.description, /Shown in the output; not used in the scoring/);
  assert.match(p.sales_cycle.description, /Shown in the output; not used in the scoring/);
});

test("A17-O23: the anchor segment hint shows words, not a code list", () => {
  const d = tool("impact_anchor_market").inputSchema.properties.potential_segments.description;
  assert.doesNotMatch(d, /\[\s*["']|["']\s*\]/, d);
  assert.match(d, /segments/i);
  assert.match(d, /Mid-market fintech/);
});

test("A17-O23: the price hint does not say 'ACV range' and its examples carry their period", () => {
  const d = tool("impact_identify_champions").inputSchema.properties.price_point.description;
  assert.doesNotMatch(d, /ACV range/i, d);
  assert.match(d, /a year/i);
  assert.match(d, /per month/i);
  assert.doesNotMatch(d, /\$400/);
});

test("A17-O23: the ACV hint of the anchor tool spells ACV out", () => {
  const d = tool("impact_anchor_market").inputSchema.properties.average_deal_size.description;
  assert.match(d, /annual contract value \(ACV\)/i, d);
});

test("A17-O23: the price answer text uses an example with a period, not a bare range", async () => {
  const out = await call("impact_identify_champions", { product_description: "last-mile delivery software", problem_solved: "failed first-attempt deliveries" });
  assert.doesNotMatch(out, /ACV range/i);
  assert.doesNotMatch(out, /\$50K-100K/);
  assert.match(out, /price_point \(for example "\$50,000 a year"\)/);
});

// ---- A17-O29: a tagline the tool invents carries the wrap, or is built from the user's words -----------------------------------

const INVENTED_TAGLINES = /Stop wasting|Start winning|Fix what is exposed first/i;
const WRAP = "[Only if true and provable:";

test("A17-O29: the framework guide's tagline example is a pattern in the wrap, not an invented tagline", async () => {
  for (const args of [{}, { focus_phase: "craft" }, { focus_phase: "craft", sector: "cybersecurity" }]) {
    const out = await call("impact_get_framework", args);
    assert.doesNotMatch(out, INVENTED_TAGLINES, JSON.stringify(args));
    const block = out.split("**Level 1: tagline (3 to 7 words)**")[1].split("**Level 2")[0];
    assert.ok(block.includes(WRAP), `Level 1 block: ${block}`);
    // every double-quoted string in the block is inside the wrap
    for (const m of block.matchAll(/"([^"]+)"/g)) {
      const before = block.slice(0, m.index);
      assert.ok(before.lastIndexOf(WRAP) > before.lastIndexOf("]"), `unwrapped quote ${m[0]}`);
    }
  }
});

test("A17-O29: no tool answer carries an invented tagline, and every quoted tagline is the user's words or inside the wrap", async () => {
  const outs = []; // [answer, fewest tagline lines expected]
  outs.push(await call("impact_craft_message", { target_customer: "ops leads", key_benefit: "faster deliveries", differentiation: "live rerouting" }));
  outs.push(await call("impact_craft_message", { product_name: "Lanehop", target_customer: TARGET, customer_need: "lose time on failed first-attempt deliveries", product_category: "last-mile delivery software", key_benefit: "cut cost per delivery by 18% in 90 days", differentiation: "re-plans every route in under a minute", competitor: "Competitor A (a global route-planning suite)" }));
  outs.push(await call("impact_translate_execution", { positioning_statement: "For heads of ops, Lanehop re-plans every route.", target_customer: TARGET, key_benefit: "cut cost per delivery by 18%" }));
  outs.push(await call("impact_full_audit", { product_description: "last-mile delivery software", target_customer: TARGET, problem_solved: "failed first-attempt deliveries", key_differentiation: "re-plans every route in under a minute" }));
  const minLines = [3, 3, 0, 2];
  for (const [i, out] of outs.entries()) {
    assert.doesNotMatch(out, INVENTED_TAGLINES);
    // lines of a tagline table row or the numbered tagline options
    const lines = out.split("\n").filter((l) => /^\| \*\*(Outcome|Differentiator|Audience|Problem)\*\*/.test(l) || /^\d+\. ("|\[Only)/.test(l));
    assert.ok(lines.length >= minLines[i], `tagline lines found: ${lines.length}`);
    for (const l of lines) {
      if (l.includes(WRAP)) continue;
      // built from the user's words: the quoted text is "Built for <audience>", "Do you <need>?" or a cut of an input
      assert.match(l, /"(Built for |Do you )?[^"]+"/, l);
    }
  }
});

// ---- A17-O31: the Full Audit scores input completeness only --------------------------------------------------------------------

test("A17-O31: the framework guide and translate_execution describe the Full Audit as an input completeness score", async () => {
  const fw = await call("impact_get_framework", {});
  const tr = await call("impact_translate_execution", { positioning_statement: "For heads of ops, Lanehop re-plans every route.", target_customer: TARGET, key_benefit: "cut cost per delivery by 18%" });
  for (const [n, out] of [["framework", fw], ["translate", tr]]) {
    assert.doesNotMatch(out, /complete scored assessment|complete positioning assessment/i, n);
    const line = out.split("\n").find((l) => l.includes("impact_full_audit") && /audit/i.test(l) && !/^\d\./.test(l.trim()) && !/Getting Started/.test(l) && /(Or run|Use)/.test(l));
    assert.ok(line, `${n}: the line that points to the audit`);
    assert.match(line, /input completeness/i, `${n}: ${line}`);
    assert.match(line, /not (a verdict on|whether)/i, `${n}: ${line}`);
  }
});

// ---- Printed percentages: at most one decimal, no float noise ------------------------------------------------------------------

const anchorArgs = (extra) => ({ product_description: "last-mile delivery software", potential_segments: ["Third-party logistics providers", "E-commerce brands"], average_deal_size: "$36,000", company_counts: "Third-party logistics providers: 3,200", ...extra });
const percents = (out) => [...out.matchAll(/(\d[\d,]*(?:\.\d+)?)%/g)].map((m) => m[1]);

test("percentages: a many-decimal or float-noise percent is shown with at most one decimal", async () => {
  const out = await call("impact_anchor_market", anchorArgs({ percent_matching_icp: 12.345678, year_one_share_percent: 0.1 + 0.2 }));
  assert.doesNotMatch(out, /0\.30000000000000004/);
  assert.doesNotMatch(out, /12\.345678/);
  assert.match(out, /\| % that match your ICP \| 12\.3% \|/);
  assert.match(out, /\| Year 1 share \| 0\.3% \|/);
  assert.match(out, /SAM = \$115\.2M × 12\.3%/);
  assert.match(out, /shown to one decimal/);
  for (const p of percents(out)) assert.doesNotMatch(p, /\.\d{2,}$/, p);
});

test("percentages: whole numbers and one-decimal numbers print as typed, and no rounding note appears", async () => {
  const out = await call("impact_anchor_market", anchorArgs({ percent_matching_icp: 25, year_one_share_percent: 1.5 }));
  assert.match(out, /\| % that match your ICP \| 25% \|/);
  assert.match(out, /\| Year 1 share \| 1\.5% \|/);
  assert.doesNotMatch(out, /shown to one decimal/);
});

test("percentages: a very small percent is never shown as 0%", async () => {
  const out = await call("impact_anchor_market", anchorArgs({ percent_matching_icp: 0.04, year_one_share_percent: 100 }));
  assert.match(out, /\| % that match your ICP \| under 0\.1% \|/);
  assert.doesNotMatch(out, /\| % that match your ICP \| 0% \|/);
  for (const p of percents(out)) assert.doesNotMatch(p, /\.\d{2,}$/, p);
});

test("percentages: the sizing figures still come from the exact percentages the user gave", async () => {
  const out = await call("impact_anchor_market", anchorArgs({ percent_matching_icp: 12.345678, year_one_share_percent: 100 }));
  // 3,200 x $36,000 = $115,200,000; x 12.345678% = $14,222,221
  assert.match(out, /SAM = \$14,222,221 \(\$14\.22M\)/);
});
