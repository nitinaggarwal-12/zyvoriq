import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';

const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/) || envContent.match(/GOOGLE_API_KEY=([^\r\n]+)/);
if (!match) {
  console.error('❌ No GEMINI_API_KEY found in .env.local');
  process.exit(1);
}
const apiKey = match[1].trim();

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT_DIR = path.resolve(process.cwd(), 'public/assets/video/continuous');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const REEL_STORIES = [
  // ==========================================
  // 1. ANIMATION: 3D Pixar Kids Adventure (32s)
  // ==========================================
  {
    category: 'ANIMATION',
    name: '3D Pixar Robot Wonder',
    masterFileName: 'animation_pixar_32s_master.mp4',
    aspectRatio: '16:9',
    acts: [
      {
        act: 1,
        fileName: 'anim_pixar_act1_awakening.mp4',
        prompt: 'Pixar 3D animated movie scene of a charming little turquoise robot with big glowing expressive blue glass eyes waking up inside a cozy steampunk workshop filled with whirring brass gears and golden dust motes, picking up a glowing golden compass, Disney Pixar 3D render, 24fps motion'
      },
      {
        act: 2,
        fileName: 'anim_pixar_act2_portal.mp4',
        prompt: 'Pixar 3D animated movie scene of the same turquoise robot with glowing blue eyes stepping through a swirling magical crystal portal into an enchanted bioluminescent rainforest with giant floating neon blue mushrooms, Disney Pixar 3D render, 24fps motion'
      },
      {
        act: 3,
        fileName: 'anim_pixar_act3_fox.mp4',
        prompt: 'Pixar 3D animated movie scene of the turquoise robot happily greeting a fluffy glowing golden spirit fox, walking together across an ancient crystal bridge above a sparkling waterfall, Disney Pixar 3D render, 24fps motion'
      },
      {
        act: 4,
        fileName: 'anim_pixar_act4_sun_core.mp4',
        prompt: 'Pixar 3D animated movie scene of the turquoise robot and the glowing fox placing the golden compass into a magnificent ancient sun altar, unleashing a wave of warm golden light across the fantasy kingdom, joyful triumphant celebration, Disney Pixar 3D render, 24fps motion'
      }
    ]
  },

  // ==========================================
  // 2. ANIMATION: Shonen Anime Epic Sakuga (32s)
  // ==========================================
  {
    category: 'ANIMATION',
    name: 'Shonen Anime Lightning Blade',
    masterFileName: 'animation_anime_32s_master.mp4',
    aspectRatio: '16:9',
    acts: [
      {
        act: 1,
        fileName: 'anim_anime_act1_stance.mp4',
        prompt: 'High-end Ufotable anime scene of a young spiky dark-haired samurai in a flowing white haori drawing a glowing celestial katana under swirling cherry blossom petals at sunset, intense focused purple eyes, 24fps anime sakuga'
      },
      {
        act: 2,
        fileName: 'anim_anime_act2_dash.mp4',
        prompt: 'High-end Ufotable anime scene of the same samurai dashing forward at lightning speed through a serene bamboo forest temple, electric blue sparks and wind pressure waves erupting behind his footsteps, dynamic camera tracking, 24fps anime sakuga'
      },
      {
        act: 3,
        fileName: 'anim_anime_act3_dragon.mp4',
        prompt: 'High-end Ufotable anime scene of the samurai leaping into the sky, unleashing a colossal roaring azure lightning dragon blade slash that splits dark storm clouds in half, breathtaking visual effects, 24fps anime sakuga'
      },
      {
        act: 4,
        fileName: 'anim_anime_act4_victory.mp4',
        prompt: 'High-end Ufotable anime scene of the samurai landing gracefully on a rooftop, smoothly sheathing his smoking lightning blade with a calm confident smirk as the evening sun breaks through the parted storm clouds, 24fps anime sakuga'
      }
    ]
  },

  // ==========================================
  // 3. REAL PEOPLE: Viral Tech Influencer (32s)
  // ==========================================
  {
    category: 'REAL_PEOPLE',
    name: 'Viral Tech Creator Reel',
    masterFileName: 'real_people_influencer_32s_master.mp4',
    aspectRatio: '9:16',
    acts: [
      {
        act: 1,
        fileName: 'real_influencer_act1_hook.mp4',
        prompt: 'Cinematic 9:16 vertical video of a charismatic young male tech influencer in a sleek black hoodie greeting the camera enthusiastically in a modern RGB-lit studio, holding up a mysterious glowing translucent cyber gadget, expressive facial motion, 24fps photorealistic'
      },
      {
        act: 2,
        fileName: 'real_influencer_act2_demo.mp4',
        prompt: 'Cinematic 9:16 vertical video of the same tech influencer in black hoodie demonstrating the device on camera, smiling and talking animatedly with natural hand gestures as glowing holographic UI interfaces float seamlessly around him, 24fps photorealistic'
      },
      {
        act: 3,
        fileName: 'real_influencer_act3_reaction.mp4',
        prompt: 'Cinematic 9:16 vertical close-up POV video of the tech influencer testing the device, widening his eyes in genuine amazement and nodding enthusiastically to the camera with high authentic energy, 24fps photorealistic'
      },
      {
        act: 4,
        fileName: 'real_influencer_act4_cta.mp4',
        prompt: 'Cinematic 9:16 vertical video of the tech influencer delivering a confident concluding call-to-action directly to camera, smiling warmly and pointing towards the viewer with charismatic creator presence, 24fps photorealistic'
      }
    ]
  },

  // ==========================================
  // 4. REAL PEOPLE: Luxury E-Commerce UGC (24s)
  // ==========================================
  {
    category: 'REAL_PEOPLE',
    name: 'Luxury Skincare UGC Ad',
    masterFileName: 'real_people_ugc_24s_master.mp4',
    aspectRatio: '9:16',
    acts: [
      {
        act: 1,
        fileName: 'real_ugc_act1_unboxing.mp4',
        prompt: 'Authentic 9:16 vertical smartphone POV video of an elegant young woman in a sunlit white marble bathroom opening a luxury frosted glass cosmetic serum bottle with a warm genuine smile, clean aesthetic UGC ad lighting, 24fps'
      },
      {
        act: 2,
        fileName: 'real_ugc_act2_application.mp4',
        prompt: 'Authentic 9:16 vertical video of the young woman gently applying a glowing droplet of golden facial serum to her cheek with a glass dropper and softly massaging it into radiant dewy skin, smiling in mirror, 24fps'
      },
      {
        act: 3,
        fileName: 'real_ugc_act3_glow.mp4',
        prompt: 'Authentic 9:16 vertical hero shot of the young woman holding the luxury serum bottle next to her glowing radiant face, smiling with radiant confidence in golden hour sunlight, 24fps'
      }
    ]
  },

  // ==========================================
  // 5. REAL PEOPLE: 35mm Arthouse Cinema Noir (32s)
  // ==========================================
  {
    category: 'REAL_PEOPLE',
    name: '35mm Arthouse Cinema Noir',
    masterFileName: 'real_people_noir_32s_master.mp4',
    aspectRatio: '16:9',
    acts: [
      {
        act: 1,
        fileName: 'real_noir_act1_rain.mp4',
        prompt: 'Arthouse cinema 35mm film scene of a solitary weary detective in a dark wool trenchcoat walking down a rain-soaked neon alley at midnight, reflections of buzzing red neon signs in rain puddles, anamorphic lens flare, Kodak 35mm grain, A24 aesthetic, 24fps'
      },
      {
        act: 2,
        fileName: 'real_noir_act2_match.mp4',
        prompt: 'Arthouse cinema 35mm film medium shot of the same detective in trenchcoat leaning against a wet brick wall under an awning, striking a match that illuminates his weathered face and swirling smoke in the shadows, 35mm film grain, 24fps'
      },
      {
        act: 3,
        fileName: 'real_noir_act3_lookout.mp4',
        prompt: 'Arthouse cinema 35mm film shot of the detective looking across the street through heavy falling rain as a vintage black sedan slowly glides past with glowing amber headlights, cinematic tension, 35mm film grain, 24fps'
      },
      {
        act: 4,
        fileName: 'real_noir_act4_resolve.mp4',
        prompt: 'Arthouse cinema 35mm film close-up of the detective adjusting his fedora brim and stepping purposefully forward into the rain as the streetlamp light catches his determined eyes, atmospheric moody cinematic masterpiece, 35mm grain, 24fps'
      }
    ]
  }
];

