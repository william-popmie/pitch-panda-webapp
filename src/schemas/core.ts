/**
 * Core analysis schema: Problem, Solution, Value Proposition
 * Synthesized from evidence
 */

import { z } from 'zod'

/**
 * Structured problem definition
 */
export const ProblemSchema = z.object({
  one_liner: z.string().describe('One sentence problem statement'),
  details: z.string().describe('2-4 sentences elaborating on the problem'),
  pain_points: z.array(z.string()).describe('Specific pain points identified'),
  target_users: z.string().describe('Who experiences this problem'),
})

export type Problem = z.infer<typeof ProblemSchema>

/**
 * Structured solution definition
 */
export const SolutionSchema = z.object({
  one_liner: z.string().describe('One sentence solution description'),
  details: z.string().describe('2-4 sentences explaining how it works'),
  features: z.array(z.string()).describe('Key features or capabilities'),
})

export type Solution = z.infer<typeof SolutionSchema>

/**
 * Structured value proposition
 */
export const ValuePropositionSchema = z.object({
  summary: z.string().describe('Clear statement of unique value delivered'),
  key_benefits: z.array(z.string()).describe('Main benefits to customers'),
})

export type ValueProposition = z.infer<typeof ValuePropositionSchema>

/**
 * Complete core analysis
 */
export const CoreSchema = z.object({
  problem: ProblemSchema,
  solution: SolutionSchema,
  value_proposition: ValuePropositionSchema,
})

export type Core = z.infer<typeof CoreSchema>
