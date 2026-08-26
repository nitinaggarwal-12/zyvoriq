const sharp = require('sharp');
const fs = require('fs');

async function createOralCavity() {
  console.log('🦷 Generating Anatomical Oral Cavity Layer for Priya...');
  const width = 256;
  const height = 256;
  const rawBuffer = Buffer.alloc(width * height * 4);

  const cx = width / 2;
  const cy = height / 2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const dx = (x - cx) / (width * 0.42);
      const dy = (y - cy) / (height * 0.35);
      const dist = dx * dx + dy * dy;

      if (dist <= 1.0) {
        // Inside mouth cavity
        const alpha = Math.round(255 * Math.pow(1.0 - dist, 0.4));
        
        // Upper Teeth region (y between cy - 35 and cy - 5)
        const inTeethY = (y >= cy - 35 && y <= cy - 5);
        const inTeethX = Math.abs(x - cx) < (width * 0.32);

        if (inTeethY && inTeethX) {
          // Ivory teeth with subtle shading
          const toothShade = Math.sin((x / 14) * Math.PI) * 15;
          rawBuffer[idx] = Math.min(255, 238 + toothShade);     // R
          rawBuffer[idx + 1] = Math.min(255, 235 + toothShade); // G
          rawBuffer[idx + 2] = Math.min(255, 225 + toothShade); // B
          rawBuffer[idx + 3] = alpha;
        } else if (y > cy + 5 && y < cy + 40 && Math.abs(x - cx) < (width * 0.28)) {
          // Tongue region (warm pinkish red)
          rawBuffer[idx] = 165;     // R
          rawBuffer[idx + 1] = 68;  // G
          rawBuffer[idx + 2] = 72;  // B
          rawBuffer[idx + 3] = alpha;
        } else {
          // Deep oral shadow
          rawBuffer[idx] = 22;     // R
          rawBuffer[idx + 1] = 10; // G
          rawBuffer[idx + 2] = 12; // B
          rawBuffer[idx + 3] = alpha;
        }
      } else {
        // Transparent outside
        rawBuffer[idx + 3] = 0;
      }
    }
  }

  const outPath = 'public/assets/avatars/priya_oral_cavity.png';
  await sharp(rawBuffer, { raw: { width, height, channels: 4 } }).png().toFile(outPath);
  console.log(`✅ Saved anatomical oral cavity: ${outPath}`);
}

createOralCavity().catch(console.error);
