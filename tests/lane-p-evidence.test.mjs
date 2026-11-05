import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import handler from '../netlify/functions/mcp.mjs';
const cases=JSON.parse(readFileSync(new URL('./fixtures/round5-reader-cases.json',import.meta.url)));
const call=async(name,args)=>{const response=await handler(new Request('https://example.com/mcp',{method:'POST',headers:{'content-type':'application/json',accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:args}})}));const b=await response.json();assert.ok(!b.error);assert.ok(!b.result.isError,JSON.stringify(b.result));return b.result.content.map(c=>c.text||'').join('\n');};

