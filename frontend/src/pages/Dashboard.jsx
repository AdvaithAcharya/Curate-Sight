import { useState } from 'react';
import { api } from '../lib/api';
import AnimatedContent from '../components/AnimatedContent';

export default function Dashboard() {
  const [auth, setAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [artworks, setArtworks] = useState([]);
  const [form, setForm] = useState({ title:'', artist:'', year:'', description:'', imageUrl:'', videoUrl:'', audioUrl:'', tags:'' });

  const expected = import.meta.env.VITE_ADMIN_PASSWORD || 'admin';

  const load = async () => {
    if (password !== expected) return alert('Incorrect password');
    setAuth(true);
    const { data: arts } = await api.get('/admin/artworks', { headers: { 'x-admin-password': expected } });
    setArtworks(arts);
  };

  const saveArtwork = async (e) => {
    e.preventDefault();
    const payload = { ...form, tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean) };
    const { data } = await api.post('/admin/artworks', payload, { headers: { 'x-admin-password': expected } });
    setArtworks([data, ...artworks]);
    setForm({ title:'', artist:'', year:'', description:'', imageUrl:'', videoUrl:'', audioUrl:'', tags:'' });
  };

  const del = async (id) => {
    if (!confirm('Delete this artwork?')) return;
    await api.delete(`/admin/artworks/${id}`, { headers: { 'x-admin-password': expected } });
    setArtworks(artworks.filter(a => a._id !== id));
  };

  if (!auth) {
    return (
      <AnimatedContent distance={120}>
        <div className="min-h-screen p-6 max-w-lg mx-auto">
          <h1 className="text-3xl font-serif mb-4">Admin Panel</h1>
          <div className="glass p-4 rounded">
            <input className="border p-2 w-full mb-3 password-black" type="password" placeholder="Admin password" value={password} onChange={e=>setPassword(e.target.value)} />
            <button className="glass-btn" onClick={load}>Enter</button>
          </div>
        </div>
      </AnimatedContent>
    );
  }

  return (
    <AnimatedContent distance={150}>
      <div className="min-h-screen p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-serif">Admin Dashboard</h1>
          <button className="glass-btn" onClick={()=>{ setAuth(false); setPassword(''); }}>Logout</button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass p-4 rounded">
            <h2 className="font-semibold mb-2">Add Artwork</h2>
            <form className="grid md:grid-cols-2 gap-3" onSubmit={saveArtwork}>
              <input className="border p-2 bg-transparent" placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required />
              <input className="border p-2 bg-transparent" placeholder="Artist" value={form.artist} onChange={e=>setForm({...form,artist:e.target.value})} required />
              <input className="border p-2 bg-transparent" placeholder="Year" value={form.year} onChange={e=>setForm({...form,year:e.target.value})} />
              <input className="border p-2 bg-transparent md:col-span-2" placeholder="Image URL" value={form.imageUrl} onChange={e=>setForm({...form,imageUrl:e.target.value})} />
              <input className="border p-2 bg-transparent md:col-span-2" placeholder="Video URL" value={form.videoUrl} onChange={e=>setForm({...form,videoUrl:e.target.value})} />
              <input className="border p-2 bg-transparent md:col-span-2" placeholder="Audio URL" value={form.audioUrl} onChange={e=>setForm({...form,audioUrl:e.target.value})} />
              <textarea className="border p-2 bg-transparent md:col-span-2" placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
              <input className="border p-2 bg-transparent md:col-span-2" placeholder="Tags (comma separated)" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} />
              <div className="md:col-span-2 flex justify-end"><button className="glass-btn" type="submit">Save</button></div>
            </form>
          </div>

          <div className="glass p-4 rounded md:col-span-2">
            <h2 className="font-semibold mb-3">Your Artworks</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {artworks.map(a => (
                <div key={a._id} className="glass p-3 rounded">
                  <div className="flex items-center gap-3">
                    {a.imageUrl && (
                      <img
                        src={a.imageUrl}
                        alt={a.title}
                        className="w-20 h-20 object-cover rounded"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src='https://via.placeholder.com/80?text=No+Image'; }}
                      />
                    )}
                    <div>
                      <div className="font-semibold">{a.title}</div>
                      <div className="text-sm opacity-80">{a.artist}{a.year?` · ${a.year}`:''}</div>
                      <div className="text-xs opacity-70">Scans: {a.scanCount || 0}</div>
                    </div>
                  </div>
                  {a.description && <p className="mt-2 text-sm opacity-90 line-clamp-3">{a.description}</p>}
                  <div className="mt-3 flex gap-2">
                    <a className="glass-btn" href={a.imageUrl} target="_blank" rel="noreferrer">Open Image</a>
                    <button className="glass-btn" onClick={()=>del(a._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AnimatedContent>
  );
}
