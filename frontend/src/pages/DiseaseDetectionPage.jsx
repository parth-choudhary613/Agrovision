import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PlantScanPanel from "../components/PlantScanPanel";
import Footer from "../components/Footer";
import { Bug } from "lucide-react";

const DiseaseDetectionPage = () => {
  const [token] = useState(() => localStorage.getItem("token") || "");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-[#DCE5DC] p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2">
          <Bug size={18} className="text-[#40916C]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#66736B]">
            Vision Pathology Engine
          </span>
        </div>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1B4332] mt-1.5">
          Plant Disease Detection
        </h1>
        <p className="font-sans text-xs sm:text-sm text-[#66736B] mt-1 max-w-2xl leading-relaxed">
          Upload a clear photograph of any affected leaf surface to instantly isolate disease strains,
          gauge diagnostic confidence, and retrieve calibrated treatment protocols.
        </p>
      </div>

      {/* Main Scanner Panel */}
      <PlantScanPanel
        token={token}
        onScanComplete={() => {}}
        onSprayScheduled={() => {}}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default DiseaseDetectionPage;
