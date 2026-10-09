// Run 22 rewrite of impact_craft_message and impact_translate_execution: text helpers only.
// Everything here is pure string work (no network, no file access, no environment, no logging). It reads the shape of what a user typed (a result, a problem, a
// difference, an alternative, an audience with its notes) and puts the pieces into clean sentences. It holds no sector knowledge (that stays in verticals.ts, rule B82)
// and never adds a figure, a customer, a competitor fact or a promise: a figure the user gave keeps its source label.
import { takeLabel, topLevel, joinAnd, clip, outcomeItems, asInfinitive, classifyProof, leadAud, type Kit } from './rw-impact.ts';

export interface Kit2 extends Kit { capFirst(t: string): string; mid(t: string): string; noNotes(t: string): string; shortAud(t: string): string }

/** A phrase of the user's with its source label ("(page claim)") kept apart. */
export interface Piece { text: string; label: string }
export const partText = (p: Piece): string => (p.label ? `${p.text} ${p.label}` : p.text);
const hasFigure = (t: string): boolean => /\d/.test(t);
const WS = (t: string): string => t.replace(/\s+/g, ' ').trim();
const endStop = (t: string): string => t.replace(/[\s,;:]+$/, '').replace(/[.!]+$/, '');
/** A sentence: first letter up (a word with an inner capital such as eBay is kept), one full stop. */
export function sentence(t: string, kit: Kit2): string {
  const x = endStop(WS(t));
  if (!x) return '';
  return `${kit.capFirst(x)}${/[?"”)]$/.test(x) && /[?]$/.test(x) ? '' : '.'}`;
}

// ---- the shape of a phrase -------------------------------------------------------------------------------------------------------
// Result verbs that the shared table (kindOf) does not hold; a phrase that starts with one is a result written as an action.
const EXTRA_VERBS = new Set('act free end accelerate allow consolidate centralise centralize standardise standardize extend gain drive maximise maximize minimise minimize optimise optimize strengthen widen empower equip predict disrupt keep deliver ship scale lift cut stop shorten simplify unify give take make let bring put reach build fix find see know push pull manage handle win land run track'.split(' '));
const ADVERB = /^[a-z]+ly\s+/i;
// Finite verbs that are rarely anything else: after a subject they make the phrase a clause.
const STRONG = new Set('is are was were has have had can cannot will would should must may might does do did arrives arrive breaks break spreads spread comes come lacks lack wants want expects expect suffers suffer relies rely drifts drift captures happens happen causes cause piles pile hands hand fails fail loses lose spends spend juggles juggle bleeds bleed chases chase needs need leaves leave creates create forces force slows slow stays stay sits sit falls fall struggles struggle becomes become remains remain requires require includes include makes make takes take gives give let lets keeps keep shows show finds find knows know offers offer provides provide helps help connects connect combines combine delivers deliver automates automate supports support enables enable reduces reduce saves save raises raise runs run learns learn validates validate captures turns turn tracks track sends send sees see'.split(' '));
// Words that can be a verb or a noun: they count as a verb only after a plural noun or a name ("teams manage", "AI agents run").
const AFTER_PLURAL = new Set('manage handle run work move use rank track plan score test order price load pick pay bill hold grow rise cost lead end result miss wait try trust mean waste face go fall'.split(' '));
const NEED_VERBS = new Set('bleed lose waste chase juggle spend struggle miss wait drown rely depend burn leak guess hunt scramble wrestle pay fight stitch patch copy re-key rekey retype chase reconcile'.split(' '));
// Verbs in the third person that the shared table does not know ("owns every layer of the stack", "deploys on cloud"): a difference that starts with one reads "<product> owns ...".
export const THIRD_MORE = new Set('owns deploys runs handles supports ships tracks keeps lets gives makes uses learns adapts scales connects combines unifies automates detects blocks routes monitors validates ranks generates captures integrates secures protects delivers replaces removes cuts reduces speeds simplifies finds sees shows turns builds works stays operates manages controls checks flags syncs scans prevents enforces ensures covers includes spans wraps embeds exposes supplies serves bills charges prices pays settles reconciles approves collects sends receives stores hosts exports imports maps matches merges splits sorts filters enriches scores predicts recommends suggests drafts writes reads translates transcribes records analyses analyzes measures reports alerts notifies escalates assigns allocates schedules plans optimises optimizes personalises personalizes tailors calls dials routes books cleans cleanses verifies authenticates encrypts masks isolates fixes patches updates upgrades migrates moves transfers backs restores recovers'.split(' '));
export type Shape = 'verb' | 'gerund' | 'noun' | 'clause' | 'np';
/** What a typed phrase is, so it can be put into a sentence of ours: a result verb ("cut cost"), a gerund ("overpaying for shipping"), a noun phrase that starts with a quantity,
 *  comparative or adjective ("fewer late deliveries"), a clause with its own verb ("most tools hand teams thousands of findings"), or another noun phrase. */
