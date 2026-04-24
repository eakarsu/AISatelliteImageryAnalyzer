const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/tags
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tags ORDER BY name');
    res.json({ tags: result.rows });
  } catch (err) {
    console.error('List tags error:', err);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// POST /api/tags
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Tag name is required' });
    }
    const result = await pool.query(
      'INSERT INTO tags (name, color, created_by) VALUES ($1, $2, $3) ON CONFLICT (name) DO UPDATE SET color = EXCLUDED.color RETURNING *',
      [name.trim().toLowerCase(), color || '#3b82f6', req.user.id]
    );
    res.status(201).json({ tag: result.rows[0] });
  } catch (err) {
    console.error('Create tag error:', err);
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

// DELETE /api/tags/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM tags WHERE id = $1', [req.params.id]);
    res.json({ message: 'Tag deleted' });
  } catch (err) {
    console.error('Delete tag error:', err);
    res.status(500).json({ error: 'Failed to delete tag' });
  }
});

// GET /api/tags/analysis/:analysisId
router.get('/analysis/:analysisId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.* FROM tags t
       JOIN analysis_tags at ON t.id = at.tag_id
       WHERE at.analysis_id = $1
       ORDER BY t.name`,
      [req.params.analysisId]
    );
    res.json({ tags: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// POST /api/tags/analysis/:analysisId/:tagId
router.post('/analysis/:analysisId/:tagId', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      'INSERT INTO analysis_tags (analysis_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.params.analysisId, req.params.tagId]
    );
    res.status(201).json({ message: 'Tag added to analysis' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add tag' });
  }
});

// DELETE /api/tags/analysis/:analysisId/:tagId
router.delete('/analysis/:analysisId/:tagId', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM analysis_tags WHERE analysis_id = $1 AND tag_id = $2',
      [req.params.analysisId, req.params.tagId]
    );
    res.json({ message: 'Tag removed from analysis' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove tag' });
  }
});

module.exports = router;
