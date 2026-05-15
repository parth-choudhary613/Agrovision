const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username:  { type: String, required: true },
  email:     { type: String, unique: true, sparse: true },
  phone:     { type: String, unique: true, sparse: true },
  googleId:  { type: String, unique: true, sparse: true },
  picture:   { type: String, default: '' },   // ← Google avatar URL; empty for phone users
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);