const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// GET /api/timeline/:location - time-series data for a location
router.get('/:location', authMiddleware, async (req, res) => {
  try {
    const location = decodeURIComponent(req.params.location);
    const { category } = req.query;

    const conditions = ['a.created_by = $1', 'a.location ILIKE $2'];
    const params = [req.user.id, `%${location}%`];
    let idx = 3;

    if (category) {
      conditions.push(`a.category = $${idx++}`);
      params.push(category);
    }

    const result = await pool.query(`
      SELECT a.id, a.title, a.category, a.location, a.status, a.ai_result,
             a.created_at, a.updated_at, a.priority
      FROM analyses a
      WHERE ${conditions.join(' AND ')}
        AND a.ai_result IS NOT NULL
        AND a.status = 'completed'
      ORDER BY a.created_at ASC
    `, params);

    // Extract metrics over time from each ai_result
    const timelineData = result.rows.map(row => {
      let aiResult = row.ai_result;
      if (typeof aiResult === 'string') {
        try { aiResult = JSON.parse(aiResult); } catch (_) { aiResult = {}; }
      }

      return {
        id: row.id,
        title: row.title,
        category: row.category,
        location: row.location,
        date: row.created_at,
        status: row.status,
        priority: row.priority,
        summary: aiResult.summary || null,
        riskLevel: aiResult.riskLevel || null,
        confidence: aiResult.confidence || null,
        metrics: aiResult.metrics || {},
        findings_count: Array.isArray(aiResult.findings) ? aiResult.findings.length : 0,
      };
    });

    // Aggregate risk levels over time
    const riskTrend = timelineData.map(d => ({
      date: d.date,
      risk: { low: 0, medium: 1, high: 2, critical: 3 }[d.riskLevel] || 1,
      riskLevel: d.riskLevel,
    }));

    res.json({
      location,
      category: category || 'all',
      total: timelineData.length,
      data: timelineData,
      risk_trend: riskTrend,
    });
  } catch (err) {
    console.error('Timeline error:', err);
    res.status(500).json({ error: 'Failed to fetch timeline data' });
  }
});

module.exports = router;
