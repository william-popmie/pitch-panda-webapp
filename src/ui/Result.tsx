import type { Analysis } from '../types'

interface ResultProps {
  analysis: Analysis
  onReset: () => void
}

export function Result({ analysis, onReset }: ResultProps) {
  return (
    <div className="result">
      <div className="result-header">
        <div>
          <h1>{analysis.startup_name}</h1>
          <a href={analysis.startup_url} target="_blank" rel="noopener noreferrer">
            {analysis.startup_url} →
          </a>
        </div>
        <button onClick={onReset} className="reset-btn">
          ← New Analysis
        </button>
      </div>

      <section className="section">
        <h2>📋 Problem</h2>
        <div className="card">
          <p>
            <strong>General:</strong> {analysis.problem.general}
          </p>
          <p>
            <strong>Example:</strong> {analysis.problem.example}
          </p>
        </div>
      </section>

      <section className="section">
        <h2>💡 Solution</h2>
        <div className="card">
          <p>
            <strong>Product:</strong> {analysis.solution.what_it_is}
          </p>
          <p>
            <strong>How it works:</strong> {analysis.solution.how_it_works}
          </p>
          <p>
            <strong>Example:</strong> {analysis.solution.example}
          </p>
        </div>
      </section>

      <section className="section">
        <h2>🏢 Overview</h2>
        <div className="card">
          <p>
            <strong>Product Type:</strong> {analysis.product_type}
          </p>
          <p>
            <strong>Sector:</strong> {analysis.sector}
          </p>
          <p>
            <strong>Subsector:</strong> {analysis.subsector}
          </p>
          {analysis.active_locations.length > 0 && (
            <p>
              <strong>Active Locations:</strong> {analysis.active_locations.join(', ')}
            </p>
          )}
        </div>
      </section>

      <section className="section">
        <h2>🎯 Competition ({analysis.competition.length})</h2>
        {analysis.competition.length === 0 ? (
          <div className="card">
            <p>No competitors found.</p>
          </div>
        ) : (
          <div className="competitors">
            {analysis.competition.map((comp, idx) => (
              <div key={idx} className="competitor-card">
                <h3>
                  {comp.name}
                  {comp.website && (
                    <>
                      {' '}
                      <a href={comp.website} target="_blank" rel="noopener noreferrer">
                        →
                      </a>
                    </>
                  )}
                </h3>

                {comp.product_type && (
                  <p className="meta">
                    {comp.product_type} • {comp.sector || 'Unknown sector'}
                  </p>
                )}

                <p>
                  <strong>Problem Similarity:</strong> {comp.problem_similarity}
                </p>

                <p>
                  <strong>Solution:</strong> {comp.solution_summary}
                </p>

                {comp.similarities.length > 0 && (
                  <div>
                    <strong>Similarities:</strong>
                    <ul>
                      {comp.similarities.map((sim, i) => (
                        <li key={i}>{sim}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {comp.differences.length > 0 && (
                  <div>
                    <strong>Differences:</strong>
                    <ul>
                      {comp.differences.map((diff, i) => (
                        <li key={i}>{diff}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {comp.active_locations.length > 0 && (
                  <p className="meta">📍 {comp.active_locations.join(', ')}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <h2>🔗 Sources</h2>
        <div className="card">
          <ul>
            {analysis.sources.map((source, idx) => (
              <li key={idx}>
                <a href={source} target="_blank" rel="noopener noreferrer">
                  {source}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
