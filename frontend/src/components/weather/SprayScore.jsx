// frontend/src/components/weather/SprayScore.jsx
//
// NEW COMPONENT — Weather-Based Spray Advisory module.
// Purely presentational: displays sprayScore, recommendation, reasons list,
// and the best spray window, with green/yellow/red visual indicators.

import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';

// Maps the backend's recommendationLevel to Tailwind color tokens.
const LEVEL_STYLES = {
  green: {
    ring: 'stroke-emerald-500',
    text: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    icon: CheckCircle2,
    badge: 'bg-emerald-100 text-emerald-700',
  },
  yellow: {
    ring: 'stroke-amber-500',
    text: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    icon: AlertTriangle,
    badge: 'bg-amber-100 text-amber-700',
  },
  red: {
    ring: 'stroke-red-500',
    text: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-100',
    icon: XCircle,
    badge: 'bg-red-100 text-red-700',
  },
};

const REASON_DOT = {
  good: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  neutral: 'bg-gray-400',
};

const SprayScore = ({ sprayScore, recommendation, recommendationLevel, reasons, bestSprayWindow }) => {
  const styles = LEVEL_STYLES[recommendationLevel] || LEVEL_STYLES.yellow;
  const Icon = styles.icon;

  // SVG ring math for the circular score gauge
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, sprayScore ?? 0));
  const dashOffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-5">Spray Advisory</h3>

      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        {/* Circular score gauge */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-32 h-32 -rotate-90">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="10" />
            <circle
              cx="50" cy="50" r={radius} fill="none"
              className={styles.ring}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-gray-800">{clamped}</span>
            <span className="text-xs text-gray-400 font-medium">/ 100</span>
          </div>
        </div>

        {/* Recommendation + best window */}
        <div className="flex-1 w-full">
          <div className={`flex items-center gap-2 rounded-2xl px-4 py-3 border ${styles.bg} ${styles.border}`}>
            <Icon className={styles.text} size={22} />
            <span className={`font-bold text-sm ${styles.text}`}>{recommendation}</span>
          </div>

          <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
            <Clock size={16} className="text-gray-400 flex-shrink-0" />
            <span>
              Best spray window:{' '}
              <span className="font-semibold text-gray-800">{bestSprayWindow}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Reasons list */}
      {Array.isArray(reasons) && reasons.length > 0 && (
        <div className="mt-5 pt-5 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Why?</p>
          <ul className="space-y-2">
            {reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-700">
                <span className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${REASON_DOT[reason.type] || REASON_DOT.neutral}`} />
                <span className="leading-relaxed">{reason.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SprayScore;
