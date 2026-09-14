#!/usr/bin/env node
/**
 * COASTAL SYNTH-POP 30s VERTICAL DANCE REEL
 * =========================================
 * Governed by omni_guard v5.1.4.
 *
 * DESIGN NOTES (why it is built this way):
 *  - 118 BPM => bar = 2033.9ms. Round 6.0s cuts drift 102-407ms off the
 *    downbeat and would fail max_cut_to_downbeat_offset_ms=60. Shots 1-4 are
 *    therefore exactly 3 bars (6.1017s) and shot 5 is 5.5932s, totalling
 *    30.0000s with every internal cut on a bar line (0ms offset).
 *  - NON-VOCAL dance performance throughout, mouth closed. Veo cannot hear the
 *    Lyria master, so any lip articulation would be phantom mouthing. Keeping
 *    the performance non-vocal removes the desync class entirely and keeps
 *    Rule 6 (no native-audio stripping on singing shots) inapplicable.
 *  - SEQUENTIAL TAIL-FRAME CHAINING: shot N+1 is conditioned on shot N's tail
 *    frame, never on the original anchor. Re-using the anchor would lock Frame 0
 *    of every shot to the same pose and create a visible reset loop at each cut.
 *  - Every model call emits a provenance receipt. modelsInvoked is DERIVED from
 *    receipts, never hand-authored.
 *  - ffmpeg/ffprobe do not exist on the Mac; all media ops run on Cloudtop.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!API_KEY) { console.error("FATAL: GEMINI_API_KEY / GOOGLE_API_KEY not set"); process.exit(1); }

const ROOT       = "/Users/nitinagga/Documents/zyvoriq";
const WORK       = path.join(ROOT, "scratch", "coastal_synthpop_30s");
const REMOTE_HOST= "nitinagga.c.googlers.com";
const REMOTE_DIR = "~/zyvoriq/scratch/coastal_synthpop_30s";
const PROD_ID    = "studio1_" + crypto.randomUUID();

const BPM = 118, BAR = (60 / BPM) * 4;
const SHOTS_N = 5;

// ---------------------------------------------------------------- provenance
const LEDGER = path.join(WORK, "provenance", PROD_ID + ".receipts.jsonl");
fs.mkdirSync(path.dirname(LEDGER), { recursive: true });
function receipt(stage, model, endpoint, status, reqBody, respBytes, startedAt, ms, extra = {}) {
  const r = {
    stage, model, endpoint, http_status: status,
    request_sha256: crypto.createHash("sha256").update(typeof reqBody === "string" ? reqBody : JSON.stringify(reqBody || "")).digest("hex"),
    response_bytes: respBytes, started_at: startedAt, duration_ms: ms, ...extra
  };
  fs.appendFileSync(LEDGER, JSON.stringify(r) + "\n");
  return r;
}
const sh = (cmd) => execFileSync("bash", ["-lc", cmd], { encoding: "utf-8", maxBuffer: 64 * 1024 * 1024 }).trim();
const remote = (cmd) => sh(`ssh -o ConnectTimeout=20 ${REMOTE_HOST} '${cmd.replace(/'/g, "'\\''")}'`);
const log = (...a) => console.log(...a);

// ---------------------------------------------------------------- Stage 1a: Lyria
async function generateLyriaMaster(outPath) {
  const prompt =
    "Instrumental-forward upbeat summer synth-pop dance track at exactly 118 BPM. " +
    "Bright analog synth arpeggios, punchy sidechained four-on-the-floor kick, warm sub-bass, " +
    "shimmering plucks, tropical marimba accents, crisp claps and a euphoric festival chorus lift. " +
    "Sunny coastal Mediterranean energy, golden hour, confident and danceable. " +
    "Clear structure: 4-bar intro build, 8-bar verse groove, 8-bar chorus drop with full-spectrum bass. " +
    "Full frequency spectrum with deep sub-bass below 60Hz retained. Duration 30 seconds.";
  const models = ["models/lyria-3.5", "models/lyria-3-pro-preview", "models/lyria-3-clip-preview"];
  for (const model of models) {
    const t0 = Date.now(), startedAt = new Date().toISOString();
    const body = { contents: [{ parts: [{ text: prompt }] }] };
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${API_KEY}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body), signal: AbortSignal.timeout(300000)
      });
      const txt = await res.text();
      receipt("stage1_lyria_master", model, `${model}:generateContent`, res.status, body, txt.length, startedAt, Date.now() - t0);
      if (!res.ok) { log(`  ${model} -> HTTP ${res.status}`); continue; }
      const data = JSON.parse(txt);
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const audio = parts.find(p => p.inlineData?.data);
      if (!audio) { log(`  ${model} -> no inlineData audio`); continue; }
      const buf = Buffer.from(audio.inlineData.data, "base64");
      fs.writeFileSync(outPath, buf);
      log(`  ✅ Lyria master: ${model} -> ${buf.length} bytes`);
      return { model, bytes: buf.length };
    } catch (e) {
      receipt("stage1_lyria_master", model, `${model}:generateContent`, 0, body, 0, startedAt, Date.now() - t0, { error: String(e.message) });
      log(`  ${model} -> ${e.message}`);
    }
  }
  throw new Error("All Lyria models failed. Refusing to substitute a synthetic oscillator (Rule 12).");
}

// ---------------------------------------------------------------- Stage 1b: anchor
/**
 * Reads width/height straight out of the PNG IHDR chunk. Avoids taking an image
 * dependency for what is a 8-byte read, and lets us fail before spending on Veo.
 */
