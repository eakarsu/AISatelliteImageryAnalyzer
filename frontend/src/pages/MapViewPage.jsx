import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Loader2, Filter, X } from 'lucide-react'
import Header from '../components/Header'
import { useTheme } from '../context/ThemeContext'
import api from '../api/client'
import toast from 'react-hot-toast'

const statusColors = { pending: '#eab308', completed: '#10b981', 'in-progress': '#3b82f6', failed: '#ef4444' }

function parseCoordinates(coords) {
  if (!coords) return null
  const parts = coords.split(',').map(s => parseFloat(s.trim()))
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { lat: parts[0], lng: parts[1] }
  }
  return null
}

export default function MapViewPage() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filterCategory, setFilterCategory] = useState('')
  const canvasRef = useRef(null)

  useEffect(() => {
    api.get('/analyses', { params: { limit: 500 } })
      .then((res) => setAnalyses(res.data.analyses || []))
      .catch(() => toast.error('Failed to load analyses'))
      .finally(() => setLoading(false))
  }, [])

  const withCoords = analyses
    .filter((a) => parseCoordinates(a.coordinates))
    .filter((a) => !filterCategory || a.category === filterCategory)
    .map((a) => ({ ...a, coords: parseCoordinates(a.coordinates) }))

  // Simple Mercator projection
  const projectLat = (lat) => (1 - (lat + 90) / 180) * 100
  const projectLng = (lng) => ((lng + 180) / 360) * 100

  const categories = [...new Set(analyses.map(a => a.category))].sort()

  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      <Header breadcrumbs={[{ label: 'Map View' }]} />
      <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: theme.text, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={24} /> Geographic Map View
            <span style={{ fontSize: '14px', fontWeight: '400', color: theme.textMuted }}>
              ({withCoords.length} locations)
            </span>
          </h1>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Filter size={16} color={theme.textMuted} />
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{
              padding: '8px 14px', borderRadius: '8px', border: `1px solid ${theme.border}`,
              background: theme.inputBg, color: theme.text, fontSize: '14px', outline: 'none',
            }}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c.replace(/-/g, ' ')}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px' }}>
            <Loader2 size={36} color={theme.accent} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
            {/* Map */}
            <div style={{
              position: 'relative', borderRadius: '16px', background: theme.cardBg,
              border: `1px solid ${theme.border}`, overflow: 'hidden', aspectRatio: '16/9', minHeight: '500px',
            }}>
              {/* Simple world outline */}
              <div style={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(180deg, ${theme.mode === 'dark' ? '#0c1929' : '#dbeafe'} 0%, ${theme.mode === 'dark' ? '#0a1628' : '#bfdbfe'} 100%)`,
              }}>
                {/* Grid lines */}
                {[...Array(7)].map((_, i) => (
                  <div key={`h${i}`} style={{
                    position: 'absolute', left: 0, right: 0, top: `${(i + 1) * 12.5}%`,
                    height: '1px', background: `${theme.border}40`,
                  }} />
                ))}
                {[...Array(11)].map((_, i) => (
                  <div key={`v${i}`} style={{
                    position: 'absolute', top: 0, bottom: 0, left: `${(i + 1) * 8.33}%`,
                    width: '1px', background: `${theme.border}40`,
                  }} />
                ))}

                {/* Equator */}
                <div style={{
                  position: 'absolute', left: 0, right: 0, top: '50%',
                  height: '1px', background: `${theme.accent}40`,
                }} />

                {/* Data points */}
                {withCoords.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => setSelected(a)}
                    style={{
                      position: 'absolute',
                      left: `${projectLng(a.coords.lng)}%`,
                      top: `${projectLat(a.coords.lat)}%`,
                      width: selected?.id === a.id ? '16px' : '10px',
                      height: selected?.id === a.id ? '16px' : '10px',
                      borderRadius: '50%',
                      background: statusColors[a.status] || '#3b82f6',
                      border: `2px solid ${selected?.id === a.id ? '#fff' : 'rgba(255,255,255,0.4)'}`,
                      boxShadow: `0 0 ${selected?.id === a.id ? '12px' : '6px'} ${statusColors[a.status] || '#3b82f6'}`,
                      cursor: 'pointer',
                      transform: 'translate(-50%, -50%)',
                      transition: 'all 0.2s',
                      zIndex: selected?.id === a.id ? 10 : 1,
                    }}
                    title={a.title}
                  />
                ))}

                {/* Labels */}
                <div style={{ position: 'absolute', bottom: '4px', left: '4px', fontSize: '10px', color: theme.textDim }}>-180</div>
                <div style={{ position: 'absolute', bottom: '4px', right: '4px', fontSize: '10px', color: theme.textDim }}>180</div>
                <div style={{ position: 'absolute', top: '4px', left: '4px', fontSize: '10px', color: theme.textDim }}>90N</div>
                <div style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: theme.textDim }}>0</div>
              </div>

              {withCoords.length === 0 && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textMuted }}>
                  <div style={{ textAlign: 'center' }}>
                    <MapPin size={36} style={{ marginBottom: '8px' }} />
                    <p>No analyses with coordinates found.</p>
                    <p style={{ fontSize: '13px' }}>Add coordinates to analyses to see them on the map.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selected ? (
                <div style={{
                  borderRadius: '14px', background: theme.cardBg, border: `1px solid ${theme.accent}`,
                  padding: '20px', position: 'relative',
                }}>
                  <button onClick={() => setSelected(null)} style={{
                    position: 'absolute', top: '12px', right: '12px', background: 'transparent',
                    border: 'none', color: theme.textMuted, cursor: 'pointer',
                  }}><X size={16} /></button>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: theme.text, marginBottom: '8px' }}>{selected.title}</h3>
                  <p style={{ fontSize: '13px', color: theme.textMuted, marginBottom: '4px' }}>
                    <MapPin size={12} style={{ display: 'inline' }} /> {selected.location || 'No location'}
                  </p>
                  <p style={{ fontSize: '13px', color: theme.textMuted, marginBottom: '12px' }}>
                    Coordinates: {selected.coordinates}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
                      background: `${statusColors[selected.status]}18`, color: statusColors[selected.status],
                      border: `1px solid ${statusColors[selected.status]}40`, textTransform: 'capitalize',
                    }}>{selected.status}</span>
                  </div>
                  {selected.description && <p style={{ fontSize: '13px', color: theme.textSecondary, lineHeight: '1.6' }}>{selected.description}</p>}
                  <button onClick={() => navigate(`/feature/${selected.category}/${selected.id}`)} style={{
                    marginTop: '12px', width: '100%', padding: '10px', borderRadius: '10px', border: 'none',
                    background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})`, color: '#fff',
                    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                  }}>View Details</button>
                </div>
              ) : (
                <div style={{
                  borderRadius: '14px', background: theme.cardBg, border: `1px solid ${theme.border}`,
                  padding: '20px', textAlign: 'center', color: theme.textMuted,
                }}>
                  <p style={{ fontSize: '14px' }}>Click a point on the map to view details</p>
                </div>
              )}

              <div style={{ borderRadius: '14px', background: theme.cardBg, border: `1px solid ${theme.border}`, padding: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: theme.text, marginBottom: '12px' }}>Legend</h4>
                {Object.entries(statusColors).map(([status, color]) => (
                  <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
                    <span style={{ fontSize: '13px', color: theme.textSecondary, textTransform: 'capitalize' }}>{status}</span>
                  </div>
                ))}
              </div>

              {/* Location list */}
              <div style={{
                borderRadius: '14px', background: theme.cardBg, border: `1px solid ${theme.border}`,
                padding: '16px', maxHeight: '300px', overflowY: 'auto',
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: theme.text, marginBottom: '12px' }}>
                  Locations ({withCoords.length})
                </h4>
                {withCoords.map((a) => (
                  <div key={a.id} onClick={() => setSelected(a)} style={{
                    padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px',
                    background: selected?.id === a.id ? `${theme.accent}15` : 'transparent',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={(e) => { if (selected?.id !== a.id) e.currentTarget.style.background = `${theme.accent}08` }}
                    onMouseLeave={(e) => { if (selected?.id !== a.id) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: '600', color: theme.text }}>{a.title}</div>
                    <div style={{ fontSize: '11px', color: theme.textDim }}>{a.coordinates}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
