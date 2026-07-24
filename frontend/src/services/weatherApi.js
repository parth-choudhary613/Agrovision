// frontend/src/services/weatherApi.js
//
// ─────────────────────────────────────────────────────────────────────────────
// WEATHER API SERVICE (NEW MODULE — Weather-Based Spray Advisory)
// ─────────────────────────────────────────────────────────────────────────────
// Small, isolated fetch wrapper for the new /api/weather/* backend routes.
// Does not import or depend on any existing scan/treatment API code.
// ─────────────────────────────────────────────────────────────────────────────

// Uses the same backend origin convention as the rest of the app
// (see ScanCrop.jsx / PlantScanPanel.jsx which call http://localhost:5000 directly).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://agrovision-bfjf.onrender.com';

/**
 * Fetch the full spray advisory (weather + sprayScore + recommendation +
 * reasons + bestSprayWindow) for a given latitude/longitude.
 *
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<Object>} parsed JSON response
 * @throws {Error} with a friendly message on failure
 */
export async function fetchSprayAdvisory(lat, lon) {
  const url = `${API_BASE_URL}/api/weather/advisory?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;

  let response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error('Could not reach the server. Please check your connection.');
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Received an invalid response from the server.');
  }

  if (!response.ok || !data.success) {
    throw new Error(data?.error || 'Failed to load weather advisory.');
  }

  return data;
}

/**
 * Wraps the browser Geolocation API in a Promise for easy async/await use.
 * Rejects with a friendly error message on denial/timeout/unsupported.
 */
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(new Error('Location access denied. Please allow location access or enter coordinates manually.'));
        } else {
          reject(new Error('Could not determine your location.'));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  });
}
