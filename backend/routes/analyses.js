const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
const { analyzeWithAI } = require('../services/openrouter');

const router = express.Router();

const VALID_CATEGORIES = [
  'satellite-image-analysis',
  'land-use-classification',
  'change-detection',
  'crop-health-monitoring',
  'urban-planning',
  'climate-impact',
  'defense-security',
  'water-body-analysis',
  'vegetation-index',
  'disaster-assessment',
  'infrastructure-detection',
  'air-quality',
  'terrain-analysis',
  'population-density',
  'mining-resource-detection',
];

// GET /api/analyses?category=xxx&status=xxx&priority=xxx&page=1&limit=20
router.get('/', async (req, res) => {
  try {
    const { category, status, priority, page = 1, limit = 20, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (category) {
      conditions.push(`a.category = $${paramIndex++}`);
      params.push(category);
    }
    if (status) {
      conditions.push(`a.status = $${paramIndex++}`);
      params.push(status);
    }
    if (priority) {
      conditions.push(`a.priority = $${paramIndex++}`);
      params.push(priority);
    }
    if (search) {
      conditions.push(`(a.title ILIKE $${paramIndex} OR a.description ILIKE $${paramIndex} OR a.location ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) FROM analyses a ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    const dataQuery = `
      SELECT a.*, u.name as created_by_name, u.email as created_by_email
      FROM analyses a
      LEFT JOIN users u ON a.created_by = u.id
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    params.push(parseInt(limit), offset);

    const result = await pool.query(dataQuery, params);

    res.json({
      analyses: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('List analyses error:', err);
    res.status(500).json({ error: 'Failed to fetch analyses' });
  }
});

// GET /api/analyses/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT a.*, u.name as created_by_name, u.email as created_by_email
       FROM analyses a
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json({ analysis: result.rows[0] });
  } catch (err) {
    console.error('Get analysis error:', err);
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
});

// POST /api/analyses
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, category, location, coordinates, priority, image_url, metadata, runAI } = req.body;

    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` });
    }

    let aiResult = null;
    let status = 'pending';

    if (runAI) {
      try {
        status = 'in-progress';
        aiResult = await analyzeWithAI(category, { title, description, location, coordinates, metadata });
        status = 'completed';
      } catch (aiErr) {
        console.error('AI analysis failed during creation:', aiErr);
        status = 'failed';
        aiResult = { error: aiErr.message };
      }
    }

    const result = await pool.query(
      `INSERT INTO analyses (title, description, category, location, coordinates, status, priority, ai_result, image_url, metadata, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        title,
        description || null,
        category,
        location || null,
        coordinates || null,
        status,
        priority || 'medium',
        aiResult ? JSON.stringify(aiResult) : null,
        image_url || null,
        metadata ? JSON.stringify(metadata) : null,
        req.user.id,
      ]
    );

    res.status(201).json({ analysis: result.rows[0] });
  } catch (err) {
    console.error('Create analysis error:', err);
    res.status(500).json({ error: 'Failed to create analysis' });
  }
});

// PUT /api/analyses/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, location, coordinates, status, priority, image_url, metadata } = req.body;

    const existing = await pool.query('SELECT * FROM analyses WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    if (category && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` });
    }

    const current = existing.rows[0];

    const result = await pool.query(
      `UPDATE analyses
       SET title = $1, description = $2, category = $3, location = $4, coordinates = $5,
           status = $6, priority = $7, image_url = $8, metadata = $9, updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [
        title || current.title,
        description !== undefined ? description : current.description,
        category || current.category,
        location !== undefined ? location : current.location,
        coordinates !== undefined ? coordinates : current.coordinates,
        status || current.status,
        priority || current.priority,
        image_url !== undefined ? image_url : current.image_url,
        metadata ? JSON.stringify(metadata) : current.metadata,
        id,
      ]
    );

    res.json({ analysis: result.rows[0] });
  } catch (err) {
    console.error('Update analysis error:', err);
    res.status(500).json({ error: 'Failed to update analysis' });
  }
});

// DELETE /api/analyses/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM analyses WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json({ message: 'Analysis deleted successfully', id: parseInt(id) });
  } catch (err) {
    console.error('Delete analysis error:', err);
    res.status(500).json({ error: 'Failed to delete analysis' });
  }
});

// POST /api/analyses/:id/ai-analyze
router.post('/:id/ai-analyze', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await pool.query('SELECT * FROM analyses WHERE id = $1', [id]);

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    const analysis = existing.rows[0];

    await pool.query('UPDATE analyses SET status = $1, updated_at = NOW() WHERE id = $2', ['in-progress', id]);

    try {
      const aiResult = await analyzeWithAI(analysis.category, {
        title: analysis.title,
        description: analysis.description,
        location: analysis.location,
        coordinates: analysis.coordinates,
        metadata: analysis.metadata,
      });

      const result = await pool.query(
        'UPDATE analyses SET ai_result = $1, status = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
        [JSON.stringify(aiResult), 'completed', id]
      );

      res.json({ analysis: result.rows[0] });
    } catch (aiErr) {
      console.error('AI analysis failed:', aiErr);
      await pool.query(
        'UPDATE analyses SET status = $1, ai_result = $2, updated_at = NOW() WHERE id = $3',
        ['failed', JSON.stringify({ error: aiErr.message }), id]
      );
      res.status(502).json({ error: 'AI analysis failed', details: aiErr.message });
    }
  } catch (err) {
    console.error('AI analyze error:', err);
    res.status(500).json({ error: 'Failed to run AI analysis' });
  }
});

module.exports = router;
