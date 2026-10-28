import { execFileSync } from "node:child_process";

let cachedAccessToken = "";
let cachedTokenExpiresAt = 0;

export async function getGcpAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedAccessToken && now < cachedTokenExpiresAt) {
    return cachedAccessToken;
  }

  // 1. Try Cloud Run / GCE Metadata Server first (fast 600ms timeout)
  try {
    const metaRes = await fetch(
      "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token",
      {
        headers: { "Metadata-Flavor": "Google" },
        signal: AbortSignal.timeout(600),
      }
    );
    if (metaRes.ok) {
      const metaJson = (await metaRes.json()) as {
        access_token?: string;
        expires_in?: number;
      };
      if (metaJson.access_token) {
        cachedAccessToken = metaJson.access_token;
        cachedTokenExpiresAt =
          now + Math.max(60, (metaJson.expires_in || 1800) - 120) * 1000;
        return cachedAccessToken;
      }
    }
  } catch {
    // Not on GCE/Cloud Run; fall back to local gcloud ADC
  }

  // 2. Try local gcloud CLI token
  for (const cmd of [
    ["auth", "print-access-token"],
    ["auth", "application-default", "print-access-token"],
  ]) {
    try {
      const out = execFileSync("gcloud", cmd, {
        encoding: "utf8",
        timeout: 3500,
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
      if (out && out.length > 20) {
        cachedAccessToken = out;
        cachedTokenExpiresAt = now + 40 * 60 * 1000;
        return cachedAccessToken;
      }
    } catch {
      // try next
    }
  }

  return "";
}

export async function callGeminiJsonViaAdcOrApiKey<T = Record<string, unknown>>(params: {
  prompt: string;
  apiKey?: string;
  temperature?: number;
  timeoutMs?: number;
  modelPreference?: "flash" | "pro";
}): Promise<{ parsed: T | null; modelUsed: string; latencyMs: number }> {
  const t0 = Date.now();
  const temperature = params.temperature ?? 0.55;
  const timeoutMs = params.timeoutMs ?? 14000;
  const cleanKey = (params.apiKey || "").trim();
  const hasLiveApiKey =
    cleanKey.startsWith("AIza") || cleanKey.startsWith("AQ.");

  // 1. If a real Gemini API Key is present, try generativelanguage.googleapis.com first
  if (hasLiveApiKey) {
    const models =
      params.modelPreference === "pro"
        ? ["models/gemini-2.5-pro", "models/gemini-2.5-flash"]
        : ["models/gemini-3.8-flash", "models/gemini-2.5-flash"];
    for (const modelName of models) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${cleanKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: params.prompt }] }],
              generationConfig: {
                temperature,
                responseMimeType: "application/json",
              },
            }),
            signal: AbortSignal.timeout(timeoutMs),
          }
        );
        if (res.ok) {
          const data = await res.json();
          const raw =
            data?.candidates?.[0]?.content?.parts
              ?.filter(
                (p: { thought?: boolean; text?: string }) =>
                  !p.thought && typeof p.text === "string"
              )
              ?.map((p: { text?: string }) => p.text || "")
              .join("") || "";
          const cleaned = raw
            .replace(/^```json\s*/i, "")
            .replace(/```\s*$/i, "")
            .trim();
          if (cleaned) {
            return {
              parsed: JSON.parse(cleaned) as T,
              modelUsed: modelName,
              latencyMs: Date.now() - t0,
            };
          }
        }
      } catch {
        // fall through to Vertex AI ADC
      }
    }
  }

  // 2. Call Vertex AI Global Endpoint in ramp-portal-dev via ADC / Metadata Server
  const accessToken = await getGcpAccessToken();
  if (accessToken) {
    const projectId = process.env.GCP_PROJECT_ID || "ramp-portal-dev";
    const vertexModels =
      params.modelPreference === "pro"
        ? ["gemini-2.5-pro", "gemini-2.5-flash"]
        : ["gemini-2.5-flash"];
    for (const vModel of vertexModels) {
      try {
        const res = await fetch(
          `https://aiplatform.googleapis.com/v1/projects/${projectId}/locations/global/publishers/google/models/${vModel}:generateContent`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
              "x-goog-user-project": projectId,
            },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: params.prompt }] }],
              generationConfig: {
                temperature,
                responseMimeType: "application/json",
              },
            }),
            signal: AbortSignal.timeout(timeoutMs),
          }
        );
        if (res.ok) {
          const data = await res.json();
          const raw =
            data?.candidates?.[0]?.content?.parts
              ?.filter(
                (p: { thought?: boolean; text?: string }) =>
                  !p.thought && typeof p.text === "string"
              )
              ?.map((p: { text?: string }) => p.text || "")
              .join("") || "";
          const cleaned = raw
            .replace(/^```json\s*/i, "")
            .replace(/```\s*$/i, "")
            .trim();
          if (cleaned) {
            return {
              parsed: JSON.parse(cleaned) as T,
              modelUsed: `vertex-ai/${vModel}`,
              latencyMs: Date.now() - t0,
            };
          }
        }
      } catch {
        // try next model
      }
    }
  }

  return { parsed: null, modelUsed: "deterministic-fallback", latencyMs: Date.now() - t0 };
}

export async function synthesizeSpeechMp3ViaAdc(params: {
  text: string;
  voiceName?: string;
  speakingRate?: number;
}): Promise<Buffer | null> {
  const cleanText = String(params.text || "")
    .replace(/^\[[^\]]+\]\s*/, "")
    .replace(/["“”]/g, "")
    .trim();
  if (!cleanText) return null;

  const accessToken = await getGcpAccessToken();
  if (!accessToken) return null;

  const projectId = process.env.GCP_PROJECT_ID || "ramp-portal-dev";
  const voiceName = params.voiceName || "en-US-Journey-D";

  try {
    const res = await fetch(
      "https://texttospeech.googleapis.com/v1/text:synthesize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-goog-user-project": projectId,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: { text: cleanText },
          voice: {
            languageCode: "en-US",
            name: voiceName,
          },
          audioConfig: {
            audioEncoding: "MP3",
            speakingRate: params.speakingRate ?? 1.04,
            sampleRateHertz: 48000,
          },
        }),
        signal: AbortSignal.timeout(7000),
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { audioContent?: string };
    if (data?.audioContent) {
      return Buffer.from(data.audioContent, "base64");
    }
  } catch {
    return null;
  }
  return null;
}
