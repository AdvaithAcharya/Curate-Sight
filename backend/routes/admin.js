const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const Artwork = require('../models/Artwork');
const { aHashFromBuffer } = require('../utils/imageHash');

function requireAdmin(req, res, next) {
  const pass = req.headers['x-admin-password'];
  if (!pass || pass !== (process.env.ADMIN_PASSWORD || 'admin')) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

router.get('/artworks', requireAdmin, async (_req, res) => {
  const items = await Artwork.find({}).sort({ createdAt: -1 }).lean();
  res.json(items);
});

router.post('/artworks', requireAdmin, async (req, res) => {
  try {
    const { title, artist, year, description, imageUrl, videoUrl, audioUrl, tags = [] } = req.body;
    let imageHash = '';
    if (imageUrl) {
      try {
        const resp = await fetch(imageUrl);
        const buf = await resp.buffer();
        imageHash = await aHashFromBuffer(buf);
      } catch {}
    }
    const doc = await Artwork.create({ title, artist, year, description, imageUrl, videoUrl, audioUrl, tags, imageHash });
    res.json(doc);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'create_failed' });
  }
});

router.put('/artworks/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body || {};
    if (update.imageUrl) {
      try {
        const resp = await fetch(update.imageUrl);
        const buf = await resp.buffer();
        update.imageHash = await aHashFromBuffer(buf);
      } catch {}
    }
    const doc = await Artwork.findByIdAndUpdate(id, update, { new: true });
    res.json(doc);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'update_failed' });
  }
});

router.delete('/artworks/:id', requireAdmin, async (req, res) => {
  try {
    await Artwork.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'delete_failed' });
  }
});

module.exports = router;
