const { pipeline } = require('@xenova/transformers');

let captionerPromise = null;

async function captionImage(dataUrl) {
  if (!captionerPromise) {
    captionerPromise = pipeline('image-to-text', 'Xenova/vit-gpt2-image-captioning');
  }
  const captioner = await captionerPromise;
  const out = await captioner(dataUrl, { max_new_tokens: 50 });
  const text = Array.isArray(out) && out[0]?.generated_text ? out[0].generated_text : '';
  return String(text).trim();
}

module.exports = { captionImage };
