import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { mode, theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
      style={{
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        border: `1px solid ${theme.border}`,
        background: 'transparent',
        color: theme.textSecondary,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#f59e0b'
        e.currentTarget.style.color = '#f59e0b'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = theme.border
        e.currentTarget.style.color = theme.textSecondary
      }}
    >
      {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
