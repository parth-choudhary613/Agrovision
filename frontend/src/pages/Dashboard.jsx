import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardMetrics from '../components/DashboardMetrics';
import {
  Bell, ChevronDown, Languages, Plus, Upload, Camera,
  X, Leaf, AlertTriangle, CheckCircle, RotateCcw,
  Activity, Bug, ScanLine
} from 'lucide-react';

// ── animated counter ─────────────────────────────────────────────────────────
const Counter = ({ value, duration = 600 }) => {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const start = prev.current;
    const diff = value - start;
    if (diff === 0) return;
    const steps = 20;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplay(Math.round(start + (diff * i) / steps));
      if (i >= steps) { clearInterval(id); prev.current = value; }
    }, duration / steps);
    return () => clearInterval(id);
  }, [value, duration]);
  return <>{display}</>;
};

// ── stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, sessionVal, allTimeVal, accent }) => (
  <div className={`bg-white rounded-2xl border ${accent.border} p-5 flex items-start gap-4 shadow-sm`}>
    <div className={`w-12 h-12 rounded-xl ${accent.bg} flex items-center justify-center flex-shrink-0`}>
      <Icon size={22} className={accent.icon} />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-end gap-3 flex-wrap">
        <span className={`text-3xl font-bold ${accent.text}`}>
          <Counter value={sessionVal} />
        </span>
        <span className="text-sm text-gray-400 mb-1">
          this session &middot; <span className="font-semibold text-gray-600"><Counter value={allTimeVal} /> all-time</span>
        </span>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [username, setUsername]     = useState('');
  const [picture, setPicture]       = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [loginType, setLoginType]   = useState('');
  const [token, setToken]           = useState('');

  // scan dropdown (below navbar button)
  const [scanDropdown, setScanDropdown] = useState(false);

  // panel state
  const [dragOver, setDragOver]     = useState(false);
  const [preview, setPreview]       = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [scanning, setScanning]     = useState(false);
  const [result, setResult]         = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream]         = useState(null);

  // session stats
  const [sessionScans, setSessionScans]       = useState(0);
  const [sessionDiseases, setSessionDiseases] = useState(0);
  // all-time stats
  const [allTime, setAllTime] = useState({ scans: 0, diseases: 0 });

  const dropdownRef  = useRef();
  const scanBtnRef   = useRef();
  const scanDropRef  = useRef();
  const fileInputRef = useRef();
  const videoRef     = useRef();
  const canvasRef    = useRef();
  const panelRef     = useRef();

  const navigate = useNavigate();
  const location = useLocation();
  const isSignup = location.pathname === '/';

  const firstName = username ? username.split(' ')[0] : '';
  const initial   = username ? username.charAt(0).toUpperCase() : '?';

  // ── fetch all-time stats ──────────────────────────────────────────────────
  const refreshStats = useCallback((t) => {
    const tok = t || token;
    if (!tok) return;
    axios.get('http://localhost:5000/api/scan/stats', { headers: { Authorization: `Bearer ${tok}` } })
      .then((r) => setAllTime({ scans: r.data.totalScans || 0, diseases: r.data.totalDiseases || 0 }))
      .catch(() => {});
  }, [token]);

  // ── auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) { navigate('/'); return; }
    setToken(t);
    axios.get('http://localhost:5000/api/auth/me', { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => {
        setUsername(r.data.username || '');
        setPicture(r.data.picture || '');
        setLoginType(r.data.loginType || '');
        setIsLoggedIn(true);
        refreshStats(t);
      })
      .catch(() => { localStorage.removeItem('token'); navigate('/'); });
  }, [navigate, refreshStats]);

  // close profile dropdown on outside click
  useEffect(() => {
    const h = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpenDropdown(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // close scan dropdown on outside click
  useEffect(() => {
    const h = (e) => {
      if (
        scanDropRef.current && !scanDropRef.current.contains(e.target) &&
        scanBtnRef.current  && !scanBtnRef.current.contains(e.target)
      ) setScanDropdown(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const logout = () => { localStorage.removeItem('token'); navigate('/'); };

  // ── file load ─────────────────────────────────────────────────────────────
  const loadFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setScanDropdown(false);
    setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    loadFile(e.dataTransfer.files[0]);
  };

  // ── camera ────────────────────────────────────────────────────────────────
  const openCamera = async () => {
    setScanDropdown(false);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(s);
      setIsCameraOpen(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = s; }, 50);
      setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    } catch { alert('Camera access denied or not available'); }
  };

  const capturePhoto = () => {
    const video = videoRef.current; const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      loadFile(new File([blob], 'capture.jpg', { type: 'image/jpeg' }));
      closeCamera();
    }, 'image/jpeg', 0.92);
  };

  const closeCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null); setIsCameraOpen(false);
  };

  // ── scan ──────────────────────────────────────────────────────────────────
  const handleScan = async () => {
    if (!selectedFile) return;
    setScanning(true);
    const fd = new FormData(); fd.append('image', selectedFile);
    try {
      const r = await fetch('http://localhost:5000/api/scan', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await r.json();
      setResult(data);
      setSessionScans((s) => s + 1);
      const diseaseFound = data.diseaseDetected && data.diseaseDetected !== 'Healthy';
      if (diseaseFound) setSessionDiseases((s) => s + 1);
      refreshStats();
    } catch (e) {
      console.error(e); alert('Scan failed. Try again.');
    } finally { setScanning(false); }
  };

  const resetScan = () => {
    setPreview(null); setSelectedFile(null); setResult(null); closeCamera();
  };

  const isHealthy = result && (!result.diseaseDetected || result.diseaseDetected === 'Healthy');

  const confidenceNum = result?.confidence
    ? typeof result.confidence === 'string' ? parseFloat(result.confidence) : result.confidence * 100
    : 0;

  // ── avatar ────────────────────────────────────────────────────────────────
  const Avatar = ({ size = 'md' }) => {
    const cls = size === 'sm' ? 'w-9 h-9 text-sm' : 'w-11 h-11 text-base';
    return picture
      ? <img src={picture} alt="profile" referrerPolicy="no-referrer"
             className={`${cls} rounded-full object-cover border border-gray-200 flex-shrink-0`} />
      : <div className={`${cls} rounded-full bg-green-700 text-white flex items-center justify-center font-bold flex-shrink-0`}>
          {initial}
        </div>;
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] lg:ml-72">

      {/* ══ NAVBAR ══════════════════════════════════════════════════════════ */}
      <div className="w-full bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 lg:py-5
                      flex items-center justify-between gap-4 relative z-40">
        {/* greeting */}
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-black truncate">
            Welcome back, {loginType === 'phone' ? username : firstName}! 👋
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
            Here's what's happening in your farm today.
          </p>
        </div>

        {/* right actions */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-5 flex-shrink-0">
          <div className="hidden md:flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition">
            <Languages size={17} className="text-gray-500" />
            <span className="font-medium text-gray-600 text-sm">English</span>
            <ChevronDown size={15} className="text-gray-400" />
          </div>

          <div className="relative cursor-pointer p-1">
            <Bell size={21} className="text-gray-600" />
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">3</div>
          </div>

          {/* profile dropdown */}
          {isLoggedIn && !isSignup && (
            <div className="relative" ref={dropdownRef}>
              <div onClick={() => setOpenDropdown(!openDropdown)}
                   className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1.5 rounded-xl transition">
                <Avatar />
                <div className="hidden md:block leading-tight">
                  <p className="font-semibold text-gray-800 text-sm">{firstName}</p>
                  <p className="text-xs text-gray-400">Farmer</p>
                </div>
                <ChevronDown size={15} className={`text-gray-400 transition ${openDropdown ? 'rotate-180' : ''}`} />
              </div>
              {openDropdown && (
                <div className="absolute right-0 top-14 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                    <Avatar size="sm" />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{username}</p>
                      <p className="text-xs text-gray-400">Farmer Account</p>
                    </div>
                  </div>
                  <button onClick={logout} className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-50 transition text-sm font-medium">
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── SCAN NEW PLANT + inline dropdown ── */}
          <div className="relative" ref={scanBtnRef}>
            <button
              onClick={() => setScanDropdown((v) => !v)}
              className="bg-green-700 hover:bg-green-800 active:scale-95 text-white
                         px-4 sm:px-5 py-2.5 rounded-2xl flex items-center gap-2
                         text-sm font-semibold shadow-md transition"
            >
              <Plus size={17} />
              <span className="hidden sm:block">Scan New Plant</span>
            </button>

            {/* inline dropdown — appears right below the button */}
            {scanDropdown && (
              <div ref={scanDropRef}
                   className="absolute right-0 top-[calc(100%+8px)] w-60 bg-white rounded-2xl
                              shadow-2xl border border-gray-100 overflow-hidden z-50"
                   style={{ animation: 'fadeDown 0.16s ease forwards' }}>
                <p className="px-4 pt-3 pb-1 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Choose method
                </p>

                <button
                  onClick={() => { setScanDropdown(false); fileInputRef.current?.click(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition group"
                >
                  <span className="w-10 h-10 rounded-xl bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center flex-shrink-0 transition">
                    <Upload size={18} className="text-blue-600" />
                  </span>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-800">Upload from Gallery</p>
                    <p className="text-xs text-gray-400">JPG, PNG, WEBP</p>
                  </div>
                </button>

                <button
                  onClick={openCamera}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition group"
                >
                  <span className="w-10 h-10 rounded-xl bg-green-100 group-hover:bg-green-200 flex items-center justify-center flex-shrink-0 transition">
                    <Camera size={18} className="text-green-700" />
                  </span>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-800">Open Camera</p>
                    <p className="text-xs text-gray-400">Use device camera</p>
                  </div>
                </button>

                <div className="mx-4 my-1 h-px bg-gray-100" />
                <p className="px-4 py-2.5 text-[11px] text-gray-400 leading-relaxed">
                  Or drag &amp; drop a plant photo onto the panel below.
                </p>
              </div>
            )}
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                 onChange={(e) => loadFile(e.target.files[0])} />
        </div>
      </div>

      {/* ══ MAIN CONTENT ════════════════════════════════════════════════════ */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">

        {/* ── STAT CARDS ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            icon={ScanLine}
            label="Scans Performed"
            sessionVal={sessionScans}
            allTimeVal={allTime.scans}
            accent={{ border: 'border-blue-100', bg: 'bg-blue-50', icon: 'text-blue-500', text: 'text-blue-600' }}
          />
          <StatCard
            icon={Bug}
            label="Diseases Found"
            sessionVal={sessionDiseases}
            allTimeVal={allTime.diseases}
            accent={{ border: 'border-rose-100', bg: 'bg-rose-50', icon: 'text-rose-500', text: 'text-rose-600' }}
          />
        </div>

        {/* ── DASHBOARD METRICS ─────────────────────────────────────────── */}
        <DashboardMetrics />

        {/* ── SCAN PANEL ────────────────────────────────────────────────── */}
        <div ref={panelRef} className="scroll-mt-6">

          {/* camera view */}
          {isCameraOpen && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <p className="font-bold text-gray-800 flex items-center gap-2"><Camera size={18} className="text-green-700" /> Camera</p>
                <button onClick={closeCamera} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"><X size={18} /></button>
              </div>
              <div className="p-6">
                <div className="rounded-2xl overflow-hidden bg-black mb-5">
                  <video ref={videoRef} autoPlay playsInline className="w-full max-h-80 object-cover" />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <div className="flex gap-3 justify-center">
                  <button onClick={capturePhoto}
                          className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-xl font-semibold transition flex items-center gap-2 active:scale-95">
                    <Camera size={17} /> Capture
                  </button>
                  <button onClick={closeCamera}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-6 py-3 rounded-xl font-medium transition">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* drag-and-drop zone */}
          {!isCameraOpen && !preview && !result && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-3xl transition-all duration-200 cursor-pointer
                          flex flex-col items-center justify-center text-center select-none
                          p-10 sm:p-16 lg:p-24
                          ${dragOver
                            ? 'border-green-500 bg-green-50 scale-[1.01]'
                            : 'border-gray-200 bg-white hover:border-green-400 hover:bg-green-50/30'}`}
            >
              <div className="absolute top-6 left-10 w-24 h-24 bg-green-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
              <div className="absolute bottom-6 right-10 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 transition
                              ${dragOver ? 'bg-green-200 scale-110' : 'bg-green-100'}`}>
                <Leaf size={36} className="text-green-700" />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                {dragOver ? 'Drop to scan 🌿' : 'Drag & drop your plant photo here'}
              </h3>
              <p className="text-gray-400 text-sm mb-8 max-w-sm">
                Supports JPG, PNG, WEBP up to 5&nbsp;MB. We'll detect the crop and any disease automatically.
              </p>

              <div className="flex items-center gap-3 flex-wrap justify-center">
                <span className="inline-flex items-center gap-2 bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold pointer-events-none">
                  <Upload size={15} /> Choose file
                </span>
                <span className="text-gray-300 text-sm">or</span>
                <span
                  onClick={(e) => { e.stopPropagation(); openCamera(); }}
                  className="inline-flex items-center gap-2 border border-gray-200 bg-white text-gray-600
                             px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition cursor-pointer"
                >
                  <Camera size={15} /> Open Camera
                </span>
              </div>
            </div>
          )}

          {/* preview + scan button */}
          {!isCameraOpen && preview && !result && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <p className="font-bold text-gray-800">Ready to scan</p>
                <button onClick={resetScan} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"><X size={18} /></button>
              </div>
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
                  <img src={preview} alt="preview" className="max-h-72 rounded-2xl shadow object-contain" />
                </div>
                <div className="md:w-72 p-6 flex flex-col justify-center gap-4 border-t md:border-t-0 md:border-l border-gray-100">
                  <p className="text-gray-500 text-sm leading-relaxed">Image loaded. Click below to detect the crop type and any disease.</p>
                  {!scanning ? (
                    <button onClick={handleScan}
                            className="w-full bg-green-700 hover:bg-green-800 text-white py-4 rounded-2xl font-bold text-base transition flex items-center justify-center gap-2 active:scale-95">
                      <Activity size={19} /> Scan for Disease
                    </button>
                  ) : (
                    <div className="flex flex-col items-center gap-3 py-4">
                      <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-gray-500 text-sm font-medium">Analyzing your crop...</p>
                    </div>
                  )}
                  <button onClick={resetScan}
                          className="text-sm text-gray-400 hover:text-gray-600 transition flex items-center justify-center gap-1.5">
                    <RotateCcw size={13} /> Choose a different image
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── RESULT: left details / right image ── */}
          {result && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

              {/* header */}
              <div className={`px-6 py-5 flex items-center justify-between border-b
                              ${isHealthy ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                <div className="flex items-center gap-3">
                  {isHealthy
                    ? <CheckCircle size={28} className="text-emerald-500 flex-shrink-0" />
                    : <AlertTriangle size={28} className="text-rose-500 flex-shrink-0" />}
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg leading-tight">Scan Complete</h3>
                    <p className={`text-sm font-medium ${isHealthy ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isHealthy
                        ? 'No disease detected — plant looks healthy!'
                        : `Disease detected: ${result.diseaseDetected}`}
                    </p>
                  </div>
                </div>
                <button onClick={resetScan} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-white/60 transition">
                  <X size={18} />
                </button>
              </div>

              {/* body */}
              <div className="flex flex-col lg:flex-row">

                {/* LEFT — details */}
                <div className="flex-1 p-6 lg:p-8 space-y-5 order-2 lg:order-1">

                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Crop Identified</p>
                    <p className="text-2xl font-bold text-gray-800">{result.cropName || 'Unknown'}</p>
                  </div>
                  <div className="h-px bg-gray-100" />

                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Condition</p>
                    <p className={`text-xl font-bold ${isHealthy ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {result.diseaseDetected || 'Healthy'}
                    </p>
                  </div>
                  <div className="h-px bg-gray-100" />

                  {confidenceNum > 0 && (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Confidence</p>
                          <span className="text-sm font-bold text-gray-700">{confidenceNum.toFixed(1)}%</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${isHealthy ? 'bg-emerald-500' : 'bg-rose-500'}`}
                            style={{ width: `${Math.min(confidenceNum, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="h-px bg-gray-100" />
                    </>
                  )}

                  {result.recommendation && (
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Recommended Treatment</p>
                      <p className="text-gray-600 leading-relaxed text-sm lg:text-base">{result.recommendation}</p>
                    </div>
                  )}

                  {!isHealthy && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 rounded-2xl border border-rose-100">
                      <Bug size={16} className="text-rose-500 flex-shrink-0" />
                      <p className="text-rose-700 text-sm font-semibold">This scan has been recorded in your history.</p>
                    </div>
                  )}

                  <button
                    onClick={() => { resetScan(); setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); }}
                    className="w-full bg-green-700 hover:bg-green-800 text-white py-3.5 rounded-2xl font-bold transition flex items-center justify-center gap-2 active:scale-95"
                  >
                    <RotateCcw size={17} /> Scan Another Crop
                  </button>
                </div>

                {/* RIGHT — image */}
                <div className="lg:w-96 bg-gray-50 border-b lg:border-b-0 lg:border-l border-gray-100
                                flex flex-col items-center justify-center p-6 lg:p-8 order-1 lg:order-2">
                  {preview && (
                    <>
                      <img
                        src={preview}
                        alt="Scanned crop"
                        className="w-full max-h-64 lg:max-h-80 object-contain rounded-2xl shadow-md"
                      />
                      <p className="text-xs text-gray-400 font-medium mt-3 text-center">Submitted image</p>
                    </>
                  )}
                  {!isHealthy && (
                    <div className="mt-4 w-full px-4 py-3 bg-rose-100 rounded-xl text-center">
                      <p className="text-rose-700 text-xs font-bold uppercase tracking-wider">⚠️ Disease Detected</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>{/* end scan panel */}
      </div>

      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
