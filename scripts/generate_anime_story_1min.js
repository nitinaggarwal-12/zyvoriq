const fs = require('fs');
const { execSync } = require('child_process');

const key = fs.readFileSync('.env.local', 'utf8').match(/GEMINI_API_KEY=(.*)/)[1].trim();
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const renImg = fs.readFileSync('/Users/nitinagga/.gemini/jetski/brain/a23b3dfc-a646-4f35-a290-887798aac2f1/ren_anime_sensei_1787859232073.jpg').toString('base64');
const kintsugiImg = fs.readFileSync('/Users/nitinagga/.gemini/jetski/brain/a23b3dfc-a646-4f35-a290-887798aac2f1/kintsugi_gold_bowl_1787859246836.jpg').toString('base64');
const fujiImg = fs.readFileSync('/Users/nitinagga/.gemini/jetski/brain/a23b3dfc-a646-4f35-a290-887798aac2f1/zen_mountain_sunrise_1787859260632.jpg').toString('base64');

const SHOTS = [
  {
    name: "act_1_ren_intro",
    prompt: "The anime mentor Ren speaks warmly to camera, gesturing gently with his wooden staff in the Kyoto zen garden as cherry blossoms flutter in the wind.",
    image: renImg
  },
  {
    name: "act_2_oubaitori",
    prompt: "Cinematic camera pan across the Kyoto zen garden with glowing stone lanterns and pink cherry blossom petals swirling in the golden sunset rays.",
    image: renImg
  },
  {
    name: "act_3_kintsugi",
    prompt: "The Japanese ceramic tea bowl repaired with glowing gold kintsugi seams radiates warm golden light with gentle steam rising in the tea house.",
    image: kintsugiImg
  },
  {
    name: "act_4_shoshin_fuji",
    prompt: "Golden sunrise illuminates the red Torii gate above the sea of clouds at Mount Fuji, cinematic anime wind blowing cherry petals.",
    image: fujiImg
  },
  {
    name: "act_5_kintsugi_glow",
    prompt: "Extreme close-up macro anime shot of the liquid gold kintsugi crack shining brilliantly with sparkling light particles.",
    image: kintsugiImg
  },
  {
    name: "act_6_fuji_path",
    prompt: "Dynamic forward tracking camera move through the Torii gate into the radiant morning sun over the sea of clouds at Mount Fuji.",
    image: fujiImg
  },
  {
    name: "act_7_ren_conclusion",
    prompt: "The anime mentor Ren smiles peacefully and gives a deep respectful bow to the viewer under the falling sakura blossoms.",
    image: renImg
  }
];

async function launchAndPollShot(shot) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`🚀 [${shot.name}] Launching Veo 3.1 (Attempt ${attempt})...`);
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{
            prompt: shot.prompt,
            image: {
              bytesBase64Encoded: shot.image,
              mimeType: 'image/jpeg'
            }
          }],
          parameters: {
            aspectRatio: '16:9',
            durationSeconds: 8
          }
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(JSON.stringify(data.error));
      const opName = data.name;
      console.log(`  📋 [${shot.name}] Op: ${opName}`);

      // Poll
      for (let i = 0; i < 60; i++) {
        await sleep(6000);
        const opRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${opName}?key=${key}`);
        const op = await opRes.json();
        if (op.error) throw new Error(JSON.stringify(op.error));
        if (op.done) {
          const videoUri = op.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
          if (videoUri) {
            const vidRes = await fetch(`${videoUri}&key=${key}`);
            const vidBuf = Buffer.from(await vidRes.arrayBuffer());
            const outPath = `scratch/${shot.name}.mp4`;
            fs.mkdirSync('scratch', { recursive: true });
            fs.writeFileSync(outPath, vidBuf);
            console.log(`  💾 Downloaded ${shot.name} (${(vidBuf.length / 1024 / 1024).toFixed(2)} MB)`);
            return outPath;
          } else {
            const rai = op.response?.generateVideoResponse?.raiMediaFilteredReasons?.[0] || 'Unknown RAI Filter';
            throw new Error(`RAI Filtered: ${rai}`);
          }
        } else {
          process.stdout.write('.');
        }
      }
      throw new Error(`Timeout for ${shot.name}`);
    } catch (err) {
      console.warn(`⚠️ [${shot.name}] Error: ${err.message}. Retrying in 4s...`);
      await sleep(4000);
    }
  }
  throw new Error(`Failed ${shot.name}`);
}

async function synthesizeSenseiAudio() {
  function pcmToWav(pcmData, sampleRate = 24000, channels = 1) {
    const byteRate = sampleRate * channels * 2;
    const blockAlign = channels * 2;
    const buffer = Buffer.alloc(44 + pcmData.length);
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + pcmData.length, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20);
    buffer.writeUInt16LE(channels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(byteRate, 28);
    buffer.writeUInt16LE(blockAlign, 32);
    buffer.writeUInt16LE(16, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(pcmData.length, 40);
    pcmData.copy(buffer, 44);
    return buffer;
  }

  console.log("🎙️ Synthesizing Japanese Sensei Philosophical Narrative...");
  const prompt = `Speak in a calm, wise, deep, and deeply inspiring anime sensei tone: Welcome, traveler. In life, we often seek sudden revolutions, but true mastery is found in Kaizen—the quiet power of continuous, one percent daily growth. Look at the cherry and plum blossoms: Oubaitori teaches us that every soul blooms in its own sacred season. Never compare your journey to another. Embrace your scars with Wabi-Sabi. The ceramic bowl mended with gold—Kintsugi—is more resilient and beautiful because of its history. When storms arrive, practice Gaman—dignified patience. The bamboo bends before the fiercest wind, but its roots remain steadfast. Cultivate Shoshin, the beginner's mind, and you will discover your true Ikigai. Your greatest journey begins with a single mindful breath.`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } }
        }
      }
    })
  });
  const data = await res.json();
  const part = data.candidates?.[0]?.content?.parts?.[0];
  if (part && part.inlineData) {
    const rawPcm = Buffer.from(part.inlineData.data, 'base64');
    const wav = pcmToWav(rawPcm, 24000, 1);
    const rawPath = 'scratch/sensei_narrative.wav';
    fs.writeFileSync(rawPath, wav);
    console.log("  ✅ Sensei narrative synthesized successfully!");
    return rawPath;
  }
  throw new Error("Sensei audio synthesis failed");
}

