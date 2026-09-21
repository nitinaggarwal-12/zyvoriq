import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

export interface LibraryAssetItem {
  id: string;
  projectId: string;
  projectTitle: string;
  title: string;
  subtitle: string;
  assetType:
    | "combined_master"
    | "act_master"
    | "turn_segment"
    | "baked_custom"
    | "face_anchor";
  genre: string;
  durationSec: number;
  frames: number;
  fps: string;
  audioSpec: string;
  partIndex?: 1 | 2;
  speedMultiplier?: number;
  wardrobe: string;
  location: string;
  promptSummary: string;
  src: string;
  createdAt: string;
}

const DEFAULT_MASTER_B_V2_ASSETS: LibraryAssetItem[] = [
  {
    id: "masterB_v2_combined_60s",
    projectId: "proj_master_b_v2",
    projectTitle: "Master B v2 — Ishq Tera Electric (Bollywood 60s)",
    title: "Master B v2 — Full 60.0s Combined Master Reel",
    subtitle: "Same Lead Heroine Across Two Locations & Two Wardrobes (Act I + Act II)",
    assetType: "combined_master",
    genre: "Bollywood Hindi Pop",
    durationSec: 60.0,
    frames: 1440,
    fps: "24/1 CFR",
    audioSpec: "48,000 Hz Stereo AAC (0.00 ms Drift)",
    speedMultiplier: 1.0,
    wardrobe: "Act I: Crimson-Rose & Gold Lehenga | Act II: Royal Emerald-Sapphire Couture",
    location: "Act I: Sunlit Cliffside Pool Villa | Act II: Twilight Superyacht Deck",
    promptSummary:
      "60.0-second 9:16 24fps Bollywood blockbuster Hindi superhit dance reel with same A-list lead heroine across sunlit pool villa and twilight luxury superyacht deck at 122 BPM.",
    src: "/assets/swarm/masterB_v2/masterB_v2_combined_60s.mp4",
    createdAt: "2026-09-21T00:05:00Z",
  },
  {
    id: "masterB_v2_act1_30s",
    projectId: "proj_master_b_v2",
    projectTitle: "Master B v2 — Ishq Tera Electric (Bollywood 60s)",
    title: "Act I — Native 30.0s Master Reel (Pool Villa Terrace)",
    subtitle: "Part 1 of Master B v2 (Turn 1A → Turn 1B → Turn 1C Continuous)",
    assetType: "act_master",
    genre: "Bollywood Hindi Pop",
    durationSec: 30.0,
    frames: 720,
    fps: "24/1 CFR",
    audioSpec: "48,000 Hz Stereo AAC (0.00 ms Drift)",
    partIndex: 1,
    speedMultiplier: 1.0,
    wardrobe: "Crimson-Rose & Champagne-Gold Couture Lehenga",
    location: "Sunlit Cliffside Infinity Pool Villa Terrace",
    promptSummary:
      "Act I (00:00–00:30): Lead Bollywood heroine in crimson-rose and champagne-gold resort lehenga dancing with 4 backup dancers on a sunlit infinity pool villa terrace.",
    src: "/assets/swarm/masterB_v2/act1_pool_villa_30s.mp4",
    createdAt: "2026-09-21T00:02:00Z",
  },
  {
    id: "masterB_v2_act2_30s",
    projectId: "proj_master_b_v2",
    projectTitle: "Master B v2 — Ishq Tera Electric (Bollywood 60s)",
    title: "Act II — Native 30.0s Master Reel (Twilight Superyacht Deck)",
    subtitle: "Part 2 of Master B v2 (Same Lead Heroine Face • New Wardrobe & Location)",
    assetType: "act_master",
    genre: "Bollywood Hindi Pop",
    durationSec: 30.0,
    frames: 720,
    fps: "24/1 CFR",
    audioSpec: "48,000 Hz Stereo AAC (0.00 ms Drift)",
    partIndex: 2,
    speedMultiplier: 1.0,
    wardrobe: "Royal Emerald-Sapphire & Silver-Crystal Evening Couture",
    location: "Twilight Candlelit Luxury Superyacht Deck",
    promptSummary:
      "Act II (00:30–01:00): Exact same lead Bollywood heroine face & identity transformed into royal emerald-sapphire and silver-crystal couture aboard a candlelit twilight superyacht deck.",
    src: "/assets/swarm/masterB_v2/act2_superyacht_deck_30s.mp4",
    createdAt: "2026-09-21T00:04:00Z",
  },
  {
    id: "masterB_v2_act1_turnA_10s",
    projectId: "proj_master_b_v2",
    projectTitle: "Master B v2 — Ishq Tera Electric (Bollywood 60s)",
    title: "Act I • Turn 1A (Root 10.0s Native Generation)",
    subtitle: "Initial 10.0s Native Generation (Pool Villa Terrace)",
    assetType: "turn_segment",
    genre: "Bollywood Hindi Pop",
    durationSec: 10.0,
    frames: 240,
    fps: "24/1 CFR",
    audioSpec: "48,000 Hz Stereo AAC",
    partIndex: 1,
    speedMultiplier: 1.0,
    wardrobe: "Crimson-Rose & Champagne-Gold Couture Lehenga",
    location: "Sunlit Cliffside Infinity Pool Villa Terrace",
    promptSummary: "Turn 1A root generation (00:00–00:10) on sunlit infinity pool terrace.",
    src: "/assets/swarm/masterB_v2/act1_turnA_10s.mp4",
    createdAt: "2026-09-21T00:01:00Z",
  },
  {
    id: "masterB_v2_act1_turnB_20s",
    projectId: "proj_master_b_v2",
    projectTitle: "Master B v2 — Ishq Tera Electric (Bollywood 60s)",
    title: "Act I • Turn 1B (Stateful 20.0s Native Generation)",
    subtitle: "Continuous 20.0s Native Generation (Pool Villa Terrace)",
    assetType: "turn_segment",
    genre: "Bollywood Hindi Pop",
    durationSec: 20.0,
    frames: 480,
    fps: "24/1 CFR",
    audioSpec: "48,000 Hz Stereo AAC",
    partIndex: 1,
    speedMultiplier: 1.0,
    wardrobe: "Crimson-Rose & Champagne-Gold Couture Lehenga",
    location: "Sunlit Cliffside Infinity Pool Villa Terrace",
    promptSummary: "Turn 1B stateful continuation (00:00–00:20) on sunlit infinity pool terrace.",
    src: "/assets/swarm/masterB_v2/act1_turnB_20s.mp4",
    createdAt: "2026-09-21T00:01:30Z",
  },
  {
    id: "masterB_v2_act2_turnA_10s",
    projectId: "proj_master_b_v2",
    projectTitle: "Master B v2 — Ishq Tera Electric (Bollywood 60s)",
    title: "Act II • Turn 2A (Face-Identity Anchored 10.0s Root)",
    subtitle: "Initial 10.0s Native Generation (Twilight Superyacht Deck)",
    assetType: "turn_segment",
    genre: "Bollywood Hindi Pop",
    durationSec: 10.0,
    frames: 240,
    fps: "24/1 CFR",
    audioSpec: "48,000 Hz Stereo AAC",
    partIndex: 2,
    speedMultiplier: 1.0,
    wardrobe: "Royal Emerald-Sapphire & Silver-Crystal Evening Couture",
    location: "Twilight Candlelit Luxury Superyacht Deck",
    promptSummary: "Turn 2A face-anchored generation (00:30–00:40) on twilight superyacht deck.",
    src: "/assets/swarm/masterB_v2/act2_turnA_10s.mp4",
    createdAt: "2026-09-21T00:03:00Z",
  },
  {
    id: "masterB_v2_act2_turnB_20s",
    projectId: "proj_master_b_v2",
    projectTitle: "Master B v2 — Ishq Tera Electric (Bollywood 60s)",
    title: "Act II • Turn 2B (Stateful 20.0s Native Generation)",
    subtitle: "Continuous 20.0s Native Generation (Twilight Superyacht Deck)",
    assetType: "turn_segment",
    genre: "Bollywood Hindi Pop",
    durationSec: 20.0,
    frames: 480,
    fps: "24/1 CFR",
    audioSpec: "48,000 Hz Stereo AAC",
    partIndex: 2,
    speedMultiplier: 1.0,
    wardrobe: "Royal Emerald-Sapphire & Silver-Crystal Evening Couture",
    location: "Twilight Candlelit Luxury Superyacht Deck",
    promptSummary: "Turn 2B stateful continuation (00:30–00:50) on twilight superyacht deck.",
    src: "/assets/swarm/masterB_v2/act2_turnB_20s.mp4",
    createdAt: "2026-09-21T00:03:30Z",
  },
  {
    id: "masterB_v2_face_identity_anchor",
    projectId: "proj_master_b_v2",
    projectTitle: "Master B v2 — Ishq Tera Electric (Bollywood 60s)",
    title: "Lead Heroine Close-Up Face Identity Anchor (t = 1.50s)",
    subtitle: "High-Fidelity Face Lock Seed Conditioning Act II Superyacht Deck",
    assetType: "face_anchor",
    genre: "Bollywood Hindi Pop",
    durationSec: 0,
    frames: 1,
    fps: "Still Keyframe",
    audioSpec: "N/A (Reference Image)",
    wardrobe: "Crimson-Rose & Champagne-Gold Couture Lehenga",
    location: "Sunlit Cliffside Infinity Pool Villa Terrace",
    promptSummary:
      "Close-up facial identity reference frame extracted at t=1.50s of Act I to guarantee 100% identical lead heroine face in Act II.",
    src: "/assets/swarm/masterB_v2/heroine_face_identity_anchor.jpg",
    createdAt: "2026-09-21T00:02:30Z",
  },
];

