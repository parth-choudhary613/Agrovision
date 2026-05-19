// routes/dashboard.js
const express = require('express');
const router = express.Router();
const Scan = require('../models/Scan');
const Treatment = require('../models/Treatment');

router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id; // from your auth middleware (Google auth)

    const [cropsScanned, diseasesFound, upcomingSprays, treatmentsDone] = await Promise.all([
      // Crops Scanned
      Scan.countDocuments({ userId }),

      // Diseases Found (unique or total detections)
      Scan.countDocuments({ userId, diseaseDetected: { $ne: null } }),

      // Upcoming Sprays (pending in next 7 days)
      Treatment.countDocuments({
        userId,
        'spraySchedule.date': { $gte: new Date(), $lte: new Date(Date.now() + 7*24*60*60*1000) },
        'spraySchedule.status': 'pending'
      }),

      // Treatments Done
      Treatment.countDocuments({ userId, completedAt: { $ne: null } })
    ]);

    res.json({
      cropsScanned,
      diseasesFound,
      upcomingSprays,
      treatmentsDone
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;