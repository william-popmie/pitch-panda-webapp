/**
 * LangGraph Graph Builder
 * Wires all analysis nodes into a coherent pipeline with proper graph capabilities
 * Using manual orchestration for better control over parallel execution and conditional routing
 */

import type { StartupState } from '../schemas/startup'
import { ingestWebsite } from '../nodes/ingestWebsite'
import { ingestDeck } from '../nodes/ingestDeck'
import { deckVisionUnderstanding } from '../nodes/deckVisionUnderstanding'
import { evidenceExtraction } from '../nodes/evidenceExtraction'
import { coreAnalysis } from '../nodes/coreAnalysis'
import { businessAnalysis } from '../nodes/businessAnalysis'
import { riskAnalysis } from '../nodes/riskAnalysis'
import { mergeAnalysis } from '../nodes/mergeAnalysis'
import { investmentMemo } from '../nodes/investmentMemo'

/**
 * Graph execution with proper parallelism and dependencies
 *
 * Parallel execution groups:
 * 1. [ingestWebsite, ingestDeck] - parallel ingestion
 * 2. [deckVisionUnderstanding] - conditional on deck presence
 * 3. [evidenceExtraction] - waits for both ingestion and vision
 * 4. [coreAnalysis, businessAnalysis] - parallel analysis
 * 5. [riskAnalysis] - waits for both analyses
 * 6. [mergeAnalysis] - pure function
 * 7. [investmentMemo] - final step
 */

/**
 * Merge state updates safely
 */
function mergeState(state: StartupState, update: Partial<StartupState>): StartupState {
  return {
    ...state,
    ...update,
    // Special handling for errors - accumulate instead of replace
    errors: [...state.errors, ...(update.errors || [])],
  }
}

/**
 * Execute a node with error handling
 */
async function executeNode<T extends Partial<StartupState>>(
  nodeName: string,
  state: StartupState,
  nodeFn: (state: StartupState) => Promise<T> | T
): Promise<T> {
  try {
    console.log(`[Graph] Executing node: ${nodeName}`)
    const result = await nodeFn(state)
    console.log(`[Graph] ✓ ${nodeName} completed`)
    return result
  } catch (error) {
    console.error(`[Graph] ✗ ${nodeName} failed:`, error)
    return {
      errors: [`${nodeName} failed: ${error instanceof Error ? error.message : String(error)}`],
    } as T
  }
}

/**
 * Run the full analysis pipeline with proper graph orchestration
 */
