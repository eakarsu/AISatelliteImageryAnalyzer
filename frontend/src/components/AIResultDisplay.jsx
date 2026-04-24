import {
  Brain,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
  BarChart3,
} from 'lucide-react'

const riskColors = {
  low: { bg: 'rgba(16,185,129,0.12)', border: '#10b981', text: '#10b981', glow: 'rgba(16,185,129,0.3)' },
  medium: { bg: 'rgba(234,179,8,0.12)', border: '#eab308', text: '#eab308', glow: 'rgba(234,179,8,0.3)' },
  high: { bg: 'rgba(249,115,22,0.12)', border: '#f97316', text: '#f97316', glow: 'rgba(249,115,22,0.3)' },
  critical: { bg: 'rgba(239,68,68,0.12)', border: '#ef4444', text: '#ef4444', glow: 'rgba(239,68,68,0.3)' },
}

export default function AIResultDisplay({ result }) {
  if (!result) return null

  const riskLevel = result.riskLevel || result.risk_level
  const risk = riskColors[riskLevel?.toLowerCase()] || riskColors.medium
  const confidence = typeof result.confidence === 'number'
    ? result.confidence
    : typeof result.confidence === 'string'
      ? parseFloat(result.confidence)
      : 0
  const confidencePct = confidence > 1 ? confidence : confidence * 100

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      color: '#64748b',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    summaryCard: {
      padding: '24px',
      borderRadius: '16px',
      background: 'rgba(59,130,246,0.06)',
      border: '1px solid rgba(59,130,246,0.15)',
      borderLeft: '4px solid #3b82f6',
    },
    summaryText: {
      fontSize: '16px',
      lineHeight: '1.7',
      color: '#cbd5e1',
    },
    findingItem: {
      display: 'flex',
      gap: '12px',
      padding: '14px 16px',
      borderRadius: '12px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid #2a2a4a',
      marginBottom: '8px',
      alignItems: 'flex-start',
    },
    findingNumber: {
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: '700',
      color: '#fff',
      flexShrink: 0,
    },
    findingText: {
      fontSize: '14px',
      lineHeight: '1.6',
      color: '#cbd5e1',
      paddingTop: '3px',
    },
    recCard: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px',
      borderRadius: '12px',
      background: 'rgba(16,185,129,0.06)',
      border: '1px solid rgba(16,185,129,0.15)',
      marginBottom: '8px',
      cursor: 'default',
      transition: 'background 0.2s',
    },
    recIcon: {
      width: '36px',
      height: '36px',
      borderRadius: '10px',
      background: 'rgba(16,185,129,0.12)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    recText: {
      fontSize: '14px',
      lineHeight: '1.5',
      color: '#cbd5e1',
      flex: 1,
    },
    riskBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px',
      borderRadius: '12px',
      background: risk.bg,
      border: `1px solid ${risk.border}`,
      boxShadow: `0 0 20px ${risk.glow}`,
      fontSize: '18px',
      fontWeight: '700',
      color: risk.text,
      textTransform: 'uppercase',
      letterSpacing: '1px',
    },
    confidenceBar: {
      width: '100%',
      height: '12px',
      borderRadius: '6px',
      background: 'rgba(255,255,255,0.06)',
      overflow: 'hidden',
      position: 'relative',
    },
    confidenceFill: {
      height: '100%',
      borderRadius: '6px',
      background: confidencePct >= 80
        ? 'linear-gradient(90deg, #10b981, #34d399)'
        : confidencePct >= 60
          ? 'linear-gradient(90deg, #3b82f6, #60a5fa)'
          : 'linear-gradient(90deg, #f97316, #fb923c)',
      width: `${confidencePct}%`,
      transition: 'width 1s ease-out',
    },
    confidenceLabel: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px',
    },
    metricsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: '12px',
    },
    metricCard: {
      padding: '16px',
      borderRadius: '12px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid #2a2a4a',
      textAlign: 'center',
    },
    metricValue: {
      fontSize: '22px',
      fontWeight: '700',
      color: '#e2e8f0',
      marginBottom: '4px',
    },
    metricLabel: {
      fontSize: '12px',
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
  }

  return (
    <div style={styles.container}>
      {/* Summary */}
      {result.summary && (
        <div>
          <div style={styles.sectionTitle}>
            <Brain size={16} color="#3b82f6" /> AI Summary
          </div>
          <div style={styles.summaryCard}>
            <p style={styles.summaryText}>{result.summary}</p>
          </div>
        </div>
      )}

      {/* Risk Level & Confidence Row */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {riskLevel && (
          <div style={{ flex: '0 0 auto' }}>
            <div style={styles.sectionTitle}>
              <AlertTriangle size={16} color={risk.text} /> Risk Level
            </div>
            <div style={styles.riskBadge}>
              <AlertTriangle size={20} />
              {riskLevel}
            </div>
          </div>
        )}

        {result.confidence != null && (
          <div style={{ flex: 1, minWidth: '250px' }}>
            <div style={styles.sectionTitle}>
              <TrendingUp size={16} color="#3b82f6" /> Confidence
            </div>
            <div style={styles.confidenceLabel}>
              <span style={{ fontSize: '14px', color: '#94a3b8' }}>Analysis Confidence</span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#e2e8f0' }}>
                {confidencePct.toFixed(1)}%
              </span>
            </div>
            <div style={styles.confidenceBar}>
              <div style={styles.confidenceFill} />
            </div>
          </div>
        )}
      </div>

      {/* Findings */}
      {result.findings && result.findings.length > 0 && (
        <div>
          <div style={styles.sectionTitle}>
            <CheckCircle2 size={16} color="#10b981" /> Key Findings
          </div>
          {result.findings.map((finding, i) => (
            <div key={i} style={styles.findingItem}>
              <div style={styles.findingNumber}>{i + 1}</div>
              <p style={styles.findingText}>{finding}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <div>
          <div style={styles.sectionTitle}>
            <ArrowRight size={16} color="#10b981" /> Recommendations
          </div>
          {result.recommendations.map((rec, i) => (
            <div
              key={i}
              style={styles.recCard}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(16,185,129,0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(16,185,129,0.06)')}
            >
              <div style={styles.recIcon}>
                <ArrowRight size={16} color="#10b981" />
              </div>
              <p style={styles.recText}>{rec}</p>
            </div>
          ))}
        </div>
      )}

      {/* Metrics */}
      {result.metrics && Object.keys(result.metrics).length > 0 && (
        <div>
          <div style={styles.sectionTitle}>
            <BarChart3 size={16} color="#8b5cf6" /> Metrics
          </div>
          <div style={styles.metricsGrid}>
            {Object.entries(result.metrics).map(([key, value]) => (
              <div key={key} style={styles.metricCard}>
                <div style={styles.metricValue}>
                  {typeof value === 'number' ? value.toLocaleString() : String(value)}
                </div>
                <div style={styles.metricLabel}>
                  {key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
