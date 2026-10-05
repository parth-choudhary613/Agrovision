// components/PlantScanPanel.jsx
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  Camera,
  X,
  Leaf,
  AlertTriangle,
  CheckCircle,
  Calendar,
  FileText,
  ShieldCheck,
  Image as ImageIcon,
} from "lucide-react";
import ScanDetailsModal from "./ScanDetailsModal";
import ScheduleCalendarModal from "./ScheduleCalenderModal";
import LottieImport from "lottie-react";
import scanAnimation from "../assets/PlantScan.json";

const API_URL = import.meta.env.VITE_API_URL;
const Lottie = LottieImport.default || LottieImport;
const STORAGE_KEY = "agro_last_scan";

const PlantScanPanel = ({ token, onScanComplete, onSprayScheduled }) => {
  const [preview, setPreview] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY))?.preview || null;
    } catch {
      return null;
    }
  });

  const [result, setResult] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY))?.result || null;
    } catch {
      return null;
    }
  });

  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleConfirmed, setScheduleConfirmed] = useState(false);

  const fileInputRef = useRef();
  const videoRef = useRef();
  const canvasRef = useRef();

  const persist = useCallback((previewUrl, scanResult) => {
    if (previewUrl && scanResult) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ preview: previewUrl, result: scanResult })
      );
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      if (!result) fileInputRef.current?.click();
    };
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
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setStream(s);
      setIsCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = s;
      }, 50);
    } catch {
      alert("Camera access denied or not available on this device.");
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        loadFile(new File([blob], "capture.jpg", { type: "image/jpeg" }));
        closeCamera();
      },
      "image/jpeg",
      0.92
    );
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
      const r = await fetch(`${API_URL}/api/scan`, {
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
      alert(e.message || "Scan failed. Please verify leaf photo clarity and try again.");
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

  const isHealthy = result?.isHealthy || result?.diseaseDetected === "Healthy";
  const confidencePct = result?.confidence
    ? (result.confidence <= 1
        ? result.confidence * 100
        : result.confidence
      ).toFixed(0)
    : 0;

  const diseaseName =
    result?.diseaseDetected && result.diseaseDetected !== "Healthy"
      ? result.diseaseDetected
      : null;

  const pesticide = result?.pesticide || null;
  const dosage = result?.dosage || null;
  const sprayInterval = result?.sprayInterval || null;
  const recommendation = result?.recommendation || null;
  const hasDetails = !!(
    result?.diseaseDescription ||
    result?.prevention ||
    result?.howToUse ||
    result?.biologicalTreatment
  );

  return (
    <div data-scan-panel className="w-full">
      {/* ── CAMERA VIEWFINDER MODAL ── */}
      {isCameraOpen && (
        <div className="bg-white rounded-3xl border border-[#DCE5DC] shadow-md overflow-hidden mb-6">
          <div className="flex justify-between items-center px-6 py-4 border-b border-[#DCE5DC] bg-[#F7F5EE]">
            <div className="flex items-center gap-2">
              <Camera size={18} className="text-[#1B4332]" />
              <p className="font-serif text-lg font-bold text-[#1B4332]">Field Camera Viewfinder</p>
            </div>
            <button
              onClick={closeCamera}
              className="text-[#66736B] hover:text-[#26332B] p-1.5 rounded-full hover:bg-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-6">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-[320px] sm:h-[400px] object-cover rounded-2xl bg-black"
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
              <button
                onClick={capturePhoto}
                className="inline-flex items-center justify-center gap-2 bg-[#1B4332] hover:bg-[#40916C] text-white px-8 py-3.5 rounded-xl font-semibold transition-colors shadow-xs"
              >
                <Camera size={18} />
                <span>Capture Leaf Photo</span>
              </button>
              <button
                onClick={closeCamera}
                className="px-6 py-3.5 border border-[#DCE5DC] hover:bg-[#F7F5EE] text-[#26332B] rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── IDLE: DRAG & DROP UPLOAD ZONE ── */}
      {!isCameraOpen && !preview && !result && (
        <div className="bg-white rounded-3xl border border-[#DCE5DC] p-5 sm:p-7 shadow-xs w-full flex flex-col md:flex-row gap-6 md:gap-8 items-stretch">
          {/* Dropzone Container */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex-1 w-full min-h-[300px] sm:min-h-[340px] rounded-2xl border-2 border-dashed overflow-hidden flex flex-col items-center justify-center p-6 cursor-pointer transition-all duration-200
              ${
                dragOver
                  ? "border-[#40916C] bg-[#F3F7F3]"
                  : "border-[#95B89A]/80 hover:border-[#40916C] bg-[#FAF9F5]"
              }`}
          >
            {/* Lottie Animation */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-85">
              <Lottie
                animationData={scanAnimation}
                loop
                autoplay
                className="w-64 h-64 sm:w-72 sm:h-72"
              />
            </div>

            {/* Foreground Content */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <h3 className="font-serif text-2xl font-bold text-[#1B4332] tracking-tight mb-2">
                Inspect Crop Health
              </h3>
              <p className="font-sans text-sm text-[#66736B] mb-5 max-w-xs">
                Drag and drop a fresh leaf photo here, or click to browse files
              </p>

              <div className="inline-flex items-center gap-2 bg-white border border-[#DCE5DC] text-[#26332B] px-4 py-1.5 rounded-full text-xs font-semibold shadow-2xs">
                <ImageIcon size={14} className="text-[#40916C]" />
                <span>JPG, PNG, WEBP • Max 5MB</span>
              </div>
            </div>
          </div>

          {/* Action Column */}
          <div className="flex flex-col justify-center md:w-[280px] gap-3.5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#66736B] mb-2">
                Scan Method
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 bg-[#1B4332] hover:bg-[#40916C] text-white px-5 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-xs active:scale-[0.99]"
              >
                <Upload size={17} />
                <span>Upload From Device</span>
              </button>
            </div>

            <button
              onClick={openCamera}
              className="w-full flex items-center justify-center gap-2 bg-white border border-[#DCE5DC] hover:bg-[#F7F5EE] text-[#1B4332] px-5 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-2xs"
            >
              <Camera size={17} className="text-[#40916C]" />
              <span>Use Live Camera</span>
            </button>

            {/* Privacy & Safety Note */}
            <div className="mt-2 p-3.5 rounded-xl bg-[#F7F5EE] border border-[#DCE5DC] flex items-start gap-2.5">
              <ShieldCheck size={18} className="text-[#40916C] shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed text-[#66736B]">
                <strong className="text-[#1B4332] font-semibold block">Confidential Analysis</strong>
                Leaf scans are processed securely against our plant pathology engine.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PREVIEW: READY TO SCAN ── */}
      {!isCameraOpen && preview && !result && (
        <div className="bg-white rounded-3xl border border-[#DCE5DC] shadow-xs overflow-hidden max-w-2xl mx-auto">
          <div className="flex justify-between items-center px-6 py-4 border-b border-[#DCE5DC] bg-[#F7F5EE]">
            <p className="font-serif text-lg font-bold text-[#1B4332]">Photo Ready for Analysis</p>
            <button
              onClick={resetScan}
              className="text-[#66736B] hover:text-[#26332B] p-1.5 rounded-full hover:bg-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-6 flex flex-col sm:flex-row gap-6 items-center">
            <img
              src={preview}
              alt="Crop Leaf Preview"
              className="w-36 h-36 sm:w-44 sm:h-44 object-cover rounded-2xl border border-[#DCE5DC] shadow-xs shrink-0"
            />
            <div className="flex flex-col w-full items-center sm:items-start gap-3.5 text-center sm:text-left">
              <div>
                <p className="font-bold text-base text-[#26332B]">Crop Leaf Loaded</p>
                <p className="text-xs text-[#66736B] mt-0.5">
                  Click below to identify symptoms, disease strain, and dosage
                </p>
              </div>

              {!scanning ? (
                <button
                  onClick={handleScan}
                  className="w-full sm:w-auto bg-[#1B4332] hover:bg-[#40916C] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-xs transition-all active:scale-95"
                >
                  Run AI Disease Diagnosis
                </button>
              ) : (
                <div className="flex items-center gap-3 py-2">
                  <div className="w-5 h-5 border-2 border-[#1B4332] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-semibold text-[#1B4332]">
                    Analyzing leaf pathology...
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── RESULT: DIAGNOSIS CARD ── */}
      {result && (
        <div className="bg-white rounded-3xl border border-[#DCE5DC] shadow-sm overflow-hidden w-full">
          {/* Card Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-[#DCE5DC] bg-[#F7F5EE]">
            <div className="flex items-center gap-2">
              <Leaf size={18} className="text-[#40916C]" />
              <h2 className="font-serif text-lg font-bold text-[#1B4332]">
                Pathology Diagnosis Report
              </h2>
            </div>
            <button
              onClick={resetScan}
              className="text-[#1B4332] hover:text-[#40916C] text-xs sm:text-sm font-bold underline underline-offset-4"
            >
              Scan Another Crop
            </button>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Scanned Leaf Photo */}
            <div className="w-full lg:w-5/12 p-5 border-b lg:border-b-0 lg:border-r border-[#DCE5DC] bg-[#FAF9F5] flex items-center justify-center">
              {preview && (
                <img
                  src={preview}
                  alt="Scanned Plant Leaf"
                  className="w-full h-64 sm:h-72 lg:h-[360px] object-cover rounded-2xl border border-[#DCE5DC] shadow-xs"
                />
              )}
            </div>

            {/* Diagnosis Details */}
            <div className="w-full lg:w-7/12 p-6 sm:p-8 space-y-5">
              {/* Disease Condition & Confidence */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p
                    className={`font-serif text-2xl sm:text-3xl font-bold leading-tight ${
                      isHealthy ? "text-[#1B4332]" : "text-rose-800"
                    }`}
                  >
                    {isHealthy ? "Healthy Foliage" : diseaseName || "Disease Detected"}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-bold rounded-full border ${
                        isHealthy
                          ? "bg-[#F3F7F3] text-[#1B4332] border-[#95B89A]"
                          : "bg-rose-50 text-rose-800 border-rose-200"
                      }`}
                    >
                      {confidencePct}% Confidence
                    </span>
                    <span className="text-xs text-[#66736B]">
                      Verified by Kindwise Crop Model
                    </span>
                  </div>
                </div>

                {isHealthy ? (
                  <CheckCircle size={28} className="text-[#40916C] shrink-0" />
                ) : (
                  <AlertTriangle size={28} className="text-rose-600 shrink-0" />
                )}
              </div>

              {/* Crop & Detection Meta */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-[#F7F5EE] p-3.5 rounded-xl border border-[#DCE5DC]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#66736B]">
                    Detected Crop
                  </p>
                  <p className="font-bold text-[#26332B] text-sm mt-0.5 truncate">
                    {result.cropName || "Unknown Crop"}
                  </p>
                </div>
                <div className="bg-[#F7F5EE] p-3.5 rounded-xl border border-[#DCE5DC]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#66736B]">
                    Diagnosis Date
                  </p>
                  <p className="font-bold text-[#26332B] text-sm mt-0.5 truncate">
                    {new Date().toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Treatment Section */}
              {!isHealthy && (pesticide || recommendation) && (
                <div className="pt-3 border-t border-[#DCE5DC] space-y-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#66736B]">
                      Recommended Treatment Agent
                    </p>
                    <p className="font-bold text-[#1B4332] text-base mt-0.5">
                      {pesticide || "Consult local agricultural extension"}
                    </p>
                  </div>

                  {(dosage || sprayInterval) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      {dosage && (
                        <div className="bg-white p-3.5 rounded-xl border border-[#DCE5DC]">
                          <p className="text-[11px] font-bold text-[#66736B]">
                            Application Dosage
                          </p>
                          <p className="font-bold text-[#1B4332] text-sm mt-0.5">
                            {dosage}
                          </p>
                        </div>
                      )}
                      {sprayInterval && (
                        <div className="bg-white p-3.5 rounded-xl border border-[#DCE5DC]">
                          <p className="text-[11px] font-bold text-[#66736B]">
                            Spray Cycle Interval
                          </p>
                          <p className="font-bold text-[#1B4332] text-sm mt-0.5">
                            {sprayInterval}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {recommendation && recommendation !== pesticide && (
                    <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3.5">
                      <p className="text-[11px] font-bold text-[#D4A72C] uppercase tracking-wider mb-1">
                        Agronomic Advisory
                      </p>
                      <p className="text-xs text-[#26332B] leading-relaxed">
                        {recommendation}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Healthy Confirmation */}
              {isHealthy && (
                <div className="bg-[#F3F7F3] border border-[#95B89A]/50 rounded-2xl p-4">
                  <p className="text-sm font-bold text-[#1B4332] flex items-center gap-2">
                    <CheckCircle size={18} className="text-[#40916C]" />
                    Crop is Thriving and Vigorous
                  </p>
                  <p className="text-xs text-[#66736B] mt-1 leading-relaxed">
                    No signs of fungal infection or pest damage detected. Continue routine inspection and balanced irrigation.
                  </p>
                </div>
              )}

              {scheduleConfirmed && (
                <div className="bg-[#F3F7F3] border border-[#95B89A]/50 rounded-xl p-3 flex items-center gap-2 text-xs font-semibold text-[#1B4332]">
                  <CheckCircle size={16} className="text-[#40916C] shrink-0" />
                  <span>Spray schedule successfully recorded in farm timeline.</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-[#DCE5DC]">
                <button
                  onClick={() => setShowDetailsModal(true)}
                  disabled={!hasDetails}
                  className="flex-1 bg-white border border-[#DCE5DC] hover:bg-[#F7F5EE] py-3 rounded-xl text-xs sm:text-sm font-semibold text-[#26332B] transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                >
                  <FileText size={16} className="text-[#40916C]" />
                  <span>Full Report &amp; Prevention</span>
                </button>

                {!isHealthy && (
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    className="flex-1 bg-[#1B4332] hover:bg-[#40916C] text-white py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.98]"
                  >
                    <Calendar size={16} />
                    <span>Add to Spray Calendar</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => loadFile(e.target.files[0])}
      />

      {/* ── MODALS ── */}
      {showDetailsModal && (
        <ScanDetailsModal
          result={result}
          onClose={() => setShowDetailsModal(false)}
        />
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
