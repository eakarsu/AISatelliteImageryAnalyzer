const express = require('express');
const router = express.Router();
const pool = require('../db');
const path = require('path');
const authMiddleware = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { analyzeWithAI, parseAIJson } = require('../services/openrouter');

router.use(authMiddleware);
router.use(aiRateLimiter);

// Apply pass 4: map a "no API key configured" thrown error to a 503 response.
function handleAiError(err, res, fallbackMsg) {
  const msg = err && err.message ? err.message : '';
  if (/OPENROUTER_API_KEY is not configured/i.test(msg)) {
    return res.status(503).json({
      error: 'AI service unavailable: OPENROUTER_API_KEY is not configured on the backend.',
      noKey: true,
    });
  }
  console.error(`${fallbackMsg}:`, err);
  return res.status(500).json({ error: msg || fallbackMsg });
}

async function getAnalysis(id, userId) {
  const r = await pool.query(
    'SELECT * FROM analyses WHERE id = $1 AND created_by = $2',
    [id, userId]
  );
  return r.rows[0] || null;
}

function imagePathFor(analysis) {
  if (!analysis || !analysis.image_url) return null;
  if (analysis.image_url.startsWith('/uploads/')) {
    return path.join(__dirname, '..', analysis.image_url);
  }
  return null;
}

// POST /api/imagery-ai/change-detection — compare two analyses (before / after)
router.post('/change-detection', async (req, res) => {
  try {
    const { before_analysis_id, after_analysis_id } = req.body || {};
    if (!before_analysis_id || !after_analysis_id) {
      return res.status(400).json({ error: 'before_analysis_id and after_analysis_id are required' });
    }
    const before = await getAnalysis(before_analysis_id, req.user.id);
    const after = await getAnalysis(after_analysis_id, req.user.id);
    if (!before || !after) return res.status(404).json({ error: 'one or both analyses not found' });

    const aiResult = await analyzeWithAI(
      'change-detection',
      {
        title: `${before.title} -> ${after.title}`,
        description: `Before metadata: ${JSON.stringify(before.metadata || {})}\nAfter metadata: ${JSON.stringify(after.metadata || {})}\nBefore description: ${before.description || ''}\nAfter description: ${after.description || ''}`,
        location: after.location || before.location,
        coordinates: after.coordinates || before.coordinates,
        metadata: { before_id: before.id, after_id: after.id, before_date: before.captured_at || before.created_at, after_date: after.captured_at || after.created_at },
      },
      imagePathFor(after) || imagePathFor(before)
    );

    res.json({ change_detection: aiResult, before: { id: before.id, title: before.title }, after: { id: after.id, title: after.title } });
  } catch (err) {
    return handleAiError(err, res, 'Change detection failed');
  }
});

// POST /api/imagery-ai/vegetation-index — NDVI / crop health for an analysis
router.post('/vegetation-index', async (req, res) => {
  try {
    const { analysis_id } = req.body || {};
    if (!analysis_id) return res.status(400).json({ error: 'analysis_id is required' });
    const analysis = await getAnalysis(analysis_id, req.user.id);
    if (!analysis) return res.status(404).json({ error: 'analysis not found' });

    const aiResult = await analyzeWithAI(
      'vegetation-index',
      {
        title: analysis.title,
        description: analysis.description,
        location: analysis.location,
        coordinates: analysis.coordinates,
        metadata: analysis.metadata,
      },
      imagePathFor(analysis)
    );

    res.json({ analysis_id: analysis.id, vegetation_index: aiResult });
  } catch (err) {
    return handleAiError(err, res, 'Vegetation index analysis failed');
  }
});

// POST /api/imagery-ai/area-calculation — measure area of features in an analysis
router.post('/area-calculation', async (req, res) => {
  try {
    const { analysis_id, target_features, scale_meters_per_pixel } = req.body || {};
    if (!analysis_id) return res.status(400).json({ error: 'analysis_id is required' });
    const analysis = await getAnalysis(analysis_id, req.user.id);
    if (!analysis) return res.status(404).json({ error: 'analysis not found' });

    const enrichedDescription = `${analysis.description || ''}\nTarget features: ${(target_features || []).join(', ') || 'all detectable buildings, water bodies, vegetation, roads'}\nApproximate scale: ${scale_meters_per_pixel || 'unspecified'} m/pixel`;

    const aiResult = await analyzeWithAI(
      'satellite-image-analysis',
      {
        title: `Area calculation for ${analysis.title}`,
        description: enrichedDescription,
        location: analysis.location,
        coordinates: analysis.coordinates,
        metadata: { ...(analysis.metadata || {}), analysis_mode: 'area_calculation', target_features: target_features || [], scale_meters_per_pixel: scale_meters_per_pixel || null },
      },
      imagePathFor(analysis)
    );

    res.json({ analysis_id: analysis.id, area_estimates: aiResult });
  } catch (err) {
    return handleAiError(err, res, 'Area calculation failed');
  }
});

