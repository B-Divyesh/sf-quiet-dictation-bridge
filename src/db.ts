export type Transcript = { id?: number; text: string; receivedAt: string; session?: string };

const DB_NAME = typeof location !== 'undefined' && new URLSearchParams(location.search).get('demo') === '1'
  ? 'demo:quiet-dictation-bridge'
  : 'quiet-dictation-bridge';
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

export async function addTranscripts(items: Array<Omit<Transcript, 'id'>>): Promise<Transcript[]> {
  if (items.length === 0) return [];
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    const store = transaction.objectStore(STORE);
    const added: Transcript[] = [];
    for (const item of items) {
      const request = store.add(item);
      request.onsuccess = () => { added.push({ ...item, id: Number(request.result) }); };
    }
    transaction.oncomplete = () => resolve(added);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error || new Error('Import was canceled by browser storage.'));
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
