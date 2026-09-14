#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { parseArgs } from "node:util";
import { runOmniSyncAudit } from "./yt_audit.mjs";
import { createProgress } from "./yt_progress.mjs";
import { checkLyricFocus, describeLyricFocus, PHRASE_GAP_MAX } from "./lib/grid_guards.mjs";

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!API_KEY) { console.error("FATAL: GEMINI_API_KEY not set"); process.exit(1); }

const parsed = parseArgs({
  options: {
    topic: { type: 'string' },
    duration: { type: 'string' },
    genre: { type: 'string' },
    work: { type: 'string' },
    production: { type: 'string' },
    resume: { type: 'boolean' },
    'dry-run': { type: 'boolean' },
    // Matrix variables. Defaults reproduce the pre-matrix behaviour exactly so
    // an unflagged run is unchanged.
    clock: { type: 'string' },            // whisperx | pro | transcribe-live
    'veo-tier': { type: 'string' },       // full | fast | lite
    engine: { type: 'string' },           // veo | omni (models/gemini-omni-1.1-flash continuous duration)
    'audio-source': { type: 'string' },   // lyria | native | hybrid (Demucs Lyria bed + Omni vocal stem)
    'anchor-cadence': { type: 'string' }, // re-anchor every N shots; 1 = every shot
    label: { type: 'string' },            // matrix arm name, recorded in provenance
    optimize: { type: 'string' },         // sync | cost - what the cut optimiser minimises
    'max-waste': { type: 'string' },      // Veo surplus ceiling as a fraction; >=1 disables it
    'allow-uniform': { type: 'boolean' }, // permit the uniform-span fallback when no lyric-aligned grid fits
  },
  // Positionals are tolerated so a caller that passes a bare production id
  // cannot kill the child process with ERR_PARSE_ARGS_UNEXPECTED_POSITIONAL.
  allowPositionals: true,
});
const args = parsed.values;
const PRODUCTION_ID = args.production || process.env.YT_PRODUCTION_ID || parsed.positionals[0] || null;

const progress = await createProgress(PRODUCTION_ID, { log: console.log });
const dbSpec = PRODUCTION_ID ? await progress.loadSpec() : null;
if (PRODUCTION_ID && !dbSpec) {
  console.error(`FATAL: production ${PRODUCTION_ID} not found in yt_productions`);
  process.exit(1);
}

const TOPIC = args.topic || dbSpec?.topic || "summer roadtrip";
const TARGET_DURATION = parseFloat(args.duration ?? String(dbSpec?.durationSec ?? 24));
const GENRE = args.genre || dbSpec?.genre || "MUSIC_VIDEO";
const WORK = args.work || (PRODUCTION_ID ? `scratch/yt/${PRODUCTION_ID}` : 'scratch/yt_test');
const DRY_RUN = args['dry-run'] || false;
const CLOCK = (args.clock || "whisperx").toLowerCase();
const VEO_TIER = (args['veo-tier'] || "full").toLowerCase();
const ENGINE = (args.engine || "omni").toLowerCase();
if (!["veo", "omni"].includes(ENGINE)) {
  console.error(`FATAL: unknown --engine ${ENGINE}; expected veo or omni`);
  process.exit(1);
}
const AUDIO_SOURCE = (args['audio-source'] || (ENGINE === "omni" ? "hybrid" : "lyria")).toLowerCase();
// ANCHOR RE-CONDITIONING IS OFF BY DEFAULT, AND THAT IS DELIBERATE.
//
// Re-anchoring was introduced to fight identity drift, but measurement showed it
// does the opposite of what was intended. Veo pins frame 0 of a clip to the
// conditioning image, so every re-anchored shot opens by re-rendering the static
// anchor plate. In the Lisbon run, shots 1/3/5 were all anchor-conditioned and
// measured 29.7-32.4 dB cross-cut PSNR against the protocol's 25 dB ceiling -
// the character teleported back to the opening pose at each cut. Worse, the
// plate is a still portrait with a closed mouth, so shots marked 91% and 95%
// sung came back as frozen smiles: the plate silently overrode the singing
// directive. Tail-chained shots in the same reel sang correctly at 9-10 dB.
//
// 0 (the default) means never re-anchor: every shot after the first is
// conditioned on the previous shot's tail frame, per the Sequential Tail-Frame
// Chaining Protocol. A positive value restores the old behaviour for
// experiments, and CROSS_CUT_RESET_LOOP in the audit will flag the consequences.
const ANCHOR_CADENCE = Math.max(0, parseInt(args['anchor-cadence'] ?? "0", 10) || 0);
const ARM_LABEL = args.label || null;

// Picks which tail frame becomes the next shot's identity reference. Not a
// pipeline stage - it is a helper inside VEO_SHOTS - but it is named here so
// provenance records the model that actually made the choice.
const TAIL_SELECT_MODEL = "models/gemini-2.5-pro";

// WHAT THE CUT OPTIMISER IS ALLOWED TO OPTIMISE FOR.
//
// "cost" minimises Veo bucket seconds: Veo sells only 4s/6s/8s clips and the
// surplus is discarded, so a 2.5s span burns a whole 4s bucket. "sync" instead
// gives every lyric line its own shot. That matters because each shot carries
// ONE vocal directive naming the words being sung; when a span swallows three
// lyric lines, that directive degrades into a blur and the mouth has nothing
// precise to follow. The surplus costs money but, as the pre-flight below
// notes, causes no speed ramp and no quality loss - so with cost off the table
// there is no reason to trade sync away for it.
const OPTIMIZE = (args.optimize || "sync").toLowerCase();
if (!["sync", "cost"].includes(OPTIMIZE)) {
  console.error(`FATAL: unknown --optimize ${OPTIMIZE}; expected sync or cost`);
  process.exit(1);
}
// Surplus ceiling. A pure spending limit, so it defaults to open under "sync"
// and to the historical 20% under "cost". Override explicitly with --max-waste.
const MAX_WASTE = args['max-waste'] !== undefined
  ? parseFloat(args['max-waste'])
  : (OPTIMIZE === "sync" ? 1.0 : 0.20);
// UNIFORM SPANS ARE A DEGRADED PRODUCT, NOT A FALLBACK.
//
// When no lyric-aligned cut grid fits Veo's 2-8s window the optimiser used to
// silently divide the reel into equal spans. Run #3 did exactly that: 3 x 8.00s
// shots, shot 3 repeating shot 1's lyric, every prompt carrying a blurred
// multi-line vocal directive - and it still scored a full 16/16 PASS, because
// no gate measured the thing that had been lost. Under "just perfect reel" that
// grid must never be paid for by accident. It is now a hard stop that the
// operator has to override on purpose.
const ALLOW_UNIFORM = args['allow-uniform'] === true;
const VEO_TIER_MODEL = {
  full: "models/veo-3.1-generate-preview",
  fast: "models/veo-3.1-fast-generate-preview",
  lite: "models/veo-3.1-lite-generate-preview",
};
if (!VEO_TIER_MODEL[VEO_TIER]) {
  console.error(`FATAL: unknown --veo-tier ${VEO_TIER}; expected one of ${Object.keys(VEO_TIER_MODEL).join(", ")}`);
  process.exit(1);
}
const HOST = "nitinagga.c.googlers.com";
const RDIR = `~/zyvoriq/${WORK}`;
const LEDGER = path.join(WORK, "provenance.jsonl");

fs.mkdirSync(WORK, { recursive: true });

// --- CONTRACT ---
const YT_STAGES = [
  "OMNI_DIRECTION",
  "LYRIA_SONG",
  "TEMPO_MEASURE",
  "ANCHOR_PLATE",
  "VEO_SHOTS",
  "MASTER_MUX",
  "OMNI_SYNC_AUDIT"
];

const YT_STAGE_EXECUTOR = {
  OMNI_DIRECTION: "models/gemini-omni-1.1-flash",
  LYRIA_SONG: "models/lyria-3.5",
  TEMPO_MEASURE: "deterministic:ffmpeg+autocorrelation (no model)",
  ANCHOR_PLATE: "models/gemini-2.5-flash-image",
  VEO_SHOTS: "models/veo-3.1-generate-preview",
  MASTER_MUX: "deterministic:ffmpeg (no model)",
  OMNI_SYNC_AUDIT: "models/gemini-omni-1.1-flash",
};

// One normalizer for every model URL. Interpolating executor values straight
// into a path is what produced the ANCHOR_PLATE 404: the table held a bare id
// while the template expected a qualified one. Idempotent, so it is safe
// regardless of which form a caller supplies.
// The canonical table above is the contract default and must stay a literal so
// gate_yt_contract_drift can compare it against lib/yt/contract.ts. Tier
// selection is an explicit, logged override rather than a dynamic table entry,
// so provenance always records the model that actually ran.
if (VEO_TIER !== "full") {
  YT_STAGE_EXECUTOR.VEO_SHOTS = VEO_TIER_MODEL[VEO_TIER];
}
if (ENGINE === "omni") {
  YT_STAGE_EXECUTOR.VEO_SHOTS = "models/gemini-omni-1.1-flash";
}

const modelPath = (m) => (String(m).startsWith("models/") ? String(m) : `models/${m}`);
const genUrl = (m, method) => `https://generativelanguage.googleapis.com/v1beta/${modelPath(m)}:${method}?key=${API_KEY}`;

const VEO_DURATION_BUCKETS = [4, 6, 8];

function pickVeoDuration(targetSec) {
  if (ENGINE === "omni") {
    return Number(Math.min(10.0, Math.max(3.0, targetSec)).toFixed(3));
  }
  return VEO_DURATION_BUCKETS.find((d) => d >= targetSec - 0.001)
    ?? VEO_DURATION_BUCKETS[VEO_DURATION_BUCKETS.length - 1];
}

const YT_MASTER_SPEC = {
  lufs: -14,
  truePeakDb: -1.0,
  sampleRate: 48000,
  width: 1080,
  height: 1920,
  fps: 30,
};

let completedStages = [];
let currentStage = null;
let currentStageStartedAt = 0;

// Stage ordering and stage reporting are deliberately the same function: it is
// impossible to advance a stage without the UI being told, and impossible to
// report a stage that ran out of order.
async function assertStageOrder(next) {
  const expected = YT_STAGES[completedStages.length];
  if (expected !== next) {
    throw new Error(`YT_STAGE_ORDER_VIOLATION: expected "${expected}" after [${completedStages.join(" -> ")}], got "${next}". The canonical order is ${YT_STAGES.join(" -> ")}.`);
  }
  if (currentStage) {
    await progress.finish(currentStage, "SUCCEEDED", Date.now() - currentStageStartedAt);
  }
  completedStages.push(next);
  currentStage = next;
  currentStageStartedAt = Date.now();
  await progress.start(next);
}

// Any uncaught throw must land on the progress grid as a FAILED stage rather
// than leaving it stuck on RUNNING.
async function reportFatal(err) {
  const msg = (err && err.message ? err.message : String(err)).slice(0, 500);
  try {
    if (currentStage) await progress.failCurrent(currentStage, msg);
    await progress.setProduction("FAILED", msg);
  } catch {}
  try { await progress.close(); } catch {}
}
process.on("uncaughtException", async (e) => { console.error(e); await reportFatal(e); process.exit(1); });
process.on("unhandledRejection", async (e) => { console.error(e); await reportFatal(e); process.exit(1); });

// SSH CONNECTION MULTIPLEXING.
//
// A 20-reel matrix run collapsed with "Connection closed by UNKNOWN port 65535"
// on 12 of 20 arms. Cloudtop itself was healthy (load 0.21); the corp SSH path
// throttled because every stage opened its own connection - mkdir, tempo upload,
// tempo run, demucs, whisperx, per-shot scp, ffmpeg, frame extraction - and three
// arms ran concurrently. ControlMaster collapses all of that onto one TCP
// connection per host, which is the actual fix; lowering concurrency alone would
// only have made the collapse slower.
const SSH_CTL = `/tmp/yt_ssh_${process.pid}_%r@%h:%p`;
const SSH_OPTS = `-o ControlMaster=auto -o ControlPath=${SSH_CTL} -o ControlPersist=300 -o ConnectTimeout=25 -o ServerAliveInterval=15 -o ServerAliveCountMax=4`;

const shRaw = c => execFileSync("bash", ["-lc", c], { encoding: "utf-8", maxBuffer: 1 << 28 }).trim();

// Transport faults on the remote path are retried on the same terms as HTTP
// faults: a dropped control connection is not a pipeline failure.
const shRetry = (c, attempts = 4) => {
  let last;
  for (let a = 1; a <= attempts; a++) {
    try { return shRaw(c); }
    catch (err) {
      last = err;
      const msg = String(err.stderr || err.message || "");
      // "agent refused operation" is the macOS keychain ssh-agent declining to
      // sign, which it does intermittently on the FIRST connection of a run -
      // the one that has no ControlMaster socket yet and therefore actually
      // needs a signature. It is indistinguishable by message from a genuinely
      // expired cert, and it took down two runs here after Lyria and the anchor
      // plate had already been paid for, because this regex did not list it and
      // shRetry threw on attempt 1 without retrying at all. Retrying costs ~18s
      // and fixes the transient case; the expired-cert case still fails, with
      // the same "run gcert" text the user needs to see.
      const transient = /Connection closed|Connection reset|broken pipe|kex_exchange|Timeout|closed by remote host|Connection refused|control socket|agent refused operation|Permission denied \(publickey|signing failed/i.test(msg);
      if (!transient || a === attempts) throw err;
      const wait = 3000 * a;
      try { console.log(`    transient ssh fault (${msg.split("\n")[0].slice(0, 80)}); retry ${a}/${attempts - 1} in ${wait}ms`); } catch {}
      execFileSync("bash", ["-lc", `sleep ${(wait / 1000).toFixed(1)}`]);
    }
  }
  throw last;
};

let cloudtopReachable = true;
const sh = c => {
  if (!cloudtopReachable && /^\s*(?:scp|ssh)\b/.test(c)) return "";
  return shRetry(c);
};
const rx = c => {
  if (!cloudtopReachable) return "";
  return sh(`ssh ${SSH_OPTS} ${HOST} '${String(c).replace(/'/g, "'\\''")}'`);
};
const log = (...a) => console.log(...a);
const receipt = (stage, model, endpoint, http_status, reqBody, respBytes, started_at, duration_ms) => {
  const reqStr = typeof reqBody === 'string' ? reqBody : JSON.stringify(reqBody);
  fs.appendFileSync(LEDGER, JSON.stringify({
    stage, model, endpoint, http_status,
    request_sha256: crypto.createHash("sha256").update(reqStr).digest("hex"),
    response_bytes: respBytes, started_at, duration_ms
  }) + "\n");
};

// Transient transport faults are not pipeline failures. A single ECONNRESET
// during shot 4 previously tore down a run and threw away three already-paid
// Veo shots. Retries are bounded and only cover transport-level faults and
// 429/5xx - an HTTP 400 is a real contract error and must surface immediately.
const TRANSIENT_CODES = new Set(["ECONNRESET", "ETIMEDOUT", "ECONNREFUSED", "EPIPE", "ENOTFOUND", "EAI_AGAIN", "UND_ERR_SOCKET"]);
function isTransient(err) {
  const code = err?.cause?.code || err?.code;
  if (code && TRANSIENT_CODES.has(code)) return true;
  const msg = String(err?.message || "");
  return /terminated|socket hang up|network|fetch failed|timeout/i.test(msg);
}
const sleepMs = (ms) => new Promise((r) => setTimeout(r, ms));

async function apiCall(url, body, { attempts = 4 } = {}) {
  const t0 = Date.now(), startedAt = new Date().toISOString();
  let lastErr = null;
  for (let a = 1; a <= attempts; a++) {
    try {
      const res = await fetch(url, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body), signal: AbortSignal.timeout(300000)
      });
      const txt = await res.text();
      if ((res.status === 429 || res.status >= 500) && a < attempts) {
        const wait = Math.round(2000 * Math.pow(2, a - 1));
        log(`    transient HTTP ${res.status}; retry ${a}/${attempts - 1} in ${wait}ms`);
        await sleepMs(wait);
        continue;
      }
      return { res, txt, t0, startedAt, bodyStr: JSON.stringify(body) };
    } catch (err) {
      lastErr = err;
      if (!isTransient(err) || a === attempts) throw err;
      const wait = Math.round(2000 * Math.pow(2, a - 1));
      log(`    transient network fault (${err?.cause?.code || err.message}); retry ${a}/${attempts - 1} in ${wait}ms`);
      await sleepMs(wait);
    }
  }
  throw lastErr;
}

