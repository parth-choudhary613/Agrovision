// backend/models/Treatment.js (for upcoming sprays + history)
const mongoose = require('mongoose');

const TreatmentSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scanId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Scan' },
  cropName:  { type: String },
  disease:   String,
  pesticide: String,
  dosage:    String,
  spraySchedule: [{  // one entry per date the user picked on the calendar
    date:   { type: Date, required: true },
    status: { type: String, enum: ['pending', 'done'], default: 'pending' }
  }],
  completedAt: Date,
  createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('Treatment', TreatmentSchema);
