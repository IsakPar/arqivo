'use client';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

type Region = 'us' | 'eu';

function toStrictArrayBuffer(view: Uint8Array): ArrayBuffer {
  const ab = new ArrayBuffer(view.byteLength);
  new Uint8Array(ab).set(view);
  return ab;
}

async function putBinary(path: string, bytes: Uint8Array, token?: string, signal?: AbortSignal): Promise<void> {
  // Optional integrity header (sha256 of ciphertext) using a strict ArrayBuffer
  const abForHash: ArrayBuffer = toStrictArrayBuffer(bytes);
  const hash = await crypto.subtle.digest('SHA-256', abForHash);
  const hex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/octet-stream', 'x-cipher-hash': `sha256:${hex}` , ...(token ? { authorization: `Bearer ${token}` } : {}) },
    signal,
    body: abForHash,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Upload failed: ${res.status} ${text}`);
  }
}

export async function putBlob(id: string, region: Region, bytes: Uint8Array, token?: string, signal?: AbortSignal): Promise<void> {
  await putBinary(`/v1/blobs/${id}?region=${region}`, bytes, token, signal);
}

export async function putMetadata(docId: string, region: Region, bytes: Uint8Array, token?: string, signal?: AbortSignal): Promise<void> {
  await putBinary(`/v1/metadata/${docId}?region=${region}`, bytes, token, signal);
}

export async function putIndexShard(shardId: string, region: Region, bytes: Uint8Array, token?: string, signal?: AbortSignal): Promise<void> {
  await putBinary(`/v1/index/${shardId}?region=${region}`, bytes, token, signal);
}

async function getBinary(path: string, token?: string): Promise<Uint8Array> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { ...(token ? { authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  const buf = await res.arrayBuffer();
  return new Uint8Array(buf);
}

export async function getBlob(id: string, region: Region, token?: string): Promise<Uint8Array> {
  return getBinary(`/v1/blobs/${id}?region=${region}`, token);
}

export async function getMetadata(docId: string, region: Region, token?: string): Promise<Uint8Array> {
  return getBinary(`/v1/metadata/${docId}?region=${region}`, token);
}

export async function listDocuments(token?: string): Promise<{ id: string; sizeBytes: number; region: Region; createdAt: string }[]> {
  const res = await fetch(`${BASE_URL}/v1/documents`, { headers: { ...(token ? { authorization: `Bearer ${token}` } : {}) } });
  if (!res.ok) throw new Error(`List failed: ${res.status}`);
  const data = await res.json();
  return data?.documents ?? [];
}

export async function deleteDocument(id: string, token?: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/v1/documents/${id}`, { method: 'DELETE', headers: { ...(token ? { authorization: `Bearer ${token}` } : {}) } });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
}

export async function putWrappedFk(id: string, wrappedFkHex: string, token?: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/v1/documents/${id}/wrap`, { method: 'POST', headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ wrappedFkHex }) });
  if (!res.ok) throw new Error(`Wrap FK failed: ${res.status}`);
}


