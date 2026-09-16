import { execFile } from "node:child_process";
import { promisify } from "node:util";
import * as fs from "node:fs";
import * as path from "node:path";

const execFileAsync = promisify(execFile);

export interface Omni12Performer {
  id: string;
  name: string;
  age: number;
  demography: string;
  heritage: string;
  vocalRegister: string;
  nativeLanguages: string[];
  defaultWardrobe: string;
  anchorImageUrl: string;
}

export interface Omni12VenuePreset {
  id: string;
  name: string;
  category: "SACRED_TEMPLE" | "AQUATIC_BEACH" | "URBAN_CYPHER" | "ROYAL_GALA";
  lightingPalette: string;
  mandatoryWardrobeRule: string;
  bannedWardrobeTokens: string[];
  defaultAttire: string;
  choreographyStyle: string;
}

export interface Omni12ShotDefinition {
  shotIndex: number;
  role: "A_ROLL" | "B_ROLL" | "C_ROLL";
  startBar: number;
  endBar: number;
  startTimeSec: number;
  endTimeSec: number;
  durationSeconds: number;
  nativeGenSeconds: 5 | 8;
  anchorMode: "DISCRETE_STILL" | "TAIL_CONTINUATION";
  anchorStillPath: string;
  kineticPrompt: string;
  eyelineVector: "LEFT" | "RIGHT" | "LENS";
  needsLipSync: boolean;
  rmsEnergy: "LOW" | "MID" | "PEAK";
  lyricLine: string;
}

export interface Omni12AcousticMap {
  bpm: number;
  barDurationSec: number;
  totalDurationSec: number;
  downbeats: number[];
  rmsTiers: ("LOW" | "MID" | "PEAK")[];
  lyricsByBar: string[];
  lyriaPrompt: string;
}

export interface Omni12SanctityAudit {
  venueCategory: string;
  originalWardrobe: string;
  sanitizedWardrobe: string;
  wasAutoHealed: boolean;
  sanctityVerdict: string;
  culturalVocalMatch: string;
}

export interface Omni12ProductionPlan {
  id: string;
  title: string;
  createdAt: string;
  performer: Omni12Performer;
  venue: Omni12VenuePreset;
  sanctityAudit: Omni12SanctityAudit;
  acousticMap: Omni12AcousticMap;
  shots: Omni12ShotDefinition[];
  cfrSpec: {
    targetFps: 30;
    videoTrackTimescale: 30000;
    audioSampleRateHz: 48000;
    ptsResetFilter: string;
    maxAllowedDriftMs: 50;
  };
}

export const OMNI12_PERFORMERS: Omni12Performer[] = [
  {
    id: "sofia_madrid_es",
    name: "Sofia Reyes",
    age: 23,
    demography: "Spanish / Iberian",
    heritage: "Madrid, Spain",
    vocalRegister: "Female Mezzo-Soprano (Warm Latin-Pop / Flamenco Inflection)",
    nativeLanguages: ["Spanish", "English"],
    defaultWardrobe: "Sleek crimson Iberian evening dress",
    anchorImageUrl: "/assets/characters/lucia_serrano_es.jpg"
  },
  {
    id: "meera_chennai_in",
    name: "Meera Sundaram",
    age: 24,
    demography: "South Indian / Tamil",
    heritage: "Chennai, Tamil Nadu",
    vocalRegister: "Female Carnatic Classical Soprano (Gamaka Ornamentation)",
    nativeLanguages: ["Tamil", "Sanskrit", "English"],
    defaultWardrobe: "Traditional Kanjeevaram gold-bordered silk saree",
    anchorImageUrl: "/assets/characters/meenakshi_iyer_tn.jpg"
  },
  {
    id: "aarav_chandigarh_in",
    name: "Aarav Gill",
    age: 26,
    demography: "North Indian / Punjabi",
    heritage: "Chandigarh, Punjab",
    vocalRegister: "Male Folk-Pop Tenor (High-Energy Bhangra / Urban Desi)",
    nativeLanguages: ["Punjabi", "Hindi", "English"],
    defaultWardrobe: "Embroidered velvet sherwani jacket with modern streetwear silhouette",
    anchorImageUrl: "/assets/characters/gurpreet_singh_pb.jpg"
  },
  {
    id: "daria_freja_cypher",
    name: "Daria & Freja (Duo)",
    age: 22,
    demography: "Nordic & Eastern European Street Dancers",
    heritage: "Copenhagen & Moscow",
    vocalRegister: "Rhythmic Electro-Hip-Hop Vocal Chops & Instrumental Cypher Beat",
    nativeLanguages: ["English"],
    defaultWardrobe: "High-contrast technical streetwear, oversized cargo pants & bomber jackets",
    anchorImageUrl: "/assets/characters/daria_morozova_ru.jpg"
  }
];

