/**
 * Merge Analysis Node
 * Pure function that combines all analysis into final StartupAnalysis
 */

import type { StartupState, StartupAnalysis } from '../schemas/startup'

/**
 * Merge all analysis stages into final StartupAnalysis structure
 *
 * This is a pure function with no LLM calls - just data transformation
 *
 * Updates state:
 * - final_analysis: Complete StartupAnalysis object
 */
export function mergeAnalysis(state: StartupState): Partial<StartupState> {
  console.log('[MergeAnalysis] Merging all analysis stages')

  try {
    if (!state.core || !state.business || !state.risk) {
      throw new Error('Core, business, and risk analysis required for merge')
    }

    const { core, business, risk } = state

    const finalAnalysis: StartupAnalysis = {
      startup_id: state.startup_id,
      url: state.url,

      // Core analysis
      problem: core.problem,
      solution: core.solution,
      value_proposition: core.value_proposition,

      // Business analysis
      team: business.team,
      traction: business.traction,
      competition: business.competition,
      funding: business.funding,
      business_model: business.business_model,

      // Risk analysis
      risks: risk.risks,
      missing_info: risk.missing_info,

      // Metadata
      evidence_summary: buildEvidenceSummary(state),
      analyzed_at: new Date().toISOString(),
    }

    console.log('[MergeAnalysis] Final analysis structure complete')

    return {
      final_analysis: finalAnalysis,
    }
  } catch (error) {
    const errorMessage = `Failed to merge analysis: ${error instanceof Error ? error.message : String(error)}`
    console.error(`[MergeAnalysis] ${errorMessage}`)

    return {
      final_analysis: null,
      errors: [...state.errors, errorMessage],
    }
  }
}

/**
 * Build a brief evidence quality summary
 */
function buildEvidenceSummary(state: StartupState): string {
  if (!state.evidence) return 'No evidence available'

  const { evidence } = state
  const parts: string[] = []

  // Count total evidence items
  const totalEvidence =
    evidence.problem_snippets.length +
    evidence.solution_snippets.length +
    evidence.team_facts.length +
    evidence.traction_facts.length +
    evidence.funding_facts.length +
    evidence.competition_snippets.length +
    evidence.market_snippets.length

  parts.push(`Total evidence items: ${totalEvidence}`)

  // Deck vs website balance
  let deckEvidence = 0
  let websiteEvidence = 0

  const countSources = (items: Array<{ source: { kind: string } }>) => {
    items.forEach(item => {
      if (item.source.kind === 'deck_slide') deckEvidence++
      if (item.source.kind === 'website') websiteEvidence++
    })
  }

  countSources(evidence.problem_snippets)
  countSources(evidence.solution_snippets)
  countSources(evidence.value_prop_snippets)
  countSources(evidence.competition_snippets)
  countSources(evidence.market_snippets)
  countSources(evidence.business_model_snippets)
  countSources(evidence.claims)

  parts.push(`Sources - Deck: ${deckEvidence}, Website: ${websiteEvidence}`)

  // Coverage assessment
  const coverage: string[] = []
  if (evidence.problem_snippets.length > 0) coverage.push('problem')
  if (evidence.solution_snippets.length > 0) coverage.push('solution')
  if (evidence.team_facts.length > 0) coverage.push('team')
  if (evidence.traction_facts.length > 0) coverage.push('traction')
  if (evidence.funding_facts.length > 0) coverage.push('funding')
  if (evidence.competition_snippets.length > 0) coverage.push('competition')

  parts.push(`Coverage: ${coverage.join(', ')}`)

  return parts.join('. ')
}
