import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Satellite, Loader2, MapPin, Calendar, Tag, AlertTriangle } from 'lucide-react'
import AIResultDisplay from '../components/AIResultDisplay'
import api from '../api/client'

const statusColors = { pending: '#eab308', completed: '#10b981', 'in-progress': '#3b82f6', failed: '#ef4444' }

export default function SharedViewPage() {
  const { token } = useParams()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get(`/share/view/${token}`)
      .then((res) => setAnalysis(res.data.analysis))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load shared analysis'))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={36} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', color: '#64748b' }}>
        <Satellite size={48} />
        <h2 style={{ color: '#e2e8f0' }}>Shared Analysis</h2>
        <p>{error}</p>
      </div>
    )
  }

  const aiResult = analysis?.ai_result || analysis?.aiResult

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a1a' }}>
      <header style={{ padding: '16px 32px', borderBottom: '1px solid #2a2a4a', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Satellite size={22} color="#3b82f6" />
        <span style={{ fontSize: '16px', fontWeight: '700', color: '#e2e8f0' }}>ASIA - Shared Analysis</span>
      </header>
      <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ borderRadius: '16px', background: 'rgba(26,26,46,0.6)', border: '1px solid #2a2a4a', padding: '28px', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#e2e8f0', marginBottom: '20px' }}>{analysis.title}</h1>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div><span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> Location</span><span style={{ color: '#e2e8f0' }}>{analysis.location || 'N/A'}</span></div>
            <div><span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}><Tag size={12} /> Status</span><span style={{ padding: '3px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: '600', background: `${statusColors[analysis.status]}18`, color: statusColors[analysis.status], textTransform: 'capitalize' }}>{analysis.status}</span></div>
            <div><span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> Created</span><span style={{ color: '#e2e8f0' }}>{analysis.created_at ? new Date(analysis.created_at).toLocaleString() : '-'}</span></div>
          </div>
          {analysis.description && (
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #2a2a4a' }}>
              <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#cbd5e1' }}>{analysis.description}</p>
            </div>
          )}
        </div>
        {analysis.image_url && (
          <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '24px', border: '1px solid #2a2a4a' }}>
            <img src={analysis.image_url} alt={analysis.title} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
          </div>
        )}
        {aiResult && (
          <div style={{ borderRadius: '16px', background: 'rgba(26,26,46,0.6)', border: '1px solid #2a2a4a', padding: '28px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#e2e8f0', marginBottom: '20px' }}>AI Analysis Results</h2>
            <AIResultDisplay result={aiResult} />
          </div>
        )}
      </div>
    </div>
  )
}
