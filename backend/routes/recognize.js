const express = require('express');
const router = express.Router();
const Artwork = require('../models/Artwork');
const { analyzeWithGemini } = require('../utils/gemini');
const { aHashFromBuffer, hamming } = require('../utils/imageHash');

function tokenize(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function scoreByTokens(art, text) {
  const a = new Set(tokenize([art.title, art.artist, ...(art.tags || [])].join(' ')));
  const b = new Set(tokenize(text));
  if (!a.size || !b.size) return 0;
  let overlap = 0;
  for (const t of b) if (a.has(t)) overlap++;
  return overlap / Math.max(a.size, 1);
}

function norm(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
}

function escapeRegex(s){
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

router.post('/', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'image required' });

    // First attempt DB image hash matching
    let matched = null;
    try {
      const base64 = String(image).replace(/^data:image\/\w+;base64,/, '');
      const buf = Buffer.from(base64, 'base64');
      const hash = await aHashFromBuffer(buf);
      const candidates = await Artwork.find({ imageHash: { $ne: '' } }).lean();
      let best = null; let bestDist = Infinity;
      for (const a of candidates) {
        const d = hamming(hash, a.imageHash);
        if (d < bestDist) { bestDist = d; best = a; }
      }
      if (best && bestDist <= 10) matched = best;
      if (matched) await Artwork.findByIdAndUpdate(matched._id, { $inc: { scanCount: 1 } }).catch(()=>{});
    } catch {}

    if (matched) {
      return res.json({ artwork: matched, info: null, labels: [], bestGuess: null, confidence: 1 });
    }

    // Fallback to external API recognition
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(404).json({ error: 'no_match' });

    const gem = await analyzeWithGemini(image, apiKey).catch(() => null);
    if (!gem) return res.status(404).json({ error: 'no_match' });

    const info = {
      title: gem.title || '',
      artist: gem.artist || '',
      year: gem.year || '',
      caption: (gem.caption || ''),
      tags: gem.tags || [],
    };
    const labels = (gem.tags || []).map(t => ({ description: t }));

    return res.json({ artwork: null, info, labels, bestGuess: gem.caption || null, confidence: 0.5 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'recognition_failed' });
  }
});

module.exports = router;
