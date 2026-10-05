import { X, ShieldCheck, Sprout, Bug, Droplets } from "lucide-react";

const splitIntoPoints = (text) => {
  if (!text) return [];
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);
};

const Section = ({ icon, title, accent, children }) => (
  <div className="border border-[#DCE5DC] rounded-2xl overflow-hidden bg-white shadow-2xs">
    <div
      className={`flex items-center gap-2 px-4 py-2.5 border-b border-[#DCE5DC] ${accent.bg}`}
    >
      {icon}
      <span className={`text-xs font-bold uppercase tracking-wider ${accent.text}`}>
        {title}
      </span>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const ScanDetailsModal = ({ result, onClose }) => {
  if (!result) return null;

  const diseaseDescription = result.diseaseDescription || null;
  const prevention = result.prevention || null;
  const howToUse = result.howToUse || null;
  const biologicalTreatment = result.biologicalTreatment || null;
  const preventionPoints = splitIntoPoints(prevention);

  const hasAnything =
    diseaseDescription || prevention || howToUse || biologicalTreatment;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[85vh] flex flex-col shadow-2xl border border-[#DCE5DC]">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#F7F5EE] border-b border-[#DCE5DC] flex items-center justify-between px-6 py-4.5 shrink-0">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#1B4332]">
              Crop Pathology Report
            </h3>
            <p className="text-xs text-[#66736B] mt-0.5">
              {result.cropName || "Crop"} &nbsp;·&nbsp;
              <span className="font-semibold text-rose-800">
                {result.diseaseDetected || "Disease Condition"}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#66736B] hover:text-[#26332B] hover:bg-white p-2 rounded-xl transition shrink-0 border border-transparent hover:border-[#DCE5DC]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 flex flex-col gap-4 overflow-y-auto">
          {!hasAnything && (
            <p className="text-sm text-[#66736B] text-center py-6">
              No supplementary clinical details available for this scan.
            </p>
          )}

          {/* Disease Description */}
          {diseaseDescription && (
            <Section
              icon={<Bug size={16} className="text-[#1B4332]" />}
              title="Pathology Overview"
              accent={{
                bg: "bg-[#F7F5EE]",
                text: "text-[#1B4332]",
              }}
            >
              <p className="text-xs sm:text-sm text-[#26332B] leading-relaxed">
                {diseaseDescription}
              </p>
            </Section>
          )}

          {/* How to Apply */}
          {howToUse && (
            <Section
              icon={<Droplets size={16} className="text-[#D4A72C]" />}
              title="Application Guidelines"
              accent={{
                bg: "bg-amber-50/70",
                text: "text-amber-900",
              }}
            >
              <p className="text-xs sm:text-sm text-[#26332B] leading-relaxed">
                {howToUse}
              </p>
            </Section>
          )}

          {/* Biological Treatment */}
          {biologicalTreatment && (
            <Section
              icon={<Sprout size={16} className="text-[#40916C]" />}
              title="Biological &amp; Organic Alternatives"
              accent={{
                bg: "bg-[#F3F7F3]",
                text: "text-[#1B4332]",
              }}
            >
              <p className="text-xs sm:text-sm text-[#26332B] leading-relaxed">
                {biologicalTreatment}
              </p>
            </Section>
          )}

          {/* Prevention */}
          {prevention && (
            <Section
              icon={<ShieldCheck size={16} className="text-[#40916C]" />}
              title="Agronomic Prevention Tips"
              accent={{
                bg: "bg-[#F7F5EE]",
                text: "text-[#1B4332]",
              }}
            >
              {preventionPoints.length > 1 ? (
                <ul className="space-y-2">
                  {preventionPoints.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-xs sm:text-sm text-[#26332B]">
                      <span className="text-[#40916C] shrink-0 font-bold">•</span>
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs sm:text-sm text-[#26332B] leading-relaxed">
                  {prevention}
                </p>
              )}
            </Section>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#DCE5DC] bg-[#FAF9F5] shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-[#1B4332] hover:bg-[#40916C] text-white py-3 rounded-xl font-semibold text-xs sm:text-sm transition-colors shadow-xs"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScanDetailsModal;
