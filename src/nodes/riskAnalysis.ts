/**
 * Risk Analysis Node
 * Identifies risks and missing critical information
 */

import { ChatPromptTemplate } from '@langchain/core/prompts'
import type { StartupState } from '../schemas/startup'
import type { Risk } from '../schemas/risk'
import { RiskSchema } from '../schemas/risk'
import { getStructuredLLM } from '../services/llmClients'

/**
 * System prompt for risk analysis
 */
const RISK_ANALYSIS_PROMPT = `You are a neutral VC analyst identifying investment risks and information gaps.

CRITICAL - MAINTAIN OBJECTIVITY:
- Identify risks based on facts and gaps in the data
- Do NOT exaggerate or downplay risks
- Be specific and factual - avoid dramatic language
- State risks neutrally: "No revenue data provided" not "Concerning lack of revenue data"
- Remember: You are INFORMING investors about risks, not alarming or reassuring them

Given a startup's core analysis, business analysis, and evidence, identify:

1. **Risks**: Categorized investment risks
   - Market risk: market size, timing, adoption challenges
   - Team risk: experience gaps, key person dependency
   - Competition risk: competitive threats, defensibility
   - Technology risk: technical feasibility, IP, scalability
   - Business model risk: monetization uncertainty, unit economics
   - Execution risk: GTM, operational challenges
   - Regulatory risk: compliance, legal issues
   - Financial risk: burn rate, runway, capital needs

2. **Missing Information**: Critical data points not found in deck/website
   - No revenue data
   - No GTM strategy
   - No customer acquisition metrics
   - No competitive analysis
   - No detailed team backgrounds
   - etc.

**Guidelines:**
- Be specific and actionable
- Categorize risks appropriately
- Assess severity based on objective factors (low, medium, high, critical)
- Focus on material investment risks, not minor concerns
- For missing info: list specific factual questions an investor would ask
- Use neutral language - state facts without adding interpretive adjectives
- Every startup has risks - report them objectively without bias`

/**
 * Build analysis summary for risk assessment
 */
function buildRiskContext(state: StartupState): string {
  const sections: string[] = []

  // Core analysis
  if (state.core) {
    sections.push(`**Problem/Solution:**
Problem: ${state.core.problem.one_liner}
Solution: ${state.core.solution.one_liner}
Value Prop: ${state.core.value_proposition.summary}`)
  }

  // Business fundamentals
  if (state.business) {
    const { team, traction, competition, funding, business_model } = state.business

    sections.push(`**Team:**
Size: ${team.size || 'Unknown'}
Members: ${team.members.length} key members identified
${team.members.map(m => `- ${m.name} (${m.role})`).join('\n')}`)

    sections.push(`**Traction:**
Metrics: ${traction.metrics.length > 0 ? traction.metrics.map(m => `${m.metric}: ${m.value}`).join(', ') : 'None reported'}
Partnerships: ${traction.partnerships.length} partnerships
Milestones: ${traction.milestones.length} milestones`)

    sections.push(`**Competition:**
Competitors: ${competition.competitors.length} identified
Positioning: ${competition.positioning}`)

    sections.push(`**Funding:**
Rounds: ${funding.rounds.length} rounds
Status: ${funding.status}`)

    sections.push(`**Business Model:**
${business_model.summary || 'Not clearly defined'}
Monetization: ${business_model.monetization?.join(', ') || 'Not specified'}`)
  }

  // Evidence quality indicators
  if (state.evidence) {
    const { evidence } = state
    sections.push(`**Evidence Coverage:**
Problem snippets: ${evidence.problem_snippets.length}
Solution snippets: ${evidence.solution_snippets.length}
Team facts: ${evidence.team_facts.length}
Traction facts: ${evidence.traction_facts.length}
Funding facts: ${evidence.funding_facts.length}
Competition snippets: ${evidence.competition_snippets.length}
Market snippets: ${evidence.market_snippets.length}`)
  }

  return sections.join('\n\n')
}

/**
 * Identify risks and missing information
 *
 * Updates state:
 * - risk: RiskSchema with categorized risks and missing_info
 */
export async function riskAnalysis(state: StartupState): Promise<Partial<StartupState>> {
  console.log('[RiskAnalysis] Starting risk analysis')

  try {
    if (!state.core || !state.business) {
      throw new Error('Core and business analysis required for risk assessment')
    }

    const analysisContext = buildRiskContext(state)

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', RISK_ANALYSIS_PROMPT],
      [
        'user',
        `Identify investment risks and missing critical information:

{analysisContext}

Provide categorized risks with severity levels and a list of missing information.`,
      ],
    ])

    const llm = getStructuredLLM(RiskSchema)
    const chain = prompt.pipe(llm)

    const risk = (await chain.invoke({ analysisContext })) as Risk

    console.log('[RiskAnalysis] Risk analysis complete')
    console.log(`  Risks identified: ${risk.risks.length}`)
    console.log(`  Missing info items: ${risk.missing_info.length}`)

    // Log risk categories
    const riskCategories = risk.risks.reduce(
      (acc, r) => {
        acc[r.category] = (acc[r.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
    console.log('  Risk categories:', riskCategories)

    return {
      risk,
    }
  } catch (error) {
    const errorMessage = `Failed to analyze risks: ${error instanceof Error ? error.message : String(error)}`
    console.error(`[RiskAnalysis] ${errorMessage}`)

    return {
      risk: null,
      errors: [...state.errors, errorMessage],
    }
  }
}
