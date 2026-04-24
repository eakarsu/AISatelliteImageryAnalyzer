import { useState, useEffect } from 'react'
import { Bookmark } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import api from '../api/client'
import toast from 'react-hot-toast'

export default function BookmarkButton({ analysisId }) {
  const { theme } = useTheme()
  const [bookmarked, setBookmarked] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!analysisId) return
    api.get(`/bookmarks/check/${analysisId}`)
      .then((res) => setBookmarked(res.data.bookmarked))
      .catch(() => {})
  }, [analysisId])

  const toggle = async (e) => {
    e?.stopPropagation()
    setLoading(true)
    try {
      if (bookmarked) {
        await api.delete(`/bookmarks/${analysisId}`)
        setBookmarked(false)
        toast.success('Bookmark removed')
      } else {
        await api.post(`/bookmarks/${analysisId}`)
        setBookmarked(true)
        toast.success('Bookmarked!')
      }
    } catch {
      toast.error('Failed to update bookmark')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
      style={{
        padding: '8px 14px',
        borderRadius: '8px',
        border: `1px solid ${bookmarked ? '#f59e0b' : theme.border}`,
        background: bookmarked ? 'rgba(245,158,11,0.1)' : 'transparent',
        color: bookmarked ? '#f59e0b' : theme.textSecondary,
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '13px',
        fontWeight: '600',
        transition: 'all 0.2s',
      }}
    >
      <Bookmark size={14} fill={bookmarked ? '#f59e0b' : 'none'} />
      {bookmarked ? 'Bookmarked' : 'Bookmark'}
    </button>
  )
}
