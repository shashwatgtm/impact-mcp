import test from 'node:test';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';
const home=process.env.WAVE4_TEST_HOME||process.cwd();const child=spawn(process.execPath,[home+'/dist/index.js'],{cwd:home,stdio:['pipe','pipe','pipe']});let id=0,buf='';const pending=new Map();child.stderr.resume();child.stdout.on('data',d=>{buf+=d;let i;while((i=buf.indexOf('\n'))>=0){let line=buf.slice(0,i);buf=buf.slice(i+1);try{let m=JSON.parse(line);pending.get(m.id)?.(m)}catch{}}});
const req=(method,params)=>new Promise((resolve,reject)=>{const n=++id,t=setTimeout(()=>reject(Error('Timeout '+method)),10000);pending.set(n,m=>{clearTimeout(t);pending.delete(n);resolve(m)});child.stdin.write(JSON.stringify({jsonrpc:'2.0',id:n,method,params})+'\n')});
await req('initialize',{protocolVersion:'2025-03-26',capabilities:{},clientInfo:{name:'wave4-reasons',version:'test'}});child.stdin.write('{"jsonrpc":"2.0","method":"notifications/initialized"}\n');
const call=async(name,args)=>{const r=await req('tools/call',{name,arguments:args});assert.ok(!r.error&&!r.result.isError,JSON.stringify(r));return r.result.content.map(c=>c.text||'').join('\n')};
const verticals=['Logistics tech','Fintech','SaaS','Vertical SaaS','AI native','ITeS','Telecom','Software','Cybersecurity'];
test.after(()=>child.kill());
for(const v of verticals)test('R3 '+v+' segment presets read meaning',async()=>{
 for(const [segment,score] of [['Enterprise accounts',18],['Very large corporate groups',18],['Non-enterprise accounts',15],['SMB firms',17],['Firms with under 50 staff',17]]){
 const t=await call('impact_anchor_market',{product_description:v+' vendor',potential_segments:[segment]});
 assert.match(t,new RegExp('\\*\\*'+score+'\\*\\*'),segment);assert.ok(t.includes(segment));
 }
});
for(const v of verticals)test('C12 '+v+' audit uniqueness needs affirmation',async()=>{
 const a={company_name:'Vendor',product_description:v+' workflow product',target_customer:'Operations teams in growing firms',problem_solved:'Delayed approvals',key_differentiation:'Our product brings the review process together with an audit trail. '};
 for(const phrase of ['We are the only option.','No other vendor offers this.']){const t=await call('impact_full_audit',{...a,key_differentiation:a.key_differentiation+phrase});assert.match(t,/Pinpoint[^\n]*85|85[^\n]*Pinpoint/i);assert.ok(t.includes(phrase.slice(0,-1)))}
 const t=await call('impact_full_audit',{...a,key_differentiation:a.key_differentiation+'We are not the only option.'});assert.doesNotMatch(t,/Pinpoint[^\n]*85|85[^\n]*Pinpoint/i);
});
