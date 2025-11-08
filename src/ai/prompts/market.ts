// Market analysis prompt

export const MARKET_PROMPT = `### 🧠 Prompt: "Startup Market Analysis"

**TASK**
You are an AI market analyst. Analyze the market opportunity for this startup based on the validated profile
and available website/public information. Estimate TAM/SAM/SOM, identify growth trends, and define target customers.

**🚨 CRITICAL: EXPLICIT LABELING ENFORCEMENT 🚨**
- **NEVER assume a number represents TAM/SAM/SOM without seeing those exact labels**
- Industry spend ≠ TAM
- Market size ≠ TAM (unless explicitly labeled as TAM)
- Total spend ≠ Addressable market
- If it doesn't say "TAM", "Total Addressable Market", "SAM", or "SOM", **DO NOT classify it as such**

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
    "tam": "Total Addressable Market - entire market demand for product category globally. Format: '$XXB' or '$XXM' or 'Unknown'. Include reasoning if estimated. ⚠️ ONLY populate if explicitly labeled as TAM/Total Addressable Market.",
    "tam_label": "The exact phrase used to label this as TAM. E.g., 'TAM: $50B', 'Total Addressable Market'. Required if tam is populated.",
    "tam_is_explicit": "Boolean: true if explicitly labeled as TAM, false if estimated/inferred. Required if tam is populated.",
    
    "sam": "Serviceable Addressable Market - portion of TAM within reach given business model and geography. Format: '$XXB' or '$XXM' or 'Unknown'. ⚠️ ONLY populate if explicitly labeled as SAM.",
    "sam_label": "The exact phrase used to label this as SAM. Required if sam is populated.",
    "sam_is_explicit": "Boolean: true if explicitly labeled, false if estimated. Required if sam is populated.",
    
    "som": "Serviceable Obtainable Market - realistic market share capturable in near term (3-5 years). Format: '$XXB' or '$XXM' or 'Unknown'. ⚠️ ONLY populate if explicitly labeled as SOM.",
    "som_label": "The exact phrase used to label this as SOM. Required if som is populated.",
    "som_is_explicit": "Boolean: true if explicitly labeled, false if estimated. Required if som is populated.",
    
    "market_size_summary": "2-4 sentences explaining the market opportunity, growth trajectory, and why this market is attractive. Include key statistics or projections if available.",
    "growth_trends": [
      "Key trend 1 driving market growth (e.g., 'Increasing regulatory compliance requirements')",
      "Key trend 2 (e.g., 'Cloud adoption growing at 25% CAGR')",
      "Key trend 3 (e.g., 'Shift from legacy systems to API-first architecture')"
    ],
    "target_customers": "2-3 sentences describing the ideal customer profile (ICP): company size, industry verticals, job titles, pain points, buying behavior. Be specific.",
    
    // OPTIONAL: Industry investment vs actual TAM - FOR UNLABELED MARKET DATA
    "industry_investment_size": "Optional: Money invested/spent in the broader industry. E.g., '$50B invested annually in enterprise logistics'. Different from TAM - this is total industry spend, not necessarily addressable by this startup.",
    "industry_investment_label": "The exact phrase describing this spend. E.g., '$50B invested annually', 'Industry size: $100B'.",
    
    "spend_in_category": "Optional: Money spent in this specific category/problem area. E.g., '$100B spent on legacy inventory systems annually'. Context for TAM but not equivalent to TAM.",
    "spend_in_category_label": "The exact phrase describing this spend.",
    
    "market_notes": "Optional: Free-form notes about market sizing. E.g., 'Pitch deck shows $50B with header "Market Opportunity" but doesn't explicitly label it as TAM - appears to be total industry spend. Put in industry_investment_size instead.'",
    "is_claimed_TAM": "Optional boolean: true if TAM is explicitly presented as TAM in materials, false if it's actually industry spend/investment mislabeled as TAM. Omit if not applicable.",
    
    "sources": ["URLs or references used for market data, e.g., industry reports mentioned on site, press releases, market research citations"]
  }
}

### ANALYSIS GUIDELINES

**🚨 EXPLICIT LABELING REQUIREMENTS 🚨**

**TAM/SAM/SOM - ZERO TOLERANCE FOR ASSUMPTIONS:**

**Required Keywords for TAM:**
- Must see: "TAM", "Total Addressable Market", "total addressable market", or "$XB addressable market"
- Example ✅: "TAM: $50B", "Total Addressable Market of $30B", "$50 billion addressable market opportunity"
- Example ❌: "$50B market", "$30B market size", "$50B market opportunity" (missing "TAM" or "addressable")

**Required Keywords for SAM:**
- Must see: "SAM", "Serviceable Addressable Market", "serviceable addressable market"
- Example ✅: "SAM: $10B", "Serviceable Addressable Market: $8B"
- Example ❌: "$10B serviceable market" (missing "SAM" or full phrase)

**Required Keywords for SOM:**
- Must see: "SOM", "Serviceable Obtainable Market", "serviceable obtainable market"
- Example ✅: "SOM: $2B", "Serviceable Obtainable Market of $1.5B"
- Example ❌: "$2B obtainable" (missing "SOM" or full phrase)

**If TAM/SAM/SOM is populated, YOU MUST:**
1. Also populate the corresponding _label field with the exact phrase
2. Set the corresponding _is_explicit field to true
3. If you estimated it yourself (no explicit label), set _is_explicit to false

**Industry Spend vs TAM - CRITICAL DISTINCTION:**

**NOT TAM - Use industry_investment_size instead:**
- "$XB invested annually in [industry]"
- "$XB industry size"
- "$XB spent on [category] globally"
- "$XB market" (without "addressable")
- "$XB market size" (without "addressable")
- "$XB market opportunity" (without "addressable")

**Examples of Industry Spend (NOT TAM):**
- ❌ "$100B cybersecurity market" → industry_investment_size
- ❌ "$50B spent on logistics annually" → spend_in_category
- ❌ "Market size: $30B" → industry_investment_size
- ✅ "TAM: $30B" → tam field (explicitly labeled)

**If you encounter unlabeled market data:**
1. Put it in industry_investment_size or spend_in_category
2. Populate the corresponding _label field with exact phrase
3. Use market_notes to explain: "This is industry spend, not explicitly labeled as TAM"
4. Set is_claimed_TAM to false if it was presented as if it were TAM
5. Provide your own realistic TAM estimate if possible (mark _is_explicit as false)

**TAM/SAM/SOM Estimation:**
- Use website claims if stated and reasonable
- Make informed estimates based on:
  * Industry sector size and growth rates
  * Geographic reach (active_locations)
  * Product category (SaaS, marketplace, hardware, etc.)
  * Similar company benchmarks
- Be conservative and realistic; avoid inflating numbers
- If you estimate TAM yourself (no explicit label), set tam_is_explicit to false
- Mark estimates clearly; if truly unknown, state "Unknown" with brief reasoning

**Market Size Summary:**
- Focus on opportunity scale, growth rate, market maturity, and tailwinds
- If using pitchdeck data, note that it's founder-reported and may be optimistic
- Provide balanced assessment - acknowledge both opportunity AND realistic constraints
- Call out when claimed TAM is actually industry spend

**Growth Trends:**
- Identify 3-5 macro trends (technological, regulatory, behavioral, economic) that create demand
- Connect trends specifically to why THIS solution would benefit

**Target Customers:**
- Be specific about WHO buys this (not just "businesses")
- What size company? What industry? What role/title makes buying decisions?
- Example: "Mid-market SaaS companies (100-1000 employees) in fintech and healthtech, targeting VP Engineering and IT Directors who struggle with compliance automation"

### ESTIMATION APPROACH
- For B2B SaaS: Consider # of potential customers × ARPU × penetration rate
- For marketplaces: Consider GMV potential × take rate
- For consumer: Consider TAM = total population × % addressable × spending per user
- Be conservative and realistic; avoid inflating numbers

### STYLE GUIDE
- Use specific figures with currency symbols ($XB, $XM)
- Cite sources when available from website or press releases
- Focus on growth drivers relevant to this specific sector/subsector
- Make ICP concrete and specific
- When using extra context, note that it's self-reported and apply independent judgment
- **PREFER PRECISION OVER RECALL**: Better to omit TAM than to mislabel industry spend as TAM

**Before Including TAM/SAM/SOM:**
1. ✅ Did I see the explicit keyword (TAM/SAM/SOM or full phrase)?
2. ✅ Have I populated the _label field?
3. ✅ Have I set _is_explicit correctly?
4. ✅ If estimated (not explicitly labeled), is _is_explicit=false?

If NO to any → Consider using industry_investment_size or omitting the field entirely.
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

**IMPORTANT - Use with Critical Judgment:**

**Founder-Reported Market Data:**
- TAM/SAM/SOM from pitch decks are often **optimistic** and designed to impress investors
- These should be noted and considered, but apply independent judgment
- If the claimed market sizes seem inflated or unrealistic, note this in market_size_summary

**Industry Investment vs TAM (CRITICAL DISTINCTION):**
- Extra context may include fields like:
  * industry_investment_size: "$50B invested annually in [industry]"
  * spend_in_category: "$100B spent on X annually"
- **These are NOT the same as TAM** - they represent total industry spend/investment
- If pitchdeck labels industry spend as "TAM", this is misleading:
  * Put the spend figure in industry_investment_size or spend_in_category fields
  * Use market_notes to clarify: "Pitch deck presents $XB industry spend as TAM, but realistic TAM for this specific solution is likely $YB"
  * Set is_claimed_TAM to false
  * Provide your own more realistic TAM estimate

**How to Handle Extra Context Market Data:**
- tam_claimed, sam_claimed, som_claimed: Use as ONE data point, not definitive truth
- If these align with your independent analysis, incorporate them
- If they seem inflated (common in pitchdecks), note them but provide your own realistic estimates
- In market_size_summary, you can say: "Founders claim $XB TAM, but independent analysis suggests $YB is more realistic given [reasons]"

**Your Responsibility:**
- Don't just copy numbers from pitchdeck - evaluate them critically
- Cross-reference with industry knowledge and similar startups
- Be honest about market sizing uncertainty
- Flag when pitchdeck numbers seem unrealistic
- Use extra context as ONE input, not the definitive answer

**Remember:**
- Founders have incentive to maximize market size estimates
- Industry spend ≠ Total Addressable Market
- Geographic constraints, business model, and competition all reduce TAM from theoretical maximum
- Conservative, realistic estimates are more valuable than inflated ones

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
