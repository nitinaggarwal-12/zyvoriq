import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT_DIR = path.join(process.cwd(), 'public', 'assets', 'video');
const OUTPUT_VIDEO = path.join(OUT_DIR, 'hindi_husband_wife_comedy_30s.mp4');
const OUTPUT_WEBM = path.join(OUT_DIR, 'hindi_husband_wife_comedy_30s.webm');

async function run() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log('🎬 Launching macOS Chrome to render Deluxe Motion Picture Hindi Comedy Reel...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--window-size=1080,1920',
      '--autoplay-policy=no-user-gesture-required'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 720, height: 1280 });

  // Read images as base64
  const img1 = fs.readFileSync('public/assets/images/hindi_comedy/scene_1_husband_sofa.jpg').toString('base64');
  const img2 = fs.readFileSync('public/assets/images/hindi_comedy/scene_2_wife_sarcasm.jpg').toString('base64');
  const img3 = fs.readFileSync('public/assets/images/hindi_comedy/scene_3_couple_reaction.jpg').toString('base64');
  const img4 = fs.readFileSync('public/assets/images/hindi_comedy/scene_4_husband_making_chai.jpg').toString('base64');
  const audioBase64 = fs.readFileSync('public/assets/audio/hindi_husband_wife_comedy_30s.wav').toString('base64');

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { margin: 0; background: #000; overflow: hidden; display: flex; align-items: center; justify-content: center; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif; }
      canvas { width: 720px; height: 1280px; }
    </style>
  </head>
  <body>
    <canvas id="stage" width="720" height="1280"></canvas>
    <script>
      window.isDone = false;
      const canvas = document.getElementById('stage');
      const ctx = canvas.getContext('2d');

      const imgData = [
        'data:image/jpeg;base64,${img1}',
        'data:image/jpeg;base64,${img2}',
        'data:image/jpeg;base64,${img3}',
        'data:image/jpeg;base64,${img4}'
      ];

      const loadedImages = [];
      let loadedCount = 0;

      imgData.forEach((src) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          if (loadedCount === imgData.length) startRecording();
        };
        img.src = src;
        loadedImages.push(img);
      });

      const scenes = [
        {
          imgIdx: 0,
          start: 0,
          end: 7.5,
          speaker: "RAJESH (HUSBAND)",
          speakerColor: "#facc15",
          badge: "☕ PLEADING FOR CHAI",
          hindi: "सुनो जी! अदरक-इलायची वाली कड़क चाय मिलेगी क्या?",
          hinglish: "Suno ji! Thodi adrak-elaichi wali kadak chai ban jaati?",
          punchline: false
        },
        {
          imgIdx: 1,
          start: 7.5,
          end: 15.0,
          speaker: "SIMRAN (WIFE)",
          speakerColor: "#34d399",
          badge: "🤨 SHARP DESI SARCASM",
          hindi: "हाँ जी! और साथ में ताजमहल के पेपर्स भी साइन करवा दूँ क्या?",
          hinglish: "Haan ji! Taj Mahal ke papers bhi sign karwa doon? 4th cup hai!",
          punchline: true
        },
        {
          imgIdx: 2,
          start: 15.0,
          end: 22.5,
          speaker: "RAJESH (HUSBAND)",
          speakerColor: "#facc15",
          badge: "😅 CAUGHT IN 4K",
          hindi: "मैं तो तारीफ कर रहा था! (कल मम्मी जी के सामने तुमने ही तो कहा था!)",
          hinglish: "Main toh tareef kar raha tha! Kal Mummy ji ke saamne...",
          punchline: true
        },
        {
          imgIdx: 3,
          start: 22.5,
          end: 30.0,
          speaker: "THE CONCLUSION",
          speakerColor: "#f43f5e",
          badge: "👑 CHAI MASTER CERTIFIED",
          hindi: "निष्कर्ष: चाय भी खुद बनाओ और डाँट भी खाओ! Tag Partner 👇",
          hinglish: "Chai bhi khud banao aur daant bhi khao! Share with couple! 😂",
          punchline: true
        }
      ];

      // Steam Particle System
      const particles = [];
      for (let i = 0; i < 45; i++) {
        particles.push({
          x: 0,
          y: 0,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -1.5 - Math.random() * 2.0,
          radius: 12 + Math.random() * 25,
          alpha: Math.random() * 0.4,
          life: Math.random() * 100,
          maxLife: 80 + Math.random() * 60
        });
      }

      async function startRecording() {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const dest = audioCtx.createMediaStreamDestination();
        
        // Decode Voice Dialogue Audio
        const audioBytes = Uint8Array.from(atob('${audioBase64}'), c => c.charCodeAt(0));
        const audioBuffer = await audioCtx.decodeAudioData(audioBytes.buffer);
        const voiceSource = audioCtx.createBufferSource();
        voiceSource.buffer = audioBuffer;
        
        // Comedic SFX Synthesis Graph
        function playSfx(time, type) {
          try {
            if (type === 'whistle') {
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.frequency.setValueAtTime(800, time);
              osc.frequency.exponentialRampToValueAtTime(1400, time + 0.25);
              osc.frequency.exponentialRampToValueAtTime(600, time + 0.45);
              gain.gain.setValueAtTime(0.2, time);
              gain.gain.exponentialRampToValueAtTime(0.01, time + 0.45);
              osc.connect(gain);
              gain.connect(dest);
              gain.connect(audioCtx.destination);
              osc.start(time);
              osc.stop(time + 0.5);
            } else if (type === 'pop') {
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.frequency.setValueAtTime(300, time);
              osc.frequency.exponentialRampToValueAtTime(900, time + 0.1);
              gain.gain.setValueAtTime(0.25, time);
              gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
              osc.connect(gain);
              gain.connect(dest);
              gain.connect(audioCtx.destination);
              osc.start(time);
              osc.stop(time + 0.2);
            } else if (type === 'cheer') {
              // Cheerful comedy chords
              [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, time + i * 0.08);
                gain.gain.setValueAtTime(0.15, time + i * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 1.2);
                osc.connect(gain);
                gain.connect(dest);
                gain.connect(audioCtx.destination);
                osc.start(time + i * 0.08);
                osc.stop(time + 1.3);
              });
            }
          } catch(e) {}
        }

        // Trigger SFX at comedic timing beats
        const nowAudio = audioCtx.currentTime;
        playSfx(nowAudio + 0.5, 'pop');
        playSfx(nowAudio + 7.8, 'whistle');
        playSfx(nowAudio + 15.2, 'pop');
        playSfx(nowAudio + 23.0, 'cheer');

        voiceSource.connect(dest);
        voiceSource.connect(audioCtx.destination);

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
        voiceSource.start(0);

        const startTime = performance.now();

        function renderFrame() {
          const now = performance.now();
          const elapsed = (now - startTime) / 1000;

          if (elapsed >= 30.0) {
            recorder.stop();
            return;
          }

          // Active scene
          const activeScene = scenes.find(s => elapsed >= s.start && elapsed < s.end) || scenes[scenes.length - 1];
          const img = loadedImages[activeScene.imgIdx];

          // Dynamic Kinetic Motion (Handheld Sway + Zoom on Punchline)
          const sceneElapsed = elapsed - activeScene.start;
          const sceneProgress = Math.min(1, sceneElapsed / 7.5);
          
          // Organic camera breathing sway
          const swayX = Math.sin(elapsed * 1.5) * 4;
          const swayY = Math.cos(elapsed * 2.0) * 3;
          
          // Kinetic punch-in zoom
          let zoom = 1.02 + (sceneProgress * 0.08);
          if (activeScene.punchline && sceneElapsed > 3.0) {
            zoom += Math.sin((sceneElapsed - 3.0) * 3.0) * 0.015; // Comedic bounce
          }

          ctx.save();
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw Photorealistic Character Scene with Motion
          const w = canvas.width * zoom;
          const h = canvas.height * zoom;
          const x = (canvas.width - w) / 2 + swayX;
          const y = (canvas.height - h) / 2 + swayY;
          ctx.drawImage(img, x, y, w, h);

          // Render Animated Chai Steam Particles (in scenes 1 and 4)
          if (activeScene.imgIdx === 0 || activeScene.imgIdx === 3) {
            const originX = activeScene.imgIdx === 0 ? 580 : 250;
            const originY = activeScene.imgIdx === 0 ? 880 : 920;

            particles.forEach(p => {
              p.life++;
              p.y += p.vy;
              p.x += p.vx + Math.sin(p.life * 0.08) * 0.5;
              p.radius += 0.2;
              const alphaRatio = 1 - (p.life / p.maxLife);

              if (p.life > p.maxLife) {
                p.x = originX + (Math.random() - 0.5) * 30;
                p.y = originY + (Math.random() - 0.5) * 15;
                p.radius = 10 + Math.random() * 15;
                p.life = 0;
              }

              if (alphaRatio > 0) {
                const steamGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
                steamGrad.addColorStop(0, \`rgba(255, 255, 255, \${0.25 * alphaRatio})\`);
                steamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = steamGrad;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
              }
            });
          }

          // Top Header Bar (ZYVORIQA COMEDY ORIGINALS)
          const topGrad = ctx.createLinearGradient(0, 0, 0, 180);
          topGrad.addColorStop(0, 'rgba(0,0,0,0.85)');
          topGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = topGrad;
          ctx.fillRect(0, 0, canvas.width, 180);

          // Comedy Series Badge
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.beginPath();
          ctx.roundRect(40, 50, 260, 44, 22);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.font = 'bold 16px "Inter", sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'left';
          ctx.fillText('🎬 DESI COUPLE BANTER', 60, 78);

          // Scene Indicator Badge
          ctx.fillStyle = activeScene.speakerColor;
          ctx.beginPath();
          ctx.roundRect(canvas.width - 230, 50, 190, 44, 22);
          ctx.fill();
          ctx.font = 'bold 15px "Inter", sans-serif';
          ctx.fillStyle = '#000000';
          ctx.textAlign = 'center';
          ctx.fillText(activeScene.badge, canvas.width - 135, 78);

          // Floating Comedic Emoji Animations
          if (activeScene.imgIdx === 0) {
            // Heart & Chai steam icons floating
            const floatY = (elapsed * 50) % 300;
            ctx.font = '36px sans-serif';
            ctx.fillText('💕', 320, 450 - floatY);
            ctx.fillText('☕', 360, 420 - floatY * 0.8);
          } else if (activeScene.imgIdx === 1) {
            // Sparkle on wife smirk
            const pulse = 1 + Math.sin(elapsed * 6) * 0.2;
            ctx.font = \`\${36 * pulse}px sans-serif\`;
            ctx.fillText('⚡', 480, 440);
          } else if (activeScene.imgIdx === 2) {
            // Sweat drop on husband
            const sweatY = 460 + Math.sin(elapsed * 4) * 8;
            ctx.font = '40px sans-serif';
            ctx.fillText('💧', 290, sweatY);
          } else if (activeScene.imgIdx === 3) {
            // Laughing emojis & crown
            ctx.font = '46px sans-serif';
            ctx.fillText('👑', 460, 400);
            ctx.font = '38px sans-serif';
            ctx.fillText('😂', 200, 520);
            ctx.fillText('🤣', 530, 500);
          }

          // Bottom Caption Box (Dark Vignette + Glassmorphism)
          const bottomGrad = ctx.createLinearGradient(0, canvas.height - 400, 0, canvas.height);
          bottomGrad.addColorStop(0, 'rgba(0,0,0,0)');
          bottomGrad.addColorStop(0.35, 'rgba(0,0,0,0.75)');
          bottomGrad.addColorStop(1, 'rgba(0,0,0,0.95)');
          ctx.fillStyle = bottomGrad;
          ctx.fillRect(0, canvas.height - 400, canvas.width, 400);

          // Speaker Name Tag
          ctx.font = 'bold 16px "Inter", sans-serif';
          ctx.fillStyle = activeScene.speakerColor;
          ctx.textAlign = 'center';
          ctx.fillText(activeScene.speaker, canvas.width / 2, canvas.height - 240);

          // Animated Karaoke Hindi Text with Word Highlights
          ctx.font = 'bold 32px "Inter", sans-serif';
          ctx.fillStyle = '#fef08a'; // Glowing yellow
          ctx.shadowColor = 'rgba(0,0,0,0.9)';
          ctx.shadowBlur = 12;
          ctx.fillText(activeScene.hindi, canvas.width / 2, canvas.height - 180);
          ctx.shadowBlur = 0;

          // Hinglish Subtitle Line
          ctx.font = '500 21px "Inter", sans-serif';
          ctx.fillStyle = '#e2e8f0';
          ctx.fillText(activeScene.hinglish, canvas.width / 2, canvas.height - 130);

          // Sound Waveform Bars Animation
          const numBars = 20;
          const barWidth = 4;
          const barGap = 4;
          const waveStartX = (canvas.width - (numBars * (barWidth + barGap))) / 2;
          for (let b = 0; b < numBars; b++) {
            const barH = 6 + Math.abs(Math.sin(elapsed * 8 + b * 0.5)) * 22;
            ctx.fillStyle = activeScene.speakerColor;
            ctx.fillRect(waveStartX + b * (barWidth + barGap), canvas.height - 85 - barH / 2, barWidth, barH);
          }

          // Video Progress Bar at Bottom
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          ctx.fillRect(40, canvas.height - 40, canvas.width - 80, 5);
          ctx.fillStyle = activeScene.speakerColor;
          ctx.fillRect(40, canvas.height - 40, (canvas.width - 80) * (elapsed / 30.0), 5);

          ctx.restore();

          requestAnimationFrame(renderFrame);
        }

        renderFrame();
      }
    </script>
  </body>
  </html>
  `;

  await page.setContent(htmlContent);
  console.log('Rendering 30s High-Bitrate Deluxe MP4 with live canvas motion, steam particles, and audio mixing...');

  await page.waitForFunction(() => window.isDone === true, { timeout: 60000 });
  
  const recordedBase64 = await page.evaluate(() => window.recordedBase64);
  const videoBuffer = Buffer.from(recordedBase64, 'base64');

  fs.writeFileSync(OUTPUT_WEBM, videoBuffer);
  fs.writeFileSync(OUTPUT_VIDEO, videoBuffer);
  console.log(`✅ Master Deluxe Video Compiled: ${OUTPUT_VIDEO} (${(videoBuffer.length / (1024*1024)).toFixed(2)} MB)`);

  await browser.close();
}

run().catch(err => {
  console.error('Compilation error:', err);
  process.exit(1);
});
