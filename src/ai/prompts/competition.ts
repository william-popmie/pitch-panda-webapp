// Competition analysis prompt

export const COMPETITION_PROMPT = `
You are an AI analyst. Using the target startup's validated profile below, list 5–10 competing startups
that solve the **same or very similar problem** (problem similarity should be near-identical).
Do not try to convince; **inform only**.

TARGET STARTUP (ground truth):
- Name: {{startup_name}}
- URL: {{startup_url}}

Problem (general): {{problem_general}}
Problem (example): {{problem_example}}

Solution (what_it_is): {{solution_what}}
Solution (how_it_works): {{solution_how}}
Solution (example): {{solution_example}}

Product type: {{product_type}}
Sector/Subsector: {{sector}} / {{subsector}}
Active locations: {{active_locations}}

---

{{extra_context_section}}

---

INSTRUCTIONS
- Return JSON ONLY as:
{
  "competition": [
    {
      "name": "Company A",
      "website": "https://...",
      "product_type": "SaaS | App | Platform | API | Service | Hardware | Marketplace | Other",
      "sector": "Broad industry",
      "subsector": "Specific niche",
      "problem_similarity": "1–2 lines explaining the overlap in problem focus.",
      "solution_summary": "2–4 lines summarizing their solution and mechanism.",
      "similarities": ["bullet 1","bullet 2"],
      "differences": ["bullet 1","bullet 2"],
      "active_locations": ["Country/Region/City"],
      "sources": ["https://...", "https://..."]
    }
  ]
}

GUIDANCE
- Prioritize companies clearly addressing the **same user pain** and market segment (or adjacent).
- It's fine if their **solution differs** (e.g., API vs. full SaaS, B2B vs. B2C) — capture that in "differences".
- Keep "similarities" focused on shared **problem/ICP**, tech approach overlaps, or use-cases.
- Use **evidence-based** websites if you know them; if unknown, leave fields empty or concise ("Unknown").
- Avoid generic "big tech" unless truly core competitors for the same problem.
- Deduplicate by name/domain. Aim for 5–10 entries.

{{bias_warning}}

Now return the JSON.
`

export interface CompetitionPromptParams {
  startup_name: string
  startup_url: string
  problem_general: string
  problem_example: string
  solution_what: string
  solution_how: string
  solution_example: string
  product_type: string
  sector: string
  subsector: string
  active_locations: string
  extra_context_data?: string // Structured JSON string
}

export function formatCompetitionPrompt(params: CompetitionPromptParams): string {
  let extraContextSection = ''
  let biasWarning = ''

  if (params.extra_context_data && params.extra_context_data !== '{}') {
    extraContextSection = `### IMPORTANT: Private Context Contains Biased Competition Claims

The startup has made the following claims about their competition in private materials:

${params.extra_context_data}

**CRITICAL INSTRUCTIONS:**
- These claims are SELF-REPORTED and designed to make the company look favorable
- DO NOT accept these claims at face value
- Use your independent knowledge and research to identify real competitors
- If the startup claims "no competitors" or "we're unique," be especially skeptical
- Cross-reference any competition claims with your own analysis
- It's normal for startups to downplay competitors or exaggerate their uniqueness in pitch materials`

    biasWarning = `
### ⚠️ BIAS AWARENESS
The extra context provided contains the startup's own claims about competitors. These claims are inherently biased.
Your competition analysis should be INDEPENDENT and based on:
1. Your knowledge of the market and sector
2. Problem similarity (not the startup's claims)
3. Objective assessment of overlapping solutions

Do NOT let the startup's self-serving statements influence your competitor list.`
  }

  return COMPETITION_PROMPT.replace('{{startup_name}}', params.startup_name)
    .replace('{{startup_url}}', params.startup_url)
    .replace('{{problem_general}}', params.problem_general)
    .replace('{{problem_example}}', params.problem_example)
    .replace('{{solution_what}}', params.solution_what)
    .replace('{{solution_how}}', params.solution_how)
    .replace('{{solution_example}}', params.solution_example)
    .replace('{{product_type}}', params.product_type)
    .replace('{{sector}}', params.sector)
    .replace('{{subsector}}', params.subsector)
    .replace('{{active_locations}}', params.active_locations)
    .replace('{{extra_context_section}}', extraContextSection)
    .replace('{{bias_warning}}', biasWarning)
}