function getManifestPath(): string {
  return path.join(process.cwd(), "public/assets/swarm/library_manifest.json");
}

export function loadLibraryAssets(): LibraryAssetItem[] {
  const manifestPath = getManifestPath();
  if (!fs.existsSync(manifestPath)) {
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
    fs.writeFileSync(manifestPath, JSON.stringify(DEFAULT_MASTER_B_V2_ASSETS, null, 2), "utf8");
    return DEFAULT_MASTER_B_V2_ASSETS;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_MASTER_B_V2_ASSETS;
  } catch {
    return DEFAULT_MASTER_B_V2_ASSETS;
  }
}

export function appendLibraryAssets(newItems: LibraryAssetItem[]): LibraryAssetItem[] {
  const existing = loadLibraryAssets();
  const map = new Map<string, LibraryAssetItem>();
  for (const item of [...newItems, ...existing]) {
    map.set(item.id, item);
  }
  const merged = Array.from(map.values());
  fs.writeFileSync(getManifestPath(), JSON.stringify(merged, null, 2), "utf8");
  return merged;
}

export async function GET() {
  const items = loadLibraryAssets();
  return NextResponse.json({ ok: true, count: items.length, items });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const itemsToAdd: LibraryAssetItem[] = Array.isArray(body.items)
      ? body.items
      : body.item
      ? [body.item]
      : [];
    const merged = appendLibraryAssets(itemsToAdd);
    return NextResponse.json({ ok: true, count: merged.length, items: merged });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
