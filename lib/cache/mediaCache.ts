/**
 * ⚡ Zyvoriq Persistent Device Media Vault & Cache Engine
 * 
 * Works like WhatsApp local media persistence:
 * 1. Requests persistent OS device storage (navigator.storage.persist).
 * 2. Saves raw binary MP4 video & audio chunks into local IndexedDB and CacheStorage on the user's phone/laptop.
 * 3. Replays instantly from local device disk (via Blob URLs) even with 0 internet connection.
 * 4. Provides 1-click direct export to device Camera Roll / Downloads folder.
 */

const CACHE_NAME = "zyvoriq-media-vault-v1";
const DB_NAME = "zyvoriq_local_device_vault";
const STORE_NAME = "persisted_reels";

/** Request OS permission for persistent device storage (prevents automatic browser clearing) */
export async function enablePersistentDeviceStorage(): Promise<boolean> {
  if (typeof window !== "undefined" && navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persist();
      console.log(`[Zyvoriq Vault] Local Device Persistence: ${isPersisted ? "ENABLED (Protected from OS eviction)" : "Standard Storage"}`);
      return isPersisted;
    } catch (e) {
      console.warn("[Zyvoriq Vault] Storage persist request error:", e);
    }
  }
  return false;
}

/** Open or initialize local device IndexedDB */
function openVaultDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      return reject(new Error("IndexedDB not supported on this platform"));
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "url" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Retrieve video/audio from local device storage as an instant local Blob URL */
export async function getCachedMediaBlobUrl(url: string): Promise<string> {
  if (typeof window === "undefined") return url;
  if (!url || url.startsWith("blob:") || url.startsWith("data:")) return url;

  try {
    // 1. Try local IndexedDB binary store
    const db = await openVaultDB().catch(() => null);
    if (db) {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const record = await new Promise<any>((resolve) => {
        const req = store.get(url);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      });

      if (record && record.blob) {
        return URL.createObjectURL(record.blob);
      }
    }

    // 2. Try CacheStorage API
    if ("caches" in window) {
      const cache = await caches.open(CACHE_NAME);
      const match = await cache.match(url);
      if (match) {
        const blob = await match.blob();
        return URL.createObjectURL(blob);
      }
    }

    // 3. Background fetch and store onto device disk
    fetch(url, { mode: "cors" })
      .then(async (res) => {
        if (!res.ok) return;
        const blob = await res.blob();

        // Save to IndexedDB
        if (db) {
          try {
            const writeTx = db.transaction(STORE_NAME, "readwrite");
            writeTx.objectStore(STORE_NAME).put({
              url,
              blob,
              savedAt: Date.now(),
              sizeBytes: blob.size,
              type: blob.type || "video/mp4"
            });
          } catch {}
        }

        // Save to CacheStorage
        if ("caches" in window) {
          try {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(url, new Response(blob, {
              headers: { "Content-Type": blob.type || "video/mp4" }
            }));
          } catch {}
        }
      })
      .catch(() => {});

    return url;
  } catch (err) {
    console.warn("[Zyvoriq Vault] Local cache retrieval failed, using direct network:", err);
    return url;
  }
}

/** Preload and persist multiple reels onto user's device */
export async function preloadReelMedia(urls: string[]): Promise<void> {
  if (typeof window === "undefined") return;
  void enablePersistentDeviceStorage();

  const validUrls = urls.filter(u => u && !u.startsWith("blob:") && !u.startsWith("data:"));
  await Promise.allSettled(validUrls.map(url => getCachedMediaBlobUrl(url)));
}

/** 1-Click save physical MP4 to device Photos / Camera Roll / Downloads folder */
export async function saveMediaToLocalDevice(url: string, filename = "zyvoriq_reel_master.mp4"): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const blobUrl = await getCachedMediaBlobUrl(url);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (e) {
    console.error("[Zyvoriq Vault] Failed to save media to device:", e);
  }
}
