/**
 * Main schemas for startup analysis pipeline
 * Includes state and final output schemas
 */

import { z } from 'zod'
import { SlideSchema, SlideImageSchema } from './deck'
import { EvidenceSchema } from './evidence'
import { CoreSchema, ProblemSchema, SolutionSchema, ValuePropositionSchema } from './core'
import {
  BusinessSchema,
  TeamSchema,
  TractionSchema,
  CompetitionSchema,
  FundingSchema,
  BusinessModelSchema,
} from './business'
import { RiskSchema } from './risk'

/**
 * Text chunk from website
 */
export const TextChunkSchema = z.object({
  id: z.string().describe('Unique identifier for this chunk'),
  text: z.string().describe('The text content'),
  source_type: z.literal('website'),
  location: z.string().describe('URL path or section (e.g., "/about", "/product")'),
})

export type TextChunk = z.infer<typeof TextChunkSchema>

/**
 * Final structured startup analysis output
 */
export const StartupAnalysisSchema = z.object({
  startup_id: z.string().describe('Unique identifier'),
  url: z.string().describe('Startup website URL'),

  // Core analysis
  problem: ProblemSchema,
  solution: SolutionSchema,
  value_proposition: ValuePropositionSchema,

  // Business analysis
  team: TeamSchema,
  traction: TractionSchema,
  competition: CompetitionSchema,
  funding: FundingSchema,
  business_model: BusinessModelSchema,

  // Risk analysis
  risks: z.array(RiskSchema.shape.risks.element),
  missing_info: z.array(z.string()),

  // Metadata
  evidence_summary: z
    .string()
    .nullable()
    .optional()
    .describe('High-level summary of evidence quality'),
  analyzed_at: z.string().describe('ISO timestamp of analysis'),
})

export type StartupAnalysis = z.infer<typeof StartupAnalysisSchema>

/**
 * LangGraph state object
 * This flows through all nodes in the pipeline
 */
export const StartupStateSchema = z.object({
  // Input
  startup_id: z.string(),
  url: z.string(),

  // Raw inputs
  deck_slides: z.array(SlideImageSchema).nullable().default(null),
  website_html: z.string().nullable().default(null),

  // Processed inputs
  web_chunks: z.array(TextChunkSchema).nullable().default(null),
  deck_structured: z.array(SlideSchema).nullable().default(null),

  // Analysis stages
  evidence: EvidenceSchema.nullable().default(null),
  core: CoreSchema.nullable().default(null),
  business: BusinessSchema.nullable().default(null),
  risk: RiskSchema.nullable().default(null),

  // Final outputs
  final_analysis: StartupAnalysisSchema.nullable().default(null),
  memo: z.string().nullable().default(null),

  // Error tracking
  errors: z.array(z.string()).default([]),
})

export type StartupState = z.infer<typeof StartupStateSchema>

/**
 * Input to start the analysis pipeline
 */
export const AnalysisInputSchema = z.object({
  url: z.string().url(),
  deck_pdf: z.instanceof(File).optional(),
  deck_images: z.array(z.instanceof(File)).optional(),
})

export type AnalysisInput = z.infer<typeof AnalysisInputSchema>
