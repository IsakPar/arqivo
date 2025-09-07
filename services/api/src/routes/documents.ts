import type { FastifyInstance } from 'fastify';
import { query } from '../db.js';
import { StorageService } from '../storage.js';

export async function documentRoutes(app: FastifyInstance) {
  const storage = new StorageService();

  app.get('/v1/documents', async (req) => {
    const accountId = req.accountId as string;
    const res = await query<{ doc_id: string; size_bytes: string; region_code: string; created_at: string }>(
      'select doc_id, size_bytes, region_code, created_at from documents where account_id=$1 order by created_at desc',
      [accountId]
    );
    return {
      ok: true,
      documents: res.rows.map((r) => ({
        id: r.doc_id,
        sizeBytes: Number(r.size_bytes),
        region: r.region_code,
        createdAt: r.created_at,
      })),
    };
  });

  app.get<{ Params: { id: string } }>('/v1/documents/:id', async (req, reply) => {
    const accountId = req.accountId as string;
    const { rows } = await query<{ doc_id: string; size_bytes: string; region_code: string; created_at: string }>(
      'select doc_id, size_bytes, region_code, created_at from documents where account_id=$1 and doc_id=$2',
      [accountId, req.params.id]
    );
    if (rows.length === 0) return reply.code(404).send({ ok: false });
    const r = rows[0];
    return { ok: true, document: { id: r.doc_id, sizeBytes: Number(r.size_bytes), region: r.region_code, createdAt: r.created_at } };
  });

  app.delete<{ Params: { id: string } }>('/v1/documents/:id', async (req) => {
    const accountId = req.accountId as string;
    // Find region to delete blob path
    const { rows } = await query<{ region_code: string }>('select region_code from documents where account_id=$1 and doc_id=$2', [accountId, req.params.id]);
    const region = (rows[0]?.region_code as 'us' | 'eu') || 'us';
    // Delete blob, metadata, index shard (best-effort)
    const keyBlob = `r/${region}/${accountId}/blobs/${req.params.id}`;
    const keyMeta = `r/${region}/${accountId}/meta/${req.params.id}`;
    const keyIndex = `r/${region}/${accountId}/index/shard_${req.params.id}`;
    try { await storage.deleteObject({ region, key: keyBlob }); } catch {}
    try { await storage.deleteObject({ region, key: keyMeta }); } catch {}
    try { await storage.deleteObject({ region, key: keyIndex }); } catch {}
    await query('delete from documents where account_id=$1 and doc_id=$2', [accountId, req.params.id]);
    return { ok: true };
  });

  // Store wrapped file key (bytea) after client-side encryption
  app.post<{ Params: { id: string } }>('/v1/documents/:id/wrap', async (req, reply) => {
    const accountId = req.accountId as string;
    const body = (req.body as any) || {};
    const wrappedFkHex = (body.wrappedFkHex as string | undefined)?.toLowerCase();
    if (!wrappedFkHex || !/^[0-9a-f]+$/i.test(wrappedFkHex)) {
      return reply.code(400).send({ ok: false, code: 'invalid_input' });
    }
    await query('update documents set wrapped_fk=$1 where account_id=$2 and doc_id=$3', [Buffer.from(wrappedFkHex, 'hex'), accountId, req.params.id]);
    return { ok: true };
  });
}


