# Extra Content Integration - Implementation Summary

## Overview

This document summarizes the updates made to integrate extra content (pitchdeck images and founder-provided material) as first-class evidence into structured schemas rather than keeping it in a generic "extra content" section.

**Date:** November 8, 2025  
**Status:** ✅ Complete

---

## Key Changes

### 1. Schema Updates (`src/ai/core/schemas.ts`)

#### **Team Schema**

- Added `TeamMember` interface with structured fields:
  - `name`: Full name of team member
  - `role`: Title/position (e.g., "CEO", "CTO")
  - `past_experience?`: Optional summary of relevant background
- Added `team_members: TeamMember[]` to `Team` schema
- Deprecated `key_roles` and `founders` arrays in favor of structured `team_members`

#### **Traction Schema**

- Added `FundingRound` interface with:
  - `type`: Round type (pre-seed, seed, Series A, etc.)
  - `amount?`: Funding amount
  - `status`: "completed" (past), "ongoing" (current), or "target" (future)
  - `source`: "equity", "non-dilutive", "grant", "debt", etc.
  - `date?`: When completed/announced
- Added detailed revenue fields:
  - `mrr?`: Monthly Recurring Revenue
  - `arr?`: Annual Recurring Revenue
  - `revenue_growth_rate?`: Revenue-specific growth
- Added detailed funding fields:
  - `funding_raised_total?`: Total raised to date
  - `funding_rounds?`: Array of `FundingRound[]`
  - `non_dilutive_funding?`: Non-dilutive total
  - `current_funding_round?`: Description of current raise
  - `target_funding_amount?`: Amount seeking to raise
  - `loi_count?`: Number of Letters of Intent
  - `loi_value?`: Total LOI value
- Deprecated legacy `revenue` field in favor of `mrr`/`arr`

#### **Market Schema**

- Added fields to distinguish industry spend from TAM:
  - `industry_investment_size?`: E.g., "$50B spent annually in logistics"
  - `spend_in_category?`: Money spent/invested in the space
  - `market_notes?`: Free-form field for context
  - `is_claimed_TAM?`: Boolean indicating if explicitly presented as TAM

#### **ExtraContextData Schema**

- Enhanced with detailed funding structure:
  - `funding_rounds[]`: Array matching `FundingRound` interface
  - `funding_raised_total?`: Total raised
  - `non_dilutive_funding?`: Non-dilutive total
  - `current_funding_round?`: Current raise description
  - `target_funding_amount?`: Target raise amount
- Added team members structure:
  - `team_members[]`: Array with name, role, past_experience
- Added market distinction fields:
  - `industry_investment_size?`: Industry spend data
  - `spend_in_category?`: Category spend data
- Added LOI fields:
  - `loi_count?`: Number of LOIs
  - `loi_value?`: Total LOI value

---

### 2. Extra Context Extraction (`src/ai/prompts/extra_context.ts`)

#### **Numeric Scale Handling**

- Automatic detection of unit labels in tables/charts:
  - "(in millions)", "(M)", "(k)", "(in thousands)"
  - Applies scale to all numbers in that table/section
- Example: Table showing "3, 1, 2.1" labeled "(in millions)" → interpret as $3M, $1M, $2.1M

#### **Semantic Labeling Requirements**

- **Funding numbers** require keywords: "funding", "raised", "seed", "Series A", "investment", "round"
- **Revenue numbers** require keywords: "MRR", "ARR", "revenue", "recurring"
- **Market size** requires keywords: "TAM", "SAM", "SOM", "market size", "spent in", "invested in"
- Unlabeled numbers are NOT assumed to be funding/revenue

#### **Funding Round Status Distinctions**

- **Completed** (past): "raised", "closed", "completed", "secured"
- **Ongoing** (current): "raising", "currently", "in process of"
- **Target** (future): "seeking", "aiming to raise", "target"

#### **Funding Source Types**

- **Equity**: "equity", "VC", "investors"
- **Non-dilutive**: "grant", "government funding", "SBIR"
- **Debt**: "loan", "credit line"
- **LOIs**: Tracked separately, NOT counted as completed funding

---

### 3. Team Analysis Updates (`src/ai/prompts/team.ts`)

#### **Primary Extraction Method**

