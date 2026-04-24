import { useState, useRef } from 'react'
import { Upload, Image, X, Loader2 } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import api from '../api/client'
import toast from 'react-hot-toast'

export default function ImageUpload({ onUpload, currentImage }) {
  const { theme } = useTheme()
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentImage || null)
  const fileRef = useRef(null)

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Preview
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onUpload?.(res.data.imageUrl)
      toast.success('Image uploaded!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed')
      setPreview(currentImage || null)
    } finally {
      setUploading(false)
    }
  }

  const clearImage = () => {
    setPreview(null)
    onUpload?.(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div>
      <input type="file" ref={fileRef} onChange={handleUpload} accept="image/*,.tif,.tiff" style={{ display: 'none' }} />

      {preview ? (
        <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: `1px solid ${theme.border}` }}>
          <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }} />
          <button onClick={clearImage} style={{
            position: 'absolute', top: '8px', right: '8px', width: '28px', height: '28px',
            borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.6)',
            color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><X size={14} /></button>
          {uploading && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Loader2 size={32} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          )}
        </div>
      ) : (
        <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{
          width: '100%', padding: '32px 20px', borderRadius: '12px',
          border: `2px dashed ${theme.border}`, background: 'transparent',
          color: theme.textMuted, cursor: 'pointer', display: 'flex',
          flexDirection: 'column', alignItems: 'center', gap: '8px',
          transition: 'border-color 0.2s, background 0.2s',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.background = `${theme.accent}08` }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = 'transparent' }}
        >
          {uploading ? (
            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <>
              <Upload size={28} />
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Click to upload satellite image</span>
              <span style={{ fontSize: '12px' }}>JPG, PNG, GIF, TIFF up to 50MB</span>
            </>
          )}
        </button>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
