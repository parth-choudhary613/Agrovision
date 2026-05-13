import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../firebase/firebase';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const navigate = useNavigate();

  // Google Sign In
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            const res = await axios.post('http://localhost:5000/api/auth/google', {
              credential: response.credential
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
        { theme: "filled_black", size: "large", text: "continue_with", shape: "pill" }
      );
    };
    document.body.appendChild(script);
  }, [navigate]);

 const sendOTP = async () => {
  if (!username || !phone) {
    return alert("Name and Phone are required");
  }

  let formattedPhone = phone.trim();

  // Remove spaces and special characters
  formattedPhone = formattedPhone.replace(/\s+/g, '');

  // Add +91 if user entered only 10 digits
  if (!formattedPhone.startsWith('+91')) {
    if (formattedPhone.length === 10) {
      formattedPhone = '+91' + formattedPhone;
    } else {
      return alert("Enter valid Indian phone number");
    }
  }

  setLoading(true);

  try {
    // Prevent multiple recaptcha creation
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
          size: 'invisible',
        }
      );
    }

    const appVerifier = window.recaptchaVerifier;

    const result = await signInWithPhoneNumber(
      auth,
      formattedPhone,
      appVerifier
    );

    setConfirmationResult(result);
    setPhone(formattedPhone);

    setStep(2);

    alert("OTP Sent Successfully!");

  } catch (err) {
    console.error("Send OTP Error:", err);
    alert("Failed to send OTP: " + err.message);
  } finally {
    setLoading(false);
  }
};

  const verifyOTP = async () => {
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const res = await axios.post('http://localhost:5000/api/auth/phone', {
        username,
        phone: result.user.phoneNumber
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
    <div className="min-h-screen bg-gradient-to-br from-green-950 to-teal-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-6xl font-bold text-white">AgroVision</h1>
          <p className="text-green-400 mt-2">Empowering Farmers</p>
        </div>

        <div className="bg-gray-900 p-10 rounded-3xl">
          <div id="googleButton" className="mb-8 flex justify-center"></div>

          <div className="text-center text-gray-400 my-6">—————— OR ——————</div>

          {step === 1 ? (
            <>
              <input type="text" placeholder="Full Name" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-4 bg-gray-800 rounded-xl mb-4" />
            <input
  type="tel"
  placeholder="9876543210"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  className="w-full p-4 bg-gray-800 rounded-xl mb-6"
/>
              <button onClick={sendOTP} disabled={loading} className="w-full bg-green-600 py-4 rounded-xl text-lg font-bold">
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              <p className="text-center mb-4 text-green-400">Enter OTP sent to {phone}</p>
              <input type="text" maxLength="6" value={otp} onChange={e => setOtp(e.target.value)} className="w-full p-6 text-3xl text-center tracking-widest bg-gray-800 rounded-xl mb-6" placeholder="123456" />

              <button onClick={verifyOTP} disabled={loading} className="w-full bg-green-600 py-4 rounded-xl text-lg font-bold">
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </>
          )}

          <div id="recaptcha-container" className="mt-6"></div>
        </div>
      </div>
    </div>
  );
};

export default Signup;