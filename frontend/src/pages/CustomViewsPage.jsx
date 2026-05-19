import Header from '../components/Header'
import ImageThroughputChart from '../components/ImageThroughputChart'
import RegionCoverageHeatmap from '../components/RegionCoverageHeatmap'
import AnalysisReportPanel from '../components/AnalysisReportPanel'
import DetectionRulesEditor from '../components/DetectionRulesEditor'

export default function CustomViewsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a0a1a 0%,#1a0a2e 30%,#0a1628 60%,#0a0a1a 100%)' }}>
      <Header breadcrumbs={[{ label: 'Imagery Views' }]} />
      <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
        <h1 style={{ color: '#e2e8f0', fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Imagery Views</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
          Custom dashboards for satellite imagery processing throughput, regional coverage, automated reporting, and classifier rules.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 20 }}>
          <ImageThroughputChart />
          <RegionCoverageHeatmap />
          <AnalysisReportPanel />
          <DetectionRulesEditor />
        </div>
      </div>
    </div>
  )
}