export function shapeOf(text: string, kit: Kit2): Shape {
  const t = endStop(WS(text));
  const adv = (t.match(ADVERB) || [''])[0];
  const w = t.slice(adv.length).split(/\s+/);
  const first = (w[0] || '').toLowerCase().replace(/[^a-z-]/g, '');
  const k = kit.kindOf(adv ? t.slice(adv.length) : t);
  // "clean, developer-friendly APIs": a word followed by a comma is an adjective in a list, not a result verb
  if ((k === 'base' || k === 'third' || NEED_VERBS.has(first) && w.length > 1 || EXTRA_VERBS.has(first) && !STRONG.has(w[1] || '')) && !/^[A-Za-z-]+,/.test(adv ? t.slice(adv.length) : t)) return 'verb';
  if (/^[a-z]+ing$/.test(first) && first.length > 5 && !/^(?:billing|during|nothing|something|anything|everything|morning|evening|building|ceiling|pricing|marketing|accounting|engineering|consulting|outsourcing|holding|trading|banking|lending|testing|planning|reporting|training|onboarding|manufacturing|logistics)$/.test(first)) return 'gerund';
  // a subject followed by a finite verb is a clause
  for (let i = 1; i < Math.min(w.length, 7); i++) {
    const x = (w[i] || '').toLowerCase().replace(/[^a-z]/g, '');
    const prev = (w[i - 1] || '').replace(/[^A-Za-z]/g, '');
    // the verb of a clause follows its subject; a preposition or a relative word ends the subject, and what comes after belongs to a noun phrase ("a view that dispatchers trust")
    if (/^(?:of|for|with|in|to|on|by|from|at|that|which|who|whose|where|across|between|within|per|via|without|into|onto|over|under)$/.test(x) && !STRONG.has(x)) break;
    if (/^(?:and|or|the|a|an)$/i.test(prev)) continue;
    if (STRONG.has(x) && (kit.kindOf(x) !== 'noun')) return 'clause';
    if (AFTER_PLURAL.has(x) && (/s$/i.test(prev) && !/(?:ss|us|is)$/i.test(prev) || /^[A-Z][A-Za-z0-9]*$/.test(prev) && /^[A-Z]{2,}/.test(prev))) return 'clause';
  }
  if (/[;]/.test(t) && /\b(?:so|because|while)\b/.test(t)) return 'clause';
  return k === 'noun' ? 'noun' : 'np';
}
/** The same result verb in its base form ("acts before ..." and "act before ..." both give "act before ..."). */
export function baseForm(t: string, kit: Kit2): string {
  const x = kit.lowerFirst(endStop(WS(t)));
  return kit.kindOf(x) === 'third' ? kit.toBaseVerb(x) : x;
}

/** A sentence registry: the same sentence (seven words or more) is never written twice; each slot offers alternatives, the first unused one wins. */
export function makeFresh(): (...alts: string[]) => string {
  const used = new Set<string>();
  const norm = (x: string): string => x.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const sents = (x: string): string[] => x.split(/(?<=[.!?])\s+|\n+/).map(norm).filter((y) => y.split(' ').length >= 7);
  return (...alts: string[]): string => {
    const pick = alts.find((a) => a && sents(a).every((y) => !used.has(y))) ?? alts[alts.length - 1];
    sents(pick).forEach((y) => used.add(y));
    return pick;
  };
}

