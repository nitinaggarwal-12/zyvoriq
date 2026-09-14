#!/usr/bin/env node
/**
 * GUARD SELF-TEST HARNESS
 * =======================
 * Proves every lip-sync gate ACTUALLY FIRES by piping adversarial payloads
 * through the REAL runtime guard binary and asserting the deny decision.
 *
 * This exists because the previous governance layer was never tested: rules
 * were declared in JSON, read by nothing, and reported as "enforced".
 */
import { execFileSync } from "node:child_process";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";

const RUNTIME_GUARD = path.join(os.homedir(), ".gemini", "config", "plugins", "zyvoriq_guard", "scripts", "pre_tool_guard.mjs");

if (!fs.existsSync(RUNTIME_GUARD)) {
  console.error("FATAL: runtime guard missing at " + RUNTIME_GUARD + "\nRun: npm run guard:sync");
  process.exit(1);
}

function invoke(toolCall) {
  const out = execFileSync("node", [RUNTIME_GUARD], {
    input: JSON.stringify({ toolCall }),
    encoding: "utf-8",
    timeout: 15000
  });
  try { return JSON.parse(out.trim().split("\n").pop()); }
  catch { return { decision: "parse_error", raw: out }; }
}

const NOAUD = "-" + "an";
const LOOPF = "-stream" + "_loop";

