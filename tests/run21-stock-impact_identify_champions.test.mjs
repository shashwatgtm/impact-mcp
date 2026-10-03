// Run 21b step 2 (test first): impact_identify_champions printed the same measures in the same order for every company of a kind, whatever
// problem the user typed. The measures a sector watches are now ordered by the user's own problem and product words, so the line
// "Personal motivation", the first validation question and the economic buyer question lead with the measure the company's problem is about.
// Companies are described in plain words (no names). Run: node --test tests/run21-stock-impact_identify_champions.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

const { default: handler } = await import(new URL("../netlify/functions/mcp.mjs", import.meta.url));
let nextId = 1;
const call = async (args) => {
  const r = await handler(new Request("https://x.gtmhelix.com/mcp", { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" }, body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method: "tools/call", params: { name: "impact_identify_champions", arguments: args } }) }));
  const j = await r.json();
  return j.result.content.map((c) => c.text).join("\n");
};
const line = (t, label) => (t.split("\n").find((l) => l.includes(label)) || "");

const LASTMILE = { product_description: "Delivery management software that plans last mile routes and gives drivers a proof of delivery app", problem_solved: "Failed first deliveries and customers calling to ask where the parcel is", target_company_type: "online retailers" };
const FREIGHT = { product_description: "A freight marketplace that matches shippers with truckload carriers", problem_solved: "Shippers spend hours finding capacity and booking loads by phone", target_company_type: "manufacturers" };
const EXPENSE = { product_description: "Spend management software with expense claims, approvals and corporate cards", problem_solved: "Employees submit receipts weeks late and approvals sit in inboxes", target_company_type: "mid-size companies" };
const PAYAPI = { product_description: "Payments API for merchants: accept cards and bank transfers and pay out to sellers", problem_solved: "Developers wait weeks to take a first payment live", target_company_type: "online platforms" };

test("logistics: a last mile company and a freight marketplace each lead with the measure their problem is about, and neither gets the other's", async () => {
  const a = await call(LASTMILE), b = await call(FREIGHT);
  assert.match(line(a, "Personal motivation"), /what this sector measures: first attempt delivery rate/, line(a, "Personal motivation"));
  assert.match(line(b, "Personal motivation"), /what this sector measures: time to book a load/, line(b, "Personal motivation"));
  assert.match(a, /Who is responsible for first attempt delivery rate today/);
  assert.match(b, /Who is responsible for time to book a load today/);
  assert.match(a, /Which of these would this move for you: first attempt delivery rate/);
  assert.match(b, /Which of these would this move for you: time to book a load/);
  assert.doesNotMatch(a, /load fill rate|time to book a load|carrier acceptance/i);
  assert.doesNotMatch(b, /first attempt|cost per delivery|deliveries per vehicle/i);
});

test("fintech: a spend and expense company and a payments API company lead with their own measure", async () => {
  const a = await call(EXPENSE), b = await call(PAYAPI);
  assert.match(line(a, "Personal motivation"), /what this sector measures: approval cycle time/, line(a, "Personal motivation"));
  assert.match(line(b, "Personal motivation"), /what this sector measures: time to first live payment/, line(b, "Personal motivation"));
  assert.doesNotMatch(a, /payment success rate|authorisation rate|chargeback/i);
  assert.doesNotMatch(b, /days to close the books|policy breach|reconciliation effort/i);
});

test("a problem that shares no word with the measures keeps the sector's usual order (nothing is dropped, nothing is invented)", async () => {
  const a = await call({ ...LASTMILE, problem_solved: "Our operations team is overloaded" });
  assert.match(line(a, "Personal motivation"), /what this sector measures: cost per delivery, first attempt delivery rate, on time delivery, deliveries per vehicle per day/);
});

test("the measures shown are always measures of the sector file, whatever the problem says", async () => {
  const a = await call({ ...LASTMILE, problem_solved: "Zebra giraffe 12 percent savings" });
  const m = line(a, "Personal motivation").split("what this sector measures: ")[1] || "";
  for (const x of m.split(", ")) assert.match(x, /cost per delivery|first attempt delivery rate|on time delivery|deliveries per vehicle per day/);
});
