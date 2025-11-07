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

export interface Analysis {
  problem: Problem
  solution: Solution
  product_type: string
  sector: string
  subsector: string
  active_locations: string[]
  sources: string[]
  competition: Competitor[]
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
