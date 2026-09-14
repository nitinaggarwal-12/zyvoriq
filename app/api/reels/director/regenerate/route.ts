import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { execFileSync, spawn } from "node:child_process";
import { getDatabase, getPostgresPool } from "@/lib/db/client";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

interface DirectorCustomizationPayload {
  reelId: string;
  sourceVideoUrl?: string;
  versionLabel?: string;
  mode?: "instant_remaster" | "full_ai_pipeline";
  direction?: {
    character?: {
      name?: string;
      ethnicity?: string;
      styling?: string;
      gender?: string;
    };
    wardrobe?: {
      preset?: string;
      description?: string;
    };
    location?: {
      environment?: string;
      lighting?: string;
      cameraLens?: string;
      colorGrading?: "none" | "cyberpunk_neon" | "golden_hour_warm" | "mediterranean_sunlit" | "bollywood_royal" | "vintage_film";
    };
    lyrics?: {
      text?: string;
      tempoBpm?: number;
      genreStyle?: string;
    };
    dialogue?: {
      vocalTimbre?: string;
      vocalVolume?: number;
      vocalSpeed?: number;
    };
    choreography?: {
      danceStyle?: string;
      cameraMotion?: string;
    };
    audio?: {
      musicTrackUrl?: string;
      musicVolume?: number;
      musicSpeed?: number;
      sfxPreset?: string;
      sfxVolume?: number;
      sfxSpeed?: number;
    };
    surgicalCuts?: Array<{
      id: string;
      startSec: number;
      endSec: number;
      target: "ripple_both" | "mute_vocal" | "mute_music" | "freeze_video";
      label?: string;
    }>;
  };
}

function buildAtempoFilter(speed: number): string {
  const s = Math.max(0.25, Math.min(4.0, Number(speed) || 1.0));
  if (Math.abs(s - 1.0) < 0.01) return "";
  const stages: number[] = [];
  let rem = s;
  while (rem < 0.5) {
    stages.push(0.5);
    rem /= 0.5;
  }
  while (rem > 2.0) {
    stages.push(2.0);
    rem /= 2.0;
  }
  if (Math.abs(rem - 1.0) > 0.01) {
    stages.push(Number(rem.toFixed(4)));
  }
  return stages.map((v) => `atempo=${v}`).join(",");
}

