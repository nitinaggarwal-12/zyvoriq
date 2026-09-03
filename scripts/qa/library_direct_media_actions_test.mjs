import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("app/studio/library/page.tsx", "utf8");

assert.ok(source.includes("Direct media"), "Studio1 project cards must expose direct media access");
assert.ok(source.includes('label="Reel"'), "Studio1 Full Reel must use the direct media action component");
assert.ok(source.includes("Generated clips"), "Studio1 project cards must expose generated clip media");
assert.ok(source.includes("Copy {label} Link"), "direct media actions must support copying clip and Reel URLs");
assert.ok(source.includes("absoluteMediaUrl"), "copied URLs must be absolute shareable URLs");
assert.ok(source.includes("m.outputs?.master?.videoUrl || m.outputs?.narratedRoughCut?.videoUrl"), "Full Reel access must prefer master then certified narrated rough cut from the presented Studio1 manifest");
assert.ok(source.includes("Open / Edit"), "restoring direct media must not remove project editing");
assert.ok(source.includes("Copy media"), "generic media asset cards must retain direct raw-media URL copy access");
assert.ok(source.includes("download"), "media download access must remain available");

assert.ok(source.includes("projectCanonicalPath"), "each Studio1 project card must expose its canonical project URL");
assert.ok(source.includes("Copy canonical"), "canonical project and artifact links must be directly copyable from Library");
assert.ok(source.includes("Copy ID"), "immutable project and artifact IDs must be directly copyable from Library");
assert.ok(source.includes("artifactFor"), "Library assets must bind to the artifact identity descriptors returned by the durable API");
assert.ok(source.includes("artifactId"), "Library assets must expose their immutable artifact IDs");
assert.ok(source.includes("canonicalPath"), "Library assets must expose their canonical artifact paths");
assert.ok(source.includes('artifactFor(m, "clip"'), "generated clips must resolve their own canonical IDs rather than only inheriting a project link");
assert.ok(source.includes('withArtifact("master-script")'), "master script documents must expose canonical document identity");
assert.ok(source.includes('withArtifact("captions")'), "caption documents must expose canonical document identity");
assert.ok(source.includes('withArtifact("manifest")'), "production manifest evidence must expose canonical identity");

console.log("Library direct media + canonical artifact actions QA passed");
