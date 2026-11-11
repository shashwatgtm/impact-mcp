import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {default as handler} from '../netlify/functions/mcp.mjs';import {CHAIN_RESULTS_HTML} from '../dist/chain-results-html.js';
const sha=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const fixture=JSON.parse(readFileSync(new URL('./fixtures/chain-existing-baseline.json',import.meta.url)));
const known=JSON.parse(readFileSync(new URL('./fixtures/segment-message-known.json',import.meta.url)));
const rpc=async(method,params={})=>{const response=await handler(new Request('https://local.invalid/mcp',{method:'POST',headers:{'content-type':'application/json',accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params})}));const msg=await response.json();assert.ok(!msg.error,JSON.stringify(msg));return msg.result;};
test('draft inventory has nine tools; existing eight definitions and example answers equal the base byte for byte',async()=>{
 const {tools}=await rpc('tools/list');assert.equal(tools.length,9);
 for(const f of fixture.tools)assert.equal(sha(tools.find(t=>t.name===f.name)),f.sha,f.name);
 for(const f of fixture.cases)assert.equal(sha(await rpc('tools/call',{name:f.name,arguments:f.args})),f.sha,f.name);
});
test('both calls expose the same full text through the view and stay identical in repeated and parallel requests',async()=>{
 const a=await rpc('tools/call',{name:'impact_build_segment_message',arguments:{stage:'map',brief:known}});
 assert.equal(a._meta.helixResults.text,a.content[0].text);assert.equal(a.structuredContent.status,'awaiting_choices');
 const args={stage:'message',brief:known,review_receipt:a.structuredContent.review_receipt,choices:{confirmed:true,champion:'Security lead',champion_segment:'security leads at '+known.segments[0],alternative:known.alternatives[0]}};
 const result=await rpc('tools/call',{name:'impact_build_segment_message',arguments:args});assert.equal(result.structuredContent.proof_status,'unproved_hypothesis');assert.deepEqual(result.structuredContent.actions.map(x=>x.label),['Draft discovery questions']);
 const repeat=await Promise.all(Array.from({length:3},()=>rpc('tools/call',{name:'impact_build_segment_message',arguments:args})));repeat.forEach(r=>assert.deepEqual(r,result));
 const resources=await rpc('resources/list');assert.equal(resources.resources.filter(r=>r.uri==='ui://helix/results/chains/v1.html').length,1);
 assert.equal((await rpc('resources/read',{uri:'ui://helix/results/chains/v1.html'})).contents[0].text,CHAIN_RESULTS_HTML);
});
test('derived results view has matching CSP hashes and sends choices to chat without calling a tool',()=>{
 for(const tag of ['script','style']){const body=CHAIN_RESULTS_HTML.match(new RegExp('<'+tag+'>([\\s\\S]*?)</'+tag+'>'))[1];assert.ok(CHAIN_RESULTS_HTML.includes(tag+"-src 'sha256-"+createHash('sha256').update(body).digest('base64')+"'"));}
 assert.doesNotMatch(CHAIN_RESULTS_HTML,/innerHTML|eval\(|fetch\(|localStorage|sessionStorage|document\.cookie|tools\/call/);assert.match(CHAIN_RESULTS_HTML,/ui\/message/);
});
test('invalid nested briefs, markup and explicit absence of a champion cannot pass the new gate',async()=>{
 for(const brief of [{...known,proof:[]},{...known,product:'<script>steal</script>'},{...known,problem:'![logo](https://external.invalid/track)'},{...known,segments:['unknown']}]){
  const r=await rpc('tools/call',{name:'impact_build_segment_message',arguments:{stage:'map',brief}});assert.equal(r.isError,true);assert.doesNotMatch(r.content[0].text,/<script>|!\[logo\]/);
 }
});
