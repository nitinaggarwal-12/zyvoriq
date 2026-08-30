import crypto from "node:crypto";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import pg from "pg";

const { Pool } = pg;
const execFileAsync = promisify(execFile);
const API_BASE = "https://generativelanguage.googleapis.com";
const SAMPLE_RATE = 24000;
const SAMPLE_WIDTH = 2;
const CHANNELS = 1;
const workerId = `reel-worker-${process.pid}-${crypto.randomUUID().slice(0, 8)}`;
const pollMs = Math.max(500, Number(process.env.ZYVORIQ_WORKER_POLL_MS || 1500));

function dbUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_PRIVATE_URL || "";
}
function apiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
}
function assetRoot() {
  return process.env.ZYVORIQ_ASSET_ROOT || process.env.RAILWAY_VOLUME_MOUNT_PATH || "";
}

if (!dbUrl()) {
  console.error("[reel-worker] Postgres is not configured; durable paid operations are disabled.");
  process.exit(0);
}

const pool = new Pool({
  connectionString: dbUrl(),
  ssl: dbUrl().includes("localhost") || dbUrl().includes("127.0.0.1") ? false : { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 30000,
});

const OP_TABLE = `
CREATE TABLE IF NOT EXISTS reel_operations (
  id TEXT PRIMARY KEY,
  production_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  target_id TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'QUEUED',
  attempt INTEGER NOT NULL DEFAULT 0,
  provider_operation_name TEXT,
  payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  result_json JSONB,
  last_error TEXT,
  lease_owner TEXT,
  lease_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reel_operations_status_created ON reel_operations(status, created_at);
CREATE INDEX IF NOT EXISTS idx_reel_operations_production ON reel_operations(production_id, created_at DESC);
`;
await pool.query(OP_TABLE);

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function safeKey(key) {
  const normalized = String(key).replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalized || normalized.includes("..") || normalized.startsWith("/")) throw new Error("Invalid asset key");
  return normalized;
}
function assetKeyFromUrl(url) {
  const prefix = "/api/reels/assets/";
  if (!String(url).startsWith(prefix)) throw new Error(`Non-owned asset URL: ${url}`);
  return safeKey(String(url).slice(prefix.length).split("/").map(decodeURIComponent).join("/"));
}
function assetPath(keyOrUrl) {
  const root = assetRoot();
  if (!root) throw new Error("Durable asset storage is not configured");
  const key = String(keyOrUrl).startsWith("/api/reels/assets/") ? assetKeyFromUrl(keyOrUrl) : safeKey(keyOrUrl);
  const resolvedRoot = path.resolve(root);
  const target = path.resolve(root, key);
  if (!target.startsWith(`${resolvedRoot}${path.sep}`)) throw new Error("Asset path escaped durable root");
  return { key, target };
}
async function writeAsset(key, buffer) {
  const resolved = assetPath(key);
  await fs.mkdir(path.dirname(resolved.target), { recursive: true });
  await fs.writeFile(resolved.target, buffer);
  return { key: resolved.key, url: `/api/reels/assets/${resolved.key.split("/").map(encodeURIComponent).join("/")}` };
}

