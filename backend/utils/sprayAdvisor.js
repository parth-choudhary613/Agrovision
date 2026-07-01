// backend/utils/sprayAdvisor.js
//
// ─────────────────────────────────────────────────────────────────────────────
// SPRAY ADVISOR (NEW MODULE — Weather-Based Spray Advisory)
// ─────────────────────────────────────────────────────────────────────────────
// Pure decision-logic utility. Takes normalised weather data (produced by
// services/weatherService.js) and returns a spray-safety verdict.
//
// This file has ZERO dependency on Express, Mongo, or any existing module —
// it only takes plain JS objects in and returns plain JS objects out, which
// makes it trivial to unit test in isolation.
// ─────────────────────────────────────────────────────────────────────────────

// ── Threshold constants (kept in one place for easy tuning) ─────────────────
const THRESHOLDS = {
  RAIN_PROBABILITY_UNSAFE: 40,   // % — above this, spraying is not recommended
  WIND_SPEED_UNSAFE_KMH: 15,     // km/h — above this, spraying is not recommended
  HUMIDITY_GOOD_MIN: 40,         // %
  HUMIDITY_GOOD_MAX: 80,         // %
  HUMIDITY_WARNING: 90,          // % — above this, humidity is a warning
  TEMP_IDEAL_MIN: 18,            // °C
  TEMP_IDEAL_MAX: 30,            // °C
  TEMP_WARNING: 35,              // °C — above this, temperature is a warning
};

const PENALTIES = {
  RAIN_EXPECTED: 40,
  WIND_HIGH: 30,
  HUMIDITY_TOO_HIGH: 20,
  EXTREME_TEMPERATURE: 10,
};

/**
 * Evaluate a single weather "snapshot" (current or one hourly entry) against
 * the spray-safety rules and return a per-factor breakdown.
 *
 * @param {{temperature:number, humidity:number, windSpeedKmh:number, rainProbability:number}} snapshot
 */
function evaluateSnapshot(snapshot) {
  const { temperature, humidity, windSpeedKmh, rainProbability } = snapshot;

  let score = 100;
  const reasons = [];
  let hardBlock = false; // rain or wind → always "Not Recommended" regardless of score

  // ── Rain probability ───────────────────────────────────────────────────
  if (rainProbability > THRESHOLDS.RAIN_PROBABILITY_UNSAFE) {
    score -= PENALTIES.RAIN_EXPECTED;
    hardBlock = true;
    reasons.push({
      type: 'danger',
      message: `Rain probability is ${rainProbability}% (above ${THRESHOLDS.RAIN_PROBABILITY_UNSAFE}%) — spray will likely be washed off.`,
    });
  } else {
    reasons.push({
      type: 'good',
      message: `Rain probability is low (${rainProbability}%) — safe from wash-off.`,
    });
  }

  // ── Wind speed ──────────────────────────────────────────────────────────
  if (windSpeedKmh > THRESHOLDS.WIND_SPEED_UNSAFE_KMH) {
    score -= PENALTIES.WIND_HIGH;
    hardBlock = true;
    reasons.push({
      type: 'danger',
      message: `Wind speed is ${windSpeedKmh} km/h (above ${THRESHOLDS.WIND_SPEED_UNSAFE_KMH} km/h) — risk of spray drift.`,
    });
  } else {
    reasons.push({
      type: 'good',
      message: `Wind speed is calm (${windSpeedKmh} km/h) — minimal drift risk.`,
    });
  }

  // ── Humidity ────────────────────────────────────────────────────────────
  if (humidity > THRESHOLDS.HUMIDITY_WARNING) {
    score -= PENALTIES.HUMIDITY_TOO_HIGH;
    reasons.push({
      type: 'warning',
      message: `Humidity is very high (${humidity}%) — increased risk of fungal spread and slow drying.`,
    });
  } else if (humidity >= THRESHOLDS.HUMIDITY_GOOD_MIN && humidity <= THRESHOLDS.HUMIDITY_GOOD_MAX) {
    reasons.push({
      type: 'good',
      message: `Humidity is in the ideal range (${THRESHOLDS.HUMIDITY_GOOD_MIN}–${THRESHOLDS.HUMIDITY_GOOD_MAX}%) at ${humidity}%.`,
    });
  } else {
    reasons.push({
      type: 'neutral',
      message: `Humidity is ${humidity}%, outside the ideal ${THRESHOLDS.HUMIDITY_GOOD_MIN}–${THRESHOLDS.HUMIDITY_GOOD_MAX}% range.`,
    });
  }

  // ── Temperature ─────────────────────────────────────────────────────────
  if (temperature > THRESHOLDS.TEMP_WARNING) {
    score -= PENALTIES.EXTREME_TEMPERATURE;
    reasons.push({
      type: 'warning',
      message: `Temperature is high (${temperature}°C, above ${THRESHOLDS.TEMP_WARNING}°C) — risk of leaf scorch and rapid evaporation.`,
    });
  } else if (temperature >= THRESHOLDS.TEMP_IDEAL_MIN && temperature <= THRESHOLDS.TEMP_IDEAL_MAX) {
    reasons.push({
      type: 'good',
      message: `Temperature is ideal for spraying (${THRESHOLDS.TEMP_IDEAL_MIN}–${THRESHOLDS.TEMP_IDEAL_MAX}°C) at ${temperature}°C.`,
    });
  } else {
    reasons.push({
      type: 'neutral',
      message: `Temperature is ${temperature}°C, outside the ideal ${THRESHOLDS.TEMP_IDEAL_MIN}–${THRESHOLDS.TEMP_IDEAL_MAX}°C range.`,
    });
  }

  score = Math.max(0, Math.min(100, score));

  return { score, reasons, hardBlock };
}

