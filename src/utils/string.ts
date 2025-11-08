// Utility functions for URL handling, string formatting, etc.

// Extract domain from URL (e.g., "https://supercity.ai/" -> "supercity.ai")
export function getDomain(url: string): string {
  try {
    // Remove protocol
    let domain = url.replace(/^https?:\/\//, '')
    // Remove trailing slash and path
    domain = domain.split('/')[0]
    // Remove www. prefix
    domain = domain.replace(/^www\./, '')
    return domain.toLowerCase()
  } catch {
    return url.toLowerCase()
  }
}

// Slugify a string for filenames (e.g., "Super City AI" -> "super-city-ai")
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Ensure URL has a scheme
export function ensureScheme(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }
  return url
}

// Get hostname from URL
export function hostname(url: string): string {
  try {
    return new URL(ensureScheme(url)).hostname
  } catch {
    return url
  }
}

/**
 * Extract a likely startup name from a URL domain
 * e.g., "stripe.com" -> "Stripe"
 * e.g., "www.openai.com" -> "OpenAI"
 */
export function extractNameFromDomain(url: string): string {
  try {
    // Parse the URL
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    let domain = urlObj.hostname

    // Remove www. prefix
    domain = domain.replace(/^www\./, '')

    // Get the main domain name (before first dot)
    const mainDomain = domain.split('.')[0]

    // Capitalize first letter of each word (handle cases like "openai" -> "OpenAI")
    return mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1)
  } catch {
    // If URL parsing fails, return a fallback
    return 'Startup'
  }
}
