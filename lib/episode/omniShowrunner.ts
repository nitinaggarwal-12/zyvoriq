import crypto from "node:crypto";
import { characterLibrary, LibraryCharacter, WardrobeVariant } from "../library/characterLibrary";
import type { EpisodePlanInput, EpisodeBlueprint, EpisodeAct, EpisodeChapter, CharacterWardrobeSchedule } from "./types";

export function formatSecondsToDisplay(sec: number): string {
  const mins = Math.round(sec / 60);
  return `${mins} min`;
}

export function calculateEpisodeStructure(targetDurationSec: number): { totalActs: number; totalChapters: number } {
  if (targetDurationSec <= 700) {
    // ~10 mins
    return { totalActs: 2, totalChapters: 4 };
  } else if (targetDurationSec <= 1300) {
    // ~20 mins
    return { totalActs: 4, totalChapters: 7 };
  } else if (targetDurationSec <= 2100) {
    // ~30 mins Standard
    return { totalActs: 5, totalChapters: 10 };
  } else {
    // 45+ mins
    return { totalActs: 5, totalChapters: 15 };
  }
}

export async function planEpisodeWithOmni(input: EpisodePlanInput): Promise<EpisodeBlueprint> {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) {
    throw new Error(
      "NARRATION_PRECONDITION_FAILED: Missing GEMINI_API_KEY or GOOGLE_API_KEY for Omni Showrunner compilation. Silent fallback is forbidden."
    );
  }

  const durationSec = input.targetDurationSec || 1800; // default 30 min
  const { totalActs, totalChapters } = calculateEpisodeStructure(durationSec);
  const topic = input.topic.trim();
  const genre = input.genre || "NORDIC_NOIR";
  const tone = input.tone || "Cinematic, suspenseful, emotionally grounded, hyper-detailed";
  const language = input.language || "en";

  // Resolve lead cast from library
  const allCharacters = await characterLibrary.list();
  const selectedChars: LibraryCharacter[] = (input.leadCharacterIds && input.leadCharacterIds.length > 0)
    ? (input.leadCharacterIds.map((id: string) => allCharacters.find((c: LibraryCharacter) => c.id === id)).filter(Boolean) as LibraryCharacter[])
    : (allCharacters.filter((c: LibraryCharacter) => c.id === "freja_moller" || c.id === "mikkel_lind"));

  const castSummary = selectedChars.map((c: LibraryCharacter) => ({
    id: c.id,
    name: c.displayName,
    country: c.country,
    archetype: c.archetype,
    wardrobes: c.wardrobe.map((w: WardrobeVariant) => ({ label: w.label, sheetCount: w.sheetUris.length }))
  }));

  const systemPrompt = `You are Google Omni, the sole executive Showrunner, master screenwriter, and series director for Zyvoriq Studios.
Compile a complete theatrical, long-form EPISODE MASTER BLUEPRINT for this production:
Series/Topic: "${topic}"
Target Duration: ${durationSec} seconds (${formatSecondsToDisplay(durationSec)})
Genre: "${genre}"
Tone: "${tone}"
Language: "${language}"
Total Acts: ${totalActs} Classical Acts
Total Chapters: ${totalChapters} Chapters (each chapter is approx ${(durationSec / totalChapters).toFixed(0)}s / 3 min)

AVAILABLE CAST & WARDROBE MATRICES:
${JSON.stringify(castSummary, null, 2)}

${input.customCharacters && input.customCharacters.length > 0 ? `CUSTOM CHARACTERS:\n${JSON.stringify(input.customCharacters, null, 2)}` : ""}

CRITICAL DIRECTORIAL REQUIREMENTS:
1. LONG-FORM CONTINUITY (ZERO MARKOVIAN DRIFT):
   - You MUST plan the entire ${formatSecondsToDisplay(durationSec)} narrative arc with a structured, satisfying 5-Act or multi-act dramatic spine.
   - Act I: Inciting Incident & Exposition.
   - Act II: Progressive Complications & Conflict escalation.
   - Act III: Midpoint Reversal / Decisive Point of No Return.
   - Act IV: Dark Night of the Soul / Crisis.
   - Act V: Climax, Convergence & Lingering Cliffhanger.

2. CHARACTER WARDROBE SCHEDULE (ZERO WARDROBE AMNESIA):
   - Character attire MUST logically match the location context (e.g. Office -> professional suit; Pool -> swimwear; Gym -> activewear; Home -> lounge knitwear; Market -> casual streetwear).
   - If a character changes clothes between chapters, provide a brief physical justification (e.g. "Changed after office hours", "Post-workout shower").
   - Output an explicit "wardrobeSchedule" table mapping each character to their wardrobe in each Act & Chapter.

3. SCREENPLAY & DIALOGUE:
   - Provide punchy, authentic dialogue excerpts for each chapter in natural ${language}.
   - Every chapter must have a clear visual direction, camera vector, and dramatic beat.

4. ACOUSTIC LEITMOTIF:
   - Specify a unified musical key (e.g., "D minor"), tempo curve (BPM), instrument palette, and ambient sound design cues that carry across the entire episode.

OUTPUT JSON FORMAT (Must be strict, valid JSON):
{
  "seriesTitle": "string",
  "episodeTitle": "string",
  "seasonNumber": 1,
  "episodeNumber": 1,
  "logline": "string",
  "thematicLore": "string",
  "scoreLeitmotif": {
    "musicalKey": "D minor",
    "tempoBpm": 96,
    "instrumentPalette": ["Nordic cellos", "Analog synth sub-bass", "Granular glass textures", "Deep room foley"],
    "moodCurve": "Gradual tension escalation from contemplative melancholia to high-stakes thriller crescendo",
    "ambientSoundDesign": "Harbor winds, fluorescent ballast hum, rain on tempered glass, muted footsteps on wet slate"
  },
  "wardrobeSchedule": [
    {
      "characterId": "character_id",
      "characterName": "Full Name",
      "country": "Denmark",
      "archetype": "Lead",
      "wardrobes": [
        {
          "actNumber": 1,
          "chapterNumber": 1,
          "settingContext": "office",
          "wardrobeLabel": "Tailored Charcoal Blazer & Crisp Cotton Shirt",
          "visualDescription": "Sharp Scandinavian minimalism with matte silver cufflinks",
          "justification": "Opening morning at the Copenhagen architectural studio"
        }
      ]
    }
  ],
  "acts": [
    {
      "actNumber": 1,
      "actName": "Act I: The Inciting Disruption",
      "targetDurationSec": 360,
      "dramaticObjective": "Establish normal world and introduce the disruptive anomaly",
      "narrativeTensionLevel": 35,
      "chapters": [
        {
          "chapterNumber": 1,
          "actNumber": 1,
          "chapterTitle": "The Atrium Dossier",
          "durationSec": 180,
          "locationName": "Nordic Creative Office, Copenhagen",
          "settingContext": "office",
          "charactersOnScreen": [
            {
              "characterId": "freja_moller",
              "name": "Freja Møller",
              "wardrobeLabel": "Tailored Charcoal Blazer",
              "wardrobePill": "👔 Office",
              "emotionalState": "Focused, guarded, subtly uneasy"
            }
          ],
          "dramaticBeat": "Freja discovers unlogged architectural blueprints that do not match the city archives.",
          "visualDirection": "Cold Scandinavian morning light through glass facade, slow circular dolly push past concrete columns.",
          "cameraMovement": "Steadicam floating lateral tracking with Leica Summilux 35mm",
          "dialogueExcerpts": [
            {
              "speaker": "Freja",
              "text": "These coordinates aren't in the municipal registry. Someone built beneath the canal without approval."
            }
          ],
          "acousticMotif": {
            "theme": "Restrained Nordic string drone with low sub-bass pulse",
            "tempoBpm": 80,
            "dynamicLevel": "Pianissimo building to Mezzo-piano"
          }
        }
      ]
    }
  ]
}
`;

  const primaryModel = process.env.GEMINI_SCRIPT_MODEL || "gemini-2.5-flash";
  const candidateModels = [primaryModel, "gemini-2.5-flash", "gemini-1.5-pro"];

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
        const errText = await res.text().catch(() => "");
        console.warn(`[omni-showrunner] ${model} returned ${res.status}: ${errText.slice(0, 150)}`);
        lastError = new Error(`Gemini API failed with status ${res.status}`);
        continue;
      }

      const data = await res.json();
      rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (rawText) break;
    } catch (err: any) {
      console.warn(`[omni-showrunner] ${model} threw error:`, err?.message || err);
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  if (!rawText) {
    throw new Error(`OMNI_SHOWRUNNER_FAILED: Unable to compile long-form episode with Gemini. Last error: ${lastError?.message || "empty response"}`);
  }

  let parsed: any;
  try {
    parsed = JSON.parse(rawText);
  } catch (err) {
    console.error("[omni-showrunner] Failed to parse JSON output:", rawText.slice(0, 300));
    throw new Error("OMNI_SHOWRUNNER_SYNTAX_ERROR: Gemini output was not valid JSON");
  }

  const episodeId = `ep_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const formattedDuration = `${formatSecondsToDisplay(durationSec)} (${totalActs} Acts • ${totalChapters} Chapters)`;

  const blueprint: EpisodeBlueprint = {
    id: episodeId,
    seriesTitle: parsed.seriesTitle || topic || "Zyvoriq Original Series",
    episodeTitle: parsed.episodeTitle || "Episode 1: The First Resonance",
    seasonNumber: parsed.seasonNumber || 1,
    episodeNumber: parsed.episodeNumber || 1,
    topic,
    genre,
    tone,
    language,
    targetDurationSec: durationSec,
    formattedDuration,
    totalActs: parsed.acts?.length || totalActs,
    totalChapters: parsed.acts?.reduce((acc: number, act: any) => acc + (act.chapters?.length || 0), 0) || totalChapters,
    logline: parsed.logline || `A high-stakes 30-minute narrative journey exploring ${topic}.`,
    thematicLore: parsed.thematicLore || `Explores identity, atmospheric tension, and spatial continuity across five structured acts.`,
    scoreLeitmotif: parsed.scoreLeitmotif || {
      musicalKey: "D minor",
      tempoBpm: 92,
      instrumentPalette: ["Strings", "Analog sub-bass", "Spatial foley"],
      moodCurve: "Tension escalation",
      ambientSoundDesign: "Realistic environmental acoustics"
    },
    wardrobeSchedule: parsed.wardrobeSchedule || [],
    acts: parsed.acts || [],
    status: "PLANNED",
    createdAt: new Date().toISOString()
  };

  return blueprint;
}
