import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Sprout, Phone, User, ShieldCheck, ChevronRight } from 'lucide-react';
const API_URL = import.meta.env.VITE_API_URL;
import.meta.env.VITE_API_URL
// Decode the Google JWT credential to extract name, email, picture
const decodeGoogleJWT = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
};

const Signup = () => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
       console.log("Google Client ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            // Decode the JWT to get name and picture from Google
            const payload = decodeGoogleJWT(response.credential);

            // Send credential + decoded fields to backend
            // Backend should store name and picture and return them in /api/auth/me
            const res = await axios.post(`${API_URL}/api/auth/google`, {
              credential: response.credential,
              name: payload.name,       // Full name from Google
              picture: payload.picture, // Profile picture URL from Google
            });

            localStorage.setItem('token', res.data.token);
            navigate('/dashboard');
          } catch (err) {
            alert('Google Signup Failed');
          }
        }
      });
      window.google.accounts.id.renderButton(
        document.getElementById("googleButton"),
        { theme: "outline", size: "large", text: "continue_with", shape: "pill", width: "100%" }
      );
    };
    document.body.appendChild(script);
  }, [navigate]);

const sendOTP = async () => {
  if (!username || !phone) {
    return alert("Name and Phone are required");
  }

  let formattedPhone = phone.trim().replace(/\s+/g, '');

  if (!formattedPhone.startsWith('+91')) {
    if (formattedPhone.length === 10) {
      formattedPhone = '+91' + formattedPhone;
    } else {
      return alert("Enter valid Indian phone number");
    }
  }

  setLoading(true);

  try {
    // Clear old verifier
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }

    // Create fresh verifier
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      'recaptcha-container',
      {
        size: 'invisible',
        callback: () => {
          console.log("reCAPTCHA solved");
        },
      }
    );

    const appVerifier = window.recaptchaVerifier;

    const result = await signInWithPhoneNumber(
      auth,
      formattedPhone,
      appVerifier
    );

    setConfirmationResult(result);
    setPhone(formattedPhone);
    setStep(2);

  } catch (err) {
    console.log(err);
    alert("Failed to send OTP: " + err.message);
  } finally {
    setLoading(false);
  }
};

  const verifyOTP = async () => {
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      // Phone login: send username and phone. No picture — backend stores empty string.
      const res = await axios.post('${API_URL}/api/auth/phone', {
        username,
        phone: result.user.phoneNumber,
      });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      alert("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 overflow-hidden bg-[#041a0b]">

      {/* Animated Gradient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-900/40 rounded-full blur-[120px]" />

      {/* Floating Leaf Particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: "100vh", x: Math.random() * 100 + "vw", rotate: 0 }}
          animate={{ y: "-10vh", x: Math.random() * 100 + "vw", rotate: 360 }}
          transition={{ duration: 15 + Math.random() * 10, repeat: Infinity, ease: "linear" }}
          className="absolute text-green-500/20 pointer-events-none"
        >
          <Leaf size={24 + Math.random() * 40} />
        </motion.div>
      ))}

      {/* Signup Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="inline-block p-3 bg-green-500/20 rounded-2xl mb-4"
          >
            <Sprout className="text-green-400" size={40} />
          </motion.div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">AgroVision</h1>
          <p className="text-green-400/80 font-medium italic">Cultivating the Future</p>
        </div>

        <div id="googleButton" className="mb-6 w-full overflow-hidden rounded-xl" />

        <div className="flex items-center my-6">
          <div className="flex-grow h-[1px] bg-white/10"></div>
          <span className="px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Or Secure Login</span>
          <div className="flex-grow h-[1px] bg-white/10"></div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-4"
            >
              <div className="relative group">
                <User className="absolute left-4 top-4 text-gray-500 group-focus-within:text-green-400 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:border-green-500/50 focus:bg-white/10 transition-all"
                />
              </div>

              <div className="relative group">
                <Phone className="absolute left-4 top-4 text-gray-500 group-focus-within:text-green-400 transition-colors" size={20} />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:border-green-500/50 focus:bg-white/10 transition-all"
                />
              
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={sendOTP}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-500 py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
              >
                {loading ? "Preparing Fields..." : "Send Verification OTP"}
                <ChevronRight size={20} />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm mb-4">
                  <ShieldCheck size={16} /> Verifying {phone}
                </div>
              </div>

              <input
                type="text"
                maxLength="6"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                className="w-full p-5 text-4xl text-center tracking-[1rem] bg-white/5 border border-white/10 rounded-2xl text-green-400 focus:outline-none focus:border-green-500 focus:bg-white/10 transition-all font-mono"
                placeholder="000000"
              />

              <button
                onClick={verifyOTP}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-500 py-4 rounded-2xl text-white font-bold shadow-lg"
              >
                {loading ? "Confirming..." : "Grow Your Account"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div id="recaptcha-container" className="mt-4 flex justify-center scale-90" />
      </motion.div>
    </div>
  );
};

export default Signup;
