// Pydantic-style schemas using TypeScript types

export interface Problem {
  general: string // 1-3 sentence general problem statement
  example: string // Concrete, everyday scenario of the problem
}

export interface Solution {
  what_it_is: string // Short product label, e.g., 'SaaS platform'
  how_it_works: string // 2-4 sentences on mechanism
  example: string // Concrete use case with outcome
}

export interface Competitor {
  name: string
  website?: string
  product_type?: string
  sector?: string
  subsector?: string
  // How their PROBLEM overlaps with target (should be near-identical)
  problem_similarity: string
  // Solution + contrast
  solution_summary: string
  similarities: string[]
  differences: string[]
  // Where they're active
  active_locations: string[]
  // Evidence
  sources: string[]
}

export interface TeamMember {
  name: string
  role: string // e.g., "CEO", "CTO", "VP Engineering"
  past_experience?: string // Short summary: company names, prior roles, notable exits if mentioned
}

export interface Team {
  size: string // e.g., "10-50", "50+", "5-10"
  team_members: TeamMember[] // Detailed list of team members with roles and backgrounds
  key_roles: string[] // e.g., ["CEO - John Doe", "CTO - Jane Smith"] - DEPRECATED, prefer team_members
  founders: string[] // Names and brief background - DEPRECATED, prefer team_members
  expertise: string // 2-3 sentences on team's collective expertise/domain knowledge
  sources: string[]
}

export interface Market {
  tam: string // Total Addressable Market with currency
  tam_label?: string // The exact label from source (e.g., "TAM", "Total Addressable Market")
  tam_is_explicit?: boolean // True if explicitly labeled as TAM in source material

  sam: string // Serviceable Addressable Market
  sam_label?: string // The exact label from source (e.g., "SAM", "Serviceable Addressable Market")
  sam_is_explicit?: boolean // True if explicitly labeled as SAM in source material

  som: string // Serviceable Obtainable Market
  som_label?: string // The exact label from source (e.g., "SOM", "Serviceable Obtainable Market")
  som_is_explicit?: boolean // True if explicitly labeled as SOM in source material

  market_size_summary: string // 2-4 sentences explaining the market opportunity
  growth_trends: string[] // Key trends driving market growth
  target_customers: string // Who are the ideal customers/ICP

  // Additional fields for industry investment vs actual TAM
  industry_investment_size?: string // E.g., "$50B spent annually in logistics inefficiencies"
  industry_investment_label?: string // The exact phrase (e.g., "invested annually in", "industry spend")
  industry_investment_is_explicit?: boolean // True if explicitly labeled as industry investment/spend

  spend_in_category?: string // Money spent/invested in the space (not necessarily TAM)
  market_notes?: string // Free-form field for context like "Claimed as TAM but actually industry spend"
  is_claimed_TAM?: boolean // True if explicitly presented as TAM, false if just spend/investment data
  sources: string[]
}

export interface FundingRound {
  type: string // e.g., "pre-seed", "seed", "Series A", "grant", "other"
  amount?: string // E.g., "$2M", "€500K"
  status: string // "completed", "ongoing", "target"
  source: string // "equity", "non-dilutive", "grant", "debt", "other"
  date?: string // When the round was completed or announced
  // Traceability fields for explicit labeling enforcement
  is_explicit_label?: boolean // True if explicitly labeled in source (e.g., "Seed funding: $2M")
  source_label?: string // The actual phrase that defined it (e.g., "Seed funding", "Pre-seed round")
  is_inferred?: boolean // True if inferred from context rather than explicit label
}

export interface Traction {
  // Traction metrics
  revenue: string // e.g., "$1M ARR", "Pre-revenue", "Unknown" - DEPRECATED, prefer mrr/arr fields
  customers: string // e.g., "100+ enterprise customers", "10K users"
  growth_rate: string // e.g., "50% YoY", "Unknown"
  key_milestones: string[] // Major achievements

  // Detailed revenue metrics (numeric when possible)
  mrr?: string // Monthly Recurring Revenue, e.g., "$50K" or numeric value
  mrr_label?: string // The exact label from source (e.g., "MRR", "Monthly Recurring Revenue")
  mrr_is_explicit?: boolean // True if explicitly labeled as MRR/monthly recurring revenue

  arr?: string // Annual Recurring Revenue, e.g., "$600K" or numeric value
  arr_label?: string // The exact label from source (e.g., "ARR", "Annual Recurring Revenue")
  arr_is_explicit?: boolean // True if explicitly labeled as ARR/annual recurring revenue

  revenue_growth_rate?: string // Specific growth rate for revenue if stated

  // Detailed funding information
  funding_raised_total?: string // Total funding raised to date, e.g., "$5M"
  funding_raised_label?: string // The exact label from source (e.g., "Total funding", "Raised to date")
  funding_raised_is_explicit?: boolean // True if explicitly labeled as funding/raised amount

  funding_rounds?: FundingRound[] // Array of funding rounds with details
  non_dilutive_funding?: string // Non-dilutive funding amount (grants, revenue-based, etc.)
  current_funding_round?: string // e.g., "raising Seed", "raising Series A"
  target_funding_amount?: string // What they're trying to raise now
  loi_count?: number // Number of Letters of Intent
  loi_value?: string // Total value of LOIs

  // Competitive advantages & defensibility
  intellectual_property: string[] // Patents, proprietary tech, trade secrets
  partnerships: string[] // LOIs, strategic partnerships, channel partners
  regulatory_moats: string[] // Licenses, certifications, regulatory approvals
  network_effects: string // Description of network effects if any
  defensibility_summary: string // 2-3 sentences on overall competitive moats

