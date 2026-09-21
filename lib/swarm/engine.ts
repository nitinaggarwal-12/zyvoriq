export interface SwarmAgentStatus {
  id:
    | 'script_agent'
    | 'casting_agent'
    | 'wardrobe_agent'
    | 'location_agent'
    | 'prop_agent'
    | 'narration_agent'
    | 'music_agent'
    | 'assembly_agent';
  name: string;
  icon: string;
  roleTitle: string;
  stackModel: 'Gemini 2.5 Pro & Omni' | 'Nano Banana Visual DNA' | 'DeepMind Lyria 3.5' | 'FFmpeg 30fps CFR Master';
  status: 'COMPLETED' | 'ACTIVE' | 'QUEUED';
  executionTimeMs: number;
  deliverableSummary: string;
  technicalArtifact: string;
}

export interface SwarmShotDefinition {
  shotNumber: number;
  actTitle: string;
  startSec: number;
  endSec: number;
  durationSec: number;
  cameraLens: string;
  cameraMovement: string;
  eyelineDirection: 'LEFT' | 'RIGHT' | 'DOWN_AT_CRAFT' | 'HORIZON' | 'DIRECT_TO_LENS';
  mouthLockState: 'MOUTH_CLOSED_NON_VOCAL_ACTING' | 'ON_CAMERA_NATIVE_VEO_SPEAKING_LIP_SYNC';
  characterName: string;
  characterPortraitUrl: string;
  propFocus: string;
  voiceoverLine: string;
  lyriaScoreCue: string;
  veoPrompt: string;
}

export interface SwarmFilmProductionPlan {
  id: string;
  title: string;
  subtitle: string;
  genre: string;
  aspectRatio: '16:9' | '9:16';
  durationSec: number;
  createdAt: string;
  logline: string;
  agents: SwarmAgentStatus[];
  castList: Array<{
    name: string;
    role: string;
    demography: string;
    portraitUrl: string;
    wardrobeSpec: string;
  }>;
  locationVault: {
    name: string;
    architectureStyle: string;
    lightingAtmosphere: string;
    acousticReverbProfile: string;
  };
  propManifest: Array<{
    id: string;
    name: string;
    materialShader: string;
    macroDetail: string;
  }>;
  scoreSpec: {
    engine: string;
    bpm: number;
    keySignature: string;
    vocalPolicy: 'STRICT_INSTRUMENTAL_NO_SINGING';
    instruments: string[];
    integratedLufs: number;
    sidechainDuckingDb: number;
  };
  shots: SwarmShotDefinition[];
  cfrBroadcastSpec: {
    fps: 30;
    timescale: 30000;
    audioSampleRateHz: 48000;
    maxDriftMs: 0;
  };
}

