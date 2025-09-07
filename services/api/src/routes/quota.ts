import type { FastifyInstance } from 'fastify';
import { query } from '../db.js';

export async function quotaRoutes(app: FastifyInstance) {
  app.get('/v1/quota', async (req) => {
    const accountId = req.accountId;
    if (!accountId) return { ok: true, byteCount: 0, docCount: 0 };
    const res = await query<{ byte_count: string; doc_count: string }>(
      'select byte_count, doc_count from quotas where account_id = $1',
      [accountId]
    );
    const row = res.rows[0] || { byte_count: '0', doc_count: '0' };
    return { ok: true, byteCount: Number(row.byte_count), docCount: Number(row.doc_count) };
  });
}

export async function addBytes(bytes: number, accountId: string) {
  await query(
    `insert into quotas(account_id, byte_count, doc_count) values ($1,$2,$3)
     on conflict (account_id) do update set byte_count = quotas.byte_count + EXCLUDED.byte_count`,
    [accountId, bytes, 0]
  );
}

export async function addDoc(accountId: string) {
  await query(
    `insert into quotas(account_id, byte_count, doc_count) values ($1,$2,$3)
     on conflict (account_id) do update set doc_count = quotas.doc_count + EXCLUDED.doc_count`,
    [accountId, 0, 1]
  );
}


