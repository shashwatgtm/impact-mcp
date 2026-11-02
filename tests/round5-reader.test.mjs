import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import handler from '../netlify/functions/mcp.mjs';
const cases=JSON.parse(readFileSync(new URL('./fixtures/round5-reader-cases.json',import.meta.url),'utf8'));
for(const c of cases)test('Round 5 reader contract: '+c.tool,async()=>{
 const response=await handler(new Request('https://example.com/mcp',{method:'POST',headers:{'content-type':'application/json',accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:c.tool,arguments:c.args}})}));
 const r=(await response.json()).result;assert.ok(r&&!r.isError);
 const text=r.content.filter(x=>x.type==='text').map(x=>x.text).join('\n');
 assert.match(text,/## Reading the answer/);
 assert.match(text,/The conclusion needs review if|Change scope if|Evidence that could change this conclusion:/);
 for(const role of ['Founder','CEO','CMO','CRO','Demand generation head'])assert.match(text,new RegExp('(?:^|\\n)'+role+':'));
 assert.doesNotMatch(text,/_{3,}|icp firmographics\.(?:industries|company sizes|locations)|\[(?:Your name|Competitor A|YOUR WHITESPACE|target customer)\]/);
});


test('Round 5: an unmeasured outcome is held outside the customer observation list',async()=>{
 const args={product_description:'Invoice processing service',target_customer:'AP heads at insurers',problem_solved:'Invoices wait for approval',customer_feedback:'One AP head said visibility improved; processing time and error rate are not measured.'};
 const response=await handler(new Request('https://example.com/mcp',{method:'POST',headers:{'content-type':'application/json',accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:2,method:'tools/call',params:{name:'impact_full_audit',arguments:args}})}));
 const r=(await response.json()).result;assert.ok(!r.isError);const text=r.content[0].text;
 const proof=text.split('## Proof You Already Have')[1].split('## Your Current Positioning')[0];
 assert.match(proof,/held out of proof:[\s\S]*processing time and error rate are not measured/);
 const observations=proof.split('Customer observations you supplied')[1];
 assert.match(observations,/One AP head said visibility improved/);
 assert.doesNotMatch(observations,/processing time and error rate are not measured/);
 assert.doesNotMatch(text,/, solved/);
});


test('Round 5: a denied customer segment is not described as a current customer match',async()=>{
 const args={product_description:'Contract review software',potential_segments:['Legal teams at SaaS companies','Procurement teams at manufacturers'],current_customers:'Three SaaS legal teams; no manufacturing customers yet.',customer_pain:'Slow contract review',average_deal_size:'$24000 annual'};
 const response=await handler(new Request('https://example.com/mcp',{method:'POST',headers:{'content-type':'application/json',accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:3,method:'tools/call',params:{name:'impact_anchor_market',arguments:args}})}));
 const r=(await response.json()).result;assert.ok(!r.isError);const text=r.content[0].text;
 const segment=text.split('\n').find(line=>line.startsWith('**Procurement teams at manufacturers**'));
 assert.ok(segment);assert.doesNotMatch(segment,/Your customers share/);
 assert.match(text,/no manufacturing customers yet/);
});
