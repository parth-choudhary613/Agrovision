import {
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from "lucide-react";

const LEVEL_STYLES = {
  green: {
    stroke: "#1B4332",
    badgeBg: "bg-[#F3F7F3]",
    badgeBorder: "border-[#95B89A]",
    badgeText: "text-[#1B4332]",
    icon: CheckCircle2,
  },
  yellow: {
    stroke: "#D4A72C",
    badgeBg: "bg-amber-50",
    badgeBorder: "border-amber-300",
    badgeText: "text-amber-900",
    icon: AlertTriangle,
  },
  red: {
    stroke: "#B91C1C",
    badgeBg: "bg-rose-50",
    badgeBorder: "border-rose-300",
    badgeText: "text-rose-900",
    icon: XCircle,
  },
};

const REASON_DOT = {
  good: "bg-[#40916C]",
  warning: "bg-[#D4A72C]",
  danger: "bg-rose-600",
  neutral: "bg-[#66736B]",
};

const SprayScore = ({
  sprayScore,
  recommendation,
  recommendationLevel,
  reasons,
  bestSprayWindow,
}) => {
  const styles = LEVEL_STYLES[recommendationLevel] || LEVEL_STYLES.yellow;
  const Icon = styles.icon;

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, sprayScore ?? 0));
  const dashOffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="rounded-2xl bg-[#F7F5EE] border border-[#DCE5DC] p-6 sm:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* LEFT COLUMN: Circular Gauge & Recommendation */}
        <div className="lg:col-span-6 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          {/* Circular SVG Gauge */}
          <div className="relative w-36 h-36 shrink-0">
            <svg viewBox="0 0 120 120" className="w-36 h-36 -rotate-90">
              {/* Background Track */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="#DCE5DC"
                strokeWidth="10"
              />
              {/* Foreground Progress */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={styles.stroke}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{
                  transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-serif text-4xl font-bold text-[#1B4332] leading-none">
                {clamped}
              </span>
              <span className="text-[11px] font-bold text-[#66736B] uppercase tracking-wider mt-1">
                Score / 100
              </span>
            </div>
          </div>

          {/* Recommendation Info */}
          <div className="flex flex-col gap-3 text-center sm:text-left">
            <div
              className={`inline-flex items-center justify-center sm:justify-start gap-2 px-4 py-2 rounded-xl border ${styles.badgeBg} ${styles.badgeBorder}`}
            >
              <Icon size={18} className={styles.badgeText} />
              <span className={`font-bold text-sm uppercase tracking-wide ${styles.badgeText}`}>
                {recommendation || "Evaluating Conditions"}
              </span>
            </div>

            <div className="bg-white border border-[#DCE5DC] rounded-xl p-3 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#66736B]">
                <Clock size={13} className="text-[#40916C]" />
                <span>Best Spray Window</span>
              </div>
              <p className="font-bold text-[#1B4332] text-sm mt-1">
                {bestSprayWindow || "Consult hourly weather forecast"}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Specific Conditions Checklist */}
        <div className="lg:col-span-6 lg:border-l lg:border-[#DCE5DC] lg:pl-8">
          <p className="text-xs font-bold uppercase tracking-wider text-[#66736B] mb-3">
            Agronomic Weather Factors
          </p>

          {Array.isArray(reasons) && reasons.length > 0 ? (
            <ul className="space-y-2.5">
              {reasons.map((reason, idx) => (
                <li
                  key={idx}
                  className="bg-white border border-[#DCE5DC] rounded-xl px-4 py-2.5 flex items-start gap-3 shadow-2xs"
                >
                  <span
                    className={`w-2.5 h-2.5 mt-1.5 rounded-full shrink-0 ${
                      REASON_DOT[reason.type] || REASON_DOT.neutral
                    }`}
                  />
                  <span className="font-sans text-xs sm:text-sm font-medium text-[#26332B] leading-relaxed">
                    {reason.message}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="bg-white border border-[#DCE5DC] rounded-xl p-4 text-center">
              <p className="text-xs text-[#66736B] font-medium">
                No adverse micro-climate conditions currently detected for field application.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SprayScore;