async function main() {
  console.log("=============================================================================");
  console.log("🌸 CREATING 1-MINUTE JAPANESE PHILOSOPHY ANIME STORY (56 SECONDS, 7 ACTS)");
  console.log("=============================================================================");

  const [downloadedShots, rawSpeech] = await Promise.all([
    Promise.all(SHOTS.map(s => launchAndPollShot(s))),
    synthesizeSenseiAudio()
  ]);

  console.log("\n🎬 Mastering 7 Acts with Meditative Japanese Zen Soundtrack and Broadcast Mux...");
  
  execSync(`scp ${downloadedShots.join(' ')} ${rawSpeech} nitinagga.c.googlers.com:~/zyvoriq/scratch/`);
  
  execSync(`ssh nitinagga.c.googlers.com "
    cd ~/zyvoriq

    # 1. Concatenate all 7 Veo Anime Shots (7 x 8s = 56.0s total)
    ffmpeg -y \
      -i scratch/act_1_ren_intro.mp4 \
      -i scratch/act_2_oubaitori.mp4 \
      -i scratch/act_3_kintsugi.mp4 \
      -i scratch/act_4_shoshin_fuji.mp4 \
      -i scratch/act_5_kintsugi_glow.mp4 \
      -i scratch/act_6_fuji_path.mp4 \
      -i scratch/act_7_ren_conclusion.mp4 \
      -filter_complex '[0:v][1:v][2:v][3:v][4:v][5:v][6:v]concat=n=7:v=1:a=0[v]' \
      -map '[v]' \
      -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p \
      scratch/anime_story_video.mp4

    # 2. Generate Meditative Zen Ambient Score (56.0s)
    # Layering 146.83Hz (D3 Shakuhachi root), 220Hz (A3 Koto fifth), and pink air whisper
    ffmpeg -y \
      -f lavfi -i 'anoisesrc=d=56:c=pink:r=48000:a=0.012,lowpass=f=350,volume=0.12' \
      -f lavfi -i 'sine=frequency=146.83:duration=56,volume=0.07' \
      -f lavfi -i 'sine=frequency=220.00:duration=56,volume=0.05' \
      -f lavfi -i 'sine=frequency=293.66:duration=56,volume=0.04' \
      -filter_complex '[0:a][1:a][2:a][3:a]amix=inputs=4:duration=first:dropout_transition=3[mix];[mix]aecho=0.85:0.88:80:0.45[bgm]' \
      -map '[bgm]' -t 56.0 -ar 48000 scratch/zen_score.wav

    # 3. Fit Sensei Voiceover to 54.0s (with gentle fade in & fade out)
    ffmpeg -y -i scratch/sensei_narrative.wav \
      -af 'silenceremove=start_periods=1:start_duration=0:start_threshold=-45dB,atempo=0.92,afade=t=out:st=52:d=2' \
      -ar 48000 scratch/sensei_timed.wav

    # 4. Master Audio Track
    ffmpeg -y -i scratch/sensei_timed.wav -i scratch/zen_score.wav \
      -filter_complex '[0:a]adelay=800|800,volume=1.4[voice];[1:a]volume=0.4[music];[voice][music]amix=inputs=2:duration=first[aout]' \
      -map '[aout]' -t 56.0 -ar 48000 scratch/master_zen_audio.wav

    # 5. Final Master Broadcast Video Mux
    ffmpeg -y -i scratch/anime_story_video.mp4 -i scratch/master_zen_audio.wav \
      -map 0:v:0 -map 1:a:0 \
      -c:v copy \
      -c:a aac -b:a 320k -ar 48000 \
      -t 56.00 -movflags +faststart \
      public/assets/video/ren_japanese_philosophy_1min.mp4

    ls -lh public/assets/video/ren_japanese_philosophy_1min.mp4
  "`);

  execSync(`scp nitinagga.c.googlers.com:~/zyvoriq/public/assets/video/ren_japanese_philosophy_1min.mp4 public/assets/video/`);
  console.log("🎉 100% 1-MINUTE JAPANESE PHILOSOPHY ANIME MASTER READY: public/assets/video/ren_japanese_philosophy_1min.mp4");
}

main().catch(console.error);
