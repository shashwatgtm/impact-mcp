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
// A source label at the end of a typed text: "(page claim)", "(case study)", "(hypothetical)", "(quote from the head of payments at X)".
const LABEL = /\s*\(([^()]*\b(?:page claims?|hypothetical|customer stor(?:y|ies)|story titles?|case stud(?:y|ies)|analyst reports?|press release|quote from|testimonial|review sites?|sources?)\b[^()]*)\)\s*[.!]?\s*$/i;
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
    [/cycle|time to|lead time|turnaround|handling time|approval|speed|latency|repair|resolve|planning time|build time|sites live|settlement|first live/i, /\b\d+(?:\.\d+)?x\s+(?:faster|quicker)|\bfaster\b|half the time|\bquicker\b/i],
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
    for (const it of items) {
        const note = /\((?:page claims?)\)\s*$/i.test(it) ? ' (page claim)' : '';
        const body = it.replace(/\s*\((?:page claims?)\)\s*$/i, '');
        const parts = topLevel(body).filter((x) => x.split(/\s+/).length >= 2);
        if (parts.length >= 2 && topLevel(body).length === parts.length)
            out.push(...parts.map((x) => x + note));
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
    if (!candidate || candidate.split(/\s+/).length >= 2 || t.split(/\s+/).length <= 3)
        return candidate;
    const w = t.replace(/^(?:an?|the)\s+/i, '').split(/\s+/);
    const stop = w.findIndex((x, i) => i >= 2 && /^(?:that|which|who|where|for|with|by|from|to|connects?|helps?|lets?|gives?|makes?|builds?|runs?|turns?|unifies?|uses?|delivered|provided|offered|powered|built|based)$/i.test(x.replace(/[,;:]+$/, '')));
    const lead = (stop >= 2 ? w.slice(0, stop) : w.slice(0, 5)).slice(0, 7);
    while (lead.length > 2 && JOIN_END.test(lead[lead.length - 1].replace(/[,;:]+$/, '')))
        lead.pop();
    const out = lead.join(' ').replace(/[,;:]+$/, '');
    return out.split(/\s+/).length >= 2 ? out : candidate;
}
//# sourceMappingURL=rw-impact.js.map