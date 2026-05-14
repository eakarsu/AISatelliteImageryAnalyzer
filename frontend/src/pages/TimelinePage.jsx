import { useState } from 'react'
import { TrendingUp, Search } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Header from '../components/Header'
import { useTheme } from '../context/ThemeContext'
import api from '../api/client'
import toast from 'react-hot-toast'

const RISK_MAP = { low: 0, medium: 1, high: 2, critical: 3 }
const RISK_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#7f1d1d']

export default function TimelinePage() {
  const { theme } = useTheme()
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const CATEGORIES = [
    'satellite-image-analysis', 'land-use-classification', 'change-detection',
    'crop-health-monitoring', 'urban-planning', 'climate-impact', 'disaster-assessment',
    'water-body-analysis', 'vegetation-index', 'infrastructure-detection', 'air-quality',
    'terrain-analysis', 'population-density', 'mining-resource-detection',
  ]

  const search = async () => {
    if (!location.trim()) return toast.error('Enter a location')
    setLoading(true)
    setData(null)
    try {
      const params = category ? `?category=${category}` : ''
      const { data: res } = await api.get(`/timeline/${encodeURIComponent(location)}${params}`)
      setData(res)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load timeline')
    }
    setLoading(false)
  }

  const chartData = data?.data?.map((d, i) => ({
    name: new Date(d.date).toLocaleDateString(),
    risk: RISK_MAP[d.riskLevel] || 0,
    confidence: d.confidence ? Math.round(d.confidence * 100) : null,
    findings: d.findings_count || 0,
    label: d.title,
  })) || []

  const card = { borderRadius: '16px', background: theme.cardBg, border: `1px solid ${theme.border}`, padding: '24px', marginBottom: '20px' }
  const inputStyle = { padding: '10px 14px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.text, fontSize: '14px', outline: 'none', flex: 1 }

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    const riskLabels = ['Low', 'Medium', 'High', 'Critical']
    return (
      <div style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '10px', padding: '12px', fontSize: '13px' }}>
        <div style={{ fontWeight: '600', marginBottom: '6px', color: theme.text }}>{label}</div>
        {payload.map(p => (
          <div key={p.dataKey} style={{ color: p.color }}>
            {p.dataKey === 'risk' ? `Risk: ${riskLabels[p.value] || p.value}` : `${p.name}: ${p.value}`}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      <Header breadcrumbs={[{ label: 'Timeline Analysis' }]} />
      <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: theme.text, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TrendingUp size={24} color={theme.accent} /> Timeline Analysis
        </h1>
        <p style={{ color: theme.textMuted, marginBottom: '28px' }}>
          Track changes over time for a specific location across all your analyses.
        </p>

        {/* Search */}
        <div style={card}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              style={inputStyle}
              placeholder="Enter location (e.g., Amazon Basin, New York, Sahara)..."
              value={location}
              onChange={e => setLocation(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
            />
            <select
              style={{ ...inputStyle, flex: 'none', minWidth: '200px' }}
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/-/g, ' ')}</option>)}
            </select>
            <button
              onClick={search}
              disabled={loading}
              style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Search size={16} /> Search
            </button>
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '48px', color: theme.textMuted }}>Loading timeline...</div>
        )}

        {data && (
          <>
            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
              {[
                { label: 'Total Analyses', value: data.total, color: '#8b5cf6' },
                { label: 'Location', value: data.location, color: '#3b82f6' },
                { label: 'Category', value: data.category === 'all' ? 'All types' : data.category.replace(/-/g, ' '), color: '#10b981' },
              ].map(s => (
                <div key={s.label} style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: '700', color: s.color, marginBottom: '4px', wordBreak: 'break-word' }}>{s.value}</div>
                  <div style={{ fontSize: '12px', color: theme.textMuted }}>{s.label}</div>
                </div>
              ))}
            </div>

            {data.total === 0 ? (
              <div style={{ ...card, textAlign: 'center', color: theme.textMuted }}>
                No completed analyses found for this location. Run AI analyses first.
              </div>
            ) : (
              <>
                {/* Risk Level Chart */}
                <div style={card}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: theme.text, marginBottom: '16px' }}>Risk Level Over Time</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: theme.textMuted }} />
                      <YAxis domain={[0, 3]} ticks={[0, 1, 2, 3]} tickFormatter={v => ['Low', 'Med', 'High', 'Crit'][v]} tick={{ fontSize: 11, fill: theme.textMuted }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} name="Risk" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Confidence Chart */}
                <div style={card}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: theme.text, marginBottom: '16px' }}>AI Confidence & Findings Over Time</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: theme.textMuted }} />
                      <YAxis tick={{ fontSize: 11, fill: theme.textMuted }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="confidence" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} name="Confidence %" />
                      <Line type="monotone" dataKey="findings" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} name="Findings Count" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Timeline entries */}
                <div style={card}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: theme.text, marginBottom: '16px' }}>Analysis History</h3>
                  {data.data.map((entry, i) => (
                    <div key={entry.id} style={{ display: 'flex', gap: '16px', marginBottom: '12px', padding: '12px', background: theme.bg, borderRadius: '10px', border: `1px solid ${theme.border}` }}>
                      <div style={{ width: '4px', borderRadius: '2px', background: RISK_COLORS[RISK_MAP[entry.riskLevel] || 0], flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '14px', color: theme.text, marginBottom: '4px' }}>{entry.title}</div>
                        <div style={{ fontSize: '12px', color: theme.textMuted }}>
                          {new Date(entry.date).toLocaleDateString()} | Risk: {entry.riskLevel || 'N/A'} | Confidence: {entry.confidence ? `${Math.round(entry.confidence * 100)}%` : 'N/A'}
                        </div>
                        {entry.summary && <p style={{ fontSize: '13px', color: theme.textSecondary, marginTop: '6px', marginBottom: 0 }}>{entry.summary.substring(0, 150)}...</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
