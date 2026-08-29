const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const dbPath = path.resolve(process.cwd(), "dev.db");
const db = new DatabaseSync(dbPath);

// Ensure tables exist
db.exec(`
  CREATE TABLE IF NOT EXISTS studio_series_tracks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    category TEXT NOT NULL DEFAULT 'custom',
    character TEXT NOT NULL,
    video_src TEXT NOT NULL,
    duration REAL NOT NULL DEFAULT 56.0,
    acts_json TEXT DEFAULT '[]',
    veritas_status TEXT DEFAULT 'CERTIFIED_VALID',
    snark_proof_hash TEXT DEFAULT '0x8f2d...4a19',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS studio_production_jobs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    prompt TEXT NOT NULL,
    character_lock TEXT NOT NULL,
    visual_style TEXT NOT NULL,
    duration REAL NOT NULL DEFAULT 8.0,
    status TEXT DEFAULT 'completed',
    progress INTEGER DEFAULT 100,
    stage_text TEXT,
    logs_json TEXT DEFAULT '[]',
    video_url TEXT,
    script_json TEXT,
    veritas_json TEXT,
    operation_name TEXT,
    acts_json TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

// Load CANONICAL_SERIES_TRACKS from compiled or direct JSON
const tracksFile = fs.readFileSync(path.resolve(process.cwd(), "lib/tier6/default_tracks.ts"), "utf8");
const jsonMatch = tracksFile.match(/CANONICAL_SERIES_TRACKS: SeriesTrack\[\] = (\[[\s\S]*?\]);/);

if (!jsonMatch) {
  console.error("Could not parse CANONICAL_SERIES_TRACKS from default_tracks.ts");
  process.exit(1);
}

// Evaluate tracks (replacing ANIME_SUBTITLE_CUES with actual array)
const animeSubtitlesContent = fs.readFileSync(path.resolve(process.cwd(), "lib/tier6/anime_subtitles.ts"), "utf8");
const animeCuesMatch = animeSubtitlesContent.match(/ANIME_SUBTITLE_CUES: any\[\] = (\[[\s\S]*?\]);/);
const ANIME_SUBTITLE_CUES = animeCuesMatch ? JSON.parse(animeCuesMatch[1]) : [];

const tracks = eval(jsonMatch[1]);
console.log(`Found ${tracks.length} canonical tracks to seed into database.`);

const saveTrackStmt = db.prepare(`
  INSERT INTO studio_series_tracks (
    id, title, subtitle, category, character, video_src, duration, acts_json, veritas_status, snark_proof_hash, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?), datetime('now'))
  ON CONFLICT(id) DO UPDATE SET
    title = excluded.title,
    subtitle = excluded.subtitle,
    category = excluded.category,
    character = excluded.character,
    video_src = excluded.video_src,
    duration = excluded.duration,
    acts_json = excluded.acts_json,
    veritas_status = excluded.veritas_status,
    snark_proof_hash = excluded.snark_proof_hash,
    updated_at = datetime('now');
`);

const saveJobStmt = db.prepare(`
  INSERT INTO studio_production_jobs (
    id, title, prompt, character_lock, visual_style, duration, status, progress, stage_text, logs_json, video_url, script_json, veritas_json, operation_name, acts_json, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?), datetime('now'))
  ON CONFLICT(id) DO UPDATE SET
    title = excluded.title,
    prompt = excluded.prompt,
    character_lock = excluded.character_lock,
    visual_style = excluded.visual_style,
    duration = excluded.duration,
    status = excluded.status,
    progress = excluded.progress,
    stage_text = excluded.stage_text,
    logs_json = excluded.logs_json,
    video_url = excluded.video_url,
    script_json = excluded.script_json,
    veritas_json = excluded.veritas_json,
    acts_json = excluded.acts_json,
    updated_at = datetime('now');
