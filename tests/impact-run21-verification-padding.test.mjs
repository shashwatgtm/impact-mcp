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
  const client = new Client({ name: 'impact-run21-verification', version: '1.0.0' });
  await client.connect(clientSide);
  try {
    const out = await client.callTool({ name: 'impact_full_audit', arguments: args });
    return out.content.filter((x) => x.type === 'text').map((x) => x.text).join('\n');
  } finally {
    await client.close();
  }
}

const checklist = (text) => text.split('\n').filter((line) => /^\| \*\*[IMPACT]\*\*:/.test(line));

test('verification: favorable keyword and length padding cannot change checklist presence', async () => {
  const plain = await call(BASE);
  const padded = await call(PADDED);
  assert.deepEqual(checklist(plain), checklist(padded));
  for (const out of [plain, padded]) {
    assert.match(out, /Input completeness checklist/);
    assert.doesNotMatch(out, /Grade:|Input completeness score|\/100/);
  }
});

test('verification: irrelevant long prose cannot improve checklist presence', async () => {
  const plain = await call(BASE);
  const long = await call({ ...BASE, product_description: `${BASE.product_description} ${'Unrelated filler sentence. '.repeat(80)}` });
  assert.deepEqual(checklist(plain), checklist(long));
});

test('verification: contradictory filler cannot improve checklist presence', async () => {
  const plain = await call(BASE);
  const contradictory = await call({ ...PADDED, product_description: `${PADDED.product_description} It is also not a workflow tool and has no customers.` });
  assert.deepEqual(checklist(plain), checklist(contradictory));
});

test('verification: placeholder competitors do not create a public quality grade', async () => {
  const out = await call({ ...BASE, competitors: ['Competitor A', 'Competitor B', 'Competitor C'] });
  assert.match(out, /Input completeness checklist/);
  assert.doesNotMatch(out, /Grade:|Input completeness score|\/100|commercial recommendation/i);
});
