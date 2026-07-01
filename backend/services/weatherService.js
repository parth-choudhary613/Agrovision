// backend/services/weatherService.js
//
// ─────────────────────────────────────────────────────────────────────────────
// WEATHER SERVICE (NEW MODULE — Weather-Based Spray Advisory)
// ─────────────────────────────────────────────────────────────────────────────
// This file is completely independent from the existing disease-detection
// code (backend/utils/kindwise.js). It talks to OpenWeatherMap and returns
// normalised weather data (current + hourly + daily) that the rest of the
// Weather Advisory module can consume.
//
// RESILIENCE NOTE:
// OpenWeatherMap's "One Call API 3.0" requires its own separate subscription
// (even on the free 1,000-calls/day tier) — a plain/free API key alone will
// get a 401 Unauthorized on that endpoint until you subscribe to it at
// https://openweathermap.org/api/one-call-3. New keys can also take up to
// ~2 hours to activate after signup.
//
// To keep the feature working out-of-the-box for any valid OpenWeatherMap
// key, this service tries One Call 3.0 first, and — ONLY on an auth-related
// failure — automatically falls back to the classic free endpoints
// (/data/2.5/weather + /data/2.5/forecast), which every API key can use
// with no extra subscription. Both paths are normalised to the exact same
// output shape, so nothing downstream (sprayAdvisor, controller, frontend)
// needs to know which path was used.
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
const CURRENT_WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

// Request timeout so a slow/unreachable weather API can never hang the server
// or block the disease-detection endpoints (which live on separate routes).
const REQUEST_TIMEOUT_MS = 8000;

/**
 * Fetch current + hourly + daily weather for a given latitude/longitude.
 * Tries One Call API 3.0 first; falls back to the free 2.5 endpoints if
 * One Call rejects the request as unauthorized (missing subscription /
 * not-yet-active key). Any other error (bad coords, network down, rate
 * limit) is thrown as-is without a silent fallback, so real problems are
 * still visible to the caller.
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
  validateCoordinates(lat, lon);

  try {
    return await fetchFromOneCall(lat, lon);
  } catch (err) {
    // Only fall back on auth-type failures (401). Onecall 3.0 without a
    // subscription, or a key that hasn't activated yet, both surface as
    // WEATHER_API_UNAUTHORIZED here.
    if (err.message === 'WEATHER_API_UNAUTHORIZED') {
      console.warn('⚠️  One Call API 3.0 unauthorized (likely missing subscription or inactive key). Falling back to free /data/2.5 endpoints...');
      try {
        const fallbackData = await fetchFromFreeTier(lat, lon);
        fallbackData.dataSource = 'fallback-2.5';
        return fallbackData;
      } catch (fallbackErr) {
        // Surface the fallback's error — it's more informative at this point
        // (e.g. still unauthorized means the KEY ITSELF is invalid, not just
        // missing the One Call subscription).
        throw fallbackErr;
      }
    }
    throw err;
  }
}

function validateCoordinates(lat, lon) {
  if (
    typeof lat !== 'number' || typeof lon !== 'number' ||
    Number.isNaN(lat) || Number.isNaN(lon) ||
    lat < -90 || lat > 90 || lon < -180 || lon > 180
  ) {
    throw new Error('INVALID_COORDINATES');
  }
}

/**
 * Converts an axios error into one of our internal error codes.
 */
function toWeatherError(err) {
  if (err.response) {
    const status = err.response.status;
    const apiMessage = err.response.data?.message;
    if (status === 401) {
      const e = new Error('WEATHER_API_UNAUTHORIZED');
      e.apiMessage = apiMessage;
      return e;
    }
    if (status === 429) return new Error('WEATHER_API_RATE_LIMITED');
    if (status === 404) return new Error('WEATHER_API_NOT_FOUND');
    const e = new Error(`WEATHER_API_ERROR_${status}`);
    e.apiMessage = apiMessage;
    return e;
  }
  if (err.code === 'ECONNABORTED') return new Error('WEATHER_API_TIMEOUT');
  return new Error('WEATHER_API_UNREACHABLE');
}

// ── PRIMARY: One Call API 3.0 ────────────────────────────────────────────────
async function fetchFromOneCall(lat, lon) {
  let response;
  try {
    response = await axios.get(ONE_CALL_URL, {
      params: {
        lat,
        lon,
        appid: OPENWEATHER_API_KEY,
        units: 'metric',            // Celsius, m/s wind
        exclude: 'minutely,alerts', // We only need current, hourly, daily
      },
      timeout: REQUEST_TIMEOUT_MS,
    });
  } catch (err) {
    throw toWeatherError(err);
  }

  const data = response.data;
  if (!data || !data.current) throw new Error('WEATHER_API_EMPTY_RESPONSE');

  return normalizeOneCallPayload(data);
}

// ── FALLBACK: free /data/2.5/weather + /data/2.5/forecast ───────────────────
async function fetchFromFreeTier(lat, lon) {
  let currentRes, forecastRes;
  try {
    [currentRes, forecastRes] = await Promise.all([
      axios.get(CURRENT_WEATHER_URL, {
        params: { lat, lon, appid: OPENWEATHER_API_KEY, units: 'metric' },
        timeout: REQUEST_TIMEOUT_MS,
      }),
      axios.get(FORECAST_URL, {
        params: { lat, lon, appid: OPENWEATHER_API_KEY, units: 'metric' },
        timeout: REQUEST_TIMEOUT_MS,
      }),
    ]);
  } catch (err) {
    throw toWeatherError(err);
  }

  const current = currentRes.data;
  const forecast = forecastRes.data;
  if (!current || !forecast || !Array.isArray(forecast.list)) {
    throw new Error('WEATHER_API_EMPTY_RESPONSE');
  }

  return normalizeFreeTierPayload(current, forecast);
}