export const OMNI12_VENUES: Omni12VenuePreset[] = [
  {
    id: "sacred_temple_sanctum",
    name: "Ancient Chola Temple Sanctum & Mandapam",
    category: "SACRED_TEMPLE",
    lightingPalette: "Warm golden oil lamps (deepam), carved granite pillars, incense haze",
    mandatoryWardrobeRule: "Traditional modest ceremonial silk attire (Kanjeevaram saree / kurta-pajama / veshti)",
    bannedWardrobeTokens: ["swimsuit", "bikini", "monokini", "swimwear", "trunks", "clubwear", "crop top", "mini skirt", "shorts"],
    defaultAttire: "Authentic Kanjeevaram silk saree with temple jewelry & jasmine garland",
    choreographyStyle: "Reverent Anjali mudra (folded hands prayer), classical Bharatanatyam adavus & serene devotion"
  },
  {
    id: "ibiza_sunset_infinity_pool",
    name: "Ibiza Cliffside Sunset Infinity Pool",
    category: "AQUATIC_BEACH",
    lightingPalette: "Golden hour Mediterranean sun, turquoise water reflections, warm rim light",
    mandatoryWardrobeRule: "Authentic resort swimwear, silk sarong, or Mediterranean summer linen",
    bannedWardrobeTokens: ["heavy wool suit", "tuxedo", "winter coat", "heavy brocade sherwani"],
    defaultAttire: "Designer resort swimwear with flowing sheer silk sunset kaftan",
    choreographyStyle: "Fluid sunlit poolside movement, rhythmic water ripples, effortless summer groove"
  },
  {
    id: "neon_cyberpunk_warehouse",
    name: "Nocturne Cyberpunk Neon Cypher Warehouse",
    category: "URBAN_CYPHER",
    lightingPalette: "Anamorphic cyan & magenta neon tubes, wet asphalt reflections, volumetric fog",
    mandatoryWardrobeRule: "Urban technical streetwear, leather/bomber jackets, sneakers",
    bannedWardrobeTokens: ["temple ceremonial saree", "ballroom victorian gown"],
    defaultAttire: "Matte black technical streetwear, reflective cargo pants & high-top sneakers",
    choreographyStyle: "High-velocity breaking, popping, locking, top-rock footwork locked to drum transients"
  },
  {
    id: "royal_marble_palace_gala",
    name: "Grand Marble Palace Ballroom Gala",
    category: "ROYAL_GALA",
    lightingPalette: "Crystal chandeliers, warm tungsten highlights, polished Italian marble floors",
    mandatoryWardrobeRule: "Haute couture evening gown, tailored tuxedo, or royal sherwani",
    bannedWardrobeTokens: ["gym shorts", "swim trunks", "bikini", "distressed hoodie"],
    defaultAttire: "Emerald haute couture silk evening gown with diamond accents",
    choreographyStyle: "Graceful sweeping ballroom turns, poised cinematic walks, dramatic slow-motion flourishes"
  }
];

/**
 * Stage 1: Enforces Contextual Venue & Sacred Wardrobe Sanctity + Cultural Demography Alignment.
 */