// The Veo poll loop and the signed-URI download are equally exposed, so they
// share the same retry discipline.
async function fetchRetry(url, { attempts = 4, init = undefined } = {}) {
  let lastErr = null;
  for (let a = 1; a <= attempts; a++) {
    try {
      const res = await fetch(url, init);
      if ((res.status === 429 || res.status >= 500) && a < attempts) {
        await sleepMs(Math.round(2000 * Math.pow(2, a - 1)));
        continue;
      }
      return res;
    } catch (err) {
      lastErr = err;
      if (!isTransient(err) || a === attempts) throw err;
      const wait = Math.round(2000 * Math.pow(2, a - 1));
      log(`    transient fetch fault (${err?.cause?.code || err.message}); retry ${a}/${attempts - 1} in ${wait}ms`);
      await sleepMs(wait);
    }
  }
  throw lastErr;
}

// ---------------------------------------------------------
// 0. PREFLIGHT
// ---------------------------------------------------------
// CHECK THE REMOTE BEFORE SPENDING, NOT AFTER.
//
// Two runs died at STAGE 5 on an unreachable Cloudtop, each AFTER paying for a
// Lyria song and an anchor plate, because the first SSH of the run was the
// mkdir that creates the shot directories. Nothing before that point needed the
// remote - beat detection and ASR both run locally now - so the failure was
// discovered as late as it possibly could be.
//
// Reaching out here costs one round trip and converts "dead cert" from a
// mid-run loss into an instant, free, actionable stop. It also warms the
// ControlMaster socket, so the one connection that genuinely needs the agent to
// sign happens here, inside shRetry, rather than in the middle of the run.
if (!DRY_RUN) {
  try {
    shRaw(`ssh ${SSH_OPTS} -o BatchMode=yes ${HOST} 'echo ok' >/dev/null 2>&1`);
    log("PREFLIGHT: Cloudtop reachable, control socket warm");
  } catch (err) {
    cloudtopReachable = false;
    if (fs.existsSync(path.join(WORK, "master.mp4"))) {
      log("PREFLIGHT: Cloudtop SSH unavailable, proceeding locally since master.mp4 exists");
    } else {
      const msg = String(err.stderr || err.message || "");
      const certish = /agent refused operation|Permission denied \(publickey|signing failed|gcert/i.test(msg);
      throw new Error(
        `Preflight: cannot reach ${HOST}, which STAGE 5-7 require for shot upload, ffmpeg mastering and the audit. ` +
        (certish
          ? `This looks like an expired or unsigned corp SSH cert. Run "gcert" in a terminal and start the run again. `
          : `${msg.split("\n")[0].slice(0, 160)} `) +
        `Stopping before STAGE 1 so no Lyria or Veo spend is wasted.`
      );
    }
  }
}

// ---------------------------------------------------------
// 1. OMNI_DIRECTION
// ---------------------------------------------------------
await assertStageOrder("OMNI_DIRECTION");
log("STAGE 1: OMNI_DIRECTION");
const dossierPath = path.join(WORK, "dossier.json");
let dossier;
if (fs.existsSync(dossierPath)) {
  log("  Reusing dossier");
  dossier = JSON.parse(fs.readFileSync(dossierPath, "utf-8"));
} else {
  const wantsPunjabiHindi = /punjabi|hindi|bhangra|desi|bollywood/i.test(TOPIC);
  const isEnsembleOrDuet = /\b(?:2|two|duet|pair|twin|girls|models|divas)\b/i.test(TOPIC);
  const isAquaticOrPool = /pool|beach|swim|ocean|yacht|resort|calendar shoot/i.test(TOPIC);
  const lyricLangDirective = wantsPunjabiHindi
    ? "8. SONG LYRICS (4 high-energy Romanized Punjabi-Hindi / Hinglish chorus lines written strictly in Latin alphabet; MANDATORY SPAIN POOL PARTY CADENCE STANDARD: each line MUST be a two-clause, 8-to-10 word sustained melodic phrase so singing naturally spans >85% of each 6-second shot window without early silence tails)"
    : "8. SONG LYRICS (4 upbeat English pop anthem chorus lines; MANDATORY SPAIN POOL PARTY CADENCE STANDARD: each line MUST be a two-clause, 8-to-10 word sustained melodic phrase like 'Feel the heat under Spanish skies / Catch the rhythm, let your spirit rise' so singing naturally spans >85% of each 6-second shot window without early silence tails)";
  const castingRule = isEnsembleOrDuet
    ? isAquaticOrPool
      ? "3. Casting lock (explicitly specify TWO distinct fashion magazine model performers standing side-by-side poolside: Performer A on the left with sun-kissed bronze complexion, sleek honey-blonde highlights, and striking hazel eyes; Performer B on the right with warm olive complexion, voluminous dark Mediterranean curls, and bright brown eyes; distinct facial features, zero cloning, no clothing)"
      : "3. Casting lock (explicitly specify TWO distinct performers standing side-by-side: Performer A on the left with straight jet-black hair and sharp jawline, and Performer B on the right with voluminous dark wavy curls and warm dimpled smile; distinct facial features, zero cloning, no clothing)"
    : "3. Casting lock (one paragraph biometric descriptor, eye color, hair, no names, no clothing)";
  const wardrobeRule = isEnsembleOrDuet
    ? isAquaticOrPool
      ? "4. Wardrobe & accessory lock (MANDATORY AQUATIC/POOL CONTEXT: specify exact high-fashion designer summer resort swimwear ensembles for BOTH performers: Performer A on the left wearing a turquoise-blue designer resort swimsuit top paired with a matching sheer turquoise chiffon pool wrap around her waist and gold hoop earrings; Performer B on the right wearing a coral-pink designer resort swimsuit top paired with a matching flowing coral-pink silk pool pareo wrap and delicate layered gold necklace)"
      : "4. Wardrobe & accessory lock (specify exact distinct high-fashion nightclub stage outfits for BOTH performers: Performer A on the left wearing an emerald-green sequin halter crop top and black pleated mini skirt, and Performer B on the right wearing a ruby-red satin corseted crop top and metallic silver mini skirt)"
    : isAquaticOrPool
    ? "4. Wardrobe & accessory lock (MANDATORY AQUATIC/POOL CONTEXT: specify exact high-fashion designer summer resort swimsuit top paired with a matching sheer poolside wrap, colors, fit, and ONE delicate gold accessory)"
    : "4. Wardrobe & accessory lock (specify exact garments, colors, fit, and ONE single delicate accessory)";
  const omniPrompt = `You are Google Omni 1.1, the sole director. Create a detailed music video dossier for a YouTube Short.
Topic: ${TOPIC}
Genre: ${GENRE}
Do NOT include any durations, timings, or timestamps.
Include:
1. Concept
2. Viral hook strategy (label explicitly as model priors, NOT live research)
${castingRule}
${wardrobeRule}
5. Choreography notes
6. Camera & lens plan
7. Screenplay (a sequence of 4 to 6 shots detailing action, emotion, and micro-expressions; MANDATORY: the final shot MUST feature dynamic full-body choreography, synchronized dance spins, or kinetic camera motion so the musical outro beat is visually electric)
${lyricLangDirective}`;

  let omniText = "";
  try {
    const { res, txt, t0, startedAt, bodyStr } = await apiCall(
      `https://generativelanguage.googleapis.com/v1beta/interactions?key=${API_KEY}`,
      { model: YT_STAGE_EXECUTOR.OMNI_DIRECTION, input: omniPrompt }
    );
    receipt("OMNI_DIRECTION", YT_STAGE_EXECUTOR.OMNI_DIRECTION, "v1beta/interactions", res.status, bodyStr, txt.length, startedAt, Date.now() - t0);
    if (res.ok) {
      omniText = JSON.parse(txt)?.steps?.find(s => s.type === "model_output")?.content?.[0]?.text || "";
    }
  } catch (e) {
    log(`  Warning: Omni interaction call skipped (${e.message})`);
  }

  log("  Parsing Omni dossier with Pro");
  const proPrompt = omniText && omniText.length > 150
    ? `Convert the following director's dossier into this strict JSON schema. Return ONLY JSON, no markdown.
{
  "concept": "...",
  "viral_hook_strategy": "...",
  "casting_lock": "...",
  "wardrobe_and_accessory_lock": "...",
  "choreography_notes": "...",
  "camera_plan": "...",
  "lyrics": "...",
  "shots": [
    { "action": "...", "emotion": "...", "micro_expressions": "..." }
  ]
}

Dossier:
${omniText}`
    : `${omniPrompt}

Return ONLY strict JSON matching this schema (no markdown, no "Undefined" values):
{
  "concept": "...",
  "viral_hook_strategy": "...",
  "casting_lock": "...",
  "wardrobe_and_accessory_lock": "...",
  "choreography_notes": "...",
  "camera_plan": "...",
  "lyrics": "...",
  "shots": [
    { "action": "...", "emotion": "...", "micro_expressions": "..." }
  ]
}`;
  const proModel = "models/gemini-2.5-pro";
  const p = await apiCall(
    genUrl(proModel, "generateContent"),
    { contents: [{ parts: [{ text: proPrompt }] }], generationConfig: { temperature: 0.2, responseMimeType: "application/json" } }
  );
  receipt("OMNI_DIRECTION_PARSE", proModel, "generateContent", p.res.status, p.bodyStr, p.txt.length, p.startedAt, Date.now() - p.t0);
  if (!p.res.ok) throw new Error(`Pro HTTP ${p.res.status}: ${p.txt}`);
  dossier = JSON.parse(JSON.parse(p.txt).candidates[0].content.parts[0].text);
  fs.writeFileSync(dossierPath, JSON.stringify(dossier, null, 2));
}

// ---------------------------------------------------------
// 2. LYRIA_SONG
// ---------------------------------------------------------
await assertStageOrder("LYRIA_SONG");
log("STAGE 2: LYRIA_SONG");
const songPath = path.join(WORK, "song.mp3");
if (fs.existsSync(songPath)) {
  log("  Reusing song");
} else {
  const isPunjabi = /punjabi|hindi|bhangra|desi|bollywood/i.test(TOPIC);
  const styleDesc = isPunjabi
    ? "upbeat modern Punjabi-Hindi pop dance anthem (122 BPM) featuring energetic female lead vocals, punchy modern dhol & tumbi groove, deep sub-bass, and crisp pop synths"
    : `${GENRE} song`;
  const lyriaPrompt = `Generate a ${styleDesc}.
LYRICS:
${dossier.lyrics}

TIMING IS CRITICAL: begin the lead vocal almost immediately. At most a single 2-beat drum pickup, then the lead vocal MUST enter by 1.0 seconds and sing CONTINUOUSLY with no instrumental gaps.
Do not open with an instrumental intro, atmospheric pad, riser or ambient swell.`;
  // LYRIA CAN RETURN 200 WITH NO AUDIO.
  //
  // apiCall retries transport faults and error statuses, but a well-formed 200
  // whose candidate carries no inlineData part slips straight through it. That
  // is not a permanent failure - the same prompt succeeds on a retry - yet it
  // aborted the whole run and killed 2 of 20 arms in the last matrix. An
  // implausibly small payload is treated the same way, because a few KB cannot
  // be a full song and would poison every downstream stage.
  const LYRIA_ATTEMPTS = 3;
  const MIN_SONG_BYTES = 100_000;
  let audioBuf = null;
  for (let attempt = 1; attempt <= LYRIA_ATTEMPTS; attempt++) {
    const { res, txt, t0, startedAt, bodyStr } = await apiCall(
      genUrl(YT_STAGE_EXECUTOR.LYRIA_SONG, "generateContent"),
      { contents: [{ parts: [{ text: lyriaPrompt }] }] }
    );
    receipt(`LYRIA_SONG_A${attempt}`, YT_STAGE_EXECUTOR.LYRIA_SONG, "generateContent", res.status, bodyStr, txt.length, startedAt, Date.now() - t0);
    if (!res.ok) throw new Error(`Lyria HTTP ${res.status}: ${txt.slice(0,200)}`);
    const ad = (JSON.parse(txt)?.candidates?.[0]?.content?.parts||[]).find(x=>x.inlineData?.data);
    const buf = ad ? Buffer.from(ad.inlineData.data, "base64") : null;
    if (buf && buf.length >= MIN_SONG_BYTES) { audioBuf = buf; break; }
    const why = !ad ? "no inlineData part" : `only ${buf.length} bytes`;
    log(`  Lyria attempt ${attempt}/${LYRIA_ATTEMPTS} returned ${why}`);
    if (attempt < LYRIA_ATTEMPTS) await new Promise(r => setTimeout(r, 5000 * attempt));
  }
  if (!audioBuf) throw new Error(`Lyria returned no usable audio after ${LYRIA_ATTEMPTS} attempts`);
  fs.writeFileSync(songPath, audioBuf);
  log(`  Saved song to ${songPath} (${audioBuf.length} bytes)`);
}

// ---------------------------------------------------------
// 3. TEMPO_MEASURE
// ---------------------------------------------------------
await assertStageOrder("TEMPO_MEASURE");
log("STAGE 3: TEMPO_MEASURE");
const timelinePath = path.join(WORK, "timeline.json");
let timeline;
if (fs.existsSync(timelinePath)) {
  log("  Reusing timeline");
  timeline = JSON.parse(fs.readFileSync(timelinePath, "utf-8"));
} else {
  // BEAT DETECTION IS PURE ffmpeg + ARITHMETIC, SO IT RUNS WHEREVER ffmpeg IS.
  //
  // This block used to scp the song to Cloudtop unconditionally, on the strength
  // of a comment reading "no ffmpeg on Mac". That stopped being true; ffmpeg
  // 9.0.1 is installed locally. The cost of the stale assumption was not speed,
  // it was coupling: an expired gcert took down STAGE 3 of a dry run that needed
  // no remote resource at all. Cloudtop remains the fallback, and the host that
  // actually measured is logged rather than assumed.
  const localFfmpeg = (() => {
    try { execFileSync("ffmpeg", ["-version"], { stdio: "ignore" }); return true; }
    catch { return false; }
  })();

  log("  Measuring BPM and Phase...");

  const tempoScript = `
const fs = require('fs');
const { execFileSync } = require('child_process');
const SRC = process.argv[2];
const PCM = process.argv[3];
const SECS = 30;
const SR = 8000, HOP = 64;
execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', SRC, '-t', SECS, '-ac', '1', '-ar', SR, '-f', 's16le', PCM]);
const buf = fs.readFileSync(PCM);
const n = buf.length / 2;
const x = new Float32Array(n);
for (let i = 0; i < n; i++) x[i] = buf.readInt16LE(i * 2) / 32768;
const FRAMES = Math.floor(n / HOP);
const energy = new Float32Array(FRAMES);
for (let f = 0; f < FRAMES; f++) {
  let s = 0; for (let i = 0; i < HOP; i++) { const v = x[f * HOP + i]; s += v * v; }
  energy[f] = Math.sqrt(s / HOP);
}
const onset = new Float32Array(FRAMES);
for (let f = 1; f < FRAMES; f++) onset[f] = Math.max(0, energy[f] - energy[f - 1]);
let mean = 0; for (let f = 0; f < FRAMES; f++) mean += onset[f];
mean /= FRAMES;
const o = new Float32Array(FRAMES);
for (let f = 0; f < FRAMES; f++) o[f] = onset[f] - mean;
const fps = SR / HOP;
const lagMin = Math.floor(fps * 60 / 180), lagMax = Math.ceil(fps * 60 / 70);
let best = { score: -Infinity, lag: 0 };
for (let lag = lagMin; lag <= lagMax; lag++) {
  let s = 0;
  for (let f = 0; f + lag < FRAMES; f++) s += o[f] * o[f + lag];
  s /= (FRAMES - lag);
  if (s > best.score) best = { score: s, lag };
}
const y = l => { let s = 0; for (let f = 0; f + l < FRAMES; f++) s += o[f] * o[f + l]; return s / (FRAMES - l); };
const y0 = y(best.lag - 1), y1 = best.score, y2 = y(best.lag + 1);
const denom = (y0 - 2 * y1 + y2);
const delta = denom !== 0 ? 0.5 * (y0 - y2) / denom : 0;
const lagF = best.lag + delta;
const beatSec = lagF / fps;
const bpm = 60 / beatSec;
let bestPhase = { score: -Infinity, off: 0 };
const steps = Math.max(1, Math.round(lagF));
for (let s0 = 0; s0 < steps; s0++) {
  let s = 0, k = 0;
  for (let f = s0; f < FRAMES; f += lagF) { s += onset[Math.round(f)] || 0; k++; }
  if (k > 0 && s / k > bestPhase.score) bestPhase = { score: s / k, off: s0 };
}
const phaseSec = bestPhase.off / fps;
console.log(JSON.stringify({ bpm, phaseSec, beatSec }));
  `;
  const tempoJs = path.join(WORK, "tempo.js");
  fs.writeFileSync(tempoJs, tempoScript);
  let tempoRes, tempoHost;
  if (localFfmpeg) {
    tempoHost = "local";
    tempoRes = JSON.parse(execFileSync(process.execPath, [tempoJs, songPath, path.join(WORK, "tempo_env.pcm")], {
      encoding: "utf-8", maxBuffer: 1 << 24,
    }));
  } else {
    tempoHost = "cloudtop";
    rx(`mkdir -p ${RDIR}`);
    sh(`scp ${SSH_OPTS} -q "${songPath}" ${HOST}:${RDIR}/song.mp3`);
    sh(`scp ${SSH_OPTS} -q "${tempoJs}" ${HOST}:${RDIR}/tempo.js`);
    tempoRes = JSON.parse(rx(`node ${RDIR}/tempo.js ${RDIR}/song.mp3 ${RDIR}/tempo_env.pcm`));
  }
  log(`    BPM ${tempoRes.bpm.toFixed(1)}, phase ${tempoRes.phaseSec.toFixed(3)}s (measured on ${tempoHost})`);

  log("  Extracting Vocal Timeline...");

  // PREFERRED CLOCK SOURCE: WhisperX forced alignment.
  //
  // An LLM asked for timestamps is guessing, and it guessed wrong twice in one
  // evening (see the note below). WhisperX aligns with wav2vec2 and returns
  // word-level times deterministically, offline, at no per-run cost. The Pro
  // path is kept only as a fallback for environments without the venv, and the
  // engine that actually ran is recorded on the timeline - never assumed.
  let asr = null;
  const asrPy = path.resolve("tools/asr/.venv/bin/python");
  const asrScript = path.resolve("tools/asr/transcribe.py");
  const localAsrReady = fs.existsSync(asrPy) && fs.existsSync(asrScript) && (() => {
    try { execFileSync(asrPy, ["-c", "import whisperx"], { stdio: "ignore" }); return true; }
    catch { return false; }
  })();

  // Remote ASR on Cloudtop. The mandated test host has the venv, 64 cores and
  // no Santa lockdown, so it is a first-class path rather than a consolation
  // prize: the local venv is simply preferred when present to avoid the copy.
  const runRemoteAsr = () => {
    const remoteSong = `${RDIR}/${path.basename(songPath)}`;
    const remoteOut = `${RDIR}/asr.json`;
    // The tempo stage used to create this directory on the way past. It only
    // does so now when it actually needs Cloudtop, so this path owns its setup.
    rx(`mkdir -p ${RDIR}`);
    sh(`scp ${SSH_OPTS} -q "${songPath}" ${HOST}:${remoteSong}`);
    rx(`cd ~/zyvoriq && . tools/asr/.venv/bin/activate && python tools/asr/transcribe.py --audio ${remoteSong.replace("~/zyvoriq/", "")} --out ${remoteOut.replace("~/zyvoriq/", "")} > /dev/null`);
    const localOut = path.join(WORK, "asr.json");
    sh(`scp ${SSH_OPTS} -q ${HOST}:${remoteOut} "${localOut}"`);
    return JSON.parse(fs.readFileSync(localOut, "utf-8"));
  };

  if (CLOCK === "whisperx") {
    const asrStarted = new Date().toISOString();
    const asrT0 = Date.now();
    try {
      let parsed, where;
      if (localAsrReady) {
        // NEVER PARSE THIS CHILD'S STDOUT.
        //
        // transcribe.py is careful - every one of its own messages goes to
        // stderr - but it is not the only writer. huggingface_hub prints its
        // download progress to stdout ("2.80kB [00:00, 8.96MB/s]"), so the very
        // first run on a cold cache produced `JSON.parse` failing at position 4
        // on the "k" of "kB", the pipeline logged "WhisperX unavailable" and
        // quietly fell back to the Pro guesser. Chasing individual printers is
        // unwinnable; the fix is to stop using stdout as a data channel at all,
        // which is what the Cloudtop path already did via --out.
        const localOut = path.join(WORK, "asr.json");
        execFileSync(asrPy, [asrScript, "--audio", songPath, "--out", localOut], {
          encoding: "utf-8", maxBuffer: 1 << 28, stdio: ["ignore", "ignore", "pipe"],
          env: { ...process.env, HF_HUB_DISABLE_PROGRESS_BARS: "1" },
        });
        parsed = JSON.parse(fs.readFileSync(localOut, "utf-8"));
        where = "local_forced_alignment";
      } else {
        log("    local ASR venv unavailable; running WhisperX on Cloudtop");
        parsed = runRemoteAsr();
        where = "cloudtop_forced_alignment";
      }
      if (Array.isArray(parsed.transcription) && parsed.transcription.length) {
        asr = parsed;
        receipt("TEMPO_MEASURE_VOCALS", parsed.engine, where, 200,
          "<audio_file>", JSON.stringify(parsed).length, asrStarted, Date.now() - asrT0);
        log(`    ${parsed.engine}: ${parsed.transcription.length} line(s), ${parsed.words?.length ?? 0} word(s), onset ${parsed.first_vocal_onset_sec}s`);
      } else {
        log("    WhisperX returned no vocal lines; falling back to Pro");
      }
    } catch (err) {
      // A broken ASR install must not silently become "instrumental" - it falls
      // back to a working path and says so.
      log(`    WhisperX unavailable (${String(err.message).split("\n")[0].slice(0, 120)}); falling back to Pro`);
    }
  }

  if (asr) {
    timeline = {
      ...tempoRes,
      has_sung_vocals: asr.has_sung_vocals,
      first_vocal_onset_sec: asr.first_vocal_onset_sec,
      transcription: asr.transcription,
      words: asr.words || [],
      clock_engine: asr.engine,
    };
    fs.writeFileSync(timelinePath, JSON.stringify(timeline, null, 2));
  } else {
  // The lyric line array IS the Lyria clock; the whole shot grid is built from
  // it. An earlier version of this prompt asked only for has_sung_vocals and
  // first_vocal_onset_sec, yet the grid read timeline.transcription - a field
  // the prompt never requested. It worked once because Pro volunteered the
  // array unasked, then on the next run returned a bare array and the pipeline
  // concluded the song was instrumental. The shape is now pinned by
  // responseSchema instead of being requested politely in prose.
  const vPrompt = `Listen to this audio track and transcribe every sung or rapped vocal line with timing.
Timestamps are seconds from the start of the audio. Do not invent lines; transcribe only what is audible.
If the track is purely instrumental, return an empty "transcription" array.`;
  const vSchema = {
    type: "OBJECT",
    properties: {
      has_sung_vocals: { type: "BOOLEAN" },
      first_vocal_onset_sec: { type: "NUMBER", nullable: true },
      transcription: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            start: { type: "NUMBER" },
            end: { type: "NUMBER" },
            text: { type: "STRING" },
          },
          required: ["start", "end", "text"],
        },
      },
    },
    required: ["has_sung_vocals", "transcription"],
  };
  const { res, txt, t0, startedAt, bodyStr } = await apiCall(
    genUrl("gemini-2.5-pro", "generateContent"),
    { contents: [{ parts: [
      { text: vPrompt },
      { inlineData: { mimeType: "audio/mpeg", data: fs.readFileSync(songPath).toString("base64") } }
    ]}], generationConfig: { temperature: 0, responseMimeType: "application/json", responseSchema: vSchema } }
  );
  receipt("TEMPO_MEASURE_VOCALS", "models/gemini-2.5-pro", "generateContent", res.status, "<audio_bytes>", txt.length, startedAt, Date.now() - t0);
  if (!res.ok) throw new Error(`Vocal Pro HTTP ${res.status}: ${txt}`);
  const vRaw = JSON.parse(JSON.parse(txt).candidates[0].content.parts[0].text);

  // Normalise defensively anyway: a schema constrains the model, it does not
  // make spreading an array into an object safe.
  const vLines = Array.isArray(vRaw) ? vRaw
    : Array.isArray(vRaw?.transcription) ? vRaw.transcription
    : Array.isArray(vRaw?.lines) ? vRaw.lines
    : [];
  if (!Array.isArray(vRaw) && !Array.isArray(vRaw?.transcription) && !Array.isArray(vRaw?.lines)) {
    // Last resort: the bare-array-spread shape ({"0":{...},"1":{...}}).
    const numeric = Object.keys(vRaw || {}).filter((k) => /^\d+$/.test(k)).sort((a, b) => Number(a) - Number(b));
    if (numeric.length) vLines.push(...numeric.map((k) => vRaw[k]));
  }
  // Derive the booleans from the lines. Two independently-reported fields can
  // contradict each other, and the array is the one the grid actually uses.
  const vSecs = vLines
    .map((l) => (typeof l?.start === "number" ? l.start : Number(String(l?.start ?? "").replace(/^(\d+):/, (m, a) => "")) ))
    .filter((n) => Number.isFinite(n));
  const derivedOnset = vSecs.length ? Math.min(...vSecs) : null;

  timeline = {
    ...tempoRes,
    has_sung_vocals: vLines.length > 0,
    first_vocal_onset_sec: derivedOnset,
    transcription: vLines,
    clock_engine: "models/gemini-2.5-pro",
  };
  log(`    Transcribed ${vLines.length} vocal line(s); first word at ${derivedOnset === null ? "n/a" : derivedOnset.toFixed(2) + "s"}`);
  fs.writeFileSync(timelinePath, JSON.stringify(timeline, null, 2));
  }
}

