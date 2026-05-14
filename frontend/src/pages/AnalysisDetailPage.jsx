import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Edit3, Trash2, Brain, Loader2, Save, X, MapPin,
  Calendar, Tag, AlertTriangle, Share2, Printer,
  Satellite, Map, GitCompare, Leaf, Building2, CloudSun, Shield,
  Droplets, TreePine, Landmark, Wind, Mountain, Users, Gem,
} from 'lucide-react'
import Header from '../components/Header'
import Modal from '../components/Modal'
import AIResultDisplay from '../components/AIResultDisplay'
import BookmarkButton from '../components/BookmarkButton'
import NotesPanel from '../components/NotesPanel'
import TagsInput from '../components/TagsInput'
import ShareModal from '../components/ShareModal'
import ImageUpload from '../components/ImageUpload'
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

const statusColors = { pending: '#eab308', completed: '#10b981', 'in-progress': '#3b82f6', failed: '#ef4444' }
const priorityColors = { low: '#94a3b8', medium: '#3b82f6', high: '#f97316', critical: '#ef4444' }

export default function AnalysisDetailPage() {
  const { category, id } = useParams()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const feature = featureMap[category] || { title: category, icon: Satellite }

  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)

  const fetchAnalysis = () => {
    setLoading(true)
    api.get(`/analyses/${id}`)
      .then((res) => {
        const data = res.data.analysis || res.data
        setAnalysis(data)
        setEditForm({
          title: data.title || '', description: data.description || '',
          location: data.location || '', coordinates: data.coordinates || '',
          priority: data.priority || 'medium', status: data.status || 'pending',
          image_url: data.image_url || '',
        })
      })
      .catch(() => toast.error('Failed to load analysis'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAnalysis() }, [id])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await api.put(`/analyses/${id}`, editForm)
      setAnalysis(res.data.analysis || res.data)
      setEditing(false)
      toast.success('Analysis updated!')
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/analyses/${id}`)
      toast.success('Analysis deleted')
      navigate(`/feature/${category}`, { replace: true })
    } catch { toast.error('Failed to delete') }
    finally { setDeleting(false) }
  }

  const handleRunAI = async () => {
    setAiLoading(true)
    toast('Analyzing image with vision AI...', { icon: '🛰️' })
    try {
      const res = await api.post(`/analyses/${id}/ai-analyze`)
      const updated = res.data.analysis || res.data
      setAnalysis((prev) => ({ ...prev, ai_result: updated.ai_result || updated.aiResult || updated, status: updated.status || prev.status }))
      const visionUsed = updated.ai_result?.visionUsed || false
      toast.success(visionUsed ? 'AI vision analysis completed! Image was analyzed.' : 'AI analysis completed!')
    } catch (err) { toast.error(err?.response?.data?.error || 'AI analysis failed') }
    finally { setAiLoading(false) }
  }

  const handlePrint = () => window.print()

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: `1px solid ${theme.border}`, background: theme.inputBg,
    color: theme.text, fontSize: '14px', outline: 'none',
  }

  const btn = (bg, color, borderColor) => ({
    padding: '10px 18px', borderRadius: '10px', border: `1px solid ${borderColor || 'transparent'}`,
    background: bg, color, fontSize: '13px', fontWeight: '600', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s',
  })

  const card = {
    borderRadius: '16px', background: theme.cardBg, border: `1px solid ${theme.border}`,
    padding: '28px', marginBottom: '24px',
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: theme.bg }}>
        <Header breadcrumbs={[{ label: feature.title, path: `/feature/${category}` }, { label: 'Loading...' }]} />
        <div style={{ textAlign: 'center', paddingTop: '80px' }}>
          <Loader2 size={36} color={theme.accent} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div style={{ minHeight: '100vh', background: theme.bg }}>
        <Header breadcrumbs={[{ label: feature.title, path: `/feature/${category}` }, { label: 'Not Found' }]} />
        <div style={{ textAlign: 'center', paddingTop: '80px', color: theme.textMuted }}><p>Analysis not found.</p></div>
      </div>
    )
  }

  const aiResult = analysis.ai_result || analysis.aiResult

  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      <Header breadcrumbs={[{ label: feature.title, path: `/feature/${category}` }, { label: analysis.title || 'Detail' }]} />
      <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
        {/* Top Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button style={{ width: '40px', height: '40px', borderRadius: '10px', border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => navigate(`/feature/${category}`)}><ArrowLeft size={18} /></button>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: theme.text }}>Analysis Details</h1>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <BookmarkButton analysisId={id} />
            <button style={btn('transparent', theme.textSecondary, theme.border)} onClick={() => setShareModalOpen(true)}>
              <Share2 size={14} /> Share
            </button>
            <button style={btn('transparent', theme.textSecondary, theme.border)} onClick={handlePrint}>
              <Printer size={14} /> Print
            </button>
            {editing ? (
              <>
                <button style={btn('transparent', theme.textSecondary, theme.border)}
                  onClick={() => { setEditing(false); setEditForm({ title: analysis.title || '', description: analysis.description || '', location: analysis.location || '', coordinates: analysis.coordinates || '', priority: analysis.priority || 'medium', status: analysis.status || 'pending', image_url: analysis.image_url || '' }) }}>
                  <X size={14} /> Cancel
                </button>
                <button style={btn('linear-gradient(135deg, #10b981, #059669)', '#fff', 'transparent')} onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <>
                <button style={btn('transparent', theme.textSecondary, theme.border)} onClick={() => setEditing(true)}>
                  <Edit3 size={14} /> Edit
                </button>
                <button style={btn('transparent', theme.textSecondary, theme.border)} onClick={() => setDeleteModalOpen(true)}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textSecondary }}>
                  <Trash2 size={14} /> Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* Image */}
        {(analysis.image_url || editing) && (
          <div style={card}>
            {editing ? (
              <ImageUpload currentImage={analysis.image_url} onUpload={(url) => setEditForm({ ...editForm, image_url: url })} />
            ) : analysis.image_url ? (
              <img src={analysis.image_url} alt={analysis.title} style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '12px' }} />
            ) : null}
          </div>
        )}

        {/* Analysis Info Card */}
        <div style={card}>
          {editing ? (
            <>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: theme.textMuted, marginBottom: '4px' }}>Title</label>
                <input style={inputStyle} value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: theme.textMuted, marginBottom: '4px' }}>Location</label>
                  <input style={inputStyle} value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: theme.textMuted, marginBottom: '4px' }}>Coordinates</label>
                  <input style={inputStyle} value={editForm.coordinates} onChange={(e) => setEditForm({ ...editForm, coordinates: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: theme.textMuted, marginBottom: '4px' }}>Priority</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}>
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: theme.textMuted, marginBottom: '4px' }}>Status</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                    <option value="pending">Pending</option><option value="in-progress">In Progress</option><option value="completed">Completed</option><option value="failed">Failed</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: theme.textMuted, marginBottom: '4px' }}>Description</label>
                <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
              </div>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: theme.text, marginBottom: '20px' }}>{analysis.title}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                {[
                  { icon: MapPin, label: 'Location', value: analysis.location || 'Not specified' },
                  { icon: MapPin, label: 'Coordinates', value: analysis.coordinates || 'Not specified' },
                  { icon: Tag, label: 'Status', value: analysis.status || 'pending', badge: statusColors },
                  { icon: AlertTriangle, label: 'Priority', value: analysis.priority || 'medium', badge: priorityColors },
                  { icon: Tag, label: 'Category', value: feature.title },
                  { icon: Calendar, label: 'Created', value: analysis.created_at ? new Date(analysis.created_at).toLocaleString() : '-' },
                ].map((info) => (
                  <div key={info.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.textMuted, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <info.icon size={12} /> {info.label}
                    </span>
                    {info.badge ? (
                      <span style={{ display: 'inline-flex', padding: '4px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', background: `${info.badge[info.value]}18`, color: info.badge[info.value], border: `1px solid ${info.badge[info.value]}40`, textTransform: 'capitalize', width: 'fit-content' }}>{info.value}</span>
                    ) : (
                      <span style={{ fontSize: '15px', color: theme.text }}>{info.value}</span>
                    )}
                  </div>
                ))}
              </div>
              {analysis.description && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: `1px solid ${theme.border}` }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: theme.textMuted, marginBottom: '8px' }}>Description</div>
                  <p style={{ fontSize: '15px', lineHeight: '1.7', color: theme.textSecondary }}>{analysis.description}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Tags */}
        <div style={card}>
          <TagsInput analysisId={id} />
        </div>

        {/* AI Results */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: theme.text, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Brain size={22} color="#8b5cf6" /> AI Analysis Results
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {analysis.image_url && (
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', fontWeight: '600' }}>
                  Vision Ready
                </span>
              )}
              {aiResult?.visionUsed && (
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)', fontWeight: '600' }}>
                  Image Analyzed
                </span>
              )}
              <button style={{
                ...btn(aiLoading ? 'rgba(139,92,246,0.2)' : 'linear-gradient(135deg, #8b5cf6, #6d28d9)', '#fff', 'transparent'),
                cursor: aiLoading ? 'not-allowed' : 'pointer',
                boxShadow: aiLoading ? 'none' : '0 4px 15px rgba(139,92,246,0.3)',
              }} onClick={handleRunAI} disabled={aiLoading}>
                {aiLoading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing image...</> : <><Brain size={14} /> {aiResult ? 'Re-run Vision Analysis' : 'Run Vision AI Analysis'}</>}
              </button>
            </div>
          </div>
          {aiLoading && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: theme.textMuted }}>
              <Loader2 size={40} color="#8b5cf6" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px', display: 'block' }} />
              <p style={{ fontSize: '16px', color: theme.textSecondary }}>AI is processing...</p>
            </div>
          )}
          {!aiLoading && aiResult && <AIResultDisplay result={aiResult} />}
          {!aiLoading && !aiResult && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: theme.textDim }}>
              <Brain size={48} style={{ marginBottom: '12px', display: 'block', margin: '0 auto 12px' }} />
              <p style={{ fontSize: '15px', color: theme.textMuted }}>No AI analysis results yet.</p>
            </div>
          )}
        </div>

        {/* Notes */}
        <div style={card}>
          <NotesPanel analysisId={id} />
        </div>
      </div>

      {/* Delete Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Analysis"
        actions={<>
          <button style={btn('transparent', theme.textSecondary, theme.border)} onClick={() => setDeleteModalOpen(false)}>Cancel</button>
          <button style={{ ...btn('linear-gradient(135deg, #ef4444, #dc2626)', '#fff', 'transparent'), cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1 }}
            onClick={handleDelete} disabled={deleting}>
            {deleting ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={14} />}
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </>}>
        <p style={{ color: theme.textSecondary, lineHeight: '1.7' }}>
          Are you sure you want to delete <strong>"{analysis?.title}"</strong>? This action cannot be undone.
        </p>
      </Modal>

      {/* Share Modal */}
      <ShareModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} analysisId={id} />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media print {
          header, button, .no-print { display: none !important; }
          body { background: #fff !important; color: #000 !important; }
        }
      `}</style>
    </div>
  )
}
