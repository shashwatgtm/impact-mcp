// Run 22 round 3, impact_translate_execution: written before the fixes (test first). Faults of the fresh judges: a weak headline taken from a later part of the benefit
// while rich inputs of the statement (a list of features) go unused, a deck problem line that is cut off, a superlative without its page claim label in emails and posts,
// a headline cut inside a list, the same cut headline repeated in the subject line, instruction text where copy should be, generic vocabulary for the problem instead of the
// problems the statement states. Companies are invented (Payvale, Linkfabric, Voxlane, Datadock); every figure is an invented test input.
// Run: node --no-warnings --test tests/run22-impact_translate_execution-r3.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { call, PLACEHOLDER, repeatedSentences, cuts, sections } from "./run22-impact-common.mjs";

const TOOL = "impact_translate_execution";
const PAYVALE = {
  positioning_statement: "For businesses that accept online payments in the Gulf, from solo shops to enterprises, Payvale is the online payment gateway; a licensed payment institution built for the Gulf region that 20+ payment methods including Gulfcard, Visa and Mastercard; unified API and hosted checkout; embedded 3D Secure; authorise then capture to avoid unnecessary refunds; split payments for marketplaces. Alternatives buyers use today: building every local payment connection from scratch. What sets it apart: a regional specialist: the most extensively licensed payment institution in the Gulf and the first card-network certified 3D Secure provider in the Gulf (page claims), with one contract and one integration across markets.",
  target_customer: "businesses that accept online payments in the Gulf, from solo shops to enterprises; 100k+ businesses (page claim)",
  key_benefit: "one secure integration for local payment methods, regional expansion and direct payouts to local bank accounts, high acceptance rates, faster setup and consolidated reporting",
  product_name: "Payvale",
};
const LINKFABRIC = {
  positioning_statement: "For large enterprises whose IT leaders re-engineer IT economics, Linkfabric is the digital ecosystem enabler: enterprise network, cloud, security and IoT services. What sets it apart: one fabric across network, cloud, security and IoT, on a network with direct connection to a large share of Internet routes.",
  target_customer: "large enterprises whose IT leaders re-engineer IT economics through hybrid solutions",
  key_benefit: "one fabric that connects network, cloud, customer interactions and IoT infrastructure; 99.80% first-time-right network transformations (page claim)",
  product_name: "Linkfabric",
};
const VOXLANE = {
  positioning_statement: "For enterprises that run customer conversations at scale, from banks to telecom, who struggle with generic speech recognition fails on telephony audio with code-switching, regional accents and 8kHz call noise, and most calls go unreviewed without full call coverage, Voxlane is the voice AI platform for enterprises. Alternatives buyers use today: traditional IVR systems with predefined flows. What sets it apart: in-house models trained on telephonic audio across 40+ languages.",
  target_customer: "enterprises that run customer conversations at scale, from banks to telecom; 250+ enterprises (page claim)",
  key_benefit: "AI agents that automate conversations, understand context and act in real time, with enterprises typically seeing a 60% reduction in contact centre cost after deploying Voxlane (page claim)",
  product_name: "Voxlane voice AI platform (voice agents, analytics and assist)",
};
const DATADOCK = {
  positioning_statement: "For developers and engineering teams who need production-grade open source data infrastructure, Datadock is the managed data platform. Alternatives buyers use today: cloud-native managed databases tied to one provider. What sets it apart: genuine open source on open standards; one control plane across any cloud.",
  target_customer: "developers and engineering teams who need production-grade open source data infrastructure; thousands of companies run on it (page claims). The API and the console are both documented.",
  key_benefit: "stop managing and start building: a new PostgreSQL or Kafka service live in under 10 minutes, with patching, scaling and uptime handled and a 99.99% uptime SLA on production plans (page claims)",
  product_name: "Datadock managed data platform (managed PostgreSQL, Kafka and ClickHouse)",
};

test("r3 translate: the headline comes from the first part of the benefit and the features of the statement are used", async () => {
  const t = await call(TOOL, PAYVALE);
  const web = sections(t)["Website Execution"];
  const head = (web.match(/\*\*Headline\*\*\n>\s*"([^"\n]+)"/) || [])[1];
  assert.ok(head);
  assert.doesNotMatch(head, /^high acceptance rates$/i, `weak headline: ${head}`);
  assert.match(head, /secure integration/i);
  for (const f of ["Gulfcard", "embedded 3D Secure", "authorise then capture", "split payments for marketplaces"]) assert.ok(t.toLowerCase().includes(f.toLowerCase()), `feature not used: ${f}`);
  assert.match(web, /unified API and hosted checkout/i);
  assert.doesNotMatch(t, PLACEHOLDER);
  assert.deepEqual(repeatedSentences(t), []);
});

test("r3 translate: a superlative never appears without its page claim label, and the deck problem line is whole", async () => {
  const t = await call(TOOL, PAYVALE);
  for (const l of t.split("\n").filter((x) => /most extensively licensed/i.test(x))) assert.match(l, /page claims?/, `no label: ${l.slice(0, 160)}`);
  for (const l of t.split("\n").filter((x) => /first card-network certified/i.test(x))) assert.match(l, /page claims?/, `no label: ${l.slice(0, 160)}`);
  const prob = t.split("\n").find((l) => /^\| 2 \| The Problem/.test(l)) || "";
  assert.ok(prob.length > 30);
  assert.doesNotMatch(prob, /\b(?:and|or|of|the|a|to|with|for|by)\s*\|?\s*$/i, prob);
  assert.deepEqual(cuts(t), []);
});

test("r3 translate: a headline that is a list is not cut inside it, is not repeated in the subject line, and no instruction text stands where copy should be", async () => {
  const t = await call(TOOL, LINKFABRIC);
  const web = sections(t)["Website Execution"];
  const head = (web.match(/\*\*Headline\*\*\n>\s*"([^"\n]+)"/) || [])[1];
  assert.ok(head);
  assert.doesNotMatch(head, /connects network$/i, `cut inside a list: ${head}`);
  assert.match(head, /fabric/i);
  const subject = (t.match(/\*\*Subject\*\*: ([^\n]*)/) || [])[1] || "";
  assert.ok(!subject.toLowerCase().startsWith(head.toLowerCase()), `the headline is repeated as the subject line: ${subject}`);
  assert.doesNotMatch(t, /ask three buyers|use their words|use the buyer's own figures|with the customer's consent/i);
  assert.match(t.split("### Key Slide")[1], /They: /);
});

test("r3 translate: the problem slide, the hook and the objection use the problems the statement states, not generic sector words", async () => {
  const t = await call(TOOL, VOXLANE);
  const prob = t.split("\n").find((l) => /^\| 2 \| The Problem/.test(l)) || "";
  assert.match(prob, /code-switching|8kHz|call coverage|telephony/i, prob);
  assert.doesNotMatch(prob, /case review|human in the loop|accuracy on your own data/i, prob);
  assert.doesNotMatch(t, /case review|human in the loop|moves money|changes a record|trust the AI to handle first/i);
  assert.match(t, /code-switching/);
  assert.match(t, /traditional IVR systems/);
});

test("r3 translate: a managed data service is not read as an API governance product", async () => {
  const t = await call(TOOL, DATADOCK);
  assert.doesNotMatch(t, /API catalog|spec drift|governed APIs|API governance|specs and implementations/i);
  assert.match(t, /uptime/i);
});
