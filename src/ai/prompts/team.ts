// Team analysis prompt

export const TEAM_PROMPT = `### 🧠 Prompt: "Startup Team Analysis"

**TASK**
You are an AI analyst. Analyze the startup's team based on the website content and validated startup profile.
Extract information about team size, key leadership roles, founders, and collective expertise.

TARGET STARTUP:
- Name: {{startup_name}}
- URL: {{startup_url}}
- Sector: {{sector}} / {{subsector}}
- Problem: {{problem_general}}
- Solution: {{solution_what}}

---

### Website Evidence (verbatim text, trimmed)
{{website_text}}

---

### OUTPUT REQUIREMENTS
Return JSON ONLY with this schema:

{
  "team": {
    "size": "Estimate or range: '1-5', '5-10', '10-50', '50-100', '100+', 'Unknown'",
    "key_roles": [
      "Role - Name (if available): brief 1-line background/expertise",
      "Example: 'CEO - John Smith: Former VP at Google, 15 years in SaaS'",
      "Example: 'CTO - Jane Doe: PhD in AI, ex-Amazon ML engineer'"
    ],
    "founders": [
      "Founder Name: 1-2 line background (education, previous companies, relevant expertise)",
      "Example: 'Alice Johnson: Stanford CS grad, previously founded ExitCo (acquired), expert in fintech'"
    ],
    "expertise": "2-3 sentences summarizing the team's collective domain knowledge, technical skills, industry experience, and why they're well-positioned to solve this problem.",
    "sources": ["URLs where team info was found, e.g., '/about', '/team', LinkedIn profiles if mentioned"]
  }
}

### EXTRACTION GUIDELINES
- Look for "About", "Team", "Leadership", "Our Story", "Careers" sections
- Extract names, titles, and background from bio sections
- Infer team size from "We're a team of X" or number of people shown
- For founders: prioritize their relevant background and why it matters for this startup
- For expertise: connect team background to the problem/solution domain
- If a field is unknown or not mentioned, use "Unknown" for strings or [] for arrays
- Be factual; avoid speculation beyond reasonable inference from website content

### STYLE GUIDE
- Be concise but informative
- Focus on relevant experience that builds credibility for solving the stated problem
- Mention notable past companies, education (if prestigious/relevant), or domain expertise
- Keep each role/founder description to 1-2 lines maximum
`

export interface TeamPromptParams {
  startup_name: string
  startup_url: string
  sector: string
  subsector: string
  problem_general: string
  solution_what: string
  website_text: string
  extra_context_data?: string // Structured JSON string
}

export function formatTeamPrompt(params: TeamPromptParams): string {
  let extraContextSection = ''

  if (params.extra_context_data && params.extra_context_data !== '{}') {
    extraContextSection = `

---

### Additional Private Context (Team Data)

The user has provided confidential information that may include team details:

${params.extra_context_data}

**How to Use:**
- If team size, founder names, or key roles are mentioned in the extra context, incorporate them
- Treat factual data (team size, names, roles, backgrounds) as accurate
- Combine website evidence with extra context for a complete picture
- If there are conflicts between website and extra context, note both sources

---
`
  }

  return TEAM_PROMPT.replace('{{startup_name}}', params.startup_name)
    .replace('{{startup_url}}', params.startup_url)
    .replace('{{sector}}', params.sector)
    .replace('{{subsector}}', params.subsector)
    .replace('{{problem_general}}', params.problem_general)
    .replace('{{solution_what}}', params.solution_what)
    .replace('{{website_text}}', params.website_text + extraContextSection)
}
