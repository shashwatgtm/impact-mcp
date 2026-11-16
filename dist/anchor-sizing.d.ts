type Count = {
    name: string;
    count: number;
};
export declare function parseCounts(value: unknown): Count[];
export declare function allocateCounts(value: string | undefined, segments: string[]): {
    named: any;
    recommendedOnly: any;
};
export declare function cents(factors: number[], percentages: number): bigint;
export declare function dollars(value: bigint): string;
export declare function segmentTable(segments: string[], countFor: (name: string) => number | null, acv: number | null, fit: number | null, share: number | null): string;
export {};
//# sourceMappingURL=anchor-sizing.d.ts.map