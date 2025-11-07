// Core data types matching the Python schemas

export interface Problem {
  general: string
  example: string
}

export interface Solution {
  what_it_is: string
  how_it_works: string
  example: string
}

export interface Competitor {
  name: string
  website?: string
  product_type?: string
  sector?: string
  subsector?: string
  problem_similarity: string
  solution_summary: string
  similarities: string[]
  differences: string[]
  active_locations: string[]
  sources: string[]
}

export interface Analysis {
  id: string
  startup_name: string
  startup_url: string
  problem: Problem
  solution: Solution
  product_type: string
  sector: string
  subsector: string
  active_locations: string[]
  competition: Competitor[]
  sources: string[]
  created_at: string
}

export interface AnalysisRequest {
  startup_name: string
  startup_url: string
}
