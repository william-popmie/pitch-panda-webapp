// Main analysis graph/pipeline - mimics LangGraph structure
// Version: 3.0 (With Extra Context Support)

import type {
  Analysis,
  AnalysisState,
  Competitor,
  Team,
  Market,
  Traction,
  ExtraContextData,
} from '../core/schemas'
import { fetchWebsiteText } from '../../utils/web'
import { formatProblemSolutionPrompt } from '../prompts/problem_solution'
import { formatCompetitionPrompt } from '../prompts/competition'
import { formatTeamPrompt } from '../prompts/team'
import { formatMarketPrompt } from '../prompts/market'
import { formatTractionPrompt } from '../prompts/traction'
import { formatExtraContextPrompt } from '../prompts/extra_context'
import { callLLM, parseJSON } from '../core/llm'

// ---------- Nodes ----------

async function extractExtraContextNode(state: AnalysisState): Promise<AnalysisState> {
  // Only run if extra context was provided
  if (!state.extra_context_raw || state.extra_context_raw.trim() === '') {
    console.log(`📝 No extra context provided, skipping extraction`)
    state.extra_context_parsed = undefined
    return state
  }

  console.log(`📝 Extracting structured data from extra context...`)

  const prompt = formatExtraContextPrompt({
    extra_context: state.extra_context_raw,
  })

  const response = await callLLM(prompt)
  const parsed = parseJSON<{ extra_context: ExtraContextData }>(response)

  state.extra_context_parsed = parsed.extra_context
  return state
}

async function fetchNode(state: AnalysisState): Promise<AnalysisState> {
  console.log(`📡 Fetching website: ${state.startup_url}`)
  state.website_text = await fetchWebsiteText(state.startup_url)
  return state
}

async function analyzeNode(state: AnalysisState): Promise<AnalysisState> {
  console.log(`🧠 Analyzing problem & solution...`)

  // Prepare extra context data as JSON string if available
  const extraContextData = state.extra_context_parsed
    ? JSON.stringify(state.extra_context_parsed, null, 2)
    : undefined

  const prompt = formatProblemSolutionPrompt({
    startup_name: state.startup_name,
    startup_url: state.startup_url,
    website_text: state.website_text,
    extra_context_data: extraContextData,
  })

  const response = await callLLM(prompt)
  state.result_json = parseJSON<Partial<Analysis>>(response)

  // Store the parsed extra context in the result
  if (state.extra_context_parsed) {
    state.result_json.extra_context = state.extra_context_parsed
  }

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

  // Prepare extra context focusing on competition claims
  let extraContextData: string | undefined
  if (
    state.extra_context_parsed?.competition_claims ||
    state.extra_context_parsed?.unique_advantages_claimed
  ) {
    const competitionContext = {
      competition_claims: state.extra_context_parsed.competition_claims || [],
      unique_advantages_claimed: state.extra_context_parsed.unique_advantages_claimed || [],
    }
    extraContextData = JSON.stringify(competitionContext, null, 2)
  }

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
    extra_context_data: extraContextData,
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

  // Prepare extra context data as JSON string if available
  const extraContextData = state.extra_context_parsed
    ? JSON.stringify(state.extra_context_parsed, null, 2)
    : undefined

  const prompt = formatTeamPrompt({
    startup_name: state.startup_name,
    startup_url: state.startup_url,
    sector: analysis.sector,
    subsector: analysis.subsector,
    problem_general: analysis.problem.general,
    solution_what: analysis.solution.what_it_is,
    website_text: state.website_text,
    extra_context_data: extraContextData,
  })

  const response = await callLLM(prompt)
  const parsed = parseJSON<{ team: Team }>(response)

  // Validate and set defaults
  const team: Team = {
    size: parsed.team?.size || 'Unknown',
    team_members: parsed.team?.team_members || [],
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

  // Prepare extra context data as JSON string if available
  const extraContextData = state.extra_context_parsed
    ? JSON.stringify(state.extra_context_parsed, null, 2)
    : undefined

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
    extra_context_data: extraContextData,
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
    // Optional new fields - only include if present
    industry_investment_size: parsed.market?.industry_investment_size,
    spend_in_category: parsed.market?.spend_in_category,
    market_notes: parsed.market?.market_notes,
    is_claimed_TAM: parsed.market?.is_claimed_TAM,
    sources: parsed.market?.sources || [],
  }

  analysis.market = market
  state.result_json = analysis

  return state
}

async function tractionNode(state: AnalysisState): Promise<AnalysisState> {
  console.log(`🚀 Analyzing traction & competitive advantages...`)

  const analysis = state.result_json as Analysis

  // Prepare extra context data as JSON string if available
  const extraContextData = state.extra_context_parsed
    ? JSON.stringify(state.extra_context_parsed, null, 2)
    : undefined

  const prompt = formatTractionPrompt({
    startup_name: state.startup_name,
    startup_url: state.startup_url,
    sector: analysis.sector,
    subsector: analysis.subsector,
    problem_general: analysis.problem.general,
    solution_what: analysis.solution.what_it_is,
    product_type: analysis.product_type,
    website_text: state.website_text,
    extra_context_data: extraContextData,
  })

  const response = await callLLM(prompt)
  const parsed = parseJSON<{ traction: Traction }>(response)

  // Validate and set defaults
  const traction: Traction = {
    revenue: parsed.traction?.revenue || 'Unknown',
    customers: parsed.traction?.customers || 'Unknown',
    growth_rate: parsed.traction?.growth_rate || 'Unknown',
    key_milestones: parsed.traction?.key_milestones || [],
    // New detailed revenue fields - optional
    mrr: parsed.traction?.mrr,
    arr: parsed.traction?.arr,
    revenue_growth_rate: parsed.traction?.revenue_growth_rate,
    // New detailed funding fields - optional
    funding_raised_total: parsed.traction?.funding_raised_total,
    funding_rounds: parsed.traction?.funding_rounds,
    non_dilutive_funding: parsed.traction?.non_dilutive_funding,
    current_funding_round: parsed.traction?.current_funding_round,
    target_funding_amount: parsed.traction?.target_funding_amount,
    loi_count: parsed.traction?.loi_count,
    loi_value: parsed.traction?.loi_value,
    // Competitive advantages
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

export async function runAnalysis(
  startupName: string,
  startupUrl: string,
  extraContext: string = ''
): Promise<Analysis> {
  console.log(`\n🐼 Starting analysis for: ${startupName}`)
  console.log(`📍 Using unified pipeline v3.0`)
  if (extraContext) {
    console.log(`📝 Extra context provided (${extraContext.length} chars)\n`)
  } else {
    console.log(`📝 No extra context provided\n`)
  }

  const initialState: AnalysisState = {
    startup_name: startupName,
    startup_url: startupUrl,
    website_text: '',
    extra_context_raw: extraContext,
    result_json: {},
  }

  // Run through the graph
  let state = initialState

  // Phase 0: Extract structured data from extra context (if provided)
  state = await extractExtraContextNode(state)

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
