const express = require('express');
const router = express.Router();
const Artwork = require('../models/Artwork');

router.get('/', async (_req, res) => {
  const items = await Artwork.find({}).sort({ createdAt: -1 });
  res.json(items);
});

router.get('/:id', async (req, res) => {
  const item = await Artwork.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'not_found' });
  res.json(item);
});

module.exports = router;
