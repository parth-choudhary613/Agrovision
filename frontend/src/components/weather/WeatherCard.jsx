// frontend/src/components/weather/WeatherCard.jsx
//
// NEW COMPONENT — Weather-Based Spray Advisory module.
// Purely presentational: displays current weather metrics.
// Does not import or modify any existing disease-detection component.

import React from 'react';
import { Thermometer, Droplets, Wind, CloudRain } from 'lucide-react';

const WeatherCard = ({ weather }) => {
  if (!weather?.current) return null;
  const { current } = weather;

  const metrics = [
    {
      icon: Thermometer,
      label: 'Temperature',
      value: `${current.temperature}°C`,
      sub: `Feels like ${current.feelsLike}°C`,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      icon: Droplets,
      label: 'Humidity',
      value: `${current.humidity}%`,
      sub: humidityHint(current.humidity),
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: Wind,
      label: 'Wind Speed',
      value: `${current.windSpeedKmh} km/h`,
      sub: current.windSpeedKmh > 15 ? 'High wind' : 'Calm',
      color: 'text-slate-600',
      bg: 'bg-slate-50',
    },
    {
      icon: CloudRain,
      label: 'Rain Chance',
      value: `${current.rainProbability}%`,
      sub: current.rainProbability > 40 ? 'High risk' : 'Low risk',
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
    },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Current Weather</h3>
          <p className="text-sm text-gray-400 capitalize mt-0.5">{current.description}</p>
        </div>
        {current.icon && (
          <img
            src={`https://openweathermap.org/img/wn/${current.icon}@2x.png`}
            alt={current.description}
            className="w-14 h-14 -mr-2"
          />
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map(({ icon: Icon, label, value, sub, color, bg }) => (
          <div key={label} className={`rounded-2xl p-4 ${bg}`}>
            <Icon className={`${color} mb-2`} size={20} />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
            <p className="text-lg font-bold text-gray-800 mt-0.5">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
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
