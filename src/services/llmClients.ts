/**
 * LLM client services for text and vision models
 * Provides helpers for interacting with OpenAI and other LLM providers
 */

import { ChatOpenAI } from '@langchain/openai'
import { z } from 'zod'

/**
 * Configuration for LLM clients
 */
export interface LLMConfig {
  apiKey?: string
  model?: string
  temperature?: number
  maxTokens?: number
}

/**
 * Get a text-only LLM client
 * Optimized for structured output and reasoning tasks
 */
export function getTextLLM(config: LLMConfig = {}): ChatOpenAI {
  const apiKey = config.apiKey || import.meta.env.VITE_OPENAI_API_KEY

  if (!apiKey) {
    console.error('Available env vars:', Object.keys(import.meta.env))
    console.error(
      'VITE_OPENAI_API_KEY:',
      import.meta.env.VITE_OPENAI_API_KEY ? 'exists' : 'missing'
    )
    throw new Error(
      'OpenAI API key is required. Please set VITE_OPENAI_API_KEY in your .env file and restart the dev server.'
    )
  }

  return new ChatOpenAI({
    model: config.model || 'gpt-4o', // Current stable model
    temperature: config.temperature ?? 0.1,
    maxTokens: config.maxTokens,
    apiKey: apiKey,
    configuration: {
      apiKey: apiKey,
    },
  })
}

/**
 * Get a vision-capable LLM client
 * For multimodal understanding of images and slides
 */
export function getVisionLLM(config: LLMConfig = {}): ChatOpenAI {
  const apiKey = config.apiKey || import.meta.env.VITE_OPENAI_API_KEY

  if (!apiKey) {
    console.error('Available env vars:', Object.keys(import.meta.env))
    console.error(
      'VITE_OPENAI_API_KEY:',
      import.meta.env.VITE_OPENAI_API_KEY ? 'exists' : 'missing'
    )
    throw new Error(
      'OpenAI API key is required. Please set VITE_OPENAI_API_KEY in your .env file and restart the dev server.'
    )
  }

  return new ChatOpenAI({
    model: config.model || 'gpt-4o', // Updated from deprecated gpt-4-vision-preview
    temperature: config.temperature ?? 0.1,
    maxTokens: config.maxTokens || 4096,
    apiKey: apiKey,
    configuration: {
      apiKey: apiKey,
    },
  })
}

/**
 * Get an LLM with structured output capability
 * Uses function calling / JSON mode to ensure valid schema output
 */
export function getStructuredLLM<T extends z.ZodType>(schema: T, config: LLMConfig = {}) {
  const llm = getTextLLM(config)

  // Configure for structured output
  return llm.withStructuredOutput(schema, {
    name: 'structured_output',
  })
}

/**
 * Get a vision LLM with structured output
 */
export function getStructuredVisionLLM<T extends z.ZodType>(schema: T, config: LLMConfig = {}) {
  const llm = getVisionLLM(config)

  return llm.withStructuredOutput(schema, {
    name: 'structured_output',
  })
}

/**
 * Retry wrapper for LLM calls with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | undefined

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i)
        console.warn(`LLM call failed, retrying in ${delay}ms...`, error)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error('Max retries exceeded')
}

/**
 * Batch process items with LLM, with concurrency control
 */
export async function batchProcess<TInput, TOutput>(
  items: TInput[],
  processFn: (item: TInput) => Promise<TOutput>,
  concurrency = 3
): Promise<TOutput[]> {
  const results: TOutput[] = []
  const queue = [...items]

  async function processNext(): Promise<void> {
    const item = queue.shift()
    if (!item) return

    const result = await processFn(item)
    results.push(result)

    if (queue.length > 0) {
      await processNext()
    }
  }

  // Start initial batch
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => processNext())

  await Promise.all(workers)

  return results
}
