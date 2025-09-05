import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { config as loadEnv } from 'dotenv';
import { env } from './env.js';
import cors from '@fastify/cors';
import { authRoutes } from './routes/auth.js';
import { deviceRoutes } from './routes/devices.js';
import { storageRoutes } from './routes/storage.js';
import { metadataRoutes } from './routes/metadata.js';
import { indexRoutes } from './routes/indexShards.js';
import { quotaRoutes } from './routes/quota.js';
import { authMiddleware } from './middleware/auth.js';
import { incRequest, renderPrometheus, addUploadBytes } from './metrics.js';
import { sendError } from './error.js';
import { query } from './db.js';

loadEnv();

async function start() {
  const server = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    }
  });

  await server.register(helmet);
  await server.register(cors, {
    origin: true,
    credentials: true,
  });
  await server.register(rateLimit, {
    max: 1000,
    timeWindow: '1 minute',
  });

  // Accept binary bodies for blob uploads
  server.addContentTypeParser('*', { parseAs: 'buffer' }, (req, body: Buffer, done) => {
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
  // Audit log on response
  server.addHook('onResponse', async (req, reply) => {
    try {
      const bytes = Number(reply.getHeader('content-length') || 0);
      if (!Number.isNaN(bytes)) addUploadBytes(bytes);
      await query('insert into audit_logs(account_id, method, path, status, bytes) values ($1,$2,$3,$4,$5)', [req.accountId || null, req.method, req.url, reply.statusCode, bytes]);
    } catch {}
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
