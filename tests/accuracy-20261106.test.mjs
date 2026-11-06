// Accuracy fixes, 6 Nov 2026: Job 15a (impact_pinpoint_value avoided cost handling).
import {test} from 'node:test';
import assert from 'node:assert/strict';
const {default:handler}=await import('../netlify/functions/mcp.mjs');

const call=async(tool,args)=>{
 const r=await handler(new Request('https://example.com/mcp',{method:'POST',headers:{'content-type':'application/json',accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:tool,arguments:args}})}));
 const j=await r.json();assert.ok(j.result&&j.result.content,JSON.stringify(j).slice(0,300));assert.ok(!j.result.isError,j.result.content[0].text.slice(0,300));
 return j.result.content.map(c=>c.text).join('\n');
};

test('15a: an avoided cost metric is printed under Cost avoided and never offered as a customer result to cite',async()=>{
 const t=await call('impact_pinpoint_value',{
  product_name:'VoiceDesk AI',
  category:'voice automation software',
  target_customer:'heads of customer operations at consumer lenders',
  key_outcome:'answer borrower calls in seconds and resolve payment reminders on the first call',
  unique_capability:'connects directly to loan servicing systems with live payment links',
  customer_metrics:'Avoids an illustrative $172,800 a year at the outsourced call centre'
 });
 assert.ok(
  t.includes("Cost avoided, as you stated it (a claim to prove with the buyer's own figures, not a customer result): Avoids an illustrative $172,800 a year at the outsourced call centre"),
  'new avoided cost line appears in Tier 1 section'
 );
 assert.ok(t.includes('You supplied no customer result, so none is quoted in this answer.'),'no customer result notice remains when only an avoided cost was given');
 assert.ok(!t.includes('Results you supplied'),'old Results you supplied line does not appear for an avoided cost');
 assert.ok(!t.includes('A result to cite:'),'avoided cost is never offered as A result to cite');
});

test('15a: when no avoided cost is present, real customer results still appear under Results you supplied and A result to cite',async()=>{
 const t=await call('impact_pinpoint_value',{
  product_name:'VoiceDesk AI',
  category:'voice automation software',
  target_customer:'heads of customer operations at consumer lenders',
  key_outcome:'answer borrower calls in seconds and resolve payment reminders on the first call',
  unique_capability:'connects directly to loan servicing systems with live payment links',
  customer_metrics:'Northwind Lending cut average handle time by 38% over 90 days'
 });
 assert.ok(
  t.includes('Results you supplied (supplied by you: use one only if it is real and you can show it): Northwind Lending cut average handle time by 38% over 90 days'),
  'existing Results you supplied line is unchanged'
 );
 assert.ok(
  t.includes('A result to cite: Northwind Lending cut average handle time by 38% over 90 days.'),
  'existing A result to cite line is unchanged'
 );
 assert.ok(!t.includes('Cost avoided, as you stated it'),'Cost avoided line does not appear when no avoided cost was given');
});
