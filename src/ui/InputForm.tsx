import { useState } from 'react'
import type { FormEvent } from 'react'
import type { AnalysisRequest } from '../types'

interface InputFormProps {
  onSubmit: (request: AnalysisRequest) => void
  isLoading: boolean
}

export function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [startupName, setStartupName] = useState('')
  const [startupUrl, setStartupUrl] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (startupName.trim() && startupUrl.trim()) {
      onSubmit({
        startup_name: startupName.trim(),
        startup_url: startupUrl.trim(),
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