async function generateVeoAct(actItem, aspectRatio) {
  const filePath = path.join(OUTPUT_DIR, actItem.fileName);
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 500000) {
    console.log(`   ⏭️ Act already generated (${(fs.statSync(filePath).size / 1024 / 1024).toFixed(2)} MB): ${actItem.fileName}`);
    return filePath;
  }

  console.log(`\n🎬 [Google Veo 3.1 Act ${actItem.act}] Dispatching 8-second generation...`);
  console.log(`   File:   ${actItem.fileName}`);
  console.log(`   Prompt: "${actItem.prompt}"`);

  const model = 'veo-3.1-fast-generate-preview';
  const payload = {
    instances: [{ prompt: actItem.prompt }],
    parameters: {
      aspectRatio: aspectRatio,
      durationSeconds: 8
    }
  };

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:predictLongRunning?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.error) {
      console.warn(`   ❌ Veo Dispatch Error:`, data.error.message || data.error);
      return null;
    }

    const opName = data.name;
    console.log(`   ⏳ Veo TPU Operation: ${opName}`);

    for (let poll = 1; poll <= 30; poll++) {
      await sleep(5000);
      const pollRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${opName}?key=${apiKey}`);
      const pollData = await pollRes.json();

      if (poll % 2 === 0 || pollData.done) {
        console.log(`   [Poll ${poll}/30] Elapsed: ${poll * 5}s, Done: ${!!pollData.done}`);
      }

      if (pollData.done) {
        if (pollData.error) {
          console.warn(`   ❌ Render Error:`, pollData.error.message || pollData.error);
          return null;
        }

        const videoUri = pollData.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
        if (videoUri) {
          console.log(`   🎉 Downloading genuine Veo 3.1 8s MP4 stream...`);
          const dl = await fetch(`${videoUri}&key=${apiKey}`);
          const buf = Buffer.from(await dl.arrayBuffer());
          fs.writeFileSync(filePath, buf);
          console.log(`   ✅ Saved Act ${actItem.act}: ${actItem.fileName} (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);
          return filePath;
        }
      }
    }
  } catch (err) {
    console.error(`   ❌ Exception:`, err.message);
  }
  return null;
}

