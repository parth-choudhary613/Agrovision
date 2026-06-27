import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';

const ScanCrop = forwardRef((props, ref) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview]             = useState(null);
  const [result, setResult]               = useState(null);
  const [loading, setLoading]             = useState(false);
  const [isCameraOpen, setIsCameraOpen]   = useState(false);
  const [scannerOpen, setScannerOpen]     = useState(false);
  const [stream, setStream]               = useState(null);

  const fileInputRef = useRef(null);
  const videoRef     = useRef(null);
  const canvasRef    = useRef(null);
  const scannerRef   = useRef(null);

  useImperativeHandle(ref, () => ({
    openScanner() {
      setScannerOpen(true);
      setTimeout(() => scannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    },
  }));

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) { setSelectedImage(file); setPreview(URL.createObjectURL(file)); setResult(null); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file); setPreview(URL.createObjectURL(file)); setResult(null);
    }
  };

  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setIsCameraOpen(true);
    } catch { alert('Camera access denied or not available'); }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current, video = videoRef.current;
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        const file = new File([blob], 'captured.jpg', { type: 'image/jpeg' });
        setSelectedImage(file); setPreview(URL.createObjectURL(blob)); closeCamera(); setResult(null);
      }, 'image/jpeg', 0.9);
    }
  };

  const closeCamera = () => { stream?.getTracks().forEach(t => t.stop()); setStream(null); setIsCameraOpen(false); };

  const handleScan = async () => {
    if (!selectedImage) return alert('Please select or capture an image');
    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedImage);
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch('http://localhost:5000/api/scan', {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Scan failed');
      setResult(data);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to scan crop. Please try again.');
    } finally { setLoading(false); }
  };

  const resetScan = () => {
    setSelectedImage(null); setPreview(null); setResult(null); setIsCameraOpen(false); closeCamera();
  };

  const isHealthy = result?.isHealthy === true;
  const confidenceNum = result?.confidence != null
    ? (result.confidence <= 1 ? Math.round(result.confidence * 100) : result.confidence)
    : 0;

  return (
    <div ref={scannerRef} className="mt-8">

      {/* ── Scanner Panel ─────────────────────────────────────────────── */}
      {scannerOpen && !result && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Scan New Plant 🌿</h2>
              <p className="text-sm text-gray-400 mt-0.5">Upload a photo or use your camera</p>
            </div>
            <button onClick={() => { setScannerOpen(false); resetScan(); }}
              className="text-gray-400 hover:text-gray-600 transition p-2 rounded-xl hover:bg-gray-100">✕</button>
          </div>

          <div className="p-6">
            {isCameraOpen && (
              <div className="mb-6">
                <div className="relative rounded-2xl overflow-hidden bg-black">
                  <video ref={videoRef} autoPlay playsInline className="w-full max-h-72 object-cover" />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <div className="flex gap-3 justify-center mt-4">
                  <button onClick={capturePhoto}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition">📸 Capture</button>
                  <button onClick={closeCamera}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition">Cancel</button>
                </div>
              </div>
            )}

            {preview && !isCameraOpen && (
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <img src={preview} alt="Preview" className="max-h-64 rounded-2xl shadow-md object-contain" />
                  <button onClick={resetScan}
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-700 rounded-full w-8 h-8 flex items-center justify-center shadow text-sm transition">✕</button>
                </div>
              </div>
            )}

            {!isCameraOpen && !preview && (
              <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}
                onClick={() => fileInputRef.current.click()}
                className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center mb-6 hover:border-green-400 hover:bg-green-50/30 transition cursor-pointer group">
                <div className="text-5xl mb-3">🌱</div>
                <p className="text-gray-500 font-medium group-hover:text-green-700 transition">Drag & drop an image, or click to browse</p>
                <p className="text-gray-400 text-sm mt-1">JPG, PNG, WEBP · Max 5MB</p>
              </div>
            )}

            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

            {!isCameraOpen && (
              <div className="flex flex-col sm:flex-row gap-3">
                {!preview && (
                  <>
                    <button onClick={() => fileInputRef.current.click()}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-semibold transition flex items-center justify-center gap-2">📤 Upload from Gallery</button>
                    <button onClick={openCamera}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-2xl font-semibold transition flex items-center justify-center gap-2">📸 Open Camera</button>
                  </>
                )}
                {preview && !loading && (
                  <button onClick={handleScan}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl text-lg font-bold transition flex items-center justify-center gap-2">🔍 Scan for Disease</button>
                )}
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center py-10 gap-4">
                <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 font-medium">Analyzing your crop with AI...</p>
                <p className="text-gray-400 text-sm">Identifying crop, disease, and treatment...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Result Panel ──────────────────────────────────────────────── */}
      {result && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Header */}
          <div className={`px-6 py-5 flex items-center justify-between ${
            isHealthy ? 'bg-emerald-50 border-b border-emerald-100' : 'bg-red-50 border-b border-red-100'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{isHealthy ? '✅' : '⚠️'}</span>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Scan Complete</h2>
                <p className={`text-sm font-medium ${isHealthy ? 'text-emerald-600' : 'text-red-600'}`}>
                  {isHealthy ? 'Plant looks healthy!' : '🚨 Disease Detected — Treatment Required'}
                </p>
              </div>
            </div>
            <button onClick={resetScan} className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-white/60">✕</button>
          </div>

          <div className="flex flex-col lg:flex-row">

            {/* Left: Details */}
            <div className="flex-1 p-6 lg:p-8 space-y-5 order-2 lg:order-1">

              {/* Crop Name */}
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">🌾</span>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Crop Identified</p>
                  <p className="text-xl font-bold text-gray-800 mt-0.5">{result.cropName || 'Unknown'}</p>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Disease / Condition */}
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">{isHealthy ? '💚' : '🔴'}</span>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Condition</p>
                  <p className={`text-xl font-bold mt-0.5 ${isHealthy ? 'text-emerald-600' : 'text-red-600'}`}>
                    {result.diseaseDetected || 'Healthy'}
                  </p>
                  {result.diseaseDescription && !isHealthy && (
                    <p className="text-sm text-gray-500 mt-2 leading-relaxed bg-gray-50 rounded-xl p-3">
                      {result.diseaseDescription}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Confidence */}
              {confidenceNum > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Detection Confidence</p>
                    <span className="text-sm font-bold text-gray-700">{confidenceNum}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${
                      isHealthy ? 'bg-emerald-500' : confidenceNum >= 70 ? 'bg-red-500' : 'bg-orange-500'
                    }`} style={{ width: `${confidenceNum}%` }} />
                  </div>
                </div>
              )}

              {/* ── TREATMENT SECTION (only when diseased) ── */}
              {!isHealthy && (
                <>
                  <div className="border-t border-gray-100" />

                  {/* Pesticide */}
                  {result.pesticide && (
                    <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🧪</span>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">Recommended Pesticide</p>
                          <p className="text-base font-bold text-gray-800">{result.pesticide}</p>
                          {result.dosage && (
                            <div className="flex gap-4 mt-2">
                              <span className="text-sm text-gray-600">
                                <span className="font-semibold text-gray-700">Dosage:</span> {result.dosage}
                              </span>
                              {result.sprayInterval && (
                                <span className="text-sm text-gray-600">
                                  <span className="font-semibold text-gray-700">Every:</span> {result.sprayInterval}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* How to Use */}
                  {result.howToUse && (
                    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">📋</span>
                        <div>
                          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">How to Apply</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{result.howToUse}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Biological Treatment */}
                  {result.biologicalTreatment && (
                    <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🌿</span>
                        <div>
                          <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1">Biological / Organic Treatment</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{result.biologicalTreatment}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Prevention */}
                  {result.prevention && (
                    <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🛡️</span>
                        <div>
                          <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-1">Prevention Tips</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{result.prevention}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Healthy message */}
              {isHealthy && result.recommendation && (
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💚</span>
                    <div>
                      <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">Status</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{result.recommendation}</p>
                    </div>
                  </div>
                </div>
              )}

              <button onClick={() => { resetScan(); setScannerOpen(true); }}
                className="w-full mt-2 bg-green-700 hover:bg-green-800 text-white py-3.5 rounded-2xl font-semibold transition flex items-center justify-center gap-2">
                🔄 Scan Another Crop
              </button>
            </div>

            {/* Right: Image */}
            <div className="lg:w-80 xl:w-96 bg-gray-50 flex items-center justify-center p-6 order-1 lg:order-2 border-b lg:border-b-0 lg:border-l border-gray-100">
              {preview && (
                <div className="w-full">
                  <img src={preview} alt="Scanned crop" className="w-full max-h-72 lg:max-h-96 object-contain rounded-2xl shadow-md" />
                  <p className="text-center text-xs text-gray-400 mt-3 font-medium">Scanned image</p>
                  {!isHealthy && result.diseaseDetected && (
                    <div className="mt-3 bg-red-100 rounded-xl px-3 py-2 text-center">
                      <p className="text-xs font-semibold text-red-700">⚠️ {result.diseaseDetected}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
});

ScanCrop.displayName = 'ScanCrop';
export default ScanCrop;