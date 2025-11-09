/**
 * Investment Memo Node
 * Generates human-readable investment memo from structured analysis
 */

import { ChatPromptTemplate } from '@langchain/core/prompts'
import type { StartupState } from '../schemas/startup'
import { getTextLLM } from '../services/llmClients'

/**
 * System prompt for memo generation
 */
const MEMO_GENERATION_PROMPT = `You are a neutral VC analyst writing factual investment memos.

CRITICAL - MAINTAIN COMPLETE NEUTRALITY:
- Report facts exactly as presented in the data
- Do NOT add promotional language or positive spin
- Do NOT embellish achievements or make them sound more impressive
- Use neutral, objective language throughout
- Avoid superlatives like "impressive", "excellent", "strong" unless quoting directly
- Don't interpret facts - just state them
- Remember: You are INFORMING investors with facts, not SELLING them on the opportunity

Given a structured startup analysis, create a concise, professional investment memo.

**Structure:**

1. **Executive Summary** (2-3 paragraphs)
   - Company name and URL
   - One-liner: what they do and for whom
   - Problem/solution in brief
   - Key traction highlights (factual metrics only)
   - Investment thesis snapshot (neutral assessment)

2. **The Opportunity**
   - Problem space (as stated, no embellishment)
   - Solution overview (factual description)
   - Value proposition (as claimed by company)
   - Market context (if available)

3. **Business Fundamentals**
   - Product/service details
   - Business model (factual description)
   - Traction & metrics (numbers without interpretation)
   - Go-to-market approach (if present)

4. **Team**
   - Key team members with titles
   - Background facts (e.g., "previously at X", "has Y years experience")
   - Do NOT add interpretations like "impressive background" or "strong expertise"
   - State facts: "has 10 years at Google" not "extensive experience at Google"

5. **Competition & Positioning**
   - Competitive landscape (factual)
   - Differentiation (as claimed by company)
   - Defensibility factors mentioned

6. **Traction**
   - Key metrics with numbers (report as-is, no spin)
   - Partnerships and customers (names and types)
   - Milestones achieved (factual dates and events)
   - Use neutral language: "has 1000 users" not "achieved 1000 users"

7. **Funding**
   - Funding history (amounts and dates)
   - Current raise (if applicable)
   - Use of funds (if mentioned)
   - Neutral language: "raised $1M" not "successfully raised $1M"

8. **Investment Considerations**

   **Pros:**
   - Bulleted list of factual positive signals (no embellishment)
   - Example: "Has 50% MoM growth" not "Strong 50% MoM growth"
   
   **Cons / Risks:**
   - Bulleted list of risks and concerns (factual)
   
   **Missing Information / Open Questions:**
   - Bulleted list of critical info gaps

9. **Recommendation**
   - Classification: "Pass", "Track", "Take Intro Call", or "Deep Dive"
   - 1-2 sentence factual rationale (no promotional language)

**Tone:**
- Professional and objective
- Analytical but not overly technical
- Balanced: present facts without bias toward positive or negative
- Specific: use actual metrics, names, dates when available
- NEUTRAL: avoid marketing language, superlatives, and promotional spin

**Examples of Neutral vs Biased Language:**
- ❌ "Successfully raised $2M" → ✅ "Raised $2M"
- ❌ "Impressive team with strong backgrounds" → ✅ "Team includes former employees of X and Y"
- ❌ "Achieved 100K users" → ✅ "Has 100K users"
- ❌ "Excellent traction" → ✅ "Current metrics show..."

**Length:** Aim for 600-1000 words total.`

/**
 * Build structured data for memo generation
 */
