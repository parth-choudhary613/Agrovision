// backend/routes/treatment.js
const express   = require('express');
const router    = express.Router();
const mongoose  = require('mongoose');
const Treatment = require('../models/Treatment');
const Scan      = require('../models/Scan');
const protect   = require('../middleware/auth');

// Normalize "YYYY-MM-DD" (or any parseable date string) to a Date at local midnight,
// so day-based comparisons ("In X Days") stay accurate regardless of time-of-day.
const toDateOnly = (input) => {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
};

// POST /api/treatment  — schedule spray dates for a scan
// body: { scanId, dates: ["2026-06-30", "2026-07-01"] }
router.post('/', protect, async (req, res) => {
  try {
    const { scanId, dates } = req.body;

    if (!scanId || !mongoose.Types.ObjectId.isValid(scanId)) {
      return res.status(400).json({ success: false, error: 'A valid scanId is required' });
    }
    if (!Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ success: false, error: 'Select at least one date' });
    }

    const scan = await Scan.findOne({ _id: scanId, userId: req.user.id });
    if (!scan) {
      return res.status(404).json({ success: false, error: 'Scan not found' });
    }

    const parsedDates = dates.map(toDateOnly).filter(Boolean);
    if (parsedDates.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid dates provided' });
    }

    const spraySchedule = parsedDates
      .sort((a, b) => a - b)
      .map((date) => ({ date, status: 'pending' }));

    const treatment = await Treatment.create({
      userId:    req.user.id,
      scanId:    scan._id,
      cropName:  scan.cropName,
      disease:   scan.diseaseDetected,
      pesticide: scan.pesticide,
      dosage:    scan.dosage,
      spraySchedule,
    });

    res.json({ success: true, treatment });
  } catch (err) {
    console.error('Create Treatment Error:', err.message || err);
    res.status(500).json({ success: false, error: 'Failed to schedule sprays' });
  }
});

// GET /api/treatment/upcoming — flattened, sorted list of pending sprays (for the dashboard card)
// optional query: ?limit=5
router.get('/upcoming', protect, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 5, 50);
    const treatments = await Treatment.find({ userId: req.user.id }).lean();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = [];
    for (const t of treatments) {
      for (const spray of t.spraySchedule || []) {
        if (spray.status !== 'pending') continue;
        const sprayDate = new Date(spray.date);
        if (sprayDate < today) continue; // skip overdue/past dates from the "upcoming" list

        upcoming.push({
          treatmentId: t._id,
          sprayId:     spray._id,
          cropName:    t.cropName || 'Crop',
          disease:     t.disease || 'Unknown',
          pesticide:   t.pesticide || '',
          dosage:      t.dosage || '',
          date:        spray.date,
        });
      }
    }

    upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({ success: true, upcoming: upcoming.slice(0, limit) });
  } catch (err) {
    console.error('Fetch Upcoming Sprays Error:', err.message || err);
    res.status(500).json({ success: false, error: 'Failed to load upcoming sprays' });
  }
});

// PATCH /api/treatment/:treatmentId/spray/:sprayId — mark a single spray done
router.patch('/:treatmentId/spray/:sprayId', protect, async (req, res) => {
  try {
    const { treatmentId, sprayId } = req.params;

    const treatment = await Treatment.findOne({ _id: treatmentId, userId: req.user.id });
    if (!treatment) {
      return res.status(404).json({ success: false, error: 'Treatment not found' });
    }

    const spray = treatment.spraySchedule.id(sprayId);
    if (!spray) {
      return res.status(404).json({ success: false, error: 'Spray entry not found' });
    }

    spray.status = 'done';

    const allDone = treatment.spraySchedule.every((s) => s.status === 'done');
    if (allDone) treatment.completedAt = new Date();

    await treatment.save();
    res.json({ success: true, treatment });
  } catch (err) {
    console.error('Update Spray Error:', err.message || err);
    res.status(500).json({ success: false, error: 'Failed to update spray status' });
  }
});

module.exports = router;
