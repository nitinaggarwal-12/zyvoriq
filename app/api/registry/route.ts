import { NextRequest, NextResponse } from "next/server";
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

export interface StudioEntityRecord {
  id: string;
  entity_type:
    | "page"
    | "reel"
    | "clip"
    | "cast"
    | "wardrobe"
    | "location"
    | "direction_style"
    | "set";
  slug: string;
  canonical_url: string;
  title: string;
  subtitle: string;
  parent_id: string | null;
  media_src: string | null;
  metadata_json: string;
  created_at: string;
}

const DB_PATH = path.join(process.cwd(), "data/studio_entities.db");

function getSeedEntities(): StudioEntityRecord[] {
  const now = "2026-09-21T09:48:00Z";
  return [
    // PAGES
    {
      id: "ZYV-PAGE-SWARM001",
      entity_type: "page",
      slug: "director-post-suite-swarm",
      canonical_url: "/entity/ZYV-PAGE-SWARM001",
      title: "Director Post Suite & Multi-Turn Studio (/swarm)",
      subtitle: "Primary 24fps Music Video Director & Per-Act Speed Studio Page",
      parent_id: null,
      media_src: null,
      metadata_json: JSON.stringify({ route: "/swarm", engine: "models/gemini-omni-1.1-flash" }),
      created_at: now,
    },
    {
      id: "ZYV-PAGE-LIBRY002",
      entity_type: "page",
      slug: "asset-vault-library",
      canonical_url: "/entity/ZYV-PAGE-LIBRY002",
      title: "Generated Asset Vault (/library)",
      subtitle: "Master Reel, Clip, Bake & Identity Anchor Vault Page",
      parent_id: null,
      media_src: null,
      metadata_json: JSON.stringify({ route: "/library" }),
      created_at: now,
    },
    {
      id: "ZYV-PAGE-REGDB003",
      entity_type: "page",
      slug: "entity-database-registry",
      canonical_url: "/entity/ZYV-PAGE-REGDB003",
      title: "Relational Entity & URL Database Registry (/registry)",
      subtitle: "SQLite Master Database Table Explorer for All Studio Objects",
      parent_id: null,
      media_src: null,
      metadata_json: JSON.stringify({ route: "/registry", dbFile: "data/studio_entities.db" }),
      created_at: now,
    },

    // REELS
    {
      id: "ZYV-REEL-MBV260S1",
      entity_type: "reel",
      slug: "master-b-v2-combined-60s-reel",
      canonical_url: "/entity/ZYV-REEL-MBV260S1",
      title: "Master B v2 — Full 60.0s Combined Music Video Reel",
      subtitle: "1,440 Frames @ 24/1 CFR • 48,000 Hz Stereo AAC • 0.00 ms Lip-Sync",
      parent_id: "ZYV-PAGE-SWARM001",
      media_src: "/assets/swarm/masterB_v2/masterB_v2_combined_60s.mp4",
      metadata_json: JSON.stringify({
        durationSec: 60,
        frames: 1440,
        fps: "24/1",
        sha256: "ac607bb843449b3a098dc6ffabfa6e4358949539783e23bafb5ae02874ae6974",
      }),
      created_at: now,
    },

    // CLIPS
    {
      id: "ZYV-CLIP-ACT130S1",
      entity_type: "clip",
      slug: "act-1-pool-villa-30s-master-clip",
      canonical_url: "/entity/ZYV-CLIP-ACT130S1",
      title: "Act I Master Clip — Sunlit Pool Villa Terrace (00:00–00:30)",
      subtitle: "720 Native Frames @ 24/1 CFR • Crimson-Rose & Gold Couture",
      parent_id: "ZYV-REEL-MBV260S1",
      media_src: "/assets/swarm/masterB_v2/act1_pool_villa_30s.mp4",
      metadata_json: JSON.stringify({ partIndex: 1, durationSec: 30, frames: 720 }),
      created_at: now,
    },
    {
      id: "ZYV-CLIP-ACT230S2",
      entity_type: "clip",
      slug: "act-2-superyacht-deck-30s-master-clip",
      canonical_url: "/entity/ZYV-CLIP-ACT230S2",
      title: "Act II Master Clip — Twilight Superyacht Deck (00:30–01:00)",
      subtitle: "720 Native Frames @ 24/1 CFR • Emerald-Sapphire & Silver Couture",
      parent_id: "ZYV-REEL-MBV260S1",
      media_src: "/assets/swarm/masterB_v2/act2_superyacht_deck_30s.mp4",
      metadata_json: JSON.stringify({ partIndex: 2, durationSec: 30, frames: 720 }),
      created_at: now,
    },
    {
      id: "ZYV-CLIP-TRN1A10S",
      entity_type: "clip",
      slug: "act-1-turn-1a-10s-root-clip",
      canonical_url: "/entity/ZYV-CLIP-TRN1A10S",
      title: "Act I • Turn 1A Root Clip (00:00–00:10)",
      subtitle: "240 Native Frames @ 24/1 CFR • Pool Villa Terrace",
      parent_id: "ZYV-CLIP-ACT130S1",
      media_src: "/assets/swarm/masterB_v2/act1_turnA_10s.mp4",
      metadata_json: JSON.stringify({ partIndex: 1, turn: "1A", durationSec: 10, frames: 240 }),
      created_at: now,
    },
    {
      id: "ZYV-CLIP-TRN1B20S",
      entity_type: "clip",
      slug: "act-1-turn-1b-20s-extension-clip",
      canonical_url: "/entity/ZYV-CLIP-TRN1B20S",
      title: "Act I • Turn 1B Stateful Extension Clip (00:00–00:20)",
      subtitle: "480 Native Frames @ 24/1 CFR • Pool Villa Terrace",
      parent_id: "ZYV-CLIP-ACT130S1",
      media_src: "/assets/swarm/masterB_v2/act1_turnB_20s.mp4",
      metadata_json: JSON.stringify({ partIndex: 1, turn: "1B", durationSec: 20, frames: 480 }),
      created_at: now,
    },
    {
      id: "ZYV-CLIP-TRN2A10S",
      entity_type: "clip",
      slug: "act-2-turn-2a-10s-face-anchored-clip",
      canonical_url: "/entity/ZYV-CLIP-TRN2A10S",
      title: "Act II • Turn 2A Face-Anchored Root Clip (00:30–00:40)",
      subtitle: "240 Native Frames @ 24/1 CFR • Twilight Superyacht Deck",
      parent_id: "ZYV-CLIP-ACT230S2",
      media_src: "/assets/swarm/masterB_v2/act2_turnA_10s.mp4",
      metadata_json: JSON.stringify({ partIndex: 2, turn: "2A", durationSec: 10, frames: 240 }),
      created_at: now,
    },
    {
      id: "ZYV-CLIP-TRN2B20S",
      entity_type: "clip",
      slug: "act-2-turn-2b-20s-extension-clip",
      canonical_url: "/entity/ZYV-CLIP-TRN2B20S",
      title: "Act II • Turn 2B Stateful Extension Clip (00:30–00:50)",
      subtitle: "480 Native Frames @ 24/1 CFR • Twilight Superyacht Deck",
      parent_id: "ZYV-CLIP-ACT230S2",
      media_src: "/assets/swarm/masterB_v2/act2_turnB_20s.mp4",
      metadata_json: JSON.stringify({ partIndex: 2, turn: "2B", durationSec: 20, frames: 480 }),
      created_at: now,
    },

    // CAST / CHARACTERS
    {
      id: "ZYV-CAST-HEROFACE",
      entity_type: "cast",
      slug: "lead-heroine-biometric-face-anchor",
      canonical_url: "/entity/ZYV-CAST-HEROFACE",
      title: "Lead Bollywood Heroine — Biometric Face Identity Anchor",
      subtitle: "Extracted at t=1.50s of Act I to lock 100% facial continuity across acts",
      parent_id: "ZYV-REEL-MBV260S1",
      media_src: "/assets/swarm/masterB_v2/heroine_face_identity_anchor.jpg",
      metadata_json: JSON.stringify({ role: "Lead Heroine", continuityLock: "100%" }),
      created_at: now,
    },
    {
      id: "ZYV-CAST-DUO10DNC",
      entity_type: "cast",
      slug: "lead-heroine-male-duo-10-dancers",
      canonical_url: "/entity/ZYV-CAST-DUO10DNC",
      title: "Lead Heroine & Lead Male Duo + 10 Backup Dancers (5M / 5F)",
      subtitle: "12-Performer Stadium Choreography Ensemble Cast",
      parent_id: null,
      media_src: null,
      metadata_json: JSON.stringify({ totalPerformers: 12, leads: 2, backupDancers: 10 }),
      created_at: now,
    },
    {
      id: "ZYV-CAST-SOLO4DNC",
      entity_type: "cast",
      slug: "solo-a-list-heroine-4-backup-dancers",
      canonical_url: "/entity/ZYV-CAST-SOLO4DNC",
      title: "Solo A-List Lead Heroine + 4 Backup Dancers",
      subtitle: "5-Performer Glamour Pop Choreography Formation",
      parent_id: null,
      media_src: null,
      metadata_json: JSON.stringify({ totalPerformers: 5, leads: 1, backupDancers: 4 }),
      created_at: now,
    },
    {
      id: "ZYV-CAST-GIRL5GRP",
      entity_type: "cast",
      slug: "all-girl-pop-group-5-vocalists",
      canonical_url: "/entity/ZYV-CAST-GIRL5GRP",
      title: "All-Girl Pop Group (5 Synchronized Lead Vocalists)",
      subtitle: "Synchronized 5-Member Global Girl-Group Formation",
      parent_id: null,
      media_src: null,
      metadata_json: JSON.stringify({ totalPerformers: 5, leads: 5, backupDancers: 0 }),
      created_at: now,
    },

    // WARDROBES & ATTIRES
    {
      id: "ZYV-WRDB-CRMGOLD1",
      entity_type: "wardrobe",
      slug: "crimson-rose-champagne-gold-lehenga",
      canonical_url: "/entity/ZYV-WRDB-CRMGOLD1",
      title: "Crimson-Rose & Champagne-Gold Couture Resort Lehenga",
      subtitle: "Act I Signature Wardrobe • Embellished Mirror & Gold Threadwork",
      parent_id: "ZYV-CLIP-ACT130S1",
      media_src: null,
      metadata_json: JSON.stringify({ act: 1, palette: ["Crimson Rose", "Champagne Gold"] }),
      created_at: now,
    },
    {
      id: "ZYV-WRDB-EMRSILV2",
      entity_type: "wardrobe",
      slug: "royal-emerald-sapphire-silver-crystal-couture",
      canonical_url: "/entity/ZYV-WRDB-EMRSILV2",
      title: "Royal Emerald-Sapphire & Silver-Crystal Evening Couture",
      subtitle: "Act II Signature Wardrobe • High-Slit Satin Skirt & Diamond Chandelier Earrings",
      parent_id: "ZYV-CLIP-ACT230S2",
      media_src: null,
      metadata_json: JSON.stringify({ act: 2, palette: ["Royal Emerald", "Sapphire", "Silver"] }),
      created_at: now,
    },
    {
      id: "ZYV-WRDB-GOLDMINI",
      entity_type: "wardrobe",
      slug: "short-shimmering-gold-metallic-couture-dress",
      canonical_url: "/entity/ZYV-WRDB-GOLDMINI",
      title: "Short Shimmering Gold Metallic Couture Mini Dress",
      subtitle: "High-Energy Alpine & Club Stage Couture Dress",
      parent_id: null,
      media_src: null,
      metadata_json: JSON.stringify({ act: 1, palette: ["Metallic Gold", "Champagne"] }),
      created_at: now,
    },

    // LOCATIONS
    {
      id: "ZYV-LOCN-GOAVILLA",
      entity_type: "location",
      slug: "sunlit-cliffside-infinity-pool-villa-terrace",
      canonical_url: "/entity/ZYV-LOCN-GOAVILLA",
      title: "Sunlit Cliffside Infinity Pool Villa Terrace",
      subtitle: "Act I Primary Shooting Location • Golden Hour Ocean Horizon",
      parent_id: "ZYV-CLIP-ACT130S1",
      media_src: null,
      metadata_json: JSON.stringify({ country: "India / Mediterranean Coast", lighting: "Golden Hour Sun" }),
      created_at: now,
    },
    {
      id: "ZYV-LOCN-YACHTSEA",
      entity_type: "location",
      slug: "twilight-candlelit-luxury-superyacht-deck",
      canonical_url: "/entity/ZYV-LOCN-YACHTSEA",
      title: "Twilight Candlelit Luxury Superyacht Deck",
      subtitle: "Act II Primary Shooting Location • Open Ocean under Warm String Lights",
      parent_id: "ZYV-CLIP-ACT230S2",
      media_src: null,
      metadata_json: JSON.stringify({ country: "Arabian Sea / Mediterranean", lighting: "Candlelit Twilight" }),
      created_at: now,
    },
    {
      id: "ZYV-LOCN-ZERMATTS",
      entity_type: "location",
      slug: "sunlit-zermatt-alpine-panorama-glass-terrace",
      canonical_url: "/entity/ZYV-LOCN-ZERMATTS",
      title: "Sunlit Zermatt Alpine Panorama Glass Terrace (Switzerland)",
      subtitle: "High-Altitude Snow Peak Panorama Stage",
      parent_id: null,
      media_src: null,
      metadata_json: JSON.stringify({ country: "Switzerland", lighting: "Crisp Alpine Sunlight" }),
      created_at: now,
    },

    // SETS
    {
      id: "ZYV-SETS-INFPOOL1",
      entity_type: "set",
      slug: "white-stucco-arches-infinity-pool-stage-set",
      canonical_url: "/entity/ZYV-SETS-INFPOOL1",
      title: "White Stucco Archway & Turquoise Infinity Pool Set",
      subtitle: "Architectural Resort Stage with Palm Fronds & Travertine Deck",
      parent_id: "ZYV-LOCN-GOAVILLA",
      media_src: null,
      metadata_json: JSON.stringify({ setElements: ["White Arches", "Infinity Pool", "Palm Trees"] }),
      created_at: now,
    },
    {
      id: "ZYV-SETS-YACHTDCK",
      entity_type: "set",
      slug: "teakwood-superyacht-lounge-string-lights-set",
      canonical_url: "/entity/ZYV-SETS-YACHTDCK",
      title: "Teakwood Superyacht Aft-Deck & Candlelight Lounge Set",
      subtitle: "Warm Bokeh String Lights, White Leather Banquettes & Ocean Wake",
      parent_id: "ZYV-LOCN-YACHTSEA",
      media_src: null,
      metadata_json: JSON.stringify({ setElements: ["Teak Deck", "Bokeh String Lights", "Lanterns"] }),
      created_at: now,
    },

    // DIRECTION STYLES
    {
      id: "ZYV-DIRS-STEAD24F",
      entity_type: "direction_style",
      slug: "cinematic-24fps-steadicam-dance-tracking",
      canonical_url: "/entity/ZYV-DIRS-STEAD24F",
      title: "Cinematic 24/1 CFR Steadicam Choreography Tracking",
      subtitle: "Fluid 35mm Anamorphic Steadicam Push-Ins & Beat-Synced Framing",
      parent_id: "ZYV-REEL-MBV260S1",
      media_src: null,
      metadata_json: JSON.stringify({ fps: "24/1 CFR", shutterAngle: "180deg", lens: "35mm Anamorphic" }),
      created_at: now,
    },
    {
      id: "ZYV-DIRS-SLOWRAMP",
      entity_type: "direction_style",
      slug: "dynamic-per-act-speed-ramp-quicktime-pro",
      canonical_url: "/entity/ZYV-DIRS-SLOWRAMP",
      title: "Dynamic Per-Act Speed Multiplier Pacing (0.01x QuickTime Engine)",
      subtitle: "Independent Act I / Act II Playback Rate Modulation with Pitch Lock",
      parent_id: "ZYV-REEL-MBV260S1",
      media_src: null,
      metadata_json: JSON.stringify({ stepPrecision: "0.01x", pitchLock: true }),
      created_at: now,
    },
  ];
}

