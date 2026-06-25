// components/PlantScanPanel.jsx
import { useState, useRef } from "react";
import {
  Upload,
  Camera,
  X,
  Leaf,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  Activity,
  Bug,
  Calendar,
} from "lucide-react";

const PlantScanPanel = ({ token, onScanComplete }) => {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);

  const fileInputRef = useRef();
  const videoRef = useRef();
  const canvasRef = useRef();

  const loadFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
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
      setTimeout(() => videoRef.current && (videoRef.current.srcObject = s), 50);
    } catch {
      alert("Camera access denied or not available");
    }
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
      setResult(data);
      if (onScanComplete) onScanComplete(data);
    } catch (e) {
      console.error(e);
      alert("Scan failed. Try again.");
    } finally {
      setScanning(false);
    }
  };

  const resetScan = () => {
    setPreview(null);
    setSelectedFile(null);
    setResult(null);
    closeCamera();
  };

  const isHealthy = result && (!result.diseaseDetected || result.diseaseDetected === "Healthy");
  const confidenceNum = result?.confidence
    ? typeof result.confidence === "string"
      ? parseFloat(result.confidence)
      : result.confidence * 100
    : 0;

  return (
    <div className="max-w-4xl">
      {/* Camera */}
      {isCameraOpen && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="flex justify-between items-center px-6 py-4 border-b">
            <p className="font-bold text-lg">Camera</p>
            <button onClick={closeCamera} className="text-gray-400 hover:text-gray-600">
              <X size={22} />
            </button>
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

      {/* Drag & Drop Area */}
      {!isCameraOpen && !preview && !result && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`bg-white border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all
            ${dragOver ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300"}`}
        >
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
            <Leaf size={48} className="text-green-700" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Scan Your Plant</h3>
          <p className="text-gray-500 mb-8">Drag & drop your plant photo here or click to upload</p>

          <div className="flex justify-center gap-4">
            <button
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="flex items-center gap-3 bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-2xl font-semibold"
            >
              <Upload size={18} /> Choose File
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); openCamera(); }}
              className="flex items-center gap-3 border border-gray-300 hover:bg-gray-50 px-6 py-3 rounded-2xl font-semibold"
            >
              <Camera size={18} /> Open Camera
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-6">JPG, PNG, WEBP • Max 5MB</p>
        </div>
      )}

      {/* Preview */}
      {!isCameraOpen && preview && !result && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 flex justify-between items-center border-b">
            <p className="font-semibold text-lg">Ready to Scan</p>
            <button onClick={resetScan}><X size={22} /></button>
          </div>
          <div className="p-8 flex flex-col md:flex-row gap-8 items-center">
            <img src={preview} alt="preview" className="max-h-80 rounded-2xl shadow" />
            <div className="text-center md:text-left">
              {!scanning ? (
                <button onClick={handleScan} className="bg-green-700 text-white px-10 py-4 rounded-2xl font-bold text-lg w-full md:w-auto">
                  Scan for Disease
                </button>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full mb-3" />
                  <p>Analyzing...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RESULT CARD - Matching Your Image */}
      {result && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b">
            <h2 className="text-xl font-bold">Recent Diagnosis</h2>
            <button onClick={resetScan} className="text-green-700 font-medium hover:underline">Scan New Plant</button>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Left: Image */}
            <div className="lg:w-5/12 p-6 border-b lg:border-b-0 lg:border-r">
              {preview && (
                <img
                  src={preview}
                  alt="Scanned Plant"
                  className="w-full rounded-2xl shadow-md object-cover"
                />
              )}
            </div>

            {/* Right: Details */}
            <div className="lg:w-7/12 p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl font-bold text-red-600">
                    {isHealthy ? "Healthy" : result.diseaseDetected || "Disease Detected"}
                  </p>
                  <div className="inline-block mt-1 px-4 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                    High Confidence ({confidenceNum.toFixed(0)}%)
                  </div>
                </div>
                {!isHealthy && <AlertTriangle size={32} className="text-red-500" />}
                {isHealthy && <CheckCircle size={32} className="text-emerald-500" />}
              </div>

              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div>
                  <p className="text-gray-500">Crop</p>
                  <p className="font-semibold">{result.cropName || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Detected On</p>
                  <p className="font-semibold">{new Date().toLocaleString()}</p>
                </div>
              </div>

              {!isHealthy && (
                <>
                  <div className="pt-4 border-t">
                    <p className="font-semibold text-gray-700 mb-2">Recommended Pesticide</p>
                    <p className="font-bold">Mancozeb 75% WP</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Dosage</p>
                      <p className="font-medium">2.5 g per litre of water</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Spray Interval</p>
                      <p className="font-medium">Every 4 Days</p>
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={resetScan}
                  className="flex-1 border border-gray-300 py-3.5 rounded-2xl font-medium hover:bg-gray-50"
                >
                  View Details
                </button>
                <button
                  onClick={resetScan}
                  className="flex-1 bg-green-700 hover:bg-green-800 text-white py-3.5 rounded-2xl font-medium flex items-center justify-center gap-2"
                >
                  <Calendar size={18} />
                  Add to Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => loadFile(e.target.files[0])}
      />
    </div>
  );
};

export default PlantScanPanel;