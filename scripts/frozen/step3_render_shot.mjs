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
    prompt: `Cinematic 16:9 establishing tracking shot inside an arctic glacier cavern.
Freya, a real live-action human woman with porcelain skin, piercing blue eyes, and loose platinum-blonde wavy hair, wearing a white ice-crystal gown with a sheer illusion neckline featuring crystal sparkles over an embellished sweetheart bodice and sheer gossamer capelets, walks gracefully across the polished black ice floor toward the cave mouth overlooking a stormy northern fjord.
Floating diamond ice particles hover in the blue and violet ambient air.
Shot on 35mm motion picture film, live-action feature film, realistic natural skin texture and pores, photorealistic live-action human performer, strictly zero 3D CGI, zero animation, zero cartoon styling, zero 3D render, strictly zero on-screen text, zero subtitles.`
  },
  {
    num: 2,
    id: "shot_02_freya_vocal_attack",
    prompt: `Cinematic 16:9 dynamic performance medium shot at the mouth of an arctic glacier cavern.
Freya, a Nordic singer with porcelain skin and wavy platinum hair, wearing a luminescent white crystalline gown with semi-sheer gossamer capelets, sings passionately with open mouth into the camera: "I hear you calling through the frozen night, a secret whispering in crystal light!"
Her platinum hair and gossamer capelets flutter in the arctic sea breeze as glowing diamond frost particles swirl gently from her hands.
24fps high resolution, photorealistic, strictly zero on-screen text, zero subtitles.`
  },
  {
    num: 3,
    id: "shot_03_astrid_freya_harmonies",
    prompt: `Wide 16:9 cinematic two-shot. Two real human live-action actresses standing side-by-side on a coastal cliff overlooking turbulent ocean waves:
On the left: A live-action singer with wavy platinum-blonde hair, wearing a fitted white crystal-embellished sweetheart corset gown with sheer gossamer capelets.
On the right: A live-action singer with auburn hair styled in a braided crown updo, wearing a tailored charcoal wool coat dress with dark teal trim and a rich magenta satin-lined traveling cloak over her shoulder.
Both real human women look at each other and sing vocal harmonies into the camera against the stormy sea and green coastal cliffs.
Shot on 35mm motion picture film, live-action feature film, realistic natural skin texture and pores, photorealistic live-action human faces, realistic natural sunlight, strictly zero 3D CGI, zero animation, zero cartoon styling, zero text.`
  },
  {
    num: 4,
    id: "shot_04_aurora_climax_finale",
    prompt: `Wide 16:9 cinematic grand finale two-shot on an arctic coastal cliff overlooking crashing ocean waves beneath a shimmering emerald Aurora Borealis.
Two real human live-action actresses perform a triumphant musical finale side-by-side:
On the left: A real live-action singer with wavy platinum-blonde hair, wearing a white ice-crystal gown featuring a sheer illusion neckline with crystal sparkles over an embellished sweetheart bodice and sheer gossamer capelets flowing in the wind.
On the right: A real live-action singer with auburn hair in a neat braided crown updo, wearing a tailored charcoal wool coat dress with dark teal trim and a rich magenta satin-lined traveling cloak draped over one shoulder.
Both real human women raise their arms gracefully toward the northern sky and sing their triumphant final high note as waves crash on the dark rocks below.
Shot on 35mm motion picture film, live-action feature film, realistic natural skin texture and pores, photorealistic live-action human faces, natural nighttime cinematic lighting with green aurora rim-light, strictly zero 3D CGI, zero animation, zero cartoon styling, strictly zero on-screen text.`
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

  const videoBuf = await callOmni(shotConfig.prompt, null);
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
