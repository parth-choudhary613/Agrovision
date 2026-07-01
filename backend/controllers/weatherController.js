// backend/controllers/weatherController.js
//
// ─────────────────────────────────────────────────────────────────────────────
// WEATHER CONTROLLER (NEW MODULE — Weather-Based Spray Advisory)
// ─────────────────────────────────────────────────────────────────────────────
// Thin HTTP layer: validates input, calls services/weatherService.js +
// utils/sprayAdvisor.js, and shapes the JSON response.
//
// Completely isolated from controllers/logic used by the disease-detection
// feature (backend/routes/scan.js, backend/utils/kindwise.js). If the
// weather API is down or misconfigured, only this route is affected —
// disease detection keeps working normally.
// ─────────────────────────────────────────────────────────────────────────────

const { getWeatherData } = require('../services/weatherService');
const { getSprayAdvisory } = require('../utils/sprayAdvisor');

/**
 * Maps internal error codes (thrown by weatherService) to safe, user-facing
 * messages + HTTP status codes. Never leaks API keys or stack traces.
 */
function mapErrorToResponse(err) {
  const message = err?.message || '';

  switch (message) {
    case 'WEATHER_API_KEY_MISSING':
      return { status: 503, error: 'Weather service is not configured on the server.' };
    case 'INVALID_COORDINATES':
      return { status: 400, error: 'Please provide valid "lat" and "lon" numeric query parameters.' };
    case 'WEATHER_API_UNAUTHORIZED':
      return { status: 502, error: 'Weather provider rejected the request (invalid API key).' };
    case 'WEATHER_API_RATE_LIMITED':
      return { status: 429, error: 'Weather provider rate limit reached. Please try again shortly.' };
    case 'WEATHER_API_TIMEOUT':
      return { status: 504, error: 'Weather provider took too long to respond. Please try again.' };
    case 'WEATHER_API_UNREACHABLE':
      return { status: 502, error: 'Could not reach the weather provider. Please check server network access.' };
    case 'WEATHER_API_EMPTY_RESPONSE':
      return { status: 502, error: 'Weather provider returned an unexpected response.' };
    default:
      return { status: 500, error: 'Failed to fetch weather-based spray advisory.' };
  }
}

/**
 * Parses & validates lat/lon from either query string or JSON body.
 */
function parseCoordinates(req) {
  const source = Object.keys(req.query || {}).length ? req.query : (req.body || {});
  const lat = parseFloat(source.lat);
  const lon = parseFloat(source.lon);
  return { lat, lon };
}

// ── GET /api/weather/current?lat=..&lon=.. ──────────────────────────────────
// Returns raw normalised weather only (no spray advisory calculation).
const getCurrentWeather = async (req, res) => {
  try {
    const { lat, lon } = parseCoordinates(req);
    const weatherData = await getWeatherData(lat, lon);
    return res.json({ success: true, weather: weatherData });
  } catch (err) {
    console.error('Weather Controller (current) Error:', err.message || err);
    const { status, error } = mapErrorToResponse(err);
    return res.status(status).json({ success: false, error });
  }
};

// ── GET /api/weather/advisory?lat=..&lon=.. ─────────────────────────────────
// Returns weather + full spray advisory (score, recommendation, reasons,
// best spray window) — the main endpoint used by the frontend module.
const getSprayAdvisoryHandler = async (req, res) => {
  try {
    const { lat, lon } = parseCoordinates(req);
    const weatherData = await getWeatherData(lat, lon);
    const advisory = getSprayAdvisory(weatherData);

    return res.json({
      success: true,
      weather: weatherData,
      sprayScore: advisory.sprayScore,
      recommendation: advisory.recommendation,
      recommendationLevel: advisory.recommendationLevel,
      reasons: advisory.reasons,
      bestSprayWindow: advisory.bestSprayWindow,
    });
  } catch (err) {
    console.error('Weather Controller (advisory) Error:', err.message || err);
    const { status, error } = mapErrorToResponse(err);
    return res.status(status).json({ success: false, error });
  }
};

module.exports = {
  getCurrentWeather,
  getSprayAdvisoryHandler,
};
