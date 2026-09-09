import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import pg from "pg";
import { DatabaseSync } from "node:sqlite";

const { Pool } = pg;

let pgPool = null;
let sqliteInstance = null;

function safeJsonParse(jsonStr, fallback) {
  if (!jsonStr || typeof jsonStr !== "string") return fallback;
  try {
    return JSON.parse(jsonStr);
  } catch {
    return fallback;
  }
}

function getDatabaseUrl() {
  const direct = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_PRIVATE_URL;
  if (direct) return direct;
  if (process.env.PGHOST && process.env.PGUSER && process.env.PGDATABASE) {
    const pass = process.env.PGPASSWORD ? `:${encodeURIComponent(process.env.PGPASSWORD)}` : "";
    return `postgresql://${encodeURIComponent(process.env.PGUSER)}${pass}@${process.env.PGHOST}:${process.env.PGPORT || "5432"}/${process.env.PGDATABASE}`;
  }
  return "";
}

export function getPostgresPool() {
  const dbUrl = getDatabaseUrl();
  if (!dbUrl) return null;

  if (!pgPool) {
    try {
      pgPool = new Pool({
        connectionString: dbUrl,
        ssl: dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1") ? false : { rejectUnauthorized: false },
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
    } catch (e) {
      console.warn("[characterLibrary.mjs] Failed to initialize PostgreSQL pool:", e.message);
      return null;
    }
  }
  return pgPool;
}

export function getDatabase() {
  if (!sqliteInstance) {
    try {
      const dbPath = path.resolve(process.cwd(), "dev.db");
      sqliteInstance = new DatabaseSync(dbPath);
      sqliteInstance.exec("PRAGMA foreign_keys = ON;");
      sqliteInstance.exec("PRAGMA journal_mode = WAL;");
      sqliteInstance.exec("PRAGMA synchronous = NORMAL;");
      sqliteInstance.exec("PRAGMA busy_timeout = 5000;");
    } catch (err) {
      try {
        const tmpPath = path.resolve("/tmp", "zyvoriq.db");
        sqliteInstance = new DatabaseSync(tmpPath);
        sqliteInstance.exec("PRAGMA foreign_keys = ON;");
      } catch (e2) {
        sqliteInstance = new DatabaseSync(":memory:");
      }
    }
  }
  return sqliteInstance;
}

function parseSheetUris(value) {
  if (Array.isArray(value)) return value.slice(0, 3);
  if (typeof value === "string") {
    if (value.startsWith("{") && value.endsWith("}")) {
      return value.slice(1, -1).split(",").map(s => s.trim().replace(/^"|"$/g, "")).filter(Boolean).slice(0, 3);
    }
    const parsed = safeJsonParse(value, []);
    if (Array.isArray(parsed)) return parsed.slice(0, 3);
  }
  return [];
}

function ensureCharacterColumns() {
  try {
    const db = getDatabase();
    try { db.exec("ALTER TABLE character_library ADD COLUMN country TEXT;"); } catch {}
    try { db.exec("ALTER TABLE character_library ADD COLUMN country_code TEXT;"); } catch {}
    try { db.exec("ALTER TABLE character_library ADD COLUMN region TEXT;"); } catch {}
    try { db.exec("ALTER TABLE character_library ADD COLUMN language TEXT;"); } catch {}
    try { db.exec("ALTER TABLE character_library ADD COLUMN category TEXT DEFAULT 'creator';"); } catch {}
  } catch {}
}

async function ensurePgCharacterColumns(pg) {
  try {
    await pg.query("ALTER TABLE character_library ADD COLUMN IF NOT EXISTS country TEXT;");
    await pg.query("ALTER TABLE character_library ADD COLUMN IF NOT EXISTS country_code TEXT;");
    await pg.query("ALTER TABLE character_library ADD COLUMN IF NOT EXISTS region TEXT;");
    await pg.query("ALTER TABLE character_library ADD COLUMN IF NOT EXISTS language TEXT;");
    await pg.query("ALTER TABLE character_library ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'creator';");
  } catch {}
}

export const characterLibrary = {
  async list(filters) {
    const pg = getPostgresPool();
    if (pg) {
      try {
        await ensurePgCharacterColumns(pg);
        const conditions = [];
        const values = [];
        let idx = 1;

        if (filters?.era) {
          conditions.push(`era = $${idx++}`);
          values.push(filters.era);
        }
        if (filters?.gender) {
          conditions.push(`gender = $${idx++}`);
          values.push(filters.gender);
        }
        if (filters?.country) {
          conditions.push(`country = $${idx++}`);
          values.push(filters.country);
        }
        if (filters?.countryCode) {
          conditions.push(`country_code = $${idx++}`);
          values.push(filters.countryCode);
        }
        if (filters?.region) {
          conditions.push(`region = $${idx++}`);
          values.push(filters.region);
        }
        if (filters?.language) {
          conditions.push(`language = $${idx++}`);
          values.push(filters.language);
        }
        if (filters?.category) {
          conditions.push(`category = $${idx++}`);
          values.push(filters.category);
        }
        if (filters?.validatedOnly) {
          conditions.push(`validation_status = 'VALIDATED'`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const query = `SELECT * FROM character_library ${whereClause} ORDER BY created_at DESC`;
        const res = await pg.query(query, values);
        const chars = res.rows;

        if (chars.length === 0) return [];

        const charIds = chars.map(c => c.id);
        const wardrobeRes = await pg.query(
          `SELECT * FROM character_wardrobe WHERE character_id = ANY($1::text[]) ORDER BY is_default DESC, created_at ASC`,
          [charIds]
        );

        const wardrobeMap = new Map();
        for (const w of wardrobeRes.rows) {
          const list = wardrobeMap.get(w.character_id) || [];
          list.push({
            id: w.id,
            characterId: w.character_id,
            label: w.label,
            sheetUris: parseSheetUris(w.sheet_uris),
            isDefault: Boolean(w.is_default),
            createdAt: w.created_at
          });
          wardrobeMap.set(w.character_id, list);
        }

        return chars.map(c => ({
          id: c.id,
          displayName: c.display_name,
          archetype: c.archetype,
          description: c.description,
          gender: c.gender,
          era: c.era,
          country: c.country,
          countryCode: c.country_code,
          region: c.region,
          language: c.language,
          category: c.category || "creator",
          defaultVoiceId: c.default_voice_id,
          validationStatus: c.validation_status,
          validationError: c.validation_error,
          validatedAt: c.validated_at,
          wardrobe: wardrobeMap.get(c.id) || [],
          createdAt: c.created_at,
          updatedAt: c.updated_at
        }));
      } catch (err) {
        console.warn("[characterLibrary.list] Postgres query failed, falling back to SQLite:", err.message);
      }
    }

    // SQLite fallback
    ensureCharacterColumns();
    const db = getDatabase();
    let query = "SELECT * FROM character_library WHERE 1=1";
    const params = [];
    if (filters?.era) {
      query += " AND era = ?";
      params.push(filters.era);
    }
    if (filters?.gender) {
      query += " AND gender = ?";
      params.push(filters.gender);
    }
    if (filters?.country) {
      query += " AND country = ?";
      params.push(filters.country);
    }
    if (filters?.countryCode) {
      query += " AND country_code = ?";
      params.push(filters.countryCode);
    }
    if (filters?.region) {
      query += " AND region = ?";
      params.push(filters.region);
    }
    if (filters?.language) {
      query += " AND language = ?";
      params.push(filters.language);
    }
    if (filters?.category) {
      query += " AND category = ?";
      params.push(filters.category);
    }
    if (filters?.validatedOnly) {
      query += " AND validation_status = 'VALIDATED'";
    }
    query += " ORDER BY created_at DESC";

    const chars = db.prepare(query).all(...params);
    if (chars.length === 0) return [];

    const wardrobeRows = db.prepare("SELECT * FROM character_wardrobe ORDER BY is_default DESC, created_at ASC").all();
    const wardrobeMap = new Map();
    for (const w of wardrobeRows) {
      const list = wardrobeMap.get(w.character_id) || [];
      list.push({
        id: w.id,
        characterId: w.character_id,
        label: w.label,
        sheetUris: parseSheetUris(w.sheet_uris),
        isDefault: Boolean(w.is_default),
        createdAt: w.created_at
      });
      wardrobeMap.set(w.character_id, list);
    }

    return chars.map(c => ({
      id: c.id,
      displayName: c.display_name,
      archetype: c.archetype,
      description: c.description,
      gender: c.gender,
      era: c.era,
      country: c.country,
      countryCode: c.country_code,
      region: c.region,
      language: c.language,
      category: c.category || "creator",
      defaultVoiceId: c.default_voice_id,
      validationStatus: c.validation_status,
      validationError: c.validation_error,
      validatedAt: c.validated_at,
      wardrobe: wardrobeMap.get(c.id) || [],
      createdAt: c.created_at,
      updatedAt: c.updated_at
    }));
  },

  async get(id) {
    const pg = getPostgresPool();
    if (pg) {
      try {
        await ensurePgCharacterColumns(pg);
        const res = await pg.query("SELECT * FROM character_library WHERE id = $1", [id]);
        if (res.rows.length === 0) return null;
        const c = res.rows[0];

        const wardrobeRes = await pg.query(
          "SELECT * FROM character_wardrobe WHERE character_id = $1 ORDER BY is_default DESC, created_at ASC",
          [id]
        );

        return {
          id: c.id,
          displayName: c.display_name,
          archetype: c.archetype,
          description: c.description,
          gender: c.gender,
          era: c.era,
          country: c.country,
          countryCode: c.country_code,
          region: c.region,
          language: c.language,
          category: c.category || "creator",
          defaultVoiceId: c.default_voice_id,
          validationStatus: c.validation_status,
          validationError: c.validation_error,
          validatedAt: c.validated_at,
          wardrobe: wardrobeRes.rows.map(w => ({
            id: w.id,
            characterId: w.character_id,
            label: w.label,
            sheetUris: parseSheetUris(w.sheet_uris),
            isDefault: Boolean(w.is_default),
            createdAt: w.created_at
          })),
          createdAt: c.created_at,
          updatedAt: c.updated_at
        };
      } catch (err) {
        console.warn("[characterLibrary.get] Postgres error, falling back to SQLite:", err.message);
      }
    }

    // SQLite fallback
    ensureCharacterColumns();
    const db = getDatabase();
    const c = db.prepare("SELECT * FROM character_library WHERE id = ?").get(id);
    if (!c) return null;

    const wardrobeRows = db.prepare(
      "SELECT * FROM character_wardrobe WHERE character_id = ? ORDER BY is_default DESC, created_at ASC"
    ).all(id);

    return {
      id: c.id,
      displayName: c.display_name,
      archetype: c.archetype,
      description: c.description,
      gender: c.gender,
      era: c.era,
      country: c.country,
      countryCode: c.country_code,
      region: c.region,
      language: c.language,
      category: c.category || "creator",
      defaultVoiceId: c.default_voice_id,
      validationStatus: c.validation_status,
      validationError: c.validation_error,
      validatedAt: c.validated_at,
      wardrobe: wardrobeRows.map(w => ({
        id: w.id,
        characterId: w.character_id,
        label: w.label,
        sheetUris: parseSheetUris(w.sheet_uris),
        isDefault: Boolean(w.is_default),
        createdAt: w.created_at
      })),
      createdAt: c.created_at,
      updatedAt: c.updated_at
    };
  },

  async create(input) {
    const id = input.id || `char_${crypto.randomUUID().slice(0, 8)}`;
    const status = input.validationStatus || "UNVALIDATED";
    const pg = getPostgresPool();

    if (pg) {
      try {
        await ensurePgCharacterColumns(pg);
        await pg.query(`
          INSERT INTO character_library (
            id, display_name, archetype, description, gender, era, country, country_code, region, language, category, default_voice_id, validation_status, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
          ON CONFLICT (id) DO UPDATE SET
            display_name = EXCLUDED.display_name,
            archetype = EXCLUDED.archetype,
            description = EXCLUDED.description,
            gender = EXCLUDED.gender,
            era = EXCLUDED.era,
            country = EXCLUDED.country,
            country_code = EXCLUDED.country_code,
            region = EXCLUDED.region,
            language = EXCLUDED.language,
            category = EXCLUDED.category,
            default_voice_id = EXCLUDED.default_voice_id,
            updated_at = NOW()
        `, [
          id,
          input.displayName,
          input.archetype,
          input.description,
          input.gender || null,
          input.era || null,
          input.country || null,
          input.countryCode || null,
          input.region || null,
          input.language || null,
          input.category || "creator",
          input.defaultVoiceId || "Kore",
          status
        ]);

        if (input.wardrobe && input.wardrobe.length > 0) {
          for (const w of input.wardrobe) {
            const wId = w.id || `w_${crypto.randomUUID().slice(0, 8)}`;
            const cappedUris = (w.sheetUris || []).slice(0, 3);
            await pg.query(`
              INSERT INTO character_wardrobe (id, character_id, label, sheet_uris, is_default, created_at)
              VALUES ($1, $2, $3, $4, $5, NOW())
              ON CONFLICT (id) DO UPDATE SET
                label = EXCLUDED.label,
                sheet_uris = EXCLUDED.sheet_uris,
                is_default = EXCLUDED.is_default
            `, [wId, id, w.label, cappedUris, Boolean(w.isDefault)]);
          }
        }

        const retrieved = await this.get(id);
        if (retrieved) return retrieved;
      } catch (err) {
        console.warn("[characterLibrary.create] Postgres error, falling back to SQLite:", err.message);
      }
    }

    // SQLite fallback
    ensureCharacterColumns();
    const db = getDatabase();
    db.prepare(`
      INSERT OR REPLACE INTO character_library (
        id, display_name, archetype, description, gender, era, country, country_code, region, language, category, default_voice_id, validation_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(
      id,
      input.displayName,
      input.archetype,
      input.description,
      input.gender || null,
      input.era || null,
      input.country || null,
      input.countryCode || null,
      input.region || null,
      input.language || null,
      input.category || "creator",
      input.defaultVoiceId || "Kore",
      status
    );

    if (input.wardrobe && input.wardrobe.length > 0) {
      for (const w of input.wardrobe) {
        const wId = w.id || `w_${crypto.randomUUID().slice(0, 8)}`;
        const cappedUris = (w.sheetUris || []).slice(0, 3);
        db.prepare(`
          INSERT OR REPLACE INTO character_wardrobe (id, character_id, label, sheet_uris, is_default, created_at)
          VALUES (?, ?, ?, ?, ?, datetime('now'))
        `).run(wId, id, w.label, JSON.stringify(cappedUris), w.isDefault ? 1 : 0);
      }
    }

    return (await this.get(id));
  },

  async addWardrobe(characterId, label, sheetUris, isDefault = false) {
    const wId = `w_${crypto.randomUUID().slice(0, 8)}`;
    const cappedUris = (sheetUris || []).slice(0, 3);
    const pg = getPostgresPool();

    if (pg) {
      try {
        if (isDefault) {
          await pg.query("UPDATE character_wardrobe SET is_default = FALSE WHERE character_id = $1", [characterId]);
        }
        await pg.query(`
          INSERT INTO character_wardrobe (id, character_id, label, sheet_uris, is_default, created_at)
          VALUES ($1, $2, $3, $4, $5, NOW())
        `, [wId, characterId, label, cappedUris, isDefault]);
        return {
          id: wId,
          characterId,
          label,
          sheetUris: cappedUris,
          isDefault
        };
      } catch (err) {
        console.warn("[characterLibrary.addWardrobe] Postgres error, falling back to SQLite:", err.message);
      }
    }

    // SQLite fallback
    const db = getDatabase();
    if (isDefault) {
      db.prepare("UPDATE character_wardrobe SET is_default = 0 WHERE character_id = ?").run(characterId);
    }
    db.prepare(`
      INSERT INTO character_wardrobe (id, character_id, label, sheet_uris, is_default, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).run(wId, characterId, label, JSON.stringify(cappedUris), isDefault ? 1 : 0);

    return {
      id: wId,
      characterId,
      label,
      sheetUris: cappedUris,
      isDefault
    };
  },

  async markValidated(id) {
    const pg = getPostgresPool();
    if (pg) {
      try {
        await pg.query(`
          UPDATE character_library
          SET validation_status = 'VALIDATED', validation_error = NULL, validated_at = NOW(), updated_at = NOW()
          WHERE id = $1
        `, [id]);
        return;
      } catch (err) {
        console.warn("[characterLibrary.markValidated] Postgres error, falling back to SQLite:", err.message);
      }
    }
    const db = getDatabase();
    db.prepare(`
      UPDATE character_library
      SET validation_status = 'VALIDATED', validation_error = NULL, validated_at = datetime('now'), updated_at = datetime('now')
      WHERE id = ?
    `).run(id);
  },

  async markBlocked(id, error) {
    const pg = getPostgresPool();
    if (pg) {
      try {
        await pg.query(`
          UPDATE character_library
          SET validation_status = 'RAI_BLOCKED', validation_error = $2, validated_at = NOW(), updated_at = NOW()
          WHERE id = $1
        `, [id, error]);
        return;
      } catch (err) {
        console.warn("[characterLibrary.markBlocked] Postgres error, falling back to SQLite:", err.message);
      }
    }
    const db = getDatabase();
    db.prepare(`
      UPDATE character_library
      SET validation_status = 'RAI_BLOCKED', validation_error = ?, validated_at = datetime('now'), updated_at = datetime('now')
      WHERE id = ?
    `).run(error, id);
  },

  async delete(id) {
    const pg = getPostgresPool();
    if (pg) {
      try {
        await pg.query("DELETE FROM character_library WHERE id = $1", [id]);
        return;
      } catch (err) {
        console.warn("[characterLibrary.delete] Postgres error, falling back to SQLite:", err.message);
      }
    }
    const db = getDatabase();
    db.prepare("DELETE FROM character_library WHERE id = ?").run(id);
  },

  async resolveWardrobe(characterId, wardrobeId) {
    const char = await this.get(characterId);
    if (!char) {
      throw new Error(`Character ${characterId} not found in character library`);
    }

    let variant = wardrobeId ? char.wardrobe.find(w => w.id === wardrobeId) : null;
    if (!variant) {
      variant = char.wardrobe.find(w => w.isDefault) || char.wardrobe[0] || null;
    }

    return {
      sheetUris: variant ? variant.sheetUris.slice(0, 3) : [],
      archetype: char.archetype,
      voiceId: char.defaultVoiceId || "Kore",
      displayName: char.displayName
    };
  },

  async resolveWardrobeForLocation(characterId, locationKeyword) {
    const char = await this.get(characterId);
    if (!char) {
      throw new Error(`Character ${characterId} not found in character library`);
    }

    if (!char.wardrobe || char.wardrobe.length === 0) {
      return {
        variant: null,
        sheetUris: [],
        archetype: char.archetype,
        voiceId: char.defaultVoiceId || "Kore",
        displayName: char.displayName,
        matchedLabel: "default"
      };
    }

    let matched = char.wardrobe.find(w => w.isDefault) || char.wardrobe[0];

    if (locationKeyword) {
      const loc = locationKeyword.toLowerCase();
      if (loc.includes("gym") || loc.includes("fitness") || loc.includes("workout") || loc.includes("athletic") || loc.includes("training") || loc.includes("sport") || loc.includes("running") || loc.includes("pilates") || loc.includes("yoga")) {
        const found = char.wardrobe.find(w => w.label.toLowerCase().includes("gym") || w.label.toLowerCase().includes("fitness") || w.label.toLowerCase().includes("athletic") || w.label.toLowerCase().includes("workout") || w.label.toLowerCase().includes("activewear"));
        if (found) matched = found;
      } else if (loc.includes("market") || loc.includes("grocer") || loc.includes("supermarket") || loc.includes("store") || loc.includes("shop") || loc.includes("bazaar") || loc.includes("bakery")) {
        const found = char.wardrobe.find(w => w.label.toLowerCase().includes("market") || w.label.toLowerCase().includes("grocer") || w.label.toLowerCase().includes("tote") || w.label.toLowerCase().includes("shopping"));
        if (found) matched = found;
      } else if (loc.includes("beach") || loc.includes("pool") || loc.includes("resort") || loc.includes("yacht") || loc.includes("coastal") || loc.includes("sand") || loc.includes("swim")) {
        const found = char.wardrobe.find(w => w.label.toLowerCase().includes("pool") || w.label.toLowerCase().includes("beach") || w.label.toLowerCase().includes("resort") || w.label.toLowerCase().includes("swim"));
        if (found) matched = found;
      } else if (loc.includes("office") || loc.includes("boardroom") || loc.includes("studio") || loc.includes("corporate") || loc.includes("desk") || loc.includes("agency")) {
        const found = char.wardrobe.find(w => w.label.toLowerCase().includes("office") || w.label.toLowerCase().includes("work") || w.label.toLowerCase().includes("business") || w.label.toLowerCase().includes("suit") || w.label.toLowerCase().includes("blazer"));
        if (found) matched = found;
      } else if (loc.includes("party") || loc.includes("gala") || loc.includes("lounge") || loc.includes("bar") || loc.includes("club") || loc.includes("ballroom") || loc.includes("hotel")) {
        const found = char.wardrobe.find(w => w.label.toLowerCase().includes("party") || w.label.toLowerCase().includes("gala") || w.label.toLowerCase().includes("evening") || w.label.toLowerCase().includes("cocktail"));
        if (found) matched = found;
      } else if (loc.includes("home") || loc.includes("hygge") || loc.includes("living") || loc.includes("kitchen") || loc.includes("apartment") || loc.includes("bedroom") || loc.includes("courtyard")) {
        const found = char.wardrobe.find(w => w.label.toLowerCase().includes("home") || w.label.toLowerCase().includes("hygge") || w.label.toLowerCase().includes("casual") || w.label.toLowerCase().includes("cozy") || w.label.toLowerCase().includes("knit") || w.label.toLowerCase().includes("lounge"));
        if (found) matched = found;
      } else if (loc.includes("street") || loc.includes("station") || loc.includes("subway") || loc.includes("alley") || loc.includes("train") || loc.includes("transit") || loc.includes("bridge")) {
        const found = char.wardrobe.find(w => w.label.toLowerCase().includes("street") || w.label.toLowerCase().includes("urban") || w.label.toLowerCase().includes("trench") || w.label.toLowerCase().includes("jacket") || w.label.toLowerCase().includes("parka"));
        if (found) matched = found;
      }
    }

    return {
      variant: matched,
      sheetUris: matched ? matched.sheetUris.slice(0, 3) : [],
      archetype: char.archetype,
      voiceId: char.defaultVoiceId || "Kore",
      displayName: char.displayName,
      matchedLabel: matched ? matched.label : "default"
    };
  }
};
