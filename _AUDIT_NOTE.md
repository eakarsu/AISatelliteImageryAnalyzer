# Audit Note — AISatelliteImageryAnalyzer

## Original audit recommendations (batch_07.md §24)

**Missing AI endpoints:** `/change-detection`, `/object-detection`, `/vegetation-index`, `/cloud-removal`, `/temporal-analysis`, `/area-calculation`.

**Missing non-AI features:** map integration, geospatial export, layer management, ROI drawing, Planet/Maxar/Sentinel API integration.

**Custom suggestions:** automated change detection, AI asset inventory, crop health monitoring, urban planning intel, disaster damage assessment, environmental monitoring.

Note: audit said "0 AI endpoints"; reality has `POST /api/analyses/:id/ai-analyze`, `POST /api/compare`, `POST /api/compare/batch` plus a 9-category vision pipeline (`satellite-image-analysis`, `land-use-classification`, `change-detection`, `crop-health-monitoring`, `urban-planning`, `climate-impact`, `defense-security`, `water-body-analysis`, `vegetation-index`).

## Implemented this pass (3 mechanical)
1. `POST /api/imagery-ai/change-detection` — compare two persisted analyses (before/after) using existing change-detection category prompt.
2. `POST /api/imagery-ai/vegetation-index` — NDVI / crop-health AI for an existing analysis.
3. `POST /api/imagery-ai/area-calculation` — measure features (buildings, water, vegetation, roads) with optional scale.

Added new file `backend/routes/imageryAi.js`, mounted under `/api/imagery-ai`. Reuses existing `analyzeWithAI`, `parseAIJson`, auth + AI rate limiter. Syntax-checked.

## Backlog (prioritized)
1. `POST /api/imagery-ai/object-detection` (mechanical follow-up — uses an `object-detection` category prompt).
2. `POST /api/imagery-ai/temporal-analysis` (mechanical — multi-step over timeline).
3. `POST /api/imagery-ai/cloud-removal` (NEEDS-PRODUCT-DECISION + image-processing model choice).
4. Map / Leaflet / Mapbox integration (mechanical, NEEDS-PRODUCT-DECISION).
5. Imagery provider integrations (Planet, Maxar, Sentinel) — NEEDS-CREDS.

## Apply pass 3 (frontend)

LEFT-AS-IS. The Vite/React frontend already calls each apply2 endpoint:
- `pages/VegetationIndexPage.jsx` → `POST /imagery-ai/vegetation-index`.
- `pages/AreaCalculationPage.jsx` → `POST /imagery-ai/area-calculation`.
- `pages/ChangeDetectionPage.jsx` → `POST /compare` (canonical comparison endpoint).
- `App.jsx` registers all three routes; `Header.jsx` exposes nav entries.
- Axios client adds `Authorization: Bearer ${localStorage.getItem('token')}`.

Backend route registration verified at `backend/server.js:56`. Idempotent; no FE changes required. See `_AUDIT/apply3_logs/ab3_75.md`.

## Apply pass 4 (mechanical backlog)

Cleared the two remaining mechanical backlog items (under the 5/project cap):

- `POST /api/imagery-ai/object-detection` — reuses the existing `infrastructure-detection` category prompt to catalog buildings/roads/vehicles/bridges/towers/etc. on a persisted analysis.
- `POST /api/imagery-ai/temporal-analysis` — accepts an array of analysis ids, auto-sorts oldest→newest, and runs the `change-detection` prompt over the timeline; returns ordered_steps + temporal_analysis.

Also retrofitted `imageryAi.js` with `handleAiError(err, res, ...)` so that all 5 imagery-AI endpoints now return **503 (noKey)** when `OPENROUTER_API_KEY` is missing, instead of leaking a 500.

New FE pages mirror existing styling/auth/deps:
- `frontend/src/pages/ObjectDetectionPage.jsx` (route `/object-detection`).
- `frontend/src/pages/TemporalAnalysisPage.jsx` (route `/temporal-analysis`).
Both registered in `App.jsx` behind `<ProtectedRoute>`, use the existing `api/client` (Bearer JWT), explicit 503 banner, and `react-hot-toast` errors. No new deps. esbuild syntax-check passes for all three modified/created JSX files.

Remaining backlog stays deferred: cloud-removal (NEEDS-PRODUCT-DECISION + image-processing model choice); Leaflet/Mapbox map integration; Planet/Maxar/Sentinel provider integrations (NEEDS-CREDS).
