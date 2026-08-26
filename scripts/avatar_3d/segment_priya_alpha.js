const fs = require('fs');
const sharp = require('sharp');

// Generate transparent alpha cutout of Priya Sharma from the base stage image
async function createAlphaCutout() {
  console.log('✂️ Creating transparent alpha cutout for Priya Sharma...');
  const inputPath = 'public/assets/avatars/priya.jpg';
  const outPath = 'public/assets/avatars/priya_cutout.png';

  const image = sharp(inputPath);
  const { width, height } = await image.metadata();
  console.log(`Input Image Size: ${width}x${height}`);

  const rawBuffer = await image.raw().ensureAlpha().toBuffer();

  // Create a clean soft feathered vignette / contour mask around Priya
  // Center is at x = width * 0.49, y = height * 0.55
  const centerX = width * 0.49;
  const centerY = height * 0.55;
  const radiusX = width * 0.32;
  const radiusY = height * 0.46;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const dx = (x - centerX) / radiusX;
      const dy = (y - centerY) / radiusY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let alpha = 255;
      if (dist > 0.85) {
        const fade = (dist - 0.85) / 0.25;
        alpha = Math.max(0, Math.min(255, Math.round(255 * (1.0 - fade))));
      }
      
      // Bottom fade
      if (y > height * 0.88) {
        const bottomFade = (y - height * 0.88) / (height * 0.12);
        alpha = Math.min(alpha, Math.round(255 * (1.0 - bottomFade)));
      }

      rawBuffer[idx + 3] = alpha;
    }
  }

  await sharp(rawBuffer, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(outPath);

  console.log(`✅ Saved transparent cutout: ${outPath} (${(fs.statSync(outPath).size / 1024 / 1024).toFixed(2)} MB)`);
}

createAlphaCutout().catch(console.error);
