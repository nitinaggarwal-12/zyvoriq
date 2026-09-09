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
  facialExpression?: string;
  bodyLanguage?: string;
  choreography?: string;
  spatialBlocking?: {
    depthPlanes?: string;
    proximity?: string;
    contactPoints?: string;
  };
  coStarDescription?: string;
}

export type OmniGenre =
  | "HISTORICAL_BIOPIC"
  | "BOLLYWOOD_ACTION"
  | "BOLLYWOOD_ROMANCE"
  | "CINEMATIC_DRAMA"
  | "SCI_FI_CYBERPUNK"
  | "NEO_NOIR_THRILLER"
  | "HIGH_FANTASY"
  | "HORROR_MYSTERY"
  | "DOCUMENTARY_EXPLAINER"
  | "MUSIC_VIDEO";

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
  language?: string;
  continuationFrom?: {
    parentProductionId: string;
    parentTitle: string;
    cast?: OmniCastMember[];
    genre?: OmniGenre;
    aspectRatio?: "9:16" | "16:9" | "2.39:1";
    visualStyle?: {
      optics?: string;
      lightingPalette?: string;
      atmosphere?: string;
    };
  };
}

const TARGET_SHOT_DURATION_SEC = 6.0;
const MAX_WORDS_PER_SHOT = 15;

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 30) || "character";
}

const FEMALE_NAMES_REGEX = /\b(?:meera|priya|ananya|simran|aisha|kavya|pooja|rani|radha|sita|zara|nisha|riya|sneha|kriti|dia|diya|tara|maya|sonia|sunita|geeta|neeta|kiran|zoya|leila|fatima|maria|elena|chloe|sarah|emily|jessica|emma|sophia|olivia|isabella|mia|charlotte|amelia|harper|evelyn|abigail|elizabeth|mila|ella|avery|sofia|camila|aria|scarlett|victoria|madison|luna|grace|penelope|layla|riley|zoey|nora|lily|eleanor|hannah|lillian|addison|aubrey|ellie|stella|natalie|zoe|leah|hazel|violet|aurora|savannah|audrey|brooklyn|bella|claire|skylar)\b/i;

const MALE_NAMES_REGEX = /\b(?:arjun|rahul|kabir|aarav|rohan|dev|vikram|raj|prem|samar|ranveer|karan|aman|suraj|aditya|farooq|renjiro|kagehisa|marcus|david|john|james|alex|michael|robert|william|oppenheimer|groves|napoleon|churchill)\b/i;

function inferSpeakerGender(speakerName: string, promptText: string): "female" | "male" {
  if (FEMALE_NAMES_REGEX.test(speakerName)) return "female";
  if (MALE_NAMES_REGEX.test(speakerName)) return "male";

  const cleanSpeaker = speakerName.toLowerCase();
  const femaleKeywords = /\b(female|woman|girl|heroine|beauty|actress|she|her|queen|princess)\b/i;
  const maleKeywords = /\b(male|man|boy|hero|actor|he|him|king|prince)\b/i;

  const clauses = promptText.split(/[.,;\n]/);
  for (const clause of clauses) {
    if (clause.toLowerCase().includes(cleanSpeaker)) {
      if (femaleKeywords.test(clause)) return "female";
      if (maleKeywords.test(clause)) return "male";
    }
  }
  return "male";
}

