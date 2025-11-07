// AI prompts for analysis

export const PROBLEM_SOLUTION_PROMPT = (
  startupName: string,
  startupUrl: string,
  websiteText: string
) => `You are an AI analyst. For the given startup, identify:
1) The problem the startup is solving
2) The solution it provides
3) The product type
4) The sector and subsector
5) Active locations

Startup:
- Name: ${startupName}
- URL: ${startupUrl}

Website content: ${websiteText.substring(0, 5000)}

Return JSON with this schema:
{
  "problem": {
    "general": "1–3 sentences explaining who is affected and why it matters",
    "example": "A concrete scenario showing the pain"
  },
  "solution": {
    "what_it_is": "Short phrase naming the product",
    "how_it_works": "2–4 sentences describing the core mechanism",
    "example": "Concrete usage example"
  },
  "product_type": "SaaS | App | Platform | API | Service | Hardware | Marketplace | Other",
  "sector": "Broad industry",
  "subsector": "Specific niche",
  "active_locations": ["Countries/regions where active"],
  "sources": ["${startupUrl}"]
}`

export const COMPETITION_PROMPT = (analysis: {
  startup_name: string
  startup_url: string
  problem_general: string
  solution_what: string
  product_type: string
  sector: string
  subsector: string
}) => `You are an AI analyst. List 5-10 competing startups that solve the same or very similar problem.

TARGET STARTUP:
- Name: ${analysis.startup_name}
- URL: ${analysis.startup_url}
- Problem: ${analysis.problem_general}
- Solution: ${analysis.solution_what}
- Product type: ${analysis.product_type}
- Sector: ${analysis.sector} / ${analysis.subsector}

Return JSON:
{
  "competition": [
    {
      "name": "Company Name",
      "website": "https://...",
      "product_type": "...",
      "sector": "...",
      "subsector": "...",
      "problem_similarity": "How their problem overlaps",
      "solution_summary": "What they do",
      "similarities": ["overlap 1", "overlap 2"],
      "differences": ["difference 1", "difference 2"],
      "active_locations": ["Country"],
      "sources": ["https://..."]
    }
  ]
}`
