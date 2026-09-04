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

import { safeLocalStorageSetItem, safeLocalStorageGetItem } from "@/lib/utils/storageGuard";

export const STORAGE_KEY = "zyvoriq_gemini_api_key_pool";

export function getStoredKeyPool(): KeyEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = safeLocalStorageGetItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveStoredKeyPool(pool: KeyEntry[]) {
  if (typeof window === "undefined") return;
  safeLocalStorageSetItem(STORAGE_KEY, JSON.stringify(pool));
  
  // Store safe status flag in cookie rather than raw secret
  const activeKey = pool.find(k => k.status === "alive") || pool[0];
  if (activeKey) {
    document.cookie = `zyvoriq_key_configured=true; path=/; max-age=31536000; SameSite=Strict`;
  } else {
    document.cookie = "zyvoriq_key_configured=; path=/; max-age=0";
  }
}

export function rotateToNextAliveKey(failedKey: string): KeyEntry | null {
  const pool = getStoredKeyPool();
  const updated = pool.map((k) =>
    k.key === failedKey ? { ...k, status: "rate_limited" as const, lastChecked: new Date().toLocaleTimeString() } : k
  );
  saveStoredKeyPool(updated);

  const nextAlive = updated.find((k) => k.status === "alive" && k.key !== failedKey);
  if (nextAlive) {
    document.cookie = `zyvoriq_key_configured=true; path=/; max-age=31536000; SameSite=Strict`;
    return nextAlive;
  }
  return null;
}

export function maskKey(key: string): string {
  if (!key) return "••••••••";
  if (key.length <= 8) return "••••••••";
  return key.slice(0, 6) + "••••••••••••••••" + key.slice(-4);
}

export async function testSingleKey(key: string): Promise<{ status: "alive" | "dead" | "rate_limited"; latencyMs: number; error?: string; tier?: string }> {
  const startTime = performance.now();
  try {
    const res = await fetch("/api/health/api-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: key.trim(),
        action: "validate"
      })
    });

    const data = await res.json().catch(() => ({}));
    const latencyMs = data.latencyMs || Math.round(performance.now() - startTime);

    if (data.status === "alive" || data.ok) {
      return {
        status: "alive",
        latencyMs,
        tier: data.tier || "Veo 3.1 & Gemini 2.5 TTS"
      };
    } else if (data.status === "rate_limited") {
      return {
        status: "rate_limited",
        latencyMs,
        error: data.error || "Quota / Rate Limit Exceeded (429)"
      };
    } else {
      return {
        status: "dead",
        latencyMs,
        error: data.error || data.message || `API error ${res.status}`
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
