import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function Pagination({ page, totalPages, onPageChange }) {
  const { theme } = useTheme()
  if (totalPages <= 1) return null

  const pages = []
  const maxVisible = 5
  let start = Math.max(1, page - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages, start + maxVisible - 1)
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1)

  for (let i = start; i <= end; i++) pages.push(i)

  const btnStyle = (active) => ({
    width: '36px', height: '36px', borderRadius: '8px',
    border: `1px solid ${active ? theme.accent : theme.border}`,
    background: active ? theme.accent : 'transparent',
    color: active ? '#fff' : theme.textSecondary,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '14px', fontWeight: active ? '700' : '400',
    transition: 'all 0.15s',
  })

  const navBtn = (disabled) => ({
    ...btnStyle(false),
    opacity: disabled ? 0.4 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '24px' }}>
      <button onClick={() => onPageChange(1)} disabled={page === 1} style={navBtn(page === 1)}>
        <ChevronsLeft size={16} />
      </button>
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1} style={navBtn(page === 1)}>
        <ChevronLeft size={16} />
      </button>

      {start > 1 && <span style={{ color: theme.textDim, padding: '0 4px' }}>...</span>}

      {pages.map((p) => (
        <button key={p} onClick={() => onPageChange(p)} style={btnStyle(p === page)}>{p}</button>
      ))}

      {end < totalPages && <span style={{ color: theme.textDim, padding: '0 4px' }}>...</span>}

      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} style={navBtn(page === totalPages)}>
        <ChevronRight size={16} />
      </button>
      <button onClick={() => onPageChange(totalPages)} disabled={page === totalPages} style={navBtn(page === totalPages)}>
        <ChevronsRight size={16} />
      </button>

      <span style={{ marginLeft: '12px', fontSize: '13px', color: theme.textMuted }}>
        Page {page} of {totalPages}
      </span>
    </div>
  )
}
