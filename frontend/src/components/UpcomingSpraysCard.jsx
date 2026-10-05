import { useEffect, useState, useCallback } from "react";
import { Calendar, CheckCircle2, Loader2, Clock, AlertCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

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
      <span className="bg-[#D4A72C]/15 text-[#1B4332] border border-[#D4A72C]/30 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
        Due Soon
      </span>
    );
  }
  return (
    <span className="bg-[#F3F7F3] text-[#40916C] border border-[#95B89A]/40 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
      Scheduled
    </span>
  );
};

const SprayRow = ({ item, onMarkDone, isMarking }) => {
  const days = daysUntil(item.date);
  const dateLabel = new Date(item.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const daysLabel =
    days <= 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days} Days`;

  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-[#DCE5DC] last:border-b-0">
      <div className="w-11 h-11 rounded-2xl bg-[#F7F5EE] border border-[#DCE5DC] flex items-center justify-center text-xl shrink-0">
        {getCropIcon(item.cropName)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-bold text-[#26332B] text-sm truncate leading-tight">
            {item.cropName} {item.disease ? `– ${item.disease}` : ""}
          </p>
          <StatusPill days={days} />
        </div>

        {item.pesticide && (
          <p className="text-xs text-[#1B4332] font-semibold truncate mt-1">
            {item.pesticide}
          </p>
        )}

        <div className="flex items-center gap-1.5 text-[11px] text-[#66736B] mt-1 font-medium">
          <Calendar size={13} className="text-[#40916C] shrink-0" />
          <span className="truncate">
            {daysLabel} &nbsp;·&nbsp; {dateLabel}
          </span>
        </div>

        <div className="mt-2.5">
          <button
            onClick={() => onMarkDone(item)}
            disabled={isMarking}
            title="Mark this spray as completed in field"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#40916C] text-[#1B4332] hover:bg-[#F3F7F3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-2xs"
          >
            {isMarking ? (
              <Loader2 size={13} className="animate-spin text-[#40916C]" />
            ) : (
              <CheckCircle2 size={13} className="text-[#40916C]" />
            )}
            <span>Mark Treatment Done</span>
          </button>
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
  const [markingIds, setMarkingIds] = useState(() => new Set());

  useEffect(() => {
    let ignore = false;
    if (!token) {
      return;
    }

    const loadData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/treatment/upcoming?limit=20`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!ignore) {
          if (!data.success)
            throw new Error(data.error || "Failed to load upcoming sprays");
          setItems(data.upcoming || []);
          setError("");
        }
      } catch (e) {
        if (!ignore) {
          setError(e.message || "Failed to load upcoming sprays");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      ignore = true;
    };
  }, [token, refreshKey]);

  const handleMarkDone = useCallback(
    async (item) => {
      const key = `${item.treatmentId}-${item.sprayId}`;
      if (markingIds.has(key)) return;

      setMarkingIds((prev) => new Set(prev).add(key));
      try {
        const res = await fetch(
          `${API_URL}/api/treatment/${item.treatmentId}/spray/${item.sprayId}`,
          {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Failed to update spray status");

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

  const displayedItems = showAll ? items : items.slice(0, 4);

  return (
    <div className="bg-white rounded-3xl border border-[#DCE5DC] shadow-xs p-5 sm:p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-[#DCE5DC] mb-2">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-[#40916C]" />
            <h3 className="font-serif text-lg font-bold text-[#1B4332]">
              Upcoming Sprays
            </h3>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F7F5EE] border border-[#DCE5DC] text-[#1B4332]">
            {items.length} Pending
          </span>
        </div>

        {loading && (
          <div className="py-10 flex flex-col items-center justify-center gap-2 text-[#66736B]">
            <Loader2 className="animate-spin text-[#40916C]" size={24} />
            <span className="text-xs font-medium">Checking spray calendar...</span>
          </div>
        )}

        {error && !loading && (
          <div className="my-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#F7F5EE] border border-[#DCE5DC] flex items-center justify-center mx-auto mb-2 text-[#40916C]">
              <CheckCircle2 size={24} />
            </div>
            <p className="font-bold text-sm text-[#26332B]">No Sprays Scheduled</p>
            <p className="text-xs text-[#66736B] mt-1 max-w-[200px] mx-auto">
              Scan a crop to add recommended pesticide treatments to your calendar.
            </p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="divide-y divide-[#DCE5DC]">
            {displayedItems.map((item) => (
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

      {items.length > 4 && (
        <div className="pt-4 border-t border-[#DCE5DC] mt-2">
          <button
            onClick={() => setShowAll((v) => !v)}
            className="w-full text-center text-xs font-bold text-[#1B4332] hover:text-[#40916C] transition-colors py-1"
          >
            {showAll ? "Show Less" : `View All (${items.length}) Sprays`}
          </button>
        </div>
      )}
    </div>
  );
};

export default UpcomingSpraysCard;