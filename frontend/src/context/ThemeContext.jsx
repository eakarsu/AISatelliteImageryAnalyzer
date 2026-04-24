import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

const themes = {
  dark: {
    bg: '#0a0a1a',
    bgSecondary: 'rgba(26, 26, 46, 0.8)',
    bgTertiary: 'rgba(15, 15, 30, 0.6)',
    border: '#2a2a4a',
    text: '#e2e8f0',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    textDim: '#475569',
    accent: '#3b82f6',
    accentHover: '#2563eb',
    headerBg: 'rgba(17, 24, 39, 0.8)',
    cardBg: 'rgba(26, 26, 46, 0.6)',
    inputBg: 'rgba(15, 15, 30, 0.6)',
    scrollTrack: '#1a1a2e',
    scrollThumb: '#3b82f6',
  },
  light: {
    bg: '#f0f4f8',
    bgSecondary: 'rgba(255, 255, 255, 0.95)',
    bgTertiary: 'rgba(255, 255, 255, 0.8)',
    border: '#e2e8f0',
    text: '#1e293b',
    textSecondary: '#475569',
    textMuted: '#64748b',
    textDim: '#94a3b8',
    accent: '#3b82f6',
    accentHover: '#2563eb',
    headerBg: 'rgba(255, 255, 255, 0.9)',
    cardBg: 'rgba(255, 255, 255, 0.8)',
    inputBg: 'rgba(241, 245, 249, 0.8)',
    scrollTrack: '#e2e8f0',
    scrollThumb: '#3b82f6',
  },
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('theme') || 'dark')

  const theme = themes[mode]

  useEffect(() => {
    localStorage.setItem('theme', mode)
    document.body.style.background = theme.bg
    document.body.style.color = theme.text
  }, [mode, theme])

  const toggleTheme = () => setMode((m) => (m === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ mode, theme, toggleTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