export const SWARM_PRODUCTION_PRESETS: Record<string, SwarmFilmProductionPlan> = {
  cathedral_of_crust: {
    id: 'cathedral_of_crust',
    title: 'The Cathedral of Crust',
    subtitle: 'An Autonomous Commercial Feature Spot Built 100% in Code',
    genre: 'Artisan Culinary Cinema / Dramatic Commercial Spot',
    aspectRatio: '16:9',
    durationSec: 30.0,
    createdAt: new Date().toISOString(),
    logline:
      'No cameras, no rented sets—just an autonomous 8-agent creative crew turning code into blistered Neapolitan sourdough mastery.',
    agents: [
      {
        id: 'script_agent',
        name: 'Script Creation Agent',
        icon: '📝',
        roleTitle: 'Screenplay, Multi-Act Dramatic Structure & Voiceover Arc',
        stackModel: 'Gemini 2.5 Pro & Omni',
        status: 'COMPLETED',
        executionTimeMs: 420,
        deliverableSummary:
          'Compiled 6-shot (30.0s) dramatic culinary screenplay with synchronized voiceover narration and anamorphic lens schedule.',
        technicalArtifact: 'screenplay_cathedral_of_crust_v1.json',
      },
      {
        id: 'casting_agent',
        name: 'Casting Direction Agent',
        icon: '🎭',
        roleTitle: 'Biometric Character Identity & Facial Geometry Lock',
        stackModel: 'Nano Banana Visual DNA',
        status: 'COMPLETED',
        executionTimeMs: 380,
        deliverableSummary:
          'Locked 3 distinct Italian artisan character anchors with de-lit facial albedo and zero cross-shot identity drift.',
        technicalArtifact: 'nano_banana_cast_dna_anchors.bin',
      },
      {
        id: 'wardrobe_agent',
        name: 'Wardrobe Department Agent',
        icon: '👔',
        roleTitle: 'Garment UV Swatches, Fabric Weave & Flour-Dust Texturing',
        stackModel: 'Nano Banana Visual DNA',
        status: 'COMPLETED',
        executionTimeMs: 310,
        deliverableSummary:
          'Synthesized raw Neapolitan linen aprons with persistent organic flour-dusting maps and heat-worn leather gauntlets.',
        technicalArtifact: 'garment_uv_linen_flour_swatches.png',
      },
      {
        id: 'location_agent',
        name: 'Location Scouting Agent',
        icon: '📍',
        roleTitle: 'Spatial Architecture, 900°F Brick Vault & Volumetric Lighting',
        stackModel: 'Nano Banana Visual DNA',
        status: 'COMPLETED',
        executionTimeMs: 450,
        deliverableSummary:
          'Engineered "The Cathedral of Crust"—an ancient volcanic brick oven sanctuary with chiaroscuro ember rays and floating flour particles.',
        technicalArtifact: 'neapolitan_vault_hdr_lighting.exr',
      },
      {
        id: 'prop_agent',
        name: 'Prop Facility Agent',
        icon: '🥖',
        roleTitle: 'Macro Culinary Prop Assets, Blistered Dough & Copper Peel',
        stackModel: 'Nano Banana Visual DNA',
        status: 'COMPLETED',
        executionTimeMs: 390,
        deliverableSummary:
          'Generated 5 hyper-consistent macro props: hand-forged copper peel, 72h fermented sourdough cornicione, San Marzano gold, fior di latte, basil.',
        technicalArtifact: 'prop_manifest_macro_culinary_set.json',
      },
      {
        id: 'narration_agent',
        name: 'Narration Agent',
        icon: '🎙️',
        roleTitle: 'Cinematic Voiceover Synthesis & Acoustic Cadence Pacing',
        stackModel: 'Gemini 2.5 Pro & Omni',
        status: 'COMPLETED',
        executionTimeMs: 510,
        deliverableSummary:
          'Synthesized gravelly baritone theatrical narration (-14.0 LUFS) timed to scene cuts with automatic sidechain ducking triggers.',
        technicalArtifact: 'voiceover_cathedral_master_48k.wav',
      },
      {
        id: 'music_agent',
        name: 'Music Scoring Agent',
        icon: '🎼',
        roleTitle: 'Original Dramatic Instrumental Score (Zero Singing Vocals)',
        stackModel: 'DeepMind Lyria 3.5',
        status: 'COMPLETED',
        executionTimeMs: 640,
        deliverableSummary:
          'Composed 92 BPM dramatic cello ostinato, warm acoustic guitar & orchestral strings score (100% instrumental, zero singing vocals).',
        technicalArtifact: 'lyria_35_dramatic_cello_score_92bpm.mp3',
      },
      {
        id: 'assembly_agent',
        name: 'Final Assembly Agent',
        icon: '🎬',
        roleTitle: '30fps CFR Conformance, PTS Reset & 4-Clock Drift Verification',
        stackModel: 'FFmpeg 30fps CFR Master',
        status: 'COMPLETED',
        executionTimeMs: 820,
        deliverableSummary:
          'Conformed 6 shots to 30/1 CFR (time_base=1/30000), mixed VO + Lyria Score + Wood-Fire Foley, verified 0.0ms 4-Clock Drift.',
        technicalArtifact: 'cathedral_of_crust_master.mp4',
      },
    ],
    castList: [
      {
        name: 'Gianluigi Moretti',
        role: 'Master Pizzaiolo (3rd Generation Neapolitan Artisan)',
        demography: 'Southern Italian (Naples, 54yo)',
        portraitUrl: '/assets/characters/gianluigi_moretti.jpg',
        wardrobeSpec:
          'Charcoal double-breasted artisan chef tunic, raw unbleached linen apron dusted with Tipo 00 flour',
      },
      {
        name: 'Giulia Romano',
        role: 'Fermentation & Sourdough Architect',
        demography: 'Italian (Rome, 31yo)',
        portraitUrl: '/assets/characters/giulia_romano_it.jpg',
        wardrobeSpec:
          'Rolled-sleeve olive linen workshirt, heritage woven apron, flour-dusted forearms',
      },
      {
        name: 'Matteo Conti',
        role: 'Wood-Fire Hearth Master & Sommelier',
        demography: 'Northern Italian (Milan, 38yo)',
        portraitUrl: '/assets/characters/matteo_conti_it.jpg',
        wardrobeSpec:
          'Heavyweight slate canvas baker jacket, heat-shielded suede oven gauntlets',
      },
    ],
    locationVault: {
      name: 'The Cathedral of Crust — Volcanic Brick Vault (Naples)',
      architectureStyle:
        '18th-century vaulted tufa stone cellar with monumental hand-built Vesuvian brick wood-fired dome oven',
      lightingAtmosphere:
        '2200K roaring oak-fire amber glow intersecting 5600K cool clerestory shafts through suspended flour dust motes',
      acousticReverbProfile:
        'Warm stone vault resonance with crackling oak timber embers and crisp crust crackle foley',
    },
    propManifest: [
      {
        id: 'prop_01_dough',
        name: '72-Hour Wild Fermented Sourdough Ball',
        materialShader: 'Subsurface scattering elastic gluten network with fine Tipo 00 flour dusting',
        macroDetail: 'Micro-blisters and delicate fermentation air pockets visible under side-key lighting',
      },
      {
        id: 'prop_02_sauce',
        name: 'Crushed San Marzano DOP Tomato Reduction',
        materialShader: 'Rich crimson viscous fluid specular highlight with crushed seeds and sea salt crystals',
        macroDetail: 'Ladled in a slow clockwise spiral from the center outward',
      },
      {
        id: 'prop_03_peel',
        name: 'Hand-Forged Hammered Copper Pizza Peel',
        materialShader: 'Patina-burnished copper blade with ash-scorched brass rivets and turned walnut handle',
        macroDetail: 'Sliding cleanly beneath the stretched dough disk',
      },
      {
        id: 'prop_04_fire',
        name: '900°F Vesuvian Oak Wood Hearth Fire',
        materialShader: 'Volumetric incandescent flame licks rolling across blackened dome brickwork',
        macroDetail: 'Radiant heat shimmer warping background air particles',
      },
      {
        id: 'prop_05_crust',
        name: 'Leopard-Spotted Blistered Cornicione Crust',
        materialShader: 'Crisp obsidian char blisters over golden honeycomb crumb with molten fior di latte',
        macroDetail: 'Steam rising as fresh sweet basil leaves and extra virgin olive oil glisten on top',
      },
    ],
    scoreSpec: {
      engine: 'Google DeepMind Lyria 3.5 Instrumental Score Engine',
      bpm: 92,
      keySignature: 'D Minor (Dramatic Cinematic / Reverent)',
      vocalPolicy: 'STRICT_INSTRUMENTAL_NO_SINGING',
      instruments: [
        'Solo Stradivarius Cello Ostinato',
        'Warm Neapolitan Nylon Acoustic Guitar',
        'Chamber String Ensemble Swells',
        'Deep Concert Gran Cassa & Subtle Woodblock Pulse',
      ],
      integratedLufs: -22.0,
      sidechainDuckingDb: -8.0,
    },
    shots: [
      {
        shotNumber: 1,
        actTitle: 'ACT I • THE CONSECRATION OF FLOUR (ON-CAMERA SPEAKING)',
        startSec: 0.0,
        endSec: 5.0,
        durationSec: 5.0,
        cameraLens: '35mm Anamorphic Prime (T1.8)',
        cameraMovement: 'Medium Close-Up Direct Address to Lens',
        eyelineDirection: 'DIRECT_TO_LENS',
        mouthLockState: 'ON_CAMERA_NATIVE_VEO_SPEAKING_LIP_SYNC',
        characterName: 'Gianluigi Moretti',
        characterPortraitUrl: '/assets/characters/gianluigi_moretti.jpg',
        propFocus: 'Tipo 00 Flour Tossed Across Travertine Marble',
        voiceoverLine:
          'Look at this flour. Before the fire, before the stone, everything begins right here in Naples.',
        lyriaScoreCue: 'Low solo cello drone enters with delicate nylon guitar harmonics (92 BPM)',
        veoPrompt:
          'Veo 3.1 1080p Cinema Master: Master Pizzaiolo Gianluigi Moretti looks directly into the camera lens while tossing fine white flour onto a marble table, speaking passionately aloud to the camera with clear lip sync and expressive Italian hand gestures: "Look at this flour. Before the fire, before the stone, everything begins right here in Naples."',
      },
      {
        shotNumber: 2,
        actTitle: 'ACT II • 72-HOUR WILD FERMENTATION (ON-CAMERA SPEAKING)',
        startSec: 5.0,
        endSec: 10.0,
        durationSec: 5.0,
        cameraLens: '50mm Anamorphic Prime (T1.4)',
        cameraMovement: 'Medium Shot Direct Address While Kneading Sourdough',
        eyelineDirection: 'DIRECT_TO_LENS',
        mouthLockState: 'ON_CAMERA_NATIVE_VEO_SPEAKING_LIP_SYNC',
        characterName: 'Gianluigi Moretti',
        characterPortraitUrl: '/assets/characters/gianluigi_moretti.jpg',
        propFocus: '72-Hour Fermented Blistered Sourdough & Marble Counter',
        voiceoverLine:
          'We let this dough rest for seventy-two hours. Patience is the only secret ingredient I trust.',
        lyriaScoreCue: 'Rhythmic cello spiccato ostinato builds with warm string chords',
        veoPrompt:
          'Veo 3.1 1080p Cinema Master: Master Pizzaiolo Gianluigi Moretti presses and stretches 72-hour fermented blistered sourdough on a marble counter, looking up directly at the camera and speaking aloud with clear lip sync: "We let this dough rest for seventy-two hours. Patience is the only secret ingredient I trust."',
      },
      {
        shotNumber: 3,
        actTitle: 'ACT III • CRUSHING SAN MARZANO GOLD (ON-CAMERA SPEAKING)',
        startSec: 10.0,
        endSec: 15.0,
        durationSec: 5.0,
        cameraLens: '50mm Macro Cinema Prime (T1.4)',
        cameraMovement: 'Medium Close-Up Direct Address Over Copper Bowl',
        eyelineDirection: 'DIRECT_TO_LENS',
        mouthLockState: 'ON_CAMERA_NATIVE_VEO_SPEAKING_LIP_SYNC',
        characterName: 'Gianluigi Moretti',
        characterPortraitUrl: '/assets/characters/gianluigi_moretti.jpg',
        propFocus: 'Hand-Crushed San Marzano DOP Tomatoes & Copper Bowl',
        voiceoverLine:
          'I crush these volcanic San Marzano tomatoes by hand so a metal blade never touches the sweetness.',
        lyriaScoreCue: 'Warm string ensemble swells over gentle acoustic guitar',
        veoPrompt:
          'Veo 3.1 1080p Cinema Master: Master Pizzaiolo Gianluigi Moretti crushes ruby-red San Marzano tomatoes by hand into a copper bowl, looking directly at the camera and speaking aloud with clear lip sync: "I crush these volcanic San Marzano tomatoes by hand so a metal blade never touches the sweetness."',
      },
      {
        shotNumber: 4,
        actTitle: 'ACT IV • INTO THE 900°F VOLCANIC HEARTH (ON-CAMERA SPEAKING)',
        startSec: 15.0,
        endSec: 20.0,
        durationSec: 5.0,
        cameraLens: '35mm Anamorphic Prime (Amber Flare)',
        cameraMovement: 'Medium Hero Shot In Front of Roaring 900°F Brick Oven',
        eyelineDirection: 'DIRECT_TO_LENS',
        mouthLockState: 'ON_CAMERA_NATIVE_VEO_SPEAKING_LIP_SYNC',
        characterName: 'Gianluigi Moretti',
        characterPortraitUrl: '/assets/characters/gianluigi_moretti.jpg',
        propFocus: 'Hammered Copper Peel & Roaring Vesuvian Oak Flames',
        voiceoverLine:
          'Now into nine hundred degrees of Vesuvian oak fire. Sixty seconds is all it takes.',
        lyriaScoreCue: 'Orchestral brass swell and deep gran cassa impact synchronized to oven launch',
        veoPrompt:
          'Veo 3.1 1080p Cinema Master: Master Pizzaiolo Gianluigi Moretti holds a hammered copper peel in front of a roaring brick wood-fired pizza oven, looking directly at the camera and speaking aloud with clear lip sync over the flames: "Now into nine hundred degrees of Vesuvian oak fire. Sixty seconds is all it takes."',
      },
      {
        shotNumber: 5,
        actTitle: 'ACT V • BLISTERING IN THE FLAME (ON-CAMERA SPEAKING)',
        startSec: 20.0,
        endSec: 25.0,
        durationSec: 5.0,
        cameraLens: '85mm Cinema Prime (Firelight Glow)',
        cameraMovement: 'Close-Up Beside Glowing Oven Hearth Opening',
        eyelineDirection: 'DIRECT_TO_LENS',
        mouthLockState: 'ON_CAMERA_NATIVE_VEO_SPEAKING_LIP_SYNC',
        characterName: 'Gianluigi Moretti',
        characterPortraitUrl: '/assets/characters/gianluigi_moretti.jpg',
        propFocus: 'Leopard-Spotted Cornicione Blistering in 900°F Fire',
        voiceoverLine:
          'Listen to that crust crackle. Look how the cornicione blisters like a leopard in the flame.',
        lyriaScoreCue: 'Soaring violin counterpoint over driving cello ostinato (crescendo)',
        veoPrompt:
          'Veo 3.1 1080p Cinema Master: Warm orange firelight illuminates Master Pizzaiolo Gianluigi Moretti beside the glowing oven opening as he gestures toward the blistering pizza and speaks aloud to the camera with clear lip sync: "Listen to that crust crackle. Look how the cornicione blisters like a leopard in the flame."',
      },
      {
        shotNumber: 6,
        actTitle: 'ACT VI • THE CATHEDRAL OF CRUST FINALE (ON-CAMERA SPEAKING)',
        startSec: 25.0,
        endSec: 30.0,
        durationSec: 5.0,
        cameraLens: '35mm Wide Anamorphic Master',
        cameraMovement: 'Hero Presentation Shot Drizzling Golden Olive Oil',
        eyelineDirection: 'DIRECT_TO_LENS',
        mouthLockState: 'ON_CAMERA_NATIVE_VEO_SPEAKING_LIP_SYNC',
        characterName: 'Gianluigi Moretti',
        characterPortraitUrl: '/assets/characters/gianluigi_moretti.jpg',
        propFocus: 'Steaming Leopard-Spotted Margherita & Extra Virgin Olive Oil',
        voiceoverLine:
          'No shortcuts, no compromises. This is The Cathedral of Crust. Buon appetito!',
        lyriaScoreCue: 'Triumphant full D-minor orchestral cadence with resonant cello resolution',
        veoPrompt:
          'Veo 3.1 1080p Cinema Master: Master Pizzaiolo Gianluigi Moretti holds a steaming, crispy leopard-spotted Margherita pizza on a wooden board, drizzling golden extra virgin olive oil while looking directly into the camera lens and speaking aloud with clear lip sync: "No shortcuts, no compromises. This is The Cathedral of Crust. Buon appetito!"',
      },
    ],
    cfrBroadcastSpec: {
      fps: 30,
      timescale: 30000,
      audioSampleRateHz: 48000,
      maxDriftMs: 0,
    },
  },
  project_gurkha: {
    id: 'project_gurkha',
    title: 'Project Gurkha: The Phantom Protocol',
    subtitle: 'Aditya Dhar 8K Undercover Espionage Feature Film • Modern Hindi Dialogues',
    genre: 'Geopolitical Cyber-Espionage Action Thriller (Aditya Dhar Direction)',
    aspectRatio: '16:9',
    durationSec: 20.0,
    createdAt: new Date().toISOString(),
    logline:
      'Two deep-cover Indian intelligence operatives (Agents Kiara & Vani) infiltrate a hostile Lyari cyber-state syndicate gala in their glamorous undercover evening attire, executing a one-shot digital and physical surgical strike.',
    agents: [
      {
        id: 'script_agent',
        name: 'Script Creation Agent',
        icon: '📝',
        roleTitle: 'Aditya Dhar 4-Act Hindi Screenplay & Dialogue Architecture',
        stackModel: 'Gemini 2.5 Pro & Omni',
        status: 'COMPLETED',
        executionTimeMs: 410,
        deliverableSummary:
          'Compiled 4-Act (20.0s) high-intensity modern Hindi espionage screenplay with 1:1 native Veo lip-sync cues and split-edit L/J-cut bridges.',
        technicalArtifact: 'screenplay_project_gurkha_hindi_v2.json',
      },
      {
        id: 'casting_agent',
        name: 'Casting Direction Agent',
        icon: '🎭',
        roleTitle: '100% Biometric Identity Lock (Same Actresses as Previous Reel)',
        stackModel: 'Nano Banana Visual DNA',
        status: 'COMPLETED',
        executionTimeMs: 360,
        deliverableSummary:
          'Locked exact biometric facial geometry of Agents Kiara (left, brunette) and Vani (right, blonde) from previous reel reference plate.',
        technicalArtifact: 'nano_banana_gurkha_undercover_dna.bin',
      },
      {
        id: 'wardrobe_agent',
        name: 'Wardrobe & Undercover Styling Agent',
        icon: '👗',
        roleTitle: 'Undercover VIP Gala Attire Continuity (Royal-Blue & Coral-Red Silk Halter Tops)',
        stackModel: 'Nano Banana Visual DNA',
        status: 'COMPLETED',
        executionTimeMs: 310,
        deliverableSummary:
          'Preserved exact undercover wardrobe from previous reel (royal-blue high-neck silk halter evening top + gold hoops on left; coral-red high-neck silk halter evening top + gold hoops on right).',
        technicalArtifact: 'wardrobe_undercover_gala_lock.json',
      },
      {
        id: 'location_agent',
        name: 'Location & Atmosphere Agent',
        icon: '🌆',
        roleTitle: '8K Lyari Neon Cyber-Slum, Brutalist Bunker & Rooftop Helipad',
        stackModel: 'Gemini 2.5 Pro & Omni',
        status: 'COMPLETED',
        executionTimeMs: 390,
        deliverableSummary:
          'Designed rain-slicked Lyari cyberpunk penthouse terrace, subterranean concrete vault, crimson CQC server core, and rooftop plasma blast.',
        technicalArtifact: 'locations_lyari_cyber_vault_8k.json',
      },
      {
        id: 'prop_agent',
        name: 'Tactical Props & HUD Agent',
        icon: '🕶️',
        roleTitle: 'Biometric Contact HUDs & Quantum Counter-Virus Terminals',
        stackModel: 'Nano Banana Visual DNA',
        status: 'COMPLETED',
        executionTimeMs: 280,
        deliverableSummary:
          'Engineered green holographic pupil HUD reflections, subterranean server racks, and plasma detonation VFX.',
        technicalArtifact: 'props_hud_server_core.json',
      },
      {
        id: 'narration_agent',
        name: 'Hindi Dialogue & Lip-Sync Agent',
        icon: '🎙️',
        roleTitle: 'Native Veo 3.1 Modern Hindi On-Camera Lip-Sync Speech ([0:a])',
        stackModel: 'FFmpeg 30fps CFR Master',
        status: 'COMPLETED',
        executionTimeMs: 340,
        deliverableSummary:
          'Synchronized 4 modern Hindi dialogue acts with vocal-band ducking (bandreject=f=1400) in breath tails for zero word overlap.',
        technicalArtifact: 'hindi_dialogue_stems_48khz.wav',
      },
      {
        id: 'music_agent',
        name: 'Shashwat Sachdev Sonic DNA Agent',
        icon: '🥁',
        roleTitle: 'Indian Dhol War Drums + Industrial Sub-Bass Drone (<165Hz)',
        stackModel: 'DeepMind Lyria 3.5',
        status: 'COMPLETED',
        executionTimeMs: 450,
        deliverableSummary:
          'Engineered continuous 20.0s vocal-free sub-bass drone bed (+6.5dB @ 60Hz) with 0.250s qsin instrumental crossfades across all cuts.',
        technicalArtifact: 'gurkha_shashwat_subbass_bed_20s.m4a',
      },
      {
        id: 'assembly_agent',
        name: 'Master Assembly & Split-Edit Agent',
        icon: '🎬',
        roleTitle: 'Master A (Continuous 1:1) & Master B (Split-Edit L/J-Cut Bridge)',
        stackModel: 'FFmpeg 30fps CFR Master',
        status: 'COMPLETED',
        executionTimeMs: 520,
        deliverableSummary:
          'Rendered 1920x1080 @ 30fps CFR Master A and Master B with burnt-in Hindi + English cinema subtitles and zero frame drift.',
        technicalArtifact: 'project_gurkha_master_A_and_B.mp4',
      },
    ],
    castList: [
      {
        name: 'Agent Kiara (Elena)',
        role: 'Lead Undercover Tactical Intelligence Operative',
        demography: '26yo Indian Covert Operative (Dark Brunette, Left Frame)',
        portraitUrl: '/assets/swarm/gurkha_undercover_anchor_1_lyari.jpg',
        wardrobeSpec: 'Undercover Royal-Blue High-Neck Silk Halter Evening Top + Gold Hoop Earrings + Green Holographic Pupil HUD',
      },
      {
        name: 'Agent Vani (Valentina)',
        role: 'Lead Undercover Cyber-Warfare & CQC Specialist',
        demography: '26yo Indian Covert Operative (Golden-Blonde, Right Frame)',
        portraitUrl: '/assets/swarm/gurkha_undercover_anchor_2_bunker.jpg',
        wardrobeSpec: 'Undercover Coral-Red High-Neck Silk Halter Evening Top + Gold Hoop Earrings + Tactical Comms',
      },
    ],
    locationVault: {
      name: 'Lyari Cyber-State Syndicate Penthouse & Subterranean Server Core',
      architectureStyle: 'Brutalist Concrete Command Bunker meets Rain-Slicked Neon Cyberpunk Mega-Slum',
      lightingAtmosphere: 'Anamorphic Teal Rain Neon, Stark Amber Bunker Overhead, Flashing Crimson CQC Alarms',
      acousticReverbProfile: 'Wet Urban Exterior Reflection transitioning to Heavy Concrete Subterranean Chamber',
    },
    propManifest: [
      {
        id: 'prop_hud',
        name: 'Biometric Retinal HUD Lenses',
        materialShader: 'Subsurface Green Holographic Emission Reflection',
        macroDetail: 'Real-time radar lock telemetry reflected across pupils in Act I',
      },
      {
        id: 'prop_terminal',
        name: 'Syndicate Quantum Server Core',
        materialShader: 'Brushed Steel & Obsidian Glass with Flashing Crimson LEDs',
        macroDetail: 'Counter-virus upload interface surrounded by slow-motion sparks in Act III',
      },
    ],
    scoreSpec: {
      engine: 'Shashwat Sachdev Sonic DNA (Uri / Dhurandhar Style Hybrid Score)',
      bpm: 128,
      keySignature: 'D Minor',
      vocalPolicy: 'STRICT_INSTRUMENTAL_NO_SINGING',
      instruments: ['Heavy Indian Dhol & Tabla War Drums', '60Hz Analog Sub-Bass Drone', 'Haunting Bansuri Flute', 'Distorted Industrial Brass'],
      integratedLufs: -14.0,
      sidechainDuckingDb: -12.0,
    },
    shots: [
      {
        shotNumber: 1,
        actTitle: 'ACT I: INFILTRATION (VIP SYNDICATE TERRACE)',
        startSec: 0,
        endSec: 5,
        durationSec: 5,
        cameraLens: '35mm Anamorphic Wide (f/1.8)',
        cameraMovement: 'Slow Push-In on Rain-Slicked Terrace',
        eyelineDirection: 'DIRECT_TO_LENS',
        mouthLockState: 'ON_CAMERA_NATIVE_VEO_SPEAKING_LIP_SYNC',
        characterName: 'Agents Kiara & Vani',
        characterPortraitUrl: '/assets/swarm/gurkha_undercover_anchor_1_lyari.jpg',
        propFocus: 'Green Holographic Pupil HUD & Rain-Slicked Urdu Neon Skyline',
        voiceoverLine: 'System lock ho chuka hai. Radar par hum invisible hain, ab asli khel shuru hoga!',
        lyriaScoreCue: 'Deep 60Hz sub-bass drone + haunting bansuri flute & cyber-industrial pulse',
        veoPrompt: 'Undercover operatives in royal-blue and coral-red silk halter tops on rain-slicked terrace speaking modern Hindi.',
      },
      {
        shotNumber: 2,
        actTitle: 'ACT II: THE TRAP (BRUTALIST COMMAND VAULT)',
        startSec: 5,
        endSec: 10,
        durationSec: 5,
        cameraLens: '50mm Anamorphic MCU (f/2.0)',
        cameraMovement: 'Locked-Off Tension Framing Across Steel Desk',
        eyelineDirection: 'DIRECT_TO_LENS',
        mouthLockState: 'ON_CAMERA_NATIVE_VEO_SPEAKING_LIP_SYNC',
        characterName: 'Agents Kiara & Vani',
        characterPortraitUrl: '/assets/swarm/gurkha_undercover_anchor_2_bunker.jpg',
        propFocus: 'Subterranean Steel Command Desk & Green Server Racks',
        voiceoverLine: 'Machli ki baat mat karo General! Hum toh shikaari hain, aur shikaari ghar mein ghus kar shikaar karta hai!',
        lyriaScoreCue: 'Ticking mechanical clock tension + ominous low brass swell',
        veoPrompt: 'Undercover operatives in royal-blue and coral-red silk halter tops inside concrete command bunker speaking modern Hindi.',
      },
      {
        shotNumber: 3,
        actTitle: 'ACT III: THE ACTION BURST (CRIMSON SERVER CORE CQC)',
        startSec: 10,
        endSec: 15,
        durationSec: 5,
        cameraLens: '28mm Dynamic Wide Oner (f/2.2)',
        cameraMovement: 'High-Energy Combat Tracking Under Flashing Alarms',
        eyelineDirection: 'DIRECT_TO_LENS',
        mouthLockState: 'ON_CAMERA_NATIVE_VEO_SPEAKING_LIP_SYNC',
        characterName: 'Agents Kiara & Vani',
        characterPortraitUrl: '/assets/swarm/gurkha_undercover_anchor_3_cqc.jpg',
        propFocus: 'Flashing Crimson Emergency Alarms, Flying Sparks & Shattered Glass',
        voiceoverLine: 'Koi bachna nahi chahiye! Counter-virus terminal mein upload karo, abhi!',
        lyriaScoreCue: 'Explosive Indian Dhol war drums + distorted industrial synth bass drop',
        veoPrompt: 'Undercover operatives in royal-blue and coral-red silk halter tops in crimson emergency server core speaking modern Hindi.',
      },
      {
        shotNumber: 4,
        actTitle: 'ACT IV: EXTRACTION CLIMAX (ROOFTOP PLASMA DETONATION)',
        startSec: 15,
        endSec: 20,
        durationSec: 5,
        cameraLens: '40mm Heroic Anamorphic Close-Up (f/2.0)',
        cameraMovement: 'Heroic Slow-Motion Low-Angle Push',
        eyelineDirection: 'DIRECT_TO_LENS',
        mouthLockState: 'ON_CAMERA_NATIVE_VEO_SPEAKING_LIP_SYNC',
        characterName: 'Agents Kiara & Vani',
        characterPortraitUrl: '/assets/swarm/gurkha_undercover_anchor_4_climax.jpg',
        propFocus: 'Orange & Electric-Blue Plasma Skyscraper Fireball in Rain',
        voiceoverLine: 'Mission complete. Yeh toh bas trailer tha, asli toofan abhi baaki hai!',
        lyriaScoreCue: 'Triumphant brass crescendo + thunderous sub-bass impact',
        veoPrompt: 'Undercover operatives in royal-blue and coral-red silk halter tops on rooftop helipad with plasma explosion speaking modern Hindi.',
      },
    ],
    cfrBroadcastSpec: {
      fps: 30,
      timescale: 30000,
      audioSampleRateHz: 48000,
      maxDriftMs: 0,
    },
  },
};

