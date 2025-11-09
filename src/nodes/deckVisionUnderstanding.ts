/**
 * Deck Vision Understanding Node
 * Uses multimodal LLM to extract structured data from slide images
 */

import { HumanMessage } from '@langchain/core/messages'
import type { StartupState } from '../schemas/startup'
import type { Slide } from '../schemas/deck'
import { SlideSchema } from '../schemas/deck'
import { getStructuredVisionLLM, batchProcess } from '../services/llmClients'

/**
 * System prompt for slide analysis
 */
const SLIDE_ANALYSIS_PROMPT = `You are an expert at analyzing pitch deck slides for venture capital analysis.

Your task is to extract structured information from a pitch deck slide image.

Look for:
1. **Slide Type**: Classify the slide (problem, solution, team, traction, market, competition, product, roadmap, financials, funding, other)
2. **Title**: The main title or heading
3. **Bullets**: Main text points or content blocks
4. **Figures**: Quantitative metrics, numbers, percentages (e.g., "$2M ARR", "10,000 users", "50% YoY growth")
5. **Logos**: Company logos, partner logos, customer logos - identify the name and their role (customer, partner, investor, competitor)
6. **Claims**: Explicit self-reported statements (e.g., "First to market", "AI-powered", "Patent pending")
7. **Visual Structures**: Charts, graphs, diagrams - describe what they show and any visible trends
8. **Caveats**: Disclaimers, footnotes, asterisks, qualifying statements

Be precise and extract only what is explicitly shown. Do not infer or hallucinate.
If a field has no data, return an empty array or null.`

/**
 * Analyze a single slide using vision LLM
 */
async function analyzeSlide(imageDataUrl: string, pageNum: number): Promise<Slide> {
  const llm = getStructuredVisionLLM(SlideSchema)

  const message = new HumanMessage({
    content: [
      {
        type: 'text',
        text: `${SLIDE_ANALYSIS_PROMPT}\n\nAnalyze slide ${pageNum}:`,
      },
      {
        type: 'image_url',
        image_url: {
          url: imageDataUrl,
        },
      },
    ],
  })

  const result = (await llm.invoke([message])) as Slide

  // Ensure page number is set correctly
  return {
    ...result,
    page: pageNum,
  }
}

/**
 * Process all deck slides with vision LLM
 *
 * Updates state:
 * - deck_structured: array of structured SlideSchema objects
 */
export async function deckVisionUnderstanding(state: StartupState): Promise<Partial<StartupState>> {
  console.log(`[DeckVisionUnderstanding] Analyzing ${state.deck_slides?.length || 0} slides`)

  try {
    if (!state.deck_slides || state.deck_slides.length === 0) {
      console.warn('[DeckVisionUnderstanding] No deck slides to analyze')
      return {
        deck_structured: [],
      }
    }

    // Process slides in batches with concurrency control
    const structuredSlides = await batchProcess(
      state.deck_slides,
      async slide => {
        console.log(`[DeckVisionUnderstanding] Analyzing slide ${slide.page}`)
        return analyzeSlide(slide.imageDataUrl, slide.page)
      },
      3 // Process 3 slides concurrently
    )

    // Sort by page number
    structuredSlides.sort((a, b) => a.page - b.page)

    console.log(`[DeckVisionUnderstanding] Successfully analyzed ${structuredSlides.length} slides`)

    // Log slide types for debugging
    const slideTypes = structuredSlides.map(s => `${s.page}:${s.slide_type}`).join(', ')
    console.log(`[DeckVisionUnderstanding] Slide types: ${slideTypes}`)

    return {
      deck_structured: structuredSlides,
    }
  } catch (error) {
    const errorMessage = `Failed to analyze deck slides: ${error instanceof Error ? error.message : String(error)}`
    console.error(`[DeckVisionUnderstanding] ${errorMessage}`)

    return {
      deck_structured: [],
      errors: [...state.errors, errorMessage],
    }
  }
}
