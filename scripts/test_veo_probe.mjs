import fs from "node:fs";

let key = "";
for (const f of [".env.production", ".env.local", ".env"]) {
  if (fs.existsSync(f)) {
    const m = fs.readFileSync(f, "utf8").match(/GEMINI_API_KEY=([^\r\n]+)/);
    if (m) { key = m[1].trim().replace(/^["']|["']$/g, ""); break; }
  }
}

if (!key) {
  console.error("No GEMINI_API_KEY found");
  process.exit(1);
}

const buf = fs.readFileSync("public/assets/stills/dubai_dance.jpg");

async function test(label, model, payload) {
  console.log(`\n=== Testing ${label} (${model}) ===`);
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:predictLongRunning?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const json = await res.json().catch(() => ({}));
  console.log("HTTP Status:", res.status);
  console.log("Response:", json.name ? `Operation: ${json.name}` : json);
  return json;
}

async function main() {
  await test("veo-3.1-fast-generate-preview with referenceImages", "veo-3.1-fast-generate-preview", {
    instances: [{
      prompt: "the young South Asian female street dancer stands in neutral light, medium shot, looking slightly off-camera.",
      referenceImages: [{ image: { bytesBase64Encoded: buf.toString("base64"), mimeType: "image/jpeg" }, referenceType: "asset" }]
    }],
    parameters: { aspectRatio: "9:16", durationSeconds: 4, sampleCount: 1 }
  });

  await test("veo-3.1-generate-preview with image (opening frame)", "veo-3.1-generate-preview", {
    instances: [{
      prompt: "the young South Asian female street dancer stands in neutral light, medium shot, looking slightly off-camera.",
      image: { bytesBase64Encoded: buf.toString("base64"), mimeType: "image/jpeg" }
    }],
    parameters: { aspectRatio: "9:16", durationSeconds: 4, sampleCount: 1 }
  });

  await test("veo-3.1-fast-generate-preview with image (opening frame)", "veo-3.1-fast-generate-preview", {
    instances: [{
      prompt: "the young South Asian female street dancer stands in neutral light, medium shot, looking slightly off-camera.",
      image: { bytesBase64Encoded: buf.toString("base64"), mimeType: "image/jpeg" }
    }],
    parameters: { aspectRatio: "9:16", durationSeconds: 4, sampleCount: 1 }
  });
}

main().catch(console.error);
