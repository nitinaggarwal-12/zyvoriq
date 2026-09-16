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
  // Shot-level separated audio parameters:
  avLinked?: boolean;
  audioSource?: "native_shot" | "lyria_slice" | "mute";
  audioTrimStartSec?: number;
  audioTrimEndSec?: number;
  audioSpeed?: number;
  audioVolume?: number;
  audioOffsetSec?: number;
  audioMuted?: boolean;
  audioSolo?: boolean;
}

export interface EditorRenderRequest {
  reelId: string;
  title?: string;
  saveAsVersion?: boolean;
  clips: EditorClipInput[];
  globalVideoSpeed?: number; // Global visual speed multiplier (0.25x - 4.0x)
  colorGrading?: string; // "none" | "cyberpunk_neon" | "golden_hour_warm" | "moonlight_noir" | "bollywood_royal" | "vintage_film"
  transitionStyle?: "cut" | "dissolve" | "flash"; // Visual transition between stitched shots
  // 5-Stem Up/Down Audio Spectrum Mixer Overrides
  stemMutes?: Record<string, boolean>;
  stemSolos?: Record<string, boolean>;
  songHarmoniesGain?: number;
  // Independent Dialogue / Vocals Track
  vocalMode: "original" | "mute" | "custom";
  vocalUrl?: string;
  vocalVolume: number; // 0.0 to 1.5
  vocalSpeed?: number; // Independent vocal/dialogue speed (0.25x - 4.0x)
  vocalEntrySec?: number; // Exact timestamp T_vocal (s) where singing vocals drop in (0s = immediate)
  lipSyncOffsetMs?: number; // Sub-frame lip-sync phase shift in ms (-500ms to +500ms)
  // Independent Music Track (Unaltered across video cuts by default)
  musicTrack: string; // URL or preset path ("original_lyria", "/assets/audio/music/...", "none")
  musicLockMode?: "unaltered" | "custom_trim"; // "unaltered" keeps music continuous even when video frames are cut/added
  musicTrimStartSec?: number;
  musicTrimEndSec?: number;
  musicVolume: number; // 0.0 to 1.5
  musicSpeed?: number; // Independent music tempo/playback speed (0.25x - 4.0x)
  lyriaOverlayMode?: "hybrid_lyria_bed" | "pure_lyria_song" | "shot_native_only" | string;
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
    const trimmedAudioSegments: string[] = [];
    const segmentDurations: number[] = [];
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
      const segAudioPath = path.join(workDir, `seg_a_${String(i).padStart(2, "0")}.wav`);

      const effectiveVideoSpeed = Math.max(0.25, Math.min(4.0, Number(clip.speed || 1.0) * globalVideoSpeed));
      const outDur = Number((dur / effectiveVideoSpeed).toFixed(3));

      const vfStages: string[] = [];
      if (Math.abs(effectiveVideoSpeed - 1.0) > 0.01) {
        vfStages.push(`setpts=${(1 / effectiveVideoSpeed).toFixed(4)}*PTS`);
      }
      const gradingFilter = buildColorGradingFilter(body.colorGrading);
      if (gradingFilter) {
        vfStages.push(gradingFilter);
      }
      vfStages.push("fps=24,format=yuv420p");

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
        "-pix_fmt",
        "yuv420p",
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
      segmentDurations.push(outDur);

      // Extract separated shot-level audio segment (100% independent of video trim/speed when unlinked)
      const anyShotSolo = enabledClips.some((c) => c.audioSolo);
      const isShotMuted =
        clip.audioMuted ||
        clip.audioSource === "mute" ||
        (clip.audioVolume !== undefined && clip.audioVolume <= 0.001) ||
        (anyShotSolo && !clip.audioSolo);

      const cumulativeBeforeSec = segmentDurations.slice(0, -1).reduce((acc, v) => acc + v, 0);

