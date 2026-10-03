#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { type Vertical } from './verticals.ts';
export declare function splitItems(s: unknown): string[];
export type Kind = 'base' | 'third' | 'noun' | 'other';
export declare function kindOf(phrase: string): Kind;
export declare function inf(benefit: string): string;
export declare function needClause(need: string): string;
export declare function diffSentence(product: string, diff: string): string;
export declare function shortText(t: string, n?: number): string;
export declare function catNoun(category: string): string;
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
export declare function pctText(n: number): string;
export declare function parseCounts(s: unknown): {
    name: string;
    count: number;
}[];
export declare const SERVER_NAME = "impact-mcp";
export declare const SERVER_VERSION = "2.2.19";
export declare function createServer(): Server;
//# sourceMappingURL=index.d.ts.map