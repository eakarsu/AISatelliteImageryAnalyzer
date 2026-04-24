import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Plus, Search, ArrowLeft, Loader2, MapPin, Calendar, Filter,
  Trash2, CheckSquare, Square, ArrowUpDown,
  Satellite, Map, GitCompare, Leaf, Building2, CloudSun, Shield,
  Droplets, TreePine, AlertTriangle, Landmark, Wind, Mountain,
  Users, Gem,
} from 'lucide-react'
import Header from '../components/Header'
import Modal from '../components/Modal'
import AIResultDisplay from '../components/AIResultDisplay'
import ImageUpload from '../components/ImageUpload'
import Pagination from '../components/Pagination'
import { useTheme } from '../context/ThemeContext'
import api from '../api/client'
import toast from 'react-hot-toast'

const featureMap = {
  'satellite-image-analysis': { title: 'Satellite Image Analysis', icon: Satellite },
  'land-use-classification': { title: 'Land Use Classification', icon: Map },
  'change-detection': { title: 'Change Detection', icon: GitCompare },
  'crop-health-monitoring': { title: 'Crop Health Monitoring', icon: Leaf },
  'urban-planning': { title: 'Urban Planning', icon: Building2 },
  'climate-impact': { title: 'Climate Impact', icon: CloudSun },
  'defense-security': { title: 'Defense & Security', icon: Shield },
  'water-body-analysis': { title: 'Water Body Analysis', icon: Droplets },
  'vegetation-index': { title: 'Vegetation Index', icon: TreePine },
  'disaster-assessment': { title: 'Disaster Assessment', icon: AlertTriangle },
  'infrastructure-detection': { title: 'Infrastructure Detection', icon: Landmark },
  'air-quality': { title: 'Air Quality Analysis', icon: Wind },
  'terrain-analysis': { title: 'Terrain Analysis', icon: Mountain },
  'population-density': { title: 'Population Density', icon: Users },
  'mining-resource-detection': { title: 'Mining & Resource Detection', icon: Gem },
}

const statusStyles = {
  pending: { bg: 'rgba(234,179,8,0.12)', color: '#eab308', border: 'rgba(234,179,8,0.3)' },
  completed: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', border: 'rgba(16,185,129,0.3)' },
  'in-progress': { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: 'rgba(59,130,246,0.3)' },
  failed: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', border: 'rgba(239,68,68,0.3)' },
}

const priorityStyles = {
  low: { bg: 'rgba(100,116,139,0.12)', color: '#94a3b8', border: 'rgba(100,116,139,0.3)' },
  medium: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: 'rgba(59,130,246,0.3)' },
  high: { bg: 'rgba(249,115,22,0.12)', color: '#f97316', border: 'rgba(249,115,22,0.3)' },
  critical: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', border: 'rgba(239,68,68,0.3)' },
}

