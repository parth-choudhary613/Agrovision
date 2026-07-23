import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UpcomingSpraysCard from "../components/UpcomingSpraysCard";

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
    <div className="space-y-6">
      <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">Spray Scheduler</h2>
        <p className="mt-2 text-sm text-gray-600">
          Plan and monitor upcoming field treatments so you can stay ahead of
          crop issues.
        </p>
      </div>

      <UpcomingSpraysCard
        token={token}
        refreshKey={0}
        onTreatmentDone={() => {}}
      />
    </div>
  );
};

export default SpraySchedulerPage;
