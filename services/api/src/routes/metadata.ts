import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { StorageService } from '../storage.js';
import { sendError } from '../error.js';

const schema = z.object({
  region: z.enum(['us','eu']).default('us'),
  docId: z.string().min(1),
});

export async function metadataRoutes(app: FastifyInstance) {
  const storage = new StorageService();

  app.put<{ Params: { docId: string } }>('/v1/metadata/:docId', async (req, reply) => {
    const region = (req.regionCode || (req.query as any)?.region || 'us') as 'us' | 'eu';
    const parsed = schema.safeParse({ region, docId: req.params.docId });
    if (!parsed.success) return reply.code(400).send({ ok: false });
    const body = await req.body as Buffer;
    if (body.byteLength > 1_000_000) {
      return sendError(reply, 413, 'metadata_too_large', req.id as string);
    }
    const contentType = (req.headers['content-type'] || 'application/octet-stream').toString();
    const allow = ['application/octet-stream', 'application/cbor', 'application/json'];
    if (!allow.includes(contentType)) return sendError(reply, 415, 'invalid_input', req.id as string);
    const accountId = req.accountId || 'anonymous';
    await storage.putObject({ region, key: `r/${region}/${accountId}/meta/${parsed.data.docId}`, body: new Uint8Array(body), contentType: 'application/octet-stream' });
    return { ok: true };
  });

  app.get<{ Params: { docId: string } }>('/v1/metadata/:docId', async (req, reply) => {
    const region = (req.regionCode || (req.query as any)?.region || 'us') as 'us' | 'eu';
    const accountId = req.accountId as string;
    const data = await storage.getObject({ region, key: `r/${region}/${accountId}/meta/${req.params.docId}` });
    reply.type('application/octet-stream');
    return Buffer.from(data);
  });
}


