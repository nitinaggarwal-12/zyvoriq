import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

try { process.loadEnvFile(".env.local"); } catch {}
const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!key) throw new Error("No API key");

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const VIDEOS = [
  {
    id: "mv_01_fuego_y_arena",
    title: "Fuego y Arena — Camila Morales & The Seville Flamenco Squad",
    anchor: "public/assets/stills/mv_01_fuego_y_arena_poster.jpg",
    audio: "scratch/productions/mv_01_fuego_y_arena/lyria_master.mp3",
    shots: [
      { num: 1, prompt: "Cinematic wide shot of the radiant Spanish pop soloist in ruby-red modern flamenco dress and matching dancers performing flamenco choreography in the sunlit Seville courtyard at golden hour, Master Anamorphic, 9:16 vertical, 24fps" },
      { num: 2, prompt: "Cinematic medium tracking shot following the radiant Spanish pop soloist singing passionately with expressive facial articulation while executing sharp flamenco spins in the sunlit Seville courtyard, ruby-red ruffles billowing, Master Anamorphic, 9:16 vertical, 24fps" },
      { num: 3, prompt: "Cinematic low-angle camera arc around the radiant Spanish pop soloist and her dance crew in ruby-red dresses hitting the celebratory chorus drop finale pose in the sunlit Seville courtyard, joyous smiles, warm golden sunlight, Master Anamorphic, 9:16 vertical, 24fps" }
    ]
  },
  {
    id: "mv_02_supernova_velocity",
    title: "Supernova Velocity — Min-Ji & The Seoul Wave Troupe",
    anchor: "public/assets/stills/mv_02_supernova_velocity_poster.jpg",
    audio: "scratch/productions/mv_02_supernova_velocity/lyria_kpop_master.mp3",
    shots: [
      { num: 1, prompt: "Cinematic wide shot of the charismatic Korean dance pop soloist in holographic silver-violet metallic jacket and sleek high ponytail dancing synchronized sharp K-Pop choreography with her crew on the wet reflective glass stage surrounded by glowing purple-cyan LED pillars in Seoul, 9:16 vertical, 24fps" },
      { num: 2, prompt: "Cinematic medium tracking shot following the charismatic Korean dance pop soloist singing expressively while executing energetic K-Pop choreography on the reflective glass stage with glowing cyan neon pillars in Seoul, holographic silver-violet jacket shimmering, 9:16 vertical, 24fps" },
      { num: 3, prompt: "Cinematic dynamic low-angle camera orbit around the charismatic Korean dance pop soloist and crew locking their explosive chorus drop formation on the glowing reflective glass Seoul stage, neon light beams, confident smile, 9:16 vertical, 24fps" }
    ]
  },
  {
    id: "mv_03_lagos_midnight_sun",
    title: "Lagos Midnight Sun — Amara & The Eko Dance Collective",
    anchor: "public/assets/stills/mv_03_lagos_midnight_sun_poster.jpg",
    audio: "scratch/productions/mv_03_lagos_midnight_sun/lyria_afrobeats_master.mp3",
    shots: [
      { num: 1, prompt: "Cinematic wide shot of the radiant Nigerian afrobeats vocalist in shimmering emerald-green and gold streetwear tracksuit performing fluid afro-fusion dance moves with her crew on the Lagos rooftop terrace at sunset, skyline glowing in twilight, 9:16 vertical, 24fps" },
      { num: 2, prompt: "Cinematic medium tracking shot of the radiant Nigerian afrobeats vocalist singing joyfully with expressive facial articulation and rhythmic body rolls on the Lagos rooftop at sunset, emerald-green and gold tracksuit shimmering under amber string lights, 9:16 vertical, 24fps" },
      { num: 3, prompt: "Cinematic dynamic low-angle camera tracking around the radiant Nigerian afrobeats vocalist and full dance collective hitting the infectious chorus bounce together on the Lagos rooftop against the golden twilight skyline, pure celebration, 9:16 vertical, 24fps" }
    ]
  },
  {
    id: "mv_04_nachle_dholna",
    title: "Nachle Dholna — Simran Kaur & The Punjab Folk Ensemble",
    anchor: "public/assets/stills/mv_04_nachle_dholna_poster.jpg",
    audio: "scratch/productions/mv_04_nachle_dholna/lyria_punjabi_master.mp3",
    shots: [
      { num: 1, prompt: "Cinematic wide shot of the graceful Punjabi festival soloist in royal magenta and gold embroidered salwar kameez performing joyful bhangra folk choreography with female dancers in an ornate palace courtyard decorated with marigolds at sunset, 9:16 vertical, 24fps" },
      { num: 2, prompt: "Cinematic medium tracking shot following the graceful Punjabi festival soloist singing celebrating with expressive smile and radiant eyes while executing rhythmic Punjabi folk claps and twirls in the marigold-adorned palace courtyard, magenta fabric swaying, 9:16 vertical, 24fps" },
      { num: 3, prompt: "Cinematic festive low-angle camera sweep around the graceful Punjabi festival soloist and ensemble dancing the high-energy chorus finale in the palace courtyard, marigold petals showering, radiant joyful festive atmosphere, 9:16 vertical, 24fps" }
    ]
  },
  {
    id: "mv_05_lumiere_damour",
    title: "Lumière d'Amour — Camille & The Parisian Modern Ballet",
    anchor: "public/assets/stills/mv_05_lumiere_damour_poster.jpg",
    audio: "scratch/productions/mv_05_lumiere_damour/lyria_french_touch_master.mp3",
    shots: [
      { num: 1, prompt: "Cinematic wide shot of the elegant Parisian ballet soloist in champagne gold and iridescent white pleated tulle gown executing expressive modern contemporary ballet dance across the parquet floor of a grand gilded Parisian mirrored salon with crystal chandeliers, twilight outside windows, 9:16 vertical, 24fps" },
      { num: 2, prompt: "Cinematic medium tracking shot following the elegant Parisian ballet soloist gliding through graceful ballet pirouettes and emotive singing performance inside the grand mirrored salon, champagne gold tulle catching the warm chandelier glow, 9:16 vertical, 24fps" },
      { num: 3, prompt: "Cinematic low-angle camera arc around the elegant Parisian ballet soloist as she completes a dramatic soaring arabesque and graceful closing pose in the gilded salon beneath the crystal chandelier, Parisian twilight in background, 9:16 vertical, 24fps" }
    ]
  }
];

