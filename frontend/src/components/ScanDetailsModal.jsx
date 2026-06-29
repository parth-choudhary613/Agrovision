// components/ScanDetailsModal.jsx
// Shown when the user clicks "View Details" on a scan result.
// Surfaces the fields the backend already returns but the summary card doesn't show:
// diseaseDescription and prevention (plus how-to-use / biological treatment if present).
import { X, ShieldCheck, Sprout, Bug, Droplets } from "lucide-react";

const splitIntoPoints = (text) => {
  if (!text) return [];
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);
};

const Section = ({ icon, title, accent, children }) => (
  <div className={`border ${accent.border} rounded-2xl overflow-hidden`}>
    <div className={`flex items-center gap-2 ${accent.bg} px-4 py-3 border-b ${accent.border}`}>
      {icon}
      <span className={`text-xs font-bold uppercase tracking-wider ${accent.text}`}>{title}</span>
    </div>
    <div className="px-4 py-3">{children}</div>
  </div>
);

const ScanDetailsModal = ({ result, onClose }) => {
  if (!result) return null;

  const diseaseDescription = result.diseaseDescription || null;
  const prevention         = result.prevention || null;
  const howToUse           = result.howToUse || null;
  const biologicalTreatment = result.biologicalTreatment || null;
  const preventionPoints   = splitIntoPoints(prevention);

  const hasAnything = diseaseDescription || prevention || howToUse || biologicalTreatment;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[85vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-red-50 border-b border-red-100 flex items-center justify-between px-6 py-4 flex-shrink-0">
          <div>
            <h3 className="text-base font-bold text-gray-800">Full Diagnosis Report</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {result.cropName || "Crop"} &nbsp;·&nbsp;
              <span className="text-red-600 font-medium">{result.diseaseDetected || "Unknown"}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 hover:bg-white/70 p-2 rounded-xl transition flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          {!hasAnything && (
            <p className="text-sm text-gray-500 text-center py-6">
              No additional details are available for this scan.
            </p>
          )}

          {/* Disease Description */}
          {diseaseDescription && (
            <Section
              icon={<Bug size={16} className="text-gray-600" />}
              title="About This Disease"
              accent={{ border: "border-gray-100", bg: "bg-gray-50", text: "text-gray-600" }}
            >
              <p className="text-sm text-gray-700 leading-relaxed">{diseaseDescription}</p>
            </Section>
          )}

          {/* How to Apply */}
          {howToUse && (
            <Section
              icon={<Droplets size={16} className="text-amber-700" />}
              title="How to Apply"
              accent={{ border: "border-amber-100", bg: "bg-amber-50", text: "text-amber-700" }}
            >
              <p className="text-sm text-gray-700 leading-relaxed">{howToUse}</p>
            </Section>
          )}

          {/* Biological Treatment */}
          {biologicalTreatment && (
            <Section
              icon={<Sprout size={16} className="text-green-700" />}
              title="Biological / Organic Treatment"
              accent={{ border: "border-green-100", bg: "bg-green-50", text: "text-green-700" }}
            >
              <p className="text-sm text-gray-700 leading-relaxed">{biologicalTreatment}</p>
            </Section>
          )}

          {/* Prevention */}
          {prevention && (
            <Section
              icon={<ShieldCheck size={16} className="text-purple-700" />}
              title="Prevention Tips"
              accent={{ border: "border-purple-100", bg: "bg-purple-50", text: "text-purple-700" }}
            >
              {preventionPoints.length > 1 ? (
                <ul className="space-y-2">
                  {preventionPoints.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-700">
                      <span className="text-purple-500 flex-shrink-0 mt-0.5">•</span>
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-700 leading-relaxed">{prevention}</p>
              )}
            </Section>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-xl font-semibold text-sm transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScanDetailsModal;
