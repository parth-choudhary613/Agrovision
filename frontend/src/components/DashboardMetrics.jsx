import { Sprout, Bug, Calendar, ShieldCheck } from "lucide-react";

const MetricCard = ({ title, value, subtitle, icon: Icon, accentColor }) => (
  <div className="bg-white border border-[#DCE5DC] rounded-2xl p-4 sm:p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm hover:border-[#95B89A] flex flex-col justify-between">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="font-serif text-3xl sm:text-4xl font-bold text-[#1B4332] tracking-tight leading-none">
          {value}
        </p>
        <p className="font-sans text-xs sm:text-sm font-bold text-[#26332B] mt-2 truncate">
          {title}
        </p>
        <p className="font-sans text-[11px] text-[#66736B] mt-0.5 truncate">
          {subtitle}
        </p>
      </div>

      <div
        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 ${accentColor.bg} ${accentColor.text} border ${accentColor.border}`}
      >
        <Icon size={20} />
      </div>
    </div>

    <div className="mt-4 pt-3 border-t border-[#DCE5DC]/60 flex items-center justify-between text-[11px] text-[#66736B]">
      <span>Season Active</span>
      <span className="w-1.5 h-1.5 rounded-full bg-[#40916C]" />
    </div>
  </div>
);

const DashboardMetrics = ({ stats }) => {
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
        icon={Sprout}
        accentColor={{
          bg: "bg-[#F7F5EE]",
          text: "text-[#1B4332]",
          border: "border-[#DCE5DC]",
        }}
      />
      <MetricCard
        title="Diseases Found"
        value={diseasesFound}
        subtitle="Active Diagnoses"
        icon={Bug}
        accentColor={{
          bg: "bg-amber-50/70",
          text: "text-[#D4A72C]",
          border: "border-amber-200/60",
        }}
      />
      <MetricCard
        title="Upcoming Sprays"
        value={upcomingSprays}
        subtitle="Next 7 Days"
        icon={Calendar}
        accentColor={{
          bg: "bg-[#F7F5EE]",
          text: "text-[#40916C]",
          border: "border-[#DCE5DC]",
        }}
      />
      <MetricCard
        title="Treatments Done"
        value={treatmentsDone}
        subtitle="Completed Sprays"
        icon={ShieldCheck}
        accentColor={{
          bg: "bg-[#F3F7F3]",
          text: "text-[#1B4332]",
          border: "border-[#DCE5DC]",
        }}
      />
    </div>
  );
};

export default DashboardMetrics;