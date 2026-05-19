// models/Scan.js
const mongoose = require('mongoose');

const ScanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cropName: { type: String, required: true },
  imageUrl: { type: String }, // Cloudinary / S3 URL
  diseaseDetected: { type: String }, // e.g., "Early Blight"
  confidence: { type: Number },
  scannedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Scan', ScanSchema);