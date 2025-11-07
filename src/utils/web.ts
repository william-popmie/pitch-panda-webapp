// Web fetching utilities

const DEFAULT_UA = 'Mozilla/5.0 (PitchPanda/1.0; +https://pitchpanda.local)'

export function ensureScheme(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }
  return url
}

export async function fetchWebsiteText(url: string, maxChars: number = 10000): Promise<string> {
  const fullUrl = ensureScheme(url)

  try {
    // Detect if running in browser (has window) or Node.js
    const isBrowser = typeof window !== 'undefined'

    if (isBrowser) {
      // In browser: Use a CORS proxy
      console.warn('⚠️  Browser detected: Using CORS proxy to fetch website')
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(fullUrl)}`

      const response = await fetch(proxyUrl, {
        headers: {
          'User-Agent': DEFAULT_UA,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const html = await response.text()

      // Basic text extraction
      const text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      return text.substring(0, maxChars) || '(No readable text found on homepage.)'
    } else {
      // In Node.js: Direct fetch
      const response = await fetch(fullUrl, {
        headers: {
          'User-Agent': DEFAULT_UA,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const html = await response.text()

      // Basic text extraction
      const text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      return text.substring(0, maxChars) || '(No readable text found on homepage.)'
    }
  } catch (error) {
    console.error('Error fetching website:', error)
    return `(Error fetching site: ${error instanceof Error ? error.message : 'Unknown error'})`
  }
}
