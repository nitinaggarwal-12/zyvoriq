import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT_DIR = path.join(process.cwd(), 'public', 'assets', 'video');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const CINEMA_REEL_CONFIG = {
  personaId: 'persona5_mature_drama',
  title: 'The Silent Verdict - A24 Neo-Noir Drama',
  outName: 'persona5_arthouse_cinema_reel',
  themeColor: '#6366f1',
  subColor: '#a5b4fc',
  badge: '🎬 PERSONA #5: MATURE DRAMA & ARTHOUSE CINEMA',
  scenes: [
    {
      start: 0,
      end: 4,
      header: '🌧️ ACT I: THE MIDNIGHT CONFESSION',
      title: '"In a city built on silence, the loudest scream is a signed NDA..."',
      sub: '35mm Kodak 5219 Grain • Low-Key Chiaroscuro • Detective Elena & Marcus Vance'
    },
    {
      start: 4,
      end: 8,
      header: '🎭 ACT II: THE INTERROGATION DUEL',
      title: '"You can erase the cryptographic ledger, but not the conscience that wrote it."',
      sub: 'Slow-Burn 24fps Push-In • Neo-Classical Cello Solo • 2-Host Investigative Debate'
    },
    {
      start: 8,
      end: 12,
      header: '⚖️ ACT III: THE ARCHIVAL BREAKTHROUGH',
      title: 'Full 4K Neural Master • Veritas C2PA Cryptographic Provenance Verified',
      sub: 'DeepMind Veo 2 Cinema Engine • Zero AI Artifacts • Available in Studio'
    }
  ]
};

