import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function compileContinuousMaster(inputVideoUrls, audioUrl, outputFilePath, width = 1280, height = 720, title = "Master Continuous Reel") {
  console.log(`\n========================================================================`);
  console.log(`🎬 Compiling Master Continuous Reel: ${path.basename(outputFilePath)}`);
  console.log(`   Resolution: ${width}x${height} | Acts: ${inputVideoUrls.length}`);
  console.log(`========================================================================`);

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
    await page.setViewport({ width, height });

    // Stream recorded chunks directly to disk via exposed Node function
    const writeStream = fs.createWriteStream(outputFilePath);
    let totalBytesWritten = 0;

    await page.exposeFunction('nodeWriteChunk', (base64Chunk) => {
      const buf = Buffer.from(base64Chunk, 'base64');
      writeStream.write(buf);
      totalBytesWritten += buf.length;
    });

    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

    const result = await page.evaluate(async (videoUrls, bgAudioUrl, w, h) => {
      return new Promise(async (resolve, reject) => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          document.body.appendChild(canvas);

          // Audio Context setup
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const dest = audioCtx.createMediaStreamDestination();

          // Load background vocal audio
          if (bgAudioUrl) {
            const audioEl = document.createElement('audio');
            audioEl.src = bgAudioUrl;
            audioEl.crossOrigin = 'anonymous';
            const source = audioCtx.createMediaElementSource(audioEl);
            source.connect(dest);
            source.connect(audioCtx.destination);
            await new Promise((res) => {
              audioEl.oncanplaythrough = () => res();
              audioEl.onerror = () => res(); // continue even if audio fails
              audioEl.load();
            });
            audioEl.play().catch(() => {});
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

          // Sequentially play each act video and render to canvas
          for (let i = 0; i < videoUrls.length; i++) {
            const url = videoUrls[i];
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
    }, inputVideoUrls, audioUrl, width, height);

    await sleep(1000);
    writeStream.end();

    console.log(`✅ Master Continuous Reel Created: ${outputFilePath} (${(totalBytesWritten / 1024 / 1024).toFixed(2)} MB)`);
    return outputFilePath;
  } catch (err) {
    console.error(`❌ Compilation Error:`, err);
    return null;
  } finally {
    await browser.close();
  }
}

async function main() {
  // 1. Compile Grand Hindi Wedding Continuous Master (32s)
  const weddingActs = [
    'http://localhost:3000/assets/video/hindi_wedding/hindi_wedding_act1_sangeet_entry.mp4',
    'http://localhost:3000/assets/video/hindi_wedding/hindi_wedding_act2_baraat_dhol.mp4',
    'http://localhost:3000/assets/video/hindi_wedding/hindi_wedding_act3_couple_dance.mp4',
    'http://localhost:3000/assets/video/hindi_wedding/hindi_wedding_act4_grand_finale.mp4'
  ];
  const hindiAudio = 'http://localhost:3000/assets/audio/hindi_wedding_superhit_vocals.wav';
  const weddingOut = path.resolve(process.cwd(), 'public/assets/video/hindi_wedding/hindi_wedding_music_video_32s_master.mp4');

  await compileContinuousMaster(weddingActs, hindiAudio, weddingOut, 1280, 720, "Hindi Wedding Master");

  // 2. Compile 3D Pixar Continuous Master (32s)
  const pixarActs = [
    'http://localhost:3000/assets/video/continuous/anim_pixar_act1_awakening.mp4',
    'http://localhost:3000/assets/video/continuous/anim_pixar_act2_portal.mp4',
    'http://localhost:3000/assets/video/continuous/anim_pixar_act3_fox.mp4',
    'http://localhost:3000/assets/video/continuous/anim_pixar_act4_sun_core.mp4'
  ];
  const pixarOut = path.resolve(process.cwd(), 'public/assets/video/continuous/animation_pixar_32s_master.mp4');
  await compileContinuousMaster(pixarActs, null, pixarOut, 1280, 720, "3D Pixar Master");

  // 3. Compile Shonen Anime Continuous Master (32s)
  const animeActs = [
    'http://localhost:3000/assets/video/continuous/anim_anime_act1_stance.mp4',
    'http://localhost:3000/assets/video/continuous/anim_anime_act2_dash.mp4',
    'http://localhost:3000/assets/video/continuous/anim_anime_act3_dragon.mp4',
    'http://localhost:3000/assets/video/continuous/anim_anime_act4_victory.mp4'
  ];
  const animeOut = path.resolve(process.cwd(), 'public/assets/video/continuous/animation_anime_32s_master.mp4');
  await compileContinuousMaster(animeActs, null, animeOut, 1280, 720, "Shonen Anime Master");

  // 4. Compile Viral Tech Influencer Continuous Master (32s, 9:16)
  const influencerActs = [
    'http://localhost:3000/assets/video/continuous/real_influencer_act1_hook.mp4',
    'http://localhost:3000/assets/video/continuous/real_influencer_act2_demo.mp4',
    'http://localhost:3000/assets/video/continuous/real_influencer_act3_reaction.mp4',
    'http://localhost:3000/assets/video/continuous/real_influencer_act4_cta.mp4'
  ];
  const influencerOut = path.resolve(process.cwd(), 'public/assets/video/continuous/real_people_influencer_32s_master.mp4');
  await compileContinuousMaster(influencerActs, null, influencerOut, 720, 1280, "Tech Influencer Master");

  // 5. Compile 35mm Arthouse Noir Continuous Master (32s)
  const noirActs = [
    'http://localhost:3000/assets/video/continuous/real_noir_act1_rain.mp4',
    'http://localhost:3000/assets/video/continuous/real_noir_act2_match.mp4',
    'http://localhost:3000/assets/video/continuous/real_noir_act3_lookout.mp4',
    'http://localhost:3000/assets/video/continuous/real_noir_act4_resolve.mp4'
  ];
  const noirOut = path.resolve(process.cwd(), 'public/assets/video/continuous/real_people_noir_32s_master.mp4');
  await compileContinuousMaster(noirActs, null, noirOut, 1280, 720, "Cinema Noir Master");
}

main().catch(console.error);
