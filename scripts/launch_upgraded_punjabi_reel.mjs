try {
  process.loadEnvFile('.env.local');
} catch {}

import pg from 'pg';
import crypto from 'crypto';
import { planStudio1 } from '../lib/studio1/planner.ts';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL });

async function main() {
  console.log('[launch] Planning upgraded 30s Punjabi Pop Music Video reel with Musical Bar Grid & Live Dhol staging...');

  const input = {
    topic: 'Modern Punjabi Pop Music Video featuring South Asian female college performers Simran and Harleen singing and dancing on a campus festival stage with driving live dhol beats and cold-spark pyrotechnics',
    genre: 'MUSIC_VIDEO',
    language: 'hinglish-roman',
    requestedDurationSec: 30,
    scriptText: 'Simran: Bass drop hua jab bajaa dhol, saare campus mein machaa de shor! Harleen: Nachde saare mundey kudiyaan, beat te hil gaya har floor! Simran: Wakhra swag sadda dekh le yaar, toofaan macha de dhol de naal! Harleen: Thumke pe hilta hai poora sheher, aaja tu bhi nach soniya! Simran: Sadda challeya campus te raaj, aao nacho saare dhol naal!'
  };

  const manifest = await planStudio1(input);
  console.log(`[launch] Generated Manifest ID: ${manifest.id}`);
  console.log(`[launch] Planned Duration: ${manifest.plannedDurationSec}s across ${manifest.shots.length} shots`);
  for (const s of manifest.shots) {
    console.log(`- ${s.id}: editorial=${s.editorialDurationSec}s, gen=${s.generationDurationSec}s`);
    console.log(`  Prompt snippet: ${s.generationPrompt.slice(0, 140)}...`);
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
  console.log(`[launch] Production saved to Postgres: ${prodId} (Rev: ${revision})`);

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
  await pool.end();
}

main().catch(err => {
  console.error('[launch] Error:', err);
  process.exit(1);
});