async function generateCinemaReel() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log(`🚀 Launching Chrome for Persona #5 Cinema & Mature Drama Reel Generation...`);
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
      <meta charset="utf-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          width: 720px;
          height: 1280px;
          background: #05070c;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #ffffff;
          overflow: hidden;
          position: relative;
        }
        canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 720px;
          height: 1280px;
        }
      </style>
    </head>
    <body>
      <canvas id="cinemaCanvas" width="720" height="1280"></canvas>
      <script>
        const canvas = document.getElementById('cinemaCanvas');
        const ctx = canvas.getContext('2d');
        const totalDurationSec = 12;
        const fps = 30;
        const totalFrames = totalDurationSec * fps;
        let currentFrame = 0;

        // Film grain generator
        function drawFilmGrain(ctx, width, height, opacity = 0.08) {
          const imgData = ctx.getImageData(0, 0, width, height);
          const data = imgData.data;
          for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 50;
            data[i] = Math.min(255, Math.max(0, data[i] + noise));
            data[i+1] = Math.min(255, Math.max(0, data[i+1] + noise));
            data[i+2] = Math.min(255, Math.max(0, data[i+2] + noise));
          }
          ctx.putImageData(imgData, 0, 0);
        }

        // Anamorphic lens flare
        function drawAnamorphicFlare(ctx, x, y, width, progress) {
          const grad = ctx.createLinearGradient(x - width/2, y, x + width/2, y);
          grad.addColorStop(0, 'rgba(99, 102, 241, 0)');
          grad.addColorStop(0.3, 'rgba(129, 140, 248, 0.4)');
          grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
          grad.addColorStop(0.7, 'rgba(129, 140, 248, 0.4)');
          grad.addColorStop(1, 'rgba(99, 102, 241, 0)');
          
          ctx.save();
          ctx.fillStyle = grad;
          ctx.fillRect(x - width/2, y - 2, width, 4);
          ctx.restore();
        }

        function renderFrame(timeSec) {
          // Background - Deep Moody Noir Gradient
          const bgGrad = ctx.createRadialGradient(360, 640, 50, 360, 640, 700);
          bgGrad.addColorStop(0, '#0c1022');
          bgGrad.addColorStop(0.5, '#080a14');
          bgGrad.addColorStop(1, '#030408');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, 720, 1280);

          // Subtle Cinematic Blue/Indigo Glow in Background
          const glow = ctx.createRadialGradient(360, 480, 20, 360, 480, 400);
          glow.addColorStop(0, 'rgba(99, 102, 241, 0.15)');
          glow.addColorStop(1, 'rgba(99, 102, 241, 0)');
          ctx.fillStyle = glow;
          ctx.fillRect(0, 0, 720, 1280);

          // Rain streak effect
          ctx.strokeStyle = 'rgba(165, 180, 252, 0.08)';
          ctx.lineWidth = 1;
          for (let i = 0; i < 25; i++) {
            const rx = (i * 37 + timeSec * 150) % 720;
            const ry = (i * 83 + timeSec * 300) % 1280;
            ctx.beginPath();
            ctx.moveTo(rx, ry);
            ctx.lineTo(rx - 8, ry + 40);
            ctx.stroke();
          }

          // Anamorphic Top & Bottom Cinematic Letterbox bars with subtle glow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
          ctx.fillRect(0, 0, 720, 110);
          ctx.fillRect(0, 1170, 720, 110);

          ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, 110);
          ctx.lineTo(720, 110);
          ctx.moveTo(0, 1170);
          ctx.lineTo(720, 1170);
          ctx.stroke();

          // Top Badge
          ctx.fillStyle = 'rgba(99, 102, 241, 0.12)';
          ctx.strokeStyle = 'rgba(129, 140, 248, 0.35)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(70, 45, 580, 44, 22);
          ctx.fill();
          ctx.stroke();

          ctx.font = 'bold 15px monospace';
          ctx.fillStyle = '#a5b4fc';
          ctx.textAlign = 'center';
          ctx.fillText('${CINEMA_REEL_CONFIG.badge}', 360, 73);

          // Character Silhouettes / Chiaroscuro Stage (Marcus & Elena Debate)
          const pulse = Math.sin(timeSec * 2) * 6;
          
          // Draw Noir Spotlight Oval
          const spotGrad = ctx.createRadialGradient(360, 520, 40, 360, 520, 280);
          spotGrad.addColorStop(0, 'rgba(129, 140, 248, 0.12)');
          spotGrad.addColorStop(0.7, 'rgba(15, 23, 42, 0.4)');
          spotGrad.addColorStop(1, 'rgba(3, 4, 8, 0)');
          ctx.fillStyle = spotGrad;
          ctx.beginPath();
          ctx.ellipse(360, 520, 260, 260, 0, 0, Math.PI * 2);
          ctx.fill();

          // Interrogation Desk & Microphones
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(160, 620, 400, 30, 8);
          ctx.fill();
          ctx.stroke();

          // Shure SM7B Mic Silhouettes
          ctx.fillStyle = '#6366f1';
          ctx.fillRect(260, 550, 12, 70);
          ctx.fillRect(448, 550, 12, 70);
          ctx.beginPath();
          ctx.ellipse(266, 540, 14, 20, 0, 0, Math.PI * 2);
          ctx.ellipse(454, 540, 14, 20, 0, 0, Math.PI * 2);
          ctx.fill();

          // Dual Character Badges
          ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
          ctx.strokeStyle = '#818cf8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(140, 410, 180, 80, 16);
          ctx.roundRect(400, 410, 180, 80, 16);
          ctx.fill();
          ctx.stroke();

          ctx.font = 'bold 16px -apple-system, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText('🕵️‍♀️ Det. Elena', 230, 442);
          ctx.fillText('💼 Marcus Vance', 490, 442);

          ctx.font = '11px monospace';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText('35mm Chiaroscuro', 230, 465);
          ctx.fillText('Philosophical Defense', 490, 465);

          // Audio Waveform Animation (Live Debate Speech)
          ctx.fillStyle = '#818cf8';
          for (let j = 0; j < 36; j++) {
            const barH = 15 + Math.sin(timeSec * 6 + j * 0.4) * 22;
            ctx.fillRect(180 + j * 10, 680 - barH/2, 4, barH);
          }

          // Active Scene Subtitles & Quotes
          const currentSceneIndex = timeSec < 4 ? 0 : (timeSec < 8 ? 1 : 2);
          const activeScene = ${JSON.stringify(CINEMA_REEL_CONFIG.scenes)}[currentSceneIndex];

          // Scene Header Pill
          ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
          ctx.strokeStyle = 'rgba(129, 140, 248, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(120, 760, 480, 40, 12);
          ctx.fill();
          ctx.stroke();

          ctx.font = 'bold 13px monospace';
          ctx.fillStyle = '#c7d2fe';
          ctx.textAlign = 'center';
          ctx.fillText(activeScene.header, 360, 785);

          // Main Dramatic Quote
          ctx.font = 'bold 26px -apple-system, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          
          // Wrap quote if needed
          const words = activeScene.title.split(' ');
          let line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ');
          let line2 = words.slice(Math.ceil(words.length / 2)).join(' ');
          ctx.fillText(line1, 360, 850);
          if (line2) {
            ctx.fillText(line2, 360, 890);
          }

          // Subtitle Metadata
          ctx.font = '13px monospace';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(activeScene.sub, 360, 945);

          // Anamorphic Flare
          drawAnamorphicFlare(ctx, 360, 710, 600 + Math.sin(timeSec * 3) * 60, timeSec);

          // Bottom Telemetry Bar
          ctx.font = 'bold 12px monospace';
          ctx.fillStyle = '#6366f1';
          ctx.textAlign = 'center';
          ctx.fillText('⚡ 24 FPS CINEMATIC MASTER · 35MM KODAK GRAIN · NEURAL VOICEOVER', 360, 1220);
          ctx.fillStyle = '#94a3b8';
          ctx.fillText('C2PA ED25519 CRYPTOGRAPHIC PROVENANCE SIGNED · ZYVORIQ SOVEREIGN VEO 2', 360, 1245);
        }

        // Setup MediaRecorder to record directly in browser
        window.startRecording = function() {
          return new Promise((resolve) => {
            const stream = canvas.captureStream(30);
            const recorder = new MediaRecorder(stream, {
              mimeType: 'video/webm;codecs=vp9',
              videoBitsPerSecond: 6000000
            });
            const chunks = [];

            recorder.ondataavailable = (e) => {
              if (e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = () => {
              const blob = new Blob(chunks, { type: 'video/webm' });
              const reader = new FileReader();
              reader.onloadend = () => {
                resolve(reader.result.split(',')[1]);
              };
              reader.readAsDataURL(blob);
            };

            recorder.start();

            let frame = 0;
            const interval = setInterval(() => {
              const timeSec = frame / fps;
              renderFrame(timeSec);
              frame++;

              if (frame > totalFrames) {
                clearInterval(interval);
                recorder.stop();
              }
            }, 1000 / fps);
          });
        };
      </script>
    </body>
    </html>
    `;

    await page.setContent(htmlContent);
    await sleep(500);

    console.log("🎬 Recording 12-second Persona #5 Arthouse Cinema Reel...");
    const base64Data = await page.evaluate(async () => {
      return await window.startRecording();
    });

    const targetMp4Path = path.join(OUT_DIR, 'persona5_arthouse_cinema_reel.mp4');
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(targetMp4Path, buffer);

    console.log(`✅ Persona #5 MP4 Video Reel Generated: ${targetMp4Path} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);

    await browser.close();
  } catch (err) {
    console.error("Error generating cinema reel:", err);
    await browser.close();
    process.exit(1);
  }
}

generateCinemaReel().catch(console.error);
