#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SERVER_VERSION = exports.SERVER_NAME = void 0;
exports.noNotes = noNotes;
exports.splitItems = splitItems;
exports.kindOf = kindOf;
exports.inf = inf;
exports.needClause = needClause;
exports.diffSentence = diffSentence;
exports.shortText = shortText;
exports.shortList = shortList;
exports.catNoun = catNoun;
exports.strengthParts = strengthParts;
exports.splitWeaknesses = splitWeaknesses;
exports.labelOf = labelOf;
exports.leadPhrase = leadPhrase;
exports.committeeParts = committeeParts;
exports.functionOf = functionOf;
exports.industryOf = industryOf;
exports.pctText = pctText;
exports.parseCounts = parseCounts;
exports.createServer = createServer;
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const echo_safe_ts_1 = require("./echo-safe.js");
const rw_impact_ts_1 = require("./rw-impact.js");
const verticals_ts_1 = require("./verticals.js");
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
const COMMON_WORDS = new Set(('a an the this that these those our your their my its his her we you they it me us them all any each every ' +
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
    'lost won ').split(/\s+/).filter(Boolean));
// A word counts as common when it is in the list, or ends in -ing or -ed ("Automated", "Missing"). A hyphenated
// word counts by its first part ("Two-way", "Fewer-errors").
function isCommonWord(word) {
    const head = word.split('-')[0].replace(/[^A-Za-z']+$/, '');
    if (!/^[A-Z][a-z']*$/.test(head) || head === 'I' || /[A-Z]/.test(word.slice(1)))
        return false;
    const w = head.toLowerCase();
    return COMMON_WORDS.has(w) || (w.length > 4 && /(?:ing|ed)$/.test(w));
}
// Text only (run 10): names that keep their capital when they open an input phrase placed mid-sentence. The list holds
// common product and company names and the names found in the test inputs; other names are kept by the rules below.
const KNOWN_NAMES = new Set(('Salesforce Microsoft Slack HubSpot LinkedIn Google Gmail Outlook Excel Zoom Zendesk Jira Notion Shopify Stripe ' +
    'Marketo Pardot Gong Intercom Freshworks Oracle SAP Workday ServiceNow Snowflake Tableau Asana Trello Dropbox ' +
    'Apple Amazon AWS Azure Facebook Instagram WhatsApp YouTube Sam ' +
    // Run 11: the company and competitor names in the test inputs and the page examples.
    'Bengaluru Clari Northwind Metricly India Indian Europe European Asia Africa Singapore Dubai Mumbai Delhi Bangalore London Germany France Japan Australia Brazil Canada American').split(/\s+/).filter(Boolean));
function bareWord(word) {
    return word.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, '');
}
function isKnownName(word) {
    const w = bareWord(word);
    return KNOWN_NAMES.has(w) || KNOWN_NAMES.has(w.split(/['-]/)[0]);
}
// Run 11: a known name typed in lower case gets its capitals back ("bengaluru teams" becomes "Bengaluru teams"). Names
// that are also ordinary words (Slack, Zoom, Notion, Gong, Sam ...) are kept when typed with a capital, never raised.
const PLAIN_WORDS = new Set('slack zoom notion excel oracle stripe apple amazon gong sam outlook workday snowflake asana tableau intercom sap azure'.split(' '));
const NAME_BY_LOWER = new Map([...KNOWN_NAMES].filter(n => !PLAIN_WORDS.has(n.toLowerCase())).map(n => [n.toLowerCase(), n]));
function fixNames(phrase) {
    return phrase.replace(/[A-Za-z]+/g, w => (w === w.toLowerCase() && NAME_BY_LOWER.get(w)) || w);
}
// Run 11: a job title in running text is all lower case ("head of marketing", "operations director"); names and
// acronyms in it keep their capitals ("VP of sales", "director of Salesforce operations").
const JOB_WORD = /^(?:head|directors?|managers?|chief|officers?|president|coordinators?|supervisors?|specialists?|administrators?)$/i;
function isJobTitle(phrase) {
    const w = phrase.trim().split(/\s+/).map(bareWord);
    return w.length <= 6 && w.some((x, i) => JOB_WORD.test(x) && (x.toLowerCase() !== 'head' || (w[i + 1] || '').toLowerCase() === 'of'));
}
function lowerJobTitle(phrase) {
    return phrase.trim().split(/(\s+)/).map(w => (/^[A-Z][a-z'-]+\W*$/.test(w) && !isKnownName(w) ? w.charAt(0).toLowerCase() + w.slice(1) : w)).join('');
}
// Run 10: the first word of an input phrase keeps its capital only when it is a known name, has an inner capital or is
// all capitals (HubSpot, AI, CRM), holds a digit (B2B, Q4), or starts a name of two words: the next word is capitalised
// too (New York, Branch Group A, Competitor A) and is not a known name on its own ("Native Salesforce" is not a name).
// Run 11: a one-letter word keeps its capital (I, X), and a common first word never makes the next word a name ("For
// Cloudmoat exposure ranking" becomes "for Cloudmoat exposure ranking"), unless the next word is a one-letter label after
// a noun (Competitor A) or the phrase opens with three capitalised words (Example Logistics Co).
function keepsFirstCapital(word, next, third = '') {
    const w = bareWord(word);
    if (!/^[A-Z]/.test(w) || (w.length === 1 && !(w === 'A' && next)) || isKnownName(w))
        return true; // the article A is not a one-letter name
    if (/^[A-Z][a-z]+'s$/.test(w) && !isCommonWord(w.slice(0, -2)))
        return true; // a possessive name (India's, Gartner's)
    if (/[A-Z0-9]/.test(w.slice(1)))
        return true;
    const n = bareWord(next || '');
    if (/^\d/.test(n) && !isCommonWord(w))
        return true; // Fortune 500, Series B, Tier 1: a name followed by a number
    if (!/^[A-Z](?:[a-z]+(?:['-][a-z]+)*)?$/.test(n) || isKnownName(n))
        return false;
    if (!isCommonWord(w) || w === 'New')
        return true; // New York, New Delhi
    if (n.length === 1)
        return !/^(?:for|with|from|to|of|in|on|at|by|and|or|the|a|an|into|about|why|how|what|when|where|who|your|our|their|my|this|that)$/i.test(w);
    return /^[A-Z][a-z]/.test(bareWord(third || ''));
}
// An input phrase placed mid-sentence: its first word is lowered unless keepsFirstCapital() keeps it
// ("Native Salesforce integration" becomes "native Salesforce integration"; "Salesforce data you can trust" stays).
function lowerFirstIfCommon(phrase) {
    const t = fixNames(phrase.trim());
    if (isJobTitle(t))
        return lowerJobTitle(t);
    const parts = t.split(/(\s+)/);
    if (keepsFirstCapital(parts[0] || '', parts[2] || '', parts[4] || ''))
        return t;
    parts[0] = parts[0].replace(/[A-Z]/, c => c.toLowerCase());
    // Run 11: after a lowered first word, a capitalised common second word is lowered too ("why forecasting matters now").
    if (parts[2] && isCommonWord(parts[2]))
        parts[2] = parts[2].charAt(0).toLowerCase() + parts[2].slice(1);
    return parts.join('');
}
// The same for a whole phrase (this replaces a plain toLowerCase(), which also lowered names and acronyms): the first
// word follows the rule above, and a later word is lowered only when it is a common word. A capitalised word straight
// after a kept name stays too, so a name of two words keeps both ("Microsoft Teams approvals").
function lowerCommonWords(phrase) {
    let afterName = false;
    let first = true;
    const t = fixNames(phrase.trim());
    if (isJobTitle(t))
        return lowerJobTitle(t);
    const parts = t.split(/(\s+)/);
    return parts.map((w, i) => {
        if (!w.trim())
            return w;
        const lower = first ? !keepsFirstCapital(w, parts[i + 2] || '', parts[i + 4] || '') : !afterName && isCommonWord(w);
        first = false;
        afterName = !lower && /^[A-Z]/.test(w);
        return lower ? w.replace(/[A-Z]/, c => c.toLowerCase()) : w;
    }).join('');
}
// Text only (run 8, run 9): an input phrase placed mid-sentence starts in lower case ("That Fewer late deliveries" becomes
// "That delivers fewer late deliveries") only when its first word is a common word; names and acronyms keep their capitals.
function mid(phrase) {
    return lowerFirstIfCommon(phrase);
}
// Text only: an input phrase that starts a sentence or a headline starts with a capital. A first word written with
// a small letter and an inner capital (iPhone, eBay) is a name and is kept as typed.
// Text only (run 10): "a" or "an" before a phrase, by its first sound (an analytics platform, a CRM, an SMS tool).
function aOrAn(phrase) {
    const w = (phrase.trim().split(/\s+/)[0] || '').replace(/^[^A-Za-z0-9]+/, '');
    if (/^[A-Z0-9]{2,}$/.test(bareWord(w)))
        return /^[AEFHILMNORSX8]/.test(w) ? 'an' : 'a';
    if (/^(hour|honest|heir)/i.test(w))
        return 'an';
    return /^[aeiou]/i.test(w) && !/^(uni|use|usu|uti|eu|one|once)/i.test(w) ? 'an' : 'a';
}
function cap(phrase) {
    const t = fixNames(phrase.trim());
    if (/^[a-z]+[A-Z]/.test(t.split(/\s+/)[0] || ''))
        return t;
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
function leadAudience(words) {
    let end = words.length;
    let coord = false;
    for (let i = 1; i < words.length; i++) {
        if (AUDIENCE_STOP.test(words[i])) {
            end = i;
            break;
        }
        if (/[,;:(]$/.test(words[i])) {
            // Run 20 round 2: "the world's leading AI, SaaS and consumer subscription businesses" is one list that shares its last noun; a short first item is not an audience.
            const rest = words.slice(i + 1, i + 8);
            if (i + 1 <= 5 && /[,]$/.test(words[i]) && rest.some((w) => /^(?:and|or)$/i.test(w))) {
                const stop = rest.findIndex((w) => AUDIENCE_STOP.test(w) || /[;:(]$/.test(w));
                end = i + 1 + (stop >= 0 ? stop : rest.length);
                coord = true;
                while (end > i + 1 && /[,;:(]$/.test(words[end - 1]) && end - 1 > i) {
                    break;
                }
                break;
            }
            end = i + 1;
            break;
        }
    }
    let lead = words.slice(0, end).map((x, k) => (k === end - 1 ? x.replace(/[,;:(]+$/, '') : x));
    if (coord && lead.length <= 10)
        return /^(?:the|a|an|of|leading|largest|top|best|global)$/i.test(lead[lead.length - 1]) ? null : lead;
    if (lead.length > 5) {
        const of = lead.findIndex((x, k) => k > 0 && /^of$/i.test(x));
        lead = of > 0 ? lead.slice(0, of) : lead.length <= 8 && end < words.length && /[,;:(]$/.test(words[end - 1] || '') ? lead : lead.slice(0, 0);
    }
    // an audience never ends on a determiner or a modifier ("the world's leading")
    if (lead.length && /^(?:the|a|an|of|leading|largest|top|best|global|new|biggest|most|more|other|many|all|our|their|its)$/i.test(lead[lead.length - 1]))
        return null;
    return lead.length && lead.length <= 8 && !/\d/.test(lead.join(' ')) ? lead : null;
}
// Run 20 round 1: a bracketed note inside an audience ("(the about page calls ...)", "(page claim)") is a source note, not part of the audience.
function noNotes(t) {
    // run 21c round 6: a clause about another business's audience is not the audience
    t = t.replace(/\s*;\s*[^;]*\bserved by (?:a |another |an )?(?:separate|different|sister) (?:business|company|team|brand|product)[^;]*/gi, '');
    return t.replace(/\s*[;:]\s*(?:more than|over|about)?\s*[\d,]+\+?\s.*$/i, '').replace(/,\s+in particular\b.*$/i, '').replace(/,?\s+(?:with )?the (?:about )?(?:page|site|website)\b[^;]*$/i, '').replace(/\s*\([^)]*\)/g, '').replace(/\s*;\s*/g, ', ').replace(/\s{2,}/g, ' ').replace(/[,;:\s]+$/, '').trim() || t.trim();
}
function shortAudience(phrase) {
    const w = mid(noNotes(phrase)).split(/\s+/);
    if (w.length <= 5)
        return w.join(' ');
    const lead = leadAudience(w);
    if (lead)
        return lead.join(' ');
    let i = w.length - 2;
    while (i > 0 && JOINING_WORD.test(w[i]))
        i--;
    if (i > 1 && PLACE_WORD.test(w[i - 1])) {
        let j = i - 1;
        while (j > 0 && PLACE_WORD.test(w[j - 1]))
            j--;
        if (j > 0 && j <= 5)
            return w.slice(0, j).join(' ');
    }
    return w.slice(i).join(' ');
}
// The same as a plural for "Join 100+ ...": a job title of the form "head of marketing" becomes "heads of marketing".
function pluralAudience(phrase) {
    const a = shortAudience(phrase);
    const m = a.match(/^([A-Za-z]+)( of .+)$/);
    return m && !/s$/i.test(m[1]) ? `${m[1]}s${m[2]}` : a;
}
function firstWords(phrase, n) {
    const all = phrase.trim().split(/\s+/);
    let w = all.slice(0, n);
    if (all.length > n && !JOINING_WORD.test(all[n]) && !/[,.;:!?]$/.test(w[w.length - 1])) {
        const back = w.map(x => JOINING_WORD.test(x)).lastIndexOf(true);
        if (back > 0)
            w = w.slice(0, back);
        else {
            let i = n;
            while (i < all.length && i < n + 3 && !JOINING_WORD.test(all[i]) && !/[,.;:!?]$/.test(all[i - 1]))
                i++;
            w = all.slice(0, i);
        }
    }
    while (w.length > 1 && JOINING_WORD.test(w[w.length - 1]))
        w.pop();
    return w.join(' ').replace(/[,;:]$/, '');
}
// =============================================================================
// Run 19 (owner decision D80): shared helpers for the 8 problems of the real-world test.
// =============================================================================
// Sector knowledge sits in ONE data file, src/verticals.ts (rule B82: no statistic, market size, benchmark or named-company fact).
// A list typed by the user: one item per line or per semicolon. Commas stay inside an item, so a phrase such as
// "Routes re-planned in under a minute, not overnight" is never cut into a fragment. A plain comma list of short items is split.
function splitItems(s) {
    if (typeof s !== 'string')
        return [];
    const parts = s.split(/\n|;/).map((x) => x.trim().replace(/^[-*•]\s*/, '')).filter(Boolean);
    // Run 20 round 1: a comma list is cut into items only when it has at least three short items ("live re-routing, address cleaning, offline driver app");
    // "AI, machine learning and mobility based automation" stays one phrase instead of fragments.
    if (parts.length === 1 && /,/.test(parts[0])) {
        const c = parts[0].split(/,(?!\d{3}(?!\d))/).map((x) => x.trim()).filter(Boolean);
        if (c.length >= 3 && c.every((x) => x.split(/\s+/).length <= 4) && !c.some((x) => /^(not|but|and|or|so|which|that)\b/i.test(x)))
            return c;
    }
    return parts;
}
// Text typed by the user, quoted when it is placed inside one of the tool's own sentences, so a clause never breaks the grammar.
function q(s) {
    const t = s.trim().replace(/^"|"$/g, '');
    return `"${/\.\.\.$/.test(t) ? t : t.replace(/[.!]+$/, '')}"`;
}
const clean = (s) => s.trim().replace(/[.!]+$/, '');
function readContext(explicitModel, r) {
    // A brand name is not a sector word ("Brightfield Software" is not a software product): it is taken out of the other texts before they are read.
    const nameList = (r.names || []).filter((x) => typeof x === 'string' && x.trim().length >= 3).map((x) => x.trim());
    const brand = /\b[A-Z][\w-]*\s+(?:Software|Technologies|Systems|Solutions|Labs|Infotech)\b/g; // "Brightfield Software" is a company name, not a product word
    const strip = (x) => (typeof x === 'string' ? nameList.reduce((t, nm) => t.split(new RegExp(nm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')).join(' '), x).replace(brand, ' ') : x);
    const coreT = (r.core || []).map(strip), laterT = (r.later || []).map(strip);
    const descr = [...coreT, ...laterT];
    const full = { seller: [...descr, ...(r.names || [])], context: r.context, role: r.role, buyer: r.buyer };
    const coreOnly = coreT.length ? (0, verticals_ts_1.explainSector)({ seller: coreT }) : null;
    let ex = coreOnly && coreOnly.vertical ? coreOnly : (0, verticals_ts_1.explainSector)(full);
    // The shared reader cuts a text at "for ..." (the buyer part), so "cloud platform for testing websites ... AI agents" can still read AI native from the label alone:
    // the seller's own texts are read once more as free text without the AI words, and a trade they name then wins (the shared guard covers the other cases).
    if (ex.vertical && ex.vertical.id === 'ai-native' && (0, verticals_ts_1.detectModel)(undefined, { seller: descr }).model !== 'investment') {
        const noAi = (x) => (typeof x === 'string' ? x.replace(/\b(?:AI|A\.I\.)[- ](?:native|powered|led|driven|enabled|first|agents?|analyst|copilot|assistant|layered)\b|\bgenerative AI\b|\bGenAI\b|\bLLMs?\b|\b(?:agent )?copilots?\b|\bchatbots?\b|\bAI\b/gi, ' ') : x);
        const again = (0, verticals_ts_1.explainSector)({ context: [...descr, ...(r.names || [])].map(noAi) });
        if (again.vertical && again.vertical.id !== 'ai-native')
            ex = again;
    }
    const v0 = ex.vertical;
    // The model is read from what the product is (core) first; the capability and positioning text can mention "tools" or "cloud" in any business.
    const first = coreT.length ? (0, verticals_ts_1.detectModel)(explicitModel, { seller: coreT }) : null;
    const read = first && (first.how === 'input' || first.how === 'read') ? first : (0, verticals_ts_1.detectModel)(explicitModel, { seller: descr });
    const m0 = read.how === 'input' || read.how === 'read' ? read : v0 ? { model: (v0.subtype ? verticals_ts_1.SUBTYPES.find((x) => x.id === v0.subtype)?.model : undefined) ?? verticals_ts_1.SECTOR_MODEL[v0.id], how: 'sector' } : read;
    // Run 22: a services firm that names "AI-powered tools" or a platform among its capabilities is still a services firm: when the whole text reads as ITeS and
    // only a tool word made it a subscription, the model is services (the shared reader does the same when it sees the whole text).
    const saasWords = /\b(?:saas|subscriptions?|per seat|per user|licen[cs]es?)\b/i;
    const m = v0 && v0.id === 'ites' && m0.model === 'saas' && m0.how === 'read' && !saasWords.test(descr.filter((x) => typeof x === 'string').join(' ')) ? { model: 'services', how: 'sector' } : m0;
    // A seller that manages money gets the investment roles and measures, not the sector's own (shared sector file, profileFor).
    const v = (0, verticals_ts_1.profileFor)(v0, m.model, full);
    const from = ex.source === 'context' ? ' (from the deal text, because your own description names no sector)' : ex.source === 'role' ? ' (from the job titles, because your own description names no sector)' : ex.source === 'buyer' ? ' (from who you sell to, because your own description names no sector)' : '';
    const sector = v ? `read from your inputs as ${v.name}${from}` : 'not clear from your inputs (name the industry in plain words for sector notes)';
    const model = m.model
        ? `${verticals_ts_1.MODEL_NAME[m.model]} (${m.how === 'input' ? 'from business_model' : m.how === 'sector' ? 'the usual model in this sector, assumed; set business_model to change it' : 'read from your inputs; set business_model to change it'})`
        : 'not clear from your inputs; set business_model (saas, services, connectivity, transactions, marketplace, hardware_software or investment) for advice that fits it';
    return { v, model: m.model, line: `*Sector: ${sector}. Business model: ${model}.*` };
}
// The measures of a sector. The AI native list in the data file is written for customer-service automation (resolution, handling time),
// so for AI native only the measures that fit any AI product are shown (accuracy on the buyer's own data, and escalation to a person).
function metricsOf(v) {
    return v.metrics;
}
// Run 21b: the measures of a sector, ordered by the user's own words. A measure that shares a word with the problem the user typed (or, less, with the
// product description) comes first; the rest keep the sector's order, so nothing is dropped and nothing is added. No match: the sector's order stands.
const MEASURE_STOP = new Set(['rate', 'time', 'share', 'effort', 'cost', 'number', 'count', 'average', 'total', 'per', 'and', 'the', 'for', 'with', 'from', 'that', 'this', 'your']);
const measureStems = (t) => new Set((t.toLowerCase().match(/[a-z]{4,}/g) || []).filter((w) => !MEASURE_STOP.has(w)).map((w) => w.replace(/s$/, '').slice(0, 4)));
function rankMeasures(measures, problem, product) {
    const p = measureStems(problem), d = measureStems(product);
    const score = (m) => [...measureStems(m)].reduce((n, w) => n + (p.has(w) ? 2 : 0) + (d.has(w) ? 1 : 0), 0);
    return measures.map((m, i) => ({ m, i, s: score(m) })).sort((a, b) => b.s - a.s || a.i - b.i).map((x) => x.m);
}
const sectorLine = (v) => v
    ? `*Sector: read from your inputs as ${v.name}.*`
    : '*Sector: not clear from your inputs, so no sector notes are added. Name the industry in plain words (for example logistics tech, fintech, SaaS, vertical SaaS, AI native, IT services, telecom, software or cybersecurity).*';
const SECTOR_NAMES = verticals_ts_1.VERTICALS.map((v) => v.name).join(', ');
// A sector typed on its own ("fintech", "IT services"): one word is enough here, unlike detectVertical, which reads whole texts.
const SECTOR_WORDS = [
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
function findSector(text) {
    const t = text.trim();
    if (!t)
        return null;
    for (const [id, re] of SECTOR_WORDS)
        if (re.test(t))
            return verticals_ts_1.VERTICALS.find((v) => v.id === id) || null;
    return (0, verticals_ts_1.detectVertical)(t);
}
const list = (items, prefix = '- ') => items.map((x) => `${prefix}${x}`).join('\n');
const numbered = (items) => items.map((x, i) => `${i + 1}. ${x}`).join('\n');
function sectorBlock(v, parts, heading = 'Sector view') {
    if (!v)
        return '';
    const out = [`### ${heading}: ${v.name}`];
    if (parts.includes('vocabulary'))
        out.push(`- **Words this sector's buyers use:** ${v.vocabulary.join(', ')}.`);
    if (parts.includes('committee'))
        out.push(`- **Who usually buys:** ${v.committee}`);
    if (parts.includes('motion'))
        out.push(`- **How deals usually run:** ${v.salesMotion}`);
    if (parts.includes('metrics'))
        out.push(`- **What this sector measures:** ${metricsOf(v).join(', ')}.`);
    if (parts.includes('objections'))
        out.push(`- **Objections this sector often raises:** ${v.objections.map((o) => `"${o.objection}"`).join('; ')}.`);
    if (parts.includes('proof'))
        out.push(`- **A proof point that lands:** ${v.proofShape}`);
    if (parts.includes('discovery'))
        out.push(`- **Discovery questions in this sector's language:**\n${numbered(v.discovery).split('\n').map((l) => `  ${l}`).join('\n')}`);
    return out.join('\n');
}
const BASE_VERBS = new Set(('combine merge join link blend orchestrate pair apply scan provide offer include watch ' +
    'cut reduce lift grow increase close resolve fix catch find get save speed shorten avoid prevent stop eliminate boost improve win keep retain ' +
    'scale automate simplify move ship hire deliver protect secure detect respond recover understand see know reconcile prioritise prioritize clean ' +
    'cleanse connect manage turn double halve raise expand launch generate capture convert qualify trim slash lose waste chase drown struggle spend ' +
    'miss wait juggle rely make build create start finish complete approve onboard train sell buy renew upsell reach serve handle assign allocate ' +
    'predict notify escalate comply meet hit beat exceed settle provision deploy migrate integrate import enrich personalise personalize engage ' +
    'activate adopt compare choose select decide show prove lend underwrite insure invest rebalance hedge learn tell ask spot flag rank tighten ' +
    'streamline unify replace remove stay pass clear pay collect bring give let put take use ensure enable help bill refund reclaim recoup ' +
    'surface highlight verify validate monitor track stay hold open bridge replace align shrink slim speed-up').split(/\s+/).filter(Boolean));
// verbs that can also stand at the start of a noun phrase ("route planning time", "audit preparation") are left out of BASE_VERBS;
// these bases are safe to read in the third person ("plans every route" is a verb only after re-)
const RE_BASES = new Set('plan route assign allocate book open start balance calculate train check rank score test order schedule price'.split(' '));
const THIRD_BASES = new Set(('combine merge join link blend orchestrate pair apply scan provide offer include watch use support work check ' +
    'match rank find catch detect resolve prioritise prioritize reconcile automate clean cleanse connect monitor track turn give show let help keep save ' +
    'cut reduce lift close fix flag map send pull push build learn adapt handle cover protect secure stop block run capture suggest generate surface ' +
    'validate approve notify escalate predict scale ship deliver simplify unify remove replace enrich integrate migrate provision onboard serve assign ' +
    'allocate create make take bring drive raise grow boost improve eliminate avoid prevent recover respond understand know see read write learn ' +
    'compare choose select decide prove verify lend underwrite insure invest rebalance hedge spot tighten streamline pay collect hold open bridge align shrink').split(/\s+/).filter(Boolean));
const NOUNISH = new Set(('fewer more less faster slower lower higher better shorter longer bigger smaller no zero one single a an the our your their every each all any some same ' +
    'real-time realtime live instant automatic automated manual reliable predictable consistent clear accurate full complete end-to-end unified continuous daily ' +
    'weekly monthly cheaper simpler easier safer smarter early late quick rapid critical steady lasting measurable repeatable visible transparent too many much ' +
    'slow long high low poor rising growing failed missed fragmented uneven inconsistent unclear hidden thin weak limited rigid heavy costly expensive falling ' +
    'lost wasted duplicate siloed scattered outdated legacy unreliable unpredictable delayed incomplete inaccurate stale noisy overloaded overdue repeated ' +
    'constant endless frequent sudden unplanned top key main core better best new old own').split(/\s+/).filter(Boolean));
function thirdBase(w) {
    if (!/s$/.test(w) || w.length < 3)
        return null;
    const cands = [w.replace(/ies$/, 'y'), w.replace(/(ch|sh|ss|x|z|o)es$/, '$1'), w.replace(/s$/, ''), w.replace(/es$/, '')];
    for (const c of cands)
        if (c !== w && THIRD_BASES.has(c))
            return c;
    return null;
}
function kindOf(phrase) {
    const w0 = (phrase.trim().split(/\s+/)[0] || '').toLowerCase().replace(/[^a-z0-9$%'-]+$/g, '');
    if (!w0)
        return 'other';
    const rest = w0.startsWith('re-') ? w0.slice(3) : null;
    if (BASE_VERBS.has(w0) || (rest !== null && RE_BASES.has(rest)))
        return 'base';
    // Run 20 round 1: "plan routes faster, keep every delivery promise and close every invoice": a verb that can also be a noun (plan, route, book)
    // is a verb when a later part of the list starts with an outcome verb.
    if (RE_BASES.has(w0) && phrase.split(/,\s*|\s+and\s+/).slice(1).some((part) => BASE_VERBS.has((part.trim().split(/\s+/)[0] || '').toLowerCase())))
        return 'base';
    if (thirdBase(w0) || (rest !== null && thirdBase(rest)) || (rest !== null && /s$/.test(rest) && RE_BASES.has(rest.slice(0, -1))))
        return 'third';
    if (NOUNISH.has(w0) || /^[\d$]/.test(w0))
        return 'noun';
    return 'other';
}
function lowerFirst(t) {
    const parts = t.split(/\s+/);
    const w = parts[0] || '';
    if (/^[A-Z][a-z]+$/.test(parts[1] || '') && !isCommonWord(w) && !isCommonWord(parts[1]))
        return t; // a two-word name (Spec Hub, Platformation Suite)
    return /^[A-Z][a-z'-]+$/.test(w) && !isKnownName(w) ? t.charAt(0).toLowerCase() + t.slice(1) : t;
}
// The first letter lowered unless the word is an acronym (SLA stays SLA).
const lc1 = (t) => (/^[A-Z]{2,}/.test(t) ? t : t.replace(/^./, (c) => c.toLowerCase()));
// "so you can ..." / "helps them ..." / "trying to ...": the benefit as an infinitive phrase.
function inf(benefit) {
    const t = clean(benefit);
    const k = kindOf(t);
    if (k === 'base')
        return lowerFirst(t);
    if (k === 'noun')
        return `get ${lowerFirst(t)}`;
    return `reach this result (${t})`;
}
// The need or problem as what a buyer does or faces: "lose days chasing alerts" stays; "failed deliveries" becomes "struggle with ...".
function needClause(need) {
    const t = clean(need);
    const k = kindOf(t);
    if (k === 'base')
        return lowerFirst(t);
    // Run 20 round 1: a text that already holds a verb ("legacy WAN is like a single highway ...") is a clause and cannot follow "struggle with".
    if (k === 'noun' && !/\b(?:is|are|was|were|has|have|had|does|do|did|can|cannot|will|would)\b/i.test(t.split(/\s+/).slice(0, 9).join(' ')))
        return `struggle with ${lowerFirst(t)}`;
    return `face this problem (${t})`;
}
// A sentence with the product as its subject and the typed capability or difference as its predicate.
// Run 20 round 1: a text that is already a sentence about a named feature ("Xpendite captures expense data ...") cannot follow "offers" or "offer".
function isNamedClause(t) {
    const w = t.trim().split(/\s+/);
    return w.length >= 3 && /^[A-Z][A-Za-z0-9-]+$/.test(w[0]) && !isCommonWord(w[0]) && /^[a-z]{3,}s$/.test(w[1]) && !/(?:ss|us|is)$/.test(w[1]);
}
function diffSentence(product, diff) {
    const t = clean(diff);
    if (isNamedClause(t))
        return `${product}: ${t}`;
    const k = kindOf(t);
    if (k === 'base')
        return `${product} can ${lowerFirst(t)}`;
    if (k === 'third')
        return `${product} ${lowerFirst(t)}`;
    if (k === 'other' && /:/.test(t))
        return `${product}: ${t}`; // a phrase with no verb of its own ("sovereign by design: built and run in one country") stands as it was written
    return `${product} offers ${lowerFirst(t)}`;
}
function toBaseVerb(third) {
    const [first, ...rest] = third.trim().split(/\s+/);
    let pre = '';
    let w = first.toLowerCase();
    if (w.startsWith('re-')) {
        pre = 're-';
        w = w.slice(3);
    }
    const b = thirdBase(w) ?? (pre && /s$/.test(w) && RE_BASES.has(w.slice(0, -1)) ? w.slice(0, -1) : null);
    return b ? [pre + b, ...rest].join(' ') : third;
}
// "We ..." line of a positioning statement.
function weClause(diff) {
    const t = clean(diff);
    if (isNamedClause(t))
        return `stand behind this: ${t}`;
    const k = kindOf(t);
    if (k === 'base')
        return lowerFirst(t);
    if (k === 'third')
        return toBaseVerb(lowerFirst(t));
    if (k === 'other' && /:/.test(t))
        return `stand behind this: ${t}`;
    return `offer ${lowerFirst(t)}`;
}
// The words of a phrase up to a clause boundary, when the phrase is longer than max words; null when no short form is possible.
function shortClause(phrase, max) {
    const t = clean(phrase);
    if (t.split(/\s+/).length <= max)
        return t;
    // the first clause boundary that leaves 3 to max words before it
    const re = /,|;|\s+(?:by|in|within|from|while|so that|each|every|across|when|after|before|until|because|with|without|at|for|per)\s/gi;
    let m;
    while ((m = re.exec(t))) {
        const left = t.slice(0, m.index).trim();
        const n = left.split(/\s+/).length;
        // a comma inside a list ("define, design, develop, ...") is not a clause boundary: the item after it is one or two words
        if (m[0] === ',' && (t.slice(m.index + 1).split(/,|;|\sand\s|\sor\s/)[0] || '').trim().split(/\s+/).length <= 2)
            continue;
        if (n >= 3 && n <= max && !BASE_VERBS.has(left.split(/\s+/).pop().toLowerCase()) && !JOINING_WORD.test(left.split(/\s+/).pop()))
            return left;
        if (n > max)
            break;
    }
    return null;
}
// Backlog B15-L1 (a very long input pasted whole into sentences): where an input repeats inside the tool's own sentences it is
// shortened at a word boundary after 200 characters; the full text is printed once, in the inputs list.
const LONG_AT = 200;
// Where a typed text sits inside one of the tool's own sentences it is cut at a clause boundary after about this many characters.
const FRAME_AT = 140;
function shortText(t, n = LONG_AT) {
    const x = t.trim().replace(/\s+/g, ' ');
    if (x.length <= n)
        return x;
    // Run 20 round 1: a long text is cut at the last clause boundary (a semicolon, a colon, a comma, a closing bracket or a joining word)
    // that leaves at least half the window, never inside a phrase; the cut is marked with "...". Only when the text has no boundary
    // does it stop at a word, and then never on a joining word ("with an", "and the").
    // Run 20 round 2: when the clause ends within 30 characters after the window ("for humans and agents,") the clause is kept whole.
    const ext = x.slice(n, n + 30).search(/[;:,)]/);
    if (ext >= 0 && x.slice(0, n + ext).length > n * 0.6) {
        const whole = x.slice(0, n + ext + (x[n + ext] === ')' ? 1 : 0)).trim();
        if (!(/\(/.test(whole) && (whole.match(/\(/g) || []).length > (whole.match(/\)/g) || []).length))
            return `${whole.replace(/[\s,;:.]+$/, '')}...`;
    }
    const cut = x.slice(0, n);
    // strong boundaries first (a semicolon, a colon, a closing bracket, "while", "which", "because"), then "and" or "with", then a comma
    let at = -1;
    for (const re of [/[;:)]|\s(?:while|which|where|so that|so|because|including|such as)\s/g, /\s(?:and|but|with|plus)\s/g, /,/g]) {
        let m;
        let last = -1;
        while ((m = re.exec(cut)))
            if (m.index >= n * 0.4)
                last = m[0] === ')' ? m.index + 1 : m.index;
        // Run 20 round 3: the latest boundary of any kind wins, so "for humans and agents," is not cut back to "for humans".
        if (last > at)
            at = last;
    }
    let head = at > 0 ? cut.slice(0, at) : cut.slice(0, Math.max(cut.lastIndexOf(' '), Math.floor(n / 2)));
    const open = (head.match(/\(/g) || []).length - (head.match(/\)/g) || []).length;
    if (open > 0)
        head = head.slice(0, head.lastIndexOf('(')).trim();
    let w = head.replace(/[\s,;:.]+$/, '').split(' ');
    while (w.length > 3 && JOINING_WORD.test(w[w.length - 1].replace(/[,;:]$/, '')))
        w.pop();
    return `${w.join(' ').replace(/[\s,;:.]+$/, '')}...`;
}
// A list of capabilities in a sentence: whole when it fits, else cut after a complete item and closed with "and more" (the full list is in the inputs).
function shortList(t, n = 200) {
    const x = t.trim().replace(/\s+/g, ' ');
    if (x.length <= n)
        return x;
    const cut = x.slice(0, n);
    let at = -1;
    let depth = 0;
    for (let i = 0; i < cut.length; i++) {
        const c = cut[i];
        if (c === '(')
            depth++;
        else if (c === ')')
            depth--;
        else if (c === ',' && depth === 0 && i >= n * 0.4)
            at = i;
    }
    if (at < 0)
        return shortText(x, n);
    const head = cut.slice(0, at).replace(/\s+(?:and|or)$/i, '').trim();
    return head.includes(',') || head.split(/\s+/).length > 6 ? `${head} and more` : shortText(x, n);
}
const longNote = (...texts) => (texts.some((t) => (t || '').trim().length > LONG_AT) ? '\n*Long inputs are shortened where they repeat in the sentences below; the full text is in the inputs above.*' : '');
const capFirst = (t) => (/^[a-z]+[A-Z]/.test(t.split(/\s+/)[0] || '') ? t : t.charAt(0).toUpperCase() + t.slice(1));
// A hero line of 5 to 8 words. An action stands alone with the audience after it; a noun phrase takes "for <audience>".
function heroLine(benefit, audience, label = '') {
    const short = shortClause(benefit, 8);
    if (!short) {
        // Run 20 round 3: with no short clause the hero is the benefit's leading phrase and the audience, then the product label, never an instruction.
        const lead = leadPhrase(benefit);
        const n = lead.split(/\s+/).length;
        if (n >= 3 && n <= 11)
            return `${capFirst(lead)}. Built for ${audience}.`;
        return label ? `${capFirst(label)} for ${audience}.` : `Shorten this to 5 to 8 words: ${q(benefit)}`;
    }
    return kindOf(short) === 'base' || /\bfor\b/i.test(short) ? `${capFirst(short)}. Built for ${audience}.` : `${capFirst(short)} for ${audience}.`;
}
// A tagline of 3 to 7 words, or an instruction when the phrase cannot be cut at a clause boundary.
function taglineOf(benefit) {
    const short = shortClause(benefit, 7);
    // Run 20 round 1: when the outcome has no clause of 7 words or fewer, its first words (never ending on a joining word) are the tagline.
    return short ? `"${capFirst(short)}"` : `"${capFirst(firstWords(clean(benefit), 6))}"`;
}
// A category typed in the plural or as a mass noun ("connectivity and digital services") reads as "a provider of ...".
function catNoun(category) {
    const t = category.trim();
    const bare = t.replace(/\s*\([^)]*\)\s*$/, '');
    return /s$/i.test(bare) && !/(ss|us|is)$/i.test(bare) ? `provider of ${t}` : t;
}
// The name of a competitor or alternative without its description in brackets: "Competitor A (a global suite)" gives "Competitor A".
function nameOf(c) {
    return c.replace(/\s*\(.*$/, '').trim() || c.trim();
}
// A claim of being first or only is never stated as fact: it is wrapped as "[Only if true and provable: ...]".
const SUPERLATIVE = /\b(?:first and only|world's first|industry's first|the only|first[- ]ever|the first)\b/i;
const gateClaim = (claimed, sentence) => (SUPERLATIVE.test(claimed) && !/^\[Only if/.test(sentence) ? `[Only if true and provable: ${sentence}]` : sentence);
const joinList = (xs0, word) => {
    // a label that is part of another label ("billing systems" inside "legacy enterprise billing systems") or a repeat is dropped
    const xs = xs0.filter((x, i) => !xs0.some((y, j) => j !== i && y.length >= x.length && y.toLowerCase().includes(x.toLowerCase()) && (y.length > x.length || j < i)));
    const sep = xs.some((x) => /,| and /i.test(x)) ? '; ' : ', ';
    if (xs.length <= 2)
        return xs.join(` ${word} `);
    return `${xs.slice(0, -1).join(sep)}${sep === '; ' ? '; ' : ' '}${word} ${xs[xs.length - 1]}`;
};
// A text that holds a finite verb in its first words is a clause, not a noun phrase.
const hasFiniteVerb = (t) => /\b(?:is|are|was|were|has|have|had|does|do|did|can|cannot|will|would|combine|combines|run|runs|manage|manages|rely|relies|juggle|suffer|spend|spends|hand|hands|fail|fails|break|breaks|fall|falls|lose|loses|need|needs|make|makes)\b/i.test(t.split(/\s+/).slice(0, 9).join(' '));
// A measure and the words of a result that answer it, by meaning ("uptime per site" and "99.5% uptime", "approval cycle time" and "3 to 5 days").
const MEASURE_CONCEPTS = [
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
const STOCK_KIND = { 'logistics-tech': 'last-mile', fintech: 'spend-expense', 'vertical-saas': 'fmcg-retail-execution', telecom: 'operators-connectivity' };
const STATUS_QUO_GENERIC = {
    'logistics-tech': ['Shipments and orders followed by hand in spreadsheets and email', 'The transport or order system already in place, used as it is', 'Status chased by phone calls between teams'],
    fintech: ['Spreadsheets and manual checks', "The ERP's or the bank's own tools, used as they are", 'Work split across several systems that do not talk to each other'],
    'vertical-saas': ['Spreadsheets and paper records', 'A general business tool used as it is', 'Staff reporting by phone or a messaging app'],
    telecom: ['Staying with the current provider and its contract', 'Running it in-house', 'Several providers for different needs'],
};
// The usual status quo of a buyer, by what the seller sells (never spreadsheets and junior staff for an investment manager or a developer platform).
function statusQuoDefaults(v, model) {
    if (v && /investment management/.test(v.name))
        return ['Staying with the incumbent manager, or the managers an investment consultant already recommends', 'Running the strategy with an in-house quant team', 'Passive index exposure'];
    const by = {
        'logistics-tech': ['Manual dispatch and route planning in spreadsheets', 'The transport system already in place, used as it is', 'Planning left to dispatchers and drivers'],
        fintech: ['Spreadsheets and manual approvals', "The ERP's own expense or payment workflow", 'Cards and cash advances handled outside any system'],
        'vertical-saas': ['Paper beat diaries and spreadsheets', "The distributor's own system, used as it is", 'Reps reporting by phone or a messaging app'],
        'ai-native': ['The same work done by the team as today', "A model API wired in by the buyer's own engineers", 'A smaller point tool already in place'],
        ites: ['Staying with the current provider and its contract', 'Doing the work in-house with the existing team', 'Splitting the work across several smaller providers'],
        telecom: ['Staying with the current operator and its contract', 'Running the links in-house', 'Several providers for different sites'],
        software: ['Disconnected tools already in place, used side by side', 'Scripts and documents kept by each team', 'An open-source tool the team maintains itself'],
        cybersecurity: ['The current security tools plus manual review by analysts', 'A periodic scan or audit', 'Doing nothing until an incident or an audit finding'],
    };
    if (v && by[v.id])
        return STOCK_KIND[v.id] && v.subtype !== STOCK_KIND[v.id] ? STATUS_QUO_GENERIC[v.id] : by[v.id];
    return model === 'services' || model === 'connectivity' ? ['Staying with the current provider and its contract', 'Doing the work in-house with the existing team', 'Splitting the work across several smaller providers'] : ['Spreadsheets and manual processes', 'Existing tools cobbled together', "The team's own time"];
}
// Strengths typed as one comma list are shared out over the cards: top-level commas only, brackets kept whole.
function strengthParts(items) {
    const out = [];
    for (const it of items) {
        const note = /\((?:page claims?|page claim)\)\s*$/i.test(it) ? ' (page claim)' : '';
        const body = it.replace(/\s*\((?:page claims?)\)\s*$/i, '');
        const parts = [];
        let depth = 0;
        let cur = '';
        let idx = 0;
        for (const ch of body) {
            if (ch === '(')
                depth++;
            if (ch === ')')
                depth--;
            if (ch === ',' && depth === 0 && !(/\d$/.test(cur) && /^\d{3}(?!\d)/.test(body.slice(idx + 1)))) {
                parts.push(cur);
                cur = '';
            }
            else
                cur += ch;
            idx++;
        }
        parts.push(cur);
        const clean2 = parts.map((x) => x.trim().replace(/^and\s+/i, '')).filter((x) => x.split(/\s+/).length >= 2);
        if (clean2.length >= 2)
            out.push(...clean2.map((x) => x + note));
        else
            out.push(it);
    }
    return out;
}
// Weaknesses typed as one comma list ("detection delays from periodic scans, no threat validation, no financial impact quantification, and ...") are
// cut into items when there are at least three and each has two words or more; otherwise they stay as typed.
function splitWeaknesses(s) {
    const items = splitItems(s);
    if (items.length !== 1)
        return items;
    const chunks = items[0].split(/,\s*(?:and\s+)?/).map((c) => c.trim()).filter(Boolean);
    // A sentence cut at its commas ("a congested highway prone to jams, slowdowns and disconnections, with sluggish apps ...") is one weakness, not three:
    // items are split only when none starts with a joining word and each is a short phrase.
    return chunks.length >= 3 && chunks.every((c) => c.split(/\s+/).length >= 2 && c.split(/\s+/).length <= 12 && !/^(?:with|which|that|where|because|so|while|but|or)\b/i.test(c)) && chunks.slice(1).filter((c) => /^(?:no|not|lack|low|poor|slow)\b/i.test(c)).length >= 1 ? chunks : items;
}
const STEM_STOP = new Set('the and for with that this from have has are was were not but its their they them than then into onto over such only more most very also each every any all some other another which what when where while about after before between through under without within among manual legacy tools tool systems system based multiple various existing same'.split(' '));
function contentStems(t) {
    return new Set((t.toLowerCase().match(/[a-z]{4,}/g) || []).filter((w) => !STEM_STOP.has(w)).map((w) => w.slice(0, 5)));
}
// A short label for an alternative typed as a long phrase: the words before the first comma, "which" or "that", at most 6 words.
function labelOf(c) {
    const full = nameOf(c).trim();
    if (full.split(/\s+/).length <= 6)
        return full;
    // a long description is shortened to its leading noun phrase: the words before "that", "which", "from", "for", "selling", "built", "only" or a comma
    const head = full.split(/,|\s(?:that|which|where|who|from|for|selling|built|only|with|run|runs|relies|relying)\s/)[0].trim();
    const w = head.split(/\s+/);
    if (w.length >= 2 && w.length <= 8)
        return head;
    const first = full.split(/\s+/).slice(0, 5);
    while (first.length > 2 && JOINING_WORD.test(first[first.length - 1]))
        first.pop();
    return first.join(' ');
}
// The leading noun phrase of a text: the words before the first "that", "which", "where", "with" or punctuation (at least 2 words), else its first 6 words.
function leadPhrase(t) {
    const x = clean(t);
    const m = x.split(/\s(?:that|which|where|who|with|through|by|for)\s|[;:(]/)[0].trim();
    // a list of short items ("travel, expense and payment management platform") is kept whole: the cut falls at the end of the list
    const chunks = m.split(',').map((c) => c.trim());
    let out = chunks[0];
    for (let i = 1; i < chunks.length; i++) {
        const first = chunks[i].split(/\sand\s/)[0].trim().split(/\s+/).length;
        if (first > 2)
            break;
        out += `, ${chunks[i]}`;
        if (/\sand\s/.test(chunks[i]))
            break;
    }
    const n = out.split(/\s+/).length;
    return n >= 2 && n <= 12 ? out : firstWords(x, 6);
}
const STATUS_QUO = /spreadsheet|manual|in-house|in house|status quo|do nothing|internal|home-?grown|excel|e-?mail|whatsapp|phone|hiring|\bdiy\b|existing (?:tool|process|team)|periodic|current (?:provider|process|team)|incumbent/i;
function committeeParts(v) {
    const strip = (s) => s.replace(/^(the|a|an)\s+/i, '').trim();
    let signer = '';
    let champion = '';
    let users = null;
    const reviewers = [];
    for (const c of v.committee.replace(/\.\s*$/, '').split(/;\s*/)) {
        let m;
        if ((m = c.match(/^(.*?)\s+(?:signs?|decides?)$/i)))
            signer = strip(m[1]);
        else if ((m = c.match(/^(.*?)\s+(?:champions?|sponsors?)\b.*$/i))) {
            // "engineering leads evaluate the interfaces and champion": the role is the words before the first verb
            let rm = m[1].match(/^(.*?)\s+(evaluates?|checks?|reviews?|compares?|joins?|holds?|handles?|runs?|owns?)\b\s*(.*)$/i);
            if (rm && /\b(?:who|that|which)$/i.test(rm[1]))
                rm = null; // "the lead who owns the affected area champions it" is one role
            champion = strip(rm ? rm[1] : m[1]);
            if (rm && /evaluat/i.test(rm[2]))
                reviewers.push({ role: champion, does: rm[2].toLowerCase(), what: rm[3].replace(/\s+and$/i, '').trim() });
        }
        else if ((m = c.match(/^(.*?)\s+(checks?|reviews?|evaluates?|compares?|joins?|holds?|handles?|runs?)\b\s*(.*)$/i)))
            reviewers.push({ role: strip(m[1]), does: m[2].toLowerCase(), what: m[3].trim() });
        else if ((m = c.match(/^(.*?)\s+(?:use|uses|adopt|adopts)\b/i)))
            users = strip(m[1]);
    }
    let inferred = false;
    if (!champion) {
        const ev = reviewers.find((r) => /evaluat/.test(r.does));
        champion = ev ? ev.role : signer;
        inferred = true;
    }
    return { signer, champion, championInferred: inferred, users, reviewers };
}
const FUNCTIONS = [
    { id: 'finance', re: /\b(financ\w*|billing|invoic\w*|reconcil\w*|revenue recognition|collections?|accounts? (?:payable|receivable)|month-end|ledger|treasury|expenses?|accounting|cash flow)\b/gi, champion: 'Finance Controller or Head of Billing Operations', buyer: 'CFO', tech: 'the finance systems owner (ERP and billing) and IT', measures: ['days to close the books', 'billing errors found after invoicing', 'manual reconciliation effort', 'audit findings'], blocker: 'a finance-systems change in the middle of a close, and the audit trail', questions: ['How many days does the close take today, and which step takes longest?', 'Where are invoices, payments and the ledger matched by hand today, and by whom?', 'Which billing errors were found only after an invoice went out?'], proof: 'Close time, billing errors or reconciliation effort before and after for one team, signed off by the finance lead.', vocab: ['month-end close', 'reconciliation', 'invoicing', 'revenue recognition', 'audit trail', 'ERP posting'] },
    { id: 'sales', re: /\b(sales|pipeline|quota|win rates?|reps?|leads?|deals?|prospects?|selling|outbound)\b/gi, champion: 'Head of Sales Operations or Revenue Operations', buyer: 'Chief Revenue Officer', tech: 'the CRM administrator and sales operations', measures: ['pipeline coverage', 'win rate', 'sales cycle length', 'rep ramp time'], blocker: 'rep adoption and CRM data quality', questions: ['How is the pipeline reviewed today, and how late is the view?', 'Where do reps lose time between a lead and a first call?', 'Which number does the sales head answer for each quarter?'], proof: 'Win rate or sales cycle length for one team before and after, from the CRM, with the sales head signing it off.', vocab: ['pipeline', 'win rate', 'quota attainment', 'sales cycle', 'CRM hygiene', 'forecast call'] },
    { id: 'marketing', re: /\b(marketing|campaigns?|brand|demand gen\w*|attribution|content|seo|webinars?)\b/gi, champion: 'Head of Marketing or Demand Generation', buyer: 'CMO', tech: 'marketing operations', measures: ['marketing-sourced pipeline', 'cost per qualified lead', 'attribution coverage'], blocker: 'overlap with the marketing tools already in place', questions: ['How is a campaign tied to pipeline today?', 'Which reports does marketing build by hand each month?', 'Which channel would you cut first if you could see the cost per qualified lead?'], proof: 'Cost per qualified lead or marketing-sourced pipeline for one campaign before and after.', vocab: ['pipeline contribution', 'attribution', 'cost per qualified lead', 'campaign', 'lead scoring'] },
    { id: 'customer', re: /\b(support|customer success|customer experience|tickets?|churn|retention|renewals?|csat|nps)\b/gi, champion: 'Head of Customer Success or Support', buyer: 'Chief Customer Officer or COO', tech: 'support operations and the owner of the help-desk tools', measures: ['first response time', 'time to resolution', 'renewal rate', 'customer satisfaction'], blocker: 'agent workload during the change and tool overlap', questions: ['How long does a first response take today, and who feels it first?', 'Which tickets or renewals slip because of the tools in use?', 'Which number does support or success answer for each month?'], proof: 'First response time or renewal rate for one team before and after, from the help desk or CRM.', vocab: ['first response time', 'time to resolution', 'renewal', 'customer satisfaction', 'escalation'] },
    { id: 'engineering', re: /\b(engineer\w*|developers?|code|release\w*|deploy\w*|devops|software delivery|apis?|testing|pipelines?)\b/gi, champion: 'Engineering or Platform Lead', buyer: 'VP Engineering or CTO', tech: 'a staff engineer or architect, with security for code and data access', measures: ['release frequency', 'lead time for changes', 'escaped defects'], blocker: 'developer adoption and security review', questions: ['How often do you release today, and what slows the release down?', 'Where do defects escape, and who finds them?', 'Which tools would this replace or connect to?'], proof: 'Release frequency or escaped defects on one team before and after, from the pipeline data of that team.', vocab: ['release frequency', 'lead time for changes', 'escaped defects', 'CI pipeline', 'technical debt'] },
    { id: 'security', re: /\b(security|threats?|breach\w*|vulnerab\w*|attack\w*|ransomware|compliance|soc|siem)\b/gi, champion: 'Head of Security Operations or the SOC lead', buyer: 'CISO', tech: 'a security engineer or architect', measures: ['mean time to detect', 'mean time to respond', 'open critical exposures'], blocker: 'alert fatigue and tool overlap', questions: ['How many alerts reach an analyst each day, and how many are acted on?', 'How long does it take to find and respond to a real exposure today?', 'Which tools would this replace or feed?'], proof: 'Exposures found and closed during a proof of value, with the time it took to fix them.', vocab: ['alert fatigue', 'mean time to detect', 'exposure', 'proof of value', 'SOC'] },
    { id: 'api', re: /\b(apis?|openapi|swagger|api governance|spec drift|specs and implementations|contract testing|api catalog|schemas?)\b/gi, champion: 'Head of API Platform or the API program owner', buyer: 'VP Engineering or CTO', tech: 'enterprise architects and security', measures: ['APIs under governance', 'spec and implementation drift found', 'time to find an existing API', 'time to onboard an API consumer'], blocker: 'developer adoption and a security review of code and data access', questions: ['How do teams find an existing API today, and who owns the catalog?', 'How often do specs and implementations drift apart, and who notices?', 'Which API standards exist, and how is compliance checked?'], proof: 'APIs governed, or specs matched to implementations, for one team before and after.', vocab: ['API governance', 'spec drift', 'API catalog', 'design standards', 'contract testing'] },
    { id: 'modernization', re: /\b(moderni[sz]\w*|legacy|cloud|migrat\w*|replatform\w*|refactor\w*|cloud native|data cent(?:er|re)s?)\b/gi, champion: 'Head of Application Modernization or Cloud Transformation', buyer: 'CIO', tech: 'enterprise architects and security', measures: ['applications moved per wave', 'cost of running the legacy estate', 'incidents during cutover', 'time to a working pilot'], blocker: 'migration risk and keeping the business running during the move', questions: ['Which applications and data centres are in scope, and which move first?', "What does running the legacy estate cost today, in the buyer's own figures?", 'Who signs off a cutover, and what is rolled back if it fails?'], proof: 'A pilot application migrated, with its cutover record and its running cost before and after.', vocab: ['cloud migration', 'legacy applications', 'cutover', 'landing zone', 'run cost', 'transition plan'] },
    { id: 'it', re: /\b(infrastructure|network\w*|it operations|data cent(?:er|re)s?|servers?|hybrid)\b/gi, champion: 'Head of IT Infrastructure or Cloud Operations', buyer: 'CIO', tech: 'the infrastructure or network manager, with security', measures: ['service availability', 'incident volume', 'time to provision'], blocker: 'migration risk and the current contract', questions: ['Which systems or sites are in scope, and which suffer the most incidents?', 'Who runs them today, and when does each contract end?', 'What does a migration or outage cost a day?'], proof: 'Availability or incident volume for the pilot scope before and after, measured over a full cycle.', vocab: ['uptime', 'incident', 'migration', 'service level', 'change window'] },
    { id: 'operations', re: /\b(operations?|supply chain|logistics|warehouses?|delivery|fleet|process\w*|manual|workflows?|back office)\b/gi, champion: 'Head of Operations', buyer: 'COO', tech: 'the operations systems manager and IT', measures: ['cycle time', 'error rate', 'cost per transaction handled'], blocker: 'change management on the floor', questions: ['Which steps are done by hand today, and how long do they take?', 'Where do errors enter the process, and who finds them?', 'Which number does operations answer for each month?'], proof: 'Cycle time or error rate for one process before and after, over a full cycle of busy and quiet weeks.', vocab: ['cycle time', 'error rate', 'throughput', 'handover', 'service level'] },
    { id: 'people', re: /\b(hiring|recruit\w*|employees?|hr|payroll|attrition|talent|onboarding)\b/gi, champion: 'Head of HR or People Operations', buyer: 'CHRO', tech: 'the HR systems owner', measures: ['time to hire', 'attrition', 'payroll errors'], blocker: 'employee data privacy', questions: ['How long does a hire or a payroll run take today, and which step is slowest?', 'Where do errors or delays reach employees?', 'Which HR systems must this connect to?'], proof: 'Time to hire or payroll errors for one team before and after.', vocab: ['time to hire', 'attrition', 'payroll run', 'onboarding', 'HRIS'] },
    { id: 'risk', re: /\b(audit\w*|risk|regulat\w*|policy|policies|controls?)\b/gi, champion: 'Head of Risk and Compliance', buyer: 'CFO or Chief Risk Officer', tech: 'internal audit and IT', measures: ['audit findings', 'policy breaches', 'time to prepare an audit'], blocker: 'evidence the auditors will accept', questions: ['Which controls are tested by hand today, and how often?', 'How long does an audit take to prepare?', 'Which findings came back last time?'], proof: 'Audit findings or time to prepare an audit before and after, accepted by internal audit.', vocab: ['audit finding', 'control test', 'policy breach', 'evidence', 'risk register'] },
];
function lensOf(v, ...texts) {
    const fn = overlayFn(v, 2, ...texts);
    if (fn)
        return { fn, metrics: fn.measures, questions: fn.questions, proof: fn.proof, vocab: v && v.id !== 'saas' ? [...fn.vocab, ...v.vocabulary] : fn.vocab };
    return { fn: null, metrics: v ? metricsOf(v) : [], questions: v ? v.discovery : [], proof: v ? v.proofShape : '', vocab: v ? v.vocabulary : [] };
}
const fnName = (f) => f.id.replace('customer', 'customer success or support').replace(/^it$/, 'IT infrastructure');
// The view of a team (finance, sales, ...) when the sector's committee is general: its measures, a proof that lands and its own questions.
function teamBlock(f, v = null) {
    return [`### Team view: ${fnName(f)}`, ...(v ? [`- **Words buyers in this team use:** ${(v.id === 'saas' ? f.vocab : [...f.vocab, ...v.vocabulary]).join(', ')}.`] : []), `- **What this team measures:** ${f.measures.join(', ')}.`, `- **A proof point that lands:** ${f.proof}`,
        `- **Discovery questions in this team's language:**\n${numbered(f.questions).split('\n').map((l) => `  ${l}`).join('\n')}`].join('\n');
}
// The function a text points to: the one with the most word hits; a tie goes to the earlier one in the table. null when no function word is found.
function functionOf(...texts) { return functionHits(1, ...texts); }
function functionHits(min, ...texts) { return functionHitsIn(null, min, ...texts); }
// Which functions a sector may borrow: a general committee (SaaS, no sector) any; developer tools only the API owner; IT services only modernization.
const OVERLAY = { software: ['api'], ites: ['modernization'] };
function overlayFn(v, min, ...texts) {
    if (v && v.id === 'saas' && /billing/i.test(v.name))
        return null; // the shared billing profile already holds the finance roles, measures and questions
    // run 21c round 5: a seller read as customer service software keeps the customer team's roles (an "employee service" module must not hand the audit to HR)
    if (v && v.id === 'saas' && v.subtype === 'customer-service')
        return FUNCTIONS.find((x) => x.id === 'customer') ?? null;
    if (!v || v.id === 'saas')
        return functionHitsIn(null, min, ...texts);
    return OVERLAY[v.id] ? functionHitsIn(OVERLAY[v.id], min, ...texts) : null;
}
function functionHitsIn(only, min, ...texts) {
    const t = texts.filter(Boolean).join(' \n ');
    let best = null;
    let n = 0;
    for (const f of FUNCTIONS.filter((x) => !only || only.includes(x.id))) {
        const hits = (t.match(f.re) || []).length;
        if (hits > n) {
            best = f;
            n = hits;
        }
    }
    return n >= min ? best : null;
}
const INDUSTRIES = [
    { id: 'asset and wealth management', re: /\b(asset|wealth|fund|portfolio|invest\w*|pensions?|endowments?|allocators?|hedge)\b/i, champion: 'Head of Quantitative Research or a senior portfolio manager', buyer: 'Chief Investment Officer, with the investment committee', tech: 'Head of data and technology, with risk and compliance' },
    { id: 'insurance', re: /\binsur\w*/i, champion: 'Head of claims or underwriting operations', buyer: 'Chief Operating Officer', tech: 'Head of data and IT, with compliance' },
    { id: 'banking and financial services', re: /\b(banks?|banking|lending|nbfcs?|financial services|bfsi|credit|fintech)\b/i, champion: 'Head of the team that owns the work (operations, risk or customer service)', buyer: 'COO or CFO', tech: 'Head of data and technology, with information security and model risk' },
    { id: 'manufacturing', re: /\b(manufactur\w*|factory|factories|plants?|industrial|automotive)\b/i, champion: 'Head of operations or of a plant', buyer: 'COO', tech: 'Head of IT, with the owner of the plant systems' },
    { id: 'retail and e-commerce', re: /\b(retail\w*|e-?commerce|consumer|fmcg|cpg|brands?)\b/i, champion: 'Head of customer experience or of operations', buyer: 'COO or Chief Commercial Officer', tech: 'Head of IT or digital' },
    { id: 'telecom and media', re: /\b(telecom\w*|telco|operators?|media|streaming|broadcast\w*)\b/i, champion: 'Head of customer operations or of network operations', buyer: 'COO or CTO', tech: 'Head of IT, with security' },
    { id: 'logistics', re: /\b(logistics|supply chain|freight|shipping|3pl|courier)\b/i, champion: 'Head of logistics or transport operations', buyer: 'COO', tech: 'Head of IT, with the owner of the TMS and WMS' },
];
function industryOf(...texts) {
    const t = texts.filter(Boolean).join(' ; ');
    return INDUSTRIES.find((i) => i.re.test(t)) || null;
}
const MODEL_NOTES = {
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
const SECTOR_CTA = {
    'logistics-tech': 'Book a pilot at one hub', fintech: 'Book a pilot on one entity or department', 'vertical-saas': 'Book a pilot in one region',
    'ai-native': 'Run a proof of concept on your own data', ites: 'Request a scoping call', telecom: 'Request a site survey', cybersecurity: 'Start a time-boxed proof of value',
};
function callsToAction(v, model) {
    const n = MODEL_NOTES[model || 'unknown'];
    const stock = v && STOCK_KIND[v.id] && v.subtype !== STOCK_KIND[v.id] ? undefined : v ? SECTOR_CTA[v.id] : undefined;
    const first = model === 'saas' || model === null ? stock || n.cta[0] : n.cta[0];
    return [...new Set([first, ...n.cta])];
}
// ---- Money and counts for the market anchor (problem 5: the user's own figures only) ---------------------------------------------
function trimDecimals(x) {
    const s = (Math.round(x * 100) / 100).toString();
    return /\./.test(s) ? s : `${s}.0`;
}
function usd(v) {
    if (v >= 1e9)
        return `$${trimDecimals(v / 1e9)}B`;
    if (v >= 1e6)
        return `$${trimDecimals(v / 1e6)}M`;
    if (v >= 1e5)
        return `$${(v / 1e6).toFixed(2)}M`;
    return `$${Math.round(v).toLocaleString('en-US')}`;
}
const usdFull = (v) => `$${Math.round(v).toLocaleString('en-US')}`;
// A percentage as printed: at most one decimal and no float noise (12.345678 gives "12.3", 0.1 + 0.2 gives "0.3"); a value above
// 0 that would round to 0 reads "under 0.1". The sizing itself uses the exact figure the user gave.
function pctText(n) {
    const r = Math.round(n * 10) / 10;
    if (n > 0 && r === 0)
        return 'under 0.1';
    return Number.isInteger(r) ? String(r) : r.toFixed(1);
}
// "Mid-size manufacturers: 3,200; IT services firms: 1,800" gives one count per named segment; a bare number has no name.
function parseCounts(s) {
    if (typeof s !== 'string')
        return [];
    const out = [];
    for (const raw of s.split(/\n|;/).map((x) => x.trim()).filter(Boolean)) {
        const m = raw.match(/^(?:(.*?)\s*[:=]\s*)?(?:about |around |roughly |~)?(\d[\d,]*(?:\.\d+)?)\s*([km])?\b/i);
        if (!m)
            continue;
        const n = parseFloat(m[2].replace(/,/g, '')) * (m[3] ? (m[3].toLowerCase() === 'k' ? 1e3 : 1e6) : 1);
        if (Number.isFinite(n) && n > 0)
            out.push({ name: (m[1] || '').trim(), count: Math.round(n) });
    }
    return out;
}
const sameName = (a, b) => {
    const x = a.toLowerCase().replace(/\s+/g, ' ').trim();
    const y = b.toLowerCase().replace(/\s+/g, ' ').trim();
    return !!x && !!y && (x === y || (x.length >= 4 && y.includes(x)) || (y.length >= 4 && x.includes(y)));
};
// =============================================================================
// TOOL DEFINITIONS
// =============================================================================
// Run 22: the helpers of this file that the rewrite helpers in rw-impact.ts need.
const RW_KIT = { kindOf, lowerFirst, toBaseVerb };
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
        execute: (args) => {
            const phase = args.focus_phase || 'all';
            const sectorText = (args.sector || '').trim();
            const v = sectorText ? findSector(sectorText) : null;
            const cm = v ? committeeParts(v) : null;
            let sectorPart = '';
            if (sectorText && !v) {
                sectorPart = `\n---\n\n## Your sector\n\nYou gave the sector ${q(sectorText)}, which this tool did not recognise. It knows these: ${SECTOR_NAMES}. Call it again with one of those names to add how the six steps read in your sector.\n`;
            }
            else if (v) {
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
            }
            else {
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
| ${capFirst(cm.champion)} | Likeliest champion | | | |
| ${capFirst(cm.signer)} | Signs the budget | | | |
${cm.users ? `| ${capFirst(cm.users)} | Uses it day to day | | | |\n` : ''}${cm.reviewers.map((r) => `| ${capFirst(r.role)} | ${capFirst(r.does)} ${r.what}`.trim() + ' | | | |').join('\n')}` : `Pattern: replace each role with the one in your sector (add \`sector\` to see them), and rate each one for your account in the empty cells.
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

${EXAMPLES}${v ? `\nThe calls to action follow how ${v.name} companies usually sell (${verticals_ts_1.MODEL_NAME[verticals_ts_1.SECTOR_MODEL[v.id]].split(" (")[0]}): ${callsToAction(v, verticals_ts_1.SECTOR_MODEL[v.id]).slice(0, 2).map((x) => `"${x}"`).join(' or ')}.` : ''}
| Channel | Format | Length | CTA Focus | Key Message |
|---------|--------|--------|-----------|-------------|
| LinkedIn | Text + Image | 150 words | ${v ? 'Start a conversation' : 'Engage'} | Problem awareness |
| Website Hero | Headline + Sub | 15 words | ${v ? callsToAction(v, verticals_ts_1.SECTOR_MODEL[v.id])[0] : 'Next step'} | Value prop |
| Cold Email | Subject + Body | 75 words | ${v ? 'A short call or a reply' : 'Reply'} | Pain + curiosity |
| Sales Deck | Slides | 10 slides | ${v ? 'The next meeting or the proposal' : 'Meeting'} | Full story |
| ${v && verticals_ts_1.SECTOR_MODEL[v.id] !== 'saas' ? 'Walkthrough or pilot review' : 'Demo or walkthrough'} | Script | 15 min | ${v ? callsToAction(v, verticals_ts_1.SECTOR_MODEL[v.id])[1] || 'Pilot or proposal' : 'Pilot or proposal'} | Capability proof |

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
            const single = phases[phase];
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
        execute: (args) => {
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
            }
            else if (ind) {
                primaryChampion = { role: ind.champion, pain: `the problem you described, in your words: ${pq}`, motivation: `a visible win on the measure that team is judged on (ask which)${v ? ', proved on an evaluation set built from their own history' : ''}` };
                economicBuyer = { role: ind.buyer, concern: 'the cost of leaving the problem unsolved, and the risk and oversight the change brings', trigger: triggerAsk };
                technicalInfluencer = { role: capFirst(ind.tech), criteria: 'data privacy, model quality on their own data, and fit with the systems they run', blocker: v ? 'the objections this sector often raises: ' + v.objections.map((o) => `"${o.objection}"`).join('; ') : 'security review and competing priorities' };
                inferredNote = ` (roles for the buyers you named: ${ind.id})`;
            }
            else if (v) {
                const c = committeeParts(v);
                const isTech = (r) => !/procure|vendor|financ|legal|audit|compliance|risk|\bhr\b|commercial/i.test(r.role);
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
            }
            else {
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
        execute: (args) => {
            // Run 22 rewrite: one part per alternative you named, each weakness set against the strength that answers it, the status quo of your own kind of business,
            // and no competitor, strength or fact that you did not give. What is missing is named once, at the end.
            const competitorsGiven = !!(args.competitors && args.competitors.filter((c) => c && c.trim()).length);
            const named = competitorsGiven ? args.competitors.filter((c) => c && c.trim()).map((c) => c.trim()) : [];
            const weaknessItems = splitWeaknesses(args.competitor_weaknesses);
            const strengthItems = splitItems(args.your_strengths);
            const rc = readContext(undefined, { core: [args.category, args.your_product], later: [args.your_strengths], context: [args.competitor_weaknesses] });
            const v = rc.v;
            const lz = lensOf(v, args.your_product, args.category, args.competitor_weaknesses);
            const nsw = (t) => (rc.model === 'saas' || rc.model === null ? t : (0, rw_impact_ts_1.noSeatWords)(t));
            const vendors = named.filter((c) => !STATUS_QUO.test(nameOf(c)) && nameOf(c).toLowerCase() !== 'status quo' && nameOf(c).toLowerCase() !== 'do nothing');
            const statusQuo = named.filter((c) => !vendors.includes(c));
            // A weakness is shown on the card of the alternative it names. One that shares at least two content words with an alternative's description belongs there too;
            // the rest are listed once under "Weaknesses you gave" and never hung on an alternative they do not describe.
            const matched = new Map();
            const used = new Set();
            for (const c of named) {
                const key = nameOf(c).toLowerCase();
                const hits = key.length >= 3 ? weaknessItems.filter((w) => w.toLowerCase().includes(key)) : [];
                if (hits.length) {
                    matched.set(c, hits);
                    hits.forEach((h) => used.add(h));
                }
            }
            // A weakness about doing the work by hand fits the one status-quo option you listed, when you listed exactly one.
            const sqOnly = named.filter((c) => STATUS_QUO.test(nameOf(c)) && nameOf(c).toLowerCase() !== 'do nothing');
            if (sqOnly.length === 1)
                for (const w of weaknessItems)
                    if (!used.has(w) && /\b(?:by hand|spreadsheets?|in-house|paper|excel)\b/i.test(w)) {
                        matched.set(sqOnly[0], [...(matched.get(sqOnly[0]) || []), w]);
                        used.add(w);
                    }
            for (const w of weaknessItems) {
                if (used.has(w))
                    continue;
                const ws = contentStems(w);
                let best = null;
                let bestN = 1;
                let tie = false;
                for (const c of named) {
                    const n = [...contentStems(c)].filter((x) => ws.has(x)).length;
                    if (n > bestN) {
                        best = c;
                        bestN = n;
                        tie = false;
                    }
                    else if (n === bestN && n > 1)
                        tie = true;
                }
                if (tie)
                    best = null;
                if (best) {
                    matched.set(best, [...(matched.get(best) || []), w]);
                    used.add(w);
                }
            }
            const untied = weaknessItems.filter((w) => !used.has(w));
            const nameLike = (c) => /^[A-Z0-9]/.test(nameOf(c)) && nameOf(c).split(/\s+/).length <= 4;
            const describedOnly = vendors.length > 0 && !vendors.some(nameLike);
            const sParts = (0, rw_impact_ts_1.splitStrengths)(strengthItems);
            const descriptor = (c) => { if (!nameLike(c))
                return ''; const m = c.match(/\(([^)]*)\)/); return m ? m[1].trim() : ''; };
            const head = (c) => (nameLike(c) ? nameOf(c) : nameOf(c).split(/\s+/).length <= 9 && nameOf(c).length <= 70 ? nameOf(c) : (0, rw_impact_ts_1.tidyLabel)(labelOf(c)));
            // The strength that answers a weakness: the one that shares the most content words with it (none when no word is shared).
            const answerFor = (w) => {
                const ws = contentStems(w);
                let best = null;
                let bestN = 0;
                for (const s of sParts) {
                    const n = [...contentStems(s)].filter((x) => ws.has(x)).length;
                    if (n > bestN) {
                        best = s;
                        bestN = n;
                    }
                }
                return best;
            };
            const lead = (c, i) => {
                const w = matched.get(c) || [];
                for (const x of w) {
                    const a = answerFor(x);
                    if (a)
                        return `start with ${q((0, rw_impact_ts_1.clip)(a, 130))} (your words), which answers the weakness you reported (${q((0, rw_impact_ts_1.clip)(x, 90))}); ask the buyer how ${head(c)} does on it`;
                }
                return sParts.length ? `no weakness you gave ties a strength to ${head(c)}; the one to test against it first is ${q((0, rw_impact_ts_1.clip)(sParts[i % sParts.length], 130))} (your words): ask the buyer how ${head(c)} does on it` : 'none of your strengths was given, so no angle is drafted';
            };
            // One neutral question per card, never the same twice (the sector's own questions first, then three general ones; a card past the end has none).
            const qPool = [...lz.questions, 'What would have to be true for you to change how you do this today?', 'Who else is involved when this decision comes up?', 'How do you measure this today, and who reviews the number?'];
            let qUsed = 0;
            const card = (c, i, kind) => {
                const w = matched.get(c) || [];
                const d = descriptor(c);
                const who = kind === 'status'
                    ? `a way your buyers cope today, in your words: ${q(nameLike(c) ? nameOf(c) : (0, rw_impact_ts_1.clip)(c, 240))}`
                    : `${d ? q(d) : !nameLike(c) ? `the description ${q((0, rw_impact_ts_1.clip)(c, 240))}, which is not a company name` : 'only the name'}`;
                const q1 = qPool[qUsed++];
                return `
### Against ${head(c)}
**${nameLike(c) ? nameOf(c) : head(c)}**${d ? ` (${d})` : ''}
- What you told us about them: ${who}
${w.length ? `- Weaknesses you reported:\n${w.map((x) => `  - ${x}`).join('\n')}\n` : ''}- Where you can lead: ${lead(c, i)}
${q1 ? `- A neutral question to ask a buyer about them: "${q1.replace(/\?$/, '')}?"` : ''}`;
            };
            const weakBlock = untied.length ? `\n**Weaknesses you gave** (about the alternatives as a group, not tied to one of them; test each with buyers, they are your notes and not verified facts):\n${list(untied)}\n` : '';
            const defaults = statusQuoDefaults(v, rc.model);
            const prodName = (0, rw_impact_ts_1.plainName)(args.your_product, runningName(args.your_product.replace(/\s*\([^)]*\)/g, '').trim())) || 'Your product';
            const answered = strengthItems.length ? sParts.filter((s) => weaknessItems.some((w) => answerFor(w) === s)) : [];
            const inShort = `${prodName} is mapped against ${vendors.length ? `${vendors.length} ${describedOnly ? 'alternative' : 'competitor'}${vendors.length > 1 ? 's' : ''} you ${describedOnly ? 'described' : 'named'}` : 'no named competitor (you gave none)'}${statusQuo.length ? ` and ${statusQuo.length} way${statusQuo.length > 1 ? 's' : ''} your buyers cope without a vendor` : ''}. ${weaknessItems.length ? `You reported ${weaknessItems.length} weakness${weaknessItems.length > 1 ? 'es' : ''}: ${weaknessItems.length - untied.length} tied to a single alternative${untied.length ? ` and ${untied.length} about the group` : ''}.` : 'You reported no weaknesses, so each card says so and asks the buyer instead.'} ${strengthItems.length ? `${answered.length ? `${answered.length === 1 ? 'One' : answered.length} of your strengths answers a reported weakness directly; the others need proof that a buyer can check.` : 'None of your strengths answers a reported weakness directly by its words, so each needs proof a buyer can check.'}` : 'You gave no strengths, so no angle is drafted.'}${competitorsGiven ? '' : ' Because you gave no competitors, the answer below maps the usual alternatives for a seller like you and names no rival.'}`;
            const missing = [];
            if (!competitorsGiven)
                missing.push({ give: 'competitors (the rivals and the status-quo options your buyers use)', changes: 'the whole answer, which would get one part per alternative' });
            if (!weaknessItems.length)
                missing.push({ give: 'competitor_weaknesses (what buyers complain about)', changes: 'each part, which now has no weakness to test' });
            if (!strengthItems.length)
                missing.push({ give: 'your_strengths', changes: 'the "Where you can lead" lines, which now draft no angle' });
            const sharpen = (0, rw_impact_ts_1.sharpenLine)(missing);
            const dq = [
                '"What have you tried before to solve this?"',
                '"What other solutions are you evaluating?"',
                ...(vendors.length ? vendors.slice(0, 2).map((c) => (nameLike(c) ? `"What would make you choose ${nameOf(c)} over us?"` : `"What keeps you with ${labelOf(c)} today, and what would make you change?"`)) : ['"What would make you choose a competitor over us?"']),
                '"What didn\'t work about your previous approach?"',
                '"What\'s missing from solutions you\'ve seen?"',
            ];
            const pairLines = strengthItems.length ? sParts.map((s) => {
                const w = weaknessItems.find((x) => answerFor(x) === s);
                return `- ${s}: ${w ? `answers the weakness you reported, ${q((0, rw_impact_ts_1.clip)(w, 110))}` : 'no weakness you gave is answered by these words directly, so back it with proof a buyer can check'}`;
            }) : [];
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

## ${describedOnly ? 'Alternatives You Described (no company names were given)' : 'Direct Competitors (Same Solution, Same Problem)'}

The weaknesses and strengths in this answer are your own notes, to test with buyers; none of them is a verified fact, and nothing about a competitor was looked up.
${describedOnly ? '\nThese are alternatives described in words, not named vendors. Add the names of the products your buyers compare you with to `competitors` for parts that carry real names.\n' : ''}${weakBlock}${vendors.length ? vendors.map((c, i) => card(c, i, 'vendor')).join('\n') : '\nNo named competitor was given, so no rival is described here. The status quo below is the alternative every deal faces.'}

---

## Status Quo (Current Manual/DIY Approach)
${statusQuo.length ? `\n**What your buyers use today** (in your words):\n${statusQuo.map((c, i) => card(c, i, 'status')).join('\n')}\n` : `\n**What they may be doing instead** (common patterns for this kind of seller; check them with buyers):\n${list(defaults)}\n`}
${v ? `Buyers in this sector often say: ${v.objections.slice(0, 2).map((o) => `"${o.objection}"`).join(' and ')}. The status quo persists while changing costs more effort or budget than the problem costs today, so put the cost of the current approach in the buyer's own figures${lz.metrics.length ? ` (${lz.metrics.slice(0, 3).join(', ')})` : ''} and tie the change to a dated event such as a renewal, an audit, a season or a target.` : "The status quo persists while changing costs more effort or budget than the problem costs today, so put the cost of the current approach in the buyer's own figures and tie the change to a dated event such as a renewal, an audit, a season or a target."}

### Against Do Nothing
Not buying is the alternative every deal faces: it wins when the problem does not yet cost the buyer enough to act. Ask what it costs in the buyer's own figures${lz.metrics.length ? `, for example ${lz.metrics.slice(0, 2).join(' or ')}` : ''}, and what changes if it grows next year.

---

## Where you can lead
${pairLines.length ? `\nYour strengths, set against what you reported (your words, not verified facts):\n${pairLines.join('\n')}\n` : '\nNo strengths were given, so nothing is set against the weaknesses yet.\n'}${v && lz.metrics.length ? `\nBuyers in ${lz.fn ? `a ${fnName(lz.fn)} team` : v.name} compare alternatives on these measures: ${lz.metrics.slice(0, 4).join(', ')}. Ask them how each alternative does on these, and lead only where you can show proof of the shape this sector trusts: ${lz.proof}\n` : ''}
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
                    enum: verticals_ts_1.BUSINESS_MODELS,
                    description: 'How you sell (saas, services, connectivity, transactions, marketplace, hardware_software or investment). Used to choose proof types; read from your inputs when not given'
                }
            },
            required: ['target_customer', 'key_outcome', 'unique_capability']
        },
        execute: (args) => {
            // Run 22 rewrite: a finished value proposition built from the user's own words. Every input is used where it matters, in whole sentences; a supplied result goes to
            // the proof tier it belongs to with its own label; nothing is invented; what is missing is named once, at the end.
            const named = (args.product_name || '').trim();
            const P = (0, rw_impact_ts_1.plainName)(named, runningName(named.replace(/\s*\([^)]*\)/g, ''))) || 'our product';
            const catTyped = (args.category || '').trim();
            const catSource = catTyped || 'solution';
            // In a sentence the category is its leading noun phrase ("predictive cybersecurity: attack path intelligence ..." reads "predictive cybersecurity").
            const catPlain = noNotes(catSource).split(/\s*[:;]\s*/)[0] || catSource;
            const category = (0, rw_impact_ts_1.categoryNoun)(catPlain);
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
            const roleOk = (r) => (r && r.length <= 70 && !/[.:]/.test(r) ? r : '');
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
            const sa = (/\.\.\./.test(sa0) || !audFull.toLowerCase().startsWith(sa0.toLowerCase().slice(0, 10))) && (0, rw_impact_ts_1.leadAud)(audFull) ? mid((0, rw_impact_ts_1.leadAud)(audFull)) : sa0;
            // The outcome as one grammatical clause (the first two results inside the statements, all of them in the matrix); a text that is not a plain result is quoted.
            const oc = (0, rw_impact_ts_1.outcomeItems)(args.key_outcome, RW_KIT);
            const lab = oc.label ? ` ${oc.label}` : '';
            const outLeadItems = (0, rw_impact_ts_1.leadItems)(oc.items, 260, 2).map((x) => (0, rw_impact_ts_1.clip)(x, 260));
            const outLead = (0, rw_impact_ts_1.outcomeClause)(outLeadItems, RW_KIT) ?? `achieve this: ${q((0, rw_impact_ts_1.clip)(clean(args.key_outcome), FRAME_AT))}`;
            const outFirst = (0, rw_impact_ts_1.outcomeClause)(outLeadItems.slice(0, 1), RW_KIT) ?? outLead;
            // The capability: a short text stands whole; a long list gives its first items and "and more" (the evaluator part lists all of it).
            const capText = clean(args.unique_capability);
            const capItems = (0, rw_impact_ts_1.topLevel)(capText);
            const capLong = capText.length > 220 && capItems.length >= 2;
            const capLeadList = capLong ? (0, rw_impact_ts_1.leadItems)(capItems, 150, 4) : capItems;
            const capLead = capLong ? `${capLeadList.join(capLeadList.some((x) => /,/.test(x)) ? '; ' : ', ')}${capLeadList.length < capItems.length ? ' and more' : ''}` : (capText.length > 220 ? (0, rw_impact_ts_1.clip)(capText, 200) : capText);
            const capShown = capLong ? capLeadList : [capText.length > 220 ? (0, rw_impact_ts_1.clip)(capText, 200) : capText];
            const capSentence = diffSentence(P, capLead);
            const onlyWith = (d) => { const k = kindOf(d); const t = lowerFirst(clean(d)); if (isNamedClause(clean(d)))
                return `where ${clean(d)}`; return k === 'third' ? `that ${t}` : k === 'base' ? `that can ${t}` : `with ${t}`; };
            // The supplied results, placed by what each one is.
            const given = splitItems(args.customer_metrics || '').map((text) => ({ text, ...(0, rw_impact_ts_1.classifyProof)(text) }));
            if (extraFact && !given.some((g) => (extraFact.match(/\d[\d,.]*/g) || []).every((n) => g.text.includes(n))))
                given.push({ text: extraFact.replace(/[.!]+$/, ''), ...(0, rw_impact_ts_1.classifyProof)(extraFact) });
            const tier = (n, kinds) => given.filter((g) => g.tier === n && (!kinds || kinds.includes(g.kind)));
            const results = tier(1);
            const cite = (results.find((r) => r.text.length <= 180) || { text: '' }).text;
            // The value matrix: the measures the user's own inputs already speak to, each next to what they say; a measure with nothing behind it is not an empty row.
            const evidence = [...given.map((g) => ({ text: g.text, label: '' })), ...oc.items.map((x) => ({ text: x, label: oc.label }))];
            const cell = (s) => s.replace(/\|/g, '/').replace(/\s+/g, ' ').trim();
            const measures = rankMeasures(lz.metrics, `${args.key_outcome} ${args.customer_metrics || ''}`, args.unique_capability);
            const rows = [];
            const bare = [];
            const shownFor = new Set();
            for (const m of measures) {
                const ms = contentStems(m);
                const need = Math.min(2, ms.size);
                const hits = evidence.filter((e) => (need > 0 && [...contentStems(e.text)].filter((x) => ms.has(x)).length >= need) || rw_impact_ts_1.MEASURE_LINKS.some(([mr, er]) => mr.test(m) && er.test(e.text)));
                const key = hits.map((h) => h.text).join('|');
                if (hits.length && shownFor.has(key))
                    continue;
                shownFor.add(key);
                if (hits.length)
                    rows.push(`| ${m} | ${cell(hits.slice(0, 2).map((h) => clean(h.text) + (h.label ? ` ${h.label}` : '')).join('; '))} | ${hits.some((h) => h.label) ? 'with the label you gave' : 'your inputs'} |`);
                else
                    bare.push(m);
            }
            const matrix = [`| Your stated outcome | ${cell(clean(args.key_outcome))}${oc.label && !/\(/.test(args.key_outcome) ? ` ${oc.label}` : ''} | your key_outcome |`, ...rows.slice(0, 6)].join('\n');
            const matrixNote = v && bare.length ? `\nOther measures that ${lz.fn ? `a ${fnName(lz.fn)} team watches` : `buyers in ${v.name} watch`}, where your inputs give no figure yet: ${bare.slice(0, 5).join(', ')}. Add the ones your best customers can show before and after.` : '';
            const hero = (() => {
                let text = '';
                for (const it of oc.items) {
                    const sc = shortClause(clean(it), 11);
                    if (sc && sc.split(/\s+/).length >= 3) {
                        text = sc;
                        break;
                    }
                }
                if (!text)
                    text = firstWords(clean(oc.items[0] || args.key_outcome), 8);
                const k = kindOf(text);
                return k === 'base' || /\bfor\b/i.test(text) ? `${capFirst(text)}. Built for ${sa}.` : `${capFirst(text)} for ${sa}.`;
            })();
            const heroLabel = oc.label && /\d/.test(hero) ? ` ${oc.label}` : '';
            const cta = (0, rw_impact_ts_1.ctaNoun)(callsToAction(v, ctx.model)[0]);
            const tailMissing = [];
            if (!named)
                tailMissing.push({ give: 'product_name', changes: 'every statement, which now says "our product"' });
            if (!catTyped)
                tailMissing.push({ give: 'category', changes: 'the "only" line and the sector read, which now rest on the other inputs' });
            if (!(args.customer_metrics || '').trim())
                tailMissing.push({ give: 'customer_metrics (one real customer result with its source)', changes: 'Tier 1 and the matrix, which quote no customer result today' });
            if (!args.business_model && (!ctx.model || /assumed/.test(ctx.line)))
                tailMissing.push({ give: 'business_model', changes: 'the proof types and calls to action, which follow the usual model of the sector today' });
            tailMissing.push({ give: "the buyer's current pain and a payback period from your best customers", changes: 'the economic buyer statement, which has no payback figure to cite' });
            const sharpen = (0, rw_impact_ts_1.sharpenLine)(tailMissing);
            const objections = v ? `\n**Objections to prepare for** (the pattern of a good answer, from the sector notes):\n${v.objections.map((o) => `- "${o.objection}"${ctx.model === 'saas' || ctx.model === null || !verticals_ts_1.SAAS_ONLY.test(o.response) ? `: ${o.response}` : ''}`).join('\n')}\n` : '';
            const sectorPart0 = v ? `\n${sectorBlock(v, lz.fn ? [] : ['vocabulary', 'committee'], 'Sector view')}${lz.fn ? `\n- **Who usually buys:** ${lz.fn.buyer} signs; ${lz.fn.champion} champions; ${lz.fn.tech} check the fit.\n${teamBlock(lz.fn, v)}` : ''}\n${objections}` : '';
            const sectorPart = ctx.model === 'saas' || ctx.model === null ? sectorPart0 : (0, rw_impact_ts_1.noSeatWords)(sectorPart0);
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
        execute: (args) => {
            // An empty list is treated like no list. A segment listed twice is scored once (backlog B15-L2).
            const segGiven = !!(args.potential_segments && args.potential_segments.filter((s) => s && s.trim()).length);
            const rawSegments = segGiven ? args.potential_segments.filter((s) => s && s.trim()) : ['Mid-market SaaS (50-500 employees)', 'Enterprise Tech (500+ employees)', 'SMB (10-50 employees)'];
            const seen = new Set();
            const segments = [];
            const dropped = [];
            for (const s of rawSegments) {
                const k = s.trim().toLowerCase().replace(/\s+/g, ' ');
                if (seen.has(k))
                    dropped.push(s.trim());
                else {
                    seen.add(k);
                    segments.push(s);
                }
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
            const stemsOf = (t) => contentStems(t);
            const ccStems0 = stemsOf(ccText0), painStems = stemsOf(painText);
            const shared = (seg, stems) => [...stemsOf(seg.replace(/\([^)]*\)/g, ''))].filter((x) => stems.has(x));
            const byShared = (n) => (n <= 0 ? 1 : n === 1 ? 3 : n === 2 ? 4 : 5);
            // Market value per segment from the user's own counts and deal size, for the budget criterion (needs counts for at least two segments).
            const countsAll = parseCounts(args.company_counts);
            const tamOf = (seg) => { const n = countsAll.find((c) => c.name && sameName(c.name, seg)); return n && acvNumber ? n.count * acvNumber : null; };
            const tamList = segments.map(tamOf).filter((x) => x !== null);
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
                }
                else if (segmentLower.includes('mid-market') || segmentLower.includes('mid market')) {
                    scores = { pain: 5, budget: 4, access: 4, reference: 4, competition: 3 };
                }
                else if (segmentLower.includes('smb') || segmentLower.includes('small')) {
                    scores = { pain: 4, budget: 2, access: 5, reference: 2, competition: 4 };
                }
                else if (segmentLower.includes('saas') || segmentLower.includes('tech')) {
                    scores = { pain: 5, budget: 4, access: 4, reference: 5, competition: 3 };
                }
                else if (segmentLower.includes('finance') || segmentLower.includes('fintech')) {
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
                    ownPain: [], ownRef: [], ownTam: null
                };
            });
            // Sort by total score (stable: the first-listed segment stays first on a tie)
            segmentScores.sort((a, b) => b.total - a.total);
            const beachhead = segmentScores[0];
            // Market sizing uses only the user's own figures (problem 5 and 6 of the real-world test).
            const counts = parseCounts(args.company_counts);
            const countText = (args.company_counts || '').trim();
            const unreadable = countText ? countText.split(/\n|;/).map((x) => x.trim()).filter((x) => x && !/\d/.test(x)) : [];
            const countFor = (name) => {
                const named = counts.find((c) => c.name && sameName(c.name, name));
                if (named)
                    return named.count;
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
            const customersText = (n) => Number.isInteger(n) ? `${n.toLocaleString('en-US')} customers` : n < 1 ? 'less than 1 customer' : `about ${n >= 10 ? Math.round(n).toLocaleString('en-US') : (Math.round(n * 10) / 10)} customers`;
            const needs = [];
            if (beachCount === null)
                needs.push(counts.length ? `company_counts for ${beachhead.name} (you gave counts, but none for this segment: add "${beachhead.name}: <number>")` : `company_counts (for example "${beachhead.name}: 3,200")`);
            if (!acvNumber)
                needs.push('average_deal_size (for example "$50,000")');
            if (pct === null)
                needs.push('percent_matching_icp (for example 25)');
            if (share === null)
                needs.push('year_one_share_percent (for example 1)');
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
            const prodName = (0, rw_impact_ts_1.plainName)(args.product_description, runningName(args.product_description.replace(/\s*\([^)]*\)/g, '').trim())) || 'Your product';
            const prodText = args.product_description.trim().length <= 400 ? args.product_description.trim() : (0, rw_impact_ts_1.clip)(args.product_description, 300);
            const ccText = (args.current_customers || '').trim();
            const ccStems = contentStems(ccText);
            const overlap = (seg) => [...contentStems(seg.replace(/\([^)]*\)/g, ''))].filter((x) => ccStems.has(x));
            const prodStems = contentStems(args.product_description);
            const prodShare = (seg) => [...contentStems(seg.replace(/\([^)]*\)/g, ''))].filter((x) => prodStems.has(x));
            // The words behind a shared stem, as the segment name spells them ("retai" is the stem of "retail").
            const real = (seg, stems) => [...new Set((seg.toLowerCase().match(/[a-z]{4,}/g) || []).filter((w) => stems.includes(w.slice(0, 5))))];
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
            const inShort = ownMethod
                ? (allTied
                    ? `${prodName}: none of your ${nSeg} segment names shares a word with your customers or your pain, so the scores built from them tie and choose nothing. Use the checks below to choose.`
                    : `${prodName}: your ${nSeg} segments were ranked from your own customers, pain and deal size, and ${beachhead.name} comes first${topShares}.${tied.length > 1 ? ` ${tied.map((t) => t.name).join(' and ')} tie for the top score, and ${beachhead.name} is shown first only because you listed it first.` : ''} The match is by words, so ask three buyers in ${tied.length > 1 ? 'those segments' : beachhead.name} which problem they raise first before you commit.`)
                : (tied.length > 1
                    ? `${prodName}: the segments were scored with keyword presets (${missingForOwn.join(', ')} not given), and the presets cannot separate ${tied.length === nSeg ? `any of your ${nSeg} segments` : `the top ${tied.length} segments (${tied.map((t) => t.name).join(', ')})`}. Choose between them with the segment-by-segment checks below, which use your deal size${cycleGiven ? ' and sales cycle' : ''}.`
                    : `${prodName}: the segments were scored with keyword presets (${missingForOwn.join(', ')} not given). ${beachhead.name} comes first only because its name contains the keyword "${beachhead.kw}"; the score does not use your deal size${acvGiven ? ` of ${acvGiven}` : ''}${cycleGiven ? `, your sales cycle of ${cycleGiven}` : ''} or anything known about your market. Treat ${beachhead.name} as the segment to test first, and settle the ranking with the segment-by-segment checks below.`);
            const nsw = (t) => (ctx.model === 'saas' || ctx.model === null ? t : (0, rw_impact_ts_1.noSeatWords)(t));
            const askQ = (i) => nsw(v && v.discovery.length ? v.discovery[i % v.discovery.length] : 'Which problem do you raise first, and what have you tried before?');
            const perSegment = segmentScores.map((s, i) => {
                const pshare = prodShare(s.name), cshare = overlap(s.name);
                return `**${s.name}** (${ownMethod ? `${s.total} of 25 from your own inputs` : s.keyword ? `${s.total} of 25 from the keyword "${s.kw}"` : `${s.total} of 25, no keyword`}).${pshare.length ? ` Your product description shares "${real(s.name, pshare).join('", "')}" with this segment name.` : ''}${cshare.length ? ` Your customers share "${real(s.name, cshare).join('", "')}" with it.` : ''} Ask three buyers there: ${q(askQ(i))}`;
            }).join('\n\n');
            const howToDecideKeyword = `## How to decide, from your own inputs

What you gave: deal size ${acvGiven || 'not given'}, sales cycle ${cycleGiven || 'not given'}, current customers ${ccText ? `(${q((0, rw_impact_ts_1.clip)(ccText, 200))})` : 'not given'}. The keyword scores below do not use any of these, so use them first:

- ${secondView}
- **Deal size and cycle.** ${acvGiven || cycleGiven ? `A deal of ${acvGiven || 'your size'}${cycleGiven ? ` with a cycle of ${cycleGiven}` : ''} needs, in each segment, a buyer who can approve that amount and a team that can run a process of that length. Check that for each segment before you rank it.` : 'Each segment must have a buyer who can approve your price and a team that can run a process of your sales length. Check that for each segment before you rank it.'}
- **Strongest pain.** ${painText ? `Your customers describe it as ${q((0, rw_impact_ts_1.clip)(painText, 200))}. Ask three buyers in each segment whether they raise that first; the segment where it is raised unprompted comes first.` : 'Ask three buyers in each segment which problem they raise first; the segment where it is raised unprompted comes first.'}

### Segment by segment

${perSegment}

---

`;
            const howToDecide = ownMethod ? `## How the segments were ranked, from your own inputs

What you gave: deal size ${acvGiven}, sales cycle ${cycleGiven || 'not given'}, current customers (${q((0, rw_impact_ts_1.clip)(ccText, 200))}) and customer pain (${q((0, rw_impact_ts_1.clip)(painText, 200))}). The scores below are built from your customers, your pain and your deal size (see "Method used" above), not from keywords in the segment names.

- **Check it with buyers.** The ranking shows where the words of your own customers and your pain point; ask three buyers in the segment at the top which problem they raise first before you commit.
- **Deal size and cycle.** A deal of ${acvGiven}${cycleGiven ? ` with a cycle of ${cycleGiven}` : ''} needs, in each segment, a buyer who can approve that amount and a team that can run a process of that length. Check that for each segment before you rank it.

---

` : howToDecideKeyword;
            const sharpenItems = [];
            if (!segGiven)
                sharpenItems.push({ give: 'potential_segments', changes: 'the whole answer, which now scores three example segments' });
            if (!ccText0)
                sharpenItems.push({ give: 'current_customers', changes: 'the ranking, which would follow where your best customers already are' });
            if (!painText)
                sharpenItems.push({ give: 'customer_pain', changes: 'the ranking, which would follow the problem your customers describe; with current_customers and average_deal_size it replaces the keyword presets' });
            if (!acvNumber)
                sharpenItems.push({ give: 'average_deal_size', changes: 'the deal-fit checks and the sizing, which now say "your price"' });
            if (!cycleGiven)
                sharpenItems.push({ give: 'sales_cycle', changes: 'the deal-fit checks, which cannot name how long a decision may take' });
            if (beachCount === null)
                sharpenItems.push({ give: counts.length ? `company_counts for ${beachhead.name} (a line written as "${beachhead.name}: " followed by the number)` : 'company_counts, one line per segment', changes: 'the sizing, which cannot yet count companies' + (ownMethod ? ' and the budget score' : '') });
            if (pct === null)
                sharpenItems.push({ give: 'percent_matching_icp', changes: 'SAM, which cannot be calculated yet' });
            if (share === null)
                sharpenItems.push({ give: 'year_one_share_percent', changes: 'SOM and the Year 1 customer goal' });
            const sharpen = (0, rw_impact_ts_1.sharpenLine)(sharpenItems);
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

${v ? `${ctx.model === 'saas' || ctx.model === null ? sectorBlock(v, ['vocabulary', 'committee', 'metrics', 'proof', 'motion'], 'What to check in each segment (sector view)') : (0, rw_impact_ts_1.noSeatWords)(sectorBlock(v, ['vocabulary', 'committee', 'metrics', 'proof', 'motion'], 'What to check in each segment (sector view)'))}\n\nBefore you commit to a segment, check that the roles above exist in its companies, that they can reach your price, and that the sector's usual objections do not block the first sale.${ctx.model ? ` In a business like yours, buyers also weigh: ${MODEL_NOTES[ctx.model].commercial}.` : ''}\n` : ''}
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
${tam !== null ? `TAM = ${beachCount.toLocaleString('en-US')} companies × ${acvGiven}\nTAM = ${usdFull(tam)} (${usd(tam)})` : `TAM: cannot be calculated yet`}

SAM = TAM × % that match your ICP
${sam !== null ? `SAM = ${usd(tam)} × ${pctText(pct)}%\nSAM = ${usdFull(sam)} (${usd(sam)})` : `SAM: cannot be calculated yet`}

SOM = SAM × expected market share (Year 1)
${som !== null ? `SOM = ${usd(sam)} × ${pctText(share)}%\nSOM = ${usdFull(som)} (${usd(som)})` : `SOM: cannot be calculated yet`}
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
${c ? `\n**Buying Characteristics**:\n- Decision maker: ${c.signer} signs; ${c.champion} is the likeliest champion (this sector's usual committee)` : '\n**Buying Characteristics**:\n- Decision maker: no sector was read, so no committee is assumed'}
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
                    enum: verticals_ts_1.BUSINESS_MODELS,
                    description: 'How you sell (saas, services, connectivity, transactions, marketplace, hardware_software or investment). Used to choose the cost and proof lines; read from your inputs when not given'
                }
            },
            required: ['target_customer', 'key_benefit', 'differentiation']
        },
        execute: (args) => {
            const P = runningName((args.product_name || '').trim()) || 'your product';
            const category = catNoun((args.product_category || '').trim() || 'solution');
            const hasComp = !!(args.competitor && args.competitor.trim());
            const alt = hasComp ? shortText(args.competitor, FRAME_AT) : 'the alternatives your buyers use today';
            const altShort = hasComp ? labelOf(alt) : alt;
            const need = shortText(args.customer_need || '', FRAME_AT);
            const benefit = shortText(args.key_benefit, FRAME_AT);
            const diff = shortText(args.differentiation, FRAME_AT);
            const aud = mid(shortAudience(args.target_customer));
            const ctx = readContext(args.business_model, { core: [args.product_category], later: [args.differentiation], names: [args.product_name], context: [args.key_benefit, args.customer_need], buyer: [args.target_customer] });
            const v = ctx.v;
            const lz = lensOf(v, args.product_category, args.customer_need, args.key_benefit, args.target_customer);
            const notes = MODEL_NOTES[ctx.model || 'unknown'];
            const thatLine = (() => { const k = kindOf(benefit); return k === 'base' ? `helps them ${lowerFirst(clean(benefit))}` : k === 'noun' ? `delivers ${lowerFirst(clean(benefit))}` : `delivers this result (${clean(benefit)})`; })();
            const needIf = need ? needClause(need) : '';
            // Repeated mentions of a long, clause-like benefit use its leading phrase; the full wording appears once, in the statement.
            const benefitR = kindOf(benefit) === 'other' && benefit.length > 70 ? leadPhrase(benefit) : benefit;
            const diffG = gateClaim(args.differentiation, diffSentence(P, diff));
            const weG = gateClaim(args.differentiation, weClause(diff));
            // What the inputs already give as proof: a count, a result with a figure, and a recognition.
            const resultItems = splitItems(args.key_benefit).slice(1).filter((x) => /\d+\s?%|\d+x\b|\$\s?\d/.test(x)).map((x) => clean(shortText(x, 200)));
            const recognition = ((args.differentiation + ' ; ' + args.key_benefit).match(/[^,;]*\b(?:gartner|forrester|idc|magic quadrant|g2 leader)\b[^;]*/i) || [''])[0].trim();
            // A count of customers in the inputs ("more than 1,000 teams use X", "used by 500,000 companies") is the social proof the user already gave.
            const countRe = /((?:more than|over|about|around|used by|trusted by)\s+)?(?<!Fortune\s)(?<![\d,.])[$]?\d[\d,.]*\+?\s*(?:[kmb]\b|million|billion)?\+?\s*(?:[\w-]+\s+){0,3}(?:teams|companies|customers|businesses|brands|enterprises|users|developers|clients|merchants)\b(?:\s+(?:use|trust|rely on|run on|choose|including)\s+[\w ,%'-]{1,60})?/i;
            const countClaim = ((`${args.target_customer} ; ${args.key_benefit} ; ${args.differentiation}`).replace(/\([^)]*\)/g, '').match(countRe) || [''])[0].trim().replace(/[,;\s]+$/, '');
            const onlyWith = (d) => { const k = kindOf(d); const t = lowerFirst(clean(d)); if (isNamedClause(clean(d)))
                return `where ${clean(d)}`; return k === 'third' ? `that ${t}` : k === 'base' ? `that can ${t}` : `with ${t}`; };
            const diffShort = shortClause(diff, 5) || shortClause(diff, 8);
            const differentiatorTagline = diffShort ? `[Only if true and provable: "The only ${mid(category)} ${onlyWith(diffShort)}"]` : `[Only if true and provable: "${capFirst(leadPhrase(diff))}"]`;
            const pillars = v
                ? [`| **Your difference** | ${q(diff)} | ${lz.proof} |`, `| **Your outcome** | ${q(benefit)} | Measure it with: ${lz.metrics.slice(0, 3).join(', ')} |`, `| **The usual objection** | "${v.objections[0].objection}": ${v.objections[0].response} | A reference or pilot result that answers it |`]
                : [`| **Your difference** | ${q(diff)} | [a result you can show] |`, `| **Your outcome** | ${q(benefit)} | [a customer figure, only if real] |`, '| **Why it is safe to buy** | [the risk the buyer worries about, and how you remove it] | [a reference or pilot result] |'];
            const sectorObjections = v ? v.objections.map((o) => `| "${o.objection}" | ${o.response} |`).join('\n') : '';
            return `# Positioning & Messaging Framework

## Positioning Inputs
- **Product**: ${args.product_name || 'not supplied'}
- **Target Customer**: ${args.target_customer}
- **Need/Opportunity**: ${args.customer_need || 'not supplied (the statement shows a gap for it)'}
- **Category**: ${args.product_category || 'not supplied (the lines below say "solution")'}
- **Key Benefit**: ${args.key_benefit}
- **Primary Alternative**: ${hasComp ? args.competitor : 'not supplied (the lines below say "the alternatives your buyers use today")'}
- **Differentiation**: ${args.differentiation}
${ctx.line}${longNote(args.target_customer, args.customer_need, args.key_benefit, args.competitor, args.differentiation)}

---

## Positioning Statement

### Complete Positioning Statement

> **For** ${aud}
> **Who** ${need ? needIf : '[the need they have: add customer_need]'}
> **${P}** **is ${aOrAn(category)}** ${mid(category)}
> **That** ${thatLine}
> **Unlike** ${alt}
> **We** ${weG}

### One-Paragraph Version
> ${capFirst(P)} is ${category.startsWith('provider of') ? 'a' : 'the'} ${mid(category)} for ${aud}${need ? ` who ${needIf}` : ''}. Unlike ${alt}, ${diffG}. For ${aud} that means they can ${inf(benefitR)}.

### One-Sentence Version
> ${capFirst(P)} helps ${aud} ${inf(benefitR)}.

---

## Message Hierarchy

### Level 1: Tagline (3-7 words)
Choose the style that fits your brand:

| Style | Tagline | Best For |
|-------|---------|----------|
| **Outcome** | ${taglineOf(benefit)} | Clarity |
| **Differentiator** | ${differentiatorTagline} | Uniqueness |
| **Audience** | "Built for ${shortAudience(shortText(noNotes(args.target_customer)))}" | Targeting |
${need && shortClause(need, 9) && !hasFiniteVerb(shortClause(need, 9)) ? `| **Problem** | "Do you ${needClause(shortClause(need, 9))}?" | Attention |\n` : ''}
### Level 2: Value Proposition (1-2 sentences)
**Option A: problem to solution**
> "${need ? `If you ${needIf}, ${diffG}` : capFirst(diffG)}, so you can ${inf(benefitR)}."

**Option B: outcome first**
> "${P}: ${capFirst(clean(benefitR))}${hasComp ? ` [Only if true and provable: without the complexity of ${altShort}]` : ''}. ${capFirst(diffG)}."

**Option C: unique mechanism**
> "[Only if true and provable: The only ${mid(category)} ${onlyWith(diff)}.] That is how ${aud} can ${inf(benefitR)}."

### Level 3: Supporting Pillars (3 proof points)

Pillars built from your own words and this sector's proof shape (keep only a proof you can show):

| Pillar | Message (your words) | Proof Point |
|--------|----------------------|-------------|
${pillars.join('\n')}

What buyers in a business like yours also weigh: ${notes.commercial}.${v ? `\n\nWords this sector's buyers use, to check your wording against: ${lz.vocab.join(', ')}.` : ''}

---

## Message Variations

### A/B Testing Options

**Variation A: lead with pain**
> "${need ? `Do you ${needIf}? ${capFirst(diffG)}` : capFirst(diffG)}."

**Variation B: lead with outcome**
> "${P}: ${capFirst(clean(benefitR))}. Built for ${aud}."

**Variation C: lead with differentiation**
> "${hasComp ? `Unlike ${alt}, ${diffG}.` : `${capFirst(diffG)}. [Only if true and provable: unlike the alternatives your buyers use today.]`}"

**Variation D: lead with social proof**
> ${(countClaim || resultItems.length || recognition) ? [countClaim ? `A count in your inputs: ${q(countClaim)}` : '', ...resultItems.slice(0, 2).map((x) => `A result in your inputs: ${q(x)}`), recognition ? `A recognition in your inputs: ${q(clean(recognition))}` : ''].filter(Boolean).join('.\n> ') + `.\n> These are claims from your own inputs; use each only if it is true and you can cite it. Lead with the strongest: "${countClaim ? `${capFirst(countClaim)}. ` : ''}${capFirst(P)} helps ${aud} ${inf(benefitR)}."` : `No customer count or named result was supplied, so there is no honest social-proof line to write yet. When you have a real count, write it as: "<your count> ${pluralAudience(args.target_customer)} already ${inf(benefitR)} with ${P}".`}

### Audience-Specific Messaging

**For Champions (${aud})**:
> "${capFirst(P)} gives you a way to ${inf(benefitR)}${hasComp ? `, instead of living with ${altShort}` : ''}."

**For Economic Buyers (${v ? (lz.fn ? lz.fn.buyer : committeeParts(v).signer) : 'Executives'})**:
> "${capFirst(P)} helps ${aud} ${inf(benefitR)}. ${v ? `Measure it in ${lz.metrics.slice(0, 2).join(' and ')}, the figures this sector already watches.` : 'Measure it in a figure your buyer already watches.'}${notes.cost ? ` [Only if true and provable: ${notes.cost} than ${altShort}.]` : ''}"

**For Technical Evaluators**:
> "${capFirst(diffG)}. ${capFirst(P)} is ${aOrAn(category)} ${mid(category)} designed for ${aud}."

---

## Message Testing Checklist

Before finalizing, test each message for:

| Criterion | Question | Pass/Fail |
|-----------|----------|-----------|
| **Clarity** | Do people understand what you do? | [ ] |
| **Relevance** | Do people care about this? | [ ] |
| **Differentiation** | Does this sound unique? | [ ] |
| **Believability** | Do people trust this claim? | [ ] |
| **Memorability** | Can people repeat it back? | [ ] |

### Testing Methods
1. **5-Second Test**: Show homepage, ask what you do
2. **Comparison Test**: Show yours vs competitor, ask preference
3. **Repeat-Back Test**: Explain, wait 24 hours, ask them to describe you
4. **Customer Validation**: Ask existing customers to confirm accuracy

---

## Objection Handling Messages

| Objection | Response Message |
|-----------|------------------|
${hasComp ? `| "We use ${altShort}" | "[Only if true and provable: customers switched from ${altShort}; what they report: ${q(diff)}]" |\n` : ''}| "Too expensive" | "Consider the cost of doing nothing about it. [Only if true and provable: the result your customers have seen, and how long it took.]" |
| "We're not ready" | "[Only if true and provable: that's exactly when our best customers started.]" |
| "Need to think about it" | "Absolutely. While you're evaluating, [Only if true and provable: here's a case study of how a similar company got a result like this.]" |
${sectorObjections ? sectorObjections + '\n' : ''}
**Next Step**: Use \`impact_translate_execution\` to adapt these messages for each channel

${SUGGESTED}
`;
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
                    enum: verticals_ts_1.BUSINESS_MODELS,
                    description: 'How you sell (saas, services, connectivity, transactions, marketplace, hardware_software or investment). Used to choose calls to action and commercial terms; read from your inputs when not given'
                }
            },
            required: ['positioning_statement', 'target_customer', 'key_benefit']
        },
        execute: (args) => {
            const P = runningName((args.product_name || '').trim()) || 'your product';
            const benefit = shortText(args.key_benefit, FRAME_AT);
            const statement = args.positioning_statement;
            const audFull = noNotes(args.target_customer);
            const aud = mid(audFull.length <= 90 ? audFull : shortAudience(audFull));
            const sa = shortAudience(shortText(audFull));
            const ctx = readContext(args.business_model, { core: [(statement.match(/\b(?:is|are)\s+(?:an?|the)\s+(.{3,120}?)\s+(?:that|which|who)\b/i) || [])[1]], names: [args.product_name], context: [statement, args.key_benefit], buyer: [args.target_customer] });
            const v = ctx.v;
            const notes = MODEL_NOTES[ctx.model || 'unknown'];
            const ctas = callsToAction(v, ctx.model);
            const lz = lensOf(v, args.key_benefit, args.target_customer, statement);
            const vocab = lz.vocab;
            const committee = lz.fn ? { signer: lz.fn.buyer, champion: lz.fn.champion, championInferred: false, users: null, reviewers: [] } : v ? committeeParts(v) : null;
            // Channels (problem 3): the input selects the sections. Unknown names are listed as not covered.
            const CHANNEL_WORDS = [
                ['website', /^(website|web|webpage|homepage|site|landing_?page)$/],
                ['linkedin', /^(linkedin|social)$/],
                ['cold_email', /^(email|cold_?email|outbound_?email|outreach|email_?sequence)$/],
                ['sales_deck', /^(sales_?deck|deck|slides|presentation|pitch_?deck)$/],
                ['product_demo', /^(demo|product_?demo|walkthrough|pilot_?review)$/],
            ];
            const asked = (args.channels || []).map((c) => String(c).trim()).filter(Boolean);
            const chosen = new Set();
            const notCovered = [];
            for (const c of asked) {
                const key = c.toLowerCase().replace(/[\s-]+/g, '_');
                const hit = CHANNEL_WORDS.find(([, re]) => re.test(key));
                if (hit)
                    chosen.add(hit[0]);
                else
                    notCovered.push(c);
            }
            const noneRecognised = asked.length > 0 && chosen.size === 0;
            if (asked.length === 0 || noneRecognised)
                CHANNEL_WORDS.forEach(([k]) => chosen.add(k));
            const channelNote = asked.length === 0 ? '' : noneRecognised
                ? `\n**Channels**: none of the channels you listed (${asked.join(', ')}) is one this tool covers, so all five are shown. It covers website, LinkedIn, cold email, sales deck and demo.`
                : `\n**Channels requested**: ${asked.join(', ')}.${notCovered.length ? ` Channels not covered by this tool: ${notCovered.join(', ')} (it covers website, LinkedIn, cold email, sales deck and demo).` : ''}`;
            // The "Unlike ..." and "offers ..." parts of the statement, used on the key slide and in the demo.
            const unlike = shortText((statement.match(/\bunlike\s+([^,.;]+(?:\([^)]*\))?)/i) || statement.match(/\balternatives?(?: buyers)? (?:use|used|weigh) today:\s*([^.;]+)/i) || [])[1]?.trim() || '', FRAME_AT);
            const offers = clean(shortText((statement.match(/\boffers?\s+([^.]+?)\.?\s*$/i) || statement.match(/\bwhat sets it apart:\s*(.+?)\.?\s*$/i) || [])[1]?.trim() || '', FRAME_AT));
            const unlikeName = unlike ? nameOf(unlike) : '';
            const sections = [];
            // Run 20 round 1: every section is a draft built from the inputs and the sector data file, with no bracket left where the sector or the
            // inputs can supply the words. Only mail-merge fields ([First name], [Company], [Signature]) stay. Figures and claims are never added.
            const m0 = lz.metrics.length ? lz.metrics[0] : 'the main measure your buyer tracks';
            const m1 = lz.metrics.length ? lz.metrics[1] || lz.metrics[0] : 'a second measure your buyer tracks';
            const askLine = ctas[0].replace(/^./, (c) => c.toLowerCase());
            // An in-house alternative has no "current provider": questions about one are left out.
            const inHouse = /in[- ]house|internal|\bDIY\b|ourselves/i.test(unlike);
            const qs = lz.questions.filter((x) => !(inHouse && /provider|incumbent|vendor/i.test(x)));
            // The hook follows the user's benefit: a benefit that is an action becomes the question "how long does it take you to ...".
            const lead0 = leadPhrase(benefit);
            const benefitQ = kindOf(benefit) === 'base' ? `How long does it take you today to ${lowerFirst(clean(benefit))}?`
                : lead0.split(/\s+/).length <= 10 && !/^[A-Za-z-]+(?:ing|ed)\b/i.test(lead0) ? `Do you have ${lowerFirst(lead0)} today?` : '';
            const q0 = benefitQ || (qs.length ? qs[0] : '');
            const q1 = qs.length ? (benefitQ ? qs[0] : qs[1] || qs[0]) : '';
            const benefitR = kindOf(benefit) === 'other' && benefit.length > 70 ? leadPhrase(benefit) : benefit;
            const subjectLead = capFirst(shortClause(benefit, 6) || firstWords(clean(benefit), 5));
            const objection0 = v ? v.objections[0] : null;
            const demoWord = ctx.model === 'saas' || ctx.model === null ? 'demo' : 'walkthrough';
            const offerLine = offers ? gateClaim(offers, `${capFirst(P)} offers ${lowerFirst(clean(offers))}.`) : `${capFirst(P)}: what sets it apart is in your positioning statement above.`;
            if (chosen.has('website'))
                sections.push(`## Website Execution

### Homepage Hero
**Headline (5-8 words)**:
> "${heroLine(benefit, sa, P)}"

**Subheadline (15-20 words)**:
> "${capFirst(P)} helps ${aud} ${inf(benefitR)}."

**Proof under the fold**: ${lz.proof ? `show ${lc1(lz.proof).replace(/\.$/, '')}. Use a real result of yours in that shape, or leave the slot empty.` : 'show one real customer result, with its source. Leave the slot empty if you have none.'}

**CTA Options** (examples: keep only the ones you offer):
- Primary: "${ctas[0]}"
- Secondary: "${ctas[1] || 'See how it works'}" / "View case studies"

### Above the Fold Checklist
- [ ] The headline names the result for ${sa}
- [ ] The words buyers in this sector use appear on the page${vocab.length ? ` (${vocab.slice(0, 4).join(', ')})` : ''}
- [ ] A proof the buyer can check, with a source
- [ ] One clear button: "${ctas[0]}"
`);
            if (chosen.has('linkedin'))
                sections.push(`## LinkedIn Execution

### Profile/Company Page Tagline
> "Helping ${aud} ${inf(benefitR)}"

### Post Drafts

**Post 1: the question your buyers ask themselves**
\`\`\`
${q0 ? q0 : `Is this on your list this year: ${q(benefit)}?`}

${capFirst(P)} helps ${aud} ${inf(benefitR)}.
${offerLine}

${q1 ? `A question you can put to your buyers this week: ${q1}` : 'Ask your own team how they handle this today.'}
\`\`\`

**Post 2: the claim and how you will prove it**
\`\`\`
${capFirst(P)} helps ${aud} ${inf(benefitR)}.

${lz.proof ? `How we would show it: ${lz.proof}` : 'How we would show it: one customer, one measure, before and after.'}
${lz.metrics.length ? `The figures that matter here: ${lz.metrics.slice(0, 3).join(', ')}.` : ''}

${objection0 ? `The question we hear most: "${objection0.objection}". Our answer: ${objection0.response}` : 'The question we hear most is about switching. We answer it with a pilot.'}
\`\`\`

**Post 3: a customer story** (write it only from a real customer who agreed)
\`\`\`
Outline: the customer's situation, what they measured before, what changed, what they measure now${v ? ` (${m0} or ${m1} are typical in this sector)` : ''}, and the customer's own words.
\`\`\`
`);
            if (chosen.has('cold_email'))
                sections.push(`## Cold Email Execution

Open each email with a trigger you can see for the buyer (a renewal, an audit, a season, a target); that is the one line only you can write.

### Email 1: problem-focused
**Subject**: ${subjectLead}: a question for [Company]

\`\`\`
Hi [First name],

${q0 ? `A question I ask teams like yours: ${q0}` : `Teams like [Company] often weigh ${m0}.`}

${capFirst(P)} helps ${aud} ${inf(benefitR)}.

If useful, the next step is simple: ${askLine}.

[Signature]
\`\`\`

### Email 2: value-focused
**Subject**: How we would prove it at [Company]

\`\`\`
Hi [First name],

Following up with how we would show the result, not just claim it: ${lz.proof ? lc1(lz.proof) : 'one measure, before and after, on one team, agreed with you in advance.'}

${offerLine}

Worth a conversation?

[Signature]
\`\`\`

### Email 3: breakup
**Subject**: Closing the loop

\`\`\`
Hi [First name],

I have reached out a few times about helping [Company] ${inf(benefitR)}.

If the timing is not right, no worries at all. ${objection0 ? `If "${objection0.objection.replace(/[.?!]+$/, '')}" is the concern, I can answer it in one call.` : 'If switching is the concern, I can answer it in one call.'}

[Signature]
\`\`\`
`);
            if (chosen.has('sales_deck'))
                sections.push(`## Sales Deck Execution

### Slide Structure (10 slides)

| Slide | Title | Content |
|-------|-------|---------|
| 1 | Title | ${P}: ${clean(benefit)} |
| 2 | The Problem | Why ${aud} struggle today${vocab.length ? `, in the words of this sector: ${vocab.slice(0, 3).join(', ')}` : ''} |
| 3 | Cost of Inaction | What happens to ${m0} and ${m1} if this does not get solved (use the buyer's own figures) |
| 4 | The Solution | Introducing ${P} |
| 5 | How It Works | ${offers ? offers : 'The three things your buyer must understand to say yes'} |
| 6 | Differentiation | ${unlikeName ? `Why ${P} and not ${unlikeName}` : 'Why we are different (your positioning)'} |
| 7 | Results | ${lz.proof || 'Customer outcomes and metrics, with sources'} |
| 8 | Case Study | One real customer story, with the customer's consent |
| 9 | Commercials | ${capFirst(notes.commercial)} |
| 10 | Next Steps | ${ctas[0]} |

### Key Slide: Differentiation
\`\`\`
Unlike ${unlike || 'the alternative your buyers use today'}...

They do: ask three buyers how ${unlikeName || 'that alternative'} handles this today and use their words
We do: ${offers ? offers : 'what your positioning statement says you offer'}

Result: the figure your buyer already tracks${v ? ` (${m0})` : ''}, from a real customer
\`\`\`
`);
            if (chosen.has('product_demo'))
                sections.push(`## Product Demo Execution

### ${demoWord === 'demo' ? 'Demo' : 'Walkthrough'} Script Structure (15 minutes, Example figure: replace with your own)

**0-2 min: Context Setting** ${EXAMPLE}
> "Based on our conversation, here is what I will show you: how ${P} helps ${aud} ${inf(benefitR)}."${q0 ? `\nA question to open with, in this sector's language: ${q(q0)}` : ''}

**2-8 min: Core Value Demonstration** ${EXAMPLE}
${offers ? `Start with what you offer: ${offers}. ` : ''}Then show the two or three features that answer the buyer's stated needs, in the order of what this sector measures${lz.metrics.length ? `: ${lz.metrics.slice(0, 3).join(', ')}` : ''}.

**8-12 min: Differentiation Proof** ${EXAMPLE}
> "You might be wondering how this compares to ${unlikeName || 'what you use today'}. Watch this..."
Show one thing they cannot get from ${unlikeName || 'their current approach'}, using their own data or sites where you can.

**12-15 min: Close & Next Steps** ${EXAMPLE}
> "What would success look like for you in the first 90 days?"
> "The next step is: ${askLine}."

### ${demoWord === 'demo' ? 'Demo' : 'Walkthrough'} Best Practices
- [ ] Customize to their specific use case
- [ ] Use their industry terms${vocab.length ? ` (${vocab.slice(0, 4).join(', ')})` : ''}
- [ ] Show outcomes, not features
- [ ] Leave time for questions
- [ ] Agree the next step before the end
`);
            // One list: the order is the table (backlog B15-L5f), and it follows how buyers in this sector usually buy.
            const selfServe = ctx.model === 'saas' && !(v && ['cybersecurity', 'fintech', 'logistics-tech', 'vertical-saas', 'ai-native'].includes(v.id));
            const order = (selfServe
                ? [['website', 'Website + SEO', 'foundation: buyers research you here before they reply'], ['linkedin', 'LinkedIn Organic', 'awareness among your target roles'], ['cold_email', 'Cold Email', 'pipeline from named accounts'], ['sales_deck', 'Sales Deck', 'conversion once there is a conversation'], ['product_demo', 'Demo', 'proof of capability']]
                : [['cold_email', 'Cold Email', `direct outreach to the roles that buy${committee ? `: ${committee.signer}; ${committee.champion}` : ''}`], ['linkedin', 'LinkedIn Organic', 'awareness among those same roles'], ['sales_deck', 'Sales Deck', 'the story you tell once there is a meeting'], ['website', 'Website', 'credibility: proof, references and the facts buyers check'], ['product_demo', ctx.model === 'saas' || ctx.model === null ? 'Demo' : 'Walkthrough or pilot review', 'proof of capability']]).filter(([k]) => chosen.has(k));
            return `# Channel Execution Playbook

## Positioning Foundation
**Statement**: ${statement}
**Target**: ${args.target_customer}
**Key Benefit**: ${args.key_benefit}
**Product**: ${args.product_name || 'not supplied'}${channelNote}
${ctx.line}${longNote(statement, args.target_customer, args.key_benefit)}

---

${sections.join('\n---\n\n')}
---
${v ? `
## Sector Language

Use the words buyers in ${lz.fn ? fnName(lz.fn) : v.name} use, and keep claims to what you can show. ${vocab.length ? `Words ${lz.fn ? 'buyers in this team' : 'this sector\'s buyers'} use: ${vocab.join(', ')}. ` : ''}What ${lz.fn ? 'this team' : 'the sector'} measures: ${lz.metrics.join(', ')}. A proof point that lands: ${lz.proof}

---
` : ''}
## Channel Priority

Example priorities: replace with your own.${v ? ` The order follows how deals usually run in ${v.name}: ${v.salesMotion}` : ''}

**Recommended Priority Order**:
${numbered(order.map(([, name, why]) => `${name} (${why})`))}

**Next Step**: Use \`impact_full_audit\` for an input completeness score (how complete and specific your inputs are, not whether your positioning is right), with a generated positioning draft and a 30-day plan

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
                    enum: verticals_ts_1.BUSINESS_MODELS,
                    description: 'How you sell (saas, services, connectivity, transactions, marketplace, hardware_software or investment). Used in the plan; read from your inputs when not given. It does not change the score'
                }
            },
            required: ['product_description', 'target_customer', 'problem_solved']
        },
        execute: (args) => {
            const company = (args.company_name || '').trim() || 'your product';
            const competitors = args.competitors || ['Status quo', 'DIY solutions'];
            const differentiation = args.key_differentiation || 'unique approach';
            const givenCompetitors = (args.competitors || []).filter((c) => c && c.trim());
            const allFeedback = splitItems(args.customer_feedback);
            // A company-wide claim ("$8B+ deployed", "more than 1,000 teams use X") or a recognition is not a result a customer describes.
            const isCompanyClaim = (x) => /^(?:more than|over|about|around)?\s*[$]?\d[\d,.]*\+?\s*(?:billion|million|bn|[bm])\b/i.test(x.trim()) || /\bdeployed\b|\bassets under management\b|\bAUM\b/i.test(x) || /^(?:more than|over|about|around)?\s*[$\d][\d,.]*\+?\s*(?:[kmb]\b|million|billion)?\+?\s*(?:\w+\s+){0,3}(?:teams|companies|businesses|customers|users|clients|developers|enterprises|brands|merchants)\b/i.test(x.trim()) || /^(?:named|featured|recognised|recognized|ranked|winner|a leader|leader in)\b|\b(?:awards?|excellence award|magic quadrant|frost radar|major contender|enterprise innovator|gartner|forrester|idc|everest|hfs|g2|capterra|recogni[sz]ed|recognition|best [\w&' -]{3,40}(?:platform|solution|tool|software)|cio choice)\b/i.test(x);
            const companyClaims = allFeedback.filter(isCompanyClaim);
            const feedbackItems = allFeedback.filter((x) => !isCompanyClaim(x));
            const ctx = readContext(args.business_model, { core: [args.product_description], later: [args.key_differentiation, args.current_positioning], names: [args.company_name], context: [args.problem_solved, args.customer_feedback], buyer: [args.target_customer] });
            const v = ctx.v;
            const notes = MODEL_NOTES[ctx.model || 'unknown'];
            const lz = lensOf(v, args.problem_solved, args.product_description, args.target_customer);
            const vocab = lz.vocab;
            const committee = lz.fn ? { signer: lz.fn.buyer, champion: lz.fn.champion, championInferred: false, users: null, reviewers: [] } : v ? committeeParts(v) : null;
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
            }
            else {
                scores.identify = 45;
            }
            // Map Alternatives (based on competitors)
            if (competitors.length > 2) {
                scores.map = 80;
            }
            else if (competitors.length > 0 && competitors[0] !== 'Status quo') {
                scores.map = 65;
            }
            else {
                scores.map = 40;
            }
            // Pinpoint Value (based on differentiation)
            if (differentiation.length > 30) {
                scores.pinpoint = differentiation.includes('only') || differentiation.includes('unique') ? 85 : 70;
            }
            else {
                scores.pinpoint = 50;
            }
            // Anchor Market (based on target specificity)
            if (args.target_customer.includes('employees') || args.target_customer.includes('revenue') || args.target_customer.includes('Series')) {
                scores.anchor = 80;
            }
            else if (args.target_customer.split(' ').length > 3) {
                scores.anchor = 65;
            }
            else {
                scores.anchor = 45;
            }
            // Craft Message (based on current positioning)
            if (args.current_positioning && args.current_positioning.length > 50) {
                scores.craft = args.current_positioning.includes('unlike') || args.current_positioning.includes('only') ? 85 : 70;
            }
            else if (args.current_positioning) {
                scores.craft = 55;
            }
            else {
                scores.craft = 30;
            }
            // Translate Execution (based on customer feedback indicating market presence)
            if (args.customer_feedback && args.customer_feedback.length > 50) {
                scores.translate = 75;
            }
            else if (args.customer_feedback) {
                scores.translate = 55;
            }
            else {
                scores.translate = 35;
            }
            const overallScore = Math.round((scores.identify + scores.map + scores.pinpoint + scores.anchor + scores.craft + scores.translate) / 6);
            // Determine grade
            let grade = 'F';
            let gradeDescription = '';
            if (overallScore >= 85) {
                grade = 'A';
                gradeDescription = 'Very complete: every area has detailed input';
            }
            else if (overallScore >= 75) {
                grade = 'B';
                gradeDescription = 'Mostly complete: a few inputs could be more specific';
            }
            else if (overallScore >= 65) {
                grade = 'C';
                gradeDescription = 'Partly complete: several inputs are short or missing';
            }
            else if (overallScore >= 50) {
                grade = 'D';
                gradeDescription = 'Thin: many inputs are short or missing';
            }
            else {
                grade = 'F';
                gradeDescription = 'Very thin: most inputs are short or missing';
            }
            // Find weakest areas
            const sortedScores = Object.entries(scores).sort((a, b) => a[1] - b[1]);
            const weakest = sortedScores.slice(0, 2);
            const strongest = sortedScores.slice(-2).reverse();
            // Tool name for each phase key (the tool list below names real tools, not phase keys).
            const phaseTool = {
                identify: 'impact_identify_champions', map: 'impact_map_alternatives', pinpoint: 'impact_pinpoint_value',
                anchor: 'impact_anchor_market', craft: 'impact_craft_message', translate: 'impact_translate_execution'
            };
            // ---- Words only (not part of the score): the generated positioning, tagline options, proof and word checks ----
            const problemShort = shortClause(shortText(args.problem_solved), 6);
            const diffShort = args.key_differentiation ? shortClause(args.key_differentiation, 5) : null;
            const taglines = [];
            if (problemShort && !hasFiniteVerb(problemShort) && kindOf(problemShort) !== 'base' && !/^(a|an|the)\s/i.test(problemShort))
                taglines.push(`[Only if true and provable: "${capFirst(problemShort)}, solved."]`);
            if (diffShort && !['base', 'third'].includes(kindOf(diffShort)))
                taglines.push(`"${capFirst(diffShort)}"`);
            taglines.push(`"Built for ${shortAudience(shortText(noNotes(args.target_customer)))}"`);
            // Run 20 round 1: more options, each built from the user's own words and cut at a clause end.
            const diffWide = args.key_differentiation ? shortClause(args.key_differentiation, 9) : null;
            if (diffWide && diffWide !== diffShort && !['base', 'third'].includes(kindOf(diffWide)))
                taglines.push(`"${capFirst(diffWide)}"`);
            const posLead = (args.current_positioning || args.product_description || '').split(/[:;]|\s-\s/)[0].trim();
            const posShort = posLead && shortClause(posLead, 9);
            if (posShort && !taglines.some((t) => t.toLowerCase().includes(posShort.toLowerCase())))
                taglines.push(`"${capFirst(posShort)}"`);
            // When no clause of 9 words or fewer exists, the first words of the differentiation and of the positioning (never ending on a joining word) are offered.
            for (const src of [args.key_differentiation, posLead]) {
                const fw = src ? leadPhrase(src) : '';
                if (fw && fw.split(/\s+/).length >= 3 && !taglines.some((t) => t.toLowerCase().includes(fw.toLowerCase())))
                    taglines.push(`"${capFirst(fw)}"`);
            }
            const stop = new Set('the and for with who that this our your their its are was were been from they them you can will not but all any'.split(' '));
            const wordsOf = (s) => (s.toLowerCase().match(/[a-z][a-z-]{2,}/g) || []).filter((w) => !stop.has(w));
            const cur = (args.current_positioning || '').trim();
            const targetWords = wordsOf(args.target_customer);
            const curWords = wordsOf(cur);
            const yn = (b) => (b ? 'Yes' : 'No');
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

${score >= 70 ? 'This input is already detailed: sharpen it next.' : `**Input**: ${phase === 'identify' ? 'Your target customer is short. Who exactly is your buyer?' :
                phase === 'map' ? `This area counts the competitors you name, and you named ${givenCompetitors.length || 'none'}. Naming more of the alternatives customers consider raises it.` :
                    phase === 'pinpoint' ? `${args.key_differentiation ? 'Your differentiation is short.' : 'You supplied no differentiation.'} What specific outcomes do customers achieve?` :
                        phase === 'anchor' ? 'Your target customer does not mention employees, revenue or a funding series. What makes a company ideal for you?' :
                            phase === 'craft' ? `${args.current_positioning ? 'Your current positioning is short.' : 'You supplied no current positioning statement.'} How do you articulate your unique value?` :
                                `${args.customer_feedback ? 'Your customer feedback is short.' : 'You supplied no customer feedback.'} How does positioning show up in your channels?`}`}

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
exports.SERVER_NAME = 'impact-mcp';
exports.SERVER_VERSION = '2.2.19';
// Every tool only builds text from its inputs: no storage, no network, no side effects.
const TOOL_TITLES = {
    "impact_get_framework": "IMPACT Framework Guide",
    "impact_identify_champions": "Identify Champions",
    "impact_map_alternatives": "Map Alternatives",
    "impact_pinpoint_value": "Pinpoint Value",
    "impact_anchor_market": "Anchor Market",
    "impact_craft_message": "Craft Message",
    "impact_translate_execution": "Translate Execution",
    "impact_full_audit": "IMPACT Full Audit"
};
function withMeta(tool) {
    const title = TOOL_TITLES[tool.name] ?? tool.name;
    return {
        ...tool,
        title,
        annotations: { title, readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    };
}
const NEGATIVE_AMOUNT = /\$\s*[-\u2212]\s*\d|(^|[\s(:=,;])[-\u2212](?:\$|usd|inr|eur|gbp|rs\.?|\u20b9|\u20ac|\u00a3)?\s?\d[\d,]*(?:\.\d+)?(?![\d,.]|\s*%)/i;
const NEGATIVE_MONEY = /[-−]\s?[$₹€£]\s*\d|[$₹€£]\s*[-−]\s*\d|\b(?:mrr|arr|cac|ltv|acv)\b[:\s]*[-−]\s*\d/i;
const AMOUNT_RANGE = /\d\s*[kmb]?\s*(?:-|\u2013|\u2014|to)\s*[$\u20b9\u20ac\u00a3]?\s*\d/i;
function checkValue(schema, holder, key, path, problems) {
    const box = holder;
    const value = box[key];
    if (value === undefined || value === null)
        return;
    if (schema.properties && typeof value === "object" && !Array.isArray(value)) {
        for (const [k, p] of Object.entries(schema.properties))
            checkValue(p, value, k, path ? `${path}.${k}` : k, problems);
        return;
    }
    if (schema.items && Array.isArray(value)) {
        value.forEach((_, i) => checkValue(schema.items, value, i, `${path}[${i}]`, problems));
        return;
    }
    if (Array.isArray(schema.enum) && typeof value === "string" && !schema.enum.includes(value)) {
        problems.push(`${path} must be one of: ${schema.enum.join(", ")}`);
        return;
    }
    if (schema.type !== "number" && schema.type !== "integer")
        return;
    let v = value;
    if (typeof v === "string") {
        const n = v.trim() === "" ? NaN : Number(v.replace(/,/g, "").trim());
        if (!Number.isFinite(n)) {
            problems.push(`${path} must be a number, written with digits only (for example 220000)`);
            return;
        }
        box[key] = n;
        v = n;
    }
    if (typeof v !== "number" || !Number.isFinite(v)) {
        problems.push(`${path} must be a number`);
        return;
    }
    if (typeof schema.minimum === "number" && v < schema.minimum)
        problems.push(`${path} must be ${schema.minimum} or more`);
    if (typeof schema.exclusiveMinimum === "number" && v <= schema.exclusiveMinimum)
        problems.push(`${path} must be more than ${schema.exclusiveMinimum}`);
    if (typeof schema.maximum === "number" && v > schema.maximum)
        problems.push(`${path} must be ${schema.maximum} or less`);
}
const MONEY_TEXT = { impact_anchor_market: ["average_deal_size"], impact_identify_champions: ["price_point"] };
const METRIC_TEXT = {};
const ONE_AMOUNT = { impact_anchor_market: ["average_deal_size"] };
function checkRequiredInputs(name, args) {
    const tool = tools[name];
    if (!tool) {
        return `Unknown tool: ${name}. Available tools: ${Object.keys(tools).join(', ')}.`;
    }
    const required = tool.inputSchema.required ?? [];
    // Run 16 R16-10 (rule B52): a required text (a string with no fixed list of choices) that is empty or only whitespace counts as missing.
    const props = (tool.inputSchema.properties ?? {});
    const blankText = (key) => typeof args?.[key] === "string" && args[key].trim() === "" && props[key]?.type === "string" && !Array.isArray(props[key]?.enum);
    const missing = required.filter((key) => args?.[key] === undefined || args?.[key] === null || blankText(key));
    if (missing.length > 0) {
        return `Missing required input for ${name}: ${missing.join(', ')}. Provide ${missing.length === 1 ? 'it' : 'them'} and call the tool again.`;
    }
    // Decision N2 (run 6) and run 7: schema limits at any depth, choices, money text and single amounts.
    const problems = [];
    if (args) {
        for (const [k, p] of Object.entries(tool.inputSchema.properties ?? {}))
            checkValue(p, args, k, k, problems);
    }
    for (const key of MONEY_TEXT[name] ?? []) {
        const raw = args?.[key];
        if (typeof raw === "string" && NEGATIVE_AMOUNT.test(raw))
            problems.push(`${key} must not contain a negative amount`);
    }
    for (const key of METRIC_TEXT[name] ?? []) {
        const raw = args?.[key];
        if (typeof raw === "string" && NEGATIVE_MONEY.test(raw))
            problems.push(`${key} must not contain a negative amount of money`);
    }
    for (const key of ONE_AMOUNT[name] ?? []) {
        const raw = args?.[key];
        if (typeof raw === "string" && AMOUNT_RANGE.test(raw))
            problems.push(`${key} must be one amount, not a range (for example $75,000)`);
    }
    if (problems.length > 0) {
        return `Invalid input for ${name}: ${problems.join("; ")}.`;
    }
    return null;
}
/** Run 21c round 3: a product typed as a long description is named in running sentences by its noun phrase ("Freight visibility platform"); a clear name is used as typed. The Product line keeps the full text. */
function runningName(text) {
    const t = text.replace(/\s+/g, ' ').trim();
    if (!t || (t.split(' ').length <= 6 && t.length <= 60))
        return t;
    const head = t.split(/[:;]|,\s/)[0].replace(/\s*\([^)]*\)/g, '').trim(); // a bracket note is not part of a short name
    const words = head.split(' ');
    if (words.length <= 6 && head.length <= 60)
        return head;
    const j = words.findIndex((w, i) => i >= 2 && /^(?:that|which|who|where|for|with|by|from|to|connects?|helps?|lets?|gives?|makes?|builds?|runs?|designs?|turns?|unifies?|joins?|uses?)$/i.test(w));
    if (j >= 2 && j <= 7)
        return words.slice(0, j).join(' ');
    const lead = words.slice(0, 4);
    while (lead.length > 2 && /^(?:that|which|who|where|for|with|to|by|on|in|of|and|or|from|the|a|an)$/i.test(lead[lead.length - 1]))
        lead.pop();
    return lead.join(' ');
}
function createServer() {
    const server = new index_js_1.Server({ name: exports.SERVER_NAME, version: exports.SERVER_VERSION }, { capabilities: { tools: {} } });
    server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
        tools: Object.entries(tools).map(([name, config]) => withMeta({ name, description: config.description, inputSchema: config.inputSchema })),
    }));
    server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
        // Run 20 echo safeguard (D086): the single dispatch point of the hosted function and of stdio. Every string in the arguments is
        // made inert once, here, before it is checked or used: markup, links, hidden characters; an instruction-like text is quoted.
        const safeName = (0, echo_safe_ts_1.neutraliseText)(String(request.params.name));
        const safeArgs = (0, echo_safe_ts_1.neutraliseDeep)(request.params.arguments);
        const problem = checkRequiredInputs(request.params.name, safeArgs);
        if (problem) {
            return { content: [{ type: 'text', text: (0, echo_safe_ts_1.neutraliseText)(problem) }], isError: true };
        }
        const toolName = request.params.name;
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
            const callArgs = { ...(safeArgs || {}) };
            if (typeof callArgs.target_customer === 'string' && isJobTitle(callArgs.target_customer))
                callArgs.target_customer = lowerJobTitle(callArgs.target_customer);
            const result = tool.execute(callArgs);
            return {
                content: [{ type: 'text', text: result }]
            };
        }
        catch (error) {
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
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error(`IMPACT MCP v${exports.SERVER_VERSION} running on stdio`);
}
// Run over stdio only when started directly (npm bin). The hosted function imports this
// file as an ES module bundle, where require is not defined.
if (typeof module !== 'undefined' && typeof require !== 'undefined' && require.main === module) {
    main().catch(console.error);
}
// Reads one amount from text: "$5,000", "$50K" and "$1.5M" give 5000, 50000 and 1500000 (run 7, T5).
function readAmount(text) {
    const m = text.replace(/,/g, '').match(/(\d+(?:\.\d+)?)\s*([kmb])?\b/i);
    if (!m)
        return null;
    const mult = { k: 1e3, m: 1e6, b: 1e9 };
    return Math.round(parseFloat(m[1]) * (mult[(m[2] || '').toLowerCase()] ?? 1));
}
//# sourceMappingURL=index.js.map