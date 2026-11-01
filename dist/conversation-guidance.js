"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONVERSATION_INSTRUCTIONS = void 0;
exports.conversationDefinition = conversationDefinition;
const build_profile_ts_1 = require("./build-profile.js");
exports.CONVERSATION_INSTRUCTIONS = "For a full positioning review or help explaining why a product is different, ask what it does, who it serves and the problem it solves before calling. Never invent missing facts, proof or customer claims, or fill fields with placeholders. Clarify unlabelled numbers. Use impact_full_audit for the full review; impact_craft_message also fits a request only to phrase a message. Scores measure input completeness, not positioning strength.";
const TOOL_NAME = "impact_full_audit";
const DESCRIPTION = "Use for a full positioning review or when someone asks help me explain why we are different. Ask what the product does, who it serves and the problem it solves before calling; never invent these or fill missing facts with placeholders such as Not supplied. Clarify what unlabelled numbers mean. For a request only to phrase a message, impact_craft_message also fits; use this tool for the full review. Returns input completeness scores, supplied proof, a positioning draft and next actions. Scores measure how complete the inputs are, not how strong the positioning is. Never invent proof.";
const FIELDS = {
    "product_description": "What the product or service does, in the user's words. Ask if missing; do not invent or use a placeholder.",
    "target_customer": "Who it serves, as supplied by the user. Ask if missing. Keep staff ranges as ranges and clarify unlabelled numbers.",
    "problem_solved": "The problem the user says they solve. Ask if missing; do not invent or use a placeholder.",
    "key_differentiation": "A difference the user can describe. Leave out if unknown; do not invent uniqueness or proof.",
    "customer_feedback": "Customer feedback actually supplied by the user. Leave out if absent; never invent quotes or outcomes."
};
function conversationDefinition(definition) {
    if (build_profile_ts_1.BUILD_PROFILE.profile === "current" || definition.name !== TOOL_NAME)
        return definition;
    const schema = definition.inputSchema;
    return { ...definition, description: DESCRIPTION, inputSchema: { ...schema, properties: Object.fromEntries(Object.entries(schema.properties).map(([key, value]) => [key, FIELDS[key] ? { ...value, description: FIELDS[key] } : value])) } };
}
//# sourceMappingURL=conversation-guidance.js.map