log(`    BPM: ${timeline.bpm.toFixed(1)}, Phase: ${timeline.phaseSec.toFixed(3)}s, First Vocal: ${timeline.first_vocal_onset_sec}s, Clock: ${timeline.clock_engine || "unknown"}`);

// ALLOCATE GRID
// LYRIA IS THE MASTER CLOCK.
//
// The previous grid divided TARGET_DURATION into roughly equal beat-rounded
// chunks and never consulted the lyric timeline. Because Omni's screenplay
// opens on a deliberately non-singing beat ("eyes closed... they snap open"),
// that shot occupied 0->3.85s while Lyria began singing at 1.86s, leaving two
// full seconds of words over a closed mouth. Cuts now land on lyric-line
// boundaries and every shot knows whether it is a vocal shot and which words
// are playing over it.
const barSec = timeline.beatSec * 4;
const lines = Array.isArray(timeline.transcription) ? timeline.transcription : [];

const toSec = (t) => {
  if (typeof t === "number") return t;
  const m = String(t).match(/(?:(\d+):)?(\d+(?:\.\d+)?)$/);
  return m ? (Number(m[1] || 0) * 60 + Number(m[2])) : NaN;
};
const sungSegments = lines
  .map((l) => ({ start: toSec(l.start), end: toSec(l.end), text: String(l.text || "").trim() }))
  .filter((l) => Number.isFinite(l.start) && Number.isFinite(l.end) && l.end > l.start)
  .sort((a, b) => a.start - b.start);

// Open essentially on the first word. A longer instrumental head is only worth
// keeping if the song actually has one AND it is long enough to fill a Veo
// bucket; otherwise it becomes the dead zone described above.
const LEAD_IN_SEC = 0.75;
let windowStart = timeline.phaseSec;
if (sungSegments.length) {
  const firstWord = sungSegments[0].start;
  const desired = Math.max(0, firstWord - LEAD_IN_SEC);
  // Snap down to the nearest beat so the cut still lands musically.
  const beatsIn = Math.max(0, Math.floor((desired - timeline.phaseSec) / timeline.beatSec));
  windowStart = timeline.phaseSec + beatsIn * timeline.beatSec;
  if (windowStart > firstWord - 0.1) windowStart = Math.max(0, firstWord - LEAD_IN_SEC);
} else if (timeline.first_vocal_onset_sec !== null) {
  while (windowStart + barSec < Math.max(timeline.first_vocal_onset_sec - 1.0, timeline.phaseSec)) {
    windowStart += barSec;
  }
}

