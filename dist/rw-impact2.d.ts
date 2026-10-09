import { type Kit } from './rw-impact.ts';
export interface Kit2 extends Kit {
    capFirst(t: string): string;
    mid(t: string): string;
    noNotes(t: string): string;
    shortAud(t: string): string;
}
/** A phrase of the user's with its source label ("(page claim)") kept apart. */
export interface Piece {
    text: string;
    label: string;
}
export declare const partText: (p: Piece) => string;
/** A sentence: first letter up (a word with an inner capital such as eBay is kept), one full stop. */
export declare function sentence(t: string, kit: Kit2): string;
export declare const THIRD_MORE: Set<string>;
export type Shape = 'verb' | 'gerund' | 'noun' | 'clause' | 'np';
/** What a typed phrase is, so it can be put into a sentence of ours: a result verb ("cut cost"), a gerund ("overpaying for shipping"), a noun phrase that starts with a quantity,
 *  comparative or adjective ("fewer late deliveries"), a clause with its own verb ("most tools hand teams thousands of findings"), or another noun phrase. */
export declare function shapeOf(text: string, kit: Kit2): Shape;
/** The same result verb in its base form ("acts before ..." and "act before ..." both give "act before ..."). */
export declare function baseForm(t: string, kit: Kit2): string;
/** A sentence registry: the same sentence (seven words or more) is never written twice; each slot offers alternatives, the first unused one wins. */
export declare function makeFresh(): (...alts: string[]) => string;
export interface Benefit {
    headline: string;
    parts: Piece[];
    claims: Piece[];
}
export declare function parseBenefit(text: string, kit: Kit2): Benefit;
/** The label to show after a group of parts: one shared label once at the end (plural when it is shared), or each part with its own. */
export declare function partsInline(parts: Piece[]): string[];
/** "cut X, get Y and save Z" from parts that are result verbs or noun phrases; null when one of them is a clause, a gerund or any other text that cannot follow "can". */
export declare function resultClause(parts: Piece[], kit: Kit2): string | null;
/** The first parts that fit in about n characters, at least one. */
export declare function firstParts(parts: Piece[], n?: number, max?: number): Piece[];
/** A short phrase (3 to max words) that can stand alone as a headline or tagline: the headline, a part, the start of a part cut at a comma, or its first clause. A phrase with a figure is a last
 *  resort (a headline carries no claim without its label). Never cut mid phrase; null when none exists. */
export declare function shortPhrase(b: Benefit, max: number, kit: Kit2, min?: number): string | null;
/** The first clause of a long text (before its first "with", "so that", comma or "that" once 18 characters are in), or null when the text is short or has no such boundary. */
export declare function leadClause(text: string, max?: number, need?: boolean, tight?: boolean): string | null;
/** The buyer's problem as a sentence: a result verb takes "They", a noun phrase or gerund "They struggle with", a clause stands as it is, anything else follows "Their problem today:". */
export declare function needSentence(need: string, kit: Kit2): string;
/** The problem split at its semicolons into separate pieces (each a sentence), for a list; one piece when there is no semicolon. */
export declare function needPieces(need: string): string[];
/** A difference as a sentence about the product. A named clause, a result verb, a third person verb, a noun phrase, a participle ("built from the ground up ...") and a head with a colon each get their own wording. */
export declare function differenceSentence(P: string, item: string, kit: Kit2, fallback: (p: string, d: string) => string): string;
export interface Audience {
    aud: string;
    gloss: string;
    exclusion: string;
    facts: Piece[];
    rest: string;
    offers: Piece[];
}
export declare function parseAudience(target: string, kit: Kit2): Audience;
/** The audience in running text: the whole phrase when it is up to 90 characters (a list that shares one noun stays whole), else its lead words. */
export declare function audienceShort(aud: string, kit: Kit2): string;
export interface Alternative {
    label: string;
    tail: string;
    note: string;
    full: string;
    kind: 'name' | 'description' | 'activity';
}
/** The alternative the buyer uses today: a name, a description ("a legacy system that cannot ...") or an activity ("negotiating deals yourself"); its label is the short noun phrase, its tail what the user said about it. */
export declare function parseAlternative(text: string, kit: Kit2): Alternative;
/** What a buyer says about staying with the alternative. */
export declare function altObjection(a: Alternative): string;
/** Differences typed as one text: the items at the semicolons; an item that is a recognition (an analyst ranking, an award) goes to the proof. */
export declare function parseDifference(text: string): {
    items: string[];
    recognition: Piece[];
};
/** Which of the user's texts give a customer count, a result with a figure or a recognition (with their labels). */
export declare function proofFrom(texts: string[]): {
    counts: Piece[];
    recognitions: Piece[];
};
/** The closing list of what is missing. */
export declare function sharpenText(missing: {
    give: string;
    changes: string;
}[]): string;
export interface StatementParts {
    alt: string;
    diff: string[];
    category: string;
    need: string;
    features: string[];
    facts: string[];
}
/** The pieces of a positioning statement that the channel copy needs: the alternative ("Unlike X," or "Alternatives buyers use today: X"), the differences ("What sets it apart: ..." or the rest of the
 *  "Unlike" sentence), the category ("P is the C that ...") and the need ("who struggle with N, P is"). Anything it cannot read is left empty; nothing is guessed. */
export declare function parseStatement(statement: string, products: string | string[]): StatementParts;
/** The first result of a benefit without any figure or label, as an infinitive clause ("instantly save on shipping"): for a tagline, which carries no claim. null when there is none. */
export declare function plainResult(b: Benefit, kit: Kit2): string | null;
/** The stems (first five letters, plural cut) of the words of 4 letters or more of some texts, without the words that fit any business. */
export declare function stemSet(...texts: string[]): Set<string>;
/** How many different stems of an item (a sector measure, objection, question or word) the user's own inputs share. */
export declare function shared(item: string, inputs: Set<string>): number;
/** Measures read from the user's own figures: "99.99% uptime SLA on production plans" gives "uptime SLA", "a 51% reduction in review time" gives "review time". */
export declare function figureMeasures(texts: string[]): string[];
/** The label "(page claims)" that belongs to a cut of an item: kept when the cut holds a superlative ("the most extensively licensed ...") and the item carries the label further on. */
export declare function keepLabel(item: string, cut: string): string;
/** A short quotation of the user's words around a concern word ("patching, scaling, security and uptime handled"), or '' when no text holds it. */
export declare function quoteAround(texts: string[], concern: RegExp): string;
/** A product name typed as "Brand lowerwords, ..." where the lower word starts a list ("eClerx digital, data and ..."): the brand alone. */
export declare function brandOnly(named: string): string;
/** The clause of a text that holds a percentage or a multiplier ("zero-downtime upgrades and a 99.99% uptime SLA on production plans" gives "a 99.99% uptime SLA on production plans"). '' when there is none. */
export declare function figureClause(text: string): string;
/** Advice written to the seller ("the buyer's own transaction data") read as copy to the buyer ("your own transaction data"). */
export declare function toYou(t: string): string;
//# sourceMappingURL=rw-impact2.d.ts.map