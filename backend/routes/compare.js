const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { analyzeWithAI, parseAIJson } = require('../services/openrouter');
const axios = require('axios');
const router = express.Router();

// POST /api/compare - compare two analyses
router.post('/', authMiddleware, aiRateLimiter, async (req, res) => {
  try {
    const { analysis_id_1, analysis_id_2 } = req.body;

    if (!analysis_id_1 || !analysis_id_2) {
      return res.status(400).json({ error: 'Both analysis_id_1 and analysis_id_2 are required' });
    }

    const result1 = await pool.query(
      'SELECT * FROM analyses WHERE id = $1 AND created_by = $2',
      [analysis_id_1, req.user.id]
    );
    const result2 = await pool.query(
      'SELECT * FROM analyses WHERE id = $1 AND created_by = $2',
      [analysis_id_2, req.user.id]
    );

    if (result1.rows.length === 0 || result2.rows.length === 0) {
      return res.status(404).json({ error: 'One or both analyses not found' });
    }

    const a1 = result1.rows[0];
    const a2 = result2.rows[0];

    const aiResult1 = typeof a1.ai_result === 'string' ? JSON.parse(a1.ai_result) : a1.ai_result;
    const aiResult2 = typeof a2.ai_result === 'string' ? JSON.parse(a2.ai_result) : a2.ai_result;

    // Ask AI to compare the two results
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022';

    const systemPrompt = 'You are a satellite imagery change detection specialist. Compare two analysis results and identify key changes. Return ONLY valid JSON.';
    const userPrompt = `Compare these two satellite analyses and identify changes. Return JSON:
{
  "summary": "...",
  "key_changes": ["...", "..."],
  "change_magnitude": "significant|moderate|minor|none",
  "change_direction": "improving|degrading|mixed|stable",
  "metrics_comparison": { "metric_name": { "before": "...", "after": "...", "change": "..." } },
  "recommendations": ["..."],
  "confidence": 0.85
}

Analysis 1 (${a1.title}, Date: ${a1.created_at}):
${JSON.stringify(aiResult1, null, 2)}

Analysis 2 (${a2.title}, Date: ${a2.created_at}):
${JSON.stringify(aiResult2, null, 2)}`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
          'X-Title': 'AI Satellite Imagery Analyzer',
        },
        timeout: 60000,
      }
    );

    const content = response.data.choices?.[0]?.message?.content;
    let comparison;
    try { comparison = parseAIJson(content); } catch (_) { comparison = { summary: content }; }

    res.json({
      analysis_1: { id: a1.id, title: a1.title, date: a1.created_at, ai_result: aiResult1 },
      analysis_2: { id: a2.id, title: a2.title, date: a2.created_at, ai_result: aiResult2 },
      comparison,
    });
  } catch (err) {
    console.error('Compare error:', err);
    res.status(500).json({ error: 'Failed to compare analyses' });
  }
});

// POST /api/compare/batch - batch process array of analysis IDs
router.post('/batch', authMiddleware, aiRateLimiter, async (req, res) => {
  try {
    const { analysis_ids } = req.body;

    if (!Array.isArray(analysis_ids) || analysis_ids.length === 0) {
      return res.status(400).json({ error: 'analysis_ids array is required' });
    }

    if (analysis_ids.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 analyses per batch' });
    }

    const results = [];

    for (const id of analysis_ids) {
      try {
        const existing = await pool.query(
          'SELECT * FROM analyses WHERE id = $1 AND created_by = $2',
          [id, req.user.id]
        );

        if (existing.rows.length === 0) {
          results.push({ id, error: 'Not found' });
          continue;
        }

        const analysis = existing.rows[0];

        // Run AI analysis
        await pool.query('UPDATE analyses SET status = $1, updated_at = NOW() WHERE id = $2', ['in-progress', id]);

        const aiResult = await analyzeWithAI(
          analysis.category,
          { title: analysis.title, description: analysis.description, location: analysis.location, coordinates: analysis.coordinates, metadata: analysis.metadata }
        );

        await pool.query(
          'UPDATE analyses SET ai_result = $1, status = $2, updated_at = NOW() WHERE id = $3',
          [JSON.stringify(aiResult), 'completed', id]
        );

        results.push({ id, title: analysis.title, status: 'completed', ai_result: aiResult });
      } catch (err) {
        await pool.query('UPDATE analyses SET status = $1 WHERE id = $2', ['failed', id]).catch(() => {});
        results.push({ id, error: err.message, status: 'failed' });
      }
    }

    res.json({ results, total: results.length, completed: results.filter(r => r.status === 'completed').length });
  } catch (err) {
    console.error('Batch error:', err);
    res.status(500).json({ error: 'Batch processing failed' });
  }
});

module.exports = router;
