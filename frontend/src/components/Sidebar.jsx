import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Bug,
  Sprout,
  Droplets,
  CloudSun,
  FileText,
  BookOpen,
  User,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Disease Detection",
      path: "/disease-detection",
      icon: <Bug size={20} />,
    },
    { name: "My Crops", path: "/my-crops", icon: <Sprout size={20} /> },
    {
      name: "Spray Scheduler",
      path: "/spray-scheduler",
      icon: <Droplets size={20} />,
    },
    {
      name: "Weather Advisory",
      path: "/weather-advisory",
      icon: <CloudSun size={20} />,
    },
    {
      name: "History & Reports",
      path: "/history-reports",
      icon: <FileText size={20} />,
    },
    {
      name: "Knowledge Base",
      path: "/knowledge-base",
      icon: <BookOpen size={20} />,
    },
    { name: "Profile", path: "/profile", icon: <User size={20} /> },
  ];

  return (
    <>
      <button
        className={`
          lg:hidden fixed top-1/2 -translate-y-1/2 z-80
          flex items-center justify-center
          h-16 w-8 bg-[#1a4d2e] text-white
          rounded-r-xl shadow-[4px_0_15px_rgba(0,0,0,0.15)]
          transition-all duration-300 ease-in-out
          hover:bg-[#143a22] hover:w-10
          ${isOpen ? "left-72" : "left-0"}
        `}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Sidebar"
      >
        {isOpen ? (
          <ChevronLeft
            size={24}
            className="transition-transform duration-300"
          />
        ) : (
          <ChevronRight
            size={24}
            className="animate-pulse transition-transform duration-300"
          />
        )}
      </button>

      <aside
        className={`
        fixed top-0 left-0 h-dvh bg-white border-r border-gray-100 transition-transform duration-300 ease-in-out z-70
        w-72 p-6 flex flex-col shadow-2xl lg:shadow-none
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="mb-10 flex shrink-0 items-center gap-3 group cursor-pointer">
          <div className="text-[#4caf50] transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
            <Sprout size={80} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1a4d2e] leading-tight">
              AgroVision
            </h1>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
              Smart Farming, Better Tomorrow
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar pb-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) setIsOpen(false);
              }}
              className={({ isActive }) => `
                group flex w-full items-center justify-between rounded-xl px-4 py-3 transition-all duration-300 ease-out
                ${
                  isActive
                    ? "bg-[#1a4d2e] text-white shadow-lg translate-x-2"
                    : "text-gray-600 hover:bg-[#e8f5e9] hover:text-[#1a4d2e] hover:translate-x-1"
                }
              `}
            >
              <div className="flex items-center gap-4">
                <div className="transition-transform duration-300 group-hover:scale-110">
                  {item.icon}
                </div>
                <span className="text-sm font-medium">{item.name}</span>
              </div>
            </NavLink>
          ))}
        </nav>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-60 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
