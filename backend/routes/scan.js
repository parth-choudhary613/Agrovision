// backend/routes/scan.js
const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const Scan    = require('../models/Scan');
const { analyzeWithKindwise } = require('../utils/kindwise');
const protect = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed!'), false);
  }
});

// POST /api/scan
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image uploaded' });
    }

    let aiResult;
    try {
      aiResult = await analyzeWithKindwise(req.file.buffer);
    } catch (err) {
      // NOT_A_PLANT error thrown from kindwise.js when confidence is too low
      if (err.message === 'NOT_A_PLANT') {
        return res.status(400).json({
          success: false,
          error: 'No crop detected. Please upload a clear photo of a plant leaf or crop.'
        });
      }
      throw err;
    }

    const scan = new Scan({
      userId:              req.user.id,
      cropName:            aiResult.cropName,
      imageUrl:            '',
      diseaseDetected:     aiResult.diseaseDetected,
      confidence:          aiResult.confidence,
      pesticide:           aiResult.pesticide,
      dosage:              aiResult.dosage,
      sprayInterval:       aiResult.sprayInterval,
      howToUse:            aiResult.howToUse,
      biologicalTreatment: aiResult.biologicalTreatment,
      prevention:          aiResult.prevention,
      recommendation:      aiResult.recommendation,
      diseaseDescription:  aiResult.diseaseDescription,
      isHealthy:           aiResult.isHealthy,
    });

    await scan.save();
    res.json({ success: true, ...aiResult, scanId: scan._id });

  } catch (error) {
    console.error('Scan Error:', error.response?.data || error.message || error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error during scan'
    });
  }
});

// GET /api/scan/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const total    = await Scan.countDocuments({ userId: req.user.id });
    const diseased = await Scan.countDocuments({ userId: req.user.id, isHealthy: false });
    res.json({ cropsScanned: total, diseasesFound: diseased, upcomingSprays: 0, treatmentsDone: 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

module.exports = router;