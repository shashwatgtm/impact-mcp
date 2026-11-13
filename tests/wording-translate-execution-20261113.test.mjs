import test from 'node:test';
import assert from 'node:assert/strict';
const {default: handler} = await import('../netlify/functions/mcp.mjs');

// 13 Nov 2026: Translate Execution joined "offers" to a difference written as a full sentence
// ("Our product offers our product ranks every misconfiguration ..."). A sentence about the product
// is now rebuilt with the product as its subject; a noun phrase still follows "offers".
const call = async (args) => {
  const r = await handler(new Request('https://local.invalid/mcp', {method:'POST', headers:{'content-type':'application/json', accept:'application/json, text/event-stream'}, body:JSON.stringify({jsonrpc:'2.0', id:1, method:'tools/call', params:{name:'impact_translate_execution', arguments:args}})}));
  const j = await r.json();
  return (j.result?.content || []).map(c => c.text).join('\n');
};
const sec = (diff, product) => ({positioning_statement: `For cloud security leaders at mid-size SaaS firms who drown in misconfiguration alerts, ${product || 'our product'} is a cloud posture tool that cuts alert noise. Unlike generic scanners, ${diff}`, target_customer: 'cloud security leaders at mid-size SaaS firms', key_benefit: 'Fix the misconfigurations that matter first', ...(product ? {product_name: product} : {}), your_sector: 'cybersecurity'});
const log = (diff) => ({positioning_statement: `For dispatch managers at regional 3PLs who miss delivery windows, Routewise is a route planning tool that keeps promises. Unlike spreadsheets, ${diff}`, target_customer: 'dispatch managers at regional 3PLs', key_benefit: 'Keep every delivery promise', product_name: 'Routewise', your_sector: 'logistics_tech'});
const fin = (diff) => ({positioning_statement: `For finance teams at mid-size firms who lose a week to the close, Closewise is a close assistant that cuts the close to three days. Unlike manual reconciliation, ${diff}`, target_customer: 'finance teams at mid-size firms', key_benefit: 'Close the books in three days', product_name: 'Closewise', your_sector: 'fintech'});
const carry = (t) => (t.match(/\*\*Difference to carry\*\*: (.*)/) || [])[1];
const BAD = /\boffers (?:our|my|we|the (?:product|platform|solution)|[A-Za-z]+ [a-z]{3,}s every)\b/i;

test('a difference written as a sentence about the product is rebuilt, in three verticals', async () => {
  for (const [args, want] of [
    [sec('our product ranks every misconfiguration by exploitability.'), 'The product ranks every misconfiguration by exploitability.'],
    [sec('our product ranks every misconfiguration by exploitability.', 'Skyward'), 'Skyward ranks every misconfiguration by exploitability.'],
    [sec('we rank every misconfiguration by exploitability.', 'Skyward'), 'Skyward ranks every misconfiguration by exploitability.'],
    [sec('Skyward ranks every misconfiguration by exploitability.', 'Skyward'), 'Skyward ranks every misconfiguration by exploitability.'],
    [sec('the platform ranks every misconfiguration by exploitability.', 'Skyward'), 'Skyward ranks every misconfiguration by exploitability.'],
    [log('our product replans every route when a truck runs late.'), 'Routewise replans every route when a truck runs late.'],
    [log('we replan every route when a truck runs late.'), 'Routewise replans every route when a truck runs late.'],
    [fin('our solution matches every bank line to its invoice.'), 'Closewise matches every bank line to its invoice.'],
    [fin('Closewise matches every bank line to its invoice.'), 'Closewise matches every bank line to its invoice.'],
  ]) {
    const t = await call(args);
    assert.equal(carry(t), want, args.positioning_statement);
    assert.ok(!BAD.test(t), t.match(BAD)?.[0]);
  }
});

test('a noun phrase still follows "offers"', async () => {
  for (const [args, want] of [
    [sec('a ranked list of misconfigurations by exploitability.', 'Skyward'), 'Skyward offers a ranked list of misconfigurations by exploitability.'],
    [log('live replanning of every route when a truck runs late.'), 'Routewise offers live replanning of every route when a truck runs late.'],
    [fin('automatic matching of every bank line to its invoice.'), 'Closewise offers automatic matching of every bank line to its invoice.'],
  ]) assert.equal(carry(await call(args)), want);
});
