# CurateSight – AI Museum Scanner

A full-stack web app to scan paintings with your phone and instantly get rich contextual information (text, audio, video). Mobile-first PWA with real-time recognition.

## Tech Stack
- Frontend: React + Vite + TailwindCSS (PWA)
- Backend: Node.js + Express.js + MongoDB Atlas
- AI: Google Cloud Vision API (fallback: tags-based matcher)
- Analytics: Recharts dashboard
- Deploy: Render/Vercel/Railway

## Quick Start
1) Ensure Node 18+ and a MongoDB Atlas URI.
2) Copy envs:
   - backend/.env from backend/.env.example (set MONGODB_URI, optional GOOGLE_APPLICATION_CREDENTIALS)
   - frontend/.env from frontend/.env.example (VITE_API_URL, VITE_ADMIN_PASSWORD)
3) Install deps and seed sample data:
   - npm install
   - npm run seed
4) Run both servers:
   - npm run dev

Frontend: http://localhost:5173
Backend: http://localhost:5000

## Scripts
- npm run dev – run frontend and backend together
- npm run seed – seed sample artworks into MongoDB
- npm run build – build frontend
- npm start – start backend (production)

## License
MIT