function wavFromPcm(pcm) {
  const header = Buffer.alloc(44);
  const byteRate = SAMPLE_RATE * CHANNELS * SAMPLE_WIDTH;
  header.write("RIFF", 0); header.writeUInt32LE(36 + pcm.length, 4); header.write("WAVE", 8);
  header.write("fmt ", 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(CHANNELS, 22);
  header.writeUInt32LE(SAMPLE_RATE, 24); header.writeUInt32LE(byteRate, 28); header.writeUInt16LE(CHANNELS * SAMPLE_WIDTH, 32);
  header.writeUInt16LE(SAMPLE_WIDTH * 8, 34); header.write("data", 36); header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}
function findAudioData(value) {
  if (!value || typeof value !== "object") return null;
  for (const key of ["output_audio", "outputAudio"]) {
    const candidate = value[key];
    if (candidate && typeof candidate.data === "string") return candidate.data;
  }
  if ((value.type === "audio" || value.mime_type === "audio/L16" || value.mimeType === "audio/L16") && typeof value.data === "string") return value.data;
  for (const child of Object.values(value)) {
    if (Array.isArray(child)) {
      for (const item of child) { const found = findAudioData(item); if (found) return found; }
    } else if (child && typeof child === "object") {
      const found = findAudioData(child); if (found) return found;
    }
  }
  return null;
}
function offsetToSec(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") { const parsed = Number.parseFloat(value.replace(/s$/i, "")); return Number.isFinite(parsed) ? parsed : null; }
  if (value && typeof value === "object") {
    const seconds = Number(value.seconds || 0); const nanos = Number(value.nanos || value.nanoseconds || 0);
    if (Number.isFinite(seconds) && Number.isFinite(nanos)) return seconds + nanos / 1e9;
  }
  return null;
}
function extractWordTimings(value) {
  const timings = [];
  const visit = node => {
    if (!node || typeof node !== "object") return;
    const type = String(node.type || node.annotationType || "");
    const start = offsetToSec(node.start_offset ?? node.startOffset);
    const end = offsetToSec(node.end_offset ?? node.endOffset);
    const word = node.word ?? node.text;
    if ((type === "word_info" || (start !== null && end !== null)) && typeof word === "string" && start !== null && end !== null) {
      timings.push({ word: word.trim(), startSec: Number(start.toFixed(6)), endSec: Number(end.toFixed(6)), speaker: typeof node.speaker === "string" ? node.speaker : undefined });
    }
    for (const child of Object.values(node)) Array.isArray(child) ? child.forEach(visit) : (child && typeof child === "object" ? visit(child) : undefined);
  };
  visit(value);
  return timings.filter(t => t.word && t.endSec >= t.startSec).sort((a,b) => a.startSec-b.startSec || a.endSec-b.endSec);
}
function normalizeWords(text) {
  return String(text).normalize("NFKC").toLowerCase().replace(/[’‘]/g, "'").replace(/[^\p{L}\p{N}']+/gu, " ").trim().split(/\s+/).filter(Boolean);
}
function editDistance(a, b) {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(cur[j-1] + 1, prev[j] + 1, prev[j-1] + (a[i-1] === b[j-1] ? 0 : 1));
    for (let j = 0; j <= b.length; j++) prev[j] = cur[j];
  }
  return prev[b.length];
}
function lcsLength(a, b) {
  const dp = Array(b.length + 1).fill(0);
  for (const token of a) {
    let diagonal = 0;
    for (let j = 1; j <= b.length; j++) {
      const prior = dp[j];
      dp[j] = token === b[j-1] ? diagonal + 1 : Math.max(dp[j], dp[j-1]);
      diagonal = prior;
    }
  }
  return dp[b.length];
}
function validateTranscript(expectedText, timings, durationSec) {
  let lastStart = -1, lastEnd = -1;
  for (const t of timings) {
    if (!t.word || t.startSec < 0 || t.endSec < t.startSec || t.startSec + 0.001 < lastStart || t.endSec + 0.001 < lastEnd || t.endSec > durationSec + 0.25) {
      throw new Error("Narration timestamps failed structural validation");
    }
    lastStart = t.startSec; lastEnd = t.endSec;
  }
  const expected = normalizeWords(expectedText);
  const actual = normalizeWords(timings.map(t => t.word).join(" "));
  if (!expected.length || !actual.length) throw new Error("Transcript verification has no comparable words");
  const wer = editDistance(expected, actual) / expected.length;
  const coverage = lcsLength(expected, actual) / expected.length;
  const validation = { expectedWords: expected.length, actualWords: actual.length, wer: Number(wer.toFixed(4)), coverage: Number(coverage.toFixed(4)), passed: wer <= 0.12 && coverage >= 0.94 };
  if (!validation.passed) throw new Error(`Narration transcript mismatch: WER ${validation.wer}, coverage ${validation.coverage}`);
  return validation;
}

async function getProduction(id) {
  const result = await pool.query(`SELECT * FROM reel_productions WHERE id=$1`, [id]);
  if (!result.rows[0]) throw new Error(`Production ${id} not found`);
  const row = result.rows[0];
  return { revision: Number(row.revision), manifest: row.manifest_json };
}
async function saveManifest(id, revision, manifest) {
  const result = await pool.query(
    `UPDATE reel_productions SET revision=revision+1, manifest_json=$3::jsonb, updated_at=NOW() WHERE id=$1 AND revision=$2 RETURNING revision`,
    [id, revision, JSON.stringify(manifest)]
  );
  if (!result.rows[0]) throw new Error(`Production ${id} changed concurrently while worker was attaching evidence`);
  return Number(result.rows[0].revision);
}
async function updateOperation(id, patch) {
  const fields = []; const values = [id]; let n = 2;
  const mapping = { status:"status", providerOperationName:"provider_operation_name", result:"result_json", lastError:"last_error", leaseExpiresAt:"lease_expires_at" };
  for (const [key, column] of Object.entries(mapping)) {
    if (!(key in patch)) continue;
    fields.push(`${column}=$${n++}${key === "result" ? "::jsonb" : ""}`);
    values.push(key === "result" ? JSON.stringify(patch[key]) : patch[key]);
  }
  fields.push("updated_at=NOW()");
  await pool.query(`UPDATE reel_operations SET ${fields.join(",")} WHERE id=$1`, values);
}
async function heartbeat(id) {
  await pool.query(`UPDATE reel_operations SET lease_expires_at=NOW()+INTERVAL '10 minutes', updated_at=NOW() WHERE id=$1 AND lease_owner=$2`, [id, workerId]);
}
async function claim() {
  const result = await pool.query(`
    WITH candidate AS (
      SELECT id FROM reel_operations
      WHERE status='QUEUED' OR (status='RUNNING' AND lease_expires_at < NOW())
      ORDER BY created_at ASC
      FOR UPDATE SKIP LOCKED LIMIT 1
    )
    UPDATE reel_operations o
    SET status='RUNNING', attempt=o.attempt+1, lease_owner=$1, lease_expires_at=NOW()+INTERVAL '10 minutes', updated_at=NOW()
    FROM candidate c WHERE o.id=c.id RETURNING o.*`, [workerId]);
  return result.rows[0] || null;
}

async function generateNarrationResult(op, manifest) {
  if (!apiKey()) throw new Error("Gemini API key is missing");
  if (!assetRoot()) throw new Error("Durable asset root is missing");
  const model = process.env.ZYVORIQ_TTS_MODEL || "gemini-3.1-flash-tts-preview";
  const voice = process.env.ZYVORIQ_TTS_VOICE || "Kore";
  const prompt = ["Synthesize speech for the transcript below. Do not speak these instructions.", `Performance direction: ${manifest.tone}. Natural social-video delivery, clear articulation, no added words.`, "TRANSCRIPT START", manifest.masterScript, "TRANSCRIPT END"].join("\n");
  const response = await fetch(`${API_BASE}/v1beta/interactions`, { method:"POST", headers:{"x-goog-api-key":apiKey(),"Content-Type":"application/json"}, body:JSON.stringify({ model, input:prompt, response_format:{type:"audio"}, generation_config:{speech_config:[{voice}]} }) });
  const json = await response.json();
  if (!response.ok) throw new Error(`Gemini TTS failed (${response.status}): ${JSON.stringify(json).slice(0,500)}`);
  const audioBase64 = findAudioData(json); if (!audioBase64) throw new Error("Gemini TTS returned no audio payload");
  const pcm = Buffer.from(audioBase64, "base64"); if (!pcm.length) throw new Error("Gemini TTS returned empty audio");
  const durationSec = pcm.length / (SAMPLE_RATE * CHANNELS * SAMPLE_WIDTH);
  const wav = wavFromPcm(pcm);

  const start = await fetch(`${API_BASE}/upload/v1beta/files`, { method:"POST", headers:{"x-goog-api-key":apiKey(),"X-Goog-Upload-Protocol":"resumable","X-Goog-Upload-Command":"start","X-Goog-Upload-Header-Content-Length":String(wav.length),"X-Goog-Upload-Header-Content-Type":"audio/wav","Content-Type":"application/json"}, body:JSON.stringify({file:{display_name:`zyvoriq-${op.production_id}-narration.wav`}}) });
  if (!start.ok) throw new Error(`Gemini upload init failed (${start.status})`);
  const uploadUrl = start.headers.get("x-goog-upload-url"); if (!uploadUrl) throw new Error("Gemini upload returned no URL");
  const upload = await fetch(uploadUrl, { method:"POST", headers:{"Content-Length":String(wav.length),"X-Goog-Upload-Offset":"0","X-Goog-Upload-Command":"upload, finalize","Content-Type":"audio/wav"}, body:new Uint8Array(wav) });
  const uploadJson = await upload.json(); if (!upload.ok) throw new Error(`Gemini upload failed (${upload.status})`);
  const uri = uploadJson?.file?.uri || uploadJson?.uri; if (!uri) throw new Error("Gemini upload returned no file URI");

  const transcribe = await fetch(`${API_BASE}/v1beta/interactions`, { method:"POST", headers:{"x-goog-api-key":apiKey(),"Content-Type":"application/json"}, body:JSON.stringify({ model:"gemini-3.5-transcribe", input:[{type:"audio",uri,mime_type:"audio/wav"}], generation_config:{transcription_config:{mode:{type:"verbatim",timestamp_granularities:["word"]}}} }) });
  const transcribeJson = await transcribe.json(); if (!transcribe.ok) throw new Error(`Gemini transcription failed (${transcribe.status})`);
  const timings = extractWordTimings(transcribeJson); if (!timings.length) throw new Error("No word-level timestamps returned");
  const validation = validateTranscript(manifest.masterScript, timings, durationSec);
  const digest = crypto.createHash("sha256").update(wav).digest("hex").slice(0,16);
  const asset = await writeAsset(`reels/${op.production_id}/narration-${digest}.wav`, wav);
  return { narrationUrl:asset.url, actualDurationSec:Number(durationSec.toFixed(6)), wordTimings:timings, provider:"google-gemini", model, voice, alignmentValidation:validation };
}

function replanToAudioClock(manifest, durationSec) {
  const count = manifest.shots.length;
  if (!count) throw new Error("Cannot replan production with no shots");
  const per = durationSec / count;
  let cursor = 0;
  for (let i=0;i<count;i++) {
    const shot = manifest.shots[i];
    const remaining = durationSec - cursor;
    const editorial = Number((i === count-1 ? remaining : per).toFixed(6));
    shot.editorialStartSec = Number(cursor.toFixed(6));
    shot.editorialDurationSec = editorial;
    shot.trimInSec = 0;
    shot.trimOutSec = editorial;
    shot.generationDurationSec = editorial <= 3.5 ? 4 : editorial <= 5.5 ? 6 : 8;
    shot.status = "PLANNED"; delete shot.asset;
    cursor += editorial;
  }
  manifest.plannedDurationSec = Number(durationSec.toFixed(6));
}
async function applyNarration(op, result) {
  const current = await getProduction(op.production_id); const manifest = current.manifest;
  if (!["SCRIPT_READY","AUDIO_GENERATING","FAILED"].includes(manifest.status)) throw new Error(`Narration operation no longer applies to state ${manifest.status}`);
  replanToAudioClock(manifest, result.actualDurationSec);
  manifest.audio = { ...manifest.audio, masterClock:"narration", narrationUrl:result.narrationUrl, actualDurationSec:result.actualDurationSec, timingSource:"actual-alignment", wordTimings:result.wordTimings, provider:result.provider, model:result.model, voice:result.voice, alignmentValidation:result.alignmentValidation };
  manifest.status = "SHOTS_PLANNED";
  await saveManifest(op.production_id, current.revision, manifest);
}

async function extractDependencyFrame(productionId, shot, manifest) {
  if (!shot.dependsOnShotIds?.length) return null;
  const dependency = manifest.shots.find(s => s.id === shot.dependsOnShotIds[shot.dependsOnShotIds.length-1]);
  if (!dependency?.asset?.videoUrl) throw new Error(`Continuity dependency ${shot.dependsOnShotIds.at(-1)} has no media`);
  const source = assetPath(dependency.asset.videoUrl).target;
  const tmp = path.join(os.tmpdir(), `zyvoriq-ref-${crypto.randomUUID()}.png`);
  try {
    await execFileAsync("ffmpeg", ["-y","-sseof","-0.08","-i",source,"-frames:v","1","-vf","scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920",tmp], {timeout:30000,maxBuffer:2*1024*1024});
    const buffer = await fs.readFile(tmp);
    const digest = crypto.createHash("sha256").update(buffer).digest("hex").slice(0,16);
    const saved = await writeAsset(`reels/${productionId}/references/${shot.id}-from-${dependency.id}-${digest}.png`, buffer);
    return { buffer, url:saved.url, dependencyId:dependency.id };
  } finally { try { await fs.unlink(tmp); } catch {} }
}
async function probeVideoBuffer(buffer) {
  const tmp = path.join(os.tmpdir(), `zyvoriq-probe-${crypto.randomUUID()}.mp4`);
  try {
    await fs.writeFile(tmp, buffer);
    const { stdout } = await execFileAsync("ffprobe", ["-v","error","-show_entries","format=duration:stream=codec_name,width,height,r_frame_rate","-of","json",tmp], {timeout:30000,maxBuffer:2*1024*1024});
    const parsed = JSON.parse(stdout); const stream = parsed.streams?.find(s => s.width && s.height) || parsed.streams?.[0] || {};
    return { durationSec:Number(Number(parsed.format?.duration || 0).toFixed(6)), codec:stream.codec_name, width:Number(stream.width||0), height:Number(stream.height||0), frameRate:stream.r_frame_rate };
  } finally { try { await fs.unlink(tmp); } catch {} }
}
function veoModel(tier) { return tier === "quality" ? "veo-3.1-generate-preview" : tier === "lite" ? "veo-3.1-lite-generate-preview" : "veo-3.1-fast-generate-preview"; }
async function generateShotResult(op, manifest, shot) {
  if (!apiKey()) throw new Error("Gemini API key is missing");
  const tier = op.payload_json?.modelTier || "fast"; const model = veoModel(tier);
  let reference = await extractDependencyFrame(op.production_id, shot, manifest);
  let operationName = op.provider_operation_name;
  if (!operationName) {
    const instance = { prompt:shot.generationPrompt };
    if (reference) instance.image = { inlineData:{ mimeType:"image/png", data:reference.buffer.toString("base64") } };
    const dispatch = await fetch(`${API_BASE}/v1beta/models/${model}:predictLongRunning`, {method:"POST",headers:{"x-goog-api-key":apiKey(),"Content-Type":"application/json"},body:JSON.stringify({instances:[instance],parameters:{aspectRatio:"9:16",durationSeconds:shot.generationDurationSec}})});
    const json = await dispatch.json(); if (!dispatch.ok || json.error) throw new Error(`Veo dispatch failed: ${json.error?.message || dispatch.status}`);
    operationName = json.name; if (!operationName) throw new Error("Veo returned no operation name");
    await updateOperation(op.id, { providerOperationName:operationName });
  }
  let uri = null;
  for (let i=0;i<60;i++) {
    await sleep(5000); if (i % 6 === 0) await heartbeat(op.id);
    const poll = await fetch(`${API_BASE}/v1beta/${operationName}`, {headers:{"x-goog-api-key":apiKey()}}); const json = await poll.json();
    if (!poll.ok || json.error) throw new Error(`Veo polling failed: ${json.error?.message || poll.status}`);
    if (json.done) { uri=json.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri; if (!uri) throw new Error("Veo completed without video URI"); break; }
  }
  if (!uri) throw new Error(`Veo operation ${operationName} timed out`);
  const sep = uri.includes("?") ? "&" : "?"; const download = await fetch(`${uri}${sep}key=${apiKey()}`); if (!download.ok) throw new Error(`Veo download failed (${download.status})`);
  const buffer = Buffer.from(await download.arrayBuffer()); if (!buffer.length) throw new Error("Veo returned empty MP4");
  const probe = await probeVideoBuffer(buffer); if (probe.durationSec + 0.05 < shot.trimOutSec) throw new Error(`${shot.id} source ${probe.durationSec}s is shorter than trim ${shot.trimOutSec}s`);
  const digest = crypto.createHash("sha256").update(buffer).digest("hex").slice(0,16); const asset=await writeAsset(`reels/${op.production_id}/shots/${shot.id}-${digest}.mp4`,buffer);
  return { videoUrl:asset.url, actualDurationSec:probe.durationSec, operationName, provider:"google-veo", model, probe, continuityReferenceUrl:reference?.url, continuityDependencyId:reference?.dependencyId };
}
async function applyShot(op, result) {
  const current=await getProduction(op.production_id); const manifest=current.manifest; const shot=manifest.shots.find(s=>s.id===op.target_id); if(!shot) throw new Error(`Shot ${op.target_id} not found`);
  for(const depId of shot.dependsOnShotIds||[]){const dep=manifest.shots.find(s=>s.id===depId);if(!dep?.asset?.videoUrl)throw new Error(`Dependency ${depId} is not generated`);}
  shot.asset={videoUrl:result.videoUrl,actualDurationSec:result.actualDurationSec,operationName:result.operationName,provider:result.provider,model:result.model};
  shot.status="GENERATED"; if(result.continuityReferenceUrl) shot.continuityIn.referenceFrameUrl=result.continuityReferenceUrl;
  manifest.status=manifest.shots.every(s=>s.asset?.videoUrl&&["GENERATED","PASSED"].includes(s.status))?"ROUGH_CUT_READY":"VIDEO_GENERATING";
  await saveManifest(op.production_id,current.revision,manifest);
}

async function renderRoughResult(op, manifest) {
  if (!assetRoot()) throw new Error("Durable asset root is missing");
  if (!manifest.audio?.narrationUrl || !manifest.audio?.actualDurationSec) throw new Error("Actual narration is required");
  const masterDuration=Number(manifest.audio.actualDurationSec); if(Math.abs(masterDuration-Number(manifest.plannedDurationSec))>0.002)throw new Error(`Audio master ${masterDuration}s differs from timeline ${manifest.plannedDurationSec}s`);
  const temp=path.join(os.tmpdir(),`zyvoriq-rough-${crypto.randomUUID()}.mp4`); const args=["-y"];
  for(const shot of manifest.shots){if(!shot.asset?.videoUrl)throw new Error(`${shot.id} has no source`);args.push("-i",assetPath(shot.asset.videoUrl).target);}
  args.push("-i",assetPath(manifest.audio.narrationUrl).target);
  const filters=[]; manifest.shots.forEach((shot,i)=>filters.push(`[${i}:v]trim=start=${shot.trimInSec}:end=${shot.trimOutSec},setpts=PTS-STARTPTS,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30[v${i}]`));
  filters.push(`${manifest.shots.map((_,i)=>`[v${i}]`).join("")}concat=n=${manifest.shots.length}:v=1:a=0[vout]`); const ai=manifest.shots.length;
  filters.push(`[${ai}:a]atrim=duration=${masterDuration},asetpts=PTS-STARTPTS,aresample=48000[aout]`);
  args.push("-filter_complex",filters.join(";"),"-map","[vout]","-map","[aout]","-t",String(masterDuration),"-c:v","libx264","-preset","medium","-crf","18","-pix_fmt","yuv420p","-c:a","aac","-b:a","192k","-movflags","+faststart",temp);
  try{await execFileAsync("ffmpeg",args,{timeout:300000,maxBuffer:4*1024*1024});const buffer=await fs.readFile(temp);const probe=await probeVideoBuffer(buffer);if(Math.abs(probe.durationSec-masterDuration)>0.08)throw new Error(`Rough cut ${probe.durationSec}s differs from audio master ${masterDuration}s`);const digest=crypto.createHash("sha256").update(buffer).digest("hex").slice(0,16);const asset=await writeAsset(`reels/${op.production_id}/renders/narrated-rough-${digest}.mp4`,buffer);return{videoUrl:asset.url,actualDurationSec:probe.durationSec,kind:"narrated-rough-cut",codec:probe.codec,width:probe.width,height:probe.height,frameRate:probe.frameRate,renderedAt:new Date().toISOString()};}finally{try{await fs.unlink(temp)}catch{}}
}
async function applyRough(op,result){const current=await getProduction(op.production_id);const manifest=current.manifest;if(manifest.status!=="ROUGH_CUT_READY")throw new Error(`Rough cut no longer applies to ${manifest.status}`);manifest.outputs={...(manifest.outputs||{}),narratedRoughCut:result};manifest.status="MIXING";await saveManifest(op.production_id,current.revision,manifest);}

async function processOperation(op) {
  const current=await getProduction(op.production_id); let result=op.result_json;
  if(op.kind==="NARRATION"){
    if(!result){result=await generateNarrationResult(op,current.manifest);await updateOperation(op.id,{result});}
    await applyNarration(op,result);
  }else if(op.kind==="SHOT"){
    const shot=current.manifest.shots.find(s=>s.id===op.target_id);if(!shot)throw new Error(`Shot ${op.target_id} not found`);
    if(!result){result=await generateShotResult(op,current.manifest,shot);await updateOperation(op.id,{result});}
    await applyShot(op,result);
  }else if(op.kind==="ROUGH_CUT"){
    if(!result){result=await renderRoughResult(op,current.manifest);await updateOperation(op.id,{result});}
    await applyRough(op,result);
  }else throw new Error(`Unsupported operation kind ${op.kind}`);
  await updateOperation(op.id,{status:"SUCCEEDED",lastError:null,leaseExpiresAt:null});
}

console.log(`[reel-worker] started ${workerId}`);
for(;;){
  try{
    const op=await claim();
    if(!op){await sleep(pollMs);continue;}
    try{await processOperation(op);}catch(error){const message=String(error?.message||error).slice(0,2000);const retry=Number(op.attempt||0)<3;await pool.query(`UPDATE reel_operations SET status=$2,last_error=$3,lease_owner=NULL,lease_expires_at=NULL,updated_at=NOW() WHERE id=$1`,[op.id,retry?"QUEUED":"FAILED",message]);console.error(`[reel-worker] ${op.id} ${retry?"retry":"failed"}: ${message}`);}
  }catch(error){console.error(`[reel-worker] loop error: ${error?.message||error}`);await sleep(Math.max(pollMs,3000));}
}
