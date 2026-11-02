import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import handler from '../netlify/functions/mcp.mjs';
import {regionNotes,NO_REGION_SUFFIX} from '../src/region-reader.ts';
import {explainSector} from '../src/verticals.ts';
import {seedCases,verticalCases,regionCases,rpc,caseArgs,sellerFields} from './p1-regions-cases.mjs';
const baseline=JSON.parse(readFileSync(new URL('./fixtures/p1-regions-no-region-baseline.json',import.meta.url),'utf8'));
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const text=r=>r.content.filter(x=>x.type==='text').map(x=>x.text).join('\n');
const removeQuestion=r=>({...r,content:r.content.map(c=>c.type==='text'&&c.text.endsWith(NO_REGION_SUFFIX)?{...c,text:c.text.slice(0,-NO_REGION_SUFFIX.length)}:c)});
const suffix=t=>t.includes('## Region and industry context')?t.slice(t.indexOf('## Region and industry context')):'';
test('All tool names descriptions schemas annotations and lists stay unchanged',async()=>assert.deepEqual(await rpc(handler,'tools/list'),baseline.tool_list));
for(const row of baseline.rows)test('No region byte parity and three runs: '+row.tool+' '+row.vertical,async()=>{
 for(let i=0;i<3;i++){const result=await rpc(handler,'tools/call',{name:row.tool,arguments:row.args});assert.ok(text(result).endsWith(NO_REGION_SUFFIX));assert.equal(hash(removeQuestion(result)),row.sha256);}
});
for(const [vertical,product]of verticalCases)for(const [region,alias]of regionCases)test('Regional exact same meaning opposite and three runs: '+vertical+' '+region,async()=>{
 assert.equal(explainSector({seller:[product]}).vertical?.id,vertical);
 for(const c of seedCases){
  let first;
  for(const phrase of [`We sell in ${region}.`,`We sell in ${alias}.`]){
   const args=caseArgs(c,vertical,product+'. '+phrase);
   const result=await rpc(handler,'tools/call',{name:c.tool,arguments:args});assert.ok(!result.isError,c.tool);
   const notes=suffix(text(result));assert.ok(notes,c.tool+' has notes');
   if(first)assert.equal(notes,first,c.tool+' equivalent region notes');else first=notes;
   for(let run=1;run<3;run++)assert.deepEqual(await rpc(handler,'tools/call',{name:c.tool,arguments:args}),result);
   first=notes;
  }
  const opposite=caseArgs(c,vertical,product+`. We do not sell in ${region}.`);
  const result=await rpc(handler,'tools/call',{name:c.tool,arguments:opposite});assert.ok(!result.isError,c.tool);assert.equal(suffix(text(result)),'',c.tool+' opposite');
  // Scope equality is only within a tool. Other tools can have different supplied context.
  first=undefined;
 }
});

test('India and Germany fintech notes stay separate',async()=>{for(const c of seedCases){const outputs={};for(const country of ['India','Germany']){const args=caseArgs(c,'fintech','Fintech payment reconciliation software sold in '+country);outputs[country]=text(await rpc(handler,'tools/call',{name:c.tool,arguments:args}));}assert.match(suffix(outputs.India),/Reserve Bank of India/);assert.doesNotMatch(suffix(outputs.Germany),/Reserve Bank of India/);assert.match(suffix(outputs.Germany),/Germany/);assert.notEqual(suffix(outputs.India),suffix(outputs.Germany));}});
