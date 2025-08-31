import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function Dropzone({ onFiles }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  const onDrop = e => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files || [])
    if (files.length) onFiles(files)
  }

  const onChange = e => {
    const files = Array.from(e.target.files || [])
    if (files.length) onFiles(files)
  }

  return (
    <motion.div
      className={'upload-area' + (dragOver ? ' drag' : '')}
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      whileHover={{ scale: 1.02 }}
      onClick={() => inputRef.current?.click()}
    >
      <div style={{textAlign:'center'}}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{marginBottom:8}}>
          <path d="M12 3v12" stroke="#4f46e5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 7l4-4 4 4" stroke="#4f46e5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 15v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3" stroke="#4f46e5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div className="upload-title">Drag & drop files here</div>
        <div className="upload-sub">PDFs or images (png, jpg, tiff)</div>
        <div style={{marginTop:12}}>
          <button className="btn" onClick={(e)=>{e.stopPropagation(); inputRef.current?.click()}}>Choose file</button>
        </div>
        <input ref={inputRef} type="file" accept=".pdf,image/*" multiple style={{display:'none'}} onChange={onChange} />
      </div>
    </motion.div>
  )
}
