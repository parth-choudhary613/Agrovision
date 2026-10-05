import WeatherAdvisory from "../components/weather/WeatherAdvisory";
import Footer from "../components/Footer";
import { CloudSun, Wind, Droplets } from "lucide-react";

const WeatherPage = () => {
  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-[#DCE5DC] p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2">
          <CloudSun size={18} className="text-[#40916C]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#66736B]">
            Agro-Meteorology
          </span>
        </div>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1B4332] mt-1.5">
          Weather Advisory &amp; Spray Safety Index
        </h1>
        <p className="font-sans text-xs sm:text-sm text-[#66736B] mt-1 max-w-2xl leading-relaxed">
          Evaluate field micro-climates, predict rain wash-off risks, and avoid spray drift with real-time agronomic weather calculations.
        </p>
      </div>

      {/* Main Weather Advisory Component */}
      <WeatherAdvisory />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default WeatherPage;
