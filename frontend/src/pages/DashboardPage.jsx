import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Satellite, Map, GitCompare, Leaf, Building2, CloudSun, Shield,
  Droplets, TreePine, AlertTriangle, Landmark, Wind, Mountain,
  Users, Gem, BarChart3, CheckCircle2, Loader2, AlertOctagon,
  Clock, TrendingUp,
} from 'lucide-react'
import Header from '../components/Header'
import DashboardCharts from '../components/DashboardCharts'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts'

const features = [
  { key: 'satellite-image-analysis', title: 'Satellite Image Analysis', desc: 'AI-powered satellite image interpretation', icon: Satellite, gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
  { key: 'land-use-classification', title: 'Land Use Classification', desc: 'Automated land cover mapping', icon: Map, gradient: 'linear-gradient(135deg, #10b981, #047857)' },
  { key: 'change-detection', title: 'Change Detection', desc: 'Temporal change analysis', icon: GitCompare, gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' },
  { key: 'crop-health-monitoring', title: 'Crop Health Monitoring', desc: 'NDVI & crop vitality assessment', icon: Leaf, gradient: 'linear-gradient(135deg, #22c55e, #15803d)' },
  { key: 'urban-planning', title: 'Urban Planning', desc: 'Urban growth & development analysis', icon: Building2, gradient: 'linear-gradient(135deg, #6366f1, #4338ca)' },
  { key: 'climate-impact', title: 'Climate Impact', desc: 'Climate change effect assessment', icon: CloudSun, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  { key: 'defense-security', title: 'Defense & Security', desc: 'Security surveillance analysis', icon: Shield, gradient: 'linear-gradient(135deg, #ef4444, #b91c1c)' },
  { key: 'water-body-analysis', title: 'Water Body Analysis', desc: 'Water resource monitoring', icon: Droplets, gradient: 'linear-gradient(135deg, #06b6d4, #0e7490)' },
  { key: 'vegetation-index', title: 'Vegetation Index', desc: 'Forest & vegetation health', icon: TreePine, gradient: 'linear-gradient(135deg, #84cc16, #4d7c0f)' },
  { key: 'disaster-assessment', title: 'Disaster Assessment', desc: 'Natural disaster damage evaluation', icon: AlertTriangle, gradient: 'linear-gradient(135deg, #f97316, #c2410c)' },
  { key: 'infrastructure-detection', title: 'Infrastructure Detection', desc: 'Roads & buildings identification', icon: Landmark, gradient: 'linear-gradient(135deg, #a855f7, #7e22ce)' },
  { key: 'air-quality', title: 'Air Quality Analysis', desc: 'Atmospheric condition monitoring', icon: Wind, gradient: 'linear-gradient(135deg, #14b8a6, #0f766e)' },
  { key: 'terrain-analysis', title: 'Terrain Analysis', desc: 'Topographic & elevation study', icon: Mountain, gradient: 'linear-gradient(135deg, #78716c, #44403c)' },
  { key: 'population-density', title: 'Population Density', desc: 'Population distribution estimation', icon: Users, gradient: 'linear-gradient(135deg, #ec4899, #be185d)' },
  { key: 'mining-resource-detection', title: 'Mining & Resource Detection', desc: 'Mineral resource identification', icon: Gem, gradient: 'linear-gradient(135deg, #e11d48, #9f1239)' },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { user } = useAuth()
  const [analyses, setAnalyses] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useKeyboardShortcuts([
    { key: 'p', ctrl: false, action: () => navigate('/profile') },
    { key: 's', ctrl: false, action: () => navigate('/settings') },
    { key: 'm', ctrl: false, action: () => navigate('/map') },
  ])

  useEffect(() => {
    Promise.all([
      api.get('/analyses', { params: { limit: 500 } }),
      api.get('/dashboard/stats'),
    ])
      .then(([analysesRes, statsRes]) => {
        setAnalyses(analysesRes.data.analyses || [])
        setStats(statsRes.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalCount = analyses.length
  const completedCount = analyses.filter((a) => a.status === 'completed').length
  const inProgressCount = analyses.filter((a) => a.status === 'in-progress').length
  const criticalCount = analyses.filter((a) => a.priority === 'critical').length

  const getCategoryCount = (key) => analyses.filter((a) => a.category === key).length

  const statCards = [
    { label: 'Total Analyses', value: totalCount, icon: BarChart3, color: '#3b82f6' },
    { label: 'Completed', value: completedCount, icon: CheckCircle2, color: '#10b981' },
    { label: 'In Progress', value: inProgressCount, icon: Loader2, color: '#f59e0b' },
    { label: 'Critical Priority', value: criticalCount, icon: AlertOctagon, color: '#ef4444' },
  ]

  // Recent analyses
  const recentAnalyses = analyses.slice(0, 5)

  const timeAgo = (date) => {
    const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (s < 60) return 'just now'
    if (s < 3600) return `${Math.floor(s / 60)}m ago`
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`
    return `${Math.floor(s / 86400)}d ago`
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      <Header />
      <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: theme.text, marginBottom: '4px' }}>
          Welcome back, {user?.name || 'Analyst'}
        </h1>
        <p style={{ fontSize: '15px', color: theme.textMuted, marginBottom: '32px' }}>
          Monitor and manage your satellite imagery analyses across all categories
        </p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {statCards.map((s) => (
            <div key={s.label} style={{
              padding: '24px', borderRadius: '16px', background: theme.cardBg,
              border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: '16px',
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px', background: `${s.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <s.icon size={22} color={s.color} />
              </div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: theme.text }}>{loading ? '-' : s.value}</div>
                <div style={{ fontSize: '13px', color: theme.textMuted }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        {!loading && stats && <DashboardCharts stats={stats} />}

        {/* Recent Activity + Feature Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
          {/* Feature Grid */}
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: theme.text, marginBottom: '20px' }}>
              Analysis Features
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {features.map((f) => (
                <div
                  key={f.key}
                  style={{
                    borderRadius: '16px', background: theme.cardBg,
                    border: `1px solid ${theme.border}`, overflow: 'hidden',
                    cursor: 'pointer', transition: 'all 0.25s',
                  }}
                  onClick={() => navigate(`/feature/${f.key}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.borderColor = theme.accent
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.borderColor = theme.border
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div style={{ height: '6px', background: f.gradient }} />
                  <div style={{ padding: '20px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px', background: f.gradient,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    }}>
                      <f.icon size={20} color="#fff" />
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: theme.text, marginBottom: '3px' }}>{f.title}</div>
                      <div style={{ fontSize: '13px', color: theme.textMuted, lineHeight: '1.5', marginBottom: '6px' }}>{f.desc}</div>
                      <div style={{ fontSize: '12px', color: theme.accent, fontWeight: '600' }}>
                        {loading ? '...' : `${getCategoryCount(f.key)} analyses`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Sidebar */}
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: theme.text, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} /> Recent
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: theme.textMuted }}>
                  <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                </div>
              ) : recentAnalyses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: theme.textMuted, fontSize: '14px' }}>
                  No analyses yet
                </div>
              ) : (
                recentAnalyses.map((a) => {
                  const statusColor = { pending: '#eab308', completed: '#10b981', 'in-progress': '#3b82f6', failed: '#ef4444' }
                  return (
                    <div key={a.id} onClick={() => navigate(`/feature/${a.category}/${a.id}`)} style={{
                      padding: '14px 16px', borderRadius: '12px', background: theme.cardBg,
                      border: `1px solid ${theme.border}`, cursor: 'pointer', transition: 'all 0.15s',
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{a.title}</span>
                        <span style={{
                          width: '8px', height: '8px', borderRadius: '50%',
                          background: statusColor[a.status] || '#94a3b8',
                        }} />
                      </div>
                      <div style={{ fontSize: '12px', color: theme.textDim }}>
                        {a.category?.replace(/-/g, ' ')} &bull; {a.created_at ? timeAgo(a.created_at) : '-'}
                      </div>
                    </div>
                  )
                })
              )}

              {/* Quick Stats */}
              {!loading && (
                <div style={{
                  padding: '16px', borderRadius: '12px', background: theme.cardBg,
                  border: `1px solid ${theme.border}`, marginTop: '8px',
                }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: theme.text, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <TrendingUp size={14} /> Quick Stats
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { label: 'Success Rate', value: totalCount > 0 ? `${((completedCount / totalCount) * 100).toFixed(0)}%` : 'N/A' },
                      { label: 'Categories Used', value: `${new Set(analyses.map(a => a.category)).size} / 15` },
                      { label: 'With Locations', value: `${analyses.filter(a => a.location).length}` },
                    ].map((s) => (
                      <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ color: theme.textMuted }}>{s.label}</span>
                        <span style={{ color: theme.text, fontWeight: '600' }}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
