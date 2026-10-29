/** Pure input-derived view shared by MCP and the standalone page. No I/O or storage. */
export declare function calculatePositioning(input: Record<string, unknown>, schema?: any): {
    version: number;
    inputs: Record<string, any>;
    errors: string[];
    valid: boolean;
    evidence: any[];
    missing: string[];
    completeness: {
        scores: Record<string, number>;
        equalWeight: number;
        overall: number;
        meaning: string;
    } | null;
    alternatives: any;
    decision: {
        draft: string;
        doNotClaim: string;
        minimumValidation: string;
    } | null;
};
//# sourceMappingURL=positioning-model.d.ts.map