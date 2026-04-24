const express = require('express');
const crypto = require('crypto');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// POST /api/share/:analysisId
router.post('/:analysisId', authMiddleware, async (req, res) => {
  try {
    const { analysisId } = req.params;
    const { expiresInDays } = req.body;

    const analysis = await pool.query('SELECT id FROM analyses WHERE id = $1', [analysisId]);
    if (analysis.rows.length === 0) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    const shareToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const result = await pool.query(
      `INSERT INTO shared_links (analysis_id, share_token, created_by, expires_at)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [analysisId, shareToken, req.user.id, expiresAt]
    );

    res.status(201).json({ share: result.rows[0] });
  } catch (err) {
    console.error('Create share link error:', err);
    res.status(500).json({ error: 'Failed to create share link' });
  }
});

// GET /api/share/view/:token
router.get('/view/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const link = await pool.query(
      'SELECT * FROM shared_links WHERE share_token = $1',
      [token]
    );

    if (link.rows.length === 0) {
      return res.status(404).json({ error: 'Share link not found' });
    }

    const shareLink = link.rows[0];
    if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
      return res.status(410).json({ error: 'Share link has expired' });
    }

    const analysis = await pool.query(
      `SELECT a.*, u.name as created_by_name
       FROM analyses a
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.id = $1`,
      [shareLink.analysis_id]
    );

    if (analysis.rows.length === 0) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json({ analysis: analysis.rows[0] });
  } catch (err) {
    console.error('View shared analysis error:', err);
    res.status(500).json({ error: 'Failed to fetch shared analysis' });
  }
});

// GET /api/share/:analysisId - list share links for an analysis
router.get('/:analysisId', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM shared_links WHERE analysis_id = $1 ORDER BY created_at DESC',
      [req.params.analysisId]
    );
    res.json({ shares: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch share links' });
  }
});

// DELETE /api/share/link/:id
router.delete('/link/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM shared_links WHERE id = $1 AND created_by = $2', [req.params.id, req.user.id]);
    res.json({ message: 'Share link deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete share link' });
  }
});

module.exports = router;
