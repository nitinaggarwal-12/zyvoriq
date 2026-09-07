import assert from "node:assert/strict";
import fs from "node:fs";

const createRoute = fs.readFileSync("app/api/reels/productions/route.ts", "utf8");
const mutationRoute = fs.readFileSync("app/api/reels/productions/[id]/route.ts", "utf8");
const planRoute = fs.readFileSync("app/api/reels/plan/route.ts", "utf8");
const studio1Route = fs.readFileSync("app/api/studio1/productions/[id]/route.ts", "utf8");
const operationQueue = fs.readFileSync("lib/reel/operationQueue.ts", "utf8");
const worker = fs.readFileSync("scripts/reel_worker_v2.mjs", "utf8");
const workerGuard = fs.readFileSync("scripts/canonical_reel_operation_guard.mjs", "utf8");
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

assert.ok(createRoute.includes('import { planStudio1 }'), "public Reel creation must use the Studio1 planner");
assert.ok(/const manifest = (?:await )?planStudio1/.test(createRoute), "public Reel creation must persist a Studio1 manifest");
assert.ok(!createRoute.includes("reelProductionService.create({"), "public Reel creation must not persist a legacy reel_* manifest");
assert.ok(createRoute.includes('canonicalEngine: "studio1"'), "public creation response must identify the canonical engine");

assert.ok(planRoute.includes('import { planStudio1 }'), "public planning must use Studio1 semantics");
assert.ok(/const manifest = (?:await )?planStudio1/.test(planRoute), "public planning must not emit a legacy generic manifest");
assert.ok(planRoute.includes('canonicalEngine: "studio1"'), "public planning response must identify the canonical engine");

assert.ok(mutationRoute.includes("studio1Patch(req, context)"), "existing clients must preserve PATCH bodies when routed to Studio1");
assert.ok(!mutationRoute.includes("NextResponse.redirect"), "Studio1 routing must not depend on a redirect origin");
assert.ok(mutationRoute.includes("LEGACY_REEL_PIPELINE_DISABLED"), "legacy reel_* paid generation must fail closed");
assert.ok(!mutationRoute.includes("kind: \"ROUGH_CUT\""), "generic mutation route must not enqueue legacy rough-cut generation");
assert.ok(!mutationRoute.includes("kind: \"SHOT\""), "generic mutation route must not enqueue legacy shot generation");
assert.ok(!mutationRoute.includes("kind: \"NARRATION\""), "generic mutation route must not enqueue legacy narration generation");

assert.ok(operationQueue.includes('input.productionId.startsWith("studio1_")'), "queue must require a Studio1 production ID");
assert.ok(operationQueue.includes("input.payload?.studio1 !== true"), "queue must require explicit Studio1 operation evidence");
assert.ok(operationQueue.includes("LEGACY_REEL_PIPELINE_DISABLED"), "queue must fail closed before persisting a legacy paid job");

assert.ok(studio1Route.includes("studio1: true"), "Studio1 paid operations must carry canonical engine evidence");
assert.ok(studio1Route.includes("narrationSyncedTimeline: true"), "Studio1 rough cuts must carry exact narration-sync evidence");
assert.ok(worker.includes("if (op.payload_json?.studio1)"), "worker narration path must branch on canonical Studio1 evidence");
assert.ok(worker.includes("const studio1 = op.payload_json?.studio1 === true"), "worker rough-cut path must branch on canonical Studio1 evidence");

assert.ok(workerGuard.includes("LEGACY_REEL_PIPELINE_DISABLED"), "worker startup must reject legacy paid jobs queued before deployment");
assert.ok(workerGuard.includes("kind IN ('NARRATION','SHOT','ROUGH_CUT')"), "worker guard must cover all paid legacy media operations");
assert.ok(workerGuard.includes("payload_json->>'studio1'"), "worker guard must require canonical operation evidence");
assert.ok(packageJson.scripts["worker:reels"].includes("canonical_reel_operation_guard.mjs"), "production worker must preload the legacy-operation guard");
assert.ok(packageJson.scripts["check"].includes("canonical:qa"), "full check must enforce canonical routing");
assert.ok(packageJson.scripts["build"].includes("canonical:qa"), "production build must enforce canonical routing");

console.log("Canonical Reel engine routing QA passed");
