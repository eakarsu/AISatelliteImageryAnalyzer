import { useEffect, useState } from 'react'
import api from '../api/client'

const emptyDraft = { name: '', threshold: 0.7, enabled: true, color: '#6366f1', description: '' }

export default function DetectionRulesEditor() {
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [draft, setDraft] = useState(emptyDraft)
  const [editingId, setEditingId] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = () => {
    setLoading(true); setErr(null)
    api.get('/custom-views/detection-rules')
      .then((r) => setRules(r.data.rules || []))
      .catch((e) => setErr(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const submit = async () => {
    setBusy(true); setErr(null)
    try {
      if (editingId) {
        await api.put(`/custom-views/detection-rules/${editingId}`, draft)
      } else {
        await api.post('/custom-views/detection-rules', draft)
      }
      setDraft(emptyDraft); setEditingId(null); load()
    } catch (e) {
      setErr(e?.response?.data?.error || e.message)
    } finally { setBusy(false) }
  }

  const edit = (r) => { setEditingId(r.id); setDraft({ ...r }) }
  const cancel = () => { setEditingId(null); setDraft(emptyDraft) }
  const del = async (id) => {
    if (!confirm('Delete this rule?')) return
    setBusy(true); setErr(null)
    try { await api.delete(`/custom-views/detection-rules/${id}`); load() }
    catch (e) { setErr(e?.response?.data?.error || e.message) }
    finally { setBusy(false) }
  }

  return (
    <div style={{ background: 'rgba(26,26,46,0.5)', border: '1px solid #2a2a4a', borderRadius: 12, padding: 18 }}>
      <h3 style={{ margin: 0, marginBottom: 12, color: '#e2e8f0', fontSize: 16 }}>Detection Rules Editor (classifier thresholds)</h3>
      {err && <div style={{ color: '#ef4444', marginBottom: 10, fontSize: 13 }}>Error: {err}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8, marginBottom: 10 }}>
        <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          placeholder="Class name" style={inp} />
        <input type="number" step="0.05" min="0" max="1" value={draft.threshold}
          onChange={(e) => setDraft({ ...draft, threshold: e.target.value })}
          placeholder="Threshold" style={inp} />
        <input value={draft.color} onChange={(e) => setDraft({ ...draft, color: e.target.value })}
          placeholder="#hex" style={inp} />
        <input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          placeholder="Description" style={inp} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#cbd5e1', fontSize: 13 }}>
          <input type="checkbox" checked={!!draft.enabled} onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })} />
          Enabled
        </label>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button onClick={submit} disabled={busy || !draft.name} style={btn('#3b82f6')}>
          {editingId ? 'Update Rule' : 'Add Rule'}
        </button>
        {editingId && <button onClick={cancel} style={btn('#334155')}>Cancel</button>}
      </div>

      {loading && <div style={{ color: '#94a3b8' }}>Loading...</div>}
      {!loading && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ color: '#94a3b8', borderBottom: '1px solid #2a2a4a' }}>
              <th style={th}>Name</th>
              <th style={th}>Threshold</th>
              <th style={th}>Color</th>
              <th style={th}>Enabled</th>
              <th style={th}>Description</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #1a1a2e', color: '#cbd5e1' }}>
                <td style={td}>{r.name}</td>
                <td style={td}>{Number(r.threshold).toFixed(2)}</td>
                <td style={td}><span style={{ display: 'inline-block', width: 18, height: 18, background: r.color, borderRadius: 4, verticalAlign: 'middle' }} /> <code style={{ fontSize: 11 }}>{r.color}</code></td>
                <td style={td}>{r.enabled ? 'yes' : 'no'}</td>
                <td style={td}>{r.description}</td>
                <td style={td}>
                  <button onClick={() => edit(r)} style={btn('#475569', 'small')}>Edit</button>{' '}
                  <button onClick={() => del(r.id)} style={btn('#ef4444', 'small')}>Delete</button>
                </td>
              </tr>
            ))}
            {rules.length === 0 && <tr><td colSpan={6} style={{ ...td, color: '#64748b' }}>No rules.</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  )
}

const inp = { padding: '8px 10px', background: '#0f0f1e', border: '1px solid #2a2a4a', borderRadius: 6, color: '#e2e8f0', fontSize: 13 }
const th = { textAlign: 'left', padding: '8px 6px', fontWeight: 600 }
const td = { padding: '8px 6px' }
function btn(bg, size) {
  return {
    padding: size === 'small' ? '4px 10px' : '8px 14px',
    borderRadius: 6, border: 'none', background: bg, color: '#fff',
    fontSize: size === 'small' ? 11 : 13, cursor: 'pointer', fontWeight: 500,
  }
}
