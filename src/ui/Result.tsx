import { useState } from 'react'
import type { StartupAnalysis } from '../analysis'

interface ResultProps {
  analysis: StartupAnalysis
  memo: string
  url: string
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

export function Result({ analysis, memo, url, onReset }: ResultProps) {
  const [activeTab, setActiveTab] = useState<'structured' | 'memo'>('structured')

  return (
    <div className="result">
      <div className="result-header">
        <div>
          <h1>{analysis.startup_id}</h1>
          <a href={url} target="_blank" rel="noopener noreferrer">
            {url} →
          </a>
        </div>
        <button onClick={onReset} className="reset-btn">
          ← New Analysis
        </button>
      </div>

      {/* Tab Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '2px solid #e0e0e0',
          marginBottom: '2rem',
        }}
      >
        <button
          onClick={() => setActiveTab('structured')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            backgroundColor: 'transparent',
            borderBottom:
              activeTab === 'structured' ? '3px solid #4CAF50' : '3px solid transparent',
            fontWeight: activeTab === 'structured' ? '600' : '400',
            cursor: 'pointer',
            fontSize: '1em',
          }}
        >
          📊 Structured Analysis
        </button>
        <button
          onClick={() => setActiveTab('memo')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            backgroundColor: 'transparent',
            borderBottom: activeTab === 'memo' ? '3px solid #4CAF50' : '3px solid transparent',
            fontWeight: activeTab === 'memo' ? '600' : '400',
            cursor: 'pointer',
            fontSize: '1em',
          }}
        >
          📝 Investment Memo
        </button>
      </div>

      {/* Memo Tab */}
      {activeTab === 'memo' && (
        <div className="memo-container">
          <div
            className="markdown-content"
            style={{
              backgroundColor: '#fff',
              padding: '2rem',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              lineHeight: '1.6',
              maxWidth: '800px',
              margin: '0 auto',
            }}
            dangerouslySetInnerHTML={{ __html: memo.replace(/\n/g, '<br/>') }}
          />
        </div>
      )}

      {/* Structured Analysis Tab */}
      {activeTab === 'structured' && (
        <>
          <CollapsibleSection title="🎯 Problem" defaultOpen={true}>
            <div className="card">
              <h3>{analysis.problem.one_liner}</h3>
              <p>{analysis.problem.details}</p>

              {analysis.problem.pain_points.length > 0 && (
                <div>
                  <strong>Pain Points:</strong>
                  <ul>
                    {analysis.problem.pain_points.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p>
                <strong>Target Users:</strong> {analysis.problem.target_users}
              </p>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="💡 Solution" defaultOpen={true}>
            <div className="card">
              <h3>{analysis.solution.one_liner}</h3>
              <p>{analysis.solution.details}</p>

              {analysis.solution.features.length > 0 && (
                <div>
                  <strong>Key Features:</strong>
                  <ul>
                    {analysis.solution.features.map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {analysis.value_proposition && (
            <CollapsibleSection title="✨ Value Proposition" defaultOpen={true}>
              <div className="card">
                <h3>Value Delivered</h3>
                <p>{analysis.value_proposition.summary}</p>

                {analysis.value_proposition.key_benefits.length > 0 && (
                  <div>
                    <strong>Key Benefits:</strong>
                    <ul>
                      {analysis.value_proposition.key_benefits.map((benefit, i) => (
                        <li key={i}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          )}

          {analysis.team && (
            <CollapsibleSection title="👥 Team" defaultOpen={false}>
              <div className="card">
                {analysis.team.members.length > 0 ? (
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {analysis.team.members.map((member, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '1rem',
                          backgroundColor: '#f9f9f9',
                          borderRadius: '8px',
                          border: '1px solid #e0e0e0',
                        }}
                      >
                        <h4 style={{ margin: '0 0 0.5rem 0' }}>
                          {member.name}
                          {member.role && (
                            <span style={{ fontWeight: 'normal', color: '#666' }}>
                              {' '}
                              • {member.role}
                            </span>
                          )}
                        </h4>
                        {member.background && (
                          <p style={{ margin: '0.25rem 0' }}>{member.background}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No team information available.</p>
                )}

                {analysis.team.collective_expertise && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <strong>Collective Expertise:</strong>
                    <p>{analysis.team.collective_expertise}</p>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          )}

          {analysis.traction && (
            <CollapsibleSection title="📈 Traction" defaultOpen={false}>
              <div className="card">
                {analysis.traction.metrics.length > 0 ? (
                  <div>
                    <strong>Key Metrics:</strong>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginTop: '1rem',
                      }}
                    >
                      {analysis.traction.metrics.map((metric, i) => (
                        <div
                          key={i}
                          style={{
                            padding: '1rem',
                            backgroundColor: '#f0f8ff',
                            borderRadius: '8px',
                            border: '1px solid #4CAF50',
                          }}
                        >
                          <div
                            style={{ fontSize: '0.85em', color: '#666', marginBottom: '0.25rem' }}
                          >
                            {metric.metric}
                          </div>
                          <div style={{ fontSize: '1.5em', fontWeight: '600', color: '#4CAF50' }}>
                            {metric.value}
                          </div>
                          {metric.timeframe && (
                            <div style={{ fontSize: '0.8em', color: '#888', marginTop: '0.25rem' }}>
                              {metric.timeframe}
                            </div>
                          )}
                          {metric.trend && (
                            <div style={{ fontSize: '0.8em', color: '#888', marginTop: '0.25rem' }}>
                              ↗️ {metric.trend}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p>No traction metrics available.</p>
                )}

                {analysis.traction.partnerships.length > 0 && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <strong>Partnerships:</strong>
                    <ul>
                      {analysis.traction.partnerships.map((partnership, i) => (
                        <li key={i}>
                          <strong>{partnership.name}</strong> ({partnership.type})
                          {partnership.details && ` - ${partnership.details}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.traction.milestones.length > 0 && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <strong>Milestones:</strong>
                    <ul>
                      {analysis.traction.milestones.map((milestone, i) => (
                        <li key={i}>{milestone}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          )}

          {analysis.competition && analysis.competition.competitors.length > 0 && (
            <CollapsibleSection
              title={`🎯 Competition (${analysis.competition.competitors.length})`}
              defaultOpen={false}
            >
              <div className="card">
                <p>
                  <strong>Market Positioning:</strong> {analysis.competition.positioning}
                </p>
                {analysis.competition.notes && (
                  <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>
                    {analysis.competition.notes}
                  </p>
                )}
              </div>

              <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                {analysis.competition.competitors.map((comp, i) => (
                  <div
                    key={i}
                    className="card"
                    style={{
                      backgroundColor: '#fff',
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    <h3>{comp.name}</h3>

                    {comp.description && <p>{comp.description}</p>}

                    {comp.differentiation && (
                      <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>
                        <strong>Differentiation:</strong> {comp.differentiation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {analysis.funding && (
            <CollapsibleSection title="💰 Funding" defaultOpen={false}>
              <div className="card">
                <p>
                  <strong>Status:</strong> {analysis.funding.status}
                </p>
                {analysis.funding.total_raised && (
                  <p>
                    <strong>Total Raised:</strong> {analysis.funding.total_raised}
                  </p>
                )}
                {analysis.funding.notes && (
                  <p>
                    <strong>Notes:</strong> {analysis.funding.notes}
                  </p>
                )}

                {analysis.funding.rounds.length > 0 && (
                  <div>
                    <strong>Funding Rounds:</strong>
                    <ul>
                      {analysis.funding.rounds.map((round, i) => (
                        <li key={i}>
                          <strong>{round.type}</strong> ({round.status})
                          {round.amount && ` - ${round.amount}`}
                          {round.date && ` (${round.date})`}
                          {round.investors &&
                            round.investors.length > 0 &&
                            ` • ${round.investors.join(', ')}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          )}

          {analysis.business_model && (
            <CollapsibleSection title="💼 Business Model" defaultOpen={false}>
              <div className="card">
                {analysis.business_model.summary && <p>{analysis.business_model.summary}</p>}

                {analysis.business_model.monetization &&
                  analysis.business_model.monetization.length > 0 && (
                    <div>
                      <strong>Monetization:</strong>
                      <ul>
                        {analysis.business_model.monetization.map((stream, i) => (
                          <li key={i}>{stream}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                {analysis.business_model.pricing && (
                  <p>
                    <strong>Pricing:</strong> {analysis.business_model.pricing}
                  </p>
                )}
              </div>
            </CollapsibleSection>
          )}

          {analysis.risks && analysis.risks.length > 0 && (
            <CollapsibleSection title={`⚠️ Risks (${analysis.risks.length})`} defaultOpen={false}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {analysis.risks.map((risk, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '1rem',
                      backgroundColor:
                        risk.severity === 'high'
                          ? '#fff5f5'
                          : risk.severity === 'medium'
                            ? '#fffbf0'
                            : '#f0f0f0',
                      borderLeft: `4px solid ${risk.severity === 'high' ? '#e74c3c' : risk.severity === 'medium' ? '#f39c12' : '#95a5a6'}`,
                      borderRadius: '4px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <h4 style={{ margin: '0 0 0.5rem 0' }}>{risk.category}</h4>
                      <span
                        style={{
                          fontSize: '0.75em',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          backgroundColor:
                            risk.severity === 'high'
                              ? '#e74c3c'
                              : risk.severity === 'medium'
                                ? '#f39c12'
                                : '#95a5a6',
                          color: 'white',
                          fontWeight: '600',
                        }}
                      >
                        {risk.severity?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </div>
                    <p style={{ margin: 0 }}>{risk.description}</p>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {analysis.missing_info && analysis.missing_info.length > 0 && (
            <CollapsibleSection title="❓ Missing Information" defaultOpen={false}>
              <div className="card">
                <ul>
                  {analysis.missing_info.map((info, i) => (
                    <li key={i}>{info}</li>
                  ))}
                </ul>
              </div>
            </CollapsibleSection>
          )}

          {analysis.evidence_summary && (
            <CollapsibleSection title="📋 Evidence Summary" defaultOpen={false}>
              <div className="card">
                <p style={{ whiteSpace: 'pre-wrap' }}>{analysis.evidence_summary}</p>
              </div>
            </CollapsibleSection>
          )}
        </>
      )}
    </div>
  )
}
