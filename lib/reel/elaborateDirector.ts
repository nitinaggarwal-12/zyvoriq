import { MAX_WORDS_PER_SHOT } from "./planner.ts";
import type { OmniGenre } from "./omniDirector.ts";

export interface ElaborateDirectorInput {
  prompt?: string;
  referenceUrl?: string;
  genre?: string;
  requestedDurationSec?: number;
  aspectRatio?: "9:16" | "16:9" | "2.39:1";
  language?: string;
  tweakInstructions?: string;
  previousTreatment?: OmniDirectorialTreatment;
}

export interface CharacterPerformanceCue {
  shotNumber: number;
  characterDensity: "zero" | "solo" | "duet" | "ensemble";
  onCameraCharacters: string[];
  speaker: string | null;
  dialogueOrLyric: string;
  facialExpression: string;
  bodyLanguage: string;
  choreography: string;
  spatialBlocking: {
    depthPlanes: string;
    proximity: string;
    contactPoints: string;
  };
  cameraAndOptics: {
    framing: string;
    lens: string;
    cameraMotion: string;
  };
  sceneEnvironment: string;
}

export interface OmniDirectorialTreatment {
  title: string;
  genre: OmniGenre;
  logline: string;
  targetDurationSec: number;
  aspectRatio: "9:16" | "16:9" | "2.39:1";
  language: string;
  referenceAnalyzed?: {
    url: string;
    detectedTitle?: string;
    detectedAesthetic: string;
  };
  colorScript: {
    act1_2: string;
    act3_4: string;
    act5: string;
  };
  musicScore: {
    genre: string;
    bpm: number;
    key: string;
    meter: string;
    instruments: string[];
    vocalProfile: string;
    lufsTarget: string;
  };
  cast: {
    id: string;
    name: string;
    role: "lead" | "antagonist" | "supporting" | "chorus";
    archetypeSafeDescription: string;
    biometricDNA: {
      gender: string;
      ageBand: string;
      facialFeatures: string;
      hair: string;
    };
    wardrobeProgression: {
      act1_2: { costume: string; accessories: string };
      act3_4: { costume: string; accessories: string };
      act5: { costume: string; accessories: string };
    };
  }[];
  shots: CharacterPerformanceCue[];
  masterScript: string;
  refinedPrompt: string;
}

/**
 * Extracts public YouTube metadata if a URL is provided.
 */
export async function extractReferenceMetadata(url: string): Promise<{ title?: string; author?: string; thumbnail?: string } | null> {
  const clean = url.trim();
  const ytMatch = clean.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (!ytMatch) return null;

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(clean)}&format=json`;
    const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      return {
        title: data.title,
        author: data.author_name,
        thumbnail: data.thumbnail_url
      };
    }
  } catch (err) {
    console.warn(`[elaborate-director] YouTube oEmbed fetch failed for ${clean}:`, err);
  }
  return null;
}

/**
 * Compiles a comprehensive 9-layer directorial treatment from a prompt or reference URL.
 */
export async function deconstructAndElaborateDirector(
  input: ElaborateDirectorInput
): Promise<OmniDirectorialTreatment> {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) {
    throw new Error(
      "NARRATION_PRECONDITION_FAILED: Missing GEMINI_API_KEY or GOOGLE_API_KEY for Directorial Elaboration."
    );
  }

  const requestedDurationSec = input.requestedDurationSec || 30;
  const targetShots = Math.max(2, Math.min(30, Math.round(requestedDurationSec / 6.0)));
  const aspectRatio = input.aspectRatio || "16:9";
  const userPrompt = (input.prompt || "").trim();
  const refUrl = (input.referenceUrl || "").trim();

  let refMeta: { title?: string; author?: string; thumbnail?: string } | null = null;
  if (refUrl) {
    refMeta = await extractReferenceMetadata(refUrl);
  }

  const resolvedLang = (input.language || "").trim().toLowerCase() ||
    (/\b(?:hindi|hinglish|desi|bollywood|in hindi|in hinglish)\b/i.test(userPrompt + " " + (refMeta?.title || "")) || input.genre === "BOLLYWOOD_ROMANCE" || input.genre === "BOLLYWOOD_ACTION"
      ? "hinglish-roman"
      : "en");

  const systemPrompt = `You are Google Omni, the master film director, visual choreographer, and screenwriter for Zyvoriq Studios.
Your mission is to perform a forensic DIRECTORIAL DECONSTRUCTION & PROMPT ELABORATION.

