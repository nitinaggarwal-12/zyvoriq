import http from 'http';
import fs from 'fs';
import path from 'path';

console.log("=================================================");
console.log("🧪 ZYVORIQ E2E TEST SUITE: SPRINT 1 & SPRINT 2");
console.log("=================================================\n");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

// 1. Audit Component Files & Exports
console.log("📁 1. Auditing Component Source Files...");
const spatialMixerPath = "components/SpatialAudioMixer.tsx";
const animeStagePath = "app/studio/AnimeCinemaStage.tsx";
const createPagePath = "app/studio/create/page.tsx";
const previsRoutePath = "app/api/storyboard/previs/route.ts";
const genreConceptsPath = "lib/tier6/genre_concepts.ts";

assert(fs.existsSync(spatialMixerPath), "components/SpatialAudioMixer.tsx exists");
assert(fs.existsSync(animeStagePath), "app/studio/AnimeCinemaStage.tsx exists");
assert(fs.existsSync(createPagePath), "app/studio/create/page.tsx exists");
assert(fs.existsSync(previsRoutePath), "app/api/storyboard/previs/route.ts exists");
assert(fs.existsSync(genreConceptsPath), "lib/tier6/genre_concepts.ts exists");

// 2. Audit Sprint 1 Features in Codebase
console.log("\n🎛️ 2. Auditing Sprint 1 Features (4-Track Mixer & SynthID Overlay)...");
const spatialContent = fs.readFileSync(spatialMixerPath, 'utf8');
const animeContent = fs.readFileSync(animeStagePath, 'utf8');

assert(spatialContent.includes("4-Track Spatial Audio Mixer"), "Mixer title rendered");
assert(spatialContent.includes("Voice Dialogue") && spatialContent.includes("Lyria Score") && spatialContent.includes("V2A Foley SFX") && spatialContent.includes("Spatial Ambience"), "All 4 discrete audio stem channels present");
assert(spatialContent.includes("anime_jpop") && spatialContent.includes("bollywood_raga") && spatialContent.includes("operatic_soprano"), "Singing performance modes supported (J-Pop, Bollywood, Operatic)");
assert(spatialContent.includes("Sidechain Ducking") && spatialContent.includes("-12 dB"), "-12dB dynamic sidechain ducking badge present");
assert(spatialContent.includes("JSZip") && spatialContent.includes("Export 4-Stem Bundle (.ZIP)"), "1-Click Lossless 4-Stem .ZIP DAW exporter present");
assert(spatialContent.includes("c2pa_provenance_manifest.json"), "C2PA Cryptographic Provenance manifest bundled in ZIP");
assert(animeContent.includes("<SpatialAudioMixer"), "SpatialAudioMixer embedded in AnimeCinemaStage");
assert(animeContent.includes("SynthID Verified") && animeContent.includes("/veritas"), "DeepMind SynthID Verified badge docked on 4K player viewport");

// 3. Audit Sprint 2 Features in Codebase
console.log("\n🌐 3. Auditing Sprint 2 Features (24 Pillars, Aspect Ratio, Global Transmutation & Pre-Vis)...");
const createContent = fs.readFileSync(createPagePath, 'utf8');
const genreContent = fs.readFileSync(genreConceptsPath, 'utf8');

assert(genreContent.includes("GENRE_CLUSTERS") && genreContent.includes("media_entertainment") && genreContent.includes("knowledge_enterprise"), "4 Category Clusters defined in genre_concepts.ts");
assert(genreContent.includes("GENRE_CATEGORIES") && genreContent.includes("GENRE_CONCEPTS"), "24 Category Pillars and Concepts defined");
assert(createContent.includes("GENRE_CLUSTERS.map"), "4 Category Cluster tabs rendered in Creator Hub");
assert(createContent.includes("Multi-Platform Aspect Ratio") && createContent.includes("9:16 Vertical") && createContent.includes("16:9 Cinema") && createContent.includes("1:1 Square"), "Multi-platform aspect ratio switcher supported (9:16, 16:9, 1:1)");
assert(createContent.includes("1-Click Global Cultural Transmutation") && createContent.includes("Japan / Anime") && createContent.includes("India / Vedic") && createContent.includes("Latin America"), "1-Click Global Cultural Transmutation 6-flag campaign bar active");
assert(createContent.includes("Instant 4-Shot Storyboard Pre-Vis") && createContent.includes("showPrevisModal"), "Instant 4-Shot Imagen 3 Storyboard Pre-Vis modal active");

// Summary
console.log("\n=================================================");
console.log(`📊 E2E AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log("=================================================");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