/**
 * Turn a numeric score + hardBlock flag into a human-readable recommendation.
 */
function scoreToRecommendation(score, hardBlock) {
  if (hardBlock || score < 50) {
    return { label: 'Not Recommended', level: 'red' };
  }
  if (score < 80) {
    return { label: 'Caution — Marginal Conditions', level: 'yellow' };
  }
  return { label: 'Recommended', level: 'green' };
}

/**
 * A single hourly entry is considered "safe" (usable inside a spray window)
 * if it does not trip either hard-block rule (rain or wind).
 */
function isHourSafe(hour) {
  return (
    hour.rainProbability <= THRESHOLDS.RAIN_PROBABILITY_UNSAFE &&
    hour.windSpeedKmh <= THRESHOLDS.WIND_SPEED_UNSAFE_KMH
  );
}

/**
 * Search the hourly (or 3-hour, when running on the fallback data source)
 * forecast for the first continuous block of at least `windowSizeHours`
 * that is entirely "safe" (see isHourSafe). Returns a human-friendly label
 * such as "Tomorrow 6:00 AM - 8:00 AM", or null if no such window exists
 * within the provided forecast horizon.
 *
 * @param {Array} hourly - array of normalised forecast entries (see weatherService)
 * @param {number} timezoneOffsetSeconds - location's UTC offset, from OWM
 * @param {number} windowSizeHours - minimum length of the required safe window (default 2)
 * @param {number} stepSeconds - seconds between consecutive `hourly` entries
 *                                (3600 for true hourly data, 10800 for the
 *                                free-tier 3-hour fallback forecast)
 */
