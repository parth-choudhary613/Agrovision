import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Menu, X, ArrowRight, LogOut, User } from "lucide-react";
import agroIcon from "../assets/agrovisionicon.png";

const API_URL = import.meta.env.VITE_API_URL;

const Navbar = ({ onAuthClick }) => {
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("token"));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isSignupPage = location.pathname === "/";

  useEffect(() => {
    let ignore = false;
    const token = localStorage.getItem("token");

    if (token) {
      axios
        .get(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          if (!ignore) {
            setUsername(res.data.username || "Farmer");
            setIsLoggedIn(true);
          }
        })
        .catch(() => {
          // Fallback to legacy endpoint if /me fails
          axios
            .get(`${API_URL}/api/auth/user`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
              if (!ignore) {
                setUsername(res.data.username || "Farmer");
                setIsLoggedIn(true);
              }
            })
            .catch(() => {
              if (!ignore) {
                localStorage.removeItem("token");
                setIsLoggedIn(false);
              }
            });
        });
    }

    return () => {
      ignore = true;
    };
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("agro_stats");
    localStorage.removeItem("agro_last_scan");
    setIsLoggedIn(false);
    navigate("/");
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    if (!isSignupPage) {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#DCE5DC] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* LEFT: Brand Logo & Title */}
        <Link
          to={isLoggedIn ? "/dashboard" : "/"}
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#F7F5EE] border border-[#DCE5DC] flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-105">
            <img
              src={agroIcon}
              alt="AgroVision Leaf Logo"
              className="w-7 h-7 object-contain"
            />
          </div>
          <div>
            <span className="font-serif text-2xl font-bold text-[#1B4332] tracking-tight block leading-none">
              AgroVision
            </span>
            <span className="font-sans text-[10px] text-[#66736B] font-semibold uppercase tracking-wider block mt-0.5">
              Precision Agriculture
            </span>
          </div>
        </Link>

        {/* CENTER: Navigation Links (Desktop) */}
        {isSignupPage ? (
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("features")}
              className="text-sm font-medium text-[#26332B] hover:text-[#40916C] transition-colors"
            >
              Solutions
            </button>
            <button
              onClick={() => scrollToSection("disease-engine")}
              className="text-sm font-medium text-[#26332B] hover:text-[#40916C] transition-colors"
            >
              Disease Engine
            </button>
            <button
              onClick={() => scrollToSection("spray-safety")}
              className="text-sm font-medium text-[#26332B] hover:text-[#40916C] transition-colors"
            >
              Weather Advisory
            </button>
            <button
              onClick={() => scrollToSection("stats")}
              className="text-sm font-medium text-[#26332B] hover:text-[#40916C] transition-colors"
            >
              Impact
            </button>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/dashboard"
              className="text-sm font-medium text-[#26332B] hover:text-[#40916C] transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/disease-detection"
              className="text-sm font-medium text-[#26332B] hover:text-[#40916C] transition-colors"
            >
              Scan Crop
            </Link>
            <Link
              to="/weather-advisory"
              className="text-sm font-medium text-[#26332B] hover:text-[#40916C] transition-colors"
            >
              Weather
            </Link>
            <Link
              to="/spray-scheduler"
              className="text-sm font-medium text-[#26332B] hover:text-[#40916C] transition-colors"
            >
              Sprays
            </Link>
          </nav>
        )}

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F7F5EE] border border-[#DCE5DC] text-xs font-semibold text-[#1B4332] hover:bg-[#DCE5DC]/50 transition-colors"
              >
                <User size={14} className="text-[#40916C]" />
                <span className="truncate max-w-[120px]">{username}</span>
              </Link>
              {!isSignupPage ? (
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              ) : (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 bg-[#1B4332] hover:bg-[#40916C] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-xs"
                >
                  <span>Go to Farm</span>
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (onAuthClick) onAuthClick();
                  else scrollToSection("auth-section");
                }}
                className="inline-flex items-center gap-2 bg-[#1B4332] hover:bg-[#40916C] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-xs"
              >
                <span>Farmer Sign In</span>
                <ArrowRight size={15} />
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[#26332B] hover:bg-[#F7F5EE] border border-[#DCE5DC]"
            aria-label="Toggle mobile navigation"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#DCE5DC] bg-white px-6 py-5 shadow-lg space-y-3 animate-in slide-in-from-top-2">
          {isSignupPage ? (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => scrollToSection("features")}
                className="text-left py-2 text-sm font-semibold text-[#26332B] hover:text-[#40916C]"
              >
                Solutions
              </button>
              <button
                onClick={() => scrollToSection("disease-engine")}
                className="text-left py-2 text-sm font-semibold text-[#26332B] hover:text-[#40916C]"
              >
                Disease Diagnostics
              </button>
              <button
                onClick={() => scrollToSection("spray-safety")}
                className="text-left py-2 text-sm font-semibold text-[#26332B] hover:text-[#40916C]"
              >
                Weather Advisory
              </button>
              <button
                onClick={() => scrollToSection("stats")}
                className="text-left py-2 text-sm font-semibold text-[#26332B] hover:text-[#40916C]"
              >
                Farm Impact
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-sm font-semibold text-[#26332B] hover:text-[#40916C]"
              >
                Dashboard
              </Link>
              <Link
                to="/disease-detection"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-sm font-semibold text-[#26332B] hover:text-[#40916C]"
              >
                Scan Crop
              </Link>
              <Link
                to="/weather-advisory"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-sm font-semibold text-[#26332B] hover:text-[#40916C]"
              >
                Weather Advisory
              </Link>
              <Link
                to="/spray-scheduler"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-sm font-semibold text-[#26332B] hover:text-[#40916C]"
              >
                Spray Scheduler
              </Link>
            </div>
          )}

          <div className="pt-3 border-t border-[#DCE5DC]">
            {isLoggedIn ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full py-2.5 text-center text-sm font-semibold text-rose-700 bg-rose-50 rounded-xl"
              >
                Logout Account
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onAuthClick) onAuthClick();
                  else scrollToSection("auth-section");
                }}
                className="w-full py-2.5 text-center text-sm font-semibold text-white bg-[#1B4332] rounded-xl shadow-xs"
              >
                Farmer Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;