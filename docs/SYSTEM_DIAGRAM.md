# Visual System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE (React)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────────┐ │
│  │ InputForm   │  │ ProgressBar │  │ Result Display                  │ │
│  │ - URL input │  │ - Stage     │  │ - StartupAnalysis (structured)  │ │
│  │ - PDF upload│  │ - Progress% │  │ - Investment Memo (markdown)    │ │
│  └──────┬──────┘  └──────▲──────┘  └─────────────────────────────────┘ │
│         │                │                          ▲                    │
└─────────┼────────────────┼──────────────────────────┼────────────────────┘
          │                │                          │
          │        ┌───────┴────────┐        ┌────────┴────────┐
          │        │  streamAnalysis │        │   runAnalysis   │
          │        │   (real-time)   │        │   (batch mode)  │
          │        └───────┬────────┘        └────────┬────────┘
          │                └─────────┬────────────────┘
          │                          │
┌─────────┼──────────────────────────┼────────────────────────────────────┐
│         │         GRAPH ORCHESTRATION (graphBuilder.ts)                 │
│         │                          │                                     │
│    ┌────▼────────────────────────┬─▼─────────────────────────┐         │
│    │  Initialize StartupState    │  Execute Pipeline Stages  │         │
│    └─────────────────────────────┴───────────┬───────────────┘         │
│                                               │                          │
│    ┌──────────────────────────────────────────▼──────────────────┐     │
│    │  STAGE 1: PARALLEL INGESTION                                │     │
│    │  ┌──────────────────┐    ┌─────────────────────┐           │     │
│    │  │ ingestWebsite    │    │ ingestDeck          │           │     │
│    │  │ • Crawl URL      │    │ • Validate slides   │           │     │
│    │  │ • Extract chunks │    │ • Check format      │           │     │
│    │  └────────┬─────────┘    └──────────┬──────────┘           │     │
│    └───────────┼───────────────────────────┼────────────────────┘     │
│                └───────────┬───────────────┘                            │
│                            │                                            │
│    ┌──────────────────────▼─────────────────────────────────────┐     │
│    │  STAGE 2: DECK VISION UNDERSTANDING (Conditional)           │     │
│    │  ┌────────────────────────────────────────────┐             │     │
│    │  │ deckVisionUnderstanding                    │             │     │
│    │  │ • Vision LLM (GPT-4V)                      │             │     │
│    │  │ • Extract: title, bullets, figures,        │             │     │
│    │  │   logos, claims, charts, caveats           │             │     │
│    │  │ • Output: SlideSchema[] with structure     │             │     │
│    │  └────────────────────┬───────────────────────┘             │     │
│    └───────────────────────┼─────────────────────────────────────┘     │
│                            │                                            │
│    ┌──────────────────────▼─────────────────────────────────────┐     │
│    │  STAGE 3: EVIDENCE EXTRACTION                               │     │
│    │  ┌────────────────────────────────────────────┐             │     │
│    │  │ evidenceExtraction                         │             │     │
│    │  │ • Input: web_chunks + deck_structured      │             │     │
│    │  │ • Extract GROUNDED facts only              │             │     │
│    │  │ • Track provenance (source + page/location)│             │     │
│    │  │ • Output: EvidenceSchema                   │             │     │
│    │  │   - problem_snippets                       │             │     │
│    │  │   - solution_snippets                      │             │     │
│    │  │   - team_facts, traction_facts, etc.       │             │     │
│    │  └────────────────────┬───────────────────────┘             │     │
│    └───────────────────────┼─────────────────────────────────────┘     │
│                            │                                            │
│    ┌──────────────────────▼─────────────────────────────────────┐     │
│    │  STAGE 4: PARALLEL ANALYSIS                                 │     │
│    │  ┌─────────────────────┐    ┌────────────────────────┐     │     │
│    │  │ coreAnalysis        │    │ businessAnalysis       │     │     │
│    │  │ • Problem           │    │ • Team                 │     │     │
│    │  │ • Solution          │    │ • Traction             │     │     │
│    │  │ • Value Proposition │    │ • Competition          │     │     │
│    │  │                     │    │ • Funding              │     │     │
│    │  │                     │    │ • Business Model       │     │     │
│    │  └──────────┬──────────┘    └─────────┬──────────────┘     │     │
│    └─────────────┼──────────────────────────┼────────────────────┘     │
│                  └──────────┬───────────────┘                          │
│                             │                                           │
│    ┌───────────────────────▼───────────────────────────────────┐      │
│    │  STAGE 5: RISK ANALYSIS                                    │      │
│    │  ┌───────────────────────────────────────────┐             │      │
│    │  │ riskAnalysis                              │             │      │
│    │  │ • Identify risks by category              │             │      │
│    │  │   (market, team, competition, tech, etc.) │             │      │
│    │  │ • Detect missing critical information     │             │      │
│    │  │ • Assess severity levels                  │             │      │
│    │  └────────────────────┬──────────────────────┘             │      │
│    └───────────────────────┼────────────────────────────────────┘      │
│                            │                                            │
│    ┌──────────────────────▼─────────────────────────────────────┐     │
│    │  STAGE 6: MERGE ANALYSIS (Pure Function)                    │     │
│    │  ┌────────────────────────────────────────────┐             │     │
│    │  │ mergeAnalysis                              │             │     │
│    │  │ • Combine all analyses into one structure  │             │     │
│    │  │ • Output: StartupAnalysis                  │             │     │
│    │  │   ├─ problem, solution, value_proposition  │             │     │
│    │  │   ├─ team, traction, competition, funding  │             │     │
│    │  │   ├─ business_model                        │             │     │
│    │  │   └─ risks, missing_info                   │             │     │
│    │  └────────────────────┬───────────────────────┘             │     │
│    └───────────────────────┼─────────────────────────────────────┘     │
│                            │                                            │
│    ┌──────────────────────▼─────────────────────────────────────┐     │
│    │  STAGE 7: INVESTMENT MEMO GENERATION                        │     │
│    │  ┌────────────────────────────────────────────┐             │     │
│    │  │ investmentMemo                             │             │     │
│    │  │ • Input: StartupAnalysis                   │             │     │
│    │  │ • Generate human-readable markdown memo    │             │     │
│    │  │ • Sections:                                │             │     │
│    │  │   - Executive Summary                      │             │     │
│    │  │   - Opportunity                            │             │     │
│    │  │   - Business Fundamentals                  │             │     │
│    │  │   - Team, Competition, Traction            │             │     │
│    │  │   - Pros/Cons                              │             │     │
│    │  │   - Missing Info                           │             │     │
│    │  │   - Recommendation                         │             │     │
│    │  └────────────────────┬───────────────────────┘             │     │
│    └───────────────────────┼─────────────────────────────────────┘     │
└────────────────────────────┼──────────────────────────────────────────┘
                             │
                  ┌──────────▼───────────┐
                  │  OUTPUT              │
                  │  • StartupAnalysis   │
                  │  • Memo (markdown)   │
                  │  • Errors[]          │
                  └──────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        SUPPORTING SERVICES                               │
