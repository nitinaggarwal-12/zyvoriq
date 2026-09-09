export type EpisodeDurationPreset = 600 | 1200 | 1800 | 2700 | number; // 10m, 20m, 30m, 45m, or custom seconds

export interface EpisodePlanInput {
  topic: string;
  seriesTitle?: string;
  episodeTitle?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  targetDurationSec: number; // e.g., 1800 for 30 minutes
  genre?: string;
  tone?: string;
  language?: string;
  leadCharacterIds?: string[];
  locationIds?: string[];
  customCharacters?: Array<{
    name: string;
    description: string;
    wardrobe: string;
  }>;
}

export interface EpisodeChapter {
  chapterNumber: number;
  actNumber: number;
  chapterTitle: string;
  durationSec: number; // typically 180s (3m)
  locationName: string;
  locationId?: string;
  settingContext: "office" | "gym" | "pool" | "home" | "market" | "beach" | "street" | "transit" | "nightlife" | "nature";
  charactersOnScreen: Array<{
    characterId: string;
    name: string;
    wardrobeLabel: string;
    wardrobePill: string;
    emotionalState: string;
  }>;
  dramaticBeat: string;
  visualDirection: string;
  cameraMovement: string;
  dialogueExcerpts: Array<{
    speaker: string;
    text: string;
  }>;
  acousticMotif: {
    theme: string;
    tempoBpm: number;
    dynamicLevel: string;
  };
  status: "PLANNED" | "QUEUED" | "GENERATING" | "GENERATED";
  reelId?: string;
}

export interface EpisodeAct {
  actNumber: number;
  actName: string;
  targetDurationSec: number;
  dramaticObjective: string;
  narrativeTensionLevel: number; // 1 - 100
  chapters: EpisodeChapter[];
}

export interface CharacterWardrobeSchedule {
  characterId: string;
  characterName: string;
  country?: string;
  archetype?: string;
  wardrobes: Array<{
    actNumber: number;
    chapterNumber: number;
    settingContext: string;
    wardrobeLabel: string;
    visualDescription: string;
    justification: string;
  }>;
}

export interface EpisodeBlueprint {
  id: string;
  seriesTitle: string;
  episodeTitle: string;
  seasonNumber: number;
  episodeNumber: number;
  topic: string;
  genre: string;
  tone: string;
  language: string;
  targetDurationSec: number;
  formattedDuration: string; // e.g. "30 min (5 Acts • 10 Chapters)"
  totalActs: number;
  totalChapters: number;
  logline: string;
  thematicLore: string;
  acts: EpisodeAct[];
  wardrobeSchedule: CharacterWardrobeSchedule[];
  scoreLeitmotif: {
    musicalKey: string;
    tempoBpm: number;
    instrumentPalette: string[];
    moodCurve: string;
    ambientSoundDesign: string;
  };
  status: "PLANNED" | "GENERATING" | "COMPLETED";
  createdAt: string;
}

export interface EpisodeProductionRecord {
  id: string;
  series_title: string;
  episode_title: string;
  season_num: number;
  episode_num: number;
  topic: string;
  genre: string;
  target_duration_sec: number;
  actual_duration_sec: number;
  blueprint_json: EpisodeBlueprint;
  status: string;
  progress: number;
  master_video_url?: string;
  master_poster_url?: string;
  created_at: string;
  updated_at: string;
}
