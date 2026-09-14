#!/usr/bin/env node
/**
 * STAGE 0b - OMNI 1.1 CANONICAL CASTING LOCK (BLOCKING)
 * ====================================================
 * WHY THIS EXISTS
 * ---------------
 * The first cut of this reel shipped three visual defects that automated
 * forensics scored as PASS:
 *   1. letterboxing  - the anchor plate came back 1024x1024, so Veo preserved
 *                      square framing and baked black bars into a 9:16 canvas.
 *   2. wardrobe swap - generateAnchor() hardcoded "coral-orange summer dress"
 *                      while the directorial plan specified a pastel yellow
 *                      two-piece. Shot 1 (image-conditioned) wore one, shots
 *                      2-5 (text-driven) wore the other.
 *   3. identity drift- no biometric descriptor existed anywhere. The anchor
 *                      invented a face; the shot prompts said only
 *                      "Character A", so Veo invented a different one.
 *
 * Root cause of (2) and (3) is the same: Veo follows the TEXT prompt over the
 * conditioning IMAGE when they disagree. The only durable fix is to make the
 * text say exactly what the image shows. This stage asks the director for ONE
 * canonical casting descriptor, then that single string is injected verbatim
 * into the anchor prompt AND all five shot prompts. Nothing downstream is
 * allowed to author its own description of the performer.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!API_KEY) { console.error("FATAL: GEMINI_API_KEY / GOOGLE_API_KEY not set"); process.exit(1); }

const WORK = "/Users/nitinagga/Documents/zyvoriq/scratch/coastal_synthpop_30s";
const OMNI_MODEL = "models/gemini-omni-1.1-flash";
const PLAN_PATH = path.join(WORK, "omni_directorial_plan.json");
const LEDGER = path.join(WORK, "provenance", "stage0.receipts.jsonl");

const plan = JSON.parse(fs.readFileSync(PLAN_PATH, "utf-8"));

async function callOmni(prompt, label) {
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
      fs.appendFileSync(LEDGER, JSON.stringify({
        stage: "stage0b_omni_casting_lock", label, attempt, model: OMNI_MODEL,
        endpoint: "v1beta/interactions", http_status: res.status,
        request_sha256: crypto.createHash("sha256").update(JSON.stringify(body)).digest("hex"),
        response_bytes: txt.length, started_at: startedAt, duration_ms: Date.now() - t0
      }) + "\n");
      if (res.status === 429 || res.status >= 500) throw new Error(`transient HTTP ${res.status}`);
      if (!res.ok) throw Object.assign(new Error(`Omni 1.1 HTTP ${res.status}: ${txt.slice(0, 300)}`), { fatal: true });
      const out = JSON.parse(txt).steps?.find(s => s.type === "model_output")?.content?.[0]?.text;
      if (!out) throw new Error("Omni 1.1 returned no model_output");
      console.log(`  OK ${label}: ${out.length} chars in ${Math.round((Date.now() - t0) / 1000)}s [attempt ${attempt}, http=${res.status}]`);
      return out;
    } catch (e) {
      lastErr = e;
      fs.appendFileSync(LEDGER, JSON.stringify({
        stage: "stage0b_omni_casting_lock", label, attempt, model: OMNI_MODEL,
        endpoint: "v1beta/interactions", http_status: 0, response_bytes: 0,
        started_at: startedAt, duration_ms: Date.now() - t0, error: String(e.message)
      }) + "\n");
      if (e.fatal || attempt === MAX) break;
      const wait = 2000 * Math.pow(2, attempt - 1);
      console.log(`  WARN attempt ${attempt}/${MAX} failed (${e.message}) - retry in ${wait / 1000}s`);
      await new Promise(r => setTimeout(r, wait));
    }
  }
  throw lastErr;
}

const BRIEF = `You are Google Omni 1.1, sole director of this music video. You have already delivered the shot plan. One element is missing and it caused a continuity failure in the first cut: there is no canonical description of the performer, so the still-image model and the video model each invented a different woman.

Write the CASTING LOCK: one single paragraph describing the physical appearance of the solo female dancer, precise enough that two different generative models reading it independently would produce a recognisably identical person.

MUST specify, concretely and unambiguously:
- approximate age
- face shape and jawline
- eye colour and eye shape
- eyebrow shape
- nose shape
- lip shape
- hair colour, texture, length AND how it is styled (the plan's choreography references a braid tossing in arcs, so the hairstyle must be compatible with that)
- skin tone plus specific distinguishing marks (freckle placement, a beauty mark, etc.)
- height and athletic build
- one or two memorable, unmistakable identifying features

MUST NOT:
- name or resemble any real, living or public person
- mention clothing, wardrobe, jewellery or footwear (wardrobe is locked separately)
- mention camera, lens, lighting, location or film stock
- use markdown, bullet points, headings or commentary

Return ONLY the paragraph itself as plain prose, nothing else. Target 90-150 words.`;

const REUSE = process.argv.includes("--reuse-casting");

console.log("STAGE 0b - Omni 1.1 canonical casting lock" + (REUSE ? " (reusing agreed descriptor)" : ""));

// --reuse-casting lets us revise the lock TEMPLATE without re-rolling the
// performer. Re-calling Omni would return a different woman and invalidate
// every shot already rendered.
let casting = REUSE && plan.casting_descriptor
  ? plan.casting_descriptor.trim()
  : (await callOmni(BRIEF, "casting_lock")).trim();

// Omni returns prose, but it occasionally wraps it in a fence or a lead-in line.
casting = casting.replace(/^```[a-z]*\s*/i, "").replace(/```\s*$/, "").trim();
casting = casting.split("\n").map(l => l.trim()).filter(Boolean).join(" ").trim();

// Fail closed: a descriptor too short to be discriminative is worse than none,
// because it would give a false sense that identity is locked.
if (casting.length < 300) {
  console.error(`HALT: casting descriptor only ${casting.length} chars - not discriminative enough.`);
  console.error(casting);
  process.exit(1);
}
const BANNED = ["dress", "top", "skirt", "sandal", "jewel", "necklace", "wearing", "outfit"];
const leaked = BANNED.filter(w => casting.toLowerCase().includes(w));
if (leaked.length) console.log(`  NOTE: descriptor mentions ${leaked.join(", ")} - wardrobe lock still takes precedence downstream.`);

const wardrobe = plan.wardrobe;

// The identity block is built ONCE and reused byte-identically everywhere.
// Any per-call paraphrasing reintroduces the drift this stage exists to remove.
// ACCESSORY drift is its own failure mode. Garment colour and silhouette
// survived the tail-frame chain fine, but the necklace silently thickened from
// a fine chain into a chunky one between shots 3 and 4 - small enough that the
// image-conditioning carried it, specific enough that a viewer notices. Small
// accessories therefore get their own explicit, repeated clause.
const IDENTITY_LOCK =
  `IDENTITY LOCK - Character A is one specific woman and her appearance is fixed: ${casting} ` +
  `This exact same woman appears in every single shot; her face, hair and build never change. ` +
  `WARDROBE LOCK - she wears, without deviation: ${wardrobe} ` +
  `ACCESSORY LOCK - the ONLY jewellery is one single VERY FINE, THIN, DELICATE gold chain necklace, ` +
  `barely thicker than a thread, sitting high and close at the base of her throat. It is NOT a chunky ` +
  `chain, NOT a thick rope chain, NOT a curb or figaro link, NOT layered, NOT a choker or collar. ` +
  `No earrings, no bracelets, no rings, no anklets, no sunglasses, no hair ornaments. ` +
  `This identical thin chain appears unchanged in every shot. `;

plan.casting_descriptor = casting;
plan.identity_lock_block = IDENTITY_LOCK;
plan.casting_source = { model: OMNI_MODEL, stage: "stage0b_omni_casting_lock", generated_at: new Date().toISOString() };

// Prepend the lock to every shot prompt. Veo weights early tokens heavily, so
// the identity and wardrobe must lead - the compliance rider stays at the tail.
for (const s of plan.shots) {
  if (!s.veo_prompt_pre_casting) s.veo_prompt_pre_casting = s.veo_prompt;
  s.veo_prompt = IDENTITY_LOCK + s.veo_prompt_pre_casting;
}

// The anchor prompt is now DERIVED, never hardcoded. This is the specific bug
// that produced a coral-orange dress in shot 1 and a yellow two-piece in 2-5.
plan.anchor_prompt =
  IDENTITY_LOCK +
  "Ultra-photorealistic full-body VERTICAL 9:16 portrait photograph of this woman, standing on a sunlit " +
  "Mediterranean coastal terrace overlooking the sea at golden hour. Confident relaxed dance posture, " +
  "weight on one hip, arms mid-motion. Mouth CLOSED with a soft natural expression - she is not singing. " +
  "VISIBLE NATURAL SKIN TEXTURE: real pores, fine peach fuzz, freckles, natural micro-imperfections; " +
  "NO airbrushing, NO AI skin smoothing, NO waxy plastic CGI sheen, NO beauty filter. " +
  "Camera perfectly upright, ZERO tilt and ZERO roll, horizon exactly level. " +
  "TALL VERTICAL 9:16 PORTRAIT FRAME - the full body from the top of her head to her sandals is inside " +
  "the frame with headroom above and floor below; nothing cropped; no black bars; no square framing. " +
  "Shot on 35mm film, Kodak Portra 400 grain, shallow depth of field f/2.0, subtle chromatic aberration, " +
  "Rec.709 colour. Editorial fashion photography.";

fs.writeFileSync(PLAN_PATH, JSON.stringify(plan, null, 2));

console.log("\n--- CASTING DESCRIPTOR ---\n" + casting);
console.log(`\nInjected into: anchor_prompt + ${plan.shots.length} shot prompts.`);
console.log(`Plan written: ${PLAN_PATH}`);
