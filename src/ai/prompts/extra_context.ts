// Extra context extraction prompt - parses user-provided private information

export const EXTRA_CONTEXT_PROMPT = `### 🧠 Prompt: "Extract Structured Data from Extra Context"

**TASK**
You are an AI data extraction specialist. The user has provided additional context about a startup that may not be publicly available.
This context may come from pitch decks, private metrics, internal documents, or confidential communications.

Your job is to extract and structure this information into clear categories:
1. **Factual/Objective Data** - Financial metrics, dates, team size, funding details (generally trustworthy)
2. **Market Claims** - TAM/SAM/SOM estimates from pitch materials (use with caution, may be optimistic)
3. **Competition Claims** - What the company says about competitors (BIASED - often self-serving)

---

### USER-PROVIDED CONTEXT (Raw)
{{extra_context}}

---

### OUTPUT REQUIREMENTS
Return JSON ONLY with this schema. Extract ONLY what is explicitly stated. If something is not mentioned, omit the field entirely.

{
  "extra_context": {
    // FACTUAL/OBJECTIVE DATA (Generally Trustworthy)
    "founded_year": "Year or quarter founded, e.g., '2021', 'Q3 2020'. Only if stated.",
    "mrr": "Monthly Recurring Revenue, e.g., '$50K MRR'. Only if stated.",
    "arr": "Annual Recurring Revenue, e.g., '$600K ARR'. Only if stated.",
    "funding_stage": "e.g., 'Pre-seed', 'Seed', 'Series A', 'Bootstrapped'. Only if stated.",
    "funding_raised": "Total raised, e.g., '$2M', '€1.5M'. Only if stated.",
    "funding_investors": ["List of investors if named, e.g., 'Y Combinator', 'Sequoia'"],
    "burn_rate": "Monthly burn, e.g., '$50K/month'. Only if stated.",
    "runway": "Time until funds run out, e.g., '18 months'. Only if stated.",
    "valuation": "Company valuation, e.g., '$10M post-money'. Only if stated.",
    
    // MARKET DATA FROM PITCH MATERIALS (Use with Caution - May Be Optimistic)
    "tam_claimed": "Total Addressable Market claimed by company. Only if stated.",
    "sam_claimed": "Serviceable Addressable Market claimed. Only if stated.",
    "som_claimed": "Serviceable Obtainable Market claimed. Only if stated.",
    
    // TEAM DATA
    "team_size_claimed": "Team size if stated, e.g., '15 employees', '10 full-time'",
    "key_hires": ["Important recent hires mentioned, with roles and background"],
    
    // TRACTION METRICS FROM PRIVATE DATA
    "customer_count": "Number of customers, e.g., '50 paying customers'. Only if stated.",
    "user_count": "Number of users, e.g., '10K active users'. Only if stated.",
    "retention_rate": "User/customer retention, e.g., '90% monthly retention'. Only if stated.",
    "churn_rate": "Churn rate, e.g., '5% monthly churn'. Only if stated.",
    "ltv": "Customer Lifetime Value. Only if stated.",
    "cac": "Customer Acquisition Cost. Only if stated.",
    
    // COMPETITION CLAIMS (BIASED - Self-Reported, Treat with Extreme Skepticism)
    "competition_claims": [
      "What the company says about their competitors. Extract verbatim or paraphrased.",
      "Mark these clearly as claims. Examples:",
      "'Claims to be the only solution with feature X'",
      "'States competitors are too expensive/slow/complex'",
      "'Says they have no direct competitors in their niche'"
    ],
    "unique_advantages_claimed": [
      "What the company claims makes them unique/special. Extract as stated.",
      "These are self-serving claims - useful but should be verified independently."
    ],
    
    // OTHER
    "other_notes": [
      "Any other relevant information that doesn't fit above categories.",
      "Product launch dates, partnerships mentioned, press coverage, awards, etc."
    ],
    
    "sources": ["Where this data came from: 'Pitch deck', 'Internal metrics', 'Confidential memo', etc."]
  }
}

### EXTRACTION GUIDELINES

**Be Literal and Conservative:**
- Extract ONLY what is explicitly stated in the context
- Do NOT infer, calculate, or assume anything not directly mentioned
- If a field is not mentioned, OMIT it entirely from the JSON (don't use "Unknown")
- Preserve specific numbers, dates, and currency symbols as written
- Quote or paraphrase claims accurately

**Categorize by Trustworthiness:**
- **Factual data** (MRR, ARR, funding, founded year): Generally objective, can be relied upon
- **Market claims** (TAM/SAM/SOM from pitch deck): Often optimistic, use with caution
- **Competition claims**: BIASED - companies always make themselves look good vs competitors

**Competition Claims Specifically:**
- Mark ANY statement about competitors as potentially biased
- Include phrases like "Claims...", "States...", "According to pitch deck..."
- These should be noted but independently verified in the competition analysis phase

**Format Standards:**
- Currency: Use symbols and format as provided ($1M, €500K, £2M)
- Percentages: Include % symbol (90%, 5% MoM)
- Dates: Preserve format (2021, Q3 2020, March 2023)
- Arrays: Use for lists; if only one item, still use array format

**Edge Cases:**
- If context is empty or contains no relevant info, return: {"extra_context": {"sources": [], "other_notes": ["No additional context provided"]}}
- If context mentions "confidential" or "NDA", still extract but note in sources
- If conflicting data (e.g., two different MRR numbers), include both in other_notes with explanation

### EXAMPLES

**Input:** "We've raised $2M in seed funding from Acme Ventures and are currently at $50K MRR with 80 customers. We're the only platform in our space that offers real-time processing."

**Output:**
{
  "extra_context": {
    "funding_stage": "Seed",
    "funding_raised": "$2M",
    "funding_investors": ["Acme Ventures"],
    "mrr": "$50K MRR",
    "customer_count": "80 customers",
    "unique_advantages_claimed": ["Claims to be the only platform in their space offering real-time processing"],
    "sources": ["User-provided context"]
  }
}

Now extract the data.
`

export interface ExtraContextPromptParams {
  extra_context: string
}

export function formatExtraContextPrompt(params: ExtraContextPromptParams): string {
  return EXTRA_CONTEXT_PROMPT.replace(
    '{{extra_context}}',
    params.extra_context || 'No additional context provided.'
  )
}
