import { useState } from "react";
import { Link } from "react-router-dom";
import { Sprout, Leaf, CalendarDays, ArrowRight, ShieldCheck } from "lucide-react";
import Footer from "../components/Footer";

const MyCropsPage = () => {
  const [lastScan] = useState(() => {
    try {
      const stored = localStorage.getItem("agro_last_scan");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-[#DCE5DC] p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2">
          <Sprout size={18} className="text-[#40916C]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#66736B]">
            Crop Health Portfolio
          </span>
        </div>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1B4332] mt-1.5">
          My Crops &amp; Field Records
        </h1>
        <p className="font-sans text-xs sm:text-sm text-[#66736B] mt-1 max-w-2xl leading-relaxed">
          Monitor your active cultivation cycles, recent pathology scans, and seasonal health trends.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Latest Scan Summary Card */}
        <div className="bg-white rounded-3xl border border-[#DCE5DC] p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#DCE5DC]">
              <div className="flex items-center gap-2">
                <Leaf size={18} className="text-[#40916C]" />
                <h3 className="font-serif text-lg font-bold text-[#1B4332]">
                  Latest Field Diagnosis
                </h3>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#F7F5EE] border border-[#DCE5DC] text-[#1B4332]">
                {lastScan ? "Recorded" : "Awaiting Scan"}
              </span>
            </div>

            {lastScan?.result ? (
              <div className="mt-5 space-y-4">
                {lastScan.preview && (
                  <div className="w-full h-44 rounded-2xl overflow-hidden border border-[#DCE5DC]">
                    <img
                      src={lastScan.preview}
                      alt="Last Scanned Crop"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="flex justify-between py-1.5 border-b border-[#DCE5DC]/60">
                    <span className="text-[#66736B] font-medium">Cultivated Crop:</span>
                    <span className="font-bold text-[#26332B]">
                      {lastScan.result.cropName || "General Crop"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#DCE5DC]/60">
                    <span className="text-[#66736B] font-medium">Diagnostic Condition:</span>
                    <span
                      className={`font-bold ${
                        lastScan.result.isHealthy || lastScan.result.diseaseDetected === "Healthy"
                          ? "text-[#1B4332]"
                          : "text-rose-800"
                      }`}
                    >
                      {lastScan.result.diseaseDetected || "Healthy Foliage"}
                    </span>
                  </div>
                  <div className="py-1.5">
                    <span className="text-[#66736B] font-medium block mb-1">
                      Target Guidance:
                    </span>
                    <p className="text-xs text-[#26332B] bg-[#F7F5EE] border border-[#DCE5DC] p-3 rounded-xl leading-relaxed">
                      {lastScan.result.recommendation ||
                        lastScan.result.pesticide ||
                        "Standard crop inspection completed. Keep monitoring for symptoms."}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#F7F5EE] border border-[#DCE5DC] flex items-center justify-center mx-auto mb-2 text-[#40916C]">
                  <Leaf size={22} />
                </div>
                <p className="font-bold text-sm text-[#26332B]">No Crop Scans Stored</p>
                <p className="text-xs text-[#66736B] mt-1 max-w-xs mx-auto">
                  Scan a plant leaf to start building your permanent agricultural diagnosis log.
                </p>
              </div>
            )}
          </div>

          <div className="pt-5 border-t border-[#DCE5DC] mt-6">
            <Link
              to="/disease-detection"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#1B4332] hover:text-[#40916C] transition-colors"
            >
              <span>Scan a New Plant</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Upcoming Field Care Card */}
        <div className="bg-white rounded-3xl border border-[#DCE5DC] p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#DCE5DC]">
              <div className="flex items-center gap-2">
                <CalendarDays size={18} className="text-[#D4A72C]" />
                <h3 className="font-serif text-lg font-bold text-[#1B4332]">
                  Field Care Schedule
                </h3>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#F7F5EE] border border-[#DCE5DC] text-[#1B4332]">
                Active Cycle
              </span>
            </div>

            <div className="mt-5 space-y-4">
              <p className="text-xs sm:text-sm text-[#66736B] leading-relaxed">
                Review your upcoming chemical sprays and biological applications.
                Timely treatments aligned with local weather forecasting prevent disease spread and protect yield volume.
              </p>

              <div className="bg-[#FAF9F5] border border-[#DCE5DC] rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1B4332]">
                  <ShieldCheck size={16} className="text-[#40916C]" />
                  <span>Integrated Pest &amp; Disease Management</span>
                </div>
                <p className="text-xs text-[#66736B] leading-relaxed">
                  Rotate treatment modes of action to prevent pesticide resistance, and always verify spray scores prior to tank mixing.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-[#DCE5DC] mt-6">
            <Link
              to="/spray-scheduler"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#1B4332] hover:text-[#40916C] transition-colors"
            >
              <span>Manage Spray Calendar</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MyCropsPage;
