import assert from "node:assert/strict";
import fs from "node:fs";
import {
  attachReelArtifactIndex,
  buildReelArtifactIndex,
  canonicalArtifactPath,
  newArtifactId,
  parseScopedArtifactId,
  scopedArtifactId,
} from "../../lib/artifact/identity.ts";
import { suppressUncertifiedStudio1Outputs } from "../../lib/studio1/fullReelCertification.ts";

function manifest(id, title, clipUrl = "/clip.mp4") {
  return {
    id,
    version: 2,
    createdAt: new Date(0).toISOString(),
    status: "ROUGH_CUT_READY",
    platform: "Instagram Reels",
    aspectRatio: "9:16",
    requestedDurationSec: 8,
    plannedDurationSec: 8,
    topic: title,
    tone: "Confident & conversational",
    masterScript: "A durable master script.",
    creativeBible: {
      visualStyle: "test",
      characterLock: "test",
      wardrobeLock: "test",
      environmentLock: "test",
      cameraLanguage: "test",
      colorLanguage: "test",
    },
    audio: {
      masterClock: "narration",
      narrationUrl: "/narration.wav",
      musicUrl: "/music.wav",
      actualDurationSec: 8,
      timingSource: "actual-alignment",
      alignmentValidation: { expectedWords: 1, actualWords: 1, wer: 0, coverage: 1, passed: true },
      wordTimings: [{ id: "word_0001", word: "A", startSec: 0, endSec: 0.2 }],
    },
    captions: { timingSource: "actual-alignment", safeZoneProfile: "instagram-reels", cues: [] },
    shots: [{
      id: "shot_01",
      order: 1,
      editorialStartSec: 0,
      editorialDurationSec: 8,
      generationDurationSec: 8,
      trimInSec: 0,
      trimOutSec: 8,
      scriptText: "A durable master script.",
      visualIntent: "test",
      generationPrompt: "test",
      continuityIn: { referenceFrameUrl: "/ref.png" },
      continuityOut: {},
      transitionOut: { type: "hard-cut", durationSec: 0 },
      dependsOnShotIds: [],
      status: "GENERATED",
      asset: { videoUrl: clipUrl, actualDurationSec: 8 },
      qa: { warnings: [], failures: [] },
    }],
    outputs: {
      narratedRoughCut: { videoUrl: "/reel.mp4", actualDurationSec: 8, kind: "narrated-rough-cut", renderedAt: new Date(0).toISOString() },
      master: { videoUrl: "/master.mp4", actualDurationSec: 8, kind: "master", renderedAt: new Date(0).toISOString() },
    },
    qa: { minimumReadyScore: 90, passed: true, warnings: [], failures: [] },
    continuity: { characters: [], environments: [], performanceTracks: [], boundaries: [], objectStateGraph: {} },
  };
}

const projectA = manifest("studio1_aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "Everest");
const projectB = manifest("studio1_bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", "Lincoln");
const a = buildReelArtifactIndex(projectA);
const b = buildReelArtifactIndex(projectB);

assert.equal(a[0].id, projectA.id, "project keeps its immutable durable ID");
assert.equal(a[0].canonicalPath, canonicalArtifactPath(projectA.id), "project gets a canonical artifact URL");
assert.equal(new Set(a.map(item => item.id)).size, a.length, "every artifact inside one project must have a unique global ID");
assert.equal(new Set([...a, ...b].map(item => item.id)).size, a.length + b.length, "artifact IDs must remain unique across projects even when local shot IDs repeat");

const scriptA = a.find(item => item.role === "master-script");
const clipA = a.find(item => item.kind === "clip");
const clipB = b.find(item => item.kind === "clip");
assert.ok(scriptA?.id.startsWith("doc."), "master script is a first-class document artifact");
assert.ok(clipA?.id.startsWith("clip."), "generated clip is a first-class artifact");
assert.notEqual(clipA?.id, clipB?.id, "shot_01 from two projects must never collide");
assert.equal(parseScopedArtifactId(clipA.id)?.projectId, projectA.id, "artifact ID must self-resolve to its parent project");
assert.equal(parseScopedArtifactId(clipA.id)?.sourceKey, "shot_01", "artifact ID must self-resolve to its local source key");

const sameScriptAfterRename = scopedArtifactId("document", projectA.id, "master-script");
projectA.topic = "Everest renamed";
assert.equal(scopedArtifactId("document", projectA.id, "master-script"), sameScriptAfterRename, "renaming must never change artifact identity");

const diagram1 = newArtifactId("diagram");
const diagram2 = newArtifactId("diagram");
const document1 = newArtifactId("document");
assert.ok(diagram1.startsWith("dgm."), "standalone diagrams must use the diagram identity namespace");
assert.ok(document1.startsWith("doc."), "standalone documents must use the document identity namespace");
assert.notEqual(diagram1, diagram2, "standalone artifact IDs must be globally unique");
assert.ok(canonicalArtifactPath(diagram1).startsWith("/artifact/"), "every artifact ID must have a canonical URL path");

const attached = attachReelArtifactIndex(manifest("studio1_cccccccc-cccc-cccc-cccc-cccccccccccc", "Backfill"));
assert.equal(attached.artifact.id, attached.id, "manifest enrichment must backfill project identity");
assert.ok(attached.artifacts.some(item => item.kind === "document"), "manifest enrichment must backfill document identities");
assert.ok(attached.artifacts.some(item => item.kind === "clip"), "manifest enrichment must backfill clip identities");

const legacyManifest = attachReelArtifactIndex(manifest("studio1_dddddddd-dddd-dddd-dddd-dddddddddddd", "Legacy"));
assert.ok(legacyManifest.artifacts.some(item => item.kind === "reel"), "fixture must begin with Reel artifacts present");
const suppressed = suppressUncertifiedStudio1Outputs({
  id: legacyManifest.id,
  revision: 1,
  manifest: legacyManifest,
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
});
assert.equal(suppressed.manifest.outputs?.narratedRoughCut, undefined, "uncertified Full Reel output must be suppressed");
assert.equal(suppressed.manifest.outputs?.master, undefined, "uncertified master output must be suppressed");
assert.ok(!suppressed.manifest.artifacts?.some(item => item.kind === "reel"), "suppressed legacy Reel must not leak through canonical artifact descriptors");

const storeSource = fs.readFileSync("lib/reel/productionStore.ts", "utf8");
const apiSource = fs.readFileSync("app/api/artifacts/[id]/route.ts", "utf8");
const pageSource = fs.readFileSync("app/artifact/[id]/page.tsx", "utf8");
assert.ok(storeSource.includes("normalizePersistedReelManifest") && storeSource.includes("normalizeManifest"), "all persisted Reel create/read/replace paths must pass through compatibility-safe artifact identity enrichment");
assert.ok(apiSource.includes("resolveArtifact"), "canonical artifact API must resolve IDs directly");
assert.ok(pageSource.includes("Canonical Zyvoriq artifact"), "canonical artifact URL must have a human-readable viewer");

console.log("Universal artifact identity QA passed");
