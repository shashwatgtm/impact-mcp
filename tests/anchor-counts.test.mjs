import assert from 'node:assert/strict';
import test from 'node:test';
import handler from '../netlify/functions/mcp.mjs';

async function call(args) {
  const response = await handler(new Request('https://local.invalid/mcp', {
    method: 'POST', headers: {'content-type': 'application/json', accept: 'application/json, text/event-stream'},
    body: JSON.stringify({jsonrpc: '2.0', method: 'tools/call', id: 1,
      params: {name: 'impact_anchor_market', arguments: args}})
  }));
  const message = await response.json();
  assert.ok(message.result && !message.result.isError, JSON.stringify(message).slice(0,500));
  return message.result;
}

const scenarios = [
  [
    "B2B SaaS",
    "Subscription billing software",
    "Software vendors",
    "Resellers"
  ],
  [
    "fintech",
    "Payment reconciliation",
    "Regional banks",
    "Credit unions"
  ],
  [
    "HR tech",
    "Shift scheduling software",
    "Retail employers",
    "Care providers"
  ],
  [
    "sales tech",
    "Call coaching software",
    "Logistics sales teams",
    "Manufacturing sales teams"
  ],
  [
    "ops tech",
    "Equipment maintenance planning",
    "Plants",
    "Fleet operators"
  ],
  [
    "ITeS",
    "Managed application support",
    "Retail operators",
    "Industrial operators"
  ],
  [
    "AI-native",
    "Support agent with human escalation",
    "Travel platforms",
    "Retail marketplaces"
  ],
  [
    "cybersecurity",
    "Cloud exposure management",
    "Cloud hosts",
    "Software publishers"
  ],
  [
    "martech",
    "Consent measurement software",
    "Media publishers",
    "Agencies"
  ]
];
for (const [vertical, product, first, second] of scenarios) {
  test(vertical + ' splits the supplied total and reconciles all three columns', async () => {
    const args = {product_description: product, potential_segments: [first, second],
      company_counts: '1,400 companies split equally across the two segments',
      average_deal_size: '$36,000', percent_matching_icp: 40, year_one_share_percent: 5};
    const result = await call(args);
    assert.deepEqual(await call(args), result);
    const text = result.content[0].text;
    for (const label of [first, second]) assert.ok(text.includes(
      '| ' + label + ' | 700 | $25,200,000 | $10,080,000 | $504,000 |'));
    assert.ok(text.includes('| Total | 1,400 | $50,400,000 | $20,160,000 | $1,008,000 |'));
    assert.match(text, /TAM = 700 companies/);
  });
}

test('overlapping names, zero counts and missing allocations retain their scope', async () => {
  const args = {product_description: 'Invoice matching software', potential_segments: ['Banks', 'Regional banks'],
    average_deal_size: '$100', percent_matching_icp: 50, year_one_share_percent: 10};
  const sized = (await call({...args, company_counts: 'Regional banks: 10; Banks: 0'})).content[0].text;
  assert.ok(sized.includes('| Banks | 0 | $0 | $0 | $0 |'));
  assert.ok(sized.includes('| Regional banks | 10 | $1,000 | $500 | $50 |'));
  for (const company_counts of ['1,401 companies split equally across two segments',
    '1,400 companies split equally across three segments', '1,400 companies across both segments']) {
    const text = (await call({...args, company_counts})).content[0].text;
    assert.match(text, /TAM: cannot be calculated yet/);
    assert.doesNotMatch(text, /\| Total \|/);
  }
});

test('combined columns add the rounded USD cents shown for each segment', async () => {
  const r = await call({product_description: 'Metered billing', potential_segments: ['East', 'West'],
    company_counts: 'East: 1; West: 1', average_deal_size: '$1', percent_matching_icp: 0.5, year_one_share_percent: 100});
  assert.ok(r.content[0].text.includes('| Total | 2 | $2 | $0.02 | $0.02 |'));
});