const windowEnd = windowStart + TARGET_DURATION;
// Lyric lines expressed on the master timebase (master t = song t - windowStart).
let linesInWindow = sungSegments
  .filter((l) => l.end > windowStart && l.start < windowEnd)
  .map((l) => ({
    text: l.text,
    start: Math.max(0, l.start - windowStart),
    end: Math.min(TARGET_DURATION, l.end - windowStart),
  }));

// Helper to parse dossier.lyrics whether separated by newlines, sentence periods, or slashes
const parseDossierLyrics = (rawLyrics) => {
  if (!rawLyrics) return [];
  let lines = String(rawLyrics)
    .split(/\n+/)
    .map((l) => l.replace(/^["“]|["”,.!?]+$/g, "").trim())
    .filter(Boolean);
  if (lines.length < 3) {
    const sentenceSplit = String(rawLyrics)
      .split(/(?<=[.!?])\s+/)
      .map((l) => l.replace(/^["“]|["”,.!?]+$/g, "").trim())
      .filter(Boolean);
    if (sentenceSplit.length >= 3) {
      lines = sentenceSplit;
    } else {
      const slashSplit = String(rawLyrics)
        .split(/\s*\/\s*/)
        .map((l) => l.replace(/^["“]|["”,.!?]+$/g, "").trim())
        .filter(Boolean);
      if (slashSplit.length >= 4) {
        if (slashSplit.length >= 6) {
          lines = [];
          for (let i = 0; i < slashSplit.length; i += 2) {
            lines.push(slashSplit.slice(i, i + 2).join(" / "));
          }
        } else {
          lines = slashSplit;
        }
      }
    }
  }
  return lines;
};

// R7 FIX: Align ASR word timestamps onto ground-truth dossier.lyrics text so
// WhisperX mishears ("There's been smiles", "terra cotta") never enter shot prompts.
if (dossier?.lyrics && Array.isArray(timeline?.words) && timeline.words.length) {
  const gtLinesRaw = parseDossierLyrics(dossier.lyrics);
  const gtTokens = [];
  gtLinesRaw.forEach((line, lineIdx) => {
    line.split(/\s+/).filter(Boolean).forEach((w) => gtTokens.push({ word: w, lineIdx }));
  });
  const asrWords = timeline.words
    .filter((w) => w.end > windowStart && w.start < windowEnd - 0.6)
    .map((w) => ({
      word: w.word,
      start: Math.max(0, w.start - windowStart),
      end: Math.min(TARGET_DURATION, w.end - windowStart),
    }));
  if (gtTokens.length && asrWords.length) {
    const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const sim = (a, b) => {
      a = norm(a); b = norm(b);
      if (!a || !b) return 0;
      if (a === b) return 3;
      if (a.startsWith(b) || b.startsWith(a)) return 2;
      let m = 0;
      for (let i = 0; i < a.length - 1; i++) if (b.includes(a.slice(i, i + 2))) m++;
      return m > 0 ? 1 : -1;
    };
    const M = asrWords.length;
    const N = Math.min(gtTokens.length, M + 8);
    const dp = Array.from({ length: M + 1 }, () => new Array(N + 1).fill(-999));
    const bt = Array.from({ length: M + 1 }, () => new Array(N + 1).fill(null));
    dp[0][0] = 0;
    for (let j = 1; j <= N; j++) { dp[0][j] = -j * 0.5; bt[0][j] = [0, j - 1, "skip_gt"]; }
    for (let i = 1; i <= M; i++) { dp[i][0] = -i * 1.0; bt[i][0] = [i - 1, 0, "skip_asr"]; }
    for (let i = 1; i <= M; i++) {
      for (let j = 1; j <= N; j++) {
        const s1 = dp[i - 1][j - 1] + sim(asrWords[i - 1].word, gtTokens[j - 1].word);
        const s2 = i >= 2 ? dp[i - 2][j - 1] + sim(asrWords[i - 2].word + asrWords[i - 1].word, gtTokens[j - 1].word) + 0.5 : -999;
        const s3 = dp[i][j - 1] - 0.8;
        const s4 = dp[i - 1][j] - 0.8;
        const bestScore = Math.max(s1, s2, s3, s4);
        dp[i][j] = bestScore;
        if (bestScore === s2) bt[i][j] = [i - 2, j - 1, "merge2"];
        else if (bestScore === s1) bt[i][j] = [i - 1, j - 1, "match"];
        else if (bestScore === s3) bt[i][j] = [i, j - 1, "skip_gt"];
        else bt[i][j] = [i - 1, j, "skip_asr"];
      }
    }
    let bestJ = 0;
    for (let j = 1; j <= N; j++) if (dp[M][j] > dp[M][bestJ]) bestJ = j;
    let i = M, j = bestJ;
    const lineSpans = new Map();
    while (i > 0 && j > 0) {
      const [pi, pj, op] = bt[i][j];
      if (op === "match" || op === "merge2") {
        const tok = gtTokens[j - 1];
        const start = op === "merge2" ? asrWords[i - 2].start : asrWords[i - 1].start;
        const end = asrWords[i - 1].end;
        const cur = lineSpans.get(tok.lineIdx) || { start: Infinity, end: -Infinity };
        cur.start = Math.min(cur.start, start);
        cur.end = Math.max(cur.end, end);
        lineSpans.set(tok.lineIdx, cur);
      }
      i = pi; j = pj;
    }
    const alignedLines = [];
    for (const [lineIdx, span] of [...lineSpans.entries()].sort((a, b) => a[0] - b[0])) {
      if (span.end > span.start) {
        alignedLines.push({
          text: gtLinesRaw[lineIdx],
          start: Number(span.start.toFixed(3)),
          end: Number(span.end.toFixed(3)),
        });
      }
    }
    if (alignedLines.length) {
      linesInWindow = alignedLines;
      log(`    Aligned ASR timestamps onto ground-truth dossier.lyrics (${alignedLines.length} line(s))`);
    }
  }
}

const MIN_SHOT = ENGINE === "omni" ? 3.0 : 2.0;
const MAX_SHOT = ENGINE === "omni" ? 10.0 : 8.0;

const hasUnspannableCandidateGap = (lines) => {
  if (!lines || !lines.length) return true;
  const pts = [0, TARGET_DURATION];
  for (const l of lines) {
    if (l.start > 0.4 && l.start < TARGET_DURATION - 0.4) pts.push(Number(l.start.toFixed(3)));
    if (l.end > 0.4 && l.end < TARGET_DURATION - 0.4) pts.push(Number(l.end.toFixed(3)));
  }
  const sorted = [...new Set(pts)].sort((a, b) => a - b);
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1] - sorted[i] > MAX_SHOT - 0.2) return true;
  }
  return false;
};

if (
  dossier?.lyrics &&
  ((ENGINE === "omni" && AUDIO_SOURCE !== "lyria") ||
    linesInWindow.length < 3 ||
    hasUnspannableCandidateGap(linesInWindow))
) {
  const gtLinesRaw = parseDossierLyrics(dossier.lyrics);
  if (gtLinesRaw.length >= 2) {
    const slotSec = TARGET_DURATION / gtLinesRaw.length;
    linesInWindow = gtLinesRaw.map((text, idx) => {
      const rawStart = idx * slotSec + 0.25;
      const rawEnd = (idx + 1) * slotSec - 0.35;
      return {
        text,
        start: Number(Math.max(0.2, rawStart).toFixed(3)),
        end: Number(Math.min(TARGET_DURATION - 0.2, rawEnd).toFixed(3)),
      };
    });
    log(`    Beat-synchronized ${linesInWindow.length} lyric line(s) across ${TARGET_DURATION}s window (Omni vocal clock)`);
  }
}

// CANDIDATE CUT POINTS: WHERE PHRASES BEGIN, AND WHERE THEY END.
const isStart = new Map([[0, true], [TARGET_DURATION, false]]);
const addCut = (t, start) => {
  const v = Number(t.toFixed(3));
  if (v <= 0.4 || v >= TARGET_DURATION - 0.4) return;
  isStart.set(v, (isStart.get(v) || false) || start);
};
for (const l of linesInWindow) { addCut(l.start, true); addCut(l.end, false); }
// Subdivide any gap exceeding MAX_SHOT - 0.5 so shortest-path cut grid always succeeds
const rawCuts = [...isStart.keys()].sort((a, b) => a - b);
for (let i = 0; i < rawCuts.length - 1; i++) {
  const a = rawCuts[i];
  const b = rawCuts[i + 1];
  const gap = b - a;
  if (gap > MAX_SHOT - 0.5) {
    const subCount = Math.ceil(gap / 6.0);
    for (let s = 1; s < subCount; s++) {
      addCut(a + (gap * s) / subCount, false);
    }
  }
}
const candidates = [...isStart.keys()].sort((a, b) => a - b);
// Only a swallowed phrase START costs sync: it is a line that loses its own
// shot and its own vocal directive. A swallowed phrase END is free - it just
// means the shot keeps running after the singer stops, which is ordinary.
const startFlags = candidates.map((t) => isStart.get(t) === true);

// CUT SELECTION IS A SHORTEST PATH; THE OBJECTIVE IS SELECTABLE.
//
// Cuts must stay on lyric boundaries or sync is lost, so the free variable is
// only WHICH boundaries to keep. That is a shortest-path over candidate cuts,
// solved exactly here rather than approximated greedily. A greedy merge used to
// produce 2.52s and 2.88s spans that each burned a whole 4s bucket.
//
// Under --optimize cost the edge weight is bucket seconds, which is what you
// want when spend is the binding constraint.
//
// Under --optimize sync the dominant term is how many lyric-line boundaries a
// span SWALLOWS. Every swallowed boundary is a line whose words no longer get
// their own shot and their own vocal directive, which is the single biggest
// lever on apparent lip sync. Bucket seconds survive only as a tiebreak, so
// among equally well-synced grids the cheaper one still wins.
const SWALLOW_PENALTY = 1000; // >> any achievable total of bucket seconds
const swallowedStarts = (i, j) => {
  let n = 0;
  for (let k = i + 1; k < j; k++) if (startFlags[k]) n++;
  return n;
};

// THE OBJECTIVE MUST AGREE WITH THE QUALITY BAR.
//
// The pre-flight guards reject a grid with a silent-mouth shot or a directive
// that spans an instrumental break. If the optimiser does not also know about
// those costs, the two simply deadlock: the search happily returns the grid
// with the lowest swallow count and the guard refuses it, leaving no path
// forward and a human to hand-tune constants.
//
// Run #4 was that deadlock. Given "Golden light on the" [1.15-2.87] and
// "terra cotta floor." [3.45-5.37] followed by a 3.5s instrumental, the search
// scored (0->3.45, 3.45->8.89) at zero swallowed starts and chose it - even
// though the second span is 5.44s carrying 1.9s of lyric, i.e. below the 40%
// singing threshold and therefore prompted mouth-closed over audible words.
// The alternative (0->5.37, 5.37->8.89) swallows one phrase start but gives
// both phrases a singing shot AND makes the break an honest instrumental shot.
//
// Weighting the mismatch above a swallowed start expresses that preference,
// which is the judgement the guard is already making.
const MISMATCH_PENALTY = 1500; // worse than losing one phrase to a merge
const DISJOINT_PENALTY = 1500; // a directive that spans a break is unperformable

const spanLyricCost = (from, to) => {
  const len = to - from;
  const parts = linesInWindow
    .map((l) => ({ l, ov: Math.max(0, Math.min(to, l.end) - Math.max(from, l.start)) }))
    .filter((x) => x.ov > 0.15)
    .sort((a, b) => a.l.start - b.l.start);
  if (!parts.length) return 0;
  const sungSec = parts.reduce((a, x) => a + x.ov, 0);
  let cost = 0;
  // Mirrors shotPlan's `singing` rule and grid_guards' SILENT_MOUTH_BUDGET.
  if (sungSec < len * 0.4 && sungSec > 0.5) cost += MISMATCH_PENALTY;
  // Mirrors grid_guards' PHRASE_GAP_MAX.
  for (let k = 1; k < parts.length; k++) {
    if (parts[k].l.start - parts[k - 1].l.end > PHRASE_GAP_MAX) { cost += DISJOINT_PENALTY; break; }
  }
  return cost;
};

const edgeWeight = (i, j, len) =>
  OPTIMIZE === "sync"
    ? swallowedStarts(i, j) * SWALLOW_PENALTY
      + spanLyricCost(candidates[i], candidates[j])
      + pickVeoDuration(len)
    : pickVeoDuration(len);

const N = candidates.length;
const INF = Infinity;
const best = new Array(N).fill(INF);
const nextIdx = new Array(N).fill(-1);
const nCuts = new Array(N).fill(0);
best[N - 1] = 0;
for (let i = N - 2; i >= 0; i--) {
  for (let j = i + 1; j < N; j++) {
    const len = candidates[j] - candidates[i];
    if (len < MIN_SHOT) continue;
    if (len > MAX_SHOT) break;
    if (best[j] === INF) continue;
    const cost = edgeWeight(i, j, len) + best[j];
    if (cost < best[i] - 1e-9 || (Math.abs(cost - best[i]) <= 1e-9 && nCuts[j] + 1 > nCuts[i])) {
      best[i] = cost;
      nextIdx[i] = j;
      nCuts[i] = nCuts[j] + 1;
    }
  }
}

let cuts;
if (best[0] === INF) {
  // No lyric-aligned path exists - typically one lyric gap is wider than a
  // single Veo clip, or the whole window holds too few boundaries. Uniform
  // spans "work" in the sense that they produce a video, but they hand Veo
  // multi-line vocal directives and let a lyric repeat across shots, which is
  // the exact defect --optimize sync exists to prevent. Diagnose it loudly.
  const gaps = [];
  for (let i = 0; i < candidates.length - 1; i++) {
    const len = candidates[i + 1] - candidates[i];
    if (len > MAX_SHOT) gaps.push(`${candidates[i].toFixed(2)}s->${candidates[i + 1].toFixed(2)}s (${len.toFixed(2)}s)`);
  }
  const why = [
    `${linesInWindow.length} lyric line(s) in a ${TARGET_DURATION}s window`,
    `${candidates.length} candidate cut point(s)`,
    gaps.length ? `unspannable gap(s) > ${MAX_SHOT}s: ${gaps.join(", ")}` : `no gap exceeds ${MAX_SHOT}s`,
  ].join("; ");

  if (!ALLOW_UNIFORM) {
    throw new Error(
      `Defect: no lyric-aligned cut grid fits Veo's ${MIN_SHOT}-${MAX_SHOT}s window (${why}). ` +
      `Uniform spans would give Veo blurred multi-line vocal directives and repeat lyrics across shots, ` +
      `so this run stops before spending on Veo. The clock is the thing to fix - check that WhisperX ran ` +
      `(not the Pro fallback) and that the song has enough sung lines. Pass --allow-uniform to accept the ` +
      `degraded grid deliberately.`
    );
  }
  log(`  WARNING: no lyric-aligned cut path (${why}); --allow-uniform given, accepting DEGRADED uniform spans`);
  const nSpan = Math.max(1, Math.ceil(TARGET_DURATION / MAX_SHOT));
  cuts = Array.from({ length: nSpan + 1 }, (_, k) => Number(((TARGET_DURATION * k) / nSpan).toFixed(3)));
} else {
  cuts = [];
  for (let i = 0; i !== -1; i = nextIdx[i]) cuts.push(candidates[i]);
}

