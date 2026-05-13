import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Google Sign In - Clean Version
  useEffect(() => {
    // Remove previous instances
    if (window.google?.accounts?.id) {
      window.google.accounts.id.cancel();
    }

    const script = document.createElement('script');
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            setLoading(true);
            const res = await axios.post('http://localhost:5000/api/auth/google', {
              credential: response.credential
            });
            localStorage.setItem('token', res.data.token);
            navigate('/dashboard');
          } catch (err) {
            console.error(err);
            alert('Google Signup Failed');
          } finally {
            setLoading(false);
          }
        }
      });

      window.google.accounts.id.renderButton(
        document.getElementById('googleButton'),
        {
          theme: "filled_black",
          size: "large",
          text: "continue_with",
          shape: "pill"
        }
      );
    };

    document.body.appendChild(script);

    return () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
    };
  }, [navigate]);

  const handlePhoneSignup = async () => {
    if (!username || !phone) return alert("Please fill both fields");
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/api/auth/phone', { username, phone });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.msg || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-900 to-teal-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-6xl font-bold text-white mb-2">AgroVision</h1>
          <p className="text-green-400 text-xl">Empowering Farmers with Technology</p>
        </div>

        <div className="bg-gray-900/90 backdrop-blur-xl p-10 rounded-3xl border border-green-500/30">
          {/* Google Button Container */}
          <div id="googleButton" className="flex justify-center mb-8"></div>

          <div className="flex items-center my-6 gap-4">
            <div className="h-px bg-gray-700 flex-1"></div>
            <span className="text-gray-400 text-sm">OR</span>
            <div className="h-px bg-gray-700 flex-1"></div>
          </div>

          {/* Phone Signup */}
          <div className="space-y-5">
            <input
              type="text"
              placeholder="Full Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-4 bg-gray-800 rounded-2xl border border-gray-700 focus:border-green-500 outline-none text-white"
            />
            <input
              type="tel"
              placeholder="+91 Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-5 py-4 bg-gray-800 rounded-2xl border border-gray-700 focus:border-green-500 outline-none text-white"
            />

            <button
              onClick={handlePhoneSignup}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 py-4 rounded-2xl text-lg font-semibold disabled:opacity-50"
            >
              {loading ? "Please wait..." : "Continue with Phone"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;