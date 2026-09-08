import type { ReelCreationIntent } from "./types.ts";

export interface OmniCastMember {
  id: string;
  name: string;
  role: "lead" | "antagonist" | "supporting" | "narrator";
  biometricDNA: {
    gender: "male" | "female" | "non-binary";
    ageBand: string;
    facialFeatures: string;
    hair: string;
    distinguishingMarks?: string;
  };
  wardrobe: {
    costume: string;
    accessories: string;
  };
  voiceProfile: string;
}

export type OmniShotGrammar =
  | "ESTABLISHING_WIDE"
  | "HERO_CLOSE_UP"
  | "MEDIUM_TWO_SHOT"
  | "OVER_THE_SHOULDER"
  | "REVERSE_ANGLE"
  | "KINETIC_TRACKING"
  | "DUTCH_ANGLE_LOW"
  | "PRESENTER_DIRECT";

export type OmniEyeline =
  | "screen_left"
  | "screen_right"
  | "horizon_reflective"
  | "downward_intense"
  | "camera";

export interface OmniShotStaging {
  shotNumber: number;
  sceneId?: string;
  speaker: string | null;
  dialogue: string;
  onCameraCharacterId: string | null;
  shotGrammar: OmniShotGrammar;
  eyeline: OmniEyeline;
  cameraMotion: string;
  sceneEnvironment: string;
  visualAction: string;
}

export type OmniGenre =
  | "HISTORICAL_BIOPIC"
  | "BOLLYWOOD_ACTION"
  | "CINEMATIC_DRAMA"
  | "SCI_FI_CYBERPUNK"
  | "NEO_NOIR_THRILLER"
  | "HIGH_FANTASY"
  | "HORROR_MYSTERY"
  | "DOCUMENTARY_EXPLAINER";

export interface OmniDirectorialCompilation {
  genre: OmniGenre;
  visualStyle: {
    optics: string;
    lightingPalette: string;
    atmosphere: string;
  };
  cast: OmniCastMember[];
  shots: OmniShotStaging[];
  masterScript: string;
}

export interface OmniDirectorInput {
  topic: string;
  requestedDurationSec?: number;
  tone?: string;
  creationIntent?: ReelCreationIntent;
  aspectRatio?: "9:16" | "16:9" | "2.39:1";
  scriptText?: string;
  genre?: OmniGenre;
}

const TARGET_SHOT_DURATION_SEC = 6.0;
const MAX_WORDS_PER_SHOT = 12;

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 30) || "character";
}

/**
 * Deterministic directorial compiler for synchronous planning and offline unit tests.
 * Extracts characters from speaker tags (e.g. "OPPENHEIMER:", "GROVES:") and infers genre from topic.
 */
