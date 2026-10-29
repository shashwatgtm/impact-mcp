(() => { const exports = {};
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePositioning = calculatePositioning;
/** Pure input-derived view shared by MCP and the standalone page. No I/O or storage. */
function calculatePositioning(input, schema) {
    const fields = ['company_name', 'product_description', 'target_customer', 'problem_solved', 'key_differentiation', 'competitors', 'current_positioning', 'customer_feedback', 'business_model', 'your_sector'];
    const required = ['product_description', 'target_customer', 'problem_solved'];
    const inputs = {};
    const errors = [];
    for (const field of fields) {
        const value = input?.[field];
        if (value === undefined || value === null)
            continue;
        if (field === 'competitors') {
            if (!Array.isArray(value) || value.some(v => typeof v !== 'string' || v.length > 4000))
                errors.push('competitors must be a list of text values of at most 4000 characters each.');
            else
                inputs[field] = value.slice();
        }
        else if (typeof value !== 'string' || value.length > 4000)
            errors.push(`${field} must be text of at most 4000 characters.`);
        else
            inputs[field] = value;
        const choices = schema?.properties?.[field]?.enum;
        if (choices && value !== '' && !choices.includes(value))
            errors.push(`${field} must be one of the supported choices.`);
    }
    for (const field of required)
        if (!inputs[field]?.trim())
            errors.push(`${field} is required.`);
    const text = (key) => typeof inputs[key] === 'string' ? inputs[key].trim() : '';
    const missingStatement = (value) => !value || /^(?:no|none|not|nil|n\/a|without)\b/i.test(value) && /\b(?:supplied|given|provided|available|known|collected|verified|measured|yet)\b/i.test(value);
    const feedback = text('customer_feedback');
    const evidence = fields.flatMap(field => {
        const values = field === 'competitors' ? inputs[field] || [] : text(field) ? [text(field)] : [];
        return values.map((value) => ({
            field, text: value, source: `User input: ${field}`, independentlyObserved: false,
            status: /\b(?:contradicted|disproven)\s*:/i.test(value) ? 'contradicted' : /\b(?:assumption|hypothesis|hypothetical)\s*:/i.test(value) ? 'assumption' : 'reported',
            missing: field === 'customer_feedback' && missingStatement(value),
        }));
    });
    const missing = fields.filter(field => field === 'customer_feedback' ? missingStatement(feedback) : field === 'competitors' ? !inputs[field]?.some((v) => v.trim()) : !text(field));
    // Mirrors the legacy audit's input completeness rules. These are never evidence or fit scores.
    const target = inputs.target_customer || '', difference = inputs.key_differentiation || 'unique approach';
    const competitors = inputs.competitors || ['Status quo', 'DIY solutions'];
    const current = inputs.current_positioning || '';
    const scoringFeedback = inputs.customer_feedback || '';
    const scores = {
        identify: target.length > 20 && target.includes(' ') ? target.length > 50 ? 85 : 70 : 45,
        map: competitors.length > 2 ? 80 : competitors.length > 0 && competitors[0] !== 'Status quo' ? 65 : 40,
        pinpoint: difference.length > 30 ? difference.includes('only') || difference.includes('unique') ? 85 : 70 : 50,
        anchor: target.includes('employees') || target.includes('revenue') || target.includes('Series') ? 80 : target.split(' ').length > 3 ? 65 : 45,
        craft: current && current.length > 50 ? current.includes('unlike') || current.includes('only') ? 85 : 70 : current ? 55 : 30,
        translate: scoringFeedback && scoringFeedback.length > 50 ? 75 : scoringFeedback ? 55 : 35,
    };
    const valid = errors.length === 0;
    return {
        version: 1, inputs, errors, valid, evidence, missing,
        completeness: valid ? { scores, equalWeight: 1, overall: Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 6), meaning: 'Input completeness only. Not positioning strength, evidence confidence or win probability.' } : null,
        alternatives: (inputs.competitors || []).filter((v) => v.trim()).map((name) => ({ name, strategicFit: 'Not assessed. No comparative evidence field exists in this tool.', evidenceConfidence: 'Unverified user input. No independent comparison supplied.' })),
        decision: valid ? {
            draft: `For ${target}, explore ${text('product_description')} for ${text('problem_solved')}.`,
            doNotClaim: 'Do not claim verified differentiation, competitor superiority, customer outcomes or win probability from these inputs.',
            minimumValidation: 'Minimum validation: confirm the owning team and problem with a source. Validate the difference against each named alternative. Supply a customer result with its source.',
        } : null,
    };
}

window.HelixPositioning = exports; })();
