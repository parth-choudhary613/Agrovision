import WeatherAdvisory from "../components/weather/WeatherAdvisory";

const WeatherPage = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">Weather Advisory</h2>
        <p className="mt-2 text-sm text-gray-600">
          Check spray-friendly weather and avoid applying treatments under risky
          conditions.
        </p>
      </div>

      <WeatherAdvisory />
    </div>
  );
};

export default WeatherPage;
