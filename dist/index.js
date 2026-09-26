#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SERVER_VERSION = exports.SERVER_NAME = void 0;
exports.createServer = createServer;
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
// =============================================================================
// IMPACT MCP v2.0.0 - Hypothesis-Driven B2B Positioning Engine
// =============================================================================
// IMPACT = Identify Champions, Map Alternatives, Pinpoint Value, 
//          Anchor Market, Craft Message, Translate Execution
// =============================================================================
// Output labels (run 5, owner decision 1). A figure that is not the user's input, and not computed only
// from it, carries EXAMPLE on its own line, or sits under an EXAMPLES line placed directly above its table,
// list or code block. SUGGESTED closes outputs that suggest lengths, timings or counts.
const EXAMPLE = '(Example figure: replace with your own)';
const EXAMPLES = 'Example figures: replace with your own.';
const SUGGESTED = 'Suggested timings, lengths and counts: adjust them to your own.';
// Text only (run 8): an input phrase placed mid-sentence starts in lower case ("That Fewer no-shows" becomes
// "That delivers fewer no-shows"), unless its first word is an acronym or a name with inner capitals (SMS, ExampleCo).
function mid(phrase) {
    const t = phrase.trim();
    const first = t.split(/\s+/)[0] || '';
    return /^[A-Z][a-z'-]*$/.test(first) && first !== 'I' ? t.charAt(0).toLowerCase() + t.slice(1) : t;
}
// Text only: an input phrase that starts a sentence or a headline starts with a capital.
function cap(phrase) {
    const t = phrase.trim();
    return t.charAt(0).toUpperCase() + t.slice(1);
}
// Text only: the first words of a phrase for a short tagline, without a dangling joining word at the end.
function firstWords(phrase, n) {
    const w = phrase.trim().split(/\s+/).slice(0, n);
    while (w.length > 1 && /^(with|and|or|of|for|to|the|a|an|in|on|by|that|from)$/i.test(w[w.length - 1]))
        w.pop();
    return w.join(' ');
}
// =============================================================================
// TOOL DEFINITIONS
// =============================================================================
const tools = {
    // ---------------------------------------------------------------------------
    // Tool 1: Get Framework Overview
    // ---------------------------------------------------------------------------
    impact_get_framework: {
        description: 'Get complete IMPACT framework methodology with phase-by-phase guidance',
        inputSchema: {
            type: 'object',
            properties: {
                focus_phase: {
                    type: 'string',
                    description: 'Optional: specific phase to focus on (identify/map/pinpoint/anchor/craft/translate)',
                    enum: ['identify', 'map', 'pinpoint', 'anchor', 'craft', 'translate', 'all']
                }
            }
        },
        execute: (args) => {
            const phase = args.focus_phase || 'all';
            const phases = {
                identify: `
## I - IDENTIFY CHAMPIONS

**Purpose**: Find the internal advocates who will champion your solution

### Champion Identification Framework

**Primary Champion Characteristics:**
- Owns the problem you solve (has quota/KPIs tied to it)
- Has budget authority or influence over budget holder
- Personally benefits from successful implementation
- Has credibility with decision makers

**Champion Discovery Questions:**
1. Who gets promoted if this problem gets solved?
2. Who's currently being blamed for this problem?
3. Who brought this initiative to leadership?
4. Who's actively researching solutions?

**Champion Mapping Matrix:**
| Role | Pain Level | Influence | Access to Power | Champion Score |
|------|-----------|-----------|-----------------|----------------|
| VP Sales | High | High | Direct | Strong Champion |
| Sales Ops | Very High | Medium | Indirect | Mobilizer |
| CFO | Medium | Very High | Decision Maker | Economic Buyer |

**Anti-Champion Warning Signs:**
- "Let me get back to you" (no ownership)
- Delegates to junior team members
- Only discusses features, not outcomes
- Can't articulate the business impact
`,
                map: `
## M - MAP ALTERNATIVES

**Purpose**: Understand competitive landscape and find whitespace

### Alternative Analysis Framework

**Four Categories of Alternatives:**
1. **Direct Competitors** - Same solution, same problem
2. **Indirect Competitors** - Different solution, same problem
3. **Status Quo** - Current manual/DIY approach
4. **Do Nothing** - Accept the problem exists

### Competitive Whitespace Analysis

**For each competitor, identify:**
- What they're known for (positioning territory)
- Where they're weak (opportunity zones)
- Who they serve best (segment focus)
- What they ignore (underserved needs)

**Whitespace Questions:**
1. What do customers complain about with alternatives?
2. What use cases do competitors explicitly NOT support?
3. What customer segments do competitors deprioritize?
4. What buying criteria do competitors fail on?

### Positioning Territory Map
\`\`\`
                    ENTERPRISE
                        |
    [Competitor A]      |      [YOUR WHITESPACE]
                        |
COMPLEX ----------------+---------------- SIMPLE
                        |
    [Competitor B]      |      [Competitor C]
                        |
                      SMB
\`\`\`
`,
                pinpoint: `
## P - PINPOINT UNIQUE VALUE

**Purpose**: Articulate your differentiated value with quantification

### Value Proposition Framework

**The Only Statement:**
"We are the ONLY [category] that [unique capability] so that [target customer] can [key outcome]."

**Value Quantification Matrix:**
${EXAMPLES}
| Value Driver | Metric | Before | After | Improvement |
|--------------|--------|--------|-------|-------------|
| Time Savings | Hours/week | 20 | 5 | 75% reduction |
| Error Rate | % mistakes | 15% | 2% | 87% reduction |
| Revenue Impact | $/quarter | $0 | $500K | New revenue |

### Proof Point Categories

1. **Customer Results** - Specific outcomes achieved
2. **Third-Party Validation** - Analyst recognition, awards
3. **Technical Proof** - Benchmarks, certifications
4. **Social Proof** - Logo wall, case studies, reviews

### Value Hypothesis Generator

**Input your differentiator, get quantified value:**
- Speed → "X% faster time-to-value"
- Accuracy → "X% reduction in errors"
- Coverage → "X% more [scope] supported"
- Integration → "X hours saved on [task]"
`,
                anchor: `
## A - ANCHOR IN RIGHT MARKET

**Purpose**: Select your beachhead market for focused go-to-market

### Beachhead Selection Criteria

**Score each segment (1-5) on:**
1. **Pain Intensity** - How urgent is the problem?
2. **Budget Availability** - Can they pay your price?
3. **Accessibility** - Can you reach them?
4. **Reference Value** - Will they help you expand?
5. **Competition** - Is the segment contested?

### Market Sizing (Bottom-Up)

**TAM/SAM/SOM Calculation:**
\`\`\`
TAM = Total addressable market (everyone who could buy)
    = Total potential customers × Average contract value

SAM = Serviceable addressable market (you can serve)
    = TAM × % that match your ICP

SOM = Serviceable obtainable market (realistic capture)
    = SAM × Expected market share
\`\`\`

### Beachhead Market Selection Matrix
${EXAMPLES}
| Segment | Pain (1-5) | Budget (1-5) | Access (1-5) | Reference (1-5) | Total |
|---------|------------|--------------|--------------|-----------------|-------|
| Mid-market SaaS | 5 | 4 | 5 | 5 | 19 |
| Enterprise Finance | 4 | 5 | 2 | 4 | 15 |
| SMB Retail | 3 | 2 | 4 | 2 | 11 |

**Select highest score as beachhead.**
`,
                craft: `
## C - CRAFT CORE MESSAGE

**Purpose**: Build positioning statement and messaging hierarchy

### Positioning Statement Template

**For** [target customer]
**Who** [statement of need or opportunity]
**Our** [product/service name]
**Is a** [product category]
**That** [key benefit/reason to buy]
**Unlike** [primary competitive alternative]
**We** [primary differentiation]

### Message Hierarchy

**Level 1 - Tagline (3-7 words)**
The memorable hook that captures your essence.
Example: "The AI that closes deals"

**Level 2 - Value Proposition (1-2 sentences)**
The promise you make to customers.
Example: "We help B2B sales teams close 40% more deals by automating discovery and follow-up." ${EXAMPLE}

**Level 3 - Supporting Messages (3 pillars)**
The proof points that support your promise.
${EXAMPLES}
1. Speed: "10x faster prospecting"
2. Accuracy: "AI-qualified leads only"
3. Scale: "Handle 100x more conversations"

### Message Testing Framework

**Test each message variant for:**
- Clarity (do people understand it?)
- Relevance (do people care?)
- Differentiation (is it unique to you?)
- Believability (do people trust it?)
`,
                translate: `
## T - TRANSLATE TO EXECUTION

**Purpose**: Adapt positioning for each channel and touchpoint

### Channel Adaptation Matrix

${EXAMPLES}
| Channel | Format | Length | CTA Focus | Key Message |
|---------|--------|--------|-----------|-------------|
| LinkedIn | Text + Image | 150 words | Engage | Problem awareness |
| Website Hero | Headline + Sub | 15 words | Demo | Value prop |
| Cold Email | Subject + Body | 75 words | Reply | Pain + curiosity |
| Sales Deck | Slides | 10 slides | Meeting | Full story |
| Product Demo | Script | 15 min | Trial | Capability proof |

### Execution Checklist

**Website:**
- [ ] Hero reflects positioning statement
- [ ] Features page shows differentiation
- [ ] Social proof supports claims
- [ ] CTAs align with buyer journey

**Sales Materials:**
- [ ] Deck tells positioning story
- [ ] Battle cards handle objections
- [ ] Case studies prove value
- [ ] ROI calculator quantifies impact

**Marketing Campaigns:**
- [ ] Ads target beachhead segment
- [ ] Content addresses champion's pain
- [ ] Nurture builds toward differentiation
- [ ] Events reinforce market position

### Channel Priority Calculator
Based on your ICP, prioritize channels by:
1. Where your champions research solutions
2. What content format they prefer
3. What stage of awareness they're in
`
            };
            if (phase === 'all') {
                return `# IMPACT FRAMEWORK - Complete Methodology

The IMPACT framework is a systematic approach to B2B positioning that generates actionable outputs from minimal input.

**IMPACT = Identify · Map · Pinpoint · Anchor · Craft · Translate**

${Object.values(phases).join('\n---\n')}

---

## Getting Started

1. Start with \`impact_identify_champions\` - provide company context
2. Use \`impact_map_alternatives\` - add competitor info
3. Run \`impact_pinpoint_value\` - define differentiation
4. Execute \`impact_anchor_market\` - select beachhead
5. Call \`impact_craft_message\` - build messaging
6. Finish with \`impact_translate_execution\` - channel adaptation

Or run \`impact_full_audit\` for a complete scored assessment.

${SUGGESTED}
`;
            }
            const single = phases[phase];
            // The craft phase suggests text lengths, so it ends with the suggestions footer.
            if (single && phase === 'craft') {
                return `${single}\n${SUGGESTED}\n`;
            }
            return single || 'Phase not found. Use: identify, map, pinpoint, anchor, craft, translate, or all';
        }
    },
    // ---------------------------------------------------------------------------
    // Tool 2: Identify Champions
    // ---------------------------------------------------------------------------
    impact_identify_champions: {
        description: 'Generate champion hypotheses from your company and product context',
        inputSchema: {
            type: 'object',
            properties: {
                company_name: {
                    type: 'string',
                    description: 'Your company name'
                },
                product_description: {
                    type: 'string',
                    description: 'What your product does (1-2 sentences)'
                },
                problem_solved: {
                    type: 'string',
                    description: 'The core problem you solve'
                },
                target_company_type: {
                    type: 'string',
                    description: 'Type of companies you target (e.g., "Series B SaaS", "Enterprise manufacturing")'
                },
                price_point: {
                    type: 'string',
                    description: 'Optional: ACV range (e.g., "$50K-100K")'
                }
            },
            required: ['product_description', 'problem_solved']
        },
        execute: (args) => {
            const company = args.company_name || 'not supplied';
            const targetType = args.target_company_type || 'B2B companies';
            const pricePoint = args.price_point || 'mid-market';
            // Analyze problem to generate champion hypotheses
            const problemLower = args.problem_solved.toLowerCase();
            const productLower = args.product_description.toLowerCase();
            // Champion detection logic
            let primaryChampion = { role: '', pain: '', motivation: '' };
            let economicBuyer = { role: '', concern: '', trigger: '' };
            let technicalInfluencer = { role: '', criteria: '', blocker: '' };
            // Sales-related problems
            if (problemLower.includes('sales') || problemLower.includes('revenue') || problemLower.includes('pipeline') || problemLower.includes('quota')) {
                primaryChampion = {
                    role: 'VP/Director of Sales',
                    pain: 'Missing quota, low win rates, pipeline visibility',
                    motivation: 'Compensation tied to team performance, promotion depends on hitting numbers'
                };
                economicBuyer = {
                    role: 'CRO or CEO',
                    concern: 'Revenue growth, sales efficiency, CAC:LTV ratio',
                    trigger: 'Board pressure on growth metrics, missed quarterly targets'
                };
                technicalInfluencer = {
                    role: 'Sales Operations Manager',
                    criteria: 'CRM integration, data accuracy, adoption ease',
                    blocker: 'Implementation complexity, rep pushback concerns'
                };
            }
            // Marketing-related problems
            else if (problemLower.includes('marketing') || problemLower.includes('leads') || problemLower.includes('demand') || problemLower.includes('brand')) {
                primaryChampion = {
                    role: 'VP/Director of Marketing',
                    pain: 'Lead quality issues, attribution gaps, campaign ROI',
                    motivation: 'Pipeline contribution targets, marketing-sourced revenue goals'
                };
                economicBuyer = {
                    role: 'CMO or CEO',
                    concern: 'Marketing efficiency, brand perception, market share',
                    trigger: 'Budget scrutiny, competitive pressure, growth targets'
                };
                technicalInfluencer = {
                    role: 'Marketing Operations Manager',
                    criteria: 'Tech stack integration, data flow, automation capabilities',
                    blocker: 'Existing tool overlap, migration complexity'
                };
            }
            // Operations/efficiency problems
            else if (problemLower.includes('operations') || problemLower.includes('efficiency') || problemLower.includes('process') || problemLower.includes('manual')) {
                primaryChampion = {
                    role: 'VP/Director of Operations',
                    pain: 'Manual processes, team bandwidth, scaling challenges',
                    motivation: 'Efficiency metrics, headcount optimization, process improvement KPIs'
                };
                economicBuyer = {
                    role: 'COO or CFO',
                    concern: 'Operating costs, scalability, resource utilization',
                    trigger: 'Growth without proportional headcount increase'
                };
                technicalInfluencer = {
                    role: 'Operations/Systems Manager',
                    criteria: 'Workflow automation, system reliability, learning curve',
                    blocker: 'Change management concerns, training requirements'
                };
            }
            // Engineering/technical problems
            else if (problemLower.includes('engineering') || problemLower.includes('development') || problemLower.includes('technical') || problemLower.includes('code')) {
                primaryChampion = {
                    role: 'VP/Director of Engineering',
                    pain: 'Velocity issues, technical debt, developer productivity',
                    motivation: 'Shipping targets, team satisfaction, innovation capacity'
                };
                economicBuyer = {
                    role: 'CTO or CEO',
                    concern: 'Engineering investment ROI, competitive velocity, talent retention',
                    trigger: 'Missed launches, developer turnover, competitor outpacing'
                };
                technicalInfluencer = {
                    role: 'Engineering Manager/Tech Lead',
                    criteria: 'Technical fit, learning curve, community support',
                    blocker: 'Not-invented-here syndrome, integration concerns'
                };
            }
            // Security/compliance problems
            else if (problemLower.includes('security') || problemLower.includes('compliance') || problemLower.includes('risk') || problemLower.includes('audit')) {
                primaryChampion = {
                    role: 'CISO/VP Security',
                    pain: 'Compliance gaps, incident response, visibility gaps',
                    motivation: 'Audit readiness, risk reduction metrics, board reporting'
                };
                economicBuyer = {
                    role: 'CIO or CFO',
                    concern: 'Risk exposure, compliance costs, incident costs',
                    trigger: 'Audit findings, security incident, regulatory changes'
                };
                technicalInfluencer = {
                    role: 'Security Engineer/Architect',
                    criteria: 'Technical depth, coverage breadth, false positive rates',
                    blocker: 'Alert fatigue concerns, tool sprawl'
                };
            }
            // Default/generic
            else {
                primaryChampion = {
                    role: 'Department Head (based on problem domain)',
                    pain: 'The specific problem you solve',
                    motivation: 'KPIs directly tied to problem resolution'
                };
                economicBuyer = {
                    role: 'C-level executive sponsoring the initiative',
                    concern: 'Business impact, ROI, strategic alignment',
                    trigger: 'Board pressure, competitive threats, growth requirements'
                };
                technicalInfluencer = {
                    role: 'Senior IC or Manager who implements',
                    criteria: 'Technical fit, implementation effort, ongoing maintenance',
                    blocker: 'Change resistance, competing priorities'
                };
            }
            return `# Champion Identification Analysis

## Company Context
**Company**: ${company}
**Product**: ${args.product_description}
**Problem Solved**: ${args.problem_solved}
**Target Market**: ${targetType}
**Price Point**: ${pricePoint}

---

## 🎯 Champion Hypothesis

### Primary Champion (Your Internal Advocate)
**Most Likely Role**: ${primaryChampion.role}

**Why This Role**:
- Owns the problem: ${primaryChampion.pain}
- Personal motivation: ${primaryChampion.motivation}
- Has organizational credibility to advocate for change

**Champion Validation Questions**:
1. "Who's currently responsible for solving ${args.problem_solved}?"
2. "Who brought this initiative to leadership's attention?"
3. "Who would be promoted/recognized if this problem was solved?"
4. "Who's actively researching solutions in this space?"

### Economic Buyer (Budget Authority)
**Most Likely Role**: ${economicBuyer.role}

**Why This Role**:
- Primary concern: ${economicBuyer.concern}
- Buying trigger: ${economicBuyer.trigger}

**Economic Buyer Discovery Questions**:
1. "What business metrics would this impact?"
2. "How does this tie to company strategic priorities?"
3. "What's the cost of not solving this problem?"

### Technical Influencer (Implementation Voice)
**Most Likely Role**: ${technicalInfluencer.role}

**Why This Role**:
- Evaluation criteria: ${technicalInfluencer.criteria}
- Potential blocker: ${technicalInfluencer.blocker}

**Technical Influencer Discovery Questions**:
1. "What would a successful implementation look like?"
2. "What's failed before and why?"
3. "What systems does this need to integrate with?"

---

## ⚠️ Anti-Champion Warning Signs

Watch for these red flags that indicate you're talking to the wrong person:

| Warning Sign | What It Means | Action |
|--------------|---------------|--------|
| "Let me check with my team" | No decision authority | Ask: "Who else should be in this conversation?" |
| Only discusses features | No business pain ownership | Pivot: "What happens if this doesn't get solved?" |
| Delegates to junior staff | Not a priority for them | Ask: "Who's driving this initiative?" |
| No timeline urgency | Nice-to-have, not must-have | Probe: "What changed that made this a priority now?" |

---

## 🔄 Champion Development Path

If you're starting without an identified champion:

**Week 1**: Map the organization
- Identify 3-5 potential champions based on hypotheses above
- Research their LinkedIn, recent posts, company news
- Find mutual connections for warm introductions

**Week 2**: Multi-thread outreach
- Contact ${primaryChampion.role} with problem-focused message
- Contact ${technicalInfluencer.role} with solution-focused message
- See who engages first → likely champion

**Week 3**: Validate and align
- Confirm champion's pain matches your value prop
- Understand their buying process
- Map the decision-making unit together

---

## 💡 Champion Enablement Hypothesis

Once you identify your champion, they'll need:

1. **Internal Business Case**: ROI data to share with ${economicBuyer.role}
2. **Technical Validation**: Proof points for ${technicalInfluencer.role}
3. **Competitive Comparison**: Why not alternatives (status quo, competitors)
4. **Risk Mitigation**: Implementation plan, support structure, success metrics

**Next Step**: Use \`impact_map_alternatives\` to analyze competitive landscape

${SUGGESTED}
`;
        }
    },
    // ---------------------------------------------------------------------------
    // Tool 3: Map Alternatives
    // ---------------------------------------------------------------------------
    impact_map_alternatives: {
        description: 'Analyze competitive landscape and find positioning whitespace',
        inputSchema: {
            type: 'object',
            properties: {
                your_product: {
                    type: 'string',
                    description: 'What your product does'
                },
                category: {
                    type: 'string',
                    description: 'Your product category (e.g., "Sales engagement", "Data platform")'
                },
                competitors: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'List of competitor names'
                },
                competitor_weaknesses: {
                    type: 'string',
                    description: 'Optional: Known competitor weaknesses or customer complaints'
                },
                your_strengths: {
                    type: 'string',
                    description: 'Optional: What you do better than competitors'
                }
            },
            required: ['your_product', 'category']
        },
        execute: (args) => {
            const competitors = args.competitors || ['Competitor A', 'Competitor B', 'Status Quo'];
            const weaknesses = args.competitor_weaknesses || '';
            const strengths = args.your_strengths || '';
            // Generate competitive insights based on category
            const categoryLower = args.category.toLowerCase();
            let marketContext = {
                typical_leaders: [],
                common_complaints: [],
                differentiation_axes: []
            };
            if (categoryLower.includes('sales') || categoryLower.includes('crm') || categoryLower.includes('engagement')) {
                marketContext = {
                    typical_leaders: ['Salesforce', 'HubSpot', 'Outreach', 'Salesloft', 'Gong'],
                    common_complaints: ['Too complex to customize', 'Poor data quality', 'Low rep adoption', 'Expensive seat-based pricing', 'Integration headaches'],
                    differentiation_axes: ['Ease of use', 'AI capabilities', 'Pricing model', 'Integration depth', 'Vertical specialization']
                };
            }
            else if (categoryLower.includes('marketing')) {
                marketContext = {
                    typical_leaders: ['Marketo', 'HubSpot', 'Pardot', 'ActiveCampaign', 'Klaviyo'],
                    common_complaints: ['Difficult to use without developer', 'Attribution is inaccurate', 'Limited personalization', 'Template constraints', 'Deliverability issues'],
                    differentiation_axes: ['Ease of use', 'Attribution accuracy', 'Personalization depth', 'Channel coverage', 'Analytics sophistication']
                };
            }
            else if (categoryLower.includes('data') || categoryLower.includes('analytics') || /\bbi\b/.test(categoryLower)) {
                marketContext = {
                    typical_leaders: ['Snowflake', 'Databricks', 'Tableau', 'Looker', 'dbt'],
                    common_complaints: ['Requires data team', 'Slow queries', 'Expensive at scale', 'Learning curve', 'Data freshness issues'],
                    differentiation_axes: ['Self-service capability', 'Performance at scale', 'Pricing predictability', 'Learning curve', 'Real-time capabilities']
                };
            }
            else if (categoryLower.includes('security') || categoryLower.includes('compliance')) {
                marketContext = {
                    typical_leaders: ['CrowdStrike', 'Palo Alto', 'Splunk', 'Okta', 'Snyk'],
                    common_complaints: ['Alert fatigue', 'False positives', 'Complex deployment', 'Tool sprawl', 'Pricing complexity'],
                    differentiation_axes: ['Alert quality', 'Deployment ease', 'Coverage breadth', 'Integration ecosystem', 'Pricing transparency']
                };
            }
            else {
                marketContext = {
                    typical_leaders: ['Market leaders vary by specific category'],
                    common_complaints: ['Complexity', 'Cost', 'Poor support', 'Limited customization', 'Difficult integration'],
                    differentiation_axes: ['Ease of use', 'Price/value', 'Support quality', 'Flexibility', 'Integration depth']
                };
            }
            // Parse any provided weaknesses/strengths into insights
            let customInsights = '';
            if (weaknesses) {
                customInsights += `\n**Customer-Reported Competitor Issues**:\n${weaknesses.split(/\n|,(?!\d{3}(?!\d))/).map(w => `- ${w.trim()}`).join('\n')}\n`;
            }
            if (strengths) {
                customInsights += `\n**Your Key Differentiators**:\n${strengths.split(/\n|,(?!\d{3}(?!\d))/).map(s => `- ${s.trim()}`).join('\n')}\n`;
            }
            return `# Competitive Landscape Analysis

## Market Context
**Your Product**: ${args.your_product}
**Category**: ${args.category}
**Analyzed Competitors**: ${competitors.join(', ')}

---

## 🏢 Alternative Categories

### 1. Direct Competitors (Same Solution, Same Problem)
${competitors.filter(c => c.toLowerCase() !== 'status quo' && c.toLowerCase() !== 'do nothing').map((c, i) => `
**${c}**:
- Positioning territory to check: ${marketContext.differentiation_axes[i % marketContext.differentiation_axes.length] || 'General market leader'} (a common axis in this category; nothing about ${c} was looked up)
- Weakness to test with buyers: ${marketContext.common_complaints[i % marketContext.common_complaints.length]} (a common complaint in this category, not a known fact about ${c})
- Best for: Their existing customer base, specific use cases
- Your opportunity: Differentiate on ${marketContext.differentiation_axes[(i + 1) % marketContext.differentiation_axes.length]}`).join('\n')}

### 2. Status Quo (Current Manual/DIY Approach)
**What they're doing instead**: 
- Spreadsheets and manual processes
- Existing tools cobbled together
- Junior staff doing the work manually

**Why status quo persists**:
- "Good enough" for current scale
- Change requires effort/budget
- No forcing function yet

**Breaking status quo**:
- Quantify cost of manual approach
- Show what competitors are doing
- Create urgency with market trends

### 3. Do Nothing (Accept the Problem)
**Why they might do nothing**:
- Problem not painful enough yet
- Other priorities more urgent
- Previous attempts failed

**Combating do nothing**:
- Calculate cost of inaction
- Show competitive risk
- Identify triggering events

---

## 🎯 Competitive Whitespace Analysis

### Common Market Complaints (Opportunity Areas)
${marketContext.common_complaints.map((c, i) => `${i + 1}. **${c}** → Your opportunity to excel here`).join('\n')}
${customInsights}

### Differentiation Axes
| Axis | Market Standard | Underserved Need | Your Potential Position |
|------|-----------------|------------------|------------------------|
${marketContext.differentiation_axes.map((axis, i) => `| ${axis} | Average | ${marketContext.common_complaints[i] || 'Room for improvement'} | Leader opportunity |`).join('\n')}

---

## 📊 Positioning Territory Map

\`\`\`
                    ENTERPRISE
                        │
    ┌───────────────────┼───────────────────┐
    │                   │                   │
    │  [${competitors[0] || 'Competitor A'}]  │  [YOUR WHITESPACE] │
    │                   │                   │
COMPLEX ────────────────┼──────────────────── SIMPLE
    │                   │                   │
    │  [${competitors[1] || 'Competitor B'}]  │  [${competitors[2] || 'Competitor C'}]  │
    │                   │                   │
    └───────────────────┼───────────────────┘
                        │
                      SMB
\`\`\`

**Whitespace Identification Questions**:
1. Which quadrant has the fewest strong competitors?
2. Which customer segment is underserved?
3. What complexity level is poorly addressed?
4. Where do your strengths naturally fit?

---

## 🗡️ Competitive Battle Strategy

### Against ${competitors[0] || 'Market Leader'}
**Their strength (an assumption to check with buyers)**: Established brand, large customer base
**Weakness to test with buyers**: ${marketContext.common_complaints[0]} (a common complaint in this category, not a known fact about ${competitors[0] || 'them'})
**Your attack angle**: "Unlike [them], we [your differentiation]"
**Landmine question**: "How has [competitor weakness] impacted your results?"

### Against Status Quo
**Their strength**: No change required, no budget needed
**Their weakness**: Doesn't scale, manual errors, opportunity cost
**Your attack angle**: "What's the cost of continuing this way for another year?"
**Landmine question**: "How many hours per week does your team spend on this manually?"

### Against Do Nothing
**Their strength**: Zero effort, zero risk
**Their weakness**: Competitive disadvantage, compounding problem
**Your attack angle**: "Your competitors are already solving this"
**Landmine question**: "What happens to your metrics if this problem grows 2x next year?" ${EXAMPLE}

---

## 💡 Discovery Questions for Competitive Intel

Ask prospects these questions to understand their competitive context:

1. "What have you tried before to solve this?"
2. "What other solutions are you evaluating?"
3. "What would make you choose [competitor] over us?"
4. "What didn't work about your previous approach?"
5. "What's missing from solutions you've seen?"

**Next Step**: Use \`impact_pinpoint_value\` to articulate your unique differentiation
`;
        }
    },
    // ---------------------------------------------------------------------------
    // Tool 4: Pinpoint Unique Value
    // ---------------------------------------------------------------------------
    impact_pinpoint_value: {
        description: 'Generate value proposition with quantification and proof points',
        inputSchema: {
            type: 'object',
            properties: {
                product_name: {
                    type: 'string',
                    description: 'Your product/company name'
                },
                category: {
                    type: 'string',
                    description: 'Product category'
                },
                target_customer: {
                    type: 'string',
                    description: 'Who you serve (e.g., "B2B sales teams")'
                },
                key_outcome: {
                    type: 'string',
                    description: 'The main result customers achieve'
                },
                unique_capability: {
                    type: 'string',
                    description: 'What you do that others cannot/don\'t'
                },
                customer_metrics: {
                    type: 'string',
                    description: 'Optional: Any customer results data (e.g., "40% faster, 3x pipeline")'
                }
            },
            required: ['target_customer', 'key_outcome', 'unique_capability']
        },
        execute: (args) => {
            const product = args.product_name || 'Your product';
            const category = args.category || 'solution';
            const metrics = args.customer_metrics || '';
            // Parse any provided metrics
            let quantifiedResults = {
                primary: '40%',
                secondary: '3x',
                time: '2 weeks'
            };
            if (metrics) {
                const percentMatch = metrics.match(/(\d+)%/);
                const multiplierMatch = metrics.match(/(\d+)x/);
                const timeMatch = metrics.match(/(\d+)\s*(days?|weeks?|months?)/i);
                if (percentMatch)
                    quantifiedResults.primary = percentMatch[1] + '%';
                if (multiplierMatch)
                    quantifiedResults.secondary = multiplierMatch[1] + 'x';
                if (timeMatch)
                    quantifiedResults.time = timeMatch[0];
            }
            // Labels only: a figure found in customer_metrics is the user's own; the preset ones are examples.
            const userPercent = /(\d+)%/.test(metrics);
            const userMultiplier = /(\d+)x/.test(metrics);
            const userTime = /(\d+)\s*(days?|weeks?|months?)/i.test(metrics);
            // Generate outcome-based value metrics
            const outcomeLower = args.key_outcome.toLowerCase();
            let valueMetrics = {
                time_savings: '10 hours/week',
                error_reduction: '80%',
                revenue_impact: '$500K/year',
                efficiency_gain: '3x'
            };
            if (outcomeLower.includes('revenue') || outcomeLower.includes('sales') || outcomeLower.includes('pipeline')) {
                valueMetrics = {
                    time_savings: '15 hours/week per rep',
                    error_reduction: '60% fewer missed follow-ups',
                    revenue_impact: '40% increase in pipeline',
                    efficiency_gain: '2x sales productivity'
                };
            }
            else if (outcomeLower.includes('cost') || outcomeLower.includes('saving') || outcomeLower.includes('efficiency')) {
                valueMetrics = {
                    time_savings: '20 hours/week',
                    error_reduction: '90% process automation',
                    revenue_impact: '$200K annual savings',
                    efficiency_gain: '5x throughput'
                };
            }
            else if (outcomeLower.includes('risk') || outcomeLower.includes('compliance') || outcomeLower.includes('security')) {
                valueMetrics = {
                    time_savings: '30 hours/month audit prep',
                    error_reduction: '95% coverage improvement',
                    revenue_impact: 'Avoid $1M+ breach costs',
                    efficiency_gain: '10x faster incident response'
                };
            }
            return `# Value Proposition Analysis

## Positioning Inputs
**Product**: ${args.product_name || 'not supplied'}
**Category**: ${category}
**Target Customer**: ${args.target_customer}
**Key Outcome**: ${args.key_outcome}
**Unique Capability**: ${args.unique_capability}
${metrics ? `**Reported Metrics**: ${metrics}` : ''}

---

## 🎯 The Only Statement

### Version 1 (Category-focused)
> **${product}** is the **only ${category}** with **${mid(args.unique_capability)}**, giving **${args.target_customer}** **${mid(args.key_outcome)}**.

### Version 2 (Outcome-focused)
> We help **${args.target_customer}** achieve **${mid(args.key_outcome)}** through **${mid(args.unique_capability)}**, something no other ${category} can deliver.

### Version 3 (Problem-focused)
> Unlike traditional ${/s$/i.test(category.trim()) ? category.trim() : `${category}s`}, **${product}** offers **${mid(args.unique_capability)}**, which means **${args.target_customer}** finally get **${mid(args.key_outcome)}**.

---

## 📊 Value Quantification Matrix

${EXAMPLES}
| Value Driver | Metric | Typical Before | With ${product} | Improvement |
|--------------|--------|----------------|-----------------|-------------|
| **Time Savings** | Hours saved | Manual effort | Automated | ${valueMetrics.time_savings} |
| **Error Reduction** | Accuracy | Error-prone | Reliable | ${valueMetrics.error_reduction} |
| **Revenue Impact** | Business outcome | Baseline | Optimized | ${valueMetrics.revenue_impact} |
| **Efficiency** | Productivity | 1x | Accelerated | ${valueMetrics.efficiency_gain} |

---

## 🏆 Proof Point Framework

### Tier 1: Customer Results (Strongest)
Use these patterns to document customer success:

> **"[Customer Name] achieved [specific metric] within [timeframe]"**

Example templates:
- "[Customer] increased [outcome] by ${quantifiedResults.primary} in [time frame]"${userPercent ? '' : ` ${EXAMPLE}`}
- "[Customer] saved ${valueMetrics.time_savings} previously spent on [manual task]" ${EXAMPLE}
- "[Customer] saw ${quantifiedResults.secondary} improvement in [metric]"${userMultiplier ? '' : ` ${EXAMPLE}`}

**Proof Collection Questions** (ask your existing customers):
1. "What metric improved most after implementing us?"
2. "How much time does your team save weekly?"
3. "What would you have to spend to achieve this otherwise?"
4. "What was the ROI payback period?"

### Tier 2: Third-Party Validation
- **Analyst Recognition**: industry analyst reports, G2 rankings
- **Awards**: Industry awards, innovation recognition
- **Certifications**: SOC 2, ISO 27001, industry-specific
- **Media Coverage**: Press mentions, thought leadership

### Tier 3: Technical Proof
- **Benchmarks**: Performance metrics vs. alternatives
- **Integrations**: Ecosystem partner certifications
- **Case Studies**: Detailed implementation stories
- **Demos**: Live proof of capability

### Tier 4: Social Proof
- **Logo Wall**: Recognizable customer brands
- **Reviews**: G2, Capterra, TrustRadius ratings
- **Testimonials**: Customer quotes and videos
- **Community**: User group size, engagement

---

## 💬 Value Statement Variations

### For Different Audiences

**For Champions (${args.target_customer})**:
> "Finally, ${mid(args.key_outcome)} without [current pain point]. Our customers see ${valueMetrics.revenue_impact}." ${EXAMPLE}

**For Economic Buyers (CFO/CEO)**:
> "Drive ${valueMetrics.revenue_impact} with payback in [your payback period]. Lower TCO than alternatives." ${EXAMPLE}

**For Technical Evaluators**:
> "${cap(args.unique_capability)}, delivered through [technical approach]. Integrates with your existing stack in days, not months."

### For Different Channels

**Website Hero** (15 words max):
> "${args.key_outcome.split(' ').slice(0, 3).join(' ')} for ${args.target_customer.split(' ').slice(0, 2).join(' ')}. ${quantifiedResults.primary} better results."${userPercent ? '' : ` ${EXAMPLE}`}

**LinkedIn Post** (Hook):
> "Most ${args.target_customer} struggle with [problem]. We built something different: ${mid(args.unique_capability)}."

**Cold Email** (Value prop):
> "We help companies like yours get ${mid(args.key_outcome)}. Recent customer achieved ${valueMetrics.revenue_impact}." ${EXAMPLE}

**Sales Deck** (Slide title):
> "The only ${category} with ${mid(args.unique_capability)}"

---

## 🔍 Value Validation Questions

Before finalizing, validate with prospects:

1. **Clarity**: "After hearing this, what do you think we do?"
2. **Relevance**: "How important is [key outcome] to you right now?"
3. **Differentiation**: "Have you heard anything like this from other vendors?"
4. **Believability**: "What would you need to see to believe this?"

**Next Step**: Use \`impact_anchor_market\` to select your beachhead market segment

${SUGGESTED}
`;
        }
    },
    // ---------------------------------------------------------------------------
    // Tool 5: Anchor in Right Market
    // ---------------------------------------------------------------------------
    impact_anchor_market: {
        description: 'Select a beachhead market: keyword-based segment scores and a TAM/SAM/SOM framework whose preset figures are labelled for you to replace',
        inputSchema: {
            type: 'object',
            properties: {
                product_description: {
                    type: 'string',
                    description: 'What your product does'
                },
                potential_segments: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'List of potential market segments (e.g., ["Mid-market SaaS", "Enterprise Finance", "SMB Retail"])'
                },
                current_customers: {
                    type: 'string',
                    description: 'Optional: Description of your current/best customers'
                },
                average_deal_size: {
                    type: 'string',
                    description: 'Optional: Your ACV as one amount (e.g., "$50,000", "$50K" or "$1.5M"); a range is refused'
                },
                sales_cycle: {
                    type: 'string',
                    description: 'Optional: Typical sales cycle length'
                }
            },
            required: ['product_description']
        },
        execute: (args) => {
            const segments = args.potential_segments || ['Mid-market SaaS (50-500 employees)', 'Enterprise Tech (500+ employees)', 'SMB (10-50 employees)'];
            const acv = args.average_deal_size || '$30,000';
            const cycle = args.sales_cycle || '3-6 months';
            // Parse ACV for calculations
            const acvNumber = readAmount(acv) || 30000;
            // Generate segment scores (these would be based on analysis in real implementation)
            const segmentScores = segments.map((segment, index) => {
                const segmentLower = segment.toLowerCase();
                let scores = {
                    pain: 3,
                    budget: 3,
                    access: 3,
                    reference: 3,
                    competition: 3
                };
                if (segmentLower.includes('enterprise')) {
                    scores = { pain: 4, budget: 5, access: 2, reference: 5, competition: 2 };
                }
                else if (segmentLower.includes('mid-market') || segmentLower.includes('mid market')) {
                    scores = { pain: 5, budget: 4, access: 4, reference: 4, competition: 3 };
                }
                else if (segmentLower.includes('smb') || segmentLower.includes('small')) {
                    scores = { pain: 4, budget: 2, access: 5, reference: 2, competition: 4 };
                }
                else if (segmentLower.includes('saas') || segmentLower.includes('tech')) {
                    scores = { pain: 5, budget: 4, access: 4, reference: 5, competition: 3 };
                }
                else if (segmentLower.includes('finance') || segmentLower.includes('fintech')) {
                    scores = { pain: 4, budget: 5, access: 3, reference: 4, competition: 2 };
                }
                return {
                    name: segment,
                    ...scores,
                    total: scores.pain + scores.budget + scores.access + scores.reference + scores.competition
                };
            });
            // Sort by total score
            segmentScores.sort((a, b) => b.total - a.total);
            const beachhead = segmentScores[0];
            // Calculate TAM/SAM/SOM for beachhead
            const tamMultiplier = beachhead.name.toLowerCase().includes('enterprise') ? 50000 :
                beachhead.name.toLowerCase().includes('mid') ? 100000 : 500000;
            const tam = tamMultiplier * acvNumber;
            const sam = tam * 0.3; // 30% serviceable
            const som = sam * 0.05; // 5% obtainable year 1
            // Labels only: values the user did not supply are preset examples.
            const acvEx = args.average_deal_size ? '' : ` ${EXAMPLE}`;
            const cycleEx = args.sales_cycle ? '' : ` ${EXAMPLE}`;
            const segEx = args.potential_segments ? '' : ` ${EXAMPLE}`;
            const sizeIsUsers = !!args.potential_segments && beachhead.name.includes('(') && !!beachhead.name.match(/\(([^)]+)\)/)?.[1];
            return `# Beachhead Market Selection

## Market Context
**Product**: ${args.product_description}
**Average Deal Size**: ${acv}${acvEx}
**Sales Cycle**: ${cycle}${cycleEx}
${args.current_customers ? `**Current Customers**: ${args.current_customers}` : ''}

---

## 📊 Segment Scoring Matrix

### Scoring Criteria (1-5 scale)
- **Pain Intensity**: How urgent is the problem?
- **Budget Availability**: Can they pay your price?
- **Accessibility**: Can you reach them?
- **Reference Value**: Will they help you expand?
- **Competition**: Is the segment less contested?

### Segment Scores

These scores are presets, not research on your market: each segment is scored from keywords in its name (enterprise, mid-market, SMB, small, SaaS, tech, finance), and a segment with none of these keywords gets the middle score on every criterion.${args.potential_segments ? '' : ' You supplied no segments, so the segments are examples too.'}
${EXAMPLES}
| Segment | Pain | Budget | Access | Reference | Competition | **TOTAL** |
|---------|------|--------|--------|-----------|-------------|-----------|
${segmentScores.map((s, i) => `| ${i === 0 ? '**' + s.name + '** ⭐' : s.name} | ${s.pain} | ${s.budget} | ${s.access} | ${s.reference} | ${s.competition} | **${s.total}** |`).join('\n')}

---

## 🎯 Recommended Beachhead: ${beachhead.name}${segEx}

### Why This Segment Wins

${EXAMPLES}
**Highest Score (${beachhead.total}/25)** based on:
${beachhead.pain >= 4 ? `- ✅ **High Pain Intensity** (${beachhead.pain}/5): Urgent problem that demands solution` : `- ⚠️ Pain Level (${beachhead.pain}/5): May need more urgency creation`}
${beachhead.budget >= 4 ? `- ✅ **Strong Budget** (${beachhead.budget}/5): Can afford ${acv} ACV` : `- ⚠️ Budget (${beachhead.budget}/5): May need pricing flexibility`}
${beachhead.access >= 4 ? `- ✅ **Easy Access** (${beachhead.access}/5): Can reach through existing channels` : `- ⚠️ Accessibility (${beachhead.access}/5): May need channel development`}
${beachhead.reference >= 4 ? `- ✅ **High Reference Value** (${beachhead.reference}/5): Great logos for expansion` : `- ⚠️ Reference Value (${beachhead.reference}/5): May need additional segments for logos`}
${beachhead.competition >= 4 ? `- ✅ **Low Competition** (${beachhead.competition}/5): White space opportunity` : `- ⚠️ Competition (${beachhead.competition}/5): Need clear differentiation`}

---

## 📈 Market Sizing (Bottom-Up Calculation)

### TAM/SAM/SOM for ${beachhead.name}${segEx}

The company count, ICP share and market share below are presets for this type of segment, not research on your market, so every total computed from them is an example.

**Total Addressable Market (TAM)**
${EXAMPLES}
\`\`\`
TAM = Total potential customers × ACV
TAM = ~${(tamMultiplier).toLocaleString('en-US')} companies × ${acv}
TAM = $${(tam / 1000000).toFixed(1)}M
\`\`\`

**Serviceable Addressable Market (SAM)**
${EXAMPLES}
\`\`\`
SAM = TAM × % that match your ICP
SAM = $${(tam / 1000000).toFixed(1)}M × 30% (have the problem + right profile)
SAM = $${(sam / 1000000).toFixed(1)}M
\`\`\`

**Serviceable Obtainable Market (SOM)**
${EXAMPLES}
\`\`\`
SOM = SAM × Expected market share (Year 1)
SOM = $${(sam / 1000000).toFixed(1)}M × 5%
SOM = $${(som / 1000000).toFixed(2)}M
\`\`\`

### Market Sizing Assumptions
${EXAMPLES}${args.average_deal_size ? ' The average deal size is your input.' : ''}
| Assumption | Value | How to check it |
|------------|-------|-----------------|
| Total companies in segment | ~${tamMultiplier.toLocaleString('en-US')} | Industry databases, LinkedIn |
| % with problem | 30% | Customer research |
| Year 1 market share | 5% | Your sales capacity and win rate |
| Average deal size | ${acv} | Current pipeline data |

**⚠️ Validation Required**: These are hypothesis numbers. Validate with:
1. Industry analyst reports
2. LinkedIn Sales Navigator company counts
3. Customer interviews on market size perception

---

## 🗺️ Beachhead Expansion Path

### Year 1: Dominate ${beachhead.name}${segEx}
${EXAMPLES}
- Focus: 100% of GTM on this segment
- Goal: ${Math.round(som / acvNumber)} customers
- Revenue: $${(som / 1000000).toFixed(2)}M ARR

### Year 2: Adjacent Expansion
- Add: ${segmentScores[1]?.name || 'Next highest-scoring segment'}${segmentScores[1] ? segEx : ''}
- Leverage: References from beachhead customers
- Goal: 2x customer base ${EXAMPLE}

### Year 3: Market Leadership
- Expand: Full SAM coverage
- Position: Category leader in ${beachhead.name}${segEx}
- Goal: 10% market share ${EXAMPLE}

---

## 💡 ICP Hypothesis for ${beachhead.name}${segEx}

Based on beachhead selection, your ICP likely includes:

**Company Characteristics**:
- Industry: ${beachhead.name.split('(')[0].trim()}
- Size: ${beachhead.name.includes('(') ? beachhead.name.match(/\(([^)]+)\)/)?.[1] || '50-500 employees' : '50-500 employees'}${sizeIsUsers ? '' : ` ${EXAMPLE}`}
- Tech stack: Modern, willing to adopt new tools
- Growth stage: Series B+ or established

**Buying Characteristics**:
- Budget: ${acv}+ available${acvEx}
- Decision maker: ${beachhead.budget >= 4 ? 'VP/C-level accessible' : 'Manager-level start'}
- Sales cycle: ${cycle}${cycleEx}
- Buying trigger: Growth pressure, competitive threat

**Next Step**: Use \`impact_craft_message\` to build positioning for this beachhead
`;
        }
    },
    // ---------------------------------------------------------------------------
    // Tool 6: Craft Core Message
    // ---------------------------------------------------------------------------
    impact_craft_message: {
        description: 'Build positioning statement and message hierarchy with variations',
        inputSchema: {
            type: 'object',
            properties: {
                product_name: {
                    type: 'string',
                    description: 'Your product name'
                },
                target_customer: {
                    type: 'string',
                    description: 'Target customer description'
                },
                customer_need: {
                    type: 'string',
                    description: 'The need or opportunity they have'
                },
                product_category: {
                    type: 'string',
                    description: 'Your product category'
                },
                key_benefit: {
                    type: 'string',
                    description: 'Primary benefit/reason to buy'
                },
                competitor: {
                    type: 'string',
                    description: 'Primary alternative/competitor'
                },
                differentiation: {
                    type: 'string',
                    description: 'Your unique differentiation'
                }
            },
            required: ['target_customer', 'key_benefit', 'differentiation']
        },
        execute: (args) => {
            const product = args.product_name || '[Your Product]';
            const category = args.product_category || 'solution';
            const competitor = args.competitor || 'traditional alternatives';
            const need = mid(args.customer_need || `need ${mid(args.key_benefit)}`);
            const benefit = mid(args.key_benefit);
            const diff = mid(args.differentiation);
            return `# Positioning & Messaging Framework

## Positioning Inputs
- **Product**: ${args.product_name || 'not supplied'}
- **Target Customer**: ${args.target_customer}
- **Need/Opportunity**: ${need}
- **Category**: ${category}
- **Key Benefit**: ${args.key_benefit}
- **Primary Alternative**: ${competitor}
- **Differentiation**: ${args.differentiation}

---

## 🎯 Positioning Statement

### Complete Positioning Statement

> **For** ${args.target_customer}
> **Who** ${need}
> **${product}** **is a** ${category}
> **That** delivers ${benefit}
> **Unlike** ${competitor}
> **We** offer ${diff}

### One-Paragraph Version
> ${product} is the ${category} for ${args.target_customer} who ${need}. Unlike ${competitor}, we offer ${diff}, which means you get ${benefit}.

### One-Sentence Version
> ${product} gives ${args.target_customer} ${benefit} through ${diff}.

---

## 📋 Message Hierarchy

### Level 1: Tagline (3-7 words)
Choose the style that fits your brand:

| Style | Tagline | Best For |
|-------|---------|----------|
| **Outcome** | "${cap(firstWords(args.key_benefit, 4))}" | Clarity |
| **Differentiator** | "The only ${category} with ${firstWords(diff, 3)}" | Uniqueness |
| **Audience** | "Built for ${firstWords(args.target_customer, 3)}" | Targeting |
| **Provocative** | "Stop ${args.key_benefit.includes('increase') ? 'losing' : 'wasting'}. Start winning." | Attention |

### Level 2: Value Proposition (1-2 sentences)
**Option A - Problem-Solution**:
> "If you ${need}, ${product} offers ${diff}, so you finally get ${benefit}."

**Option B - Outcome-First**:
> "Get ${benefit} [Only if true and provable: without the complexity of ${competitor}]. ${product} offers ${diff}."

**Option C - Unique Mechanism**:
> "The only ${category} with ${diff}. That's how ${args.target_customer} get ${benefit}."

### Level 3: Supporting Pillars (3 proof points)

| Pillar | Message | Proof Point |
|--------|---------|-------------|
| **Speed** | "Achieve results in days, not months" | Implementation time, time-to-value |
| **Simplicity** | "No complexity, no consultants" | Ease of use, self-service |
| **Scale** | "Grows with you from startup to enterprise" | Customer range, flexibility |

---

## 🔄 Message Variations

### A/B Testing Options

**Variation A - Lead with Pain**:
> "Tired of ${competitor.toLowerCase().replace('traditional ', '')}? ${product} offers ${diff}."

**Variation B - Lead with Outcome**:
> "${cap(args.key_benefit)}. That's what ${args.target_customer} get with ${product}."

**Variation C - Lead with Differentiation**:
> "Unlike ${competitor}, ${product} offers ${diff}. Finally, ${benefit}."

**Variation D - Lead with Social Proof**:
> "Join 100+ ${args.target_customer.split(' ').slice(-1)[0]} who get ${benefit} with ${product}." ${EXAMPLE}

### Audience-Specific Messaging

**For Champions (${args.target_customer})**:
> "We built ${product} because [Only if true and provable: ${competitor} wasn't cutting it for teams like yours]. Now you can get ${benefit} without the usual headaches."

**For Economic Buyers (Executives)**:
> "Drive measurable ${args.key_benefit.includes('revenue') || args.key_benefit.includes('growth') ? 'growth' : 'ROI'} with ${product}. [Only if true and provable: lower TCO than ${competitor}]"

**For Technical Evaluators**:
> "${product} offers ${diff} through a ${category} architecture designed for ${args.target_customer}."

---

## ✅ Message Testing Checklist

Before finalizing, test each message for:

| Criterion | Question | Pass/Fail |
|-----------|----------|-----------|
| **Clarity** | Do people understand what you do? | ☐ |
| **Relevance** | Do people care about this? | ☐ |
| **Differentiation** | Does this sound unique? | ☐ |
| **Believability** | Do people trust this claim? | ☐ |
| **Memorability** | Can people repeat it back? | ☐ |

### Testing Methods
1. **5-Second Test**: Show homepage, ask what you do
2. **Comparison Test**: Show yours vs competitor, ask preference
3. **Repeat-Back Test**: Explain, wait 24 hours, ask them to describe you
4. **Customer Validation**: Ask existing customers to confirm accuracy

---

## 💬 Objection Handling Messages

| Objection | Response Message |
|-----------|------------------|
| "We use ${competitor}" | "[Only if true and provable: many of our customers switched from ${competitor}.] They found that ${diff} delivered ${benefit}." |
| "Too expensive" | "Consider the cost of doing nothing about it. Our customers typically see ROI in [X] months." |
| "We're not ready" | "That's exactly when our best customers started. ${product} is designed for ${args.target_customer} at your stage." |
| "Need to think about it" | "Absolutely. While you're evaluating, here's a case study of how [similar company] achieved ${benefit}." |

**Next Step**: Use \`impact_translate_execution\` to adapt these messages for each channel

${SUGGESTED}
`;
        }
    },
    // ---------------------------------------------------------------------------
    // Tool 7: Translate to Execution
    // ---------------------------------------------------------------------------
    impact_translate_execution: {
        description: 'Adapt positioning for specific channels and touchpoints',
        inputSchema: {
            type: 'object',
            properties: {
                positioning_statement: {
                    type: 'string',
                    description: 'Your core positioning statement'
                },
                target_customer: {
                    type: 'string',
                    description: 'Target customer profile'
                },
                key_benefit: {
                    type: 'string',
                    description: 'Primary benefit'
                },
                channels: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Accepted but not used yet: the output always covers website, LinkedIn, email, sales deck and demo'
                },
                product_name: {
                    type: 'string',
                    description: 'Your product name'
                }
            },
            required: ['positioning_statement', 'target_customer', 'key_benefit']
        },
        execute: (args) => {
            const product = args.product_name || 'Your Product';
            const channels = args.channels || ['website', 'linkedin', 'cold_email', 'sales_deck', 'product_demo'];
            return `# Channel Execution Playbook

## Positioning Foundation
**Statement**: ${args.positioning_statement}
**Target**: ${args.target_customer}
**Key Benefit**: ${args.key_benefit}

---

## 🌐 Website Execution

### Homepage Hero
**Headline (5-8 words)**:
> "${cap(firstWords(args.key_benefit, 5))}"

**Subheadline (15-20 words)**:
> "The platform that helps ${args.target_customer} ${args.key_benefit.toLowerCase()}. No complexity. No consultants. Just results."

**CTA Options**:
- Primary: "Start Free Trial" / "Get a Demo"
- Secondary: "See How It Works" / "View Case Studies"

### Above the Fold Checklist
- [ ] Clear value proposition in headline
- [ ] Target customer mentioned
- [ ] Key benefit stated
- [ ] Social proof (logos, stats)
- [ ] Clear CTA button
- [ ] Demo/product visual

---

## 💼 LinkedIn Execution

### Profile/Company Page Tagline
> "Helping ${args.target_customer} ${mid(args.key_benefit)}"

### Post Templates

**Thought Leadership Post**:
\`\`\`
Most ${args.target_customer} think [common belief].

But here's what we've learned from 100+ customers: ${EXAMPLE}

[Counterintuitive insight about ${mid(args.key_benefit)}]

The data shows:
→ Companies doing X see [positive outcome]
→ Companies doing Y see [negative outcome]

The difference? [Your differentiation]

What's your experience?
\`\`\`

**Case Study Post**:
\`\`\`
[Customer name] came to us with a problem:

"We were struggling to [pain point]"

Here's what changed:

Before: [metric before]
After: [metric after]

The key? [Your differentiation]

Full case study in comments 👇
\`\`\`

**Problem-Agitation Post**:
\`\`\`
Stop if this sounds familiar:

You're a [target customer title] trying to ${args.key_benefit.toLowerCase()}.

But you're stuck with:
❌ [Pain point 1]
❌ [Pain point 2]
❌ [Pain point 3]

There's a better way.

[One sentence about your solution]

DM me "GUIDE" for our free playbook.
\`\`\`

---

## 📧 Cold Email Execution

### Email 1 - Problem-focused
**Subject**: [Pain point] at [Company]?

\`\`\`
Hi [First name],

[Trigger/reason for outreach - personalized]

I'm reaching out because ${args.target_customer} often struggle with [specific pain].

We help companies like [similar company] ${args.key_benefit.toLowerCase()}.

Would it make sense to show you how in 15 minutes? ${EXAMPLE}

[Signature]
\`\`\`

### Email 2 - Value-focused
**Subject**: How [Similar Company] achieved [Outcome]

\`\`\`
Hi [First name],

Quick follow-up with a relevant data point:

[Similar Company] was facing [problem]. After implementing ${product}:
- [Metric 1 improvement]
- [Metric 2 improvement]

Given what I see at [Their Company], you could likely see similar results.

Worth a conversation?

[Signature]
\`\`\`

### Email 3 - Breakup
**Subject**: Closing the loop

\`\`\`
Hi [First name],

I've reached out a few times about helping [Company] ${args.key_benefit.toLowerCase()}.

If the timing isn't right, no worries at all.

But if [specific trigger/pain] becomes a priority, here's a resource that might help: [Link to guide/case study]

Best,
[Signature]
\`\`\`

---

## 🎤 Sales Deck Execution

### Slide Structure (10 slides)

| Slide | Title | Content |
|-------|-------|---------|
| 1 | Title | ${product} - ${args.key_benefit} |
| 2 | The Problem | Why ${args.target_customer} struggle today |
| 3 | Cost of Inaction | What happens if this doesn't get solved |
| 4 | The Solution | Introducing ${product} |
| 5 | How It Works | 3-step process / key features |
| 6 | Differentiation | Why we're different (your positioning) |
| 7 | Results | Customer outcomes and metrics |
| 8 | Case Study | Specific customer story |
| 9 | Pricing/Packages | Investment and what's included |
| 10 | Next Steps | Clear call-to-action |

### Key Slide: Differentiation
\`\`\`
Unlike [Competitor Category]...

❌ They do: [Competitor approach]
✅ We do: [Your approach]

Result: [Quantified outcome]
\`\`\`

---

## 🎬 Product Demo Execution

### Demo Script Structure (15 minutes, Example figure: replace with your own)

**0-2 min: Context Setting** ${EXAMPLE}
> "Based on our conversation, you mentioned [their specific pain]. Let me show you exactly how ${product} helps ${args.target_customer} ${args.key_benefit.toLowerCase()}."

**2-8 min: Core Value Demonstration** ${EXAMPLE}
Show 2-3 features that directly address their stated needs:
1. Feature A → Outcome A
2. Feature B → Outcome B
3. Feature C → Outcome C

**8-12 min: Differentiation Proof** ${EXAMPLE}
> "You might be wondering how this compares to [competitor]. Watch this..."
[Show specific capability they can't match]

**12-15 min: Close & Next Steps** ${EXAMPLE}
> "So you've seen how [recap 3 key outcomes]. What questions do you have?"
> "What would success look like for you in the first 90 days?"

### Demo Best Practices
- [ ] Customize to their specific use case
- [ ] Use their industry/terminology
- [ ] Show outcomes, not features
- [ ] Leave time for questions
- [ ] Have clear next step

---

## 📊 Channel Priority Matrix

| Channel | ICP Match | Effort | Expected CAC | Priority |
|---------|-----------|--------|--------------|----------|
| LinkedIn Organic | High | Medium | Low | ⭐⭐⭐⭐⭐ |
| Cold Email | High | Low | Medium | ⭐⭐⭐⭐ |
| Website SEO | Medium | High | Low | ⭐⭐⭐⭐ |
| Paid LinkedIn | High | Medium | High | ⭐⭐⭐ |
| Events | High | High | High | ⭐⭐⭐ |
| Content Marketing | Medium | High | Low | ⭐⭐⭐⭐ |

**Recommended Priority Order**:
1. Website + SEO (foundation)
2. LinkedIn Organic (awareness)
3. Cold Email (pipeline)
4. Sales Deck (conversion)

**Next Step**: Use \`impact_full_audit\` for a complete positioning assessment

${SUGGESTED}
`;
        }
    },
    // ---------------------------------------------------------------------------
    // Tool 8: Full Positioning Audit
    // ---------------------------------------------------------------------------
    impact_full_audit: {
        description: 'Complete positioning audit with scoring and recommendations',
        inputSchema: {
            type: 'object',
            properties: {
                company_name: {
                    type: 'string',
                    description: 'Your company name'
                },
                product_description: {
                    type: 'string',
                    description: 'What your product does'
                },
                target_customer: {
                    type: 'string',
                    description: 'Who you serve'
                },
                problem_solved: {
                    type: 'string',
                    description: 'The problem you solve'
                },
                key_differentiation: {
                    type: 'string',
                    description: 'What makes you unique'
                },
                competitors: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Main competitors'
                },
                current_positioning: {
                    type: 'string',
                    description: 'Optional: Your current positioning statement or tagline'
                },
                customer_feedback: {
                    type: 'string',
                    description: 'Optional: What customers say about you'
                }
            },
            required: ['product_description', 'target_customer', 'problem_solved']
        },
        execute: (args) => {
            const company = args.company_name || 'Your Company';
            const competitors = args.competitors || ['Status quo', 'DIY solutions'];
            const differentiation = args.key_differentiation || 'unique approach';
            // Calculate scores based on input completeness and clarity
            const scores = {
                identify: 0,
                map: 0,
                pinpoint: 0,
                anchor: 0,
                craft: 0,
                translate: 0
            };
            // Scoring logic based on provided inputs
            // Identify Champions (based on target customer clarity)
            if (args.target_customer.length > 20 && args.target_customer.includes(' ')) {
                scores.identify = args.target_customer.length > 50 ? 85 : 70;
            }
            else {
                scores.identify = 45;
            }
            // Map Alternatives (based on competitors)
            if (competitors.length > 2) {
                scores.map = 80;
            }
            else if (competitors.length > 0 && competitors[0] !== 'Status quo') {
                scores.map = 65;
            }
            else {
                scores.map = 40;
            }
            // Pinpoint Value (based on differentiation)
            if (differentiation.length > 30) {
                scores.pinpoint = differentiation.includes('only') || differentiation.includes('unique') ? 85 : 70;
            }
            else {
                scores.pinpoint = 50;
            }
            // Anchor Market (based on target specificity)
            if (args.target_customer.includes('employees') || args.target_customer.includes('revenue') || args.target_customer.includes('Series')) {
                scores.anchor = 80;
            }
            else if (args.target_customer.split(' ').length > 3) {
                scores.anchor = 65;
            }
            else {
                scores.anchor = 45;
            }
            // Craft Message (based on current positioning)
            if (args.current_positioning && args.current_positioning.length > 50) {
                scores.craft = args.current_positioning.includes('unlike') || args.current_positioning.includes('only') ? 85 : 70;
            }
            else if (args.current_positioning) {
                scores.craft = 55;
            }
            else {
                scores.craft = 30;
            }
            // Translate Execution (based on customer feedback indicating market presence)
            if (args.customer_feedback && args.customer_feedback.length > 50) {
                scores.translate = 75;
            }
            else if (args.customer_feedback) {
                scores.translate = 55;
            }
            else {
                scores.translate = 35;
            }
            const overallScore = Math.round((scores.identify + scores.map + scores.pinpoint + scores.anchor + scores.craft + scores.translate) / 6);
            // Determine grade
            let grade = 'F';
            let gradeDescription = '';
            if (overallScore >= 85) {
                grade = 'A';
                gradeDescription = 'Excellent - Ready to scale';
            }
            else if (overallScore >= 75) {
                grade = 'B';
                gradeDescription = 'Good - Minor refinements needed';
            }
            else if (overallScore >= 65) {
                grade = 'C';
                gradeDescription = 'Fair - Significant improvements possible';
            }
            else if (overallScore >= 50) {
                grade = 'D';
                gradeDescription = 'Weak - Major gaps to address';
            }
            else {
                grade = 'F';
                gradeDescription = 'Critical - Positioning overhaul needed';
            }
            // Find weakest areas
            const sortedScores = Object.entries(scores).sort((a, b) => a[1] - b[1]);
            const weakest = sortedScores.slice(0, 2);
            const strongest = sortedScores.slice(-2).reverse();
            // Tool name for each phase key (the tool list below names real tools, not phase keys).
            const phaseTool = {
                identify: 'impact_identify_champions', map: 'impact_map_alternatives', pinpoint: 'impact_pinpoint_value',
                anchor: 'impact_anchor_market', craft: 'impact_craft_message', translate: 'impact_translate_execution'
            };
            return `# IMPACT Positioning Audit

## Company Overview
**Company**: ${args.company_name || 'not supplied'}
**Product**: ${args.product_description}
**Target**: ${args.target_customer}
**Problem**: ${args.problem_solved}
${args.current_positioning ? `**Current Positioning**: ${args.current_positioning}` : ''}
${args.customer_feedback ? `**Customer Feedback**: ${args.customer_feedback}` : ''}

---

## 📊 IMPACT Scorecard

### Overall Score: ${overallScore}/100 (Grade: ${grade})
**Assessment**: ${gradeDescription}

| Phase | Score | Status | Priority |
|-------|-------|--------|----------|
| **I** - Identify Champions | ${scores.identify}/100 | ${scores.identify >= 70 ? '✅ Strong' : scores.identify >= 50 ? '⚠️ Needs Work' : '❌ Critical'} | ${scores.identify < 60 ? 'High' : 'Low'} |
| **M** - Map Alternatives | ${scores.map}/100 | ${scores.map >= 70 ? '✅ Strong' : scores.map >= 50 ? '⚠️ Needs Work' : '❌ Critical'} | ${scores.map < 60 ? 'High' : 'Low'} |
| **P** - Pinpoint Value | ${scores.pinpoint}/100 | ${scores.pinpoint >= 70 ? '✅ Strong' : scores.pinpoint >= 50 ? '⚠️ Needs Work' : '❌ Critical'} | ${scores.pinpoint < 60 ? 'High' : 'Low'} |
| **A** - Anchor Market | ${scores.anchor}/100 | ${scores.anchor >= 70 ? '✅ Strong' : scores.anchor >= 50 ? '⚠️ Needs Work' : '❌ Critical'} | ${scores.anchor < 60 ? 'High' : 'Low'} |
| **C** - Craft Message | ${scores.craft}/100 | ${scores.craft >= 70 ? '✅ Strong' : scores.craft >= 50 ? '⚠️ Needs Work' : '❌ Critical'} | ${scores.craft < 60 ? 'High' : 'Low'} |
| **T** - Translate Execution | ${scores.translate}/100 | ${scores.translate >= 70 ? '✅ Strong' : scores.translate >= 50 ? '⚠️ Needs Work' : '❌ Critical'} | ${scores.translate < 60 ? 'High' : 'Low'} |

---

## 💪 Strengths
${strongest.map(([phase, score]) => `
### ${phase.charAt(0).toUpperCase() + phase.slice(1)} (${score}/100)
${phase === 'identify' ? `Your target customer definition ("${args.target_customer}") provides good specificity for champion identification.` : ''}
${phase === 'map' ? `You have ${competitors.length} competitor${competitors.length === 1 ? '' : 's'} identified, enabling competitive positioning.` : ''}
${phase === 'pinpoint' ? `Your differentiation ("${differentiation}") provides a foundation for value articulation.` : ''}
${phase === 'anchor' ? `Your market definition includes specific criteria for targeting.` : ''}
${phase === 'craft' ? `You have a positioning statement foundation to build upon.` : ''}
${phase === 'translate' ? `Customer feedback indicates market traction and positioning resonance.` : ''}
`).join('')}

---

## ⚠️ Areas for Improvement
${weakest.map(([phase, score]) => `
### ${phase.charAt(0).toUpperCase() + phase.slice(1)} (${score}/100) - Priority: HIGH

**Issue**: ${phase === 'identify' ? 'Champion identification needs more specificity. Who exactly is your buyer?' :
                phase === 'map' ? 'Competitive landscape needs deeper analysis. What are the alternatives customers consider?' :
                    phase === 'pinpoint' ? 'Value proposition needs quantification. What specific outcomes do customers achieve?' :
                        phase === 'anchor' ? 'Market definition needs tighter criteria. What makes a company ideal for you?' :
                            phase === 'craft' ? 'Positioning statement is missing or incomplete. How do you articulate your unique value?' :
                                'Execution translation is weak. How does positioning show up in your channels?'}

**Action**: Run \`impact_${phase === 'identify' ? 'identify_champions' : phase === 'map' ? 'map_alternatives' : phase === 'pinpoint' ? 'pinpoint_value' : phase === 'anchor' ? 'anchor_market' : phase === 'craft' ? 'craft_message' : 'translate_execution'}\` to address this gap.

**Expected Improvement**: +${20 - Math.floor(score / 10)} points with focused work ${EXAMPLE}
`).join('')}

