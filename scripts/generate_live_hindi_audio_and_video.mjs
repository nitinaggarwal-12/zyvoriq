import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';
import { execSync } from 'child_process';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const key = fs.readFileSync('.env.local', 'utf8').match(/GEMINI_API_KEY=(.*)/)[1].trim();

const SHOTS = [
  {
    shotNumber: 1,
    speaker: "Husband (Rajesh)",
    voiceName: "Fenrir", // Deep resonant male voice
    prompt: "Say in natural, playful, sweet conversational Hindi as a husband asking his wife for morning tea: सुनो जी! अगर थोड़ी अदरक और दो इलायची वाली कड़क चाय बन जाती, तो संडे का मज़ा आ जाता!",
    imagePath: "public/assets/images/hindi_comedy/scene_1_husband_sofa.jpg",
    subtitles: {
      hi: "☕ सुनो जी! अदरक-इलायची वाली कड़क चाय मिलेगी क्या?",
      hinglish: "Suno ji! Thodi adrak-elaichi wali kadak chai ban jaati?"
    }
  },
  {
    shotNumber: 2,
    speaker: "Wife (Simran)",
    voiceName: "Aoede", // Expressive sarcastic female voice
    prompt: "Say in deadpan sarcastic, funny, sharp conversational Hindi as an Indian wife giving a witty comeback: हाँ जी! और साथ में क्या ताजमहल की रजिस्ट्री भी करवा दूँ? सुबह से तीसरा कप पी रहे हो, चाय है या पेट्रोल पंप?",
    imagePath: "public/assets/images/hindi_comedy/scene_2_wife_sarcasm.jpg",
    subtitles: {
      hi: "🤨 हाँ जी! और ताजमहल के पेपर्स भी साइन करवा दूँ क्या?",
      hinglish: "Haan ji! Taj Mahal ke papers bhi sign karwa doon?"
    }
  },
  {
    shotNumber: 3,
    speaker: "Husband (Rajesh)",
    voiceName: "Puck", // Comedic defensive male voice
    prompt: "Say with sheepish, awkward, funny witty defense in conversational Hindi: अरे मैं तो बस तुम्हारी हाथों के स्वाद की तारीफ कर रहा था! वैसे कल मम्मी जी के सामने तुमने ही तो कहा था कि चीनी कम है!",
    imagePath: "public/assets/images/hindi_comedy/scene_3_couple_reaction.jpg",
    subtitles: {
      hi: "😅 मैं तो तारीफ कर रहा था! (कल मम्मी जी के सामने क्या कहा था?)",
      hinglish: "Main toh tareef kar raha tha! Kal Mummy ji ke saamne..."
    }
  },
  {
    shotNumber: 4,
    speaker: "Resolution (Narrator)",
    voiceName: "Kore", // Warm, laughing closing voice
    prompt: "Say with cheerful laughter and punchline delivery in Hindi: निष्कर्ष: सच्चे पति वही जो चाय भी खुद बनाएँ और बीवी से डाँट भी मुफ़्त में खाएँ! टैग करो अपने पार्टनर को!",
    imagePath: "public/assets/images/hindi_comedy/scene_4_husband_making_chai.jpg",
    subtitles: {
      hi: "❤️ निष्कर्ष: चाय भी खुद बनाओ और डाँट भी खाओ! Tag Partner 👇",
      hinglish: "Conclusion: Chai bhi khud banao aur daant bhi khao!"
    }
  }
];

function pcmToWav(pcmBuffer, sampleRate = 24000, numChannels = 1) {
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  const header = Buffer.alloc(44);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcmBuffer.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(16, 34); // Bits per sample
  header.write('data', 36);
  header.writeUInt32LE(pcmBuffer.length, 40);

  return Buffer.concat([header, pcmBuffer]);
}

