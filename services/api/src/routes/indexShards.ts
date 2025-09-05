import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { StorageService } from '../storage.js';
import { sendError } from '../error.js';

const schema = z.object({
  region: z.enum(['us','eu']).default('us'),
  shardId: z.string().min(1),
});

export async function indexRoutes(app: FastifyInstance) {
  const storage = new StorageService();

  app.put<{ Params: { shardId: string } }>('/v1/index/:shardId', async (req, reply) => {
    const region = (req.regionCode || (req.query as any)?.region || 'us') as 'us' | 'eu';
    const parsed = schema.safeParse({ region, shardId: req.params.shardId });
    if (!parsed.success) return reply.code(400).send({ ok: false });
    const body = await req.body as Buffer;
    if (body.byteLength > 5 * 1024 * 1024) {
      return sendError(reply, 413, 'index_shard_too_large', req.id as string);
    }
    const contentType = (req.headers['content-type'] || 'application/octet-stream').toString();
    const allow = ['application/octet-stream', 'application/cbor'];
    if (!allow.includes(contentType)) return reply.code(415).send({ ok: false, code: 'invalid_input' });
    const accountId = req.accountId || 'anonymous';
    await storage.putObject({ region, key: `r/${region}/${accountId}/index/${parsed.data.shardId}`, body: new Uint8Array(body), contentType: 'application/octet-stream' });
    return { ok: true };
  });

  app.get<{ Params: { shardId: string } }>('/v1/index/:shardId', async (req, reply) => {
    const region = (req.regionCode || (req.query as any)?.region || 'us') as 'us' | 'eu';
    const accountId = req.accountId || 'anonymous';
    const data = await storage.getObject({ region, key: `r/${region}/${accountId}/index/${req.params.shardId}` });
    reply.type('application/octet-stream');
    return Buffer.from(data);
  });
}