export function compileDeterministicDirectorialPass(
  topic: string,
  scriptText: string,
  requestedDurationSec: number = 30,
  creationIntent?: ReelCreationIntent,
  explicitGenre?: OmniGenre,
  aspectRatio: "9:16" | "16:9" | "2.39:1" = "9:16"
): OmniDirectorialCompilation {
  const cleanTopic = topic.trim().toLowerCase();
  
  // 1. Detect Genre
  let genre: OmniGenre = explicitGenre || "CINEMATIC_DRAMA";
  if (!explicitGenre) {
    if (cleanTopic.includes("dhurandhar") || cleanTopic.includes("action") || cleanTopic.includes("stunt") || cleanTopic.includes("chase") || cleanTopic.includes("fight")) {
      genre = "BOLLYWOOD_ACTION";
    } else if (cleanTopic.includes("oppenheimer") || cleanTopic.includes("history") || cleanTopic.includes("biopic") || cleanTopic.includes("napoleon") || cleanTopic.includes("churchill") || cleanTopic.includes("rome")) {
      genre = "HISTORICAL_BIOPIC";
    } else if (cleanTopic.includes("cyberpunk") || cleanTopic.includes("sci-fi") || cleanTopic.includes("space") || cleanTopic.includes("future") || cleanTopic.includes("alien")) {
      genre = "SCI_FI_CYBERPUNK";
    } else if (cleanTopic.includes("noir") || cleanTopic.includes("detective") || cleanTopic.includes("mystery") || cleanTopic.includes("investigat")) {
      genre = "NEO_NOIR_THRILLER";
    } else if (cleanTopic.includes("fantasy") || cleanTopic.includes("myth") || cleanTopic.includes("dragon") || cleanTopic.includes("magic")) {
      genre = "HIGH_FANTASY";
    } else if (cleanTopic.includes("horror") || cleanTopic.includes("dark") || cleanTopic.includes("creepy")) {
      genre = "HORROR_MYSTERY";
    } else if (cleanTopic.includes("explain") || cleanTopic.includes("how to") || cleanTopic.includes("tutorial") || cleanTopic.includes("tips") || cleanTopic.includes("breakdown")) {
      genre = "DOCUMENTARY_EXPLAINER";
    }
  }

  // 2. Parse Dialogue and Speakers
  const speakerRegex = /(?:^|\n)\s*([A-Za-z][A-Za-z0-9_\s-]{1,24}):/g;
  const detectedSpeakers = new Set<string>();
  const matches = Array.from(scriptText.matchAll(speakerRegex));
  for (const match of matches) {
    const name = match[1].trim();
    if (name && !["NARRATOR", "VOICEOVER", "V.O.", "VO"].includes(name.toUpperCase())) {
      detectedSpeakers.add(name);
    }
  }

  const cast: OmniCastMember[] = [];
  if (detectedSpeakers.size > 0) {
    let idx = 0;
    for (const speaker of Array.from(detectedSpeakers)) {
      const id = slugify(speaker);
      const isLead = idx === 0;
      cast.push({
        id,
        name: speaker,
        role: isLead ? "lead" : "supporting",
        biometricDNA: {
          gender: "male",
          ageBand: isLead ? "late 30s" : "mid 40s",
          facialFeatures: isLead ? "Intense focused gaze, strong defined jawline, expressive eyes" : "Stern weathered countenance, commanding presence",
          hair: isLead ? "Dark textured hair" : "Neatly groomed hair"
        },
        wardrobe: {
          costume: genre === "HISTORICAL_BIOPIC" ? "Bespoke 1940s charcoal wool suit with vest and tie" : genre === "BOLLYWOOD_ACTION" ? "Rugged tactical jacket, fitted dark henley shirt" : "Cinematic tailored wardrobe matching scene era",
          accessories: genre === "HISTORICAL_BIOPIC" ? "Vintage felt fedora hat" : "Tactical timepiece, rugged leather belt"
        },
        voiceProfile: isLead ? "Resonant commanding baritone" : "Firm authoritative voice"
      });
      idx++;
    }
  } else if (genre === "DOCUMENTARY_EXPLAINER") {
    cast.push({
      id: "character_presenter",
      name: "Presenter",
      role: "narrator",
      biometricDNA: {
        gender: "female",
        ageBand: "late 20s",
        facialFeatures: "Warm, articulate, engaging facial expression",
        hair: "Shoulder-length styled hair"
      },
      wardrobe: {
        costume: "Modern studio smart-casual blazer and top",
        accessories: "Minimal studio styling"
      },
      voiceProfile: "Warm, confident and articulate creator voice"
    });
  } else {
    // Single lead hero or cinematic protagonist
    const leadName = creationIntent?.characterName || (genre === "HISTORICAL_BIOPIC" ? "Historical Protagonist" : genre === "BOLLYWOOD_ACTION" ? "Action Hero" : "Protagonist");
    const charId = slugify(leadName);
    cast.push({
      id: charId,
      name: leadName,
      role: "lead",
      biometricDNA: {
        gender: "male",
        ageBand: "late 30s",
        facialFeatures: "Striking cinematic bone structure, intense gaze",
        hair: "Dark styled hair"
      },
      wardrobe: {
        costume: genre === "HISTORICAL_BIOPIC" ? "Period-accurate 1940s tailored suit" : genre === "BOLLYWOOD_ACTION" ? "Rugged tactical leather jacket and dark shirt" : "Cinematic styling",
        accessories: "Period-appropriate accessories"
      },
      voiceProfile: "Low, measured cinematic voice"
    });
  }

  // 3. Build Staging for Each Beat
  const rawLines = scriptText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const beats = rawLines.length > 0 ? rawLines : [scriptText];
  const shots: OmniShotStaging[] = [];

  beats.forEach((line, i) => {
    let speaker: string | null = null;
    let dialogue = line;
    const match = line.match(/^\s*([A-Za-z][A-Za-z0-9_\s-]{1,24}):\s*(.*)$/);
    if (match) {
      speaker = match[1].trim();
      dialogue = match[2].trim();
    }

    let onCameraCharacterId: string | null = null;
    let shotGrammar: OmniShotGrammar = "HERO_CLOSE_UP";
    let eyeline: OmniEyeline = "screen_right";

    if (genre === "DOCUMENTARY_EXPLAINER") {
      const isSubjectForward = i > 0 && i % 3 === 1;
      onCameraCharacterId = isSubjectForward ? null : "character_presenter";
      shotGrammar = isSubjectForward ? "ESTABLISHING_WIDE" : "PRESENTER_DIRECT";
      eyeline = isSubjectForward ? "screen_right" : "camera";
    } else if (genre === "BOLLYWOOD_ACTION") {
      // Bollywood action: mix of hero shots and kinetic action/stunts (no person)
      if (i % 3 === 2) {
        onCameraCharacterId = null; // Pure stunt/car/explosion
        shotGrammar = "KINETIC_TRACKING";
        eyeline = "horizon_reflective";
      } else {
        const char = cast[i % cast.length] || cast[0];
        onCameraCharacterId = char?.id || null;
        shotGrammar = i % 2 === 0 ? "HERO_CLOSE_UP" : "DUTCH_ANGLE_LOW";
        eyeline = i % 2 === 0 ? "screen_right" : "screen_left";
      }
    } else {
      // Cinematic Drama / Biopic: Shot / Reverse-Shot
      if (cast.length > 1) {
        const matchingChar = speaker ? cast.find(c => c.name.toUpperCase() === speaker!.toUpperCase() || c.id === slugify(speaker!)) : null;
        const char = matchingChar || cast[i % cast.length];
        onCameraCharacterId = char.id;
        const charIndex = cast.indexOf(char);
        shotGrammar = charIndex % 2 === 0 ? "HERO_CLOSE_UP" : "OVER_THE_SHOULDER";
        eyeline = charIndex % 2 === 0 ? "screen_right" : "screen_left";
      } else {
        if (i === 0) {
          onCameraCharacterId = null; // Establishing wide
          shotGrammar = "ESTABLISHING_WIDE";
          eyeline = "horizon_reflective";
        } else {
          onCameraCharacterId = cast[0]?.id || null;
          shotGrammar = i % 2 === 1 ? "HERO_CLOSE_UP" : "OVER_THE_SHOULDER";
          eyeline = i % 2 === 1 ? "screen_right" : "horizon_reflective";
        }
      }
    }

    const sceneIndex = Math.floor(i / 4) + 1;
    const sceneId = `scene_${String(sceneIndex).padStart(2, "0")}`;

    shots.push({
      shotNumber: i + 1,
      sceneId,
      speaker,
      dialogue,
      onCameraCharacterId,
      shotGrammar,
      eyeline,
      cameraMotion: shotGrammar === "KINETIC_TRACKING" ? "Dynamic high-speed camera tracking with kinetic whip pans" : "Slow deliberate push-in on 85mm anamorphic prime",
      sceneEnvironment: topic,
      visualAction: `Visual beat for ${dialogue || topic}`
    });
  });

  return {
    genre,
    visualStyle: {
      optics: aspectRatio === "9:16"
        ? "Arri Alexa Mini LF, 35mm & 50mm spherical primes, 9:16 vertical framing, natural optical falloff"
        : aspectRatio === "16:9"
        ? "Arri Alexa Mini LF, 35mm & 50mm spherical primes, 16:9 widescreen framing, natural optical falloff"
        : "Cooke Anamorphic 2.39:1 framing, 24fps motion cadence, natural optical falloff",
      lightingPalette: "High-contrast cinematic key lighting, rich shadows, warm practicals",
      atmosphere: `Atmospheric cinematic tone for ${topic}`
    },
    cast,
    shots,
    masterScript: beats.map(b => b.replace(/^[A-Z0-9_\-\s]{2,25}:/i, "").trim()).filter(Boolean).join(" ")
  };
}

