"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readsAsProductType = readsAsProductType;
exports.pinpointEvidenceReview = pinpointEvidenceReview;
// This review is intentionally conservative. A pilot is not proof of a larger general outcome.
function readsAsProductType(raw) {
    const category = raw.replace(/\([^)]*\)/g, '').split(/[:;]/)[0].trim();
    return category.length <= 200 && !/\b(?:is|are|was|we|you|will|cannot)\b/i.test(category)
        && /\b(?:software|platform|apps?|apis?|tools?|services?|systems?|solutions?|assistants?|products?|applications?|hardware|devices?|infrastructure|networks?|links?|connectivity|suite|engine|automation|management|analytics|consultancy|consulting|support|firewall|siem|crm|erp|sd.wan|mpls)\b/i.test(category);
}
function pinpointEvidenceReview(args, displayName) {
    const category = (args.category || '').trim();
    const invalidCategory = !!category && !readsAsProductType(category);
    const percentages = (text) => [...text.matchAll(/(\d+(?:\.\d+)?)\s*%/g)].map(m => Number(m[1]));
    const claimed = percentages(args.key_outcome), evidence = args.customer_metrics || '';
    const terms = (text) => text.toLowerCase().match(/[a-z]{4,}/g)?.filter(w => !['reduce', 'increase', 'improve', 'percent', 'reduction', 'reduced', 'increased', 'improved', 'pilot', 'customer'].includes(w)) || [];
    const matched = evidence.split(/[,;\n]|(?<!\d)\.(?!\d)/).filter(clause => !/\b(?:target|goal|forecast|projected|hypothetical|withdrawn|retracted)\b/i.test(clause) && terms(args.key_outcome).some(w => clause.toLowerCase().includes(w))).flatMap(percentages);
    const above = !!(claimed.length && matched.length && Math.max(...claimed) > Math.max(...matched));
    if (!above)
        return null;
    const title = displayName || args.product_name;
    const parts = ['# Value proposition evidence review' + (title ? ': ' + title : '')];
    if (above) {
        parts.push('**Lead with the supplied evidence:** ' + evidence + '. Keep its pilot scope and limitations attached.');
        parts.push(`The supplied ${Math.max(...matched)}% is below the stated ${Math.max(...claimed)}% outcome. The larger outcome is not supported by this evidence and is held out of the message. Supply comparable customer results, the sample, source and period before using it.`);
    }
    parts.push('**Held outcome (unverified, not buyer copy):** "' + args.key_outcome + '"');
    if (args.product_name && args.product_name !== title)
        parts.push('**Product name supplied:** ' + args.product_name);
    if (invalidCategory)
        parts.push('**Missing product type:** the category describes a problem, outcome or technology rather than a product type. Supply the kind of product or service before drafting a category statement.');
    parts.push('**Capability supplied:** ' + args.unique_capability + '. Confirm how it produces the evidenced result for ' + args.target_customer + '.');
    parts.push('Use the evidenced result with its source and customer publication permission. A single pilot does not establish a general customer outcome.');
    return parts.join('\n\n');
}
//# sourceMappingURL=value-evidence.js.map