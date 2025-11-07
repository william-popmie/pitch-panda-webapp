import { useState } from 'react'
import type { FormEvent } from 'react'

interface InputFormProps {
  onSubmit: (request: { startup_name: string; startup_url: string; extra_context?: string }) => void
  isLoading: boolean
}

export function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [startupName, setStartupName] = useState('')
  const [startupUrl, setStartupUrl] = useState('')
  const [extraContext, setExtraContext] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (startupName.trim() && startupUrl.trim()) {
      void onSubmit({
        startup_name: startupName.trim(),
        startup_url: startupUrl.trim(),
        extra_context: extraContext.trim() || undefined,
      })
    }
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

      <button type="submit" disabled={isLoading} className="submit-btn">
        {isLoading ? 'Analyzing...' : 'Analyze Startup'}
      </button>

      {isLoading && (
        <div className="loading-message">
          <div className="spinner"></div>
          <p>Fetching website and analyzing with AI...</p>
        </div>
      )}
    </form>
  )
}