      if (isShotMuted) {
        execFileSync("ffmpeg", [
          "-y",
          "-f",
          "lavfi",
          "-i",
          `anullsrc=r=48000:cl=stereo:d=${outDur.toFixed(4)}`,
          "-ar",
          "48000",
          "-ac",
          "2",
          segAudioPath,
        ]);
        trimmedAudioSegments.push(segAudioPath);
      } else {
        // Resolve audio source file for this shot (native_shot vs lyria_slice)
        let audioSrcFile = localSrc;
        if (clip.audioSource === "lyria_slice" && body.reelId) {
          const lyriaCandidates = [
            path.join(process.cwd(), "public", "renders", "yt", body.reelId, "song_cut.mp3"),
            path.join(process.cwd(), "public", "renders", "yt", body.reelId, "song.mp3"),
            path.join(process.cwd(), "public", "renders", "yt", body.reelId, "master_lyria.mp4"),
          ];
          for (const lc of lyriaCandidates) {
            if (fs.existsSync(lc)) {
              audioSrcFile = lc;
              break;
            }
          }
        }

        const isLinked = clip.avLinked === true;
        let aStart = isLinked
          ? start
          : clip.audioTrimStartSec !== undefined
          ? Math.max(0, Number(clip.audioTrimStartSec))
          : clip.audioSource === "lyria_slice"
          ? cumulativeBeforeSec
          : start;
        const aEnd = isLinked
          ? end
          : clip.audioTrimEndSec !== undefined
          ? Math.max(aStart + 0.1, Number(clip.audioTrimEndSec))
          : aStart + dur;
        const aDur = Math.max(0.1, aEnd - aStart);
        const aSpeed = isLinked
          ? effectiveVideoSpeed
          : Math.max(0.25, Math.min(4.0, Number(clip.audioSpeed ?? 1.0) * Number(body.vocalSpeed ?? 1.0)));
        const aGain = Math.max(0, Math.min(3.0, Number(clip.audioVolume ?? 1.0)));
        const aOffset = Number(clip.audioOffsetSec ?? 0);

        if (aOffset < 0) {
          aStart = Math.max(0, aStart + Math.abs(aOffset));
        }

        const afStages: string[] = ["aresample=48000"];
        if (Math.abs(aSpeed - 1.0) > 0.01) {
          afStages.push(buildAtempoFilter(aSpeed));
        }
        if (Math.abs(aGain - 1.0) > 0.01) {
          afStages.push(`volume=${aGain.toFixed(3)}`);
        }
        if (aOffset > 0.005) {
          const delayMs = Math.round(aOffset * 1000);
          afStages.push(`adelay=${delayMs}|${delayMs}`);
        }
        // Lock separated shot audio duration to exact visual duration outDur so downstream shots stay 100% frame-aligned
        afStages.push(`apad,atrim=0:${outDur.toFixed(4)}`);
        const fadeDur = Math.min(0.03, outDur * 0.15);
        const fadeOutSt = Math.max(0, outDur - fadeDur);
        afStages.push(`afade=t=in:st=0:d=${fadeDur.toFixed(3)},afade=t=out:st=${fadeOutSt.toFixed(3)}:d=${fadeDur.toFixed(3)}`);

        try {
          execFileSync("ffmpeg", [
            "-y",
            "-ss",
            String(aStart),
            "-t",
            String(aDur),
            "-i",
            audioSrcFile,
            "-vn",
            "-af",
            afStages.join(","),
            "-ar",
            "48000",
            "-ac",
            "2",
            segAudioPath,
          ]);
          trimmedAudioSegments.push(segAudioPath);
        } catch {
          execFileSync("ffmpeg", [
            "-y",
            "-f",
            "lavfi",
            "-i",
            `anullsrc=r=48000:cl=stereo:d=${outDur.toFixed(4)}`,
            "-ar",
            "48000",
            "-ac",
            "2",
            segAudioPath,
          ]);
          trimmedAudioSegments.push(segAudioPath);
        }
      }
    }

    // 2. Concatenate pure visual segments (defaults to Smooth Cross-Dissolve xfade out of the box)
    const concatVideoPath = path.join(workDir, "concat_video.mp4");
    const transitionStyle = body.transitionStyle || "dissolve";
    let xfadeSuccess = false;

    if ((transitionStyle === "dissolve" || transitionStyle === "flash") && trimmedSegments.length > 1) {
      try {
        const transType = transitionStyle === "flash" ? "fadewhite" : "fade";
        const transDur = transitionStyle === "flash" ? 0.18 : 0.25;
        const xfadeInputs: string[] = [];
        for (const seg of trimmedSegments) {
          xfadeInputs.push("-i", seg);
        }
        const xfadeFilters: string[] = [];
        let cumulativeOffset = Math.max(0.1, segmentDurations[0] - transDur);
        let prevLabel = "[0:v]";

        for (let i = 1; i < trimmedSegments.length; i++) {
          const isLast = i === trimmedSegments.length - 1;
          const outLabel = isLast ? "[v_xfade_out]" : `[v_xf_${i}]`;
          const fmtSuffix = isLast ? ",format=yuv420p" : "";
          xfadeFilters.push(
            `${prevLabel}[${i}:v]xfade=transition=${transType}:duration=${transDur.toFixed(2)}:offset=${cumulativeOffset.toFixed(3)}${fmtSuffix}${outLabel}`
          );
          prevLabel = outLabel;
          if (!isLast) {
            cumulativeOffset = Math.max(cumulativeOffset + 0.1, cumulativeOffset + segmentDurations[i] - transDur);
          }
        }

        execFileSync("ffmpeg", [
          "-y",
          ...xfadeInputs,
          "-filter_complex",
          xfadeFilters.join(";"),
          "-map",
          "[v_xfade_out]",
          "-c:v",
          "libx264",
          "-pix_fmt",
          "yuv420p",
          "-preset",
          "ultrafast",
          "-crf",
          "22",
          concatVideoPath,
        ]);
        xfadeSuccess = true;
      } catch (xfErr) {
        console.warn("[api/reels/editor/render] xfade fallback to concat:", xfErr);
      }
    }

    if (!xfadeSuccess) {
      const concatListPath = path.join(workDir, "concat.txt");
      fs.writeFileSync(
        concatListPath,
        trimmedSegments.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n")
      );
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
    }

    // Concatenate sequential shot audio (Shot 1 -> Shot 2 -> Shot 3 -> Shot 4)
    const concatClipAudioPath = path.join(workDir, "concat_clips_audio.wav");
    if (trimmedAudioSegments.length > 0) {
      const aConcatListPath = path.join(workDir, "aconcat.txt");
      fs.writeFileSync(
        aConcatListPath,
        trimmedAudioSegments.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n")
      );
      execFileSync("ffmpeg", [
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        aConcatListPath,
        "-c",
        "copy",
        concatClipAudioPath,
      ]);
    }

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

    // 3. INDEPENDENT 3-STEM & LYRIA MASTER AUDIO ENGINE
    // Discover continuous Lyria master song (song_cut.mp3 / master_lyria.mp4 / song.mp3) & stems
    let reelVocalStemPath: string | null = null;
    let reelMusicStemPath: string | null = null;
    let reelContinuousLyriaPath: string | null = null;
    if (body.reelId) {
      const candidates = [
        path.join(process.cwd(), "public", "renders", "yt", body.reelId),
        path.join(process.cwd(), "scratch", "yt", body.reelId),
      ];
      for (const dir of candidates) {
        if (!reelContinuousLyriaPath && fs.existsSync(path.join(dir, "song_cut.mp3"))) {
          reelContinuousLyriaPath = path.join(dir, "song_cut.mp3");
        }
        if (!reelContinuousLyriaPath && fs.existsSync(path.join(dir, "master_lyria.mp4"))) {
          reelContinuousLyriaPath = path.join(dir, "master_lyria.mp4");
        }
        if (!reelContinuousLyriaPath && fs.existsSync(path.join(dir, "song.mp3"))) {
          reelContinuousLyriaPath = path.join(dir, "song.mp3");
        }
        if (fs.existsSync(path.join(dir, "stems", "htdemucs", "song_cut", "no_vocals.wav"))) {
          reelMusicStemPath = path.join(dir, "stems", "htdemucs", "song_cut", "no_vocals.wav");
        } else if (fs.existsSync(path.join(dir, "stems", "htdemucs", "song", "no_vocals.wav"))) {
          reelMusicStemPath = path.join(dir, "stems", "htdemucs", "song", "no_vocals.wav");
        }
        if (fs.existsSync(path.join(dir, "stems", "htdemucs", "song_cut", "vocals.wav"))) {
          reelVocalStemPath = path.join(dir, "stems", "htdemucs", "song_cut", "vocals.wav");
        } else if (fs.existsSync(path.join(dir, "stems", "htdemucs", "song", "vocals.wav"))) {
          reelVocalStemPath = path.join(dir, "stems", "htdemucs", "song", "vocals.wav");
        }
      }
    }

    const vocalVol = body.vocalMode === "mute" ? 0 : Math.max(0, Number(body.vocalVolume ?? 1.0));
    const vocalSpeed = Math.max(0.25, Math.min(4.0, Number(body.vocalSpeed ?? 1.0)));

    const musicVol = Math.max(0, Number(body.musicVolume ?? 0.65));
    const musicSpeed = Math.max(0.25, Math.min(4.0, Number(body.musicSpeed ?? 1.0)));

    const sfxVol = Math.max(0, Number(body.sfxVolume ?? 0.35));
    const sfxSpeed = Math.max(0.25, Math.min(4.0, Number(body.sfxSpeed ?? 1.0)));

    // 5-Stem Spectrum Mixer EQ & Mute/Solo Overrides
    const stemMutes = body.stemMutes || {};
    const stemSolos = body.stemSolos || {};
    const anySolo = Object.values(stemSolos).some(Boolean);
    const isStemActive = (key: string) => {
      if (stemMutes.master) return false;
      if (stemMutes[key]) return false;
      if (anySolo && !stemSolos[key]) return false;
      return true;
    };

    const eqStages: string[] = [];
    if (!isStemActive("music")) {
      // Attenuate sub-bass & synth groove frequencies (40Hz - 220Hz)
      eqStages.push("equalizer=f=90:width_type=h:width=140:g=-18");
    }
    if (!isStemActive("speech")) {
      // Attenuate primary vocal speech formants (450Hz - 2.5kHz)
      eqStages.push("equalizer=f=1200:width_type=h:width=1400:g=-16");
    }
    if (!isStemActive("song") || (body.songHarmoniesGain !== undefined && Math.abs(body.songHarmoniesGain - 1.0) > 0.05)) {
      const g = !isStemActive("song") ? -16 : Math.round((Number(body.songHarmoniesGain || 1.0) - 1.0) * 12);
      if (g !== 0) eqStages.push(`equalizer=f=2400:width_type=h:width=1200:g=${g}`);
    }
    if (!isStemActive("background")) {
      // Attenuate high-frequency splash/ambient foley air above 5.5kHz
      eqStages.push("equalizer=f=7500:width_type=h:width=4000:g=-14");
    }
    const stemEqChain = eqStages.length > 0 ? `,${eqStages.join(",")}` : "";

    const isUsingCustomMusic = Boolean(body.musicTrack && body.musicTrack !== "original_lyria");
    const lyriaOverlayMode = body.lyriaOverlayMode || "hybrid_lyria_bed";

    // Resolve Vocal/Dialogue Source
    const vocalSourceFile =
      (body.vocalUrl && resolveLocalFilePath(body.vocalUrl)) ||
      (fs.existsSync(concatClipAudioPath) ? concatClipAudioPath : null) ||
      reelVocalStemPath ||
      (isUsingCustomMusic ? null : firstValidSourcePath);

    // Resolve Music Bed Source
    let musicSourceFile: string | null = null;
    if (body.musicTrack === "original_lyria") {
      musicSourceFile = reelContinuousLyriaPath || reelMusicStemPath || concatClipAudioPath || firstValidSourcePath;
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

    const vocalEntrySec = Math.max(0, Number(body.vocalEntrySec || 0));
    const lipSyncOffsetMs = Math.max(-1000, Math.min(1000, Number(body.lipSyncOffsetMs || 0)));

    // Build lip-sync phase shift filter stage (advance via atrim or delay via adelay)
    const buildPhaseShiftStage = (offsetMs: number): string => {
      if (Math.abs(offsetMs) < 5) return "";
      if (offsetMs > 0) {
        const ms = Math.round(offsetMs);
        return `,adelay=${ms}|${ms}`;
      } else {
        const trimSec = Math.abs(offsetMs) / 1000;
        return `,atrim=start=${trimSec.toFixed(3)},asetpts=PTS-STARTPTS`;
      }
    };
    const phaseShiftStage = buildPhaseShiftStage(lipSyncOffsetMs);

    if (stemMutes.master) {
      // Master mute explicitly toggled in 5-stem spectrum mixer
      inputs.push("-f", "lavfi", "-i", `anullsrc=r=48000:cl=stereo:d=${totalDurationSec.toFixed(3)}`);
      filterParts.push(`[${inputIdx}:a]anull[a_out]`);
    } else if (!isUsingCustomMusic && lyriaOverlayMode === "pure_lyria_song" && reelContinuousLyriaPath) {
      // MODE A: Pure Continuous Google DeepMind Lyria 3.5 Master Song Over Combined Reel (Zero Demucs artifacts, Zero amix loss)
      const masterVol = Math.max(vocalVol, musicVol, 1.0);
      inputs.push("-stream_loop", "-1", "-i", reelContinuousLyriaPath);
      const atempoMaster = buildAtempoFilter(musicSpeed);
      const vocalEntryStage =
        vocalEntrySec > 0.05
          ? `,equalizer=f=1400:width_type=h:width=1800:g=-18:enable='between(t,0,${vocalEntrySec.toFixed(2)})'`
          : "";
      filterParts.push(
        `[${inputIdx}:a]${atempoMaster}${phaseShiftStage},atrim=0:${totalDurationSec.toFixed(3)},asetpts=PTS-STARTPTS,volume=${masterVol.toFixed(2)}${stemEqChain}${vocalEntryStage},loudnorm=I=-14:TP=-1.5:LRA=11[a_master]`
      );
      mixInputs.push("[a_master]");
      inputIdx++;
    } else if (!isUsingCustomMusic && lyriaOverlayMode === "shot_native_only" && fs.existsSync(concatClipAudioPath)) {
      // MODE B: Pure Sequential Shot Audio (Shot 1 -> Shot 2 -> Shot 3 -> Shot 4 exact lip-synced native audio)
      const masterVol = Math.max(vocalVol, musicVol, 1.0);
      inputs.push("-i", concatClipAudioPath);
      const atempoMaster = buildAtempoFilter(vocalSpeed);
      filterParts.push(
        `[${inputIdx}:a]${atempoMaster}${phaseShiftStage},atrim=0:${totalDurationSec.toFixed(3)},asetpts=PTS-STARTPTS,volume=${masterVol.toFixed(2)}${stemEqChain},loudnorm=I=-14:TP=-1.5:LRA=11[a_master]`
      );
      mixInputs.push("[a_master]");
      inputIdx++;
    } else if (
      !isUsingCustomMusic &&
      fs.existsSync(concatClipAudioPath) &&
      reelContinuousLyriaPath &&
      vocalVol > 0.01 &&
      isStemActive("speech")
    ) {
      // MODE C (Default Hybrid Master): Lip-Synced Sequential Shot Audio + Continuous Lyria Studio Bed with Sidechain Ducking
      inputs.push("-i", concatClipAudioPath);
      const shotIdx = inputIdx++;
      inputs.push("-stream_loop", "-1", "-i", reelContinuousLyriaPath);
      const bedIdx = inputIdx++;

      const atempoVocal = buildAtempoFilter(vocalSpeed);
      const atempoMusic = buildAtempoFilter(musicSpeed);
      const vocalGateStage =
        vocalEntrySec > 0.05
          ? `,volume=enable='between(t,0,${vocalEntrySec.toFixed(2)})':volume=0`
          : "";

      filterParts.push(
        `[${shotIdx}:a]${atempoVocal}${phaseShiftStage}${vocalGateStage},atrim=0:${totalDurationSec.toFixed(3)},asetpts=PTS-STARTPTS,volume=${vocalVol.toFixed(2)},asplit=2[shot_main][shot_sc]`,
        `[${bedIdx}:a]${atempoMusic},atrim=0:${totalDurationSec.toFixed(3)},asetpts=PTS-STARTPTS,volume=${(musicVol * 0.85).toFixed(2)}${stemEqChain}[bed_raw]`,
        `[bed_raw][shot_sc]sidechaincompress=threshold=0.025:ratio=5:attack=15:release=220[bed_ducked]`,
        `[shot_main][bed_ducked]amix=inputs=2:duration=first:dropout_transition=0:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a_hybrid]`
      );
      mixInputs.push("[a_hybrid]");
    } else {
      // Custom Music Track or Independent Stem Mixing Fallback
      if (vocalSourceFile && vocalVol > 0.01 && isStemActive("speech") && !isUsingCustomMusic) {
        inputs.push("-stream_loop", "-1", "-i", vocalSourceFile);
        const atempoVocal = buildAtempoFilter(vocalSpeed);
        const vocalGateStage =
          vocalEntrySec > 0.05
            ? `,volume=enable='between(t,0,${vocalEntrySec.toFixed(2)})':volume=0`
            : "";
        filterParts.push(
          `[${inputIdx}:a]${atempoVocal}${phaseShiftStage}${vocalGateStage},atrim=0:${totalDurationSec.toFixed(3)},asetpts=PTS-STARTPTS,volume=${vocalVol.toFixed(2)}[a_vocal]`
        );
        mixInputs.push("[a_vocal]");
        inputIdx++;
      }

      if (musicSourceFile && musicVol > 0.01 && isStemActive("music")) {
        inputs.push("-stream_loop", "-1", "-i", musicSourceFile);
        const mStart = body.musicLockMode === "custom_trim" ? Math.max(0, Number(body.musicTrimStartSec || 0)) : 0;
        const atempoMusic = buildAtempoFilter(musicSpeed);
        filterParts.push(
          `[${inputIdx}:a]atrim=start=${mStart.toFixed(3)},asetpts=PTS-STARTPTS,${atempoMusic},atrim=0:${totalDurationSec.toFixed(3)},asetpts=PTS-STARTPTS,volume=${musicVol.toFixed(2)}${stemEqChain}[a_music]`
        );
        mixInputs.push("[a_music]");
        inputIdx++;
      }
    }

    // Track C: Background Sound Effect / Foley (with independent sfxSpeed & sfxVolume)
    if (!stemMutes.master && sfxSourceFile && sfxVol > 0.01 && isStemActive("background")) {
      inputs.push("-stream_loop", "-1", "-i", sfxSourceFile);
      const atempoSfx = buildAtempoFilter(sfxSpeed);
      filterParts.push(
        `[${inputIdx}:a]${atempoSfx},atrim=0:${totalDurationSec.toFixed(3)},asetpts=PTS-STARTPTS,volume=${sfxVol.toFixed(2)}[a_sfx]`
      );
      mixInputs.push("[a_sfx]");
      inputIdx++;
    }

    if (!stemMutes.master) {
      if (mixInputs.length === 0) {
        // Silent audio track fallback if user muted all tracks
        inputs.push("-f", "lavfi", "-i", `anullsrc=r=48000:cl=stereo:d=${totalDurationSec.toFixed(3)}`);
        filterParts.push(`[${inputIdx}:a]anull[a_out]`);
      } else if (mixInputs.length === 1) {
        filterParts.push(`${mixInputs[0]}alimiter=limit=0.95[a_out]`);
      } else {
        // CRITICAL: normalize=0 prevents FFmpeg amix from dividing volume by 1/N (eliminating the -6dB/-9.5dB volume drop bug!)
        filterParts.push(
          `${mixInputs.join("")}amix=inputs=${mixInputs.length}:duration=first:dropout_transition=2:normalize=0,alimiter=limit=0.95[a_out]`
        );
      }
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

    // 4. Update DB record; ONLY append a permanent saved version when body.saveAsVersion === true
    let savedVersionNumber = 1;
    let savedVersionsList: any[] = [];
    const shouldSavePermanentVersion = Boolean(body.saveAsVersion);

    const filterOutAutoStitchClutter = (list: any[]) =>
      list.filter((v) => !String(v?.label || "").startsWith("Stitched 4-Shot Seamless Master"));

    try {
      const db = getDatabase();
      if (db && body.reelId) {
        const row = db.prepare(`SELECT manifest_json FROM yt_productions WHERE id = ?`).get(body.reelId) as any;
        if (row) {
          const manifest = JSON.parse(row.manifest_json || "{}");
          if (!manifest.assets) manifest.assets = {};
          const origUrl = manifest.assets.masterHybridUrl || manifest.assets.masterNativeUrl || "/renders/yt/default.mp4";
          const baseList = Array.isArray(manifest.versions) && manifest.versions.length > 0
            ? filterOutAutoStitchClutter(manifest.versions)
            : [
                {
                  versionNumber: 1,
                  label: "v1 • Original Master",
                  url: origUrl,
                  durationSec: 24,
                  createdAt: new Date(Date.now() - 3600000).toISOString(),
                },
              ];

          if (shouldSavePermanentVersion) {
            savedVersionNumber = baseList.length + 1;
            const newVer = {
              versionNumber: savedVersionNumber,
              label: body.title || `v${savedVersionNumber} • Studio NLE Edit (${Number(totalDurationSec).toFixed(1)}s)`,
              url: publicOutputUrl,
              durationSec: Number(totalDurationSec.toFixed(2)),
              createdAt: new Date().toISOString(),
            };
            baseList.push(newVer);
          } else {
            savedVersionNumber = baseList.length;
          }

          manifest.versions = baseList;
          manifest.editedMasterUrl = publicOutputUrl;
          manifest.assets.editedMasterUrl = publicOutputUrl;
          savedVersionsList = baseList;

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
          const baseList = Array.isArray(manifest.versions) && manifest.versions.length > 0
            ? filterOutAutoStitchClutter(manifest.versions)
            : [
                {
                  versionNumber: 1,
                  label: "v1 • Original Master",
                  url: origUrl,
                  durationSec: 24,
                  createdAt: new Date(Date.now() - 3600000).toISOString(),
                },
              ];

          if (shouldSavePermanentVersion) {
            const vNum = baseList.length + 1;
            const newVer = {
              versionNumber: vNum,
              label: body.title || `v${vNum} • Studio NLE Edit (${Number(totalDurationSec).toFixed(1)}s)`,
              url: publicOutputUrl,
              durationSec: Number(totalDurationSec.toFixed(2)),
              createdAt: new Date().toISOString(),
            };
            baseList.push(newVer);
          }

          manifest.versions = baseList;
          manifest.editedMasterUrl = publicOutputUrl;
          manifest.assets.editedMasterUrl = publicOutputUrl;
          if (!savedVersionsList.length) savedVersionsList = baseList;

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

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { reelId, versionNumber, url, clearAll } = body || {};
    if (!reelId) {
      return NextResponse.json({ success: false, error: "Missing reelId" }, { status: 400 });
    }

    let updatedVersions: any[] = [];
    const filterVersions = (existing: any[], origUrl: string) => {
      if (clearAll) {
        return [
          {
            versionNumber: 1,
            label: "v1 • Original Master",
            url: origUrl,
            durationSec: 24,
            createdAt: new Date().toISOString(),
          },
        ];
      }
      const filtered = existing.filter((v) => {
        if (url && v.url === url) return false;
        if (versionNumber !== undefined && v.versionNumber === versionNumber) return false;
        if (String(v?.label || "").startsWith("Stitched 4-Shot Seamless Master")) return false;
        return true;
      });
      return filtered.map((v, idx) => ({
        ...v,
        versionNumber: idx + 1,
      }));
    };

    const db = getDatabase();
    if (db) {
      const row = db.prepare(`SELECT manifest_json FROM yt_productions WHERE id = ?`).get(reelId) as any;
      if (row) {
        const manifest = JSON.parse(row.manifest_json || "{}");
        const origUrl = manifest?.assets?.masterHybridUrl || manifest?.assets?.masterNativeUrl || "/renders/yt/default.mp4";
        const currentList = Array.isArray(manifest.versions) ? manifest.versions : [];
        updatedVersions = filterVersions(currentList, origUrl);
        manifest.versions = updatedVersions;
        db.prepare(`UPDATE yt_productions SET manifest_json = ?, updated_at = datetime('now') WHERE id = ?`).run(
          JSON.stringify(manifest),
          reelId
        );
      }
    }

    const pool = getPostgresPool();
    if (pool) {
      const pgRes = await pool.query(`SELECT manifest_json FROM yt_productions WHERE id = $1`, [reelId]);
      if (pgRes.rows.length > 0) {
        const manifest = JSON.parse(pgRes.rows[0].manifest_json || "{}");
        const origUrl = manifest?.assets?.masterHybridUrl || manifest?.assets?.masterNativeUrl || "/renders/yt/default.mp4";
        const currentList = Array.isArray(manifest.versions) ? manifest.versions : [];
        const pgFiltered = filterVersions(currentList, origUrl);
        if (!updatedVersions.length) updatedVersions = pgFiltered;
        manifest.versions = pgFiltered;
        await pool.query(
          `UPDATE yt_productions SET manifest_json = $1, updated_at = NOW() WHERE id = $2`,
          [JSON.stringify(manifest), reelId]
        );
      }
    }

    return NextResponse.json({
      success: true,
      versions: updatedVersions,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to delete version." },
      { status: 500 }
    );
  }
}
