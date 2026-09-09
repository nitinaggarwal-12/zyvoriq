// @ts-ignore
import { locationLibrary as mjsLib } from "./locationLibrary.mjs";

export interface LibraryLocation {
  id: string;
  displayName: string;
  environmentBlock: string; // The verbatim string. Never rewritten or regenerated.
  establishingUri?: string;
  era?: string;
  timeOfDay?: string;
  createdAt?: string;
}

export interface CreateLocationInput {
  id?: string;
  displayName: string;
  environmentBlock: string;
  establishingUri?: string;
  era?: string;
  timeOfDay?: string;
}

export interface LocationLibraryAPI {
  list(filters?: { era?: string; timeOfDay?: string }): Promise<LibraryLocation[]>;
  get(id: string): Promise<LibraryLocation | null>;
  create(input: CreateLocationInput): Promise<LibraryLocation>;
  delete(id: string): Promise<void>;
}

export const locationLibrary: LocationLibraryAPI = mjsLib as unknown as LocationLibraryAPI;
