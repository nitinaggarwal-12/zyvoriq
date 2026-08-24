import { NextResponse } from "next/server";
import { audioNarrationService } from "@/lib/audio/audioNarrationService";

export async function GET() {
  return NextResponse.json({
    totalCombinations: 4000,
    neuralBases: ["Charon", "Aoede", "Puck", "Kore", "Fenrir"],
    globalAccents: audioNarrationService.globalAccents,
    archetypes: audioNarrationService.archetypes,
    languages: audioNarrationService.supportedLanguages,
    featuredVoices: audioNarrationService.getVoiceCatalog()
  });
}
