import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import { authMiddleware } from '../src/middleware/auth.js';
import { documentRoutes } from '../src/routes/documents.js';
import { storageRoutes } from '../src/routes/storage.js';
import { pool, query } from '../src/db.js';

async function makeServer() {
  const app = Fastify({ logger: false });
  await authMiddleware(app as any);
  await app.register(async (a) => documentRoutes(a as any));
  await app.register(async (a) => storageRoutes(a as any));
  return app;
}

describe('RLS', () => {
  let app: any;
  beforeAll(async () => {
    app = await makeServer();
    await query('delete from documents', []);
  });
  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it('isolates documents by account', async () => {
    // Seed doc for account A
    const a = await app.inject({ method: 'PUT', url: '/v1/blobs/abcd', headers: {}, body: Buffer.from('test') });
    expect(a.statusCode).toBe(200);

    // Simulate account switch by direct DB insert for account B
    const rows = await query<{ account_id: string }>('select account_id from accounts order by created_at desc limit 1');
    const other = rows.rows[0]?.account_id || null;
    if (other) {
      await query('insert into documents(doc_id, account_id, region_code, size_bytes) values ($1,$2,$3,$4) on conflict do nothing', ['efgh', other, 'us', 4]);
    }

    const list = await app.inject({ method: 'GET', url: '/v1/documents' });
    const data = list.json();
    expect(Array.isArray(data.documents)).toBe(true);
    // Should not include the foreign doc id if present
    const hasForeign = data.documents.some((d: any) => d.id === 'efgh');
    expect(hasForeign).toBe(false);
  });
});


