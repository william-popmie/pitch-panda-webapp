// Extra context extraction prompt - parses user-provided private information

export const EXTRA_CONTEXT_PROMPT = `### 🧠 Prompt: "Extract Structured Data from Extra Context"

**TASK**
You are an AI data extraction specialist. The user has provided additional context about a startup that may not be publicly available.
This context may come from pitch decks, private metrics, internal documents, or confidential communications.

Your job is to extract and structure this information into clear categories:
1. **Factual/Objective Data** - Financial metrics, dates, team size, funding details (generally trustworthy)
2. **Market Claims** - TAM/SAM/SOM estimates from pitch materials (use with caution, may be optimistic)
3. **Competition Claims** - What the company says about competitors (BIASED - often self-serving)

**🚨 CRITICAL: EXPLICIT LABELING ENFORCEMENT 🚨**

**DO NOT GUESS OR ASSUME METRIC VALUES.**

A number or figure should **ONLY** be classified as a specific metric if it is **EXPLICITLY LABELED** in the source material.

**Required keywords for classification:**

- **FUNDING / RAISED / INVESTMENT:**
  * Must see: "funding", "raised", "seed", "pre-seed", "Series A", "Series B", "Series C", "investment", "round", "capital", "backed by [investor]"
  * Example (GOOD): "Seed funding: $2M" ✅
  * Example (BAD): "$2M" with no label ❌

- **MRR / ARR / REVENUE:**
  * Must see: "MRR", "ARR", "Monthly Recurring Revenue", "Annual Recurring Revenue", "revenue", "turnover", "income", "monthly revenue", "annual revenue"
  * Example (GOOD): "MRR: $50K" or "Monthly recurring revenue of $50K" ✅
  * Example (BAD): "$50K/month" without MRR/revenue label ❌

- **TAM / SAM / SOM / MARKET SIZE:**
  * Must see: "TAM", "Total Addressable Market", "SAM", "Serviceable Addressable Market", "SOM", "Serviceable Obtainable Market", "market size", "market opportunity", "addressable market"
  * Example (GOOD): "TAM: $5B" or "Total addressable market of $5 billion" ✅
  * Example (BAD): "$5B market" without TAM/market size label ❌

- **INDUSTRY SPEND / INVESTMENT:**
  * Must see: "invested in", "spent in", "annual spend", "industry investment", "X billion invested annually in [category]"
  * Example (GOOD): "$50B invested annually in enterprise logistics" ✅
  * Example (BAD): "$50B logistics" without spend/investment label ❌

**WHAT TO DO IF LABEL IS MISSING OR AMBIGUOUS:**

1. **DO NOT classify it as funding, MRR, ARR, TAM, etc.**
2. **Store it in unclassified_values array** with:
   - The value/number itself
   - Surrounding context
   - Why it couldn't be classified
   - Optional possible meaning (but mark as uncertain)

**FORBIDDEN ASSUMPTIONS:**

❌ Do NOT infer meaning from:
- Position in the document
- Table row/column order
- Font size or styling
- Proximity to section headers (unless header contains explicit label)
- Presence of investor logos (logos ≠ funding amount)

❌ "Backed by [Investor]" without a number does NOT imply a funding amount
❌ A number near "Our Market" is NOT automatically TAM unless explicitly labeled
❌ A table with numbers is NOT automatically funding rounds unless columns are labeled

**EXPLICIT LABELING EXAMPLES:**

✅ **GOOD - Explicitly labeled:**
- "Seed funding: $2M" → funding_rounds with is_explicit_label=true, source_label="Seed funding"
- "MRR in k€: 45" → mrr="€45K", mrr_label="MRR in k€", mrr_is_explicit=true
- "TAM: $5B" → tam_claimed="$5B", tam_label="TAM", tam_is_explicit=true
- "Total raised to date: €3.5M" → funding_raised_total="€3.5M", funding_raised_label="Total raised to date", funding_raised_is_explicit=true

❌ **BAD - Not explicitly labeled:**
- "$2M" alone → unclassified_values (no label)
- Table: "Q1 2023 | $1M" → unclassified_values (table position doesn't count)
- "We have significant traction" → too vague, omit
- "Backed by YC" → note investors, but no funding amount implied

**CONTEXTUAL ASSOCIATION (Use with Extreme Caution):**

If a number appears near a section header like "Market Opportunity" or "Funding History":
- You MAY associate it contextually ONLY if the header contains explicit keywords
- Mark it as is_inferred=true
- Store the source_label as the header text
- Prefer omission over incorrect classification

Example:
- Header: "Our Funding" | Text: "$2M in 2023"
  - Can classify as funding with is_inferred=true, source_label="Our Funding" (header contains "Funding")
- Header: "Progress" | Text: "$2M"
  - Cannot classify - too ambiguous, store in unclassified_values

---

### USER-PROVIDED CONTEXT (Raw)
{{extra_context}}

---

### OUTPUT REQUIREMENTS
Return JSON ONLY with this schema. Extract ONLY what is explicitly stated. If something is not mentioned, omit the field entirely.

{
  "extra_context": {
    // FACTUAL/OBJECTIVE DATA (Generally Trustworthy - IF EXPLICITLY LABELED)
    "founded_year": "Year or quarter founded, e.g., '2021', 'Q3 2020'. Only if stated.",
    
    // MRR - ONLY if explicitly labeled with "MRR" or "Monthly Recurring Revenue"
    "mrr": "Monthly Recurring Revenue. E.g., '$50K', '$50,000'. ONLY if explicitly labeled as MRR.",
    "mrr_label": "The exact label found in source. E.g., 'MRR', 'Monthly Recurring Revenue', 'MRR k€/month'",
    "mrr_is_explicit": true, // MUST be true if MRR field is populated
    
    // ARR - ONLY if explicitly labeled with "ARR" or "Annual Recurring Revenue"
    "arr": "Annual Recurring Revenue. E.g., '$600K', '$600,000'. ONLY if explicitly labeled as ARR.",
    "arr_label": "The exact label found in source. E.g., 'ARR', 'Annual Recurring Revenue'",
    "arr_is_explicit": true, // MUST be true if ARR field is populated
    
    // DETAILED FUNDING INFORMATION - ONLY with explicit funding/investment keywords
    "funding_raised_total": "Total raised to date. ONLY if explicitly labeled as 'funding', 'raised', 'total raised', etc.",
    "funding_raised_label": "The exact label. E.g., 'Total raised', 'Funding to date', 'Total funding'",
    "funding_raised_is_explicit": true, // MUST be true if funding_raised_total is populated
    
    "funding_rounds": [
      {
        "type": "e.g., 'pre-seed', 'seed', 'Series A', 'grant'. MUST be explicitly stated.",
        "amount": "E.g., '$1M', '€500K'. Apply scale if indicated in labels.",
        "status": "'completed', 'ongoing', or 'target' based on tense",
        "source": "'equity', 'non-dilutive', 'grant', 'debt'",
        "date": "When completed/announced if stated",
        "investors": ["Investor names for this specific round"],
        "is_explicit_label": true, // MUST be true - only include rounds with explicit funding labels
        "source_label": "The actual phrase that defined it. E.g., 'Seed funding', 'Series A round'",
        "is_inferred": false // Only true if inferred from section header (use sparingly)
      }
    ],
    "non_dilutive_funding": "Total non-dilutive. ONLY if explicitly labeled as grant/non-dilutive.",
    "current_funding_round": "Description of current raise. E.g., 'raising Seed'",
    "target_funding_amount": "Amount seeking. E.g., '$2M target'",
    "funding_investors": ["All investors mentioned"],
    
    "burn_rate": "Monthly burn. E.g., '$50K/month'",
    "runway": "Time until funds run out. E.g., '18 months'",
    "valuation": "Company valuation. E.g., '$10M post-money'",

    // MARKET DATA - ONLY with explicit TAM/SAM/SOM or market size keywords
    "tam_claimed": "TAM claimed. ONLY if explicitly labeled as 'TAM' or 'Total Addressable Market'.",
    "tam_label": "The exact label. E.g., 'TAM', 'Total Addressable Market'",
    "tam_is_explicit": true, // MUST be true if tam_claimed is populated
    
    "sam_claimed": "SAM claimed. ONLY if explicitly labeled as 'SAM' or 'Serviceable Addressable Market'.",
    "sam_label": "The exact label. E.g., 'SAM'",
    "sam_is_explicit": true, // MUST be true if sam_claimed is populated
    
    "som_claimed": "SOM claimed. ONLY if explicitly labeled as 'SOM' or 'Serviceable Obtainable Market'.",
    "som_label": "The exact label. E.g., 'SOM'",
    "som_is_explicit": true, // MUST be true if som_claimed is populated
    
    "industry_investment_size": "Industry spend. ONLY if labeled 'invested in', 'spent in', 'annual spend', etc.",
    "industry_investment_label": "The exact phrase. E.g., 'invested annually in', '$50B spent on'",
    "industry_investment_is_explicit": true, // MUST be true if industry_investment_size is populated
    
    "spend_in_category": "Money spent in category. Different from TAM.",
    
    // TEAM DATA
    "team_size_claimed": "Team size if stated. E.g., '15 employees'",
    "team_members": [
      {
        "name": "Full name",
        "role": "Title/position. E.g., 'CEO', 'CTO'",
        "past_experience": "Brief background. E.g., 'ex-Google, 15 years in SaaS'"
      }
    ],
    "key_hires": ["Important recent hires"],
    
    // TRACTION METRICS
    "customer_count": "Number of customers. E.g., '50 paying customers'",
    "user_count": "Number of users. E.g., '10K active users'",
    "retention_rate": "Retention metric. E.g., '90% monthly retention'",
    "churn_rate": "Churn metric. E.g., '5% monthly churn'",
    "ltv": "Customer Lifetime Value. E.g., '$5,000 LTV'",
    "cac": "Customer Acquisition Cost. E.g., '$500 CAC'",
    "loi_count": 5, // Integer count of LOIs
    "loi_value": "Total LOI value. E.g., '$10M in LOIs'",
    
    // COMPETITION CLAIMS (BIASED)
    "competition_claims": [
      "Prefix with 'Claims...', 'States...', etc.",
      "E.g., 'Claims to be the only solution with feature X'"
    ],
    "unique_advantages_claimed": [
      "Self-serving claims.",
      "E.g., 'Claims proprietary AI algorithm 5x faster'"
    ],
    
    // UNCLASSIFIED VALUES - Numbers without explicit labels
    "unclassified_values": [
      {
        "value": "The numeric or textual value found. E.g., '$10M', '5000', '25%'",
        "context": "Surrounding text. E.g., 'Page 5: Our Progress section shows $10M next to a growth chart'",
        "possible_meaning": "Optional guess. E.g., 'Possibly revenue or market size, but unclear'",
        "reason_unclassified": "Why not classified. E.g., 'No explicit label - appears in unlabeled table cell'"
      }
    ],
    
    // OTHER
    "other_notes": [
      "Any other relevant information.",
      "Product launch dates, awards, press mentions, etc."
    ],
    
    "sources": ["Where data came from. E.g., 'Pitch deck page 5', 'Internal metrics dashboard'"]
  }
}

**🚨 MANDATORY RULES FOR OUTPUT:**

1. **ONLY populate MRR if mrr_label contains "MRR" or "Monthly Recurring Revenue"**
   - If you populate mrr, you MUST also populate mrr_label and set mrr_is_explicit=true

2. **ONLY populate ARR if arr_label contains "ARR" or "Annual Recurring Revenue"**
   - If you populate arr, you MUST also populate arr_label and set arr_is_explicit=true

3. **ONLY populate funding fields if source contains funding/investment keywords**
   - funding_raised_total requires explicit "funding", "raised", "investment", etc.
   - funding_rounds MUST have is_explicit_label=true and source_label populated

4. **ONLY populate TAM/SAM/SOM if explicitly labeled as such**
   - If you populate tam_claimed, you MUST populate tam_label and set tam_is_explicit=true
   - Same for sam_claimed and som_claimed

5. **If a number lacks explicit labels, put it in unclassified_values**
   - Do NOT try to classify it as funding, revenue, or market size
   - Provide context and explain why it couldn't be classified

6. **Prefer precision over recall**
   - Missing a number is better than mislabeling one
   - When in doubt, use unclassified_values

### EXTRACTION GUIDELINES

**🚨 ZERO TOLERANCE FOR UNLABELED DATA 🚨**

**Be Literal and Conservative:**
- Extract ONLY what is explicitly stated with clear labels
- Do NOT infer, calculate, or assume anything not directly mentioned
- If a field is not mentioned, OMIT it entirely from the JSON (don't use "Unknown")
- Preserve specific numbers, dates, and currency symbols as written
- Quote or paraphrase claims accurately

**Numeric Scale Handling (Apply ONLY After Verifying Explicit Labels):**
- FIRST: Verify the number has an explicit semantic label (e.g., "MRR", "funding", "TAM")
- THEN: Check for unit labels in table headers, column names, axis labels, captions
- Common scale patterns: "(in millions)", "(M)", "(in 000s)", "(k)", "(in thousands)"
- Apply scale to numbers ONLY if they have both semantic label AND scale indicator
- Example: "MRR (in k€): 45" → mrr="€45K", mrr_label="MRR (in k€)", mrr_is_explicit=true ✅
- Example: "45" in a table column labeled "(in k€)" with no semantic label → unclassified_values ❌

**Semantic Labeling Enforcement (MANDATORY):**

**For FUNDING/RAISED/INVESTMENT:**
- **Required keywords (MUST be present):** "funding", "raised", "seed", "pre-seed", "Series A/B/C", "investment", "round", "capital", "backed by [investor name]", "financing", "secured"
- **NOT sufficient:** Just a number, investor logo, "backed by" without amount, position in document
- **Example ✅:** "Raised $2M in seed funding" → funding, "Seed funding: $2M", "Series A: €5M"
- **Example ❌:** "$2M" alone, "Q1 2023: $2M" (no funding keyword), "Backed by YC" (no amount)

**For MRR/ARR/REVENUE:**
- **Required keywords (MUST be present):** "MRR", "ARR", "Monthly Recurring Revenue", "Annual Recurring Revenue", "revenue", "turnover", "income", "monthly revenue", "annual revenue", "recurring"
- **NOT sufficient:** "$X/month" alone, "$X per year" alone, unlabeled growth chart
- **Example ✅:** "MRR: $50K", "Monthly recurring revenue of $50,000", "ARR: €600K"
- **Example ❌:** "$50K/month" (missing MRR/revenue keyword), "$50K monthly" (too vague)

**For TAM/SAM/SOM/MARKET SIZE:**
- **Required keywords (MUST be present):** "TAM", "Total Addressable Market", "SAM", "Serviceable Addressable Market", "SOM", "Serviceable Obtainable Market", "market size", "market opportunity", "addressable market"
- **NOT sufficient:** "market", "opportunity", "$XB sector", unlabeled number near "Our Market" header
- **Example ✅:** "TAM: $5B", "Total addressable market of $5 billion", "Market size: $10B"
- **Example ❌:** "$5B market" (missing TAM/size keyword), "$5B opportunity" (too vague)

**For INDUSTRY SPEND/INVESTMENT:**
- **Required keywords (MUST be present):** "invested in", "spent in", "annual spend", "industry investment", "X billion invested annually in", "spending on", "allocated to"
- **NOT sufficient:** Just industry name and number
- **Example ✅:** "$50B invested annually in enterprise logistics", "$100B spent on healthcare IT"
- **Example ❌:** "$50B logistics market" (not explicitly spend), "$100B healthcare" (no spend keyword)

**What to Do When Labels Are Missing or Ambiguous:**

1. **DO NOT classify the value** - resist the urge to guess
2. **Add to unclassified_values array** - Example:
   {
     "value": "$10M",
     "context": "Page 3, appears in unlabeled table cell next to '2023'",
     "possible_meaning": "Could be funding, revenue, or market size - insufficient context",
     "reason_unclassified": "No explicit label indicating funding, MRR/ARR, or TAM/SAM/SOM"
   }
3. **Be specific about why it's unclassified**
4. **Note the surrounding context** for human review

**Forbidden Inference Sources:**

❌ **Position in document** - "It's in the financial section so it must be funding" → NO
❌ **Table row/column order** - "First column is dates, second must be funding" → NO
❌ **Font size/styling** - "Big bold number must be TAM" → NO
❌ **Proximity to headers** - "$10M near 'Our Progress'" → Only if header contains explicit keyword
❌ **Investor logos** - "YC logo present so they must have funding" → Logos ≠ amounts
❌ **"Backed by" statements** - "Backed by Sequoia" → Note investor, but NO funding amount implied
❌ **Chart position** - "Y-axis goes to $10M" → Not a data point unless explicitly labeled

**Contextual Association Rules (Use Sparingly):**

You MAY use section headers for context ONLY if:
1. The header contains an explicit keyword ("Funding History", "Revenue Metrics", "Market Size")
2. The number is directly under that header with no other interpretation
3. You mark it as is_inferred=true
4. You include the header text as source_label

Example of ACCEPTABLE contextual inference:
- Header: "Our Seed Funding"
- Text below: "$2M from Acme Ventures in Q1 2023"
- Action: Can classify as funding with is_inferred=false (header + investor name = clear context)

Example of UNACCEPTABLE inference:
- Header: "Milestones"
- Table: "2023 | $2M | Success"
- Action: Cannot classify - header too vague, no explicit funding keyword
- Action: Add to unclassified_values

**Edge Case Handling:**

- **Conflicting data:** Include both values in other_notes with explanation
- **Partial labels:** "Seed: $2M" (has funding type) → ✅ Can classify as seed funding
- **Ambiguous labels:** "$2M raised" → ✅ "raised" is explicit funding keyword
- **Empty context:** No relevant info → Return with minimal structure: sources and other_notes arrays
- **Multiple currencies:** Preserve as-is, don't convert

**Format Standards:**
- Currency: Preserve symbols and format ($1M, €500K, £2M)
- Percentages: Include % symbol (90%, 5% MoM)
- Dates: Preserve format (2021, Q3 2020, March 2023)
- Arrays: Use for lists; if only one item, still use array format
- Integers for counts: loi_count: 5 (not "5")
- Boolean flags: mrr_is_explicit: true (not "true" or 1)

**Final Validation Before Outputting:**

Before including ANY financial metric in your output, verify:
1. ✅ Does it have an explicit label with required keywords?
2. ✅ Have I populated the corresponding _label field?
3. ✅ Have I set _is_explicit to true?
4. ✅ If it's inferred from context, have I marked is_inferred=true?

If any answer is NO → Move to unclassified_values instead.

### EXAMPLES - GOOD vs BAD Extractions

**Example 1: ✅ GOOD - Explicitly labeled funding and revenue**

Input: "We've raised $2M in seed funding from Acme Ventures and are currently at $50K MRR with 80 customers."

Output:
{
  "extra_context": {
    "funding_raised_total": "$2M",
    "funding_raised_label": "raised in seed funding",
    "funding_raised_is_explicit": true,
    "funding_rounds": [
      {
        "type": "seed",
        "amount": "$2M",
        "status": "completed",
        "source": "equity",
        "investors": ["Acme Ventures"],
        "is_explicit_label": true,
        "source_label": "seed funding",
        "is_inferred": false
      }
    ],
    "funding_investors": ["Acme Ventures"],
    "mrr": "$50K",
    "mrr_label": "MRR",
    "mrr_is_explicit": true,
    "customer_count": "80 customers",
    "sources": ["User-provided context"]
  }
}

**Example 2: ❌ BAD input with unlabeled numbers - shows proper handling**

Input: "Our progress in 2023: $2M milestone achieved. Growing to $10M opportunity. Team of 15. Backed by YC."

Output:
{
  "extra_context": {
    "team_size_claimed": "15",
    "funding_investors": ["YC"],
    "unclassified_values": [
      {
        "value": "$2M",
        "context": "Mentioned as '2023: $2M milestone achieved'",
        "possible_meaning": "Could be funding, revenue, or another milestone metric",
        "reason_unclassified": "No explicit label - 'milestone' is too vague to classify as funding, MRR, ARR, or TAM"
      },
      {
        "value": "$10M",
        "context": "Mentioned as 'Growing to $10M opportunity'",
        "possible_meaning": "Could be revenue target, market size, or funding goal",
        "reason_unclassified": "No explicit label - 'opportunity' doesn't indicate funding, revenue, or TAM specifically"
      }
    ],
    "other_notes": [
      "YC backing mentioned but no funding amount specified"
    ],
    "sources": ["User-provided context"]
  }
}

**Example 3: ✅ GOOD - Numeric scale with explicit labels**

Input: "Funding History (in millions): Pre-seed: 0.5, Seed: 2.0. Current MRR k€/month: 45."

Output:
{
  "extra_context": {
    "funding_raised_total": "$2.5M",
    "funding_raised_label": "Funding History",
    "funding_raised_is_explicit": true,
    "funding_rounds": [
      {
        "type": "pre-seed",
        "amount": "$0.5M",
        "status": "completed",
        "source": "equity",
        "is_explicit_label": true,
        "source_label": "Funding History (in millions): Pre-seed",
        "is_inferred": false
      },
      {
        "type": "seed",
        "amount": "$2M",
        "status": "completed",
        "source": "equity",
        "is_explicit_label": true,
        "source_label": "Funding History (in millions): Seed",
        "is_inferred": false
      }
    ],
    "mrr": "€45K",
    "mrr_label": "MRR k€/month",
    "mrr_is_explicit": true,
    "sources": ["User-provided context - funding table and revenue metrics"]
  }
}

**Example 4: ❌ BAD input - table without semantic labels**

Input: "Financial Overview (in millions): Q1: 1.5, Q2: 2.3, Q3: 3.1"

Output:
{
  "extra_context": {
    "unclassified_values": [
      {
        "value": "$1.5M, $2.3M, $3.1M",
        "context": "Table labeled 'Financial Overview (in millions)' with quarterly values",
        "possible_meaning": "Could be quarterly revenue, funding by quarter, or other financial metrics",
        "reason_unclassified": "No semantic label - 'Financial Overview' doesn't specify if this is funding, revenue, MRR, ARR, or other metric. Scale indicator present but semantic meaning absent."
      }
    ],
    "sources": ["User-provided context"]
  }
}

**Example 5: ✅ GOOD - TAM explicitly labeled vs industry spend**

Input: "Market: $50B invested annually in enterprise logistics. Our TAM is $5B, SAM $500M."

Output:
{
  "extra_context": {
    "industry_investment_size": "$50B",
    "industry_investment_label": "invested annually in enterprise logistics",
    "industry_investment_is_explicit": true,
    "tam_claimed": "$5B",
    "tam_label": "TAM",
    "tam_is_explicit": true,
    "sam_claimed": "$500M",
    "sam_label": "SAM",
    "sam_is_explicit": true,
    "sources": ["User-provided context - market section"]
  }
}

**Example 6: ❌ BAD input - ambiguous market number**

Input: "The logistics market is worth $50B and growing rapidly."

Output:
{
  "extra_context": {
    "unclassified_values": [
      {
        "value": "$50B",
        "context": "Mentioned as 'logistics market is worth $50B'",
        "possible_meaning": "Likely refers to market size, but unclear if it's TAM, total industry size, or annual spend",
        "reason_unclassified": "No explicit TAM/SAM/SOM label - 'market is worth' doesn't clearly indicate if this is addressable market, industry spend, or total market value"
      }
    ],
    "sources": ["User-provided context"]
  }
}

**Example 7: ✅ GOOD - Distinguishing completed vs target funding**

Input: "We closed a €1M seed round in Q1 2023. Currently raising Series A, targeting €5M. Also secured €200K in government grants."

Output:
{
  "extra_context": {
    "funding_raised_total": "€1M",
    "funding_raised_label": "closed seed round",
    "funding_raised_is_explicit": true,
    "funding_rounds": [
      {
        "type": "seed",
        "amount": "€1M",
        "status": "completed",
        "source": "equity",
        "date": "Q1 2023",
        "is_explicit_label": true,
        "source_label": "closed seed round",
        "is_inferred": false
      },
      {
        "type": "Series A",
        "amount": "€5M",
        "status": "target",
        "source": "equity",
        "is_explicit_label": true,
        "source_label": "raising Series A, targeting",
        "is_inferred": false
      }
    ],
    "non_dilutive_funding": "€200K in government grants",
    "current_funding_round": "raising Series A",
    "target_funding_amount": "€5M",
    "sources": ["User-provided context"]
  }
}

**Example 8: ❌ BAD input - investor logo without amount**

Input: "Backed by Y Combinator and Sequoia Capital. Rapid growth trajectory."

Output:
{
  "extra_context": {
    "funding_investors": ["Y Combinator", "Sequoia Capital"],
    "other_notes": [
      "Investor backing mentioned but no specific funding amounts disclosed"
    ],
    "sources": ["User-provided context"]
  }
}
Note: NO funding_raised_total because no amount was stated. Investor logos/names ≠ funding amounts.

**Example 9: ✅ GOOD - Contextual inference with section header (use sparingly)**

Input: "### Our Seed Funding Round\n\n$2M from Acme VC\nCompleted March 2023"

Output:
{
  "extra_context": {
    "funding_raised_total": "$2M",
    "funding_raised_label": "Our Seed Funding Round",
    "funding_raised_is_explicit": true,
    "funding_rounds": [
      {
        "type": "seed",
        "amount": "$2M",
        "status": "completed",
        "source": "equity",
        "date": "March 2023",
        "investors": ["Acme VC"],
        "is_explicit_label": true,
        "source_label": "Our Seed Funding Round",
        "is_inferred": true  // True because we used header for context
      }
    ],
    "funding_investors": ["Acme VC"],
    "sources": ["User-provided context"]
  }
}
Note: is_inferred=true because we relied on section header "Seed Funding" for classification.

**Example 10: ❌ BAD input - vague header doesn't help**

Input: "### Achievements\n\n$5M | 100 customers | 5 team members"

Output:
{
  "extra_context": {
    "customer_count": "100 customers",
    "team_size_claimed": "5 team members",
    "unclassified_values": [
      {
        "value": "$5M",
        "context": "Under 'Achievements' header, listed alongside customer and team counts",
        "possible_meaning": "Could be funding raised, revenue milestone, or other achievement metric",
        "reason_unclassified": "'Achievements' header too vague - doesn't indicate if $5M is funding, revenue, market size, or another metric"
      }
    ],
    "sources": ["User-provided context"]
  }
}

---

Now extract the data from the provided context using these strict rules.
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
