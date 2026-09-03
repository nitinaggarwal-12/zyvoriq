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
const OUTPUT_DIR = path.resolve(process.cwd(), 'public/assets/video/hindi_wedding');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const WEDDING_ACTS = [
  {
    act: 1,
    name: 'The Grand Sangeet Entry & Palace Courtyard',
    fileName: 'hindi_wedding_act1_sangeet_entry.mp4',
    prompt: 'Cinematic 4K Bollywood movie scene of a grand royal Indian palace courtyard illuminated by thousands of glowing diyas, hanging crystal chandeliers, and marigold floral arches. A beautiful Indian bride in a dazzling crimson and gold zardozi lehenga dancing joyfully with her cheerful bridesmaids and mother, surrounded by smiling family members in colorful silk sarees clapping happily to upbeat music, 24fps motion picture',
    lyrics: {
      hindi: 'ढोल बजे, शहनाई गूंजे, खुशियों की ये रात है',
      roman: 'Dhol baje, shehnai goonje, khushiyon ki ye raat hai',
      meaning: 'Drums beat, shehnai echoes, tonight is the night of pure joy'
    }
  },
  {
    act: 2,
    name: 'The Groom Baraat & High-Energy Dhol Beats',
    fileName: 'hindi_wedding_act2_baraat_dhol.mp4',
    prompt: 'Cinematic 4K Bollywood movie scene of a handsome Indian groom in an embroidered ivory and gold royal sherwani with a crimson safa turban, enthusiastically dancing Bhangra steps with his excited brothers, cousins, and joyful father, surrounded by traditional Punjabi Dhol drummers playing with passion under raining rose petals and glowing golden sparklers, 24fps motion picture',
    lyrics: {
      hindi: 'सारे रिश्तेदार नाचें, दिल में बस गई बात है',
      roman: 'Saare rishtedaar naachein, dil mein bas gayi baat hai',
      meaning: 'All the relatives are dancing, love has settled deep in the heart'
    }
  },
  {
    act: 3,
    name: 'The Couple Center Stage Sangeet Dance',
    fileName: 'hindi_wedding_act3_couple_dance.mp4',
    prompt: 'Cinematic 4K Bollywood movie scene on a lavish illuminated palace stage adorned with white orchids and golden drapery. The bride and groom performing a romantic synchronized Bollywood dance routine with graceful twirls, while their parents, aunties, and uncles in regal bandhgalas and designer lehengas clap and dance enthusiastically in the background with genuine laughter and joy, 24fps motion picture',
    lyrics: {
      hindi: 'बल्ले बल्ले झूमे सजना, सहेलियां गाएं तराना',
      roman: 'Balle balle jhoome sajna, saheliyan gaayein taraana',
      meaning: 'The couple sways with joy, friends sing sweet melodies'
    }
  },
  {
    act: 4,
    name: 'The Grand Finale & Golden Confetti Family Celebration',
    fileName: 'hindi_wedding_act4_grand_finale.mp4',
    prompt: 'Cinematic 4K wide Bollywood blockbuster climax scene of the entire multi-generational Indian family—grandparents, parents, youth, and cheering kids—all dancing together in exuberant harmony on a magnificent royal palace terrace, golden confetti cannons blasting overhead, majestic fireworks illuminating the night sky, euphoric smiles, 24fps motion picture',
    lyrics: {
      hindi: 'आज हमारे यार का ब्याह, रंग दे सारा ज़माना!',
      roman: 'Aaj humare yaar ka byaah, rang de saara zamaana!',
      meaning: 'Today is our beloved one’s wedding, let’s color the whole universe in celebration!'
    }
  }
];

