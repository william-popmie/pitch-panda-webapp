import type { ImageAnalysisResult } from '../ai/vision/image-analyzer'

interface ImageAnalysisResultsProps {
  results: ImageAnalysisResult[]
  extraContextParsed?: string
}

export function ImageAnalysisResults({ results, extraContextParsed }: ImageAnalysisResultsProps) {
  if (results.length === 0 && !extraContextParsed) {
    return null
  }

  return (
    <div className="image-analysis-results">
      <h2>📊 Context Analysis</h2>
      <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '1.5rem' }}>
        Review what AI extracted from your images and text context
      </p>

      {results.length > 0 && (
        <div className="images-section">
          <h3 style={{ fontSize: '1.1em', marginBottom: '1rem' }}>
            🖼️ Image Analysis ({results.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {results.map((result, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '1rem',
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  {result.fileDataUrl && (
                    <img
                      src={result.fileDataUrl}
                      alt={result.fileName}
                      style={{
                        width: '120px',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4
                      style={{
                        fontSize: '0.95em',
                        fontWeight: '600',
                        marginBottom: '0.5rem',
                        color: '#111827',
                      }}
                    >
                      {result.fileName}
                    </h4>
                    {result.error ? (
                      <div
                        style={{
                          color: '#dc2626',
                          fontSize: '0.85em',
                          padding: '0.75rem',
                          backgroundColor: '#fee2e2',
                          borderRadius: '4px',
                          border: '1px solid #fecaca',
                        }}
                      >
                        <strong>Error:</strong> {result.error}
                      </div>
                    ) : (
                      <div
                        style={{
                          fontSize: '0.85em',
                          color: '#374151',
                          whiteSpace: 'pre-wrap',
                          lineHeight: '1.6',
                          backgroundColor: 'white',
                          padding: '0.75rem',
                          borderRadius: '4px',
                          border: '1px solid #e5e7eb',
                          maxHeight: '400px',
                          overflowY: 'auto',
                        }}
                      >
                        {result.analysis || 'No data extracted'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {extraContextParsed && (
        <div
          className="extra-context-section"
          style={{ marginTop: results.length > 0 ? '2rem' : 0 }}
        >
          <h3 style={{ fontSize: '1.1em', marginBottom: '1rem' }}>📝 Extracted Context Data</h3>
          <div
            style={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '1rem',
            }}
          >
            <pre
              style={{
                fontSize: '0.85em',
                color: '#374151',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6',
                margin: 0,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                maxHeight: '400px',
                overflowY: 'auto',
              }}
            >
              {extraContextParsed}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
