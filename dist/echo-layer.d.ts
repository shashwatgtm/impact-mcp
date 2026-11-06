type Args = Record<string, unknown>;
export type BuyerKind = 'finance' | 'operations' | 'technology' | 'risk' | 'other';
export declare function buyerKind(t: string): BuyerKind;
export declare function pinpointFraming(args: Args, out: string): string;
export declare function applyEcho(name: string, args: Args, out: string): string;
export {};
//# sourceMappingURL=echo-layer.d.ts.map