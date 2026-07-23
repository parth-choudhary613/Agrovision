import { FileText, Clock3 } from "lucide-react";

const HistoryReportsPage = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
            <FileText size={24} />cd 
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              History & Reports
            </h2>
            <p className="text-sm text-gray-600">
              Review your recent crop scans and treatment activity.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-slate-700">
          <Clock3 size={18} />
          <h3 className="font-semibold">Recent activity</h3>
        </div>
        <p className="mt-4 text-sm text-gray-600">
          Your scan history and reports will appear here as you continue using
          AgroVision.
        </p>
      </div>
    </div>
  );
};

export default HistoryReportsPage;
