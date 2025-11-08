import { useState } from 'react'
import type { Analysis } from '../ai/core/schemas'
import type { ImageAnalysisResult } from '../ai/vision/image-analyzer'
import { ImageAnalysisResults } from './ImageAnalysisResults'

interface ResultProps {
  analysis: Analysis & {
    startup_name: string
    startup_url: string
    imageAnalysisResults?: ImageAnalysisResult[]
    extraContextRaw?: string
  }
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
  // Prepare extra context data for display
  const extraContextParsed = analysis.extra_context
    ? JSON.stringify(analysis.extra_context, null, 2)
    : undefined

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

      {/* Show Image Analysis Results and Extra Context */}
      {(analysis.imageAnalysisResults?.length || extraContextParsed) && (
        <CollapsibleSection title="📊 Context Analysis" defaultOpen={true}>
          <ImageAnalysisResults
            results={analysis.imageAnalysisResults || []}
            extraContextParsed={extraContextParsed}
          />
        </CollapsibleSection>
      )}

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

      {analysis.extra_context && (
        <CollapsibleSection title="📊 Private Context Data" defaultOpen={false}>
          <div className="card">
            <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '1rem' }}>
              This data was extracted from user-provided confidential information (e.g., pitch
              decks, internal metrics).
            </p>

            {/* Factual Metrics Section */}
            {(analysis.extra_context.founded_year ||
              analysis.extra_context.mrr ||
              analysis.extra_context.arr ||
              analysis.extra_context.funding_stage ||
              analysis.extra_context.funding_raised) && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ color: '#28a745' }}>✓ Factual Metrics</h3>
                <p style={{ fontSize: '0.85em', color: '#666', marginBottom: '0.5rem' }}>
                  (Generally trustworthy)
                </p>

                {analysis.extra_context.founded_year && (
                  <p>
                    <strong>Founded:</strong> {analysis.extra_context.founded_year}
                  </p>
                )}
                {analysis.extra_context.mrr && (
                  <p>
                    <strong>MRR:</strong> {analysis.extra_context.mrr}
                  </p>
                )}
                {analysis.extra_context.arr && (
                  <p>
                    <strong>ARR:</strong> {analysis.extra_context.arr}
                  </p>
                )}
                {analysis.extra_context.funding_stage && (
                  <p>
                    <strong>Funding Stage:</strong> {analysis.extra_context.funding_stage}
                  </p>
                )}
                {analysis.extra_context.funding_raised && (
                  <p>
                    <strong>Funding Raised:</strong> {analysis.extra_context.funding_raised}
                  </p>
                )}
                {analysis.extra_context.funding_investors &&
                  analysis.extra_context.funding_investors.length > 0 && (
                    <p>
                      <strong>Investors:</strong>{' '}
                      {analysis.extra_context.funding_investors.join(', ')}
                    </p>
                  )}
                {analysis.extra_context.customer_count && (
                  <p>
                    <strong>Customers:</strong> {analysis.extra_context.customer_count}
                  </p>
                )}
                {analysis.extra_context.user_count && (
                  <p>
                    <strong>Users:</strong> {analysis.extra_context.user_count}
                  </p>
                )}
                {analysis.extra_context.team_size_claimed && (
                  <p>
                    <strong>Team Size:</strong> {analysis.extra_context.team_size_claimed}
                  </p>
                )}
              </div>
            )}

            {/* Market Claims Section */}
            {(analysis.extra_context.tam_claimed ||
              analysis.extra_context.sam_claimed ||
              analysis.extra_context.som_claimed) && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ color: '#ffc107' }}>⚠️ Market Size Claims</h3>
                <p style={{ fontSize: '0.85em', color: '#666', marginBottom: '0.5rem' }}>
                  (From pitch materials - may be optimistic)
                </p>

                {analysis.extra_context.tam_claimed && (
                  <p>
                    <strong>TAM (Claimed):</strong> {analysis.extra_context.tam_claimed}
                  </p>
                )}
                {analysis.extra_context.sam_claimed && (
                  <p>
                    <strong>SAM (Claimed):</strong> {analysis.extra_context.sam_claimed}
                  </p>
                )}
                {analysis.extra_context.som_claimed && (
                  <p>
                    <strong>SOM (Claimed):</strong> {analysis.extra_context.som_claimed}
                  </p>
                )}
              </div>
            )}

            {/* Competition Claims Section */}
            {((analysis.extra_context.competition_claims &&
              analysis.extra_context.competition_claims.length > 0) ||
              (analysis.extra_context.unique_advantages_claimed &&
                analysis.extra_context.unique_advantages_claimed.length > 0)) && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ color: '#dc3545' }}>🚨 Competition Claims</h3>
                <p style={{ fontSize: '0.85em', color: '#666', marginBottom: '0.5rem' }}>
                  (Self-reported - BIASED. Treated with skepticism in analysis.)
                </p>

                {analysis.extra_context.competition_claims &&
                  analysis.extra_context.competition_claims.length > 0 && (
                    <div>
                      <strong>Company's Claims About Competitors:</strong>
                      <ul>
                        {analysis.extra_context.competition_claims.map((claim, i) => (
                          <li key={i}>{claim}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                {analysis.extra_context.unique_advantages_claimed &&
                  analysis.extra_context.unique_advantages_claimed.length > 0 && (
                    <div>
                      <strong>Claimed Unique Advantages:</strong>
                      <ul>
                        {analysis.extra_context.unique_advantages_claimed.map((advantage, i) => (
                          <li key={i}>{advantage}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            )}

            {/* Other Notes */}
            {analysis.extra_context.other_notes &&
              analysis.extra_context.other_notes.length > 0 && (
                <div>
                  <strong>Other Notes:</strong>
                  <ul>
                    {analysis.extra_context.other_notes.map((note, i) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </CollapsibleSection>
      )}

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