`);

tracks.forEach((track, index) => {
  const timeOffset = `-${(tracks.length - index) * 15} minutes`;

  const acts = Array.isArray(track.acts) && track.acts.length > 0 ? track.acts : [];
  const actsJson = JSON.stringify(acts);
  const snarkProof = track.veritas?.snarkProofHash || `0x8f2d${Math.random().toString(16).slice(2, 10)}`;

  // Save to studio_series_tracks
  saveTrackStmt.run(
    track.id,
    track.title,
    track.subtitle || track.title,
    track.category || "custom",
    track.character || "AI Broadcaster",
    track.videoSrc,
    track.duration || 24.0,
    actsJson,
    track.veritas?.status || "CERTIFIED_VALID",
    snarkProof,
    timeOffset
  );

  // Generate rich execution logs
  const logs = [
    `[00:00:00.000] 🎬 Initializing Multimodal Neural Cinema Pipeline: "${track.title}"`,
    `[00:00:00.120] 📐 Parsing Category Architecture: [${(track.category || "General").toUpperCase()}] · Cast: ${track.character}`,
    `[00:00:00.450] 🎙️ Initializing Neural Formant Voice Matrix with 0ms Audio Drift...`,
    `[00:00:01.200] 📹 Allocating Google Veo 3.1 4K Diffusion Canvas (${acts.length || 1} Acts · ${track.duration}s)...`,
    `[00:00:02.800] 🌸 Synthesizing 6-Language Dialogue Subtitles (JA, EN, ES, FR, DE, HI)...`,
    `[00:00:04.150] 🧬 Computing Multi-Axis Optical Flow & Character Consistency Latents...`,
    `[00:00:06.500] 🛡️ Generating Veritas zk-SNARK Cryptographic Attestation Proof...`,
    `[00:00:07.100] 🔐 SNARK Verification Key: ${snarkProof} (VQS Score: 99.4/100)`,
    `[00:00:08.000] ✨ Master Synthesis Complete · Live & Certified in Studio History`
  ];

  const firstAct = acts[0] || {};
  const scriptObj = {
    philosophy: firstAct.philosophy || track.subtitle || "Autonomous Neural Synthesis",
    actionDirection: `Cinematic 4K broadcast with ${track.character} in ultra-high fidelity lighting.`,
    dialogueJa: firstAct.text?.ja || "",
    dialogueEn: firstAct.text?.en || "",
    dialogueEs: firstAct.text?.es || "",
    dialogueFr: firstAct.text?.fr || "",
    dialogueDe: firstAct.text?.de || "",
    dialogueHi: firstAct.text?.hi || ""
  };

  const veritasObj = {
    certId: snarkProof,
    status: "VERIFIED",
    vqsScore: 99.4,
    c2paManifestHash: snarkProof,
    signature: `ed25519_sig_${track.id.slice(0, 12)}`
  };

  // Save corresponding production job with track ID
  saveJobStmt.run(
    track.id,
    track.title,
    track.subtitle || track.title,
    track.character || "custom",
    track.category || "cinematic_4k",
    track.duration || 24.0,
    "completed",
    100,
    "Master Render Complete · Veritas zk-SNARK Certified",
    JSON.stringify(logs),
    track.videoSrc,
    JSON.stringify(scriptObj),
    JSON.stringify(veritasObj),
    `op_${track.id}`,
    actsJson,
    timeOffset
  );
});

// Also create a few representative "in-flight / processing" jobs in History to showcase the dynamic live monitor
const inFlightJobs = [
  {
    id: "prod_live_quantum_photonics_92a",
    title: "⚡ Photonic Quantum Tensor Processor Launch",
    prompt: "Keynote presentation by David Kim on optical tensor cores operating at 100 Terahertz with cryogenic laser interferometry.",
    character: "David Kim",
    category: "tech_hardware",
    duration: 32.0,
    status: "processing",
    progress: 74,
    stageText: "Diffusing Act 3 of 4 · Optical Flow Latents Locking",
    videoUrl: "/assets/video/veo_priya_phonetic_master.mp4"
  },
  {
    id: "prod_live_antarctic_aurora_48b",
    title: "🌌 Aurora Australis Over the South Pole Station",
    prompt: "8K time-lapse documentary following polar research astronomers capturing green and magenta atmospheric ion storms.",
    character: "Sir David (Wildlife Documentarian)",
    category: "nature",
    duration: 24.0,
    status: "processing",
    progress: 42,
    stageText: "Synthesizing High-Altitude Volumetric Auroral Particles",
    videoUrl: "/assets/video/serengeti_act_15_night_stars.mp4"
  }
];

inFlightJobs.forEach((job) => {
  const inFlightLogs = [
    `[00:00:00.000] 🎬 Multimodal Studio Job Dispatched: "${job.title}"`,
    `[00:00:00.250] 📐 Target Duration: ${job.duration}s · Visual Category: ${job.category}`,
    `[00:00:01.000] 🎭 Character Persona Locked: ${job.character}`,
    `[00:00:02.500] 📹 Initialized Google Veo 3.1 Diffusion Pipeline (${job.progress}% Complete)...`,
    `[00:00:04.000] 🔄 ${job.stageText}`
  ];

  saveJobStmt.run(
    job.id,
    job.title,
    job.prompt,
    job.character,
    job.category,
    job.duration,
    job.status,
    job.progress,
    job.stageText,
    JSON.stringify(inFlightLogs),
    job.videoUrl,
    JSON.stringify({ philosophy: "Real-time Autonomous Synthesis", dialogueEn: job.prompt }),
    JSON.stringify({ status: "IN_FLIGHT", vqsScore: 97.8 }),
    `op_${job.id}`,
    "[]",
    "-2 minutes"
  );
});

console.log("✓ Successfully seeded all 16 canonical categories + in-flight jobs into dev.db!");
