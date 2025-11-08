# Image Context Feature - Usage Guide

## Overview

The Pitch Panda application now supports analyzing images (pitch deck slides, charts, screenshots) to extract structured startup data. This feature uses AI vision to process images and automatically append the extracted information to the extra context field.

## How It Works

### 1. User Flow

1. User fills in startup name and URL
2. User optionally adds text in the "Extra Context" field
3. User uploads one or more images (pitch deck slides, charts, etc.)
4. User clicks "Analyze Startup"

### 2. Processing Pipeline

```
┌─────────────────┐
│  User uploads   │
│     images      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Vision AI      │◄─── GPT-4o with Vision
│  analyzes each  │     (high detail mode)
│     image       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Extracted data │
│  formatted as   │
│  structured     │
│     text        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Append to      │
│  extra_context  │
│  input field    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  LangGraph      │
│  pipeline       │
│  processes      │
│  combined       │
│  context        │
└─────────────────┘
```

### 3. Technical Flow

```typescript
// In App.tsx
const handleAnalyze = async request => {
  // Step 1: Process images if any
  let imageContext = ''
  if (request.images?.length > 0) {
    imageContext = await analyzeMultipleImages(request.images)
  }

  // Step 2: Combine with text context
  let combinedContext = request.extra_context || ''
  if (imageContext) {
    combinedContext = combinedContext
      ? `${combinedContext}\n\n---\n\n## DATA EXTRACTED FROM IMAGES:\n\n${imageContext}`
      : `## DATA EXTRACTED FROM IMAGES:\n\n${imageContext}`
  }

  // Step 3: Run analysis with combined context
  const analysisData = await runAnalysis(request.startup_name, request.startup_url, combinedContext)
}
```

## Example Scenarios

### Scenario 1: Pitch Deck Financial Slide

**User uploads:**

- Slide showing "Monthly Recurring Revenue: $50K" and a growth chart

**Vision AI extracts:**

```markdown
### Image 1: financials.png

**Financial Data:**

- MRR: $50K (as of October 2024)
- Growth: 15% month-over-month (from chart)
- Projected ARR: $600K

**Chart Analysis:**

- Shows consistent upward trend from March to October 2024
- Revenue doubled from $25K to $50K in 7 months
```

**Result:**
This data is automatically added to extra_context and processed by the existing LangGraph pipeline, appearing in the final analysis under traction metrics.

### Scenario 2: Team Slide

**User uploads:**

- Slide with team member photos and bios

**Vision AI extracts:**

```markdown
### Image 1: team-slide.png

**Team Information:**

- CEO: John Smith - Former VP at Google, 10 years in SaaS
- CTO: Jane Doe - Ex-Amazon, PhD in Machine Learning
- Head of Product: Mike Johnson - 3 successful startup exits
- Team size: 15 people (from slide footer)

**Founder Backgrounds:**
All three co-founders have complementary experience in enterprise software and AI
```

### Scenario 3: Market Size Slide

**User uploads:**

- TAM/SAM/SOM breakdown with charts

**Vision AI extracts:**

```markdown
### Image 1: market-analysis.png

**Market Data (from pitch deck):**

- TAM: $50B (global payments industry)
- SAM: $5B (SMB segment in North America)
- SOM: $500M (initial target: online retailers under $10M revenue)

**Growth Projections:**

- Market growing at 12% CAGR (shown in chart)
- SMB digitization accelerating post-pandemic
```

### Scenario 4: Competition Matrix

**User uploads:**

- Competitive comparison chart

**Vision AI extracts:**

```markdown
### Image 1: competition.png

**Competition Claims (from pitch deck - treat with skepticism):**

- Lists Stripe, Square, PayPal as competitors
- Claims to be "only solution with real-time fraud detection"
- States competitors are "2-3x more expensive for SMBs"
- Shows feature comparison matrix placing themselves ahead in 8/10 categories

**Differences Claimed:**

