import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { sanitizeAndEnrichUserPrompt } from "./promptVerifier.ts";

export type LyriaTier = "standard" | "pro";

export interface LyriaSection {
  name: "intro" | "verse" | "chorus" | "bridge" | "outro";
  startSec: number;
  endSec: number;
  energy: number; // 0.0 to 1.0
}

export interface LyriaMusicPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  genre: string;
  bpm: number;
  keySignature: string;
  instruments: string[];
  recommendedAesthetics: string[];
  samplePrompt: string;
}

export const LYRIA_MUSIC_PRESETS: LyriaMusicPreset[] = [
  {
    id: "adaptive_cinematic",
    name: "Adaptive Cinematic Score (AI Auto-Match)",
    badge: "DeepMind Lyria 3.0",
    description: "Dynamically morphs musical dynamics, orchestration, and key to match the exact visual pacing and emotion of the Veo 3.1 scene.",
    genre: "Cinematic Orchestral",
    bpm: 90,
    keySignature: "D Minor",
    instruments: ["Symphonic Strings", "French Horns", "Sub-Bass", "Atmospheric Pads"],
    recommendedAesthetics: ["photorealistic_keynote", "imax_70mm", "ue5_raytraced"],
    samplePrompt: "Epic cinematic orchestral score with rising brass, sweeping string crescendos, deep cinematic sub-bass, and majestic emotional resolution."
  },
  {
    id: "zen_shakuhachi",
    name: "Zen Dojo Shakuhachi & Koto Strings",
    badge: "DeepMind Lyria 3.0",
    description: "Traditional bamboo flute, resonant koto strings, taiko heartbeat pulses, and soothing rain textures for contemplative and anime scenes.",
    genre: "Traditional Neo-Zen",
    bpm: 72,
    keySignature: "A Minor (Hirajoshi)",
    instruments: ["Shakuhachi Flute", "13-String Koto", "Taiko Percussion", "Warm Temple Bells"],
    recommendedAesthetics: ["ufotable_anime", "ghibli_pastoral"],
    samplePrompt: "Meditative Japanese classical score with authentic shakuhachi flute, delicate koto plucking, gentle rain sounds, and rising dramatic shamisen intensity."
  },
  {
    id: "cyberpunk_synth",
    name: "Cyberpunk 2099 Analog Neon Pulse",
    badge: "High-Energy Synth",
    description: "Analog Moog saw basslines, gated reverb claps, arpeggiated neon synths, and driving darkwave percussion at 128 BPM.",
    genre: "Darksynth / Cyberpunk",
    bpm: 128,
    keySignature: "F Minor",
    instruments: ["Moog Sub 37 Bass", "Juno-106 Arpeggio", "LinnDrum Gated Snare", "Modular Glitch"],
    recommendedAesthetics: ["cyberpunk_noir", "ue5_raytraced"],
    samplePrompt: "Heavy analog synthwave track with deep distorted bassline, driving 128 BPM electronic drums, shimmering cyberpunk synth arpeggios, and futuristic neon ambiance."
  },
  {
    id: "savannah_orchestral",
    name: "Serengeti Majestic Wildlife Score",
    badge: "BBC Earth 8K",
    description: "Sweeping cinematic strings, warm African marimbas, kalimba rhythms, and triumphant brass capturing the raw grandeur of nature.",
    genre: "Wildlife Documentary",
    bpm: 84,
    keySignature: "G Major",
    instruments: ["Cello Ensemble", "African Kalimba", "Woodwinds", "Distant Thunder Ambience"],
    recommendedAesthetics: ["bbc_earth", "imax_70mm"],
    samplePrompt: "Majestic nature documentary score inspired by BBC Earth, featuring sweeping cellos, African percussion, airy flute melodies, and golden sunrise emotional warmth."
  },
  {
    id: "executive_ambient",
    name: "Minimalist Sovereign Keynote Pulse",
    badge: "Silicon Valley Tech",
    description: "Clean glassmorphic marimba plucks, subtle sub-bass pads, and precision digital pulses designed to elevate speech without distraction.",
    genre: "Tech Corporate Ambient",
    bpm: 105,
    keySignature: "C Major",
    instruments: ["Muted Acoustic Guitar", "Glass Marimba", "Subtle Electric Bass", "Lo-Fi Vinyl Shimmer"],
    recommendedAesthetics: ["photorealistic_keynote", "french_new_wave"],
    samplePrompt: "Refined minimalist tech keynote background score, subtle marimba plucks, warm sub-bass, inspiring modern ambient texture, engineered for voice ducking."
  },
  {
    id: "interstellar_drone",
    name: "Interstellar Deep Space Gravitational Drone",
    badge: "Cosmic Sci-Fi",
    description: "Hans Zimmer-inspired church organ harmonics, gravitational wave sub-frequencies, and shimmering cosmic shimmer reverbs.",
    genre: "Cosmic Ambient",
    bpm: 60,
    keySignature: "E Minor",
    instruments: ["Pipe Organ", "Sub-Harmonic Drone", "Modular Shimmer Reverb", "Space Telemetry FX"],
    recommendedAesthetics: ["interstellar_space", "biomedical_micro"],
    samplePrompt: "Ethereal deep space score with massive gravitational sub-bass drones, cosmic modular synth pads, distant church organ swells, and astronomical awe."
  },
  {
    id: "bollywood_fusion",
    name: "Bollywood Grandeur & Dynamic Dhol",
    badge: "Indian Classical & Fusion",
    description: "Sitar virtuosity, passionate Indian violin sections, heavy Punjabi dhol beats, and dramatic emotional crescendos.",
    genre: "Bollywood Cinematic Fusion",
    bpm: 110,
    keySignature: "C# Minor (Bhairav)",
    instruments: ["Sitar", "Bansuri Flute", "Dhol & Tabla", "Cinematic String Section"],
    recommendedAesthetics: ["bollywood_grandeur"],
    samplePrompt: "High-production Bollywood cinematic orchestral fusion with dramatic sitar leads, bansuri flute harmonies, energetic dhol beats, and sweeping cinematic strings."
  },
  {
    id: "latin_indian_fusion",
    name: "Latin-Pop & Desi Dance Fusion (High-Energy Dance Anthem)",
    badge: "DeepMind Lyria 3.0 Pro",
    description: "Infectious Latin pop polyrhythms, driving Punjabi Dhol syncopations, timbales, acoustic brass stabs, and hypnotic dance cadence at 128 BPM.",
    genre: "Latin-Desi Pop Fusion",
    bpm: 128,
    keySignature: "D Minor",
    instruments: ["Live Dhol Drums", "Latin Timbales", "Acoustic Brass Stabs", "Flamenco Nylon Guitar", "808 Sub-Bass"],
    recommendedAesthetics: ["stage_concert", "photorealistic_keynote", "wet_stage"],
    samplePrompt: "High-octane Latin pop and Bollywood stage anthem with live dhol drums, timbales, brass stabs, flamenco guitar, and infectious 128 BPM dance groove."
  },
  {
    id: "chandigarh_denmark_fusion",
    name: "Chandigarh-Copenhagen Summer Pop Dance Fusion",
    badge: "DeepMind Lyria 3.5 Pro",
    description: "High-octane Punjabi pop dance anthem fusing Chandigarh bhangra energy with Scandinavian summer festival brass, clean 128 BPM live dhol groove, modern electronic synth drops, and stadium orchestra dynamics.",
    genre: "Punjabi Pop / Modern Western Dance Fusion",
    bpm: 128,
    keySignature: "G Minor",
    instruments: ["Live Punjabi Dhol", "Scandinavian Brass Ensemble", "Tumbi Riff", "Analog Moog Bass", "Stadium String Section", "Stage Percussion"],
    recommendedAesthetics: ["stage_concert", "photorealistic_keynote", "wet_stage"],
    samplePrompt: "Top-charting Indian Punjabi pop dance anthem with live dhol drums, vibrant Scandinavian brass stabs, soaring Punjabi female vocal hooks, driving 128 BPM electronic festival beat, and electric concert ambience."
  },
  {
    id: "precision_industrial",
    name: "High-Torque Precision Machining Beat",
    badge: "Automotive & Engineering",
    description: "Metallic impact percussion, hydraulic rhythm ticks, carbon-fiber synth textures, and high-velocity pacing.",
    genre: "Industrial Electronic",
    bpm: 135,
    keySignature: "B Minor",
    instruments: ["Metallic Impacts", "Acid Synth Bass", "Hydraulic Percussion", "Stereo Stutter FX"],
    recommendedAesthetics: ["precision_auto", "ue5_raytraced"],
    samplePrompt: "High-octane industrial engineering soundtrack with precision mechanical rhythm, driving metallic percussion, sub-bass engine revs, and titanium CAD aesthetic."
  },
  {
    id: "none",
    name: "Voice-Only / Zero Background Music",
    badge: "Clean Dialogue",
    description: "Pure uninterrupted neural voice speech stems with zero background score or ambient music.",
    genre: "Acapella / Speech Only",
    bpm: 0,
    keySignature: "None",
    instruments: [],
    recommendedAesthetics: [],
    samplePrompt: ""
  }
];

