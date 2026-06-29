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

  // Respond to navbar "Scan New Plant" button
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

  // ── Derived display values — all from API, nothing hardcoded ─────────────
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
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-6 max-w-2xl">
          <div className="flex justify-between items-center px-6 py-4 border-b">
            <p className="font-bold text-lg">Camera</p>
            <button onClick={closeCamera} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
          </div>
          <div className="p-6">
            <video ref={videoRef} autoPlay playsInline className="w-full rounded-2xl" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex justify-center gap-4 mt-6">
              <button onClick={capturePhoto} className="bg-green-700 text-white px-8 py-3 rounded-2xl font-semibold flex items-center gap-2">
                <Camera size={18} /> Capture
              </button>
              <button onClick={closeCamera} className="px-6 py-3 border rounded-2xl">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── IDLE: two-column drag-drop + buttons ── */}
      {!isCameraOpen && !preview && !result && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden max-w-2xl">
          <div className="flex flex-col sm:flex-row">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 flex flex-col items-center justify-center p-8 cursor-pointer transition-all border-dashed border-2 rounded-3xl m-4
                ${dragOver ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300 hover:bg-gray-50"}`}
            >
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
                <Leaf size={38} className="text-green-700" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Scan Your Plant</h3>
              <p className="text-sm text-gray-500 text-center">Drag & drop your plant photo here or click to upload</p>
              <p className="text-xs text-gray-400 mt-3">JPG, PNG, WEBP • Max 5MB</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-8 sm:border-l border-gray-100">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-5 py-3 rounded-2xl font-semibold w-44 justify-center"
              >
                <Upload size={17} /> Choose File
              </button>
              <button
                onClick={openCamera}
                className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 px-5 py-3 rounded-2xl font-semibold w-44 justify-center"
              >
                <Camera size={17} /> Open Camera
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PREVIEW: ready to scan ── */}
      {!isCameraOpen && preview && !result && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden max-w-2xl">
          <div className="flex justify-between items-center px-6 py-4 border-b">
            <p className="font-semibold text-lg">Ready to Scan</p>
            <button onClick={resetScan} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
          </div>
          <div className="p-6 flex flex-col sm:flex-row gap-6 items-center">
            <img src={preview} alt="preview" className="w-48 h-48 object-cover rounded-2xl shadow" />
            <div className="flex flex-col items-center sm:items-start gap-4">
              <p className="text-gray-500 text-sm">Image ready for disease analysis</p>
              {!scanning ? (
                <button onClick={handleScan} className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-2xl font-bold">
                  Scan for Disease
                </button>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin w-9 h-9 border-4 border-green-500 border-t-transparent rounded-full" />
                  <p className="text-sm text-gray-500">Analyzing your plant…</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── RESULT: diagnosis card with REAL API data ── */}
      {result && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden max-w-3xl">
          <div className="flex justify-between items-center px-6 py-4 border-b">
            <h2 className="text-lg font-bold text-gray-900">Recent Diagnosis</h2>
            <button onClick={resetScan} className="text-green-700 text-sm font-medium hover:underline">
              Scan New Plant
            </button>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Plant image */}
            <div className="lg:w-5/12 p-5 border-b lg:border-b-0 lg:border-r border-gray-100">
              {preview && (
                <img src={preview} alt="Scanned Plant" className="w-full h-56 lg:h-full object-cover rounded-2xl shadow" />
              )}
            </div>

            {/* Details — all from API */}
            <div className="lg:w-7/12 p-6 space-y-4">
              {/* Disease + confidence */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`text-2xl font-bold ${isHealthy ? "text-green-700" : "text-red-600"}`}>
                    {isHealthy ? "Healthy" : (diseaseName || "Disease Detected")}
                  </p>
                  <span className={`inline-block mt-1 px-3 py-0.5 text-xs font-semibold rounded-full
                    ${isHealthy ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {confidencePct}% Confidence
                  </span>
                </div>
                {isHealthy
                  ? <CheckCircle size={28} className="text-emerald-500 flex-shrink-0" />
                  : <AlertTriangle size={28} className="text-red-500 flex-shrink-0" />}
              </div>

              {/* Crop + date */}
              <div className="grid grid-cols-2 gap-y-3 text-sm pt-1">
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Crop</p>
                  <p className="font-semibold">{result.cropName || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Detected On</p>
                  <p className="font-semibold">
                    {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })},{" "}
                    {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>

              {/* Treatment — only shown if disease detected */}
              {!isHealthy && (pesticide || recommendation) && (
                <>
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">Recommended Pesticide</p>
                    <p className="font-bold text-green-700 text-base">
                      {pesticide || "Consult a local agricultural expert"}
                    </p>
                  </div>

                  {(dosage || sprayInterval) && (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {dosage && (
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Dosage</p>
                          <p className="font-medium">{dosage}</p>
                        </div>
                      )}
                      {sprayInterval && (
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Spray Interval</p>
                          <p className="font-medium">{sprayInterval}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Show Kindwise's raw recommendation text if available */}
                  {recommendation && recommendation !== pesticide && (
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3">
                      <p className="text-xs text-amber-700 font-medium mb-1">Treatment Note</p>
                      <p className="text-xs text-amber-800 leading-relaxed">{recommendation}</p>
                    </div>
                  )}
                </>
              )}

              {/* Healthy message */}
              {isHealthy && (
                <div className="bg-green-50 border border-green-100 rounded-2xl p-3">
                  <p className="text-sm text-green-700 font-medium">✅ No disease detected</p>
                  <p className="text-xs text-green-600 mt-0.5">Your plant appears healthy. Keep monitoring regularly.</p>
                </div>
              )}

              {/* Schedule confirmation banner */}
              {scheduleConfirmed && (
                <div className="bg-green-50 border border-green-100 rounded-2xl p-3 flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-700 font-medium">
                    Spray schedule saved! Check "Upcoming Spray Reminders" on your dashboard.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowDetailsModal(true)}
                  disabled={!hasDetails}
                  className="flex-1 border border-gray-300 py-3 rounded-2xl text-sm font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText size={16} /> View Details
                </button>
                {!isHealthy && (
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    className="flex-1 bg-green-700 hover:bg-green-800 text-white py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 transition"
                  >
                    <Calendar size={16} /> Add to Schedule
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => loadFile(e.target.files[0])} />

      {/* ── View Details modal ── */}
      {showDetailsModal && (
        <ScanDetailsModal result={result} onClose={() => setShowDetailsModal(false)} />
      )}

      {/* ── Add to Schedule modal ── */}
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
