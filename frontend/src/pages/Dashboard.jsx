import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardMetrics from "../components/DashboardMetrics";
import PlantScanPanel from "../components/PlantScanPanel";

import {
  Bell,
  ChevronDown,
  Languages,
  Plus,
} from "lucide-react";
// import PlantScanPanel from "../components/PlantScanPanel";

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
      : { cropsScanned: 0, diseasesFound: 0, upcomingSprays: 0, treatmentsDone: 0 };
  });

  const dropdownRef = useRef();
  const scanPanelRef = useRef(); // ← ref to scroll to scan panel

  const navigate = useNavigate();
  const location = useLocation();
  const isSignup = location.pathname === "/";

  const firstName = username ? username.split(" ")[0] : "";
  const initial = username ? username.charAt(0).toUpperCase() : "?";

  // Scroll to the scan panel when "Scan New Plant" is clicked
  const handleScanNewPlant = () => {
    if (scanPanelRef.current) {
      scanPanelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      // Also trigger the file input inside the panel
      scanPanelRef.current.dispatchEvent(new CustomEvent("triggerScan", { bubbles: true }));
    }
  };

  const refreshStats = useCallback(
    (t) => {
      const tok = t || token;
      if (!tok) return;
      axios
        .get("http://localhost:5000/api/scan/stats", {
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
    [token]
  );

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      navigate("/");
      return;
    }
    setToken(t);
    axios
      .get("http://localhost:5000/api/auth/me", {
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
    [refreshStats]
  );

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
    <div className="min-h-screen bg-[#f5f5f5] lg:ml-72">
      {/* NAVBAR */}
      <div className="w-full bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 lg:py-5 flex items-center justify-between gap-4 relative z-40">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-black truncate">
            Welcome back, {loginType === "phone" ? username : firstName}! 👋
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
            Here's what's happening in your farm today.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 lg:gap-5 flex-shrink-0">
          <div className="hidden md:flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition">
            <Languages size={17} className="text-gray-500" />
            <span className="font-medium text-gray-600 text-sm">English</span>
            <ChevronDown size={15} className="text-gray-400" />
          </div>

          <div className="relative cursor-pointer p-1">
            <Bell size={21} className="text-gray-600" />
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              3
            </div>
          </div>

          {isLoggedIn && !isSignup && (
            <div className="relative" ref={dropdownRef}>
              <div
                onClick={() => setOpenDropdown(!openDropdown)}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1.5 rounded-xl transition"
              >
                <Avatar />
                <div className="hidden md:block leading-tight">
                  <p className="font-semibold text-gray-800 text-sm">{firstName}</p>
                  <p className="text-xs text-gray-400">Farmer</p>
                </div>
                <ChevronDown
                  size={15}
                  className={`text-gray-400 transition ${openDropdown ? "rotate-180" : ""}`}
                />
              </div>
              {openDropdown && (
                <div className="absolute right-0 top-14 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                    <Avatar size="sm" />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{username}</p>
                      <p className="text-xs text-gray-400">Farmer Account</p>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-50 transition text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ✅ FIXED: Scan New Plant button now scrolls + triggers scan panel */}
          <button
            onClick={handleScanNewPlant}
            className="bg-green-700 hover:bg-green-800 text-white px-4 sm:px-5 py-2.5 rounded-2xl flex items-center gap-2 text-sm font-semibold shadow-md transition"
          >
            <Plus size={17} />
            <span className="hidden sm:block">Scan New Plant</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Metrics — receives live stats */}
        <DashboardMetrics stats={stats} />

        {/* Scan Panel */}
        <div ref={scanPanelRef}>
          <PlantScanPanel token={token} onScanComplete={handleScanComplete} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
