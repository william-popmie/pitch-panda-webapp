/**
 * Schema for raw evidence extraction
 * Evidence must be grounded in source material (no hallucinations)
 */

import { z } from 'zod'

/**
 * Provenance tracking for evidence
 */
export const ProvenanceSchema = z.object({
  kind: z.enum(['deck_slide', 'website']).describe('Source type'),
  page: z.number().optional().describe('Slide page number if from deck'),
  location: z.string().optional().describe('URL path or section if from website'),
  snippet: z.string().optional().describe('Verbatim snippet from source'),
})

export type Provenance = z.infer<typeof ProvenanceSchema>

/**
 * Single piece of evidence with source tracking
 */
export const EvidenceItemSchema = z.object({
  text: z.string().describe('The evidence text'),
  source: ProvenanceSchema.describe('Where this evidence came from'),
})

export type EvidenceItem = z.infer<typeof EvidenceItemSchema>

/**
 * Funding fact with structured data
 */
export const FundingFactSchema = z.object({
  round_type: z.string().optional().describe('e.g., Seed, Series A'),
  amount: z.string().optional().describe('e.g., $2M'),
  investors: z.array(z.string()).optional().describe('List of investor names'),
  date: z.string().optional().describe('Date or timeframe'),
  source: ProvenanceSchema.describe('Where this fact came from'),
})

export type FundingFact = z.infer<typeof FundingFactSchema>

/**
 * Traction fact with metrics
 */
export const TractionFactSchema = z.object({
  metric_type: z.string().describe('Type of metric: revenue, users, customers, growth_rate, etc.'),
  value: z.union([z.string(), z.number()]).describe('Metric value'),
  timeframe: z.string().optional().describe('When this metric was measured'),
  context: z.string().optional().describe('Additional context'),
  source: ProvenanceSchema.describe('Where this fact came from'),
})

export type TractionFact = z.infer<typeof TractionFactSchema>

/**
 * Team member fact
 */
export const TeamFactSchema = z.object({
  name: z.string().describe('Team member name'),
  role: z.string().optional().describe('Current role'),
  background: z.string().optional().describe('Past experience, education'),
  source: ProvenanceSchema.describe('Where this info came from'),
})

export type TeamFact = z.infer<typeof TeamFactSchema>

/**
 * Complete evidence collection
 * All arrays should be empty if no evidence found (not null, not undefined)
 */
export const EvidenceSchema = z.object({
  problem_snippets: z.array(EvidenceItemSchema).describe('Evidence about the problem being solved'),
  solution_snippets: z.array(EvidenceItemSchema).describe('Evidence about the solution/product'),
  value_prop_snippets: z
    .array(EvidenceItemSchema)
    .describe('Evidence about unique value proposition'),
  team_facts: z.array(TeamFactSchema).describe('Facts about team members'),
  competition_snippets: z
    .array(EvidenceItemSchema)
    .describe('Evidence about competitors and competitive landscape'),
  funding_facts: z.array(FundingFactSchema).describe('Funding-related facts'),
  traction_facts: z.array(TractionFactSchema).describe('Traction metrics and achievements'),
  market_snippets: z
    .array(EvidenceItemSchema)
    .describe('Evidence about market size, opportunity, trends'),
  business_model_snippets: z
    .array(EvidenceItemSchema)
    .describe('Evidence about how the business makes money'),
  claims: z.array(EvidenceItemSchema).describe('Self-reported claims that may need verification'),
})

export type Evidence = z.infer<typeof EvidenceSchema>
