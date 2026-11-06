import { BUILD_PROFILE } from "./build-profile.ts";
export const CONVERSATION_INSTRUCTIONS = "For a full positioning review or help explaining why a product is different, ask what it does, who it serves and the problem it solves before calling. Never invent missing facts, proof or customer claims, or fill fields with placeholders. Clarify unlabelled numbers. Use impact_full_audit for the full review; impact_craft_message also fits a request only to phrase a message. Scores measure input completeness, not positioning strength.";
const TOOL_NAME = "impact_full_audit";
const DESCRIPTION = "Helps you decide whether your positioning is working and what to fix first. Use for a full positioning review or when someone asks help me explain why we are different. Ask what the product does, who it serves and the problem it solves before calling; never invent these or fill missing facts with placeholders such as Not supplied. Clarify what unlabelled numbers mean. For a request only to phrase a message, impact_craft_message also fits; use this tool for the full review. You get input completeness scores, supplied proof, a positioning draft and next actions. Scores measure how complete the inputs are, not how strong the positioning is. Never invent proof.";
const FIELDS: Record<string, string> = {
  "product_description": "What the product or service does, in the user's words. Ask if missing; do not invent or use a placeholder.",
  "target_customer": "Who it serves, as supplied by the user. Ask if missing. Keep staff ranges as ranges and clarify unlabelled numbers.",
  "problem_solved": "The problem the user says they solve. Ask if missing; do not invent or use a placeholder.",
  "key_differentiation": "A difference the user can describe. Leave out if unknown; do not invent uniqueness or proof.",
  "customer_feedback": "Customer feedback actually supplied by the user. Leave out if absent; never invent quotes or outcomes."
};
export function conversationDefinition<T extends {name: string; description: string; inputSchema: any}>(definition: T): T {
  if (BUILD_PROFILE.profile === "current" || definition.name !== TOOL_NAME) return definition;
  const schema = definition.inputSchema;
  return { ...definition, description: DESCRIPTION, inputSchema: { ...schema, properties: Object.fromEntries(Object.entries(schema.properties).map(([key,value]) => [key, FIELDS[key] ? {...(value as object), description: FIELDS[key]} : value])) } };
}
