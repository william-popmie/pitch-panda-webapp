/**
 * Website Ingestion Node
 * Uses AI-powered web research to extract startup information
 */

import { ChatPromptTemplate } from '@langchain/core/prompts'
import type { StartupState, TextChunk } from '../schemas/startup'
import { getTextLLM } from '../services/llmClients'
import { crawlWebsite } from '../services/scraper'

const WEB_RESEARCH_PROMPT = `You are a neutral VC analyst conducting due diligence on a startup. Your job is to extract FACTUAL information ONLY.

CRITICAL RULES:
- Be completely objective and unbiased
- Extract only facts explicitly stated on the website
- Do NOT embellish, interpret, or add positive spin
- Do NOT make the startup sound better than the facts suggest
- Report what you find, not what sounds impressive
- Include both strengths AND weaknesses if mentioned
- If information is missing or vague, note that

EXTRACT THESE FACTS:
1. **Problem**: What problem is stated? (exact claims only)
2. **Solution**: What do they actually offer? (features, not marketing hype)
3. **Product**: What is the actual product/service?
4. **Team**: Names, roles, backgrounds (factual experience only)
5. **Traction**: Actual numbers, customers, partnerships (verify claims are specific)
6. **Funding**: Rounds, amounts, investors (only if explicitly stated)
7. **Market**: Target market, industry (what they say, not assumptions)
8. **Business Model**: How they make money (actual model, not potential)

For each fact, note the source section/page. If something is unclear or not stated, write "Not specified" - do NOT fill in gaps.

Remember: You are INFORMING investors, not CONVINCING them. Neutral facts only.`

/**
 * Use AI to research and extract information from a startup website
 * This bypasses CORS issues by using OpenAI's web browsing capabilities
 */
async function aiWebResearch(url: string): Promise<TextChunk[]> {
  console.log(`[AI-WebResearch] Using AI to research ${url}`)

  try {
    const llm = getTextLLM({ temperature: 0.3 })

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', WEB_RESEARCH_PROMPT],
      [
        'user',
        `Research this startup's website and extract all relevant information: ${url}

Please browse the website thoroughly and provide structured information about the company.`,
      ],
    ])

    const chain = prompt.pipe(llm)
    const response = await chain.invoke({})

    const content = typeof response.content === 'string' ? response.content : ''

    // Parse the AI response into structured chunks
    const chunks: TextChunk[] = []
    const sections = content.split('\n\n').filter(s => s.trim())

    sections.forEach((section, index) => {
      if (section.trim().length > 50) {
        // Only keep substantial content
        chunks.push({
          id: `ai-research-${index}`,
          text: section.trim(),
          source_type: 'website',
          location: url,
        })
      }
    })

    console.log(`[AI-WebResearch] Extracted ${chunks.length} information chunks`)
    return chunks
  } catch (error) {
    console.error('[AI-WebResearch] Failed:', error)
    return []
  }
}

/**
 * Ingest website content using both AI research and traditional scraping
 *
 * Updates state:
 * - website_html: raw HTML (from scraping, if successful)
 * - web_chunks: structured text chunks from AI research + scraping
 */
export async function ingestWebsite(state: StartupState): Promise<Partial<StartupState>> {
  console.log(`[IngestWebsite] Starting website ingestion for: ${state.url}`)

  try {
    // Run both AI research and traditional scraping in parallel
    const [aiChunks, scrapingResult] = await Promise.all([
      aiWebResearch(state.url),
      crawlWebsite(state.url).catch((err: unknown) => {
        const errMsg = err instanceof Error ? err.message : String(err)
        console.warn(`[IngestWebsite] Traditional scraping failed: ${errMsg}`)
        return { html: '', chunks: [] }
      }),
    ])

    // Combine chunks from both sources
    const allChunks = [...aiChunks, ...scrapingResult.chunks]

    if (allChunks.length === 0) {
      console.warn(
        `[IngestWebsite] No content extracted from website (both AI research and scraping failed)`
      )
      return {
        website_html: null,
        web_chunks: [],
        errors: [
          ...state.errors,
          `Unable to extract website information. Analysis will proceed using pitch deck only.`,
        ],
      }
    }

    console.log(
      `[IngestWebsite] Extracted ${allChunks.length} text chunks (${aiChunks.length} from AI, ${scrapingResult.chunks.length} from scraping)`
    )

    return {
      website_html: scrapingResult.html || null,
      web_chunks: allChunks,
    }
  } catch (error) {
    const errorMessage = `Failed to ingest website: ${error instanceof Error ? error.message : String(error)}`
    console.error(`[IngestWebsite] ${errorMessage}`)

    return {
      website_html: null,
      web_chunks: [],
      errors: [...state.errors, errorMessage],
    }
  }
}
