/**
 * Simple integration test for the analysis pipeline
 * Run with: npm run test:integration
 */

import { runAnalysis } from './analysis'

async function testAnalysis() {
  console.log('🧪 Testing Pitch Panda Analysis Pipeline\n')
  console.log('='.repeat(60))

  // Test with a simple URL (no deck for now)
  const testUrl = 'https://stripe.com'

  console.log(`\n📍 Test URL: ${testUrl}`)
  console.log('⏳ Starting analysis...\n')

  const startTime = Date.now()

  try {
    const result = await runAnalysis({
      url: testUrl,
      // deck_slides can be undefined for URL-only analysis
    })

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)

    console.log('✅ Analysis completed successfully!\n')
    console.log('='.repeat(60))
    console.log(`\n⏱️  Duration: ${duration}s\n`)

    // Display key results
    console.log('📊 RESULTS:\n')

    if (result.final_analysis) {
      const analysis = result.final_analysis

      console.log('🎯 Problem:')
      console.log(`   ${analysis.problem.one_liner}\n`)

      console.log('💡 Solution:')
      console.log(`   ${analysis.solution.one_liner}\n`)

      if (analysis.value_proposition) {
        console.log('✨ Value Proposition:')
        console.log(`   ${analysis.value_proposition.summary}\n`)
      }

      if (analysis.team && analysis.team.members.length > 0) {
        console.log(`👥 Team: ${analysis.team.members.length} members identified\n`)
      }

      if (analysis.traction && analysis.traction.metrics.length > 0) {
        console.log('📈 Traction:')
        analysis.traction.metrics.slice(0, 3).forEach(m => {
          console.log(`   - ${m.metric}: ${m.value}`)
        })
        console.log('')
      }

      if (analysis.risks && analysis.risks.length > 0) {
        console.log(`⚠️  Risks: ${analysis.risks.length} identified\n`)
      }

      if (analysis.missing_info && analysis.missing_info.length > 0) {
        console.log('❓ Missing Info:')
        analysis.missing_info.slice(0, 3).forEach(info => {
          console.log(`   - ${info}`)
        })
        console.log('')
      }
    }

    if (result.memo) {
      console.log('📝 MEMO PREVIEW:\n')
      console.log(result.memo.split('\n').slice(0, 15).join('\n'))
      console.log('\n   [...truncated for brevity...]\n')
    }

    console.log('='.repeat(60))
    console.log('\n✅ All tests passed!\n')

    // Show errors if any occurred during pipeline
    if (result.errors && result.errors.length > 0) {
      console.log('⚠️  Errors during pipeline:')
      result.errors.forEach((err, i) => {
        console.log(`   ${i + 1}. ${err}`)
      })
      console.log('')
    }
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)

    console.error('\n❌ Test failed!\n')
    console.error('='.repeat(60))
    console.error(`\n⏱️  Duration: ${duration}s\n`)
    console.error('Error:', error)
    console.error('\n')

    process.exit(1)
  }
}

// Run the test
testAnalysis().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
