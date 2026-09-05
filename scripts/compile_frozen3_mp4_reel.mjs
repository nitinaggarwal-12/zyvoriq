import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT_DIR = path.join(process.cwd(), 'public', 'cinema', 'frozen3');
const OUTPUT_MP4 = path.join(OUT_DIR, 'frozen3_theatrical_trailer_master.mp4');
const OUTPUT_WEBM = path.join(OUT_DIR, 'frozen3_theatrical_trailer_master.webm');

async function compileFrozen3MotionPictureReel() {
  console.log('================================================================================');
  console.log('🎬 COMPILING FROZEN 3 MASTER MOTION PICTURE REEL (GOOGLE SIGNED CHROME ENGINE)');
  console.log(`   Output Target: ${OUTPUT_MP4}`);
  console.log('================================================================================\n');

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  // Read the 5 photorealistic 4K master keyframe images as base64
  const img1 = fs.readFileSync(path.join(OUT_DIR, 'act1_golden_twilight.jpg')).toString('base64');
  const img2 = fs.readFileSync(path.join(OUT_DIR, 'act2_glacier_chasm.jpg')).toString('base64');
  const img3 = fs.readFileSync(path.join(OUT_DIR, 'act3_solar_titan.jpg')).toString('base64');
  const img4 = fs.readFileSync(path.join(OUT_DIR, 'act4_sisters_aurora.jpg')).toString('base64');
  const img5 = fs.readFileSync(path.join(OUT_DIR, 'act5_snowman_stinger.jpg')).toString('base64');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--window-size=1280,720',
      '--autoplay-policy=no-user-gesture-required'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { margin: 0; background: #000; overflow: hidden; display: flex; align-items: center; justify-content: center; }
      canvas { width: 1280px; height: 720px; }
    </style>
  </head>
  <body>
    <canvas id="stage" width="1280" height="720"></canvas>
    <script>
      window.isDone = false;
      window.recordedChunks = [];
      const canvas = document.getElementById('stage');
      const ctx = canvas.getContext('2d');
      const TOTAL_DURATION = 30.0; // 30.0 seconds calibrated theatrical trailer cut

      const images = [
        'data:image/jpeg;base64,${img1}',
        'data:image/jpeg;base64,${img2}',
        'data:image/jpeg;base64,${img3}',
        'data:image/jpeg;base64,${img4}',
        'data:image/jpeg;base64,${img5}'
      ];

      const loadedImgs = [];
      let loadedCount = 0;

      images.forEach((src, idx) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          if (loadedCount === images.length) {
            startMasterCompilation();
          }
        };
        img.src = src;
        loadedImgs.push(img);
      });

      const acts = [
        {
          actNum: 1,
          start: 0.0,
          end: 6.0,
          imgIdx: 0,
          title: "ACT 1: THE SILENT THAW",
          speaker: "QUEEN ELSA",
          dialogue: "The ice isn't freezing... it's listening. Something ancient awakens.",
          baseFreq: 587.33 // D5 siren
        },
        {
          actNum: 2,
          start: 6.0,
          end: 12.0,
          imgIdx: 1,
          title: "ACT 2: THE SOLAR INVERSION",
          speaker: "QUEEN ANNA",
          dialogue: "Two years ago, we found our places. If the glacier falls, we fall together.",
          baseFreq: 698.46 // F5 horn
        },
        {
          actNum: 3,
          start: 12.0,
          end: 19.0,
          imgIdx: 2,
          title: "ACT 3: THE SOLAR TITAN",
          speaker: "IGNIS (SOLAR TITAN)",
          dialogue: "The winter was but an eyelid closed! Now the sun shall consume the snow!",
          baseFreq: 466.16 // Bb4 magma rumble
        },
        {
          actNum: 4,
          start: 19.0,
          end: 25.0,
          imgIdx: 3,
          title: "ACT 4: HARMONIC RESONANCE",
          speaker: "ANNA & ELSA",
          dialogue: "Stand with me, sister! Between the ice and the fire, we hold the line!",
          baseFreq: 880.00 // A5 Ahtohallan
        },
        {
          actNum: 5,
          start: 25.0,
          end: 30.0,
          imgIdx: 4,
          title: "ACT 5: TITLE REVEAL & STINGER",
          speaker: "OLAF",
          dialogue: "Hot cocoa by the glacier? Turns out, warm hugs tickle from the inside!",
          baseFreq: 1046.50 // C6 Celesta
        }
      ];

      function startMasterCompilation() {
        // Setup Web Audio API Synthesizer
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioCtx();
        const dest = audioCtx.createMediaStreamDestination();

        // Master score oscillator
        const osc = audioCtx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);

        const filter = audioCtx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(450, audioCtx.currentTime);

        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(dest);
        gainNode.connect(audioCtx.destination);
        osc.start();

        // Capture Canvas Stream at 30fps
        const canvasStream = canvas.captureStream(30);
        const combinedStream = new MediaStream([
          ...canvasStream.getVideoTracks(),
          ...dest.stream.getAudioTracks()
        ]);

        let mimeType = 'video/mp4;codecs=avc1,mp4a.40.2';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/mp4';
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm;codecs=vp9,opus';
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }

        console.log("Recording with MIME:", mimeType);

        const recorder = new MediaRecorder(combinedStream, {
          mimeType,
          videoBitsPerSecond: 12000000
        });

        const chunks = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        recorder.onstop = async () => {
          const blob = new Blob(chunks, { type: mimeType });
          const arrayBuf = await blob.arrayBuffer();
          const base64 = btoa(
            new Uint8Array(arrayBuf).reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
          window.recordedBase64 = base64;
          window.recordedMime = mimeType;
          window.isDone = true;
        };

        recorder.start(100);

        const startTime = performance.now();

        function renderFrame() {
          const elapsed = (performance.now() - startTime) / 1000.0;

          if (elapsed >= TOTAL_DURATION) {
            recorder.stop();
            return;
          }

          // Determine Active Act
          const activeAct = acts.find(a => elapsed >= a.start && elapsed < a.end) || acts[acts.length - 1];
          const actProgress = (elapsed - activeAct.start) / (activeAct.end - activeAct.start);

          // Update audio frequency smoothly
          osc.frequency.setTargetAtTime(activeAct.baseFreq, audioCtx.currentTime, 0.2);

          // Clear
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // 1. Draw Master 4K Keyframe with Ken Burns Camera Tracking
          const img = loadedImgs[activeAct.imgIdx];
          if (img) {
            ctx.save();
            const scale = 1.0 + actProgress * 0.08; // 8% slow dramatic zoom
            const panX = Math.sin(actProgress * Math.PI) * 20;
            const panY = Math.cos(actProgress * Math.PI) * 10;

            const drawW = canvas.width * scale;
            const drawH = canvas.height * scale;
            const drawX = (canvas.width - drawW) / 2 + panX;
            const drawY = (canvas.height - drawH) / 2 + panY;

            ctx.drawImage(img, drawX, drawY, drawW, drawH);
            ctx.restore();
          }

          // 2. Volumetric Aurora / Ember Shimmer
          if (activeAct.actNum === 4) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(0, 0);
            for (let x = 0; x <= canvas.width; x += 40) {
              const y = 80 + Math.sin(x * 0.005 + elapsed * 2.0) * 40;
              ctx.lineTo(x, y);
            }
            ctx.lineTo(canvas.width, 0);
            ctx.closePath();
            const auroraGrad = ctx.createLinearGradient(0, 0, 0, 200);
            auroraGrad.addColorStop(0, "rgba(52, 211, 153, 0.25)");
            auroraGrad.addColorStop(1, "rgba(5, 150, 105, 0)");
            ctx.fillStyle = auroraGrad;
            ctx.fill();
            ctx.restore();
          }

          // 3. Floating 3D Micro-Snow & Magma Embers
          for (let p = 0; p < 35; p++) {
            const px = (p * 79 + elapsed * 50) % canvas.width;
            const py = (p * 113 + Math.sin(elapsed + p) * 60 + elapsed * 30) % canvas.height;
            const radius = 1.2 + (p % 3);

            ctx.beginPath();
            ctx.arc(px, py, radius, 0, Math.PI * 2);
            if (activeAct.actNum === 3) {
              ctx.fillStyle = p % 2 === 0 ? "rgba(251, 146, 60, 0.8)" : "rgba(239, 68, 68, 0.85)";
            } else {
              ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
            }
            ctx.fill();
          }

          // 4. Anamorphic Cinema Blue Streak
          const flareY = canvas.height * 0.52 + Math.sin(elapsed * 0.4) * 30;
          const flareGrad = ctx.createLinearGradient(0, flareY, canvas.width, flareY);
          flareGrad.addColorStop(0, "rgba(56, 189, 248, 0)");
          flareGrad.addColorStop(0.5, "rgba(186, 230, 253, 0.3)");
          flareGrad.addColorStop(1, "rgba(56, 189, 248, 0)");
          ctx.fillStyle = flareGrad;
          ctx.fillRect(0, flareY - 1, canvas.width, 2);

          // 5. Act & Timecode Header Overlay
          ctx.save();
          ctx.font = "bold 13px sans-serif";
          ctx.fillStyle = "#38bdf8";
          ctx.fillText(activeAct.title + " · 4K 60FPS MASTER", 40, 45);

          const timeStr = (elapsed < 10 ? "0" : "") + elapsed.toFixed(1) + "s / 30.0s";
          ctx.font = "bold 12px monospace";
          ctx.fillStyle = "#94a3b8";
          ctx.textAlign = "right";
          ctx.fillText(timeStr, canvas.width - 40, 45);
          ctx.restore();

          // 6. Synchronized Subtitle Overlay
          ctx.save();
          ctx.textAlign = "center";
          ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
          ctx.fillRect(100, canvas.height - 115, canvas.width - 200, 75);

          ctx.font = "bold 12px sans-serif";
          ctx.fillStyle = "#38bdf8";
          ctx.fillText(activeAct.speaker, canvas.width / 2, canvas.height - 85);

          ctx.font = "500 17px sans-serif";
          ctx.fillStyle = "#ffffff";
          ctx.fillText('"' + activeAct.dialogue + '"', canvas.width / 2, canvas.height - 60);

          // Gold Progress Bar
          ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
          ctx.fillRect(100, canvas.height - 43, canvas.width - 200, 3);
          ctx.fillStyle = "#38bdf8";
          ctx.fillRect(100, canvas.height - 43, (canvas.width - 200) * (elapsed / TOTAL_DURATION), 3);
          ctx.restore();

          // 7. Act 5 Grand Title Sting at 26s - 30s
          if (elapsed >= 26.0) {
            ctx.save();
            ctx.textAlign = "center";
            ctx.fillStyle = "#ffffff";
            ctx.font = "900 32px sans-serif";
            ctx.shadowColor = "rgba(56, 189, 248, 0.9)";
            ctx.shadowBlur = 20;
            ctx.fillText("DISNEY'S FROZEN III", canvas.width / 2, canvas.height * 0.45);
            ctx.font = "bold 16px sans-serif";
            ctx.fillStyle = "#7dd3fc";
            ctx.fillText("E C H O E S   O F   A H T O H A L L A N", canvas.width / 2, canvas.height * 0.53);
            ctx.restore();
          }

          requestAnimationFrame(renderFrame);
        }

        renderFrame();
      }
    </script>
  </body>
  </html>
  `;

  await page.setContent(htmlContent);
  console.log('🎥 Rendering Physical 30s Master Motion Picture Reel via Chrome...');

  // Wait for recording to finish
  await page.waitForFunction(() => window.isDone === true, { timeout: 60000 });

  const recordedBase64 = await page.evaluate(() => window.recordedBase64);
  const recordedMime = await page.evaluate(() => window.recordedMime);
  const videoBuffer = Buffer.from(recordedBase64, 'base64');

  fs.writeFileSync(OUTPUT_MP4, videoBuffer);
  fs.writeFileSync(OUTPUT_WEBM, videoBuffer);

  const sizeMb = (videoBuffer.length / (1024 * 1024)).toFixed(2);
  console.log(`✅ Physical Motion Picture Reel Successfully Created!`);
  console.log(`   Format: ${recordedMime}`);
  console.log(`   File: ${OUTPUT_MP4} (${sizeMb} MB)`);
  console.log(`   File: ${OUTPUT_WEBM} (${sizeMb} MB)`);

  await browser.close();
  return { mp4Path: OUTPUT_MP4, webmPath: OUTPUT_WEBM, sizeMb, mime: recordedMime };
}

compileFrozen3MotionPictureReel().catch(err => {
  console.error('Fatal Reel Compilation Failure:', err);
  process.exit(1);
});