- Extract to structured `team_members` array
- Each member has: name, role, optional past_experience
- Example:
  ```json
  {
    "name": "Alice Chen",
    "role": "CEO",
    "past_experience": "ex-Google, 15 years in SaaS"
  }
  ```

#### **Extra Context Integration**

- If `team_members[]` present in extra context, populate schema directly
- Treat as first-class data (accurate founder-provided information)
- Combine website evidence with pitchdeck data for complete picture
- Deprecated fields (`key_roles`, `founders`) only used if structured extraction fails

---

### 4. Traction/Funding Analysis Updates (`src/ai/prompts/traction.ts`)

#### **Revenue Metrics**

- Prefer `mrr`/`arr` fields over legacy `revenue` field
- Only populate when explicitly labeled as MRR/ARR
- Extract specific numbers: "$50K MRR", "$600K ARR"

#### **Funding Distinctions (CRITICAL)**

- **Past/Completed**: Include in `funding_raised_total`, status="completed"
- **Current Round**: Populate `current_funding_round`, status="ongoing", NOT in total
- **Target/Future**: Populate `target_funding_amount`, status="target", NOT in total

#### **LOIs vs Actual Funding**

- LOIs are soft commitments, NOT completed funding
- Track separately in `loi_count` and `loi_value`
- Can mention in `key_milestones` as achievements

#### **Extra Context Handling**

- MRR/ARR numbers are explicit and trustworthy when clearly labeled
- `funding_rounds[]` array distinguishes completed vs ongoing vs target
- Use `funding_raised_total` for completed funding ONLY
- Non-dilutive funding tracked separately
- Competition claims are biased - note but remain objective

---

### 5. Market Analysis Updates (`src/ai/prompts/market.ts`)

#### **Industry Investment vs TAM**

- **Industry spend** ≠ **Total Addressable Market**
- Pitchdecks often label industry spend as "TAM" (misleading)
- When this pattern appears:
  - Put spend figure in `industry_investment_size` or `spend_in_category`
  - Use `market_notes` to clarify: "This is industry spend, not necessarily TAM"
  - Set `is_claimed_TAM` to false
  - Provide realistic TAM estimate in `tam` field

#### **Founder-Reported Data**

- TAM/SAM/SOM from pitchdecks often optimistic (designed to impress investors)
- Use as ONE data point, not definitive truth
- Apply independent judgment and industry knowledge
- Flag when numbers seem unrealistic
- Be transparent: "Founders claim $XB TAM, but realistic estimate is $YB given [reasons]"

#### **Extra Context Handling**

- `tam_claimed`, `sam_claimed`, `som_claimed` from pitchdeck
- Cross-reference with independent analysis
- Note conflicts in `market_size_summary`
- Conservative, realistic estimates preferred over inflated ones

---

### 6. Orchestration Updates (`src/ai/orchestration/graph.ts`)

#### **Team Node**

- Added `team_members` array to validation/defaults
- Preserve backward compatibility with `key_roles` and `founders`

#### **Market Node**

- Added optional new fields: `industry_investment_size`, `spend_in_category`, `market_notes`, `is_claimed_TAM`
- Only include if present in LLM response

#### **Traction Node**

- Added optional revenue fields: `mrr`, `arr`, `revenue_growth_rate`
- Added optional funding fields: `funding_raised_total`, `funding_rounds`, `non_dilutive_funding`, `current_funding_round`, `target_funding_amount`, `loi_count`, `loi_value`
- Preserve backward compatibility with legacy `revenue` field

---

## Behavioral Guidelines

### **What Extra Content IS:**

- Pitchdeck materials, founder-provided documents
- Self-reported but FACTUAL when explicitly labeled
- First-class evidence source for team, funding, traction, market data

### **How to Treat Extra Content:**

#### **Trustworthy (Use Directly):**

- ✅ Explicit MRR/ARR numbers (when clearly labeled)
- ✅ Team member names, roles, backgrounds
- ✅ Funding amounts (when status is clear: completed vs ongoing vs target)
- ✅ Founded year, customer counts, explicit metrics

#### **Use with Caution (Founder Bias):**

- ⚠️ Market size claims (TAM/SAM/SOM often optimistic)
- ⚠️ Industry spend figures (often mislabeled as TAM)
- ⚠️ Growth projections

