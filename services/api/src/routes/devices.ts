import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { query } from '../db.js';
import { randomUUID } from 'node:crypto';

const registerBody = z.object({
  publicKey: z.string().min(1),
});

export async function deviceRoutes(app: FastifyInstance) {
  app.post('/v1/devices/register', async (req, reply) => {
    const parsed = registerBody.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ ok: false });
    }
    const accountId = req.accountId;
    if (!accountId) return reply.code(401).send({ ok: false });
    const deviceId = randomUUID();
    await query(
      'insert into devices(device_id, account_id, public_key) values ($1,$2,$3)',
      [deviceId, accountId, parsed.data.publicKey]
    );
    return { ok: true, deviceId };
  });
}


