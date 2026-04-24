import { useState } from 'react'
import { Settings, Monitor, Bell, Download, Keyboard, Info } from 'lucide-react'
import Header from '../components/Header'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { mode, theme, toggleTheme } = useTheme()
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notificationsEnabled')
    return saved !== 'false'
  })
  const [autoRefresh, setAutoRefresh] = useState(() => {
    return localStorage.getItem('autoRefresh') === 'true'
  })
  const [refreshInterval, setRefreshInterval] = useState(() => {
    return parseInt(localStorage.getItem('refreshInterval') || '30')
  })
  const [defaultPriority, setDefaultPriority] = useState(() => {
    return localStorage.getItem('defaultPriority') || 'medium'
  })
  const [pageSize, setPageSize] = useState(() => {
    return parseInt(localStorage.getItem('pageSize') || '20')
  })

  const saveSetting = (key, value) => {
    localStorage.setItem(key, String(value))
    toast.success('Setting saved')
  }

  const sectionStyle = {
    borderRadius: '16px', background: theme.cardBg, border: `1px solid ${theme.border}`,
    padding: '28px', marginBottom: '24px',
  }

  const toggleStyle = (active) => ({
    width: '48px', height: '26px', borderRadius: '13px', border: 'none',
    background: active ? '#3b82f6' : theme.border, cursor: 'pointer',
    position: 'relative', transition: 'background 0.2s',
  })

  const toggleKnob = (active) => ({
    width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
    position: 'absolute', top: '3px', left: active ? '25px' : '3px',
    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
  })

  const selectStyle = {
    padding: '10px 14px', borderRadius: '8px', border: `1px solid ${theme.border}`,
    background: theme.inputBg, color: theme.text, fontSize: '14px', outline: 'none', cursor: 'pointer',
  }

  const shortcuts = [
    { keys: 'G then D', action: 'Go to Dashboard' },
    { keys: 'G then P', action: 'Go to Profile' },
    { keys: 'G then S', action: 'Go to Settings' },
    { keys: 'N', action: 'New Analysis (on list page)' },
    { keys: '/', action: 'Focus Search' },
    { keys: 'Esc', action: 'Close Modal' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      <Header breadcrumbs={[{ label: 'Settings' }]} />
      <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: theme.text, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings size={24} /> Settings
        </h1>

        {/* Appearance */}
        <div style={sectionStyle}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: theme.text, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Monitor size={18} /> Appearance
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: theme.text }}>Dark Mode</div>
              <div style={{ fontSize: '13px', color: theme.textMuted }}>Toggle between dark and light theme</div>
            </div>
            <button onClick={toggleTheme} style={toggleStyle(mode === 'dark')}>
              <div style={toggleKnob(mode === 'dark')} />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div style={sectionStyle}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: theme.text, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} /> Notifications
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: theme.text }}>Enable Notifications</div>
              <div style={{ fontSize: '13px', color: theme.textMuted }}>Show in-app notification alerts</div>
            </div>
            <button onClick={() => { setNotifications(!notifications); saveSetting('notificationsEnabled', !notifications) }} style={toggleStyle(notifications)}>
              <div style={toggleKnob(notifications)} />
            </button>
          </div>
        </div>

        {/* Data & Display */}
        <div style={sectionStyle}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: theme.text, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} /> Data & Display
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: theme.text }}>Auto-Refresh</div>
              <div style={{ fontSize: '13px', color: theme.textMuted }}>Automatically refresh analysis list</div>
            </div>
            <button onClick={() => { setAutoRefresh(!autoRefresh); saveSetting('autoRefresh', !autoRefresh) }} style={toggleStyle(autoRefresh)}>
              <div style={toggleKnob(autoRefresh)} />
            </button>
          </div>
          {autoRefresh && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: theme.text }}>Refresh Interval</div>
                <div style={{ fontSize: '13px', color: theme.textMuted }}>How often to refresh (seconds)</div>
              </div>
              <select value={refreshInterval} onChange={(e) => { setRefreshInterval(parseInt(e.target.value)); saveSetting('refreshInterval', e.target.value) }} style={selectStyle}>
                <option value="10">10s</option>
                <option value="30">30s</option>
                <option value="60">1m</option>
                <option value="300">5m</option>
              </select>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: theme.text }}>Default Priority</div>
              <div style={{ fontSize: '13px', color: theme.textMuted }}>Default priority for new analyses</div>
            </div>
            <select value={defaultPriority} onChange={(e) => { setDefaultPriority(e.target.value); saveSetting('defaultPriority', e.target.value) }} style={selectStyle}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: theme.text }}>Items Per Page</div>
              <div style={{ fontSize: '13px', color: theme.textMuted }}>Number of items shown in lists</div>
            </div>
            <select value={pageSize} onChange={(e) => { setPageSize(parseInt(e.target.value)); saveSetting('pageSize', e.target.value) }} style={selectStyle}>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div style={sectionStyle}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: theme.text, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Keyboard size={18} /> Keyboard Shortcuts
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {shortcuts.map((s) => (
              <div key={s.keys} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${theme.border}` }}>
                <span style={{ fontSize: '14px', color: theme.text }}>{s.action}</span>
                <kbd style={{
                  padding: '4px 10px', borderRadius: '6px', background: theme.bgTertiary,
                  border: `1px solid ${theme.border}`, fontSize: '13px', color: theme.textSecondary, fontFamily: 'monospace',
                }}>{s.keys}</kbd>
              </div>
            ))}
          </div>
        </div>

        {/* About */}
        <div style={sectionStyle}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: theme.text, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={18} /> About
          </h3>
          <p style={{ fontSize: '14px', color: theme.textMuted, lineHeight: '1.7' }}>
            AI Satellite Imagery Analyzer (ASIA) v1.0.0<br />
            Enterprise Geospatial Intelligence Platform<br />
            Powered by advanced AI for satellite data analysis.
          </p>
        </div>
      </div>
    </div>
  )
}
