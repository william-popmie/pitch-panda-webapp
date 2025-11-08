// Traction and competitive advantage analysis prompt

export const TRACTION_PROMPT = `### 🧠 Prompt: "Startup Traction & Competitive Advantages"

**TASK**
You are an AI investment analyst. Analyze the startup's traction metrics and competitive advantages/defensibility.
Extract evidence of revenue, customers, growth, key milestones, funding details, intellectual property, partnerships, and other moats.

**🚨 CRITICAL: NO GUESSING OR ASSUMPTIONS 🚨**

**DO NOT guess or assume metric values. ONLY extract numeric or factual data that is EXPLICITLY LABELED in the text or image as a funding amount, MRR/ARR, or similar. If the label is not present, omit the value entirely.**

**EXPLICIT LABELING REQUIRED:**
- **MRR/ARR**: Must see "MRR", "Monthly Recurring Revenue", "ARR", "Annual Recurring Revenue", or "revenue" explicitly stated
- **Funding**: Must see "funding", "raised", "seed", "Series A", "investment", "round", "capital"
- **Revenue numbers without MRR/ARR label**: DO NOT classify as MRR/ARR - omit or use generic revenue field

**IF IT DOESN'T SAY IT, IT ISN'T IT.**

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
    // BASIC TRACTION METRICS
    "revenue": "DEPRECATED - use mrr/arr fields. Legacy: '$XM ARR', '$XM MRR', 'Pre-revenue', 'Revenue-generating (amount not disclosed)', 'Unknown'",
    "customers": "Customer metrics: 'X enterprise customers', 'X SMB customers', 'X users', 'X paying subscribers', 'Undisclosed', 'Unknown'. Include customer types if mentioned.",
    "growth_rate": "Overall growth: 'X% MoM', 'X% YoY', 'X% QoQ', 'Growing rapidly (specific % not disclosed)', 'Unknown'",
    "key_milestones": [
      "Major achievement 1 (e.g., 'Raised $XM Series A from [Investor]')",
      "Major achievement 2 (e.g., 'Launched in X new markets', 'Reached X users')",
      "Major achievement 3 (e.g., 'Featured in TechCrunch', 'Won X award')"
    ],

    // DETAILED REVENUE METRICS (Preferred over 'revenue' field)
    // ⚠️ ONLY populate if explicitly labeled as MRR/ARR
    "mrr": "ONLY if explicitly labeled 'MRR' or 'Monthly Recurring Revenue'. E.g., '$50K'. Omit if not explicitly labeled.",
    "mrr_label": "If mrr is populated, include the exact label. E.g., 'MRR', 'Monthly Recurring Revenue'",
    "mrr_is_explicit": true, // MUST be true if mrr field is populated
    
    "arr": "ONLY if explicitly labeled 'ARR' or 'Annual Recurring Revenue'. E.g., '$600K'. Omit if not explicitly labeled.",
    "arr_label": "If arr is populated, include the exact label. E.g., 'ARR', 'Annual Recurring Revenue'",
    "arr_is_explicit": true, // MUST be true if arr field is populated
    
    "revenue_growth_rate": "Revenue-specific growth rate if stated separately: 'X% MoM', 'X% YoY', or omit if not stated",

    // DETAILED FUNDING INFORMATION
    // ⚠️ ONLY populate if explicitly labeled as funding/raised/investment
    "funding_raised_total": "ONLY if explicitly labeled as 'funding', 'raised', 'total funding', etc. Omit if label missing.",
    "funding_raised_label": "If populated, include exact label. E.g., 'Total raised', 'Funding to date'",
    "funding_raised_is_explicit": true, // MUST be true if funding_raised_total is populated
    
    "funding_rounds": [
      {
        "type": "MUST be explicitly stated: 'pre-seed', 'seed', 'Series A', etc.",
        "amount": "E.g., '$1M'. Omit if not stated.",
        "status": "'completed', 'ongoing', or 'target' based on tense",
        "source": "'equity', 'non-dilutive', 'grant', 'debt', or 'other'",
        "date": "When completed/announced if stated",
        "is_explicit_label": true, // MUST be true
        "source_label": "The actual phrase. E.g., 'Seed funding', 'Series A round'",
        "is_inferred": false // Only true if inferred from section header
      }
    ],
    "non_dilutive_funding": "ONLY if explicitly labeled as non-dilutive/grant. E.g., '$500K'",
    "current_funding_round": "Description of current raise if stated. E.g., 'raising Seed round'",
    "target_funding_amount": "Amount seeking if stated. E.g., '$2M'",
    "loi_count": 5, // Integer count if stated
    "loi_value": "Total LOI value if stated. E.g., '$10M in LOIs'",

    // COMPETITIVE ADVANTAGES & DEFENSIBILITY
    "intellectual_property": [
      "Patents: 'X patents filed/granted in [domain]' or empty array if none",
      "Proprietary technology: 'Proprietary X algorithm/platform' or description",
      "Trade secrets: 'X years of proprietary data' or other non-public advantages"
    ],
    "partnerships": [
      "Strategic partnership/LOI 1 (e.g., 'LOI with [Company] for [purpose]')",
      "Channel partner 2 (e.g., 'Partnership with [BigCo] for distribution')",
      "Integration 3 (e.g., 'Official integration with [Platform]')"
    ],
    "regulatory_moats": [
      "License/certification 1 (e.g., 'FDA approved', 'SOC 2 Type II certified')",
      "Regulatory approval 2 (e.g., 'FCA regulated', 'GDPR compliant')",
      "Industry-specific compliance (e.g., 'HIPAA compliant', 'PCI DSS Level 1')"
    ],
    "network_effects": "Description of network effects if present: 'Marketplace with X-sided network effect', 'Platform benefits from user-generated content', 'Data network effects from X data points', or 'No significant network effects' or 'Unknown'",
    "defensibility_summary": "2-3 sentences summarizing the startup's overall competitive moats and defensibility. Consider: switching costs, brand, data advantages, technology barriers, scale advantages, regulatory barriers, network effects. Be realistic about strength of moats.",
    "sources": ["URLs where traction/advantage info was found"]
  }
}

### EXTRACTION GUIDELINES

**🚨 ZERO TOLERANCE FOR UNLABELED DATA 🚨**

**Revenue Metrics (MRR/ARR) - STRICT REQUIREMENTS:**
- **ONLY populate mrr if you see:** "MRR", "Monthly Recurring Revenue", or "monthly revenue" explicitly stated
  * Example ✅: "MRR: $50K", "Monthly recurring revenue of $50,000"
  * Example ❌: "$50K/month" (missing MRR label), "$50K monthly" (too vague)
- **ONLY populate arr if you see:** "ARR", "Annual Recurring Revenue", or "annual revenue" explicitly stated
  * Example ✅: "ARR: $600K", "Annual recurring revenue: €500K"
  * Example ❌: "$600K/year" (missing ARR label), "$600K annually" (too vague)
- **If you populate mrr or arr, you MUST:**
  1. Also populate mrr_label or arr_label with the exact phrase
  2. Set mrr_is_explicit or arr_is_explicit to true
- **If revenue is mentioned but not explicitly labeled as MRR/ARR:**
  * Use the legacy "revenue" field with description
  * DO NOT populate mrr or arr fields

**Funding Metrics - STRICT REQUIREMENTS:**
- **ONLY populate funding fields if you see explicit keywords:**
  * "funding", "raised", "seed", "pre-seed", "Series A/B/C", "investment", "round", "capital", "financing", "backed by [investor] with $X"
- **Examples:**
  * ✅ "Raised $2M in seed funding" → Can classify
  * ✅ "Series A: $5M" → Can classify
  * ✅ "Secured $3M investment" → Can classify
  * ❌ "$2M in 2023" → Cannot classify (no funding keyword)
  * ❌ "Backed by YC" → Note investor, but no funding amount
  * ❌ "$5M milestone" → Too vague, not explicitly funding

**Funding Round Distinctions (CRITICAL):**
- **Past/Completed:** "raised", "closed", "completed", "secured" → status="completed"
  * Include in funding_raised_total
- **Current Round:** "raising", "currently", "in process of" → status="ongoing"
  * Populate current_funding_round field
  * Do NOT include in funding_raised_total
- **Target/Future:** "seeking", "aiming to raise", "target" → status="target"
  * Populate target_funding_amount
  * Do NOT include in funding_raised_total

**LOIs vs Actual Funding:**
- LOIs are NOT completed funding - they're soft commitments
- Track LOIs separately in loi_count and loi_value fields
- DO NOT add LOI amounts to funding_raised_total

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
- If website doesn't mention something, omit the field or use [] for arrays
- Don't speculate on IP/partnerships/funding without evidence
- Be honest about defensibility - early-stage startups often have limited moats

**Before Including ANY Metric:**
1. ✅ Is there an explicit label with required keywords?
2. ✅ Have I populated the _label field?
3. ✅ Have I set _is_explicit to true?
4. ✅ If inferred from context, is is_inferred=true?

If NO to any → Omit the field entirely.

### STYLE GUIDE
- Use specific metrics with proper formatting ($XM, X%, X customers)
- For funding: clearly distinguish past/completed vs ongoing vs target
- For milestones: focus on impressive, verifiable achievements
- For defensibility: be balanced - acknowledge both strengths AND typical startup vulnerabilities
- Avoid marketing hype; translate into concrete competitive advantages
- If information is thin, acknowledge it rather than fabricating
- **PREFER PRECISION OVER RECALL**: Missing a number is better than mislabeling one

### IMPORTANT NOTES
- **Extra context data**: If provided, it may contain self-reported MRR/ARR and funding details
- These numbers are founder-reported but should be treated as accurate when explicitly labeled
- Extra context extraction already enforced semantic labeling rules
- Apply the same distinctions: completed funding vs current round vs target
- Be skeptical of competition claims but trust explicit metrics with labels
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

### Additional Private Context (Traction, Funding & Metrics)

The user has provided confidential traction data and competitive advantage claims:

${params.extra_context_data}

**How to Use This Data:**

**FACTUAL METRICS (Treat as Accurate - Founder-Reported but Explicit):**
- **MRR, ARR**: If stated in extra context, populate the mrr/arr fields directly
  * These are explicit, trustworthy numbers when clearly labeled
  * Remember: extra context has already filtered for semantic labeling (only labeled revenue numbers are included)
- **Customer counts, user counts, retention, churn, LTV, CAC**: Treat as accurate self-reported metrics
- **Funding amounts, investors, burn rate, runway**: Incorporate directly
  * Pay attention to funding_rounds array - it distinguishes completed vs ongoing vs target
  * Use funding_raised_total for COMPLETED funding only
  * Use current_funding_round and target_funding_amount for what they're currently raising
  * Use non_dilutive_funding field for grants/non-dilutive amounts
  * LOIs: Track separately in loi_count/loi_value - NOT completed funding

**FUNDING ROUND DISTINCTIONS (CRITICAL):**
- If extra context has funding_rounds array, map it carefully:
  * status="completed" → include in funding_raised_total and funding_rounds array
  * status="ongoing" → populate current_funding_round field
  * status="target" → populate target_funding_amount field
- Equity vs non-dilutive funding:
  * source="equity" → typical VC/angel funding
  * source="grant" or source="non-dilutive" → add to non_dilutive_funding field
- DO NOT conflate past funding with current/target funding

**IP & PARTNERSHIPS (Generally Factual):**
- Patents, partnerships, LOIs mentioned in extra context: incorporate into relevant arrays
- LOIs specifically: if loi_count or loi_value is in extra context, use those fields
- Use these in your defensibility analysis

**COMPETITIVE ADVANTAGE CLAIMS (Be Skeptical):**
- "Unique advantages" and "no competitors" claims: These are BIASED
- Note them, but independently assess the actual defensibility
- In defensibility_summary, provide balanced assessment
- Don't inflate defensibility based solely on self-reported uniqueness

**Your Analysis Should:**
- Use factual metrics (MRR, ARR, funding, LOIs) to paint an accurate traction picture
- Properly distinguish between completed funding, current raise, and target amounts
- Acknowledge claimed advantages but provide balanced assessment of actual moats
- In defensibility_summary, be realistic about actual competitive advantages vs. marketing claims

**Remember:**
- Extra context is pitchdeck/founder materials - factual data is trustworthy
- Competition claims are biased - use them as data points but remain objective
- Funding/revenue numbers in extra context are already semantically labeled (extraction phase filtered for this)
- Incorporate structured data (funding_rounds, team_members, loi details) into your output schema

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
