// backend/models/Scan.js
const mongoose = require('mongoose');

const ScanSchema = new mongoose.Schema({
  userId:              { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cropName:            { type: String, required: true },
  imageUrl:            { type: String },
  diseaseDetected:     { type: String },       // "Healthy" or disease name
  confidence:          { type: Number },        // 0–100 integer
  pesticide:           { type: String },
  dosage:              { type: String },
  sprayInterval:       { type: String },
  howToUse:            { type: String },        // Step-by-step application instructions
  biologicalTreatment: { type: String },
  prevention:          { type: String },
  diseaseDescription:  { type: String },
  recommendation:      { type: String },
  isHealthy:           { type: Boolean, default: false },
  scannedAt:           { type: Date, default: Date.now },
});

module.exports = mongoose.model('Scan', ScanSchema);