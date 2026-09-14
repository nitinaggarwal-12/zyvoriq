import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { generateVeoClip } from "./generate_international_music_video.mjs";

try { process.loadEnvFile(".env.local"); } catch {}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const PRODUCTIONS = [
  {
    id: "mv_01_fuego_y_arena",
    title: "Fuego y Arena — Camila Morales & The Seville Flamenco Squad",
    poster: "public/assets/stills/mv_01_fuego_y_arena_poster.jpg",
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
    poster: "public/assets/stills/mv_02_supernova_velocity_poster.jpg",
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
    poster: "public/assets/stills/mv_03_lagos_midnight_sun_poster.jpg",
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
    poster: "public/assets/stills/mv_04_nachle_dholna_poster.jpg",
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
    poster: "public/assets/stills/mv_05_lumiere_damour_poster.jpg",
    audio: "scratch/productions/mv_05_lumiere_damour/lyria_french_touch_master.mp3",
    shots: [
      { num: 1, prompt: "Cinematic wide shot of the elegant Parisian ballet soloist in champagne gold and iridescent white pleated tulle gown executing expressive modern contemporary ballet dance across the parquet floor of a grand gilded Parisian mirrored salon with crystal chandeliers, twilight outside windows, 9:16 vertical, 24fps" },
      { num: 2, prompt: "Cinematic medium tracking shot following the elegant Parisian ballet soloist gliding through graceful ballet pirouettes and emotive singing performance inside the grand mirrored salon, champagne gold tulle catching the warm chandelier glow, 9:16 vertical, 24fps" },
      { num: 3, prompt: "Cinematic low-angle camera arc around the elegant Parisian ballet soloist as she completes a dramatic soaring arabesque and graceful closing pose in the gilded salon beneath the crystal chandelier, Parisian twilight in background, 9:16 vertical, 24fps" }
    ]
  }
];

export async function produceVideo(prod) {
  console.log(`\n========================================================================`);
  console.log(`🎬 PRODUCING: ${prod.title}`);
  console.log(`========================================================================`);

  const baseDir = path.resolve(process.cwd(), `scratch/productions/${prod.id}`);
  const shotsDir = path.join(baseDir, "shots");
  const anchorsDir = path.join(baseDir, "anchors");
  fs.mkdirSync(shotsDir, { recursive: true });
  fs.mkdirSync(anchorsDir, { recursive: true });

  const anchorPath = path.resolve(process.cwd(), prod.poster);
  if (!fs.existsSync(anchorPath)) {
    throw new Error(`Anchor poster missing: ${anchorPath}`);
  }
  const anchorBuf = fs.readFileSync(anchorPath);
  console.log(`🔒 Using Character Anchor: ${prod.poster} (${Math.round(anchorBuf.length / 1024)} KB)`);

  // Ensure 24s Lyria Audio exists
  const rawAudioPath = path.resolve(process.cwd(), prod.audio);
  if (!fs.existsSync(rawAudioPath)) {
    throw new Error(`Lyria audio missing: ${rawAudioPath}`);
  }
  const audio24s = path.join(baseDir, "lyria_24s.mp3");
  execSync(`ffmpeg -y -i ${rawAudioPath} -af "afade=t=in:ss=0:d=0.2,afade=t=out:st=23.5:d=0.5" -t 24 ${audio24s}`, { stdio: "pipe" });
  console.log(`🎵 Master 24s Lyria Audio ready: ${audio24s}`);

  // Generate 3 dedicated shots conditioned on anchor
  const shotFiles = [];
  for (const s of prod.shots) {
    const shotPath = path.join(shotsDir, `shot_0${s.num}.mp4`);
    if (fs.existsSync(shotPath) && fs.statSync(shotPath).size > 500000) {
      console.log(`✅ Shot ${s.num}/3 already exists (${Math.round(fs.statSync(shotPath).size / 1024)} KB)`);
      shotFiles.push(shotPath);
      continue;
    }

    console.log(`\n🎥 [SHOT ${s.num}/3] Diffusing with anchor lock: "${s.prompt.slice(0, 70)}..."`);
    const clipBuf = await generateVeoClip(s.prompt, 8, 3, anchorBuf);
    fs.writeFileSync(shotPath, clipBuf);
    console.log(`✅ Shot ${s.num}/3 Saved (${Math.round(clipBuf.length / 1024)} KB)`);
    shotFiles.push(shotPath);
    await sleep(2000);
  }

  // Concatenate and scale to 1080x1920 30fps
  console.log(`\n🎞️ Stitching 3 shots with zero fake looping...`);
  const listFile = path.join(baseDir, "shots.txt");
  fs.writeFileSync(listFile, shotFiles.map(f => `file '${f}'`).join("\n") + "\n");

  const rawConcat = path.join(baseDir, "raw_concat.mp4");
  execSync(`ffmpeg -y -f concat -safe 0 -i ${listFile} -c:v libx264 -preset fast -crf 18 -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30" -an ${rawConcat}`, { stdio: "pipe" });

  const finalVideo = path.resolve(process.cwd(), `public/assets/video/${prod.id}_master.mp4`);
  execSync(`ffmpeg -y -i ${rawConcat} -i ${audio24s} -c:v copy -c:a aac -b:a 320k -shortest ${finalVideo}`, { stdio: "pipe" });
  console.log(`🎉 Master Video PERSISTED: ${finalVideo} (${Math.round(fs.statSync(finalVideo).size / 1024 / 1024)} MB)`);

  return finalVideo;
}

async function main() {
  const targetId = process.argv[2];
  const list = targetId ? PRODUCTIONS.filter(p => p.id === targetId) : PRODUCTIONS;

  console.log(`========================================================================`);
  console.log(`🚀 ZYVORIQ ANCHOR-LOCKED ZERO-DRIFT MUSIC VIDEO PIPELINE`);
  console.log(`   Targeting ${list.length} productions: ${list.map(p => p.id).join(", ")}`);
  console.log(`========================================================================`);

  for (const prod of list) {
    try {
      await produceVideo(prod);
    } catch (err) {
      console.error(`❌ Failed producing ${prod.id}:`, err);
    }
  }

  console.log("\n✅ ALL REQUESTED PRODUCTIONS FINISHED.");
}

if (process.argv[1] && process.argv[1].endsWith("produce_anchor_locked_music_videos.mjs")) {
  main().catch(console.error);
}
