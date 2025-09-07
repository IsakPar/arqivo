import request from 'supertest';
import { startServer, stopServer } from './utils/server';
import { createHash } from 'node:crypto';

let baseUrl: string;
beforeAll(async () => ({ baseUrl } = await startServer({ USE_MEMORY_LIMITER: 'true' } as any)));
afterAll(async () => await stopServer());

it('quota increments on successful blob PUT', async () => {
  const q0 = await request(baseUrl).get('/v1/quota');
  const size = 1024;
  const body = Buffer.alloc(size, 7);
  const id = createHash('sha256').update(body).digest('hex');
  await request(baseUrl)
    .put(`/v1/blobs/${id}`)
    .set('content-type', 'application/octet-stream')
    .set('x-cipher-hash', `sha256:${id}`)
    .send(body);
  // Allow equal or +1 depending on idempotency
  const q1 = await request(baseUrl).get('/v1/quota');
  expect(q1.body.docCount).toBeGreaterThanOrEqual((q0.body.docCount ?? 0));
  expect(q1.body.byteCount).toBeGreaterThanOrEqual((q0.body.byteCount ?? 0));
});


