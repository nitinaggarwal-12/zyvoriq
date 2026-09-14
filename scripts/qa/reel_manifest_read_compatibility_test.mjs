import assert from "node:assert/strict";
import { buildReelArtifactIndex } from "../../lib/artifact/identity.ts";
import {
  collectValidStoredProductions,
  normalizePersistedReelManifest,
} from "../../lib/reel/manifestCompatibility.ts";
import { suppressUncertifiedStudio1Outputs } from "../../lib/studio1/fullReelCertification.mjs";

function legacyManifest(id, version = 1) {
  return {
    id,
    version,
    topic: "Legacy production",
    outputs: {
      narratedRoughCut: {
        videoUrl: "/legacy-reel.mp4",
      },
    },
  };
}

const withoutAudioOrShots = legacyManifest("studio1_legacy_missing_media_shape");
assert.doesNotThrow(() => buildReelArtifactIndex(withoutAudioOrShots));

const normalizedLegacy = normalizePersistedReelManifest(withoutAudioOrShots);
assert.equal(normalizedLegacy.id, withoutAudioOrShots.id);
assert.ok(normalizedLegacy.artifacts.some(artifact => artifact.kind === "reel"));

const incompleteV2 = normalizePersistedReelManifest(legacyManifest("studio1_incomplete_v2", 2));
assert.equal(incompleteV2.id, "studio1_incomplete_v2");

const recoveredId = normalizePersistedReelManifest({ version: 1, topic: "ID recovered from row" }, "studio1_row_id");
assert.equal(recoveredId.id, "studio1_row_id");

const invalidRows = [];
const hydrated = collectValidStoredProductions(
  [
    { id: "studio1_healthy", manifest_json: legacyManifest("studio1_healthy") },
    { id: "studio1_corrupt", manifest_json: null },
    { id: "studio1_recovered", manifest_json: { version: 1, topic: "Recovered" } },
  ],
  row => normalizePersistedReelManifest(row.manifest_json, row.id),
  row => invalidRows.push(row.id),
);
assert.deepEqual(hydrated.map(manifest => manifest.id), ["studio1_healthy", "studio1_recovered"]);
assert.deepEqual(invalidRows, ["studio1_corrupt"]);

const suppressed = suppressUncertifiedStudio1Outputs({
  id: normalizedLegacy.id,
  revision: 1,
  manifest: normalizedLegacy,
});
assert.equal(suppressed.manifest.outputs?.narratedRoughCut, undefined);

console.log("Reel manifest read compatibility QA passed");