#### **Highly Skeptical (Self-Serving):**

- 🚫 Competition claims ("we're better than X because...")
- 🚫 "Unique advantages" claims
- 🚫 "No competitors" statements

### **Critical Rules:**

1. **Semantic labeling**: Numbers must have nearby keywords (funding, MRR, ARR, TAM, etc.)
2. **Numeric scaling**: Apply unit labels from table headers/axis labels
3. **Funding status**: Clearly distinguish completed vs ongoing vs target
4. **LOIs ≠ Funding**: Track separately, not in funding totals
5. **Industry spend ≠ TAM**: Different concepts, label correctly
6. **Independent judgment**: Founder data is input, not truth

---

## Examples

### **Team Member Extraction**

```json
// From pitchdeck: "Team: CEO - Alice (ex-Google), CTO - Bob (MIT, founded 2 startups)"
{
  "team_members": [
    {
      "name": "Alice",
      "role": "CEO",
      "past_experience": "ex-Google"
    },
    {
      "name": "Bob",
      "role": "CTO",
      "past_experience": "MIT, founded 2 startups"
    }
  ]
}
```

### **Funding Round Distinctions**

```json
// From pitchdeck: "Closed €1M seed (Q1 2023). Currently raising Series A, targeting €5M."
{
  "funding_raised_total": "€1M",
  "funding_rounds": [
    {
      "type": "seed",
      "amount": "€1M",
      "status": "completed",
      "source": "equity",
      "date": "Q1 2023"
    },
    {
      "type": "Series A",
      "amount": "€5M",
      "status": "target",
      "source": "equity"
    }
  ],
  "current_funding_round": "raising Series A",
  "target_funding_amount": "€5M"
}
```

### **Numeric Scale Handling**

```json
// Table: "Funding (in millions): Pre-seed: 0.5, Seed: 2.0"
{
  "funding_rounds": [
    {
      "type": "pre-seed",
      "amount": "$0.5M",
      "status": "completed",
      "source": "equity"
    },
    {
      "type": "seed",
      "amount": "$2M",
      "status": "completed",
      "source": "equity"
    }
  ],
  "funding_raised_total": "$2.5M"
}
```

### **Industry Spend vs TAM**

```json
// Pitchdeck: "Market: $50B spent annually in enterprise logistics. Our TAM is $5B."
{
  "industry_investment_size": "$50B spent annually in enterprise logistics",
  "tam": "$5B",
  "market_notes": "Industry spend of $50B is total market; realistic TAM for this solution is $5B"
}
```

---

## Testing Recommendations

1. **Test with pitchdeck containing:**
   - Table with "(in millions)" label
   - Multiple funding rounds with different statuses
   - Team member descriptions
   - Industry spend labeled as "TAM"

2. **Verify:**
   - Numeric scales applied correctly
   - Funding rounds categorized by status
   - Team members in structured array
   - Industry spend separate from TAM

3. **Edge cases:**
   - Unlabeled numbers (should go to `other_notes`)
   - LOIs (should NOT be in funding total)
   - Conflicting data (note both sources)

---

## Migration Notes

### **Backward Compatibility**

- Legacy fields (`revenue`, `key_roles`, `founders`) still supported
- New fields are optional - existing code won't break
- Gradual migration recommended

### **Database Considerations**

- New optional fields won't affect existing records
- Consider updating display logic to show new structured data
- UI may want to differentiate completed vs ongoing vs target funding

---

## Summary

This update transforms extra content from a "nice to have" appendix into a **first-class evidence source** that properly populates structured schemas. Key improvements:

✅ **Team members** extracted with structured name/role/experience  
✅ **Funding rounds** clearly distinguished by status (completed/ongoing/target)  
✅ **MRR/ARR** treated as explicit, trustworthy metrics when labeled  
✅ **Numeric scales** automatically applied from table/chart labels  
✅ **Semantic labeling** ensures only properly labeled numbers are classified  
✅ **Industry spend** separated from TAM to avoid inflation  
✅ **LOIs** tracked separately from completed funding  
✅ **Founder bias** acknowledged but data used appropriately

The system now intelligently integrates pitchdeck data while maintaining critical thinking about founder bias, especially for competition claims and market sizing.
