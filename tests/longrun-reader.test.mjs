import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import handler from '../netlify/functions/mcp.mjs';
const cases=JSON.parse(readFileSync(new URL('./fixtures/round5-reader-cases.json',import.meta.url),'utf8'));
async function call(name,args){
 const response=await handler(new Request('https://example.com/mcp',{method:'POST',headers:{'content-type':'application/json',accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:args}})}));
 const result=(await response.json()).result;assert.ok(result&&!result.isError);
 return result.content.filter(x=>x.type==='text').map(x=>x.text).join('\n');
}
const roles=text=>text.split('\n').filter(x=>/^(?:Founder|CEO|CMO|CRO|Demand generation head):/.test(x));
const args=name=>cases.find(x=>x.tool===name).args;
test('Champion advice follows the buyer and amount without granting authority to a title',async()=>{
 const a=args('impact_identify_champions'),first=roles(await call('impact_identify_champions',a));
 assert.equal(first.length,5);assert.match(first[0],/Regional fleets with 50 to 250 vehicles/);assert.match(first[1],/24000.*approval evidence/);
 assert.match(first[3],/introduction to the actual approver/);
 const next=roles(await call('impact_identify_champions',{...a,product_description:'Cybersecurity alert review',target_company_type:'Banks with an internal SOC',problem_solved:'SOC staff cannot review the overnight queue',price_point:'$90000 annual'}));
 for(let i=0;i<5;i++)assert.notEqual(first[i],next[i]);
 assert.match(next[1],/90000/);assert.doesNotMatch(next.join('\n'),/Regional fleets|24000/);
});
test('Market actions separate supplied fit and share from observed evidence and retain unknown counts',async()=>{
 await assert.rejects(()=>call('impact_anchor_market',{...args('impact_anchor_market'),percent_matching_icp:0,year_one_share_percent:0}));
 const text=await call('impact_anchor_market',{...args('impact_anchor_market'),percent_matching_icp:2,year_one_share_percent:0.5});
 const lines=roles(text);assert.match(lines[0],/missing count unknown/);assert.match(lines[1],/assumed 0.5%.*planning period/);assert.match(lines[2],/2%.*separate account sample/);assert.match(lines[3],/24000.*90 days.*completed deals/);
 assert.doesNotMatch(lines.join('\n'),/NaN|undefined|guaranteed/);
});
test('An unmeasured message retains the hold while its advice follows the buyer and claim',async()=>{
 const a=args('impact_craft_message'),text=await call('impact_craft_message',a),lines=roles(text);
 assert.match(text,/NOT PROVED YET|Unproved|Use not approved/);assert.match(lines[0],/Prioritized alert queue with named owners.*hypothesis.*SOC managers/);
 assert.match(lines[1],/hold external use.*evidence owner/);assert.match(lines[2],/unmeasured outcomes remain unproved/);assert.match(lines[4],/out of distribution.*checks pass/);
 const changed=roles(await call('impact_craft_message',{...a,target_customer:'Dispatch managers at regional fleets',key_benefit:'One shared route exception queue'}));
 assert.match(changed[4],/One shared route exception queue.*Dispatch managers/i);assert.doesNotMatch(changed.join('\n'),/SOC managers|Prioritized alert queue/);
});
test('Observed pilot results remain limited by attribution and source scope in value advice',async()=>{
 const text=await call('impact_pinpoint_value',args('impact_pinpoint_value')),lines=roles(text),reading=text.split('## Reading the answer')[1];
 assert.match(reading,/do not on their own prove/);assert.match(lines[2],/baseline, period and sample.*attribution limits/);assert.match(lines[3],/Network operations directors.*what would fail the acceptance check/);
 assert.doesNotMatch(reading,/guarantees|proves that.*caused/);
});
