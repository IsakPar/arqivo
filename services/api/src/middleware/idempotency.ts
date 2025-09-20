import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { createClient } from 'redis';

type Cache = {
  get(key: string): Promise<string | null> | string | null;
  set(key: string, value: string, ttlSeconds: number): Promise<void> | void;
};

class MemoryCache implements Cache {
  private map = new Map<string, { v: string; exp: number }>();
  async get(key: string): Promise<string | null> {
    const e = this.map.get(key);
    if (!e) return null;
    if (Date.now() > e.exp) { this.map.delete(key); return null; }
    return e.v;
  }
  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    this.map.set(key, { v: value, exp: Date.now() + ttlSeconds * 1000 });
  }
}

export async function registerIdempotency(app: FastifyInstance) {
  const ttl = Number(process.env.IDEMPOTENCY_TTL ?? 600); // 10 minutes
  const redisUrl = process.env.REDIS_URL;
  let cache: Cache = new MemoryCache();
  if (redisUrl) {
    try {
      const r = createClient({ url: redisUrl });
      await r.connect();
      cache = {
        get: (k) => r.get(k),
        set: (k, v, t) => r.set(k, v, { EX: t }) as any,
      };
    } catch {}
  }

  app.addHook('preHandler', async (req: FastifyRequest, reply: FastifyReply) => {
    const method = req.method.toUpperCase();
    if (method !== 'POST' && method !== 'PUT' && method !== 'PATCH') return;
    const key = (req.headers['idempotency-key'] as string) || '';
    if (!key) return;
    const scope = (req as any).accountId || 'anon';
    const cacheKey = `idem:${scope}:${method}:${req.url}:${key}`;
    const hit = await cache.get(cacheKey);
    if (hit) {
      const cached = JSON.parse(hit);
      reply.code(cached.status || 200);
      for (const [h, v] of Object.entries(cached.headers || {})) reply.header(h, v as any);
      reply.header('idempotent-replay', 'true');
      return reply.send(cached.body);
    }
    // Capture reply payload
    const send = reply.send.bind(reply);
    (reply as any).send = (payload: any) => {
      const body = payload;
      const status = reply.statusCode;
      const headers = { 'content-type': reply.getHeader('content-type') as string };
      cache.set(cacheKey, JSON.stringify({ status, headers, body }), ttl);
      return send(payload);
    };
  });
}