INPUTS:
- User Prompt / Idea: "${userPrompt || (refMeta ? refMeta.title : 'Cinematic visual story')}"
- Public Reference URL: "${refUrl || 'None'}"
${refMeta?.title ? `- Reference Video Title: "${refMeta.title}" by ${refMeta.author || 'Creator'}` : ''}
- Selected Genre: "${input.genre || 'Auto-Detect'}"
- Target Duration: ${requestedDurationSec} seconds (exactly ${targetShots} cinematic shots)
- Target Aspect Ratio: "${aspectRatio}"
- Spoken / Song Language: "${resolvedLang}"
${input.tweakInstructions ? `- User Tweak Request: "${input.tweakInstructions}" (Modify the previous treatment accordingly)` : ''}

CRITICAL DIRECTORIAL REQUIREMENTS:

1. CELEBRITY-TO-ARCHETYPE SAFE-HARBOR TRANSPILER:
   - If the reference video or prompt implies real celebrities (e.g. Shah Rukh Khan, Aishwarya Rai, Hrithik Roshan, Tom Cruise):
   - You MUST transpile them into original, richly detailed fictional ARCHETYPES.
   - NEVER output real actor/celebrity names in the cast, prompt, or character IDs.
   - Describe their facial structure, eye shape, smile, hair, age band, and physical magnetism with extreme precision.

2. NINE-LAYER DIRECTORIAL BREAKDOWN:
   - DECONSTRUCT every dimension needed to recreate the exact filmmaking quality:
     a) Cast & Biometrics (Hair, eyes, age, costume per act)
     b) Dialogues & Song Lyrics (Short, poetic, memorable; between 5 and ${MAX_WORDS_PER_SHOT} words per shot)
     c) Facial Micro-Expressions (Eyelines, gaze angles, subtle smiles, vulnerability, intensity 0.0-1.0)
     d) Body Language & Physical Stance (Hand positioning, violin playing, head tilts, posture)
     e) Choreography & Ensemble Blocking (Z-depth planes, proximity in feet, contact points, pirouettes)
     f) Character Density per Shot (Zero, Solo, Duet, Ensemble)
     g) Environment & Architecture (Verbatim physical sets, alpine summits, stone archways, autumn leaves)
     h) Optics, Lighting & Color Script (Camera lenses, rim light, golden-hour 3200K, anamorphic flares)
     i) Acoustic Score & Audio Bed (BPM, musical key, instruments like solo acoustic violin, flute, tabla, -24.0 LUFS)

3. SCRIPT LANGUAGE:
   - If language is "hinglish-roman": Write authentic conversational Hinglish / Bollywood romantic lyrics in LATIN / ROMAN script. Never Devanagari.
   - If language is "en": Write cinematic English dialogue/lyrics.

