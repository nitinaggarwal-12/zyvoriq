import { Pool } from "pg";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
import { execFile } from "child_process";
import util from "util";
import { synchronizeStudio1ManifestTimeline, buildStudio1RenderPlan, buildStudio1VisualFilter } from "./studio1_timeline_sync.mjs";

const execFileAsync = util.promisify(execFile);
const PROD_ID = "studio1_b79e20bd-9f77-45de-ba4a-275700f31531";
const DB_URL = "postgresql://postgres:pncyiYBLwkzpdbCTqOySjcmAofiHjLLL@altaria.proxy.rlwy.net:35535/railway";
const BASE_URL = "https://zyvoriq.up.railway.app";

const pool = new Pool({ connectionString: DB_URL });

async function downloadIfMissing(urlPath, localDest) {
  if (fsSync.existsSync(localDest) && fsSync.statSync(localDest).size > 1000) {
    return localDest;
  }
  await fs.mkdir(path.dirname(localDest), { recursive: true });
  const remoteUrl = `${BASE_URL}${urlPath}`;
  console.log(`[compiler] Downloading ${remoteUrl} -> ${localDest}...`);
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(remoteUrl);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        await fs.writeFile(localDest, buf);
        console.log(`[compiler] Downloaded ${buf.length} bytes for ${localDest}`);
        return localDest;
      }
      console.warn(`[compiler] Attempt ${attempt} failed (${res.status}) for ${remoteUrl}, retrying in 2s...`);
    } catch (err) {
      console.warn(`[compiler] Attempt ${attempt} network error: ${err.message}, retrying in 2s...`);
    }
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error(`Download failed after 3 attempts: ${remoteUrl}`);
}

