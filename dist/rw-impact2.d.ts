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
    lead?: string;
}
export declare const partText: (p: Piece) => string;
export declare function sentence(...a: Parameters<typeof sentenceRaw>): ReturnType<typeof sentenceRaw>;
/** A sentence: first letter up (a word with an inner capital such as eBay is kept), one full stop. */
declare function sentenceRaw(t: string, kit: Kit2): string;
export declare const THIRD_MORE: Set<string>;
export type Shape = 'verb' | 'gerund' | 'noun' | 'clause' | 'np';
/** What a typed phrase is, so it can be put into a sentence of ours: a result verb ("cut cost"), a gerund ("overpaying for shipping"), a noun phrase that starts with a quantity,
 *  comparative or adjective ("fewer late deliveries"), a clause with its own verb ("most tools hand teams thousands of findings"), or another noun phrase. */
export declare function shapeOf(text: string, kit: Kit2): Shape;
export declare function baseForm(...a: Parameters<typeof baseFormRaw>): ReturnType<typeof baseFormRaw>;
/** The same result verb in its base form ("acts before ..." and "act before ..." both give "act before ..."). */
declare function baseFormRaw(t: string, kit: Kit2): string;
/** A sentence registry: the same sentence (seven words or more) is never written twice; each slot offers alternatives, the first unused one wins. */
export declare function makeFresh(): (...alts: string[]) => string;
export interface Benefit {
    headline: string;
    parts: Piece[];
    claims: Piece[];
}
export declare function parseBenefit(...a: Parameters<typeof parseBenefitRaw>): ReturnType<typeof parseBenefitRaw>;
declare function parseBenefitRaw(text: string, kit: Kit2): Benefit;
export declare function partsInline(...a: Parameters<typeof partsInlineRaw>): ReturnType<typeof partsInlineRaw>;
/** The label to show after a group of parts: one shared label once at the end (plural when it is shared), or each part with its own. */
declare function partsInlineRaw(parts: Piece[]): string[];
export declare function resultClause(...a: Parameters<typeof resultClauseRaw>): ReturnType<typeof resultClauseRaw>;
/** "cut X, get Y and save Z" from parts that are result verbs or noun phrases; null when one of them is a clause, a gerund or any other text that cannot follow "can". */
declare function resultClauseRaw(parts: Piece[], kit: Kit2): string | null;
/** The first parts that fit in about n characters, at least one. */
export declare function firstParts(parts: Piece[], n?: number, max?: number): Piece[];
export declare function shortPhrase(...a: Parameters<typeof shortPhraseRaw>): ReturnType<typeof shortPhraseRaw>;
/** A short phrase (3 to max words) that can stand alone as a headline or tagline: the headline, a part, the start of a part cut at a comma, or its first clause. A phrase with a figure is a last
 *  resort (a headline carries no claim without its label). Never cut mid phrase; null when none exists. */
