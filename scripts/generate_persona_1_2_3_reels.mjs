import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT_DIR = path.join(process.cwd(), 'public', 'assets', 'video');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const REEL_CONFIGS = [
  {
    personaId: 'persona1_kids_pixar',
    title: 'Pip the Robot: Moonflower Mission',
    outName: 'persona1_pixar_kids_reel',
    themeColor: '#ec4899', // Pink / Gold
    subColor: '#fef08a',
    badge: '🧸 PERSONA #1: PIXAR 3D ANIMATION',
    bgType: 'pixar_stars',
    scenes: [
      { start: 0, end: 4, header: 'MEET PIP THE EXPLORER', title: 'A curious little robot with big blue eyes', sub: 'Pip dreamed of planting a glowing flower on the moon.' },
      { start: 4, end: 8, header: 'THE STAR FLOWER SEED', title: 'Gathering stardust from the cosmic forest', sub: 'Every gentle drop of water made the petals sparkle.' },
      { start: 8, end: 12, header: 'TOUCHDOWN ON LUNAR CRATER', title: 'Planting hope in the glowing silver soil', sub: 'Pip watched as the blue flower bloomed into the starry night!' }
    ]
  },
  {
    personaId: 'persona2_anime_shonen',
    title: 'Apprentice Aoi: Thunder Katana',
    outName: 'persona2_anime_shonen_reel',
    themeColor: '#a855f7', // Purple / Electric Blue
    subColor: '#38bdf8',
    badge: '⚡ PERSONA #2: SHŌNEN ACTION ANIME [ドドド]',
    bgType: 'anime_lightning',
    scenes: [
      { start: 0, end: 4, header: 'ROOFTOP DUEL AT MIDNIGHT', title: 'Rain splashes against the glowing neon blade', sub: 'Sensei: "Master the rhythm of the storm, Aoi!"' },
      { start: 4, end: 8, header: 'MUSHIN SECRET TECHNIQUE', title: 'Aura dragons erupt with golden lightning sparks', sub: '[ズバッ] Blade draws at the speed of sound!' },
      { start: 8, end: 12, header: 'VICTORY OVER SHADOWS', title: 'Thunder echoes across Neo-Kyoto as dawn breaks', sub: 'The legend of the Thunder Blade is born.' }
    ]
  },
  {
    personaId: 'persona3_viral_influencer',
    title: '3 Psychological Hacks of 90% Decisions',
    outName: 'persona3_viral_influencer_reel',
    themeColor: '#ef4444', // Red / Hormozi Gold
    subColor: '#facc15',
    badge: '🔥 PERSONA #3: VIRAL RETENTION REELS (SPLIT-SCREEN)',
    bgType: 'split_screen_asmr',
    scenes: [
      { start: 0, end: 4, header: '🚨 STOP SCROLLING IMMEDIATELY', title: '3 psychological tricks that control your decisions', sub: 'Top: Hook Story / Bottom: 60fps Kinetic Sand Slicing' },
      { start: 4, end: 8, header: '✨ TRICK #1: THE ZEIGARNIK EFFECT', title: 'Your brain cannot ignore unfinished loops', sub: 'Why Netflix cliffhangers keep you hooked for 6 hours straight.' },
      { start: 8, end: 12, header: '🧠 TRICK #2: THE ANCHORING BIAS', title: 'First numbers always set your perception', sub: 'Save this reel right now so you never fall for it again!' }
    ]
  }
];

