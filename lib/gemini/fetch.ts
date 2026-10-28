/**
 * Shared Gemini REST transport.
 *
 * API keys travel in the `x-goog-api-key` request header — never in the URL
 * query string, because query strings are recorded by proxies, load balancers
 * and request logs. Every server-side call to generativelanguage.googleapis.com
 * should go through `geminiFetch` (or at least `geminiHeaders`).
 */

export const GEMINI_API_BASE = "https://generativelanguage.googleapis.com";

/** Remove any `key=` query parameter that a caller may still have appended. */
export function stripKeyQueryParam(url: string): string {
  try {
    const u = new URL(url);
    if (u.searchParams.has("key")) u.searchParams.delete("key");
    return u.toString();
  } catch {
    return url
      .replace(/([?&])key=[^&#]*&?/g, (_m, p1: string) => p1)
      .replace(/[?&]$/, "");
  }
}

export function geminiHeaders(
  apiKey: string,
  extra?: Record<string, string>
): Record<string, string> {
  return { "x-goog-api-key": apiKey, ...(extra || {}) };
}

export interface GeminiFetchInit extends Omit<RequestInit, "headers"> {
  apiKey: string;
  headers?: Record<string, string>;
}

/**
 * `fetch` wrapper that moves the API key into the `x-goog-api-key` header and
 * defaults `Content-Type: application/json` when a body is supplied.
 */
export async function geminiFetch(url: string, init: GeminiFetchInit): Promise<Response> {
  const { apiKey, headers, ...rest } = init;
  const merged: Record<string, string> = { ...(headers || {}) };
  if (rest.body !== undefined && rest.body !== null) {
    const hasContentType = Object.keys(merged).some((k) => k.toLowerCase() === "content-type");
    if (!hasContentType) merged["Content-Type"] = "application/json";
  }
  return fetch(stripKeyQueryParam(url), { ...rest, headers: geminiHeaders(apiKey, merged) });
}

/** Resolve the server-side Gemini key without logging it. */
export function resolveServerGeminiKey(): string | null {
  const key = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim();
  return key.length > 0 ? key : null;
}
