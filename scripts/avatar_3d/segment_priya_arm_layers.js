const sharp = require('sharp');
const fs = require('fs');

async function segmentArmAndTorso() {
  console.log('✂️ Segmenting Priya into independent Torso and Arm/Hand kinematic layers...');
  const inputPath = 'public/assets/avatars/priya_cutout.png';
  const image = sharp(inputPath);
  const { width, height } = await image.metadata();

  const rawBuffer = await image.raw().toBuffer();
  const torsoBuffer = Buffer.from(rawBuffer);
  const armBuffer = Buffer.from(rawBuffer);

  // Arm/Hand bounding region in 1376x768:
  // Hand & arm is on the left side of the image (viewer's left / her right): x < 450, y > 300
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Arm isolation mask (x from 0 to 460, y from 320 to 768)
      const isArmArea = (x < 440 && y > 330);
      const isArmSeam = (x >= 400 && x < 440 && y > 330);

      if (isArmArea) {
        // In torso buffer, mask out the arm
        if (isArmSeam) {
          const fade = (x - 400) / 40.0;
          torsoBuffer[idx + 3] = Math.round(torsoBuffer[idx + 3] * fade);
        } else {
          torsoBuffer[idx + 3] = 0;
        }
      } else {
        // In arm buffer, mask out the torso
        armBuffer[idx + 3] = 0;
      }
    }
  }

  const outTorso = 'public/assets/avatars/priya_torso_cutout.png';
  const outArm = 'public/assets/avatars/priya_arm_cutout.png';

  await sharp(torsoBuffer, { raw: { width, height, channels: 4 } }).png().toFile(outTorso);
  await sharp(armBuffer, { raw: { width, height, channels: 4 } }).png().toFile(outArm);

  console.log(`✅ Saved independent Torso layer: ${outTorso}`);
  console.log(`✅ Saved independent Arm/Hand layer: ${outArm}`);
}

segmentArmAndTorso().catch(console.error);
