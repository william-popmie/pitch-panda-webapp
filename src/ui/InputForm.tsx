import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'

interface ImagePreview {
  file: File
  dataUrl: string
}

interface InputFormProps {
  onSubmit: (request: { startup_url: string; extra_context?: string; images?: File[] }) => void
  isLoading: boolean
}

export function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [startupUrl, setStartupUrl] = useState('')
  const [extraContext, setExtraContext] = useState('')
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (startupUrl.trim()) {
      void onSubmit({
        startup_url: startupUrl.trim(),
        extra_context: extraContext.trim() || undefined,
        images: imagePreviews.length > 0 ? imagePreviews.map(p => p.file) : undefined,
      })
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))

      // Create previews for new images
      void Promise.all(
        imageFiles.map(
          file =>
            new Promise<ImagePreview>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => resolve({ file, dataUrl: reader.result as string })
              reader.onerror = reject
              reader.readAsDataURL(file)
            })
        )
      ).then(newPreviews => {
        setImagePreviews(prev => [...prev, ...newPreviews])
      })
    }
  }

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => {
        if (preview.dataUrl.startsWith('blob:')) {
          URL.revokeObjectURL(preview.dataUrl)
        }
      })
    }
  }, [imagePreviews])

  return (
    <form onSubmit={handleSubmit} className="input-form">
      <h1>🐼 Pitch Panda</h1>
      <p className="subtitle">Startup Analysis & Competition Research</p>

      <div className="form-group">
        <label htmlFor="startup-url">
          Startup Website <span className="required">*</span>
        </label>
        <input
          id="startup-url"
          type="url"
          value={startupUrl}
          onChange={e => setStartupUrl(e.target.value)}
          placeholder="e.g., stripe.com or https://stripe.com"
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
          💡 We'll automatically extract the startup name from the website
        </p>
      </div>

      <div className="form-group">
        <label htmlFor="extra-context">
          Extra Context <span style={{ fontWeight: 'normal', fontSize: '0.9em' }}>(Optional)</span>
        </label>
        <textarea
          id="extra-context"
          value={extraContext}
          onChange={e => setExtraContext(e.target.value)}
          placeholder={`Provide additional confidential information not publicly available:

• Financial metrics: MRR, ARR, burn rate, runway, valuation
• Funding: Stage, amount raised, investors
• Traction: Customer count, retention rate, growth rate
• Team: Size, key hires, founder backgrounds
• Market data: TAM/SAM/SOM estimates from pitch deck
• IP & advantages: Patents, partnerships, LOIs
• Competition insights: What they claim about competitors

Example:
"Raised $2M seed from Acme Ventures. Currently at $50K MRR with 80 paying customers. 15-person team. Founded Q2 2021. Claim to be only platform with real-time processing in this space."`}
          rows={6}
          disabled={isLoading}
          style={{ resize: 'vertical', minHeight: '120px' }}
        />
        <p
          style={{
            fontSize: '0.85em',
            color: '#666',
            marginTop: '0.5rem',
            fontStyle: 'italic',
          }}
        >
          💡 This helps us extract metrics from pitch decks or private documents. Competition claims
          will be treated skeptically.
        </p>
      </div>

      <div className="form-group">
        <label htmlFor="image-upload">
          Upload Images <span style={{ fontWeight: 'normal', fontSize: '0.9em' }}>(Optional)</span>
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          disabled={isLoading}
          style={{ display: 'none' }}
        />
        <label
          htmlFor="image-upload"
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
          📎 Click to upload pitch deck slides, charts, or screenshots
        </label>
        <p
          style={{
            fontSize: '0.85em',
            color: '#666',
            marginTop: '0.5rem',
            fontStyle: 'italic',
          }}
        >
          🖼️ AI will analyze images to extract financial data, team info, market size, and more
        </p>

        {imagePreviews.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontSize: '0.9em', fontWeight: '600', marginBottom: '0.5rem' }}>
              Uploaded images ({imagePreviews.length}):
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {imagePreviews.map((preview, idx) => (
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
                      {(preview.file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
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
          <p>
            {imagePreviews.length > 0
              ? `Analyzing ${imagePreviews.length} image(s) and fetching website data...`
              : 'Fetching website and analyzing with AI...'}
          </p>
        </div>
      )}
    </form>
  )
}