function runPythonDbScript(action: string, payload: unknown): unknown {
  const pyCode = `
import sqlite3, json, sys, os

db_path = sys.argv[1]
action = sys.argv[2]
payload = json.loads(sys.argv[3])

os.makedirs(os.path.dirname(db_path), exist_ok=True)
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS studio_entities (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  canonical_url TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  parent_id TEXT,
  media_src TEXT,
  metadata_json TEXT NOT NULL,
  created_at TEXT NOT NULL
)
""")
cur.execute("CREATE INDEX IF NOT EXISTS idx_studio_entities_type ON studio_entities(entity_type)")
cur.execute("CREATE INDEX IF NOT EXISTS idx_studio_entities_parent ON studio_entities(parent_id)")

if action == "seed_and_list":
    for item in payload.get("seeds", []):
        cur.execute("""
            INSERT OR IGNORE INTO studio_entities
            (id, entity_type, slug, canonical_url, title, subtitle, parent_id, media_src, metadata_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            item["id"], item["entity_type"], item["slug"], item["canonical_url"],
            item["title"], item.get("subtitle", ""), item.get("parent_id"),
            item.get("media_src"), item["metadata_json"], item["created_at"]
        ))
    conn.commit()
    etype = payload.get("entity_type")
    q = payload.get("q", "").strip().lower()
    sql = "SELECT * FROM studio_entities WHERE 1=1"
    params = []
    if etype and etype != "all":
        sql += " AND entity_type = ?"
        params.append(etype)
    if q:
        sql += " AND (LOWER(id) LIKE ? OR LOWER(title) LIKE ? OR LOWER(canonical_url) LIKE ? OR LOWER(subtitle) LIKE ?)"
        params.extend([f"%{q}%", f"%{q}%", f"%{q}%", f"%{q}%"])
    sql += " ORDER BY created_at DESC, id ASC"
    rows = [dict(r) for r in cur.execute(sql, params).fetchall()]
    print(json.dumps({"ok": True, "count": len(rows), "items": rows}))

elif action == "get_one":
    eid = payload.get("id")
    row = cur.execute("SELECT * FROM studio_entities WHERE id = ?", (eid,)).fetchone()
    children = [dict(r) for r in cur.execute("SELECT * FROM studio_entities WHERE parent_id = ?", (eid,)).fetchall()]
    print(json.dumps({"ok": bool(row), "item": dict(row) if row else None, "children": children}))

elif action == "insert":
    item = payload["item"]
    cur.execute("""
        INSERT OR REPLACE INTO studio_entities
        (id, entity_type, slug, canonical_url, title, subtitle, parent_id, media_src, metadata_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        item["id"], item["entity_type"], item["slug"], item["canonical_url"],
        item["title"], item.get("subtitle", ""), item.get("parent_id"),
        item.get("media_src"), item["metadata_json"], item["created_at"]
    ))
    conn.commit()
    print(json.dumps({"ok": True, "item": item}))

conn.close()
`;

  const out = execFileSync(
    "python3",
    ["-c", pyCode, DB_PATH, action, JSON.stringify(payload)],
    { encoding: "utf8" }
  );
  return JSON.parse(out);
}

