# Graph Orchestration Architecture

This document explains how the VC Analysis Pipeline uses graph-based orchestration for optimal parallel execution and dependency management.

## Graph Structure

The pipeline is organized as a **Directed Acyclic Graph (DAG)** with explicit dependencies and parallel execution groups.

```
┌─────────────────┐
│     START       │
└────────┬────────┘
         │
    ┌────┴────┐
    │  STAGE 1 │  Parallel Ingestion
    │         │
┌───▼───┐ ┌──▼──┐
│Website│ │Deck │
│Ingest │ │Ingest│
└───┬───┘ └──┬──┘
    │        │
    │    ┌───▼────┐
    │    │ STAGE 2 │  Conditional Vision
    │    │        │
    │    │ Vision │ (if deck present)
    │    │  LLM   │
    │    └───┬────┘
    │        │
    └────┬───┘
         │
    ┌────▼────┐
    │ STAGE 3  │  Evidence Extraction
    │         │
    │Evidence │
    └────┬────┘
         │
    ┌────┴────┐
    │ STAGE 4  │  Parallel Analysis
    │         │
┌───▼───┐ ┌──▼────┐
│ Core  │ │Business│
│Analysis│ │Analysis│
└───┬───┘ └──┬────┘
    │        │
    └────┬───┘
         │
    ┌────▼────┐
    │ STAGE 5  │  Risk Analysis
    │         │
    │  Risk   │
    └────┬────┘
         │
    ┌────▼────┐
    │ STAGE 6  │  Merge
    │         │
    │  Merge  │
    └────┬────┘
         │
    ┌────▼────┐
    │ STAGE 7  │  Memo Generation
    │         │
    │  Memo   │
    └────┬────┘
         │
    ┌────▼────┐
    │   END    │
    └─────────┘
```

## Execution Stages

### Stage 1: Parallel Ingestion (Parallel)

- **Nodes**: `ingestWebsite`, `ingestDeck`
- **Dependencies**: None (entry points)
- **Parallelism**: Both run simultaneously
- **Purpose**: Fetch and validate raw inputs

**Why Parallel?** Website scraping and deck validation are independent operations with no shared state.

### Stage 2: Deck Vision Understanding (Conditional)

- **Nodes**: `deckVisionUnderstanding`
- **Dependencies**: `ingestDeck`
- **Condition**: Only runs if `deck_slides.length > 0`
- **Purpose**: Multimodal LLM analysis of slides

**Why Conditional?** Not all analyses have pitch decks. Skipping saves time and API costs.

### Stage 3: Evidence Extraction (Sequential)

- **Nodes**: `evidenceExtraction`
- **Dependencies**: `ingestWebsite`, `deckVisionUnderstanding` (or skip)
- **Purpose**: Extract grounded facts from all sources

**Why Sequential?** Needs complete data from both website and deck.

### Stage 4: Parallel Analysis (Parallel)

- **Nodes**: `coreAnalysis`, `businessAnalysis`
- **Dependencies**: `evidenceExtraction`
- **Parallelism**: Both run simultaneously
- **Purpose**: Independent analytical reasoning

**Why Parallel?**

- Core analysis (problem/solution/value prop) is independent of business analysis (team/traction/competition)
- Both consume the same evidence
- Running in parallel cuts execution time by ~40%

### Stage 5: Risk Analysis (Sequential)

- **Nodes**: `riskAnalysis`
- **Dependencies**: `coreAnalysis`, `businessAnalysis`
- **Purpose**: Identify risks and gaps based on complete analysis

**Why Sequential?** Needs insights from both core and business analysis.

### Stage 6: Merge Analysis (Sequential)

- **Nodes**: `mergeAnalysis`
- **Dependencies**: `riskAnalysis`
- **Purpose**: Pure function combining all analyses into final structure

**Why Sequential?** Needs complete analysis before merging.

### Stage 7: Investment Memo (Sequential)

- **Nodes**: `investmentMemo`
- **Dependencies**: `mergeAnalysis`
- **Purpose**: Generate human-readable memo from structured data

**Why Sequential?** Final step that depends on complete merged analysis.

## Key Features

### 1. True Parallelism

Uses `Promise.all()` to execute independent nodes simultaneously:

```typescript
const [websiteUpdate, deckUpdate] = await Promise.all([
  executeNode('ingestWebsite', state, ingestWebsite),
  executeNode('ingestDeck', state, ingestDeck),
])
```

### 2. Conditional Execution

Skips expensive operations when not needed:

```typescript
if (state.deck_slides && state.deck_slides.length > 0) {
  // Run vision LLM
} else {
  // Skip to save time and cost
}
```

### 3. Error Isolation

Each node has error boundaries that don't crash the entire pipeline:

```typescript
async function executeNode(nodeName, state, nodeFn) {
  try {
    return await nodeFn(state)
  } catch (error) {
    return { errors: [`${nodeName} failed: ${error.message}`] }
  }
}
```

### 4. State Accumulation

