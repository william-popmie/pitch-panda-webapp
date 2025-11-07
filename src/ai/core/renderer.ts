// Markdown renderer for analysis results

import type { Analysis, Competitor } from './schemas'

function renderLocations(locs: string[]): string {
  return locs.length === 0 ? '- None specified' : locs.map(l => `- ${l}`).join('\n')
}

function bullets(items: string[]): string {
  return items.length === 0 ? '- None' : items.map(i => `- ${i}`).join('\n')
}

function truncate(s: string, n: number = 180): string {
  s = (s || '').trim()
  return s.length <= n ? s : s.substring(0, n - 1).trimEnd() + '…'
}

function renderCompetitor(c: Competitor): string {
  const locs = renderLocations(c.active_locations)
  const srcs = c.sources.length === 0 ? '- None\n' : c.sources.map(s => `- ${s}`).join('\n')
  const websiteLine = c.website ? `**Website:** ${c.website}\n` : ''
  const prodLine = `**Product type:** ${c.product_type || 'Unknown'}\n`
  const sectLine = `**Sector/Subsector:** ${c.sector || 'Unknown'} / ${c.subsector || 'Unknown'}\n`
  const sims = bullets(c.similarities)
  const diffs = bullets(c.differences)

  return `### ${c.name}
${websiteLine}${prodLine}${sectLine}
**Problem similarity:** ${c.problem_similarity}

**Solution summary:** ${c.solution_summary}

**Similarities**
${sims}

**Differences**
${diffs}

**Active Locations**
${locs}

**Sources**
${srcs}
`
}

function renderCompetitionClipboard(targetProductType: string, competitors: Competitor[]): string {
  if (competitors.length === 0) {
    return '(no competitors found)'
  }

  const lines = competitors.map(c => {
    const name = (c.name || 'Unknown').trim()

    // Same / different product type tag
    const tpt = (targetProductType || '').trim().toLowerCase()
    const cpt = (c.product_type || '').trim().toLowerCase()
    let solTag: string
    if (cpt && tpt && cpt === tpt) {
      solTag = 'same product type'
    } else if (c.product_type) {
      solTag = `different product type (${c.product_type})`
    } else {
      solTag = 'solution unspecified'
    }

    // Prefer first difference → similarity → solution summary
    const note = c.differences[0] || '' || c.similarities[0] || '' || c.solution_summary || ''

    const geo = c.active_locations.join(', ') || 'n/a'
    return `${name}: same problem; ${solTag}; ${truncate(note)}; geo: ${geo}`
  })

  return lines.join('\n')
}

export function renderMarkdown(name: string, url: string, analysis: Analysis): string {
  // Structured competition
  let compSection: string
  if (analysis.competition.length > 0) {
    compSection = analysis.competition.map(c => renderCompetitor(c)).join('\n\n')
  } else {
    compSection = 'No competitors found.'
  }

  // Copy-paste one-liners
  const clipboardBlock = renderCompetitionClipboard(analysis.product_type, analysis.competition)

  // Final Markdown document
  return `# ${name}

**Website:** ${url}

## Problem
**General:** ${analysis.problem.general}
**Example:** ${analysis.problem.example}

## Solution
**Product:** ${analysis.solution.what_it_is}
**How it works:** ${analysis.solution.how_it_works}
**Example:** ${analysis.solution.example}

## Product Type
${analysis.product_type}

## Sector
**Sector:** ${analysis.sector}  
**Subsector:** ${analysis.subsector}

## Active Locations
${renderLocations(analysis.active_locations)}

## Competition (Structured)
${compSection}

## Competition (Copy-paste one-liners)
${clipboardBlock}

## Sources
${analysis.sources.map(s => `- ${s}`).join('\n')}
`
}
