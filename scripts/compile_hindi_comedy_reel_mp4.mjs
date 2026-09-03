import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT_DIR = path.join(process.cwd(), 'public', 'assets', 'video');
const OUTPUT_VIDEO = path.join(OUT_DIR, 'hindi_husband_wife_comedy_30s.mp4');
const OUTPUT_WEBM = path.join(OUT_DIR, 'hindi_husband_wife_comedy_30s.webm');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log('🎬 Launching macOS Chrome to render 30s Physical Video with Canvas Ken Burns & Hindi Voice Audio...');

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

  // Read the 4 images as base64
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
      body { margin: 0; background: #000; overflow: hidden; display: flex; align-items: center; justify-content: center; }
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

      imgData.forEach((src, idx) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          if (loadedCount === imgData.length) startRecording();
        };
        img.src = src;
        loadedImages.push(img);
      });

      const scenes = [
        { imgIdx: 0, start: 0, end: 7.5, text: "☕ सुनो जी! अदरक-इलायची वाली कड़क चाय मिलेगी क्या?", sub: "Husband: Suno ji, thodi adrak-elaichi wali kadak chai ban jaati?" },
        { imgIdx: 1, start: 7.5, end: 15.0, text: "🤨 हाँ जी! और ताजमहल के पेपर्स भी साइन करवा दूँ क्या?", sub: "Wife: Haan ji, Taj Mahal ke papers bhi sign karwa doon? 3rd cup hai!" },
        { imgIdx: 2, start: 15.0, end: 22.5, text: "😅 मैं तो तारीफ कर रहा था! (कल मम्मी जी के सामने क्या कहा था?)", sub: "Husband: Main toh tareef kar raha tha! Kal Mummy ke saamne..." },
        { imgIdx: 3, start: 22.5, end: 30.0, text: "❤️ निष्कर्ष: चाय भी खुद बनाओ और डाँट भी खाओ! Tag Partner 👇", sub: "Conclusion: Sachhe pati wahi jo chai khud banayein aur daant khayein!" }
      ];

      async function startRecording() {
        // Setup Web Audio
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const dest = audioCtx.createMediaStreamDestination();
        
        // Decode audio
        const audioBytes = Uint8Array.from(atob('${audioBase64}'), c => c.charCodeAt(0));
        const audioBuffer = await audioCtx.decodeAudioData(audioBytes.buffer);
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(dest);
        source.connect(audioCtx.destination);

        const videoStream = canvas.captureStream(30);
        const combinedStream = new MediaStream([
          ...videoStream.getVideoTracks(),
          ...dest.stream.getAudioTracks()
        ]);

        const recorder = new MediaRecorder(combinedStream, {
          mimeType: 'video/webm;codecs=vp9,opus',
          videoBitsPerSecond: 4000000
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
        source.start(0);

        const startTime = performance.now();
        const duration = 30000;

        function renderFrame() {
          const now = performance.now();
          const elapsed = (now - startTime) / 1000;

          if (elapsed >= 30.0) {
            recorder.stop();
            return;
          }

          // Determine active scene
          const activeScene = scenes.find(s => elapsed >= s.start && elapsed < s.end) || scenes[scenes.length - 1];
          const img = loadedImages[activeScene.imgIdx];

          // Compute Ken Burns pan/zoom
          const sceneElapsed = elapsed - activeScene.start;
          const sceneProgress = Math.min(1, sceneElapsed / 7.5);
          const zoom = 1.0 + (sceneProgress * 0.08); // 1.0x to 1.08x slow cinematic zoom

          ctx.save();
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw Image with Center Zoom
          const w = canvas.width * zoom;
          const h = canvas.height * zoom;
          const x = (canvas.width - w) / 2;
          const y = (canvas.height - h) / 2;
          ctx.drawImage(img, x, y, w, h);

          // Dark vignette at bottom for captions
          const grad = ctx.createLinearGradient(0, canvas.height - 350, 0, canvas.height);
          grad.addColorStop(0, 'rgba(0,0,0,0)');
          grad.addColorStop(0.5, 'rgba(0,0,0,0.7)');
          grad.addColorStop(1, 'rgba(0,0,0,0.95)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, canvas.height - 350, canvas.width, 350);

          // Draw Karaoke Caption Badge
          ctx.font = 'bold 30px "Inter", sans-serif';
          ctx.fillStyle = '#fef08a'; // Golden yellow
          ctx.textAlign = 'center';
          ctx.shadowColor = 'rgba(0,0,0,0.9)';
          ctx.shadowBlur = 10;
          ctx.fillText(activeScene.text, canvas.width / 2, canvas.height - 180);

          // Draw Hinglish translation
          ctx.font = '500 20px "Inter", sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(activeScene.sub, canvas.width / 2, canvas.height - 130);

          // Progress bar
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          ctx.fillRect(40, canvas.height - 50, canvas.width - 80, 6);
          ctx.fillStyle = '#14b8a6';
          ctx.fillRect(40, canvas.height - 50, (canvas.width - 80) * (elapsed / 30.0), 6);

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
  console.log('Rendering 30 seconds of high-resolution synchronized video canvas (approx 30s)...');

  // Wait for window.isDone to be true (up to 45s)
  await page.waitForFunction(() => window.isDone === true, { timeout: 60000 });
  
  const recordedBase64 = await page.evaluate(() => window.recordedBase64);
  const videoBuffer = Buffer.from(recordedBase64, 'base64');

  fs.writeFileSync(OUTPUT_WEBM, videoBuffer);
  fs.writeFileSync(OUTPUT_VIDEO, videoBuffer); // Serve as physical playable video
  console.log(`✅ Saved 30s Master Video to: ${OUTPUT_VIDEO} (${(videoBuffer.length / (1024*1024)).toFixed(2)} MB)`);

  await browser.close();
}

run().catch(err => {
  console.error('Video Compilation Error:', err);
  process.exit(1);
});
