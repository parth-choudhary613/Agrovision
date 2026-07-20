// frontend/src/components/weather/WeatherCard.jsx
import React from 'react';
import { Thermometer, Droplets, Wind, CloudRain } from 'lucide-react';

const WeatherCard = ({ weather }) => {
  if (!weather?.current) return null;
  const { current } = weather;

  const metrics = [
    {
      icon: Thermometer,
      label: 'TEMPERATURE',
      value: `${current.temperature}°C`,
      sub: `Feels like ${current.feelsLike}°C`,
      iconColor: 'text-orange-500',
      // Upgraded to 3D-looking gradients
      bg: 'bg-gradient-to-br from-[#FFF5ED] to-[#FFE4CE]', 
      shadow: 'shadow-orange-500/20',
    },
    {
      icon: Droplets,
      label: 'HUMIDITY',
      value: `${current.humidity}%`,
      sub: humidityHint(current.humidity),
      iconColor: 'text-blue-500',
      bg: 'bg-gradient-to-br from-[#F0F5FF] to-[#DCE8FF]',
      shadow: 'shadow-blue-500/20',
    },
    {
      icon: Wind,
      label: 'WIND SPEED',
      value: `${current.windSpeedKmh} km/h`,
      sub: current.windSpeedKmh > 15 ? 'High wind' : 'Calm',
      iconColor: 'text-slate-600',
      bg: 'bg-gradient-to-br from-[#F8F9FA] to-[#E2E5EB]',
      shadow: 'shadow-slate-500/20',
    },
    {
      icon: CloudRain,
      label: 'RAIN CHANCE',
      value: `${current.rainProbability}%`,
      sub: current.rainProbability > 40 ? 'High risk' : 'Low risk',
      iconColor: 'text-teal-600',
      bg: 'bg-gradient-to-br from-[#ECFAF9] to-[#CFF0F0]',
      shadow: 'shadow-teal-500/20',
    },
  ];

  return (
    <div className="w-full relative">
      {/* Custom Keyframes for 3D Floating Effect */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-12px) rotate(2deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
          .animate-float {
            animation: float 4s ease-in-out infinite;
          }
          .glass-highlight {
            background: linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 100%);
          }
        `}
      </style>

      <div className="flex items-center justify-between mb-8 px-2">
        <div className="z-10">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Current Weather
          </h3>
          <p className="text-gray-500 text-lg capitalize mt-1 font-medium">{current.description}</p>
        </div>
        
        {current.icon && (
          <div className="relative">
            {/* Soft glow behind the icon */}
            <div className="absolute inset-0 bg-yellow-300 blur-2xl opacity-20 rounded-full"></div>
            <img
              src={`https://openweathermap.org/img/wn/${current.icon}@4x.png`}
              alt={current.description}
              className="w-28 h-28 -my-6 object-contain drop-shadow-2xl animate-float relative z-10"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map(({ icon: Icon, label, value, sub, iconColor, bg, shadow }) => (
          <div 
            key={label} 
            className={`group relative overflow-hidden rounded-[32px] p-5 sm:p-6 flex flex-col justify-between h-44 cursor-pointer transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:${shadow} ${bg} border border-white/60 shadow-lg shadow-black/5`}
          >
            {/* 3D Glassmorphism Highlight Layer */}
            <div className="absolute inset-0 glass-highlight opacity-50 pointer-events-none rounded-[32px]"></div>
            
            {/* Decorative Background Circle */}
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/40 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>

            <div className="relative z-10">
              <div className="bg-white/80 backdrop-blur-sm w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-sm border border-white/50 group-hover:scale-110 transition-transform duration-300">
                <Icon className={`${iconColor}`} size={24} strokeWidth={2} />
              </div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
            </div>
            
            <div className="relative z-10 mt-2">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight drop-shadow-sm">
                {value}
              </p>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function humidityHint(humidity) {
  if (humidity > 90) return 'Very high';
  if (humidity >= 40 && humidity <= 80) return 'Ideal range';
  return 'Outside ideal';
}

export default WeatherCard;