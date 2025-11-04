require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

const CLIENT_URL = process.env.CLIENT_URL || '*';
app.use(cors({ origin: CLIENT_URL === '*' ? true : CLIENT_URL }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

connectDB();

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/recognize', require('./routes/recognize'));
app.use('/api/artworks', require('./routes/artworks'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/enrich', require('./routes/enrich'));
app.use('/api/admin', require('./routes/admin'));

module.exports = app;