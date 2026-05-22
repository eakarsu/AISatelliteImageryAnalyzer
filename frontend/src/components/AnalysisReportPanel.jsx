import { useEffect, useState } from 'react'
import api from '../api/client'

export default function AnalysisReportPanel() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [downloading, setDownloading] = useState(false)

  const load = () => {
    setLoading(true); setErr(null)
    api.get('/custom-views/analysis-report')
      .then((r) => setReport(r.data))
      .catch((e) => setErr(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const download = async () => {
    setDownloading(true)
    try {
      const res = await api.get('/custom-views/analysis-report?format=pdf', { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = 'analysis-report.pdf'
      document.body.appendChild(a); a.click(); a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      setErr(e?.response?.data?.error || e.message)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div style={{ background: 'rgba(26,26,46,0.5)', border: '1px solid #2a2a4a', borderRadius: 12, padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, color: '#e2e8f0', fontSize: 16 }}>Analysis Report (PDF)</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={load} style={btn('#334155')}>Refresh</button>
          <button onClick={download} disabled={downloading} style={btn('#3b82f6')}>
            {downloading ? 'Downloading...' : 'Download PDF'}
          </button>
        </div>
      </div>
      {loading && <div style={{ color: '#94a3b8' }}>Loading...</div>}
      {err && <div style={{ color: '#ef4444' }}>Error: {err}</div>}
      {!loading && !err && report && (
        <div>
          <div style={{ color: '#cbd5e1', fontSize: 13, marginBottom: 10 }}>
            <strong>{report.title}</strong> | analyst: {report.analyst} | generated: {new Date(report.generatedAt).toLocaleString()}
          </div>
          {report.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ color: '#a78bfa', fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{s.heading}</div>
              <div style={{ color: '#e2e8f0', fontSize: 13, lineHeight: 1.5 }}>{s.body}</div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 16, marginTop: 10, color: '#94a3b8', fontSize: 12, flexWrap: 'wrap' }}>
            <span>Tiles: {report.metrics.tilesProcessed}</span>
            <span>Accuracy: {(report.metrics.accuracy * 100).toFixed(1)}%</span>
            <span>Cloud avg: {(report.metrics.cloudCoverAvg * 100).toFixed(1)}%</span>
            <span>Regions: {report.metrics.regionsCovered}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function btn(bg) {
  return {
    padding: '6px 12px', borderRadius: 8, border: 'none', background: bg,
    color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 500,
  }
}
