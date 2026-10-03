import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { auth } from "../firebase/firebase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf,
  Sprout,
  Phone,
  User,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

// Decode Google JWT credential to extract name, email, picture
const decodeGoogleJWT = (token) => {
  try {
    const base64 = token
      .split(".")[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
};

const Signup = () => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  const navigate = useNavigate();

  // Keep one RecaptchaVerifier instance
  const recaptchaVerifier = useRef(null);

  // --------------------------------------------------
  // GOOGLE LOGIN
  // --------------------------------------------------
  useEffect(() => {
    const scriptId = "google-gsi-script";

    const initializeGoogle = () => {
      if (!window.google || !document.getElementById("googleButton")) {
        return;
      }

      // Avoid rendering Google button multiple times
      const googleButton = document.getElementById("googleButton");

      if (googleButton.hasChildNodes()) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,

        callback: async (response) => {
          try {
            const payload = decodeGoogleJWT(response.credential);

            const res = await axios.post(`${API_URL}/api/auth/google`, {
              credential: response.credential,
              name: payload.name,
              picture: payload.picture,
            });

            localStorage.setItem("token", res.data.token);

            navigate("/dashboard");
          } catch (err) {
            console.error("Google Signup Error:", err);
            alert("Google Signup Failed");
          }
        },
      });

      window.google.accounts.id.renderButton(googleButton, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        width: "100%",
      });
    };

    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement("script");

      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;

      script.onload = initializeGoogle;

      document.body.appendChild(script);
    } else if (window.google) {
      initializeGoogle();
    }

    return () => {
      // Don't remove Google script because it may be used elsewhere.
    };
  }, [navigate]);

  // --------------------------------------------------
  // CLEANUP FIREBASE RECAPTCHA
  // --------------------------------------------------
  useEffect(() => {
    return () => {
      if (recaptchaVerifier.current) {
        try {
          recaptchaVerifier.current.clear();
        } catch (error) {
          console.log("reCAPTCHA cleanup:", error);
        }

        recaptchaVerifier.current = null;
      }
    };
  }, []);

  // --------------------------------------------------
  // CREATE RECAPTCHA
  // --------------------------------------------------
  const setupRecaptcha = () => {
    // Already created
    if (recaptchaVerifier.current) {
      return recaptchaVerifier.current;
    }

    const container = document.getElementById("recaptcha-container");

    if (!container) {
      throw new Error("reCAPTCHA container not found");
    }

    recaptchaVerifier.current = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",

        callback: () => {
          console.log("reCAPTCHA solved");
        },

        "expired-callback": () => {
          console.log("reCAPTCHA expired");

          if (recaptchaVerifier.current) {
            try {
              recaptchaVerifier.current.clear();
            } catch (error) {
              console.log("reCAPTCHA clear error:", error);
            }

            recaptchaVerifier.current = null;
          }
        },

        "error-callback": () => {
          console.log("reCAPTCHA error");
        },
      }
    );

    return recaptchaVerifier.current;
  };

  // --------------------------------------------------
  // SEND OTP
  // --------------------------------------------------
  const sendOTP = async () => {
    if (!username.trim()) {
      return alert("Name is required");
    }

    if (!phone.trim()) {
      return alert("Phone number is required");
    }

    let formattedPhone = phone.trim().replace(/\s+/g, "");

    // Indian phone number formatting
    if (!formattedPhone.startsWith("+91")) {
      if (/^\d{10}$/.test(formattedPhone)) {
        formattedPhone = "+91" + formattedPhone;
      } else {
        return alert("Enter a valid Indian phone number");
      }
    } else {
      const numberWithoutCountryCode = formattedPhone.substring(3);

      if (!/^\d{10}$/.test(numberWithoutCountryCode)) {
        return alert("Enter a valid Indian phone number");
      }
    }

    setLoading(true);

    try {
      console.log("Preparing reCAPTCHA...");

      const appVerifier = setupRecaptcha();

      console.log("Sending OTP to:", formattedPhone);

      const result = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        appVerifier
      );

      console.log("OTP sent successfully");

      setConfirmationResult(result);
      setPhone(formattedPhone);
      setStep(2);
    } catch (err) {
      console.error("Firebase OTP Error:", err);

      // Reset verifier after error
      if (recaptchaVerifier.current) {
        try {
          recaptchaVerifier.current.clear();
        } catch (clearError) {
          console.log("reCAPTCHA clear error:", clearError);
        }

        recaptchaVerifier.current = null;
      }

      let message = err?.message || "Unknown error";

      if (err?.code === "auth/billing-not-enabled") {
        message =
          "Firebase billing is not enabled. Real SMS OTP requires billing. " +
          "For free development, use a Firebase test phone number.";
      } else if (err?.code === "auth/invalid-phone-number") {
        message = "Invalid phone number.";
      } else if (err?.code === "auth/too-many-requests") {
        message =
          "Too many OTP requests. Please wait before trying again.";
      } else if (
        err?.code === "auth/captcha-check-failed"
      ) {
        message =
          "reCAPTCHA verification failed. Please refresh the page and try again.";
      }

      alert("Failed to send OTP: " + message);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // VERIFY OTP
  // --------------------------------------------------
  const verifyOTP = async () => {
    if (!confirmationResult) {
      return alert("Please request an OTP first.");
    }

    if (!otp || otp.length !== 6) {
      return alert("Please enter the 6-digit OTP.");
    }

    setLoading(true);

    try {
      console.log("Verifying OTP...");

      const result = await confirmationResult.confirm(otp);

      console.log("Firebase phone verification successful");

      const firebasePhone = result.user.phoneNumber;

      // Send verified phone + username to backend
      const res = await axios.post(`${API_URL}/api/auth/phone`, {
        username,
        phone: firebasePhone,
      });

      localStorage.setItem("token", res.data.token);

      navigate("/dashboard");
    } catch (err) {
      console.error("OTP Verification Error:", err);

      if (err?.code === "auth/invalid-verification-code") {
        alert("Invalid OTP. Please check the code and try again.");
      } else if (err?.code === "auth/code-expired") {
        alert("OTP has expired. Please request a new OTP.");
      } else {
        alert("Invalid OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // BACK TO PHONE STEP
  // --------------------------------------------------
  const goBackToPhone = () => {
    setStep(1);
    setOtp("");
    setConfirmationResult(null);
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 overflow-hidden bg-[#041a0b]">

      {/* Animated Gradient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-600/20 rounded-full blur-[120px] animate-pulse" />

      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-900/40 rounded-full blur-[120px]" />

      {/* Floating Leaf Particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            y: "100vh",
            x: Math.random() * 100 + "vw",
            rotate: 0,
          }}
          animate={{
            y: "-10vh",
            x: Math.random() * 100 + "vw",
            rotate: 360,
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            ease: "linear",
          }}
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

        {/* Header */}
        <div className="text-center mb-8">

          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 4,
            }}
            className="inline-block p-3 bg-green-500/20 rounded-2xl mb-4"
          >
            <Sprout
              className="text-green-400"
              size={40}
            />
          </motion.div>

          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            AgroVision
          </h1>

          <p className="text-green-400/80 font-medium italic">
            Cultivating the Future
          </p>

        </div>

        {/* Google Login */}
        <div
          id="googleButton"
          className="mb-6 w-full overflow-hidden rounded-xl"
        />

        {/* Divider */}
        <div className="flex items-center my-6">

          <div className="flex-grow h-[1px] bg-white/10" />

          <span className="px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
            Or Secure Login
          </span>

          <div className="flex-grow h-[1px] bg-white/10" />

        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">

          {/* STEP 1 */}
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{
                x: 20,
                opacity: 0,
              }}
              animate={{
                x: 0,
                opacity: 1,
              }}
              exit={{
                x: -20,
                opacity: 0,
              }}
              className="space-y-4"
            >

              {/* Username */}
              <div className="relative group">

                <User
                  className="absolute left-4 top-4 text-gray-500 group-focus-within:text-green-400 transition-colors"
                  size={20}
                />

                <input
                  type="text"
                  placeholder="Full Name"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:border-green-500/50 focus:bg-white/10 transition-all"
                />

              </div>

              {/* Phone */}
              <div className="relative group">

                <Phone
                  className="absolute left-4 top-4 text-gray-500 group-focus-within:text-green-400 transition-colors"
                  size={20}
                />

           <input
  type="tel"
  placeholder="Phone Number"
  value={phone}
  onChange={(e) => {
    let value = e.target.value.replace(/\D/g, "");

    // Remove 91 if user enters it manually
    if (value.startsWith("91")) {
      value = value.substring(2);
    }

    // Maximum 10 digits
    value = value.slice(0, 10);

    setPhone("+91" + value);
  }}
  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:border-green-500/50 focus:bg-white/10 transition-all"
/>
              </div>

              {/* Send OTP */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={sendOTP}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-500 py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >

                {loading
                  ? "Preparing Fields..."
                  : "Send Verification OTP"}

                <ChevronRight size={20} />

              </motion.button>

            </motion.div>
          ) : (

            /* STEP 2 */
            <motion.div
              key="step2"
              initial={{
                x: 20,
                opacity: 0,
              }}
              animate={{
                x: 0,
                opacity: 1,
              }}
              exit={{
                x: -20,
                opacity: 0,
              }}
              className="space-y-6"
            >

              <div className="text-center">

                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm mb-4">

                  <ShieldCheck size={16} />

                  Verifying {phone}

                </div>

              </div>

              {/* OTP */}
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength="6"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6);

                  setOtp(value);
                }}
                className="w-full p-5 text-4xl text-center tracking-[1rem] bg-white/5 border border-white/10 rounded-2xl text-green-400 focus:outline-none focus:border-green-500 focus:bg-white/10 transition-all font-mono"
                placeholder="000000"
              />

              {/* Verify */}
              <button
                onClick={verifyOTP}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-500 py-4 rounded-2xl text-white font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >

                {loading
                  ? "Confirming..."
                  : "Grow Your Account"}

              </button>

              {/* Back */}
              <button
                type="button"
                onClick={goBackToPhone}
                disabled={loading}
                className="w-full text-gray-400 hover:text-green-400 text-sm transition-colors"
              >
                ← Change phone number
              </button>

            </motion.div>
          )}

        </AnimatePresence>

        {/* Firebase reCAPTCHA */}
        <div
          id="recaptcha-container"
          className="mt-4 flex justify-center scale-90"
        />

      </motion.div>

    </div>
  );
};

export default Signup;