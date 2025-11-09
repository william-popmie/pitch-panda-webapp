/**
 * Website Ingestion Node
 * Crawls and extracts text chunks from startup website
 */

import type { StartupState } from '../schemas/startup'
import { crawlWebsite } from '../services/scraper'

/**
 * Ingest website content and populate web_chunks
 *
 * Updates state:
 * - website_html: raw HTML
 * - web_chunks: structured text chunks with provenance
 */
export async function ingestWebsite(state: StartupState): Promise<Partial<StartupState>> {
  console.log(`[IngestWebsite] Starting website ingestion for: ${state.url}`)

  try {
    const { html, chunks } = await crawlWebsite(state.url)

    console.log(`[IngestWebsite] Extracted ${chunks.length} text chunks from website`)

    return {
      website_html: html,
      web_chunks: chunks,
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
