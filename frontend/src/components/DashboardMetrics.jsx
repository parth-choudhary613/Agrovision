// components/DashboardMetrics.jsx
// ✅ Now receives `stats` as a prop from Dashboard for real-time updates

const MetricCard = ({ title, value, subtitle, icon, bgColor }) => (
  <div
    className={`rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm border border-gray-100 ${bgColor} transition-all hover:scale-[1.02] hover:shadow-md`}
  >
    <div className="flex items-start justify-between gap-1 sm:gap-2">
      <div className="min-w-0 flex-1">
        {/* Scaled down text for mobile, large for screens sm and up */}
        <p className="text-2xl sm:text-4xl font-bold text-gray-900 truncate">{value}</p>
        <p className="text-xs sm:text-base font-semibold text-gray-800 mt-1 sm:mt-2 truncate">{title}</p>
        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>
      </div>
      {/* Scaled down icon for mobile */}
      <span className="text-3xl sm:text-5xl opacity-90 flex-shrink-0">{icon}</span>
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
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