// backend/routes/weatherRoutes.js
//
// ─────────────────────────────────────────────────────────────────────────────
// WEATHER ROUTES (NEW MODULE — Weather-Based Spray Advisory)
// ─────────────────────────────────────────────────────────────────────────────
// Mounted at /api/weather in server.js. Completely separate from
// /api/scan and /api/treatment (disease detection feature) — nothing here
// touches or depends on those routes.
//
// NOTE ON AUTH: these endpoints are left public (no `protect` middleware)
// because spray advisory only needs a lat/lon, not a logged-in user. If you
// want to require login (e.g. to log advisory views per farmer), import the
// existing middleware and add it exactly like the other routes do:
//
//   const protect = require('../middleware/auth');
//   router.get('/advisory', protect, getSprayAdvisoryHandler);
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();

const {
  getCurrentWeather,
  getSprayAdvisoryHandler,
} = require('../controllers/weatherController');

// GET /api/weather/current?lat=..&lon=..
// Raw current + hourly + daily weather, no spray-decision logic.
router.get('/current', getCurrentWeather);

// GET /api/weather/advisory?lat=..&lon=..
// Weather + full spray advisory: sprayScore, recommendation, reasons,
// bestSprayWindow. This is the endpoint the frontend WeatherAdvisory
// component calls.
router.get('/advisory', getSprayAdvisoryHandler);

module.exports = router;
