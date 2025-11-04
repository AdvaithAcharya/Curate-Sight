export default function Navbar() {
  return (
    <nav className="w-full sticky top-0 z-20 glass-nav text-cream">
      <div className="max-w-5xl mx-auto flex items-center justify-between p-3">
        <a href="/" className="font-serif text-xl hover:text-bronze transition-colors">CurateSight</a>
        <div className="flex gap-2 text-sm">
          <a href="/" className="glass-btn px-3 py-1">Scanner</a>
          <a href="/dashboard" className="glass-btn px-3 py-1">Dashboard</a>
          <a href="/privacy" className="glass-btn px-3 py-1">Privacy</a>
        </div>
      </div>
    </nav>
  );
}