export function evaluateSanctityAndWardrobe(
  performer: Omni12Performer,
  venue: Omni12VenuePreset,
  userRequestedWardrobe?: string
): Omni12SanctityAudit {
  const rawWardrobe = (userRequestedWardrobe || performer.defaultWardrobe).trim();
  const lowerWardrobe = rawWardrobe.toLowerCase();

  let wasAutoHealed = false;
  let sanitizedWardrobe = rawWardrobe;
  let sanctityVerdict = "PASS: Wardrobe & choreography match venue decorum.";

  // Check if user requested banned attire in a sacred venue (e.g. swimsuit in a temple)
  if (venue.category === "SACRED_TEMPLE") {
    const foundViolation = venue.bannedWardrobeTokens.find(token => lowerWardrobe.includes(token));
    if (foundViolation) {
      wasAutoHealed = true;
      sanitizedWardrobe = venue.defaultAttire;
      sanctityVerdict = `AUTO-HEALED SACRED VENUE VIOLATION: Blocked '${foundViolation}' in '${venue.name}'. Enforced authentic ceremonial attire (${venue.defaultAttire}) & reverent Anjali mudra posture.`;
    } else if (!/saree|kurta|veshti|silk|traditional|ceremonial|modest/i.test(lowerWardrobe)) {
      wasAutoHealed = true;
      sanitizedWardrobe = venue.defaultAttire;
      sanctityVerdict = `AUTO-ALIGNED SACRED ATTIRE: Upgraded generic attire to '${venue.defaultAttire}' for temple sanctity.`;
    }
  } else if (venue.category === "AQUATIC_BEACH") {
    const foundViolation = venue.bannedWardrobeTokens.find(token => lowerWardrobe.includes(token));
    if (foundViolation) {
      wasAutoHealed = true;
      sanitizedWardrobe = venue.defaultAttire;
      sanctityVerdict = `AUTO-HEALED AQUATIC VIOLATION: Replaced '${foundViolation}' with '${venue.defaultAttire}'.`;
    }
  }

  const culturalVocalMatch = `Biometrically locked to ${performer.name} (${performer.demography}): ${performer.vocalRegister} in [${performer.nativeLanguages.join(" / ")}].`;

  return {
    venueCategory: venue.category,
    originalWardrobe: rawWardrobe,
    sanitizedWardrobe,
    wasAutoHealed,
    sanctityVerdict,
    culturalVocalMatch
  };
}

/**
 * Stage 2: Compiles the culturally & biometrically grounded Lyria 3.5 acoustic map.
 */
