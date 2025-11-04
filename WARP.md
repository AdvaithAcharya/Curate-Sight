# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

- Install dependencies (root + apps)
  - npm install
  - npm --prefix backend install
  - npm --prefix frontend install
- Dev (runs frontend and backend together)
  - npm run dev
- Seed sample data (MongoDB)
  - npm run seed
- Build frontend (Vite)
  - npm run build
- Start backend (production)
  - npm start
- Lint (frontend only)
  - npm --prefix frontend run lint
- Useful URLs
  - Frontend: http://localhost:5173
  - Backend: http://localhost:5000
- Tests
  - No test runner is configured in this repo.

## High-level architecture

- Overview
  - Full-stack app with a React+Vite PWA (frontend/) and Node.js + Express + MongoDB backend (backend/).
  - Scanner captures an image from the device camera, sends it to the backend for recognition, then shows rich info (text, audio, video). Anonymous usage analytics are recorded.

- Backend (backend/)
  - Entry: server.js
    - Loads env, enables CORS for CLIENT_URL, parses JSON, connects to Mongo via config/db.js, mounts API routers.
  - Routes
    - /api/recognize (routes/recognize.js):
      - Tries Google Cloud Vision via @google-cloud/vision when GOOGLE_APPLICATION_CREDENTIALS is set; otherwise logs a warning and uses a tag-overlap fallback matcher against stored artworks.
    - /api/artworks (routes/artworks.js): list and fetch artworks from Mongo.
    - /api/analytics (routes/analytics.js): records events (view/click/etc.) and serves aggregated summaries for the dashboard.
  - Data models
    - models/Artwork.js: title, artist, year, description, image/video/audio URLs, tags.
    - models/Analytics.js: artworkId, sessionId, timestamp, dwellTime, clicks, type.
  - Utilities
    - config/db.js: connects to MongoDB using MONGODB_URI and optional MONGODB_DB.
    - scripts/seed.js: seeds sample artworks; reads backend/.env explicitly.

- Frontend (frontend/)
  - React + Vite app with TailwindCSS and PWA (vite-plugin-pwa).
  - Key pages
    - src/pages/Scanner.jsx: webcam capture; POST /api/recognize; optional analytics opt-out stored in localStorage.
    - src/pages/ArtworkInfo.jsx: displays artwork, labels, match confidence; logs dwell time via /api/analytics on unmount.
    - src/pages/Dashboard.jsx: password-gated client-side view; fetches /api/analytics/summary and renders Recharts.
  - API client
    - src/lib/api.js: axios instance using base from VITE_API_URL; stores a session ID in localStorage.
  - PWA config
    - vite.config.js: Workbox runtime caching for API calls and images; manifest and icons.
  - Styling
    - Tailwind theme colors (cream/charcoal/bronze) in tailwind.config.js; PostCSS in postcss.config.js.

- Data flow
  - Frontend captures image -> POST /api/recognize -> Backend Vision or fallback matcher -> returns { artwork, labels, confidence } -> Frontend renders info and may record analytics events.

## Environment variables (.env)

Create files from the provided examples and paste your values as follows.

- backend/.env (copy of backend/.env.example)
  - MONGODB_URI=…
  - MONGODB_DB=… (optional; database name)
  - PORT=5000 (default)
  - CLIENT_URL=http://localhost:5173 (origin allowed by CORS)
  - ADMIN_PASSWORD=… (for demo: compared by frontend dashboard; not server-enforced)
  - GOOGLE_APPLICATION_CREDENTIALS=… (optional; absolute path to a Google service account JSON key to enable Vision)

- frontend/.env (copy of frontend/.env.example)
  - VITE_API_URL=http://localhost:5000
  - VITE_ADMIN_PASSWORD=… (must match backend ADMIN_PASSWORD for the client-side dashboard gate)

Notes
- Seed script reads backend/.env; ensure MONGODB_URI (and optional MONGODB_DB) are set before running npm run seed.
- If GOOGLE_APPLICATION_CREDENTIALS is not provided, recognition falls back to tag-based matching.

## README highlights

- Quick Start
  - Ensure Node 18+ and MongoDB Atlas URI.
  - Copy envs (backend/.env, frontend/.env) and set variables.
  - npm install; npm run seed; npm run dev.
- Deploy targets mentioned: Render/Vercel/Railway.
