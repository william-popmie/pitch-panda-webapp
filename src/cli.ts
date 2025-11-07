#!/usr/bin/env node

// Load environment variables from .env file FIRST
import { config } from 'dotenv'
config()

// Verify API key is loaded
if (!process.env.VITE_OPENAI_API_KEY) {
  console.error('❌ Error: VITE_OPENAI_API_KEY not found in .env file')
  console.error('Please make sure your .env file exists and contains:')
  console.error('VITE_OPENAI_API_KEY=your_api_key_here')
  process.exit(1)
}

// CLI tool for running analysis from command line
import { runAnalysis } from './ai/orchestration/graph'
import { renderMarkdown } from './ai/core/renderer'
import { slugify } from './utils/string'
import fs from 'fs'
import path from 'path'

const OUTPUT_DIR = path.join(process.cwd(), 'output')

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length < 2) {
    console.log(`
🐼 Pitch Panda CLI

Usage: npm run cli <startup_name> <startup_url> [extra_context]

Arguments:
  startup_name   - Name of the startup to analyze
  startup_url    - Website URL (with or without https://)
  extra_context  - (Optional) Additional context like "MRR: $50K, Seed stage, 15 employees"

Example:
  npm run cli "Stripe" "stripe.com"
  npm run cli "OpenAI" "openai.com" "Series C, $10M ARR, 100 employees"
    `)
    process.exit(1)
  }

  const startupName = args[0]
  const startupUrl = args[1]
  const extraContext = args[2] || '' // Optional third argument

  try {
    // Run analysis
    const analysis = await runAnalysis(startupName, startupUrl, extraContext)

    // Render markdown
    const markdown = renderMarkdown(startupName, startupUrl, analysis)

    // Save to file
    ensureDir(OUTPUT_DIR)
    const filename = `${slugify(startupName)}.md`
    const filepath = path.join(OUTPUT_DIR, filename)

    fs.writeFileSync(filepath, markdown, 'utf-8')

    console.log(`✅ Wrote ${filepath}`)
    console.log(`\n📊 Analysis Summary:`)
    console.log(`   Problem: ${analysis.problem.general.substring(0, 100)}...`)
    console.log(`   Solution: ${analysis.solution.what_it_is}`)
    console.log(`   Sector: ${analysis.sector} / ${analysis.subsector}`)
    console.log(`   Competition: ${analysis.competition.length} competitors found`)
    if (analysis.extra_context) {
      console.log(`   Extra Context: Provided and processed`)
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

void main()
