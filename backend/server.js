const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

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
const compareRoutes = require('./routes/compare');
const timelineRoutes = require('./routes/timeline');

// Run migrations on startup
const migrate = require('./migrate');
migrate().catch((err) => console.error('Migration warning:', err.message));

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// Serve uploaded images statically
app.use('/uploads', require('express').static(require('path').join(__dirname, 'uploads')));

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
app.use('/api/compare', compareRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/imagery-ai', require('./routes/imageryAi'));

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

// AI feature mount: change-detection
app.use('/api/ai/change-detection', require('./routes/ai-change-detection'));
// === Batch 07 Gaps & Frontend Mounts ===
app.use('/api/gap-no-changedetection-beforeafter', require('./routes/gap-no-changedetection-beforeafter'));
app.use('/api/gap-no-objectdetection-buildings-roads-vehicles', require('./routes/gap-no-objectdetection-buildings-roads-vehicles'));
app.use('/api/gap-no-vegetationindex-ndvi-crop-health', require('./routes/gap-no-vegetationindex-ndvi-crop-health'));
app.use('/api/gap-no-cloudremoval', require('./routes/gap-no-cloudremoval'));
app.use('/api/gap-no-temporalanalysis-multidate-trends', require('./routes/gap-no-temporalanalysis-multidate-trends'));
app.use('/api/gap-no-areacalculation-measure-features', require('./routes/gap-no-areacalculation-measure-features'));
app.use('/api/gap-no-segmentationclassification-models', require('./routes/gap-no-segmentationclassification-models'));
app.use('/api/gap-no-map-integration-leafletmapbox-backend-lay', require('./routes/gap-no-map-integration-leafletmapbox-backend-lay'));
app.use('/api/gap-no-geospatial-export-geotiff-shapefiles', require('./routes/gap-no-geospatial-export-geotiff-shapefiles'));
app.use('/api/gap-no-layer-managementoverlay-system', require('./routes/gap-no-layer-managementoverlay-system'));
app.use('/api/gap-no-roi-drawingmeasurement-persistence', require('./routes/gap-no-roi-drawingmeasurement-persistence'));
app.use('/api/gap-no-imagery-provider-api-planet-maxar-sentine', require('./routes/gap-no-imagery-provider-api-planet-maxar-sentine'));
app.use('/api/gap-no-webhook-delivery-for-completed-batch-jobs', require('./routes/gap-no-webhook-delivery-for-completed-batch-jobs'));
// === End Batch 07 ===
