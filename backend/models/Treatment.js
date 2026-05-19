// models/Treatment.js (for upcoming sprays + history)
const TreatmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scan' },
  disease: String,
  pesticide: String,
  spraySchedule: [{  // e.g., 3 times a week
    date: Date,
    status: { type: String, enum: ['pending', 'done'], default: 'pending' }
  }],
  completedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Treatment', TreatmentSchema);