async function dispatchVeoShot(prompt, imageB64, durationSeconds = 8) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-fast-generate-preview:predictLongRunning?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instances: [{
        prompt,
        image: { bytesBase64Encoded: imageB64, mimeType: "image/jpeg" }
      }],
      parameters: { aspectRatio: "9:16", durationSeconds }
    })
  });
  const d = await res.json();
  if (!res.ok || !d.name) {
    throw new Error(`Veo dispatch failed: ${JSON.stringify(d)}`);
  }
  return d.name;
}

async function pollAndDownload(opName, targetFile) {
  console.log(`⏳ Polling ${opName}...`);
  for (let i = 1; i <= 40; i++) {
    await sleep(6000);
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${opName}?key=${key}`);
    const d = await res.json();
    if (d.error) throw new Error(`Veo error: ${d.error.message}`);
    if (d.done) {
      const uri = d.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
      if (!uri) throw new Error("Veo done without video uri");
      console.log(`⬇️ Downloading ${targetFile}...`);
      const dl = await fetch(`${uri}&key=${key}`);
      const buf = Buffer.from(await dl.arrayBuffer());
      fs.writeFileSync(targetFile, buf);
      console.log(`✅ Saved ${targetFile} (${Math.round(buf.length / 1024)} KB)`);
      return buf;
    }
  }
  throw new Error(`Timeout polling ${opName}`);
}

async function main() {
  console.log("========================================================================");
  console.log("🚀 FAST BATCH MULTI-VIDEO ANCHOR-LOCKED GENERATOR");
  console.log("========================================================================");

  // Collect tasks that need generation
  const pendingTasks = [];

  for (const v of VIDEOS) {
    const shotsDir = path.resolve(process.cwd(), `scratch/productions/${v.id}/shots`);
    fs.mkdirSync(shotsDir, { recursive: true });
    const anchorBuf = fs.readFileSync(path.resolve(process.cwd(), v.anchor));
    const anchorB64 = anchorBuf.toString("base64");

    for (const s of v.shots) {
      const shotFile = path.join(shotsDir, `shot_0${s.num}.mp4`);
      if (fs.existsSync(shotFile) && fs.statSync(shotFile).size > 500000) {
        console.log(`✅ [${v.id}] Shot ${s.num} already exists, skipping.`);
      } else {
        pendingTasks.push({
          videoId: v.id,
          num: s.num,
          prompt: s.prompt,
          anchorB64,
          targetFile: shotFile
        });
      }
    }
  }

  console.log(`\n📋 Total Pending Shots to Generate: ${pendingTasks.length}`);

  // Run in concurrent batches of 4
  const BATCH_SIZE = 4;
  for (let i = 0; i < pendingTasks.length; i += BATCH_SIZE) {
    const batch = pendingTasks.slice(i, i + BATCH_SIZE);
    console.log(`\n--- [DISPATCHING BATCH ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(pendingTasks.length / BATCH_SIZE)}] (${batch.length} shots) ---`);

    const dispatched = [];
    for (const item of batch) {
      console.log(`🎥 Dispatching ${item.videoId} shot 0${item.num}...`);
      const opName = await dispatchVeoShot(item.prompt, item.anchorB64);
      console.log(`   Operation: ${opName}`);
      dispatched.push({ ...item, opName });
      await sleep(1500); // 1.5s spacing between dispatches
    }

    console.log(`\n⏳ Polling batch concurrently...`);
    await Promise.all(dispatched.map(item => pollAndDownload(item.opName, item.targetFile)));
    console.log(`🎉 Batch finished!`);
  }

  // Now stitch and mux all 5 videos
  console.log("\n========================================================================");
  console.log("🎞️ STITCHING & PERSISTING ALL 5 MASTER VIDEOS");
  console.log("========================================================================");

  for (const v of VIDEOS) {
    const baseDir = path.resolve(process.cwd(), `scratch/productions/${v.id}`);
    const shotsDir = path.join(baseDir, "shots");
    const shotFiles = [
      path.join(shotsDir, "shot_01.mp4"),
      path.join(shotsDir, "shot_02.mp4"),
      path.join(shotsDir, "shot_03.mp4")
    ];

    for (const f of shotFiles) {
      if (!fs.existsSync(f) || fs.statSync(f).size < 500000) {
        throw new Error(`Missing shot file: ${f}`);
      }
    }

    const listFile = path.join(baseDir, "shots.txt");
    fs.writeFileSync(listFile, shotFiles.map(f => `file '${f}'`).join("\n") + "\n");

    const rawConcat = path.join(baseDir, "raw_concat.mp4");
    console.log(`🎬 Stitching ${v.id}...`);
    execSync(`ffmpeg -y -f concat -safe 0 -i ${listFile} -c:v libx264 -preset fast -crf 18 -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30" -an ${rawConcat}`, { stdio: "pipe" });

    const rawAudio = path.resolve(process.cwd(), v.audio);
    const audio24s = path.join(baseDir, "lyria_24s.mp3");
    execSync(`ffmpeg -y -i ${rawAudio} -af "afade=t=in:ss=0:d=0.2,afade=t=out:st=23.5:d=0.5" -t 24 ${audio24s}`, { stdio: "pipe" });

    const finalVideo = path.resolve(process.cwd(), `public/assets/video/${v.id}_master.mp4`);
    execSync(`ffmpeg -y -i ${rawConcat} -i ${audio24s} -c:v copy -c:a aac -b:a 320k -shortest ${finalVideo}`, { stdio: "pipe" });
    console.log(`✅ Persisted Master Video: ${finalVideo} (${Math.round(fs.statSync(finalVideo).size / 1024 / 1024)} MB)`);
  }

  console.log("\n🚀 All 5 international music videos successfully generated and assembled!");
}

main().catch(err => {
  console.error("❌ Fatal Error:", err);
  process.exit(1);
});
