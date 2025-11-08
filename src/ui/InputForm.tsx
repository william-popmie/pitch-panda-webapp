import { useState } from 'react'
import type { FormEvent } from 'react'

interface InputFormProps {
  onSubmit: (request: {
    startup_name: string
    startup_url: string
    extra_context?: string
    images?: File[]
  }) => void
  isLoading: boolean
}

export function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [startupName, setStartupName] = useState('')
  const [startupUrl, setStartupUrl] = useState('')
  const [extraContext, setExtraContext] = useState('')
  const [images, setImages] = useState<File[]>([])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (startupName.trim() && startupUrl.trim()) {
      void onSubmit({
        startup_name: startupName.trim(),
        startup_url: startupUrl.trim(),
        extra_context: extraContext.trim() || undefined,
        images: images.length > 0 ? images : undefined,
      })
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))
      setImages(prev => [...prev, ...imageFiles])
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <form onSubmit={handleSubmit} className="input-form">
      <h1>🐼 Pitch Panda</h1>
      <p className="subtitle">Startup Analysis & Competition Research</p>

      <div className="form-group">
        <label htmlFor="startup-name">
          Startup Name <span className="required">*</span>
        </label>
        <input
          id="startup-name"
          type="text"
          value={startupName}
          onChange={e => setStartupName(e.target.value)}
          placeholder="e.g., Stripe"
          disabled={isLoading}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="startup-url">
          Website URL <span className="required">*</span>
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

        {images.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontSize: '0.9em', fontWeight: '600', marginBottom: '0.5rem' }}>
              Uploaded images ({images.length}):
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {images.map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '4px',
                    border: '1px solid #e0e0e0',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.85em',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {img.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    disabled={isLoading}
                    style={{
                      backgroundColor: '#ff4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.8em',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      marginLeft: '0.5rem',
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
            {images.length > 0
              ? `Analyzing ${images.length} image(s) and fetching website data...`
              : 'Fetching website and analyzing with AI...'}
          </p>
        </div>
      )}
    </form>
  )
}