// POST /api/imagery-ai/object-detection — catalog infrastructure / objects in
// an analysis using the existing `infrastructure-detection` category prompt.
// (apply4 backlog: was the next mechanical follow-up.)
router.post('/object-detection', async (req, res) => {
  try {
    const { analysis_id, target_objects } = req.body || {};
    if (!analysis_id) return res.status(400).json({ error: 'analysis_id is required' });
    const analysis = await getAnalysis(analysis_id, req.user.id);
    if (!analysis) return res.status(404).json({ error: 'analysis not found' });

    const targets = Array.isArray(target_objects) && target_objects.length
      ? target_objects.join(', ')
      : 'buildings, roads, vehicles, bridges, power lines, communication towers, storage tanks';

    const enrichedDescription = `${analysis.description || ''}
Target objects to detect and count: ${targets}`;

    const aiResult = await analyzeWithAI(
      'infrastructure-detection',
      {
        title: `Object detection for ${analysis.title}`,
        description: enrichedDescription,
        location: analysis.location,
        coordinates: analysis.coordinates,
        metadata: {
          ...(analysis.metadata || {}),
          analysis_mode: 'object_detection',
          target_objects: target_objects || null,
        },
      },
      imagePathFor(analysis)
    );

    res.json({ analysis_id: analysis.id, object_detection: aiResult });
  } catch (err) {
    return handleAiError(err, res, 'Object detection failed');
  }
});

// POST /api/imagery-ai/temporal-analysis — sequence change-detection across
// 3+ analyses ordered by timestamp to surface trends over time.
// (apply4 backlog: mechanical multi-step over a timeline.)
router.post('/temporal-analysis', async (req, res) => {
  try {
    const { analysis_ids, focus } = req.body || {};
    if (!Array.isArray(analysis_ids) || analysis_ids.length < 2) {
      return res.status(400).json({ error: 'analysis_ids must be an array of at least 2 analysis ids' });
    }
    const analyses = [];
    for (const id of analysis_ids) {
      const a = await getAnalysis(id, req.user.id);
      if (!a) return res.status(404).json({ error: `analysis ${id} not found` });
      analyses.push(a);
    }
    analyses.sort((x, y) => {
      const xt = new Date(x.captured_at || x.created_at || 0).getTime();
      const yt = new Date(y.captured_at || y.created_at || 0).getTime();
      return xt - yt;
    });

    const timelineDescription = analyses
      .map((a, i) => {
        const t = a.captured_at || a.created_at || 'unknown date';
        return `Step ${i + 1} (${t}) — title="${a.title}" location="${a.location || ''}" desc="${(a.description || '').slice(0, 240)}"`;
      })
      .join('\n');

    const aiResult = await analyzeWithAI(
      'change-detection',
      {
        title: `Temporal analysis across ${analyses.length} timepoints`,
        description: `Multi-timepoint timeline (oldest → newest):\n${timelineDescription}\n\nFocus area: ${focus || 'general land cover, urban expansion, deforestation, or environmental change trends'}`,
        location: analyses[analyses.length - 1].location || analyses[0].location,
        coordinates: analyses[analyses.length - 1].coordinates || analyses[0].coordinates,
        metadata: {
          analysis_mode: 'temporal_analysis',
          step_count: analyses.length,
          step_ids: analyses.map((a) => a.id),
          step_dates: analyses.map((a) => a.captured_at || a.created_at),
          focus: focus || null,
        },
      },
      imagePathFor(analyses[analyses.length - 1])
    );

    res.json({
      step_count: analyses.length,
      ordered_steps: analyses.map((a) => ({
        id: a.id,
        title: a.title,
        captured_at: a.captured_at || a.created_at,
      })),
      temporal_analysis: aiResult,
    });
  } catch (err) {
    return handleAiError(err, res, 'Temporal analysis failed');
  }
});

module.exports = router;
