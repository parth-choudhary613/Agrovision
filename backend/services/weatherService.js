// backend/services/weatherService.js
//
// ─────────────────────────────────────────────────────────────────────────────
// WEATHER SERVICE (NEW MODULE — Weather-Based Spray Advisory)
// ─────────────────────────────────────────────────────────────────────────────
// This file is completely independent from the existing disease-detection
// code (backend/utils/kindwise.js). It talks to the OpenWeatherMap "One Call
// API 3.0" endpoint and returns normalised weather data (current + hourly +
// daily) that the rest of the Weather Advisory module can consume.
//
// Nothing in this file touches Scan.js, Treatment.js, kindwise.js, or any
// existing route. It can be deleted without breaking any other feature.
// ─────────────────────────────────────────────────────────────────────────────

const axios = require('axios');

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
if (!OPENWEATHER_API_KEY) {
  // We only warn (not throw) so that the rest of the server — including the
  // disease detection feature — keeps working even if this key is missing.
  console.error('⚠️  OPENWEATHER_API_KEY missing in .env — Weather Advisory feature will be unavailable.');
}

const ONE_CALL_URL = 'https://api.openweathermap.org/data/3.0/onecall';

// Request timeout so a slow/unreachable weather API can never hang the server
// or block the disease-detection endpoints (which live on separate routes).
const REQUEST_TIMEOUT_MS = 8000;

/**
 * Fetch current + hourly + daily weather for a given latitude/longitude.
 *
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} normalised weather payload
 * @throws {Error} with a descriptive message on failure — always caught by
 *                 the controller so it never crashes the server.
 */
async function getWeatherData(lat, lon) {
  if (!OPENWEATHER_API_KEY) {
    throw new Error('WEATHER_API_KEY_MISSING');
  }

  if (
    typeof lat !== 'number' || typeof lon !== 'number' ||
    Number.isNaN(lat) || Number.isNaN(lon) ||
    lat < -90 || lat > 90 || lon < -180 || lon > 180
  ) {
    throw new Error('INVALID_COORDINATES');
  }

  let response;
  try {
    response = await axios.get(ONE_CALL_URL, {
      params: {
        lat,
        lon,
        appid: OPENWEATHER_API_KEY,
        units: 'metric',          // Celsius, m/s wind
        exclude: 'minutely,alerts', // We only need current, hourly, daily
      },
      timeout: REQUEST_TIMEOUT_MS,
    });
  } catch (err) {
    if (err.response) {
      // OpenWeatherMap responded with an error status (401, 429, etc.)
      const status = err.response.status;
      if (status === 401) throw new Error('WEATHER_API_UNAUTHORIZED');
      if (status === 429) throw new Error('WEATHER_API_RATE_LIMITED');
      throw new Error(`WEATHER_API_ERROR_${status}`);
    }
    if (err.code === 'ECONNABORTED') throw new Error('WEATHER_API_TIMEOUT');
    throw new Error('WEATHER_API_UNREACHABLE');
  }

  const data = response.data;
  if (!data || !data.current) {
    throw new Error('WEATHER_API_EMPTY_RESPONSE');
  }

  return normalizeWeatherPayload(data);
}

/**
 * Normalises the raw OpenWeatherMap response into a clean, stable shape so
 * the rest of our app (sprayAdvisor + frontend) never depends on OWM's raw
 * field names directly. This makes it easy to swap weather providers later.
 */
function normalizeWeatherPayload(raw) {
  return {
    lat: raw.lat,
    lon: raw.lon,
    timezone: raw.timezone,
    timezoneOffsetSeconds: raw.timezone_offset,

    current: {
      dt: raw.current.dt,
      temperature: round1(raw.current.temp),
      feelsLike: round1(raw.current.feels_like),
      humidity: raw.current.humidity,
      windSpeedKmh: round1(msToKmh(raw.current.wind_speed)),
      pressure: raw.current.pressure,
      uvi: raw.current.uvi,
      description: raw.current.weather?.[0]?.description || 'N/A',
      icon: raw.current.weather?.[0]?.icon || null,
      // OpenWeatherMap's "current" block has no rain probability (pop);
      // pop only exists on hourly/daily blocks. We surface the next hour's
      // pop here as the "right now" rain chance for convenience.
      rainProbability: raw.hourly?.[0]?.pop != null ? Math.round(raw.hourly[0].pop * 100) : 0,
    },

    // Next 48 hours (OpenWeatherMap returns 48 hourly entries)
    hourly: (raw.hourly || []).map((h) => ({
      dt: h.dt,
      temperature: round1(h.temp),
      humidity: h.humidity,
      windSpeedKmh: round1(msToKmh(h.wind_speed)),
      rainProbability: Math.round((h.pop || 0) * 100),
      description: h.weather?.[0]?.description || 'N/A',
      icon: h.weather?.[0]?.icon || null,
    })),

    // Next 7-8 days
    daily: (raw.daily || []).map((d) => ({
      dt: d.dt,
      tempDay: round1(d.temp?.day),
      tempMin: round1(d.temp?.min),
      tempMax: round1(d.temp?.max),
      humidity: d.humidity,
      windSpeedKmh: round1(msToKmh(d.wind_speed)),
      rainProbability: Math.round((d.pop || 0) * 100),
      description: d.weather?.[0]?.description || 'N/A',
      icon: d.weather?.[0]?.icon || null,
    })),
  };
}

function msToKmh(metersPerSecond) {
  if (metersPerSecond == null) return 0;
  return metersPerSecond * 3.6;
}

function round1(n) {
  if (n == null || Number.isNaN(n)) return null;
  return Math.round(n * 10) / 10;
}

module.exports = { getWeatherData };
