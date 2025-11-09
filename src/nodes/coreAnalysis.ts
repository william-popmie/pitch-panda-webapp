/**
 * Core Analysis Node
 * Synthesizes problem, solution, and value proposition from evidence
 */

import { ChatPromptTemplate } from '@langchain/core/prompts'
import type { StartupState } from '../schemas/startup'
import type { Core } from '../schemas/core'
import { CoreSchema } from '../schemas/core'
import { getStructuredLLM } from '../services/llmClients'

/**
 * System prompt for core analysis
 */
const CORE_ANALYSIS_PROMPT = `You are an expert VC analyst synthesizing core startup information.

Given raw evidence snippets about a startup, create a coherent and concise analysis of:
1. **Problem**: What problem are they solving? Who experiences it? What are the pain points?
2. **Solution**: What is their product/service? How does it work? Key features?
3. **Value Proposition**: What unique value do they deliver? Why are they different/better?

**Guidelines:**
- Be concise but complete
- Resolve contradictions where possible; note ambiguities if irreconcilable
- Problem one-liner: 1 sentence
- Solution one-liner: 1 sentence
- Details: 2-4 sentences each
- Use simple, clear language
- Base synthesis on evidence; don't speculate beyond what's stated
- If evidence is thin/missing, say so briefly in the details`

/**
 * Build evidence context for core analysis
 */
function buildCoreEvidenceContext(state: StartupState): string {
  const { evidence } = state
  if (!evidence) return 'No evidence available.'

  const sections: string[] = []

  // Problem evidence
  if (evidence.problem_snippets.length > 0) {
    sections.push(
      `**Problem Evidence:**\n${evidence.problem_snippets.map((e, i) => `${i + 1}. ${e.text} [Source: ${e.source.kind === 'deck_slide' ? `Slide ${e.source.page}` : e.source.location}]`).join('\n')}`
    )
  }

  // Solution evidence
  if (evidence.solution_snippets.length > 0) {
    sections.push(
      `**Solution Evidence:**\n${evidence.solution_snippets.map((e, i) => `${i + 1}. ${e.text} [Source: ${e.source.kind === 'deck_slide' ? `Slide ${e.source.page}` : e.source.location}]`).join('\n')}`
    )
  }

  // Value prop evidence
  if (evidence.value_prop_snippets.length > 0) {
    sections.push(
      `**Value Proposition Evidence:**\n${evidence.value_prop_snippets.map((e, i) => `${i + 1}. ${e.text} [Source: ${e.source.kind === 'deck_slide' ? `Slide ${e.source.page}` : e.source.location}]`).join('\n')}`
    )
  }

  // Market context (helps understand problem)
  if (evidence.market_snippets.length > 0) {
    sections.push(
      `**Market Context:**\n${evidence.market_snippets.map((e, i) => `${i + 1}. ${e.text}`).join('\n')}`
    )
  }

  // Relevant claims
  if (evidence.claims.length > 0) {
    const relevantClaims = evidence.claims.slice(0, 5) // Limit to most relevant
    sections.push(`**Claims:**\n${relevantClaims.map((c, i) => `${i + 1}. ${c.text}`).join('\n')}`)
  }

  return sections.join('\n\n')
}

/**
 * Synthesize core analysis from evidence
 *
 * Updates state:
 * - core: CoreSchema with problem, solution, value_proposition
 */
export async function coreAnalysis(state: StartupState): Promise<Partial<StartupState>> {
  console.log('[CoreAnalysis] Starting core analysis synthesis')

  try {
    if (!state.evidence) {
      throw new Error('No evidence available for core analysis')
    }

    const evidenceContext = buildCoreEvidenceContext(state)

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', CORE_ANALYSIS_PROMPT],
      [
        'user',
        `Synthesize the core problem, solution, and value proposition from the following evidence:

{evidenceContext}

Create a clear, concise analysis.`,
      ],
    ])

    const llm = getStructuredLLM(CoreSchema)
    const chain = prompt.pipe(llm)

    const core = (await chain.invoke({ evidenceContext })) as Core

    console.log('[CoreAnalysis] Core analysis complete')
    console.log(`  Problem: ${core.problem.one_liner}`)
    console.log(`  Solution: ${core.solution.one_liner}`)
    console.log(`  Value Prop: ${core.value_proposition.summary}`)

    return {
      core,
    }
  } catch (error) {
    const errorMessage = `Failed to synthesize core analysis: ${error instanceof Error ? error.message : String(error)}`
    console.error(`[CoreAnalysis] ${errorMessage}`)

    return {
      core: null,
      errors: [...state.errors, errorMessage],
    }
  }
}
