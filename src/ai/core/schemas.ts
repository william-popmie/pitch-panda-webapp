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

  // Metadata (added when saved to database)
  created_at?: string
  updated_at?: string
}

export interface AnalysisState {
  startup_name: string
  startup_url: string
  website_text: string
  result_json: Partial<Analysis>
}