- Real-time ML-based fraud detection (vs. rule-based)
- No monthly fees (vs. $30-100/month for competitors)
- 1-day setup (vs. 1-2 weeks)
```

## Data Extraction Categories

The Vision AI is trained to extract:

✅ **Financial Metrics**: MRR, ARR, burn rate, runway, valuation  
✅ **Funding Info**: Rounds, amounts, investor names  
✅ **Traction**: Customer counts, growth rates, retention  
✅ **Team**: Names, roles, backgrounds, company size  
✅ **Market Data**: TAM/SAM/SOM, growth trends  
✅ **Product**: Features, roadmap, screenshots  
✅ **Competition**: Competitors mentioned, claims made  
✅ **Partnerships**: LOIs, strategic relationships  
✅ **Other**: Awards, press, regulatory approvals

## UI Elements

### Upload Button

```tsx
📎 Click to upload pitch deck slides, charts, or screenshots
```

### Image Preview List

Shows uploaded images with:

- File name
- Remove button for each image

### Loading State

```
Analyzing 3 image(s) and fetching website data...
```

## Integration Points

### 1. InputForm.tsx

- Manages image state
- Handles file upload
- Shows preview of uploaded images
- Passes images to parent component

### 2. App.tsx

- Receives images from InputForm
- Calls `analyzeMultipleImages()`
- Merges image context with text context
- Passes combined context to LangGraph pipeline

### 3. LangGraph Pipeline (graph.ts)

- No changes needed!
- Receives enriched extra_context
- Processes it through existing nodes
- Data flows through all analysis phases

## Performance & Cost

### Processing Time

- ~2-5 seconds per image
- Sequential processing (one at a time)
- Total time: (number of images × 3 seconds) + normal analysis time

### API Costs

- ~$0.01-0.03 per image
- 5 images ≈ $0.05-0.15
- Uses GPT-4o with vision (high detail mode)

### Token Usage

- ~2000 tokens max per image
- Includes prompt + image analysis

## Error Handling

### Invalid File Types

- Automatically filtered (only accepts `image/*`)
- User can only select valid image formats

### Analysis Failures

- If one image fails, others continue processing
- Error logged to console
- Error message added for failed image:
  ```
  ### Image 2: broken-image.png
  Error: Failed to analyze this image
  ```

### API Errors

- Graceful degradation
- Analysis continues without image data
- User sees error message in UI

## Best Practices

### For Users

1. Upload high-quality, clear images
2. Focus on slides with data/metrics
3. Upload multiple angles of the same data for redundancy
4. Include relevant context in text field too (vision AI as supplement)

### For Developers

1. Keep vision module separate from main pipeline
2. Process images before web scraping (parallel would be better)
3. Clearly mark extracted data as "from images"
4. Validate extracted data in LangGraph nodes

## Future Enhancements

Potential improvements:

1. **PDF Upload**: Extract and analyze PDF pitch decks (convert pages to images)
2. **Drag & Drop**: Better UX for image upload
3. **Image Previews**: Show thumbnail previews before upload
4. **Batch Processing**: Parallel image analysis with rate limiting
5. **Progress Indicator**: Show which image is being processed
6. **Smart Caching**: Cache image analysis to avoid reprocessing
7. **Chart Extraction**: Specialized processing for graphs/charts
8. **OCR Fallback**: Use Tesseract.js for text-heavy slides

## Testing

### Manual Testing

1. Upload a pitch deck slide with financial metrics
2. Check that data appears in analysis results
3. Verify that extra_context is properly combined
4. Test with multiple images
5. Test with no images (should work normally)
6. Test error cases (invalid files, API errors)

### Example Test Images

Good test images:

- Pitch deck slide with TAM/SAM/SOM
- Slide with team member bios
- Financial chart showing growth
- Screenshot of product interface
- Competitive comparison matrix

## Troubleshooting

### Images not being analyzed

- Check browser console for errors
- Verify API key is set (`VITE_OPENAI_API_KEY`)
- Check file types (must be image/\*)
- Ensure files are not too large (browser limits)

### Poor extraction quality

- Use high-resolution images
- Ensure text is readable
- Try re-uploading or using different image format
- Check that image shows data clearly

### Analysis taking too long

- Normal for many images (3-5 sec each)
- Consider reducing number of images
- Use most relevant slides only

## Architecture Decision Records

### Why separate vision module?

- **Modularity**: Easy to maintain and test independently
- **Reusability**: Can be used in CLI or other interfaces
- **Clean separation**: Vision is preprocessing, not core analysis
- **No LangGraph changes**: Existing pipeline remains untouched

### Why append to extra_context?

- **Consistency**: Same data flow as manual context
- **Existing validation**: LangGraph already handles extra_context
- **Transparency**: Clear what data came from images
- **Simple integration**: No schema changes needed

### Why sequential processing?

- **Rate limiting**: Avoid OpenAI API rate limits
- **Predictability**: Easier to debug and monitor
- **Cost control**: Prevents accidental huge bills
- **User feedback**: Can show progress per image

## Related Files

- `src/ai/vision/image-analyzer.ts` - Core vision functionality
- `src/ai/vision/README.md` - Technical documentation
- `src/ui/InputForm.tsx` - Image upload UI
- `src/ui/App.tsx` - Image processing orchestration
- `src/ai/orchestration/graph.ts` - Main analysis pipeline (unchanged)
- `src/ai/prompts/extra_context.ts` - Context extraction prompt (unchanged)
