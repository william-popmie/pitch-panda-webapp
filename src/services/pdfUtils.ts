/**
 * PDF processing utilities
 * Converts PDF files to images for multimodal LLM analysis
 */

import type { SlideImage } from '../schemas/deck'

/**
 * Convert a PDF file to an array of image data URLs
 * Uses pdf.js to render each page as an image
 */
export async function pdfToImages(file: File): Promise<SlideImage[]> {
  // Dynamic import to avoid bundling issues
  const pdfjsLib = await import('pdfjs-dist')

  // Set worker source - use local worker from node_modules
  // This works with Vite's build system
  const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.mjs?url')
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker.default

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  const slides: SlideImage[] = []

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const viewport = page.getViewport({ scale: 2.0 }) // Higher scale for better quality

    // Create canvas
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Failed to get canvas context')
    }

    canvas.height = viewport.height
    canvas.width = viewport.width

    // Render page to canvas
    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise

    // Convert to data URL
    const imageDataUrl = canvas.toDataURL('image/png')

    slides.push({
      page: pageNum,
      imageDataUrl,
      fileName: file.name,
    })
  }

  return slides
}

/**
 * Convert image files to SlideImage format
 */
export async function imagesToSlides(files: File[]): Promise<SlideImage[]> {
  const slides: SlideImage[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const imageDataUrl = await fileToDataURL(file)

    slides.push({
      page: i + 1,
      imageDataUrl,
      fileName: file.name,
    })
  }

  return slides
}

/**
 * Convert a File to a data URL
 */
function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Validate that a file is a PDF
 */
export function isPDF(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

/**
 * Validate that a file is an image
 */
export function isImage(file: File): boolean {
  return file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)
}

/**
 * Process deck files (PDF or images) into SlideImage array
 */
export async function processDeckFiles(files: File[]): Promise<SlideImage[]> {
  if (files.length === 0) {
    return []
  }

  // If first file is PDF, process it
  if (isPDF(files[0])) {
    return pdfToImages(files[0])
  }

  // Otherwise, treat as images
  const imageFiles = files.filter(isImage)
  return imagesToSlides(imageFiles)
}
