import crypto from "node:crypto";
import { getPostgresPool, getDatabase } from "@/lib/db/client";

export interface LibraryLocation {
  id: string;
  displayName: string;
  environmentBlock: string; // The verbatim string. Never rewritten or regenerated.
  establishingUri?: string;
  era?: string;
  timeOfDay?: string;
  createdAt?: string;
}

export interface CreateLocationInput {
  id?: string;
  displayName: string;
  environmentBlock: string;
  establishingUri?: string;
  era?: string;
  timeOfDay?: string;
}

export const locationLibrary = {
  async list(filters?: { era?: string; timeOfDay?: string }): Promise<LibraryLocation[]> {
    const pg = getPostgresPool();
    if (pg) {
      try {
        const conditions: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if (filters?.era) {
          conditions.push(`era = $${idx++}`);
          values.push(filters.era);
        }
        if (filters?.timeOfDay) {
          conditions.push(`time_of_day = $${idx++}`);
          values.push(filters.timeOfDay);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const query = `SELECT * FROM location_library ${whereClause} ORDER BY created_at DESC`;
        const res = await pg.query(query, values);

        return res.rows.map((row: any) => ({
          id: row.id,
          displayName: row.display_name,
          environmentBlock: row.environment_block,
          establishingUri: row.establishing_uri,
          era: row.era,
          timeOfDay: row.time_of_day,
          createdAt: row.created_at
        }));
      } catch (err: any) {
        console.warn("[locationLibrary.list] Postgres error, falling back to SQLite:", err.message);
      }
    }

    // SQLite fallback
    const db = getDatabase();
    let query = "SELECT * FROM location_library WHERE 1=1";
    const params: any[] = [];

    if (filters?.era) {
      query += " AND era = ?";
      params.push(filters.era);
    }
    if (filters?.timeOfDay) {
      query += " AND time_of_day = ?";
      params.push(filters.timeOfDay);
    }
    query += " ORDER BY created_at DESC";

    const rows = db.prepare(query).all(...params) as any[];
    return rows.map((row: any) => ({
      id: row.id,
      displayName: row.display_name,
      environmentBlock: row.environment_block,
      establishingUri: row.establishing_uri,
      era: row.era,
      timeOfDay: row.time_of_day,
      createdAt: row.created_at
    }));
  },

  async get(id: string): Promise<LibraryLocation | null> {
    const pg = getPostgresPool();
    if (pg) {
      try {
        const res = await pg.query("SELECT * FROM location_library WHERE id = $1", [id]);
        if (res.rows.length === 0) return null;
        const row = res.rows[0];
        return {
          id: row.id,
          displayName: row.display_name,
          environmentBlock: row.environment_block,
          establishingUri: row.establishing_uri,
          era: row.era,
          timeOfDay: row.time_of_day,
          createdAt: row.created_at
        };
      } catch (err: any) {
        console.warn("[locationLibrary.get] Postgres error, falling back to SQLite:", err.message);
      }
    }

    const db = getDatabase();
    const row = db.prepare("SELECT * FROM location_library WHERE id = ?").get(id) as any;
    if (!row) return null;

    return {
      id: row.id,
      displayName: row.display_name,
      environmentBlock: row.environment_block,
      establishingUri: row.establishing_uri,
      era: row.era,
      timeOfDay: row.time_of_day,
      createdAt: row.created_at
    };
  },

  // Notice: no updateEnvironmentBlock method. Byte-identical verbatim reuse is enforced.
  async create(input: CreateLocationInput): Promise<LibraryLocation> {
    const id = input.id || `loc_${crypto.randomUUID().slice(0, 8)}`;
    const trimmedBlock = input.environmentBlock.trim();

    const pg = getPostgresPool();
    if (pg) {
      try {
        await pg.query(`
          INSERT INTO location_library (
            id, display_name, environment_block, establishing_uri, era, time_of_day, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
          ON CONFLICT (id) DO UPDATE SET
            display_name = EXCLUDED.display_name,
            establishing_uri = EXCLUDED.establishing_uri,
            era = EXCLUDED.era,
            time_of_day = EXCLUDED.time_of_day
        `, [
          id,
          input.displayName,
          trimmedBlock,
          input.establishingUri || null,
          input.era || null,
          input.timeOfDay || null
        ]);

        const retrieved = await this.get(id);
        if (retrieved) return retrieved;
      } catch (err: any) {
        console.warn("[locationLibrary.create] Postgres error, falling back to SQLite:", err.message);
      }
    }

    const db = getDatabase();
    db.prepare(`
      INSERT OR REPLACE INTO location_library (
        id, display_name, environment_block, establishing_uri, era, time_of_day, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      id,
      input.displayName,
      trimmedBlock,
      input.establishingUri || null,
      input.era || null,
      input.timeOfDay || null
    );

    return (await this.get(id))!;
  },

  async delete(id: string): Promise<void> {
    const pg = getPostgresPool();
    if (pg) {
      try {
        await pg.query("DELETE FROM location_library WHERE id = $1", [id]);
        return;
      } catch (err: any) {
        console.warn("[locationLibrary.delete] Postgres error, falling back to SQLite:", err.message);
      }
    }
    const db = getDatabase();
    db.prepare("DELETE FROM location_library WHERE id = ?").run(id);
  }
};
