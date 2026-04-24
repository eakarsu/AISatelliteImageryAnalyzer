import { useEffect } from 'react'

export default function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    const handler = (e) => {
      for (const shortcut of shortcuts) {
        const { key, ctrl, shift, alt, action } = shortcut
        if (
          e.key.toLowerCase() === key.toLowerCase() &&
          !!e.ctrlKey === !!ctrl &&
          !!e.shiftKey === !!shift &&
          !!e.altKey === !!alt
        ) {
          // Don't trigger shortcuts when typing in inputs
          const tag = document.activeElement?.tagName?.toLowerCase()
          if (tag === 'input' || tag === 'textarea' || tag === 'select') return

          e.preventDefault()
          action()
          return
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [shortcuts])
}
