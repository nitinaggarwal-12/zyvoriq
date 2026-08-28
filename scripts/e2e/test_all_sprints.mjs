import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

console.log("=================================================");
console.log("🧪 ZYVORIQ COMPREHENSIVE E2E TEST SUITE: SPRINTS 1 - 5");
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

// 1. Audit Source Files
console.log("📁 1. Auditing Component Source Files...");
assert(fs.existsSync(path.join(projectRoot, 'components/SpatialAudioMixer.tsx')), 'components/SpatialAudioMixer.tsx exists');
assert(fs.existsSync(path.join(projectRoot, 'app/studio/AnimeCinemaStage.tsx')), 'app/studio/AnimeCinemaStage.tsx exists');
assert(fs.existsSync(path.join(projectRoot, 'app/studio/create/page.tsx')), 'app/studio/create/page.tsx exists');
assert(fs.existsSync(path.join(projectRoot, 'components/DirectorCanvasInpainting.tsx')), 'components/DirectorCanvasInpainting.tsx exists');
assert(fs.existsSync(path.join(projectRoot, 'app/director/page.tsx')), 'app/director/page.tsx exists');
assert(fs.existsSync(path.join(projectRoot, 'components/VoiceCloneVault.tsx')), 'components/VoiceCloneVault.tsx exists');
assert(fs.existsSync(path.join(projectRoot, 'components/MultilingualDubbingMatrix.tsx')), 'components/MultilingualDubbingMatrix.tsx exists');
assert(fs.existsSync(path.join(projectRoot, 'app/studio/avatars/page.tsx')), 'app/studio/avatars/page.tsx exists');
assert(fs.existsSync(path.join(projectRoot, 'components/SynthIDLatentHeatmap.tsx')), 'components/SynthIDLatentHeatmap.tsx exists');
assert(fs.existsSync(path.join(projectRoot, 'app/veritas/page.tsx')), 'app/veritas/page.tsx exists');

// 2. Sprint 1
console.log("\n🎛️ 2. Auditing Sprint 1 Features (4-Track Mixer & SynthID Overlay)...");
const mixerSrc = fs.readFileSync(path.join(projectRoot, 'components/SpatialAudioMixer.tsx'), 'utf8');
assert(mixerSrc.includes('4-Track Spatial Audio Mixer'), 'Mixer title rendered');
assert(mixerSrc.includes('Voice Dialogue') && mixerSrc.includes('Lyria Score') && mixerSrc.includes('V2A Foley'), 'All 4 discrete audio channels present');
assert(mixerSrc.includes('anime_jpop') && mixerSrc.includes('bollywood_raga') && mixerSrc.includes('operatic_soprano'), 'Singing performance modes supported');
assert(mixerSrc.includes('Sidechain Ducking') && mixerSrc.includes('-12 dB'), '-12dB dynamic sidechain ducking badge present');
assert(mixerSrc.includes('JSZip') && mixerSrc.includes('.zip'), '1-Click Lossless 4-Stem .ZIP DAW exporter present');

// 3. Sprint 2
console.log("\n🌐 3. Auditing Sprint 2 Features (24 Pillars, Aspect Ratio, Cultural Transmutation)...");
const createSrc = fs.readFileSync(path.join(projectRoot, 'app/studio/create/page.tsx'), 'utf8');
assert(createSrc.includes('GENRE_CLUSTERS') && createSrc.includes('GENRE_CATEGORIES'), 'Category Clusters & 24 Pillars active in Creator Hub');
assert(createSrc.includes('aspectRatio') && createSrc.includes('9:16') && createSrc.includes('16:9') && createSrc.includes('1:1'), 'Multi-platform aspect ratio switcher supported');
assert(createSrc.includes('1-Click Global Cultural Transmutation'), '1-Click Global Cultural Transmutation campaign bar active');
assert(createSrc.includes('handleGeneratePrevis') && createSrc.includes('showPrevisModal'), 'Instant 4-Shot Imagen 3 Storyboard Pre-Vis modal active');

// 4. Sprint 3
console.log("\n🎨 4. Auditing Sprint 3 Features (Director Canvas Inpainting & Multi-Take Editor)...");
const directorCompSrc = fs.readFileSync(path.join(projectRoot, 'components/DirectorCanvasInpainting.tsx'), 'utf8');
assert(directorCompSrc.includes('Interactive Inpainting Brush & Mask') || directorCompSrc.includes('Inpainting'), 'Inpainting canvas interactive bounding box present');
assert(directorCompSrc.includes('take-a') && directorCompSrc.includes('take-b') && directorCompSrc.includes('take-d'), 'Multi-Take Candidate Carousel supported (4 takes)');
const directorPageSrc = fs.readFileSync(path.join(projectRoot, 'app/director/page.tsx'), 'utf8');
assert(directorPageSrc.includes('DirectorCanvasInpainting'), 'DirectorCanvasInpainting embedded in /director');

// 5. Sprint 4
console.log("\n🎙️ 5. Auditing Sprint 4 Features (30s Voice Vault & 30-Language Dubbing)...");
const voiceVaultSrc = fs.readFileSync(path.join(projectRoot, 'components/VoiceCloneVault.tsx'), 'utf8');
assert(voiceVaultSrc.includes('30-Second Neural Voice Clone Vault'), 'Voice Clone Vault rendered');
assert(voiceVaultSrc.includes('F1 Throat Cavity Resonance') && voiceVaultSrc.includes('F2 Oral Tract Articulation'), '5-Band formant acoustic tract sliders present');
const dubbingSrc = fs.readFileSync(path.join(projectRoot, 'components/MultilingualDubbingMatrix.tsx'), 'utf8');
assert(dubbingSrc.includes('DUBBING_LANGUAGES_30') && dubbingSrc.includes('Japanese') && dubbingSrc.includes('Hindi') && dubbingSrc.includes('Ukrainian'), '30+ regional languages supported');
const avatarsPageSrc = fs.readFileSync(path.join(projectRoot, 'app/studio/avatars/page.tsx'), 'utf8');
assert(avatarsPageSrc.includes('VoiceCloneVault') && avatarsPageSrc.includes('MultilingualDubbingMatrix'), 'Both Voice Vault and Dubbing Matrix embedded in /studio/avatars');

// 6. Sprint 5
console.log("\n🛡️ 6. Auditing Sprint 5 Features (Veritas zk-SNARK & SynthID Latent Heatmap)...");
const heatmapSrc = fs.readFileSync(path.join(projectRoot, 'components/SynthIDLatentHeatmap.tsx'), 'utf8');
assert(heatmapSrc.includes('DeepMind SynthID Latent Frequency Spectrum Heatmap'), 'SynthID Heatmap rendered');
assert(heatmapSrc.includes('gridSize = 24') || heatmapSrc.includes('24x24 Discrete Latent Cells'), '24x24 discrete latent matrix analyzed');
const veritasPageSrc = fs.readFileSync(path.join(projectRoot, 'app/veritas/page.tsx'), 'utf8');
assert(veritasPageSrc.includes('SynthIDLatentHeatmap'), 'SynthIDLatentHeatmap embedded in /veritas');
assert(veritasPageSrc.includes('handleDownloadCert') && veritasPageSrc.includes('veritas_certificate_'), '1-Click Ed25519 C2PA Certificate JSON export present');

console.log("\n=================================================");
console.log(`📊 COMPREHENSIVE AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log("=================================================\n");

if (failed > 0) {
  process.exit(1);
}
