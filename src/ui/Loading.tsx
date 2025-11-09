/**
 * Loading spinner and progress indicator component
 */

interface LoadingProps {
  message?: string
  progress?: number
  stage?: string
}

export function Loading({ message, progress, stage }: LoadingProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem',
        gap: '1.5rem',
      }}
    >
      {/* Spinner */}
      <div
        style={{
          width: '60px',
          height: '60px',
          border: '4px solid #f0f0f0',
          borderTop: '4px solid #4CAF50',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />

      {/* Message */}
      {message && (
        <p
          style={{
            fontSize: '1.1em',
            fontWeight: '500',
            color: '#333',
            margin: 0,
            textAlign: 'center',
          }}
        >
          {message}
        </p>
      )}

      {/* Stage description */}
      {stage && (
        <p
          style={{
            fontSize: '0.95em',
            color: '#666',
            margin: 0,
            textAlign: 'center',
          }}
        >
          {stage}
        </p>
      )}

      {/* Progress bar */}
      {progress !== undefined && (
        <div
          style={{
            width: '100%',
            maxWidth: '400px',
            backgroundColor: '#f0f0f0',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '8px',
              backgroundColor: '#4CAF50',
              width: `${progress}%`,
              transition: 'width 0.3s ease',
            }}
          />
          <p
            style={{
              textAlign: 'center',
              fontSize: '0.85em',
              color: '#666',
              margin: '0.5rem 0 0 0',
            }}
          >
            {Math.round(progress)}%
          </p>
        </div>
      )}

      {/* CSS for spinner animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}
