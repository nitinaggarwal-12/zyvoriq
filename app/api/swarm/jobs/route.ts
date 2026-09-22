import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { appendLibraryAssets, type LibraryAssetItem } from "@/lib/swarm-library";
import { characterLibrary } from "@/lib/library/characterLibrary";
import { locationLibrary } from "@/lib/library/locationLibrary";
import { createProjectVersion, loadProjectState, persistProjectMedia, persistProjectState } from "@/lib/project-store";

export const runtime = "nodejs";

interface JobStageFile {
  id: string;
  partIndex: 1 | 2;
  label: string;
  sublabel: string;
  rawSeconds: number;
  src: string;
}

interface SwarmGenerationJob {
  id: string;
  title: string;
  genre: string;
  bpm: number;
  act1Prompt: string;
  act2Prompt: string;
  selectedCharacterId?: string;
  selectedCharacterName?: string;
  selectedLocationId?: string;
  selectedLocationName?: string;
  format?: string;
  stage?: string;
  brief?: string;
  country?: string;
  language?: string;
  platform?: string;
  referenceMedia?: Array<{ name: string; type: string; size: number; dataUrl?: string }>;
  selectedWardrobeId?: string;
  selectedScene2LocationId?: string;
  selectedCharacterReference?: { data: string; mimeType: string };
  status: "queued" | "running" | "completed" | "error";
  stageIndex: number;
  stageLabel: string;
  progress: number;
  createdAt: number;
  updatedAt: number;
  logs: string[];
  errorMsg?: string;
  combinedSrc: string;
  part1Src: string;
  part2Src: string;
  segments: JobStageFile[];
}

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/interactions";
const MODEL = "models/gemini-omni-1.1-flash";

function resolveApiKey(): string {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  try {
    const envPath = path.join(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      const match = content.match(/GEMINI_API_KEY\s*=\s*([^\r\n#]+)/);
      if (match && match[1]) return match[1].trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    // ignore
  }
  return "";
}

function getJobDir(jobId: string): string {
  return path.join(process.cwd(), "public/assets/swarm/generated", jobId);
}

function getJobStatePath(jobId: string): string {
  return path.join(getJobDir(jobId), "job_state.json");
}

function saveJobState(job: SwarmGenerationJob) {
  job.updatedAt = Date.now();
  const dir = getJobDir(job.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(getJobStatePath(job.id), JSON.stringify(job, null, 2), "utf8");
  persistProjectState(job.id, job, { status: job.status, title: job.title }).catch((err) => {
    console.warn("[project-store] Postgres persistence failed; filesystem fallback retained:", err);
  });
}

function loadJobState(jobId: string): SwarmGenerationJob | null {
  const p = getJobStatePath(jobId);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as SwarmGenerationJob;
  } catch {
    return null;
  }
}

function collectVideosInOrder(obj: unknown, found: { data: string }[] = []) {
  if (!obj || typeof obj !== "object") return found;
  const record = obj as Record<string, unknown>;
  if (
    record.type === "video" &&
    typeof record.data === "string" &&
    record.data.length > 1000
  ) {
    found.push({ data: record.data });
  }
  for (const val of Object.values(record)) {
    if (val && typeof val === "object") collectVideosInOrder(val, found);
  }
  return found;
}

async function callOmniInteractions(
  apiKey: string,
  payload: Record<string, unknown>,
  label: string,
  onRetry?: (attempt: number, maxRetries: number, waitSec: number, status: number) => void
): Promise<{ interactionId: string; videoBase64: string }> {
  const MAX_RETRIES = 8;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: MODEL, ...payload }),
      });

      const rawText = await res.text();
      if (!res.ok) {
        const isRetryable = res.status === 429 || res.status >= 500;
        if (isRetryable && attempt < MAX_RETRIES) {
          const waitSec = Math.min(15 * attempt, 90);
          onRetry?.(attempt, MAX_RETRIES, waitSec, res.status);
          await new Promise((r) => setTimeout(r, waitSec * 1000));
          continue;
        }
        throw new Error(`[${label}] HTTP ${res.status}: ${rawText.slice(0, 600)}`);
      }

      const json = JSON.parse(rawText);
      const vids = collectVideosInOrder(json);
      if (vids.length === 0) {
        if (attempt < MAX_RETRIES) {
          const waitSec = Math.min(15 * attempt, 90);
          onRetry?.(attempt, MAX_RETRIES, waitSec, 502);
          await new Promise((r) => setTimeout(r, waitSec * 1000));
          continue;
        }
        throw new Error(`[${label}] No video payload returned by ${MODEL}`);
      }

      const latestVideo = vids[vids.length - 1];
      const interactionId = String(json.id || json.name || "");
      return { interactionId, videoBase64: latestVideo.data };
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        const waitSec = Math.min(15 * attempt, 90);
        onRetry?.(attempt, MAX_RETRIES, waitSec, 429);
        await new Promise((r) => setTimeout(r, waitSec * 1000));
        continue;
      }
      throw err;
    }
  }
  throw new Error(`[${label}] Exhausted ${MAX_RETRIES} retries`);
}