Return a JSON object conforming strictly to this structure:
{
  "title": "Couture Title for this Production",
  "genre": "BOLLYWOOD_ROMANCE" | "BOLLYWOOD_ACTION" | "HISTORICAL_BIOPIC" | "CINEMATIC_DRAMA" | "SCI_FI_CYBERPUNK" | "NEO_NOIR_THRILLER" | "HIGH_FANTASY" | "DOCUMENTARY_EXPLAINER" | "MUSIC_VIDEO",
  "logline": "One-sentence cinematic logline summarizing the emotional stakes and setting",
  "targetDurationSec": ${requestedDurationSec},
  "aspectRatio": "${aspectRatio}",
  "language": "${resolvedLang}",
  "referenceAnalyzed": {
    "url": "${refUrl}",
    "detectedTitle": "${refMeta?.title || ''}",
    "detectedAesthetic": "Detailed summary of the reference aesthetic and cinematography"
  },
  "colorScript": {
    "act1_2": "Cool dawn mist (6000K), soft desaturated slate shadows, subtle amber practicals",
    "act3_4": "High-altitude alpine sunlight, intense crisp contrast, vibrant silk colors against snow",
    "act5": "Golden hour alpenglow (3200K), warm rim lighting, rich sunset violet hues"
  },
  "musicScore": {
    "genre": "Grand Bollywood 5-Act Symphonic Romance",
    "bpm": 76,
    "key": "D-Major",
    "meter": "4/4",
    "instruments": ["Solo acoustic wooden violin", "Bansuri bamboo flute", "Soaring symphonic string section", "Acoustic sitar", "Subtle tabla and dholak groove"],
    "vocalProfile": "Lyrical romantic duet with sweet melodious soprano and warm resonant tenor",
    "lufsTarget": "-24.0 LUFS EBU R128"
  },
  "cast": [
    {
      "id": "romantic_hero",
      "name": "Romantic Hero",
      "role": "lead",
      "archetypeSafeDescription": "Charismatic South Asian academic lead in late 20s with warm expressive eyes, subtle dimple, wire-rimmed spectacles, dark wool trenchcoat",
      "biometricDNA": {
        "gender": "male",
        "ageBand": "late 20s to early 30s",
        "facialFeatures": "Chiseled jawline, warm brown expressive eyes, dark wire spectacles",
        "hair": "Dark textured hair with natural wind-swept volume"
      },
      "wardrobeProgression": {
        "act1_2": { "costume": "Tailored charcoal wool overcoat over black turtleneck", "accessories": "Acoustic wooden violin with bow, wire spectacles" },
        "act3_4": { "costume": "Fitted cream cable-knit sweater, dark wool trousers", "accessories": "Leather gloves, acoustic violin" },
        "act5": { "costume": "Midnight-blue tailored blazer, open-collar silk shirt", "accessories": "Classic timepiece" }
      }
    },
    {
      "id": "romantic_heroine",
      "name": "Romantic Heroine",
      "role": "lead",
      "archetypeSafeDescription": "Ethereal South Asian leading lady in mid-20s with luminous almond hazel eyes, radiant natural smile, waist-length wavy dark hair, flowing chiffon saree",
      "biometricDNA": {
        "gender": "female",
        "ageBand": "mid to late 20s",
        "facialFeatures": "Luminous almond eyes, high cheekbones, radiant natural smile",
        "hair": "Waist-length dark wavy hair cascading in mountain breeze"
      },
      "wardrobeProgression": {
        "act1_2": { "costume": "Translucent flowing chiffon saree in emerald green with silver border", "accessories": "Silver jhumkas, crystal bangles, floating sheer dupatta" },
        "act3_4": { "costume": "Pastel-pink and pearl-white translucent chiffon saree floating against snow", "accessories": "Delicate silver drop earrings" },
        "act5": { "costume": "Sunshine-yellow flowing chiffon saree, golden embroidery border", "accessories": "Gold filigree bangles" }
      }
    }
  ],
  "shots": [
    {
      "shotNumber": 1,
      "characterDensity": "zero",
      "onCameraCharacters": [],
      "speaker": null,
      "dialogueOrLyric": "Yeh wadiyan, yeh barf ka aalam, sadiyon se kisi aashiq ka intezar kar rahi hain.",
      "facialExpression": "None (pure landscape shot)",
      "bodyLanguage": "None",
      "choreography": "High-altitude alpine drone crane tracking smoothly across snow-capped Jungfrau summits toward historic stone monastery terrace",
      "spatialBlocking": {
        "depthPlanes": "Foreground: Ancient stone balustrade with frost crystals. Deep background: Snow-capped peaks",
        "proximity": "Landscape master",
        "contactPoints": "None"
      },
      "cameraAndOptics": {
        "framing": "ESTABLISHING_WIDE",
        "lens": "35mm Cooke Anamorphic 2.39:1",
        "cameraMotion": "Grand panoramic high-altitude crane down-tilt with 24fps motion cadence"
      },
      "sceneEnvironment": "Swiss alpine stone terrace overlooking snow-capped peaks and mist-filled green valleys, framed by historic arches and swirling autumn leaves"
    }
  ],
  "masterScript": "Full line-by-line script formatted with speaker tags for planning",
  "refinedPrompt": "A rich 2-3 paragraph directorial summary ready to be placed in the main creator prompt box"
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
        console.warn(`[elaborate-director] Model ${model} returned ${res.status}: ${errorBody.slice(0, 200)}`);
        lastError = new Error(`Gemini elaboration with ${model} failed with HTTP ${res.status}`);
        continue;
      }

      const data = await res.json();
      rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (rawText) break;
    } catch (err: any) {
      console.warn(`[elaborate-director] Model ${model} threw: ${err?.message || err}`);
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  if (!rawText) {
    throw lastError || new Error("Failed to receive structured directorial elaboration from Gemini.");
  }

  try {
    const parsed = JSON.parse(rawText) as OmniDirectorialTreatment;
    // Format master script if not fully provided
    if (!parsed.masterScript && parsed.shots) {
      parsed.masterScript = parsed.shots
        .map(s => (s.speaker ? `${s.speaker.toUpperCase()}: ${s.dialogueOrLyric}` : s.dialogueOrLyric))
        .join("\n");
    }
    return parsed;
  } catch (err: any) {
    throw new Error(`Failed to parse Omni directorial JSON output: ${err.message}. Raw text: ${rawText.slice(0, 200)}`);
  }
}
