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

export interface VeoReferenceImage {
  bytesBase64Encoded: string;
  mimeType?: string;
  referenceType?: "asset" | "style" | "character";
}

export interface VeoOptions {
  durationSeconds?: number;
  aspectRatio?: "16:9" | "9:16" | "1:1";
  modelTier?: "fast" | "quality" | "lite";
  chainCycles?: number; // 1 to 20 cycles (up to 168s continuous)
  inputVideoUri?: string;
  lastFrameConditioning?: string; // base64 frame for temporal continuity
  referenceImages?: (string | VeoReferenceImage)[]; // up to 3 canonical reference images
  promptBeats?: string[];
  onProgress?: (progress: VeoGenerationProgress) => void;
}

export interface VeoVideoBytes {
  buffer: Buffer;
  requestedGenerationDurationSec: 4 | 6 | 8;
  fileSize: number;
  operationName: string;
  modelName: string;
  cycleIndex?: number;
  totalCycles?: number;
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

  // Token safety constraint: Prompt must strictly not exceed 1,024 tokens (~700 words max)
  const promptWords = (prompt || "").trim().split(/\s+/);
  const clampedPrompt = promptWords.length > 700 ? promptWords.slice(0, 700).join(" ") : prompt;

  const instance: Record<string, any> = { prompt: clampedPrompt };

  // Prepare referenceImages if provided (up to 3 images, asset referenceType)
  let hasReferenceImages = false;
  if (options.referenceImages && options.referenceImages.length > 0) {
    const formattedRefs = options.referenceImages.slice(0, 3).map((ref) => {
      if (typeof ref === "string") {
        return {
          image: { bytesBase64Encoded: ref, mimeType: "image/png" },
          referenceType: "asset" as const,
        };
      }
      return {
        image: {
          bytesBase64Encoded: ref.bytesBase64Encoded,
          mimeType: ref.mimeType || "image/png",
        },
        referenceType: ref.referenceType || "asset",
      };
    });
    if (formattedRefs.length > 0) {
      instance.referenceImages = formattedRefs;
      hasReferenceImages = true;
    }
  }

  if (!hasReferenceImages) {
    if (options.lastFrameConditioning) {
      instance.image = { bytesBase64Encoded: options.lastFrameConditioning };
    } else if (options.inputVideoUri) {
      instance.video = { uri: options.inputVideoUri };
    }
  }

  // Google Veo 3.1 requires durationSeconds to be exactly 4, 6, or 8.
  // When referenceImages are present, Veo strictly requires durationSeconds = 8.
  const rawDur = Math.round(options.durationSeconds || 8);
  const durationSeconds: 4 | 6 | 8 = hasReferenceImages
    ? 8
    : (rawDur <= 5 ? 4 : rawDur <= 7 ? 6 : 8);
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
        instances: [instance],
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

export interface VeoChainedResult {
  videoUrls: string[];
  totalCycles: number;
  totalDurationSec: number;
  fileSizes: number[];
  operationNames: string[];
}

/**
 * Generates continuous cinematic video footage by recursively chaining Veo 3.1 diffusion cycles.
 * Supports up to 20 cycles (160–168 seconds) with temporal continuity.
 */
export async function generateVeoRecursiveChainedVideo(
  masterPrompt: string,
  options: VeoOptions = {}
): Promise<VeoChainedResult> {
  const totalCycles = Math.min(20, Math.max(1, options.chainCycles || 1));
  const beats = options.promptBeats || [];
  const videoUrls: string[] = [];
  const fileSizes: number[] = [];
  const operationNames: string[] = [];
  let totalDurationSec = 0;

  for (let cycle = 1; cycle <= totalCycles; cycle++) {
    const cyclePrompt = beats[cycle - 1]
      ? `${masterPrompt}. Beat ${cycle}/${totalCycles}: ${beats[cycle - 1]}`
      : `${masterPrompt} (Continuous Sequence Cycle ${cycle}/${totalCycles})`;

    options.onProgress?.({
      stage: "diffusing",
      message: `Executing Veo 3.1 Chaining Cycle [${cycle}/${totalCycles}]...`,
      percent: Math.round(((cycle - 1) / totalCycles) * 100),
      elapsedSeconds: 0
    });

    const singleResult = await generateVeoVideo(cyclePrompt, {
      ...options,
      durationSeconds: 8,
      chainCycles: 1,
      referenceImages: options.referenceImages,
    });

    videoUrls.push(singleResult.videoUrl);
    fileSizes.push(singleResult.fileSize);
    operationNames.push(singleResult.operationName);
    totalDurationSec += singleResult.duration;
  }

  return {
    videoUrls,
    totalCycles,
    totalDurationSec,
    fileSizes,
    operationNames
  };
}
