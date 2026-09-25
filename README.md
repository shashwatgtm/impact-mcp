# IMPACT MCP v2.2.0
**Hypothesis-Driven B2B Positioning Engine** - 8 tools implementing the IMPACT framework for strategic positioning and go-to-market messaging.

[![NPM Version](https://img.shields.io/npm/v/@shashwatgtmalpha/impact-mcp)](https://www.npmjs.com/package/@shashwatgtmalpha/impact-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Registry](https://img.shields.io/badge/MCP-Registry-blue)](https://registry.modelcontextprotocol.io)

## 🚀 Quick Start

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

## 🎯 The IMPACT Framework

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

Generated on 26 September 2026 from the server's own tool list (`tools/list` of impact-mcp 2.2.0, the same code as the hosted MCP address), so every tool name, title, description and input below is exactly what the server accepts. Every tool is read-only.

| # | Tool | Title | What it does |
|---|---|---|---|
| 1 | `impact_get_framework` | IMPACT Framework Guide | Get complete IMPACT framework methodology with phase-by-phase guidance |
| 2 | `impact_identify_champions` | Identify Champions | Generate champion hypotheses from your company and product context |
| 3 | `impact_map_alternatives` | Map Alternatives | Analyze competitive landscape and find positioning whitespace |
| 4 | `impact_pinpoint_value` | Pinpoint Value | Generate value proposition with quantification and proof points |
| 5 | `impact_anchor_market` | Anchor Market | Select a beachhead market: keyword-based segment scores and a TAM/SAM/SOM framework whose preset figures are labelled for you to replace |
| 6 | `impact_craft_message` | Craft Message | Build positioning statement and message hierarchy with variations |
| 7 | `impact_translate_execution` | Translate Execution | Adapt positioning for specific channels and touchpoints |
| 8 | `impact_full_audit` | IMPACT Full Audit | Complete positioning audit with scoring and recommendations |

### Inputs of each tool

#### 1. IMPACT Framework Guide (`impact_get_framework`)

| Input | Required | Type | Description |
|---|---|---|---|
| `focus_phase` | No | one of: `identify`, `map`, `pinpoint`, `anchor`, `craft`, `translate`, `all` | Optional: specific phase to focus on (identify/map/pinpoint/anchor/craft/translate) |

#### 2. Identify Champions (`impact_identify_champions`)

| Input | Required | Type | Description |
|---|---|---|---|
| `product_description` | Yes | string | What your product does (1-2 sentences) |
| `problem_solved` | Yes | string | The core problem you solve |
| `company_name` | No | string | Your company name |
| `target_company_type` | No | string | Type of companies you target (e.g., "Series B SaaS", "Enterprise manufacturing") |
| `price_point` | No | string | Optional: ACV range (e.g., "$50K-100K") |

#### 3. Map Alternatives (`impact_map_alternatives`)

| Input | Required | Type | Description |
|---|---|---|---|
| `your_product` | Yes | string | What your product does |
| `category` | Yes | string | Your product category (e.g., "Sales engagement", "Data platform") |
| `competitors` | No | array of string | List of competitor names |
| `competitor_weaknesses` | No | string | Optional: Known competitor weaknesses or customer complaints |
| `your_strengths` | No | string | Optional: What you do better than competitors |

#### 4. Pinpoint Value (`impact_pinpoint_value`)

| Input | Required | Type | Description |
|---|---|---|---|
| `target_customer` | Yes | string | Who you serve (e.g., "B2B sales teams") |
| `key_outcome` | Yes | string | The main result customers achieve |
| `unique_capability` | Yes | string | What you do that others cannot/don't |
| `product_name` | No | string | Your product/company name |
| `category` | No | string | Product category |
| `customer_metrics` | No | string | Optional: Any customer results data (e.g., "40% faster, 3x pipeline") |

#### 5. Anchor Market (`impact_anchor_market`)

| Input | Required | Type | Description |
|---|---|---|---|
| `product_description` | Yes | string | What your product does |
| `potential_segments` | No | array of string | List of potential market segments (e.g., ["Mid-market SaaS", "Enterprise Finance", "SMB Retail"]) |
| `current_customers` | No | string | Optional: Description of your current/best customers |
| `average_deal_size` | No | string | Optional: Your ACV as a full amount (e.g., "$50,000"). Shorthand such as "$50K" is read as 50 |
| `sales_cycle` | No | string | Optional: Typical sales cycle length |

#### 6. Craft Message (`impact_craft_message`)

| Input | Required | Type | Description |
|---|---|---|---|
| `target_customer` | Yes | string | Target customer description |
| `key_benefit` | Yes | string | Primary benefit/reason to buy |
| `differentiation` | Yes | string | Your unique differentiation |
| `product_name` | No | string | Your product name |
| `customer_need` | No | string | The need or opportunity they have |
| `product_category` | No | string | Your product category |
| `competitor` | No | string | Primary alternative/competitor |

#### 7. Translate Execution (`impact_translate_execution`)

| Input | Required | Type | Description |
|---|---|---|---|
| `positioning_statement` | Yes | string | Your core positioning statement |
| `target_customer` | Yes | string | Target customer profile |
| `key_benefit` | Yes | string | Primary benefit |
| `channels` | No | array of string | Accepted but not used yet: the output always covers website, LinkedIn, email, sales deck and demo |
| `product_name` | No | string | Your product name |

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

## 👤 Who Is This For?

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
| **🎯 Founder GTM Copilot** | 10 tools | Founders, early-stage CEOs |
| **🎯 Product Marketing Engine** | 12 tools | PMMs, product marketers |
| **🔬 GTM Consultant Suite** | 12 tools | Fractional CMOs, advisors |
| **📞 SDR Toolkit** | 8 tools | SDRs, BDRs |

---

## 🔗 Related MCPs

| MCP | Focus | Tools | Link |
|-----|-------|-------|------|
| CRAFT GTM | GTM strategy | 8 | [GitHub](https://github.com/shashwatgtm/craft-gtm-mcp) |
| CRAFT Content | Content creation | 8 | [GitHub](https://github.com/shashwatgtm/craft-content-mcp) |
| ICP Intelligence | ICP & targeting | 9 | [GitHub](https://github.com/shashwatgtm/icp-intelligence-mcp) |
| Revenue Enablement | Sales execution | 12 | [GitHub](https://github.com/shashwatgtm/revenue-enablement-mcp) |

---

## 📚 About the IMPACT Framework

The IMPACT framework was developed by Shashwat Ghosh based on 24+ years in B2B. It addresses the common failure mode of B2B positioning: starting with features instead of market hypotheses.

**Key Principles:**
- Hypothesis-driven: Test assumptions before committing
- Outside-in: Start with customer, not product
- Iterative: Refine based on market feedback
- Execution-focused: Bridge strategy to implementation

---

## 👨‍💻 Author

**Shashwat Ghosh**, Co-Founder and Fractional CMO, Helix GTM Consulting

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://linkedin.com/in/shashwatghosh)
[![Twitter](https://img.shields.io/badge/Twitter-Follow-1DA1F2)](https://twitter.com/Shashwat_Ghosh)
[![Website](https://img.shields.io/badge/Website-gtmhelix.com-green)](https://gtmhelix.com)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

*Part of the Helix GTM Consulting MCP suite: rule-based B2B go-to-market tools (no AI model runs inside them)*


## Hosted connector (Streamable HTTP)

The same tools are also available as a hosted MCP server, so they work in Claude on the web, desktop and mobile without installing anything.

- Server URL: `https://impact.gtmhelix.com/mcp`
- Transport: Streamable HTTP (stateless, JSON responses). Authentication: none.
- Setup guide: https://impact.gtmhelix.com/
- In Claude: Customize, then Connectors, then Add custom connector, and paste the server URL.
- In Claude Code: `claude mcp add --transport http impact https://impact.gtmhelix.com/mcp`

The npm package (stdio) and the hosted server run the same `createServer()` code in `src/index.ts`.

The tool reference on the setup page (https://impact.gtmhelix.com/) is generated from the code. Where it differs from the parameter tables earlier in this README, the setup page is correct.

## Privacy Policy

Full policy: https://impact.gtmhelix.com/privacy.html (also in [PRIVACY.md](PRIVACY.md)).

- **Data collection:** the hosted server receives only the tool name and the inputs of each tool call. The npm package runs on your computer and sends nothing to us.
- **Use and storage:** inputs are used only to build that call's reply. Nothing is stored: no database, no files, no cache, no logging of inputs or outputs by our code.
- **Third-party sharing:** none by us. Netlify hosts the server and processes requests under its own policy (https://www.netlify.com/privacy/). The web pages load fonts from Google Fonts.
- **Retention:** we keep no tool inputs or outputs. Netlify keeps its own platform logs under its policy.
- **Contact:** shashwat@gtmhelix.com
