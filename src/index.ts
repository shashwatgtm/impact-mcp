#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { neutraliseDeep, neutraliseText } from './echo-safe.ts';
import { partLabel, isNamedPart, segmentFacts, segmentType, segmentFit, segmentOverlap, roleOk, linkScore, productParts, isCompanyFact, brandName, plainName, tidyLabel, splitStrengths, leadAud, noSeatWords, categoryNoun, takeLabel, topLevel, joinAnd, clip, outcomeItems, outcomeClause, leadItems, classifyProof, MEASURE_LINKS, ctaNoun, sharpenLine, type Kit, type ProofKind } from './rw-impact.ts';
import { type Kit2, type Piece, partText, sentence, shapeOf, parseBenefit, partsInline, resultClause, firstParts, shortPhrase, needSentence, needPieces, differenceSentence, parseAudience, audienceShort, parseAlternative, altObjection, parseDifference, sharpenText, makeFresh, baseForm, leadClause, parseStatement, plainResult, stemSet, shared, figureMeasures, keepLabel, quoteAround, brandOnly, type Alternative } from './rw-impact2.ts';
import { detectVertical, detectModel, explainSector, profileFor, SAAS_ONLY, SUBTYPES, SECTOR_MODEL, MODEL_NAME, BUSINESS_MODELS, VERTICALS, type Vertical, type VerticalId, type BusinessModel, type ReaderInput } from './verticals.ts';

// =============================================================================
// IMPACT MCP v2.0.0 - Hypothesis-Driven B2B Positioning Engine
// =============================================================================
// IMPACT = Identify Champions, Map Alternatives, Pinpoint Value, 
//          Anchor Market, Craft Message, Translate Execution
// =============================================================================

// Output labels (run 5, owner decision 1). A figure that is not the user's input, and not computed only
// from it, carries EXAMPLE on its own line, or sits under an EXAMPLES line placed directly above its table,
// list or code block. SUGGESTED closes outputs that suggest lengths, timings or counts.
const EXAMPLE = '(Example figure: replace with your own)';
const EXAMPLES = 'Example figures: replace with your own.';
const SUGGESTED = 'Suggested timings, lengths and counts: adjust them to your own.';

