import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Bug, 
  Sprout, 
  Droplets, 
  CloudSun, 
  FileText, 
  Bell, 
  BookOpen, 
  Globe, 
  User, 
  ChevronRight,
  ChevronLeft,
  ArrowRight
} from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Disease Detection', icon: <Bug size={20} /> },
    { name: 'My Crops', icon: <Sprout size={20} /> },
    { name: 'Spray Scheduler', icon: <Droplets size={20} /> },
    { name: 'Weather Advisory', icon: <CloudSun size={20} /> },
    { name: 'History & Reports', icon: <FileText size={20} /> },
    { name: 'Notifications', icon: <Bell size={20} />, badge: 3 },
    { name: 'Knowledge Base', icon: <BookOpen size={20} /> },
    { name: 'Language', icon: <Globe size={20} />, subtext: 'हिंदी' },
    { name: 'Profile', icon: <User size={20} /> },
  ];

  return (
    <>
      {/* Mobile Toggle Button - High z-index [80] to sit above sidebar */}
      <button 
        className={`
          lg:hidden fixed top-1/2 -translate-y-1/2 z-[80] 
          flex items-center justify-center
          h-16 w-8 bg-[#1a4d2e] text-white 
          rounded-r-xl shadow-[4px_0_15px_rgba(0,0,0,0.15)] 
          transition-all duration-300 ease-in-out
          hover:bg-[#143a22] hover:w-10
          ${isOpen ? 'left-72' : 'left-0'}
        `}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Sidebar"
      >
        {isOpen ? (
          <ChevronLeft size={24} className="transition-transform duration-300" />
        ) : (
          <ChevronRight size={24} className="animate-pulse transition-transform duration-300" />
        )}
      </button>

      {/* Sidebar Container - Switched h-screen to h-[100dvh] for true full height */}
      <aside className={`
        fixed top-0 left-0 h-[100dvh] bg-white border-r border-gray-100 transition-transform duration-300 ease-in-out z-[70]
        w-72 p-6 flex flex-col shadow-2xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Logo Section */}
        <div className="flex items-center gap-3 mb-10 group cursor-pointer shrink-0">
          <div className="text-[#4caf50] transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
            <Sprout size={40} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1a4d2e] leading-tight">AgroVision</h1>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Smart Farming, Better Tomorrow</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar pb-4">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                setActiveTab(item.name);
                if(window.innerWidth < 1024) setIsOpen(false); 
              }}
              className={`
                group w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ease-out
                ${activeTab === item.name 
                  ? 'bg-[#1a4d2e] text-white shadow-lg translate-x-2' 
                  : 'text-gray-600 hover:bg-[#e8f5e9] hover:text-[#1a4d2e] hover:translate-x-1'}
              `}
            >
              <div className="flex items-center gap-4">
                <div className={`transition-transform duration-300 ${activeTab === item.name ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </div>
                <span className="font-medium text-sm">{item.name}</span>
              </div>
              
              {item.badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors duration-300
                  ${activeTab === item.name ? 'bg-white text-[#1a4d2e]' : 'bg-orange-500 text-white group-hover:animate-pulse'}
                `}>
                  {item.badge}
                </span>
              )}
              
              {item.subtext && (
                <span className={`text-[12px] px-2 py-0.5 rounded-md transition-colors duration-300
                  ${activeTab === item.name ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}
                `}>
                  {item.subtext}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom AI Assistant Card */}
        <div className="mt-auto pt-4 shrink-0">
          <div className="bg-[#e8f5e9] rounded-2xl p-4 relative overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <div className="relative z-10">
              <h3 className="text-[#1a4d2e] font-bold text-sm">AI-Powered</h3>
              <h3 className="text-[#1a4d2e] font-bold text-sm mb-1">Farming Assistant</h3>
              <p className="text-[#1a4d2e] text-[10px] opacity-80 mb-4 max-w-[120px]">
                Get accurate solutions for healthier crops
              </p>
              
              <button className="w-full bg-[#1a4d2e] text-white py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold transition-all duration-300 hover:bg-[#143a22] group-hover:gap-3">
                Scan Now <ArrowRight size={14} className="transition-transform duration-300" />
              </button>
            </div>
            
            {/* Simple Illustration Placeholder */}
            <div className="absolute right-[-10px] bottom-8 opacity-90 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
               <img 
                 src="https://cdn-icons-png.flaticon.com/512/1995/1995471.png" 
                 alt="Farmer" 
                 className="w-24 h-24 object-contain drop-shadow-md"
               />
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile - z-index [60] to sit below sidebar but above background content */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;