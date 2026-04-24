import { useState, useEffect } from 'react'
import { Share2, Copy, Link, Trash2, Loader2 } from 'lucide-react'
import Modal from './Modal'
import { useTheme } from '../context/ThemeContext'
import api from '../api/client'
import toast from 'react-hot-toast'

export default function ShareModal({ isOpen, onClose, analysisId }) {
  const { theme } = useTheme()
  const [shares, setShares] = useState([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [expiresInDays, setExpiresInDays] = useState(7)

  useEffect(() => {
    if (isOpen && analysisId) {
      setLoading(true)
      api.get(`/share/${analysisId}`)
        .then((res) => setShares(res.data.shares || []))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [isOpen, analysisId])

  const createLink = async () => {
    setCreating(true)
    try {
      const res = await api.post(`/share/${analysisId}`, { expiresInDays: expiresInDays || null })
      setShares([res.data.share, ...shares])
      toast.success('Share link created!')
    } catch {
      toast.error('Failed to create share link')
    } finally {
      setCreating(false)
    }
  }

  const deleteLink = async (id) => {
    try {
      await api.delete(`/share/link/${id}`)
      setShares(shares.filter((s) => s.id !== id))
      toast.success('Share link deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const copyLink = (token) => {
    const url = `${window.location.origin}/shared/${token}`
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard!')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Analysis">
      <div>
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '16px' }}>
            Create a shareable link for this analysis. Anyone with the link can view it.
          </p>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '4px' }}>Expires in</label>
              <select value={expiresInDays} onChange={(e) => setExpiresInDays(parseInt(e.target.value))} style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px',
                border: `1px solid ${theme.border}`, background: theme.inputBg,
                color: theme.text, fontSize: '14px', outline: 'none',
              }}>
                <option value={1}>1 day</option>
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={0}>Never</option>
              </select>
            </div>
            <button onClick={createLink} disabled={creating} style={{
              padding: '10px 20px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff',
              fontSize: '14px', fontWeight: '600', cursor: creating ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              {creating ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Link size={14} />}
              Create Link
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: theme.textMuted }}>Loading...</div>
        ) : shares.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: theme.textMuted, fontSize: '14px' }}>
            No share links yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: theme.textMuted, marginBottom: '4px' }}>Active Links</div>
            {shares.map((s) => {
              const expired = s.expires_at && new Date(s.expires_at) < new Date()
              return (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', borderRadius: '10px',
                  background: theme.bgTertiary, border: `1px solid ${theme.border}`,
                  opacity: expired ? 0.5 : 1,
                }}>
                  <Link size={14} color={theme.textMuted} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', color: theme.text, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.share_token.substring(0, 20)}...
                    </div>
                    <div style={{ fontSize: '11px', color: theme.textDim }}>
                      {expired ? 'Expired' : s.expires_at ? `Expires ${new Date(s.expires_at).toLocaleDateString()}` : 'No expiry'}
                    </div>
                  </div>
                  <button onClick={() => copyLink(s.share_token)} style={{
                    padding: '6px 10px', borderRadius: '6px', border: `1px solid ${theme.border}`,
                    background: 'transparent', color: theme.textSecondary, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px',
                  }}><Copy size={12} /> Copy</button>
                  <button onClick={() => deleteLink(s.id)} style={{
                    padding: '6px', borderRadius: '6px', border: 'none',
                    background: 'transparent', color: theme.textDim, cursor: 'pointer',
                  }}><Trash2 size={14} /></button>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </Modal>
  )
}
