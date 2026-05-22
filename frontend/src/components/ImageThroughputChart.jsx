import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from 'recharts'
import api from '../api/client'

export default function ImageThroughputChart() {
  const [data, setData] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    let cancelled = false
    api.get('/custom-views/throughput')
      .then((r) => { if (!cancelled) { setData(r.data.data || []); setSummary(r.data.summary || null) } })
      .catch((e) => { if (!cancelled) setErr(e?.response?.data?.error || e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div style={{ background: 'rgba(26,26,46,0.5)', border: '1px solid #2a2a4a', borderRadius: 12, padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ margin: 0, color: '#e2e8f0', fontSize: 16 }}>Image Processing Throughput (24h)</h3>
        {summary && (
          <div style={{ color: '#94a3b8', fontSize: 12 }}>
            {summary.totalProcessed} processed | {summary.successRate}% success | avg {summary.avgPerHour}/hr
          </div>
        )}
      </div>
      {loading && <div style={{ color: '#94a3b8' }}>Loading...</div>}
      {err && <div style={{ color: '#ef4444' }}>Error: {err}</div>}
      {!loading && !err && (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <CartesianGrid stroke="#2a2a4a" strokeDasharray="3 3" />
            <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 11 }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#0f0f1e', border: '1px solid #2a2a4a', borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="processed" stroke="#3b82f6" strokeWidth={2} dot={false} name="Processed" />
            <Line type="monotone" dataKey="queued" stroke="#f59e0b" strokeWidth={2} dot={false} name="Queued" />
            <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} dot={false} name="Failed" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
