import { useState, useEffect } from 'react'
import { GitCompare, Brain, Loader2 } from 'lucide-react'
import Header from '../components/Header'
import { useTheme } from '../context/ThemeContext'
import api from '../api/client'
import toast from 'react-hot-toast'

export default function ChangeDetectionPage() {
  const { theme } = useTheme()
  const [analyses, setAnalyses] = useState([])
  const [id1, setId1] = useState('')
  const [id2, setId2] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingList, setLoadingList] = useState(true)

  useEffect(() => {
    api.get('/analyses?limit=100&status=completed')
      .then(r => setAnalyses(r.data.analyses || []))
      .catch(() => setAnalyses([]))
      .finally(() => setLoadingList(false))
  }, [])

  const compare = async () => {
    if (!id1 || !id2) return toast.error('Select two analyses to compare')
    if (id1 === id2) return toast.error('Select two different analyses')
    setLoading(true)
    setResult(null)
    try {
      const { data } = await api.post('/compare', { analysis_id_1: id1, analysis_id_2: id2 })
      setResult(data)
      toast.success('Comparison complete!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Comparison failed')
    }
    setLoading(false)
  }

  const magnitudeColor = { significant: '#ef4444', moderate: '#f59e0b', minor: '#3b82f6', none: '#10b981' }
  const directionColor = { degrading: '#ef4444', mixed: '#f59e0b', stable: '#6b7280', improving: '#10b981' }

  const card = { borderRadius: '16px', background: theme.cardBg, border: `1px solid ${theme.border}`, padding: '24px', marginBottom: '20px' }
  const sel = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: `1px solid ${theme.border}`, background: theme.inputBg,
    color: theme.text, fontSize: '14px', outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      <Header breadcrumbs={[{ label: 'Change Detection' }]} />
      <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: theme.text, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <GitCompare size={24} color={theme.accent} /> Change Detection
        </h1>
        <p style={{ color: theme.textMuted, marginBottom: '28px' }}>
          Select two completed analyses to compare changes between them using AI.
        </p>

        {/* Selection */}
        <div style={card}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: theme.textMuted, marginBottom: '6px' }}>
                Analysis A (Before)
              </label>
              <select style={sel} value={id1} onChange={e => setId1(e.target.value)}>
                <option value="">Select analysis...</option>
                {analyses.filter(a => a.id != id2).map(a => (
                  <option key={a.id} value={a.id}>{a.title} ({new Date(a.created_at).toLocaleDateString()})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: theme.textMuted, marginBottom: '6px' }}>
                Analysis B (After)
              </label>
              <select style={sel} value={id2} onChange={e => setId2(e.target.value)}>
                <option value="">Select analysis...</option>
                {analyses.filter(a => a.id != id1).map(a => (
                  <option key={a.id} value={a.id}>{a.title} ({new Date(a.created_at).toLocaleDateString()})</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={compare}
            disabled={loading || !id1 || !id2}
            style={{
              padding: '10px 20px', borderRadius: '10px', border: 'none',
              background: loading ? 'rgba(139,92,246,0.3)' : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              color: '#fff', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Brain size={16} />}
            {loading ? 'Comparing...' : 'Compare with AI'}
          </button>
        </div>

        {/* Results */}
        {result && (
          <>
            {/* Summary */}
            <div style={card}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: theme.text, marginBottom: '16px' }}>Comparison Summary</h3>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {result.comparison?.change_magnitude && (
                  <div style={{ padding: '8px 16px', borderRadius: '8px', background: `${magnitudeColor[result.comparison.change_magnitude]}15`, border: `1px solid ${magnitudeColor[result.comparison.change_magnitude]}30` }}>
                    <span style={{ fontSize: '12px', color: theme.textMuted }}>Magnitude: </span>
                    <span style={{ fontWeight: '600', color: magnitudeColor[result.comparison.change_magnitude], textTransform: 'capitalize' }}>
                      {result.comparison.change_magnitude}
                    </span>
                  </div>
                )}
                {result.comparison?.change_direction && (
                  <div style={{ padding: '8px 16px', borderRadius: '8px', background: `${directionColor[result.comparison.change_direction]}15`, border: `1px solid ${directionColor[result.comparison.change_direction]}30` }}>
                    <span style={{ fontSize: '12px', color: theme.textMuted }}>Direction: </span>
                    <span style={{ fontWeight: '600', color: directionColor[result.comparison.change_direction], textTransform: 'capitalize' }}>
                      {result.comparison.change_direction}
                    </span>
                  </div>
                )}
                {result.comparison?.confidence && (
                  <div style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <span style={{ fontSize: '12px', color: theme.textMuted }}>Confidence: </span>
                    <span style={{ fontWeight: '600', color: '#3b82f6' }}>{Math.round(result.comparison.confidence * 100)}%</span>
                  </div>
                )}
              </div>

              {result.comparison?.summary && (
                <p style={{ color: theme.textSecondary, lineHeight: '1.7', fontSize: '14px' }}>{result.comparison.summary}</p>
              )}
            </div>

            {/* Key Changes */}
            {result.comparison?.key_changes?.length > 0 && (
              <div style={card}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: theme.text, marginBottom: '12px' }}>Key Changes Detected</h3>
                {result.comparison.key_changes.map((change, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-start' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b', marginTop: '6px', flexShrink: 0 }} />
                    <span style={{ fontSize: '14px', color: theme.textSecondary, lineHeight: '1.5' }}>{change}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Metrics Comparison */}
            {result.comparison?.metrics_comparison && Object.keys(result.comparison.metrics_comparison).length > 0 && (
              <div style={card}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: theme.text, marginBottom: '12px' }}>Metrics Comparison</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
                  {Object.entries(result.comparison.metrics_comparison).map(([key, val]) => (
                    <div key={key} style={{ padding: '12px', background: theme.bg, borderRadius: '10px', border: `1px solid ${theme.border}` }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: theme.textMuted, textTransform: 'uppercase', marginBottom: '8px' }}>{key.replace(/_/g, ' ')}</div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px' }}>
                        <span style={{ color: theme.textSecondary }}>{val.before}</span>
                        <span style={{ color: theme.textMuted }}>→</span>
                        <span style={{ color: theme.text, fontWeight: '600' }}>{val.after}</span>
                        {val.change && <span style={{ color: '#10b981', fontSize: '11px' }}>({val.change})</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.comparison?.recommendations?.length > 0 && (
              <div style={card}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: theme.text, marginBottom: '12px' }}>Recommendations</h3>
                {result.comparison.recommendations.map((rec, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-start' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', marginTop: '6px', flexShrink: 0 }} />
                    <span style={{ fontSize: '14px', color: theme.textSecondary, lineHeight: '1.5' }}>{rec}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
