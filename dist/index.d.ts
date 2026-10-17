#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { type Vertical, type SubType } from './verticals.ts';
export declare function noNotes(t: string): string;
export declare function splitItems(...a: Parameters<typeof splitItemsRaw>): ReturnType<typeof splitItemsRaw>;
declare function splitItemsRaw(s: unknown): string[];
export declare const YOUR_SECTOR_VALUES: readonly ["logistics_tech", "fintech", "saas", "vertical_saas", "ai_native", "ites", "telecom", "software", "cybersecurity", "other"];
export declare function subIndustryFor(v: Vertical | null, sellerText: string): SubType | null;
export type Kind = 'base' | 'third' | 'noun' | 'other';
export declare function kindOf(phrase: string): Kind;
export declare function inf(...a: Parameters<typeof infRaw>): ReturnType<typeof infRaw>;
declare function infRaw(benefit: string): string;
export declare function needClause(...a: Parameters<typeof needClauseRaw>): ReturnType<typeof needClauseRaw>;
declare function needClauseRaw(need: string): string;
export declare function diffSentence(...a: Parameters<typeof diffSentenceRaw>): ReturnType<typeof diffSentenceRaw>;
declare function diffSentenceRaw(product: string, diff: string): string;
export declare function shortText(...a: Parameters<typeof shortTextRaw>): ReturnType<typeof shortTextRaw>;
declare function shortTextRaw(t: string, n?: number): string;
export declare function shortList(...a: Parameters<typeof shortListRaw>): ReturnType<typeof shortListRaw>;
declare function shortListRaw(t: string, n?: number): string;
export declare function catNoun(...a: Parameters<typeof catNounRaw>): ReturnType<typeof catNounRaw>;
declare function catNounRaw(category: string): string;
export declare function strengthParts(items: string[]): string[];
export declare function splitWeaknesses(...a: Parameters<typeof splitWeaknessesRaw>): ReturnType<typeof splitWeaknessesRaw>;
declare function splitWeaknessesRaw(s: unknown): string[];
export declare function labelOf(...a: Parameters<typeof labelOfRaw>): ReturnType<typeof labelOfRaw>;
declare function labelOfRaw(c: string): string;
export declare function leadPhrase(t: string): string;
export interface Committee {
    signer: string;
    champion: string;
    championInferred: boolean;
    users: string | null;
    reviewers: {
        role: string;
        does: string;
        what: string;
    }[];
}
export declare function committeeParts(v: Vertical): Committee;
interface FunctionRoles {
    id: string;
    re: RegExp;
    champion: string;
    buyer: string;
    tech: string;
    measures: string[];
    blocker: string;
    questions: string[];
    proof: string;
    vocab: string[];
}
export interface Lens {
    fn: FunctionRoles | null;
    metrics: string[];
    questions: string[];
    proof: string;
    vocab: string[];
}
export declare function namedTeams(...texts: (string | undefined)[]): string[];
export declare function functionOf(...texts: (string | undefined)[]): FunctionRoles | null;
interface IndustryRoles {
    id: string;
    re: RegExp;
    champion: string;
    buyer: string;
    tech: string;
}
export declare function industryOf(...texts: (string | undefined)[]): IndustryRoles | null;
export declare function pctText(n: number): string;
export declare function parseCounts(s: unknown): {
    name: string;
    count: number;
}[];
export declare const SERVER_NAME = "impact-mcp";
export declare const SERVER_VERSION = "2.2.26";
export declare function dropFraming(text: string): string;
export declare function createServer(): Server;
export {};
//# sourceMappingURL=index.d.ts.map