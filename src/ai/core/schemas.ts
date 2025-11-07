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

export interface Team {
  size: string // e.g., "10-50", "50+", "5-10"
  key_roles: string[] // e.g., ["CEO - John Doe", "CTO - Jane Smith"]
  founders: string[] // Names and brief background
  expertise: string // 2-3 sentences on team's collective expertise/domain knowledge
  sources: string[]
}

export interface Market {
  tam: string // Total Addressable Market with currency
  sam: string // Serviceable Addressable Market
  som: string // Serviceable Obtainable Market
  market_size_summary: string // 2-4 sentences explaining the market opportunity
  growth_trends: string[] // Key trends driving market growth
  target_customers: string // Who are the ideal customers/ICP
  sources: string[]
}

export interface Traction {
  // Traction metrics
  revenue: string // e.g., "$1M ARR", "Pre-revenue", "Unknown"
  customers: string // e.g., "100+ enterprise customers", "10K users"
  growth_rate: string // e.g., "50% YoY", "Unknown"
  key_milestones: string[] // Major achievements

  // Competitive advantages & defensibility
  intellectual_property: string[] // Patents, proprietary tech, trade secrets
  partnerships: string[] // LOIs, strategic partnerships, channel partners
  regulatory_moats: string[] // Licenses, certifications, regulatory approvals
  network_effects: string // Description of network effects if any
  defensibility_summary: string // 2-3 sentences on overall competitive moats

  sources: string[]
}

// Structured data extracted from user-provided extra context (pitch decks, private docs, etc.)
export interface ExtraContextData {
  // Factual/Objective Data (generally trustworthy)
  founded_year?: string // e.g., "2021", "Q3 2020"
  mrr?: string // Monthly Recurring Revenue, e.g., "$50K MRR"
  arr?: string // Annual Recurring Revenue, e.g., "$600K ARR"
  funding_stage?: string // e.g., "Pre-seed", "Seed", "Series A", "Bootstrapped"
  funding_raised?: string // e.g., "$2M", "€1.5M"
  funding_investors?: string[] // e.g., ["Y Combinator", "Sequoia Capital"]
  burn_rate?: string // e.g., "$50K/month"
  runway?: string // e.g., "18 months"
  valuation?: string // e.g., "$10M post-money"

  // Market data from pitch materials
  tam_claimed?: string // TAM claimed by company
  sam_claimed?: string // SAM claimed by company
  som_claimed?: string // SOM claimed by company

  // Team data from private docs
  team_size_claimed?: string // e.g., "15 employees"
  key_hires?: string[] // Recent important hires mentioned

  // Traction from private metrics
  customer_count?: string // e.g., "50 paying customers"
  user_count?: string // e.g., "10K active users"
  retention_rate?: string // e.g., "90% monthly retention"
  churn_rate?: string // e.g., "5% monthly churn"
  ltv?: string // Customer lifetime value
  cac?: string // Customer acquisition cost

  // Competition claims (BIASED - treat with skepticism)
  competition_claims?: string[] // What the company says about competitors
  unique_advantages_claimed?: string[] // What they claim makes them unique

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
