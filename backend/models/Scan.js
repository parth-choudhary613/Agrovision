// models/Scan.js
const mongoose = require("mongoose");

const ScanSchema = new mongoose.Schema({
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cropName:        { type: String, required: true },
  imageUrl:        { type: String },
  diseaseDetected: { type: String },   // null / "Healthy" / disease name
  confidence:      { type: Number },
  // ✅ New structured treatment fields
  pesticide:       { type: String },
  dosage:          { type: String },
  sprayInterval:   { type: String },
  recommendation:  { type: String },
  isHealthy:       { type: Boolean, default: false },
  scannedAt:       { type: Date, default: Date.now },
});

module.exports = mongoose.model("Scan", ScanSchema);