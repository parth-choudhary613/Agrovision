// routes/scan.js
const express = require('express');
const multer = require('multer');
const { analyzeWithKindwise } = require('../utils/kindwise');
const Scan = require('../models/Scan');
const protect = require('../middleware/auth');   // ← Added

const router = express.Router();

// Multer
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Apply protection middleware
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const imageBuffer = req.file.buffer;

    const aiResult = await analyzeWithKindwise(imageBuffer);

    const scan = await Scan.create({
      userId,
      cropName: aiResult.cropName,
      diseaseDetected: aiResult.disease,
      confidence: aiResult.confidence,
      imageUrl: null,
    });

    res.status(201).json({
      success: true,
      cropName: aiResult.cropName,
      diseaseDetected: aiResult.disease || "Healthy",
      confidence: Math.round(aiResult.confidence * 100) + "%",
      recommendation: aiResult.recommendation,
      scanId: scan._id
    });

  } catch (error) {
    console.error("Scan Error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to process scan" 
    });
  }
});

module.exports = router;