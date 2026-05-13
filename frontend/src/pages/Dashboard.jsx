import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setUsername(res.data.username))
      .catch(() => navigate('/'));
    } else {
      navigate('/');
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 to-teal-950 text-white">
      {/* Top Bar */}
      <div className="flex justify-between items-center p-6 border-b border-green-800">
        <div>
          <h1 className="text-4xl font-bold">Welcome back, {username}! 👋</h1>
          <p className="text-green-400 mt-1">Here's what's happening in your farm today.</p>
        </div>
        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-2xl font-medium transition"
        >
          Logout
        </button>
      </div>

      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <button className="bg-green-600 hover:bg-green-700 text-lg px-8 py-4 rounded-2xl flex items-center gap-3 font-semibold">
            + Scan New Plant
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;