/**
 * IndexedDB utility for storing large media files
 * Used for draft persistence of uploaded media
 */

const DB_NAME = "lineup_drafts";
const DB_VERSION = 1;
const STORE_NAME = "media";

interface MediaBlob {
  url: string;
  type: "image" | "video";
  thumbnailUrl: string | null;
  blob: Blob;
}

/**
 * Initialize IndexedDB database
 */
async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("IndexedDB is only available in browser"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "url" });
      }
    };
  });
}

/**
 * Store media blob in IndexedDB
 */
export async function storeMediaBlob(
  url: string,
  type: "image" | "video",
  thumbnailUrl: string | null,
  blob: Blob
): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const mediaBlob: MediaBlob = {
      url,
      type,
      thumbnailUrl,
      blob,
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.put(mediaBlob);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    db.close();
  } catch (error) {
    console.error("Failed to store media blob:", error);
    throw error;
  }
}

/**
 * Retrieve media blob from IndexedDB
 */
export async function getMediaBlob(url: string): Promise<MediaBlob | null> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    const mediaBlob = await new Promise<MediaBlob | null>((resolve, reject) => {
      const request = store.get(url);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });

    db.close();
    return mediaBlob;
  } catch (error) {
    console.error("Failed to get media blob:", error);
    return null;
  }
}

/**
 * Delete media blob from IndexedDB
 */
export async function deleteMediaBlob(url: string): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(url);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    db.close();
  } catch (error) {
    console.error("Failed to delete media blob:", error);
    throw error;
  }
}

/**
 * Clear all media blobs from IndexedDB
 */
export async function clearMediaBlobs(): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    db.close();
  } catch (error) {
    console.error("Failed to clear media blobs:", error);
    throw error;
  }
}

