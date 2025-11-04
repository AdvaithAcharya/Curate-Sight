const mongoose = require('mongoose');

const ArtworkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  year: { type: String },
  description: { type: String },
  imageUrl: { type: String },
  videoUrl: { type: String },
  audioUrl: { type: String },
  tags: [{ type: String }],
  // for hash-based matching
  imageHash: { type: String, default: '' },
  // incremented whenever a successful scan matches this artwork
  scanCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Artwork', ArtworkSchema);
