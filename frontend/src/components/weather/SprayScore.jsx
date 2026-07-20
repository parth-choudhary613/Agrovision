// frontend/src/components/weather/SprayScore.jsx
import React from 'react';
import { XCircle, CheckCircle2, AlertTriangle, Clock, Sun, Cloud, CloudRain, Wind } from 'lucide-react';

const LEVEL_STYLES = {
  green: {
    ring: 'stroke-[#10b981]',
    glow: 'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    text: 'text-emerald-800',
    badgeBg: 'bg-emerald-100/80',
    badgeBorder: 'border-emerald-300',
    icon: CheckCircle2,
    bgGradient: 'from-[#e0f2fe] via-[#d1fae5] to-[#bae6fd]', // Sunny/Clear
    weatherIcons: [Sun, Cloud],
    iconColor: 'text-yellow-400',
  },
  yellow: {
    ring: 'stroke-[#f59e0b]',
    glow: 'drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]',
    text: 'text-amber-800',
    badgeBg: 'bg-amber-100/80',
    badgeBorder: 'border-amber-300',
    icon: AlertTriangle,
    bgGradient: 'from-[#fef3c7] via-[#fde68a] to-[#e5e7eb]', // Cloudy/Windy
    weatherIcons: [Cloud, Wind],
    iconColor: 'text-amber-300',
  },
  red: {
    ring: 'stroke-[#f43f5e]',
    glow: 'drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]',
    text: 'text-rose-800',
    badgeBg: 'bg-rose-100/80',
    badgeBorder: 'border-rose-300',
    icon: XCircle,
    bgGradient: 'from-[#fecdd3] via-[#e2e8f0] to-[#cbd5e1]', // Stormy/Bad
    weatherIcons: [CloudRain, Wind],
    iconColor: 'text-slate-400',
  },
};

const REASON_DOT = {
  good: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]', 
  warning: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
  danger: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]',
  neutral: 'bg-slate-400',
};

const SprayScore = ({ sprayScore, recommendation, recommendationLevel, reasons, bestSprayWindow }) => {
  const styles = LEVEL_STYLES[recommendationLevel] || LEVEL_STYLES.yellow;
  const Icon = styles.icon;
  const WeatherIcon1 = styles.weatherIcons[0];
  const WeatherIcon2 = styles.weatherIcons[1];

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, sprayScore ?? 0));
  const dashOffset = circumference - (clamped / 100) * circumference;

  return (
    <div className={`relative overflow-hidden rounded-[32px] bg-gradient-to-br ${styles.bgGradient} p-1 md:p-2 shadow-inner bg-animate`}>
      
      {/* ── Custom Animations & Glassmorphism ── */}
      <style>
        {`
          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .bg-animate {
            background-size: 200% 200%;
            animation: gradientMove 10s ease infinite;
          }
          @keyframes floatWeather1 {
            0% { transform: translate(0px, 0px) scale(1); opacity: 0.1; }
            50% { transform: translate(20px, -20px) scale(1.1); opacity: 0.2; }
            100% { transform: translate(0px, 0px) scale(1); opacity: 0.1; }
          }
          @keyframes floatWeather2 {
            0% { transform: translate(0px, 0px) scale(1.2); opacity: 0.15; }
            50% { transform: translate(-30px, 20px) scale(1); opacity: 0.05; }
            100% { transform: translate(0px, 0px) scale(1.2); opacity: 0.15; }
          }
          .animate-weather-1 { animation: floatWeather1 8s ease-in-out infinite; }
          .animate-weather-2 { animation: floatWeather2 12s ease-in-out infinite reverse; }
          
          .glass-panel {
            background: rgba(255, 255, 255, 0.65);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.8);
          }
        `}
      </style>

      {/* ── Animated Background Weather Elements ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <WeatherIcon1 className={`absolute -top-10 -left-10 w-48 h-48 ${styles.iconColor} animate-weather-1`} />
        <WeatherIcon2 className={`absolute top-20 -right-12 w-64 h-64 ${styles.iconColor} animate-weather-2`} />
        <WeatherIcon1 className={`absolute -bottom-16 left-1/3 w-40 h-40 ${styles.iconColor} animate-weather-1`} />
      </div>

      {/* ── Foreground Content ── */}
      <div className="relative z-10 glass-panel rounded-[28px] p-6 sm:p-8 w-full grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-10 lg:gap-16 items-start shadow-xl shadow-black/5">
        
        {/* LEFT SIDE: Score & Status */}
        <div className="w-full lg:w-auto flex flex-col items-center lg:items-start">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest mb-6 bg-white/50 px-4 py-1.5 rounded-full inline-block backdrop-blur-sm border border-white/60 shadow-sm">
            Spray Advisory
          </h3>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
            
            {/* Circular score gauge */}
            <div className="relative w-44 h-44 flex-shrink-0 group">
              {/* Outer soft glow ring */}
              <div className="absolute inset-0 rounded-full bg-white/40 blur-xl group-hover:scale-110 transition-transform duration-500"></div>
              
              <svg viewBox="0 0 120 120" className="w-44 h-44 -rotate-90 relative z-10">
                {/* Background track */}
                <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="12" />
                {/* Foreground progress */}
                <circle
                  cx="60" cy="60" r={radius} fill="none"
                  className={`${styles.ring} ${styles.glow}`}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center mt-1 z-20">
                <span className="text-[52px] font-black text-slate-800 tracking-tighter drop-shadow-sm leading-none">{clamped}</span>
                <span className="text-sm text-slate-500 font-bold mt-1">/ 100</span>
              </div>
            </div>

            {/* Recommendation + Window */}
            <div className="flex flex-col gap-4 w-full text-center sm:text-left mt-2">
              <div className={`inline-flex items-center justify-center sm:justify-start gap-2.5 rounded-2xl px-5 py-3 border backdrop-blur-md shadow-sm ${styles.badgeBg} ${styles.badgeBorder} transition-transform hover:scale-105 duration-300`}>
                <Icon className={styles.text} size={22} strokeWidth={2.5} />
                <span className={`font-black text-base uppercase tracking-wide ${styles.text}`}>{recommendation}</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 mt-3 bg-white/50 p-4 rounded-2xl border border-white/60 shadow-sm">
                <Clock size={20} className="text-slate-500 flex-shrink-0 sm:mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Best spray window</p>
                  <p className="font-extrabold text-slate-800 text-sm sm:text-base">{bestSprayWindow}</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT SIDE: Reasons List */}
        <div className="w-full h-full lg:pl-10 lg:border-l-2 lg:border-white/50 pt-6 lg:pt-0 flex flex-col justify-center">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest mb-6 lg:hidden bg-white/50 px-4 py-1.5 rounded-full inline-block backdrop-blur-sm border border-white/60 shadow-sm self-center sm:self-start">
            Conditions
          </h3>
          
          {Array.isArray(reasons) && reasons.length > 0 ? (
            <ul className="space-y-4">
              {reasons.map((reason, idx) => (
                <li 
                  key={idx} 
                  className="flex items-start gap-4 p-4 rounded-2xl bg-white/40 hover:bg-white/60 transition-colors border border-white/40 shadow-sm"
                >
                  <span className={`w-3.5 h-3.5 mt-1 rounded-full flex-shrink-0 ${REASON_DOT[reason.type] || REASON_DOT.neutral}`} />
                  <span className="text-[15px] font-medium leading-relaxed text-slate-700">
                    {reason.message}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center justify-center h-full p-8 rounded-2xl bg-white/40 border border-white/40 border-dashed">
              <p className="text-slate-500 font-medium italic text-center">No specific weather conditions to report at this time.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SprayScore;