async function stitchReelWithChrome(actFilePaths, masterFilePath, width, height) {
  console.log(`\n🎞️ Stitching ${actFilePaths.length} continuous acts into Master: ${path.basename(masterFilePath)} using signed Google Chrome...`);
  
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--disable-web-security',
      '--allow-file-access-from-files',
      '--autoplay-policy=no-user-gesture-required'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height });

    const actFileUrls = actFilePaths.map(p => `file://${p}`);

    const stitchedBase64 = await page.evaluate(async (videoUrls, w, h) => {
      return new Promise(async (resolve, reject) => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          document.body.appendChild(canvas);

          const stream = canvas.captureStream(30);
          const recordedChunks = [];
          
          let mimeType = 'video/webm;codecs=vp9';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/webm';
          }

          const recorder = new MediaRecorder(stream, {
            mimeType,
            videoBitsPerSecond: 10000000
          });

          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              recordedChunks.push(e.data);
            }
          };

          recorder.onstop = async () => {
            const blob = new Blob(recordedChunks, { type: mimeType });
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(reader.result.split(',')[1]);
            };
            reader.readAsDataURL(blob);
          };

          recorder.start(100);

          for (let i = 0; i < videoUrls.length; i++) {
            const url = videoUrls[i];
            const video = document.createElement('video');
            video.src = url;
            video.muted = true;
            video.playsInline = true;
            video.crossOrigin = 'anonymous';

            await new Promise((res, rej) => {
              video.onloadeddata = () => res();
              video.onerror = (e) => rej(e);
              video.load();
            });

            await video.play();

            await new Promise((res) => {
              function drawFrame() {
                if (!video.ended && !video.paused) {
                  ctx.drawImage(video, 0, 0, w, h);
                  requestAnimationFrame(drawFrame);
                } else {
                  ctx.drawImage(video, 0, 0, w, h);
                  res();
                }
              }
              video.onended = () => {
                ctx.drawImage(video, 0, 0, w, h);
                res();
              };
              drawFrame();
            });
          }

          recorder.stop();
        } catch (err) {
          reject(err.message || String(err));
        }
      });
    }, actFileUrls, width, height);

    const masterBuf = Buffer.from(stitchedBase64, 'base64');
    fs.writeFileSync(masterFilePath, masterBuf);
    console.log(`✅ Master Continuous Reel Stitched: ${path.basename(masterFilePath)} (${(masterBuf.length / 1024 / 1024).toFixed(2)} MB)`);
    return masterFilePath;
  } catch (err) {
    console.error(`❌ Stitching failed:`, err.message);
    return null;
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('========================================================================');
  console.log('🚀 GENERATING BIGGER CONTINUOUS REELS: ANIMATION & REAL PEOPLE');
  console.log('   Signed Google Chrome + Google DeepMind Veo 3.1 (8s Sequential Acts)');
  console.log('========================================================================');

  const generatedReels = [];

  for (const story of REEL_STORIES) {
    console.log(`\n========================================================================`);
    console.log(`🎯 [${story.category}] Story: "${story.name}" (${story.acts.length} Continuous Acts = ${story.acts.length * 8}s)`);
    console.log(`   Aspect Ratio: ${story.aspectRatio} | Target Master: ${story.masterFileName}`);
    console.log(`========================================================================`);

    const actFiles = [];
    for (const act of story.acts) {
      const actFile = await generateVeoAct(act, story.aspectRatio);
      if (actFile) {
        actFiles.push(actFile);
      }
      await sleep(2000);
    }

    if (actFiles.length === story.acts.length) {
      const isVertical = story.aspectRatio === '9:16';
      const w = isVertical ? 720 : 1280;
      const h = isVertical ? 1280 : 720;
      const masterPath = path.join(OUTPUT_DIR, story.masterFileName);

      await stitchReelWithChrome(actFiles, masterPath, w, h);

      generatedReels.push({
        name: story.name,
        category: story.category,
        actsCount: actFiles.length,
        totalDuration: `${actFiles.length * 8}s`,
        aspectRatio: story.aspectRatio,
        masterPath,
        actFiles
      });
    } else {
      console.warn(`⚠️ Partial acts generated for ${story.name} (${actFiles.length}/${story.acts.length})`);
    }
  }

  console.log('\n========================================================================');
  console.log('📊 BIGGER CONTINUOUS REELS GENERATION SUMMARY:');
  console.log('========================================================================');
  for (const reel of generatedReels) {
    console.log(`✨ [${reel.category}] ${reel.name} (${reel.totalDuration}, ${reel.aspectRatio})`);
    console.log(`   Master File: ${reel.masterPath} (${(fs.statSync(reel.masterPath).size / 1024 / 1024).toFixed(2)} MB)`);
    console.log(`   Acts: ${reel.actFiles.map(f => path.basename(f)).join(' ➔ ')}`);
  }
  console.log('========================================================================');
}

main().catch(console.error);
