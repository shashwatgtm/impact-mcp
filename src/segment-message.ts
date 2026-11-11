import { createHash } from 'node:crypto';
import { type Node, textField as t, validateChain, httpsUrl } from './chain-inputs.ts';
import { softwareAdvice, SOFTWARE_REFERRAL } from './software-policy.ts';
import { readSignal, claimRisk } from './text-signals.ts';
import { explainSector } from './verticals.ts';

export const SEGMENT_MESSAGE_TOOL = 'impact_build_segment_message';
const briefSchema: Node = {
  type: 'object', additionalProperties: false, description: 'The segment brief carried unchanged between calls.',
  properties: {
    product: t('The product name.'), product_description: t('What the product does, from your own brief.'),
    segments: { type: 'array', minItems: 1, maxItems: 1, items: t('The segment to work on. Keep its wording unchanged.') },
    problem: t('The problem in the champion\'s words.'), category: t('The category word you want to test.'),
    alternatives: { type: 'array', minItems: 1, maxItems: 30, items: t('An alternative, including the current approach and doing nothing.') },
    weak_points: t('Your notes about weak points to test. They are not competitor facts.'),
    desired_outcome: t('The outcome the buyer wants, without an illustrative improvement figure.'),
    capability: t('The capability that could produce that outcome.'),
    trigger: t('What makes the problem matter now.'), measure: t('The measure and its definition.'),
    sector: t('Your sector in your own words.'),
    agreed_claim: t('The agreed claim from the ChatGPT Positioning Workshop, if available. The chain starts from it when given.'),
    proof: {
      type: 'object', additionalProperties: false, required: ['kind'], properties: {
        kind: { type: 'string', enum: ['none', 'illustrative', 'customer_result'] },
        result: t('A real customer result, or the illustrative result kept out of buyer copy.'),
        source: t('The source of the customer result, using https.'),
        period: t('The period actually measured, not the publication date.'),
      },
    },
  },
  required: ['product', 'product_description', 'segments', 'problem', 'category', 'alternatives', 'desired_outcome', 'capability', 'trigger', 'measure', 'sector', 'proof'],
};
export const segmentMessageDefinition = {
  name: SEGMENT_MESSAGE_TOOL, title: 'Build our message for this segment',
  description: 'Build our message for this segment when our sellers do not use the message or buyers stay with what they have. Needs the product, segment, champion problem, alternatives, outcome, capability and proof. Returns proof gaps and current approach questions, champion and alternatives maps for human choices, then a message and proof plan after a pause. Optional agreed workshop claim is the starting point. Without a real customer result, buyer lines are unproved hypotheses and the next step is discovery questions. Chat carries the brief between calls.',
  inputSchema: {
    type: 'object' as const, additionalProperties: false, properties: {
      stage: { type: 'string', enum: ['map', 'message'], description: 'Map first. After the buyer chooses, call message with the same brief, its review receipt and confirmed choices.' } as Node,
      brief: briefSchema,
      review_receipt: t('The receipt from the map call, carried by chat. The server stores no brief.'),
      choices: {
        type: 'object', additionalProperties: false, description: 'The champion and alternative choices confirmed by the buyer after reading the maps.',
        properties: {
          confirmed: { type: 'boolean', description: 'True only after the buyer confirms these choices in chat.' },
          champion: t('The champion role or person the buyer chose. Confirmation is still a hypothesis until advocacy and access are evidenced.'),
          champion_segment: t('The confirmed target customer wording in this segment. Sent to the value tool word for word.'),
          alternative: t('The alternative chosen from the map. Sent to the message tool word for word.'),
        }, required: ['confirmed', 'champion', 'champion_segment', 'alternative'],
      } as Node,
    }, required: ['stage', 'brief'],
  },
  annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
};
export type SegmentBrief = {
  product: string; product_description: string; segments: string[]; problem: string; category: string;
  alternatives: string[]; weak_points?: string; desired_outcome: string; capability: string;
  trigger: string; measure: string; sector: string; agreed_claim?: string;
  proof: { kind: 'none' | 'illustrative' | 'customer_result'; result?: string; source?: string; period?: string };
};
type Choices = { confirmed: boolean; champion: string; champion_segment: string; alternative: string };
type Input = { stage: 'map' | 'message'; brief: SegmentBrief; review_receipt?: string; choices?: Choices };
export type Invoke = (name: string, args: Record<string, unknown>) => Promise<{ content?: { type: string; text?: string }[]; isError?: boolean }>;
const unknown = (s?: string) => !s?.trim() || /^(?:none(?: yet)?|unknown|not (?:given|stated|supplied|confirmed)|n\/?a|tbd|i (?:do not|don.t) know)[.!]?$/i.test(s.trim());
const illustrative = /\b(?:illustrative|hypothetical|example|assumed|assumption|projected|projection|target|goal|not (?:a )?(?:real|measured) result|no (?:real|measured) result)\b/i;
// Copy is held as a whole field if it contains a figure. Do not turn "not 12"
// into "12", or remove digits and leave a broken sentence with a stronger claim.
export function containsFigure(s: string): boolean {
  return /\d|[%$£₹€]|\b(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion|half|quarter|double|doubled|triple|tripled)\b/i.test(s);
}
const canonical = (v: any): any => Array.isArray(v) ? v.map(canonical) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().filter(k => v[k] !== undefined).map(k => [k, canonical(v[k])])) : v;
export const reviewReceipt = (brief: SegmentBrief): string => createHash('sha256').update(JSON.stringify(['segment-message-v1', canonical(brief)])).digest('hex');
const alternativesFor = (b: SegmentBrief) => b.alternatives.some(x => /^(?:doing|do) nothing\.?$/i.test(x.trim())) ? b.alternatives : [...b.alternatives, 'Doing nothing'];
function multipleSegments(segment: string): boolean {
  if (/[;\n]/.test(segment)) return true;
  const join = segment.search(/\s(?:and|or)\s/i), context = segment.search(/\s(?:at|in|for)\s/i);
  return join >= 0 && (context < 0 || join > context);
}
const responseText = (r: { content?: { type: string; text?: string }[] }) => r.content?.filter(c => c.type === 'text').map(c => c.text ?? '').join('\n') || '';
function proofReview(b: SegmentBrief) {
  const p = b.proof, gaps: string[] = [];
  if (p.kind !== 'customer_result') gaps.push('Proof you have: none given for the result yet.');
  if (unknown(p.result)) gaps.push('Supply a real customer result for this outcome.');
  if (unknown(p.source) || !httpsUrl(p.source ?? '')) gaps.push('Supply the source of the customer result.');
  if (unknown(p.period)) gaps.push('Supply the period actually measured.');
  if (illustrative.test([p.result, p.period].join(' '))) gaps.push('An illustrative, target or hypothetical result stays out of buyer lines.');
  if (p.result && !unknown(p.result)) {
    const reading = readSignal(p.result, /\b(?:reduced?|fell from|increased?|resolved|recorded|saved|cut|improved|prevented|detected|uncovered|identified|shortened)\b/i);
    if (reading.state !== 'affirmed' || claimRisk(p.result).hold) gaps.push('A company count, recognition, quote or adverse result does not prove this outcome. Collect a relevant customer result.');
  }
  const real = p.kind === 'customer_result' && !gaps.length;
  if (real) gaps.push('A customer result was supplied. Check that it supports this outcome in this segment. The server does not verify the source or establish causation.');
  return { real, gaps };
}
function questions(b: SegmentBrief): string[] {
  return [
    'Who keeps the current approach running today, and what happens when they are away?',
    'What breaks in the current approach when your volumes or your plans change?',
    `What makes doing nothing acceptable for ${b.segments[0]} today?`,
    'What would make this problem important enough to change the current approach?',
  ];
}
function firstSections(gaps: string[], statusQuo: string[]) {
  return `# Build our message for this segment\n\n## Proof gaps\n\n${gaps.map(x => `- ${x}`).join('\n')}\n\n## Questions about the current approach\n\n${statusQuo.map(x => `- ${x}`).join('\n')}\n`;
}
export async function runSegmentMessage(input: unknown, invoke: Invoke) {
  const segments = (input as any)?.brief?.segments;
  if (Array.isArray(segments) && segments.length !== 1) return { content: [{ type: 'text', text: 'One segment per run. Choose the segment to work on first.' }], isError: true };
  const errors = validateChain(input, segmentMessageDefinition.inputSchema as Node);
  if (errors.length) return { content: [{ type: 'text', text: errors.join('\n') }], isError: true };
  const a = input as Input, b = a.brief;
  const missing = briefSchema.required!.filter(key => briefSchema.properties![key].type === 'string' && unknown((b as any)[key]));
  if (missing.length) return { content: [{ type: 'text', text: `Supply ${missing.map(k => k.replace(/_/g, ' ')).join(', ')} in the conversation before mapping this segment.` }], isError: true };
  if (b.segments.length !== 1 || multipleSegments(b.segments[0])) return { content: [{ type: 'text', text: 'One segment per run. Choose the segment to work on first.' }], isError: true };
  if (unknown(b.segments[0]) || b.alternatives.some(unknown)) return { content: [{ type: 'text', text: 'Name the segment and the real alternatives, including the current approach, before mapping.' }], isError: true };
  if (softwareAdvice(b)) return { content: [{ type: 'text', text: SOFTWARE_REFERRAL }] };
  const sectorValues = ['logistics_tech', 'fintech', 'saas', 'vertical_saas', 'ai_native', 'ites', 'telecom', 'software', 'cybersecurity', 'other'];
  const sectorText = b.sector.trim().toLowerCase();
  const selected = sectorValues.includes(sectorText) ? sectorText : explainSector({ seller: [b.sector] }).vertical?.id.replace(/-/g, '_');
  const sectorArgs = selected ? { your_sector: selected } : {};
  const proof = proofReview(b), statusQuo = questions(b), alternatives = alternativesFor(b), receipt = reviewReceipt(b);
  const prefix = firstSections(proof.gaps, statusQuo);
  const warnings: string[] = [];
  if (/^(?:cannot|can.t|unable to|no\b|lack\b)/i.test(b.problem.trim())) warnings.push('Problem fragment: rewrite this as a complete sentence in the buyer\'s words.');
  const categoryQuestion = `Test the category word with buyers too: ${b.category}. What do they think it means?`;
  const shared = { proof_gaps: proof.gaps, status_quo_questions: statusQuo, warnings, category_question: categoryQuestion };
  const rolePrompt = 'Translate the generic role title for this segment. What has this person taken to the economic buyer, and what happened?';
  const fail = (text: string) => ({ content: [{ type: 'text', text }], isError: true });
  if (a.stage === 'map') {
    if (a.choices || a.review_receipt) return fail('Run the map without choices first. Confirm your choices after reading both maps.');
    // Independent tool calls are started side by side, without feeding either output into the other.
    const championArgs = { company_name: b.product, product_description: b.product_description, problem_solved: b.problem, target_company_type: b.segments[0], ...sectorArgs };
    const alternativeArgs = { your_product: b.product_description, category: b.category, competitors: alternatives, competitor_weaknesses: b.weak_points, your_strengths: b.capability, ...sectorArgs };
    const [champion, alternative] = await Promise.all([invoke('impact_identify_champions', championArgs), invoke('impact_map_alternatives', alternativeArgs)]);
    if (champion.isError || alternative.isError) return fail(prefix + '\nThe map needs complete inputs.\n' + responseText(champion) + '\n' + responseText(alternative));
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
    return { content: [{ type: 'text', text }], structuredContent: { tool: SEGMENT_MESSAGE_TOOL, stage: 'map', status: 'awaiting_choices', answer: 'Status: Role hypothesis; champion unconfirmed.', role_questions: [rolePrompt], ...shared, champion_map, alternatives_map, champion_choices: [role], alternative_choices: alternatives, brief: b, review_receipt: receipt, steps, actions } };
  }
  const c = a.choices;
  const deniedChampion = c && /\b(?:no champion|champion (?:is |remains )?(?:unknown|unconfirmed)|champion (?:has |is )?not (?:been )?(?:confirmed|named)|not sure who)\b/i.test(c.champion);
  if (a.review_receipt !== receipt || !c?.confirmed || unknown(c.champion) || deniedChampion || unknown(c.champion_segment) || !alternatives.includes(c.alternative)) return fail(prefix + '\nPause for your choices. Read the maps first, confirm the champion and target customer wording, then choose an alternative from that map. Carry the unchanged brief and its review receipt from the map call.');
  // Keep the segment in the confirmed target wording so a role from another segment cannot silently enter the chain.
  if (!c.champion_segment.toLowerCase().includes(b.segments[0].toLowerCase())) return fail(prefix + '\nKeep the chosen segment unchanged in the confirmed target customer wording. Run a new map if the segment changed.');
  const held: string[] = [];
  const copy = (value: string, fallback: string, field: string) => {
    if (!proof.real && (containsFigure(value) || illustrative.test(value))) { held.push(`${field}: remove the figure or illustrative claim before using this line with a buyer.`); return fallback; }
    return value;
  };
  const product = copy(b.product, 'The product', 'Product'), target = copy(c.champion_segment, 'the agreed segment', 'Target customer');
  const outcome = copy(b.desired_outcome, 'the outcome to test', 'Outcome');
  // A workshop claim can be a complete statement, not an outcome clause.
  // Keep it as the starting message instead of inserting it after "can".
  const workshopClaim = !unknown(b.agreed_claim) ? copy(b.agreed_claim!, 'The workshop claim needs review before use', 'Workshop claim') : undefined;
  const capability = copy(b.capability, 'the capability to test', 'Capability');
  const category = copy(b.category, 'product', 'Category'), problem = copy(b.problem, 'the problem to test', 'Problem');
  const alternativeName = copy(c.alternative, 'the selected alternative', 'Alternative');
  const valueArgs = { product_name: product, category, target_customer: target, key_outcome: outcome, unique_capability: capability, ...sectorArgs, ...(proof.real ? { customer_metrics: `${b.proof.result} (${b.proof.period}; ${b.proof.source})` } : {}) };
  const value = await invoke('impact_pinpoint_value', valueArgs);
  if (value.isError) return fail(prefix + '\nThe value draft needs complete inputs.\n' + responseText(value));
  const messageArgs = { product_name: product, target_customer: target, customer_need: problem, product_category: category, key_benefit: outcome, competitor: alternativeName, differentiation: capability, ...sectorArgs };
  const message = await invoke('impact_craft_message', messageArgs);
  if (message.isError) return fail(prefix + '\nThe message draft needs complete inputs.\n' + responseText(message));
  const valueText = responseText(value), messageText = responseText(message);
  // Preserve existing generated wording as internal first drafts. The buyer lines
  // are a separate explicit surface, with the proof gate applied to every line.
  const label = proof.real ? 'Value hypothesis, check against the supplied customer result' : 'Unproved hypothesis';
  const draftLines = [
    ...(workshopClaim ? [workshopClaim] : []),
    `${product} offers ${capability}, so ${target} can ${outcome.charAt(0).toLowerCase() + outcome.slice(1)}.`,
    `${product} helps ${target} ${outcome.charAt(0).toLowerCase() + outcome.slice(1)}.`,
    `${product} offers ${capability}. Compare this with ${alternativeName} before claiming a difference.`,
  ];
  const buyer_lines = draftLines.map(line => `${label}: ${line}`);
  if (!proof.real && buyer_lines.some(containsFigure)) return fail(prefix + '\nThe proof gate held the buyer lines because a figure remained. Remove it from the brief and map again.');
  const proof_plan = [
    proof.real ? `Customer result supplied for review: ${b.proof.result}. Period: ${b.proof.period}. Source: ${b.proof.source}.` : 'Proof you have: none given for the result yet.',
    'Trigger, measure and mechanism must describe the same thing. Read them side by side before using the message.',
    `Trigger: ${b.trigger}`, `Measure: ${b.measure}`, `Mechanism: ${b.capability}`,
    'Collect a comparable result on the buyer\'s own work, with its definition, period, source and permission. Record the outcome even if nothing improves.',
    'First draft until buyers test it. Record their own words and revise the alternative or trigger when they disagree.',
    ...(workshopClaim ? ['Start with the agreed workshop claim above. Check that the supplied outcome and capability support the same claim before using the other draft lines.'] : []),
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
  return { content: [{ type: 'text', text }], structuredContent: { tool: SEGMENT_MESSAGE_TOOL, stage: 'message', status: 'first_draft', ...shared, proof_status: proof.real ? 'customer_result_supplied' : 'unproved_hypothesis', buyer_lines, held, proof_plan, buyer_test_questions, message_pack: pack, steps, actions } };
}
