// Run 42B set Q: one team is picked only when the input names exactly one; several teams or a product for teams in general give a cross team view.
import test from "node:test";
import assert from "node:assert/strict";
import { call } from "./run22-impact-common.mjs";

const base = { product_name: "Flowdesk", category: "work management platform", key_outcome: "projects tracked to plan with shared status", unique_capability: "timeline views and automatic updates" };

test("a buyer naming several teams gets the cross team view, not marketing", async () => {
  const o = await call("impact_pinpoint_value", { ...base, target_customer: "enterprises and agencies, with teams in operations, marketing, IT and leadership", your_sector: "saas" });
  assert.match(o, /Cross team view/);
  assert.match(o, /names several teams/);
  assert.doesNotMatch(o, /CMO|cost per qualified lead|marketing-sourced pipeline/);
  assert.match(o, /time to complete/);
});

test("a work management product for teams in general is not handed to marketing by a customer example", async () => {
  const o = await call("impact_pinpoint_value", { ...base, target_customer: "teams of all kinds, such as a marketing team running campaigns", your_sector: "saas" });
  assert.doesNotMatch(o, /CMO|cost per qualified lead/);
});

test("exactly one team named still gets that team's view", async () => {
  const o = await call("impact_pinpoint_value", { ...base, target_customer: "marketing teams at mid-size companies", your_sector: "saas" });
  assert.match(o, /Team view: marketing/);
  assert.match(o, /CMO/);
});

test("sales operations names one team, not two", async () => {
  const o = await call("impact_pinpoint_value", { ...base, target_customer: "sales operations teams", your_sector: "saas" });
  assert.doesNotMatch(o, /Cross team view/);
});

test("champions tool: several teams in the buyer give cross team roles", async () => {
  const o = await call("impact_identify_champions", { product_description: "a work management platform", problem_solved: "work is scattered across tools", target_company_type: "companies with operations, marketing and IT teams" });
  assert.doesNotMatch(o, /CMO|Head of Marketing/);
});
