'use client';

import { aesGcmEncrypt, sha256Hex, getOrCreateVaultKey, randomBytes, toHex } from './crypto';
import { wrapFileKey } from './keystore';
import { putBlob, putIndexShard, putMetadata, putWrappedFk } from './api';

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
  // Generate per-file key and wrap for future storage (prep for server storage)
  const fk = randomBytes(32);
  const wrappedFk = await wrapFileKey(fk);
  onProgress?.(0.1, 'encrypt');
  const { packed } = await aesGcmEncrypt(fk, bytes);
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
  const encMeta = await aesGcmEncrypt(fk, metaBytes);
  onProgress?.(0.7, 'metadata');
  await putMetadata(id, region, encMeta.packed, token, aborter?.signal);

  const shardId = `shard_${id}`;
  const indexPayload = new TextEncoder().encode(JSON.stringify({ schema_version: 1, shard_id: shardId, ids: [id], vectors: [1,0,0,0] }));
  const encIndex = await aesGcmEncrypt(fk, indexPayload);
  onProgress?.(0.9, 'index');
  await putIndexShard(shardId, region, encIndex.packed, token, aborter?.signal);
  try { await putWrappedFk(id, toHex(wrappedFk), token); } catch {}
  onProgress?.(1, 'done');

  return { id };
}


