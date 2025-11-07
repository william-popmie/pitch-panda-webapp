// Main analysis graph/pipeline - mimics LangGraph structure
// Version: 2.0 (Unified CLI + Webapp)

import type { Analysis, AnalysisState, Competitor, Team, Market, Traction } from '../core/schemas'
import { fetchWebsiteText } from '../../utils/web'
import { formatProblemSolutionPrompt } from '../prompts/problem_solution'
import { formatCompetitionPrompt } from '../prompts/competition'
import { formatTeamPrompt } from '../prompts/team'
import { formatMarketPrompt } from '../prompts/market'
import { formatTractionPrompt } from '../prompts/traction'
import { callLLM, parseJSON } from '../core/llm'

// ---------- Nodes ----------

async function fetchNode(state: AnalysisState): Promise<AnalysisState> {
  console.log(`📡 Fetching website: ${state.startup_url}`)
  state.website_text = await fetchWebsiteText(state.startup_url)
  return state
}

async function analyzeNode(state: AnalysisState): Promise<AnalysisState> {
  console.log(`🧠 Analyzing problem & solution...`)

  const prompt = formatProblemSolutionPrompt(
    state.startup_name,
    state.startup_url,
    state.website_text
  )

  const response = await callLLM(prompt)
  state.result_json = parseJSON<Partial<Analysis>>(response)

  return state
}

function validateNode(state: AnalysisState): AnalysisState {
  console.log(`✅ Validating analysis...`)

  // Ensure required fields with defaults
  const result = state.result_json

  if (!result.problem) {
    result.problem = { general: 'Unknown', example: 'Unknown' }
  }
  if (!result.solution) {
    result.solution = { what_it_is: 'Unknown', how_it_works: 'Unknown', example: 'Unknown' }
  }
  if (!result.product_type) result.product_type = 'Unknown'
  if (!result.sector) result.sector = 'Unknown'
  if (!result.subsector) result.subsector = 'Unknown'
  if (!result.active_locations) result.active_locations = []
  if (!result.sources) result.sources = [state.startup_url]

  // Ensure homepage is in sources (dedupe)
  const sources = new Set([...(result.sources || []), state.startup_url])
  result.sources = Array.from(sources)

  // Ensure active_locations is array
  if (!Array.isArray(result.active_locations)) {
    result.active_locations = []
  }

  state.result_json = result
  return state
}

async function competitionNode(state: AnalysisState): Promise<AnalysisState> {
  console.log(`🏢 Finding competition...`)

  const analysis = state.result_json as Analysis

  const prompt = formatCompetitionPrompt({
    startup_name: state.startup_name,
    startup_url: state.startup_url,
    problem_general: analysis.problem.general,
    problem_example: analysis.problem.example,
    solution_what: analysis.solution.what_it_is,
    solution_how: analysis.solution.how_it_works,
    solution_example: analysis.solution.example,
    product_type: analysis.product_type,
    sector: analysis.sector,
    subsector: analysis.subsector,
    active_locations: analysis.active_locations.join(', ') || '[]',
  })

  const response = await callLLM(prompt)
  const parsed = parseJSON<{ competition: Competitor[] }>(response)

  // Validate each competitor
  const cleanCompetition: Competitor[] = []
  for (const comp of parsed.competition || []) {
    if (comp.name && comp.problem_similarity && comp.solution_summary) {
      cleanCompetition.push({
        ...comp,
        similarities: comp.similarities || [],
        differences: comp.differences || [],
        active_locations: comp.active_locations || [],
        sources: comp.sources || [],
      })
    }
  }

  analysis.competition = cleanCompetition
  state.result_json = analysis

  return state
}

