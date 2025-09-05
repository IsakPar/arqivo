import type { FastifyInstance } from 'fastify';
import { verifyToken } from '@clerk/backend';
import { env } from '../env.js';

export async function authRoutes(app: FastifyInstance) {
  app.get('/auth/verify', async (req, reply) => {
    try {
      if (!env.CLERK_SECRET_KEY) {
        return reply.code(503).send({ ok: false, reason: 'auth-disabled' });
      }
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return reply.code(401).send({ ok: false });
      }
      const token = authHeader.slice('Bearer '.length);
      const payload = await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY });
      return { ok: true, sub: (payload as any).sub };
    } catch (err) {
      return reply.code(401).send({ ok: false });
    }
  });
}


