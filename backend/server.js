const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Middleware — allow your Vercel frontend + local dev
app.use(cors({
  origin: [
    'https://agrovision-beige-eta.vercel.app',
    'https://agrovision-mtl.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/scan', require('./routes/scan'));
app.use('/api/treatment', require('./routes/treatment'));
app.use('/api/weather', require('./routes/weatherRoutes'));

// Test Route
app.get('/', (req, res) => {
  res.send('Agrovision Backend is Running 🌱');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);