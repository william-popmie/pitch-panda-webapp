import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'

interface FilePreview {
  file: File
  dataUrl: string
  type: 'image' | 'pdf'
}

interface InputFormProps {
  onSubmit: (request: { url: string; deckFiles: File[] }) => void
  isLoading: boolean
  progress?: number
  currentStage?: string
}

export function InputForm({ onSubmit, isLoading, progress, currentStage }: InputFormProps) {
  const [url, setUrl] = useState('')
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      void onSubmit({
        url: url.trim(),
        deckFiles: filePreviews.map(p => p.file),
      })
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const validFiles = Array.from(files).filter(
        file => file.type.startsWith('image/') || file.type === 'application/pdf'
      )

      // Create previews for new files
      void Promise.all(
        validFiles.map(
          file =>
            new Promise<FilePreview>((resolve, reject) => {
              const fileType = file.type === 'application/pdf' ? 'pdf' : 'image'

              if (fileType === 'pdf') {
                // For PDFs, use a generic PDF icon/placeholder
                resolve({
                  file,
                  dataUrl: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>',
                  type: 'pdf',
                })
              } else {
                // For images, create a preview
                const reader = new FileReader()
                reader.onload = () =>
                  resolve({ file, dataUrl: reader.result as string, type: 'image' })
                reader.onerror = reject
                reader.readAsDataURL(file)
              }
            })
        )
      ).then(newPreviews => {
        setFilePreviews(prev => [...prev, ...newPreviews])
      })
    }
  }

  const removeFile = (index: number) => {
    setFilePreviews(prev => prev.filter((_, i) => i !== index))
  }

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      filePreviews.forEach(preview => {
        if (preview.type === 'image' && preview.dataUrl.startsWith('blob:')) {
          URL.revokeObjectURL(preview.dataUrl)
        }
      })
    }
  }, [filePreviews])

  return (
    <form onSubmit={handleSubmit} className="input-form">
      <h1>🐼 Pitch Panda</h1>
      <p className="subtitle">VC-Grade Startup Analysis with Multimodal AI</p>

      <div className="form-group">
        <label htmlFor="startup-url">
          Startup Website <span className="required">*</span>
        </label>
        <input
          id="startup-url"
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="e.g., https://stripe.com"
          disabled={isLoading}
          required
        />
        <p
          style={{
            fontSize: '0.85em',
            color: '#666',
            marginTop: '0.5rem',
            fontStyle: 'italic',
          }}
        >
          🤖 We'll use AI to research the website and extract startup information
        </p>
      </div>

      <div className="form-group">
        <label htmlFor="file-upload">
          Pitch Deck <span style={{ fontWeight: 'normal', fontSize: '0.9em' }}>(Optional)</span>
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*,.pdf"
          multiple
          onChange={handleFileUpload}
          disabled={isLoading}
          style={{ display: 'none' }}
        />
        <label
          htmlFor="file-upload"
          className="file-upload-label"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#f5f5f5',
            border: '2px dashed #ccc',
            borderRadius: '8px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            textAlign: 'center',
            width: '100%',
            marginBottom: '0.5rem',
          }}
        >
          📎 Upload pitch deck (PDF or images)
        </label>
        <p
          style={{
            fontSize: '0.85em',
            color: '#666',
            marginTop: '0.5rem',
            fontStyle: 'italic',
          }}
        >
          🖼️ Vision AI will analyze slides to extract charts, metrics, team info, and more
        </p>

        {filePreviews.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontSize: '0.9em', fontWeight: '600', marginBottom: '0.5rem' }}>
              Uploaded files ({filePreviews.length}):
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filePreviews.map((preview, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.75rem',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                  }}
                >
                  {preview.type === 'image' ? (
                    <img
                      src={preview.dataUrl}
                      alt={preview.file.name}
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '80px',
                        height: '80px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#e74c3c',
                        borderRadius: '4px',
                        color: 'white',
                        fontSize: '2em',
                      }}
                    >
                      📄
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '0.85em',
                        fontWeight: '500',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {preview.file.name}
                    </div>
                    <div style={{ fontSize: '0.75em', color: '#666', marginTop: '0.25rem' }}>
                      {(preview.file.size / 1024).toFixed(1)} KB • {preview.type.toUpperCase()}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    disabled={isLoading}
                    style={{
                      backgroundColor: '#ff4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.8em',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button type="submit" disabled={isLoading} className="submit-btn">
        {isLoading ? 'Analyzing...' : 'Analyze Startup'}
      </button>

      {isLoading && (
        <div className="loading-message">
          <div className="spinner"></div>
          <div>
            {currentStage && (
              <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{currentStage}</p>
            )}
            {progress !== undefined && (
              <div style={{ marginTop: '1rem' }}>
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${progress}%`,
                      height: '100%',
                      backgroundColor: '#4CAF50',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                <p style={{ fontSize: '0.85em', marginTop: '0.5rem', color: '#666' }}>
                  {progress}% complete
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  )
}