export function compileBiometricAcousticMap(
  performer: Omni12Performer,
  venue: Omni12VenuePreset,
  bpm = 120,
  numBars = 12,
  customLyrics?: string[]
): Omni12AcousticMap {
  const barDurationSec = parseFloat(((60 / bpm) * 4).toFixed(3)); // 2.000s at 120 BPM
  const downbeats: number[] = [];
  for (let i = 0; i <= numBars; i++) {
    downbeats.push(parseFloat((i * barDurationSec).toFixed(3)));
  }

  // Dynamic musical energy arc across bars: Intro (LOW) -> Verse (MID) -> Chorus Drop (PEAK) -> Outro (LOW)
  const rmsTiers: ("LOW" | "MID" | "PEAK")[] = [];
  for (let i = 0; i < numBars; i++) {
    if (i < 2) rmsTiers.push("LOW");
    else if (i < 5) rmsTiers.push("MID");
    else if (i < 10) rmsTiers.push("PEAK");
    else rmsTiers.push("LOW");
  }

  // Culturally authentic default lyrics matching performer demography & venue
  const defaultLyricsByDemography: Record<string, string[]> = {
    sofia_madrid_es: [
      "[Instrumental Flamenco-Pop Guitar Intro]",
      "[Instrumental Build - Breath Anchor]",
      "Bajo la luna de Madrid, brilla el corazón",
      "Siente el pulso del compás, pura pasión",
      "En tus ojos veo el sol despertar",
      "Baila conmigo sin mirar atrás",
      "Fuego en la sangre, ritmo sin final",
      "Esta noche somos luz celestial",
      "Vibra el alma en cada latido",
      "En este sueño siempre unidos",
      "[Instrumental Acoustic Resolution]",
      "[Final Resonant Chord Decay]"
    ],
    meera_chennai_in: [
      "[Sacred Temple Veena & Mridangam Alapana Intro]",
      "[Temple Bell Resonance - Anjali Mudra]",
      "Ananda நடனம் ஆடும் சிவனே போற்றி",
      "நாத பிரம்மம் ஒளிரும் திருக்கோயில்",
      "கலைமகள் அருளால் பொங்கும் கீதம்",
      "பக்திப் பரவசம் நிறைந்த உள்ளம்",
      "தாள லயத்தில் மலரும் தர்மம்",
      "திவ்விய தரிசனம் தரும் ஆனந்தம்",
      "சரணம் சரணம் ஓம் நமச்சிவாய",
      "அமைதி நிலவும் புனித சந்நிதி",
      "[Classical Bansuri & Tanpura Resolution]",
      "[Sacred Temple Bell Decay]"
    ],
    aarav_chandigarh_in: [
      "[High-Energy Tumbi & Dholak Intro Build]",
      "[Dhol Dagga Drop - Rhythmic Shoulder Shrug]",
      "Dil de vich vajda dhol sajna",
      "Chandigarh di raat, rangin zamana",
      "Nach le khul ke, chhad de fikar",
      "Tere naal chalda pyar da safar",
      "Gabru di chaal, jiven sher da shikaar",
      "Bhangra paave saara sansaar",
      "Chardi kala vich rehnde sada",
      "Desi beat utte nachda khuda",
      "[Instrumental Dhol & Algoze Finale]",
      "[Resonant Sub-Bass Out]"
    ],
    daria_freja_cypher: [
      "[Atmospheric Cyberpunk Sub-Bass & Vinyl Crackle]",
      "[808 Kick & Hi-Hat Roll Build]",
      "Electric pulse inside the midnight zone",
      "Step in the cypher, claim the neon throne",
      "Precision motion, lock it to the beat",
      "Sparks on the pavement underneath our feet",
      "Zero gravity spin, break the frame",
      "Nocturne legends, remember the name",
      "Kinetic energy, voltage in the air",
      "Unstoppable flow beyond compare",
      "[Instrumental Scratch & Synth Breakdown]",
      "[Sub-Bass Fade Out]"
    ]
  };

  const baseLyrics = customLyrics && customLyrics.length > 0
    ? customLyrics
    : defaultLyricsByDemography[performer.id] || defaultLyricsByDemography.sofia_madrid_es;

  const lyricsByBar = Array.from({ length: numBars }, (_, i) => baseLyrics[i % baseLyrics.length]);

  const lyriaPrompt = `Google DeepMind Lyria 3.5 Master Track (${bpm} BPM, 48kHz stereo, -14 LUFS integrated): Culturally authentic ${performer.demography} production set in ${venue.name}. Lead Vocal: ${performer.vocalRegister} singing in ${performer.nativeLanguages[0]}. Full 35Hz-20kHz spectrum preserved (zero 200Hz highpass gutting). Dynamic arrangement: Bars 1-2 Ambient Intro -> Bars 3-5 Mid-Energy Verse -> Bars 6-10 Peak Chorus Drop -> Bars 11-12 Outro.`;

  return {
    bpm,
    barDurationSec,
    totalDurationSec: parseFloat((numBars * barDurationSec).toFixed(3)),
    downbeats,
    rmsTiers,
    lyricsByBar,
    lyriaPrompt
  };
}

/**
 * Stage 3: Hardened Decoupled Shot Schedule Compiler (Zero Tech Baggage, 100% Fixed Invariants).
 * - Isolated lastCutawayDirection state variable guarantees true LEFT <-> RIGHT 180° alternation.
 * - Dynamic anchorMode switches consecutive B_ROLL bars to TAIL_CONTINUATION to prevent dance jump-cuts.
 * - Safe anchorStillPath resolution with fallback prevents ENOENT crashes.
 * - Active vocal jaw/lip articulation on A_ROLL; mouth-closed choreography on B_ROLL/C_ROLL.
 */
