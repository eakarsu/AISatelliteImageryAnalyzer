import { useState, useEffect } from 'react'
import { FileText, Download, Loader2, Printer, BarChart3 } from 'lucide-react'
import Header from '../components/Header'
import { useTheme } from '../context/ThemeContext'
import api from '../api/client'
import toast from 'react-hot-toast'

export default function ReportsPage() {
  const { theme } = useTheme()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/stats')
      .then((res) => setStats(res.data))
      .catch(() => toast.error('Failed to load report data'))
      .finally(() => setLoading(false))
  }, [])

  const exportCSV = async (filters = {}) => {
    try {
      const res = await api.get('/export/csv', { params: filters, responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `analyses_export_${Date.now()}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('CSV exported!')
    } catch {
      toast.error('Export failed')
    }
  }

  const exportJSON = async (filters = {}) => {
    try {
      const res = await api.get('/export/json', { params: filters, responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `analyses_export_${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('JSON exported!')
    } catch {
      toast.error('Export failed')
    }
  }

  const handlePrint = () => window.print()

  const sectionStyle = {
    borderRadius: '16px', background: theme.cardBg, border: `1px solid ${theme.border}`,
    padding: '28px', marginBottom: '24px',
  }

  const btnStyle = (bg) => ({
    padding: '10px 20px', borderRadius: '10px', border: 'none', background: bg,
    color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '8px',
  })

  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      <Header breadcrumbs={[{ label: 'Reports' }]} />
      <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }} id="report-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: theme.text, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={24} /> Reports & Export
          </h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handlePrint} style={btnStyle('linear-gradient(135deg, #6366f1, #4338ca)')}>
              <Printer size={16} /> Print Report
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <Loader2 size={32} color={theme.accent} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : stats ? (
          <>
            {/* Summary */}
            <div style={sectionStyle}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: theme.text, marginBottom: '20px' }}>Summary Overview</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '20px', borderRadius: '12px', background: `${theme.accent}10`, border: `1px solid ${theme.accent}30`, textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', fontWeight: '700', color: theme.accent }}>{stats.totalAnalyses}</div>
                  <div style={{ fontSize: '14px', color: theme.textMuted }}>Total Analyses</div>
                </div>
                {stats.byStatus?.map((s) => (
                  <div key={s.status} style={{ padding: '20px', borderRadius: '12px', background: theme.bgTertiary, border: `1px solid ${theme.border}`, textAlign: 'center' }}>
                    <div style={{ fontSize: '36px', fontWeight: '700', color: theme.text }}>{s.count}</div>
                    <div style={{ fontSize: '14px', color: theme.textMuted, textTransform: 'capitalize' }}>{s.status}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* By Category */}
            <div style={sectionStyle}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: theme.text, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={18} /> By Category
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {stats.byCategory?.map((c) => {
                  const pct = stats.totalAnalyses > 0 ? (c.count / stats.totalAnalyses) * 100 : 0
                  return (
                    <div key={c.category} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '200px', fontSize: '13px', color: theme.textSecondary, textTransform: 'capitalize' }}>
                        {c.category.replace(/-/g, ' ')}
                      </div>
                      <div style={{ flex: 1, height: '24px', borderRadius: '6px', background: theme.bgTertiary, overflow: 'hidden', position: 'relative' }}>
                        <div style={{ width: `${pct}%`, height: '100%', borderRadius: '6px', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', transition: 'width 1s ease-out' }} />
                      </div>
                      <div style={{ width: '40px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: theme.text }}>{c.count}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* By Priority */}
            <div style={sectionStyle}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: theme.text, marginBottom: '20px' }}>By Priority</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                {stats.byPriority?.map((p) => {
                  const colors = { low: '#94a3b8', medium: '#3b82f6', high: '#f97316', critical: '#ef4444' }
                  return (
                    <div key={p.priority} style={{ padding: '20px', borderRadius: '12px', background: `${colors[p.priority]}10`, border: `1px solid ${colors[p.priority]}30`, textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: colors[p.priority] }}>{p.count}</div>
                      <div style={{ fontSize: '13px', color: theme.textMuted, textTransform: 'capitalize' }}>{p.priority}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Export */}
            <div style={sectionStyle}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: theme.text, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Download size={18} /> Export Data
              </h3>
              <p style={{ fontSize: '14px', color: theme.textMuted, marginBottom: '16px' }}>
                Download all analyses data in your preferred format.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button onClick={() => exportCSV()} style={btnStyle('linear-gradient(135deg, #10b981, #059669)')}>
                  <Download size={16} /> Export All as CSV
                </button>
                <button onClick={() => exportJSON()} style={btnStyle('linear-gradient(135deg, #3b82f6, #2563eb)')}>
                  <Download size={16} /> Export All as JSON
                </button>
                {stats.byStatus?.map((s) => (
                  <button key={s.status} onClick={() => exportCSV({ status: s.status })} style={{
                    ...btnStyle('transparent'),
                    color: theme.textSecondary, border: `1px solid ${theme.border}`,
                  }}>
                    <Download size={14} /> {s.status} ({s.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Recent */}
            <div style={sectionStyle}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: theme.text, marginBottom: '20px' }}>Recent Analyses</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Title', 'Category', 'Status', 'Priority', 'Date'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.textMuted, borderBottom: `1px solid ${theme.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recentAnalyses?.map((a) => (
                    <tr key={a.id}>
                      <td style={{ padding: '10px 12px', fontSize: '14px', color: theme.text, borderBottom: `1px solid ${theme.border}` }}>{a.title}</td>
                      <td style={{ padding: '10px 12px', fontSize: '13px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}`, textTransform: 'capitalize' }}>{a.category?.replace(/-/g, ' ')}</td>
                      <td style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}` }}>
                        <span style={{ padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize', background: `${statusColors[a.status] || '#94a3b8'}18`, color: statusColors[a.status] || '#94a3b8' }}>{a.status}</span>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '13px', color: theme.textSecondary, borderBottom: `1px solid ${theme.border}`, textTransform: 'capitalize' }}>{a.priority}</td>
                      <td style={{ padding: '10px 12px', fontSize: '13px', color: theme.textMuted, borderBottom: `1px solid ${theme.border}` }}>{a.created_at ? new Date(a.created_at).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media print {
          header, button, .no-print { display: none !important; }
          body { background: #fff !important; color: #000 !important; }
          * { background: transparent !important; color: #000 !important; border-color: #ccc !important; }
        }
      `}</style>
    </div>
  )
}

const statusColors = { pending: '#eab308', completed: '#10b981', 'in-progress': '#3b82f6', failed: '#ef4444' }