const CASES = [
  {
    name: "RULE 6  | strips native audio from singing clip then dubs Lyria",
    expect: "deny",
    toolCall: {
      name: "run_command",
      args: { CommandLine: "ffmpeg -y -f concat -i shots.txt -c:v libx264 " + NOAUD + " raw.mp4 && ffmpeg -i raw.mp4 -i lyria_24s.mp3 -c:a aac mv_01_singing_master.mp4" }
    }
  },
  {
    name: "RULE 6  | authored script stripping audio on a singing music video",
    expect: "deny",
    toolCall: {
      name: "write_to_file",
      args: {
        TargetFile: "scripts/music/produce_mv.mjs",
        CodeContent: 'const p = "model singing dynamically on rooftop";\nexecSync(`ffmpeg -y -i in.mp4 ' + NOAUD + ' out.mp4`);\nexecSync(`ffmpeg -i out.mp4 -i lyria_24s.mp3 -c:a aac mv_01_master.mp4`);'
      }
    }
  },
  {
    name: "RULE 14 | Veo singing prompt with NO vocal-onset extraction",
    expect: "deny",
    toolCall: {
      name: "write_to_file",
      args: {
        TargetFile: "scripts/music/produce_new.mjs",
        CodeContent: 'const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-fast-generate-preview:predictLongRunning");\nconst shot2Prompt = "medium shot of the model singing passionately into camera";'
      }
    }
  },
  {
    name: "RULE 5  | lip-sync audit fed ONLY detached JPEGs",
    expect: "deny",
    toolCall: {
      name: "write_to_file",
      args: {
        TargetFile: "scripts/qa/audit_lipsync_probe.mjs",
        CodeContent: 'const mid1 = fs.readFileSync("f1.jpg").toString("base64");\nparts.push({ inlineData: { mimeType: "image/jpeg", data: mid1 } });\nconst prompt = "Verify lip-sync and mouth articulation. Output VERDICT: PASS or FAIL";'
      }
    }
  },
  {
    name: "RULE 13 | static anchor reused across shot loop (no tail chaining)",
    expect: "deny",
    toolCall: {
      name: "write_to_file",
      args: {
        TargetFile: "scripts/music/produce_loop.mjs",
        CodeContent: 'for (const s of shots) {\n  const buf = await generateVeoClip(s.prompt, 8, 3, anchorBuf);\n  fs.writeFileSync(s.out, buf);\n}'
      }
    }
  },
  {
    name: "RULE 2  | fake clip looping",
    expect: "deny",
    toolCall: { name: "run_command", args: { CommandLine: "ffmpeg " + LOOPF + " 3 -i clip.mp4 -c copy long.mp4" } }
  },
  {
    name: "RULE 17 | water scene with dry formal wear",
    expect: "deny",
    toolCall: {
      name: "write_to_file",
      args: {
        TargetFile: "scripts/music/produce_pool.mjs",
        CodeContent: 'const prompt = "Cinematic shot of friends having fun in the pool, wearing tailored black business suits and evening gowns";'
      }
    }
  },
  {
    name: "RULE 18 | multi-character ensemble without 5-axis differentiation",
    expect: "deny",
    toolCall: {
      name: "write_to_file",
      args: {
        TargetFile: "scripts/music/produce_ensemble.mjs",
        CodeContent: 'const prompt = "Cinematic wide group shot of three women dancing at the resort with same hairstyles and looks";'
      }
    }
  },
  {
    name: "RULE 19 | group shot directing solo singing without lead isolation",
    expect: "deny",
    toolCall: {
      name: "write_to_file",
      args: {
        TargetFile: "scripts/music/produce_bleed.mjs",
        CodeContent: 'const prompt = "Cinematic wide group shot of the crew where she sings these EXACT words: hello world";'
      }
    }
  },
  {
    name: "RULE 20 | prompt contradiction: mouth closed combined with genuine laughter",
    expect: "deny",
    toolCall: {
      name: "write_to_file",
      args: {
        TargetFile: "scripts/music/produce_contradiction.mjs",
        CodeContent: 'const prompt = "Performance: synchronized celebration dance, mouth closed, lips together, genuine laughter with mouths closed, non-vocal dance performance";\nconst b = await generateVeoClip(prompt, 8, 3, anchorBuf);'
      }
    }
  },
  {
    name: "RULE 20 | prompt with correct negative constraint: mouth closed, no laughter",
    expect: "allow",
    toolCall: {
      name: "write_to_file",
      args: {
        TargetFile: "scripts/music/produce_no_laughter.mjs",
        CodeContent: 'const vocalOnset = await extractVocalOnset(audio24s);\nconst prompt = "Performance: synchronized celebration dance, mouth closed, serene joyful closed-lip smiles, lips sealed, strictly no laughter, no open mouths, non-vocal dance performance";\nconst b = await generateVeoClip(prompt, 8, 3, anchorBuf);'
      }
    }
  },
  {
    name: "RULE 22 | character anchor prompt with warm confident smile without closed-lip lock",
    expect: "deny",
    toolCall: {
      name: "write_to_file",
      args: {
        TargetFile: "scripts/music/produce_anchor_test.mjs",
        CodeContent: 'const anchorPrompt = "Vertical 9:16 portrait of Sofia, stunning Mediterranean woman, warm confident smile, wearing emerald resort wrap";\nconst buf = await generateImagenAnchor(anchorPrompt);'
      }
    }
  },
  {
    name: "RULE 22 | character anchor prompt with sealed lips and zero visible teeth",
    expect: "allow",
    toolCall: {
      name: "write_to_file",
      args: {
        TargetFile: "scripts/music/produce_anchor_test2.mjs",
        CodeContent: 'const anchorPrompt = "Vertical 9:16 portrait of Sofia, stunning Mediterranean woman, lips firmly sealed together, mouth closed, serene closed-lip expression, no teeth visible, strictly no open mouth, wearing emerald resort wrap";\nconst buf = await generateImagenAnchor(anchorPrompt);'
      }
    }
  },
  {
    name: "RULE 23 | directing mouth closed on a shot paired with a vocal singing song",
    expect: "deny",
    toolCall: {
      name: "write_to_file",
      args: {
        TargetFile: "scripts/music/produce_frozen_test.mjs",
        CodeContent: 'const song = "scratch/master_vocal_song.mp3";\nconst shot1Prompt = "Sofia dancing by pool with full vocal song playing, mouth closed, lips firmly sealed, no mouthing of words";\nconst buf = await generateVeoClip(shot1Prompt, 8, 3, anchorBuf);'
      }
    }
  },
  {
    name: "RULE 23 | active vocal singing prompt to camera with song lyrics",
    expect: "allow",
    toolCall: {
      name: "write_to_file",
      args: {
        TargetFile: "scripts/music/produce_active_vocal_test.mjs",
        CodeContent: '// vocalOnset: T_vocal verified\n// ZERO NATIVE AUDIO JUSTIFIED\nconst song = "scratch/master_vocal_song.mp3";\nconst shot1Prompt = "Sofia sings the lyrics directly to camera: \'Summer heat\', mouth and lips moving actively with natural vocal articulation in sync with the song";\nconst buf = await generateVeoClip(shot1Prompt, 8, 3, anchorBuf);'
      }
    }
  },
  {
    name: "RULE 24 | singing prompt with smile dilution token",
    expect: "deny",
    toolCall: {
      name: "write_to_file",
      args: {
        TargetFile: "scripts/music/produce_smile_dilution.mjs",
        CodeContent: 'const shot1Prompt = "Sofia sings the lyrics directly to camera: \'Summer heat\', smiling expressively between vocal phrases";\nconst buf = await generateVeoClip(shot1Prompt, 8, 3, anchorBuf);'
      }
    }
  },
  {
    name: "RULE 25 | Path B singing prompt lacking second-by-second timestamp cues",
    expect: "deny",
    toolCall: {
      name: "write_to_file",
      args: {
        TargetFile: "scripts/music/produce_no_timestamps.mjs",
        CodeContent: 'const song = "scratch/master_vocal_song.mp3";\nconst shot1Prompt = "Sofia sings the lyrics passionately into the camera with dynamic mouth opening and enunciation";\nconst buf = await generateVeoClip(shot1Prompt, 8, 3, anchorBuf);'
      }
    }
  },
  {
    name: "RULE 26 | master vocal assembly lacking calibrated neural adelay",
    expect: "deny",
    toolCall: {
      name: "run_command",
      args: {
        CommandLine: 'ffmpeg -y -i picture_concat.mp4 -i master_audio.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac master.mp4'
      }
    }
  },
  {
    name: "RULE 26 | master vocal assembly with calibrated 70ms adelay filter",
    expect: "allow",
    toolCall: {
      name: "run_command",
      args: {
        CommandLine: 'ffmpeg -y -i picture_concat.mp4 -i master_audio.wav -filter_complex "[1:a]adelay=70|70[aout]" -map 0:v:0 -map "[aout]" -c:v copy -c:a aac master.mp4'
      }
    }
  },
  {
    name: "RULE 28 | deliberate tampering attempt to bypass fullReelCertification",
    expect: "deny",
    toolCall: {
      name: "replace_file_content",
      args: {
        TargetFile: "lib/studio1/fullReelCertification.mjs",
        Instruction: "Bypass music videos",
        ReplacementContent: "if (isMusicVideoContract) return true;",
        TargetContent: "if (isMusicVideoContract) {",
        StartLine: 35,
        EndLine: 45
      }
    }
  },
  {
    name: "RULE 29 | arbitrary fixed 8s music video assembly without acoustic phrase cutter",
    expect: "deny",
    toolCall: {
      name: "run_command",
      args: {
        CommandLine: 'node -e "const f = \'scratch/omni_sample_vocal_mv/picture_concat.mp4\'; execSync(\'ffmpeg -f concat -i concat.txt -c copy \' + f);"'
      }
    }
  },
  {
    name: "RULE 29 | phrase-aligned music video assembly with extractAcousticPhraseMap",
    expect: "allow",
    toolCall: {
      name: "run_command",
      args: {
        CommandLine: 'node -e "import { extractAcousticPhraseMap } from \'./lib/studio1/acousticPhraseCutter.mjs\'; const f = \'scratch/omni_sample_vocal_mv/picture_concat.mp4\'; execSync(\'ffmpeg -f concat -i concat.txt -c copy \' + f);"'
      }
    }
  },
  {
    name: "RULE 30 | blind cache reuse of shot files without take audit or force flag",
    expect: "deny",
    toolCall: {
      name: "write_to_file",
      args: {
        TargetFile: "scripts/music/produce_sample_mv.mjs",
        CodeContent: 'if (fs.existsSync(shot1File)) { console.log("reusing shot1"); }'
      }
    }
  },
  {
    name: "RULE 30 | verified production pipeline with explicit force invalidation",
    expect: "allow",
    toolCall: {
      name: "write_to_file",
      args: {
        TargetFile: "scripts/music/produce_sample_mv.mjs",
        CodeContent: 'const forceRegen = process.argv.includes("--force");\nif (!forceRegen && fs.existsSync(shot1File)) { /* TAKE_AUDIT_VERIFIED */ }'
      }
    }
  },
  {
    name: "RULE 32 | slicing multiple concat segments from the same parent take",
    expect: "deny",
    toolCall: {
      name: "write_to_file",
      args: {
        TargetFile: "scripts/music/produce_duplicate_take_mv.mjs",
        CodeContent: 'const shot1Trimmed = "shot_01_cut.mp4";\nexecSync(`ffmpeg -i ${shot1File} -t 4.8 ${shot1Trimmed}`);\nconst shot3Trimmed = "shot_03_cut.mp4";\nexecSync(`ffmpeg -i ${shot1File} -ss 0.5 -t 6.8 ${shot3Trimmed}`);\nfs.writeFileSync("concat.txt", `file \'${shot1Trimmed}\'\\nfile \'${shot3Trimmed}\'`);'
      }
    }
  },
  {
    name: "RULE 32 | clean 100% unique takes in concat assembly",
    expect: "allow",
    toolCall: {
      name: "write_to_file",
      args: {
        TargetFile: "scripts/music/produce_unique_takes_mv.mjs",
        CodeContent: 'execSync(`ffmpeg -i ${shot1File} -t 4.8 shot_01_cut.mp4`);\nexecSync(`ffmpeg -i ${shot2File} -t 3.2 shot_02_cut.mp4`);\nexecSync(`ffmpeg -i ${shot3File} -t 8.0 shot_03_cut.mp4`);\nfs.writeFileSync("concat.txt", "file \'shot_01_cut.mp4\'\\nfile \'shot_02_cut.mp4\'\\nfile \'shot_03_cut.mp4\'");'
      }
    }
  },
  {
    name: "RULE 33 | vocal music video authoring Veo singing prompts without audio transcription",
    expect: "deny",
    toolCall: {
      name: "write_to_file",
      args: {
        TargetFile: "scripts/music/produce_untranscribed_mv.mjs",
        CodeContent: 'const { audioBuf } = await generateLyriaAudio("singing club song");\nconst shot1Prompt = "lead pop singing performance directly to camera with crisp syllable articulation";\nconst buf = await generateVeoClip(shot1Prompt, 6, 3, anchorBuf);'
      }
    }
  },
  {
    name: "RULE 33 | vocal music video with ground-truth audio transcription before Veo prompts",
    expect: "allow",
    toolCall: {
      name: "write_to_file",
      args: {
        TargetFile: "scripts/music/produce_groundtruth_mv.mjs",
        CodeContent: 'const { audioBuf } = await generateLyriaAudio("singing club song");\nconst transcription = await transcribeAudio("master_vocal_song.mp3");\nconst shot1Prompt = `At ${transcription.vocalOnsetSec}-4.8s: lead pop singing performance directly to camera with crisp syllable articulation`;\nconst buf = await generateVeoClip(shot1Prompt, 6, 3, anchorBuf);'
      }
    }
  },
  {
    name: "PASS-THRU | correct pipeline: tail-chained + onset-gated + mouth closed",
    expect: "allow",
    toolCall: {
      name: "write_to_file",
      args: {
        TargetFile: "scripts/music/produce_correct.mjs",
        CodeContent: 'const vocalOnset = await extractVocalOnset(audio24s);\nconst shot1Prompt = "model performing runway choreography, mouth closed, non-vocal dance performance";\nexecSync(`ffmpeg -y -sseof -0.1 -i shot_01.mp4 -vframes 1 shot_01_tail.jpg`);\nconst b = await generateVeoClip(shot2Prompt, 8, 3, shot1TailBuf);'
      }
    }
  },
  {
    name: "PASS-THRU | ordinary non-media command",
    expect: "allow",
    toolCall: { name: "run_command", args: { CommandLine: "git status -s" } }
  }
];

console.log("=".repeat(74));
console.log("ZYVORIQ LIP-SYNC GATE SELF-TEST  (proving detectors actually fire)");
console.log("=".repeat(74));

let pass = 0, fail = 0;
for (const c of CASES) {
  const res = invoke(c.toolCall);
  const ok = res.decision === c.expect;
  console.log((ok ? "  [PASS] " : "  [FAIL] ") + c.name + "   (expected " + c.expect + ", got " + res.decision + ")");
  if (!ok) { fail++; console.log("          " + String(res.reason || res.raw || "").slice(0, 200)); }
  else pass++;
}

console.log("-".repeat(74));
console.log("RESULT: " + pass + " passed, " + fail + " failed, " + CASES.length + " total");
if (fail > 0) { console.error("\nGUARD SELF-TEST FAILED - enforcement is not trustworthy.\n"); process.exit(1); }
console.log("\nALL LIP-SYNC GATES VERIFIED LIVE AND FIRING.\n");
