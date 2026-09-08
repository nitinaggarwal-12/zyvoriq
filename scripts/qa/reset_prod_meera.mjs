import pg from "pg";

const pool = new pg.Pool({
  connectionString: "postgresql://postgres:pncyiYBLwkzpdbCTqOySjcmAofiHjLLL@altaria.proxy.rlwy.net:35535/railway"
});

const prodId = "studio1_bf0f7660-27c3-4aea-9229-ede2e41f2c3a";

async function main() {
  const pRes = await pool.query("SELECT manifest_json, revision FROM reel_productions WHERE id = $1", [prodId]);
  const manifest = pRes.rows[0]?.manifest_json;
  if (!manifest) throw new Error("Manifest not found");

  for (const s of manifest.shots) {
    if (s.generationPrompt) {
      s.generationPrompt = s.generationPrompt
        .replace(/STUDIO1 IDENTITY LOCK \[[^\]]+\]:\s*The canonical character reference for [^,.]+(?:,\s*|\.\s*)[^.]*\./gi,
          "STUDIO1 IDENTITY LOCK [lead_performer]: The attached canonical character reference image is authoritative for this shot. Physical description: mid 20s, piercing almond eyes, razor-sharp smile, radiant warm complexion, tight cornrow braids threaded with silver rings into a high ponytail. Identity continuity is mandatory: identical face, age, skin tone, hair, body proportions, wardrobe and distinguishing features. Do not substitute, cast, morph into, or introduce a different actor.")
        .replace(/\bMeera\b/g, "the drummer")
        .replace(/\bAarav\b/g, "the dancer");
    }
  }

  await pool.query(
    "UPDATE reel_productions SET manifest_json = $2, revision = revision + 1 WHERE id = $1",
    [prodId, JSON.stringify(manifest)]
  );
  console.log("Updated manifest in DB for", prodId);

  await pool.query(`
    UPDATE reel_operations
    SET status = 'QUEUED',
        attempt = 0,
        last_error = null,
        lease_owner = null,
        lease_expires_at = null,
        provider_operation_name = null,
        payload_json = jsonb_set(COALESCE(payload_json, '{}'::jsonb), '{safetyAttempts}', '0'::jsonb)
    WHERE production_id = $1 AND target_id = 'shot_01'
  `, [prodId]);
  console.log("Reset shot_01 to QUEUED for", prodId);

  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
