import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { config as loadEnv } from 'dotenv';
import * as Sentry from '@sentry/node';
import { DiagConsoleLogger, DiagLogLevel, diag } from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { env } from './env.js';
import cors from '@fastify/cors';
import { authRoutes } from './routes/auth.js';
import { deviceRoutes } from './routes/devices.js';
import { storageRoutes } from './routes/storage.js';
import { metadataRoutes } from './routes/metadata.js';
import { indexRoutes } from './routes/indexShards.js';
import { quotaRoutes } from './routes/quota.js';
import { billingRoutes } from './routes/billing.js';
import { documentRoutes } from './routes/documents.js';
import { authMiddleware } from './middleware/auth.js';
import { incRequest, renderPrometheus, addUploadBytes, addRequestBytes, addResponseBytes, incStatus, observeLatency } from './metrics.js';
import { sendError } from './error.js';
import { query } from './db.js';
import { randomUUID } from 'node:crypto';
import { stripeWebhookRoute } from './routes/stripeWebhook.js';
import { runMigrations } from './migrate.js';
import { startWorkers } from './queues.js';

loadEnv();

async function start() {
  // Ensure DB is migrated before serving
  try { await runMigrations(); } catch (e) { console.error('migrate failed', e); }
  try { startWorkers(); } catch (e) { console.error('queue workers failed', e); }
  // OpenTelemetry (guarded)
  let sdk: NodeSDK | null = null;
  if ((env.ENABLE_OTEL || '').toLowerCase() === 'true') {
    try {
      diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);
      sdk = new NodeSDK({
        serviceName: env.OTEL_SERVICE_NAME || 'arqivo-api',
        traceExporter: undefined, // use OTLP via env if configured
        instrumentations: [getNodeAutoInstrumentations()],
      });
      await sdk.start();
    } catch {}
  }
  const server = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
    bodyLimit: 100 * 1024 * 1024,
  });

  // Sentry (guarded)
  if (process.env.SENTRY_DSN) {
    Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1) });
    server.addHook('onError', async (_req, _reply, err) => {
      try {
        // scrub headers quickly
        const e = err as any;
        if (e && e.headers) {
          delete e.headers['authorization'];
          delete e.headers['cookie'];
        }
        Sentry.captureException(err);
      } catch {}
    });
  }

  await server.register(helmet);
  await server.register(cors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // allow curl, local tools
      if (env.WEB_ORIGIN && origin === env.WEB_ORIGIN) return cb(null, true);
      if (!env.WEB_ORIGIN && origin.startsWith('http://localhost')) return cb(null, true);
      return cb(new Error('CORS not allowed'), false);
    },
    credentials: true,
  });
  await server.register(rateLimit, {
    max: 1000,
    timeWindow: '1 minute',
    hook: 'onRequest',
    keyGenerator: (req) => `${(req as any).accountId || 'anon'}:${req.ip}`,
  });

  // Accept binary bodies for blob uploads; keep raw for Stripe webhook
  server.addContentTypeParser('*', { parseAs: 'buffer' }, (req, body: Buffer, done) => {
    if (req.url === '/webhooks/stripe') return done(null, body);
    done(null, body);
  });

  // Basic error handler
  server.setErrorHandler((err, req, reply) => {
    req.log.error(err);
    const status = (err as any).statusCode || 500;
    return sendError(reply, status, 'internal', (req.id as string));
  });

  // Request counter hook
  server.addHook('onRequest', async (req, _reply) => {
    incRequest(req.method, req.url);
  });
  // Request-id header & rate limiting
  const CAP = Number(process.env.RATE_CAPACITY ?? 100);
  const REFILL = Number(process.env.RATE_REFILL ?? 50);
  const BYTES_CAP = Number(process.env.BYTES_CAPACITY ?? 5_000_000);
  const BYTES_REFILL = Number(process.env.BYTES_REFILL_PER_SEC ?? 500_000);
  const redisUrl = env.REDIS_URL;
  let limiterReady = false;
  let redis: any = null;
  let scriptSha: string | null = null;
  const useMemoryLimiter = (process.env.USE_MEMORY_LIMITER || '').toLowerCase() === 'true';
  type Bucket = { t: number; tokens: number };
  const memoryBuckets = new Map<string, Bucket>();
  if (redisUrl) {
    import('redis').then(({ createClient }) => {
      redis = createClient({ url: redisUrl });
      redis.on('error', (e: any) => server.log.error(e));
      redis.connect().then(async () => {
        // token bucket LUA script: refill + take 1 token per request
        const lua = `
local key=ARGV[1]; local cap=tonumber(ARGV[2]); local refill=tonumber(ARGV[3]); local now=tonumber(ARGV[4]);
local bucket=redis.call('HMGET', key, 't','tokens'); local t=tonumber(bucket[1]) or now; local tokens=tonumber(bucket[2]) or cap;
tokens=math.min(cap, tokens + (now - t) * refill); t=now; if tokens < 1 then redis.call('HMSET', key,'t',t,'tokens',tokens); return {0, math.ceil((1 - tokens)/refill)} end
tokens=tokens-1; redis.call('HMSET', key,'t',t,'tokens',tokens); redis.call('EXPIRE', key, 60); return {1,0}`;
        scriptSha = await redis.scriptLoad(lua);
        limiterReady = true;
        server.log.info('Redis rate limiter ready');
      }).catch((e: any) => server.log.error(e));
    }).catch(() => {});
  }

  server.addHook('onRequest', async (req, reply) => {
    const rid = (req.headers['x-request-id'] as string) || randomUUID();
    reply.header('x-request-id', rid);
    const cl = Number(req.headers['content-length'] || 0);
    if (!Number.isNaN(cl)) addRequestBytes(cl);
    // Rate limit by account
    const acct = (req as any).accountId || 'anon';
    if (!useMemoryLimiter && redis && limiterReady && scriptSha) {
      const now = Math.floor(Date.now() / 1000);
      try {
        const key = `ratelimit:${acct}`;
        const [ok, retry] = await redis.evalSha(scriptSha, { keys: [], arguments: [key, String(CAP), String(REFILL), String(now)] });
        if (Number(ok) !== 1) {
          reply.header('Retry-After', String(retry || 1)).code(429).send({ ok: false, code: 'rate_limited', request_id: rid });
          return;
        }
      } catch (e) {
        req.log.warn({ err: e }, 'rate limiter degraded');
      }
    } else {
      const now = Date.now() / 1000;
      const b = memoryBuckets.get(acct) ?? { t: now, tokens: CAP };
      b.tokens = Math.min(CAP, b.tokens + (now - b.t) * REFILL);
      b.t = now;
      if (b.tokens < 1) {
        reply.header('Retry-After', '1').code(429).send({ ok: false, code: 'rate_limited', request_id: rid });
        return;
      }
      b.tokens -= 1;
      memoryBuckets.set(acct, b);
    }
    // Bytes-per-second token bucket (coarse)
    const bytesNow = Number(req.headers['content-length'] || 0);
    if (!Number.isNaN(bytesNow) && bytesNow > 0) {
      const key = `bytes:${acct}`;
      const meta = (server as any)._bytesMeta || ((server as any)._bytesMeta = new Map());
      const cur = meta.get(key) || { t: Date.now() / 1000, tokens: BYTES_CAP };
      const n = Date.now() / 1000;
      cur.tokens = Math.min(BYTES_CAP, cur.tokens + (n - cur.t) * BYTES_REFILL);
      cur.t = n;
      if (cur.tokens - bytesNow < 0) {
        reply.header('Retry-After', '1').code(429).send({ ok: false, code: 'rate_limited' });
        return;
      }
      cur.tokens -= bytesNow;
      meta.set(key, cur);
    }
  });
  // Audit log and metrics on response
  server.addHook('onResponse', async (req, reply) => {
    try {
      const bytes = Number(reply.getHeader('content-length') || 0);
      if (!Number.isNaN(bytes)) addResponseBytes(bytes);
      incStatus(reply.statusCode);
      // simple latency observation using start time metadata
      const start = (req as any)._startTime as number | undefined;
      if (typeof start === 'number') {
        const dur = (Date.now() - start) / 1000;
        observeLatency(req.method, req.url, dur);
      }
      await query('insert into audit_logs(account_id, method, path, status, bytes) values ($1,$2,$3,$4,$5)', [req.accountId || null, req.method, req.url, reply.statusCode, bytes]);
    } catch {}
  });

  // capture start time
  server.addHook('onRequest', (req, _reply, done) => {
    (req as any)._startTime = Date.now();
    done();
  });

  server.get('/health', async () => {
    return { ok: true, regionDefault: env.ACCOUNT_REGION_DEFAULT };
  });

  await authMiddleware(server);

  await server.register(async (app) => authRoutes(app));
  await server.register(async (app) => deviceRoutes(app));
  await server.register(async (app) => storageRoutes(app));
  await server.register(async (app) => metadataRoutes(app));
  await server.register(async (app) => indexRoutes(app));
  await server.register(async (app) => quotaRoutes(app));
  await server.register(async (app) => billingRoutes(app));
  await server.register(async (app) => documentRoutes(app));
  await server.register(async (app) => stripeWebhookRoute(app));

  server.get('/metrics', async (_req, _reply) => {
    return renderPrometheus();
  });

  const port = Number(env.PORT);
  const host = '0.0.0.0';

  server.listen({ port, host }).then((address) => {
    server.log.info(`API listening at ${address}`);
  }).catch((err) => {
    server.log.error(err);
    process.exit(1);
  });
}

start();
