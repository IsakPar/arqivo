'use client';

import { aesGcmEncrypt, sha256Hex, getOrCreateVaultKey } from './crypto';
import { putBlob, putIndexShard, putMetadata } from './api';

export async function fileToBytes(file: File): Promise<Uint8Array> {
  const ab = await file.arrayBuffer();
  return new Uint8Array(ab);
}

export async function encryptAndUploadFile(
  file: File,
  region: 'us'|'eu',
  token?: string,
  onProgress?: (p: number, phase: 'encrypt'|'blob'|'metadata'|'index'|'done') => void,
  aborter?: AbortController
): Promise<{ id: string }>{
  const bytes = await fileToBytes(file);
  const kv = getOrCreateVaultKey();
  onProgress?.(0.1, 'encrypt');
  const { packed } = await aesGcmEncrypt(kv, bytes);
  const id = await sha256Hex(packed);
  onProgress?.(0.4, 'blob');
  await putBlob(id, region, packed, token, aborter?.signal);

  const meta = {
    schema_version: 1,
    name: file.name,
    size: file.size,
    tags: [],
  } as const;
  const metaBytes = new TextEncoder().encode(JSON.stringify(meta));
  const encMeta = await aesGcmEncrypt(kv, metaBytes);
  onProgress?.(0.7, 'metadata');
  await putMetadata(id, region, encMeta.packed, token, aborter?.signal);

  const shardId = `shard_${id}`;
  const indexPayload = new TextEncoder().encode(JSON.stringify({ schema_version: 1, shard_id: shardId, ids: [id], vectors: [1,0,0,0] }));
  const encIndex = await aesGcmEncrypt(kv, indexPayload);
  onProgress?.(0.9, 'index');
  await putIndexShard(shardId, region, encIndex.packed, token, aborter?.signal);
  onProgress?.(1, 'done');

  return { id };
}


