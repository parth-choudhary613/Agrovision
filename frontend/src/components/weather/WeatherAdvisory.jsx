// frontend/src/components/weather/WeatherAdvisory.jsx
//
// NEW COMPONENT — Weather-Based Spray Advisory module.
// This is the main container: it gets the user's location (or a manually
// entered lat/lon), calls the backend advisory endpoint, and renders
// WeatherCard + SprayScore. It is designed to be dropped in anywhere
// (e.g. below the disease-detection result) without needing any props from
// the parent page.
//
// IMPORTANT: This component is fully isolated. If the weather API key is
// missing, the network is down, or geolocation is denied, only this section
// shows an error/fallback UI — it never throws in a way that could break
// the rest of the Dashboard or the disease-detection feature.

import React, { useState, useCallback } from 'react';
import { MapPin, RefreshCw, AlertCircle, CloudOff } from 'lucide-react';
import WeatherCard from './WeatherCard';
import SprayScore from './SprayScore';
import { fetchSprayAdvisory, getCurrentPosition } from '../../services/weatherApi';

const WeatherAdvisory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [advisory, setAdvisory] = useState(null); // full backend response
  const [coords, setCoords] = useState(null);
  const [manualLat, setManualLat] = useState('');
  const [manualLon, setManualLon] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);

  const loadAdvisory = useCallback(async (lat, lon) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSprayAdvisory(lat, lon);
      setAdvisory(data);
      setCoords({ lat, lon });
    } catch (err) {
      setError(err.message || 'Failed to load weather advisory.');
      setAdvisory(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUseMyLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { lat, lon } = await getCurrentPosition();
      await loadAdvisory(lat, lon);
    } catch (err) {
      setError(err.message || 'Could not determine your location.');
      setLoading(false);
      setShowManualEntry(true);
    }
  }, [loadAdvisory]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      setError('Please enter valid numeric latitude and longitude.');
      return;
    }
    loadAdvisory(lat, lon);
  };

  const handleRefresh = () => {
    if (coords) loadAdvisory(coords.lat, coords.lon);
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">🌦️ Weather-Based Spray Advisory</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Know if it's safe to spray right now, based on live weather conditions.
          </p>
        </div>
        {advisory && (
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-xl transition disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        )}
      </div>

      {/* ── Initial state: prompt for location ─────────────────────────── */}
      {!advisory && !loading && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
          <MapPin className="mx-auto text-green-600 mb-3" size={32} />
          <p className="text-gray-600 font-medium mb-4">
            Enable location access to get a spray advisory for your field.
          </p>
          <button
            onClick={handleUseMyLocation}
            className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-2xl font-semibold inline-flex items-center gap-2 transition"
          >
            <MapPin size={16} />
            Use My Location
          </button>

          <div className="mt-4">
            <button
              onClick={() => setShowManualEntry((v) => !v)}
              className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2"
            >
              {showManualEntry ? 'Hide manual entry' : 'Enter coordinates manually instead'}
            </button>
          </div>

          {showManualEntry && (
            <form onSubmit={handleManualSubmit} className="mt-4 flex flex-col sm:flex-row gap-2 justify-center max-w-md mx-auto">
              <input
                type="number" step="any" placeholder="Latitude" value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-full sm:w-32 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="number" step="any" placeholder="Longitude" value={manualLon}
                onChange={(e) => setManualLon(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-full sm:w-32 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
              >
                Get Advisory
              </button>
            </form>
          )}

          {error && (
            <div className="mt-4 flex items-center justify-center gap-2 text-red-500 text-sm">
              <AlertCircle size={15} />
              {error}
            </div>
          )}
        </div>
      )}

      {/* ── Loading state ───────────────────────────────────────────────── */}
      {loading && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Fetching latest weather data...</p>
        </div>
      )}

      {/* ── Error state (after a previous successful load, or manual retry) ── */}
      {error && !loading && advisory === null && coords && (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-6 flex items-center gap-3">
          <CloudOff className="text-red-500 flex-shrink-0" size={22} />
          <div>
            <p className="text-red-700 font-semibold text-sm">Could not load weather advisory</p>
            <p className="text-red-500 text-sm mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* ── Success state ───────────────────────────────────────────────── */}
      {advisory && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WeatherCard weather={advisory.weather} />
          <SprayScore
            sprayScore={advisory.sprayScore}
            recommendation={advisory.recommendation}
            recommendationLevel={advisory.recommendationLevel}
            reasons={advisory.reasons}
            bestSprayWindow={advisory.bestSprayWindow}
          />
        </div>
      )}
    </div>
  );
};

export default WeatherAdvisory;
