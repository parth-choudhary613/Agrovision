import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UpcomingSpraysCard from "../components/UpcomingSpraysCard";
import Footer from "../components/Footer";
import { Droplets, Calendar, ShieldAlert } from "lucide-react";

const SpraySchedulerPage = () => {
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      navigate("/");
      return;
    }
    setToken(storedToken);
  }, [navigate]);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-[#DCE5DC] p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2">
          <Droplets size={18} className="text-[#40916C]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#66736B]">
            Field Application Timeline
          </span>
        </div>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1B4332] mt-1.5">
          Spray Scheduler &amp; Treatment Tracker
        </h1>
        <p className="font-sans text-xs sm:text-sm text-[#66736B] mt-1 max-w-2xl leading-relaxed">
          Coordinate upcoming pesticide treatments, track finished sprays, and maintain healthy harvest intervals across all cultivation plots.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <UpcomingSpraysCard
            token={token}
            refreshKey={0}
            onTreatmentDone={() => {}}
          />
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-[#DCE5DC] p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1B4332]">
              <Calendar size={16} className="text-[#40916C]" />
              <span>Application Protocol</span>
            </div>
            <p className="text-xs text-[#66736B] leading-relaxed">
              Always adhere to prescribed spray intervals (e.g. 7–10 days). Applying chemicals too frequently can stress foliage and lead to chemical burn.
            </p>
          </div>

          <div className="bg-[#FAF9F5] rounded-3xl border border-[#DCE5DC] p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D4A72C]">
              <ShieldAlert size={16} />
              <span>Safety &amp; PPE Reminder</span>
            </div>
            <p className="text-xs text-[#66736B] leading-relaxed">
              Wear appropriate respiratory masks and protective gloves during chemical preparation and tank spraying. Keep children and livestock clear of treated fields for 24 hours.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SpraySchedulerPage;
