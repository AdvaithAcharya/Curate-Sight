const Jimp = require('jimp');

async function aHashFromBuffer(buffer, size = 8) {
  const img = await Jimp.read(buffer);
  img.resize(size, size).grayscale();
  const pixels = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const { r } = Jimp.intToRGBA(img.getPixelColor(x, y));
      pixels.push(r);
    }
  }
  const avg = pixels.reduce((s, v) => s + v, 0) / pixels.length;
  let bits = '';
  for (const p of pixels) bits += p >= avg ? '1' : '0';
  // pack 64 bits into hex (two 32-bit chunks)
  const hi = parseInt(bits.slice(0, 32), 2).toString(16).padStart(8, '0');
  const lo = parseInt(bits.slice(32), 2).toString(16).padStart(8, '0');
  return hi + lo;
}

function hamming(a, b) {
  if (!a || !b || a.length !== b.length) return Number.MAX_SAFE_INTEGER;
  // compare as hex strings
  let count = 0;
  for (let i = 0; i < a.length; i++) {
    const x = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    // count bits in nibble
    count += [0,1,1,2,1,2,2,3,1,2,2,3,2,3,3,4][x & 0xf];
  }
  return count;
}

module.exports = { aHashFromBuffer, hamming };
