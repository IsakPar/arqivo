import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { StorageService } from '../storage.js';
import { createHash } from 'node:crypto';
import { addBytes, addDoc } from './quota.js';
import { query } from '../db.js';
import { sendError } from '../error.js';

const putBlobSchema = z.object({
  region: z.enum(['us','eu']).default('us'),
  id: z.string().min(1),
});

export async function storageRoutes(app: FastifyInstance) {
  const storage = new StorageService();

  app.put<{ Params: { id: string } }>('/v1/blobs/:id', async (req, reply) => {
    const region = (req.regionCode || (req.query as any)?.region || 'us') as 'us' | 'eu';
    const parsed = putBlobSchema.safeParse({ id: req.params.id, region });
    if (!parsed.success) return reply.code(400).send({ ok: false });

    // Pre-check content-length to avoid streaming huge payloads
    const cl = Number(req.headers['content-length']);
    const hardMax = Number(process.env.MAX_BLOB_BYTES ?? 50_000_000);
    if (!Number.isNaN(cl) && cl > hardMax) {
      return sendError(reply, 413, 'payload_too_large', req.id as string);
    }

    const body = (await req.body) as Buffer;
    // Enforce size cap first (50,000,000 bytes default)
    const max = Number(process.env.MAX_BLOB_BYTES ?? 50_000_000);
    if (body.byteLength > max) {
      return sendError(reply, 413, 'payload_too_large', req.id as string);
    }
    // Compute content-addressed id and verify optional integrity header
    const computedId = createHash('sha256').update(body).digest('hex');
    const headerHashRaw = req.headers['x-cipher-hash'];
    const headerHash = typeof headerHashRaw === 'string' ? headerHashRaw.replace(/^sha256:/i, '').toLowerCase() : undefined;
    if (headerHash && computedId !== headerHash) {
      return sendError(reply, 400, 'bad_integrity', req.id as string);
    }
    if (req.params.id && req.params.id !== computedId) {
      return sendError(reply, 409, 'id_mismatch', req.id as string, { expectedId: computedId });
    }

    // Per-account keyspace
    const accountId = req.accountId as string;
    const key = `r/${region}/${accountId}/blobs/${computedId}`;

    // Check if this blob already exists to count docs
    let existed = false;
    try {
      await storage.headObject({ region, key });
      existed = true;
    } catch {}

    // (size already checked above)

    // Idempotency: if document exists with a different hash → 409
    try {
      const r = await query<{ doc_hash: string }>('select doc_hash from documents where doc_id=$1 and account_id=$2', [computedId, accountId]);
      if (r.rows[0] && r.rows[0].doc_hash && r.rows[0].doc_hash !== computedId) {
        return reply.code(409).send({ ok: false, code: 'hash_mismatch' });
      }
    } catch {}

    await storage.putObject({ region, key, body: new Uint8Array(body) });
    addBytes(body.byteLength, accountId);
    if (!existed) addDoc(accountId);
    // Record in documents table (idempotent)
    try {
      await query(
        `insert into documents(doc_id, account_id, region_code, size_bytes, doc_hash) values ($1,$2,$3,$4,$5)
         on conflict (doc_id) do update set size_bytes=EXCLUDED.size_bytes, doc_hash=EXCLUDED.doc_hash`,
        [computedId, accountId, region, body.byteLength, computedId]
      );
    } catch {}
    return { ok: true, id: computedId };
  });

  // Multipart upload (v0 minimal): init, part, complete
  app.post('/v1/blobs/multipart/init', async (req, reply) => {
    const region = (req.regionCode || 'us') as 'us' | 'eu';
    const accountId = req.accountId as string;
    const { proposedId } = (req.body as any) || {};
    if (!proposedId || typeof proposedId !== 'string') return reply.code(400).send({ ok: false });
    const key = `r/${region}/${accountId}/blobs/${proposedId}`;
    const uploadId = await storage.createMultipartUpload({ region, key });
    return { ok: true, uploadId };
  });

  app.post('/v1/blobs/multipart/part', async (req, reply) => {
    const region = (req.regionCode || 'us') as 'us' | 'eu';
    const accountId = req.accountId as string;
    const body = req.body as any;
    const { uploadId, partNumber, id } = body || {};
    const chunk: Buffer = body?.chunk;
    if (!uploadId || !partNumber || !id || !chunk) return reply.code(400).send({ ok: false });
    const key = `r/${region}/${accountId}/blobs/${id}`;
    const eTag = await storage.uploadPart({ region, key, uploadId, partNumber: Number(partNumber), body: new Uint8Array(chunk) });
    return { ok: true, eTag };
  });

  app.post('/v1/blobs/multipart/complete', async (req, reply) => {
    const region = (req.regionCode || 'us') as 'us' | 'eu';
    const accountId = req.accountId as string;
    const { uploadId, id, parts, sizeBytes } = (req.body as any) || {};
    if (!uploadId || !id || !Array.isArray(parts)) return reply.code(400).send({ ok: false });
    const key = `r/${region}/${accountId}/blobs/${id}`;
    await storage.completeMultipart({ region, key, uploadId, parts });
    if (typeof sizeBytes === 'number') addBytes(sizeBytes, accountId);
    await query(
      `insert into documents(doc_id, account_id, region_code, size_bytes) values ($1,$2,$3,$4)
       on conflict (doc_id) do nothing`,
      [id, accountId, region, sizeBytes ?? 0]
    );
    return { ok: true };
  });

  // Idempotency probe
  app.head<{ Params: { id: string } }>('/v1/blobs/:id', async (req, reply) => {
    const region = (req.regionCode || (req.query as any)?.region || 'us') as 'us' | 'eu';
    const accountId = req.accountId as string;
    const key = `r/${region}/${accountId}/blobs/${req.params.id}`;
    try {
      await storage.headObject({ region, key });
      return reply.code(200).send();
    } catch {
      return reply.code(404).send();
    }
  });

  app.get<{ Params: { id: string } }>('/v1/blobs/:id', async (req, reply) => {
    const region = ((req.query as any)?.region ?? 'us') as 'us' | 'eu';
    const accountId = req.accountId as string;
    const key = `r/${region}/${accountId}/blobs/${req.params.id}`;
    const data = await storage.getObject({ region, key });
    reply.type('application/octet-stream');
    return Buffer.from(data);
  });

  app.delete<{ Params: { id: string } }>('/v1/blobs/:id', async (req, reply) => {
    const region = ((req.query as any)?.region ?? 'us') as 'us' | 'eu';
    const accountId = req.accountId as string;
    const key = `r/${region}/${accountId}/blobs/${req.params.id}`;
    await storage.deleteObject({ region, key });
    try {
      await query('delete from documents where doc_id=$1 and account_id=$2', [req.params.id, accountId]);
    } catch {}
    return { ok: true };
  });
}


