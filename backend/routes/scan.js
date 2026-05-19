// routes/scan.js
const express = require('express');
const multer = require('multer');
const router = express.Router();
const Scan = require('../models/Scan');

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const userId = req.user.id;
    const imageBuffer = req.file.buffer;

    // TODO: Call AI API here (Kindwise / OpenAI / etc.)
    const aiResult = await analyzeCropWithAI(imageBuffer);   // Implement this function

    const scan = await Scan.create({
      userId,
      cropName: aiResult.cropName || "Unknown",
      diseaseDetected: aiResult.disease || null,
      confidence: aiResult.confidence,
      imageUrl: aiResult.imageUrl, // After uploading to Cloudinary
    });

    res.json({
      ...scan.toObject(),
      recommendation: aiResult.recommendation || "Follow standard treatment protocol."
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Scan failed" });
  }
});

module.exports = router;