/**
 * Image Caching System with Compression
 * Uses IndexedDB to store compressed images locally for faster access
 */

const DB_NAME = "band-app-image-cache";
const DB_VERSION = 1;
const STORE_NAME = "images";
const MAX_CACHE_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_CACHE_SIZE_MB = 100; // 100MB max cache

interface CachedImage {
  url: string;
  blob: Blob;
  timestamp: number;
  size: number;
}

class ImageCache {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;

  private async openDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !window.indexedDB) {
        reject(new Error("IndexedDB not available"));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "url" });
          store.createIndex("timestamp", "timestamp", { unique: false });
        }
      };
    });

    return this.dbPromise;
  }

  async get(url: string): Promise<string | null> {
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(url);

        request.onsuccess = () => {
          const result = request.result as CachedImage | undefined;
          if (result) {
            // Check if cache is expired
            if (Date.now() - result.timestamp > MAX_CACHE_AGE_MS) {
              this.delete(url);
              resolve(null);
              return;
            }
            // Return blob URL
            resolve(URL.createObjectURL(result.blob));
          } else {
            resolve(null);
          }
        };
        request.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  async set(url: string, blob: Blob): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);

        const cachedImage: CachedImage = {
          url,
          blob,
          timestamp: Date.now(),
          size: blob.size,
        };

        const request = store.put(cachedImage);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      // Silently fail - caching is optional
    }
  }

  async delete(url: string): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        store.delete(url);
        resolve();
      });
    } catch {
      // Silently fail
    }
  }

  async cleanup(): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("timestamp");
      const cutoff = Date.now() - MAX_CACHE_AGE_MS;

      // Delete expired entries
      const cursorRequest = index.openCursor(IDBKeyRange.upperBound(cutoff));
      cursorRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      // Check total size and delete oldest if over limit
      const allRequest = store.getAll();
      allRequest.onsuccess = () => {
        const items = allRequest.result as CachedImage[];
        const totalSize = items.reduce((sum, item) => sum + item.size, 0);

        if (totalSize > MAX_CACHE_SIZE_MB * 1024 * 1024) {
          // Sort by timestamp and delete oldest
          items.sort((a, b) => a.timestamp - b.timestamp);
          let currentSize = totalSize;
          for (const item of items) {
            if (currentSize <= MAX_CACHE_SIZE_MB * 1024 * 1024 * 0.8) break;
            store.delete(item.url);
            currentSize -= item.size;
          }
        }
      };
    } catch {
      // Silently fail
    }
  }
}

// Singleton instance
export const imageCache = new ImageCache();

/**
 * Compress an image blob using canvas
 * @param blob Original image blob
 * @param maxWidth Maximum width
 * @param maxHeight Maximum height
 * @param quality JPEG quality (0-1)
 */
export async function compressImage(
  blob: Blob,
  maxWidth = 400,
  maxHeight = 400,
  quality = 0.7
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);

      let { width, height } = img;

      // Calculate new dimensions maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // Create canvas and draw resized image
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(blob); // Return original if canvas fails
        return;
      }

      // Use better quality scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to JPEG blob with compression
      canvas.toBlob(
        (compressedBlob) => {
          if (compressedBlob && compressedBlob.size < blob.size) {
            resolve(compressedBlob);
          } else {
            resolve(blob); // Return original if compressed is larger
          }
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => reject(new Error("Failed to load image for compression"));
    img.src = URL.createObjectURL(blob);
  });
}

/**
 * Fetch, compress, and cache an image
 */
export async function fetchAndCacheImage(url: string): Promise<string> {
  // Check cache first
  const cached = await imageCache.get(url);
  if (cached) return cached;

  // Fetch the image
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch image");

  const originalBlob = await response.blob();

  // Only compress actual images
  if (originalBlob.type.startsWith("image/")) {
    try {
      const compressedBlob = await compressImage(originalBlob);
      await imageCache.set(url, compressedBlob);
      return URL.createObjectURL(compressedBlob);
    } catch {
      // If compression fails, cache original
      await imageCache.set(url, originalBlob);
      return URL.createObjectURL(originalBlob);
    }
  }

  return url;
}

// Run cleanup on module load (client-side only)
if (typeof window !== "undefined") {
  // Delay cleanup to not block initial load
  setTimeout(() => {
    imageCache.cleanup();
  }, 5000);
}
