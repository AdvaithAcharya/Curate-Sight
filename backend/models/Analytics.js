const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  artworkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' },
  sessionId: { type: String, index: true },
  timestamp: { type: Date, default: Date.now, index: true },
  dwellTime: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  type: { type: String, default: 'view' },
}, { timestamps: true });

module.exports = mongoose.model('Analytics', AnalyticsSchema);
