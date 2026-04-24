import { useState, useEffect } from 'react'
import { Tag, Plus, X } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import api from '../api/client'
import toast from 'react-hot-toast'

const TAG_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export default function TagsInput({ analysisId }) {
  const { theme } = useTheme()
  const [tags, setTags] = useState([])
  const [allTags, setAllTags] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [newTagName, setNewTagName] = useState('')

  const fetchTags = () => {
    api.get(`/tags/analysis/${analysisId}`).then((res) => setTags(res.data.tags || [])).catch(() => {})
    api.get('/tags').then((res) => setAllTags(res.data.tags || [])).catch(() => {})
  }

  useEffect(() => { fetchTags() }, [analysisId])

  const addTag = async (tagId) => {
    try {
      await api.post(`/tags/analysis/${analysisId}/${tagId}`)
      fetchTags()
      toast.success('Tag added')
    } catch {
      toast.error('Failed to add tag')
    }
  }

  const removeTag = async (tagId) => {
    try {
      await api.delete(`/tags/analysis/${analysisId}/${tagId}`)
      setTags(tags.filter(t => t.id !== tagId))
      toast.success('Tag removed')
    } catch {
      toast.error('Failed to remove tag')
    }
  }

  const createAndAddTag = async () => {
    if (!newTagName.trim()) return
    try {
      const color = TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)]
      const res = await api.post('/tags', { name: newTagName.trim(), color })
      const tag = res.data.tag
      await api.post(`/tags/analysis/${analysisId}/${tag.id}`)
      fetchTags()
      setNewTagName('')
      setShowAdd(false)
      toast.success('Tag created and added')
    } catch {
      toast.error('Failed to create tag')
    }
  }

  const availableTags = allTags.filter(t => !tags.some(at => at.id === t.id))

  return (
    <div>
      <h4 style={{ fontSize: '14px', fontWeight: '600', color: theme.text, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Tag size={14} /> Tags
      </h4>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
        {tags.map((t) => (
          <span key={t.id} style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
            background: `${t.color}18`, color: t.color, border: `1px solid ${t.color}40`,
          }}>
            {t.name}
            <button onClick={() => removeTag(t.id)} style={{
              background: 'transparent', border: 'none', color: t.color,
              cursor: 'pointer', padding: 0, display: 'flex',
            }}><X size={12} /></button>
          </span>
        ))}

        <button onClick={() => setShowAdd(!showAdd)} style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
          background: 'transparent', color: theme.textMuted, border: `1px dashed ${theme.border}`,
          cursor: 'pointer',
        }}>
          <Plus size={12} /> Add Tag
        </button>
      </div>

      {showAdd && (
        <div style={{
          padding: '12px', borderRadius: '10px', border: `1px solid ${theme.border}`,
          background: theme.bgTertiary,
        }}>
          {availableTags.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '6px' }}>Existing tags:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {availableTags.map((t) => (
                  <button key={t.id} onClick={() => addTag(t.id)} style={{
                    padding: '3px 10px', borderRadius: '16px', fontSize: '12px',
                    background: `${t.color}10`, color: t.color, border: `1px solid ${t.color}30`,
                    cursor: 'pointer',
                  }}>{t.name}</button>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="New tag name..."
              style={{
                flex: 1, padding: '8px 12px', borderRadius: '8px',
                border: `1px solid ${theme.border}`, background: theme.inputBg,
                color: theme.text, fontSize: '13px', outline: 'none',
              }}
              onKeyDown={(e) => e.key === 'Enter' && createAndAddTag()}
            />
            <button onClick={createAndAddTag} style={{
              padding: '8px 14px', borderRadius: '8px', border: 'none',
              background: theme.accent, color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
            }}>Add</button>
          </div>
        </div>
      )}
    </div>
  )
}
