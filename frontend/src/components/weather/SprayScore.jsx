// frontend/src/components/weather/SprayScore.jsx
import React from 'react';
import { XCircle, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

const LEVEL_STYLES = {
  green: {
    ring: 'stroke-[#10b981]',
    text: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: CheckCircle2,
  },
  yellow: {
    ring: 'stroke-[#f59e0b]',
    text: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: AlertTriangle,
  },
  red: {
    ring: 'stroke-[#f43f5e]', // Deep red from image
    text: 'text-red-600',
    bg: 'bg-[#FFF1F2]', // Pale red bg
    border: 'border-red-200',
    icon: XCircle,
  },
};

const REASON_DOT = {
  good: 'bg-[#10b981]', 
  warning: 'bg-[#f59e0b]',
  danger: 'bg-[#ef4444]',
  neutral: 'bg-gray-400',
};

const SprayScore = ({ sprayScore, recommendation, recommendationLevel, reasons, bestSprayWindow }) => {
  const styles = LEVEL_STYLES[recommendationLevel] || LEVEL_STYLES.yellow;
  const Icon = styles.icon;

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, sprayScore ?? 0));
  const dashOffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-[auto_1fr] gap-10 md:gap-16 items-start">
      
      {/* LEFT SIDE: Score & Status */}
      <div className="w-full md:w-auto">
        <h3 className="text-[15px] font-bold text-slate-800 uppercase tracking-widest mb-6">Spray Advisory</h3>
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
          
          {/* Circular score gauge */}
          <div className="relative w-40 h-40 flex-shrink-0 drop-shadow-sm">
            <svg viewBox="0 0 120 120" className="w-40 h-40 -rotate-90">
              <circle cx="60" cy="60" r={radius} fill="none" stroke="#F1F5F9" strokeWidth="10" />
              <circle
                cx="60" cy="60" r={radius} fill="none"
                className={styles.ring}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center mt-1">
              <span className="text-5xl font-extrabold text-slate-800 tracking-tighter">{clamped}</span>
              <span className="text-sm text-slate-400 font-semibold mt-1">/ 100</span>
            </div>
          </div>

          {/* Recommendation + Window */}
          <div className="flex flex-col gap-4 w-full text-center sm:text-left mt-2">
            <div className={`inline-flex items-center justify-center sm:justify-start gap-2.5 rounded-xl px-5 py-2.5 border ${styles.bg} ${styles.border}`}>
              <Icon className={styles.text} size={20} strokeWidth={2.5} />
              <span className={`font-bold text-[15px] ${styles.text}`}>{recommendation}</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2.5 mt-2 text-sm text-slate-600">
              <Clock size={18} className="text-slate-400 flex-shrink-0 mt-0.5 hidden sm:block" />
              <div>
                <p className="text-slate-500 mb-0.5">Best spray window:</p>
                <p className="font-bold text-slate-800">{bestSprayWindow}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT SIDE: Reasons List */}
      <div className="w-full md:border-l md:border-gray-200 md:pl-12 pt-4 md:pt-0">
        <h3 className="text-[15px] font-bold text-slate-800 uppercase tracking-widest mb-6">Why?</h3>
        
        {Array.isArray(reasons) && reasons.length > 0 ? (
          <ul className="space-y-5">
            {reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-4">
                <span className={`w-3 h-3 mt-1.5 rounded-full flex-shrink-0 ${REASON_DOT[reason.type] || REASON_DOT.neutral}`} />
                <span className="text-[15px] leading-relaxed text-slate-700">
                  {reason.message}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No specific conditions to report.</p>
        )}
      </div>

    </div>
  );
};

export default SprayScore;