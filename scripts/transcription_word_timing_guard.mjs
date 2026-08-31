function hasTiming(node) {
  if (!node || typeof node !== "object") return false;
  const start = node.start_offset ?? node.startOffset;
  const end = node.end_offset ?? node.endOffset;
  return start !== undefined && start !== null && end !== undefined && end !== null;
}

function hasExplicitWordTiming(value) {
  if (!value || typeof value !== "object") return false;
  if (typeof value.word === "string" && value.word.trim() && hasTiming(value)) return true;
  return Object.values(value).some(child => Array.isArray(child)
    ? child.some(hasExplicitWordTiming)
    : hasExplicitWordTiming(child));
}

function sanitizeNode(value, explicitWordTimingsExist) {
  if (Array.isArray(value)) return value.map(item => sanitizeNode(item, explicitWordTimingsExist));
  if (!value || typeof value !== "object") return value;

  const copy = Object.fromEntries(Object.entries(value).map(([key, child]) => [key, sanitizeNode(child, explicitWordTimingsExist)]));
  if (typeof copy.word !== "string" && typeof copy.text === "string" && hasTiming(copy)) {
    const text = copy.text.trim();
    const isSingleToken = text.length > 0 && !/\s/u.test(text);
    if (explicitWordTimingsExist || !isSingleToken) delete copy.text;
  }
  return copy;
}

export function sanitizeTranscriptionPayload(payload) {
  const explicitWordTimingsExist = hasExplicitWordTiming(payload);
  return sanitizeNode(payload, explicitWordTimingsExist);
}

const originalFetch = globalThis.fetch?.bind(globalThis);
if (originalFetch) {
  globalThis.fetch = async function guardedFetch(input, init) {
    const response = await originalFetch(input, init);
    try {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input?.url || "";
      const body = typeof init?.body === "string" ? JSON.parse(init.body) : null;
      const isTranscription = url.includes("/v1beta/interactions") && body?.model === "gemini-3.5-transcribe";
      if (!isTranscription || !response.ok) return response;

      const payload = await response.clone().json();
      const sanitized = sanitizeTranscriptionPayload(payload);
      const headers = new Headers(response.headers);
      headers.delete("content-length");
      headers.delete("content-encoding");
      headers.set("content-type", "application/json");
      return new Response(JSON.stringify(sanitized), {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch {
      return response;
    }
  };
}
