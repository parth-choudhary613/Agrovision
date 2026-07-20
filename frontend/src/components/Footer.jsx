import React from "react";
import { Link } from "react-router-dom";
// Removed Facebook, Twitter, and Instagram from the lucide-react import
import { Sprout, Mail, Phone, MapPin, Heart } from "lucide-react";

// --- Inline SVG Replacements for Brand Icons ---
const FacebookIcon = ({ size = 18, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const TwitterIcon = ({ size = 18, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);

const InstagramIcon = ({ size = 18, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const quickLinks = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Disease Detection", path: "/dashboard" },
  { name: "Spray Scheduler", path: "/dashboard" },
  { name: "Weather Advisory", path: "/dashboard" },
];

const resourceLinks = [
  { name: "Knowledge Base", path: "/dashboard" },
  { name: "History & Reports", path: "/dashboard" },
  { name: "Notifications", path: "/dashboard" },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 rounded-[32px] relative overflow-hidden bg-gradient-to-br from-[#2b5a3d] via-[#3b6f4d] to-[#214a32] text-white shadow-2xl mb-4 sm:mx-0">
      
      {/* ── Custom Animations & Background Effects ── */}
      <style>
        {`
          @keyframes float-leaf {
            0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 0.03; }
            50% { transform: translateY(-20px) rotate(10deg) scale(1.1); opacity: 0.06; }
            100% { transform: translateY(0) rotate(0deg) scale(1); opacity: 0.03; }
          }
          .animate-leaf-1 { animation: float-leaf 7s ease-in-out infinite; }
          .animate-leaf-2 { animation: float-leaf 9s ease-in-out infinite reverse; }
          .animate-leaf-3 { animation: float-leaf 11s ease-in-out infinite 2s; }
        `}
      </style>

      {/* ── Abstract Nature Background Elements ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-40 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        
        <Sprout className="absolute top-10 right-20 w-32 h-32 text-green-400 animate-leaf-1" />
        <Sprout className="absolute bottom-20 left-10 w-48 h-48 text-emerald-300 animate-leaf-2" />
        <Sprout className="absolute top-1/2 left-1/2 w-24 h-24 text-green-500 animate-leaf-3" />
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 px-8 sm:px-12 py-12 sm:py-16">
        
        {/* ── Brand Section ── */}
        <div className="md:col-span-5 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-2.5 rounded-2xl shadow-lg shadow-green-900/50">
              <Sprout size={32} className="text-white" fill="currentColor" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                AgroVision
              </h2>
              <p className="text-[11px] text-green-400 font-bold uppercase tracking-widest mt-0.5">
                Smart Farming, Better Tomorrow
              </p>
            </div>
          </div>
          <p className="text-sm text-white/60 leading-relaxed max-w-sm mt-2">
            AI-powered crop disease detection and weather-based spray scheduling. 
            Empowering modern farmers to protect their yield and farm smarter with real-time insights.
          </p>
          
          {/* Social Icons with SVG replacements */}
          <div className="flex items-center gap-4 mt-2">
            {[FacebookIcon, TwitterIcon, InstagramIcon].map((Icon, idx) => (
              <a key={idx} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-green-500 hover:border-green-400 hover:scale-110 hover:-translate-y-1 transition-all duration-300 text-white/70 hover:text-white shadow-sm">
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* ── Quick Links ── */}
        <div className="md:col-span-2">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Quick Links
          </h3>
          <ul className="space-y-3">
            {quickLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className="group flex items-center text-sm text-white/60 hover:text-green-400 transition-colors duration-300"
                >
                  <span className="w-0 overflow-hidden group-hover:w-4 transition-all duration-300 ease-out text-green-500">
                    &rarr;
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    {link.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Resources ── */}
        <div className="md:col-span-2">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Resources
          </h3>
          <ul className="space-y-3">
            {resourceLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className="group flex items-center text-sm text-white/60 hover:text-emerald-400 transition-colors duration-300"
                >
                  <span className="w-0 overflow-hidden group-hover:w-4 transition-all duration-300 ease-out text-emerald-500">
                    &rarr;
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    {link.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Contact Info ── */}
        <div className="md:col-span-3">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            Get in Touch
          </h3>
          <ul className="space-y-4 text-sm text-white/70">
            <li className="flex items-start gap-3 group">
              <div className="bg-white/5 p-2 rounded-lg group-hover:bg-green-500/20 transition-colors border border-white/5">
                <Mail size={16} className="text-green-400" />
              </div>
              <span className="mt-1.5 group-hover:text-white transition-colors">support@agrovision.app</span>
            </li>
            <li className="flex items-start gap-3 group">
              <div className="bg-white/5 p-2 rounded-lg group-hover:bg-green-500/20 transition-colors border border-white/5">
                <Phone size={16} className="text-green-400" />
              </div>
              <span className="mt-1.5 group-hover:text-white transition-colors">+91 98765 43210</span>
            </li>
            <li className="flex items-start gap-3 group">
              <div className="bg-white/5 p-2 rounded-lg group-hover:bg-green-500/20 transition-colors border border-white/5">
                <MapPin size={16} className="text-green-400" />
              </div>
              <span className="mt-1.5 group-hover:text-white transition-colors leading-relaxed">
                Agro Hub, GT Road,<br />
                Panipat, Haryana, India
              </span>
            </li>
          </ul>
        </div>

      </div>

      {/* ── Bottom Bar ── */}
      <div className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-md px-8 sm:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm font-medium text-white/50">
          &copy; {year} <span className="text-white/80">AgroVision</span>. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm font-medium text-white/50">
          <span className="hover:text-green-400 transition-colors cursor-pointer">
            Privacy Policy
          </span>
          <span className="w-1 h-1 rounded-full bg-white/20 hidden sm:block"></span>
          <span className="hover:text-green-400 transition-colors cursor-pointer">
            Terms of Service
          </span>
          <span className="w-1 h-1 rounded-full bg-white/20 hidden sm:block"></span>
          <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            Made with <Heart size={14} className="text-rose-500 fill-rose-500 animate-pulse" /> for farmers
          </span>
        </div>
      </div>

    </footer>
  );
};

export default Footer;