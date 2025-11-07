// Problem and Solution extraction prompt

export const PROBLEM_SOLUTION_PROMPT = `### 🧠 Prompt: "Startup Problem & Solution Extraction"

**TASK**
You are an AI analyst. For the given startup name and website, identify and clearly describe:
1) The problem the startup is solving
2) The solution it provides
3) The product type (website, SaaS, platform, app, service, hardware, marketplace, API, etc.)
4) The sector (broad) and subsector (specific)
5) **Active locations** (countries/regions/cities where the company currently operates or has offices)

Startup:
- Name: {{startup_name}}
- URL: {{startup_url}}

Use the website content below as primary evidence. If claims are unclear, infer cautiously and be explicit.

---

### Website Evidence (verbatim text, trimmed)
{{website_text}}

---

{{extra_context_section}}

---

### OUTPUT REQUIREMENTS
Return JSON ONLY with this schema:

{
  "problem": {
    "general": "1–3 sentences explaining who is affected and why it matters.",
    "example": "A concrete, everyday scenario showing the pain clearly."
  },
  "solution": {
    "what_it_is": "One short phrase naming the product (e.g., 'SaaS platform', 'mobile app', 'API')",
    "how_it_works": "2–4 sentences describing the core mechanism and why it solves the problem.",
    "example": "A concrete, everyday usage example with the outcome."
  },
  "product_type": "SaaS | App | Website | Service | Hardware | Marketplace | API | Platform | Other",
  "sector": "Broad industry (e.g., Fintech, Healthcare, Energy, Education, RetailTech, Logistics, Cybersecurity, etc.)",
  "subsector": "Specific niche (e.g., Payments, Telemedicine, Battery Tech, Inventory Optimization, Last-mile Delivery, Identity, etc.)",
  "active_locations": ["Array of distinct places where the company is active (e.g., 'Belgium', 'Benelux', 'London, UK', 'North America'). Use evidence; if unknown, return []."],
  "sources": ["List of source URLs used or inferred from (include homepage by default)"]
}

### STYLE GUIDE
- Be precise and concrete; interpret marketing fluff into clear business/user terms.
- Prefer specific mechanisms over generic buzzwords.
- For **active_locations**, extract from the site (e.g., footer offices, 'Careers/Locations', 'Where we operate', 'Serving X markets'). Include countries/regions/cities; deduplicate. If unclear, return [].
- If information is missing, say "Unknown" for strings; use [] for arrays.

{{extra_context_instructions}}

### EXAMPLES (style and depth)

Problem example:
"Millions of small retailers struggle to forecast demand, causing stockouts and excess inventory."
Concrete example:
"A local boutique frequently runs out of best-selling sizes before weekends, losing sales and frustrating repeat customers."

Solution example:
"Provide a cloud inventory SaaS that ingests POS data and auto-reorders based on AI forecasts."
Concrete example:
"On Thursday nights, it places supplier orders for items predicted to sell out by Saturday, keeping shelves full and increasing weekend revenue."

Active locations example:
["Belgium", "Netherlands", "Germany (DACH)", "London, UK"]

Now produce the JSON.
`

export interface ProblemSolutionPromptParams {
  startup_name: string
  startup_url: string
  website_text: string
  extra_context_data?: string // Structured JSON string of ExtraContextData
}

export function formatProblemSolutionPrompt(params: ProblemSolutionPromptParams): string {
  let extraContextSection = ''
  let extraContextInstructions = ''

  if (params.extra_context_data && params.extra_context_data !== '{}') {
    extraContextSection = `### Additional Private Context (Structured Data Extracted)

The user has provided additional confidential information about this startup. This data has been extracted and structured:

${params.extra_context_data}

**How to Use This Data:**
- **Factual metrics** (MRR, ARR, funding, team size, founded year): Treat as accurate and incorporate into your analysis
- **Market size claims** (TAM/SAM/SOM): Note these but apply independent judgment - pitch decks often present optimistic projections
- **Competition claims**: DO NOT accept at face value. These are self-reported and biased. Note them but maintain objectivity in your analysis
- Use this context to enrich your understanding of the problem/solution, but prioritize website evidence for the core problem definition`

    extraContextInstructions = `
### IMPORTANT: Handling Private Context Data
- When extra context provides factual data (revenue, team size, funding), incorporate it naturally
- When extra context makes claims about competitors or uniqueness, remain skeptical and independent
- Do NOT let competition claims from pitch decks bias your core problem/solution definition
- The problem should be defined from the user's perspective, not colored by how the company positions against competitors`
  }

  return PROBLEM_SOLUTION_PROMPT.replace('{{startup_name}}', params.startup_name)
    .replace('{{startup_url}}', params.startup_url)
    .replace('{{website_text}}', params.website_text)
    .replace('{{extra_context_section}}', extraContextSection)
    .replace('{{extra_context_instructions}}', extraContextInstructions)
}
