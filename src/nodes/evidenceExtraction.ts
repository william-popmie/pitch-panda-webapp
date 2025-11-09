/**
 * Evidence Extraction Node
 * Extracts grounded facts from web_chunks and deck_structured
 * NO HALLUCINATIONS - only extract what is explicitly stated
 */

import { ChatPromptTemplate } from '@langchain/core/prompts'
import type { StartupState } from '../schemas/startup'
import type { Evidence } from '../schemas/evidence'
import { EvidenceSchema } from '../schemas/evidence'
import { getStructuredLLM } from '../services/llmClients'

/**
 * System prompt for evidence extraction
 */
const EVIDENCE_EXTRACTION_PROMPT = `You are an expert at extracting factual evidence from startup materials for VC analysis.

**CRITICAL RULES:**
1. Extract ONLY explicitly stated facts - no inference, no reasoning, no assumptions
2. If information is not present, leave that field EMPTY
3. Include accurate provenance for every piece of evidence
4. Preserve exact wording where possible (especially for metrics, claims, quotes)
5. Do not interpret or analyze - just extract what is stated

**What to extract:**

**Problem Evidence**: Direct statements about the problem, pain points, customer challenges
**Solution Evidence**: Descriptions of the product/service, how it works, key features
**Value Proposition**: Statements about unique value, benefits, differentiation
**Team Facts**: Names, roles, backgrounds, past experience (must be explicitly stated)
**Competition**: Named competitors, competitive landscape statements
**Funding Facts**: Round types, amounts, investor names, dates
**Traction Facts**: Metrics (users, revenue, growth), partnerships, pilots, LOIs, achievements
**Market Evidence**: Market size claims, TAM/SAM/SOM, industry trends mentioned
**Business Model**: How they make money, pricing, monetization strategy
**Claims**: Any self-reported claims that might need verification

For each piece of evidence, include:
- The actual text/fact
- Source provenance: whether from deck slide (with page number) or website (with location)

Remember: Empty arrays are better than hallucinated data.`

/**
 * Build context string from website chunks
 */
function buildWebsiteContext(chunks: StartupState['web_chunks']): string {
  if (!chunks || chunks.length === 0) return 'No website content available.'

  return chunks
    .map(chunk => {
      return `[Website: ${chunk.location}]\n${chunk.text}\n`
    })
    .join('\n---\n')
}

/**
 * Build context string from structured deck slides
 */
function buildDeckContext(slides: StartupState['deck_structured']): string {
  if (!slides || slides.length === 0) return 'No pitch deck available.'

  return slides
    .map(slide => {
      const parts = [
        `[Slide ${slide.page} - Type: ${slide.slide_type}]`,
        slide.title ? `Title: ${slide.title}` : null,
        slide.main_bullets.length > 0
          ? `Bullets:\n${slide.main_bullets.map(b => `  - ${b}`).join('\n')}`
          : null,
        slide.figures.length > 0
          ? `Figures:\n${slide.figures.map(f => `  - ${f.label}: ${f.value}${f.unit || ''}`).join('\n')}`
          : null,
        slide.logos.length > 0
          ? `Logos: ${slide.logos.map(l => `${l.name}${l.role ? ` (${l.role})` : ''}`).join(', ')}`
          : null,
        slide.claims.length > 0 ? `Claims:\n${slide.claims.map(c => `  - ${c}`).join('\n')}` : null,
        slide.visual_structures.length > 0
          ? `Visuals:\n${slide.visual_structures.map(v => `  - ${v.type}${v.subject ? `: ${v.subject}` : ''}${v.qualitative_trend ? ` (${v.qualitative_trend})` : ''}`).join('\n')}`
          : null,
        slide.caveats.length > 0 ? `Caveats: ${slide.caveats.join('; ')}` : null,
      ]
        .filter(Boolean)
        .join('\n')

      return parts
    })
    .join('\n\n---\n\n')
}

/**
 * Extract evidence from website and deck using structured LLM
 *
 * Updates state:
 * - evidence: EvidenceSchema with all extracted facts and provenance
 */
export async function evidenceExtraction(state: StartupState): Promise<Partial<StartupState>> {
  console.log('[EvidenceExtraction] Starting evidence extraction')

  try {
    // Check if we have any content to analyze
    const hasWebsite = state.web_chunks && state.web_chunks.length > 0
    const hasDeck = state.deck_structured && state.deck_structured.length > 0

    if (!hasWebsite && !hasDeck) {
      console.warn('[EvidenceExtraction] No content available for evidence extraction')
      return {
        evidence: null,
        errors: [
          ...state.errors,
          'No content available for evidence extraction (both website and deck missing)',
        ],
      }
    }

    const websiteContext = buildWebsiteContext(state.web_chunks)
    const deckContext = buildDeckContext(state.deck_structured)

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', EVIDENCE_EXTRACTION_PROMPT],
      [
        'user',
        `Extract all factual evidence from the following startup materials.

**WEBSITE CONTENT:**
{websiteContext}

**PITCH DECK SLIDES:**
{deckContext}

Extract structured evidence with accurate provenance. Only include facts that are explicitly stated.`,
      ],
    ])

    const llm = getStructuredLLM(EvidenceSchema)
    const chain = prompt.pipe(llm)

    const evidence = (await chain.invoke({
      websiteContext,
      deckContext,
    })) as Evidence

    // Log extraction stats
    const stats = {
      problem_snippets: evidence.problem_snippets.length,
      solution_snippets: evidence.solution_snippets.length,
      team_facts: evidence.team_facts.length,
      traction_facts: evidence.traction_facts.length,
      funding_facts: evidence.funding_facts.length,
      competition_snippets: evidence.competition_snippets.length,
      market_snippets: evidence.market_snippets.length,
    }

    console.log('[EvidenceExtraction] Extraction stats:', stats)

    return {
      evidence,
    }
  } catch (error) {
    const errorMessage = `Failed to extract evidence: ${error instanceof Error ? error.message : String(error)}`
    console.error(`[EvidenceExtraction] ${errorMessage}`)

    return {
      evidence: null,
      errors: [...state.errors, errorMessage],
    }
  }
}