async function synthesizeLiveTTS(shot) {
  console.log(`🎙️ [Live API Call] Synthesizing Shot ${shot.shotNumber} (${shot.speaker}) with Gemini model gemini-2.5-flash-preview-tts (${shot.voiceName})...`);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${key}`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: shot.prompt }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: shot.voiceName
            }
          }
        }
      }
    })
  });

  const data = await res.json();
  if (!data.candidates || !data.candidates[0]?.content?.parts) {
    throw new Error(`TTS synthesis failed for shot ${shot.shotNumber}: ${JSON.stringify(data)}`);
  }

  const audioPart = data.candidates[0].content.parts.find(p => p.inlineData);
  if (!audioPart) throw new Error(`No inline audio data returned for shot ${shot.shotNumber}`);

  const rawPcm = Buffer.from(audioPart.inlineData.data, 'base64');
  const wavBuffer = pcmToWav(rawPcm, 24000, 1);
  const outPath = path.join(process.cwd(), 'public', 'assets', 'audio', `live_gemini_shot_${shot.shotNumber}.wav`);
  fs.writeFileSync(outPath, wavBuffer);
  console.log(`✅ Saved live speech audio for Shot ${shot.shotNumber}: ${outPath} (${(wavBuffer.length / 1024).toFixed(1)} KB)`);
  return { outPath, wavBuffer, rawPcm };
}

async function run() {
  console.log('🚀 1. Executing Live Gemini TTS API Calls for all 4 Hindi Comedy Shots...');
  const audioResults = [];
  for (const shot of SHOTS) {
    const result = await synthesizeLiveTTS(shot);
    audioResults.push(result);
  }

  // Concatenate all 4 audio buffers into master 30s audio
  console.log('2. Assembling master 30s multi-character Hindi dialogue track...');
  const allPcm = Buffer.concat(audioResults.map(r => r.rawPcm));
  const masterWav = pcmToWav(allPcm, 24000, 1);
  const masterAudioPath = path.join(process.cwd(), 'public', 'assets', 'audio', 'hindi_husband_wife_comedy_30s.wav');
  const masterMp3Path = path.join(process.cwd(), 'public', 'assets', 'audio', 'hindi_husband_wife_comedy_30s.mp3');
  fs.writeFileSync(masterAudioPath, masterWav);
  
  // Also convert to m4a/mp3 using afconvert
  try {
    execSync(`afconvert -f m4af -d aac@44100 "${masterAudioPath}" "${masterMp3Path}"`);
  } catch {
    fs.writeFileSync(masterMp3Path, masterWav);
  }
  console.log(`✅ Master Hindi Audio Saved: ${masterAudioPath}`);

  // 3. Render 30s Video via Puppeteer Canvas with the live audio and Ken Burns movement
  console.log('3. Rendering Physical 30s MP4 Video on macOS Google Chrome with live audio and 4K images...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1080,1920', '--autoplay-policy=no-user-gesture-required']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 720, height: 1280 });

  const img1 = fs.readFileSync(SHOTS[0].imagePath).toString('base64');
  const img2 = fs.readFileSync(SHOTS[1].imagePath).toString('base64');
  const img3 = fs.readFileSync(SHOTS[2].imagePath).toString('base64');
  const img4 = fs.readFileSync(SHOTS[3].imagePath).toString('base64');
  const audioBase64 = masterWav.toString('base64');

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>body { margin: 0; background: #000; overflow: hidden; }</style>
  </head>
  <body>
    <canvas id="c" width="720" height="1280"></canvas>
    <script>
      window.isDone = false;
      const canvas = document.getElementById('c');
      const ctx = canvas.getContext('2d');
      const imgs = [];
      const b64s = ['${img1}', '${img2}', '${img3}', '${img4}'];
      let loaded = 0;

      b64s.forEach((b, i) => {
        const img = new Image();
        img.onload = () => {
          loaded++;
          if (loaded === 4) start();
        };
        img.src = 'data:image/jpeg;base64,' + b;
        imgs.push(img);
      });

      const cues = [
        { start: 0, end: 7.5, img: 0, text: "${SHOTS[0].subtitles.hi}", sub: "${SHOTS[0].subtitles.hinglish}" },
        { start: 7.5, end: 15.0, img: 1, text: "${SHOTS[1].subtitles.hi}", sub: "${SHOTS[1].subtitles.hinglish}" },
        { start: 15.0, end: 22.5, img: 2, text: "${SHOTS[2].subtitles.hi}", sub: "${SHOTS[2].subtitles.hinglish}" },
        { start: 22.5, end: 30.0, img: 3, text: "${SHOTS[3].subtitles.hi}", sub: "${SHOTS[3].subtitles.hinglish}" }
      ];

      async function start() {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const dest = audioCtx.createMediaStreamDestination();
        const audioBytes = Uint8Array.from(atob('${audioBase64}'), c => c.charCodeAt(0));
        const audioBuffer = await audioCtx.decodeAudioData(audioBytes.buffer);
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(dest);

        const videoStream = canvas.captureStream(30);
        const stream = new MediaStream([...videoStream.getVideoTracks(), ...dest.stream.getAudioTracks()]);
        const rec = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus', videoBitsPerSecond: 5000000 });
        const chunks = [];
        rec.ondataavailable = e => chunks.push(e.data);
        rec.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const r = new FileReader();
          r.onload = () => {
            window.videoBase64 = r.result.split(',')[1];
            window.isDone = true;
          };
          r.readAsDataURL(blob);
        };

        rec.start();
        source.start(0);
        const startT = performance.now();

        function draw() {
          const elapsed = (performance.now() - startT) / 1000;
          if (elapsed >= 30.0) { rec.stop(); return; }

          const active = cues.find(c => elapsed >= c.start && elapsed < c.end) || cues[3];
          const img = imgs[active.img];
          const secElapsed = elapsed - active.start;
          const zoom = 1.0 + ((secElapsed / 7.5) * 0.08);

          ctx.save();
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, 720, 1280);

          const w = 720 * zoom;
          const h = 1280 * zoom;
          ctx.drawImage(img, (720 - w) / 2, (1280 - h) / 2, w, h);

          // Vignette
          const grad = ctx.createLinearGradient(0, 930, 0, 1280);
          grad.addColorStop(0, 'rgba(0,0,0,0)');
          grad.addColorStop(0.4, 'rgba(0,0,0,0.75)');
          grad.addColorStop(1, 'rgba(0,0,0,0.95)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 930, 720, 350);

          // Subtitle Hindi
          ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillStyle = '#fef08a';
          ctx.textAlign = 'center';
          ctx.shadowColor = 'rgba(0,0,0,0.95)';
          ctx.shadowBlur = 12;
          ctx.fillText(active.text, 360, 1120);

          // Hinglish translation
          ctx.font = '500 20px -apple-system, BlinkMacSystemFont, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(active.sub, 360, 1170);

          // Progress bar
          ctx.fillStyle = 'rgba(255,255,255,0.25)';
          ctx.fillRect(40, 1240, 640, 6);
          ctx.fillStyle = '#14b8a6';
          ctx.fillRect(40, 1240, 640 * (elapsed / 30.0), 6);

          ctx.restore();
          requestAnimationFrame(draw);
        }
        draw();
      }
    </script>
  </body>
  </html>
  `;

  await page.setContent(html);
  console.log('Compiling 30s Master Video in browser canvas...');
  await page.waitForFunction(() => window.isDone === true, { timeout: 60000 });

  const finalB64 = await page.evaluate(() => window.videoBase64);
  const finalBuffer = Buffer.from(finalB64, 'base64');
  const finalVideoPath = path.join(process.cwd(), 'public', 'assets', 'video', 'hindi_husband_wife_comedy_30s.mp4');
  fs.writeFileSync(finalVideoPath, finalBuffer);
  console.log(`🎉 Final 30s MP4 Video with Live Gemini Audio Generated: ${finalVideoPath} (${(finalBuffer.length / (1024*1024)).toFixed(2)} MB)`);

  await browser.close();
}

run().catch(err => {
  console.error('Execution Error:', err);
  process.exit(1);
});
