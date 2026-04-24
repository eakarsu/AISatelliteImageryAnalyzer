const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/activity?limit=50&analysisId=xxx
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { limit = 50, analysisId } = req.query;
    let query, params;

    if (analysisId) {
      query = `
        SELECT al.*, u.name as user_name, a.title as analysis_title
        FROM activity_log al
        LEFT JOIN users u ON al.user_id = u.id
        LEFT JOIN analyses a ON al.analysis_id = a.id
        WHERE al.analysis_id = $1
        ORDER BY al.created_at DESC LIMIT $2`;
      params = [analysisId, parseInt(limit)];
    } else {
      query = `
        SELECT al.*, u.name as user_name, a.title as analysis_title
        FROM activity_log al
        LEFT JOIN users u ON al.user_id = u.id
        LEFT JOIN analyses a ON al.analysis_id = a.id
        ORDER BY al.created_at DESC LIMIT $1`;
      params = [parseInt(limit)];
    }

    const result = await pool.query(query, params);
    res.json({ activities: result.rows });
  } catch (err) {
    console.error('List activity error:', err);
    res.status(500).json({ error: 'Failed to fetch activity log' });
  }
});

// Utility: log activity (used by other routes)
async function logActivity(userId, analysisId, action, details) {
  try {
    await pool.query(
      'INSERT INTO activity_log (user_id, analysis_id, action, details) VALUES ($1, $2, $3, $4)',
      [userId, analysisId, action, details ? JSON.stringify(details) : null]
    );
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

router.logActivity = logActivity;

module.exports = router;
