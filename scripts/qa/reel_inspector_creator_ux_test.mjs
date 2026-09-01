import assert from "node:assert/strict";
import fs from "node:fs";

const page = fs.readFileSync("app/studio/inspector/page.tsx", "utf8");
const listRoute = fs.readFileSync("app/api/reels/productions/route.ts", "utf8");
const detailRoute = fs.readFileSync("app/api/reels/productions/[id]/route.ts", "utf8");
const inspectionRoute = fs.readFileSync("app/api/reels/productions/[id]/inspection/route.ts", "utf8");

for (const label of [
  "Reel Inspector",
  "Switch Reel",
  "Current moment",
  "Planned scene state",
  "Narration & captions",
  "Scene timeline",
  "Advanced Evidence",
  "Export diagnostic report",
  "Capture current frame",
]) {
  assert.ok(page.includes(label), `Inspector creator UX must include: ${label}`);
}

for (const legacyLabel of [
  "Reel Evidence Inspector",
  "Frame truth",
  "Expected visual state",
  "Audio + text",
  "Observed QA evidence",
  "Inspection JSON",
  "Export current frame PNG",
]) {
  assert.ok(!page.includes(legacyLabel), `Developer-facing legacy label must stay out of the primary Inspector UX: ${legacyLabel}`);
}

assert.ok(page.includes("hasAnyObservedEvidence"), "Inspector must gate observed quality evidence on real evaluator output");
assert.ok(page.includes("!hasAnyObservedEvidence"), "Inspector must explicitly handle productions without evaluator evidence");
assert.ok(page.includes("combinedVideoUrl"), "Inspector must distinguish combined-Reel playback from source-clip fallback");
assert.ok(page.includes("globalSec - Number(selectedShot?.startSec || 0)"), "Source-clip fallback must seek using clip-local time");
assert.ok(page.includes("Number(selectedShot?.startSec || 0) + localSec"), "Source-clip playback must map local time back to the global Reel timeline");

for (const route of [listRoute, detailRoute, inspectionRoute]) {
  assert.ok(route.includes("suppressUncertifiedStudio1Outputs"), "Every generic Reel read surface must suppress uncertified Studio1 combined outputs");
  assert.ok(route.includes('startsWith("studio1_")'), "Studio1 suppression must stay scoped to Studio1 productions");
}

assert.ok(detailRoute.includes("NextResponse.redirect(target, 307)"), "Generic production PATCH must route Studio1 mutations to the canonical Studio1 API without changing method/body");
assert.ok(detailRoute.includes("/api/studio1/productions/"), "Studio1 mutation compatibility path must target the Studio1 API");
assert.ok(detailRoute.indexOf('id.startsWith("studio1_")') < detailRoute.indexOf("const body = await req.json()"), "Studio1 mutation guard must run before generic action dispatch");

console.log("Reel Inspector creator UX and stale-output safety QA passed");
