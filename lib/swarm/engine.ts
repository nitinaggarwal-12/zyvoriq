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
  eyelineDirection: 'LEFT' | 'RIGHT' | 'DOWN_AT_CRAFT' | 'HORIZON';
  mouthLockState: 'MOUTH_CLOSED_NON_VOCAL_ACTING';
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
        actTitle: 'ACT I • THE CONSECRATION OF FLOUR',
        startSec: 0.0,
        endSec: 5.0,
        durationSec: 5.0,
        cameraLens: '35mm Anamorphic Prime (T1.8)',
        cameraMovement: 'Slow Dolly Push-In through Floating Flour Dust Shafts',
        eyelineDirection: 'DOWN_AT_CRAFT',
        mouthLockState: 'MOUTH_CLOSED_NON_VOCAL_ACTING',
        characterName: 'Gianluigi Moretti',
        characterPortraitUrl: '/assets/characters/gianluigi_moretti.jpg',
        propFocus: '72-Hour Wild Fermented Sourdough Ball & Floating Flour Clouds',
        voiceoverLine:
          'In the shadow of Vesuvius, dough is not merely baked... it is consecrated.',
        lyriaScoreCue: 'Low solo cello drone enters with delicate nylon guitar harmonics (92 BPM)',
        veoPrompt:
          'Veo 3.1 1080p Cinema Master: Inside "The Cathedral of Crust" ancient stone vault. Master Pizzaiolo Gianluigi Moretti in flour-dusted linen apron slaps and stretches 72-hour sourdough. Dramatic volumetric light beams illuminate clouds of suspended white flour. MOUTH CLOSED, NON-VOCAL DRAMATIC ACTING, zero singing, intense focus looking down at craft.',
      },
      {
        shotNumber: 2,
        actTitle: 'ACT II • ALCHEMY OF SAN MARZANO GOLD',
        startSec: 5.0,
        endSec: 10.0,
        durationSec: 5.0,
        cameraLens: '85mm Macro Cinema Prime (T1.4)',
        cameraMovement: 'Overhead Top-Down Spiral Tracking Shot',
        eyelineDirection: 'LEFT',
        mouthLockState: 'MOUTH_CLOSED_NON_VOCAL_ACTING',
        characterName: 'Giulia Romano',
        characterPortraitUrl: '/assets/characters/giulia_romano_it.jpg',
        propFocus: 'Crushed San Marzano DOP Tomato Reduction & Fior di Latte',
        voiceoverLine:
          'Seventy-two hours of wild fermentation. Hand-crushed volcanic San Marzano gold.',
        lyriaScoreCue: 'Rhythmic cello spiccato ostinato builds with warm string chords',
        veoPrompt:
          'Veo 3.1 1080p Macro Cinema: Artisan Baker Giulia Romano ladles vibrant crimson San Marzano tomato sauce in a hypnotic spiral across stretched dough, tearing fresh fior di latte mozzarella and sweet green basil leaves. MOUTH CLOSED, NON-VOCAL DRAMATIC ACTING, serene artisan precision, eyeline left.',
      },
      {
        shotNumber: 3,
        actTitle: 'ACT III • INTO THE 900°F VOLCANIC HEARTH',
        startSec: 10.0,
        endSec: 15.0,
        durationSec: 5.0,
        cameraLens: '50mm Anamorphic Lens (Amber Flare)',
        cameraMovement: 'Low-Angle Hero Tracking Slide with Copper Peel',
        eyelineDirection: 'RIGHT',
        mouthLockState: 'MOUTH_CLOSED_NON_VOCAL_ACTING',
        characterName: 'Matteo Conti',
        characterPortraitUrl: '/assets/characters/matteo_conti_it.jpg',
        propFocus: 'Hand-Forged Hammered Copper Peel & Roaring Oak Hearth Fire',
        voiceoverLine:
          'Inside a nine-hundred-degree volcanic brick vault, ancient fire meets artisan flour.',
        lyriaScoreCue: 'Orchestral brass swell and deep gran cassa impact synchronized to oven launch',
        veoPrompt:
          'Veo 3.1 1080p Cinema Action: Hearth Master Matteo Conti slides a hammered copper pizza peel into the roaring 900-degree wood-fired brick dome oven. Golden flames roll across the ceiling dome. MOUTH CLOSED, NON-VOCAL DRAMATIC ACTING, intense eyeline right toward the hearth fire.',
      },
      {
        shotNumber: 4,
        actTitle: 'ACT IV • BLISTERED OBSIDIAN PERFECTION',
        startSec: 15.0,
        endSec: 20.0,
        durationSec: 5.0,
        cameraLens: '100mm Macro Probe Lens (Inside Oven)',
        cameraMovement: 'Extreme Close-Up Slow-Motion Rise & Blister',
        eyelineDirection: 'DOWN_AT_CRAFT',
        mouthLockState: 'MOUTH_CLOSED_NON_VOCAL_ACTING',
        characterName: 'Gianluigi Moretti',
        characterPortraitUrl: '/assets/characters/gianluigi_moretti.jpg',
        propFocus: 'Leopard-Spotted Cornicione Crust Rising & Mozzarella Bubbling',
        voiceoverLine:
          'In ninety blistering seconds, crust rises like cathedral arches—leopard-spotted and molten.',
        lyriaScoreCue: 'Soaring violin counterpoint over driving cello ostinato (crescendo)',
        veoPrompt:
          'Veo 3.1 1080p Extreme Macro: Inside the glowing wood-fired brick oven, the pizza cornicione crust rapidly puffs and blisters with authentic leopard-spotted char while fior di latte bubbles and caramelizes. MOUTH CLOSED, NON-VOCAL MACRO CINEMATOGRAPHY.',
      },
      {
        shotNumber: 5,
        actTitle: 'ACT V • THE SACRED SLICE & STEAM',
        startSec: 20.0,
        endSec: 25.0,
        durationSec: 5.0,
        cameraLens: '50mm Prime (Shallow Depth of Field)',
        cameraMovement: 'Arcing 180-Degree Tabletop Reveal',
        eyelineDirection: 'LEFT',
        mouthLockState: 'MOUTH_CLOSED_NON_VOCAL_ACTING',
        characterName: 'Giulia Romano',
        characterPortraitUrl: '/assets/characters/giulia_romano_it.jpg',
        propFocus: 'Extra Virgin Olive Oil Drizzle & Crisp Crust Crackle',
        voiceoverLine:
          'Crisp obsidian char. Pillowy honeycomb crumb. A symphony of fire, water, and time.',
        lyriaScoreCue: 'Warm acoustic guitar arpeggio returns with lush string resolution',
        veoPrompt:
          'Veo 3.1 1080p Cinema Reveal: Steam billows from the freshly baked Neapolitan pizza on a dark walnut board as golden extra virgin olive oil is drizzled over glistening basil leaves. Gianluigi and Giulia inspect the crust with quiet pride. MOUTH CLOSED, NON-VOCAL DRAMATIC ACTING.',
      },
      {
        shotNumber: 6,
        actTitle: 'ACT VI • THE CATHEDRAL OF CRUST (FINALE)',
        startSec: 25.0,
        endSec: 30.0,
        durationSec: 5.0,
        cameraLens: '24mm Wide Anamorphic Master',
        cameraMovement: 'Majestic Crane Pull-Back revealing the Vault Sanctuary',
        eyelineDirection: 'HORIZON',
        mouthLockState: 'MOUTH_CLOSED_NON_VOCAL_ACTING',
        characterName: 'Gianluigi Moretti',
        characterPortraitUrl: '/assets/characters/gianluigi_moretti.jpg',
        propFocus: 'The Illuminated Vault & Artisan Crew Silhouette',
        voiceoverLine:
          'The Cathedral of Crust. No cameras. No rented sets. Crafted entirely by code.',
        lyriaScoreCue: 'Final resonant D-minor orchestral chord decay with warm cello harmonic',
        veoPrompt:
          'Veo 3.1 1080p Wide Cinema Finale: Wide crane shot pulling back through the vaulted stone arches of The Cathedral of Crust. The three master artisans stand by the glowing wood-fired hearth with the finished Neapolitan pizza illuminated like a jewel. MOUTH CLOSED, NON-VOCAL HERO TABLEAU.',
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

export function compileSwarmProductionPlan(presetId = 'cathedral_of_crust'): SwarmFilmProductionPlan {
  return SWARM_PRODUCTION_PRESETS[presetId] || SWARM_PRODUCTION_PRESETS.cathedral_of_crust;
}
