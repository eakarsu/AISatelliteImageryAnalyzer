import { useTheme } from '../context/ThemeContext'

const STATUS_COLORS = { pending: '#eab308', completed: '#10b981', 'in-progress': '#3b82f6', failed: '#ef4444' }
const PRIORITY_COLORS = { low: '#94a3b8', medium: '#3b82f6', high: '#f97316', critical: '#ef4444' }

function DonutChart({ data, colors, title, size = 160 }) {
  const { theme } = useTheme()
  const total = data.reduce((sum, d) => sum + d.count, 0)
  if (total === 0) return null

  const radius = size / 2 - 10
  const innerRadius = radius * 0.6
  let currentAngle = -Math.PI / 2

  const segments = data.map((d) => {
    const angle = (d.count / total) * Math.PI * 2
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle = endAngle

    const x1 = size / 2 + radius * Math.cos(startAngle)
    const y1 = size / 2 + radius * Math.sin(startAngle)
    const x2 = size / 2 + radius * Math.cos(endAngle)
    const y2 = size / 2 + radius * Math.sin(endAngle)
    const ix1 = size / 2 + innerRadius * Math.cos(endAngle)
    const iy1 = size / 2 + innerRadius * Math.sin(endAngle)
    const ix2 = size / 2 + innerRadius * Math.cos(startAngle)
    const iy2 = size / 2 + innerRadius * Math.sin(startAngle)

    const largeArc = angle > Math.PI ? 1 : 0
    const path = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2}`,
      'Z',
    ].join(' ')

    return { ...d, path, color: colors[d.label] || theme.textMuted }
  })

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '14px', fontWeight: '600', color: theme.text, marginBottom: '12px' }}>{title}</div>
      <svg width={size} height={size} style={{ display: 'block', margin: '0 auto' }}>
        {segments.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} stroke={theme.bg} strokeWidth="2">
            <title>{`${s.label}: ${s.count} (${((s.count / total) * 100).toFixed(1)}%)`}</title>
          </path>
        ))}
        <text x={size / 2} y={size / 2 - 6} textAnchor="middle" fill={theme.text} fontSize="24" fontWeight="700">{total}</text>
        <text x={size / 2} y={size / 2 + 14} textAnchor="middle" fill={theme.textMuted} fontSize="11">Total</text>
      </svg>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: theme.textSecondary }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: s.color }} />
            <span style={{ textTransform: 'capitalize' }}>{s.label}</span>
            <span style={{ color: theme.textDim }}>({s.count})</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BarChart({ data, maxCount, title }) {
  const { theme } = useTheme()
  if (!data || data.length === 0) return null

  const max = maxCount || Math.max(...data.map(d => d.count), 1)

  return (
    <div>
      <div style={{ fontSize: '14px', fontWeight: '600', color: theme.text, marginBottom: '12px' }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {data.slice(0, 8).map((d) => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '120px', fontSize: '12px', color: theme.textSecondary, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
              {d.label.replace(/-/g, ' ')}
            </div>
            <div style={{ flex: 1, height: '20px', borderRadius: '4px', background: theme.bgTertiary, overflow: 'hidden' }}>
              <div style={{
                width: `${(d.count / max) * 100}%`, height: '100%', borderRadius: '4px',
                background: d.color || 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                transition: 'width 0.8s ease-out', minWidth: d.count > 0 ? '4px' : '0',
              }} />
            </div>
            <div style={{ width: '30px', textAlign: 'right', fontSize: '13px', fontWeight: '600', color: theme.text }}>{d.count}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardCharts({ stats }) {
  const { theme } = useTheme()
  if (!stats) return null

  const statusData = (stats.byStatus || []).map(s => ({ label: s.status, count: s.count }))
  const priorityData = (stats.byPriority || []).map(p => ({ label: p.priority, count: p.count }))
  const categoryData = (stats.byCategory || []).map(c => ({ label: c.category, count: c.count }))

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '20px', marginBottom: '32px',
    }}>
      <div style={{
        padding: '24px', borderRadius: '16px', background: theme.cardBg,
        border: `1px solid ${theme.border}`,
      }}>
        <DonutChart data={statusData} colors={STATUS_COLORS} title="By Status" />
      </div>
      <div style={{
        padding: '24px', borderRadius: '16px', background: theme.cardBg,
        border: `1px solid ${theme.border}`,
      }}>
        <DonutChart data={priorityData} colors={PRIORITY_COLORS} title="By Priority" />
      </div>
      <div style={{
        padding: '24px', borderRadius: '16px', background: theme.cardBg,
        border: `1px solid ${theme.border}`,
      }}>
        <BarChart data={categoryData} title="Top Categories" />
      </div>
    </div>
  )
}
