import { BookOpen, Sparkles, ShieldCheck, Droplets, Leaf, Sun } from "lucide-react";
import Footer from "../components/Footer";

const KnowledgeBasePage = () => {
  const articles = [
    {
      icon: Leaf,
      title: "Integrated Pest Management (IPM)",
      category: "Field Strategy",
      content:
        "Combine biological controls, habitat manipulation, and targeted chemical applications. Regularly inspect crop perimeters to intercept pests before extensive infestation occurs.",
    },
    {
      icon: Droplets,
      title: "Leaf Wetness & Fungal Proliferation",
      category: "Pathology Prevention",
      content:
        "Prolonged leaf moisture (over 6 hours) significantly accelerates fungal spore germination. Irrigate fields during early mornings to allow rapid solar drying of foliar surfaces.",
    },
    {
      icon: ShieldCheck,
      title: "Pesticide Resistance Management",
      category: "Chemical Safety",
      content:
        "Continuous use of fungicides with identical modes of action creates resistant disease strains. Always alternate chemical classes across sequential spray cycles.",
    },
    {
      icon: Sun,
      title: "Spray Window Optimization",
      category: "Weather Sync",
      content:
        "Optimal spraying occurs when wind speed is between 3–10 km/h and temperatures remain below 28°C. This minimizes droplet evaporation and prevents chemical volatilization.",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-[#DCE5DC] p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-[#40916C]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#66736B]">
            Agricultural Knowledge Base
          </span>
        </div>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1B4332] mt-1.5">
          Agronomy Library &amp; Best Practices
        </h1>
        <p className="font-sans text-xs sm:text-sm text-[#66736B] mt-1 max-w-2xl leading-relaxed">
          Curated guidelines on crop pathology, organic disease prevention, precision chemical dosages, and sustainable farming methods.
        </p>
      </div>

      {/* Articles Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {articles.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-[#DCE5DC] p-6 sm:p-7 shadow-xs hover:border-[#95B89A] transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3.5 border-b border-[#DCE5DC] mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#40916C]">
                    {item.category}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-[#F7F5EE] border border-[#DCE5DC] flex items-center justify-center text-[#1B4332]">
                    <Icon size={18} />
                  </div>
                </div>

                <h3 className="font-serif text-lg font-bold text-[#1B4332] mb-2">
                  {item.title}
                </h3>
                <p className="font-sans text-xs sm:text-sm text-[#66736B] leading-relaxed">
                  {item.content}
                </p>
              </div>

              <div className="pt-4 border-t border-[#DCE5DC] mt-5 flex items-center gap-1.5 text-xs font-semibold text-[#1B4332]">
                <Sparkles size={14} className="text-[#D4A72C]" />
                <span>Verified Agricultural Protocol</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default KnowledgeBasePage;
