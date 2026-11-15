# IMPACT MCP v2.2.27
**Hypothesis-Driven B2B Positioning Engine**: 9 tools implementing the IMPACT framework for strategic positioning and go-to-market messaging.

## Use it hosted (no install)

Add `https://impact.gtmhelix.com/mcp` as a Streamable HTTP connector. It needs no sign in. The hosted endpoint always runs the newest version (2.2.27) available on this site. It listed 9 tools on 15 November 2026. [Connection instructions](https://impact.gtmhelix.com/connect/). You can also open the [web app](https://impact.gtmhelix.com/).

For a local stdio connection, run `npx -y @shashwatgtmalpha/impact-mcp`. On 15 November 2026 the latest published npm version was 2.2.27. Check the available version with `npm view @shashwatgtmalpha/impact-mcp version`.


[![NPM Version](https://img.shields.io/npm/v/@shashwatgtmalpha/impact-mcp)](https://www.npmjs.com/package/@shashwatgtmalpha/impact-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Registry](https://img.shields.io/badge/MCP-Registry-blue)](https://registry.modelcontextprotocol.io/?search=io.github.shashwatgtm%2Fimpact-mcp)

## Quick Start

```bash
# Run directly with npx
npx -y @shashwatgtmalpha/impact-mcp
```

### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "impact-mcp": {
      "command": "npx",
      "args": ["-y", "@shashwatgtmalpha/impact-mcp"]
    }
  }
}
```

---

## The IMPACT Framework

**IMPACT** is a hypothesis-driven positioning methodology for B2B companies:

| Phase | Focus | Tool |
|-------|-------|------|
| **I**dentify | Champions & Buyer Personas | `impact_identify_champions` |
| **M**ap | Alternatives & Competitive Landscape | `impact_map_alternatives` |
| **P**inpoint | Value Proposition & Differentiation | `impact_pinpoint_value` |
| **A**nchor | Market Selection & Beachhead | `impact_anchor_market` |
| **C**raft | Messaging & Positioning Statement | `impact_craft_message` |
| **T**ranslate | Channel-Specific Execution | `impact_translate_execution` |

---

## Tools and inputs

The 9 tools below come from `tools/list` in the 2.2.27 source build, checked on 15 November 2026. Each table shows the accepted fields. A dot marks a field inside an object and `[]` marks an array item. A nested field marked required is required when its parent is supplied.

| # | Tool | Title | What it does |
|---|---|---|---|
| 1 | `impact_get_framework` | IMPACT Framework Guide | Helps you decide which positioning steps to run, and in what order. You give nothing, or one IMPACT step to focus on and your sector. You get the IMPACT positioning method step by step (identify champions, map alternatives, pinpoint value, anchor in a market, craft the message, translate it to execution), with a template or checklist for each step; a focus step returns that step only, and your sector adds its buyer roles, measures and proof points. |
| 2 | `impact_identify_champions` | Identify Champions | Helps you decide who inside the buyer will push for you. You give what your product does and the problem it solves, plus optional company name, target company type, price point and sector. You get hypotheses for the champion, the economic buyer, the technical influencer, commercial and control reviewers and daily users, warning signs of an anti champion, a path to develop the champion and what to give them. These are roles to test, not named people. |
| 3 | `impact_map_alternatives` | Map Alternatives | Helps you decide what buyers compare you with, and where you can lead. You give your product and its category, plus optional competitors, their weaknesses and your strengths. You get one card for each competitor you name, the status quo and doing nothing, where you can lead and discovery questions, with your sector's questions and objections. It uses only what you give and says what would sharpen the map. |
| 4 | `impact_pinpoint_value` | Pinpoint Value | Helps you decide what you can claim that buyers will believe. You give your target customer, the main outcome they get and what you do that others do not, plus optional product name, category, customer results and business model. You get value statements in three versions, a value matrix for your own figures, proof points ranked from customer results to social proof, versions for different audiences and channels, and questions to test the value. |
| 5 | `impact_anchor_market` | Anchor Market | Helps you decide which market segment to win first. You give what your product does and the segments you are weighing, plus optional customers, pain, deal size and company counts. You get a beachhead choice: your segments ranked from your own customers, pain and deal size when you give all three (the answer says which method it used), otherwise scored on keywords in their names; a TAM, SAM and SOM calculation from only the figures you give; a three year expansion path and an ICP hypothesis for the chosen segment. It never chooses a segment you did not name. |
| 6 | `impact_craft_message` | Craft Message | Helps you decide what your core message is, and how to test it. You give your target customer, the key benefit and what sets you apart, plus optional product name, customer need, category, main competitor and business model. You get a positioning statement (full and one sentence), a message hierarchy from tagline to three supporting pillars, versions for different audiences, objection handling and ways to test the message. It writes from your own words, in whole sentences. |
| 7 | `impact_translate_execution` | Translate Execution | Helps you decide how your positioning should read in each channel. You give a positioning statement, your target customer and the key benefit, plus optional channels, product name and business model. You get copy to edit: a website hero, a LinkedIn tagline and post drafts, a three email cold sequence, a sales deck outline and a 15 minute demo script, with calls to action that fit your business model and the order to work the channels in. |
| 8 | `impact_full_audit` | IMPACT Full Audit | Helps you decide whether your positioning is working and what to fix first. You give what your product does, your target customer and the problem you solve, plus optional company name, differentiation, competitors, current positioning, customer feedback and business model. You get a positioning audit: an input completeness score for each IMPACT step, the proof you already have, your current positioning checked in words, a recommended positioning with tagline options, a 30 day action plan and the measures to track. The score measures how complete your inputs are, not how strong your positioning is. |
| 9 | `impact_build_segment_message` | Build our message for this segment | Build our message for this segment when our sellers do not use the message or buyers stay with what they have. Needs the product, segment, champion problem, alternatives, outcome, capability and proof. Returns proof gaps and current approach questions, champion and alternatives maps for human choices, then a message and proof plan after a pause. Optional agreed workshop claim is the starting point. Without a real customer result, buyer lines are unproved hypotheses and the next step is discovery questions. Chat carries the brief between calls. |

<details>
<summary>Hosted wording for the full audit on 15 November 2026</summary>

The hosted endpoint also reports 2.2.27. Its tool description reads:

> Helps you decide whether your positioning is working and what to fix first. Use for a full positioning review or when someone asks help me explain why we are different. Ask what the product does, who it serves and the problem it solves before calling; never invent these or fill missing facts with placeholders such as Not supplied. Clarify what unlabelled numbers mean. For a request only to phrase a message, impact_craft_message also fits; use this tool for the full review. You get input completeness scores, supplied proof, a positioning draft and next actions. Scores measure how complete the inputs are, not how strong the positioning is. Never invent proof.

These five field descriptions differ on the hosted endpoint. The field names, types and required status match the source build.

| Field | Hosted description |
|---|---|
| `product_description` | What the product or service does, in the user's words. Ask if missing; do not invent or use a placeholder. |
| `target_customer` | Who it serves, as supplied by the user. Ask if missing. Keep staff ranges as ranges and clarify unlabelled numbers. |
| `problem_solved` | The problem the user says they solve. Ask if missing; do not invent or use a placeholder. |
| `key_differentiation` | A difference the user can describe. Leave out if unknown; do not invent uniqueness or proof. |
| `customer_feedback` | Customer feedback actually supplied by the user. Leave out if absent; never invent quotes or outcomes. |

</details>

### Inputs of each tool

#### 1. IMPACT Framework Guide (`impact_get_framework`)

| Input | Required | Type | Description |
|---|---|---|---|
| `focus_phase` | No | one of `identify`, `map`, `pinpoint`, `anchor`, `craft`, `translate`, `all` | Specific phase to focus on (identify/map/pinpoint/anchor/craft/translate) |
| `sector` | No | string | Your sector in your own words (for example logistics tech, fintech, SaaS, vertical SaaS, AI native, IT services, telecom, software or cybersecurity). Adds how the six steps read in that sector. The same as your selected sector; your selected sector wins when both are given |
| `your_sector` | No | one of `logistics_tech`, `fintech`, `saas`, `vertical_saas`, `ai_native`, `ites`, `telecom`, `software`, `cybersecurity`, `other` | Your company's own industry (not your customers'). When given, it decides the sector notes; when left out, the tool reads it from your words and stays neutral if they are unclear. |

#### 2. Identify Champions (`impact_identify_champions`)

| Input | Required | Type | Description |
|---|---|---|---|
| `company_name` | No | string | Your company name |
| `product_description` | Yes | string | What your product does (1-2 sentences) |
| `problem_solved` | Yes | string | The core problem you solve |
| `target_company_type` | No | string | Type of companies you target (e.g., "mid-size fintech companies", "enterprise manufacturers") |
| `price_point` | No | string | What you charge, with the period, in your own words (for example "$50,000 a year" or "$3,750 per month") |
| `your_sector` | No | one of `logistics_tech`, `fintech`, `saas`, `vertical_saas`, `ai_native`, `ites`, `telecom`, `software`, `cybersecurity`, `other` | Your company's own industry (not your customers'). When given, it decides the sector notes; when left out, the tool reads it from your words and stays neutral if they are unclear. |

#### 3. Map Alternatives (`impact_map_alternatives`)

| Input | Required | Type | Description |
|---|---|---|---|
| `your_product` | Yes | string | What your product does |
| `category` | Yes | string | Your product category (e.g., "cloud security monitoring", "last-mile delivery software") |
| `competitors` | No | array of string | List of competitor names, and the status-quo options your buyers use (for example "spreadsheets"). A description in brackets after a name is kept |
| `competitor_weaknesses` | No | string | Known competitor weaknesses or customer complaints, one per line or separated by semicolons. A weakness that names a competitor is shown on its card |
| `your_strengths` | No | string | What you do better than competitors, one per line or separated by semicolons |
| `your_sector` | No | one of `logistics_tech`, `fintech`, `saas`, `vertical_saas`, `ai_native`, `ites`, `telecom`, `software`, `cybersecurity`, `other` | Your company's own industry (not your customers'). When given, it decides the sector notes; when left out, the tool reads it from your words and stays neutral if they are unclear. |

#### 4. Pinpoint Value (`impact_pinpoint_value`)

| Input | Required | Type | Description |
|---|---|---|---|
| `product_name` | No | string | Your product/company name |
| `category` | No | string | Product category |
| `target_customer` | Yes | string | Who you serve (e.g., "cloud security leads at mid-size fintech companies") |
| `key_outcome` | Yes | string | The main result customers achieve |
| `unique_capability` | Yes | string | What you do that others cannot/don't |
| `customer_metrics` | No | string | Any customer results data (e.g., "critical exposures down 70% in one quarter; audit preparation from 3 weeks to 4 days") |
| `business_model` | No | one of `saas`, `services`, `connectivity`, `transactions`, `marketplace`, `hardware_software`, `investment` | How you sell (saas, services, connectivity, transactions, marketplace, hardware_software or investment). Used to choose proof types; read from your inputs when not given |
| `your_sector` | No | one of `logistics_tech`, `fintech`, `saas`, `vertical_saas`, `ai_native`, `ites`, `telecom`, `software`, `cybersecurity`, `other` | Your company's own industry (not your customers'). When given, it decides the sector notes; when left out, the tool reads it from your words and stays neutral if they are unclear. |

#### 5. Anchor Market (`impact_anchor_market`)

| Input | Required | Type | Description |
|---|---|---|---|
| `product_description` | Yes | string | What your product does |
| `potential_segments` | No | array of string | The market segments you are weighing, in your own words (for example Mid-market fintech, Enterprise banks, Small retail chains). Needed for a recommendation: without segments no segment is chosen, and the answer explains how to find yours |
| `current_customers` | No | string | Description of your current/best customers. With customer pain and average deal size it ranks the segments (the answer says which method it used); without them it is shown only and the keyword presets score the segments |
| `customer_pain` | No | string | The problem your best customers describe, in their words. With current customers and average deal size it ranks the segments from your own inputs; without them the keyword presets are used |
| `average_deal_size` | No | string | Your annual contract value (ACV) as one amount (e.g., "$50,000", "$50K" or "$1.5M"); a range is refused |
| `sales_cycle` | No | string | Typical sales cycle length. Shown in the output; not used in the scoring |
| `company_counts` | No | string | How many companies you could sell to in each segment, one per line or separated by semicolons (for example "Mid-market fintech: 3,200; Enterprise banks: 600"). A single number is read as the count for the recommended segment. Needed for market sizing |
| `percent_matching_icp` | No | number (maximum 100, greater than 0) | The percent of those companies that match your ideal customer profile (for example 25). Needed for SAM |
| `year_one_share_percent` | No | number (maximum 100, greater than 0) | The share of the matching companies you expect to win in year one, in percent (for example 1). Needed for SOM |
| `your_sector` | No | one of `logistics_tech`, `fintech`, `saas`, `vertical_saas`, `ai_native`, `ites`, `telecom`, `software`, `cybersecurity`, `other` | Your company's own industry (not your customers'). When given, it decides the sector notes; when left out, the tool reads it from your words and stays neutral if they are unclear. |

#### 6. Craft Message (`impact_craft_message`)

| Input | Required | Type | Description |
|---|---|---|---|
| `product_name` | No | string | Your product name |
| `target_customer` | Yes | string | Target customer description |
| `customer_need` | No | string | The need they have, written as an action (for example "lose days chasing low-risk cloud alerts") |
| `product_category` | No | string | Your product category, written as a noun phrase (for example "cloud security monitoring platform") |
| `key_benefit` | Yes | string | Primary benefit/reason to buy |
| `competitor` | No | string | Primary alternative/competitor |
| `differentiation` | Yes | string | Your unique differentiation |
| `business_model` | No | one of `saas`, `services`, `connectivity`, `transactions`, `marketplace`, `hardware_software`, `investment` | How you sell (saas, services, connectivity, transactions, marketplace, hardware_software or investment). Used to choose the cost and proof lines; read from your inputs when not given |
| `your_sector` | No | one of `logistics_tech`, `fintech`, `saas`, `vertical_saas`, `ai_native`, `ites`, `telecom`, `software`, `cybersecurity`, `other` | Your company's own industry (not your customers'). When given, it decides the sector notes; when left out, the tool reads it from your words and stays neutral if they are unclear. |

#### 7. Translate Execution (`impact_translate_execution`)

| Input | Required | Type | Description |
|---|---|---|---|
| `positioning_statement` | Yes | string | Your core positioning statement |
| `target_customer` | Yes | string | Target customer profile |
| `key_benefit` | Yes | string | Primary benefit, written as an action (for example "fix critical exposures first") |
| `channels` | No | array of string | Which channels to cover, from website, linkedin, cold_email, sales_deck and product_demo. Others are listed as not covered; with none, all five are covered |
| `product_name` | No | string | Your product name |
| `business_model` | No | one of `saas`, `services`, `connectivity`, `transactions`, `marketplace`, `hardware_software`, `investment` | How you sell (saas, services, connectivity, transactions, marketplace, hardware_software or investment). Used to choose calls to action and commercial terms; read from your inputs when not given |
| `your_sector` | No | one of `logistics_tech`, `fintech`, `saas`, `vertical_saas`, `ai_native`, `ites`, `telecom`, `software`, `cybersecurity`, `other` | Your company's own industry (not your customers'). When given, it decides the sector notes; when left out, the tool reads it from your words and stays neutral if they are unclear. |

#### 8. IMPACT Full Audit (`impact_full_audit`)

| Input | Required | Type | Description |
|---|---|---|---|
| `company_name` | No | string | Your company name |
| `product_description` | Yes | string | What your product does |
| `target_customer` | Yes | string | Who you serve |
| `problem_solved` | Yes | string | The problem you solve |
| `key_differentiation` | No | string | What makes you unique |
| `competitors` | No | array of string | Main competitors |
| `current_positioning` | No | string | Your current positioning statement or tagline |
| `customer_feedback` | No | string | What customers say about you |
| `business_model` | No | one of `saas`, `services`, `connectivity`, `transactions`, `marketplace`, `hardware_software`, `investment` | How you sell (saas, services, connectivity, transactions, marketplace, hardware_software or investment). Used in the plan; read from your inputs when not given. It does not change the score |
| `your_sector` | No | one of `logistics_tech`, `fintech`, `saas`, `vertical_saas`, `ai_native`, `ites`, `telecom`, `software`, `cybersecurity`, `other` | Your company's own industry (not your customers'). When given, it decides the sector notes; when left out, the tool reads it from your words and stays neutral if they are unclear. |

#### 9. Build our message for this segment (`impact_build_segment_message`)

Only the listed top level fields are accepted.

| Input | Required | Type | Description |
|---|---|---|---|
| `stage` | Yes | one of `map`, `message` | Map first. After the buyer chooses, call message with the same brief, its review receipt and confirmed choices. |
| `brief` | Yes | object (listed fields only) | The segment brief carried unchanged between calls. |
| `brief.product` | Yes | string (minimum characters 1, maximum characters 4000) | The product name. |
| `brief.product_description` | Yes | string (minimum characters 1, maximum characters 4000) | What the product does, from your own brief. |
| `brief.segments` | Yes | array of string (minimum items 1, maximum items 1) |  |
| `brief.problem` | Yes | string (minimum characters 1, maximum characters 4000) | The problem in the champion's words. |
| `brief.category` | Yes | string (minimum characters 1, maximum characters 4000) | The category word you want to test. |
| `brief.alternatives` | Yes | array of string (minimum items 1, maximum items 30) |  |
| `brief.weak_points` | No | string (minimum characters 1, maximum characters 4000) | Your notes about weak points to test. They are not competitor facts. |
| `brief.desired_outcome` | Yes | string (minimum characters 1, maximum characters 4000) | The outcome the buyer wants, without an illustrative improvement figure. |
| `brief.capability` | Yes | string (minimum characters 1, maximum characters 4000) | The capability that could produce that outcome. |
| `brief.trigger` | Yes | string (minimum characters 1, maximum characters 4000) | What makes the problem matter now. |
| `brief.measure` | Yes | string (minimum characters 1, maximum characters 4000) | The measure and its definition. |
| `brief.sector` | Yes | string (minimum characters 1, maximum characters 4000) | Your sector in your own words. |
| `brief.agreed_claim` | No | string (minimum characters 1, maximum characters 4000) | The agreed claim from the ChatGPT Positioning Workshop, if available. The chain starts from it when given. |
| `brief.proof` | Yes | object (listed fields only) |  |
| `brief.proof.kind` | Yes | one of `none`, `illustrative`, `customer_result` |  |
| `brief.proof.result` | No | string (minimum characters 1, maximum characters 4000) | A real customer result, or the illustrative result kept out of buyer copy. |
| `brief.proof.source` | No | string (minimum characters 1, maximum characters 4000) | The source of the customer result, using https. |
| `brief.proof.period` | No | string (minimum characters 1, maximum characters 4000) | The period actually measured, not the publication date. |
| `review_receipt` | No | string (minimum characters 1, maximum characters 4000) | The receipt from the map call, carried by chat. The server stores no brief. |
| `choices` | No | object (listed fields only) | The champion and alternative choices confirmed by the buyer after reading the maps. |
| `choices.confirmed` | Yes | boolean | True only after the buyer confirms these choices in chat. |
| `choices.champion` | Yes | string (minimum characters 1, maximum characters 4000) | The champion role or person the buyer chose. Confirmation is still a hypothesis until advocacy and access are evidenced. |
| `choices.champion_segment` | Yes | string (minimum characters 1, maximum characters 4000) | The confirmed target customer wording in this segment. Sent to the value tool word for word. |
| `choices.alternative` | Yes | string (minimum characters 1, maximum characters 4000) | The alternative chosen from the map. Sent to the message tool word for word. |

## Who Is This For?

### Primary Users

| Role | Key Tools | Use Cases |
|------|-----------|-----------|
| **Founders/CEOs** | `impact_anchor_market`, `impact_pinpoint_value`, `impact_craft_message` | Market selection, value articulation |
| **CMOs/VPs Marketing** | `impact_full_audit`, `impact_get_framework` | Positioning health assessment |
| **Product Marketing** | `impact_identify_champions`, `impact_craft_message`, `impact_translate_execution` | Messaging, channel adaptation |
| **Sales Leaders** | `impact_map_alternatives`, `impact_pinpoint_value` | Competitive positioning |
| **GTM Consultants** | All tools | Full positioning engagements |

### Job-to-Tool Mapping

| Job To Be Done | Recommended Tool |
|----------------|------------------|
| "I need to understand the IMPACT methodology" | `impact_get_framework` |
| "I need to define our ideal buyer champion" | `impact_identify_champions` |
| "I need to map our competitive landscape" | `impact_map_alternatives` |
| "I need to articulate our unique value" | `impact_pinpoint_value` |
| "I need to select our beachhead market" | `impact_anchor_market` |
| "I need to create our positioning statement" | `impact_craft_message` |
| "I need to adapt messaging for different channels" | `impact_translate_execution` |
| "I need a full positioning audit" | `impact_full_audit` |

### Recommended Agent Skills

This MCP is included in these user-focused Agent bundles:

| Agent Bundle | Tools Count | Best For |
|--------------|-------------|----------|
| **Founder GTM Copilot** | 10 tools | Founders, early-stage CEOs |
| **Product Marketing Engine** | 12 tools | PMMs, product marketers |
| **GTM Consultant Suite** | 12 tools | Fractional CMOs, advisors |
| **SDR Toolkit** | 8 tools | SDRs, BDRs |

---

## Related MCPs

| MCP | Focus | Tools | Link |
|-----|-------|-------|------|
| CRAFT GTM | GTM strategy | 10 | [GitHub](https://github.com/shashwatgtm/craft-gtm-mcp) |
| CRAFT Content | Content creation | 9 | [GitHub](https://github.com/shashwatgtm/craft-content-mcp) |
| ICP Intelligence | ICP & targeting | 9 | [GitHub](https://github.com/shashwatgtm/icp-intelligence-mcp) |
| Revenue Enablement | Sales execution | 12 | [GitHub](https://github.com/shashwatgtm/revenue-enablement-mcp) |

---

## About the IMPACT Framework

The IMPACT framework was developed by Shashwat Ghosh based on 24+ years in B2B and 10+ years of fractional experience. It addresses the common failure mode of B2B positioning: starting with features instead of market hypotheses.

**Key Principles:**
- Hypothesis-driven: Test assumptions before committing
- Outside-in: Start with customer, not product
- Iterative: Refine based on market feedback
- Execution-focused: Bridge strategy to implementation

---

## Author

**Shashwat Ghosh**, Co-Founder and Fractional CMO, Helix GTM Consulting, with 24+ years in B2B and 10+ years of fractional experience

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://www.linkedin.com/in/shashwatghosh-ai-b2b-gtm-fractionalcmo/)
[![X](https://img.shields.io/badge/X-Follow-1A0E10)](https://x.com/Shashwat_Ghosh)
[![Website](https://img.shields.io/badge/Website-gtmhelix.com-green)](https://gtmhelix.com)

---

## License

MIT License: see [LICENSE](LICENSE) for details.

---

*Part of the Helix GTM Consulting MCP suite: rule-based B2B go-to-market tools (no AI model runs inside them)*


## Hosted connector (Streamable HTTP)

The same tools are also available as a hosted MCP server, so they work in Claude on the web, desktop and mobile without installing anything.

- Server URL: `https://impact.gtmhelix.com/mcp`
- Transport: Streamable HTTP (stateless, JSON responses). Authentication: none.
- Setup guide: https://impact.gtmhelix.com/connect/
- In Claude: Customize, then Connectors, then Add custom connector, and paste the server URL.
- In Claude Code: `claude mcp add --transport http impact https://impact.gtmhelix.com/mcp`

