// Host review, 28 October 2026 (proposed, not deployed): a company size in employees is not the HR team, and a line that says
// evidence is missing is never shown as proof. Invented companies only. Run: node --no-warnings --test tests/host-review-20261028.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

const { default: handler } = await import(new URL("../netlify/functions/mcp.mjs", import.meta.url));
let nextId = 1;
const call = async (name, args) => {
  const r = await handler(new Request("https://x.gtmhelix.com/mcp", {
    method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method: "tools/call", params: { name, arguments: args } }),
  }));
  return (await r.json()).result.content.map((c) => c.text).join("\n");
};

test("impact_identify_champions: '200 to 1000 employees' in target_company_type does not make the buyer HR; the revenue operations problem leads", async () => {
  const t = await call("impact_identify_champions", {
    company_name: "Pipewell", product_description: "CRM workflow management software",
    problem_solved: "Revenue operations teams spend time reconciling inconsistent pipeline records",
    target_company_type: "B2B software firms with 200 to 1000 employees", your_sector: "saas",
  });
  assert.doesNotMatch(t, /Head of HR|CHRO|Team view: people/);
  assert.match(t, /Revenue Operations|Chief Revenue Officer/);
});

test("impact_identify_champions: a buyer that really is HR is still read as HR", async () => {
  const t = await call("impact_identify_champions", {
    company_name: "Pipewell", product_description: "Payroll and onboarding software",
    problem_solved: "HR teams lose days to payroll errors and slow onboarding", target_company_type: "HR teams at firms with 500 employees", your_sector: "saas",
  });
  assert.match(t, /Head of HR or People Operations/);
});

test("impact_pinpoint_value: 'No verified outcome metrics supplied' is not listed as social proof, and a result is still asked for", async () => {
  const t = await call("impact_pinpoint_value", {
    product_name: "Pipewell CRM", target_customer: "Revenue operations directors at B2B software firms", key_outcome: "Reduce manual pipeline reconciliation",
    unique_capability: "a shared account activity view", customer_metrics: "No verified outcome metrics supplied", business_model: "saas", your_sector: "saas",
  });
  assert.doesNotMatch(t, /Scale and voices you supplied[^\n]*No verified outcome metrics supplied/);
  assert.match(t, /customer_metrics \(one real customer result with its source\)/);
});

test("impact_full_audit: 'No verified interviews supplied' is not a proof point or a result customers describe", async () => {
  const t = await call("impact_full_audit", {
    company_name: "Pipewell", product_description: "CRM software", target_customer: "Revenue operations directors at B2B software firms",
    problem_solved: "Disconnected customer activity records", key_differentiation: "shared lifecycle view", competitors: ["Ledgerline"],
    customer_feedback: "No verified interviews supplied", business_model: "saas", your_sector: "saas",
  });
  assert.doesNotMatch(t, /as proof points[^]*?- No verified interviews supplied/);
  assert.doesNotMatch(t, /the result your customers describe: "No verified interviews supplied"/);
});

test("impact_pinpoint_value: a real result is still placed as a customer result", async () => {
  const t = await call("impact_pinpoint_value", {
    product_name: "Pipewell CRM", target_customer: "Revenue operations directors", key_outcome: "Reduce manual reconciliation",
    unique_capability: "a shared account activity view", customer_metrics: "Reconciliation time down from 6 hours to 2 hours a week at one customer", business_model: "saas",
  });
  assert.match(t, /6 hours to 2 hours/);
});
