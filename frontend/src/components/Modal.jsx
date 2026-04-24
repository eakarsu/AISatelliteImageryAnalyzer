import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, actions }) {
  if (!isOpen) return null

  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    },
    card: {
      width: '100%',
      maxWidth: '560px',
      maxHeight: '90vh',
      overflowY: 'auto',
      borderRadius: '20px',
      background: '#1a1a2e',
      border: '1px solid #2a2a4a',
      boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '24px 28px 16px',
      borderBottom: '1px solid #2a2a4a',
    },
    title: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#e2e8f0',
    },
    closeBtn: {
      width: '32px',
      height: '32px',
      borderRadius: '8px',
      border: 'none',
      background: 'rgba(255,255,255,0.05)',
      color: '#64748b',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s',
    },
    body: {
      padding: '24px 28px',
    },
    footer: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      padding: '16px 28px 24px',
    },
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.card} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>{title}</h2>
          <button
            style={styles.closeBtn}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.15)'
              e.currentTarget.style.color = '#ef4444'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
              e.currentTarget.style.color = '#64748b'
            }}
          >
            <X size={16} />
          </button>
        </div>
        <div style={styles.body}>{children}</div>
        {actions && <div style={styles.footer}>{actions}</div>}
      </div>
    </div>
  )
}
