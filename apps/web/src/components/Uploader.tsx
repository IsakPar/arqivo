'use client';

import React, { useCallback, useState } from 'react';
import { putBlob, putMetadata, putIndexShard } from '../lib/api';
import { aesGcmEncrypt, getOrCreateVaultKey, sha256Hex } from '../lib/crypto';
import { useAuth } from '@clerk/nextjs';

function bytesFromFile(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

export const Uploader: React.FC = () => {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const { getToken } = useAuth();

  const onChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMsg(null);
    try {
      const bytes = await bytesFromFile(file);
      const kv = getOrCreateVaultKey();
      // Encrypt content with per-doc key derived from kv (v0: reuse kv for simplicity)
      const { packed } = await aesGcmEncrypt(kv, bytes);
      const id = await sha256Hex(packed);
      const token = await getToken?.();
      await putBlob(id, 'us', packed, token || undefined);

      // Minimal metadata bundle (unenriched stub) → JSON → encrypt with kv → upload
      const now = new Date().toISOString();
      // naive tagging heuristic (v0): infer type from filename; capture date
      const lower = file.name.toLowerCase();
      const inferredType = lower.includes('receipt') ? 'receipt' : lower.includes('passport') ? 'id' : 'other';
      const meta = {
        schema_version: 1,
        type: inferredType,
        entities: [],
        dates: { captured_at: now, doc_date: now },
        amounts: {},
        confidence: 0.5,
        tags: inferredType === 'receipt' ? ['expense'] : [],
        name: file.name,
        size: file.size
      } as const;
      const metaBytes = new TextEncoder().encode(JSON.stringify(meta));
      const encMeta = await aesGcmEncrypt(kv, metaBytes);
      await putMetadata(id, 'us', encMeta.packed, token || undefined);

      // minimal index shard stub: single vector placeholder for now
      const shardId = `shard_${id}`;
      const vector = new Float32Array([1, 0, 0, 0]);
      const indexPayload = new TextEncoder().encode(JSON.stringify({
        schema_version: 1,
        shard_id: shardId,
        ids: [id],
        vectors: Array.from(vector),
      }));
      const encIndex = await aesGcmEncrypt(kv, indexPayload);
      await putIndexShard(shardId, 'us', encIndex.packed, token || undefined);

      setMsg(`Uploaded ${file.name} as ${id}`);
    } catch (err: any) {
      setMsg(err?.message ?? 'Upload failed');
    } finally {
      setBusy(false);
      e.currentTarget.value = '';
    }
  }, []);

  return (
    <div className="flex flex-col gap-2 items-start">
      <label className="text-sm font-medium">Upload a document (image/PDF)</label>
      <input type="file" accept="image/*,application/pdf" onChange={onChange} disabled={busy} />
      {busy && <span className="text-sm text-gray-500">Uploading…</span>}
      {msg && <span className="text-sm">{msg}</span>}
    </div>
  );
};


