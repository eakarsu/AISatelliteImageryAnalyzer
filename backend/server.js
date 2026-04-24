const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const analysesRoutes = require('./routes/analyses');
const dashboardRoutes = require('./routes/dashboard');
const profileRoutes = require('./routes/profile');
const bookmarksRoutes = require('./routes/bookmarks');
const notesRoutes = require('./routes/notes');
const tagsRoutes = require('./routes/tags');
const activityRoutes = require('./routes/activity');
const notificationsRoutes = require('./routes/notifications');
const shareRoutes = require('./routes/share');
const exportRoutes = require('./routes/export');
const uploadRoutes = require('./routes/upload');
const batchRoutes = require('./routes/batch');

// Run migrations on startup
const migrate = require('./migrate');
migrate().catch((err) => console.error('Migration warning:', err.message));

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/analyses', analysesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/bookmarks', bookmarksRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/batch', batchRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

const PORT = process.env.BACKEND_PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
