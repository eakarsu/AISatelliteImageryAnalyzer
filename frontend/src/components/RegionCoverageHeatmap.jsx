import { useEffect, useState } from 'react'
import api from '../api/client'

function color(v) {
  // 0..100 -> dark blue to bright green
  const t = Math.max(0, Math.min(100, v)) / 100
  const r = Math.round(20 + (16 - 20) * t)
  const g = Math.round(40 + (185 - 40) * t)
  const b = Math.round(80 + (129 - 80) * t)
  return `rgb(${r},${g},${b})`
}

export default function RegionCoverageHeatmap() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    let cancelled = false
    api.get('/custom-views/coverage-heatmap')
      .then((r) => { if (!cancelled) setData(r.data) })
      .catch((e) => { if (!cancelled) setErr(e?.response?.data?.error || e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div style={{ background: 'rgba(26,26,46,0.5)', border: '1px solid #2a2a4a', borderRadius: 12, padding: 18 }}>
      <h3 style={{ margin: 0, marginBottom: 12, color: '#e2e8f0', fontSize: 16 }}>Region Coverage Heatmap (region x day)</h3>
      {loading && <div style={{ color: '#94a3b8' }}>Loading...</div>}
      {err && <div style={{ color: '#ef4444' }}>Error: {err}</div>}
      {!loading && !err && data && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 12, color: '#cbd5e1' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '6px 8px', color: '#94a3b8', fontWeight: 600 }}>Region</th>
                {data.days.map((d) => (
                  <th key={d} style={{ padding: '6px 8px', color: '#94a3b8', fontWeight: 600 }}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.matrix.map((row, ri) => (
                <tr key={ri}>
                  <td style={{ padding: '6px 8px', color: '#e2e8f0', fontWeight: 500 }}>{data.regions[ri]}</td>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      title={`${cell.region} | ${cell.day}: ${cell.coverage}% coverage (${cell.scans} scans)`}
                      style={{
                        background: color(cell.coverage),
                        color: '#0a0a1a',
                        textAlign: 'center',
                        padding: '8px 6px',
                        fontWeight: 600,
                        borderRadius: 4,
                      }}
                    >
                      {cell.coverage}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 10, fontSize: 11, color: '#64748b' }}>Cell value = % regional coverage. Hover for scan count.</div>
        </div>
      )}
    </div>
  )
}
