import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import util from 'util';

const execFileAsync = util.promisify(execFile);
const PROD_ID = "studio1_b79e20bd-9f77-45de-ba4a-275700f31531";
const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "";

const SCENES_EN = [
  { shotId: "shot_01", startSec: 0.0, dur: 3.9, speaker: "Kabir", voice: "Charon", script: "The gentle Mediterranean breeze whispers as if eternity awaited us." },
  { shotId: "shot_02", startSec: 3.9, dur: 4.4, speaker: "Kabir", voice: "Charon", script: "Italian morning airs singing the overture of our new beginning." },
  { shotId: "shot_03", startSec: 8.3, dur: 6.7, speaker: "Kabir", voice: "Charon", script: "Every breath with you feels like a dream. Welcome, my love. Benvenuti amici!" },
  { shotId: "shot_04", startSec: 15.0, dur: 3.7, speaker: "Kabir", voice: "Charon", script: "Today belongs to love, sunshine, and the rhythm of our hearts." },
  { shotId: "shot_05", startSec: 18.7, dur: 4.15, speaker: "Tara", voice: "Aoede", script: "Look Kabir, our dearest friends celebrating this journey right here!" },
  { shotId: "shot_06", startSec: 22.87, dur: 4.35, speaker: "Kabir", voice: "Charon", script: "Come on, let's run to the water's edge and lose ourselves in the waves!" },
  { shotId: "shot_07", startSec: 27.2, dur: 5.0, speaker: "Kabir", voice: "Charon", script: "Sunlight dancing upon turquoise waters, heaven descending on earth." },
  { shotId: "shot_08", startSec: 32.2, dur: 3.6, speaker: "Tara", voice: "Aoede", script: "Warm golden sand beneath our feet, your hand resting in mine." },
  { shotId: "shot_09", startSec: 35.8, dur: 4.05, speaker: "Kabir", voice: "Charon", script: "Seeing your radiant smile, even the ocean swells with joy." },
  { shotId: "shot_10", startSec: 39.83, dur: 3.25, speaker: "Kabir", voice: "Charon", script: "Sing with the rhythm, my friends, dance with the tide!" },
  { shotId: "shot_11", startSec: 43.1, dur: 4.7, speaker: "Kabir", voice: "Charon", script: "Our heartbeats composing a melody known only to you and me." },
  { shotId: "shot_12", startSec: 47.8, dur: 4.2, speaker: "Kabir", voice: "Charon", script: "The boat is ready—let us sail into the deep cobalt horizon!" },
  { shotId: "shot_13", startSec: 52.0, dur: 3.1, speaker: "Kabir", voice: "Charon", script: "Carving gentle ripples across the sea, footprints of love." },
  { shotId: "shot_14", startSec: 55.1, dur: 4.0, speaker: "Tara", voice: "Aoede", script: "Wind in our hair, the sweet taste of freedom on the open sea!" },
  { shotId: "shot_15", startSec: 59.1, dur: 5.2, speaker: "Kabir", voice: "Charon", script: "The world fades away—only your eyes in the light. Sing with the waves!" },
  { shotId: "shot_16", startSec: 64.3, dur: 1.15, speaker: "Music", voice: null, script: "" },
  { shotId: "shot_17", startSec: 65.47, dur: 5.65, speaker: "Tara", voice: "Aoede", script: "I wish this voyage could go on forever, with time standing still." },
  { shotId: "shot_18", startSec: 71.1, dur: 4.2, speaker: "Kabir", voice: "Charon", script: "Time will move, but this love will remain timeless, my heart." },
  { shotId: "shot_19", startSec: 75.3, dur: 3.1, speaker: "Kabir", voice: "Charon", script: "Twilight lights up the cliffside bistro with acoustic melodies." },
  { shotId: "shot_20", startSec: 78.4, dur: 4.2, speaker: "Tara", voice: "Aoede", script: "Sorrento lemon groves, warm laughter, and my soulmate beside me!" },
  { shotId: "shot_21", startSec: 82.6, dur: 4.2, speaker: "Kabir", voice: "Charon", script: "And now begins our celebration under the Italian evening sky!" },
  { shotId: "shot_22", startSec: 86.8, dur: 3.55, speaker: "Kabir", voice: "Charon", script: "Tara, will you take my hand and dance with me beneath the stars?" },
  { shotId: "shot_23", startSec: 90.37, dur: 3.65, speaker: "Tara", voice: "Aoede", script: "With every step you take, my heart is already yours, Kabir!" },
  { shotId: "shot_24", startSec: 94.0, dur: 4.8, speaker: "Kabir", voice: "Charon", script: "We will never let this twilight fade; our story continues forever." },
  { shotId: "shot_25", startSec: 98.8, dur: 4.3, speaker: "Kabir", voice: "Charon", script: "A canopy of stars, bonfire embers painting the night in gold." },
  { shotId: "shot_26", startSec: 103.1, dur: 3.0, speaker: "Tara", voice: "Aoede", script: "One final song dedicated to our beloved friends!" },
  { shotId: "shot_27", startSec: 106.1, dur: 4.8, speaker: "Kabir", voice: "Charon", script: "An enchanted Italian night and you—life is now complete." },
  { shotId: "shot_28", startSec: 110.9, dur: 3.6, speaker: "Tara", voice: "Aoede", script: "Our greatest chapter is only just beginning." },
  { shotId: "shot_29", startSec: 114.5, dur: 3.4, speaker: "Tara", voice: "Aoede", script: "Forever and always, across every lifetime, only you." },
  { shotId: "shot_30", startSec: 117.9, dur: 3.62, speaker: "Kabir", voice: "Charon", script: "Written upon Italian shores, a romance that echoes for eternity." }
];

