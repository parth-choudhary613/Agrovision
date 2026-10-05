import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import agroIcon from "../assets/agrovisionicon.png";

const FacebookIcon = ({ size = 18, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = ({ size = 18, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const InstagramIcon = ({ size = 18, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const platformLinks = [
  { name: "Farm Dashboard", path: "/dashboard" },
  { name: "Disease Detection", path: "/disease-detection" },
  { name: "My Crops Health", path: "/my-crops" },
  { name: "Spray Scheduler", path: "/spray-scheduler" },
  { name: "Weather Advisory", path: "/weather-advisory" },
];

const agronomyLinks = [
  { name: "Agronomy Knowledge Base", path: "/knowledge-base" },
  { name: "History & Field Reports", path: "/history-reports" },
  { name: "Farmer Profile Settings", path: "/profile" },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-14 rounded-3xl bg-[#1B4332] text-white overflow-hidden shadow-lg border border-[#245842]">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center p-2 shrink-0">
                <img
                  src={agroIcon}
                  alt="AgroVision Logo"
                  className="w-full h-full object-contain brightness-0 invert"
                />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight block leading-none text-white">
                  AgroVision
                </span>
                <span className="font-sans text-[10px] text-[#95B89A] font-semibold uppercase tracking-wider block mt-1">
                  Precision Agritech Platform
                </span>
              </div>
            </div>

            <p className="font-sans text-sm text-white/70 leading-relaxed max-w-sm">
              Empowering farmers with AI-driven plant disease diagnostics, calibrated
              treatment protocols, and weather-synchronized field spraying to ensure
              sustainable, healthy harvests.
            </p>

            <div className="flex items-center gap-3 pt-2">
              {[FacebookIcon, TwitterIcon, InstagramIcon].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-[#40916C] hover:border-[#40916C] transition-all duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div className="md:col-span-3">
            <h3 className="font-serif text-base font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4A72C]" />
              Platform Solutions
            </h3>
            <ul className="space-y-2.5">
              {platformLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="font-sans text-xs text-white/70 hover:text-[#D4A72C] transition-colors duration-200 block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Agronomy Resources */}
          <div className="md:col-span-4">
            <h3 className="font-serif text-base font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#95B89A]" />
              Agronomic Resources
            </h3>
            <ul className="space-y-2.5">
              {agronomyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="font-sans text-xs text-white/70 hover:text-[#95B89A] transition-colors duration-200 block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
              <ShieldCheck className="text-[#95B89A] shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-sans text-xs font-semibold text-white">
                  Safe Spray Standard
                </p>
                <p className="font-sans text-[11px] text-white/60 leading-snug mt-0.5">
                  Backed by curated disease registries and OpenWeather micro-climate forecasting.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© {currentYear} AgroVision Technologies Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for sustainable agriculture &amp; progressive farmers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;