async function generateVeoAct(actItem) {
  const filePath = path.join(OUTPUT_DIR, actItem.fileName);
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 500000) {
    console.log(`   ⏭️ Act already generated (${(fs.statSync(filePath).size / 1024 / 1024).toFixed(2)} MB): ${actItem.fileName}`);
    return filePath;
  }

  console.log(`\n========================================================================`);
  console.log(`🎬 [Google Veo 3.1 Act ${actItem.act}/4] Dispatching: "${actItem.name}"`);
  console.log(`   File:   ${actItem.fileName}`);
  console.log(`   Lyrics: "${actItem.lyrics.hindi}" (${actItem.lyrics.roman})`);
  console.log(`   Prompt: "${actItem.prompt}"`);

  const model = 'veo-3.1-fast-generate-preview';
  const payload = {
    instances: [{ prompt: actItem.prompt }],
    parameters: {
      aspectRatio: '16:9',
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

async function stitchMasterWeddingMusicVideo(actFilePaths, masterFilePath, lyricsList) {
  console.log(`\n🎞️ Stitching ${actFilePaths.length} continuous acts into Master Hindi Wedding Music Video: ${path.basename(masterFilePath)}...`);
  
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
    const width = 1280;
    const height = 720;
    await page.setViewport({ width, height });

    const actFileUrls = actFilePaths.map(p => `file://${p}`);

    const stitchedBase64 = await page.evaluate(async (videoUrls, w, h, lyricsData) => {
      return new Promise(async (resolve, reject) => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          document.body.appendChild(canvas);

          // Audio Synthesizer for Superhit Bollywood Dhol & Shehnai Harmony
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const dest = audioCtx.createMediaStreamDestination();

          // Background Wedding Musical Bed (Bhangra Dhol + Sangeet Chords)
          function playBollywoodChords(time) {
            const chords = [
              [261.63, 329.63, 392.00], // C Major
              [220.00, 261.63, 329.63], // A Minor
              [174.61, 220.00, 261.63], // F Major
              [196.00, 246.94, 293.66]  // G Major
            ];
            chords.forEach((chord, idx) => {
              chord.forEach(freq => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, time + idx * 8);
                gain.gain.setValueAtTime(0.08, time + idx * 8);
                gain.gain.exponentialRampToValueAtTime(0.001, time + idx * 8 + 7.8);
                osc.connect(gain);
                gain.connect(dest);
                osc.start(time + idx * 8);
                osc.stop(time + idx * 8 + 8);
              });
            });
          }

          // Dhol beats pattern
          function triggerDholGroove(startTime, duration) {
            for (let t = 0; t < duration; t += 0.5) {
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(120, startTime + t);
              osc.frequency.exponentialRampToValueAtTime(40, startTime + t + 0.15);
              gain.gain.setValueAtTime(0.3, startTime + t);
              gain.gain.exponentialRampToValueAtTime(0.01, startTime + t + 0.18);
              osc.connect(gain);
              gain.connect(dest);
              osc.start(startTime + t);
              osc.stop(startTime + t + 0.2);
            }
          }

          playBollywoodChords(audioCtx.currentTime);
          triggerDholGroove(audioCtx.currentTime, 32);

          const canvasStream = canvas.captureStream(30);
          const combinedStream = new MediaStream([
            ...canvasStream.getVideoTracks(),
            ...dest.stream.getAudioTracks()
          ]);

          let mimeType = 'video/webm;codecs=vp9,opus';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/webm';
          }

          const recorder = new MediaRecorder(combinedStream, {
            mimeType,
            videoBitsPerSecond: 10000000
          });

          const recordedChunks = [];
          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) recordedChunks.push(e.data);
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
            const lyr = lyricsData[i];
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

                  // Render Cinematic Karaoke Subtitles
                  ctx.save();
                  // Bottom gradient overlay
                  const grad = ctx.createLinearGradient(0, h - 140, 0, h);
                  grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
                  grad.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
                  ctx.fillStyle = grad;
                  ctx.fillRect(0, h - 140, w, 140);

                  // Hindi Lyrics Text
                  ctx.font = 'bold 28px "Noto Sans Devanagari", "Segoe UI", sans-serif';
                  ctx.fillStyle = '#FFD700'; // Gold
                  ctx.textAlign = 'center';
                  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
                  ctx.shadowBlur = 10;
                  ctx.fillText(lyr.hindi, w / 2, h - 70);

                  // Roman Transliteration & English
                  ctx.font = '500 20px "Segoe UI", sans-serif';
                  ctx.fillStyle = '#FFFFFF';
                  ctx.fillText(`🎵 ${lyr.roman}`, w / 2, h - 35);
                  ctx.restore();

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
    }, actFileUrls, width, height, lyricsList);

    const masterBuf = Buffer.from(stitchedBase64, 'base64');
    fs.writeFileSync(masterFilePath, masterBuf);
    console.log(`✅ Master Hindi Wedding Music Video Stitched: ${path.basename(masterFilePath)} (${(masterBuf.length / 1024 / 1024).toFixed(2)} MB)`);
    return masterFilePath;
  } catch (err) {
    console.error(`❌ Master stitching failed:`, err.message);
    return null;
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('========================================================================');
  console.log('🎉 CREATING SUPERHIT HINDI WEDDING MUSIC VIDEO (4 CONTINUOUS ACTS = 32s)');
  console.log('   Real Multiple People • Grand Royal Palace • Dhol Beats • Sangeet Lyrics');
  console.log('========================================================================');

  const actFiles = [];
  for (const act of WEDDING_ACTS) {
    const file = await generateVeoAct(act);
    if (file) {
      actFiles.push(file);
    }
    await sleep(2000);
  }

  if (actFiles.length === WEDDING_ACTS.length) {
    const masterPath = path.resolve(process.cwd(), 'public/assets/video/hindi_wedding/hindi_wedding_music_video_32s_master.mp4');
    const lyricsList = WEDDING_ACTS.map(a => a.lyrics);
    await stitchMasterWeddingMusicVideo(actFiles, masterPath, lyricsList);

    console.log('\n========================================================================');
    console.log('🌟 HINDI WEDDING SUPERHIT MUSIC VIDEO READY:');
    console.log(`   Master File: ${masterPath} (${(fs.statSync(masterPath).size / 1024 / 1024).toFixed(2)} MB)`);
    console.log('========================================================================');
  } else {
    console.warn(`⚠️ Only ${actFiles.length}/4 wedding acts completed.`);
  }
}

main().catch(console.error);
