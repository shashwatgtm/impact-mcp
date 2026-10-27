# IMPACT MCP v2.2.27
**Hypothesis-Driven B2B Positioning Engine**: 8 tools implementing the IMPACT framework for strategic positioning and go-to-market messaging.

## Use it hosted (no install)

Add `https://impact.gtmhelix.com/mcp` to Claude or ChatGPT as a custom connector. It needs no sign-in and always runs the newest version (2.2.27). The same tools run as a free web app with a form per tool at https://impact.gtmhelix.com/, and the setup steps are at https://impact.gtmhelix.com/connect/.

The npm package below is an older version (2.0.0 on npm on 27 September 2026) until the next npm release. Use it only if you need a local stdio server.


[![NPM Version](https://img.shields.io/npm/v/@shashwatgtmalpha/impact-mcp)](https://www.npmjs.com/package/@shashwatgtmalpha/impact-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Registry](https://img.shields.io/badge/MCP-Registry-blue)](https://registry.modelcontextprotocol.io)

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

Generated on 27 September 2026 from the server's own tool list and checked again on 27 October 2026 against `tools/list` of impact-mcp 2.2.27 (tool descriptions rewritten that day) (the same code as the hosted MCP address), so every tool name, title, description and input below is exactly what the server accepts. Every tool is read-only.

| # | Tool | Title | What it does |
|---|---|---|---|
| 1 | `impact_get_framework` | IMPACT Framework Guide | Returns the IMPACT positioning method step by step: identify champions, map alternatives, pinpoint value, anchor in a market, craft the message and translate it to execution, with a template or checklist for each step. An optional focus phase returns one step only, and your sector adds that sector's buyer roles, measures and proof points. |
| 2 | `impact_identify_champions` | Identify Champions | Takes what your product does and the problem it solves, and returns hypotheses for who buys it: the champion, the economic buyer, the technical influencer, commercial and control reviewers and daily users, with warning signs of an anti-champion, a path to develop the champion and what to give them. Optional company name, target company type, price point and sector fit the roles to your market. These are roles to test, not named people. |
| 3 | `impact_map_alternatives` | Map Alternatives | Takes your product and its category, and returns a map of the alternatives your buyers weigh: one card for each competitor you name, the status-quo options you list and doing nothing, where you can lead, and discovery questions to learn more. Optional competitor weaknesses and your strengths fill the cards, and your sector adds its questions and objections. It uses only what you give and says what would sharpen the map. |
| 4 | `impact_pinpoint_value` | Pinpoint Value | Takes your target customer, the main outcome they get and what you do that others do not, and returns value proposition statements in three versions, a value matrix for your own figures, proof points ranked from customer results to social proof, versions for different audiences and channels, and questions to test the value. Optional product name, category, customer results and business model shape it. |
| 5 | `impact_anchor_market` | Anchor Market | Takes what your product does and the segments you are weighing, and returns a beachhead market choice: your segments ranked from your own customers, pain and deal size when you give all three (the answer says which method it used), otherwise scored on keywords in their names; a TAM/SAM/SOM calculation that uses only the company counts, deal size and percentages you give; a three-year expansion path and an ICP hypothesis for the chosen segment. It never chooses a segment you did not name: without segments it recommends none and explains how to find yours from your own customers. |
| 6 | `impact_craft_message` | Craft Message | Takes your target customer, the key benefit and what sets you apart, and returns a positioning statement (full and one sentence), a message hierarchy from tagline to three supporting pillars, versions for different audiences, objection handling and ways to test the message. Optional product name, customer need, category, main competitor and business model fit it to your market. It writes from your own words, in whole sentences. |
| 7 | `impact_translate_execution` | Translate Execution | Takes a positioning statement, your target customer and the key benefit, and returns copy to edit for the channels you choose: a website hero, a LinkedIn tagline and post drafts, a three-email cold sequence, a sales deck outline and a 15-minute demo script, with calls to action that fit your business model and the order to work the channels in. Optional channels, product name and business model shape it. |
| 8 | `impact_full_audit` | IMPACT Full Audit | Takes what your product does, your target customer and the problem you solve, and returns a positioning audit: an input completeness score for each IMPACT step, the proof you already have, your current positioning checked in words, a recommended positioning with tagline options, a 30-day action plan and the measures to track. Optional company name, differentiation, competitors, current positioning, customer feedback and business model make it fuller. The score measures how complete your inputs are, not how strong your positioning is. |

### Inputs of each tool

#### 1. IMPACT Framework Guide (`impact_get_framework`)

| Input | Required | Type | Description |
|---|---|---|---|
| `focus_phase` | No | one of: `identify`, `map`, `pinpoint`, `anchor`, `craft`, `translate`, `all` | Optional: specific phase to focus on (identify/map/pinpoint/anchor/craft/translate) |
| `your_sector` | No | one of: `logistics_tech`, `fintech`, `saas`, `vertical_saas`, `ai_native`, `ites`, `telecom`, `software`, `cybersecurity`, `other` | Your company's own industry (not your customers'). When given, it decides the sector notes; when left out, the tool reads it from your words and stays neutral if they are unclear. |

#### 2. Identify Champions (`impact_identify_champions`)

| Input | Required | Type | Description |
|---|---|---|---|
| `product_description` | Yes | string | What your product does (1-2 sentences) |
| `problem_solved` | Yes | string | The core problem you solve |
| `company_name` | No | string | Your company name |
| `target_company_type` | No | string | Type of companies you target (e.g., "Series B SaaS", "Enterprise manufacturing") |
| `price_point` | No | string | Optional: ACV range (e.g., "$50K-100K") |
| `your_sector` | No | one of: `logistics_tech`, `fintech`, `saas`, `vertical_saas`, `ai_native`, `ites`, `telecom`, `software`, `cybersecurity`, `other` | Your company's own industry (not your customers'). When given, it decides the sector notes; when left out, the tool reads it from your words and stays neutral if they are unclear. |

