import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { generateLyriaAudio } from "./generate_international_music_video.mjs";

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log("========================================================================");
  console.log("🎵 GENERATING GENUINE GOOGLE DEEPMIND LYRIA 3.5 MUSIC TRACKS");
  console.log("========================================================================");

  // 1. MV 2: South Korea - K-Pop
  console.log("\n🇰🇷 [LYRIA 3.5] Generating K-Pop Dance Soundtrack for MV 2...");
  const kpopDir = path.resolve(process.cwd(), "scratch/productions/mv_02_supernova_velocity");
  const kpopAudio = path.join(kpopDir, "lyria_kpop_master.mp3");
  const kpop24s = path.join(kpopDir, "lyria_24s.mp3");
  const kpopVideo = path.resolve(process.cwd(), "public/assets/video/mv_02_supernova_velocity_master.mp4");
  const kpopRaw = path.join(kpopDir, "raw_concat.mp4");

  const { audioBuf: kpopBuf } = await generateLyriaAudio(
    "Compose a high-energy 130 BPM futuristic K-Pop dance anthem with thumping kick, bright synth plucks, aggressive electronic bassline, and catchy Korean and English vocal hooks"
  );
  fs.writeFileSync(kpopAudio, kpopBuf);
  console.log("✅ Saved K-Pop Lyria Audio:", kpopAudio, kpopBuf.length, "bytes");
  execSync(`ffmpeg -y -i ${kpopAudio} -af "afade=t=in:ss=0:d=0.2,afade=t=out:st=23.5:d=0.5" -t 24 ${kpop24s}`, { stdio: "pipe" });
  execSync(`ffmpeg -y -i ${kpopRaw} -i ${kpop24s} -c:v copy -c:a aac -b:a 320k -shortest ${kpopVideo}`, { stdio: "pipe" });
  console.log("🎉 Updated MV 2 with genuine Lyria 3.5 audio:", kpopVideo);

  await sleep(4000);

  // 2. MV 3: Nigeria - Afrobeats
  console.log("\n🇳🇬 [LYRIA 3.5] Generating Afrobeats Soundtrack for MV 3...");
  const afroDir = path.resolve(process.cwd(), "scratch/productions/mv_03_lagos_midnight_sun");
  const afroAudio = path.join(afroDir, "lyria_afrobeats_master.mp3");
  const afro24s = path.join(afroDir, "lyria_24s.mp3");
  const afroVideo = path.resolve(process.cwd(), "public/assets/video/mv_03_lagos_midnight_sun_master.mp4");
  const afroRaw = path.join(afroDir, "raw_concat.mp4");

  const { audioBuf: afroBuf } = await generateLyriaAudio(
    "Compose an authentic 118 BPM Nigerian Afrobeats song with crisp shakers, warm log drum bass, saxophone hooks, acoustic guitar, and soulful uplifting African vocals"
  );
  fs.writeFileSync(afroAudio, afroBuf);
  console.log("✅ Saved Afrobeats Lyria Audio:", afroAudio, afroBuf.length, "bytes");
  execSync(`ffmpeg -y -i ${afroAudio} -af "afade=t=in:ss=0:d=0.2,afade=t=out:st=23.5:d=0.5" -t 24 ${afro24s}`, { stdio: "pipe" });
  execSync(`ffmpeg -y -i ${afroRaw} -i ${afro24s} -c:v copy -c:a aac -b:a 320k -shortest ${afroVideo}`, { stdio: "pipe" });
  console.log("🎉 Updated MV 3 with genuine Lyria 3.5 audio:", afroVideo);

  await sleep(4000);

  // 3. MV 4: India - Punjabi Pop Bhangra
  console.log("\n🇮🇳 [LYRIA 3.5] Generating Punjabi Bhangra Soundtrack for MV 4...");
  const punjabiDir = path.resolve(process.cwd(), "scratch/productions/mv_04_nachle_dholna");
  const punjabiAudio = path.join(punjabiDir, "lyria_punjabi_master.mp3");
  const punjabi24s = path.join(punjabiDir, "lyria_24s.mp3");
  const punjabiVideo = path.resolve(process.cwd(), "public/assets/video/mv_04_nachle_dholna_master.mp4");
  const punjabiRaw = path.join(punjabiDir, "raw_concat.mp4");

  const { audioBuf: punjabiBuf } = await generateLyriaAudio(
    "Compose a high-energy 128 BPM Punjabi festival pop bhangra song with live Dhol beats, Tumbi plucks, dholak rolls, sub-bass, and celebratory Punjabi singing vocals"
  );
  fs.writeFileSync(punjabiAudio, punjabiBuf);
  console.log("✅ Saved Punjabi Lyria Audio:", punjabiAudio, punjabiBuf.length, "bytes");
  execSync(`ffmpeg -y -i ${punjabiAudio} -af "afade=t=in:ss=0:d=0.2,afade=t=out:st=23.5:d=0.5" -t 24 ${punjabi24s}`, { stdio: "pipe" });
  execSync(`ffmpeg -y -i ${punjabiRaw} -i ${punjabi24s} -c:v copy -c:a aac -b:a 320k -shortest ${punjabiVideo}`, { stdio: "pipe" });
  console.log("🎉 Updated MV 4 with genuine Lyria 3.5 audio:", punjabiVideo);

  // Sync to remote
  console.log("\n🚀 Syncing updated videos to zyvoriq_remote...");
  execSync("rsync -av /usr/local/google/home/nitinagga/Documents/zyvoriq/public/assets/video/mv_*.mp4 /usr/local/google/home/nitinagga/zyvoriq_remote/public/assets/video/", { stdio: "inherit" });
  console.log("✅ All videos successfully updated with genuine Lyria audio!");
}

main().catch(err => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
