import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Satellite, Mail, Lock, Loader2, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (isAuthenticated) {
    navigate('/', { replace: true })
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setEmail('admin@satellite.ai')
    setPassword('admin123')
    setLoading(true)
    try {
      await login('admin@satellite.ai', 'admin123')
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Demo login failed.')
    } finally {
      setLoading(false)
    }
  }

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 30%, #0a1628 60%, #0a0a1a 100%)',
      position: 'relative',
      overflow: 'hidden',
    },
    bgOrb1: {
      position: 'absolute',
      top: '-20%',
      right: '-10%',
      width: '600px',
      height: '600px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
      pointerEvents: 'none',
    },
    bgOrb2: {
      position: 'absolute',
      bottom: '-20%',
      left: '-10%',
      width: '500px',
      height: '500px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
      pointerEvents: 'none',
    },
    card: {
      width: '100%',
      maxWidth: '440px',
      padding: '48px 40px',
      borderRadius: '24px',
      background: 'rgba(26, 26, 46, 0.8)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 100px rgba(59,130,246,0.05)',
      position: 'relative',
      zIndex: 1,
    },
    logoRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      marginBottom: '8px',
    },
    logoIcon: {
      color: '#3b82f6',
      filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.4))',
    },
    title: {
      fontSize: '22px',
      fontWeight: '700',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #e2e8f0, #3b82f6)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    subtitle: {
      textAlign: 'center',
      color: '#64748b',
      fontSize: '14px',
      marginTop: '8px',
      marginBottom: '36px',
    },
    inputGroup: {
      position: 'relative',
      marginBottom: '20px',
    },
    inputIcon: {
      position: 'absolute',
      left: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#475569',
      pointerEvents: 'none',
    },
    input: {
      width: '100%',
      padding: '14px 16px 14px 48px',
      borderRadius: '12px',
      border: '1px solid #2a2a4a',
      background: 'rgba(15, 15, 30, 0.6)',
      color: '#e2e8f0',
      fontSize: '15px',
      outline: 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    button: {
      width: '100%',
      padding: '14px',
      borderRadius: '12px',
      border: 'none',
      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      color: '#fff',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'transform 0.15s, box-shadow 0.15s',
      boxShadow: '0 4px 15px rgba(59,130,246,0.3)',
      marginTop: '8px',
    },
    demoButton: {
      width: '100%',
      padding: '14px',
      borderRadius: '12px',
      border: '1px solid #2a2a4a',
      background: 'rgba(139,92,246,0.1)',
      color: '#a78bfa',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'transform 0.15s, background 0.2s',
      marginTop: '12px',
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      margin: '24px 0 16px',
      color: '#475569',
      fontSize: '13px',
    },
    dividerLine: {
      flex: 1,
      height: '1px',
      background: '#2a2a4a',
    },
  }

  return (
    <div style={styles.container}>
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <Satellite size={36} style={styles.logoIcon} />
        </div>
        <h1 style={styles.title}>AI Satellite Imagery Analyzer</h1>
        <p style={styles.subtitle}>Sign in to access your geospatial intelligence platform</p>

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <Mail size={18} style={styles.inputIcon} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6'
                e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#2a2a4a'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>
          <div style={styles.inputGroup}>
            <Lock size={18} style={styles.inputIcon} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6'
                e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#2a2a4a'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
            }}
          >
            {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : null}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span>or</span>
          <div style={styles.dividerLine} />
        </div>

        <button
          onClick={handleDemoLogin}
          disabled={loading}
          style={{
            ...styles.demoButton,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.background = 'rgba(139,92,246,0.2)'
              e.target.style.transform = 'translateY(-1px)'
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(139,92,246,0.1)'
            e.target.style.transform = 'translateY(0)'
          }}
        >
          <Zap size={18} />
          Demo Login
        </button>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748b' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '600' }}>Create one</Link>
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
