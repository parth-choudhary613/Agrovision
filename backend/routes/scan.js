// routes/scan.js
const express  = require('express');
const multer   = require('multer');
const { analyzeWithKindwise } = require('../utils/kindwise');
const Scan     = require('../models/Scan');
const protect  = require('../middleware/auth');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 },
});

// ── POST /api/scan ────────────────────────────────────────────────────────────
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const ai = await analyzeWithKindwise(req.file.buffer);

    const scan = await Scan.create({
      userId,
      cropName:        ai.cropName,
      diseaseDetected: ai.disease || 'Healthy',
      confidence:      ai.confidence,
      pesticide:       ai.pesticide,
      dosage:          ai.dosage,
      sprayInterval:   ai.sprayInterval,
      recommendation:  ai.recommendation,
      isHealthy:       ai.isHealthy,
      imageUrl:        null,
    });

    // ✅ Return ALL fields the frontend needs — nothing hardcoded
    res.status(201).json({
      success:         true,
      scanId:          scan._id,
      cropName:        ai.cropName,
      diseaseDetected: ai.disease || 'Healthy',
      confidence:      ai.confidence,        // 0–1 float
      isHealthy:       ai.isHealthy,
      pesticide:       ai.pesticide,         // e.g. "Mancozeb 75% WP"
      dosage:          ai.dosage,            // e.g. "2.5 g per litre of water"
      sprayInterval:   ai.sprayInterval,     // e.g. "Every 7 days"
      recommendation:  ai.recommendation,
    });

  } catch (error) {
    console.error('Scan Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to process scan' });
  }
});

// ── GET /api/scan/stats ───────────────────────────────────────────────────────
// ✅ Fixed: field names now match what Dashboard.jsx expects
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const cropsScanned = await Scan.countDocuments({ userId });

    const diseasesFound = await Scan.countDocuments({
      userId,
      isHealthy: false,
      diseaseDetected: { $exists: true, $nin: [null, '', 'Healthy'] },
    });

    // Upcoming sprays = scans with a sprayInterval in the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const upcomingSprays = await Scan.countDocuments({
      userId,
      isHealthy:     false,
      sprayInterval: { $exists: true, $ne: null },
      scannedAt:     { $gte: thirtyDaysAgo },
    });

    // Treatments done = all scans where a pesticide was recommended
    const treatmentsDone = await Scan.countDocuments({
      userId,
      pesticide: { $exists: true, $ne: null },
    });

    res.json({ cropsScanned, diseasesFound, upcomingSprays, treatmentsDone });

  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

module.exports = router;