/**
 * Normalises a One Call 3.0 response into our stable internal shape.
 */
function normalizeOneCallPayload(raw) {
  return {
    lat: raw.lat,
    lon: raw.lon,
    timezone: raw.timezone,
    timezoneOffsetSeconds: raw.timezone_offset,
    hourlyStepSeconds: 3600, // One Call gives true hourly data
    dataSource: 'onecall-3.0',

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
      // "current" has no rain probability (pop) in OWM's schema; pop only
      // exists on hourly/daily blocks, so we surface the next hour's pop
      // here as the "right now" rain chance.
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

/**
 * Normalises the free-tier /data/2.5/weather + /data/2.5/forecast responses
 * into the SAME shape as normalizeOneCallPayload, so sprayAdvisor and the
 * frontend never need to know which source was used.
 *
 * Limitation: /data/2.5/forecast gives 3-hour steps (not true hourly), for
 * the next 5 days. We expose this via `hourlyStepSeconds: 10800` so
 * sprayAdvisor's spray-window search adapts its math automatically.
 */
function normalizeFreeTierPayload(current, forecast) {
  const timezoneOffsetSeconds = current.timezone ?? forecast.city?.timezone ?? 0;
  const forecastList = forecast.list || [];
  const nextBlock = forecastList[0];

  const hourly = forecastList.map((item) => ({
    dt: item.dt,
    temperature: round1(item.main?.temp),
    humidity: item.main?.humidity,
    windSpeedKmh: round1(msToKmh(item.wind?.speed)),
    rainProbability: Math.round((item.pop || 0) * 100),
    description: item.weather?.[0]?.description || 'N/A',
    icon: item.weather?.[0]?.icon || null,
  }));

  return {
    lat: current.coord?.lat,
    lon: current.coord?.lon,
    timezone: forecast.city?.name || null,
    timezoneOffsetSeconds,
    hourlyStepSeconds: 10800, // 3-hour steps — this endpoint has no true hourly data
    dataSource: 'fallback-2.5',

    current: {
      dt: current.dt,
      temperature: round1(current.main?.temp),
      feelsLike: round1(current.main?.feels_like),
      humidity: current.main?.humidity,
      windSpeedKmh: round1(msToKmh(current.wind?.speed)),
      pressure: current.main?.pressure,
      uvi: null, // not available on this endpoint
      description: current.weather?.[0]?.description || 'N/A',
      icon: current.weather?.[0]?.icon || null,
      // No true "now" rain probability on this endpoint — approximate using
      // the nearest upcoming 3-hour forecast block, same trick as One Call.
      rainProbability: nextBlock ? Math.round((nextBlock.pop || 0) * 100) : 0,
    },

    hourly,

    // Derive a rough daily summary by grouping 3-hour blocks per calendar
    // day (in the location's local time).
    daily: groupForecastIntoDailySummary(forecastList, timezoneOffsetSeconds),
  };
}

function groupForecastIntoDailySummary(forecastList, timezoneOffsetSeconds) {
  const byDate = new Map();

  for (const item of forecastList) {
    const localDate = new Date((item.dt + timezoneOffsetSeconds) * 1000);
    const dateKey = `${localDate.getUTCFullYear()}-${localDate.getUTCMonth()}-${localDate.getUTCDate()}`;

    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, { entries: [], repDt: item.dt, repHourDiff: Infinity });
    }
    const bucket = byDate.get(dateKey);
    bucket.entries.push(item);

    // Prefer the entry closest to local noon as the "representative" block
    // for description/icon/pop, matching how One Call's daily summary reads.
    const localHour = localDate.getUTCHours();
    const hourDiff = Math.abs(localHour - 12);
    if (hourDiff < bucket.repHourDiff) {
      bucket.repHourDiff = hourDiff;
      bucket.repDt = item.dt;
      bucket.repEntry = item;
    }
  }

  return Array.from(byDate.values()).map(({ entries, repDt, repEntry }) => {
    const temps = entries.map((e) => e.main?.temp).filter((t) => t != null);
    const humidities = entries.map((e) => e.main?.humidity).filter((h) => h != null);
    const winds = entries.map((e) => msToKmh(e.wind?.speed)).filter((w) => w != null);
    const pops = entries.map((e) => e.pop || 0);

    return {
      dt: repDt,
      tempDay: round1(repEntry?.main?.temp),
      tempMin: round1(Math.min(...temps)),
      tempMax: round1(Math.max(...temps)),
      humidity: humidities.length ? Math.round(avg(humidities)) : null,
      windSpeedKmh: winds.length ? round1(avg(winds)) : null,
      rainProbability: Math.round(Math.max(...pops) * 100),
      description: repEntry?.weather?.[0]?.description || 'N/A',
      icon: repEntry?.weather?.[0]?.icon || null,
    };
  });
}

function avg(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
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