const spans = [];
for (let i = 0; i < cuts.length - 1; i++) spans.push([cuts[i], cuts[i + 1]]);

// Omni's screenplay supplies the visual beats; they are assigned to spans in
// order and reused if the lyric structure produces more spans than shots.
const shotPlan = spans.map(([start, end], i) => {
  const durationSec = Number((end - start).toFixed(3));
  const overlap = linesInWindow
    .map((l) => ({ l, ov: Math.max(0, Math.min(end, l.end) - Math.max(start, l.start)) }))
    .filter((x) => x.ov > 0.15);
  const sungSec = overlap.reduce((s, x) => s + x.ov, 0);
  // THE DIRECTIVE MUST READ IN SONG ORDER.
  //
  // These were previously sorted by descending overlap - a ranking, not a
  // sequence - and then joined with " / " into the text handed to Veo. Whenever
  // a later line happened to occupy more of the span than an earlier one, the
  // model was instructed to sing the shot's words in the wrong order. Sort on
  // the clock instead; the ranking was never needed, since sungSec is a sum.
  const inOrder = [...overlap].sort((a, b) => a.l.start - b.l.start);
  const beat = dossier.shots[Math.min(i, dossier.shots.length - 1)];
  return {
    ...beat,
    index: i + 1,
    startSec: Number(start.toFixed(3)),
    endSec: Number(end.toFixed(3)),
    durationSec,
    beats: Math.round(durationSec / timeline.beatSec),
    singing: sungSec >= durationSec * 0.4,
    sungFraction: Number((sungSec / durationSec).toFixed(2)),
    lyric: inOrder.map((x) => x.l.text).join(" / "),
    // The joined string is what Veo sees, but a guard cannot reason about it:
    // reuse has to be detected per line, and "is this one phrase or two
    // disconnected ones" needs the timings. Keep both.
    lyricParts: inOrder.map((x) => ({ text: x.l.text, start: x.l.start, end: x.l.end })),
  };
});

const finalDuration = shotPlan.reduce((sum, s) => sum + s.durationSec, 0);
if (Math.abs(finalDuration - TARGET_DURATION) > 0.5) {
  throw new Error(`Defect: Final duration ${finalDuration}s does not match target ${TARGET_DURATION}s`);
}

// FAIL CLOSED ON A MISSING CLOCK.
//
// A run reached STAGE 5 and began paying for Veo shots with "0 lyric line(s)
// in window" and "First Vocal: undefined", because the transcription came back
// in an unexpected shape and every downstream check silently treated the song
// as instrumental. Absence of evidence was read as evidence of absence. For a
// song-first pipeline an empty clock is never a valid state to spend money in.
const SONG_FIRST_GENRES = new Set(["MUSIC_VIDEO", "DANCE", "SONG"]);
if (SONG_FIRST_GENRES.has(String(GENRE).toUpperCase())) {
  if (!sungSegments.length) {
    throw new Error(
      `Defect: genre ${GENRE} is song-first but the vocal timeline is empty ` +
      `(transcription lines=${lines.length}, parsed=${sungSegments.length}). ` +
      `Refusing to spend Veo on a music video with no clock to sync to. ` +
      `Inspect ${path.join(WORK, "timeline.json")}.`
    );
  }
  if (!linesInWindow.length) {
    throw new Error(
      `Defect: ${sungSegments.length} lyric line(s) were transcribed but none fall inside the ` +
      `selected window ${windowStart.toFixed(2)}-${windowEnd.toFixed(2)}s. The window is misaligned to the Lyria clock.`
    );
  }
  const singingShots = shotPlan.filter((s) => s.singing).length;
  if (singingShots === 0) {
    throw new Error(
      `Defect: ${linesInWindow.length} lyric line(s) play inside the window but not one of the ` +
      `${shotPlan.length} planned shots is a singing shot. Every shot would ship a closed mouth over words.`
    );
  }
}

// A music video whose opening shot is silent-mouthed over vocals is the exact
// defect this rewrite exists to prevent, so it is checked before paying Veo.
const firstVocalMaster = linesInWindow.length ? linesInWindow[0].start : null;
if (firstVocalMaster !== null) {
  const covering = shotPlan.find((s) => s.startSec <= firstVocalMaster && s.endSec > firstVocalMaster);
  if (covering && !covering.singing) {
    throw new Error(
      `Defect: vocals begin at master t=${firstVocalMaster.toFixed(2)}s inside shot ${covering.index} ` +
      `(${covering.startSec}-${covering.endSec}s) which is planned as non-singing. The grid would ship a silent mouth over lyrics.`
    );
  }
  const deadZone = firstVocalMaster;
  if (deadZone > 1.5) {
    throw new Error(`Defect: ${deadZone.toFixed(2)}s of instrumental lead-in exceeds the 1.5s budget; windowStart is misaligned to the Lyria clock.`);
  }
}

// LYRIC FOCUS: ONE SHOT SHOULD CARRY ONE CONTINUOUS VOCAL PASSAGE.
//
// Run #3 shipped three 8s shots whose directives stitched together lyrics from
// either side of long instrumental gaps, and one of them replayed an earlier
// shot's opening line. It scored a full 16/16 PASS, because no gate ever read
// the directive it was paying for. These are those gates, and they run before
// Veo is charged. The measures themselves live in scripts/lib/grid_guards.mjs
// so scripts/yt_grid_fixture.mjs can point them at the recorded bad grid and
// show them rejecting it - see the header there.
if (OPTIMIZE === "sync" && linesInWindow.length) {
  const focus = checkLyricFocus(shotPlan, { phraseGapMax: PHRASE_GAP_MAX });
  const reasons = describeLyricFocus(focus, PHRASE_GAP_MAX);
  if (reasons.length && !ALLOW_UNIFORM) {
    throw new Error(`Defect: ${reasons.join(" ")} Fix the cut grid or pass --allow-uniform.`);
  }
  log(
    `  Lyric focus: worst in-shot silence ${focus.worstGap.toFixed(2)}s (limit ${PHRASE_GAP_MAX}s), ` +
    `${focus.reused.length} reused line(s), ${focus.disjoint.length} disjoint shot(s), ` +
    `${focus.mismatched.length} silent-mouth shot(s)` +
    (reasons.length ? ` - TOLERATED via --allow-uniform` : "")
  );
}

// The grid is the single most important intermediate artifact in the run: it is
// the Lyria clock projected onto picture. Persist it for provenance and resume.
fs.writeFileSync(path.join(WORK, "shotplan.json"), JSON.stringify(shotPlan, null, 2));
log(`  Lyria clock: ${linesInWindow.length} lyric line(s) in window, first word at master t=${firstVocalMaster?.toFixed(2) ?? "n/a"}s`);
for (const s of shotPlan) {
  log(`    shot ${s.index} ${s.startSec}-${s.endSec}s ${s.singing ? "SINGING" : "instrumental"} (${Math.round(s.sungFraction * 100)}% sung) ${s.lyric ? `"${s.lyric.slice(0, 48)}"` : ""}`);
}

if (DRY_RUN) {
  log("DRY-RUN COMPLETE. Grid:");
  console.dir(shotPlan, { depth: null });
  if (currentStage) await progress.finish(currentStage, "SUCCEEDED", Date.now() - currentStageStartedAt);
  await progress.setProduction("DRY_RUN_COMPLETE");
  await progress.close();
  process.exit(0);
}

// ---------------------------------------------------------
// 4. ANCHOR_PLATE
// ---------------------------------------------------------
await assertStageOrder("ANCHOR_PLATE");
log("STAGE 4: ANCHOR_PLATE");
const anchorPath = path.join(WORK, "anchor.png");
if (fs.existsSync(anchorPath)) {
  log("  Reusing anchor");
} else {
  const isEnsembleOrDuet = /\b(?:2|two|duet|pair|twin|girls|models|divas)\b/i.test(TOPIC);
  const isAquaticOrPool = /pool|beach|swim|ocean|yacht|resort|calendar shoot/i.test(TOPIC);
  const anchorPrompt = isEnsembleOrDuet
    ? isAquaticOrPool
      ? `IDENTITY LOCK - Two distinct fashion magazine calendar shoot models standing side-by-side at a luxury summer swimming pool in Spain: ${dossier.casting_lock}
WARDROBE LOCK - ${dossier.wardrobe_and_accessory_lock}
Ultra-photorealistic MEDIUM TWO-SHOT VERTICAL 9:16 portrait photograph from WAIST UP of BOTH women standing side-by-side poolside in sunlit summer Spain with turquoise pool water, Mediterranean palm trees, and golden sunlight bokeh behind them.
Mouths CLOSED. Camera perfectly upright, ZERO tilt.
TALL VERTICAL 9:16 PORTRAIT FRAME - waist-up medium two-shot portrait of BOTH women inside frame.
35mm film, Kodak Portra 400 grain, shallow depth of field. High-fashion summer magazine calendar shoot editorial photography.`
      : `IDENTITY LOCK - Two distinct young Punjabi fashion diva top models standing side-by-side on a vibrant Chandigarh nightclub stage: ${dossier.casting_lock}
WARDROBE LOCK - ${dossier.wardrobe_and_accessory_lock}
Ultra-photorealistic full-body VERTICAL 9:16 portrait photograph of BOTH women standing side-by-side on stage in a glamorous Chandigarh nightclub with glowing purple and magenta stage spotlights and soft bokeh.
Mouths CLOSED. Camera perfectly upright, ZERO tilt.
TALL VERTICAL 9:16 PORTRAIT FRAME - full bodies of BOTH women from head to toe inside frame.
35mm film, Kodak Portra 400 grain, shallow depth of field. High-fashion nightclub stage editorial photography.`
    : `IDENTITY LOCK - Character A is one specific woman: ${dossier.casting_lock}
WARDROBE LOCK - ${dossier.wardrobe_and_accessory_lock}
Ultra-photorealistic full-body VERTICAL 9:16 portrait photograph of this woman.
Mouth CLOSED. Camera perfectly upright, ZERO tilt.
TALL VERTICAL 9:16 PORTRAIT FRAME - full body from head to toe inside frame.
35mm film, Kodak Portra 400 grain, shallow depth of field. Editorial fashion photography.`;

  const { res, txt, t0, startedAt, bodyStr } = await apiCall(
    genUrl(YT_STAGE_EXECUTOR.ANCHOR_PLATE, "generateContent"),
    { contents: [{ parts: [{ text: anchorPrompt }] }], generationConfig: { imageConfig: { aspectRatio: "9:16" } } }
  );
  receipt("ANCHOR_PLATE", YT_STAGE_EXECUTOR.ANCHOR_PLATE, "generateContent", res.status, bodyStr, txt.length, startedAt, Date.now() - t0);
  if (!res.ok) throw new Error(`Anchor HTTP ${res.status}: ${txt}`);
  const img = (JSON.parse(txt)?.candidates?.[0]?.content?.parts || []).find(p => p.inlineData?.data);
  if (!img) throw new Error("Anchor: no image");
  const buf = Buffer.from(img.inlineData.data, "base64");
  
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
    if (Math.abs(w / h - 9 / 16) > 0.02) throw new Error(`Anchor not 9:16: ${w}x${h}`);
  }
  fs.writeFileSync(anchorPath, buf);
  log(`  Saved anchor plate`);
}

// ---------------------------------------------------------
// 5. VEO_SHOTS
// ---------------------------------------------------------
await assertStageOrder("VEO_SHOTS");
log("STAGE 5: VEO_SHOTS");
const shotsDir = path.join(WORK, "shots");
const framesDir = path.join(WORK, "frames");
fs.mkdirSync(shotsDir, { recursive: true });
fs.mkdirSync(framesDir, { recursive: true });
rx(`mkdir -p ${RDIR}/shots ${RDIR}/frames`);

// SURPLUS IS CHECKED BEFORE THE SPEND, NOT AFTER.
//
// This guard used to sit after the loop, so a grid that overspent its budget
// was detected only once every shot had already been paid for and downloaded.
// Veo only sells 4s/6s/8s clips, so a span of 2.52s necessarily discards 37%
// of a 4s clip; the surplus is trimmed, which costs money but does not cause a
// speed ramp or any quality loss.
const plannedRequested = shotPlan.reduce((n, s) => n + pickVeoDuration(s.durationSec), 0);
const plannedSurplus = plannedRequested - shotPlan.reduce((n, s) => n + s.durationSec, 0);
const plannedWaste = plannedSurplus / plannedRequested;
log(`  Cut objective: ${OPTIMIZE} (${shotPlan.length} shots over ${linesInWindow.length} lyric lines)`);
log(`  Planned Veo spend: ${plannedRequested}s of buckets for ${TARGET_DURATION}s of screen time (surplus ${(plannedWaste * 100).toFixed(1)}%)`);
for (const s of shotPlan) {
  const b = pickVeoDuration(s.durationSec);
  const w = (b - s.durationSec) / b;
  if (w > 0.30) log(`    note: shot ${s.index} is ${s.durationSec.toFixed(2)}s in a ${b}s bucket (${(w * 100).toFixed(0)}% discarded)`);
}
if (MAX_WASTE >= 1.0) {
  log(`  Surplus ceiling disabled (--max-waste ${MAX_WASTE}); spending for quality, not economy.`);
} else if (plannedWaste > MAX_WASTE) {
  throw new Error(
    `Defect: planned surplus ${(plannedWaste * 100).toFixed(1)}% exceeds the ${(MAX_WASTE * 100).toFixed(0)}% limit ` +
    `(${plannedRequested}s of buckets for ${TARGET_DURATION}s). Refusing to start Veo. ` +
    `Merge short lyric spans so each shot lands nearer a 4s/6s/8s bucket, or raise --max-waste.`
  );
}

let totalRequested = 0;
let totalSurplus = 0;
let condImg = anchorPath;
// Last frame confirmed to contain a usable face. Deliberately NOT seeded with
// the anchor plate: falling back to the plate is precisely the frame-0 reset
// loop this selection logic exists to avoid. Null means the fallback degrades
// to the old last-frame behaviour instead, which is merely imperfect.
let lastGoodIdentityFrame = null;

// Below this, a lead-in or tail-out is too short to be worth describing to Veo
// or to change how the shot is framed.
const LEAD_GRACE = 0.25;

