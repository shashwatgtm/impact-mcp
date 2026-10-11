// Run 27B (test first): two worst lines of impact_anchor_market on a test pool, traced to rw-impact.ts segmentFacts (fault: sentence template).
// A clause from the sector notes was forced into a noun slot ("whether a trials and self serve where buyers expect them is how ... buyers start"),
// and a buyer group typed as a segment was put where an industry goes ("who signs $4,800 in owners"). Plain words only (rule B81).
// Run: node --test tests/run27b-input.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

const { segmentFacts } = await import(new URL("../src/rw-impact.ts", import.meta.url));
const ctx = (seg, motion, signer = "the owner or operations director") => ({
  seg, deal: "$4,800", cycle: "30 days", signer, motion, objections: [{ objection: "We already use spreadsheets", response: "Show the time lost each week." }],
  metrics: ["hours saved per week", "uptime"], parts: [], fit: [], usedObjections: new Set(), usedMeasures: new Set(), usedKinds: new Map(),
});
const all = (seg, motion, signer) => [0, 1, 2, 3].flatMap((o) => segmentFacts(ctx(seg, motion, signer), o));

test("impact_anchor_market: a plural clause from the sector notes is never put in the slot for one way to start", () => {
  const motion = "Product led: trials and self serve where buyers expect them, then a sales assisted expansion to the wider company.";
  for (const seg of ["insurance carriers", "banks", "federal agencies", "mid-market software companies", "retail chains"]) {
    for (const f of all(seg, motion)) assert.doesNotMatch(f, /\ba trials\b|where buyers expect them is how/, f);
  }
});

test("impact_anchor_market: a segment that is a group of people is not written as a place ('in owners')", () => {
  for (const seg of ["owners", "architects", "general contractors"]) {
    for (const f of all(seg, "A pilot on one project, then a rollout to every site.")) assert.doesNotMatch(f, new RegExp(`\\bin ${seg}\\b`), f);
  }
});
