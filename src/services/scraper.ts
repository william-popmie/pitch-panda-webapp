/**
 * Web scraping utilities
 * Fetches and processes website content for analysis
 */

import type { TextChunk } from '../schemas/startup'

/**
 * Scrape a website and extract text chunks
 * NOTE: Browser CORS limitations prevent direct fetching of arbitrary URLs
 * Options:
 * 1. Use a CORS proxy (e.g., https://corsproxy.io/?{url})
 * 2. Implement server-side scraping endpoint
 * 3. Use browser extension with cross-origin permissions
 * For now, we'll try with a CORS proxy as fallback
 */
export async function scrapeWebsite(url: string): Promise<{
  html: string
  chunks: TextChunk[]
}> {
  try {
    // Normalize URL
    const normalizedUrl = normalizeURL(url)

    // Try direct fetch first (works for CORS-enabled sites)
    let response: Response
    let usedProxy = false

    try {
      response = await fetch(normalizedUrl, {
        mode: 'cors',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PitchPanda/1.0)',
        },
      })
    } catch {
      // CORS blocked - try with proxy
      console.warn(`[Scraper] Direct fetch blocked by CORS for ${normalizedUrl}, trying proxy...`)
      try {
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(normalizedUrl)}`
        response = await fetch(proxyUrl)
        usedProxy = true
      } catch {
        console.warn(
          `[Scraper] Proxy also failed for ${normalizedUrl}. Continuing with deck-only analysis.`
        )
        throw new Error('Both direct fetch and proxy failed due to CORS restrictions')
      }
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch ${normalizedUrl}: ${response.statusText}`)
    }

    const html = await response.text()

    // Extract text chunks from HTML
    const chunks = extractTextChunks(html)

    if (usedProxy) {
      console.log(`[Scraper] Successfully fetched ${normalizedUrl} via proxy`)
    } else {
      console.log(`[Scraper] Successfully fetched ${normalizedUrl} directly`)
    }

    return { html, chunks }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.warn(
      `[Scraper] Website scraping failed: ${errorMsg}. Analysis will continue using pitch deck only.`
    )

    // Return empty chunks instead of throwing - allow analysis to continue with deck only
    return {
      html: '',
      chunks: [],
    }
  }
}

/**
 * Extract structured text chunks from HTML
 */
function extractTextChunks(html: string): TextChunk[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  const chunks: TextChunk[] = []

  // Remove script, style, and other non-content elements
  const elementsToRemove = doc.querySelectorAll('script, style, nav, footer, iframe, noscript')
  elementsToRemove.forEach(el => el.remove())

  // Extract main content sections
  const mainContent =
    doc.querySelector('main') || doc.querySelector('article') || doc.querySelector('body')

  if (!mainContent) {
    return chunks
  }

  // Extract text from headings and paragraphs
  const sections = mainContent.querySelectorAll('h1, h2, h3, p, li, blockquote')

  let currentSection = ''
  let sectionTexts: string[] = []

  sections.forEach(element => {
    const text = element.textContent?.trim()
    if (!text) return

    // Detect section boundaries
    if (element.tagName.match(/H[1-3]/)) {
      // Save previous section
      if (sectionTexts.length > 0) {
        chunks.push({
          id: `chunk-${chunks.length}`,
          text: sectionTexts.join('\n'),
          source_type: 'website',
          location: currentSection || '/',
        })
        sectionTexts = []
      }
      currentSection = text
    }

    sectionTexts.push(text)
  })

  // Save final section
  if (sectionTexts.length > 0) {
    chunks.push({
      id: `chunk-${chunks.length}`,
      text: sectionTexts.join('\n'),
      source_type: 'website',
      location: currentSection || '/',
    })
  }

  return chunks
}

/**
 * Normalize URL to ensure proper format
 */
function normalizeURL(url: string): string {
  // Add protocol if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }

  try {
    const urlObj = new URL(url)
    return urlObj.href
  } catch {
    throw new Error(`Invalid URL: ${url}`)
  }
}

/**
 * Crawl multiple pages of a website
 * In production, use a proper crawler service
 */
export async function crawlWebsite(startUrl: string): Promise<{
  html: string
  chunks: TextChunk[]
}> {
  // For MVP, just scrape the main page
  // In production, implement breadth-first crawling of key pages
  const { html, chunks } = await scrapeWebsite(startUrl)

  // TODO: Implement crawling of /about, /product, /team, etc.
  // This would require:
  // 1. Extract links from main page
  // 2. Filter for relevant pages (same domain, key paths)
  // 3. Scrape each page
  // 4. Combine chunks with proper location metadata

  return { html, chunks }
}

/**
 * Clean HTML for storage
 */
export function cleanHTML(html: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Remove scripts, styles, and other non-content
  const elementsToRemove = doc.querySelectorAll(
    'script, style, nav, footer, iframe, noscript, meta, link'
  )
  elementsToRemove.forEach(el => el.remove())

  return doc.body.innerHTML
}

/**
 * Use a CORS proxy for client-side scraping
 * In production, move scraping to backend
 */
export function useCORSProxy(url: string): string {
  // Option 1: Use a public CORS proxy (not recommended for production)
  // return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`

  // Option 2: Use your own proxy
  // return `/api/proxy?url=${encodeURIComponent(url)}`

  // For now, return original URL and handle CORS on backend
  return url
}
