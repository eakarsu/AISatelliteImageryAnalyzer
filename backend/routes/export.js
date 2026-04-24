const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/export/csv?category=xxx&status=xxx
router.get('/csv', authMiddleware, async (req, res) => {
  try {
    const { category, status, priority } = req.query;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (category) { conditions.push(`a.category = $${idx++}`); params.push(category); }
    if (status) { conditions.push(`a.status = $${idx++}`); params.push(status); }
    if (priority) { conditions.push(`a.priority = $${idx++}`); params.push(priority); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await pool.query(
      `SELECT a.id, a.title, a.description, a.category, a.location, a.coordinates,
              a.status, a.priority, a.created_at, a.updated_at, u.name as created_by
       FROM analyses a
       LEFT JOIN users u ON a.created_by = u.id
       ${where}
       ORDER BY a.created_at DESC`,
      params
    );

    const rows = result.rows;
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No data to export' });
    }

    const headers = ['ID', 'Title', 'Description', 'Category', 'Location', 'Coordinates', 'Status', 'Priority', 'Created By', 'Created At', 'Updated At'];
    const csvRows = [headers.join(',')];

    for (const row of rows) {
      csvRows.push([
        row.id,
        `"${(row.title || '').replace(/"/g, '""')}"`,
        `"${(row.description || '').replace(/"/g, '""')}"`,
        row.category,
        `"${(row.location || '').replace(/"/g, '""')}"`,
        `"${(row.coordinates || '').replace(/"/g, '""')}"`,
        row.status,
        row.priority,
        `"${(row.created_by || '').replace(/"/g, '""')}"`,
        row.created_at ? new Date(row.created_at).toISOString() : '',
        row.updated_at ? new Date(row.updated_at).toISOString() : '',
      ].join(','));
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=analyses_export_${Date.now()}.csv`);
    res.send(csvRows.join('\n'));
  } catch (err) {
    console.error('Export CSV error:', err);
    res.status(500).json({ error: 'Failed to export' });
  }
});

// GET /api/export/json?category=xxx&status=xxx
router.get('/json', authMiddleware, async (req, res) => {
  try {
    const { category, status, priority } = req.query;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (category) { conditions.push(`a.category = $${idx++}`); params.push(category); }
    if (status) { conditions.push(`a.status = $${idx++}`); params.push(status); }
    if (priority) { conditions.push(`a.priority = $${idx++}`); params.push(priority); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await pool.query(
      `SELECT a.*, u.name as created_by_name
       FROM analyses a
       LEFT JOIN users u ON a.created_by = u.id
       ${where}
       ORDER BY a.created_at DESC`,
      params
    );

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=analyses_export_${Date.now()}.json`);
    res.json({ exportedAt: new Date().toISOString(), count: result.rows.length, analyses: result.rows });
  } catch (err) {
    console.error('Export JSON error:', err);
    res.status(500).json({ error: 'Failed to export' });
  }
});

module.exports = router;