function pngDimensions(buf) {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

/**
 * The prompt is a REQUIRED parameter, derived from the directorial plan
 * (plan.anchor_prompt). It used to be hardcoded here, which is how shot 1 ended
 * up in a coral-orange dress while the plan - and therefore shots 2-5 - called
 * for a pastel yellow two-piece.
 *
 * generationConfig.imageConfig.aspectRatio is what actually produces a portrait
 * plate (768x1344). Note the nesting: a bare generationConfig.aspectRatio is
 * rejected with HTTP 400 "Unknown name aspectRatio". Without it the model
 * returns 1024x1024 and Veo faithfully preserves that square framing inside the
 * 9:16 canvas, giving black bars over ~43% of the frame.
 */
async function generateAnchor(outPath, prompt) {
  if (!prompt || prompt.length < 200) {
    throw new Error("generateAnchor requires the derived plan.anchor_prompt - refusing to invent wardrobe or casting locally.");
  }
  const model = "models/gemini-2.5-flash-image";
  const t0 = Date.now(), startedAt = new Date().toISOString();
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { imageConfig: { aspectRatio: "9:16" } }
  };
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${API_KEY}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body), signal: AbortSignal.timeout(180000)
  });
  const txt = await res.text();
  receipt("stage1_biometric_anchor", model, `${model}:generateContent`, res.status, body, txt.length, startedAt, Date.now() - t0);
  if (!res.ok) throw new Error(`Anchor generation failed HTTP ${res.status}: ${txt.slice(0, 300)}`);
  const parts = JSON.parse(txt)?.candidates?.[0]?.content?.parts || [];
  const img = parts.find(p => p.inlineData?.data);
  if (!img) throw new Error("Anchor generation returned no image data");
  const buf = Buffer.from(img.inlineData.data, "base64");

  // Fail closed on aspect ratio. Veo inherits the plate's framing, so a square
  // anchor is a letterboxed master - and no downstream ffmpeg filter can undo
  // padding that is already baked into the pixels.
  const dim = pngDimensions(buf);
  if (!dim) throw new Error("Anchor is not a readable PNG - cannot verify aspect ratio.");
  const ratio = dim.width / dim.height;
  const target = 9 / 16;
  if (Math.abs(ratio - target) > 0.02) {
    fs.writeFileSync(outPath + ".rejected", buf);
    throw new Error(
      `Anchor aspect ratio ${dim.width}x${dim.height} (${ratio.toFixed(4)}) is not 9:16 (${target.toFixed(4)}). ` +
      `Rejected plate saved to ${path.basename(outPath)}.rejected. Halting before Veo spend.`
    );
  }
  fs.writeFileSync(outPath, buf);
  log(`  ✅ Anchor plate: ${dim.width}x${dim.height} (true 9:16), ${buf.length} bytes -> ${path.basename(outPath)}`);
  return { model, bytes: buf.length, width: dim.width, height: dim.height };
}

