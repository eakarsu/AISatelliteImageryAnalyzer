const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { analyzeWithAI } = require('../services/openrouter');
const path = require('path');

const router = express.Router();

const VALID_CATEGORIES = [
  'satellite-image-analysis', 'land-use-classification', 'change-detection',
  'crop-health-monitoring', 'urban-planning', 'climate-impact', 'defense-security',
  'water-body-analysis', 'vegetation-index', 'disaster-assessment', 'infrastructure-detection',
  'air-quality', 'terrain-analysis', 'population-density', 'mining-resource-detection',
];

// GET /api/analyses - now requires auth, scoped to user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { category, status, priority, page = 1, limit = 20, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = ['a.created_by = $1'];
    const params = [req.user.id];
    let paramIndex = 2;

    if (category) { conditions.push(`a.category = $${paramIndex++}`); params.push(category); }
    if (status) { conditions.push(`a.status = $${paramIndex++}`); params.push(status); }
    if (priority) { conditions.push(`a.priority = $${paramIndex++}`); params.push(priority); }
    if (search) {
      conditions.push(`(a.title ILIKE $${paramIndex} OR a.description ILIKE $${paramIndex} OR a.location ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await pool.query(`SELECT COUNT(*) FROM analyses a ${whereClause}`, params);
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
        total, page: parseInt(page), limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('List analyses error:', err);
    res.status(500).json({ error: 'Failed to fetch analyses' });
  }
});

// GET /api/analyses/:id - scoped to user
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT a.*, u.name as created_by_name, u.email as created_by_email
       FROM analyses a
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.id = $1 AND a.created_by = $2`,
      [id, req.user.id]
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
      [title, description || null, category, location || null, coordinates || null, status, priority || 'medium',
       aiResult ? JSON.stringify(aiResult) : null, image_url || null, metadata ? JSON.stringify(metadata) : null, req.user.id]
    );

    res.status(201).json({ analysis: result.rows[0] });
  } catch (err) {
    console.error('Create analysis error:', err);
    res.status(500).json({ error: 'Failed to create analysis' });
  }
});

// PUT /api/analyses/:id - user scoped
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, location, coordinates, status, priority, image_url, metadata } = req.body;

    const existing = await pool.query('SELECT * FROM analyses WHERE id = $1 AND created_by = $2', [id, req.user.id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    if (category && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `Invalid category.` });
    }

    const current = existing.rows[0];
    const result = await pool.query(
      `UPDATE analyses
       SET title = $1, description = $2, category = $3, location = $4, coordinates = $5,
           status = $6, priority = $7, image_url = $8, metadata = $9, updated_at = NOW()
       WHERE id = $10 AND created_by = $11
       RETURNING *`,
      [title || current.title, description !== undefined ? description : current.description,
       category || current.category, location !== undefined ? location : current.location,
       coordinates !== undefined ? coordinates : current.coordinates, status || current.status,
       priority || current.priority, image_url !== undefined ? image_url : current.image_url,
       metadata ? JSON.stringify(metadata) : current.metadata, id, req.user.id]
    );

    res.json({ analysis: result.rows[0] });
  } catch (err) {
    console.error('Update analysis error:', err);
    res.status(500).json({ error: 'Failed to update analysis' });
  }
});

// DELETE /api/analyses/:id - user scoped
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM analyses WHERE id = $1 AND created_by = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json({ message: 'Analysis deleted successfully', id: parseInt(id) });
  } catch (err) {
    console.error('Delete analysis error:', err);
    res.status(500).json({ error: 'Failed to delete analysis' });
  }
});

// POST /api/analyses/:id/ai-analyze - with vision AI + rate limiter
router.post('/:id/ai-analyze', authMiddleware, aiRateLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await pool.query(
      'SELECT * FROM analyses WHERE id = $1 AND created_by = $2',
      [id, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    const analysis = existing.rows[0];

    await pool.query('UPDATE analyses SET status = $1, updated_at = NOW() WHERE id = $2', ['in-progress', id]);

    try {
      // Determine image file path for vision AI
      let imageFilePath = null;
      if (analysis.image_url) {
        // Handle local upload paths like /uploads/filename.jpg
        if (analysis.image_url.startsWith('/uploads/')) {
          imageFilePath = path.join(__dirname, '..', analysis.image_url);
        }
        // If it's a URL, we don't pass it as a file path (could handle URL-based images differently)
      }

      const aiResult = await analyzeWithAI(
        analysis.category,
        {
          title: analysis.title,
          description: analysis.description,
          location: analysis.location,
          coordinates: analysis.coordinates,
          metadata: analysis.metadata,
        },
        imageFilePath
      );

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

// GET /api/analyses/shared/:token - public shared view (no auth)
router.get('/shared/:token', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.* FROM analyses a
       JOIN shared_links sl ON sl.analysis_id = a.id
       WHERE sl.share_token = $1 AND (sl.expires_at IS NULL OR sl.expires_at > NOW())`,
      [req.params.token]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Shared analysis not found or expired' });
    res.json({ analysis: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch shared analysis' });
  }
});

module.exports = router;