The repository defines the stdio and hosted entry points using `createServer()` in `src/index.ts`.

The tool reference (https://impact.gtmhelix.com/docs/) is generated from the code. Where it differs from the parameter tables earlier in this README, the tool reference is correct.

## Privacy Policy

Full policy: <https://impact.gtmhelix.com/privacy/> (also in [PRIVACY.md](PRIVACY.md)).

- **Data collection:** the hosted server receives only the tool name and the inputs of each tool call. The npm package runs on your computer and sends nothing to us.
- **Use and storage:** inputs are used only to build that call's reply. Inputs and answers are not stored: no database, no files, no cache, no logging of inputs or outputs by our code. Each call adds one anonymous usage record (date and time, site and tool name, app kind, web form or assistant); see the privacy page.
- **Third-party sharing:** none by us. Netlify hosts the server and processes requests under its own policy (https://www.netlify.com/privacy/). Fonts are served from this site, so loading a page contacts no one else.
- **Retention:** we keep no tool inputs or outputs. Netlify keeps its own platform logs under its policy.
- **Contact:** shashwat@gtmhelix.com

### Build our message for this segment

`impact_build_segment_message` runs in chat with a mandatory pause. The map call starts the existing champion and alternatives tools independently. It leads with proof gaps and questions about the current approach, then returns both maps and a review receipt. The buyer confirms the champion, the target customer wording and the alternative. Chat carries that same brief and receipt into the message call; the server stores no brief.

The message call uses the existing value and message tools. An optional agreed claim from the ChatGPT Positioning Workshop is the starting point. Without a real customer result with source and measurement period, the buyer lines stay labelled unproved hypotheses, figures are held out, and only discovery questions are offered next. With a result supplied, the sales kit is also offered. The tool still asks the buyer to check that trigger, measure and mechanism concern the same thing, test the category word and take the draft to five buyers.

The display-only view is derived from the shared Helix results view and served at `ui://helix/results/chains/v1.html`. Choices send a message to chat; the widget does not call tools or calculate. Text-only hosts receive the complete same answer. The tool page is `/tools/build-segment-message/` and has no form. To regenerate the additive view after a display change, run `python scripts/build-chain-view.py`, then `npm run build`. The font licences sit beside the bundled fonts.
