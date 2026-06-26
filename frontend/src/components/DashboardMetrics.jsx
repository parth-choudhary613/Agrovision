// components/DashboardMetrics.jsx
// ✅ Now receives `stats` as a prop from Dashboard for real-time updates

const MetricCard = ({ title, value, subtitle, icon, bgColor }) => (
  <div
    className={`rounded-2xl p-5 shadow-sm border border-gray-100 ${bgColor} transition-all hover:scale-[1.02] hover:shadow-md`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-4xl font-bold text-gray-900">{value}</p>
        <p className="text-base font-semibold text-gray-800 mt-2">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
      </div>
      <span className="text-5xl opacity-90">{icon}</span>
    </div>
  </div>
);

const DashboardMetrics = ({ stats }) => {
  // Fallback to zeros if stats not yet loaded
  const {
    cropsScanned = 0,
    diseasesFound = 0,
    upcomingSprays = 0,
    treatmentsDone = 0,
  } = stats || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      <MetricCard
        title="Crops Scanned"
        value={cropsScanned}
        subtitle="This Season"
        icon="🌱"
        bgColor="bg-emerald-50"
      />
      <MetricCard
        title="Diseases Found"
        value={diseasesFound}
        subtitle="This Season"
        icon="🐛"
        bgColor="bg-amber-50"
      />
      <MetricCard
        title="Upcoming Sprays"
        value={upcomingSprays}
        subtitle="Next 7 Days"
        icon="📅"
        bgColor="bg-blue-50"
      />
      <MetricCard
        title="Treatments Done"
        value={treatmentsDone}
        subtitle="This Season"
        icon="🛡️"
        bgColor="bg-purple-50"
      />
    </div>
  );
};

export default DashboardMetrics;
