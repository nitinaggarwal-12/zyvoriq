import fs from "node:fs";
import path from "node:path";

export interface VeoGenerationProgress {
  stage: "prompt" | "dispatch" | "diffusing" | "downloading" | "completed" | "error";
  message: string;
  percent: number;
  elapsedSeconds: number;
  operationName?: string;
  videoUrl?: string;
}

export interface VeoOptions {
  durationSeconds?: number;
  aspectRatio?: "16:9" | "9:16" | "1:1";
  modelTier?: "fast" | "quality" | "lite";
  onProgress?: (progress: VeoGenerationProgress) => void;
}

export interface VeoVideoBytes {
  buffer: Buffer;
  requestedGenerationDurationSec: 4 | 6 | 8;
  fileSize: number;
  operationName: string;
  modelName: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateVeoVideoBytes(
  prompt: string,
  options: VeoOptions = {}
): Promise<VeoVideoBytes> {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY or GOOGLE_API_KEY environment variable is missing on server.");
  }

  // Google Veo 3.1 requires durationSeconds to be exactly 4, 6, or 8.
  const rawDur = Math.round(options.durationSeconds || 8);
  const durationSeconds: 4 | 6 | 8 = rawDur <= 5 ? 4 : rawDur <= 7 ? 6 : 8;
  const aspectRatio = options.aspectRatio || "16:9";
  const modelName =
    options.modelTier === "quality"
      ? "veo-3.1-generate-preview"
      : options.modelTier === "lite"
      ? "veo-3.1-lite-generate-preview"
      : "veo-3.1-fast-generate-preview";

  const startTime = Date.now();
  const getElapsed = () => Math.round((Date.now() - startTime) / 1000);

  options.onProgress?.({
    stage: "dispatch",
    message: `Dispatching prompt to Google Veo 3.1 (${modelName})...`,
    percent: 10,
    elapsedSeconds: getElapsed()
  });

  const dispatchRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predictLongRunning?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { aspectRatio, durationSeconds }
      })
    }
  );

  const dispatchData = await dispatchRes.json();
  if (!dispatchRes.ok || dispatchData.error) {
    throw new Error(`Veo Dispatch Error: ${dispatchData.error?.message || `HTTP ${dispatchRes.status}`}`);
  }

  const operationName = dispatchData.name;
  if (!operationName) throw new Error(`No operation name returned from Veo API: ${JSON.stringify(dispatchData)}`);

  const maxPolls = 45;
  const pollIntervalMs = 5000;
  let videoDownloadUri: string | null = null;

  for (let poll = 1; poll <= maxPolls; poll++) {
    await sleep(pollIntervalMs);
    const elapsed = getElapsed();
    const estProgress = Math.min(92, 15 + Math.round((poll / maxPolls) * 75));
    options.onProgress?.({
      stage: "diffusing",
      message: `Veo generation in progress (${elapsed}s elapsed)...`,
      percent: estProgress,
      elapsedSeconds: elapsed,
      operationName
    });

    try {
      const pollRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${apiKey}`);
      const pollData = await pollRes.json();
      if (!pollRes.ok || pollData.error) {
        throw new Error(`Veo Polling Error: ${pollData.error?.message || `HTTP ${pollRes.status}`}`);
      }
      if (pollData.done) {
        const samples = pollData.response?.generateVideoResponse?.generatedSamples;
        videoDownloadUri = samples?.[0]?.video?.uri;
        if (!videoDownloadUri) throw new Error(`Veo completed but returned no video URI: ${JSON.stringify(pollData)}`);
        break;
      }
    } catch (error: any) {
      if (error.message?.includes("Veo Polling Error") || error.message?.includes("Veo completed")) throw error;
      console.warn(`Transient Veo poll error (poll ${poll}):`, error.message);
    }
  }

  if (!videoDownloadUri) throw new Error(`Veo video generation timed out after ${getElapsed()}s (${operationName})`);

  options.onProgress?.({
    stage: "downloading",
    message: "Downloading rendered MP4 from Google storage...",
    percent: 95,
    elapsedSeconds: getElapsed(),
    operationName
  });

  const separator = videoDownloadUri.includes("?") ? "&" : "?";
  const videoFetchRes = await fetch(`${videoDownloadUri}${separator}key=${apiKey}`);
  if (!videoFetchRes.ok) throw new Error(`Failed to download video stream: HTTP ${videoFetchRes.status}`);
  const buffer = Buffer.from(await videoFetchRes.arrayBuffer());
  if (!buffer.length) throw new Error("Veo returned an empty MP4 payload");

  return {
    buffer,
    requestedGenerationDurationSec: durationSeconds,
    fileSize: buffer.length,
    operationName,
    modelName,
  };
}

/**
 * Legacy compatibility wrapper. New Reel production code must use
 * generateVeoVideoBytes and persist through the durable Reel asset store.
 */
export async function generateVeoVideo(
  prompt: string,
  options: VeoOptions = {}
): Promise<{ videoUrl: string; duration: number; fileSize: number; operationName: string }> {
  const result = await generateVeoVideoBytes(prompt, options);
  const outDir = path.resolve(process.cwd(), "public/assets/video/generated");
  fs.mkdirSync(outDir, { recursive: true });
  const fileName = `veo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.mp4`;
  fs.writeFileSync(path.join(outDir, fileName), result.buffer);
  const publicUrl = `/api/media/video/generated/${fileName}`;

  options.onProgress?.({
    stage: "completed",
    message: "Veo video generated and stored by the legacy local wrapper.",
    percent: 100,
    elapsedSeconds: 0,
    operationName: result.operationName,
    videoUrl: publicUrl
  });

  return {
    videoUrl: publicUrl,
    duration: result.requestedGenerationDurationSec,
    fileSize: result.fileSize,
    operationName: result.operationName
  };
}
