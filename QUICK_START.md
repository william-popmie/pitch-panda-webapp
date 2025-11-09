# Quick Start Guide

Get started with the refactored VC Analysis Pipeline in 5 minutes.

## Prerequisites

```bash
# Node.js 18+ required
node --version

# Install dependencies
npm install

# Set OpenAI API key
echo "VITE_OPENAI_API_KEY=sk-your-key-here" > .env
```

## Run Your First Analysis

### Option 1: Using the Code

```typescript
import { runAnalysis, processDeckFiles } from './src/analysis'

async function analyzeSt artup() {
  // 1. Load deck (if you have one)
  const pdfFile = new File([pdfBuffer], 'deck.pdf')
  const deckSlides = await processDeckFiles([pdfFile])

  // 2. Run analysis
  const result = await runAnalysis({
    url: 'https://stripe.com',
    deck_slides: deckSlides
  })

  // 3. View results
  console.log('Problem:', result.final_analysis.problem.one_liner)
  console.log('Solution:', result.final_analysis.solution.one_liner)
  console.log('\nFull Memo:\n', result.memo)
}
```

### Option 2: With Streaming Progress

```typescript
import { streamAnalysis } from './src/analysis'

async function analyzeWithProgress() {
  for await (const { stage, progress, state } of streamAnalysis({
    url: 'https://stripe.com',
    deck_slides: deckImages,
  })) {
    console.log(`[${progress}%] ${stage}`)

    if (stage === 'complete') {
      console.log('Analysis:', state.final_analysis)
      console.log('Memo:', state.memo)
    }
  }
}
```

## Understanding the Output

### StartupAnalysis Object

```typescript
{
  // WHO & WHAT
  problem: {
    one_liner: "Payments infrastructure is fragmented and complex",
    details: "...",
    pain_points: ["Integration complexity", "Compliance burden"],
    target_users: "Online businesses and platforms"
  },

  solution: {
    one_liner: "Unified API for payments, billing, and financial services",
    details: "...",
    features: ["Single integration", "Global coverage", "Developer-first"]
  },

  value_proposition: {
    summary: "Build and scale payment systems without infrastructure complexity",
    key_benefits: ["Faster time to market", "Lower operational costs"]
  },

  // TEAM & TRACTION
  team: {
    members: [
      {
        name: "John Collison",
        role: "Co-founder & President",
        background: "Previously built Auctomatic",
        strengths: ["Product vision", "Technical leadership"]
      }
    ]
  },

  traction: {
    metrics: [
      { metric: "GMV", value: "$640B", trend: "Growing" }
    ],
    partnerships: [
      { name: "Amazon", type: "customer" }
    ]
  },

  // COMPETITIVE LANDSCAPE
  competition: {
    competitors: [
      { name: "PayPal", differentiation: "Better developer experience" }
    ],
    positioning: "Developer-first payments infrastructure"
  },

  // FUNDING & BUSINESS MODEL
  funding: {
    rounds: [
      { type: "Series B", amount: "$20M", investors: ["Sequoia"] }
    ],
    status: "Well-funded"
  },

  business_model: {
    summary: "Transaction fees + SaaS subscriptions",
    monetization: ["2.9% + 30¢ per transaction", "Stripe Billing subscription"]
  },

  // RISKS & GAPS
  risks: [
    {
      category: "market",
      description: "Incumbent competition from established players",
      severity: "medium"
    }
  ],

  missing_info: [
    "Customer acquisition cost (CAC)",
    "Detailed go-to-market strategy"
  ]
}
```

### Investment Memo

The `memo` field contains a human-readable markdown document:

```markdown
# Investment Memo: Stripe

## Executive Summary

Stripe provides payments infrastructure for online businesses...

## The Opportunity

**Problem:** Payment infrastructure is fragmented...

**Solution:** Unified API for all payment needs...

## Business Fundamentals

**Product:** Developer-first API platform...

**Traction:**

- $640B GMV processed
- Used by Amazon, Shopify, etc.

## Team

- John Collison (Co-founder): Strong technical background...

## Investment Considerations

**Pros:**

- ✓ Strong product-market fit
- ✓ Impressive customer roster
- ✓ Developer mindshare

**Cons / Risks:**

- ⚠ Competitive market
- ⚠ Regulatory complexity

**Missing Information:**

- CAC/LTV metrics
- Detailed unit economics

## Recommendation

**Take Intro Call** - Strong team and traction warrant further exploration.
```

## Common Workflows

### Website-Only Analysis

```typescript
const result = await runAnalysis({
  url: 'https://startup.com',
  // No deck_slides
})
```