export interface SwarmAudioVoiceSample {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  previewAudioUrl: string;
}

export interface SwarmBgmScoreSample {
  id: string;
  title: string;
  subtitle: string;
  bpm: number;
  key: string;
  description: string;
  previewAudioUrl: string;
}

export const SWARM_AUDIO_VOICE_SAMPLES: SwarmAudioVoiceSample[] = [
  {
    id: 'native_veo_speech',
    title: 'Native Veo 3.1 On-Camera Speech (Lip-Sync)',
    subtitle: 'Gianluigi Moretti Native Live Voice',
    badge: 'DEFAULT • 100% LIP-SYNC',
    description:
      'Gianluigi’s live on-camera speaking voice generated natively alongside the video frames by Google Veo 3.1 (-14.0 LUFS).',
    previewAudioUrl: '/assets/swarm/swarm_voiceover_dialogue_master.wav',
  },
  {
    id: 'charon_baritone_vo',
    title: 'Cinema Trailer Baritone (Charon Voice)',
    subtitle: 'Deep Hollywood Trailer Narration',
    badge: 'GEMINI TTS • CHARON',
    description:
      'Gravelly, authoritative cinema trailer baritone voiceover narration synthesized via Google Gemini 2.5 Flash TTS (-13.5 LUFS).',
    previewAudioUrl: '/assets/swarm/swarm_voiceover_dialogue_master.wav',
  },
  {
    id: 'fenrir_storyteller_vo',
    title: 'Warm Artisan Storyteller (Fenrir Voice)',
    subtitle: 'Intimate Documentary Narration',
    badge: 'GEMINI TTS • FENRIR',
    description:
      'Warm, passionate Neapolitan culinary documentary storyteller voiceover narration with rich vocal formant warmth (-14.0 LUFS).',
    previewAudioUrl: '/assets/swarm/swarm_voiceover_fenrir_master.wav',
  },
  {
    id: 'pure_cinema_instrumental',
    title: 'Pure Cinema Foley & Music (Zero Speech)',
    subtitle: 'Diegetic Kitchen Foley + Music Stem',
    badge: 'INSTRUMENTAL ONLY',
    description:
      'Mutes spoken dialogue to showcase pure Neapolitan kitchen foley (flour, dough, splashing tomatoes, roaring fire) with full background music.',
    previewAudioUrl: '/assets/stems/lyria_symphonic_score_92bpm.mp3',
  },
  {
    id: 'custom_uploaded_voice',
    title: '📁 Upload Custom Song / Vocal Track (MP3/WAV • No Lyria)',
    subtitle: 'Bring Your Own Singing / Dialogue / Vocal Stem',
    badge: 'CUSTOM UPLOAD • 100% NON-LYRIA',
    description:
      'Upload any custom vocal performance, commercial song track, Suno/Udio singing stem, or recorded dialogue WAV/MP3 directly from disk.',
    previewAudioUrl: '/assets/swarm/swarm_voiceover_dialogue_master.wav',
  },
];

