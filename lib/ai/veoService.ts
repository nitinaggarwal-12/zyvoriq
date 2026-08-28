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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateVeoVideo(
  prompt: string,
  options: VeoOptions = {}
): Promise<{ videoUrl: string; duration: number; fileSize: number; operationName: string }> {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY or GOOGLE_API_KEY environment variable is missing on server.");
  }

  const durationSeconds = Math.max(4, Math.min(8, Math.round(options.durationSeconds || 8)));
  const aspectRatio = options.aspectRatio || "16:9";
  const modelName =
    options.modelTier === "quality"
      ? "veo-3.1-generate-preview"
      : options.modelTier === "lite"
      ? "veo-3.1-lite-generate-preview"
      : "veo-3.1-fast-generate-preview";

  const startTime = Date.now();
  const getElapsed = () => Math.round((Date.now() - startTime) / 1000);

  if (options.onProgress) {
    options.onProgress({
      stage: "dispatch",
      message: `🚀 Dispatching prompt to Google Veo 3.1 GPU cluster (${modelName})...`,
      percent: 10,
      elapsedSeconds: getElapsed()
    });
  }

  // 1. Launch Long-Running Operation
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
  if (dispatchData.error) {
    throw new Error(`Veo Dispatch Error: ${dispatchData.error.message || JSON.stringify(dispatchData.error)}`);
  }

  const operationName = dispatchData.name;
  if (!operationName) {
    throw new Error(`No operation name returned from Veo API: ${JSON.stringify(dispatchData)}`);
  }

  // 2. Poll Operation until Completion (Up to 45 polls, ~225 seconds)
  const maxPolls = 45;
  const pollIntervalMs = 5000;
  let videoDownloadUri: string | null = null;

  for (let poll = 1; poll <= maxPolls; poll++) {
    await sleep(pollIntervalMs);
    const elapsed = getElapsed();
    const estProgress = Math.min(92, 15 + Math.round((poll / maxPolls) * 75));

    if (options.onProgress) {
      options.onProgress({
        stage: "diffusing",
        message: `⚡ Veo 3.1 Neural Diffusion in progress (${elapsed}s elapsed, 24fps motion synthesis)...`,
        percent: estProgress,
        elapsedSeconds: elapsed,
        operationName
      });
    }

    try {
      const pollRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${apiKey}`);
      const pollData = await pollRes.json();

      if (pollData.error) {
        throw new Error(`Veo Polling Error: ${pollData.error.message || JSON.stringify(pollData.error)}`);
      }

      if (pollData.done) {
        const samples = pollData.response?.generateVideoResponse?.generatedSamples;
        videoDownloadUri = samples?.[0]?.video?.uri;
        if (!videoDownloadUri) {
          throw new Error(`Veo completed but returned no video URI: ${JSON.stringify(pollData)}`);
        }
        break;
      }
    } catch (e: any) {
      if (e.message?.includes("Veo Polling Error") || e.message?.includes("Veo completed")) {
        throw e;
      }
      console.warn(`Transient Veo poll error (poll ${poll}):`, e.message);
    }
  }

  if (!videoDownloadUri) {
    throw new Error(`Veo video generation timed out after ${getElapsed()}s (${operationName})`);
  }

  // 3. Download Generated Video MP4
  if (options.onProgress) {
    options.onProgress({
      stage: "downloading",
      message: `💾 Downloading rendered 4K master MP4 from Google storage...`,
      percent: 95,
      elapsedSeconds: getElapsed()
    });
  }

  const videoFetchRes = await fetch(`${videoDownloadUri}&key=${apiKey}`);
  if (!videoFetchRes.ok) {
    throw new Error(`Failed to download video stream: HTTP ${videoFetchRes.status}`);
  }

  const arrayBuffer = await videoFetchRes.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 4. Save to public directory
  const outDir = path.resolve(process.cwd(), "public/assets/video/generated");
  fs.mkdirSync(outDir, { recursive: true });

  const fileName = `veo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.mp4`;
  const filePath = path.join(outDir, fileName);
  fs.writeFileSync(filePath, buffer);

  const publicUrl = `/api/media/video/generated/${fileName}`;

  if (options.onProgress) {
    options.onProgress({
      stage: "completed",
      message: `✨ Veo 3.1 Master Video Synthesized in ${getElapsed()}s!`,
      percent: 100,
      elapsedSeconds: getElapsed(),
      videoUrl: publicUrl
    });
  }

  return {
    videoUrl: publicUrl,
    duration: durationSeconds,
    fileSize: buffer.length,
    operationName
  };
}
