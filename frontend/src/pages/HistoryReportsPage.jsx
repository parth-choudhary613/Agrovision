import { useState } from "react";
import { FileText, Clock3, CheckCircle2, Leaf, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";

const HistoryReportsPage = () => {
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
          <FileText size={18} className="text-[#40916C]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#66736B]">
            Field Documentation
          </span>
        </div>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1B4332] mt-1.5">
          History &amp; Agronomic Reports
        </h1>
        <p className="font-sans text-xs sm:text-sm text-[#66736B] mt-1 max-w-2xl leading-relaxed">
          Historical archive of disease identifications, chemical applications, and seasonal crop health logs.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Scan Record */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#DCE5DC] p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#DCE5DC] mb-5">
            <div className="flex items-center gap-2">
              <Clock3 size={18} className="text-[#40916C]" />
              <h3 className="font-serif text-lg font-bold text-[#1B4332]">
                Most Recent Crop Diagnosis
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F7F5EE] text-[#1B4332] border border-[#DCE5DC]">
              {lastScan ? "Logged" : "No Records"}
            </span>
          </div>

          {lastScan?.result ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-5 items-center bg-[#FAF9F5] border border-[#DCE5DC] p-4 rounded-2xl">
                {lastScan.preview ? (
                  <img
                    src={lastScan.preview}
                    alt="Scanned Leaf"
                    className="w-24 h-24 rounded-xl object-cover border border-[#DCE5DC] shrink-0"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-white border border-[#DCE5DC] flex items-center justify-center text-[#40916C] shrink-0">
                    <Leaf size={28} />
                  </div>
                )}
                <div className="space-y-1 text-center sm:text-left min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736B]">
                    Detected Condition
                  </span>
                  <p className="font-serif text-xl font-bold text-[#1B4332] truncate">
                    {lastScan.result.diseaseDetected || "Healthy Plant"}
                  </p>
                  <p className="text-xs text-[#26332B] font-medium">
                    Crop: <strong>{lastScan.result.cropName || "Cultivated Crop"}</strong>
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#DCE5DC] text-xs sm:text-sm text-[#66736B] leading-relaxed">
                <strong className="text-[#1B4332] block mb-1">Prescribed Action:</strong>
                {lastScan.result.recommendation ||
                  lastScan.result.pesticide ||
                  "Foliage healthy. Standard agricultural monitoring applies."}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#F7F5EE] border border-[#DCE5DC] flex items-center justify-center mx-auto mb-2 text-[#40916C]">
                <FileText size={22} />
              </div>
              <p className="font-bold text-sm text-[#26332B]">No Historical Scans Found</p>
              <p className="text-xs text-[#66736B] mt-1 max-w-xs mx-auto">
                Completed disease inspections and treatment schedules will be recorded here automatically.
              </p>
              <div className="mt-4">
                <Link
                  to="/disease-detection"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B4332] hover:text-[#40916C]"
                >
                  <span>Start your first scan</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Regulatory & Harvest Compliance */}
        <div className="bg-[#FAF9F5] rounded-3xl border border-[#DCE5DC] p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1B4332]">
            <CheckCircle2 size={16} className="text-[#40916C]" />
            <span>Pre-Harvest Intervals (PHI)</span>
          </div>
          <p className="text-xs text-[#66736B] leading-relaxed">
            Always observe the mandatory waiting period between your last chemical application and harvest date to ensure residue levels comply with food safety standards.
          </p>

          <div className="pt-4 border-t border-[#DCE5DC]">
            <span className="text-[11px] font-bold text-[#1B4332] block mb-1">
              Agronomic Export Standard
            </span>
            <p className="text-xs text-[#66736B] leading-relaxed">
              Maintain an active treatment record for GlobalGAP and organic certification audits.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HistoryReportsPage;