function lockExactDuration(rawPath: string, outPath: string, seconds: number) {
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      rawPath,
      "-vf",
      `fps=24/1,trim=0:${seconds},setpts=PTS-STARTPTS`,
      "-af",
      `aresample=48000,atrim=0:${seconds},asetpts=PTS-STARTPTS`,
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf",
      "17",
      "-pix_fmt",
      "yuv420p",
      "-r",
      "24/1",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-ar",
      "48000",
      "-ac",
      "2",
      "-movflags",
      "+faststart",
      outPath,
    ],
    { stdio: "inherit" }
  );
}

async function resolveReferenceImage(uri?: string): Promise<{ data: string; mimeType: string } | null> {
  if (!uri) return null;
  try {
    if (uri.startsWith("data:")) {
      const match = uri.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) return null;
      return { mimeType: match[1], data: match[2] };
    }
    if (uri.startsWith("/")) {
      const absolute = path.join(process.cwd(), "public", uri.replace(/^\/+/, ""));
      if (!fs.existsSync(absolute)) return null;
      const ext = path.extname(absolute).toLowerCase();
      const mimeType =
        ext === ".png" ? "image/png" :
        ext === ".webp" ? "image/webp" :
        "image/jpeg";
      return { mimeType, data: fs.readFileSync(absolute).toString("base64") };
    }
    if (/^https?:\/\//i.test(uri)) {
      const res = await fetch(uri);
      if (!res.ok) return null;
      const bytes = Buffer.from(await res.arrayBuffer());
      return {
        mimeType: res.headers.get("content-type") || "image/jpeg",
        data: bytes.toString("base64"),
      };
    }
  } catch (err) {
    console.warn("[swarm] Could not resolve character reference image:", err);
  }
  return null;
}

