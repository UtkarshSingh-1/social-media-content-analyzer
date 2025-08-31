import Tesseract from 'tesseract.js'

export async function ocrImage(file, onProgress) {
  const { data: { text } } = await Tesseract.recognize(file, 'eng', {
    logger: m => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.min(100, Math.round(m.progress * 100)))
      }
    }
  })
  if (onProgress) onProgress(100)
  return text
}
