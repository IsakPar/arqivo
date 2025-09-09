"use client";

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { aesGcmEncrypt, aesGcmDecrypt, getOrCreateVaultKey } from './crypto';

type Encrypted = Uint8Array;

interface ArqivoDB extends DBSchema {
  docs: {
    key: string; // docId
    value: Encrypted; // encrypted JSON metadata
    indexes: { 'by-created': string };
  };
  index: {
    key: string; // shardId
    value: Encrypted; // encrypted shard payload
  };
  fields: {
    key: string; // docId (content hash)
    value: Encrypted; // encrypted ExtractedFields
  };
}

let dbPromise: Promise<IDBPDatabase<ArqivoDB>> | null = null;

async function getDb(): Promise<IDBPDatabase<ArqivoDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ArqivoDB>('arqivo-local', 1, {
      upgrade(database) {
        if (!database.objectStoreNames.contains('docs')) {
          const s = database.createObjectStore('docs');
          s.createIndex('by-created', 'createdAt');
        }
        if (!database.objectStoreNames.contains('index')) {
          database.createObjectStore('index');
        }
        if (!database.objectStoreNames.contains('fields')) {
          database.createObjectStore('fields');
        }
      },
    });
  }
  return dbPromise;
}

function toBytes(json: unknown): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(json));
}

function fromBytes(data: Uint8Array): unknown {
  try {
    return JSON.parse(new TextDecoder().decode(data));
  } catch {
    return null;
  }
}

export type LocalDocMeta = {
  id: string;
  name?: string;
  sizeBytes?: number;
  createdAt: string;
  tags?: string[];
  vendor?: string;
  facets?: Record<string, unknown>;
};

async function encrypt(payload: Uint8Array): Promise<Encrypted> {
  const kv = getOrCreateVaultKey();
  const { packed } = await aesGcmEncrypt(kv, payload);
  return packed;
}

async function decrypt(cipher: Encrypted): Promise<Uint8Array> {
  const kv = getOrCreateVaultKey();
  return aesGcmDecrypt(kv, cipher);
}

export const LocalDb = {
  // Document metadata
  async putDocument(meta: LocalDocMeta): Promise<void> {
    const db = await getDb();
    const bytes = toBytes(meta);
    const enc = await encrypt(bytes);
    await db.put('docs', enc, meta.id);
  },
  async getDocument(id: string): Promise<LocalDocMeta | null> {
    const db = await getDb();
    const enc = await db.get('docs', id);
    if (!enc) return null;
    const pt = await decrypt(enc);
    const obj = fromBytes(pt) as LocalDocMeta | null;
    return obj;
  },
  async deleteDocument(id: string): Promise<void> {
    const db = await getDb();
    await db.delete('docs', id);
  },
  async listDocuments(): Promise<string[]> {
    const db = await getDb();
    const keys: string[] = [];
    let cursor = await db.transaction('docs').store.openKeyCursor();
    while (cursor) {
      keys.push(String(cursor.key));
      cursor = await cursor.continue();
    }
    return keys;
  },

  // Local index shards (encrypted)
  async putIndexShard(shardId: string, payload: Uint8Array): Promise<void> {
    const db = await getDb();
    const enc = await encrypt(payload);
    await db.put('index', enc, shardId);
  },
  async getIndexShard(shardId: string): Promise<Uint8Array | null> {
    const db = await getDb();
    const enc = await db.get('index', shardId);
    if (!enc) return null;
    return decrypt(enc);
  },
  async deleteIndexShard(shardId: string): Promise<void> {
    const db = await getDb();
    await db.delete('index', shardId);
  },

  // Extracted fields (encrypted)
  async putFields(docId: string, json: unknown): Promise<void> {
    const db = await getDb();
    const bytes = toBytes(json);
    const enc = await encrypt(bytes);
    await db.put('fields', enc, docId);
  },
  async getFields<T = unknown>(docId: string): Promise<T | null> {
    const db = await getDb();
    const enc = await db.get('fields', docId);
    if (!enc) return null;
    const pt = await decrypt(enc);
    return fromBytes(pt) as T | null;
  },
};