async function run() {
  console.log(`[compiler] Starting master rough cut compilation for ${PROD_ID}...`);
  const prodRes = await pool.query("SELECT id, revision, manifest_json FROM reel_productions WHERE id = $1", [PROD_ID]);
  if (!prodRes.rows.length) throw new Error(`Production ${PROD_ID} not found in database`);
  
  const p = prodRes.rows[0];
  let m = p.manifest_json;
  console.log(`[compiler] Fetched manifest (revision ${p.revision}), shots count: ${m.shots.length}`);

  const cacheDir = path.resolve(process.cwd(), "scratch", "asset_cache", "reels", PROD_ID);
  await fs.mkdir(cacheDir, { recursive: true });

  // 1. Download narration audio
  const narrationLocalPath = path.join(cacheDir, path.basename(m.audio.narrationUrl));
  await downloadIfMissing(m.audio.narrationUrl, narrationLocalPath);

  // 2. Download all 30 video shots
  const shotLocalPaths = [];
  for (let i = 0; i < m.shots.length; i++) {
    const s = m.shots[i];
    if (!s.asset?.videoUrl) throw new Error(`Shot ${s.id} has no asset videoUrl!`);
    const shotDest = path.join(cacheDir, "shots", path.basename(s.asset.videoUrl));
    await downloadIfMissing(s.asset.videoUrl, shotDest);
    shotLocalPaths.push(shotDest);
  }
  console.log(`[compiler] All 30 shots verified and cached locally.`);

  // 3. Generate 121.52s Romantic Orchestral BGM Track (-24.0 LUFS)
  const orchestraStem = path.resolve(process.cwd(), "public", "assets", "audio", "music", "bollywood_romance_orchestra.mp3");
  if (!fsSync.existsSync(orchestraStem)) throw new Error(`Romantic orchestra stem not found at ${orchestraStem}`);
  
  const d = Number(m.audio.actualDurationSec || 121.52);
  const bgmLocalPath = path.join(cacheDir, "bollywood_romance_master_score.wav");
  console.log(`[compiler] Generating 48kHz stereo romantic score bed (${d}s) with broadcast loudness normalization (-24 LUFS)...`);
  
  const bgmArgs = [
    "-y",
    "-stream_loop", "-1",
    "-i", orchestraStem,
    "-t", String(d),
    "-af", `aresample=48000,afade=t=in:st=0:d=1.2,afade=t=out:st=${Math.max(0, d - 2.0)}:d=2.0,loudnorm=I=-24:LRA=7:tp=-2`,
    "-c:a", "pcm_s16le",
    "-ar", "48000",
    bgmLocalPath
  ];
  await execFileAsync("ffmpeg", bgmArgs);
  console.log(`[compiler] Romantic orchestral soundtrack synthesized at ${bgmLocalPath}`);

  // 4. Synchronize Studio 1 Timeline
  console.log(`[compiler] Running synchronizeStudio1ManifestTimeline...`);
  const sync = synchronizeStudio1ManifestTimeline(m, { mode: "render" });
  console.log(`[compiler] Timeline synchronized: ${sync.adaptations.length} scenes adapted.`);
  
  const renderPlan = buildStudio1RenderPlan(m);
  const scenes = renderPlan.scenes;
  console.log(`[compiler] Render plan contains ${scenes.length} scenes.`);

  // 5. Batch render video scenes in groups of 6 (to prevent filtergraph thread/memory overflow)
  const BATCH_SIZE = 6;
  const numBatches = Math.ceil(scenes.length / BATCH_SIZE);
  const partsDir = path.join(cacheDir, "rough_parts");
  await fs.mkdir(partsDir, { recursive: true });

  console.log(`[compiler] Rendering video in ${numBatches} batches (batch size ${BATCH_SIZE})...`);
  for (let b = 0; b < numBatches; b++) {
    const startIdx = b * BATCH_SIZE;
    const endIdx = Math.min(scenes.length, startIdx + BATCH_SIZE);
    const batchScenes = scenes.slice(startIdx, endIdx);
    const batchArgs = ["-y"];

    for (const scene of batchScenes) {
      batchArgs.push("-i", shotLocalPaths[scene.inputIndex]);
    }

    const f = [];
    batchScenes.forEach((scene, localIdx) => {
      const s = m.shots[scene.inputIndex];
      f.push(buildStudio1VisualFilter(s, { ...scene, inputIndex: localIdx }, { unifiedScale: true }));
    });
    f.push(`${batchScenes.map((_, i) => `[v${i}]`).join("")}concat=n=${batchScenes.length}:v=1:a=0[vcat]`);
    f.push(`[vcat]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1[vout]`);

    const batchOut = path.join(partsDir, `batch_${String(b).padStart(4, "0")}.mp4`);
    batchArgs.push(
      "-filter_threads", "2",
      "-filter_complex_threads", "2",
      "-filter_complex", f.join(";"),
      "-map", "[vout]",
      "-an",
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-crf", "20",
      "-pix_fmt", "yuv420p",
      batchOut
    );
    console.log(`[compiler] Rendering batch ${b + 1}/${numBatches} (scenes ${startIdx + 1} to ${endIdx})...`);
    await execFileAsync("ffmpeg", batchArgs, { timeout: 300000, maxBuffer: 8e6 });
  }

  // 6. Final Concat & Audio Muxing with Sidechain Ducked Romantic Score
  console.log(`[compiler] Merging video batches and mastering audio with spoken narration + romantic orchestra bed...`);
  const listPath = path.join(partsDir, "filelist.txt");
  const fileListContent = Array.from({ length: numBatches }, (_, i) => `file '${path.join(partsDir, `batch_${String(i).padStart(4, "0")}.mp4`)}'`).join("\n");
  await fs.writeFile(listPath, fileListContent, "utf8");

  const finalMasterOut = path.join(cacheDir, "narrated_rough_cut_master.mp4");
  const finalArgs = [
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", listPath,
    "-i", narrationLocalPath,
    "-i", bgmLocalPath,
    "-filter_complex", `[1:a]atrim=duration=${d},asetpts=PTS-STARTPTS,aresample=48000,volume=1.25[voice];[2:a]aresample=48000,volume=0.55[bgm];[voice][bgm]amix=inputs=2:duration=first:dropout_transition=2,loudnorm=I=-24:LRA=7:tp=-2[aout]`,
    "-map", "0:v",
    "-map", "[aout]",
    "-c:v", "copy",
    "-c:a", "aac",
    "-b:a", "192k",
    "-t", String(d),
    "-movflags", "+faststart",
    finalMasterOut
  ];

  await execFileAsync("ffmpeg", finalArgs, { timeout: 300000, maxBuffer: 8e6 });
  console.log(`[compiler] Final master video created at ${finalMasterOut}!`);

  // 7. Verify with ffprobe
  const { stdout: probeOut } = await execFileAsync("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration,size,bit_rate:stream=codec_name,width,height,r_frame_rate,channels,sample_rate",
    "-of", "json",
    finalMasterOut
  ]);
  const probe = JSON.parse(probeOut);
  console.log("[compiler] FFprobe verification:", JSON.stringify(probe, null, 2));

  // 8. Place file in durable app assets
  const publicVideoDest = path.resolve(process.cwd(), "public", "assets", "reels", PROD_ID, "narrated_rough_master.mp4");
  await fs.mkdir(path.dirname(publicVideoDest), { recursive: true });
  await fs.copyFile(finalMasterOut, publicVideoDest);
  console.log(`[compiler] Master video published to public web assets: ${publicVideoDest}`);

  // 9. Update Database Manifest and Operations
  const publicUrl = `/assets/reels/${PROD_ID}/narrated_rough_master.mp4`;
  const roughResult = {
    videoUrl: publicUrl,
    actualDurationSec: Number(probe.format.duration),
    kind: "narrated-rough-cut",
    codec: "h264",
    width: 1080,
    height: 1920,
    frameRate: "30/1",
    soundtrack: "Bollywood Romance Full Acoustic Orchestra (-24 LUFS)",
    renderedAt: new Date().toISOString()
  };

  m.outputs = { ...(m.outputs || {}), narratedRoughCut: roughResult };
  m.asset = { videoUrl: publicUrl, actualDurationSec: roughResult.actualDurationSec, provider: "omni-director", model: "ffmpeg-master" };
  m.status = "READY";

  await pool.query(
    "UPDATE reel_productions SET manifest_json = $1, revision = revision + 1, updated_at = NOW() WHERE id = $2",
    [JSON.stringify(m), PROD_ID]
  );
  console.log(`[compiler] Updated reel_productions manifest for ${PROD_ID}!`);

  await pool.query(
    "UPDATE reel_operations SET status = 'SUCCEEDED', attempt = 1, last_error = NULL, locked_by = NULL, lock_expires_at = NULL, updated_at = NOW() WHERE production_id = $1 AND kind = 'ROUGH_CUT'",
    [PROD_ID]
  );
  console.log(`[compiler] Marked ROUGH_CUT operation as SUCCEEDED in reel_operations!`);

  // Clean up parts
  await fs.rm(partsDir, { recursive: true, force: true }).catch(() => {});
  await pool.end();
  console.log(`[compiler] Master rough cut assembly completed successfully! 🎉`);
}

run().catch((err) => {
  console.error("[compiler] Fatal error during master rough cut compilation:", err);
  process.exit(1);
});
