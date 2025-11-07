// Analysis pipeline - fetches website, calls AI, validates results
import type { Analysis, AnalysisRequest } from '../types'

// Fetch website text (simplified version)
function fetchWebsiteText(url: string): string {
  // Ensure URL has protocol
  const fullUrl = url.startsWith('http') ? url : `https://${url}`

  // In a real app, you'd need a CORS proxy or backend API
  // For now, return a placeholder
  console.log('Fetching website:', fullUrl)

  // TODO: Implement actual web scraping via backend API
  return `Mock website content for ${fullUrl}. 
    In production, this would fetch and parse the actual website content.
    You'll need a backend API or CORS proxy to fetch external websites.`
}

// Generate mock analysis (replace with real AI later)
function generateMockAnalysis(request: AnalysisRequest): Omit<Analysis, 'id' | 'created_at'> {
  return {
    startup_name: request.startup_name,
    startup_url: request.startup_url,
    problem: {
      general:
        'Mock problem description. Connect AI to analyze the actual startup problem from their website.',
      example: 'Example scenario: A user faces this specific challenge in their daily workflow.',
    },
    solution: {
      what_it_is: 'SaaS Platform',
      how_it_works:
        'Mock solution description. The AI will analyze how the startup solves the problem.',
      example: 'Example: User uses the platform to solve their problem efficiently.',
    },
    product_type: 'SaaS',
    sector: 'Technology',
    subsector: 'Business Software',
    active_locations: ['United States', 'Europe'],
    competition: [
      {
        name: 'Mock Competitor 1',
        website: 'https://example.com',
        product_type: 'SaaS',
        sector: 'Technology',
        subsector: 'Business Software',
        problem_similarity: 'Solves a very similar problem in the same market segment.',
        solution_summary: 'Provides a competing solution with similar features.',
        similarities: ['Both target the same customer segment', 'Similar pricing model'],
        differences: ['Different technology stack', 'More focused on enterprise customers'],
        active_locations: ['United States'],
        sources: ['https://example.com'],
      },
      {
        name: 'Mock Competitor 2',
        website: 'https://example2.com',
        product_type: 'Platform',
        sector: 'Technology',
        subsector: 'Business Software',
        problem_similarity: 'Addresses the same core problem with a different approach.',
        solution_summary: 'Alternative solution focusing on different use cases.',
        similarities: ['Same target market', 'Similar value proposition'],
        differences: ['Different business model', 'More features but higher complexity'],
        active_locations: ['Global'],
        sources: ['https://example2.com'],
      },
    ],
    sources: [request.startup_url],
  }
}

// Main analysis pipeline
export function analyzeStartup(request: AnalysisRequest): Omit<Analysis, 'id' | 'created_at'> {
  try {
    // Step 1: Fetch website text (for future AI integration)
    fetchWebsiteText(request.startup_url)

    // Step 2: Analyze with AI (currently returns mock data)
    // TODO: Uncomment and implement when AI is connected:
    /*
    const websiteText = fetchWebsiteText(request.startup_url)
    const prompt = PROBLEM_SOLUTION_PROMPT(
      request.startup_name,
      request.startup_url,
      websiteText
    )
    const analysisResult = await analyzeWithAI(prompt)
    
    // Step 3: Get competition
    const compPrompt = COMPETITION_PROMPT({
      startup_name: request.startup_name,
      startup_url: request.startup_url,
      problem_general: analysisResult.problem.general,
      solution_what: analysisResult.solution.what_it_is,
      product_type: analysisResult.product_type,
      sector: analysisResult.sector,
      subsector: analysisResult.subsector,
    })
    const competitionResult = await analyzeWithAI(compPrompt)
    */

    // For now, return mock data
    const analysis = generateMockAnalysis(request)

    return analysis
  } catch (error) {
    console.error('Analysis pipeline error:', error)
    throw new Error('Failed to analyze startup')
  }
}
