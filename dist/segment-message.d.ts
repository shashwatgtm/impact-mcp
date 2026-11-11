import { type Node } from './chain-inputs.ts';
export declare const SEGMENT_MESSAGE_TOOL = "impact_build_segment_message";
export declare const segmentMessageDefinition: {
    name: string;
    title: string;
    description: string;
    inputSchema: {
        type: "object";
        additionalProperties: boolean;
        properties: {
            stage: Node;
            brief: Node;
            review_receipt: Node;
            choices: Node;
        };
        required: string[];
    };
    annotations: {
        readOnlyHint: boolean;
        destructiveHint: boolean;
        openWorldHint: boolean;
    };
};
export type SegmentBrief = {
    product: string;
    product_description: string;
    segments: string[];
    problem: string;
    category: string;
    alternatives: string[];
    weak_points?: string;
    desired_outcome: string;
    capability: string;
    trigger: string;
    measure: string;
    sector: string;
    agreed_claim?: string;
    proof: {
        kind: 'none' | 'illustrative' | 'customer_result';
        result?: string;
        source?: string;
        period?: string;
    };
};
export type Invoke = (name: string, args: Record<string, unknown>) => Promise<{
    content?: {
        type: string;
        text?: string;
    }[];
    isError?: boolean;
}>;
export declare function containsFigure(s: string): boolean;
export declare const reviewReceipt: (brief: SegmentBrief) => string;
export declare function runSegmentMessage(input: unknown, invoke: Invoke): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
    structuredContent?: undefined;
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError?: undefined;
    structuredContent?: undefined;
} | {
    content: {
        type: string;
        text: string;
    }[];
    structuredContent: {
        champion_map: string;
        alternatives_map: string;
        champion_choices: string[];
        alternative_choices: string[];
        brief: SegmentBrief;
        review_receipt: string;
        steps: ({
            tool: string;
            passed: string;
            inputs: {
                your_sector: string;
                company_name: string;
                product_description: string;
                problem_solved: string;
                target_company_type: string;
            } | {
                your_sector?: undefined;
                company_name: string;
                product_description: string;
                problem_solved: string;
                target_company_type: string;
            };
        } | {
            tool: string;
            passed: string;
            inputs: {
                your_sector: string;
                your_product: string;
                category: string;
                competitors: string[];
                competitor_weaknesses: string | undefined;
                your_strengths: string;
            } | {
                your_sector?: undefined;
                your_product: string;
                category: string;
                competitors: string[];
                competitor_weaknesses: string | undefined;
                your_strengths: string;
            };
        })[];
        actions: {
            label: string;
            prompt: string;
        }[];
        proof_gaps: string[];
        status_quo_questions: string[];
        warnings: string[];
        category_question: string;
        tool: string;
        stage: string;
        status: string;
        answer: string;
        role_questions: string[];
    };
    isError?: undefined;
} | {
    content: {
        type: string;
        text: string;
    }[];
    structuredContent: {
        proof_status: string;
        buyer_lines: string[];
        held: string[];
        proof_plan: string[];
        buyer_test_questions: string[];
        message_pack: {
            product: string;
            target_customer: string;
            problem: string;
            alternative: string;
            buyer_lines: string[];
            capability: string;
            proof_status: string;
        };
        steps: ({
            tool: string;
            passed: string;
            inputs: {
                customer_metrics?: string | undefined;
                your_sector: string;
                product_name: string;
                category: string;
                target_customer: string;
                key_outcome: string;
                unique_capability: string;
            } | {
                customer_metrics?: string | undefined;
                your_sector?: undefined;
                product_name: string;
                category: string;
                target_customer: string;
                key_outcome: string;
                unique_capability: string;
            };
        } | {
            tool: string;
            passed: string;
            inputs: {
                your_sector: string;
                product_name: string;
                target_customer: string;
                customer_need: string;
                product_category: string;
                key_benefit: string;
                competitor: string;
                differentiation: string;
            } | {
                your_sector?: undefined;
                product_name: string;
                target_customer: string;
                customer_need: string;
                product_category: string;
                key_benefit: string;
                competitor: string;
                differentiation: string;
            };
        })[];
        actions: {
            label: string;
            prompt: string;
        }[];
        proof_gaps: string[];
        status_quo_questions: string[];
        warnings: string[];
        category_question: string;
        tool: string;
        stage: string;
        status: string;
    };
    isError?: undefined;
}>;
//# sourceMappingURL=segment-message.d.ts.map