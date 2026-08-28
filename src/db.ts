export type Transcript = { id?: number; text: string; receivedAt: string; session?: string };

const DB_NAME = 'quiet-dictation-bridge';
const STORE = 'transcripts';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
      store.createIndex('receivedAt', 'receivedAt');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function addTranscript(item: Transcript): Promise<Transcript> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).add(item);
    request.onsuccess = () => resolve({ ...item, id: Number(request.result) });
    request.onerror = () => reject(request.error);
  });
}

export async function getTranscripts(): Promise<Transcript[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).getAll();
    request.onsuccess = () => resolve((request.result as Transcript[]).sort((a, b) => b.receivedAt.localeCompare(a.receivedAt)));
    request.onerror = () => reject(request.error);
  });
}

export async function clearTranscripts(): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
