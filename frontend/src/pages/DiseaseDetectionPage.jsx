import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PlantScanPanel from "../components/PlantScanPanel";

const DiseaseDetectionPage = () => {
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
    <div className="space-y-6">
      <div className="rounded-3xl border border-green-100 bg-gradient-to-r from-green-50 to-emerald-50 p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
          Disease Detection
        </p>
        <h2 className="mt-2 text-2xl font-bold text-gray-900">
          Inspect your crops in seconds
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-gray-600">
          Upload a fresh leaf image to identify disease symptoms and receive
          practical treatment guidance.
        </p>
      </div>

      <PlantScanPanel
        token={token}
        onScanComplete={() => {}}
        onSprayScheduled={() => {}}
      />
    </div>
  );
};

export default DiseaseDetectionPage;
