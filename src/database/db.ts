// Simple JSON database using domain as unique key
import type { Analysis } from '../ai/core/schemas'
import { getDomain } from '../utils/string'

// Database structure: { "domain.com": Analysis }
type DatabaseType = Record<string, Analysis>

const DB_KEY = 'pitchpanda_db'

export const db = {
  // Get all analyses
  getAll(): DatabaseType {
    try {
      const data = localStorage.getItem(DB_KEY)
      return data ? (JSON.parse(data) as DatabaseType) : {}
    } catch (error) {
      console.error('Error reading database:', error)
      return {}
    }
  },

  // Get analysis by URL (extracts domain)
  getByUrl(url: string): Analysis | null {
    const domain = getDomain(url)
    const all = this.getAll()
    return all[domain] || null
  },

  // Check if analysis exists for URL
  exists(url: string): boolean {
    const domain = getDomain(url)
    const all = this.getAll()
    return domain in all
  },

  // Save or update analysis (uses domain as key)
  save(url: string, analysis: Analysis): void {
    try {
      const domain = getDomain(url)
      const all = this.getAll()

      // Add metadata
      const now = new Date().toISOString()
      const saved: Analysis = {
        ...analysis,
        sources: [...new Set([url, ...(analysis.sources || [])])], // Ensure URL is in sources
      }

      // If updating, preserve created_at
      if (all[domain]) {
        // Update existing
        all[domain] = {
          ...saved,
          updated_at: now,
        }
      } else {
        // Create new
        all[domain] = {
          ...saved,
          created_at: now,
          updated_at: now,
        }
      }

      localStorage.setItem(DB_KEY, JSON.stringify(all))
      console.log(`💾 Saved analysis for ${domain}`)
    } catch (error) {
      console.error('Error saving to database:', error)
      throw error
    }
  },

  // Delete analysis by URL
  delete(url: string): void {
    try {
      const domain = getDomain(url)
      const all = this.getAll()
      delete all[domain]
      localStorage.setItem(DB_KEY, JSON.stringify(all))
      console.log(`🗑️  Deleted analysis for ${domain}`)
    } catch (error) {
      console.error('Error deleting from database:', error)
      throw error
    }
  },

  // Clear entire database
  clear(): void {
    localStorage.removeItem(DB_KEY)
    console.log('🗑️  Cleared database')
  },

  // Get domain from URL (utility)
  getDomain,
}
