import React, { useState } from 'react'
import Dropzone from './components/Dropzone.jsx'
import { extractTextFromPdf } from './utils/pdf.js'
import { ocrImage } from './utils/ocr.js'
import { analyzeText } from './utils/textAnalysis.js'
import { motion, AnimatePresence } from 'framer-motion'

const Logo = () => (
  <div className="logo">SA</div>
)

const IconFile = ({size=20}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 12h6" stroke="#111827" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 16h6" stroke="#111827" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 2h6l4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" stroke="#111827" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconChart = ({size=20}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="12" width="3" height="8" rx="1" stroke="#111827" strokeWidth="1.4"/>
    <rect x="9" y="6" width="3" height="14" rx="1" stroke="#111827" strokeWidth="1.4"/>
    <rect x="15" y="10" width="3" height="10" rx="1" stroke="#111827" strokeWidth="1.4"/>
  </svg>
)

export default function App() {
  const [extracted, setExtracted] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [analysis, setAnalysis] = useState(null)

  async function handleFiles(files) {
    setError(''); setAnalysis(null); setExtracted(''); setProgress(0); setLoading(true)
    try {
      let combined = ''
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const ext = file.name.toLowerCase().split('.').pop()
        if (ext === 'pdf') {
          combined += `\n\n--- PDF: ${file.name} ---\n`
          const text = await extractTextFromPdf(file, p => setProgress(Math.round((i/files.length)*100 + p/files.length)))
          combined += text
        } else if (['png','jpg','jpeg','bmp','gif','webp','tiff'].includes(ext) || file.type.startsWith('image/')) {
          combined += `\n\n--- IMAGE: ${file.name} ---\n`
          const text = await ocrImage(file, p => setProgress(Math.round((i/files.length)*100 + p/files.length)))
          combined += text
        } else {
          throw new Error(`Unsupported file: ${file.name}`)
        }
      }
      setExtracted(combined.trim())
      setProgress(100)
    } catch (e) {
      console.error(e)
      setError(e.message || 'Something went wrong while processing your files.')
    } finally {
      setLoading(false)
    }
  }

  function runAnalysis() {
    const a = analyzeText(extracted)
    setAnalysis(a)
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <Logo />
        <button className="icon-btn" title="Upload">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3v12" stroke="#111827" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 7l4-4 4 4" stroke="#111827" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 15v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3" stroke="#111827" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button className="icon-btn" title="Documents"><IconFile /></button>
        <button className="icon-btn" title="Analytics"><IconChart /></button>
      </aside>

      <main>
        <div className="container">
          <div className="header">
            <div>
              <h1>Social Media Content Analyzer</h1>
              <div className="sub">Upload documents, extract text and get engagement suggestions</div>
            </div>
            <div>
              <button className="btn" onClick={() => { /* placeholder for quick upload */ }}>New Upload</button>
            </div>
          </div>

          <div className="grid">
            <div className="card">
              <Dropzone onFiles={handleFiles} />

              <div style={{marginTop:18}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{fontWeight:600}}>Processing</div>
                  <div style={{color:'var(--muted)',fontSize:13}}>{loading ? 'Working...' : 'Idle'}</div>
                </div>
                <div style={{marginTop:10}} className="progress"><div style={{width: progress + '%'}}></div></div>
              </div>

              {error && <div style={{marginTop:12,color:'#ef4444',fontWeight:700}}>{error}</div>}

              <div style={{marginTop:18}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{fontWeight:600}}>Extracted Text</div>
                  <div style={{color:'var(--muted)',fontSize:13}}>{extracted ? `${extracted.length} chars` : '—'}</div>
                </div>
                <div style={{marginTop:10}} className="extracted">{extracted || 'No text extracted yet. Upload a PDF or image to begin.'}</div>
              </div>
            </div>

            <div className="card">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div style={{fontWeight:700}}>Analyzer</div>
                <div style={{color:'var(--muted)',fontSize:13}}>Insights</div>
              </div>

              <div style={{marginTop:12}}>
                <button className="btn" onClick={runAnalysis} disabled={!extracted || loading}>Analyze Content</button>
              </div>

              <AnimatePresence>
                {analysis && (
                  <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}} style={{marginTop:16}}>
                    <div style={{fontWeight:700,marginBottom:8}}>Metrics</div>
                    <ul className="analysis-list">
                      <li className="analysis-item"><span>Characters</span><strong>{analysis.results.charCount}</strong></li>
                      <li className="analysis-item"><span>Words</span><strong>{analysis.results.wordCount}</strong></li>
                      <li className="analysis-item"><span>Reading Ease</span><strong>{analysis.results.readingEase}</strong></li>
                      <li className="analysis-item"><span>Emoji Count</span><strong>{analysis.results.emojiCount}</strong></li>
                      <li className="analysis-item"><span>Hashtags</span><strong>{analysis.results.hasHashtags ? 'Yes' : 'No'}</strong></li>
                      <li className="analysis-item"><span>Mentions</span><strong>{analysis.results.hasMentions ? 'Yes' : 'No'}</strong></li>
                      <li className="analysis-item"><span>CTA</span><strong>{analysis.results.hasCTA ? 'Yes' : 'No'}</strong></li>
                    </ul>

                    <div style={{marginTop:12,fontWeight:700}}>Suggestions</div>
                    <ul style={{marginTop:8}}>
                      {analysis.suggestions.map((s,idx) => <li key={idx} style={{marginBottom:6}}>{s}</li>)}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>

              {!analysis && (
                <div style={{marginTop:16,color:'var(--muted)'}}>Run analysis to see suggestions based on the extracted text.</div>
              )}
            </div>
          </div>

          <footer>Built with React, pdf.js, and Tesseract.js. Runs in your browser.</footer>
        </div>
      </main>
    </div>
  )
}
