import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Navbar = () => {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show user info on signup page
  const isSignupPage = location.pathname === '/';

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token && !isSignupPage) {
      axios.get('https://agrovision-bfjf.onrender.com/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setUsername(res.data.username);
        setIsLoggedIn(true);
      })
      .catch(() => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
      });
    } else {
      setIsLoggedIn(false);
    }
  }, [isSignupPage]);

  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <nav className="bg-gray-950 border-b border-green-800 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
    

      {/* Show username & logout ONLY when logged in AND not on signup page */}
      {isLoggedIn && !isSignupPage && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white">
            👋 <span className="font-medium">{username}</span>
          </div>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-xl text-sm font-medium transition"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;