import { useState } from 'react'
import './App.css'
import { InputForm } from './InputForm'
import { Result } from './Result'
import { analyzeStartup } from '../ai/pipeline'
import { db } from '../data/db'
import type { Analysis, AnalysisRequest } from '../types'

function App() {
  const [currentAnalysis, setCurrentAnalysis] = useState<Analysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = (request: AnalysisRequest) => {
    setIsLoading(true)
    setError(null)

    try {
      // Run analysis
      const analysisData = analyzeStartup(request)

      // Create full analysis with id and timestamp
      const analysis: Analysis = {
        ...analysisData,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      }

      // Save to database
      db.save(analysis)

      // Show result
      setCurrentAnalysis(analysis)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze startup')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setCurrentAnalysis(null)
    setError(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🐼 Pitch Panda</h1>
        <p>Analyze startup problems, solutions, and competition</p>
      </header>

      <main className="app-main">
        <InputForm onSubmit={handleAnalyze} isLoading={isLoading} />

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {currentAnalysis && <Result analysis={currentAnalysis} onReset={handleReset} />}
      </main>
    </div>
  )
}

export default App
