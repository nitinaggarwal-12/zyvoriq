const fs = require('fs');
const path = require('path');

console.log('🏛️ Calibrating 3D Humanoid Mesh UVs and Framing for Priya...');

function buildConformalHumanoidMesh() {
  const gridX = 48;
  const gridY = 48;
  const width = 2.4;
  const height = 1.35;

  const vertices = [];
  const normals = [];
  const uvs = [];
  const skinIndices = [];
  const skinWeights = [];
  const indices = [];

  const morphJawOpen = [];
  const morphMouthPucker = [];
  const morphMouthFunnel = [];
  const morphMouthSmile = [];
  const morphEyeBlink = [];
  const morphBrowUp = [];

  for (let y = 0; y <= gridY; y++) {
    const v = y / gridY;
    const posY = (v - 0.5) * height + 0.68; // Centered naturally on stage

    for (let x = 0; x <= gridX; x++) {
      const u = x / gridX;
      const posX = (u - 0.5) * width;
      // Gentle natural 3D depth curvature
      const posZ = Math.sin(u * Math.PI) * 0.06;

      vertices.push(posX, posY, posZ);
      normals.push(0, 0, 1);
      uvs.push(u, v); // Correct upright UV orientation

      // Head & Facial region anchor in 16:9 stage photo
      const mouthDistX = Math.abs(u - 0.492) / 0.04;
      const mouthDistY = Math.abs(v - 0.38) / 0.04;
      const isMouth = (mouthDistX < 1.0 && mouthDistY < 1.0);

      const eyeDistX = Math.abs(u - 0.492) / 0.05;
      const eyeDistY = Math.abs(v - 0.46) / 0.03;
      const isEyes = (eyeDistX < 1.0 && eyeDistY < 1.0);

      if (isMouth) {
        const mouthFactor = (1.0 - mouthDistX) * (1.0 - mouthDistY);
        morphJawOpen.push(0, -0.045 * mouthFactor, 0.02 * mouthFactor);
        morphMouthPucker.push(-(u - 0.492) * 0.3 * mouthFactor, 0.01 * mouthFactor, 0.03 * mouthFactor);
        morphMouthFunnel.push(0, -0.025 * mouthFactor, 0.02 * mouthFactor);
        morphMouthSmile.push(Math.sign(u - 0.492) * 0.015 * mouthFactor, 0.02 * mouthFactor, -0.005);
      } else {
        morphJawOpen.push(0, 0, 0);
        morphMouthPucker.push(0, 0, 0);
        morphMouthFunnel.push(0, 0, 0);
        morphMouthSmile.push(0, 0, 0);
      }

      if (isEyes) {
        const eyeFactor = (1.0 - eyeDistX) * (1.0 - eyeDistY);
        morphEyeBlink.push(0, -0.018 * eyeFactor, -0.005 * eyeFactor);
        morphBrowUp.push(0, 0.022 * eyeFactor, 0.005 * eyeFactor);
      } else {
        morphEyeBlink.push(0, 0, 0);
        morphBrowUp.push(0, 0, 0);
      }

      skinIndices.push(0, 0, 0, 0);
      skinWeights.push(1.0, 0, 0, 0);
    }
  }

  for (let y = 0; y < gridY; y++) {
    for (let x = 0; x < gridX; x++) {
      const a = y * (gridX + 1) + x;
      const b = (y + 1) * (gridX + 1) + x;
      const c = (y + 1) * (gridX + 1) + (x + 1);
      const d = y * (gridX + 1) + (x + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  return {
    vertices: Array.from(vertices),
    normals: Array.from(normals),
    uvs: Array.from(uvs),
    skinIndices: Array.from(skinIndices),
    skinWeights: Array.from(skinWeights),
    indices: Array.from(indices),
    morphTargets: {
      jawOpen: Array.from(morphJawOpen),
      mouthPucker: Array.from(morphMouthPucker),
      mouthFunnel: Array.from(morphMouthFunnel),
      mouthSmile: Array.from(morphMouthSmile),
      eyeBlink: Array.from(morphEyeBlink),
      browUp: Array.from(morphBrowUp)
    }
  };
}

const geo = buildConformalHumanoidMesh();
const outPath = path.join(__dirname, '../../public/assets/models/priya_humanoid_geometry.json');
fs.writeFileSync(outPath, JSON.stringify(geo));
console.log(`✅ Successfully generated Upright Conformal 3D Mesh for Priya: ${outPath}`);
