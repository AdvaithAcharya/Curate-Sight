const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');
const Artwork = require('../models/Artwork');

router.post('/', async (req, res) => {
  try {
    const { artworkId, sessionId, dwellTime = 0, clicks = 0, type = 'view' } = req.body;
    const doc = await Analytics.create({ artworkId, sessionId, dwellTime, clicks, type });
    res.json({ ok: true, id: doc._id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'log_failed' });
  }
});

router.get('/summary', async (_req, res) => {
  try {
    const mostViewed = await Analytics.aggregate([
      { $group: { _id: '$artworkId', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'artworks', localField: '_id', foreignField: '_id', as: 'art' } },
      { $unwind: '$art' },
      { $project: { _id: 0, title: '$art.title', views: 1 } },
    ]);

    const avgDwell = await Analytics.aggregate([
      { $group: { _id: '$artworkId', avgDwellTime: { $avg: '$dwellTime' } } },
      { $lookup: { from: 'artworks', localField: '_id', foreignField: '_id', as: 'art' } },
      { $unwind: '$art' },
      { $project: { _id: 0, title: '$art.title', avgDwellTime: { $round: ['$avgDwellTime', 1] } } },
      { $sort: { avgDwellTime: -1 } },
      { $limit: 10 },
    ]);

    const overTime = await Analytics.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, events: { $sum: 1 } } },
      { $project: { _id: 0, date: '$_id', events: 1 } },
      { $sort: { date: 1 } },
    ]);

    res.json({ mostViewed, avgDwell, overTime });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'summary_failed' });
  }
});

module.exports = router;
