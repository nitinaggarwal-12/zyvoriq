// scripts/validateCharacterSheet.mjs
// Step 1: Character Sheet Pre-flight Validation
// Dispatches one throwaway Veo call (4s) per character sheet using a neutral prompt and archetype.
// Empirically validates whether reference sheet triggers Veo RAI likeness / safety filters before production.

import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import pg from "pg";

const { Pool } = pg;
const API_BASE = "https://generativelanguage.googleapis.com";

function loadEnvVar(name) {
  if (process.env[name]) return process.env[name];
  for (const envFile of [".env.local", ".env", ".env.production"]) {
    if (fsSync.existsSync(envFile)) {
      const content = fsSync.readFileSync(envFile, "utf8");
      const match = content.match(new RegExp(`^${name}=([^\\r\\n]+)`, "m"));
      if (match) return match[1].trim().replace(/^["']|["']$/g, "");
    }
  }
  return "";
}

function getApiKey() {
  return loadEnvVar("GEMINI_API_KEY") || loadEnvVar("GOOGLE_API_KEY") || "";
}

function getDatabaseUrl() {
  const direct = loadEnvVar("DATABASE_URL") || loadEnvVar("POSTGRES_URL") || loadEnvVar("DATABASE_PRIVATE_URL");
  if (direct) return direct;
  const host = loadEnvVar("PGHOST");
  const user = loadEnvVar("PGUSER");
  const db = loadEnvVar("PGDATABASE");
  if (host && user && db) {
    const pass = loadEnvVar("PGPASSWORD") ? `:${encodeURIComponent(loadEnvVar("PGPASSWORD"))}` : "";
    return `postgresql://${encodeURIComponent(user)}${pass}@${host}:${loadEnvVar("PGPORT") || "5432"}/${db}`;
  }
  return "";
}

let poolInstance = null;
function getPool() {
  if (!poolInstance) {
    const dbUrl = getDatabaseUrl();
    if (!dbUrl) return null;
    poolInstance = new Pool({
      connectionString: dbUrl,
      ssl: dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1") ? false : { rejectUnauthorized: false },
      max: 2,
      connectionTimeoutMillis: 5000,
    });
  }
  return poolInstance;
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function readAssetBuffer(assetPathOrUrl) {
  if (!assetPathOrUrl) throw new Error("Empty asset path");
  if (assetPathOrUrl.startsWith("http://") || assetPathOrUrl.startsWith("https://")) {
    const res = await fetch(assetPathOrUrl);
    if (!res.ok) throw new Error(`Failed to fetch asset from URL ${assetPathOrUrl}: ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  // Local filesystem checks
  const candidates = [
    assetPathOrUrl,
    path.resolve(process.cwd(), assetPathOrUrl),
    path.resolve(process.cwd(), "public", assetPathOrUrl.replace(/^\/+/, "")),
    path.resolve(process.cwd(), "public", "assets", "stills", path.basename(assetPathOrUrl)),
    path.resolve("/data", assetPathOrUrl.replace(/^\/+/, "")),
    path.resolve(process.cwd(), "scratch", assetPathOrUrl.replace(/^\/+/, "")),
    path.resolve(process.cwd(), "scratch", "asset_cache", assetPathOrUrl.replace(/^\/+/, ""))
  ];

  for (const p of candidates) {
    try {
      if (fsSync.existsSync(p) && fsSync.statSync(p).isFile()) {
        return await fs.readFile(p);
      }
    } catch {}
  }

  throw new Error(`Asset not found in search paths: ${assetPathOrUrl}`);
}

export async function validateCharacterSheet({
  characterId = null,
  archetype = "performer",
  sheetBuffers = [],
  sheetUris = [],
  model = process.env.ZYVORIQ_VEO_MODEL || "veo-3.1-generate-preview"
} = {}) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Validation requires GEMINI_API_KEY or GOOGLE_API_KEY");
  }

  // Load buffers if URIs were provided
  const buffers = [...sheetBuffers];
  for (const uri of sheetUris) {
    if (buffers.length >= 3) break;
    try {
      const buf = await readAssetBuffer(uri);
      buffers.push(buf);
    } catch (e) {
      console.warn(`[validateSheet] Warning reading ${uri}: ${e.message}`);
    }
  }

  if (buffers.length === 0) {
    throw new Error("No valid character sheet image buffers or URIs provided for validation");
  }

  // Enforce single-subject cap (max 3 images)
  const cappedBuffers = buffers.slice(0, 3);
  // Single opening frame image conditioning
  const primaryBuf = cappedBuffers[0];
  // Detect mimeType (PNG vs JPEG)
  const isPng = primaryBuf.length > 8 && primaryBuf[0] === 0x89 && primaryBuf[1] === 0x50;
  const mimeType = isPng ? "image/png" : "image/jpeg";

  // Neutral prompt strictly using archetype, no names, no scene specifics
  const neutralPrompt = `the ${archetype} stands in neutral light, medium shot, looking slightly off-camera.`;
  console.log(`[validateSheet] Testing character sheet with neutral prompt:\n"${neutralPrompt}"`);
  console.log(`[validateSheet] Conditioning with primary reference image (${mimeType}, ${primaryBuf.length} bytes)`);

  const instance = {
    prompt: neutralPrompt,
    image: {
      bytesBase64Encoded: primaryBuf.toString("base64"),
      mimeType
    }
  };

  const parameters = {
    aspectRatio: "9:16",
    durationSeconds: 4,
    sampleCount: 1
  };

  const effectiveModel = model || process.env.ZYVORIQ_VEO_MODEL || "veo-3.1-fast-generate-preview";
  const dispatchRes = await fetch(`${API_BASE}/v1beta/models/${effectiveModel}:predictLongRunning?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ instances: [instance], parameters })
  });

  const dispatchJson = await dispatchRes.json().catch(() => ({}));
  if (!dispatchRes.ok || dispatchJson.error) {
    const errStr = JSON.stringify(dispatchJson.error || dispatchJson);
    const isRai = /safety|filter|rai|likeness|policy|prohibit|celebrity/i.test(errStr);
    console.error(`[validateSheet] Veo dispatch rejected: ${errStr}`);
    if (isRai) {
      if (characterId) await markCharacterBlocked(characterId, `DISPATCH_RAI_BLOCKED: ${errStr}`);
      return { passed: false, status: "RAI_BLOCKED", error: errStr };
    }
    return { passed: false, status: "UNVALIDATED", error: errStr };
  }

  const opName = dispatchJson.name;
  if (!opName) {
    return { passed: false, status: "UNVALIDATED", error: "Missing operation name from Veo response" };
  }

  console.log(`[validateSheet] Operation started: ${opName}. Polling for completion...`);

  // Poll for operation completion (up to 3 minutes)
  for (let i = 0; i < 36; i++) {
    await sleep(5000);
    const pollRes = await fetch(`${API_BASE}/v1beta/${opName}?key=${apiKey}`);
    const pollJson = await pollRes.json().catch(() => ({}));

    if (pollJson.done) {
      console.log(`[validateSheet] Operation completed!`);
      if (pollJson.error) {
        const errStr = JSON.stringify(pollJson.error);
        const isRai = /safety|filter|rai|likeness|policy|prohibit|celebrity/i.test(errStr);
        console.error(`[validateSheet] Veo returned error: ${errStr}`);
        if (isRai) {
          if (characterId) await markCharacterBlocked(characterId, errStr);
          return { passed: false, status: "RAI_BLOCKED", error: errStr };
        }
        return { passed: false, status: "UNVALIDATED", error: errStr };
      }

      const generatedSamples = pollJson.response?.generateVideoResponse?.generatedSamples;
      const generatedVideos = pollJson.response?.generatedVideos;
      const videoUri = generatedSamples?.[0]?.video?.uri || generatedVideos?.[0]?.video?.uri;
      if (videoUri) {
        console.log(`[validateSheet] SUCCESS! Video generated at ${videoUri}`);
        if (characterId) await markCharacterValidated(characterId);
        return { passed: true, status: "VALIDATED", videoUri };
      }

      // Check if response contains empty payload or safety block
      const finishReason = generatedVideo?.finishReason || pollJson.response?.finishReason;
      const isSafety = finishReason === "SAFETY" || /safety|filter|prohibit|policy/i.test(JSON.stringify(pollJson));
      if (isSafety) {
        const reason = `FINISH_REASON_SAFETY: ${JSON.stringify(pollJson.response || {})}`;
        console.error(`[validateSheet] RAI Safety filter blocked completion: ${reason}`);
        if (characterId) await markCharacterBlocked(characterId, reason);
        return { passed: false, status: "RAI_BLOCKED", error: reason };
      }

      return { passed: false, status: "UNVALIDATED", error: "No video URI returned" };
    }
    process.stdout.write(".");
  }

  console.warn(`\n[validateSheet] Timeout waiting for operation ${opName}`);
  return { passed: false, status: "UNVALIDATED", error: "OPERATION_TIMEOUT" };
}

export async function markCharacterValidated(id) {
  const pool = getPool();
  if (!pool) return;
  try {
    await pool.query(`
      UPDATE character_library
      SET validation_status = 'VALIDATED',
          validation_error = NULL,
          validated_at = NOW(),
          updated_at = NOW()
      WHERE id = $1
    `, [id]);
    console.log(`[validateSheet] Marked character ${id} as VALIDATED in character_library`);
  } catch (e) {
    console.warn(`[validateSheet] Failed to update character_library status: ${e.message}`);
  }
}

export async function markCharacterBlocked(id, error) {
  const pool = getPool();
  if (!pool) return;
  try {
    await pool.query(`
      UPDATE character_library
      SET validation_status = 'RAI_BLOCKED',
          validation_error = $2,
          validated_at = NOW(),
          updated_at = NOW()
      WHERE id = $1
    `, [id, error]);
    console.warn(`[validateSheet] Marked character ${id} as RAI_BLOCKED in character_library`);
  } catch (e) {
    console.warn(`[validateSheet] Failed to update character_library status: ${e.message}`);
  }
}

// CLI Execution
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const target = process.argv[2];
  if (!target) {
    console.log(`Usage: node scripts/validateCharacterSheet.mjs <character_id_or_file_path> [--archetype="..."]`);
    process.exit(0);
  }

  const archetypeArg = process.argv.find(a => a.startsWith("--archetype="));
  const archetype = archetypeArg ? archetypeArg.split("=")[1].replace(/^["']|["']$/g, "") : "performer";

  (async () => {
    try {
      // Check if target is a file path
      let res;
      if (fsSync.existsSync(target) || target.includes("/") || target.includes(".")) {
        console.log(`[validateSheet] Validating image file: ${target} with archetype: "${archetype}"`);
        const buf = await readAssetBuffer(target);
        res = await validateCharacterSheet({
          archetype,
          sheetBuffers: [buf]
        });
      } else {
        // Query character from DB
        const pool = getPool();
        if (!pool) {
          throw new Error("PostgreSQL connection required to validate character ID from DB");
        }
        const charRes = await pool.query(`
          SELECT c.*, array_agg(w.sheet_uris) as all_uris
          FROM character_library c
          LEFT JOIN character_wardrobe w ON w.character_id = c.id
          WHERE c.id = $1
          GROUP BY c.id
        `, [target]);

        if (charRes.rows.length === 0) {
          throw new Error(`Character ${target} not found in database`);
        }

        const char = charRes.rows[0];
        const uris = (char.all_uris || []).flat().filter(Boolean);
        console.log(`[validateSheet] Validating character ${char.id} (${char.display_name}) with archetype "${char.archetype}"`);
        res = await validateCharacterSheet({
          characterId: char.id,
          archetype: char.archetype,
          sheetUris: uris
        });
      }

      console.log(`\nFinal Validation Result:`, res);
      process.exit(res.passed ? 0 : 1);
    } catch (err) {
      console.error(`[validateSheet] Execution error:`, err);
      process.exit(1);
    }
  })();
}
