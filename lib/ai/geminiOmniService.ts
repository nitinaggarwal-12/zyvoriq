import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export interface GeminiOmniGenerationOptions {
  aspectRatio?: "16:9" | "9:16" | "1:1";
  durationSeconds?: number; // 3 to 10 seconds
  inputVideoUri?: string;
  referenceImageBase64?: string;
  modelTier?: "flash" | "preview";
}

export interface GeminiOmniVideoResult {
  buffer: Buffer;
  durationSeconds: number;
  mimeType: string;
  modelName: string;
  interactionId: string;
  synthIdWatermark: boolean;
  c2paManifest: boolean;
}

/**
 * Generates video with native synchronized audio using Google DeepMind's Gemini Omni family
 * (gemini-omni-1.1-flash / gemini-omni-flash-preview) via Google's Interactions API.
 */
export async function generateGeminiOmniVideo(
  prompt: string,
  options: GeminiOmniGenerationOptions = {}
): Promise<GeminiOmniVideoResult> {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY or GOOGLE_API_KEY is required for Gemini Omni video generation.");
  }

  const modelName = options.modelTier === "preview"
    ? "models/gemini-omni-flash-preview"
    : "models/gemini-omni-1.1-flash";

  const targetDuration = Math.min(10, Math.max(3, options.durationSeconds || 8));
  const aspectRatio = options.aspectRatio || "16:9";

  // Build the prompt with duration & aspect ratio instructions
  const enrichedPrompt = `${prompt.trim()}. Duration: ${targetDuration} seconds, Aspect ratio: ${aspectRatio}, 24fps high resolution with natively synchronized spatial audio.`;

  console.log(`[gemini-omni] Dispatching to ${modelName} via Interactions API...`);

  const inputPayload = options.referenceImageBase64
    ? [
        { type: "text", text: enrichedPrompt },
        { type: "image", data: options.referenceImageBase64, mime_type: "image/jpeg" }
      ]
    : enrichedPrompt;

  const requestBody: Record<string, any> = {
    model: modelName,
    input: inputPayload,
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/interactions?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Gemini Omni API error (${response.status}): ${errText.slice(0, 300)}`);
  }

  const data = await response.json();
  const interactionId = data.id || `omni_${Date.now()}`;

  // Find the video data in steps or outputs
  let videoBuffer: Buffer | null = null;
  let fileUri: string | null = null;

  // Case 1: Base64 data embedded directly in steps
  if (Array.isArray(data.steps)) {
    for (const step of data.steps) {
      if (Array.isArray(step.content)) {
        for (const item of step.content) {
          if (item.data && (item.mime_type?.includes("video") || item.type === "video")) {
            videoBuffer = Buffer.from(item.data, "base64");
            break;
          }
          if (item.uri && (item.mime_type?.includes("video") || item.type === "video")) {
            fileUri = item.uri;
          }
        }
      }
      if (videoBuffer) break;
    }
  }

  // Case 2: In outputs
  if (!videoBuffer && Array.isArray(data.outputs)) {
    for (const out of data.outputs) {
      if (out.video?.uri) {
        fileUri = out.video.uri;
      }
    }
  }

  // Case 3: Download from file URI if not embedded as base64
  if (!videoBuffer && fileUri) {
    console.log(`[gemini-omni] Downloading video from URI: ${fileUri}`);
    const separator = fileUri.includes("?") ? "&" : "?";
    const dlRes = await fetch(`${fileUri}${separator}key=${apiKey}`);
    if (!dlRes.ok) {
      throw new Error(`Failed to download Gemini Omni video from ${fileUri}: HTTP ${dlRes.status}`);
    }
    videoBuffer = Buffer.from(await dlRes.arrayBuffer());
  }

  if (!videoBuffer || videoBuffer.length === 0) {
    throw new Error(`Gemini Omni completed but returned no video stream: ${JSON.stringify(data).slice(0, 400)}`);
  }

  console.log(`[gemini-omni] Successfully received ${videoBuffer.length} bytes from ${modelName}`);

  return {
    buffer: videoBuffer,
    durationSeconds: targetDuration,
    mimeType: "video/mp4",
    modelName,
    interactionId,
    synthIdWatermark: true,
    c2paManifest: true,
  };
}