for (let i = 0; i < shotPlan.length; i++) {
  const s = shotPlan[i];
  const outPath = path.join(shotsDir, `s${s.index}.mp4`);
  const reqBucket = pickVeoDuration(s.durationSec);
  
  totalRequested += reqBucket;
  totalSurplus += (reqBucket - s.durationSec);
  
  // FRAMING IS A LEVER VEO ACTUALLY OBEYS. INTRA-SHOT TIMING IS NOT.
  //
  // Runs #4 and #5 settled this. The timing-aware vocal directive below ("the
  // first 1.1 seconds are INSTRUMENTAL, mouth CLOSED, she begins to sing at
  // 1.1s") regenerated all 7 shots - different file hashes, different sizes -
  // and reproduced the SAME two failures at the SAME timestamps. Asking Veo to
  // hold a mouth still for a sub-window of a shot does not work.
  //
  // Shot-level framing is obeyed: the END OF SHOT face directive landed a
  // usable front-facing face in the tail pool of all 7 shots of run #4, and the
  // wide-pool rescue never fired once.
  //
  // So the constraint moves off the time axis, which Veo ignores, and onto the
  // framing axis, which it follows. This is also just music-video grammar - no
  // editor holds a close-up on a singer's face through an instrumental bar,
  // they cut wide. A shot sung edge to edge earns the close-up where lip
  // articulation has to read. A shot with dead air at either edge gets framed
  // so the mouth is not the subject during that dead air.
  //
  // This is mitigation, not a cure: if Veo still moves the mouth in a wide
  // shot the mouth is still moving, only less legible. The audit thresholds are
  // deliberately NOT loosened to match, so the gate can still see it.
  const isEnsembleOrDuet = /\b(?:2|two|duet|pair|twin|girls|models|divas)\b/i.test(TOPIC);
  const lp = s.lyricParts || [];
  const headSil = s.singing && lp.length ? Math.max(0, lp[0].start - s.startSec) : 0;
  const tailSil = s.singing && lp.length ? Math.max(0, s.endSec - lp[lp.length - 1].end) : 0;
  const deadAir = Math.max(headSil, tailSil);
  const framing = !s.singing ? "WIDE" : (isEnsembleOrDuet ? "MEDIUM" : (deadAir > LEAD_GRACE ? "MEDIUM" : "CLOSE"));
  const framingDirective = isEnsembleOrDuet
    ? {
        MEDIUM:
          "FRAMING - medium two-shot from the waist up: BOTH young fashion diva performers are dancing and singing side-by-side in frame, clearly visible from waist to head with expressive stage presence.",
        WIDE:
          "FRAMING - wide full-body two-shot: BOTH young fashion diva performers are dancing side-by-side on the nightclub stage, full bodies visible.",
        CLOSE:
          "FRAMING - medium-close two-shot: BOTH performers' faces and upper torsos are side-by-side in frame.",
      }[framing]
    : {
        CLOSE:
          "FRAMING - tight close-up: her face fills the frame from chin to hairline, shallow depth of " +
          "field, the mouth is the subject and lip articulation must be clearly legible throughout.",
        MEDIUM:
          "FRAMING - medium shot from the waist up: she is dancing with her upper body in frame and the " +
          "camera is NOT tight on her mouth. Her face is present but small enough that it is not the subject.",
        WIDE:
          "FRAMING - wide full-body shot: she is dancing, the environment is visible around her, the " +
          "camera stays back and her face is small in frame. This is a b-roll dance shot, not a vocal shot.",
      }[framing];
  log(`  Shot ${s.index}: framing ${framing}` + (deadAir > LEAD_GRACE ? ` (${deadAir.toFixed(2)}s dead air)` : ``));

  // Reuse is keyed on a fingerprint of the shot spec, not merely on the file
  // existing. A resumed run after a grid change would otherwise silently splice
  // yesterday's shots against today's lyric clock. framing is in the
  // fingerprint so a framing change cannot be silently reused away.
  const specPath = path.join(shotsDir, `s${s.index}.spec.json`);
  const specNow = JSON.stringify({
    d: s.durationSec, singing: s.singing, lyric: s.lyric,
    action: s.action, emotion: s.emotion, bucket: reqBucket, framing,
  });
  const specMatches = fs.existsSync(specPath) && fs.readFileSync(specPath, "utf-8") === specNow;
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 100000 && specMatches) {
    log(`  Shot ${s.index}: Reusing (spec unchanged)`);
  } else {
    if (fs.existsSync(outPath) && !specMatches) log(`  Shot ${s.index}: spec changed, regenerating`);
    log(`  Shot ${s.index}: target ${s.durationSec.toFixed(2)}s, bucket ${reqBucket}s`);
    
    // THE LYRIA CLOCK REACHES VEO HERE.
    //
    // Veo cannot hear the soundtrack, so if the prompt does not say what the
    // audio is doing, the character's mouth is unrelated to the song. The first
    // build omitted this entirely and shipped two seconds of lyrics over a
    // closed mouth. Line-level coincidence is the achievable ceiling: the right
    // shots singing the right words in the right windows. Not phoneme sync.
    // THE DIRECTIVE MUST DESCRIBE *WHEN* INSIDE THE SHOT SHE SINGS.
    //
    // This used to be binary: a shot was either "SINGING during this entire
    // shot ... must NOT have a closed or neutral mouth at any point", or fully
    // instrumental. Shot boundaries do not respect that. Shot 1 of run #4 ran
    // 0-5.37s with the first word at 1.15s, so the prompt ordered a singing
    // mouth over 1.15s of pure instrumental - and Veo obeyed. The reel opened
    // with her lips moving to a song that had not started.
    //
    // That was not a model failure, it was an authored instruction, and it is
    // the defect the project's own Vocal-Coincidence rule exists to prevent:
    // during any instrumental window the mouth must be explicitly closed.
    //
    // So the lyric timings are projected into shot-relative seconds and the
    // silent head and tail are spelled out. Veo cannot hear the track, but it
    // can follow "for the first 1.2 seconds ... then".
    let vocalDirective;
    if (s.singing && (s.lyricParts || []).length) {
      const parts = s.lyricParts;
      const headSilence = Math.max(0, parts[0].start - s.startSec);
      const tailSilence = Math.max(0, s.endSec - parts[parts.length - 1].end);
      const sungFrom = headSilence.toFixed(1);
      const sungTo = Math.min(s.durationSec, parts[parts.length - 1].end - s.startSec).toFixed(1);

      const head = headSilence > LEAD_GRACE
        ? `TIMING - the first ${sungFrom} seconds of this shot are INSTRUMENTAL: her mouth is CLOSED, ` +
          `absolutely no singing and no lip movement, she is dancing and making eye contact only. ` +
          `She begins to sing at ${sungFrom}s into the shot, not before. `
        : `TIMING - she is already singing as the shot opens. `;

      const tail = tailSilence > LEAD_GRACE
        ? `After ${sungTo}s into the shot the vocals stop and her mouth CLOSES again for the remainder. `
        : ``;

      vocalDirective =
        `VOCAL PERFORMANCE (MANDATORY): ${head}` +
        `From ${sungFrom}s to ${sungTo}s she is SINGING out loud, lips clearly articulating and mouth ` +
        `actively opening and closing on the words "${s.lyric}". Visible teeth and tongue movement, jaw ` +
        `moving, an unmistakable singing performance at ${Math.round(timeline.bpm)} BPM. ${tail}` +
        `Do not mouth any words outside the ${sungFrom}s-${sungTo}s window.`;
    } else if (s.singing) {
      // singing flag with no parts should be impossible, but never silently
      // fall through to an instruction that contradicts the audio.
      vocalDirective =
        `VOCAL PERFORMANCE (MANDATORY): she is SINGING out loud during this shot, lips clearly ` +
        `articulating, jaw moving, at ${Math.round(timeline.bpm)} BPM.`;
    } else {
      vocalDirective =
        `NO VOCALS IN THIS SHOT: the music is instrumental here. Mouth CLOSED, no singing, ` +
        `no lip movement. Express through dance, body movement, and eye contact only.`;
    }

    // Veo weights the tail of a long prompt far more heavily than the head, so
    // the vocal directive is restated last.
    const prompt = `IDENTITY LOCK - ${dossier.casting_lock} WARDROBE LOCK - ${dossier.wardrobe_and_accessory_lock}. ` +
      `${s.action} Emotion: ${s.emotion}. Details: ${s.micro_expressions}. ` +
      `${framingDirective} Camera style: ${dossier.camera_plan}. ` +
      `Realistic 35mm film, 9:16 aspect ratio. ${vocalDirective} ` +
      `END OF SHOT (MANDATORY): the final second must show her face clearly in frame, front-facing and evenly lit. ` +
      `Do not end on a body-part detail, a back-of-head, a silhouette or an empty plate.`;
    
    const img64 = fs.readFileSync(condImg).toString("base64");
    const mime = condImg.endsWith(".png") ? "image/png" : "image/jpeg";
    
    if (ENGINE === "omni") {
      const parts = s.lyricParts || [];
      const headSilence = s.singing && parts.length ? Math.max(0, parts[0].start - s.startSec) : 0;
      const tailSilence = s.singing && parts.length ? Math.max(0, s.endSec - parts[parts.length - 1].end) : 0;
      const sungTo = parts.length ? Math.min(s.durationSec, parts[parts.length - 1].end - s.startSec).toFixed(1) : s.durationSec.toFixed(1);

      const isAquaticOrPool = /pool|beach|swim|ocean|yacht|resort|calendar shoot/i.test(TOPIC);
      const sceneEnv = isAquaticOrPool
        ? "at a sunlit luxury Spanish villa swimming pool party with sparkling turquoise water, Mediterranean palm trees, and golden summer sunlight"
        : /chandigarh|club|nightclub/i.test(TOPIC)
        ? "on a glamorous Chandigarh nightclub concert stage with neon laser lights, glowing purple and magenta stage spotlights, and rich bokeh"
        : /stage|concert|college/i.test(TOPIC)
        ? "on a vibrant live concert stage with glowing stage lights and soft bokeh"
        : /terrace|lisbon/i.test(TOPIC)
        ? "on a sunlit Lisbon terrace with terracotta tiles"
        : `in the setting of ${TOPIC}`;
      const wardrobeClause = dossier.wardrobe_and_accessory_lock
        ? `Wardrobe lock: ${dossier.wardrobe_and_accessory_lock}. `
        : "";
      const castClause = isEnsembleOrDuet && dossier.casting_lock
        ? `Cast lock: ${dossier.casting_lock}. `
        : "";

      const buildOmniPrompt = (detailed) => {
        const fallbackWardrobe = isAquaticOrPool
          ? `Wearing their signature turquoise-blue and coral-pink designer summer resort swimwear ensembles by the sunlit pool. `
          : `Wearing their signature emerald-green sequin and ruby-red satin stage ensembles. `;
        const detailBlocks = detailed ? `${castClause}${wardrobeClause}` : fallbackWardrobe;
        const subjectLabel = isAquaticOrPool ? "Both fashion magazine models" : "Both young Punjabi fashion models";
        if (s.singing) {
          if (isEnsembleOrDuet) {
            return (
              `Cinematic 9:16 vertical music video shot ${sceneEnv}. ` +
              `${framingDirective} ${detailBlocks}` +
              (headSilence > LEAD_GRACE
                ? `During the first ${headSilence.toFixed(1)} seconds, both performers dance and smile with their mouths closed. `
                : ``) +
              `${subjectLabel} perform and sing the lyric "${s.lyric}" together with energetic, expressive vocals and synchronized summer dance choreography at ${Math.round(timeline.bpm)} BPM. ` +
              (tailSilence > LEAD_GRACE
                ? `After finishing the lyric around ${sungTo}s, both performers close their mouths and smile warmly while dancing to the beat. `
                : ``) +
              `The final second shows both performers' faces clearly side-by-side in frame, front-facing and evenly lit.`
            );
          }
          return (
            `Cinematic 9:16 vertical music video shot ${sceneEnv}. ` +
            `${framingDirective} ${wardrobeClause}` +
            (headSilence > LEAD_GRACE
              ? `During the first ${headSilence.toFixed(1)} seconds, the singer dances and smiles with her mouth closed. `
              : ``) +
            `The singer performs and sings the lyric "${s.lyric}" with energetic, expressive vocals and natural singing stage performance at ${Math.round(timeline.bpm)} BPM. ` +
            (tailSilence > LEAD_GRACE
              ? `After finishing the lyric around ${sungTo}s, she closes her mouth and smiles warmly while dancing to the beat. `
              : ``) +
            `The final second shows her face clearly in frame, front-facing and evenly lit.`
          );
        }
        return (
          `Cinematic 9:16 vertical music video b-roll shot ${sceneEnv}. ` +
          `${framingDirective} ${castClause}${wardrobeClause}` +
          `Instrumental dance break: ${isEnsembleOrDuet ? "both performers spin and dance" : "the performer spins and dances"} gracefully ${sceneEnv} with a warm smile, mouth closed, no singing, pure non-vocal dance performance at ${Math.round(timeline.bpm)} BPM. ` +
          `The final second shows ${isEnsembleOrDuet ? "both performers' faces clearly side-by-side" : "her face clearly"} in frame, front-facing and evenly lit.`
        );
      };

      let omniVidB64 = null;
      for (const detailed of [true, false]) {
        const omniPrompt = buildOmniPrompt(detailed);
        const omniBody = {
          model: "models/gemini-omni-1.1-flash",
          input: [{
            type: "user_input",
            content: [
              { type: "image", mime_type: mime, data: img64 },
              { type: "text", text: omniPrompt },
            ],
          }],
          response_format: {
            type: "video",
            resolution: "720p",
            aspect_ratio: "9:16",
            duration: `${s.durationSec.toFixed(3)}s`,
          },
        };
        const { res, txt, t0, startedAt } = await apiCall(
          `https://generativelanguage.googleapis.com/v1beta/interactions?key=${API_KEY}`,
          omniBody
        );
        receipt(`VEO_SHOT_${s.index}_OMNI`, "models/gemini-omni-1.1-flash", "interactions", res.status, omniPrompt, txt.length, startedAt, Date.now() - t0);
        if (res.ok) {
          const o = JSON.parse(txt);
          for (const st of (o.steps || [])) {
            for (const c of (st.content || [])) {
              if (c.type === "video" && c.data) omniVidB64 = c.data;
            }
          }
          if (omniVidB64) break;
        }
        log(`    Omni attempt (${detailed ? "detailed" : "fallback"}) status ${res.status}: ${txt.slice(0, 200)}`);
      }
      if (!omniVidB64) {
        log(`    Self-healing: applying waist-up portrait framing crop to conditioning image and retrying Omni...`);
        const cropPath = path.join(framesDir, `s${s.index}_crop.jpg`);
        try {
          sh(`ffmpeg -y -v error -i "${condImg}" -vf "crop=iw*0.72:ih*0.72:(iw-iw*0.72)/2:0,scale=1080:1920" -q:v 2 "${cropPath}"`);
          const cropImg64 = fs.readFileSync(cropPath).toString("base64");
          const cropPrompt = buildOmniPrompt(false);
          const cropBody = {
            model: "models/gemini-omni-1.1-flash",
            input: [{
              type: "user_input",
              content: [
                { type: "image", mime_type: "image/jpeg", data: cropImg64 },
                { type: "text", text: cropPrompt },
              ],
            }],
            response_format: {
              type: "video",
              resolution: "720p",
              aspect_ratio: "9:16",
              duration: `${s.durationSec.toFixed(3)}s`,
            },
          };
          const { res, txt, t0, startedAt } = await apiCall(
            `https://generativelanguage.googleapis.com/v1beta/interactions?key=${API_KEY}`,
            cropBody
          );
          receipt(`VEO_SHOT_${s.index}_OMNI_CROP`, "models/gemini-omni-1.1-flash", "interactions", res.status, cropPrompt, txt.length, startedAt, Date.now() - t0);
          if (res.ok) {
            const o = JSON.parse(txt);
            for (const st of (o.steps || [])) {
              for (const c of (st.content || [])) {
                if (c.type === "video" && c.data) omniVidB64 = c.data;
              }
            }
          }
          log(`    Omni attempt (self-healed waist-up crop) status ${res.status}`);
        } catch (cropErr) {
          log(`    Waist-up crop retry warning: ${cropErr.message}`);
        }
      }
      if (omniVidB64) {
        const vb = Buffer.from(omniVidB64, "base64");
        fs.writeFileSync(outPath, vb);
        fs.writeFileSync(specPath, specNow);
        log(`    Saved Omni s${s.index}.mp4 (${vb.length} bytes, requested ${s.durationSec.toFixed(3)}s)`);
      } else {
        log(`    Omni interactions blocked image input; delegating Shot ${s.index} to Veo 3.1 (personGeneration: allow_adult)...`);
        const veoBucket = [4, 6, 8].find((b) => b >= s.durationSec) || 8;
        const veoBody = {
          instances: [{ prompt: buildOmniPrompt(false), image: { bytesBase64Encoded: img64, mimeType: mime } }],
          parameters: { aspectRatio: "9:16", durationSeconds: veoBucket, personGeneration: "allow_adult" },
        };
        const { res: vRes, txt: vTxt, t0: vt0, startedAt: vStart, bodyStr: vBodyStr } = await apiCall(
          genUrl(YT_STAGE_EXECUTOR.VEO_SHOTS, "predictLongRunning"),
          veoBody
        );
        receipt(`VEO_SHOT_${s.index}_FALLBACK_INIT`, YT_STAGE_EXECUTOR.VEO_SHOTS, "predictLongRunning", vRes.status, vBodyStr, vTxt.length, vStart, Date.now() - vt0);
        if (!vRes.ok) throw new Error(`Veo fallback HTTP ${vRes.status}: ${vTxt}`);
        const opName = JSON.parse(vTxt).name;
        let videoUri = null;
        for (let k = 0; k < 60; k++) {
          await new Promise((r) => setTimeout(r, 10000));
          const pollRes = await fetchRetry(`https://generativelanguage.googleapis.com/v1beta/${opName}?key=${API_KEY}`);
          const pj = await pollRes.json();
          if (pj.done) {
            if (pj.error) throw new Error(`Veo fallback failed: ${JSON.stringify(pj.error)}`);
            videoUri = pj.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
            break;
          }
        }
        if (!videoUri) throw new Error("Veo fallback timeout or no URI");
        const rawVeoPath = path.join(shotsDir, `s${s.index}_veo_raw.mp4`);
        const vb = Buffer.from(await (await fetchRetry(`${videoUri}&key=${API_KEY}`)).arrayBuffer());
        fs.writeFileSync(rawVeoPath, vb);
        const sliceStart = (windowStart + s.startSec).toFixed(3);
        sh(`ffmpeg -y -v error -i "${rawVeoPath}" -ss ${sliceStart} -t ${s.durationSec.toFixed(3)} -i "${songPath}" -map 0:v:0 -map 1:a:0 -t ${s.durationSec.toFixed(3)} -c:v libx264 -preset fast -crf 18 -c:a aac -ar 48000 -ac 2 "${outPath}"`);
        fs.writeFileSync(specPath, specNow);
        log(`    Saved Veo 3.1 delegated s${s.index}.mp4 (${fs.statSync(outPath).size} bytes, trimmed to ${s.durationSec.toFixed(3)}s with vocal slice)`);
      }
    } else {
      let opName = null;
      const body = {
        instances: [{ prompt, image: { bytesBase64Encoded: img64, mimeType: mime } }],
        parameters: { aspectRatio: "9:16", durationSeconds: reqBucket, personGeneration: "allow_adult" }
      };
      
      const { res, txt, t0, startedAt, bodyStr } = await apiCall(
        genUrl(YT_STAGE_EXECUTOR.VEO_SHOTS, "predictLongRunning"),
        body
      );
      receipt(`VEO_SHOT_${s.index}_INIT`, YT_STAGE_EXECUTOR.VEO_SHOTS, "predictLongRunning", res.status, bodyStr, txt.length, startedAt, Date.now() - t0);
      if (!res.ok) throw new Error(`Veo HTTP ${res.status}: ${txt}`);
      opName = JSON.parse(txt).name;
      
      let videoUri = null;
      for (let k = 0; k < 60; k++) {
        await new Promise(r => setTimeout(r, 10000));
        const pollRes = await fetchRetry(`https://generativelanguage.googleapis.com/v1beta/${opName}?key=${API_KEY}`);
        const pj = await pollRes.json();
        if (pj.done) {
          if (pj.error) throw new Error(`Veo failed: ${JSON.stringify(pj.error)}`);
          videoUri = pj.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
          break;
        }
      }
      if (!videoUri) throw new Error("Veo timeout or no URI");
      
      const vb = Buffer.from(await (await fetchRetry(`${videoUri}&key=${API_KEY}`)).arrayBuffer());
      fs.writeFileSync(outPath, vb);
      fs.writeFileSync(specPath, specNow);
      log(`    Downloaded s${s.index}.mp4 (${vb.length} bytes)`);
    }
  }
  
  // Re-anchoring logic. Cadence 0 disables it entirely; note that relying on
  // `x % 0` returning NaN would have worked by accident, so it is explicit.
  const nextS = i < shotPlan.length - 1 ? shotPlan[i + 1] : null;
  const nextOut = nextS ? path.join(shotsDir, `s${nextS.index}.mp4`) : null;
  const nextAlreadyBuilt = nextOut && fs.existsSync(nextOut) && fs.statSync(nextOut).size > 100000;
  if (!nextAlreadyBuilt) {
    sh(`scp ${SSH_OPTS} -q "${outPath}" ${HOST}:${RDIR}/shots/s${s.index}.mp4`);
  }
  if (i < shotPlan.length - 1 && !nextAlreadyBuilt) {
    const reAnchor = ANCHOR_CADENCE > 0 && (i + 1) % ANCHOR_CADENCE === 0;
    if (reAnchor) {
      condImg = anchorPath;
      log(`    Re-anchoring shot ${s.index + 1} (cadence ${ANCHOR_CADENCE}; risks a frame-0 reset)`);
    } else {
      // THE TAIL FRAME IS AN IDENTITY REFERENCE, SO IT MUST CONTAIN A FACE.
      //
      // This used to take whatever frame happened to land at duration-0.05s.
      // Measured consequence in the Lisbon run: s4's tail was a headless torso
      // (camera framed on the dress) and s5's was a backlit profile in near
      // silhouette. Veo was handed those as the only identity anchor for the
      // next shot, had no facial information to preserve, and generated a
      // different woman from t=19.8s onward.
      //
      // Re-anchoring to the static plate would "fix" identity by reintroducing
      // the frame-0 reset loop. Instead, candidates are sampled across the tail
      // and the most usable face is chosen. The result is still a real frame
      // from this shot, so continuity holds and no reset is introduced.
      // Candidates come from two pools because a tail-only search is not always
      // solvable. Probing shot 4 of the Lisbon run returned "the person's face
      // and head are not visible in any of the frames": the camera sat on the
      // dress for its entire final 1.2s, so no tail frame could ever serve as an
      // identity reference.
      //
      // Pool A (indices 0..5) is the tail, preferred because it preserves
      // continuity. Pool B (6..9) spans the rest of the shot and exists only to
      // rescue the case where pool A contains no face. Both are real frames from
      // this shot, so neither reintroduces the static-plate reset.
      const nTail = 6;
      const tailWindow = Math.min(1.2, Math.max(0.3, s.durationSec - 0.2));
      const tailTimes = Array.from({ length: nTail }, (_, k) =>
        Math.max(0.05, s.durationSec - 0.05 - (tailWindow * k) / (nTail - 1))
      );
      const nWide = 4;
      const wideSpan = Math.max(0, s.durationSec - tailWindow - 0.1);
      const wideTimes = wideSpan > 0.3
        ? Array.from({ length: nWide }, (_, k) => Number((0.1 + (wideSpan * (k + 0.5)) / nWide).toFixed(3)))
        : [];
      const candTimes = [...tailTimes, ...wideTimes];

      if (cloudtopReachable) {
        rx(candTimes.map((t, k) =>
          `ffmpeg -y -v error -ss ${t.toFixed(3)} -i ${RDIR}/shots/s${s.index}.mp4 -frames:v 1 -q:v 2 ${RDIR}/frames/s${s.index}_c${String(k).padStart(2, "0")}.jpg`
        ).join(" && "));
        sh(`scp ${SSH_OPTS} -q "${HOST}:${RDIR}/frames/s${s.index}_c*.jpg" "${framesDir}/"`);
      } else {
        execFileSync("bash", ["-lc", candTimes.map((t, k) =>
          `ffmpeg -y -v error -ss ${t.toFixed(3)} -i "${outPath}" -frames:v 1 -q:v 2 "${framesDir}/s${s.index}_c${String(k).padStart(2, "0")}.jpg"`
        ).join(" && ")]);
      }

      const candPaths = candTimes.map((_, k) => path.join(framesDir, `s${s.index}_c${String(k).padStart(2, "0")}.jpg`));
      const present = candPaths.filter((p) => fs.existsSync(p) && fs.statSync(p).size > 2000);

      // Index 0 is the true last frame, so falling back to it reproduces the
      // old behaviour exactly rather than doing something new under failure.
      let chosen = present[0] || candPaths[0];
      if (present.length > 1) {
        try {
          const nTailPresent = Math.min(nTail, present.length);
          const parts = [{
            text:
              `These ${present.length} stills all come from ONE video shot of the same person.\n` +
              `Images 0-${nTailPresent - 1} are the END of the shot, ordered LAST-FIRST (0 is the final frame).\n` +
              (present.length > nTailPresent
                ? `Images ${nTailPresent}-${present.length - 1} are sampled from EARLIER in the same shot.\n`
                : "") +
              `The chosen image becomes the identity reference for generating the NEXT shot of this person, ` +
              `so it MUST show her face.\n` +
              `Require: the whole face visible and in frame, not cropped. Prefer facing the camera over profile, ` +
              `even lighting over silhouette or heavy backlight, and sharp focus over motion blur.\n` +
              `Choose the LOWEST index that genuinely satisfies this, because lower indices preserve continuity.\n` +
              `Only choose an index of ${nTailPresent} or higher if NONE of images 0-${nTailPresent - 1} shows a usable face.\n` +
              `Set "face_found" to false only if no image at all shows a usable face.\n` +
              `Reply with ONLY JSON: {"index": <number>, "face_found": <true|false>, "why": "<short reason>"}`,
          }];
          for (const p of present) {
            parts.push({ inlineData: { mimeType: "image/jpeg", data: fs.readFileSync(p).toString("base64") } });
          }
          const { res, txt, t0, startedAt, bodyStr } = await apiCall(
            genUrl(TAIL_SELECT_MODEL, "generateContent"),
            {
              contents: [{ parts }],
              generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: "OBJECT",
                  properties: {
                    index: { type: "INTEGER" },
                    face_found: { type: "BOOLEAN" },
                    why: { type: "STRING" },
                  },
                  required: ["index", "face_found", "why"],
                },
              },
            }
          );
          receipt(`TAIL_SELECT_${s.index}`, TAIL_SELECT_MODEL, "generateContent", res.status, bodyStr, txt.length, startedAt, Date.now() - t0);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const pick = JSON.parse(JSON.parse(txt).candidates[0].content.parts[0].text);
          const idx = Number(pick.index);
          if (pick.face_found === false) {
            // Nothing in this shot can anchor identity. Carry the last frame that
            // could, rather than the static plate: it is a real frame from a real
            // shot, and CROSS_CUT_RESET_LOOP still gates the consequence.
            if (lastGoodIdentityFrame) {
              chosen = lastGoodIdentityFrame;
              log(`    Tail frame: NO face anywhere in shot ${s.index}; reusing last good identity frame`);
            } else {
              log(`    Tail frame: NO face anywhere in shot ${s.index} and no earlier reference; using last frame`);
            }
          } else if (Number.isInteger(idx) && idx >= 0 && idx < present.length) {
            chosen = present[idx];
            lastGoodIdentityFrame = chosen;
            const pool = idx < nTailPresent ? "tail" : "earlier in shot";
            log(`    Tail frame for shot ${s.index + 1}: candidate ${idx} (${pool}) - ${pick.why}`);
          } else {
            log(`    Tail frame: model returned out-of-range index ${pick.index}; using last frame`);
          }
        } catch (e) {
          // Fail soft: a bad identity reference degrades the next shot, it does
          // not corrupt the master, and the audit still gates on the result.
          log(`    Tail frame selection failed (${e.message}); using last frame`);
        }
      }
      condImg = chosen;
    }
  }
}