export type LyriaVocalMode = "instrumental" | "character_singing" | "duet_ensemble" | "choir_chant";

export interface LyriaVocalStyle {
  id: string;
  name: string;
  badge: string;
  description: string;
  vocalRange: string;
  vibratoRate: string;
  genre: string;
}

export const LYRIA_VOCAL_STYLES: LyriaVocalStyle[] = [
  {
    id: "anime_jpop_lead",
    name: "Anime J-Pop / Epic Rock Theme Lead",
    badge: "Ufotable & Shonen",
    description: "Energetic, emotive anime opening theme lead vocals with rapid lyrical cadence, crisp consonant visemes, and sustained emotional vibrato.",
    vocalRange: "Mezzo-Soprano / Tenor",
    vibratoRate: "5.8 Hz",
    genre: "Anime Rock / J-Pop"
  },
  {
    id: "bollywood_melodic_raga",
    name: "Bollywood Classical Raga & Sitar Melisma",
    badge: "Indian Classical",
    description: "Passionate ornamented vocal runs (harkat/taan), microtonal pitch bends, and expressive classical Hindi/Sanskrit lyrical phrasing.",
    vocalRange: "Soprano / Baritone",
    vibratoRate: "6.2 Hz",
    genre: "Bollywood Classical Fusion"
  },
  {
    id: "cyberpunk_autotune_vocoder",
    name: "Cyberpunk 2099 Holographic Vocoder Lead",
    badge: "Futuristic Synth",
    description: "Hard-tuned digital vocoder harmonies, rhythmic synth-pop delivery, and stuttered electronic vocal chops synchronized to 128 BPM beats.",
    vocalRange: "Synthesized Tenor",
    vibratoRate: "Quantized 0ms",
    genre: "Darksynth / Glitch Pop"
  },
  {
    id: "ethereal_operatic_choir",
    name: "Ethereal Operatic Soprano & Choral Harmony",
    badge: "Cosmic Cinema",
    description: "Sweeping cinematic choir and transcendent solo soprano notes with wide dynamic range and reverbed acoustic space.",
    vocalRange: "Coloratura Soprano",
    vibratoRate: "5.2 Hz",
    genre: "Cinematic Classical"
  },
  {
    id: "tribal_savannah_chant",
    name: "African Choral & Savannah Harmonic Chant",
    badge: "BBC Wildlife",
    description: "Warm polyphonic harmonies, rhythmic call-and-response vocal chants, and celebratory acoustic resonance.",
    vocalRange: "Full SATB Choir",
    vibratoRate: "Natural Warm",
    genre: "World / Choral"
  },
  {
    id: "latin_pop_belt",
    name: "Latin-Pop Belt & Desi Dance Fusion Vocal",
    badge: "Latin & Bollywood Pop",
    description: "High-energy rhythmic chest-voice singing, fast staccato vocal phrasing, expressive vibrato, and dynamic festival call-and-response.",
    vocalRange: "Mezzo-Soprano / Belter",
    vibratoRate: "6.0 Hz",
    genre: "Latin Pop / Desi Dance"
  }
];