// ---- a benefit: a headline, a list of results, and figures the page claims ---------------------------------------------------------------
export interface Benefit { headline: string; parts: Piece[]; claims: Piece[] }
const CLAIM_LEAD = /^(?:examples?\s+(?:the\s+)?(?:pages?|site|websites?)\s+(?:gives?|shows?|lists?)\s+(?:are|is)\s+|(?:the\s+)?(?:[\w-]+\s+){0,2}?(?:pages?|site|websites?)\s+(?:states?|says?|claims?|reports?|lists?|shows?|mentions?)\s+(?:that\s+)?)/i;
const STUDY_LEAD = /^(?:an?\s+|the\s+)?[A-Z][\w-]*(?:\s+[A-Z][\w-]*){0,5}\s+(?:study|survey|report|analysis|review)\b.*\b(?:found|shows?|showed|reports?|reported)\b/;
function splitSemi(text: string): string[] {
  const out: string[] = [];
  let depth = 0; let cur = '';
  for (const ch of text.replace(/\n+/g, '; ')) {
    if (ch === '(' || ch === '[') depth++; else if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1);
    if (ch === ';' && depth === 0) { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur);
  return out.map((x) => x.trim()).filter(Boolean);
}
/** The results of a segment as parts. A label sitting after every item belongs to its item; one label at the very end belongs to every figure of the segment. */
function partsOf(seg: string, kit: Kit2): Piece[] {
  const labelsInside = (seg.match(/\((?:[^()]*\b(?:page claims?|case stud(?:y|ies)|hypothetical|customer stor(?:y|ies)|story titles?|analyst reports?|sources?)\b[^()]*)\)/gi) || []).length;
  const oc = outcomeItems(seg, kit);
  // an item that holds several results written with verbs the shared table does not know ("avoid X, free up Y") is cut at the comma before the next verb
  const regroup = (it: string): string[] => {
    const groups: string[] = [];
    for (const piece of topLevel(it)) {
      if (groups.length && shapeOf(piece, kit) === 'verb' && shapeOf(groups[groups.length - 1], kit) === 'verb') groups.push(piece); else if (groups.length) groups[groups.length - 1] += `, ${piece}`; else groups.push(piece);
    }
    return groups;
  };
  // "deliver accuracy, speed and scalability": a word that is a verb or a noun, followed by "and", belongs to the list before it
  const merged: string[] = [];
  for (const it of oc.items.flatMap((x) => (x.includes('(') ? [x] : regroup(x)))) {
    const [w0, w1] = it.trim().split(/\s+/);
    if (merged.length && /^(?:speed|scale|cost|plan|order|price|test|score|balance|load|pick|run|track|handle|manage|support|control|quality|access|time)$/i.test(w0 || '') && /^(?:and|or)$/i.test(w1 || '')) merged[merged.length - 1] += `, ${it}`; else merged.push(it);
  }
  const items = merged.map((x) => takeLabel(x));
  const own = items.filter((x) => x.label).length + (oc.label ? 1 : 0);
  return items.map((it, i) => {
    let label = it.label;
    if (!label && oc.label && (i === items.length - 1 || (labelsInside <= 1 && own <= 1 && hasFigure(it.body)))) label = oc.label;
    return { text: it.body.replace(/^[\s,;:]+|[\s,;:]+$/g, ''), label };
  }).filter((p) => p.text);
}
const CUSTOMER_RESULT = new RegExp('^(?:customers?|clients?|users?|merchants?|teams?)\\s+(?:say|said|report|reported|see|saw)\\b.*\\b[a-z]{3,}ed\\b|^(?:(?:one|a|an|the|\\d+)\\s+(?:[a-z-]+\\s+){0,3}(?:customer|client|merchant|bank|retailer|company|team|brand|partner|user|firm|operator|carrier|shipper|seller)s?|[A-Z][\\w-]*(?:\\s+[A-Z][\\w-]*){0,3})\\s+(?:went|grew|rose|fell|dropped|moved|reached|achieved|saved|cut|reduced|increased|improved|boosted|lifted|raised|doubled|halved|launched|gained|won|got|saw|[a-z]{3,}ed)\\b');
export function parseBenefit(text: string, kit: Kit2): Benefit {
  const out: Benefit = { headline: '', parts: [], claims: [] };
  const segs = splitSemi(WS(text));
  segs.forEach((seg, i) => {
    const lead = seg.match(CLAIM_LEAD);
    const study = i > 0 && STUDY_LEAD.test(seg);
    if (lead || study || (i > 0 && hasFigure(seg) && /\(page claims?\)\s*$/i.test(seg) && kit.kindOf(seg) === 'other' && shapeOf(seg, kit) !== 'verb' && /^(?:an?|the|one|this|that)\b|^[A-Z]/.test(seg))) {
      const body = lead ? seg.slice(lead[0].length) : seg;
      const { body: b, label } = takeLabel(body);
      const pieces = topLevel(b).flatMap((x) => (x.split(/\s+and\s+/).length > 1 && x.split(/\s+and\s+/).every(hasFigure) ? x.split(/\s+and\s+/) : [x]));
      for (const p of pieces) if (p.trim()) out.claims.push({ text: p.trim().replace(/^(?:a|an)\s+(?=\d)/i, ''), label });
      return;
    }
    let body = seg;
    const ex = i === 0 ? seg.match(/^(.{6,100}?),?\s+(?:such as|for example|for instance|e\.g\.|including)\s+(.{8,})$/i) : null;
    if (ex && hasFigure(ex[2]) && !out.headline) {
      out.headline = ex[1].trim();
      const { body: b, label } = takeLabel(ex[2]);
      const pieces = topLevel(b).flatMap((x) => (x.split(/\s+and\s+/).length > 1 && x.split(/\s+and\s+/).every(hasFigure) ? x.split(/\s+and\s+/) : [x]));
      for (const p of pieces) if (p.trim()) out.claims.push({ text: p.trim().replace(/^(?:a|an)\s+(?=\d)/i, ''), label });
      return;
    }
    if (i === 0 && !out.headline) {
      const m = seg.match(/^([^:()]{8,110}?):\s+(.{8,})$/);
      if (m && m[1].split(/\s+/).length <= 14 && !/^examples?\b/i.test(m[1])) { out.headline = m[1].trim(); body = m[2]; }
    }
    for (let p of partsOf(body, kit)) {
      // "understand context and act in real time, with enterprises typically seeing a 60% reduction ...": the tail after "with" is a result somebody got, so it is proof
      const wt = p.text.match(/^(.*?),\s+with\s+((?:[a-z]+\s+){0,2}(?:seeing|seen|reporting|achieving|getting|reaching|saving|cutting|gaining|average|typically)\b.*\d.*)$/i);
      if (wt && !hasFigure(wt[1])) { out.claims.push({ text: wt[2].trim(), label: p.label }); p = { text: wt[1].trim(), label: '' }; }
      // "one customer went from discovery to go-live in 6 days": a result somebody else got is proof, not what the product does
      if (hasFigure(p.text) && shapeOf(p.text, kit) !== 'verb' && CUSTOMER_RESULT.test(p.text)) out.claims.push(p); else out.parts.push(p);
    }
  });
  return out;
}

/** The label to show after a group of parts: one shared label once at the end (plural when it is shared), or each part with its own. */
export function partsInline(parts: Piece[]): string[] {
  const labels = parts.map((p) => p.label);
  const withLabel = labels.filter(Boolean);
  if (parts.length >= 2 && withLabel.length === parts.length && new Set(withLabel).size === 1) {
    const l = withLabel[0].replace(/\((page claim)\)/i, '($1s)').replace(/\((case study)\)/i, '(case studies)');
    return parts.map((p, i) => (i === parts.length - 1 ? `${p.text} ${l}` : p.text));
  }
  return parts.map(partText);
}

/** "cut X, get Y and save Z" from parts that are result verbs or noun phrases; null when one of them is a clause, a gerund or any other text that cannot follow "can". */
export function resultClause(parts: Piece[], kit: Kit2): string | null {
  const inf: string[] = [];
  const merged = new Set<number>();
  const shown = partsInline(parts);
  for (let i = 0; i < parts.length; i++) {
    const sh = shapeOf(parts[i].text, kit);
    if (sh === 'clause' || sh === 'gerund' || sh === 'np' && !/^(?:an?|the|one|\d)\b/i.test(parts[i].text)) return null;
    const adv = (shown[i].match(ADVERB) || [''])[0];
    const s = shapeOf(parts[i].text, kit) === 'verb' ? `${adv.toLowerCase()}${baseForm(shown[i].slice(adv.length), kit)}` : asInfinitive(shown[i], kit);
    if (s === null) return null;
    const prev = inf[inf.length - 1];
    if (prev && /^get /.test(prev) && /^get /.test(s) && !/[;,]/.test(prev + s)) { inf[inf.length - 1] = `${prev}, ${s.slice(4)}`; merged.add(inf.length - 1); } else inf.push(s);
  }
  // "get a, b, c" reads "get a, b and c"
  const fixed = inf.map((x, i) => (merged.has(i) ? x.replace(/, ([^,]+)$/, ' and $1') : x));
  return joinAnd(fixed);
}

