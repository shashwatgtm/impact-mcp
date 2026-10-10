"use strict";
// Run 22 rewrite of impact_pinpoint_value, impact_anchor_market and impact_map_alternatives: text helpers only.
// Everything here is pure string work (no network, no file access, no environment, no logging). It holds cue words (words that tell what kind of
// thing a typed phrase is: a customer result, a piece of recognition, a count of users, a quote) and the small tools that turn a typed list into a clean
// sentence. It holds no sector knowledge: sector facts stay in verticals.ts (rule B82), and no figure is ever added here.
Object.defineProperty(exports, "__esModule", { value: true });
exports.MEASURE_LINKS = void 0;
exports.takeLabel = takeLabel;
exports.topLevel = topLevel;
exports.joinAnd = joinAnd;
exports.clip = clip;
exports.outcomeItems = outcomeItems;
exports.asInfinitive = asInfinitive;
exports.outcomeClause = outcomeClause;
exports.leadItems = leadItems;
exports.classifyProof = classifyProof;
exports.ctaNoun = ctaNoun;
exports.sharpenLine = sharpenLine;
exports.categoryNoun = categoryNoun;
exports.leadAud = leadAud;
exports.noSeatWords = noSeatWords;
exports.splitStrengths = splitStrengths;
exports.tidyLabel = tidyLabel;
exports.plainName = plainName;
exports.specificKeys = specificKeys;
exports.linkScore = linkScore;
exports.productParts = productParts;
exports.isCompanyFact = isCompanyFact;
exports.brandName = brandName;
exports.roleOk = roleOk;
exports.segmentFit = segmentFit;
exports.segmentOverlap = segmentOverlap;
exports.segmentType = segmentType;
exports.isNamedPart = isNamedPart;
exports.segmentFacts = segmentFacts;
exports.partLabel = partLabel;
// A source label at the end of a typed text: "(page claim)", "(case study)", "(hypothetical)", "(quote from the head of payments at X)".
const LABEL = /\s*\(([^()]*\b(?:page claims?|page words?|page text|page quote|customer words|hypothetical|customer stor(?:y|ies)|story titles?|case stud(?:y|ies)|analyst reports?|press release|quote from|testimonial|review sites?|sources?)\b[^()]*)\)\s*[.!]?\s*$/i;
function takeLabel(text) {
    const t = text.trim();
    const m = t.match(LABEL);
    return m && m.index !== undefined ? { body: t.slice(0, m.index).trim(), label: `(${m[1].trim()})` } : { body: t.replace(/[.!]+$/, ''), label: '' };
}
/** The pieces of a typed list at its top-level commas, semicolons and line ends (brackets and thousands separators stay whole). */
function topLevel(text) {
    const t = text.replace(/\n+/g, '; ').replace(/[ \t]+/g, ' ').trim();
    const out = [];
    let cur = '';
    let depth = 0;
    for (let i = 0; i < t.length; i++) {
        const ch = t[i];
        if (ch === '(' || ch === '[')
            depth++;
        else if (ch === ')' || ch === ']')
            depth = Math.max(0, depth - 1);
        const thousands = ch === ',' && /\d$/.test(cur) && /^\d{2,3}(?:,\d{2,3})*(?!\d)/.test(t.slice(i + 1)); // 25,000 and 2,15,000 are one number
        if (depth === 0 && !thousands && (ch === ',' || ch === ';')) {
            out.push(cur);
            cur = '';
        }
        else
            cur += ch;
    }
    out.push(cur);
    return out.map((x) => x.trim().replace(/^(?:and|or)\s+/i, '')).filter(Boolean);
}
/** "a, b and c"; a list whose items hold commas uses semicolons. */
function joinAnd(xs) {
    if (xs.length <= 1)
        return xs[0] || '';
    const semi = xs.some((x) => /,/.test(x));
    if (xs.length === 2)
        return semi ? `${xs[0]}; and ${xs[1]}` : `${xs[0]} and ${xs[1]}`;
    return semi ? `${xs.slice(0, -1).join('; ')}; and ${xs[xs.length - 1]}` : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`;
}
const JOIN_END = /^(with|and|or|of|for|to|the|a|an|in|on|by|that|from|you|your|we|our|they|their|it|its|who|which|can|will|is|are|at|as)$/i;
/** A text cut at a clause boundary within about n characters, with no ellipsis and never ending on a joining word. */
function clip(text, n) {
    const x = text.trim().replace(/\s+/g, ' ');
    if (x.length <= n)
        return x;
    const head = x.slice(0, n);
    // the structural boundaries first (a semicolon or colon, then a joining word); a comma is the last choice, because a comma inside a list leaves the list cut
    let at = -1;
    for (const re of [/[;:]\s/g, /\s(?:and|but|while|so|because|with|for|from|to|across|including)\s/g, /,\s/g]) {
        for (const m of head.matchAll(re))
            if ((m.index ?? 0) >= n * 0.4)
                at = Math.max(at, m.index ?? 0);
        if (at > 0)
            break;
    }
    let cut = at > 0 ? head.slice(0, at) : head.slice(0, Math.max(head.lastIndexOf(' '), Math.floor(n / 2)));
    const open = (cut.match(/\(/g) || []).length - (cut.match(/\)/g) || []).length;
    if (open > 0)
        cut = cut.slice(0, cut.lastIndexOf('(')).trim();
    const w = cut.replace(/[\s,;:.]+$/, '').split(' ');
    while (w.length > 2 && JOIN_END.test(w[w.length - 1].replace(/[,;:]$/, '')))
        w.pop();
    return w.join(' ').replace(/[\s,;:.]+$/, '');
}
const FINITE = /\b(?:is|are|was|were|has|have|had|does|do|did|can|cannot|will|would|should|must|may|might|offers?|provides?|helps?|lets?|gives?|makes?|runs?|needs?|keeps?|sees?|saves?|cuts?|reduces?|increases?)\b/i;
/** Outcome items of a typed outcome text. A piece after a comma starts a new item only when it starts with an outcome verb, a quantity or a comparative; otherwise it
 *  belongs to the item before it ("cost management, modernization and innovation" stays whole, "in seconds, not days" stays whole). */
function outcomeItems(text, kit) {
    const { body, label } = takeLabel(text);
    const items = [];
    for (const p of topLevel(body)) {
        const starts = /^[\d$€£]/.test(p) || kit.kindOf(p) !== 'other';
        // "faster, safer and more accountable change": a lone comparative before a comma is a list of adjectives for one noun, not a result of its own
        const prev = items[items.length - 1] || '';
        const adjective = prev.split(/\s+/).length <= 2 && /^(?:faster|slower|safer|cheaper|simpler|easier|smarter|better|higher|lower|fewer|more|less|quicker|leaner|clearer|stronger|bigger|smaller)\b/i.test(prev) && kit.kindOf(p) === 'noun';
        if (!items.length || (starts && !/^not\b/i.test(p) && !adjective))
            items.push(p);
        else
            items[items.length - 1] += `, ${p}`;
    }
    return { items, label };
}
/** An outcome item as what the customer can do ("get X", "cut Y"); null when the text is not a plain result (a sentence, a gerund, a quoted instruction). */
function asInfinitive(item, kit) {
    const t = item.trim().replace(/[.!]+$/, '');
    if (!t || /^[“"'‘]/.test(t))
        return null;
    const adverb = /^[a-z]+ly\s+/i.test(t) ? t.match(/^[a-z]+ly\s+/i)[0] : '';
    const k = kit.kindOf(adverb ? t.slice(adverb.length) : t);
    if (k === 'base')
        return kit.lowerFirst(t);
    if (k === 'third')
        return adverb ? `${adverb.toLowerCase()}${kit.toBaseVerb(kit.lowerFirst(t.slice(adverb.length)))}` : kit.toBaseVerb(kit.lowerFirst(t));
    if (k === 'noun')
        return `get ${kit.lowerFirst(t)}`;
    const first = (t.split(/\s+/)[0] || '').toLowerCase();
    if (/ing$/.test(first) || FINITE.test(t.split(/\s+/).slice(0, 8).join(' ')))
        return null;
    return `get ${kit.lowerFirst(t)}`;
}
/** The outcome as one clause after "can" or "to"; consecutive "get" items share their verb. null when an item is not a plain result. */
function outcomeClause(items, kit) {
    const parts = [];
    for (const it of items) {
        const inf = asInfinitive(it, kit);
        if (inf === null)
            return null;
        const prev = parts[parts.length - 1];
        if (prev && /^get /.test(prev) && /^get /.test(inf) && !/[,;]/.test(prev) && !/[,;]/.test(inf))
            parts[parts.length - 1] = `${prev} and ${inf.slice(4)}`;
        else
            parts.push(inf);
    }
    return joinAnd(parts);
}
/** The first items of a list that fit in about n characters (at most max), at an item boundary. */
function leadItems(items, n = 150, max = 4) {
    const out = [];
    let len = 0;
    for (const it of items) {
        if (out.length && (out.length >= max || len + it.length > n))
            break;
        out.push(it);
        len += it.length + 2;
    }
    return out;
}
const RECOGNITION = /\b(?:awards?|award[- ]winning|frost radar|gartner|forrester|idc|g2|capterra|trustradius|magic quadrant|analyst|wave|leaders?|named|recogni[sz]ed|ranked|certified|certifications?|soc ?2|iso ?\d{4,5}|finalist|winner|cool vendor|top[- ]rated|customers'? choice)\b/i;
const RESULT = /\b(?:success stor(?:y|ies)|story title|secured|averted|protected|blocked|remediated|detected|uncovered|identified|resolved|eliminated|cut|cuts|reduc\w+|increas\w+|improv\w+|grew|grow\w*|raised|lifted|saved|saving|savings|lower\w*|faster|fewer|unlock\w*|achiev\w+|reach\w*|boost\w*|doubled|halved|shorten\w*|expanded|recovered|closed|won|generated|avoided|prevented|stopped|from \S+ to \S+|up from|down from)\b/i;
const SCALE = /(?:\b(?:rely|relies|trust|trusts|choose|chooses|use|uses|used)\b|\b\d+(?:\.\d+)?%\s+of\s+the\s+(?:largest|top|world's|biggest)|\b\d[\d,.]*\+?\s*(?:[km]\b)?\s*(?:[a-z-]+\s+){0,2}(?:fintechs?|companies|teams|customers|users|brands|businesses|organi[sz]ations|developers|enterprises|merchants|sites|countries|clients|logos|employees|downloads|installs|adults|banks|retailers|shippers|carriers|partners|offices|locations|integrations|sources|customers)\b|\b\d+ in \d+\b|\bbuilt on\b|\btrusted by\b|\bused by\b|\bmore than [\d,]+|\bover [\d,]+|\b[\d,]+\+)/i;
/** What kind of proof a supplied item is, and the tier it belongs to (1 customer result, 2 third party, 4 social). */
function classifyProof(item) {
    const t = item.trim();
    if (/\bquote from\b|\btestimonial\b/i.test(t) || /^["“]/.test(t) || /["“][^"”]{12,}["”]/.test(t))
        return { tier: 4, kind: 'quote' };
    if (RECOGNITION.test(t) && !/^[A-Z][\w-]+(?: [A-Z][\w-]+)? (?:cut|reduced|increased|improved|raised|saved)\b/.test(t))
        return { tier: 2, kind: 'recognition' };
    if (RESULT.test(t) && !/\b(?:rely|relies|trust|trusts)\b/i.test(t))
        return { tier: 1, kind: 'result' };
    if (SCALE.test(t))
        return { tier: 4, kind: 'scale' };
    return /\d/.test(t) ? { tier: 1, kind: 'result' } : { tier: 4, kind: 'scale' };
}
// The measure words of a result, by meaning (stricter than the shared table: a bare "5X" or "in 12 months" is not a time measure).
exports.MEASURE_LINKS = [
    [/uptime|availability|outage|incident/i, /uptime|availability|outage|incident/i],
    [/cost|saving|spend|expense|price|per ticket|per fte|payback|fee/i, /\bcosts?\b|saving|\bsaved\b|expense|\bfees?\b|\bspend\b|payback/i],
    [/error|accuracy|defect|breach|finding|audit|quality|compliance|violation|policy|fraud|risk|return/i, /error|accuracy|defect|compliance|violation|policy|audit|mistake|exposure|fraud|returns?\b/i],
    [/adoption|coverage|calls|productive|usage|utili[sz]ation|active/i, /adoption|coverage|productive|usage|digiti[sz]ed|utili[sz]ation/i],
    [/automation|throughput|release|velocity|frequency|volume/i, /automat|throughput|release|volume/i],
    [/sales|revenue|market share|growth|retention|churn|renewal|expansion|conversion|funding/i, /\bsales\b|revenue|market share|top line|\bgrow|retention|churn|renewal|conversion/i],
];
/** How a call to action reads after "open to": "Request a scoping call" gives "a scoping call". */
function ctaNoun(cta) {
    const t = cta.replace(/\s*\(.*$/, '').trim();
    const m = t.match(/^(?:request|book|get|start|run|ask for|set up)\s+(.*)$/i);
    if (m)
        return m[1].replace(/^(?:an?|the)\s+/i, (x) => x.toLowerCase());
    return /^talk to/i.test(t) ? 'a conversation' : 'a short call';
}
/** The closing list of what is missing: "To sharpen this, give: X (it would change Y); ...". null when nothing is missing. */
function sharpenLine(missing) {
    if (!missing.length)
        return null;
    return `**To sharpen this, give:** ${missing.map((m) => `${m.give} (it would change ${m.changes})`).join('; ')}.`;
}
// A field of work named by a mass noun ("predictive cybersecurity") is not a product; it reads "a provider of predictive cybersecurity".
const FIELD_WORD = /^(?:cybersecurity|security|analytics|intelligence|automation|monitoring|connectivity|compliance|observability|payments|lending|banking|logistics|insurance|forecasting|orchestration|governance|detection|protection|modernization|modernisation|engineering|consulting|outsourcing|management|testing|billing|marketing|finance|data|ai|learning|support)$/i;
function categoryNoun(category) {
    const t = category.trim();
    const bare = t.replace(/\s*\([^)]*\)\s*$/, '');
    if (/^provider of\b/i.test(t))
        return t;
    // the head of the phrase is what comes before its first preposition ("financial data network and financial APIs for building ...")
    const head = bare.split(/\s(?:with|for|of|that|which|in|on|to|from|by|using)\s/i)[0];
    const last = (head.split(/\s+/).pop() || '').replace(/[^A-Za-z]/g, '');
    const lastRaw = head.split(/\s+/).pop() || '';
    const plural = /s$/i.test(lastRaw) && (!/(ss|us|is)$/i.test(lastRaw) || /^[A-Z]{2,}s$/.test(lastRaw)); // "APIs" is a plural, "analysis" is not
    if (plural || FIELD_WORD.test(last))
        return `provider of ${t}`;
    return t;
}
// The audience of a long target text: its words up to the first clause or activity word ("eCommerce merchants and small businesses shipping 10 to 10,000 parcels a month ..." gives
// "eCommerce merchants and small businesses"). null when no clean lead of 2 to 9 words exists.
const AUD_STOP = /^(?:at|in|for|from|with|who|that|which|across|serving|selling|using|between|within|based|shipping|running|building|handling|managing|operating|processing|sending|moving|buying|paying|working|needing|looking|wanting|spending|losing|growing|doing|\d.*)$/i;
function leadAud(text) {
    const w = text.trim().split(/\s+/);
    let end = w.length;
    for (let i = 1; i < w.length; i++)
        if (AUD_STOP.test(w[i].replace(/[,;:]+$/, '')) || /[;:]$/.test(w[i - 1])) {
            end = i;
            break;
        }
    const lead = w.slice(0, end).join(' ').replace(/[\s,;:]+$/, '').split(/\s+/);
    while (lead.length > 2 && JOIN_END.test(lead[lead.length - 1]))
        lead.pop();
    return lead.length >= 2 && lead.length <= 9 && end < w.length ? lead.join(' ') : null;
}
/** A sentence of the sector notes with the words of another business model taken out ("per seat or hour" reads "per hour" for a services firm). */
function noSeatWords(t) {
    return t.replace(/\bper seat or /g, 'per ').replace(/\bseat,\s*/g, '').replace(/\bper seat\b/g, 'per user');
}
/** Strengths typed as one comma list are shared out over the cards (a "(page claims)" note at the end goes with every part); an item without such a list stays whole. */
function splitStrengths(items) {
    const out = [];
    const JOINERS = /^(?:as|with|in|of|for|and|to|that|which|from|by|at|on|plus|but|while|who)\b/i;
    for (const it of items) {
        const note = /\((?:page claims?)\)\s*$/i.test(it) ? ' (page claim)' : '';
        const body = it.replace(/\s*\((?:page claims?)\)\s*$/i, '');
        const all = topLevel(body);
        // a comma list is shared out only when it has at least three items, each of two to nine words and none starting with a joining word ("founded in 2015 as a research-driven, foundational AI company" stays whole)
        const ok = all.length >= 3 && all.every((x) => { const n = x.split(/\s+/).length; return n >= 2 && n <= 14 && !JOINERS.test(x); });
        if (ok)
            out.push(...all.map((x) => x + note));
        else
            out.push(it);
    }
    return out;
}
/** A short label for a long description: no joining word, preposition or half-open verb at its end ("previous freight forwarders working through" gives "previous freight forwarders"). */
function tidyLabel(label) {
    const w = label.trim().split(/\s+/);
    while (w.length > 2 && (JOIN_END.test(w[w.length - 1]) || /^(?:through|using|via|working|relying|running|selling|built|based|only|also|still|not)$/i.test(w[w.length - 1]) || /ing$/i.test(w[w.length - 1])))
        w.pop();
    return w.join(' ').replace(/[,;:]+$/, '');
}
/** A running name for a product typed as a description: when the shared rule leaves one word of it ("cloud-native" from "a cloud-native, composable core banking platform ..."),
 *  the noun phrase before the first clause word is used instead (at most 7 words). A name typed as a name is returned as it came. */
function plainName(text, candidate) {
    const t = text.replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
    const cand = candidate.replace(/^(?:an?|the)\s+/i, ''); // "a cloud-native" is one word of a name, not a name
    if (!candidate || cand.split(/\s+/).length >= 2 || t.split(/\s+/).length <= 3)
        return candidate;
    const w = t.replace(/^(?:an?|the)\s+/i, '').split(/\s+/);
    const stop = w.findIndex((x, i) => i >= 2 && /^(?:that|which|who|where|for|with|by|from|to|connects?|helps?|lets?|gives?|makes?|builds?|runs?|turns?|unifies?|uses?|delivered|provided|offered|powered|built|based)$/i.test(x.replace(/[,;:]+$/, '')));
    const lead = (stop >= 2 ? w.slice(0, stop) : w.slice(0, 5)).slice(0, 7);
    while (lead.length > 2 && JOIN_END.test(lead[lead.length - 1].replace(/[,;:]+$/, '')))
        lead.pop();
    const out = lead.join(' ').replace(/[,;:]+$/, '');
    return out.split(/\s+/).length >= 2 ? out : candidate;
}
// ---- Meaning links: a strength, a part of the product or a weakness is set against another only when they share meaning, not just a letter stem ----------------------
const GENERIC = new Set(('platform solution solutions service services system systems provider providers market share customer customers business businesses global enterprise data company companies product products tools tool software digital technology based using their from that with your have more than most over into about through across each every high real time rate fast faster speed cost costs days page claims claim years year first single many multiple other same also only such like leading best large small new help helps work works need needs make makes take takes keep keeps give gives get gets built build ' +
    'bank banks banking people lets companies connect connects network layer one two three four five manual automated decisions legacy various multiple judged human').split(/\s+/));
const keyOf = (w) => w.replace(/(?:ies|es|s)$/, '').slice(0, 5);
function specificKeys(text) {
    const m = new Map();
    for (const w of (text.toLowerCase().match(/[a-z]{4,}/g) || []))
        if (!GENERIC.has(w))
            m.set(keyOf(w), Math.max(m.get(keyOf(w)) || 0, w.length >= 6 ? 2 : 1));
    return m;
}
// Pairs of word groups that mean the same thing from two sides (the left describes what the seller offers, the right what the buyer suffers), in both directions.
const CONCEPTS = [
    [/\b(?:one|single|unified|integrated|all[- ]in[- ]one|end[- ]to[- ]end|connected|one platform)\b.*\b(?:contract|team|platform|api|vendor|partner|view|source|system|workflow)\b|\b(?:unif\w+|consolidat\w+)\b/i, /\b(?:fragment\w*|silo\w*|separate|disconnected|stitched|(?:many|several|multiple|separate) (?:\w+ )?(?:tools|vendors|providers|suppliers|channels|partners|systems|files|carriers|portals)|one by one|gaps? between|accountab\w*|handoffs?|point tools?)\b/i],
    [/\b(?:blockchain|ledger|audit trail|traceab\w*|tamper\w*)\b/i, /\b(?:traceab\w*|trace|tamper\w*|audit\w*|evidence)\b/i],
    [/\b(?:real[- ]time|instant|rtp|fednow|same[- ]day|live)\b/i, /\b(?:delay\w*|slow\w*|days|settlement|waiting|overnight|batch)\b/i],
    [/\b(?:uptime|availability|failover|redundan\w*|sla)\b/i, /\b(?:outage\w*|downtime|unreliable|unreliab\w*|disconnect\w*|drops?|fail\w*)\b/i],
    [/\b(?:accura\w*|validate\w*|verified|confidence)\b/i, /\b(?:false positives?|inaccura\w*|errors?|noisy|noise|guess\w*|theoretical)\b/i],
    [/\b(?:adaptive|machine learning|ai[- ]\w+|learns?|models?|intelligent|smart)\b/i, /\b(?:rule[- ]based|static|fixed|slow to adapt|manual|keyword based|one[- ]size)\b/i],
    [/\b(?:automat\w*|workflow|orchestrat\w*)\b/i, /\b(?:manual|by hand|spreadsheets?|email threads?|admin)\b/i],
    [/\b(?:visibility|tracking|dashboard|reporting|insight\w*)\b/i, /\b(?:blind|no (?:view|visibility)|unreported|low reporting|can'?t see|cannot see|opaque|problems coming)\b/i],
    [/\b(?:sovereign|data residency|self[- ]hosted|on[- ]prem\w*|in[- ]country)\b/i, /\b(?:data leaves|residency|privacy|sovereign\w*|compliance)\b/i],
];
/** How strongly two texts are about the same thing: shared specific words (1 each, 2 for a word of six letters or more) plus 2 for a meaning pair. 0 means no link. */
function linkScore(a, b) {
    const ka = specificKeys(a), kb = specificKeys(b);
    let n = 0;
    for (const [k, wt] of ka)
        if (kb.has(k))
            n += Math.min(wt, kb.get(k));
    for (const [l, r] of CONCEPTS)
        if ((l.test(a) && r.test(b)) || (l.test(b) && r.test(a))) {
            n += 2;
            break;
        }
    return n;
}
/** The fragments of a product description that can stand as a lead: the items after a colon or "with", a clause after "under" or "on" (Linkly style lists keep their brackets whole). */
function productParts(desc) {
    const out = [];
    const t = desc.replace(/\s+/g, ' ').trim();
    const [first, ...rest] = t.split(/\s*[:;]\s+|\s+(?:including|made of|made up of|consisting of|comprising|with)\s+/i);
    // the lead description stays whole, without the brand names in front of "a ..." ("Quikly from Quikpay Platforms, Quikly, a single API led platform ..." gives "a single API led platform ...")
    const lead = first.replace(/^(?:[^,]{1,60},\s+){1,2}(?=(?:an?|the)\s)/, '').replace(/\s+(?:that|which|who)(?:\s+\w+)?$/i, '').trim(); // no half-open tail ("... platform that connects")
    if (lead.split(/\s+/).length >= 2)
        out.push(lead);
    for (const seg of rest)
        for (const piece of topLevel(seg))
            for (const f of piece.replace(/\([^)]*\)/g, (m) => m.replace(/ /g, '\u0001')).split(/\s+and\s+(?=[A-Z])|\s+under\s+/)) { // a bracket is never split
                const x = f.replace(/\u0001/g, ' ').replace(/^(?:and|or|with|including)\s+/i, '').trim();
                if (x && (x.split(/\s+/).length >= 2 || /^[A-Z][a-z]+/.test(x)) && !out.includes(x))
                    out.push(x);
            }
    return out;
}
/** Facts about the company that are not a reason to choose it (a funding round, a founding year, headcount). */
function isCompanyFact(s) {
    return /\b(?:founded in|raised|funding|series [a-f]\b|valuation|investors?|headquarter\w*|employees|since \d{4}|ipo|publicly listed)\b/i.test(s);
}
/** The brand at the start of a description ("Linkly, a financial data network ..." gives "Linkly"; "Quikly from Quikpay Platforms, Quikly, ..." gives "Quikly from Quikpay Platforms"), or the fallback. */
function brandName(desc, fallback) {
    const t = desc.replace(/\s*\([^)]*\)/g, '').trim();
    const m = t.match(/^([A-Z][^,:;]{1,60}?),\s+(\S+)/);
    // a single capitalised word is a brand only when an article follows ("Linkly, a financial data network"); "Operations, data and customer services" is a list
    if (m && (m[1].split(/\s+/).length >= 2 || /^(?:an?|the)$/i.test(m[2])) && m[1].split(/\s+/).length <= 8 && /^[A-Z]/.test(m[1]) && !/\b(?:is|are|that|which|who)\b/.test(m[1]))
        return m[1].trim();
    return fallback;
}
/** A role read from a committee sentence is used only when it reads as a role: short, no verb or sentence glue, no half-open end ("finance and executive assistants are often the targets and" is not one). */
function roleOk(r) {
    const t = (r || '').trim();
    if (!t || t.length > 70 || t.split(/\s+/).length > 9)
        return '';
    if (/[.:;()]/.test(t) || /\b(?:is|are|was|were|often|usually|typically|who|that|which|because|when|while|can|will|may|must|should)\b/i.test(t))
        return '';
    if (JOIN_END.test(t.split(/\s+/).pop() || ''))
        return '';
    return t;
}
// ---- Segments: cue words only. A cue pair says "a product part with these words may matter to a segment with those words"; the answer words it as a question, never as a fact. ----
const SEGMENT_CUES = [
    [/\b(?:bank\w*|financ\w*|insur\w*|lending|nbfc|fintech|payments?|bfsi)\b/i, /\b(?:compliance|fraud|kyc|aml|risk|payments?|ledger|reconcil\w*|audit\w*|regulat\w*|underwrit\w*|lend\w*|credit|collections?|banking)\b/i],
    [/\b(?:government|public sector|ministr\w*|municipal\w*|defen[cs]e|state)\b/i, /\b(?:sovereign\w*|data residency|compliance|local language\w*|indic|on[- ]prem\w*|audit\w*|citizen\w*|document\w*|translation|speech)\b/i],
    [/\b(?:educat\w*|school\w*|universit\w*|college\w*|learning|edtech)\b/i, /\b(?:learn\w*|student\w*|language\w*|content|translation|teach\w*|exam\w*|speech)\b/i],
    [/\b(?:retail\w*|e-?commerce|merchant\w*|shop\w*|consumer|fmcg|grocery|apparel)\b/i, /\b(?:checkout|catalog\w*|inventory|delivery|shipping|returns?|storefront|orders?|pos|billing|loyalty)\b/i],
    [/\b(?:telecom\w*|telco\w*|operators?|isp)\b/i, /\b(?:network\w*|sms|voice|messaging|connectivity|sim|routing|spam|fraud)\b/i],
    [/\b(?:technology|software|saas|tech|developer\w*|startups?)\b/i, /\b(?:api\w*|sdk|developer\w*|integration\w*|automation|cloud|testing|ci|devops)\b/i],
    [/\b(?:apps?|games?|gaming|mobile)\b/i, /\b(?:sdk|apps?|mobile|games?|over-the-air|ota|release\w*|store)\b/i],
    [/\b(?:media|publishing|broadcast\w*|entertainment|news|streaming)\b/i, /\b(?:content|translation|subtitl\w*|caption\w*|articles?|publishing|voice|speech|audio|video)\b/i],
    [/\b(?:e-?commerce|online (?:stores?|sellers?|retail\w*)|merchants?)\b/i, /\b(?:websites?|storefront|catalog\w*|product pages?|checkout|shipping|orders?|shop\w*)\b/i],
    [/\b(?:manufactur\w*|industrial|automotive|chemical\w*|machinery|factory|factories)\b/i, /\b(?:plant|supply chain|maintenance|quality|inspection|traceab\w*|logistics|freight|shipments?)\b/i],
];
/** The parts of a product description whose words sit close to a segment's name: shared words, or a cue pair. At most three. */
function segmentFit(segment, parts) {
    const seg = segment.replace(/\([^)]*\)/g, ' ');
    const scored = parts.map((x, i) => {
        let n = 0;
        const ks = specificKeys(seg), kx = specificKeys(x);
        for (const [k, wt] of ks)
            if (kx.has(k))
                n += Math.min(wt, kx.get(k));
        // the lead description (the first part) counts by shared words only; a cue pair is read on the named parts after it
        if (i > 0)
            for (const [l, r] of SEGMENT_CUES)
                if (l.test(seg) && r.test(x)) {
                    n += 2;
                    break;
                }
        return { x, n };
    }).filter((r) => r.n >= 2).sort((a, b) => b.n - a.n);
    return scored.slice(0, 3).map((r) => r.x);
}
const SEGMENT_PARENTS = [
    [/\bfinanci\w*/i, /\b(?:banking|banks?|insur\w*|lending|nbfc|fintech|payments?|asset|wealth|bfsi)\b/i],
    [/\bmanufactur\w*/i, /\b(?:automotive|chemical\w*|machinery|industrial|electronics|steel)\b/i],
    [/\b(?:technology|software)\b/i, /\b(?:saas|cloud|cyber\w*|telecom\w*|it services)\b/i],
    [/\bretail\b/i, /\b(?:fmcg|apparel|grocery|department stores|luxury retail|food and beverage)\b/i],
];
/** Notes on segments that overlap: "Banking" inside "Financial services". */
function segmentOverlap(names) {
    const out = [];
    const done = new Set();
    for (const a of names) {
        const kids = new Set();
        for (const b of names)
            if (a !== b)
                for (const [pr, ch] of SEGMENT_PARENTS)
                    if (pr.test(a) && ch.test(b) && !pr.test(b))
                        kids.add(b);
        if (kids.size && !done.has(a)) {
            done.add(a);
            out.push(`${joinAnd([...kids])} may sit inside ${a}: decide whether you treat ${kids.size > 1 ? 'them' : 'it'} as part of ${a} or as ${kids.size > 1 ? 'segments' : 'a segment'} of ${kids.size > 1 ? 'their' : 'its'} own before you rank them.`);
        }
    }
    return out;
}
const SEG_TYPES = [
    ['education', /\b(?:education\w*|school\w*|universit\w*|college\w*|edtech)\b/i],
    ['public', /\b(?:government|public sector|ministr\w*|municipal\w*|defen[cs]e|state[- ]owned|non-?profit|ngo)\b/i],
    ['regulated', /\b(?:bank\w*|financ\w*|insur\w*|lending|nbfc|fintech|payments?|bfsi|asset|wealth|pension\w*|capital markets?)\b/i],
    ['large', /\b(?:enterprise\w*|large|global|fortune|multinational)\b/i],
    ['small', /\b(?:smb|small|startups?|micro|sole)\b/i],
    ['mid', /\b(?:mid[- ]?market|mid[- ]?size\w*|medium)\b/i],
    ['industrial', /\b(?:manufactur\w*|industrial|automotive|chemical\w*|machinery|factory|factories|energy|oil|mining|steel|construction|utilit\w*)\b/i],
    ['retail', /\b(?:retail\w*|e-?commerce|merchant\w*|consumer|fmcg|grocery|apparel|food|beverage|hospitality|restaurant\w*|travel|luxury|department stores?)\b/i],
    ['tech', /\b(?:technology|software|saas|tech|developer\w*|it services|cloud|ai|apps?|games?|gaming|digital)\b/i],
    ['telecom', /\b(?:telecom\w*|telco\w*|operators?|isp|carriers?)\b/i],
    ['media', /\b(?:media|publishing|broadcast\w*|entertainment|news)\b/i],
];
function segmentType(name) {
    const t = name.replace(/\([^)]*\)/g, ' ');
    for (const [k, re] of SEG_TYPES)
        if (re.test(t))
            return k;
    return 'other';
}
const PREFS = {
    education: ['cycle', 'product', 'signer', 'measure'],
    public: ['cycle', 'signer', 'objection', 'product'],
    regulated: ['objection', 'cycle', 'signer', 'measure'],
    large: ['signer', 'cycle', 'pilot', 'objection'],
    small: ['cycle', 'pilot', 'measure', 'product'],
    mid: ['signer', 'pilot', 'measure', 'cycle'],
    industrial: ['pilot', 'measure', 'cycle', 'signer'],
    retail: ['measure', 'pilot', 'product', 'signer'],
    tech: ['product', 'pilot', 'objection', 'signer'],
    telecom: ['measure', 'product', 'cycle', 'objection'],
    media: ['product', 'measure', 'signer', 'pilot'],
    other: ['product', 'measure', 'signer', 'cycle', 'pilot'],
};
const OBJ_WORDS = {
    education: /cost|budget|price|data|adoption|teacher|staff|time/i,
    public: /cost|budget|data|local|price|complian\w*|regulat\w*|security|licen\w*/i,
    regulated: /complian\w*|regulat\w*|security|licen\w*|risk|audit|data/i,
    large: /integrat\w*|security|system|already|switch\w*|approval/i,
    small: /cost|effort|time|price|trial|already|expensive/i,
    mid: /integrat\w*|already|cost|adoption|team/i,
    industrial: /integrat\w*|operations|change|system|cost|site/i,
    retail: /price|cost|integrat\w*|already|channel|peak/i,
    tech: /already|integrat\w*|security|build|open|switch\w*/i,
    telecom: /price|reliab\w*|switch\w*|migrat\w*|complian\w*/i,
    media: /cost|rights|already|integrat\w*|quality/i,
    other: /already|cost|integrat\w*/i,
};
const METRIC_WORDS = {
    education: /adoption|coverage|cost|accuracy|resolution|time/i,
    public: /coverage|adoption|cost|uptime|accuracy|resolution|audit/i,
    regulated: /complian\w*|audit|risk|breach|fraud|exposure|uptime|false|error|escalat\w*/i,
    large: /adoption|uptime|cost|audit|coverage/i,
    small: /cost|time to|adoption/i,
    mid: /adoption|cost|cycle/i,
    industrial: /cost|cycle|error|throughput|uptime|on time|delay|exception/i,
    retail: /conversion|delivery|cost|cycle|satisf\w*|resolution|return/i,
    tech: /release|latency|uptime|error rate|accuracy|adoption/i,
    telecom: /delivery|uptime|latency|repair|cost/i,
    media: /accuracy|cost|latency|quality/i,
    other: /cost|time to|cycle/i,
};
/** A part of a product description that carries a product name ("RapidX for AI driven development", "Auth (verify bank account numbers)"), not a plain phrase ("AI enhanced engineering teams"). */
function isNamedPart(x) {
    return /^(?!AI\b)[A-Z][A-Za-z0-9]{2,}(?:\s+[A-Z][A-Za-z0-9]+)?\s*(?:\(|\bfor\b|\bto\b|\bas\b|\bby\b|$)/.test(x.trim());
}
const firstClause = (t) => t.replace(/\s+/g, ' ').split(/;\s|\.\s/)[0].replace(/[.]+$/, '').trim();
function pilotPhrase(motion) {
    const m = motion.match(/\b(?:(?:a|an)\s+)?(?:paid\s+)?(?:pilot|trial|proof of value|back test|sandbox|demo|discovery stage|parallel pay run)[^;,.]*/i);
    if (!m)
        return '';
    let t = m[0].trim().replace(/^./, (x) => x.toLowerCase());
    while ((t.match(/\)/g) || []).length > (t.match(/\(/g) || []).length)
        t = t.replace(/\)\s*$/, '').trim(); // a bracket cut in the middle is not carried over
    return /^(?:a|an) /.test(t) ? t : `a ${t}`;
}
/** Two or three facts to find out about one segment, taken from the sector notes and the user's own inputs; `order` is the position among segments of the same kind, so two such segments differ. */
function segmentFacts(c, order) {
    const type = segmentType(c.seg);
    const deal = c.deal || 'your price', cycle = c.cycle || 'your sales cycle';
    const pool = {};
    const steps = c.motion.split(/;\s+|,\s+then\s+|\.\s+/).map((x) => x.replace(/[.]+$/, '').trim().replace(/^./, (y) => y.toLowerCase())).filter((x) => x.length > 12);
    pool.cycle = {
        education: `whether a purchase of ${deal} in ${c.seg} is an institution budget decision or needs a committee or a tender, and whether it waits for the start of a term or a budget year, against ${cycle}`,
        public: `whether a purchase of ${deal} in ${c.seg} is a department decision or goes through a formal tender or procurement round, and how long that takes against ${cycle}`,
        regulated: `how long the security, vendor risk and compliance review takes in ${c.seg} before a purchase of ${deal} can be signed, against ${cycle}`,
        large: `whether procurement and a security review join a purchase of ${deal} in ${c.seg}, and what that does to ${cycle}`,
        small: `whether one owner or department head in ${c.seg} can decide a purchase of ${deal} alone, and whether ${cycle} is longer than they need`,
        mid: `which department head in ${c.seg} holds a budget of ${deal}, and whether they decide inside ${cycle}`,
        industrial: `how long a purchase of ${deal} takes in ${c.seg} from first call to signature, and whether a site visit or plant approval adds to ${cycle}`,
        retail: `whether a purchase of ${deal} in ${c.seg} is timed around a peak season or a budget year, and how that fits ${cycle}`,
        tech: `whether a team in ${c.seg} can start on its own and how long a company decision on ${deal} takes after that, against ${cycle}`,
        telecom: `how long a purchase of ${deal} takes in ${c.seg} from first test to contract, against ${cycle}`,
        media: `who approves a purchase of ${deal} in ${c.seg} and how long it takes, against ${cycle}`,
        other: `how long a purchase of ${deal} takes in ${c.seg} from first call to signature, against ${cycle}${steps.length ? ` (the sector notes describe the usual path in steps; one of them is: ${steps[order % steps.length]})` : ''}`,
    }[type];
    pool.signer = c.signer
        ? `who signs ${deal} in ${c.seg}: the sector notes say "${c.signer}", so ask whether that holds here${type === 'large' || type === 'public' || type === 'regulated' ? ' or whether a committee approves it' : ' and whether that person alone approves it'}`
        : `who signs ${deal} in ${c.seg}, and whether that person alone approves it`;
    const pilot = pilotPhrase(c.motion);
    pool.pilot = pilot ? `whether ${pilot} is how ${c.seg} buyers start, and whether it fits inside ${cycle}` : null;
    const ow = OBJ_WORDS[type];
    const rankedO = c.objections.map((o, i) => ({ o, n: (`${o.objection} ${o.response}`.match(new RegExp(ow.source, 'gi')) || []).length * 10 - i })).sort((x, y) => y.n - x.n).map((x) => x.o);
    const o = rankedO.find((x) => !c.usedObjections.has(x.objection)) || rankedO[0] || null;
    pool.objection = o ? `the objection to expect in ${c.seg}: "${o.objection}", with this pattern of answer from the sector notes: ${firstClause(o.response).replace(/^./, (x) => x.toLowerCase())}` : null;
    const mw = METRIC_WORDS[type];
    const ms = c.metrics.filter((m) => mw.test(m));
    const m1 = ms.find((m) => !c.usedMeasures.has(m)) || '';
    pool.measure = m1 ? `which measure ${c.seg} buyers would judge you on, for example ${m1}, and whether they already track it` : null;
    const namedParts = c.parts.filter(isNamedPart);
    const pf = c.fit.length ? c.fit : namedParts.slice(0, 3);
    pool.product = pf.length >= 1 && (c.fit.length || namedParts.length >= 2) ? (pf.length === 1 ? `whether ${c.seg} buyers name "${partLabel(pf[0])}" first` : `which of ${joinAnd(pf.map((x) => `"${partLabel(x)}"`))} ${c.seg} buyers name first`) : null;
    // The kinds of fact this segment's kind of buyer is asked about first; a kind already used for another segment of the same kind comes later, so two such segments differ.
    const prefs = [...PREFS[type], ...['cycle', 'signer', 'objection', 'pilot', 'measure', 'product'].filter((k) => !PREFS[type].includes(k))];
    // the buying cycle against the user's cycle is always asked (its wording follows the kind of buyer); one or two more facts follow, in the order this kind of buyer is asked
    const ranked = prefs.map((k, i) => ({ k, i, used: c.usedKinds.get(`${type}:${k}`) || 0 })).filter((r) => pool[r.k] && r.k !== 'cycle').sort((x, y) => x.used - y.used || x.i - y.i).slice(0, 2);
    const chosen = [{ k: 'cycle', i: prefs.indexOf('cycle'), used: 0 }, ...ranked].sort((x, y) => x.i - y.i);
    const out = [];
    for (const r of chosen) {
        const f = pool[r.k];
        if (f && !out.includes(f)) {
            out.push(f);
            if (r.k !== 'cycle')
                c.usedKinds.set(`${type}:${r.k}`, r.used + 1);
        }
    }
    for (const k of ['signer']) {
        const f = pool[k];
        if (out.length < 2 && f && !out.includes(f))
            out.push(f);
    }
    if (o && pool.objection && out.includes(pool.objection))
        c.usedObjections.add(o.objection);
    if (m1 && pool.measure && out.includes(pool.measure))
        c.usedMeasures.add(m1);
    return out;
}
/** A part of a product description as a short label: a long lead sentence is cut before its first clause word ("an AI localization and translation management platform that connects to ..." gives "an AI localization and translation management platform"). */
function partLabel(x) {
    const t = x.trim();
    if (t.length <= 70)
        return t;
    const head = t.split(/\s(?:that|which|who|so|to|with|for)\s/)[0].trim();
    return head.split(/\s+/).length >= 3 && head.length <= 90 ? head : clip(t, 70);
}
//# sourceMappingURL=rw-impact.js.map