export interface LyriaMusicResult {
  audioUrl: string;
  canonicalId?: string;
  modelUsed?: string;
  duration: number;
  tier: LyriaTier;
  presetId: string;
  presetName: string;
  vocalMode: LyriaVocalMode;
  vocalStyle?: string;
  genre: string;
  bpm: number;
  keySignature: string;
  synthIdWatermark: boolean;
  c2paHash: string;
  singingPromptDirective: string;
  sections?: LyriaSection[];
  lyriaRawArrangement?: string;
  lyrics?: string[];
}

/**
 * Synthesizes music background track conditioned on video aesthetics & narrative prompt using Google DeepMind Lyria 3 models.
 * Supports Lyria 3 Standard (30s single cue) and Lyria 3 Pro (up to 180s / 3 minutes multi-section arrangements).
 */
export async function generateLyriaBackgroundMusic(options: {
  prompt: string;
  tier?: LyriaTier;
  sections?: LyriaSection[];
  visualStyle?: string;
  musicPreset?: string;
  genre?: string;
  bpm?: number;
  vocalMode?: LyriaVocalMode;
  vocalStyle?: string;
  duration?: number;
  jobId?: string;
}): Promise<LyriaMusicResult | null> {
  const {
    prompt,
    tier = "standard",
    sections,
    visualStyle = "photorealistic_keynote",
    musicPreset = "adaptive_cinematic",
    vocalMode = "instrumental",
    vocalStyle = "anime_jpop_lead",
    duration = tier === "pro" ? 180 : 30,
    jobId = `lyria_${Date.now()}`
  } = options;

  if (musicPreset === "none") {
    return null;
  }

  // Resolve best preset, honoring caller-supplied bpm/genre overrides when provided
  const selectedPreset = LYRIA_MUSIC_PRESETS.find(p => p.id === musicPreset) ||
    LYRIA_MUSIC_PRESETS.find(p => p.recommendedAesthetics.includes(visualStyle)) ||
    LYRIA_MUSIC_PRESETS[0];

  const effectiveBpm =
    typeof options.bpm === "number" && Number.isFinite(options.bpm) && options.bpm > 0
      ? Math.round(options.bpm)
      : selectedPreset.bpm;
  const effectiveGenre =
    typeof options.genre === "string" && options.genre.trim().length > 0
      ? options.genre.trim()
      : selectedPreset.genre;

  const selectedVocal = LYRIA_VOCAL_STYLES.find(v => v.id === vocalStyle) || LYRIA_VOCAL_STYLES[0];

  const c2paHash = "0x" + crypto.createHash("sha256").update(`${jobId}_${prompt}_${selectedPreset.id}_${effectiveBpm}_${vocalMode}_lyria_v3_${tier}`).digest("hex");

  // Format singing performance direction for Veo 3.1 video diffusion
  let singingPromptDirective = "";
  if (vocalMode === "character_singing") {
    singingPromptDirective = `The lead character is passionately singing into the camera/stage mic with expressive facial emotion and rhythmic mouth articulation synchronized to the ${effectiveBpm} BPM musical tempo (${selectedVocal.name}). Visemes show clear vowel extensions and melodic phrasing.`;
  } else if (vocalMode === "duet_ensemble") {
    singingPromptDirective = `Both characters are singing in dynamic duet harmony, trading vocal lines with expressive facial acting, open-throat vocal projection, and musical cadence.`;
  } else if (vocalMode === "choir_chant") {
    singingPromptDirective = `Background ensemble and choir are singing ambient vocal chants in reverbed harmony with subtle facial motion.`;
  }

  // Enforce tier runtime limits: Lyria 3 Standard = max 30s; Lyria 3 Pro = max 180s (3 minutes)
  const maxRuntime = tier === "pro" ? 180 : 30;
  const effectiveDuration = Math.min(maxRuntime, Math.max(8, duration));

  // Default multi-section progression if Lyria 3 Pro is requested without explicit custom sections
  const defaultSections: LyriaSection[] = sections || (tier === "pro" ? [
    { name: "intro", startSec: 0, endSec: Math.round(effectiveDuration * 0.15), energy: 0.35 },
    { name: "verse", startSec: Math.round(effectiveDuration * 0.15), endSec: Math.round(effectiveDuration * 0.5), energy: 0.6 },
    { name: "chorus", startSec: Math.round(effectiveDuration * 0.5), endSec: Math.round(effectiveDuration * 0.8), energy: 0.9 },
    { name: "outro", startSec: Math.round(effectiveDuration * 0.8), endSec: effectiveDuration, energy: 0.4 }
  ] : [
    { name: "verse", startSec: 0, endSec: effectiveDuration, energy: 0.5 }
  ]);

  // Physical Google DeepMind Lyria 3 Pro API call + Broadcast 48kHz Mastering
  let lyriaRawArrangement: string | undefined;
  let lyrics: string[] | undefined;
  let generatedAudioUrl = "";
  let generatedCanonicalId: string | undefined;
  let usedModelName =
    tier === "pro" ? "models/lyria-3-pro-preview" : "models/lyria-3-clip-preview";
  let actualDuration = effectiveDuration;

  const key = (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    ""
  ).trim();

  if (key) {
    try {
      const { execFileSync } = await import("node:child_process");
      const { appendLibraryAssets } = await import("@/lib/swarm/libraryStore");
      const { sanitizedTopic: sanitizedPrompt } = await sanitizeAndEnrichUserPrompt(prompt, {
        genre: effectiveGenre,
      });
      const cleanPresetName = selectedPreset.name
        .replace(/[^\w\s-]/g, "")
        .replace(/\b(shakira|beyonc[eé]|rihanna|taylor\s*swift|drake|bad\s*bunny|dua\s*lipa)\b/gi, "studio artist")
        .trim();
      const isInstrumentalScore = vocalMode === "instrumental";
      const lyriaPrompt = isInstrumentalScore
        ? `Compose a 100% PURE INSTRUMENTAL big-movie IMAX theatrical film score (${effectiveBpm} BPM, key: ${selectedPreset.keySignature}) for: ${sanitizedPrompt}. Style: ${cleanPresetName}, genre: ${effectiveGenre}. Include dramatic orchestral brass swells, thunderous cinematic war drums and percussion hits, tension risers, sub-bass LFE drops, and sweeping symphonic strings. STRICTLY INSTRUMENTAL ONLY — NO vocals, NO singing, NO spoken words, NO choir.`
        : `Compose a complete, radio-ready ${effectiveBpm} BPM studio song arrangement for: ${sanitizedPrompt}. Style: ${cleanPresetName}, genre: ${effectiveGenre}, key: ${selectedPreset.keySignature}. Include a tight 1-second rhythmic pickup, expressive upfront studio vocals (+4.5 dB), verse, explosive chorus hook, and dynamic finale.`;

      const candidateLyriaModels =
        tier === "pro" || effectiveDuration > 30
          ? ["models/lyria-3-pro-preview", "models/lyria-3-clip-preview"]
          : ["models/lyria-3-clip-preview", "models/lyria-3-pro-preview"];

      for (const modelToTry of candidateLyriaModels) {
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/${modelToTry}:generateContent`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": key,
              },
              body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: lyriaPrompt }] }],
                generationConfig: { responseModalities: ["AUDIO"] },
              }),
              signal: AbortSignal.timeout(55000),
            }
          );

          if (res.ok) {
            const data = await res.json();
            const parts = data?.candidates?.[0]?.content?.parts || [];
            let textAcc = "";
            let audioB64 = "";

            for (const p of parts) {
              if (p.text) textAcc += p.text + "\n";
              if (p.inlineData && p.inlineData.data) {
                audioB64 = p.inlineData.data;
              }
            }

            if (textAcc) {
              const cleanedLines = textAcc
                .split("\n")
                .map((rawLine) =>
                  rawLine
                    .replace(/\[\[[A-Za-z0-9_.-]+\]\]/g, "")
                    .replace(/^\s*\[:\]\s*/g, "")
                    .replace(/\s+\[:\]\s+/g, " ")
                    .trim()
                )
                .filter((l) => l.length > 0);
              lyriaRawArrangement = cleanedLines.join("\n");
              lyrics = cleanedLines.filter(
                (l) => !/^(?:bpm|key|tempo|style|genre)\s*:/i.test(l)
              );
            }

            if (audioB64 && audioB64.length > 1000) {
              usedModelName = modelToTry;
              const outDir = path.join(
                process.cwd(),
                "public/assets/swarm/generated/audio_studio"
              );
              fs.mkdirSync(outDir, { recursive: true });
              const shortHash = c2paHash.slice(2, 12);
              const rawPath = path.join(outDir, `lyria_raw_${Date.now()}_${shortHash}.mp3`);
              const filename = `lyria_song_${Date.now()}_${shortHash}.mp3`;
              const masteredPath = path.join(outDir, filename);
              fs.writeFileSync(rawPath, Buffer.from(audioB64, "base64"));

              try {
                const targetSec = Math.min(180, Math.max(15, effectiveDuration));
                execFileSync(
                  "ffmpeg",
                  [
                    "-y",
                    "-i",
                    rawPath,
                    "-filter_complex",
                    `[0:a]silenceremove=start_periods=0:stop_periods=-1:stop_duration=0.18:stop_threshold=-34dB,aloop=loop=-1:size=2000000000,atrim=0:${targetSec},asetpts=PTS-STARTPTS,highpass=f=42,equalizer=f=3100:t=q:w=1.0:g=3.2,equalizer=f=7200:t=q:w=0.9:g=2.4,loudnorm=I=-14.0:TP=-1.2:LRA=9.0,volume='if(lt(t,${(targetSec * 0.28).toFixed(1)}),0.72,if(lt(t,${(targetSec * 0.65).toFixed(1)}),1.22,if(lt(t,${(targetSec * 0.82).toFixed(1)}),0.74,1.24)))':eval=frame,afade=t=in:st=0:d=0.08,afade=t=out:st=${Math.max(0.5, targetSec - 0.14).toFixed(2)}:d=0.14,alimiter=limit=0.84:level=disabled[outa]`,
                    "-map",
                    "[outa]",
                    "-ar",
                    "48000",
                    "-ac",
                    "2",
                    "-c:a",
                    "libmp3lame",
                    "-b:a",
                    "320k",
                    masteredPath,
                  ],
                  { stdio: "ignore", timeout: 60000 }
                );
                const durStr = execFileSync(
                  "ffprobe",
                  [
                    "-v",
                    "error",
                    "-show_entries",
                    "format=duration",
                    "-of",
                    "default=noprint_wrappers=1:nokey=1",
                    masteredPath,
                  ],
                  { encoding: "utf8", timeout: 8000 }
                ).trim();
                const parsedDur = parseFloat(durStr);
                if (Number.isFinite(parsedDur) && parsedDur > 0) {
                  actualDuration = Number(parsedDur.toFixed(2));
                }
              } finally {
                try {
                  if (fs.existsSync(rawPath)) fs.unlinkSync(rawPath);
                } catch {}
              }

              generatedAudioUrl = `/api/media/assets/swarm/generated/audio_studio/${filename}`;
              generatedCanonicalId = `ZYV-SONG-${shortHash.slice(0, 8).toUpperCase()}`;
              const wordSafeSnippet = (maxLen: number) => {
                const norm = prompt.replace(/\s+/g, " ").trim();
                if (norm.length <= maxLen) return norm;
                const cut = norm.slice(0, maxLen);
                const sp = cut.lastIndexOf(" ");
                return `${(sp > maxLen * 0.55 ? cut.slice(0, sp) : cut).replace(/[,;:\-–—]+$/, "")}…`;
              };
              try {
                appendLibraryAssets([
                  {
                    id: generatedCanonicalId,
                    canonicalId: generatedCanonicalId,
                    canonicalUrl: generatedAudioUrl,
                    studioUrl: `/swarm-MUI`,
                    projectId: jobId,
                    projectTitle: `Lyria 3 Studio Track — ${wordSafeSnippet(48)}`,
                    title: `${isInstrumentalScore ? "Instrumental Score" : "Studio Song"} — ${wordSafeSnippet(52)}`,
                    subtitle: `${usedModelName} • ${effectiveBpm} BPM • ${actualDuration}s • 48,000 Hz Stereo (-14.0 LUFS)`,
                    assetType: "audio_track",
                    genre: effectiveGenre,
                    durationSec: Math.round(actualDuration),
                    audioSpec: "48,000 Hz Stereo MP3 (-14.0 LUFS)",
                    promptSummary: prompt,
                    src: generatedAudioUrl,
                    createdAt: new Date().toISOString(),
                  },
                ]);
              } catch {}
              break;
            }
          } else {
            const errText = await res.text().catch(() => "");
            console.warn(
              `[lyria-service] ${modelToTry} returned status ${res.status}: ${errText.slice(0, 200)}`
            );
          }
        } catch (callErr: any) {
          console.warn(`[lyria-service] Error trying ${modelToTry}:`, callErr.message);
        }
      }
    } catch (err: any) {
      console.warn(`[lyria-service] Physical Lyria invocation warning: ${err?.message || err}`);
    }
  }

  return {
    audioUrl: generatedAudioUrl || "",
    canonicalId: generatedCanonicalId,
    modelUsed: usedModelName,
    duration: actualDuration,
    tier,
    presetId: selectedPreset.id,
    presetName: selectedPreset.name,
    vocalMode,
    vocalStyle: vocalMode !== "instrumental" ? selectedVocal.name : undefined,
    genre: effectiveGenre,
    bpm: effectiveBpm,
    keySignature: selectedPreset.keySignature,
    synthIdWatermark: true,
    c2paHash,
    singingPromptDirective,
    sections: defaultSections,
    lyriaRawArrangement,
    lyrics,
  };
}

export interface LyriaMasterOutput {
  audioBuffer: Buffer;
  lyrics: string[];
  arrangementText: string;
  modelUsed: string;
  durationSec: number;
}

/**
 * Direct DeepMind Lyria master track generation for worker audio pipeline.
 * Returns raw MP3 buffer and timestamped arrangement from models/lyria-3-pro-preview or models/lyria-3-clip-preview.
 */
export async function generateLyriaMusicMaster(options: {
  prompt: string;
  genre?: string;
  durationSec?: number;
  bpm?: number;
  keySignature?: string;
  instrumentalOnly?: boolean;
  theatricalMode?: boolean;
}): Promise<LyriaMasterOutput | null> {
  const apiKey = (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    ""
  ).trim();

  if (!apiKey) {
    console.warn("[lyria-master] Missing GEMINI_API_KEY, skipping Lyria audio generation");
    return null;
  }

  const {
    prompt,
    genre = "Bollywood Action & Romance",
    durationSec = 30,
    bpm = 128,
    keySignature = "D minor",
    instrumentalOnly = false,
    theatricalMode = false,
  } = options;
  const isMythologicalOrVedic = /kailash|shiva|parvati|ganesh|vedic|mytholog|devotional|temple|sacred|sanskrit/i.test(
    genre + " " + prompt
  );
  const isBollywood = /bollywood|desi|hindi|punjabi|india/i.test(genre + " " + prompt);
  const instruments = isMythologicalOrVedic
    ? "Thunderous Vedic pakhawaj and mridangam war drums, resonant Shiva damaru risers, heroic low brass horn swells, sacred bronze temple gongs, soaring bansuri bamboo flute, rudra veena, and sweeping IMAX symphonic strings"
    : isBollywood
    ? "Live Punjabi Dhol, energetic tabla, soaring cinematic violins, dramatic sitar leads, and brass drops"
    : "Symphonic strings, heroic brass crescendos, thunderous taiko war drums, tension risers, and deep sub-bass LFE drops";

  const lyriaPrompt =
    instrumentalOnly || theatricalMode
      ? `Compose a 100% PURE INSTRUMENTAL big-movie IMAX theatrical film score for: "${prompt.trim()}".
Style: ${genre}, Tempo: ${bpm} BPM, Key: ${keySignature}.
Instrumentation: ${instruments}.
Include dramatic act-transition risers, massive brass swells, thunderous percussion hits, and emotional symphonic themes that leave clear midrange headroom for spoken actor dialogue.
CRITICAL RULE: STRICTLY 100% INSTRUMENTAL ONLY — NO vocals, NO singing, NO lyrics, NO choir chants, NO spoken words.`
      : `Compose a high-energy, authentic cinematic musical score and song chorus for: "${prompt.trim()}".
Style: ${genre}, Tempo: ${bpm} BPM, Key: ${keySignature}.
Instrumentation: ${instruments}.
Include memorable song lyrics, melodic chorus drops, and dynamic musical momentum.`;

  const candidateModels = [
    "models/lyria-3-pro-preview",
    "models/lyria-3-clip-preview",
  ];

  for (const model of candidateModels) {
    try {
      console.log(`[lyria-master] Invoking DeepMind ${model} for "${prompt.slice(0, 60)}..."`);
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${model}:generateContent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: lyriaPrompt }] }],
          generationConfig: { responseModalities: ["AUDIO"] },
        }),
        signal: AbortSignal.timeout(150000),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        console.warn(`[lyria-master] ${model} returned ${res.status}: ${errText.slice(0, 200)}`);
        continue;
      }

      const data = await res.json();
      const parts = data.candidates?.[0]?.content?.parts || [];
      let textAcc = "";
      let audioBuffer: Buffer | null = null;

      for (const p of parts) {
        if (p.text) textAcc += p.text + "\n";
        if (p.inlineData?.data) {
          audioBuffer = Buffer.from(p.inlineData.data, "base64");
        }
      }

      if (audioBuffer && audioBuffer.length > 1000) {
        const cleanedLines = textAcc
          .split("\n")
          .map((rawLine) =>
            rawLine
              .replace(/\[\[[A-Za-z0-9_.-]+\]\]/g, "")
              .replace(/^\s*\[:\]\s*/g, "")
              .replace(/\s+\[:\]\s+/g, " ")
              .trim()
          )
          .filter((l) => l.length > 0);
        const lyrics = cleanedLines.filter(
          (l) => !/^(?:bpm|key|tempo|style|genre)\s*:/i.test(l)
        );

        console.log(`[lyria-master] Successfully generated ${audioBuffer.length} bytes audio (~${Math.round(audioBuffer.length / 1024)} KB) via ${model}`);
        if (lyrics.length) {
          console.log(`[lyria-master] Extracted ${lyrics.length} chorus/lyric lines from Lyria arrangement`);
        }

        return {
          audioBuffer,
          lyrics,
          arrangementText: cleanedLines.join("\n"),
          modelUsed: model,
          durationSec
        };
      }
    } catch (err: any) {
      console.warn(`[lyria-master] Error invoking ${model}:`, err?.message || err);
    }
  }

  return null;
}

