// Simple JSON file-based database
import type { Analysis } from '../types'

const DB_KEY = 'pitchpanda_analyses'

export const db = {
  // Get all analyses
  getAll(): Analysis[] {
    try {
      const data = localStorage.getItem(DB_KEY)
      return data ? (JSON.parse(data) as Analysis[]) : []
    } catch (error) {
      console.error('Error reading from database:', error)
      return []
    }
  },

  // Get analysis by id
  getById(id: string): Analysis | null {
    const analyses = this.getAll()
    return analyses.find(a => a.id === id) || null
  },

  // Save new analysis
  save(analysis: Analysis): void {
    try {
      const analyses = this.getAll()
      analyses.push(analysis)
      localStorage.setItem(DB_KEY, JSON.stringify(analyses))
    } catch (error) {
      console.error('Error saving to database:', error)
      throw error
    }
  },

  // Delete analysis by id
  delete(id: string): void {
    try {
      const analyses = this.getAll().filter(a => a.id !== id)
      localStorage.setItem(DB_KEY, JSON.stringify(analyses))
    } catch (error) {
      console.error('Error deleting from database:', error)
      throw error
    }
  },

  // Clear all analyses
  clear(): void {
    localStorage.removeItem(DB_KEY)
  },
}
