// Market analysis prompt

export const MARKET_PROMPT = `### 🧠 Prompt: "Startup Market Analysis"

**TASK**
You are an AI market analyst. Analyze the market opportunity for this startup based on the validated profile
and available website/public information. Estimate TAM/SAM/SOM, identify growth trends, and define target customers.

TARGET STARTUP:
- Name: {{startup_name}}
- URL: {{startup_url}}
- Sector: {{sector}} / {{subsector}}
- Problem: {{problem_general}}
- Solution: {{solution_what}}
- Product Type: {{product_type}}
- Active Locations: {{active_locations}}

---

### Website Evidence (verbatim text, trimmed)
{{website_text}}

---

### OUTPUT REQUIREMENTS
Return JSON ONLY with this schema:

{
  "market": {
    "tam": "Total Addressable Market - entire market demand for product category globally. Format: '$XXB' or '$XXM' or 'Unknown'. Include reasoning if estimated.",
    "sam": "Serviceable Addressable Market - portion of TAM within reach given business model and geography. Format: '$XXB' or '$XXM' or 'Unknown'",
    "som": "Serviceable Obtainable Market - realistic market share capturable in near term (3-5 years). Format: '$XXB' or '$XXM' or 'Unknown'",
    "market_size_summary": "2-4 sentences explaining the market opportunity, growth trajectory, and why this market is attractive. Include key statistics or projections if available.",
    "growth_trends": [
      "Key trend 1 driving market growth (e.g., 'Increasing regulatory compliance requirements')",
      "Key trend 2 (e.g., 'Cloud adoption growing at 25% CAGR')",
      "Key trend 3 (e.g., 'Shift from legacy systems to API-first architecture')"
    ],
    "target_customers": "2-3 sentences describing the ideal customer profile (ICP): company size, industry verticals, job titles, pain points, buying behavior. Be specific.",
    "sources": ["URLs or references used for market data, e.g., industry reports mentioned on site, press releases, market research citations"]
  }
}

### ANALYSIS GUIDELINES
- **TAM/SAM/SOM**: Use website claims if stated; otherwise make informed estimates based on:
  - Industry sector size and growth rates
  - Geographic reach (active_locations)
  - Product category (SaaS, marketplace, hardware, etc.)
  - Similar company benchmarks
- **Market Size Summary**: Focus on opportunity scale, growth rate, market maturity, and tailwinds
- **Growth Trends**: Identify 3-5 macro trends (technological, regulatory, behavioral, economic) that create demand
- **Target Customers**: Be specific about WHO buys this (not just "businesses" - what size? what industry? what role?)
- If website mentions specific market data, use it; otherwise use industry knowledge
- Mark estimates clearly; if truly unknown, state "Unknown" with brief reasoning

### ESTIMATION APPROACH
- For B2B SaaS: Consider # of potential customers × ARPU × penetration rate
- For marketplaces: Consider GMV potential × take rate
- For consumer: Consider TAM = total population × % addressable × spending per user
- Be conservative and realistic; avoid inflating numbers

### STYLE GUIDE
- Use specific figures with currency symbols ($XB, $XM)
- Cite sources when available from website or press releases
- Focus on growth drivers relevant to this specific sector/subsector
- Make ICP concrete: "Mid-market SaaS companies (100-1000 employees) in fintech and healthtech, targeting VP Engineering and IT Directors who struggle with compliance automation"
`

export interface MarketPromptParams {
  startup_name: string
  startup_url: string
  sector: string
  subsector: string
  problem_general: string
  solution_what: string
  product_type: string
  active_locations: string
  website_text: string
  extra_context_data?: string // Structured JSON string
}

export function formatMarketPrompt(params: MarketPromptParams): string {
  let extraContextSection = ''

  if (params.extra_context_data && params.extra_context_data !== '{}') {
    extraContextSection = `

---

### Additional Private Context (Market Data)

The user has provided market size estimates from pitch materials:

${params.extra_context_data}

**IMPORTANT - Use with Caution:**
- TAM/SAM/SOM from pitch decks are often **optimistic** and designed to impress investors
- These should be noted and considered, but apply independent judgment
- If the claimed market sizes seem inflated or unrealistic, note this in your market_size_summary
- Use extra context as ONE input, not the definitive answer
- Cross-reference with your knowledge of the sector and realistic market sizing

---
`
  }

  return MARKET_PROMPT.replace('{{startup_name}}', params.startup_name)
    .replace('{{startup_url}}', params.startup_url)
    .replace('{{sector}}', params.sector)
    .replace('{{subsector}}', params.subsector)
    .replace('{{problem_general}}', params.problem_general)
    .replace('{{solution_what}}', params.solution_what)
    .replace('{{product_type}}', params.product_type)
    .replace('{{active_locations}}', params.active_locations)
    .replace('{{website_text}}', params.website_text + extraContextSection)
}
