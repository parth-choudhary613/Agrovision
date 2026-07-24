# 🌱 Agrovision

Agrovision is an AI-powered agricultural web app that helps farmers detect crop diseases from a photo and get an instant, actionable treatment plan — the right pesticide, dosage, application method, and spray schedule. It also layers in a weather-based spray advisory so farmers know *when* it's actually safe and effective to spray.

Built as a MERN-stack app (MongoDB, Express, React, Node.js) with a Kindwise AI plant-health API for disease detection and OpenWeather for weather data.

---

## ✨ Features

- **AI Disease Detection** — Upload or drag-and-drop a photo of a crop leaf and get the crop name, detected disease, and confidence score, powered by the Kindwise plant-health API.
- **Treatment Recommendations** — For each detected disease, the app returns the recommended pesticide, dosage, spray interval, how-to-use instructions, biological treatment options, and prevention tips, backed by a curated database of 60+ crop diseases.
- **Spray Scheduler** — Schedule spray dates for a scan and track each spray as pending or done from a calendar-style modal.
- **Weather-Based Spray Advisory** — Enter or auto-detect your location to get a live spray score, recommendation, reasoning, and the best spray window based on current and forecasted weather.
- **Dashboard Metrics** — At-a-glance stats: crops scanned, diseases found, upcoming sprays, and treatments completed.
- **History & Reports** — Look back at past scans and treatments.
- **Authentication** — Sign in with Google (via Firebase/Google OAuth) or with just a phone number + username.
- **Knowledge Base & Profile** pages for reference info and account management.

---

## 🛠 Tech Stack

**Frontend**
- React 19 + Vite
- React Router 7
- Tailwind CSS 4
- Firebase Auth (Google sign-in)
- Framer Motion, Lottie animations, Lucide icons
- Axios

**Backend**
- Node.js + Express 5
- MongoDB with Mongoose
- JWT-based authentication
- Google Auth Library (verifying Google ID tokens)
- Multer (in-memory image uploads)
- Kindwise API (plant disease detection)
- OpenWeather API (weather data for spray advisory)

---

## 📁 Project Structure

```
Agrovision-main/
├── backend/
│   ├── config/          # MongoDB connection
│   ├── controllers/      # Route logic (weather controller)
│   ├── middleware/        # JWT auth middleware
│   ├── models/            # Mongoose schemas: User, Scan, Treatment
│   ├── routes/             # Express routers: auth, scan, treatment, weather
│   ├── services/            # Weather service (OpenWeather integration)
│   ├── utils/                # Kindwise API wrapper + disease/pesticide DB, spray advisor logic
│   └── server.js               # App entry point
│
└── frontend/
    └── src/
        ├── assets/            # Images, Lottie JSON animations
        ├── components/        # Navbar, Sidebar, modals, dashboard/weather widgets
        ├── firebase/           # Firebase config for Google auth
        ├── pages/               # Signup, Dashboard, Scan, Weather, History, Profile, etc.
        └── services/             # Weather API client
```

---

## ✅ Prerequisites

Before you start, make sure you have:

- [Node.js](https://nodejs.org/) v18 or later, and npm
- A [MongoDB](https://www.mongodb.com/) database (local instance or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)
- A [Kindwise](https://www.kindwise.com/) API key (for the crop.health / disease-ID API)
- An [OpenWeather](https://openweathermap.org/api) API key
- A [Firebase](https://firebase.google.com/) project with Google Authentication enabled (for Google sign-in), and/or a Google OAuth Client ID

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/Agrovision.git
cd Agrovision
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` with the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
KINDWISE_API_KEY=your_kindwise_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
```

Start the backend server:

```bash
# development (auto-restarts with nodemon)
npm run dev

# or production
npm start
```

The API will run at `http://localhost:5000` and you should see:

```
✅ MongoDB Connected
🚀 Server running on port 5000
```

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/` with:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

> **Note:** The Firebase config in `src/firebase/firebase.js` is currently hard-coded in the source file. If you deploy your own instance, replace those values with your own Firebase project's config (or refactor it to read from `.env` variables).

Start the frontend dev server:

```bash
npm run dev
```

Vite will print a local URL (typically `http://localhost:5173`) — open it in your browser.

### 4. Use the app

1. Sign up / log in with Google or your phone number.
2. Go to **Disease Detection**, upload or drag-and-drop a photo of a crop leaf.
3. View the detected disease, confidence score, and recommended treatment.
4. Schedule sprays from the **Spray Scheduler** page.
5. Check the **Weather Advisory** page for the current spray score and best spray window for your location.
6. Track your stats from the **Dashboard** and review past activity in **History & Reports**.

---

## 🔌 API Overview

All routes are mounted under `/api` on the backend (`http://localhost:5000`).

| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| POST | `/api/auth/google` | No | Sign up / log in with a Google ID token |
| POST | `/api/auth/phone` | No | Sign up / log in with username + phone |
| GET | `/api/auth/me` | Yes | Get the currently logged-in user |
| POST | `/api/scan` | Yes | Upload a crop image and get an AI disease diagnosis |
| GET | `/api/scan/stats` | Yes | Get dashboard stats (crops scanned, diseases found, etc.) |
| POST | `/api/treatment` | Yes | Schedule spray dates for a scan |
| GET | `/api/treatment/upcoming` | Yes | Get upcoming pending sprays |
| PATCH | `/api/treatment/:treatmentId/spray/:sprayId` | Yes | Mark a spray as done |
| GET | `/api/weather/current` | No | Get raw current/hourly/daily weather for a `lat`/`lon` |
| GET | `/api/weather/advisory` | No | Get the full spray advisory (score, recommendation, best window) for a `lat`/`lon` |

Authenticated routes expect a `Authorization: Bearer <token>` header, using the JWT returned from the auth endpoints.

---

## 📦 Building for Production

```bash
cd frontend
npm run build
```

This outputs a production-ready build to `frontend/dist/`, which can be served by any static host (Vercel, Netlify, etc.). Deploy the `backend/` folder separately (e.g. Render, Railway, or a VPS) and point `VITE_API_BASE_URL` in the frontend to your deployed backend URL.

---

## 🤝 Contributing

Issues and pull requests are welcome. If you're adding a feature, please open an issue first to discuss what you'd like to change.

## 📄 License

ISC
