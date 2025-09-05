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

    const body = (await req.body) as Buffer;
    // Compute content-addressed id and verify optional integrity header
    const computedId = createHash('sha256').update(body).digest('hex');
    const headerHash = req.headers['x-cipher-hash'];
    if (headerHash && typeof headerHash === 'string' && computedId !== headerHash.toLowerCase()) {
      return sendError(reply, 400, 'bad_hash', req.id as string);
    }
    if (req.params.id && req.params.id !== computedId) {
      return sendError(reply, 409, 'id_mismatch', req.id as string, { expectedId: computedId });
    }

    // Per-account keyspace
    const accountId = req.accountId || 'anonymous';
    const key = `r/${region}/${accountId}/blobs/${computedId}`;

    // Check if this blob already exists to count docs
    let existed = false;
    try {
      await storage.headObject({ region, key });
      existed = true;
    } catch {}

    // Enforce simple max size (50MB) for v0
    const max = 50 * 1024 * 1024;
    if (body.byteLength > max) {
      return sendError(reply, 413, 'payload_too_large', req.id as string);
    }

    await storage.putObject({ region, key, body: new Uint8Array(body) });
    addBytes(body.byteLength);
    if (!existed) addDoc();
    // Record in documents table (idempotent)
    try {
      const accountId = req.accountId || '00000000-0000-0000-0000-000000000001';
      await query(
        `insert into documents(doc_id, account_id, region_code, size_bytes) values ($1,$2,$3,$4)
         on conflict (doc_id) do nothing`,
        [computedId, accountId, region, body.byteLength]
      );
    } catch {}
    return { ok: true, id: computedId };
  });

  // Multipart upload (v0 minimal): init, part, complete
  app.post('/v1/blobs/multipart/init', async (req, reply) => {
    const region = (req.regionCode || 'us') as 'us' | 'eu';
    const accountId = req.accountId || 'anonymous';
    const { proposedId } = (req.body as any) || {};
    if (!proposedId || typeof proposedId !== 'string') return reply.code(400).send({ ok: false });
    const key = `r/${region}/${accountId}/blobs/${proposedId}`;
    const uploadId = await storage.createMultipartUpload({ region, key });
    return { ok: true, uploadId };
  });

  app.post('/v1/blobs/multipart/part', async (req, reply) => {
    const region = (req.regionCode || 'us') as 'us' | 'eu';
    const accountId = req.accountId || 'anonymous';
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
    const accountId = req.accountId || 'anonymous';
    const { uploadId, id, parts, sizeBytes } = (req.body as any) || {};
    if (!uploadId || !id || !Array.isArray(parts)) return reply.code(400).send({ ok: false });
    const key = `r/${region}/${accountId}/blobs/${id}`;
    await storage.completeMultipart({ region, key, uploadId, parts });
    if (typeof sizeBytes === 'number') addBytes(sizeBytes);
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
    const accountId = req.accountId || 'anonymous';
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
    const data = await storage.getObject({ region, key: `r/${region}/${req.params.id}` });
    reply.type('application/octet-stream');
    return Buffer.from(data);
  });
}


