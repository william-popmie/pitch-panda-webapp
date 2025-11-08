# Vision AI Module

This module provides image analysis capabilities for the Pitch Panda application, allowing users to upload pitch deck slides, financial charts, team photos, and other startup-related images to extract structured data.

## Overview

The vision module uses OpenAI's GPT-4o with vision capabilities to analyze images and extract relevant startup information that can be used alongside the web scraping and text analysis pipeline.

## Features

- **Multi-image support**: Process multiple images in a single request
- **Smart data extraction**: Automatically extracts financial metrics, market data, team info, traction metrics, and more
- **Structured output**: Returns extracted data in a format that integrates seamlessly with the extra context system
- **Error handling**: Gracefully handles failed image processing while continuing with other images

## Architecture

```
src/ai/vision/
├── image-analyzer.ts     # Core vision AI functionality
└── README.md            # This file
```

### Integration with LangGraph Pipeline

The vision module integrates at the beginning of the analysis pipeline:

1. **Image Upload** (UI) → User uploads images via InputForm
2. **Image Analysis** (Vision AI) → Images are processed with GPT-4o Vision
3. **Context Merging** (App) → Extracted data is appended to extra_context
4. **Extra Context Extraction** (LangGraph Node) → Structured data is parsed
5. **Main Analysis Pipeline** → Data flows through all analysis nodes

This keeps the vision module modular and maintains the existing LangGraph structure.

## Usage

### Basic Example

```typescript
import { analyzeMultipleImages } from './ai/vision/image-analyzer'

// Analyze multiple images
const images: File[] = [pitchDeckSlide1, financialChart, teamPhoto]
const extractedContext = await analyzeMultipleImages(images)

// extractedContext contains structured text that can be added to extra_context
console.log(extractedContext)
```

### Single Image Analysis

```typescript
import { analyzeImage, fileToBase64 } from './ai/vision/image-analyzer'

// Convert file to base64
const base64Image = await fileToBase64(imageFile)

// Analyze single image
const analysis = await analyzeImage(base64Image)
console.log(analysis)
```

## Data Extraction

The vision AI is prompted to extract the following types of information:

### Financial Data

- Revenue metrics (MRR, ARR, growth rates)
- Funding information (amounts, investors, rounds)
- Burn rate, runway, valuation
- Customer acquisition costs, LTV, unit economics

### Market Data

- TAM/SAM/SOM figures
- Market size estimates
- Growth projections
- Target customer segments

### Traction & Metrics

- User counts, customer counts
- Growth curves, retention rates
- Key performance indicators
- Milestone achievements

### Team Information

- Team member names and roles
- Founder backgrounds
- Advisory board members
- Company size

### Product Information

- Product features or roadmap
- Technology stack
- Use cases or examples
- Screenshots of the product

### Competition

- Competitor names mentioned
- Competitive positioning
- Comparison charts or matrices
- Claims about advantages vs competitors

### Other

- Partnerships or strategic relationships
- Press coverage or awards
- Regulatory approvals or certifications
- Geographic expansion plans

## Configuration

The vision module uses the same OpenAI API key as the main LLM module:

```bash
# .env file
VITE_OPENAI_API_KEY=sk-...
```

### Model Settings

- **Model**: `gpt-4o` (supports vision)
- **Detail Level**: `high` (for better text extraction from charts/slides)
- **Temperature**: `0.1` (low for factual extraction)
- **Max Tokens**: `2000` (per image)

## Output Format

Each image returns structured text output:

```markdown
### Image 1: pitch-deck-slide-5.png

**Financial Data:**

- MRR: $45K (as of October 2024)
- ARR: $540K projected
- Monthly growth: 15%

**Traction:**

- 80 paying customers
- 2,500 active users
- 85% customer retention rate

**Market Size (from pitch deck):**

- TAM: $50B (payments industry)
- SAM: $5B (SMB segment)
- SOM: $500M (initial target market)

...
```

Multiple images are combined with separators:

```markdown
### Image 1: slide-1.png

...

---

### Image 2: financial-chart.png

...

---

### Image 3: team-photo.png

...
```

## Error Handling

- **API Errors**: Logged to console, returns error message for that image
- **File Read Errors**: Handled gracefully, processing continues with other images
- **Invalid File Types**: Filtered out before processing (only image/\* types accepted)

## Performance Considerations

- **Sequential Processing**: Images are analyzed one at a time to avoid rate limits
- **Token Usage**: Each image uses ~2000 tokens max
- **Cost**: ~$0.01-0.03 per image depending on size and complexity
- **Time**: ~2-5 seconds per image

## Future Enhancements

Potential improvements for the vision module:

1. **Batch Processing**: Analyze multiple images in parallel with rate limiting
2. **Image Preprocessing**: Resize large images to reduce costs
3. **OCR Fallback**: Use dedicated OCR for text-heavy slides
4. **Chart Recognition**: Specialized processing for financial charts and graphs
5. **Caching**: Cache image analysis results to avoid re-processing
6. **Format Support**: Add PDF slide extraction (convert PDF pages to images)

## Testing

To test the vision module:

```typescript
// Example test with mock data
const testImage = new File(['...'], 'test.png', { type: 'image/png' })
const result = await analyzeMultipleImages([testImage])
console.log(result)
```

## Dependencies

- OpenAI API (GPT-4o with vision)
- Native browser File API
- FileReader API for base64 conversion

No additional npm packages required beyond existing OpenAI integration.
