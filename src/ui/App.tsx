import { useState } from 'react'
import './App.css'
import { InputForm } from './InputForm'
import { Result } from './Result'
import { runAnalysis } from '../ai/orchestration/graph'
import type { Analysis } from '../ai/core/schemas'

interface AnalysisWithMeta extends Analysis {
  startup_name: string
  startup_url: string
}

function App() {
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisWithMeta | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async (request: { startup_name: string; startup_url: string }) => {
    setIsLoading(true)
    setError(null)

    try {
      // Run analysis
      const analysisData = await runAnalysis(request.startup_name, request.startup_url)

      // Add startup info to analysis
      const analysis: AnalysisWithMeta = {
        ...analysisData,
        startup_name: request.startup_name,
        startup_url: request.startup_url,
      }

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
        <InputForm onSubmit={req => void handleAnalyze(req)} isLoading={isLoading} />

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
