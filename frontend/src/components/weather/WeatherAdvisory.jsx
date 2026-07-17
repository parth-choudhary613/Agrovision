// frontend/src/components/weather/WeatherAdvisory.jsx
import React, { useState, useCallback } from 'react';
import { MapPin, RefreshCw, AlertCircle, CloudOff, CloudSunRain } from 'lucide-react';
import WeatherCard from './WeatherCard';
import SprayScore from './SprayScore';
import Locationsvg from "./PlantScan.json";
import { fetchSprayAdvisory, getCurrentPosition } from '../../services/weatherApi';

const WeatherAdvisory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [advisory, setAdvisory] = useState(null);
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
    <div className="relative mt-8 mb-8 overflow-hidden">
      
      {/* ── Initial state: prompt for location ─────────────────────────── */}
       <div className="absolute inset-0 -z-10 opacity-20 pointer-events-none">
     <Lottie
          animationData={Locationsvg}   // ← This should now work
          loop={true}
          autoplay={true}
          className="w-full h-full"
          // Optional: Add these for better control
          // speed={0.8}
          // style={{ width: '100%', height: '100%' }}
        />
    </div> 
      {!advisory && !loading && (
    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 text-center max-w-full">
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
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-10 flex flex-col items-center gap-4 max-w-2xl">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Fetching live weather data...</p>
        </div>
      )}

      {/* ── Error state (after a previous successful load, or manual retry) ── */}
      {error && !loading && advisory === null && coords && (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-6 flex items-center gap-3 max-w-2xl">
          <CloudOff className="text-red-500 flex-shrink-0" size={22} />
          <div>
            <p className="text-red-700 font-semibold text-sm">Could not load weather advisory</p>
            <p className="text-red-500 text-sm mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* ── Success state (The Unified Card) ────────────────────────────── */}
      {advisory && !loading && (
        <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 sm:p-10 w-full">
          
          {/* Unified Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                 <CloudSunRain size={28} strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Weather-Based Spray Advisory</h2>
                <p className="text-sm sm:text-base text-gray-500 mt-1">
                  Know if it's safe to spray right now, based on live weather conditions.
                </p>
              </div>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white border border-gray-200 hover:bg-gray-50 px-5 py-2.5 rounded-xl transition-all disabled:opacity-50 flex-shrink-0 shadow-sm"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* Current Weather Section */}
          <WeatherCard weather={advisory.weather} />
          
          {/* Divider */}
          <hr className="my-10 border-gray-100" />
          
          {/* Advisory & Reasoning Section */}
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