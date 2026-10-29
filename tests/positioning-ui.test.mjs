// W4. Synthetic review fixtures only. No external requests.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {InMemoryTransport} from '@modelcontextprotocol/sdk/inMemory.js';
import {createServer} from '../src/index.ts';
import {escapeText} from '../src/escape-inputs.ts';
import {calculatePositioning} from '../src/positioning-model.ts';
import {POSITIONING_HTML} from '../src/positioning-resource.ts';
import handler from '../netlify/functions/mcp.mjs';
const baseline=JSON.parse(fs.readFileSync(new URL('./fixtures/positioning-ui-baseline.json',import.meta.url)));
async function connect(){const [a,b]=InMemoryTransport.createLinkedPair();const server=createServer(),client=new Client({name:'helix-test',version:'1'});await server.connect(b);await client.connect(a);return {client,close:async()=>{await client.close();await server.close();}};}
const decode=result=>JSON.parse(Buffer.from(result.structuredContent.inputsBase64,'base64').toString('utf8'));
test('all input schemas and tool metadata remain equal; only full audit gains a UI attachment',async()=>{
 const {client,close}=await connect();try{const current=await client.listTools();assert.equal(current.tools.length,baseline.tools.tools.length);
 for(const tool of current.tools){const old=baseline.tools.tools.find(t=>t.name===tool.name);const { _meta,...rest}=tool;assert.deepEqual(rest,old);if(tool.name==='impact_full_audit')assert.equal(_meta.ui.resourceUri,'ui://helix/positioning/v1.html');else assert.equal(_meta,undefined);}
 }finally{await close();}
});
for(let i=0;i<baseline.fixtures.length;i++)test('legacy text equality and shared completeness for synthetic fixture '+(i+1),async()=>{
 const {client,close}=await connect();try{const result=await client.callTool({name:'impact_full_audit',arguments:baseline.fixtures[i]});assert.deepEqual(result.content,baseline.results[i].content);assert.deepEqual(decode(result),baseline.fixtures[i]);const view=calculatePositioning(decode(result));assert.equal(result.structuredContent.completeness.overall,view.completeness.overall);const text=result.content[0].text;assert.equal(Number(text.match(/Input completeness score: (\d+)\/100/)[1]),view.completeness.overall);assert.ok(view.evidence.every(e=>e.independentlyObserved===false));assert.ok(view.missing.includes('customer_feedback'));}finally{await close();}
});
test('resource is real bundled HTML with empty network CSP, and unknown resources fail',async()=>{
 const {client,close}=await connect();try{const resources=await client.listResources();assert.deepEqual(resources.resources.map(r=>r.uri),['ui://helix/positioning/v1.html']);const {contents}=await client.readResource({uri:resources.resources[0].uri});assert.equal(contents[0].mimeType,'text/html;profile=mcp-app');assert.equal(contents[0].text,POSITIONING_HTML);assert.deepEqual(contents[0]._meta.ui.csp,{connectDomains:[],resourceDomains:[],frameDomains:[]});assert.match(contents[0].text,/connect-src 'none'/);assert.doesNotMatch(contents[0].text,/<script[^>]+src=|<link[^>]+href=|https?:\/\//);await assert.rejects(client.readResource({uri:'ui://unknown'}));}finally{await close();}
});
test('hosted HTTP provides the same structured view and resource',async()=>{
 async function rpc(method,params){const res=await handler(new Request('http://localhost/mcp',{method:'POST',headers:{'content-type':'application/json',accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params})}));assert.equal(res.status,200);return (await res.json()).result;}
 const result=await rpc('tools/call',{name:'impact_full_audit',arguments:baseline.fixtures[0]});assert.deepEqual(result.content,baseline.results[0].content);assert.deepEqual(decode(result),baseline.fixtures[0]);assert.equal((await rpc('resources/read',{uri:'ui://helix/positioning/v1.html'})).contents[0].text,POSITIONING_HTML);
});
test('empty, malformed and unsupported inputs cannot create a valid decision',()=>{
 for(const input of [{},{product_description:5},{...baseline.fixtures[0],competitors:[5]},{...baseline.fixtures[0],business_model:'made-up'},{...baseline.fixtures[0],problem_solved:' '},{...baseline.fixtures[0],product_description:'x'.repeat(4001)}]){
 const schema=baseline.tools.tools.find(t=>t.name==='impact_full_audit').inputSchema;const result=calculatePositioning(input,schema);assert.equal(result.valid,false);assert.equal(result.decision,null);assert.equal(result.completeness,null);assert.ok(result.errors.length);}
});
test('reported observations stay reported; assumptions, contradictions and absence remain distinct',()=>{
 const view=calculatePositioning({...baseline.fixtures[0],product_description:'Observed: synthetic product behaviour',current_positioning:'Contradicted: faster handoffs'});
 assert.equal(view.evidence.find(e=>e.field==='product_description').status,'reported');assert.equal(view.evidence.find(e=>e.field==='key_differentiation').status,'assumption');assert.equal(view.evidence.find(e=>e.field==='current_positioning').status,'contradicted');assert.equal(view.evidence.find(e=>e.field==='customer_feedback').missing,true);assert.equal(view.alternatives[0].strategicFit.startsWith('Not assessed'),true);
});
test('browser calculation bundle matches server module and preserves hostile text as data',()=>{
 const context={window:{}};vm.runInNewContext(fs.readFileSync(new URL('../public/lab/positioning/model.js',import.meta.url),'utf8'),context);
 const input={...baseline.fixtures[0],company_name:'<img src=x onerror=alert(1)>',problem_solved:'Synthetic 😀 <script>bad()</script>'};
 assert.equal(JSON.stringify(context.window.HelixPositioning.calculatePositioning(input)),JSON.stringify(calculatePositioning(input)));
});
test('full audit structured text remains inert under the existing escape contract',async()=>{
 const {client,close}=await connect();try{const input={...baseline.fixtures[0],company_name:'<img src=https://evil.example onerror=alert(1)>'};const result=await client.callTool({name:'impact_full_audit',arguments:input});assert.equal(result.structuredContent.inputs.company_name,escapeText(input.company_name));assert.deepEqual(decode(result),input);}finally{await close();}
});