function pcmToWav(pcmBuffer, sampleRate = 24000, numChannels = 1, bitDepth = 16) {
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * numChannels * (bitDepth / 8);
  const blockAlign = numChannels * (bitDepth / 8);
  const dataLength = pcmBuffer.length;
  const riffLength = dataLength + 36;

  header.write("RIFF", 0);
  header.writeUInt32LE(riffLength, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitDepth, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataLength, 40);

  return Buffer.concat([header, pcmBuffer]);
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function synthVoice(text, voiceName, outWavPath) {
  if (fs.existsSync(outWavPath) && fs.statSync(outWavPath).size > 1000) {
    return;
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } }
      }
    })
  });
  const data = await res.json();
  const part = data.candidates?.[0]?.content?.parts?.[0];
  if (part && part.inlineData) {
    const rawPcm = Buffer.from(part.inlineData.data, 'base64');
    const wav = pcmToWav(rawPcm, 24000, 1);
    fs.writeFileSync(outWavPath, wav);
    return;
  }
  throw new Error(`TTS Error for "${text}": ${JSON.stringify(data)}`);
}

async function main() {
  console.log("=== Synthesizing Dual-Character English Theatrical Narration ===");
  const workDir = path.resolve(process.cwd(), "scratch", "english_master_audio");
  fs.mkdirSync(workDir, { recursive: true });

  const totalDuration = 121.533333;
  const audioInputs = [];
  const filterChains = [];
  let inputIdx = 0;

  for (const scene of SCENES_EN) {
    if (!scene.script || !scene.voice) continue;
    const wavFile = path.join(workDir, `${scene.shotId}_${scene.voice}.wav`);
    console.log(`Synthesizing [${scene.speaker} / ${scene.voice}] for ${scene.shotId}: "${scene.script}"`);
    await synthVoice(scene.script, scene.voice, wavFile);
    await sleep(400);

    audioInputs.push("-i", wavFile);
    const delayMs = Math.round(scene.startSec * 1000);
    filterChains.push(`[${inputIdx}:a]adelay=${delayMs}|${delayMs},aresample=48000,volume=1.3[v${inputIdx}]`);
    inputIdx++;
  }

  const vMixInputs = Array.from({ length: inputIdx }, (_, i) => `[v${i}]`).join("");
  const dialogueBus = `${vMixInputs}amix=inputs=${inputIdx}:duration=longest:dropout_transition=0[dialogue_bus]`;

  const dialogueWav = path.join(workDir, "english_dialogue_full.wav");
  const fullFfmpegArgs = [
    "-y",
    ...audioInputs,
    "-filter_complex", `${filterChains.join(";")};${dialogueBus}`,
    "-map", "[dialogue_bus]",
    "-t", String(totalDuration),
    dialogueWav
  ];

  console.log("\nAssembling continuous English dialogue bus...");
  await execFileAsync("ffmpeg", fullFfmpegArgs, { maxBuffer: 16e6 });
  console.log(`✓ English dialogue bus saved: ${dialogueWav}`);

  const bgmScorePath = path.resolve(process.cwd(), "public", "assets", "audio", "music", "bollywood_romance_orchestra.mp3");
  const masterAudioWav = path.join(workDir, "english_theatrical_master_score.wav");

  console.log("\nMixing dialogue with orchestral BGM at -24.0 LUFS broadcast norm...");
  const mixFilter = `[0:a]aresample=48000,volume=1.25[dialogue];[1:a]aresample=48000,volume=0.55[score];[dialogue][score]amix=inputs=2:duration=first:dropout_transition=2,loudnorm=I=-24:LRA=7:tp=-1.5[aout]`;
  await execFileAsync("ffmpeg", [
    "-y",
    "-i", dialogueWav,
    "-i", bgmScorePath,
    "-filter_complex", mixFilter,
    "-map", "[aout]",
    "-t", String(totalDuration),
    masterAudioWav
  ], { maxBuffer: 16e6 });
  console.log(`✓ Master audio mixed: ${masterAudioWav}`);

  const videoMasterPath = path.resolve(process.cwd(), "public", "assets", "reels", PROD_ID, "narrated_rough_master.mp4");
  const outputEnMp4 = path.resolve(process.cwd(), "public", "assets", "reels", PROD_ID, "narrated_rough_master_en.mp4");
  const scratchEnMp4 = path.resolve(process.cwd(), "scratch", "asset_cache", "reels", PROD_ID, "renders", "narrated_rough_master_en.mp4");
  fs.mkdirSync(path.dirname(scratchEnMp4), { recursive: true });

  console.log("\nMuxing English theatrical audio into master video...");
  await execFileAsync("ffmpeg", [
    "-y",
    "-i", videoMasterPath,
    "-i", masterAudioWav,
    "-map", "0:v",
    "-map", "1:a",
    "-c:v", "copy",
    "-c:a", "aac",
    "-b:a", "192k",
    "-movflags", "+faststart",
    outputEnMp4
  ], { maxBuffer: 16e6 });

  fs.copyFileSync(outputEnMp4, scratchEnMp4);
  console.log(`\n🎉 SUCCESS! English master cut compiled:`);
  console.log(`  -> ${outputEnMp4}`);
  console.log(`  -> ${scratchEnMp4}`);
}

main().catch(err => {
  console.error("Compilation failed:", err);
  process.exit(1);
});
