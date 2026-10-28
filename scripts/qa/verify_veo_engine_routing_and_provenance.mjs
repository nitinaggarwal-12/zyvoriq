import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readRepoFile = (relPath) => fs.readFileSync(path.join(repoRoot, relPath), "utf8");

const studioPage = readRepoFile("app/swarm-MUI/page.tsx");
const swarmJobsRoute = readRepoFile("app/api/swarm/jobs/route.ts");
const entityApiRoute = readRepoFile("app/api/entity/[id]/route.ts");
const entityPage = readRepoFile("app/entity/[id]/page.tsx");
const veoService = readRepoFile("lib/ai/veoService.ts");
const ytContract = readRepoFile("lib/yt/contract.ts");
const rulesEngine = readRepoFile("lib/rules_engine.mjs");

// 1. /swarm-MUI passes foundationModel (including veo31_4k) to POST /api/swarm/jobs, nextDraft, deep-link hydration, and numeric parallelWorkers polling
assert.ok(studioPage.includes('id: "veo31_4k"'), "/swarm-MUI catalog must expose veo31_4k");
assert.ok(studioPage.includes("foundationModel: effectiveFoundationModel"), "/swarm-MUI must send foundationModel to POST /api/swarm/jobs");
assert.ok(studioPage.includes("foundationModel: selectedModelId"), "/swarm-MUI nextDraft must persist selectedModelId");
assert.ok(studioPage.includes("setSelectedModelId(resolvedModel)"), "/swarm-MUI deep-link hydration must sync selectedModelId from ent.foundationModel");
assert.ok(studioPage.includes("j.parallelWorkers?.veoWorkers"), "/swarm-MUI polling must extract numeric worker count from j.parallelWorkers object");

// 2. /api/swarm/jobs wires lib/ai/veoService.ts (generateVeoVideoBytes) for primary veo31_4k, Omni fallback, and multi-act extraActIndices
assert.ok(swarmJobsRoute.includes('import { generateVeoVideoBytes } from "@/lib/ai/veoService"'), "/api/swarm/jobs must import generateVeoVideoBytes from lib/ai/veoService");
assert.ok(swarmJobsRoute.includes("async function synthesize30sActViaVeo31"), "/api/swarm/jobs must define synthesize30sActViaVeo31");
assert.ok(swarmJobsRoute.includes("anullsrc=r=48000:cl=stereo"), "lockExactDuration must synthesize stereo AAC audio when Veo returns video-only MP4s");
assert.ok(swarmJobsRoute.includes('if (job.foundationModel === "veo31_4k")'), "/api/swarm/jobs must route veo31_4k directly to Veo 3.1");
assert.ok(swarmJobsRoute.includes("let veoFallbackSucceeded = false;"), "/api/swarm/jobs must attempt live Veo 3.1 Fast fallback before static seed masters");
assert.ok(swarmJobsRoute.includes("const useVeoForExtraActs ="), "/api/swarm/jobs extraActIndices must route Acts 3..N through Veo 3.1 when Veo is active");
assert.ok(swarmJobsRoute.includes("const ranVeo31 = Boolean(job.usedVeo31Live) && !job.isFallbackMaster;"), "/api/swarm/jobs must only badge Veo 3.1 live provenance when live Veo succeeded without seed fallback");

// 3. /api/entity/[id] & /entity/[id] dynamically report Omni 1.1 vs Veo 3.1 provenance and expose foundationModel
assert.ok(entityApiRoute.includes('const resolvedEngineLabel = isVeoPrimary ? "Veo 3.1" : "Omni 1.1"'), "/api/entity/[id] must compute truthful engineLabel");
assert.ok(entityApiRoute.includes("foundationModel: resolvedFoundationModel"), "/api/entity/[id] must return foundationModel for deep-link hydration");
assert.ok(entityPage.includes('{entity.parallelWorkers.engineLabel || "Omni 1.1"} Act Workers'), "/entity/[id] must render dynamic engineLabel instead of hardcoded Veo 3.1");

// 4. Verified Veo 3.1 model tiers, per-request apiKey, keyframe mimeType, & rules_engine DEFAULTS parity
assert.ok(veoService.includes("options.apiKey?.trim()"), "veoService must accept per-request options.apiKey");
assert.ok(veoService.includes("mimeType: detectedMime"), "veoService instance.image must include mimeType for ADK/ORCAS keyframe conditioning");
assert.ok(veoService.includes("veo-3.1-generate-preview"), "veoService must map quality tier to veo-3.1-generate-preview");
assert.ok(veoService.includes("veo-3.1-fast-generate-preview"), "veoService must map fast tier to veo-3.1-fast-generate-preview");
assert.ok(veoService.includes("veo-3.1-lite-generate-preview"), "veoService must map lite tier to veo-3.1-lite-generate-preview");
assert.ok(ytContract.includes('VEO_SHOTS: "models/veo-3.1-generate-preview"'), "yt/contract.ts must bind VEO_SHOTS to models/veo-3.1-generate-preview");
assert.ok(rulesEngine.includes("require_veo31_foundation_model_wiring_and_dynamic_entity_provenance: true"), "lib/rules_engine.mjs DEFAULTS must include Veo 3.1 routing & provenance rule");
assert.ok(rulesEngine.includes("require_option_a_lean_omni_first_veo_safety_net_and_zero_dead_studio1_worker: true"), "lib/rules_engine.mjs DEFAULTS must include Option A Studio1 pruning rule");

