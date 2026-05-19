import React, { useState, useRef } from 'react';

const ScanCrop = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);

  // Handle File Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  // Open Camera
  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraOpen(true);
    } catch (err) {
      alert("Camera access denied or not available");
    }
  };

  // Capture Photo from Camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], "captured.jpg", { type: "image/jpeg" });
        setSelectedImage(file);
        setPreview(URL.createObjectURL(blob));
        closeCamera();
      }, 'image/jpeg', 0.9);
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  // Submit to Backend
  const handleScan = async () => {
    if (!selectedImage) return alert("Please select or capture an image");

    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const token = localStorage.getItem('token');

      const res = await fetch('http://localhost:5000/api/scan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Failed to scan crop. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Scan Crop 🌱</h1>

      <div className="bg-white rounded-3xl shadow-lg p-8">
        {/* Preview Area */}
        {preview && (
          <div className="mb-8 flex justify-center">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-96 rounded-2xl shadow-md" 
            />
          </div>
        )}

        {/* Camera */}
        {isCameraOpen && (
          <div className="mb-8">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full max-h-96 rounded-2xl bg-black"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="flex gap-4 justify-center mt-4">
              <button
                onClick={capturePhoto}
                className="bg-green-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-green-700"
              >
                📸 Capture
              </button>
              <button
                onClick={closeCamera}
                className="bg-gray-500 text-white px-8 py-3 rounded-xl font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Upload & Camera Buttons */}
        {!isCameraOpen && (
          <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
            <button
              onClick={() => fileInputRef.current.click()}
              className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-semibold hover:bg-blue-700 transition"
            >
              📤 Upload from Gallery
            </button>
            
            <button
              onClick={openCamera}
              className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-semibold hover:bg-green-700 transition"
            >
              📸 Open Camera
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
        )}

        {/* Scan Button */}
        {preview && !loading && (
          <button
            onClick={handleScan}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl text-xl font-bold transition"
          >
            🔍 Scan for Disease
          </button>
        )}

        {loading && (
          <div className="text-center py-10">
            <div className="animate-spin w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-lg">Analyzing your crop...</p>
          </div>
        )}

        {/* Result Section */}
        {result && (
          <div className="mt-10 p-6 bg-emerald-50 rounded-2xl border border-emerald-200">
            <h2 className="text-2xl font-bold mb-4">Scan Result</h2>
            
            <div className="space-y-4">
              <p><strong>Crop:</strong> {result.cropName}</p>
              <p><strong>Disease:</strong> {result.diseaseDetected || "Healthy"}</p>
              <p><strong>Confidence:</strong> {result.confidence ? (result.confidence * 100).toFixed(1) + "%" : "N/A"}</p>
              
              {result.recommendation && (
                <div>
                  <strong>Recommended Treatment:</strong>
                  <p className="mt-2 text-gray-700">{result.recommendation}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => window.location.reload()}
              className="mt-6 w-full bg-emerald-600 text-white py-3 rounded-xl"
            >
              Scan Another Crop
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanCrop;