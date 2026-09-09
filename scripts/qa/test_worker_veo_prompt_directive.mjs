import assert from "node:assert/strict";
import fs from "node:fs";

// Extract sanitizePromptForVeo logic or test via direct function check
const code = fs.readFileSync("./scripts/reel_worker_v2.mjs", "utf8");
assert.ok(code.includes('const isMusicVideo = String(genre || "").toUpperCase() === "MUSIC_VIDEO" || clean.includes("MUSIC_VIDEO") || clean.includes("music video");'), "Worker must detect MUSIC_VIDEO for prompt sanitization");
assert.ok(code.includes("High-fidelity melodic music video vocal track with synchronized singing lip performance"), "Worker must inject synchronized singing lip performance directive for Veo");

assert.ok(code.includes("const { audioStrategy = \"native\", isAudioFilterRetry = false, genre = \"\" } = options;"), "options must destructure genre in sanitizePromptForVeo");

console.log("✅ Worker Veo prompt directive verified in scripts/reel_worker_v2.mjs!");
