import { useState, useEffect } from 'react'
import { Box, Brain, Loader2 } from 'lucide-react'
import Header from '../components/Header'
import { useTheme } from '../context/ThemeContext'
import api from '../api/client'
import toast from 'react-hot-toast'

const OBJECT_OPTIONS = [
  'buildings', 'roads', 'vehicles', 'bridges',
  'power lines', 'communication towers', 'storage tanks',
  'aircraft', 'ships', 'solar panels', 'wind turbines',
]

export default function ObjectDetectionPage() {
  const { theme } = useTheme()
  const [analyses, setAnalyses] = useState([])
  const [analysisId, setAnalysisId] = useState('')
  const [targets, setTargets] = useState(['buildings', 'roads', 'vehicles'])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [serviceUnavailable, setServiceUnavailable] = useState(false)

  useEffect(() => {
    api.get('/analyses?limit=100&status=completed')
      .then(r => setAnalyses(r.data.analyses || []))
      .catch(() => setAnalyses([]))
  }, [])

  const toggle = (f) => {
    setTargets(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
  }

  const run = async () => {
    if (!analysisId) return toast.error('Select an analysis')
    if (targets.length === 0) return toast.error('Select at least one target object')
    setLoading(true); setResult(null); setServiceUnavailable(false)
    try {
      const { data } = await api.post('/imagery-ai/object-detection', {
        analysis_id: analysisId,
        target_objects: targets,
      })
      setResult(data?.object_detection || data)
      toast.success('Object detection complete!')
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
      <Header breadcrumbs={[{ label: 'Object Detection' }]} />
      <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: theme.text, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Box size={24} color="#6366f1" /> Object Detection
        </h1>
        <p style={{ color: theme.textMuted, marginBottom: '28px' }}>
          Catalog infrastructure and objects (buildings, roads, vehicles, bridges, towers, tanks, aircraft, ships) from a completed analysis.
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
            Analysis
          </label>
          <select style={sel} value={analysisId} onChange={e => setAnalysisId(e.target.value)}>
            <option value="">Select analysis...</option>
            {analyses.map(a => (
              <option key={a.id} value={a.id}>{a.title} ({new Date(a.created_at).toLocaleDateString()})</option>
            ))}
          </select>

          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: theme.textMuted, marginTop: '16px', marginBottom: '6px' }}>
            Target objects
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {OBJECT_OPTIONS.map(f => (
              <button
                key={f}
                onClick={() => toggle(f)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: `1px solid ${targets.includes(f) ? '#6366f1' : theme.border}`,
                  background: targets.includes(f) ? '#6366f1' : theme.inputBg,
                  color: targets.includes(f) ? '#fff' : theme.text,
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={run}
            disabled={loading || !analysisId}
            style={{
              marginTop: '16px',
              padding: '10px 20px', borderRadius: '10px', border: 'none',
              background: loading ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: '#fff', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Brain size={16} />}
            {loading ? 'Detecting...' : 'Detect Objects'}
          </button>
        </div>

        {result && (
          <div style={card}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: theme.text, marginBottom: '12px' }}>Results</h3>
            {result.summary && (
              <p style={{ color: theme.textSecondary, lineHeight: '1.7', fontSize: '14px', marginBottom: '12px' }}>{result.summary}</p>
            )}
            <pre style={{ background: theme.inputBg, padding: '12px', borderRadius: '8px', overflow: 'auto', color: theme.text, fontSize: 12 }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