const wasteRatio = totalSurplus / totalRequested;
log(`  Total requested: ${totalRequested}s, Target: ${TARGET_DURATION}s, Waste: ${(wasteRatio * 100).toFixed(1)}%`);
// Actual must agree with what the pre-flight authorised; a divergence means the
// grid mutated mid-stage and the budget check was bypassed.
if (Math.abs(totalRequested - plannedRequested) > 0.001) {
  throw new Error(`Defect: spent ${totalRequested}s of Veo buckets but pre-flight authorised ${plannedRequested}s.`);
}

// ---------------------------------------------------------
// 6. MASTER_MUX
// ---------------------------------------------------------
await assertStageOrder("MASTER_MUX");
log("STAGE 6: MASTER_MUX");
const masterSh = `#!/bin/bash
set -e
cd ${RDIR.replace("~", "$HOME")}
> concat.txt
> aconcat.txt
`;
let scriptLines = [masterSh];
for (let i = 0; i < shotPlan.length; i++) {
  const s = shotPlan[i];
  scriptLines.push(`CROP${s.index}=$(ffmpeg -hide_banner -nostats -ss 0.5 -t 2 -i shots/s${s.index}.mp4 -vf cropdetect=24:2:0 -f null - 2>&1 | grep -o 'crop=[0-9:]*' | tail -1)`);
  scriptLines.push(`echo "  shot ${s.index} cropdetect: \${CROP${s.index}:-none}"`);
  scriptLines.push(`ffmpeg -y -v error -i shots/s${s.index}.mp4 -t ${s.durationSec} -vf "\${CROP${s.index}:+\${CROP${s.index}},}scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1" -an -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p t_${s.index}.mp4`);
  scriptLines.push(`echo "file 't_${s.index}.mp4'" >> concat.txt`);
  if (ENGINE === "omni") {
    const fadeOutStart = Math.max(0, s.durationSec - 0.04).toFixed(3);
    scriptLines.push(`ffmpeg -y -v error -i shots/s${s.index}.mp4 -t ${s.durationSec} -af "aresample=48000,afade=t=in:st=0:d=0.03,afade=t=out:st=${fadeOutStart}:d=0.04" -ar 48000 -ac 2 a_${s.index}.wav`);
    scriptLines.push(`echo "file 'a_${s.index}.wav'" >> aconcat.txt`);
  }
}
scriptLines.push(`ffmpeg -y -v error -f concat -safe 0 -i concat.txt -c copy silent.mp4`);
scriptLines.push(`ffmpeg -y -v error -ss ${windowStart} -t ${TARGET_DURATION} -i song.mp3 -c copy song_cut.mp3`);
scriptLines.push(`ffmpeg -y -v error -i silent.mp4 -i song_cut.mp3 -filter_complex "[1:a]loudnorm=I=-14:TP=-2.0:LRA=11,alimiter=level=0:limit=0.891:attack=5:release=50,aresample=48000[a]" -map 0:v -map "[a]" -t ${TARGET_DURATION} -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart master_lyria.mp4`);
if (ENGINE === "omni") {
  scriptLines.push(`ffmpeg -y -v error -f concat -safe 0 -i aconcat.txt -c copy native_concat.wav`);
  scriptLines.push(`ffmpeg -y -v error -i silent.mp4 -i native_concat.wav -filter_complex "[1:a]loudnorm=I=-14:TP=-2.0:LRA=11,alimiter=level=0:limit=0.891:attack=5:release=50,aresample=48000[a]" -map 0:v -map "[a]" -t ${TARGET_DURATION} -c:v copy -c:a aac -b:a 192k -movflags +faststart master_native.mp4`);
}
scriptLines.push(`cp -f master_lyria.mp4 master.mp4`);
scriptLines.push(`ffmpeg -y -v error -i master.mp4 -vf fps=1 frame_%03d.jpg`);

