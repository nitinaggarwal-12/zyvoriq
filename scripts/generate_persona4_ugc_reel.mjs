import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT_DIR = path.join(process.cwd(), 'public', 'assets', 'video');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const UGC_REEL_CONFIG = {
  personaId: 'persona4_ugc_ecommerce',
  title: 'AuraGlow 50% Flash Sale UGC Hook',
  outName: 'persona4_ugc_ecommerce_reel',
  themeColor: '#f59e0b', // Amber / Gold
  subColor: '#fbbf24',
  badge: '🛍️ PERSONA #4: E-COMMERCE & DTC UGC ADS',
  bgType: 'ugc_product_glow',
  scenes: [
    {
      start: 0,
      end: 4,
      header: '🛑 STOP USING REGULAR CREAMS',
      title: 'If your skin flakes by 2 PM, you are making this mistake...',
      sub: 'AI Creator @emma.glows • Problem-Agitate Hook • 94% Retention'
    },
    {
      start: 4,
      end: 8,
      header: '✨ INSTANT 24H GLASS SKIN',
      title: 'Day 1 vs Day 14 Side-by-Side Texture Transformation',
      sub: '5% Pure Botanical Peptides • Zero Sticky Residue • 4.9/5.0 Stars'
    },
    {
      start: 8,
      end: 12,
      header: '🔥 50% OFF FLASH VOUCHER',
      title: 'Over 45,000 Shopify reviews • 30-Day Money Back Guarantee',
      sub: '👉 TAP LINK IN BIO / TIKTOK SHOP YELLOW CART NOW!'
    }
  ]
};