export const SWARM_BGM_SCORE_SAMPLES: SwarmBgmScoreSample[] = [
  {
    id: 'no_bgm_silent',
    title: '🔇 Silence / No Background Music (Pure Dialogue & Foley Only)',
    subtitle: '100% Unscored Diegetic Kitchen Soundscape',
    bpm: 0,
    key: 'Unscored / Pure Cinema',
    description:
      'Completely silences all background music scores. Leaves only Gianluigi Moretti’s authentic spoken voice and raw 900°F Neapolitan brick oven foley.',
    previewAudioUrl: '/assets/swarm/swarm_voiceover_dialogue_master.wav',
  },
  {
    id: 'custom_uploaded_bgm',
    title: '📁 Upload Custom Song / Soundtrack MP3/WAV (100% Non-Lyria)',
    subtitle: 'Upload Any Commercial Song, Instrumental, or Custom Stem',
    bpm: 120,
    key: 'Custom Audio / Non-Lyria',
    description:
      'Bypass Lyria completely: upload your own custom MP3/WAV song, licensed soundtrack, or acoustic guitar stem with automatic sidechain ducking under speech.',
    previewAudioUrl: '/assets/stems/master_soundtrack_original.mp3',
  },
  {
    id: 'native_veo_diegetic_music',
    title: '🎸 Native Veo 3.1 Diegetic Room Music & Singing ([0:a])',
    subtitle: 'Generated Directly Inside Veo 3.1 Multimodal Stream',
    bpm: 95,
    key: 'Diegetic Room Acoustics',
    description:
      'Uses Google Veo 3.1’s native joint audio-video diffusion stream ([0:a]) to generate room acoustics, diegetic kitchen radio music, and on-camera vocal singing without Lyria.',
    previewAudioUrl: '/assets/swarm/swarm_voiceover_fenrir_master.wav',
  },
  {
    id: 'lyria_cello_92bpm',
    title: 'Lyria 3.5 Neapolitan Cello & Nylon Guitar',
    subtitle: 'Solo Stradivarius Cello & Acoustic Guitar',
    bpm: 92,
    key: 'D Minor',
    description:
      'Reverent, dramatic Neapolitan cello ostinato with delicate nylon acoustic guitar harmonics and chamber string swells.',
    previewAudioUrl: '/assets/stems/lyria_symphonic_score_92bpm.mp3',
  },
  {
    id: 'lyria_romance_orchestra',
    title: 'Warm Italian Strings & Woodwind Symphony',
    subtitle: 'Lush Cinema Romantic Strings & Flute',
    bpm: 88,
    key: 'G Major',
    description:
      'Sweeping cinematic orchestral strings, warm concert flute, and harp arpeggios evoking classic Italian heritage cinema.',
    previewAudioUrl: '/assets/audio/music/bollywood_romance_orchestra.mp3',
  },
  {
    id: 'lyria_driving_groove_120bpm',
    title: 'Modern Culinary Pulse & Deep Groove',
    subtitle: 'Upbeat Commercial Bass & Percussion',
    bpm: 120,
    key: 'A Minor',
    description:
      'High-energy modern commercial culinary soundtrack with crisp rhythmic percussion, warm sub-bass, and atmospheric synth chords.',
    previewAudioUrl: '/assets/stems/lyria_ibiza_house_120bpm.mp3',
  },
  {
    id: 'lyria_epic_cinema_80bpm',
    title: 'Epic Vesuvian Brass & Gran Cassa Swells',
    subtitle: 'Theatrical Low Brass & Timpani Impacts',
    bpm: 80,
    key: 'C Minor',
    description:
      'Monumental theatrical brass swells, deep concert gran cassa impacts, and soaring tension strings for high-drama hearth scenes.',
    previewAudioUrl: '/assets/stems/master_soundtrack_original.mp3',
  },
];

export function compileSwarmProductionPlan(presetId = 'cathedral_of_crust'): SwarmFilmProductionPlan {
  return SWARM_PRODUCTION_PRESETS[presetId] || SWARM_PRODUCTION_PRESETS.cathedral_of_crust;
}
