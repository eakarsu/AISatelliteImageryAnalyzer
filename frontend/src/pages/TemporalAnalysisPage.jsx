import { useState, useEffect } from 'react'
import { Clock, Brain, Loader2 } from 'lucide-react'
import Header from '../components/Header'
import { useTheme } from '../context/ThemeContext'
import api from '../api/client'
import toast from 'react-hot-toast'

export default function TemporalAnalysisPage() {
  const { theme } = useTheme()
  const [analyses, setAnalyses] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [focus, setFocus] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [serviceUnavailable, setServiceUnavailable] = useState(false)

  useEffect(() => {
    api.get('/analyses?limit=200&status=completed')
      .then(r => setAnalyses(r.data.analyses || []))
      .catch(() => setAnalyses([]))
  }, [])

  const toggle = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const run = async () => {
    if (selectedIds.length < 2) return toast.error('Select at least 2 analyses')
    setLoading(true); setResult(null); setServiceUnavailable(false)
    try {
      const { data } = await api.post('/imagery-ai/temporal-analysis', {
        analysis_ids: selectedIds.map(Number),
        focus: focus || undefined,
      })
      setResult(data)
      toast.success('Temporal analysis complete!')
    } catch (err) {
      const status = err.response?.status
      if (status === 503) {
        setServiceUnavailable(true)
        toast.error('AI service unavailable: backend has no API key configured')
      } else {
        toast.error(err.response?.data?.error || 'Request failed')
      }
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
      <Header breadcrumbs={[{ label: 'Temporal Analysis' }]} />
      <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: theme.text, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock size={24} color="#10b981" /> Temporal Analysis
        </h1>
        <p style={{ color: theme.textMuted, marginBottom: '28px' }}>
          Sequence change-detection across multiple analyses, ordered by capture time, to surface multi-step trends and anomalies.
        </p>

        {serviceUnavailable && (
          <div style={{ ...card, borderColor: '#ef4444', background: 'rgba(239,68,68,0.1)' }}>
            <div style={{ color: '#ef4444', fontWeight: 600, marginBottom: 4 }}>AI service unavailable (503)</div>
            <div style={{ color: theme.textSecondary, fontSize: 14 }}>
              The backend reports OPENROUTER_API_KEY is not configured. Set it in the backend `.env` and restart.
            </div>
          </div>
        )}

        <div style={card}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: theme.textMuted, marginBottom: '6px' }}>
            Select 2 or more analyses (oldest → newest is auto-sorted)
          </label>
          <div style={{ maxHeight: 280, overflowY: 'auto', background: theme.inputBg, padding: 12, borderRadius: 8, border: `1px solid ${theme.border}` }}>
            {analyses.length === 0 ? (
              <div style={{ color: theme.textMuted, fontSize: 13 }}>No completed analyses available.</div>
            ) : analyses.map(a => (
              <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(a.id)}
                  onChange={() => toggle(a.id)}
                />
                <span style={{ color: theme.text, fontSize: 14 }}>
                  {a.title} <span style={{ color: theme.textMuted }}>({new Date(a.captured_at || a.created_at).toLocaleDateString()})</span>
                </span>
              </label>
            ))}
          </div>

          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: theme.textMuted, marginTop: '16px', marginBottom: '6px' }}>
            Focus (optional)
          </label>
          <input
            type="text"
            style={sel}
            value={focus}
            onChange={e => setFocus(e.target.value)}
            placeholder="e.g. urban expansion, deforestation, shoreline change…"
          />

          <button
            onClick={run}
            disabled={loading || selectedIds.length < 2}
            style={{
              marginTop: '16px',
              padding: '10px 20px', borderRadius: '10px', border: 'none',
              background: loading ? 'rgba(16,185,129,0.3)' : 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Brain size={16} />}
            {loading ? 'Analyzing...' : `Analyze ${selectedIds.length || ''} Timepoints`}
          </button>
        </div>

        {result && (
          <div style={card}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: theme.text, marginBottom: '12px' }}>Results</h3>
            {Array.isArray(result.ordered_steps) && result.ordered_steps.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', marginBottom: 6 }}>
                  Timeline ({result.step_count} steps)
                </div>
                <ol style={{ margin: 0, paddingLeft: 20, color: theme.textSecondary, fontSize: 14 }}>
                  {result.ordered_steps.map(s => (
                    <li key={s.id}>
                      {s.title} <span style={{ color: theme.textMuted }}>— {new Date(s.captured_at).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            <pre style={{ background: theme.inputBg, padding: '12px', borderRadius: '8px', overflow: 'auto', color: theme.text, fontSize: 12 }}>
              {JSON.stringify(result.temporal_analysis || result, null, 2)}
            </pre>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
