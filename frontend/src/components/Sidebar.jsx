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
  Menu, 
  X,
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
      {/* Mobile Toggle Button */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1a4d2e] text-white rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Container */}
      <aside className={`
  fixed top-0 left-0 h-screen bg-white border-r border-gray-100 transition-transform duration-300 z-50
  w-72 p-6 flex flex-col
  ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
`}>
        
        {/* Logo Section */}
        <div className="flex items-center gap-3 mb-10">
          <div className="text-[#4caf50]">
            <Sprout size={40} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1a4d2e] leading-tight">AgroVision</h1>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Smart Farming, Better Tomorrow</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`
                w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200
                ${activeTab === item.name 
                  ? 'bg-[#1a4d2e] text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-50'}
              `}
            >
              <div className="flex items-center gap-4">
                {item.icon}
                <span className="font-medium text-sm">{item.name}</span>
              </div>
              
              {item.badge && (
                <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
              
              {item.subtext && (
                <span className="bg-gray-100 text-gray-600 text-[12px] px-2 py-0.5 rounded-md">
                  {item.subtext}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom AI Assistant Card */}
        <div className="mt-6 bg-[#e8f5e9] rounded-2xl p-4 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-[#1a4d2e] font-bold text-sm">AI-Powered</h3>
            <h3 className="text-[#1a4d2e] font-bold text-sm mb-1">Farming Assistant</h3>
            <p className="text-[#1a4d2e] text-[10px] opacity-80 mb-4 max-w-[120px]">
              Get accurate solutions for healthier crops
            </p>
            
            <button className="w-full bg-[#1a4d2e] text-white py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold hover:bg-[#143a22] transition-colors">
              Scan Now <ArrowRight size={14} />
            </button>
          </div>
          
          {/* Simple Illustration Placeholder (Matching the Farmer in Screenshot) */}
          <div className="absolute right-[-10px] bottom-8 opacity-90">
             <img 
               src="https://cdn-icons-png.flaticon.com/512/1995/1995471.png" 
               alt="Farmer" 
               className="w-24 h-24 object-contain"
             />
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;