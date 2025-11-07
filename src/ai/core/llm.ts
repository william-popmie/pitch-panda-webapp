// OpenAI LLM interface

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenAIResponse {
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

export async function callLLM(prompt: string): Promise<string> {
  // Get API key lazily (not at module load time)
  const OPENAI_API_KEY = getAPIKey()

  try {
    const messages: OpenAIMessage[] = [{ role: 'user', content: prompt }]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenAI API error (${response.status}): ${error}`)
    }

    const data = (await response.json()) as OpenAIResponse
    return data.choices[0].message.content
  } catch (error) {
    console.error('LLM call failed:', error)
    throw error
  }
}

export function parseJSON<T>(jsonString: string): T {
  try {
    return JSON.parse(jsonString) as T
  } catch (error) {
    console.error('Failed to parse JSON:', error)
    console.error('Raw response:', jsonString)
    throw new Error('Invalid JSON response from AI')
  }
}
