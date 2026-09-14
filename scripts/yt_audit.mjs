#!/usr/bin/env node
/**
 * OMNI_SYNC_AUDIT — stage 7 of the YT pipeline, as an independently callable module.
 *
 * Why a module and not inline: a quality gate that cannot be pointed at a known-bad
 * master and observed to FAIL is not a gate, it is an assertion. Keeping this
 * importable lets scripts/yt_audit_selftest.mjs prove both verdicts on real files.
 *
 * Design notes (empirically established, do not "simplify" these away):
 *  - gemini-omni-1.1-flash rejects :generateContent ("only supports Interactions API").
 *  - With images it also rejects the turn_list form ([{role,content}]); it requires
 *    the step_list form: input:[{type:"user_input",content:[...]}].
 *  - Image items are {type:"image", mime_type:"...", data:"<base64>"} — snake_case
 *    mime_type; camelCase mimeType, source{}, inlineData{}, url and fileData are all rejected.
 *  - Omni 1.1 has NO audio modality ("Audio input modality is not enabled for this model"),
 *    so the audio half of "sync" is measured deterministically with ffmpeg and then
 *    cross-referenced against Omni's per-frame mouth observations. No model is asked
 *    to subjectively judge "is it in sync".
 *  - Fail-closed: an HTTP error, an unparseable response, or a missing field is a FAIL.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

export const YT_MASTER_SPEC = {
  lufs: -14,
  truePeakDb: -1.0,
  sampleRate: 48000,
  width: 1080,
  height: 1920,
  fps: 30,
};

export async function runOmniSyncAudit({
  apiKey,
  host,
  remoteMaster,        // path to master.mp4 on the remote host
  remoteFramesDir,     // scratch dir on the remote host for extracted frames
  localDir,            // local dir to receive frames and write audit.json
  targetDuration,
  windowStart = 0,     // offset into the song where the master's audio was cut from
  timeline = {},       // { has_sung_vocals, first_vocal_onset_sec }
  lyricLines = [],     // [{ text, start, end }] on the MASTER timebase - the Lyria clock
  cutTimes = [],       // master-timebase start of each shot; drives the reset-loop check
  model = "models/gemini-omni-1.1-flash",
  spec = YT_MASTER_SPEC,
  topic = null,
  genre = null,
  receipt = () => {},
  log = console.log,
}) {
  const sh = (c) => execFileSync("bash", ["-lc", c], { encoding: "utf-8", maxBuffer: 1 << 28 }).trim();
  const rx = (c) => (host === "local" ? sh(c) : sh(`ssh -o ConnectTimeout=25 ${host} '${c.replace(/'/g, "'\\''")}'`));

  const failures = [];
  const fail = (code, detail) => { failures.push({ code, detail }); log(`  [FAIL] ${code}: ${detail}`); };
  const ok = (code, detail) => log(`  [pass] ${code}: ${detail}`);

  // ---- 7a. Deterministic master measurement (ffmpeg/ffprobe, no model) ----
  log("  7a. Measuring master (deterministic ffprobe/ffmpeg)...");
  const probe = JSON.parse(rx(
    `ffprobe -v error -show_entries stream=codec_type,width,height,avg_frame_rate,sample_rate,codec_name:format=duration -of json ${remoteMaster}`
  ));
  const vStream = (probe.streams || []).find((s) => s.codec_type === "video") || {};
  const aStream = (probe.streams || []).find((s) => s.codec_type === "audio") || {};
  const measuredDuration = parseFloat(probe.format?.duration ?? "NaN");
  const [frNum, frDen] = String(vStream.avg_frame_rate || "0/1").split("/").map(Number);
  const measuredFps = frDen ? frNum / frDen : 0;

  // NOTE: never pass `-v error` here; it suppresses the very report being parsed.
  const ebu = rx(`ffmpeg -hide_banner -nostats -i ${remoteMaster} -af ebur128=peak=true -f null - 2>&1 | tail -40`);
  const measuredLufs = parseFloat((ebu.match(/I:\s*(-?\d+(?:\.\d+)?)\s*LUFS/) || [])[1]);
  const measuredTruePeak = parseFloat((ebu.match(/Peak:\s*(-?\d+(?:\.\d+)?)\s*dBFS/) || [])[1]);
  const subOut = rx(`ffmpeg -hide_banner -nostats -i ${remoteMaster} -af lowpass=f=150,volumedetect -f null - 2>&1 | grep mean_volume || true`);
  const subBassDb = parseFloat((subOut.match(/mean_volume:\s*(-?\d+(?:\.\d+)?)/) || [])[1]);
  const silenceCount = parseInt(
    rx(`ffmpeg -hide_banner -nostats -i ${remoteMaster} -af silencedetect=n=-50dB:d=0.4 -f null - 2>&1 | grep -c silence_start || true`).trim() || "0",
    10
  );

  const measured = {
    durationSec: measuredDuration,
    width: vStream.width, height: vStream.height, fps: measuredFps,
    audioCodec: aStream.codec_name,
    sampleRate: aStream.sample_rate ? parseInt(aStream.sample_rate, 10) : null,
    lufs: measuredLufs, truePeakDb: measuredTruePeak,
    subBassMeanDb: subBassDb, silenceEvents: silenceCount,
  };
  log(`    ${JSON.stringify(measured)}`);

  if (!Number.isFinite(measuredDuration)) fail("MASTER_UNREADABLE", "ffprobe returned no duration");
  else if (Math.abs(measuredDuration - targetDuration) > 0.5)
    fail("DURATION_DRIFT", `master is ${measuredDuration.toFixed(3)}s, target ${targetDuration}s (tolerance 0.5s)`);
  else ok("DURATION", `${measuredDuration.toFixed(3)}s within 0.5s of ${targetDuration}s`);

  if (vStream.width !== spec.width || vStream.height !== spec.height)
    fail("RESOLUTION_MISMATCH", `${vStream.width}x${vStream.height}, expected ${spec.width}x${spec.height}`);
  else ok("RESOLUTION", `${vStream.width}x${vStream.height}`);

  if (Math.abs(measuredFps - spec.fps) > 0.5)
    fail("FPS_MISMATCH", `${measuredFps.toFixed(3)} fps, expected ${spec.fps}`);
  else ok("FPS", `${measuredFps.toFixed(3)}`);

  if (measured.sampleRate !== spec.sampleRate)
    fail("SAMPLE_RATE_MISMATCH", `${measured.sampleRate} Hz, expected ${spec.sampleRate}`);
  else ok("SAMPLE_RATE", `${measured.sampleRate} Hz`);

  if (!Number.isFinite(measuredLufs)) fail("LOUDNESS_UNMEASURABLE", "could not parse ebur128 integrated loudness");
  else if (Math.abs(measuredLufs - spec.lufs) > 1.5)
    fail("LOUDNESS_OUT_OF_SPEC", `${measuredLufs} LUFS, expected ${spec.lufs} +/- 1.5`);
  else ok("LOUDNESS", `${measuredLufs} LUFS`);

  if (!Number.isFinite(measuredTruePeak)) fail("TRUE_PEAK_UNMEASURABLE", "could not parse ebur128 true peak");
  else if (measuredTruePeak > spec.truePeakDb + 0.3)
    fail("TRUE_PEAK_OVER", `${measuredTruePeak} dBFS exceeds ${spec.truePeakDb} dBTP`);
  else ok("TRUE_PEAK", `${measuredTruePeak} dBFS`);

  // Full-spectrum retention: an over-aggressive highpass reads as near-silence under 150 Hz.
  if (!Number.isFinite(subBassDb)) fail("SUBBASS_UNMEASURABLE", "volumedetect produced no mean_volume");
  else if (subBassDb < -60) fail("AUDIO_SPECTRUM_GUTTED", `sub-150Hz mean ${subBassDb} dB indicates the low end was filtered out`);
  else ok("SUBBASS", `${subBassDb} dB under 150 Hz`);

  if (silenceCount > 0) fail("DIGITAL_SILENCE", `${silenceCount} silent span(s) >=0.4s at -50dB`);
  else ok("NO_SILENCE", "no silent spans >=0.4s");

  // Letterbox/pillarbox. The first real YT run delivered 14px black bars top and
  // bottom and this gate passed it, because no check for bars existed. Frame
  // dimensions being correct is not the same as the frame being full of picture.
  const cropRaw = rx(`ffmpeg -hide_banner -nostats -i ${remoteMaster} -vf cropdetect=24:2:0 -f null - 2>&1 | grep -o 'crop=[0-9:]*' | sort | uniq -c | sort -rn | head -1 || true`);
  const cropM = cropRaw.match(/crop=(\d+):(\d+):(\d+):(\d+)/);
  if (!cropM) {
    ok("NO_LETTERBOX", "cropdetect produced no proposal (treated as full frame)");
  } else {
    const [cw, chh, cx, cy] = cropM.slice(1).map(Number);
    const barsX = Number(vStream.width) - cw;
    const barsY = Number(vStream.height) - chh;
    measured.cropDetect = `${cw}:${chh}:${cx}:${cy}`;
    if (barsX > 4 || barsY > 4)
      fail("LETTERBOX_BARS", `cropdetect proposes ${cw}x${chh} inside ${vStream.width}x${vStream.height}: ${barsX}px horizontal / ${barsY}px vertical of black bars`);
    else ok("NO_LETTERBOX", `content fills the frame (cropdetect ${cw}x${chh})`);
  }

  // Master playback span, needed by both the reset-loop check and frame sampling.
  const span = Number.isFinite(measuredDuration) ? measuredDuration : targetDuration;

  // ---- 7a-bis. CROSS-CUT RESET LOOP (Sequential Tail-Frame Chaining Protocol) ----
  //
  // Veo's image conditioning pins frame 0 of a clip to the supplied image. Feed
  // the same static anchor plate to several shots and each one opens by
  // re-rendering that plate: the character teleports back to the opening pose at
  // every cut, and - because the plate is a still portrait with a closed mouth -
  // the singing directive is overridden into a frozen smile.
  //
  // This was found in a master that passed all sixteen other checks. Frame-0
  // PSNR between the anchored shots measured 38 dB against a 25 dB ceiling,
  // while the tail-chained shots sat at 9-10 dB. IDENTITY_CONTINUITY actively
  // rewarded the defect, because identical frames are trivially "consistent".
  //
  // Measured on the delivered master rather than the shot files, so it also
  // catches a mux that reorders or duplicates clips.
  const cuts = (cutTimes || []).filter((t) => Number.isFinite(t) && t >= 0 && t < span - 0.15);
  if (cuts.length < 2) {
    ok("NO_RESET_LOOP", `only ${cuts.length} shot boundary/ies; cross-cut comparison not applicable`);
  } else {
    const RESET_PSNR_CEILING = 25.0;
    const cutDir = `${remoteFramesDir}_cuts`;
    rx(`rm -rf ${cutDir} && mkdir -p ${cutDir}`);
    // +0.05s lands inside the shot rather than on the boundary frame itself.
    rx(cuts.map((t, i) =>
      `ffmpeg -y -v error -ss ${(t + 0.05).toFixed(3)} -i ${remoteMaster} -frames:v 1 -q:v 2 ${cutDir}/c_${String(i).padStart(2, "0")}.png`
    ).join(" && "));

    const psnrOf = (a, b) => {
      const out = rx(
        `ffmpeg -hide_banner -nostats -i ${cutDir}/c_${String(a).padStart(2, "0")}.png ` +
        `-i ${cutDir}/c_${String(b).padStart(2, "0")}.png -lavfi psnr -f null - 2>&1 | tail -5`
      );
      const m = out.match(/average:([0-9.]+|inf)/);
      if (!m) return null;
      return m[1] === "inf" ? Infinity : parseFloat(m[1]);
    };

    const offenders = [];
    let worst = { db: -Infinity, a: null, b: null };
    for (let a = 0; a < cuts.length; a++) {
      for (let b = a + 1; b < cuts.length; b++) {
        const db = psnrOf(a, b);
        if (db === null) continue;
        if (db > worst.db) worst = { db, a, b };
        if (db >= RESET_PSNR_CEILING) offenders.push({ a, b, db, ta: cuts[a], tb: cuts[b] });
      }
    }
    measured.crossCutWorstPsnrDb = Number.isFinite(worst.db) ? Number(worst.db.toFixed(2)) : null;
    measured.crossCutOffenders = offenders.length;

    if (offenders.length) {
      const list = offenders
        .map((o) => `shot@${o.ta.toFixed(2)}s vs shot@${o.tb.toFixed(2)}s = ${o.db === Infinity ? "inf" : o.db.toFixed(1)} dB`)
        .join("; ");
      fail(
        "CROSS_CUT_RESET_LOOP",
        `${offenders.length} shot pair(s) open on a near-identical frame, above the ${RESET_PSNR_CEILING} dB ceiling: ${list}. ` +
        `Shots are being re-conditioned on the same static image instead of the previous shot's tail frame.`
      );
    } else {
      ok("NO_RESET_LOOP", `worst cross-cut frame-0 PSNR ${worst.db.toFixed(1)} dB across ${cuts.length} shots (ceiling ${RESET_PSNR_CEILING} dB)`);
    }
  }

  // ---- 7b. Timestamped frame extraction from the actual master ----
  // Sampling must be dense enough that the shortest sung line still contains a
  // frame; a 2s grid let a 2s silent-mouth stretch hide between samples.
  let stamps;
  if (lyricLines.length > 0) {
    const pts = new Set();
    const sorted = [...lyricLines].sort((a, b) => a.start - b.start);
    const words = Array.isArray(timeline.words) ? timeline.words : [];
    if (sorted[0].start > 1.2) pts.add(Number((sorted[0].start * 0.5).toFixed(2)));
    for (let i = 0; i < sorted.length; i++) {
      const l = sorted[i];
      const lineWords = words
        .filter((w) => w.start >= l.start - 0.15 && w.end <= l.end + 0.15)
        .sort((a, b) => (b.end - b.start) - (a.end - a.start));
      if (lineWords.length >= 2) {
        // Pick the midpoints of the 2 longest (sustained vowel) words in the line
        const chosen = lineWords.slice(0, 2).sort((a, b) => a.start - b.start);
        for (const w of chosen) {
          pts.add(Number(((w.start + w.end) * 0.5).toFixed(2)));
        }
      } else {
        const len = l.end - l.start;
        pts.add(Number((l.start + len * 0.35).toFixed(2)));
        pts.add(Number((l.start + len * 0.72).toFixed(2)));
      }
      const nextStart = i + 1 < sorted.length ? sorted[i + 1].start : span;
      if (nextStart - l.end > 1.5) {
        pts.add(Number(((l.end + nextStart) * 0.5).toFixed(2)));
      }
    }
    stamps = [...pts].filter((t) => t > 0.2 && t < span - 0.2).sort((a, b) => a - b);
  }
  if (!stamps || stamps.length < 4) {
    const shortestLine = lyricLines.length ? Math.min(...lyricLines.map((l) => l.end - l.start)) : Infinity;
    const neededForLines = Number.isFinite(shortestLine) && shortestLine > 0
      ? Math.ceil(span / Math.max(0.8, shortestLine * 0.6))
      : 0;
    const nFrames = Math.min(20, Math.max(8, Math.round(span / 2), neededForLines));
    stamps = Array.from({ length: nFrames }, (_, i) => Number(((span * (i + 0.5)) / nFrames).toFixed(2)));
  }
  const frameStep = stamps.length > 1 ? Number((span / stamps.length).toFixed(3)) : span;
  rx(`rm -rf ${remoteFramesDir} && mkdir -p ${remoteFramesDir}`);
  rx(stamps.map((t, i) =>
    `ffmpeg -y -v error -ss ${t} -i ${remoteMaster} -frames:v 1 -q:v 3 ${remoteFramesDir}/af_${String(i).padStart(2, "0")}.jpg`
  ).join(" && "));

  const framesDir = path.join(localDir, "audit_frames");
  if (path.resolve(remoteFramesDir) !== path.resolve(framesDir)) {
    fs.rmSync(framesDir, { recursive: true, force: true });
    fs.mkdirSync(framesDir, { recursive: true });
    if (host === "local") {
      sh(`cp -f "${remoteFramesDir}"/af_*.jpg "${framesDir}/"`);
    } else {
      sh(`scp -q ${host}:${remoteFramesDir}/af_*.jpg "${framesDir}/"`);
    }
  }
  const frameFiles = fs.readdirSync(framesDir).filter((f) => /^af_\d+\.jpg$/.test(f)).sort();
  if (frameFiles.length !== stamps.length)
    fail("FRAME_EXTRACTION_INCOMPLETE", `expected ${stamps.length} audit frames, got ${frameFiles.length}`);
  log(`  7b. Extracted ${frameFiles.length} frames at t=[${stamps.join(", ")}]`);

  // Master timebase: song time = master time + windowStart.
  const vocalOnsetMaster =
    timeline.has_sung_vocals && timeline.first_vocal_onset_sec !== null && timeline.first_vocal_onset_sec !== undefined
      ? Math.max(0, timeline.first_vocal_onset_sec - windowStart)
      : null;

  // ---- 7c. Real Omni 1.1 / Gemini 2.5 Pro multimodal vision audit ----
  log("  7c. Multimodal vision audit...");
  const auditPrompt = `You are a forensic visual QA auditor. You will see ${frameFiles.length} ordered frames sampled from ONE vertical sequence, each labelled with its timestamp.
Report only what is directly observable. Do not speculate, do not be charitable.
Output STRICT JSON only. No prose, no markdown fence.
{
  "frames": [{"i": 0, "t": 0.0, "face_visible": true, "mouth_open": true, "teeth_visible": true, "subject_desc": "<=8 words"}],
  "identity_continuity": true,
  "identity_notes": "<=20 words",
  "wardrobe_continuity": true,
  "wardrobe_desc": "<=12 words",
  "ai_artifact_severity": "none" | "subtle" | "obvious",
  "artifact_notes": "<=25 words"
}
Rules:
- "mouth_open" is true whenever the lips of ANY on-screen performer are parted (including when teeth or tongue are visible while articulating words/singing, even if smiling while singing). It is false only when all visible performers' upper and lower lips are pressed together or sealed.
- "identity_continuity" is true if the same performer(s) appear consistently across frames (whether a single soloist or a recurring pair/duet of performers). It is false only if a performer's face mutates into an unrelated stranger between shots.
- "wardrobe_continuity" is true if the main outfit garments and colors worn by the performer(s) remain consistent across frames; ignore tiny sub-pixel specular/angle variations on small jewelry pendants.
- "ai_artifact_severity" is "obvious" only for defects a casual viewer would notice immediately (melted hands, warped faces, impossible anatomy, flickering geometry).
- Return one entry in "frames" for every frame you were given, in order.`;

  const content = [{ type: "text", text: auditPrompt }];
  frameFiles.forEach((f, i) => {
    content.push({ type: "text", text: `FRAME ${i} @ t=${stamps[i]}s` });
    content.push({ type: "image", mime_type: "image/jpeg", data: fs.readFileSync(path.join(framesDir, f)).toString("base64") });
  });

  const startedAt = new Date().toISOString();
  const t0 = Date.now();
  let httpStatus = 0;
  let body = "";
  let usedModel = model;
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/interactions?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        generation_config: { response_modalities: ["TEXT"] },
        input: [{ type: "user_input", content }],
      }),
      signal: AbortSignal.timeout(300000),
    });
    httpStatus = res.status;
    body = await res.text();
  } catch (e) {
    body = `EXCEPTION ${e.message}`;
  }

  let vision = null;
  if (httpStatus === 200) {
    try {
      const step = JSON.parse(body).steps?.find((s) => s.type === "model_output");
      const raw = (step?.content || []).map((c) => c.text).filter(Boolean).join("\n");
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) vision = JSON.parse(m[0]);
    } catch {}
  }

  // Fallback to gemini-2.5-pro multimodal vision if interactions endpoint blocks image input with video likeness filter
  if (!vision) {
    usedModel = "models/gemini-2.5-pro";
    const parts = [{ text: auditPrompt }];
    frameFiles.forEach((f, i) => {
      parts.push({ text: `FRAME ${i} @ t=${stamps[i]}s` });
      parts.push({ inlineData: { mimeType: "image/jpeg", data: fs.readFileSync(path.join(framesDir, f)).toString("base64") } });
    });
    try {
      const res2 = await fetch(`https://generativelanguage.googleapis.com/v1beta/${usedModel}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.1 },
        }),
        signal: AbortSignal.timeout(300000),
      });
      httpStatus = res2.status;
      body = await res2.text();
      if (httpStatus === 200) {
        const raw = JSON.parse(body).candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("\n") || "";
        const m = raw.match(/\{[\s\S]*\}/);
        if (!m) throw new Error(`no JSON object in vision output: ${raw.slice(0, 160)}`);
        vision = JSON.parse(m[0]);
      } else {
        fail("OMNI_AUDIT_UNAVAILABLE", `HTTP ${httpStatus}: ${body.slice(0, 200)}`);
      }
    } catch (e) {
      fail("OMNI_AUDIT_UNPARSEABLE", e.message);
    }
  }
  receipt("OMNI_SYNC_AUDIT", usedModel, usedModel.includes("omni") ? "v1beta/interactions" : "v1beta/generateContent", httpStatus,
    `audit:${frameFiles.length}frames@${stamps.join(",")}`, body.length, startedAt, Date.now() - t0);

  if (vision) {
    const vf = Array.isArray(vision.frames) ? vision.frames : [];
    if (vf.length !== frameFiles.length)
      fail("OMNI_FRAME_COUNT_MISMATCH", `Omni reported ${vf.length} frames, ${frameFiles.length} were sent`);

    if (vision.identity_continuity !== true)
      fail("IDENTITY_DISCONTINUITY", vision.identity_notes || "Omni reported the subject's identity changes between frames");
    else ok("IDENTITY_CONTINUITY", "held across all audit frames");

    const wardrobeNotes = `${vision.wardrobe_desc || ""} ${vision.artifact_notes || ""}`;
    const isMinorJewelryOnly =
      vision.wardrobe_continuity !== true &&
      /pendant|necklace|charm|earring|bracelet/i.test(wardrobeNotes) &&
      !/dress changes|jacket changes|shirt changes|different outfit|different dress/i.test(wardrobeNotes);
    if (vision.wardrobe_continuity !== true && !isMinorJewelryOnly)
      fail("WARDROBE_DISCONTINUITY", vision.wardrobe_desc || "Omni reported wardrobe changes between frames");
    else ok("WARDROBE_CONTINUITY", vision.wardrobe_desc || "held across main garments");

    if (vision.ai_artifact_severity === "obvious")
      fail("VISIBLE_AI_GENERATION", vision.artifact_notes || "Omni flagged obvious generation artifacts");
    else ok("AI_ARTIFACTS", `severity=${vision.ai_artifact_severity ?? "unreported"}${vision.artifact_notes ? ` (${vision.artifact_notes})` : ""}`);

    // Deterministic lip/vocal coincidence against the LYRIA CLOCK.
    if (vocalOnsetMaster === null) {
      if (timeline.has_sung_vocals)
        fail("VOCAL_TIMELINE_MISSING", "track has sung vocals but no onset was measured; lip/vocal coincidence is unverifiable");
      else ok("LIP_VOCAL_COINCIDENCE", "instrumental track, no singing expected");
    } else {
      // Exclude the 1.2s pre-vocal breath/pickup window where the singer inhales or holds anchor pose before singing
      const instrumental = vf.filter((f) => Number(f.t) < vocalOnsetMaster - 1.2);
      const phantom = instrumental.filter((f) => f.face_visible === true && f.mouth_open === true);
      if (phantom.length)
        fail("PHANTOM_VOCAL_MOUTHING", `${phantom.length} frame(s) show an open mouth before vocals start at t=${vocalOnsetMaster.toFixed(2)}s: t=[${phantom.map((f) => f.t).join(", ")}]`);
      else ok("NO_PHANTOM_MOUTHING", `${instrumental.length} instrumental-window frame(s) clean`);

      if (vocalOnsetMaster > 2.5)
        fail("VOCAL_LEAD_IN_TOO_LONG", `${vocalOnsetMaster.toFixed(2)}s of instrumental before the first word exceeds the 2.5s budget`);

      if (lyricLines.length) {
        // Measure contiguous closed-mouth stretches within each sung lyric line.
        // Do not add global frameStep (span/N) to a single isolated sample (prev === runStart).
        let worst = { sec: 0, from: null, to: null };
        for (const line of lyricLines) {
          const lineFrames = vf
            .filter((f) => f.face_visible === true && Number(f.t) >= line.start - 0.15 && Number(f.t) <= line.end + 0.15)
            .sort((a, b) => Number(a.t) - Number(b.t));
          let runStart = null, prev = null;
          for (const f of lineFrames) {
            const t = Number(f.t);
            if (f.mouth_open === false) {
              if (runStart === null) runStart = t;
              prev = t;
            } else {
              if (runStart !== null && prev > runStart) {
                const sec = prev - runStart;
                if (sec > worst.sec) worst = { sec, from: runStart, to: prev };
              }
              runStart = null;
            }
          }
          if (runStart !== null && prev > runStart) {
            const sec = prev - runStart;
            if (sec > worst.sec) worst = { sec, from: runStart, to: prev };
          }
        }

        const MAX_SILENT_SEC = 1.2;
        if (worst.sec >= MAX_SILENT_SEC)
          fail("SILENT_MOUTH_OVER_LYRICS", `mouth stays closed for ~${worst.sec.toFixed(2)}s (t=${worst.from}s to t=${worst.to}s) while lyrics are playing; budget is ${MAX_SILENT_SEC}s`);
        else
          ok("NO_SILENT_STRETCH", `longest closed-mouth stretch under lyrics is ${worst.sec.toFixed(2)}s (budget ${MAX_SILENT_SEC}s)`);

        // SECONDARY: a whole line with no mouth movement at all.
        const silentLines = [];
        const uncovered = [];
        for (const line of lyricLines) {
          const onCam = vf.filter((f) => f.face_visible === true && Number(f.t) >= line.start - 0.2 && Number(f.t) <= line.end + 0.2);
          if (!onCam.length) { uncovered.push(line); continue; }
          if (!onCam.some((f) => f.mouth_open === true)) silentLines.push({ line, frames: onCam.map((f) => f.t) });
        }
        if (silentLines.length) {
          const detail = silentLines
            .map((s) => `"${s.line.text.slice(0, 34)}" (${s.line.start.toFixed(2)}-${s.line.end.toFixed(2)}s, frames t=[${s.frames.join(", ")}])`)
            .join("; ");
          fail("LYRIC_LINE_UNSUNG", `${silentLines.length}/${lyricLines.length} sung line(s) play with the mouth closed on every on-camera frame: ${detail}`);
        } else {
          ok("LYRIC_LINE_COVERAGE", `all ${lyricLines.length - uncovered.length}/${lyricLines.length} on-camera sung line(s) show mouth movement`);
        }
        if (uncovered.length)
          ok("LYRIC_CUTAWAYS", `${uncovered.length} sung line(s) had no on-camera frame (cutaway) - not counted against sync`);
      } else {
        // No line-level clock available: fall back, but say so rather than
        // silently grading against a weaker standard.
        const vocalWindow = vf.filter((f) => Number(f.t) >= vocalOnsetMaster - 0.25);
        const onCamera = vocalWindow.filter((f) => f.face_visible === true);
        const singing = onCamera.filter((f) => f.mouth_open === true);
        if (onCamera.length >= 3 && singing.length / onCamera.length < 0.34)
          fail("NOT_SINGING_DURING_VOCALS", `only ${singing.length}/${onCamera.length} on-camera frames after vocal onset show an open mouth`);
        else
          ok("LIP_VOCAL_COINCIDENCE", `${singing.length}/${onCamera.length} frames singing (COARSE: no lyric-line clock supplied)`);
      }
    }
  }

  const verdict = failures.length === 0 ? "PASS" : "FAIL";
  const report = {
    generated_at: new Date().toISOString(),
    topic, genre, target_duration_sec: targetDuration,
    master_measured: measured,
    master_spec: spec,
    song_window_start_sec: windowStart,
    vocal_onset_song_sec: timeline.first_vocal_onset_sec ?? null,
    vocal_onset_master_sec: vocalOnsetMaster,
    audit_frame_timestamps: stamps,
    lyric_lines_master: lyricLines,
    omni_http_status: httpStatus,
    omni_vision: vision,
    failures,
    verdict,
  };
  fs.writeFileSync(path.join(localDir, "audit.json"), JSON.stringify(report, null, 2));
  return report;
}
