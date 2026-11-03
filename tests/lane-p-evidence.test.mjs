import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import handler from '../netlify/functions/mcp.mjs';
const cases=JSON.parse(readFileSync(new URL('./fixtures/round5-reader-cases.json',import.meta.url)));
const call=async(name,args)=>{const response=await handler(new Request('https://example.com/mcp',{method:'POST',headers:{'content-type':'application/json',accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:args}})}));const b=await response.json();assert.ok(!b.error);assert.ok(!b.result.isError,JSON.stringify(b.result));return b.result.content.map(c=>c.text||'').join('\n');};

for(const value of [undefined,'','Differentiation is not established','We have no unique approach'])test('M084 differentiation hold '+String(value),async()=>{
 const seed=cases.find(x=>x.tool==='impact_full_audit'),args={...seed.args,key_differentiation:value};const first=await call(seed.tool,args);
 assert.match(first,/Difference not established/);assert.doesNotMatch(first,/> \*\*We\*\* offer (?:differentiation is not established|we have no unique approach)/i);
 assert.doesNotMatch(first,/- Differentiation: unique approach/);assert.equal(await call(seed.tool,args),first);assert.equal(await call(seed.tool,args),first);
});
