const express = require('express');
const pool = require('../db');

const router = express.Router();

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const [totalResult, categoryResult, statusResult, recentResult, priorityResult] = await Promise.all([
      pool.query('SELECT COUNT(*) as total FROM analyses'),

      pool.query(
        `SELECT category, COUNT(*) as count,
                COUNT(*) FILTER (WHERE status = 'completed') as completed,
                COUNT(*) FILTER (WHERE status = 'pending') as pending,
                COUNT(*) FILTER (WHERE status = 'in-progress') as in_progress,
                COUNT(*) FILTER (WHERE status = 'failed') as failed
         FROM analyses GROUP BY category ORDER BY category`
      ),

      pool.query(
        `SELECT status, COUNT(*) as count FROM analyses GROUP BY status ORDER BY status`
      ),

      pool.query(
        `SELECT a.id, a.title, a.category, a.status, a.priority, a.location, a.created_at,
                u.name as created_by_name
         FROM analyses a
         LEFT JOIN users u ON a.created_by = u.id
         ORDER BY a.created_at DESC
         LIMIT 10`
      ),

      pool.query(
        `SELECT priority, COUNT(*) as count FROM analyses GROUP BY priority ORDER BY
         CASE priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 END`
      ),
    ]);

    res.json({
      totalAnalyses: parseInt(totalResult.rows[0].total),
      byCategory: categoryResult.rows.map((r) => ({
        category: r.category,
        count: parseInt(r.count),
        completed: parseInt(r.completed),
        pending: parseInt(r.pending),
        inProgress: parseInt(r.in_progress),
        failed: parseInt(r.failed),
      })),
      byStatus: statusResult.rows.map((r) => ({
        status: r.status,
        count: parseInt(r.count),
      })),
      byPriority: priorityResult.rows.map((r) => ({
        priority: r.priority,
        count: parseInt(r.count),
      })),
      recentAnalyses: recentResult.rows,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

module.exports = router;
