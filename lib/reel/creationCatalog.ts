import { GLOBAL_CHARACTERS, VISUAL_AESTHETICS } from "@/lib/tier6/characters";
import { GENRE_CATEGORIES, GENRE_CLUSTERS, GENRE_CONCEPTS } from "@/lib/tier6/genre_concepts";
import type { ReelCreationIntent } from "./types";

export type ReelCreationIntentRequest = {
  mode?: "quick-brief" | "category";
  categoryId?: string;
  conceptId?: string;
  characterId?: string;
  visualStyleId?: string;
  musicPreset?: string;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function resolveReelCreationIntent(value: unknown): ReelCreationIntent | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as ReelCreationIntentRequest;
  const conceptId = clean(raw.conceptId);
  const requestedCategoryId = clean(raw.categoryId);
  const concept = conceptId ? GENRE_CONCEPTS.find(item => item.id === conceptId) : undefined;
  const categoryId = concept?.genre || requestedCategoryId;
  const category = categoryId && categoryId !== "all" ? GENRE_CATEGORIES.find(item => item.id === categoryId) : undefined;
  const clusterId = concept?.cluster || (category && category.cluster !== "all" ? category.cluster : undefined);
  const cluster = clusterId ? GENRE_CLUSTERS.find(item => item.id === clusterId) : undefined;

  const requestedCharacterId = clean(raw.characterId);
  const characterId = requestedCharacterId && requestedCharacterId !== "auto" ? requestedCharacterId : concept?.characterLock;
  const character = characterId ? GLOBAL_CHARACTERS.find(item => item.id === characterId) : undefined;

  const requestedVisualStyleId = clean(raw.visualStyleId);
  const visualStyleId = requestedVisualStyleId && requestedVisualStyleId !== "auto" ? requestedVisualStyleId : concept?.visualStyle;
  const visualStyle = visualStyleId ? VISUAL_AESTHETICS.find(item => item.id === visualStyleId) : undefined;

  const requestedMusicPreset = clean(raw.musicPreset);
  const musicPreset = requestedMusicPreset && requestedMusicPreset !== "auto" ? requestedMusicPreset : concept?.musicPreset;
  const mode = raw.mode === "category" || Boolean(category || concept) ? "category" : "quick-brief";

  return {
    mode,
    clusterId: cluster?.id,
    clusterName: cluster?.name,
    categoryId: category?.id,
    categoryLabel: category?.label,
    conceptId: concept?.id,
    conceptTitle: concept?.title,
    conceptHook: concept?.hook,
    conceptPrompt: concept?.prompt,
    conceptSpeechSample: concept?.speechSample,
    characterId: character?.id,
    characterName: character?.name,
    characterDescription: character
      ? `${character.name}; ${character.role}; ${character.location}; voice style ${character.voiceStyle}; specialty ${character.specialty}. ${character.defaultPromptDescription}`
      : undefined,
    visualStyleId: visualStyle?.id,
    visualStyleLabel: visualStyle?.label,
    visualStyleDescription: visualStyle?.description,
    musicPreset,
    narrationLanguage: "en",
  };
}
