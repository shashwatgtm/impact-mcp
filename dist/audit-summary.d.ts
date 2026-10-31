export declare function auditSummary(text: string): {
    kind: string;
    reason: string;
    label?: undefined;
    draft?: undefined;
    gaps?: undefined;
    nextAction?: undefined;
    proof?: undefined;
    qualification?: undefined;
} | {
    kind: string;
    label: string;
    draft: string[];
    gaps: {
        label: string;
        detail: string;
        action: string;
    }[];
    nextAction: string;
    proof: string;
    qualification: string;
    reason?: undefined;
};
//# sourceMappingURL=audit-summary.d.ts.map