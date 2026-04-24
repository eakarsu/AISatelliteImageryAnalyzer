import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, Clock, User, FileText, Loader2 } from 'lucide-react'
import Header from '../components/Header'
import { useTheme } from '../context/ThemeContext'
import api from '../api/client'
import toast from 'react-hot-toast'

const actionIcons = {
  created: { icon: '🆕', color: '#10b981' },
  updated: { icon: '✏️', color: '#3b82f6' },
  deleted: { icon: '🗑️', color: '#ef4444' },
  analyzed: { icon: '🧠', color: '#8b5cf6' },
  bookmarked: { icon: '⭐', color: '#f59e0b' },
  shared: { icon: '🔗', color: '#06b6d4' },
  commented: { icon: '💬', color: '#ec4899' },
}

export default function ActivityPage() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/activity', { params: { limit: 100 } })
      .then((res) => setActivities(res.data.activities || []))
      .catch(() => toast.error('Failed to load activity'))
      .finally(() => setLoading(false))
  }, [])

  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      <Header breadcrumbs={[{ label: 'Activity Log' }]} />
      <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: theme.text, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={24} /> Activity Log
        </h1>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <Loader2 size={32} color={theme.accent} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : activities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: theme.textMuted }}>
            <Activity size={48} color={theme.border} style={{ marginBottom: '12px' }} />
            <p>No activity recorded yet.</p>
          </div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: '32px' }}>
            <div style={{ position: 'absolute', left: '15px', top: '8px', bottom: '8px', width: '2px', background: theme.border }} />
            {activities.map((a) => {
              const info = actionIcons[a.action] || { icon: '📋', color: theme.textMuted }
              return (
                <div key={a.id} style={{
                  position: 'relative', marginBottom: '16px', padding: '16px 20px',
                  borderRadius: '12px', background: theme.cardBg, border: `1px solid ${theme.border}`,
                  cursor: a.analysis_id ? 'pointer' : 'default',
                }}
                  onClick={() => a.analysis_id && a.analysis_title && navigate(`/feature/${a.details?.category || 'satellite-image-analysis'}/${a.analysis_id}`)}
                >
                  <div style={{
                    position: 'absolute', left: '-25px', top: '18px', width: '22px', height: '22px',
                    borderRadius: '50%', background: theme.bg, border: `2px solid ${info.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px',
                  }}>
                    {info.icon}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: theme.text }}>
                        {a.user_name || 'System'}
                      </span>
                      <span style={{ fontSize: '14px', color: theme.textMuted }}> {a.action} </span>
                      {a.analysis_title && (
                        <span style={{ fontSize: '14px', fontWeight: '600', color: theme.accent }}>
                          {a.analysis_title}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '12px', color: theme.textDim, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {timeAgo(a.created_at)}
                    </span>
                  </div>
                  {a.details && typeof a.details === 'object' && Object.keys(a.details).length > 0 && (
                    <div style={{ marginTop: '8px', fontSize: '13px', color: theme.textMuted }}>
                      {Object.entries(a.details).filter(([k]) => k !== 'category').map(([k, v]) => (
                        <span key={k} style={{ marginRight: '12px' }}>
                          <strong>{k}:</strong> {String(v)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
