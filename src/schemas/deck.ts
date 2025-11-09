/**
 * Schema for structured representation of pitch deck slides
 * Uses Zod for runtime validation
 */

import { z } from 'zod'

/**
 * Possible slide types in a pitch deck
 */
export const SlideType = z.enum([
  'problem',
  'solution',
  'team',
  'traction',
  'market',
  'competition',
  'product',
  'roadmap',
  'financials',
  'funding',
  'other',
])

export type SlideType = z.infer<typeof SlideType>

/**
 * Structured figure/metric extracted from a slide
 */
export const FigureSchema = z.object({
  label: z.string().describe('Label or description of the metric'),
  value: z.string().describe('Value as string (e.g., "1000", "$2M", "50%")'),
  unit: z.string().nullable().describe('Unit of measurement (e.g., "$", "%", "users")'),
})

export type Figure = z.infer<typeof FigureSchema>

/**
 * Logo or brand identified on a slide
 */
export const LogoSchema = z.object({
  name: z.string().describe('Name or identifier of the logo/brand'),
  role: z
    .string()
    .nullable()
    .describe('Role in relation to the startup: customer, partner, investor, competitor'),
})

export type Logo = z.infer<typeof LogoSchema>

/**
 * Visual structure like charts, graphs, diagrams
 */
export const VisualStructureSchema = z.object({
  type: z.string().describe('Type of visual: chart, graph, diagram, table, etc.'),
  subject: z.string().nullable().describe('What the visual is about'),
  qualitative_trend: z
    .string()
    .nullable()
    .describe('Qualitative description: increasing, decreasing, stable, etc.'),
})

export type VisualStructure = z.infer<typeof VisualStructureSchema>

/**
 * Complete structured representation of a single slide
 */
export const SlideSchema = z.object({
  page: z.number().int().positive().describe('Page number (1-indexed)'),
  slide_type: SlideType.describe('Classified type of the slide'),
  title: z.string().nullable().describe('Main title of the slide'),
  main_bullets: z.array(z.string()).describe('Main bullet points or text blocks'),
  figures: z.array(FigureSchema).describe('Quantitative figures, metrics, or data points'),
  logos: z.array(LogoSchema).describe('Logos, brands, or company names identified'),
  claims: z.array(z.string()).describe('Explicit self-reported claims made on the slide'),
  visual_structures: z
    .array(VisualStructureSchema)
    .describe('Charts, graphs, diagrams, and their trends'),
  caveats: z.array(z.string()).describe('Disclaimers, footnotes, or qualifying statements'),
})

export type Slide = z.infer<typeof SlideSchema>

/**
 * Raw slide image data
 */
export const SlideImageSchema = z.object({
  page: z.number().int().positive(),
  imageDataUrl: z.string().describe('Base64 data URL of the slide image'),
  fileName: z.string().nullable().optional().describe('Original filename if available'),
})

export type SlideImage = z.infer<typeof SlideImageSchema>
