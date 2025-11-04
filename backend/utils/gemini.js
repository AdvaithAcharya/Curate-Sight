const fetch = require('node-fetch');

function dataUrlToInline(dataUrl) {
  const m = /^data:(.*?);base64,(.*)$/.exec(String(dataUrl));
  if (!m) throw new Error('invalid_data_url');
  return { mimeType: m[1] || 'image/jpeg', data: m[2] };
}

async function analyzeWithGemini(dataUrl, apiKey) {
  const inline = dataUrlToInline(dataUrl);
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
  const prompt = `You are an art recognition assistant. Identify the artwork in the image and return strict JSON with keys: title (string), artist (string), year (string), tags (array of strings), caption (string). If unknown, leave fields empty and tags []. Return only JSON.`;
  const body = {
    contents: [
      {
        role: 'user',
        parts: [ { text: prompt }, { inlineData: inline } ]
      }
    ]
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const txt = await res.text().catch(()=> '');
    throw new Error(`Gemini ${res.status}: ${txt.slice(0,200)}`);
  }
  const j = await res.json();
  const text = j?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  let parsed = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    const m = /\{[\s\S]*\}/.exec(text);
    if (m) parsed = JSON.parse(m[0]);
  }
  if (!parsed) return null;
  const caption = String(parsed.caption || '').trim();
  const tags = Array.isArray(parsed.tags) ? parsed.tags.map(String) : [];
  const title = parsed.title || '';
  const artist = parsed.artist || '';
  const year = parsed.year || '';
  return { caption, tags, title, artist, year, raw: parsed };
}

module.exports = { analyzeWithGemini };