export function buildOmni12ShotSchedule(
  acousticMap: Omni12AcousticMap,
  performer: Omni12Performer,
  venue: Omni12VenuePreset,
  sanitizedWardrobe: string,
  projectDir = "/tmp/omni12_scratch"
): Omni12ShotDefinition[] {
  const schedule: Omni12ShotDefinition[] = [];
  let lastCutawayDirection: "LEFT" | "RIGHT" = "RIGHT";
  let prevRole: "A_ROLL" | "B_ROLL" | "C_ROLL" | null = null;

  for (let i = 0; i < acousticMap.downbeats.length - 1; i++) {
    const startTimeSec = acousticMap.downbeats[i];
    const endTimeSec = acousticMap.downbeats[i + 1];
    const durationSeconds = parseFloat((endTimeSec - startTimeSec).toFixed(3));
    const rmsEnergy = acousticMap.rmsTiers[i] || "MID";
    const lyricLine = acousticMap.lyricsByBar[i] || "";
    const isInstrumentalBar = lyricLine.startsWith("[") || rmsEnergy === "LOW";

    // Role Assignment:
    // - Instrumental Intro/Outro (LOW) -> C_ROLL (Establishing / Atmospheric / Reverent Pose)
    // - Verse with Vocals (MID) -> A_ROLL (Direct-to-lens vocal lip-sync)
    // - Peak Chorus Drop (PEAK) -> Alternates A_ROLL (Lead Vocal) & B_ROLL (Dynamic Choreography)
    let role: "A_ROLL" | "B_ROLL" | "C_ROLL";
    if (isInstrumentalBar) {
      role = "C_ROLL";
    } else if (rmsEnergy === "PEAK") {
      role = i % 2 === 0 ? "B_ROLL" : "A_ROLL";
    } else {
      role = "A_ROLL";
    }

    // Discrete Veo 3.1 generation bucket (5s or 8s)
    const nativeGenSeconds: 5 | 8 = durationSeconds > 5.0 ? 8 : 5;

    // Isolated 180-Degree Eyeline State Machine (Never clobbered by A_ROLL)
    let eyelineVector: "LEFT" | "RIGHT" | "LENS";
    if (role === "A_ROLL") {
      eyelineVector = "LENS";
    } else {
      lastCutawayDirection = lastCutawayDirection === "LEFT" ? "RIGHT" : "LEFT";
      eyelineVector = lastCutawayDirection;
    }

    // Dynamic Anchor Mode: Any consecutive bars in the same camera angle (A_ROLL, B_ROLL, or C_ROLL)
    // use TAIL_CONTINUATION (conditioning on shot_N-1_tail.jpg) to prevent jump-cuts & posture teleportation.
    // Camera angle cuts (prevRole !== role) use DISCRETE_STILL from the 4 Master Anchor setups.
    const anchorMode: "DISCRETE_STILL" | "TAIL_CONTINUATION" =
      prevRole === role ? "TAIL_CONTINUATION" : "DISCRETE_STILL";

    // Safe Anchor File Path Resolution (Checks disk first, falls back to performer anchor)
    const candidatePerShotPath = path.join(
      projectDir,
      "anchors",
      `shot_${String(i + 1).padStart(2, "0")}_${role.toLowerCase()}.png`
    );
    const anchorStillPath = fs.existsSync(candidatePerShotPath)
      ? candidatePerShotPath
      : performer.anchorImageUrl;

    // Culturally, Wardrobially & Lyrically Grounded Prompt
    let kineticPrompt: string;
    if (role === "A_ROLL") {
      kineticPrompt = `Veo 3.1 1080p 9:16 A-ROLL VOCAL PERFORMANCE in ${venue.name} (${venue.lightingPalette}). Performer: ${performer.name} (${performer.demography}) wearing ${sanitizedWardrobe}. Eyeline: Locked directly to camera lens. Performer sings passionately in ${performer.nativeLanguages[0]} enunciating syllable by syllable: "${lyricLine}". Visible dynamic jaw movement, natural cheek/throat tension, and expressive phonetic lip articulation matching vocal cadence. Energy: ${rmsEnergy}.`;
    } else if (role === "B_ROLL") {
      kineticPrompt = `Veo 3.1 1080p 9:16 B-ROLL CHOREOGRAPHY in ${venue.name} (${venue.lightingPalette}). Performer: ${performer.name} wearing ${sanitizedWardrobe}. Action: ${venue.choreographyStyle} synchronized to ${acousticMap.bpm} BPM bar downbeat. Mouth closed, non-vocal dance performance, expressive eye contact looking ${eyelineVector.toLowerCase()} of camera frame. Camera: Dynamic tracking shot matching ${rmsEnergy} musical energy.`;
    } else {
      kineticPrompt = `Veo 3.1 1080p 9:16 C-ROLL ATMOSPHERIC CUTAWAY in ${venue.name} (${venue.lightingPalette}). Performer: ${performer.name} in ${sanitizedWardrobe}. Action: ${venue.category === "SACRED_TEMPLE" ? "Reverent Anjali mudra (hands folded in prayer), serene spiritual composure" : "Poised cinematic silhouette and atmospheric motion"}. Mouth closed, silent non-vocal moment, looking ${eyelineVector.toLowerCase()} of frame.`;
    }

    schedule.push({
      shotIndex: i + 1,
      role,
      startBar: i + 1,
      endBar: i + 2,
      startTimeSec,
      endTimeSec,
      durationSeconds,
      nativeGenSeconds,
      anchorMode,
      anchorStillPath,
      kineticPrompt,
      eyelineVector,
      needsLipSync: role === "A_ROLL",
      rmsEnergy,
      lyricLine
    });

    prevRole = role;
  }

  return schedule;
}