#### 3. Map Alternatives (`impact_map_alternatives`)

| Input | Required | Type | Description |
|---|---|---|---|
| `your_product` | Yes | string | What your product does |
| `category` | Yes | string | Your product category (e.g., "Sales engagement", "Data platform") |
| `competitors` | No | array of string | List of competitor names |
| `competitor_weaknesses` | No | string | Optional: Known competitor weaknesses or customer complaints |
| `your_strengths` | No | string | Optional: What you do better than competitors |
| `your_sector` | No | one of: `logistics_tech`, `fintech`, `saas`, `vertical_saas`, `ai_native`, `ites`, `telecom`, `software`, `cybersecurity`, `other` | Your company's own industry (not your customers'). When given, it decides the sector notes; when left out, the tool reads it from your words and stays neutral if they are unclear. |

#### 4. Pinpoint Value (`impact_pinpoint_value`)

| Input | Required | Type | Description |
|---|---|---|---|
| `target_customer` | Yes | string | Who you serve (e.g., "B2B sales teams") |
| `key_outcome` | Yes | string | The main result customers achieve |
| `unique_capability` | Yes | string | What you do that others cannot/don't |
| `product_name` | No | string | Your product/company name |
| `category` | No | string | Product category |
| `customer_metrics` | No | string | Optional: Any customer results data (e.g., "40% faster, 3x pipeline") |
| `your_sector` | No | one of: `logistics_tech`, `fintech`, `saas`, `vertical_saas`, `ai_native`, `ites`, `telecom`, `software`, `cybersecurity`, `other` | Your company's own industry (not your customers'). When given, it decides the sector notes; when left out, the tool reads it from your words and stays neutral if they are unclear. |

#### 5. Anchor Market (`impact_anchor_market`)

| Input | Required | Type | Description |
|---|---|---|---|
| `product_description` | Yes | string | What your product does |
| `potential_segments` | No | array of string | The market segments you are weighing, in your own words (for example Mid-market fintech, Enterprise banks, Small retail chains). Needed for a recommendation: without segments no segment is chosen, and the answer explains how to find yours |
| `current_customers` | No | string | Optional: Description of your current/best customers. Shown in the output; not used in the scoring |
| `average_deal_size` | No | string | Optional: Your ACV as one amount (e.g., "$50,000", "$50K" or "$1.5M"); a range is refused |
| `sales_cycle` | No | string | Optional: Typical sales cycle length. Shown in the output; not used in the scoring |
| `your_sector` | No | one of: `logistics_tech`, `fintech`, `saas`, `vertical_saas`, `ai_native`, `ites`, `telecom`, `software`, `cybersecurity`, `other` | Your company's own industry (not your customers'). When given, it decides the sector notes; when left out, the tool reads it from your words and stays neutral if they are unclear. |

