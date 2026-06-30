// components/UpcomingSpraysCard.jsx
// Dashboard card listing the next scheduled sprays, matching the
// "Upcoming Spray Reminders" design: crop icon, disease + pesticide,
// days-until + date, a "Treatment Done" action, and a status pill (Due Soon / Upcoming).
import { useEffect, useState, useCallback } from "react";
import { Calendar, CheckCircle2, Loader2 } from "lucide-react";

const CROP_ICON = {
  tomato: "🍅",
  potato: "🥔",
  chilli: "🌶️",
  chili: "🌶️",
  pepper: "🌶️",
  wheat: "🌾",
  rice: "🌾",
  cotton: "☁️",
  corn: "🌽",
  maize: "🌽",
  onion: "🧅",
  brinjal: "🍆",
  eggplant: "🍆",
  cucumber: "🥒",
  cabbage: "🥬",
  grape: "🍇",
  apple: "🍎",
  banana: "🍌",
  mango: "🥭",
  sugarcane: "🎋",
};

const getCropIcon = (cropName = "") => {
  const key = cropName.toLowerCase();
  const match = Object.keys(CROP_ICON).find((k) => key.includes(k));
  return match ? CROP_ICON[match] : "🌱";
};

const daysUntil = (dateStr) => {
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
};

const StatusPill = ({ days }) => {
  if (days <= 2) {
    return (
      <span className="bg-emerald-50 text-emerald-600 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
        Due Soon
      </span>
    );
  }
  return (
    <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
      Upcoming
    </span>
  );
};

const SprayRow = ({ item, onMarkDone, isMarking }) => {
  const days = daysUntil(item.date);
  const dateLabel = new Date(item.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const daysLabel = days <= 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days} Days`;

  return (
    <div className="flex items-start gap-3 py-4">
      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-2xl flex-shrink-0">
        {getCropIcon(item.cropName)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 text-sm truncate">
          {item.cropName} {item.disease ? `– ${item.disease}` : ""}
        </p>
        {item.pesticide && (
          <p className="text-sm text-gray-400 truncate">{item.pesticide}</p>
        )}
        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
          <Calendar size={12} />
          {daysLabel} &nbsp;·&nbsp; {dateLabel}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => onMarkDone(item)}
            disabled={isMarking}
            title="Mark this spray as done"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-purple-200 text-purple-600 hover:bg-purple-50 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isMarking ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
            Treatment Done
          </button>
          <StatusPill days={days} />
        </div>
      </div>
    </div>
  );
};

const UpcomingSpraysCard = ({ token, refreshKey, onTreatmentDone }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);
  // Tracks sprayIds currently being marked done, so a row's button is
  // disabled the instant it's clicked — this, combined with removing the
  // row from `items` on success, is what prevents the same spray from
  // ever bumping the "Treatments Done" metric more than once.
  const [markingIds, setMarkingIds] = useState(() => new Set());

  const fetchUpcoming = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/treatment/upcoming?limit=20", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to load upcoming sprays");
      setItems(data.upcoming || []);
    } catch (e) {
      setError(e.message || "Failed to load upcoming sprays");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUpcoming();
  }, [fetchUpcoming, refreshKey]);

  const handleMarkDone = useCallback(
    async (item) => {
      const key = `${item.treatmentId}-${item.sprayId}`;
      // Already in-flight (or somehow already removed) — never double-fire.
      if (markingIds.has(key)) return;

      setMarkingIds((prev) => new Set(prev).add(key));
      try {
        const res = await fetch(
          `http://localhost:5000/api/treatment/${item.treatmentId}/spray/${item.sprayId}`,
          {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Failed to update spray status");

        // Remove the now-completed spray from the visible list so it can
        // never be clicked again, then bump the metric exactly once.
        setItems((prev) =>
          prev.filter((i) => `${i.treatmentId}-${i.sprayId}` !== key)
        );
        if (onTreatmentDone) onTreatmentDone();
      } catch (e) {
        alert(e.message || "Failed to mark treatment as done. Please try again.");
      } finally {
        setMarkingIds((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    },
    [token, markingIds, onTreatmentDone]
  );

  const visibleItems = showAll ? items : items.slice(0, 3);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-bold text-gray-900">Upcoming Spray Reminders</h2>
        {items.length > 3 && (
          <button
            onClick={() => setShowAll((s) => !s)}
            className="text-sm font-semibold text-green-700 hover:text-green-800"
          >
            {showAll ? "Show Less" : "View All"}
          </button>
        )}
      </div>

      {loading && (
        <div className="py-8 text-center text-sm text-gray-400">Loading schedule…</div>
      )}

      {!loading && error && (
        <div className="py-8 text-center text-sm text-red-500">{error}</div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-sm text-gray-400">No sprays scheduled yet.</p>
          <p className="text-xs text-gray-400 mt-1">
            Scan a crop, then tap "Add to Schedule" to plan your next spray.
          </p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="divide-y divide-gray-100">
          {visibleItems.map((item) => (
            <SprayRow
              key={`${item.treatmentId}-${item.sprayId}`}
              item={item}
              onMarkDone={handleMarkDone}
              isMarking={markingIds.has(`${item.treatmentId}-${item.sprayId}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingSpraysCard;
