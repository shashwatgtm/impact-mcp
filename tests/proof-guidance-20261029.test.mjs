// HubSpot and Salesforce are explicitly labelled review fixture inputs only.
// All descriptions and feedback in these tests are synthetic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../netlify/functions/mcp.mjs';
const fixture = { company_name: 'HubSpot', product_description: 'CRM software in a synthetic review scenario', target_customer: 'Revenue operations directors at B2B software firms', problem_solved: 'Disconnected customer activity records', key_differentiation: 'Synthetic assumption: shared lifecycle view', competitors: ['Salesforce'], business_model: 'saas', your_sector: 'saas' };
let id = 1;
async function call(args) {
  const response = await handler(new Request('https://synthetic.invalid/mcp', {
    method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: id++, method: 'tools/call', params: { name: 'impact_full_audit', arguments: args } }),
  }));
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.result.isError, undefined);
  return body.result.content.map(c => c.text).join('\n');
}
const section = text => text.split('## Proof You Already Have\n')[1].split('\n---')[0];
const guidance = /What a good proof point looks like in [^\n]+/;
for (const [label, feedback] of [['omitted', undefined], ['empty', ''], ['whitespace', '   \t\n'], ['missing interviews', 'No verified interviews supplied'], ['missing metrics', 'No verified outcome metrics supplied']]) {
  test(`full audit provides proof guidance with ${label} feedback`, async () => {
    const args = { ...fixture };
    if (feedback !== undefined) args.customer_feedback = feedback;
    const text = await call(args);
    const proof = section(text);
    assert.match(proof, guidance);
    assert.match(proof, /No customer feedback was supplied, so there is no proof to list/);
    assert.doesNotMatch(proof, /as proof points|No verified/);
    assert.doesNotMatch(text, /the result your customers describe: "No verified|Head of HR|CHRO|Team view: people/);
    const control = section(await call({ ...fixture, customer_feedback: 'Synthetic reviewer reports reconciliation time fell from 6 hours to 2 hours weekly' }));
    assert.equal(proof.match(guidance)[0], control.match(guidance)[0]);
  });
}
test('full audit preserves supplied feedback and prints guidance once', async () => {
  const feedback = 'Synthetic reviewer reports reconciliation time fell from 6 hours to 2 hours weekly';
  const proof = section(await call({ ...fixture, customer_feedback: feedback }));
  assert.ok(proof.includes(`Customer feedback you supplied, as proof points (use each only if it is real and you can show it):\n- ${feedback}`));
  assert.equal(proof.match(/What a good proof point looks like/g)?.length, 1);
});
test('full audit keeps company claims separate and supplies guidance', async () => {
  const proof = section(await call({ ...fixture, customer_feedback: 'More than 100 teams use this synthetic product' }));
  assert.match(proof, /Company claims you supplied/);
  assert.match(proof, /No customer result was supplied beyond the company claims above/);
  assert.match(proof, guidance);
  assert.doesNotMatch(proof, /as proof points/);
});