Errors accumulate instead of overwriting:

```typescript
function mergeState(state, update) {
  return {
    ...state,
    ...update,
    errors: [...state.errors, ...(update.errors || [])],
  }
}
```

### 5. Progress Tracking

Streaming API provides real-time progress:

```typescript
yield { stage: 'evidence', progress: 45, state }
yield { stage: 'analysis', progress: 65, state }
```

## Performance Characteristics

### Estimated Timing (typical startup)

- **Stage 1** (Parallel Ingestion): ~2-5 seconds
- **Stage 2** (Vision Understanding): ~15-30 seconds (3 slides/concurrent batch)
- **Stage 3** (Evidence Extraction): ~5-8 seconds
- **Stage 4** (Parallel Analysis): ~8-12 seconds (would be 16-24 sequential)
- **Stage 5** (Risk Analysis): ~5-7 seconds
- **Stage 6** (Merge): <1 second
- **Stage 7** (Memo): ~8-12 seconds

**Total: ~45-75 seconds** (vs ~70-110 seconds without parallelism)

### Parallelism Savings

- **Stage 1**: 2x speedup (website + deck in parallel)
- **Stage 4**: 2x speedup (core + business in parallel)
- **Overall**: ~30-40% faster than fully sequential execution

## API Usage

### Standard Execution

```typescript
import { runAnalysis } from './graph/graphBuilder'

const result = await runAnalysis({
  startup_id: 'my-analysis',
  url: 'https://startup.com',
  deck_slides: deckImages,
})

console.log(result.final_analysis)
console.log(result.memo)
```

### Streaming for Real-time UI

```typescript
import { streamAnalysis } from './graph/graphBuilder'

for await (const { stage, progress, state } of streamAnalysis(input)) {
  updateProgressBar(progress)

  switch (stage) {
    case 'ingest':
      showMessage('Fetching data...')
      break
    case 'vision':
      showMessage('Analyzing slides...')
      break
    case 'evidence':
      showMessage('Extracting evidence...')
      displayEvidence(state.evidence)
      break
    case 'analysis':
      showMessage('Running analysis...')
      break
    case 'complete':
      showMessage('Complete!')
      displayResults(state.final_analysis, state.memo)
      break
  }
}
```

## Design Principles

### 1. Explicit Dependencies

Every stage clearly declares what it needs:

```typescript
// ✓ Good: Clear dependencies
await ingestWebsite(state) // Needs: url
await evidenceExtraction(state) // Needs: web_chunks, deck_structured
```

### 2. Pure State Transformations

Nodes are pure functions:

```typescript
;(state: StartupState) => Promise<Partial<StartupState>>
```

No side effects, no global state, easy to test.

### 3. Fail-Safe by Default

Individual node failures don't crash the pipeline. You get partial results.

### 4. Observable Progress

At every stage, you know:

- What's completed
- What's running
- What's left
- Any errors encountered

### 5. Cost-Conscious

- Conditional execution saves API calls
- Parallel execution minimizes wall-clock time
- Batch processing (3 slides/concurrent) respects rate limits

## Future Enhancements

### 1. True LangGraph Integration

Once TypeScript types stabilize:

```typescript
const workflow = new StateGraph(GraphStateAnnotation)
  .addNode('ingest', parallelIngestion)
  .addConditionalEdges('deck', shouldProcessDeck)
  .compile()
```

### 2. Checkpointing

Save intermediate results for resume-on-failure:

```typescript
await checkpoint(state, 'evidence_extracted')
```

### 3. Adaptive Parallelism

Adjust concurrency based on available resources:

```typescript
const concurrency = detectAvailableTokens()
```

### 4. Multi-Path Analysis

Run different analysis strategies in parallel and compare:

```typescript
const [conservativeAnalysis, aggressiveAnalysis] = await Promise.all([
  runWithStrategy(state, 'conservative'),
  runWithStrategy(state, 'aggressive'),
])
```

## Debugging

### Visualize Execution

```bash
# Enable detailed logging
NODE_ENV=development npm run dev
```

Logs show:

```
[Graph] ━━━ STAGE 1: PARALLEL INGESTION ━━━
[Graph] Executing node: ingestWebsite
[Graph] Executing node: ingestDeck
[Graph] ✓ ingestWebsite completed
[Graph] ✓ ingestDeck completed

[Graph] ━━━ STAGE 2: DECK VISION UNDERSTANDING ━━━
[Graph] Executing node: deckVisionUnderstanding
[DeckVisionUnderstanding] Analyzing slide 1
...
```

### Inspect State

At any point:

```typescript
console.log('Current state:', JSON.stringify(state, null, 2))
```

### Profile Performance

```typescript
console.time('Stage 4: Parallel Analysis')
const [core, business] = await Promise.all([...])
console.timeEnd('Stage 4: Parallel Analysis')
```

---

This architecture provides the **complexity and power of graph-based orchestration** while maintaining **simplicity and debuggability** through explicit stage management and clean state flow.
