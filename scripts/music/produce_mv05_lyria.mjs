import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { generateLyriaAudio } from "./generate_international_music_video.mjs";

async function run() {
  console.log("🇫🇷 [DEEPMIND LYRIA 3.5] Generating French Touch Master Audio for MV 5...");
  const outDir = path.resolve(process.cwd(), "scratch/productions/mv_05_lumiere_damour");
  fs.mkdirSync(outDir, { recursive: true });
  const rawAudio = path.join(outDir, "lyria_french_touch_master.mp3");
  const master24s = path.join(outDir, "master_soundtrack.mp3");

  const prompt = "Compose a 122 BPM French Touch electronic dance pop song with filtered synth chords, groovy bass guitar, upbeat disco drums, and melodic vocal hooks in French";
  const { audioBuf } = await generateLyriaAudio(prompt);
  fs.writeFileSync(rawAudio, audioBuf);
  console.log(`✅ Saved Raw Lyria Audio: ${rawAudio} (${audioBuf.length} bytes)`);

  execSync(`ffmpeg -y -i ${rawAudio} -af "afade=t=in:ss=0:d=0.2,afade=t=out:st=23.5:d=0.5" -t 24 ${master24s}`, { stdio: "pipe" });
  console.log(`✅ Formatted 24s Master Soundtrack: ${master24s}`);
}

run().catch(err => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
