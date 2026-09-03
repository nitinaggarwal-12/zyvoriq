import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export async function stitchVideos(videoFilePaths, outputMasterPath, width = 1280, height = 720, lyrics = []) {
  console.log(`\n🎞️ Stitching ${videoFilePaths.length} videos into ${path.basename(outputMasterPath)} (${width}x${height})...`);

  // Read video files into base64 data URIs so they load instantly in Chrome with zero CORS/file access issues
  const videoDataUris = videoFilePaths.map(filePath => {
    const buf = fs.readFileSync(filePath);
    return `data:video/mp4;base64,${buf.toString('base64')}`;
  });

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height });

    const resultBase64 = await page.evaluate(async (dataUris, w, h, lyricsData) => {
      return new Promise(async (resolve, reject) => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          document.body.appendChild(canvas);

          // Web Audio Context for soundtrack
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const dest = audioCtx.createMediaStreamDestination();

          // Harmonic Bollywood / Cinematic Musical Bed
          for (let t = 0; t < 32; t += 4) {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(220 + (t % 8) * 20, audioCtx.currentTime + t);
            gain.gain.setValueAtTime(0.08, audioCtx.currentTime + t);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + t + 3.8);
            osc.connect(gain);
            gain.connect(dest);
            osc.start(audioCtx.currentTime + t);
            osc.stop(audioCtx.currentTime + t + 4);
          }

          const canvasStream = canvas.captureStream(30);
          const tracks = [...canvasStream.getVideoTracks(), ...dest.stream.getAudioTracks()];
          const stream = new MediaStream(tracks);

          let mimeType = 'video/webm;codecs=vp9,opus';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/webm';
          }

          const recorder = new MediaRecorder(stream, {
            mimeType,
            videoBitsPerSecond: 10000000
          });

          const chunks = [];
          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) chunks.push(e.data);
          };

          recorder.onstop = async () => {
            const blob = new Blob(chunks, { type: mimeType });
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(reader.result.split(',')[1]);
            };
            reader.readAsDataURL(blob);
          };

          recorder.start(100);

          for (let i = 0; i < dataUris.length; i++) {
            const uri = dataUris[i];
            const lyr = lyricsData[i] || null;
            const video = document.createElement('video');
            video.src = uri;
            video.muted = true;
            video.playsInline = true;

            await new Promise((res, rej) => {
              video.onloadeddata = () => res();
              video.onerror = (e) => rej(e);
              video.load();
            });

            await video.play();

            await new Promise((res) => {
              function draw() {
                if (!video.ended && !video.paused) {
                  ctx.drawImage(video, 0, 0, w, h);

                  if (lyr) {
                    ctx.save();
                    const grad = ctx.createLinearGradient(0, h - 140, 0, h);
                    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
                    grad.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
                    ctx.fillStyle = grad;
                    ctx.fillRect(0, h - 140, w, 140);

                    ctx.font = 'bold 28px "Noto Sans Devanagari", "Segoe UI", sans-serif';
                    ctx.fillStyle = '#FFD700';
                    ctx.textAlign = 'center';
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
                    ctx.shadowBlur = 10;
                    ctx.fillText(lyr.hindi, w / 2, h - 70);

                    ctx.font = '500 20px "Segoe UI", sans-serif';
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillText(`🎵 ${lyr.roman}`, w / 2, h - 35);
                    ctx.restore();
                  }

                  requestAnimationFrame(draw);
                } else {
                  ctx.drawImage(video, 0, 0, w, h);
                  res();
                }
              }
              video.onended = () => {
                ctx.drawImage(video, 0, 0, w, h);
                res();
              };
              draw();
            });
          }

          recorder.stop();
        } catch (err) {
          reject(err.message || String(err));
        }
      });
    }, videoDataUris, width, height, lyrics);

    const buf = Buffer.from(resultBase64, 'base64');
    fs.writeFileSync(outputMasterPath, buf);
    console.log(`✅ Successfully Stitched Master: ${outputMasterPath} (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);
    return outputMasterPath;
  } catch (err) {
    console.error(`❌ Stitching error:`, err);
    return null;
  } finally {
    await browser.close();
  }
}

// Test with Pixar acts if available
const pixarActs = [
  'public/assets/video/continuous/anim_pixar_act1_awakening.mp4',
  'public/assets/video/continuous/anim_pixar_act2_portal.mp4',
  'public/assets/video/continuous/anim_pixar_act3_fox.mp4',
  'public/assets/video/continuous/anim_pixar_act4_sun_core.mp4'
].map(p => path.resolve(process.cwd(), p));

if (pixarActs.every(f => fs.existsSync(f))) {
  const masterOut = path.resolve(process.cwd(), 'public/assets/video/continuous/animation_pixar_32s_master.mp4');
  stitchVideos(pixarActs, masterOut, 1280, 720);
}