function buildMemoContext(state: StartupState): string {
  const { final_analysis } = state
  if (!final_analysis) return 'No analysis available'

  const sections: string[] = []

  // Basic info
  sections.push(`**Startup:** ${final_analysis.url}
**Analyzed:** ${new Date(final_analysis.analyzed_at).toLocaleDateString()}`)

  // Problem/Solution/Value Prop
  sections.push(`**PROBLEM:**
${final_analysis.problem.one_liner}
${final_analysis.problem.details}
Target users: ${final_analysis.problem.target_users}
Pain points: ${final_analysis.problem.pain_points.join(', ')}`)

  sections.push(`**SOLUTION:**
${final_analysis.solution.one_liner}
${final_analysis.solution.details}
Features: ${final_analysis.solution.features.join(', ')}`)

  sections.push(`**VALUE PROPOSITION:**
${final_analysis.value_proposition.summary}
Benefits: ${final_analysis.value_proposition.key_benefits.join(', ')}`)

  // Team
  sections.push(`**TEAM:**
Size: ${final_analysis.team.size || 'Not specified'}
Key members:
${final_analysis.team.members.map(m => `- ${m.name} (${m.role})${m.background ? ': ' + m.background : ''}\n  Strengths: ${m.strengths.join(', ')}`).join('\n')}
${final_analysis.team.collective_expertise ? `Collective expertise: ${final_analysis.team.collective_expertise}` : ''}`)

  // Traction
  sections.push(`**TRACTION:**
Metrics:
${final_analysis.traction.metrics.map(m => `- ${m.metric}: ${m.value}${m.trend ? ` (${m.trend})` : ''}${m.timeframe ? ` [${m.timeframe}]` : ''}`).join('\n')}
Partnerships:
${final_analysis.traction.partnerships.map(p => `- ${p.name} (${p.type})${p.details ? `: ${p.details}` : ''}`).join('\n')}
Milestones:
${final_analysis.traction.milestones.map(m => `- ${m}`).join('\n')}`)

  // Competition
  sections.push(`**COMPETITION:**
Positioning: ${final_analysis.competition.positioning}
Competitors:
${final_analysis.competition.competitors.map(c => `- ${c.name}${c.description ? `: ${c.description}` : ''}${c.differentiation ? ` | Differentiation: ${c.differentiation}` : ''}`).join('\n')}
${final_analysis.competition.notes ? `Notes: ${final_analysis.competition.notes}` : ''}`)

  // Funding
  sections.push(`**FUNDING:**
Status: ${final_analysis.funding.status}
Rounds:
${final_analysis.funding.rounds.map(r => `- ${r.type}${r.amount ? `: ${r.amount}` : ''}${r.investors && r.investors.length > 0 ? ` from ${r.investors.join(', ')}` : ''}${r.date ? ` (${r.date})` : ''}`).join('\n')}
${final_analysis.funding.notes ? `Notes: ${final_analysis.funding.notes}` : ''}`)

  // Business Model
  sections.push(`**BUSINESS MODEL:**
${final_analysis.business_model.summary || 'Not clearly defined'}
${final_analysis.business_model.monetization && final_analysis.business_model.monetization.length > 0 ? `Monetization: ${final_analysis.business_model.monetization.join(', ')}` : ''}`)

  // Risks
  const risksByCategory = final_analysis.risks.reduce(
    (acc, r) => {
      if (!acc[r.category]) acc[r.category] = []
      acc[r.category].push(r)
      return acc
    },
    {} as Record<string, typeof final_analysis.risks>
  )

  sections.push(`**RISKS:**
${Object.entries(risksByCategory)
  .map(
    ([category, risks]) =>
      `${category.toUpperCase()}:\n${risks.map(r => `- ${r.description}${r.severity ? ` [${r.severity}]` : ''}`).join('\n')}`
  )
  .join('\n\n')}`)

  // Missing info
  sections.push(`**MISSING INFORMATION:**
${final_analysis.missing_info.map(m => `- ${m}`).join('\n')}`)

  return sections.join('\n\n')
}

/**
 * Generate investment memo from final analysis
 *
 * Updates state:
 * - memo: Human-readable markdown memo
 */
export async function investmentMemo(state: StartupState): Promise<Partial<StartupState>> {
  console.log('[InvestmentMemo] Generating investment memo')

  try {
    if (!state.final_analysis) {
      throw new Error('Final analysis required for memo generation')
    }

    const memoContext = buildMemoContext(state)

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', MEMO_GENERATION_PROMPT],
      [
        'user',
        `Generate a professional investment memo from this structured analysis:

{memoContext}

Write a clear, balanced, actionable investment memo.`,
      ],
    ])

    const llm = getTextLLM({ temperature: 0.3, maxTokens: 2000 })
    const chain = prompt.pipe(llm)

    const response = await chain.invoke({ memoContext })
    const memo = typeof response === 'string' ? response : response.content

    console.log('[InvestmentMemo] Memo generated successfully')
    console.log(`  Length: ${(memo as string).length} characters`)

    return {
      memo: memo as string,
    }
  } catch (error) {
    const errorMessage = `Failed to generate memo: ${error instanceof Error ? error.message : String(error)}`
    console.error(`[InvestmentMemo] ${errorMessage}`)

    return {
      memo: null,
      errors: [...state.errors, errorMessage],
    }
  }
}
