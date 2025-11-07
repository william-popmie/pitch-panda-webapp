// Main analysis graph/pipeline - mimics LangGraph structure
// Version: 2.0 (Unified CLI + Webapp)

import type { Analysis, AnalysisState, Competitor } from '../core/schemas'
import { fetchWebsiteText } from '../../utils/web'
import { formatProblemSolutionPrompt } from '../prompts/problem_solution'
import { formatCompetitionPrompt } from '../prompts/competition'
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
  state = await fetchNode(state)
  state = await analyzeNode(state)
  state = validateNode(state)
  state = await competitionNode(state)

  return state.result_json as Analysis
}