export function generateEntityId(entityType: string): string {
  const prefixMap: Record<string, string> = {
    page: "PAGE",
    reel: "REEL",
    clip: "CLIP",
    cast: "CAST",
    wardrobe: "WRDB",
    location: "LOCN",
    direction_style: "DIRS",
    set: "SETS",
  };
  const prefix = prefixMap[entityType] || "OBJT";
  const token = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `ZYV-${prefix}-${token}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const entity_type = searchParams.get("type") || "all";
  const q = searchParams.get("q") || "";

  // Ensure seeded first
  runPythonDbScript("seed_and_list", { seeds: getSeedEntities() });

  if (id) {
    const res = runPythonDbScript("get_one", { id });
    return NextResponse.json(res);
  }

  const res = runPythonDbScript("seed_and_list", {
    seeds: [],
    entity_type,
    q,
  });
  return NextResponse.json(res);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entity_type = String(body.entity_type || "clip");
    const id = body.id ? String(body.id) : generateEntityId(entity_type);
    const title = String(body.title || "Untitled Studio Object");
    const slugBase = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48);
    const slug = `${slugBase}-${id.toLowerCase()}`;
    const canonical_url = `/entity/${id}`;

    const item: StudioEntityRecord = {
      id,
      entity_type: entity_type as StudioEntityRecord["entity_type"],
      slug,
      canonical_url,
      title,
      subtitle: String(body.subtitle || ""),
      parent_id: body.parent_id ? String(body.parent_id) : null,
      media_src: body.media_src ? String(body.media_src) : null,
      metadata_json: JSON.stringify(body.metadata || {}),
      created_at: new Date().toISOString(),
    };

    const res = runPythonDbScript("insert", { item });
    return NextResponse.json(res);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
