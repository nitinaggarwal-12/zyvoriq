// @ts-ignore
import { characterLibrary as mjsLib } from "./characterLibrary.mjs";

export interface LibraryCharacter {
  id: string;
  displayName: string;
  archetype: string;
  description: string;
  gender?: string;
  era?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  language?: string;
  category?: string; // 'creator' | 'cinema' | 'fashion'
  defaultVoiceId?: string;
  validationStatus: "UNVALIDATED" | "VALIDATED" | "RAI_BLOCKED";
  validationError?: string;
  validatedAt?: string;
  wardrobe: WardrobeVariant[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WardrobeVariant {
  id: string;
  characterId: string;
  label: string;
  sheetUris: string[]; // max 3, single subject
  isDefault: boolean;
  createdAt?: string;
}

export interface CreateCharacterInput {
  id?: string;
  displayName: string;
  archetype: string;
  description: string;
  gender?: string;
  era?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  language?: string;
  category?: string;
  defaultVoiceId?: string;
  wardrobe?: Array<{
    id?: string;
    label: string;
    sheetUris: string[];
    isDefault?: boolean;
  }>;
  validationStatus?: "UNVALIDATED" | "VALIDATED" | "RAI_BLOCKED";
}

export interface CharacterLibraryAPI {
  list(filters?: {
    era?: string;
    gender?: string;
    country?: string;
    countryCode?: string;
    region?: string;
    language?: string;
    category?: string;
    validatedOnly?: boolean;
  }): Promise<LibraryCharacter[]>;
  get(id: string): Promise<LibraryCharacter | null>;
  create(input: CreateCharacterInput): Promise<LibraryCharacter>;
  addWardrobe(characterId: string, label: string, sheetUris: string[], isDefault?: boolean): Promise<WardrobeVariant>;
  markValidated(id: string): Promise<void>;
  markBlocked(id: string, error: string): Promise<void>;
  delete(id: string): Promise<void>;
  resolveWardrobe(characterId: string, wardrobeId?: string): Promise<{
    sheetUris: string[];
    archetype: string;
    voiceId: string;
    displayName: string;
  }>;
  resolveWardrobeForLocation(characterId: string, locationKeyword?: string): Promise<{
    variant: WardrobeVariant | null;
    sheetUris: string[];
    archetype: string;
    voiceId: string;
    displayName: string;
    matchedLabel: string;
  }>;
}

export const characterLibrary: CharacterLibraryAPI = mjsLib as unknown as CharacterLibraryAPI;
