const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);

// Google Login / Signup
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.VITE_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    let user = await User.findOne({ googleId: payload.sub });

    if (!user) {
      // Improved username logic - use full name
      let fullName = payload.name || payload.email.split('@')[0];
      // Clean the name
      fullName = fullName.replace(/[^a-zA-Z0-9 ]/g, '').trim();
      
      user = await User.create({
        googleId: payload.sub,
        email: payload.email,
        username: fullName || "User"   // This will show "Johan Jacon"
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { username: user.username, email: user.email }
    });

  } catch (err) {
    console.error("Google Auth Error:", err.message);
    res.status(400).json({ msg: 'Google authentication failed' });
  }
});

router.post('/phone', async (req, res) => {
  try {
    const { username, phone } = req.body;
    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ username, phone });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { username: user.username } });
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

module.exports = router;