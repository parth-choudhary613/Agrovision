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
      bg: 'bg-[#FFF2E8]', // Soft orange from image
    },
    {
      icon: Droplets,
      label: 'HUMIDITY',
      value: `${current.humidity}%`,
      sub: humidityHint(current.humidity),
      iconColor: 'text-blue-500',
      bg: 'bg-[#EFF4FF]', // Soft blue from image
    },
    {
      icon: Wind,
      label: 'WIND SPEED',
      value: `${current.windSpeedKmh} km/h`,
      sub: current.windSpeedKmh > 15 ? 'High wind' : 'Calm',
      iconColor: 'text-slate-500',
      bg: 'bg-[#F4F5F7]', // Soft gray from image
    },
    {
      icon: CloudRain,
      label: 'RAIN CHANCE',
      value: `${current.rainProbability}%`,
      sub: current.rainProbability > 40 ? 'High risk' : 'Low risk',
      iconColor: 'text-[#14b8a6]', // Soft teal/cyan
      bg: 'bg-[#EBF7F8]', // Soft teal from image
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[15px] font-bold text-slate-800 uppercase tracking-widest">Current Weather</h3>
          <p className="text-gray-500 text-base capitalize mt-1">{current.description}</p>
        </div>
        {current.icon && (
          <img
            src={`https://openweathermap.org/img/wn/${current.icon}@4x.png`}
            alt={current.description}
            className="w-20 h-20 -my-4 -mr-4 object-contain drop-shadow-sm"
          />
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map(({ icon: Icon, label, value, sub, iconColor, bg }) => (
          <div key={label} className={`rounded-3xl p-5 sm:p-6 flex flex-col justify-between h-40 transition-transform hover:scale-[1.02]`}>
            <div>
              <Icon className={`${iconColor} mb-3`} size={24} strokeWidth={1.5} />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">{value}</p>
              <p className="text-sm text-slate-600 mt-1">{sub}</p>
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