import request from 'supertest';
import { startServer, stopServer } from './utils/server';
import { createHash } from 'node:crypto';

let baseUrl: string;
beforeAll(async () => ({ baseUrl } = await startServer()));
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
  const q1 = await request(baseUrl).get('/v1/quota');
  expect(q1.body.docCount).toBeGreaterThanOrEqual((q0.body.docCount ?? 0) + 1);
  expect(q1.body.byteCount).toBeGreaterThanOrEqual((q0.body.byteCount ?? 0) + size);
});