// 5. Option A (Lean Omni-First + Veo Safety-Net) Pruning Invariants: zero dead Studio1 worker/routes
for (const retiredPath of [
  "scripts/reel_worker_v2.mjs",
  "scripts/studio1_native.mjs",
  "app/api/studio1",
  "lib/studio1",
  "app/api/studio/omni-generate/route.ts",
]) {
  assert.ok(!fs.existsSync(path.join(repoRoot, retiredPath)), `Option A retired path must not exist: ${retiredPath}`);
}
for (const retainedSafetyNetPath of ["lib/ai/veoService.ts", "scripts/yt_pipeline.mjs"]) {
  assert.ok(fs.existsSync(path.join(repoRoot, retainedSafetyNetPath)), `Option A safety-net path must exist: ${retainedSafetyNetPath}`);
}

const operationQueue = readRepoFile("lib/reel/operationQueue.ts");
const reelsOperationsRoute = readRepoFile("app/api/reels/operations/[id]/route.ts");
const reelsPlanRoute = readRepoFile("app/api/reels/plan/route.ts");
const reelsProductionsRoute = readRepoFile("app/api/reels/productions/route.ts");
const reelsProductionByIdRoute = readRepoFile("app/api/reels/productions/[id]/route.ts");
const reelPlanner = readRepoFile("lib/reel/planner.ts");
const reelInspection = readRepoFile("lib/reel/inspection.ts");
const reelsCapabilitiesRoute = readRepoFile("app/api/reels/capabilities/route.ts");
const pkgJson = JSON.parse(readRepoFile("package.json"));

assert.ok(operationQueue.includes("STUDIO1_WORKER_PRUNED_OPTION_A"), "lib/reel/operationQueue.ts enqueue must fail closed with STUDIO1_WORKER_PRUNED_OPTION_A");
assert.ok(operationQueue.includes("Queue retry rejected for operation"), "lib/reel/operationQueue.ts retry must fail closed with STUDIO1_WORKER_PRUNED_OPTION_A");
assert.ok(reelsOperationsRoute.includes('code: "STUDIO1_WORKER_PRUNED_OPTION_A"') && reelsOperationsRoute.includes("status: 410"), "/api/reels/operations/[id] must map STUDIO1_WORKER_PRUNED_OPTION_A to HTTP 410");
for (const retiredAction of ['"generate"', '"regenerate-shot"', '"render"', '"publish"', '"attachNarration"', '"attachShotAsset"']) {
  assert.ok(reelsProductionByIdRoute.includes(retiredAction), `/api/reels/productions/[id] 410 guard must cover ${retiredAction}`);
}
assert.ok(reelsPlanRoute.includes("planReelAsync(planInput)"), "/api/reels/plan must support topic-only requests via planReelAsync");
assert.ok(reelsProductionsRoute.includes("planReelAsync(planInput)"), "/api/reels/productions must support topic-only requests via planReelAsync");
assert.ok(!reelPlanner.includes("planStudio1"), "lib/reel/planner.ts must not reference retired planStudio1()");
assert.ok(reelsPlanRoute.includes('canonicalEngine: "omni11_veo31_safety_net"'), "/api/reels/plan must declare omni11_veo31_safety_net");
assert.ok(reelsProductionsRoute.includes('canonicalEngine: "omni11_veo31_safety_net"'), "/api/reels/productions must declare omni11_veo31_safety_net");
assert.ok(!reelInspection.includes("/studio/inspector"), "lib/reel/inspection.ts must point canonicalUrl to /entity/[id], not retired /studio/inspector");
assert.ok(reelInspection.includes("/entity/${encodeURIComponent(manifest.id)}"), "lib/reel/inspection.ts must point canonicalUrl to /entity/[id]");
assert.ok(!reelsCapabilitiesRoute.includes('"sqlite-fallback"'), "/api/reels/capabilities must report truthful Postgres vs studio_entities SQLite persistence");
assert.equal((swarmJobsRoute.match(/job\.isFallbackMaster\s*=\s*true;/g) || []).length >= 3, true, "/api/swarm/jobs must flag job.isFallbackMaster = true on both Act 1-2 and extended-act seed recoveries");
assert.equal(pkgJson.scripts?.["worker:reels"], undefined, "package.json must not retain dead worker:reels script");
assert.equal(pkgJson.scripts?.["studio1:qa"], undefined, "package.json must not retain dead studio1:qa script");

console.log("✅ Option A (Lean Omni-First + Veo 3.1 Safety-Net) engine routing, provenance, and Studio1 pruning QA passed");