├─────────────────────────────────────────────────────────────────────────┤
│  LLM CLIENTS (services/llmClients.ts)                                   │
│  ┌──────────────────┐  ┌───────────────────┐  ┌──────────────────┐    │
│  │ getTextLLM()     │  │ getVisionLLM()    │  │ getStructured    │    │
│  │ • GPT-4 Turbo    │  │ • GPT-4 Vision    │  │ LLM()            │    │
│  │ • Temperature    │  │ • Image support   │  │ • JSON mode      │    │
│  │ • Max tokens     │  │ • Max tokens      │  │ • Zod validation │    │
│  └──────────────────┘  └───────────────────┘  └──────────────────┘    │
│                                                                          │
│  UTILITIES                                                               │
│  ┌──────────────────┐  ┌───────────────────┐  ┌──────────────────┐    │
│  │ pdfUtils.ts      │  │ scraper.ts        │  │ batchProcess()   │    │
│  │ • PDF → images   │  │ • Website crawl   │  │ • Concurrency    │    │
│  │ • pdf.js         │  │ • HTML parsing    │  │   control        │    │
│  │ • Data URLs      │  │ • Text chunking   │  │ • Rate limiting  │    │
│  └──────────────────┘  └───────────────────┘  └──────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                           DATA SCHEMAS (Zod)                             │
├─────────────────────────────────────────────────────────────────────────┤
│  StartupState      │  Evidence          │  Core                          │
│  • startup_id      │  • problem_snippets│  • problem                     │
│  • url             │  • solution_snippets│ • solution                    │
│  • deck_slides     │  • team_facts      │  • value_proposition           │
│  • web_chunks      │  • traction_facts  │                                │
│  • deck_structured │  • funding_facts   │  Business                      │
│  • evidence        │  • competition_    │  • team                        │
│  • core            │    snippets        │  • traction                    │
│  • business        │  • market_snippets │  • competition                 │
│  • risk            │  • business_model_ │  • funding                     │
│  • final_analysis  │    snippets        │  • business_model              │
│  • memo            │  • claims          │                                │
│  • errors[]        │                    │  Risk                          │
│                    │  SlideSchema       │  • risks[]                     │
│  StartupAnalysis   │  • page            │  • missing_info[]              │
│  • All above +     │  • slide_type      │                                │
│  • analyzed_at     │  • title           │  Provenance                    │
│  • evidence_summary│  • main_bullets    │  • kind (deck/website)         │
│                    │  • figures         │  • page                        │
│                    │  • logos           │  • location                    │
│                    │  • claims          │  • snippet                     │
│                    │  • visual_structures│                               │
│                    │  • caveats         │                                │
└─────────────────────────────────────────────────────────────────────────┘

EXECUTION FLOW:
═══════════════
    INPUT → Graph Orchestration → LLM Services → Schemas → OUTPUT
           (Parallel + Sequential)  (Vision + Text)  (Validation)

PARALLELISM:
════════════
    Stage 1: Website ∥ Deck (2x speedup)
    Stage 4: Core ∥ Business (2x speedup)
    Overall: ~35% faster than sequential

PROVENANCE TRACKING:
═══════════════════
    Every fact → source (deck slide X or website /path)
    Enables verification and trust

ERROR HANDLING:
═══════════════
    Node failure → Log error, continue with partial results
    State.errors accumulates all issues
    Pipeline doesn't crash

STREAMING:
══════════
    Yield after each stage: { stage, progress%, state }
    Enables real-time UI updates
    Progress: 0% → 15% → 30% → 45% → 65% → 80% → 90% → 100%
```
