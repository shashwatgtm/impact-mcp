type Input = Record<string, unknown>;
type Reading = {
    meaning: string;
    evidence: string;
    roles: string[];
    heldRoles?: string[];
};
export declare function impactReading(name: string, a: Input): Reading | undefined;
export {};
//# sourceMappingURL=impact-reader-actions.d.ts.map