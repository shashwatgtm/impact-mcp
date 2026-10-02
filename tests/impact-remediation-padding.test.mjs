import test from 'node:test';
import assert from 'node:assert/strict';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { createServer } from '../src/index.ts';

const BASE = {
  company_name: 'Acme',
  product_description: 'A workflow tool for revenue teams.',
  target_customer: 'Revenue leaders at B2B companies.',
  problem_solved: 'Teams lose time coordinating work.',
  key_differentiation: 'A practical workflow approach.',
  competitors: ['Status quo'],
  current_positioning: 'A workflow tool for revenue teams.',
  customer_feedback: 'Customers report easier coordination.'
};

const PADDED = {
  ...BASE,
  product_description: `${BASE.product_description} We are the only unique, unlike, proven, secure, reliable and category-leading solution with employees, revenue and Series detail.`,
  target_customer: `${BASE.target_customer} We serve employees, revenue teams and Series-funded companies.`,
  key_differentiation: `${BASE.key_differentiation} We are the only unique option, unlike every alternative.`,
  current_positioning: `${BASE.current_positioning} Unlike alternatives, our only unique approach is proven and reliable.`,
  customer_feedback: `${BASE.customer_feedback} Customers say the unique, proven and reliable workflow improves revenue outcomes.`
};

async function call(args) {
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  await createServer().connect(serverSide);
  const client = new Client({ name: 'impact-remediation-test', version: '1.0.0' });
  await client.connect(clientSide);
  try {
    const out = await client.callTool({ name: 'impact_full_audit', arguments: args });
    return out.content.filter((x) => x.type === 'text').map((x) => x.text).join('\n');
  } finally {
    await client.close();
  }
}

test('remediation: semantic padding cannot change the completeness checklist or restore a headline grade', async () => {
  const plain = await call(BASE);
  const padded = await call(PADDED);
  assert.doesNotMatch(plain, /Grade:/);
  assert.doesNotMatch(padded, /Grade:/);
  assert.match(plain, /## IMPACT Scorecard/);
  assert.match(plain, /Input completeness checklist/);
  const scores = (s) => s.match(/\| \*\*[IMPACT]\*\*:[^\n]+\| (\d+)\/100/g);
  assert.deepEqual(scores(plain), scores(padded));
});

test('remediation: contradictory filler does not improve the completeness checklist', async () => {
  const contradictory = { ...PADDED, product_description: `${PADDED.product_description} It is also not a workflow tool and has no customers.` };
  const plain = await call(BASE);
  const changed = await call(contradictory);
  const scores = (s) => s.match(/\| \*\*[IMPACT]\*\*:[^\n]+\| (\d+)\/100/g);
  assert.deepEqual(scores(plain), scores(changed));
});