function findBestSprayWindow(hourly, timezoneOffsetSeconds = 0, windowSizeHours = 2, stepSeconds = 3600) {
  if (!Array.isArray(hourly) || hourly.length === 0) return null;

  // How many consecutive entries are needed to cover at least windowSizeHours,
  // given the actual spacing between entries. E.g. windowSizeHours=2 with
  // hourly (3600s) data → 2 slots. windowSizeHours=2 with 3-hour (10800s)
  // fallback data → 1 slot already covers 3 hours, which is >= 2 hours.
  const slots = Math.max(1, Math.ceil((windowSizeHours * 3600) / stepSeconds));
  if (hourly.length < slots) return null;

  for (let i = 0; i <= hourly.length - slots; i++) {
    const slice = hourly.slice(i, i + slots);
    if (slice.every(isHourSafe)) {
      const startUnix = slice[0].dt;
      const endUnix = startUnix + slots * stepSeconds;
      return formatWindowLabel(startUnix, endUnix, timezoneOffsetSeconds);
    }
  }
  return null; // No safe window found in the available forecast horizon
}

/**
 * Formats a start/end unix timestamp pair into something like
 * "Tomorrow 6:00 AM - 8:00 AM", using the location's own timezone offset
 * (not the server's timezone) so the label is meaningful to the farmer.
 */
function formatWindowLabel(startUnix, endUnix, timezoneOffsetSeconds) {
  const MS = 1000;

  // Shift "now" and the target times into the location's local time by
  // applying the timezone offset, then reading UTC getters on the shifted
  // date — this avoids depending on the server's own local timezone.
  const toLocal = (unixSeconds) => new Date((unixSeconds + timezoneOffsetSeconds) * MS);

  const nowLocal = toLocal(Math.floor(Date.now() / MS));
  const startLocal = toLocal(startUnix);
  const endLocal = toLocal(endUnix);

  const dayLabel = getRelativeDayLabel(nowLocal, startLocal);
  const startTime = formatHour(startLocal);
  const endTime = formatHour(endLocal);

  return `${dayLabel} ${startTime} - ${endTime}`;
}

function getRelativeDayLabel(nowLocal, targetLocal) {
  const oneDayMs = 24 * 3600 * 1000;
  const nowMidnight = Date.UTC(nowLocal.getUTCFullYear(), nowLocal.getUTCMonth(), nowLocal.getUTCDate());
  const targetMidnight = Date.UTC(targetLocal.getUTCFullYear(), targetLocal.getUTCMonth(), targetLocal.getUTCDate());
  const diffDays = Math.round((targetMidnight - nowMidnight) / oneDayMs);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  return targetLocal.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
}

function formatHour(dateUtcShifted) {
  let hours = dateUtcShifted.getUTCHours();
  const minutes = dateUtcShifted.getUTCMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const minuteStr = minutes.toString().padStart(2, '0');
  return `${hours}:${minuteStr} ${ampm}`;
}

/**
 * Main entry point: given normalised weather data (from weatherService),
 * return the full spray advisory payload described in the module spec.
 *
 * @param {Object} weatherData - normalised payload from weatherService.getWeatherData
 * @returns {{sprayScore:number, recommendation:Object, reasons:Array, bestSprayWindow:string|null}}
 */
function getSprayAdvisory(weatherData) {
  const { current, hourly, timezoneOffsetSeconds, hourlyStepSeconds } = weatherData;

  const { score, reasons, hardBlock } = evaluateSnapshot({
    temperature: current.temperature,
    humidity: current.humidity,
    windSpeedKmh: current.windSpeedKmh,
    rainProbability: current.rainProbability,
  });

  const recommendation = scoreToRecommendation(score, hardBlock);
  const bestSprayWindow = findBestSprayWindow(hourly, timezoneOffsetSeconds, 2, hourlyStepSeconds || 3600);

  return {
    sprayScore: score,
    recommendation: recommendation.label,
    recommendationLevel: recommendation.level, // 'green' | 'yellow' | 'red'
    reasons,
    bestSprayWindow: bestSprayWindow || 'No safe spray window found in the next 48 hours',
  };
}

module.exports = {
  getSprayAdvisory,
  evaluateSnapshot,
  findBestSprayWindow,
  THRESHOLDS,
  PENALTIES,
};
