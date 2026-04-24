import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Satellite, Mail, Lock, User, Loader2 } from 'lucide-react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (isAuthenticated) {
    navigate('/', { replace: true })
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email || !password) {
      toast.error('Please fill in all fields')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/register', { name, email, password })
      toast.success('Account created! Please log in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
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
      position: 'absolute', top: '-20%', right: '-10%', width: '600px', height: '600px',
      borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', pointerEvents: 'none',
    },
    bgOrb2: {
      position: 'absolute', bottom: '-20%', left: '-10%', width: '500px', height: '500px',
      borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', pointerEvents: 'none',
    },
    card: {
      width: '100%', maxWidth: '440px', padding: '48px 40px', borderRadius: '24px',
      background: 'rgba(26, 26, 46, 0.8)', backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 25px 50px rgba(0,0,0,0.5)', position: 'relative', zIndex: 1,
    },
    logoRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' },
    title: {
      fontSize: '22px', fontWeight: '700', textAlign: 'center',
      background: 'linear-gradient(135deg, #e2e8f0, #3b82f6)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    },
    subtitle: { textAlign: 'center', color: '#64748b', fontSize: '14px', marginTop: '8px', marginBottom: '36px' },
    inputGroup: { position: 'relative', marginBottom: '20px' },
    inputIcon: { position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' },
    input: {
      width: '100%', padding: '14px 16px 14px 48px', borderRadius: '12px',
      border: '1px solid #2a2a4a', background: 'rgba(15, 15, 30, 0.6)',
      color: '#e2e8f0', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    button: {
      width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
      background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff',
      fontSize: '15px', fontWeight: '600', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      boxShadow: '0 4px 15px rgba(16,185,129,0.3)', marginTop: '8px',
    },
    link: { textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748b' },
    linkAnchor: { color: '#3b82f6', textDecoration: 'none', fontWeight: '600' },
  }

  return (
    <div style={styles.container}>
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <Satellite size={36} style={{ color: '#3b82f6', filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.4))' }} />
        </div>
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>Join the geospatial intelligence platform</p>

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <User size={18} style={styles.inputIcon} />
            <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} style={styles.input}
              onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)' }}
              onBlur={(e) => { e.target.style.borderColor = '#2a2a4a'; e.target.style.boxShadow = 'none' }} />
          </div>
          <div style={styles.inputGroup}>
            <Mail size={18} style={styles.inputIcon} />
            <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input}
              onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)' }}
              onBlur={(e) => { e.target.style.borderColor = '#2a2a4a'; e.target.style.boxShadow = 'none' }} />
          </div>
          <div style={styles.inputGroup}>
            <Lock size={18} style={styles.inputIcon} />
            <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input}
              onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)' }}
              onBlur={(e) => { e.target.style.borderColor = '#2a2a4a'; e.target.style.boxShadow = 'none' }} />
          </div>
          <div style={styles.inputGroup}>
            <Lock size={18} style={styles.inputIcon} />
            <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={styles.input}
              onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)' }}
              onBlur={(e) => { e.target.style.borderColor = '#2a2a4a'; e.target.style.boxShadow = 'none' }} />
          </div>
          <button type="submit" disabled={loading} style={{ ...styles.button, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : null}
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.link}>
          Already have an account?{' '}
          <Link to="/login" style={styles.linkAnchor}>Sign in</Link>
        </p>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
