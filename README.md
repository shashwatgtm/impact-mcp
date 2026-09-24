# IMPACT MCP v2.0.0

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

## 🛠️ Tools Overview

| Tool | Purpose | Primary Output |
|------|---------|----------------|
| `impact_get_framework` | Complete IMPACT methodology reference | Full framework documentation |
| `impact_identify_champions` | Champion persona hypothesis | Buyer personas with pain points |
| `impact_map_alternatives` | Competitive landscape analysis | Whitespace identification |
| `impact_pinpoint_value` | Value proposition development | "Only Statement" generator |
| `impact_anchor_market` | Beachhead market selection | TAM/SAM/SOM analysis |
| `impact_craft_message` | Positioning statement creation | Message hierarchy |
| `impact_translate_execution` | Channel-specific adaptation | Website/LinkedIn/email/deck/demo versions |
| `impact_full_audit` | Complete positioning assessment | Comprehensive scoring & recommendations |

---

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

## 📖 Tool Details

### 1. IMPACT Get Framework (`impact_get_framework`)

Get the complete IMPACT methodology reference.

**Inputs:** None required

**Output:** Full 6-phase framework documentation with examples and best practices.

### 2. IMPACT Identify Champions (`impact_identify_champions`)

Generate champion persona hypothesis from product/problem context.

**Inputs:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| `product` | ✅ | Your product/service description |
| `problem_solved` | ✅ | Core problem you solve |
| `current_customers` | ❌ | Description of existing customers |

**Output:** Champion profiles with titles, pain points, success metrics, and buying triggers.

### 3. IMPACT Map Alternatives (`impact_map_alternatives`)

Analyze competitive landscape and identify whitespace.

**Inputs:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| `product` | ✅ | Your product/service |
| `known_competitors` | ❌ | List of known competitors |
| `customer_alternatives` | ❌ | What customers do instead |

**Output:** Competitive matrix, status quo analysis, whitespace opportunities.

### 4. IMPACT Pinpoint Value (`impact_pinpoint_value`)

Develop value proposition with "Only Statement" generator.

**Inputs:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| `product` | ✅ | Your product/service |
| `target_champion` | ✅ | Primary buyer persona |
| `competitive_context` | ❌ | Key differentiators |
| `proof_points` | ❌ | Evidence supporting claims |

**Output:** Only Statement, value hierarchy, proof point framework.

### 5. IMPACT Anchor Market (`impact_anchor_market`)

Select beachhead market with TAM/SAM/SOM analysis.

**Inputs:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| `product` | ✅ | Your product/service |
| `value_proposition` | ✅ | Core value prop |
| `potential_segments` | ❌ | Market segments to evaluate |
| `constraints` | ❌ | Resources, geography, etc. |

**Output:** Beachhead recommendation, market sizing, expansion roadmap.

### 6. IMPACT Craft Message (`impact_craft_message`)

Create positioning statement and message hierarchy.

**Inputs:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| `product` | ✅ | Your product/service |
| `target_market` | ✅ | Who you serve |
| `value_proposition` | ✅ | Core value |
| `key_differentiators` | ✅ | What makes you different |
| `proof_points` | ❌ | Supporting evidence |

**Output:** Positioning statement, tagline options, message pillars, elevator pitch.

### 7. IMPACT Translate Execution (`impact_translate_execution`)

Adapt positioning for specific channels.

**Inputs:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| `positioning` | ✅ | Core positioning statement |
| `channel` | ✅ | website, linkedin, email, pitch_deck, demo_script |
| `target_persona` | ❌ | Specific audience for this channel |

**Output:** Channel-optimized messaging with format-specific guidelines.

### 8. IMPACT Full Audit (`impact_full_audit`)

Comprehensive positioning assessment with scoring.

**Inputs:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| `company` | ✅ | Company name |
| `product` | ✅ | Product/service description |
| `current_positioning` | ❌ | Existing positioning materials |
| `target_market` | ❌ | Current target market definition |
| `competitors` | ❌ | Known competitors |

**Output:** Phase-by-phase scoring, gap analysis, prioritized recommendations, action plan.

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

**Shashwat Ghosh** - Founder, Helix GTM Consulting

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://linkedin.com/in/shashwatghosh)
[![Twitter](https://img.shields.io/badge/Twitter-Follow-1DA1F2)](https://twitter.com/Shashwat_Ghosh)
[![Website](https://img.shields.io/badge/Website-gtmhelix.com-green)](https://gtmhelix.com)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

*Part of the GTM Helix MCP Suite - AI-powered B2B go-to-market tools*


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
