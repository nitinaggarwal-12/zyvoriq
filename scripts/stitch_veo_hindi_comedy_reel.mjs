import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT_DIR = path.join(process.cwd(), 'public', 'assets', 'video');
const OUTPUT_VIDEO = path.join(OUT_DIR, 'hindi_husband_wife_comedy_30s.mp4');
const OUTPUT_WEBM = path.join(OUT_DIR, 'hindi_husband_wife_comedy_30s.webm');

async function run() {
  console.log('🎬 Launching macOS Chrome to assemble Google Veo 3.1 Genuine Motion Picture Video Reel...');

  // Check which act videos exist
  const acts = [1, 2, 3, 4].map(i => {
    const fn = `veo_hindi_comedy_act${i}.mp4`;
    const p = path.join(OUT_DIR, fn);
    return { act: i, exists: fs.existsSync(p) && fs.statSync(p).size > 50000, path: p, fileName: fn };
  });

  console.log('Veo Act Videos Status:', acts);

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

  // Read the 4 video files or fallback to images if any act is missing
  const v1 = acts[0].exists ? fs.readFileSync(acts[0].path).toString('base64') : null;
  const v2 = acts[1].exists ? fs.readFileSync(acts[1].path).toString('base64') : null;
  const v3 = acts[2].exists ? fs.readFileSync(acts[2].path).toString('base64') : null;
  const v4 = acts[3].exists ? fs.readFileSync(acts[3].path).toString('base64') : null;

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

      const videoData = [
        ${v1 ? `'data:video/mp4;base64,${v1}'` : 'null'},
        ${v2 ? `'data:video/mp4;base64,${v2}'` : 'null'},
        ${v3 ? `'data:video/mp4;base64,${v3}'` : 'null'},
        ${v4 ? `'data:video/mp4;base64,${v4}'` : 'null'}
      ];

      const imgData = [
        'data:image/jpeg;base64,${img1}',
        'data:image/jpeg;base64,${img2}',
        'data:image/jpeg;base64,${img3}',
        'data:image/jpeg;base64,${img4}'
      ];

      const scenes = [
        {
          idx: 0,
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
          idx: 1,
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
          idx: 2,
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
          idx: 3,
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

      const videoElements = [];
      const imageElements = [];

      for (let i = 0; i < 4; i++) {
        const img = new Image();
        img.src = imgData[i];
        imageElements.push(img);

        if (videoData[i]) {
          const vid = document.createElement('video');
          vid.src = videoData[i];
          vid.muted = true;
          vid.loop = true;
          vid.playsInline = true;
          vid.preload = 'auto';
          videoElements.push(vid);
        } else {
          videoElements.push(null);
        }
      }

      async function init() {
        // Start all videos
        for (const v of videoElements) {
          if (v) {
            try { await v.play(); } catch(e) {}
          }
        }
        startRecording();
      }

      async function startRecording() {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const dest = audioCtx.createMediaStreamDestination();
        
        const audioBytes = Uint8Array.from(atob('${audioBase64}'), c => c.charCodeAt(0));
        const audioBuffer = await audioCtx.decodeAudioData(audioBytes.buffer);
        const voiceSource = audioCtx.createBufferSource();
        voiceSource.buffer = audioBuffer;
        
        voiceSource.connect(dest);
        voiceSource.connect(audioCtx.destination);

        const videoStream = canvas.captureStream(30);
        const combinedStream = new MediaStream([
          ...videoStream.getVideoTracks(),
          ...dest.stream.getAudioTracks()
        ]);

        const recorder = new MediaRecorder(combinedStream, {
          mimeType: 'video/webm;codecs=vp9,opus',
          videoBitsPerSecond: 6000000
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

          const activeScene = scenes.find(s => elapsed >= s.start && elapsed < s.end) || scenes[scenes.length - 1];
          const vid = videoElements[activeScene.idx];
          const img = imageElements[activeScene.idx];

          ctx.save();
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw Veo 3.1 Video Frame or High-Res Image
          if (vid && vid.readyState >= 2) {
            ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
          } else {
            const sceneElapsed = elapsed - activeScene.start;
            const zoom = 1.0 + Math.min(0.08, (sceneElapsed / 7.5) * 0.08);
            const w = canvas.width * zoom;
            const h = canvas.height * zoom;
            ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
          }

          // Top Header Bar
          const topGrad = ctx.createLinearGradient(0, 0, 0, 160);
          topGrad.addColorStop(0, 'rgba(0,0,0,0.85)');
          topGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = topGrad;
          ctx.fillRect(0, 0, canvas.width, 160);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
          ctx.beginPath();
          ctx.roundRect(40, 45, 270, 42, 21);
          ctx.fill();

          ctx.font = 'bold 15px "Inter", sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'left';
          ctx.fillText('🎬 VEO 3.1 • DESI COMEDY', 58, 72);

          // Scene Indicator Badge
          ctx.fillStyle = activeScene.speakerColor;
          ctx.beginPath();
          ctx.roundRect(canvas.width - 230, 45, 190, 42, 21);
          ctx.fill();
          ctx.font = 'bold 14px "Inter", sans-serif';
          ctx.fillStyle = '#000000';
          ctx.textAlign = 'center';
          ctx.fillText(activeScene.badge, canvas.width - 135, 72);

          // Bottom Caption Box (Dark Vignette + Typography)
          const bottomGrad = ctx.createLinearGradient(0, canvas.height - 380, 0, canvas.height);
          bottomGrad.addColorStop(0, 'rgba(0,0,0,0)');
          bottomGrad.addColorStop(0.35, 'rgba(0,0,0,0.75)');
          bottomGrad.addColorStop(1, 'rgba(0,0,0,0.95)');
          ctx.fillStyle = bottomGrad;
          ctx.fillRect(0, canvas.height - 380, canvas.width, 380);

          // Speaker Tag
          ctx.font = 'bold 15px "Inter", sans-serif';
          ctx.fillStyle = activeScene.speakerColor;
          ctx.textAlign = 'center';
          ctx.fillText(activeScene.speaker, canvas.width / 2, canvas.height - 230);

          // Animated Karaoke Hindi Text with Word Highlights
          ctx.font = 'bold 30px "Inter", sans-serif';
          ctx.fillStyle = '#fef08a'; // Glowing yellow
          ctx.shadowColor = 'rgba(0,0,0,0.9)';
          ctx.shadowBlur = 12;
          ctx.fillText(activeScene.hindi, canvas.width / 2, canvas.height - 175);
          ctx.shadowBlur = 0;

          // Hinglish Subtitle Line
          ctx.font = '500 20px "Inter", sans-serif';
          ctx.fillStyle = '#e2e8f0';
          ctx.fillText(activeScene.hinglish, canvas.width / 2, canvas.height - 125);

          // Sound Waveform Bars Animation
          const numBars = 20;
          const barWidth = 4;
          const barGap = 4;
          const waveStartX = (canvas.width - (numBars * (barWidth + barGap))) / 2;
          for (let b = 0; b < numBars; b++) {
            const barH = 6 + Math.abs(Math.sin(elapsed * 8 + b * 0.5)) * 22;
            ctx.fillStyle = activeScene.speakerColor;
            ctx.fillRect(waveStartX + b * (barWidth + barGap), canvas.height - 80 - barH / 2, barWidth, barH);
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

      init();
    </script>
  </body>
  </html>
  `;

  await page.setContent(htmlContent);
  console.log('Rendering 30s Master Video Canvas...');

  await page.waitForFunction(() => window.isDone === true, { timeout: 60000 });
  
  const recordedBase64 = await page.evaluate(() => window.recordedBase64);
  const videoBuffer = Buffer.from(recordedBase64, 'base64');

  fs.writeFileSync(OUTPUT_WEBM, videoBuffer);
  fs.writeFileSync(OUTPUT_VIDEO, videoBuffer);
  console.log(`✅ Master Video Assembled: ${OUTPUT_VIDEO} (${(videoBuffer.length / (1024*1024)).toFixed(2)} MB)`);

  await browser.close();
}

run().catch(err => {
  console.error('Stitcher error:', err);
  process.exit(1);
});