---

## 🎯 Recommended Positioning

Based on your inputs, here's a generated positioning statement:

> **For** ${args.target_customer}
> **Who** struggle with ${args.problem_solved.toLowerCase()}
> **${company}** **is a** solution
> **That** ${args.product_description.toLowerCase().includes('helps') ? args.product_description.split('helps')[1]?.trim() || 'delivers results' : 'delivers results'}
> **Unlike** ${competitors[0] || 'alternatives'}
> **We** offer ${mid(differentiation)}

### Tagline Options
1. "No more ${args.problem_solved.split(' ').slice(0, 4).join(' ').toLowerCase()}"
2. "The ${firstWords(mid(differentiation), 3)} solution"
3. "Built for ${args.target_customer.split(' ').slice(-2).join(' ')}"

---

## 📋 30-Day Action Plan

### Week 1: Foundation
- [ ] Complete champion identification exercise
- [ ] Document 5+ competitor weaknesses from customer research
- [ ] Define 3 quantified value proof points

### Week 2: Positioning
- [ ] Finalize positioning statement (3 variations)
- [ ] Test with 5 existing customers
- [ ] Refine based on feedback

### Week 3: Execution
- [ ] Update website hero section
- [ ] Create sales deck with new positioning
- [ ] Update LinkedIn profile/company page

