import { useState, useEffect } from 'react'
import { GitCompare, Loader2, Search, ArrowRight } from 'lucide-react'
import Header from '../components/Header'
import { useTheme } from '../context/ThemeContext'
import AIResultDisplay from '../components/AIResultDisplay'
import api from '../api/client'
import toast from 'react-hot-toast'

const statusColors = { pending: '#eab308', completed: '#10b981', 'in-progress': '#3b82f6', failed: '#ef4444' }

export default function ComparisonPage() {
  const { theme } = useTheme()
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [leftId, setLeftId] = useState('')
  const [rightId, setRightId] = useState('')
  const [leftData, setLeftData] = useState(null)
  const [rightData, setRightData] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/analyses', { params: { limit: 500 } })
      .then((res) => setAnalyses(res.data.analyses || []))
      .catch(() => toast.error('Failed to load analyses'))
      .finally(() => setLoading(false))
  }, [])

  const loadAnalysis = async (id, side) => {
    try {
      const res = await api.get(`/analyses/${id}`)
      const data = res.data.analysis || res.data
      if (side === 'left') setLeftData(data)
      else setRightData(data)
    } catch {
      toast.error('Failed to load analysis')
    }
  }

  useEffect(() => { if (leftId) loadAnalysis(leftId, 'left') }, [leftId])
  useEffect(() => { if (rightId) loadAnalysis(rightId, 'right') }, [rightId])

  const filteredAnalyses = analyses.filter((a) =>
    !search || a.title?.toLowerCase().includes(search.toLowerCase()) || a.location?.toLowerCase().includes(search.toLowerCase())
  )

  const selectStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    border: `1px solid ${theme.border}`, background: theme.inputBg,
    color: theme.text, fontSize: '14px', outline: 'none',
  }

  const InfoRow = ({ label, left, right }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 1fr', gap: '16px', padding: '10px 0', borderBottom: `1px solid ${theme.border}` }}>
      <span style={{ fontSize: '13px', fontWeight: '600', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
      <span style={{ fontSize: '14px', color: theme.text }}>{left || '-'}</span>
      <span style={{ fontSize: '14px', color: theme.text }}>{right || '-'}</span>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      <Header breadcrumbs={[{ label: 'Compare' }]} />
      <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: theme.text, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <GitCompare size={24} /> Compare Analyses
        </h1>

        {/* Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', marginBottom: '32px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '6px' }}>Analysis A</label>
            <select value={leftId} onChange={(e) => setLeftId(e.target.value)} style={selectStyle}>
              <option value="">Select analysis...</option>
              {filteredAnalyses.map(a => <option key={a.id} value={a.id}>{a.title} ({a.category})</option>)}
            </select>
          </div>
          <ArrowRight size={24} color={theme.textMuted} style={{ marginBottom: '8px' }} />
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '6px' }}>Analysis B</label>
            <select value={rightId} onChange={(e) => setRightId(e.target.value)} style={selectStyle}>
              <option value="">Select analysis...</option>
              {filteredAnalyses.map(a => <option key={a.id} value={a.id}>{a.title} ({a.category})</option>)}
            </select>
          </div>
        </div>

        {/* Comparison */}
        {leftData && rightData ? (
          <div style={{ borderRadius: '16px', background: theme.cardBg, border: `1px solid ${theme.border}`, padding: '28px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 1fr', gap: '16px', marginBottom: '8px' }}>
              <span />
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: theme.accent }}>{leftData.title}</h3>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#8b5cf6' }}>{rightData.title}</h3>
            </div>

            <InfoRow label="Category" left={leftData.category?.replace(/-/g, ' ')} right={rightData.category?.replace(/-/g, ' ')} />
            <InfoRow label="Status" left={leftData.status} right={rightData.status} />
            <InfoRow label="Priority" left={leftData.priority} right={rightData.priority} />
            <InfoRow label="Location" left={leftData.location} right={rightData.location} />
            <InfoRow label="Coordinates" left={leftData.coordinates} right={rightData.coordinates} />
            <InfoRow label="Created" left={leftData.created_at ? new Date(leftData.created_at).toLocaleDateString() : '-'} right={rightData.created_at ? new Date(rightData.created_at).toLocaleDateString() : '-'} />
            <InfoRow label="Description" left={leftData.description} right={rightData.description} />

            {/* AI Results Comparison */}
            {(leftData.ai_result || rightData.ai_result) && (
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: theme.text, marginBottom: '16px' }}>AI Analysis Comparison</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div style={{ padding: '16px', borderRadius: '12px', border: `1px solid ${theme.border}`, background: theme.bgTertiary }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: theme.accent, marginBottom: '12px' }}>Analysis A</h4>
                    {leftData.ai_result ? <AIResultDisplay result={leftData.ai_result} /> : <p style={{ color: theme.textMuted }}>No AI result</p>}
                  </div>
                  <div style={{ padding: '16px', borderRadius: '12px', border: `1px solid ${theme.border}`, background: theme.bgTertiary }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#8b5cf6', marginBottom: '12px' }}>Analysis B</h4>
                    {rightData.ai_result ? <AIResultDisplay result={rightData.ai_result} /> : <p style={{ color: theme.textMuted }}>No AI result</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', borderRadius: '16px', background: theme.cardBg, border: `1px solid ${theme.border}`, color: theme.textMuted }}>
            <GitCompare size={48} style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '16px' }}>Select two analyses to compare</p>
            <p style={{ fontSize: '13px' }}>Choose from the dropdowns above to see a side-by-side comparison.</p>
          </div>
        )}
      </div>
    </div>
  )
}
