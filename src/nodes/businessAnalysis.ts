/**
 * Business Analysis Node
 * Analyzes team, traction, competition, funding, and business model
 */

import { ChatPromptTemplate } from '@langchain/core/prompts'
import type { StartupState } from '../schemas/startup'
import type { Business } from '../schemas/business'
import { BusinessSchema } from '../schemas/business'
import { getStructuredLLM } from '../services/llmClients'

/**
 * System prompt for business analysis
 */
const BUSINESS_ANALYSIS_PROMPT = `You are an expert VC analyst analyzing startup business fundamentals.

Given evidence about a startup, create structured analysis of:

1. **Team**: Who are the key team members? What are their backgrounds, roles, and strengths?
2. **Traction**: What metrics show progress? (users, revenue, growth, etc.) Partnerships? Milestones?
3. **Competition**: Who are the competitors? How does the startup position itself?
4. **Funding**: Funding history, rounds, amounts, investors, current status
5. **Business Model**: How do they make money? Monetization strategy?

**Guidelines:**
- Be factual and specific
- For team: extract member details, highlight relevant experience
- For traction: preserve exact metrics with timeframes
- For competition: list named competitors, summarize positioning
- For funding: structure rounds chronologically
- For business model: be concrete about revenue streams
- If information is missing, use empty arrays or brief note
- Don't speculate beyond evidence`

/**
 * Build evidence context for business analysis
 */
function buildBusinessEvidenceContext(state: StartupState): string {
  const { evidence } = state
  if (!evidence) return 'No evidence available.'

  const sections: string[] = []

  // Team evidence
  if (evidence.team_facts.length > 0) {
    sections.push(
      `**Team:**\n${evidence.team_facts.map((t, i) => `${i + 1}. ${t.name}${t.role ? ` - ${t.role}` : ''}${t.background ? `: ${t.background}` : ''} [Source: ${t.source.kind === 'deck_slide' ? `Slide ${t.source.page}` : t.source.location}]`).join('\n')}`
    )
  }

  // Traction evidence
  if (evidence.traction_facts.length > 0) {
    sections.push(
      `**Traction:**\n${evidence.traction_facts.map((t, i) => `${i + 1}. ${t.metric_type}: ${t.value}${t.timeframe ? ` (${t.timeframe})` : ''}${t.context ? ` - ${t.context}` : ''} [Source: ${t.source.kind === 'deck_slide' ? `Slide ${t.source.page}` : t.source.location}]`).join('\n')}`
    )
  }

  // Competition evidence
  if (evidence.competition_snippets.length > 0) {
    sections.push(
      `**Competition:**\n${evidence.competition_snippets.map((e, i) => `${i + 1}. ${e.text} [Source: ${e.source.kind === 'deck_slide' ? `Slide ${e.source.page}` : e.source.location}]`).join('\n')}`
    )
  }

  // Funding evidence
  if (evidence.funding_facts.length > 0) {
    sections.push(
      `**Funding:**\n${evidence.funding_facts.map((f, i) => `${i + 1}. ${f.round_type || 'Round'}${f.amount ? `: ${f.amount}` : ''}${f.investors && f.investors.length > 0 ? ` from ${f.investors.join(', ')}` : ''}${f.date ? ` (${f.date})` : ''} [Source: ${f.source.kind === 'deck_slide' ? `Slide ${f.source.page}` : f.source.location}]`).join('\n')}`
    )
  }

  // Business model evidence
  if (evidence.business_model_snippets.length > 0) {
    sections.push(
      `**Business Model:**\n${evidence.business_model_snippets.map((e, i) => `${i + 1}. ${e.text} [Source: ${e.source.kind === 'deck_slide' ? `Slide ${e.source.page}` : e.source.location}]`).join('\n')}`
    )
  }

  return sections.join('\n\n')
}

/**
 * Analyze business fundamentals from evidence
 *
 * Updates state:
 * - business: BusinessSchema with team, traction, competition, funding, business_model
 */
export async function businessAnalysis(state: StartupState): Promise<Partial<StartupState>> {
  console.log('[BusinessAnalysis] Starting business analysis')

  try {
    if (!state.evidence) {
      throw new Error('No evidence available for business analysis')
    }

    const evidenceContext = buildBusinessEvidenceContext(state)

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', BUSINESS_ANALYSIS_PROMPT],
      [
        'user',
        `Analyze the business fundamentals from the following evidence:

{evidenceContext}

Create structured analysis of team, traction, competition, funding, and business model.`,
      ],
    ])

    const llm = getStructuredLLM(BusinessSchema)
    const chain = prompt.pipe(llm)

    const business = (await chain.invoke({ evidenceContext })) as Business

    console.log('[BusinessAnalysis] Business analysis complete')
    console.log(`  Team members: ${business.team.members.length}`)
    console.log(`  Traction metrics: ${business.traction.metrics.length}`)
    console.log(`  Competitors identified: ${business.competition.competitors.length}`)
    console.log(`  Funding rounds: ${business.funding.rounds.length}`)

    return {
      business,
    }
  } catch (error) {
    const errorMessage = `Failed to analyze business: ${error instanceof Error ? error.message : String(error)}`
    console.error(`[BusinessAnalysis] ${errorMessage}`)

    return {
      business: null,
      errors: [...state.errors, errorMessage],
    }
  }
}
