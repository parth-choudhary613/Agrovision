// models/Scan.js
const mongoose = require("mongoose");

const ScanSchema = new mongoose.Schema({
  userId:              { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cropName:            { type: String, required: true },
  imageUrl:            { type: String },
  diseaseDetected:     { type: String },     // "Healthy" or disease name
  confidence:          { type: Number },     // 0–100 integer
  // Chemical treatment fields
  pesticide:           { type: String },
  dosage:              { type: String },
  sprayInterval:       { type: String },
  // Extended treatment fields (from API details)
  biologicalTreatment: { type: String },
  prevention:          { type: String },
  diseaseDescription:  { type: String },
  // Summary recommendation
  recommendation:      { type: String },
  isHealthy:           { type: Boolean, default: false },
  scannedAt:           { type: Date, default: Date.now },
});

module.exports = mongoose.model("Scan", ScanSchema);