### Week 4: Validation
- [ ] A/B test messaging in outreach
- [ ] Track conversion rate changes
- [ ] Gather qualitative feedback from prospects

---

## 📈 Expected Outcomes

With focused positioning work:

${EXAMPLES}
| Metric | Current (example) | Target | Improvement |
|--------|---------------------|--------|-------------|
| Website conversion | 1-2% | 3-5% | 2-3x |
| Email reply rate | 2-5% | 8-15% | 3x |
| Sales cycle | Average | -20% | Faster |
| Win rate | Average | +15% | Higher |

**Investment**: 20-30 hours of positioning work ${EXAMPLE}
**Expected ROI**: 2-3x improvement in GTM metrics ${EXAMPLE}

---

## 🔧 Tools to Use Next

Based on your scores, prioritize these tools:

1. **\`${phaseTool[weakest[0][0]]}\`** - Address your lowest-scoring area first
2. **\`${phaseTool[weakest[1][0]]}\`** - Then tackle the second-weakest
${[['impact_craft_message', 'Synthesize into final positioning'], ['impact_translate_execution', 'Activate across channels']]
                .filter(([t]) => t !== phaseTool[weakest[0][0]] && t !== phaseTool[weakest[1][0]])
                .map(([t, what], i) => `${i + 3}. **\`${t}\`** - ${what}`).join('\n')}

