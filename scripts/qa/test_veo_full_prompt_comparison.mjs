import fs from "fs";

let key = process.env.GEMINI_API_KEY;
for (const envFile of [".env.local", ".env", ".env.production"]) {
  if (!key && fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, "utf8");
    const match = content.match(/GEMINI_API_KEY=([^\r\n]+)/);
    if (match) key = match[1].trim().replace(/^["']|["']$/g, "");
  }
}

const fullPromptOriginal = `ESTABLISHING_WIDE: Meera raises her carved drumsticks overhead, striking the decorated dholak with explosive power as brass horn players assemble behind her.. Eyeline: screen_right. Camera: Slow 360-degree rotational push-in rising from wet asphalt level. Narrative beat: When the city sleeps, our rhythm claims the pavement. Tone: Confident & conversational. Arri Alexa Mini LF, Master Anamorphic 35mm & 50mm lenses, 2.39:1 aspect ratio, kinetic Steadicam and low-angle rotational tracking; Midnight cyan shadows, sodium-vapor golden street amber, harsh neon magenta signage spill, gleaming wet asphalt reflections; Humid monsoon mist, chalk dust kicked from asphalt, swirling exhaust haze, high-voltage kinetic nocturnal ambiance. Zero generated text in scene pixels. 9:16 social framing; deliberate mix of tight presenter shots, medium action shots and relevant b-roll; preserve eyeline and screen direction across contiguous action. Do not render captions, subtitles, logos or UI text inside the generated video; those are composited later. STUDIO1 ENVIRONMENT LOCK: Treat the established location as one continuous physical set across clips. The previous-scene visual reference supplied by the worker is authoritative for the set. Preserve the same room or location, background geometry, wall and floor materials, furniture placement, major props, lighting direction, color temperature, time-of-day and camera-side spatial relationships. Change only the action/framing required by this shot. Do not invent a living room, office, studio, outdoor location, electronics, tools, machinery, screens, desks, lab equipment, workshop activity, new furniture, or another new set unless the brief or this shot explicitly requires a location change. STUDIO1 SEMANTIC ONSET LOCK: the very first rendered frame of this clip must already communicate the CURRENT scene's narration beat and visual objective. Do not spend the opening seconds establishing the room, waiting in a neutral pose, completing the previous scene's action, walking into position, revealing the subject later, or otherwise visually catching up to narration. Start with the relevant subject/action/state already underway at time 0.000 and develop it naturally through the clip. The current spoken beat is: When the city sleeps, our rhythm claims the pavement. STUDIO1 IDENTITY LOCK [lead_performer]: The canonical character reference for Meera Rao, mid 20s. Piercing almond eyes, determined brow, razor-sharp smile, radiant warm complexion, Tight cornrow braids threaded with silver rings into a high ponytail. is authoritative for this shot. Identity continuity is mandatory: identical face, age, skin tone, hair, body proportions, wardrobe and distinguishing features. Do not substitute, cast, morph into, or introduce a different actor. Eyeline: screen_right.`;

// Sanitized according to user change 3:
// 1. "Meera raises" -> "The drummer raises"
// 2. "The canonical character reference for Meera Rao, mid 20s..." -> "The attached canonical character reference image is authoritative for this shot. Physical description: mid 20s, piercing almond eyes..."
const fullPromptSanitized = fullPromptOriginal
  .replace(/\bMeera\b/g, "the drummer")
  .replace(/The canonical character reference for Meera Rao, mid 20s\./g, "The attached canonical character reference image is authoritative for this shot. Physical description: mid 20s,");

async function testPrompt(p, label) {
  const model = "veo-3.1-generate-preview";
  console.log(`\nDispatching ${label}...`);
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:predictLongRunning`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      instances: [{ prompt: p }],
      parameters: { aspectRatio: "9:16", durationSeconds: 4, sampleCount: 1 }
    })
  });
  const json = await res.json();
  console.log(`=== ${label} ===`);
  console.log("Response:", JSON.stringify(json, null, 2));
  return json;
}

const op1 = await testPrompt(fullPromptOriginal, "ORIGINAL FULL PROMPT (with Meera Rao)");
const op2 = await testPrompt(fullPromptSanitized, "SANITIZED FULL PROMPT (the drummer, no Meera Rao)");

async function pollOp(name, label) {
  if (!name) return;
  console.log(`Polling ${label} (${name})...`);
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 6000));
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${name}?key=${key}`);
    const json = await res.json();
    if (json.done) {
      console.log(`\n=== RESULT FOR ${label} ===`);
      console.log(JSON.stringify(json, null, 2));
      return;
    }
    process.stdout.write(".");
  }
}

if (op1.name) await pollOp(op1.name, "ORIGINAL FULL PROMPT");
if (op2.name) await pollOp(op2.name, "SANITIZED FULL PROMPT");
