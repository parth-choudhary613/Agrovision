// components/PlantScanPanel.jsx
import { useState, useRef, useEffect, useCallback } from "react";
import { Upload, Camera, X, Leaf, AlertTriangle, CheckCircle, Calendar, FileText } from "lucide-react";
import ScanDetailsModal from "./ScanDetailsModal";
import ScheduleCalendarModal from "./ScheduleCalenderModal";

const STORAGE_KEY = "agro_last_scan";

const PlantScanPanel = ({ token, onScanComplete, onSprayScheduled }) => {
  const [preview, setPreview] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY))?.preview || null; } catch { return null; }
  });
  const [result, setResult] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY))?.result || null; } catch { return null; }
  });

  const [dragOver, setDragOver]     = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [scanning, setScanning]     = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream]         = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleConfirmed, setScheduleConfirmed] = useState(false);

  const fileInputRef = useRef();
  const videoRef     = useRef();
  const canvasRef    = useRef();

  const persist = useCallback((previewUrl, scanResult) => {
    if (previewUrl && scanResult) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ preview: previewUrl, result: scanResult }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const handler = () => { if (!result) fileInputRef.current?.click(); };
    window.addEventListener("triggerScan", handler);
    return () => window.removeEventListener("triggerScan", handler);
  }, [result]);

  const loadFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setScheduleConfirmed(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    loadFile(e.dataTransfer.files[0]);
  };

  const openCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setStream(s);
      setIsCameraOpen(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = s; }, 50);
    } catch { alert("Camera access denied or not available"); }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      loadFile(new File([blob], "capture.jpg", { type: "image/jpeg" }));
      closeCamera();
    }, "image/jpeg", 0.92);
  };

  const closeCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setIsCameraOpen(false);
  };

  const handleScan = async () => {
    if (!selectedFile || !token) return;
    setScanning(true);
    const fd = new FormData();
    fd.append("image", selectedFile);

    try {
      const r = await fetch("http://localhost:5000/api/scan", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await r.json();

      if (!data.success) throw new Error(data.error || "Scan failed");

      setResult(data);
      persist(preview, data);
      if (onScanComplete) onScanComplete(data);
    } catch (e) {
      console.error(e);
      alert(e.message || "Scan failed. Try again.");
    } finally {
      setScanning(false);
    }
  };

  const resetScan = () => {
    setPreview(null);
    setSelectedFile(null);
    setResult(null);
    setShowDetailsModal(false);
    setShowScheduleModal(false);
    setScheduleConfirmed(false);
    persist(null, null);
    closeCamera();
  };

  const isHealthy      = result?.isHealthy || result?.diseaseDetected === "Healthy";
  const confidencePct  = result?.confidence
    ? (result.confidence <= 1 ? result.confidence * 100 : result.confidence).toFixed(0)
    : 0;
  const diseaseName    = result?.diseaseDetected && result.diseaseDetected !== "Healthy"
    ? result.diseaseDetected
    : null;
  const pesticide      = result?.pesticide      || null;
  const dosage         = result?.dosage         || null;
  const sprayInterval  = result?.sprayInterval  || null;
  const recommendation = result?.recommendation || null;
  const hasDetails     = !!(result?.diseaseDescription || result?.prevention || result?.howToUse || result?.biologicalTreatment);

  return (
    <div data-scan-panel className="w-full">
      {/* ── Camera ── */}
      {isCameraOpen && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-6 max-w-2xl mx-auto">
          <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b">
            <p className="font-bold text-base sm:text-lg">Camera</p>
            <button onClick={closeCamera} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
              <X size={20} className="sm:w-[22px] sm:h-[22px]" />
            </button>
          </div>
          <div className="p-4 sm:p-6">
            {/* ✅ FIXED: Added strict height and object-cover to video */}
            <video ref={videoRef} autoPlay playsInline className="w-full h-[300px] sm:h-[400px] object-cover rounded-xl sm:rounded-2xl bg-black" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-5 sm:mt-6">
              <button onClick={capturePhoto} className="w-full sm:w-auto bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-xl sm:rounded-2xl font-semibold flex justify-center items-center gap-2 transition-colors">
                <Camera size={18} /> Capture
              </button>
              <button onClick={closeCamera} className="w-full sm:w-auto px-6 py-3 border border-gray-200 hover:bg-gray-50 rounded-xl sm:rounded-2xl font-medium transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── IDLE: two-column drag-drop + buttons ── */}
      {!isCameraOpen && !preview && !result && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden max-w-2xl mx-auto">
          <div className="flex flex-col md:flex-row">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 flex flex-col items-center justify-center p-6 sm:p-8 cursor-pointer transition-all border-dashed border-2 rounded-xl sm:rounded-3xl m-3 sm:m-4
                ${dragOver ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-400 hover:bg-green-50/30"}`}
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                <Leaf size={28} className="text-green-700 sm:w-[38px] sm:h-[38px]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1 text-center">Scan Your Plant</h3>
              <p className="text-xs sm:text-sm text-gray-500 text-center max-w-[200px] sm:max-w-none">Drag & drop your photo here or tap to upload</p>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-2 sm:mt-3">JPG, PNG, WEBP • Max 5MB</p>
            </div>
            
            <div className="flex flex-col w-full md:w-auto items-center justify-center gap-3 p-5 sm:p-6 md:py-8 border-t md:border-t-0 md:border-l border-gray-100 bg-gray-50/50">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:max-w-sm md:w-44 flex justify-center items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-5 py-3 rounded-xl sm:rounded-2xl font-semibold shadow-sm transition-all"
              >
                <Upload size={17} /> Choose File
              </button>
              <button
                onClick={openCamera}
                className="w-full sm:max-w-sm md:w-44 flex justify-center items-center gap-2 bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 px-5 py-3 rounded-xl sm:rounded-2xl font-semibold shadow-sm transition-all"
              >
                <Camera size={17} /> Open Camera
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PREVIEW: ready to scan ── */}
      {!isCameraOpen && preview && !result && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden max-w-2xl mx-auto">
          <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b">
            <p className="font-semibold text-base sm:text-lg">Ready to Scan</p>
            <button onClick={resetScan} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
              <X size={20} className="sm:w-[22px] sm:h-[22px]" />
            </button>
          </div>
          <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-center">
            <img src={preview} alt="preview" className="w-32 h-32 sm:w-48 sm:h-48 object-cover rounded-xl sm:rounded-2xl shadow-sm border border-gray-100" />
            <div className="flex flex-col w-full sm:w-auto items-center sm:items-start gap-3 sm:gap-4 text-center sm:text-left">
              <p className="text-gray-500 text-sm">Image ready for disease analysis</p>
              {!scanning ? (
                <button onClick={handleScan} className="w-full sm:w-auto bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-xl sm:rounded-2xl font-bold shadow-md transition-all active:scale-95">
                  Scan for Disease
                </button>
              ) : (
                <div className="flex flex-col items-center sm:items-start gap-2 w-full">
                  <div className="animate-spin w-8 h-8 sm:w-9 sm:h-9 border-4 border-green-500 border-t-transparent rounded-full mx-auto sm:mx-0" />
                  <p className="text-sm text-gray-500 font-medium text-center sm:text-left w-full">Analyzing your plant…</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── RESULT: diagnosis card ── */}
      {result && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-md overflow-hidden w-full">
          <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b bg-gray-50/50">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Recent Diagnosis</h2>
            <button onClick={resetScan} className="text-green-700 text-xs sm:text-sm font-semibold hover:text-green-800 hover:underline">
              Scan New Plant
            </button>
          </div>

          <div className="flex flex-col lg:flex-row">
          {/* Plant image */}
         {/* Plant image */}
            <div className="w-full lg:w-5/12 p-3 sm:p-5 border-b lg:border-b-0 lg:border-r border-gray-100 bg-gray-50/30 flex items-center justify-center">
              {preview && (
                <img src={preview} alt="Scanned Plant" className="w-full h-56 sm:h-72 lg:h-[340px] object-cover rounded-xl sm:rounded-2xl shadow-sm border border-gray-200/60" />
              )}
            </div>

            {/* Details */}
            <div className="w-full lg:w-7/12 p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className={`text-xl sm:text-2xl font-bold leading-tight break-words ${isHealthy ? "text-green-700" : "text-red-600"}`}>
                    {isHealthy ? "Healthy" : (diseaseName || "Disease Detected")}
                  </p>
                  <span className={`inline-block mt-1.5 px-2.5 sm:px-3 py-0.5 text-[10px] sm:text-xs font-semibold rounded-full border
                    ${isHealthy ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                    {confidencePct}% Confidence
                  </span>
                </div>
                {isHealthy
                  ? <CheckCircle size={24} className="text-emerald-500 flex-shrink-0 sm:w-[28px] sm:h-[28px]" />
                  : <AlertTriangle size={24} className="text-red-500 flex-shrink-0 sm:w-[28px] sm:h-[28px]" />}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm pt-1">
                <div className="bg-gray-50 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-gray-100">
                  <p className="text-gray-400 text-[10px] sm:text-xs mb-0.5">Crop</p>
                  <p className="font-semibold text-gray-800 text-xs sm:text-sm truncate">{result.cropName || "Unknown"}</p>
                </div>
                <div className="bg-gray-50 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-gray-100">
                  <p className="text-gray-400 text-[10px] sm:text-xs mb-0.5">Detected On</p>
                  <p className="font-semibold text-gray-800 text-xs sm:text-sm truncate">
                    {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })},{" "}
                    {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>

              {!isHealthy && (pesticide || recommendation) && (
                <>
                  <div className="pt-3 sm:pt-4 border-t border-gray-100">
                    <p className="text-[10px] sm:text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">Recommended Treatment</p>
                    <p className="font-bold text-green-700 text-sm sm:text-base leading-snug">
                      {pesticide || "Consult a local agricultural expert"}
                    </p>
                  </div>

                  {(dosage || sprayInterval) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm">
                      {dosage && (
                        <div className="flex items-center justify-between sm:block bg-blue-50/50 p-2 sm:p-3 rounded-lg border border-blue-100">
                          <p className="text-[10px] sm:text-xs text-blue-500/80 mb-0 sm:mb-0.5">Dosage</p>
                          <p className="font-medium text-blue-900 text-xs sm:text-sm text-right sm:text-left">{dosage}</p>
                        </div>
                      )}
                      {sprayInterval && (
                        <div className="flex items-center justify-between sm:block bg-purple-50/50 p-2 sm:p-3 rounded-lg border border-purple-100">
                          <p className="text-[10px] sm:text-xs text-purple-500/80 mb-0 sm:mb-0.5">Interval</p>
                          <p className="font-medium text-purple-900 text-xs sm:text-sm text-right sm:text-left">{sprayInterval}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {recommendation && recommendation !== pesticide && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                      <p className="text-[10px] sm:text-xs text-amber-700 font-bold mb-1 uppercase tracking-wider">Expert Note</p>
                      <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">{recommendation}</p>
                    </div>
                  )}
                </>
              )}

              {isHealthy && (
                <div className="bg-green-50 border border-green-100 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                  <p className="text-sm sm:text-base text-green-800 font-semibold flex items-center gap-2">
                    <CheckCircle size={18} className="text-green-600" /> Plant is Thriving!
                  </p>
                  <p className="text-xs sm:text-sm text-green-700 mt-1 sm:mt-1.5 opacity-90">Your plant appears healthy. Keep monitoring regularly to maintain crop yield.</p>
                </div>
              )}

              {scheduleConfirmed && (
                <div className="bg-green-50 border border-green-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                  <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <p className="text-xs sm:text-sm text-green-800 font-medium leading-snug">
                    Schedule saved! View in "Upcoming Reminders".
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowDetailsModal(true)}
                  disabled={!hasDetails}
                  className="w-full flex-1 bg-white border border-gray-300 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <FileText size={16} className="sm:w-[18px] sm:h-[18px]" /> View Details
                </button>
                {!isHealthy && (
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    className="w-full flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm active:scale-[0.98]"
                  >
                    <Calendar size={16} className="sm:w-[18px] sm:h-[18px]" /> Add to Schedule
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => loadFile(e.target.files[0])} />

      {/* ── Modals ── */}
      {showDetailsModal && (
        <ScanDetailsModal result={result} onClose={() => setShowDetailsModal(false)} />
      )}
      {showScheduleModal && (
        <ScheduleCalendarModal
          result={result}
          scanId={result?.scanId}
          token={token}
          onClose={() => setShowScheduleModal(false)}
          onScheduled={(treatment) => {
            setScheduleConfirmed(true);
            if (onSprayScheduled) onSprayScheduled(treatment);
          }}
        />
      )}
    </div>
  );
};

export default PlantScanPanel;