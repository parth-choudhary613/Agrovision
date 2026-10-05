import { useState, useCallback } from "react";
import {
  MapPin,
  RefreshCw,
  AlertCircle,
  CloudOff,
  CloudSunRain,
  Navigation,
} from "lucide-react";
import WeatherCard from "./WeatherCard";
import SprayScore from "./SprayScore";
import {
  fetchSprayAdvisory,
  getCurrentPosition,
} from "../../services/weatherApi";

const WeatherAdvisory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [advisory, setAdvisory] = useState(null);
  const [coords, setCoords] = useState(null);
  const [manualLat, setManualLat] = useState("");
  const [manualLon, setManualLon] = useState("");
  const [showManualEntry, setShowManualEntry] = useState(false);

  const loadAdvisory = useCallback(async (lat, lon) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSprayAdvisory(lat, lon);
      setAdvisory(data);
      setCoords({ lat, lon });
    } catch (err) {
      setError(err.message || "Failed to load weather advisory.");
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
      setError(err.message || "Could not determine your location automatically.");
      setLoading(false);
      setShowManualEntry(true);
    }
  }, [loadAdvisory]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      setError("Please enter valid numeric latitude and longitude coordinates.");
      return;
    }
    loadAdvisory(lat, lon);
  };

  const handleRefresh = () => {
    if (coords) loadAdvisory(coords.lat, coords.lon);
  };

  return (
    <div className="w-full">
      {/* ── STATE 1: LOCATION PROMPT HERO ── */}
      {!advisory && !loading && (
        <div className="relative overflow-hidden rounded-3xl border border-[#DCE5DC] p-8 sm:p-12 bg-white text-center w-full shadow-xs flex flex-col justify-center items-center">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[#95B89A]/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-[#40916C]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 w-full max-w-lg mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F7F5EE] border border-[#DCE5DC] flex items-center justify-center mx-auto text-[#1B4332] shadow-2xs">
              <MapPin size={26} className="text-[#40916C]" />
            </div>

            <div>
              <h3 className="font-serif text-2xl font-bold text-[#1B4332]">
                Synchronize Field Weather
              </h3>
              <p className="font-sans text-sm text-[#66736B] mt-1 max-w-md mx-auto leading-relaxed">
                Connect your farm coordinates to calculate rain wash-off risk,
                chemical drift, and identify optimal spray windows.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleUseMyLocation}
                className="inline-flex items-center justify-center gap-2 bg-[#1B4332] hover:bg-[#40916C] text-white px-7 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-xs active:scale-[0.98]"
              >
                <Navigation size={16} />
                <span>Use Current Farm Location</span>
              </button>
            </div>

            <div>
              <button
                onClick={() => setShowManualEntry((v) => !v)}
                className="text-xs font-semibold text-[#66736B] hover:text-[#1B4332] underline underline-offset-4 transition-colors"
              >
                {showManualEntry
                  ? "Hide coordinate inputs"
                  : "Or enter farm GPS coordinates manually"}
              </button>
            </div>

            {showManualEntry && (
              <form
                onSubmit={handleManualSubmit}
                className="mt-4 pt-4 border-t border-[#DCE5DC] flex flex-col sm:flex-row gap-2.5 justify-center w-full"
              >
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude (e.g. 23.0225)"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  className="bg-[#F7F5EE] border border-[#DCE5DC] rounded-xl px-4 py-2.5 text-xs text-[#26332B] placeholder:text-[#66736B]/60 focus:outline-none focus:border-[#1B4332] w-full sm:w-1/2"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude (e.g. 72.5714)"
                  value={manualLon}
                  onChange={(e) => setManualLon(e.target.value)}
                  className="bg-[#F7F5EE] border border-[#DCE5DC] rounded-xl px-4 py-2.5 text-xs text-[#26332B] placeholder:text-[#66736B]/60 focus:outline-none focus:border-[#1B4332] w-full sm:w-1/2"
                />
                <button
                  type="submit"
                  className="bg-[#1B4332] hover:bg-[#40916C] text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition shadow-xs w-full sm:w-auto shrink-0"
                >
                  Fetch Weather
                </button>
              </form>
            )}

            {error && (
              <div className="mt-3 flex items-center justify-center gap-2 text-rose-700 bg-rose-50 border border-rose-200 py-2.5 px-4 rounded-xl text-xs font-medium">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STATE 2: LOADING ── */}
      {loading && (
        <div className="bg-white rounded-3xl border border-[#DCE5DC] shadow-xs p-12 flex flex-col items-center justify-center gap-3 text-center max-w-xl mx-auto">
          <div className="w-9 h-9 border-3 border-[#1B4332] border-t-transparent rounded-full animate-spin" />
          <p className="font-serif text-lg font-bold text-[#1B4332]">
            Retrieving Live Micro-Climate Data...
          </p>
          <p className="text-xs text-[#66736B]">
            Querying OpenWeather radar for humidity, wind drift, and precipitation probability
          </p>
        </div>
      )}

      {/* ── STATE 3: ERROR AFTER INITIAL LOAD ── */}
      {error && !loading && advisory === null && coords && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 flex items-center gap-3 w-full">
          <CloudOff className="text-rose-600 shrink-0" size={24} />
          <div>
            <p className="text-rose-900 font-semibold text-sm">
              Could not update weather advisory
            </p>
            <p className="text-rose-700 text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* ── STATE 4: ACTIVE WEATHER ADVISORY DASHBOARD ── */}
      {advisory && !loading && (
        <div className="bg-white rounded-3xl border border-[#DCE5DC] shadow-sm p-6 sm:p-8 w-full space-y-8">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DCE5DC]">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#F7F5EE] border border-[#DCE5DC] text-[#1B4332] flex items-center justify-center shrink-0">
                <CloudSunRain size={24} className="text-[#40916C]" />
              </div>
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1B4332]">
                  Weather-Based Spray Safety Advisory
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#66736B] mt-0.5">
                  Real-time spray suitability index based on temperature, wind drift, and rain risk.
                </p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-[#1B4332] hover:text-[#40916C] bg-[#F7F5EE] border border-[#DCE5DC] hover:bg-[#FAF9F5] px-4 py-2.5 rounded-xl transition-all shadow-2xs self-start sm:self-auto shrink-0"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span>Refresh Forecast</span>
            </button>
          </div>

          {/* 4-Metric Weather Conditions */}
          <WeatherCard weather={advisory.weather} />

          {/* Spray Suitability & Reason Checklist */}
          <div className="pt-2">
            <SprayScore
              sprayScore={advisory.sprayScore}
              recommendation={advisory.recommendation}
              recommendationLevel={advisory.recommendationLevel}
              reasons={advisory.reasons}
              bestSprayWindow={advisory.bestSprayWindow}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherAdvisory;