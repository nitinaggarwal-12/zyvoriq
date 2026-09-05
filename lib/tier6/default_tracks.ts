export interface SeriesTrack {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  character: string;
  videoSrc: string;
  audioSrc?: string;
  acts: any[];
  duration: number;
  veritas?: {
    status: string;
    snarkProofHash: string;
  };
  createdAt?: string;
}

// Clean Slate: No static fallback objects. All tracks must be genuinely synthesized or user-created.
export const CANONICAL_SERIES_TRACKS: SeriesTrack[] = [];
