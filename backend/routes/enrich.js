const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

async function wikiSummary(title) {
  if (!title) return null;
  const t = encodeURIComponent(title);
  // Try direct summary
  let res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${t}`);
  if (res.ok) {
    const j = await res.json();
    if (!j.type || j.type !== 'disambiguation') return { title: j.title, extract: j.extract, url: j.content_urls?.desktop?.page, thumbnail: j.thumbnail?.source };
  }
  // Fallback: search API
  res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${t}&format=json&origin=*`);
  if (!res.ok) return null;
  const s = await res.json();
  const first = s?.query?.search?.[0]?.title;
  if (!first) return null;
  const res2 = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(first)}`);
  if (!res2.ok) return null;
  const j2 = await res2.json();
  return { title: j2.title, extract: j2.extract, url: j2.content_urls?.desktop?.page, thumbnail: j2.thumbnail?.source };
}

router.get('/', async (req, res) => {
  try {
    const { title } = req.query;
    const data = await wikiSummary(title);
    if (!data) return res.status(404).json({ error: 'not_found' });
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'enrich_failed' });
  }
});

module.exports = router;
