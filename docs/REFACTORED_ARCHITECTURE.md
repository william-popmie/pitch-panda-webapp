# VC Analysis Pipeline - Refactored Architecture

This document describes the new multimodal LLM-based VC analysis pipeline built on LangChain/LangGraph.

## Overview

The pipeline analyzes startup pitch decks and websites using a combination of:

- **Vision LLMs** for multimodal deck understanding
- **Text LLMs** for evidence extraction and analysis
- **Structured schemas** (Zod) for validated outputs
- **Sequential graph execution** for reliable processing

## Architecture

### Schemas (`src/schemas/`)

All data structures use Zod for runtime validation:

- **`startup.ts`**: Main state and output schemas
  - `StartupState`: Pipeline state that flows through all nodes
  - `StartupAnalysis`: Final structured output
  - `TextChunk`: Website text with provenance

- **`deck.ts`**: Slide representation
  - `SlideSchema`: Structured slide data (type, title, bullets, figures, logos, claims, visuals)
  - `SlideImage`: Raw slide image data

- **`evidence.ts`**: Raw extracted facts
  - `EvidenceSchema`: Grounded evidence with provenance (NO hallucinations)
  - Includes: problem, solution, team, traction, funding, competition, market snippets

- **`core.ts`**: Problem/Solution/Value Prop
  - `ProblemSchema`, `SolutionSchema`, `ValuePropositionSchema`

- **`business.ts`**: Business fundamentals
  - `TeamSchema`, `TractionSchema`, `CompetitionSchema`, `FundingSchema`, `BusinessModelSchema`

- **`risk.ts`**: Risk analysis
  - `RiskSchema`: Categorized risks and missing information

### Services (`src/services/`)

Utility functions for LLM interaction and data processing:

- **`llmClients.ts`**: LLM client factories
  - `getTextLLM()`: Standard text LLM
  - `getVisionLLM()`: Vision-capable LLM
  - `getStructuredLLM()`: LLM with schema-based output
  - `getStructuredVisionLLM()`: Vision LLM with schema output
  - `batchProcess()`: Concurrent processing with rate limiting

- **`pdfUtils.ts`**: PDF processing
  - `pdfToImages()`: Convert PDF to slide images using pdf.js
  - `imagesToSlides()`: Process image files
  - `processDeckFiles()`: Unified file processing

- **`scraper.ts`**: Website scraping
  - `scrapeWebsite()`: Fetch and parse website
  - `crawlWebsite()`: Multi-page crawling (MVP: single page)

### Nodes (`src/nodes/`)

Each node is a pure function: `(state: StartupState) => Promise<Partial<StartupState>>`

1. **`ingestWebsite.ts`**: Crawl website → `web_chunks`
2. **`ingestDeck.ts`**: Validate deck slides
3. **`deckVisionUnderstanding.ts`**: Vision LLM → `deck_structured` (SlideSchema[])
4. **`evidenceExtraction.ts`**: Extract grounded facts → `evidence`
5. **`coreAnalysis.ts`**: Synthesize problem/solution/value prop → `core`
6. **`businessAnalysis.ts`**: Analyze team/traction/competition/funding → `business`
7. **`riskAnalysis.ts`**: Identify risks and gaps → `risk`
8. **`mergeAnalysis.ts`**: Pure function combining all analysis → `final_analysis`
9. **`investmentMemo.ts`**: Generate human-readable memo → `memo`

### Graph (`src/graph/`)

**`graphBuilder.ts`**: Sequential pipeline execution

Flow:

```
START
  ↓
ingestWebsite + ingestDeck (parallel)
  ↓
deckVisionUnderstanding
  ↓
evidenceExtraction
  ↓
coreAnalysis
  ↓
businessAnalysis
  ↓
riskAnalysis
  ↓
mergeAnalysis
  ↓
investmentMemo
  ↓
END
```

Functions:

- `runAnalysis(state)`: Execute full pipeline
- `streamAnalysis(state)`: Stream results for real-time UI updates

## Usage

### From UI

```typescript
import { runAnalysis, processDeckFiles, type StartupAnalysis } from './analysis'

// Process files
const deckSlides = await processDeckFiles(pdfFiles)

// Run analysis
const result = await runAnalysis({
  startup_id: `analysis-${Date.now()}`,
  url: 'https://startup.com',
  deck_slides: deckSlides,
})

// Access results
const analysis: StartupAnalysis = result.final_analysis
const memo: string = result.memo
```

### Streaming for Real-time UI

```typescript
import { streamAnalysis } from './analysis'

for await (const { step, state } of streamAnalysis(initialState)) {
  console.log(`Step: ${step}`)

  if (step === 'evidence') {
    console.log('Evidence extracted:', state.evidence)
  }

  if (step === 'memo') {
    console.log('Final memo:', state.memo)
  }
}
```

## Key Principles

### 1. No Hallucinations in Evidence

The `evidenceExtraction` node ONLY extracts explicitly stated facts. If something isn't in the deck/website, it's left empty.

### 2. Provenance Tracking

Every evidence item tracks its source:

```typescript
{
  text: "Raised $2M seed round",
  source: {
    kind: "deck_slide",
    page: 15,
    snippet: "Seed Round: $2M from Acme Ventures"
  }
}
```

### 3. Multimodal Understanding

Deck slides are analyzed with vision LLMs that can:

- Read text in any layout
- Understand charts and graphs
- Identify logos and their roles
- Extract figures from visual contexts

### 4. Structured Everything

All LLM outputs are validated against Zod schemas. Invalid outputs fail fast.

### 5. Modular Reasoning

Each "type of thinking" lives in its own node:

- Evidence extraction ≠ reasoning
- Core analysis = synthesizing problem/solution
- Business analysis = structuring fundamentals
- Risk analysis = identifying gaps and threats

## Environment Variables

```bash
VITE_OPENAI_API_KEY=sk-...
```

## Error Handling

All nodes catch errors and append to `state.errors[]`. The pipeline continues even if individual nodes fail, allowing partial results.

## Extending

### Add a new node

1. Create `src/nodes/myNode.ts`:

```typescript
export async function myNode(state: StartupState): Promise<Partial<StartupState>> {
  // Your logic
  return {
    // Updated fields
  }
}
```

2. Wire into graph in `src/graph/graphBuilder.ts`

### Add a new schema field

1. Update the relevant schema in `src/schemas/`
2. Update nodes that produce/consume this field
3. TypeScript will guide you to all required changes

## Testing

```bash
# Run the CLI
npm run cli -- --url https://startup.com --pdf deck.pdf

# Development server
npm run dev

# Build
npm run build
```

## Future Enhancements

- [ ] True parallel execution for independent nodes
- [ ] Caching for expensive operations (vision analysis)
- [ ] Multi-page website crawling
- [ ] Competitive intel enrichment from external sources
- [ ] Historical analysis tracking and comparison
- [ ] Fine-tuned prompts per vertical/stage
- [ ] Async streaming to UI with WebSockets
