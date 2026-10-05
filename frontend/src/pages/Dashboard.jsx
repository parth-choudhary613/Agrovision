import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardMetrics from "../components/DashboardMetrics";
import PlantScanPanel from "../components/PlantScanPanel";
import UpcomingSpraysCard from "../components/UpcomingSpraysCard";
import WeatherAdvisory from "../components/weather/WeatherAdvisory";
import Footer from "../components/Footer";
import { ChevronDown, Plus, LogOut } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const UserAvatar = ({ size = "md", picture, initial }) => {
  const cls = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return picture ? (
    <img
      src={picture}
      alt="Farmer profile"
      referrerPolicy="no-referrer"
      className={`${cls} rounded-full object-cover border border-[#DCE5DC] shrink-0`}
    />
  ) : (
    <div
      className={`${cls} rounded-full bg-[#1B4332] text-white flex items-center justify-center font-bold shrink-0 shadow-2xs`}
    >
      {initial}
    </div>
  );
};

const Dashboard = () => {
  const [username, setUsername] = useState("");
  const [picture, setPicture] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("token"));
  const [openDropdown, setOpenDropdown] = useState(false);
  const [loginType, setLoginType] = useState("");
  const [token] = useState(() => localStorage.getItem("token") || "");
  const [stats, setStats] = useState(() => {
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
  const scanPanelRef = useRef();
  const [sprayRefreshKey, setSprayRefreshKey] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const isSignup = location.pathname === "/";

  const firstName = username ? username.split(" ")[0] : "";
  const initial = username ? username.charAt(0).toUpperCase() : "F";

  const handleScanNewPlant = () => {
    if (scanPanelRef.current) {
      scanPanelRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      scanPanelRef.current.dispatchEvent(
        new CustomEvent("triggerScan", { bubbles: true })
      );
    }
  };

  const refreshStats = useCallback(
    (tok) => {
      const activeToken = tok || token;
      if (!activeToken) return;
      axios
        .get(`${API_URL}/api/scan/stats`, {
          headers: { Authorization: `Bearer ${activeToken}` },
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
    [token]
  );

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    axios
      .get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => {
        setUsername(r.data.username || "");
        setPicture(r.data.picture || "");
        setLoginType(r.data.loginType || "");
        setIsLoggedIn(true);
        refreshStats(token);
      })
      .catch(() => {
        // Fallback to legacy endpoint if /me fails
        axios
          .get(`${API_URL}/api/auth/user`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((r) => {
            setUsername(r.data.username || "");
            setIsLoggedIn(true);
            refreshStats(token);
          })
          .catch(() => {
            localStorage.removeItem("token");
            navigate("/");
          });
      });
  }, [token, navigate, refreshStats]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
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

  const handleScanComplete = useCallback(
    (data) => {
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
      refreshStats();
    },
    [refreshStats]
  );

  const handleSprayScheduled = useCallback(() => {
    setSprayRefreshKey((k) => k + 1);
    refreshStats();
  }, [refreshStats]);

  const handleTreatmentDone = useCallback(() => {
    setStats((prev) => {
      const updated = { ...prev, treatmentsDone: prev.treatmentsDone + 1 };
      localStorage.setItem("agro_stats", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <div className="space-y-8">
      {/* ── TOPBAR: GREETING & QUICK ACTIONS ── */}
      <div className="bg-white rounded-3xl border border-[#DCE5DC] px-5 sm:px-8 py-5 flex items-center justify-between gap-4 shadow-xs">
        {/* Left Section: Welcome Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#40916C]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#66736B]">
              Active Farm Session
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B4332] truncate mt-1">
            Welcome back, {loginType === "phone" ? username : firstName || "Farmer"}
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#66736B] truncate mt-0.5">
            Here is your crop health overview and spray advisory for today.
          </p>
        </div>

        {/* Right Section: Actions & User Dropdown */}
        <div className="flex items-center gap-3 shrink-0">
          {/* User Profile Dropdown */}
          {isLoggedIn && !isSignup && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpenDropdown(!openDropdown)}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-2xl hover:bg-[#F7F5EE] border border-transparent hover:border-[#DCE5DC] transition-all focus:outline-none"
              >
                <div className="shrink-0">
                  <UserAvatar size="sm" picture={picture} initial={initial} />
                </div>

                <div className="hidden md:flex flex-col items-start leading-none">
                  <span className="font-bold text-xs text-[#26332B]">
                    {firstName || username}
                  </span>
                  <span className="text-[10px] text-[#66736B] font-semibold mt-0.5">
                    Verified Grower
                  </span>
                </div>

                <ChevronDown
                  size={15}
                  className={`hidden sm:block text-[#66736B] transition-transform duration-200 ${
                    openDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {openDropdown && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-[#DCE5DC] overflow-hidden z-50 origin-top-right animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3.5 border-b border-[#DCE5DC] bg-[#F7F5EE] flex items-center gap-3">
                    <UserAvatar size="md" picture={picture} initial={initial} />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[#26332B] text-xs truncate">
                        {username}
                      </p>
                      <p className="text-[10px] text-[#66736B] truncate">
                        Farmer Account
                      </p>
                    </div>
                  </div>
                  <div className="p-1.5">
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2 rounded-xl text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-2 transition-colors"
                    >
                      <LogOut size={14} />
                      <span>Logout Account</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Primary Action Button */}
          <button
            onClick={handleScanNewPlant}
            className="bg-[#1B4332] hover:bg-[#40916C] active:scale-[0.98] text-white p-3 sm:px-5 sm:py-3 rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold shadow-xs transition-all focus:outline-none"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Scan New Plant</span>
          </button>
        </div>
      </div>

      {/* ── METRICS SECTION ── */}
      <DashboardMetrics stats={stats} />

      {/* ── SCAN PANEL & UPCOMING SPRAYS GRID ── */}
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

      {/* ── WEATHER ADVISORY SECTION ── */}
      <WeatherAdvisory />

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
};

export default Dashboard;
