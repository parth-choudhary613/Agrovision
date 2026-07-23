import { useEffect, useState } from "react";
import { Sprout, Leaf, CalendarDays } from "lucide-react";

const MyCropsPage = () => {
  const [lastScan, setLastScan] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("agro_last_scan");
      if (stored) {
        setLastScan(JSON.parse(stored));
      }
    } catch {
      setLastScan(null);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-green-100 p-3 text-green-700">
            <Sprout size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Crops</h2>
            <p className="text-sm text-gray-600">
              Keep an eye on your farm’s active crop health records.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-green-700">
            <Leaf size={18} />
            <h3 className="font-semibold">Latest scan summary</h3>
          </div>
          {lastScan?.result ? (
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-semibold text-gray-900">Crop:</span>{" "}
                {lastScan.result.cropName || "Unknown"}
              </p>
              <p>
                <span className="font-semibold text-gray-900">Condition:</span>{" "}
                {lastScan.result.diseaseDetected || "Healthy"}
              </p>
              <p>
                <span className="font-semibold text-gray-900">
                  Recommendation:
                </span>{" "}
                {lastScan.result.recommendation ||
                  "No recommendation available yet."}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-500">
              No crop scan has been saved yet. Scan a plant to start building
              your farm record.
            </p>
          )}
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600">
            <CalendarDays size={18} />
            <h3 className="font-semibold">Upcoming field care</h3>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Review scheduled sprays and farm actions from the scheduler to keep
            treatments on time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyCropsPage;