${SUGGESTED}
`;
        }
    }
};
// =============================================================================
// SERVER HANDLERS
// =============================================================================
// =============================================================================
// SERVER (shared by the stdio entry below and netlify/functions/mcp.mjs)
// Added for the hosted connector: tool titles and annotations, and a clear
// message when a required input is missing. Tool code above is unchanged.
// =============================================================================
exports.SERVER_NAME = 'impact-mcp';
exports.SERVER_VERSION = '2.2.2';
// Every tool only builds text from its inputs: no storage, no network, no side effects.
const TOOL_TITLES = {
    "impact_get_framework": "IMPACT Framework Guide",
    "impact_identify_champions": "Identify Champions",
    "impact_map_alternatives": "Map Alternatives",
    "impact_pinpoint_value": "Pinpoint Value",
    "impact_anchor_market": "Anchor Market",
    "impact_craft_message": "Craft Message",
    "impact_translate_execution": "Translate Execution",
    "impact_full_audit": "IMPACT Full Audit"
};
function withMeta(tool) {
    const title = TOOL_TITLES[tool.name] ?? tool.name;
    return {
        ...tool,
        title,
        annotations: { title, readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    };
}
const NEGATIVE_AMOUNT = /\$\s*[-\u2212]\s*\d|(^|[\s(:=,;])[-\u2212](?:\$|usd|inr|eur|gbp|rs\.?|\u20b9|\u20ac|\u00a3)?\s?\d[\d,]*(?:\.\d+)?(?![\d,.]|\s*%)/i;
const NEGATIVE_MONEY = /[-−]\s?[$₹€£]\s*\d|[$₹€£]\s*[-−]\s*\d|\b(?:mrr|arr|cac|ltv|acv)\b[:\s]*[-−]\s*\d/i;
const AMOUNT_RANGE = /\d\s*[kmb]?\s*(?:-|\u2013|\u2014|to)\s*[$\u20b9\u20ac\u00a3]?\s*\d/i;
function checkValue(schema, holder, key, path, problems) {
    const box = holder;
    const value = box[key];
    if (value === undefined || value === null)
        return;
    if (schema.properties && typeof value === "object" && !Array.isArray(value)) {
        for (const [k, p] of Object.entries(schema.properties))
            checkValue(p, value, k, path ? `${path}.${k}` : k, problems);
        return;
    }
    if (schema.items && Array.isArray(value)) {
        value.forEach((_, i) => checkValue(schema.items, value, i, `${path}[${i}]`, problems));
        return;
    }
    if (Array.isArray(schema.enum) && typeof value === "string" && !schema.enum.includes(value)) {
        problems.push(`${path} must be one of: ${schema.enum.join(", ")}`);
        return;
    }
    if (schema.type !== "number" && schema.type !== "integer")
        return;
    let v = value;
    if (typeof v === "string") {
        const n = v.trim() === "" ? NaN : Number(v.replace(/,/g, "").trim());
        if (!Number.isFinite(n)) {
            problems.push(`${path} must be a number, written with digits only (for example 220000)`);
            return;
        }
        box[key] = n;
        v = n;
    }
    if (typeof v !== "number" || !Number.isFinite(v)) {
        problems.push(`${path} must be a number`);
        return;
    }
    if (typeof schema.minimum === "number" && v < schema.minimum)
        problems.push(`${path} must be ${schema.minimum} or more`);
    if (typeof schema.exclusiveMinimum === "number" && v <= schema.exclusiveMinimum)
        problems.push(`${path} must be more than ${schema.exclusiveMinimum}`);
    if (typeof schema.maximum === "number" && v > schema.maximum)
        problems.push(`${path} must be ${schema.maximum} or less`);
}
const MONEY_TEXT = { impact_anchor_market: ["average_deal_size"], impact_identify_champions: ["price_point"] };
const METRIC_TEXT = {};
const ONE_AMOUNT = { impact_anchor_market: ["average_deal_size"] };
function checkRequiredInputs(name, args) {
    const tool = tools[name];
    if (!tool) {
        return `Unknown tool: ${name}. Available tools: ${Object.keys(tools).join(', ')}.`;
    }
    const required = tool.inputSchema.required ?? [];
    const missing = required.filter((key) => args?.[key] === undefined || args?.[key] === null);
    if (missing.length > 0) {
        return `Missing required input for ${name}: ${missing.join(', ')}. Provide ${missing.length === 1 ? 'it' : 'them'} and call the tool again.`;
    }
    // Decision N2 (run 6) and run 7: schema limits at any depth, choices, money text and single amounts.
    const problems = [];
    if (args) {
        for (const [k, p] of Object.entries(tool.inputSchema.properties ?? {}))
            checkValue(p, args, k, k, problems);
    }
    for (const key of MONEY_TEXT[name] ?? []) {
        const raw = args?.[key];
        if (typeof raw === "string" && NEGATIVE_AMOUNT.test(raw))
            problems.push(`${key} must not contain a negative amount`);
    }
    for (const key of METRIC_TEXT[name] ?? []) {
        const raw = args?.[key];
        if (typeof raw === "string" && NEGATIVE_MONEY.test(raw))
            problems.push(`${key} must not contain a negative amount of money`);
    }
    for (const key of ONE_AMOUNT[name] ?? []) {
        const raw = args?.[key];
        if (typeof raw === "string" && AMOUNT_RANGE.test(raw))
            problems.push(`${key} must be one amount, not a range (for example $75,000)`);
    }
    if (problems.length > 0) {
        return `Invalid input for ${name}: ${problems.join("; ")}.`;
    }
    return null;
}
function createServer() {
    const server = new index_js_1.Server({ name: exports.SERVER_NAME, version: exports.SERVER_VERSION }, { capabilities: { tools: {} } });
    server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
        tools: Object.entries(tools).map(([name, config]) => withMeta({ name, description: config.description, inputSchema: config.inputSchema })),
    }));
    server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
        const problem = checkRequiredInputs(request.params.name, request.params.arguments);
        if (problem) {
            return { content: [{ type: 'text', text: problem }], isError: true };
        }
        const toolName = request.params.name;
        const tool = tools[toolName];
        if (!tool) {
            return {
                content: [{
                        type: 'text',
                        text: `Unknown tool: ${toolName}. Available tools: ${Object.keys(tools).join(', ')}`
                    }],
                isError: true
            };
        }
        try {
            const result = tool.execute(request.params.arguments);
            return {
                content: [{ type: 'text', text: result }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: `Error executing ${toolName}: ${error instanceof Error ? error.message : 'Unknown error'}`
                    }],
                isError: true
            };
        }
    });
    return server;
}
// =============================================================================
// MAIN
// =============================================================================
async function main() {
    const server = createServer();
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error(`IMPACT MCP v${exports.SERVER_VERSION} running on stdio`);
}
// Run over stdio only when started directly (npm bin). The hosted function imports this
// file as an ES module bundle, where require is not defined.
if (typeof module !== 'undefined' && typeof require !== 'undefined' && require.main === module) {
    main().catch(console.error);
}
// Reads one amount from text: "$5,000", "$50K" and "$1.5M" give 5000, 50000 and 1500000 (run 7, T5).
function readAmount(text) {
    const m = text.replace(/,/g, '').match(/(\d+(?:\.\d+)?)\s*([kmb])?\b/i);
    if (!m)
        return null;
    const mult = { k: 1e3, m: 1e6, b: 1e9 };
    return Math.round(parseFloat(m[1]) * (mult[(m[2] || '').toLowerCase()] ?? 1));
}
//# sourceMappingURL=index.js.map