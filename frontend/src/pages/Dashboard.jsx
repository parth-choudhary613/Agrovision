import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardMetrics from "../components/DashboardMetrics";
import PlantScanPanel from "../components/PlantScanPanel";
import UpcomingSpraysCard from "../components/UpcomingSpraysCard";
import WeatherAdvisory from "../components/weather/WeatherAdvisory"; // ← NEW: Weather-Based Spray Advisory (isolated module)
const API_URL = import.meta.env.VITE_API_URL;
import { ChevronDown, Plus } from "lucide-react";
import Footer from "../components/Footer";
import.meta.env.VITE_API_URL

const Dashboard = () => {
  const [username, setUsername] = useState("");
  const [picture, setPicture] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [loginType, setLoginType] = useState("");
  const [token, setToken] = useState("");
  const [stats, setStats] = useState(() => {
    // Persist stats across refresh per user
    const saved = localStorage.getItem("agro_stats");
    return saved
      ? JSON.parse(saved)
      : {
          cropsScanned: 0,
          diseasesFound: 0,
          upcomingSprays: 0,
          treatmentsDone: 0,
        };
  });

  const dropdownRef = useRef();
  const scanPanelRef = useRef(); // ← ref to scroll to scan panel
  const [sprayRefreshKey, setSprayRefreshKey] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const isSignup = location.pathname === "/";

  const firstName = username ? username.split(" ")[0] : "";
  const initial = username ? username.charAt(0).toUpperCase() : "?";

  // Scroll to the scan panel when "Scan New Plant" is clicked
  const handleScanNewPlant = () => {
    if (scanPanelRef.current) {
      scanPanelRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      // Also trigger the file input inside the panel
      scanPanelRef.current.dispatchEvent(
        new CustomEvent("triggerScan", { bubbles: true }),
      );
    }
  };

  const refreshStats = useCallback(
    (t) => {
      const tok = t || token;
      if (!tok) return;
      axios
        .get(`${API_URL}/api/scan/stats`, {
          headers: { Authorization: `Bearer ${tok}` },
        })
        .then((r) => {
          if (r.data) {
            const updated = {
              cropsScanned: r.data.cropsScanned ?? 0,
              diseasesFound: r.data.diseasesFound ?? 0,
              upcomingSprays: r.data.upcomingSprays ?? 0,
              treatmentsDone: r.data.treatmentsDone ?? 0,
            };
            setStats(updated);
            localStorage.setItem("agro_stats", JSON.stringify(updated));
          }
        })
        .catch(() => {});
    },
    [token],
  );

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      navigate("/");
      return;
    }
    setToken(t);
    axios
      .get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${t}` },
      })
      .then((r) => {
        setUsername(r.data.username || "");
        setPicture(r.data.picture || "");
        setLoginType(r.data.loginType || "");
        setIsLoggedIn(true);
        refreshStats(t);
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/");
      });
  }, [navigate, refreshStats]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setOpenDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("agro_stats");
    localStorage.removeItem("agro_last_scan");
    navigate("/");
  };

  // Called by PlantScanPanel after a successful scan
  const handleScanComplete = useCallback(
    (data) => {
      // Optimistically update metrics immediately
      setStats((prev) => {
        const updated = {
          ...prev,
          cropsScanned: prev.cropsScanned + 1,
          diseasesFound:
            data.diseaseDetected && data.diseaseDetected !== "Healthy"
              ? prev.diseasesFound + 1
              : prev.diseasesFound,
        };
        localStorage.setItem("agro_stats", JSON.stringify(updated));
        return updated;
      });
      // Then sync with server
      refreshStats();
    },
    [refreshStats],
  );

  // Called by PlantScanPanel after the user confirms a spray schedule
  const handleSprayScheduled = useCallback(() => {
    setSprayRefreshKey((k) => k + 1); // tells UpcomingSpraysCard to refetch
    refreshStats(); // upcomingSprays / treatmentsDone counts may have changed
  }, [refreshStats]);

  // Called by UpcomingSpraysCard when the user marks a specific scheduled
  // spray as done. UpcomingSpraysCard already calls the backend PATCH
  // endpoint to flip that spray's status to "done" (so it can never be
  // marked twice) before calling this — here we just bump the metric by
  // exactly one and persist the new total.
  const handleTreatmentDone = useCallback(() => {
    setStats((prev) => {
      const updated = { ...prev, treatmentsDone: prev.treatmentsDone + 1 };
      localStorage.setItem("agro_stats", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const Avatar = ({ size = "md" }) => {
    const cls = size === "sm" ? "w-9 h-9 text-sm" : "w-11 h-11 text-base";
    return picture ? (
      <img
        src={picture}
        alt="profile"
        referrerPolicy="no-referrer"
        className={`${cls} rounded-full object-cover border border-gray-200 flex-shrink-0`}
      />
    ) : (
      <div
        className={`${cls} rounded-full bg-green-700 text-white flex items-center justify-center font-bold flex-shrink-0`}
      >
        {initial}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] ">
      {/* NAVBAR */}
      <div className="w-full bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 flex items-center justify-between gap-3 sm:gap-4 relative z-40">
        {/* Left Section: Welcome Text */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate tracking-tight">
            Welcome back, {loginType === "phone" ? username : firstName}! 👋
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5 sm:mt-1 truncate">
            Here's what's happening in your farm today.
          </p>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-4 flex-shrink:0">
          {/* User Profile */}
          {isLoggedIn && !isSignup && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpenDropdown(!openDropdown)}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-full sm:rounded-xl hover:bg-gray-100 transition-colors focus:outline-none"
              >
                {/* Ensure Avatar component accepts className or wrap it in a size-constrained div */}
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full overflow-hidden flex-shrink:0">
                  <Avatar size="sm" />
                </div>

                <div className="hidden md:flex flex-col items-start leading-none">
                  <span className="font-semibold text-gray-800 text-sm">
                    {firstName}
                  </span>
                  <span className="text-xs text-gray-500 font-medium mt-0.5">
                    Farmer
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`hidden sm:block text-gray-400 transition-transform duration-200 ${
                    openDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {openDropdown && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 origin-top-right">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      <Avatar size="md" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {username}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        Farmer Account
                      </p>
                    </div>
                  </div>
                  <div className="p-1.5">
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Scan New Plant Button */}
          {/* ✅ FIXED: Mobile = Circle icon button | Desktop = Pill button with text */}
          <button
            onClick={handleScanNewPlant}
            className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white p-2.5 sm:px-4 sm:py-2.5 rounded-full sm:rounded-xl flex items-center justify-center gap-2 text-sm font-semibold shadow-sm hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ml-1 sm:ml-0"
          >
            <Plus size={18} className="sm:hidden" />
            <Plus size={16} className="hidden sm:block" />
            <span className="hidden sm:block">Scan New Plant</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Metrics — receives live stats */}
        <DashboardMetrics stats={stats} />

        {/* Scan panel (left, wider) + Upcoming Spray Reminders (right) — always side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div ref={scanPanelRef} className="w-full lg:col-span-2">
            <PlantScanPanel
              token={token}
              onScanComplete={handleScanComplete}
              onSprayScheduled={handleSprayScheduled}
            />
          </div>
          <div className="lg:col-span-1">
            <UpcomingSpraysCard
              token={token}
              refreshKey={sprayRefreshKey}
              onTreatmentDone={handleTreatmentDone}
            />
          </div>
        </div>

        {/* ── NEW: Weather-Based Spray Advisory — sits below the disease result section, fully self-contained ── */}
        <WeatherAdvisory />
        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;
