export interface KeyEntry {
  id: string;
  name: string;
  key: string;
  masked: string;
  status: "alive" | "dead" | "testing" | "rate_limited" | "unknown";
  latencyMs?: number;
  lastChecked?: string;
  error?: string;
  tier?: string;
}

export const STORAGE_KEY = "zyvoriq_gemini_api_key_pool";

export function getStoredKeyPool(): KeyEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveStoredKeyPool(pool: KeyEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pool));
  
  // Set the primary alive key into cookie
  const activeKey = pool.find(k => k.status === "alive") || pool[0];
  if (activeKey) {
    document.cookie = `zyvoriq_gemini_api_key=${activeKey.key}; path=/; max-age=31536000; SameSite=Strict`;
  } else {
    document.cookie = "zyvoriq_gemini_api_key=; path=/; max-age=0";
  }
}

export function maskKey(key: string): string {
  if (!key) return "••••••••";
  if (key.length <= 8) return "••••••••";
  return key.slice(0, 6) + "••••••••••••••••" + key.slice(-4);
}

export async function testSingleKey(key: string): Promise<{ status: "alive" | "dead" | "rate_limited"; latencyMs: number; error?: string; tier?: string }> {
  const startTime = performance.now();
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${key.trim()}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "ping" }] }]
        })
      }
    );

    const latencyMs = Math.round(performance.now() - startTime);

    if (res.ok || res.status === 200 || res.status === 400) {
      return {
        status: "alive",
        latencyMs,
        tier: "Veo 3.1 & Gemini 2.5 TTS"
      };
    } else if (res.status === 429) {
      return {
        status: "rate_limited",
        latencyMs,
        error: "Quota / Rate Limit Exceeded (429)"
      };
    } else {
      const err = await res.json().catch(() => ({}));
      return {
        status: "dead",
        latencyMs,
        error: err.error?.message || `HTTP ${res.status} Unauthorized`
      };
    }
  } catch (e: any) {
    return {
      status: "dead",
      latencyMs: Math.round(performance.now() - startTime),
      error: e.message || "Network Error"
    };
  }
}
