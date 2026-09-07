import fs from "fs";
import path from "path";
import assert from "assert";

async function runZeroKeywordZeroStaticGate() {
  console.log("================================================================================");
  console.log("🛡️ GUARD 0-ZERO: ZERO KEYWORD MATCHING & ZERO STATIC FALLBACK QUALITY GATE");
  console.log("================================================================================");

  // Load API key
  let apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey && fs.existsSync(".env.local")) {
    const envContent = fs.readFileSync(".env.local", "utf-8");
    const m = envContent.match(/GEMINI_API_KEY=(.+)/);
    if (m) apiKey = m[1].trim();
  }

  if (!apiKey) {
    throw new Error("❌ GEMINI_API_KEY must be set in environment or .env.local to execute this quality gate.");
  }

  const testPrompt = "A lone astrophysicist on the Atacama desert plateau tracking an anomalous cosmic microwave signal at midnight under the Milky Way";
  console.log(`[Gate Test] Testing novel arbitrary prompt: "${testPrompt}"`);

  const port = process.env.PORT || 3000;
  const baseUrl = `http://localhost:${port}`;
  console.log(`[Gate Test] Sending POST request to ${baseUrl}/api/studio1/productions...`);

  const startTime = Date.now();
  const res = await fetch(`${baseUrl}/api/studio1/productions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic: testPrompt, prompt: testPrompt, autoStart: false })
  });

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[Gate Test] Response received in ${durationSec}s (Status: ${res.status})`);

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API returned HTTP ${res.status}: ${errText}`);
  }

  const data = await res.json();
  assert(data.success === true, "Expected data.success to be true");
  assert(data.production, "Expected data.production to exist");

  const scene = data.scene;
  console.log(`[Gate Test] Scene ID: "${scene.id}"`);
  console.log(`[Gate Test] Scene Title: "${scene.title}"`);
  console.log(`[Gate Test] Scene Setting: "${scene.setting}"`);
  console.log(`[Gate Test] Still Asset: "${scene.still}"`);
  console.log(`[Gate Test] Video Asset: "${scene.video}"`);
  console.log(`[Gate Test] Lines: ${scene.lines.length} lines`);

  // ==========================================
  // HARD ASSERTIONS: ZERO STATIC FALLBACKS
  // ==========================================
  const FORBIDDEN_STATIC_STILLS = [
    "/assets/stills/mumbai_penthouse.jpg",
    "/assets/stills/napoleon_hero.png",
    "/assets/stills/coronation_hero.png",
    "/assets/stills/titanic_hero.jpg",
    "/assets/stills/neotokyo_hero.jpg"
  ];

  const FORBIDDEN_STATIC_VIDEOS = [
    "/assets/video/mumbai_penthouse_180s_master.mp4",
    "/assets/video/napoleon_180s_master.mp4",
    "/assets/video/coronation_180s_master.mp4",
    "/assets/video/titanic_180s_master.mp4",
    "/assets/video/neotokyo_180s_master.mp4"
  ];

  for (const forbidden of FORBIDDEN_STATIC_STILLS) {
    assert.notStrictEqual(
      scene.still,
      forbidden,
      `🚨 CRITICAL FAILURE: Custom prompt fell back to static demo still "${forbidden}"!`
    );
  }
  console.log("✓ PASS: Zero forbidden static stills returned.");

  for (const forbidden of FORBIDDEN_STATIC_VIDEOS) {
    assert.notStrictEqual(
      scene.video,
      forbidden,
      `🚨 CRITICAL FAILURE: Custom prompt fell back to static demo video "${forbidden}"!`
    );
  }
  console.log("✓ PASS: Zero forbidden static videos returned.");

  // ==========================================
  // HARD ASSERTIONS: DYNAMIC ASSET VALIDATION
  // ==========================================
  assert(
    scene.still.startsWith("/assets/stills/generated/"),
    `Expected still to be in /assets/stills/generated/, got "${scene.still}"`
  );

  assert(
    scene.stillBase64 && scene.stillBase64.startsWith("data:image/png;base64,"),
    "Expected stillBase64 to be a valid base64 data URI"
  );

  // Check physical file on disk
  const relativeStillPath = scene.still.replace(/^\//, "");
  const absoluteStillPath = path.join(process.cwd(), "public", relativeStillPath);
  assert(fs.existsSync(absoluteStillPath), `Expected file on disk at ${absoluteStillPath}`);

  const fileStat = fs.statSync(absoluteStillPath);
  console.log(`[Gate Test] Physical file on disk verified: ${fileStat.size} bytes`);
  assert(
    fileStat.size > 500000,
    `Expected file size > 500KB (indicating real 4K generation), got ${fileStat.size} bytes`
  );
  console.log("✓ PASS: Physical 4K still plate exists on disk and is > 500KB.");

  // ==========================================
  // HARD ASSERTIONS: ZERO KEYWORD/CANNED DIALOGUE
  // ==========================================
  const allDialogueText = scene.lines.map(l => l.text).join(" ").toLowerCase();
  assert(
    !allDialogueText.includes("paneer") &&
    !allDialogueText.includes("sea link") &&
    !allDialogueText.includes("rahul") &&
    !allDialogueText.includes("shweta"),
    "🚨 CRITICAL FAILURE: Mumbai family dinner dialogue leaked into custom prompt!"
  );
  assert(
    !allDialogueText.includes("napoléon") &&
    !allDialogueText.includes("marseille") &&
    !allDialogueText.includes("frégate"),
    "🚨 CRITICAL FAILURE: Napoleon dialogue leaked into custom prompt!"
  );
  console.log("✓ PASS: Zero canned preset dialogue leakage.");

  console.log("================================================================================");
  console.log("🎉 ALL ZERO-KEYWORD ZERO-STATIC QUALITY GATE ASSERTIONS PASSED 100%!");
  console.log("================================================================================");
}

runZeroKeywordZeroStaticGate().catch(err => {
  console.error("❌ Quality gate failed:", err.message);
  process.exit(1);
});
