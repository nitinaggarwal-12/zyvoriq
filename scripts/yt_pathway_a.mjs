#!/usr/bin/env node
// PATHWAY A: keep Veo's own audio instead of Lyria's.
//
// The main pipeline is Lyria-first: Lyria writes the song, Veo paints pictures
// that cannot hear it, and every lyric grid / vocal directive / silence check
// exists to paper over that gap. The ceiling is "her mouth moves during roughly
// the right seconds" - never phoneme sync - because nothing connects the two
// models except text in a prompt.
//
// But Veo 3.1 generates audio, and the shots are prompted to SING specific
// words. Probing a finished shot's discarded audio track found exactly that:
//
//   shot 1 native audio -> "Golden light on the terracotta floor" @ 0.55-3.86s
//
// which is verbatim the directive that shot was given. Veo made the voice and
// the mouth in the same forward pass, so they agree by construction. The master
// script then deletes it with `-an` and muxes Lyria over the top.
//
// This script rebuilds a master from the SAME shot files with the SAME crop and
// timing, changing exactly one variable: the audio comes from Veo. Identical
// pixels, so any difference in apparent lip sync is attributable to the audio
// source and nothing else. It costs no API calls.
//
// Honest caveat, stated up front rather than discovered later: each Veo clip
// invents its own accompaniment, so across cuts the "song" will not be one
// continuous piece of music. That is Pathway A's real cost and the comparison
// should show it, not hide it.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const WORK = process.argv[2] || "scratch/yt_perfect4";
const OUT = process.argv[3] || path.join(WORK, "master_pathwayA.mp4");
const sh = (c) => execFileSync("bash", ["-lc", c], { encoding: "utf-8", maxBuffer: 1 << 28 });

const shotPlan = JSON.parse(fs.readFileSync(path.join(WORK, "shotplan.json"), "utf-8"));
const tmp = path.join(WORK, "pathwayA");
fs.rmSync(tmp, { recursive: true, force: true });
fs.mkdirSync(tmp, { recursive: true });

console.log(`PATHWAY A: rebuilding ${shotPlan.length} shot(s) from ${WORK} with Veo's native audio`);

const concat = [];
for (const s of shotPlan) {
  const src = path.join(WORK, "shots", `s${s.index}.mp4`);
  if (!fs.existsSync(src)) throw new Error(`missing ${src}`);

  // Verify there is actually audio before claiming this is a Pathway A master.
  const probe = sh(`ffprobe -v error -select_streams a -show_entries stream=codec_name -of csv=p=0 "${src}" || true`).trim();
  if (!probe) throw new Error(`shot ${s.index} has no audio stream; Pathway A is not possible from these clips`);

  // Same cropdetect the Lyria master uses: Veo bakes thin black bars into the
  // picture and scaling does not remove them.
  const crop = (sh(
    `ffmpeg -hide_banner -nostats -ss 0.5 -t 2 -i "${src}" -vf cropdetect=24:2:0 -f null - 2>&1 | grep -o 'crop=[0-9:]*' | tail -1 || true`
  ).trim());
  const vf = `${crop ? crop + "," : ""}scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1`;
  const out = path.join(tmp, `t_${s.index}.mp4`);

  // Video AND audio trimmed to the same span, so they stay locked together.
  sh(`ffmpeg -y -v error -i "${src}" -t ${s.durationSec} -vf "${vf}" ` +
     `-c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k -ar 48000 -ac 2 "${out}"`);
  const dur = sh(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${out}"`).trim();
  console.log(`  shot ${s.index}: crop=${crop || "none"} -> ${Number(dur).toFixed(2)}s ${s.singing ? "SINGING" : "instrumental"} "${(s.lyric || "").slice(0, 40)}"`);
  concat.push(`file '${path.resolve(out)}'`);
}

fs.writeFileSync(path.join(tmp, "concat.txt"), concat.join("\n") + "\n");

// Concat re-encoding the audio so the per-shot AAC streams join cleanly, then a
// single loudnorm pass over the whole thing. No highpass: the full spectrum is
// preserved per the project's audio rules.
sh(`ffmpeg -y -v error -f concat -safe 0 -i "${path.join(tmp, "concat.txt")}" ` +
   `-af "loudnorm=I=-14:TP=-2.0:LRA=11,aresample=48000" ` +
   `-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "${OUT}"`);

const info = sh(`ffprobe -v error -show_entries format=duration:stream=codec_type,codec_name -of csv=p=0 "${OUT}"`).trim();
console.log(`\nPATHWAY A master: ${OUT}\n${info}`);
