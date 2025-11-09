/**
 * Deck Ingestion Node
 * Processes uploaded PDF/images into slide images
 */

import type { StartupState } from '../schemas/startup'
import type { SlideImage } from '../schemas/deck'

/**
 * Ingest deck slides (already converted to images by UI)
 *
 * Updates state:
 * - deck_slides: array of slide images
 *
 * Note: The actual PDF-to-image conversion happens in the UI layer
 * before the state is initialized. This node just validates and confirms.
 */
export function ingestDeck(state: StartupState): Partial<StartupState> {
  console.log(`[IngestDeck] Processing ${state.deck_slides?.length || 0} deck slides`)

  try {
    if (!state.deck_slides || state.deck_slides.length === 0) {
      console.warn('[IngestDeck] No deck slides provided')
      return {
        deck_slides: [],
      }
    }

    // Validate slide structure
    const validSlides: SlideImage[] = state.deck_slides.filter(slide => {
      return slide.page && slide.imageDataUrl && slide.imageDataUrl.startsWith('data:image/')
    })

    if (validSlides.length !== state.deck_slides.length) {
      console.warn(
        `[IngestDeck] Filtered out ${state.deck_slides.length - validSlides.length} invalid slides`
      )
    }

    console.log(`[IngestDeck] Successfully validated ${validSlides.length} slides`)

    return {
      deck_slides: validSlides,
    }
  } catch (error) {
    const errorMessage = `Failed to ingest deck: ${error instanceof Error ? error.message : String(error)}`
    console.error(`[IngestDeck] ${errorMessage}`)

    return {
      deck_slides: [],
      errors: [...state.errors, errorMessage],
    }
  }
}