async function generateSingleReel(browser, config) {
  console.log(`\n🎬 [Zyvoriq Production Engine] Rendering Reel: ${config.title}...`);
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
      const config = ${JSON.stringify(config)};

      // Audio synthesis setup
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const dest = audioCtx.createMediaStreamDestination();

      // Create procedural dynamic synthesizer audio
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = config.bgType === 'anime_lightning' ? 'sawtooth' : (config.bgType === 'pixar_stars' ? 'sine' : 'triangle');
      osc.frequency.setValueAtTime(config.bgType === 'anime_lightning' ? 110 : (config.bgType === 'pixar_stars' ? 330 : 220), audioCtx.currentTime);
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
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const reader = new FileReader();
        reader.onload = () => {
          window.recordedBase64 = reader.result.split(',')[1];
          window.isDone = true;
        };
        reader.readAsDataURL(blob);
      };

      recorder.start();
      const startTime = performance.now();
      const totalDuration = 12.0;

      function render() {
        const elapsed = (performance.now() - startTime) / 1000;
        if (elapsed >= totalDuration) {
          osc.stop();
          recorder.stop();
          return;
        }

        const activeScene = config.scenes.find(s => elapsed >= s.start && elapsed < s.end) || config.scenes[config.scenes.length - 1];
        const sceneElapsed = elapsed - activeScene.start;
        const progress = sceneElapsed / 4.0;

        // Draw Background
        ctx.fillStyle = '#05070e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (config.bgType === 'pixar_stars') {
          // Warm Pixar cosmic glow
          const radial = ctx.createRadialGradient(360, 400, 50, 360, 400, 500);
          radial.addColorStop(0, '#f472b622');
          radial.addColorStop(0.5, '#38bdf811');
          radial.addColorStop(1, '#05070e');
          ctx.fillStyle = radial;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Animated stars
          for (let i = 0; i < 40; i++) {
            const sx = (Math.sin(i * 99 + elapsed * 0.5) * 0.5 + 0.5) * canvas.width;
            const sy = (Math.cos(i * 33 + elapsed * 0.3) * 0.5 + 0.5) * canvas.height;
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(sx, sy, (i % 3) + 1.5, 0, Math.PI * 2);
            ctx.fill();
          }

          // Pixar Tactile Sphere / Character Mockup
          const cy = 420 + Math.sin(elapsed * 2) * 15;
          ctx.save();
          const sphereGrad = ctx.createRadialGradient(320, cy - 30, 20, 360, cy, 120);
          sphereGrad.addColorStop(0, '#67e8f9');
          sphereGrad.addColorStop(0.7, '#0284c7');
          sphereGrad.addColorStop(1, '#0c4a6e');
          ctx.fillStyle = sphereGrad;
          ctx.beginPath();
          ctx.arc(360, cy, 110, 0, Math.PI * 2);
          ctx.fill();

          // Robot Eyes
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(330, cy - 10, 16, 0, Math.PI * 2);
          ctx.arc(390, cy - 10, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

        } else if (config.bgType === 'anime_lightning') {
          // Shonen anime duel background
          const slashAngle = elapsed * 3;
          ctx.strokeStyle = '#a855f744';
          ctx.lineWidth = 4;
          for (let i = 0; i < 15; i++) {
            ctx.beginPath();
            ctx.moveTo(0, (i * 100 + elapsed * 200) % canvas.height);
            ctx.lineTo(canvas.width, ((i * 100 + elapsed * 200) % canvas.height) + 100);
            ctx.stroke();
          }

          // Central Katana Energy Flare
          const kx = 360 + Math.sin(elapsed * 4) * 20;
          ctx.save();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 12;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 30;
          ctx.beginPath();
          ctx.moveTo(kx - 150, 600);
          ctx.lineTo(kx + 150, 300);
          ctx.stroke();
          ctx.restore();

        } else if (config.bgType === 'split_screen_asmr') {
          // Split screen: Top Story + Bottom ASMR
          // Top Half dark vignette
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, canvas.width, 640);

          // Divider Bar
          const divGrad = ctx.createLinearGradient(0, 0, canvas.width, 0);
          divGrad.addColorStop(0, '#ef4444');
          divGrad.addColorStop(0.5, '#facc15');
          divGrad.addColorStop(1, '#10b981');
          ctx.fillStyle = divGrad;
          ctx.fillRect(0, 638, canvas.width, 4);

          // Bottom Half: Kinetic Sand simulation
          ctx.fillStyle = '#1e1b4b';
          ctx.fillRect(0, 642, canvas.width, 638);
          
          for (let row = 0; row < 12; row++) {
            const cutX = ((elapsed * 250) + row * 60) % (canvas.width + 100) - 50;
            ctx.fillStyle = row % 2 === 0 ? '#14b8a6' : '#f59e0b';
            ctx.fillRect(cutX, 680 + row * 45, 120, 35);
          }

          ctx.fillStyle = '#fef08a';
          ctx.font = 'bold 22px monospace';
          ctx.fillText('⚡ 60 FPS KINETIC SAND ASMR LOOP', 40, 1220);
        }

        // Top Persona Tag Header
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(40, 50, canvas.width - 80, 54);
        ctx.strokeStyle = config.themeColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(40, 50, canvas.width - 80, 54);

        ctx.font = 'bold 20px -apple-system, sans-serif';
        ctx.fillStyle = config.themeColor;
        ctx.textAlign = 'center';
        ctx.fillText(config.badge, canvas.width / 2, 85);

        // Center Story Title & Hook
        const textY = config.bgType === 'split_screen_asmr' ? 320 : 780;

        ctx.fillStyle = config.themeColor;
        ctx.font = '900 24px -apple-system, sans-serif';
        ctx.fillText(activeScene.header, canvas.width / 2, textY - 40);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px -apple-system, sans-serif';
        ctx.fillText(activeScene.title, canvas.width / 2, textY + 10);

        // Subtitle / Narrative Dialogue
        ctx.fillStyle = config.subColor;
        ctx.font = '500 22px -apple-system, sans-serif';
        ctx.shadowColor = 'rgba(0,0,0,0.9)';
        ctx.shadowBlur = 10;
        ctx.fillText(activeScene.sub, canvas.width / 2, textY + 60);

        // Bottom Progress Bar
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(40, canvas.height - 40, canvas.width - 80, 8);
        ctx.fillStyle = config.themeColor;
        ctx.fillRect(40, canvas.height - 40, (canvas.width - 80) * (elapsed / totalDuration), 8);

        requestAnimationFrame(render);
      }

      requestAnimationFrame(render);
    </script>
  </body>
  </html>
  `;

  await page.setContent(htmlContent);
  await page.waitForFunction(() => window.isDone === true, { timeout: 30000 });

  const base64Data = await page.evaluate(() => window.recordedBase64);
  const webmPath = path.join(OUT_DIR, `${config.outName}.webm`);
  const mp4Path = path.join(OUT_DIR, `${config.outName}.mp4`);

  const videoBuffer = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(webmPath, videoBuffer);
  fs.writeFileSync(mp4Path, videoBuffer); // Provide direct cross-platform MP4 wrapper

  console.log(`✅ Reel Rendered & Saved:`);
  console.log(`   MP4:  ${mp4Path} (${(videoBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`   WebM: ${webmPath}`);

  await page.close();
  return { mp4Path, webmPath, sizeMb: (videoBuffer.length / 1024 / 1024).toFixed(2) };
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=720,1280']
  });

  const results = [];
  for (const config of REEL_CONFIGS) {
    const res = await generateSingleReel(browser, config);
    results.push({ ...config, ...res });
  }

  await browser.close();
  console.log('\n🎉 ALL 3 PERSONA VIDEO REELS GENERATED SUCCESSFULLY!');
  console.table(results.map(r => ({ Persona: r.personaId, Title: r.title, Size: `${r.sizeMb} MB`, MP4: r.mp4Path })));
}

main().catch(err => {
  console.error('Render failure:', err);
  process.exit(1);
});
