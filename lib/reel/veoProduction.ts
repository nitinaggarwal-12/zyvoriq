import crypto from "node:crypto";
import { generateVeoVideoBytes } from "@/lib/ai/veoService";
import { writeAsset } from "./assetStore";
import { probeVideoBuffer } from "./mediaProbe";
import type { ReelShot } from "./types";

export async function generateProductionShot(input: {
  productionId: string;
  shot: ReelShot;
  modelTier?: "fast" | "quality" | "lite";
}) {
  const generated = await generateVeoVideoBytes(input.shot.generationPrompt, {
    durationSeconds: input.shot.generationDurationSec,
    aspectRatio: "9:16",
    modelTier: input.modelTier || "fast",
  });

  const probe = await probeVideoBuffer(generated.buffer);
  if (probe.durationSec + 0.05 < input.shot.trimOutSec) {
    throw new Error(
      `${input.shot.id} generated ${probe.durationSec}s, shorter than required trimOut ${input.shot.trimOutSec}s`
    );
  }

  const digest = crypto.createHash("sha256").update(generated.buffer).digest("hex").slice(0, 16);
  const asset = await writeAsset(
    `reels/${input.productionId}/shots/${input.shot.id}-${digest}.mp4`,
    generated.buffer
  );

  return {
    assetKey: asset.key,
    videoUrl: asset.url,
    actualDurationSec: probe.durationSec,
    operationName: generated.operationName,
    provider: "google-veo",
    model: generated.modelName,
    probe,
  };
}
