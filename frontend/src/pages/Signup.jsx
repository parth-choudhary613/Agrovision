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
  Sprout,
  Phone,
  User,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Bug,
  Droplets,
  CloudSun,
  CheckCircle2,
  CalendarDays,
  ArrowRight,
  Leaf,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import agroIcon from "../assets/agrovisionicon.png";

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
  const recaptchaVerifier = useRef(null);
  const authSectionRef = useRef(null);

  const scrollToAuth = () => {
    authSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    const nameInput = document.getElementById("farmer-name-input");
    nameInput?.focus();
  };

  // --------------------------------------------------
  // GOOGLE LOGIN
  // --------------------------------------------------
  useEffect(() => {
    const scriptId = "google-gsi-script";

    const initializeGoogle = () => {
      if (!window.google || !document.getElementById("googleButton")) {
        return;
      }

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
            alert("Google Signup Failed. Please check backend connection.");
          }
        },
      });

      window.google.accounts.id.renderButton(googleButton, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
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

    return () => {};
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
      return alert("Farmer or estate name is required");
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
        return alert("Please enter a valid 10-digit mobile number");
      }
    } else {
      const numberWithoutCountryCode = formattedPhone.substring(3);
      if (!/^\d{10}$/.test(numberWithoutCountryCode)) {
        return alert("Please enter a valid 10-digit mobile number");
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
          "Firebase billing is not enabled. Real SMS OTP requires billing. For testing, please use Google Login or configured test credentials.";
      } else if (err?.code === "auth/invalid-phone-number") {
        message = "Invalid phone number.";
      } else if (err?.code === "auth/too-many-requests") {
        message = "Too many OTP requests. Please wait a moment and try again.";
      } else if (err?.code === "auth/captcha-check-failed") {
        message = "reCAPTCHA verification failed. Please refresh and try again.";
      }

      alert("Failed to send verification OTP: " + message);
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
      return alert("Please enter the 6-digit verification code.");
    }

    setLoading(true);

    try {
      console.log("Verifying OTP...");
      const result = await confirmationResult.confirm(otp);
      const firebasePhone = result.user.phoneNumber;

      const res = await axios.post(`${API_URL}/api/auth/phone`, {
        username,
        phone: firebasePhone,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error("OTP Verification Error:", err);

      if (err?.code === "auth/invalid-verification-code") {
        alert("Invalid verification code. Please check and try again.");
      } else if (err?.code === "auth/code-expired") {
        alert("Verification code expired. Please request a new code.");
      } else {
        alert("Invalid verification code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const goBackToPhone = () => {
    setStep(1);
    setOtp("");
    setConfirmationResult(null);
  };

  return (
    <div className="min-h-screen bg-[#F7F5EE] text-[#26332B] flex flex-col selection:bg-[#95B89A]/30 selection:text-[#1B4332]">
      {/* Brand Header & Navigation */}
      <Navbar onAuthClick={scrollToAuth} />

      {/* ──────────────────────────────────────────────────
          SECTION 1: HERO & AUTHENTICATION DUAL PANEL (Cream #F7F5EE)
          ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        {/* Subtle decorative natural background glow */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 rounded-full bg-[#95B89A]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 rounded-full bg-[#40916C]/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* LEFT COLUMN: Hero Value Proposition */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-[#DCE5DC] text-xs font-semibold text-[#1B4332] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#40916C] animate-pulse" />
              <span>Next-Gen Agricultural Intelligence</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#1B4332] leading-[1.12] tracking-tight">
              Intelligent crop care for healthier fields &amp; greater harvests.
            </h1>

            <p className="font-sans text-base sm:text-lg text-[#66736B] leading-relaxed max-w-2xl">
              AgroVision empowers growers and agronomists with instant AI crop disease detection,
              verified pesticide dosages, and weather-synchronized spray advisories — protecting
              yields while safeguarding soil vitality.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={scrollToAuth}
                className="inline-flex items-center justify-center gap-2 bg-[#1B4332] hover:bg-[#40916C] text-white px-7 py-4 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow active:scale-[0.98]"
              >
                <span>Enter Farmer Portal</span>
                <ArrowRight size={17} />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById("disease-engine");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#F7F5EE] text-[#1B4332] border border-[#1B4332] px-7 py-4 rounded-xl text-sm font-semibold transition-colors"
              >
                <span>Explore Disease Engine</span>
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-6 border-t border-[#DCE5DC] grid grid-cols-3 gap-4 max-w-lg">
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1B4332]">60+</p>
                <p className="font-sans text-xs text-[#66736B] font-medium mt-0.5">Crop Diseases</p>
              </div>
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1B4332]">98.4%</p>
                <p className="font-sans text-xs text-[#66736B] font-medium mt-0.5">Model Accuracy</p>
              </div>
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1B4332]">24 / 7</p>
                <p className="font-sans text-xs text-[#66736B] font-medium mt-0.5">Weather Advisory</p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Agricultural Auth Card */}
          <div ref={authSectionRef} id="auth-section" className="lg:col-span-5 w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white border border-[#DCE5DC] rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(27,67,50,0.06)] relative overflow-hidden"
            >
              {/* Card Header */}
              <div className="mb-6 flex items-center gap-3.5 pb-5 border-b border-[#DCE5DC]">
                <div className="w-12 h-12 rounded-2xl bg-[#F7F5EE] border border-[#DCE5DC] flex items-center justify-center shrink-0">
                  <img src={agroIcon} alt="AgroVision" className="w-8 h-8 object-contain" />
                </div>
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1B4332] leading-tight">
                    Farmer Sign In
                  </h2>
                  <p className="font-sans text-xs text-[#66736B] font-medium mt-0.5">
                    Secure access to your crops and schedules
                  </p>
                </div>
              </div>

              {/* Google Login Container */}
              <div className="mb-5 w-full overflow-hidden">
                <div id="googleButton" className="w-full flex justify-center" />
              </div>

              {/* Styled Divider */}
              <div className="flex items-center my-5">
                <div className="flex-grow h-px bg-[#DCE5DC]" />
                <span className="px-3 text-[11px] font-bold text-[#66736B] uppercase tracking-wider">
                  Or Mobile Number
                </span>
                <div className="flex-grow h-px bg-[#DCE5DC]" />
              </div>

              {/* Authentication Steps Form */}
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="phone-step"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    <div>
                      <label
                        htmlFor="farmer-name-input"
                        className="block text-xs font-bold text-[#26332B] uppercase tracking-wider mb-1.5"
                      >
                        Farmer / Farm Name
                      </label>
                      <div className="relative">
                        <User
                          className="absolute left-3.5 top-3.5 text-[#66736B]"
                          size={18}
                        />
                        <input
                          id="farmer-name-input"
                          type="text"
                          placeholder="e.g. Ramesh Patel or Greenfield Estate"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-[#F7F5EE]/40 border border-[#DCE5DC] rounded-xl text-sm text-[#26332B] placeholder:text-[#66736B]/60 focus:outline-none focus:border-[#1B4332] focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="farmer-phone-input"
                        className="block text-xs font-bold text-[#26332B] uppercase tracking-wider mb-1.5"
                      >
                        10-Digit Mobile Number
                      </label>
                      <div className="relative">
                        <Phone
                          className="absolute left-3.5 top-3.5 text-[#66736B]"
                          size={18}
                        />
                        <input
                          id="farmer-phone-input"
                          type="tel"
                          placeholder="9876543210"
                          value={phone}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, "");
                            if (value.startsWith("91")) value = value.substring(2);
                            value = value.slice(0, 10);
                            setPhone("+91" + value);
                          }}
                          className="w-full pl-10 pr-4 py-3 bg-[#F7F5EE]/40 border border-[#DCE5DC] rounded-xl text-sm text-[#26332B] placeholder:text-[#66736B]/60 focus:outline-none focus:border-[#1B4332] focus:bg-white transition-all font-mono"
                        />
                      </div>
                    </div>

                    <button
                      onClick={sendOTP}
                      disabled={loading}
                      className="w-full bg-[#1B4332] hover:bg-[#40916C] active:scale-[0.99] py-3.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                      {loading ? (
                        <span>Sending verification code...</span>
                      ) : (
                        <>
                          <span>Send Verification OTP</span>
                          <ChevronRight size={18} />
                        </>
                      )}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="otp-step"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    <div className="text-center p-3 rounded-xl bg-[#F7F5EE] border border-[#DCE5DC]">
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B4332]">
                        <ShieldCheck size={16} className="text-[#40916C]" />
                        <span>OTP sent to {phone}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#26332B] uppercase tracking-wider mb-1.5 text-center">
                        Enter 6-Digit Code
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength="6"
                        value={otp}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                          setOtp(val);
                        }}
                        className="w-full py-3.5 text-2xl text-center tracking-[0.5rem] bg-white border border-[#DCE5DC] rounded-xl text-[#1B4332] font-mono font-bold focus:outline-none focus:border-[#1B4332] shadow-2xs"
                        placeholder="••••••"
                      />
                    </div>

                    <button
                      onClick={verifyOTP}
                      disabled={loading}
                      className="w-full bg-[#1B4332] hover:bg-[#40916C] active:scale-[0.99] py-3.5 rounded-xl text-white font-semibold text-sm transition-all duration-200 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Verifying Credentials..." : "Enter Farm Dashboard"}
                    </button>

                    <button
                      type="button"
                      onClick={goBackToPhone}
                      disabled={loading}
                      className="w-full text-center text-xs font-semibold text-[#66736B] hover:text-[#1B4332] transition-colors py-1"
                    >
                      ← Change mobile number
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Invisible Firebase Recaptcha Container */}
              <div id="recaptcha-container" className="mt-3 flex justify-center scale-90" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────
          SECTION 2: STATISTICS & TRUST PROOF (White #FFFFFF)
          ────────────────────────────────────────────────── */}
      <section id="stats" className="bg-white border-y border-[#DCE5DC] py-14 sm:py-18 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-[#40916C]">
              Proven Agronomic Impact
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1B4332] mt-2">
              Calibrated metrics built for real agricultural scale.
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="p-6 rounded-2xl bg-[#F7F5EE] border border-[#DCE5DC] text-center">
              <span className="font-serif text-4xl sm:text-5xl font-bold text-[#1B4332] block">
                60<span className="text-[#D4A72C]">+</span>
              </span>
              <p className="font-sans text-sm font-bold text-[#26332B] mt-2">
                Curated Crop Diseases
              </p>
              <p className="font-sans text-xs text-[#66736B] mt-1">
                Fungal, bacterial, and pest profiles
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F7F5EE] border border-[#DCE5DC] text-center">
              <span className="font-serif text-4xl sm:text-5xl font-bold text-[#1B4332] block">
                98.4<span className="text-[#D4A72C]">%</span>
              </span>
              <p className="font-sans text-sm font-bold text-[#26332B] mt-2">
                Diagnostic Confidence
              </p>
              <p className="font-sans text-xs text-[#66736B] mt-1">
                Trained on millions of plant leaves
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F7F5EE] border border-[#DCE5DC] text-center">
              <span className="font-serif text-4xl sm:text-5xl font-bold text-[#1B4332] block">
                30<span className="text-[#D4A72C]">%</span>
              </span>
              <p className="font-sans text-sm font-bold text-[#26332B] mt-2">
                Chemical Cost Reduction
              </p>
              <p className="font-sans text-xs text-[#66736B] mt-1">
                Through optimized spray intervals
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F7F5EE] border border-[#DCE5DC] text-center">
              <span className="font-serif text-4xl sm:text-5xl font-bold text-[#1B4332] block">
                100<span className="text-[#D4A72C]">%</span>
              </span>
              <p className="font-sans text-sm font-bold text-[#26332B] mt-2">
                Weather-Safe Spray Windows
              </p>
              <p className="font-sans text-xs text-[#66736B] mt-1">
                Zero run-off and rain drift protection
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────
          SECTION 3: THREE CORE PILLARS (Soft Sage Tint #F3F7F3)
          ────────────────────────────────────────────────── */}
      <section id="features" className="bg-[#F3F7F3] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#40916C]">
              Agritech Core Architecture
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1B4332] mt-2">
              Everything required to safeguard your crop yield.
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#66736B] mt-3">
              Modern agriculture requires precision. AgroVision coordinates AI visual diagnosis
              with real-time micro-climate indicators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="bg-white border border-[#DCE5DC] rounded-3xl p-8 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-[#F7F5EE] border border-[#DCE5DC] text-[#1B4332] flex items-center justify-center mb-6">
                <Bug size={24} className="text-[#40916C]" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1B4332]">
                Instant Disease Detection
              </h3>
              <p className="font-sans text-sm text-[#66736B] leading-relaxed mt-3">
                Snap or drag-and-drop any leaf photo to receive real-time disease identification,
                confidence scoring, and scientific disease descriptions in seconds.
              </p>
              <div className="mt-6 pt-5 border-t border-[#DCE5DC] flex items-center gap-2 text-xs font-semibold text-[#1B4332]">
                <CheckCircle2 size={16} className="text-[#40916C]" />
                <span>Multi-Crop Vision Model</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white border border-[#DCE5DC] rounded-3xl p-8 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-[#F7F5EE] border border-[#DCE5DC] text-[#1B4332] flex items-center justify-center mb-6">
                <Droplets size={24} className="text-[#40916C]" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1B4332]">
                Calibrated Treatment Plans
              </h3>
              <p className="font-sans text-sm text-[#66736B] leading-relaxed mt-3">
                Get precise pesticide recommendations, water dosages, spray intervals,
                and organic biological treatment alternatives tailored to each disease.
              </p>
              <div className="mt-6 pt-5 border-t border-[#DCE5DC] flex items-center gap-2 text-xs font-semibold text-[#1B4332]">
                <CheckCircle2 size={16} className="text-[#40916C]" />
                <span>Chemical &amp; Organic Protocols</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white border border-[#DCE5DC] rounded-3xl p-8 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-[#F7F5EE] border border-[#DCE5DC] text-[#1B4332] flex items-center justify-center mb-6">
                <CloudSun size={24} className="text-[#40916C]" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1B4332]">
                Weather-Synced Advisory
              </h3>
              <p className="font-sans text-sm text-[#66736B] leading-relaxed mt-3">
                Never spray before rain or in strong winds. Our live spray index analyzes temperature,
                humidity, wind drift, and rainfall probability to highlight safe spray hours.
              </p>
              <div className="mt-6 pt-5 border-t border-[#DCE5DC] flex items-center gap-2 text-xs font-semibold text-[#1B4332]">
                <CheckCircle2 size={16} className="text-[#40916C]" />
                <span>Micro-Climate Risk Engine</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────
          SECTION 4: DIAGNOSTIC ENGINE SPOTLIGHT (White #FFFFFF)
          ────────────────────────────────────────────────── */}
      <section id="disease-engine" className="bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#DCE5DC]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#40916C]">
              Continuous Agronomy Support
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1B4332] leading-tight">
              From leaf symptom to healthy harvest in 3 straightforward steps.
            </h2>
            <p className="font-sans text-base text-[#66736B] leading-relaxed">
              Designed for busy farm operations. AgroVision simplifies complex botanical diagnosis
              into immediate action plans accessible directly on your mobile device.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-full bg-[#1B4332] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#26332B]">Capture or Upload</h4>
                  <p className="text-xs text-[#66736B] mt-0.5">
                    Take a clear photo of the infected leaf area or upload an existing file.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-full bg-[#1B4332] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#26332B]">Instant AI Diagnosis</h4>
                  <p className="text-xs text-[#66736B] mt-0.5">
                    Kindwise-powered vision identifies the disease and generates dosage recommendations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-full bg-[#1B4332] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#26332B]">Schedule &amp; Monitor Sprays</h4>
                  <p className="text-xs text-[#66736B] mt-0.5">
                    Add spray dates to your interactive farm calendar with real-time weather synchronization.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-[#F7F5EE] border border-[#DCE5DC] rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-[#DCE5DC] mb-6">
                <div className="flex items-center gap-2.5">
                  <Sprout className="text-[#40916C]" size={20} />
                  <span className="font-bold text-sm text-[#1B4332]">Diagnostic Preview</span>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#40916C]/10 text-[#1B4332]">
                  Live Demonstration
                </span>
              </div>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-[#DCE5DC] flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs text-[#66736B] font-medium">Scanned Crop</p>
                    <p className="text-base font-bold text-[#26332B] truncate">Tomato (Solanum lycopersicum)</p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Early Blight Detected
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3.5 rounded-xl border border-[#DCE5DC]">
                    <p className="text-[11px] text-[#66736B]">Recommended Agent</p>
                    <p className="text-xs font-bold text-[#1B4332] mt-0.5">Mancozeb 75% WP</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-[#DCE5DC]">
                    <p className="text-[11px] text-[#66736B]">Dosage Ratio</p>
                    <p className="text-xs font-bold text-[#1B4332] mt-0.5">2.5g per Liter Water</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#DCE5DC]">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1B4332]">
                    <CalendarDays size={15} className="text-[#40916C]" />
                    <span>Suggested Spray Window</span>
                  </div>
                  <p className="text-xs text-[#66736B] mt-1">
                    Optimal application tomorrow between 06:00 AM – 09:30 AM (Low wind: 4 km/h, 0% rain chance).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────
          SECTION 5: PRIMARY FOREST GREEN CTA BANNER (#1B4332)
          ────────────────────────────────────────────────── */}
      <section className="bg-[#1B4332] text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#40916C]/20 blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4A72C]">
            Ready for Smarter Crop Protection?
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight">
            Start protecting your crops with precision agricultural intelligence.
          </h2>
          <p className="font-sans text-sm sm:text-base text-white/80 max-w-2xl mx-auto leading-relaxed">
            Join thousands of progressive farmers optimizing their spray schedules, cutting chemical costs,
            and growing healthier produce with AgroVision.
          </p>
          <div className="pt-2">
            <button
              onClick={scrollToAuth}
              className="inline-flex items-center gap-2 bg-[#D4A72C] hover:bg-[#e0b438] text-[#1B4332] font-bold px-8 py-4 rounded-xl text-sm transition-all duration-200 shadow-md active:scale-[0.98]"
            >
              <span>Get Started Now — Free Access</span>
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────
          SECTION 6: AGRICULTURAL BRAND FOOTER (Forest Green)
          ────────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
};

export default Signup;