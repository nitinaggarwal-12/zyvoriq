#!/usr/bin/env node
/**
 * VOCAL PRESENCE & TIMELINE ANALYSIS
 * ==================================
 * Two jobs, both prerequisites for a music video that is not a lie:
 *  1. Verify the master ACTUALLY contains sung vocals. The previous production
 *     shipped an instrumental and called itself a music video; never again
 *     assert "it has vocals" from the prompt text alone.
 *  2. Extract WHEN singing happens and WHAT words are sung, so shot prompts can
 *     bind lip movement to real lyric timing and instrumental windows can be
 *     directed as mouth-closed dance (the vocal-coincidence mandate).
 *
 * Usage: node scripts/guards/analyze_vocal_timeline.mjs <audio.mp3> [outJson]
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const AUDIO = process.argv[2];
const OUT = process.argv[3] || AUDIO.replace(/\.[^.]+$/, "") + ".vocal_timeline.json";
const MODEL = "models/gemini-2.5-pro";
if (!AUDIO || !fs.existsSync(AUDIO)) { console.error("usage: analyze_vocal_timeline.mjs <audio.mp3>"); process.exit(1); }

const QUESTION = `Listen to this audio track very carefully and transcribe its vocal content with timing.

Answer strictly as JSON, no markdown fence:
{
  "has_sung_vocals": true|false,
  "vocal_type": "none|lead_female|lead_male|duet|choir|vocal_chops_nonlexical",
  "intelligible_words": true|false,
  "first_vocal_onset_sec": number|null,
  "lyric_lines": [
    {"start_sec": 0.0, "end_sec": 0.0, "text": "exact words you hear", "confidence": 0.0-1.0}
  ],
  "instrumental_windows": [{"start_sec":0.0,"end_sec":0.0,"description":"intro build / interlude / outro"}],
  "estimated_bpm": number,
  "structure": "short description of the arrangement over time",
  "mix_notes": "is the voice front and centre, buried, or absent",
  "suitable_as_music_video_song": true|false,
  "reasoning": "2-3 sentences"
}

Be strict and literal:
- If you hear only instruments, set has_sung_vocals false and leave lyric_lines empty. Do not invent lyrics.
- If you hear a voice but it sings non-lexical syllables (oohs, ahhs, chopped vowels) rather than words, set vocal_type "vocal_chops_nonlexical" and intelligible_words false.
- Timings must be your genuine best estimate in seconds from the start of the file.`;

const body = {
  contents: [{ parts: [
    { text: QUESTION },
    { inlineData: { mimeType: "audio/mpeg", data: fs.readFileSync(AUDIO).toString("base64") } }
  ]}],
  generationConfig: { temperature: 0 }
};

console.log(`Analysing ${path.basename(AUDIO)} (${fs.statSync(AUDIO).size} bytes) with ${MODEL} ...`);
const t0 = Date.now();
const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${MODEL}:generateContent?key=${API_KEY}`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body), signal: AbortSignal.timeout(300000)
});
const txt = await res.text();
if (!res.ok) { console.error(`HTTP ${res.status}: ${txt.slice(0,400)}`); process.exit(1); }
let out = JSON.parse(txt)?.candidates?.[0]?.content?.parts?.map(p=>p.text).filter(Boolean).join("") || "";
out = out.replace(/^```[a-z]*\s*/i,"").replace(/```\s*$/,"").trim();
let v; try { v = JSON.parse(out); } catch { console.error("Unparseable:\n"+out.slice(0,1500)); process.exit(1); }

fs.writeFileSync(OUT, JSON.stringify({
  model: MODEL, audio: AUDIO,
  audio_sha256: crypto.createHash("sha256").update(fs.readFileSync(AUDIO)).digest("hex"),
  analysed_at: new Date().toISOString(), duration_ms: Date.now()-t0, timeline: v
}, null, 2));

console.log("\n=== VOCAL TIMELINE ===");
console.log(`  has sung vocals   : ${v.has_sung_vocals}`);
console.log(`  vocal type        : ${v.vocal_type}`);
console.log(`  intelligible words: ${v.intelligible_words}`);
console.log(`  first vocal onset : ${v.first_vocal_onset_sec}s`);
console.log(`  estimated BPM     : ${v.estimated_bpm}`);
console.log(`  mix notes         : ${v.mix_notes}`);
console.log(`  structure         : ${v.structure}`);
console.log(`  usable as MV song : ${v.suitable_as_music_video_song}`);
console.log(`  reasoning         : ${v.reasoning}`);
if (v.lyric_lines?.length) {
  console.log("\n  LYRIC LINES:");
  for (const l of v.lyric_lines) console.log(`    ${String(l.start_sec).padStart(6)}s - ${String(l.end_sec).padStart(6)}s  "${l.text}"  (conf ${l.confidence})`);
}
if (v.instrumental_windows?.length) {
  console.log("\n  INSTRUMENTAL WINDOWS (mouth must stay closed here):");
  for (const w of v.instrumental_windows) console.log(`    ${String(w.start_sec).padStart(6)}s - ${String(w.end_sec).padStart(6)}s  ${w.description}`);
}
console.log(`\nwritten: ${OUT}`);
process.exit(v.has_sung_vocals && v.intelligible_words ? 0 : 1);
