'use client';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

type Region = 'us' | 'eu';

function toStrictArrayBuffer(view: Uint8Array): ArrayBuffer {
  const ab = new ArrayBuffer(view.byteLength);
  new Uint8Array(ab).set(view);
  return ab;
}

async function putBinary(path: string, bytes: Uint8Array): Promise<void> {
  // Optional integrity header (sha256 of ciphertext) using a strict ArrayBuffer
  const abForHash: ArrayBuffer = toStrictArrayBuffer(bytes);
  const hash = await crypto.subtle.digest('SHA-256', abForHash);
  const hex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/octet-stream', 'x-cipher-hash': `sha256:${hex}` },
    body: abForHash,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Upload failed: ${res.status} ${text}`);
  }
}

export async function putBlob(id: string, region: Region, bytes: Uint8Array): Promise<void> {
  await putBinary(`/v1/blobs/${id}?region=${region}`, bytes);
}

export async function putMetadata(docId: string, region: Region, bytes: Uint8Array): Promise<void> {
  await putBinary(`/v1/metadata/${docId}?region=${region}`, bytes);
}

export async function putIndexShard(shardId: string, region: Region, bytes: Uint8Array): Promise<void> {
  await putBinary(`/v1/index/${shardId}?region=${region}`, bytes);
}


