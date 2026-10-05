import { Thermometer, Droplets, Wind, CloudRain } from "lucide-react";

function humidityHint(humidity) {
  if (humidity > 90) return "Very High (Fungal Risk)";
  if (humidity >= 40 && humidity <= 80) return "Ideal Spray Range";
  return "Outside Optimum Range";
}

const WeatherCard = ({ weather }) => {
  if (!weather?.current) return null;
  const { current } = weather;

  const metrics = [
    {
      icon: Thermometer,
      label: "TEMPERATURE",
      value: `${current.temperature}°C`,
      sub: `Feels like ${current.feelsLike}°C`,
      iconColor: "text-amber-700",
      accentBg: "bg-amber-50/60",
    },
    {
      icon: Droplets,
      label: "HUMIDITY",
      value: `${current.humidity}%`,
      sub: humidityHint(current.humidity),
      iconColor: "text-[#40916C]",
      accentBg: "bg-[#F3F7F3]",
    },
    {
      icon: Wind,
      label: "WIND SPEED",
      value: `${current.windSpeedKmh} km/h`,
      sub: current.windSpeedKmh > 15 ? "High Drift Risk" : "Calm (Safe)",
      iconColor: "text-[#26332B]",
      accentBg: "bg-[#F7F5EE]",
    },
    {
      icon: CloudRain,
      label: "RAIN RISK",
      value: `${current.rainProbability}%`,
      sub: current.rainProbability > 40 ? "Wash-off Risk" : "Low Rain Risk",
      iconColor: "text-sky-700",
      accentBg: "bg-sky-50/60",
    },
  ];

  return (
    <div className="w-full">
      {/* Current Condition Summary Bar */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div>
          <span className="text-[11px] font-bold text-[#40916C] uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#40916C] animate-pulse" />
            Live Field Conditions
          </span>
          <p className="font-serif text-xl sm:text-2xl font-bold text-[#1B4332] capitalize mt-0.5">
            {current.description || "Field Weather Station"}
          </p>
        </div>

        {current.icon && (
          <div className="flex items-center gap-2 bg-[#F7F5EE] border border-[#DCE5DC] px-3.5 py-1.5 rounded-2xl">
            <img
              src={`https://openweathermap.org/img/wn/${current.icon}@2x.png`}
              alt={current.description}
              className="w-10 h-10 object-contain"
            />
            <span className="font-bold text-sm text-[#1B4332]">
              {current.temperature}°C
            </span>
          </div>
        )}
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {metrics.map(({ icon: Icon, label, value, sub, iconColor, accentBg }) => (
          <div
            key={label}
            className="bg-white border border-[#DCE5DC] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs hover:border-[#95B89A] transition-colors"
          >
            <div>
              <div
                className={`w-10 h-10 rounded-xl ${accentBg} border border-[#DCE5DC]/80 flex items-center justify-center mb-3`}
              >
                <Icon className={iconColor} size={20} strokeWidth={2} />
              </div>
              <p className="text-[10px] font-bold text-[#66736B] uppercase tracking-wider">
                {label}
              </p>
            </div>

            <div className="mt-3">
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1B4332] leading-tight">
                {value}
              </p>
              <p className="text-xs text-[#66736B] font-medium mt-1 truncate">
                {sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherCard;