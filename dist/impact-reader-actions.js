"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.impactReading = impactReading;
// Inputs pass the shared escaping boundary before this helper. Keep long passages
// in the main report rather than truncating a potentially escaped sequence.
const label = (value, fallback) => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 90 && !/[\r\n;,]|\.\s|page claim|page claiming|\b(?:run on|rely on|use|trust|choose) it\b/i.test(value) ? value.trim() : fallback;
const names = (value, fallback) => { const values = Array.isArray(value) ? value.map(x => label(x, '')).filter(Boolean) : []; const text = [...new Set(values)].join(', '); return text && text.length <= 180 ? text : fallback; };
const percent = (value, fallback) => typeof value === 'number' && Number.isFinite(value) ? `${(value > 0 && value < 0.1 ? 'under 0.1' : value.toLocaleString('en-US', { maximumFractionDigits: 1 }))}%` : fallback;
function impactReading(name, a) {
    let reading;
    const product = label(a.product_description ?? a.your_product ?? a.product_category ?? a.category, 'the supplied product');
    const buyer = label(a.target_customer ?? a.target_company_type, 'the proposed buyer');
    if (name === 'impact_get_framework') {
        const sector = label(a.sector, 'the supplied sector');
        reading = { meaning: `The IMPACT steps are an evidence collection method for ${sector}, not a completed positioning decision. No buyer interview or alternative comparison is supplied by selecting a sector.`, evidence: 'a confirmed buyer problem, the alternative used today and a comparable observed outcome', roles: [
                `Founder: choose one buyer problem in ${sector} to investigate before selecting a position; write down what a contrary interview would show.`,
                `CEO: name an evidence owner for the ${sector} review before assigning a delivery date; agree what would stop a market commitment.`,
                `CMO: collect the buyer's own problem wording for ${sector} before drafting the message; keep interview notes separate from the team's interpretation.`,
                `CRO: ask a buyer in ${sector} which alternative they would use without the product before accepting a competitive comparison.`,
                `Demand generation head: test whether the proposed ${sector} audience can be identified from observable account facts before building a campaign list.`,
            ] };
    }
    if (name === 'impact_identify_champions') {
        const problem = label(a.problem_solved, 'the stated problem'), price = label(a.price_point, 'the unstated price');
        reading = { meaning: `The suggested contacts for ${product} at ${buyer} are role hypotheses. A title does not confirm that its holder experiences the problem, supports the purchase or controls ${price}.`, evidence: 'direct confirmation of the problem, willingness to make an introduction and the actual approval path', roles: [
                `Founder: ask a person at ${buyer} to confirm the reported problem, "${problem}", before endorsing the champion shortlist.`,
                `CEO: confirm who may approve ${price} at ${buyer} before promising commercial terms; record the approval evidence rather than inferring authority from a title.`,
                `CMO: ask the proposed champion for their own wording of "${problem}" before using it in sales material; retain any disagreement.`,
                `CRO: ask the proposed champion at ${buyer} for an introduction to the actual approver before the next deal review; record whether it happens.`,
                `Demand generation head: check the problem and proposed role in a separate sample of ${buyer} before adding similar titles to outreach.`,
            ] };
    }
    if (name === 'impact_map_alternatives') {
        const alternatives = names(a.competitors, 'the listed alternatives'), strength = label(a.your_strengths, 'the supplied strength claim');
        reading = { meaning: `The map compares supplied descriptions of ${product} with ${alternatives}. A reported weakness or strength is not a measured comparison or proof that a buyer prefers the product.`, evidence: 'the buyer chosen criterion, comparable observations for each alternative and a result that could contradict the claimed advantage', roles: [
                `Founder: ask a buyer which of ${alternatives} they would actually choose before accepting the map; include doing nothing if the buyer names it.`,
                `CEO: agree the cost and acceptance condition for testing ${product} against the buyer's current alternative before funding a switch.`,
                `CMO: trace "${strength}" to its source before writing a superiority claim; label unmeasured outcomes as hypotheses.`,
                `CRO: ask the buyer to compare ${alternatives} under the same operating conditions before using a weakness in a deal; record where the claim fails.`,
                `Demand generation head: check whether the intended audience actually uses ${alternatives} before targeting it with a replacement message.`,
            ] };
    }
    if (name === 'impact_pinpoint_value') {
        const outcome = label(a.key_outcome, 'the proposed outcome'), capability = label(a.unique_capability, 'the stated capability');
        reading = { meaning: `The value statement links "${outcome}" to ${buyer}. The supplied observations do not on their own prove that the capability described as "${capability}" caused that outcome.`, evidence: 'the original baseline and later measurement, a matching period and scope, contrary cases and limits on attribution', roles: [
                `Founder: ask ${buyer} whether "${outcome}" changes a purchase decision before making it the central value claim.`,
                `CEO: ask the evidence owner to check the cost of delivering the capability described as "${capability}" before committing the business to the claimed benefit.`,
                `CMO: verify the original baseline, period and sample behind "${outcome}" before publishing the statement; keep attribution limits beside the figure.`,
                `CRO: agree with ${buyer} how to observe "${outcome}" before promising it in a deal; record what would fail the acceptance check.`,
                `Demand generation head: ask ${buyer} to explain the outcome in their own words before distributing the message; record responses that contradict the premise.`,
            ] };
    }
    if (name === 'impact_anchor_market') {
        const segments = names(a.potential_segments, 'the proposed segments'), price = label(a.average_deal_size, 'the unstated deal value'), cycle = label(a.sales_cycle, 'the unstated sales cycle'), fit = percent(a.percent_matching_icp, 'the displayed fit assumption'), share = percent(a.year_one_share_percent, 'the displayed share assumption');
        reading = { meaning: `The comparison of ${segments} applies the supplied account and commercial assumptions. Missing counts are unknown, and a high score is not proof of demand or the ability to win ${share}.`, evidence: 'dated account counts for each segment, observed prices and buying cycles, a checked fit sample and sales and delivery capacity', roles: [
                `Founder: verify the boundary and account source for each of ${segments} before accepting the beachhead; keep any missing count unknown.`,
                `CEO: ask sales and delivery whether they can win and serve the assumed ${share} within the planning period before funding ${product}.`,
                `CMO: test the criteria behind ${fit} on a separate account sample in ${segments} before treating the fit rate as observed.`,
                `CRO: compare ${price} and ${cycle} with completed deals in each proposed segment before adopting the revenue case; record any segment with no comparable deal.`,
                `Demand generation head: check duplicates, eligibility and evidence for the accounts counted in ${segments} before using the segment estimate to set outreach volume.`,
            ] };
    }
    if (name === 'impact_craft_message') {
        const need = label(a.customer_need, 'the stated need'), benefit = label(a.key_benefit, 'the proposed benefit'), difference = label(a.differentiation, 'the proposed difference');
        reading = { meaning: `The message is a draft for ${buyer} about "${need}". Wording a benefit clearly does not establish that "${benefit}" happens or that the proposed difference is proved.`, evidence: 'buyer recognition of the problem, observed outcomes and a fair comparison with the alternative the buyer uses', roles: [
                `Founder: ask ${buyer} whether "${need}" is the problem they would pay to solve before accepting the message.`,
                `CEO: name who can approve evidence for "${benefit}" before committing the company to that claim.`,
                `CMO: verify the source and limits of "${difference}" before using the comparison; keep any unmeasured result labelled as a hypothesis.`,
                `CRO: ask ${buyer} to name their current alternative before using the draft in a deal; check the proposed difference against that choice.`,
                `Demand generation head: test whether ${buyer} understands "${benefit}" without an explanation before distributing the message; record a wrong interpretation and revise it.`,
            ] };
    }
    if (name === 'impact_translate_execution') {
        const benefit = label(a.key_benefit, 'the proposed benefit');
        reading = { meaning: `The channel drafts adapt the supplied positioning for ${buyer}. Repeating "${benefit}" in several formats does not add evidence that it is true.`, evidence: 'a source for each claim, agreement on the buyer decision and a successful check of the proposed reader action', roles: [
                `Founder: compare the channel drafts with the original positioning for ${buyer} before approving them; remove any stronger promise introduced by adaptation.`,
                `CEO: confirm the delivery owner and acceptance condition behind "${benefit}" before authorizing the offer.`,
                `CMO: check that every use of "${benefit}" retains its evidence and limits before approving channel copy.`,
                `CRO: ask ${buyer} whether the proposed sales conversation would resolve their next decision before using the sales draft.`,
                `Demand generation head: follow the proposed reader action as ${buyer} before distribution; check the destination, permission requirement and response owner.`,
            ] };
    }
    if (name === 'impact_full_audit') {
        const alternatives = names(a.competitors, 'the listed alternatives'), difference = label(a.key_differentiation, 'the proposed difference');
        reading = { meaning: `The audit reviews the completeness of the supplied position for ${product} and ${buyer}. Its score does not prove that "${difference}" wins against ${alternatives}.`, evidence: 'contrary buyer interviews, a comparison with the real alternative and measured outcomes within the claim scope', roles: [
                `Founder: ask ${buyer} which part of the proposed position they reject before approving it; use the objection to choose the next evidence check.`,
                `CEO: name the owner of the weakest evidence gap for ${product} before funding the next positioning decision; a completeness score is not approval to scale.`,
                `CMO: compare "${difference}" with the supplied customer feedback before approving copy; keep unmeasured effects out of factual claims.`,
                `CRO: confirm which of ${alternatives} the buyer would choose before accepting the competitive story; record a deal that contradicts it.`,
                `Demand generation head: test the proposed audience of ${buyer} outside the supplied customer examples before widening distribution.`,
            ] };
    }
    if (reading) {
        const claim = label(a.key_benefit ?? a.key_outcome ?? a.your_strengths ?? a.key_differentiation, 'the unsupported claim');
        reading.heldRoles = [
            `Founder: keep "${claim}" as a hypothesis for ${buyer}; ask what observation would disprove it before endorsing it.`,
            `CEO: hold external use of "${claim}" until the evidence owner confirms its source, scope and approval.`,
            `CMO: compare "${claim}" with the original record, baseline and measurement period before approving copy; unmeasured outcomes remain unproved.`,
            `CRO: ask ${buyer} for an observed result and its limits before using "${claim}" in a deal.`,
            `Demand generation head: keep "${claim}" out of distribution to ${buyer} until the evidence and permission checks pass.`,
        ];
    }
    return reading;
}
//# sourceMappingURL=impact-reader-actions.js.map