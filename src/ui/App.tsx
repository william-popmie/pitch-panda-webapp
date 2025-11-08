import { useState } from 'react'
import './App.css'
import { InputForm } from './InputForm'
import { Result } from './Result'
import { runAnalysis } from '../ai/orchestration/graph'
import { analyzeMultipleImages } from '../ai/vision/image-analyzer'
import { db } from '../database/db'
import type { Analysis } from '../ai/core/schemas'

interface AnalysisWithMeta extends Analysis {
  startup_name: string
  startup_url: string
}

function App() {
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisWithMeta | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async (request: {
    startup_name: string
    startup_url: string
    extra_context?: string
    images?: File[]
  }) => {
    setIsLoading(true)
    setError(null)

    try {
      // Process images first if any were uploaded
      let imageContext = ''
      if (request.images && request.images.length > 0) {
        console.log(`🖼️  Processing ${request.images.length} image(s)...`)
        imageContext = await analyzeMultipleImages(request.images)
      }

      // Combine extra context with image analysis
      let combinedContext = request.extra_context || ''
      if (imageContext) {
        combinedContext = combinedContext
          ? `${combinedContext}\n\n---\n\n## DATA EXTRACTED FROM IMAGES:\n\n${imageContext}`
          : `## DATA EXTRACTED FROM IMAGES:\n\n${imageContext}`
      }

      // Check if we already have this analysis in the database
      const cached = db.getByUrl(request.startup_url)

      if (cached) {
        console.log('📦 Found cached analysis for', db.getDomain(request.startup_url))
        const analysis: AnalysisWithMeta = {
          ...cached,
          startup_name: request.startup_name,
          startup_url: request.startup_url,
        }
        setCurrentAnalysis(analysis)
        setIsLoading(false)
        return
      }

      // Run new analysis with combined context
      console.log('🔍 Running new analysis...')
      const analysisData = await runAnalysis(
        request.startup_name,
        request.startup_url,
        combinedContext
      )

      // Save to database
      db.save(request.startup_url, analysisData)

      // Add startup info and show result
      const analysis: AnalysisWithMeta = {
        ...analysisData,
        startup_name: request.startup_name,
        startup_url: request.startup_url,
      }

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
