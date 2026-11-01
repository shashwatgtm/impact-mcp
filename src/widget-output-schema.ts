const text = { type: "string" };
const figure = {
  type: "object", required: ["key", "label", "value", "display", "example"],
  properties: { key: text, label: text, value: { type: "number" }, display: text, example: { type: "boolean" } },
  additionalProperties: false,
};
const target = { ...figure, required: ["label", "value", "display", "example"] };
const unavailable = { type: "object", required: ["kind", "reason"], properties: { kind: { const: "unavailable" }, reason: text }, additionalProperties: false };

// This contract is advertised only when the slice widget is enabled.
export function widgetOutputSchema(payload: "meta" | "full") {
  const summary = {
    type: "object", required: ["kind", "draft", "gaps"],
    properties: {
      kind: { const: "positioning-audit" }, draft: { type: "array", items: text },
      gaps: { type: "array", items: payload === "full" ? {type:"object",required:["label","detail","action"],properties:{label:text,detail:text,action:text},additionalProperties:false} : text },
      ...(payload === "full" ? {label:text,nextAction:text,proof:text,qualification:text} : {}),
    }, additionalProperties: false,
  };
  return {
    type: "object" as const, required: ["positioningAudit"],
    properties: { positioningAudit: { oneOf: [summary, unavailable] },
      ...(payload === "full" ? {tool:text,title:text,plainText:text,sections:{type:"array",items:{type:"object"}},presentation:text} : {}),
    }, additionalProperties: false,
  };
}