/**
 * Full AI Directorial Compilation via Gemini.
 * Formulates the cinematic vision, casts actors with biometric DNA, and stages shots using film grammar.
 */
export async function compileOmniDirectorialPass(
  input: OmniDirectorInput
): Promise<OmniDirectorialCompilation> {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) {
    throw new Error(
      "NARRATION_PRECONDITION_FAILED: Missing GEMINI_API_KEY or GOOGLE_API_KEY for Omni Directorial compilation. Silent fallback is forbidden."
    );
  }

  const requestedDurationSec = input.requestedDurationSec || 30;
  const targetShots = Math.max(2, Math.min(30, Math.round(requestedDurationSec / TARGET_SHOT_DURATION_SEC)));
  const topic = input.topic.trim();
  const tone = input.tone || "Cinematic & immersive";

  const systemPrompt = `You are Google Omni, the sole executive director, master screenwriter, and cinematographer for Zyvoriq Studios.
Compile a complete theatrical directorial blueprint for this production:
Topic: "${topic}"
Tone: "${tone}"
Target Duration: ${requestedDurationSec} seconds across exactly ${targetShots} visual shots.
${input.genre ? `MANDATORY GENRE OVERRIDE: The user has explicitly selected genre "${input.genre}". You MUST set "genre": "${input.genre}" and stage all visual action, cast, wardrobe and dialogue strictly to this genre.` : ""}

CRITICAL DIRECTORIAL REQUIREMENTS:
1. GENRE IDENTIFICATION:
   ${input.genre ? `Set genre to "${input.genre}".` : `Classify the genre into one of:`}
   - "HISTORICAL_BIOPIC" (e.g. Oppenheimer, Napoleon, historical figures/events)
   - "BOLLYWOOD_ACTION" (e.g. Dhurandhar, high-octane stunts, espionage, tactical combat)
   - "CINEMATIC_DRAMA" (intense character conflicts, dialogue, emotional stakes)
   - "SCI_FI_CYBERPUNK" (futuristic tech, neon noir, space, dystopian)
   - "NEO_NOIR_THRILLER" (detective, shadows, rain, betrayal)
   - "HIGH_FANTASY" (mythic realms, epic battles, magic)
   - "HORROR_MYSTERY" (suspense, dread, atmospheric)
   - "DOCUMENTARY_EXPLAINER" (educational, creator breakdown, tech demo)

2. CASTING & BIOMETRICS (1 to 3 characters):
   - For historical figures (e.g. Oppenheimer, Groves, Napoleon), extract authentic biographical appearance, era-accurate clothing (1940s suits, fedoras, military uniforms), and age.
   - For Bollywood action (e.g. Dhurandhar), cast rugged, charismatic leads with tactical gear, leather jackets, or sharp tailored suits.
   - For general drama/sci-fi, design distinctive, memorable characters with distinct facial features.
   - For documentary explainer ONLY, you may cast a single modern presenter.
   - Give each character a unique archetype ID (lowercase slug, e.g. "oppenheimer", "groves", "tactical_agent", "samurai_master", "operative_leader"). NEVER use celebrity actor names or real-world celebrity names (strictly forbidden: no Bollywood/Hollywood actor names).

3. FILM GRAMMAR, SCENE GROUPING & SHOT STAGING:
   - SCENE ARCHITECTURE: Group contiguous shots that occur in the same physical setting into cohesive scenes with "sceneId" (e.g., shots 1-4 in "scene_01", shots 5-8 in "scene_02").
   - VERBATIM ENVIRONMENT LOCK: All shots that share the same "sceneId" MUST have the EXACT SAME verbatim "sceneEnvironment" string describing the set, geometry, lighting, and materials. Do NOT rephrase or invent new locations within the same scene!
   - NEVER force one presenter to talk to the camera in every shot unless genre is DOCUMENTARY_EXPLAINER.
   - Use true film grammar:
     * Shot / Reverse-Shot for dialogue: Character A speaks (looking screen_right) -> Character B reacts (looking screen_left).
     * Over-the-shoulder (OTS) angles.
     * Pure action / stunt / landscape shots with NO character on camera ("onCameraCharacterId": null).
     * Eyelines: "screen_left", "screen_right", "horizon_reflective", "downward_intense". Use "camera" ONLY if breaking the fourth wall or documentary.
   - Note: Veo reference images condition ONE person per shot. Therefore, shots with characters should feature at most ONE hero character on camera ("onCameraCharacterId").

4. SCRIPT & DIALOGUE:
   - Output exactly ${targetShots} short lines, one per shot.
   - STRICT BUDGET: Each line MUST be between 5 and ${MAX_WORDS_PER_SHOT} words maximum. Never exceed ${MAX_WORDS_PER_SHOT} words per line.
   - Write authentic cinematic dialogue or dramatic narration worthy of a blockbuster film.
   - Forbid corporate filler, canned clichés, or generic platitudes (NEVER say "Here is what deserves a closer look", "The obvious reaction is only the surface", "Experience the true atmosphere", etc.).

Return a JSON object conforming strictly to this structure:
{
  "genre": "HISTORICAL_BIOPIC" | "BOLLYWOOD_ACTION" | "CINEMATIC_DRAMA" | "SCI_FI_CYBERPUNK" | "NEO_NOIR_THRILLER" | "HIGH_FANTASY" | "HORROR_MYSTERY" | "DOCUMENTARY_EXPLAINER",
  "visualStyle": {
    "optics": "string description of camera, lens, aspect ratio, motion",
    "lightingPalette": "string description of color, key light, practicals",
    "atmosphere": "string description of mood, weather, particle effects"
  },
  "cast": [
    {
      "id": "slug_id",
      "name": "Full Name",
      "role": "lead" | "antagonist" | "supporting" | "narrator",
      "biometricDNA": {
        "gender": "male" | "female" | "non-binary",
        "ageBand": "string",
        "facialFeatures": "specific descriptive facial bone structure, eyes, beard",
        "hair": "hair style, color, length",
        "distinguishingMarks": "optional marks or scars"
      },
      "wardrobe": {
        "costume": "specific period or genre wardrobe",
        "accessories": "hats, watches, weapons, glasses"
      },
      "voiceProfile": "vocal tone description"
    }
  ],
  "shots": [
    {
      "shotNumber": 1,
      "sceneId": "scene_01",
      "speaker": "CHARACTER_NAME" or null,
      "dialogue": "Spoken line (5 to ${MAX_WORDS_PER_SHOT} words)",
      "onCameraCharacterId": "slug_id" or null,
      "shotGrammar": "ESTABLISHING_WIDE" | "HERO_CLOSE_UP" | "MEDIUM_TWO_SHOT" | "OVER_THE_SHOULDER" | "REVERSE_ANGLE" | "KINETIC_TRACKING" | "DUTCH_ANGLE_LOW" | "PRESENTER_DIRECT",
      "eyeline": "screen_left" | "screen_right" | "horizon_reflective" | "downward_intense" | "camera",
      "cameraMotion": "description of camera move",
      "sceneEnvironment": "VERBATIM unvarying physical description for this entire sceneId",
      "visualAction": "description of what occurs visually in this 6-second shot"
    }
  ]
}`;

  const primaryModel = process.env.GEMINI_SCRIPT_MODEL || "gemini-3.7-flash";
  const candidateModels = primaryModel === "gemini-2.5-flash" ? ["gemini-2.5-flash"] : [primaryModel, "gemini-2.5-flash"];

  let lastError: Error | null = null;
  let rawText = "";

  for (const model of candidateModels) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
          }
        })
      });

      if (!res.ok) {
        const errorBody = await res.text().catch(() => "");
        console.warn(`[omni-director] Compilation with ${model} returned ${res.status}: ${errorBody.slice(0, 200)}`);
        lastError = new Error(`Gemini API compilation with ${model} failed with status ${res.status}`);
        continue;
      }

      const data = await res.json();
      rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (rawText) break;
    } catch (err: any) {
      console.warn(`[omni-director] Compilation with ${model} threw: ${err?.message || err}`);
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  if (!rawText) {
    throw new Error(
      `NARRATION_PRECONDITION_FAILED: Failed to compile Omni Directorial plan via Gemini (${lastError?.message || "empty response"}). Silent fallback is forbidden.`
    );
  }

  try {
    const parsed = JSON.parse(rawText) as OmniDirectorialCompilation;
    if (!parsed.genre || !Array.isArray(parsed.cast) || !Array.isArray(parsed.shots)) {
      throw new Error("Parsed Omni Directorial plan missing required keys (genre, cast, shots).");
    }

    if (input.genre) {
      parsed.genre = input.genre;
    }

    // Sanitize shot word counts against the strict 12-word ceiling
    for (const shot of parsed.shots) {
      const cleanWords = (shot.dialogue || "").replace(/^[A-Z0-9_\-\s]{2,25}:/i, "").trim().split(/\s+/).filter(Boolean);
      if (cleanWords.length > MAX_WORDS_PER_SHOT) {
        shot.dialogue = cleanWords.slice(0, MAX_WORDS_PER_SHOT).join(" ");
      }
    }

    parsed.masterScript = parsed.shots.map(s => s.dialogue.trim()).filter(Boolean).join(" ");
    return parsed;
  } catch (parseErr: any) {
    console.warn(`[omni-director] Failed to parse JSON plan, falling back to deterministic compiler: ${parseErr?.message}`);
    return compileDeterministicDirectorialPass(topic, rawText, requestedDurationSec, input.creationIntent, input.genre);
  }
}