### Deck-Only Analysis

```typescript
const deckSlides = await processDeckFiles([pdfFile])

const result = await runAnalysis({
  url: 'https://example.com', // Can be placeholder
  deck_slides: deckSlides,
})
```

### Batch Analysis

```typescript
const startups = [
  { url: 'https://stripe.com', deck: 'stripe.pdf' },
  { url: 'https://openai.com', deck: 'openai.pdf' },
]

const results = await Promise.all(
  startups.map(s =>
    runAnalysis({
      url: s.url,
      deck_slides: await processDeckFiles([s.deck]),
    })
  )
)
```

## Interpreting Results

### Evidence Quality

Check `evidence_summary`:

```typescript
console.log(result.final_analysis.evidence_summary)
// "Total evidence items: 47. Sources - Deck: 32, Website: 15. Coverage: problem, solution, team, traction, funding, competition"
```

### Provenance

Every fact includes its source:

```typescript
result.evidence.traction_facts.forEach(fact => {
  console.log(`${fact.value} from ${fact.source.kind} page ${fact.source.page}`)
})
// "1M users from deck_slide page 12"
```

### Error Handling

Check for issues:

```typescript
if (result.errors.length > 0) {
  console.log('Errors:', result.errors)
  // Might still have partial results
}
```

## Customization

### Adjust LLM Settings

```typescript
// In services/llmClients.ts
export function getTextLLM(config = {}) {
  return new ChatOpenAI({
    temperature: 0.3, // More creative
    maxTokens: 4000, // Longer responses
    // ...
  })
}
```

### Add Custom Analysis

```typescript
// Create new node: nodes/competitiveIntel.ts
export async function competitiveIntel(state: StartupState) {
  // Your custom logic
  return {
    competitive_intel: {
      /* data */
    },
  }
}

// Wire into graph: graph/graphBuilder.ts
const intelUpdate = await executeNode('competitiveIntel', state, competitiveIntel)
state = mergeState(state, intelUpdate)
```

## Debugging

### Enable Verbose Logging

The graph already logs each stage:

```
[Graph] ━━━ STAGE 1: PARALLEL INGESTION ━━━
[Graph] Executing node: ingestWebsite
[Graph] ✓ ingestWebsite completed
...
```

### Inspect Intermediate State

```typescript
const result = await runAnalysis(input)

// Check each stage
console.log('Evidence:', result.evidence)
console.log('Core:', result.core)
console.log('Business:', result.business)
console.log('Risks:', result.risk)
```

### Test Individual Nodes

```typescript
import { evidenceExtraction } from './src/nodes/evidenceExtraction'

const testState = {
  // Mock state
  evidence: null,
  deck_structured: [...],
  web_chunks: [...]
}

const result = await evidenceExtraction(testState)
console.log(result.evidence)
```

## Performance Tips

### 1. Reduce Vision API Calls

Process fewer slides:

```typescript
const limitedSlides = deckSlides.slice(0, 5) // First 5 slides only
```

### 2. Increase Batch Concurrency

In `services/llmClients.ts`:

```typescript
await batchProcess(
  items,
  processFn,
  5 // Process 5 at once (default: 3)
)
```

### 3. Use Cheaper Models

For non-critical nodes:

```typescript
const llm = getTextLLM({
  model: 'gpt-3.5-turbo', // Instead of gpt-4
})
```

## Next: Integrate with UI

See the TODOs:

1. Update `InputForm.tsx` to accept URL + files
2. Use `streamAnalysis()` in `App.tsx`
3. Display results in `Result.tsx`

Example integration:

```tsx
function App() {
  const [state, setState] = useState<StartupState | null>(null)
  const [progress, setProgress] = useState(0)

  async function analyze(url: string, files: File[]) {
    const deckSlides = await processDeckFiles(files)

    for await (const update of streamAnalysis({ url, deck_slides: deckSlides })) {
      setProgress(update.progress)
      setState(update.state)
    }
  }

  return (
    <div>
      <InputForm onSubmit={analyze} />
      <ProgressBar value={progress} />
      {state?.final_analysis && <Result analysis={state.final_analysis} memo={state.memo} />}
    </div>
  )
}
```

---

**Ready to analyze!** 🚀

For more details, see:

- [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) - Complete overview
- [docs/GRAPH_ARCHITECTURE.md](./docs/GRAPH_ARCHITECTURE.md) - Graph details
- [docs/REFACTORED_ARCHITECTURE.md](./docs/REFACTORED_ARCHITECTURE.md) - Architecture deep-dive
