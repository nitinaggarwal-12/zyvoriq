import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("app/studio/library/page.tsx", "utf8");

assert.ok(source.includes("Direct media"), "Studio1 project cards must expose direct media access");
assert.ok(source.includes('label="Reel"'), "Studio1 Full Reel must use the direct media action component");
assert.ok(source.includes("Generated clips"), "Studio1 project cards must expose generated clip media");
assert.ok(source.includes("Copy {label} Link"), "direct media actions must support copying clip and Reel URLs");
assert.ok(source.includes("absoluteMediaUrl"), "copied media URLs must be absolute shareable URLs");
assert.ok(source.includes("m.outputs?.master?.videoUrl || m.outputs?.narratedRoughCut?.videoUrl"), "Full Reel access must prefer master then certified narrated rough cut from the presented Studio1 manifest");
assert.ok(source.includes("Open / Edit"), "restoring direct media must not remove project editing");
assert.ok(source.includes("Copy link"), "generic media asset cards must retain direct URL copy access");
assert.ok(source.includes("download"), "media download access must remain available");

console.log("Library direct media actions QA passed");
