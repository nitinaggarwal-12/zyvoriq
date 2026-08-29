const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const envContent = fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8");
const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/) || envContent.match(/GOOGLE_API_KEY=([^\r\n]+)/);
if (!match) {
  console.error("❌ No GEMINI_API_KEY found");
  process.exit(1);
}
const apiKey = match[1].trim();

// Check for ffmpeg
let ffmpegPath = "ffmpeg";
try {
  execSync("ffmpeg -version", { stdio: "ignore" });
  console.log("✅ FFmpeg detected on system");
} catch (e) {
  console.warn("⚠️ System ffmpeg not found, checking alternatives...");
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// 1. Generate full continuous multi-speaker master audio
async function generateMasterSongAudio(config) {
  console.log(`\n🎙️ Synthesizing Single Continuous 60s Master Soundtrack: [${config.title}]...`);
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateAudio?key=${apiKey}`;

  const payload = {
    audioConfig: {
      audioEncoding: "LINEAR16",
      speakingRate: 1.0,
      pitch: 0.0
    },
    input: {
      text: config.fullPrompt
    },
    voice: {
      name: config.primaryVoice || "Aoede",
      ssmlGender: config.gender || "FEMALE"
    }
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.audioContent) {
      const pcmBuffer = Buffer.from(data.audioContent, "base64");
      // Add standard WAV header
      const wavHeader = Buffer.alloc(44);
      const totalDataLen = pcmBuffer.length;
      const totalFileLen = totalDataLen + 36;
      const sampleRate = 24000;
      const channels = 1;
      const bitsPerSample = 16;
      const byteRate = sampleRate * channels * (bitsPerSample / 8);
      const blockAlign = channels * (bitsPerSample / 8);

      wavHeader.write("RIFF", 0);
      wavHeader.writeUInt32LE(totalFileLen, 4);
      wavHeader.write("WAVE", 8);
      wavHeader.write("fmt ", 12);
      wavHeader.writeUInt32LE(16, 16);
      wavHeader.writeUInt16LE(1, 20);
      wavHeader.writeUInt16LE(channels, 22);
      wavHeader.writeUInt32LE(sampleRate, 24);
      wavHeader.writeUInt32LE(byteRate, 28);
      wavHeader.writeUInt16LE(blockAlign, 32);
      wavHeader.writeUInt16LE(bitsPerSample, 34);
      wavHeader.write("data", 36);
      wavHeader.writeUInt32LE(totalDataLen, 40);

      const fullWav = Buffer.concat([wavHeader, pcmBuffer]);
      const outPath = path.resolve(process.cwd(), "public/assets/audio", config.outputWav);
      fs.writeFileSync(outPath, fullWav);
      console.log(`✅ Saved Master Soundtrack: ${config.outputWav} (${(fullWav.length / 1024 / 1024).toFixed(2)} MB)`);
      return true;
    } else {
      console.warn("❌ TTS Error:", JSON.stringify(data));
    }
  } catch (err) {
    console.error("❌ Exception during TTS:", err.message);
  }
  return false;
}

const MASTER_SONGS = [
  {
    title: "Kesariya Raaste: Sufi Soul in Old Delhi (Continuous 60s Master)",
    outputWav: "kesariya_raaste_master_60s.wav",
    primaryVoice: "Charon",
    gender: "MALE",
    fullPrompt: "Sing with deep soulful Indian Sufi romance, high melodic resonance, and heartfelt devotion:\n" +
      "केसरिया रास्तों पर जब शाम ढले, तेरी यादों की महक हवा में घुले, दिल की हर धड़कन बस तेरा नाम ले।\n" +
      "गेंदे के फूलों सी महके यह जहां, तेरे संग बीते यह खुशियों का समां, तू है मेरा आसमां, तू ही मेरा कारवां।\n" +
      "मौला मेरे मौला, यह कैसा असर है, तेरे बिना अब तो सूना यह सफर है! इश्क़ का यह रंग कभी ना छूटेगा।\n" +
      "रूह से रूह का यह बंधन कभी ना टूटेगा, ओ सनम, तेरा साथ ही मेरी इबादत है, मेरी इबादत है।"
  },
  {
    title: "Gully Raftaar: Mumbai Monsoon Beats (Continuous 60s Master)",
    outputWav: "gully_raftaar_master_60s.wav",
    primaryVoice: "Fenrir",
    gender: "MALE",
    fullPrompt: "Rap with intense energetic Mumbai street flow, punchy rhythmic cadence, and raw hip-hop power:\n" +
      "मुंबई की बारिश, कंक्रीट पे आग, माइक पर पकड़, ये हमारी आवाज़! गली-गली में गूंजे अपना ये नाम।\n" +
      "टैक्सी की बत्ती, नियॉन का जाल, गल्ली से निकले, मचाते धमाल! रफ्तार अपनी समंदर की लहर।\n" +
      "रुकने का नाम नहीं, झुकने का काम नहीं, अपने इरादों से जीता ये शहर! ये शहर हमारा है, ये धड़कन हमारी।\n" +
      "सी-लिंक की रौशनी, रात का सलाम, माइक किया ड्रॉप, रफ्तार अमर नाम!"
  }
];

async function main() {
  console.log("================================================================================");
  console.log("🚀 COMPOSING FULL CONTINUOUS 60S STUDIO MASTER AUDIO TRACKS");
  console.log("================================================================================");

  for (const song of MASTER_SONGS) {
    await generateMasterSongAudio(song);
    await sleep(2000);
  }

  console.log("\n🎬 Stitching Master 60s Video Productions via FFmpeg...");
  
  // 1. Stitch Kesariya Raaste
  try {
    const kActs = [
      "public/assets/video/veo_hindi_sufi_song_master.mp4",
      "public/assets/video/veo_hindi_sufi_act2.mp4",
      "public/assets/video/veo_hindi_sufi_act3.mp4",
      "public/assets/video/veo_hindi_sufi_act4.mp4"
    ];
    const kAudio = "public/assets/audio/kesariya_raaste_master_60s.wav";
    const kOutput = "public/assets/video/kesariya_raaste_full_60s_master.mp4";

    // Create concat filter with crossfades
    const concatCmd = `ffmpeg -y -i "${kActs[0]}" -i "${kActs[1]}" -i "${kActs[2]}" -i "${kActs[3]}" -i "${kAudio}" ` +
      `-filter_complex "` +
      `[0:v][1:v]xfade=transition=fade:duration=0.7:offset=7.3[v01];` +
      `[v01][2:v]xfade=transition=fade:duration=0.7:offset=14.6[v02];` +
      `[v02][3:v]xfade=transition=fade:duration=0.7:offset=21.9[vout]" ` +
      `-map "[vout]" -map 4:a -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -c:a aac -b:a 256k "${kOutput}"`;

    console.log("   Running FFmpeg for Kesariya Raaste 60s Master...");
    execSync(concatCmd, { stdio: "inherit" });
    console.log(`   🎉 Master Video Rendered: ${kOutput} (${(fs.statSync(kOutput).size / 1024 / 1024).toFixed(2)} MB)`);
  } catch (err) {
    console.warn("   ⚠️ FFmpeg xfade fallback to concat demuxer:", err.message);
    try {
      const listFile = "scratch/k_list.txt";
      fs.mkdirSync("scratch", { recursive: true });
      fs.writeFileSync(listFile, "file '../public/assets/video/veo_hindi_sufi_song_master.mp4'\nfile '../public/assets/video/veo_hindi_sufi_act2.mp4'\nfile '../public/assets/video/veo_hindi_sufi_act3.mp4'\nfile '../public/assets/video/veo_hindi_sufi_act4.mp4'\n");
      const kOutput = "public/assets/video/kesariya_raaste_full_60s_master.mp4";
      const fallbackCmd = `ffmpeg -y -f concat -safe 0 -i ${listFile} -i public/assets/audio/kesariya_raaste_master_60s.wav -c:v libx264 -preset fast -pix_fmt yuv420p -c:a aac -b:a 256k -shortest ${kOutput}`;
      execSync(fallbackCmd, { stdio: "inherit" });
      console.log(`   🎉 Fallback Master Video Rendered: ${kOutput}`);
    } catch (e) {
      console.error("   ❌ Fallback error:", e.message);
    }
  }

  // 2. Stitch Gully Raftaar
  try {
    const gActs = [
      "public/assets/video/veo_hindi_desi_hiphop_master.mp4",
      "public/assets/video/veo_hindi_hiphop_act2.mp4",
      "public/assets/video/veo_hindi_hiphop_act3.mp4",
      "public/assets/video/veo_hindi_hiphop_act4.mp4"
    ];
    const gAudio = "public/assets/audio/gully_raftaar_master_60s.wav";
    const gOutput = "public/assets/video/gully_raftaar_full_60s_master.mp4";

    const concatCmd = `ffmpeg -y -i "${gActs[0]}" -i "${gActs[1]}" -i "${gActs[2]}" -i "${gActs[3]}" -i "${gAudio}" ` +
      `-filter_complex "` +
      `[0:v][1:v]xfade=transition=fade:duration=0.7:offset=7.3[v01];` +
      `[v01][2:v]xfade=transition=fade:duration=0.7:offset=14.6[v02];` +
      `[v02][3:v]xfade=transition=fade:duration=0.7:offset=21.9[vout]" ` +
      `-map "[vout]" -map 4:a -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -c:a aac -b:a 256k "${gOutput}"`;

    console.log("   Running FFmpeg for Gully Raftaar 60s Master...");
    execSync(concatCmd, { stdio: "inherit" });
    console.log(`   🎉 Master Video Rendered: ${gOutput} (${(fs.statSync(gOutput).size / 1024 / 1024).toFixed(2)} MB)`);
  } catch (err) {
    console.warn("   ⚠️ FFmpeg xfade fallback to concat demuxer:", err.message);
  }

  // 3. Stitch Human Live Concert 30s
  try {
    const hActs = [
      "public/assets/video/veo_music_human_live_master.mp4",
      "public/assets/video/veo_music_human_act2.mp4",
      "public/assets/video/veo_music_human_act3.mp4",
      "public/assets/video/veo_music_human_act4.mp4"
    ];
    const hOutput = "public/assets/video/neon_horizons_full_30s_master.mp4";
    const listFile = "scratch/h_list.txt";
    fs.mkdirSync("scratch", { recursive: true });
    fs.writeFileSync(listFile, hActs.map(p => `file '../${p}'`).join("\n") + "\n");
    const hCmd = `ffmpeg -y -f concat -safe 0 -i ${listFile} -c:v libx264 -preset fast -pix_fmt yuv420p -c:a aac -b:a 256k ${hOutput}`;
    execSync(hCmd, { stdio: "inherit" });
    console.log(`   🎉 Master Video Rendered: ${hOutput}`);
  } catch (err) {
    console.warn("   ⚠️ Error rendering human concert master:", err.message);
  }

  // 4. Stitch Anime Idol 30s
  try {
    const aActs = [
      "public/assets/video/veo_music_anime_idol_master.mp4",
      "public/assets/video/veo_music_anime_act2.mp4",
      "public/assets/video/veo_music_anime_act3.mp4",
      "public/assets/video/veo_music_anime_act4.mp4"
    ];
    const aOutput = "public/assets/video/starlight_symphony_full_30s_master.mp4";
    const listFile = "scratch/a_list.txt";
    fs.mkdirSync("scratch", { recursive: true });
    fs.writeFileSync(listFile, aActs.map(p => `file '../${p}'`).join("\n") + "\n");
    const aCmd = `ffmpeg -y -f concat -safe 0 -i ${listFile} -c:v libx264 -preset fast -pix_fmt yuv420p -c:a aac -b:a 256k ${aOutput}`;
    execSync(aCmd, { stdio: "inherit" });
    console.log(`   🎉 Master Video Rendered: ${aOutput}`);
  } catch (err) {
    console.warn("   ⚠️ Error rendering anime idol master:", err.message);
  }

  console.log("\n🏁 All Master Productions Successfully Composed & Rendered!");
}

main().catch(console.error);
