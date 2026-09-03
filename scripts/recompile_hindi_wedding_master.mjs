import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  const outputFilePath = path.resolve(process.cwd(), 'public/assets/video/hindi_wedding/hindi_wedding_music_video_32s_master.mp4');
  console.log(`🎬 Compiling Master Continuous Hindi Wedding Reel: ${outputFilePath}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--disable-web-security',
      '--autoplay-policy=no-user-gesture-required'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    const writeStream = fs.createWriteStream(outputFilePath);
    let totalBytesWritten = 0;

    await page.exposeFunction('nodeWriteChunk', (base64Chunk) => {
      const buf = Buffer.from(base64Chunk, 'base64');
      writeStream.write(buf);
      totalBytesWritten += buf.length;
    });

    await page.goto('http://127.0.0.1:3000', { waitUntil: 'domcontentloaded' });

    const videoUrls = [
      'http://127.0.0.1:3000/assets/video/hindi_wedding/hindi_wedding_act1_sangeet_entry.mp4',
      'http://127.0.0.1:3000/assets/video/hindi_wedding/hindi_wedding_act2_baraat_dhol.mp4',
      'http://127.0.0.1:3000/assets/video/hindi_wedding/hindi_wedding_act3_couple_dance.mp4',
      'http://127.0.0.1:3000/assets/video/hindi_wedding/hindi_wedding_act4_grand_finale.mp4'
    ];
    const bgAudioUrl = 'http://127.0.0.1:3000/assets/audio/hindi_wedding_solo_vocals.wav';

    const res = await page.evaluate(async (videos, audioSrc) => {
      return new Promise(async (resolve, reject) => {
        try {
          const w = 1280;
          const h = 720;
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          document.body.appendChild(canvas);

          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const dest = audioCtx.createMediaStreamDestination();

          const audioEl = document.createElement('audio');
          audioEl.src = audioSrc;
          audioEl.crossOrigin = 'anonymous';
          const source = audioCtx.createMediaElementSource(audioEl);
          source.connect(dest);
          source.connect(audioCtx.destination);

          await new Promise((res) => {
            audioEl.oncanplaythrough = () => res();
            audioEl.onerror = () => res();
            audioEl.load();
          });
          audioEl.play().catch(() => {});

          const canvasStream = canvas.captureStream(30);
          const tracks = [...canvasStream.getVideoTracks(), ...dest.stream.getAudioTracks()];
          const stream = new MediaStream(tracks);

          let mimeType = 'video/mp4;codecs=avc1,mp4a.40.2';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/webm;codecs=vp9,opus';
          }
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/webm';
          }

          const recorder = new MediaRecorder(stream, {
            mimeType,
            videoBitsPerSecond: 12000000
          });

          recorder.ondataavailable = async (e) => {
            if (e.data && e.data.size > 0) {
              const arrayBuf = await e.data.arrayBuffer();
              const base64 = btoa(
                new Uint8Array(arrayBuf).reduce((data, byte) => data + String.fromCharCode(byte), '')
              );
              await window.nodeWriteChunk(base64);
            }
          };

          recorder.onstop = () => {
            resolve({ success: true });
          };

          recorder.start(250);

          for (let i = 0; i < videos.length; i++) {
            const url = videos[i];
            const video = document.createElement('video');
            video.src = url;
            video.muted = true;
            video.playsInline = true;
            video.crossOrigin = 'anonymous';

            await new Promise((res, rej) => {
              video.onloadeddata = () => res();
              video.onerror = (err) => rej(err);
              video.load();
            });

            await video.play();

            await new Promise((res) => {
              function draw() {
                if (!video.ended && !video.paused) {
                  ctx.drawImage(video, 0, 0, w, h);
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
    }, videoUrls, bgAudioUrl);

    await sleep(1500);
    writeStream.end();

    console.log(`✅ Master Continuous Reel Created: ${outputFilePath} (${(totalBytesWritten / 1024 / 1024).toFixed(2)} MB)`);
  } catch (err) {
    console.error('Compilation failed:', err);
  } finally {
    await browser.close();
  }
}

main();
