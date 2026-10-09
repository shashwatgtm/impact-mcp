/** The helpers of index.ts that the sentence builders need; passed in so this file does not import index.ts. */
export interface Kit {
    kindOf(phrase: string): 'base' | 'third' | 'noun' | 'other';
    lowerFirst(t: string): string;
    toBaseVerb(third: string): string;
}
export declare function takeLabel(text: string): {
    body: string;
    label: string;
};
/** The pieces of a typed list at its top-level commas, semicolons and line ends (brackets and thousands separators stay whole). */
export declare function topLevel(text: string): string[];
/** "a, b and c"; a list whose items hold commas uses semicolons. */
export declare function joinAnd(xs: string[]): string;
/** A text cut at a clause boundary within about n characters, with no ellipsis and never ending on a joining word. */
export declare function clip(text: string, n: number): string;
/** Outcome items of a typed outcome text. A piece after a comma starts a new item only when it starts with an outcome verb, a quantity or a comparative; otherwise it
 *  belongs to the item before it ("cost management, modernization and innovation" stays whole, "in seconds, not days" stays whole). */
export declare function outcomeItems(text: string, kit: Kit): {
    items: string[];
    label: string;
};
/** An outcome item as what the customer can do ("get X", "cut Y"); null when the text is not a plain result (a sentence, a gerund, a quoted instruction). */
export declare function asInfinitive(item: string, kit: Kit): string | null;
/** The outcome as one clause after "can" or "to"; consecutive "get" items share their verb. null when an item is not a plain result. */
export declare function outcomeClause(items: string[], kit: Kit): string | null;
/** The first items of a list that fit in about n characters (at most max), at an item boundary. */
export declare function leadItems(items: string[], n?: number, max?: number): string[];
export type ProofKind = 'result' | 'recognition' | 'scale' | 'quote';
/** What kind of proof a supplied item is, and the tier it belongs to (1 customer result, 2 third party, 4 social). */
export declare function classifyProof(item: string): {
    tier: 1 | 2 | 4;
    kind: ProofKind;
};
export declare const MEASURE_LINKS: [RegExp, RegExp][];
/** How a call to action reads after "open to": "Request a scoping call" gives "a scoping call". */
export declare function ctaNoun(cta: string): string;
/** The closing list of what is missing: "To sharpen this, give: X (it would change Y); ...". null when nothing is missing. */
export declare function sharpenLine(missing: {
    give: string;
    changes: string;
}[]): string | null;
export declare function categoryNoun(category: string): string;
export declare function leadAud(text: string): string | null;
/** A sentence of the sector notes with the words of another business model taken out ("per seat or hour" reads "per hour" for a services firm). */
export declare function noSeatWords(t: string): string;
/** Strengths typed as one comma list are shared out over the cards (a "(page claims)" note at the end goes with every part); an item without such a list stays whole. */
export declare function splitStrengths(items: string[]): string[];
/** A short label for a long description: no joining word, preposition or half-open verb at its end ("previous freight forwarders working through" gives "previous freight forwarders"). */
export declare function tidyLabel(label: string): string;
/** A running name for a product typed as a description: when the shared rule leaves one word of it ("cloud-native" from "a cloud-native, composable core banking platform ..."),
 *  the noun phrase before the first clause word is used instead (at most 7 words). A name typed as a name is returned as it came. */
export declare function plainName(text: string, candidate: string): string;
export declare function specificKeys(text: string): Map<string, number>;
/** How strongly two texts are about the same thing: shared specific words (1 each, 2 for a word of six letters or more) plus 2 for a meaning pair. 0 means no link. */
export declare function linkScore(a: string, b: string): number;
/** The fragments of a product description that can stand as a lead: the items after a colon or "with", a clause after "under" or "on" (Plaid style lists keep their brackets whole). */
export declare function productParts(desc: string): string[];
/** Facts about the company that are not a reason to choose it (a funding round, a founding year, headcount). */
export declare function isCompanyFact(s: string): boolean;
/** The brand at the start of a description ("Plaid, a financial data network ..." gives "Plaid"; "Wisely from Tanla Platforms, Wisely, ..." gives "Wisely from Tanla Platforms"), or the fallback. */
export declare function brandName(desc: string, fallback: string): string;
/** A role read from a committee sentence is used only when it reads as a role: short, no verb or sentence glue, no half-open end ("finance and executive assistants are often the targets and" is not one). */
export declare function roleOk(r: string | undefined): string;
/** The parts of a product description whose words sit close to a segment's name: shared words, or a cue pair. At most three. */
export declare function segmentFit(segment: string, parts: string[]): string[];
/** Notes on segments that overlap: "Banking" inside "Financial services". */
export declare function segmentOverlap(names: string[]): string[];
export type SegType = 'education' | 'public' | 'regulated' | 'large' | 'small' | 'mid' | 'industrial' | 'retail' | 'tech' | 'telecom' | 'media' | 'other';
export declare function segmentType(name: string): SegType;
/** A part of a product description that carries a product name ("RapidX for AI driven development", "Auth (verify bank account numbers)"), not a plain phrase ("AI enhanced engineering teams"). */
export declare function isNamedPart(x: string): boolean;
export interface FactCtx {
    seg: string;
    deal: string;
    cycle: string;
    signer: string;
    motion: string;
    objections: {
        objection: string;
        response: string;
    }[];
    metrics: string[];
    parts: string[];
    fit: string[];
    usedObjections: Set<string>;
    usedMeasures: Set<string>;
    usedKinds: Map<string, number>;
}
/** Two or three facts to find out about one segment, taken from the sector notes and the user's own inputs; `order` is the position among segments of the same kind, so two such segments differ. */
export declare function segmentFacts(c: FactCtx, order: number): string[];
/** A part of a product description as a short label: a long lead sentence is cut before its first clause word ("an AI localization and translation management platform that connects to ..." gives "an AI localization and translation management platform"). */
export declare function partLabel(x: string): string;
//# sourceMappingURL=rw-impact.d.ts.map