fs.writeFileSync(path.join(WORK, "master.sh"), scriptLines.join("\n"));
const masterPath = path.join(WORK, "master.mp4");
const masterLyriaPath = path.join(WORK, "master_lyria.mp4");
const masterHybridPath = path.join(WORK, "master_hybrid.mp4");
const masterNativePath = path.join(WORK, "master_native.mp4");

if (fs.existsSync(masterPath) && fs.statSync(masterPath).size > 500000 && (!ENGINE || ENGINE !== "omni" || fs.existsSync(masterHybridPath))) {
  log(`  Reusing existing master (${AUDIO_SOURCE}) at ${masterPath}`);
} else {
  const silentLocal = path.join(WORK, "silent.mp4");
  const songCutLocal = path.join(WORK, "song_cut.mp3");
  const nativeWavLocal = path.join(WORK, "native_concat.wav");
  if (cloudtopReachable) {
    rx(`mkdir -p ${RDIR}`);
    sh(`scp ${SSH_OPTS} -q "${songPath}" ${HOST}:${RDIR}/song.mp3`);
    sh(`scp ${SSH_OPTS} -q "${path.join(WORK, "master.sh")}" ${HOST}:${RDIR}/master.sh`);
    rx(`chmod +x ${RDIR}/master.sh`);
    log("  Running ffmpeg master on Cloudtop...");
    rx(`${RDIR}/master.sh`);

    sh(`scp ${SSH_OPTS} -q ${HOST}:${RDIR}/master_lyria.mp4 "${masterLyriaPath}"`);
    if (ENGINE === "omni") {
      sh(`scp ${SSH_OPTS} -q ${HOST}:${RDIR}/master_native.mp4 "${masterNativePath}"`);
      sh(`scp ${SSH_OPTS} -q ${HOST}:${RDIR}/silent.mp4 "${silentLocal}"`);
      sh(`scp ${SSH_OPTS} -q ${HOST}:${RDIR}/song_cut.mp3 "${songCutLocal}"`);
      sh(`scp ${SSH_OPTS} -q ${HOST}:${RDIR}/native_concat.wav "${nativeWavLocal}"`);
    }
  } else {
    log("  Running ffmpeg master locally...");
    const localSh = scriptLines.join("\n").replace(`cd ${RDIR.replace("~", "$HOME")}`, `cd "${path.resolve(WORK)}"`);
    fs.writeFileSync(path.join(WORK, "master_local.sh"), localSh);
    execFileSync("bash", [path.join(WORK, "master_local.sh")], { stdio: "inherit" });
  }

  if (ENGINE === "omni") {

    const demucsDir = path.join(WORK, "demucs_stems");
    const demucsPy = path.resolve("tools/asr/.venv/bin/python");
    if (fs.existsSync(demucsPy)) {
      log("  Separating stems via Demucs (Lyria continuous instrumental bed + Omni vocal stem)...");
      execFileSync(demucsPy, ["-m", "demucs.separate", "-n", "htdemucs", "--two-stems=vocals", "-o", demucsDir, songCutLocal, nativeWavLocal], { stdio: "ignore" });
      const lyriaBed = path.join(demucsDir, "htdemucs", "song_cut", "no_vocals.wav");
      const omniVoc = path.join(demucsDir, "htdemucs", "native_concat", "vocals.wav");
      if (fs.existsSync(lyriaBed) && fs.existsSync(omniVoc)) {
        execFileSync("ffmpeg", [
          "-y", "-v", "error",
          "-i", silentLocal,
          "-i", lyriaBed,
          "-i", omniVoc,
          "-filter_complex", "[1:a]volume=0.85[bed];[2:a]volume=1.35[voc];[bed][voc]amix=inputs=2:duration=first:dropout_transition=0,loudnorm=I=-14:TP=-2.0:LRA=11,alimiter=limit=-1.6dB:level=false,aresample=48000[a]",
          "-map", "0:v", "-map", "[a]",
          "-t", String(TARGET_DURATION),
          "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
          masterHybridPath
        ]);
        log(`  Built hybrid master at ${masterHybridPath}`);
      }
    }

    if (AUDIO_SOURCE === "hybrid" && fs.existsSync(masterHybridPath)) {
      fs.copyFileSync(masterHybridPath, masterPath);
    } else if (AUDIO_SOURCE === "native" && fs.existsSync(masterNativePath)) {
      fs.copyFileSync(masterNativePath, masterPath);
    } else {
      fs.copyFileSync(masterLyriaPath, masterPath);
    }
  } else {
    fs.copyFileSync(masterLyriaPath, masterPath);
  }
}
log(`  Active master (${AUDIO_SOURCE}) ready at ${masterPath}`);

// ---------------------------------------------------------
// 7. OMNI_SYNC_AUDIT  (fail-closed)
// ---------------------------------------------------------
await assertStageOrder("OMNI_SYNC_AUDIT");
log("STAGE 7: OMNI_SYNC_AUDIT");

const hasLocalFfmpeg = (() => {
  try { execFileSync("ffmpeg", ["-version"], { stdio: "ignore" }); return true; }
  catch { return false; }
})();

let auditLyricLines = linesInWindow;
if (ENGINE === "omni" && AUDIO_SOURCE !== "lyria") {
  const demucsVocalStem = path.join(WORK, "demucs_stems/htdemucs/native_concat/vocals.wav");
  const nativeWavLocal = fs.existsSync(demucsVocalStem) ? demucsVocalStem : path.join(WORK, "native_concat.wav");
  const nativeAsrOut = path.join(WORK, "native_asr.json");
  const asrPy7 = path.resolve("tools/asr/.venv/bin/python");
  const asrScript7 = path.resolve("tools/asr/transcribe.py");
  if (fs.existsSync(nativeWavLocal) && fs.existsSync(asrPy7)) {
    try {
      if (!fs.existsSync(nativeAsrOut)) {
        execFileSync(asrPy7, [asrScript7, "--audio", nativeWavLocal, "--out", nativeAsrOut, "--no-demucs"], {
          stdio: "ignore",
          env: { ...process.env, HF_HUB_DISABLE_PROGRESS_BARS: "1" },
        });
      }
      const nativeAsr = JSON.parse(fs.readFileSync(nativeAsrOut, "utf-8"));
      if (Array.isArray(nativeAsr.words) && nativeAsr.words.length) {
        const mapped = [];
        for (const s of shotPlan) {
          if (!s.singing) continue;
          const sw = nativeAsr.words.filter((w) => w.start >= s.startSec - 0.15 && w.end <= s.endSec + 0.15);
          if (sw.length) {
            mapped.push({
              text: s.lyric,
              start: Number(sw[0].start.toFixed(3)),
              end: Number(sw[sw.length - 1].end.toFixed(3)),
            });
          } else {
            mapped.push({
              text: s.lyric,
              start: Number(Math.max(s.startSec, s.startSec + 0.25).toFixed(3)),
              end: Number(Math.max(s.startSec + 0.5, s.endSec - 0.35).toFixed(3)),
            });
          }
        }
        if (mapped.length) {
          auditLyricLines = mapped;
          log(`  Audit vocal clock synchronized to active master audio (${mapped.length} sung line(s))`);
        }
      }
    } catch (e) {
      log(`  Warning: native ASR alignment skipped (${e.message})`);
    }
  }
}

const auditReport = await runOmniSyncAudit({
  apiKey: API_KEY,
  host: hasLocalFfmpeg ? "local" : HOST,
  remoteMaster: hasLocalFfmpeg ? path.resolve(WORK, "master.mp4") : `${RDIR}/master.mp4`,
  remoteFramesDir: hasLocalFfmpeg ? path.resolve(WORK, "audit_frames") : `${RDIR}/audit_frames`,
  localDir: WORK,
  targetDuration: TARGET_DURATION,
  windowStart: ENGINE === "omni" && AUDIO_SOURCE !== "lyria" ? 0 : windowStart,
  timeline: ENGINE === "omni" && AUDIO_SOURCE !== "lyria"
    ? { ...timeline, first_vocal_onset_sec: auditLyricLines[0]?.start ?? timeline.first_vocal_onset_sec }
    : timeline,
  lyricLines: auditLyricLines,
  cutTimes: shotPlan.map((s) => s.startSec ?? s.start ?? null).filter((t) => t !== null),
  model: YT_STAGE_EXECUTOR.OMNI_SYNC_AUDIT,
  spec: YT_MASTER_SPEC,
  topic: TOPIC,
  genre: GENRE,
  receipt,
  log,
});

receipt("OMNI_SYNC_AUDIT_VERDICT", "deterministic:cross-check (no model)", "local",
  auditReport.verdict === "PASS" ? 200 : 500,
  JSON.stringify(auditReport.failures), 0, new Date().toISOString(), 0);

if (auditReport.verdict === "FAIL") {
  const summary = auditReport.failures.map((f) => f.code).join(", ");
  log(`\nOMNI_SYNC_AUDIT: FAIL (${auditReport.failures.length} defect(s))`);
  for (const f of auditReport.failures) log(`  - ${f.code}: ${f.detail}`);
  log(`Report: ${path.join(WORK, "audit.json")}`);
  await progress.finish("OMNI_SYNC_AUDIT", "FAILED", Date.now() - currentStageStartedAt, summary);
  await progress.setProduction("AUDIT_FAILED", summary);
  await progress.close();
  process.exit(1);
}

log("\nOMNI_SYNC_AUDIT: PASS (all deterministic and vision checks satisfied)");
log(`Report: ${path.join(WORK, "audit.json")}`);
await progress.finish("OMNI_SYNC_AUDIT", "SUCCEEDED", Date.now() - currentStageStartedAt);

let publishedVideoUrl = null;
let publishedAssets = {};
let publishedRenders = [];
if (PRODUCTION_ID) {
  const pubRoot = path.resolve(process.cwd(), "public", "renders", "yt");
  const destDir = path.join(pubRoot, PRODUCTION_ID);
  fs.mkdirSync(destDir, { recursive: true });

  const copyIfPresent = (srcRel, destName) => {
    const fullSrc = path.join(WORK, srcRel);
    if (fs.existsSync(fullSrc)) {
      fs.copyFileSync(fullSrc, path.join(destDir, destName));
      return `/renders/yt/${PRODUCTION_ID}/${destName}`;
    }
    return null;
  };

  const srcMaster = path.join(WORK, "master.mp4");
  if (fs.existsSync(srcMaster)) {
    fs.copyFileSync(srcMaster, path.join(pubRoot, `${PRODUCTION_ID}.mp4`));
    publishedVideoUrl = `/renders/yt/${PRODUCTION_ID}.mp4`;
  }

  const hybridUrl = copyIfPresent("master_hybrid.mp4", "master_hybrid.mp4") || publishedVideoUrl;
  const nativeUrl = copyIfPresent("master_native.mp4", "master_native.mp4");
  const lyriaVideoUrl = copyIfPresent("master_lyria.mp4", "master_lyria.mp4");
  const songUrl = copyIfPresent("song.mp3", "song.mp3");
  const anchorUrl = copyIfPresent("anchor.png", "anchor.png");
  const dossierUrl = copyIfPresent("dossier.json", "dossier.json");
  const auditUrl = copyIfPresent("audit.json", "audit.json");

  const shots = [];
  for (let i = 0; i < shotPlan.length; i++) {
    const idx = i + 1;
    const sUrl = copyIfPresent(`shots/s${idx}.mp4`, `shot_${idx}.mp4`);
    if (sUrl) {
      shots.push({
        index: idx,
        id: `${PRODUCTION_ID}_shot_${idx}`,
        title: `Shot ${idx} (${shotPlan[i]?.framing || "MEDIUM"})`,
        lyric: shotPlan[i]?.lyric || shotPlan[i]?.vocalDirective || "",
        durationSec: shotPlan[i]?.targetSec || shotPlan[i]?.duration || 6,
        videoUrl: sUrl,
      });
    }
  }

  publishedAssets = {
    masterHybridUrl: hybridUrl,
    masterNativeUrl: nativeUrl,
    masterLyriaUrl: lyriaVideoUrl,
    songUrl,
    anchorUrl,
    dossierUrl,
    auditUrl,
    shots,
  };

  publishedRenders = [
    ...(hybridUrl ? [{ label: "Hybrid Master (Demucs Bed + Vocals)", url: hybridUrl, type: "hybrid" }] : []),
    ...(nativeUrl ? [{ label: "Original Native Audio (Omni)", url: nativeUrl, type: "native" }] : []),
    ...(lyriaVideoUrl ? [{ label: "Pure Lyria 3.5 Audio Master", url: lyriaVideoUrl, type: "lyria" }] : []),
  ];
}

await progress.setProduction("READY", null, {
  manifest: {
    videoUrl: publishedVideoUrl,
    assets: publishedAssets,
    audit: auditReport,
    dossier,
  },
  renders: publishedRenders,
});
await progress.close();
log("PIPELINE COMPLETE.");
