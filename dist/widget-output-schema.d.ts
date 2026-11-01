export declare function widgetOutputSchema(payload: "meta" | "full"): {
    type: "object";
    required: string[];
    properties: {
        tool?: {
            type: string;
        } | undefined;
        title?: {
            type: string;
        } | undefined;
        plainText?: {
            type: string;
        } | undefined;
        sections?: {
            type: string;
            items: {
                type: string;
            };
        } | undefined;
        presentation?: {
            type: string;
        } | undefined;
        positioningAudit: {
            oneOf: ({
                type: string;
                required: string[];
                properties: {
                    kind: {
                        const: string;
                    };
                    reason: {
                        type: string;
                    };
                };
                additionalProperties: boolean;
            } | {
                type: string;
                required: string[];
                properties: {
                    label?: {
                        type: string;
                    } | undefined;
                    nextAction?: {
                        type: string;
                    } | undefined;
                    proof?: {
                        type: string;
                    } | undefined;
                    qualification?: {
                        type: string;
                    } | undefined;
                    kind: {
                        const: string;
                    };
                    draft: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                    gaps: {
                        type: string;
                        items: {
                            type: string;
                        } | {
                            type: string;
                            required: string[];
                            properties: {
                                label: {
                                    type: string;
                                };
                                detail: {
                                    type: string;
                                };
                                action: {
                                    type: string;
                                };
                            };
                            additionalProperties: boolean;
                        };
                    };
                };
                additionalProperties: boolean;
            })[];
        };
    };
    additionalProperties: boolean;
};
//# sourceMappingURL=widget-output-schema.d.ts.map