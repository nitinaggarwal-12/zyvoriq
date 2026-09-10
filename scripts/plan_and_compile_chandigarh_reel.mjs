try {
  process.loadEnvFile('.env.local');
} catch {}

import pg from 'pg';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { planStudio1 } from '../lib/studio1/planner.ts';
import { generateLyriaBackgroundMusic } from '../lib/ai/lyriaService.ts';

function getPool() {
  const conn = process.env.DATABASE_URL || process.env.POSTGRES_URL || "postgresql://postgres:pncyiYBLwkzpdbCTqOySjcmAofiHjLLL@altaria.proxy.rlwy.net:35535/railway";
  return new pg.Pool({ connectionString: conn });
}

async function main() {
  console.log('========================================================================');
  console.log('🎬 GOOGLE OMNI & DEEPMIND LYRIA: CHANDIGARH COLLEGE GIRL MUSIC VIDEO');
  console.log('========================================================================\n');

  process.env.GEMINI_SCRIPT_MODEL = "gemini-2.5-pro";

  // STEP 1: Physically Invoke Google DeepMind Lyria for Top-Tier Lyrics & Music
  console.log('🎵 [Step 1: DeepMind Lyria] Calling models/lyria-3.5 for song arrangement & lyrics...');
  const lyriaPrompt = "Top-charting Indian Punjabi pop dance anthem with live dhol drums, vibrant Scandinavian brass stabs, soaring Punjabi female vocal hooks, driving 128 BPM electronic festival beat, and electric concert ambience. Equivalent to top music videos from India (Diljit Dosanjh, AP Dhillon, Sunanda Sharma standard). High energy, authentic Punjabi and Hinglish colloquial lyrics, no filler.";

  const lyriaMusic = await generateLyriaBackgroundMusic({
    prompt: lyriaPrompt,
    musicPreset: "chandigarh_denmark_fusion",
    vocalStyle: "latin_pop_belt",
    vocalMode: "character_singing",
    tier: "pro",
    duration: 30
  });

  console.log(`\n✅ Lyria Preset Selected: ${lyriaMusic?.presetName}`);
  console.log(`   Tempo: ${lyriaMusic?.bpm} BPM | Key: ${lyriaMusic?.keySignature}`);
  console.log(`   Instruments: ${(lyriaMusic?.sections?.[0]?.name ? "Dhol, Brass, Synths, Strings" : "Live Dhol, Scandinavian Brass, Synth Drops")}`);
  console.log(`   Lyria Lyrics Generated: ${lyriaMusic?.lyrics?.length || 0} lines\n`);

  if (lyriaMusic?.lyrics?.length) {
    console.log('--- 📜 DeepMind Lyria Master Lyrics ---');
    lyriaMusic.lyrics.forEach((l, idx) => console.log(`   [Line ${idx + 1}] ${l}`));
    console.log('---------------------------------------\n');
  }

  // STEP 2: Invoke Google Omni Directorial Compilation (gemini-2.5-pro)
  console.log('🎬 [Step 2: Google Omni] Invoking Omni Directorial Compilation (gemini-2.5-pro)...');

  const lyricsContext = lyriaMusic?.lyrics?.length
    ? `\nAuthentic Song Lyrics from DeepMind Lyria:\n${lyriaMusic.lyrics.slice(0, 12).join("\n")}`
    : "";

  const topic = `Top-charting Indian Punjabi pop dance music video featuring a charismatic 21-year-old Punjabi college girl from Chandigarh (named Jasleen) performing as lead vocalist and dancer on a grand festival concert stage.
Styling & Wardrobe: Modern Western summer attire from Denmark (Ganni-inspired buttercup-yellow structured linen halter waistcoat crop top with open back tie detailing, paired with wide-leg breezy ecru tailored summer linen trousers, sleek minimalist silver hoop earrings, traditional silver Sikh kadha on right wrist, barefoot with delicate silver ghungroo bells on ankles).
Choreography & Performance: High-energy collegiate Punjabi dance performance—dynamic shoulder-bounce bhangra hops, rhythmic pelvic and hip isolations, expressive mudras, and confident swagger with radiant charisma, singing passionately into the camera.
Staged Live Band & Orchestra: Physically staged on illuminated tiered risers flanking the runway are live Punjabi Dhol drummers in crisp white shirts and orange turbans, alongside a live modern brass section (saxophone and trumpet players in casual modern suits) and live synth/keyboard performers.
Stage Lighting & Ambience: Full stadium concert production—dramatic stage lightning with rapid-fire white strobe bursts, warm amber spotlighting, volumetric cyan laser cones piercing through concert haze, and vertical cold-spark pyrotechnic fountains firing symmetrically on beat drops.
Perpetually wet reflective stage floor acting as a liquid mirror reflecting stage lights and drummers.
Strict negative constraints: Zero traditional salwar kameez (must be Danish modern summer attire), zero on-screen text, zero subtitles, zero captions, zero watermarks. Strict character wardrobe and facial biometric continuity across all shots.${lyricsContext}`;

  const input = {
    topic,
    genre: 'MUSIC_VIDEO',
    language: 'hinglish-roman',
    requestedDurationSec: 30,
  };

  const manifest = await planStudio1(input);

  console.log(`\n✅ Omni Manifest ID: ${manifest.id}`);
  console.log(`   Planned Duration: ${manifest.plannedDurationSec}s across ${manifest.shots.length} shots`);
  console.log(`   Genre: ${manifest.genre} | Audio Strategy: ${manifest.audioStrategy || 'native'}`);

  // Save the complete Omni plan to a dedicated markdown artifact
  const outDir = path.resolve('scratch/chandigarh_denmark_production');
  fs.mkdirSync(outDir, { recursive: true });

  const planMarkdownPath = path.join(outDir, 'OMNI_DIRECTORIAL_EXECUTION_PLAN.md');
  const planData = {
    productionId: manifest.id,
    topic: manifest.topic,
    lyriaMusic,
    manifest,
  };

  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(planData, null, 2));
  console.log(`\n📁 Manifest saved to ${outDir}/manifest.json`);

  // Print summary of shots
  console.log('\n--- 🎥 Omni Shot Breakdown ---');
  for (const s of manifest.shots) {
    console.log(`\n[Shot ${s.id}] Editorial: ${s.editorialDurationSec}s (Gen Bucket: ${s.generationDurationSec}s)`);
    console.log(`   Grammar: ${s.shotGrammar} | Eyeline: ${s.eyeline}`);
    console.log(`   Camera: ${s.cameraMotion}`);
    console.log(`   Action: ${s.visualAction?.slice(0, 140)}...`);
    console.log(`   Vocal / Script: "${s.scriptText || ''}"`);
    console.log(`   Prompt Word Count: ${s.generationPrompt?.split(/\s+/).length} words`);
  }
  console.log('\n========================================================================');
  console.log('✅ Omni Directorial Planning Pass Successfully Completed.');
  console.log('========================================================================');
}

main().catch(err => {
  console.error("Fatal Error in main:", err);
  process.exit(1);
});
