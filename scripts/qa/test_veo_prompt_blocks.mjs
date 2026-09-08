import fs from "fs";

let key = process.env.GEMINI_API_KEY;
for (const envFile of [".env.local", ".env", ".env.production"]) {
  if (!key && fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, "utf8");
    const match = content.match(/GEMINI_API_KEY=([^\r\n]+)/);
    if (match) key = match[1].trim().replace(/^["']|["']$/g, "");
  }
}

const baseAction = "ESTABLISHING_WIDE: The drummer raises her carved drumsticks overhead, striking the decorated dholak with explosive power as brass horn players assemble behind her.. Eyeline: screen_right. Camera: Slow 360-degree rotational push-in rising from wet asphalt level. Narrative beat: When the city sleeps, our rhythm claims the pavement. Tone: Confident & conversational.";

const blockStyle = "Arri Alexa Mini LF, Master Anamorphic 35mm & 50mm lenses, 2.39:1 aspect ratio, kinetic Steadicam and low-angle rotational tracking; Midnight cyan shadows, sodium-vapor golden street amber, harsh neon magenta signage spill, gleaming wet asphalt reflections; Humid monsoon mist, chalk dust kicked from asphalt, swirling exhaust haze, high-voltage kinetic nocturnal ambiance. Zero generated text in scene pixels. 9:16 social framing; deliberate mix of tight presenter shots, medium action shots and relevant b-roll; preserve eyeline and screen direction across contiguous action. Do not render captions, subtitles, logos or UI text inside the generated video; those are composited later.";

const blockEnv = "STUDIO1 ENVIRONMENT LOCK: Treat the established location as one continuous physical set across clips. The previous-scene visual reference supplied by the worker is authoritative for the set. Preserve the same room or location, background geometry, wall and floor materials, furniture placement, major props, lighting direction, color temperature, time-of-day and camera-side spatial relationships. Change only the action/framing required by this shot. Do not invent a living room, office, studio, outdoor location, electronics, tools, machinery, screens, desks, lab equipment, workshop activity, new furniture, or another new set unless the brief or this shot explicitly requires a location change.";

const blockOnset = "STUDIO1 SEMANTIC ONSET LOCK: the very first rendered frame of this clip must already communicate the CURRENT scene's narration beat and visual objective. Do not spend the opening seconds establishing the room, waiting in a neutral pose, completing the previous scene's action, walking into position, revealing the subject later, or otherwise visually catching up to narration. Start with the relevant subject/action/state already underway at time 0.000 and develop it naturally through the clip. The current spoken beat is: When the city sleeps, our rhythm claims the pavement.";

const blockIdentity = "STUDIO1 IDENTITY LOCK [lead_performer]: The attached canonical character reference is authoritative for this shot. Identity continuity is mandatory: identical face, age, skin tone, hair, body proportions, wardrobe and distinguishing features. Do not substitute, cast, morph into, or introduce a different actor. Eyeline: screen_right.";

const tests = [
  { label: "1_BASE_ONLY", prompt: baseAction },
  { label: "2_BASE_PLUS_STYLE", prompt: `${baseAction} ${blockStyle}` },
  { label: "3_BASE_PLUS_ENV", prompt: `${baseAction} ${blockEnv}` },
  { label: "4_BASE_PLUS_ONSET", prompt: `${baseAction} ${blockOnset}` },
  { label: "5_BASE_PLUS_IDENTITY", prompt: `${baseAction} ${blockIdentity}` },
];

async function run() {
  const model = "veo-3.1-generate-preview";
  const ops = [];
  for (const t of tests) {
    console.log(`Dispatching ${t.label}...`);
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:predictLongRunning`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        instances: [{ prompt: t.prompt }],
        parameters: { aspectRatio: "9:16", durationSeconds: 4, sampleCount: 1 }
      })
    });
    const j = await res.json();
    ops.push({ ...t, opName: j.name, err: j.error });
  }

  console.log("\nAll dispatched. Now polling results...");
  for (const op of ops) {
    if (!op.opName) {
      console.log(`[${op.label}] Failed to dispatch: ${JSON.stringify(op.err)}`);
      continue;
    }
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 6000));
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${op.opName}?key=${key}`);
      const json = await res.json();
      if (json.done) {
        const isFiltered = Boolean(json.response?.generateVideoResponse?.raiMediaFilteredCount);
        const reason = json.response?.generateVideoResponse?.raiMediaFilteredReasons?.[0] || "OK";
        console.log(`[${op.label}]: ${isFiltered ? "FILTERED (" + reason + ")" : "PASSED (video generated)"}`);
        break;
      }
    }
  }
}

run();