/** The first parts that fit in about n characters, at least one. */
export function firstParts(parts: Piece[], n = 230, max = 3): Piece[] {
  const out: Piece[] = [];
  let len = 0;
  for (const p of parts) {
    if (out.length && (out.length >= max || len + p.text.length > n)) break;
    out.push(p);
    len += p.text.length + 2;
  }
  return out;
}

/** A short phrase (3 to max words) that can stand alone as a headline or tagline: the headline, a part, the start of a part cut at a comma, or its first clause. A phrase with a figure is a last
 *  resort (a headline carries no claim without its label). Never cut mid phrase; null when none exists. */
export function shortPhrase(b: Benefit, max: number, kit: Kit2, min = 3): string | null {
  const cands = [b.headline, ...b.parts.map((p) => p.text)].filter(Boolean);
  const bad = /\b(?:for|with|to|of|and|a|the|by|in|that|from|at|or)$/i;
  const ok = (t: string): boolean => { const n = t.split(/\s+/).length; return n >= min && n <= max && !bad.test(t) && !/^(?:from|with|by|so|to)\b/i.test(t) && !/[:;,]$/.test(t); };
  // a cut at a comma must not leave a relative clause open ("One fabric that connects network" from "... connects network, cloud, security and IoT")
  const openClause = (f: string): boolean => /\b(?:that|which|who|where)\s+\w+/i.test(f);
  const pass = (fig: boolean): string | null => {
    // the first candidate that gives a phrase wins, so the headline of a list is its first part and never a later, weaker one
    for (const c of cands) {
      const t = endStop(WS(c));
      if (ok(t) && (fig || !hasFigure(t))) return t;
      const f = (t.split(/,\s+|\s+and\s+(?=\S+\s+\S+\s+\S+)/)[0] || '').trim();
      if (f !== t && ok(f) && !openClause(f) && (fig || !hasFigure(f))) return f;
      const g = leadClause(t, 90) || '';
      if (g && g !== t && ok(g.replace(/\s*\([^)]*\)\s*$/, '')) && !openClause(g) && (fig || !hasFigure(g))) return g;
    }
    return null;
  };
  const whole = (fig: boolean): string | null => {
    for (const c of cands) { const t = endStop(WS(c)); const n = t.split(/\s+/).length; if (n >= min && n <= max + 4 && !bad.test(t) && !/^(?:from|with|by|so|to)\b/i.test(t) && (fig || !hasFigure(t))) return t; }
    return null;
  };
  // a whole first part of a few words more than the limit beats a later part that carries a figure
  return pass(false) ?? whole(false) ?? pass(true) ?? whole(true);
}

/** The first clause of a long text (before its first "with", "so that", comma or "that" once 18 characters are in), or null when the text is short or has no such boundary. */
export function leadClause(text: string, max = 110, need = false, tight = false): string | null {
  const t = endStop(WS(text));
  if (t.length <= max) return null;
  const re = need ? /\s(?:so|while|but|because)\s|,\s|;\s/g : tight ? /\s(?:with|so that|so|which|that|while|because|using|across|including|for|within|from|over)\s|,\s|;\s/g : /\s(?:with|so that|so|which|that|while|because|using|across|including)\s|,\s|;\s/g;
  for (const m of t.matchAll(re)) {
    const at = m.index ?? 0;
    if (at >= 18 && at <= max) {
      // a comma inside a list ("combines A, B and C") is not a clause boundary: the piece after it is one to five words and the list goes on
      if (m[0].startsWith(',')) {
        const after = t.slice(at + 2).split(/,|;|\sand\s|\sor\s/)[0].trim().split(/\s+/).length;
        if (after <= 5) continue;
      }
      const left = t.slice(0, at).trim();
      if (/^\s(?:with|by|from|for|to)\s/.test(m[0]) && /(?:ed|ing)$/i.test(left.split(/\s+/).pop() || '')) continue;
      const open = (left.match(/\(/g) || []).length - (left.match(/\)/g) || []).length;
      if (open <= 0 && !/\b(?:and|or|of|for|to|the|a|an|by|from|in|on)$/i.test(left)) return left;
    }
  }
  return null;
}

// ---- a problem --------------------------------------------------------------------------------------------------------------------
/** The buyer's problem as a sentence: a result verb takes "They", a noun phrase or gerund "They struggle with", a clause stands as it is, anything else follows "Their problem today:". */
export function needSentence(need: string, kit: Kit2): string {
  const t = endStop(WS(need));
  const sh = shapeOf(t, kit);
  const lc = kit.lowerFirst(t);
  if (sh === 'verb') return `They ${kit.kindOf(t) === 'third' ? kit.toBaseVerb(lc) : lc}.`;
  if (sh === 'gerund' || sh === 'noun') return `They struggle with ${lc}.`;
  if (sh === 'clause') return sentence(t, kit);
  return `Their problem today: ${lc}.`;
}
/** The problem split at its semicolons into separate pieces (each a sentence), for a list; one piece when there is no semicolon. */
export function needPieces(need: string): string[] { return splitSemi(WS(need)); }

