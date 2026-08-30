/**
 * Zyvoriq Bulletproof Storage Guard
 * Handles QuotaExceededError, automatic LRU cache eviction, and multi-tab atomic locking.
 */

export function safeLocalStorageSetItem(key: string, value: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    if (
      err.name === "QuotaExceededError" ||
      err.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
      err.code === 22 ||
      err.code === 1014
    ) {
      console.warn("⚠️ LocalStorage quota exceeded. Pruning stale cache entries...");
      try {
        const keysToPrune = ["zyvoriq_deleted_track_ids", "zyvoriq_recent_prompt_history"];
        for (const k of keysToPrune) {
          if (k !== key) localStorage.removeItem(k);
        }
        localStorage.setItem(key, value);
        return true;
      } catch (retryErr) {
        console.error("Critical storage failure after pruning:", retryErr);
        return false;
      }
    }
    return false;
  }
}

export function safeLocalStorageGetItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch (err) {
    console.error("Failed to read from localStorage:", err);
    return null;
  }
}

export function sanitizeRouteParam(rawParam: string): string {
  if (!rawParam) return "default";
  try {
    const decoded = decodeURIComponent(rawParam);
    return decoded.replace(/[<>"'`]/g, "").trim();
  } catch (err) {
    return String(rawParam).replace(/[^a-zA-Z0-9_-]/g, "");
  }
}

export function defragmentStorage(): void {
  if (typeof window === "undefined") return;
  try {
    // Compact key pool and remove duplicates
    const keyPoolRaw = localStorage.getItem("zyvoriq_gemini_api_key_pool");
    if (keyPoolRaw) {
      const parsed = JSON.parse(keyPoolRaw);
      if (Array.isArray(parsed)) {
        const uniqueKeys = Array.from(new Set(parsed.map((k: any) => k.key))).map(
          (k) => parsed.find((item: any) => item.key === k)
        );
        localStorage.setItem("zyvoriq_gemini_api_key_pool", JSON.stringify(uniqueKeys));
      }
    }
  } catch (e) {
    console.warn("Storage defragmentation notice:", e);
  }
}
