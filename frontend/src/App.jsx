import { Routes, Route } from 'react-router-dom';
import Scanner from './pages/Scanner';
import ArtworkInfo from './pages/ArtworkInfo';
import Dashboard from './pages/Dashboard';
import Privacy from './pages/Privacy';
import Navbar from './components/Navbar';
import './index.css';

function App() {
  return (
    <div className="min-h-screen text-cream">
      {/* Futuristic dark grid + glow background */}
      <div className="background-glow" />
      <div className="background-grid" />

      <div className="app-content">
        <Navbar />
        <Routes>
          <Route path="/" element={<Scanner />} />
          <Route path="/artwork/:id" element={<ArtworkInfo />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </div>
    </div>
  );
}

export default App
