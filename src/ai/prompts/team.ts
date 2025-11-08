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
    "team_members": [
      {
        "name": "Full name of team member",
        "role": "Title/position, e.g., 'CEO', 'CTO', 'VP Engineering', 'Co-founder'",
        "past_experience": "Optional: Short summary of relevant background. E.g., 'ex-Google, 15 years in SaaS', 'Stanford CS, previously founded ExitCo (acquired)'"
      }
    ],
    "key_roles": [
      "DEPRECATED - use team_members instead. Only populate if team_members cannot be properly structured.",
      "Format: 'Role - Name (if available): brief 1-line background/expertise'"
    ],
    "founders": [
      "DEPRECATED - use team_members instead. Only populate if team_members cannot be properly structured.",
      "Format: 'Founder Name: 1-2 line background'"
    ],
    "expertise": "2-3 sentences summarizing the team's collective domain knowledge, technical skills, industry experience, and why they're well-positioned to solve this problem.",
    "sources": ["URLs where team info was found, e.g., '/about', '/team', LinkedIn profiles if mentioned"]
  }
}

### EXTRACTION GUIDELINES

**Team Members (Primary Method):**
- Extract individual team members with structured data: name, role, and optional background
- For each person mentioned:
  * **name**: Full name as stated (e.g., "John Smith", "Alice Chen")
  * **role**: Their title or position (e.g., "CEO", "CTO", "Co-founder & CEO", "VP Engineering", "Head of Product")
  * **past_experience**: Optional but valuable - include if mentioned:
    - Previous companies (e.g., "ex-Google", "previously at Amazon")
    - Educational background if notable (e.g., "Stanford CS PhD", "MIT graduate")
    - Prior roles or expertise (e.g., "15 years in SaaS", "former VP at Microsoft")
    - Notable achievements (e.g., "founded ExitCo (acquired by BigCo)", "led team of 50 at Stripe")
- Look for "About", "Team", "Leadership", "Our Story", "Founders" sections
- Extract from bio sections, team pages, or anywhere team members are described

**Team Size:**
- Infer from "We're a team of X" or number of people shown in team photos/bios
- Use ranges: "1-5", "5-10", "10-50", "50-100", "100+"
- If truly unknown, use "Unknown"

**Collective Expertise:**
- Synthesize the team's overall capabilities and why they're credible for this problem
- Connect team backgrounds to the problem/solution domain
- Mention domain expertise, technical capabilities, industry connections
- Be concise (2-3 sentences)

**Backward Compatibility (Deprecated Fields):**
- key_roles and founders fields are deprecated in favor of team_members
- Only populate these if structured extraction fails for some reason
- In normal cases, leave key_roles and founders as empty arrays []

**Evidence-Based:**
- Only include what's verifiable from website or reasonable inference
- If website doesn't mention team details, use "Unknown" or empty arrays
- Don't speculate beyond reasonable inference from website content

### STYLE GUIDE
- Be concise but informative
- Focus on relevant experience that builds credibility for solving the stated problem
- For past_experience: keep it to 1-2 short phrases per person (e.g., "ex-Amazon, 10 years in ML" NOT a full paragraph)
- Mention notable companies, education (if prestigious/relevant), or domain expertise
- Keep team_members array focused on leadership and key contributors (don't list every employee if 50+ people)
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
- **team_members array**: If present, extract and populate the team_members array in your output
  * Use the name, role, and past_experience fields directly
  * This is FIRST-CLASS DATA - treat it as accurate founder-provided information
- **team_size_claimed**: If stated, use this for the size field (but cross-check with website if possible)
- **key_hires**: Incorporate into team_members array with appropriate roles
- Combine website evidence with extra context for a complete picture
- If there are conflicts between website and extra context:
  * Prefer extra context for factual data (names, titles, team size)
  * Use website for public-facing expertise descriptions
  * Note both sources in the sources array

**Remember:**
- Extra context is from pitchdeck/founder materials - it's self-reported but factual
- Team member details (names, roles, backgrounds) are generally accurate
- Incorporate this data into the structured team_members array
- Don't just note it - actually populate the schema fields with this information

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
