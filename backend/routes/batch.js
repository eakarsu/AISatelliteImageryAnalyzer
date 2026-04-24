const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// POST /api/batch/delete
router.post('/delete', authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Array of IDs is required' });
    }
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
    const result = await pool.query(
      `DELETE FROM analyses WHERE id IN (${placeholders}) RETURNING id`,
      ids
    );
    res.json({ message: `${result.rowCount} analyses deleted`, deletedIds: result.rows.map(r => r.id) });
  } catch (err) {
    console.error('Batch delete error:', err);
    res.status(500).json({ error: 'Failed to batch delete' });
  }
});

// POST /api/batch/update-status
router.post('/update-status', authMiddleware, async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || ids.length === 0 || !status) {
      return res.status(400).json({ error: 'Array of IDs and status are required' });
    }
    const validStatuses = ['pending', 'in-progress', 'completed', 'failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
    }
    const placeholders = ids.map((_, i) => `$${i + 2}`).join(',');
    const result = await pool.query(
      `UPDATE analyses SET status = $1, updated_at = NOW() WHERE id IN (${placeholders}) RETURNING id`,
      [status, ...ids]
    );
    res.json({ message: `${result.rowCount} analyses updated`, updatedIds: result.rows.map(r => r.id) });
  } catch (err) {
    console.error('Batch update status error:', err);
    res.status(500).json({ error: 'Failed to batch update' });
  }
});

// POST /api/batch/update-priority
router.post('/update-priority', authMiddleware, async (req, res) => {
  try {
    const { ids, priority } = req.body;
    if (!Array.isArray(ids) || ids.length === 0 || !priority) {
      return res.status(400).json({ error: 'Array of IDs and priority are required' });
    }
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ error: `Priority must be one of: ${validPriorities.join(', ')}` });
    }
    const placeholders = ids.map((_, i) => `$${i + 2}`).join(',');
    const result = await pool.query(
      `UPDATE analyses SET priority = $1, updated_at = NOW() WHERE id IN (${placeholders}) RETURNING id`,
      [priority, ...ids]
    );
    res.json({ message: `${result.rowCount} analyses updated`, updatedIds: result.rows.map(r => r.id) });
  } catch (err) {
    console.error('Batch update priority error:', err);
    res.status(500).json({ error: 'Failed to batch update priority' });
  }
});

module.exports = router;
