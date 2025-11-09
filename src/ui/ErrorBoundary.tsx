import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Error boundary component to catch and display errors gracefully
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          style={{
            padding: '2rem',
            backgroundColor: '#fff5f5',
            border: '2px solid #e74c3c',
            borderRadius: '8px',
            margin: '1rem',
          }}
        >
          <h2 style={{ color: '#e74c3c', marginTop: 0 }}>⚠️ Something went wrong</h2>
          <p style={{ fontSize: '0.95em', color: '#666' }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          {this.state.error && (
            <details style={{ marginTop: '1rem' }}>
              <summary style={{ cursor: 'pointer', fontWeight: '600' }}>Error details</summary>
              <pre
                style={{
                  marginTop: '0.5rem',
                  padding: '1rem',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '0.85em',
                }}
              >
                {this.state.error.toString()}
                {this.state.error.stack && `\n\n${this.state.error.stack}`}
              </pre>
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1em',
            }}
          >
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