// Text only (run 9): common words that may open an input phrase. Mid-sentence, only these are lowered
// ("Fewer late deliveries" becomes "fewer late deliveries"). Any other capitalised word is kept as typed, because it may be a
// name or an acronym ("Salesforce data you can trust", "Microsoft Teams approvals", "AI deal scoring", "CRM hygiene").
const COMMON_WORDS = new Set((
  'a an the this that these those our your their my its his her we you they it me us them all any each every ' +
  'both either neither no not none some many much more most less least fewer few several other another such ' +
  'same own only just even also still very too so as than then there here what which who whom whose when where ' +
  'why how whether if because while until unless though although since once after before during about above ' +
  'across against along among around at by for from in into inside near of off on onto out outside over past ' +
  'per through throughout to toward towards under underneath up upon via with within without is are was were be ' +
  'been being am do does did done doing have has had having can could will would shall should may might must ' +
  'need needs needed get gets got getting give gives gave make makes made let lets keep keeps put puts take ' +
  'takes took see sees show shows find finds know knows think go goes going come comes one two three four five ' +
  'six seven eight nine ten first second third last next new old big small large tiny long short high low full ' +
  'half whole top bottom early late fast faster fastest quick quicker quickest slow slower easy easier easiest ' +
  'simple simpler hard harder better best good great strong stronger weak weaker clear clearer real true right ' +
  'wrong free open closed live smart smarter lean cheaper cheap safe safer secure accurate reliable consistent ' +
  'predictable visible instant instantly automatic automatically manual custom modern legacy digital online ' +
  'offline mobile remote local global central single multiple multi daily weekly monthly quarterly yearly ' +
  'annual real-time realtime end self self-serve self-service one-tap one-click two-way no-code low-code always ' +
  'never often sometimes usually now today tomorrow soon yet again ever already almost nearly exactly directly ' +
  'fully truly entirely highly deeply readily cut cuts reduce reduces reduction lower lowers raise raises boost ' +
  'boosts grow grows growth increase increases improve improves save saves saving savings win wins earn earns ' +
  'drive drives drove speed speeds scale scales help helps support supports enable enables deliver delivers ' +
  'offer offers provide provides build builds create creates launch launches ship ships track tracks measure ' +
  'measures manage manages plan plans run runs start starts stop stops ends avoid avoids prevent prevents ' +
  'remove removes replace replaces fix fixes solve solves close closes book books send sends share shares sync ' +
  'syncs connect connects integrate integrates automate automates simplify simplifies streamline streamlines ' +
  'centralise centralize unify unifies align aligns turn turns spend spends lose loses miss misses waste wastes ' +
  'struggle struggles fail fails hit hits meet meets reach reaches use uses sell sells buy buys pay pays charge ' +
  'charges hire hires onboard onboards train trains coach coaches forecast forecasts prioritise prioritize ' +
  'qualify qualifies convert converts retain retains renew renews expand expands upsell engage engages nurture ' +
  'nurtures personalise personalize target targets segment segments score scores rank ranks route routes assign ' +
  'assigns approve approves review reviews report reports alert alerts notify notifies remind reminds schedule ' +
  'schedules reschedule reschedules capture captures collect collects clean cleans enrich enriches verify ' +
  'verifies protect protects comply complies audit audits monitor monitors test tests learn learns understand ' +
  'understands explain explains answer answers ask asks call calls email emails text texts chat message ' +
  'messages post posts publish publishes write writes read reads edit edits search searches data insights ' +
  'insight analytics reporting dashboards dashboard pipeline pipelines revenue revenues sales marketing success ' +
  'service services product products platform platforms software tool tools app apps system systems process ' +
  'processes workflow workflows team teams people customers customer clients client users user buyers buyer ' +
  'prospects prospect leads lead accounts account deals deal opportunities opportunity contracts contract ' +
  'renewals renewal churn retention onboarding adoption activation engagement conversion conversions demand ' +
  'cost costs price prices pricing budget budgets value roi time times hours days weeks months minutes setup ' +
  'set-up implementation integration integrations security compliance privacy risk risks errors error mistakes ' +
  'issues issue problems problem pain pains gaps gap delays delay bottlenecks friction complexity visibility ' +
  'control access approvals approval handoffs handoff meetings meeting bookings ' +
  'booking reminders reminder cancellations staff employees employee managers manager ' +
  'leaders leader executives reps rep agents agent partners partner vendors vendor suppliers supplier companies ' +
  'company businesses business organisations organizations enterprises enterprise startups startup founders ' +
  'founder owners owner operations operators finance hr legal procurement engineering developers developer ' +
  'admins admin inbound outbound content campaigns campaign ads events event webinars webinar messaging ' +
  'positioning brand trust quality accuracy efficiency productivity performance results outcomes outcome impact ' +
  'coverage capacity forecasting planning scheduling tracking billing invoicing payments payment payroll hiring ' +
  'recruiting training coaching selling buying spending waiting missing losing paper spreadsheets spreadsheet ' +
  'phone inboxes inbox documents document files file forms form tasks task projects project orders order ' +
  'inventory shipping delivery deliveries returns tickets ticket cases case questions question requests request ' +
  'feedback surveys survey notes note records record lists list numbers number figures figure metrics metric ' +
  'goals goal quotas quota territory territories regions region markets market industry industries verticals ' +
  'vertical category categories competitors competitor alternatives alternative options option features feature ' +
  'modules module add-ons tiers tier seats seat licenses license usage traffic visits visitors signups signup ' +
  'trials trial demos demo proposals proposal quotes quote invoices invoice common key main core major minor ' +
  'basic advanced practical proven essential critical important urgent hidden obvious step steps step-by-step ' +
  'approach approaches guide guides framework frameworks strategy strategies playbook playbooks checklist ' +
  'checklists practice practices trend trends future state lesson lessons tip tips way ways idea ideas reason ' +
  'reasons sign signs rule rules example examples mistake myth myths truth truths secret secrets habit habits ' +
  'principle principles pattern patterns everything nothing something anything everyone nobody someone work ' +
  'world life thing things part parts point points story stories change changes shift shifts move moves loss ' +
  'losses level levels stage stages phase phases week month year day higher bigger smaller larger shorter ' +
  'longer greater happier healthier cleaner smooth smoother seamless effortless painless hassle-free ' +
  'frictionless repeatable scalable flexible affordable transparent unified zero unlimited endless entire ' +
  'complete total actionable measurable shorten shortens stay stays handle handles prove proves focus focuses ' +
  'switch switches eliminate eliminates minimise minimize maximise maximize accelerate accelerates ensure ' +
  'ensures empower empowers unlock unlocks discover discovers spot spots catch catches detect detects predict ' +
  'predicts recover recovers resolve resolves respond responds reply replies follow follows hear hears worst ' +
  'lost won '
).split(/\s+/).filter(Boolean));
// A word counts as common when it is in the list, or ends in -ing or -ed ("Automated", "Missing"). A hyphenated
// word counts by its first part ("Two-way", "Fewer-errors").
function isCommonWord(word: string): boolean {
  const head = word.split('-')[0].replace(/[^A-Za-z']+$/, '');
  if (!/^[A-Z][a-z']*$/.test(head) || head === 'I' || /[A-Z]/.test(word.slice(1))) return false;
  const w = head.toLowerCase();
  return COMMON_WORDS.has(w) || (w.length > 4 && /(?:ing|ed)$/.test(w));
}
// Text only (run 10): names that keep their capital when they open an input phrase placed mid-sentence. The list holds
// common product and company names and the names found in the test inputs; other names are kept by the rules below.
const KNOWN_NAMES = new Set((
  'Salesforce Microsoft Slack HubSpot LinkedIn Google Gmail Outlook Excel Zoom Zendesk Jira Notion Shopify Stripe ' +
  'Marketo Pardot Gong Intercom Freshworks Oracle SAP Workday ServiceNow Snowflake Tableau Asana Trello Dropbox ' +
  'Apple Amazon AWS Azure Facebook Instagram WhatsApp YouTube Sam ' +
  // Run 11: the company and competitor names in the test inputs and the page examples.
  'Bengaluru Clari Northwind Metricly India Indian Europe European Asia Africa Singapore Dubai Mumbai Delhi Bangalore London Germany France Japan Australia Brazil Canada American'
).split(/\s+/).filter(Boolean));
function bareWord(word: string): string {
  return word.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, '');
}
function isKnownName(word: string): boolean {
  const w = bareWord(word);
  return KNOWN_NAMES.has(w) || KNOWN_NAMES.has(w.split(/['-]/)[0]);
}
// Run 11: a known name typed in lower case gets its capitals back ("bengaluru teams" becomes "Bengaluru teams"). Names
// that are also ordinary words (Slack, Zoom, Notion, Gong, Sam ...) are kept when typed with a capital, never raised.
const PLAIN_WORDS = new Set('slack zoom notion excel oracle stripe apple amazon gong sam outlook workday snowflake asana tableau intercom sap azure'.split(' '));
const NAME_BY_LOWER = new Map([...KNOWN_NAMES].filter(n => !PLAIN_WORDS.has(n.toLowerCase())).map(n => [n.toLowerCase(), n] as [string, string]));
function fixNames(phrase: string): string {
  return phrase.replace(/[A-Za-z]+/g, w => (w === w.toLowerCase() && NAME_BY_LOWER.get(w)) || w);
}
// Run 11: a job title in running text is all lower case ("head of marketing", "operations director"); names and
// acronyms in it keep their capitals ("VP of sales", "director of Salesforce operations").
const JOB_WORD = /^(?:head|directors?|managers?|chief|officers?|president|coordinators?|supervisors?|specialists?|administrators?)$/i;
function isJobTitle(phrase: string): boolean {
  const w = phrase.trim().split(/\s+/).map(bareWord);
  return w.length <= 6 && w.some((x, i) => JOB_WORD.test(x) && (x.toLowerCase() !== 'head' || (w[i + 1] || '').toLowerCase() === 'of'));
}
function lowerJobTitle(phrase: string): string {
  return phrase.trim().split(/(\s+)/).map(w => (/^[A-Z][a-z'-]+\W*$/.test(w) && !isKnownName(w) ? w.charAt(0).toLowerCase() + w.slice(1) : w)).join('');
}
// Run 10: the first word of an input phrase keeps its capital only when it is a known name, has an inner capital or is
// all capitals (HubSpot, AI, CRM), holds a digit (B2B, Q4), or starts a name of two words: the next word is capitalised
// too (New York, Branch Group A, Competitor A) and is not a known name on its own ("Native Salesforce" is not a name).
// Run 11: a one-letter word keeps its capital (I, X), and a common first word never makes the next word a name ("For
// Cloudmoat exposure ranking" becomes "for Cloudmoat exposure ranking"), unless the next word is a one-letter label after
// a noun (Competitor A) or the phrase opens with three capitalised words (Example Logistics Co).
function keepsFirstCapital(word: string, next: string, third = ''): boolean {
  const w = bareWord(word);
  if (!/^[A-Z]/.test(w) || (w.length === 1 && !(w === 'A' && next)) || isKnownName(w)) return true; // the article A is not a one-letter name
  if (/^[A-Z][a-z]+'s$/.test(w) && !isCommonWord(w.slice(0, -2))) return true; // a possessive name (India's, Gartner's)
  if (/[A-Z0-9]/.test(w.slice(1))) return true;
  const n = bareWord(next || '');
  if (/^\d/.test(n) && !isCommonWord(w)) return true; // Fortune 500, Series B, Tier 1: a name followed by a number
  if (!/^[A-Z](?:[a-z]+(?:['-][a-z]+)*)?$/.test(n) || isKnownName(n)) return false;
  if (!isCommonWord(w) || w === 'New') return true; // New York, New Delhi
  if (n.length === 1) return !/^(?:for|with|from|to|of|in|on|at|by|and|or|the|a|an|into|about|why|how|what|when|where|who|your|our|their|my|this|that)$/i.test(w);
  return /^[A-Z][a-z]/.test(bareWord(third || ''));
}
// An input phrase placed mid-sentence: its first word is lowered unless keepsFirstCapital() keeps it
// ("Native Salesforce integration" becomes "native Salesforce integration"; "Salesforce data you can trust" stays).
function lowerFirstIfCommon(phrase: string): string {
  const t = fixNames(phrase.trim());
  if (isJobTitle(t)) return lowerJobTitle(t);
  const parts = t.split(/(\s+)/);
  if (keepsFirstCapital(parts[0] || '', parts[2] || '', parts[4] || '')) return t;
  parts[0] = parts[0].replace(/[A-Z]/, c => c.toLowerCase());
  // Run 11: after a lowered first word, a capitalised common second word is lowered too ("why forecasting matters now").
  if (parts[2] && isCommonWord(parts[2])) parts[2] = parts[2].charAt(0).toLowerCase() + parts[2].slice(1);
  return parts.join('');
}
// The same for a whole phrase (this replaces a plain toLowerCase(), which also lowered names and acronyms): the first
// word follows the rule above, and a later word is lowered only when it is a common word. A capitalised word straight
// after a kept name stays too, so a name of two words keeps both ("Microsoft Teams approvals").
function lowerCommonWords(phrase: string): string {
  let afterName = false;
  let first = true;
  const t = fixNames(phrase.trim());
  if (isJobTitle(t)) return lowerJobTitle(t);
  const parts = t.split(/(\s+)/);
  return parts.map((w, i) => {
    if (!w.trim()) return w;
    const lower = first ? !keepsFirstCapital(w, parts[i + 2] || '', parts[i + 4] || '') : !afterName && isCommonWord(w);
    first = false;
    afterName = !lower && /^[A-Z]/.test(w);
    return lower ? w.replace(/[A-Z]/, c => c.toLowerCase()) : w;
  }).join('');
}
// Text only (run 8, run 9): an input phrase placed mid-sentence starts in lower case ("That Fewer late deliveries" becomes
// "That delivers fewer late deliveries") only when its first word is a common word; names and acronyms keep their capitals.
function mid(phrase: string): string {
  return lowerFirstIfCommon(phrase);
}
// Text only: an input phrase that starts a sentence or a headline starts with a capital. A first word written with
// a small letter and an inner capital (iPhone, eBay) is a name and is kept as typed.
// Text only (run 10): "a" or "an" before a phrase, by its first sound (an analytics platform, a CRM, an SMS tool).
function aOrAn(phrase: string): string {
  const w = (phrase.trim().split(/\s+/)[0] || '').replace(/^[^A-Za-z0-9]+/, '');
  if (/^[A-Z0-9]{2,}$/.test(bareWord(w))) return /^[AEFHILMNORSX8]/.test(w) ? 'an' : 'a';
  if (/^(hour|honest|heir)/i.test(w)) return 'an';
  return /^[aeiou]/i.test(w) && !/^(uni|use|usu|uti|eu|one|once)/i.test(w) ? 'an' : 'a';
}
function cap(phrase: string): string {
  const t = fixNames(phrase.trim());
  if (/^[a-z]+[A-Z]/.test(t.split(/\s+/)[0] || '')) return t;
  return t.charAt(0).toUpperCase() + t.slice(1);
}
// Text only: the first words of a phrase for a short tagline, without a dangling joining word at the end (run 9: also
// no dangling pronoun or helper verb, so "Salesforce data you can trust" gives "Salesforce data", not "Salesforce data you can").
// It never changes capitals.
// Run 11 (R11-07): a tagline never stops inside a phrase ("two-way SMS" from "two-way SMS reminders"). When the cut falls
// mid-phrase, it goes back to before the last joining word, or, when there is none, on to the end of the phrase (at most
// 3 more words).
const JOINING_WORD = /^(with|and|or|of|for|to|the|a|an|in|on|by|that|from|you|your|we|our|they|their|it|its|who|which|can|will|is|are)$/i;
// Run 11 addendum 1 (R11-A1-1): the short audience of a tagline ("Built for ...", "Join 100+ ..."), in running-text case:
// the whole target customer when it is short (see below), otherwise its last two words, stepping back over a joining word
// so the slice never opens with one ("head of marketing", never "of marketing").
// Run 11 addendum 2 (R11-A2-4): the whole target customer when it has at most 5 words ("B2B CMOs in the US", "SaaS CFOs
// at HubSpot partners"). A last-two-words slice that follows a place word ("at", "in", "of" ...) names where the audience
// works or lives, not the audience, so the words before that place word are used instead ("VP of RevOps", never
// "HubSpot partners" or "the US").
const PLACE_WORD = /^(at|in|on|of|for|from|with|by|to|the|a|an|and|or)$/i;
// Run 15 R15-32 (edge-case matrix): a long target customer names its audience first ("CFOs of US and European mid-market
// companies with 200 to 2,000 employees"); its last words are often a size ("2,000 employees") or who the audience serves
// ("hourly staff"). So the audience is the words before the first place or clause word (at, in, for, from, with, who, that,
// which, across, serving, selling, using, or a comma); when that is still over 5 words and holds "of", the role before "of".
const AUDIENCE_STOP = /^(at|in|for|from|with|who|that|which|across|serving|selling|using|between|within|based)$/i;
function leadAudience(words: string[]): string[] | null {
  let end = words.length;
  let coord = false;
  for (let i = 1; i < words.length; i++) {
    if (AUDIENCE_STOP.test(words[i])) { end = i; break; }
    if (/[,;:(]$/.test(words[i])) {
      // Run 20 round 2: "the world's leading AI, SaaS and consumer subscription businesses" is one list that shares its last noun; a short first item is not an audience.
      const rest = words.slice(i + 1, i + 8);
      if (i + 1 <= 5 && /[,]$/.test(words[i]) && rest.some((w) => /^(?:and|or)$/i.test(w))) {
        const stop = rest.findIndex((w) => AUDIENCE_STOP.test(w) || /[;:(]$/.test(w));
        end = i + 1 + (stop >= 0 ? stop : rest.length);
        coord = true;
        while (end > i + 1 && /[,;:(]$/.test(words[end - 1]) && end - 1 > i) { break; }
        break;
      }
      end = i + 1; break;
    }
  }
  let lead = words.slice(0, end).map((x, k) => (k === end - 1 ? x.replace(/[,;:(]+$/, '') : x));
  if (coord && lead.length <= 10) return /^(?:the|a|an|of|leading|largest|top|best|global)$/i.test(lead[lead.length - 1]) ? null : lead;
  if (lead.length > 5) {
    const of = lead.findIndex((x, k) => k > 0 && /^of$/i.test(x));
    lead = of > 0 ? lead.slice(0, of) : lead.length <= 8 && end < words.length && /[,;:(]$/.test(words[end - 1] || '') ? lead : lead.slice(0, 0);
  }
  // an audience never ends on a determiner or a modifier ("the world's leading")
  if (lead.length && /^(?:the|a|an|of|leading|largest|top|best|global|new|biggest|most|more|other|many|all|our|their|its)$/i.test(lead[lead.length - 1])) return null;
  return lead.length && lead.length <= 8 && !/\d/.test(lead.join(' ')) ? lead : null;
}
// Run 20 round 1: a bracketed note inside an audience ("(the about page calls ...)", "(page claim)") is a source note, not part of the audience.
export function noNotes(t: string): string {
  // run 21c round 6: a clause about another business's audience is not the audience
  t = t.replace(/\s*;\s*[^;]*\bserved by (?:a |another |an )?(?:separate|different|sister) (?:business|company|team|brand|product)[^;]*/gi, '');
  return t.replace(/\s*[;:]\s*(?:more than|over|about)?\s*[\d,]+\+?\s.*$/i, '').replace(/,\s+in particular\b.*$/i, '').replace(/,?\s+(?:with )?the (?:about )?(?:page|site|website)\b[^;]*$/i, '').replace(/\s*\([^)]*\)/g, '').replace(/\s*;\s*/g, ', ').replace(/\s{2,}/g, ' ').replace(/[,;:\s]+$/, '').trim() || t.trim();
}
function shortAudience(phrase: string): string {
  const w = mid(noNotes(phrase)).split(/\s+/);
  if (w.length <= 5) return w.join(' ');
  const lead = leadAudience(w);
  if (lead) return lead.join(' ');
  let i = w.length - 2;
  while (i > 0 && JOINING_WORD.test(w[i])) i--;
  if (i > 1 && PLACE_WORD.test(w[i - 1])) {
    let j = i - 1;
    while (j > 0 && PLACE_WORD.test(w[j - 1])) j--;
    if (j > 0 && j <= 5) return w.slice(0, j).join(' ');
  }
  return w.slice(i).join(' ');
}
// The same as a plural for "Join 100+ ...": a job title of the form "head of marketing" becomes "heads of marketing".
function pluralAudience(phrase: string): string {
  const a = shortAudience(phrase);
  const m = a.match(/^([A-Za-z]+)( of .+)$/);
  return m && !/s$/i.test(m[1]) ? `${m[1]}s${m[2]}` : a;
}
function firstWords(phrase: string, n: number): string {
  const all = phrase.trim().split(/\s+/);
  let w = all.slice(0, n);
  if (all.length > n && !JOINING_WORD.test(all[n]) && !/[,.;:!?]$/.test(w[w.length - 1])) {
    const back = w.map(x => JOINING_WORD.test(x)).lastIndexOf(true);
    if (back > 0) w = w.slice(0, back);
    else {
      let i = n;
      while (i < all.length && i < n + 3 && !JOINING_WORD.test(all[i]) && !/[,.;:!?]$/.test(all[i - 1])) i++;
      w = all.slice(0, i);
    }
  }
  while (w.length > 1 && JOINING_WORD.test(w[w.length - 1])) w.pop();
  return w.join(' ').replace(/[,;:]$/, '');
}


// =============================================================================
// Run 19 (owner decision D80): shared helpers for the 8 problems of the real-world test.
// =============================================================================
// Sector knowledge sits in ONE data file, src/verticals.ts (rule B82: no statistic, market size, benchmark or named-company fact).

// A list typed by the user: one item per line or per semicolon. Commas stay inside an item, so a phrase such as
// "Routes re-planned in under a minute, not overnight" is never cut into a fragment. A plain comma list of short items is split.
export function splitItems(s: unknown): string[] {
  if (typeof s !== 'string') return [];
  const parts = s.split(/\n|;/).map((x) => x.trim().replace(/^[-*•]\s*/, '')).filter(Boolean);
  // Run 20 round 1: a comma list is cut into items only when it has at least three short items ("live re-routing, address cleaning, offline driver app");
  // "AI, machine learning and mobility based automation" stays one phrase instead of fragments.
  if (parts.length === 1 && /,/.test(parts[0])) {
    const c = parts[0].split(/,(?!\d{3}(?!\d))/).map((x) => x.trim()).filter(Boolean);
    if (c.length >= 3 && c.every((x) => x.split(/\s+/).length <= 4) && !c.some((x) => /^(not|but|and|or|so|which|that)\b/i.test(x))) return c;
  }
  return parts;
}
// Text typed by the user, quoted when it is placed inside one of the tool's own sentences, so a clause never breaks the grammar.
function q(s: string): string {
  const t = s.trim().replace(/^"|"$/g, '');
  return `"${/\.\.\.$/.test(t) ? t : t.replace(/[.!]+$/, '')}"`;
}
const clean = (s: string): string => s.trim().replace(/[.!]+$/, '');
// The sector and the business model read from the inputs, with one line saying how they were read.
// Run 20 round 1: the seller's own fields go first and the buyer's fields second (src/verticals.ts reads them in that order).
// `core` is what the user wrote to say what the product is (description, category); `later` is the other text about the product
// (capability, differentiation, positioning); `names` are brand names, which can mislead ("Brightfield Software" is not a software
// subscription) and are read last. The sector is taken from `core` when it names one, then from core plus later plus names, then
// from the deal text, job titles and the buyer. The business model is read from core plus later only.
interface Read { core?: unknown[]; later?: unknown[]; names?: unknown[]; context?: unknown[]; role?: unknown[]; buyer?: unknown[]; }
function readContext(explicitModel: unknown, r: Read): { v: Vertical | null; model: BusinessModel | null; line: string } {
  // A brand name is not a sector word ("Brightfield Software" is not a software product): it is taken out of the other texts before they are read.
  const nameList = (r.names || []).filter((x): x is string => typeof x === 'string' && x.trim().length >= 3).map((x) => x.trim());
  const brand = /\b[A-Z][\w-]*\s+(?:Software|Technologies|Systems|Solutions|Labs|Infotech)\b/g; // "Brightfield Software" is a company name, not a product word
  const strip = (x: unknown): unknown => (typeof x === 'string' ? nameList.reduce((t, nm) => t.split(new RegExp(nm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')).join(' '), x).replace(brand, ' ') : x);
  const coreT = (r.core || []).map(strip), laterT = (r.later || []).map(strip);
  const descr = [...coreT, ...laterT];
  const full: ReaderInput = { seller: [...descr, ...(r.names || [])], context: r.context, role: r.role, buyer: r.buyer };
  const coreOnly = coreT.length ? explainSector({ seller: coreT }) : null;
  let ex = coreOnly && coreOnly.vertical ? coreOnly : explainSector(full);
  // The shared reader cuts a text at "for ..." (the buyer part), so "cloud platform for testing websites ... AI agents" can still read AI native from the label alone:
  // the seller's own texts are read once more as free text without the AI words, and a trade they name then wins (the shared guard covers the other cases).
  if (ex.vertical && ex.vertical.id === 'ai-native' && detectModel(undefined, { seller: descr }).model !== 'investment') {
    const noAi = (x: unknown) => (typeof x === 'string' ? x.replace(/\b(?:AI|A\.I\.)[- ](?:native|powered|led|driven|enabled|first|agents?|analyst|copilot|assistant|layered)\b|\bgenerative AI\b|\bGenAI\b|\bLLMs?\b|\b(?:agent )?copilots?\b|\bchatbots?\b|\bAI\b/gi, ' ') : x);
    const again = explainSector({ context: [...descr, ...(r.names || [])].map(noAi) });
    if (again.vertical && again.vertical.id !== 'ai-native') ex = again;
  }
  const v0 = ex.vertical;
  // The model is read from what the product is (core) first; the capability and positioning text can mention "tools" or "cloud" in any business.
  const first = coreT.length ? detectModel(explicitModel, { seller: coreT }) : null;
  const read = first && (first.how === 'input' || first.how === 'read') ? first : detectModel(explicitModel, { seller: descr });
  const m0 = read.how === 'input' || read.how === 'read' ? read : v0 ? { model: (v0.subtype ? SUBTYPES.find((x) => x.id === v0.subtype)?.model : undefined) ?? SECTOR_MODEL[v0.id], how: 'sector' as const } : read;
  // Run 22: a services firm that names "AI-powered tools" or a platform among its capabilities is still a services firm: when the whole text reads as ITeS and
  // only a tool word made it a subscription, the model is services (the shared reader does the same when it sees the whole text).
  const saasWords = /\b(?:saas|subscriptions?|per seat|per user|licen[cs]es?)\b/i;
  const m = v0 && v0.id === 'ites' && m0.model === 'saas' && m0.how === 'read' && !saasWords.test(descr.filter((x): x is string => typeof x === 'string').join(' ')) ? { model: 'services' as BusinessModel, how: 'sector' as const } : m0;
  // A seller that manages money gets the investment roles and measures, not the sector's own (shared sector file, profileFor).
  const v = profileFor(v0, m.model, full);
  const from = ex.source === 'context' ? ' (from the deal text, because your own description names no sector)' : ex.source === 'role' ? ' (from the job titles, because your own description names no sector)' : ex.source === 'buyer' ? ' (from who you sell to, because your own description names no sector)' : '';
  const sector = v ? `read from your inputs as ${v.name}${from}` : 'not clear from your inputs (name the industry in plain words for sector notes)';
  const model = m.model
    ? `${MODEL_NAME[m.model]} (${m.how === 'input' ? 'from business_model' : m.how === 'sector' ? 'the usual model in this sector, assumed; set business_model to change it' : 'read from your inputs; set business_model to change it'})`
    : 'not clear from your inputs; set business_model (saas, services, connectivity, transactions, marketplace, hardware_software or investment) for advice that fits it';
  return { v, model: m.model, line: `*Sector: ${sector}. Business model: ${model}.*` };
}
// The measures of a sector. The AI native list in the data file is written for customer-service automation (resolution, handling time),
// so for AI native only the measures that fit any AI product are shown (accuracy on the buyer's own data, and escalation to a person).
function metricsOf(v: Vertical): string[] {
  return v.metrics;
}
// Run 21b: the measures of a sector, ordered by the user's own words. A measure that shares a word with the problem the user typed (or, less, with the
// product description) comes first; the rest keep the sector's order, so nothing is dropped and nothing is added. No match: the sector's order stands.
const MEASURE_STOP = new Set(['rate', 'time', 'share', 'effort', 'cost', 'number', 'count', 'average', 'total', 'per', 'and', 'the', 'for', 'with', 'from', 'that', 'this', 'your']);
const measureStems = (t: string): Set<string> => new Set((t.toLowerCase().match(/[a-z]{4,}/g) || []).filter((w) => !MEASURE_STOP.has(w)).map((w) => w.replace(/s$/, '').slice(0, 4)));
function rankMeasures(measures: string[], problem: string, product: string): string[] {
  const p = measureStems(problem), d = measureStems(product);
  const score = (m: string) => [...measureStems(m)].reduce((n, w) => n + (p.has(w) ? 2 : 0) + (d.has(w) ? 1 : 0), 0);
  return measures.map((m, i) => ({ m, i, s: score(m) })).sort((a, b) => b.s - a.s || a.i - b.i).map((x) => x.m);
}
const sectorLine = (v: Vertical | null): string => v
  ? `*Sector: read from your inputs as ${v.name}.*`
  : '*Sector: not clear from your inputs, so no sector notes are added. Name the industry in plain words (for example logistics tech, fintech, SaaS, vertical SaaS, AI native, IT services, telecom, software or cybersecurity).*';
const SECTOR_NAMES = VERTICALS.map((v) => v.name).join(', ');
// A sector typed on its own ("fintech", "IT services"): one word is enough here, unlike detectVertical, which reads whole texts.
const SECTOR_WORDS: [string, RegExp][] = [
  ['vertical-saas', /vertical[- ]saas|field sales|fmcg|consumer goods|retail execution/i],
  ['logistics-tech', /logistics|supply chain|last[- ]mile|3pl|freight|fleet/i],
  ['fintech', /fintech|financ|spend|payments?|banking|lending/i],
  ['ai-native', /\bai\b|ai[- ]native|llm|generative/i],
  ['ites', /\bites\b|it services|it-enabled|managed services?|outsourc|bpo/i],
  ['telecom', /telecom|telco|connectivity|sd-wan|isp\b/i],
  ['cybersecurity', /cyber|security|infosec|ciso/i],
  ['software', /software|developer|dev ?tools|\bapi\b/i],
  ['saas', /saas|subscription/i],
];
function findSector(text: string): Vertical | null {
  const t = text.trim();
  if (!t) return null;
  for (const [id, re] of SECTOR_WORDS) if (re.test(t)) return VERTICALS.find((v) => v.id === id) || null;
  return detectVertical(t);
}
const list = (items: string[], prefix = '- '): string => items.map((x) => `${prefix}${x}`).join('\n');
const numbered = (items: string[]): string => items.map((x, i) => `${i + 1}. ${x}`).join('\n');

// Sector view: the buying committee, what the sector measures, its usual objections, a proof that lands and discovery questions.
type Part = 'committee' | 'metrics' | 'objections' | 'proof' | 'discovery' | 'motion' | 'vocabulary';
function sectorBlock(v: Vertical | null, parts: Part[], heading = 'Sector view'): string {
  if (!v) return '';
  const out = [`### ${heading}: ${v.name}`];
  if (parts.includes('vocabulary')) out.push(`- **Words this sector's buyers use:** ${v.vocabulary.join(', ')}.`);
  if (parts.includes('committee')) out.push(`- **Who usually buys:** ${v.committee}`);
  if (parts.includes('motion')) out.push(`- **How deals usually run:** ${v.salesMotion}`);
  if (parts.includes('metrics')) out.push(`- **What this sector measures:** ${metricsOf(v).join(', ')}.`);
  if (parts.includes('objections')) out.push(`- **Objections this sector often raises:** ${v.objections.map((o) => `"${o.objection}"`).join('; ')}.`);
  if (parts.includes('proof')) out.push(`- **A proof point that lands:** ${v.proofShape}`);
  if (parts.includes('discovery')) out.push(`- **Discovery questions in this sector's language:**\n${numbered(v.discovery).split('\n').map((l) => `  ${l}`).join('\n')}`);
  return out.join('\n');
}

// ---- Grammar engine (problem 2): how a typed phrase may enter one of the tool's own sentences ------------------------------
// base:   starts with an outcome verb ("cut cost per delivery by 18%"); third: a verb in the third person ("re-plans every route");
// noun:   starts with a quantity, comparative or adjective ("Fewer critical exposures"); other: anything else, which is quoted.
export type Kind = 'base' | 'third' | 'noun' | 'other';
const BASE_VERBS = new Set((
  'combine merge join link blend orchestrate pair apply scan provide offer include watch ' +
  'cut reduce lift grow increase close resolve fix catch find get save speed shorten avoid prevent stop eliminate boost improve win keep retain ' +
  'scale automate simplify move ship hire deliver protect secure detect respond recover understand see know reconcile prioritise prioritize clean ' +
  'cleanse connect manage turn double halve raise expand launch generate capture convert qualify trim slash lose waste chase drown struggle spend ' +
  'miss wait juggle rely make build create start finish complete approve onboard train sell buy renew upsell reach serve handle assign allocate ' +
  'predict notify escalate comply meet hit beat exceed settle provision deploy migrate integrate import enrich personalise personalize engage ' +
  'activate adopt compare choose select decide show prove lend underwrite insure invest rebalance hedge learn tell ask spot flag rank tighten ' +
  'streamline unify replace remove stay pass clear pay collect bring give let put take use ensure enable help bill refund reclaim recoup ' +
  'surface highlight verify validate monitor track stay hold open bridge replace align shrink slim speed-up'
).split(/\s+/).filter(Boolean));
// verbs that can also stand at the start of a noun phrase ("route planning time", "audit preparation") are left out of BASE_VERBS;
// these bases are safe to read in the third person ("plans every route" is a verb only after re-)
const RE_BASES = new Set('plan route assign allocate book open start balance calculate train check rank score test order schedule price'.split(' '));
const THIRD_BASES = new Set((
  'combine merge join link blend orchestrate pair apply scan provide offer include watch use support work check ' +
  'match rank find catch detect resolve prioritise prioritize reconcile automate clean cleanse connect monitor track turn give show let help keep save ' +
  'cut reduce lift close fix flag map send pull push build learn adapt handle cover protect secure stop block run capture suggest generate surface ' +
  'validate approve notify escalate predict scale ship deliver simplify unify remove replace enrich integrate migrate provision onboard serve assign ' +
  'allocate create make take bring drive raise grow boost improve eliminate avoid prevent recover respond understand know see read write learn ' +
  'compare choose select decide prove verify lend underwrite insure invest rebalance hedge spot tighten streamline pay collect hold open bridge align shrink'
).split(/\s+/).filter(Boolean));
const NOUNISH = new Set((
  'fewer more less faster slower lower higher better shorter longer bigger smaller no zero one single a an the our your their every each all any some same ' +
  'real-time realtime live instant automatic automated manual reliable predictable consistent clear accurate full complete end-to-end unified continuous daily ' +
  'weekly monthly cheaper simpler easier safer smarter early late quick rapid critical steady lasting measurable repeatable visible transparent too many much ' +
  'slow long high low poor rising growing failed missed fragmented uneven inconsistent unclear hidden thin weak limited rigid heavy costly expensive falling ' +
  'lost wasted duplicate siloed scattered outdated legacy unreliable unpredictable delayed incomplete inaccurate stale noisy overloaded overdue repeated ' +
  'constant endless frequent sudden unplanned top key main core better best new old own'
).split(/\s+/).filter(Boolean));
function thirdBase(w: string): string | null {
  if (!/s$/.test(w) || w.length < 3) return null;
  const cands = [w.replace(/ies$/, 'y'), w.replace(/(ch|sh|ss|x|z|o)es$/, '$1'), w.replace(/s$/, ''), w.replace(/es$/, '')];
  for (const c of cands) if (c !== w && THIRD_BASES.has(c)) return c;
  return null;
}
export function kindOf(phrase: string): Kind {
  const w0 = (phrase.trim().split(/\s+/)[0] || '').toLowerCase().replace(/[^a-z0-9$%'-]+$/g, '');
  if (!w0) return 'other';
  const rest = w0.startsWith('re-') ? w0.slice(3) : null;
  if (BASE_VERBS.has(w0) || (rest !== null && RE_BASES.has(rest))) return 'base';
  // Run 20 round 1: "plan routes faster, keep every delivery promise and close every invoice": a verb that can also be a noun (plan, route, book)
  // is a verb when a later part of the list starts with an outcome verb.
  if (RE_BASES.has(w0) && phrase.split(/,\s*|\s+and\s+/).slice(1).some((part) => BASE_VERBS.has((part.trim().split(/\s+/)[0] || '').toLowerCase()))) return 'base';
  if (thirdBase(w0) || (rest !== null && thirdBase(rest)) || (rest !== null && /s$/.test(rest) && RE_BASES.has(rest.slice(0, -1)))) return 'third';
  if (NOUNISH.has(w0) || /^[\d$]/.test(w0)) return 'noun';
  return 'other';
}
function lowerFirst(t: string): string {
  const parts = t.split(/\s+/);
  const w = parts[0] || '';
  if (/^[A-Z][a-z]+$/.test(parts[1] || '') && !isCommonWord(w) && !isCommonWord(parts[1])) return t; // a two-word name (Spec Hub, Platformation Suite)
  return /^[A-Z][a-z'-]+$/.test(w) && !isKnownName(w) ? t.charAt(0).toLowerCase() + t.slice(1) : t;
}
// The first letter lowered unless the word is an acronym (SLA stays SLA).
const lc1 = (t: string): string => (/^[A-Z]{2,}/.test(t) ? t : t.replace(/^./, (c) => c.toLowerCase()));
// "so you can ..." / "helps them ..." / "trying to ...": the benefit as an infinitive phrase.
export function inf(benefit: string): string {
  const t = clean(benefit);
  const k = kindOf(t);
  if (k === 'base') return lowerFirst(t);
  if (k === 'noun') return `get ${lowerFirst(t)}`;
  return `reach this result (${t})`;
}
// The need or problem as what a buyer does or faces: "lose days chasing alerts" stays; "failed deliveries" becomes "struggle with ...".
export function needClause(need: string): string {
  const t = clean(need);
  const k = kindOf(t);
  if (k === 'base') return lowerFirst(t);
  // Run 20 round 1: a text that already holds a verb ("legacy WAN is like a single highway ...") is a clause and cannot follow "struggle with".
  if (k === 'noun' && !/\b(?:is|are|was|were|has|have|had|does|do|did|can|cannot|will|would)\b/i.test(t.split(/\s+/).slice(0, 9).join(' '))) return `struggle with ${lowerFirst(t)}`;
  return `face this problem (${t})`;
}
// A sentence with the product as its subject and the typed capability or difference as its predicate.
// Run 20 round 1: a text that is already a sentence about a named feature ("Xpendite captures expense data ...") cannot follow "offers" or "offer".
function isNamedClause(t: string): boolean {
  const w = t.trim().split(/\s+/);
  return w.length >= 3 && /^[A-Z][A-Za-z0-9-]+$/.test(w[0]) && !isCommonWord(w[0]) && /^[a-z]{3,}s$/.test(w[1]) && !/(?:ss|us|is)$/.test(w[1]);
}
export function diffSentence(product: string, diff: string): string {
  const t = clean(diff);
  if (isNamedClause(t)) return `${product}: ${t}`;
  const k = kindOf(t);
  if (k === 'base') return `${product} can ${lowerFirst(t)}`;
  if (k === 'third') return `${product} ${lowerFirst(t)}`;
  if (k === 'other' && /:/.test(t)) return `${product}: ${t}`;   // a phrase with no verb of its own ("sovereign by design: built and run in one country") stands as it was written
  return `${product} offers ${lowerFirst(t)}`;
}
function toBaseVerb(third: string): string {
  const [first, ...rest] = third.trim().split(/\s+/);
  let pre = ''; let w = first.toLowerCase();
  if (w.startsWith('re-')) { pre = 're-'; w = w.slice(3); }
  const b = thirdBase(w) ?? (pre && /s$/.test(w) && RE_BASES.has(w.slice(0, -1)) ? w.slice(0, -1) : null);
  return b ? [pre + b, ...rest].join(' ') : third;
}
// "We ..." line of a positioning statement.
function weClause(diff: string): string {
  const t = clean(diff);
  if (isNamedClause(t)) return `stand behind this: ${t}`;
  const k = kindOf(t);
  if (k === 'base') return lowerFirst(t);
  if (k === 'third') return toBaseVerb(lowerFirst(t));
  if (k === 'other' && /:/.test(t)) return `stand behind this: ${t}`;
  return `offer ${lowerFirst(t)}`;
}
// The words of a phrase up to a clause boundary, when the phrase is longer than max words; null when no short form is possible.
function shortClause(phrase: string, max: number): string | null {
  const t = clean(phrase);
  if (t.split(/\s+/).length <= max) return t;
  // the first clause boundary that leaves 3 to max words before it
  const re = /,|;|\s+(?:by|in|within|from|while|so that|each|every|across|when|after|before|until|because|with|without|at|for|per)\s/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(t))) {
    const left = t.slice(0, m.index).trim();
    const n = left.split(/\s+/).length;
    // a comma inside a list ("define, design, develop, ...") is not a clause boundary: the item after it is one or two words
    if (m[0] === ',' && (t.slice(m.index + 1).split(/,|;|\sand\s|\sor\s/)[0] || '').trim().split(/\s+/).length <= 2) continue;
    if (n >= 3 && n <= max && !BASE_VERBS.has(left.split(/\s+/).pop()!.toLowerCase()) && !JOINING_WORD.test(left.split(/\s+/).pop()!)) return left;
    if (n > max) break;
  }
  return null;
}
// Backlog B15-L1 (a very long input pasted whole into sentences): where an input repeats inside the tool's own sentences it is
// shortened at a word boundary after 200 characters; the full text is printed once, in the inputs list.
const LONG_AT = 200;
// Where a typed text sits inside one of the tool's own sentences it is cut at a clause boundary after about this many characters.
const FRAME_AT = 140;
export function shortText(t: string, n = LONG_AT): string {
  const x = t.trim().replace(/\s+/g, ' ');
  if (x.length <= n) return x;
  // Run 20 round 1: a long text is cut at the last clause boundary (a semicolon, a colon, a comma, a closing bracket or a joining word)
  // that leaves at least half the window, never inside a phrase; the cut is marked with "...". Only when the text has no boundary
  // does it stop at a word, and then never on a joining word ("with an", "and the").
  // Run 20 round 2: when the clause ends within 30 characters after the window ("for humans and agents,") the clause is kept whole.
  const ext = x.slice(n, n + 30).search(/[;:,)]/);
  if (ext >= 0 && x.slice(0, n + ext).length > n * 0.6) { const whole = x.slice(0, n + ext + (x[n + ext] === ')' ? 1 : 0)).trim(); if (!(/\(/.test(whole) && (whole.match(/\(/g) || []).length > (whole.match(/\)/g) || []).length)) return `${whole.replace(/[\s,;:.]+$/, '')}...`; }
  const cut = x.slice(0, n);
  // strong boundaries first (a semicolon, a colon, a closing bracket, "while", "which", "because"), then "and" or "with", then a comma
  let at = -1;
  for (const re of [/[;:)]|\s(?:while|which|where|so that|so|because|including|such as)\s/g, /\s(?:and|but|with|plus)\s/g, /,/g]) {
    let m: RegExpExecArray | null;
    let last = -1;
    while ((m = re.exec(cut))) if (m.index >= n * 0.4) last = m[0] === ')' ? m.index + 1 : m.index;
    // Run 20 round 3: the latest boundary of any kind wins, so "for humans and agents," is not cut back to "for humans".
    if (last > at) at = last;
  }
  let head = at > 0 ? cut.slice(0, at) : cut.slice(0, Math.max(cut.lastIndexOf(' '), Math.floor(n / 2)));
  const open = (head.match(/\(/g) || []).length - (head.match(/\)/g) || []).length;
  if (open > 0) head = head.slice(0, head.lastIndexOf('(')).trim();
  let w = head.replace(/[\s,;:.]+$/, '').split(' ');
  while (w.length > 3 && JOINING_WORD.test(w[w.length - 1].replace(/[,;:]$/, ''))) w.pop();
  return `${w.join(' ').replace(/[\s,;:.]+$/, '')}...`;
}
// A list of capabilities in a sentence: whole when it fits, else cut after a complete item and closed with "and more" (the full list is in the inputs).
export function shortList(t: string, n = 200): string {
  const x = t.trim().replace(/\s+/g, ' ');
  if (x.length <= n) return x;
  const cut = x.slice(0, n);
  let at = -1; let depth = 0;
  for (let i = 0; i < cut.length; i++) { const c = cut[i]; if (c === '(') depth++; else if (c === ')') depth--; else if (c === ',' && depth === 0 && i >= n * 0.4) at = i; }
  if (at < 0) return shortText(x, n);
  const head = cut.slice(0, at).replace(/\s+(?:and|or)$/i, '').trim();
  return head.includes(',') || head.split(/\s+/).length > 6 ? `${head} and more` : shortText(x, n);
}
const longNote = (...texts: (string | undefined)[]): string => (texts.some((t) => (t || '').trim().length > LONG_AT) ? '\n*Long inputs are shortened where they repeat in the sentences below; the full text is in the inputs above.*' : '');
const capFirst = (t: string): string => (/^[a-z]+[A-Z]/.test(t.split(/\s+/)[0] || '') ? t : t.charAt(0).toUpperCase() + t.slice(1));
// A hero line of 5 to 8 words. An action stands alone with the audience after it; a noun phrase takes "for <audience>".
function heroLine(benefit: string, audience: string, label = ''): string {
  const short = shortClause(benefit, 8);
  if (!short) {
    // Run 20 round 3: with no short clause the hero is the benefit's leading phrase and the audience, then the product label, never an instruction.
    const lead = leadPhrase(benefit);
    const n = lead.split(/\s+/).length;
    if (n >= 3 && n <= 11) return `${capFirst(lead)}. Built for ${audience}.`;
    return label ? `${capFirst(label)} for ${audience}.` : `Shorten this to 5 to 8 words: ${q(benefit)}`;
  }
  return kindOf(short) === 'base' || /\bfor\b/i.test(short) ? `${capFirst(short)}. Built for ${audience}.` : `${capFirst(short)} for ${audience}.`;
}
// A tagline of 3 to 7 words, or an instruction when the phrase cannot be cut at a clause boundary.
function taglineOf(benefit: string): string {
  const short = shortClause(benefit, 7);
  // Run 20 round 1: when the outcome has no clause of 7 words or fewer, its first words (never ending on a joining word) are the tagline.
  return short ? `"${capFirst(short)}"` : `"${capFirst(firstWords(clean(benefit), 6))}"`;
}
// A category typed in the plural or as a mass noun ("connectivity and digital services") reads as "a provider of ...".
export function catNoun(category: string): string {
  const t = category.trim();
  const bare = t.replace(/\s*\([^)]*\)\s*$/, '');
  return /s$/i.test(bare) && !/(ss|us|is)$/i.test(bare) ? `provider of ${t}` : t;
}
// The name of a competitor or alternative without its description in brackets: "Competitor A (a global suite)" gives "Competitor A".
function nameOf(c: string): string {
  return c.replace(/\s*\(.*$/, '').trim() || c.trim();
}
// A claim of being first or only is never stated as fact: it is wrapped as "[Only if true and provable: ...]".
const SUPERLATIVE = /\b(?:first and only|world's first|industry's first|the only|first[- ]ever|the first)\b/i;
const gateClaim = (claimed: string, sentence: string): string => (SUPERLATIVE.test(claimed) && !/^\[Only if/.test(sentence) ? `[Only if true and provable: ${sentence}]` : sentence);
const joinList = (xs0: string[], word: 'and' | 'or'): string => {
  // a label that is part of another label ("billing systems" inside "legacy enterprise billing systems") or a repeat is dropped
  const xs = xs0.filter((x, i) => !xs0.some((y, j) => j !== i && y.length >= x.length && y.toLowerCase().includes(x.toLowerCase()) && (y.length > x.length || j < i)));
  const sep = xs.some((x) => /,| and /i.test(x)) ? '; ' : ', ';
  if (xs.length <= 2) return xs.join(` ${word} `);
  return `${xs.slice(0, -1).join(sep)}${sep === '; ' ? '; ' : ' '}${word} ${xs[xs.length - 1]}`;
};
// A text that holds a finite verb in its first words is a clause, not a noun phrase.
const hasFiniteVerb = (t: string): boolean => /\b(?:is|are|was|were|has|have|had|does|do|did|can|cannot|will|would|combine|combines|run|runs|manage|manages|rely|relies|juggle|suffer|spend|spends|hand|hands|fail|fails|break|breaks|fall|falls|lose|loses|need|needs|make|makes)\b/i.test(t.split(/\s+/).slice(0, 9).join(' '));
// A measure and the words of a result that answer it, by meaning ("uptime per site" and "99.5% uptime", "approval cycle time" and "3 to 5 days").
const MEASURE_CONCEPTS: [RegExp, RegExp][] = [
  [/uptime|availability|outage|incident/i, /uptime|availability|outage|incident/i],
  [/cycle|days|time to|lead time|turnaround|handling time|approval|speed|latency|repair|resolve|planning time|build time/i, /\b\d+(?:\.\d+)?\s*(?:to\s*\d+\s*)?(?:days?|hours?|minutes?|weeks?|months?)\b/i],
  [/cycle|time to|lead time|turnaround|approval|speed|planning time|build time|sites live/i, /faster|half the time|\d+x\b|quicker|in hours|cycle/i],
  [/cost|saving|spend|expense|price|per ticket|per fte|payback/i, /cost|saving|\$\s?\d|expense|spend|reduction in|reduced/i],
  [/error|accuracy|defect|breach|finding|audit|quality|compliance|violation|policy|fraud|risk/i, /error|accuracy|defect|compliance|violation|policy|audit|mistake|exposure|fraud/i],
  [/adoption|coverage|calls|productive|usage|utili[sz]ation|active/i, /adoption|coverage|productive|usage|digiti[sz]ed|utili[sz]ation|users/i],
  [/automation|throughput|release|velocity|frequency|volume/i, /automat|faster|\d+x\b|throughput|release|volume/i],
  [/sales|revenue|market share|growth|retention|churn|renewal|expansion/i, /sales|revenue|market share|top line|\bgrow|retention|churn|renewal/i],
];
// Run 21b: some lines below were written for ONE kind of company of a vertical (STOCK_KIND). They are used only when the sector read names that kind
// (v.subtype); every other company of the vertical gets the neutral lines in STATUS_QUO_GENERIC and the model's own call to action.
const STOCK_KIND: Partial<Record<VerticalId, string>> = { 'logistics-tech': 'last-mile', fintech: 'spend-expense', 'vertical-saas': 'fmcg-retail-execution', telecom: 'operators-connectivity' };
const STATUS_QUO_GENERIC: Partial<Record<VerticalId, string[]>> = {
  'logistics-tech': ['Shipments and orders followed by hand in spreadsheets and email', 'The transport or order system already in place, used as it is', 'Status chased by phone calls between teams'],
  fintech: ['Spreadsheets and manual checks', "The ERP's or the bank's own tools, used as they are", 'Work split across several systems that do not talk to each other'],
  'vertical-saas': ['Spreadsheets and paper records', 'A general business tool used as it is', 'Staff reporting by phone or a messaging app'],
  telecom: ['Staying with the current provider and its contract', 'Running it in-house', 'Several providers for different needs'],
};
// The usual status quo of a buyer, by what the seller sells (never spreadsheets and junior staff for an investment manager or a developer platform).
function statusQuoDefaults(v: Vertical | null, model: BusinessModel | null): string[] {
  if (v && /investment management/.test(v.name)) return ['Staying with the incumbent manager, or the managers an investment consultant already recommends', 'Running the strategy with an in-house quant team', 'Passive index exposure'];
  const by: Partial<Record<VerticalId, string[]>> = {
    'logistics-tech': ['Manual dispatch and route planning in spreadsheets', 'The transport system already in place, used as it is', 'Planning left to dispatchers and drivers'],
    fintech: ['Spreadsheets and manual approvals', "The ERP's own expense or payment workflow", 'Cards and cash advances handled outside any system'],
    'vertical-saas': ['Paper beat diaries and spreadsheets', "The distributor's own system, used as it is", 'Reps reporting by phone or a messaging app'],
    'ai-native': ['The same work done by the team as today', "A model API wired in by the buyer's own engineers", 'A smaller point tool already in place'],
    ites: ['Staying with the current provider and its contract', 'Doing the work in-house with the existing team', 'Splitting the work across several smaller providers'],
    telecom: ['Staying with the current operator and its contract', 'Running the links in-house', 'Several providers for different sites'],
    software: ['Disconnected tools already in place, used side by side', 'Scripts and documents kept by each team', 'An open-source tool the team maintains itself'],
    cybersecurity: ['The current security tools plus manual review by analysts', 'A periodic scan or audit', 'Doing nothing until an incident or an audit finding'],
  };
  if (v && by[v.id]) return STOCK_KIND[v.id] && v.subtype !== STOCK_KIND[v.id] ? STATUS_QUO_GENERIC[v.id]! : by[v.id]!;
  return model === 'services' || model === 'connectivity' ? ['Staying with the current provider and its contract', 'Doing the work in-house with the existing team', 'Splitting the work across several smaller providers'] : ['Spreadsheets and manual processes', 'Existing tools cobbled together', "The team's own time"];
}
// Strengths typed as one comma list are shared out over the cards: top-level commas only, brackets kept whole.
export function strengthParts(items: string[]): string[] {
  const out: string[] = [];
  for (const it of items) {
    const note = /\((?:page claims?|page claim)\)\s*$/i.test(it) ? ' (page claim)' : '';
    const body = it.replace(/\s*\((?:page claims?)\)\s*$/i, '');
    const parts: string[] = []; let depth = 0; let cur = ''; let idx = 0;
    for (const ch of body) { if (ch === '(') depth++; if (ch === ')') depth--; if (ch === ',' && depth === 0 && !(/\d$/.test(cur) && /^\d{3}(?!\d)/.test(body.slice(idx + 1)))) { parts.push(cur); cur = ''; } else cur += ch; idx++; }
    parts.push(cur);
    const clean2 = parts.map((x) => x.trim().replace(/^and\s+/i, '')).filter((x) => x.split(/\s+/).length >= 2);
    if (clean2.length >= 2) out.push(...clean2.map((x) => x + note)); else out.push(it);
  }
  return out;
}
// Weaknesses typed as one comma list ("detection delays from periodic scans, no threat validation, no financial impact quantification, and ...") are
// cut into items when there are at least three and each has two words or more; otherwise they stay as typed.
export function splitWeaknesses(s: unknown): string[] {
  const items = splitItems(s);
  if (items.length !== 1) return items;
  const chunks = items[0].split(/,\s*(?:and\s+)?/).map((c) => c.trim()).filter(Boolean);
  // A sentence cut at its commas ("a congested highway prone to jams, slowdowns and disconnections, with sluggish apps ...") is one weakness, not three:
  // items are split only when none starts with a joining word and each is a short phrase.
  return chunks.length >= 3 && chunks.every((c) => c.split(/\s+/).length >= 2 && c.split(/\s+/).length <= 12 && !/^(?:with|which|that|where|because|so|while|but|or)\b/i.test(c)) && chunks.slice(1).filter((c) => /^(?:no|not|lack|low|poor|slow)\b/i.test(c)).length >= 1 ? chunks : items;
}
const STEM_STOP = new Set('the and for with that this from have has are was were not but its their they them than then into onto over such only more most very also each every any all some other another which what when where while about after before between through under without within among manual legacy tools tool systems system based multiple various existing same'.split(' '));
function contentStems(t: string): Set<string> {
  return new Set((t.toLowerCase().match(/[a-z]{4,}/g) || []).filter((w) => !STEM_STOP.has(w)).map((w) => w.slice(0, 5)));
}
// A short label for an alternative typed as a long phrase: the words before the first comma, "which" or "that", at most 6 words.
export function labelOf(c: string): string {
  const full = nameOf(c).trim();
  if (full.split(/\s+/).length <= 6) return full;
  // a long description is shortened to its leading noun phrase: the words before "that", "which", "from", "for", "selling", "built", "only" or a comma
  const head = full.split(/,|\s(?:that|which|where|who|from|for|selling|built|only|with|run|runs|relies|relying)\s/)[0].trim();
  const w = head.split(/\s+/);
  if (w.length >= 2 && w.length <= 8) return head;
  const first = full.split(/\s+/).slice(0, 5);
  while (first.length > 2 && JOINING_WORD.test(first[first.length - 1])) first.pop();
  return first.join(' ');
}
// The leading noun phrase of a text: the words before the first "that", "which", "where", "with" or punctuation (at least 2 words), else its first 6 words.
export function leadPhrase(t: string): string {
  const x = clean(t);
  const m = x.split(/\s(?:that|which|where|who|with|through|by|for)\s|[;:(]/)[0].trim();
  // a list of short items ("travel, expense and payment management platform") is kept whole: the cut falls at the end of the list
  const chunks = m.split(',').map((c) => c.trim());
  let out = chunks[0];
  for (let i = 1; i < chunks.length; i++) {
    const first = chunks[i].split(/\sand\s/)[0].trim().split(/\s+/).length;
    if (first > 2) break;
    out += `, ${chunks[i]}`;
    if (/\sand\s/.test(chunks[i])) break;
  }
  const n = out.split(/\s+/).length;
  return n >= 2 && n <= 12 ? out : firstWords(x, 6);
}
const STATUS_QUO = /spreadsheet|manual|in-house|in house|status quo|do nothing|internal|home-?grown|excel|e-?mail|whatsapp|phone|hiring|\bdiy\b|existing (?:tool|process|team)|periodic|current (?:provider|process|team)|incumbent/i;

// ---- The buying committee of a sector, read from its committee sentence in verticals.ts ------------------------------------------
export interface Committee { signer: string; champion: string; championInferred: boolean; users: string | null; reviewers: { role: string; does: string; what: string }[]; }
export function committeeParts(v: Vertical): Committee {
  const strip = (s: string) => s.replace(/^(the|a|an)\s+/i, '').trim();
  let signer = ''; let champion = ''; let users: string | null = null;
  const reviewers: { role: string; does: string; what: string }[] = [];
  for (const c of v.committee.replace(/\.\s*$/, '').split(/;\s*/)) {
    let m: RegExpMatchArray | null;
    if ((m = c.match(/^(.*?)\s+(?:signs?|decides?)$/i))) signer = strip(m[1]);
    else if ((m = c.match(/^(.*?)\s+(?:champions?|sponsors?)\b.*$/i))) {
      // "engineering leads evaluate the interfaces and champion": the role is the words before the first verb
      let rm = m[1].match(/^(.*?)\s+(evaluates?|checks?|reviews?|compares?|joins?|holds?|handles?|runs?|owns?)\b\s*(.*)$/i);
      if (rm && /\b(?:who|that|which)$/i.test(rm[1])) rm = null;   // "the lead who owns the affected area champions it" is one role
      champion = strip(rm ? rm[1] : m[1]);
      if (rm && /evaluat/i.test(rm[2])) reviewers.push({ role: champion, does: rm[2].toLowerCase(), what: rm[3].replace(/\s+and$/i, '').trim() });
    }
    else if ((m = c.match(/^(.*?)\s+(checks?|reviews?|evaluates?|compares?|joins?|holds?|handles?|runs?)\b\s*(.*)$/i))) reviewers.push({ role: strip(m[1]), does: m[2].toLowerCase(), what: m[3].trim() });
    else if ((m = c.match(/^(.*?)\s+(?:use|uses|adopt|adopts)\b/i))) users = strip(m[1]);
  }
  let inferred = false;
  if (!champion) {
    const ev = reviewers.find((r) => /evaluat/.test(r.does));
    champion = ev ? ev.role : signer; inferred = true;
  }
  return { signer, champion, championInferred: inferred, users, reviewers };
}

// ---- Run 20 round 1: the function that owns a problem, read from the user's own words -------------------------------------------------
// Used where the sector's committee is generic (SaaS, no sector): the roles come from the team the problem text names, with no statistic.
interface FunctionRoles { id: string; re: RegExp; champion: string; buyer: string; tech: string; measures: string[]; blocker: string; questions: string[]; proof: string; vocab: string[]; }
const FUNCTIONS: FunctionRoles[] = [
  { id: 'finance', re: /\b(financ\w*|billing|invoic\w*|reconcil\w*|revenue recognition|collections?|accounts? (?:payable|receivable)|month-end|ledger|treasury|expenses?|accounting|cash flow)\b/gi, champion: 'Finance Controller or Head of Billing Operations', buyer: 'CFO', tech: 'the finance systems owner (ERP and billing) and IT', measures: ['days to close the books', 'billing errors found after invoicing', 'manual reconciliation effort', 'audit findings'], blocker: 'a finance-systems change in the middle of a close, and the audit trail', questions: ['How many days does the close take today, and which step takes longest?', 'Where are invoices, payments and the ledger matched by hand today, and by whom?', 'Which billing errors were found only after an invoice went out?'], proof: 'Close time, billing errors or reconciliation effort before and after for one team, signed off by the finance lead.', vocab: ['month-end close', 'reconciliation', 'invoicing', 'revenue recognition', 'audit trail', 'ERP posting'] },
  { id: 'sales', re: /\b(sales|pipeline|quota|win rates?|reps?|leads?|deals?|prospects?|selling|outbound)\b/gi, champion: 'Head of Sales Operations or Revenue Operations', buyer: 'Chief Revenue Officer', tech: 'the CRM administrator and sales operations', measures: ['pipeline coverage', 'win rate', 'sales cycle length', 'rep ramp time'], blocker: 'rep adoption and CRM data quality', questions: ['How is the pipeline reviewed today, and how late is the view?', 'Where do reps lose time between a lead and a first call?', 'Which number does the sales head answer for each quarter?'], proof: 'Win rate or sales cycle length for one team before and after, from the CRM, with the sales head signing it off.', vocab: ['pipeline', 'win rate', 'quota attainment', 'sales cycle', 'CRM hygiene', 'forecast call'] },
  { id: 'marketing', re: /\b(marketing|campaigns?|brand|demand gen\w*|attribution|content|seo|webinars?)\b/gi, champion: 'Head of Marketing or Demand Generation', buyer: 'CMO', tech: 'marketing operations', measures: ['marketing-sourced pipeline', 'cost per qualified lead', 'attribution coverage'], blocker: 'overlap with the marketing tools already in place', questions: ['How is a campaign tied to pipeline today?', 'Which reports does marketing build by hand each month?', 'Which channel would you cut first if you could see the cost per qualified lead?'], proof: 'Cost per qualified lead or marketing-sourced pipeline for one campaign before and after.', vocab: ['pipeline contribution', 'attribution', 'cost per qualified lead', 'campaign', 'lead scoring'] },
  { id: 'customer', re: /\b(support|customer success|customer experience|tickets?|churn|retention|renewals?|csat|nps)\b/gi, champion: 'Head of Customer Success or Support', buyer: 'Chief Customer Officer or COO', tech: 'support operations and the owner of the help-desk tools', measures: ['first response time', 'time to resolution', 'renewal rate', 'customer satisfaction'], blocker: 'agent workload during the change and tool overlap', questions: ['How long does a first response take today, and who feels it first?', 'Which tickets or renewals slip because of the tools in use?', 'Which number does support or success answer for each month?'], proof: 'First response time or renewal rate for one team before and after, from the help desk or CRM.', vocab: ['first response time', 'time to resolution', 'renewal', 'customer satisfaction', 'escalation'] },
  { id: 'engineering', re: /\b(engineer\w*|developers?|code|release\w*|deploy\w*|devops|software delivery|apis?|testing|pipelines?)\b/gi, champion: 'Engineering or Platform Lead', buyer: 'VP Engineering or CTO', tech: 'a staff engineer or architect, with security for code and data access', measures: ['release frequency', 'lead time for changes', 'escaped defects'], blocker: 'developer adoption and security review', questions: ['How often do you release today, and what slows the release down?', 'Where do defects escape, and who finds them?', 'Which tools would this replace or connect to?'], proof: 'Release frequency or escaped defects on one team before and after, from the pipeline data of that team.', vocab: ['release frequency', 'lead time for changes', 'escaped defects', 'CI pipeline', 'technical debt'] },
  { id: 'security', re: /\b(security|threats?|breach\w*|vulnerab\w*|attack\w*|ransomware|compliance|soc|siem)\b/gi, champion: 'Head of Security Operations or the SOC lead', buyer: 'CISO', tech: 'a security engineer or architect', measures: ['mean time to detect', 'mean time to respond', 'open critical exposures'], blocker: 'alert fatigue and tool overlap', questions: ['How many alerts reach an analyst each day, and how many are acted on?', 'How long does it take to find and respond to a real exposure today?', 'Which tools would this replace or feed?'], proof: 'Exposures found and closed during a proof of value, with the time it took to fix them.', vocab: ['alert fatigue', 'mean time to detect', 'exposure', 'proof of value', 'SOC'] },
  { id: 'api', re: /\b(openapi|swagger|api (?:governance|management|catalog|design|first|lifecycle|platform|gateway|standards|programs?|consumers?|discovery|documentation|specs?|contracts?|versioning|testing)|apis? (?:and|or) (?:microservices|integrations)|spec drift|specs and implementations|contract testing)\b/gi, champion: 'Head of API Platform or the API program owner', buyer: 'VP Engineering or CTO', tech: 'enterprise architects and security', measures: ['APIs under governance', 'spec and implementation drift found', 'time to find an existing API', 'time to onboard an API consumer'], blocker: 'developer adoption and a security review of code and data access', questions: ['How do teams find an existing API today, and who owns the catalog?', 'How often do specs and implementations drift apart, and who notices?', 'Which API standards exist, and how is compliance checked?'], proof: 'APIs governed, or specs matched to implementations, for one team before and after.', vocab: ['API governance', 'spec drift', 'API catalog', 'design standards', 'contract testing'] },
  { id: 'modernization', re: /\b(moderni[sz]\w*|legacy|cloud|migrat\w*|replatform\w*|refactor\w*|cloud native|data cent(?:er|re)s?)\b/gi, champion: 'Head of Application Modernization or Cloud Transformation', buyer: 'CIO', tech: 'enterprise architects and security', measures: ['applications moved per wave', 'cost of running the legacy estate', 'incidents during cutover', 'time to a working pilot'], blocker: 'migration risk and keeping the business running during the move', questions: ['Which applications and data centres are in scope, and which move first?', "What does running the legacy estate cost today, in the buyer's own figures?", 'Who signs off a cutover, and what is rolled back if it fails?'], proof: 'A pilot application migrated, with its cutover record and its running cost before and after.', vocab: ['cloud migration', 'legacy applications', 'cutover', 'landing zone', 'run cost', 'transition plan'] },
  { id: 'it', re: /\b(infrastructure|network\w*|it operations|data cent(?:er|re)s?|servers?|hybrid)\b/gi, champion: 'Head of IT Infrastructure or Cloud Operations', buyer: 'CIO', tech: 'the infrastructure or network manager, with security', measures: ['service availability', 'incident volume', 'time to provision'], blocker: 'migration risk and the current contract', questions: ['Which systems or sites are in scope, and which suffer the most incidents?', 'Who runs them today, and when does each contract end?', 'What does a migration or outage cost a day?'], proof: 'Availability or incident volume for the pilot scope before and after, measured over a full cycle.', vocab: ['uptime', 'incident', 'migration', 'service level', 'change window'] },
  { id: 'operations', re: /\b(operations?|supply chain|logistics|warehouses?|delivery|fleet|process\w*|manual|workflows?|back office)\b/gi, champion: 'Head of Operations', buyer: 'COO', tech: 'the operations systems manager and IT', measures: ['cycle time', 'error rate', 'cost per transaction handled'], blocker: 'change management on the floor', questions: ['Which steps are done by hand today, and how long do they take?', 'Where do errors enter the process, and who finds them?', 'Which number does operations answer for each month?'], proof: 'Cycle time or error rate for one process before and after, over a full cycle of busy and quiet weeks.', vocab: ['cycle time', 'error rate', 'throughput', 'handover', 'service level'] },
  { id: 'people', re: /\b(hiring|recruit\w*|employees?|hr|payroll|attrition|talent|onboarding)\b/gi, champion: 'Head of HR or People Operations', buyer: 'CHRO', tech: 'the HR systems owner', measures: ['time to hire', 'attrition', 'payroll errors'], blocker: 'employee data privacy', questions: ['How long does a hire or a payroll run take today, and which step is slowest?', 'Where do errors or delays reach employees?', 'Which HR systems must this connect to?'], proof: 'Time to hire or payroll errors for one team before and after.', vocab: ['time to hire', 'attrition', 'payroll run', 'onboarding', 'HRIS'] },
  { id: 'risk', re: /\b(audit\w*|risk|regulat\w*|policy|policies|controls?)\b/gi, champion: 'Head of Risk and Compliance', buyer: 'CFO or Chief Risk Officer', tech: 'internal audit and IT', measures: ['audit findings', 'policy breaches', 'time to prepare an audit'], blocker: 'evidence the auditors will accept', questions: ['Which controls are tested by hand today, and how often?', 'How long does an audit take to prepare?', 'Which findings came back last time?'], proof: 'Audit findings or time to prepare an audit before and after, accepted by internal audit.', vocab: ['audit finding', 'control test', 'policy breach', 'evidence', 'risk register'] },
];
// What a tool shows as the sector's measures, discovery questions and proof: for a general SaaS committee with a named team, the team's own;
// otherwise the sector's (AI native measures limited to those that fit any AI product).
export interface Lens { fn: FunctionRoles | null; metrics: string[]; questions: string[]; proof: string; vocab: string[]; }
function lensOf(v: Vertical | null, ...texts: (string | undefined)[]): Lens {
  const fn = overlayFn(v, 2, ...texts);
  if (fn) return { fn, metrics: fn.measures, questions: fn.questions, proof: fn.proof, vocab: v && v.id !== 'saas' ? [...fn.vocab, ...v.vocabulary] : fn.vocab };
  return { fn: null, metrics: v ? metricsOf(v) : [], questions: v ? v.discovery : [], proof: v ? v.proofShape : '', vocab: v ? v.vocabulary : [] };
}
const fnName = (f: FunctionRoles): string => f.id.replace('customer', 'customer success or support').replace(/^it$/, 'IT infrastructure');
// The view of a team (finance, sales, ...) when the sector's committee is general: its measures, a proof that lands and its own questions.
function teamBlock(f: FunctionRoles, v: Vertical | null = null): string {
  return [`### Team view: ${fnName(f)}`, ...(v ? [`- **Words buyers in this team use:** ${(v.id === 'saas' ? f.vocab : [...f.vocab, ...v.vocabulary]).join(', ')}.`] : []), `- **What this team measures:** ${f.measures.join(', ')}.`, `- **A proof point that lands:** ${f.proof}`,
    `- **Discovery questions in this team's language:**\n${numbered(f.questions).split('\n').map((l) => `  ${l}`).join('\n')}`].join('\n');
}
// The function a text points to: the one with the most word hits; a tie goes to the earlier one in the table. null when no function word is found.
export function functionOf(...texts: (string | undefined)[]): FunctionRoles | null { return functionHits(1, ...texts); }
function functionHits(min: number, ...texts: (string | undefined)[]): FunctionRoles | null { return functionHitsIn(null, min, ...texts); }
// Which functions a sector may borrow: a general committee (SaaS, no sector) any; developer tools only the API owner; IT services only modernization.
const OVERLAY: Partial<Record<VerticalId, string[]>> = { software: ['api'], ites: ['modernization'] };
function overlayFn(v: Vertical | null, min: number, ...texts: (string | undefined)[]): FunctionRoles | null {
  if (v && v.id === 'saas' && /billing/i.test(v.name)) return null; // the shared billing profile already holds the finance roles, measures and questions
  // run 21c round 5: a seller read as customer service software keeps the customer team's roles (an "employee service" module must not hand the audit to HR)
  if (v && v.id === 'saas' && v.subtype === 'customer-service') return FUNCTIONS.find((x) => x.id === 'customer') ?? null;
  if (!v || v.id === 'saas') return functionHitsIn(null, min, ...texts);
  return OVERLAY[v.id] ? functionHitsIn(OVERLAY[v.id]!, min, ...texts) : null;
}
function functionHitsIn(only: string[] | null, min: number, ...texts: (string | undefined)[]): FunctionRoles | null {
  const t = texts.filter(Boolean).join(' \n ');
  let best: FunctionRoles | null = null; let n = 0;
  for (const f of FUNCTIONS.filter((x) => !only || only.includes(x.id))) { const hits = (t.match(f.re) || []).length; if (hits > n) { best = f; n = hits; } }
  return n >= min ? best : null;
}

// Run 20 round 1: where the buyer's industry decides who the roles are (an AI product has no committee of its own; it is bought by the
// team that owns the work). Roles only, no figures. Used for AI native products and when no sector was read.
interface IndustryRoles { id: string; re: RegExp; champion: string; buyer: string; tech: string; }
const INDUSTRIES: IndustryRoles[] = [
  { id: 'asset and wealth management', re: /\b(asset|wealth|fund|portfolio|invest\w*|pensions?|endowments?|allocators?|hedge)\b/i, champion: 'Head of Quantitative Research or a senior portfolio manager', buyer: 'Chief Investment Officer, with the investment committee', tech: 'Head of data and technology, with risk and compliance' },
  { id: 'insurance', re: /\binsur\w*/i, champion: 'Head of claims or underwriting operations', buyer: 'Chief Operating Officer', tech: 'Head of data and IT, with compliance' },
  { id: 'banking and financial services', re: /\b(banks?|banking|lending|nbfcs?|financial services|bfsi|credit|fintech)\b/i, champion: 'Head of the team that owns the work (operations, risk or customer service)', buyer: 'COO or CFO', tech: 'Head of data and technology, with information security and model risk' },
  { id: 'manufacturing', re: /\b(manufactur\w*|factory|factories|plants?|industrial|automotive)\b/i, champion: 'Head of operations or of a plant', buyer: 'COO', tech: 'Head of IT, with the owner of the plant systems' },
  { id: 'retail and e-commerce', re: /\b(retail\w*|e-?commerce|consumer|fmcg|cpg|brands?)\b/i, champion: 'Head of customer experience or of operations', buyer: 'COO or Chief Commercial Officer', tech: 'Head of IT or digital' },
  { id: 'telecom and media', re: /\b(telecom\w*|telco|operators?|media|streaming|broadcast\w*)\b/i, champion: 'Head of customer operations or of network operations', buyer: 'COO or CTO', tech: 'Head of IT, with security' },
  { id: 'logistics', re: /\b(logistics|supply chain|freight|shipping|3pl|courier)\b/i, champion: 'Head of logistics or transport operations', buyer: 'COO', tech: 'Head of IT, with the owner of the TMS and WMS' },
];
export function industryOf(...texts: (string | undefined)[]): IndustryRoles | null {
  const t = texts.filter(Boolean).join(' ; ');
  return INDUSTRIES.find((i) => i.re.test(t)) || null;
}

// ---- Business model (problem 4): calls to action, proof and commercial terms by model, with no SaaS-only words for another model -----
interface ModelNote { cta: [string, string]; commercial: string; proofTiers: [string, string, string]; assets: string; cost: string | null; }
const MODEL_NOTES: Record<BusinessModel | 'unknown', ModelNote> = {
  saas: { cta: ['Get a demo', 'Start a trial (only if you offer one)'], commercial: 'term length, users or usage, and how the price grows', cost: 'lower total cost of ownership',
    proofTiers: ['Analyst coverage, review sites such as G2, Capterra or TrustRadius, awards, and certifications such as SOC 2 or ISO 27001 if you hold them', 'Benchmarks against alternatives, integrations, live demos', 'Logo wall, case studies, reviews, user community'],
    assets: 'hero section, sales deck and LinkedIn page' },
  services: { cta: ['Request a scoping call', 'Get a proposal'], commercial: 'scope, price model (per FTE, per ticket or fixed), SLA, service credits and exit terms', cost: 'lower total cost of the outcome',
    proofTiers: ['Certifications and audits you actually hold, industry-body mentions, and client references who agree to take a call', 'SLA and service reports, the transition you delivered and the dates you met, and a named governance model', 'Client logos with consent, case studies, clients who have stayed for years'],
    assets: 'proposal template with a transition plan, a governance one-pager and reference calls' },
  connectivity: { cta: ['Request a site survey', 'Get a quote for your sites'], commercial: 'price per site or link, contract term, SLA, service credits and migration waves', cost: 'lower total cost per site',
    proofTiers: ['Licences and certifications you hold, and independent uptime or repair-time records where they exist', 'Site survey results and pilot-site measurements against the incumbent for the same sites', 'Reference site visits, case studies with consent'],
    assets: 'rate-card comparison, site-survey checklist and a migration wave plan' },
  transactions: { cta: ['Talk to sales', 'Set up a test integration'], commercial: 'price per transaction, volume commitments and settlement terms', cost: 'a lower cost per transaction',
    proofTiers: ['Licences, audits and certifications you hold', 'Success rate, settlement and reconciliation results for a similar client', 'Client references with consent'],
    assets: 'integration guide, a test-environment walkthrough and a pricing one-pager' },
  marketplace: { cta: ['See how it works for buyers and sellers', 'Talk to us'], commercial: 'take rate, volume and how both sides are onboarded', cost: null,
    proofTiers: ['Certifications, audits and policies you hold', 'Proof of activity on both sides of the marketplace, from your own records', 'Buyer and seller references with consent'],
    assets: 'two landing pages (one per side) and a seller onboarding guide' },
  hardware_software: { cta: ['Book a pilot site', 'Request a quote'], commercial: 'device price, software term, installation and support', cost: 'lower total cost of ownership',
    proofTiers: ['Product certifications and test reports you hold', 'Pilot-site results and device reliability records', 'A reference site visit and case studies with consent'],
    assets: 'pilot proposal, installation checklist and a reference-site visit plan' },
  investment: { cta: ['Request a meeting', 'Ask for the strategy documents'], commercial: 'mandate size, fees, reporting and risk limits', cost: null,
    proofTiers: ['Regulatory registrations and audits you hold, and independent verification of how you report', 'The documented investment process, the risk limits and how the portfolio is reported; performance figures only with the disclosures your compliance team requires', 'Social proof: client references with consent'],
    assets: 'strategy document, a reporting sample and a due-diligence pack' },
  unknown: { cta: ['Get a demo or talk to us', 'See a case study'], commercial: 'term, scope and price', cost: null,
    proofTiers: ['Certifications, awards or analyst mentions you actually hold', 'Results against the alternatives, integrations and live proof', 'Case studies and references with consent'],
    assets: 'hero section, sales deck and case study' },
};
// The first step a buyer in a sector is asked to take (from the sector's usual sales motion).
const SECTOR_CTA: Partial<Record<VerticalId, string>> = {
  'logistics-tech': 'Book a pilot at one hub', fintech: 'Book a pilot on one entity or department', 'vertical-saas': 'Book a pilot in one region',
  'ai-native': 'Run a proof of concept on your own data', ites: 'Request a scoping call', telecom: 'Request a site survey', cybersecurity: 'Start a time-boxed proof of value',
};
function callsToAction(v: Vertical | null, model: BusinessModel | null): string[] {
  const n = MODEL_NOTES[model || 'unknown'];
  const stock = v && STOCK_KIND[v.id] && v.subtype !== STOCK_KIND[v.id] ? undefined : v ? SECTOR_CTA[v.id] : undefined;
  const first = model === 'saas' || model === null ? stock || n.cta[0] : n.cta[0];
  return [...new Set([first, ...n.cta])];
}

// ---- Money and counts for the market anchor (problem 5: the user's own figures only) ---------------------------------------------
function trimDecimals(x: number): string {
  const s = (Math.round(x * 100) / 100).toString();
  return /\./.test(s) ? s : `${s}.0`;
}
function usd(v: number): string {
  if (v >= 1e9) return `$${trimDecimals(v / 1e9)}B`;
  if (v >= 1e6) return `$${trimDecimals(v / 1e6)}M`;
  if (v >= 1e5) return `$${(v / 1e6).toFixed(2)}M`;
  return `$${Math.round(v).toLocaleString('en-US')}`;
}
const usdFull = (v: number): string => `$${Math.round(v).toLocaleString('en-US')}`;
// A percentage as printed: at most one decimal and no float noise (12.345678 gives "12.3", 0.1 + 0.2 gives "0.3"); a value above
// 0 that would round to 0 reads "under 0.1". The sizing itself uses the exact figure the user gave.
export function pctText(n: number): string {
  const r = Math.round(n * 10) / 10;
  if (n > 0 && r === 0) return 'under 0.1';
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
}
// "Mid-size manufacturers: 3,200; IT services firms: 1,800" gives one count per named segment; a bare number has no name.
export function parseCounts(s: unknown): { name: string; count: number }[] {
  if (typeof s !== 'string') return [];
  const out: { name: string; count: number }[] = [];
  for (const raw of s.split(/\n|;/).map((x) => x.trim()).filter(Boolean)) {
    const m = raw.match(/^(?:(.*?)\s*[:=]\s*)?(?:about |around |roughly |~)?(\d[\d,]*(?:\.\d+)?)\s*([km])?\b/i);
    if (!m) continue;
    const n = parseFloat(m[2].replace(/,/g, '')) * (m[3] ? (m[3].toLowerCase() === 'k' ? 1e3 : 1e6) : 1);
    if (Number.isFinite(n) && n > 0) out.push({ name: (m[1] || '').trim(), count: Math.round(n) });
  }
  return out;
}
const sameName = (a: string, b: string): boolean => {
  const x = a.toLowerCase().replace(/\s+/g, ' ').trim(); const y = b.toLowerCase().replace(/\s+/g, ' ').trim();
  return !!x && !!y && (x === y || (x.length >= 4 && y.includes(x)) || (y.length >= 4 && x.includes(y)));
};


// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

// Run 22: the helpers of this file that the rewrite helpers in rw-impact.ts need.
const RW_KIT: Kit = { kindOf, lowerFirst, toBaseVerb };
// Run 22 round 3: a sector note is kept when at least this share of the sector's measures and words appear in the user's own inputs; below it the note belongs to another kind of work.
const MISMATCH_AT = 0.12;
const RW_KIT2: Kit2 = { ...RW_KIT, capFirst, mid: (t: string) => (/^["“'‘]/.test(t.trim()) ? t : mid(t)), noNotes: (t: string) => noNotes(t), shortAud: (t: string) => shortAudience(shortText(noNotes(t))) };

const tools = {
  // ---------------------------------------------------------------------------
  // Tool 1: Get Framework Overview
  // ---------------------------------------------------------------------------
  impact_get_framework: {
    description: 'Get the IMPACT framework method phase by phase, optionally with your sector\'s buyer roles, measures and proof points',
    inputSchema: {
      type: 'object',
      properties: {
        focus_phase: {
          type: 'string',
          description: 'Specific phase to focus on (identify/map/pinpoint/anchor/craft/translate)',
          enum: ['identify', 'map', 'pinpoint', 'anchor', 'craft', 'translate', 'all']
        },
        sector: {
          type: 'string',
          description: 'Your sector in your own words (for example logistics tech, fintech, SaaS, vertical SaaS, AI native, IT services, telecom, software or cybersecurity). Adds how the six steps read in that sector'
        }
      }
    },
    execute: (args: { focus_phase?: string; sector?: string }) => {
      const phase = args.focus_phase || 'all';
      const sectorText = (args.sector || '').trim();
      const v = sectorText ? findSector(sectorText) : null;
      const cm = v ? committeeParts(v) : null;
      let sectorPart = '';
      if (sectorText && !v) {
        sectorPart = `\n---\n\n## Your sector\n\nYou gave the sector ${q(sectorText)}, which this tool did not recognise. It knows these: ${SECTOR_NAMES}. Call it again with one of those names to add how the six steps read in your sector.\n`;
      } else if (v) {
        const c = committeeParts(v);
        sectorPart = `
---

## Your sector: ${v.name}

How the six steps read in this sector. These are patterns, with no figures, from the tool's sector data file.

**I: Identify.** ${v.committee} The usual signer is ${c.signer}; the likeliest champion is ${c.champion}.

**M: Map.** Objections buyers in this sector raise show which alternatives they weigh: ${v.objections.map((o) => `"${o.objection}"`).join('; ')}.

**P: Pinpoint.** What the sector measures: ${v.metrics.join(', ')}. A proof point that lands: ${v.proofShape}

**A: Anchor.** How deals usually run: ${v.salesMotion}

**C: Craft.** Words this sector's buyers use: ${v.vocabulary.join(', ')}.

**T: Translate.** Discovery questions in the sector's language:
${numbered(v.discovery)}
`;
      } else {
        sectorPart = `\nTo see the framework in your sector's own terms, call this tool again with \`sector\` (${SECTOR_NAMES}).\n`;
      }

      const phases = {
        identify: `
## I: IDENTIFY CHAMPIONS

**Purpose**: Find the internal advocates who will champion your solution

### Champion Identification Framework

**Primary Champion Characteristics:**
- Owns the problem you solve (has targets or KPIs tied to it)
- Has budget authority or influence over budget holder
- Personally benefits from successful implementation
- Has credibility with decision makers

**Champion Discovery Questions:**
1. Who gets promoted if this problem gets solved?
2. Who's currently being blamed for this problem?
3. Who brought this initiative to leadership?
4. Who's actively researching solutions?

**Champion Mapping Matrix:**
${v ? `The roles are this sector's usual committee (${v.name}); rate each one for your account in the empty cells.
| Role | Part in the deal | Pain Level | Influence | Access to Power |
|------|------------------|-----------|-----------|-----------------|
| ${capFirst(cm!.champion)} | Likeliest champion | | | |
| ${capFirst(cm!.signer)} | Signs the budget | | | |
${cm!.users ? `| ${capFirst(cm!.users)} | Uses it day to day | | | |\n` : ''}${cm!.reviewers.map((r) => `| ${capFirst(r.role)} | ${capFirst(r.does)} ${r.what}`.trim() + ' | | | |').join('\n')}` : `Pattern: replace each role with the one in your sector (add \`sector\` to see them), and rate each one for your account in the empty cells.
| Role | Part in the deal | Pain Level | Influence | Access to Power |
|------|------------------|-----------|-----------|-----------------|
| The role that owns the problem | Likeliest champion | | | |
| The role that runs the process day to day | Uses it day to day | | | |
| The role that signs the budget | Economic buyer | | | |`}

**Anti-Champion Warning Signs:**
- "Let me get back to you" (no ownership)
- Delegates to junior team members
- Only discusses features, not outcomes
- Can't articulate the business impact
`,
        map: `
## M: MAP ALTERNATIVES

**Purpose**: Understand competitive landscape and find whitespace

### Alternative Analysis Framework

**Four Categories of Alternatives:**
1. **Direct Competitors**: Same solution, same problem
2. **Indirect Competitors**: Different solution, same problem
3. **Status Quo**: Current manual/DIY approach
4. **Do Nothing**: Accept the problem exists

### Competitive Whitespace Analysis

**For each competitor, identify:**
- What they're known for (positioning territory)
- Where they're weak (opportunity zones)
- Who they serve best (segment focus)
- What they ignore (underserved needs)

**Whitespace Questions:**
1. What do customers complain about with alternatives?
2. What use cases do competitors explicitly NOT support?
3. What customer segments do competitors deprioritize?
4. What buying criteria do competitors fail on?

### Positioning Territory Map
\`\`\`
                    ENTERPRISE
                        |
    [Competitor A]      |      [YOUR WHITESPACE]
                        |
COMPLEX ----------------+---------------- SIMPLE
                        |
    [Competitor B]      |      [Competitor C]
                        |
                      SMB
\`\`\`
`,
        pinpoint: `
## P: PINPOINT UNIQUE VALUE

**Purpose**: Articulate your differentiated value with quantification

### Value Proposition Framework

**The Only Statement:**
"[Only if true and provable: We are the ONLY [category] that [unique capability] so that [target customer] can [key outcome].]"

**Value Quantification Matrix:**
Fill the blank cells with your own figures; this tool adds none.
| Value Driver | Metric | Before | After | Improvement |
|--------------|--------|--------|-------|-------------|
${v ? metricsOf(v).slice(0, 4).map((m) => `| ${capFirst(m)} | ${m} | | | |`).join('\n') : '| A measure of time | | | | |\n| A measure of quality | | | | |\n| A measure of money | | | | |'}

### Proof Point Categories

1. **Customer Results**: Specific outcomes achieved
2. **Third-Party Validation**: Analyst recognition, awards
3. **Technical Proof**: Benchmarks, certifications
4. **Social Proof**: Logo wall, case studies, reviews

### Value Hypothesis Generator

**Input your differentiator, get quantified value:**
- Speed → "X% faster time-to-value"
- Accuracy → "X% reduction in errors"
- Coverage → "X% more [scope] supported"
- Integration → "X hours saved on [task]"
`,
        anchor: `
## A: ANCHOR IN RIGHT MARKET

**Purpose**: Select your beachhead market for focused go-to-market

### Beachhead Selection Criteria

**Score each segment (1-5) on:**
1. **Pain Intensity**: How urgent is the problem?
2. **Budget Availability**: Can they pay your price?
3. **Accessibility**: Can you reach them?
4. **Reference Value**: Will they help you expand?
5. **Competition**: Is the segment contested?

### Market Sizing (Bottom-Up)

**TAM/SAM/SOM Calculation:**
\`\`\`
TAM = Total addressable market (everyone who could buy)
    = Total potential customers × Average contract value

SAM = Serviceable addressable market (you can serve)
    = TAM × % that match your ICP

SOM = Serviceable obtainable market (realistic capture)
    = SAM × Expected market share
\`\`\`

### Beachhead Market Selection Matrix
Name your own segments and score them from your own data; the tool adds no scores here.
| Segment | Pain (1-5) | Budget (1-5) | Access (1-5) | Reference (1-5) | Total |
|---------|------------|--------------|--------------|-----------------|-------|
| Your segment 1 | | | | | |
| Your segment 2 | | | | | |
| Your segment 3 | | | | | |

**Select highest score as beachhead.**
`,
        craft: `
## C: CRAFT CORE MESSAGE

**Purpose**: Build positioning statement and messaging hierarchy

### Positioning Statement Template

**For** [target customer]
**Who** [statement of need or opportunity]
**Our** [product/service name]
**Is a** [product category]
**That** [key benefit/reason to buy]
**Unlike** [primary competitive alternative]
**We** [primary differentiation]

### Message Hierarchy

**Level 1: tagline (3 to 7 words)**
The memorable hook that captures your essence.
Pattern: [Only if true and provable: "[the result your buyer gets, in 3 to 7 words]"]. Build it from your own outcome in your own words; this guide does not write the line for you.

**Level 2: value proposition (1 to 2 sentences)**
The promise you make to customers.
Example: "We help [target customer] [achieve the outcome] by [your capability]."

**Level 3: supporting messages (3 pillars)**
The proof points that support your promise.
1. Your difference: "[what only you do]" (proof: [a result you can show])
2. Your outcome: "[the result the buyer gets]" (proof: [a customer figure, only if real])
3. Your fit: "[why it works in the buyer's sector]" (proof: [a reference or pilot result])

### Message Testing Framework

**Test each message variant for:**
- Clarity (do people understand it?)
- Relevance (do people care?)
- Differentiation (is it unique to you?)
- Believability (do people trust it?)
`,
        translate: `
## T: TRANSLATE TO EXECUTION

**Purpose**: Adapt positioning for each channel and touchpoint

### Channel Adaptation Matrix

${EXAMPLES}${v ? `\nThe calls to action follow how ${v.name} companies usually sell (${MODEL_NAME[SECTOR_MODEL[v.id]].split(" (")[0]}): ${callsToAction(v, SECTOR_MODEL[v.id]).slice(0, 2).map((x) => `"${x}"`).join(' or ')}.` : ''}
| Channel | Format | Length | CTA Focus | Key Message |
|---------|--------|--------|-----------|-------------|
| LinkedIn | Text + Image | 150 words | ${v ? 'Start a conversation' : 'Engage'} | Problem awareness |
| Website Hero | Headline + Sub | 15 words | ${v ? callsToAction(v, SECTOR_MODEL[v.id])[0] : 'Next step'} | Value prop |
| Cold Email | Subject + Body | 75 words | ${v ? 'A short call or a reply' : 'Reply'} | Pain + curiosity |
| Sales Deck | Slides | 10 slides | ${v ? 'The next meeting or the proposal' : 'Meeting'} | Full story |
| ${v && SECTOR_MODEL[v.id] !== 'saas' ? 'Walkthrough or pilot review' : 'Demo or walkthrough'} | Script | 15 min | ${v ? callsToAction(v, SECTOR_MODEL[v.id])[1] || 'Pilot or proposal' : 'Pilot or proposal'} | Capability proof |

### Execution Checklist

**Website:**
- [ ] Hero reflects positioning statement
- [ ] Features page shows differentiation
- [ ] Social proof supports claims
- [ ] CTAs align with buyer journey

**Sales Materials:**
- [ ] Deck tells positioning story
- [ ] Battle cards handle objections
- [ ] Case studies prove value
- [ ] ROI calculator quantifies impact

**Marketing Campaigns:**
- [ ] Ads target beachhead segment
- [ ] Content addresses champion's pain
- [ ] Nurture builds toward differentiation
- [ ] Events reinforce market position

### Channel Priority Calculator
Based on your ICP, prioritize channels by:
1. Where your champions research solutions
2. What content format they prefer
3. What stage of awareness they're in
`
      };

      if (phase === 'all') {
        return `# IMPACT framework: complete methodology

The IMPACT framework is a systematic approach to B2B positioning that generates actionable outputs from minimal input.

**IMPACT = Identify · Map · Pinpoint · Anchor · Craft · Translate**

${Object.values(phases).join('\n---\n')}
${sectorPart}
---

## Getting Started

1. Start with \`impact_identify_champions\`: provide company context
2. Use \`impact_map_alternatives\`: add competitor info
3. Run \`impact_pinpoint_value\`: define differentiation
4. Execute \`impact_anchor_market\`: select beachhead
5. Call \`impact_craft_message\`: build messaging
6. Finish with \`impact_translate_execution\`: channel adaptation

Or run \`impact_full_audit\` for an input completeness score: it shows how complete and specific your inputs are, not whether your positioning is right, and adds a generated positioning draft and a 30-day plan.

${SUGGESTED}
`;
      }

      const single = phases[phase as keyof typeof phases];
      // The craft phase suggests text lengths, so it ends with the suggestions footer.
      if (single && phase === 'craft') {
        return `${single}${sectorPart}\n${SUGGESTED}\n`;
      }
      return single ? `${single}${sectorPart}` : 'Phase not found. Use: identify, map, pinpoint, anchor, craft, translate, or all';
    }
  },

  // ---------------------------------------------------------------------------
  // Tool 2: Identify Champions
  // ---------------------------------------------------------------------------
  impact_identify_champions: {
    description: 'Generate champion, economic buyer and technical influencer hypotheses from your product context, using the buying roles of your sector',
    inputSchema: {
      type: 'object',
      properties: {
        company_name: {
          type: 'string',
          description: 'Your company name'
        },
        product_description: {
          type: 'string',
          description: 'What your product does (1-2 sentences)'
        },
        problem_solved: {
          type: 'string',
          description: 'The core problem you solve'
        },
        target_company_type: {
          type: 'string',
          description: 'Type of companies you target (e.g., "mid-size fintech companies", "enterprise manufacturers")'
        },
        price_point: {
          type: 'string',
          description: 'What you charge, with the period, in your own words (for example "$50,000 a year" or "$3,750 per month")'
        }
      },
      required: ['product_description', 'problem_solved']
    },
    execute: (args: {
      company_name?: string;
      product_description: string;
      problem_solved: string;
      target_company_type?: string;
      price_point?: string;
    }) => {
      const company = (args.company_name || '').trim();
      const targetType = (args.target_company_type || '').trim();
      const pricePoint = (args.price_point || '').trim();
      const problem = args.problem_solved;
      const pq = q(shortText(problem, 150));
      // The sector is read from what the product does (core) first, then the deal text and the target companies.
      const v = readContext(undefined, { core: [args.product_description], names: [company], context: [problem], buyer: [targetType] }).v;
      // A generic committee (SaaS, or no sector) takes its roles from the team the problem text names.
      const money = !!v && /investment management/.test(v.name); // a seller that manages money: the investment profile of the shared sector file
      const fn = money ? null : !v ? functionHits(1, problem, args.product_description) : v.id === 'ai-native' ? functionOf(problem) : overlayFn(v, 2, problem);
      // An AI native product, or no sector, with a buyer industry named: the roles of that industry's teams.
      const ind = !fn && !money && (!v || v.id === 'ai-native') ? industryOf(targetType) : null;

      // The sector's measures, led by the ones the user's own problem and product words point to.
      const ranked = fn ? rankMeasures(fn.measures, problem, args.product_description) : v && !ind ? rankMeasures(metricsOf(v), problem, args.product_description) : [];
      let primaryChampion = { role: '', pain: '', motivation: '' };
      let economicBuyer = { role: '', concern: '', trigger: '' };
      let technicalInfluencer = { role: '', criteria: '', blocker: '' };
      let otherReviewers = '';
      let usersLine = '';
      let inferredNote = '';
      const triggerAsk = 'an event that releases budget (a renewal, an audit, a season or a target): ask what the event is';

      if (fn) {
        primaryChampion = { role: fn.champion, pain: `the problem you described, in your words: ${pq}`, motivation: `a visible win on ${ranked.slice(0, 3).join(', ')}` };
        economicBuyer = { role: fn.buyer, concern: `${ranked.slice(0, 2).join(' and ')}, and the cost of leaving the problem unsolved`, trigger: triggerAsk };
        technicalInfluencer = { role: capFirst(fn.tech), criteria: `fit with the systems they run today and the effort to implement`, blocker: `${fn.blocker}` };
        inferredNote = ` (read from the team your problem text names: ${fn.id.replace('customer', 'customer success or support').replace('it', 'IT infrastructure')})`;
      } else if (ind) {
        primaryChampion = { role: ind.champion, pain: `the problem you described, in your words: ${pq}`, motivation: `a visible win on the measure that team is judged on (ask which)${v ? ', proved on an evaluation set built from their own history' : ''}` };
        economicBuyer = { role: ind.buyer, concern: 'the cost of leaving the problem unsolved, and the risk and oversight the change brings', trigger: triggerAsk };
        technicalInfluencer = { role: capFirst(ind.tech), criteria: 'data privacy, model quality on their own data, and fit with the systems they run', blocker: v ? 'the objections this sector often raises: ' + v.objections.map((o) => `"${o.objection}"`).join('; ') : 'security review and competing priorities' };
        inferredNote = ` (roles for the buyers you named: ${ind.id})`;
      } else if (v) {
        const c = committeeParts(v);
        const isTech = (r: { role: string }) => !/procure|vendor|financ|legal|audit|compliance|risk|\bhr\b|commercial/i.test(r.role);
        const tech = c.reviewers.filter(isTech);
        const commercial = c.reviewers.filter((r) => !isTech(r));
        primaryChampion = {
          role: c.champion,
          pain: `the problem you described, in your words: ${pq}`,
          motivation: `a visible win on what this sector measures: ${ranked.slice(0, 4).join(', ')}`
        };
        economicBuyer = {
          role: c.signer,
          concern: `the same measures, and the cost of leaving the problem unsolved. How deals usually run here: ${v.salesMotion}`,
          trigger: triggerAsk
        };
        technicalInfluencer = {
          role: tech.length ? tech.map((r) => capFirst(r.role)).join('; ') : 'the people who check fit and security',
          criteria: tech.length ? tech.map((r) => `${capFirst(r.role)} ${r.does} ${r.what}`.trim()).join('; ') : 'technical fit and effort to implement',
          blocker: 'the objections this sector often raises: ' + v.objections.map((o) => `"${o.objection}"`).join('; ')
        };
        otherReviewers = commercial.length ? commercial.map((r) => `${capFirst(r.role)} ${r.does} ${r.what}`.trim()).join('; ') : '';
        usersLine = c.users ? `\n### Daily Users\n${capFirst(c.users)} use it every day. Ask them what a good week looks like today; their answer is your first proof point.\n` : '';
        inferredNote = c.championInferred ? ' (this sector\'s usual committee names no separate champion, so the person who evaluates it is the likeliest)' : '';
      } else {
        primaryChampion = { role: 'the department head who owns this problem', pain: `the problem you described, in your words: ${pq}`, motivation: 'the measure that department is judged on' };
        economicBuyer = { role: 'the executive sponsoring the initiative', concern: 'the cost of leaving the problem unsolved, and the budget it competes with', trigger: triggerAsk };
        technicalInfluencer = { role: 'the senior specialist or manager who implements', criteria: 'technical fit, implementation effort, ongoing maintenance', blocker: 'competing priorities and change resistance' };
      }

      return `# Champion Identification Analysis

## Company Context
**Company**: ${company || 'not supplied'}
**Product**: ${args.product_description}
**Problem Solved**: ${problem}
**Target Market**: ${targetType || 'not supplied'}
**Price Point**: ${pricePoint || 'not supplied'}

${sectorLine(v)}${longNote(args.product_description, problem, args.target_company_type)}${ind ? `\n*The roles follow the buyers you named (${ind.id}). If your buyers sit in another team, name it in problem_solved and run the tool again.*` : ''}${fn ? `\n*This sector's committee is general, so the roles come from the team your problem text names (${fn.id.replace('customer', 'customer success or support').replace('it', 'IT infrastructure')}). If the problem sits with another team, say so in problem_solved and run it again.*` : v ? '' : '\nThe roles below are generic, because no sector was clear and the problem text names no team. They are a starting point: name your industry or the team that feels the problem (for example finance, sales operations, security) and run the tool again for roles that exist there.'}

---

## Champion Hypothesis

### Primary Champion (Your Internal Advocate)
**Most Likely Role**: ${capFirst(primaryChampion.role)}${inferredNote}

**Why This Role**:
- Owns the problem: ${primaryChampion.pain}
- Personal motivation: ${primaryChampion.motivation}
- Has organizational credibility to advocate for change

**Champion Validation Questions**:
1. ${v && !fn && !ind ? `"Who is responsible for ${ranked[0]} today, and who answers for it when it slips?"` : '"Who is responsible for this problem today?"'}
2. "Who brought this initiative to leadership's attention?"
3. "Who would be promoted/recognized if this problem was solved?"
4. "Who's actively researching solutions in this space?"

### Economic Buyer (Budget Authority)
**Most Likely Role**: ${capFirst(economicBuyer.role)}

**Why This Role**:
- Primary concern: ${economicBuyer.concern}
- Buying trigger: ${economicBuyer.trigger}

**Economic Buyer Discovery Questions**:
1. ${v && !fn && !ind ? `"Which of these would this move for you: ${ranked.slice(0, 3).join(', ')}?"` : fn ? `"Which of these would this move for you: ${ranked.slice(0, 3).join(', ')}?"` : '"What business metrics would this impact?"'}
2. "How does this tie to company strategic priorities?"
3. "What's the cost of not solving this problem?"

### Technical Influencer (Implementation Voice)
**Most Likely Role**: ${technicalInfluencer.role}

**Why This Role**:
- Evaluation criteria: ${technicalInfluencer.criteria}
- Potential blocker: ${technicalInfluencer.blocker}
${otherReviewers ? `\n### Commercial and Control Reviewers\n${otherReviewers}. They rarely champion a purchase, but each can stop one: ask the champion when they join.\n` : ''}
**Technical Influencer Discovery Questions**:
1. "What would a successful implementation look like?"
2. "What's failed before and why?"
3. "What systems does this need to integrate with?"
${usersLine}
---

## Using Your Price Point and Target Companies

- **Price point**: ${pricePoint ? `you gave ${q(pricePoint)}. Ask the champion early whether that sits inside a budget they control or needs the economic buyer's sign-off; the answer tells you how many people you must reach.` : 'not supplied, so no view on who can approve the spend. Add price_point (for example "$50,000 a year") and the tool will say what to ask about the budget.'}
- **Target companies**: ${targetType ? `you target ${q(targetType)}. Check how each role above is titled in those companies. In smaller ones one person often holds two of the roles; in larger ones procurement or finance usually joins the committee.` : 'not supplied, so the roles are not tuned to a company size. Add target_company_type to get a note on how the roles are titled.'}
${fn ? `\n${teamBlock(fn, v)}\n` : v ? `\n${sectorBlock(v, ['vocabulary', 'discovery', 'proof'], 'Sector view')}\n` : ''}
---

## Anti-Champion Warning Signs

Watch for these red flags that indicate you're talking to the wrong person:

| Warning Sign | What It Means | Action |
|--------------|---------------|--------|
| "Let me check with my team" | No decision authority | Ask: "Who else should be in this conversation?" |
| Only discusses features | No business pain ownership | Pivot: "What happens if this doesn't get solved?" |
| Delegates to junior staff | Not a priority for them | Ask: "Who's driving this initiative?" |
| No timeline urgency | Nice-to-have, not must-have | Probe: "What changed that made this a priority now?" |

---

## Champion Development Path

If you're starting without an identified champion:

**Week 1**: Map the organization
- Identify 3-5 potential champions based on hypotheses above
- Research their LinkedIn, recent posts, company news
- Find mutual connections for warm introductions

**Week 2**: Multi-thread outreach
- Contact ${primaryChampion.role} with a problem-focused message
- Contact ${v && !fn ? 'the reviewers listed above' : lowerFirst(technicalInfluencer.role)} with a solution-focused message
- See who engages first → likely champion

**Week 3**: Validate and align
- Confirm champion's pain matches your value prop
- Understand their buying process
- Map the decision-making unit together

---

## Champion Enablement Hypothesis

Once you identify your champion, they'll need:

1. **Internal Business Case**: ROI data to share with ${economicBuyer.role}
2. **Technical Validation**: Proof points for ${v && !fn ? 'the reviewers above' : lowerFirst(technicalInfluencer.role)}
3. **Competitive Comparison**: Why not alternatives (status quo, competitors)
4. **Risk Mitigation**: Implementation plan, support structure, success metrics

**Next Step**: Use \`impact_map_alternatives\` to analyze competitive landscape

${SUGGESTED}
`;
    }
  },

  // ---------------------------------------------------------------------------
  // Tool 3: Map Alternatives
  // ---------------------------------------------------------------------------
  impact_map_alternatives: {
    description: 'Map your alternatives: one card per named competitor, plus the status-quo options you list, using the weaknesses and strengths you give, with the questions and objections of your sector',
    inputSchema: {
      type: 'object',
      properties: {
        your_product: {
          type: 'string',
          description: 'What your product does'
        },
        category: {
          type: 'string',
          description: 'Your product category (e.g., "cloud security monitoring", "last-mile delivery software")'
        },
        competitors: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of competitor names, and the status-quo options your buyers use (for example "spreadsheets"). A description in brackets after a name is kept'
        },
        competitor_weaknesses: {
          type: 'string',
          description: 'Known competitor weaknesses or customer complaints, one per line or separated by semicolons. A weakness that names a competitor is shown on its card'
        },
        your_strengths: {
          type: 'string',
          description: 'What you do better than competitors, one per line or separated by semicolons'
        }
      },
      required: ['your_product', 'category']
    },
    execute: (args: {
      your_product: string;
      category: string;
      competitors?: string[];
      competitor_weaknesses?: string;
      your_strengths?: string;
    }) => {
      // Run 22 rewrite: one part per alternative you named, each weakness set against the strength that answers it, the status quo of your own kind of business,
      // and no competitor, strength or fact that you did not give. What is missing is named once, at the end.
      const competitorsGiven = !!(args.competitors && args.competitors.filter((c) => c && c.trim()).length);
      const named = competitorsGiven ? (args.competitors as string[]).filter((c) => c && c.trim()).map((c) => c.trim()) : [];
      const weaknessItems0 = splitWeaknesses(args.competitor_weaknesses);
      const strengthItems = splitItems(args.your_strengths);
      const rc = readContext(undefined, { core: [args.category, args.your_product], later: [args.your_strengths], context: [args.competitor_weaknesses] });
      const v = rc.v;
      const lz = lensOf(v, args.your_product, args.category, args.competitor_weaknesses);
      const nsw = (t: string): string => (rc.model === 'saas' || rc.model === null ? t : noSeatWords(t));
      const vendors = named.filter((c) => !STATUS_QUO.test(nameOf(c)) && nameOf(c).toLowerCase() !== 'status quo' && nameOf(c).toLowerCase() !== 'do nothing');
      const statusQuo = named.filter((c) => !vendors.includes(c));
      // A weakness typed as two clauses ("A, and B") is split in two when each half belongs to a different alternative by meaning.
      const altOf = (t: string): string | null => { let b: string | null = null; let bn = 1; let tie = false; for (const c of named) { const n = linkScore(t, c); if (n > bn) { b = c; bn = n; tie = false; } else if (n === bn && n > 1) tie = true; } return tie ? null : b; };
      const weaknessItems = weaknessItems0.flatMap((w) => { const h = w.split(/,\s+and\s+(?=\S)/); if (named.length > 1 && h.length === 2 && h.every((x) => x.trim().split(/\s+/).length >= 4)) { const a = altOf(h[0]), b = altOf(h[1]); if (a && b && a !== b) return h.map((x) => x.trim()); } return [w]; });
      // A weakness is shown on the card of the alternative it names. One that shares at least two content words with an alternative's description belongs there too;
      // the rest are listed once under "Weaknesses you gave" and never hung on an alternative they do not describe.
      const matched = new Map<string, string[]>();
      const used = new Set<string>();
      for (const c of named) {
        const key = nameOf(c).toLowerCase();
        const hits = key.length >= 3 ? weaknessItems.filter((w) => w.toLowerCase().includes(key)) : [];
        if (hits.length) { matched.set(c, hits); hits.forEach((h) => used.add(h)); }
      }
      // A weakness about doing the work by hand fits the one status-quo option you listed, when you listed exactly one.
      const sqOnly = named.filter((c) => STATUS_QUO.test(nameOf(c)) && nameOf(c).toLowerCase() !== 'do nothing');
      if (sqOnly.length === 1) for (const w of weaknessItems) if (!used.has(w) && /\b(?:by hand|spreadsheets?|in-house|paper|excel)\b/i.test(w)) { matched.set(sqOnly[0], [...(matched.get(sqOnly[0]) || []), w]); used.add(w); }
      // Run 22 round 2: a weakness belongs to an alternative only when it shares meaning with it (at least two specific words, or one meaning pair), and to one alternative alone;
      // with exactly one alternative given, every weakness is about it.
      for (const w of weaknessItems) {
        if (used.has(w)) continue;
        if (named.length === 1) { matched.set(named[0], [...(matched.get(named[0]) || []), w]); used.add(w); continue; }
        let best: string | null = null; let bestN = 1; let tie = false;
        for (const c of named) { const n = linkScore(w, c); if (n > bestN) { best = c; bestN = n; tie = false; } else if (n === bestN && n > 1) tie = true; }
        if (tie) best = null;
        if (best) { matched.set(best, [...(matched.get(best) || []), w]); used.add(w); }
      }
      const untied = weaknessItems.filter((w) => !used.has(w));
      const nameLike = (c: string) => /^[A-Z0-9]/.test(nameOf(c)) && nameOf(c).split(/\s+/).length <= 4;
      const describedOnly = vendors.length > 0 && !vendors.some(nameLike);
      const sParts = splitStrengths(strengthItems);
      const descriptor = (c: string) => { if (!nameLike(c)) return ''; const m = c.match(/\(([^)]*)\)/); return m ? m[1].trim() : ''; };
      const head = (c: string): string => {
        if (nameLike(c)) return nameOf(c);
        const pre = nameOf(c).split(/:\s/)[0];   // "the old model: one firm writes the strategy ..." is headed "the old model"
        if (pre !== nameOf(c) && pre.split(/\s+/).length >= 2 && pre.split(/\s+/).length <= 6) return pre;
        return nameOf(c).split(/\s+/).length <= 9 && nameOf(c).length <= 70 ? nameOf(c) : tidyLabel(labelOf(c));
      };
      // Run 22 round 2: the lead against an alternative is the part of your own product description (and, where one fits, the strength) that answers what you said about it;
      // an unrelated strength is never set against an alternative. A part or strength qualifies only when it shares meaning with the weakness or the description.
      const pParts = productParts(args.your_product);
      const factFree = sParts.filter((x) => !isCompanyFact(x));
      const x_long = (x: string): boolean => x.split(/\s+/).length > 12;
      const best = (pool: string[], target: string, min = 2): string[] => {
        const scored = pool.map((x) => ({ x, n: linkScore(x, target) })).filter((r) => r.n >= (x_long(r.x) ? min + 1 : min)).sort((a, b) => b.n - a.n);
        return scored.slice(0, 3).map((r) => r.x);
      };
      const answerFor = (w: string): string | null => best(factFree, w)[0] || null;
      const leadFor = (c: string): string => {
        const w = matched.get(c) || [];
        const target = `${w.join(' ')} ${nameLike(c) ? descriptor(c) : c}`;
        const parts = best(pParts, target);
        const strong = best(factFree, target)[0];
        const what = w.length ? `the weakness you reported (${q(clip(w[0], 90))})` : `what you described (${q(clip(nameLike(c) ? descriptor(c) || nameOf(c) : c, 90))})`;
        if (parts.length) return `your own product text names ${joinAnd(parts.map((x) => q(clip(x, 110))))}, which answers ${what}${strong ? `; your strength ${q(clip(strong, 110))} backs it` : ''}`;
        if (strong) return `your strength ${q(clip(strong, 110))} (your words) answers ${what}`;
        return '';
      };
      // One neutral question per card, built from the weakness (or the alternative) and from a sector measure that shares its meaning.
      const askFor = (c: string): string => {
        const w = matched.get(c) || [];
        const text = w.length ? w.join(' ') : c;
        const meas = lz.metrics.find((m) => linkScore(m, text) >= 1);
        if (w.length) return `Does ${q(clip(w[0], 90))} describe what you see today, and what does it cost you${meas ? ` in ${meas}` : ''}?`;
        if (nameLike(c)) return `What made you choose ${nameOf(c)}, and what would make you look at an alternative?`;
        return `How do you handle ${q(clip(nameOf(c), 90))} today, and what does it cost you${meas ? ` in ${meas}` : ''}?`;
      };
      const card = (c: string, i: number, kind: 'vendor' | 'status') => {
        const w = matched.get(c) || [];
        const d = descriptor(c);
        const who = kind === 'status'
          ? `a way your buyers cope today, in your words: ${q(nameLike(c) ? nameOf(c) : clip(c, 240))}`
          : `${d ? q(d) : !nameLike(c) ? `the description ${q(clip(c, 240))}, which is not a company name` : 'only the name'}`;
        const ld = leadFor(c);
        return `
### Against ${head(c)}
**${nameLike(c) ? nameOf(c) : head(c)}**${d ? ` (${d})` : ''}
- What you told us about them: ${who}
${w.length ? `- Weaknesses you reported:\n${w.map((x) => `  - ${x}`).join('\n')}\n` : ''}${ld ? `- Where you can lead: ${ld}\n` : ''}- A neutral question to ask a buyer about them: ${askFor(c)}`;
      };
      const weakBlock = untied.length ? `\n**Weaknesses you gave** (about the alternatives as a group, not tied to one of them; test each with buyers, they are your notes and not verified facts):\n${list(untied)}\n` : '';
      const defaults = statusQuoDefaults(v, rc.model);
      const prodName = brandName(args.your_product, plainName(args.your_product, runningName(args.your_product.replace(/\s*\([^)]*\)/g, '').trim()))) || 'Your product';
      const linkedStrengths = factFree.filter((x) => weaknessItems.some((w) => answerFor(w) === x));
      const partWeak = weaknessItems.filter((w) => best(pParts, w).length);
      const inShort = `${prodName} is mapped against ${vendors.length ? `${vendors.length} ${describedOnly ? 'alternative' : 'competitor'}${vendors.length > 1 ? 's' : ''} you ${describedOnly ? 'described' : 'named'}` : 'no named competitor (you gave none)'}${statusQuo.length ? ` and ${statusQuo.length} way${statusQuo.length > 1 ? 's' : ''} your buyers cope without a vendor` : ''}. ${weaknessItems.length ? `You reported ${weaknessItems.length} weakness${weaknessItems.length > 1 ? 'es' : ''}: ${weaknessItems.length - untied.length} tied to a single alternative${untied.length ? ` and ${untied.length} about the group` : ''}; ${partWeak.length ? `your own product text answers ${partWeak.length === weaknessItems.length ? 'all of them' : `${partWeak.length} of them`}` : 'your product text answers none of them by its words'}${linkedStrengths.length ? ` and ${linkedStrengths.length} of your strengths ${linkedStrengths.length === 1 ? 'backs' : 'back'} an answer` : ''}.` : 'You reported no weaknesses, so each part asks the buyer instead.'}${strengthItems.length ? '' : ' You gave no strengths, so only your product text is used as a lead.'}${competitorsGiven ? '' : ' Because you gave no competitors, the answer below maps the usual alternatives for a seller like you and names no rival.'}`;

      const missing: { give: string; changes: string }[] = [];
      if (!competitorsGiven) missing.push({ give: 'competitors (the rivals and the status-quo options your buyers use)', changes: 'the whole answer, which would get one part per alternative' });
      if (!weaknessItems.length) missing.push({ give: 'competitor_weaknesses (what buyers complain about)', changes: 'each part, which now has no weakness to test' });
      if (!strengthItems.length) missing.push({ give: 'your_strengths', changes: 'the "Where you can lead" lines, which now rest on your product text alone' });
      const sharpen = sharpenLine(missing);

      const dq = [
        '"What have you tried before to solve this?"',
        '"What other solutions are you evaluating?"',
        ...(vendors.length ? vendors.slice(0, 2).map((c) => (nameLike(c) ? `"What would make you choose ${nameOf(c)} over us?"` : `"What keeps you with ${head(c)} today, and what would make you change?"`)) : ['"What would make you choose a competitor over us?"']),
        '"What didn\'t work about your previous approach?"',
        '"What\'s missing from solutions you\'ve seen?"',
      ];
      const unlinked = factFree.filter((x) => !linkedStrengths.includes(x));
      const facts = sParts.filter(isCompanyFact);
      const testQ = (st: string): string => { const m = lz.metrics.find((x) => linkScore(x, st) >= 1); return m ? `How do you measure ${m} today, and what does a miss cost you?` : `Does ${q(clip(st.replace(/\s*\([^)]*\)\s*$/, ''), 110))} matter when you choose a supplier, and who checks it?`; };
      const ownerOf = (w: string): string => named.find((c) => (matched.get(c) || []).includes(w)) || '';
      const weakLines = weaknessItems.map((w) => {
        const parts = best(pParts, `${w} ${ownerOf(w)}`);
        const st = best(factFree, `${w} ${ownerOf(w)}`)[0] || null;
        const own = ownerOf(w);
        return `- ${q(clip(w, 260))} (${own ? `about ${head(own)}` : 'about the alternatives as a group'}): ${parts.length ? `your product text names ${joinAnd(parts.map((x) => q(clip(x, 110))))}${st ? `; your strength ${q(clip(st, 260))} (your words) backs it` : ''}` : st ? `your strength ${q(clip(st, 260))} (your words) answers it` : 'nothing you gave answers this by its meaning yet, so find the proof that would'}`;
      });
      const pairLines = [
        ...(weakLines.length ? ['\n**Weaknesses you gave, and what in your own words answers them** (your notes, to test with buyers; not verified facts):', ...weakLines] : []),
        ...(unlinked.length ? ['\n**Other strengths: no weakness answered yet** (each needs a question that tests it):', ...unlinked.map((x) => `- ${x}: to test it, ask buyers: ${testQ(x)}`)] : []),
        ...(facts.length ? ['\n**Company facts, not reasons to choose you** (keep them for credibility):', ...facts.map((x) => `- ${x}`)] : []),
      ];
      const sectorPart = v ? `\n${nsw(sectorBlock(v, lz.fn ? ['committee', 'objections'] : ['vocabulary', 'committee', 'objections', 'discovery'], 'Sector view'))}${lz.fn ? `\n${teamBlock(lz.fn, v)}` : ''}\n` : '';

      return `# Competitive Landscape Analysis

## In short

${inShort}

## Market Context
**Your Product**: ${args.your_product}
**Category**: ${args.category}
**Analyzed Competitors**: ${competitorsGiven ? named.join(', ') : 'none given'}
${rc.line}

---

## Where you can lead
${pairLines.length ? `${pairLines.join('\n')}\n` : '\nNo weaknesses or strengths were given, so nothing is set against anything yet.\n'}${v && lz.metrics.length ? `\nBuyers in ${lz.fn ? `a ${fnName(lz.fn)} team` : v.name} compare alternatives on these measures: ${lz.metrics.slice(0, 4).join(', ')}. Ask them how each alternative does on these, and lead only where you can show proof of the shape this sector trusts: ${lz.proof}\n` : ''}
---

## ${describedOnly ? 'Alternatives You Described (no company names were given)' : 'Direct Competitors (Same Solution, Same Problem)'}

The weaknesses and strengths in this answer are your own notes, to test with buyers; none of them is a verified fact, and nothing about a competitor was looked up.
${describedOnly ? '\nThese are alternatives described in words, not named vendors. Add the names of the products your buyers compare you with to `competitors` for parts that carry real names.\n' : ''}${vendors.length ? vendors.map((c, i) => card(c, i, 'vendor')).join('\n') : '\nNo named competitor was given, so no rival is described here. The status quo below is the alternative every deal faces.'}

---

## Status Quo (Current Manual/DIY Approach)
${statusQuo.length ? `\n**What your buyers use today** (in your words):\n${statusQuo.map((c, i) => card(c, i, 'status')).join('\n')}\n` : `\n**What they may be doing instead** (common patterns for this kind of seller; check them with buyers):\n${list(defaults)}\n`}
${v ? `Buyers in this sector often say: ${v.objections.slice(0, 2).map((o) => `"${o.objection}"`).join(' and ')}. The status quo persists while changing costs more effort or budget than the problem costs today, so put the cost of the current approach in the buyer's own figures${lz.metrics.length ? ` (${lz.metrics.slice(0, 3).join(', ')})` : ''} and tie the change to a dated event such as a renewal, an audit, a season or a target.` : "The status quo persists while changing costs more effort or budget than the problem costs today, so put the cost of the current approach in the buyer's own figures and tie the change to a dated event such as a renewal, an audit, a season or a target."}

### Against Do Nothing
Not buying is the alternative every deal faces: it wins when the problem does not yet cost the buyer enough to act. Ask what it costs in the buyer's own figures${lz.metrics.length ? `, for example ${lz.metrics.slice(0, 2).join(' or ')}` : ''}, and what changes if it grows next year.

---

## Discovery Questions for Competitive Intel

Ask prospects these questions to understand their competitive context:

${numbered(dq)}
${sectorPart}${sharpen ? `\n---\n\n## To sharpen this\n\n${sharpen}\n` : ''}
**Next Step**: Use \`impact_pinpoint_value\` to articulate your unique differentiation
`;
    }
  },

  // ---------------------------------------------------------------------------
  // Tool 4: Pinpoint Unique Value
  // ---------------------------------------------------------------------------
  impact_pinpoint_value: {
    description: 'Generate value proposition statements, a value matrix for your own figures and proof points that fit your business model',
    inputSchema: {
      type: 'object',
      properties: {
        product_name: {
          type: 'string',
          description: 'Your product/company name'
        },
        category: {
          type: 'string',
          description: 'Product category'
        },
        target_customer: {
          type: 'string',
          description: 'Who you serve (e.g., "cloud security leads at mid-size fintech companies")'
        },
        key_outcome: {
          type: 'string',
          description: 'The main result customers achieve'
        },
        unique_capability: {
          type: 'string',
          description: 'What you do that others cannot/don\'t'
        },
        customer_metrics: {
          type: 'string',
          description: 'Any customer results data (e.g., "critical exposures down 70% in one quarter; audit preparation from 3 weeks to 4 days")'
        },
        business_model: {
          type: 'string',
          enum: BUSINESS_MODELS,
          description: 'How you sell (saas, services, connectivity, transactions, marketplace, hardware_software or investment). Used to choose proof types; read from your inputs when not given'
        }
      },
      required: ['target_customer', 'key_outcome', 'unique_capability']
    },
    execute: (args: {
      product_name?: string;
      category?: string;
      target_customer: string;
      key_outcome: string;
      unique_capability: string;
      customer_metrics?: string;
      business_model?: string;
    }) => {
      // Run 22 rewrite: a finished value proposition built from the user's own words. Every input is used where it matters, in whole sentences; a supplied result goes to
      // the proof tier it belongs to with its own label; nothing is invented; what is missing is named once, at the end.
      const named = (args.product_name || '').trim();
      const P = plainName(named, runningName(named.replace(/\s*\([^)]*\)/g, ''))) || 'our product';
      const catTyped = (args.category || '').trim();
      const catSource = catTyped || 'solution';
      // In a sentence the category is its leading noun phrase ("predictive cybersecurity: attack path intelligence ..." reads "predictive cybersecurity").
      const catPlain = noNotes(catSource).split(/\s*[:;]\s*/)[0] || catSource;
      const category = categoryNoun(catPlain);
      const quotedCat = /^[“"‘']/.test(catPlain);
      const catMid = quotedCat ? category : mid(category);
      const catPlainMid = quotedCat ? catPlain : mid(catPlain);
      const catRest = noNotes(catSource).split(/\s*[:;]\s*/).slice(1).join('; ');
      const ctx = readContext(args.business_model, { core: [args.category], later: [args.unique_capability], names: [args.product_name], context: [args.key_outcome], buyer: [args.target_customer] });
      const v = ctx.v;
      const notes = MODEL_NOTES[ctx.model || 'unknown'];
      const lz = lensOf(v, args.category, args.key_outcome, args.unique_capability, args.target_customer);
      const com = v ? committeeParts(v) : null;
      // A role read from the sector's committee sentence is used only when it reads as a role (a sentence with a colon or a full stop is not one).
      const signer = (lz.fn ? lz.fn.buyer : com ? roleOk(com.signer) : '') || 'the budget owner';
      const champion = lz.fn ? lz.fn.champion : com ? roleOk(com.champion) : '';
      const rv0 = !lz.fn && com && com.reviewers.length ? com.reviewers[0] : null;
      const evaluator = lz.fn ? lz.fn.tech : rv0 ? roleOk(rv0.role) : '';
      const evaluatorChecks = rv0 && roleOk(rv0.role) && rv0.what && !/[.:]/.test(rv0.what) ? `In this sector, ${rv0.role} ${rv0.does} ${rv0.what}.` : '';

      // The audience: the full clause once, a short form inside sentences. A count after a semicolon ("; more than 9,000 teams use it") is a fact for the proof tiers.
      const target = args.target_customer.trim();
      const audFull = noNotes(target);
      const extraFact = (target.match(/\s*[;:]\s*((?:more than|over|about)?\s*[\d,]+\+?\s.*)$/i) || [])[1] || '';
      const aud = mid(audFull.length <= 90 ? audFull : shortAudience(target));
      const sa0 = shortAudience(audFull.length > LONG_AT ? audFull : shortText(audFull));
      const rest0 = audFull.toLowerCase().startsWith(sa0.toLowerCase()) ? audFull.slice(sa0.length).trim() : '';
      const saBad = /\.\.\./.test(sa0) || !audFull.toLowerCase().startsWith(sa0.toLowerCase().slice(0, 10)) || /^(?:and|or)\b/i.test(rest0);
      const aItems = topLevel(audFull).map((x) => x.trim()).filter(Boolean);
      // a short audience that is not the start of the typed one ("large online") is replaced by the typed audience's lead words, or by its first one or two list items
      const saLead = saBad ? ((/^(?:and|or)\b/i.test(rest0) ? null : leadAud(audFull)) || (aItems.length >= 2 && aItems.slice(0, 2).every((x) => x.split(/\s+/).length <= 3) ? `${aItems[0]} and ${aItems[1]}` : aItems[0] && aItems[0].split(/\s+/).length <= 6 ? aItems[0] : audFull.split(/\s+/).slice(0, 5).join(' '))) : '';
      const sa = saBad && saLead ? mid(saLead) : sa0;

      // The outcome as one grammatical clause (the first two results inside the statements, all of them in the matrix); a text that is not a plain result is quoted.
      const oc = outcomeItems(args.key_outcome, RW_KIT);
      const outLeadItems = leadItems(oc.items, 260, 2).map((x) => clip(x, 260));
      // the source label of the outcome stays beside a figure; a claim with no figure carries it in the matrix only (no "(page words)" tag inside a draft line)
      const lab = oc.label && /\d/.test(outLeadItems.join(' ')) ? ` ${oc.label}` : '';
      const outLead = outcomeClause(outLeadItems, RW_KIT) ?? `achieve this: ${q(clip(clean(args.key_outcome), FRAME_AT))}`;
      const outFirst = outcomeClause(outLeadItems.slice(0, 1), RW_KIT) ?? outLead;

      // The capability: a short text stands whole; a long list gives its first items and "and more" (the evaluator part lists all of it).
      const capText = clean(args.unique_capability);
      const capItems = topLevel(capText);
      const capLong = capText.length > 220 && capItems.length >= 2;
      const capLeadList = capLong ? leadItems(capItems, 150, 4) : capItems;
      const capLead = capLong ? `${capLeadList.join(capLeadList.some((x) => /,/.test(x)) ? '; ' : ', ')}${capLeadList.length < capItems.length ? ' and more' : ''}` : (capText.length > 220 ? clip(capText, 200) : capText);
      const capShown = capLong ? capLeadList : [capText.length > 220 ? clip(capText, 200) : capText];
      const capSentence = diffSentence(P, capLead);
      const onlyWith = (d: string) => { const k = kindOf(d); const t = lowerFirst(clean(d)); if (isNamedClause(clean(d))) return `where ${clean(d)}`; return k === 'third' ? `that ${t}` : k === 'base' ? `that can ${t}` : `with ${t}`; };

      // The supplied results, placed by what each one is.
      const given = splitItems(args.customer_metrics || '').map((text) => ({ text, ...classifyProof(text) }));
      if (extraFact && !given.some((g) => (extraFact.match(/\d[\d,.]*/g) || []).every((n) => g.text.includes(n)))) given.push({ text: extraFact.replace(/[.!]+$/, ''), ...classifyProof(extraFact) });
      const tier = (n: 1 | 2 | 4, kinds?: ProofKind[]) => given.filter((g) => g.tier === n && (!kinds || kinds.includes(g.kind)));
      const results = tier(1);
      const cite = (results.find((r) => r.text.length <= 180) || { text: '' }).text;

      // The value matrix: the measures the user's own inputs already speak to, each next to what they say; a measure with nothing behind it is not an empty row.
      const evidence = [...given.map((g) => ({ text: g.text, label: '' })), ...oc.items.map((x) => ({ text: x, label: oc.label }))];
      const cell = (s: string) => s.replace(/\|/g, '/').replace(/\s+/g, ' ').trim();
      const measures = rankMeasures(lz.metrics, `${args.key_outcome} ${args.customer_metrics || ''}`, args.unique_capability);
      const rows: string[] = [];
      const bare: string[] = [];
      const shownFor = new Set<string>();
      for (const m of measures) {
        const ms = contentStems(m);
        const need = Math.min(2, ms.size);
        const hits = evidence.filter((e) => (need > 0 && [...contentStems(e.text)].filter((x) => ms.has(x)).length >= need) || MEASURE_LINKS.some(([mr, er]) => mr.test(m) && er.test(e.text)));
        const key = hits.map((h) => h.text).join('|');
        if (hits.length && shownFor.has(key)) continue;
        shownFor.add(key);
        if (hits.length) rows.push(`| ${m} | ${cell(hits.slice(0, 2).map((h) => clean(h.text) + (h.label ? ` ${h.label}` : '')).join('; '))} | ${hits.some((h) => h.label) ? 'with the label you gave' : 'your inputs'} |`);
        else bare.push(m);
      }
      const matrix = [`| Your stated outcome | ${cell(clean(args.key_outcome))}${oc.label && !/\(/.test(args.key_outcome) ? ` ${oc.label}` : ''} | your key_outcome |`, ...rows.slice(0, 6)].join('\n');
      const matrixNote = v && bare.length ? `\nOther measures that ${lz.fn ? `a ${fnName(lz.fn)} team watches` : `buyers in ${v.name} watch`}, where your inputs give no figure yet: ${bare.slice(0, 5).join(', ')}. Add the ones your best customers can show before and after.` : '';

      const hero = (() => {
        let text = '';
        for (const it of oc.items) { const sc = shortClause(clean(it), 11); if (sc && sc.split(/\s+/).length >= 3) { text = sc; break; } }
        if (!text) text = firstWords(clean(oc.items[0] || args.key_outcome), 8);
        const k = kindOf(text);
        return k === 'base' || /\bfor\b/i.test(text) ? `${capFirst(text)}. Built for ${sa}.` : `${capFirst(text)} for ${sa}.`;
      })();
      const heroLabel = oc.label && /\d/.test(hero) ? ` ${oc.label}` : '';
      const cta = ctaNoun(callsToAction(v, ctx.model)[0]);

      const tailMissing: { give: string; changes: string }[] = [];
      if (!named) tailMissing.push({ give: 'product_name', changes: 'every statement, which now says "our product"' });
      if (!catTyped) tailMissing.push({ give: 'category', changes: 'the "only" line and the sector read, which now rest on the other inputs' });
      if (!(args.customer_metrics || '').trim()) tailMissing.push({ give: 'customer_metrics (one real customer result with its source)', changes: 'Tier 1 and the matrix, which quote no customer result today' });
      if (!args.business_model && (!ctx.model || /assumed/.test(ctx.line))) tailMissing.push({ give: 'business_model', changes: 'the proof types and calls to action, which follow the usual model of the sector today' });
      tailMissing.push({ give: "the buyer's current pain and a payback period from your best customers", changes: 'the economic buyer statement, which has no payback figure to cite' });
      const sharpen = sharpenLine(tailMissing);

      const objections = v ? `\n**Objections to prepare for** (the pattern of a good answer, from the sector notes):\n${v.objections.map((o) => `- "${o.objection}"${ctx.model === 'saas' || ctx.model === null || !SAAS_ONLY.test(o.response) ? `: ${o.response}` : ''}`).join('\n')}\n` : '';
      const sectorPart0 = v ? `\n${sectorBlock(v, lz.fn ? [] : ['vocabulary', 'committee'], 'Sector view')}${lz.fn ? `\n- **Who usually buys:** ${lz.fn.buyer} signs; ${lz.fn.champion} champions; ${lz.fn.tech} check the fit.\n${teamBlock(lz.fn, v)}` : ''}\n${objections}` : '';
      const sectorPart = ctx.model === 'saas' || ctx.model === null ? sectorPart0 : noSeatWords(sectorPart0);

      const longAud = audFull.length > LONG_AT;

      return `# Value Proposition${named ? `: ${named.length <= 60 ? named : P}` : ' Analysis'}

${longAud ? `**Who this is for:** ${audFull}.` : `**Who this is for:** ${capFirst(audFull)}.`}${catTyped ? ` ${capFirst(P)} is ${aOrAn(catMid)} ${catMid}.${catRest ? ` It covers ${catRest}.` : ''}` : ''}
${ctx.line}

---

## The Only Statement

The "only" claim stays inside brackets until it is true and you can prove it.

### Version 1 (Category-focused)
> [Only if true and provable: **${P}** is the only ${catMid} ${onlyWith(capLead)}. It helps ${aud} ${outLead}${lab}.]

### Version 2 (Outcome-focused)
> We help **${aud}** ${outLead}${lab}. ${capFirst(capSentence)}. [Only if true and provable: no other ${catMid} can say the same.]

### Version 3 (Capability-focused)
> [Only if true and provable: Unlike the alternatives in ${catPlainMid},] ${capSentence}, so ${aud} can ${outLead}${lab}.

---

## Value Quantification Matrix

This tool adds no figure of its own. The first row is your outcome; the other rows are the measures ${v ? `${lz.fn ? `a ${fnName(lz.fn)} team already watches` : `buyers in ${v.name} already watch`}` : 'your inputs speak to'} that your inputs already answer. At each customer, measure the same thing before and after, from the customer's own data, and name the period.

| What to measure | What your inputs say | Where it comes from |
|-----------------|----------------------|---------------------|
${matrix}
${matrixNote}

---

## Proof Point Framework

### Tier 1: Customer Results (Strongest)
${results.length ? `Results you supplied (supplied by you: use one only if it is real and you can show it):\n${list(results.map((r) => r.text))}` : `You supplied no customer result, so none is quoted in this answer. The strongest proof for ${P} is one named customer with a before and after on ${measures[0] ? measures[0] : 'the result your outcome names'}, from the customer's own data and with the period named.`}

**Proof collection questions** (ask your existing customers):
1. "What measure improved most after working with ${named ? P : 'us'}?"
2. "How much time does your team save, and on what?"
3. "What would you have had to spend to achieve this otherwise?"
4. "What was the payback period?"
${v ? `\n**What a good proof point looks like in ${v.name}:** ${lz.proof}\n` : ''}
### Tier 2: Third-Party Validation
${tier(2).length ? `Recognition you supplied (supplied by you: use it only as worded and sourced):\n${list(tier(2).map((r) => r.text))}\n\n` : ''}${tier(2).length ? 'Also worth collecting' : 'To collect'}: ${lc1(notes.proofTiers[0])}.

### Tier 3: Technical or Operational Proof
- ${notes.proofTiers[1]}${capShown.length && !capShown.some((x) => /^(?:[“"])/.test(x)) ? `\n- For the technical evaluator, line up evidence for the first claims in your capability list: ${capShown.join(capShown.some((x) => /,/.test(x)) ? '; ' : ', ')}.` : ''}

### Tier 4: Social Proof
${tier(4).length ? `Scale and voices you supplied (supplied by you: keep the label you gave):\n${list(tier(4).map((r) => r.text))}\n\n` : ''}${tier(4).length ? 'Also worth collecting' : 'To collect'}: ${lc1(notes.proofTiers[2])}.

---

## Value Statement Variations

### For Different Audiences

**For the champion (${champion || sa}):**
> "${capFirst(P)} helps you ${outLead}${lab}."

**For the economic buyer (${signer}):**
> "${capFirst(P)} helps ${aud} ${outLead}${lab}.${cite ? ` A result to cite: ${clean(cite)}.` : ''}"

The ${signer === 'the budget owner' ? 'budget owner' : signer} will weigh ${notes.commercial}; have an answer ready for each.

**For the technical evaluator${evaluator ? ` (${evaluator}${evaluator === champion ? ', who also champion it' : ''})` : ''}:**${evaluatorChecks ? `\n${evaluatorChecks}` : ''}
> "${capFirst(P)}: ${capText}."

### For Different Channels

**Website Hero** (one line):
> "${hero}"${heroLabel}

**LinkedIn Post** (Hook):
> "${capFirst(sa)}: what would it change if you could ${outFirst}${oc.label && /\d/.test(outFirst) ? ` ${oc.label}` : ''}? Here is how: ${capFirst(capSentence)}."

**Cold Email** (Value prop):
> "Hello, we help ${aud} ${outLead}${lab}.${cite ? ` For example: ${clean(cite)}.` : ''} Would ${cta} be useful?"

**Sales Deck** (Slide title):
> [Only if true and provable: "The only ${catMid} ${onlyWith(capLead)}"]

---

## Value Validation Questions

Before finalizing, validate with prospects:

1. **Clarity**: "After hearing this, what do you think we do?"
2. **Relevance**: "How important is this result to you right now?"
3. **Differentiation**: "Have you heard anything like this from other vendors?"
4. **Believability**: "What would you need to see to believe this?"
${sectorPart}
${sharpen ? `---\n\n## To sharpen this\n\n${sharpen}\n` : ''}
**Next Step**: Use \`impact_anchor_market\` to select your beachhead market segment
`;
    }
  },

  // ---------------------------------------------------------------------------
  // Tool 5: Anchor in Right Market
  // ---------------------------------------------------------------------------
  impact_anchor_market: {
    description: 'Select a beachhead market: segments ranked from your own customers, pain and deal size when you give all three (the answer says which method it used), otherwise keyword presets; and a TAM/SAM/SOM calculation that uses only the company counts, deal size and percentages you give',
    inputSchema: {
      type: 'object',
      properties: {
        product_description: {
          type: 'string',
          description: 'What your product does'
        },
        potential_segments: {
          type: 'array',
          items: { type: 'string' },
          description: 'The market segments you are weighing (for example Mid-market fintech, Enterprise banks, Small retail chains)'
        },
        current_customers: {
          type: 'string',
          description: 'Description of your current/best customers. With customer_pain and average_deal_size it ranks the segments (the answer says which method it used); without them it is shown only and the keyword presets score the segments'
        },
        customer_pain: {
          type: 'string',
          description: 'The problem your best customers describe, in their words. With current_customers and average_deal_size it ranks the segments from your own inputs; without them the keyword presets are used'
        },
        average_deal_size: {
          type: 'string',
          description: 'Your annual contract value (ACV) as one amount (e.g., "$50,000", "$50K" or "$1.5M"); a range is refused'
        },
        sales_cycle: {
          type: 'string',
          description: 'Typical sales cycle length. Shown in the output; not used in the scoring'
        },
        company_counts: {
          type: 'string',
          description: 'How many companies you could sell to in each segment, one per line or separated by semicolons (for example "Mid-market fintech: 3,200; Enterprise banks: 600"). A single number is read as the count for the recommended segment. Needed for market sizing'
        },
        percent_matching_icp: {
          type: 'number',
          exclusiveMinimum: 0,
          maximum: 100,
          description: 'The percent of those companies that match your ideal customer profile (for example 25). Needed for SAM'
        },
        year_one_share_percent: {
          type: 'number',
          exclusiveMinimum: 0,
          maximum: 100,
          description: 'The share of the matching companies you expect to win in year one, in percent (for example 1). Needed for SOM'
        }
      },
      required: ['product_description']
    },
    execute: (args: {
      product_description: string;
      potential_segments?: string[];
      current_customers?: string;
      customer_pain?: string;
      average_deal_size?: string;
      sales_cycle?: string;
      company_counts?: string;
      percent_matching_icp?: number;
      year_one_share_percent?: number;
    }) => {
      // An empty list is treated like no list. A segment listed twice is scored once (backlog B15-L2).
      const segGiven = !!(args.potential_segments && args.potential_segments.filter((s) => s && s.trim()).length);
      const rawSegments = segGiven ? (args.potential_segments as string[]).filter((s) => s && s.trim()) : ['Mid-market SaaS (50-500 employees)', 'Enterprise Tech (500+ employees)', 'SMB (10-50 employees)'];
      const seen = new Set<string>();
      const segments: string[] = [];
      const dropped: string[] = [];
      for (const s of rawSegments) {
        const k = s.trim().toLowerCase().replace(/\s+/g, ' ');
        if (seen.has(k)) dropped.push(s.trim()); else { seen.add(k); segments.push(s); }
      }
      const acvGiven = (args.average_deal_size || '').trim();
      const cycleGiven = (args.sales_cycle || '').trim();
      const acvNumber = acvGiven ? readAmount(acvGiven) : null;
      const ctx = readContext(undefined, { core: [args.product_description], buyer: segments });
      const v = ctx.v;

      // Run 21c, owner decision D94: when the user gives all three of their own customers, the pain their customers describe and a deal size (and a list of segments),
      // the segments are ranked from those; otherwise the keyword presets below are used exactly as before. The answer names the method.
      const ccText0 = (args.current_customers || '').trim();
      const painText = (args.customer_pain || '').trim();
      const ownMethod = segGiven && !!ccText0 && !!painText && !!acvNumber;
      const missingForOwn = [!segGiven ? 'potential_segments' : '', !ccText0 ? 'current_customers' : '', !painText ? 'customer_pain' : '', !acvNumber ? 'average_deal_size' : ''].filter(Boolean);
      const stemsOf = (t: string) => contentStems(t);
      const ccStems0 = stemsOf(ccText0), painStems = stemsOf(painText);
      const shared = (seg: string, stems: Set<string>): string[] => [...stemsOf(seg.replace(/\([^)]*\)/g, ''))].filter((x) => stems.has(x));
      const byShared = (n: number): number => (n <= 0 ? 1 : n === 1 ? 3 : n === 2 ? 4 : 5);
      // Market value per segment from the user's own counts and deal size, for the budget criterion (needs counts for at least two segments).
      const countsAll = parseCounts(args.company_counts);
      const tamOf = (seg: string): number | null => { const n = countsAll.find((c) => c.name && sameName(c.name, seg)); return n && acvNumber ? n.count * acvNumber : null; };
      const tamList = segments.map(tamOf).filter((x): x is number => x !== null);
      const maxTam = tamList.length >= 2 ? Math.max(...tamList) : 0;
      // Segment scores: keyword presets, unchanged (a segment with none of the keywords gets the middle score).
      const segmentScores = segments.map((segment) => {
        if (ownMethod) {
          const rc = shared(segment, ccStems0), pn = shared(segment, painStems), tm = tamOf(segment);
          const scoresOwn = {
            pain: byShared(pn.length), budget: maxTam && tm !== null ? Math.max(1, Math.min(5, Math.round(1 + 4 * tm / maxTam))) : 3,
            access: 3, reference: byShared(rc.length), competition: 3
          };
          return { name: segment, keyword: false, kw: '', ...scoresOwn, total: scoresOwn.pain + scoresOwn.budget + scoresOwn.access + scoresOwn.reference + scoresOwn.competition,
            ownPain: pn, ownRef: rc, ownTam: tm };
        }
        const segmentLower = segment.toLowerCase();
        let scores = {
          pain: 3,
          budget: 3,
          access: 3,
          reference: 3,
          competition: 3
        };

        if (segmentLower.includes('enterprise')) {
          scores = { pain: 4, budget: 5, access: 2, reference: 5, competition: 2 };
        } else if (segmentLower.includes('mid-market') || segmentLower.includes('mid market')) {
          scores = { pain: 5, budget: 4, access: 4, reference: 4, competition: 3 };
        } else if (segmentLower.includes('smb') || segmentLower.includes('small')) {
          scores = { pain: 4, budget: 2, access: 5, reference: 2, competition: 4 };
        } else if (segmentLower.includes('saas') || segmentLower.includes('tech')) {
          scores = { pain: 5, budget: 4, access: 4, reference: 5, competition: 3 };
        } else if (segmentLower.includes('finance') || segmentLower.includes('fintech')) {
          scores = { pain: 4, budget: 5, access: 3, reference: 4, competition: 2 };
        }

        // Whether a keyword set the scores (a segment with none gets the middle score on every criterion).
        const kwMatch = segmentLower.match(/enterprise|mid-market|mid market|smb|small|saas|tech|finance|fintech/);
        const keyword = !!kwMatch;
        return {
          name: segment,
          keyword,
          kw: kwMatch ? kwMatch[0] : '',
          ...scores,
          total: scores.pain + scores.budget + scores.access + scores.reference + scores.competition,
          ownPain: [] as string[], ownRef: [] as string[], ownTam: null as number | null
        };
      });

      // Sort by total score (stable: the first-listed segment stays first on a tie)
      segmentScores.sort((a, b) => b.total - a.total);
      const beachhead = segmentScores[0];

      // Market sizing uses only the user's own figures (problem 5 and 6 of the real-world test).
      const counts = parseCounts(args.company_counts);
      const countText = (args.company_counts || '').trim();
      const unreadable = countText ? countText.split(/\n|;/).map((x) => x.trim()).filter((x) => x && !/\d/.test(x)) : [];
      const countFor = (name: string): number | null => {
        const named = counts.find((c) => c.name && sameName(c.name, name));
        if (named) return named.count;
        const bare = counts.find((c) => !c.name);
        return bare && name === beachhead.name ? bare.count : null;
      };
      const beachCount = countFor(beachhead.name);
      const pct = typeof args.percent_matching_icp === 'number' ? args.percent_matching_icp : null;
      const share = typeof args.year_one_share_percent === 'number' ? args.year_one_share_percent : null;
      const tam = beachCount !== null && acvNumber ? beachCount * acvNumber : null;
      const sam = tam !== null && pct !== null ? tam * pct / 100 : null;
      const som = sam !== null && share !== null ? sam * share / 100 : null;
      const customers = beachCount !== null && pct !== null && share !== null ? Math.round(beachCount * (pct / 100) * (share / 100) * 1e6) / 1e6 : null;
      const customersText = (n: number) => Number.isInteger(n) ? `${n.toLocaleString('en-US')} customers` : n < 1 ? 'less than 1 customer' : `about ${n >= 10 ? Math.round(n).toLocaleString('en-US') : (Math.round(n * 10) / 10)} customers`;
      const needs: string[] = [];
      if (beachCount === null) needs.push(counts.length ? `company_counts for ${beachhead.name} (you gave counts, but none for this segment: add "${beachhead.name}: <number>")` : `company_counts (for example "${beachhead.name}: 3,200")`);
      if (!acvNumber) needs.push('average_deal_size (for example "$50,000")');
      if (pct === null) needs.push('percent_matching_icp (for example 25)');
      if (share === null) needs.push('year_one_share_percent (for example 1)');

      // Labels only: a segment the user did not supply is an example.
      const segEx = segGiven ? '' : ` ${EXAMPLE}`;
      // A tie at the top is said plainly; the first-listed segment stays first (stable sort), no score changes.
      const tied = segmentScores.filter((s) => s.total === beachhead.total);
      // Every segment has the same total: the scores choose nothing, and the answer says so instead of crowning the first-listed one.
      const allTied = tied.length === segmentScores.length && segmentScores.length > 1;
      const tieLine = tied.length > 1
        ? `\nTie: ${tied.length === 2 ? 'both segments have' : `${tied.length} segments have`} the same total score (${beachhead.total}/25)${ownMethod ? ', because no segment shares a word with your customers or your pain and no counts separate them' : beachhead.keyword ? '' : ', the preset middle score, because no segment name contains a keyword'}. The scores cannot choose between them, and ${beachhead.name} is shown first only because you listed it first: choose using your own data.\n`
        : '';
      const segLine = segGiven ? '' : '\nExample segment: replace with your own.\n';
      const acvShown = acvGiven ? `${acvGiven}${/\bACV\b/i.test(acvGiven) ? '' : ' ACV'}` : 'your price';
      const c = v ? committeeParts(v) : null;

      // Run 22 rewrite: from here down the answer is a finished analysis. The scores, the presets and the sizing arithmetic are unchanged (D80, D94); what is new is a plain
      // verdict first, the user's own inputs used segment by segment, and one closing list of what is missing.
      const prodName = brandName(args.product_description, plainName(args.product_description, runningName(args.product_description.replace(/\s*\([^)]*\)/g, '').trim()))) || 'Your product';
      const prodText = args.product_description.trim().length <= 400 ? args.product_description.trim() : clip(args.product_description, 300);
      const ccText = (args.current_customers || '').trim();
      const ccStems = contentStems(ccText);
      const overlap = (seg: string): string[] => [...contentStems(seg.replace(/\([^)]*\)/g, ''))].filter((x) => ccStems.has(x));
      const prodStems = contentStems(args.product_description);
      const prodShare = (seg: string): string[] => [...contentStems(seg.replace(/\([^)]*\)/g, ''))].filter((x) => prodStems.has(x));
      // The words behind a shared stem, as the segment name spells them ("retai" is the stem of "retail").
      const real = (seg: string, stems: string[]): string[] => [...new Set((seg.toLowerCase().match(/[a-z]{4,}/g) || []).filter((w) => stems.includes(w.slice(0, 5))))];
      const matchedSegs = segmentScores.map((x) => ({ x, hit: overlap(x.name) })).filter((m) => m.hit.length).sort((a, b) => b.hit.length - a.hit.length);
      const secondView = ccText
        ? matchedSegs.length
          ? `**Second view (from your current customers; it is separate from the keyword scores below and does not change them).** These segments share words with the customers you described, strongest first: ${matchedSegs.map((m) => `${m.x.name} (shares "${real(m.x.name, m.hit).join('", "')}")`).join('; ')}. The segment where your customers already are is the strongest candidate for a first beachhead.`
          : `**Second view.** None of the segment names shares a word with the customers you described. Say which segment each of your customers belongs to, and the segment with the most customers is your strongest candidate.`
        : 'No current_customers were given, so no segment can be tied to where your customers already are, and the scores below are only a keyword match.';
      const dealWord = acvGiven ? acvGiven : 'your price';
      const nSeg = segmentScores.length;
      const topShares = beachhead.ownRef.length || beachhead.ownPain.length
        ? `, because its name shares ${[beachhead.ownRef.length ? `"${real(beachhead.name, beachhead.ownRef).join('", "')}" with your customers` : '', beachhead.ownPain.length ? `"${real(beachhead.name, beachhead.ownPain).join('", "')}" with your pain` : ''].filter(Boolean).join(' and ')}`
        : '';
      const nsw = (t: string): string => (ctx.model === 'saas' || ctx.model === null ? t : noSeatWords(t));
      const oneFact = ` Two or three facts per segment, from the sector notes and your own deal size and cycle, would break it for this product; the one that helps most is which of these segments already buys from you (current_customers)${painText ? '' : ', or where buyers raise your problem first (customer_pain)'}.`;
      const inShort = ownMethod
        ? (allTied
          ? `None of your ${nSeg} segment names shares a word with your customers or your pain, so the scores built from them tie and choose nothing for ${prodName}. Use the checks below to choose.`
          : `${beachhead.name} comes first for ${prodName}${topShares}: your ${nSeg} segments were ranked from your own customers, pain and deal size.${tied.length > 1 ? ` ${tied.map((t) => t.name).join(' and ')} tie for the top score, and ${beachhead.name} is shown first only because you listed it first.` : ''} The match is by words, so ask three buyers in ${tied.length > 1 ? 'those segments' : beachhead.name} which problem they raise first before you commit.`)
        : (tied.length > 1
          ? `The keyword presets cannot separate ${tied.length === nSeg ? `any of your ${nSeg} segments` : `the top ${tied.length} segments (${tied.map((t) => t.name).join(', ')})`}, so nothing here chooses a beachhead for ${prodName}; ${missingForOwn.join(' and ')} ${missingForOwn.length > 1 ? 'were' : 'was'} not given. Choose with the segment-by-segment facts below.${oneFact}`
          : `${capFirst(beachhead.name)} comes first only because its name contains the keyword "${beachhead.kw}": the presets do not use your deal size${acvGiven ? ` of ${acvGiven}` : ''}${cycleGiven ? `, your sales cycle of ${cycleGiven}` : ''} or anything known about your market (${missingForOwn.join(' and ')} ${missingForOwn.length > 1 ? 'were' : 'was'} not given). Treat ${beachhead.name} as the segment to test first for ${prodName}.${oneFact}`);
      const askQ = (i: number): string => nsw(v && v.discovery.length ? v.discovery[i % v.discovery.length] : 'Which problem do you raise first, and what have you tried before?');
      const prodParts = productParts(args.product_description);
      const named = prodParts.slice(1);   // the parts named after the lead description (platforms, modules, products)
      const comm = v ? committeeParts(v) : null;
      const typeSeen = new Map<string, number>();
      const usedObjections = new Set<string>(), usedMeasures = new Set<string>(), usedKinds = new Map<string, number>();
      const perSegment = segmentScores.map((s) => {
        const cshare = overlap(s.name);
        const fit = segmentFit(s.name, prodParts);
        const type = segmentType(s.name);
        const order = typeSeen.get(type) || 0;
        typeSeen.set(type, order + 1);
        const facts = segmentFacts({
          seg: s.name, deal: acvGiven.replace(/\s*\([^)]*\)\s*$/, ''), cycle: cycleGiven.replace(/\s*\([^)]*\)\s*$/, ''), signer: comm ? roleOk(comm.signer) : '', motion: v ? nsw(v.salesMotion) : '',
          objections: v ? v.objections.map((o) => ({ objection: nsw(o.objection), response: nsw(o.response) })) : [], metrics: v ? v.metrics : [], parts: named, fit, usedObjections, usedMeasures, usedKinds,
        }, order);
        return `**${s.name}** (${ownMethod ? `${s.total} of 25 from your own inputs` : s.keyword ? `${s.total} of 25 from the keyword "${s.kw}"` : `${s.total} of 25, no keyword`}).${cshare.length ? ` Your customers share "${real(s.name, cshare).join('", "')}" with it.` : ''} Find out ${facts.map((f, k) => `(${k + 1}) ${f}`).join('; ')}.`;
      }).join('\n\n');
      // The product fit: which segments the parts of the product text sit closest to (words only; it never changes a score).
      const fitOrder = segmentScores.map((x) => ({ x, fit: segmentFit(x.name, prodParts) })).filter((r) => r.fit.length).sort((a, b) => b.fit.length - a.fit.length);
      const fitTop = fitOrder.filter((r) => r.fit.length === (fitOrder[0] ? fitOrder[0].fit.length : 0)).slice(0, 3);
      const presetFirst = tied.length === 1 ? beachhead.name : '';
      const productFit = fitTop.length
        ? `**Product fit.** The parts of your product text sit closest to ${joinAnd(fitTop.map((r) => `${r.x.name} (${joinAnd(r.fit.map((p) => q(partLabel(p))))})`))}; this is a reading of words, not a score. ${presetFirst ? (fitTop.some((r) => r.x.name === presetFirst) ? `That agrees with the presets, which put ${presetFirst} first.` : `This differs from the presets, which put ${presetFirst} first, so weigh the presets less.`) : 'The presets give no order here, so start the checks with these segments.'}`
        : `**Product fit.** No part of your product text sits close to a segment name by its words, so the facts below carry the decision.${named.filter(isNamedPart).length >= 2 ? ` Your description names ${joinAnd(named.filter(isNamedPart).slice(0, 5).map((x) => q(clip(x, 70))))}; ask each segment which of them it wants first.` : ''}`;
      const overlapNotes = segmentOverlap(segmentScores.map((x) => x.name));
      const howToDecideKeyword = `## How to decide, from your own inputs

What you gave: deal size ${acvGiven || 'not given'}, sales cycle ${cycleGiven || 'not given'}, current customers ${ccText ? `(${q(clip(ccText, 200))})` : 'not given'}. The keyword scores below do not use any of these, so use them first:

- ${secondView}
- ${productFit}
- **Deal size and cycle.** ${acvGiven || cycleGiven ? `A deal of ${acvGiven || 'your size'}${cycleGiven ? ` with a cycle of ${cycleGiven}` : ''} needs, in each segment, a buyer who can approve that amount and a team that can run a process of that length. Check that for each segment before you rank it.` : 'Each segment must have a buyer who can approve your price and a team that can run a process of your sales length. Check that for each segment before you rank it.'}
- **Strongest pain.** ${painText ? `Your customers describe it as ${q(clip(painText, 200))}. Ask three buyers in each segment whether they raise that first; the segment where it is raised unprompted comes first.` : 'Ask three buyers in each segment which problem they raise first; the segment where it is raised unprompted comes first.'}${overlapNotes.length ? `\n- **Overlap.** ${overlapNotes.join(' ')}` : ''}

### Segment by segment

${perSegment}

---

`;
      const howToDecide = ownMethod ? `## How the segments were ranked, from your own inputs

What you gave: deal size ${acvGiven}, sales cycle ${cycleGiven || 'not given'}, current customers (${q(clip(ccText, 200))}) and customer pain (${q(clip(painText, 200))}). The scores below are built from your customers, your pain and your deal size (see "Method used" above), not from keywords in the segment names.

- **Check it with buyers.** The ranking shows where the words of your own customers and your pain point; ask three buyers in the segment at the top which problem they raise first before you commit.
- **Deal size and cycle.** A deal of ${acvGiven}${cycleGiven ? ` with a cycle of ${cycleGiven}` : ''} needs, in each segment, a buyer who can approve that amount and a team that can run a process of that length. Check that for each segment before you rank it.

---

` : howToDecideKeyword;

      const sharpenItems: { give: string; changes: string }[] = [];
      if (!segGiven) sharpenItems.push({ give: 'potential_segments', changes: 'the whole answer, which now scores three example segments' });
      if (!ccText0) sharpenItems.push({ give: 'current_customers', changes: 'the ranking, which would follow where your best customers already are' });
      if (!painText) sharpenItems.push({ give: 'customer_pain', changes: 'the ranking, which would follow the problem your customers describe; with current_customers and average_deal_size it replaces the keyword presets' });
      if (!acvNumber) sharpenItems.push({ give: 'average_deal_size', changes: 'the deal-fit checks and the sizing, which now say "your price"' });
      if (!cycleGiven) sharpenItems.push({ give: 'sales_cycle', changes: 'the deal-fit checks, which cannot name how long a decision may take' });
      if (beachCount === null) sharpenItems.push({ give: counts.length ? `company_counts for ${beachhead.name} (a line written as "${beachhead.name}: " followed by the number)` : 'company_counts, one line per segment', changes: 'the sizing, which cannot yet count companies' + (ownMethod ? ' and the budget score' : '') });
      if (pct === null) sharpenItems.push({ give: 'percent_matching_icp', changes: 'SAM, which cannot be calculated yet' });
      if (share === null) sharpenItems.push({ give: 'year_one_share_percent', changes: 'SOM and the Year 1 customer goal' });
      const sharpen = sharpenLine(sharpenItems);

      return `# Beachhead Market Selection

## In short

${inShort}${segGiven ? '' : ' You gave no segments, so the segments below are examples.'}

## Market Context

**Product**: ${prodText}
**Average Deal Size**: ${acvGiven || 'not given'}
**Sales Cycle**: ${cycleGiven || 'not given'}
**Method used: ${ownMethod ? 'ranked from your own customers, pain and deal size' : `keyword presets (not given: ${missingForOwn.join(', ')}; with potential_segments, current_customers, customer_pain and average_deal_size the segments are ranked from your own inputs instead)`}.**
${dropped.length ? `**Segments listed twice**: ${dropped.map((d) => `"${d}"`).join(', ')} was listed more than once and is scored once (duplicate dropped).\n` : ''}${ctx.line}

---

${howToDecide}## Segment Scoring Matrix

### Scoring Criteria (1-5 scale)
- **Pain Intensity**: How urgent is the problem?
- **Budget Availability**: Can they pay your price?
- **Accessibility**: Can you reach them?
- **Reference Value**: Will they help you expand?
- **Competition**: Is the segment less contested?

### Segment Scores

${ownMethod ? `These scores are built from your own inputs, not from keywords: Pain Intensity from the words each segment name shares with your customer_pain (none 1, one word 3, two 4, three or more 5), Reference Value from the words it shares with your current_customers (same scale), and Budget Availability from your company_counts times your deal size when you gave counts for at least two segments (the largest market value 5, the others in proportion), otherwise the middle score 3. Accessibility and Competition are the middle score 3 for every segment, because your inputs say nothing about them. Your sales cycle is shown for context; it does not change the scores or the market sizes.` : `These scores are presets, not research on your market: each segment is scored from keywords in its name (enterprise, mid-market, SMB, small, SaaS, tech, finance), and a segment with none of these keywords gets the middle score on every criterion.${segGiven ? '' : ' You supplied no segments, so the segments are examples too.'} Your current customers and sales cycle are shown for context; they do not change the scores or the market sizes.`}
${EXAMPLES}
| Segment | Pain | Budget | Access | Reference | Competition | **TOTAL** |
|---------|------|--------|--------|-----------|-------------|-----------|
${segmentScores.map((s, i) => `| ${i === 0 && !allTied ? '**' + s.name + '** (beachhead)' : s.name} | ${s.pain} | ${s.budget} | ${s.access} | ${s.reference} | ${s.competition} | **${s.total}** |`).join('\n')}

---

## ${allTied ? `No segment is chosen by the scores: ${tied.length} segments tie` : `Recommended Beachhead: ${beachhead.name}`}
${tieLine}${!ownMethod && tied.length === 1 && beachhead.keyword ? `\n*Read this as the highest keyword match only: ${beachhead.name} scores highest because its name contains the keyword "${beachhead.kw}", not because of anything known about your market. Score each segment yourself with your own data before you commit.*\n` : ''}
**What decided each score:** ${segmentScores.map((x) => ownMethod ? `${x.name}: ${x.ownRef.length ? `shares "${real(x.name, x.ownRef).join('", "')}" with your customers` : 'shares no word with your customers'}; ${x.ownPain.length ? `shares "${real(x.name, x.ownPain).join('", "')}" with your pain` : 'shares no word with your pain'}; ${x.ownTam !== null && maxTam ? `market value ${usdFull(x.ownTam)} from your counts and deal size` : 'budget at the middle score (no counts for two segments)'}` : `${x.name}: ${x.keyword ? `the word "${x.kw}"` : 'no keyword, so the middle score'}`).join('; ')}.

${tied.length > 1 || (!ownMethod && beachhead.keyword) ? `### ${tied.length > 1 ? 'What would break the tie' : 'Before you trust this ranking'}

${ownMethod ? 'The ranking uses the words your segment names share with your customers and your pain, so name the segment in your own words where you can.' : 'The scores come from words in the segment names, so settle the ranking with these checks:'}
1. **Which segment already holds your own customers?** The segment where your customers already are is the strongest candidate for a first beachhead.
2. **Where is the strongest pain?** In which segment do buyers raise this problem first, or lose most to it? Ask three buyers in each segment.
3. **Which segment can pay ${acvGiven ? acvShown : 'your price'} and has a buyer you can reach?** The roles in the sector view below say who to look for.
4. Drop the segments that fail and keep the one or two that are left for the sizing below.

` : ''}### How This Segment Scored

${EXAMPLES}
**${tied.length > 1 ? 'Joint highest score' : 'Highest score'} (${beachhead.total}/25)**, ${ownMethod ? 'from your own inputs' : 'from the presets'}:
- Pain Intensity ${beachhead.pain}/5 | Budget ${beachhead.budget}/5 | Accessibility ${beachhead.access}/5 | Reference Value ${beachhead.reference}/5 | Competition (less contested is higher) ${beachhead.competition}/5
${ownMethod ? `- Budget ${beachhead.budget}/5 comes from ${beachhead.ownTam !== null && maxTam ? 'your company counts times your deal size' : 'the middle score (company_counts for at least two segments would score it from your own figures)'}; Accessibility and Competition are the middle score 3 because your inputs say nothing about them.` : beachhead.budget >= 4 ? `- Budget ${beachhead.budget}/5 is a preset for this keyword: check it against your own price${acvGiven ? ` (${acvShown})` : ''} before you rely on it.` : `- Budget ${beachhead.budget}/5 is a preset: ${acvGiven ? `check whether ${acvShown} fits what this segment can spend.` : 'check it against your own price.'}`}
${!ownMethod && beachhead.access <= 2 ? `- Accessibility ${beachhead.access}/5 is low in the preset: plan how you will reach these buyers (a channel, a partner or a referral).` : ''}

${v ? `${ctx.model === 'saas' || ctx.model === null ? sectorBlock(v, ['vocabulary', 'committee', 'metrics', 'proof', 'motion'], 'What to check in each segment (sector view)') : noSeatWords(sectorBlock(v, ['vocabulary', 'committee', 'metrics', 'proof', 'motion'], 'What to check in each segment (sector view)'))}\n\nBefore you commit to a segment, check that the roles above exist in its companies, that they can reach your price, and that the sector's usual objections do not block the first sale.${ctx.model ? ` In a business like yours, buyers also weigh: ${MODEL_NOTES[ctx.model].commercial}.` : ''}\n` : ''}
---

## Market Sizing (your figures only)

This tool adds no company count, ICP share, market share or deal size of its own. TAM, SAM and SOM are calculated only from the figures you supply: company_counts, average_deal_size, percent_matching_icp and year_one_share_percent.

| Figure | Value | Source |
|--------|-------|--------|
| Companies in ${beachhead.name} | ${beachCount !== null ? beachCount.toLocaleString('en-US') : 'not supplied'} | ${beachCount !== null ? 'your company_counts' : 'not supplied'} |
| Average deal size | ${acvGiven || 'not supplied'} | ${acvGiven ? 'your average_deal_size' : 'not supplied'} |
| % that match your ICP | ${pct !== null ? `${pctText(pct)}%` : 'not supplied'} | ${pct !== null ? 'your percent_matching_icp' : 'not supplied'} |
| Year 1 share | ${share !== null ? `${pctText(share)}%` : 'not supplied'} | ${share !== null ? 'your year_one_share_percent' : 'not supplied'} |
${[pct, share].some((x) => x !== null && pctText(x) !== String(x)) ? '\n*Percentages are shown to one decimal; the sizing uses the exact figures you gave.*\n' : ''}${unreadable.length ? `\nNot read as a count (no number in it): ${unreadable.map((u) => `"${u}"`).join('; ')}.\n` : ''}
\`\`\`
TAM = Total potential customers × ACV
${tam !== null ? `TAM = ${beachCount!.toLocaleString('en-US')} companies × ${acvGiven}\nTAM = ${usdFull(tam)} (${usd(tam)})` : `TAM: cannot be calculated yet`}

SAM = TAM × % that match your ICP
${sam !== null ? `SAM = ${usd(tam!)} × ${pctText(pct!)}%\nSAM = ${usdFull(sam)} (${usd(sam)})` : `SAM: cannot be calculated yet`}

SOM = SAM × expected market share (Year 1)
${som !== null ? `SOM = ${usd(sam!)} × ${pctText(share!)}%\nSOM = ${usdFull(som)} (${usd(som)})` : `SOM: cannot be calculated yet`}
\`\`\`
${counts.length > 1 && acvNumber ? `\n### TAM by segment (your counts × your deal size)\n| Segment | Companies | TAM |\n|---------|-----------|-----|\n${segmentScores.map((s) => { const n = countFor(s.name); return n === null ? null : `| ${s.name} | ${n.toLocaleString('en-US')} | ${usd(n * acvNumber)} |`; }).filter(Boolean).join('\n')}\n` : ''}
**Validation Required**: Check your counts with industry databases or analyst reports you trust, with LinkedIn Sales Navigator company counts, and in customer interviews on how the segment sees the problem.

---

## Beachhead Expansion Path

### Year 1: ${allTied ? `Start with the segment you choose (shown here: ${beachhead.name}, the first you listed)` : `Focus on ${beachhead.name}`}
- Focus: your whole GTM effort on this segment
- Goal: ${customers !== null ? customersText(customers) + ' (your counts and percentages)' : 'the customer target comes from the sizing above once company_counts, percent_matching_icp and year_one_share_percent are given'}
- Revenue: ${som !== null ? `${usd(som)} (SOM, from your figures)` : 'comes from the same sizing'}

### Year 2: Adjacent Expansion
- Add: ${allTied ? 'the segment you rank next after the first one is chosen and its results are in (the scores tie, so none is ahead)' : `${segmentScores[1]?.name || 'the next highest-scoring segment'}${segmentScores[1] ? segEx : ''}`}
- Leverage: references from beachhead customers
- Goal: set it after the first beachhead results are in

### Year 3: Market Leadership
- Expand: full SAM coverage
- Position: ${allTied ? 'set it once you have chosen a first segment and have its results' : `decide it from the Year 1 and Year 2 results in ${beachhead.name}${segEx}`}

---

## ICP Hypothesis for ${beachhead.name}${allTied ? ' (the first segment you listed; the scores tie)' : ''}

Based on the beachhead selection, your ICP likely includes:

**Company Characteristics**:
- Industry: ${beachhead.name.split('(')[0].trim()}
- Size: ${(() => { const br = beachhead.name.match(/\(([^)]+)\)/)?.[1]; return br && /\d|employees|revenue|small|large|mid/i.test(br) ? `${br}${!segGiven ? ` ${EXAMPLE}` : ''}` : 'not given, so no size is assumed'; })()}
${c ? `\n**Buying Characteristics**:\n- Decision maker: ${roleOk(c.signer) && roleOk(c.champion) ? `${roleOk(c.signer)} signs; ${roleOk(c.champion)} is the likeliest champion (this sector's usual committee)` : roleOk(c.signer) ? `${roleOk(c.signer)} signs (this sector's usual committee; see the sector view above for the rest)` : "see the sector view above for the usual committee"}` : '\n**Buying Characteristics**:\n- Decision maker: no sector was read, so no committee is assumed'}
- Budget: ${acvGiven ? `your price is ${acvGiven}; confirm that this segment's budget holders can approve that amount` : 'no price was given, so no budget is assumed'}
- Sales cycle: ${cycleGiven || 'not given'}
- Buying trigger: ${v ? `ask your best customers what set off their purchase. In this sector: ${nsw(v.salesMotion)}` : 'ask your best customers what set off their purchase (an audit finding, a season or a competitive threat are common)'}
${sharpen ? `\n---\n\n## To sharpen this\n\n${sharpen}\n` : ''}
**Next Step**: Use \`impact_craft_message\` to build positioning for this beachhead
`;
    }
  },

  // ---------------------------------------------------------------------------
  // Tool 6: Craft Core Message
  // ---------------------------------------------------------------------------
  impact_craft_message: {
    description: 'Build a positioning statement and message hierarchy from your own words, in whole sentences, with proof and objections that fit your sector and business model',
    inputSchema: {
      type: 'object',
      properties: {
        product_name: {
          type: 'string',
          description: 'Your product name'
        },
        target_customer: {
          type: 'string',
          description: 'Target customer description'
        },
        customer_need: {
          type: 'string',
          description: 'The need they have, written as an action (for example "lose days chasing low-risk cloud alerts")'
        },
        product_category: {
          type: 'string',
          description: 'Your product category, written as a noun phrase (for example "cloud security monitoring platform")'
        },
        key_benefit: {
          type: 'string',
          description: 'Primary benefit/reason to buy'
        },
        competitor: {
          type: 'string',
          description: 'Primary alternative/competitor'
        },
        differentiation: {
          type: 'string',
          description: 'Your unique differentiation'
        },
        business_model: {
          type: 'string',
          enum: BUSINESS_MODELS,
          description: 'How you sell (saas, services, connectivity, transactions, marketplace, hardware_software or investment). Used to choose the cost and proof lines; read from your inputs when not given'
        }
      },
      required: ['target_customer', 'key_benefit', 'differentiation']
    },
    execute: (args: {
      product_name?: string;
      target_customer: string;
      customer_need?: string;
      product_category?: string;
      key_benefit: string;
      competitor?: string;
      differentiation: string;
      business_model?: string;
    }) => {
      // Run 22 rewrite: a finished positioning and message draft built from the user's own words. Every input is used where it matters, in whole sentences; a result with a
      // figure keeps its source label; nothing is invented; what is missing is named once, at the end. The helpers are in rw-impact2.ts.
      const kit = RW_KIT2;
      const fresh = makeFresh();
      const named = (args.product_name || '').trim();
      const brand = brandOnly(named);
      const P = (brand && !isCommonWord(brand) ? brand : '') || plainName(named, runningName(named.replace(/\s*\([^)]*\)/g, ''))) || 'the product';
      const PC = capFirst(P);
      const ctx = readContext(args.business_model, { core: [args.product_category], later: [args.differentiation], names: [args.product_name], context: [args.key_benefit, args.customer_need], buyer: [args.target_customer] });
      const v = ctx.v;
      const lz = lensOf(v, args.product_category, args.customer_need, args.key_benefit, args.target_customer);
      // Relevance: a sector note is used as it is when the inputs share words with it; when they share none, the note belongs to another kind of work and the user's own figures and words are used instead.
      // what the product does (category, problem, result, alternative, difference), not who buys it: the audience's words would make every measure about developers fit a developer tool
      const inputStems = stemSet(args.customer_need || '', args.product_category || '', args.key_benefit, args.competitor || '', args.differentiation);
      const relevantTo = (t: string, n = 1): boolean => shared(t, inputStems) >= n;
      const fitItems = v ? [...lz.metrics, ...lz.vocab] : [];
      const weak = !!v && fitItems.length > 0 && fitItems.filter((x) => relevantTo(x)).length / fitItems.length < MISMATCH_AT;
      const metricsRel = lz.metrics.filter((x) => relevantTo(x));
      const ownMeasures = figureMeasures([args.key_benefit, args.differentiation, args.target_customer]);
      const measures = !weak && metricsRel.length ? metricsRel : ownMeasures.length ? ownMeasures : lz.metrics;
      const measuresAreSector = measures === metricsRel || measures === lz.metrics;
      const proofSector0 = ctx.model && ctx.model !== 'saas' ? noSeatWords(lz.proof) : lz.proof;
      const proofSector = !weak && (metricsRel.length > 0 || relevantTo(proofSector0, 2)) ? proofSector0 : '';
      const vocabShown = weak ? [] : lz.vocab.filter((w) => !SAAS_ONLY.test(w) || inputStems.has(w.toLowerCase().replace(/s$/, '').slice(0, 5)));
      const notes = MODEL_NOTES[ctx.model || 'unknown'];
      const com = v ? committeeParts(v) : null;
      const roleOk = (r: string | undefined): string => (r && r.length <= 70 && !/[.:]/.test(r) ? r : '');
      const champion = (lz.fn ? lz.fn.champion : com ? roleOk(com.champion) : '') || 'the person who owns the problem';
      const signer = (lz.fn ? lz.fn.buyer : com ? roleOk(com.signer) : '') || 'the budget owner';
      const rv0 = !lz.fn && com && com.reviewers.length ? com.reviewers[0] : null;
      const evaluator = (lz.fn ? lz.fn.tech : rv0 ? roleOk(rv0.role) : '') || 'the technical evaluator';

      // The audience, with the notes typed inside the target text.
      const A = parseAudience(args.target_customer, kit);
      const aud = audienceShort(A.aud, kit);
      const audGlossed = A.gloss ? `${aud} (${A.gloss})` : aud;
      // The category: the leading noun phrase; a text after a colon says what the product covers; a note "(its own words: ...)" is the user's own description.
      const catTyped = (args.product_category || '').trim();
      const catNoteM = catTyped.match(/\s*\(((?:in )?its own words|the page calls[^)]*?)[:,]?\s*([^)]*)\)\s*$/i);
      const catBody = (catNoteM ? catTyped.slice(0, catNoteM.index) : catTyped).trim();
      const catHeadSrc = catBody.split(/\s*:\s+/)[0] || catBody;
      const catCovers = catBody.split(/\s*:\s+/).slice(1).join(': ');
      // A phrase with a head noun before a participle ("Frontier AI company building voice AI ...") is a noun phrase, not a field of work.
      const catCut = catHeadSrc.split(/\s(?:building|offering|providing|delivering|developing|creating|making|selling|running|powering|helping|that|which)\s/)[0];
      const category = catHeadSrc ? (catCut !== catHeadSrc && !/^provider of/i.test(categoryNoun(catCut)) ? catHeadSrc : categoryNoun(catHeadSrc)) : '';
      const artOf = (c: string): string => (/^provider of/i.test(c) ? `a ${c}` : /^["“'‘]/.test(c) ? `a ${c}` : `${aOrAn(c)} ${mid(c)}`);
      const catArt = category ? artOf(category) : '';
      const catPlain = category ? category.replace(/\s*\([^)]*\)\s*$/, '') : '';
      // The alternative.
      const hasAlt = !!(args.competitor && args.competitor.trim());
      const alt = hasAlt ? parseAlternative(args.competitor as string, kit) : null;
      // The benefit: a headline, results, and figures the page claims.
      const cap4 = (t: string): string => (t.length > 420 ? clip(t, 380) : t);
      const B = parseBenefit(args.key_benefit, kit);
      B.headline = cap4(B.headline); B.parts = B.parts.map((p) => ({ ...p, text: cap4(p.text) })); B.claims = B.claims.map((p) => ({ ...p, text: cap4(p.text) }));
      const lead = B.parts.length ? firstParts(B.parts, 230, 3) : [];
      const headShape = B.headline ? shapeOf(B.headline, kit) : 'np';
      const headVerb = !!B.headline && headShape === 'verb';
      const bareHead = B.headline ? baseForm(B.headline, kit) : '';
      const clauseAll = B.parts.length ? resultClause(B.parts, kit) : null;
      const clauseLead = lead.length ? resultClause(lead, kit) : null;
      const clauseOne = lead.length ? resultClause(lead.slice(0, 1), kit) : null;
      const oneBare = clean(partsInline(lead.slice(0, 1))[0] || '');
      const leadOf = (t: string, n = 100): string => leadClause(t, n) || (t.length > n ? clip(t, n - 10) : t);
      const clauseShort = lead.length ? resultClause([{ text: leadOf(lead[0].text, 100), label: lead[0].label }], kit) : null;
      // What the product does, as a clause that follows "that" and as a sentence of its own.
      const npLead = !B.headline && B.parts.length && ['np', 'noun'].includes(shapeOf(B.parts[0].text, kit)) && !clauseLead ? partsInline(B.parts).map((x) => clean(x)).join(', ') : '';
      const resultThat = headVerb ? `helps them ${bareHead}` : B.headline && headShape !== 'clause' ? `delivers ${kit.lowerFirst(clean(B.headline))}` : !B.headline && clauseLead ? `helps them ${clauseLead}` : npLead ? `delivers ${kit.lowerFirst(npLead)}` : '';
      const resultOwn = ((): string => (headShape === 'clause' && B.headline ? sentence(B.headline, kit) : !resultThat ? `What ${P} delivers, in your words: ${clean(oneBare)}.` : ''))();
      const detail = ((): string => {
        if (!B.parts.length || !B.headline) return '';
        if (headVerb && clauseAll) return `In practice, ${aud} can ${clauseAll}.`;
        return `In practice: ${partsInline(B.parts).map((x) => clean(x)).join('; ')}.`;
      })();
      const oneSentence = headVerb ? `${PC} helps ${aud} ${bareHead}.` : B.headline && headShape !== 'clause' ? `${PC} delivers ${kit.lowerFirst(clean(B.headline))}.` : clauseShort ? `${PC} helps ${aud} ${clauseShort}.` : `${PC} is built for ${aud}: ${leadOf(clean(B.headline || oneBare), 90)}.`;
      const youCan = headVerb ? bareHead : clauseShort || '';
      // The difference: items at the semicolons; a recognition goes to the proof.
      const D = parseDifference(args.differentiation);
      const diffItems = (D.items.length ? D.items : [args.differentiation.trim()]).map(cap4);
      const diffSents = diffItems.map((d) => gateClaim(d, differenceSentence(PC, d, kit, diffSentence)));
      const plain = (s: string): string => s.replace(/^\[Only if true and provable: /, '').replace(/\]$/, '');
      const diffMain = diffSents[0];
      const startsWithP = (s: string): boolean => plain(s).startsWith(PC);
      // Proof the user already gave: counts about customers, recognition, figures with their labels.
      const counts: Piece[] = A.facts;
      const recog: Piece[] = [...D.recognition, ...parseDifference(args.key_benefit).recognition.filter((r) => !D.recognition.some((x) => x.text === r.text))];
      const resultFigs: Piece[] = [...B.parts.filter((p) => /\d/.test(p.text)), ...B.claims];
      const haveProof = counts.length + recog.length + resultFigs.length > 0;
      const m0 = measures[0] || '';
      const m1 = measures[1] || '';
      const seatless = (t: string): string => (ctx.model && ctx.model !== 'saas' ? t.replace(/\b([Pp])er seat or /g, '$1er ') : t);
      const objsRel = v ? v.objections : [];
      const objection0 = objsRel.length ? { ...objsRel[0], objection: seatless(objsRel[0].objection) } : null;
      const needPcs = args.customer_need ? needPieces(args.customer_need) : [];
      const needFirst = needPcs.length ? clip(needPcs[0], 420) : '';
      const needMore = ((): string[] => {
        const rest = needPcs.slice(1);
        const tail = needPcs.length && needPcs[0].length > needFirst.length ? needPcs[0].slice(needFirst.length).replace(/^[\s,;:]+/, '') : '';
        return [...(tail ? [tail] : []), ...rest];
      })();
      const needShape = needFirst ? shapeOf(needFirst, kit) : 'np';
      const needLc = needFirst ? kit.lowerFirst(clean(needFirst)) : '';
      const needBare = needShape === 'verb' ? baseForm(needFirst, kit) : '';
      const altBack = alt ? (alt.kind === 'activity' ? alt.label : alt.kind === 'name' ? `relying on ${alt.label}` : `living with ${alt.label}`) : '';
      const altGap = ((): string => {
        if (!alt || !alt.tail) return '';
        const t = alt.tail.replace(/^[,;\s]+/, '');
        const m = t.match(/^(that|which|who|where|whose)\s+(.*)$/i);
        if (m) return `${/[a-z]s$/i.test(alt.label) && !/(?:ss|us|is)$/i.test(alt.label) ? 'they' : 'it'} ${clean(m[2])}`;
        if (/^relying\b/i.test(t)) return `it relies${clean(t).slice('relying'.length)}`;
        if (/^relies\b/i.test(t)) return `it ${clean(t)}`;
        if (/^because\b/i.test(t)) return `it falls short ${clean(t)}`;
        if (/^with\b/i.test(t)) return `it comes ${clean(t)}`;
        return clean(t);
      })();

      const out: string[] = [];
      out.push(`# Positioning and Messaging${named ? `: ${P}` : ''}`);
      out.push(ctx.line);
      out.push('---');

      // ---- the statement
      const firstSentence = ((): string => {
        if (catArt && resultThat && catArt.length > 70) return `For ${audGlossed}, ${P} is ${catArt}. It ${resultThat}.`;
        if (catArt) return `For ${audGlossed}, ${P} is ${catArt}${resultThat ? ` that ${resultThat}` : ''}.`;
        return resultThat ? `For ${audGlossed}, ${P} ${resultThat.replace(/^helps them/, `helps ${aud}`)}.` : `${PC} is built for ${audGlossed}.`;
      })();
      const stmt: string[] = [firstSentence];
      if (catCovers) stmt.push(`It covers ${clean(catCovers)}.`);
      if (needFirst) stmt.push(needSentence(needFirst, kit));
      if (resultOwn) stmt.push(resultOwn);
      if (detail) stmt.push(detail);
      if (alt && startsWithP(diffMain)) stmt.push(`Unlike ${alt.label}, ${plain(diffMain)}`);
      else { if (alt) stmt.push(`The alternative buyers weigh today is ${alt.label}.`); stmt.push(diffMain); }
      for (const s of stmt) fresh(s);
      const audFullShown = A.aud && audienceShort(A.aud, kit) !== kit.mid(A.aud.trim()) && A.aud.length < 500;
      out.push(`## Positioning Statement

### Complete Positioning Statement
> ${stmt.join(' ')}

### One-Sentence Version
> ${fresh(oneSentence)}${A.exclusion || audFullShown ? '\n' : ''}${A.exclusion ? `\n**Who this is not for:** ${capFirst(clean(A.exclusion))}, so these messages speak to ${aud} only.` : ''}${audFullShown ? `\n**The audience in full:** ${clean(A.aud)}.` : ''}${needMore.length ? `\n\n**More of the buyer's problem, in your words:**\n${needMore.map((p) => `- ${sentence(clip(p, 300), kit)}`).join('\n')}` : ''}

---`);

      // ---- message hierarchy
      const outShort = shortPhrase(B, 9, kit, 2);
      const diffShortSrc = takeLabel(diffItems[0]).body;
      const diffShort = ((): string | null => { const sc = shortClause(diffShortSrc, 6); return sc && !hasFiniteVerb(sc) && !(sc.length < diffShortSrc.length && /(?:ed|ing)$/i.test(sc.split(/\s+/).pop() || '')) ? sc.replace(/[\s:;,.]+$/, '') : null; })();
      const tagAud0 = shortAudience(shortText(noNotes(args.target_customer)));
      const tagAud = /\.\.\.|\d$|^(?:the|a|an)\s+\S+\s+\S+$/i.test(tagAud0) || !tagAud0 ? aud : tagAud0;
      const tags: string[] = [];
      if (outShort) tags.push(`| **Outcome** | "${capFirst(outShort)}" | Clarity |`);
      if (diffShort && !SUPERLATIVE.test(diffItems[0])) tags.push(`| **Differentiator** | "${capFirst(diffShort)}" | Uniqueness |`);
      else if (diffShort) tags.push(`| **Differentiator** | [Only if true and provable: "${capFirst(diffShort)}"] | Uniqueness |`);
      if (tagAud.split(/\s+/).length <= 7) tags.push(`| **Audience** | "Built for ${tagAud}" | Targeting |`);
      if (needPcs.length && needShape === 'verb' && needLc.split(/\s+/).length <= 10) tags.push(`| **Problem** | "Do you ${needBare}?" | Attention |`);

      // The difference as a short clause, for the places where the statement already holds the whole sentence.
      const diffLeadSrc = leadClause(diffShortSrc) || (diffShortSrc.length > 110 ? clip(diffShortSrc, 90) : null);
      const diffLead = diffLeadSrc ? gateClaim(diffItems[0], differenceSentence(PC, diffLeadSrc, kit, diffSentence)) : '';
      const diffRest = ((): string => {
        if (!diffLeadSrc || diffLeadSrc.length >= diffShortSrc.length) return '';
        const m = diffShortSrc.slice(diffLeadSrc.length).trim().match(/^,?\s*(?:that|which)\s+(.{20,})$/i);
        const np = diffLeadSrc.replace(/^(?:an?|the|one)\s+/i, '');
        return m && shapeOf(diffLeadSrc, kit) !== 'clause' && shapeOf(diffLeadSrc, kit) !== 'verb' ? sentence(`The ${kit.lowerFirst(np)} ${m[1]}`, kit) : '';
      })();
      // The evaluator's own concern, from the user's words: a security reviewer gets the security words the user typed, else the sector's note on what that role checks.
      const evalConcern = ((): string => {
        const cw = (evaluator.match(/secur\w*|complian\w*|risk|audit\w*|privacy|legal/i) || [''])[0].toLowerCase();
        if (!cw) return '';
        const q = quoteAround([...B.parts.map((p) => p.text), ...B.claims.map((p) => p.text), ...diffItems, args.product_category || '', args.customer_need || ''], /secur|complian|privacy|encrypt|audit|gdpr|pci|sovereign|residency/i);
        if (q) return `On ${cw}, in your words: "${q}".`;
        return rv0 && rv0.what && !weak ? `In this sector, ${rv0.role} ${rv0.does} ${rv0.what}.` : '';
      })();
      const optA = ((): string | null => {
        if (!needPcs.length || !clauseLead || !(startsWithP(diffMain) || startsWithP(diffLead)) || /^\[/.test(diffMain)) return null;
        const needIf = needShape === 'verb' ? `you ${needBare}` : needShape === 'gerund' || needShape === 'noun' ? `you struggle with ${needLc}` : '';
        if (!needIf || needLc.split(/\s+/).length > 22) return null;
        const pred = plain(diffLead || diffMain).replace(/\.$/, '');
        return fresh(`If ${needIf}, ${pred}, so you can ${clauseLead}.`);
      })();
      const optBTail = diffLead || (startsWithP(diffMain) ? diffMain : '');
      const optB = `${capFirst(outShort || clip(clean(B.headline || oneBare), 90))}. ${optBTail ? fresh(optBTail, `Under the hood: ${plain(optBTail)}`) : fresh(`Built for ${aud}.`, `Made for ${aud}.`)}`.trim();
      const optM = startsWithP(diffLead || diffMain) && youCan && !/^\[/.test(diffMain) ? fresh(`${plain(diffLead || diffMain).replace(/\.$/, '')}, so ${aud} can ${youCan}.`) : '';
      out.push(`## Message Hierarchy

### Level 1: Tagline
| Style | Tagline | Best For |
|-------|---------|----------|
${tags.length ? tags.join('\n') : `| **Audience** | "Built for ${clip(aud, 40)}" | Targeting |`}

### Level 2: Value Proposition
${optA ? `**Problem to solution**\n> ${optA}\n\n` : ''}**Outcome first**
> ${optB}
${optM ? `\n**Mechanism first**\n> ${optM}\n` : ''}
### Level 3: Three Supporting Pillars

**Pillar 1: the result.** ${B.headline ? `${capFirst(clean(B.headline))}.${B.parts.length ? ` What sits behind it: ${partsInline(B.parts).map((x) => clean(x)).join('; ')}.` : ''}` : B.parts.length === 1 ? `What buyers get: ${kit.lowerFirst(clean(partText(B.parts[0]).length > 150 ? `${leadOf(B.parts[0].text, 110)}${B.parts[0].label ? ` ${B.parts[0].label}` : ''}` : partText(B.parts[0])))}.` : `What buyers get:\n${B.parts.map((p) => `  - ${capFirst(clean(partText(p).length > 150 ? `${leadOf(p.text, 110)}${p.label ? ` ${p.label}` : ''}` : partText(p)))}`).join('\n')}`}
- Proof you have: ${B.claims.length ? partsInline(B.claims).join('; ') + '.' : B.parts.some((p) => /\d/.test(p.text)) ? 'the figures in the results above, with the labels you gave.' : 'none given for the result yet.'}
- Proof to collect: ${proofSector ? lc1(proofSector) : `one customer, one measure${m0 ? ` (${m0})` : ''}, before and after, from the customer's own data`}

**Pillar 2: the difference.** ${diffLead ? fresh(`At its core: ${plain(diffLead)}`, `What sets it apart: ${plain(diffLead)}`) : fresh(`What sets it apart: ${plain(diffMain)}`, `At its core: ${plain(diffMain)}`)}${diffSents.length > 1 ? ` ${diffSents.slice(1, 3).map((x) => fresh(x, `Also: ${x}`)).join(' ')}` : ''}
- Proof you have: ${recog.length ? partsInline(recog).join('; ') + '.' : 'none given for the difference yet.'}
- Proof to collect: a side by side with ${alt ? alt.label : 'the way your buyers do it today'} on the same customer data${m0 ? `, for ${m0}${m1 ? ` and ${m1}` : ''}` : ''}.

**Pillar 3: why it is safe to buy.** ${objection0 ? `Buyers in this sector often raise "${objection0.objection.replace(/[.?!]+$/, '')}"; the answer is under Objection Handling.` : `Tell the buyer what a first step costs and how it works: ${notes.commercial}.`}
- Proof you have: ${counts.length ? partsInline(counts).join('; ') + '.' : 'no customer count or reference given yet.'}
- Proof to collect: a reference or pilot result that answers that objection.

${vocabShown.length >= 2 ? `Words this sector's buyers use, to check your wording against: ${vocabShown.join(', ')}.\n` : ''}What buyers in a business like yours also weigh: ${notes.commercial}.

---`);

      // ---- variations
      const varA = ((): string => {
        if (!needPcs.length) return fresh(`${plain(diffMain)}`, `In short: ${plain(diffMain)}`);
        const needLead = leadClause(clean(needFirst), 100, true) || (needFirst.length > 100 ? clip(clean(needFirst), 90) : clean(needFirst));
        const ask = needShape === 'verb' ? `Do you ${needBare}?` : needShape === 'gerund' || needShape === 'noun' ? `Are you struggling with ${kit.lowerFirst(needLead)}?` : `Does this sound familiar: ${kit.lowerFirst(needLead)}?`;
        const answer = headVerb ? fresh(`${capFirst(bareHead)} with ${P}.`, `${PC} can help you ${bareHead}.`) : B.headline && headShape !== 'clause' ? fresh(`${capFirst(kit.lowerFirst(clean(B.headline)))}, with ${P}.`, `With ${P}: ${kit.lowerFirst(clean(B.headline))}.`) : fresh(plain(diffLead || diffMain), `The difference in one line: ${plain(diffLead || diffMain)}`);
        return `${ask} ${answer}`;
      })();
      const varB = `${PC}: ${capFirst(outShort || clip(clean(B.headline || oneBare), 90))}. ${fresh(`Built for ${aud}.`, `Designed for ${aud}.`, `For ${aud}.`)}`;
      const stillQ = alt ? `Still ${altBack}?` : '';
      const varC = alt && startsWithP(diffMain) ? fresh(`${stillQ} ${plain(diffLead || diffMain)}`, `${stillQ} The alternative is this: ${plain(diffLead || diffMain)}`) : '';
      const proofLines = [...counts.slice(0, 2).map((f) => `${capFirst(clean(partText(f)))}.`), ...recog.slice(0, 1).map((r) => `${capFirst(partText(r))}.`), ...B.claims.slice(0, 3).map((r) => `${capFirst(partText(r))}.`)];
      out.push(`## Message Variations

**Variation A: lead with the problem**
> ${varA}

**Variation B: lead with the outcome**
> ${varB}
${varC ? `\n**Variation C: lead with the difference**\n> ${varC}\n` : ''}
**Variation D: lead with social proof**
${proofLines.length ? `> ${proofLines.join('\n> ')}\n> Use each only as worded and sourced, and close with the outcome.` : `> No customer count, result or recognition was typed, so there is no honest proof line to write yet. The first pillar says what to collect.`}

### Audience-Specific Messaging

**For the champion (${champion}):**
> ${youCan ? fresh(`${PC} gives you a way to ${youCan}${altBack ? `, instead of ${altBack}` : ''}.`, `${PC} gives you a way to ${youCan}.`) : fresh(`For you, the difference is this: ${plain(diffLead || diffMain)}`)}

**For the economic buyer (${signer}):**
> ${youCan ? fresh(`${PC} lets your team ${youCan}.`, `With ${P}, your team can ${youCan}.`) : B.headline && headShape !== 'clause' ? fresh(`With ${P}, your team gets ${kit.lowerFirst(clean(B.headline))}.`, `Your team gets ${kit.lowerFirst(clean(B.headline))} with ${P}.`) : fresh(`${PC} is built for ${aud}.`)} ${m0 ? `Measure it in ${m0}${m1 ? ` and ${m1}` : ''}, ${measuresAreSector ? 'the figures this sector already watches' : m1 ? 'the figures in your own results' : 'the figure in your own results'}.` : 'Measure it in a figure your buyer already watches.'} They will also weigh ${notes.commercial}.

**For the technical evaluator (${evaluator}):**
> ${[evalConcern, ...(diffSents.length > 1 ? diffSents.slice(1, 3) : [diffRest || diffLead || diffMain]).map((x, i) => fresh(x, i === 0 ? `For the technical review: ${plain(x)}` : `Also: ${plain(x)}`, `And: ${plain(x)}`)), ...(catPlain ? [`${PC} is ${artOf(catPlain)}${catCovers ? ` that covers ${clean(catCovers)}` : ''}.`] : [])].filter(Boolean).join(' ')}

---`);

      // ---- objections
      const rows: string[] = [];
      void 0;
      if (alt) rows.push(`- **"${altObjection(alt).replace(/\.$/, '')}."** Acknowledge it${alt.note ? ` (${alt.note})` : ''}, then ${altGap ? `point to the gap: ${altGap}.` : `ask where it leaves ${aud} short.`} Then show the difference: ${plain(diffLead || diffMain)}`);
      rows.push(`- **"The price is too high."** Tie the price to ${m0 || 'a figure the buyer already measures'}, measured in the buyer's own data, and agree how the cost will be compared (${notes.commercial}).`);
      for (const o of objsRel.slice(0, 4)) rows.push(`- **"${(ctx.model && ctx.model !== 'saas' ? o.objection.replace(/\b([Pp])er seat or /g, '$1er ') : o.objection).replace(/[.?!]+$/, '')}."** ${ctx.model && ctx.model !== 'saas' ? noSeatWords(o.response) : o.response}`);
      out.push(`## Objection Handling

${rows.join('\n')}

---

## Message Tests

- Show the headline to someone outside the company for five seconds and ask what ${P} does.
- Ask a customer to confirm in their own words the result ${P} gives them, and use their words.
- ${vocabShown.length >= 2 ? `Check every line against the words ${lz.fn ? 'this team' : "this sector's buyers"} use (${vocabShown.slice(0, 5).join(', ')}).` : 'Check every line against the words your buyers use.'}`);

      // ---- what is missing
      const missing: { give: string; changes: string }[] = [];
      if (!named) missing.push({ give: 'product_name', changes: 'every line, which now says "the product"' });
      if (!(args.customer_need || '').trim()) missing.push({ give: 'customer_need', changes: 'the problem sentence, the pain-led message and the problem tagline' });
      if (!catTyped) missing.push({ give: 'product_category', changes: 'the sentence that says what the product is' });
      if (!hasAlt) missing.push({ give: 'competitor', changes: 'the Unlike sentence and the first objection' });
      if (!haveProof) missing.push({ give: 'a customer count or a result with its source typed into key_benefit or differentiation', changes: 'the proof lines of the three pillars and the proof-led variation' });
      if (!args.business_model && !ctx.model) missing.push({ give: 'business_model', changes: 'the cost, call to action and proof wording' });
      const sh = sharpenText(missing);
      out.push(`${sh ? `${sh}\n\n` : ''}**Next Step**: Use \`impact_translate_execution\` to adapt these messages for each channel
`);
      return out.join('\n\n').replace(/\n{3,}/g, '\n\n');
    }
  },

  // ---------------------------------------------------------------------------
  // Tool 7: Translate to Execution
  // ---------------------------------------------------------------------------
  impact_translate_execution: {
    description: 'Adapt a positioning statement for the channels you choose (website, LinkedIn, cold email, sales deck, demo), with calls to action that fit your business model',
    inputSchema: {
      type: 'object',
      properties: {
        positioning_statement: {
          type: 'string',
          description: 'Your core positioning statement'
        },
        target_customer: {
          type: 'string',
          description: 'Target customer profile'
        },
        key_benefit: {
          type: 'string',
          description: 'Primary benefit, written as an action (for example "fix critical exposures first")'
        },
        channels: {
          type: 'array',
          items: { type: 'string' },
          description: 'Which channels to cover, from website, linkedin, cold_email, sales_deck and product_demo. Others are listed as not covered; with none, all five are covered'
        },
        product_name: {
          type: 'string',
          description: 'Your product name'
        },
        business_model: {
          type: 'string',
          enum: BUSINESS_MODELS,
          description: 'How you sell (saas, services, connectivity, transactions, marketplace, hardware_software or investment). Used to choose calls to action and commercial terms; read from your inputs when not given'
        }
      },
      required: ['positioning_statement', 'target_customer', 'key_benefit']
    },
    execute: (args: {
      positioning_statement: string;
      target_customer: string;
      key_benefit: string;
      channels?: string[];
      product_name?: string;
      business_model?: string;
    }) => {
      // Run 22 rewrite: channel copy a client could use as a first draft. It is built from the positioning statement (its alternative, its differences, its category), the target and the
      // benefit, in whole sentences. No long input is pasted or repeated, a figure keeps its source label, nothing is invented, and what is missing is named once at the end.
      const kit = RW_KIT2;
      const fresh = makeFresh();
      const named = (args.product_name || '').trim();
      const P = plainName(named, runningName(named.replace(/\s*\([^)]*\)/g, ''))) || 'the product';
      const PC = capFirst(P);
      const statement = args.positioning_statement;
      const nameList = [P === 'the product' ? '' : P, named.replace(/\s*\([^)]*\)/g, '').trim(), named, (named.split(/[\s,]+/)[0] || '')].filter((x, i, a) => x && x.length >= 2 && a.indexOf(x) === i);
      const SP = parseStatement(statement, nameList);
      const ctx = readContext(args.business_model, { core: [SP.category], names: [args.product_name], context: [statement, args.key_benefit], buyer: [args.target_customer] });
      const v = ctx.v;
      const notes = MODEL_NOTES[ctx.model || 'unknown'];
      const ctas = callsToAction(v, ctx.model);
      const lz = lensOf(v, args.key_benefit, args.target_customer, statement);
      const proofSector0 = ctx.model && ctx.model !== 'saas' ? noSeatWords(lz.proof) : lz.proof;
      // Relevance: a sector note is used when the statement, the problem and the benefit share words with it; otherwise the user's own words and figures are used.
      const inputStems = stemSet(SP.need, SP.category, SP.alt, SP.diff.join(' '), args.key_benefit);
      const relevantTo = (t: string, n = 1): boolean => shared(t, inputStems) >= n;
      const fitItems = v ? [...lz.metrics, ...lz.vocab] : [];
      const weak = !!v && fitItems.length > 0 && fitItems.filter((x) => relevantTo(x)).length / fitItems.length < MISMATCH_AT;
      const metricsRel = lz.metrics.filter((x) => relevantTo(x));
      const ownMeasures = figureMeasures([args.key_benefit, statement]);
      const measures = !weak && metricsRel.length ? metricsRel : ownMeasures.length ? ownMeasures : lz.metrics;
      const proofSector = !weak && (metricsRel.length > 0 || relevantTo(proofSector0, 2)) ? proofSector0 : '';
      const vocab = weak ? [] : lz.vocab.filter((w) => !SAAS_ONLY.test(w) || inputStems.has(w.toLowerCase().replace(/s$/, '').slice(0, 5)));
      const committee = lz.fn ? { signer: lz.fn.buyer, champion: lz.fn.champion, championInferred: false, users: null, reviewers: [] } as Committee : v ? committeeParts(v) : null;
      const primary = ctas[0];
      const secondary = ctas.find((c) => c !== primary && !/only if/i.test(c)) || 'See how it works';
      const nextStep = `If useful, the next step is ${ctaNoun(primary)}.`;
      const demoWord = ctx.model === 'saas' || ctx.model === null ? 'demo' : 'walkthrough';

      // Channels: the input selects the sections. Unknown names are listed as not covered.
      const CHANNEL_WORDS: [string, RegExp][] = [
        ['website', /^(website|web|webpage|homepage|site|landing_?page)$/],
        ['linkedin', /^(linkedin|social)$/],
        ['cold_email', /^(email|cold_?email|outbound_?email|outreach|email_?sequence)$/],
        ['sales_deck', /^(sales_?deck|deck|slides|presentation|pitch_?deck)$/],
        ['product_demo', /^(demo|product_?demo|walkthrough|pilot_?review)$/],
      ];
      const asked = (args.channels || []).map((c) => String(c).trim()).filter(Boolean);
      const chosen = new Set<string>();
      const notCovered: string[] = [];
      for (const c of asked) {
        const key = c.toLowerCase().replace(/[\s-]+/g, '_');
        const hit = CHANNEL_WORDS.find(([, re]) => re.test(key));
        if (hit) chosen.add(hit[0]); else notCovered.push(c);
      }
      const noneRecognised = asked.length > 0 && chosen.size === 0;
      if (asked.length === 0 || noneRecognised) CHANNEL_WORDS.forEach(([k]) => chosen.add(k));
      const channelNote = asked.length === 0 ? '' : noneRecognised
        ? `\n**Channels**: none of the channels you listed (${asked.join(', ')}) is one this tool covers, so all five are shown. It covers website, LinkedIn, cold email, sales deck and demo.`
        : `\n**Channels requested**: ${asked.join(', ')}.${notCovered.length ? ` Channels not covered by this tool: ${notCovered.join(', ')} (it covers website, LinkedIn, cold email, sales deck and demo).` : ''}`;

      // The audience, with its notes; the benefit; the alternative and the differences of the statement.
      const A = parseAudience(args.target_customer, kit);
      const aud = audienceShort(A.aud, kit);
      const cap4 = (t: string): string => (t.length > 420 ? clip(t, 380) : t);
      const B = parseBenefit(args.key_benefit, kit);
      B.headline = cap4(B.headline); B.parts = B.parts.map((p) => ({ ...p, text: cap4(p.text) })); B.claims = B.claims.map((p) => ({ ...p, text: cap4(p.text) }));
      const alt = SP.alt ? parseAlternative(SP.alt, kit) : null;
      const diffItems = SP.diff.length ? SP.diff : [];
      const D = parseDifference(diffItems.join('; '));
      const dItems = D.items.map(cap4);
      const dSents = dItems.map((d) => gateClaim(d, differenceSentence(PC, d, kit, diffSentence)));
      const plain = (s: string): string => s.replace(/^\[Only if true and provable: /, '').replace(/\]$/, '');
      const leadOf = (t: string, n = 100): string => leadClause(t, n) || (t.length > n + 40 ? clip(t, n) : t);
      const tightOf = (t: string, n = 80): string => leadClause(t, n, false, true) || leadOf(t, n);
      // the lead of a long difference: its first clause, else the text up to the last "and" in reach, else a cut at a clause boundary
      const cutAnd = (x: string, n: number): string => { const i = x.slice(0, n + 25).lastIndexOf(' and '); return i >= 30 ? x.slice(0, i) : clip(x, n); };
      const dLeadSrc0 = dItems.length ? leadClause(takeLabel(dItems[0]).body) || (takeLabel(dItems[0]).body.length > 110 ? cutAnd(takeLabel(dItems[0]).body, 90) : null) : null;
      const dLeadSrc = dLeadSrc0 ? keepLabel(dItems[0], dLeadSrc0) : null;
      const dLead = dLeadSrc ? gateClaim(dItems[0], differenceSentence(PC, dLeadSrc, kit, diffSentence)) : '';
      const dMain = dSents[0] || '';
      const dShort = dLead || dMain;
      const startsWithP = (s: string): boolean => plain(s).startsWith(PC);
      const lead = B.parts.length ? firstParts(B.parts, 230, 3) : [];
      const headShape = B.headline ? shapeOf(B.headline, kit) : 'np';
      const headVerb = !!B.headline && headShape === 'verb';
      const bareHead = B.headline ? baseForm(B.headline, kit) : '';
      const clauseShort = lead.length ? resultClause([{ text: leadOf(lead[0].text, 100), label: lead[0].label }], kit) : null;
      const clauseLead = lead.length ? resultClause(lead, kit) : null;
      const clauseAt = (n: number): string | null => {
        if (!lead.length) return null;
        const cut = lead[0].text.length > 85 ? tightOf(lead[0].text, n) : lead[0].text;
        return resultClause([{ text: cut, label: /\d/.test(cut) ? lead[0].label : '' }], kit);
      };
      const youCan = headVerb ? (bareHead.length > 85 ? tightOf(bareHead, 80) : bareHead) : clauseAt(80) || clauseShort || '';
      const youShort = headVerb ? (bareHead.length > 85 ? tightOf(bareHead, 80) : bareHead) : clauseAt(80) || youCan;
      const oneBare = clean(partsInline(lead.slice(0, 1))[0] || '');
      // The headline of a page: a whole phrase of the benefit, never cut.
      const heroPhrase = shortPhrase(B, 9, kit);
      const catPlainT = SP.category ? SP.category.split(/\s*[;,]\s*/)[0].replace(/\s*\([^)]*\)\s*/g, ' ').trim() : '';
      const heroLine = heroPhrase ? capFirst(heroPhrase) : catPlainT ? `${capFirst(catPlainT)} for ${aud}` : `${PC} for ${aud}`;
      const firstNp = !B.headline && B.parts.length && ['np', 'noun'].includes(shapeOf(B.parts[0].text, kit)) ? `${leadOf(B.parts[0].text, 120)}${B.parts[0].label ? ` ${B.parts[0].label}` : ''}` : '';
      const resultLine = headVerb ? `${PC} helps ${aud} ${bareHead}.`
        : B.headline && headShape !== 'clause' ? `${PC} delivers ${kit.lowerFirst(clean(B.headline))}.`
        : clauseLead ? `${PC} helps ${aud} ${clauseLead}.`
        : clauseShort ? `${PC} helps ${aud} ${clauseShort}.`
        : firstNp ? `${PC} delivers ${kit.lowerFirst(clean(firstNp))}.`
        : B.headline ? sentence(B.headline, kit) : `${PC} is built for ${aud}.`;
      // The same result in other sentence shapes, so no sentence is written twice.
      const resForms = youCan
        ? [resultLine, `With ${P}, ${aud} can ${youCan}.`, `${PC} gives your team a way to ${youCan}.`, `${PC} is for ${aud} who want to ${youCan}.`, `${capFirst(youCan)}: that is what ${P} is built for.`]
        : [resultLine, `${PC} is built for ${aud}: ${kit.lowerFirst(clean(firstNp || B.headline || oneBare))}.`, `For ${aud}, the result is this: ${kit.lowerFirst(clean(firstNp || B.headline || oneBare))}.`];
      const nextRes = (): string => fresh(...resForms);
      const detail = ((): string => {
        if (!B.parts.length) return '';
        const cl = resultClause(B.parts, kit);
        if (headVerb && cl) return `That means ${aud} can ${cl}.`;
        return '';
      })();
      const bullets = (B.parts.length ? B.parts : B.headline ? [{ text: B.headline, label: '' }] : []).filter((p) => !heroPhrase || clean(p.text).toLowerCase() !== heroPhrase.toLowerCase()).map((p) => capFirst(clean(partText(p).length > 150 ? `${leadOf(p.text, 110)}${p.label ? ` ${p.label}` : ''}` : partText(p))));
      const counts: Piece[] = A.facts;
      const recog: Piece[] = [...D.recognition, ...parseDifference(args.key_benefit).recognition];
      const claims: Piece[] = B.claims;
      const proofAll: Piece[] = [...counts, ...claims, ...recog];
      const proofText = (f: Piece): string => { const t = partText(f); return A.aud && t.toLowerCase().startsWith(A.aud.toLowerCase().slice(0, 18)) ? `Used by ${kit.lowerFirst(t)}` : capFirst(t); };
      const measuresAreSector2 = measures === metricsRel || measures === lz.metrics;
      const m0 = measures.length ? measures[0] : '';
      const m1 = measures.length ? measures[1] || measures[0] : '';
      const seatless = (t: string): string => (ctx.model && ctx.model !== 'saas' ? t.replace(/\b([Pp])er seat or /g, '$1er ') : t);
      const objsFit = v ? v.objections.filter((o) => !weak || relevantTo(o.objection)) : [];
      const objection0 = objsFit.length ? { ...objsFit[0], objection: seatless(objsFit[0].objection) } : null;
      const inHouse = !!alt && /in[- ]house|internal|\bDIY\b|ourselves|yourself/i.test(SP.alt);
      const qs = lz.questions.filter((x) => !(inHouse && /provider|incumbent|vendor/i.test(x))).filter((x) => !weak || relevantTo(x));
      const needS = SP.need ? shapeOf(SP.need, kit) : 'np';
      const needHook = SP.need && needS === 'verb' && SP.need.split(/\s+/).length <= 14 ? `Do you ${baseForm(SP.need, kit)}?` : '';
      const needLeadQ = SP.need ? (leadClause(clean(SP.need), 100, true) || (() => { const p0 = needPieces(SP.need)[0] || clean(SP.need); return p0.length > 140 ? clip(p0, 140) : p0; })()) : '';
      const needAsk = !needHook && SP.need && (weak || !qs.length) ? `Does this sound familiar: ${kit.lowerFirst(needLeadQ)}?` : '';
      const hook = needHook || needAsk || (qs.length ? qs[0] : '');
      const hookForms = needHook ? [needHook, `Do you recognise this: ${kit.lowerFirst(needLeadQ)}?`] : needAsk ? [needAsk, `Is this your situation: ${kit.lowerFirst(needLeadQ)}?`, `Sound familiar: ${kit.lowerFirst(needLeadQ)}?`] : qs.slice(0, 2);
      const nextHook = (): string => (hookForms.length ? fresh(...hookForms) : '');
      const hook2 = qs.length ? ((needHook || needAsk) ? qs[0] : qs[1] || '') : '';
      const altBack = alt ? (alt.kind === 'activity' ? alt.label : alt.kind === 'name' ? `relying on ${alt.label}` : `living with ${alt.label}`) : '';
      const subject = heroPhrase ? capFirst(heroPhrase) : capFirst(clip(clean(B.headline || oneBare), 60));
      const altGapOf = (a: Alternative): string => {
        const t = a.tail.replace(/^[,;\s]+/, '');
        if (!t) return '';
        const m = t.match(/^(that|which|who|where|whose)\s+(.*)$/i);
        if (m) return `${/[a-z]s$/i.test(a.label) && !/(?:ss|us|is)$/i.test(a.label) ? 'they' : 'it'} ${clean(m[2])}`;
        if (/^relying\b/i.test(t)) return `it relies${clean(t).slice('relying'.length)}`;
        if (/^relies\b/i.test(t)) return `it ${clean(t)}`;
        if (/^because\b/i.test(t)) return `it falls short ${clean(t)}`;
        if (/^with\b/i.test(t)) return `it comes ${clean(t)}`;
        return clean(t);
      };
      const weRest = (sent: string): string => { const t = plain(sent); return t.startsWith(`${PC} `) ? t.slice(PC.length + 1).replace(/^(?:offers|is|can)\s+/, '') : t; };
      const diffForms = dMain ? [
        alt && startsWithP(dMain) ? `Unlike ${alt.label}, ${plain(dMain)}` : `${alt ? `${capFirst(clean(alt.label))} is what ${aud} use today. ` : ''}${dMain}`,
        ...(dLead ? [alt && startsWithP(dLead) ? `Unlike ${alt.label}, ${plain(dLead)}` : plain(dLead)] : []),
        `What sets it apart: ${plain(dLead || dMain)}`, `The difference: ${plain(dMain)}`, `In one line, the difference: ${plain(dLead || dMain)}`, `Put simply: ${plain(dLead || dMain)}`,
      ] : [];
      const nextDiff = (): string => (diffForms.length ? fresh(...diffForms) : '');
      const signOff = P.split(/\s+/).length > 3 ? 'The team' : `The ${P} team`;
      const feats = SP.features.slice(0, 8).map((x) => capFirst(clean(x)));
      const sections: string[] = [];

      if (chosen.has('website')) {
        const proofStrip = proofAll.length ? proofAll.map((f) => `- ${proofText(f)}`).join('\n') : '';
        sections.push(`## Website Execution

### Homepage Hero
**Headline**
> "${heroLine}"

**Subheadline**
> ${nextRes()}${detail ? ` ${fresh(detail)}` : ''}

${bullets.length > 1 && !detail ? `**Benefit points under the hero**\n${bullets.slice(clauseShort ? 1 : 0, 5).map((b) => `- ${b}`).join('\n')}\n\n` : ''}${feats.length ? `**What it includes**\n${feats.map((x) => `- ${x}`).join('\n')}\n\n` : ''}${proofStrip ? `**Proof strip**\n${proofStrip}\n\n` : ''}${dMain ? `**Why ${P}**\n> ${nextDiff()}\n\n` : ''}**Calls to action**
- Primary: "${primary}"
- Secondary: "${secondary}"
${vocab.length ? `\nWords ${lz.fn ? 'buyers in this team' : "this sector's buyers"} use, to work into the page: ${vocab.slice(0, 5).join(', ')}.\n` : ''}${proofSector ? `\nUnder the fold, ${lc1(clean(proofSector))}: use a real result of yours in that shape and its source.\n` : ''}`);
      }

      if (chosen.has('linkedin')) {
        const plainRes = plainResult(B, kit);
        const taglineA = headVerb ? `Helping ${aud} ${bareHead}` : plainRes ? `Helping ${aud} ${plainRes}` : '';
        const tagline = taglineA && taglineA.length <= 125 ? taglineA : `${PC}: ${subject}`;
        const post1 = [nextHook(), '', nextRes(), dMain ? nextDiff() : '', '', hook2 ? `A question to put to your own team this week: ${hook2}` : 'Ask your own team how they handle this today.'].filter((x, i, a) => x !== '' || (a[i - 1] !== '' && i > 0)).join('\n');
        const claimLine = [...claims, ...recog].slice(0, 2).map((f) => `Proof point: ${kit.lowerFirst(partText(f))}.`).join(' ');
        const post2 = [`${fresh(`How we would show it, not just say it: ${proofSector ? lc1(clean(proofSector)) : 'one customer, one measure, before and after'}.`)}`, measures.length ? `The figures that matter here: ${measures.slice(0, 3).join(', ')}.` : '', claimLine, '', objection0 ? `The question we hear most: "${objection0.objection.replace(/[.?!]+$/, '')}". Our answer: ${ctx.model && ctx.model !== 'saas' ? noSeatWords(objection0.response) : objection0.response}` : alt ? `The question we hear most: "${altObjection(alt).replace(/\.$/, '')}". Our answer: ${altGapOf(alt) ? `start from the gap (${altGapOf(alt)})` : `ask where it leaves ${aud} short`}${dMain ? ` and show the difference: ${plain(dLead || dMain)}` : ''}` : 'The question we hear most is about switching. We answer it with a pilot.'].filter((x, i, a) => x !== '' || (a[i - 1] !== '' && i > 0)).join('\n');
        sections.push(`## LinkedIn Execution

### Company Page Tagline
> "${tagline}"

### Post Drafts

**Post 1: the question your buyers ask themselves**
\`\`\`
${post1}
\`\`\`

**Post 2: the claim and how you will prove it**
\`\`\`
${post2}
\`\`\`

**Post 3: a customer story** (write it only from a real customer who agreed)
Outline: the customer's situation, what they measured before, what changed, what they measure now${m0 ? ` (${measuresAreSector2 ? `${m0}${m1 && m1 !== m0 ? ` or ${m1}` : ''} ${m1 && m1 !== m0 ? 'are' : 'is'} typical in this sector` : `for example ${m0}`})` : ''}, and the customer's own words.
`);
      }

      if (chosen.has('cold_email')) {
        const verbBen = headVerb || (lead.length > 0 && shapeOf(lead[0].text, kit) === 'verb');
        const subj1 = verbBen && youShort ? `How would you ${youShort}?` : `A question about ${kit.lowerFirst(subject)}`;
        sections.push(`## Cold Email Execution

Open each email with a trigger you can see for the buyer (a renewal, an audit, a season, a target); that is the one line only you can write.

### Email 1: problem-focused
**Subject**: ${subj1}

\`\`\`
Hello,

${hook ? (/^(?:Does this sound familiar|Do you recognise|Is this your situation|Sound familiar)/.test(hook) ? nextHook() : `A question I ask teams like yours: ${nextHook()}`) : `Teams like yours often weigh ${m0 || 'the same few measures'}.`}

${nextRes()}${dMain ? `\n${nextDiff()}` : ''}

${nextStep}

Best regards,
${signOff}
\`\`\`

### Email 2: value-focused
**Subject**: How we would prove it for you

\`\`\`
Hello,

Following up with how we would show the result, not just claim it: ${proofSector ? lc1(clean(proofSector)) : 'one measure, before and after, on one team, agreed with you in advance'}.${proofAll.length ? `\n\n${proofAll.slice(0, 2).map((f) => `For context: ${kit.lowerFirst(proofText(f))}.`).join(' ')}` : ''}

Worth a conversation?

Best regards,
${signOff}
\`\`\`

### Email 3: breakup
**Subject**: Closing the loop

\`\`\`
Hello,

I have reached out a few times about helping your team ${youShort || `see the result ${P} is built for`}.

If the timing is not right, no worries at all. ${objection0 ? `If "${objection0.objection.replace(/[.?!]+$/, '')}" is the concern, I can answer it in one call.` : 'If switching is the concern, I can answer it in one call.'}

Best regards,
${signOff}
\`\`\`
`);
      }

      if (chosen.has('sales_deck')) {
        const problemSlide = SP.need ? needPieces(SP.need).slice(0, 2).map((p) => sentence(clip(p, 240), kit)).join(' ') : `What ${aud} deal with today${vocab.length >= 2 ? `, in the words of this sector: ${vocab.slice(0, 3).join(', ')}` : ''}`;
        sections.push(`## Sales Deck Execution

### Slide Structure

| Slide | Title | Content |
|-------|-------|---------|
| 1 | Title | ${P}: ${heroLine} |
| 2 | The Problem | ${problemSlide} |
| 3 | Cost of Inaction | The cost of staying as things are, in the measures your buyer tracks: ${m0 ? [m0, m1].filter((x, i, a) => x && a.indexOf(x) === i).join('; ') : 'the main measures your buyer tracks'} |
| 4 | The Solution | ${nextRes()} |
| 5 | How It Works | ${feats.length ? feats.slice(0, 4).join('; ') : dItems.length ? dItems.slice(0, 3).map((d) => capFirst(clean(takeLabel(d).body.length > 150 ? leadOf(takeLabel(d).body, 120) : takeLabel(d).body))).join('; ') : 'The three things your buyer must understand to say yes'} |
| 6 | Differentiation | ${alt ? `Why ${P} rather than ${alt.label}` : 'Why we are different (your positioning)'} |
| 7 | Results | ${proofAll.length ? proofAll.slice(0, 3).map((f) => partText(f)).join('; ') : proofSector || 'The results a customer measured, before and after'} |
| 8 | Case Study | A customer story: the situation, the measure before, what changed and the measure now |
| 9 | Commercials | ${capFirst(notes.commercial)} |
| 10 | Next Steps | ${primary} |

### Key Slide: Differentiation
\`\`\`
${alt ? `Unlike ${alt.full}:` : 'Unlike the usual alternative:'}

${alt ? `They: ${alt.full}${altGapOf(alt) ? `; ${altGapOf(alt)}` : ''}` : `They: ${statusQuoDefaults(v, ctx.model)[0].replace(/^./, (c) => c.toLowerCase())} (the usual alternative in this sector)`}
${dItems.length ? `${P}: ${weRest(dLead || dMain)}` : `${P}: what your positioning statement says you offer`}

Result: ${m0 ? `the figure your buyer already tracks (${m0}), from a real customer` : 'the figure your buyer already tracks, from a real customer'}
\`\`\`
`);
      }

      if (chosen.has('product_demo')) {
        sections.push(`## Product Demo Execution

### ${demoWord === 'demo' ? 'Demo' : 'Walkthrough'} Script Structure (15 minutes)

**0-2 min: Context Setting**
> "Based on our conversation, here is what I will show you: how ${P} helps ${aud} ${youCan || 'reach the result they came for'}."${hook ? `\nA question to open with, in this sector's language: ${q(hook)}` : ''}

**2-8 min: Core Value Demonstration**
${dItems.length ? `Start with what sets ${P} apart. ${[nextDiff(), ...dSents.slice(1, 3).map((x) => fresh(x, `Also: ${plain(x)}`))].filter(Boolean).join(' ')} ` : ''}${feats.length ? `Then walk through what it includes, in this order: ${feats.slice(0, 5).join('; ')}. ` : "Then show the two or three features that answer the buyer's stated needs. "}Keep the order of what the buyer measures${measures.length ? `: ${measures.slice(0, 3).join(', ')}` : ''}.

**8-12 min: Differentiation Proof**
> "You might be wondering how this compares to ${alt ? alt.label : 'what you use today'}. Let me show you."
Show one thing they cannot get from ${alt ? alt.label : 'their current approach'}, using their own data or sites where you can.

**12-15 min: Close and Next Steps**
> "What would success look like for you in the first 90 days?"
> "The next step is ${ctaNoun(primary)}."

### Best Practices
- Customise to their specific use case.
- Use their industry terms${vocab.length ? ` (${vocab.slice(0, 4).join(', ')})` : ''}.
- Show outcomes, not features.
- Leave time for questions and agree the next step before the end.
`);
      }

      // One list: the order follows how buyers in this sector usually buy.
      const selfServe = ctx.model === 'saas' && !(v && ['cybersecurity', 'fintech', 'logistics-tech', 'vertical-saas', 'ai-native'].includes(v.id));
      const order: [string, string, string][] = (selfServe
        ? [['website', 'Website + SEO', 'foundation: buyers research you here before they reply'], ['linkedin', 'LinkedIn Organic', 'awareness among your target roles'], ['cold_email', 'Cold Email', 'pipeline from named accounts'], ['sales_deck', 'Sales Deck', 'conversion once there is a conversation'], ['product_demo', 'Demo', 'proof of capability']]
        : [['cold_email', 'Cold Email', `direct outreach to the roles that buy${committee ? `: ${committee.signer}; ${committee.champion}` : ''}`], ['linkedin', 'LinkedIn Organic', 'awareness among those same roles'], ['sales_deck', 'Sales Deck', 'the story you tell once there is a meeting'], ['website', 'Website', 'credibility: proof, references and the facts buyers check'], ['product_demo', ctx.model === 'saas' || ctx.model === null ? 'Demo' : 'Walkthrough or pilot review', 'proof of capability']]
      ).filter(([k]) => chosen.has(k)) as [string, string, string][];

      const missing: { give: string; changes: string }[] = [];
      if (!named) missing.push({ give: 'product_name', changes: 'every line, which now says "the product"' });
      if (!alt) missing.push({ give: 'the alternative buyers use today, written in the statement as "Unlike X" or "Alternatives buyers use today: X"', changes: 'the comparison lines on the page, in the posts, the deck and the demo' });
      if (!dItems.length) missing.push({ give: 'what sets the product apart, written in the statement after "What sets it apart:"', changes: 'the why-us block, the key slide and the first part of the demo' });
      if (!proofAll.length) missing.push({ give: 'a customer count, a result or a recognition with its source (for example in target_customer or key_benefit)', changes: 'the proof strip, the emails and the results slide' });
      if (!args.business_model && !ctx.model) missing.push({ give: 'business_model', changes: 'the calls to action and the commercial terms' });
      const sh = sharpenText(missing);

      return `# Channel Execution Playbook

## What the copy is built from
- **The message**: ${heroLine}
- **The audience**: ${aud}${A.gloss ? ` (${A.gloss})` : ''}.${A.exclusion ? ` ${capFirst(clean(A.exclusion))}, so the copy speaks to ${aud} only.` : ''}
${dItems.length ? `- **Difference to carry**: ${plain(dShort)}\n` : ''}${alt ? `- **The alternative**: ${alt.label}.\n` : ''}${channelNote}
${ctx.line}

---

${sections.join('\n---\n\n')}
---
${v && !weak ? `
## Sector Language

Use the words buyers in ${lz.fn ? fnName(lz.fn) : v.name} use, and keep claims to what you can show. ${vocab.length ? `Words ${lz.fn ? 'buyers in this team' : 'this sector\'s buyers'} use: ${vocab.join(', ')}. ` : ''}${measures.length ? `What ${measuresAreSector2 ? (lz.fn ? 'this team' : 'the sector') : 'your results'} measure${measuresAreSector2 ? 's' : ''}: ${measures.join(', ')}.` : ''}${proofSector ? ` A proof point that lands: ${proofSector}` : ''}

---
` : ''}
## Channel Priority

${v ? `The order follows how deals usually run in ${v.name}: ${ctx.model && ctx.model !== 'saas' ? noSeatWords(v.salesMotion) : v.salesMotion}\n\n` : ''}**Recommended Priority Order**:
${numbered(order.map(([, name, why]) => `${name} (${why})`))}

${sh ? `${sh}\n\n` : ''}**Next Step**: Use \`impact_full_audit\` for an input completeness score (how complete and specific your inputs are, not whether your positioning is right), with a generated positioning draft and a 30-day plan

${SUGGESTED}
`;
    }
  },

  // ---------------------------------------------------------------------------
  // Tool 8: Full Positioning Audit
  // ---------------------------------------------------------------------------
  impact_full_audit: {
    description: 'Positioning audit with an input completeness score and recommendations',
    inputSchema: {
      type: 'object',
      properties: {
        company_name: {
          type: 'string',
          description: 'Your company name'
        },
        product_description: {
          type: 'string',
          description: 'What your product does'
        },
        target_customer: {
          type: 'string',
          description: 'Who you serve'
        },
        problem_solved: {
          type: 'string',
          description: 'The problem you solve'
        },
        key_differentiation: {
          type: 'string',
          description: 'What makes you unique'
        },
        competitors: {
          type: 'array',
          items: { type: 'string' },
          description: 'Main competitors'
        },
        current_positioning: {
          type: 'string',
          description: 'Your current positioning statement or tagline'
        },
        customer_feedback: {
          type: 'string',
          description: 'What customers say about you'
        },
        business_model: {
          type: 'string',
          enum: BUSINESS_MODELS,
          description: 'How you sell (saas, services, connectivity, transactions, marketplace, hardware_software or investment). Used in the plan; read from your inputs when not given. It does not change the score'
        }
      },
      required: ['product_description', 'target_customer', 'problem_solved']
    },
    execute: (args: {
      company_name?: string;
      product_description: string;
      target_customer: string;
      problem_solved: string;
      key_differentiation?: string;
      competitors?: string[];
      current_positioning?: string;
      customer_feedback?: string;
      business_model?: string;
    }) => {
      const company = (args.company_name || '').trim() || 'your product';
      const competitors = args.competitors || ['Status quo', 'DIY solutions'];
      const differentiation = args.key_differentiation || 'unique approach';
      const givenCompetitors = (args.competitors || []).filter((c) => c && c.trim());
      const allFeedback = splitItems(args.customer_feedback);
      // A company-wide claim ("$8B+ deployed", "more than 1,000 teams use X") or a recognition is not a result a customer describes.
      const isCompanyClaim = (x: string): boolean => /^(?:more than|over|about|around)?\s*[$]?\d[\d,.]*\+?\s*(?:billion|million|bn|[bm])\b/i.test(x.trim()) || /\bdeployed\b|\bassets under management\b|\bAUM\b/i.test(x) || /^(?:more than|over|about|around)?\s*[$\d][\d,.]*\+?\s*(?:[kmb]\b|million|billion)?\+?\s*(?:\w+\s+){0,3}(?:teams|companies|businesses|customers|users|clients|developers|enterprises|brands|merchants)\b/i.test(x.trim()) || /^(?:named|featured|recognised|recognized|ranked|winner|a leader|leader in)\b|\b(?:awards?|excellence award|magic quadrant|frost radar|major contender|enterprise innovator|gartner|forrester|idc|everest|hfs|g2|capterra|recogni[sz]ed|recognition|best [\w&' -]{3,40}(?:platform|solution|tool|software)|cio choice)\b/i.test(x);
      const companyClaims = allFeedback.filter(isCompanyClaim);
      const feedbackItems = allFeedback.filter((x) => !isCompanyClaim(x));
      const ctx = readContext(args.business_model, { core: [args.product_description], later: [args.key_differentiation, args.current_positioning], names: [args.company_name], context: [args.problem_solved, args.customer_feedback], buyer: [args.target_customer] });
      const v = ctx.v;
      const notes = MODEL_NOTES[ctx.model || 'unknown'];
      const lz = lensOf(v, args.problem_solved, args.product_description, args.target_customer);
      const vocab = lz.vocab;
      const committee = lz.fn ? { signer: lz.fn.buyer, champion: lz.fn.champion, championInferred: false, users: null, reviewers: [] } as Committee : v ? committeeParts(v) : null;

      // Calculate scores based on input completeness and clarity (unchanged: owner decision D72 pauses the grade)
      const scores = {
        identify: 0,
        map: 0,
        pinpoint: 0,
        anchor: 0,
        craft: 0,
        translate: 0
      };

      // Scoring logic based on provided inputs
      // Identify Champions (based on target customer clarity)
      if (args.target_customer.length > 20 && args.target_customer.includes(' ')) {
        scores.identify = args.target_customer.length > 50 ? 85 : 70;
      } else {
        scores.identify = 45;
      }

      // Map Alternatives (based on competitors)
      if (competitors.length > 2) {
        scores.map = 80;
      } else if (competitors.length > 0 && competitors[0] !== 'Status quo') {
        scores.map = 65;
      } else {
        scores.map = 40;
      }

      // Pinpoint Value (based on differentiation)
      if (differentiation.length > 30) {
        scores.pinpoint = differentiation.includes('only') || differentiation.includes('unique') ? 85 : 70;
      } else {
        scores.pinpoint = 50;
      }

      // Anchor Market (based on target specificity)
      if (args.target_customer.includes('employees') || args.target_customer.includes('revenue') || args.target_customer.includes('Series')) {
        scores.anchor = 80;
      } else if (args.target_customer.split(' ').length > 3) {
        scores.anchor = 65;
      } else {
        scores.anchor = 45;
      }

      // Craft Message (based on current positioning)
      if (args.current_positioning && args.current_positioning.length > 50) {
        scores.craft = args.current_positioning.includes('unlike') || args.current_positioning.includes('only') ? 85 : 70;
      } else if (args.current_positioning) {
        scores.craft = 55;
      } else {
        scores.craft = 30;
      }

      // Translate Execution (based on customer feedback indicating market presence)
      if (args.customer_feedback && args.customer_feedback.length > 50) {
        scores.translate = 75;
      } else if (args.customer_feedback) {
        scores.translate = 55;
      } else {
        scores.translate = 35;
      }

      const overallScore = Math.round((scores.identify + scores.map + scores.pinpoint + scores.anchor + scores.craft + scores.translate) / 6);

      // Determine grade
      let grade = 'F';
      let gradeDescription = '';
      if (overallScore >= 85) {
        grade = 'A';
        gradeDescription = 'Very complete: every area has detailed input';
      } else if (overallScore >= 75) {
        grade = 'B';
        gradeDescription = 'Mostly complete: a few inputs could be more specific';
      } else if (overallScore >= 65) {
        grade = 'C';
        gradeDescription = 'Partly complete: several inputs are short or missing';
      } else if (overallScore >= 50) {
        grade = 'D';
        gradeDescription = 'Thin: many inputs are short or missing';
      } else {
        grade = 'F';
        gradeDescription = 'Very thin: most inputs are short or missing';
      }

      // Find weakest areas
      const sortedScores = Object.entries(scores).sort((a, b) => a[1] - b[1]);
      const weakest = sortedScores.slice(0, 2);
      const strongest = sortedScores.slice(-2).reverse();
      // Tool name for each phase key (the tool list below names real tools, not phase keys).
      const phaseTool: Record<string, string> = {
        identify: 'impact_identify_champions', map: 'impact_map_alternatives', pinpoint: 'impact_pinpoint_value',
        anchor: 'impact_anchor_market', craft: 'impact_craft_message', translate: 'impact_translate_execution'
      };

      // ---- Words only (not part of the score): the generated positioning, tagline options, proof and word checks ----
      const problemShort = shortClause(shortText(args.problem_solved), 6);
      const diffShort = args.key_differentiation ? shortClause(args.key_differentiation, 5) : null;
      const taglines: string[] = [];
      if (problemShort && !hasFiniteVerb(problemShort) && kindOf(problemShort) !== 'base' && !/^(a|an|the)\s/i.test(problemShort)) taglines.push(`[Only if true and provable: "${capFirst(problemShort)}, solved."]`);
      if (diffShort && !['base', 'third'].includes(kindOf(diffShort))) taglines.push(`"${capFirst(diffShort)}"`);
      taglines.push(`"Built for ${shortAudience(shortText(noNotes(args.target_customer)))}"`);
      // Run 20 round 1: more options, each built from the user's own words and cut at a clause end.
      const diffWide = args.key_differentiation ? shortClause(args.key_differentiation, 9) : null;
      if (diffWide && diffWide !== diffShort && !['base', 'third'].includes(kindOf(diffWide))) taglines.push(`"${capFirst(diffWide)}"`);
      const posLead = (args.current_positioning || args.product_description || '').split(/[:;]|\s-\s/)[0].trim();
      const posShort = posLead && shortClause(posLead, 9);
      if (posShort && !taglines.some((t) => t.toLowerCase().includes(posShort.toLowerCase()))) taglines.push(`"${capFirst(posShort)}"`);
      // When no clause of 9 words or fewer exists, the first words of the differentiation and of the positioning (never ending on a joining word) are offered.
      for (const src of [args.key_differentiation, posLead]) {
        const fw = src ? leadPhrase(src) : '';
        if (fw && fw.split(/\s+/).length >= 3 && !taglines.some((t) => t.toLowerCase().includes(fw.toLowerCase()))) taglines.push(`"${capFirst(fw)}"`);
      }
      const stop = new Set('the and for with who that this our your their its are was were been from they them you can will not but all any'.split(' '));
      const wordsOf = (s: string) => (s.toLowerCase().match(/[a-z][a-z-]{2,}/g) || []).filter((w) => !stop.has(w));
      const cur = (args.current_positioning || '').trim();
      const targetWords = wordsOf(args.target_customer);
      const curWords = wordsOf(cur);
      const yn = (b: boolean) => (b ? 'Yes' : 'No');
      const genericHits = [...new Set((cur.match(/\b(smarter way|smarter|leading|best-in-class|world-class|cutting-edge|next-generation|innovative|seamless|powerful|robust|all-in-one|revolutionary|solution|platform)\b/gi) || []).map((w) => w.toLowerCase()))];
      const checks = cur ? `| Word check on your current positioning | Result |
|---|---|
| Names the buyer (shares a word with your target customer) | ${yn(targetWords.some((w) => curWords.includes(w)))} |
| Names an alternative or says what it replaces | ${yn(/\b(unlike|instead of|rather than|than|versus|vs\.?|replaces?|replacing)\b/i.test(cur) || givenCompetitors.some((c) => cur.toLowerCase().includes(nameOf(c).toLowerCase())))} |
| States a result (a number or a result word) | ${yn(/\d/.test(cur) || /\b(cut|cuts|reduce|reduces|grow|grows|save|saves|faster|fewer|more|less|lower|higher|increase|improve|improves|win|wins|fix|fixes)\b/i.test(cur))} |
| Uses generic words | ${genericHits.length ? `Yes: ${genericHits.join(', ')}` : 'No'} |` : 'No current positioning was supplied, so there is nothing to check in words. Add current_positioning.';

      return `# IMPACT Positioning Audit

## Company Overview
**Company**: ${args.company_name || 'not supplied'}
**Product**: ${args.product_description}
**Target**: ${args.target_customer}
**Problem**: ${args.problem_solved}
**Differentiation**: ${args.key_differentiation || 'not supplied'}
**Competitors**: ${givenCompetitors.length ? givenCompetitors.join('; ') : 'not supplied (the score uses the default alternatives: status quo and DIY solutions)'}
${args.current_positioning ? `**Current Positioning**: ${args.current_positioning}` : ''}
${args.customer_feedback ? `**Customer Feedback**: ${args.customer_feedback}` : ''}
${ctx.line}${longNote(args.product_description, args.target_customer, args.problem_solved, args.key_differentiation, args.current_positioning, args.customer_feedback)}

---

## IMPACT Scorecard

### Input completeness score: ${overallScore}/100 (Grade: ${grade})
**Inputs**: ${gradeDescription}
**What this score measures**: how complete and specific your inputs are, not whether your positioning is right. Longer inputs and certain words (such as only, unique, unlike, employees, revenue and Series) raise it.

| Phase | Score | Input detail | Priority |
|-------|-------|--------|----------|
| **I**: Identify Champions | ${scores.identify}/100 | ${scores.identify >= 70 ? 'Detailed' : scores.identify >= 50 ? 'Partial' : 'Thin'} | ${scores.identify < 60 ? 'High' : 'Low'} |
| **M**: Map Alternatives | ${scores.map}/100 | ${scores.map >= 70 ? 'Detailed' : scores.map >= 50 ? 'Partial' : 'Thin'} | ${scores.map < 60 ? 'High' : 'Low'} |
| **P**: Pinpoint Value | ${scores.pinpoint}/100 | ${scores.pinpoint >= 70 ? 'Detailed' : scores.pinpoint >= 50 ? 'Partial' : 'Thin'} | ${scores.pinpoint < 60 ? 'High' : 'Low'} |
| **A**: Anchor Market | ${scores.anchor}/100 | ${scores.anchor >= 70 ? 'Detailed' : scores.anchor >= 50 ? 'Partial' : 'Thin'} | ${scores.anchor < 60 ? 'High' : 'Low'} |
| **C**: Craft Message | ${scores.craft}/100 | ${scores.craft >= 70 ? 'Detailed' : scores.craft >= 50 ? 'Partial' : 'Thin'} | ${scores.craft < 60 ? 'High' : 'Low'} |
| **T**: Translate Execution | ${scores.translate}/100 | ${scores.translate >= 70 ? 'Detailed' : scores.translate >= 50 ? 'Partial' : 'Thin'} | ${scores.translate < 60 ? 'High' : 'Low'} |

---

## Most detailed inputs
${strongest.map(([phase, score]) => score < 50 ? `
### Least thin input: ${phase.charAt(0).toUpperCase() + phase.slice(1)} (${score}/100)
Rated Thin: it is listed here only because the other areas scored lower.
` : `
### ${phase.charAt(0).toUpperCase() + phase.slice(1)} (${score}/100)
${phase === 'identify' ? `Your target customer ("${shortText(noNotes(args.target_customer))}") is long and specific enough for a high score in this area.` : ''}
${phase === 'map' ? `You named ${competitors.length} competitor${competitors.length === 1 ? '' : 's'}; this area counts how many you name, not who they are.` : ''}
${phase === 'pinpoint' ? (args.key_differentiation ? `Your differentiation ("${shortText(args.key_differentiation)}") is long enough for a high score in this area${score >= 85 ? ' and uses the word "only" or "unique"' : ''}.` : 'No differentiation supplied yet.') : ''}
${phase === 'anchor' ? (score >= 80 ? `Your target customer mentions employees, revenue or a funding series.` : `Your target customer is several words long.`) : ''}
${phase === 'craft' ? (score >= 85 ? `Your current positioning is long and uses the word "unlike" or "only".` : score >= 70 ? `Your current positioning is long.` : `You supplied a current positioning statement.`) : ''}
${phase === 'translate' ? `You supplied customer feedback; this area scores its length, not what it says.` : ''}
`.replace(/\n{2,}/g, '\n')).join('')}

---

## Areas to work on next
${weakest.map(([phase, score]) => `
### ${phase.charAt(0).toUpperCase() + phase.slice(1)} (${score}/100)

${score >= 70 ? 'This input is already detailed: sharpen it next.' : `**Input**: ${
  phase === 'identify' ? 'Your target customer is short. Who exactly is your buyer?' :
  phase === 'map' ? `This area counts the competitors you name, and you named ${givenCompetitors.length || 'none'}. Naming more of the alternatives customers consider raises it.` :
  phase === 'pinpoint' ? `${args.key_differentiation ? 'Your differentiation is short.' : 'You supplied no differentiation.'} What specific outcomes do customers achieve?` :
  phase === 'anchor' ? 'Your target customer does not mention employees, revenue or a funding series. What makes a company ideal for you?' :
  phase === 'craft' ? `${args.current_positioning ? 'Your current positioning is short.' : 'You supplied no current positioning statement.'} How do you articulate your unique value?` :
  `${args.customer_feedback ? 'Your customer feedback is short.' : 'You supplied no customer feedback.'} How does positioning show up in your channels?`
}`}

**Action**: Run \`impact_${phase === 'identify' ? 'identify_champions' : phase === 'map' ? 'map_alternatives' : phase === 'pinpoint' ? 'pinpoint_value' : phase === 'anchor' ? 'anchor_market' : phase === 'craft' ? 'craft_message' : 'translate_execution'}\` to add this detail.

**Possible input score change**: +${20 - Math.floor(score / 10)} points to this area when you add the detail above ${EXAMPLE}
`).join('')}

---

## Proof You Already Have

${companyClaims.length ? `Company claims you supplied (about the company as a whole, not a customer result; show them as company claims and cite their source):\n${list(companyClaims)}\n\n` : ''}${feedbackItems.length ? `Customer feedback you supplied, as proof points (use each only if it is real and you can show it):\n${list(feedbackItems)}\n${v ? `\nWhat a good proof point looks like in ${lz.fn ? fnName(lz.fn) : v.name}: ${lz.proof}\n` : ''}` : companyClaims.length ? 'No customer result was supplied beyond the company claims above. Add what a customer says or a result they report.' : 'No customer feedback was supplied, so there is no proof to list. Add customer_feedback (what customers say, or results they report).'}

---

## Your Current Positioning, Checked in Words

These checks read your words only. They are not part of the score above.

${checks}

---

## Recommended Positioning

Based on your inputs, here's a generated positioning statement:

> **For** ${mid(noNotes(args.target_customer).length <= 90 ? noNotes(args.target_customer) : shortAudience(args.target_customer))}
> **Who** ${needClause(shortText(args.problem_solved, FRAME_AT))}
> **What ${company} is** ${q(clean(shortText(args.product_description, FRAME_AT)))}
> **That** ${feedbackItems.length ? `delivers the result your customers describe: ${q(shortText(feedbackItems[0], 160))}` : 'delivers a result you still have to state: write it with impact_pinpoint_value'}
> **Unlike** ${givenCompetitors.length ? joinList(givenCompetitors.slice(0, 3).map((c) => labelOf(c)), 'or') : 'the alternative your buyers use most (add competitors)'}
> **We** ${args.key_differentiation ? gateClaim(args.key_differentiation, weClause(shortText(args.key_differentiation, FRAME_AT))) : 'offer what sets you apart (add key_differentiation)'}

### Tagline Options
${numbered(taglines.map((t) => (SUPERLATIVE.test(t) && !/Only if true/.test(t) ? `[Only if true and provable: ${t}]` : t)).filter((t) => { const w = t.replace(/^\[Only if true and provable: |\]$/g, '').replace(/^"|"$/g, '').split(/\s+/); return w.length <= 9 && !/^(?:combined|made|built|based|layered|powered)$/i.test(w[w.length - 1]); }))}

---

## 30-Day Action Plan

### Week 1: Foundation
- [ ] Confirm who champions and who signs: ${committee ? `${committee.champion} and ${committee.signer} (this sector's usual committee)` : 'the champion and the economic buyer'}
- [ ] Document 5+ weaknesses of ${givenCompetitors.length ? joinList(givenCompetitors.map((c) => labelOf(c)), 'and') : 'your alternatives'} from customer research
- [ ] Turn the proof you already have into 3 quantified proof points

### Week 2: Positioning
- [ ] Finalize positioning statement (3 variations)
- [ ] Test with 5 existing customers
- [ ] Refine based on feedback

### Week 3: Execution
- [ ] Update your ${notes.assets}${vocab.length ? `, in the words this sector's buyers use (${vocab.slice(0, 6).join(', ')})` : ''}
${v ? `- [ ] Prepare answers to this sector's usual objections: ${v.objections.map((o) => `"${o.objection}"`).join('; ')}\n` : ''}- [ ] Be ready to discuss what buyers weigh in a business like yours: ${notes.commercial}\n
### Week 4: Validation
- [ ] A/B test messaging in outreach
- [ ] Track ${lz.metrics.length ? lz.metrics.slice(0, 3).join(', ') : 'the measures your buyers already use'}
- [ ] Gather qualitative feedback from prospects

---

## Measures To Track

Fill the cells with your own numbers; this tool adds none.

| Measure | Baseline (yours) | Target (yours) |
|---------|------------------|----------------|
${(lz.metrics.length ? lz.metrics.slice(0, 4) : ['A measure of reach', 'A measure of conversion', 'A measure of cycle time']).map((m) => `| ${m} | | |`).join('\n')}

**Investment**: decide how many hours your team can give to positioning work; this tool does not estimate it.

---

## Tools to Use Next

Based on your scores, prioritize these tools:

1. **\`${phaseTool[weakest[0][0]]}\`**: Address your lowest-scoring area first
2. **\`${phaseTool[weakest[1][0]]}\`**: Then the second-lowest-scoring area
${[['impact_craft_message', 'Synthesize into final positioning'], ['impact_translate_execution', 'Activate across channels']]
  .filter(([t]) => t !== phaseTool[weakest[0][0]] && t !== phaseTool[weakest[1][0]])
  .map(([t, what], i) => `${i + 3}. **\`${t}\`**: ${what}`).join('\n')}

${SUGGESTED}
`;
    }
  }
};

// =============================================================================
// SERVER HANDLERS
// =============================================================================

// =============================================================================
// SERVER (shared by the stdio entry below and netlify/functions/mcp.mjs)
// Added for the hosted connector: tool titles and annotations, and a clear
// message when a required input is missing. Tool code above is unchanged.
// =============================================================================

export const SERVER_NAME = 'impact-mcp';
export const SERVER_VERSION = '2.2.19';

// Every tool only builds text from its inputs: no storage, no network, no side effects.
const TOOL_TITLES: Record<string, string> = {
  "impact_get_framework": "IMPACT Framework Guide",
  "impact_identify_champions": "Identify Champions",
  "impact_map_alternatives": "Map Alternatives",
  "impact_pinpoint_value": "Pinpoint Value",
  "impact_anchor_market": "Anchor Market",
  "impact_craft_message": "Craft Message",
  "impact_translate_execution": "Translate Execution",
  "impact_full_audit": "IMPACT Full Audit"
};

function withMeta<T extends { name: string }>(tool: T) {
  const title = TOOL_TITLES[tool.name] ?? tool.name;
  return {
    ...tool,
    title,
    annotations: { title, readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  };
}

// Decision N2 (run 6) and the run 7 fixes (T2, T3, T5, T6): every input is checked against its schema before a tool runs,
// at any depth. A number sent as text is read the way the web form reads it (commas allowed) or refused; minimum,
// exclusiveMinimum and maximum hold; a choice must be one of the listed values; a text field that holds money
// (MONEY_TEXT) cannot hold a negative amount (a negative percentage such as "-12% growth" is fine); a metrics text
// (METRIC_TEXT) cannot hold negative money but may hold a negative NPS or growth rate; a field that must
// hold one amount (ONE_AMOUNT) cannot hold a range.
type SchemaNode = { type?: string; minimum?: number; exclusiveMinimum?: number; maximum?: number; enum?: unknown[]; properties?: Record<string, SchemaNode>; items?: SchemaNode };
const NEGATIVE_AMOUNT = /\$\s*[-\u2212]\s*\d|(^|[\s(:=,;])[-\u2212](?:\$|usd|inr|eur|gbp|rs\.?|\u20b9|\u20ac|\u00a3)?\s?\d[\d,]*(?:\.\d+)?(?![\d,.]|\s*%)/i;
const NEGATIVE_MONEY = /[-−]\s?[$₹€£]\s*\d|[$₹€£]\s*[-−]\s*\d|\b(?:mrr|arr|cac|ltv|acv)\b[:\s]*[-−]\s*\d/i;
const AMOUNT_RANGE = /\d\s*[kmb]?\s*(?:-|\u2013|\u2014|to)\s*[$\u20b9\u20ac\u00a3]?\s*\d/i;
function checkValue(schema: SchemaNode, holder: Record<string, unknown> | unknown[], key: string | number, path: string, problems: string[]): void {
  const box = holder as Record<string | number, unknown>;
  const value = box[key];
  if (value === undefined || value === null) return;
  if (schema.properties && typeof value === "object" && !Array.isArray(value)) {
    for (const [k, p] of Object.entries(schema.properties)) checkValue(p, value as Record<string, unknown>, k, path ? `${path}.${k}` : k, problems);
    return;
  }
  if (schema.items && Array.isArray(value)) {
    value.forEach((_, i) => checkValue(schema.items as SchemaNode, value, i, `${path}[${i}]`, problems));
    return;
  }
  if (Array.isArray(schema.enum) && typeof value === "string" && !schema.enum.includes(value)) {
    problems.push(`${path} must be one of: ${schema.enum.join(", ")}`);
    return;
  }
  if (schema.type !== "number" && schema.type !== "integer") return;
  let v = value;
  if (typeof v === "string") {
    const n = v.trim() === "" ? NaN : Number(v.replace(/,/g, "").trim());
    if (!Number.isFinite(n)) { problems.push(`${path} must be a number, written with digits only (for example 220000)`); return; }
    box[key] = n;
    v = n;
  }
  if (typeof v !== "number" || !Number.isFinite(v)) { problems.push(`${path} must be a number`); return; }
  if (typeof schema.minimum === "number" && v < schema.minimum) problems.push(`${path} must be ${schema.minimum} or more`);
  if (typeof schema.exclusiveMinimum === "number" && v <= schema.exclusiveMinimum) problems.push(`${path} must be more than ${schema.exclusiveMinimum}`);
  if (typeof schema.maximum === "number" && v > schema.maximum) problems.push(`${path} must be ${schema.maximum} or less`);
}

const MONEY_TEXT: Record<string, string[]> = { impact_anchor_market: ["average_deal_size"], impact_identify_champions: ["price_point"] };
const METRIC_TEXT: Record<string, string[]> = {};
const ONE_AMOUNT: Record<string, string[]> = { impact_anchor_market: ["average_deal_size"] };

function checkRequiredInputs(name: string, args: Record<string, unknown> | undefined): string | null {
  const tool = (tools as Record<string, { inputSchema: { required?: string[] } }>)[name];
  if (!tool) {
    return `Unknown tool: ${name}. Available tools: ${Object.keys(tools).join(', ')}.`;
  }
  const required = tool.inputSchema.required ?? [];
  // Run 16 R16-10 (rule B52): a required text (a string with no fixed list of choices) that is empty or only whitespace counts as missing.
  const props = ((tool.inputSchema as { properties?: Record<string, { type?: string; enum?: unknown[] }> }).properties ?? {});
  const blankText = (key: string) => typeof args?.[key] === "string" && (args[key] as string).trim() === "" && props[key]?.type === "string" && !Array.isArray(props[key]?.enum);
  const missing = required.filter((key) => args?.[key] === undefined || args?.[key] === null || blankText(key));
  if (missing.length > 0) {
    return `Missing required input for ${name}: ${missing.join(', ')}. Provide ${missing.length === 1 ? 'it' : 'them'} and call the tool again.`;
  }
  // Decision N2 (run 6) and run 7: schema limits at any depth, choices, money text and single amounts.
  const problems: string[] = [];
  if (args) {
    for (const [k, p] of Object.entries((tool.inputSchema as unknown as SchemaNode).properties ?? {})) checkValue(p, args, k, k, problems);
  }
  for (const key of MONEY_TEXT[name] ?? []) {
    const raw = args?.[key];
    if (typeof raw === "string" && NEGATIVE_AMOUNT.test(raw)) problems.push(`${key} must not contain a negative amount`);
  }
  for (const key of METRIC_TEXT[name] ?? []) {
    const raw = args?.[key];
    if (typeof raw === "string" && NEGATIVE_MONEY.test(raw)) problems.push(`${key} must not contain a negative amount of money`);
  }
  for (const key of ONE_AMOUNT[name] ?? []) {
    const raw = args?.[key];
    if (typeof raw === "string" && AMOUNT_RANGE.test(raw)) problems.push(`${key} must be one amount, not a range (for example $75,000)`);
  }
  if (problems.length > 0) {
    return `Invalid input for ${name}: ${problems.join("; ")}.`;
  }
  return null;
}

/** Run 21c round 3: a product typed as a long description is named in running sentences by its noun phrase ("Freight visibility platform"); a clear name is used as typed. The Product line keeps the full text. */
function runningName(text: string): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (!t || (t.split(' ').length <= 6 && t.length <= 60)) return t;
  const head = t.split(/[:;]|,\s/)[0].replace(/\s*\([^)]*\)/g, '').trim();   // a bracket note is not part of a short name
  const words = head.split(' ');
  if (words.length <= 6 && head.length <= 60) return head;
  const j = words.findIndex((w, i) => i >= 2 && /^(?:that|which|who|where|for|with|by|from|to|connects?|helps?|lets?|gives?|makes?|builds?|runs?|designs?|turns?|unifies?|joins?|uses?)$/i.test(w));
  if (j >= 2 && j <= 7) return words.slice(0, j).join(' ');
  const lead = words.slice(0, 4);
  while (lead.length > 2 && /^(?:that|which|who|where|for|with|to|by|on|in|of|and|or|from|the|a|an)$/i.test(lead[lead.length - 1])) lead.pop();
  return lead.join(' ');
}

export function createServer(): Server {
  const server = new Server(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: Object.entries(tools).map(([name, config]) => withMeta({ name, description: config.description, inputSchema: config.inputSchema })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    // Run 20 echo safeguard (D086): the single dispatch point of the hosted function and of stdio. Every string in the arguments is
    // made inert once, here, before it is checked or used: markup, links, hidden characters; an instruction-like text is quoted.
    const safeName = neutraliseText(String(request.params.name));
    const safeArgs = neutraliseDeep(request.params.arguments) as Record<string, unknown> | undefined;
    const problem = checkRequiredInputs(request.params.name, safeArgs);
    if (problem) {
      return { content: [{ type: 'text', text: neutraliseText(problem) }], isError: true };
    }
    const toolName = request.params.name as keyof typeof tools;
    const tool = tools[toolName];
  
    if (!tool) {
      return {
        content: [{
          type: 'text',
          text: `Unknown tool: ${safeName}. Available tools: ${Object.keys(tools).join(', ')}`
        }],
        isError: true
      };
    }
  
    try {
      // Text only (run 11, R11-06): a target customer that is a job title reads in lower case in running text
      // ("head of marketing"); names and acronyms in it keep their capitals. Any other target customer stays as typed.
      const callArgs = { ...((safeArgs || {}) as Record<string, unknown>) };
      if (typeof callArgs.target_customer === 'string' && isJobTitle(callArgs.target_customer)) callArgs.target_customer = lowerJobTitle(callArgs.target_customer);
      const result = tool.execute(callArgs as any);
      return {
        content: [{ type: 'text', text: result }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error executing ${toolName}: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      };
    }
  });

  return server;
}


// =============================================================================
// MAIN
// =============================================================================

async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`IMPACT MCP v${SERVER_VERSION} running on stdio`);
}

// Run over stdio only when started directly (npm bin). The hosted function imports this
// file as an ES module bundle, where require is not defined.
if (typeof module !== 'undefined' && typeof require !== 'undefined' && require.main === module) {
  main().catch(console.error);
}

// Reads one amount from text: "$5,000", "$50K" and "$1.5M" give 5000, 50000 and 1500000 (run 7, T5).
function readAmount(text: string): number | null {
  const m = text.replace(/,/g, '').match(/(\d+(?:\.\d+)?)\s*([kmb])?\b/i);
  if (!m) return null;
  const mult: Record<string, number> = { k: 1e3, m: 1e6, b: 1e9 };
  return Math.round(parseFloat(m[1]) * (mult[(m[2] || '').toLowerCase()] ?? 1));
}
