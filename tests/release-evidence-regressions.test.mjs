import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../netlify/functions/mcp.mjs';
import {uses} from './run22-impact-common.mjs';
test('metric word-use checks compare literal escaped punctuation without changing raw safety output',async()=>{
 const metric='Independent lab showed 99%+ efficacy and 0.1% false positive rate';
 const response=await handler(new Request('https://local.invalid/mcp',{method:'POST',headers:{'content-type':'application/json',accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'impact_pinpoint_value',arguments:{product_name:'Synthetic detector',category:'Cloud security software',target_customer:'Security analysts',key_outcome:'Reduce false positives',unique_capability:'Compare detections against a labelled evaluation set',customer_metrics:metric}}})}));
 const result=(await response.json()).result;
 assert.ok(result&&!result.isError);
 const text=result.content.filter(c=>c.type==='text').map(c=>c.text).join('\n');
 assert.ok(text.includes('99%\\+ efficacy'),'transport text keeps the production escape');
 assert.equal(uses(text,metric),true,'rendered metric words are retained');
 assert.equal(uses('Independent lab showed 94% efficacy and 0.1% false positive rate',metric),false,'a different metric must still fail');
});
