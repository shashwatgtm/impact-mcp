export declare const CONVERSATION_INSTRUCTIONS = "For a full positioning review or help explaining why a product is different, ask what it does, who it serves and the problem it solves before calling. Never invent missing facts, proof or customer claims, or fill fields with placeholders. Clarify unlabelled numbers. Use impact_full_audit for the full review; impact_craft_message also fits a request only to phrase a message. Scores measure input completeness, not positioning strength.";
export declare function conversationDefinition<T extends {
    name: string;
    description: string;
    inputSchema: any;
}>(definition: T): T;
//# sourceMappingURL=conversation-guidance.d.ts.map