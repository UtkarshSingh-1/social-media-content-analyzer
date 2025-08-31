import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min?url'
import Tesseract from 'tesseract.js'

GlobalWorkerOptions.workerSrc = workerUrl

export async function extractTextFromPdf(file, onProgress) {
  const arrayBuffer = await file.arrayBuffer()
  const loadingTask = getDocument({ data: arrayBuffer })
  const pdf = await loadingTask.promise
  let fullText = ''
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const textContent = await page.getTextContent()
    const pageText = normalizePdfText(textContent)
    fullText += pageText + '\n\n'
    if (onProgress) onProgress(Math.round((p / pdf.numPages) * 80))
  }

  if (fullText.trim().length < 40) {
    let ocrText = ''
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p)
      const viewport = page.getViewport({ scale: 2 })
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.width = viewport.width
      canvas.height = viewport.height
      await page.render({ canvasContext: context, viewport }).promise
      if (onProgress) onProgress(80 + Math.round((p / pdf.numPages) * 20))
      const { data: { text } } = await Tesseract.recognize(canvas, 'eng')
      ocrText += text + '\n\n'
    }
    return ocrText
  }

  if (onProgress) onProgress(100)
  return fullText
}

function normalizePdfText(textContent) {
  const lines = {}
  textContent.items.forEach(item => {
    const y = item.transform[5]
    const key = Math.round(y).toString()
    if (!lines[key]) lines[key] = []
    lines[key].push(item.str)
  })
  const sortedKeys = Object.keys(lines).sort((a,b)=> Number(b)-Number(a))
  return sortedKeys.map(k => lines[k].join(' ')).join('\n')
}
