import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    axios.get('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setUsername(res.data.username);
    })
    .catch(() => {
      localStorage.removeItem('token');
      navigate('/');
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 to-teal-950 text-white">
      {/* Hero / Welcome Section */}
      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl font-bold mb-2">
            Welcome back, <span className="text-green-400">{username}</span>! 👋
          </h1>
          <p className="text-green-400 text-xl">
            Here's what's happening in your farm today.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;