function Badge({ type, value }) {
  const map = type === 'status' ? statusStyles : priorityStyles
  const s = map[value] || map.pending
  return (
    <span style={{
      padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`, textTransform: 'capitalize',
    }}>{value}</span>
  )
}

const emptyForm = { title: '', description: '', location: '', coordinates: '', priority: 'medium', image_url: '' }

export default function FeatureListPage() {
  const { category } = useParams()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const feature = featureMap[category] || { title: category, icon: Satellite }
  const FeatureIcon = feature.icon

  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })
  const [submitting, setSubmitting] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)

  // Advanced filtering
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')
  const [showFilters, setShowFilters] = useState(false)

  // Batch operations
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [batchMode, setBatchMode] = useState(false)

  // Pagination
  const [page, setPage] = useState(1)
  const pageSize = parseInt(localStorage.getItem('pageSize') || '20')

  const fetchAnalyses = () => {
    setLoading(true)
    api.get('/analyses', { params: { category, limit: 500 } })
      .then((res) => setAnalyses(res.data.analyses || []))
      .catch(() => toast.error('Failed to load analyses'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchAnalyses()
    setAiResult(null)
    setSelectedIds(new Set())
    setBatchMode(false)
    setPage(1)
  }, [category])

  const filtered = useMemo(() => {
    let result = analyses
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((a) =>
        a.title?.toLowerCase().includes(q) || a.location?.toLowerCase().includes(q) ||
        a.status?.toLowerCase().includes(q) || a.priority?.toLowerCase().includes(q)
      )
    }
    if (statusFilter) result = result.filter((a) => a.status === statusFilter)
    if (priorityFilter) result = result.filter((a) => a.priority === priorityFilter)

    // Sort
    result = [...result].sort((a, b) => {
      let aVal = a[sortBy], bVal = b[sortBy]
      if (sortBy === 'created_at') { aVal = new Date(aVal || 0); bVal = new Date(bVal || 0) }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [analyses, search, statusFilter, priorityFilter, sortBy, sortDir])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selectedIds.size === paginated.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(paginated.map((a) => a.id)))
  }

  const batchDelete = async () => {
    if (selectedIds.size === 0) return
    try {
      await api.post('/batch/delete', { ids: [...selectedIds] })
      toast.success(`${selectedIds.size} analyses deleted`)
      setSelectedIds(new Set())
      fetchAnalyses()
    } catch { toast.error('Batch delete failed') }
  }

  const batchUpdateStatus = async (status) => {
    if (selectedIds.size === 0) return
    try {
      await api.post('/batch/update-status', { ids: [...selectedIds], status })
      toast.success(`${selectedIds.size} analyses updated to ${status}`)
      setSelectedIds(new Set())
      fetchAnalyses()
    } catch { toast.error('Batch update failed') }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('Title is required'); return }
    setSubmitting(true)
    setAiResult(null)
    try {
      const res = await api.post('/analyses', { ...form, category, runAI: true })
      toast.success('Analysis created!')
      const newAnalysis = res.data.analysis || res.data
      if (newAnalysis.ai_result) {
        setAiResult(newAnalysis.ai_result)
        toast.success('AI analysis completed!')
      } else {
        setAiLoading(true)
        try {
          const aiRes = await api.post(`/analyses/${newAnalysis.id}/ai-analyze`)
          setAiResult(aiRes.data.analysis?.ai_result || aiRes.data.ai_result || aiRes.data)
          toast.success('AI analysis completed!')
        } catch { toast.error('AI analysis failed, but analysis was saved.') }
        finally { setAiLoading(false) }
      }
      fetchAnalyses()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to create analysis') }
    finally { setSubmitting(false) }
  }

  const closeModal = () => { setModalOpen(false); setForm({ ...emptyForm }); setAiResult(null); setAiLoading(false) }

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: '10px',
    border: `1px solid ${theme.border}`, background: theme.inputBg,
    color: theme.text, fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', marginBottom: '16px',
  }
  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '6px' }

  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      <Header breadcrumbs={[{ label: feature.title }]} />
      <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Top Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button style={{ width: '40px', height: '40px', borderRadius: '10px', border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => navigate('/')}><ArrowLeft size={18} /></button>
            <FeatureIcon size={28} color={theme.accent} />
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: theme.text }}>{feature.title}</h1>
            <span style={{ fontSize: '14px', color: theme.textMuted }}>({filtered.length})</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: theme.textDim, pointerEvents: 'none' }} />
              <input placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                style={{ padding: '10px 14px 10px 42px', borderRadius: '10px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.text, fontSize: '14px', outline: 'none', width: '220px' }} />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} style={{
              padding: '10px 16px', borderRadius: '10px', border: `1px solid ${showFilters ? theme.accent : theme.border}`,
              background: showFilters ? `${theme.accent}10` : 'transparent', color: showFilters ? theme.accent : theme.textSecondary,
              fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            }}><Filter size={16} /> Filters</button>
            <button onClick={() => { setBatchMode(!batchMode); setSelectedIds(new Set()) }} style={{
              padding: '10px 16px', borderRadius: '10px', border: `1px solid ${batchMode ? '#f59e0b' : theme.border}`,
              background: batchMode ? 'rgba(245,158,11,0.1)' : 'transparent', color: batchMode ? '#f59e0b' : theme.textSecondary,
              fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            }}><CheckSquare size={16} /> Batch</button>
            <button onClick={() => setModalOpen(true)} style={{
              padding: '10px 20px', borderRadius: '10px', border: 'none',
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})`, color: '#fff',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: `0 4px 12px ${theme.accent}50`,
            }}><Plus size={16} /> New Analysis</button>
          </div>
        </div>

        {/* Filters Bar */}
        {showFilters && (
          <div style={{
            display: 'flex', gap: '12px', padding: '16px', borderRadius: '12px',
            background: theme.cardBg, border: `1px solid ${theme.border}`, marginBottom: '16px',
            flexWrap: 'wrap', alignItems: 'center',
          }}>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} style={{
              padding: '8px 14px', borderRadius: '8px', border: `1px solid ${theme.border}`,
              background: theme.inputBg, color: theme.text, fontSize: '13px', outline: 'none',
            }}>
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1) }} style={{
              padding: '8px 14px', borderRadius: '8px', border: `1px solid ${theme.border}`,
              background: theme.inputBg, color: theme.text, fontSize: '13px', outline: 'none',
            }}>
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowUpDown size={14} color={theme.textMuted} />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{
                padding: '8px 14px', borderRadius: '8px', border: `1px solid ${theme.border}`,
                background: theme.inputBg, color: theme.text, fontSize: '13px', outline: 'none',
              }}>
                <option value="created_at">Date</option>
                <option value="title">Title</option>
                <option value="status">Status</option>
                <option value="priority">Priority</option>
              </select>
              <button onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')} style={{
                padding: '8px 12px', borderRadius: '8px', border: `1px solid ${theme.border}`,
                background: 'transparent', color: theme.textSecondary, fontSize: '13px', cursor: 'pointer',
              }}>{sortDir === 'asc' ? 'ASC' : 'DESC'}</button>
            </div>
            {(statusFilter || priorityFilter) && (
              <button onClick={() => { setStatusFilter(''); setPriorityFilter(''); setPage(1) }} style={{
                padding: '8px 14px', borderRadius: '8px', border: 'none', background: 'rgba(239,68,68,0.1)',
                color: '#ef4444', fontSize: '13px', cursor: 'pointer',
              }}>Clear Filters</button>
            )}
          </div>
        )}

        {/* Batch Actions */}
        {batchMode && selectedIds.size > 0 && (
          <div style={{
            display: 'flex', gap: '10px', padding: '12px 16px', borderRadius: '12px',
            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
            marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#f59e0b' }}>{selectedIds.size} selected</span>
            <button onClick={() => batchUpdateStatus('completed')} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: '#10b981', color: '#fff', fontSize: '13px', cursor: 'pointer' }}>Mark Completed</button>
            <button onClick={() => batchUpdateStatus('pending')} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: '#eab308', color: '#fff', fontSize: '13px', cursor: 'pointer' }}>Mark Pending</button>
            <button onClick={batchDelete} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: theme.textDim }}>
            <Loader2 size={32} color={theme.accent} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
            <p>Loading analyses...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: theme.textDim }}>
            <FeatureIcon size={48} color={theme.border} style={{ margin: '0 auto 12px', display: 'block' }} />
            <p style={{ fontSize: '16px', color: theme.textMuted, marginBottom: '8px' }}>
              {search || statusFilter || priorityFilter ? 'No analyses match your filters.' : 'No analyses yet.'}
            </p>
            <p style={{ fontSize: '13px' }}>Click "New Analysis" to get started.</p>
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
              <thead>
                <tr>
                  {batchMode && <th style={{ width: '40px', padding: '12px 8px' }}>
                    <button onClick={selectAll} style={{ background: 'transparent', border: 'none', color: theme.textMuted, cursor: 'pointer' }}>
                      {selectedIds.size === paginated.length ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>
                  </th>}
                  {['Title', 'Location', 'Status', 'Priority', 'Date'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', color: theme.textMuted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((a) => (
                  <tr key={a.id} style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={() => !batchMode && navigate(`/feature/${category}/${a.id}`)}
                    onMouseEnter={(e) => e.currentTarget.querySelectorAll('td').forEach((td) => { td.style.background = `${theme.accent}06`; td.style.borderColor = `${theme.accent}30` })}
                    onMouseLeave={(e) => e.currentTarget.querySelectorAll('td').forEach((td) => { td.style.background = theme.cardBg; td.style.borderColor = theme.border })}>
                    {batchMode && <td style={{ padding: '16px 8px', background: theme.cardBg, borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}`, borderLeft: `1px solid ${theme.border}`, borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>
                      <button onClick={(e) => { e.stopPropagation(); toggleSelect(a.id) }} style={{ background: 'transparent', border: 'none', color: selectedIds.has(a.id) ? '#f59e0b' : theme.textDim, cursor: 'pointer' }}>
                        {selectedIds.has(a.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                    </td>}
                    <td style={{ padding: '16px', background: theme.cardBg, borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}`, ...(batchMode ? {} : { borderLeft: `1px solid ${theme.border}`, borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }), fontWeight: '600', color: theme.text, fontSize: '14px' }}>{a.title}</td>
                    <td style={{ padding: '16px', background: theme.cardBg, borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}`, fontSize: '14px', color: theme.textSecondary }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} color={theme.textDim} /> {a.location || '-'}</span>
                    </td>
                    <td style={{ padding: '16px', background: theme.cardBg, borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}` }}><Badge type="status" value={a.status || 'pending'} /></td>
                    <td style={{ padding: '16px', background: theme.cardBg, borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}` }}><Badge type="priority" value={a.priority || 'medium'} /></td>
                    <td style={{ padding: '16px', background: theme.cardBg, borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}`, borderRight: `1px solid ${theme.border}`, borderTopRightRadius: '12px', borderBottomRightRadius: '12px', fontSize: '14px', color: theme.textSecondary }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} color={theme.textDim} /> {a.created_at ? new Date(a.created_at).toLocaleDateString() : '-'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* New Analysis Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title="New Analysis">
        <form onSubmit={handleCreate}>
          <label style={labelStyle}>Title *</label>
          <input style={inputStyle} placeholder="e.g., Amazon Basin Deforestation Study" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} placeholder="Describe the analysis objective..."
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Location</label>
              <input style={inputStyle} placeholder="e.g., Amazon Basin, Brazil" value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Coordinates</label>
              <input style={inputStyle} placeholder="e.g., -3.4653, -62.2159" value={form.coordinates}
                onChange={(e) => setForm({ ...form, coordinates: e.target.value })} />
            </div>
          </div>
          <label style={labelStyle}>Priority</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option value="low">Low</option><option value="medium">Medium</option>
            <option value="high">High</option><option value="critical">Critical</option>
          </select>
          <label style={labelStyle}>Satellite Image</label>
          <div style={{ marginBottom: '16px' }}>
            <ImageUpload onUpload={(url) => setForm({ ...form, image_url: url })} />
          </div>
          <button type="submit" disabled={submitting || aiLoading} style={{
            width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})`, color: '#fff',
            fontSize: '15px', fontWeight: '600', cursor: submitting || aiLoading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            opacity: submitting || aiLoading ? 0.7 : 1, boxShadow: `0 4px 15px ${theme.accent}50`,
          }}>
            {submitting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Creating...</>
              : aiLoading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> AI Analyzing...</>
              : <><Plus size={16} /> Create & Analyze</>}
          </button>
        </form>
        {aiLoading && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: theme.textMuted }}>
            <Loader2 size={28} color={theme.accent} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
            <p>AI is analyzing your data...</p>
          </div>
        )}
        {aiResult && (
          <div style={{ marginTop: '24px', borderTop: `1px solid ${theme.border}`, paddingTop: '24px' }}>
            <AIResultDisplay result={aiResult} />
          </div>
        )}
      </Modal>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