// ---- a difference -----------------------------------------------------------------------------------------------------------------
const PARTICIPLE = /^(?:built|designed|made|powered|trained|grounded|based|backed|engineered|delivered|run|owned|governed|certified|licensed|hosted|managed|developed|created|focused|tuned|tailored|aimed|set|priced|billed|rooted|wired|sold|supported|integrated)\b/i;
/** A difference as a sentence about the product. A named clause, a result verb, a third person verb, a noun phrase, a participle ("built from the ground up ...") and a head with a colon each get their own wording. */
export function differenceSentence(P: string, item: string, kit: Kit2, fallback: (p: string, d: string) => string): string {
  const t = endStop(WS(item));
  const lead = t.match(/^(?:it|we|they|this)\s+(.*)$/i);
  if (lead) return sentence(`${P} ${lead[1]}`, kit);
  const colon = t.match(/^([^:]{4,60}):\s+(.+)$/);
  if (colon && colon[1].split(/\s+/).length <= 7 && shapeOf(colon[1], kit) !== 'clause' && !/^[A-Z][\w-]+ [a-z]+s\b/.test(t)) return sentence(`${P} is ${kit.lowerFirst(colon[1])}: ${colon[2]}`, kit);
  if (PARTICIPLE.test(t) && /^[a-z]+\s+(?:from|for|on|in|by|to|with|around|into|across|as|entirely|fully|natively)\b/i.test(t)) return sentence(`${P} is ${kit.lowerFirst(t)}`, kit);
  const sh = shapeOf(t, kit);
  if (sh === 'clause') return sentence(t, kit);
  if (THIRD_MORE.has((t.split(/\s+/)[0] || '').toLowerCase()) && !/^[A-Za-z-]+,/.test(t)) return sentence(`${P} ${kit.lowerFirst(t)}`, kit);
  const k = kit.kindOf(t);
  // a noun phrase follows "offers" (the shared fallback would read a name-like start such as "AI agents that learn" as a clause about a named feature)
  if ((sh === 'np' || sh === 'noun') && k !== 'base' && k !== 'third') return sentence(`${P} offers ${kit.lowerFirst(t)}`, kit);
  return sentence(fallback(P, t), kit);
}

// ---- the audience, with its notes ---------------------------------------------------------------------------------------------------
export interface Audience { aud: string; gloss: string; exclusion: string; facts: Piece[]; rest: string; offers: Piece[] }
const EXCLUDES = /\b(?:served by|handled by|sold by|covered by|belong(?:s)? to)\s+(?:a |another |an )?(?:separate|different|sister|other)\b/i;
export function parseAudience(target: string, kit: Kit2): Audience {
  const segs = splitSemi(WS(target));
  let first = segs[0] || '';
  const out: Audience = { aud: '', gloss: '', exclusion: '', facts: [], rest: '', offers: [] };
  for (const s of segs.slice(1)) {
    if (EXCLUDES.test(s)) out.exclusion = endStop(s);
    else if (hasFigure(s) || /\(page claims?\)/i.test(s)) { const l = takeLabel(s); out.facts.push({ text: l.body, label: l.label }); }
    else out.rest = out.rest ? `${out.rest}; ${s}` : s;
  }
  // a bracketed note with a figure in the middle of the audience text ("startups (eligible startups can receive up to $100,000 in credits for 12 months)") is an offer of the seller
  const anyLabel = (target.match(/\((?:page claims?|case stud(?:y|ies)|analyst reports?)\)/i) || [''])[0];
  for (const m of first.matchAll(/\(([^()]{12,160})\)/g)) if (hasFigure(m[1]) && !/page claim|about page|source|analyst|story/i.test(m[1]) && !first.trim().endsWith(m[0])) out.offers.push({ text: m[1].trim(), label: anyLabel });
  const g = first.match(/^(.+?)\s*\(([^()]{6,90})\)\s*$/);
  if (g && hasFigure(g[2]) && !/\b(?:page claims?|about page|the site|the page)\b/i.test(g[2])) { out.facts.push({ text: g[2].trim(), label: '' }); first = g[1].trim(); }
  else if (g && !/\b(?:page claims?|about page|the site|the page)\b/i.test(g[2]) && !/\bsource|analyst|story\b/i.test(g[2])) { out.gloss = g[2].trim(); first = g[1].trim(); }
  // a count or a claim typed inside the audience text ("500,000 companies, including 98% of the Fortune 500 (page claim)") is proof as well; the audience stays the role or group
  const pageClaim = first.match(/,?\s+(?:with\s+)?the\s+(?:about\s+)?(?:page|site|website)\s+(?:claim(?:s|ing)|says?|saying|states?|stating)\s+(.+)$/i);
  if (pageClaim) { out.facts.push({ text: pageClaim[1].trim(), label: '(page claim)' }); first = first.slice(0, pageClaim.index).trim(); }
  const lbl = takeLabel(first);
  if (lbl.label) { out.facts.push({ text: lbl.body.replace(/\s*\([^()]*\)/g, ''), label: lbl.label }); first = (hasFigure(lbl.body) && leadAud(lbl.body)) || lbl.body; }
  first = kit.noNotes(first.replace(/\s*\([^()]*\)/g, '').replace(/\s+/g, ' ').trim());
  out.aud = first;
  return out;
}
/** The audience in running text: the whole phrase when it is up to 90 characters (a list that shares one noun stays whole), else its lead words. */
export function audienceShort(aud: string, kit: Kit2): string {
  const a = kit.mid(aud.trim());
  if (a.length <= 90) return a;
  const lead = leadAud(aud);
  if (lead) return kit.mid(lead);
  const first = aud.split(/,|\sincluding\s/)[0].trim();
  if (first.split(/\s+/).length >= 2 && first.split(/\s+/).length <= 9) return kit.mid(first);
  return kit.mid(clip(aud, 70));
}

