const fetch = require('node-fetch');
const FormData = require('form-data');

function dataUrlToBuffer(dataUrl) {
  const base64 = String(dataUrl).replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64, 'base64');
}

async function captionWithHF(dataUrl, token, model = 'Salesforce/blip-image-captioning-base') {
  if (!token) throw new Error('HF token missing');
  const bytes = dataUrlToBuffer(dataUrl);
  const m = /^data:(.*?);base64,/.exec(String(dataUrl));
  const contentType = m && m[1] ? m[1] : 'application/octet-stream';
  const url = `https://api-inference.huggingface.co/models/${encodeURIComponent(model)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': contentType,
    },
    body: bytes,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    console.warn(`HF request failed ${res.status}: ${txt.slice(0,200)}`);
    throw new Error(`HF ${res.status}`);
  }
  const j = await res.json();
  if (Array.isArray(j) && j[0] && j[0].generated_text) return String(j[0].generated_text).trim();
  if (j.generated_text) return String(j.generated_text).trim();
  if (Array.isArray(j) && j[0] && j[0].error) {
    console.warn(`HF error payload: ${j[0].error}`);
    throw new Error(j[0].error);
  }
  console.warn('HF response unrecognized shape');
  return '';
}
async function ocrWithOCRSpace(dataUrl, apiKey) {
  const key = apiKey || 'helloworld';
  const form = new FormData();
  form.append('base64Image', dataUrl);
  form.append('language', 'eng');
  const res = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    headers: {
      apikey: key,
      ...form.getHeaders(),
    },
    body: form,
  });
  if (!res.ok) throw new Error(`OCR.Space ${res.status}`);
  const j = await res.json();
  const parsed = j?.ParsedResults?.[0]?.ParsedText;
  return parsed ? String(parsed).trim() : '';
}

module.exports = { captionWithHF, ocrWithOCRSpace };
