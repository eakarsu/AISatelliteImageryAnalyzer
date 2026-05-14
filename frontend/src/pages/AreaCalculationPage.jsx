import { useState, useEffect } from 'react'
import { Ruler, Brain, Loader2 } from 'lucide-react'
import Header from '../components/Header'
import { useTheme } from '../context/ThemeContext'
import api from '../api/client'
import toast from 'react-hot-toast'

const FEATURE_OPTIONS = ['buildings', 'water', 'vegetation', 'roads', 'farmland', 'urban', 'forest']

export default function AreaCalculationPage() {
  const { theme } = useTheme()
  const [analyses, setAnalyses] = useState([])
  const [analysisId, setAnalysisId] = useState('')
  const [features, setFeatures] = useState(['buildings', 'water', 'vegetation'])
  const [scaleMetersPerPixel, setScaleMetersPerPixel] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/analyses?limit=100&status=completed')
      .then(r => setAnalyses(r.data.analyses || []))
      .catch(() => setAnalyses([]))
  }, [])

  const toggle = (f) => {
    setFeatures(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
  }

  const run = async () => {
    if (!analysisId) return toast.error('Select an analysis')
    if (features.length === 0) return toast.error('Select at least one feature')
    setLoading(true); setResult(null)
    try {
      const { data } = await api.post('/imagery-ai/area-calculation', {
        analysis_id: analysisId,
        features,
        scale_meters_per_pixel: scaleMetersPerPixel ? Number(scaleMetersPerPixel) : undefined,
      })
      setResult(data?.area || data)
      toast.success('Area calculation complete!')
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
      <Header breadcrumbs={[{ label: 'Area Calculation' }]} />
      <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: theme.text, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Ruler size={24} color="#0ea5e9" /> Area Calculation
        </h1>
        <p style={{ color: theme.textMuted, marginBottom: '28px' }}>
          Measure features (buildings, water, vegetation, roads) on a completed analysis with optional scale.
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

          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: theme.textMuted, marginTop: '16px', marginBottom: '6px' }}>
            Features
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {FEATURE_OPTIONS.map(f => (
              <button
                key={f}
                onClick={() => toggle(f)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: `1px solid ${features.includes(f) ? '#0ea5e9' : theme.border}`,
                  background: features.includes(f) ? '#0ea5e9' : theme.inputBg,
                  color: features.includes(f) ? '#fff' : theme.text,
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: theme.textMuted, marginTop: '16px', marginBottom: '6px' }}>
            Scale (meters per pixel) — optional
          </label>
          <input
            type="number"
            step="0.01"
            style={sel}
            value={scaleMetersPerPixel}
            onChange={e => setScaleMetersPerPixel(e.target.value)}
            placeholder="e.g. 0.5"
          />

          <button
            onClick={run}
            disabled={loading || !analysisId}
            style={{
              marginTop: '16px',
              padding: '10px 20px', borderRadius: '10px', border: 'none',
              background: loading ? 'rgba(14,165,233,0.3)' : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              color: '#fff', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Brain size={16} />}
            {loading ? 'Calculating...' : 'Calculate Areas'}
          </button>
        </div>

        {result && (
          <div style={card}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: theme.text, marginBottom: '12px' }}>Results</h3>
            {result.summary && (
              <p style={{ color: theme.textSecondary, lineHeight: '1.7', fontSize: '14px', marginBottom: '12px' }}>{result.summary}</p>
            )}

            {Array.isArray(result.measurements) && result.measurements.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                {result.measurements.map((m, i) => (
                  <div key={i} style={{ padding: '12px', background: theme.bg, borderRadius: '10px', border: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: theme.textMuted, textTransform: 'capitalize', marginBottom: '6px' }}>{m.feature}</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: theme.text }}>
                      {m.area} {m.unit || 'sq m'}
                    </div>
                    {m.percent_of_image != null && (
                      <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '4px' }}>
                        {m.percent_of_image}% of image
                      </div>
                    )}
                    {m.notes && (
                      <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '4px' }}>{m.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <pre style={{ background: theme.inputBg, padding: '12px', borderRadius: '8px', overflow: 'auto', color: theme.text }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
