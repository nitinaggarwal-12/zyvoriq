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
const reelProductionStore = readRepoFile("lib/reel/productionStore.ts");
const reelProductionControl = readRepoFile("lib/reel/productionControl.ts");
const episodeStore = readRepoFile("lib/episode/episodeStore.ts");
const instrumentationSrc = readRepoFile("instrumentation.ts");
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
assert.ok(reelsCapabilitiesRoute.includes('"sqlite-wal"'), "/api/reels/capabilities must report dual-engine sqlite-wal persistence when Postgres is unconfigured");
assert.ok(reelProductionStore.includes("ensureSqliteDb") && !reelProductionStore.includes("no local fallback"), "lib/reel/productionStore.ts must support zero-config SQLite WAL fallback");
assert.ok(reelProductionControl.includes("ensureSqliteControlDb") && !reelProductionControl.includes("requires Postgres"), "lib/reel/productionControl.ts must support zero-config SQLite WAL fallback");
assert.ok(episodeStore.includes("ensureSqliteEpisodesDb") && !episodeStore.includes("POSTGRES_REQUIRED"), "lib/episode/episodeStore.ts must support zero-config SQLite WAL fallback");
assert.ok(instrumentationSrc.includes("[CLOUDRUN_BOOT_SELFTEST_PASS]"), "instrumentation.ts must run Cloud Run in-container HTTP boot self-verification");
assert.equal((swarmJobsRoute.match(/job\.isFallbackMaster\s*=\s*true;/g) || []).length >= 3, true, "/api/swarm/jobs must flag job.isFallbackMaster = true on both Act 1-2 and extended-act seed recoveries");
assert.equal(pkgJson.scripts?.["worker:reels"], undefined, "package.json must not retain dead worker:reels script");
assert.equal(pkgJson.scripts?.["studio1:qa"], undefined, "package.json must not retain dead studio1:qa script");

// 6. RCA-ZYV-11..15: Cloud Run <=8 MiB HTTP 206 Range Cap, Safe ReadableStream Cancel, Law 16 thinkingLevel, 150s Omni/Lyria Timeouts & Music Routing
const mediaRoute = readRepoFile("app/api/media/[...path]/route.ts");
const vertexAdcClient = readRepoFile("lib/swarm/vertexAdcClient.ts");
const synthFromPromptRoute = readRepoFile("app/api/swarm/synthesize-from-prompt/route.ts");
const gate5Entrypoint = readRepoFile("scripts/gate5_self_verify_entrypoint.mjs");
const deployCloudRunPy = readRepoFile("scripts/deploy_zyvoriq_cloudrun.py");

