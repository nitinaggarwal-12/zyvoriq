import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { NextRequest, NextResponse } from "next/server";
import { getDatabase, getPostgresPool } from "@/lib/db/client";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export interface EditorClipInput {
  id: string;
  videoUrl: string;
  trimStartSec: number;
  trimEndSec: number;
  speed?: number; // Independent visual clip playback speed (0.5x - 2.0x)
  enabled: boolean;
}

export interface EditorRenderRequest {
  reelId: string;
  title?: string;
  clips: EditorClipInput[];
  globalVideoSpeed?: number; // Global visual speed multiplier (0.25x - 4.0x)
  colorGrading?: string; // "none" | "cyberpunk_neon" | "golden_hour_warm" | "moonlight_noir" | "bollywood_royal" | "vintage_film"
  // Independent Dialogue / Vocals Track
  vocalMode: "original" | "mute" | "custom";
  vocalUrl?: string;
  vocalVolume: number; // 0.0 to 1.5
  vocalSpeed?: number; // Independent vocal/dialogue speed (0.25x - 4.0x)
  // Independent Music Track (Unaltered across video cuts by default)
  musicTrack: string; // URL or preset path ("original_lyria", "/assets/audio/music/...", "none")
  musicLockMode?: "unaltered" | "custom_trim"; // "unaltered" keeps music continuous even when video frames are cut/added
  musicTrimStartSec?: number;
  musicTrimEndSec?: number;
  musicVolume: number; // 0.0 to 1.5
  musicSpeed?: number; // Independent music tempo/playback speed (0.25x - 4.0x)
  // Independent Background Sound Effect (SFX) Track
  sfxTrack: string; // URL or preset path ("none", "/assets/audio/sfx/...", etc.)
  sfxVolume: number; // 0.0 to 1.0
  sfxSpeed?: number; // Independent SFX playback speed (0.25x - 4.0x)
}

