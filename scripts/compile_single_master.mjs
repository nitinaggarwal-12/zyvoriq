import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function compileMaster(videoUrls, audioUrl, outPath, w = 1280, h = 720) {
  console.log(`🎬 Compiling: ${path.basename(outPath)} (${videoUrls.length} acts)...`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--autoplay-policy=no-user-gesture-required']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: h });

    const chunks = [];
    await page.exposeFunction('saveChunk', (b64) => {
      chunks.push(Buffer.from(b64, 'base64'));
    });

    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

    await page.evaluate(async (urls, bgAudio, width, height) => {
      return new Promise(async (resolve, reject) => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          document.body.appendChild(canvas);

          const stream = canvas.captureStream(30);
          const recorder = new MediaRecorder(stream, {
            mimeType: 'video/webm',
            videoBitsPerSecond: 10000000
          });

          recorder.ondataavailable = async (e) => {
            if (e.data && e.data.size > 0) {
              const arrayBuf = await e.data.arrayBuffer();
              const b64 = btoa(
                new Uint8Array(arrayBuf).reduce((d, b) => d + String.fromCharCode(b), '')
              );
              await window.saveChunk(b64);
            }
          };

          recorder.onstop = () => resolve();
          recorder.start(100);

          for (const url of urls) {
            const video = document.createElement('video');
            video.src = url;
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
                  ctx.drawImage(video, 0, 0, width, height);
                  requestAnimationFrame(draw);
                } else {
                  ctx.drawImage(video, 0, 0, width, height);
                  res();
                }
              }
              video.onended = () => {
                ctx.drawImage(video, 0, 0, width, height);
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
    }, videoUrls, audioUrl, w, h);

    await sleep(800);
    const finalBuffer = Buffer.concat(chunks);
    fs.writeFileSync(outPath, finalBuffer);
    console.log(`✅ Finished: ${path.basename(outPath)} (${(finalBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
    return outPath;
  } catch (err) {
    console.error(`❌ Failed:`, err);
    return null;
  } finally {
    await browser.close();
  }
}

async function runAll() {
  // 1. 3D Pixar Master (32s)
  await compileMaster([
    'http://localhost:3000/assets/video/continuous/anim_pixar_act1_awakening.mp4',
    'http://localhost:3000/assets/video/continuous/anim_pixar_act2_portal.mp4',
    'http://localhost:3000/assets/video/continuous/anim_pixar_act3_fox.mp4',
    'http://localhost:3000/assets/video/continuous/anim_pixar_act4_sun_core.mp4'
  ], null, path.resolve('public/assets/video/continuous/animation_pixar_32s_master.mp4'), 1280, 720);

  // 2. Shonen Anime Master (32s)
  await compileMaster([
    'http://localhost:3000/assets/video/continuous/anim_anime_act1_stance.mp4',
    'http://localhost:3000/assets/video/continuous/anim_anime_act2_dash.mp4',
    'http://localhost:3000/assets/video/continuous/anim_anime_act3_dragon.mp4',
    'http://localhost:3000/assets/video/continuous/anim_anime_act4_victory.mp4'
  ], null, path.resolve('public/assets/video/continuous/animation_anime_32s_master.mp4'), 1280, 720);

  // 3. Tech Influencer Master (32s, 9:16)
  await compileMaster([
    'http://localhost:3000/assets/video/continuous/real_influencer_act1_hook.mp4',
    'http://localhost:3000/assets/video/continuous/real_influencer_act2_demo.mp4',
    'http://localhost:3000/assets/video/continuous/real_influencer_act3_reaction.mp4',
    'http://localhost:3000/assets/video/continuous/real_influencer_act4_cta.mp4'
  ], null, path.resolve('public/assets/video/continuous/real_people_influencer_32s_master.mp4'), 720, 1280);

  // 4. Cinema Noir Master (32s)
  await compileMaster([
    'http://localhost:3000/assets/video/continuous/real_noir_act1_rain.mp4',
    'http://localhost:3000/assets/video/continuous/real_noir_act2_match.mp4',
    'http://localhost:3000/assets/video/continuous/real_noir_act3_lookout.mp4',
    'http://localhost:3000/assets/video/continuous/real_noir_act4_resolve.mp4'
  ], null, path.resolve('public/assets/video/continuous/real_people_noir_32s_master.mp4'), 1280, 720);
}

runAll().catch(console.error);