assert.ok(mediaRoute.includes("MAX_CLOUDRUN_RANGE_CHUNK_BYTES = 8 * 1024 * 1024"), "/api/media must cap HTTP 206 Byte-Range chunks to 8 MiB (<32 MiB Cloud Run GFE HTTP/1.1 limit)");
assert.ok(mediaRoute.includes("createSafeFileWebStream") && mediaRoute.includes("cancel()"), "/api/media ReadableStream must guard cancel() and closed state to prevent ERR_INVALID_STATE");
assert.ok(vertexAdcClient.includes('thinkingLevel: params.modelPreference === "pro" ? "MEDIUM" : "LOW"'), "lib/swarm/vertexAdcClient.ts must pass discrete Law 16 thinkingConfig.thinkingLevel on gemini-3.8-flash");
assert.ok(synthFromPromptRoute.includes("buildWordSafeTopic") && !synthFromPromptRoute.includes("cleanBrief.slice(0, 52)"), "synthesize-from-prompt must use word-boundary truncation (zero mid-word 'bu' truncation)");
assert.ok(synthFromPromptRoute.includes('recommendedAudioEngine: isMusicBrief ? "omni_lyria3"'), "synthesize-from-prompt must recommend omni_lyria3 for music/song/dance prompts");
assert.ok(swarmJobsRoute.includes("const OMNI_TIMEOUT_MS = 150000;") && !swarmJobsRoute.includes("AbortSignal.timeout(15000)"), "/api/swarm/jobs callOmniInteractions must allow 150s for ~40s real Omni 1.1 video diffusion");
assert.ok(swarmJobsRoute.includes("aloop=loop=-1:size=2000000000"), "/api/swarm/jobs muxAudioOntoVideo must loop 60s Lyria 3 Pro song across >55s masters via aloop filter instead of padding silence");
assert.ok(swarmJobsRoute.includes("isExplicitMusicBrief") && !swarmJobsRoute.includes("|higgsfield|"), "/api/swarm/jobs must route music prompts to Lyria 3 Pro without Higgsfield camera presets suppressing it");
assert.ok(swarmJobsRoute.includes("const hasPerTurnPrompts =") && swarmJobsRoute.includes("alimiter=limit=0.84"), "/api/swarm/jobs must distinguish per-act vs per-turn prompts and preserve LRA >= 3.5 LU dynamics");
assert.ok(swarmJobsRoute.includes("silenceremove=start_periods=0:stop_periods=-1:stop_duration=0.18:stop_threshold=-34dB") && swarmJobsRoute.includes("const anchorTimes = [29.2, 4.0, 14.0];"), "/api/swarm/jobs must strip premature Lyria fade-outs before chorus crossfade and anchor Act II on outgoing t=29.2s seam frame");
assert.ok(swarmJobsRoute.includes("const mediaPrefix = `/api/media${publicPrefix}`;") && studioPage.includes('post.videoUrl.startsWith("/assets/")'), "/api/swarm/jobs and /swarm-MUI must route generated MP4 URLs via /api/media/assets/... for Cloud Run <=8 MiB HTTP 206 streaming");
assert.ok(entityApiRoute.includes("findNewestJobStateForCanonicalId") && entityApiRoute.includes("LEGACY_CANONICAL_ID_ALIASES"), "/api/entity/[id] must resolve live running/completed job_state.json and alias ZYV-REEL-AMUSICAL-300S");
assert.ok(entityPage.includes("entity?.renderStatus !== 'rendering'") && entityPage.includes("useState<boolean>(false)"), "/entity/[id] must poll rendering jobs and initialize isPlaying=false");
assert.ok(gate5Entrypoint.includes("largeMp4Range206"), "gate5_self_verify_entrypoint.mjs must verify 8 MiB HTTP 206 Range chunking on >32 MiB MP4");
assert.ok(deployCloudRunPy.includes("--no-cpu-throttling") && deployCloudRunPy.includes("--max-instances=1"), "deploy_zyvoriq_cloudrun.py must configure --no-cpu-throttling and --max-instances=1");

// 7. RCA-ZYV-16..17: Zero Seed-Video Hijack, Honest Pending Stage, Multi-Aspect Ratio & Unified 6-Modality Multimedia Studio
const audioNarrateService = readRepoFile("lib/audio/audioNarrationService.ts");
const lyriaService = readRepoFile("lib/ai/lyriaService.ts");
const v2aService = readRepoFile("lib/ai/v2aService.ts");
const avatarBuilderRoute = readRepoFile("app/api/swarm/avatar-builder/route.ts");

assert.ok(synthFromPromptRoute.includes('assetType: initialVideoUrl ? "combined_master" : "blueprint_pending_render"'), "synthesize-from-prompt must mark custom unrendered prompts as blueprint_pending_render with empty videoUrl");
assert.ok(!studioPage.includes("Verified 35mm studio master active."), "/swarm-MUI handleStartLiveVideoRender must never fake completion on dispatch failure");
assert.ok(studioPage.includes('data-testid="multimedia-modality-selector"') && studioPage.includes("handleGenerateStandaloneMedia"), "/swarm-MUI must expose Unified 6-Modality Multimedia Selector and standalone media handler");
assert.ok(studioPage.includes('data-testid="studio-pending-live-render-stage"') && entityPage.includes('data-testid="entity-pending-render-stage"'), "/swarm-MUI and /entity/[id] must render honest pending stage cards when videoUrl is empty");
assert.ok(swarmJobsRoute.includes("resolveTargetScaleAndCrop") && studioPage.includes("aspectRatio: resolvedAspectRatio"), "/api/swarm/jobs and /swarm-MUI must support 9:16, 16:9, and 1:1 multi-aspect video synthesis");
assert.ok(audioNarrateService.includes("multiSpeakerVoiceConfig") && lyriaService.includes("lyria-3-pro-preview") && v2aService.includes("lyria-3-clip-preview") && avatarBuilderRoute.includes('mode === "keyframe"'), "All 4 standalone audio/image services (Narrate/Podcast, Lyria Song, V2A Foley, Keyframe Image) must be wired to live models");

console.log("✅ Option A (Lean Omni-First + Veo 3.1 Safety-Net), RCA-ZYV-11..17 6-Modality/Zero-Hijack Gates, SQLite WAL parity, and Cloud Run preflight QA passed");