async function generateUgcReel() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log(`🚀 Launching Chrome for Persona #4 UGC Reel Generation...`);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--autoplay-policy=no-user-gesture-required']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 720, height: 1280 });

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin: 0; background: #0b0f19; overflow: hidden; display: flex; align-items: center; justify-content: center; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        canvas { width: 720px; height: 1280px; }
      </style>
    </head>
    <body>
      <canvas id="stage" width="720" height="1280"></canvas>
      <script>
        window.isDone = false;
        const canvas = document.getElementById('stage');
        const ctx = canvas.getContext('2d');
        const config = ${JSON.stringify(UGC_REEL_CONFIG)};

        // Audio synthesis setup
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const dest = audioCtx.createMediaStreamDestination();

        // Procedural upbeat commercial synth
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        osc.connect(gainNode);
        gainNode.connect(dest);
        gainNode.connect(audioCtx.destination);
        osc.start();

        const videoStream = canvas.captureStream(30);
        const combinedStream = new MediaStream([
          ...videoStream.getVideoTracks(),
          ...dest.stream.getAudioTracks()
        ]);

        const recorder = new MediaRecorder(combinedStream, {
          mimeType: 'video/webm;codecs=vp9,opus',
          videoBitsPerSecond: 5000000
        });

        const chunks = [];
        recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/mp4' });
          const reader = new FileReader();
          reader.onloadend = () => {
            window.videoBase64 = reader.result.split(',')[1];
            window.isDone = true;
          };
          reader.readAsDataURL(blob);
        };

        recorder.start();

        let startTime = performance.now();
        const TOTAL_DURATION = 12000; // 12 seconds

        function renderFrame(now) {
          const elapsed = (now - startTime) / 1000; // in seconds
          const progress = Math.min(elapsed / 12, 1);

          // 1. Background Gradient
          const bgGrad = ctx.createLinearGradient(0, 0, 720, 1280);
          bgGrad.addColorStop(0, '#0a0a0f');
          bgGrad.addColorStop(0.5, '#1e1408');
          bgGrad.addColorStop(1, '#08080c');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, 720, 1280);

          // 2. Animated Amber Glow Orbs & Particles
          for (let i = 0; i < 20; i++) {
            const px = (Math.sin(elapsed * 0.8 + i) * 0.5 + 0.5) * 720;
            const py = (Math.cos(elapsed * 0.5 + i * 1.5) * 0.5 + 0.5) * 1280;
            const radius = 10 + (Math.sin(elapsed + i) * 6);
            ctx.beginPath();
            ctx.arc(px, py, radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
            ctx.fill();
          }

          // 3. Current Scene Lookup
          const currentScene = config.scenes.find(s => elapsed >= s.start && elapsed < s.end) || config.scenes[config.scenes.length - 1];

          // 4. Top Header & Verification Badges
          ctx.save();
          // Header Bar
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.beginPath();
          ctx.roundRect(40, 50, 640, 90, 24);
          ctx.fill();
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Creator Avatar Circle
          ctx.beginPath();
          ctx.arc(95, 95, 28, 0, Math.PI * 2);
          ctx.fillStyle = '#f59e0b';
          ctx.fill();
          ctx.fillStyle = '#000';
          ctx.font = 'bold 24px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('E', 95, 103);

          // Creator Username
          ctx.textAlign = 'left';
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 22px sans-serif';
          ctx.fillText('@emma.glows', 140, 88);
          ctx.fillStyle = '#94a3b8';
          ctx.font = '16px sans-serif';
          ctx.fillText('Sponsored DTC Ad • Verified Buyer', 140, 114);

          // 50% Off Pill Badge
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.roundRect(520, 72, 130, 42, 21);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('50% OFF', 585, 99);
          ctx.restore();

          // 5. Star Rating Strip
          ctx.save();
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.beginPath();
          ctx.roundRect(40, 160, 320, 50, 25);
          ctx.fill();
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)';
          ctx.stroke();
          ctx.fillStyle = '#fbbf24';
          ctx.font = 'bold 20px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('★ ★ ★ ★ ★  4.9 / 5.0', 60, 192);
          ctx.restore();

          // 6. Central Product Showcase / Before & After Visualization
          ctx.save();
          if (elapsed >= 4 && elapsed < 8) {
            // Before vs After split screen
            ctx.fillStyle = '#2a1215';
            ctx.fillRect(40, 250, 315, 460);
            ctx.fillStyle = '#06281e';
            ctx.fillRect(365, 250, 315, 460);

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(360, 250);
            ctx.lineTo(360, 710);
            ctx.stroke();

            ctx.fillStyle = '#f87171';
            ctx.font = 'bold 26px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('DAY 1: REDNESS', 197, 480);

            ctx.fillStyle = '#34d399';
            ctx.font = 'bold 26px sans-serif';
            ctx.fillText('DAY 14: RADIANT', 522, 480);
          } else {
            // Glowing Product Bottle
            ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
            ctx.beginPath();
            ctx.roundRect(160, 250, 400, 460, 36);
            ctx.fill();
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.fillStyle = '#f59e0b';
            ctx.font = 'bold 120px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🛍️', 360, 480);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 32px sans-serif';
            ctx.fillText('AuraGlow Peptide Serum', 360, 560);
            ctx.fillStyle = '#fbbf24';
            ctx.font = '22px sans-serif';
            ctx.fillText('Pure 5% Botanical Peptide Complex', 360, 600);
          }
          ctx.restore();

          // 7. Kinetic Caption Overlay
          ctx.save();
          ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
          ctx.beginPath();
          ctx.roundRect(40, 750, 640, 260, 28);
          ctx.fill();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Header Callout
          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 24px monospace';
          ctx.textAlign = 'left';
          ctx.fillText(currentScene.header, 70, 800);

          // Main Punchy Subtitle
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 30px sans-serif';
          const words = currentScene.title.split(' ');
          let line1 = words.slice(0, 6).join(' ');
          let line2 = words.slice(6).join(' ');
          ctx.fillText(line1, 70, 850);
          if (line2) ctx.fillText(line2, 70, 895);

          // Sub note
          ctx.fillStyle = '#94a3b8';
          ctx.font = '18px sans-serif';
          ctx.fillText(currentScene.sub, 70, 960);
          ctx.restore();

          // 8. Bottom CTA Button
          ctx.save();
          const btnGrad = ctx.createLinearGradient(40, 1050, 680, 1160);
          btnGrad.addColorStop(0, '#f59e0b');
          btnGrad.addColorStop(1, '#ea580c');
          ctx.fillStyle = btnGrad;
          ctx.beginPath();
          ctx.roundRect(40, 1050, 640, 90, 28);
          ctx.fill();

          ctx.fillStyle = '#000000';
          ctx.font = 'black 28px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('👉 CLAIM 50% OFF FLASH DEAL NOW', 360, 1108);

          // Trust Guarantee Footer
          ctx.fillStyle = '#64748b';
          ctx.font = 'bold 16px monospace';
          ctx.fillText('🛡️ 30-DAY MONEY BACK GUARANTEE • FAST 2-DAY SHIPPING', 360, 1180);
          ctx.restore();

          // 9. Top Timeline Progress Bar
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.fillRect(40, 25, 640, 6);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(40, 25, 640 * progress, 6);

          if (elapsed < 12) {
            requestAnimationFrame(renderFrame);
          } else {
            recorder.stop();
            osc.stop();
          }
        }

        requestAnimationFrame(renderFrame);
      </script>
    </body>
    </html>
    `;

    await page.setContent(htmlContent);
    console.log(`⏳ Capturing and recording 12s high-res UGC MP4 video reel...`);
    await page.waitForFunction('window.isDone === true', { timeout: 45000 });

    const base64Data = await page.evaluate('window.videoBase64');
    const buffer = Buffer.from(base64Data, 'base64');
    const outPath = path.join(OUT_DIR, `${UGC_REEL_CONFIG.outName}.mp4`);
    fs.writeFileSync(outPath, buffer);

    console.log(`✅ Reel successfully saved to ${outPath} (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);
  } finally {
    await browser.close();
  }
}

generateUgcReel().catch(err => {
  console.error('❌ Failed to generate UGC reel:', err);
  process.exit(1);
});
