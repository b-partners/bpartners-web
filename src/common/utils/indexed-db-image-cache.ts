const DB_NAME = 'bpartners-image-cache';
const STORE_NAME = 'images';
const DB_VERSION = 1;

const openDatabase = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

export const getImageFromCache = async (fileId: string): Promise<Blob | null> => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(fileId);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
};

export const saveImageToCache = async (fileId: string, blob: Blob): Promise<void> => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const request = tx.objectStore(STORE_NAME).put(blob, fileId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const removeImageFromCache = async (fileId: string): Promise<void> => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const request = tx.objectStore(STORE_NAME).delete(fileId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const downloadAndCacheImage = async (fileId: string, fileUrl: string): Promise<string> => {
  const cached = await getImageFromCache(fileId);
  if (cached) return URL.createObjectURL(cached);

  const response = await fetch(fileUrl);
  const blob = await response.blob();
  await saveImageToCache(fileId, blob);
  return URL.createObjectURL(blob);
};
