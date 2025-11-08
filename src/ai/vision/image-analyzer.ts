// Vision AI module for analyzing images (pitch deck slides, screenshots, etc.)
// Uses OpenAI's GPT-4 Vision to extract text and structured data from images

interface OpenAIVisionMessage {
  role: 'system' | 'user'
  content: Array<{
    type: 'text' | 'image_url'
    text?: string
    image_url?: {
      url: string
      detail?: 'low' | 'high' | 'auto'
    }
  }>
}

interface OpenAIVisionResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

// Support both Vite (import.meta.env) and Node.js (process.env)
function getAPIKey(): string {
  // Check if running in Vite (browser/dev)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const key = import.meta.env.VITE_OPENAI_API_KEY
    if (!key) {
      throw new Error('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in .env file')
    }
    return key
  }
  // Check if running in Node.js (CLI)
  if (typeof process !== 'undefined') {
    const env = process.env as Record<string, string | undefined>
    const key = env.VITE_OPENAI_API_KEY
    if (!key) {
      throw new Error('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in .env file')
    }
    return key
  }
  throw new Error('Cannot access environment variables')
}

/**
 * Convert a File object to a base64 data URL
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result)
    }
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Analyze a single image using GPT-4 Vision
 * Extracts structured data relevant to pitch deck analysis
 */
export async function analyzeImage(imageDataUrl: string): Promise<string> {
  const OPENAI_API_KEY = getAPIKey()

  const prompt = `You are an expert at analyzing pitch deck slides, financial charts, team photos, product screenshots, and other startup-related images.

Extract ALL relevant information from this image that would be useful for analyzing a startup. Focus on:

**Financial Data:**
- Revenue metrics (MRR, ARR, growth rates)
- Funding information (amounts, investors, rounds)
- Burn rate, runway, valuation
- Customer acquisition costs, LTV, unit economics

**Market Data:**
- TAM/SAM/SOM figures
- Market size estimates
- Growth projections
- Target customer segments

**Traction & Metrics:**
- User counts, customer counts
- Growth curves, retention rates
- Key performance indicators
- Milestone achievements

**Team Information:**
- Team member names and roles
- Founder backgrounds
- Advisory board members
- Company size

**Product Information:**
- Product features or roadmap
- Technology stack
- Use cases or examples
- Screenshots of the product

**Competition:**
- Competitor names mentioned
- Competitive positioning
- Comparison charts or matrices
- Claims about advantages vs competitors

**Other Relevant Data:**
- Partnerships or strategic relationships
- Press coverage or awards
- Regulatory approvals or certifications
- Geographic expansion plans
- Timeline or milestones

**Instructions:**
- Extract data exactly as shown (preserve numbers, percentages, currency symbols)
- If the image shows a chart/graph, describe the trend and extract key data points
- If text is hard to read, indicate uncertainty with "possibly" or "unclear"
- If the image is a team photo, list names and roles if visible
- If the image shows product screenshots, describe what the product does
- Organize the extracted data in clear, structured format
- If the image contains multiple slides or sections, separate them clearly
- If nothing relevant is found, say "No relevant startup data found in this image"

Return your analysis as structured text that can be added to extra context.`

  try {
    const messages: OpenAIVisionMessage[] = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt,
          },
          {
            type: 'image_url',
            image_url: {
              url: imageDataUrl,
              detail: 'high', // Use high detail for better text extraction
            },
          },
        ],
      },
    ]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o', // gpt-4o supports vision
        messages,
        max_tokens: 2000,
        temperature: 0.1, // Low temperature for factual extraction
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenAI Vision API error (${response.status}): ${error}`)
    }

    const data = (await response.json()) as OpenAIVisionResponse
    return data.choices[0].message.content
  } catch (error) {
    console.error('Vision API call failed:', error)
    throw error
  }
}

export interface ImageAnalysisResult {
  fileName: string
  fileDataUrl: string // For preview
  analysis: string
  error?: string
}

/**
 * Analyze multiple images and return structured results
 */
export async function analyzeMultipleImages(
  images: File[]
): Promise<{ results: ImageAnalysisResult[]; combinedText: string }> {
  if (images.length === 0) {
    return { results: [], combinedText: '' }
  }

  console.log(`🖼️  Analyzing ${images.length} image(s) with Vision AI...`)

  const results: ImageAnalysisResult[] = []
  const textResults: string[] = []

  for (let i = 0; i < images.length; i++) {
    const image = images[i]
    console.log(`  Processing image ${i + 1}/${images.length}: ${image.name}`)

    try {
      const base64 = await fileToBase64(image)
      const analysis = await analyzeImage(base64)

      results.push({
        fileName: image.name,
        fileDataUrl: base64,
        analysis,
      })

      textResults.push(`### Image ${i + 1}: ${image.name}\n\n${analysis}`)
    } catch (error) {
      console.error(`Failed to analyze image ${image.name}:`, error)
      const errorMsg = error instanceof Error ? error.message : 'Failed to analyze this image'

      results.push({
        fileName: image.name,
        fileDataUrl: await fileToBase64(image).catch(() => ''),
        analysis: '',
        error: errorMsg,
      })

      textResults.push(`### Image ${i + 1}: ${image.name}\n\nError: ${errorMsg}`)
    }
  }

  const combinedText = textResults.join('\n\n---\n\n')
  console.log(`✅ Image analysis complete`)

  return { results, combinedText }
}
