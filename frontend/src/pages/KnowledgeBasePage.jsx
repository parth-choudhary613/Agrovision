import { BookOpen, Sparkles } from "lucide-react";

const KnowledgeBasePage = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Knowledge Base</h2>
            <p className="text-sm text-gray-600">
              Learn more about crop care, disease prevention, and sustainable
              practices.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-green-700">
            <Sparkles size={18} />
            <h3 className="font-semibold">Best practices</h3>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Keep leaves dry, rotate treatments carefully, and follow local
            advice for safer crop care.
          </p>
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-blue-700">
            <BookOpen size={18} />
            <h3 className="font-semibold">Helpful resources</h3>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Use the scanner and weather advisory together to make more informed
            treatment decisions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBasePage;
