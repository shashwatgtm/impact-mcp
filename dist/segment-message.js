"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewReceipt = exports.segmentMessageDefinition = exports.SEGMENT_MESSAGE_TOOL = void 0;
exports.containsFigure = containsFigure;
exports.runSegmentMessage = runSegmentMessage;
const node_crypto_1 = require("node:crypto");
const chain_inputs_ts_1 = require("./chain-inputs.js");
const software_policy_ts_1 = require("./software-policy.js");
const text_signals_ts_1 = require("./text-signals.js");
const verticals_ts_1 = require("./verticals.js");
exports.SEGMENT_MESSAGE_TOOL = 'impact_build_segment_message';
const briefSchema = {
    type: 'object', additionalProperties: false, description: 'The segment brief carried unchanged between calls.',
    properties: {
        product: (0, chain_inputs_ts_1.textField)('The product name.'), product_description: (0, chain_inputs_ts_1.textField)('What the product does, from your own brief.'),
        segments: { type: 'array', minItems: 1, maxItems: 1, items: (0, chain_inputs_ts_1.textField)('The segment to work on. Keep its wording unchanged.') },
        problem: (0, chain_inputs_ts_1.textField)('The problem in the champion\'s words.'), category: (0, chain_inputs_ts_1.textField)('The category word you want to test.'),
        alternatives: { type: 'array', minItems: 1, maxItems: 30, items: (0, chain_inputs_ts_1.textField)('An alternative, including the current approach and doing nothing.') },
        weak_points: (0, chain_inputs_ts_1.textField)('Your notes about weak points to test. They are not competitor facts.'),
        desired_outcome: (0, chain_inputs_ts_1.textField)('The outcome the buyer wants, without an illustrative improvement figure.'),
        capability: (0, chain_inputs_ts_1.textField)('The capability that could produce that outcome.'),
        trigger: (0, chain_inputs_ts_1.textField)('What makes the problem matter now.'), measure: (0, chain_inputs_ts_1.textField)('The measure and its definition.'),
        sector: (0, chain_inputs_ts_1.textField)('Your sector in your own words.'),
        agreed_claim: (0, chain_inputs_ts_1.textField)('The agreed claim from the ChatGPT Positioning Workshop, if available. The chain starts from it when given.'),
        proof: {
            type: 'object', additionalProperties: false, required: ['kind'], properties: {
                kind: { type: 'string', enum: ['none', 'illustrative', 'customer_result'] },
                result: (0, chain_inputs_ts_1.textField)('A real customer result, or the illustrative result kept out of buyer copy.'),
                source: (0, chain_inputs_ts_1.textField)('The source of the customer result, using https.'),
                period: (0, chain_inputs_ts_1.textField)('The period actually measured, not the publication date.'),
            },
        },
    },
    required: ['product', 'product_description', 'segments', 'problem', 'category', 'alternatives', 'desired_outcome', 'capability', 'trigger', 'measure', 'sector', 'proof'],
};
exports.segmentMessageDefinition = {
    name: exports.SEGMENT_MESSAGE_TOOL, title: 'Build our message for this segment',
    description: 'Build our message for this segment when our sellers do not use the message or buyers stay with what they have. Needs the product, segment, champion problem, alternatives, outcome, capability and proof. Returns proof gaps and current approach questions, champion and alternatives maps for human choices, then a message and proof plan after a pause. Optional agreed workshop claim is the starting point. Without a real customer result, buyer lines are unproved hypotheses and the next step is discovery questions. Chat carries the brief between calls.',
    inputSchema: {
        type: 'object', additionalProperties: false, properties: {
            stage: { type: 'string', enum: ['map', 'message'], description: 'Map first. After the buyer chooses, call message with the same brief, its review receipt and confirmed choices.' },
            brief: briefSchema,
            review_receipt: (0, chain_inputs_ts_1.textField)('The receipt from the map call, carried by chat. The server stores no brief.'),
            choices: {
                type: 'object', additionalProperties: false, description: 'The champion and alternative choices confirmed by the buyer after reading the maps.',
                properties: {
                    confirmed: { type: 'boolean', description: 'True only after the buyer confirms these choices in chat.' },
                    champion: (0, chain_inputs_ts_1.textField)('The champion role or person the buyer chose. Confirmation is still a hypothesis until advocacy and access are evidenced.'),
                    champion_segment: (0, chain_inputs_ts_1.textField)('The confirmed target customer wording in this segment. Sent to the value tool word for word.'),
                    alternative: (0, chain_inputs_ts_1.textField)('The alternative chosen from the map. Sent to the message tool word for word.'),
                }, required: ['confirmed', 'champion', 'champion_segment', 'alternative'],
            },
        }, required: ['stage', 'brief'],
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
};
const unknown = (s) => !s?.trim() || /^(?:none(?: yet)?|unknown|not (?:given|stated|supplied|confirmed)|n\/?a|tbd|i (?:do not|don.t) know)[.!]?$/i.test(s.trim());
const illustrative = /\b(?:illustrative|hypothetical|example|assumed|assumption|projected|projection|target|goal|not (?:a )?(?:real|measured) result|no (?:real|measured) result)\b/i;
// Copy is held as a whole field if it contains a figure. Do not turn "not 12"
// into "12", or remove digits and leave a broken sentence with a stronger claim.
function containsFigure(s) {
    return /\d|[%$£₹€]|\b(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion|half|quarter|double|doubled|triple|tripled)\b/i.test(s);
}
const canonical = (v) => Array.isArray(v) ? v.map(canonical) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().filter(k => v[k] !== undefined).map(k => [k, canonical(v[k])])) : v;
const reviewReceipt = (brief) => (0, node_crypto_1.createHash)('sha256').update(JSON.stringify(['segment-message-v1', canonical(brief)])).digest('hex');
exports.reviewReceipt = reviewReceipt;
const alternativesFor = (b) => b.alternatives.some(x => /^(?:doing|do) nothing\.?$/i.test(x.trim())) ? b.alternatives : [...b.alternatives, 'Doing nothing'];
function multipleSegments(segment) {
    if (/[;\n]/.test(segment))
        return true;
    const join = segment.search(/\s(?:and|or)\s/i), context = segment.search(/\s(?:at|in|for)\s/i);
    return join >= 0 && (context < 0 || join > context);
}
const responseText = (r) => r.content?.filter(c => c.type === 'text').map(c => c.text ?? '').join('\n') || '';
function proofReview(b) {
    const p = b.proof, gaps = [];
    if (p.kind !== 'customer_result')
        gaps.push('Proof you have: none given for the result yet.');
    if (unknown(p.result))
        gaps.push('Supply a real customer result for this outcome.');
    if (unknown(p.source) || !(0, chain_inputs_ts_1.httpsUrl)(p.source ?? ''))
        gaps.push('Supply the source of the customer result.');
    if (unknown(p.period))
        gaps.push('Supply the period actually measured.');
    if (illustrative.test([p.result, p.period].join(' ')))
        gaps.push('An illustrative, target or hypothetical result stays out of buyer lines.');
    if (p.result && !unknown(p.result)) {
        const reading = (0, text_signals_ts_1.readSignal)(p.result, /\b(?:reduced?|fell from|increased?|resolved|recorded|saved|cut|improved|prevented|detected|uncovered|identified|shortened)\b/i);
        if (reading.state !== 'affirmed' || (0, text_signals_ts_1.claimRisk)(p.result).hold)
            gaps.push('A company count, recognition, quote or adverse result does not prove this outcome. Collect a relevant customer result.');
    }
    const real = p.kind === 'customer_result' && !gaps.length;
    if (real)
        gaps.push('A customer result was supplied. Check that it supports this outcome in this segment. The server does not verify the source or establish causation.');
    return { real, gaps };
}
function questions(b) {
    return [
        'Who keeps the current approach running today, and what happens when they are away?',
        'What breaks in the current approach when your volumes or your plans change?',
        `What makes doing nothing acceptable for ${b.segments[0]} today?`,
        'What would make this problem important enough to change the current approach?',
    ];
}
function firstSections(gaps, statusQuo) {
    return `# Build our message for this segment\n\n## Proof gaps\n\n${gaps.map(x => `- ${x}`).join('\n')}\n\n## Questions about the current approach\n\n${statusQuo.map(x => `- ${x}`).join('\n')}\n`;
}
async function runSegmentMessage(input, invoke) {
    const segments = input?.brief?.segments;
    if (Array.isArray(segments) && segments.length !== 1)
        return { content: [{ type: 'text', text: 'One segment per run. Choose the segment to work on first.' }], isError: true };
    const errors = (0, chain_inputs_ts_1.validateChain)(input, exports.segmentMessageDefinition.inputSchema);
    if (errors.length)
        return { content: [{ type: 'text', text: errors.join('\n') }], isError: true };
    const a = input, b = a.brief;
    const missing = briefSchema.required.filter(key => briefSchema.properties[key].type === 'string' && unknown(b[key]));
    if (missing.length)
        return { content: [{ type: 'text', text: `Supply ${missing.map(k => k.replace(/_/g, ' ')).join(', ')} in the conversation before mapping this segment.` }], isError: true };
    if (b.segments.length !== 1 || multipleSegments(b.segments[0]))
        return { content: [{ type: 'text', text: 'One segment per run. Choose the segment to work on first.' }], isError: true };
    if (unknown(b.segments[0]) || b.alternatives.some(unknown))
        return { content: [{ type: 'text', text: 'Name the segment and the real alternatives, including the current approach, before mapping.' }], isError: true };
    if ((0, software_policy_ts_1.softwareAdvice)(b))
        return { content: [{ type: 'text', text: software_policy_ts_1.SOFTWARE_REFERRAL }] };
    const sectorValues = ['logistics_tech', 'fintech', 'saas', 'vertical_saas', 'ai_native', 'ites', 'telecom', 'software', 'cybersecurity', 'other'];
    const sectorText = b.sector.trim().toLowerCase();
    const selected = sectorValues.includes(sectorText) ? sectorText : (0, verticals_ts_1.explainSector)({ seller: [b.sector] }).vertical?.id.replace(/-/g, '_');
    const sectorArgs = selected ? { your_sector: selected } : {};
    const proof = proofReview(b), statusQuo = questions(b), alternatives = alternativesFor(b), receipt = (0, exports.reviewReceipt)(b);
    const prefix = firstSections(proof.gaps, statusQuo);
    const warnings = [];
    if (/^(?:cannot|can.t|unable to|no\b|lack\b)/i.test(b.problem.trim()))
        warnings.push('Problem fragment: rewrite this as a complete sentence in the buyer\'s words.');
    const categoryQuestion = `Test the category word with buyers too: ${b.category}. What do they think it means?`;
    const shared = { proof_gaps: proof.gaps, status_quo_questions: statusQuo, warnings, category_question: categoryQuestion };
    const rolePrompt = 'Translate the generic role title for this segment. What has this person taken to the economic buyer, and what happened?';
    const fail = (text) => ({ content: [{ type: 'text', text }], isError: true });
    if (a.stage === 'map') {
        if (a.choices || a.review_receipt)
            return fail('Run the map without choices first. Confirm your choices after reading both maps.');
        // Independent tool calls are started side by side, without feeding either output into the other.
        const championArgs = { company_name: b.product, product_description: b.product_description, problem_solved: b.problem, target_company_type: b.segments[0], ...sectorArgs };
        const alternativeArgs = { your_product: b.product_description, category: b.category, competitors: alternatives, competitor_weaknesses: b.weak_points, your_strengths: b.capability, ...sectorArgs };
        const [champion, alternative] = await Promise.all([invoke('impact_identify_champions', championArgs), invoke('impact_map_alternatives', alternativeArgs)]);
        if (champion.isError || alternative.isError)
            return fail(prefix + '\nThe map needs complete inputs.\n' + responseText(champion) + '\n' + responseText(alternative));
        const champion_map = responseText(champion), alternatives_map = responseText(alternative);
        const role = champion_map.match(/\*\*Most Likely Role\*\*:\s*([^\n]+)/)?.[1] || 'The person who owns this problem';
        const choiceContext = `Carry this unchanged brief and review receipt to the next call only after I confirm the champion and alternative. Brief: ${JSON.stringify(b)}. Review receipt: ${receipt}.`;
        const actions = [
            { label: `Use this champion: ${role}`, prompt: `My champion choice is ${role}. Ask me to translate the title and confirm the target customer wording and alternative. ${choiceContext}` },
            ...alternatives.map(name => ({ label: `Use this alternative: ${name}`, prompt: `My alternative choice is ${name}. Confirm the champion and target customer wording with me before the message call. ${choiceContext}` })),
        ];
        const steps = [
            { tool: 'Champion identification, independent map', passed: `Product: ${b.product_description}\nProblem: ${b.problem}\nSegment: ${b.segments[0]}`, inputs: championArgs },
            { tool: 'Alternatives, independent map', passed: `Category: ${b.category}\nAlternatives: ${alternatives.join('; ')}\nCapability to test: ${b.capability}`, inputs: alternativeArgs },
        ];
        const text = `${prefix}\n## Answer card\n\nStatus: Role hypothesis; champion unconfirmed.\n\n${rolePrompt}\n\n${b.agreed_claim ? `Workshop starting claim, supplied for review: ${b.agreed_claim}\n\n` : ''}## Champion map\n\n${champion_map}\n\n## Alternatives map\n\n${alternatives_map}\n\nLexical matches identify questions to test. They do not prove that a weakness is answered.\n\n${warnings.join('\n')}\n\n${categoryQuestion}\n\n## Steps and handoffs\n\n${steps.map(s => `### ${s.tool}\n\n${s.passed}`).join('\n\n')}\n\n## Pause for your choices\n\nConfirm the champion and target customer wording, and pick the alternative to aim at. Chat carries the unchanged brief and review receipt into the message call. No message is drafted in this call.\n\nReview receipt: ${receipt}`;
        return { content: [{ type: 'text', text }], structuredContent: { tool: exports.SEGMENT_MESSAGE_TOOL, stage: 'map', status: 'awaiting_choices', answer: 'Status: Role hypothesis; champion unconfirmed.', role_questions: [rolePrompt], ...shared, champion_map, alternatives_map, champion_choices: [role], alternative_choices: alternatives, brief: b, review_receipt: receipt, steps, actions } };
    }
    const c = a.choices;
    const deniedChampion = c && /\b(?:no champion|champion (?:is |remains )?(?:unknown|unconfirmed)|champion (?:has |is )?not (?:been )?(?:confirmed|named)|not sure who)\b/i.test(c.champion);
    if (a.review_receipt !== receipt || !c?.confirmed || unknown(c.champion) || deniedChampion || unknown(c.champion_segment) || !alternatives.includes(c.alternative))
        return fail(prefix + '\nPause for your choices. Read the maps first, confirm the champion and target customer wording, then choose an alternative from that map. Carry the unchanged brief and its review receipt from the map call.');
    // Keep the segment in the confirmed target wording so a role from another segment cannot silently enter the chain.
    if (!c.champion_segment.toLowerCase().includes(b.segments[0].toLowerCase()))
        return fail(prefix + '\nKeep the chosen segment unchanged in the confirmed target customer wording. Run a new map if the segment changed.');
    const held = [];
    const copy = (value, fallback, field) => {
        if (!proof.real && (containsFigure(value) || illustrative.test(value))) {
            held.push(`${field}: remove the figure or illustrative claim before using this line with a buyer.`);
            return fallback;
        }
        return value;
    };
    const product = copy(b.product, 'The product', 'Product'), target = copy(c.champion_segment, 'the agreed segment', 'Target customer');
    const outcome = copy(b.agreed_claim || b.desired_outcome, 'the outcome to test', b.agreed_claim ? 'Workshop claim' : 'Outcome');
    const capability = copy(b.capability, 'the capability to test', 'Capability');
    const category = copy(b.category, 'product', 'Category'), problem = copy(b.problem, 'the problem to test', 'Problem');
    const alternativeName = copy(c.alternative, 'the selected alternative', 'Alternative');
    const valueArgs = { product_name: product, category, target_customer: target, key_outcome: outcome, unique_capability: capability, ...sectorArgs, ...(proof.real ? { customer_metrics: `${b.proof.result} (${b.proof.period}; ${b.proof.source})` } : {}) };
    const value = await invoke('impact_pinpoint_value', valueArgs);
    if (value.isError)
        return fail(prefix + '\nThe value draft needs complete inputs.\n' + responseText(value));
    const messageArgs = { product_name: product, target_customer: target, customer_need: problem, product_category: category, key_benefit: outcome, competitor: alternativeName, differentiation: capability, ...sectorArgs };
    const message = await invoke('impact_craft_message', messageArgs);
    if (message.isError)
        return fail(prefix + '\nThe message draft needs complete inputs.\n' + responseText(message));
    const valueText = responseText(value), messageText = responseText(message);
    // Preserve existing generated wording as internal first drafts. The buyer lines
    // are a separate explicit surface, with the proof gate applied to every line.
    const label = proof.real ? 'Value hypothesis, check against the supplied customer result' : 'Unproved hypothesis';
    const draftLines = [
        ...(b.agreed_claim ? [outcome] : []),
        `${product} offers ${capability}, so ${target} can ${outcome.charAt(0).toLowerCase() + outcome.slice(1)}.`,
        `${product} helps ${target} ${outcome.charAt(0).toLowerCase() + outcome.slice(1)}.`,
        `${product} offers ${capability}. Compare this with ${alternativeName} before claiming a difference.`,
    ];
    const buyer_lines = draftLines.map(line => `${label}: ${line}`);
    if (!proof.real && buyer_lines.some(containsFigure))
        return fail(prefix + '\nThe proof gate held the buyer lines because a figure remained. Remove it from the brief and map again.');
    const proof_plan = [
        proof.real ? `Customer result supplied for review: ${b.proof.result}. Period: ${b.proof.period}. Source: ${b.proof.source}.` : 'Proof you have: none given for the result yet.',
        'Trigger, measure and mechanism must describe the same thing. Read them side by side before using the message.',
        `Trigger: ${b.trigger}`, `Measure: ${b.measure}`, `Mechanism: ${b.capability}`,
        'Collect a comparable result on the buyer\'s own work, with its definition, period, source and permission. Record the outcome even if nothing improves.',
        'First draft until buyers test it. Record their own words and revise the alternative or trigger when they disagree.',
        categoryQuestion,
    ];
    const buyer_test_questions = [
        'After seeing the line briefly, what does the product do?',
        'How much does this problem matter to you now?',
        'What would you use instead, including staying with the current approach?',
        'What do other vendors say that sounds the same?',
        'What would you need to see to believe this claim and repeat it to the economic buyer?',
    ];
    const pack = { product, target_customer: target, problem, alternative: alternativeName, buyer_lines, capability, proof_status: proof.real ? 'Customer result supplied, check relevance' : 'Unproved hypothesis' };
    const actions = [
        ...(proof.real ? [{ label: 'Run the sales kit', prompt: `Ask CRAFT Content to run sales_enablement_content from this reviewed message pack. Keep each proof point with its source and test whether it answers the objection. ${JSON.stringify(pack)} Result: ${b.proof.result}. Source: ${b.proof.source}. Period: ${b.proof.period}.` }] : []),
        { label: 'Draft discovery questions', prompt: `Ask Revenue Enablement to run competitive_trap_setter for discovery questions about the current approach, from this message pack. Treat the capabilities as hypotheses. ${JSON.stringify(pack)}` },
    ];
    const steps = [
        { tool: 'Value, after human confirmation', passed: `Target customer: ${target}\nOutcome to test: ${outcome}\nCapability: ${capability}\nProof: ${proof.real ? b.proof.result : 'none given for the result yet'}`, inputs: valueArgs },
        { tool: 'Message, using the outcome and capability from the value brief', passed: `Target customer: ${target}\nAlternative: ${alternativeName}\nOutcome: ${outcome}\nCapability: ${capability}`, inputs: messageArgs },
    ];
    const text = `${prefix}\n${held.length ? '## Lines held by the proof gate\n\n' + held.join('\n') + '\n\n' : ''}## Message: first draft\n\n${proof.real ? 'Customer result supplied; relevance still needs review.' : 'Unproved value hypothesis. No real customer result supports these lines yet.'}\n\n${buyer_lines.join('\n\n')}\n\n## Proof plan\n\n${proof_plan.join('\n\n')}\n\n${warnings.join('\n')}\n\n## Test with five buyers\n\n${buyer_test_questions.map(q => `- ${q}`).join('\n')}\n\n## Internal tool drafts\n\nRead these as internal hypotheses, not approved buyer copy. The gated buyer lines above are the only copy surface.\n\n${valueText}\n\n${messageText}\n\n## Steps and handoffs\n\n${steps.map(s => `### ${s.tool}\n\n${s.passed}`).join('\n\n')}\n\n## Continue in chat\n\n${actions.map(x => x.label).join('\n')}\n\nFor a second pair of eyes after the buyer test, book 45 minutes: https://calendly.com/shashwat-gtmhelix/45min`;
    return { content: [{ type: 'text', text }], structuredContent: { tool: exports.SEGMENT_MESSAGE_TOOL, stage: 'message', status: 'first_draft', ...shared, proof_status: proof.real ? 'customer_result_supplied' : 'unproved_hypothesis', buyer_lines, held, proof_plan, buyer_test_questions, message_pack: pack, steps, actions } };
}
//# sourceMappingURL=segment-message.js.map