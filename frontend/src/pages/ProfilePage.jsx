import { useState, useEffect } from 'react'
import { User, Mail, Shield, Calendar, Save, Lock, Loader2, Camera } from 'lucide-react'
import Header from '../components/Header'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import api from '../api/client'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { theme } = useTheme()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', bio: '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    api.get('/profile')
      .then((res) => {
        setProfile(res.data.user)
        setForm({ name: res.data.user.name || '', bio: res.data.user.bio || '' })
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await api.put('/profile', form)
      setProfile(res.data.user)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Please fill in all password fields')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    setChangingPassword(true)
    try {
      await api.put('/profile/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      toast.success('Password changed successfully!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: '10px',
    border: `1px solid ${theme.border}`, background: theme.inputBg,
    color: theme.text, fontSize: '14px', outline: 'none',
  }

  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '6px' }

  const sectionStyle = {
    borderRadius: '16px', background: theme.cardBg, border: `1px solid ${theme.border}`,
    padding: '28px', marginBottom: '24px',
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      <Header breadcrumbs={[{ label: 'Profile' }]} />
      <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: theme.text, marginBottom: '24px' }}>My Profile</h1>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <Loader2 size={32} color={theme.accent} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <>
            {/* Profile Info */}
            <div style={sectionStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '32px', fontWeight: '700', color: '#fff',
                }}>
                  {(profile?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', color: theme.text }}>{profile?.name}</h2>
                  <p style={{ fontSize: '14px', color: theme.textMuted, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} /> {profile?.email}
                  </p>
                  <p style={{ fontSize: '13px', color: theme.textMuted, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <Shield size={14} /> {profile?.role} &bull; <Calendar size={14} /> Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Display Name</label>
                <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Bio</label>
                <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell us about yourself..." />
              </div>
              <button onClick={handleSave} disabled={saving} style={{
                padding: '10px 24px', borderRadius: '10px', border: 'none',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff',
                fontSize: '14px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px', opacity: saving ? 0.7 : 1,
              }}>
                {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            {/* Change Password */}
            <div style={sectionStyle}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: theme.text, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={18} /> Change Password
              </h3>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Current Password</label>
                <input type="password" style={inputStyle} value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>New Password</label>
                  <input type="password" style={inputStyle} value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Confirm New Password</label>
                  <input type="password" style={inputStyle} value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
                </div>
              </div>
              <button onClick={handleChangePassword} disabled={changingPassword} style={{
                padding: '10px 24px', borderRadius: '10px', border: 'none',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff',
                fontSize: '14px', fontWeight: '600', cursor: changingPassword ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px', opacity: changingPassword ? 0.7 : 1,
              }}>
                {changingPassword ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Lock size={14} />}
                {changingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </div>

            {/* Account Stats */}
            <div style={sectionStyle}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: theme.text, marginBottom: '16px' }}>Account Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                {[
                  { label: 'Email', value: profile?.email },
                  { label: 'Role', value: profile?.role },
                  { label: 'Member Since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '-' },
                  { label: 'Last Updated', value: profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : '-' },
                ].map((item) => (
                  <div key={item.label} style={{ padding: '16px', borderRadius: '12px', background: theme.bgTertiary, border: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: '12px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{item.label}</div>
                    <div style={{ fontSize: '15px', color: theme.text, fontWeight: '500' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
