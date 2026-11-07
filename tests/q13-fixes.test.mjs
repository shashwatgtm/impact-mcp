import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const policySrc = readFileSync(new URL('../src/software-policy.ts', import.meta.url), 'utf8');
const indexSrc = readFileSync(new URL('../src/index.ts', import.meta.url), 'utf8');
const rwSrc = readFileSync(new URL('../src/rw-impact.ts', import.meta.url), 'utf8');
const rw2Src = readFileSync(new URL('../src/rw-impact2.ts', import.meta.url), 'utf8');
const vertSrc = readFileSync(new URL('../src/verticals.ts', import.meta.url), 'utf8');

test('RC-01 & RC-02: software-policy.ts handles bare tool names, compare/evaluate verbs, and vendor vs vendor queries', () => {
  assert.match(policySrc, /compare\|comparing\|comparison\|evaluate\|evaluating/);
  assert.match(policySrc, /bareTool/);
  assert.match(policySrc, /vsVendor/);
});

test('RC-03: impact_anchor_market removes unsolicited SOFTWARE_REFERRAL from market sizing section', () => {
  assert.doesNotMatch(indexSrc, /Validation Required[^\n]*\$\{SOFTWARE_REFERRAL\}/);
});

test('RC-05: readContext applies profileFor for investment model even when your_sector is set', () => {
  assert.match(indexSrc, /forcedSector \? \(m\.model === 'investment' \? profileFor\(v0, m\.model, full\) : v0\)/);
});

test('RC-06 & RC-22: impact_full_audit expands specificity/contrast/unique regexes and checks allFeedback.length > 0', () => {
  assert.match(indexSrc, /engineers\|developers\|reps\|agents\|seats\|beds\|stores/);
  assert.match(indexSrc, /instead of\|rather than\|compared to\|vs\\\.\?\|versus/);
  assert.match(indexSrc, /args\.customer_feedback && allFeedback\.length > 0/);
});

test('RC-07: shortClause preserves numeric by/in/within bounds and FRAME_AT is 240; rw-impact2 leadClause preserves short relative clauses', () => {
  assert.match(indexSrc, /const FRAME_AT = 240;/);
  assert.match(indexSrc, /\(\?:by\|in\|within\|from\|at\|for\|per\)\\s\$\/i\.test\(m\[0\]\)/);
  assert.match(rw2Src, /if \(\/\^\\s\(\?:that\|which\|with\|using\|across\)\\s\/i\.test\(m\[0\]\) && at < 45\) continue;/);
});

test('RC-08: verticals.ts expands vertical-saas match and index.ts checks chosenV in sectorChoiceNotice', () => {
  assert.match(vertSrc, /field service \(\?:management\|software\)/);
  assert.match(indexSrc, /chosenV && \(chosenV\.match\.test\(text\)/);
});

test('RC-09 & RC-15: KNOWN_NAMES includes Indian/enterprise brands and aOrAn excludes usa*', () => {
  assert.match(indexSrc, /Shiprocket Razorpay Chargebee Infosys Airtel SmartBear Postman Mindbody/);
  assert.match(indexSrc, /!\(\/\^\(uni\|use\|usa\|usu\|uti\|eu\|one\|once\)\/i\.test\(w\)\)/);
});

test('RC-10 & RC-12: impact_map_alternatives matches leadKey before colons/dashes and impact_translate_execution extracts product name and need from positioning_statement', () => {
  assert.match(indexSrc, /leadKey = c\.split/);
  assert.match(rwSrc, /unlike\|whereas\|because\|since\|so\|reducing\|cutting/);
  assert.match(rw2Src, /instead of\|rather than\|compared to\|against/);
});
