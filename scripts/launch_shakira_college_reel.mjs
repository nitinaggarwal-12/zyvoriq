try {
  process.loadEnvFile('.env.local');
} catch {}

import pg from 'pg';
import crypto from 'crypto';
import { planStudio1 } from '../lib/studio1/planner.ts';
import { generateLyriaBackgroundMusic } from '../lib/ai/lyriaService.ts';

function getPool() {
  const conn = process.env.DATABASE_URL || process.env.POSTGRES_URL || "postgresql://postgres:pncyiYBLwkzpdbCTqOySjcmAofiHjLLL@altaria.proxy.rlwy.net:35535/railway";
  return new pg.Pool({ connectionString: conn });
}

async function main() {
  try {
    process.loadEnvFile('.env.local');
  } catch {}
  const pool = getPool();
  console.log('[launch] ========================================================================');
  console.log('[launch] STEP 1: Physically Invoking DeepMind Lyria 3 Pro for Song Arrangement...');
  console.log('[launch] ========================================================================');

  process.env.GEMINI_SCRIPT_MODEL = "gemini-2.5-pro";

  const lyriaMusic = await generateLyriaBackgroundMusic({
    prompt: "High energy Latin-Pop and Bollywood festival dance anthem with live dhol drums, Latin timbales, flamenco acoustic guitar, brass stabs, and driving 128 BPM bassline. Verse-Chorus-Hook structure with English and Hindi festival singing for young Indian women performers dancing on a concert stage.",
    musicPreset: "latin_indian_fusion",
    vocalStyle: "latin_pop_belt",
    vocalMode: "character_singing",
    tier: "pro",
    duration: 30
  });

  console.log(`[launch] Lyria Preset: ${lyriaMusic?.presetName} (${lyriaMusic?.bpm} BPM, Key: ${lyriaMusic?.keySignature})`);
  console.log(`[launch] Lyria Lyrics generated: ${lyriaMusic?.lyrics?.length || 0} lines`);
  if (lyriaMusic?.lyrics?.length) {
    lyriaMusic.lyrics.slice(0, 6).forEach((line, idx) => console.log(`   [Lyric ${idx + 1}] ${line}`));
  }

  console.log('\n[launch] ========================================================================');
  console.log('[launch] STEP 2: Invoking Google Omni Directorial Pass (gemini-2.5-pro)...');
  console.log('[launch] ========================================================================');

  const lyricsContext = lyriaMusic?.lyrics?.length
    ? `\nSong Lyrics from DeepMind Lyria:\n${lyriaMusic.lyrics.slice(0, 10).join("\n")}`
    : "";

  const topic = `Commercial Latin-Indian pop dance music video featuring two charismatic South Asian female college performers (Priya and Riya) dancing barefoot on a glossy wet concert stage with silver ghungroos/anklets, dynamic pelvic/hip isolations, belly dancing shimmies, synchronized power catwalk, hair flips, and water splash slow-motion.
Musical Arrangement: 128 BPM Latin-Desi pop fusion with live Punjabi Dhol drummers and Latin percussionists visible flanking the runway behind the performers, stadium concert strobes, cyan/magenta volumetric lasers, and cold-spark pyrotechnics.
Performers wear matching vibrant turquoise-cyan metallic sequined festival crop tops and flowing white silk harem dance pants with silver mirrorwork across all shots. Barefoot with silver ghungroos. Strict wardrobe continuity: zero costume color changes. Strict negative constraint: zero on-screen text, no burned-in subtitles, no captions, no typography.${lyricsContext}`;

  const input = {
    topic,
    genre: 'MUSIC_VIDEO',
    language: 'hinglish-roman',
    requestedDurationSec: 30,
    // scriptText omitted to FORCE compileOmniDirectorialPass (gemini-2.5-pro) to direct
  };

  const manifest = await planStudio1(input);
  console.log(`[launch] Generated Manifest ID: ${manifest.id}`);
  console.log(`[launch] Planned Duration: ${manifest.plannedDurationSec}s across ${manifest.shots.length} shots`);
  console.log(`[launch] Cast Members (${manifest.continuity?.characters?.length || 0}):`);
  for (const c of manifest.continuity?.characters || []) {
    console.log(`  - ${c.name} (${c.id}): ${c.wardrobe?.costume?.slice(0, 80)}...`);
  }

  console.log(`\n[launch] Planned Shots:`);
  for (const s of manifest.shots) {
    console.log(`- ${s.id}: editorial=${s.editorialDurationSec}s, gen=${s.generationDurationSec}s, grammar=${s.shotGrammar}`);
    console.log(`  Script: "${s.scriptText || ''}"`);
    console.log(`  Prompt (${s.generationPrompt?.split(/\\s+/).length} words): ${s.generationPrompt?.slice(0, 150)}...`);
  }

  // Save to reel_productions
  const prodId = manifest.id;
  const insertProd = `
    INSERT INTO reel_productions (id, manifest_json, revision, created_at, updated_at)
    VALUES ($1, $2, 1, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
      manifest_json = EXCLUDED.manifest_json,
      revision = reel_productions.revision + 1,
      updated_at = NOW()
    RETURNING revision;
  `;
  const prodRes = await pool.query(insertProd, [
    prodId,
    JSON.stringify(manifest)
  ]);
  const revision = prodRes.rows[0].revision;
  console.log(`\n[launch] Production saved to Postgres: ${prodId} (Rev: ${revision})`);

  // Register production control
  const generationToken = crypto.randomUUID();
  await pool.query(`
    INSERT INTO reel_production_controls (production_id, generation_token, priority, updated_at)
    VALUES ($1, $2, 10, NOW())
    ON CONFLICT (production_id) DO UPDATE SET
      generation_token = EXCLUDED.generation_token,
      cancelled_at = NULL,
      superseded_by = NULL,
      priority = 10,
      updated_at = NOW()
  `, [prodId, generationToken]);
  console.log(`[launch] Registered reel_production_controls with token: ${generationToken}`);

  // Enqueue root operation: NARRATION
  const opId = `rop_${crypto.randomUUID()}`;
  const opPayload = {
    genre: manifest.genre || 'MUSIC_VIDEO',
    studio1: true,
    audioStrategy: 'native',
    language: manifest.language || 'hinglish-roman',
    generationToken: generationToken,
    manifestRevision: revision,
    semanticFingerprint: crypto.randomBytes(12).toString('hex')
  };

  const insertOp = `
    INSERT INTO reel_operations (id, production_id, kind, target_id, idempotency_key, status, attempt, payload_json, created_at, updated_at)
    VALUES ($1, $2, 'NARRATION', NULL, $3, 'QUEUED', 0, $4, NOW(), NOW())
    RETURNING id;
  `;
  const opKey = `${prodId}:${opPayload.generationToken}:NARRATION:production:${revision}:${opPayload.semanticFingerprint}`;
  const opRes = await pool.query(insertOp, [opId, prodId, opKey, JSON.stringify(opPayload)]);
  console.log(`[launch] Queued root NARRATION op: ${opRes.rows[0].id}`);

  console.log(`\nDirect Studio URL: https://zyvoriq.up.railway.app/studio?id=${prodId}`);
  console.log(`Local URL: http://localhost:3000/studio?id=${prodId}`);

  await pool.end();
  return prodId;
}

main().catch(err => {
  console.error('[launch] Error:', err);
  process.exit(1);
});
