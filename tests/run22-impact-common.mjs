// Run 22: shared helpers for the three rewrite tests (impact_pinpoint_value, impact_anchor_market, impact_map_alternatives).
// This file is not a test itself (its name has no ".test"). Companies in the tests are invented; the pool scenarios are loaded at run time
// from the private project folder when it exists (they carry real names, which are never written into this public repo) and are skipped otherwise.
import assert from "node:assert/strict";

const { default: handler } = await import(new URL("../netlify/functions/mcp.mjs", import.meta.url));
let nextId = 1;
export const rpc = async (method, params) => (await (await handler(new Request("https://x.gtmhelix.com/mcp", { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" }, body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method, params }) }))).json()).result;
export const call = async (name, args) => (await rpc("tools/call", { name, arguments: args })).content.map((c) => c.text).join("\n");

// A placeholder or bracket prompt where an input should stand.
export const PLACEHOLDER = /\[(?:Insert|Your|Add|Name|Company|Fill|Customer|X)[^\]]{0,60}\]|\{\{|<[A-Za-z][A-Za-z ]{1,30}>|\bundefined\b|\bNaN\b|\bLorem\b|\bTBD\b|\bXX%|Fill from the customer|Fill it only|placement is a placeholder|\(Example figure/i;
// The same sentence twice (sentences of 7 words or more, table cells and list items included).
export function repeatedSentences(text) {
  const seen = new Map();
  const out = [];
  for (const raw of text.split("\n").filter((l) => !/^\s*\|/.test(l)).join("\n").split(/(?<=[.!?])\s+|\n+/)) {
    const s = raw.replace(/[*_>`#"“”]/g, "").replace(/^[-\d.)\s]+/, "").replace(/\s+/g, " ").trim().toLowerCase();
    if (s.split(" ").length < 7) continue;
    if (seen.has(s)) out.push(s); else seen.set(s, 1);
  }
  return out;
}
// A text cut in the middle: an ellipsis, or a joining word as the last word of a sentence.
export function cuts(text) {
  const out = [];
  for (const line of text.split("\n")) {
    if (/\.\.\.["”)\]]?(\s|$)/.test(line)) out.push(line.slice(0, 120));
    for (const m of line.matchAll(/\b(with|and|of|for|to|the|a|an|by|that|from|or)\s*(?:[.!?]["”)\]]?)(?=\s|$)/gi)) out.push(line.slice(Math.max(0, m.index - 40), m.index + 20));
  }
  return out;
}
const norm = (s) => s.toLowerCase().replace(/[“”"'`*]/g, "").replace(/\s+/g, " ").trim();
// Does the answer use this input? A window of up to 4 words from the middle of the item has to appear (case and quotes ignored).
export function uses(answer, item) {
  const words = norm(item).replace(/\([^)]*\)/g, " ").replace(/[.;,!?]+/g, " ").split(" ").filter(Boolean);
  if (!words.length) return true;
  const start = words.length > 5 ? 1 : 0;
  const win = words.slice(start, start + 4).join(" ");
  return norm(answer).replace(/[.;,!?]+/g, " ").replace(/\s+/g, " ").includes(win);
}
// Items of a typed list (lines, semicolons), for the "every input is used" check.
export const itemsOf = (s) => String(s || "").split(/\n|;/).map((x) => x.trim()).filter(Boolean);

export function sections(text) {
  const out = {};
  let cur = "_head";
  for (const l of text.split("\n")) { const m = l.match(/^##\s+(.*)$/); if (m) cur = m[1].trim(); out[cur] = (out[cur] || "") + l + "\n"; }
  return out;
}
export const sharpen = (t) => t.split("To sharpen this, give:").length - 1;
export function assertSharpenAtEnd(t, label = "") {
  assert.ok(sharpen(t) <= 1, `${label}: "To sharpen this, give:" appears ${sharpen(t)} times`);
  if (sharpen(t) === 1) {
    const after = t.split("To sharpen this, give:")[1];
    assert.match(after, /\(it would change [^)]+\)/, `${label}: each missing input says what it would change`);
    assert.ok(after.split("\n\n").length <= 3, `${label}: nothing but the next step follows the list`);
  }
}

// The pool scenarios (T6 to T9, H, P, Q; never T1 to T5), loaded from the private project when it is present.
export async function loadPool() {
  const root = "/home/user/directory-submission-work/work/";
  try {
    const { BUILD20 } = await import(root + "run20/eval/builders20.mjs");
    const { loadSet } = await import(root + "run21/eval/common21.mjs");
    const all = [];
    for (const s of ["T", "H", "P", "Q"]) all.push(...(await loadSet(s)));
    const ok = all.filter((s) => !/^T[1-5]$/.test(s.id));
    const tl = (await rpc("tools/list", {})).tools;
    return { scenarios: ok, build: async (tool, sc) => BUILD20.impact[tool](sc, 0, tl.find((t) => t.name === tool).inputSchema) };
  } catch { return null; }
}
export const SAAS_ONLY = /\b(MRR|free trial|freemium|self-serve sign-?up|per seat|seats?|aha moment)\b/i;
