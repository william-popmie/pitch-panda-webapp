import { useState } from 'react'
import type { Analysis } from '../ai/core/schemas'

interface ResultProps {
  analysis: Analysis & { startup_name: string; startup_url: string }
  onReset: () => void
}

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <section className="section">
      <h2 onClick={() => setIsOpen(!isOpen)} className="section-header">
        <span className="toggle-icon">{isOpen ? '▼' : '▶'}</span> {title}
      </h2>
      {isOpen && <div className="section-content">{children}</div>}
    </section>
  )
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

      <CollapsibleSection title="📋 Problem" defaultOpen={true}>
        <div className="card">
          <p>
            <strong>General:</strong> {analysis.problem.general}
          </p>
          <p>
            <strong>Example:</strong> {analysis.problem.example}
          </p>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="💡 Solution" defaultOpen={true}>
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
      </CollapsibleSection>

      <CollapsibleSection title="🏢 Overview" defaultOpen={true}>
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
      </CollapsibleSection>

      <CollapsibleSection
        title={`🎯 Competition (${analysis.competition.length})`}
        defaultOpen={false}
      >
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
      </CollapsibleSection>

      {analysis.team && (
        <CollapsibleSection title="👥 Team" defaultOpen={false}>
          <div className="card">
            <p>
              <strong>Size:</strong> {analysis.team.size}
            </p>

            {analysis.team.founders.length > 0 && (
              <div>
                <strong>Founders:</strong>
                <ul>
                  {analysis.team.founders.map((founder, i) => (
                    <li key={i}>{founder}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.team.key_roles.length > 0 && (
              <div>
                <strong>Key Roles:</strong>
                <ul>
                  {analysis.team.key_roles.map((role, i) => (
                    <li key={i}>{role}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.team.expertise !== 'Unknown' && (
              <p>
                <strong>Expertise:</strong> {analysis.team.expertise}
              </p>
            )}
          </div>
        </CollapsibleSection>
      )}

      {analysis.market && (
        <CollapsibleSection title="📊 Market Opportunity" defaultOpen={false}>
          <div className="card">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
                marginBottom: '1rem',
              }}
            >
              <div>
                <p>
                  <strong>TAM:</strong> {analysis.market.tam}
                </p>
              </div>
              <div>
                <p>
                  <strong>SAM:</strong> {analysis.market.sam}
                </p>
              </div>
              <div>
                <p>
                  <strong>SOM:</strong> {analysis.market.som}
                </p>
              </div>
            </div>

            {analysis.market.market_size_summary !== 'Unknown' && (
              <p>
                <strong>Market Summary:</strong> {analysis.market.market_size_summary}
              </p>
            )}

            {analysis.market.target_customers !== 'Unknown' && (
              <p>
                <strong>Target Customers:</strong> {analysis.market.target_customers}
              </p>
            )}

            {analysis.market.growth_trends.length > 0 && (
              <div>
                <strong>Growth Trends:</strong>
                <ul>
                  {analysis.market.growth_trends.map((trend, i) => (
                    <li key={i}>{trend}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {analysis.traction && (
        <CollapsibleSection title="🚀 Traction & Competitive Advantages" defaultOpen={false}>
          <div className="card">
            <h3>Traction Metrics</h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
                marginBottom: '1rem',
              }}
            >
              <div>
                <p>
                  <strong>Revenue:</strong> {analysis.traction.revenue}
                </p>
              </div>
              <div>
                <p>
                  <strong>Customers:</strong> {analysis.traction.customers}
                </p>
              </div>
              <div>
                <p>
                  <strong>Growth Rate:</strong> {analysis.traction.growth_rate}
                </p>
              </div>
            </div>

            {analysis.traction.key_milestones.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>Key Milestones:</strong>
                <ul>
                  {analysis.traction.key_milestones.map((milestone, i) => (
                    <li key={i}>{milestone}</li>
                  ))}
                </ul>
              </div>
            )}

            <h3 style={{ marginTop: '1.5rem' }}>Competitive Advantages</h3>

            {analysis.traction.intellectual_property.length > 0 && (
              <div>
                <strong>Intellectual Property:</strong>
                <ul>
                  {analysis.traction.intellectual_property.map((ip, i) => (
                    <li key={i}>{ip}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.traction.partnerships.length > 0 && (
              <div>
                <strong>Partnerships:</strong>
                <ul>
                  {analysis.traction.partnerships.map((partnership, i) => (
                    <li key={i}>{partnership}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.traction.regulatory_moats.length > 0 && (
              <div>
                <strong>Regulatory Moats:</strong>
                <ul>
                  {analysis.traction.regulatory_moats.map((moat, i) => (
                    <li key={i}>{moat}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.traction.network_effects !== 'Unknown' && (
              <p>
                <strong>Network Effects:</strong> {analysis.traction.network_effects}
              </p>
            )}

            {analysis.traction.defensibility_summary !== 'Unknown' && (
              <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>
                <strong>Defensibility Summary:</strong> {analysis.traction.defensibility_summary}
              </p>
            )}
          </div>
        </CollapsibleSection>
      )}

      <CollapsibleSection title="🔗 Sources" defaultOpen={false}>
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
      </CollapsibleSection>
    </div>
  )
}