// ---- the alternative ---------------------------------------------------------------------------------------------------------------
export interface Alternative { label: string; tail: string; note: string; full: string; kind: 'name' | 'description' | 'activity' }
/** The alternative the buyer uses today: a name, a description ("a legacy system that cannot ...") or an activity ("negotiating deals yourself"); its label is the short noun phrase, its tail what the user said about it. */
export function parseAlternative(text: string, kit: Kit2): Alternative {
  const t = endStop(WS(text.replace(/\s*\(a seller's words\)\s*$/i, '')));
  const bracket = t.match(/^(.*?)\s*\(([^()]+)\)\s*$/);
  const base = bracket ? bracket[1].trim() : t;
  const note = bracket ? bracket[2].trim() : '';
  const w0 = (base.split(/\s+/)[0] || '').toLowerCase();
  // "the old model: one firm writes the strategy, another builds the tech": the head before the colon names the alternative, what follows says how it works
  const colon = base.match(/^([^:]{4,50}):\s+(.{12,})$/);
  const m = colon && colon[1].split(/\s+/).length <= 6 ? [base, colon[1], colon[2]] as unknown as RegExpMatchArray : base.match(/^(.{3,}?)(?:,\s*|\s+)((?:that|which|who|where|whose|relying|relies|because|with)\b.*)$/i);
  let label = m && m[1].split(/\s+/).length >= 2 ? m[1].trim() : base;
  let tail = m && m[1].split(/\s+/).length >= 2 ? m[2].trim() : '';
  if (!tail && note) tail = note;
  if (label.split(/\s+/).length > 9) { const c = clip(label, 60); tail = tail || label.slice(c.length).replace(/^[\s,;]+/, ''); label = c; }
  label = label.replace(/\s+yourself$/i, '').trim() || label;
  // a label never ends on a dangling word ("... test and release, each")
  const lw = label.split(/\s+/);
  while (lw.length > 2 && /^(?:each|every|all|both|only|also|still|not|and|or|with|of|for|to|the|a|an)[,;]?$/i.test(lw[lw.length - 1])) { tail = tail ? tail : lw[lw.length - 1]; lw.pop(); }
  label = lw.join(' ').replace(/[,;]+$/, '');
  const kind: Alternative['kind'] = /^(?:an?|the|some|our|their|your|one|several|general|traditional|typical|most|many|legacy|manual|periodic|spreadsheets?|point|collections?|disconnected|self-managed)\b/i.test(w0) || /s$/.test(w0) && !/ing$/.test(w0) ? 'description'
    : /^[a-z]+ing$/.test(w0) || /^(?:doing|using|building|running|negotiating|dealing)/.test(w0) ? 'activity'
    : /^[A-Z]/.test(base.split(/\s+/)[0] || '') ? 'name' : 'description';
  return { label: kit.mid(label), tail: note && tail === note ? '' : tail, note, full: note ? `${kit.mid(label)} (${note})` : kit.mid(label), kind };
}
/** What a buyer says about staying with the alternative. */
export function altObjection(a: Alternative): string {
  if (a.kind === 'name') return `We already use ${a.label}.`;
  if (a.kind === 'activity') return 'We already handle this ourselves.';
  return /^(?:an?|the|our|their|some|several|one)\s/i.test(a.label) ? `We already have ${a.label}.` : `We already use ${a.label}.`;
}

// ---- proof the user gave ----------------------------------------------------------------------------------------------------------
/** Differences typed as one text: the items at the semicolons; an item that is a recognition (an analyst ranking, an award) goes to the proof. */
export function parseDifference(text: string): { items: string[]; recognition: Piece[] } {
  const items: string[] = []; const recognition: Piece[] = [];
  for (const seg of splitSemi(WS(text))) {
    const l = takeLabel(seg);
    const isRec = (x: string): boolean => classifyProof(x).kind === 'recognition' && /\b(?:named|ranked|recogni[sz]ed|leader|winner|award|certified|rated)\b/i.test(x);
    const tail = l.body.match(/^(.{25,}?)\s*(?:,|\s+and)\s+((?:ranked|named|rated|recogni[sz]ed|awarded|voted)\b.*|certified\s+(?:as|by|for)\b.*)$/i);
    if (isRec(l.body) && /^(?:named|ranked|recogni[sz]ed|rated|certified|awarded|voted|winner|finalist|(?:an?\s+)?leader\b|an?\s+award)/i.test(l.body)) recognition.push({ text: l.body, label: l.label });
    else if (tail && /\d|#\d|leader|first/i.test(tail[2])) { items.push(l.label && /\d/.test(tail[1]) ? `${tail[1].trim()} ${l.label}` : tail[1].trim()); recognition.push({ text: tail[2].trim(), label: l.label }); }
    else items.push(seg.trim());
  }
  return { items, recognition };
}

/** Which of the user's texts give a customer count, a result with a figure or a recognition (with their labels). */
export function proofFrom(texts: string[]): { counts: Piece[]; recognitions: Piece[] } {
  const counts: Piece[] = []; const recognitions: Piece[] = [];
  for (const t of texts) for (const seg of splitSemi(WS(t))) {
    const l = takeLabel(seg);
    const k = classifyProof(l.body);
    if (k.kind === 'recognition' && /\b(?:named|ranked|recogni[sz]ed|leader|winner|award|certified|rated|finalist)\b/i.test(l.body)) recognitions.push({ text: l.body, label: l.label });
  }
  return { counts, recognitions };
}

/** The closing list of what is missing. */
export function sharpenText(missing: { give: string; changes: string }[]): string {
  return missing.length ? `**To sharpen this, give:** ${missing.map((m) => `${m.give} (it would change ${m.changes})`).join('; ')}.` : '';
}

// ---- the positioning statement a user hands to the channel tool ----------------------------------------------------------------------
export interface StatementParts { alt: string; diff: string[]; category: string; need: string; features: string[]; facts: string[] }
/** The pieces of a positioning statement that the channel copy needs: the alternative ("Unlike X," or "Alternatives buyers use today: X"), the differences ("What sets it apart: ..." or the rest of the
 *  "Unlike" sentence), the category ("P is the C that ...") and the need ("who struggle with N, P is"). Anything it cannot read is left empty; nothing is guessed. */
export function parseStatement(statement: string, products: string | string[]): StatementParts {
  const names = (Array.isArray(products) ? products : [products]).map((x) => x.trim()).filter((x) => x.length >= 2);
  const out: StatementParts = { alt: '', diff: [], category: '', need: '', features: [], facts: [] };
  const text = WS(statement);
  const sents = text.split(/(?<=[.!?])\s+(?=[A-Z])/);
  for (const s0 of sents) {
    const s = endStop(s0);
    let m: RegExpMatchArray | null;
    if ((m = s.match(/^alternatives?(?: buyers)? (?:use|used|weigh|consider) today:\s*(.+)$/i))) { out.alt = out.alt || m[1].trim(); continue; }
    if ((m = s.match(/^what sets it apart:\s*(.+)$/i))) { out.diff.push(...splitSemi(m[1])); continue; }
    if ((m = s.match(/(?:^|\s)unlike\s+([^,]+?(?:\([^)]*\))?),\s*(.+)$/i))) { out.alt = out.alt || m[1].trim(); out.diff.push(m[2].trim()); continue; }
  }
  const esc1 = (x: string): string => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const nameRe = names.length ? `(?:${names.map(esc1).join('|')})` : '';
  const cm = (nameRe ? text.match(new RegExp(`${nameRe}\\s+(?:is|are)\\s+(?:an?|the)\\s+`, 'i')) : null) || text.match(/\b(?:is|are)\s+(?:an?|the)\s+/i);
  if (cm && cm.index !== undefined) {
    const rest = text.slice(cm.index + cm[0].length);
    let depth = 0; let end = rest.length;
    for (let i = 0; i < rest.length && i < 200; i++) {
      const ch = rest[i];
      if (ch === '(') depth++; else if (ch === ')') depth = Math.max(0, depth - 1);
      else if (depth === 0 && (ch === '.' || /^\s(?:that|which|who)\s/.test(rest.slice(i, i + 8)))) { end = i; break; }
    }
    const c = rest.slice(0, end).trim();
    if (c.split(/\s+/).length >= 1 && c.split(/\s+/).length <= 32 && c.length >= 3 && !/\bunlike\b/i.test(c)) out.category = c;
    // "... that 20+ payment methods; unified API and hosted checkout; embedded 3D Secure; ...": a list of what the product includes, written after "that" and separated by semicolons
    const th = rest.slice(end).match(/^\s(?:that|which)\s+([^]*)$/);
    if (th) {
      const sentenceEnd = th[1].search(/\.\s+[A-Z]|\.$/);
      const body = sentenceEnd >= 0 ? th[1].slice(0, sentenceEnd) : th[1];
      let items = splitSemi(body).map((x) => endStop(x)).filter((x) => x.length >= 4 && x.split(/\s+/).length <= 26);
      // a list written with commas and bracketed groups ("network (A, B), cloud (C, D), IoT (E, F), 190+ countries voice footprint") is a list of what the product includes as well
      if (items.length < 3) {
        const commas = topLevel(body).map((x) => endStop(x)).filter((x) => x.length >= 4 && x.split(/\s+/).length <= 12 && !/\b(?:so|because|while)\b/i.test(x));
        if (commas.length >= 4 && commas.filter((x) => /\(/.test(x)).length >= 2) items = commas;
      }
      if (items.length >= 3) { out.features = items.filter((x) => !/^\d/.test(x)); out.facts = items.filter((x) => /^\d/.test(x)); }
    }
  }
  if (nameRe) {
    const nd = text.match(new RegExp(`\\bwho\\s+(.{6,400}?),\\s+(?:the\\s+)?${nameRe}\\s+(?:is|are|helps?|gives?)\\b`, 'i'));
    if (nd) out.need = nd[1].trim().replace(/^struggle with\s+/i, '');
  }
  if (!out.diff.length) {
    const m = text.match(/^for\s+[^,]+(?:\([^)]*\))?[^,]*,\s*(.+)$/i);
    if (m) { const rest = endStop(m[1]); if (!/\bunlike\b/i.test(rest)) out.diff.push(rest); }
  }
  return out;
}

/** The first result of a benefit without any figure or label, as an infinitive clause ("instantly save on shipping"): for a tagline, which carries no claim. null when there is none. */
export function plainResult(b: Benefit, kit: Kit2): string | null {
  const heads = b.headline && shapeOf(b.headline, kit) === 'verb' ? [{ text: b.headline, label: '' }] : [];
  for (const p of [...heads, ...b.parts]) {
    let t = endStop(WS(p.text));
    // a figure the user typed with a source label is a claim and stays out of a tagline; a figure typed without one is the user's own message
    if ((hasFigure(t) && p.label) || t.length > 80) t = leadClause(t, 80) || (hasFigure(t) && p.label ? '' : t.length <= 110 ? t : clip(t, 70));
    if (!t || (hasFigure(t) && p.label) || t.split(/\s+/).length < 2) continue;
    const c = resultClause([{ text: t, label: '' }], kit);
    if (c) return c;
  }
  return null;
}

// ---- relevance: what a sector note says against what the user's own inputs describe ----------------------------------------------------
const GENERIC_STEM = new Set(['rate', 'time', 'share', 'effort', 'cost', 'numbe', 'count', 'avera', 'total', 'quali', 'custo', 'servi', 'busin', 'compa', 'manag', 'syste', 'platf', 'solut', 'produ', 'team', 'user', 'tool', 'work', 'with', 'that', 'this', 'your', 'from', 'have', 'they', 'what', 'each', 'more', 'less', 'data', 'help', 'mean', 'every', 'under', 'while', 'basic', 'start', 'stop', 'build', 'live', 'plan', 'tied', 'run', 'need', 'make', 'take', 'only', 'also', 'into', 'over', 'across', 'their', 'there', 'about']);
/** The stems (first five letters, plural cut) of the words of 4 letters or more of some texts, without the words that fit any business. */
export function stemSet(...texts: string[]): Set<string> {
  const out = new Set<string>();
  for (const w of texts.join(' ').toLowerCase().match(/[a-z][a-z-]{3,}/g) || []) { const st = w.replace(/s$/, '').slice(0, 5); if (!GENERIC_STEM.has(st)) out.add(st); }
  return out;
}
/** How many different stems of an item (a sector measure, objection, question or word) the user's own inputs share. */
export function shared(item: string, inputs: Set<string>): number {
  let n = 0;
  for (const st of stemSet(item)) if (inputs.has(st)) n++;
  return n;
}

/** Measures read from the user's own figures: "99.99% uptime SLA on production plans" gives "uptime SLA", "a 51% reduction in review time" gives "review time". */
export function figureMeasures(texts: string[]): string[] {
  const out: string[] = [];
  const STOP = /^(?:on|in|for|of|with|and|to|by|from|at|over|after|before|across|per|using|when|while|within|than|or|plans?|off|up|as)$/i;
  const SKIP = /^(?:faster|slower|lower|higher|fewer|more|less|better|quicker|reduction|increase|improvement|growth|drop|decrease|gain|rise|cut)$/i;
  const THIN = /^(?:time|rate|cost|value|number|speed|users?|customers?|companies|businesses|enterprises|teams?)$/i;
  // only a percentage or a multiplier says that the words after it are a measure ("99.99% uptime SLA"); a count of things ("14 million hours", "40+ languages") is not
  for (const t of texts) for (const m of WS(t).matchAll(/(?:\d[\d.,]*\+?\s?%|\b\d+(?:\.\d+)?[xX]\b)\s+((?:[A-Za-z-]+(?:\s+|(?=[;,.)]|$))){1,6})/g)) {
    const words = m[1].trim().split(/\s+/);
    let i = 0;
    while (i < words.length && SKIP.test(words[i])) i++;
    if (i > 0 && /^(?:in|of)$/i.test(words[i] || '')) i++;
    const pick: string[] = [];
    for (; i < words.length && pick.length < 3; i++) { if (STOP.test(words[i])) break; pick.push(words[i]); }
    const phrase = pick.join(' ');
    if (phrase.length >= 4 && !(pick.length === 1 && THIN.test(phrase)) && !out.some((x) => x.toLowerCase() === phrase.toLowerCase())) out.push(phrase);
  }
  return out;
}

/** The label "(page claims)" that belongs to a cut of an item: kept when the cut holds a superlative ("the most extensively licensed ...") and the item carries the label further on. */
export function keepLabel(item: string, cut: string): string {
  const lab = item.match(/\((?:[^()]*\b(?:page claims?|case stud(?:y|ies)|analyst reports?|sources?)\b[^()]*)\)/i);
  const sup = /\b(?:most|first|only|best|largest|leading|#\d|number one|top)\b/i.test(cut);
  return lab && sup && !cut.includes(lab[0]) && item.indexOf(lab[0]) >= cut.length ? `${cut} ${lab[0]}` : cut;
}

/** A short quotation of the user's words around a concern word ("patching, scaling, security and uptime handled"), or '' when no text holds it. */
export function quoteAround(texts: string[], concern: RegExp): string {
  for (const t of texts) {
    const w = WS(t).replace(/\([^)]*\)/g, ' ').split(/\s+/);
    const i = w.findIndex((x) => concern.test(x));
    if (i < 0) continue;
    const from = Math.max(0, i - 2); const to = Math.min(w.length, i + 4);
    return endStop(w.slice(from, to).join(' ')).replace(/^(?:(?:with|and|the|a|an|of|to|in|on|under|by|for)\s+)+/i, '').replace(/(?:\s+(?:with|and|the|a|an|of|to|in|on|by|for|or))+$/i, '');
  }
  return '';
}

/** A product name typed as "Brand lowerwords, ..." where the lower word starts a list ("eClerx digital, data and ..."): the brand alone. */
export function brandOnly(named: string): string {
  const m = named.trim().match(/^(\S+)\s+([a-z]+),\s/);
  // only a word that is built like a name (an inner capital, a digit or a dot: eClerx, Fin2go, Voxa.ai) is taken as a brand; an ordinary capitalised word that opens a description ("Modern cloud, security ...") is not
  return m && /^[A-Za-z][\w.-]*$/.test(m[1]) && (/[a-z][A-Z]/.test(m[1]) || /\d/.test(m[1]) || /[a-z]\.[a-z]/i.test(m[1])) ? m[1] : '';
}

/** The clause of a text that holds a percentage or a multiplier ("zero-downtime upgrades and a 99.99% uptime SLA on production plans" gives "a 99.99% uptime SLA on production plans"). '' when there is none. */
export function figureClause(text: string): string {
  const t = WS(text).replace(/\s*\((?:page claims?|case stud(?:y|ies)|hypothetical|analyst reports?)\)\s*$/i, '');
  for (const frag of t.split(/,\s+|;\s+/)) {
    if (!/\d[\d.,]*\+?\s?%|\b\d+(?:\.\d+)?[xX]\b/.test(frag)) continue;
    const and = frag.split(/\s+and\s+/);
    const hit = and.filter((x) => /\d[\d.,]*\+?\s?%|\b\d+(?:\.\d+)?[xX]\b/.test(x)).pop() || frag;
    return hit.trim().replace(/^(?:with|and)\s+/i, '');
  }
  return '';
}
/** Advice written to the seller ("the buyer's own transaction data") read as copy to the buyer ("your own transaction data"). */
export function toYou(t: string): string {
  return t.replace(/\bthe buyer's own\b/gi, 'your own').replace(/\bthe buyer's\b/gi, 'your').replace(/\bthe buyer\b/gi, 'you').replace(/\bbuyers'? own\b/gi, 'your own');
}
