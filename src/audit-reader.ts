// Only slice and wave call this presentation pass. Scores and proof are preserved.
const actions: Record<string, string> = {
  identify: 'Describe who champions the purchase and who signs it.',
  map: 'Name the alternatives buyers use today and what they say about them.',
  pinpoint: 'State the difference and add a customer outcome you can support.',
  anchor: 'Describe the target segment and why those buyers are a fit.',
  craft: 'Write a current message using the buyer, problem and difference you supplied.',
  translate: 'Add real customer feedback and choose where to test the message.',
};
const toolActions: Record<string, string> = {
  impact_identify_champions: actions.identify, impact_map_alternatives: actions.map,
  impact_pinpoint_value: actions.pinpoint, impact_anchor_market: actions.anchor,
  impact_craft_message: actions.craft, impact_translate_execution: actions.translate,
};
const quoted = (value: unknown) => `"${String(value ?? '').trim().replace(/[.!?]+$/, '')}"`;
export function auditReader(text: string, args: Record<string, unknown>): string {
  const scores = [...text.matchAll(/^\| \*\*[IMPACT]\*\*:[^|]+\| (\d+)\/100/gm)].map(match => Number(match[1]));
  const total = /Input completeness score: (\d+)\/100/.exec(text)?.[1];
  const thin = scores.filter(score => score < 60).length;
  const detailLine = `You gave thin detail on ${thin} of 6 areas (${total ?? 'unknown'} of 100). This counts how much you told us, not how good the positioning is.`;
  text = text.replace('# IMPACT Positioning Audit\n', `# IMPACT Positioning Audit\n\n${detailLine}\n`);
  text = text.replace(/^> \*\*Who\*\*.*$/m, () => `> **Problem described**: ${quoted(args.problem_solved)}`);
  text = text.replace(/^> \*\*We\*\*.*$/m, () => args.key_differentiation ? `> **Difference described**: ${quoted(args.key_differentiation)}. Use this claim only if you can support it.` : '> **Difference**: Not supplied. Describe what is different and how you know.');
  text = text.replace('> **That** delivers a result you still have to state: write it with impact_pinpoint_value', '> **Result**: Not supplied. Add a customer outcome you can support');
  text = text.replace('> **Unlike** the alternative your buyers use most (add competitors)', '> **Alternative**: Not supplied. Name what buyers use today before using this draft');
  // Keep the original grade, but do not turn the old keyword score into a false factual gap.
  if (/\d[\d,]*(?:\s+(?:to|-|and)\s+\d[\d,]*)?\s+(?:staff|employees|people|workers|team members)\b/i.test(String(args.target_customer ?? ''))) {
    text = text.replace('Your target customer does not mention employees, revenue or a funding series. What makes a company ideal for you?', 'You supplied a staff size or range. Add the segment or buying situation that makes these companies a fit.');
  }
  for (const [name, action] of Object.entries(toolActions)) {
    text = text.replaceAll(`Run \`${name}\` to add this detail.`, action);
  }
  const work = text.split('## Areas to work on next')[1]?.split('## Proof You Already Have')[0] ?? '';
  const next = [...work.matchAll(/^### (\w+) /gm)].map(match => actions[match[1].toLowerCase()]).filter(Boolean);
  text = text.replace(/## Tools to Use Next[\s\S]*?(?=Suggested timings, lengths and counts:)/, `## Next actions\n\n${next.map((action, index) => `${index + 1}. ${action}`).join('\n')}\n`);
  // Catch the remaining generated tool references without rewriting supplied proof or quotations.
  text = text.replace(/Add current_positioning\./g, 'Add your current message.').replace(/Add customer_feedback \(what customers say, or results they report\)\./g, 'Add what customers say, or results they report.');
  return text;
}
