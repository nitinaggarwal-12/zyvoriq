#!/usr/bin/env node
/**
 * STAGE 0 - GOOGLE OMNI 1.1 DIRECTORIAL PRE-FLIGHT (BLOCKING)
 * ==========================================================
 * Per omni_guard v5.1.5 director_policy: Omni 1.1 is the sole director and
 * must complete >=95% of creative work BEFORE any generative API spend.
 *
 * FAIL-CLOSED BY DESIGN. The previous callOmni() caught errors and returned
 * null while callers carried on, so a reel could be produced with zero
 * directorial input yet still list Omni 1.1 in its ledger. Here, if Omni does
 * not answer, the process exits non-zero and nothing downstream runs.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const WORK = "/Users/nitinagga/Documents/zyvoriq/scratch/coastal_synthpop_30s";
const OMNI_MODEL = "models/gemini-omni-1.1-flash";
const BPM = 118, BAR = (60 / BPM) * 4;
const DURS = [BAR * 3, BAR * 3, BAR * 3, BAR * 3, 30 - BAR * 12];

fs.mkdirSync(path.join(WORK, "provenance"), { recursive: true });
const LEDGER = path.join(WORK, "provenance", "stage0.receipts.jsonl");

async function callOmni(prompt, label) {
  // resilience_policy: max_retries 3, exponential backoff. A transient network
  // drop (laptop sleep, VPN flap) must not burn the whole production - but a
  // genuine refusal still halts, per director_policy.on_director_failure.
  const MAX = 3;
  let lastErr;
  for (let attempt = 1; attempt <= MAX; attempt++) {
    const t0 = Date.now(), startedAt = new Date().toISOString();
    const body = { model: OMNI_MODEL, input: prompt };
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/interactions?key=${API_KEY}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body), signal: AbortSignal.timeout(180000)
      });
      const txt = await res.text();
      const rec = {
        stage: "stage0_omni_director", label, attempt, model: OMNI_MODEL,
        endpoint: "v1beta/interactions", http_status: res.status,
        request_sha256: crypto.createHash("sha256").update(JSON.stringify(body)).digest("hex"),
        response_bytes: txt.length, started_at: startedAt, duration_ms: Date.now() - t0
      };
      fs.appendFileSync(LEDGER, JSON.stringify(rec) + "\n");

      if (res.status === 429 || res.status >= 500) throw new Error(`transient HTTP ${res.status}`);
      if (!res.ok) throw Object.assign(new Error(`Omni 1.1 HTTP ${res.status}: ${txt.slice(0, 300)}`), { fatal: true });

      const out = JSON.parse(txt).steps?.find(s => s.type === "model_output")?.content?.[0]?.text;
      if (!out) throw new Error("Omni 1.1 returned no model_output");
      console.log(`  ✅ ${label}: ${out.length} chars in ${Math.round((Date.now() - t0) / 1000)}s  [attempt ${attempt}, receipt http=${res.status}]`);
      return out;
    } catch (e) {
      lastErr = e;
      fs.appendFileSync(LEDGER, JSON.stringify({
        stage: "stage0_omni_director", label, attempt, model: OMNI_MODEL,
        endpoint: "v1beta/interactions", http_status: 0, response_bytes: 0,
        started_at: startedAt, duration_ms: Date.now() - t0, error: String(e.message)
      }) + "\n");
      if (e.fatal || attempt === MAX) break;
      const wait = 2000 * Math.pow(2, attempt - 1);
      console.log(`  ⚠ attempt ${attempt}/${MAX} failed (${e.message}) - retrying in ${wait / 1000}s`);
      await new Promise(r => setTimeout(r, wait));
    }
  }
  throw lastErr;
}

const BRIEF = `You are Google Omni 1.1, sole director and chief orchestrator of a music video production.

PRODUCE: a 30.000 second VERTICAL 9:16 music video reel.
GENRE: upbeat summer synth-pop, exactly 118 BPM.
SETTING: sunlit Mediterranean coastal terrace, golden hour.
PERFORMANCE: solo female dancer, pure DANCE choreography.

HARD CONSTRAINTS YOU MUST RESPECT:
1. NON-VOCAL PERFORMANCE. The dancer's mouth stays CLOSED in every shot. She never sings or mouths words. The video renderer cannot hear the soundtrack, so any lip articulation would be phantom mouthing. Choreography, body motion, eye contact and expression carry the performance.
2. Shot durations are fixed by the 118 BPM bar grid (bar = 2.0339s) and MUST NOT change:
   Shot 1: 6.1017s | Shot 2: 6.1017s | Shot 3: 6.1017s | Shot 4: 6.1017s | Shot 5: 5.5932s  (total exactly 30.000s)
3. ANTI-PLASTIC-SKIN: every shot prompt must demand visible natural skin texture (pores, fine peach fuzz, freckles, micro-imperfections) and explicitly forbid airbrushing, smoothing and waxy CGI sheen.
4. ZERO camera tilt or roll. Horizon perfectly level and upright in every shot. A previous production shipped a shot rotated 90 degrees.
5. 9:16 vertical framing. Head and feet must never be cropped.
6. Continuous identity: the same dancer, same wardrobe, same location throughout. Each shot continues motion from the previous one (tail-frame chained), so shot N+1 must begin in the pose shot N ended in. Do NOT reset to an opening pose.
7. 35mm film look, Kodak Portra 400 grain, subtle chromatic aberration, Rec.709.

RETURN STRICT JSON ONLY. No markdown fence, no commentary. Schema:
{
  "concept": "one paragraph creative concept",
  "acoustic_brief": "instrumentation, arrangement and structure brief for the composer",
  "colour_script": "colour progression across the 30s",
  "wardrobe": "precise wardrobe description, consistent across all shots",
  "choreography_arc": "how the dance develops across the 5 shots",
  "shots": [
    {
      "index": 1,
      "duration_sec": 6.1017,
      "bars": 3,
      "camera": "shot size and camera move",
      "choreography": "what the dancer does",
      "start_pose": "pose at first frame",
      "end_pose": "pose at last frame, which shot 2 must continue from",
      "veo_prompt": "complete self-contained prompt for the video model, including skin texture demands, mouth-closed lock, level horizon and 9:16 framing"
    }
  ]
}
Return exactly 5 shots with the durations given above.`;

console.log("👑 STAGE 0 - GOOGLE OMNI 1.1 DIRECTORIAL PRE-FLIGHT (blocking)\n");
let planText;
try {
  planText = await callOmni(BRIEF, "directorial_plan");
} catch (e) {
  console.error("\n❌ PRODUCTION HALTED - Omni 1.1 director unavailable: " + e.message);
  console.error("   Per director_policy.on_director_failure = HALT_PRODUCTION, no generative");
  console.error("   API spend is permitted without a Stage 0 receipt.");
  process.exit(1);
}

// Always persist the raw response. Discarding it on a parse failure destroys
// the only evidence of what the director actually said.
fs.writeFileSync(path.join(WORK, "omni_raw_response.txt"), planText);

function tryParse(t) {
  const cleaned = String(t).replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  try { return JSON.parse(cleaned); } catch {}
  const m = cleaned.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return null;
}

let plan = tryParse(planText);

// Self-healing: the director returned prose. Rather than halting, ask Omni to
// transcode its own plan into the required schema. This is a reformat of work
// already done, not a re-direction, so the creative intent is preserved.
if (!plan) {
  console.log("  ⚠ director returned prose, not JSON - requesting schema reformat");
  const reformat =
    "Convert the following music-video production plan into STRICT VALID JSON.\n" +
    "Output ONLY the JSON object. No markdown fence. No commentary before or after.\n" +
    "Start your output with { and end it with }.\n\n" +
    "Required schema:\n" +
    '{"concept":"string","acoustic_brief":"string","colour_script":"string","wardrobe":"string",' +
    '"choreography_arc":"string","shots":[{"index":1,"duration_sec":6.1017,"bars":3,"camera":"string",' +
    '"choreography":"string","start_pose":"string","end_pose":"string","veo_prompt":"string"}]}\n\n' +
    "There must be exactly 5 shots. Preserve all creative detail from the plan below.\n\n" +
    "PLAN TO CONVERT:\n" + planText;
  try {
    const fixed = await callOmni(reformat, "schema_reformat");
    fs.writeFileSync(path.join(WORK, "omni_raw_reformat.txt"), fixed);
    plan = tryParse(fixed);
  } catch (e) {
    console.error("  reformat call failed: " + e.message);
  }
}

if (!plan) {
  console.error("\n❌ PRODUCTION HALTED - director plan could not be parsed after reformat.");
  console.error("   Raw response saved to: " + path.join(WORK, "omni_raw_response.txt"));
  process.exit(1);
}

// Enforce the bar grid regardless of what the director returned.
if (!Array.isArray(plan.shots) || plan.shots.length !== 5) {
  console.error(`❌ Omni returned ${plan.shots?.length} shots, expected 5`); process.exit(1);
}
plan.shots.forEach((s, i) => { s.index = i + 1; s.duration_sec = Number(DURS[i].toFixed(4)); });
plan.total_duration_sec = 30.0;
plan.bpm = BPM;
plan.bar_sec = Number(BAR.toFixed(4));
plan.directed_by = { model: OMNI_MODEL, endpoint: "v1beta/interactions", receipt: LEDGER };

fs.writeFileSync(path.join(WORK, "omni_directorial_plan.json"), JSON.stringify(plan, null, 2));

console.log("\n" + "=".repeat(72));
console.log("CONCEPT     : " + String(plan.concept || "").slice(0, 300));
console.log("WARDROBE    : " + String(plan.wardrobe || "").slice(0, 200));
console.log("COLOUR      : " + String(plan.colour_script || "").slice(0, 200));
console.log("CHOREO ARC  : " + String(plan.choreography_arc || "").slice(0, 250));
console.log("ACOUSTIC    : " + String(plan.acoustic_brief || "").slice(0, 250));
console.log("=".repeat(72));
plan.shots.forEach(s => {
  console.log(`\nSHOT ${s.index}  ${s.duration_sec}s (${s.bars || 3} bars)`);
  console.log("  camera : " + String(s.camera || "").slice(0, 140));
  console.log("  choreo : " + String(s.choreography || "").slice(0, 140));
  console.log("  end    : " + String(s.end_pose || "").slice(0, 120));
});
console.log("\n✅ Stage 0 complete. Plan -> scratch/coastal_synthpop_30s/omni_directorial_plan.json");
console.log("   Receipts -> " + LEDGER);
