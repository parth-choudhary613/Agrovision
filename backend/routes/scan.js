// backend/routes/scan.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const Scan = require('../models/Scan');
const { analyzeWithKindwise } = require('../utils/kindwise');

// Import protect correctly
const protect = require('../middleware/auth');   // ← Fixed: Not destructuring

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed!'), false);
    }
  }
});

// POST /api/scan
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image uploaded' });
    }

    const aiResult = await analyzeWithKindwise(req.file.buffer);

    // Reject non-plant images
    if (aiResult.cropName === "Unknown Crop" || aiResult.confidence < 0.08) {
      return res.status(400).json({
        success: false,
        error: "Not a valid plant image. Please upload a clear leaf photo."
      });
    }

    const scan = new Scan({
      userId: req.user.id,
      cropName: aiResult.cropName,
      imageUrl: "",
      diseaseDetected: aiResult.diseaseDetected,
      confidence: aiResult.confidence,
      pesticide: aiResult.pesticide,
      dosage: aiResult.dosage,
      sprayInterval: aiResult.sprayInterval,
      recommendation: aiResult.recommendation,
      isHealthy: aiResult.isHealthy,
    });

    await scan.save();

    res.json({
      success: true,
      ...aiResult,
      scanId: scan._id
    });

  } catch (error) {
    console.error("Scan Error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Server error during scan" 
    });
  }
});

// GET stats
router.get('/stats', protect, async (req, res) => {
  try {
    const total = await Scan.countDocuments({ userId: req.user.id });
    const diseased = await Scan.countDocuments({ userId: req.user.id, isHealthy: false });

    res.json({
      cropsScanned: total,
      diseasesFound: diseased,
      upcomingSprays: 0,
      treatmentsDone: 0
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load stats" });
  }
});

module.exports = router;