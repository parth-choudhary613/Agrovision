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
  ShieldCheck,
} from "lucide-react";
import agroIcon from "../assets/agrovisionicon.png";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={19} />,
    },
    {
      name: "Disease Detection",
      path: "/disease-detection",
      icon: <Bug size={19} />,
    },
    {
      name: "My Crops",
      path: "/my-crops",
      icon: <Sprout size={19} />,
    },
    {
      name: "Spray Scheduler",
      path: "/spray-scheduler",
      icon: <Droplets size={19} />,
    },
    {
      name: "Weather Advisory",
      path: "/weather-advisory",
      icon: <CloudSun size={19} />,
    },
    {
      name: "History & Reports",
      path: "/history-reports",
      icon: <FileText size={19} />,
    },
    {
      name: "Knowledge Base",
      path: "/knowledge-base",
      icon: <BookOpen size={19} />,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <User size={19} />,
    },
  ];

  return (
    <>
      {/* Mobile Drawer Trigger Tab */}
      <button
        className={`
          lg:hidden fixed top-1/2 -translate-y-1/2 z-50
          flex items-center justify-center
          h-14 w-8 bg-[#1B4332] text-white
          rounded-r-xl shadow-lg border-y border-r border-[#40916C]/40
          transition-all duration-300 ease-in-out
          hover:bg-[#40916C] hover:w-10
          ${isOpen ? "left-72" : "left-0"}
        `}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Navigation Sidebar"
      >
        {isOpen ? (
          <ChevronLeft size={22} className="transition-transform duration-300" />
        ) : (
          <ChevronRight size={22} className="transition-transform duration-300" />
        )}
      </button>

      {/* Main Sidebar Aside */}
      <aside
        className={`
        fixed top-0 left-0 h-dvh bg-white border-r border-[#DCE5DC] transition-transform duration-300 ease-in-out z-50
        w-72 p-6 flex flex-col shadow-xl lg:shadow-none
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Brand Header */}
        <div className="mb-8 flex shrink-0 items-center gap-3.5 px-2">
          <div className="w-11 h-11 rounded-2xl bg-[#F7F5EE] border border-[#DCE5DC] flex items-center justify-center shadow-xs overflow-hidden shrink-0">
            <img
              src={agroIcon}
              alt="AgroVision Leaf Logo"
              className="w-8 h-8 object-contain"
            />
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-2xl font-bold text-[#1B4332] tracking-tight leading-none">
              AgroVision
            </h1>
            <p className="font-sans text-[10px] text-[#66736B] font-semibold uppercase tracking-widest mt-1">
              Precision Agritech
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar py-2">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#66736B]/80 mb-2">
            Platform Menu
          </p>
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) setIsOpen(false);
              }}
              className={({ isActive }) => `
                group relative flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 transition-all duration-200 text-sm font-medium
                ${
                  isActive
                    ? "bg-[#1B4332] text-white shadow-xs"
                    : "text-[#26332B] hover:bg-[#F7F5EE] hover:text-[#1B4332]"
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`transition-colors duration-200 ${
                        isActive
                          ? "text-[#D4A72C]"
                          : "text-[#40916C] group-hover:text-[#1B4332]"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.name}</span>
                  </div>

                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4A72C] shrink-0" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Platform Status Pill */}
        <div className="mt-auto pt-4 border-t border-[#DCE5DC]">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F7F5EE] border border-[#DCE5DC]">
            <div className="w-8 h-8 rounded-xl bg-[#1B4332]/10 text-[#1B4332] flex items-center justify-center shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#1B4332] truncate">
                AI Health Guard
              </p>
              <p className="text-[11px] text-[#66736B] truncate">
                60+ Diseases Monitored
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
