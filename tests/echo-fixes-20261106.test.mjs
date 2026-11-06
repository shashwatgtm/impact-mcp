// Echo fix, row 4: impact_pinpoint_value. A finance buyer gets finance framing; a head of customer operations gets operational framing.
// Run: node --no-warnings --test tests/echo-fixes-20261106.test.mjs  (after npm run build)
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const {default:handler}=await import('../netlify/functions/mcp.mjs');
const pair=JSON.parse(readFileSync(new URL('./fixtures/echo-pairs-20261106.json',import.meta.url),'utf8')).find(p=>p.row===4);
const call=async(args)=>{
 const r=await handler(new Request('https://example.com/mcp',{method:'POST',headers:{'content-type':'application/json',accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:pair.tool,arguments:args}})}));
 const j=await r.json();assert.ok(j.result&&j.result.content,JSON.stringify(j).slice(0,300));assert.ok(!j.result.isError,j.result.content[0].text.slice(0,300));
 return j.result.content.map(c=>c.text).join('\n');
};
const between=(t,a,b)=>{const i=t.indexOf(a);assert.ok(i>=0,'missing '+a);return t.slice(i,t.indexOf(b,i));};
test('Row 4: a CFO buyer gets finance framing, a head of customer operations gets operational framing',async()=>{
 const base=await call(pair.base),changed=await call(pair.changed);
 const fin=between(changed,'## Finance framing','## Proof Point Framework');
 for(const w of [/cash/i,/payback/i,/risk/i,/predictab|committed/i,/The metric finance signs off/,/Finance proof to ask for/,/invoices/i])assert.match(fin,w);
 assert.doesNotMatch(changed,/## Operational framing/);
 const ops=between(base,'## Operational framing','## Proof Point Framework');
 for(const w of [/coverage/i,/staffing/i,/handoff/i,/The metric operations signs off/,/Operational proof to ask for/])assert.match(ops,w);
 assert.doesNotMatch(base,/## Finance framing/);assert.doesNotMatch(ops,/payback/i);assert.doesNotMatch(fin,/Handoff/);
 const strip=t=>t.replace(/heads of customer operations|chief financial officers/gi,'BUYER');
 assert.notEqual(strip(ops),strip(fin));
 assert.ok(!/[—–]/.test(fin));
});
test('Row 4: no figure is added to the finance framing',async()=>{
 const t=await call(pair.changed);
 const fin=between(t,'## Finance framing','## Proof Point Framework');
 const numbers=(fin.replace(/\n\d\. /g,'\n').match(/\$?\d[\d,]*(?:\.\d+)?/g)||[]).map(x=>x.replace(/^\$/,''));
 assert.deepEqual(numbers,[]);
 assert.ok(t.includes('172,800'),'the supplied figure stays in the proof section');
});
test('Row 4: the same input gives the same output',async()=>{
 assert.equal(await call(pair.changed),await call(pair.changed));
});
