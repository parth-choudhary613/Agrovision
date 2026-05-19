const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/scan', require('./routes/scan'));        // ← Added
// app.use('/api/dashboard', require('./routes/dashboard'));  // You can add later

// Test Route
app.get('/', (req, res) => {
  res.send('Agrovision Backend is Running 🌱');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => 
  console.log(`🚀 Server running on port ${PORT}`)
);