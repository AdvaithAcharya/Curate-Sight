import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function Related() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const sourceTags = useMemo(() => (state?.tags || []).map(t => String(t).toLowerCase()), [state]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/artworks');
        const list = (data || []).filter(a =>
          (a.tags || []).some(t => sourceTags.includes(String(t).toLowerCase()))
        );
        setItems(list);
      } catch {}
      setLoading(false);
    };
    load();
  }, [sourceTags]);

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="min-h-screen p-4 max-w-3xl mx-auto">
      <button className="text-sm underline" onClick={() => navigate(-1)}>← Back</button>
      <h1 className="text-2xl font-serif mt-2">Related Works</h1>
      {items.length === 0 && <p className="mt-4">No related artworks found.</p>}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {items.map(a => (
          <div key={a._id} className="p-3 bg-white rounded shadow cursor-pointer" onClick={() => navigate(`/artwork/${a._id}`)}>
            <img src={a.imageUrl} alt={a.title} className="w-full h-40 object-cover rounded" />
            <div className="mt-2">
              <p className="font-semibold">{a.title}</p>
              <p className="text-sm opacity-80">{a.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
