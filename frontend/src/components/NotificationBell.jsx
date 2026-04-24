import { useState, useEffect, useRef } from 'react'
import { Bell, Check, Trash2, X } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import api from '../api/client'

const typeColors = { info: '#3b82f6', success: '#10b981', warning: '#f59e0b', error: '#ef4444' }

export default function NotificationBell() {
  const { theme } = useTheme()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const fetch = () => {
    api.get('/notifications')
      .then((res) => {
        setNotifications(res.data.notifications || [])
        setUnreadCount(res.data.unreadCount || 0)
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetch()
    const interval = setInterval(fetch, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`).catch(() => {})
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
    setUnreadCount((c) => Math.max(0, c - 1))
  }

  const markAllRead = async () => {
    await api.put('/notifications/read-all').catch(() => {})
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const deleteNotif = async (id) => {
    await api.delete(`/notifications/${id}`).catch(() => {})
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const timeAgo = (date) => {
    const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (s < 60) return 'now'
    if (s < 3600) return `${Math.floor(s / 60)}m`
    if (s < 86400) return `${Math.floor(s / 3600)}h`
    return `${Math.floor(s / 86400)}d`
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{
        position: 'relative', width: '36px', height: '36px', borderRadius: '8px',
        border: `1px solid ${theme.border}`, background: 'transparent',
        color: theme.textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Bell size={18} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px', width: '18px', height: '18px',
            borderRadius: '50%', background: '#ef4444', color: '#fff', fontSize: '10px',
            fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '44px', right: 0, width: '360px', maxHeight: '480px',
          borderRadius: '16px', background: theme.bgSecondary, border: `1px solid ${theme.border}`,
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)', zIndex: 200, overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', borderBottom: `1px solid ${theme.border}`,
          }}>
            <span style={{ fontSize: '15px', fontWeight: '700', color: theme.text }}>Notifications</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {unreadCount > 0 && (
                <button onClick={markAllRead} style={{
                  fontSize: '12px', color: theme.accent, background: 'transparent', border: 'none',
                  cursor: 'pointer', fontWeight: '600',
                }}>Mark all read</button>
              )}
              <button onClick={() => setOpen(false)} style={{
                background: 'transparent', border: 'none', color: theme.textMuted, cursor: 'pointer',
              }}><X size={16} /></button>
            </div>
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: theme.textMuted, fontSize: '14px' }}>
                No notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} style={{
                  padding: '12px 16px', borderBottom: `1px solid ${theme.border}`,
                  background: n.read ? 'transparent' : `${theme.accent}08`,
                  display: 'flex', gap: '10px', alignItems: 'flex-start',
                }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, marginTop: '6px',
                    background: n.read ? theme.border : (typeColors[n.type] || theme.accent),
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: theme.text }}>{n.title}</div>
                    {n.message && <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '2px' }}>{n.message}</div>}
                    <div style={{ fontSize: '11px', color: theme.textDim, marginTop: '4px' }}>{timeAgo(n.created_at)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    {!n.read && (
                      <button onClick={() => markRead(n.id)} style={{
                        width: '24px', height: '24px', borderRadius: '6px', border: 'none',
                        background: 'transparent', color: theme.textDim, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }} title="Mark read"><Check size={12} /></button>
                    )}
                    <button onClick={() => deleteNotif(n.id)} style={{
                      width: '24px', height: '24px', borderRadius: '6px', border: 'none',
                      background: 'transparent', color: theme.textDim, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }} title="Delete"><Trash2 size={12} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
