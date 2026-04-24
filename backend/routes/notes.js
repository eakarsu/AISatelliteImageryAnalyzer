const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/notes/:analysisId
router.get('/:analysisId', authMiddleware, async (req, res) => {
  try {
    const { analysisId } = req.params;
    const result = await pool.query(
      `SELECT n.*, u.name as author_name, u.email as author_email
       FROM notes n
       JOIN users u ON n.user_id = u.id
       WHERE n.analysis_id = $1
       ORDER BY n.created_at DESC`,
      [analysisId]
    );
    res.json({ notes: result.rows });
  } catch (err) {
    console.error('List notes error:', err);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// POST /api/notes/:analysisId
router.post('/:analysisId', authMiddleware, async (req, res) => {
  try {
    const { analysisId } = req.params;
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }
    const result = await pool.query(
      `INSERT INTO notes (analysis_id, user_id, content) VALUES ($1, $2, $3)
       RETURNING *`,
      [analysisId, req.user.id, content.trim()]
    );
    const note = result.rows[0];
    note.author_name = req.user.name;
    note.author_email = req.user.email;
    res.status(201).json({ note });
  } catch (err) {
    console.error('Create note error:', err);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// PUT /api/notes/:noteId
router.put('/:noteId', authMiddleware, async (req, res) => {
  try {
    const { noteId } = req.params;
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }
    const result = await pool.query(
      `UPDATE notes SET content = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *`,
      [content.trim(), noteId, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found or not authorized' });
    }
    res.json({ note: result.rows[0] });
  } catch (err) {
    console.error('Update note error:', err);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// DELETE /api/notes/:noteId
router.delete('/:noteId', authMiddleware, async (req, res) => {
  try {
    const { noteId } = req.params;
    const result = await pool.query(
      'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id',
      [noteId, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found or not authorized' });
    }
    res.json({ message: 'Note deleted' });
  } catch (err) {
    console.error('Delete note error:', err);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

module.exports = router;
