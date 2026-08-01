const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://agrovision-uo89.onrender.com";

/**
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<Object>}
 */
export async function fetchSprayAdvisory(lat, lon) {
  const url = `${API_BASE_URL}/api/weather/advisory?lat=${encodeURIComponent(
    lat
  )}&lon=${encodeURIComponent(lon)}`;

  let response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error(
      "Could not reach the server. Please check your connection."
    );
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Received an invalid response from the server.");
  }

  if (!response.ok || !data.success) {
    throw new Error(data?.error || "Failed to load weather advisory.");
  }

  return data;
}

/**
 * Get current user's location
 */
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
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
          reject(
            new Error(
              "Location access denied. Please allow location access or enter coordinates manually."
            )
          );
        } else {
          reject(new Error("Could not determine your location."));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000,
      }
    );
  });
}