async function teamNode(state: AnalysisState): Promise<AnalysisState> {
  console.log(`👥 Analyzing team...`)

  const analysis = state.result_json as Analysis

  const prompt = formatTeamPrompt({
    startup_name: state.startup_name,
    startup_url: state.startup_url,
    sector: analysis.sector,
    subsector: analysis.subsector,
    problem_general: analysis.problem.general,
    solution_what: analysis.solution.what_it_is,
    website_text: state.website_text,
  })

  const response = await callLLM(prompt)
  const parsed = parseJSON<{ team: Team }>(response)

  // Validate and set defaults
  const team: Team = {
    size: parsed.team?.size || 'Unknown',
    key_roles: parsed.team?.key_roles || [],
    founders: parsed.team?.founders || [],
    expertise: parsed.team?.expertise || 'Unknown',
    sources: parsed.team?.sources || [],
  }

  analysis.team = team
  state.result_json = analysis

  return state
}

async function marketNode(state: AnalysisState): Promise<AnalysisState> {
  console.log(`📊 Analyzing market...`)

  const analysis = state.result_json as Analysis

  const prompt = formatMarketPrompt({
    startup_name: state.startup_name,
    startup_url: state.startup_url,
    sector: analysis.sector,
    subsector: analysis.subsector,
    problem_general: analysis.problem.general,
    solution_what: analysis.solution.what_it_is,
    product_type: analysis.product_type,
    active_locations: analysis.active_locations.join(', ') || 'Unknown',
    website_text: state.website_text,
  })

  const response = await callLLM(prompt)
  const parsed = parseJSON<{ market: Market }>(response)

  // Validate and set defaults
  const market: Market = {
    tam: parsed.market?.tam || 'Unknown',
    sam: parsed.market?.sam || 'Unknown',
    som: parsed.market?.som || 'Unknown',
    market_size_summary: parsed.market?.market_size_summary || 'Unknown',
    growth_trends: parsed.market?.growth_trends || [],
    target_customers: parsed.market?.target_customers || 'Unknown',
    sources: parsed.market?.sources || [],
  }

  analysis.market = market
  state.result_json = analysis

  return state
}

async function tractionNode(state: AnalysisState): Promise<AnalysisState> {
  console.log(`🚀 Analyzing traction & competitive advantages...`)

  const analysis = state.result_json as Analysis

  const prompt = formatTractionPrompt({
    startup_name: state.startup_name,
    startup_url: state.startup_url,
    sector: analysis.sector,
    subsector: analysis.subsector,
    problem_general: analysis.problem.general,
    solution_what: analysis.solution.what_it_is,
    product_type: analysis.product_type,
    website_text: state.website_text,
  })

  const response = await callLLM(prompt)
  const parsed = parseJSON<{ traction: Traction }>(response)

  // Validate and set defaults
  const traction: Traction = {
    revenue: parsed.traction?.revenue || 'Unknown',
    customers: parsed.traction?.customers || 'Unknown',
    growth_rate: parsed.traction?.growth_rate || 'Unknown',
    key_milestones: parsed.traction?.key_milestones || [],
    intellectual_property: parsed.traction?.intellectual_property || [],
    partnerships: parsed.traction?.partnerships || [],
    regulatory_moats: parsed.traction?.regulatory_moats || [],
    network_effects: parsed.traction?.network_effects || 'Unknown',
    defensibility_summary: parsed.traction?.defensibility_summary || 'Unknown',
    sources: parsed.traction?.sources || [],
  }

  analysis.traction = traction
  state.result_json = analysis

  return state
}

// ---------- Main Entry ----------

export async function runAnalysis(startupName: string, startupUrl: string): Promise<Analysis> {
  console.log(`\n🐼 Starting analysis for: ${startupName}`)
  console.log(`📍 Using unified pipeline v2.0\n`)

  const initialState: AnalysisState = {
    startup_name: startupName,
    startup_url: startupUrl,
    website_text: '',
    result_json: {},
  }

  // Run through the graph
  let state = initialState

  // Phase 1: Core problem/solution analysis
  state = await fetchNode(state)
  state = await analyzeNode(state)
  state = validateNode(state)

  // Phase 2: Extended analysis (runs after core identity is established)
  state = await competitionNode(state)
  state = await teamNode(state)
  state = await marketNode(state)
  state = await tractionNode(state)

  return state.result_json as Analysis
}
