import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {runSegmentMessage,reviewReceipt,containsFigure} from '../dist/segment-message.js';
import {default as handler} from '../netlify/functions/mcp.mjs';
const known=JSON.parse(readFileSync(new URL('./fixtures/segment-message-known.json',import.meta.url)));
const rpc=async(method,params={})=>{const r=await handler(new Request('https://local.invalid/mcp',{method:'POST',headers:{'content-type':'application/json',accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params})}));return(await r.json()).result;};
const invoke=(name,args)=>rpc('tools/call',{name,arguments:args});
const choices={confirmed:true,champion:'Security lead',champion_segment:'security leads at mid-size US regional banks',alternative:known.alternatives[0]};
const map=b=>runSegmentMessage({stage:'map',brief:b},invoke);
const message=(b=known,c=choices)=>runSegmentMessage({stage:'message',brief:b,review_receipt:reviewReceipt(b),choices:c},invoke);
const data=r=>{assert.ok(!r.isError,r.content[0].text);return r.structuredContent;};
test('known answer and gaps 1, 4, 5, 6, 7, 8: ordered pause, hypotheses, lexical limit, alignment and buyer test',async()=>{
 const m=await map(known),r=await message();
 assert.match(m.content[0].text,/Status: Role hypothesis; champion unconfirmed/);assert.equal(data(m).status,'awaiting_choices');assert.equal(data(m).buyer_lines,undefined);
 assert.match(m.content[0].text,/Lexical matches identify questions to test. They do not prove/);assert.match(m.content[0].text,/Translate the generic role title/);
 assert.match(r.content[0].text,/Unproved value hypothesis/);assert.match(r.content[0].text,/Proof you have: none given for the result yet/);
 const d=data(r);assert.ok(d.buyer_lines.every(s=>s.startsWith('Unproved hypothesis:')&&!containsFigure(s)));
 assert.equal(d.steps[0].inputs.target_customer,choices.champion_segment);assert.equal(d.steps[1].inputs.competitor,choices.alternative);
 assert.ok(d.proof_plan.includes('Trigger: '+known.trigger));assert.ok(d.proof_plan.includes('Measure: '+known.measure));assert.ok(d.proof_plan.includes('Mechanism: '+known.capability));
 assert.match(d.warnings.join(' '),/Problem fragment/);assert.match(d.category_question,/category word/);assert.equal(d.buyer_test_questions.length,5);
 assert.ok(r.content[0].text.indexOf('## Proof gaps')<r.content[0].text.indexOf('## Questions about the current approach'));
 assert.ok(r.content[0].text.indexOf('## Questions about the current approach')<r.content[0].text.indexOf('## Message: first draft'));
 assert.deepEqual(await message(),r);assert.deepEqual(await map(known),m);
});
test('gap 1: cannot skip the pause, reuse a changed brief, or omit human confirmation',async()=>{
 for(const args of [
  {stage:'message',brief:known,choices},
  {stage:'message',brief:known,review_receipt:reviewReceipt(known),choices:{...choices,confirmed:false}},
  {stage:'message',brief:{...known,problem:'A different problem'},review_receipt:reviewReceipt(known),choices},
  {stage:'message',brief:known,review_receipt:reviewReceipt(known),choices:{...choices,alternative:'An alternative never mapped'}},
 ])assert.equal((await runSegmentMessage(args,invoke)).isError,true);
 assert.equal((await message(known,{...choices,champion_segment:'Security leads at insurers'})).isError,true);
});
test('gap 2: multiple segments are refused, including a composite segment',async()=>{
 for(const segments of [[],['banks','insurers'],['banks and insurers'],['banks; software firms']]){const r=await map({...known,segments});assert.equal(r.isError,true);assert.match(r.content[0].text,/One segment per run/);}
});
test('gap 3: illustrative results never reach value inputs, message inputs or buyer lines, including spelled figures',async()=>{
 for(const result of ['Illustrative pilot: 12 days down to 1 day','Illustrative pilot: twelve days down to one day']){
  const b={...known,proof:{kind:'illustrative',result,source:'https://example.invalid/illustrative',period:'A pilot month'}};
  const d=data(await message(b));assert.ok(d.buyer_lines.every(s=>!containsFigure(s)));assert.equal(d.steps[0].inputs.customer_metrics,undefined);assert.ok(!JSON.stringify(d.steps).includes(result));
 }
 for(const field of ['product','category','problem','desired_outcome','capability','agreed_claim']){
  const b={...known,[field]:'Illustrative pilot from 12 days to 1 day'};const d=data(await message(b));assert.ok(d.buyer_lines.every(s=>!containsFigure(s)));assert.ok(d.held.length);
 }
});
test('coordinator: agreed workshop claim is the starting point, while numeric unproved claims are held',async()=>{
 const agreed_claim='Reduce the time from a leaked credential finding to a named owner';const b={...known,agreed_claim};const d=data(await message(b));
 assert.equal(d.buyer_lines[0],'Unproved hypothesis: '+agreed_claim);assert.equal(d.steps[0].inputs.key_outcome,agreed_claim);assert.equal(d.steps[1].inputs.key_benefit,agreed_claim);
 assert.match((await map(b)).content[0].text,/Workshop starting claim/);
});
test('coordinator: maps start side by side, independently, with exact brief handoffs',async()=>{
 const calls=[];let release;const barrier=new Promise(r=>release=r);
 const delayed=async(name,args)=>{calls.push({name,args});if(calls.length===2)release();await barrier;return {content:[{type:'text',text:name}]};};
 const r=await runSegmentMessage({stage:'map',brief:known},delayed);assert.equal(calls.length,2);assert.equal(calls[0].args.target_company_type,known.segments[0]);assert.deepEqual(calls[1].args.competitors,known.alternatives);assert.equal(data(r).status,'awaiting_choices');
});
test('coordinator: no sales kit action without a real customer result; incomplete and scale proof are not enough',async()=>{
 for(const proof of [{kind:'none'},{kind:'illustrative',result:'Pilot from 12 days to 1 day'},{kind:'customer_result',result:'Time fell from 12 days to 1 day'}, {kind:'customer_result',result:'Serves 250 enterprises',source:'https://example.invalid/report',period:'The last year'}]){
  const d=data(await message({...known,proof}));assert.deepEqual(d.actions.map(a=>a.label),['Draft discovery questions']);assert.ok(d.actions[0].prompt.includes('competitive_trap_setter'));
 }
 const b={...known,proof:{kind:'customer_result',result:'A bank reduced the time from a leaked credential finding to a named owner from 12 days to 1 day',source:'https://example.invalid/approved-customer-result',period:'The customer pilot month'}};
 const d=data(await message(b));assert.deepEqual(d.actions.map(a=>a.label),['Run the sales kit','Draft discovery questions']);assert.ok(d.steps[0].inputs.customer_metrics.includes(b.proof.source));
});
const verticals={
 logistics:['Dispatchers cannot show who owns a delayed delivery.','The dispatch team has no record of the person handling a late delivery.','Dispatchers can show the owner of each delayed delivery.'],
 fintech:['Reconciliation leads cannot show who owns an unsettled payment.','The payments team has no record of the person handling a settlement exception.','Reconciliation leads can show the owner of each unsettled payment.'],
 saas:['Customer leads cannot show who owns an at risk renewal.','The account team has no record of the person handling a renewal risk.','Customer leads can show the owner of each at risk renewal.'],
 vertical_saas:['Scheduling leads cannot show who owns a missed appointment.','The scheduling team has no record of the person following up a missed visit.','Scheduling leads can show the owner of each missed appointment.'],
 ai_native:['Support leads cannot show who owns an unresolved request.','The support team has no record of the person handling an unresolved request.','Support leads can show the owner of each unresolved request.'],
 ites:['Service leads cannot show who owns a failed handoff.','The service team has no record of the person handling a failed handoff.','Service leads can show the owner of each failed handoff.'],
 telecom:['Network leads cannot show who owns an unresolved outage.','The network team has no record of the person handling an outage.','Network leads can show the owner of each unresolved outage.'],
 software:['Release leads cannot show who owns a failed deployment.','The release team has no record of the person handling a failed deployment.','Release leads can show the owner of each failed deployment.'],
 cybersecurity:['Security leads cannot show who acted on a leaked credential finding.','The security team has no record of the person handling a leaked credential.','Security leads can show who acted on each leaked credential finding.'],
};
for(const [sector,problems]of Object.entries(verticals))test(`free text exact, equivalent and opposite: ${sector}`,async()=>{
 const alternativeText=['The in-house process has no dated record.','Internal searches do not leave a dated trail.','The in-house process keeps a dated record.'];
 const out=[];
 for(let i=0;i<3;i++){const b={...known,sector,problem:problems[i],weak_points:alternativeText[i]};const r=await map(b);const d=data(r);assert.ok(d.champion_map.includes(problems[i]),problems[i]);assert.equal(d.steps[1].inputs.competitor_weaknesses,alternativeText[i]);out.push(r.content[0].text);}
 assert.notEqual(out[0],out[2]);
});
test('approved guide company exercises stay illustrative and route to discovery',async()=>{
 for(const [product,segment]of [['CloudSEK','mid-size US regional banks'],['Juspay','mid-size banks moving card payments'],['HappyRobot','mid-size freight brokers'],['Darwinbox','US mid-market HR teams'],['Emergent','agencies building client apps']]){
  const b={...known,product,segments:[segment],proof:{kind:'illustrative',result:'An illustrative pilot improved the handoff'}};const r=await message(b,{...choices,champion_segment:'Operations leads at '+segment});const d=data(r);assert.ok(d.buyer_lines.every(s=>s.startsWith('Unproved hypothesis:')));assert.deepEqual(d.actions.map(a=>a.label),['Draft discovery questions']);
 }
});
test('the supplied sector reaches both independent maps and both message tools',async()=>{
 for(const sector of ['logistics_tech','fintech','saas','vertical_saas','ai_native','ites','telecom','software','cybersecurity']){
  const b={...known,sector};const mapped=data(await map(b)),draft=data(await message(b));
  for(const step of [...mapped.steps,...draft.steps])assert.equal(step.inputs.your_sector,sector);
 }
});
