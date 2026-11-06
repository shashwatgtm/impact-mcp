"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buyerKind = buyerKind;
exports.pinpointFraming = pinpointFraming;
exports.applyEcho = applyEcho;
const s = (v) => (typeof v === 'string' ? v.trim() : '');
function buyerKind(t) {
    const x = t.toLowerCase();
    if (/\b(cfo|chief financial|financ\w*|controller|treasur\w*|fp&a|accounting)\b/.test(x))
        return 'finance';
    if (/\b(risk|compliance|security|ciso|audit|legal)\b/.test(x))
        return 'risk';
    if (/\b(cto|cio|chief technology|chief information|engineering|it |technology|data)\b/.test(x + ' '))
        return 'technology';
    if (/\b(operations?|ops|support|service|delivery|customer)\b/.test(x))
        return 'operations';
    return 'other';
}
function pinpointFraming(args, out) {
    const who = s(args.target_customer);
    if (!who || !/\n## Proof Point Framework/.test(out))
        return out;
    const kind = buyerKind(who);
    if (kind !== 'finance' && kind !== 'operations')
        return out;
    const hasMetrics = s(args.customer_metrics).length > 0;
    const capability = s(args.unique_capability);
    const rateLike = /rate|fixed|committed|flat|capped|per[- ]\w+|included|bundled/i.test(capability);
    const L = [];
    if (kind === 'finance') {
        L.push('## Finance framing', '');
        L.push('This buyer judges the value in cash, payback and risk, not in how the work is staffed. The operational outcome matters to finance only as far as it moves a cost line, so state it as a cost.', '');
        L.push('### What finance weighs');
        L.push(`- **Cash:** ${hasMetrics ? 'the cost avoided in your customer metrics. Ask finance to confirm it is cash released, not time saved.' : 'the cost avoided. No figure was supplied: ask for the buyer\'s current annual cost of the work.'}`);
        L.push(`- **Predictability:** ${rateLike ? 'your capability is a rate, so finance can treat the spend as committed. Ask what it needs to see to call it capped.' : 'what makes the bill rise or fall, and the worst case.'}`);
        L.push('- **Payback:** the months until the cost avoided covers the cost of the change. It needs the implementation cost and the annual saving from the buyer\'s own figures. None is added here.');
        L.push('- **Risk:** what happens to the saving if volume, scope or the rate differ from plan, and how the buyer can exit.');
        L.push('- **The metric finance signs off:** cost per unit of work before and after, from the buyer\'s invoices, over a named period.', '');
        L.push('### Finance proof to ask for');
        L.push('1. Twelve months of invoices for the current way of doing the work, with the volume each covers.');
        L.push('2. The rate card or quote basis for the new cost, and what it includes and excludes.');
        L.push('3. The share of work that still goes to a person, costed at the buyer\'s own rate.');
        L.push('4. The buyer\'s agreed baseline and the date finance will check the result.', '');
    }
    else {
        L.push('## Operational framing', '');
        L.push('This buyer judges the value in daily work: coverage, staffing, quality and how fast the team can act.', '');
        L.push('### What operations weighs');
        L.push('- **Coverage:** the hours, languages and volumes the team must cover, and who covers them today.');
        L.push('- **Staffing:** how many people the work needs at peak, and what the team does when volume moves.');
        L.push('- **Quality:** how the work is checked, and what happens to a case the service cannot finish.');
        L.push('- **Handoff:** when a person takes over, with what context, and how fast.');
        L.push('- **The metric operations signs off:** coverage and handling quality over a named period, measured on the buyer\'s own work.', '');
        L.push('### Operational proof to ask for');
        L.push('1. A week of the buyer\'s own workload by hour and language.');
        L.push('2. A pilot on a slice of that workload, scored on completion and on cases passed to a person.');
        L.push('3. The escalation route and its response time.', '');
    }
    return out.replace(/\n## Proof Point Framework/, '\n' + L.join('\n') + '\n---\n\n## Proof Point Framework');
}
function applyEcho(name, args, out) {
    try {
        return name === 'impact_pinpoint_value' ? pinpointFraming(args, out) : out;
    }
    catch {
        return out;
    }
}
//# sourceMappingURL=echo-layer.js.map