/**
 * Business analysis schema: Team, Traction, Competition, Funding, Business Model
 */

import { z } from 'zod'

/**
 * Team member with background
 */
export const TeamMemberSchema = z.object({
  name: z.string().describe('Full name'),
  role: z.string().describe('Current role at the startup'),
  background: z.string().optional().describe('Past experience, education, achievements'),
  strengths: z.array(z.string()).describe('Key strengths or expertise areas'),
  source_ids: z.array(z.string()).describe('References to evidence sources'),
})

export type TeamMember = z.infer<typeof TeamMemberSchema>

/**
 * Team analysis
 */
export const TeamSchema = z.object({
  size: z.string().optional().describe('Team size (e.g., "10-50 employees")'),
  members: z.array(TeamMemberSchema).describe('Individual team members identified'),
  collective_expertise: z
    .string()
    .optional()
    .describe("Summary of team's collective domain expertise"),
})

export type Team = z.infer<typeof TeamSchema>

/**
 * Traction metric
 */
export const TractionMetricSchema = z.object({
  metric: z.string().describe('Metric name (e.g., MRR, users, customers)'),
  value: z.union([z.string(), z.number()]).describe('Current value'),
  trend: z.string().optional().describe('Growth trend or trajectory'),
  timeframe: z.string().optional().describe('When measured'),
})

export type TractionMetric = z.infer<typeof TractionMetricSchema>

/**
 * Partnership or customer
 */
export const PartnershipSchema = z.object({
  name: z.string().describe('Partner or customer name'),
  type: z.string().describe('Type: customer, partner, LOI, pilot, integration, distribution, etc.'),
  details: z.string().optional().describe('Additional details'),
})

export type Partnership = z.infer<typeof PartnershipSchema>

/**
 * Traction analysis
 */
export const TractionSchema = z.object({
  metrics: z.array(TractionMetricSchema).describe('Quantitative traction metrics'),
  partnerships: z.array(PartnershipSchema).describe('Key partnerships or customers'),
  milestones: z.array(z.string()).describe('Major achievements or milestones'),
})

export type Traction = z.infer<typeof TractionSchema>

/**
 * Single competitor
 */
export const CompetitorSchema = z.object({
  name: z.string().describe('Competitor name'),
  description: z.string().optional().describe('Brief description of what they do'),
  differentiation: z
    .string()
    .optional()
    .describe('How the startup differentiates from this competitor'),
})

export type Competitor = z.infer<typeof CompetitorSchema>

/**
 * Competition analysis
 */
export const CompetitionSchema = z.object({
  competitors: z.array(CompetitorSchema).describe('Identified competitors'),
  positioning: z.string().describe('How the startup positions itself vs competition'),
  notes: z.string().optional().describe('Additional competitive landscape notes'),
})

export type Competition = z.infer<typeof CompetitionSchema>

/**
 * Funding round
 */
export const FundingRoundSchema = z.object({
  type: z.string().describe('Round type: pre-seed, seed, Series A, etc.'),
  amount: z.string().optional().describe('Amount raised (e.g., "$2M")'),
  investors: z.array(z.string()).optional().describe('Investor names'),
  date: z.string().optional().describe('Date or timeframe'),
  status: z.string().describe('Status: completed, ongoing, target'),
})

export type FundingRound = z.infer<typeof FundingRoundSchema>

/**
 * Funding analysis
 */
export const FundingSchema = z.object({
  rounds: z.array(FundingRoundSchema).describe('Funding rounds'),
  total_raised: z.string().optional().describe('Total amount raised to date'),
  status: z.string().describe('Current fundraising status'),
  notes: z.string().optional().describe('Additional funding-related notes'),
})

export type Funding = z.infer<typeof FundingSchema>

/**
 * Business model
 */
export const BusinessModelSchema = z.object({
  summary: z.string().nullable().describe('High-level business model summary'),
  monetization: z
    .array(z.string())
    .nullable()
    .describe('Revenue streams or monetization strategies'),
  pricing: z.string().optional().describe('Pricing model if mentioned'),
})

export type BusinessModel = z.infer<typeof BusinessModelSchema>

/**
 * Complete business analysis
 */
export const BusinessSchema = z.object({
  team: TeamSchema,
  traction: TractionSchema,
  competition: CompetitionSchema,
  funding: FundingSchema,
  business_model: BusinessModelSchema,
})

export type Business = z.infer<typeof BusinessSchema>