/**
 * Compiles a complete, self-contained Omni 1.2 Production Plan.
 */
export function compileOmni12Plan(input: {
  performerId?: string;
  venueId?: string;
  customWardrobe?: string;
  requestedWardrobe?: string;
  bpm?: number;
  numBars?: number;
}): Omni12ProductionPlan {
  const performer = OMNI12_PERFORMERS.find(p => p.id === input.performerId) || OMNI12_PERFORMERS[0];
  const venue = OMNI12_VENUES.find(v => v.id === input.venueId) || OMNI12_VENUES[0];
  const bpm = input.bpm || 120;
  const numBars = input.numBars || 15;

  const sanctityAudit = evaluateSanctityAndWardrobe(performer, venue, input.customWardrobe || input.requestedWardrobe);
  const acousticMap = compileBiometricAcousticMap(performer, venue, bpm, numBars);
  const shots = buildOmni12ShotSchedule(acousticMap, performer, venue, sanctityAudit.sanitizedWardrobe);

  return {
    id: `omni12_${Date.now().toString(36)}`,
    title: `${performer.name} — ${venue.name}`,
    createdAt: new Date().toISOString(),
    performer,
    venue,
    sanctityAudit,
    acousticMap,
    shots,
    cfrSpec: {
      targetFps: 30,
      videoTrackTimescale: 30000,
      audioSampleRateHz: 48000,
      ptsResetFilter: "trim=duration=${durationSeconds},setpts=PTS-STARTPTS,fps=30",
      maxAllowedDriftMs: 50
    }
  };
}

/**
 * Stage 4/6: Hardened FFmpeg CFR Conformance & 0.0ms PTS Reset Executor.
 * Streams directly to disk without Node.js RAM buffering.
 */
export async function conformClipToCFR(
  rawInputPath: string,
  targetDurationSeconds: number,
  outputPath: string,
  preserveAudio = true
): Promise<{ outputPath: string; durationSec: number; fps: number; timescale: number }> {
  const vf = `trim=duration=${targetDurationSeconds.toFixed(3)},setpts=PTS-STARTPTS,fps=30`;
  const args = [
    "-y",
    "-i", rawInputPath,
    "-vf", vf,
    "-r", "30",
    "-video_track_timescale", "30000",
    "-pix_fmt", "yuv420p",
    "-c:v", "libx264",
    "-preset", "veryfast",
    ...(preserveAudio
      ? ["-af", `atrim=duration=${targetDurationSeconds.toFixed(3)},asetpts=PTS-STARTPTS`, "-ar", "48000", "-c:a", "aac"]
      : ["-an"]),
    outputPath
  ];

  await execFileAsync("ffmpeg", args);

  if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size < 1024) {
    throw new Error(`[OMNI12_CFR_FAIL] Conformed output missing or empty: ${outputPath}`);
  }

  return {
    outputPath,
    durationSec: targetDurationSeconds,
    fps: 30,
    timescale: 30000
  };
}

export const compileOmni12ProductionPlan = compileOmni12Plan;

