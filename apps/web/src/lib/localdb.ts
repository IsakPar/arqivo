'use client';

// Minimal IndexedDB helper with AES-GCM at-rest encryption using the vault key
import { aesGcmDecrypt, aesGcmEncrypt, getOrCreateVaultKey } from './crypto';

type IndexRecord = {
  schema_version: 1;
  id: string; // docId
  name?: string;
  text?: string; // concatenated text content
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('arqivo', 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('index')) {
        db.createObjectStore('index');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function putRaw(store: IDBObjectStore, key: string, value: Uint8Array): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const req = store.put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function getAll(store: IDBObjectStore): Promise<Array<{ key: string; value: Uint8Array }>> {
  return new Promise((resolve, reject) => {
    const out: Array<{ key: string; value: Uint8Array }> = [];
    const cursorReq = store.openCursor();
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result as IDBCursorWithValue | null;
      if (!cursor) return resolve(out);
      const v = cursor.value as ArrayBuffer | Uint8Array;
      const arr = v instanceof Uint8Array ? v : new Uint8Array(v);
      out.push({ key: String(cursor.key), value: arr });
      cursor.continue();
    };
    cursorReq.onerror = () => reject(cursorReq.error);
  });
}

export async function upsertIndex(docId: string, record: IndexRecord): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('index', 'readwrite');
  const store = tx.objectStore('index');
  try {
    const kv = getOrCreateVaultKey();
    const bytes = new TextEncoder().encode(JSON.stringify(record));
    const { packed } = await aesGcmEncrypt(kv, bytes);
    await putRaw(store, docId, packed);
  } finally {
    try { tx.commit?.(); } catch {}
    db.close();
  }
}

export async function searchIndex(query: string): Promise<Array<{ id: string; name?: string; excerpt?: string }>> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const db = await openDB();
  const tx = db.transaction('index', 'readonly');
  const store = tx.objectStore('index');
  try {
    const kv = getOrCreateVaultKey();
    const rows = await getAll(store);
    const out: Array<{ id: string; name?: string; excerpt?: string }> = [];
    for (const row of rows) {
      try {
        const pt = await aesGcmDecrypt(kv, row.value);
        const rec = JSON.parse(new TextDecoder().decode(pt)) as IndexRecord;
        const hay = `${rec.name ?? ''}\n${rec.text ?? ''}`.toLowerCase();
        const idx = hay.indexOf(q);
        if (idx >= 0) {
          const start = Math.max(0, idx - 24);
          const end = Math.min(hay.length, idx + q.length + 24);
          const excerpt = hay.slice(start, end).replace(/\n/g, ' ');
          out.push({ id: rec.id, name: rec.name, excerpt });
        }
      } catch {}
    }
    return out;
  } finally {
    db.close();
  }
}

export async function indexFileName(docId: string, name: string): Promise<void> {
  const rec: IndexRecord = { schema_version: 1, id: docId, name, text: name };
  await upsertIndex(docId, rec);
}


