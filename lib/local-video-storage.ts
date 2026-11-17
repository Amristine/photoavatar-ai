const DB_NAME = "photoavatar-ai-local";
const DB_VERSION = 1;
const STORE_NAME = "videos";
const METADATA_KEY = "photoavatar-ai-video-metadata";

export type LocalVideoMetadata = {
  id: string;
  name: string;
  createdAt: string;
  durationSeconds?: number;
  model?: string;
  resolution?: string;
  aspectRatio?: string;
  mimeType: string;
  size: number;
};

type StoredVideo = {
  id: string;
  blob: Blob;
};

function openDatabase(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.reject(new Error("This browser does not support local video storage."));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open local video storage."));
  });
}

function readMetadata(): LocalVideoMetadata[] {
  try {
    return JSON.parse(localStorage.getItem(METADATA_KEY) ?? "[]") as LocalVideoMetadata[];
  } catch {
    return [];
  }
}

function writeMetadata(items: LocalVideoMetadata[]) {
  localStorage.setItem(METADATA_KEY, JSON.stringify(items));
}

export async function saveLocalVideo(
  blob: Blob,
  details: Omit<LocalVideoMetadata, "id" | "createdAt" | "mimeType" | "size"> & { id?: string }
): Promise<LocalVideoMetadata> {
  if (!(blob instanceof Blob) || blob.size === 0) {
    throw new Error("A non-empty video file is required.");
  }

  const id = details.id ?? (typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `video-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  const metadata: LocalVideoMetadata = {
    ...details,
    id,
    createdAt: new Date().toISOString(),
    mimeType: blob.type || "video/mp4",
    size: blob.size
  };

  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put({ id, blob } satisfies StoredVideo);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Could not save video."));
    transaction.onabort = () => reject(transaction.error ?? new Error("Video save was cancelled."));
  });
  database.close();

  writeMetadata([metadata, ...readMetadata().filter((item) => item.id !== id)]);
  return metadata;
}

export function listLocalVideos(): LocalVideoMetadata[] {
  if (typeof window === "undefined") return [];
  return readMetadata().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getLocalVideo(id: string): Promise<Blob | null> {
  const database = await openDatabase();
  const result = await new Promise<StoredVideo | undefined>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result as StoredVideo | undefined);
    request.onerror = () => reject(request.error ?? new Error("Could not read video."));
  });
  database.close();
  return result?.blob ?? null;
}

export async function deleteLocalVideo(id: string): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Could not delete video."));
    transaction.onabort = () => reject(transaction.error ?? new Error("Video deletion was cancelled."));
  });
  database.close();
  writeMetadata(readMetadata().filter((item) => item.id !== id));
}
