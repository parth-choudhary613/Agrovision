const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);

// Google Signup/Login
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
      const fullName = payload.name?.trim() || payload.email.split('@')[0];
      user = await User.create({
        googleId: payload.sub,
        email: payload.email,
        username: fullName,
        picture: payload.picture || '',   // ← Google profile image URL
      });
    } else {
      // Refresh picture in case user updated their Google avatar
      if (payload.picture && user.picture !== payload.picture) {
        user.picture = payload.picture;
        await user.save();
      }
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { username: user.username, picture: user.picture } });
  } catch (err) {
    console.error(err);
    res.status(400).json({ msg: 'Google authentication failed' });
  }
});

// Phone Signup/Login
router.post('/phone', async (req, res) => {
  try {
    const { username, phone } = req.body;

    if (!username || !phone) {
      return res.status(400).json({ msg: "Username and Phone are required" });
    }

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({
        username,
        phone,
        picture: '',   // ← no picture for phone users; frontend shows initial instead
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { username: user.username, picture: user.picture } });
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// Get Current User
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ msg: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ← select picture alongside username and email
    const user = await User.findById(decoded.id).select('username email picture');

    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({
      username: user.username,
      picture: user.picture || '',   // ← always return picture (empty string for phone users)
    });
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
});

module.exports = router;