function extractCharacterWardrobe(
  speakerName: string,
  isFemale: boolean,
  genre: OmniGenre,
  promptText: string
): { costume: string; accessories: string } {
  const cleanSpeaker = speakerName.toLowerCase();
  const clauses = promptText.split(/[.;\n]/);
  for (const clause of clauses) {
    if (clause.toLowerCase().includes(cleanSpeaker)) {
      const lehengaMatch = clause.match(/(?:in\s+a\s+|wearing\s+a\s+|dressed\s+in\s+)?([^,.]*?(?:lehenga|saree|chiffon|anarkali|ghagra|dupatta|dress|gown)[^,.]*)/i);
      if (lehengaMatch) {
        return {
          costume: lehengaMatch[1].trim(),
          accessories: isFemale ? "Traditional gold and silver jhumkas, crystal bangles, sheer dupatta" : "Traditional accessories"
        };
      }
      const angrakhaMatch = clause.match(/(?:in\s+a\s+|wearing\s+a\s+|dressed\s+in\s+)?([^,.]*?(?:angrakha|kurta|sherwani|bandhgala|jacket|suit|tuxedo|blazer|overcoat)[^,.]*)/i);
      if (angrakhaMatch) {
        return {
          costume: angrakhaMatch[1].trim(),
          accessories: !isFemale ? "Subtle gold wrist cuff, traditional mojris" : "Coordinated traditional accessories"
        };
      }
    }
  }

  if (genre === "BOLLYWOOD_ROMANCE") {
    if (isFemale) {
      return {
        costume: "Radiant fuchsia and crimson Banarasi silk lehenga with intricate gold zardozi embroidery and floating sheer dupatta",
        accessories: "Delicate traditional gold jhumkas, glass bangles, embroidered mojris"
      };
    }
    if (/swiss|alps|switzerland|snow|violin/i.test(promptText)) {
      return {
        costume: "Tailored charcoal wool overcoat over black turtleneck, holding classic wooden violin with bow",
        accessories: "Dark-rimmed wire spectacles, acoustic wooden violin, polished leather boots"
      };
    }
    return {
      costume: "Royal sapphire-blue silk angrakha with subtle gold zardozi embroidery over ivory churidar",
      accessories: "Subtle gold wrist cuff, traditional royal mojris"
    };
  }

  if (genre === "BOLLYWOOD_ACTION") {
    if (isFemale) {
      return {
        costume: "Sleek tactical fitted dark jacket over tactical henley and combat trousers",
        accessories: "Tactical timepiece, rugged utility belt, combat boots"
      };
    }
    return {
      costume: "Rugged tactical dark leather jacket over fitted dark henley shirt",
      accessories: "Tactical timepiece, rugged leather belt, combat boots"
    };
  }

  if (genre === "HISTORICAL_BIOPIC") {
    return {
      costume: isFemale ? "Period-accurate tailored 1940s vintage dress with elegant neckline" : "Bespoke 1940s charcoal wool suit with vest and tie",
      accessories: isFemale ? "Vintage pearl necklace, classic timepiece" : "Vintage felt fedora hat, pocket watch"
    };
  }

  if (genre === "MUSIC_VIDEO") {
    return {
      costume: isFemale
        ? "Chic high-fashion music video performance attire with iridescent cropped jacket, stylish fitted performance top, and sleek trousers"
        : "Fashion-forward music video wardrobe, tailored designer monochrome jacket, statement street-luxury styling",
      accessories: "In-ear stage performance monitors, stylish jewelry, completely visible unobstructed mouth and lips for singing lip synchronization"
    };
  }

  if (genre === "DOCUMENTARY_EXPLAINER") {
    return {
      costume: "Modern studio smart-casual blazer and top",
      accessories: "Minimal studio styling"
    };
  }

  return {
    costume: isFemale ? "Contemporary elegant styled attire matching scene tone" : "Tailored contemporary clothing matching scene era",
    accessories: "Tasteful contemporary styling"
  };
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
  aspectRatio: "9:16" | "16:9" | "2.39:1" = "9:16",
  language?: string,
  continuationFrom?: OmniDirectorInput["continuationFrom"]
): OmniDirectorialCompilation {
  const cleanTopic = topic.trim().toLowerCase();
  
  // 1. Detect Genre
  let genre: OmniGenre = continuationFrom?.genre || explicitGenre || "CINEMATIC_DRAMA";
  if (!explicitGenre && !continuationFrom?.genre) {
    if (cleanTopic.includes("dhurandhar") || cleanTopic.includes("action") || cleanTopic.includes("stunt") || cleanTopic.includes("chase") || cleanTopic.includes("fight")) {
      genre = "BOLLYWOOD_ACTION";
    } else if (
      cleanTopic.includes("bollywood") ||
      (cleanTopic.includes("romance") && (cleanTopic.includes("hindi") || cleanTopic.includes("chiffon") || cleanTopic.includes("saree") || cleanTopic.includes("mohabbatein") || cleanTopic.includes("ddlj") || cleanTopic.includes("yash chopra"))) ||
      (cleanTopic.includes("hindi") && (cleanTopic.includes("switzerland") || cleanTopic.includes("swiss") || cleanTopic.includes("heroine") || cleanTopic.includes("hero and heroine")))
    ) {
      genre = "BOLLYWOOD_ROMANCE";
    } else if (
      cleanTopic.includes("music video") ||
      cleanTopic.includes("song") ||
      cleanTopic.includes("sing") ||
      cleanTopic.includes("musical duet") ||
      cleanTopic.includes("pop idol") ||
      cleanTopic.includes("vocal") ||
      cleanTopic.includes("concert") ||
      cleanTopic.includes("music track") ||
      explicitGenre === "MUSIC_VIDEO"
    ) {
      genre = "MUSIC_VIDEO";
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
  if (continuationFrom?.cast && continuationFrom.cast.length > 0) {
    // Exact biometric DNA & wardrobe inheritance from Part 1
    cast.push(...continuationFrom.cast);
  } else if (detectedSpeakers.size > 0) {
    let idx = 0;
    for (const speaker of Array.from(detectedSpeakers)) {
      const id = slugify(speaker);
      const isLead = idx === 0;
      const gender = inferSpeakerGender(speaker, `${topic} ${scriptText}`);
      const isFemale = gender === "female";
      const wardrobe = extractCharacterWardrobe(speaker, isFemale, genre, `${topic} ${creationIntent?.visualStyleDescription || ""}`);

      cast.push({
        id,
        name: speaker,
        role: isLead ? "lead" : "supporting",
        biometricDNA: {
          gender,
          ageBand: isFemale ? (isLead ? "mid to late 20s" : "late 20s") : (isLead ? "late 20s to early 30s" : "mid 30s"),
          facialFeatures: isFemale
            ? "Luminous almond-shaped eyes, elegant classical bone structure, warm expressive radiant smile"
            : "Chiseled South Asian facial structure, intense warm expressive gaze, strong defined jawline",
          hair: isFemale
            ? "Long waist-length lustrous dark hair with soft flowing waves"
            : "Lush dark textured hair styled naturally"
        },
        wardrobe,
        voiceProfile: isFemale
          ? "Melodic, sweet expressive soprano with warm emotional nuance"
          : "Warm, resonant romantic tenor with soft emotional cadence"
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
  } else if (genre === "BOLLYWOOD_ROMANCE") {
    const isAlpine = /swiss|alps|switzerland|snow|violin/i.test(topic);
    cast.push(
      {
        id: "romantic_hero",
        name: "Romantic Hero",
        role: "lead",
        biometricDNA: {
          gender: "male",
          ageBand: "late 20s to early 30s",
          facialFeatures: isAlpine
            ? "Chiseled South Asian facial structure, warm expressive brown eyes, dark-rimmed wire spectacles, refined romantic gaze"
            : "Chiseled South Asian facial structure, warm intense expressive gaze, strong defined jawline",
          hair: "Lush dark layered hair with soft wind-swept bangs across forehead"
        },
        wardrobe: {
          costume: isAlpine
            ? "Tailored charcoal wool overcoat over black turtleneck, holding classic wooden violin with bow"
            : "Royal sapphire-blue silk angrakha with gold zardozi embroidery over ivory churidar",
          accessories: isAlpine
            ? "Dark-rimmed wire spectacles, acoustic wooden violin, polished leather boots"
            : "Subtle gold wrist cuff, traditional royal mojris"
        },
        voiceProfile: "Warm, resonant romantic tenor with soft emotional cadence"
      },
      {
        id: "romantic_heroine",
        name: "Romantic Heroine",
        role: "lead",
        biometricDNA: {
          gender: "female",
          ageBand: "mid to late 20s",
          facialFeatures: "Ethereal South Asian bone structure, luminous almond eyes, radiant smile",
          hair: "Long waist-length dark wavy hair, cascading and billowing in mountain breeze"
        },
        wardrobe: {
          costume: isAlpine
            ? "Translucent flowing chiffon saree in emerald green and pastel pink with delicate silver border, sleeveless blouse"
            : "Swirling fuchsia and rani-pink Banarasi lehenga adorned with glittering mirror-work and flowing sheer dupatta",
          accessories: "Silver and gold jhumkas, crystal bangles, floating sheer dupatta"
        },
        voiceProfile: "Melodic, sweet soprano with poetic emotional cadence"
      }
    );
  } else {
    // Single lead hero, musical artist, or cinematic protagonist
    const leadName = creationIntent?.characterName || (
      genre === "HISTORICAL_BIOPIC" ? "Historical Protagonist" :
      genre === "BOLLYWOOD_ACTION" ? "Action Hero" :
      genre === "MUSIC_VIDEO" ? "Lead Musical Artist" :
      "Protagonist"
    );
    const charId = slugify(leadName);
    cast.push({
      id: charId,
      name: leadName,
      role: "lead",
      biometricDNA: {
        gender: genre === "MUSIC_VIDEO" ? "female" : "male",
        ageBand: genre === "MUSIC_VIDEO" ? "mid 20s" : "late 30s",
        facialFeatures: genre === "MUSIC_VIDEO"
          ? "Radiant, expressive facial bone structure with captivating eyes and clearly visible lips for musical vocal delivery"
          : "Striking cinematic bone structure, intense gaze",
        hair: genre === "MUSIC_VIDEO" ? "Stylized modern music video hair styling" : "Dark styled hair"
      },
      wardrobe: {
        costume: genre === "MUSIC_VIDEO"
          ? "Chic high-fashion music video performance attire, iridescent jacket and fitted performance top"
          : genre === "HISTORICAL_BIOPIC"
          ? "Period-accurate 1940s tailored suit"
          : genre === "BOLLYWOOD_ACTION"
          ? "Rugged tactical leather jacket and dark shirt"
          : "Cinematic styling",
        accessories: genre === "MUSIC_VIDEO"
          ? "In-ear stage performance monitors, completely visible unobstructed mouth and lips for singing performance"
          : "Period-appropriate accessories"
      },
      voiceProfile: genre === "MUSIC_VIDEO" ? "Dynamic, expressive musical singing vocals with melodic cadence" : "Low, measured cinematic voice"
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
    } else if (genre === "MUSIC_VIDEO") {
      // Music video: Lead singer on camera singing with visible lip sync, alternating with dynamic b-roll
      const singer = cast[0];
      if (i === 0) {
        onCameraCharacterId = singer?.id || null;
        shotGrammar = "HERO_CLOSE_UP";
        eyeline = "camera"; // Direct singing lip-sync performance
      } else if (i % 3 === 1) {
        onCameraCharacterId = singer?.id || null;
        shotGrammar = "KINETIC_TRACKING";
        eyeline = "screen_right";
      } else if (i % 3 === 2) {
        onCameraCharacterId = singer?.id || null;
        shotGrammar = "HERO_CLOSE_UP";
        eyeline = "camera"; // Direct singing lip-sync performance
      } else {
        onCameraCharacterId = null; // High-energy conceptual b-roll / light sweeps
        shotGrammar = "ESTABLISHING_WIDE";
        eyeline = "horizon_reflective";
      }
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
    } else if (genre === "BOLLYWOOD_ROMANCE") {
      // Bollywood romance / musical: duets, two-shots, sweeping crane shots, dancing choreography
      const maleHero = cast.find(c => c.biometricDNA.gender === "male") || cast[0];
      const femaleHeroine = cast.find(c => c.biometricDNA.gender === "female") || cast[1] || cast[0];

      const cleanSpk = (speaker || "").toUpperCase();
      const isDuet = cleanSpk.includes("&") || cleanSpk.includes("AND") || cleanSpk.includes("BOTH");
      const matchedHeroine = femaleHeroine && cleanSpk.includes(femaleHeroine.name.toUpperCase());
      const matchedHero = maleHero && cleanSpk.includes(maleHero.name.toUpperCase());

      if (i === 0) {
        onCameraCharacterId = null; // Establishing grand wide of royal palace courtyard or architectural setting
        shotGrammar = "ESTABLISHING_WIDE";
        eyeline = "horizon_reflective";
      } else if (isDuet) {
        onCameraCharacterId = femaleHeroine?.id || maleHero?.id || null;
        shotGrammar = "MEDIUM_TWO_SHOT";
        eyeline = "screen_right";
      } else if (matchedHeroine) {
        onCameraCharacterId = femaleHeroine.id;
        shotGrammar = i % 2 === 0 ? "HERO_CLOSE_UP" : "OVER_THE_SHOULDER";
        eyeline = "screen_left";
      } else if (matchedHero) {
        onCameraCharacterId = maleHero.id;
        shotGrammar = i % 2 === 0 ? "HERO_CLOSE_UP" : "OVER_THE_SHOULDER";
        eyeline = "screen_right";
      } else if (i % 4 === 1) {
        onCameraCharacterId = maleHero?.id || null;
        shotGrammar = "HERO_CLOSE_UP";
        eyeline = "screen_right";
      } else if (i % 4 === 2) {
        onCameraCharacterId = femaleHeroine?.id || null;
        shotGrammar = "HERO_CLOSE_UP";
        eyeline = "screen_left";
      } else if (i % 4 === 3) {
        onCameraCharacterId = maleHero?.id || null;
        shotGrammar = "MEDIUM_TWO_SHOT";
        eyeline = "screen_right";
      } else {
        onCameraCharacterId = femaleHeroine?.id || null;
        shotGrammar = "OVER_THE_SHOULDER";
        eyeline = "screen_left";
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

    const cameraMotion = genre === "BOLLYWOOD_ROMANCE"
      ? (shotGrammar === "MEDIUM_TWO_SHOT"
          ? "Sweeping 360-degree orbital camera dolly around the dancing couple with 24fps slow-motion cadence"
          : shotGrammar === "ESTABLISHING_WIDE"
          ? (cleanTopic.includes("swiss") || cleanTopic.includes("alps")
              ? "Grand panoramic high-altitude drone tracking across snow-capped alpine summits and green valleys"
              : "Grand panoramic high-altitude camera tracking across the architectural expanse with festive atmospheric depth")
          : "Slow graceful push-in on 85mm prime with golden hour lens flares and wind-blown fabric")
      : genre === "MUSIC_VIDEO"
      ? (shotGrammar === "HERO_CLOSE_UP"
          ? "Rhythmic rotational push-in directly toward lead artist with energetic lens flares and singing lip articulation"
          : shotGrammar === "KINETIC_TRACKING"
          ? "Dynamic rotational 360-degree tracking dolly around the performing artist with kinetic stage lighting sweeps"
          : "Sweeping high-angle crane glide drifting into the vibrant music video stage set with atmospheric haze")
      : (shotGrammar === "KINETIC_TRACKING"
          ? "Dynamic high-speed camera tracking with kinetic whip pans"
          : "Slow deliberate push-in on 85mm anamorphic prime");

    shots.push({
      shotNumber: i + 1,
      sceneId,
      speaker,
      dialogue,
      onCameraCharacterId,
      shotGrammar,
      eyeline,
      cameraMotion,
      sceneEnvironment: topic,
      visualAction: genre === "MUSIC_VIDEO"
        ? `Lead artist singing and articulating lyrics on camera: ${dialogue || topic}`
        : `Visual beat for ${dialogue || topic}`
    });
  });

  return {
    genre,
    visualStyle: {
      optics: genre === "BOLLYWOOD_ROMANCE"
        ? (aspectRatio === "16:9"
            ? "Arri Alexa Mini LF, 35mm & 50mm spherical primes, 16:9 widescreen framing, golden-hour lens roll-off, 24fps slow-motion cadence"
            : "Cooke Anamorphic 2.39:1 lenses, warm horizontal amber flares, 24fps slow-motion cadence, dreamy optical roll-off")
        : genre === "MUSIC_VIDEO"
        ? (aspectRatio === "9:16"
            ? "Arri Alexa Mini LF, high-speed anamorphic primes, 9:16 vertical framing, dynamic chromatic lens flares, rhythmic motion cadence"
            : "Arri Alexa Mini LF, high-speed anamorphic primes, widescreen framing, dynamic chromatic lens flares, rhythmic motion cadence")
        : (aspectRatio === "9:16"
            ? "Arri Alexa Mini LF, 35mm & 50mm spherical primes, 9:16 vertical framing, natural optical falloff"
            : aspectRatio === "16:9"
            ? "Arri Alexa Mini LF, 35mm & 50mm spherical primes, 16:9 widescreen framing, natural optical falloff"
            : "Cooke Anamorphic 2.39:1 framing, 24fps motion cadence, natural optical falloff"),
      lightingPalette: genre === "BOLLYWOOD_ROMANCE"
        ? (cleanTopic.includes("palace") || cleanTopic.includes("rajasthan") || cleanTopic.includes("temple") || cleanTopic.includes("courtyard")
            ? "Warm golden-hour alpenglow (3400K) reflecting off polished marble floors, water droplet prismatic flares, soft flattering key light"
            : cleanTopic.includes("swiss") || cleanTopic.includes("switzerland") || cleanTopic.includes("snow") || cleanTopic.includes("alps")
            ? "Golden-hour alpine rim lighting, warm sunlight filtering through mist and snow crystals, soft high-key romantic fill"
            : "Warm golden-hour rim lighting, rich cinematic contrast, soft flattering high-key romantic fill")
        : genre === "MUSIC_VIDEO"
        ? "Vibrant concert and stage lighting, saturated magenta and cyan volumetric rim lights, pulsating strobe accents, high-contrast dynamic fill"
        : "High-contrast cinematic key lighting, rich shadows, warm practicals",
      atmosphere: genre === "BOLLYWOOD_ROMANCE"
        ? (cleanTopic.includes("palace") || cleanTopic.includes("courtyard") || cleanTopic.includes("rajasthan")
            ? "Cascades of fresh crimson rose and marigold petals floating on water, festive gold dust, romantic alpenglow"
            : cleanTopic.includes("swiss") || cleanTopic.includes("switzerland") || cleanTopic.includes("snow") || cleanTopic.includes("chiffon") || cleanTopic.includes("alps")
            ? "Swirling autumn leaves, fluttering translucent chiffon fabric in alpine wind, ethereal mountain mist, floating snow flurries"
            : `Cascades of translucent chiffon fabric, ethereal romantic haze, floating flower petals, warm alpenglow for ${topic}`)
        : genre === "MUSIC_VIDEO"
        ? "Atmospheric stage haze, floating luminous light motes, dynamic laser sweeps, high-energy music video particle dispersion"
        : `Atmospheric cinematic tone for ${topic}`
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

  const resolvedLang = (input.language || "").trim().toLowerCase() ||
    (input.creationIntent?.narrationLanguage || "").trim().toLowerCase() ||
    (/\b(?:hindi|hinglish|desi|bollywood|in hindi|in hinglish)\b/i.test(topic) ? "hinglish-roman" :
     /\b(?:spanish|español|en español)\b/i.test(topic) ? "es" :
     /\b(?:japanese|nihongo|in japanese)\b/i.test(topic) ? "ja" : "en");

  let languageDirective = "";
  if (resolvedLang === "hinglish-roman" || resolvedLang === "hinglish") {
    languageDirective = `
   - MANDATORY SCRIPT LANGUAGE: Authentic conversational HINGLISH (natural modern Bollywood code-switching of Hindi and English).
   - MANDATORY SCRIPT FORMAT: Write 100% in LATIN / ROMAN SCRIPT (e.g. "Arjun ne jaise hi accelerate kiya, crowd pagal ho gaya!").
   - NEVER output in Devanagari script. All Hindi words must be in Roman transliteration.
   - Dialogue must sound like modern Bollywood cinema: high impact, punchy, authentic Indian colloquial cadence ("yaar", "chalo", "bhai", "kamaal", "dhamaal").`;
  } else if (resolvedLang === "hi-devanagari" || resolvedLang === "hindi") {
    languageDirective = `
   - MANDATORY SCRIPT LANGUAGE: Standard HINDI written in authentic DEVANAGARI script (e.g. "अर्जुन ने जैसे ही गति बढ़ाई, भीड़ झूम उठी!").`;
  } else if (resolvedLang && resolvedLang !== "en") {
    languageDirective = `
   - MANDATORY SCRIPT LANGUAGE: Write all dialogue and narration in authentic natural ${resolvedLang}.`;
  }

  const systemPrompt = `You are Google Omni, the sole executive director, master screenwriter, and cinematographer for Zyvoriq Studios.
Compile a complete theatrical directorial blueprint for this production:
Topic: "${topic}"
Tone: "${tone}"
Target Duration: ${requestedDurationSec} seconds across exactly ${targetShots} visual shots.
${input.genre ? `MANDATORY GENRE OVERRIDE: The user has explicitly selected genre "${input.genre}". You MUST set "genre": "${input.genre}" and stage all visual action, cast, wardrobe and dialogue strictly to this genre.` : ""}
${input.continuationFrom ? `
MANDATORY DIRECTORIAL CONTINUITY LOCK (PART 2 SEQUEL):
- This production is Part 2 (Direct Continuation / Sequel) of "${input.continuationFrom.parentTitle}".
- You MUST preserve the exact same character identity, names, biometric facial features, and wardrobe from Part 1.
${input.continuationFrom.cast && input.continuationFrom.cast.length > 0 ? `- Locked Cast from Part 1: ${JSON.stringify(input.continuationFrom.cast)}` : ""}
${input.continuationFrom.genre ? `- Locked Genre: "${input.continuationFrom.genre}"` : ""}
- Maintain continuous visual aesthetic, lighting palette, and optics.
- The storyline, dialogue, and choreography/action must seamlessly continue where Part 1 left off.
` : ""}

CRITICAL DIRECTORIAL REQUIREMENTS:
1. GENRE IDENTIFICATION:
   ${input.genre ? `Set genre to "${input.genre}".` : `Classify the genre into one of:`}
   - "MUSIC_VIDEO" (Cinematic music video, pop/indie/rock/rap vocal performance, poetic rhyming song lyrics, visible singing lip synchronization, dynamic rhythmic editing, choreography)
   - "HISTORICAL_BIOPIC" (e.g. Oppenheimer, Napoleon, historical figures/events)
   - "BOLLYWOOD_ROMANCE" (e.g. Yash Chopra Swiss musicals, Mohabbatein, DDLJ, dramatic duets, flowing chiffon sarees, violin solos, snow peaks, lush alpine meadows)
   - "BOLLYWOOD_ACTION" (e.g. Dhurandhar, high-octane stunts, espionage, tactical combat)
   - "CINEMATIC_DRAMA" (intense character conflicts, dialogue, emotional stakes)
   - "SCI_FI_CYBERPUNK" (futuristic tech, neon noir, space, dystopian)
   - "NEO_NOIR_THRILLER" (detective, shadows, rain, betrayal)
   - "HIGH_FANTASY" (mythic realms, epic battles, magic)
   - "HORROR_MYSTERY" (suspense, dread, atmospheric)
   - "DOCUMENTARY_EXPLAINER" (educational, creator breakdown, tech demo)

2. CASTING & BIOMETRICS (1 to 3 characters):
   - Setting-Specific Wardrobe & Environment Alignment: If the prompt specifies a setting (e.g. beach, ocean, pool, gym, office, street, home, party, hotel), you MUST cast performers whose wardrobe and appearance authentically match that location (e.g., for beach/ocean: barefoot dancers, stylish coastal resortwear, breezy linen shirts, or beach dance attire; for gym: athletic activewear; for pool: swimwear; for office: professional business attire). NEVER substitute unrelated sci-fi, cyberpunk, or royal palace tropes when the user requested a beach, dance, gym, or everyday real-world setting!
   - For MUSIC_VIDEO, cast a charismatic lead musical artist/singer with high-fashion stage performance attire. The artist's mouth, lips, and jaw MUST be completely unobstructed and clearly illuminated (strictly NO full-face opaque masks, dark tinted visors, or face-concealing helmets) to allow natural singing phoneme/viseme articulation.
   - For historical figures (e.g. Oppenheimer, Groves, Napoleon), extract authentic biographical appearance, era-accurate clothing (1940s suits, fedoras, military uniforms), and age.
   - For Bollywood romance, cast an intense, charismatic romantic hero (e.g. in royal embroidered angrakha/sherwani or tailored classic wardrobe) and an ethereal heroine (e.g. in swirling Banarasi lehenga or translucent chiffon saree with ornate jewelry). Only include winter overcoats or violins if explicitly requested in the topic.
   - For Bollywood action (e.g. Dhurandhar), cast rugged, charismatic leads with tactical gear, leather jackets, or sharp tailored suits.
   - For general drama/sci-fi/action/dance, design distinctive, memorable characters with distinct facial features and location-appropriate attire.
   - For documentary explainer ONLY, you may cast a single modern presenter.
   - Give each character a unique archetype ID (lowercase slug, e.g. "romantic_hero", "romantic_heroine", "lead_singer", "oppenheimer", "groves", "tactical_agent", "samurai_master", "operative_leader"). NEVER use celebrity actor names or real-world celebrity names (strictly forbidden: no Bollywood/Hollywood actor names).

3. FILM GRAMMAR, SCENE GROUPING & SHOT STAGING:
   - SCENE ARCHITECTURE: Group contiguous shots that occur in the same physical setting into cohesive scenes with "sceneId" (e.g., shots 1-4 in "scene_01", shots 5-8 in "scene_02").
   - VERBATIM ENVIRONMENT LOCK: All shots that share the same "sceneId" MUST have the EXACT SAME verbatim "sceneEnvironment" string describing the set, geometry, lighting, and materials. Do NOT rephrase or invent new locations within the same scene!
   - NEVER force one presenter to talk to the camera in every shot unless genre is DOCUMENTARY_EXPLAINER.
   - For MUSIC_VIDEO, alternate between intense hero close-ups with the artist singing directly to camera (eyeline: "camera") with visible lip articulation, and kinetic tracking/dance/concept choreography shots.
   - Use true film grammar:
     * Shot / Reverse-Shot for dialogue: Character A speaks (looking screen_right) -> Character B reacts (looking screen_left).
     * Over-the-shoulder (OTS) angles.
     * Pure action / stunt / landscape shots with NO character on camera ("onCameraCharacterId": null).
     * Eyelines: "screen_left", "screen_right", "horizon_reflective", "downward_intense". Use "camera" ONLY if breaking the fourth wall, music video singing, or documentary.
   - Note: Veo reference images condition ONE person per shot. Therefore, shots with characters should feature at most ONE hero character on camera ("onCameraCharacterId").

4. SCRIPT & DIALOGUE:
   - Output exactly ${targetShots} short lines, one per shot.
   - STRICT BUDGET: Each line MUST be between 5 and ${MAX_WORDS_PER_SHOT} words maximum. Never exceed ${MAX_WORDS_PER_SHOT} words per line.
   - Write authentic cinematic dialogue, dramatic narration, or poetic song lyrics worthy of a blockbuster film.
   - For MUSIC_VIDEO: NEVER write educational explanations, technical telemetry reports, or documentary voiceover. Write authentic, poetic, rhythmic song lyrics or rhyming vocal lines (verse, chorus, hook, drop) with natural musical cadence and emotional resonance. Each line must read like lyrics to a hit song.
   - For Bollywood romance, write poetic rhyming Hindi/Hinglish song lyrics (mukhda and antara) with deep romantic feeling, musical rhythm, and evocative imagery (ishq, fiza, dil, jahaan, dhadkan, nazaare, khwaab). NEVER use cheap corporate filler or unromantic slang ("yaar", "bhai", "tips", "tricks").
   - Forbid corporate filler, canned clichés, or generic platitudes (NEVER say "Here is what deserves a closer look", "The obvious reaction is only the surface", "Experience the true atmosphere", etc.).${languageDirective}

Return a JSON object conforming strictly to this structure:
{
  "genre": "HISTORICAL_BIOPIC" | "BOLLYWOOD_ROMANCE" | "BOLLYWOOD_ACTION" | "CINEMATIC_DRAMA" | "SCI_FI_CYBERPUNK" | "NEO_NOIR_THRILLER" | "HIGH_FANTASY" | "HORROR_MYSTERY" | "DOCUMENTARY_EXPLAINER" | "MUSIC_VIDEO",
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

    if (input.continuationFrom?.cast && input.continuationFrom.cast.length > 0) {
      // 100% Biometric identity and wardrobe preservation across continuation reels
      parsed.cast = input.continuationFrom.cast;
    }
    if (input.continuationFrom?.genre) {
      parsed.genre = input.continuationFrom.genre;
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
    return compileDeterministicDirectorialPass(topic, rawText, requestedDurationSec, input.creationIntent, input.genre, input.aspectRatio, resolvedLang, input.continuationFrom);
  }
}
