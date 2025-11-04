const Jimp = require('jimp');

async function computeFingerprintFromBuffer(buffer, size = 16) {
  const img = await Jimp.read(buffer);
  img.resize(size, size).grayscale();
  const data = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x);
      const rgba = Jimp.intToRGBA(img.getPixelColor(x, y));
      const gray = (0.299 * rgba.r + 0.587 * rgba.g + 0.114 * rgba.b) / 255;
      data[idx] = gray;
    }
  }
  // normalize to unit vector
  const norm = Math.sqrt(data.reduce((s, v) => s + v * v, 0)) || 1;
  return data.map(v => Number((v / norm).toFixed(6)));
}

function cosineSim(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return Math.max(0, Math.min(1, dot));
}

module.exports = { computeFingerprintFromBuffer, cosineSim };