declare function shortPhraseRaw(b: Benefit, max: number, kit: Kit2, min?: number): string | null;
export declare function leadClause(...a: Parameters<typeof leadClauseRaw>): ReturnType<typeof leadClauseRaw>;
/** The first clause of a long text (before its first "with", "so that", comma or "that" once 18 characters are in), or null when the text is short or has no such boundary. */
declare function leadClauseRaw(text: string, max?: number, need?: boolean, tight?: boolean): string | null;
export declare function needSentence(...a: Parameters<typeof needSentenceRaw>): ReturnType<typeof needSentenceRaw>;
/** The buyer's problem as a sentence: a result verb takes "They", a noun phrase or gerund "They struggle with", a clause stands as it is, anything else follows "Their problem today:". */
declare function needSentenceRaw(need: string, kit: Kit2): string;
export declare function needPieces(...a: Parameters<typeof needPiecesRaw>): ReturnType<typeof needPiecesRaw>;
/** The problem split at its semicolons into separate pieces (each a sentence), for a list; one piece when there is no semicolon. */
declare function needPiecesRaw(need: string): string[];
export declare function differenceSentence(...a: Parameters<typeof differenceSentenceRaw>): ReturnType<typeof differenceSentenceRaw>;
/** A difference as a sentence about the product. A named clause, a result verb, a third person verb, a noun phrase, a participle ("built from the ground up ...") and a head with a colon each get their own wording. */
declare function differenceSentenceRaw(P: string, item: string, kit: Kit2, fallback: (p: string, d: string) => string): string;
export interface Audience {
    aud: string;
    gloss: string;
    exclusion: string;
    facts: Piece[];
    rest: string;
    offers: Piece[];
}
export declare function parseAudience(...a: Parameters<typeof parseAudienceRaw>): ReturnType<typeof parseAudienceRaw>;
declare function parseAudienceRaw(target: string, kit: Kit2): Audience;
export declare function audienceShort(...a: Parameters<typeof audienceShortRaw>): ReturnType<typeof audienceShortRaw>;
/** The audience in running text: the whole phrase when it is up to 90 characters (a list that shares one noun stays whole), else its lead words. */
declare function audienceShortRaw(aud: string, kit: Kit2): string;
export interface Alternative {
    label: string;
    tail: string;
    note: string;
    full: string;
    kind: 'name' | 'description' | 'activity';
}
export declare function parseAlternative(...a: Parameters<typeof parseAlternativeRaw>): ReturnType<typeof parseAlternativeRaw>;
/** The alternative the buyer uses today: a name, a description ("a legacy system that cannot ...") or an activity ("negotiating deals yourself"); its label is the short noun phrase, its tail what the user said about it. */
declare function parseAlternativeRaw(text: string, kit: Kit2): Alternative;
export declare function altObjection(...a: Parameters<typeof altObjectionRaw>): ReturnType<typeof altObjectionRaw>;
/** What a buyer says about staying with the alternative. */
declare function altObjectionRaw(a: Alternative): string;
export declare function parseDifference(...a: Parameters<typeof parseDifferenceRaw>): ReturnType<typeof parseDifferenceRaw>;
/** Differences typed as one text: the items at the semicolons; an item that is a recognition (an analyst ranking, an award) goes to the proof. */
declare function parseDifferenceRaw(text: string): {
    items: string[];
    recognition: Piece[];
};
export declare function proofFrom(...a: Parameters<typeof proofFromRaw>): ReturnType<typeof proofFromRaw>;
/** Which of the user's texts give a customer count, a result with a figure or a recognition (with their labels). */
declare function proofFromRaw(texts: string[]): {
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
export declare function parseStatement(...a: Parameters<typeof parseStatementRaw>): ReturnType<typeof parseStatementRaw>;
/** The pieces of a positioning statement that the channel copy needs: the alternative ("Unlike X," or "Alternatives buyers use today: X"), the differences ("What sets it apart: ..." or the rest of the
 *  "Unlike" sentence), the category ("P is the C that ...") and the need ("who struggle with N, P is"). Anything it cannot read is left empty; nothing is guessed. */
declare function parseStatementRaw(statement: string, products: string | string[]): StatementParts;
export declare function plainResult(...a: Parameters<typeof plainResultRaw>): ReturnType<typeof plainResultRaw>;
/** The first result of a benefit without any figure or label, as an infinitive clause ("instantly save on shipping"): for a tagline, which carries no claim. null when there is none. */
declare function plainResultRaw(b: Benefit, kit: Kit2): string | null;
/** The stems (first five letters, plural cut) of the words of 4 letters or more of some texts, without the words that fit any business. */
export declare function stemSet(...texts: string[]): Set<string>;
/** How many different stems of an item (a sector measure, objection, question or word) the user's own inputs share. */
export declare function shared(item: string, inputs: Set<string>): number;
export declare function figureMeasures(...a: Parameters<typeof figureMeasuresRaw>): ReturnType<typeof figureMeasuresRaw>;
/** Measures read from the user's own figures: "99.99% uptime SLA on production plans" gives "uptime SLA", "a 51% reduction in review time" gives "review time". */
declare function figureMeasuresRaw(texts: string[]): string[];
export declare function keepLabel(...a: Parameters<typeof keepLabelRaw>): ReturnType<typeof keepLabelRaw>;
/** The label "(page claims)" that belongs to a cut of an item: kept when the cut holds a superlative ("the most extensively licensed ...") and the item carries the label further on. */
declare function keepLabelRaw(item: string, cut: string): string;
export declare function quoteAround(...a: Parameters<typeof quoteAroundRaw>): ReturnType<typeof quoteAroundRaw>;
/** A short quotation of the user's words around a concern word ("patching, scaling, security and uptime handled"), or '' when no text holds it. A window that is only a list of
 *  service lines ("network, cloud, security, interactions and IoT") names what is sold, not what is proved, so it is passed over. */
declare function quoteAroundRaw(texts: string[], concern: RegExp): string;
export declare function brandOnly(...a: Parameters<typeof brandOnlyRaw>): ReturnType<typeof brandOnlyRaw>;
/** A product name typed as "Brand lowerwords, ..." where the lower word starts a list ("Voxel digital, data and ..."): the brand alone. */
declare function brandOnlyRaw(named: string): string;
export declare function figureClause(...a: Parameters<typeof figureClauseRaw>): ReturnType<typeof figureClauseRaw>;
/** The clause of a text that holds a percentage or a multiplier ("zero-downtime upgrades and a 99.99% uptime SLA on production plans" gives "a 99.99% uptime SLA on production plans"). '' when there is none. */
declare function figureClauseRaw(text: string): string;
export declare function toYou(...a: Parameters<typeof toYouRaw>): ReturnType<typeof toYouRaw>;
/** Advice written to the seller ("the buyer's own transaction data", "the outcome the buyer cares about") read as copy to the buyer ("your own transaction data", "the outcome you care about"). */
declare function toYouRaw(t: string): string;
export declare function durationMeasures(...a: Parameters<typeof durationMeasuresRaw>): ReturnType<typeof durationMeasuresRaw>;
/** A time the user promises ("a new service live in under 10 minutes") read as a measure ("time to a live service"). Only a state word after a noun is read; nothing is added. */
declare function durationMeasuresRaw(texts: string[]): string[];
/** How the product is priced, read from the user's own words: per seat, or by usage (usage, credits, pay as you go, a unit price; or a product that is infrastructure the buyer's workloads run on). */
export declare function priceBasis(texts: string[], kindTexts: string[]): {
    kind: 'usage' | 'seat' | '';
    words: string[];
};
export declare function subjectOf(...a: Parameters<typeof subjectOfRaw>): ReturnType<typeof subjectOfRaw>;
/** The subject of a clause ("customer experience management is the new battleground" gives "customer experience management"); a short noun phrase is its own subject; otherwise ''. */
declare function subjectOfRaw(text: string, kit: Kit2): string;
/** The label of a figure the user typed without a source. */
export declare const NO_SOURCE = "(your figure, source not stated)";
/** The label of a figure: the one the user typed, else the note that no source was stated; a text that already ends with its own note in brackets needs no more. */
export declare const sourceOr: (text: string, label: string) => string;
export declare function selfRef(...a: Parameters<typeof selfRefRaw>): ReturnType<typeof selfRefRaw>;
/** "thousands of companies run on it" says nothing on its own: the pronoun that ends a fact about the product is the product's name. */
declare function selfRefRaw(text: string, name: string): string;
export declare function ownNounsOf(...a: Parameters<typeof ownNounsOfRaw>): ReturnType<typeof ownNounsOfRaw>;
/** The user's own nouns: the subjects of the problem, the measures of the results and the head of the difference, each as typed (at most six). They stand in for a sector word list when the sector notes are not used. */
declare function ownNounsOfRaw(needPcs: string[], measures: string[], diffItems: string[], kit: Kit2): string[];
export {};
//# sourceMappingURL=rw-impact2.d.ts.map