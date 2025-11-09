/**
 * Main entry point for the VC Analysis Pipeline
 * Exports everything needed to run the analysis from the UI
 */

// Export types
export type { StartupState, StartupAnalysis, TextChunk } from './schemas/startup'
export type { Slide, SlideImage, SlideType } from './schemas/deck'
export type { Evidence, EvidenceItem, Provenance } from './schemas/evidence'
export type { Core, Problem, Solution, ValueProposition } from './schemas/core'
export type {
  Business,
  Team,
  TeamMember,
  Traction,
  Competition,
  Funding,
  BusinessModel,
} from './schemas/business'
export type { Risk, RiskItem } from './schemas/risk'

// Export schemas for validation
export { StartupStateSchema, StartupAnalysisSchema, TextChunkSchema } from './schemas/startup'
export { SlideSchema, SlideImageSchema, SlideType as SlideTypeEnum } from './schemas/deck'
export { EvidenceSchema } from './schemas/evidence'
export { CoreSchema, ProblemSchema, SolutionSchema, ValuePropositionSchema } from './schemas/core'
export {
  BusinessSchema,
  TeamSchema,
  TractionSchema,
  CompetitionSchema,
  FundingSchema,
  BusinessModelSchema,
} from './schemas/business'
export { RiskSchema } from './schemas/risk'

// Export services
export { pdfToImages, imagesToSlides, processDeckFiles } from './services/pdfUtils'
export { scrapeWebsite, crawlWebsite } from './services/scraper'
export {
  getTextLLM,
  getVisionLLM,
  getStructuredLLM,
  getStructuredVisionLLM,
} from './services/llmClients'

// Export graph runner
export { runAnalysis, streamAnalysis } from './graph/graphBuilder'

// Export individual nodes (if needed for testing)
export { ingestWebsite } from './nodes/ingestWebsite'
export { ingestDeck } from './nodes/ingestDeck'
export { deckVisionUnderstanding } from './nodes/deckVisionUnderstanding'
export { evidenceExtraction } from './nodes/evidenceExtraction'
export { coreAnalysis } from './nodes/coreAnalysis'
export { businessAnalysis } from './nodes/businessAnalysis'
export { riskAnalysis } from './nodes/riskAnalysis'
export { mergeAnalysis } from './nodes/mergeAnalysis'
export { investmentMemo } from './nodes/investmentMemo'
