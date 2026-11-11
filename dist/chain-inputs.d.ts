export type Node = {
    type: string;
    properties?: Record<string, Node>;
    required?: string[];
    enum?: readonly unknown[];
    items?: Node;
    minItems?: number;
    maxItems?: number;
    minLength?: number;
    maxLength?: number;
    additionalProperties?: boolean;
    description?: string;
};
export declare const textField: (description: string, maxLength?: number) => Node;
export declare function validateChain(value: unknown, schema: Node, path?: string): string[];
export declare function isoDate(s: string): boolean;
export declare function httpsUrl(s: string): boolean;
export declare const paragraphs: (s: string) => string[];
//# sourceMappingURL=chain-inputs.d.ts.map