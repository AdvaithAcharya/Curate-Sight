const fetch = require('node-fetch');

function dataUrlToBuffer(dataUrl) {
  const base64 = String(dataUrl).replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64, 'base64');
}

async function analyzeWithAzure(dataUrl, endpoint, key) {
  const url = `${endpoint.replace(/\/$/, '')}/vision/v3.2/analyze?visualFeatures=Description,Tags,Objects`;
  const bytes = dataUrlToBuffer(dataUrl);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'Content-Type': 'application/octet-stream',
      'Accept': 'application/json'
    },
    body: bytes,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Azure ${res.status}: ${txt.slice(0,200)}`);
  }
  const j = await res.json();
  const caption = j?.description?.captions?.[0]?.text || '';
  const tags = (j?.tags || []).map(t => t.name).filter(Boolean);
  return { caption, tags, raw: j };
}

module.exports = { analyzeWithAzure };