#### 6. Craft Message (`impact_craft_message`)

| Input | Required | Type | Description |
|---|---|---|---|
| `target_customer` | Yes | string | Target customer description |
| `key_benefit` | Yes | string | Primary benefit/reason to buy |
| `differentiation` | Yes | string | Your unique differentiation |
| `product_name` | No | string | Your product name |
| `customer_need` | No | string | The need they have, written as an action (for example "lose revenue to missed appointments") |
| `product_category` | No | string | Your product category, written as a noun phrase (for example "analytics platform") |
| `competitor` | No | string | Primary alternative/competitor |
| `your_sector` | No | one of: `logistics_tech`, `fintech`, `saas`, `vertical_saas`, `ai_native`, `ites`, `telecom`, `software`, `cybersecurity`, `other` | Your company's own industry (not your customers'). When given, it decides the sector notes; when left out, the tool reads it from your words and stays neutral if they are unclear. |

#### 7. Translate Execution (`impact_translate_execution`)

| Input | Required | Type | Description |
|---|---|---|---|
| `positioning_statement` | Yes | string | Your core positioning statement |
| `target_customer` | Yes | string | Target customer profile |
| `key_benefit` | Yes | string | Primary benefit, written as an action (for example "cut no-shows") |
| `channels` | No | array of string | Accepted but not used yet: the output always covers website, LinkedIn, email, sales deck and demo |
| `product_name` | No | string | Your product name |
| `your_sector` | No | one of: `logistics_tech`, `fintech`, `saas`, `vertical_saas`, `ai_native`, `ites`, `telecom`, `software`, `cybersecurity`, `other` | Your company's own industry (not your customers'). When given, it decides the sector notes; when left out, the tool reads it from your words and stays neutral if they are unclear. |

#### 8. IMPACT Full Audit (`impact_full_audit`)

| Input | Required | Type | Description |
|---|---|---|---|
| `product_description` | Yes | string | What your product does |
| `target_customer` | Yes | string | Who you serve |
| `problem_solved` | Yes | string | The problem you solve |
| `company_name` | No | string | Your company name |
| `key_differentiation` | No | string | What makes you unique |
| `competitors` | No | array of string | Main competitors |
| `current_positioning` | No | string | Optional: Your current positioning statement or tagline |
| `customer_feedback` | No | string | Optional: What customers say about you |
| `your_sector` | No | one of: `logistics_tech`, `fintech`, `saas`, `vertical_saas`, `ai_native`, `ites`, `telecom`, `software`, `cybersecurity`, `other` | Your company's own industry (not your customers'). When given, it decides the sector notes; when left out, the tool reads it from your words and stays neutral if they are unclear. |

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
| CRAFT GTM | GTM strategy | 8 | [GitHub](https://github.com/shashwatgtm/craft-gtm-mcp) |
| CRAFT Content | Content creation | 8 | [GitHub](https://github.com/shashwatgtm/craft-content-mcp) |
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

The npm package (stdio) and the hosted server run the same `createServer()` code in `src/index.ts`.

The tool reference (https://impact.gtmhelix.com/docs/) is generated from the code. Where it differs from the parameter tables earlier in this README, the tool reference is correct.

## Privacy Policy

Full policy: <https://impact.gtmhelix.com/privacy/> (also in [PRIVACY.md](PRIVACY.md)).

- **Data collection:** the hosted server receives only the tool name and the inputs of each tool call. The npm package runs on your computer and sends nothing to us.
- **Use and storage:** inputs are used only to build that call's reply. Nothing is stored: no database, no files, no cache, no logging of inputs or outputs by our code.
- **Third-party sharing:** none by us. Netlify hosts the server and processes requests under its own policy (https://www.netlify.com/privacy/). Fonts are served from this site, so loading a page contacts no one else.
- **Retention:** we keep no tool inputs or outputs. Netlify keeps its own platform logs under its policy.
- **Contact:** shashwat@gtmhelix.com
