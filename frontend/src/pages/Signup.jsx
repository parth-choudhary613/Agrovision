import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();
  // Google Callback
  useEffect(() => {
    window.handleGoogleCallback = async (response) => {
      try {
        const res = await axios.post('http://localhost:5000/api/auth/google', {
          credential: response.credential
        });
        
        localStorage.setItem('token', res.data.token);
        navigate('/dashboard');
      } catch (err) {
        console.error(err.response?.data || err);
        alert('Google Signup Failed: ' + (err.response?.data?.msg || err.message));
      }
    };

    const script = document.createElement('script');
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    document.body.appendChild(script);

    return () => delete window.handleGoogleCallback;
  }, [navigate]);
  
    const handlePhoneSignup = async () => {
    if (!username || !phone) return alert("Please fill all fields");
    try {
      const res = await axios.post('http://localhost:5000/api/auth/phone', { username, phone });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.msg || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 to-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 p-10 rounded-3xl shadow-2xl w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-8 text-white">Welcome to AgroVision</h1>

        {/* Google Signup */}
        <div className="flex justify-center mb-8">
          <div
            id="g_id_onload"
            data-client_id={import.meta.env.VITE_GOOGLE_CLIENT_ID}
            data-callback="handleGoogleCallback"
            data-auto_prompt="false"
          ></div>
          <div
            className="g_id_signin"
            data-type="standard"
            data-size="large"
            data-theme="filled_black"
            data-text="continue_with"
            data-shape="rectangular"
          ></div>
        </div>

        <div className="text-center text-gray-500 my-6">OR</div>

        {/* Phone Signup */}
        <div className="space-y-5">
          <input
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-4 bg-gray-800 rounded-xl text-white focus:outline-none"
          />
          <input
            type="tel"
            placeholder="+91 Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-4 bg-gray-800 rounded-xl text-white focus:outline-none"
          />
          <button
            onClick={handlePhoneSignup}
            className="w-full bg-green-600 hover:bg-green-700 py-4 rounded-xl text-lg font-semibold"
          >
            Sign Up with Phone
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;