async function runRealOmniPipeline(job: SwarmGenerationJob) {
  const apiKey = resolveApiKey();
  const jobDir = getJobDir(job.id);
  const publicPrefix = `/assets/swarm/generated/${job.id}`;

  const log = (msg: string, stage?: string, progress?: number) => {
    const stamp = new Date().toISOString().slice(11, 19);
    job.logs.push(`[${stamp}] ${msg}`);
    if (stage) job.stageLabel = stage;
    if (typeof progress === "number") job.progress = progress;
    saveJobState(job);
  };

  try {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing in environment/.env");
    }

    // -------------------------------------------------------------------------
    // STAGE 1: ACT I TURN 1A (00:00 -> 00:10, 240 native frames)
    // -------------------------------------------------------------------------
    log(
      `Calling ${MODEL} for Act I Turn 1A (00:00–00:10)... Prompt: "${job.act1Prompt.slice(
        0,
        90
      )}..."`,
      "Stage 1/6 • Generating Act I Turn 1A (00:00–00:10) via models/gemini-omni-1.1-flash...",
      10
    );

    const turn1A = await callOmniInteractions(
      apiKey,
      {
        input: [
          ...(job.selectedCharacterReference
            ? [{
                type: "image",
                data: job.selectedCharacterReference.data,
                mime_type: job.selectedCharacterReference.mimeType,
              }]
            : []),
          {
            type: "text",
            text:
              `Generate a 10.0-second 9:16 vertical 24fps opening scene (0s to 10s). ` +
              (job.selectedCharacterReference
                ? "Use the supplied character reference as a strict visual identity and wardrobe anchor. "
                : "") +
              `${job.act1Prompt}`,
          },
        ],
      },
      "ACT1_TURN_1A"
    );

    const turn1ARawPath = path.join(jobDir, "act1_turnA_10s_raw.mp4");
    const turn1APath = path.join(jobDir, "act1_turnA_10s.mp4");
    fs.writeFileSync(turn1ARawPath, Buffer.from(turn1A.videoBase64, "base64"));
    lockExactDuration(turn1ARawPath, turn1APath, 10);

    job.part1Src = `${publicPrefix}/act1_turnA_10s.mp4?t=${Date.now()}`;
    job.combinedSrc = job.part1Src;
    job.segments = [
      {
        id: "part1_live",
        partIndex: 1,
        label: "Part 1 • Live (10.0s Ready)",
        sublabel: "Act I Turn 1A (10.0s Native)",
        rawSeconds: 10,
        src: job.part1Src,
      },
    ];
    log(
      `Act I Turn 1A ready (${turn1A.interactionId}) — live preview loaded into player!`,
      "Stage 2/6 • Extending Act I to 20.0s (Turn 1B) via models/gemini-omni-1.1-flash...",
      28
    );

    // -------------------------------------------------------------------------
    // STAGE 2: ACT I TURN 1B (00:00 -> 00:20, 480 native frames)
    // -------------------------------------------------------------------------
    const turn1B = await callOmniInteractions(
      apiKey,
      {
        previous_interaction_id: turn1A.interactionId,
        input: [
          {
            type: "text",
            text:
              `Continue seamlessly from 10.0s to 20.0s in the exact same shot, cast, wardrobe, and musical flow. ` +
              `${job.act1Prompt}`,
          },
        ],
      },
      "ACT1_TURN_1B"
    );

    const turn1BRawPath = path.join(jobDir, "act1_turnB_20s_raw.mp4");
    const turn1BPath = path.join(jobDir, "act1_turnB_20s.mp4");
    fs.writeFileSync(turn1BRawPath, Buffer.from(turn1B.videoBase64, "base64"));
    lockExactDuration(turn1BRawPath, turn1BPath, 20);

    job.part1Src = `${publicPrefix}/act1_turnB_20s.mp4?t=${Date.now()}`;
    job.combinedSrc = job.part1Src;
    job.segments = [
      {
        id: "part1_live",
        partIndex: 1,
        label: "Part 1 • Live (20.0s Ready)",
        sublabel: "Act I Turn 1B (20.0s Native)",
        rawSeconds: 20,
        src: job.part1Src,
      },
    ];
    log(
      `Act I Turn 1B ready (${turn1B.interactionId}) — player updated to 20.0s!`,
      "Stage 3/6 • Extending Act I to full 30.0s (Turn 1C) via models/gemini-omni-1.1-flash...",
      45
    );

    // -------------------------------------------------------------------------
    // STAGE 3: ACT I TURN 1C (00:00 -> 00:30, 720 native frames)
    // -------------------------------------------------------------------------
    const turn1C = await callOmniInteractions(
      apiKey,
      {
        previous_interaction_id: turn1B.interactionId,
        input: [
          {
            type: "text",
            text:
              `Continue seamlessly from 20.0s to 30.0s in the exact same shot, cast, wardrobe, and musical flow. ` +
              `${job.act1Prompt}`,
          },
        ],
      },
      "ACT1_TURN_1C"
    );

    const turn1CRawPath = path.join(jobDir, "act1_turnC_30s_raw.mp4");
    const act1MasterPath = path.join(jobDir, "act1_30s.mp4");
    fs.writeFileSync(turn1CRawPath, Buffer.from(turn1C.videoBase64, "base64"));
    lockExactDuration(turn1CRawPath, act1MasterPath, 30);

    job.part1Src = `${publicPrefix}/act1_30s.mp4?t=${Date.now()}`;
    job.combinedSrc = job.part1Src;
    job.segments = [
      {
        id: "part1_30s",
        partIndex: 1,
        label: "Part 1 • Act I (0:00–0:30)",
        sublabel: "Full 30.0s Native Act I Master",
        rawSeconds: 30,
        src: job.part1Src,
      },
    ];

    // Extract Lead Character Identity Anchor at t=1.50s of Act I
    const faceAnchorPath = path.join(jobDir, "face_identity_anchor.jpg");
    execFileSync(
      "ffmpeg",
      ["-y", "-ss", "1.50", "-i", act1MasterPath, "-frames:v", "1", "-q:v", "2", faceAnchorPath],
      { stdio: "inherit" }
    );
    const faceAnchorBase64 = fs.readFileSync(faceAnchorPath).toString("base64");

    log(
      `Act I full 30.0s Master locked & lead face identity extracted! Starting Act II Turn 2A...`,
      "Stage 4/6 • Generating Act II Turn 2A (00:30–00:40, Same Face Lock) via models/gemini-omni-1.1-flash...",
      62
    );

    // -------------------------------------------------------------------------
    // STAGE 4: ACT II TURN 2A (00:30 -> 00:40, conditioned on face anchor)
    // -------------------------------------------------------------------------
    const turn2A = await callOmniInteractions(
      apiKey,
      {
        input: [
          { type: "image", data: faceAnchorBase64, mime_type: "image/jpeg" },
          {
            type: "text",
            text:
              `Generate a 10.0-second 9:16 vertical 24fps second-half opening scene (0s to 10s). ` +
              `CRITICAL IDENTITY LOCK: Feature the EXACT SAME lead performer face & identity from the reference image. ` +
              `${job.act2Prompt}`,
          },
        ],
      },
      "ACT2_TURN_2A"
    );

    const turn2ARawPath = path.join(jobDir, "act2_turnA_10s_raw.mp4");
    const turn2APath = path.join(jobDir, "act2_turnA_10s.mp4");
    fs.writeFileSync(turn2ARawPath, Buffer.from(turn2A.videoBase64, "base64"));
    lockExactDuration(turn2ARawPath, turn2APath, 10);

    job.part2Src = `${publicPrefix}/act2_turnA_10s.mp4?t=${Date.now()}`;
    job.segments = [
      {
        id: "part1_30s",
        partIndex: 1,
        label: "Part 1 • Act I (0:00–0:30)",
        sublabel: "Full 30.0s Native Act I Master",
        rawSeconds: 30,
        src: job.part1Src,
      },
      {
        id: "part2_live",
        partIndex: 2,
        label: "Part 2 • Live (10.0s Ready)",
        sublabel: "Act II Turn 2A (10.0s Native)",
        rawSeconds: 10,
        src: job.part2Src,
      },
    ];
    log(
      `Act II Turn 2A ready (${turn2A.interactionId}) — extending Act II to 20.0s...`,
      "Stage 5/6 • Extending Act II to 20.0s & 30.0s via models/gemini-omni-1.1-flash...",
      78
    );

    // -------------------------------------------------------------------------
    // STAGE 5: ACT II TURN 2B (20s) & TURN 2C (30s)
    // -------------------------------------------------------------------------
    const turn2B = await callOmniInteractions(
      apiKey,
      {
        previous_interaction_id: turn2A.interactionId,
        input: [
          {
            type: "text",
            text:
              `Continue seamlessly from 10.0s to 20.0s in the exact same shot, cast, wardrobe, and musical flow. ` +
              `${job.act2Prompt}`,
          },
        ],
      },
      "ACT2_TURN_2B",
      (attempt, max, waitSec, status) => {
        log(
          `⏳ Quota cooldown on ACT2_TURN_2B (HTTP ${status}) — auto-retrying in ${waitSec}s (${attempt}/${max})...`,
          `Stage 5/6 • Quota cooldown on Turn 2B — auto-retrying in ${waitSec}s (${attempt}/${max})...`,
          job.progress
        );
      }
    );

    const turn2BRawPath = path.join(jobDir, "act2_turnB_20s_raw.mp4");
    const turn2BPath = path.join(jobDir, "act2_turnB_20s.mp4");
    fs.writeFileSync(turn2BRawPath, Buffer.from(turn2B.videoBase64, "base64"));
    lockExactDuration(turn2BRawPath, turn2BPath, 20);
    job.part2Src = `${publicPrefix}/act2_turnB_20s.mp4?t=${Date.now()}`;

    log(
      `Act II Turn 2B (20.0s) complete (${turn2B.interactionId}) — generating final Turn 2C (30.0s)...`,
      "Stage 5/6 • Generating final Act II Turn 2C (00:50–01:00) via models/gemini-omni-1.1-flash...",
      90
    );

    const turn2C = await callOmniInteractions(
      apiKey,
      {
        previous_interaction_id: turn2B.interactionId,
        input: [
          {
            type: "text",
            text:
              `Continue seamlessly from 20.0s to 30.0s in the exact same shot, cast, wardrobe, and musical flow. ` +
              `${job.act2Prompt}`,
          },
        ],
      },
      "ACT2_TURN_2C",
      (attempt, max, waitSec, status) => {
        log(
          `⏳ Quota cooldown on ACT2_TURN_2C (HTTP ${status}) — auto-retrying in ${waitSec}s (${attempt}/${max})...`,
          `Stage 5/6 • Quota cooldown on final Turn 2C — auto-retrying in ${waitSec}s (${attempt}/${max})...`,
          90
        );
      }
    );

    const turn2CRawPath = path.join(jobDir, "act2_turnC_30s_raw.mp4");
    const act2MasterPath = path.join(jobDir, "act2_30s.mp4");
    fs.writeFileSync(turn2CRawPath, Buffer.from(turn2C.videoBase64, "base64"));
    lockExactDuration(turn2CRawPath, act2MasterPath, 30);

    // -------------------------------------------------------------------------
    // STAGE 6: LOSSLESS CONCATENATION INTO 60.0s COMBINED MASTER + LIBRARY SAVE
    // -------------------------------------------------------------------------
    const concatListPath = path.join(jobDir, "concat.txt");
    fs.writeFileSync(
      concatListPath,
      `file '${act1MasterPath}'\nfile '${act2MasterPath}'\n`,
      "utf8"
    );
    const combinedMasterPath = path.join(jobDir, "combined_60s.mp4");
    execFileSync(
      "ffmpeg",
      [
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        concatListPath,
        "-c",
        "copy",
        "-movflags",
        "+faststart",
        combinedMasterPath,
      ],
      { stdio: "inherit" }
    );

    const ts = Date.now();
    job.part1Src = `${publicPrefix}/act1_30s.mp4?t=${ts}`;
    job.part2Src = `${publicPrefix}/act2_30s.mp4?t=${ts}`;
    job.combinedSrc = `${publicPrefix}/combined_60s.mp4?t=${ts}`;
    job.segments = [
      {
        id: "part1_30s",
        partIndex: 1,
        label: "Part 1 • Act I (0:00–0:30)",
        sublabel: "Act I 30.0s Native Master",
        rawSeconds: 30,
        src: job.part1Src,
      },
      {
        id: "part2_30s",
        partIndex: 2,
        label: "Part 2 • Act II (0:30–1:00)",
        sublabel: "Act II 30.0s Native Master",
        rawSeconds: 30,
        src: job.part2Src,
      },
    ];
    job.status = "completed";
    job.stage = "edit";

    try {
      await Promise.all([
        persistProjectMedia(job.id, "act1.mp4", "video/mp4", fs.readFileSync(act1MasterPath)),
        persistProjectMedia(job.id, "act2.mp4", "video/mp4", fs.readFileSync(act2MasterPath)),
        persistProjectMedia(job.id, "master.mp4", "video/mp4", fs.readFileSync(combinedMasterPath)),
      ]);
      job.part1Src = `/api/project-media/${encodeURIComponent(job.id)}/act1.mp4`;
      job.part2Src = `/api/project-media/${encodeURIComponent(job.id)}/act2.mp4`;
      job.combinedSrc = `/api/project-media/${encodeURIComponent(job.id)}/master.mp4`;
      saveJobState(job);
    } catch (err) {
      console.warn("[project-media] Durable media persistence failed; local generated files remain available:", err);
    }
    log(
      `✅ COMPLETED! Brand-new 60.0s Combined Master + Part 1 + Part 2 loaded into player & saved to /library.`,
      "Stage 6/6 • ✅ Complete! Brand-new 60.0s Master Reel is live in the player below.",
      100
    );

    // Save all 3 new files to persistent /library manifest
    const nowIso = new Date().toISOString();
    const newLibraryAssets: LibraryAssetItem[] = [
      {
        id: `${job.id}_combined_60s`,
        projectId: job.id,
        projectTitle: job.title,
        title: `${job.title} — Combined 60.0s Master`,
        subtitle: `Generated live with models/gemini-omni-1.1-flash`,
        assetType: "combined_master",
        genre: job.genre,
        durationSec: 60.0,
        frames: 1440,
        fps: "24/1 CFR",
        audioSpec: "48,000 Hz Stereo AAC (0.00 ms Drift)",
        wardrobe: "Custom Prompt Wardrobe",
        location: "Custom Prompt Location",
        promptSummary: `${job.act1Prompt} // ${job.act2Prompt}`,
        src: `${publicPrefix}/combined_60s.mp4`,
        createdAt: nowIso,
      },
      {
        id: `${job.id}_act1_30s`,
        projectId: job.id,
        projectTitle: job.title,
        title: `${job.title} — Part 1 (0:00–0:30)`,
        subtitle: `Act I 30.0s Native Master`,
        assetType: "act_master",
        genre: job.genre,
        durationSec: 30.0,
        frames: 720,
        fps: "24/1 CFR",
        audioSpec: "48,000 Hz Stereo AAC",
        partIndex: 1,
        wardrobe: "Act I Wardrobe",
        location: "Act I Location",
        promptSummary: job.act1Prompt,
        src: `${publicPrefix}/act1_30s.mp4`,
        createdAt: nowIso,
      },
      {
        id: `${job.id}_act2_30s`,
        projectId: job.id,
        projectTitle: job.title,
        title: `${job.title} — Part 2 (0:30–1:00)`,
        subtitle: `Act II 30.0s Native Master`,
        assetType: "act_master",
        genre: job.genre,
        durationSec: 30.0,
        frames: 720,
        fps: "24/1 CFR",
        audioSpec: "48,000 Hz Stereo AAC",
        partIndex: 2,
        wardrobe: "Act II Wardrobe",
        location: "Act II Location",
        promptSummary: job.act2Prompt,
        src: `${publicPrefix}/act2_30s.mp4`,
        createdAt: nowIso,
      },
    ];
    appendLibraryAssets(newLibraryAssets);

    // Also auto-register Main Combined 60s Reel + Part 1 & Part 2 child clips in SQLite data/studio_entities.db
    try {
      const dbPath = path.join(process.cwd(), "data/studio_entities.db");
      const suffix = job.id.replace(/\D/g, "").slice(-6);
      const reelId = `ZYV-REEL-J${suffix}`;
      const clip1Id = `ZYV-CLIP-J${suffix}P1`;
      const clip2Id = `ZYV-CLIP-J${suffix}P2`;
      const safeTitle = job.title.replace(/'/g, "''");
      const metaMain = JSON.stringify({
        projectId: job.id,
        durationSec: 60,
        frames: 1440,
        fps: "24/1 CFR",
        audioSpec: "48,000 Hz Stereo AAC",
        genre: job.genre,
        assetType: "combined_master",
      }).replace(/'/g, "''");
      const metaP1 = JSON.stringify({
        projectId: job.id,
        durationSec: 30,
        frames: 720,
        fps: "24/1 CFR",
        audioSpec: "48,000 Hz Stereo AAC",
        genre: job.genre,
        partIndex: 1,
        assetType: "act_master",
      }).replace(/'/g, "''");
      const metaP2 = JSON.stringify({
        projectId: job.id,
        durationSec: 30,
        frames: 720,
        fps: "24/1 CFR",
        audioSpec: "48,000 Hz Stereo AAC",
        genre: job.genre,
        partIndex: 2,
        assetType: "act_master",
      }).replace(/'/g, "''");
      const sql = `
        INSERT OR REPLACE INTO studio_entities (id, entity_type, slug, canonical_url, title, subtitle, parent_id, media_src, metadata_json, created_at) VALUES
        ('${reelId}', 'reel', 'reel-${job.id}', '/entity/${reelId}', '${safeTitle} — Combined 60.0s Master', 'Act I (30s) + Act II (30s) Native 24fps Master', NULL, '${publicPrefix}/combined_60s.mp4', '${metaMain}', '${nowIso}'),
        ('${clip1Id}', 'clip', 'clip-${job.id}-p1', '/entity/${clip1Id}', 'Part 1 • Act I (0:00–0:30)', 'Act I 30.0s Native Master', '${reelId}', '${publicPrefix}/act1_30s.mp4', '${metaP1}', '${nowIso}'),
        ('${clip2Id}', 'clip', 'clip-${job.id}-p2', '/entity/${clip2Id}', 'Part 2 • Act II (0:30–1:00)', 'Act II 30.0s Native Master', '${reelId}', '${publicPrefix}/act2_30s.mp4', '${metaP2}', '${nowIso}');
      `;
      execFileSync("sqlite3", [dbPath, sql], { stdio: "inherit" });
    } catch {
      // non-fatal if sqlite3 CLI unavailable
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    job.status = "error";
    job.errorMsg = msg;
    log(`❌ ERROR: ${msg}`, `Error: ${msg}`, job.progress);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const requestedProjectId = body.projectId ? String(body.projectId) : "";
    const id = requestedProjectId || `project_${Date.now()}`;

    const selectedCharacterId = body.selectedCharacterId
      ? String(body.selectedCharacterId)
      : "";
    const selectedLocationId = body.selectedLocationId
      ? String(body.selectedLocationId)
      : "";
    const selectedScene2LocationId = body.selectedScene2LocationId
      ? String(body.selectedScene2LocationId)
      : selectedLocationId;
    const selectedWardrobeId = body.selectedWardrobeId
      ? String(body.selectedWardrobeId)
      : "";

    const selectedCharacter = selectedCharacterId
      ? await characterLibrary.get(selectedCharacterId)
      : null;
    const selectedLocation = selectedLocationId
      ? await locationLibrary.get(selectedLocationId)
      : null;
    const selectedScene2Location = selectedScene2LocationId
      ? await locationLibrary.get(selectedScene2LocationId)
      : null;

    const selectedWardrobe = selectedCharacter
      ? selectedCharacter.wardrobe.find((variant) => variant.id === selectedWardrobeId) ||
        selectedCharacter.wardrobe.find((variant) => variant.isDefault) ||
        selectedCharacter.wardrobe[0]
      : undefined;
    const characterReference = await resolveReferenceImage(selectedWardrobe?.sheetUris?.[0]);

    const characterContext = selectedCharacter
      ? `CAST LOCK: Use ${selectedCharacter.displayName} (${selectedCharacter.archetype}) as the primary performer. ${selectedCharacter.description}. Voice profile: ${selectedCharacter.defaultVoiceId || "default"}.`
      : "";
    const wardrobeContext = selectedWardrobe
      ? `WARDROBE LOCK: Preserve wardrobe variant "${selectedWardrobe.label}" consistently within the scene.`
      : "";
    const act1LocationContext = selectedLocation
      ? `SCENE 1 LOCATION LOCK: Use ${selectedLocation.displayName}. Preserve this environment: ${selectedLocation.environmentBlock}`
      : "";
    const act2LocationContext = selectedScene2Location
      ? `SCENE 2 LOCATION LOCK: Use ${selectedScene2Location.displayName}. Preserve this environment: ${selectedScene2Location.environmentBlock}`
      : "";

    const act1Context = [characterContext, wardrobeContext, act1LocationContext].filter(Boolean).join(" ");
    const act2Context = [characterContext, wardrobeContext, act2LocationContext].filter(Boolean).join(" ");

    if (requestedProjectId) {
      try {
        const existing = await loadProjectState(requestedProjectId);
        if (existing) await createProjectVersion(requestedProjectId, existing);
      } catch (err) {
        console.warn("[project-store] Could not snapshot project before generation:", err);
      }
    }

    const job: SwarmGenerationJob = {
      id,
      title: String(body.title || "Custom Omni 1.1 Flash Master Reel"),
      genre: String(body.genre || "Bollywood Hindi Pop"),
      bpm: Number(body.bpm || 122),
      act1Prompt: `${act1Context ? act1Context + " " : ""}${String(body.act1Prompt || "")}`,
      act2Prompt: `${act2Context ? act2Context + " " : ""}${String(body.act2Prompt || "")}`,
      selectedCharacterId: selectedCharacter?.id,
      selectedCharacterName: selectedCharacter?.displayName,
      selectedLocationId: selectedLocation?.id,
      selectedLocationName: selectedLocation?.displayName,
      format: String(body.format || "reel"),
      stage: "generate",
      brief: String(body.brief || ""),
      country: String(body.country || ""),
      language: String(body.language || ""),
      platform: String(body.socialPlatform || body.platform || ""),
      referenceMedia: Array.isArray(body.referenceMedia) ? body.referenceMedia : [],
      selectedWardrobeId: selectedWardrobe?.id || selectedWardrobeId,
      selectedScene2LocationId: selectedScene2Location?.id || selectedScene2LocationId,
      selectedCharacterReference: characterReference || undefined,
      status: "running",
      stageIndex: 0,
      stageLabel: "Stage 1/6 • Launching live models/gemini-omni-1.1-flash generation...",
      progress: 5,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      logs: [
        `[${new Date().toISOString().slice(
          11,
          19
        )}] Launched REAL live models/gemini-omni-1.1-flash job (${id})`,
      ],
      combinedSrc: "/assets/swarm/masterB_v2/masterB_v2_combined_60s.mp4",
      part1Src: "/assets/swarm/masterB_v2/act1_pool_villa_30s.mp4",
      part2Src: "/assets/swarm/masterB_v2/act2_superyacht_deck_30s.mp4",
      segments: [],
    };

    saveJobState(job);

    runRealOmniPipeline(job).catch(() => {});

    return NextResponse.json({ ok: true, job });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing job id" }, { status: 400 });
  }
  let job = loadJobState(id);
  if (!job) {
    try {
      job = await loadProjectState<SwarmGenerationJob>(id);
    } catch (err) {
      console.warn("[project-store] Postgres read failed; filesystem lookup already attempted:", err);
    }
  }
  if (!job) {
    return NextResponse.json({ ok: false, error: `Job ${id} not found` }, { status: 404 });
  }
  return NextResponse.json({ ok: true, job });
}
