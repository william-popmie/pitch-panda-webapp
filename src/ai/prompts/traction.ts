// Traction and competitive advantage analysis prompt

export const TRACTION_PROMPT = `### 🧠 Prompt: "Startup Traction & Competitive Advantages"

**TASK**
You are an AI investment analyst. Analyze the startup's traction metrics and competitive advantages/defensibility.
Extract evidence of revenue, customers, growth, key milestones, intellectual property, partnerships, and other moats.

TARGET STARTUP:
- Name: {{startup_name}}
- URL: {{startup_url}}
- Sector: {{sector}} / {{subsector}}
- Problem: {{problem_general}}
- Solution: {{solution_what}}
- Product Type: {{product_type}}

---

### Website Evidence (verbatim text, trimmed)
{{website_text}}

---

### OUTPUT REQUIREMENTS
Return JSON ONLY with this schema:

{
  "traction": {
    "revenue": "Revenue status: '$XM ARR', '$XM MRR', 'Pre-revenue', 'Revenue-generating (amount not disclosed)', 'Unknown'. Be specific if stated.",
    "customers": "Customer metrics: 'X enterprise customers', 'X SMB customers', 'X users', 'X paying subscribers', 'Undisclosed', 'Unknown'. Include customer types if mentioned.",
    "growth_rate": "Growth metrics: 'X% MoM', 'X% YoY', 'X% QoQ', 'Growing rapidly (specific % not disclosed)', 'Unknown'. Use specific figures if available.",
    "key_milestones": [
      "Major achievement 1 (e.g., 'Raised $XM Series A from [Investor]')",
      "Major achievement 2 (e.g., 'Launched in X new markets', 'Reached X users', 'Signed Fortune 500 customer')",
      "Major achievement 3 (e.g., 'Featured in TechCrunch', 'Won X award', 'Achieved profitability')"
    ],
    "intellectual_property": [
      "Patents: 'X patents filed/granted in [domain]' or 'No patents disclosed'",
      "Proprietary technology: 'Proprietary X algorithm/platform' or description",
      "Trade secrets: 'X years of proprietary data' or other non-public advantages",
      "If none found, return empty array []"
    ],
    "partnerships": [
      "Strategic partnership/LOI 1 (e.g., 'LOI with [Company] for [purpose]')",
      "Channel partner 2 (e.g., 'Partnership with [BigCo] for distribution')",
      "Integration 3 (e.g., 'Official integration with [Platform]')",
      "If none found, return empty array []"
    ],
    "regulatory_moats": [
      "License/certification 1 (e.g., 'FDA approved', 'SOC 2 Type II certified', 'ISO 27001')",
      "Regulatory approval 2 (e.g., 'FCA regulated', 'GDPR compliant')",
      "Industry-specific compliance (e.g., 'HIPAA compliant', 'PCI DSS Level 1')",
      "If none found, return empty array []"
    ],
    "network_effects": "Description of network effects if present: 'Marketplace with X-sided network effect', 'Platform benefits from user-generated content', 'Data network effects from X data points', or 'No significant network effects' or 'Unknown'",
    "defensibility_summary": "2-3 sentences summarizing the startup's overall competitive moats and defensibility. Consider: switching costs, brand, data advantages, technology barriers, scale advantages, regulatory barriers, network effects. Be realistic about strength of moats.",
    "sources": ["URLs where traction/advantage info was found, e.g., press releases, 'about', 'newsroom', blog posts"]
  }
}

### EXTRACTION GUIDELINES
**Traction Metrics:**
- Look for press releases, blog posts, "About", "Newsroom", investor pages
- Extract specific numbers when stated; otherwise note "undisclosed" vs "unknown"
- Key milestones: funding rounds, product launches, major customers (if named), awards, press coverage
- Be conservative: if not explicitly stated, don't inflate

**Competitive Advantages:**
- **IP**: Look for patent mentions, "proprietary technology", "patent-pending", technical innovations
- **Partnerships**: LOIs, strategic partnerships, integrations, channel partners, co-marketing
- **Regulatory**: Certifications (SOC 2, ISO), licenses (FDA, FCA), compliance badges
- **Network Effects**: Does value increase with more users? Is it a marketplace/platform?
- **Defensibility**: What makes this hard to replicate? Data moats? Scale? Brand? Tech complexity?

**Evidence-Based:**
- Only include what's verifiable from website or reasonable inference
- If website doesn't mention something, use [] or "Unknown"
- Don't speculate on IP/partnerships without evidence
- Be honest about defensibility - early-stage startups often have limited moats

### STYLE GUIDE
- Use specific metrics with proper formatting ($XM, X%, X customers)
- For milestones: focus on impressive, verifiable achievements
- For defensibility: be balanced - acknowledge both strengths AND typical startup vulnerabilities
- Avoid marketing hype; translate into concrete competitive advantages
- If information is thin, acknowledge it rather than fabricating
`

export interface TractionPromptParams {
  startup_name: string
  startup_url: string
  sector: string
  subsector: string
  problem_general: string
  solution_what: string
  product_type: string
  website_text: string
  extra_context_data?: string // Structured JSON string
}

export function formatTractionPrompt(params: TractionPromptParams): string {
  let extraContextSection = ''

  if (params.extra_context_data && params.extra_context_data !== '{}') {
    extraContextSection = `

---

### Additional Private Context (Traction & Metrics)

The user has provided confidential traction data and competitive advantage claims:

${params.extra_context_data}

**How to Use This Data:**

**FACTUAL METRICS (Trust These):**
- MRR, ARR, customer counts, user counts, retention, churn, LTV, CAC: Treat as accurate
- Funding amounts, investors, burn rate, runway: Treat as accurate
- Incorporate these metrics directly into your analysis

**IP & PARTNERSHIPS (Verify if Possible):**
- Patents, partnerships, LOIs: Generally factual but verify specifics if mentioned
- Use these in your defensibility analysis

**COMPETITIVE ADVANTAGE CLAIMS (Be Skeptical):**
- "Unique advantages" and "no competitors" type claims: These are biased
- Note them, but independently assess the actual defensibility
- Don't inflate defensibility based solely on self-reported uniqueness

**Your Analysis Should:**
- Use factual metrics to paint an accurate traction picture
- Acknowledge claimed advantages but provide balanced assessment
- In defensibility_summary, be realistic about actual moats vs. marketing claims

---
`
  }

  return TRACTION_PROMPT.replace('{{startup_name}}', params.startup_name)
    .replace('{{startup_url}}', params.startup_url)
    .replace('{{sector}}', params.sector)
    .replace('{{subsector}}', params.subsector)
    .replace('{{problem_general}}', params.problem_general)
    .replace('{{solution_what}}', params.solution_what)
    .replace('{{product_type}}', params.product_type)
    .replace('{{website_text}}', params.website_text + extraContextSection)
}
