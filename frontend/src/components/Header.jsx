import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Satellite, LogOut, User, MapPin, Bookmark, Activity, GitCompare,
  FileText, Settings, ChevronDown, TrendingUp, LayoutGrid, Layers,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import NotificationBell from './NotificationBell'
import ThemeToggle from './ThemeToggle'

const navItems = [
  { path: '/map', label: 'Map', icon: MapPin },
  { path: '/compare', label: 'Compare', icon: GitCompare },
  { path: '/change-detection', label: 'Changes', icon: TrendingUp },
  { path: '/timeline', label: 'Timeline', icon: TrendingUp },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { path: '/activity', label: 'Activity', icon: Activity },
  { path: '/custom-views', label: 'Imagery Views', icon: LayoutGrid },
]

const gapNavItems = [
  { path: '/gap-no-changedetection-beforeafter', label: 'Change Detection (Before/After)' },
  { path: '/gap-no-objectdetection-buildings-roads-vehicles', label: 'Object Detection' },
  { path: '/gap-no-vegetationindex-ndvi-crop-health', label: 'Vegetation Index (NDVI)' },
  { path: '/gap-no-cloudremoval', label: 'Cloud Removal' },
  { path: '/gap-no-temporalanalysis-multidate-trends', label: 'Temporal Analysis' },
  { path: '/gap-no-areacalculation-measure-features', label: 'Area Calculation' },
  { path: '/gap-no-segmentationclassification-models', label: 'Segmentation / Classification' },
  { path: '/gap-no-map-integration-leafletmapbox-backend-lay', label: 'Map Integration' },
  { path: '/gap-no-geospatial-export-geotiff-shapefiles', label: 'Geospatial Export' },
  { path: '/gap-no-layer-managementoverlay-system', label: 'Layer Management' },
  { path: '/gap-no-roi-drawingmeasurement-persistence', label: 'ROI Drawing & Persistence' },
  { path: '/gap-no-imagery-provider-api-planet-maxar-sentine', label: 'Imagery Provider API' },
  { path: '/gap-no-webhook-delivery-for-completed-batch-jobs', label: 'Webhook Delivery' },
]

export default function Header({ breadcrumbs = [] }) {
  const { user, logout } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [gapMenuOpen, setGapMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const gapMenuRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
      if (gapMenuRef.current && !gapMenuRef.current.contains(e.target)) setGapMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 24px', background: theme.headerBg, backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${theme.border}`, position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <Satellite size={22} style={{ color: theme.accent, filter: `drop-shadow(0 0 6px ${theme.accent}50)` }} />
          <span style={{
            fontSize: '16px', fontWeight: '700',
            background: `linear-gradient(135deg, ${theme.text}, ${theme.accent})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>ASIA</span>
        </div>

        {/* Nav Links */}
        <nav style={{ display: 'flex', gap: '2px' }}>
          {navItems.map((item) => {
            const active = location.pathname === item.path
            return (
              <button key={item.path} onClick={() => navigate(item.path)} style={{
                padding: '6px 12px', borderRadius: '8px', border: 'none',
                background: active ? `${theme.accent}15` : 'transparent',
                color: active ? theme.accent : theme.textSecondary,
                fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.15s',
              }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = theme.text }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = theme.textSecondary }}
              >
                <item.icon size={14} />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Gap Features Dropdown */}
        <div ref={gapMenuRef} style={{ position: 'relative' }}>
          <button onClick={() => setGapMenuOpen(!gapMenuOpen)} style={{
            padding: '6px 12px', borderRadius: '8px', border: 'none',
            background: gapMenuOpen ? `${theme.accent}15` : 'transparent',
            color: gapMenuOpen ? theme.accent : theme.textSecondary,
            fontSize: '13px', fontWeight: '500', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.15s',
          }}
            onMouseEnter={(e) => { if (!gapMenuOpen) e.currentTarget.style.color = theme.text }}
            onMouseLeave={(e) => { if (!gapMenuOpen) e.currentTarget.style.color = theme.textSecondary }}
          >
            <Layers size={14} />
            Gap Features
            <ChevronDown size={12} style={{ transform: gapMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          {gapMenuOpen && (
            <div style={{
              position: 'absolute', top: '38px', left: 0, width: '260px',
              borderRadius: '12px', background: theme.bgSecondary, border: `1px solid ${theme.border}`,
              boxShadow: '0 12px 32px rgba(0,0,0,0.3)', zIndex: 200, overflow: 'hidden',
            }}>
              {gapNavItems.map((item) => (
                <button key={item.path} onClick={() => { navigate(item.path); setGapMenuOpen(false) }} style={{
                  width: '100%', padding: '9px 16px', border: 'none', background: 'transparent',
                  color: location.pathname === item.path ? theme.accent : theme.textSecondary,
                  fontSize: '12px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = `${theme.accent}10`}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <Layers size={12} /> {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: theme.textMuted }}>
            <span style={{ color: theme.textDim }}>|</span>
            <span style={{ color: theme.textSecondary, cursor: 'pointer' }} onClick={() => navigate('/')}
              onMouseEnter={(e) => e.target.style.color = theme.text} onMouseLeave={(e) => e.target.style.color = theme.textSecondary}>
              Dashboard
            </span>
            {breadcrumbs.map((bc, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: theme.textDim }}>/</span>
                {i === breadcrumbs.length - 1 ? (
                  <span style={{ color: theme.text }}>{bc.label}</span>
                ) : (
                  <span style={{ color: theme.textSecondary, cursor: 'pointer' }}
                    onClick={() => bc.path && navigate(bc.path)}
                    onMouseEnter={(e) => e.target.style.color = theme.text}
                    onMouseLeave={(e) => e.target.style.color = theme.textSecondary}>
                    {bc.label}
                  </span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ThemeToggle />
        <NotificationBell />

        {/* User Menu */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px',
            borderRadius: '8px', border: `1px solid ${theme.border}`, background: 'transparent',
            color: theme.textSecondary, cursor: 'pointer', transition: 'all 0.15s',
          }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <User size={14} color="#fff" />
            </div>
            <span style={{ fontSize: '13px', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'User'}
            </span>
            <ChevronDown size={14} style={{ transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {menuOpen && (
            <div style={{
              position: 'absolute', top: '44px', right: 0, width: '200px',
              borderRadius: '12px', background: theme.bgSecondary, border: `1px solid ${theme.border}`,
              boxShadow: '0 12px 32px rgba(0,0,0,0.3)', zIndex: 200, overflow: 'hidden',
            }}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}` }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: theme.text }}>{user?.name}</div>
                <div style={{ fontSize: '12px', color: theme.textMuted }}>{user?.email}</div>
              </div>
              {[
                { label: 'Profile', icon: User, path: '/profile' },
                { label: 'Settings', icon: Settings, path: '/settings' },
                { label: 'Bookmarks', icon: Bookmark, path: '/bookmarks' },
              ].map((item) => (
                <button key={item.path} onClick={() => { navigate(item.path); setMenuOpen(false) }} style={{
                  width: '100%', padding: '10px 16px', border: 'none', background: 'transparent',
                  color: theme.textSecondary, fontSize: '13px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = `${theme.accent}08`}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <item.icon size={14} /> {item.label}
                </button>
              ))}
              <div style={{ borderTop: `1px solid ${theme.border}` }}>
                <button onClick={handleLogout} style={{
                  width: '100%', padding: '10px 16px', border: 'none', background: 'transparent',
                  color: '#ef4444', fontSize: '13px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
