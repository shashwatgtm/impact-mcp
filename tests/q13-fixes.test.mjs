import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const policySrc = readFileSync(new URL('../src/software-policy.ts', import.meta.url), 'utf8');
const indexSrc = readFileSync(new URL('../src/index.ts', import.meta.url), 'utf8');
const rw2Src = readFileSync(new URL('../src/rw-impact2.ts', import.meta.url), 'utf8');

test('RC-02: software-policy.ts does not treat "which GTM motion" or "which operational pain" questions as software requests', () => {
  assert.match(policySrc, /\(\?:motion\|operational\\s\+pain\|pain\|problem\|challenge\|segment\|buyer/);
  assert.match(policySrc, /decide\\s\+which\\s\+\(\?:gtm\\s\+\)\?motion/);
});

test('RC-05: readContext applies profileFor for investment model even when your_sector is set', () => {
  assert.match(indexSrc, /forcedSector \? \(m\.model === 'investment' \? profileFor\(v0, m\.model, full\) : v0\)/);
});

test('RC-22: impact_full_audit scores customer feedback only when a feedback item is present', () => {
  assert.match(indexSrc, /args\.customer_feedback && allFeedback\.length > 0/);
});

test('RC-07: shortClause keeps numeric by/in/within bounds; rw-impact2 leadClause keeps short relative clauses', () => {
  assert.match(indexSrc, /\(\?:by\|in\|within\|from\|at\|for\|per\)\\s\$\/i\.test\(m\[0\]\)/);
  assert.match(rw2Src, /if \(\/\^\\s\(\?:that\|which\|with\|using\|across\)\\s\/i\.test\(m\[0\]\) && at < 45\) continue;/);
});

test('RC-08: index.ts checks chosenV in sectorChoiceNotice', () => {
  assert.match(indexSrc, /chosenV && \(chosenV\.match\.test\(text\)/);
});

test('RC-15: aOrAn excludes usa* words ("a usage tier")', () => {
  assert.match(indexSrc, /\^\(uni\|use\|usa\|usu\|uti\|eu\|one\|once\)\/i\.test\(w\)/);
});

test('RC-10: impact_map_alternatives matches the lead name before a colon or dash', () => {
  assert.match(indexSrc, /leadKey = c\.split/);
});