function resolveLocalFile(urlOrPath: string): string | null {
  if (!urlOrPath) return null;
  const clean = urlOrPath.split("?")[0].split("#")[0].replace(/^https?:\/\/[^/]+/, "");
  const candidates = [
    path.join(process.cwd(), "public", clean),
    path.join(process.cwd(), clean),
    path.join(process.cwd(), "scratch", clean.replace(/^\/+/, "")),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
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

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as DirectorCustomizationPayload;
    const { reelId, sourceVideoUrl, versionLabel, mode = "instant_remaster", direction = {} } = body;

    if (!reelId) {
      return NextResponse.json({ error: "reelId is required" }, { status: 400 });
    }

    // Mode 1: Full AI Pipeline Re-Generation (spawns a brand new Omni 1.1 + Lyria 3.5 + Veo production)
    if (mode === "full_ai_pipeline") {
      const charDesc = direction.character
        ? `${direction.character.name || ""} (${direction.character.ethnicity || ""} ${direction.character.gender || ""}, ${direction.character.styling || ""})`.trim()
        : "";
      const wardDesc = direction.wardrobe?.description || direction.wardrobe?.preset || "";
      const locDesc = direction.location
        ? `in ${direction.location.environment || "studio"}, ${direction.location.lighting || ""} lighting, shot on ${direction.location.cameraLens || "35mm"}`
        : "";
      const danceDesc = direction.choreography?.danceStyle ? `performing ${direction.choreography.danceStyle}` : "";
      const lyricsDesc = direction.lyrics?.text ? `Lyrics: ${direction.lyrics.text.replace(/\n+/g, " / ")}` : "";

      const compiledPrompt = [
        `[DIRECTOR RE-PRODUCTION OF ${reelId}]`,
        charDesc ? `Lead Artist: ${charDesc}.` : "",
        wardDesc ? `Wardrobe: ${wardDesc}.` : "",
        locDesc ? `Location & Optics: ${locDesc}.` : "",
        danceDesc ? `Choreography: ${danceDesc}.` : "",
        lyricsDesc,
      ]
        .filter(Boolean)
        .join(" ");

      const newId = `yt_${crypto.randomUUID()}`;
      const now = new Date().toISOString();

      const pg = getPostgresPool();
      if (pg) {
        await pg.query(
          `INSERT INTO yt_productions (id, topic, genre, duration_sec, platform, status, created_at, updated_at)
           VALUES ($1,$2,'MUSIC_VIDEO',24,'YouTube Shorts','PENDING',$3,$3)`,
          [newId, compiledPrompt.slice(0, 580), now]
        );
      } else {
        const db = getDatabase();
        db.prepare(
          `INSERT INTO yt_productions (id, topic, genre, duration_sec, platform, status, created_at, updated_at)
           VALUES (?,?,'MUSIC_VIDEO',24,'YouTube Shorts','PENDING',?,?)`
        ).run(newId, compiledPrompt.slice(0, 580), now, now);
      }

      // Spawn background pipeline runner
      const script = path.resolve(process.cwd(), "scripts", "yt_pipeline.mjs");
      if (fs.existsSync(script)) {
        try {
          const logDir = path.resolve(process.cwd(), "scratch", "yt_logs");
          fs.mkdirSync(logDir, { recursive: true });
          const fd = fs.openSync(path.join(logDir, `${newId}.log`), "a");
          const child = spawn(process.execPath, [script, "--production", newId], {
            detached: true,
            stdio: ["ignore", fd, fd],
            env: { ...process.env, YT_PRODUCTION_ID: newId },
          });
          child.unref();
        } catch (err) {
          console.warn("[director/regenerate] Pipeline spawn warning:", err);
        }
      }

      return NextResponse.json({
        success: true,
        mode: "full_ai_pipeline",
        newProductionId: newId,
        compiledPrompt,
        message: `Launched full AI re-generation pipeline (${newId}) with your customized Director DNA!`,
      });
    }

    // Mode 2: Instant Director Re-Master (applies custom color grading, audio/Lyria stem mixing, vocal/music speed, SFX & saves a new non-destructive version immediately)
    let inputVideoPath = sourceVideoUrl ? resolveLocalFile(sourceVideoUrl) : null;
    if (!inputVideoPath) {
      // Fallback search by reelId
      const ytCandidate = path.join(process.cwd(), "public", "renders", "yt", reelId, "master_hybrid.mp4");
      const ytCandidate2 = path.join(process.cwd(), "public", "renders", "yt", reelId, "master.mp4");
      const studioCandidate = path.join(process.cwd(), "public", "assets", "video", "studio1_e2e00945.mp4");
      if (fs.existsSync(ytCandidate)) inputVideoPath = ytCandidate;
      else if (fs.existsSync(ytCandidate2)) inputVideoPath = ytCandidate2;
      else if (fs.existsSync(studioCandidate)) inputVideoPath = studioCandidate;
    }

    if (!inputVideoPath || !fs.existsSync(inputVideoPath)) {
      return NextResponse.json(
        { error: `Could not locate base master video file for ${reelId} to re-master.` },
        { status: 404 }
      );
    }

    const outDir = path.join(process.cwd(), "scratch", "renders", "edited");
    const pubOutDir = path.join(process.cwd(), "public", "renders", "edited");
    fs.mkdirSync(outDir, { recursive: true });
    fs.mkdirSync(pubOutDir, { recursive: true });
    const stamp = Date.now();
    const outFilename = `${reelId}_director_${stamp}.mp4`;
    const outPath = path.join(outDir, outFilename);
    const pubOutPath = path.join(pubOutDir, outFilename);
    const publicOutUrl = `/renders/edited/${outFilename}`;

    const gradingFilter = buildColorGradingFilter(direction.location?.colorGrading);
    const vocalVol = Number(direction.dialogue?.vocalVolume ?? 1.0);
    const vocalSpd = Number(direction.dialogue?.vocalSpeed ?? 1.0);
    const musicVol = Number(direction.audio?.musicVolume ?? 1.0);
    const musicSpd = Number(direction.audio?.musicSpeed ?? 1.0);
    const sfxPreset = direction.audio?.sfxPreset || "none";
    const sfxVol = Number(direction.audio?.sfxVolume ?? 0.45);

    const sfxMap: Record<string, string> = {
      pool_splash: path.join(process.cwd(), "public", "assets", "audio", "sfx", "pool_party_splash.mp3"),
      crowd_cheer: path.join(process.cwd(), "public", "assets", "audio", "sfx", "club_crowd_cheer.mp3"),
      ocean_waves: path.join(process.cwd(), "public", "assets", "audio", "sfx", "coastal_ocean_breeze.mp3"),
      vinyl_rain: path.join(process.cwd(), "public", "assets", "audio", "sfx", "vinyl_rain_ambiance.mp3"),
    };
    const sfxFile = sfxPreset !== "none" && sfxMap[sfxPreset] && fs.existsSync(sfxMap[sfxPreset]) ? sfxMap[sfxPreset] : null;
    const customMusicFile = direction.audio?.musicTrackUrl ? resolveLocalFile(direction.audio.musicTrackUrl) : null;

    // Build FFmpeg command
    const args: string[] = ["-y", "-i", inputVideoPath];
    let inputIdx = 1;
    let musicIdx = -1;
    let sfxIdx = -1;

    if (customMusicFile && fs.existsSync(customMusicFile)) {
      args.push("-stream_loop", "-1", "-i", customMusicFile);
      musicIdx = inputIdx++;
    }
    if (sfxFile) {
      args.push("-stream_loop", "-1", "-i", sfxFile);
      sfxIdx = inputIdx++;
    }

    const filterParts: string[] = [];
    const surgicalCuts = direction.surgicalCuts || [];

    // Video stream filter (color grading LUT + surgical frame blackouts/freezes)
    const videoFilterStages: string[] = [];
    if (gradingFilter) {
      videoFilterStages.push(gradingFilter);
    }
    for (const cut of surgicalCuts) {
      if (cut.target === "ripple_both" || cut.target === "freeze_video") {
        const s = Math.max(0, Number(cut.startSec) || 0).toFixed(3);
        const e = Math.max(Number(s) + 0.05, Number(cut.endSec) || 0).toFixed(3);
        videoFilterStages.push(
          `drawbox=enable='between(t,${s},${e})':color=black@0.92:t=fill`
        );
      }
    }
    const hasVideoFilter = videoFilterStages.length > 0;
    if (hasVideoFilter) {
      filterParts.push(`[0:v]${videoFilterStages.join(",")}[vout]`);
    }

    // Audio stream mixing + surgical stem mute windows
    const audioMixInputs: string[] = [];
    const atempoVocal = buildAtempoFilter(vocalSpd);
    const vocalMuteStages = surgicalCuts
      .filter((c) => c.target === "ripple_both" || c.target === "mute_vocal")
      .map((c) => {
        const s = Math.max(0, Number(c.startSec) || 0).toFixed(3);
        const e = Math.max(Number(s) + 0.05, Number(c.endSec) || 0).toFixed(3);
        return `volume=enable='between(t,${s},${e})':volume=0`;
      });
    const vocalFilterChain = [`volume=${vocalVol.toFixed(2)}`, ...vocalMuteStages, atempoVocal]
      .filter(Boolean)
      .join(",");
    filterParts.push(`[0:a]${vocalFilterChain}[a_base]`);
    audioMixInputs.push("[a_base]");

    if (musicIdx >= 0) {
      const atempoMusic = buildAtempoFilter(musicSpd);
      const musicMuteStages = surgicalCuts
        .filter((c) => c.target === "ripple_both" || c.target === "mute_music")
        .map((c) => {
          const s = Math.max(0, Number(c.startSec) || 0).toFixed(3);
          const e = Math.max(Number(s) + 0.05, Number(c.endSec) || 0).toFixed(3);
          return `volume=enable='between(t,${s},${e})':volume=0`;
        });
      const musicChain = [`volume=${musicVol.toFixed(2)}`, ...musicMuteStages, atempoMusic]
        .filter(Boolean)
        .join(",");
      filterParts.push(`[${musicIdx}:a]${musicChain}[a_music]`);
      audioMixInputs.push("[a_music]");
    }

    if (sfxIdx >= 0) {
      filterParts.push(`[${sfxIdx}:a]volume=${sfxVol.toFixed(2)}[a_sfx]`);
      audioMixInputs.push("[a_sfx]");
    }

    if (audioMixInputs.length > 1) {
      filterParts.push(
        `${audioMixInputs.join("")}amix=inputs=${audioMixInputs.length}:duration=first:dropout_transition=2[aout]`
      );
    } else {
      filterParts.push(`[a_base]anull[aout]`);
    }

    args.push(
      "-filter_complex",
      filterParts.join(";"),
      "-map",
      hasVideoFilter ? "[vout]" : "0:v",
      "-map",
      "[aout]",
      "-c:v",
      gradingFilter ? "libx264" : "copy",
      ...(gradingFilter ? ["-preset", "fast", "-crf", "22"] : []),
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-shortest",
      outPath
    );

    execFileSync("ffmpeg", args, { stdio: "pipe" });
    try {
      fs.copyFileSync(outPath, pubOutPath);
    } catch {}

    //Probe duration
    let durationSec = 24.0;
    try {
      const probe = execFileSync(
        "ffprobe",
        ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", outPath],
        { encoding: "utf8" }
      );
      const parsed = parseFloat(probe.trim());
      if (Number.isFinite(parsed) && parsed > 0) durationSec = Number(parsed.toFixed(2));
    } catch {}

    const newVersion = {
      id: `v_dir_${stamp}`,
      label: versionLabel || `Director Cut • ${direction.location?.colorGrading || "Custom DNA"} (${durationSec}s)`,
      videoUrl: publicOutUrl,
      createdAt: new Date().toISOString(),
      durationSec,
      directionSummary: {
        character: direction.character?.name || "Original Cast",
        wardrobe: direction.wardrobe?.preset || "Original Wardrobe",
        location: direction.location?.environment || "Original Location",
        colorGrading: direction.location?.colorGrading || "none",
        sfxPreset,
      },
    };

    // Persist version into DB if possible
    try {
      const pg = getPostgresPool();
      if (pg) {
        const res = await pg.query(`SELECT manifest_json FROM yt_productions WHERE id = $1`, [reelId]);
        if (res.rows.length > 0) {
          const m = typeof res.rows[0].manifest_json === "string" ? JSON.parse(res.rows[0].manifest_json) : res.rows[0].manifest_json || {};
          m.versions = Array.isArray(m.versions) ? [...m.versions, newVersion] : [newVersion];
          await pg.query(`UPDATE yt_productions SET manifest_json = $2, updated_at = NOW() WHERE id = $1`, [
            reelId,
            JSON.stringify(m),
          ]);
        }
      } else {
        const db = getDatabase();
        const row = db.prepare(`SELECT manifest_json FROM yt_productions WHERE id = ?`).get(reelId) as any;
        if (row) {
          const m = typeof row.manifest_json === "string" ? JSON.parse(row.manifest_json) : row.manifest_json || {};
          m.versions = Array.isArray(m.versions) ? [...m.versions, newVersion] : [newVersion];
          db.prepare(`UPDATE yt_productions SET manifest_json = ?, updated_at = datetime('now') WHERE id = ?`).run(
            JSON.stringify(m),
            reelId
          );
        }
      }
    } catch (e) {
      console.warn("[director/regenerate] DB version save note:", e);
    }

    return NextResponse.json({
      success: true,
      mode: "instant_remaster",
      version: newVersion,
      videoUrl: publicOutUrl,
      message: `✓ Director Re-Master saved as new version "${newVersion.label}"! Original master is safely preserved.`,
    });
  } catch (err: any) {
    console.error("[api/reels/director/regenerate] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to execute Director regeneration" },
      { status: 500 }
    );
  }
}