// ---------------------------------------------------------------- Stage 3: Veo
async function dispatchVeo(shotIdx, prompt, conditionImagePath, requestSec, outPath) {
  const models = ["veo-3.1-generate-preview", "veo-3.1-fast-generate-preview"];
  const imgB64 = fs.readFileSync(conditionImagePath).toString("base64");
  const mime = conditionImagePath.endsWith(".png") ? "image/png" : "image/jpeg";

  for (const m of models) {
    const t0 = Date.now(), startedAt = new Date().toISOString();
    const body = {
      instances: [{ prompt, image: { bytesBase64Encoded: imgB64, mimeType: mime } }],
      parameters: { aspectRatio: "9:16", durationSeconds: requestSec, personGeneration: "allow_adult" }
    };
    try {
      const dr = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:predictLongRunning?key=${API_KEY}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body), signal: AbortSignal.timeout(120000)
      });
      const dtxt = await dr.text();
      if (!dr.ok) {
        receipt(`stage3_veo_shot_${shotIdx}`, m, `${m}:predictLongRunning`, dr.status, body, dtxt.length, startedAt, Date.now() - t0, { phase: "dispatch", error: dtxt.slice(0, 200) });
        log(`    ${m} dispatch HTTP ${dr.status}`); continue;
      }
      const opName = JSON.parse(dtxt).name;
      log(`    dispatched -> ${opName}`);

      // Persist the operation name BEFORE polling (idempotency per v5.1.4).
      fs.writeFileSync(path.join(WORK, "shots", `shot_0${shotIdx}.operation`), opName);

      for (let i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 10000));
        const pr = await fetch(`https://generativelanguage.googleapis.com/v1beta/${opName}?key=${API_KEY}`, { signal: AbortSignal.timeout(60000) });
        const pj = await pr.json();
        if (!pj.done) continue;
        if (pj.error) {
          receipt(`stage3_veo_shot_${shotIdx}`, m, `${m}:predictLongRunning`, 200, body, 0, startedAt, Date.now() - t0, { phase: "failed", error: JSON.stringify(pj.error).slice(0, 300) });
          log(`    ${m} operation error: ${JSON.stringify(pj.error).slice(0, 200)}`); break;
        }
        const uri = pj.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
        if (!uri) {
          receipt(`stage3_veo_shot_${shotIdx}`, m, `${m}:predictLongRunning`, 200, body, 0, startedAt, Date.now() - t0, { phase: "no_uri" });
          log("    no video uri in response"); break;
        }
        const vr = await fetch(`${uri}&key=${API_KEY}`, { signal: AbortSignal.timeout(300000) });
        const vbuf = Buffer.from(await vr.arrayBuffer());
        fs.writeFileSync(outPath, vbuf);
        receipt(`stage3_veo_shot_${shotIdx}`, m, `${m}:predictLongRunning`, 200, body, vbuf.length, startedAt, Date.now() - t0, { phase: "complete", operation: opName, requested_sec: requestSec });
        log(`    ✅ shot ${shotIdx}: ${vbuf.length} bytes in ${Math.round((Date.now() - t0) / 1000)}s`);
        return { model: m, bytes: vbuf.length, operation: opName };
      }
    } catch (e) {
      receipt(`stage3_veo_shot_${shotIdx}`, m, `${m}:predictLongRunning`, 0, body, 0, startedAt, Date.now() - t0, { error: String(e.message) });
      log(`    ${m} -> ${e.message}`);
    }
  }
  throw new Error(`Shot ${shotIdx} failed on all Veo models`);
}

export { generateLyriaMaster, generateAnchor, dispatchVeo, receipt, PROD_ID, WORK, BAR, BPM, SHOTS_N, REMOTE_HOST, REMOTE_DIR, sh, remote, log, LEDGER };