export async function runAnalysis(initialState: Partial<StartupState>): Promise<StartupState> {
  console.log('[AnalysisGraph] Starting LangGraph-style analysis pipeline')
  console.log(`[AnalysisGraph] URL: ${initialState.url}`)
  console.log(`[AnalysisGraph] Deck slides: ${initialState.deck_slides?.length || 0}`)
  console.log('')

  let state: StartupState = {
    startup_id: initialState.startup_id || `analysis-${Date.now()}`,
    url: initialState.url || '',
    deck_slides: initialState.deck_slides || null,
    website_html: null,
    web_chunks: null,
    deck_structured: null,
    evidence: null,
    core: null,
    business: null,
    risk: null,
    final_analysis: null,
    memo: null,
    errors: [],
  }

  try {
    // ============================================================
    // STAGE 1: PARALLEL INGESTION
    // ============================================================
    console.log('[Graph] ━━━ STAGE 1: PARALLEL INGESTION ━━━')
    const [websiteUpdate, deckUpdate] = await Promise.all([
      executeNode('ingestWebsite', state, ingestWebsite),
      executeNode('ingestDeck', state, ingestDeck),
    ])

    state = mergeState(state, websiteUpdate)
    state = mergeState(state, deckUpdate)
    console.log('')

    // ============================================================
    // STAGE 2: CONDITIONAL DECK VISION UNDERSTANDING
    // ============================================================
    console.log('[Graph] ━━━ STAGE 2: DECK VISION UNDERSTANDING ━━━')
    if (state.deck_slides && state.deck_slides.length > 0) {
      const visionUpdate = await executeNode(
        'deckVisionUnderstanding',
        state,
        deckVisionUnderstanding
      )
      state = mergeState(state, visionUpdate)
    } else {
      console.log('[Graph] ⊘ Skipping deck vision (no slides)')
      state = mergeState(state, { deck_structured: [] })
    }
    console.log('')

    // ============================================================
    // STAGE 3: EVIDENCE EXTRACTION
    // ============================================================
    console.log('[Graph] ━━━ STAGE 3: EVIDENCE EXTRACTION ━━━')
    const evidenceUpdate = await executeNode('evidenceExtraction', state, evidenceExtraction)
    state = mergeState(state, evidenceUpdate)
    console.log('')

    // ============================================================
    // STAGE 4: PARALLEL CORE & BUSINESS ANALYSIS
    // ============================================================
    console.log('[Graph] ━━━ STAGE 4: PARALLEL ANALYSIS ━━━')
    const [coreUpdate, businessUpdate] = await Promise.all([
      executeNode('coreAnalysis', state, coreAnalysis),
      executeNode('businessAnalysis', state, businessAnalysis),
    ])

    state = mergeState(state, coreUpdate)
    state = mergeState(state, businessUpdate)
    console.log('')

    // ============================================================
    // STAGE 5: RISK ANALYSIS
    // ============================================================
    console.log('[Graph] ━━━ STAGE 5: RISK ANALYSIS ━━━')
    const riskUpdate = await executeNode('riskAnalysis', state, riskAnalysis)
    state = mergeState(state, riskUpdate)
    console.log('')

    // ============================================================
    // STAGE 6: MERGE ANALYSIS
    // ============================================================
    console.log('[Graph] ━━━ STAGE 6: MERGE ANALYSIS ━━━')
    const mergeUpdate = await executeNode('mergeAnalysis', state, mergeAnalysis)
    state = mergeState(state, mergeUpdate)
    console.log('')

    // ============================================================
    // STAGE 7: INVESTMENT MEMO
    // ============================================================
    console.log('[Graph] ━━━ STAGE 7: INVESTMENT MEMO ━━━')
    const memoUpdate = await executeNode('investmentMemo', state, investmentMemo)
    state = mergeState(state, memoUpdate)
    console.log('')

    console.log('[AnalysisGraph] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('[AnalysisGraph] ✓ Pipeline complete')
    console.log(`[AnalysisGraph] Errors: ${state.errors.length}`)
    if (state.errors.length > 0) {
      console.log('[AnalysisGraph] Error details:', state.errors)
    }

    return state
  } catch (error) {
    console.error('[AnalysisGraph] ✗ Pipeline failed catastrophically:', error)
    state.errors.push(`Pipeline failed: ${error instanceof Error ? error.message : String(error)}`)
    return state
  }
}

/**
 * Stream the analysis pipeline for real-time updates
 * Yields state after each major stage for UI progress tracking
 */
export async function* streamAnalysis(initialState: Partial<StartupState>) {
  console.log('[AnalysisGraph] Starting streaming analysis pipeline')

  let state: StartupState = {
    startup_id: initialState.startup_id || `analysis-${Date.now()}`,
    url: initialState.url || '',
    deck_slides: initialState.deck_slides || null,
    website_html: null,
    web_chunks: null,
    deck_structured: null,
    evidence: null,
    core: null,
    business: null,
    risk: null,
    final_analysis: null,
    memo: null,
    errors: [],
  }

  try {
    // STAGE 1: Parallel ingestion
    const [websiteUpdate, deckUpdate] = await Promise.all([
      executeNode('ingestWebsite', state, ingestWebsite),
      executeNode('ingestDeck', state, ingestDeck),
    ])
    state = mergeState(state, websiteUpdate)
    state = mergeState(state, deckUpdate)
    yield { stage: 'ingest', progress: 15, state }

    // STAGE 2: Deck vision understanding
    if (state.deck_slides && state.deck_slides.length > 0) {
      const visionUpdate = await executeNode(
        'deckVisionUnderstanding',
        state,
        deckVisionUnderstanding
      )
      state = mergeState(state, visionUpdate)
    } else {
      state = mergeState(state, { deck_structured: [] })
    }
    yield { stage: 'vision', progress: 30, state }

    // STAGE 3: Evidence extraction
    const evidenceUpdate = await executeNode('evidenceExtraction', state, evidenceExtraction)
    state = mergeState(state, evidenceUpdate)
    yield { stage: 'evidence', progress: 45, state }

    // STAGE 4: Parallel core & business analysis
    const [coreUpdate, businessUpdate] = await Promise.all([
      executeNode('coreAnalysis', state, coreAnalysis),
      executeNode('businessAnalysis', state, businessAnalysis),
    ])
    state = mergeState(state, coreUpdate)
    state = mergeState(state, businessUpdate)
    yield { stage: 'analysis', progress: 65, state }

    // STAGE 5: Risk analysis
    const riskUpdate = await executeNode('riskAnalysis', state, riskAnalysis)
    state = mergeState(state, riskUpdate)
    yield { stage: 'risk', progress: 80, state }

    // STAGE 6: Merge analysis
    const mergeUpdate = await executeNode('mergeAnalysis', state, mergeAnalysis)
    state = mergeState(state, mergeUpdate)
    yield { stage: 'merge', progress: 90, state }

    // STAGE 7: Investment memo
    const memoUpdate = await executeNode('investmentMemo', state, investmentMemo)
    state = mergeState(state, memoUpdate)
    yield { stage: 'complete', progress: 100, state }

    console.log('[AnalysisGraph] Streaming pipeline complete')
  } catch (error) {
    console.error('[AnalysisGraph] Streaming pipeline failed:', error)
    state.errors.push(`Pipeline failed: ${error instanceof Error ? error.message : String(error)}`)
    yield { stage: 'error', progress: -1, state }
  }
}
