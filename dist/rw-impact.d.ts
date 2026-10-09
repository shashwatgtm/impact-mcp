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
//# sourceMappingURL=rw-impact.d.ts.map