// components/ScheduleCalendarModal.jsx
// Shown when the user clicks "Add to Schedule" on a disease result.
// Lets the user pick one or more dates on a calendar, then POSTs them to /api/treatment.
import { useMemo, useState } from "react";
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL;
const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

const toDateKey = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const ScheduleCalendarModal = ({ result, scanId, token, onClose, onScheduled }) => {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const [viewMonth, setViewMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDates, setSelectedDates] = useState(() => new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const monthLabel = viewMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const calendarCells = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = firstOfMonth.getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));
    return cells;
  }, [viewMonth]);

  const goPrevMonth = () => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const goNextMonth = () => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  const isPast = (date) => date < today;

  const toggleDate = (date) => {
    if (!date || isPast(date)) return;
    const key = toDateKey(date);
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const sortedSelected = Array.from(selectedDates).sort();

  const handleSave = async () => {
    if (sortedSelected.length === 0) {
      setError("Pick at least one date on the calendar.");
      return;
    }
    if (!scanId) {
      setError("This scan can't be scheduled (missing scan reference).");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/treatment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ scanId, dates: sortedSelected }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to schedule sprays");

      if (onScheduled) onScheduled(data.treatment);
      onClose();
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-green-50 flex-shrink-0">
          <div>
            <h3 className="text-base font-bold text-gray-800">Add Spray to Schedule</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {result?.cropName || "Crop"} &nbsp;·&nbsp;
              <span className="text-red-600 font-medium">{result?.diseaseDetected || "Disease"}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 hover:bg-white/70 p-2 rounded-xl transition flex-shrink-0">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          {result?.pesticide && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-4">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">Pesticide</p>
              <p className="text-sm font-bold text-gray-800">{result.pesticide}</p>
            </div>
          )}

          <p className="text-sm text-gray-600 mb-3">
            Select the dates you want to spray. You can pick multiple days.
          </p>

          {/* Calendar */}
          <div className="border border-gray-100 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={goPrevMonth}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                aria-label="Previous month"
              >
                <ChevronLeft size={18} />
              </button>
              <p className="font-semibold text-gray-800 text-sm">{monthLabel}</p>
              <button
                type="button"
                onClick={goNextMonth}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                aria-label="Next month"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAY_LABELS.map((d, i) => (
                <div key={i} className="text-center text-[11px] font-semibold text-gray-400 py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((date, i) => {
                if (!date) return <div key={i} />;
                const key = toDateKey(date);
                const selected = selectedDates.has(key);
                const past = isPast(date);
                const isToday = toDateKey(date) === toDateKey(today);

                return (
                  <button
                    type="button"
                    key={key}
                    disabled={past}
                    onClick={() => toggleDate(date)}
                    className={`aspect-square rounded-lg text-sm font-medium transition flex items-center justify-center
                      ${past ? "text-gray-300 cursor-not-allowed" : "cursor-pointer"}
                      ${selected ? "bg-green-600 text-white shadow-sm" : !past ? "hover:bg-green-50 text-gray-700" : ""}
                      ${isToday && !selected ? "ring-1 ring-green-400" : ""}
                    `}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected dates summary */}
          {sortedSelected.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {sortedSelected.length} date{sortedSelected.length > 1 ? "s" : ""} selected
              </p>
              <div className="flex flex-wrap gap-2">
                {sortedSelected.map((key) => {
                  const d = new Date(key + "T00:00:00");
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full"
                    >
                      {d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      <button
                        type="button"
                        onClick={() => toggleDate(d)}
                        className="hover:text-green-900"
                        aria-label={`Remove ${key}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 mt-3 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-semibold text-sm transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || sortedSelected.length === 0}
            className="flex-1 bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-semibold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                <CalendarIcon size={16} /> Confirm Schedule
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCalendarModal;
