import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bookmark, MapPin, Calendar, Loader2, Trash2 } from 'lucide-react'
import Header from '../components/Header'
import { useTheme } from '../context/ThemeContext'
import api from '../api/client'
import toast from 'react-hot-toast'

const statusColors = { pending: '#eab308', completed: '#10b981', 'in-progress': '#3b82f6', failed: '#ef4444' }
const priorityColors = { low: '#94a3b8', medium: '#3b82f6', high: '#f97316', critical: '#ef4444' }

export default function BookmarksPage() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBookmarks = () => {
    setLoading(true)
    api.get('/bookmarks')
      .then((res) => setBookmarks(res.data.bookmarks || []))
      .catch(() => toast.error('Failed to load bookmarks'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchBookmarks() }, [])

  const removeBookmark = async (e, analysisId) => {
    e.stopPropagation()
    try {
      await api.delete(`/bookmarks/${analysisId}`)
      setBookmarks((prev) => prev.filter((b) => b.id !== analysisId))
      toast.success('Bookmark removed')
    } catch {
      toast.error('Failed to remove bookmark')
    }
  }

  const Badge = ({ color, value }) => (
    <span style={{
      padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
      background: `${color}18`, color, border: `1px solid ${color}40`, textTransform: 'capitalize',
    }}>{value}</span>
  )

  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      <Header breadcrumbs={[{ label: 'Bookmarks' }]} />
      <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: theme.text, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Bookmark size={24} color="#f59e0b" /> Saved Bookmarks
          <span style={{ fontSize: '14px', fontWeight: '400', color: theme.textMuted }}>({bookmarks.length})</span>
        </h1>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <Loader2 size={32} color={theme.accent} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : bookmarks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: theme.textMuted }}>
            <Bookmark size={48} color={theme.border} style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '16px' }}>No bookmarks yet.</p>
            <p style={{ fontSize: '13px' }}>Bookmark analyses to quickly access them later.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {bookmarks.map((b) => (
              <div key={b.id} onClick={() => navigate(`/feature/${b.category}/${b.id}`)} style={{
                padding: '20px 24px', borderRadius: '14px', background: theme.cardBg,
                border: `1px solid ${theme.border}`, cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.transform = 'none' }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: theme.text, marginBottom: '6px' }}>{b.title}</div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', color: theme.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} /> {b.location || 'N/A'}
                    </span>
                    <Badge color={statusColors[b.status] || '#94a3b8'} value={b.status || 'pending'} />
                    <Badge color={priorityColors[b.priority] || '#94a3b8'} value={b.priority || 'medium'} />
                    <span style={{ fontSize: '12px', color: theme.textDim, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} /> {b.created_at ? new Date(b.created_at).toLocaleDateString() : '-'}
                    </span>
                  </div>
                </div>
                <button onClick={(e) => removeBookmark(e, b.id)} style={{
                  padding: '8px', borderRadius: '8px', border: `1px solid ${theme.border}`,
                  background: 'transparent', color: theme.textMuted, cursor: 'pointer',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#ef4444' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = theme.textMuted; e.currentTarget.style.borderColor = theme.border }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
