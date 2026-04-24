const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/bookmarks
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.id, b.created_at as bookmarked_at, a.*
       FROM bookmarks b
       JOIN analyses a ON b.analysis_id = a.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json({ bookmarks: result.rows });
  } catch (err) {
    console.error('List bookmarks error:', err);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

// POST /api/bookmarks/:analysisId
router.post('/:analysisId', authMiddleware, async (req, res) => {
  try {
    const { analysisId } = req.params;
    await pool.query(
      'INSERT INTO bookmarks (user_id, analysis_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.id, analysisId]
    );
    res.status(201).json({ message: 'Bookmarked' });
  } catch (err) {
    console.error('Add bookmark error:', err);
    res.status(500).json({ error: 'Failed to add bookmark' });
  }
});

// DELETE /api/bookmarks/:analysisId
router.delete('/:analysisId', authMiddleware, async (req, res) => {
  try {
    const { analysisId } = req.params;
    await pool.query(
      'DELETE FROM bookmarks WHERE user_id = $1 AND analysis_id = $2',
      [req.user.id, analysisId]
    );
    res.json({ message: 'Bookmark removed' });
  } catch (err) {
    console.error('Remove bookmark error:', err);
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
});

// GET /api/bookmarks/check/:analysisId
router.get('/check/:analysisId', authMiddleware, async (req, res) => {
  try {
    const { analysisId } = req.params;
    const result = await pool.query(
      'SELECT id FROM bookmarks WHERE user_id = $1 AND analysis_id = $2',
      [req.user.id, analysisId]
    );
    res.json({ bookmarked: result.rows.length > 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check bookmark' });
  }
});

module.exports = router;
