import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

try {
  process.loadEnvFile(".env.local");
} catch {}

const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!key) {
  console.error("❌ No GEMINI_API_KEY or GOOGLE_API_KEY found!");
  process.exit(1);
}

const BASE_DIR = "scratch/frozen_glacier_whispers";
const CLIPS_DIR = path.join(BASE_DIR, "clips");
const COMPOSITE_ANCHOR = path.join(BASE_DIR, "anchors", "00_frozen_composite_anchor.png");

fs.mkdirSync(CLIPS_DIR, { recursive: true });

const SHOTS = [
  {
    num: 1,
    id: "shot_01_glacial_awakening",
    prompt: `Cinematic 16:9 establishing tracking shot inside a majestic arctic crystalline glacier cavern.
On the left of the composite reference image: Freya, the Nordic Glacial Sorceress in her EXACT luminescent pure white ice-crystal gown with semi-sheer gossamer capelets and platinum hair, walks gracefully across the polished black ice floor toward the arched cave mouth overlooking a stormy fjord.
Floating diamond ice crystals hover in the cool blue and violet ambient air, reflecting soft golden sunlight from outside.
Photorealistic 8K render, 24fps high resolution, strictly zero on-screen text, zero subtitles.`
  },
  {
    num: 2,
    id: "shot_02_freya_vocal_attack",
    prompt: `Cinematic 16:9 dynamic performance shot at the mouth of the glacier cavern.
Center-stage: Freya, the EXACT performer from the left of the composite reference image in her luminescent pure white gown and sheer capelets, sings passionately with open mouth directly into the camera: "I hear you calling through the frozen night, a secret whispering in crystal light!"
Her loose platinum hair and sheer crystal frost capelets billow dramatically in the arctic wind as glowing frost particles swirl from her hands.
Native belted singing performance, 24fps high resolution, strictly zero on-screen text.`
  },
  {
    num: 3,
    id: "shot_03_astrid_freya_harmonies",
    prompt: `Cinematic 16:9 performance shot on the glacier cliff overlooking the arctic sea.
Both EXACT performers from the composite reference image standing side-by-side:
Freya on the left in her white ice-crystal gown, and Astrid on the right in her tailored charcoal-black traveling dress with dark teal embroidery and magenta satin-lined traveling cloak.
They smile warmly at each other as they sing melodic vocal harmonies together against the turbulent fjord waves and snowy mountain peaks.
24fps high resolution, strictly zero on-screen text.`
  },
  {
    num: 4,
    id: "shot_04_aurora_climax_finale",
    prompt: `Cinematic 16:9 grand finale shot on the open glacial promontory beneath a dazzling Aurora Borealis.
Both EXACT performers from the reference image (Freya in her white gown and Astrid in her black-and-magenta traveling dress) execute a triumphant gesture facing the stormy northern sea.
Freya steps forward, and a massive glowing geometric snowflake starburst explodes across the ice under her boots, sending thousands of sparkling diamond ice embers rising into the swirling green and violet northern lights as both sing the triumphant final high note.
24fps high resolution, strictly zero on-screen text.`
  }
];

async function callOmni(prompt, referenceImageB64) {
  const payload = {
    model: "models/gemini-omni-1.1-flash",
    input: referenceImageB64
      ? [
          { type: "text", text: prompt },
          { type: "image", data: referenceImageB64, mime_type: "image/png" }
        ]
      : [{ type: "text", text: prompt }]
  };

  const startTime = Date.now();
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/interactions?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(`Gemini Omni failed (${res.status}): ${await res.text()}`);
  }

  const data = await res.json();
  let videoBuffer = null;
  if (Array.isArray(data.steps)) {
    for (const step of data.steps) {
      if (Array.isArray(step.content)) {
        for (const item of step.content) {
          if (item.data) {
            videoBuffer = Buffer.from(item.data, "base64");
            break;
          }
        }
      }
      if (videoBuffer) break;
    }
  }

  if (!videoBuffer) {
    throw new Error(`No video buffer in Omni response: ${JSON.stringify(data).slice(0, 300)}`);
  }

  console.log(`   ✅ Omni render complete (${Math.round(videoBuffer.length / 1024)} KB) in ${Math.round((Date.now() - startTime) / 1000)}s`);
  return videoBuffer;
}

async function renderSingleShot(shotNum) {
  const shotConfig = SHOTS.find((s) => s.num === shotNum);
  if (!shotConfig) throw new Error(`Invalid shot number: ${shotNum}`);

  const outPath = path.join(CLIPS_DIR, `${shotConfig.id}.mp4`);
  console.log(`========================================================================`);
  console.log(`🎬 RENDERING [Shot ${shotNum}/4]: ${shotConfig.id}`);
  console.log(`========================================================================`);

  if (!fs.existsSync(COMPOSITE_ANCHOR)) {
    throw new Error(`Composite anchor missing at ${COMPOSITE_ANCHOR}`);
  }

  const compositeB64 = fs.readFileSync(COMPOSITE_ANCHOR).toString("base64");
  const videoBuf = await callOmni(shotConfig.prompt, compositeB64);
  fs.writeFileSync(outPath, videoBuf);
  console.log(`🎉 Successfully generated and saved: ${outPath} (${Math.round(videoBuf.length / 1024)} KB)`);

  const dur = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${outPath}`).toString().trim();
  console.log(`⏱️ Verified Shot Duration: ${dur}s`);
}

const arg = process.argv.find((a) => a.startsWith("--shot="));
const shotNum = arg ? parseInt(arg.split("=")[1], 10) : 1;

renderSingleShot(shotNum).catch((err) => {
  console.error("❌ Shot render failed:", err);
  process.exit(1);
});
