/**
 * Risk analysis schema
 */

import { z } from 'zod'

/**
 * Individual risk
 */
export const RiskItemSchema = z.object({
  category: z
    .string()
    .describe(
      'Risk category: market, team, competition, technology, business_model, execution, regulatory, etc.'
    ),
  description: z.string().describe('Description of the risk'),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional().describe('Assessed severity'),
})

export type RiskItem = z.infer<typeof RiskItemSchema>

/**
 * Risk analysis
 */
export const RiskSchema = z.object({
  risks: z.array(RiskItemSchema).describe('Identified risks'),
  missing_info: z.array(z.string()).describe('Critical information not found in deck or website'),
})

export type Risk = z.infer<typeof RiskSchema>
