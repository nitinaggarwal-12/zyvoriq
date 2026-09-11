import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

try { process.loadEnvFile(".env.local"); } catch {}
const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!key) throw new Error("No API key");

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log("========================================================================");
  console.log("🇫🇷 SURGICAL REPAIR: MV 05 (LUMIÈRE D'AMOUR) SHOT 3");
  console.log("========================================================================");

  // 1. Update poster anchor to match Shot 1 champagne gold tutu in Parisian salon
  const mid1 = path.resolve(process.cwd(), "scratch/audit_mv_05_lumiere_damour/mid_shot1_4s.jpg");
  const poster = path.resolve(process.cwd(), "public/assets/stills/mv_05_lumiere_damour_poster.jpg");
  if (fs.existsSync(mid1)) {
    fs.copyFileSync(mid1, poster);
    console.log("✅ Updated MV 05 Poster to locked Parisian salon champagne gold tutu anchor!");
  }

  const anchorB64 = fs.readFileSync(poster).toString("base64");

  // 2. Dispatch Shot 3 with champagne gold tutu and grand Parisian salon
  const prompt = "Cinematic low-angle camera arc around the elegant Parisian ballet soloist in champagne gold and iridescent white pleated tulle gown executing expressive modern contemporary ballet dance across the parquet floor of the grand gilded Parisian mirrored salon with crystal chandeliers, warm chandelier illumination, continuous Parisian twilight through high windows, Master Anamorphic, 9:16 vertical, 24fps";

  console.log("🎥 Dispatching Veo 3.1 for Shot 3 (conditioned on champagne gold tutu anchor)...");
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-fast-generate-preview:predictLongRunning?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instances: [{
        prompt,
        image: { bytesBase64Encoded: anchorB64, mimeType: "image/jpeg" }
      }],
      parameters: { aspectRatio: "9:16", durationSeconds: 8 }
    })
  });
  const d = await res.json();
  if (!d.name) throw new Error(`Veo dispatch failed: ${JSON.stringify(d)}`);
  const opName = d.name;
  console.log(`⏳ Operation started: ${opName}`);

  // 3. Poll and download
  const shot3File = path.resolve(process.cwd(), "scratch/productions/mv_05_lumiere_damour/shots/shot_03.mp4");
  for (let i = 1; i <= 40; i++) {
    await sleep(6000);
    const pollRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${opName}?key=${key}`);
    const pollData = await pollRes.json();
    if (pollData.error) throw new Error(`Veo error: ${pollData.error.message}`);
    if (pollData.done) {
      const uri = pollData.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
      if (!uri) throw new Error("Veo done without video uri");
      console.log(`⬇️ Downloading Shot 3...`);
      const dl = await fetch(`${uri}&key=${key}`);
      const buf = Buffer.from(await dl.arrayBuffer());
      fs.writeFileSync(shot3File, buf);
      console.log(`✅ Saved Shot 3: ${shot3File} (${Math.round(buf.length / 1024)} KB)`);
      break;
    }
    console.log(`... diffusing shot 3 (${i * 6}s)`);
  }

  // 4. Re-stitch MV 05
  console.log("🎞️ Re-stitching MV 05 master...");
  const baseDir = path.resolve(process.cwd(), "scratch/productions/mv_05_lumiere_damour");
  const listFile = path.join(baseDir, "shots.txt");
  const rawConcat = path.join(baseDir, "raw_concat.mp4");
  const audio24s = path.join(baseDir, "lyria_24s.mp3");
  const finalVideo = path.resolve(process.cwd(), "public/assets/video/mv_05_lumiere_damour_master.mp4");

  execSync(`ffmpeg -y -f concat -safe 0 -i ${listFile} -c:v libx264 -preset fast -crf 18 -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30" -an ${rawConcat}`, { stdio: "pipe" });
  execSync(`ffmpeg -y -i ${rawConcat} -i ${audio24s} -c:v copy -c:a aac -b:a 320k -shortest ${finalVideo}`, { stdio: "pipe" });

  console.log(`🎉 MV 05 Successfully Re-stitched: ${finalVideo} (${Math.round(fs.statSync(finalVideo).size / 1024 / 1024)} MB)`);
}

main().catch(err => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
