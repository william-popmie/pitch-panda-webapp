import { useState } from 'react'
import './App.css'
import { InputForm } from './InputForm'
import { Result } from './Result'
import { ErrorBoundary } from './ErrorBoundary'
import { Loading } from './Loading'
import { streamAnalysis, processDeckFiles } from '../analysis'
import type { StartupAnalysis } from '../analysis'

interface AnalysisState {
  analysis: StartupAnalysis | null
  memo: string | null
  url: string
  isLoading: boolean
  error: string | null
  warnings: string[]
  progress: number
  currentStage: string
}

function App() {
  const [state, setState] = useState<AnalysisState>({
    analysis: null,
    memo: null,
    url: '',
    isLoading: false,
    error: null,
    warnings: [],
    progress: 0,
    currentStage: '',
  })

  const handleAnalyze = async (request: { url: string; deckFiles: File[] }) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      progress: 0,
      currentStage: 'Starting analysis...',
      url: request.url,
    }))

    try {
      // Process deck files if provided
      const deckSlides =
        request.deckFiles.length > 0 ? await processDeckFiles(request.deckFiles) : undefined

      // Stream the analysis with progress updates
      for await (const update of streamAnalysis({
        url: request.url,
        deck_slides: deckSlides,
      })) {
        if (update.stage === 'complete') {
          // Final result - capture any warnings from the pipeline
          const warnings =
            update.state.errors?.filter(
              err => err.includes('CORS') || err.includes('scraping blocked')
            ) || []

          setState(prev => ({
            ...prev,
            analysis: update.state.final_analysis || null,
            memo: update.state.memo || null,
            warnings: warnings,
            isLoading: false,
            progress: 100,
            currentStage: 'Analysis complete!',
          }))
        } else {
          // Progress update
          setState(prev => ({
            ...prev,
            progress: update.progress,
            currentStage: getStageDescription(update.stage),
          }))
        }
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to analyze startup',
        isLoading: false,
      }))
    }
  }

  const handleReset = () => {
    setState({
      analysis: null,
      memo: null,
      url: '',
      isLoading: false,
      error: null,
      warnings: [],
      progress: 0,
      currentStage: '',
    })
  }

  return (
    <ErrorBoundary>
      <div className="app">
        <header className="app-header">
          <h1>🐼 Pitch Panda</h1>
          <p>VC-Grade Startup Analysis with Multimodal AI</p>
        </header>

        <main className="app-main">
          <InputForm
            onSubmit={req => void handleAnalyze(req)}
            isLoading={state.isLoading}
            progress={state.progress}
            currentStage={state.currentStage}
          />

          {state.isLoading && (
            <Loading
              message="Analyzing startup..."
              progress={state.progress}
              stage={state.currentStage}
            />
          )}

          {state.error && (
            <div
              className="error-message"
              style={{
                padding: '1.5rem',
                backgroundColor: '#fff5f5',
                border: '2px solid #e74c3c',
                borderRadius: '8px',
                margin: '1rem 0',
              }}
            >
              <strong style={{ color: '#e74c3c' }}>⚠️ Error:</strong> {state.error}
              <button
                onClick={handleReset}
                style={{
                  marginLeft: '1rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {state.warnings.length > 0 && !state.isLoading && (
            <div
              style={{
                padding: '1rem',
                backgroundColor: '#fff3e0',
                border: '1px solid #ffe0b2',
                borderRadius: '8px',
                margin: '1rem 0',
              }}
            >
              <strong style={{ color: '#e67e22' }}>⚠️ Warnings:</strong>
              <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
                {state.warnings.map((warning, i) => (
                  <li key={i} style={{ color: '#666', fontSize: '0.9em' }}>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!state.isLoading && state.analysis && state.memo && (
            <Result
              analysis={state.analysis}
              memo={state.memo}
              url={state.url}
              onReset={handleReset}
            />
          )}
        </main>
      </div>
    </ErrorBoundary>
  )
}

// Helper to convert stage names to user-friendly descriptions
function getStageDescription(stage: string): string {
  const stages: Record<string, string> = {
    ingest_website: '🌐 Crawling website and extracting content...',
    ingest_deck: '📄 Processing pitch deck files...',
    deck_vision: '🔍 Analyzing slides with vision AI...',
    extract_evidence: '📊 Extracting evidence and facts...',
    core_analysis: '💡 Analyzing problem and solution...',
    business_analysis: '🏢 Analyzing team, traction, and market...',
    risk_analysis: '⚠️ Identifying risks and gaps...',
    merge_analysis: '🔄 Combining all insights...',
    investment_memo: '📝 Generating investment memo...',
  }
  return stages[stage] || `Processing ${stage}...`
}

export default App
