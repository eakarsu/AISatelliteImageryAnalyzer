import { useState, useEffect } from 'react'
import { Leaf, Brain, Loader2 } from 'lucide-react'
import Header from '../components/Header'
import { useTheme } from '../context/ThemeContext'
import api from '../api/client'
import toast from 'react-hot-toast'

export default function VegetationIndexPage() {
  const { theme } = useTheme()
  const [analyses, setAnalyses] = useState([])
  const [analysisId, setAnalysisId] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/analyses?limit=100&status=completed')
      .then(r => setAnalyses(r.data.analyses || []))
      .catch(() => setAnalyses([]))
  }, [])

  const run = async () => {
    if (!analysisId) return toast.error('Select an analysis')
    setLoading(true); setResult(null)
    try {
      const { data } = await api.post('/imagery-ai/vegetation-index', { analysis_id: analysisId })
      setResult(data?.vegetation_index || data)
      toast.success('Vegetation index computed!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Request failed')
    }
    setLoading(false)
  }

  const card = { borderRadius: '16px', background: theme.cardBg, border: `1px solid ${theme.border}`, padding: '24px', marginBottom: '20px' }
  const sel = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: `1px solid ${theme.border}`, background: theme.inputBg,
    color: theme.text, fontSize: '14px', outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      <Header breadcrumbs={[{ label: 'Vegetation Index' }]} />
      <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: theme.text, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Leaf size={24} color="#10b981" /> Vegetation Index (NDVI)
        </h1>
        <p style={{ color: theme.textMuted, marginBottom: '28px' }}>
          NDVI / crop-health AI on a completed satellite analysis.
        </p>

        <div style={card}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: theme.textMuted, marginBottom: '6px' }}>
            Analysis
          </label>
          <select style={sel} value={analysisId} onChange={e => setAnalysisId(e.target.value)}>
            <option value="">Select analysis...</option>
            {analyses.map(a => (
              <option key={a.id} value={a.id}>{a.title} ({new Date(a.created_at).toLocaleDateString()})</option>
            ))}
          </select>

          <button
            onClick={run}
            disabled={loading || !analysisId}
            style={{
              marginTop: '16px',
              padding: '10px 20px', borderRadius: '10px', border: 'none',
              background: loading ? 'rgba(16,185,129,0.3)' : 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Brain size={16} />}
            {loading ? 'Computing...' : 'Compute Vegetation Index'}
          </button>
        </div>

        {result && (
          <div style={card}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: theme.text, marginBottom: '12px' }}>Results</h3>

            {(result.ndvi_estimate != null || result.health_score != null) && (
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {result.ndvi_estimate != null && (
                  <div style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)' }}>
                    <span style={{ fontSize: 12, color: theme.textMuted }}>NDVI: </span>
                    <strong style={{ color: '#10b981' }}>{result.ndvi_estimate}</strong>
                  </div>
                )}
                {result.health_score != null && (
                  <div style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(59,130,246,0.1)' }}>
                    <span style={{ fontSize: 12, color: theme.textMuted }}>Health: </span>
                    <strong style={{ color: '#3b82f6' }}>{result.health_score}</strong>
                  </div>
                )}
                {result.classification && (
                  <div style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(245,158,11,0.1)' }}>
                    <span style={{ fontSize: 12, color: theme.textMuted }}>Class: </span>
                    <strong style={{ color: '#f59e0b' }}>{result.classification}</strong>
                  </div>
                )}
              </div>
            )}

            {result.summary && (
              <p style={{ color: theme.textSecondary, lineHeight: '1.7', fontSize: '14px' }}>{result.summary}</p>
            )}

            {Array.isArray(result.findings) && result.findings.length > 0 && (
              <Section title="Findings" items={result.findings} theme={theme} />
            )}
            {Array.isArray(result.recommendations) && result.recommendations.length > 0 && (
              <Section title="Recommendations" items={result.recommendations} theme={theme} dot="#10b981" />
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function Section({ title, items, theme, dot = '#f59e0b' }) {
  return (
    <div style={{ marginTop: '12px' }}>
      <h4 style={{ fontSize: '14px', fontWeight: '700', color: theme.text, marginBottom: '8px' }}>{title}</h4>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '6px', alignItems: 'flex-start' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: dot, marginTop: '6px', flexShrink: 0 }} />
          <span style={{ fontSize: '14px', color: theme.textSecondary, lineHeight: '1.5' }}>
            {typeof it === 'string' ? it : JSON.stringify(it)}
          </span>
        </div>
      ))}
    </div>
  )
}