  sources: string[]
}

// Unclassified numeric or textual values found without explicit labels
export interface UnclassifiedValue {
  value: string // The numeric or textual value found
  context: string // Surrounding text or context where it was found
  possible_meaning?: string // Optional guess at what it might represent
  reason_unclassified: string // Why it wasn't classified (e.g., "No explicit label found")
}

// Structured data extracted from user-provided extra context (pitch decks, private docs, etc.)
export interface ExtraContextData {
  // Factual/Objective Data (generally trustworthy)
  founded_year?: string // e.g., "2021", "Q3 2020"

  mrr?: string // Monthly Recurring Revenue, e.g., "$50K MRR" or just "$50K"
  mrr_label?: string // The exact label from source (e.g., "MRR", "Monthly Recurring Revenue")
  mrr_is_explicit?: boolean // True if explicitly labeled as MRR

  arr?: string // Annual Recurring Revenue, e.g., "$600K ARR" or just "$600K"
  arr_label?: string // The exact label from source (e.g., "ARR", "Annual Recurring Revenue")
  arr_is_explicit?: boolean // True if explicitly labeled as ARR

  // Detailed funding information
  funding_stage?: string // e.g., "Pre-seed", "Seed", "Series A", "Bootstrapped"
  funding_raised?: string // DEPRECATED - use funding_raised_total
  funding_raised_total?: string // Total funding raised to date, e.g., "$2M", "€1.5M"
  funding_raised_label?: string // The exact label from source (e.g., "Total raised", "Funding to date")
  funding_raised_is_explicit?: boolean // True if explicitly labeled as funding

  funding_rounds?: Array<{
    type: string // "pre-seed", "seed", "Series A", "grant", etc.
    amount?: string // E.g., "$1M", "€500K"
    status: string // "completed", "ongoing", "target"
    source: string // "equity", "non-dilutive", "grant", "debt"
    date?: string // When completed/announced
    investors?: string[] // Investor names for this round
    is_explicit_label?: boolean // True if explicitly labeled in source
    source_label?: string // The actual phrase (e.g., "Seed funding", "Series A round")
    is_inferred?: boolean // True if inferred from context
  }>
  non_dilutive_funding?: string // Non-dilutive funding total, e.g., "$500K in grants"
  current_funding_round?: string // e.g., "raising Seed round"
  target_funding_amount?: string // What they're trying to raise, e.g., "$2M"
  funding_investors?: string[] // e.g., ["Y Combinator", "Sequoia Capital"] - investors across all rounds

  burn_rate?: string // e.g., "$50K/month"
  runway?: string // e.g., "18 months"
  valuation?: string // e.g., "$10M post-money"

  // Market data from pitch materials (FOUNDER-REPORTED - may be biased)
  tam_claimed?: string // TAM claimed by company
  tam_label?: string // The exact label from source (e.g., "TAM", "Total Addressable Market")
  tam_is_explicit?: boolean // True if explicitly labeled as TAM

  sam_claimed?: string // SAM claimed by company
  sam_label?: string // The exact label from source (e.g., "SAM")
  sam_is_explicit?: boolean // True if explicitly labeled as SAM

  som_claimed?: string // SOM claimed by company
  som_label?: string // The exact label from source (e.g., "SOM")
  som_is_explicit?: boolean // True if explicitly labeled as SOM

  industry_investment_size?: string // E.g., "$50B invested annually in [industry]"
  industry_investment_label?: string // The exact phrase (e.g., "invested annually", "industry spend")
  industry_investment_is_explicit?: boolean // True if explicitly labeled

  spend_in_category?: string // Money spent in the category (not necessarily TAM)

  // Team data from private docs
  team_size_claimed?: string // e.g., "15 employees"
  team_members?: Array<{
    name: string
    role: string
    past_experience?: string // Short summary of relevant background
  }>
  key_hires?: string[] // Recent important hires mentioned

  // Traction from private metrics (SELF-REPORTED but explicit numbers are trustworthy)
  customer_count?: string // e.g., "50 paying customers"
  user_count?: string // e.g., "10K active users"
  retention_rate?: string // e.g., "90% monthly retention"
  churn_rate?: string // e.g., "5% monthly churn"
  ltv?: string // Customer lifetime value
  cac?: string // Customer acquisition cost
  loi_count?: number // Number of Letters of Intent
  loi_value?: string // Total value of LOIs

  // Competition claims (BIASED - treat with skepticism)
  competition_claims?: string[] // What the company says about competitors
  unique_advantages_claimed?: string[] // What they claim makes them unique

  // Unclassified values - numbers/figures found without explicit labels
  unclassified_values?: UnclassifiedValue[] // Values that couldn't be classified due to missing labels

  // Other
  other_notes?: string[] // Any other relevant information extracted

  sources: string[] // Where this data came from (e.g., "Pitch deck", "Internal metrics")
}

export interface Analysis {
  problem: Problem
  solution: Solution
  product_type: string
  sector: string
  subsector: string
  active_locations: string[]
  sources: string[]
  competition: Competitor[]

  // Extended analysis (populated after core problem/solution)
  team?: Team
  market?: Market
  traction?: Traction

  // User-provided private context (extracted and structured)
  extra_context?: ExtraContextData

  // Metadata (added when saved to database)
  created_at?: string
  updated_at?: string
}

export interface AnalysisState {
  startup_name: string
  startup_url: string
  website_text: string
  extra_context_raw: string // Raw user-provided context
  extra_context_parsed?: ExtraContextData // Parsed structured data
  result_json: Partial<Analysis>
}
