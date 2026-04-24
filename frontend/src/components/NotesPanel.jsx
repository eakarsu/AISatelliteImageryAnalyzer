import { useState, useEffect } from 'react'
import { MessageSquare, Send, Edit3, Trash2, Loader2, X, Check } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import toast from 'react-hot-toast'

export default function NotesPanel({ analysisId }) {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')

  const fetchNotes = () => {
    api.get(`/notes/${analysisId}`)
      .then((res) => setNotes(res.data.notes || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchNotes() }, [analysisId])

  const handleSubmit = async () => {
    if (!content.trim()) return
    setSubmitting(true)
    try {
      const res = await api.post(`/notes/${analysisId}`, { content })
      setNotes([res.data.note, ...notes])
      setContent('')
      toast.success('Note added')
    } catch {
      toast.error('Failed to add note')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (noteId) => {
    if (!editContent.trim()) return
    try {
      const res = await api.put(`/notes/${noteId}`, { content: editContent })
      setNotes(notes.map((n) => n.id === noteId ? { ...n, content: res.data.note.content, updated_at: res.data.note.updated_at } : n))
      setEditingId(null)
      toast.success('Note updated')
    } catch {
      toast.error('Failed to update note')
    }
  }

  const handleDelete = async (noteId) => {
    try {
      await api.delete(`/notes/${noteId}`)
      setNotes(notes.filter((n) => n.id !== noteId))
      toast.success('Note deleted')
    } catch {
      toast.error('Failed to delete note')
    }
  }

  const timeAgo = (date) => {
    const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (s < 60) return 'just now'
    if (s < 3600) return `${Math.floor(s / 60)}m ago`
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`
    return new Date(date).toLocaleDateString()
  }

  return (
    <div>
      <h3 style={{ fontSize: '18px', fontWeight: '700', color: theme.text, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MessageSquare size={18} color="#06b6d4" /> Notes & Comments
        <span style={{ fontSize: '13px', fontWeight: '400', color: theme.textMuted }}>({notes.length})</span>
      </h3>

      {/* Add Note */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a note..."
          style={{
            flex: 1, padding: '12px 14px', borderRadius: '10px',
            border: `1px solid ${theme.border}`, background: theme.inputBg,
            color: theme.text, fontSize: '14px', outline: 'none',
            minHeight: '60px', resize: 'vertical',
          }}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit() }}
        />
        <button onClick={handleSubmit} disabled={submitting || !content.trim()} style={{
          padding: '12px 16px', borderRadius: '10px', border: 'none',
          background: content.trim() ? 'linear-gradient(135deg, #06b6d4, #0891b2)' : theme.border,
          color: '#fff', cursor: content.trim() ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', gap: '6px', alignSelf: 'flex-end',
        }}>
          {submitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
        </button>
      </div>

      {/* Notes List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px', color: theme.textMuted }}>Loading notes...</div>
      ) : notes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px', color: theme.textMuted, fontSize: '14px' }}>
          No notes yet. Be the first to comment.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notes.map((n) => (
            <div key={n.id} style={{
              padding: '14px 16px', borderRadius: '12px', background: theme.bgTertiary,
              border: `1px solid ${theme.border}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: '700', color: '#fff',
                  }}>
                    {(n.author_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: theme.text }}>{n.author_name}</span>
                  <span style={{ fontSize: '12px', color: theme.textDim }}>{timeAgo(n.created_at)}</span>
                  {n.updated_at !== n.created_at && <span style={{ fontSize: '11px', color: theme.textDim }}>(edited)</span>}
                </div>
                {n.user_id === user?.id && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {editingId === n.id ? (
                      <>
                        <button onClick={() => setEditingId(null)} style={{ background: 'transparent', border: 'none', color: theme.textDim, cursor: 'pointer' }}><X size={14} /></button>
                        <button onClick={() => handleEdit(n.id)} style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer' }}><Check size={14} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditingId(n.id); setEditContent(n.content) }} style={{ background: 'transparent', border: 'none', color: theme.textDim, cursor: 'pointer' }}><Edit3 size={14} /></button>
                        <button onClick={() => handleDelete(n.id)} style={{ background: 'transparent', border: 'none', color: theme.textDim, cursor: 'pointer' }}><Trash2 size={14} /></button>
                      </>
                    )}
                  </div>
                )}
              </div>
              {editingId === n.id ? (
                <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} style={{
                  width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.accent}`,
                  background: theme.inputBg, color: theme.text, fontSize: '14px', outline: 'none', resize: 'vertical',
                }} />
              ) : (
                <p style={{ fontSize: '14px', lineHeight: '1.6', color: theme.textSecondary, whiteSpace: 'pre-wrap' }}>{n.content}</p>
              )}
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
