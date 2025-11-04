import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api, getSessionId } from '../lib/api';
import AnimatedContent from '../components/AnimatedContent';

export default function ArtworkInfo() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState(location.state?.artwork || null);
  const [labels, setLabels] = useState(location.state?.labels || []);
  const [confidence, setConfidence] = useState(location.state?.confidence || null);
  const [loading, setLoading] = useState(!artwork);
  const [wiki, setWiki] = useState(null);
  const bestGuess = location.state?.bestGuess || null;
  const info = location.state?.info || null;

  useEffect(() => {
    let dwellStart = Date.now();
    return () => {
      const optOut = localStorage.getItem('curatesight_optout') === 'true';
      if (!artwork || optOut) return;
      const dwellTime = Math.round((Date.now() - dwellStart) / 1000);
      api.post('/analytics', {
        type: 'view',
        artworkId: artwork._id,
        sessionId: getSessionId(),
        dwellTime,
      }).catch(() => {});
    };
  }, [artwork]);

  useEffect(() => {
    const run = async () => {
      if (artwork) { setLoading(false); return; }
      if (id && id !== 'unknown') {
        try {
          const { data } = await api.get(`/artworks/${id}`);
          setArtwork(data);
        } catch {}
        setLoading(false);
      } else {
        // Unknown ID: show enrichment/bestGuess without blocking on loading
        setLoading(false);
      }
    };
    run();
  }, [id, artwork]);

  useEffect(() => {
    const title = artwork?.title || info?.title || bestGuess;
    if (!title) return;
    (async () => {
      try {
        const { data } = await api.get(`/enrich`, { params: { title } });
        setWiki(data);
      } catch {}
    })();
  }, [artwork?.title, bestGuess]);

  const speak = () => {
    const text = `${artwork?.title || wiki?.title || ''} ${artwork?.artist ? `by ${artwork.artist}.` : ''} ${(artwork?.description || wiki?.extract || '')}`.trim();
    if (!text) return;
    const utter = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utter);
  };

  const tabs = useMemo(() => ['Details', 'Video', 'Audio', 'Related'], []);
  const [tab, setTab] = useState('Details');

  if (loading) return <div className="p-6">Loading…</div>;
  if (!artwork && !wiki && !bestGuess) return <div className="p-6">No artwork found.</div>;

  return (
    <AnimatedContent distance={150} direction="vertical" ease="power3.out" initialOpacity={0} animateOpacity threshold={0.2}>
      <div className="min-h-screen p-4 max-w-3xl mx-auto">
      <button className="text-sm underline" onClick={() => navigate('/')}>← Back to Scanner</button>
      <h1 className="text-3xl font-serif mt-2">{artwork?.title || wiki?.title || info?.title || bestGuess}</h1>
      <p className="opacity-80">{(artwork?.artist || info?.artist) || ''}{(artwork?.year || info?.year) ? ` · ${(artwork?.year || info?.year)}` : ''}</p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {(artwork?.imageUrl || wiki?.thumbnail) && (
          <img src={artwork?.imageUrl || wiki?.thumbnail} alt={(artwork?.title || wiki?.title || info?.title || 'Artwork')} className="w-full rounded" />
        )}
        <div className="space-y-3">
          <div className="glass p-4 rounded">
            <p>{artwork?.description || wiki?.extract || info?.caption || bestGuess}</p>
            {wiki?.url && (
              <p className="text-sm mt-2"><a className="underline" href={wiki.url} target="_blank" rel="noreferrer">Read more on Wikipedia</a></p>
            )}
          </div>
          <div className="glass p-4 rounded">
            <p className="font-semibold mb-1">Explainable AI</p>
            {labels && labels.length > 0 ? (
              <ul className="text-sm list-disc ml-5">{labels.slice(0,5).map((l,i)=>(<li key={i}>{l.description}</li>))}</ul>
            ) : info?.tags?.length ? (
              <ul className="text-sm list-disc ml-5">{info.tags.slice(0,5).map((t,i)=>(<li key={i}>{t}</li>))}</ul>
            ) : null}
            {confidence != null && (
              <p className="text-sm mt-2">Match confidence: {(confidence * 100).toFixed(1)}%</p>
            )}
          </div>
          <div className="flex gap-2">
            <button className="glass-btn" onClick={speak}>Narrate</button>
            <button className="glass-btn" onClick={() => navigate('/artwork/related', { state: { tags: (artwork?.tags || info?.tags || []) } })}>Related</button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex gap-4 border-b">
          {tabs.map(t => (
            <button key={t} className={`pb-2 ${tab===t? 'border-b-2 border-bronze':''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
        {tab === 'Video' && (artwork?.videoUrl || (artwork?.title || wiki?.title)) && (
          <div className="aspect-video mt-4">
            {artwork?.videoUrl ? (
              <iframe className="w-full h-full" src={artwork.videoUrl} title="Video" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            ) : (
              <iframe className="w-full h-full" src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent((artwork?.title||wiki?.title)+' '+(artwork?.artist||''))}`} title="Video" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            )}
          </div>
        )}
        {tab === 'Audio' && (
          artwork?.audioUrl ? (
            <audio className="mt-4" controls src={artwork.audioUrl}></audio>
          ) : (
            <div className="mt-4 text-sm">Use "Narrate" to hear a generated narration.</div>
          )
        )}
        {tab === 'Details' && (
          <div className="mt-4 space-x-2">
            {(artwork?.tags || info?.tags || []).map(t => (
              <span key={t} className="inline-block text-sm bg-charcoal text-white rounded-full px-3 py-1 mr-2 mb-2">{t}</span>
            ))}
          </div>
        )}
      </div>

      <button className="mt-8 glass-btn" onClick={() => navigate('/')}>Next Artwork</button>
      </div>
    </AnimatedContent>
  );
}
