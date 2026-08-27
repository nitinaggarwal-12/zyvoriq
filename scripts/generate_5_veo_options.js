const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const key = fs.readFileSync('.env.local', 'utf8').match(/GEMINI_API_KEY=(.*)/)[1].trim();
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const OPTIONS = [
  {
    id: "option_1_keynote_wide",
    title: "Option 1: Wide Keynote Arena (Expansive Opening Gestures)",
    prompt: "Cinematic 4K wide keynote broadcast of an executive technology leader standing at center stage, opening arms warmly in a welcoming presentation gesture to a large tech conference arena with bright blue spotlights and audience in background",
    audioText: "Welcome to Zyvoriq! We are transforming enterprise video pipelines with instant cryptographic consensus."
  },
  {
    id: "option_2_executive_closeup",
    title: "Option 2: Executive Medium Close-Up (Direct Camera Eye Contact)",
    prompt: "Cinematic 4K medium close-up of a female technology VP speaking with high conviction directly into the camera lens, clear mouth articulation and subtle confident head gestures on a sleek keynote stage with soft blue bokeh",
    audioText: "Hello everyone. Traditional enterprise content pipelines take 14 days. With Zyvoriq, we collapse that to 90 seconds."
  },
  {
    id: "option_3_dynamic_pacing",
    title: "Option 3: Dynamic Stage Motion (Pacing & Assertive Emphasis)",
    prompt: "Cinematic 4K broadcast video of an executive presenter smoothly pacing across the keynote stage, gesturing assertively with right hand to emphasize technology metrics, vibrant stage lighting",
    audioText: "By combining neural synthesis with mathematical provenance proofs, we give you absolute certainty for every pixel."
  },
  {
    id: "option_4_tech_podium",
    title: "Option 4: Glass Podium Presenter (Formal Keynote Delivery)",
    prompt: "Cinematic 4K video of a technology leader standing by a modern transparent acrylic podium on stage, delivering a keynote speech with passionate facial expressions and hand gestures",
    audioText: "Security and speed must coexist. Our cryptographic consensus delivers both for modern hyperscale enterprises."
  },
  {
    id: "option_5_authoritative_orator",
    title: "Option 5: High-Energy Tech Orator (Rapid Articulation & Hands)",
    prompt: "Cinematic 4K portrait keynote of an energetic technology CTO speaking passionately into a lapel mic, smiling warmly with confident body language and rapid hand motions in a modern auditorium",
    audioText: "Welcome to the future of enterprise broadcast. 90-second sovereign production with zero compliance overhead!"
  }
];

async function launchVeoJob(opt) {
  console.log(`🚀 [${opt.id}] Launching Veo 3.1 Generation...`);
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt: opt.prompt }],
      parameters: { aspectRatio: '16:9', durationSeconds: 8 }
    })
  });
  const data = await res.json();
  if (data.error) {
    throw new Error(`[${opt.id}] Launch Error: ${JSON.stringify(data.error)}`);
  }
  console.log(`  📋 [${opt.id}] Operation Created: ${data.name}`);
  return { ...opt, opName: data.name };
}

async function pollJob(job) {
  console.log(`⏳ [${job.id}] Polling ${job.opName}...`);
  for (let attempt = 1; attempt <= 60; attempt++) {
    await sleep(7000);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${job.opName}?key=${key}`);
      const op = await res.json();

      if (op.error) throw new Error(`[${job.id}] Error: ${JSON.stringify(op.error)}`);
      if (op.done) {
        console.log(`\n🎉 [${job.id}] Veo 3.1 Diffusion COMPLETE!`);
        const videoUri = op.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
        if (videoUri) {
          const vidRes = await fetch(`${videoUri}&key=${key}`);
          const vidBuf = Buffer.from(await vidRes.arrayBuffer());
          const rawPath = `scratch/${job.id}_raw.mp4`;
          fs.mkdirSync('scratch', { recursive: true });
          fs.writeFileSync(rawPath, vidBuf);
          console.log(`  💾 [${job.id}] Downloaded raw MP4 (${(vidBuf.length / 1024 / 1024).toFixed(2)} MB)`);
          return { ...job, rawPath };
        }
      }
    } catch (e) {
      console.warn(`\n⚠️ [${job.id}] Poll warning:`, e.message);
    }
  }
  throw new Error(`[${job.id}] Polling timed out`);
}

async function synthesizeTTS(text, outPath) {
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

  const prompt = `Speak in a crisp, energetic executive keynote tone: ${text}`;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } }
        }
      }
    })
  });
  const data = await res.json();
  const part = data.candidates?.[0]?.content?.parts?.[0];
  if (part && part.inlineData) {
    const rawPcm = Buffer.from(part.inlineData.data, 'base64');
    const wav = pcmToWav(rawPcm, 24000, 1);
    fs.writeFileSync(outPath, wav);
    return outPath;
  }
  throw new Error(`TTS Failed for: ${text}`);
}

async function main() {
  console.log("==========================================================");
  console.log("🎬 LAUNCHING 5 DIVERSE GOOGLE VEO 3.1 GENERATIONS IN PARALLEL");
  console.log("==========================================================");

  // 1. Launch all 5 jobs concurrently
  const launchPromises = OPTIONS.map(opt => launchVeoJob(opt));
  const activeJobs = await Promise.all(launchPromises);

  // 2. Concurrently synthesize audio tracks
  console.log("\n🎙️ Generating 5 Custom Keynote Speech Audio Tracks...");
  for (let i = 0; i < OPTIONS.length; i++) {
    const audPath = `scratch/audio_${OPTIONS[i].id}.wav`;
    await synthesizeTTS(OPTIONS[i].audioText, audPath);
    activeJobs[i].audPath = audPath;
    console.log(`  ✅ Audio generated for ${OPTIONS[i].id}`);
  }

  // 3. Poll all 5 video generation jobs concurrently
  console.log("\n⏳ Polling 5 Google Veo 3.1 Jobs Simultaneously...");
  const pollPromises = activeJobs.map(job => pollJob(job));
  const completedJobs = await Promise.all(pollPromises);

  console.log("\n==========================================================");
  console.log("🎉 ALL 5 VEO 3.1 VIDEOS GENERATED! MUXING MASTER MP4s...");
  console.log("==========================================================");

  return completedJobs;
}

main().catch(err => {
  console.error("❌ Fatal Error:", err);
  process.exit(1);
});
