import test from 'node:test';import assert from 'node:assert/strict';
const {classifyProof}=await import((process.env.WAVE4_TEST_HOME||process.cwd())+'/dist/rw-impact.js');
for(const v of ['Logistics tech','Fintech','SaaS','Vertical SaaS','AI native','ITeS','Telecom','Software','Cybersecurity'])test('C12 '+v+' recognition and adverse results keep their meaning',()=>{
 for(const text of ['Ranked a leader by analysts','Judged best by independent reviewers']){const r=classifyProof(v+': '+text);assert.equal(r.kind,'recognition');assert.equal(r.tier,2)}
 for(const text of ['We were not ranked a leader','Collections fell 12% after deployment','Costs doubled after adoption','No customer reported any improvement'])assert.equal(classifyProof(v+': '+text).held,true,text);
 const healthy=classifyProof(v+': Customer processing time fell by 20% during the pilot');assert.equal(healthy.tier,1);assert.ok(!healthy.held);
});
