const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// In-memory store for detection rules (classifier thresholds)
let detectionRules = [
  { id: 1, name: 'Building', threshold: 0.75, enabled: true, color: '#3b82f6', description: 'Buildings and rooftops' },
  { id: 2, name: 'Vehicle', threshold: 0.65, enabled: true, color: '#f59e0b', description: 'Cars, trucks' },
  { id: 3, name: 'Vegetation', threshold: 0.55, enabled: true, color: '#10b981', description: 'Trees and crops' },
  { id: 4, name: 'Water Body', threshold: 0.80, enabled: true, color: '#06b6d4', description: 'Lakes, rivers' },
  { id: 5, name: 'Cloud Cover', threshold: 0.50, enabled: false, color: '#94a3b8', description: 'Cloud occlusion' },
];
let nextRuleId = 6;

// GET /api/custom-views/throughput - Image processing throughput
router.get('/throughput', authMiddleware, async (_req, res) => {
  try {
    const now = Date.now();
    const data = [];
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now - i * 3600 * 1000);
      const label = `${hour.getHours().toString().padStart(2, '0')}:00`;
      const processed = 40 + Math.floor(Math.sin(i / 3) * 25 + Math.random() * 30);
      const queued = Math.max(0, 12 + Math.floor(Math.cos(i / 2) * 8 + Math.random() * 10));
      const failed = Math.max(0, Math.floor(Math.random() * 5));
      data.push({
        hour: label,
        processed,
        queued,
        failed,
        avgLatencyMs: 320 + Math.floor(Math.random() * 180),
      });
    }
    const totalProcessed = data.reduce((s, d) => s + d.processed, 0);
    const totalFailed = data.reduce((s, d) => s + d.failed, 0);
    const avgPerHour = Math.round(totalProcessed / 24);
    res.json({
      data,
      summary: {
        totalProcessed,
        totalFailed,
        avgPerHour,
        successRate: ((1 - totalFailed / Math.max(1, totalProcessed)) * 100).toFixed(2),
      },
    });
  } catch (err) {
    console.error('Throughput error:', err);
    res.status(500).json({ error: 'Failed to fetch throughput' });
  }
});

// GET /api/custom-views/coverage-heatmap - Region coverage heatmap (region x time)
router.get('/coverage-heatmap', authMiddleware, async (_req, res) => {
  try {
    const regions = ['North America', 'South America', 'Europe', 'Africa', 'Asia', 'Oceania', 'Antarctica'];
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(5, 10));
    }
    const matrix = regions.map((region, ri) =>
      days.map((day, di) => ({
        region,
        day,
        coverage: Math.max(0, Math.min(100, Math.round(40 + Math.sin(ri + di) * 25 + Math.random() * 30))),
        scans: Math.floor(5 + Math.random() * 40),
      }))
    );
    res.json({ regions, days, matrix });
  } catch (err) {
    console.error('Coverage heatmap error:', err);
    res.status(500).json({ error: 'Failed to fetch coverage heatmap' });
  }
});

// GET /api/custom-views/analysis-report - PDF-style report (text/plain content)
router.get('/analysis-report', authMiddleware, async (req, res) => {
  try {
    const format = (req.query.format || 'text').toLowerCase();
    const generatedAt = new Date().toISOString();
    const report = {
      title: 'Satellite Imagery Analysis Report',
      generatedAt,
      analyst: req.user?.email || 'system',
      sections: [
        {
          heading: 'Executive Summary',
          body: 'Comprehensive multi-spectral analysis processed 1,284 image tiles across 7 regions in the past 24h. Detection accuracy averaged 91.3%.',
        },
        {
          heading: 'Detection Highlights',
          body: '237 buildings, 1,415 vehicles, 84 km^2 vegetation, 18 km^2 water bodies identified. Notable change clusters detected in North America (urban expansion +3.2%).',
        },
        {
          heading: 'Data Quality',
          body: 'Cloud cover average 12.4%. Image registration error mean 0.42 pixels. 4 tiles flagged for re-acquisition.',
        },
        {
          heading: 'Recommendations',
          body: 'Increase NDVI cadence over Africa region. Recalibrate vehicle threshold (current 0.65) toward 0.70 to reduce false positives in dense urban tiles.',
        },
      ],
      metrics: {
        tilesProcessed: 1284,
        accuracy: 0.913,
        cloudCoverAvg: 0.124,
        regionsCovered: 7,
      },
    };
    if (format === 'pdf') {
      const lines = [
        `%PDF-1.4`,
        `% ${report.title}`,
        ...report.sections.map((s) => `% ${s.heading}: ${s.body}`),
        `% Generated: ${generatedAt}`,
      ];
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="analysis-report.pdf"');
      return res.send(lines.join('\n'));
    }
    res.json(report);
  } catch (err) {
    console.error('Analysis report error:', err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Detection rules editor (CRUD)
// GET /api/custom-views/detection-rules
router.get('/detection-rules', authMiddleware, async (_req, res) => {
  res.json({ rules: detectionRules });
});

// POST /api/custom-views/detection-rules
router.post('/detection-rules', authMiddleware, async (req, res) => {
  try {
    const { name, threshold, enabled, color, description } = req.body || {};
    if (!name || threshold == null) return res.status(400).json({ error: 'name and threshold required' });
    const t = Number(threshold);
    if (Number.isNaN(t) || t < 0 || t > 1) return res.status(400).json({ error: 'threshold must be 0..1' });
    const rule = {
      id: nextRuleId++,
      name: String(name),
      threshold: t,
      enabled: enabled !== false,
      color: color || '#6366f1',
      description: description || '',
    };
    detectionRules.push(rule);
    res.status(201).json({ rule });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create rule' });
  }
});

// PUT /api/custom-views/detection-rules/:id
router.put('/detection-rules/:id', authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const idx = detectionRules.findIndex((r) => r.id === id);
    if (idx === -1) return res.status(404).json({ error: 'rule not found' });
    const cur = detectionRules[idx];
    const { name, threshold, enabled, color, description } = req.body || {};
    if (threshold != null) {
      const t = Number(threshold);
      if (Number.isNaN(t) || t < 0 || t > 1) return res.status(400).json({ error: 'threshold must be 0..1' });
      cur.threshold = t;
    }
    if (name != null) cur.name = String(name);
    if (enabled != null) cur.enabled = !!enabled;
    if (color != null) cur.color = String(color);
    if (description != null) cur.description = String(description);
    detectionRules[idx] = cur;
    res.json({ rule: cur });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update rule' });
  }
});

// DELETE /api/custom-views/detection-rules/:id
router.delete('/detection-rules/:id', authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const before = detectionRules.length;
    detectionRules = detectionRules.filter((r) => r.id !== id);
    if (detectionRules.length === before) return res.status(404).json({ error: 'rule not found' });
    res.json({ deleted: id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete rule' });
  }
});

module.exports = router;
