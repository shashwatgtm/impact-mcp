#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
// =============================================================================
// IMPACT MCP v2.0.0 - Hypothesis-Driven B2B Positioning Engine
// =============================================================================
// IMPACT = Identify Champions, Map Alternatives, Pinpoint Value, 
//          Anchor Market, Craft Message, Translate Execution
// =============================================================================
const server = new index_js_1.Server({ name: 'impact-mcp', version: '2.0.0' }, { capabilities: { tools: {} } });
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
Example: "We help B2B sales teams close 40% more deals by automating discovery and follow-up."

**Level 3 - Supporting Messages (3 pillars)**
The proof points that support your promise.
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
`;
            }
            return phases[phase] || 'Phase not found. Use: identify, map, pinpoint, anchor, craft, translate, or all';
        }
    },
    // ---------------------------------------------------------------------------
    // Tool 2: Identify Champions
    // ---------------------------------------------------------------------------
    impact_identify_champions: {
        description: 'Generate champion hypotheses from company/product context - no blanks, actionable insights',
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
            const company = args.company_name || 'Your company';
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
            else if (categoryLower.includes('marketing') || categoryLower.includes('automation')) {
                marketContext = {
                    typical_leaders: ['Marketo', 'HubSpot', 'Pardot', 'ActiveCampaign', 'Klaviyo'],
                    common_complaints: ['Difficult to use without developer', 'Attribution is inaccurate', 'Limited personalization', 'Template constraints', 'Deliverability issues'],
                    differentiation_axes: ['Ease of use', 'Attribution accuracy', 'Personalization depth', 'Channel coverage', 'Analytics sophistication']
                };
            }
            else if (categoryLower.includes('data') || categoryLower.includes('analytics') || categoryLower.includes('bi')) {
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
                customInsights += `\n**Customer-Reported Competitor Issues**:\n${weaknesses.split(',').map(w => `- ${w.trim()}`).join('\n')}\n`;
            }
            if (strengths) {
                customInsights += `\n**Your Key Differentiators**:\n${strengths.split(',').map(s => `- ${s.trim()}`).join('\n')}\n`;
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
- Positioning territory: ${marketContext.differentiation_axes[i % marketContext.differentiation_axes.length] || 'General market leader'}
- Likely weakness: ${marketContext.common_complaints[i % marketContext.common_complaints.length]}
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
**Their strength**: Established brand, large customer base
**Their weakness**: ${marketContext.common_complaints[0]}
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
**Landmine question**: "What happens to your metrics if this problem grows 2x next year?"

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
**Product**: ${product}
**Category**: ${category}
**Target Customer**: ${args.target_customer}
**Key Outcome**: ${args.key_outcome}
**Unique Capability**: ${args.unique_capability}
${metrics ? `**Reported Metrics**: ${metrics}` : ''}

---

## 🎯 The Only Statement

### Version 1 (Category-focused)
> **${product}** is the **only ${category}** that **${args.unique_capability}**, enabling **${args.target_customer}** to **${args.key_outcome}**.

### Version 2 (Outcome-focused)
> We help **${args.target_customer}** achieve **${args.key_outcome}** through **${args.unique_capability}** — something no other ${category} can deliver.

### Version 3 (Problem-focused)
> Unlike traditional ${category}s, **${product}** **${args.unique_capability}**, which means **${args.target_customer}** finally **${args.key_outcome}**.

---

## 📊 Value Quantification Matrix

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
- "[Customer] increased [outcome] by ${quantifiedResults.primary} in ${quantifiedResults.time}"
- "[Customer] saved ${valueMetrics.time_savings} previously spent on [manual task]"
- "[Customer] saw ${quantifiedResults.secondary} improvement in [metric]"

**Proof Collection Questions** (ask your existing customers):
1. "What metric improved most after implementing us?"
2. "How much time does your team save weekly?"
3. "What would you have to spend to achieve this otherwise?"
4. "What was the ROI payback period?"

### Tier 2: Third-Party Validation
- **Analyst Recognition**: Gartner, Forrester, G2 rankings
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
> "Finally ${args.key_outcome} without [current pain point]. Our customers see ${valueMetrics.revenue_impact}."

**For Economic Buyers (CFO/CEO)**:
> "Drive ${valueMetrics.revenue_impact} with payback in ${quantifiedResults.time}. Lower TCO than alternatives."

**For Technical Evaluators**:
> "${args.unique_capability} through [technical approach]. Integrates with your existing stack in days, not months."

### For Different Channels

**Website Hero** (15 words max):
> "${args.key_outcome.split(' ').slice(0, 3).join(' ')} for ${args.target_customer.split(' ').slice(0, 2).join(' ')}. ${quantifiedResults.primary} better results."

**LinkedIn Post** (Hook):
> "Most ${args.target_customer} struggle with [problem]. We built something different: ${args.unique_capability}."

**Cold Email** (Value prop):
> "We help companies like yours ${args.key_outcome}. Recent customer achieved ${valueMetrics.revenue_impact}."

**Sales Deck** (Slide title):
> "The only ${category} that ${args.unique_capability}"

---

## 🔍 Value Validation Questions

Before finalizing, validate with prospects:

1. **Clarity**: "After hearing this, what do you think we do?"
2. **Relevance**: "How important is [key outcome] to you right now?"
3. **Differentiation**: "Have you heard anything like this from other vendors?"
4. **Believability**: "What would you need to see to believe this?"

**Next Step**: Use \`impact_anchor_market\` to select your beachhead market segment
`;
        }
    },
    // ---------------------------------------------------------------------------
    // Tool 5: Anchor in Right Market
    // ---------------------------------------------------------------------------
    impact_anchor_market: {
        description: 'Select beachhead market with scoring and TAM/SAM/SOM framework',
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
                    description: 'Optional: Your ACV (e.g., "$50K")'
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
            const acvNumber = parseInt(acv.replace(/[^0-9]/g, '')) || 30000;
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
            return `# Beachhead Market Selection

## Market Context
**Product**: ${args.product_description}
**Average Deal Size**: ${acv}
**Sales Cycle**: ${cycle}
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

| Segment | Pain | Budget | Access | Reference | Competition | **TOTAL** |
|---------|------|--------|--------|-----------|-------------|-----------|
${segmentScores.map((s, i) => `| ${i === 0 ? '**' + s.name + '** ⭐' : s.name} | ${s.pain} | ${s.budget} | ${s.access} | ${s.reference} | ${s.competition} | **${s.total}** |`).join('\n')}

---

## 🎯 Recommended Beachhead: ${beachhead.name}

### Why This Segment Wins

**Highest Score (${beachhead.total}/25)** based on:
${beachhead.pain >= 4 ? `- ✅ **High Pain Intensity** (${beachhead.pain}/5): Urgent problem that demands solution` : `- ⚠️ Pain Level (${beachhead.pain}/5): May need more urgency creation`}
${beachhead.budget >= 4 ? `- ✅ **Strong Budget** (${beachhead.budget}/5): Can afford ${acv} ACV` : `- ⚠️ Budget (${beachhead.budget}/5): May need pricing flexibility`}
${beachhead.access >= 4 ? `- ✅ **Easy Access** (${beachhead.access}/5): Can reach through existing channels` : `- ⚠️ Accessibility (${beachhead.access}/5): May need channel development`}
${beachhead.reference >= 4 ? `- ✅ **High Reference Value** (${beachhead.reference}/5): Great logos for expansion` : `- ⚠️ Reference Value (${beachhead.reference}/5): May need additional segments for logos`}
${beachhead.competition >= 4 ? `- ✅ **Low Competition** (${beachhead.competition}/5): White space opportunity` : `- ⚠️ Competition (${beachhead.competition}/5): Need clear differentiation`}

---

## 📈 Market Sizing (Bottom-Up Calculation)

### TAM/SAM/SOM for ${beachhead.name}

**Total Addressable Market (TAM)**
\`\`\`
TAM = Total potential customers × ACV
TAM = ~${(tamMultiplier).toLocaleString()} companies × ${acv}
TAM = $${(tam / 1000000).toFixed(1)}M
\`\`\`

**Serviceable Addressable Market (SAM)**
\`\`\`
SAM = TAM × % that match your ICP
SAM = $${(tam / 1000000).toFixed(1)}M × 30% (have the problem + right profile)
SAM = $${(sam / 1000000).toFixed(1)}M
\`\`\`

**Serviceable Obtainable Market (SOM)**
\`\`\`
SOM = SAM × Expected market share (Year 1)
SOM = $${(sam / 1000000).toFixed(1)}M × 5%
SOM = $${(som / 1000000).toFixed(2)}M
\`\`\`

### Market Sizing Assumptions
| Assumption | Value | Source/Validation |
|------------|-------|-------------------|
| Total companies in segment | ~${tamMultiplier.toLocaleString()} | Industry databases, LinkedIn |
| % with problem | 30% | Customer research |
| Year 1 market share | 5% | Conservative estimate |
| Average deal size | ${acv} | Current pipeline data |

**⚠️ Validation Required**: These are hypothesis numbers. Validate with:
1. Industry reports (Gartner, Forrester)
2. LinkedIn Sales Navigator company counts
3. Customer interviews on market size perception

---

## 🗺️ Beachhead Expansion Path

### Year 1: Dominate ${beachhead.name}
- Focus: 100% of GTM on this segment
- Goal: ${Math.round(som / acvNumber)} customers
- Revenue: $${(som / 1000000).toFixed(2)}M ARR

### Year 2: Adjacent Expansion
- Add: ${segmentScores[1]?.name || 'Next highest-scoring segment'}
- Leverage: References from beachhead customers
- Goal: 2x customer base

### Year 3: Market Leadership
- Expand: Full SAM coverage
- Position: Category leader in ${beachhead.name}
- Goal: 10% market share

---

## 💡 ICP Hypothesis for ${beachhead.name}

Based on beachhead selection, your ICP likely includes:

**Company Characteristics**:
- Industry: ${beachhead.name.split('(')[0].trim()}
- Size: ${beachhead.name.includes('(') ? beachhead.name.match(/\(([^)]+)\)/)?.[1] || '50-500 employees' : '50-500 employees'}
- Tech stack: Modern, willing to adopt new tools
- Growth stage: Series B+ or established

**Buying Characteristics**:
- Budget: ${acv}+ available
- Decision maker: ${beachhead.budget >= 4 ? 'VP/C-level accessible' : 'Manager-level start'}
- Sales cycle: ${cycle}
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
            const need = args.customer_need || `need to ${args.key_benefit.toLowerCase()}`;
            return `# Positioning & Messaging Framework

## Positioning Inputs
- **Product**: ${product}
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
> **That** ${args.key_benefit}
> **Unlike** ${competitor}
> **We** ${args.differentiation}

### One-Paragraph Version
> ${product} is the ${category} for ${args.target_customer} who ${need}. Unlike ${competitor}, we ${args.differentiation}, which means you can ${args.key_benefit}.

### One-Sentence Version
> ${product} helps ${args.target_customer} ${args.key_benefit} by ${args.differentiation.toLowerCase()}.

---

## 📋 Message Hierarchy

### Level 1: Tagline (3-7 words)
Choose the style that fits your brand:

| Style | Tagline | Best For |
|-------|---------|----------|
| **Outcome** | "${args.key_benefit.split(' ').slice(0, 4).join(' ')}" | Clarity |
| **Differentiator** | "The only ${category} that ${args.differentiation.split(' ').slice(0, 3).join(' ')}" | Uniqueness |
| **Audience** | "Built for ${args.target_customer.split(' ').slice(0, 2).join(' ')}" | Targeting |
| **Provocative** | "Stop ${args.key_benefit.includes('increase') ? 'losing' : 'wasting'}. Start winning." | Attention |

### Level 2: Value Proposition (1-2 sentences)
**Option A - Problem-Solution**:
> "${args.target_customer} struggle with ${need}. ${product} ${args.differentiation}, so you can finally ${args.key_benefit}."

**Option B - Outcome-First**:
> "Achieve ${args.key_benefit} without the complexity of ${competitor}. ${product} ${args.differentiation}."

**Option C - Unique Mechanism**:
> "The only ${category} that ${args.differentiation}. That's how ${args.target_customer} ${args.key_benefit}."

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
> "Tired of ${competitor.toLowerCase().replace('traditional ', '')}? ${product} ${args.differentiation}."

**Variation B - Lead with Outcome**:
> "${args.key_benefit}. That's what ${args.target_customer} get with ${product}."

**Variation C - Lead with Differentiation**:
> "Unlike ${competitor}, ${product} ${args.differentiation}. Finally, ${args.key_benefit}."

**Variation D - Lead with Social Proof**:
> "Join 100+ ${args.target_customer.split(' ').slice(-1)[0]} who ${args.key_benefit} with ${product}."

### Audience-Specific Messaging

**For Champions (${args.target_customer})**:
> "We built ${product} because ${competitor} wasn't cutting it. Now you can ${args.key_benefit} without the usual headaches."

**For Economic Buyers (Executives)**:
> "Drive measurable ${args.key_benefit.includes('revenue') || args.key_benefit.includes('growth') ? 'growth' : 'ROI'} with ${product}. Lower TCO than ${competitor}."

**For Technical Evaluators**:
> "${product} ${args.differentiation} through a ${category} architecture designed for ${args.target_customer}."

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
| "We use ${competitor}" | "Many of our customers switched from ${competitor}. They found that ${args.differentiation} delivered ${args.key_benefit}." |
| "Too expensive" | "Consider the cost of NOT ${args.key_benefit.toLowerCase()}. Our customers typically see ROI in X months." |
| "We're not ready" | "That's exactly when our best customers started. ${product} is designed for ${args.target_customer} at your stage." |
| "Need to think about it" | "Absolutely. While you're evaluating, here's a case study of how [similar company] achieved ${args.key_benefit}." |

**Next Step**: Use \`impact_translate_execution\` to adapt these messages for each channel
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
                    description: 'Channels to optimize for (e.g., ["website", "linkedin", "email", "sales_deck"])'
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
> "${args.key_benefit.split(' ').slice(0, 5).join(' ')}"

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
> "Helping ${args.target_customer} ${args.key_benefit}"

### Post Templates

**Thought Leadership Post**:
\`\`\`
Most ${args.target_customer} think [common belief].

But here's what we've learned from 100+ customers:

[Counterintuitive insight about ${args.key_benefit}]

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

Would it make sense to show you how in 15 minutes?

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

### Demo Script Structure (15 minutes)

**0-2 min: Context Setting**
> "Based on our conversation, you mentioned [their specific pain]. Let me show you exactly how ${product} helps ${args.target_customer} ${args.key_benefit.toLowerCase()}."

**2-8 min: Core Value Demonstration**
Show 2-3 features that directly address their stated needs:
1. Feature A → Outcome A
2. Feature B → Outcome B
3. Feature C → Outcome C

**8-12 min: Differentiation Proof**
> "You might be wondering how this compares to [competitor]. Watch this..."
[Show specific capability they can't match]

**12-15 min: Close & Next Steps**
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
            return `# IMPACT Positioning Audit

## Company Overview
**Company**: ${company}
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
${phase === 'map' ? `You have ${competitors.length} competitors identified, enabling competitive positioning.` : ''}
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

**Expected Improvement**: +${20 - Math.floor(score / 10)} points with focused work
`).join('')}

---

## 🎯 Recommended Positioning

Based on your inputs, here's a generated positioning statement:

> **For** ${args.target_customer}
> **Who** need to ${args.problem_solved.toLowerCase()}
> **${company}** **is a** solution
> **That** ${args.product_description.toLowerCase().includes('helps') ? args.product_description.split('helps')[1]?.trim() || 'delivers results' : 'delivers results'}
> **Unlike** ${competitors[0] || 'alternatives'}
> **We** ${differentiation}

### Tagline Options
1. "${args.problem_solved.split(' ').slice(0, 4).join(' ')}"
2. "The ${differentiation.split(' ').slice(0, 3).join(' ')} solution"
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

| Metric | Current (Estimated) | Target | Improvement |
|--------|---------------------|--------|-------------|
| Website conversion | 1-2% | 3-5% | 2-3x |
| Email reply rate | 2-5% | 8-15% | 3x |
| Sales cycle | Average | -20% | Faster |
| Win rate | Average | +15% | Higher |

**Investment**: 20-30 hours of positioning work
**Expected ROI**: 2-3x improvement in GTM metrics

---

## 🔧 Tools to Use Next

Based on your scores, prioritize these tools:

1. **\`impact_${weakest[0][0]}\`** - Address your lowest-scoring area first
2. **\`impact_${weakest[1][0]}\`** - Then tackle the second-weakest
3. **\`impact_craft_message\`** - Synthesize into final positioning
4. **\`impact_translate_execution\`** - Activate across channels
`;
        }
    }
};
// =============================================================================
// SERVER HANDLERS
// =============================================================================
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
    tools: Object.entries(tools).map(([name, config]) => ({
        name,
        description: config.description,
        inputSchema: config.inputSchema
    }))
}));
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
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
// =============================================================================
// MAIN
// =============================================================================
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error('IMPACT MCP v2.0.0 running on stdio');
}
main().catch(console.error);
//# sourceMappingURL=index.js.map