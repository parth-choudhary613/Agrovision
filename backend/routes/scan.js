const express = require('express');
const multer = require('multer');
const { analyzeWithKindwise } = require('../utils/kindwise');
const Scan = require('../models/Scan');
const protect = require('../middleware/auth');

const router = express.Router();

// ── Multer ────────────────────────────────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ── POST /api/scan  →  analyze image & save result ───────────────────────────
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const aiResult = await analyzeWithKindwise(req.file.buffer);

    const scan = await Scan.create({
      userId,
      cropName:        aiResult.cropName,
      diseaseDetected: aiResult.disease,
      confidence:      aiResult.confidence,
      imageUrl:        null,
    });

    res.status(201).json({
      success:         true,
      cropName:        aiResult.cropName,
      diseaseDetected: aiResult.disease || 'Healthy',
      confidence:      aiResult.confidence,          // raw 0-1 number for the progress bar
      recommendation:  aiResult.recommendation,
      scanId:          scan._id,
    });

  } catch (error) {
    console.error('Scan Error:', error);
    res.status(500).json({
      success: false,
      error:   error.message || 'Failed to process scan',
    });
  }
});

// ── GET /api/scan/stats  →  all-time totals for the logged-in user ───────────
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const totalScans = await Scan.countDocuments({ userId });

    const totalDiseases = await Scan.countDocuments({
      userId,
      diseaseDetected: { $exists: true, $nin: [null, '', 'Healthy'] },
    });

    res.json({ totalScans, totalDiseases });

  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

module.exports = router;
