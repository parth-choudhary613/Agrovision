import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  UserCircle2,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  LogOut,
  Sparkles,
} from "lucide-react";
import Footer from "../components/Footer";

const API_URL = import.meta.env.VITE_API_URL;

const ProfilePage = () => {
  const [user, setUser] = useState({
    username: "",
    picture: "",
    loginType: "",
    phone: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    axios
      .get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser({
          username: res.data.username || "Progressive Grower",
          picture: res.data.picture || "",
          loginType: res.data.loginType || "phone",
          phone: res.data.phone || "",
          email: res.data.email || "",
        });
      })
      .catch(() => {
        // Fallback
        axios
          .get(`${API_URL}/api/auth/user`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => {
            setUser((prev) => ({
              ...prev,
              username: res.data.username || "Progressive Grower",
            }));
          })
          .catch(() => {});
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("agro_stats");
    localStorage.removeItem("agro_last_scan");
    navigate("/");
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-[#DCE5DC] p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2">
          <UserCircle2 size={18} className="text-[#40916C]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#66736B]">
            Account Management
          </span>
        </div>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1B4332] mt-1.5">
          Farmer Profile &amp; Estate Details
        </h1>
        <p className="font-sans text-xs sm:text-sm text-[#66736B] mt-1 max-w-2xl leading-relaxed">
          Manage your verified farm credentials, session security, and agricultural preferences.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* User Card */}
        <div className="bg-white rounded-3xl border border-[#DCE5DC] p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4 pb-6 border-b border-[#DCE5DC]">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.username}
                  className="w-16 h-16 rounded-2xl object-cover border border-[#DCE5DC]"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center font-serif text-2xl font-bold">
                  {user.username ? user.username.charAt(0).toUpperCase() : "F"}
                </div>
              )}

              <div>
                <h3 className="font-serif text-xl font-bold text-[#1B4332]">
                  {user.username || "Farmer"}
                </h3>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#F3F7F3] text-[#1B4332] border border-[#95B89A]/50 mt-1">
                  <Sparkles size={11} className="text-[#D4A72C]" />
                  <span>Verified Grower</span>
                </span>
              </div>
            </div>

            <div className="py-5 space-y-3.5 text-xs sm:text-sm">
              <div className="flex items-center gap-3 text-[#26332B]">
                <ShieldCheck size={17} className="text-[#40916C]" />
                <span>
                  Login Channel:{" "}
                  <strong className="capitalize">{user.loginType || "Secure Auth"}</strong>
                </span>
              </div>

              {user.phone && (
                <div className="flex items-center gap-3 text-[#26332B]">
                  <Phone size={17} className="text-[#40916C]" />
                  <span>Mobile: {user.phone}</span>
                </div>
              )}

              {user.email && (
                <div className="flex items-center gap-3 text-[#26332B]">
                  <Mail size={17} className="text-[#40916C]" />
                  <span>Email: {user.email}</span>
                </div>
              )}

              <div className="flex items-center gap-3 text-[#26332B]">
                <Calendar size={17} className="text-[#40916C]" />
                <span>Season: 2026 Cultivation Cycle</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#DCE5DC] mt-4">
            <button
              onClick={logout}
              className="w-full inline-flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 py-3 rounded-xl text-xs font-bold transition-colors"
            >
              <LogOut size={15} />
              <span>Sign Out of Farm Account</span>
            </button>
          </div>
        </div>

        {/* Agricultural Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-[#DCE5DC] p-6 sm:p-8 shadow-xs">
            <h3 className="font-serif text-lg font-bold text-[#1B4332] mb-1">
              Farm &amp; Cultivation Preferences
            </h3>
            <p className="text-xs text-[#66736B] mb-5">
              These preferences configure the automatic dosage calibrator and spray window recommendations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#FAF9F5] border border-[#DCE5DC] p-4 rounded-2xl">
                <span className="text-[11px] font-bold text-[#66736B] uppercase tracking-wider">
                  Diagnostic Sensitivity
                </span>
                <p className="font-bold text-sm text-[#1B4332] mt-1">
                  High Precision (Kindwise v2)
                </p>
                <p className="text-[11px] text-[#66736B] mt-0.5">
                  Screens for subtle early-stage foliar discoloration.
                </p>
              </div>

              <div className="bg-[#FAF9F5] border border-[#DCE5DC] p-4 rounded-2xl">
                <span className="text-[11px] font-bold text-[#66736B] uppercase tracking-wider">
                  Spray Risk Model
                </span>
                <p className="font-bold text-sm text-[#1B4332] mt-1">
                  Conservative (Zero Run-Off)
                </p>
                <p className="text-[11px] text-[#66736B] mt-0.5">
                  Flags spray caution if rain chance exceeds 35%.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#FAF9F5] rounded-3xl border border-[#DCE5DC] p-6 shadow-xs flex items-start gap-3.5">
            <ShieldCheck size={22} className="text-[#40916C] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs text-[#1B4332] uppercase tracking-wider">
                Data Protection &amp; Farm Privacy
              </h4>
              <p className="text-xs text-[#66736B] leading-relaxed mt-1">
                Your uploaded crop photographs and location coordinates are utilized solely for real-time pathology inference and weather advisory calculations. We never share proprietary field data.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ProfilePage;
