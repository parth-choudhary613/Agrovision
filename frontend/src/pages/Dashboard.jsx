import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Bell,
  ChevronDown,
  Languages,
  Plus,
} from 'lucide-react';

const Dashboard = () => {
  const [username, setUsername] = useState('');
  const [picture, setPicture] = useState('');   // Google profile pic URL
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
const [loginType, setLoginType] = useState('');
  
  const dropdownRef = useRef();

  const navigate = useNavigate();
  const location = useLocation();

  const isSignupPage = location.pathname === '/';

  // Returns first name only (e.g. "John Doe" → "John")
  const firstName = username ? username.split(' ')[0] : '';

  // First letter of username for avatar fallback
  const initial = username ? username.charAt(0).toUpperCase() : '?';

  useEffect(() => {
  const token = localStorage.getItem('token');

  if (!token) {
    navigate('/');
    return;
  }

  axios
    .get('http://localhost:5000/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      setUsername(res.data.username || '');
      setPicture(res.data.picture || '');
      setLoginType(res.data.loginType || '');
      setIsLoggedIn(true);
    })
    .catch((err) => {
      console.log(err);

      localStorage.removeItem('token');

      setIsLoggedIn(false);

      navigate('/');
    });
}, [navigate]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpenDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // Avatar: Google pic if available, else coloured initial circle
  const Avatar = ({ size = 'md' }) => {
    const dimensions = size === 'sm' ? 'w-9 h-9 text-sm' : 'w-11 h-11 text-base';

    if (picture) {
      return (
        <img
          src={picture}
          alt="profile"
          className={`${dimensions} rounded-full object-cover border border-gray-200 flex-shrink-0`}
          referrerPolicy="no-referrer"   // required for Google avatars
        />
      );
    }

    return (
      <div
        className={`${dimensions} rounded-full bg-green-700 text-white flex items-center justify-center font-bold flex-shrink-0 border border-green-600`}
      >
        {initial}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] lg:ml-72">

      {/* Top Navbar */}
      <div className="w-full bg-white border-b border-gray-200 px-6 lg:px-8 py-5 flex items-center justify-between">

        {/* Left */}
        <div>
          <h1 className="text-2xl lg:text-5xl font-bold text-black">
            {/* Show first name for Google users, full username for phone users */}
            Welcome back, {loginType === 'phone' ? username : firstName}!👋
          </h1>

          <p className="text-gray-500 text-sm lg:text-xl mt-2">
            Here's what's happening in your farm today.
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4 lg:gap-6">

          {/* Language */}
          <div className="hidden md:flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition">
            <Languages size={18} className="text-gray-600" />
            <span className="font-medium text-gray-700">English</span>
            <ChevronDown size={18} className="text-gray-500" />
          </div>

          {/* Notification */}
          <div className="relative cursor-pointer">
            <Bell size={24} className="text-gray-700" />
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-semibold">
              3
            </div>
          </div>

          {/* Profile Dropdown */}
          {isLoggedIn && !isSignupPage && (
            <div className="relative" ref={dropdownRef}>

              <div
                onClick={() => setOpenDropdown(!openDropdown)}
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-xl transition"
              >
                {/* Avatar: Google pic OR initial */}
                <Avatar size="md" />

                <div className="hidden md:block leading-tight">
                  {/* Show first name only in the dropdown trigger */}
                  <h3 className="font-semibold text-gray-800 text-[15px]">
                    {firstName}
                  </h3>
                  <p className="text-sm text-gray-500">Farmer</p>
                </div>

                <ChevronDown
                  size={18}
                  className={`text-gray-500 transition ${openDropdown ? 'rotate-180' : ''}`}
                />
              </div>

              {/* Dropdown Menu */}
              {openDropdown && (
                <div className="absolute right-0 top-16 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">

                  {/* Profile header inside dropdown */}
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                    <Avatar size="sm" />
                    <div className="min-w-0">
                      {/* Full name here */}
                      <h3 className="font-semibold text-gray-800 truncate">{username}</h3>
                      <p className="text-sm text-gray-500">Farmer Account</p>
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    className="w-full text-left px-5 py-4 text-red-600 hover:bg-red-50 transition font-medium"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Scan Button */}
          <button className="bg-green-700 hover:bg-green-800 text-white px-5 lg:px-7 py-3 lg:py-4 rounded-2xl flex items-center gap-2 text-sm lg:text-lg font-medium shadow-md transition">
            <Plus size={20} />
            <span className="hidden md:block">Scan New Plant</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 lg:p-8">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-125">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Dashboard Overview
          </h2>
          <p className="text-gray-500">
            Your smart farming analytics and tools will appear here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