function resolveLocalFilePath(urlOrPath: any): string | null {
  if (!urlOrPath || urlOrPath === "none") return null;
  const str = typeof urlOrPath === "string" ? urlOrPath : String(urlOrPath?.url || urlOrPath?.videoUrl || "");
  if (!str || str === "none") return null;
  const clean = str.split("?")[0];
  if (clean.startsWith("/")) {
    const candidate = path.join(process.cwd(), "public", clean);
    if (fs.existsSync(candidate)) return candidate;
    const candidateRoot = path.join(process.cwd(), clean.replace(/^\//, ""));
    if (fs.existsSync(candidateRoot)) return candidateRoot;
  }
  if (fs.existsSync(clean)) return clean;
  return null;
}

function buildColorGradingFilter(grading?: string): string {
  switch (grading) {
    case "cyberpunk_neon":
      return "eq=contrast=1.18:saturation=1.38:brightness=0.02,colorbalance=rs=-0.08:gs=0.04:bs=0.18:rh=0.12:gh=-0.04:bh=0.15";
    case "golden_hour_warm":
      return "eq=contrast=1.08:saturation=1.22:brightness=0.03,colorbalance=rs=0.14:gs=0.06:bs=-0.12:rh=0.10:gh=0.04:bh=-0.08";
    case "mediterranean_sunlit":
      return "eq=contrast=1.12:saturation=1.28:brightness=0.04,colorbalance=rs=0.06:gs=0.05:bs=0.08";
    case "bollywood_royal":
      return "eq=contrast=1.16:saturation=1.34:gamma=1.04,colorbalance=rs=0.12:gs=0.02:bs=-0.05:rh=0.15:gh=0.05:bh=-0.05";
    case "vintage_film":
      return "eq=contrast=1.06:saturation=0.82:brightness=0.02,colorbalance=rs=0.08:gs=0.04:bs=-0.06";
    default:
      return "";
  }
}

/** Build pitch-preserved FFmpeg atempo filter chain for speeds in [0.25, 4.0] */
function buildAtempoFilter(speed: number | undefined): string {
  let s = Math.max(0.25, Math.min(4.0, Number(speed || 1.0)));
  if (Math.abs(s - 1.0) < 0.01) return "anull";
  const stages: string[] = [];
  while (s < 0.5 - 1e-6) {
    stages.push("atempo=0.5");
    s /= 0.5;
  }
  while (s > 2.0 + 1e-6) {
    stages.push("atempo=2.0");
    s /= 2.0;
  }
  if (Math.abs(s - 1.0) >= 0.01) {
    stages.push(`atempo=${s.toFixed(3)}`);
  }
  return stages.length ? stages.join(",") : "anull";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as EditorRenderRequest;
    const enabledClips = (body.clips || []).filter((c) => c.enabled && c.videoUrl);
    if (enabledClips.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one active video clip is required to render." },
        { status: 400 }
      );
    }

    const editId = `edit_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const workDir = path.join(process.cwd(), "scratch", "nle_renders", editId);
    const outDir = path.join(process.cwd(), "scratch", "renders", "edited");
    const pubOutDir = path.join(process.cwd(), "public", "renders", "edited");
    fs.mkdirSync(workDir, { recursive: true });
    fs.mkdirSync(outDir, { recursive: true });
    fs.mkdirSync(pubOutDir, { recursive: true });

    const globalVideoSpeed = Math.max(0.25, Math.min(4.0, Number(body.globalVideoSpeed || 1.0)));

    // 1. PURE VISUAL PIPELINE: Trim each video clip to [trimStartSec, trimEndSec] and apply visual speed ONLY (-an)
    // This guarantees cutting/adding video frames or changing video speed NEVER chops or distorts the continuous music track!
    const trimmedSegments: string[] = [];
    let firstValidSourcePath: string | null = null;

    for (let i = 0; i < enabledClips.length; i++) {
      const clip = enabledClips[i];
      const localSrc = resolveLocalFilePath(clip.videoUrl);
      if (!localSrc) {
        return NextResponse.json(
          { success: false, error: `Clip #${i + 1} source file not found locally: ${clip.videoUrl}` },
          { status: 404 }
        );
      }
      if (!firstValidSourcePath) firstValidSourcePath = localSrc;

      const start = Math.max(0, Number(clip.trimStartSec || 0));
      const end = Math.max(start + 0.2, Number(clip.trimEndSec || 6));
      const dur = Number((end - start).toFixed(3));
      const segPath = path.join(workDir, `seg_${String(i).padStart(2, "0")}.mp4`);

      const effectiveVideoSpeed = Math.max(0.25, Math.min(4.0, Number(clip.speed || 1.0) * globalVideoSpeed));
      const vfStages: string[] = [];
      if (Math.abs(effectiveVideoSpeed - 1.0) > 0.01) {
        vfStages.push(`setpts=${(1 / effectiveVideoSpeed).toFixed(4)}*PTS`);
      }
      const gradingFilter = buildColorGradingFilter(body.colorGrading);
      if (gradingFilter) {
        vfStages.push(gradingFilter);
      }
      vfStages.push("fps=24");

      execFileSync("ffmpeg", [
        "-y",
        "-ss",
        String(start),
        "-t",
        String(dur),
        "-i",
        localSrc,
        "-an", // Pure visual stream; audio stems are mixed independently below
        "-vf",
        vfStages.join(","),
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "22",
        "-tune",
        "fastdecode",
        "-threads",
        "0",
        segPath,
      ]);
      trimmedSegments.push(segPath);
    }

    // 2. Concatenate pure visual segments
    const concatListPath = path.join(workDir, "concat.txt");
    fs.writeFileSync(
      concatListPath,
      trimmedSegments.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n")
    );
    const concatVideoPath = path.join(workDir, "concat_video.mp4");
    execFileSync("ffmpeg", [
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      concatListPath,
      "-c",
      "copy",
      concatVideoPath,
    ]);

    // Measure edited visual timeline duration
    const probeOut = execFileSync("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      concatVideoPath,
    ])
      .toString()
      .trim();
    const totalDurationSec = Math.max(1, parseFloat(probeOut) || 12);

    // 3. INDEPENDENT 3-STEM AUDIO MASTERING ENGINE
    // Discover separated stems (vocals.wav / no_vocals.wav / song.mp3) if available for this reel
    let reelVocalStemPath: string | null = null;
    let reelMusicStemPath: string | null = null;
    if (body.reelId) {
      const candidates = [
        path.join(process.cwd(), "public", "renders", "yt", body.reelId),
        path.join(process.cwd(), "scratch", "yt", body.reelId),
      ];
      for (const dir of candidates) {
        if (fs.existsSync(path.join(dir, "stems", "htdemucs", "song", "vocals.wav"))) {
          reelVocalStemPath = path.join(dir, "stems", "htdemucs", "song", "vocals.wav");
        }
        if (fs.existsSync(path.join(dir, "stems", "htdemucs", "song", "no_vocals.wav"))) {
          reelMusicStemPath = path.join(dir, "stems", "htdemucs", "song", "no_vocals.wav");
        } else if (fs.existsSync(path.join(dir, "song.mp3"))) {
          reelMusicStemPath = path.join(dir, "song.mp3");
        }
      }
    }

    const vocalVol = body.vocalMode === "mute" ? 0 : Math.max(0, Number(body.vocalVolume ?? 1.0));
    const vocalSpeed = Math.max(0.25, Math.min(4.0, Number(body.vocalSpeed ?? 1.0)));

    const musicVol = Math.max(0, Number(body.musicVolume ?? 0.65));
    const musicSpeed = Math.max(0.25, Math.min(4.0, Number(body.musicSpeed ?? 1.0)));

    const sfxVol = Math.max(0, Number(body.sfxVolume ?? 0.35));
    const sfxSpeed = Math.max(0.25, Math.min(4.0, Number(body.sfxSpeed ?? 1.0)));

    // Resolve Vocal/Dialogue Source
    const vocalSourceFile =
      (body.vocalUrl && resolveLocalFilePath(body.vocalUrl)) ||
      reelVocalStemPath ||
      firstValidSourcePath;

    // Resolve Music Bed Source (Unaltered continuous stream unless custom_trim specified)
    let musicSourceFile: string | null = null;
    if (body.musicTrack === "original_lyria") {
      musicSourceFile = reelMusicStemPath || firstValidSourcePath;
    } else if (body.musicTrack && body.musicTrack !== "none") {
      musicSourceFile = resolveLocalFilePath(body.musicTrack);
    }

    // Resolve SFX Source
    const sfxSourceFile = resolveLocalFilePath(body.sfxTrack);

    const finalFileName = `${body.reelId || "reel"}_${editId}.mp4`;
    const finalOutputPath = path.join(outDir, finalFileName);
    const publicOutputUrl = `/renders/edited/${finalFileName}`;

    const inputs: string[] = ["-i", concatVideoPath];
    const filterParts: string[] = [];
    const mixInputs: string[] = [];
    let inputIdx = 1;

    const isSameMasterAudio =
      vocalSourceFile &&
      musicSourceFile &&
      path.resolve(vocalSourceFile) === path.resolve(musicSourceFile);

    if (isSameMasterAudio) {
      // Single continuous Original Lyria Master Audio stream (100% unaltered music + vocals across all stitched cuts)
      const masterVol = Math.max(vocalVol, musicVol, 1.0);
      inputs.push("-stream_loop", "-1", "-i", vocalSourceFile);
      const atempoMaster = buildAtempoFilter(musicSpeed);
      filterParts.push(
        `[${inputIdx}:a]${atempoMaster},atrim=0:${totalDurationSec.toFixed(3)},asetpts=PTS-STARTPTS,volume=${masterVol.toFixed(2)}[a_master]`
      );
      mixInputs.push("[a_master]");
      inputIdx++;
    } else {
      // Track A: Dialogue / Vocals Stem (with independent vocalSpeed & vocalVolume)
      if (vocalSourceFile && vocalVol > 0.01) {
        inputs.push("-stream_loop", "-1", "-i", vocalSourceFile);
        const atempoVocal = buildAtempoFilter(vocalSpeed);
        filterParts.push(
          `[${inputIdx}:a]${atempoVocal},atrim=0:${totalDurationSec.toFixed(3)},asetpts=PTS-STARTPTS,volume=${vocalVol.toFixed(2)}[a_vocal]`
        );
        mixInputs.push("[a_vocal]");
        inputIdx++;
      }

      // Track B: Unaltered Continuous Music Bed (with independent musicSpeed & musicVolume)
      if (musicSourceFile && musicVol > 0.01) {
        inputs.push("-stream_loop", "-1", "-i", musicSourceFile);
        const mStart = body.musicLockMode === "custom_trim" ? Math.max(0, Number(body.musicTrimStartSec || 0)) : 0;
        const atempoMusic = buildAtempoFilter(musicSpeed);
        filterParts.push(
          `[${inputIdx}:a]atrim=start=${mStart.toFixed(3)},asetpts=PTS-STARTPTS,${atempoMusic},atrim=0:${totalDurationSec.toFixed(3)},asetpts=PTS-STARTPTS,volume=${musicVol.toFixed(2)}[a_music]`
        );
        mixInputs.push("[a_music]");
        inputIdx++;
      }
    }

    // Track C: Background Sound Effect / Foley (with independent sfxSpeed & sfxVolume)
    if (sfxSourceFile && sfxVol > 0.01) {
      inputs.push("-stream_loop", "-1", "-i", sfxSourceFile);
      const atempoSfx = buildAtempoFilter(sfxSpeed);
      filterParts.push(
        `[${inputIdx}:a]${atempoSfx},atrim=0:${totalDurationSec.toFixed(3)},asetpts=PTS-STARTPTS,volume=${sfxVol.toFixed(2)}[a_sfx]`
      );
      mixInputs.push("[a_sfx]");
      inputIdx++;
    }

    if (mixInputs.length === 0) {
      // Silent audio track fallback if user muted all 3 tracks
      inputs.push("-f", "lavfi", "-i", `anullsrc=r=48000:cl=stereo:d=${totalDurationSec.toFixed(3)}`);
      filterParts.push(`[${inputIdx}:a]anull[a_out]`);
    } else if (mixInputs.length === 1) {
      filterParts.push(`${mixInputs[0]}alimiter=limit=0.95[a_out]`);
    } else {
      filterParts.push(
        `${mixInputs.join("")}amix=inputs=${mixInputs.length}:duration=first:dropout_transition=2,alimiter=limit=0.95[a_out]`
      );
    }

    execFileSync("ffmpeg", [
      "-y",
      ...inputs,
      "-filter_complex",
      filterParts.join(";"),
      "-map",
      "0:v:0",
      "-map",
      "[a_out]",
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-shortest",
      finalOutputPath,
    ]);
    try {
      fs.copyFileSync(finalOutputPath, path.join(pubOutDir, finalFileName));
    } catch {}

    // 4. Append as a new non-destructive Version (v2, v3...) in DB record
    let savedVersionNumber = 2;
    let savedVersionsList: any[] = [];
    try {
      const db = getDatabase();
      if (db && body.reelId) {
        const row = db.prepare(`SELECT manifest_json FROM yt_productions WHERE id = ?`).get(body.reelId) as any;
        if (row) {
          const manifest = JSON.parse(row.manifest_json || "{}");
          if (!manifest.assets) manifest.assets = {};
          const origUrl = manifest.assets.masterHybridUrl || manifest.assets.masterNativeUrl || "/renders/yt/default.mp4";
          const existingVersions = Array.isArray(manifest.versions) && manifest.versions.length > 0
            ? manifest.versions
            : [
                {
                  versionNumber: 1,
                  label: "v1 • Original Master",
                  url: origUrl,
                  durationSec: 24,
                  createdAt: new Date(Date.now() - 3600000).toISOString(),
                },
              ];
          savedVersionNumber = existingVersions.length + 1;
          const newVer = {
            versionNumber: savedVersionNumber,
            label: body.title || `v${savedVersionNumber} • Studio NLE Edit (${Number(totalDurationSec).toFixed(1)}s)`,
            url: publicOutputUrl,
            durationSec: Number(totalDurationSec.toFixed(2)),
            createdAt: new Date().toISOString(),
          };
          existingVersions.push(newVer);
          manifest.versions = existingVersions;
          manifest.editedMasterUrl = publicOutputUrl;
          manifest.assets.editedMasterUrl = publicOutputUrl;
          savedVersionsList = existingVersions;

          db.prepare(`UPDATE yt_productions SET manifest_json = ?, updated_at = datetime('now') WHERE id = ?`).run(
            JSON.stringify(manifest),
            body.reelId
          );
        }
      }

      const pool = getPostgresPool();
      if (pool && body.reelId) {
        const pgRes = await pool.query(`SELECT manifest_json FROM yt_productions WHERE id = $1`, [body.reelId]);
        if (pgRes.rows.length > 0) {
          const manifest = JSON.parse(pgRes.rows[0].manifest_json || "{}");
          if (!manifest.assets) manifest.assets = {};
          const origUrl = manifest.assets.masterHybridUrl || manifest.assets.masterNativeUrl || "/renders/yt/default.mp4";
          const existingVersions = Array.isArray(manifest.versions) && manifest.versions.length > 0
            ? manifest.versions
            : [
                {
                  versionNumber: 1,
                  label: "v1 • Original Master",
                  url: origUrl,
                  durationSec: 24,
                  createdAt: new Date(Date.now() - 3600000).toISOString(),
                },
              ];
          const vNum = existingVersions.length + 1;
          const newVer = {
            versionNumber: vNum,
            label: body.title || `v${vNum} • Studio NLE Edit (${Number(totalDurationSec).toFixed(1)}s)`,
            url: publicOutputUrl,
            durationSec: Number(totalDurationSec.toFixed(2)),
            createdAt: new Date().toISOString(),
          };
          existingVersions.push(newVer);
          manifest.versions = existingVersions;
          manifest.editedMasterUrl = publicOutputUrl;
          manifest.assets.editedMasterUrl = publicOutputUrl;
          if (!savedVersionsList.length) savedVersionsList = existingVersions;

          await pool.query(
            `UPDATE yt_productions SET manifest_json = $1, updated_at = NOW() WHERE id = $2`,
            [JSON.stringify(manifest), body.reelId]
          );
        }
      }
    } catch (dbErr) {
      console.warn("Optional DB update after NLE render:", dbErr);
    }

    return NextResponse.json({
      success: true,
      editId,
      versionNumber: savedVersionNumber,
      outputUrl: publicOutputUrl,
      durationSec: Number(totalDurationSec.toFixed(2)),
      clipCount: enabledClips.length,
      versions: savedVersionsList,
    });
  } catch (err: any) {
    console.error("[api/reels/editor/render] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to render edited video master." },
      { status: 500 }
    );
  }
}
