// Run 22 (owner item 6, test first): for a freight marketplace the buying committee sentence put the carrier side as the signer,
// so impact_identify_champions named "the carrier side owner or dispatcher" as champion and economic buyer, though the shipper
// (the side that books loads and pays for the platform) signs. The sentence is read by committeeParts(): a clause that ends in
// "signs" or "decides" is the signer, "champions" the champion, "use" the daily users. Companies below are invented.
// Run: node --test tests/run22-freight-marketplace.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

const { committeeParts } = await import(new URL("../dist/index.js", import.meta.url));
const { SUBTYPES } = await import(new URL("../dist/verticals.js", import.meta.url));
const { default: handler } = await import(new URL("../netlify/functions/mcp.mjs", import.meta.url));

let nextId = 1;
const call = async (name, args) => {
  const r = await handler(new Request("https://x.gtmhelix.com/mcp", { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" }, body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method: "tools/call", params: { name, arguments: args } }) }));
  const j = await r.json();
  return j.result.content.map((c) => c.text).join("\n");
};

const fm = SUBTYPES.find((s) => s.id === "freight-marketplace");
const parts = committeeParts({ committee: fm.notes.committee });

const LOADLANE = {
  product_description: "Online freight marketplace and software where shippers compare rates and book capacity from carriers, with the platform taking a share of each booking",
  problem_solved: "Shippers spend hours finding capacity and booking loads by phone, and carriers drive back empty",
  target_company_type: "manufacturers and distributors that move full truckloads",
};

test("the signer of a freight marketplace is the shipper side, not the carrier side", () => {
  assert.match(parts.signer, /shipper/i, parts.signer);
  assert.match(parts.signer, /logistics|procurement/i, parts.signer);
  assert.doesNotMatch(parts.signer, /carrier|dispatcher/i, parts.signer);
  assert.ok(!/^on the /i.test(parts.signer), `signer starts with a side phrase: ${parts.signer}`);
});

test("the champion is the transport planning lead, who books the loads", () => {
  assert.match(parts.champion, /transport planning|planner/i, parts.champion);
  assert.equal(parts.championInferred, false);
});

test("carrier owners and dispatchers are daily users, not the buyer", () => {
  assert.ok(parts.users, "no users clause");
  assert.match(parts.users, /carrier/i, parts.users);
  assert.match(parts.users, /dispatcher/i, parts.users);
});

test("finance and IT stay as reviewers with what they check", () => {
  const roles = parts.reviewers.map((r) => r.role.toLowerCase());
  assert.ok(roles.some((r) => /finance/.test(r)), roles.join("|"));
  assert.ok(roles.some((r) => /\bit\b/.test(r)), roles.join("|"));
});

test("no sub-type committee sentence yields a signer that starts with a side phrase", () => {
  for (const s of SUBTYPES) {
    const p = committeeParts({ committee: s.notes.committee });
    assert.ok(!/^on the /i.test(p.signer), `${s.id}: signer "${p.signer}"`);
  }
});

const roleUnder = (t, heading) => { const ls = t.split("\n"); const i = ls.findIndex((l) => l.startsWith(heading)); return i < 0 ? "" : (ls.slice(i, i + 4).find((l) => l.includes("Most Likely Role")) || ""); };

test("impact_identify_champions for a freight marketplace names the shipper side as economic buyer and the transport planning lead as champion", async () => {
  const t = await call("impact_identify_champions", LOADLANE);
  const buyer = roleUnder(t, "### Economic Buyer");
  const champ = roleUnder(t, "### Primary Champion");
  assert.match(buyer, /shipper/i, buyer);
  assert.match(buyer, /logistics|procurement/i, buyer);
  assert.doesNotMatch(buyer, /carrier|dispatcher/i, buyer);
  assert.match(champ, /transport planning/i, champ);
  assert.doesNotMatch(t, /On the carrier side the owner or dispatcher/i);
  assert.match(t, /Carrier owners and dispatchers use it every day/);
});
